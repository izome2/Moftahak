/**
 * API: إعدادات المشرفين - GET / PUT
 * قائمة المشرفين المتاحين للاختيار في المتابعة اليومية
 * الصلاحيات: canManageSettings (تعديل) / أي دور حسابات (عرض)
 */

import { NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import {
  requireAccountingSession,
  requireAccountingAuth,
  checkAccountingRateLimit,
  successResponse,
  errorResponse,
} from '@/lib/accounting-auth';

const SETTING_KEY = 'supervisors';

const DEFAULT_SUPERVISORS: string[] = [];

// GET /api/accounting/settings/supervisors
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const setting = await prisma.systemSetting.findUnique({
    where: { key: SETTING_KEY },
  });

  const supervisors = setting
    ? (setting.value as string[])
    : DEFAULT_SUPERVISORS;

  return successResponse({ supervisors });
}

// PUT /api/accounting/settings/supervisors
export async function PUT(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageSettings');
  if (authResult.error) return authResult.error;

  const body = await request.json();

  if (!body.supervisors || !Array.isArray(body.supervisors)) {
    return errorResponse('قائمة المشرفين مطلوبة');
  }

  const supervisors = body.supervisors
    .map((s: unknown) => typeof s === 'string' ? s.trim() : '')
    .filter((s: string) => s.length > 0);

  if (supervisors.length === 0) {
    return errorResponse('يجب إضافة مشرف واحد على الأقل');
  }

  const setting = await prisma.systemSetting.upsert({
    where: { key: SETTING_KEY },
    update: { value: supervisors },
    create: { key: SETTING_KEY, value: supervisors },
  });

  return successResponse({ supervisors: setting.value });
}
