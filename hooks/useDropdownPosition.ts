import { useCallback, useRef, useState, type CSSProperties } from 'react';

const SAFE_MARGIN = 12;

/**
 * هوك لحساب موقع القائمة المنسدلة داخل الشاشة تلقائياً
 * يستخدم fixed positioning لضمان بقاء القائمة داخل الـ viewport
 */
export function useDropdownPosition() {
  const triggerRef = useRef<HTMLButtonElement | HTMLDivElement>(null);
  const [style, setStyle] = useState<CSSProperties>({});

  const recalculate = useCallback((estimatedHeight = 320) => {
    const el = triggerRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const vh = window.innerHeight;
    const vw = window.innerWidth;
    const result: CSSProperties = { position: 'fixed', zIndex: 300 };

    // عمودياً
    const spaceBelow = vh - rect.bottom - SAFE_MARGIN;
    const spaceAbove = rect.top - SAFE_MARGIN;

    if (spaceBelow >= estimatedHeight) {
      result.top = rect.bottom + 8;
      result.maxHeight = spaceBelow;
    } else if (spaceAbove >= estimatedHeight) {
      result.bottom = vh - rect.top + 8;
      result.maxHeight = spaceAbove;
    } else if (spaceBelow >= spaceAbove) {
      result.top = rect.bottom + 8;
      result.maxHeight = spaceBelow;
    } else {
      result.bottom = vh - rect.top + 8;
      result.maxHeight = spaceAbove;
    }

    // أفقياً - محاذاة مع نهاية الزر ومنع الخروج
    const dropdownW = Math.min(260, vw - SAFE_MARGIN * 2);
    let left = rect.right - dropdownW;
    if (left < SAFE_MARGIN) left = SAFE_MARGIN;
    if (left + dropdownW > vw - SAFE_MARGIN) left = vw - SAFE_MARGIN - dropdownW;
    result.left = left;
    result.width = dropdownW;

    setStyle(result);
  }, []);

  return { triggerRef, style, recalculate };
}
