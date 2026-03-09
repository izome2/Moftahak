'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart3,
  Calendar,
  RefreshCw,
  Info,
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <BarChart3 size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary font-dubai">{t.accounting.reports.title}</h1>
            <p className="text-sm text-secondary/60 font-dubai">
              {mode === 'monthly' ? t.accounting.reports.monthlySubtitle : t.accounting.reports.yearlySubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ExportButtons
            month={mode === 'monthly' ? month : year}
            reportType={mode}
          />
          <button
            onClick={() => mode === 'monthly' ? fetchMonthly(month) : fetchAnnual(year)}
            disabled={isLoading}
            className="p-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </motion.div>

      {/* Mode Toggle + Period Selector */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4
          bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
      >
        {/* Mode toggle */}
        <div className="flex items-center gap-1 bg-primary/5 rounded-xl p-1">
          <button
            onClick={() => setMode('monthly')}
            className={`px-4 py-2 text-xs font-bold font-dubai rounded-lg transition-all duration-200
              ${mode === 'monthly'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-secondary/50 hover:text-secondary'
              }`}
          >
            <Calendar className="w-3.5 h-3.5 inline-block ml-1" />
            {t.accounting.reports.monthly}
          </button>
          <button
            onClick={() => setMode('annual')}
            className={`px-4 py-2 text-xs font-bold font-dubai rounded-lg transition-all duration-200
              ${mode === 'annual'
                ? 'bg-secondary text-white shadow-sm'
                : 'text-secondary/50 hover:text-secondary'
              }`}
          >
            <BarChart3 className="w-3.5 h-3.5 inline-block ml-1" />
            {t.accounting.reports.yearly}
          </button>
        </div>

        {/* Period selector */}
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
      </motion.div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-600
              flex items-center gap-2 font-dubai"
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
              className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
            >
              <h3 className="text-sm font-bold text-secondary font-dubai mb-3">
                📊 {t.accounting.reports.apartmentComparison}
              </h3>
              <ApartmentComparisonChart
                data={comparisonData}
                isLoading={isLoadingMonthly}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
            >
              <h3 className="text-sm font-bold text-secondary font-dubai mb-3">
                📊 {t.accounting.reports.occupancyPerApartment}
              </h3>
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
              className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
            >
              <h3 className="text-sm font-bold text-secondary font-dubai mb-3">
                🥧 {t.accounting.reports.expensesByCategory}
              </h3>
              <ExpensePieChart
                data={expensesPieData}
                isLoading={isLoadingMonthly}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
            >
              <h3 className="text-sm font-bold text-secondary font-dubai mb-3">
                🥧 {t.accounting.reports.bookingSources}
              </h3>
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
            className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
          >
            <h3 className="text-sm font-bold text-secondary font-dubai mb-3">
              📈 {t.accounting.reports.profitTrend(Number(year))}
            </h3>
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
              className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
            >
              <h3 className="text-sm font-bold text-secondary font-dubai mb-3">
                📊 {t.accounting.reports.yearlyApartmentComparison}
              </h3>
              <ApartmentComparisonChart
                data={annualComparisonData}
                isLoading={isLoadingAnnual}
              />
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
              className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
            >
              <h3 className="text-sm font-bold text-secondary font-dubai mb-3">
                📊 {t.accounting.reports.totalOccupancy}
              </h3>
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
  );
}
