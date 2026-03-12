'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Calendar, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

interface DatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (value: string) => void;
  minDate?: string; // YYYY-MM-DD
  placeholder?: string;
  required?: boolean;
  className?: string;
}

const ITEM_HEIGHT = 40;
const VISIBLE_ITEMS = 5;
const CENTER_INDEX = Math.floor(VISIBLE_ITEMS / 2);

// Generate arrays
const DAYS = Array.from({ length: 31 }, (_, i) => i + 1);
const MONTHS = Array.from({ length: 12 }, (_, i) => i + 1);
const currentYear = new Date().getFullYear();
const YEARS = Array.from({ length: 11 }, (_, i) => currentYear - 5 + i);

function getDaysInMonth(month: number, year: number) {
  return new Date(year, month, 0).getDate();
}

interface WheelColProps {
  items: number[];
  value: number;
  onChange: (v: number) => void;
  formatItem: (v: number) => string;
}

const WheelCol: React.FC<WheelColProps> = ({ items, value, onChange, formatItem }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isScrollingRef = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const scrollToValue = useCallback((val: number, smooth = false) => {
    const idx = items.indexOf(val);
    if (idx === -1 || !containerRef.current) return;
    const top = idx * ITEM_HEIGHT;
    containerRef.current.scrollTo({ top, behavior: smooth ? 'smooth' : 'auto' });
  }, [items]);

  useEffect(() => {
    scrollToValue(value, false);
  }, [value, scrollToValue]);

  const handleScroll = () => {
    if (!containerRef.current) return;
    isScrollingRef.current = true;
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      if (!containerRef.current) return;
      const scrollTop = containerRef.current.scrollTop;
      const idx = Math.round(scrollTop / ITEM_HEIGHT);
      const clamped = Math.max(0, Math.min(idx, items.length - 1));
      containerRef.current.scrollTo({ top: clamped * ITEM_HEIGHT, behavior: 'smooth' });
      if (items[clamped] !== value) {
        onChange(items[clamped]);
      }
      isScrollingRef.current = false;
    }, 80);
  };

  const handleClickItem = (v: number) => {
    onChange(v);
    scrollToValue(v, true);
  };

  return (
    <div className="relative flex-1" style={{ height: ITEM_HEIGHT * VISIBLE_ITEMS }}>
      {/* Highlight band */}
      <div
        className="absolute inset-x-0 pointer-events-none z-10 border-y-2 border-primary/30 bg-primary/10 rounded-lg"
        style={{ top: CENTER_INDEX * ITEM_HEIGHT, height: ITEM_HEIGHT }}
      />
      {/* Top/bottom fade gradients */}
      <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-white to-transparent pointer-events-none z-20 rounded-t-xl" />
      <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-white to-transparent pointer-events-none z-20 rounded-b-xl" />
      {/* Scroll container */}
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto scrollbar-hide snap-y snap-mandatory"
        style={{
          paddingTop: CENTER_INDEX * ITEM_HEIGHT,
          paddingBottom: CENTER_INDEX * ITEM_HEIGHT,
          scrollSnapType: 'y mandatory',
        }}
      >
        {items.map((item) => {
          const isSelected = item === value;
          return (
            <div
              key={item}
              onClick={() => handleClickItem(item)}
              className={`flex items-center justify-center cursor-pointer snap-start transition-all duration-150 font-dubai select-none ${
                isSelected
                  ? 'text-secondary font-bold text-lg'
                  : 'text-secondary/40 text-base'
              }`}
              style={{ height: ITEM_HEIGHT }}
            >
              {formatItem(item)}
            </div>
          );
        })}
      </div>
    </div>
  );
};

const DatePicker: React.FC<DatePickerProps> = ({
  value,
  onChange,
  minDate,
  placeholder,
  required,
  className = '',
}) => {
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const [isOpen, setIsOpen] = useState(false);
  const popupRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);

  // Parse value or default to today
  const parsed = value ? value.split('-').map(Number) : null;
  const [selectedYear, setSelectedYear] = useState(parsed?.[0] || new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(parsed?.[1] || new Date().getMonth() + 1);
  const [selectedDay, setSelectedDay] = useState(parsed?.[2] || new Date().getDate());

  // Sync internal state when value changes externally
  useEffect(() => {
    if (value) {
      const parts = value.split('-').map(Number);
      if (parts.length === 3) {
        setSelectedYear(parts[0]);
        setSelectedMonth(parts[1]);
        setSelectedDay(parts[2]);
      }
    }
  }, [value]);

  // Auto-clamp day if month/year changes
  useEffect(() => {
    const maxDay = getDaysInMonth(selectedMonth, selectedYear);
    if (selectedDay > maxDay) setSelectedDay(maxDay);
  }, [selectedMonth, selectedYear, selectedDay]);

  // Close on outside click
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent) => {
      if (
        popupRef.current && !popupRef.current.contains(e.target as Node) &&
        triggerRef.current && !triggerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [isOpen]);

  const handleConfirm = () => {
    const maxDay = getDaysInMonth(selectedMonth, selectedYear);
    const day = Math.min(selectedDay, maxDay);
    const dateStr = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

    // Enforce minDate
    if (minDate && dateStr < minDate) return;

    onChange(dateStr);
    setIsOpen(false);
  };

  // Format display value
  const displayValue = value
    ? new Date(value + 'T00:00:00').toLocaleDateString(locale, {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : '';

  const monthNames = language === 'ar'
    ? ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر']
    : ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

  const formatDay = (d: number) => new Intl.NumberFormat(locale).format(d);
  const formatMonth = (m: number) => monthNames[m - 1];
  const formatYear = (y: number) => new Intl.NumberFormat(locale, { useGrouping: false }).format(y);

  // Filter days by daysInMonth
  const maxDays = getDaysInMonth(selectedMonth, selectedYear);
  const filteredDays = DAYS.filter(d => d <= maxDays);

  return (
    <div className="relative">
      {/* Trigger button */}
      <button
        ref={triggerRef}
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm text-right flex items-center justify-between gap-2 focus:outline-none focus:border-primary transition-colors ${
          !value ? 'text-secondary/30' : ''
        } ${className}`}
      >
        <Calendar size={16} className="text-secondary/40 flex-shrink-0" />
        <span className="flex-1 text-right">{displayValue || placeholder || ''}</span>
      </button>

      {/* Floating popup */}
      {isOpen && (
        <div
          ref={popupRef}
          className="absolute z-50 mt-2 w-full min-w-[280px] bg-white rounded-2xl border-2 border-primary/25 shadow-[0_8px_30px_rgba(237,191,140,0.25)] overflow-hidden"
          style={{ maxHeight: '340px' }}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-primary/10 bg-primary/5">
            <span className="text-sm font-bold text-secondary font-dubai">{placeholder || (language === 'ar' ? 'اختر التاريخ' : 'Select date')}</span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 hover:bg-primary/10 rounded-lg transition-colors"
            >
              <X size={16} className="text-secondary/50" />
            </button>
          </div>

          {/* Wheels */}
          <div className="flex gap-1 px-3 py-2" dir="ltr">
            <WheelCol
              items={filteredDays}
              value={selectedDay}
              onChange={setSelectedDay}
              formatItem={formatDay}
            />
            <div className="w-px bg-primary/10 my-4" />
            <WheelCol
              items={MONTHS}
              value={selectedMonth}
              onChange={setSelectedMonth}
              formatItem={formatMonth}
            />
            <div className="w-px bg-primary/10 my-4" />
            <WheelCol
              items={YEARS}
              value={selectedYear}
              onChange={setSelectedYear}
              formatItem={formatYear}
            />
          </div>

          {/* Confirm button */}
          <div className="px-4 pb-3">
            <button
              type="button"
              onClick={handleConfirm}
              className="w-full py-2.5 bg-secondary text-white rounded-xl font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors"
            >
              {language === 'ar' ? 'تأكيد' : 'Confirm'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatePicker;
