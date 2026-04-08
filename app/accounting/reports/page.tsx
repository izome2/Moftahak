'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Info,
  PieChart,
  TrendingUp,
  Building2,
  Moon,
  Globe,
} from 'lucide-react';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import ProjectSummary from '@/components/accounting/reports/ProjectSummary';
import ApartmentComparisonChart from '@/components/accounting/reports/ApartmentComparisonChart';
import OccupancyChart from '@/components/accounting/reports/OccupancyChart';
import ProfitTrendChart from '@/components/accounting/reports/ProfitTrendChart';
import ExportButtons from '@/components/accounting/reports/ExportButtons';
import ExpensePieChart from '@/components/accounting/dashboard/ExpensePieChart';
import BookingSourceChart from '@/components/accounting/dashboard/BookingSourceChart';
import { useTranslation } from '@/hooks/useTranslation';

// --- Types ---
interface ApartmentReport {
  id: string;
  name: string;
  project?: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
  occupiedNights: number;
  revenueBySource?: Record<string, number>;
  expensesByCategory?: Record<string, number>;
}

interface MonthlyTotals {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  apartmentsCount: number;
}

interface MonthlyReportData {
  month: string;
  apartments: ApartmentReport[];
  bookingsBySource: Record<string, { amount: number; nights: number; count: number }>;
  expensesByCategory: Record<string, { amount: number; count: number }>;
  totals: MonthlyTotals;
}

interface AnnualMonthRow {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
  nights: number;
}

interface AnnualAptRow {
  apartmentId: string;
  name: string;
  project?: string;
  revenue: number;
  expenses: number;
  profit: number;
  bookings: number;
  nights: number;
}

interface AnnualReportData {
  year: string;
  monthlyBreakdown: AnnualMonthRow[];
  apartmentBreakdown: AnnualAptRow[];
  totals: { revenue: number; expenses: number; profit: number; bookings: number; nights: number };
}

type ReportMode = 'monthly' | 'annual';

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const getDaysInMonth = (month: string) => {
  const [y, m] = month.split('-').map(Number);
  return new Date(y, m, 0).getDate();
};

export default function ReportsPage() {
  const t = useTranslation();
  const [mode, setMode] = useState<ReportMode>('monthly');
  const [month, setMonth] = useState(getCurrentMonth());
  const [year, setYear] = useState(new Date().getFullYear().toString());

  // Monthly data
  const [monthlyData, setMonthlyData] = useState<MonthlyReportData | null>(null);
  const [isLoadingMonthly, setIsLoadingMonthly] = useState(false);

  // Annual data
  const [annualData, setAnnualData] = useState<AnnualReportData | null>(null);
  const [isLoadingAnnual, setIsLoadingAnnual] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // --- Fetch monthly report ---
  const fetchMonthly = useCallback(async (m: string) => {
    try {
      setIsLoadingMonthly(true);
      setError(null);
      const res = await fetch(`/api/accounting/reports/monthly?month=${m}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || t.accounting.errors.generic); return; }
      setMonthlyData(json);
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsLoadingMonthly(false);
    }
  }, []);

  // --- Fetch annual report ---
  const fetchAnnual = useCallback(async (y: string) => {
    try {
      setIsLoadingAnnual(true);
      setError(null);
      const res = await fetch(`/api/accounting/reports/annual?year=${y}`);
      const json = await res.json();
      if (!res.ok) { setError(json.error || t.accounting.errors.generic); return; }
      setAnnualData(json);
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsLoadingAnnual(false);
    }
  }, []);

  useEffect(() => {
    if (mode === 'monthly') fetchMonthly(month);
    else fetchAnnual(year);
  }, [mode, month, year, fetchMonthly, fetchAnnual]);

  const isLoading = mode === 'monthly' ? isLoadingMonthly : isLoadingAnnual;

  // Derived data for charts (monthly mode)
  const comparisonData = monthlyData?.apartments.map(a => ({
    name: a.name,
    revenue: a.revenue,
    expenses: a.expenses,
    profit: a.profit,
  })) || [];

  const occupancyData = monthlyData?.apartments.map(a => ({
    name: a.name,
    nights: a.occupiedNights,
    bookings: a.bookings,
  })) || [];

  const expensesPieData = monthlyData?.expensesByCategory
    ? Object.entries(monthlyData.expensesByCategory).map(([category, d]) => ({
        category,
        amount: d.amount,
      }))
    : [];

  const sourcesPieData = monthlyData?.bookingsBySource
    ? Object.entries(monthlyData.bookingsBySource).map(([source, d]) => ({
        source,
        amount: d.amount,
        count: d.count,
      }))
    : [];

  const summaryApartments = monthlyData?.apartments.map(a => ({
    apartmentId: a.id,
    name: a.name,
    project: a.project,
    revenue: a.revenue,
    expenses: a.expenses,
    profit: a.profit,
    bookings: a.bookings,
    nights: a.occupiedNights,
  })) || [];

  // Annual mode derived data
  const annualComparisonData = annualData?.apartmentBreakdown.map(a => ({
    name: a.name,
    revenue: a.revenue,
    expenses: a.expenses,
    profit: a.profit,
  })) || [];

  const annualOccupancyData = annualData?.apartmentBreakdown.map(a => ({
    name: a.name,
    nights: a.nights,
    bookings: a.bookings,
  })) || [];

  const annualSummaryApartments = annualData?.apartmentBreakdown.map(a => ({
    apartmentId: a.apartmentId,
    name: a.name,
    project: a.project,
    revenue: a.revenue,
    expenses: a.expenses,
    profit: a.profit,
    bookings: a.bookings,
    nights: a.nights,
  })) || [];

  const annualTotals = annualData
    ? {
        totalRevenue: annualData.totals.revenue,
        totalExpenses: annualData.totals.expenses,
        profit: annualData.totals.profit,
        apartmentsCount: annualData.apartmentBreakdown.length,
      }
    : { totalRevenue: 0, totalExpenses: 0, profit: 0, apartmentsCount: 0 };

  // Year selector options
  const currentYear = new Date().getFullYear();
  const yearOptions = Array.from({ length: 5 }, (_, i) => String(currentYear - i));

  return (
    <div className="flex-1 flex flex-col gap-3" dir="rtl">
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
      {/* Title + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center shrink-0">
            <BarChart3 size={16} className="text-white sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-secondary font-dubai tracking-tight truncate">{t.accounting.reports.title}</h1>
            <p className="text-xs text-secondary/50 font-dubai mt-0.5 hidden sm:block">
              {mode === 'monthly' ? t.accounting.reports.monthlySubtitle : t.accounting.reports.yearlySubtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <ExportButtons
            month={mode === 'monthly' ? month : year}
            reportType={mode}
          />
          <button
            onClick={() => mode === 'monthly' ? fetchMonthly(month) : fetchAnnual(year)}
            disabled={isLoading}
            className="p-1.5 sm:p-2 hover:bg-secondary/5 rounded-xl transition-all"
          >
            <RefreshCw size={15} className={`text-secondary/40 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Mode Toggle + Period Selector */}
      <div className="flex items-center justify-center gap-3">
        <div className="flex items-center gap-0.5 bg-white border-2 border-primary/20 rounded-xl p-0.5 shadow-[0_2px_12px_rgba(237,191,140,0.10)]">
          <button
            onClick={() => setMode('monthly')}
            className={`px-4 py-2 text-sm font-bold font-dubai rounded-lg transition-all duration-200 flex items-center gap-1.5
              ${mode === 'monthly'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-secondary/50 hover:text-secondary'
              }`}
          >
            <Calendar size={14} />
            {t.accounting.reports.monthly}
          </button>
          <button
            onClick={() => setMode('annual')}
            className={`px-4 py-2 text-sm font-bold font-dubai rounded-lg transition-all duration-200 flex items-center gap-1.5
              ${mode === 'annual'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-secondary/50 hover:text-secondary'
              }`}
          >
            <BarChart3 size={14} />
            {t.accounting.reports.yearly}
          </button>
        </div>

        {mode === 'monthly' ? (
          <MonthSelector month={month} onChange={setMonth} />
        ) : (
          <CustomSelect
            value={year}
            onChange={setYear}
            variant="filter"
            options={yearOptions.map(y => ({ value: y, label: y }))}
          />
        )}
      </div>
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-3 text-sm text-red-600
              flex items-center gap-2 font-dubai backdrop-blur-sm"
          >
            <Info className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="mr-auto text-red-400 hover:text-red-600">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ========== MONTHLY MODE ========== */}
      {mode === 'monthly' && (
        <div className="space-y-6">
          {/* Project Summary (totals + apartment cards) */}
          <ProjectSummary
            apartments={summaryApartments}
            totals={monthlyData?.totals || { totalRevenue: 0, totalExpenses: 0, profit: 0, apartmentsCount: 0 }}
            isLoading={isLoadingMonthly}
          />

          {/* Charts Row 1: Comparison + Occupancy */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="bg-white border border-secondary/[0.08] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <BarChart3 size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">
                  {t.accounting.reports.apartmentComparison}
                </h3>
              </div>
              <ApartmentComparisonChart
                data={comparisonData}
                isLoading={isLoadingMonthly}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-secondary/[0.08] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Moon size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">
                  {t.accounting.reports.occupancyPerApartment}
                </h3>
              </div>
              <OccupancyChart
                data={occupancyData}
                daysInMonth={getDaysInMonth(month)}
                isLoading={isLoadingMonthly}
              />
            </motion.div>
          </div>

          {/* Charts Row 2: Expenses Pie + Sources Pie */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border border-secondary/[0.08] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <PieChart size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">
                  {t.accounting.reports.expensesByCategory}
                </h3>
              </div>
              <ExpensePieChart
                data={expensesPieData}
                isLoading={isLoadingMonthly}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border border-secondary/[0.08] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Globe size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">
                  {t.accounting.reports.bookingSources}
                </h3>
              </div>
              <BookingSourceChart
                data={sourcesPieData}
                isLoading={isLoadingMonthly}
              />
            </motion.div>
          </div>
        </div>
      )}

      {/* ========== ANNUAL MODE ========== */}
      {mode === 'annual' && (
        <div className="space-y-6">
          {/* Project Summary (totals + apartment cards) */}
          <ProjectSummary
            apartments={annualSummaryApartments}
            totals={annualTotals}
            isLoading={isLoadingAnnual}
          />

          {/* Profit Trend (12 months) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="bg-white border border-secondary/[0.08] rounded-2xl p-4 shadow-sm"
          >
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                <TrendingUp size={14} className="text-white" />
              </div>
              <h3 className="text-sm font-bold text-secondary font-dubai">
                {t.accounting.reports.profitTrend(Number(year))}
              </h3>
            </div>
            <ProfitTrendChart
              data={annualData?.monthlyBreakdown || []}
              isLoading={isLoadingAnnual}
            />
          </motion.div>

          {/* Charts Row: Comparison + Occupancy (Annual) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border border-secondary/[0.08] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Building2 size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">
                  {t.accounting.reports.yearlyApartmentComparison}
                </h3>
              </div>
              <ApartmentComparisonChart
                data={annualComparisonData}
                isLoading={isLoadingAnnual}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border border-secondary/[0.08] rounded-2xl p-4 shadow-sm"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Moon size={14} className="text-white" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">
                  {t.accounting.reports.totalOccupancy}
                </h3>
              </div>
              <OccupancyChart
                data={annualOccupancyData}
                daysInMonth={365}
                isLoading={isLoadingAnnual}
              />
            </motion.div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
}
