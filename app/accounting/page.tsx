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
  RefreshCw,
  ClipboardCheck,
} from 'lucide-react';
import { motion } from 'framer-motion';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import AccountingStatsCard from '@/components/accounting/dashboard/StatsCards';
import RevenueExpenseChart from '@/components/accounting/dashboard/RevenueExpenseChart';
import ExpensePieChart from '@/components/accounting/dashboard/ExpensePieChart';
import BookingSourceChart from '@/components/accounting/dashboard/BookingSourceChart';
import RecentBookings from '@/components/accounting/dashboard/RecentBookings';
import RecentExpenses from '@/components/accounting/dashboard/RecentExpenses';
import DailyAlerts from '@/components/accounting/dashboard/DailyAlerts';
import { SkeletonDashboard } from '@/components/accounting/shared/Skeleton';
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

// --- Component ---
export default function AccountingDashboardPage() {
  const [month, setMonth] = useState(getCurrentMonth);
  const [data, setData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const t = useTranslation();
  const { language } = useLanguage();

  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';

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

  // الدور الفعلي من استجابة API
  const role = data?.role || 'GENERAL_MANAGER';

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Header + Month Selector */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="space-y-2 sm:space-y-3 will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        {/* Title + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center shrink-0">
              <LayoutDashboard size={16} className="text-white sm:w-5 sm:h-5" />
            </div>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-secondary font-dubai tracking-tight truncate">
                {t.accounting.dashboard.title}
              </h1>
              <p className="text-xs text-secondary/80 font-dubai mt-0.5 hidden sm:block">
                {t.accounting.dashboard.subtitle}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={() => fetchDashboard(month)}
              className="p-1.5 sm:p-2 hover:bg-secondary/5 rounded-lg transition-all"
              aria-label={t.accounting.common.refresh}
              title={t.accounting.common.refresh}
            >
              <RefreshCw size={15} className={`text-secondary/70 sm:w-[18px] sm:h-[18px] ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center">
          <MonthSelector month={month} onChange={setMonth} />
        </div>
      </motion.div>
      </div>

      {/* Content */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 overflow-y-auto">

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

      {/* Skeleton loading state - first load only */}
      {isLoading && !data && (
        <SkeletonDashboard />
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
      <div className={`grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 ${
        role === 'OPS_MANAGER' || role === 'BOOKING_MANAGER' ? '' : 'lg:grid-cols-2'
      }`}>
        {/* Revenue vs Expenses Line Chart - فقط للمدير العام */}
        {role !== 'OPS_MANAGER' && role !== 'BOOKING_MANAGER' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="bg-white border border-secondary/[0.08] p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-bold text-secondary font-dubai mb-3 sm:mb-4 flex items-center gap-2">
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
            className="bg-white border border-secondary/[0.08] p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm"
          >
            <h3 className="text-base sm:text-lg font-bold text-secondary font-dubai mb-3 sm:mb-4 flex items-center gap-2">
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
          className="bg-white border border-secondary/[0.08] p-3 sm:p-5 rounded-xl sm:rounded-2xl shadow-sm"
        >
          <h3 className="text-base sm:text-lg font-bold text-secondary font-dubai mb-3 sm:mb-4 flex items-center gap-2">
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
      <div className={`grid grid-cols-1 gap-3 sm:gap-4 md:gap-6 ${
        role === 'OPS_MANAGER' ? 'md:grid-cols-2' :
        role === 'BOOKING_MANAGER' ? 'md:grid-cols-2' :
        'md:grid-cols-2 lg:grid-cols-3'
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
    </div>
  );
}
