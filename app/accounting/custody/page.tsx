'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Wallet,
  Plus,
  Menu,
  RefreshCw,
  Loader2,
  Check,
  X,
  Building2,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import NumberInput from '@/components/accounting/shared/NumberInput';
import { MonthPicker } from '@/components/accounting/shared/DatePicker';
import { getEffectiveAccountingRole } from '@/lib/permissions';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Types ---
interface CustodyRecord {
  id: string;
  amount: number;
  currency: string;
  spent: number;
  remaining: number;
  month: string;
  notes?: string | null;
  isSettled: boolean;
  settledAt?: string | null;
  manager: { id: string; firstName: string; lastName: string };
  apartment: { id: string; name: string };
}

// --- Month helpers ---
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

// --- Component ---
export default function CustodyPage() {
  const { data: session } = useSession();
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const effectiveRole = getEffectiveAccountingRole(session?.user?.role || '');
  const isGeneralManager = effectiveRole === 'GENERAL_MANAGER';

  const formatMonthDisplay = (month: string) => {
    const [year, m] = month.split('-');
    const monthIndex = parseInt(m, 10) - 1;
    const yearFormatted = new Intl.NumberFormat(locale, { useGrouping: false }).format(parseInt(year, 10));
    return `${t.accounting.months[monthIndex] || m} ${yearFormatted}`;
  };

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat(locale).format(amount) + ' ' + t.accounting.common.currency;

  const [records, setRecords] = useState<CustodyRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form state
  const [showCreate, setShowCreate] = useState(false);
  const [managers, setManagers] = useState<{ id: string; firstName: string; lastName: string }[]>([]);
  const [apartments, setApartments] = useState<{ id: string; name: string }[]>([]);
  const [formManagerId, setFormManagerId] = useState('');
  const [formApartmentId, setFormApartmentId] = useState('');
  const [formAmount, setFormAmount] = useState('');
  const [formMonth, setFormMonth] = useState(getCurrentMonth);
  const [formNotes, setFormNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const fetchRecords = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/accounting/custody');
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t.accounting.errors.fetchCustody);
      setRecords(json.records || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.generic);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFormData = useCallback(async () => {
    try {
      const [teamRes, aptsRes] = await Promise.all([
        fetch('/api/accounting/settings/team'),
        fetch('/api/accounting/apartments'),
      ]);
      const [teamJson, aptsJson] = await Promise.all([teamRes.json(), aptsRes.json()]);
      if (teamRes.ok && teamJson.users) {
        const opsManagers = teamJson.users.filter(
          (u: { role: string }) => u.role === 'OPS_MANAGER'
        );
        setManagers(opsManagers);
      }
      if (aptsRes.ok && aptsJson.apartments) {
        setApartments(aptsJson.apartments);
      }
    } catch {
      // Non-critical
    }
  }, []);

  useEffect(() => {
    fetchRecords();
  }, [fetchRecords]);

  useEffect(() => {
    if (isGeneralManager && showCreate) {
      fetchFormData();
    }
  }, [isGeneralManager, showCreate, fetchFormData]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formManagerId || !formApartmentId || !formAmount) {
      setFormError(t.accounting.errors.allFieldsRequired);
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const res = await fetch('/api/accounting/custody', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          managerId: formManagerId,
          apartmentId: formApartmentId,
          amount: parseFloat(formAmount),
          month: formMonth,
          notes: formNotes.trim() || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setFormError(json.error || t.accounting.errors.generic);
        return;
      }
      setShowCreate(false);
      setFormManagerId('');
      setFormApartmentId('');
      setFormAmount('');
      setFormNotes('');
      fetchRecords();
    } catch {
      setFormError(t.accounting.errors.connectionFailed);
    } finally {
      setIsSaving(false);
    }
  };

  // إجماليات
  const totalAmount = records.reduce((s, r) => s + r.amount, 0);
  const totalSpent = records.reduce((s, r) => s + r.spent, 0);
  const totalRemaining = records.reduce((s, r) => s + r.remaining, 0);

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center">
            <Wallet size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary font-dubai tracking-tight">{t.accounting.custody.title}</h1>
            <p className="text-xs text-secondary font-dubai mt-0.5">
              {isGeneralManager ? t.accounting.custody.subtitleAdmin : t.accounting.custody.subtitleUser}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {isGeneralManager && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-xl font-dubai text-sm font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300"
            >
              <Plus size={15} />
              <span className="hidden sm:inline">{t.accounting.custody.newCustody}</span>
            </button>
          )}
          <button
            onClick={fetchRecords}
            className="p-2 hover:bg-secondary/5 rounded-xl transition-all"
            aria-label={t.accounting.common.refresh}
          >
            <RefreshCw size={16} className={`text-secondary/40 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAccountingMenu'))}
            className="lg:hidden p-2 hover:bg-secondary/5 rounded-xl transition-all"
            aria-label={t.accounting.common.openMenu}
          >
            <Menu size={22} className="text-secondary/60" />
          </button>
        </div>
      </div>

      {/* Summary Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35 }}
            className="relative overflow-hidden bg-gradient-to-br from-blue-500/10 to-blue-500/5 rounded-2xl border border-blue-500/15 p-4 group hover:shadow-md transition-shadow duration-300"
          >
            <span className="text-[11px] text-secondary/50 font-dubai font-medium">{t.accounting.custody.totalCustody}</span>
            <p className="text-lg font-bold text-secondary font-dubai mt-1 tracking-tight">{formatCurrency(totalAmount)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.05 }}
            className="relative overflow-hidden bg-gradient-to-br from-rose-500/10 to-rose-500/5 rounded-2xl border border-rose-500/15 p-4 group hover:shadow-md transition-shadow duration-300"
          >
            <span className="text-[11px] text-secondary/50 font-dubai font-medium">{t.accounting.custody.spent}</span>
            <p className="text-lg font-bold text-rose-700 font-dubai mt-1 tracking-tight">{formatCurrency(totalSpent)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: 0.1 }}
            className="relative overflow-hidden bg-gradient-to-br from-emerald-500/10 to-emerald-500/5 rounded-2xl border border-emerald-500/15 p-4 group hover:shadow-md transition-shadow duration-300"
          >
            <span className="text-[11px] text-secondary/50 font-dubai font-medium">{t.accounting.custody.remaining}</span>
            <p className="text-lg font-bold text-emerald-700 font-dubai mt-1 tracking-tight">{formatCurrency(totalRemaining)}</p>
          </motion.div>
        </div>
      )}

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/80 border border-red-200/60 rounded-xl p-4 text-center backdrop-blur-sm"
        >
          <p className="text-red-600 font-dubai text-sm">{error}</p>
          <button onClick={fetchRecords} className="mt-2 text-xs text-red-500 hover:text-red-700 font-dubai font-bold transition-colors">
            {t.accounting.common.retry}
          </button>
        </motion.div>
      )}

      {/* Records */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-5 h-5 text-secondary/30 animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16">
          <div className="w-12 h-12 rounded-2xl bg-secondary/[0.03] mx-auto mb-3 flex items-center justify-center">
            <Wallet size={22} className="text-secondary/25" />
          </div>
          <p className="text-secondary/40 font-dubai text-sm">{t.accounting.custody.noCustody}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-white rounded-2xl border border-secondary/[0.08] shadow-sm p-5"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                    <Building2 size={15} className="text-white" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-secondary font-dubai">
                      {rec.apartment.name}
                    </h3>
                    {isGeneralManager && (
                      <p className="text-xs text-secondary/50 font-dubai mt-0.5">
                        {rec.manager.firstName} {rec.manager.lastName}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs bg-secondary/[0.06] text-secondary px-2 py-0.5 rounded-full font-dubai">
                    {formatMonthDisplay(rec.month)}
                  </span>
                  {rec.isSettled ? (
                    <span className="text-[10px] bg-secondary/10 text-secondary px-2 py-0.5 rounded-full font-dubai flex items-center gap-0.5">
                      <Check size={10} /> {t.accounting.custody.locked}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-secondary/[0.06] text-secondary px-2 py-0.5 rounded-full font-dubai">
                      {t.accounting.custody.unlocked}
                    </span>
                  )}
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-blue-500/8 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-secondary/50 font-dubai mb-0.5">{t.accounting.custody.custodyLabel}</p>
                  <p className="text-sm font-bold text-secondary font-dubai">{formatCurrency(rec.amount)}</p>
                </div>
                <div className="bg-rose-500/8 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-rose-600/70 font-dubai mb-0.5">{t.accounting.custody.spent}</p>
                  <p className="text-sm font-bold text-rose-700 font-dubai">{formatCurrency(rec.spent)}</p>
                </div>
                <div className="bg-emerald-500/8 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-emerald-600/70 font-dubai mb-0.5">{t.accounting.custody.remaining}</p>
                  <p className="text-sm font-bold text-emerald-700 font-dubai">{formatCurrency(rec.remaining)}</p>
                </div>
              </div>

              {rec.notes && (
                <p className="text-xs text-secondary/40 font-dubai mt-2 bg-secondary/[0.03] rounded-lg px-3 py-1.5">
                  {rec.notes}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && isGeneralManager && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-md z-10 overflow-hidden border border-secondary/[0.08]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                    <Wallet size={15} className="text-white" />
                  </div>
                  <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.custody.newCustodyTitle}</h4>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors">
                  <X size={18} className="text-secondary/40" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-5 space-y-5" dir="rtl">
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                      <Menu size={11} className="text-secondary/50" />
                    </span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.custody.opsManager}</span>
                    <span className="text-red-400 text-xs">*</span>
                  </label>
                  <CustomSelect
                    value={formManagerId}
                    onChange={setFormManagerId}
                    placeholder={t.accounting.common.choose}
                    required
                    className="w-full"
                    emptyMessage={t.accounting.custody.noManagers}
                    options={managers.map((m) => ({
                      value: m.id,
                      label: `${m.firstName} ${m.lastName}`,
                    }))}
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                      <Building2 size={11} className="text-secondary/50" />
                    </span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.custody.apartmentLabel}</span>
                    <span className="text-red-400 text-xs">*</span>
                  </label>
                  <CustomSelect
                    value={formApartmentId}
                    onChange={setFormApartmentId}
                    placeholder={t.accounting.common.choose}
                    required
                    className="w-full"
                    emptyMessage={t.accounting.custody.noApartments}
                    options={apartments.map((a) => ({
                      value: a.id,
                      label: a.name,
                    }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                        <Wallet size={11} className="text-emerald-500/70" />
                      </span>
                      <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.custody.amountLabel(t.accounting.common.currency)}</span>
                      <span className="text-red-400 text-xs">*</span>
                    </label>
                    <NumberInput
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                      required
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                        <Check size={11} className="text-secondary/50" />
                      </span>
                      <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.custody.monthLabel}</span>
                      <span className="text-red-400 text-xs">*</span>
                    </label>
                    <MonthPicker
                      value={formMonth}
                      onChange={(v) => setFormMonth(v)}
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                      <Menu size={11} className="text-secondary/50" />
                    </span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.custody.notesLabel}</span>
                  </label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25 resize-none"
                    rows={2}
                  />
                </div>
                {formError && <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">{formError}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >
                    {t.accounting.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    {isSaving ? t.accounting.common.saving : t.accounting.custody.createCustody}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}