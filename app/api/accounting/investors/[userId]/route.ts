/**
 * API: ملخص المستثمر - GET
 * ⚡ يستخدم MonthlySnapshot + MonthlyInvestorSnapshot للنسب التاريخية
 * الصلاحيات: canManageInvestors || (INVESTOR يرى بياناته فقط)
 * 
 * 🔒 Enterprise: للأشهر المقفلة → يستخدم النسبة المحفوظة في MonthlyInvestorSnapshot
 *    للأشهر المفتوحة → يستخدم النسبة الحالية من ApartmentInvestor
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingSession,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
  notFoundResponse,
} from '@/lib/accounting-auth';
import { hasPermission } from '@/lib/permissions';

type RouteParams = { params: Promise<{ userId: string }> };

// GET /api/accounting/investors/[userId]?month=YYYY-MM&year=YYYY
export async function GET(request: NextRequest, { params }: RouteParams) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const { userId } = await params;

  // 🔒 المستثمر يرى بياناته فقط
  if (authResult.role === 'INVESTOR' && authResult.userId !== userId) {
    return errorResponse('ليس لديك صلاحية لعرض بيانات مستثمر آخر', 403);
  }

  // المدير يجب أن يملك صلاحية إدارة المستثمرين
  if (authResult.role !== 'INVESTOR' && !hasPermission(authResult.role, 'canManageInvestors')) {
    return errorResponse('ليس لديك الصلاحية المطلوبة', 403);
  }

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month'); // YYYY-MM
  const year = searchParams.get('year');   // YYYY

  // جلب بيانات المستثمر
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, firstName: true, lastName: true, email: true },
  });
  if (!user) return notFoundResponse('المستثمر');

  // جلب استثماراته
  const investments = await prisma.apartmentInvestor.findMany({
    where: { userId },
    include: {
      apartment: { select: { id: true, name: true, type: true } },
    },
  });

  if (investments.length === 0) {
    return successResponse({
      investor: user,
      investments: [],
      totals: { totalInvestorProfit: 0, totalWithdrawals: 0, totalBalance: 0 },
    });
  }

  // ⚡ حساب الأرباح من MonthlySnapshot لكل شقة
  // 🔒 Enterprise: النسب التاريخية للأشهر المقفلة
  const result = await Promise.all(investments.map(async (inv) => {
    // فلترة الملخصات الشهرية
    const snapshotWhere: Record<string, unknown> = { apartmentId: inv.apartmentId };
    if (month) snapshotWhere.month = month;
    else if (year) snapshotWhere.month = { startsWith: year };

    const snapshots = await prisma.monthlySnapshot.findMany({
      where: snapshotWhere,
      orderBy: { month: 'asc' },
    });

    // 🔒 جلب لقطات المستثمر التاريخية (للأشهر المقفلة)
    const lockedMonths = snapshots.filter(s => s.isLocked).map(s => s.month);
    const investorSnapshots = lockedMonths.length > 0
      ? await prisma.monthlyInvestorSnapshot.findMany({
          where: {
            apartmentInvestorId: inv.id,
            month: { in: lockedMonths },
          },
        })
      : [];

    // خريطة: شهر → نسبة تاريخية
    const historicalPercentages = new Map(
      investorSnapshots.map(s => [s.month, s.percentage])
    );

    // ⚡ حساب المجاميع مع مراعاة النسب التاريخية
    let totalRevenue = 0;
    let totalExpenses = 0;
    let totalInvestorProfit = 0;

    const monthlyBreakdown = snapshots.map(snap => {
      totalRevenue += snap.totalRevenue;
      totalExpenses += snap.totalExpenses;

      // 🔒 النسبة: تاريخية (إذا مقفل ومحفوظ) أو حالية
      const effectivePercentage = snap.isLocked
        ? (historicalPercentages.get(snap.month) ?? inv.percentage)
        : inv.percentage;

      const investorShare = snap.profit * effectivePercentage;
      totalInvestorProfit += investorShare;

      return {
        month: snap.month,
        revenue: snap.totalRevenue,
        expenses: snap.totalExpenses,
        profit: snap.profit,
        investorShare,
        percentage: effectivePercentage,
        isLocked: snap.isLocked,
      };
    });

    return {
      investmentId: inv.id,
      apartment: inv.apartment,
      percentage: inv.percentage,
      investmentTarget: inv.investmentTarget,
      totalRevenue,
      totalExpenses,
      profit: totalRevenue - totalExpenses,
      investorProfit: totalInvestorProfit,
      monthlyBreakdown,
    };
  }));

  // ⚡ حساب إجمالي المسحوبات عبر كل الشقق (وليس لكل شقة على حدة)
  const allInvestmentIds = investments.map(inv => inv.id);
  const globalWithdrawals = await prisma.withdrawal.aggregate({
    _sum: { amount: true },
    where: { apartmentInvestorId: { in: allInvestmentIds }, deletedAt: null },
  });
  const totalGlobalWithdrawals = globalWithdrawals._sum.amount || 0;

  // حساب الإجماليات - الرصيد الإجمالي = إجمالي الأرباح - إجمالي المسحوبات من كل الشقق
  const totalInvestorProfitAll = result.reduce((s, r) => s + r.investorProfit, 0);
  const totals = {
    totalInvestorProfit: totalInvestorProfitAll,
    totalWithdrawals: totalGlobalWithdrawals,
    totalBalance: totalInvestorProfitAll - totalGlobalWithdrawals,
  };

  // إضافة بيانات المسحوبات لكل شقة (للعرض فقط)
  const investmentsWithWithdrawals = result.map(r => ({
    ...r,
    totalWithdrawals: 0, // المسحوبات الآن إجمالية وليست لكل شقة
    balance: r.investorProfit, // رصيد الشقة = أرباحها فقط (المسحوبات تُخصم من الإجمالي)
  }));

  return successResponse({
    investor: user,
    investments: investmentsWithWithdrawals,
    totals,
  });
}
