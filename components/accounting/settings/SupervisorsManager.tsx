'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  UserCheck,
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

const SupervisorsManager: React.FC = () => {
  const t = useTranslation();
  const { language } = useLanguage();
  const [supervisors, setSupervisors] = useState<string[]>([]);
  const [original, setOriginal] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  // Add form
  const [newName, setNewName] = useState('');

  const fetchSupervisors = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch('/api/accounting/settings/supervisors');
      const json = await res.json();
      if (res.ok) {
        const list = json.supervisors || [];
        setSupervisors(list);
        setOriginal(list);
      }
    } catch { /* silent */ } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { fetchSupervisors(); }, [fetchSupervisors]);

  const addSupervisor = () => {
    const trimmed = newName.trim();
    if (!trimmed) return;
    if (supervisors.includes(trimmed)) {
      setError(t.accounting.errors.supervisorExists);
      return;
    }
    setSupervisors([...supervisors, trimmed]);
    setNewName('');
    setError(null);
  };

  const removeSupervisor = (name: string) => {
    setSupervisors(supervisors.filter(s => s !== name));
  };

  const handleSave = async () => {
    if (supervisors.length === 0) {
      setError(t.accounting.errors.minOneSupervisor);
      return;
    }

    setIsSaving(true);
    setError(null);
    setSaved(false);

    try {
      const res = await fetch('/api/accounting/settings/supervisors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ supervisors }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || t.accounting.errors.generic); return; }
      const saved = json.supervisors || supervisors;
      setSupervisors(saved);
      setOriginal(saved);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {
      setError(t.accounting.errors.connectionFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const hasChanged = JSON.stringify(supervisors) !== JSON.stringify(original);

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-bold text-secondary font-dubai flex items-center gap-2">
        <UserCheck className="w-4 h-4" />
        {t.accounting.settings.supervisors.title}
      </h3>

      {isLoading ? (
        <div className="flex justify-center py-6">
          <Loader2 className="w-5 h-5 animate-spin text-primary" />
        </div>
      ) : (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {/* Add form */}
          <div className="flex items-center gap-2">
            <input
              value={newName}
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSupervisor())}
              placeholder={t.accounting.settings.supervisors.newSupervisorPlaceholder}
              className="flex-1 px-3 py-2 text-sm border border-secondary/[0.08] rounded-xl
                focus:outline-none focus:border-secondary/20 font-dubai placeholder:text-secondary/30"
            />
            <button
              onClick={addSupervisor}
              disabled={!newName.trim()}
              className="p-2 bg-secondary text-white rounded-xl hover:bg-secondary/90
                transition disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>

          {/* List */}
          {supervisors.length === 0 ? (
            <p className="text-xs text-secondary/50 font-dubai text-center py-4">{t.accounting.settings.supervisors.noSupervisors}</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {supervisors.map(name => (
                <motion.div
                  key={name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="flex items-center gap-1.5 bg-secondary/[0.04] rounded-lg px-3 py-1.5
                    text-sm text-secondary font-dubai group"
                >
                  {name}
                  <button
                    onClick={() => removeSupervisor(name)}
                    className="opacity-0 group-hover:opacity-100 transition p-0.5 hover:bg-red-50 rounded"
                  >
                    <X className="w-3 h-3 text-red-400" />
                  </button>
                </motion.div>
              ))}
            </div>
          )}

          {error && <p className="text-xs text-red-600 font-dubai">{error}</p>}

          {/* Save */}
          <button
            onClick={handleSave}
            disabled={isSaving || !hasChanged}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold
              bg-secondary text-white rounded-xl hover:bg-secondary/90 transition
              disabled:opacity-50 font-dubai"
          >
            {isSaving ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : saved ? (
              <Check className="w-3.5 h-3.5" />
            ) : null}
            {isSaving ? t.accounting.common.saving : saved ? t.accounting.common.saved : t.accounting.common.saveChanges}
          </button>
        </motion.div>
      )}
    </div>
  );
};

export default SupervisorsManager;
