'use client';

import { useCallback, useRef } from 'react';

/**
 * Makes recharts Tooltip follow the mouse cursor using fixed positioning.
 * Uses ref-based updates to avoid re-renders for smooth tracking.
 * Components should spread wrapperStyle on Tooltip and onMouseMove on container.
 */
export function useChartTooltip() {
  const posRef = useRef({ x: 0, y: 0 });

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    posRef.current = { x: e.clientX, y: e.clientY };
    // Directly update all tooltip wrappers in this chart
    const container = e.currentTarget;
    const wrapper = container.querySelector('.recharts-tooltip-wrapper') as HTMLElement;
    if (wrapper) {
      wrapper.style.position = 'fixed';
      wrapper.style.top = `${e.clientY + 14}px`;
      wrapper.style.left = `${e.clientX + 14}px`;
      wrapper.style.transform = 'none';
      wrapper.style.pointerEvents = 'none';
      wrapper.style.zIndex = '9999';
      wrapper.style.visibility = 'visible';
    }
  }, []);

  const wrapperStyle: React.CSSProperties = {
    position: 'fixed',
    top: 0,
    left: 0,
    transform: 'none',
    pointerEvents: 'none',
    zIndex: 9999,
    transition: 'none',
  };

  return { onMouseMove, wrapperStyle };
}
