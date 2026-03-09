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
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

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
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
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
      if (!res.ok) throw new Error(data.error || t.accounting.errors.backupCreateFailed);

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
      if (!res.ok) throw new Error(data.error || t.accounting.errors.resetFailed);

      setResetState('success');
      showMessage(t.accounting.success.systemReset, 'success');
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
      if (!res.ok) throw new Error(data.error || t.accounting.errors.deleteError);

      showMessage(t.accounting.success.deleted(selectedBackup.name), 'success');
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
        <h2 className="text-lg font-bold font-dubai">{t.accounting.settings.system.title}</h2>
      </div>
      <p className="text-sm text-secondary/60 font-dubai -mt-3">
        {t.accounting.settings.system.subtitle}
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
            <h3 className="font-bold text-secondary font-dubai">{t.accounting.settings.system.resetSystem}</h3>
            <p className="text-xs text-secondary/50 font-dubai">{t.accounting.settings.system.resetDescription}</p>
          </div>
        </div>
        <p className="text-xs text-secondary/60 font-dubai leading-relaxed">
          {t.accounting.settings.system.resetWarning}
        </p>
        <button
          onClick={handleResetClick}
          disabled={resetState === 'loading'}
          className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl font-dubai font-bold text-sm
            bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-200/80 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {resetState === 'loading' ? (
            <><Loader2 className="w-4 h-4 animate-spin" /> {t.accounting.settings.system.resetting}</>
          ) : (
            <><RotateCcw className="w-4 h-4" /> {t.accounting.settings.system.resetButton}</>
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
              <h3 className="font-bold text-secondary font-dubai">{t.accounting.settings.system.backupHistory}</h3>
              <p className="text-xs text-secondary/50 font-dubai">
                {backups.length > 0 ? `${backups.length} ${t.accounting.settings.system.savedBackup}` : t.accounting.settings.system.noBackups}
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
            <p className="text-sm text-secondary/40 font-dubai">{t.accounting.settings.system.noBackupsSaved}</p>
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
                        {new Date(backup.createdAt).toLocaleDateString(locale, {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {backup.stats && (
                        <span className="text-secondary/30">
                          • {backup.stats.bookings || 0} {t.accounting.common.booking}
                          • {backup.stats.expenses || 0} {t.accounting.common.expense}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={(e) => { e.stopPropagation(); handleOpenBackup(backup); }}
                    className="p-1.5 hover:bg-white rounded-lg transition text-secondary/40 hover:text-primary"
                    title={t.accounting.common.open}
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleDeleteBackup(backup); }}
                    className="p-1.5 hover:bg-rose-50 rounded-lg transition text-secondary/40 hover:text-rose-400"
                    title={t.accounting.common.delete}
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
          <ModalOverlay onClose={() => setModalStep('none')} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200">
                <AlertTriangle className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">{t.accounting.settings.system.backupPromptTitle}</h3>
            </div>
            <p className="text-sm text-secondary/70 font-dubai mb-5">
              {t.accounting.settings.system.backupPromptMessage}
            </p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setBackupName('');
                  setModalStep('name-backup');
                }}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary text-white hover:bg-secondary/90 transition-colors"
              >
                {t.accounting.settings.system.yesCreateBackup}
              </button>
              <button
                onClick={() => setModalStep('confirm-reset')}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-rose-50 text-rose-600 border border-rose-200/60 hover:bg-rose-100 transition-colors"
              >
                {t.accounting.settings.system.noContinue}
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
          <ModalOverlay onClose={() => setModalStep('none')} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
                <Archive className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">{t.accounting.settings.system.backupNameTitle}</h3>
            </div>
            <p className="text-sm text-secondary/60 font-dubai mb-3">
              {t.accounting.settings.system.backupNameDesc}
            </p>
            <input
              type="text"
              value={backupName}
              onChange={(e) => setBackupName(e.target.value)}
              placeholder={t.accounting.settings.system.backupNameExample}
              autoFocus
              className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/20 text-sm text-secondary font-dubai
                focus:border-primary focus:outline-none transition-colors"
              dir={language === 'ar' ? 'rtl' : 'ltr'}
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
                  <><Loader2 className="w-4 h-4 animate-spin" /> {t.accounting.settings.system.savingBackup}</>
                ) : (
                  t.accounting.settings.system.saveAndContinue
                )}
              </button>
              <button
                onClick={() => setModalStep('none')}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                {t.accounting.common.cancel}
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
          <ModalOverlay onClose={() => setModalStep('none')} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/60">
                <Shield className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">{t.accounting.settings.system.confirmResetTitle}</h3>
            </div>
            <p className="text-sm text-secondary/70 font-dubai mb-2">
              ⛔ {t.accounting.settings.system.confirmResetMessage}
            </p>
            <p className="text-xs text-rose-600 font-dubai bg-rose-50/80 border border-rose-200/60 rounded-lg p-3 mb-4">
              {t.accounting.settings.system.confirmResetIncludes}
            </p>
            <div className="flex gap-2">
              <button
                onClick={handleReset}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-200/80 transition-colors"
              >
                {t.accounting.settings.system.yesReset}
              </button>
              <button
                onClick={() => setModalStep('none')}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                {t.accounting.common.cancel}
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
          <ModalOverlay onClose={() => { setModalStep('none'); setSelectedBackup(null); }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-primary/10 border border-primary/30">
                <Database className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">{t.accounting.settings.system.openBackupTitle}</h3>
            </div>
            <div className="bg-primary/5 rounded-xl p-4 mb-4 space-y-2">
              <p className="text-sm font-bold text-secondary font-dubai">{selectedBackup.name}</p>
              <p className="text-xs text-secondary/50 font-dubai flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(selectedBackup.createdAt).toLocaleDateString(locale, {
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
                      {t.accounting.settings.system.statsLabel(k)}: {v as number}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <p className="text-xs text-secondary/50 font-dubai mb-4">
              {t.accounting.settings.system.openBackupReadOnly}
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmOpenBackup}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary text-white hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              >
                <ExternalLink className="w-4 h-4" />
                {t.accounting.settings.system.openInNewTab}
              </button>
              <button
                onClick={() => { setModalStep('none'); setSelectedBackup(null); }}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                {t.accounting.common.cancel}
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
          <ModalOverlay onClose={() => { setModalStep('none'); setSelectedBackup(null); }} dir={language === 'ar' ? 'rtl' : 'ltr'}>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2.5 rounded-xl bg-rose-50/80 border border-rose-200/60">
                <Trash2 className="w-5 h-5 text-rose-400" />
              </div>
              <h3 className="font-bold text-lg text-secondary font-dubai">{t.accounting.settings.system.deleteBackupTitle}</h3>
            </div>
            <p className="text-sm text-secondary/70 font-dubai mb-4">
              {t.accounting.settings.system.confirmDeleteBackup(selectedBackup.name)}
              {' '}{t.accounting.settings.system.cannotUndo}
            </p>
            <div className="flex gap-2">
              <button
                onClick={confirmDeleteBackup}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-rose-100 text-rose-700 border-2 border-rose-200 hover:bg-rose-200/80 transition-colors"
              >
                {t.accounting.settings.system.yesDelete}
              </button>
              <button
                onClick={() => { setModalStep('none'); setSelectedBackup(null); }}
                className="flex-1 py-2.5 rounded-xl font-dubai font-bold text-sm bg-secondary/10 text-secondary hover:bg-secondary/20 transition-colors"
              >
                {t.accounting.common.cancel}
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
function ModalOverlay({ children, onClose, dir }: { children: React.ReactNode; onClose: () => void; dir?: string }) {
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
        dir={dir}
      >
        {children}
      </motion.div>
    </motion.div>
  );
}

