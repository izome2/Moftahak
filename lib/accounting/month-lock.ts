/**
 * Month Lock Engine - محرك قفل الأشهر
 * 🔒 يمنع التعديل على البيانات المالية للأشهر المقفلة
 * ⚡ يحفظ نسب المستثمرين التاريخية في MonthlyInvestorSnapshot
 */

import { prisma } from '@/lib/prisma';
import { getMonthKey } from './snapshot';

// ============================================================================
// Types
// ============================================================================

export interface LockMonthResult {
  success: boolean;
  message: string;
  snapshot?: {
    month: string;
    apartmentId: string;
    isLocked: boolean;
    investorSnapshots: number;
  };
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * قفل شهر لشقة معينة
 * 1. يضع isLocked = true على MonthlySnapshot
 * 2. يُنشئ MonthlyInvestorSnapshot لكل مستثمر بنسبته الحالية
 * 3. يحسب ربح كل مستثمر ويحفظه
 */
export async function lockMonth(
  apartmentId: string,
  month: string,
  lockedById: string
): Promise<LockMonthResult> {
  // 1. التحقق من وجود الملخص الشهري
  const snapshot = await prisma.monthlySnapshot.findUnique({
    where: { apartmentId_month: { apartmentId, month } },
  });

  if (!snapshot) {
    return {
      success: false,
      message: `لا يوجد ملخص شهري لهذه الشقة في شهر ${month}. لا يوجد بيانات مالية.`,
    };
  }

  if (snapshot.isLocked) {
    return {
      success: false,
      message: `الشهر ${month} مقفل بالفعل لهذه الشقة.`,
    };
  }

  // 2. جلب مستثمري الشقة
  const investors = await prisma.apartmentInvestor.findMany({
    where: { apartmentId },
    select: { id: true, percentage: true },
  });

  // 3. في transaction: قفل الشهر + حفظ نسب المستثمرين
  await prisma.$transaction(async (tx) => {
    // قفل الملخص الشهري
    await tx.monthlySnapshot.update({
      where: { apartmentId_month: { apartmentId, month } },
      data: {
        isLocked: true,
        lockedAt: new Date(),
        lockedById,
      },
    });

    // إنشاء لقطات للمستثمرين
    for (const inv of investors) {
      const investorProfit = snapshot.profit * inv.percentage;

      await tx.monthlyInvestorSnapshot.upsert({
        where: {
          apartmentInvestorId_month: {
            apartmentInvestorId: inv.id,
            month,
          },
        },
        update: {
          percentage: inv.percentage,
          investorProfit,
        },
        create: {
          apartmentInvestorId: inv.id,
          month,
          percentage: inv.percentage,
          investorProfit,
        },
      });
    }
  });

  return {
    success: true,
    message: `تم قفل شهر ${month} بنجاح. تم حفظ نسب ${investors.length} مستثمر.`,
    snapshot: {
      month,
      apartmentId,
      isLocked: true,
      investorSnapshots: investors.length,
    },
  };
}

/**
 * فتح شهر مقفل (إلغاء القفل)
 * ⚠️ عملية حساسة - يجب أن يكون المستخدم GENERAL_MANAGER
 * لا يحذف MonthlyInvestorSnapshot (يبقى كسجل تاريخي)
 */
export async function unlockMonth(
  apartmentId: string,
  month: string
): Promise<LockMonthResult> {
  const snapshot = await prisma.monthlySnapshot.findUnique({
    where: { apartmentId_month: { apartmentId, month } },
  });

  if (!snapshot) {
    return { success: false, message: `لا يوجد ملخص شهري لشهر ${month}` };
  }

  if (!snapshot.isLocked) {
    return { success: false, message: `الشهر ${month} غير مقفل أصلاً` };
  }

  await prisma.monthlySnapshot.update({
    where: { apartmentId_month: { apartmentId, month } },
    data: {
      isLocked: false,
      lockedAt: null,
      lockedById: null,
    },
  });

  return {
    success: true,
    message: `تم فتح شهر ${month}. يمكن التعديل على البيانات المالية الآن.`,
    snapshot: {
      month,
      apartmentId,
      isLocked: false,
      investorSnapshots: 0,
    },
  };
}

/**
 * التحقق إذا كان شهر مقفل لشقة معينة
 * يُستخدم كحارس (guard) في كل عملية تعديل مالية
 */
export async function isMonthLocked(
  apartmentId: string,
  month: string
): Promise<boolean> {
  const snapshot = await prisma.monthlySnapshot.findUnique({
    where: { apartmentId_month: { apartmentId, month } },
    select: { isLocked: true },
  });

  return snapshot?.isLocked ?? false;
}

/**
 * التحقق من القفل ويرجع رسالة خطأ مُنسقة
 * يُستخدم مباشرة في API routes
 */
export async function checkMonthLock(
  apartmentId: string,
  date: Date
): Promise<{ locked: boolean; message?: string; month?: string }> {
  const month = getMonthKey(date);
  const locked = await isMonthLocked(apartmentId, month);

  if (locked) {
    return {
      locked: true,
      month,
      message: `لا يمكن التعديل - شهر ${month} مقفل. يجب فتح القفل أولاً من المدير العام.`,
    };
  }

  return { locked: false, month };
}

/**
 * قفل شهر لجميع الشقق النشطة
 * يُستخدم لقفل شهر كامل مرة واحدة
 */
export async function lockMonthForAllApartments(
  month: string,
  lockedById: string
): Promise<{
  success: number;
  failed: number;
  alreadyLocked: number;
  errors: string[];
}> {
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
  });

  let success = 0;
  let failed = 0;
  let alreadyLocked = 0;
  const errors: string[] = [];

  for (const apt of apartments) {
    const result = await lockMonth(apt.id, month, lockedById);
    if (result.success) {
      success++;
    } else if (result.message.includes('مقفل بالفعل')) {
      alreadyLocked++;
    } else {
      failed++;
      errors.push(`${apt.name}: ${result.message}`);
    }
  }

  return { success, failed, alreadyLocked, errors };
}

/**
 * جلب حالة القفل لجميع الشقق في شهر معين
 */
export async function getMonthLockStatus(month: string): Promise<{
  apartments: {
    id: string;
    name: string;
    isLocked: boolean;
    lockedAt: Date | null;
    lockedById: string | null;
    profit: number;
  }[];
  totalLocked: number;
  totalUnlocked: number;
}> {
  const apartments = await prisma.apartment.findMany({
    where: { isActive: true },
    select: { id: true, name: true },
    orderBy: { name: 'asc' },
  });

  const snapshots = await prisma.monthlySnapshot.findMany({
    where: {
      month,
      apartmentId: { in: apartments.map(a => a.id) },
    },
    select: {
      apartmentId: true,
      isLocked: true,
      lockedAt: true,
      lockedById: true,
      profit: true,
    },
  });

  const snapshotMap = new Map(snapshots.map(s => [s.apartmentId, s]));

  let totalLocked = 0;
  let totalUnlocked = 0;

  const result = apartments.map(apt => {
    const snap = snapshotMap.get(apt.id);
    const isLocked = snap?.isLocked ?? false;
    if (isLocked) totalLocked++;
    else totalUnlocked++;

    return {
      id: apt.id,
      name: apt.name,
      isLocked,
      lockedAt: snap?.lockedAt ?? null,
      lockedById: snap?.lockedById ?? null,
      profit: snap?.profit ?? 0,
    };
  });

  return {
    apartments: result,
    totalLocked,
    totalUnlocked,
  };
}
