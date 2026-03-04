/**
 * API: مصروف واحد - GET / PUT / DELETE (soft)
 * الصلاحيات: canEditExpenses (تعديل) / canDeleteExpenses (حذف) / canViewExpenses (عرض)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAnyAccountingAuth,
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/accounting-auth';
import { updateExpenseSchema } from '@/lib/validations/accounting';
import { refreshMonthlySnapshot, getMonthKey } from '@/lib/accounting/snapshot';
import { checkMonthLock } from '@/lib/accounting/month-lock';
import { logAuditEvent, getClientIP, sanitizeForAudit, extractChanges } from '@/lib/accounting/audit';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/accounting/expenses/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewExpenses', 'canAddExpenses', 'canViewAllData',
  ]);
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const expense = await prisma.expense.findFirst({
    where: { id, deletedAt: null },
    include: {
      apartment: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!expense) return notFoundResponse('المصروف');

  return successResponse({ expense });
}

// PUT /api/accounting/expenses/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 20 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canEditExpenses');
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateExpenseSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const existing = await prisma.expense.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return notFoundResponse('المصروف');

  // 🔒 التحقق من قفل الشهر
  const lockCheck = await checkMonthLock(existing.apartmentId, existing.date);
  if (lockCheck.locked) return errorResponse(lockCheck.message!, 403);

  // تحضير بيانات التحديث
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.date) updateData.date = new Date(parsed.data.date);

  // 🔒 إذا تم تغيير التاريخ → تحقق من قفل الشهر الجديد أيضاً
  if (parsed.data.date) {
    const newLockCheck = await checkMonthLock(existing.apartmentId, new Date(parsed.data.date));
    if (newLockCheck.locked) return errorResponse(newLockCheck.message!, 403);
  }

  const expense = await prisma.expense.update({
    where: { id },
    data: updateData,
    include: {
      apartment: { select: { id: true, name: true } },
    },
  });

  // ⚡ تحديث MonthlySnapshot - للشهر القديم والجديد إذا تغير التاريخ
  const oldMonth = getMonthKey(existing.date);
  const newMonth = getMonthKey(expense.date);

  await refreshMonthlySnapshot(expense.apartmentId, newMonth);
  if (oldMonth !== newMonth) {
    await refreshMonthlySnapshot(existing.apartmentId, oldMonth);
  }

  // 📝 Audit Trail
  const { before: diffBefore, after: diffAfter } = extractChanges(
    sanitizeForAudit(existing as unknown as Record<string, unknown>),
    sanitizeForAudit(expense as unknown as Record<string, unknown>)
  );
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'UPDATE',
    entity: 'EXPENSE',
    entityId: id,
    before: diffBefore,
    after: diffAfter,
    metadata: { apartmentId: expense.apartmentId, apartmentName: expense.apartment.name, oldMonth, newMonth },
    ipAddress: getClientIP(request),
  });

  return successResponse({ expense });
}

// DELETE /api/accounting/expenses/[id] - Soft Delete 🔒
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canDeleteExpenses');
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const existing = await prisma.expense.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return notFoundResponse('المصروف');

  // 🔒 التحقق من قفل الشهر
  const lockCheck = await checkMonthLock(existing.apartmentId, existing.date);
  if (lockCheck.locked) return errorResponse(lockCheck.message!, 403);

  // 🔒 Soft Delete
  await prisma.expense.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // ⚡ تحديث MonthlySnapshot
  const month = getMonthKey(existing.date);
  await refreshMonthlySnapshot(existing.apartmentId, month);

  // 📝 Audit Trail
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  const deletedApartment = await prisma.apartment.findUnique({
    where: { id: existing.apartmentId },
    select: { name: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'DELETE',
    entity: 'EXPENSE',
    entityId: id,
    before: sanitizeForAudit(existing as unknown as Record<string, unknown>),
    metadata: { apartmentId: existing.apartmentId, apartmentName: deletedApartment?.name, month },
    ipAddress: getClientIP(request),
  });

  return successResponse({ message: 'تم حذف المصروف بنجاح' });
}
