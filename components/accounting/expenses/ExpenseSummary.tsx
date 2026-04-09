'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, TrendingDown, Hash, Building2, Percent } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExpenseSummaryProps {
  totalExpenses: number;
  totalCount: number;
  apartmentsCount?: number;
  topCategory?: { label: string; amount: number } | null;
  averagePerExpense?: number;
  isLoading?: boolean;
}

const ExpenseSummary: React.FC<ExpenseSummaryProps> = ({
  totalExpenses,
  totalCount,
  apartmentsCount,
  topCategory,
  averagePerExpense,
  isLoading = false,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + currency;

  const avg = averagePerExpense ?? (totalCount > 0 ? totalExpenses / totalCount : 0);

  const cards = [
    {
      label: t.accounting.expenses.totalExpenses,
      value: formatCurrency(totalExpenses),
      icon: Receipt,
      gradient: 'from-rose-500/10 to-rose-500/5',
      iconBg: 'bg-rose-500/15',
      iconColor: 'text-rose-600',
      valueColor: 'text-rose-700',
      accent: 'border-rose-500/15',
    },
    {
      label: t.accounting.expenses.expenseCount,
      value: new Intl.NumberFormat(locale).format(totalCount),
      icon: Hash,
      gradient: 'from-blue-500/10 to-blue-500/5',
      iconBg: 'bg-blue-500/15',
      iconColor: 'text-blue-600',
      valueColor: 'text-secondary',
      accent: 'border-blue-500/15',
    },
    {
      label: t.accounting.expenses.avgExpense,
      value: formatCurrency(Math.round(avg)),
      icon: TrendingDown,
      gradient: 'from-amber-500/10 to-amber-500/5',
      iconBg: 'bg-amber-500/15',
      iconColor: 'text-amber-600',
      valueColor: 'text-secondary',
      accent: 'border-amber-500/15',
    },
    ...(apartmentsCount !== undefined ? [{
      label: t.accounting.expenses.apartmentsWithExpenses,
      value: new Intl.NumberFormat(locale).format(apartmentsCount!),
      icon: Building2,
      gradient: 'from-violet-500/10 to-violet-500/5',
      iconBg: 'bg-violet-500/15',
      iconColor: 'text-violet-600',
      valueColor: 'text-secondary',
      accent: 'border-violet-500/15',
    }] : []),
    ...(topCategory ? [{
      label: t.accounting.expenses.topCategory,
      value: topCategory.label,
      icon: Percent,
      gradient: 'from-secondary/10 to-secondary/5',
      iconBg: 'bg-secondary/10',
      iconColor: 'text-secondary/90',
      valueColor: 'text-secondary',
      accent: 'border-secondary/10',
    }] : []),
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: i * 0.05 }}
          className={`relative overflow-hidden bg-gradient-to-br ${card.gradient} rounded-2xl border ${card.accent} p-4 group hover:shadow-md transition-shadow duration-300`}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-[11px] text-secondary/90 font-dubai font-medium">{card.label}</span>
            <div className={`w-8 h-8 rounded-xl ${card.iconBg} flex items-center justify-center`}>
              <card.icon size={15} className={card.iconColor} />
            </div>
          </div>
          {isLoading ? (
            <div className="h-7 bg-secondary/8 rounded-lg w-20 animate-pulse" />
          ) : (
            <p className={`text-lg sm:text-xl font-bold font-dubai ${card.valueColor} tracking-tight`}>
              {card.value}
            </p>
          )}
        </motion.div>
      ))}
    </div>
  );
};

export default ExpenseSummary;
