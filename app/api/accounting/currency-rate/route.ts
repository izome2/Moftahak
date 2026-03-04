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

// GET /api/accounting/currency-rate?from=USD&to=EGP
export async function GET(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request);
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingSession();
  if (authResult.error) return authResult.error;

  const { searchParams } = new URL(request.url);
  const fromCurrency = searchParams.get('from') || 'USD';
  const toCurrency = searchParams.get('to') || 'EGP';

  const rate = await prisma.currencyRate.findUnique({
    where: {
      fromCurrency_toCurrency: { fromCurrency, toCurrency },
    },
  });

  return successResponse({
    rate: rate
      ? { fromCurrency: rate.fromCurrency, toCurrency: rate.toCurrency, rate: rate.rate, updatedAt: rate.updatedAt }
      : null,
  });
}

// PUT /api/accounting/currency-rate
export async function PUT(request: NextRequest) {
  const rateLimitError = checkAccountingRateLimit(request, { maxRequests: 10 });
  if (rateLimitError) return rateLimitError;

  const authResult = await requireAccountingAuth('canManageSettings');
  if (authResult.error) return authResult.error;

  const body = await request.json();
  const parsed = updateCurrencyRateSchema.safeParse(body);
  if (!parsed.success) {
    return errorResponse(parsed.error.issues[0]?.message || 'بيانات غير صالحة');
  }

  const rate = await prisma.currencyRate.upsert({
    where: {
      fromCurrency_toCurrency: {
        fromCurrency: parsed.data.fromCurrency ?? 'USD',
        toCurrency: parsed.data.toCurrency ?? 'EGP',
      },
    },
    update: {
      rate: parsed.data.rate,
    },
    create: {
      fromCurrency: parsed.data.fromCurrency ?? 'USD',
      toCurrency: parsed.data.toCurrency ?? 'EGP',
      rate: parsed.data.rate,
    },
  });

  return successResponse({ rate });
}
