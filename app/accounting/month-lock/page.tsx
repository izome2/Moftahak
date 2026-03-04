'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Lock,
  Unlock,
  ShieldCheck,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Building2,
} from 'lucide-react';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import { useToast } from '@/components/accounting/shared/Toast';

// ============================================================================
// Types
// ============================================================================

interface ApartmentLockStatus {
  id: string;
  name: string;
  isLocked: boolean;
  lockedAt: string | null;
  lockedById: string | null;
  profit: number;
}

// ============================================================================
// Helper
// ============================================================================

const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('ar-EG', { style: 'decimal', maximumFractionDigits: 0 }).format(amount);
};

// ============================================================================
// Component
// ============================================================================

export default function MonthLockPage() {
  const toast = useToast();
  const toastRef = React.useRef(toast);
  toastRef.current = toast;

  const [month, setMonth] = useState(getCurrentMonth());
  const [apartments, setApartments] = useState<ApartmentLockStatus[]>([]);
  const [totalLocked, setTotalLocked] = useState(0);
  const [totalUnlocked, setTotalUnlocked] = useState(0);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState<string | null>(null); // 'all' or apartmentId

  const fetchStatus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/accounting/months/status?month=${month}`);
      const json = await res.json();

      if (res.ok) {
        setApartments(json.apartments || []);
        setTotalLocked(json.totalLocked || 0);
        setTotalUnlocked(json.totalUnlocked || 0);
      } else {
        toastRef.current.error(json.error || 'فشل في تحميل حالة الشهر');
      }
    } catch {
      toastRef.current.error('حدث خطأ في الاتصال');
    } finally {
      setLoading(false);
    }
  }, [month]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  const handleLockAction = async (action: 'lock' | 'unlock', apartmentId?: string) => {
    const loadingKey = apartmentId || 'all';
    setActionLoading(loadingKey);

    try {
      const body: Record<string, string> = { month, action };
      if (apartmentId) body.apartmentId = apartmentId;

      const res = await fetch('/api/accounting/months/lock', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const json = await res.json();

      if (res.ok) {
        toastRef.current.success(json.message || (action === 'lock' ? 'تم القفل بنجاح' : 'تم فتح القفل'));
        await fetchStatus();
      } else {
        toastRef.current.error(json.error || 'فشلت العملية');
      }
    } catch {
      toastRef.current.error('حدث خطأ في الاتصال');
    } finally {
      setActionLoading(null);
    }
  };

  const formatLockDate = (dateStr: string | null) => {
    if (!dateStr) return '—';
    return new Intl.DateTimeFormat('ar-EG', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center justify-between flex-wrap gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <ShieldCheck size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary font-dubai">قفل الأشهر</h1>
            <p className="text-sm text-secondary/60 font-dubai">
              قفل الأشهر المالية لمنع التعديل وحفظ نسب المستثمرين
            </p>
          </div>
        </div>

        <button
          onClick={fetchStatus}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-primary/10 hover:bg-primary/20 text-secondary font-dubai text-sm font-bold rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          تحديث
        </button>
      </motion.div>

      {/* Month Selector + Summary */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="bg-white border-2 border-primary/20 rounded-2xl p-5 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <MonthSelector month={month} onChange={setMonth} />

          <div className="flex items-center gap-4 text-sm font-dubai">
            <div className="flex items-center gap-2 px-3 py-2 bg-green-50 rounded-xl border border-green-200">
              <Lock size={14} className="text-green-600" />
              <span className="font-bold text-green-700">{totalLocked} مقفل</span>
            </div>
            <div className="flex items-center gap-2 px-3 py-2 bg-amber-50 rounded-xl border border-amber-200">
              <Unlock size={14} className="text-amber-600" />
              <span className="font-bold text-amber-700">{totalUnlocked} مفتوح</span>
            </div>
          </div>
        </div>

        {/* Lock All Button */}
        {totalUnlocked > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 pt-4 border-t border-primary/10"
          >
            <button
              onClick={() => handleLockAction('lock')}
              disabled={actionLoading !== null}
              className="flex items-center gap-2 px-5 py-2.5 bg-secondary text-white font-dubai text-sm font-bold rounded-xl hover:bg-secondary/90 transition-colors disabled:opacity-50 shadow-md"
            >
              {actionLoading === 'all' ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Lock size={16} />
              )}
              قفل جميع الشقق لشهر {month}
            </button>
            <p className="text-xs text-secondary/40 font-dubai mt-2">
              سيتم حفظ نسب المستثمرين الحالية كلقطة تاريخية لهذا الشهر
            </p>
          </motion.div>
        )}
      </motion.div>

      {/* Apartments List */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-white border-2 border-primary/20 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
      >
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : apartments.length === 0 ? (
          <div className="text-center py-20 text-secondary/40 font-dubai">
            <Building2 size={48} className="mx-auto mb-3 opacity-30" />
            <p className="text-lg font-bold">لا توجد شقق</p>
            <p className="text-sm mt-1">أضف شقق من الإعدادات لتظهر هنا</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-primary/5 border-b-2 border-primary/10">
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">الشقة</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">الحالة</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">الربح</th>
                  <th className="text-right px-4 py-3 font-dubai font-bold text-secondary/70">تاريخ القفل</th>
                  <th className="text-center px-4 py-3 font-dubai font-bold text-secondary/70">إجراء</th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence mode="popLayout">
                  {apartments.map((apt, idx) => (
                    <motion.tr
                      key={apt.id}
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      className="border-b border-primary/5 hover:bg-primary/3 transition-colors"
                    >
                      <td className="px-4 py-3.5">
                        <div className="flex items-center gap-2">
                          <Building2 size={16} className="text-primary/60" />
                          <span className="font-dubai font-semibold text-secondary">{apt.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        {apt.isLocked ? (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-green-100 text-green-700 rounded-lg text-xs font-bold font-dubai">
                            <CheckCircle2 size={13} />
                            مقفل
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-amber-100 text-amber-700 rounded-lg text-xs font-bold font-dubai">
                            <AlertTriangle size={13} />
                            مفتوح
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3.5 font-dubai text-secondary/80 font-semibold">
                        <span className={apt.profit >= 0 ? 'text-green-600' : 'text-red-500'}>
                          {formatCurrency(apt.profit)} $
                        </span>
                      </td>
                      <td className="px-4 py-3.5 font-dubai text-secondary/50 text-xs">
                        {formatLockDate(apt.lockedAt)}
                      </td>
                      <td className="px-4 py-3.5 text-center">
                        {apt.isLocked ? (
                          <button
                            onClick={() => handleLockAction('unlock', apt.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg text-xs font-bold font-dubai transition-colors disabled:opacity-50"
                          >
                            {actionLoading === apt.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <Unlock size={13} />
                            )}
                            فتح
                          </button>
                        ) : (
                          <button
                            onClick={() => handleLockAction('lock', apt.id)}
                            disabled={actionLoading !== null}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-secondary text-white hover:bg-secondary/90 rounded-lg text-xs font-bold font-dubai transition-colors disabled:opacity-50"
                          >
                            {actionLoading === apt.id ? (
                              <RefreshCw size={13} className="animate-spin" />
                            ) : (
                              <Lock size={13} />
                            )}
                            قفل
                          </button>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* Info Note */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
        className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-sm font-dubai text-blue-800"
      >
        <p className="font-bold mb-1">⚡ ملاحظة مهمة</p>
        <ul className="space-y-1 text-xs text-blue-700 list-disc list-inside">
          <li>قفل الشهر يمنع إضافة أو تعديل أو حذف الحجوزات والمصروفات لذلك الشهر</li>
          <li>عند القفل، يتم حفظ نسب المستثمرين الحالية كلقطة تاريخية</li>
          <li>تغيير نسبة المستثمر بعد القفل لن يؤثر على حسابات الشهر المقفل</li>
          <li>فتح القفل يسمح بالتعديل لكن النسب التاريخية المحفوظة تبقى كسجل</li>
        </ul>
      </motion.div>
    </div>
  );
}
