'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  RefreshCw,
  Loader2,
  Info,
  Search,
  X,
  Percent,
  Target,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestorsList from '@/components/accounting/investors/InvestorsList';
import AssignInvestorModal from '@/components/accounting/investors/AssignInvestorModal';
import WithdrawalForm from '@/components/accounting/investors/WithdrawalForm';
import NumberInput from '@/components/accounting/shared/NumberInput';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// --- Types ---
interface InvestmentInfo {
  id: string;
  percentage: number;
  investmentTarget: number;
  apartment: { id: string; name: string };
  _count: { withdrawals: number };
}

interface InvestorRow {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  investments: InvestmentInfo[];
}

interface Apartment {
  id: string;
  name: string;
  project?: { id: string; name: string } | null;
}

export default function InvestorsPage() {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';

  // Data
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [withdrawalTarget, setWithdrawalTarget] = useState<InvestorRow | null>(null);

  // Edit/delete state
  const [editInvestment, setEditInvestment] = useState<{
    investmentId: string;
    apartmentId: string;
    investor: InvestorRow;
  } | null>(null);
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    investmentId: string;
    apartmentId: string;
    investor: InvestorRow;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editPercentage, setEditPercentage] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // --- Fetch investors ---
  const fetchInvestors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/accounting/investors');
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t.accounting.errors.generic);
        return;
      }
      setInvestors(json.investors || []);
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Fetch apartments ---
  const fetchApartments = useCallback(async () => {
    try {
      const res = await fetch('/api/accounting/apartments');
      const json = await res.json();
      if (res.ok) setApartments(json.apartments || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchInvestors();
    fetchApartments();
  }, [fetchInvestors, fetchApartments]);

  // --- Handlers ---
  const handleAddWithdrawal = (investor: InvestorRow) => {
    setWithdrawalTarget(investor);
  };

  const handleViewDetails = (investor: InvestorRow) => {
    router.push(`/accounting/investors/${investor.id}`);
  };

  const handleEditInvestment = (investmentId: string, investor: InvestorRow) => {
    const inv = investor.investments.find(i => i.id === investmentId);
    if (!inv) return;
    setEditInvestment({
      investmentId,
      apartmentId: inv.apartment.id,
      investor,
    });
    setEditPercentage(String((inv.percentage * 100).toFixed(1)));
    setEditTarget(String(inv.investmentTarget || ''));
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInvestment) return;

    const pct = parseFloat(editPercentage) / 100;
    if (isNaN(pct) || pct < 0.01 || pct > 1) {
      setEditError(t.accounting.errors.percentRange);
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(
        `/api/accounting/apartments/${editInvestment.apartmentId}/investors/${editInvestment.investmentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            percentage: pct,
            investmentTarget: editTarget ? parseFloat(editTarget) : 0,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setEditError(json.error || t.accounting.errors.generic);
        return;
      }
      setEditInvestment(null);
      fetchInvestors();
    } catch {
      setEditError(t.accounting.errors.connectionFailed);
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteInvestment = (investmentId: string, investor: InvestorRow) => {
    const inv = investor.investments.find(i => i.id === investmentId);
    if (!inv) return;
    setDeleteConfirm({
      investmentId,
      apartmentId: inv.apartment.id,
      investor,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/accounting/apartments/${deleteConfirm.apartmentId}/investors/${deleteConfirm.investmentId}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t.accounting.errors.deleteError);
      } else {
        fetchInvestors();
      }
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Filter investors by search
  const filteredInvestors = search
    ? investors.filter(inv => {
        const name = `${inv.firstName} ${inv.lastName}`.toLowerCase();
        const email = (inv.email || '').toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || email.includes(q);
      })
    : investors;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-secondary font-dubai tracking-tight">{t.accounting.investors.title}</h1>
            <p className="text-xs text-secondary font-dubai mt-0.5">
              {t.accounting.investors.subtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={fetchInvestors}
            disabled={isLoading}
            className="p-2 hover:bg-secondary/5 rounded-xl transition-all"
          >
            <RefreshCw size={16} className={`text-secondary/40 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-xl font-dubai text-sm font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300"
          >
            <Plus size={15} />
            {t.accounting.investors.assignInvestor}
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/50" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder={t.accounting.investors.searchPlaceholder}
          className="w-full pr-10 pl-4 py-2.5 text-sm border-2 border-primary/20 rounded-xl
            bg-white text-secondary font-dubai
            focus:outline-none focus:border-primary/40 transition-colors
            placeholder:text-secondary/40"
        />
      </div>

      {/* Summary */}
      {!isLoading && investors.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 text-sm text-secondary font-dubai"
        >
          <span>{investors.length} {t.accounting.investors.investorUnit}</span>
          <span>
            {investors.reduce((s, inv) => s + inv.investments.length, 0)} {t.accounting.investors.investmentUnit}
          </span>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-50/80 border border-red-200/60 rounded-xl px-4 py-3 text-sm text-red-600
              flex items-center gap-2 font-dubai backdrop-blur-sm"
          >
            <Info className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={fetchInvestors} className="text-xs text-red-500 hover:text-red-700 font-dubai font-bold transition-colors">{t.accounting.common.retry}</button>
            <button onClick={() => setError(null)} className="mr-auto text-red-400 hover:text-red-600">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investors List */}
      <InvestorsList
        investors={filteredInvestors}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onEditInvestment={handleEditInvestment}
        onDeleteInvestment={handleDeleteInvestment}
        onAddWithdrawal={handleAddWithdrawal}
      />

      {/* Assign Investor Modal */}
      <AssignInvestorModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => fetchInvestors()}
        apartments={apartments}
      />

      {/* Withdrawal Form Modal */}
      {withdrawalTarget && (
        <WithdrawalForm
          isOpen={!!withdrawalTarget}
          onClose={() => setWithdrawalTarget(null)}
          onSuccess={() => fetchInvestors()}
          investorId={withdrawalTarget.id}
          investorName={`${withdrawalTarget.firstName} ${withdrawalTarget.lastName}`}
          investments={withdrawalTarget.investments.map(inv => ({
            id: inv.id,
            apartment: inv.apartment,
            percentage: inv.percentage,
          }))}
        />
      )}

      {/* Edit Investment Modal */}
      <AnimatePresence>
        {editInvestment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditInvestment(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm overflow-hidden z-10 border border-secondary/[0.08]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                    <Percent size={15} className="text-white" />
                  </div>
                  <h2 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.investors.editPercentage}</h2>
                </div>
                <button onClick={() => setEditInvestment(null)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors">
                  <X size={18} className="text-secondary/40" />
                </button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-5 space-y-5" dir="rtl">
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                      <Percent size={11} className="text-secondary/50" />
                    </span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.investors.percentageLabel}</span>
                    <span className="text-red-400 text-xs">*</span>
                  </label>
                  <NumberInput
                    value={editPercentage}
                    onChange={(e) => setEditPercentage(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                      <Target size={11} className="text-secondary/50" />
                    </span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.investors.yearlyTarget}</span>
                  </label>
                  <NumberInput
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                  />
                </div>
                {editError && (
                  <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">{editError}</p>
                )}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button"
                    onClick={() => setEditInvestment(null)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >
                    {t.accounting.common.cancel}
                  </button>
                  <button
                    type="submit"
                    disabled={editLoading}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                    {editLoading ? t.accounting.common.saving : t.accounting.investors.saveEdit}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm overflow-hidden z-10 border border-secondary/[0.08]"
            >
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-secondary/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-500/80 flex items-center justify-center">
                  <AlertTriangle size={15} className="text-white" />
                </div>
                <h3 className="text-base font-bold text-secondary font-dubai tracking-tight">
                  {t.accounting.investors.confirmRemove}
                </h3>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-secondary font-dubai">
                  {t.accounting.investors.confirmRemoveMessage(`${deleteConfirm.investor.firstName} ${deleteConfirm.investor.lastName}`, '')}
                </p>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setDeleteConfirm(null)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >
                    {t.accounting.common.cancel}
                  </button>
                  <button
                    onClick={confirmDelete}
                    disabled={isDeleting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-dubai text-sm font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={14} />}
                    {isDeleting ? t.accounting.common.deleting : t.accounting.investors.yesRemove}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
