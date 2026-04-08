'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Apartment {
  id: string;
  name: string;
  floor?: string | null;
  type?: string | null;
  projectId: string;
  isActive: boolean;
  project: { id: string; name: string };
  _count: { bookings: number; investors: number };
}

interface Project {
  id: string;
  name: string;
}

const ApartmentsManager: React.FC = () => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [floor, setFloor] = useState('');
  const [type, setType] = useState('');
  const [projectId, setProjectId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete/toggle
  const [toggleTarget, setToggleTarget] = useState<Apartment | null>(null);
  const [isToggling, setIsToggling] = useState(false);

  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [aptRes, projRes] = await Promise.all([
        fetch('/api/accounting/apartments?includeInactive=true'),
        fetch('/api/accounting/projects'),
      ]);
      const aptJson = await aptRes.json();
      const projJson = await projRes.json();
      if (aptRes.ok) setApartments(aptJson.apartments || []);
      if (projRes.ok) setProjects(projJson.projects || []);
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const openCreate = () => {
    setEditId(null);
    setName('');
    setFloor('');
    setType('');
    setProjectId(projects[0]?.id || '');
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (a: Apartment) => {
    setEditId(a.id);
    setName(a.name);
    setFloor(a.floor || '');
    setType(a.type || '');
    setProjectId(a.projectId);
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !projectId) { setFormError(t.accounting.settings.apartments.nameAndProjectRequired); return; }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editId
        ? `/api/accounting/apartments/${editId}`
        : '/api/accounting/apartments';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          floor: floor.trim() || undefined,
          type: type.trim() || undefined,
          projectId,
        }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error || t.accounting.errors.generic); return; }
      setShowForm(false);
      fetchData();
    } catch {
      setFormError(t.accounting.errors.connectionFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleToggleActive = async () => {
    if (!toggleTarget) return;
    setIsToggling(true);
    try {
      const res = await fetch(`/api/accounting/apartments/${toggleTarget.id}`, {
        method: toggleTarget.isActive ? 'DELETE' : 'PUT',
        headers: { 'Content-Type': 'application/json' },
        ...(!toggleTarget.isActive ? { body: JSON.stringify({ isActive: true }) } : {}),
      });
      const json = await res.json();
      if (!res.ok) setError(json.error || t.accounting.errors.generic);
      else fetchData();
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsToggling(false);
      setToggleTarget(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-bold text-secondary font-dubai flex items-center gap-2">
          <Building2 className="w-4 h-4" />
          {t.accounting.settings.apartments.title}
        </h3>
        <button
          onClick={openCreate}
          disabled={projects.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold
            bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-dubai disabled:opacity-50"
        >
          <Plus className="w-3 h-3" /> {t.accounting.common.add}
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
      ) : apartments.length === 0 ? (
        <p className="text-xs text-secondary/50 font-dubai text-center py-4">{t.accounting.settings.apartments.noApartments}</p>
      ) : (
        <div className="space-y-2 max-h-[400px] overflow-y-auto">
          {apartments.map(a => (
            <motion.div
              key={a.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className={`flex items-center justify-between rounded-xl px-3 py-2.5
                ${a.isActive ? 'bg-primary/5' : 'bg-red-50/50'}`}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-bold text-secondary font-dubai truncate">{a.name}</p>
                  {!a.isActive && (
                    <span className="text-[9px] bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-dubai">{t.accounting.common.disabled}</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-secondary/50 font-dubai mt-0.5">
                  <span>{a.project.name}</span>
                  {a.floor && <span>• {t.accounting.settings.apartments.floorLabel} {a.floor}</span>}
                  {a.type && <span>• {a.type}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1 shrink-0">
                <button onClick={() => openEdit(a)} className="p-1.5 hover:bg-white rounded-lg transition">
                  <Pencil className="w-3 h-3 text-secondary/40" />
                </button>
                <button
                  onClick={() => setToggleTarget(a)}
                  className="p-1.5 hover:bg-white rounded-lg transition"
                  title={a.isActive ? t.accounting.settings.apartments.disable : t.accounting.settings.apartments.enable}
                >
                  {a.isActive
                    ? <XCircle className="w-3.5 h-3.5 text-red-400" />
                    : <CheckCircle className="w-3.5 h-3.5 text-green-500" />}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setShowForm(false)}
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
                    <Building2 size={15} className="text-white" />
                  </div>
                  <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">
                    {editId ? t.accounting.settings.apartments.editApartment : t.accounting.settings.apartments.newApartment}
                  </h4>
                </div>
                <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-secondary/5 rounded-lg transition-colors"><X size={18} className="text-secondary/40" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-5" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Building2 size={11} className="text-secondary/50" /></span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.apartments.apartmentNameRequired}</span>
                    <span className="text-red-400 text-xs">*</span>
                  </label>
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                    required
                  />
                </div>
                <div>
                  <label className="flex items-center gap-1.5 mb-2">
                    <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Building2 size={11} className="text-secondary/50" /></span>
                    <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.apartments.projectRequired}</span>
                    <span className="text-red-400 text-xs">*</span>
                  </label>
                  <CustomSelect
                    value={projectId}
                    onChange={setProjectId}
                    className="w-full"
                    placeholder={t.accounting.settings.apartments.selectProject}
                    required
                    emptyMessage={t.accounting.settings.apartments.noProjects}
                    options={projects.map(p => ({ value: p.id, label: p.name }))}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                  <div>
                    <label className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Building2 size={11} className="text-secondary/50" /></span>
                      <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.apartments.floorNumber}</span>
                    </label>
                    <input
                      value={floor} onChange={e => setFloor(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                    />
                  </div>
                  <div>
                    <label className="flex items-center gap-1.5 mb-2">
                      <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0"><Building2 size={11} className="text-secondary/50" /></span>
                      <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.settings.apartments.type}</span>
                    </label>
                    <input
                      value={type} onChange={e => setType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/25"
                    />
                  </div>
                </div>
                {formError && <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">{formError}</p>}
                <div className="flex items-center gap-3 pt-1">
                  <button
                    type="button" onClick={() => setShowForm(false)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >{t.accounting.common.cancel}</button>
                  <button
                    type="submit" disabled={isSaving}
                    className="flex-1 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 hover:shadow-lg hover:shadow-secondary/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSaving && <Loader2 size={16} className="animate-spin" />}
                    {isSaving ? t.accounting.common.saving : t.accounting.common.save}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Toggle Active Confirm */}
      <AnimatePresence>
        {toggleTarget && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setToggleTarget(null)}
              className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
              className="relative bg-white rounded-2xl shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] w-full max-w-sm z-10 border border-secondary/[0.08] overflow-hidden"
            >
              <div className="flex items-center gap-2.5 px-5 py-4 border-b border-secondary/[0.06]">
                <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${toggleTarget.isActive ? 'from-red-500 to-red-500/80' : 'from-green-500 to-green-500/80'} flex items-center justify-center`}>
                  {toggleTarget.isActive ? <XCircle size={15} className="text-white" /> : <CheckCircle size={15} className="text-white" />}
                </div>
                <h4 className="text-base font-bold text-secondary font-dubai tracking-tight">
                  {toggleTarget.isActive ? t.accounting.settings.apartments.disableApartment : t.accounting.settings.apartments.enableApartment}
                </h4>
              </div>
              <div className="p-5 space-y-4">
                <p className="text-sm text-secondary font-dubai">
                  {toggleTarget.isActive ? t.accounting.settings.apartments.disable : t.accounting.settings.apartments.enable} <strong>{toggleTarget.name}</strong>?
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setToggleTarget(null)}
                    className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/50 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                  >{t.accounting.common.cancel}</button>
                  <button
                    onClick={handleToggleActive} disabled={isToggling}
                    className={`flex-1 py-2.5 rounded-xl text-sm font-bold font-dubai
                      flex items-center justify-center gap-2 disabled:opacity-50 transition-all
                      ${toggleTarget.isActive
                        ? 'bg-red-600 text-white hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/15'
                        : 'bg-green-600 text-white hover:bg-green-700 hover:shadow-lg hover:shadow-green-600/15'}`}
                  >
                    {isToggling && <Loader2 size={14} className="animate-spin" />}
                    {toggleTarget.isActive ? t.accounting.settings.apartments.disable : t.accounting.settings.apartments.enable}
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

export default ApartmentsManager;
