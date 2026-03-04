/**
 * API: حالة قفل الأشهر - GET
 * الصلاحيات: canLockMonths أو canViewAllData
 */

import { NextRequest } from 'next/server';
import {
  requireAnyAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';
import { getMonthLockStatus, isMonthLocked } from '@/lib/accounting/month-lock';

// GET /api/accounting/months/status?month=YYYY-MM&apartmentId=...
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth(['canLockMonths', 'canViewAllData']);
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const month = searchParams.get('month');
  const apartmentId = searchParams.get('apartmentId');

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return errorResponse('الشهر مطلوب بصيغة YYYY-MM', 400);
  }

  // إذا طُلب شقة محددة فقط
  if (apartmentId) {
    const locked = await isMonthLocked(apartmentId, month);
    return successResponse({ apartmentId, month, isLocked: locked });
  }

  // حالة جميع الشقق
  const status = await getMonthLockStatus(month);
  return successResponse({ month, ...status });
}
