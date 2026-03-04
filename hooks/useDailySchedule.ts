'use client';

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook: حساب التاريخ المستهدف لجدول المتابعة اليومية
 * - قبل الساعة 7 مساءً → عرض بيانات اليوم الحالي
 * - بعد الساعة 7 مساءً → عرض بيانات اليوم التالي
 * - تحديث تلقائي كل دقيقة
 */

const formatDate = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const computeTargetDate = (): Date => {
  const now = new Date();
  if (now.getHours() >= 19) {
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(0, 0, 0, 0);
    return tomorrow;
  }
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  return today;
};

export function useDailySchedule() {
  const [targetDate, setTargetDate] = useState<Date>(computeTargetDate);
  const [manualDate, setManualDate] = useState<string | null>(null);

  // Auto-update every minute
  useEffect(() => {
    if (manualDate) return; // skip auto if manual override

    const interval = setInterval(() => {
      const newDate = computeTargetDate();
      setTargetDate(prev => {
        if (formatDate(prev) !== formatDate(newDate)) return newDate;
        return prev;
      });
    }, 60_000);
    return () => clearInterval(interval);
  }, [manualDate]);

  // Manual date navigation
  const goToDate = useCallback((dateStr: string) => {
    setManualDate(dateStr);
    const d = new Date(dateStr);
    d.setHours(0, 0, 0, 0);
    setTargetDate(d);
  }, []);

  // Reset to auto
  const resetToAuto = useCallback(() => {
    setManualDate(null);
    setTargetDate(computeTargetDate());
  }, []);

  // Navigate ±1 day
  const goNextDay = useCallback(() => {
    setTargetDate(prev => {
      const next = new Date(prev);
      next.setDate(next.getDate() + 1);
      setManualDate(formatDate(next));
      return next;
    });
  }, []);

  const goPrevDay = useCallback(() => {
    setTargetDate(prev => {
      const prev2 = new Date(prev);
      prev2.setDate(prev2.getDate() - 1);
      setManualDate(formatDate(prev2));
      return prev2;
    });
  }, []);

  const isAuto = manualDate === null;
  const isAfter7PM = new Date().getHours() >= 19;

  return {
    targetDate,
    dateString: formatDate(targetDate),
    isAuto,
    isAfter7PM,
    goToDate,
    goNextDay,
    goPrevDay,
    resetToAuto,
  };
}
