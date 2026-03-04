'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CalendarCheck, Loader2, Calendar, Phone, User, CreditCard, Clock, FileText, Building2 } from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';

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
}

const SOURCE_OPTIONS = [
  { value: 'AIRBNB', label: 'Airbnb', color: '#FF5A5F' },
  { value: 'BOOKING_COM', label: 'Booking.com', color: '#003B95' },
  { value: 'EXTERNAL', label: 'خارجي', color: '#10302b' },
  { value: 'DIRECT', label: 'مباشر', color: '#edbf8c' },
  { value: 'OTHER', label: 'أخرى', color: '#6b7280' },
];

const STATUS_OPTIONS = [
  { value: 'CONFIRMED', label: 'مؤكد' },
  { value: 'CHECKED_IN', label: 'دخل' },
  { value: 'CHECKED_OUT', label: 'خرج' },
  { value: 'CANCELLED', label: 'ملغي' },
];

const calcNights = (checkIn: string, checkOut: string): number => {
  if (!checkIn || !checkOut) return 0;
  const diff = new Date(checkOut).getTime() - new Date(checkIn).getTime();
  return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
};

const BookingForm: React.FC<BookingFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  apartments,
}) => {
  const isEdit = !!initialData?.id;

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
      // Auto-set checkOut to checkIn + 1 day when checkIn changes (new booking only)
      if (field === 'checkIn' && typeof value === 'string' && value && !isEdit) {
        const d = new Date(value);
        d.setDate(d.getDate() + 1);
        next.checkOut = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      }
      return next;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.apartmentId) { setError('يجب اختيار الشقة'); return; }
    if (!formData.clientName.trim()) { setError('اسم العميل مطلوب'); return; }
    if (!formData.checkIn) { setError('تاريخ الدخول مطلوب'); return; }
    if (!formData.checkOut) { setError('تاريخ الخروج مطلوب'); return; }
    if (computedNights < 1) { setError('تاريخ الخروج يجب أن يكون بعد تاريخ الدخول'); return; }
    if (formData.amount <= 0) { setError('القيمة المالية يجب أن تكون أكبر من 0'); return; }

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
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Group apartments by project
  const grouped = useMemo(() => {
    const map = new Map<string, Apartment[]>();
    for (const apt of apartments) {
      const key = apt.project?.name || 'بدون مشروع';
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(apt);
    }
    return map;
  }, [apartments]);

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
            className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg border-2 border-primary/20 overflow-hidden max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/10 shrink-0">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-primary/10 border-2 border-primary/30 flex items-center justify-center">
                  <CalendarCheck size={16} className="text-primary" />
                </div>
                <h2 className="text-lg font-bold text-secondary font-dubai">
                  {isEdit ? 'تعديل الحجز' : 'إضافة حجز جديد'}
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
                  الشقة <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={formData.apartmentId}
                  onChange={(v) => update('apartmentId', v)}
                  className="w-full"
                  placeholder="اختر الشقة"
                  required
                  options={Array.from(grouped.entries()).map(([project, apts]) => ({
                    label: project,
                    options: apts.map(a => ({ value: a.id, label: a.name })),
                  }))}
                />
              </div>

              {/* Client Name + Phone */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <User size={14} className="text-secondary/50" />
                    اسم العميل <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.clientName}
                    onChange={(e) => update('clientName', e.target.value)}
                    placeholder="اسم الضيف"
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <Phone size={14} className="text-secondary/50" />
                    رقم التواصل
                  </label>
                  <input
                    type="text"
                    value={formData.clientPhone || ''}
                    onChange={(e) => update('clientPhone', e.target.value)}
                    placeholder="+20 xxx xxx xxxx"
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30 ltr text-left"
                    dir="ltr"
                  />
                </div>
              </div>

              {/* Source */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                  <CreditCard size={14} className="text-secondary/50" />
                  مصدر الحجز <span className="text-red-500">*</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  {SOURCE_OPTIONS.map(src => (
                    <button
                      key={src.value}
                      type="button"
                      onClick={() => update('source', src.value)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-dubai font-bold transition-all border-2 ${
                        formData.source === src.value
                          ? 'border-current shadow-sm scale-105'
                          : 'border-transparent bg-primary/5 text-secondary/50 hover:bg-primary/10'
                      }`}
                      style={
                        formData.source === src.value
                          ? { backgroundColor: `${src.color}15`, color: src.color, borderColor: `${src.color}40` }
                          : undefined
                      }
                    >
                      {src.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Check-in / Check-out dates */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <Calendar size={14} className="text-[#8a9a7a]" />
                    تاريخ الدخول <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.checkIn}
                    onChange={(e) => update('checkIn', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <Calendar size={14} className="text-[#c09080]" />
                    تاريخ الخروج <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={formData.checkOut}
                    onChange={(e) => update('checkOut', e.target.value)}
                    min={formData.checkIn || undefined}
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors"
                    required
                  />
                </div>
              </div>

              {/* Nights (auto) + Amount */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-sm font-bold text-secondary font-dubai mb-1.5 block">
                    عدد الليالي
                  </label>
                  <div className="p-3 rounded-xl border-2 border-primary/10 bg-primary/5 text-secondary font-dubai text-sm font-bold text-center">
                    {computedNights > 0 ? (
                      <span className="text-primary">{computedNights} ليلة</span>
                    ) : (
                      <span className="text-secondary/30">محسوب تلقائياً</span>
                    )}
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <CreditCard size={14} className="text-[#8a9a7a]" />
                    القيمة المالية <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    value={formData.amount || ''}
                    onChange={(e) => update('amount', parseFloat(e.target.value) || 0)}
                    placeholder="0"
                    min="0"
                    step="0.01"
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30 ltr text-left"
                    dir="ltr"
                    required
                  />
                </div>
              </div>

              {/* Arrival Time + Status (edit only) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                    <Clock size={14} className="text-secondary/50" />
                    وقت الوصول
                  </label>
                  <input
                    type="time"
                    value={formData.arrivalTime || ''}
                    onChange={(e) => update('arrivalTime', e.target.value)}
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors"
                  />
                </div>
                {isEdit && (
                  <div>
                    <label className="text-sm font-bold text-secondary font-dubai mb-1.5 block">
                      الحالة
                    </label>
                    <CustomSelect
                      value={formData.status || 'CONFIRMED'}
                      onChange={(v) => update('status', v)}
                      className="w-full"
                      options={STATUS_OPTIONS.map(s => ({ value: s.value, label: s.label }))}
                    />
                  </div>
                )}
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-secondary font-dubai mb-1.5">
                  <FileText size={14} className="text-secondary/50" />
                  ملاحظات
                </label>
                <textarea
                  value={formData.notes || ''}
                  onChange={(e) => update('notes', e.target.value)}
                  placeholder="ملاحظات إضافية..."
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
                  إلغاء
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 p-3 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      جاري الحفظ...
                    </>
                  ) : (
                    isEdit ? 'حفظ التعديلات' : 'حفظ الحجز'
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

export default BookingForm;
