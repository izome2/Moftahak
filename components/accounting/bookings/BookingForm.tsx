'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarCheck, Loader2, Calendar, Phone, User, CreditCard, Clock, FileText, Building2, ChevronLeft, ChevronRight, Moon } from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import NumberInput from '@/components/accounting/shared/NumberInput';
import DatePicker, { TimePicker } from '@/components/accounting/shared/DatePicker';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Apartment {
  id: string;
  name: string;
  project?: { name: string } | null;
}

export interface BookingFormData {
  id?: string;
  apartmentId: string;
  clientName: string;
  clientPhone?: string;
  source: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  currency: string;
  arrivalTime?: string;
  notes?: string;
  status?: string;
}

interface BookingFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: BookingFormData) => Promise<void>;
  initialData?: BookingFormData | null;
  apartments: Apartment[];
  hideFinancials?: boolean;
  blockPastDates?: boolean;
}

const SOURCE_COLORS: Record<string, string> = {
  AIRBNB: '#FF5A5F',
  BOOKING_COM: '#003B95',
  EXTERNAL: '#10302b',
  DIRECT: '#edbf8c',
  OTHER: '#6b7280',
};

const calcNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

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

const BookingForm: React.FC<BookingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  apartments,
  hideFinancials = false,
  blockPastDates = false,
}) => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const isEdit = !!initialData?.id;
  const isRTL = language === 'ar';

  const SOURCE_OPTIONS = useMemo(() => [
    { value: 'AIRBNB', label: 'Airbnb', color: SOURCE_COLORS.AIRBNB },
    { value: 'BOOKING_COM', label: 'Booking.com', color: SOURCE_COLORS.BOOKING_COM },
    { value: 'EXTERNAL', label: t.accounting.bookingSources.EXTERNAL, color: SOURCE_COLORS.EXTERNAL },
    { value: 'DIRECT', label: t.accounting.bookingSources.DIRECT, color: SOURCE_COLORS.DIRECT },
    { value: 'OTHER', label: t.accounting.bookingSources.OTHER, color: SOURCE_COLORS.OTHER },
  ], [t]);

  const getToday = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };
  const getTomorrow = () => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  const defaultForm: BookingFormData = {
    apartmentId: apartments[0]?.id || '',
    clientName: '',
    clientPhone: '',
    source: 'AIRBNB',
    checkIn: getToday(),
    checkOut: getTomorrow(),
    nights: 1,
    amount: 0,
    currency: 'USD',
    arrivalTime: '',
    notes: '',
    status: 'CONFIRMED',
  };

  const [formData, setFormData] = useState<BookingFormData>(defaultForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (initialData) {
      setFormData({
        ...defaultForm,
        ...initialData,
        checkIn: initialData.checkIn ? initialData.checkIn.slice(0, 10) : '',
        checkOut: initialData.checkOut ? initialData.checkOut.slice(0, 10) : '',
      });
    } else {
      setFormData({ ...defaultForm, apartmentId: apartments[0]?.id || '' });
    }
    setError(null);
    setStep(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData, isOpen]);

  // Auto-calculate nights
  const computedNights = useMemo(
    () => calcNights(formData.checkIn, formData.checkOut),
    [formData.checkIn, formData.checkOut],
  );

  useEffect(() => {
    if (computedNights > 0) {
      setFormData(prev => ({ ...prev, nights: computedNights }));
    }
  }, [computedNights]);

  const update = (field: keyof BookingFormData, value: string | number) => {
    setFormData(prev => {
      const next = { ...prev, [field]: value };
      if (field === 'checkIn' && typeof value === 'string' && value && !isEdit) {
        const d = new Date(value);
        d.setDate(d.getDate() + 1);
        next.checkOut = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      return next;
    });
  };

  const validateStep1 = () => {
    if (!formData.apartmentId) { setError(t.accounting.bookingForm.apartmentRequired); return false; }
    if (!formData.clientName.trim()) { setError(t.accounting.bookingForm.clientNameRequired); return false; }
    if (!formData.clientPhone?.trim()) { setError(t.accounting.bookingForm.contactNumberRequired); return false; }
    setError(null);
    return true;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.checkIn) { setError(t.accounting.bookingForm.checkInRequired); return; }
    if (!formData.checkOut) { setError(t.accounting.bookingForm.checkOutRequired); return; }
    if (computedNights < 1) { setError(t.accounting.bookingForm.checkOutAfterCheckIn); return; }
    if (formData.amount <= 0) { setError(t.accounting.bookingForm.amountMustBePositive); return; }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        ...formData,
        nights: computedNights,
        ...(isEdit ? { id: initialData!.id } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group apartments by project
  const grouped = useMemo(() => {
    const map = new Map<string, Apartment[]>();
    for (const apt of apartments) {
      const key = apt.project?.name || t.accounting.common.noProject;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [apartments]);

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
                  <CalendarCheck size={15} className="text-white" />
                </div>
                <div>
                  <h2 className="text-base font-bold text-secondary font-dubai tracking-tight">
                    {isEdit ? t.accounting.bookingForm.editTitle : t.accounting.bookingForm.addTitle}
                  </h2>
                  <p className="text-[11px] text-secondary/40 font-dubai">
                    {step === 1 ? t.accounting.bookingForm.stepBookingInfo : t.accounting.bookingForm.stepDetails}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
              >
                <X size={18} className="text-secondary/40" />
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
                      icon={<Building2 size={11} className="text-secondary/50" />}
                      label={t.accounting.bookingForm.apartment}
                      required
                    >
                      <CustomSelect
                        value={formData.apartmentId}
                        onChange={(v) => update('apartmentId', v)}
                        className="w-full"
                        placeholder={t.accounting.bookingForm.selectApartment}
                        required
                        emptyMessage={t.accounting.bookingForm.noApartments}
                        options={Array.from(grouped.entries()).map(([project, apts]) => ({
                          label: project,
                          options: apts.map(a => ({ value: a.id, label: a.name })),
                        }))}
                      />
                    </FormField>

                    {/* Client Name + Phone */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        icon={<User size={11} className="text-secondary/50" />}
                        label={t.accounting.bookingForm.clientName}
                        required
                      >
                        <input
                          type="text"
                          value={formData.clientName}
                          onChange={(e) => update('clientName', e.target.value)}
                          placeholder={t.accounting.bookingForm.guestName}
                          className={inputClass}
                          required
                        />
                      </FormField>
                      <FormField
                        icon={<Phone size={11} className="text-secondary/50" />}
                        label={t.accounting.bookingForm.contactNumber}
                        required
                      >
                        <input
                          type="text"
                          value={formData.clientPhone || ''}
                          onChange={(e) => update('clientPhone', e.target.value)}
                          placeholder="+20 xxx xxx xxxx"
                          className={`${inputClass} ltr text-left`}
                          dir="ltr"
                          required
                        />
                      </FormField>
                    </div>

                    {/* Source */}
                    <FormField
                      icon={<CreditCard size={11} className="text-secondary/50" />}
                      label={t.accounting.bookingForm.bookingSource}
                      required
                    >
                      <div className="flex flex-wrap gap-2">
                        {SOURCE_OPTIONS.map(src => (
                          <button
                            key={src.value}
                            type="button"
                            onClick={() => update('source', src.value)}
                            className={`px-3.5 py-2 rounded-xl text-xs font-dubai font-bold transition-all border ${
                              formData.source === src.value
                                ? 'border-current shadow-sm scale-[1.02]'
                                : 'border-secondary/[0.06] bg-secondary/[0.015] text-secondary/40 hover:bg-secondary/[0.04]'
                            }`}
                            style={
                              formData.source === src.value
                                ? { backgroundColor: `${src.color}12`, color: src.color, borderColor: `${src.color}30` }
                                : undefined
                            }
                          >
                            {src.label}
                          </button>
                        ))}
                      </div>
                    </FormField>

                    {/* Notes */}
                    <FormField
                      icon={<FileText size={11} className="text-secondary/50" />}
                      label={t.accounting.bookingForm.notes}
                    >
                      <textarea
                        value={formData.notes || ''}
                        onChange={(e) => update('notes', e.target.value)}
                        placeholder={t.accounting.bookingForm.notesPlaceholder}
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

                    {/* Step 1 actions */}
                    <div className="flex items-center gap-3 pt-1">
                      <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                      >
                        {t.accounting.common.cancel}
                      </button>
                      <button
                        type="button"
                        onClick={handleNext}
                        className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all flex items-center justify-center gap-1.5"
                      >
                        {t.accounting.bookingForm.next}
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
                    {/* Check-in / Check-out dates */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FormField
                        icon={<Calendar size={11} className="text-emerald-500/70" />}
                        label={t.accounting.bookingForm.checkInDate}
                        required
                      >
                        <DatePicker
                          value={formData.checkIn}
                          onChange={(v) => update('checkIn', v)}
                          minDate={blockPastDates ? getToday() : undefined}
                          blockPastDates={blockPastDates}
                          required
                        />
                      </FormField>
                      <FormField
                        icon={<Calendar size={11} className="text-rose-400/70" />}
                        label={t.accounting.bookingForm.checkOutDate}
                        required
                      >
                        <DatePicker
                          value={formData.checkOut}
                          onChange={(v) => update('checkOut', v)}
                          minDate={formData.checkIn || undefined}
                          blockPastDates={blockPastDates}
                          required
                        />
                      </FormField>
                    </div>

                    {/* Nights display */}
                    <div className="flex items-center justify-center py-2">
                      <div className="flex items-center gap-2 px-5 py-2 rounded-2xl bg-secondary/[0.03] border border-secondary/[0.05]">
                        <Moon size={14} className="text-violet-400" />
                        {computedNights > 0 ? (
                          <span className="text-sm font-bold text-secondary font-dubai">
                            {new Intl.NumberFormat(locale).format(computedNights)} {t.accounting.common.night}
                          </span>
                        ) : (
                          <span className="text-sm text-secondary/30 font-dubai">{t.accounting.common.autoCalculated}</span>
                        )}
                      </div>
                    </div>

                    {/* Amount + Arrival Time */}
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                      <FormField
                        icon={<CreditCard size={11} className="text-emerald-500/70" />}
                        label={t.accounting.bookingForm.financialValue}
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
                        icon={<Clock size={11} className="text-secondary/50" />}
                        label={t.accounting.bookingForm.arrivalTime}
                      >
                        <TimePicker
                          value={formData.arrivalTime || ''}
                          onChange={(v) => update('arrivalTime', v)}
                        />
                      </FormField>
                    </div>



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
                        className="py-2.5 px-4 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors flex items-center gap-1"
                      >
                        <BackArrow size={14} />
                        {t.accounting.bookingForm.back}
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
                          isEdit ? t.accounting.bookingForm.saveEdit : t.accounting.bookingForm.saveBooking
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

export default BookingForm;
