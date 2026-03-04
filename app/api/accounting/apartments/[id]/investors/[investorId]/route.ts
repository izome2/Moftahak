/**
 * API: تعديل/حذف مستثمر من شقة - PUT / DELETE
 * الصلاحيات: canManageInvestors
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
import { updateApartmentInvestorSchema } from '@/lib/validations/accounting';
import { logAuditEvent, getClientIP, sanitizeForAudit, extractChanges } from '@/lib/accounting/audit';

type RouteParams = { params: Promise<{ id: string; investorId: string }> };

// PUT /api/accounting/apartments/[id]/investors/[investorId]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 20 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;

  const { id: apartmentId, investorId } = await params;
  const body = await request.json();
  const parsed = updateApartmentInvestorSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  // التحقق من وجود الاستثمار
  const existing = await prisma.apartmentInvestor.findFirst({
    where: { id: investorId, apartmentId },
  });
  if (!existing) return notFoundResponse('الاستثمار');

  // التحقق من إجمالي النسب إذا تم تغيير النسبة
  if (parsed.data.percentage !== undefined) {
    const others = await prisma.apartmentInvestor.findMany({
      where: { apartmentId, id: { not: investorId } },
      select: { percentage: true },
    });
    const otherTotal = others.reduce((sum, inv) => sum + inv.percentage, 0);
    if (otherTotal + parsed.data.percentage > 1.001) {
      return errorResponse(
        `إجمالي النسب سيتجاوز 100%. الحد المتاح: ${((1 - otherTotal) * 100).toFixed(1)}%`,
        400,
      );
    }
  }

  const updated = await prisma.apartmentInvestor.update({
    where: { id: investorId },
    data: parsed.data,
    include: {
      user: {
        select: { id: true, firstName: true, lastName: true, email: true },
      },
      apartment: { select: { id: true, name: true } },
    },
  });

  // 📝 Audit Trail
  const { before: diffBefore, after: diffAfter } = extractChanges(
    sanitizeForAudit(existing as unknown as Record<string, unknown>),
    sanitizeForAudit(updated as unknown as Record<string, unknown>)
  );
  const authUser = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Unknown',
    action: 'UPDATE',
    entity: 'INVESTOR',
    entityId: investorId,
    before: diffBefore,
    after: diffAfter,
    metadata: {
      apartmentId,
      apartmentName: updated.apartment.name,
      investorName: updated.user ? `${updated.user.firstName} ${updated.user.lastName}` : undefined,
    },
    ipAddress: getClientIP(request),
  });

  return successResponse({ investor: updated });
}

// DELETE /api/accounting/apartments/[id]/investors/[investorId]
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageInvestors');
  if (authResult.error) return authResult.error;

  const { id: apartmentId, investorId } = await params;

  const existing = await prisma.apartmentInvestor.findFirst({
    where: { id: investorId, apartmentId },
    include: { _count: { select: { withdrawals: true } } },
  });
  if (!existing) return notFoundResponse('الاستثمار');

  // تحذير: إذا كان هناك مسحوبات مسجلة
  if (existing._count.withdrawals > 0) {
    return errorResponse(
      `لا يمكن حذف هذا الاستثمار لأن هناك ${existing._count.withdrawals} عملية مسحوبات مرتبطة به. احذف المسحوبات أولاً.`,
      400,
    );
  }

  await prisma.apartmentInvestor.delete({
    where: { id: investorId },
  });

  // 📝 Audit Trail
  const authUser = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  const deletedInvestorUser = await prisma.user.findUnique({
    where: { id: existing.userId },
    select: { firstName: true, lastName: true },
  });
  const deletedInvestorApt = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { name: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: authUser ? `${authUser.firstName} ${authUser.lastName}` : 'Unknown',
    action: 'DELETE',
    entity: 'INVESTOR',
    entityId: investorId,
    before: sanitizeForAudit(existing as unknown as Record<string, unknown>),
    metadata: {
      apartmentId,
      apartmentName: deletedInvestorApt?.name,
      investorName: deletedInvestorUser ? `${deletedInvestorUser.firstName} ${deletedInvestorUser.lastName}` : undefined,
    },
    ipAddress: getClientIP(request),
  });

  return successResponse({ message: 'تم إزالة المستثمر من الشقة بنجاح' });
}
