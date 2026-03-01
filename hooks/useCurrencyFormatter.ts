'use client';

import { useCallback } from 'react';
import { useFeasibilityEditorSafe } from '@/contexts/FeasibilityEditorContext';
import { useViewerCurrency } from '@/components/feasibility/viewer/CurrencyContext';
import { getCurrencySymbol, formatPriceWithCurrency, DEFAULT_CURRENCY, type CurrencyCode } from '@/lib/feasibility/currency';

/**
 * Hook لتنسيق الأسعار مع العملة المحددة في الـ Context
 * يستخدم في جميع مكونات دراسة الجدوى التي تعرض أسعار
 * 
 * يدعم:
 * 1. FeasibilityEditorContext (للمحرر)
 * 2. ViewerCurrencyContext (للعارض)
 * 3. العملة الافتراضية (EGP) كـ fallback
 */
function useCurrencyFormatter() {
  const editor = useFeasibilityEditorSafe();
  const viewerCurrency = useViewerCurrency();
  
  // الأولوية: المحرر > العارض > الافتراضي
  const currency: CurrencyCode = editor?.currency || viewerCurrency || DEFAULT_CURRENCY;

  /**
   * تنسيق السعر مع رمز العملة
   */
  const formatPrice = useCallback((priceInEGP: number): string => {
    return formatPriceWithCurrency(priceInEGP, currency);
  }, [currency]);

  /**
   * الحصول على رمز العملة الحالية
   */
  const currencySymbol = getCurrencySymbol(currency);

  return {
    formatPrice,
    currencySymbol,
    currency,
  };
}

export default useCurrencyFormatter;
