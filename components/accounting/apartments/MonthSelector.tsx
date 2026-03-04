'use client';

import React from 'react';
import { ChevronRight, ChevronLeft } from 'lucide-react';

interface MonthSelectorProps {
  month: string; // YYYY-MM
  onChange: (month: string) => void;
  className?: string;
}

const MONTH_NAMES: Record<string, string> = {
  '01': 'يناير', '02': 'فبراير', '03': 'مارس',
  '04': 'أبريل', '05': 'مايو', '06': 'يونيو',
  '07': 'يوليو', '08': 'أغسطس', '09': 'سبتمبر',
  '10': 'أكتوبر', '11': 'نوفمبر', '12': 'ديسمبر',
};

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const changeMonth = (month: string, delta: number) => {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

export const formatMonthDisplay = (month: string) => {
  const [year, m] = month.split('-');
  return `${MONTH_NAMES[m] || m} ${year}`;
};

const MonthSelector: React.FC<MonthSelectorProps> = ({ month, onChange, className = '' }) => {
  const isCurrentMonth = month === getCurrentMonth();

  return (
    <div className={`flex items-center justify-center gap-4 ${className}`}>
      <button
        onClick={() => onChange(changeMonth(month, -1))}
        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
        aria-label="الشهر السابق"
      >
        <ChevronRight size={20} className="text-secondary" />
      </button>
      <div className="text-center min-w-[160px]">
        <p className="text-lg font-bold text-secondary font-dubai">
          {formatMonthDisplay(month)}
        </p>
      </div>
      <button
        onClick={() => onChange(changeMonth(month, 1))}
        disabled={isCurrentMonth}
        className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        aria-label="الشهر التالي"
      >
        <ChevronLeft size={20} className="text-secondary" />
      </button>
    </div>
  );
};

export default MonthSelector;
