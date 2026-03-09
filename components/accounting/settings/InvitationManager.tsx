'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
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

const ROLE_LABELS: Record<string, string> = {
  GENERAL_MANAGER: 'المدير العام',
  OPS_MANAGER: 'مدير التشغيل',
  BOOKING_MANAGER: 'مدير الحجوزات',
  INVESTOR: 'مستثمر',
};

const ROLE_COLORS: Record<string, string> = {
  GENERAL_MANAGER: 'bg-purple-50 text-purple-600',
  OPS_MANAGER: 'bg-blue-50 text-blue-600',
  BOOKING_MANAGER: 'bg-green-50 text-green-600',
  INVESTOR: 'bg-amber-50 text-amber-600',
};

const ACCOUNTING_ROLES = ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] as const;

const InvitationManager: React.FC = () => {
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
        setError(json.error || 'حدث خطأ');
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
      setError('فشل الاتصال');
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
      else setError('حدث خطأ');
    } catch {
      setError('فشل الاتصال');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getStatus = (invite: Invitation) => {
    if (invite.used) return { label: 'مستخدمة', color: 'bg-red-50 text-red-600' };
    if (new Date() > new Date(invite.expiresAt)) return { label: 'منتهية', color: 'bg-gray-100 text-gray-500' };
    return { label: 'نشطة', color: 'bg-emerald-50 text-emerald-600' };
  };

  const getRemainingTime = (expiresAt: string) => {
    const diff = new Date(expiresAt).getTime() - Date.now();
    if (diff <= 0) return 'منتهية';
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);
    if (days > 0) return `${days} يوم ${hours % 24} ساعة`;
    return `${hours} ساعة`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-secondary font-dubai flex items-center gap-2">
          <Link2 className="w-4 h-4" />
          دعوات الفريق
        </h3>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold
            bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-dubai"
        >
          <Plus className="w-3 h-3" /> دعوة جديدة
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
          <p className="text-xs text-secondary/50 font-dubai">لا توجد دعوات</p>
          <p className="text-[10px] text-secondary/30 font-dubai mt-1">أنشئ دعوة جديدة لإضافة عضو للفريق</p>
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
                    <div className="flex items-center gap-3 text-[10px] text-secondary/50 font-dubai mt-1">
                      <span className="flex items-center gap-0.5">
                        <Clock className="w-2.5 h-2.5" />
                        {isActive ? `متبقي: ${getRemainingTime(invite.expiresAt)}` : getRemainingTime(invite.expiresAt)}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    {isActive && (
                      <>
                        <button
                          onClick={() => handleCopyLink(invite.code)}
                          className="p-1.5 hover:bg-white rounded-lg transition"
                          title="نسخ الرابط"
                        >
                          {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3 text-secondary/40" />}
                        </button>
                        <button
                          onClick={() => handleShowQR(invite)}
                          className="p-1.5 hover:bg-white rounded-lg transition"
                          title="عرض QR"
                        >
                          <QrCode className="w-3 h-3 text-secondary/40" />
                        </button>
                      </>
                    )}
                    <button
                      onClick={() => setDeleteTarget(invite)}
                      className="p-1.5 hover:bg-red-50 rounded-lg transition"
                      title="حذف"
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-sm z-10 overflow-hidden border-2 border-[#e0cdb8]"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">دعوة جديدة</h4>
                <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-secondary/40" /></button>
              </div>
              <div className="p-5 space-y-4" dir="rtl">
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai flex items-center gap-1">
                    <Shield className="w-3 h-3" /> اختر الدور *
                  </label>
                  <CustomSelect
                    value={selectedRole}
                    onChange={setSelectedRole}
                    className="w-full"
                    options={ACCOUNTING_ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))}
                  />
                </div>
                <div className="bg-amber-50 rounded-xl p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <div className="text-[10px] text-amber-700 font-dubai space-y-1">
                      <p>• صلاحية الدعوة <strong>٣ أيام</strong> فقط</p>
                      <p>• الدعوة <strong>لاستخدام واحد</strong> فقط</p>
                      <p>• تنتهي فوراً بعد التسجيل</p>
                    </div>
                  </div>
                </div>
                <button
                  onClick={handleCreate}
                  disabled={isCreating}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isCreating && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isCreating ? 'جاري الإنشاء...' : 'إنشاء الدعوة'}
                </button>
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-sm z-10 overflow-hidden border-2 border-[#e0cdb8]"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">تم إنشاء الدعوة</h4>
                <button onClick={() => setCreatedInvite(null)}><X className="w-4 h-4 text-secondary/40" /></button>
              </div>
              <div className="p-5 space-y-4 flex flex-col items-center" dir="rtl">
                <div className="flex items-center gap-2">
                  <span className={`text-xs rounded px-2 py-1 font-bold font-dubai ${ROLE_COLORS[createdInvite.role]}`}>
                    {ROLE_LABELS[createdInvite.role]}
                  </span>
                  <span className="text-[10px] text-secondary/50 font-dubai flex items-center gap-1">
                    <Clock className="w-3 h-3" /> ٣ أيام
                  </span>
                </div>

                {qrDataUrl && (
                  <div className="bg-[#fdf6ee] rounded-2xl p-3 shadow-inner">
                    <img src={qrDataUrl} alt="QR Code" className="w-56 h-56" />
                  </div>
                )}

                <button
                  onClick={() => handleCopyLink(createdInvite.code)}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 flex items-center justify-center gap-2 transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-4 h-4" />
                      تم النسخ!
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4" />
                      نسخ رابط الدعوة
                    </>
                  )}
                </button>

                <p className="text-[10px] text-secondary/40 font-dubai text-center">
                  شارك الرابط أو كود QR مع العضو الجديد
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-sm z-10 overflow-hidden border-2 border-[#e0cdb8]"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">كود QR</h4>
                <button onClick={() => setQrInvite(null)}><X className="w-4 h-4 text-secondary/40" /></button>
              </div>
              <div className="p-5 flex flex-col items-center space-y-4">
                <span className={`text-xs rounded px-2 py-1 font-bold font-dubai ${ROLE_COLORS[qrInvite.role]}`}>
                  {ROLE_LABELS[qrInvite.role]}
                </span>
                {qrViewDataUrl && (
                  <div className="bg-[#fdf6ee] rounded-2xl p-3 shadow-inner">
                    <img src={qrViewDataUrl} alt="QR Code" className="w-56 h-56" />
                  </div>
                )}
                <button
                  onClick={() => handleCopyLink(qrInvite.code)}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 flex items-center justify-center gap-2 transition"
                >
                  {copied ? <><Check className="w-4 h-4" /> تم النسخ!</> : <><Copy className="w-4 h-4" /> نسخ الرابط</>}
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-sm p-5 z-10 border-2 border-[#e0cdb8]"
            >
              <h4 className="text-sm font-bold text-secondary font-dubai mb-2">حذف الدعوة</h4>
              <p className="text-xs text-secondary/70 font-dubai mb-4">
                هل تريد حذف دعوة <strong>{ROLE_LABELS[deleteTarget.role]}</strong>؟
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete} disabled={isDeleting}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-bold font-dubai
                    hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  حذف
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 bg-primary/10 text-secondary rounded-xl text-xs font-medium font-dubai hover:bg-primary/20"
                >
                  إلغاء
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InvitationManager;
