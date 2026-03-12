'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { Calendar } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string; // YYYY-MM-DD
  blockPastDates?: boolean; // hide past days/months/years from wheels
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const ITEM_H = 32;
const VISIBLE = 5;
const PAD = Math.floor(VISIBLE / 2); // 2

const DAYS31 = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS12 = Array.from({ length: 12 }, (_, i) => i + 1);
const YEAR_NOW = new Date().getFullYear();
const YEARS_ALL = Array.from({ length: 11 }, (_, i) => YEAR_NOW - 5 + i);
const YEARS_FUTURE = Array.from({ length: 6 }, (_, i) => YEAR_NOW + i);

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

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const idx = items.indexOf(selected);
    if (idx === -1) return;
    programmatic.current = true;
    el.scrollTop = idx * ITEM_H;
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
    programmatic.current = true;
    onSelect(v);
    const idx = items.indexOf(v);
    if (idx !== -1 && listRef.current) {
      listRef.current.scrollTo({ top: idx * ITEM_H, behavior: 'smooth' });
    }
    setTimeout(() => { programmatic.current = false; }, 300);
  };

  // Gradual opacity based on distance from selected
  const getItemStyle = (item: number): React.CSSProperties => {
    const selIdx = items.indexOf(selected);
    const curIdx = items.indexOf(item);
    const dist = Math.abs(curIdx - selIdx);
    const isSel = dist === 0;
    // opacity: selected=1, dist1=0.45, dist2+=0.18
    const alpha = isSel ? 1 : Math.max(0.12, 0.55 - dist * 0.2);
    return {
      height: ITEM_H,
      scrollSnapAlign: 'start' as const,
      fontSize: isSel ? 15 : 12.5,
      fontWeight: isSel ? 700 : 400,
      color: isSel
        ? 'var(--color-secondary, #10302b)'
        : `rgba(16,48,43,${alpha})`,
    };
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_H * VISIBLE }}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 z-20"
        style={{ height: PAD * ITEM_H, background: `linear-gradient(to bottom, ${FADE_COLOR}, ${FADE_CLEAR})` }}
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 z-20"
        style={{ height: PAD * ITEM_H, background: `linear-gradient(to top, ${FADE_COLOR}, ${FADE_CLEAR})` }}
      />
      <div
        className="pointer-events-none absolute inset-x-1 z-10 rounded-lg border border-primary/35 bg-primary/10"
        style={{ top: PAD * ITEM_H, height: ITEM_H }}
      />
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
        {items.map(item => (
          <div
            key={item}
            onClick={() => handleClick(item)}
            className="flex items-center justify-center cursor-pointer select-none transition-all duration-100 font-dubai"
            style={getItemStyle(item)}
          >
            {format(item)}
          </div>
        ))}
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
  blockPastDates = false,
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

  // Auto-apply date whenever selection changes
  const applyRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(applyRef.current);
    applyRef.current = setTimeout(() => {
      const max = getDaysInMonth(selMonth, selYear);
      const d = Math.min(selDay, max);
      const str = `${selYear}-${String(selMonth).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      if (minDate && str < minDate) return;
      onChange(str);
    }, 200);
    return () => clearTimeout(applyRef.current);
  }, [selDay, selMonth, selYear, isOpen, minDate, onChange]);

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

  // Filter items based on blockPastDates
  const nowD = new Date();
  const nowYear = nowD.getFullYear();
  const nowMonth = nowD.getMonth() + 1;
  const nowDay = nowD.getDate();

  const filteredYears = blockPastDates ? YEARS_FUTURE : YEARS_ALL;
  const filteredMonths = blockPastDates && selYear === nowYear
    ? MONTHS12.filter(m => m >= nowMonth)
    : MONTHS12;
  const maxDaysInMonth = getDaysInMonth(selMonth, selYear);
  const filteredDays = DAYS31.filter(d => {
    if (d > maxDaysInMonth) return false;
    if (blockPastDates && selYear === nowYear && selMonth === nowMonth && d < nowDay) return false;
    return true;
  });

  // Clamp selection when blockPastDates is on
  useEffect(() => {
    if (blockPastDates && selYear < nowYear) setSelYear(nowYear);
  }, [selYear, nowYear, blockPastDates]);
  useEffect(() => {
    if (blockPastDates && selYear === nowYear && selMonth < nowMonth) setSelMonth(nowMonth);
  }, [selYear, selMonth, nowYear, nowMonth, blockPastDates]);
  useEffect(() => {
    if (blockPastDates && selYear === nowYear && selMonth === nowMonth && selDay < nowDay) setSelDay(nowDay);
  }, [selYear, selMonth, selDay, nowYear, nowMonth, nowDay, blockPastDates]);

  // Popup position: centered below trigger, constrained to viewport
  const POPUP_W = 260;
  const popupStyle: React.CSSProperties = { position: 'fixed', zIndex: 9999, width: POPUP_W };
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    if (spaceBelow >= 160) {
      popupStyle.top = rect.bottom + 6;
    } else {
      popupStyle.bottom = window.innerHeight - rect.top + 6;
    }
    // center popup under trigger
    const centerLeft = rect.left + rect.width / 2 - POPUP_W / 2;
    popupStyle.left = Math.max(8, Math.min(centerLeft, window.innerWidth - POPUP_W - 8));
  }

  const popup = (
    <div
      ref={popupRef}
      style={popupStyle}
      className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(16,48,43,0.18)] border border-primary/30"
    >
      {/* Wheels container */}
      <div
        className="flex gap-0 px-3 py-2"
        dir="ltr"
        style={{ background: FADE_COLOR }}
      >
        <WheelCol items={filteredDays}   selected={selDay}   onSelect={setSelDay}   format={fmtDay} />
        <div className="w-px mx-1 bg-primary/15 self-stretch my-1" />
        <WheelCol items={filteredMonths} selected={selMonth} onSelect={setSelMonth} format={fmtMonth} />
        <div className="w-px mx-1 bg-primary/15 self-stretch my-1" />
        <WheelCol items={filteredYears}  selected={selYear}  onSelect={setSelYear}  format={fmtYear} />
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

// ---------------------------------------------------------------------------
// MonthPicker  (YYYY-MM only)
// ---------------------------------------------------------------------------
interface MonthPickerProps {
  value: string; // YYYY-MM
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  className?: string;
}

export const MonthPicker: React.FC<MonthPickerProps> = ({
  value,
  onChange,
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

  const initParts = (v: string | undefined) => {
    if (v) {
      const p = v.split('-').map(Number);
      if (p.length >= 2) return { y: p[0], m: p[1] };
    }
    const now = new Date();
    return { y: now.getFullYear(), m: now.getMonth() + 1 };
  };

  const [selYear, setSelYear] = useState(() => initParts(value).y);
  const [selMonth, setSelMonth] = useState(() => initParts(value).m);

  useEffect(() => {
    const { y, m } = initParts(value);
    setSelYear(y); setSelMonth(m);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  useEffect(() => { setMounted(true); }, []);

  // Auto-apply
  const applyRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => {
    if (!isOpen) return;
    clearTimeout(applyRef.current);
    applyRef.current = setTimeout(() => {
      const str = `${selYear}-${String(selMonth).padStart(2, '0')}`;
      onChange(str);
    }, 200);
    return () => clearTimeout(applyRef.current);
  }, [selMonth, selYear, isOpen, onChange]);

  const openPicker = () => {
    if (triggerRef.current) setRect(triggerRef.current.getBoundingClientRect());
    setIsOpen(true);
  };

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

  const AR_MONTHS = ['يناير','فبراير','مارس','أبريل','مايو','يونيو','يوليو','أغسطس','سبتمبر','أكتوبر','نوفمبر','ديسمبر'];
  const EN_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const monthNames = isRTL ? AR_MONTHS : EN_MONTHS;
  const fmtMonth = (m: number) => monthNames[m - 1];
  const fmtYear = (y: number) => new Intl.NumberFormat(locale, { useGrouping: false }).format(y);

  const displayValue = value
    ? (() => {
        const [y, m] = value.split('-').map(Number);
        return `${monthNames[m - 1]} ${fmtYear(y)}`;
      })()
    : '';

  const POPUP_W = 200;
  const popupStyle: React.CSSProperties = { position: 'fixed', zIndex: 9999, width: POPUP_W };
  if (rect) {
    const spaceBelow = window.innerHeight - rect.bottom - 8;
    if (spaceBelow >= 160) {
      popupStyle.top = rect.bottom + 6;
    } else {
      popupStyle.bottom = window.innerHeight - rect.top + 6;
    }
    const centerLeft = rect.left + rect.width / 2 - POPUP_W / 2;
    popupStyle.left = Math.max(8, Math.min(centerLeft, window.innerWidth - POPUP_W - 8));
  }

  const popup = (
    <div
      ref={popupRef}
      style={popupStyle}
      className="rounded-2xl overflow-hidden shadow-[0_12px_40px_rgba(16,48,43,0.18)] border border-primary/30"
    >
      <div
        className="flex gap-0 px-3 py-2"
        dir="ltr"
        style={{ background: FADE_COLOR }}
      >
        <WheelCol items={MONTHS12}     selected={selMonth} onSelect={setSelMonth} format={fmtMonth} />
        <div className="w-px mx-1 bg-primary/15 self-stretch my-1" />
        <WheelCol items={YEARS_ALL}    selected={selYear}  onSelect={setSelYear}  format={fmtYear} />
      </div>
    </div>
  );

  return (
    <div className="relative">
      <input type="hidden" value={value} required={required} />
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
          {displayValue || placeholder || ''}
        </span>
      </button>
      {mounted && isOpen && createPortal(popup, document.body)}
    </div>
  );
};

