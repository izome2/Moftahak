'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Building2,
  Users,
  Percent,
  Target,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import NumberInput from '@/components/accounting/shared/NumberInput';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Apartment {
  id: string;
  name: string;
  project?: { id: string; name: string } | null;
}

interface InvestorUser {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  image?: string | null;
}

interface AssignInvestorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  apartments: Apartment[];
  preselectedApartmentId?: string;
}

const AssignInvestorModal: React.FC<AssignInvestorModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  apartments,
  preselectedApartmentId,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const [apartmentId, setApartmentId] = useState(preselectedApartmentId || '');
  const [investorUsers, setInvestorUsers] = useState<InvestorUser[]>([]);
  const [userId, setUserId] = useState('');
  const [percentage, setPercentage] = useState('');
  const [investmentTarget, setInvestmentTarget] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingUsers, setIsLoadingUsers] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch investor-role users
  const fetchInvestorUsers = useCallback(async () => {
    try {
      setIsLoadingUsers(true);
      const res = await fetch('/api/accounting/investors');
      const json = await res.json();
      if (res.ok) {
        setInvestorUsers(
          (json.investors || []).map((inv: InvestorUser & { investments?: unknown[] }) => ({
            id: inv.id,
            firstName: inv.firstName,
            lastName: inv.lastName,
            email: inv.email,
            image: inv.image,
          }))
        );
      }
    } catch {
      // silent
    } finally {
      setIsLoadingUsers(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchInvestorUsers();
      setError(null);
      setUserId('');
      setPercentage('');
      setInvestmentTarget('');
      if (preselectedApartmentId) setApartmentId(preselectedApartmentId);
    }
  }, [isOpen, fetchInvestorUsers, preselectedApartmentId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apartmentId || !userId || !percentage) {
      setError(t.accounting.errors.selectApartmentAndInvestor);
      return;
    }

    const pct = parseFloat(percentage) / 100; // convert UI% → decimal
    if (isNaN(pct) || pct < 0.01 || pct > 1) {
      setError(t.accounting.errors.percentRange);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/accounting/apartments/${apartmentId}/investors`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          percentage: pct,
          investmentTarget: investmentTarget ? parseFloat(investmentTarget) : 0,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || t.accounting.errors.assignError);
        return;
      }

      onSuccess();
      onClose();
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-md overflow-hidden z-10 border border-secondary/[0.08]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                <Users size={15} className="text-white" />
              </div>
              <h2 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.assignInvestorModal.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
            >
              <X size={18} className="text-secondary/70" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5" dir="rtl">
            {/* Apartment Select */}
            <div>
              <label className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                  <Building2 size={11} className="text-secondary/75" />
                </span>
                <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.assignInvestorModal.apartment}</span>
                <span className="text-red-400 text-xs">*</span>
              </label>
              <CustomSelect
                value={apartmentId}
                onChange={setApartmentId}
                className="w-full"
                placeholder={t.accounting.assignInvestorModal.selectApartment}
                required
                emptyMessage={t.accounting.assignInvestorModal.noApartments}
                options={apartments.map(apt => ({
                  value: apt.id,
                  label: `${apt.name}${apt.project ? ` (${apt.project.name})` : ''}`,
                }))}
              />
            </div>

            {/* Investor Select */}
            <div>
              <label className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                  <Users size={11} className="text-secondary/75" />
                </span>
                <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.assignInvestorModal.investor}</span>
                <span className="text-red-400 text-xs">*</span>
              </label>
              {isLoadingUsers ? (
                <div className="flex items-center gap-2 py-2.5 text-secondary/70 text-xs">
                  <Loader2 size={14} className="animate-spin" />
                  <span className="font-dubai">{t.accounting.assignInvestorModal.loadingInvestors}</span>
                </div>
              ) : (
                <CustomSelect
                  value={userId}
                  onChange={setUserId}
                  className="w-full"
                  placeholder={t.accounting.assignInvestorModal.selectInvestor}
                  required
                  emptyMessage={t.accounting.assignInvestorModal.noInvestors}
                  options={investorUsers.map(u => ({
                    value: u.id,
                    label: `${u.firstName} ${u.lastName}${u.email ? ` (${u.email})` : ''}`,
                    image: u.image,
                  }))}
                />
              )}
            </div>

            {/* Percentage */}
            <div>
              <label className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                  <Percent size={11} className="text-secondary/75" />
                </span>
                <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.assignInvestorModal.percentage}</span>
                <span className="text-red-400 text-xs">*</span>
              </label>
              <NumberInput
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder={t.accounting.assignInvestorModal.percentagePlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/60"
                required
              />
            </div>

            {/* Investment Target */}
            <div>
              <label className="flex items-center gap-1.5 mb-2">
                <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                  <Target size={11} className="text-secondary/75" />
                </span>
                <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.assignInvestorModal.yearlyTarget}</span>
              </label>
              <NumberInput
                value={investmentTarget}
                onChange={(e) => setInvestmentTarget(e.target.value)}
                placeholder={t.accounting.assignInvestorModal.yearlyTargetPlaceholder}
                className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/60"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">
                <AlertCircle size={14} className="shrink-0" />
                {error}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/75 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
              >
                {t.accounting.common.cancel}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    {t.accounting.common.saving}
                  </>
                ) : (
                  t.accounting.assignInvestorModal.assign
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignInvestorModal;
