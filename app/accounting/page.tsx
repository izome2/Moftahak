'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  LayoutDashboard,
  DollarSign,
  Receipt,
  TrendingUp,
  CalendarCheck,
  Building2,
  Percent,
  Menu,
  ChevronRight,
  ChevronLeft,
  RefreshCw,
  ClipboardCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import AccountingStatsCard from '@/components/accounting/dashboard/StatsCards';
import RevenueExpenseChart from '@/components/accounting/dashboard/RevenueExpenseChart';
import ExpensePieChart from '@/components/accounting/dashboard/ExpensePieChart';
import BookingSourceChart from '@/components/accounting/dashboard/BookingSourceChart';
import RecentBookings from '@/components/accounting/dashboard/RecentBookings';
import RecentExpenses from '@/components/accounting/dashboard/RecentExpenses';
import DailyAlerts from '@/components/accounting/dashboard/DailyAlerts';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Types ---
interface DashboardStats {
  totalRevenue?: number;
  totalExpenses: number;
  profit?: number;
  bookingsCount?: number;
  apartmentsCount: number;
  occupancyRate?: number;
  pendingExpensesCount?: number;
}

interface MonthlyTrend {
  month: string;
  revenue: number;
  expenses: number;
  profit: number;
}

interface CategoryData {
  category: string;
  amount: number;
}

interface SourceData {
  source: string;
  amount: number;
  count: number;
}

interface BookingItem {
  id: string;
  clientName: string;
  apartment: string;
  checkIn: string;
  checkOut: string;
  amount: number;
  source: string;
  status: string;
}

interface ExpenseItem {
  id: string;
  description: string;
  apartment: string;
  date: string;
  amount: number;
  category: string;
}

interface CheckInItem {
  id: string;
  clientName: string;
  apartment: string;
  arrivalTime?: string | null;
  checkIn: string;
  checkOut: string;
}

interface CheckOutItem {
  id: string;
  clientName: string;
  apartment: string;
  checkOut: string;
}

type AccountingRole = 'GENERAL_MANAGER' | 'OPS_MANAGER' | 'BOOKING_MANAGER' | 'INVESTOR';

interface DashboardData {
  month: string;
  role: AccountingRole;
  stats: DashboardStats;
  charts: {
    monthlyTrend: MonthlyTrend[];
    expensesByCategory: CategoryData[];
    bookingsBySource: SourceData[];
  };
  recentBookings: BookingItem[];
  recentExpenses: ExpenseItem[];
  alerts: {
    checkIns: CheckInItem[];
    checkOuts: CheckOutItem[];
  };
}

// --- Month helpers ---
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const changeMonth = (month: string, delta: number) => {
  const [year, m] = month.split('-').map(Number);
  const date = new Date(year, m - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
};

// --- Component ---
export default function AccountingDashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation();
  const { language } = useLanguage();

  const formatMonthDisplay = (month: string) => {
    const [year, m] = month.split('-');
    const monthIndex = parseInt(m, 10) - 1;
    return `${t.accounting.months[monthIndex] || m} ${year}`;
  };

  const locale = language === 'ar' ? 'ar-EG' : 'en-US';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat(locale).format(amount) + ' ' + t.accounting.common.currency;
  };

  const fmtNum = (n: number) => new Intl.NumberFormat(locale).format(n);

  const fetchDashboard = useCallback(async (m: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch(`/api/accounting/dashboard?month=${m}`);
      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || t.accounting.errors.fetchData);
      }

      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard(month);
  }, [month, fetchDashboard]);

  const goToPrevMonth = () => setMonth(prev => changeMonth(prev, -1));
  const goToNextMonth = () => setMonth(prev => changeMonth(prev, 1));
  const isCurrentMonth = month === getCurrentMonth();

  // الدور الفعلي من استجابة API
  const role = data?.role || 'GENERAL_MANAGER';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center justify-between gap-3 will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <LayoutDashboard size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
              {t.accounting.dashboard.title}
            </h1>
            <p className="text-sm text-secondary/60 font-dubai">
              {t.accounting.dashboard.subtitle}
            </p>
          </div>
        </div>

        {/* Mobile menu + Refresh */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchDashboard(month)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label={t.accounting.common.refresh}
            title={t.accounting.common.refresh}
          >
            <RefreshCw size={20} className={`text-secondary/60 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => {
              const event = new CustomEvent('openAccountingMenu');
              window.dispatchEvent(event);
            }}
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label={t.accounting.common.openMenu}
          >
            <Menu size={28} className="text-secondary" />
          </button>
        </div>
      </motion.div>

      {/* Month Selector */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.05 }}
        className="flex items-center justify-center gap-4"
      >
        <button
          onClick={goToPrevMonth}
          className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          aria-label={t.accounting.monthSelector.prevMonth}
        >
          <ChevronRight size={20} className="text-secondary" />
        </button>
        <div className="text-center min-w-[160px]">
          <p className="text-lg font-bold text-secondary font-dubai">
            {formatMonthDisplay(month)}
          </p>
        </div>
        <button
          onClick={goToNextMonth}
          disabled={isCurrentMonth}
          className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          aria-label={t.accounting.monthSelector.nextMonth}
        >
          <ChevronLeft size={20} className="text-secondary" />
        </button>
      </motion.div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 rounded-xl text-center"
        >
          <p className="text-red-600 font-dubai text-sm">{error}</p>
          <button
            onClick={() => fetchDashboard(month)}
            className="mt-2 text-sm text-red-500 underline font-dubai"
          >
            {t.accounting.common.retry}
          </button>
        </motion.div>
      )}

      {/* Stats Cards - filtered by role */}
      <div className={`grid grid-cols-2 gap-3 sm:gap-4 ${
        role === 'OPS_MANAGER' ? 'md:grid-cols-2' :
        role === 'BOOKING_MANAGER' ? 'md:grid-cols-3' :
        'md:grid-cols-3 xl:grid-cols-6'
      }`}>
        {/* الإيرادات - ليست لمدير التشغيل أو مدير الحجوزات */}
        {role !== 'OPS_MANAGER' && role !== 'BOOKING_MANAGER' && (
          <AccountingStatsCard
            icon={DollarSign}
            label={t.accounting.dashboard.totalRevenue}
            value={data ? formatCurrency(data.stats.totalRevenue ?? 0) : '...'}
            index={0}
            isLoading={isLoading}
          />
        )}
        {/* المصروفات - ليست لمدير الحجوزات */}
        {role !== 'BOOKING_MANAGER' && (
          <AccountingStatsCard
            icon={Receipt}
            label={t.accounting.dashboard.totalExpenses}
            value={data ? formatCurrency(data.stats.totalExpenses) : '...'}
            index={1}
            isLoading={isLoading}
          />
        )}
        {/* الربح - فقط للمدير العام */}
        {role === 'GENERAL_MANAGER' && (
          <AccountingStatsCard
            icon={TrendingUp}
            label={t.accounting.dashboard.netProfit}
            value={data ? formatCurrency(data.stats.profit ?? 0) : '...'}
            index={2}
            isLoading={isLoading}
          />
        )}
        {/* الحجوزات - ليست لمدير التشغيل */}
        {role !== 'OPS_MANAGER' && (
          <AccountingStatsCard
            icon={CalendarCheck}
            label={t.accounting.dashboard.bookingsCount}
            value={data ? fmtNum(data.stats.bookingsCount ?? 0) : '...'}
            index={3}
            isLoading={isLoading}
          />
        )}
        {/* عدد الشقق - للجميع */}
        <AccountingStatsCard
          icon={Building2}
          label={t.accounting.dashboard.apartmentsCount}
          value={data ? fmtNum(data.stats.apartmentsCount) : '...'}
          index={4}
          isLoading={isLoading}
        />
        {/* الإشغال - ليست لمدير التشغيل */}
        {role !== 'OPS_MANAGER' && (
          <AccountingStatsCard
            icon={Percent}
            label={t.accounting.dashboard.occupancyRate}
            value={data ? `${fmtNum(data.stats.occupancyRate ?? 0)}%` : '...'}
            subtitle={data ? t.accounting.common.ofNApartments(data.stats.apartmentsCount) : undefined}
            index={5}
            isLoading={isLoading}
          />
        )}
        {/* مصروفات في انتظار الموافقة - فقط للمدير العام */}
        {role === 'GENERAL_MANAGER' && (data?.stats.pendingExpensesCount ?? 0) > 0 && (
          <AccountingStatsCard
            icon={ClipboardCheck}
            label={t.accounting.dashboard.pendingApproval}
            value={data ? fmtNum(data.stats.pendingExpensesCount ?? 0) : '...'}
            index={6}
            isLoading={isLoading}
          />
        )}
      </div>

      {/* Charts Row */}
      <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
        role === 'OPS_MANAGER' || role === 'BOOKING_MANAGER' ? '' : 'lg:grid-cols-2'
      }`}>
        {/* Revenue vs Expenses Line Chart - فقط للمدير العام */}
        {role !== 'OPS_MANAGER' && role !== 'BOOKING_MANAGER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white border-2 border-primary/20 p-5 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
          >
            <h3 className="text-lg font-bold text-secondary font-dubai mb-4 flex items-center gap-2">
              <TrendingUp size={18} className="text-primary" />
              {t.accounting.dashboard.revenueExpenses12Months}
            </h3>
            <RevenueExpenseChart
              data={data?.charts.monthlyTrend || []}
              isLoading={isLoading}
            />
          </motion.div>
        )}

        {/* Expenses Pie Chart - ليس لمدير الحجوزات */}
        {role !== 'BOOKING_MANAGER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="bg-white border-2 border-primary/20 p-5 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
          >
            <h3 className="text-lg font-bold text-secondary font-dubai mb-4 flex items-center gap-2">
              <Receipt size={18} className="text-red-400" />
              {t.accounting.dashboard.expensesByCategory}
            </h3>
            <ExpensePieChart
              data={data?.charts.expensesByCategory || []}
              isLoading={isLoading}
            />
          </motion.div>
        )}
      </div>

      {/* Booking Sources Chart - ليس لمدير التشغيل أو مدير الحجوزات */}
      {role !== 'OPS_MANAGER' && role !== 'BOOKING_MANAGER' && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.25 }}
          className="bg-white border-2 border-primary/20 p-5 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
        >
          <h3 className="text-lg font-bold text-secondary font-dubai mb-4 flex items-center gap-2">
            <CalendarCheck size={18} className="text-primary" />
            {t.accounting.dashboard.bookingSources}
          </h3>
          <div className="max-w-xl mx-auto">
            <BookingSourceChart
              data={data?.charts.bookingsBySource || []}
              isLoading={isLoading}
            />
          </div>
        </motion.div>
      )}

      {/* Bottom Section: Recent + Alerts */}
      <div className={`grid grid-cols-1 gap-4 sm:gap-6 ${
        role === 'OPS_MANAGER' ? 'lg:grid-cols-2' :
        role === 'BOOKING_MANAGER' ? 'lg:grid-cols-2' :
        'lg:grid-cols-3'
      }`}>
        {/* Recent Bookings - ليس لمدير التشغيل */}
        {role !== 'OPS_MANAGER' && (
          <div className="lg:col-span-1">
            <RecentBookings
              bookings={data?.recentBookings || []}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Recent Expenses - ليس لمدير الحجوزات */}
        {role !== 'BOOKING_MANAGER' && (
          <div className="lg:col-span-1">
            <RecentExpenses
              expenses={data?.recentExpenses || []}
              isLoading={isLoading}
            />
          </div>
        )}

        {/* Daily Alerts */}
        <div className="lg:col-span-1">
          <DailyAlerts
            checkIns={data?.alerts.checkIns || []}
            checkOuts={data?.alerts.checkOuts || []}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}
