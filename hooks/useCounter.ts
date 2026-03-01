/**
 * Custom Hook for Counter Animation
 * يوفر أنميشن للأرقام المتزايدة
 */

'use client';

import { useEffect, useState, useRef } from 'react';

interface CounterConfig {
  start?: number;
  end: number;
  duration?: number; // بالميلي ثانية
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  onComplete?: () => void;
}

/**
 * Hook for animated number counter
 * @param config - Counter configuration
 * @param isInView - Whether element is in viewport (trigger)
 * @returns Formatted counter value
 */
export function useCounter(
  config: CounterConfig,
  isInView: boolean = true
): string {
  const {
    start = 0,
    end,
    duration = 2000,
    decimals = 0,
    prefix = '',
    suffix = '',
    separator = ',',
    onComplete
  } = config;

  const [count, setCount] = useState(start);
  const [hasCompleted, setHasCompleted] = useState(false);
  const frameRef = useRef<number>(undefined);
  const startTimeRef = useRef<number>(undefined);

  useEffect(() => {
    if (!isInView || hasCompleted) return;

    const animate = (currentTime: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = currentTime;
      }

      const elapsed = currentTime - startTimeRef.current;
      const progress = Math.min(elapsed / duration, 1);

      // Easing function (easeOutQuart)
      const easeOut = 1 - Math.pow(1 - progress, 4);
      
      const current = start + (end - start) * easeOut;
      setCount(current);

      if (progress < 1) {
        frameRef.current = requestAnimationFrame(animate);
      } else {
        setCount(end);
        setHasCompleted(true);
        onComplete?.();
      }
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, [start, end, duration, isInView, hasCompleted, onComplete]);

  // Format number with separators and decimals
  const formatNumber = (num: number): string => {
    const fixed = num.toFixed(decimals);
    const parts = fixed.split('.');
    const integer = parts[0];
    const decimal = parts[1];

    // Add thousands separator
    const formattedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, separator);

    return decimal ? `${formattedInteger}.${decimal}` : formattedInteger;
  };

  return `${prefix}${formatNumber(count)}${suffix}`;
}

/**
 * Hook for percentage counter (0-100%)
 * @param target - Target percentage
 * @param isInView - Whether element is in viewport
 * @param duration - Animation duration in ms
 * @returns Formatted percentage string
 */
export function usePercentageCounter(
  target: number,
  isInView: boolean = true,
  duration: number = 2000
): string {
  return useCounter(
    {
      start: 0,
      end: target,
      duration,
      decimals: 0,
      suffix: '%'
    },
    isInView
  );
}

/**
 * Hook for currency counter
 * @param target - Target amount
 * @param currency - Currency symbol
 * @param isInView - Whether element is in viewport
 * @param duration - Animation duration in ms
 * @returns Formatted currency string
 */
export function useCurrencyCounter(
  target: number,
  currency: string = '$',
  isInView: boolean = true,
  duration: number = 2000
): string {
  return useCounter(
    {
      start: 0,
      end: target,
      duration,
      decimals: 0,
      prefix: currency,
      separator: ','
    },
    isInView
  );
}
