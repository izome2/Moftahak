'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  Building2,
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarDays,
  Moon,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface ApartmentSummary {
  apartmentId: string;
  name: string;
  project?: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
  nights: number;
}

interface TotalsData {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  apartmentsCount: number;
}

interface ProjectSummaryProps {
  apartments: ApartmentSummary[];
  totals: TotalsData;
  isLoading?: boolean;
}

const ProjectSummary: React.FC<ProjectSummaryProps> = ({
  apartments,
  totals,
  isLoading,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat(locale).format(Math.round(val)) + ' ' + t.accounting.common.currency;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Total summary skeleton */}
        <div className="animate-pulse bg-primary/10 rounded-2xl h-28" />
        {/* Apartment cards skeleton */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse bg-primary/10 rounded-2xl h-40" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Aggregate totals */}
      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-bl from-[#10302b] via-[#163d36] to-[#1a4a42] rounded-2xl
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
            <h3 className="text-base font-bold text-white font-dubai">{t.accounting.reports.aggregateSummary}</h3>
            <p className="text-[11px] text-white/35 font-dubai">{t.accounting.reports.allApartmentsTotal}</p>
          </div>
        </div>

        {/* 4 Widgets Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3 px-4 sm:px-5 pb-5 pt-2">
          {/* Revenue */}
          <div className="flex flex-col items-center justify-center text-center
            bg-white/5 border border-white/8 rounded-xl px-2 py-4 sm:py-5
            hover:bg-white/8 transition-colors"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#8a9a7a]/15 border border-[#8a9a7a]/20
              flex items-center justify-center mb-2.5"
            >
              <DollarSign className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#b5c4a5]" />
            </div>
            <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">{t.accounting.dashboard.revenue}</p>
            <p className="text-sm sm:text-[15px] font-bold text-[#b5c4a5] font-dubai leading-tight">
              {formatCurrency(totals.totalRevenue)}
            </p>
          </div>

          {/* Expenses */}
          <div className="flex flex-col items-center justify-center text-center
            bg-white/5 border border-white/8 rounded-xl px-2 py-4 sm:py-5
            hover:bg-white/8 transition-colors"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#c09080]/15 border border-[#c09080]/20
              flex items-center justify-center mb-2.5"
            >
              <TrendingDown className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-[#d4b0a0]" />
            </div>
            <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">{t.accounting.dashboard.expensesLabel}</p>
            <p className="text-sm sm:text-[15px] font-bold text-[#d4b0a0] font-dubai leading-tight">
              {formatCurrency(totals.totalExpenses)}
            </p>
          </div>

          {/* Profit */}
          <div className="flex flex-col items-center justify-center text-center
            bg-white/8 border border-white/12 rounded-xl px-2 py-4 sm:py-5
            hover:bg-white/12 transition-colors"
          >
            <div className={`w-11 h-11 sm:w-12 sm:h-12 rounded-xl border
              flex items-center justify-center mb-2.5 ${
              totals.profit >= 0
                ? 'bg-[#8a9a7a]/15 border-[#8a9a7a]/20'
                : 'bg-[#c09080]/15 border-[#c09080]/20'
            }`}>
              <TrendingUp className={`w-5.5 h-5.5 sm:w-6 sm:h-6 ${
                totals.profit >= 0 ? 'text-[#b5c4a5]' : 'text-[#d4b0a0]'
              }`} />
            </div>
            <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">{t.accounting.dashboard.netProfit}</p>
            <p className={`text-[15px] sm:text-lg font-bold font-dubai leading-tight ${
              totals.profit >= 0 ? 'text-[#b5c4a5]' : 'text-[#d4b0a0]'
            }`}>
              {formatCurrency(totals.profit)}
            </p>
          </div>

          {/* Apartments count */}
          <div className="flex flex-col items-center justify-center text-center
            bg-white/5 border border-white/8 rounded-xl px-2 py-4 sm:py-5
            hover:bg-white/8 transition-colors"
          >
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white/8 border border-white/10
              flex items-center justify-center mb-2.5"
            >
              <Building2 className="w-5.5 h-5.5 sm:w-6 sm:h-6 text-primary" />
            </div>
            <p className="text-[11px] sm:text-xs text-white/50 font-dubai mb-1">{t.accounting.reports.apartments}</p>
            <p className="text-[15px] sm:text-lg font-bold text-white font-dubai leading-tight">
              {totals.apartmentsCount}
            </p>
          </div>
        </div>
      </motion.div>

      {/* Per-apartment cards */}
      {apartments.length === 0 ? (
        <div className="text-center py-10 text-secondary/40 font-dubai text-sm">
          {t.accounting.reports.noDataToShow}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {apartments.map((apt, index) => {
            const profitMargin = apt.revenue > 0
              ? ((apt.profit / apt.revenue) * 100).toFixed(0)
              : '0';

            return (
              <motion.div
                key={apt.apartmentId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white border-2 border-primary/20 rounded-2xl p-4 hover:shadow-[0_4px_20px_rgba(237,191,140,0.2)]
                  transition-shadow duration-200"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                      <Building2 className="w-4 h-4 text-secondary" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-secondary font-dubai">{apt.name}</h4>
                      {apt.project && (
                        <p className="text-[10px] text-secondary/50 font-dubai">{apt.project}</p>
                      )}
                    </div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded-full font-dubai
                    ${apt.profit >= 0 ? 'bg-primary/15 text-secondary' : 'bg-secondary/10 text-secondary/60'}`}
                  >
                    {profitMargin}% {t.accounting.reports.margin}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-dubai">
                    <span className="text-secondary/50">{t.accounting.dashboard.revenue}</span>
                    <span className="font-bold text-secondary">{formatCurrency(apt.revenue)}</span>
                  </div>
                  <div className="flex items-center justify-between text-xs font-dubai">
                    <span className="text-secondary/50">{t.accounting.dashboard.expensesLabel}</span>
                    <span className="font-bold text-secondary/70">{formatCurrency(apt.expenses)}</span>
                  </div>
                  <div className="h-px bg-primary/10" />
                  <div className="flex items-center justify-between text-xs font-dubai">
                    <span className="text-secondary/60 font-bold">{t.accounting.dashboard.netProfit}</span>
                    <span className={`font-bold ${apt.profit >= 0 ? 'text-secondary' : 'text-secondary/50'}`}>
                      {formatCurrency(apt.profit)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-primary/10">
                  <div className="flex items-center gap-1 text-[10px] text-secondary/50 font-dubai">
                    <CalendarDays className="w-3 h-3" />
                    {apt.bookings} {t.accounting.common.booking}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-secondary/50 font-dubai">
                    <Moon className="w-3 h-3" />
                    {apt.nights} {t.accounting.common.night}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ProjectSummary;
