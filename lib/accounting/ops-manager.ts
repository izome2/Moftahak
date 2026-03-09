/**
 * مساعدات مدير التشغيل - Operations Manager Helpers
 * يُستخدم لجلب الشقق المعينة لمدير التشغيل
 */

import { prisma } from '@/lib/prisma';

/**
 * جلب معرفات الشقق المعينة لمدير التشغيل
 * إذا لم يكن لديه شقق معينة → يرجع مصفوفة فارغة (يعني لا تقييد)
 */
export async function getAssignedApartmentIds(userId: string): Promise<string[]> {
  const assignments = await prisma.opsManagerApartment.findMany({
    where: { userId },
    select: { apartmentId: true },
  });
  return assignments.map(a => a.apartmentId);
}

/**
 * التحقق إذا كانت الشقة معينة لمدير التشغيل
 * إذا لم يكن لديه أي تعيينات → true (لا تقييد)
 */
export async function isApartmentAssigned(userId: string, apartmentId: string): Promise<boolean> {
  const assignedIds = await getAssignedApartmentIds(userId);
  if (assignedIds.length === 0) return true; // لا تقييد
  return assignedIds.includes(apartmentId);
}
