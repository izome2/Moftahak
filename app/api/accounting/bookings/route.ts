/**
 * API: الحجوزات - GET (list with filters) / POST (create)
 * الصلاحيات: canAddBookings/canViewBookings/canViewAllData
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
import { createBookingSchema } from '@/lib/validations/accounting';
import { refreshMonthlySnapshot, getMonthKey } from '@/lib/accounting/snapshot';
import { checkMonthLock } from '@/lib/accounting/month-lock';
import { logAuditEvent, getClientIP, sanitizeForAudit } from '@/lib/accounting/audit';

// GET /api/accounting/bookings?apartmentId=...&month=YYYY-MM&source=...
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewBookings', 'canAddBookings', 'canViewAllData',
  ]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const apartmentId = searchParams.get('apartmentId');
  const month = searchParams.get('month');   // YYYY-MM
  const source = searchParams.get('source');
  const status = searchParams.get('status');

  // ⚡ الفلترة بالشهر إلزامية للأداء
  const where: Record<string, unknown> = { deletedAt: null };

  if (apartmentId) where.apartmentId = apartmentId;
  if (source) where.source = source;
  if (status) where.status = status;

  if (month) {
    const [year, m] = month.split('-').map(Number);
    where.checkIn = {
      gte: new Date(year, m - 1, 1),
      lt: new Date(year, m, 1),
    };
  }

  const bookings = await prisma.booking.findMany({
    where,
    include: {
      apartment: { select: { id: true, name: true } },
      createdBy: { select: { id: true, firstName: true, lastName: true } },
    },
    orderBy: { checkIn: 'desc' },
  });

  // ⚡ إجمالي عبر DB Aggregation (لا .reduce)
  const totals = await prisma.booking.aggregate({
    _sum: { amount: true, nights: true },
    _count: true,
    where,
  });

  return successResponse({
    bookings,
    totals: {
      count: totals._count,
      amount: totals._sum.amount || 0,
      nights: totals._sum.nights || 0,
    },
  });
}

// POST /api/accounting/bookings
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 20 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canAddBookings');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = createBookingSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  // التحقق من وجود الشقة
  const apartment = await prisma.apartment.findUnique({
    where: { id: parsed.data.apartmentId },
  });
  if (!apartment) return errorResponse('الشقة غير موجودة', 404);

  // 🔒 التحقق من قفل الشهر
  const lockCheck = await checkMonthLock(parsed.data.apartmentId, new Date(parsed.data.checkIn));
  if (lockCheck.locked) return errorResponse(lockCheck.message!, 403);

  const booking = await prisma.booking.create({
    data: {
      apartmentId: parsed.data.apartmentId,
      clientName: parsed.data.clientName,
      clientPhone: parsed.data.clientPhone,
      checkIn: new Date(parsed.data.checkIn),
      checkOut: new Date(parsed.data.checkOut),
      nights: parsed.data.nights,
      amount: parsed.data.amount,
      currency: parsed.data.currency ?? 'USD',
      source: parsed.data.source,
      arrivalTime: parsed.data.arrivalTime,
      flightNumber: parsed.data.flightNumber,
      notes: parsed.data.notes,
      receptionSupervisor: parsed.data.receptionSupervisor,
      deliverySupervisor: parsed.data.deliverySupervisor,
      status: parsed.data.status ?? 'CONFIRMED',
      createdById: authResult.userId,
    },
    include: {
      apartment: { select: { id: true, name: true } },
    },
  });

  // ⚡ تحديث MonthlySnapshot
  const month = getMonthKey(booking.checkIn);
  await refreshMonthlySnapshot(booking.apartmentId, month);

  // 📝 Audit Trail
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  logAuditEvent({
    userId: authResult.userId,
    userName: user ? `${user.firstName} ${user.lastName}` : 'Unknown',
    action: 'CREATE',
    entity: 'BOOKING',
    entityId: booking.id,
    after: sanitizeForAudit(booking as unknown as Record<string, unknown>),
    metadata: { apartmentId: booking.apartmentId, apartmentName: booking.apartment.name, month },
    ipAddress: getClientIP(request),
  });

  return successResponse({ booking }, 201);
}
