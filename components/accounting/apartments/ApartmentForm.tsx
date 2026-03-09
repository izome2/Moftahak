'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Loader2 } from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';

interface Project {
  id: string;
  name: string;
}

interface ApartmentData {
  id?: string;
  name: string;
  floor?: string;
  type?: string;
  projectId: string;
  isActive?: boolean;
}

interface ApartmentFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ApartmentData) => Promise<void>;
  initialData?: ApartmentData | null;
  projects: Project[];
}

const ApartmentForm: React.FC<ApartmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projects,
}) => {
  const isEdit = !!initialData?.id;
  const [formData, setFormData] = useState<ApartmentData>({
    name: '',
    floor: '',
    type: '',
    projectId: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        floor: initialData.floor || '',
        type: initialData.type || '',
        projectId: initialData.projectId || '',
      });
    } else {
      setFormData({ name: '', floor: '', type: '', projectId: projects[0]?.id || '' });
    }
    setError(null);
  }, [initialData, isOpen, projects]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) {
      setError('اسم الشقة مطلوب');
      return;
    }
    if (!formData.projectId) {
      setError('يجب اختيار المشروع');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);
      await onSubmit({
        ...formData,
        ...(isEdit ? { id: initialData!.id } : {}),
      });
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-md border-2 border-[#e0cdb8] overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-5 border-b border-primary/10">
              <div className="flex items-center gap-2">
                <Building2 size={20} className="text-primary" />
                <h2 className="text-lg font-bold text-secondary font-dubai">
                  {isEdit ? 'تعديل الشقة' : 'إضافة شقة جديدة'}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-primary/10 rounded-lg transition-colors"
              >
                <X size={18} className="text-secondary/60" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {/* Project */}
              <div>
                <label className="block text-sm font-bold text-secondary font-dubai mb-1.5">
                  المشروع <span className="text-red-500">*</span>
                </label>
                <CustomSelect
                  value={formData.projectId}
                  onChange={(v) => setFormData(prev => ({ ...prev, projectId: v }))}
                  className="w-full"
                  placeholder="اختر المشروع"
                  required
                  emptyMessage="لا يوجد مشاريع حتى الآن"
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                />
              </div>

              {/* Name */}
              <div>
                <label className="block text-sm font-bold text-secondary font-dubai mb-1.5">
                  اسم الشقة <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="مثال: المنيل - الدور الخامس"
                  className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                  required
                />
              </div>

              {/* Floor & Type */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-bold text-secondary font-dubai mb-1.5">
                    رقم الدور
                  </label>
                  <input
                    type="text"
                    value={formData.floor || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    placeholder="مثال: 5"
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-secondary font-dubai mb-1.5">
                    نوع الشقة
                  </label>
                  <input
                    type="text"
                    value={formData.type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    placeholder="مثال: بانوراما"
                    className="w-full p-3 rounded-xl border-2 border-primary/20 bg-accent/20 text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
                  />
                </div>
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
                    isEdit ? 'حفظ التعديلات' : 'إضافة الشقة'
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

export default ApartmentForm;
