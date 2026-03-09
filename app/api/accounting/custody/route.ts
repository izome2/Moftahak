/**
 * API: العهدة - GET (list) / POST (create)
 * العهدة = المبلغ الذي يستلمه مدير التشغيل للصرف منها خلال الشهر
 * الصلاحيات: canViewCustody (عرض) / canManageCustody (إنشاء)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  requireAnyAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { getEffectiveAccountingRole } from '@/lib/permissions';
import { getAssignedApartmentIds } from '@/lib/accounting/ops-manager';
import { logAuditEvent, getClientIP, sanitizeForAudit } from '@/lib/accounting/audit';

// GET /api/accounting/custody?month=YYYY-MM&managerId=...&apartmentId=...
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth(['canViewCustody', 'canManageCustody']);
  if (authResult.error) return authResult.error;

  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month');
    const managerId = searchParams.get('managerId');
    const apartmentId = searchParams.get('apartmentId');

    const where: Record<string, unknown> = {};
    if (month) where.month = month;
    if (managerId) where.managerId = managerId;
    if (apartmentId) where.apartmentId = apartmentId;

    // مدير التشغيل يرى عهدته فقط
    const effectiveRole = getEffectiveAccountingRole(authResult.role);
    if (effectiveRole === 'OPS_MANAGER') {
      where.managerId = authResult.userId;
      // تقييد بالشقق المعينة
      const assignedIds = await getAssignedApartmentIds(authResult.userId);
      if (assignedIds.length > 0 && !apartmentId) {
        where.apartmentId = { in: assignedIds };
      }
    }

    const custodyRecords = await prisma.custody.findMany({
      where,
      include: {
        manager: { select: { id: true, firstName: true, lastName: true } },
        apartment: { select: { id: true, name: true } },
      },
      orderBy: [{ month: 'desc' }, { createdAt: 'desc' }],
    });

    // حساب المصروف الفعلي المعتمد لكل عهدة
    const enriched = await Promise.all(
      custodyRecords.map(async (custody) => {
        const [year, m] = custody.month.split('-').map(Number);
        const approvedExpensesTotal = await prisma.expense.aggregate({
          _sum: { amount: true },
          where: {
            apartmentId: custody.apartmentId,
            createdById: custody.managerId,
            approvalStatus: 'APPROVED',
            deletedAt: null,
            date: {
              gte: new Date(year, m - 1, 1),
              lt: new Date(year, m, 1),
            },
          },
        });

        const spent = approvedExpensesTotal._sum?.amount || 0;
        const remaining = custody.amount - spent;

        return {
          ...custody,
          spent,
          remaining,
        };
      })
    );

    return successResponse({ records: enriched });
  } catch (error) {
    console.error('Error fetching custody records:', error);
    return errorResponse('حدث خطأ في تحميل العهدة', 500);
  }
}

// POST /api/accounting/custody
// Body: { managerId, apartmentId, month, amount, currency?, notes? }
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageCustody');
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const { managerId, apartmentId, month, amount, currency, notes } = body as {
      managerId: string;
      apartmentId: string;
      month: string;
      amount: number;
      currency?: string;
      notes?: string;
    };

    // التحقق من البيانات المطلوبة
    if (!managerId || !apartmentId || !month || !amount) {
      return errorResponse('يجب ملء جميع الحقول المطلوبة');
    }

    if (amount <= 0) {
      return errorResponse('مبلغ العهدة يجب أن يكون أكبر من صفر');
    }

    // التحقق من صيغة الشهر
    if (!/^\d{4}-\d{2}$/.test(month)) {
      return errorResponse('صيغة الشهر غير صحيحة (YYYY-MM)');
    }

    // التحقق من وجود المدير والشقة
    const [manager, apartment] = await Promise.all([
      prisma.user.findUnique({ where: { id: managerId }, select: { id: true, role: true, firstName: true, lastName: true } }),
      prisma.apartment.findUnique({ where: { id: apartmentId }, select: { id: true, name: true } }),
    ]);

    if (!manager) return errorResponse('المستخدم غير موجود', 404);
    if (manager.role !== 'OPS_MANAGER') return errorResponse('المستخدم ليس مدير تشغيل');
    if (!apartment) return errorResponse('الشقة غير موجودة', 404);

    // التحقق من عدم وجود عهدة مكررة
    const existing = await prisma.custody.findUnique({
      where: { managerId_apartmentId_month: { managerId, apartmentId, month } },
    });

    if (existing) {
      return errorResponse('يوجد عهدة مسجلة بالفعل لهذا المدير في هذه الشقة لهذا الشهر');
    }

  const custody = await prisma.custody.create({
    data: {
      managerId,
      apartmentId,
      month,
      amount,
      currency: currency || 'USD',
      remaining: amount,
      notes: notes || null,
    },
    include: {
      manager: { select: { id: true, firstName: true, lastName: true } },
      apartment: { select: { id: true, name: true } },
    },
  });

  // 📝 Audit Trail
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'CREATE',
    entity: 'CUSTODY',
    entityId: custody.id,
    after: sanitizeForAudit(custody as unknown as Record<string, unknown>),
    metadata: { managerId, apartmentId, month, amount },
    ipAddress: getClientIP(request),
  });

    return successResponse({ custody }, 201);
  } catch (error) {
    console.error('Error creating custody:', error);
    return errorResponse('حدث خطأ في إنشاء العهدة', 500);
  }
}
