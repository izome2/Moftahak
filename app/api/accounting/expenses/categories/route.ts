/**
 * API: أقسام المصروفات - GET
 * يُرجع قائمة الأقسام المتاحة مع ترجمة عربية
 */

import { NextRequest } from 'next/server';
import {
  requireAnyAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
} from '@/lib/accounting-auth';

// ترجمة أقسام المصروفات
const EXPENSE_CATEGORY_LABELS: Record<string, string> = {
  CLEANING: 'تنظيف الشقة',
  INTERNET: 'انترنت',
  WATER: 'مياه',
  GAS: 'غاز',
  ELECTRICITY: 'كهرباء',
  MAINTENANCE: 'صيانة',
  SUPPLIES: 'مستلزمات',
  FURNITURE: 'أثاث',
  LAUNDRY: 'غسيل ملاءات',
  TOWELS: 'مناشف حمام',
  KITCHEN_SUPPLIES: 'مستلزمات المطبخ',
  AIR_CONDITIONING: 'تكييف',
  OTHER: 'أخرى',
};

// GET /api/accounting/expenses/categories
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAnyAccountingAuth([
    'canViewExpenses', 'canAddExpenses', 'canViewAllData',
  ]);
  if (authResult.error) return authResult.error;

  const categories = Object.entries(EXPENSE_CATEGORY_LABELS).map(([value, label]) => ({
    value,
    label,
  }));

  return successResponse({ categories });
}
