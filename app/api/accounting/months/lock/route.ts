/**
 * API: قفل/فتح الأشهر المالية - POST (lock/unlock)
 * الصلاحيات: canLockMonths (GENERAL_MANAGER فقط)
 * 🔒 يمنع التعديل على البيانات المالية للأشهر المقفلة
 */

import { NextRequest } from 'next/server';
import {
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { lockMonth, unlockMonth, lockMonthForAllApartments } from '@/lib/accounting/month-lock';
import { logAuditEvent, getClientIP } from '@/lib/accounting/audit';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const lockMonthSchema = z.object({
  apartmentId: z.string().optional(), // إذا لم يُحدد → قفل لجميع الشقق
  month: z.string().regex(/^\d{4}-\d{2}$/, 'الشهر يجب أن يكون بصيغة YYYY-MM'),
  action: z.enum(['lock', 'unlock']).default('lock'),
});

// POST /api/accounting/months/lock
export async function POST(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canLockMonths');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = lockMonthSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const { apartmentId, month, action } = parsed.data;

  // Get user info for audit
  const user = await prisma.user.findUnique({
    where: { id: authResult.userId },
    select: { firstName: true, lastName: true },
  });
  const userName = user ? `${user.firstName} ${user.lastName}` : 'Unknown';

  if (action === 'lock') {
    if (apartmentId) {
      // قفل شهر لشقة واحدة
      const result = await lockMonth(apartmentId, month, authResult.userId);
      
      if (result.success) {
        // Fetch apartment name for audit
        const apt = await prisma.apartment.findUnique({
          where: { id: apartmentId },
          select: { name: true },
        });
        // Audit log
        await logAuditEvent({
          userId: authResult.userId,
          userName,
          action: 'LOCK_MONTH',
          entity: 'MONTH',
          entityId: `${apartmentId}:${month}`,
          after: { apartmentId, apartmentName: apt?.name, month, isLocked: true },
          metadata: { investorSnapshots: result.snapshot?.investorSnapshots },
          ipAddress: getClientIP(request),
        });
      }

      return result.success
        ? successResponse({ result: result.snapshot, message: result.message })
        : errorResponse(result.message, 400);
    } else {
      // قفل شهر لجميع الشقق
      const result = await lockMonthForAllApartments(month, authResult.userId);
      
      // Audit log
      await logAuditEvent({
        userId: authResult.userId,
        userName,
        action: 'LOCK_MONTH',
        entity: 'MONTH',
        entityId: month,
        after: { month, allApartments: true, success: result.success, failed: result.failed },
        ipAddress: getClientIP(request),
      });

      return successResponse({
        message: `تم قفل ${result.success} شقة. ${result.alreadyLocked} مقفلة مسبقاً. ${result.failed} فشل.`,
        ...result,
      });
    }
  } else {
    // فتح القفل
    if (!apartmentId) {
      return errorResponse('يجب تحديد الشقة لفتح القفل', 400);
    }

    const result = await unlockMonth(apartmentId, month);

    if (result.success) {
      const unlockApt = await prisma.apartment.findUnique({
        where: { id: apartmentId },
        select: { name: true },
      });
      await logAuditEvent({
        userId: authResult.userId,
        userName,
        action: 'UNLOCK_MONTH',
        entity: 'MONTH',
        entityId: `${apartmentId}:${month}`,
        after: { apartmentId, apartmentName: unlockApt?.name, month, isLocked: false },
        ipAddress: getClientIP(request),
      });
    }

    return result.success
      ? successResponse({ result: result.snapshot, message: result.message })
      : errorResponse(result.message, 400);
  }
}
