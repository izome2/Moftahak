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

const formatCurrency = (amount: number, currency: string = 'USD') => {
  if (currency === 'EGP') return new Intl.NumberFormat('ar-EG').format(amount) + ' ج.م';
  return '$' + new Intl.NumberFormat('en-US', { minimumFractionDigits: 2 }).format(amount);
};

export default function InvestorDetailPage() {
  const params = useParams();
  const router = useRouter();
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
      if (!res.ok) throw new Error(json.error || 'فشل في جلب البيانات');
      setData(json);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Back button + Page header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/30
            flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors"
        >
          <ArrowRight className="w-5 h-5 text-primary" />
        </button>

        <div className="flex-1">
          <h1 className="text-xl sm:text-2xl font-bold text-secondary font-dubai">
            التفاصيل المالية
          </h1>
          {data && (
            <p className="text-sm text-secondary/50 font-dubai mt-0.5">
              {data.investor.firstName} {data.investor.lastName}
            </p>
          )}
        </div>

        <button
          onClick={() => { fetchData(); fetchWithdrawals(); }}
          disabled={isLoading}
          className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/30
            flex items-center justify-center shrink-0 hover:bg-primary/20 transition-colors
            disabled:opacity-40"
        >
          <RefreshCw className={`w-5 h-5 text-primary ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-20">
          <div className="text-center space-y-3">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-secondary/50 font-dubai">جاري تحميل بيانات المستثمر...</p>
          </div>
        </div>
      )}

      {/* Error State */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-[#c09080]/10 border-2 border-[#c09080]/25 rounded-2xl p-5 text-center"
          >
            <AlertTriangle className="w-8 h-8 text-[#c09080] mx-auto mb-2" />
            <p className="text-sm font-bold text-[#c09080] font-dubai mb-3">{error}</p>
            <button
              onClick={fetchData}
              className="px-4 py-2 bg-secondary text-white rounded-xl text-sm font-dubai
                hover:bg-secondary/90 transition-colors"
            >
              إعادة المحاولة
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Content */}
      {data && !isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="space-y-6"
        >
          {/* Investor Info Card */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white rounded-2xl border-2 border-primary/20 p-5
              shadow-[0_4px_20px_rgba(237,191,140,0.1)]"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-primary/10 border-2 border-primary/30
                flex items-center justify-center text-secondary font-bold text-lg shrink-0"
              >
                {data.investor.firstName.charAt(0)}
              </div>
              <div className="flex-1">
                <h2 className="text-lg font-bold text-secondary font-dubai">
                  {data.investor.firstName} {data.investor.lastName}
                </h2>
                {data.investor.email && (
                  <p className="flex items-center gap-1 text-sm text-secondary/50 font-dubai mt-0.5">
                    <Mail className="w-3.5 h-3.5" />
                    {data.investor.email}
                  </p>
                )}
              </div>
              <div className="text-left">
                <p className="text-xs text-secondary/40 font-dubai">عدد الاستثمارات</p>
                <p className="text-2xl font-bold text-secondary font-dubai">
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
              className="bg-white rounded-2xl border-2 border-primary/20 p-10 text-center"
            >
              <Building2 className="w-10 h-10 text-secondary/20 mx-auto mb-3" />
              <p className="text-sm text-secondary/40 font-dubai">لا يوجد استثمارات مرتبطة</p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <h3 className="text-base font-bold text-secondary font-dubai flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/30
                  flex items-center justify-center"
                >
                  <Building2 className="w-4 h-4 text-primary" />
                </div>
                الاستثمارات ({data.investments.length})
              </h3>
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
        </motion.div>
      )}
    </div>
  );
}
