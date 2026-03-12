'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string; // YYYY-MM-DD
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const ITEM_H = 44;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2); // 2

const DAYS31 = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS12 = Array.from({ length: 12 }, (_, i) => i + 1);
const YEAR_NOW = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => YEAR_NOW - 5 + i);

// Beige off-white for gradient fade (matches brand --color-white)
const FADE_COLOR = 'rgba(253,246,238,1)';
const FADE_CLEAR = 'rgba(253,246,238,0)';

function getDaysInMonth(m: number, y: number) {
  return new Date(y, m, 0).getDate();
}

// ---------------------------------------------------------------------------
// WheelCol
// ---------------------------------------------------------------------------
interface WheelColProps {
  items: number[];
  selected: number;
  onSelect: (v: number) => void;
  format: (v: number) => string;
}

function WheelCol({ items, selected, onSelect, format }: WheelColProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const programmatic = useRef(false);

  // Instant scroll on mount / external change
  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx === -1) return;
    programmatic.current = true;
    el.scrollTop = idx * ITEM_H;
    // allow onScroll to fire without triggering snap logic
    setTimeout(() => { programmatic.current = false; }, 60);
  }, [selected, items]);

  const snapToNearest = useCallback(() => {
    const el = listRef.current;
    if (!el) return;
    const idx = Math.round(el.scrollTop / ITEM_H);
    const clamped = Math.max(0, Math.min(idx, items.length - 1));
    el.scrollTo({ top: clamped * ITEM_H, behavior: 'smooth' });
    if (items[clamped] !== selected) onSelect(items[clamped]);
  }, [items, selected, onSelect]);

  const handleScroll = () => {
    if (programmatic.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(snapToNearest, 80);
  };

  const handleClick = (v: number) => {
    onSelect(v);
    const idx = items.indexOf(v);
    listRef.current?.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_H * VISIBLE }}>
      {/* top fade */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        style={{ height: PAD * ITEM_H, background: `linear-gradient(to bottom, ${FADE_COLOR}, ${FADE_CLEAR})` }}
      />
      {/* bottom fade */}
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{ height: PAD * ITEM_H, background: `linear-gradient(to top, ${FADE_COLOR}, ${FADE_CLEAR})` }}
      />
      {/* center highlight band */}
      <div
        className="pointer-events-none absolute inset-x-1 z-10 rounded-xl border border-primary/40 bg-primary/12"
        style={{ top: PAD * ITEM_H, height: ITEM_H }}
      />
      {/* scroll list */}
      <div
        ref={listRef}
        onScroll={handleScroll}
        className="h-full overflow-y-scroll scrollbar-hide"
        style={{
          scrollSnapType: 'y mandatory',
          paddingTop: PAD * ITEM_H,
          paddingBottom: PAD * ITEM_H,
        }}
      >
        {items.map(item => {
          const isSel = item === selected;
          return (
            <div
              key={item}
              onClick={() => handleClick(item)}
              className="flex items-center justify-center cursor-pointer select-none transition-all duration-100 font-dubai"
              style={{
                height: ITEM_H,
                scrollSnapAlign: 'start',
                fontSize: isSel ? 17 : 14,
                fontWeight: isSel ? 700 : 400,
                color: isSel ? 'var(--color-secondary, #10302b)' : 'rgba(16,48,43,0.28)',
              }}
            >
              {format(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// DatePicker
// ---------------------------------------------------------------------------
const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  placeholder,
  required,
  className = '',
}) => {
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  const locale = isRTL ? 'ar-EG-u-nu-arab' : 'en-US';

  const [isOpen, setIsOpen] = useState(false);
  const [rect, setRect] = useState<DOMRect | null>(null);
  const [mounted, setMounted] = useState(false);

  const triggerRef = useRef<HTMLButtonElement>(null);
  const popupRef = useRef<HTMLDivElement>(null);

  // Parse value → internal state (default today)
  const today = new Date();
  const initParts = (v: string | undefined) => {
    if (v) {
      const p = v.split('-').map(Number);
      if (p.length === 3) return { y: p[0], m: p[1], d: p[2] };
    }
    return { y: today.getFullYear(), m: today.getMonth() + 1, d: today.getDate() };
  };

  const [selYear, setSelYear] = useState(() => initParts(value).y);
  const [selMonth, setSelMonth] = useState(() => initParts(value).m);
  const [selDay, setSelDay] = useState(() => initParts(value).d);

  // Sync when value changes externally
  useEffect(() => {
    const { y, m, d } = initParts(value);
    setSelYear(y); setSelMonth(m); setSelDay(d);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  // Clamp day when month/year changes
  useEffect(() => {
    const max = getDaysInMonth(selMonth, selYear);
    if (selDay > max) setSelDay(max);
  }, [selMonth, selYear, selDay]);

  // Portal mount guard
  useEffect(() => { setMounted(true); }, []);

  // Open → capture trigger rect
  const openPicker = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setIsOpen(true);
  };

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handle = (e: MouseEvent) => {
      if (
        popupRef.current?.contains(e.target as Node) ||
        triggerRef.current?.contains(e.target as Node)
      ) return;
      setIsOpen(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, [isOpen]);

  const handleConfirm = () => {
    const max = getDaysInMonth(selMonth, selYear);
    const d = Math.min(selDay, max);
    const str = `${selYear}-${String(selMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    if (minDate && str < minDate) return;
    onChange(str);
    setIsOpen(false);
  };

  // Display
  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString(locale, { year: 'numeric', month: 'short', day: 'numeric' })
    : '';

  const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthNames = isRTL ? AR_MONTHS : EN_MONTHS;

  const fmtDay   = (d: number) => new Intl.NumberFormat(locale).format(d);
  const fmtMonth = (m: number) => monthNames[m - 1];
  const fmtYear  = (y: number) => new Intl.NumberFormat(locale, { useGrouping: false }).format(y);

  const filteredDays = DAYS31.filter(d => d <= getDaysInMonth(selMonth, selYear));

  // Popup position: below trigger, constrained to viewport
  const popupStyle: React.CSSProperties = { position: 'fixed', zIndex: 9999, width: 300 };
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    if (spaceBelow >= 360) {
      popupStyle.top = rect.bottom + 8;
    } else {
      popupStyle.bottom = window.innerHeight - rect.top + 8;
    }
    // align right edge to trigger right edge (RTL-friendly)
    const left = rect.right - 300;
    popupStyle.left = Math.max(8, Math.min(left, window.innerWidth - 308));
  }

  const confirmLabel = isRTL ? 'تأكيد' : 'Confirm';
  const headerLabel  = placeholder || (isRTL ? 'اختر التاريخ' : 'Select date');

  const popup = (
    <div
      ref={popupRef}
      style={popupStyle}
      className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(16,48,43,0.18)] border border-primary/30"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-primary/15"
        style={{ background: 'linear-gradient(135deg, #fdf6ee 0%, #f5e8d4 100%)' }}>
        <span className="text-sm font-bold text-secondary font-dubai">{headerLabel}</span>
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="w-6 h-6 flex items-center justify-center rounded-lg hover:bg-primary/15 transition-colors text-secondary/50 text-lg leading-none"
        >
          ×
        </button>
      </div>

      {/* Wheels container */}
      <div
        className="flex gap-0 px-3 py-1"
        dir="ltr"
        style={{ background: FADE_COLOR }}
      >
        <WheelCol items={filteredDays} selected={selDay}   onSelect={setSelDay}   format={fmtDay} />
        <div className="w-px mx-1 bg-primary/15 self-stretch my-3" />
        <WheelCol items={MONTHS12}    selected={selMonth} onSelect={setSelMonth} format={fmtMonth} />
        <div className="w-px mx-1 bg-primary/15 self-stretch my-3" />
        <WheelCol items={YEARS}       selected={selYear}  onSelect={setSelYear}  format={fmtYear} />
      </div>

      {/* Confirm btn */}
      <div className="px-4 pb-4 pt-1" style={{ background: FADE_COLOR }}>
        <button
          type="button"
          onClick={handleConfirm}
          className="w-full py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );

  return (
    <div className="relative">
      {/* Hidden native input for form validation */}
      <input type="hidden" value={value} required={required} />

      {/* Trigger */}
      <button
        ref={triggerRef}
        type="button"
        onClick={openPicker}
        className={`w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm flex items-center gap-2 focus:outline-none focus:border-primary transition-colors ${
          isOpen ? 'border-primary' : ''
        } ${className}`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        <Calendar size={15} className="text-secondary/40 flex-shrink-0" />
        <span className={`flex-1 text-right ${!value ? 'text-secondary/35' : ''}`}>
          {displayValue || placeholder || (isRTL ? 'اختر التاريخ' : 'Select date')}
        </span>
      </button>

      {/* Portal popup */}
      {mounted && isOpen && createPortal(popup, document.body)}
    </div>
  );
};

export default DatePicker;

