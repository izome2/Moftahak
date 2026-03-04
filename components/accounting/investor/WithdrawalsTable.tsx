'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, Calendar, MessageSquare } from 'lucide-react';

interface WithdrawalRow {
  id: string;
  amount: number;
  currency: string;
  date: string;
  comments?: string | null;
  apartmentInvestor?: {
    apartment?: { id: string; name: string } | null;
  } | null;
}

interface WithdrawalsTableProps {
  withdrawals: WithdrawalRow[];
  total: number;
  currency?: string;
  isLoading?: boolean;
}

const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (currency === 'EGP') return new Intl.NumberFormat('ar-EG').format(amount) + ' ج.م';
  return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
};

const formatDate = (dateString: string) =>
  new Date(dateString).toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

const WithdrawalsTable: React.FC<WithdrawalsTableProps> = ({
  withdrawals,
  total,
  currency = 'USD',
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border-2 border-primary/20 p-8">
        <div className="flex items-center justify-center gap-2 text-secondary/55">
          <div className="w-5 h-5 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          <span className="text-sm font-dubai">جاري تحميل المسحوبات...</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden shadow-[0_4px_20px_rgba(237,191,140,0.1)]"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b-2 border-primary/10
        bg-gradient-to-l from-primary/5 to-white"
      >
        <div className="w-8 h-8 rounded-xl bg-[#c09080]/10 border-2 border-[#c09080]/25 flex items-center justify-center">
          <ArrowDownCircle className="w-4 h-4 text-[#c09080]" />
        </div>
        <h3 className="text-base font-bold text-secondary font-dubai">المسحوبات</h3>
        <span className="mr-auto bg-primary/10 text-secondary/70 text-xs font-bold px-2.5 py-1
          rounded-full font-dubai"
        >
          {withdrawals.length} عملية
        </span>
      </div>

      {withdrawals.length === 0 ? (
        <div className="py-10 text-center text-secondary/55">
          <ArrowDownCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-dubai">لا يوجد مسحوبات</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">المبلغ</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">التاريخ</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">الشقة</th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">ملاحظات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {withdrawals.map((w, i) => (
                <tr
                  key={w.id}
                  className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-primary/[0.06]'}
                    hover:bg-primary/10`}
                >
                  <td className="px-4 py-3">
                    <span className="font-bold text-[#c09080] font-dubai">
                      {formatCurrency(w.amount, w.currency || currency)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1 text-secondary/70 text-xs font-dubai">
                      <Calendar className="w-3 h-3" />
                      {formatDate(w.date)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="text-secondary/70 text-xs font-dubai">
                      {w.apartmentInvestor?.apartment?.name || '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {w.comments ? (
                      <span className="flex items-center gap-1 text-secondary/60 text-xs font-dubai max-w-[200px] truncate">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        {w.comments}
                      </span>
                    ) : (
                      <span className="text-secondary/45 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total row */}
            <tfoot>
              <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-t-2 border-primary/20">
                <td className="px-4 py-3">
                  <span className="font-bold text-[#c09080] font-dubai">
                    {formatCurrency(total, currency)}
                  </span>
                </td>
                <td colSpan={3} className="px-4 py-3 text-xs text-secondary/60 font-dubai">
                  إجمالي المسحوبات
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default WithdrawalsTable;
