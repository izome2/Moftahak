/**
 * API: اعتماد/رفض المصروفات - POST
 * الصلاحيات: canApproveExpenses (المدير العام فقط)
 * يُعتمد المصروف أو يُرفض مع سبب الرفض
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
import { refreshMonthlySnapshot, getMonthKey } from '@/lib/accounting/snapshot';
import { logAuditEvent, getClientIP, sanitizeForAudit } from '@/lib/accounting/audit';

type RouteParams = { params: Promise<{ id: string }> };

// POST /api/accounting/expenses/[id]/approve
// Body: { action: 'approve' | 'reject', rejectionReason?: string }
export async function POST(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canApproveExpenses');
  if (authResult.error) return authResult.error;

  const { id: expenseId } = await params;
  const body = await request.json();
  const { action, rejectionReason } = body as { action: string; rejectionReason?: string };

  if (!action || !['approve', 'reject'].includes(action)) {
    return errorResponse('يجب تحديد نوع الإجراء: approve أو reject');
  }

  // جلب المصروف
  const expense = await prisma.expense.findFirst({
    where: { id: expenseId, deletedAt: null },
    include: { apartment: { select: { id: true, name: true } } },
  });

  if (!expense) return notFoundResponse('المصروف');

  if (expense.approvalStatus !== 'PENDING') {
    return errorResponse('هذا المصروف تم البت فيه مسبقاً');
  }

  const before = sanitizeForAudit(expense as unknown as Record<string, unknown>);

  if (action === 'approve') {
    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        approvalStatus: 'APPROVED',
        approvedById: authResult.userId,
        approvedAt: new Date(),
      },
      include: { apartment: { select: { id: true, name: true } } },
    });

    // ⚡ تحديث MonthlySnapshot بعد الاعتماد
    const month = getMonthKey(updated.date);
    await refreshMonthlySnapshot(updated.apartmentId, month);

    // 📝 Audit Trail
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { firstName: true, lastName: true },
    });
    logAuditEvent({
      userId: authResult.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      action: 'UPDATE',
      entity: 'EXPENSE',
      entityId: expenseId,
      before,
      after: sanitizeForAudit(updated as unknown as Record<string, unknown>),
      metadata: { 
        apartmentId: updated.apartmentId,
        apartmentName: updated.apartment.name,
        approvalAction: 'approve',
      },
      ipAddress: getClientIP(request),
    });

    return successResponse({ expense: updated, message: 'تم اعتماد المصروف بنجاح' });
  } else {
    // رفض
    if (!rejectionReason?.trim()) {
      return errorResponse('يجب ذكر سبب الرفض');
    }

    const updated = await prisma.expense.update({
      where: { id: expenseId },
      data: {
        approvalStatus: 'REJECTED',
        approvedById: authResult.userId,
        approvedAt: new Date(),
        rejectionReason: rejectionReason.trim(),
      },
      include: { apartment: { select: { id: true, name: true } } },
    });

    // 📝 Audit Trail
    const user = await prisma.user.findUnique({
      where: { id: authResult.userId },
      select: { firstName: true, lastName: true },
    });
    logAuditEvent({
      userId: authResult.userId,
      userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
      action: 'UPDATE',
      entity: 'EXPENSE',
      entityId: expenseId,
      before,
      after: sanitizeForAudit(updated as unknown as Record<string, unknown>),
      metadata: { 
        apartmentId: updated.apartmentId,
        apartmentName: updated.apartment.name,
        approvalAction: 'reject',
        rejectionReason: rejectionReason.trim(),
      },
      ipAddress: getClientIP(request),
    });

    return successResponse({ expense: updated, message: 'تم رفض المصروف' });
  }
}
