'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Wallet,
  RefreshCw,
  Loader2,
  Info,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import ApartmentView from '@/components/accounting/investor/ApartmentView';
import WithdrawalsTable from '@/components/accounting/investor/WithdrawalsTable';
import BalanceCard from '@/components/accounting/investor/BalanceCard';

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
  const userId = session?.user?.id;

  // Data
  const [investor, setInvestor] = useState<InvestorInfo | null>(null);
  const [investments, setInvestments] = useState<InvestmentData[]>([]);
  const [totals, setTotals] = useState<Totals>({ totalInvestorProfit: 0, totalWithdrawals: 0, totalBalance: 0 });
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [withdrawalsTotal, setWithdrawalsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
        setError(summaryJson.error || 'حدث خطأ في تحميل البيانات');
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
      setError('فشل الاتصال بالخادم');
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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <Wallet size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
              حساباتي
              {investorName && (
                <span className="text-sm font-normal text-secondary/40 mr-2">
                  — {investorName}
                </span>
              )}
            </h1>
            <p className="text-sm text-secondary/60 font-dubai">
              استثماراتك وأرباحك ومسحوباتك
            </p>
          </div>
        </div>

        <button
          onClick={fetchData}
          disabled={isLoading}
          className="p-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </motion.div>

      {/* Loading */}
      {isLoading && (
        <div className="py-16 flex flex-col items-center gap-3 text-secondary/40">
          <Loader2 className="w-8 h-8 animate-spin" />
          <p className="text-sm font-dubai">جاري تحميل بيانات الاستثمار...</p>
        </div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
              className="bg-[#c09080]/8 border-2 border-[#c09080]/20 rounded-xl px-4 py-3 text-sm text-[#c09080]
              flex items-center gap-2 font-dubai"
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

          {/* Apartments count */}
          {investments.length > 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.25 }}
              className="flex items-center gap-2 text-xs text-secondary/60 font-dubai"
            >
              <Building2 className="w-3.5 h-3.5" />
              <span>لديك استثمارات في {investments.length} شقة</span>
            </motion.div>
          )}

          {/* No investments */}
          {investments.length === 0 && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white rounded-2xl border-2 border-primary/20 py-16 text-center"
            >
              <Wallet className="w-12 h-12 mx-auto mb-3 text-secondary/20" />
              <p className="text-secondary/40 font-dubai text-sm">
                لا يوجد استثمارات مسجلة حالياً
              </p>
              <p className="text-secondary/30 font-dubai text-xs mt-1">
                تواصل مع المدير العام لربط حسابك بشقة
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
