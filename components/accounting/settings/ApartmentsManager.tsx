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
    if (!name.trim() || !projectId) { setFormError('الاسم والمشروع مطلوبان'); return; }

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
      if (!res.ok) { setFormError(json.error || 'حدث خطأ'); return; }
      setShowForm(false);
      fetchData();
    } catch {
      setFormError('فشل الاتصال');
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
      if (!res.ok) setError(json.error || 'حدث خطأ');
      else fetchData();
    } catch {
      setError('فشل الاتصال');
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
          الشقق
        </h3>
        <button
          onClick={openCreate}
          disabled={projects.length === 0}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold
            bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-dubai disabled:opacity-50"
        >
          <Plus className="w-3 h-3" /> إضافة
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
        <p className="text-xs text-secondary/50 font-dubai text-center py-4">لا توجد شقق</p>
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
                    <span className="text-[9px] bg-red-100 text-red-600 rounded px-1.5 py-0.5 font-dubai">معطلة</span>
                  )}
                </div>
                <div className="flex items-center gap-2 text-[10px] text-secondary/50 font-dubai mt-0.5">
                  <span>{a.project.name}</span>
                  {a.floor && <span>• طابق {a.floor}</span>}
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
                  title={a.isActive ? 'تعطيل' : 'تفعيل'}
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">
                  {editId ? 'تعديل الشقة' : 'شقة جديدة'}
                </h4>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-secondary/40" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-3" dir="rtl">
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">اسم الشقة *</label>
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">المشروع *</label>
                  <CustomSelect
                    value={projectId}
                    onChange={setProjectId}
                    className="w-full"
                    placeholder="اختر المشروع"
                    required
                    options={projects.map(p => ({ value: p.id, label: p.name }))}
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">الطابق</label>
                    <input
                      value={floor} onChange={e => setFloor(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">النوع</label>
                    <input
                      value={type} onChange={e => setType(e.target.value)}
                      className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    />
                  </div>
                </div>
                {formError && <p className="text-xs text-red-600 font-dubai">{formError}</p>}
                <button
                  type="submit" disabled={isSaving}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                </button>
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
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 z-10"
            >
              <h4 className="text-sm font-bold text-secondary font-dubai mb-2">
                {toggleTarget.isActive ? 'تعطيل الشقة' : 'تفعيل الشقة'}
              </h4>
              <p className="text-xs text-secondary/70 font-dubai mb-4">
                هل تريد {toggleTarget.isActive ? 'تعطيل' : 'تفعيل'} <strong>{toggleTarget.name}</strong>؟
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleToggleActive} disabled={isToggling}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold font-dubai
                    flex items-center justify-center gap-1 disabled:opacity-50
                    ${toggleTarget.isActive
                      ? 'bg-red-600 text-white hover:bg-red-700'
                      : 'bg-green-600 text-white hover:bg-green-700'}`}
                >
                  {isToggling && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {toggleTarget.isActive ? 'تعطيل' : 'تفعيل'}
                </button>
                <button
                  onClick={() => setToggleTarget(null)}
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

export default ApartmentsManager;
