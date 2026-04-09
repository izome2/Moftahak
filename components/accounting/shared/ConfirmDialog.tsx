'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// ConfirmDialog - نافذة تأكيد قبل الحذف / الإجراءات الحرجة
// ============================================================================

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title?: string;
  message?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  variant?: 'danger' | 'warning' | 'info';
  isLoading?: boolean;
}

const VARIANT_STYLES = {
  danger: {
    iconBg: 'bg-gradient-to-br from-secondary to-secondary/80',
    iconColor: 'text-white',
    confirmBtn: 'bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 text-white',
  },
  warning: {
    iconBg: 'bg-gradient-to-br from-secondary to-secondary/80',
    iconColor: 'text-white',
    confirmBtn: 'bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 text-white',
  },
  info: {
    iconBg: 'bg-gradient-to-br from-secondary to-secondary/80',
    iconColor: 'text-white',
    confirmBtn: 'bg-secondary hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmLabel,
  cancelLabel,
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const t = useTranslation();
  const { language } = useLanguage();
  const styles = VARIANT_STYLES[variant];
  const displayTitle = title || t.accounting.common.confirmAction;

  // Escape key handler
  React.useEffect(() => {
    if (!isOpen || isLoading) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  const displayMessage = message || t.accounting.common.confirmActionMessage;
  const displayConfirm = confirmLabel || t.accounting.common.confirm;
  const displayCancel = cancelLabel || t.accounting.common.cancel;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-[80] bg-black/40 backdrop-blur-sm"
            onClick={onClose}
          />

          {/* Dialog */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            transition={{ type: 'spring', stiffness: 400, damping: 28 }}
            className="fixed inset-0 z-[81] flex items-center justify-center p-4"
          >
            <div className="bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] max-w-sm w-full relative border border-secondary/[0.08] overflow-hidden">
              {/* Header */}
              <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-xl ${styles.iconBg} flex items-center justify-center`}>
                    <AlertTriangle size={15} className={styles.iconColor} />
                  </div>
                  <h3 className="text-base font-bold text-secondary font-dubai tracking-tight">
                    {displayTitle}
                  </h3>
                </div>
                <button
                  onClick={onClose}
                  className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"
                >
                  <X size={18} className="text-secondary/90" />
                </button>
              </div>

              <div className="p-5 space-y-4">
                {/* Content */}
                <p className="text-sm text-secondary font-dubai leading-relaxed">
                  {displayMessage}
                </p>

                {/* Actions */}
                <div className={`flex gap-3 ${language === 'ar' ? '' : 'flex-row-reverse'}`}>
                  <button
                    onClick={onConfirm}
                    disabled={isLoading}
                    className={`flex-1 py-2.5 rounded-xl font-dubai text-sm font-bold transition-all disabled:opacity-50 ${styles.confirmBtn}`}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        {t.accounting.common.processing}
                      </span>
                    ) : (
                      displayConfirm
                    )}
                  </button>
                  <button
                    onClick={onClose}
                    disabled={isLoading}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/90 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors disabled:opacity-50"
                  >
                    {displayCancel}
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
