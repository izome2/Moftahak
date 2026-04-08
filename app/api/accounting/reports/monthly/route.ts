/**
 * API: تقرير شهري - GET
 * ملخص تفصيلي لشهر واحد لكل الشقق أو شقة محددة
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

// GET /api/accounting/reports/monthly?month=YYYY-MM&apartmentId=...
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canViewAllData');
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const apartmentId = searchParams.get('apartmentId');

  if (!month) {
    return errorResponse('الشهر مطلوب (month=YYYY-MM)', 400);
  }

  const [year, m] = month.split('-').map(Number);
  const startOfMonth = new Date(year, m - 1, 1);
  const endOfMonth = new Date(year, m, 1);

  const apartmentWhere: Record<string, unknown> = {};
  if (apartmentId) apartmentWhere.apartmentId = apartmentId;

  // ⚡ جلب الملخصات الشهرية
  const snapshotWhere: Record<string, unknown> = { month };
  if (apartmentId) snapshotWhere.apartmentId = apartmentId;

  const snapshots = await prisma.monthlySnapshot.findMany({
    where: snapshotWhere,
    include: {
      apartment: {
        select: { id: true, name: true, project: { select: { name: true } } },
      },
    },
    orderBy: { totalRevenue: 'desc' },
  });

  // حجوزات الشهر (ملخص - بدون الملغية)
  const bookingStats = await prisma.booking.groupBy({
    by: ['source'],
    _sum: { amount: true, nights: true },
    _count: true,
    where: {
      checkIn: { gte: startOfMonth, lt: endOfMonth },
      deletedAt: null,
      status: { not: 'CANCELLED' as const },
      ...(apartmentId ? { apartmentId } : {}),
    },
  });

  // مصروفات الشهر (حسب القسم - المعتمدة فقط)
  const expenseStats = await prisma.expense.groupBy({
    by: ['category'],
    _sum: { amount: true },
    _count: true,
    where: {
      date: { gte: startOfMonth, lt: endOfMonth },
      deletedAt: null,
      approvalStatus: 'APPROVED',
      ...(apartmentId ? { apartmentId } : {}),
    },
  });

  // إجماليات
  const totalRevenue = snapshots.reduce((s, snap) => s + snap.totalRevenue, 0);
  const totalExpenses = snapshots.reduce((s, snap) => s + snap.totalExpenses, 0);

  return successResponse({
    month,
    apartments: snapshots.map(s => ({
      id: s.apartmentId,
      name: s.apartment.name,
      project: s.apartment.project?.name,
      revenue: s.totalRevenue,
      expenses: s.totalExpenses,
      profit: s.profit,
      bookings: s.bookingsCount,
      occupiedNights: s.occupiedNights,
      revenueBySource: s.revenueBySource,
      expensesByCategory: s.expensesByCategory,
    })),
    bookingsBySource: Object.fromEntries(
      bookingStats.map(g => [g.source, {
        amount: g._sum.amount || 0,
        nights: g._sum.nights || 0,
        count: g._count,
      }])
    ),
    expensesByCategory: Object.fromEntries(
      expenseStats.map(g => [g.category, {
        amount: g._sum.amount || 0,
        count: g._count,
      }])
    ),
    totals: {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      apartmentsCount: snapshots.length,
    },
  });
}
