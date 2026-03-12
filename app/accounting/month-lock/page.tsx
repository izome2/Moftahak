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
} from 'lucide-react';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <ShieldCheck size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary font-dubai">{t.accounting.monthLock.title}</h1>
            <p className="text-sm text-secondary/60 font-dubai">
              {t.accounting.monthLock.subtitle}
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-secondary font-dubai text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          {t.accounting.common.refresh}
        </button>
      </motion.div>

      {/* Month Selector + Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white border-2 border-primary/20 rounded-2xl p-5 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <MonthSelector month={month} onChange={setMonth} />

          <div className="flex items-center gap-4 text-sm font-dubai">
            <div className="flex items-center gap-2 px-3 py-2 bg-secondary/8 rounded-xl border border-secondary/15">
              <Lock size={14} className="text-secondary/70" />
              <span className="font-bold text-secondary/80">{new Intl.NumberFormat(locale).format(totalLocked)} {t.accounting.monthLock.lockedCount}</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-primary/10 rounded-xl border border-primary/25">
              <Unlock size={14} className="text-primary" />
              <span className="font-bold text-secondary/70">{new Intl.NumberFormat(locale).format(totalUnlocked)} {t.accounting.monthLock.openCount}</span>
            </div>
          </div>
        </div>

        {/* Lock All Button */}
        {totalUnlocked > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-primary/10"
          >
            <button
              onClick={() => handleLockAction('lock')}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-dubai text-sm font-bold rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-md"
            >
              {actionLoading === 'all' ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              {t.accounting.monthLock.lockAllForMonth(month)}
            </button>
            <p className="text-xs text-secondary/40 font-dubai mt-2">
              {t.accounting.monthLock.snapshotNote}
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Apartments List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-2 border-primary/20 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : apartments.length === 0 ? (
          <div className="text-center py-20 text-secondary/40 font-dubai">
            <Building2 size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">{t.accounting.monthLock.noApartments}</p>
            <p className="text-sm mt-1">{t.accounting.monthLock.addApartmentsNote}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 border-b-2 border-primary/10">
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">{t.accounting.monthLock.apartment}</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">{t.accounting.monthLock.status}</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">{t.accounting.monthLock.profit}</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">{t.accounting.monthLock.lockDate}</th>
                  <th className="text-center px-4 py-3 font-dubai font-bold text-secondary/70">{t.accounting.monthLock.action}</th>
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
                      className="border-b border-primary/5 hover:bg-primary/3 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-primary/60" />
                          <span className="font-dubai font-semibold text-secondary">{apt.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {apt.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary/10 text-secondary/80 rounded-lg text-xs font-bold font-dubai">
                            <CheckCircle2 size={13} />
                            {t.accounting.monthLock.locked}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-primary/15 text-secondary/70 rounded-lg text-xs font-bold font-dubai">
                            <AlertTriangle size={13} />
                            {t.accounting.monthLock.open}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-dubai text-secondary/80 font-semibold">
                        <span className={apt.profit >= 0 ? 'text-green-600' : 'text-red-500'}>
                          {formatCurrency(apt.profit, locale)} $
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-dubai text-secondary/50 text-xs">
                        {formatLockDate(apt.lockedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {apt.isLocked ? (
                          <button
                            onClick={() => handleLockAction('unlock', apt.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-primary/15 text-secondary/70 hover:bg-primary/25 rounded-lg text-xs font-bold font-dubai transition-colors disabled:opacity-50"
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
        className="bg-primary/5 border border-primary/20 rounded-xl px-4 py-3 text-sm font-dubai text-secondary/70 max-w-xl"
      >
        <ul className="space-y-1 text-xs list-disc list-inside">
          <li>{t.accounting.monthLock.lockPreventsEditing}</li>
          <li>{t.accounting.monthLock.snapshotSaved}</li>
          <li>{t.accounting.monthLock.unlockAllowsEditing}</li>
        </ul>
      </motion.div>
    </div>
  );
}
