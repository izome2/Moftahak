/**
 * MonthlySnapshot - ملخص شهري مُحسوب مسبقاً لكل شقة
 * ⚡ يُحدّث تلقائياً عند كل عملية مالية (إضافة/تعديل/حذف حجز أو مصروف)
 * يُستخدم في Dashboard والتقارير وواجهة المستثمر لتسريع الأداء 100x
 */

import { prisma } from '@/lib/prisma';

/**
 * يعيد حساب الملخص الشهري لشقة معينة في شهر محدد
 * يُستدعى بعد كل عملية مالية (create/update/delete)
 * 
 * @param apartmentId - معرف الشقة
 * @param month - الشهر بصيغة "YYYY-MM" (مثلاً: "2026-03")
 */
export async function refreshMonthlySnapshot(
  apartmentId: string,
  month: string
): Promise<void> {
  const [year, m] = month.split('-').map(Number);
  
  if (!year || !m || m < 1 || m > 12) {
    console.error(`[Snapshot] Invalid month format: ${month}. Expected YYYY-MM`);
    return;
  }
  
  const startOfMonth = new Date(year, m - 1, 1);
  const endOfMonth = new Date(year, m, 1);

  try {
    // ⚡ كل الحسابات تتم على مستوى DB (لا .reduce في JavaScript)
    const [revenueAgg, expenseAgg, bookingsBySource, expensesByCategory, nightsAgg] = await Promise.all([
      // 1. إجمالي الإيرادات + عدد الحجوزات (بدون الملغية)
      prisma.booking.aggregate({
        _sum: { amount: true },
        _count: true,
        where: {
          apartmentId,
          checkIn: { gte: startOfMonth, lt: endOfMonth },
          deletedAt: null,
          status: { not: 'CANCELLED' },
        },
      }),

      // 2. إجمالي المصروفات (المعتمدة فقط)
      prisma.expense.aggregate({
        _sum: { amount: true },
        where: {
          apartmentId,
          date: { gte: startOfMonth, lt: endOfMonth },
          deletedAt: null,
          approvalStatus: 'APPROVED',
        },
      }),

      // 3. تقسيم الإيرادات حسب مصدر الحجز (بدون الملغية)
      prisma.booking.groupBy({
        by: ['source'],
        _sum: { amount: true },
        where: {
          apartmentId,
          checkIn: { gte: startOfMonth, lt: endOfMonth },
          deletedAt: null,
          status: { not: 'CANCELLED' },
        },
      }),

      // 4. تقسيم المصروفات حسب القسم (المعتمدة فقط)
      prisma.expense.groupBy({
        by: ['category'],
        _sum: { amount: true },
        where: {
          apartmentId,
          date: { gte: startOfMonth, lt: endOfMonth },
          deletedAt: null,
          approvalStatus: 'APPROVED',
        },
      }),

      // 5. إجمالي الليالي المشغولة
      prisma.booking.aggregate({
        _sum: { nights: true },
        where: {
          apartmentId,
          checkIn: { gte: startOfMonth, lt: endOfMonth },
          deletedAt: null,
          status: { not: 'CANCELLED' },
        },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amount || 0;
    const totalExpenses = expenseAgg._sum.amount || 0;
    const profit = totalRevenue - totalExpenses;
    const bookingsCount = revenueAgg._count || 0;
    const occupiedNights = nightsAgg._sum.nights || 0;

    // تحويل groupBy إلى objects
    const revenueBySource: Record<string, number> = {};
    for (const group of bookingsBySource) {
      revenueBySource[group.source] = group._sum.amount || 0;
    }

    const expensesByCategoryMap: Record<string, number> = {};
    for (const group of expensesByCategory) {
      expensesByCategoryMap[group.category] = group._sum.amount || 0;
    }

    // Upsert: إنشاء أو تحديث الملخص الشهري
    await prisma.monthlySnapshot.upsert({
      where: {
        apartmentId_month: { apartmentId, month },
      },
      update: {
        totalRevenue,
        totalExpenses,
        profit,
        bookingsCount,
        occupiedNights,
        revenueBySource,
        expensesByCategory: expensesByCategoryMap,
      },
      create: {
        apartmentId,
        month,
        totalRevenue,
        totalExpenses,
        profit,
        bookingsCount,
        occupiedNights,
        revenueBySource,
        expensesByCategory: expensesByCategoryMap,
      },
    });
  } catch (error) {
    console.error(`[Snapshot] Failed to refresh snapshot for apartment ${apartmentId}, month ${month}:`, error);
    throw error;
  }
}

/**
 * يستخرج الشهر بصيغة "YYYY-MM" من تاريخ
 * 
 * @param date - التاريخ
 * @returns الشهر بصيغة "YYYY-MM"
 */
export function getMonthKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * يعيد حساب الملخص الشهري لجميع الشقق في شهر محدد
 * يُستخدم كـ cron job يومي (safety net)
 * 
 * @param month - الشهر بصيغة "YYYY-MM" (اختياري - الافتراضي: الشهر الحالي)
 */
export async function refreshAllSnapshots(month?: string): Promise<{
  success: number;
  failed: number;
  errors: string[];
}> {
  const targetMonth = month || getMonthKey(new Date());
  
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  let success = 0;
  let failed = 0;
  const errors: string[] = [];

  for (const apartment of apartments) {
    try {
      await refreshMonthlySnapshot(apartment.id, targetMonth);
      success++;
    } catch (error) {
      failed++;
      errors.push(`${apartment.name} (${apartment.id}): ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  return { success, failed, errors };
}

/**
 * يعيد حساب الملخصات لمدة معينة (عدة أشهر)
 * مفيد عند إعادة بناء كل البيانات
 * 
 * @param apartmentId - معرف الشقة
 * @param startMonth - شهر البداية "YYYY-MM"
 * @param endMonth - شهر النهاية "YYYY-MM"
 */
export async function refreshSnapshotRange(
  apartmentId: string,
  startMonth: string,
  endMonth: string
): Promise<void> {
  const [startYear, startM] = startMonth.split('-').map(Number);
  const [endYear, endM] = endMonth.split('-').map(Number);

  let currentYear = startYear;
  let currentMonth = startM;

  while (
    currentYear < endYear ||
    (currentYear === endYear && currentMonth <= endM)
  ) {
    const monthKey = `${currentYear}-${String(currentMonth).padStart(2, '0')}`;
    await refreshMonthlySnapshot(apartmentId, monthKey);

    currentMonth++;
    if (currentMonth > 12) {
      currentMonth = 1;
      currentYear++;
    }
  }
}
