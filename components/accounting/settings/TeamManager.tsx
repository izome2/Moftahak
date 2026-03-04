'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Shield,
  Mail,
  Phone,
} from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  image?: string | null;
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

const TeamManager: React.FC = () => {
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create form
  const [showCreate, setShowCreate] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<string>('BOOKING_MANAGER');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Edit
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editSaving, setEditSaving] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<TeamMember | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchTeam = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/accounting/settings/team');
      const json = await res.json();
      if (res.ok) setMembers(json.users || []);
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchTeam(); }, [fetchTeam]);

  const resetCreateForm = () => {
    setFirstName('');
    setLastName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('BOOKING_MANAGER');
    setFormError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName.trim() || !lastName.trim()) {
      setFormError('الاسم الأول واسم العائلة مطلوبان');
      return;
    }
    if (!password || password.length < 6) {
      setFormError('كلمة المرور يجب أن تكون 6 أحرف على الأقل');
      return;
    }

    setIsSaving(true);
    setFormError(null);

    try {
      const res = await fetch('/api/accounting/settings/team', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim() || null,
          phone: phone.trim() || null,
          password,
          role,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error || 'حدث خطأ'); return; }
      setShowCreate(false);
      resetCreateForm();
      fetchTeam();
    } catch {
      setFormError('فشل الاتصال');
    } finally {
      setIsSaving(false);
    }
  };

  const openEdit = (m: TeamMember) => {
    setEditMember(m);
    setEditRole(m.role);
    setEditFirstName(m.firstName);
    setEditLastName(m.lastName);
    setEditError(null);
  };

  const handleEditSave = async () => {
    if (!editMember) return;
    setEditSaving(true);
    setEditError(null);

    try {
      const res = await fetch(`/api/accounting/settings/team/${editMember.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: editFirstName.trim(),
          lastName: editLastName.trim(),
          role: editRole,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.error || 'حدث خطأ'); return; }
      setEditMember(null);
      fetchTeam();
    } catch {
      setEditError('فشل الاتصال');
    } finally {
      setEditSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/accounting/settings/team/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) setError(json.error || 'حدث خطأ');
      else fetchTeam();
    } catch {
      setError('فشل الاتصال');
    } finally {
      setIsDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-secondary font-dubai flex items-center gap-2">
          <Users className="w-4 h-4" />
          إدارة الفريق
        </h3>
        <button
          onClick={() => { resetCreateForm(); setShowCreate(true); }}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold
            bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-dubai"
        >
          <Plus className="w-3 h-3" /> عضو جديد
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
      ) : members.length === 0 ? (
        <p className="text-xs text-secondary/50 font-dubai text-center py-4">لا يوجد أعضاء فريق</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {members.map(m => (
            <motion.div
              key={m.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between bg-primary/5 rounded-xl px-3 py-2.5"
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-secondary font-dubai">
                    {m.firstName} {m.lastName}
                  </p>
                  <span className={`text-[9px] rounded px-1.5 py-0.5 font-bold font-dubai ${ROLE_COLORS[m.role] || 'bg-secondary/10 text-secondary/70'}`}>
                    {ROLE_LABELS[m.role] || m.role}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-[10px] text-secondary/50 font-dubai mt-0.5">
                  {m.email && (
                    <span className="flex items-center gap-0.5">
                      <Mail className="w-2.5 h-2.5" /> {m.email}
                    </span>
                  )}
                  {m.phone && (
                    <span className="flex items-center gap-0.5">
                      <Phone className="w-2.5 h-2.5" /> {m.phone}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(m)} className="p-1.5 hover:bg-white rounded-lg transition">
                  <Pencil className="w-3 h-3 text-secondary/40" />
                </button>
                <button onClick={() => setDeleteTarget(m)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-3 h-3 text-red-400" />
                </button>
              </div>
            </motion.div>
          ))}
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
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-md z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">عضو جديد</h4>
                <button onClick={() => setShowCreate(false)}><X className="w-4 h-4 text-secondary/40" /></button>
              </div>
              <form onSubmit={handleCreate} className="p-5 space-y-3" dir="rtl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">الاسم الأول *</label>
                    <input
                      value={firstName} onChange={e => setFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">اسم العائلة *</label>
                    <input
                      value={lastName} onChange={e => setLastName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                      required
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">البريد الإلكتروني</label>
                  <input
                    type="email" value={email} onChange={e => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">الهاتف</label>
                  <input
                    value={phone} onChange={e => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    dir="ltr"
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">كلمة المرور *</label>
                  <input
                    type="password" value={password} onChange={e => setPassword(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    dir="ltr" minLength={6} required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai flex items-center gap-1">
                    <Shield className="w-3 h-3" /> الدور *
                  </label>
                  <CustomSelect
                    value={role}
                    onChange={setRole}
                    className="w-full"
                    required
                    options={ACCOUNTING_ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))}
                  />
                </div>
                {formError && <p className="text-xs text-red-600 font-dubai">{formError}</p>}
                <button
                  type="submit" disabled={isSaving}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'جاري الإنشاء...' : 'إنشاء العضو'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {editMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditMember(null)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">تعديل العضو</h4>
                <button onClick={() => setEditMember(null)}><X className="w-4 h-4 text-secondary/40" /></button>
              </div>
              <div className="p-5 space-y-3" dir="rtl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">الاسم الأول</label>
                    <input
                      value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">اسم العائلة</label>
                    <input
                      value={editLastName} onChange={e => setEditLastName(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    />
                  </div>
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai flex items-center gap-1">
                    <Shield className="w-3 h-3" /> الدور
                  </label>
                  <CustomSelect
                    value={editRole}
                    onChange={setEditRole}
                    className="w-full"
                    options={ACCOUNTING_ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))}
                  />
                </div>
                {editError && <p className="text-xs text-red-600 font-dubai">{editError}</p>}
                <button
                  onClick={handleEditSave}
                  disabled={editSaving}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {editSaving ? 'جاري الحفظ...' : 'حفظ التغييرات'}
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
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 z-10"
            >
              <h4 className="text-sm font-bold text-secondary font-dubai mb-2">حذف العضو</h4>
              <p className="text-xs text-secondary/70 font-dubai mb-4">
                هل تريد حذف <strong>{deleteTarget.firstName} {deleteTarget.lastName}</strong>؟
                هذا الإجراء لا يمكن التراجع عنه.
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

export default TeamManager;
