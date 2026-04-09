'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link2,
  Plus,
  Trash2,
  Loader2,
  Copy,
  Check,
  QrCode,
  Clock,
  Shield,
  X,
  AlertCircle,
} from 'lucide-react';
import QRCode from 'qrcode';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Invitation {
  id: string;
  code: string;
  role: string;
  createdByName: string;
  expiresAt: string;
  used: boolean;
  usedAt?: string | null;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  GENERAL_MANAGER: 'bg-purple-50 text-purple-600',
  OPS_MANAGER: 'bg-blue-50 text-blue-600',
  BOOKING_MANAGER: 'bg-green-50 text-green-600',
  INVESTOR: 'bg-amber-50 text-amber-600',
};

const ACCOUNTING_ROLES = ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] as const;

const InvitationManager: React.FC = () => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';

  const ROLE_LABELS: Record<string, string> = useMemo(() => ({
    GENERAL_MANAGER: t.accounting.roles.GENERAL_MANAGER,
    OPS_MANAGER: t.accounting.roles.OPS_MANAGER,
    BOOKING_MANAGER: t.accounting.roles.BOOKING_MANAGER,
    INVESTOR: t.accounting.roles.INVESTOR,
  }), [t]);
  const [invitations, setInvitations] = useState<Invitation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create
  const [showCreate, setShowCreate] = useState(false);
  const [selectedRole, setSelectedRole] = useState<string>('BOOKING_MANAGER');
  const [isCreating, setIsCreating] = useState(false);

  // Result modal (after creating)
  const [createdInvite, setCreatedInvite] = useState<Invitation | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string>('');
  const [copied, setCopied] = useState(false);

  // QR modal for existing invite
  const [qrInvite, setQrInvite] = useState<Invitation | null>(null);
  const [qrViewDataUrl, setQrViewDataUrl] = useState<string>('');

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Invitation | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const getInviteUrl = useCallback((code: string) => {
    const base = typeof window !== 'undefined' ? window.location.origin : '';
    return `${base}/invite/${code}`;
  }, []);

  const generateQR = useCallback(async (url: string): Promise<string> => {
    try {
      return await QRCode.toDataURL(url, {
        width: 280,
        margin: 2,
        color: { dark: '#10302b', light: '#fdf6ee' },
      });
    } catch {
      return '';
    }
  }, []);

  const fetchInvitations = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/accounting/settings/invitations');
      const json = await res.json();
      if (res.ok) setInvitations(json.invitations || []);
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchInvitations(); }, [fetchInvitations]);

  const handleCreate = async () => {
    setIsCreating(true);
    setError(null);
    try {
      const res = await fetch('/api/accounting/settings/invitations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: selectedRole }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || t.accounting.errors.generic);
        return;
      }
      const invite = json.invitation as Invitation;
      setCreatedInvite(invite);
      const url = getInviteUrl(invite.code);
      const qr = await generateQR(url);
      setQrDataUrl(qr);
      setShowCreate(false);
      fetchInvitations();
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsCreating(false);
    }
  };

  const handleCopyLink = async (code: string) => {
    const url = getInviteUrl(code);
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch { /* silent */ }
  };

  const handleShowQR = async (invite: Invitation) => {
    setQrInvite(invite);
    const url = getInviteUrl(invite.code);
    const qr = await generateQR(url);
    setQrViewDataUrl(qr);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/accounting/settings/invitations/${deleteTarget.id}`, { method: 'DELETE' });
      if (res.ok) fetchInvitations();
      else setError(t.accounting.errors.generic);
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getStatus = (invite: Invitation) => {
    if (invite.used) return { label: t.accounting.settings.invitations.used, color: 'bg-red-50 text-red-600' };
    if (new Date() > new Date(invite.expiresAt)) return { label: t.accounting.settings.invitations.expired, color: 'bg-gray-100 text-gray-500' };
    return { label: t.accounting.settings.invitations.activeStatus, color: 'bg-emerald-50 text-emerald-600' };
  };

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return t.accounting.settings.invitations.expired;
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} ${t.accounting.settings.invitations.day} ${hours % 24} ${t.accounting.settings.invitations.hour}`;
    return `${hours} ${t.accounting.settings.invitations.hour}`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-secondary font-dubai flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          {t.accounting.settings.invitations.title}
        </h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold
            bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-dubai"
        >
          <Plus className="w-3 h-3" /> {t.accounting.settings.invitations.newInvitation}
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-dubai flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : invitations.length === 0 ? (
        <div className="text-center py-8">
          <Link2 className="w-8 h-8 text-secondary/20 mx-auto mb-2" />
          <p className="text-xs text-secondary/75 font-dubai">{t.accounting.settings.invitations.noInvitations}</p>
          <p className="text-[10px] text-secondary/60 font-dubai mt-1">{t.accounting.settings.invitations.createHint}</p>
        </div>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {invitations.map(invite => {
            const status = getStatus(invite);
            const isActive = !invite.used && new Date() <= new Date(invite.expiresAt);
            return (
              <motion.div
                key={invite.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className={`bg-primary/5 rounded-xl px-3 py-2.5 ${!isActive ? 'opacity-60' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`text-[9px] rounded px-1.5 py-0.5 font-bold font-dubai ${ROLE_COLORS[invite.role] || 'bg-secondary/10 text-secondary/70'}`}>
                        {ROLE_LABELS[invite.role] || invite.role}
                      </span>
                      <span className={`text-[9px] rounded px-1.5 py-0.5 font-bold font-dubai ${status.color}`}>
                        {status.label}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-[10px] text-secondary/75 font-dubai mt-1">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {isActive ? `${t.accounting.settings.invitations.remaining}: ${getRemainingTime(invite.expiresAt)}` : getRemainingTime(invite.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isActive && (
                      <>
                        <button
                          onClick={() => handleCopyLink(invite.code)}
                          className="p-1.5 hover:bg-white rounded-lg transition"
                          title={t.accounting.settings.invitations.copyLink}
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-secondary/70" />}
                        </button>
                        <button
                          onClick={() => handleShowQR(invite)}
                          className="p-1.5 hover:bg-white rounded-lg transition"
                          title={t.accounting.settings.invitations.showQR}
                        >
                          <QrCode className="w-3 h-3 text-secondary/70" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteTarget(invite)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition"
                      title={t.accounting.common.delete}
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowCreate(false)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm z-10 overflow-hidden border border-secondary/[0.08]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                    <Link2 size={15} className="text-white" />
                  </div>
                  <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.settings.invitations.newInvitation}</h4>
                </div>
                <button onClick={() => setShowCreate(false)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"><X size={18} className="text-secondary/70" /></button>
              </div>
              <div className="p-5 space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Shield size={11} className="text-secondary/75" /></span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.invitations.selectRole}</span>
                    <span className="text-red-400 text-xs">*</span>
                  </label>
                  <CustomSelect
                    value={selectedRole}
                    onChange={setSelectedRole}
                    className="w-full"
                    options={ACCOUNTING_ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))}
                  />
                </div>
                <div className="bg-amber-50/80 rounded-xl p-3 border border-amber-100">
                  <div className="flex items-start gap-2">
                    <AlertCircle size={14} className="text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-[10px] text-amber-700 font-dubai space-y-1">
                      <p>• {t.accounting.settings.invitations.validityNote}</p>
                      <p>• {t.accounting.settings.invitations.singleUseNote}</p>
                      <p>• {t.accounting.settings.invitations.expiresAfterRegister}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button" onClick={() => setShowCreate(false)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/75 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >{t.accounting.common.cancel}</button>
                  <button
                    onClick={handleCreate}
                    disabled={isCreating}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isCreating && <Loader2 size={16} className="animate-spin" />}
                    {isCreating ? t.accounting.settings.invitations.creating : t.accounting.settings.invitations.createInvitation}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Created Invite Result Modal */}
      <AnimatePresence>
        {createdInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setCreatedInvite(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm z-10 overflow-hidden border border-secondary/[0.08]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                    <Check size={15} className="text-white" />
                  </div>
                  <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.settings.invitations.invitationCreated}</h4>
                </div>
                <button onClick={() => setCreatedInvite(null)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"><X size={18} className="text-secondary/70" /></button>
              </div>
              <div className="p-5 space-y-4 flex flex-col items-center" dir="rtl">
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded px-2 py-1 font-bold font-dubai ${ROLE_COLORS[createdInvite.role]}`}>
                    {ROLE_LABELS[createdInvite.role]}
                  </span>
                  <span className="text-[10px] text-secondary/75 font-dubai flex items-center gap-1">
                    <Clock size={12} /> {t.accounting.settings.invitations.validFor}
                  </span>
                </div>

                {qrDataUrl && (
                  <div className="bg-secondary/[0.03] rounded-2xl p-3 border border-secondary/[0.06]">
                    <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
                  </div>
                )}

                <button
                  onClick={() => handleCopyLink(createdInvite.code)}
                  className="w-full py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? (
                    <>
                      <Check size={16} />
                      {t.accounting.settings.invitations.copied}
                    </>
                  ) : (
                    <>
                      <Copy size={16} />
                      {t.accounting.settings.invitations.copyInviteLink}
                    </>
                  )}
                </button>

                <p className="text-[10px] text-secondary/70 font-dubai text-center">
                  {t.accounting.settings.invitations.shareNote}
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* QR View Modal */}
      <AnimatePresence>
        {qrInvite && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setQrInvite(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm z-10 overflow-hidden border border-secondary/[0.08]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-secondary/[0.06]">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-secondary to-secondary/80 flex items-center justify-center">
                    <QrCode size={15} className="text-white" />
                  </div>
                  <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.settings.invitations.qrCode}</h4>
                </div>
                <button onClick={() => setQrInvite(null)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"><X size={18} className="text-secondary/70" /></button>
              </div>
              <div className="p-5 flex flex-col items-center space-y-4">
                <span className={`text-xs rounded px-2 py-1 font-bold font-dubai ${ROLE_COLORS[qrInvite.role]}`}>
                  {ROLE_LABELS[qrInvite.role]}
                </span>
                {qrViewDataUrl && (
                  <div className="bg-secondary/[0.03] rounded-2xl p-3 border border-secondary/[0.06]">
                    <img src={qrViewDataUrl} alt="QR Code" className="w-56 h-56" />
                  </div>
                )}
                <button
                  onClick={() => handleCopyLink(qrInvite.code)}
                  className="w-full py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all flex items-center justify-center gap-2"
                >
                  {copied ? <><Check size={16} /> {t.accounting.settings.invitations.copied}</> : <><Copy size={16} /> {t.accounting.settings.invitations.copyLink}</>}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm */}
      <AnimatePresence>
        {deleteTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setDeleteTarget(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm z-10 border border-secondary/[0.08] overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-secondary/[0.06]">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-500 to-red-500/80 flex items-center justify-center">
                  <Trash2 size={15} className="text-white" />
                </div>
                <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.settings.invitations.deleteInvitation}</h4>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-secondary font-dubai">
                  {t.accounting.settings.invitations.confirmDeleteInvitation(ROLE_LABELS[deleteTarget.role] || deleteTarget.role)}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/75 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >
                    {t.accounting.common.cancel}
                  </button>
                  <button
                    onClick={handleDelete} disabled={isDeleting}
                    className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-dubai text-sm font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isDeleting && <Loader2 size={14} className="animate-spin" />}
                    {t.accounting.common.delete}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvitationManager;
