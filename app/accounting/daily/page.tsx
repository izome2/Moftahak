'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  ClipboardList,
  RefreshCw,
  ChevronRight,
  ChevronLeft,
  RotateCcw,
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
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page Header + Date Navigation */}
      <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center">
            <ClipboardList size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary font-dubai tracking-tight">
              {t.accounting.daily.title}
            </h1>
            <p className="text-xs text-secondary font-dubai mt-0.5 hidden sm:block">
              {t.accounting.daily.subtitle}
            </p>
          </div>
        </div>

        {/* Date Nav - centered */}
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={goPrevDay}
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            {language === 'ar' ? <ChevronRight size={20} className="text-secondary" /> : <ChevronLeft size={20} className="text-secondary" />}
          </button>
          <div className="text-center min-w-[160px]">
            <p className="text-lg font-bold text-secondary font-dubai">
              {new Date(dateString).toLocaleDateString(locale, {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </p>
            {dateLabel && (
              <p className="text-[10px] text-secondary/50 font-dubai font-medium -mt-0.5">
                {dateLabel}
              </p>
            )}
          </div>
          <button
            onClick={goNextDay}
            className="p-2 bg-primary/10 hover:bg-primary/20 rounded-lg transition-colors"
          >
            {language === 'ar' ? <ChevronLeft size={20} className="text-secondary" /> : <ChevronRight size={20} className="text-secondary" />}
          </button>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-1 justify-end">
          {!isAuto && (
            <button
              onClick={resetToAuto}
              className="p-1.5 rounded-lg hover:bg-secondary/5 transition-all text-secondary/40 hover:text-secondary"
              title={t.accounting.daily.backToAutoDate}
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={fetchDaily}
            disabled={isLoading}
            className="p-2 hover:bg-secondary/5 rounded-xl transition-all"
          >
            <RefreshCw size={16} className={`text-secondary/40 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.05 }}
          className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/15
            px-5 py-4 flex items-center gap-3 group hover:shadow-md transition-shadow duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/15 flex items-center justify-center">
            <LogIn className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-[11px] text-secondary/50 font-dubai font-medium">{t.accounting.daily.checkInsTitle}</p>
            <p className="text-xl font-bold text-secondary font-dubai tracking-tight">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-secondary/30" />
              ) : (
                summary.totalCheckIns
              )}
            </p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.1 }}
          className="relative overflow-hidden bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-2xl border border-rose-500/15
            px-5 py-4 flex items-center gap-3 group hover:shadow-md transition-shadow duration-300"
        >
          <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center">
            <LogOut className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <p className="text-[11px] text-secondary/50 font-dubai font-medium">{t.accounting.daily.checkOutsTitle}</p>
            <p className="text-xl font-bold text-secondary font-dubai tracking-tight">
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin text-secondary/30" />
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
            className="bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-3 text-sm text-red-600
              flex flex-col items-center gap-2 font-dubai backdrop-blur-sm"
          >
            <div className="flex items-center gap-2">
              <Info className="w-4 h-4 shrink-0" />
              {error}
            </div>
            <button
              onClick={fetchDaily}
              className="text-xs text-red-500 hover:text-red-700 font-dubai font-bold transition-colors"
            >
              {t.accounting.common.retry}
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty state - no data for either */}
      {!isLoading && !error && checkIns.length === 0 && checkOuts.length === 0 && (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
            <ClipboardList className="w-6 h-6 text-secondary/25" />
          </div>
          <p className="text-secondary/40 font-dubai text-sm">
            {t.accounting.daily.noActivity}
          </p>
        </div>
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
