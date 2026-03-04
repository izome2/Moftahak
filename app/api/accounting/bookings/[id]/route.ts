/**
 * API: حجز واحد - GET / PUT / DELETE (soft)
 * الصلاحيات: canEditBookings (تعديل) / canDeleteBookings (حذف) / canViewBookings (عرض)
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
import { updateBookingSchema } from '@/lib/validations/accounting';
import { refreshMonthlySnapshot, getMonthKey } from '@/lib/accounting/snapshot';
import { checkMonthLock } from '@/lib/accounting/month-lock';
import { logAuditEvent, getClientIP, sanitizeForAudit, extractChanges } from '@/lib/accounting/audit';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/accounting/bookings/[id]
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewBookings', 'canAddBookings', 'canViewAllData',
  ]);
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const booking = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
    include: {
      apartment: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
  });

  if (!booking) return notFoundResponse('الحجز');

  return successResponse({ booking });
}

// PUT /api/accounting/bookings/[id]
export async function PUT(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 20 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canEditBookings');
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();
  const parsed = updateBookingSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const existing = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return notFoundResponse('الحجز');

  // 🔒 التحقق من قفل الشهر (الشهر الأصلي)
  const lockCheck = await checkMonthLock(existing.apartmentId, existing.checkIn);
  if (lockCheck.locked) return errorResponse(lockCheck.message!, 403);

  // تحضير بيانات التحديث
  const updateData: Record<string, unknown> = { ...parsed.data };
  if (parsed.data.checkIn) updateData.checkIn = new Date(parsed.data.checkIn);
  if (parsed.data.checkOut) updateData.checkOut = new Date(parsed.data.checkOut);

  // 🔒 إذا تم تغيير تاريخ الدخول → تحقق من قفل الشهر الجديد أيضاً
  if (parsed.data.checkIn) {
    const newLockCheck = await checkMonthLock(existing.apartmentId, new Date(parsed.data.checkIn));
    if (newLockCheck.locked) return errorResponse(newLockCheck.message!, 403);
  }

  const booking = await prisma.booking.update({
    where: { id },
    data: updateData,
    include: {
      apartment: { select: { id: true, name: true } },
    },
  });

  // ⚡ تحديث MonthlySnapshot - للشهر القديم والجديد إذا تغير التاريخ
  const oldMonth = getMonthKey(existing.checkIn);
  const newMonth = getMonthKey(booking.checkIn);

  await refreshMonthlySnapshot(booking.apartmentId, newMonth);
  if (oldMonth !== newMonth) {
    await refreshMonthlySnapshot(existing.apartmentId, oldMonth);
  }

  // 📝 Audit Trail
  const { before: diffBefore, after: diffAfter } = extractChanges(
    sanitizeForAudit(existing as unknown as Record<string, unknown>),
    sanitizeForAudit(booking as unknown as Record<string, unknown>)
  );
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'UPDATE',
    entity: 'BOOKING',
    entityId: id,
    before: diffBefore,
    after: diffAfter,
    metadata: { apartmentId: booking.apartmentId, apartmentName: booking.apartment.name, oldMonth, newMonth },
    ipAddress: getClientIP(request),
  });

  return successResponse({ booking });
}

// PATCH /api/accounting/bookings/[id] - تحديث المشرف فقط
export async function PATCH(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 30 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canAssignSupervisor');
  if (authResult.error) return authResult.error;

  const { id } = await params;
  const body = await request.json();

  // فقط الحقول المسموح بها
  const allowed: Record<string, string> = {};
  if (typeof body.receptionSupervisor === 'string') {
    allowed.receptionSupervisor = body.receptionSupervisor.trim();
  }
  if (typeof body.deliverySupervisor === 'string') {
    allowed.deliverySupervisor = body.deliverySupervisor.trim();
  }

  if (Object.keys(allowed).length === 0) {
    return errorResponse('لم يتم إرسال بيانات صالحة للتحديث');
  }

  const existing = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return notFoundResponse('الحجز');

  const booking = await prisma.booking.update({
    where: { id },
    data: allowed,
    include: {
      apartment: { select: { id: true, name: true } },
    },
  });

  return successResponse({ booking });
}

// DELETE /api/accounting/bookings/[id] - Soft Delete 🔒
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canDeleteBookings');
  if (authResult.error) return authResult.error;

  const { id } = await params;

  const existing = await prisma.booking.findFirst({
    where: { id, deletedAt: null },
  });
  if (!existing) return notFoundResponse('الحجز');

  // 🔒 التحقق من قفل الشهر
  const lockCheck = await checkMonthLock(existing.apartmentId, existing.checkIn);
  if (lockCheck.locked) return errorResponse(lockCheck.message!, 403);

  // 🔒 Soft Delete
  await prisma.booking.update({
    where: { id },
    data: { deletedAt: new Date() },
  });

  // ⚡ تحديث MonthlySnapshot
  const month = getMonthKey(existing.checkIn);
  await refreshMonthlySnapshot(existing.apartmentId, month);

  // 📝 Audit Trail
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  const deletedBookingApt = await prisma.apartment.findUnique({
    where: { id: existing.apartmentId },
    select: { name: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'DELETE',
    entity: 'BOOKING',
    entityId: id,
    before: sanitizeForAudit(existing as unknown as Record<string, unknown>),
    metadata: { apartmentId: existing.apartmentId, apartmentName: deletedBookingApt?.name, month },
    ipAddress: getClientIP(request),
  });

  return successResponse({ message: 'تم حذف الحجز بنجاح' });
}
