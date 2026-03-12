'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderKanban,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  X,
  Building2,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Project {
  id: string;
  name: string;
  description?: string | null;
  _count: { apartments: number };
}

const ProjectsManager: React.FC = () => {
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG-u-nu-arab' : 'en-US';
  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  // Delete
  const [deleteTarget, setDeleteTarget] = useState<Project | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchProjects = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/accounting/projects');
      const json = await res.json();
      if (res.ok) setProjects(json.projects || []);
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchProjects(); }, [fetchProjects]);

  const openCreate = () => {
    setEditId(null);
    setName('');
    setDescription('');
    setFormError(null);
    setShowForm(true);
  };

  const openEdit = (p: Project) => {
    setEditId(p.id);
    setName(p.name);
    setDescription(p.description || '');
    setFormError(null);
    setShowForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) { setFormError(t.accounting.settings.projects.projectNameRequired); return; }

    setIsSaving(true);
    setFormError(null);

    try {
      const url = editId
        ? `/api/accounting/projects/${editId}`
        : '/api/accounting/projects';
      const method = editId ? 'PUT' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), description: description.trim() || undefined }),
      });
      const json = await res.json();
      if (!res.ok) { setFormError(json.error || t.accounting.errors.generic); return; }
      setShowForm(false);
      fetchProjects();
    } catch {
      setFormError(t.accounting.errors.connectionFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/accounting/projects/${deleteTarget.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) { setError(json.error || t.accounting.errors.generic); }
      else fetchProjects();
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
          <FolderKanban className="w-4 h-4" />
          {t.accounting.settings.projects.title}
        </h3>
        <button
          onClick={openCreate}
          className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold
            bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-dubai"
        >
          <Plus className="w-3 h-3" /> {t.accounting.common.add}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-dubai flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {/* List */}
      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : projects.length === 0 ? (
        <p className="text-xs text-secondary/50 font-dubai text-center py-4">{t.accounting.settings.projects.noProjects}</p>
      ) : (
        <div className="space-y-2">
          {projects.map(p => (
            <motion.div
              key={p.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="flex items-center justify-between bg-primary/5 rounded-xl px-3 py-2.5"
            >
              <div>
                <p className="text-sm font-bold text-secondary font-dubai">{p.name}</p>
                <div className="flex items-center gap-2 text-[10px] text-secondary/50 font-dubai mt-0.5">
                  <span className="flex items-center gap-0.5">
                    <Building2 className="w-3 h-3" /> {p._count.apartments} {t.accounting.settings.projects.apartmentUnit}
                  </span>
                  {p.description && <span>• {p.description}</span>}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(p)} className="p-1.5 hover:bg-white rounded-lg transition">
                  <Pencil className="w-3 h-3 text-secondary/40" />
                </button>
                <button onClick={() => setDeleteTarget(p)} className="p-1.5 hover:bg-red-50 rounded-lg transition">
                  <Trash2 className="w-3 h-3 text-red-400" />
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
              className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-sm z-10 overflow-hidden border-2 border-[#e0cdb8]"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">
                  {editId ? t.accounting.settings.projects.editProject : t.accounting.settings.projects.newProject}
                </h4>
                <button onClick={() => setShowForm(false)}><X className="w-4 h-4 text-secondary/40" /></button>
              </div>
              <form onSubmit={handleSubmit} className="p-5 space-y-3" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">{t.accounting.settings.projects.projectName}</label>
                  <input
                    value={name} onChange={e => setName(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1 block font-dubai">{t.accounting.settings.projects.description}</label>
                  <input
                    value={description} onChange={e => setDescription(e.target.value)}
                    className="w-full px-3 py-2 text-sm border-2 border-primary/20 rounded-xl focus:outline-none focus:border-primary font-dubai"
                  />
                </div>
                {formError && <p className="text-xs text-red-600 font-dubai">{formError}</p>}
                <button
                  type="submit" disabled={isSaving}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {isSaving ? t.accounting.common.saving : t.accounting.common.save}
                </button>
              </form>
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
              <h4 className="text-sm font-bold text-secondary font-dubai mb-2">{t.accounting.settings.projects.deleteProject}</h4>
              <p className="text-xs text-secondary/70 font-dubai mb-4">
                {t.accounting.settings.projects.confirmDeleteProject(deleteTarget.name)}
                {deleteTarget._count.apartments > 0 && (
                  <span className="text-red-500 block mt-1">{t.accounting.settings.projects.cannotDelete(deleteTarget._count.apartments)}</span>
                )}
              </p>
              <div className="flex gap-2">
                <button
                  onClick={handleDelete} disabled={isDeleting || deleteTarget._count.apartments > 0}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl text-xs font-bold font-dubai
                    hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-1"
                >
                  {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {t.accounting.common.delete}
                </button>
                <button
                  onClick={() => setDeleteTarget(null)}
                  className="flex-1 py-2 bg-primary/10 text-secondary rounded-xl text-xs font-medium font-dubai hover:bg-primary/20"
                >
                  {t.accounting.common.cancel}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ProjectsManager;
