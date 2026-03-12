'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Loader2,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import MonthlySummary from './MonthlySummary';
import ProgressBar from './ProgressBar';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Types ---
interface MonthlyBreakdown {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  investorShare: number;
}

interface InvestmentData {
  investmentId: string;
  apartment: { id: string; name: string; type?: string | null };
  percentage: number;
  investmentTarget: number;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  investorProfit: number;
  totalWithdrawals: number;
  balance: number;
  monthlyBreakdown: MonthlyBreakdown[];
}

interface ApartmentViewProps {
  investment: InvestmentData;
  currency?: string;
}

const ApartmentView: React.FC<ApartmentViewProps> = ({
  investment,
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

  const [expanded, setExpanded] = useState(false);

  // Group monthly breakdown by year
  const yearlyGroups = investment.monthlyBreakdown.reduce((acc, m) => {
    const year = m.month.split('-')[0];
    if (!acc[year]) acc[year] = [];
    acc[year].push(m);
    return acc;
  }, {} as Record<string, MonthlyBreakdown[]>);

  const years = Object.keys(yearlyGroups).sort().reverse();

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white rounded-2xl border-2 border-primary/20 overflow-hidden shadow-[0_4px_20px_rgba(237,191,140,0.1)]"
    >
      {/* Apartment Header */}
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center gap-3 px-5 py-4 hover:bg-primary/5
          transition-colors border-b border-primary/10"
      >
        <div className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/30
          flex items-center justify-center shrink-0"
        >
          <Building2 className="w-5 h-5 text-primary" />
        </div>

        <div className="flex-1 text-right">
          <h3 className="text-base font-bold text-secondary font-dubai">
            {investment.apartment.name}
          </h3>
          <div className="flex items-center gap-3 mt-0.5">
            <span className="flex items-center gap-1 text-xs text-secondary/55 font-dubai">
              <Percent className="w-3 h-3" />
              {t.accounting.investorPortal.myPercentage} {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(investment.percentage * 100)}%
            </span>
            <span className={`flex items-center gap-1 text-xs font-bold font-dubai ${
              investment.investorProfit >= 0 ? 'text-[#8a9a7a]' : 'text-[#c09080]'
            }`}>
              <DollarSign className="w-3 h-3" />
              {t.accounting.investorPortal.profit}: {formatCurrency(investment.investorProfit, currency)}
            </span>
          </div>
        </div>

        {expanded ? (
          <ChevronUp className="w-4 h-4 text-secondary/55" />
        ) : (
          <ChevronDown className="w-4 h-4 text-secondary/55" />
        )}
      </button>

      {/* Expanded Details */}
      {expanded && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          transition={{ duration: 0.25 }}
          className="space-y-4 p-5"
        >
          {/* Financial Summary */}
          <div className="bg-gradient-to-bl from-[#10302b] via-[#163d36] to-[#1a4a42] rounded-2xl
            border border-[#8a9a7a]/20 shadow-[0_8px_32px_rgba(16,48,43,0.35)] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-5 pt-5 pb-3">
              <div className="w-10 h-10 rounded-xl bg-white/8 border border-white/10
                flex items-center justify-center"
              >
                <DollarSign className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white font-dubai">{t.accounting.investorPortal.financialSummary}</h4>
                <p className="text-[11px] text-white/35 font-dubai">{investment.apartment.name}</p>
              </div>
            </div>

            {/* 3 Widgets */}
            <div className="grid grid-cols-3 gap-2.5 sm:gap-3 px-4 sm:px-5 pb-5 pt-2">
              <div className="flex flex-col items-center justify-center text-center
                bg-white/5 border border-white/8 rounded-xl px-2 py-4 sm:py-5
                hover:bg-white/8 transition-colors"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#8a9a7a]/15 border border-[#8a9a7a]/20
                  flex items-center justify-center mb-2.5"
                >
                  <TrendingUp className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#b5c4a5]" />
                </div>
                <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">{t.accounting.investorPortal.totalRevenue}</p>
                <p className="text-sm sm:text-[15px] font-bold text-[#b5c4a5] font-dubai leading-tight">
                  {formatCurrency(investment.totalRevenue, currency)}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center text-center
                bg-white/5 border border-white/8 rounded-xl px-2 py-4 sm:py-5
                hover:bg-white/8 transition-colors"
              >
                <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#c09080]/15 border border-[#c09080]/20
                  flex items-center justify-center mb-2.5"
                >
                  <TrendingDown className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#d4b0a0]" />
                </div>
                <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">{t.accounting.investorPortal.totalExpenses}</p>
                <p className="text-sm sm:text-[15px] font-bold text-[#d4b0a0] font-dubai leading-tight">
                  {formatCurrency(investment.totalExpenses, currency)}
                </p>
              </div>

              <div className="flex flex-col items-center justify-center text-center
                bg-white/8 border border-white/12 rounded-xl px-2 py-4 sm:py-5
                hover:bg-white/12 transition-colors"
              >
                <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border
                  flex items-center justify-center mb-2.5 ${
                  investment.profit >= 0
                    ? 'bg-[#8a9a7a]/15 border-[#8a9a7a]/20'
                    : 'bg-[#c09080]/15 border-[#c09080]/20'
                }`}>
                  <DollarSign className={`w-5.5 h-5.5 sm:w-6 sm:h-6 ${
                    investment.profit >= 0 ? 'text-[#b5c4a5]' : 'text-[#d4b0a0]'
                  }`} />
                </div>
                <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">{t.accounting.investorPortal.netProfit}</p>
                <p className={`text-[15px] sm:text-lg font-bold font-dubai leading-tight ${
                  investment.profit >= 0 ? 'text-[#b5c4a5]' : 'text-[#d4b0a0]'
                }`}>
                  {formatCurrency(investment.profit, currency)}
                </p>
              </div>
            </div>
          </div>

          {/* My Share */}
          <div className="bg-primary/8 rounded-xl p-4">
            <h4 className="text-sm font-bold text-secondary font-dubai mb-2">{t.accounting.investorPortal.myPercentageInApartment}</h4>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                    <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.investors.percentageLabel}</th>
                    <th className="text-right px-4 py-3 text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.investorPortal.profit}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className="bg-white">
                    <td className="px-4 py-3">
                      <span className="bg-secondary/10 text-secondary text-xs font-bold
                        px-2 py-0.5 rounded-full font-dubai"
                      >
                        {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(investment.percentage * 100)}%
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-[#8a9a7a] font-bold text-xs font-dubai">
                        {formatCurrency(investment.investorProfit, currency)}
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Progress bar if target exists */}
          {investment.investmentTarget > 0 && (
            <ProgressBar
              label={t.accounting.investorPortal.yearlyProgress}
              current={investment.investorProfit}
              target={investment.investmentTarget}
              currency={currency}
            />
          )}

          {/* Monthly breakdown by year */}
          {years.map((year) => (
            <MonthlySummary
              key={year}
              year={year}
              apartmentName={investment.apartment.name}
              months={yearlyGroups[year]}
              totalInvestorProfit={yearlyGroups[year].reduce((s, m) => s + m.investorShare, 0)}
              currency={currency}
            />
          ))}
        </motion.div>
      )}
    </motion.div>
  );
};

export default ApartmentView;
