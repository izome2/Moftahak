/**
 * API: سعر الصرف - GET / PUT
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
import { updateCurrencyRateSchema } from '@/lib/validations/accounting';

// GET /api/accounting/currency-rate?from=USD&to=EGP&month=2026-04
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const fromCurrency = searchParams.get('from') || 'USD';
  const toCurrency = searchParams.get('to') || 'EGP';
  const month = searchParams.get('month');

  if (!month || !/^\d{4}-\d{2}$/.test(month)) {
    return errorResponse('الشهر مطلوب بصيغة YYYY-MM');
  }

  try {
    const rate = await prisma.currencyRate.findUnique({
      where: {
        fromCurrency_toCurrency_month: { fromCurrency, toCurrency, month },
      },
    });

    return successResponse({
      rate: rate
        ? { fromCurrency: rate.fromCurrency, toCurrency: rate.toCurrency, rate: rate.rate, month: rate.month, updatedAt: rate.updatedAt }
        : null,
    });
  } catch (error) {
    console.error('[currency-rate GET] Error:', error);
    return errorResponse('فشل جلب سعر الصرف', 500);
  }
}

// PUT /api/accounting/currency-rate
export async function PUT(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageSettings');
  if (authResult.error) return authResult.error;

  try {
    const body = await request.json();
    const parsed = updateCurrencyRateSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
    }

    const fromCurrency = parsed.data.fromCurrency ?? 'USD';
    const toCurrency = parsed.data.toCurrency ?? 'EGP';
    const month = parsed.data.month;

    const rate = await prisma.currencyRate.upsert({
      where: {
        fromCurrency_toCurrency_month: {
          fromCurrency,
          toCurrency,
          month,
        },
      },
      update: {
        rate: parsed.data.rate,
      },
      create: {
        fromCurrency,
        toCurrency,
        rate: parsed.data.rate,
        month,
      },
    });

    return successResponse({ rate });
  } catch (error) {
    console.error('[currency-rate PUT] Error:', error);
    return errorResponse('فشل حفظ سعر الصرف', 500);
  }
}
