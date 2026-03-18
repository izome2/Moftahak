'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface MonthlyBreakdown {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  investorShare: number;
}

interface MonthlySummaryProps {
  year: string;
  apartmentName: string;
  months: MonthlyBreakdown[];
  totalInvestorProfit: number;
  currency?: string;
}

const MonthlySummary: React.FC<MonthlySummaryProps> = ({
  year,
  apartmentName,
  months,
  totalInvestorProfit,
  currency = 'USD',
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const currencyLabel = ' ' + t.accounting.common.currency;

  const formatCurrency = (amount: number, cur: string = currency) => {
    if (cur === 'EGP') return new Intl.NumberFormat(locale).format(amount) + currencyLabel;
    return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
  };

  const getMonthLabel = (monthStr: string): string => {
    const m = parseInt(monthStr.split('-')[1], 10);
    return t.accounting.months[m - 1] || monthStr;
  };
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
      className="bg-white rounded-2xl border border-secondary/[0.08] overflow-hidden shadow-sm"
    >
      {/* Header */}
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-secondary/[0.06]"
      >
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
          <BarChart3 className="w-4 h-4 text-white" />
        </div>
        <div className="flex items-center gap-2">
          <h3 className="text-base font-bold text-secondary font-dubai">
            {t.accounting.investorPortal.monthlyProfit}
          </h3>
          <span className="text-xs text-secondary/55 font-dubai">
            {apartmentName}
          </span>
        </div>
        <span className="mr-auto flex items-center gap-1 bg-primary/15 text-secondary
          text-xs font-bold px-2.5 py-1 rounded-full font-dubai"
        >
          <Calendar className="w-3 h-3" />
          {year}
        </span>
      </div>

      {months.length === 0 ? (
        <div className="py-10 text-center text-secondary/55">
          <BarChart3 className="w-8 h-8 mx-auto mb-2 opacity-40" />
          <p className="text-sm font-dubai">{t.accounting.investorPortal.noDataThisYear}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                <th className="text-right px-4 py-3 text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Calendar size={12} />{t.accounting.investorPortal.month}</span></th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><TrendingUp size={12} />{t.accounting.investorPortal.revenue}</span></th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><TrendingDown size={12} />{t.accounting.investorPortal.expenses}</span></th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><DollarSign size={12} />{t.accounting.investorPortal.profit}</span></th>
                <th className="text-right px-4 py-3 text-[11px] text-secondary/45 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Wallet size={12} />{t.accounting.investorPortal.myShare}</span></th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {months.map((m, i) => (
                <tr
                  key={m.month}
                  className={`transition-colors ${i % 2 === 0 ? 'bg-white' : 'bg-secondary/[0.01]'}
                    hover:bg-secondary/[0.02]`}
                >
                  <td className="px-4 py-2.5">
                    <span className="font-medium text-secondary text-xs font-dubai">
                      {getMonthLabel(m.month)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[#8a9a7a] text-xs font-dubai">
                      {formatCurrency(m.revenue, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className="text-[#c09080] text-xs font-dubai">
                      {formatCurrency(m.expenses, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-bold font-dubai ${
                      m.profit >= 0 ? 'text-secondary' : 'text-[#c09080]'
                    }`}>
                      {formatCurrency(m.profit, currency)}
                    </span>
                  </td>
                  <td className="px-4 py-2.5">
                    <span className={`text-xs font-bold font-dubai ${
                      m.investorShare >= 0 ? 'text-primary' : 'text-[#c09080]'
                    }`}>
                      {formatCurrency(m.investorShare, currency)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>

            {/* Total row */}
            <tfoot>
              <tr className="bg-secondary/[0.03] border-t border-secondary/[0.06]">
                <td className="px-4 py-3 text-xs text-secondary/60 font-bold font-dubai">{t.accounting.investorPortal.total}</td>
                <td className="px-4 py-3">
                  <span className="text-[#8a9a7a] text-xs font-bold font-dubai">
                    {formatCurrency(months.reduce((s, m) => s + m.revenue, 0), currency)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-[#c09080] text-xs font-bold font-dubai">
                    {formatCurrency(months.reduce((s, m) => s + m.expenses, 0), currency)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-secondary text-xs font-bold font-dubai">
                    {formatCurrency(months.reduce((s, m) => s + m.profit, 0), currency)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-primary text-xs font-bold font-dubai">
                    {formatCurrency(totalInvestorProfit, currency)}
                  </span>
                </td>
              </tr>
            </tfoot>
          </table>
        </div>
      )}
    </motion.div>
  );
};

export default MonthlySummary;
