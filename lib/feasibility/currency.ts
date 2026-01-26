/**
 * نظام العملات لدراسة الجدوى
 * Currency System for Feasibility Studies
 * 
 * يقوم بتغيير رمز العملة فقط (بدون تحويل الأرقام)
 */

// أنواع العملات المدعومة
export type CurrencyCode = 'EGP' | 'SAR' | 'USD';

// تعريف العملة
export interface Currency {
  code: CurrencyCode;
  symbol: string;
  nameAr: string;
  nameEn: string;
}

// قائمة العملات المدعومة
export const CURRENCIES: Record<CurrencyCode, Currency> = {
  EGP: {
    code: 'EGP',
    symbol: 'ج.م',
    nameAr: 'جنيه مصري',
    nameEn: 'Egyptian Pound',
  },
  SAR: {
    code: 'SAR',
    symbol: 'ر.س',
    nameAr: 'ريال سعودي',
    nameEn: 'Saudi Riyal',
  },
  USD: {
    code: 'USD',
    symbol: '$',
    nameAr: 'دولار أمريكي',
    nameEn: 'US Dollar',
  },
};

// العملة الافتراضية
export const DEFAULT_CURRENCY: CurrencyCode = 'EGP';

// قائمة العملات كمصفوفة للاستخدام في القوائم المنسدلة
export const CURRENCY_LIST: Currency[] = Object.values(CURRENCIES);

/**
 * الحصول على رمز العملة
 */
export function getCurrencySymbol(code: CurrencyCode): string {
  return CURRENCIES[code]?.symbol || CURRENCIES.EGP.symbol;
}

/**
 * الحصول على اسم العملة بالعربية
 */
export function getCurrencyNameAr(code: CurrencyCode): string {
  return CURRENCIES[code]?.nameAr || CURRENCIES.EGP.nameAr;
}

/**
 * الحصول على بيانات العملة كاملة
 */
export function getCurrency(code: CurrencyCode): Currency {
  return CURRENCIES[code] || CURRENCIES.EGP;
}

/**
 * تنسيق السعر مع العملة
 * ملاحظة: لا يتم تحويل القيمة، فقط يتم تغيير الرمز
 */
export function formatPriceWithCurrency(price: number, currencyCode: CurrencyCode = 'EGP'): string {
  const formattedPrice = price.toLocaleString('ar-EG');
  const symbol = getCurrencySymbol(currencyCode);
  
  // الدولار يأتي قبل الرقم، العملات العربية بعده
  if (currencyCode === 'USD') {
    return `${symbol}${formattedPrice}`;
  }
  
  return `${formattedPrice} ${symbol}`;
}

/**
 * تنسيق السعر مع رمز العملة فقط (بدون موضع خاص)
 */
export function formatPriceWithSymbol(price: number, currencyCode: CurrencyCode = 'EGP'): {
  formattedPrice: string;
  symbol: string;
} {
  return {
    formattedPrice: price.toLocaleString('ar-EG'),
    symbol: getCurrencySymbol(currencyCode),
  };
}

export default {
  CURRENCIES,
  CURRENCY_LIST,
  DEFAULT_CURRENCY,
  getCurrencySymbol,
  getCurrencyNameAr,
  getCurrency,
  formatPriceWithCurrency,
  formatPriceWithSymbol,
};
