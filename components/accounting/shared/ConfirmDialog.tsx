'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X } from 'lucide-react';

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
    iconBg: 'bg-red-100',
    iconColor: 'text-red-600',
    confirmBtn: 'bg-red-600 hover:bg-red-700 text-white',
  },
  warning: {
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white',
  },
  info: {
    iconBg: 'bg-blue-100',
    iconColor: 'text-blue-600',
    confirmBtn: 'bg-secondary hover:bg-secondary/90 text-white',
  },
};

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title = 'تأكيد الإجراء',
  message = 'هل أنت متأكد من هذا الإجراء؟ لا يمكن التراجع عنه.',
  confirmLabel = 'تأكيد',
  cancelLabel = 'إلغاء',
  variant = 'danger',
  isLoading = false,
}: ConfirmDialogProps) {
  const styles = VARIANT_STYLES[variant];

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
            <div className="bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] max-w-sm w-full p-6 relative border-2 border-[#e0cdb8]">
              {/* Close */}
              <button
                onClick={onClose}
                className="absolute top-3 left-3 p-1.5 rounded-lg hover:bg-secondary/5 transition-colors"
              >
                <X className="w-4 h-4 text-secondary/40" />
              </button>

              {/* Icon */}
              <div className={`w-12 h-12 rounded-2xl ${styles.iconBg} flex items-center justify-center mx-auto mb-4`}>
                <AlertTriangle className={`w-6 h-6 ${styles.iconColor}`} />
              </div>

              {/* Content */}
              <h3 className="text-lg font-bold text-secondary font-dubai text-center mb-2">
                {title}
              </h3>
              <p className="text-sm text-secondary/60 font-dubai text-center mb-6 leading-relaxed">
                {message}
              </p>

              {/* Actions */}
              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 rounded-xl border-2 border-secondary/10 text-secondary font-dubai text-sm hover:bg-secondary/5 transition-colors disabled:opacity-50"
                >
                  {cancelLabel}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 rounded-xl font-dubai text-sm transition-colors disabled:opacity-50 ${styles.confirmBtn}`}
                >
                  {isLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      جاري...
                    </span>
                  ) : (
                    confirmLabel
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
