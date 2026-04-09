'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Loader2, Building2, FileText, Calendar, CreditCard, ChevronLeft, ChevronRight } from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import NumberInput from '@/components/accounting/shared/NumberInput';
import DatePicker from '@/components/accounting/shared/DatePicker';
import { CATEGORY_STYLE_MAP } from './CategoryBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Apartment {
  id: string;
  name: string;
  project?: { name: string } | null;
}

export interface ExpenseFormData {
  id?: string;
  apartmentId: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
}

interface ExpenseFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ExpenseFormData) => Promise<void>;
  initialData?: ExpenseFormData | null;
  apartments: Apartment[];
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

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/80";

const ExpenseForm: React.FC<ExpenseFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  apartments,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const isEdit = !!initialData?.id;
  const isRTL = language === 'ar';

  const expenseCats = t.accounting.expenseCategories as Record<string, string>;

  const CATEGORY_OPTIONS = Object.entries(CATEGORY_STYLE_MAP).map(([value, config]) => ({
    value,
    label: expenseCats[value] || value,
    icon: config.icon,
    className: config.className,
  }));

  const defaultForm: ExpenseFormData = {
    apartmentId: apartments[0]?.id || '',
    description: '',
    category: 'CLEANING',
    amount: 0,
    currency: 'USD',
    date: new Date().toISOString().slice(0, 10),
    notes: '',
  };

  const [formData, setFormData] = useState<ExpenseFormData>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultForm,
        ...initialData,
        date: initialData.date ? initialData.date.slice(0, 10) : defaultForm.date,
      });
    } else {
      setFormData({ ...defaultForm, apartmentId: apartments[0]?.id || '' });
    }
    setError(null);
    setShowCategoryPicker(false);
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  const update = (field: keyof ExpenseFormData, value: string | number) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const validateStep1 = () => {
    if (!formData.apartmentId) { setError(t.accounting.expenseForm.apartmentRequired); return false; }
    if (!formData.description.trim()) { setError(t.accounting.expenseForm.descriptionRequired); return false; }
    if (!formData.category) { setError(t.accounting.expenseForm.categoryRequired); return false; }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.amount <= 0) { setError(t.accounting.expenseForm.amountMustBePositive); return; }
    if (!formData.date) { setError(t.accounting.expenseForm.dateRequired); return; }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        ...formData,
        ...(isEdit ? { id: initialData!.id } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedCategory = CATEGORY_STYLE_MAP[formData.category] || CATEGORY_STYLE_MAP.OTHER;
  const SelectedIcon = selectedCategory.icon;

  // Group apartments by project
  const grouped = useMemo(() => {
    const map = new Map<string, Apartment[]>();
    for (const apt of apartments) {
      const key = apt.project?.name || t.accounting.common.noProject;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [apartments, t]);

  const BackArrow = isRTL ? ChevronRight : ChevronLeft;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-lg border border-secondary/[0.08] overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Receipt size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-secondary font-dubai tracking-tight">
                    {isEdit ? t.accounting.expenseForm.editTitle : t.accounting.expenseForm.addTitle}
                  </h2>
                  <p className="text-[11px] text-secondary/90 font-dubai">
                    {step === 1 ? t.accounting.expenseForm.stepExpenseInfo : t.accounting.expenseForm.stepAmountDate}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
              >
                <X size={18} className="text-secondary/90" />
              </button>
            </div>

            {/* Step indicator */}
            <div className="px-5 pt-4 pb-1 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex-1 h-1 rounded-full bg-secondary/15 overflow-hidden">
                  <div className="h-full rounded-full bg-secondary transition-all duration-500" style={{ width: '100%' }} />
                </div>
                <div className="flex-1 h-1 rounded-full bg-secondary/[0.08] overflow-hidden">
                  <div className={`h-full rounded-full bg-secondary transition-all duration-500 ${step === 2 ? 'w-full' : 'w-0'}`} />
                </div>
              </div>
            </div>

            {/* Form content */}
            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                {step === 1 ? (
                  <motion.div
                    key="step1"
                    initial={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 space-y-5"
                  >
                    {/* Apartment */}
                    <FormField
                      icon={<Building2 size={11} className="text-secondary/90" />}
                      label={t.accounting.expenseForm.apartment}
                      required
                    >
                      <CustomSelect
                        value={formData.apartmentId}
                        onChange={(v) => update('apartmentId', v)}
                        className="w-full"
                        placeholder={t.accounting.expenseForm.selectApartment}
                        required
                        emptyMessage={t.accounting.expenseForm.noApartments}
                        options={Array.from(grouped.entries()).map(([project, apts]) => ({
                          label: project,
                          options: apts.map(a => ({ value: a.id, label: a.name })),
                        }))}
                      />
                    </FormField>

                    {/* Description */}
                    <FormField
                      icon={<FileText size={11} className="text-secondary/90" />}
                      label={t.accounting.expenseForm.description}
                      required
                    >
                      <input
                        type="text"
                        value={formData.description}
                        onChange={(e) => update('description', e.target.value)}
                        placeholder={t.accounting.expenseForm.descriptionPlaceholder}
                        className={inputClass}
                        required
                      />
                    </FormField>

                    {/* Category Picker */}
                    <FormField
                      icon={<SelectedIcon size={11} className="text-secondary/90" />}
                      label={t.accounting.expenseForm.category}
                      required
                    >
                      {/* Selected category button */}
                      <button
                        type="button"
                        onClick={() => setShowCategoryPicker(prev => !prev)}
                        className={`w-full px-3.5 py-2.5 rounded-xl border bg-white text-sm font-dubai font-bold flex items-center gap-2 transition-all ${
                          showCategoryPicker ? 'border-secondary/20 ring-[3px] ring-secondary/[0.04]' : 'border-secondary/[0.08] hover:border-secondary/15'
                        }`}
                      >
                        <span className={`p-1 rounded-lg ${selectedCategory.className}`}>
                          <SelectedIcon size={14} />
                        </span>
                        <span className="text-secondary">{expenseCats[formData.category] || formData.category}</span>
                        <span className="mr-auto text-secondary/80 text-xs">▼</span>
                      </button>

                      {/* Category grid */}
                      <AnimatePresence>
                        {showCategoryPicker && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 p-2 bg-secondary/[0.02] rounded-xl border border-secondary/[0.06]">
                              {CATEGORY_OPTIONS.map(opt => {
                                const Icon = opt.icon;
                                const isSelected = formData.category === opt.value;
                                return (
                                  <button
                                    key={opt.value}
                                    type="button"
                                    onClick={() => {
                                      update('category', opt.value);
                                      setShowCategoryPicker(false);
                                    }}
                                    className={`flex items-center gap-1.5 px-2 py-2 rounded-lg text-xs font-dubai font-bold transition-all ${
                                      isSelected
                                        ? `${opt.className} ring-2 ring-current/30 scale-[1.02]`
                                        : 'bg-white text-secondary/90 hover:bg-white/80'
                                    }`}
                                  >
                                    <Icon size={13} />
                                    {opt.label}
                                  </button>
                                );
                              })}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </FormField>

                    {/* Error */}
                    {error && (
                      <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">
                        {error}
                      </p>
                    )}

                    {/* Step 1 actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/90 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                      >
                        {t.accounting.common.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all flex items-center justify-center gap-1.5"
                      >
                        {t.accounting.expenseForm.next}
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="step2"
                    initial={{ opacity: 0, x: isRTL ? -20 : 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: isRTL ? 20 : -20 }}
                    transition={{ duration: 0.2 }}
                    className="p-5 space-y-5"
                  >
                    {/* Amount + Date */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                      <FormField
                        icon={<CreditCard size={11} className="text-emerald-500/90" />}
                        label={t.accounting.expenseForm.amount}
                        required
                      >
                        <NumberInput
                          value={formData.amount || ''}
                          onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
                          placeholder="0"
                          className={`${inputClass} ltr text-left`}
                          dir="ltr"
                          required
                        />
                      </FormField>
                      <FormField
                        icon={<Calendar size={11} className="text-secondary/90" />}
                        label={t.accounting.expenseForm.date}
                        required
                      >
                        <DatePicker
                          value={formData.date}
                          onChange={(v) => update('date', v)}
                          required
                        />
                      </FormField>
                    </div>

                    {/* Notes */}
                    <FormField
                      icon={<FileText size={11} className="text-secondary/90" />}
                      label={t.accounting.expenseForm.notes}
                    >
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => update('notes', e.target.value)}
                        placeholder={t.accounting.expenseForm.notesPlaceholder}
                        rows={2}
                        className={`${inputClass} resize-none`}
                      />
                    </FormField>

                    {/* Error */}
                    {error && (
                      <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">
                        {error}
                      </p>
                    )}

                    {/* Step 2 actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={() => { setStep(1); setError(null); }}
                        className="py-2.5 px-4 rounded-xl border border-secondary/[0.08] text-secondary/90 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors flex items-center gap-1"
                      >
                        <BackArrow size={14} />
                        {t.accounting.expenseForm.back}
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={16} className="animate-spin" />
                            {t.accounting.common.saving}
                          </>
                        ) : (
                          isEdit ? t.accounting.expenseForm.saveEdit : t.accounting.expenseForm.saveExpense
                        )}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpenseForm;
