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
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 12 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 12 }}
          className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-md overflow-hidden z-10 border-2 border-[#e0cdb8]"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-primary/10">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                <Users className="w-4 h-4 text-secondary" />
              </div>
              <h2 className="text-base font-bold text-secondary font-dubai">{t.accounting.assignInvestorModal.title}</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-primary/10 text-secondary/40
                hover:text-secondary/70 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-4" dir="rtl">
            {/* Apartment Select */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-secondary/70 mb-1.5 font-dubai">
                <Building2 className="w-3 h-3" />
                {t.accounting.assignInvestorModal.apartment}
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
              <label className="flex items-center gap-1.5 text-xs font-medium text-secondary/70 mb-1.5 font-dubai">
                <Users className="w-3 h-3" />
                {t.accounting.assignInvestorModal.investor}
              </label>
              {isLoadingUsers ? (
                <div className="flex items-center gap-2 py-2.5 text-secondary/40 text-xs">
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
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
                  }))}
                />
              )}
            </div>

            {/* Percentage */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-secondary/70 mb-1.5 font-dubai">
                <Percent className="w-3 h-3" />
                {t.accounting.assignInvestorModal.percentage}
              </label>
              <NumberInput
                value={percentage}
                onChange={(e) => setPercentage(e.target.value)}
                placeholder={t.accounting.assignInvestorModal.percentagePlaceholder}
                className="w-full px-3 py-2.5 text-sm border-2 border-primary/20 rounded-xl
                  focus:outline-none focus:border-primary
                  font-dubai placeholder:text-secondary/30"
                required
              />
            </div>

            {/* Investment Target */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-secondary/70 mb-1.5 font-dubai">
                <Target className="w-3 h-3" />
                {t.accounting.assignInvestorModal.yearlyTarget}
              </label>
              <NumberInput
                value={investmentTarget}
                onChange={(e) => setInvestmentTarget(e.target.value)}
                placeholder={t.accounting.assignInvestorModal.yearlyTargetPlaceholder}
                className="w-full px-3 py-2.5 text-sm border-2 border-primary/20 rounded-xl
                  focus:outline-none focus:border-primary
                  font-dubai placeholder:text-secondary/30"
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl
                px-3 py-2.5 text-xs text-red-600 font-dubai"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                hover:bg-secondary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.accounting.common.saving}
                </>
              ) : (
                t.accounting.assignInvestorModal.assign
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AssignInvestorModal;
