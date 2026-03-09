'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
  Calendar,
  LogIn,
  LogOut,
  Loader2,
  Clock,
  Info,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useDailySchedule } from '@/hooks/useDailySchedule';
import CheckInTable from '@/components/accounting/daily/CheckInTable';
import CheckOutTable from '@/components/accounting/daily/CheckOutTable';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Types ---
interface CheckInRow {
  id: string;
  apartment: { id: string; name: string; floor?: number | null } | null;
  clientName: string;
  clientPhone?: string | null;
  arrivalTime?: string | null;
  flightNumber?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  receptionSupervisor?: string | null;
  notes?: string | null;
  status: string;
}

interface CheckOutRow {
  id: string;
  apartment: { id: string; name: string; floor?: number | null } | null;
  clientName: string;
  clientPhone?: string | null;
  checkOut: string;
  deliverySupervisor?: string | null;
  notes?: string | null;
  status: string;
}

interface DailySummary {
  totalCheckIns: number;
  totalCheckOuts: number;
}

// --- Helpers ---
const isToday = (dateString: string) => {
  const d = new Date(dateString);
  const now = new Date();
  return d.getFullYear() === now.getFullYear()
    && d.getMonth() === now.getMonth()
    && d.getDate() === now.getDate();
};

const isTomorrow = (dateString: string) => {
  const d = new Date(dateString);
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  return d.getFullYear() === tomorrow.getFullYear()
    && d.getMonth() === tomorrow.getMonth()
    && d.getDate() === tomorrow.getDate();
};

export default function DailyOpsPage() {
  const { data: session } = useSession();
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const userRole = session?.user?.role;
  const canAssignSupervisor = userRole === 'GENERAL_MANAGER' || userRole === 'OPS_MANAGER';

  const {
    dateString,
    isAuto,
    isAfter7PM,
    goNextDay,
    goPrevDay,
    resetToAuto,
  } = useDailySchedule();

  // Data
  const [checkIns, setCheckIns] = useState<CheckInRow[]>([]);
  const [checkOuts, setCheckOuts] = useState<CheckOutRow[]>([]);
  const [summary, setSummary] = useState<DailySummary>({ totalCheckIns: 0, totalCheckOuts: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // --- Fetch daily data ---
  const fetchDaily = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const res = await fetch(`/api/accounting/daily?date=${dateString}`);
      const json = await res.json();

      if (!res.ok) {
        setError(json.error || t.accounting.errors.generic);
        return;
      }

      setCheckIns(json.checkIns || []);
      setCheckOuts(json.checkOuts || []);
      setSummary(json.summary || { totalCheckIns: 0, totalCheckOuts: 0 });
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsLoading(false);
    }
  }, [dateString]);

  useEffect(() => {
    fetchDaily();
  }, [fetchDaily]);

  // Supervisor saved - update local state
  const handleSupervisorSaved = useCallback((bookingId: string, field: string, value: string) => {
    if (field === 'receptionSupervisor') {
      setCheckIns(prev =>
        prev.map(b => b.id === bookingId ? { ...b, receptionSupervisor: value } : b)
      );
    } else if (field === 'deliverySupervisor') {
      setCheckOuts(prev =>
        prev.map(b => b.id === bookingId ? { ...b, deliverySupervisor: value } : b)
      );
    }
  }, []);

  // Date label
  const getDateLabel = () => {
    if (isToday(dateString)) return t.accounting.daily.today;
    if (isTomorrow(dateString)) return t.accounting.daily.tomorrow;
    return '';
  };
  const dateLabel = getDateLabel();

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
            <ClipboardList size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary font-dubai">
              {t.accounting.daily.title}
            </h1>
            <p className="text-sm text-secondary/60 font-dubai">
              {t.accounting.daily.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={fetchDaily}
          disabled={isLoading}
          className="p-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={18} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
        </button>
      </motion.div>

      {/* Date Navigation */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white rounded-2xl border-2 border-primary/20 shadow-[0_4px_20px_rgba(237,191,140,0.15)] px-5 py-4"
      >
        <div className="flex items-center justify-between">
          {/* Prev day */}
          <button
            onClick={goPrevDay}
            className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center
              justify-center transition-colors text-secondary"
          >
            <ChevronRight className="w-4 h-4" />
          </button>

          {/* Date display */}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-primary" />
              <span className="text-base font-bold text-secondary font-dubai">
                {new Date(dateString).toLocaleDateString(locale, {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </span>
              {dateLabel && (
                <span className="text-xs bg-primary/10 text-secondary px-2 py-0.5
                  rounded-full font-dubai font-medium"
                >
                  {dateLabel}
                </span>
              )}
            </div>

            {/* Auto/manual indicator */}
            <div className="flex items-center gap-2 text-xs text-secondary/40">
              {isAuto ? (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {isAfter7PM
                    ? t.accounting.daily.tomorrowAutoNote
                    : t.accounting.daily.autoUpdateNote
                  }
                </span>
              ) : (
                <button
                  onClick={resetToAuto}
                  className="flex items-center gap-1 text-primary hover:text-secondary
                    transition-colors font-dubai"
                >
                  <RotateCcw className="w-3 h-3" />
                  {t.accounting.daily.backToAutoDate}
                </button>
              )}
            </div>
          </div>

          {/* Next day */}
          <button
            onClick={goNextDay}
            className="w-9 h-9 rounded-xl bg-primary/10 hover:bg-primary/20 flex items-center
              justify-center transition-colors text-secondary"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>
      </motion.div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="bg-white rounded-2xl border-2 border-primary/20 shadow-[0_4px_20px_rgba(237,191,140,0.1)]
            px-5 py-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#8a9a7a]/10 border-2 border-[#8a9a7a]/25 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-[#8a9a7a]" />
          </div>
          <div>
            <p className="text-sm text-secondary/60 font-dubai">{t.accounting.daily.checkInsTitle}</p>
            <p className="text-2xl font-bold text-secondary font-dubai">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#8a9a7a]" />
              ) : (
                summary.totalCheckIns
              )}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.15 }}
          className="bg-white rounded-2xl border-2 border-primary/20 shadow-[0_4px_20px_rgba(237,191,140,0.1)]
            px-5 py-4 flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-[#c09080]/10 border-2 border-[#c09080]/25 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-[#c09080]" />
          </div>
          <div>
            <p className="text-sm text-secondary/60 font-dubai">{t.accounting.daily.checkOutsTitle}</p>
            <p className="text-2xl font-bold text-secondary font-dubai">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-[#c09080]" />
              ) : (
                summary.totalCheckOuts
              )}
            </p>
          </div>
        </motion.div>
      </div>

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
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state - no data for either */}
      {!isLoading && !error && checkIns.length === 0 && checkOuts.length === 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="bg-white rounded-2xl border-2 border-primary/10 py-16 text-center"
        >
          <ClipboardList className="w-12 h-12 mx-auto mb-3 text-secondary/20" />
          <p className="text-secondary/40 font-dubai text-sm">
            {t.accounting.daily.noActivity}
          </p>
        </motion.div>
      )}

      {/* Tables */}
      {(isLoading || checkIns.length > 0) && (
        <CheckInTable
          checkIns={checkIns}
          isLoading={isLoading}
          canAssignSupervisor={canAssignSupervisor}
          onSupervisorSaved={handleSupervisorSaved}
        />
      )}

      {(isLoading || checkOuts.length > 0) && (
        <CheckOutTable
          checkOuts={checkOuts}
          isLoading={isLoading}
          canAssignSupervisor={canAssignSupervisor}
          onSupervisorSaved={handleSupervisorSaved}
        />
      )}


    </div>
  );
}
