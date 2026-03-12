/**
 * API: مسحوبات المستثمر - GET (list) / POST (create)
 * الصلاحيات: canManageInvestors (إضافة) || (INVESTOR يرى مسحوباته فقط)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingSession,
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/accounting-auth';
import { hasPermission } from '@/lib/permissions';
import { createWithdrawalSchema } from '@/lib/validations/accounting';
import { logAuditEvent, getClientIP, sanitizeForAudit } from '@/lib/accounting/audit';

type RouteParams = { params: Promise<{ userId: string }> };

// GET /api/accounting/investors/[userId]/withdrawals?apartmentId=...
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const { userId } = await params;

  // 🔒 المستثمر يرى مسحوباته فقط
  if (authResult.role === 'INVESTOR' && authResult.userId !== userId) {
    return errorResponse('ليس لديك صلاحية لعرض مسحوبات مستثمر آخر', 403);
  }

  if (authResult.role !== 'INVESTOR' && !hasPermission(authResult.role, 'canManageInvestors')) {
    return errorResponse('ليس لديك الصلاحية المطلوبة', 403);
  }

  const { searchParams } = new URL(request.url);
  const apartmentId = searchParams.get('apartmentId');

  // جلب الاستثمارات
  const investmentWhere: Record<string, unknown> = { userId };
  if (apartmentId) investmentWhere.apartmentId = apartmentId;

  const investments = await prisma.apartmentInvestor.findMany({
    where: investmentWhere,
    select: { id: true },
  });

  const investmentIds = investments.map(i => i.id);

  if (investmentIds.length === 0) {
    return successResponse({ withdrawals: [], total: 0 });
  }

  const withdrawals = await prisma.withdrawal.findMany({
    where: {
      apartmentInvestorId: { in: investmentIds },
      deletedAt: null,
    },
    include: {
      apartmentInvestor: {
        include: {
          apartment: { select: { id: true, name: true } },
        },
      },
    },
    orderBy: { date: 'desc' },
  });

  // ⚡ إجمالي عبر DB Aggregation
  const total = await prisma.withdrawal.aggregate({
    _sum: { amount: true },
    where: {
      apartmentInvestorId: { in: investmentIds },
      deletedAt: null,
    },
  });

  return successResponse({
    withdrawals,
    total: total._sum.amount || 0,
  });
}

// POST /api/accounting/investors/[userId]/withdrawals
export async function POST(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;

  const { userId } = await params;
  const body = await request.json();

  // توقع apartmentInvestorId مع بيانات السحب
  const { apartmentInvestorId, ...withdrawalData } = body;
  if (!apartmentInvestorId) {
    return errorResponse('معرف الاستثمار مطلوب (apartmentInvestorId)', 400);
  }

  const parsed = createWithdrawalSchema.safeParse(withdrawalData);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  // التحقق من أن الاستثمار يخص هذا المستثمر
  const investment = await prisma.apartmentInvestor.findFirst({
    where: { id: apartmentInvestorId, userId },
    include: {
      apartment: { select: { id: true, name: true } },
    },
  });
  if (!investment) return notFoundResponse('الاستثمار');

  // 🔒 حساب رصيد المستثمر الإجمالي عبر كل الشقق (وليس شقة واحدة)
  // جلب كل استثمارات المستثمر
  const allInvestments = await prisma.apartmentInvestor.findMany({
    where: { userId },
    select: { id: true, apartmentId: true, percentage: true },
  });

  const allInvestmentIds = allInvestments.map(i => i.id);

  // حساب إجمالي الأرباح عبر كل الشقق + إجمالي المسحوبات
  const [allSnapshots, allInvestorSnapshots, allExistingWithdrawals] = await Promise.all([
    prisma.monthlySnapshot.findMany({
      where: { apartmentId: { in: allInvestments.map(i => i.apartmentId) } },
      select: { apartmentId: true, month: true, profit: true, isLocked: true },
    }),
    prisma.monthlyInvestorSnapshot.findMany({
      where: { apartmentInvestorId: { in: allInvestmentIds } },
      select: { apartmentInvestorId: true, month: true, percentage: true },
    }),
    prisma.withdrawal.aggregate({
      _sum: { amount: true },
      where: { apartmentInvestorId: { in: allInvestmentIds }, deletedAt: null },
    }),
  ]);

  // خريطة النسب التاريخية لكل استثمار
  const historicalPctMap = new Map<string, Map<string, number>>();
  for (const s of allInvestorSnapshots) {
    if (!historicalPctMap.has(s.apartmentInvestorId)) {
      historicalPctMap.set(s.apartmentInvestorId, new Map());
    }
    historicalPctMap.get(s.apartmentInvestorId)!.set(s.month, s.percentage);
  }

  // خريطة الاستثمارات
  const investmentMap = new Map(allInvestments.map(i => [i.apartmentId, i]));

  let totalInvestorProfit = 0;
  for (const snap of allSnapshots) {
    const inv = investmentMap.get(snap.apartmentId);
    if (!inv) continue;
    const pctMap = historicalPctMap.get(inv.id);
    const pct = snap.isLocked
      ? (pctMap?.get(snap.month) ?? inv.percentage)
      : inv.percentage;
    totalInvestorProfit += snap.profit * pct;
  }

  const totalWithdrawn = allExistingWithdrawals._sum.amount || 0;
  const currentBalance = totalInvestorProfit - totalWithdrawn;

  // ✅ يُسمح بالاستلاف (السحب أكثر من الرصيد المتاح) - الرصيد يصبح سالباً (سلفة/رصيد مدين)

  const withdrawal = await prisma.withdrawal.create({
    data: {
      apartmentInvestorId,
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? 'USD',
      date: new Date(parsed.data.date),
      comments: parsed.data.comments,
    },
    include: {
      apartmentInvestor: {
        include: {
          apartment: { select: { id: true, name: true } },
        },
      },
    },
  });

  // 📝 Audit Trail
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  // اسم المستثمر (صاحب السحب)
  const investorUser = await prisma.user.findUnique({
    where: { id: userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'WITHDRAWAL',
    entity: 'WITHDRAWAL',
    entityId: withdrawal.id,
    after: sanitizeForAudit(withdrawal as unknown as Record<string, unknown>),
    metadata: {
      investorUserId: userId,
      investorName: investorUser ? `${investorUser.firstName} ${investorUser.lastName}` : undefined,
      apartmentInvestorId,
      apartmentId: investment.apartmentId,
      apartmentName: investment.apartment.name,
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? 'USD',
      balanceBefore: currentBalance,
      balanceAfter: currentBalance - parsed.data.amount,
    },
    ipAddress: getClientIP(request),
  });

  return successResponse({ withdrawal }, 201);
}
