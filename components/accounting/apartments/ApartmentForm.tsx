'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Loader2, FileText, Layers } from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import { useTranslation } from '@/hooks/useTranslation';

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

const inputClass = "w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/60";

const ApartmentForm: React.FC<ApartmentFormProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
  projects,
}) => {
  const t = useTranslation();
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
      setError(t.accounting.apartmentForm.nameRequired);
      return;
    }
    if (!formData.projectId) {
      setError(t.accounting.apartmentForm.projectRequired);
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
      setError(err instanceof Error ? err.message : t.accounting.errors.unexpected);
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
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-md border border-secondary/[0.08] overflow-hidden max-h-[95vh] sm:max-h-[90vh] flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                  <Building2 size={15} className="text-white" />
                </div>
                <h2 className="text-base font-bold text-secondary font-dubai tracking-tight">
                  {isEdit ? t.accounting.apartmentForm.editTitle : t.accounting.apartmentForm.addTitle}
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
              >
                <X size={18} className="text-secondary/70" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="p-5 space-y-5 overflow-y-auto">
              <FormField
                icon={<Building2 size={11} className="text-secondary/75" />}
                label={t.accounting.apartmentForm.project}
                required
              >
                <CustomSelect
                  value={formData.projectId}
                  onChange={(v) => setFormData(prev => ({ ...prev, projectId: v }))}
                  className="w-full"
                  placeholder={t.accounting.apartmentForm.selectProject}
                  required
                  emptyMessage={t.accounting.apartmentForm.noProjects}
                  options={projects.map(p => ({ value: p.id, label: p.name }))}
                />
              </FormField>

              <FormField
                icon={<FileText size={11} className="text-secondary/75" />}
                label={t.accounting.apartmentForm.apartmentName}
                required
              >
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  placeholder={t.accounting.apartmentForm.namePlaceholder}
                  className={inputClass}
                  required
                />
              </FormField>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  icon={<Layers size={11} className="text-secondary/75" />}
                  label={t.accounting.apartmentForm.floorNumber}
                >
                  <input
                    type="text"
                    value={formData.floor || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, floor: e.target.value }))}
                    placeholder={t.accounting.apartmentForm.floorPlaceholder}
                    className={inputClass}
                  />
                </FormField>
                <FormField
                  icon={<Building2 size={11} className="text-secondary/75" />}
                  label={t.accounting.apartmentForm.apartmentType}
                >
                  <input
                    type="text"
                    value={formData.type || ''}
                    onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                    placeholder={t.accounting.apartmentForm.typePlaceholder}
                    className={inputClass}
                  />
                </FormField>
              </div>

              {error && (
                <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">
                  {error}
                </p>
              )}

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
                  disabled={isSubmitting}
                  className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 size={16} className="animate-spin" />
                      {t.accounting.common.saving}
                    </>
                  ) : (
                    isEdit ? t.accounting.apartmentForm.saveEdit : t.accounting.apartmentForm.addApartment
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
