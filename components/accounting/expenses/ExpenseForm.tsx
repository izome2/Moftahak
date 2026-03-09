'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Receipt, Loader2, Building2, FileText, Calendar, CreditCard } from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import NumberInput from '@/components/accounting/shared/NumberInput';
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  const update = (field: keyof ExpenseFormData, value: string | number) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apartmentId) { setError(t.accounting.expenseForm.apartmentRequired); return; }
    if (!formData.description.trim()) { setError(t.accounting.expenseForm.descriptionRequired); return; }
    if (!formData.category) { setError(t.accounting.expenseForm.categoryRequired); return; }
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
  const grouped = (() => {
    const map = new Map<string, Apartment[]>();
    for (const apt of apartments) {
      const key = apt.project?.name || t.accounting.common.noProject;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  })();

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
            className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-lg border-2 border-[#e0cdb8] overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#c09080]/10 border-2 border-[#c09080]/25 flex items-center justify-center">
                  <Receipt size={16} className="text-[#c09080]" />
                </div>
                <h2 className="text-lg font-bold text-secondary font-dubai">
                  {isEdit ? t.accounting.expenseForm.editTitle : t.accounting.expenseForm.addTitle}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <X size={18} className="text-secondary/60" />
              </button>
            </div>

            {/* Form (scrollable) */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4 overflow-y-auto flex-1">
              {/* Apartment */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                  <Building2 size={14} className="text-secondary/50" />
                  {t.accounting.expenseForm.apartment} <span className="text-red-500">*</span>
                </label>
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
              </div>

              {/* Description */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                  <FileText size={14} className="text-secondary/50" />
                  {t.accounting.expenseForm.description} <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => update('description', e.target.value)}
                  placeholder={t.accounting.expenseForm.descriptionPlaceholder}
                  className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                  required
                />
              </div>

              {/* Category Picker */}
              <div>
                <label className="text-sm font-bold text-secondary font-dubai mb-1.5 block">
                  {t.accounting.expenseForm.category} <span className="text-red-500">*</span>
                </label>
                {/* Selected category button */}
                <button
                  type="button"
                  onClick={() => setShowCategoryPicker(prev => !prev)}
                  className={`w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-sm font-dubai font-bold flex items-center gap-2 transition-colors
                    ${showCategoryPicker ? 'border-primary' : 'hover:border-primary/40'}`}
                >
                  <span className={`p-1 rounded-lg ${selectedCategory.className}`}>
                    <SelectedIcon size={14} />
                  </span>
                  <span className="text-secondary">{expenseCats[formData.category] || formData.category}</span>
                  <span className="mr-auto text-secondary/30 text-xs">▼</span>
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
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5 mt-2 p-2 bg-accent/10 rounded-xl border border-primary/10">
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
                                  : 'bg-white text-secondary/60 hover:bg-white/80'
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
              </div>

              {/* Amount + Date */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <CreditCard size={14} className="text-[#c09080]" />
                    {t.accounting.expenseForm.amount} <span className="text-red-500">*</span>
                  </label>
                  <NumberInput
                    value={formData.amount || ''}
                    onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30 ltr text-left"
                    dir="ltr"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <Calendar size={14} className="text-secondary/50" />
                    {t.accounting.expenseForm.date} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => update('date', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                  <FileText size={14} className="text-secondary/50" />
                  {t.accounting.expenseForm.notes}
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder={t.accounting.expenseForm.notesPlaceholder}
                  rows={2}
                  className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <p className="text-sm text-red-500 font-dubai bg-red-50 p-2.5 rounded-lg">
                  {error}
                </p>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 p-3 rounded-xl border-2 border-primary/20 text-secondary font-dubai text-sm font-bold hover:bg-accent/30 transition-colors"
                >
                  {t.accounting.common.cancel}
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 p-3 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
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
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ExpenseForm;
