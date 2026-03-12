/**
 * API: المصروفات - GET (list with filters) / POST (create)
 * الصلاحيات: canAddExpenses/canViewExpenses/canViewAllData
 * ⚡ الفلترة بالشهر إلزامية للأداء
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAnyAccountingAuth,
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { createExpenseSchema } from '@/lib/validations/accounting';
import { refreshMonthlySnapshot, getMonthKey } from '@/lib/accounting/snapshot';
import { checkMonthLock } from '@/lib/accounting/month-lock';
import { logAuditEvent, getClientIP, sanitizeForAudit } from '@/lib/accounting/audit';
import { getEffectiveAccountingRole } from '@/lib/permissions';
import { getAssignedApartmentIds } from '@/lib/accounting/ops-manager';

// GET /api/accounting/expenses?apartmentId=...&month=YYYY-MM&category=...
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewExpenses', 'canAddExpenses', 'canViewAllData',
  ]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const apartmentId = searchParams.get('apartmentId');
  const month = searchParams.get('month');     // YYYY-MM
  const category = searchParams.get('category');

  const where: Record<string, unknown> = { deletedAt: null };

  if (apartmentId) where.apartmentId = apartmentId;
  if (category) where.category = category;

  // فلترة حسب حالة الاعتماد (مثلاً: approvalStatus=APPROVED لصفحة الشقة)
  const approvalStatus = searchParams.get('approvalStatus');
  if (approvalStatus) where.approvalStatus = approvalStatus;

  if (month) {
    const [year, m] = month.split('-').map(Number);
    where.date = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    };
  }

  // 🔒 مدير التشغيل يرى مصروفاته فقط + الشقق المعينة له فقط
  const effectiveRole = getEffectiveAccountingRole(authResult.role);
  if (effectiveRole === 'OPS_MANAGER') {
    where.createdById = authResult.userId;
    // تقييد بالشقق المعينة
    const assignedIds = await getAssignedApartmentIds(authResult.userId);
    if (assignedIds.length > 0 && !apartmentId) {
      where.apartmentId = { in: assignedIds };
    }
  }

  const expenses = await prisma.expense.findMany({
    where,
    include: {
      apartment: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { date: 'desc' },
  });

  // ⚡ إجمالي عبر DB Aggregation
  const totals = await prisma.expense.aggregate({
    _sum: { amount: true },
    _count: true,
    where,
  });

  // تقسيم حسب القسم
  const byCategory = await prisma.expense.groupBy({
    by: ['category'],
    _sum: { amount: true },
    _count: true,
    where,
  });

  return successResponse({
    expenses,
    totals: {
      count: totals._count,
      amount: totals._sum.amount || 0,
    },
    byCategory: Object.fromEntries(
      byCategory.map(g => [g.category, { amount: g._sum.amount || 0, count: g._count }])
    ),
  });
}

// POST /api/accounting/expenses
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 20 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canAddExpenses');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  // التحقق من وجود الشقة
  const apartment = await prisma.apartment.findUnique({
    where: { id: parsed.data.apartmentId },
  });
  if (!apartment) return errorResponse('الشقة غير موجودة', 404);

  // 🔒 مدير التشغيل يضيف مصروفات فقط للشقق المعينة له
  const effectiveRole = getEffectiveAccountingRole(authResult.role);
  if (effectiveRole === 'OPS_MANAGER') {
    const assignedIds = await getAssignedApartmentIds(authResult.userId);
    if (assignedIds.length > 0 && !assignedIds.includes(parsed.data.apartmentId)) {
      return errorResponse('لا يمكنك إضافة مصروفات لشقة غير معينة لك', 403);
    }
  }

  // 🔒 التحقق من قفل الشهر
  const lockCheck = await checkMonthLock(parsed.data.apartmentId, new Date(parsed.data.date));
  if (lockCheck.locked) return errorResponse(lockCheck.message!, 403);

  // تحديد حالة الاعتماد: المدير العام → معتمد تلقائياً، غيره → في الانتظار
  const isAutoApproved = effectiveRole === 'GENERAL_MANAGER';

  const expense = await prisma.expense.create({
    data: {
      apartmentId: parsed.data.apartmentId,
      description: parsed.data.description,
      category: parsed.data.category,
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? 'USD',
      date: new Date(parsed.data.date),
      notes: parsed.data.notes,
      createdById: authResult.userId,
      approvalStatus: isAutoApproved ? 'APPROVED' : 'PENDING',
      approvedById: isAutoApproved ? authResult.userId : undefined,
      approvedAt: isAutoApproved ? new Date() : undefined,
    },
    include: {
      apartment: { select: { id: true, name: true } },
    },
  });

  // ⚡ تحديث MonthlySnapshot فقط للمصروفات المعتمدة
  const expenseMonth = getMonthKey(expense.date);
  if (isAutoApproved) {
    await refreshMonthlySnapshot(expense.apartmentId, expenseMonth);
  }

  // 📝 Audit Trail
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'CREATE',
    entity: 'EXPENSE',
    entityId: expense.id,
    after: sanitizeForAudit(expense as unknown as Record<string, unknown>),
    metadata: { apartmentId: expense.apartmentId, apartmentName: expense.apartment.name, month: expenseMonth },
    ipAddress: getClientIP(request),
  });

  return successResponse({ expense }, 201);
}
