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
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  // السحب من إجمالي الأرباح في كل الشقق - نستخدم أول استثمار كمرجع للربط
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
          <div className="flex items-center justify-between px-5 py-4 border-b-2 border-primary/10
            bg-gradient-to-l from-primary/5 to-white"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-xl bg-[#c09080]/10 border-2 border-[#c09080]/25 flex items-center justify-center">
                <ArrowDownCircle className="w-4 h-4 text-[#c09080]" />
              </div>
              <div>
                <h2 className="text-base font-bold text-secondary font-dubai">{t.accounting.withdrawalForm.title}</h2>
                <p className="text-xs text-secondary/60 font-dubai">{investorName}</p>
              </div>
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
            {/* Investments Summary - السحب من إجمالي الأرباح */}
            <div className="bg-primary/5 rounded-xl px-3 py-2.5 text-xs text-secondary/70 font-dubai space-y-1">
              {investments.map(inv => (
                <div key={inv.id} className="flex items-center gap-1.5">
                  <Building2 className="w-3 h-3 text-secondary/40 shrink-0" />
                  <span>{inv.apartment.name} — {t.accounting.withdrawalForm.percentage} {(inv.percentage * 100).toFixed(1)}%</span>
                </div>
              ))}
            </div>

            {/* Amount + Currency */}
            <div className="flex gap-3">
              <div className="flex-1">
                <label className="flex items-center gap-1.5 text-xs font-medium text-secondary/70 mb-1.5 font-dubai">
                  <DollarSign className="w-3 h-3" />
                  {t.accounting.withdrawalForm.amount}
                </label>
                <NumberInput
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2.5 text-sm border-2 border-primary/20 rounded-xl
                    focus:outline-none focus:border-primary
                    font-dubai placeholder:text-secondary/30"
                  required
                />
              </div>
              <div className="w-24">
                <label className="text-xs font-medium text-secondary/70 mb-1.5 font-dubai block">{t.accounting.withdrawalForm.currency}</label>
                <CustomSelect
                  value={currency}
                  onChange={setCurrency}
                  className="w-full"
                  options={[
                    { value: 'USD', label: 'USD' },
                    { value: 'EGP', label: 'EGP' },
                  ]}
                />
              </div>
            </div>

            {/* Date */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-secondary/70 mb-1.5 font-dubai">
                <Calendar className="w-3 h-3" />
                {t.accounting.withdrawalForm.withdrawalDate}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2.5 text-sm border-2 border-primary/20 rounded-xl
                  focus:outline-none focus:border-primary
                  font-dubai"
                required
              />
            </div>

            {/* Comments */}
            <div>
              <label className="flex items-center gap-1.5 text-xs font-medium text-secondary/70 mb-1.5 font-dubai">
                <MessageSquare className="w-3 h-3" />
                {t.accounting.withdrawalForm.notes}
              </label>
              <textarea
                value={comments}
                onChange={(e) => setComments(e.target.value)}
                placeholder={t.accounting.withdrawalForm.notesPlaceholder}
                maxLength={500}
                rows={2}
                className="w-full px-3 py-2.5 text-sm border-2 border-primary/20 rounded-xl
                  focus:outline-none focus:border-primary
                  font-dubai placeholder:text-secondary/30 resize-none"
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
              className="w-full py-2.5 bg-red-600 text-white rounded-xl text-sm font-bold font-dubai
                hover:bg-red-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  {t.accounting.common.saving}
                </>
              ) : (
                t.accounting.withdrawalForm.submit
              )}
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default WithdrawalForm;
