'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2, FileText, Tag, Calendar, DollarSign } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ExpenseRow {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string | null;
}

interface ExpensesTableProps {
  expenses: ExpenseRow[];
  totalAmount?: number;
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
  LAUNDRY: 'bg-primary/10 text-secondary',
  TOWELS: 'bg-primary/10 text-secondary',
  KITCHEN_SUPPLIES: 'bg-primary/10 text-secondary',
  AIR_CONDITIONING: 'bg-primary/10 text-secondary',
  OTHER: 'bg-secondary/8 text-secondary/60',
};

const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, totalAmount, isLoading }) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currency = t.accounting.common.currency;

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, { month: 'short', day: 'numeric' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + currency;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl border border-secondary/[0.08] shadow-sm overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center flex-shrink-0">
            <Receipt size={16} className="text-white" />
          </div>
          <h3 className="text-sm font-bold text-secondary font-dubai">{t.accounting.apartments.expensesTitle}</h3>
        </div>
        {totalAmount !== undefined && !isLoading && (
          <div className="bg-primary/8 px-3 py-1.5 rounded-xl">
            <span className="text-sm font-bold text-secondary font-dubai">
              {formatCurrency(totalAmount)}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-5 h-5 text-primary animate-spin" />
        </div>
      ) : expenses.length === 0 ? (
        <div className="text-center py-14">
          <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
            <Receipt size={22} className="text-secondary/35" />
          </div>
          <p className="text-secondary/55 font-dubai text-sm">{t.accounting.apartments.noExpensesThisMonth}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                <th className="px-4 py-3 text-right text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><FileText size={12} />{t.accounting.apartments.description}</span></th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Tag size={12} />{t.accounting.apartments.category}</span></th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai hidden sm:table-cell"><span className="inline-flex items-center gap-1"><Calendar size={12} />{t.accounting.apartments.date}</span></th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><DollarSign size={12} />{t.accounting.apartments.amountHeader}</span></th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, i) => {
                const catClass = CATEGORY_CLASSES[expense.category] || CATEGORY_CLASSES.OTHER;
                const catLabel = t.accounting.expenseCategoriesShort[expense.category as keyof typeof t.accounting.expenseCategoriesShort] || expense.category;

                return (
                  <tr
                    key={expense.id}
                    className={`border-b border-secondary/[0.04] hover:bg-secondary/[0.02] transition-colors ${
                      i % 2 === 0 ? 'bg-secondary/[0.01]' : ''
                    }`}
                  >
                    <td className="px-4 py-3.5 font-dubai">
                      <p className="font-semibold text-secondary text-[13px]">{expense.description}</p>
                      {expense.notes && (
                        <p className="text-[10px] text-secondary/55 mt-0.5 truncate max-w-[200px]">
                          {expense.notes}
                        </p>
                      )}
                    </td>
                    <td className="px-4 py-3.5 text-center">
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${catClass}`}>
                        {catLabel}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-center text-secondary/70 font-dubai text-[12px] hidden sm:table-cell">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-4 py-3.5 text-center font-bold text-secondary font-dubai text-[13px]">
                      {formatCurrency(expense.amount)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default ExpensesTable;
