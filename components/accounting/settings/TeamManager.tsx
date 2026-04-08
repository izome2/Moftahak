'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Users,
  Pencil,
  Trash2,
  Loader2,
  X,
  Shield,
  Mail,
  Phone,
} from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface TeamMember {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  role: string;
  additionalRoles?: string[];
  image?: string | null;
  createdAt: string;
}

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-emerald-50 text-emerald-600',
  GENERAL_MANAGER: 'bg-purple-50 text-purple-600',
  OPS_MANAGER: 'bg-blue-50 text-blue-600',
  BOOKING_MANAGER: 'bg-green-50 text-green-600',
  INVESTOR: 'bg-amber-50 text-amber-600',
};

const ACCOUNTING_ROLES = ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'] as const;

const TeamManager: React.FC = () => {
  const t = useTranslation();
  const { language } = useLanguage();

  const ROLE_LABELS: Record<string, string> = useMemo(() => ({
    ADMIN: t.accounting.roles.ADMIN,
    GENERAL_MANAGER: t.accounting.roles.GENERAL_MANAGER,
    OPS_MANAGER: t.accounting.roles.OPS_MANAGER,
    BOOKING_MANAGER: t.accounting.roles.BOOKING_MANAGER,
    INVESTOR: t.accounting.roles.INVESTOR,
  }), [t]);
  const [members, setMembers] = useState<TeamMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Edit
  const [editMember, setEditMember] = useState<TeamMember | null>(null);
  const [editRole, setEditRole] = useState('');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editAdditionalRoles, setEditAdditionalRoles] = useState<string[]>([]);
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

  const openEdit = (m: TeamMember) => {
    setEditMember(m);
    setEditRole(m.role);
    setEditFirstName(m.firstName);
    setEditLastName(m.lastName);
    setEditAdditionalRoles(m.additionalRoles || []);
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
          additionalRoles: editAdditionalRoles.filter(r => r !== editRole),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setEditError(json.error || t.accounting.errors.generic); return; }
      setEditMember(null);
      fetchTeam();
    } catch {
      setEditError(t.accounting.errors.connectionFailed);
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
      if (!res.ok) setError(json.error || t.accounting.errors.generic);
      else fetchTeam();
    } catch {
      setError(t.accounting.errors.connectionFailed);
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
          {t.accounting.settings.team.title}
        </h3>
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
        <p className="text-xs text-secondary/50 font-dubai text-center py-4">{t.accounting.settings.team.noMembers}</p>
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
                  {m.additionalRoles && m.additionalRoles.length > 0 && m.additionalRoles.map(r => (
                    <span key={r} className={`text-[9px] rounded px-1.5 py-0.5 font-bold font-dubai ${ROLE_COLORS[r] || 'bg-secondary/10 text-secondary/70'}`}>
                      +{ROLE_LABELS[r] || r}
                    </span>
                  ))}
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

      {/* Edit Modal */}
      <AnimatePresence>
        {editMember && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setEditMember(null)}
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
                    <Pencil size={15} className="text-white" />
                  </div>
                  <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.settings.team.editMember}</h4>
                </div>
                <button onClick={() => setEditMember(null)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"><X size={18} className="text-secondary/40" /></button>
              </div>
              <div className="p-5 space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Users size={11} className="text-secondary/50" /></span>
                      <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.team.firstName}</span>
                    </label>
                    <input
                      value={editFirstName} onChange={e => setEditFirstName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Users size={11} className="text-secondary/50" /></span>
                      <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.team.lastName}</span>
                    </label>
                    <input
                      value={editLastName} onChange={e => setEditLastName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                    />
                  </div>
                </div>
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Shield size={11} className="text-secondary/50" /></span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.team.role}</span>
                  </label>
                  <CustomSelect
                    value={editRole}
                    onChange={setEditRole}
                    className="w-full"
                    options={ACCOUNTING_ROLES.map(r => ({ value: r, label: ROLE_LABELS[r] }))}
                  />
                </div>
                {/* الأدوار الإضافية */}
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Shield size={11} className="text-secondary/50" /></span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{language === 'ar' ? 'أدوار إضافية' : 'Additional Roles'}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {ACCOUNTING_ROLES.filter(r => r !== editRole).map(r => {
                      const isSelected = editAdditionalRoles.includes(r);
                      return (
                        <button
                          key={r}
                          type="button"
                          onClick={() => {
                            setEditAdditionalRoles(prev =>
                              isSelected ? prev.filter(x => x !== r) : [...prev, r]
                            );
                          }}
                          className={`text-xs px-2.5 py-1.5 rounded-lg font-dubai font-bold border transition-all ${
                            isSelected
                              ? 'bg-secondary text-white border-secondary'
                              : 'bg-white text-secondary/60 border-secondary/[0.08] hover:border-secondary/20'
                          }`}
                        >
                          {ROLE_LABELS[r]}
                        </button>
                      );
                    })}
                  </div>
                  <p className="text-[10px] text-secondary/40 font-dubai mt-1.5">
                    {language === 'ar' ? 'اضغط لإضافة أو إزالة دور إضافي' : 'Click to add or remove additional role'}
                  </p>
                </div>
                {editError && <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">{editError}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button" onClick={() => setEditMember(null)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >{t.accounting.common.cancel}</button>
                  <button
                    onClick={handleEditSave}
                    disabled={editSaving}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {editSaving && <Loader2 size={16} className="animate-spin" />}
                    {editSaving ? t.accounting.common.saving : t.accounting.common.saveChanges}
                  </button>
                </div>
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
                <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.settings.team.deleteMember}</h4>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-secondary font-dubai">
                  {t.accounting.settings.team.confirmDeleteMember(`${deleteTarget.firstName} ${deleteTarget.lastName}`)}
                  {' '}{t.accounting.settings.team.cannotUndo}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setDeleteTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >{t.accounting.common.cancel}</button>
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

export default TeamManager;
