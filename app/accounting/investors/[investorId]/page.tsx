'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mail,
  ArrowRight,
  Loader2,
  AlertTriangle,
  RefreshCw,
  Building2,
} from 'lucide-react';
import ApartmentView from '@/components/accounting/investor/ApartmentView';
import BalanceCard from '@/components/accounting/investor/BalanceCard';
import WithdrawalsTable from '@/components/accounting/investor/WithdrawalsTable';
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

interface InvestorInfo {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
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

interface InvestorDetailData {
  investor: InvestorInfo;
  investments: InvestmentData[];
  totals: {
    totalInvestorProfit: number;
    totalWithdrawals: number;
    totalBalance: number;
  };
}

export default function InvestorDetailPage() {
  const params = useParams();
  const router = useRouter();
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const investorId = params.investorId as string;

  const [data, setData] = useState<InvestorDetailData | null>(null);
  const [withdrawals, setWithdrawals] = useState<WithdrawalRow[]>([]);
  const [withdrawalsTotal, setWithdrawalsTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawalsLoading, setIsWithdrawalsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/accounting/investors/${investorId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t.accounting.errors.fetchInvestorData);
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsLoading(false);
    }
  }, [investorId]);

  const fetchWithdrawals = useCallback(async () => {
    setIsWithdrawalsLoading(true);
    try {
      const res = await fetch(`/api/accounting/investors/${investorId}/withdrawals`);
      const json = await res.json();
      if (res.ok) {
        setWithdrawals(json.withdrawals || []);
        setWithdrawalsTotal(json.total || 0);
      }
    } catch {
      // Silently fail for withdrawals
    } finally {
      setIsWithdrawalsLoading(false);
    }
  }, [investorId]);

  useEffect(() => {
    fetchData();
    fetchWithdrawals();
  }, [fetchData, fetchWithdrawals]);

  return (
    <div className="flex-1 flex flex-col gap-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Header Card */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] p-3 sm:p-4 md:p-5 lg:p-6">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
            <button
              onClick={() => router.back()}
              className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center shrink-0 hover:opacity-90 transition-opacity"
            >
              <ArrowRight size={16} className="text-white sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-secondary font-dubai tracking-tight truncate">
                {t.accounting.investorDetail.financialDetails}
                {data && (
                  <span className="text-sm font-normal text-secondary/70 mr-2">
                    — {data.investor.firstName} {data.investor.lastName}
                  </span>
                )}
              </h1>
              {data?.investor.email && (
                <p className="text-xs text-secondary/80 font-dubai mt-0.5 hidden sm:flex items-center gap-1">
                  <Mail className="w-3 h-3" />
                  {data.investor.email}
                </p>
              )}
            </div>
          </div>
          <button
            onClick={() => { fetchData(); fetchWithdrawals(); }}
            disabled={isLoading}
            className="p-1.5 sm:p-2 hover:bg-secondary/5 rounded-xl transition-all shrink-0"
          >
            <RefreshCw size={15} className={`text-secondary/70 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Card */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
        {/* Loading State */}
        {isLoading && (
          <div className="py-16 flex flex-col items-center gap-3 text-secondary/70">
            <Loader2 className="w-8 h-8 animate-spin" />
            <p className="text-sm font-dubai">{t.accounting.investorDetail.loadingData}</p>
          </div>
        )}

        {/* Error State */}
        <AnimatePresence>
          {error && !isLoading && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-3 text-sm text-red-600
                flex items-center gap-2 font-dubai backdrop-blur-sm"
            >
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {error}
              <button
                onClick={fetchData}
                className="mr-auto px-3 py-1 bg-secondary text-white rounded-lg text-xs font-dubai
                  hover:bg-secondary/90 transition-colors"
              >
                {t.accounting.common.retry}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {data && !isLoading && (
          <>
            {/* Investor Info Card */}
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gradient-to-bl from-[#10302b] via-[#163d36] to-[#1a4a42] rounded-2xl
                border border-[#8a9a7a]/20 shadow-[0_8px_32px_rgba(16,48,43,0.35)] overflow-hidden p-5"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-white/10 border border-white/15
                  flex items-center justify-center text-white font-bold text-lg shrink-0"
                >
                  {data.investor.firstName.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-lg font-bold text-white font-dubai truncate">
                    {data.investor.firstName} {data.investor.lastName}
                  </h2>
                  {data.investor.email && (
                    <p className="flex items-center gap-1 text-sm text-white/80 font-dubai mt-0.5">
                      <Mail className="w-3.5 h-3.5" />
                      <span className="truncate">{data.investor.email}</span>
                    </p>
                  )}
                </div>
                <div className="text-center shrink-0 bg-white/5 border border-white/8 rounded-xl px-4 py-3">
                  <p className="text-[11px] text-white/80 font-dubai">{t.accounting.investorDetail.investmentsCount}</p>
                  <p className="text-2xl font-bold text-primary font-dubai">
                    {data.investments.length}
                  </p>
                </div>
              </div>
            </motion.div>

          {/* Balance Card */}
          <BalanceCard
            totalProfit={data.totals.totalInvestorProfit}
            totalWithdrawals={data.totals.totalWithdrawals}
            balance={data.totals.totalBalance}
          />

          {/* Apartments / Investments */}
          {data.investments.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-white/60 rounded-2xl border border-secondary/[0.06] p-10 text-center"
            >
              <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-secondary/60" />
              </div>
              <p className="text-sm text-secondary/70 font-dubai">{t.accounting.investorDetail.noInvestments}</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.25 }}
                className="flex items-center gap-2 text-xs text-secondary/80 font-dubai"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>{t.accounting.investorDetail.investments(data.investments.length)}</span>
              </motion.div>
              {data.investments.map((inv) => (
                <ApartmentView key={inv.investmentId} investment={inv} />
              ))}
            </div>
          )}

          {/* Withdrawals */}
          <WithdrawalsTable
            withdrawals={withdrawals}
            total={withdrawalsTotal}
            isLoading={isWithdrawalsLoading}
          />
          </>
        )}
      </div>
    </div>
  );
}
