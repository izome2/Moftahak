import { useCallback, useRef, useState, type CSSProperties } from 'react';

export function useDropdownPosition<T extends HTMLElement = HTMLButtonElement>() {
  const triggerRef = useRef<T>(null);
  const [style] = useState<CSSProperties>({});

  const recalculate = useCallback((_estimatedHeight = 320) => {
  }, []);

  return { triggerRef, style, recalculate };
}
