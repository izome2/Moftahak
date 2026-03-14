'use client';

import { useState, useCallback, useRef } from 'react';

/**
 * Makes recharts Tooltip follow the mouse cursor using fixed positioning.
 * Overrides recharts' internal absolute positioning which breaks inside
 * framer-motion containers (transform creates a new containing block).
 */
export function useChartTooltip() {
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const rafRef = useRef(0);

  const onMouseMove = useCallback((e: React.MouseEvent) => {
    const x = e.clientX;
    const y = e.clientY;
    cancelAnimationFrame(rafRef.current);
    rafRef.current = requestAnimationFrame(() => setPos({ x, y }));
  }, []);

  const wrapperStyle: React.CSSProperties = {
    position: 'fixed',
    top: pos.y + 16,
    left: pos.x + 16,
    transform: 'none',
    pointerEvents: 'none',
    zIndex: 9999,
  };

  return { onMouseMove, wrapperStyle };
}
