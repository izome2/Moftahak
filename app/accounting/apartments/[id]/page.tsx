'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  ArrowRight,
  Menu,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import FinancialSummary from '@/components/accounting/apartments/FinancialSummary';
import BookingsTable from '@/components/accounting/apartments/BookingsTable';
import ExpensesTable from '@/components/accounting/apartments/ExpensesTable';
import InvestorsTable from '@/components/accounting/apartments/InvestorsTable';

// --- Types ---
interface ApartmentInfo {
  id: string;
  name: string;
  floor?: string | null;
  type?: string | null;
  project?: { id: string; name: string } | null;
  investors: InvestorRow[];
}

interface InvestorRow {
  id: string;
  user: { id: string; firstName: string; lastName: string; email?: string };
  percentage: number;
  investmentTarget: number;
  _count?: { withdrawals: number };
}

interface Summary {
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  bookingsCount: number;
  occupiedNights?: number;
}

interface BookingRow {
  id: string;
  clientName: string;
  clientPhone?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  source: string;
  status: string;
}

interface ExpenseRow {
  id: string;
  description: string;
  category: string;
  amount: number;
  date: string;
  notes?: string | null;
}

// --- Helpers ---
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function ApartmentDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const apartmentId = params?.id as string;

  const canViewInvestors =
    session?.user?.role === 'GENERAL_MANAGER' || session?.user?.role === 'ADMIN';

  const [month, setMonth] = useState(getCurrentMonth);
  const [apartment, setApartment] = useState<ApartmentInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [withdrawalsMap, setWithdrawalsMap] = useState<Record<string, number>>({});

  const [loadingApt, setLoadingApt] = useState(true);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch apartment info ---
  const fetchApartment = useCallback(async () => {
    try {
      setLoadingApt(true);
      setError(null);
      const res = await fetch(`/api/accounting/apartments/${apartmentId}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'خطأ في جلب بيانات الشقة');
      setApartment(json.apartment);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setLoadingApt(false);
    }
  }, [apartmentId]);

  // --- Fetch monthly data (summary, bookings, expenses) ---
  const fetchMonthlyData = useCallback(async (m: string) => {
    try {
      setLoadingData(true);

      const [summaryRes, bookingsRes, expensesRes] = await Promise.all([
        fetch(`/api/accounting/apartments/${apartmentId}/summary?month=${m}`),
        fetch(`/api/accounting/bookings?apartmentId=${apartmentId}&month=${m}`),
        fetch(`/api/accounting/expenses?apartmentId=${apartmentId}&month=${m}`),
      ]);

      const [summaryJson, bookingsJson, expensesJson] = await Promise.all([
        summaryRes.json(),
        bookingsRes.json(),
        expensesRes.json(),
      ]);

      if (summaryRes.ok && summaryJson?.summary) {
        setSummary(summaryJson.summary);
      } else {
        setSummary({ totalRevenue: 0, totalExpenses: 0, profit: 0, bookingsCount: 0 });
      }

      if (bookingsRes.ok && bookingsJson?.bookings) {
        setBookings(bookingsJson.bookings);
      } else {
        setBookings([]);
      }

      if (expensesRes.ok && expensesJson?.expenses) {
        setExpenses(expensesJson.expenses);
      } else {
        setExpenses([]);
      }

      // Fetch withdrawals for investors if applicable
      if (canViewInvestors && apartment?.investors?.length) {
        try {
          const wMap: Record<string, number> = {};
          await Promise.all(
            apartment.investors.map(async (inv) => {
              const wRes = await fetch(
                `/api/accounting/investors/${inv.user.id}/withdrawals?month=${m}`
              );
              if (wRes.ok) {
                const wJson = await wRes.json();
                const total = (wJson.withdrawals || []).reduce(
                  (s: number, w: { amount: number }) => s + w.amount,
                  0
                );
                wMap[inv.user.id] = total;
              }
            })
          );
          setWithdrawalsMap(wMap);
        } catch {
          // Non-critical, proceed without withdrawals
        }
      }
    } catch (err) {
      console.error('Error fetching monthly data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [apartmentId, canViewInvestors, apartment?.investors]);

  useEffect(() => {
    fetchApartment();
  }, [fetchApartment]);

  useEffect(() => {
    if (apartment) {
      fetchMonthlyData(month);
    }
  }, [month, apartment, fetchMonthlyData]);

  // --- Loading state ---
  if (loadingApt) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (error || !apartment) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Building2 size={48} className="text-secondary/20" />
        <p className="text-secondary/50 font-dubai">{error || 'الشقة غير موجودة'}</p>
        <button
          onClick={() => router.push('/accounting/apartments')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-dubai text-sm hover:bg-secondary/90 transition-colors"
        >
          <ArrowRight size={16} />
          العودة للشقق
        </button>
      </div>
    );
  }

  const bookingsTotal = bookings.reduce((s, b) => s + b.amount, 0);
  const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          {/* Back button */}
          <button
            onClick={() => router.push('/accounting/apartments')}
            className="p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors"
            aria-label="العودة"
          >
            <ArrowRight size={20} className="text-secondary" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary font-dubai">
              {apartment.name}
            </h1>
            <div className="flex items-center gap-2 mt-0.5">
              {apartment.project && (
                <span className="text-sm text-secondary/50 font-dubai">
                  {apartment.project.name}
                </span>
              )}
              {apartment.floor && (
                <span className="text-xs text-secondary/40 font-dubai">
                  • الدور {apartment.floor}
                </span>
              )}
              {apartment.type && (
                <span className="text-[10px] bg-primary/10 text-secondary/60 px-2 py-0.5 rounded-full font-dubai">
                  {apartment.type}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => fetchMonthlyData(month)}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="تحديث"
          >
            <RefreshCw size={20} className={`text-secondary/60 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAccountingMenu'))}
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu size={28} className="text-secondary" />
          </button>
        </div>
      </motion.div>

      {/* Month Selector */}
      <MonthSelector month={month} onChange={setMonth} />

      {/* Financial Summary Cards */}
      <FinancialSummary
        totalRevenue={summary?.totalRevenue || 0}
        totalExpenses={summary?.totalExpenses || 0}
        profit={summary?.profit || 0}
        bookingsCount={summary?.bookingsCount}
        occupiedNights={summary?.occupiedNights}
        isLoading={loadingData}
      />

      {/* Bookings Table */}
      <BookingsTable
        bookings={bookings}
        totalAmount={bookingsTotal}
        isLoading={loadingData}
      />

      {/* Expenses Table */}
      <ExpensesTable
        expenses={expenses}
        totalAmount={expensesTotal}
        isLoading={loadingData}
      />

      {/* Investors Table (General Manager only) */}
      {canViewInvestors && apartment.investors && apartment.investors.length > 0 && (
        <InvestorsTable
          investors={apartment.investors}
          profit={summary?.profit || 0}
          withdrawals={withdrawalsMap}
          isLoading={loadingData}
        />
      )}
    </div>
  );
}
