'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Wallet,
  RefreshCw,
  Loader2,
  Info,
  Building2,
  DollarSign,
  Receipt,
  TrendingUp,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/hooks/useTranslation';
import ApartmentView from '@/components/accounting/investor/ApartmentView';
import WithdrawalsTable from '@/components/accounting/investor/WithdrawalsTable';
import BalanceCard from '@/components/accounting/investor/BalanceCard';
import AccountingStatsCard from '@/components/accounting/dashboard/StatsCards';

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

interface InvestorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

interface Totals {
  totalInvestorProfit: number;
  totalWithdrawals: number;
  totalBalance: number;
}

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

export default function MyInvestmentsPage() {
  const { data: session } = useSession();
  const t = useTranslation();
  const userId = session?.user?.id;

  // Data
  const [investor, setInvestor] = useState<InvestorInfo | null>(null);
  const [investments, setInvestments] = useState<InvestmentData[]>([]);
  const [totals, setTotals] = useState<Totals>({ totalInvestorProfit: 0, totalWithdrawals: 0, totalBalance: 0 });
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [withdrawalsTotal, setWithdrawalsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Aggregate stats for widgets
  const aggregateStats = useMemo(() => {
    const totalRevenue = investments.reduce((s, inv) => s + inv.totalRevenue, 0);
    const totalExpenses = investments.reduce((s, inv) => s + inv.totalExpenses, 0);
    return { totalRevenue, totalExpenses, apartmentsCount: investments.length };
  }, [investments]);

  const formatCurrency = (amount: number) =>
    '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);

  const fmtNum = (n: number) => new Intl.NumberFormat('en-US').format(n);

  // --- Fetch investor data ---
  const fetchData = useCallback(async () => {
    if (!userId) return;

    try {
      setIsLoading(true);
      setError(null);

      // Fetch investment summary and withdrawals in parallel
      const [summaryRes, withdrawalsRes] = await Promise.all([
        fetch(`/api/accounting/investors/${userId}`),
        fetch(`/api/accounting/investors/${userId}/withdrawals`),
      ]);

      const summaryJson = await summaryRes.json();
      const withdrawalsJson = await withdrawalsRes.json();

      if (!summaryRes.ok) {
        setError(summaryJson.error || t.accounting.errors.loadInvestmentData);
        return;
      }

      setInvestor(summaryJson.investor || null);
      setInvestments(summaryJson.investments || []);
      setTotals(summaryJson.totals || { totalInvestorProfit: 0, totalWithdrawals: 0, totalBalance: 0 });

      if (withdrawalsRes.ok) {
        setWithdrawals(withdrawalsJson.withdrawals || []);
        setWithdrawalsTotal(withdrawalsJson.total || 0);
      }
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const investorName = investor
    ? `${investor.firstName} ${investor.lastName}`
    : '';

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5" dir="rtl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary font-dubai tracking-tight">
              {t.accounting.myInvestments.title}
              {investorName && (
                <span className="text-sm font-normal text-secondary/40 mr-2">
                  — {investorName}
                </span>
              )}
            </h1>
            <p className="text-xs text-secondary/60 font-dubai mt-0.5">
              {t.accounting.myInvestments.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-2 hover:bg-secondary/5 rounded-xl transition-all"
        >
          <RefreshCw size={16} className={`text-secondary/40 ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center gap-3 text-secondary/40">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-dubai">{t.accounting.myInvestments.loadingData}</p>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
              className="bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-3 text-sm text-red-600
              flex items-center gap-2 font-dubai backdrop-blur-sm"
          >
            <Info className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {!isLoading && !error && (
        <>
          {/* Balance Card */}
          <BalanceCard
            totalProfit={totals.totalInvestorProfit}
            totalWithdrawals={totals.totalWithdrawals}
            balance={totals.totalBalance}
            currency="USD"
          />

          {/* Stats Widgets */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            <AccountingStatsCard
              icon={DollarSign}
              label={t.accounting.dashboard.totalRevenue}
              value={isLoading ? '...' : formatCurrency(aggregateStats.totalRevenue)}
              index={0}
              isLoading={isLoading}
            />
            <AccountingStatsCard
              icon={Receipt}
              label={t.accounting.dashboard.totalExpenses}
              value={isLoading ? '...' : formatCurrency(aggregateStats.totalExpenses)}
              index={1}
              isLoading={isLoading}
            />
            <AccountingStatsCard
              icon={Building2}
              label={t.accounting.dashboard.apartmentsCount}
              value={isLoading ? '...' : fmtNum(aggregateStats.apartmentsCount)}
              index={2}
              isLoading={isLoading}
            />
          </div>

          {/* Apartments count */}
          {investments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 text-xs text-secondary/60 font-dubai"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>{t.accounting.myInvestments.investmentsIn(investments.length)}</span>
            </motion.div>
          )}

          {/* No investments */}
          {investments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-16"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
                <Wallet className="w-6 h-6 text-secondary/25" />
              </div>
              <p className="text-secondary/40 font-dubai text-sm">
                {t.accounting.myInvestments.noInvestments}
              </p>
              <p className="text-secondary/30 font-dubai text-xs mt-1">
                {t.accounting.myInvestments.contactAdmin}
              </p>
            </motion.div>
          )}

          {/* Apartment Investment Cards */}
          <div className="space-y-4">
            {investments.map((inv, i) => (
              <ApartmentView
                key={inv.investmentId}
                investment={inv}
                currency="USD"
              />
            ))}
          </div>

          {/* Withdrawals Table */}
          {withdrawals.length > 0 && (
            <WithdrawalsTable
              withdrawals={withdrawals}
              total={withdrawalsTotal}
              currency="USD"
            />
          )}
        </>
      )}
    </div>
  );
}
