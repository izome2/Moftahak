'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  ArrowDownCircle,
  DollarSign,
  Calendar,
  MessageSquare,
  Building2,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import NumberInput from '@/components/accounting/shared/NumberInput';
import DatePicker from '@/components/accounting/shared/DatePicker';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Investment {
  id: string;
  apartment: { id: string; name: string };
  percentage: number;
}

interface WithdrawalFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  investorId: string;
  investorName: string;
  investments: Investment[];
}

/* ─── Field wrapper ─── */
const FormField: React.FC<{
  icon: React.ReactNode;
  label: string;
  required?: boolean;
  children: React.ReactNode;
  className?: string;
}> = ({ icon, label, required, children, className = '' }) => (
  <div className={className}>
    <label className="flex items-center gap-1.5 mb-2">
      <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
        {icon}
      </span>
      <span className="text-[13px] font-bold text-secondary font-dubai">{label}</span>
      {required && <span className="text-red-400 text-xs">*</span>}
    </label>
    {children}
  </div>
);

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25";

const WithdrawalForm: React.FC<WithdrawalFormProps> = ({
  isOpen,
  onClose,
  onSuccess,
  investorId,
  investorName,
  investments,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const [apartmentInvestorId] = useState(
    investments.length > 0 ? investments[0].id : ''
  );
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [comments, setComments] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!apartmentInvestorId || !amount || !date) {
      setError(t.accounting.errors.selectApartmentAmountDate);
      return;
    }

    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      setError(t.accounting.errors.amountMustBePositive);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/accounting/investors/${investorId}/withdrawals`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          apartmentInvestorId,
          amount: amountNum,
          currency,
          date,
          comments: comments.trim() || undefined,
        }),
      });

      const json = await res.json();

      if (!res.ok) {
        setError(json.error || t.accounting.errors.withdrawalError);
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
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-500/80 flex items-center justify-center">
                <ArrowDownCircle size={15} className="text-white" />
              </div>
              <div>
                <h2 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.withdrawalForm.title}</h2>
                <p className="text-[11px] text-secondary/40 font-dubai">{investorName}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
            >
              <X size={18} className="text-secondary/40" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-5 space-y-5" dir="rtl">
            {/* Investments Summary */}
            <div className="bg-secondary/[0.03] rounded-xl px-3.5 py-2.5 text-xs text-secondary font-dubai space-y-1.5 border border-secondary/[0.06]">
              {investments.map(inv => (
                <div key={inv.id} className="flex items-center gap-1.5">
                  <Building2 size={12} className="text-secondary/40 shrink-0" />
                  <span>{inv.apartment.name} — {t.accounting.withdrawalForm.percentage} {new Intl.NumberFormat(locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 }).format(inv.percentage * 100)}%</span>
                </div>
              ))}
            </div>

            {/* Amount + Currency */}
            <div className="flex gap-4">
              <FormField
                icon={<DollarSign size={11} className="text-emerald-500/70" />}
                label={t.accounting.withdrawalForm.amount}
                required
                className="flex-1"
              >
                <NumberInput
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className={`${inputClass} ltr text-left`}
                  dir="ltr"
                  required
                />
              </FormField>
              <FormField
                icon={<DollarSign size={11} className="text-secondary/50" />}
                label={t.accounting.withdrawalForm.currency}
                className="w-24"
              >
                <CustomSelect
                  value={currency}
                  onChange={setCurrency}
                  className="w-full"
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'EGP', label: 'EGP' },
                  ]}
                />
              </FormField>
            </div>

            {/* Date */}
            <FormField
              icon={<Calendar size={11} className="text-secondary/50" />}
              label={t.accounting.withdrawalForm.withdrawalDate}
              required
            >
              <DatePicker
                value={date}
                onChange={(v) => setDate(v)}
                required
              />
            </FormField>

            {/* Comments */}
            <FormField
              icon={<MessageSquare size={11} className="text-secondary/50" />}
              label={t.accounting.withdrawalForm.notes}
            >
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t.accounting.withdrawalForm.notesPlaceholder}
                maxLength={500}
                rows={2}
                className={`${inputClass} resize-none`}
              />
            </FormField>

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
                className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
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
                  t.accounting.withdrawalForm.submit
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalForm;
