'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, TrendingDown, Hash, Building2, Percent } from 'lucide-react';

interface ExpenseSummaryProps {
  totalExpenses: number;
  totalCount: number;
  apartmentsCount?: number;
  topCategory?: { label: string; amount: number } | null;
  averagePerExpense?: number;
  isLoading?: boolean;
}

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ar-EG').format(amount) + ' ج.م';

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  totalExpenses,
  totalCount,
  apartmentsCount,
  topCategory,
  averagePerExpense,
  isLoading = false,
}) => {
  const avg = averagePerExpense ?? (totalCount > 0 ? totalExpenses / totalCount : 0);

  const cards = [
    {
      label: 'إجمالي المصروفات',
      value: formatCurrency(totalExpenses),
      icon: Receipt,
      bgColor: 'bg-[#c09080]/12',
      iconColor: 'text-[#c09080]',
      valueColor: 'text-[#c09080]',
    },
    {
      label: 'عدد المصروفات',
      value: String(totalCount),
      icon: Hash,
      bgColor: 'bg-primary/15',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    },
    {
      label: 'متوسط المصروف',
      value: formatCurrency(Math.round(avg)),
      icon: TrendingDown,
      bgColor: 'bg-secondary/8',
      iconColor: 'text-secondary/60',
      valueColor: 'text-secondary',
    },
    ...(apartmentsCount !== undefined ? [{
      label: 'شقق بمصروفات',
      value: String(apartmentsCount),
      icon: Building2,
      bgColor: 'bg-primary/12',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
    ...(topCategory ? [{
      label: 'أعلى قسم',
      value: topCategory.label,
      icon: Percent,
      bgColor: 'bg-primary/20',
      iconColor: 'text-primary',
      valueColor: 'text-secondary',
    }] : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: i * 0.06 }}
          className="bg-white rounded-xl border-2 border-primary/20 p-4 shadow-[0_4px_20px_rgba(237,191,140,0.12)]"
        >
          <div className="flex items-center gap-2 mb-2">
            <div className={`p-1.5 rounded-lg ${card.bgColor} border border-primary/20`}>
              <card.icon size={16} className={card.iconColor} />
            </div>
            <span className="text-xs text-secondary/60 font-dubai">{card.label}</span>
          </div>
          {isLoading ? (
            <div className="h-7 bg-primary/10 rounded-lg w-20 animate-pulse" />
          ) : (
            <p className={`text-lg sm:text-xl font-bold font-dubai ${card.valueColor}`}>
              {card.value}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ExpenseSummary;
