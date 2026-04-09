'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  ArrowRight,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { getEffectiveAccountingRole } from '@/lib/permissions';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import FinancialSummary from '@/components/accounting/apartments/FinancialSummary';
import BookingsTable from '@/components/accounting/apartments/BookingsTable';
import ExpensesTable from '@/components/accounting/apartments/ExpensesTable';
import InvestorsTable from '@/components/accounting/apartments/InvestorsTable';
import { useTranslation } from '@/hooks/useTranslation';

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
  const t = useTranslation();
  const apartmentId = params?.id as string;

  const canViewInvestors =
    session?.user?.role === 'GENERAL_MANAGER' || session?.user?.role === 'ADMIN';

  const effectiveRole = getEffectiveAccountingRole(session?.user?.role || '');
  const isOpsManager = effectiveRole === 'OPS_MANAGER';
  const isBookingManager = effectiveRole === 'BOOKING_MANAGER';
  const canViewBookings = !isOpsManager;
  const canViewRevenue = !isOpsManager && !isBookingManager;
  const canViewExpenses = !isBookingManager;

  const [month, setMonth] = useState(getCurrentMonth);
  const [apartment, setApartment] = useState<ApartmentInfo | null>(null);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);

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
      if (!res.ok) throw new Error(json.error || t.accounting.errors.fetchApartmentData);
      setApartment(json.apartment);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.generic);
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
        fetch(`/api/accounting/expenses?apartmentId=${apartmentId}&month=${m}&approvalStatus=APPROVED`),
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
    } catch (err) {
      console.error('Error fetching monthly data:', err);
    } finally {
      setLoadingData(false);
    }
  }, [apartmentId]);

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
        <Building2 size={48} className="text-secondary/90" />
        <p className="text-secondary/90 font-dubai">{error || t.accounting.apartments.apartmentNotFound}</p>
        <button
          onClick={() => router.push('/accounting/apartments')}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary text-white font-dubai text-sm hover:bg-secondary/90 transition-colors"
        >
          <ArrowRight size={16} />
          {t.accounting.apartments.backToApartments}
        </button>
      </div>
    );
  }

  const bookingsTotal = bookings.reduce((s, b) => s + b.amount, 0);
  const expensesTotal = expenses.reduce((s, e) => s + e.amount, 0);

  return (
    <div className="flex-1 flex flex-col gap-3">
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="space-y-2 sm:space-y-3"
      >
        {/* Title + Actions */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-3 min-w-0">
            <button
              onClick={() => router.push('/accounting/apartments')}
              className="p-2 sm:p-2.5 rounded-xl bg-primary/10 hover:bg-primary/20 transition-colors shrink-0"
              aria-label={t.accounting.apartments.backToApartments}
            >
              <ArrowRight size={16} className="text-secondary sm:w-5 sm:h-5" />
            </button>
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl md:text-2xl font-bold text-secondary font-dubai truncate">
                {apartment.name}
              </h1>
              <div className="flex items-center gap-2 mt-0.5 hidden sm:flex">
                {apartment.project && (
                  <span className="text-sm text-secondary/90 font-dubai">
                    {apartment.project.name}
                  </span>
                )}
                {apartment.floor && (
                  <span className="text-xs text-secondary/90 font-dubai">
                    • {t.accounting.common.floor} {apartment.floor}
                  </span>
                )}
                {apartment.type && (
                  <span className="text-[10px] bg-primary/10 text-secondary/90 px-2 py-0.5 rounded-full font-dubai">
                    {apartment.type}
                  </span>
                )}
              </div>
            </div>
          </div>
          <button
            onClick={() => fetchMonthlyData(month)}
            className="p-1.5 sm:p-2 hover:bg-primary/10 rounded-lg transition-colors shrink-0"
            aria-label={t.accounting.common.refresh}
          >
            <RefreshCw size={15} className={`text-secondary/90 sm:w-5 sm:h-5 ${loadingData ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {/* Month Selector */}
        <div className="flex items-center justify-center">
          <MonthSelector month={month} onChange={setMonth} />
        </div>
      </motion.div>
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
      {/* Financial Summary Cards */}
      {canViewRevenue ? (
        <FinancialSummary
          totalRevenue={summary?.totalRevenue || 0}
          totalExpenses={summary?.totalExpenses || 0}
          profit={summary?.profit || 0}
          bookingsCount={summary?.bookingsCount}
          occupiedNights={summary?.occupiedNights}
          isLoading={loadingData}
        />
      ) : isBookingManager ? (
        <FinancialSummary
          totalRevenue={0}
          totalExpenses={0}
          profit={0}
          bookingsCount={summary?.bookingsCount}
          occupiedNights={summary?.occupiedNights}
          isLoading={loadingData}
          hideRevenue
          hideExpenses
          hideProfit
        />
      ) : (
        <FinancialSummary
          totalRevenue={0}
          totalExpenses={summary?.totalExpenses || 0}
          profit={0}
          isLoading={loadingData}
          hideRevenue
          hideProfit
        />
      )}

      {/* Bookings Table - hidden for OPS_MANAGER */}
      {canViewBookings && (
        <BookingsTable
          bookings={bookings}
          totalAmount={canViewRevenue ? bookingsTotal : 0}
          isLoading={loadingData}
          hideAmounts={!canViewRevenue}
        />
      )}

      {/* Expenses Table - hidden for BOOKING_MANAGER */}
      {canViewExpenses && (
        <ExpensesTable
          expenses={expenses}
          totalAmount={expensesTotal}
          isLoading={loadingData}
        />
      )}

      {/* Investors Table (General Manager only) */}
      {canViewInvestors && apartment.investors && apartment.investors.length > 0 && (
        <InvestorsTable
          investors={apartment.investors}
          profit={summary?.profit || 0}
          isLoading={loadingData}
        />
      )}
      </div>
    </div>
  );
}
