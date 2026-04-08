'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface MonthSelectorProps {
  month: string; // YYYY-MM
  onChange: (month: string) => void;
  className?: string;
  blockPastMonths?: boolean;
  blockFutureMonths?: boolean;
}

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const changeMonth = (month: string, delta: number) => {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

const MonthSelector: React.FC<MonthSelectorProps> = ({ month, onChange, className = '', blockPastMonths = false, blockFutureMonths = false }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const isCurrentMonth = month === getCurrentMonth();
  const isPastDisabled = blockPastMonths && isCurrentMonth;
  const isFutureDisabled = blockFutureMonths && isCurrentMonth;

  const formatMonthDisplay = (m: string) => {
    const [year, mm] = m.split('-');
    const idx = parseInt(mm, 10) - 1;
    const yearFormatted = new Intl.NumberFormat(locale, { useGrouping: false }).format(parseInt(year, 10));
    return `${t.accounting.months[idx] || mm} ${yearFormatted}`;
  };

  return (
    <div className={`flex items-center justify-center gap-2 sm:gap-4 ${className}`}>
      <button
        onClick={() => onChange(changeMonth(month, -1))}
        disabled={isPastDisabled}
        className="p-1.5 sm:p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={t.accounting.monthSelector.prevMonth}
      >
        {language === 'ar' ? <ChevronRight size={18} className="text-secondary sm:w-5 sm:h-5" /> : <ChevronLeft size={18} className="text-secondary sm:w-5 sm:h-5" />}
      </button>
      <div className="text-center min-w-[100px] sm:min-w-[160px]">
        <p className="text-sm sm:text-lg font-bold text-secondary font-dubai">
          {formatMonthDisplay(month)}
        </p>
      </div>
      <button
        onClick={() => onChange(changeMonth(month, 1))}
        disabled={isFutureDisabled}
        className="p-1.5 sm:p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label={t.accounting.monthSelector.nextMonth}
      >
        {language === 'ar' ? <ChevronLeft size={18} className="text-secondary sm:w-5 sm:h-5" /> : <ChevronRight size={18} className="text-secondary sm:w-5 sm:h-5" />}
      </button>
    </div>
  );
};

export default MonthSelector;
