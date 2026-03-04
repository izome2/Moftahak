/**
 * API: ملخص الشقة - GET
 * ⚡ يستخدم MonthlySnapshot (O(1)) أو DB Aggregation (fallback)
 * الصلاحيات: canViewAllData أو canViewBookings أو canViewExpenses
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAnyAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  notFoundResponse,
} from '@/lib/accounting-auth';

type RouteParams = { params: Promise<{ id: string }> };

// GET /api/accounting/apartments/[id]/summary?month=YYYY-MM
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewAllData', 'canViewBookings', 'canViewExpenses',
  ]);
  if (authResult.error) return authResult.error;

  const { id: apartmentId } = await params;
  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM

  // التحقق من وجود الشقة
  const apartment = await prisma.apartment.findUnique({
    where: { id: apartmentId },
    select: { id: true, name: true },
  });
  if (!apartment) return notFoundResponse('الشقة');

  // ⚡ Option 1: من MonthlySnapshot (الأسرع - O(1))
  if (month) {
    const snapshot = await prisma.monthlySnapshot.findUnique({
      where: { apartmentId_month: { apartmentId, month } },
    });
    if (snapshot) {
      return successResponse({
        summary: {
          apartmentId,
          apartmentName: apartment.name,
          month,
          totalRevenue: snapshot.totalRevenue,
          totalExpenses: snapshot.totalExpenses,
          profit: snapshot.profit,
          bookingsCount: snapshot.bookingsCount,
          occupiedNights: snapshot.occupiedNights,
          revenueBySource: snapshot.revenueBySource,
          expensesByCategory: snapshot.expensesByCategory,
        },
      });
    }
  }

  // ⚡ Option 2: حساب مباشر عبر DB Aggregation (fallback)
  const dateFilter = month
    ? (() => {
        const [year, m] = month.split('-').map(Number);
        return { gte: new Date(year, m - 1, 1), lt: new Date(year, m, 1) };
      })()
    : undefined;

  const [revenueResult, expenseResult, bookingsBySource, expensesByCategory] = await Promise.all([
    prisma.booking.aggregate({
      _sum: { amount: true },
      _count: true,
      where: {
        apartmentId,
        deletedAt: null,
        ...(dateFilter ? { checkIn: dateFilter } : {}),
      },
    }),
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        apartmentId,
        deletedAt: null,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
    }),
    prisma.booking.groupBy({
      by: ['source'],
      _sum: { amount: true },
      _count: true,
      where: {
        apartmentId,
        deletedAt: null,
        ...(dateFilter ? { checkIn: dateFilter } : {}),
      },
    }),
    prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        apartmentId,
        deletedAt: null,
        ...(dateFilter ? { date: dateFilter } : {}),
      },
    }),
  ]);

  const totalRevenue = revenueResult._sum.amount || 0;
  const totalExpenses = expenseResult._sum.amount || 0;

  return successResponse({
    summary: {
      apartmentId,
      apartmentName: apartment.name,
      month: month || 'all',
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      bookingsCount: revenueResult._count,
      revenueBySource: Object.fromEntries(
        bookingsBySource.map(g => [g.source, g._sum.amount || 0])
      ),
      expensesByCategory: Object.fromEntries(
        expensesByCategory.map(g => [g.category, g._sum.amount || 0])
      ),
    },
  });
}
