'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Users, Loader2 } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface InvestorRow {
  id: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email?: string;
  };
  percentage: number;
  investmentTarget: number;
  _count?: { withdrawals: number };
}

interface InvestorsTableProps {
  investors: InvestorRow[];
  profit: number; // الربح الشهري لحساب نصيب كل مستثمر
  withdrawals?: Record<string, number>; // userId → مجموع المسحوبات هذا الشهر
  isLoading?: boolean;
}

const InvestorsTable: React.FC<InvestorsTableProps> = ({
  investors,
  profit,
  withdrawals = {},
  isLoading,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + t.accounting.common.currency;

  const formatPercentage = (pct: number) =>
    `${(pct * 100).toFixed(1)}%`;
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="bg-white rounded-xl border-2 border-primary/20 shadow-[0_4px_20px_rgba(237,191,140,0.12)] overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-primary/10 bg-accent/10">
        <div className="flex items-center gap-2">
          <Users size={18} className="text-secondary/60" />
          <h3 className="text-base font-bold text-secondary font-dubai">{t.accounting.apartments.investorsTable}</h3>
        </div>
        {!isLoading && investors.length > 0 && (
          <span className="text-xs text-secondary/50 font-dubai">
            {t.accounting.apartments.totalPercentages} {formatPercentage(investors.reduce((s, inv) => s + inv.percentage, 0))}
          </span>
        )}
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-10">
          <Loader2 className="w-6 h-6 text-primary animate-spin" />
        </div>
      ) : investors.length === 0 ? (
        <div className="text-center py-10">
          <Users size={36} className="text-secondary/35 mx-auto mb-2" />
          <p className="text-secondary/55 font-dubai text-sm">{t.accounting.apartments.noInvestors}</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gradient-to-l from-primary/15 to-primary/25 border-b border-primary/20">
                <th className="px-4 py-3 text-right text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.apartments.name}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.apartments.percentage}</th>
                <th className="px-4 py-3 text-center text-[11px] text-secondary/80 font-bold font-dubai">{t.accounting.apartments.profitHeader}</th>
              </tr>
            </thead>
            <tbody>
              {investors.map((investor, i) => {
                const investorProfit = profit * investor.percentage;

                return (
                  <tr
                    key={investor.id}
                    className={`border-b border-primary/10 hover:bg-primary/10 transition-colors ${
                      i % 2 === 0 ? 'bg-primary/[0.06]' : ''
                    }`}
                  >
                    <td className="p-3 font-dubai">
                      <p className="font-semibold text-secondary">
                        {investor.user.firstName} {investor.user.lastName}
                      </p>
                      {investor.user.email && (
                        <p className="text-xs text-secondary/60 mt-0.5 ltr">{investor.user.email}</p>
                      )}
                    </td>
                    <td className="p-3 text-center">
                      <span className="bg-secondary/8 text-secondary/70 text-xs px-2.5 py-1 rounded-full font-dubai font-bold">
                        {formatPercentage(investor.percentage)}
                      </span>
                    </td>
                    <td className="p-3 text-center font-bold text-[#8a9a7a] font-dubai">
                      {formatCurrency(investorProfit)}
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

export default InvestorsTable;
