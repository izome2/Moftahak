'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Receipt, Loader2 } from 'lucide-react';

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

const CATEGORY_BADGES: Record<string, { label: string; className: string }> = {
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
  LAUNDRY: { label: 'غسيل ملاءات', className: 'bg-primary/10 text-secondary' },
  TOWELS: { label: 'مناشف حمام', className: 'bg-primary/10 text-secondary' },
  KITCHEN_SUPPLIES: { label: 'مستلزمات مطبخ', className: 'bg-primary/10 text-secondary' },
  AIR_CONDITIONING: { label: 'تكييف', className: 'bg-primary/10 text-secondary' },
  OTHER: { label: 'أخرى', className: 'bg-secondary/8 text-secondary/60' },
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ar-EG', { month: 'short', day: 'numeric' });

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('ar-EG').format(amount) + ' ج.م';

const ExpensesTable: React.FC<ExpensesTableProps> = ({ expenses, totalAmount, isLoading }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className="bg-white rounded-2xl border-2 border-primary/30 shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-primary/10">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center flex-shrink-0">
            <Receipt size={16} className="text-primary" />
          </div>
          <h3 className="text-sm font-bold text-secondary font-dubai">المصروفات</h3>
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
          <div className="w-12 h-12 rounded-2xl bg-primary/5 mx-auto mb-3 flex items-center justify-center">
            <Receipt size={22} className="text-secondary/35" />
          </div>
          <p className="text-secondary/55 font-dubai text-sm">لا توجد مصروفات هذا الشهر</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                <th className="px-4 py-3 text-right text-[11px] text-secondary/80 font-bold font-dubai">الوصف</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">القسم</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai hidden sm:table-cell">التاريخ</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">المبلغ</th>
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense, i) => {
                const cat = CATEGORY_BADGES[expense.category] || CATEGORY_BADGES.OTHER;

                return (
                  <tr
                    key={expense.id}
                    className={`border-b border-primary/10 hover:bg-primary/10 transition-colors ${
                      i % 2 === 0 ? 'bg-primary/[0.06]' : ''
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
                      <span className={`text-[10px] px-2 py-0.5 rounded-full font-dubai ${cat.className}`}>
                        {cat.label}
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
