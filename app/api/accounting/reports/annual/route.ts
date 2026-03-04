/**
 * API: تقرير سنوي - GET
 * ملخص 12 شهر لسنة كاملة
 * الصلاحيات: canViewAllData (المدير العام فقط)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';

// GET /api/accounting/reports/annual?year=YYYY&apartmentId=...
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canViewAllData');
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const year = searchParams.get('year');
  const apartmentId = searchParams.get('apartmentId');

  if (!year) {
    return errorResponse('السنة مطلوبة (year=YYYY)', 400);
  }

  // ⚡ جلب كل الملخصات الشهرية للسنة
  const snapshotWhere: Record<string, unknown> = {
    month: { startsWith: year },
  };
  if (apartmentId) snapshotWhere.apartmentId = apartmentId;

  const snapshots = await prisma.monthlySnapshot.findMany({
    where: snapshotWhere,
    include: {
      apartment: {
        select: { id: true, name: true, project: { select: { name: true } } },
      },
    },
    orderBy: { month: 'asc' },
  });

  // تجميع حسب الشهر
  const monthlyTotals: Record<string, {
    revenue: number;
    expenses: number;
    profit: number;
    bookings: number;
    nights: number;
  }> = {};

  // تجميع حسب الشقة
  const apartmentTotals: Record<string, {
    name: string;
    project: string | undefined;
    revenue: number;
    expenses: number;
    profit: number;
    bookings: number;
    nights: number;
  }> = {};

  for (const snap of snapshots) {
    // شهري
    if (!monthlyTotals[snap.month]) {
      monthlyTotals[snap.month] = { revenue: 0, expenses: 0, profit: 0, bookings: 0, nights: 0 };
    }
    monthlyTotals[snap.month].revenue += snap.totalRevenue;
    monthlyTotals[snap.month].expenses += snap.totalExpenses;
    monthlyTotals[snap.month].profit += snap.profit;
    monthlyTotals[snap.month].bookings += snap.bookingsCount;
    monthlyTotals[snap.month].nights += snap.occupiedNights;

    // شقة
    if (!apartmentTotals[snap.apartmentId]) {
      apartmentTotals[snap.apartmentId] = {
        name: snap.apartment.name,
        project: snap.apartment.project?.name,
        revenue: 0, expenses: 0, profit: 0, bookings: 0, nights: 0,
      };
    }
    apartmentTotals[snap.apartmentId].revenue += snap.totalRevenue;
    apartmentTotals[snap.apartmentId].expenses += snap.totalExpenses;
    apartmentTotals[snap.apartmentId].profit += snap.profit;
    apartmentTotals[snap.apartmentId].bookings += snap.bookingsCount;
    apartmentTotals[snap.apartmentId].nights += snap.occupiedNights;
  }

  // إجماليات كلية
  const grandTotal = {
    revenue: Object.values(monthlyTotals).reduce((s, m) => s + m.revenue, 0),
    expenses: Object.values(monthlyTotals).reduce((s, m) => s + m.expenses, 0),
    profit: Object.values(monthlyTotals).reduce((s, m) => s + m.profit, 0),
    bookings: Object.values(monthlyTotals).reduce((s, m) => s + m.bookings, 0),
    nights: Object.values(monthlyTotals).reduce((s, m) => s + m.nights, 0),
  };

  return successResponse({
    year,
    monthlyBreakdown: Object.entries(monthlyTotals)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({ month, ...data })),
    apartmentBreakdown: Object.entries(apartmentTotals)
      .sort(([, a], [, b]) => b.profit - a.profit)
      .map(([id, data]) => ({ apartmentId: id, ...data })),
    totals: grandTotal,
  });
}
