/**
 * API: لوحة التحكم - GET
 * يجلب كل الإحصائيات المطلوبة للداشبورد في طلب واحد
 * 🔒 البيانات مفلترة حسب دور المستخدم:
 *   - GENERAL_MANAGER: كل البيانات
 *   - BOOKING_MANAGER: حجوزات + إيرادات فقط
 *   - OPS_MANAGER: مصروفاته فقط + تنبيهات يومية (بدون إيرادات/حجوزات)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAnyAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
} from '@/lib/accounting-auth';
import { getEffectiveAccountingRole } from '@/lib/permissions';
import { getAssignedApartmentIds } from '@/lib/accounting/ops-manager';

// GET /api/accounting/dashboard?month=YYYY-MM
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewAllData', 'canViewDailyOps', 'canViewBookings', 'canViewExpenses',
  ]);
  if (authResult.error) return authResult.error;

  const effectiveRole = getEffectiveAccountingRole(authResult.role);

  const { searchParams } = new URL(request.url);
  const monthParam = searchParams.get('month');

  const now = new Date();
  const month = monthParam || `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

  const [year, m] = month.split('-').map(Number);
  const startOfMonth = new Date(year, m - 1, 1);
  const endOfMonth = new Date(year, m, 1);

  // 🔒 مدير التشغيل ومدير الحجوزات: فقط الشقق المعينة لهم
  let assignedApartmentFilter: Record<string, unknown> | undefined;
  if (effectiveRole === 'OPS_MANAGER' || effectiveRole === 'BOOKING_MANAGER') {
    const assignedIds = await getAssignedApartmentIds(authResult.userId);
    if (assignedIds.length > 0) {
      assignedApartmentFilter = { apartmentId: { in: assignedIds } };
    }
  }

  const isOpsManager = effectiveRole === 'OPS_MANAGER';
  const isBookingManager = effectiveRole === 'BOOKING_MANAGER';
  const hideFinancials = isOpsManager || isBookingManager; // لا يرى الأرقام المالية

  // بناء الفلاتر المشتركة
  const expenseBaseWhere = {
    date: { gte: startOfMonth, lt: endOfMonth },
    deletedAt: null,
    ...(isOpsManager ? { createdById: authResult.userId } : {}),
    ...(assignedApartmentFilter || {}),
  };

  const bookingBaseWhere = {
    checkIn: { gte: startOfMonth, lt: endOfMonth },
    deletedAt: null,
    status: { not: 'CANCELLED' as const },
  };

  // ⚡ الاستعلامات بالتوازي - حسب الدور
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
    pendingExpensesCount,
  ] = await Promise.all([
    // 1. إجمالي الإيرادات (ليس لمدير التشغيل أو مدير الحجوزات)
    hideFinancials
      ? Promise.resolve({ _sum: { amount: null } })
      : prisma.booking.aggregate({
          _sum: { amount: true },
          where: bookingBaseWhere,
        }),

    // 2. إجمالي المصروفات
    prisma.expense.aggregate({
      _sum: { amount: true },
      where: expenseBaseWhere,
    }),

    // 3. عدد الحجوزات (ليس لمدير التشغيل)
    isOpsManager
      ? Promise.resolve(0)
      : prisma.booking.count({ where: bookingBaseWhere }),

    // 4. عدد الشقق الفعّالة
    (() => {
      if (isOpsManager && assignedApartmentFilter) {
        return prisma.apartment.count({
          where: { isActive: true, ...(assignedApartmentFilter ? { id: (assignedApartmentFilter as { apartmentId: { in: string[] } }).apartmentId } : {}) },
        });
      }
      return prisma.apartment.count({ where: { isActive: true } });
    })(),

    // 5. بيانات الإشغال (ليس لمدير التشغيل)
    isOpsManager
      ? Promise.resolve({ _sum: { nights: null } })
      : prisma.booking.aggregate({
          _sum: { nights: true },
          where: bookingBaseWhere,
        }),

    // 6. المصروفات حسب القسم
    prisma.expense.groupBy({
      by: ['category'],
      _sum: { amount: true },
      where: expenseBaseWhere,
    }),

    // 7. الحجوزات حسب المصدر (ليس لمدير التشغيل أو مدير الحجوزات - مالية)
    hideFinancials
      ? Promise.resolve([])
      : prisma.booking.groupBy({
          by: ['source'],
          _sum: { amount: true },
          _count: true,
          where: bookingBaseWhere,
        }),

    // 8. آخر 5 حجوزات (ليس لمدير التشغيل)
    isOpsManager
      ? Promise.resolve([])
      : prisma.booking.findMany({
          where: { deletedAt: null },
          include: { apartment: { select: { id: true, name: true } } },
          orderBy: { createdAt: 'desc' },
          take: 5,
        }),

    // 9. آخر 5 مصروفات (مفلترة لمدير التشغيل)
    prisma.expense.findMany({
      where: {
        deletedAt: null,
        ...(isOpsManager ? { createdById: authResult.userId } : {}),
        ...(assignedApartmentFilter || {}),
      },
      include: { apartment: { select: { id: true, name: true } } },
      orderBy: { createdAt: 'desc' },
      take: 5,
    }),

    // 10. بيانات آخر 12 شهر (ليس لمدير التشغيل أو مدير الحجوزات)
    hideFinancials
      ? Promise.resolve([])
      : prisma.monthlySnapshot.groupBy({
          by: ['month'],
          _sum: { totalRevenue: true, totalExpenses: true, profit: true },
          where: {
            month: { gte: `${year - 1}-${String(m).padStart(2, '0')}`, lte: month },
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
          ...(assignedApartmentFilter || {}),
        },
        include: { apartment: { select: { id: true, name: true } } },
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
          ...(assignedApartmentFilter || {}),
        },
        include: { apartment: { select: { id: true, name: true } } },
        orderBy: { checkOut: 'asc' },
        take: 10,
      });
    })(),

    // 13. عدد المصروفات في انتظار الموافقة (للمدير العام فقط)
    effectiveRole === 'GENERAL_MANAGER'
      ? prisma.expense.count({
          where: { approvalStatus: 'PENDING', deletedAt: null },
        })
      : Promise.resolve(0),
  ]);

  const totalRevenue = revenueAgg._sum.amount || 0;
  const totalExpenses = expensesAgg._sum.amount || 0;
  const totalNights = (occupancyData as { _sum: { nights: number | null } })._sum.nights || 0;

  const daysInMonth = new Date(year, m, 0).getDate();
  const maxNights = (apartmentsCount as number) * daysInMonth;
  const occupancyRate = maxNights > 0 ? Math.round((totalNights / maxNights) * 100) : 0;

  return successResponse({
    month,
    role: effectiveRole,
    stats: {
      totalRevenue: hideFinancials ? undefined : totalRevenue,
      totalExpenses: isBookingManager ? undefined : totalExpenses,
      profit: hideFinancials ? undefined : totalRevenue - totalExpenses,
      bookingsCount: isOpsManager ? undefined : bookingsCount,
      apartmentsCount,
      occupancyRate: isOpsManager ? undefined : occupancyRate,
      pendingExpensesCount: effectiveRole === 'GENERAL_MANAGER' ? pendingExpensesCount : undefined,
    },
    charts: {
      monthlyTrend: hideFinancials ? [] : (last12MonthsSnapshots as { month: string; _sum: { totalRevenue: number | null; totalExpenses: number | null; profit: number | null } }[]).map(s => ({
        month: s.month,
        revenue: s._sum.totalRevenue || 0,
        expenses: s._sum.totalExpenses || 0,
        profit: s._sum.profit || 0,
      })),
      expensesByCategory: isBookingManager ? [] : expensesByCategory.map(g => ({
        category: g.category,
        amount: g._sum.amount || 0,
      })),
      bookingsBySource: hideFinancials ? [] : (bookingsBySource as { source: string; _sum: { amount: number | null }; _count: number }[]).map(g => ({
        source: g.source,
        amount: g._sum.amount || 0,
        count: g._count,
      })),
    },
    recentBookings: isOpsManager ? [] : (recentBookings as { id: string; clientName: string; apartment: { name: string }; checkIn: Date; checkOut: Date; amount: number; source: string; status: string }[]).map(b => ({
      id: b.id,
      clientName: b.clientName,
      apartment: b.apartment.name,
      checkIn: b.checkIn,
      checkOut: b.checkOut,
      amount: isBookingManager ? undefined : b.amount,
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
