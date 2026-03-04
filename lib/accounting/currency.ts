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
    // Store both directions
    const forwardKey = `${rate.fromCurrency}->${rate.toCurrency}`;
    const reverseKey = `${rate.toCurrency}->${rate.fromCurrency}`;
    newCache.set(forwardKey, rate.rate);
    newCache.set(reverseKey, 1 / rate.rate);
  }

  rateCache = newCache;
  rateCacheExpiry = now + CACHE_TTL;

  return newCache;
}

/**
 * جلب سعر الصرف بين عملتين
 * @returns سعر الصرف أو 1 إذا كانت نفس العملة
 * @returns null إذا لم يتم العثور على سعر صرف
 */
export async function getExchangeRate(
  fromCurrency: string,
  toCurrency: string
): Promise<number | null> {
  if (fromCurrency === toCurrency) return 1;

  const rates = await loadExchangeRates();
  const key = `${fromCurrency}->${toCurrency}`;

  return rates.get(key) ?? null;
}

/**
 * تحويل مبلغ من عملة إلى العملة الأساسية
 * إذا لم يتوفر سعر صرف، يُرجع المبلغ الأصلي مع تحذير
 * 
 * @param amount - المبلغ الأصلي
 * @param currency - عملة المبلغ
 * @param baseCurrency - العملة الأساسية (الافتراضي: USD)
 * @returns المبلغ بالعملة الأساسية
 */
export async function convertToBaseCurrency(
  amount: number,
  currency: string,
  baseCurrency: string = DEFAULT_BASE_CURRENCY
): Promise<number> {
  if (currency === baseCurrency) return amount;

  const rate = await getExchangeRate(currency, baseCurrency);
  
  if (rate === null) {
    console.warn(
      `[FX] No exchange rate found for ${currency} → ${baseCurrency}. Using 1:1 ratio.`
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
 * @returns المجموع بالعملة الأساسية
 */
export async function sumInBaseCurrency(
  items: { amount: number; currency: string }[],
  baseCurrency: string = DEFAULT_BASE_CURRENCY
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
      const rate = await getExchangeRate(item.currency, baseCurrency);
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
