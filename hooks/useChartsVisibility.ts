'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'accounting-charts-visible';

export function useChartsVisibility() {
  const [showCharts, setShowCharts] = useState(true);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored !== null) setShowCharts(stored === '1');
    } catch { /* SSR / private browsing */ }
    setLoaded(true);
  }, []);

  const toggleCharts = useCallback(() => {
    setShowCharts(prev => {
      const next = !prev;
      try { localStorage.setItem(STORAGE_KEY, next ? '1' : '0'); } catch {}
      return next;
    });
  }, []);

  return { showCharts: loaded ? showCharts : true, toggleCharts };
}
