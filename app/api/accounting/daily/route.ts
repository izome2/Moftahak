/**
 * API: جدول المتابعة اليومية - GET
 * يجلب الحجوزات التي فيها دخول أو خروج اليوم (أو الغد بعد الساعة 7 مساءً)
 * الصلاحيات: canViewDailyOps / canViewAllData
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAnyAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
} from '@/lib/accounting-auth';

// GET /api/accounting/daily?date=YYYY-MM-DD
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewDailyOps', 'canViewAllData',
  ]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const dateParam = searchParams.get('date'); // YYYY-MM-DD (اختياري)

  let targetDate: Date;

  if (dateParam) {
    targetDate = new Date(dateParam);
  } else {
    const now = new Date();
    const hour = now.getHours();
    // بعد الساعة 7 مساءً → عرض بيانات اليوم التالي
    targetDate = hour >= 19
      ? new Date(now.getTime() + 24 * 60 * 60 * 1000)
      : now;
  }

  const startOfDay = new Date(targetDate);
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date(targetDate);
  endOfDay.setHours(23, 59, 59, 999);

  const [checkIns, checkOuts] = await Promise.all([
    // حجوزات الدخول اليوم
    prisma.booking.findMany({
      where: {
        checkIn: { gte: startOfDay, lte: endOfDay },
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
      include: {
        apartment: { select: { id: true, name: true, floor: true } },
      },
      orderBy: { arrivalTime: 'asc' },
    }),

    // حجوزات الخروج اليوم
    prisma.booking.findMany({
      where: {
        checkOut: { gte: startOfDay, lte: endOfDay },
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
      include: {
        apartment: { select: { id: true, name: true, floor: true } },
      },
      orderBy: { checkOut: 'asc' },
    }),
  ]);

  return successResponse({
    targetDate: startOfDay.toISOString(),
    checkIns: checkIns.map(b => ({
      id: b.id,
      apartment: b.apartment,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      arrivalTime: b.arrivalTime,
      flightNumber: b.flightNumber,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      nights: b.nights,
      receptionSupervisor: b.receptionSupervisor,
      notes: b.notes,
      status: b.status,
    })),
    checkOuts: checkOuts.map(b => ({
      id: b.id,
      apartment: b.apartment,
      clientName: b.clientName,
      clientPhone: b.clientPhone,
      checkOut: b.checkOut,
      deliverySupervisor: b.deliverySupervisor,
      notes: b.notes,
      status: b.status,
    })),
    summary: {
      totalCheckIns: checkIns.length,
      totalCheckOuts: checkOuts.length,
    },
  });
}
