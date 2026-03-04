'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2 } from 'lucide-react';

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

const CATEGORY_LABELS: Record<string, { label: string; className: string }> = {
  CLEANING: { label: 'نظافة', className: 'bg-primary/10 text-secondary' },
  MAINTENANCE: { label: 'صيانة', className: 'bg-primary/10 text-secondary' },
  ELECTRICITY: { label: 'كهرباء', className: 'bg-primary/10 text-secondary' },
  WATER: { label: 'مياه', className: 'bg-primary/10 text-secondary' },
  GAS: { label: 'غاز', className: 'bg-primary/10 text-secondary' },
  INTERNET: { label: 'إنترنت', className: 'bg-primary/10 text-secondary' },
  FURNITURE: { label: 'أثاث', className: 'bg-primary/10 text-secondary' },
  SUPPLIES: { label: 'مستلزمات', className: 'bg-primary/10 text-secondary' },
  COMMISSION: { label: 'عمولة', className: 'bg-primary/10 text-secondary' },
  TAXES: { label: 'ضرائب', className: 'bg-primary/10 text-secondary' },
  INSURANCE: { label: 'تأمين', className: 'bg-primary/10 text-secondary' },
  MANAGEMENT: { label: 'إدارة', className: 'bg-primary/10 text-secondary' },
  OTHER: { label: 'أخرى', className: 'bg-secondary/10 text-secondary/70' },
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('ar-EG', {
    month: 'short',
    day: 'numeric',
  });
};

const RecentExpenses: React.FC<RecentExpensesProps> = ({ expenses, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.4 }}
      className="bg-white border-2 border-primary/20 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-5 border-b border-primary/10">
        <div className="flex items-center gap-2">
          <Receipt size={20} className="text-primary" />
          <h3 className="text-lg font-bold text-secondary font-dubai">آخر المصروفات</h3>
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
            <p className="text-secondary/50 font-dubai text-sm">لا توجد مصروفات بعد</p>
          </div>
        ) : (
          <div className="space-y-3">
            {expenses.map((expense) => {
              const cat = CATEGORY_LABELS[expense.category] || CATEGORY_LABELS.OTHER;

              return (
                <div
                  key={expense.id}
                  className="flex items-center gap-3 p-3 bg-primary/5 rounded-xl hover:bg-primary/8 transition-colors"
                >
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary font-dubai text-sm truncate">
                      {expense.description}
                    </p>
                    <p className="text-xs text-secondary/50 font-dubai truncate">
                      {expense.apartment}
                    </p>
                  </div>

                  {/* Date */}
                  <div className="text-center flex-shrink-0 hidden sm:block">
                    <p className="text-xs text-secondary/60 font-dubai">
                      {formatDate(expense.date)}
                    </p>
                  </div>

                  {/* Amount */}
                  <div className="text-left flex-shrink-0">
                    <p className="font-bold text-secondary font-dubai text-sm">
                      -{new Intl.NumberFormat('ar-EG').format(expense.amount)} ج.م
                    </p>
                  </div>

                  {/* Category Badge */}
                  <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai flex-shrink-0 ${cat.className}`}>
                    {cat.label}
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
