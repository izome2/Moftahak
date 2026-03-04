'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  Download,
  Upload,
  RotateCcw,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  FileJson,
  Clock,
  Database,
  Users,
  Trash2,
} from 'lucide-react';

type ActionState = 'idle' | 'loading' | 'success' | 'error';

export default function SystemManager() {
  const [backupState, setBackupState] = useState<ActionState>('idle');
  const [restoreState, setRestoreState] = useState<ActionState>('idle');
  const [resetState, setResetState] = useState<ActionState>('idle');
  const [message, setMessage] = useState('');
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showRestoreConfirm, setShowRestoreConfirm] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [keepUsers, setKeepUsers] = useState(true);
  const [restoreFile, setRestoreFile] = useState<File | null>(null);
  const [restorePreview, setRestorePreview] = useState<any>(null);
  const [deletedStats, setDeletedStats] = useState<Record<string, number> | null>(null);
  const [restoredStats, setRestoredStats] = useState<Record<string, number> | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ═══════════════════════════════════════
  // 📥 نسخة احتياطية
  // ═══════════════════════════════════════
  const handleBackup = async () => {
    setBackupState('loading');
    setMessage('');
    try {
      const res = await fetch('/api/accounting/system/backup');
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || 'فشل في إنشاء النسخة الاحتياطية');
      }
      const data = await res.json();

      // Download as JSON file
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `moftahak-backup-${new Date().toISOString().slice(0, 10)}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setBackupState('success');
      setMessage(`تم تحميل النسخة الاحتياطية — ${data.stats?.bookings || 0} حجز، ${data.stats?.expenses || 0} مصروف`);
      setTimeout(() => { setBackupState('idle'); setMessage(''); }, 5000);
    } catch (e: any) {
      setBackupState('error');
      setMessage(e.message);
      setTimeout(() => { setBackupState('idle'); setMessage(''); }, 5000);
    }
  };

  // ═══════════════════════════════════════
  // 📤 استعادة
  // ═══════════════════════════════════════
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);

      if (data.system !== 'moftahak-accounting' || !data.version || !data.data) {
        setMessage('ملف غير صالح — يجب أن يكون ملف نسخة احتياطية من النظام');
        setRestoreState('error');
        setTimeout(() => { setRestoreState('idle'); setMessage(''); }, 5000);
        return;
      }

      setRestoreFile(file);
      setRestorePreview(data);
      setShowRestoreConfirm(true);
    } catch {
      setMessage('ملف تالف — لا يمكن قراءة JSON');
      setRestoreState('error');
      setTimeout(() => { setRestoreState('idle'); setMessage(''); }, 5000);
    }
  };

  const handleRestore = async () => {
    if (!restorePreview) return;
    setRestoreState('loading');
    setShowRestoreConfirm(false);
    setMessage('');

    try {
      const res = await fetch('/api/accounting/system/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(restorePreview),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في الاستعادة');

      setRestoreState('success');
      setRestoredStats(data.restored);
      setMessage('تمت الاستعادة بنجاح');
      setRestoreFile(null);
      setRestorePreview(null);
      setTimeout(() => { setRestoreState('idle'); setMessage(''); setRestoredStats(null); }, 8000);
    } catch (e: any) {
      setRestoreState('error');
      setMessage(e.message);
      setTimeout(() => { setRestoreState('idle'); setMessage(''); }, 5000);
    }
  };

  // ═══════════════════════════════════════
  // 🗑️ تصفية
  // ═══════════════════════════════════════
  const handleReset = async () => {
    if (confirmText !== 'تأكيد التصفية') return;
    setResetState('loading');
    setShowResetConfirm(false);
    setMessage('');

    try {
      const res = await fetch('/api/accounting/system/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText: 'تأكيد التصفية', keepUsers }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في التصفية');

      setResetState('success');
      setDeletedStats(data.deleted);
      setMessage('تمت تصفية النظام بالكامل');
      setConfirmText('');
      setTimeout(() => { setResetState('idle'); setMessage(''); setDeletedStats(null); }, 8000);
    } catch (e: any) {
      setResetState('error');
      setMessage(e.message);
      setConfirmText('');
      setTimeout(() => { setResetState('idle'); setMessage(''); }, 5000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-2 text-secondary">
        <Database className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold font-dubai">إدارة النظام</h2>
      </div>
      <p className="text-sm text-secondary/60 font-dubai -mt-3">
        نسخ احتياطي، استعادة، وإعادة تعيين نظام المحاسبة
      </p>

      {/* Message Banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={`px-4 py-3 rounded-xl text-sm font-dubai flex items-center gap-2 ${
              backupState === 'success' || restoreState === 'success' || resetState === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {(backupState === 'success' || restoreState === 'success' || resetState === 'success')
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <XCircle className="w-4 h-4 shrink-0" />
            }
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">

        {/* 📥 Backup Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="border-2 border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-blue-50 border border-blue-200">
              <Download className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="font-bold text-secondary font-dubai">نسخة احتياطية</h3>
              <p className="text-xs text-secondary/50 font-dubai">تحميل كل البيانات كملف JSON</p>
            </div>
          </div>
          <p className="text-xs text-secondary/60 font-dubai leading-relaxed">
            يتم تصدير جميع المشاريع، الشقق، الحجوزات، المصروفات، المستثمرين، المسحوبات، سجل المراجعة، وإعدادات النظام في ملف واحد.
          </p>
          <button
            onClick={handleBackup}
            disabled={backupState === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-dubai font-bold text-sm
              bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {backupState === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> جاري التحميل...</>
            ) : (
              <><Download className="w-4 h-4" /> تحميل نسخة احتياطية</>
            )}
          </button>
        </motion.div>

        {/* 📤 Restore Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="border-2 border-primary/20 rounded-2xl p-5 space-y-4 hover:border-primary/40 transition-colors"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
              <Upload className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="font-bold text-secondary font-dubai">استعادة نسخة</h3>
              <p className="text-xs text-secondary/50 font-dubai">رفع ملف JSON لاستعادة البيانات</p>
            </div>
          </div>
          <p className="text-xs text-secondary/60 font-dubai leading-relaxed">
            ⚠️ سيتم حذف جميع البيانات الحالية واستبدالها بالنسخة المرفوعة. يُنصح بأخذ نسخة احتياطية أولاً.
          </p>
          <input
            ref={fileInputRef}
            type="file"
            accept=".json"
            onChange={handleFileSelect}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={restoreState === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-dubai font-bold text-sm
              bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {restoreState === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> جاري الاستعادة...</>
            ) : (
              <><Upload className="w-4 h-4" /> رفع نسخة احتياطية</>
            )}
          </button>

          {/* Restored Stats */}
          {restoredStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-green-700 bg-green-50 rounded-lg p-3 space-y-1"
            >
              <p className="font-bold">تم الاستعادة:</p>
              {Object.entries(restoredStats).filter(([, v]) => v > 0).map(([k, v]) => (
                <p key={k} className="font-dubai">• {translateKey(k)}: {v}</p>
              ))}
            </motion.div>
          )}
        </motion.div>

        {/* 🗑️ Reset Card */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="border-2 border-red-200 rounded-2xl p-5 space-y-4 hover:border-red-300 transition-colors sm:col-span-2 lg:col-span-1"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
              <Trash2 className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <h3 className="font-bold text-red-700 font-dubai">تصفية النظام</h3>
              <p className="text-xs text-red-400 font-dubai">حذف كل بيانات المحاسبة</p>
            </div>
          </div>
          <p className="text-xs text-secondary/60 font-dubai leading-relaxed">
            ⛔ عملية لا رجعة فيها! يتم حذف جميع المشاريع، الشقق، الحجوزات، المصروفات، المستثمرين، وسجل المراجعة. يمكن الاحتفاظ بأعضاء الفريق.
          </p>
          <button
            onClick={() => { setShowResetConfirm(true); setConfirmText(''); }}
            disabled={resetState === 'loading'}
            className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl font-dubai font-bold text-sm
              bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {resetState === 'loading' ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> جاري التصفية...</>
            ) : (
              <><RotateCcw className="w-4 h-4" /> تصفية المشروع</>
            )}
          </button>

          {/* Deleted Stats */}
          {deletedStats && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-xs text-red-700 bg-red-50 rounded-lg p-3 space-y-1"
            >
              <p className="font-bold">تم الحذف:</p>
              {Object.entries(deletedStats).filter(([, v]) => v > 0).map(([k, v]) => (
                <p key={k} className="font-dubai">• {translateKey(k)}: {v}</p>
              ))}
            </motion.div>
          )}
        </motion.div>
      </div>

      {/* ═══════════════════════════════════════
          Restore Confirmation Modal
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showRestoreConfirm && restorePreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowRestoreConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border-2 border-amber-200 space-y-4"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                  <AlertTriangle className="w-5 h-5 text-amber-600" />
                </div>
                <h3 className="font-bold text-lg text-secondary font-dubai">تأكيد الاستعادة</h3>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs space-y-2">
                <div className="flex items-center gap-2 text-amber-700">
                  <FileJson className="w-4 h-4" />
                  <span className="font-bold font-dubai">{restoreFile?.name}</span>
                </div>
                <div className="flex items-center gap-2 text-amber-600">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="font-dubai">{new Date(restorePreview.createdAt).toLocaleDateString('ar-EG', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="text-secondary/70 font-dubai pt-1 space-y-0.5">
                  {Object.entries(restorePreview.stats || {}).filter(([, v]) => (v as number) > 0).map(([k, v]) => (
                    <p key={k}>• {translateKey(k)}: {v as number}</p>
                  ))}
                </div>
              </div>

              <p className="text-xs text-red-600 font-dubai bg-red-50 border border-red-200 rounded-lg p-3">
                ⚠️ سيتم حذف جميع البيانات الحالية واستبدالها ببيانات هذه النسخة. هل أنت متأكد؟
              </p>

              <div className="flex gap-2">
                <button
                  onClick={handleRestore}
                  className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-amber-600 text-white hover:bg-amber-700 transition-colors"
                >
                  تأكيد الاستعادة
                </button>
                <button
                  onClick={() => { setShowRestoreConfirm(false); setRestoreFile(null); setRestorePreview(null); }}
                  className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          Reset Confirmation Modal
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {showResetConfirm && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
            onClick={() => setShowResetConfirm(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl border-2 border-red-200 space-y-5"
              dir="rtl"
            >
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <Shield className="w-5 h-5 text-red-600" />
                </div>
                <h3 className="font-bold text-lg text-red-700 font-dubai">تأكيد التصفية الكاملة</h3>
              </div>

              <p className="text-sm text-secondary/70 font-dubai">
                ⛔ هذا الإجراء سيحذف <span className="text-red-600 font-bold">جميع</span> بيانات المحاسبة بدون رجعة.
                يُنصح بشدة بتحميل نسخة احتياطية قبل المتابعة.
              </p>

              {/* Keep Users Toggle */}
              <label className="flex items-center gap-3 cursor-pointer bg-secondary/5 rounded-xl p-3">
                <input
                  type="checkbox"
                  checked={keepUsers}
                  onChange={(e) => setKeepUsers(e.target.checked)}
                  className="w-4 h-4 rounded accent-secondary"
                />
                <div>
                  <span className="text-sm font-bold text-secondary font-dubai flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    الاحتفاظ بأعضاء الفريق
                  </span>
                  <span className="text-xs text-secondary/50 font-dubai block mt-0.5">
                    يحافظ على حسابات المستخدمين (المدير، الحجوزات، المستثمرين)
                  </span>
                </div>
              </label>

              {/* Confirmation Input */}
              <div>
                <label className="block text-xs text-secondary/60 font-dubai mb-1.5">
                  اكتب <span className="text-red-600 font-bold">تأكيد التصفية</span> للمتابعة:
                </label>
                <input
                  type="text"
                  value={confirmText}
                  onChange={(e) => setConfirmText(e.target.value)}
                  placeholder="تأكيد التصفية"
                  className="w-full px-4 py-2.5 rounded-xl border-2 border-secondary/20 text-sm text-secondary font-dubai
                    focus:border-red-400 focus:outline-none transition-colors text-center"
                  dir="rtl"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={handleReset}
                  disabled={confirmText !== 'تأكيد التصفية'}
                  className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-red-600 text-white
                    hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  تصفية الآن
                </button>
                <button
                  onClick={() => { setShowResetConfirm(false); setConfirmText(''); }}
                  className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function translateKey(key: string): string {
  const map: Record<string, string> = {
    users: 'المستخدمين',
    projects: 'المشاريع',
    apartments: 'الشقق',
    bookings: 'الحجوزات',
    expenses: 'المصروفات',
    investors: 'المستثمرين',
    withdrawals: 'المسحوبات',
    currencyRates: 'أسعار الصرف',
    snapshots: 'اللقطات الشهرية',
    settings: 'الإعدادات',
    auditLogs: 'سجل المراجعة',
    monthlySnapshots: 'اللقطات الشهرية',
    monthlyInvestorSnapshots: 'لقطات المستثمرين',
    apartmentInvestors: 'استثمارات الشقق',
    systemSettings: 'إعدادات النظام',
  };
  return map[key] || key;
}
