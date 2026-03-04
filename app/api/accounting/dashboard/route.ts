/**
 * API: لوحة التحكم - GET
 * يجلب كل الإحصائيات المطلوبة للداشبورد في طلب واحد
 * الصلاحيات: أي دور حسابات ما عدا المستثمر
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAnyAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
} from '@/lib/accounting-auth';

// GET /api/accounting/dashboard?month=YYYY-MM
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewAllData', 'canViewDailyOps', 'canViewBookings',
  ]);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month');

  // الشهر الحالي إذا لم يُحدّد
  const now = new Date();
  const month = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [year, m] = month.split('-').map(Number);
  const startOfMonth = new Date(year, m - 1, 1);
  const endOfMonth = new Date(year, m, 1);

  // ⚡ كل الاستعلامات بالتوازي
  const [
    revenueAgg,
    expensesAgg,
    bookingsCount,
    apartmentsCount,
    occupancyData,
    expensesByCategory,
    bookingsBySource,
    recentBookings,
    recentExpenses,
    last12MonthsSnapshots,
    dailyCheckIns,
    dailyCheckOuts,
  ] = await Promise.all([
    // 1. إجمالي الإيرادات
    prisma.booking.aggregate({
      _sum: { amount: true },
      where: {
        checkIn: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
    }),

    // 2. إجمالي المصروفات
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: {
        date: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
      },
    }),

    // 3. عدد الحجوزات
    prisma.booking.count({
      where: {
        checkIn: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
    }),

    // 4. عدد الشقق الفعّالة
    prisma.apartment.count({
      where: { isActive: true },
    }),

    // 5. بيانات الإشغال (مجموع الليالي المحجوزة)
    prisma.booking.aggregate({
      _sum: { nights: true },
      where: {
        checkIn: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
    }),

    // 6. المصروفات حسب القسم (للمخطط الدائري)
    prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: {
        date: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
      },
    }),

    // 7. الحجوزات حسب المصدر (للمخطط الدائري)
    prisma.booking.groupBy({
      by: ['source'],
      _sum: { amount: true },
      _count: true,
      where: {
        checkIn: { gte: startOfMonth, lt: endOfMonth },
        deletedAt: null,
        status: { not: 'CANCELLED' },
      },
    }),

    // 8. آخر 5 حجوزات
    prisma.booking.findMany({
      where: { deletedAt: null },
      include: {
        apartment: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // 9. آخر 5 مصروفات
    prisma.expense.findMany({
      where: { deletedAt: null },
      include: {
        apartment: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // 10. بيانات آخر 12 شهر (للمخطط الخطي)
    prisma.monthlySnapshot.groupBy({
      by: ['month'],
      _sum: {
        totalRevenue: true,
        totalExpenses: true,
        profit: true,
      },
      where: {
        month: {
          gte: `${year - 1}-${String(m).padStart(2, '0')}`,
          lte: month,
        },
      },
      orderBy: { month: 'asc' },
    }),

    // 11. تنبيهات اليوم - دخول
    (() => {
      const today = new Date();
      const hour = today.getHours();
      const targetDate = hour >= 19
        ? new Date(today.getTime() + 24 * 60 * 60 * 1000)
        : today;
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return prisma.booking.findMany({
        where: {
          checkIn: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
          status: { not: 'CANCELLED' },
        },
        include: {
          apartment: { select: { id: true, name: true } },
        },
        orderBy: { arrivalTime: 'asc' },
        take: 10,
      });
    })(),

    // 12. تنبيهات اليوم - خروج
    (() => {
      const today = new Date();
      const hour = today.getHours();
      const targetDate = hour >= 19
        ? new Date(today.getTime() + 24 * 60 * 60 * 1000)
        : today;
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);

      return prisma.booking.findMany({
        where: {
          checkOut: { gte: startOfDay, lte: endOfDay },
          deletedAt: null,
          status: { not: 'CANCELLED' },
        },
        include: {
          apartment: { select: { id: true, name: true } },
        },
        orderBy: { checkOut: 'asc' },
        take: 10,
      });
    })(),
  ]);

  const totalRevenue = revenueAgg._sum.amount || 0;
  const totalExpenses = expensesAgg._sum.amount || 0;
  const totalNights = occupancyData._sum.nights || 0;

  // حساب نسبة الإشغال: (ليالي محجوزة) / (عدد شقق × أيام الشهر) × 100
  const daysInMonth = new Date(year, m, 0).getDate();
  const maxNights = apartmentsCount * daysInMonth;
  const occupancyRate = maxNights > 0 ? Math.round((totalNights / maxNights) * 100) : 0;

  return successResponse({
    month,
    stats: {
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      bookingsCount,
      apartmentsCount,
      occupancyRate,
    },
    charts: {
      monthlyTrend: last12MonthsSnapshots.map(s => ({
        month: s.month,
        revenue: s._sum.totalRevenue || 0,
        expenses: s._sum.totalExpenses || 0,
        profit: s._sum.profit || 0,
      })),
      expensesByCategory: expensesByCategory.map(g => ({
        category: g.category,
        amount: g._sum.amount || 0,
      })),
      bookingsBySource: bookingsBySource.map(g => ({
        source: g.source,
        amount: g._sum.amount || 0,
        count: g._count,
      })),
    },
    recentBookings: recentBookings.map(b => ({
      id: b.id,
      clientName: b.clientName,
      apartment: b.apartment.name,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      amount: b.amount,
      source: b.source,
      status: b.status,
    })),
    recentExpenses: recentExpenses.map(e => ({
      id: e.id,
      description: e.description,
      apartment: e.apartment.name,
      date: e.date,
      amount: e.amount,
      category: e.category,
    })),
    alerts: {
      checkIns: dailyCheckIns.map(b => ({
        id: b.id,
        clientName: b.clientName,
        apartment: b.apartment.name,
        arrivalTime: b.arrivalTime,
        checkIn: b.checkIn,
        checkOut: b.checkOut,
      })),
      checkOuts: dailyCheckOuts.map(b => ({
        id: b.id,
        clientName: b.clientName,
        apartment: b.apartment.name,
        checkOut: b.checkOut,
      })),
    },
  });
}
