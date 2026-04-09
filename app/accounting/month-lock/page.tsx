'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
  Loader2,
  DollarSign,
  Calendar,
  Settings,
} from 'lucide-react';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import ConfirmDialog from '@/components/accounting/shared/ConfirmDialog';
import { useToast } from '@/components/accounting/shared/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// Types
// ============================================================================

interface ApartmentLockStatus {
  id: string;
  name: string;
  isLocked: boolean;
  lockedAt: string | null;
  lockedById: string | null;
  profit: number;
}

// ============================================================================
// Helper
// ============================================================================

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatCurrency = (amount: number, loc: string) => {
  return new Intl.NumberFormat(loc, { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
};

// ============================================================================
// Component
// ============================================================================

export default function MonthLockPage() {
  const toast = useToast();
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const toastRef = React.useRef(toast);
  toastRef.current = toast;

  const [month, setMonth] = useState(getCurrentMonth());
  const [apartments, setApartments] = useState<ApartmentLockStatus[]>([]);
  const [totalLocked, setTotalLocked] = useState(0);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'all' or apartmentId
  const [lockAllConfirm, setLockAllConfirm] = useState(false);

  const formatMonthLabel = (m: string) => {
    const [year, mm] = m.split('-');
    const idx = parseInt(mm, 10) - 1;
    const yearFormatted = new Intl.NumberFormat(locale, { useGrouping: false }).format(parseInt(year, 10));
    return `${t.accounting.months[idx] || mm} ${yearFormatted}`;
  };

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accounting/months/status?month=${month}`);
      const json = await res.json();

      if (res.ok) {
        setApartments(json.apartments || []);
        setTotalLocked(json.totalLocked || 0);
        setTotalUnlocked(json.totalUnlocked || 0);
      } else {
        toastRef.current.error(json.error || t.accounting.errors.fetchMonthStatus);
      }
    } catch {
      toastRef.current.error(t.accounting.errors.connectionError);
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleLockAction = async (action: 'lock' | 'unlock', apartmentId?: string) => {
    const loadingKey = apartmentId || 'all';
    setActionLoading(loadingKey);

    try {
      const body: Record<string, string> = { month, action };
      if (apartmentId) body.apartmentId = apartmentId;

      const res = await fetch('/api/accounting/months/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok) {
        toastRef.current.success(json.message || (action === 'lock' ? t.accounting.success.locked : t.accounting.success.unlocked));
        await fetchStatus();
      } else {
        toastRef.current.error(json.error || t.accounting.errors.resetFailed);
      }
    } catch {
      toastRef.current.error(t.accounting.errors.connectionError);
    } finally {
      setActionLoading(null);
    }
  };

  const formatLockDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat(locale, {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="flex-1 flex flex-col gap-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
      {/* Title + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3.5 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center shrink-0">
            <ShieldCheck size={16} className="text-white sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-secondary font-dubai tracking-tight truncate">{t.accounting.monthLock.title}</h1>
            <p className="text-xs text-secondary/90 font-dubai mt-0.5 hidden sm:block">
              {t.accounting.monthLock.subtitle}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <div className="hidden sm:flex items-center gap-2 text-sm font-dubai">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-secondary/[0.06] rounded-lg border border-secondary/[0.08]">
              <Lock size={12} className="text-secondary/90" />
              <span className="font-bold text-secondary/90 text-xs">{new Intl.NumberFormat(locale).format(totalLocked)}</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-primary/10 rounded-lg border border-primary/15">
              <Unlock size={12} className="text-primary/90" />
              <span className="font-bold text-secondary/90 text-xs">{new Intl.NumberFormat(locale).format(totalUnlocked)}</span>
            </span>
          </div>
          <button
            onClick={fetchStatus}
            disabled={loading}
            className="p-1.5 sm:p-2 hover:bg-secondary/5 rounded-xl transition-all"
          >
            <RefreshCw size={15} className={`text-secondary/90 sm:w-4 sm:h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center">
        <MonthSelector month={month} onChange={setMonth} />
      </div>
      </div>

      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 overflow-y-auto">
      {/* Lock All Button */}
      {totalUnlocked > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between bg-primary/5 border border-primary/15 rounded-xl px-4 py-2.5"
        >
          <p className="text-xs text-secondary/90 font-dubai">
            {t.accounting.monthLock.snapshotNote}
          </p>
          <button
            onClick={() => setLockAllConfirm(true)}
            disabled={actionLoading !== null}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-secondary text-white font-dubai text-xs font-bold rounded-lg hover:bg-secondary/90 transition-all disabled:opacity-50 shrink-0"
          >
            {actionLoading === 'all' ? (
              <RefreshCw size={13} className="animate-spin" />
            ) : (
              <Lock size={13} />
            )}
            {t.accounting.monthLock.lockAll}
          </button>
        </motion.div>
      )}

      {/* Apartments List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border border-secondary/[0.08] rounded-2xl shadow-sm overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-5 h-5 text-secondary/80 animate-spin" />
          </div>
        ) : apartments.length === 0 ? (
          <div className="text-center py-20 text-secondary/90 font-dubai">
            <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
              <Building2 size={22} className="text-secondary/80" />
            </div>
            <p className="text-lg font-bold">{t.accounting.monthLock.noApartments}</p>
            <p className="text-sm mt-1">{t.accounting.monthLock.addApartmentsNote}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 z-10">
                <tr className="bg-secondary/[0.02] border-b border-secondary/[0.06]">
                  <th className="text-right px-4 py-3 text-[11px] text-secondary/90 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Building2 size={12} />{t.accounting.monthLock.apartment}</span></th>
                  <th className="text-right px-4 py-3 text-[11px] text-secondary/90 font-medium font-dubai"><span className="inline-flex items-center gap-1"><ShieldCheck size={12} />{t.accounting.monthLock.status}</span></th>
                  <th className="text-right px-4 py-3 text-[11px] text-secondary/90 font-medium font-dubai"><span className="inline-flex items-center gap-1"><DollarSign size={12} />{t.accounting.monthLock.profit}</span></th>
                  <th className="text-right px-4 py-3 text-[11px] text-secondary/90 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Calendar size={12} />{t.accounting.monthLock.lockDate}</span></th>
                  <th className="text-center px-4 py-3 text-[11px] text-secondary/90 font-medium font-dubai"><span className="inline-flex items-center gap-1"><Settings size={12} />{t.accounting.monthLock.action}</span></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {apartments.map((apt, idx) => (
                    <motion.tr
                      key={apt.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-secondary/[0.04] hover:bg-secondary/[0.02] transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-primary/90" />
                          <span className="font-dubai font-semibold text-secondary">{apt.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {apt.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary/90 rounded-lg text-xs font-bold font-dubai">
                            <CheckCircle2 size={13} />
                            {t.accounting.monthLock.locked}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 text-secondary/90 rounded-lg text-xs font-bold font-dubai">
                            <AlertTriangle size={13} />
                            {t.accounting.monthLock.open}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-dubai text-secondary/90 font-semibold">
                        <span className={apt.profit >= 0 ? 'text-green-600' : 'text-red-500'}>
                          {formatCurrency(apt.profit, locale)} $
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-dubai text-secondary/90 text-xs">
                        {formatLockDate(apt.lockedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {apt.isLocked ? (
                          <button
                            onClick={() => handleLockAction('unlock', apt.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-secondary/90 hover:bg-primary/25 rounded-lg text-xs font-bold font-dubai transition-colors disabled:opacity-50"
                          >
                            {actionLoading === apt.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <Unlock size={13} />
                            )}
                            {t.accounting.monthLock.unlock}
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockAction('lock', apt.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white hover:bg-secondary/90 rounded-lg text-xs font-bold font-dubai transition-colors disabled:opacity-50"
                          >
                            {actionLoading === apt.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <Lock size={13} />
                            )}
                            {t.accounting.monthLock.lock}
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm font-dubai text-secondary/90 max-w-xl"
      >
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>{t.accounting.monthLock.lockPreventsEditing}</li>
          <li>{t.accounting.monthLock.snapshotSaved}</li>
          <li>{t.accounting.monthLock.unlockAllowsEditing}</li>
        </ul>
      </motion.div>

      {/* Lock All Confirmation Dialog */}
      <ConfirmDialog
        isOpen={lockAllConfirm}
        onClose={() => setLockAllConfirm(false)}
        onConfirm={() => {
          setLockAllConfirm(false);
          handleLockAction('lock');
        }}
        title={t.accounting.monthLock.lockAllTitle}
        message={`${t.accounting.monthLock.lockAllConfirmMsg(totalUnlocked, formatMonthLabel(month))}`}
        confirmLabel={t.accounting.monthLock.lockAll}
        cancelLabel={t.accounting.common.cancel}
        variant="warning"
      />
      </div>
    </div>
  );
}
