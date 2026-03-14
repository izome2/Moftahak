'use client';

import React, { createContext, useContext, useState, useCallback, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCircle2, XCircle, AlertTriangle, Info, X } from 'lucide-react';
import { useLanguage } from '@/contexts/LanguageContext';

// ============================================================================
// Toast Types
// ============================================================================
type ToastType = 'success' | 'error' | 'warning' | 'info';

interface Toast {
  id: string;
  type: ToastType;
  message: string;
  duration?: number;
}

interface ToastContextValue {
  showToast: (type: ToastType, message: string, duration?: number) => void;
  success: (message: string) => void;
  error: (message: string) => void;
  warning: (message: string) => void;
  info: (message: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

// ============================================================================
// Toast Config
// ============================================================================
const TOAST_CONFIG: Record<ToastType, {
  icon: React.ElementType;
  bg: string;
  border: string;
  iconColor: string;
}> = {
  success: {
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    border: 'border-emerald-300',
    iconColor: 'text-emerald-600',
  },
  error: {
    icon: XCircle,
    bg: 'bg-red-50',
    border: 'border-red-300',
    iconColor: 'text-red-600',
  },
  warning: {
    icon: AlertTriangle,
    bg: 'bg-amber-50',
    border: 'border-amber-300',
    iconColor: 'text-amber-600',
  },
  info: {
    icon: Info,
    bg: 'bg-blue-50',
    border: 'border-blue-300',
    iconColor: 'text-blue-600',
  },
};

// ============================================================================
// Toast Provider
// ============================================================================
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());
  const { language } = useLanguage();

  const removeToast = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const showToast = useCallback(
    (type: ToastType, message: string, duration = 4000) => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
      const toast: Toast = { id, type, message, duration };

      setToasts((prev) => [...prev.slice(-4), toast]); // max 5 toasts

      const timer = setTimeout(() => removeToast(id), duration);
      timersRef.current.set(id, timer);
    },
    [removeToast],
  );

  const success = useCallback((msg: string) => showToast('success', msg), [showToast]);
  const error = useCallback((msg: string) => showToast('error', msg, 6000), [showToast]);
  const warning = useCallback((msg: string) => showToast('warning', msg, 5000), [showToast]);
  const info = useCallback((msg: string) => showToast('info', msg), [showToast]);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      timersRef.current.forEach((timer) => clearTimeout(timer));
    };
  }, []);

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}

      {/* Toast Container - يظهر حسب اتجاه اللغة */}
      <div className={`fixed top-4 z-[200] flex flex-col gap-2 max-w-sm w-full pointer-events-none ${language === 'ar' ? 'right-4' : 'left-4'}`}>
        <AnimatePresence mode="popLayout">
          {toasts.map((toast) => {
            const config = TOAST_CONFIG[toast.type];
            const Icon = config.icon;
            const slideX = language === 'ar' ? 80 : -80;

            return (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: slideX, scale: 0.9 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: slideX, scale: 0.9 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className={`pointer-events-auto flex items-start gap-3 p-3.5 rounded-xl border ${config.bg} ${config.border} shadow-lg`}
              >
                <Icon className={`w-5 h-5 mt-0.5 flex-shrink-0 ${config.iconColor}`} />
                <p className="flex-1 text-sm font-dubai text-secondary leading-relaxed">
                  {toast.message}
                </p>
                <button
                  onClick={() => removeToast(toast.id)}
                  className="flex-shrink-0 p-0.5 rounded-md hover:bg-black/5 transition-colors"
                >
                  <X className="w-4 h-4 text-secondary/40" />
                </button>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
}

// ============================================================================
// Hook
// ============================================================================
export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast must be used within a <ToastProvider>');
  }
  return ctx;
}
