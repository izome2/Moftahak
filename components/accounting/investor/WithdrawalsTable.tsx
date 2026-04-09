'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowDownCircle, Calendar, MessageSquare, DollarSign, Building2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

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

const WithdrawalsTable: React.FC<WithdrawalsTableProps> = ({
  withdrawals,
  total,
  currency = 'USD',
  isLoading,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currencyLabel = ' ' + t.accounting.common.currency;

  const formatCurrency = (amount: number, cur: string = currency) => {
    if (cur === 'EGP') return new Intl.NumberFormat(locale).format(amount) + currencyLabel;
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString(locale, {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl border border-secondary/[0.08] p-8">
        <div className="flex items-center justify-center gap-2 text-secondary/80">
          <div className="w-5 h-5 border-2 border-secondary/20 border-t-secondary/60 rounded-full animate-spin" />
          <span className="text-sm font-dubai">{t.accounting.investorPortal.loadingWithdrawals}</span>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.3 }}
      className="bg-white rounded-2xl border border-secondary/[0.08] overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-secondary/[0.06]"
      >
        <div className="w-8 h-8 rounded-xl bg-[#c09080]/10 border-2 border-[#c09080]/25 flex items-center justify-center">
          <ArrowDownCircle className="w-4 h-4 text-[#c09080]" />
        </div>
        <h3 className="text-base font-bold text-secondary font-dubai">{t.accounting.investorPortal.withdrawalsTitle}</h3>
        <span className="mr-auto bg-secondary/[0.04] text-secondary/70 text-xs font-bold px-2.5 py-1
          rounded-full font-dubai"
        >
          {withdrawals.length} {t.accounting.investorPortal.operationUnit}
        </span>
      </div>

      {withdrawals.length === 0 ? (
        <div className="py-10 text-center text-secondary/80">
          <ArrowDownCircle className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-dubai">{t.accounting.investorPortal.noWithdrawals}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><DollarSign size={12} />{t.accounting.investorPortal.withdrawalAmount}</span></th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Calendar size={12} />{t.accounting.investorPortal.withdrawalDate}</span></th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Building2 size={12} />{t.accounting.investorPortal.withdrawalApartment}</span></th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/70 font-medium font-dubai"><span className="inline-flex items-center gap-1"><MessageSquare size={12} />{t.accounting.investorPortal.withdrawalNotes}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/10">
              {withdrawals.map((w, i) => (
                <tr
                  key={w.id}
                  className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-secondary/[0.01]'}
                    hover:bg-secondary/[0.02]`}
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
                      <span className="flex items-center gap-1 text-secondary/80 text-xs font-dubai max-w-[200px] truncate">
                        <MessageSquare className="w-3 h-3 shrink-0" />
                        {w.comments}
                      </span>
                    ) : (
                      <span className="text-secondary/70 text-xs">—</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total row */}
            <tfoot>
              <tr className="bg-secondary/[0.03] border-t border-secondary/[0.06]">
                <td className="px-4 py-3">
                  <span className="font-bold text-[#c09080] font-dubai">
                    {formatCurrency(total, currency)}
                  </span>
                </td>
                <td colSpan={3} className="px-4 py-3 text-xs text-secondary/80 font-dubai">
                  {t.accounting.investorPortal.totalWithdrawalsLabel}
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
