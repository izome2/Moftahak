/**
 * Currency & FX Layer - طبقة العملات وسعر الصرف
 * ⚡ تحويل المبالغ من عملات مختلفة إلى العملة الأساسية
 * يُستخدم في حسابات الملخص الشهري وأرباح المستثمرين
 */

import { prisma } from '@/lib/prisma';

// ============================================================================
// Configuration
// ============================================================================

/** العملة الأساسية - كل الحسابات تتم بهذه العملة */
const DEFAULT_BASE_CURRENCY = 'USD';

/** Cache لأسعار الصرف (يُحدّث كل 5 دقائق) */
let rateCache: Map<string, number> = new Map();
let rateCacheExpiry = 0;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/** Custom error for missing exchange rates */
export class MissingExchangeRateError extends Error {
  constructor(from: string, to: string) {
    super(`Missing exchange rate: ${from} → ${to}. Please configure it in Settings > Exchange Rates.`);
    this.name = 'MissingExchangeRateError';
  }
}

// ============================================================================
// Core Functions
// ============================================================================

/**
 * جلب أسعار الصرف من قاعدة البيانات (مع cache)
 */
async function loadExchangeRates(): Promise<Map<string, number>> {
  const now = Date.now();
  if (rateCache.size > 0 && now < rateCacheExpiry) {
    return rateCache;
  }

  const rates = await prisma.currencyRate.findMany();
  const newCache = new Map<string, number>();

  for (const rate of rates) {
    const monthKey = rate.month || 'default';
    // Store both directions with month
    const forwardKey = `${rate.fromCurrency}->${rate.toCurrency}@${monthKey}`;
    const reverseKey = `${rate.toCurrency}->${rate.fromCurrency}@${monthKey}`;
    newCache.set(forwardKey, rate.rate);
    newCache.set(reverseKey, 1 / rate.rate);
  }

  rateCache = newCache;
  rateCacheExpiry = now + CACHE_TTL;

  return newCache;
}

/**
 * جلب سعر الصرف بين عملتين
 * يبحث أولاً عن سعر خاص بالشهر، ثم يرجع للسعر الافتراضي
 * @param month - الشهر بصيغة "YYYY-MM" (اختياري)
 * @returns سعر الصرف أو 1 إذا كانت نفس العملة
 * @returns null إذا لم يتم العثور على سعر صرف
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string,
  month?: string
): Promise<number | null> {
  if (fromCurrency === toCurrency) return 1;

  const rates = await loadExchangeRates();
  
  // Try month-specific rate
  if (month) {
    const monthKey = `${fromCurrency}->${toCurrency}@${month}`;
    const monthRate = rates.get(monthKey);
    if (monthRate !== undefined) return monthRate;
  }
  
  // Try to find any rate (latest first) as fallback
  // This handles calls without a month parameter
  for (const [key, val] of rates) {
    if (key.startsWith(`${fromCurrency}->${toCurrency}@`)) return val;
  }
  
  return null;
}

/**
 * تحويل مبلغ من عملة إلى العملة الأساسية
 * إذا لم يتوفر سعر صرف، يُرجع المبلغ الأصلي مع تحذير
 * 
 * @param amount - المبلغ الأصلي
 * @param currency - عملة المبلغ
 * @param baseCurrency - العملة الأساسية (الافتراضي: USD)
 * @param month - الشهر بصيغة "YYYY-MM" (اختياري - لاستخدام سعر الشهر)
 * @returns المبلغ بالعملة الأساسية
 */
export async function convertToBaseCurrency(
  amount: number,
  currency: string,
  baseCurrency: string = DEFAULT_BASE_CURRENCY,
  month?: string
): Promise<number> {
  if (currency === baseCurrency) return amount;

  const rate = await getExchangeRate(currency, baseCurrency, month);
  
  if (rate === null) {
    console.error(
      `[FX] ⚠️ No exchange rate found for ${currency} → ${baseCurrency}${month ? ` (month: ${month})` : ''}. ` +
      `Amount ${amount} ${currency} returned as-is. Configure the rate in Settings > Exchange Rates.`
    );
    return amount;
  }

  return amount * rate;
}

/**
 * تحويل مجموعة مبالغ بعملات مختلفة وجمعها
 * أكثر كفاءة من استدعاء convertToBaseCurrency عدة مرات
 * 
 * @param items - مصفوفة من {amount, currency}
 * @param baseCurrency - العملة الأساسية
 * @param month - الشهر بصيغة "YYYY-MM" (اختياري - لاستخدام سعر الشهر)
 * @returns المجموع بالعملة الأساسية
 */
export async function sumInBaseCurrency(
  items: { amount: number; currency: string }[],
  baseCurrency: string = DEFAULT_BASE_CURRENCY,
  month?: string
): Promise<number> {
  if (items.length === 0) return 0;

  // Fast path: all same currency
  const allSameCurrency = items.every(i => i.currency === baseCurrency);
  if (allSameCurrency) {
    return items.reduce((sum, i) => sum + i.amount, 0);
  }

  // Load rates once
  await loadExchangeRates();

  let total = 0;
  for (const item of items) {
    if (item.currency === baseCurrency) {
      total += item.amount;
    } else {
      const rate = await getExchangeRate(item.currency, baseCurrency, month);
      if (rate === null) {
        console.error(
          `[FX] ⚠️ Missing rate for ${item.currency} → ${baseCurrency}${month ? ` (month: ${month})` : ''}. ` +
          `Amount ${item.amount} ${item.currency} added without conversion.`
        );
      }
      total += rate !== null ? item.amount * rate : item.amount;
    }
  }

  return total;
}

/**
 * جلب العملة الأساسية من إعدادات النظام
 * الافتراضي: USD
 */
export async function getBaseCurrency(): Promise<string> {
  try {
    const setting = await prisma.systemSetting.findUnique({
      where: { key: 'base_currency' },
    });
    if (setting && typeof setting.value === 'string') {
      return setting.value;
    }
    // If stored as JSON object
    if (setting && typeof setting.value === 'object' && setting.value !== null) {
      const val = setting.value as { currency?: string };
      return val.currency ?? DEFAULT_BASE_CURRENCY;
    }
  } catch {
    // Ignore - use default
  }
  return DEFAULT_BASE_CURRENCY;
}

/**
 * إعادة تعيين cache أسعار الصرف
 * يُستدعى عند تحديث سعر صرف من Settings
 */
export function invalidateRateCache(): void {
  rateCache.clear();
  rateCacheExpiry = 0;
}

/**
 * جلب كل أسعار الصرف المحفوظة
 */
export async function getAllExchangeRates(): Promise<{
  fromCurrency: string;
  toCurrency: string;
  rate: number;
  updatedAt: Date;
}[]> {
  return prisma.currencyRate.findMany({
    orderBy: { fromCurrency: 'asc' },
  });
}
