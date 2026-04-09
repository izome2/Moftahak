'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExpenseItem {
  id: string;
  description: string;
  apartment: string;
  date: string;
  amount: number;
  category: string;
}

interface RecentExpensesProps {
  expenses: ExpenseItem[];
  isLoading?: boolean;
}

const CATEGORY_CLASSES: Record<string, string> = {
  CLEANING: 'bg-primary/10 text-secondary',
  MAINTENANCE: 'bg-primary/10 text-secondary',
  ELECTRICITY: 'bg-primary/10 text-secondary',
  WATER: 'bg-primary/10 text-secondary',
  GAS: 'bg-primary/10 text-secondary',
  INTERNET: 'bg-primary/10 text-secondary',
  FURNITURE: 'bg-primary/10 text-secondary',
  SUPPLIES: 'bg-primary/10 text-secondary',
  COMMISSION: 'bg-primary/10 text-secondary',
  TAXES: 'bg-primary/10 text-secondary',
  INSURANCE: 'bg-primary/10 text-secondary',
  MANAGEMENT: 'bg-primary/10 text-secondary',
  OTHER: 'bg-secondary/10 text-secondary/90',
};

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses, isLoading }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
    });
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white border border-secondary/[0.08] rounded-2xl shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-secondary/[0.06]">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
            <Receipt size={18} className="text-white" />
          </div>
          <h3 className="text-lg font-bold text-secondary font-dubai">{t.accounting.dashboard.recentExpenses}</h3>
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-primary animate-spin" />
          </div>
        ) : expenses.length === 0 ? (
          <div className="text-center py-8">
            <Receipt size={40} className="text-secondary/20 mx-auto mb-2" />
            <p className="text-secondary/90 font-dubai text-sm">{t.accounting.dashboard.noExpensesYet}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const catClass = CATEGORY_CLASSES[expense.category] || CATEGORY_CLASSES.OTHER;
              const catLabel = t.accounting.expenseCategoriesShort[expense.category as keyof typeof t.accounting.expenseCategoriesShort] || expense.category;

              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 p-3 bg-secondary/[0.03] rounded-xl hover:bg-secondary/[0.05] transition-colors"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary font-dubai text-sm truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-secondary/90 font-dubai truncate">
                      {expense.apartment}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-center flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-secondary/90 font-dubai">
                      {formatDate(expense.date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-left flex-shrink-0">
                    <p className="font-bold text-secondary font-dubai text-sm">
                      -{new Intl.NumberFormat(locale).format(expense.amount)} {currency}
                    </p>
                  </div>

                  {/* Category Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai flex-shrink-0 ${catClass}`}>
                    {catLabel}
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default RecentExpenses;
