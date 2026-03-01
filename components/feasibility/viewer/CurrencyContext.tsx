'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { CurrencyCode, DEFAULT_CURRENCY } from '@/lib/feasibility/currency';

/**
 * Context للعملة في عارض الدراسات
 * يستخدم لتمرير العملة المحفوظة مع الدراسة للمكونات الفرعية
 */

interface ViewerCurrencyContextType {
  currency: CurrencyCode;
}

const ViewerCurrencyContext = createContext<ViewerCurrencyContextType | null>(null);

interface ViewerCurrencyProviderProps {
  currency: CurrencyCode;
  children: ReactNode;
}

/**
 * Provider للعملة في العارض
 */
export function ViewerCurrencyProvider({ currency, children }: ViewerCurrencyProviderProps) {
  return (
    <ViewerCurrencyContext.Provider value={{ currency }}>
      {children}
    </ViewerCurrencyContext.Provider>
  );
}

/**
 * Hook للوصول للعملة في العارض
 */
export function useViewerCurrency(): CurrencyCode {
  const context = useContext(ViewerCurrencyContext);
  // إذا لم يكن داخل Provider، نرجع العملة الافتراضية
  return context?.currency || DEFAULT_CURRENCY;
}
