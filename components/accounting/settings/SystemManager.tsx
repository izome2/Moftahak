'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertTriangle,
  RotateCcw,
  Shield,
  CheckCircle2,
  XCircle,
  Loader2,
  Clock,
  Database,
  Trash2,
  Archive,
  ExternalLink,
  History,
} from 'lucide-react';

type ActionState = 'idle' | 'loading' | 'success' | 'error';
type ModalStep = 'none' | 'ask-backup' | 'name-backup' | 'confirm-reset' | 'open-backup' | 'delete-backup';

interface BackupEntry {
  id: string;
  name: string;
  stats: Record<string, number>;
  createdByName: string;
  createdAt: string;
}

export default function SystemManager() {
  const [resetState, setResetState] = useState<ActionState>('idle');
  const [backupState, setBackupState] = useState<ActionState>('idle');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [modalStep, setModalStep] = useState<ModalStep>('none');
  const [backupName, setBackupName] = useState('');
  const [backups, setBackups] = useState<BackupEntry[]>([]);
  const [loadingBackups, setLoadingBackups] = useState(true);
  const [selectedBackup, setSelectedBackup] = useState<BackupEntry | null>(null);

  // ═══════════════════════════════════════
  // جلب قائمة النسخ الاحتياطية
  // ═══════════════════════════════════════
  useEffect(() => {
    fetchBackups();
  }, []);

  const fetchBackups = async () => {
    try {
      setLoadingBackups(true);
      const res = await fetch('/api/accounting/system/backups');
      if (res.ok) {
        const data = await res.json();
        setBackups(data.backups || []);
      }
    } catch {
      // Silent fail
    } finally {
      setLoadingBackups(false);
    }
  };

  const showMessage = (msg: string, type: 'success' | 'error') => {
    setMessage(msg);
    setMessageType(type);
    setTimeout(() => setMessage(''), 6000);
  };

  // ═══════════════════════════════════════
  // النقر على زر إعادة التعيين
  // ═══════════════════════════════════════
  const handleResetClick = () => {
    setModalStep('ask-backup');
  };

  // ═══════════════════════════════════════
  // إنشاء نسخة احتياطية
  // ═══════════════════════════════════════
  const handleCreateBackup = async () => {
    if (!backupName.trim()) return;
    setBackupState('loading');

    try {
      const res = await fetch('/api/accounting/system/backups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: backupName.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في إنشاء النسخة الاحتياطية');

      setBackupState('idle');
      setBackupName('');
      await fetchBackups();

      // Now proceed to reset confirmation
      setModalStep('confirm-reset');
    } catch (e: any) {
      setBackupState('idle');
      showMessage(e.message, 'error');
      setModalStep('none');
    }
  };

  // ═══════════════════════════════════════
  // تصفية النظام
  // ═══════════════════════════════════════
  const handleReset = async () => {
    setResetState('loading');
    setModalStep('none');

    try {
      const res = await fetch('/api/accounting/system/reset', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ confirmText: 'تأكيد التصفية', keepUsers: true }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في التصفية');

      setResetState('success');
      showMessage('تمت تصفية النظام بالكامل بنجاح', 'success');
      setTimeout(() => setResetState('idle'), 5000);
    } catch (e: any) {
      setResetState('error');
      showMessage(e.message, 'error');
      setTimeout(() => setResetState('idle'), 5000);
    }
  };

  // ═══════════════════════════════════════
  // فتح نسخة احتياطية في تبويب جديد
  // ═══════════════════════════════════════
  const handleOpenBackup = (backup: BackupEntry) => {
    setSelectedBackup(backup);
    setModalStep('open-backup');
  };

  const confirmOpenBackup = () => {
    if (selectedBackup) {
      window.open(`/accounting/backup/${selectedBackup.id}`, '_blank');
    }
    setModalStep('none');
    setSelectedBackup(null);
  };

  // ═══════════════════════════════════════
  // حذف نسخة احتياطية
  // ═══════════════════════════════════════
  const handleDeleteBackup = (backup: BackupEntry) => {
    setSelectedBackup(backup);
    setModalStep('delete-backup');
  };

  const confirmDeleteBackup = async () => {
    if (!selectedBackup) return;
    try {
      const res = await fetch(`/api/accounting/system/backups/${selectedBackup.id}`, {
        method: 'DELETE',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'فشل في الحذف');

      showMessage(`تم حذف "${selectedBackup.name}"`, 'success');
      await fetchBackups();
    } catch (e: any) {
      showMessage(e.message, 'error');
    } finally {
      setModalStep('none');
      setSelectedBackup(null);
    }
  };

  // ═══════════════════════════════════════
  // العرض
  // ═══════════════════════════════════════
  return (
    <div className="space-y-6 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-2 text-secondary">
        <Database className="w-5 h-5 text-primary" />
        <h2 className="text-lg font-bold font-dubai">إدارة النظام</h2>
      </div>
      <p className="text-sm text-secondary/60 font-dubai -mt-3">
        إعادة تعيين النظام وإدارة النسخ الاحتياطية
      </p>

      {/* Message Banner */}
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: -10, height: 0 }}
            animate={{ opacity: 1, y: 0, height: 'auto' }}
            exit={{ opacity: 0, y: -10, height: 0 }}
            className={`px-4 py-3 rounded-xl text-sm font-dubai flex items-center gap-2 ${
              messageType === 'success'
                ? 'bg-green-50 border border-green-200 text-green-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {messageType === 'success'
              ? <CheckCircle2 className="w-4 h-4 shrink-0" />
              : <XCircle className="w-4 h-4 shrink-0" />
            }
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reset Button */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="border-2 border-rose-200/60 rounded-2xl p-5 space-y-4 hover:border-rose-200 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/60">
            <RotateCcw className="w-5 h-5 text-rose-400" />
          </div>
          <div>
            <h3 className="font-bold text-secondary font-dubai">إعادة تعيين النظام</h3>
            <p className="text-xs text-secondary/50 font-dubai">حذف كل بيانات المحاسبة والبدء من جديد</p>
          </div>
        </div>
        <p className="text-xs text-secondary/60 font-dubai leading-relaxed">
          سيتم حذف جميع المشاريع، الشقق، الحجوزات، المصروفات، المستثمرين، وسجل المراجعة.
          سيُعرض عليك حفظ نسخة احتياطية قبل التصفية.
        </p>
        <button
          onClick={handleResetClick}
          disabled={resetState === 'loading'}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-dubai font-bold text-sm
            bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resetState === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> جاري التصفية...</>
          ) : (
            <><RotateCcw className="w-4 h-4" /> إعادة تعيين النظام</>
          )}
        </button>
      </motion.div>

      {/* Backup History */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="border-2 border-primary/20 rounded-2xl p-5 space-y-4"
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
              <History className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h3 className="font-bold text-secondary font-dubai">سجل النسخ الاحتياطية</h3>
              <p className="text-xs text-secondary/50 font-dubai">
                {backups.length > 0 ? `${backups.length} نسخة محفوظة` : 'لا توجد نسخ احتياطية'}
              </p>
            </div>
          </div>
        </div>

        {loadingBackups ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-5 h-5 animate-spin text-primary" />
          </div>
        ) : backups.length === 0 ? (
          <div className="text-center py-8">
            <Archive className="w-10 h-10 text-secondary/20 mx-auto mb-2" />
            <p className="text-sm text-secondary/40 font-dubai">لا توجد نسخ احتياطية محفوظة</p>
          </div>
        ) : (
          <div className="space-y-2">
            {backups.map((backup, i) => (
              <motion.div
                key={backup.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.03 }}
                className="group bg-primary/5 rounded-xl px-4 py-3 flex items-center justify-between hover:bg-primary/10 transition-colors"
              >
                <button
                  onClick={() => handleOpenBackup(backup)}
                  className="flex items-center gap-3 flex-1 text-right"
                >
                  <div className="p-1.5 rounded-lg bg-white border border-primary/20">
                    <Database className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-secondary font-dubai">{backup.name}</p>
                    <div className="flex items-center gap-2 text-[11px] text-secondary/40 font-dubai">
                      <span className="flex items-center gap-1">
                        <Clock className="w-2.5 h-2.5" />
                        {new Date(backup.createdAt).toLocaleDateString('ar-EG', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {backup.stats && (
                        <span className="text-secondary/30">
                          • {backup.stats.bookings || 0} حجز
                          • {backup.stats.expenses || 0} مصروف
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenBackup(backup); }}
                    className="p-1.5 hover:bg-white rounded-lg transition text-secondary/40 hover:text-primary"
                    title="فتح"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteBackup(backup); }}
                    className="p-1.5 hover:bg-rose-50 rounded-lg transition text-secondary/40 hover:text-rose-400"
                    title="حذف"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </motion.div>

      {/* ═══════════════════════════════════════
          Modal: هل تريد إنشاء نسخة احتياطية؟
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {modalStep === 'ask-backup' && (
          <ModalOverlay onClose={() => setModalStep('none')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">نسخة احتياطية</h3>
            </div>
            <p className="text-sm text-secondary/70 font-dubai mb-5">
              أنت على وشك تصفية النظام بالكامل. هل تريد إنشاء نسخة احتياطية قبل المتابعة؟
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBackupName('');
                  setModalStep('name-backup');
                }}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary text-white hover:bg-secondary/90 transition-colors"
              >
                نعم، أنشئ نسخة
              </button>
              <button
                onClick={() => setModalStep('confirm-reset')}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-colors"
              >
                لا، تابع التصفية
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          Modal: تسمية النسخة الاحتياطية
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {modalStep === 'name-backup' && (
          <ModalOverlay onClose={() => setModalStep('none')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
                <Archive className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">تسمية النسخة الاحتياطية</h3>
            </div>
            <p className="text-sm text-secondary/60 font-dubai mb-3">
              أدخل اسماً مميزاً للنسخة الاحتياطية حتى تتمكن من التعرف عليها لاحقاً.
            </p>
            <input
              type="text"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder="مثال: نسخة قبل بداية 2026"
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/20 text-sm text-secondary font-dubai
                focus:border-primary focus:outline-none transition-colors"
              dir="rtl"
              onKeyDown={(e) => e.key === 'Enter' && backupName.trim() && handleCreateBackup()}
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={handleCreateBackup}
                disabled={!backupName.trim() || backupState === 'loading'}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary text-white
                  hover:bg-secondary/90 disabled:opacity-30 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                {backupState === 'loading' ? (
                  <><Loader2 className="w-4 h-4 animate-spin" /> جاري الحفظ...</>
                ) : (
                  'حفظ ومتابعة'
                )}
              </button>
              <button
                onClick={() => setModalStep('none')}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          Modal: تأكيد التصفية
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {modalStep === 'confirm-reset' && (
          <ModalOverlay onClose={() => setModalStep('none')}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/60">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">تأكيد التصفية</h3>
            </div>
            <p className="text-sm text-secondary/70 font-dubai mb-2">
              ⛔ سيتم حذف <span className="text-rose-600 font-bold">جميع</span> بيانات المحاسبة نهائياً.
            </p>
            <p className="text-xs text-rose-600 font-dubai bg-rose-50/80 border border-rose-200/60 rounded-lg p-3 mb-4">
              تشمل: المشاريع، الشقق، الحجوزات، المصروفات، المستثمرين، المسحوبات، وسجل المراجعة.
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-200/80 transition-colors"
              >
                نعم، صفّ النظام
              </button>
              <button
                onClick={() => setModalStep('none')}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          Modal: فتح نسخة احتياطية
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {modalStep === 'open-backup' && selectedBackup && (
          <ModalOverlay onClose={() => { setModalStep('none'); setSelectedBackup(null); }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">فتح النسخة الاحتياطية</h3>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 mb-4 space-y-2">
              <p className="text-sm font-bold text-secondary font-dubai">{selectedBackup.name}</p>
              <p className="text-xs text-secondary/50 font-dubai flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(selectedBackup.createdAt).toLocaleDateString('ar-EG', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </p>
              {selectedBackup.stats && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {Object.entries(selectedBackup.stats).filter(([, v]) => (v as number) > 0).map(([k, v]) => (
                    <span key={k} className="text-[10px] bg-white rounded-md px-2 py-0.5 text-secondary/60 font-dubai border border-primary/15">
                      {translateKey(k)}: {v as number}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-secondary/50 font-dubai mb-4">
              سيتم فتح النسخة في تبويب جديد للقراءة فقط — لن تتأثر البيانات الحالية.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmOpenBackup}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary text-white hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                فتح في تبويب جديد
              </button>
              <button
                onClick={() => { setModalStep('none'); setSelectedBackup(null); }}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>

      {/* ═══════════════════════════════════════
          Modal: تأكيد حذف النسخة
          ═══════════════════════════════════════ */}
      <AnimatePresence>
        {modalStep === 'delete-backup' && selectedBackup && (
          <ModalOverlay onClose={() => { setModalStep('none'); setSelectedBackup(null); }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/60">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">حذف النسخة الاحتياطية</h3>
            </div>
            <p className="text-sm text-secondary/70 font-dubai mb-4">
              هل أنت متأكد من حذف النسخة الاحتياطية <span className="font-bold text-secondary">&quot;{selectedBackup.name}&quot;</span>؟
              لا يمكن التراجع عن هذا الإجراء.
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDeleteBackup}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-200/80 transition-colors"
              >
                نعم، احذف
              </button>
              <button
                onClick={() => { setModalStep('none'); setSelectedBackup(null); }}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                إلغاء
              </button>
            </div>
          </ModalOverlay>
        )}
      </AnimatePresence>
    </div>
  );
}

// ═══════════════════════════════════════
// Modal Overlay Component
// ═══════════════════════════════════════
function ModalOverlay({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl p-6 w-full max-w-sm shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] border-2 border-[#e0cdb8] space-y-0"
        dir="rtl"
      >
        {children}
      </motion.div>
    </motion.div>
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
    snapshots: 'اللقطات',
    auditLogs: 'سجل المراجعة',
  };
  return map[key] || key;
}
