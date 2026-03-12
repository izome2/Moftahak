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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <Wallet size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">{t.accounting.custody.title}</h1>
            <p className="text-sm text-secondary/60 font-dubai">
              {isGeneralManager ? t.accounting.custody.subtitleAdmin : t.accounting.custody.subtitleUser}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isGeneralManager && (
            <button
              onClick={() => setShowCreate(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">{t.accounting.custody.newCustody}</span>
            </button>
          )}
          <button
            onClick={fetchRecords}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label={t.accounting.common.refresh}
          >
            <RefreshCw size={20} className={`text-secondary/60 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAccountingMenu'))}
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label={t.accounting.common.openMenu}
          >
            <Menu size={28} className="text-secondary" />
          </button>
        </div>
      </motion.div>

      {/* Summary Stats */}
      {records.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl border-2 border-primary/20 p-4 shadow-[0_4px_20px_rgba(237,191,140,0.12)]"
          >
            <p className="text-xs text-secondary/60 font-dubai mb-1">{t.accounting.custody.totalCustody}</p>
            <p className="text-lg font-bold text-secondary font-dubai">{formatCurrency(totalAmount)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="bg-white rounded-xl border-2 border-primary/20 p-4 shadow-[0_4px_20px_rgba(237,191,140,0.12)]"
          >
            <p className="text-xs text-secondary/60 font-dubai mb-1">{t.accounting.custody.spent}</p>
            <p className="text-lg font-bold text-[#c09080] font-dubai">{formatCurrency(totalSpent)}</p>
          </motion.div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white rounded-xl border-2 border-primary/20 p-4 shadow-[0_4px_20px_rgba(237,191,140,0.12)]"
          >
            <p className="text-xs text-secondary/60 font-dubai mb-1">{t.accounting.custody.remaining}</p>
            <p className="text-lg font-bold text-[#8a9a7a] font-dubai">{formatCurrency(totalRemaining)}</p>
          </motion.div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600 font-dubai text-sm">{error}</p>
          <button onClick={fetchRecords} className="mt-2 text-sm text-red-500 underline font-dubai">
            {t.accounting.common.retry}
          </button>
        </div>
      )}

      {/* Records */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : records.length === 0 ? (
        <div className="text-center py-16">
          <Wallet size={48} className="text-secondary/20 mx-auto mb-3" />
          <p className="text-secondary/50 font-dubai">{t.accounting.custody.noCustody}</p>
        </div>
      ) : (
        <div className="space-y-3">
          {records.map((rec, i) => (
            <motion.div
              key={rec.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: i * 0.04 }}
              className="bg-white rounded-2xl border-2 border-primary/20 p-5 shadow-[0_4px_20px_rgba(237,191,140,0.12)]"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-primary/10">
                    <Building2 size={18} className="text-primary" />
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
                  <span className="text-xs bg-primary/10 text-secondary/60 px-2 py-0.5 rounded-full font-dubai">
                    {formatMonthDisplay(rec.month)}
                  </span>
                  {rec.isSettled ? (
                    <span className="text-[10px] bg-secondary/10 text-secondary/80 px-2 py-0.5 rounded-full font-dubai flex items-center gap-0.5">
                      <Check size={10} /> {t.accounting.custody.locked}
                    </span>
                  ) : (
                    <span className="text-[10px] bg-primary/15 text-secondary/70 px-2 py-0.5 rounded-full font-dubai">
                      {t.accounting.custody.unlocked}
                    </span>
                  )}
                </div>
              </div>

              {/* Amounts */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-primary/5 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-secondary/50 font-dubai mb-0.5">{t.accounting.custody.custodyLabel}</p>
                  <p className="text-sm font-bold text-secondary font-dubai">{formatCurrency(rec.amount)}</p>
                </div>
                <div className="bg-[#c09080]/8 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-[#c09080]/70 font-dubai mb-0.5">{t.accounting.custody.spent}</p>
                  <p className="text-sm font-bold text-[#c09080] font-dubai">{formatCurrency(rec.spent)}</p>
                </div>
                <div className="bg-[#8a9a7a]/8 rounded-xl p-2.5 text-center">
                  <p className="text-[10px] text-[#8a9a7a]/70 font-dubai mb-0.5">{t.accounting.custody.remaining}</p>
                  <p className="text-sm font-bold text-[#8a9a7a] font-dubai">{formatCurrency(rec.remaining)}</p>
                </div>
              </div>

              {rec.notes && (
                <p className="text-xs text-secondary/50 font-dubai mt-2 bg-primary/5 rounded-lg px-3 py-1.5">
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-md z-10 overflow-hidden border-2 border-[#e0cdb8]"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">{t.accounting.custody.newCustodyTitle}</h4>
                <button onClick={() => setShowCreate(false)}>
                  <X className="w-4 h-4 text-secondary/40" />
                </button>
              </div>
              <form onSubmit={handleCreate} className="p-5 space-y-3" dir="rtl">
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">{t.accounting.custody.opsManager}</label>
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
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">{t.accounting.custody.apartmentLabel}</label>
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
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">{t.accounting.custody.amountLabel(t.accounting.common.currency)}</label>
                    <NumberInput
                      value={formAmount}
                      onChange={(e) => setFormAmount(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                      required
                      dir="ltr"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">{t.accounting.custody.monthLabel}</label>
                    <input
                      type="month"
                      value={formMonth}
                      onChange={(e) => setFormMonth(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                      required
                      dir="ltr"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">{t.accounting.custody.notesLabel}</label>
                  <textarea
                    value={formNotes}
                    onChange={(e) => setFormNotes(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai resize-none"
                    rows={2}
                  />
                </div>
                {formError && <p className="text-xs text-red-600 font-dubai">{formError}</p>}
                <button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? t.accounting.common.saving : t.accounting.custody.createCustody}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}