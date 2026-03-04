/**
 * API: مستثمرو الشقة - GET (list) / POST (add investor)
 * الصلاحيات: canManageInvestors (إضافة) / canViewAllData (عرض)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/accounting-auth';
import { addApartmentInvestorSchema } from '@/lib/validations/accounting';
import { logAuditEvent, getClientIP, sanitizeForAudit } from '@/lib/accounting/audit';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/accounting/apartments/[id]/investors
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;

  const { id: apartmentId } = await params;

  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true, name: true },
  });
  if (!apartment) return notFoundResponse('الشقة');

  const investors = await prisma.apartmentInvestor.findMany({
    where: { apartmentId },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true, phone: true },
      },
      _count: { select: { withdrawals: true } },
    },
    orderBy: { createdAt: 'asc' },
  });

  // حساب إجمالي النسب للتحقق
  const totalPercentage = investors.reduce((sum, inv) => sum + inv.percentage, 0);

  return successResponse({ investors, totalPercentage });
}

// POST /api/accounting/apartments/[id]/investors
export async function POST(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;

  const { id: apartmentId } = await params;
  const body = await request.json();
  const parsed = addApartmentInvestorSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  // التحقق من وجود الشقة
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
  });
  if (!apartment) return notFoundResponse('الشقة');

  // التحقق من وجود المستخدم (المستثمر)
  const user = await prisma.user.findUnique({
    where: { id: parsed.data.userId },
  });
  if (!user) return errorResponse('المستثمر غير موجود', 404);

  // التحقق من عدم تكرار المستثمر في نفس الشقة
  const existing = await prisma.apartmentInvestor.findUnique({
    where: {
      apartmentId_userId: { apartmentId, userId: parsed.data.userId },
    },
  });
  if (existing) return errorResponse('هذا المستثمر مضاف بالفعل لهذه الشقة', 409);

  // التحقق من أن إجمالي النسب لا يتجاوز 100%
  const currentInvestors = await prisma.apartmentInvestor.findMany({
    where: { apartmentId },
    select: { percentage: true },
  });
  const totalPercentage = currentInvestors.reduce((sum, inv) => sum + inv.percentage, 0);
  if (totalPercentage + parsed.data.percentage > 1.001) { // tolerance for floating point
    return errorResponse(
      `إجمالي النسب سيتجاوز 100%. الحد المتاح: ${((1 - totalPercentage) * 100).toFixed(1)}%`,
      400,
    );
  }

  const investor = await prisma.apartmentInvestor.create({
    data: {
      apartmentId,
      userId: parsed.data.userId,
      percentage: parsed.data.percentage,
      investmentTarget: parsed.data.investmentTarget,
    },
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
    },
  });

  // 📝 Audit Trail
  const authUser = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Unknown',
    action: 'CREATE',
    entity: 'INVESTOR',
    entityId: investor.id,
    after: sanitizeForAudit(investor as unknown as Record<string, unknown>),
    metadata: {
      apartmentId,
      apartmentName: apartment.name,
      investorUserId: parsed.data.userId,
      investorName: investor.user ? `${investor.user.firstName} ${investor.user.lastName}` : undefined,
      percentage: parsed.data.percentage,
    },
    ipAddress: getClientIP(request),
  });

  return successResponse({ investor }, 201);
}
