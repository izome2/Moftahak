'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Building2,
  Loader2,
  X,
  Plus,
  Trash2,
  UserCheck,
} from 'lucide-react';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface OpsManager {
  id: string;
  firstName: string;
  lastName: string;
}

interface Apartment {
  id: string;
  name: string;
  project?: { name: string } | null;
}

interface Assignment {
  id: string;
  userId: string;
  apartmentId: string;
  apartment: Apartment;
}

const OpsApartmentAssignments: React.FC = () => {
  const t = useTranslation();
  const { language } = useLanguage();
  const [managers, setManagers] = useState<OpsManager[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [selectedManager, setSelectedManager] = useState<string>('');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignmentsLoading, setAssignmentsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Add apartment modal
  const [showAdd, setShowAdd] = useState(false);

  const fetchInitialData = useCallback(async () => {
    try {
      setIsLoading(true);
      const [teamRes, aptsRes] = await Promise.all([
        fetch('/api/accounting/settings/team'),
        fetch('/api/accounting/apartments'),
      ]);
      const [teamJson, aptsJson] = await Promise.all([teamRes.json(), aptsRes.json()]);

      if (teamRes.ok && teamJson.users) {
        const ops = teamJson.users.filter((u: { role: string }) => u.role === 'OPS_MANAGER');
        setManagers(ops);
      }
      if (aptsRes.ok && aptsJson.apartments) {
        setApartments(aptsJson.apartments);
      }
    } catch {
      setError(t.accounting.errors.fetchFailed);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchAssignments = useCallback(async (userId: string) => {
    if (!userId) return;
    try {
      setAssignmentsLoading(true);
      const res = await fetch(`/api/accounting/ops-assignments?userId=${userId}`);
      const json = await res.json();
      if (res.ok) {
        setAssignments(json.assignments || []);
      }
    } catch {
      // Silent
    } finally {
      setAssignmentsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInitialData();
  }, [fetchInitialData]);

  useEffect(() => {
    if (selectedManager) {
      fetchAssignments(selectedManager);
    } else {
      setAssignments([]);
    }
  }, [selectedManager, fetchAssignments]);

  const assignedApartmentIds = assignments.map(a => a.apartmentId);
  const unassignedApartments = apartments.filter(a => !assignedApartmentIds.includes(a.id));

  const handleAddApartment = async (apartmentId: string) => {
    if (!selectedManager) return;
    setIsSaving(true);
    try {
      const newIds = [...assignedApartmentIds, apartmentId];
      const res = await fetch('/api/accounting/ops-assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: selectedManager, apartmentIds: newIds }),
      });
      if (res.ok) {
        await fetchAssignments(selectedManager);
        setShowAdd(false);
      }
    } catch {
      setError(t.accounting.errors.saveFetchFailed);
    } finally {
      setIsSaving(false);
    }
  };

  const handleRemoveAssignment = async (assignmentId: string, apartmentId: string) => {
    if (!selectedManager) return;
    setIsSaving(true);
    try {
      const res = await fetch(
        `/api/accounting/ops-assignments?userId=${selectedManager}&apartmentId=${apartmentId}`,
        { method: 'DELETE' }
      );
      if (res.ok) {
        setAssignments(prev => prev.filter(a => a.id !== assignmentId));
      }
    } catch {
      setError(t.accounting.errors.deleteFetchFailed);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <UserCheck className="w-4 h-4 text-primary" />
        <h3 className="text-sm font-bold text-secondary font-dubai">
          {t.accounting.settings.opsAssignments.title}
        </h3>
      </div>

      <p className="text-xs text-secondary/50 font-dubai">
        {t.accounting.settings.opsAssignments.subtitle}
      </p>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-2 text-xs text-red-600 font-dubai flex items-center justify-between">
          {error}
          <button onClick={() => setError(null)}>✕</button>
        </div>
      )}

      {managers.length === 0 ? (
        <p className="text-xs text-secondary/40 font-dubai text-center py-4">
          {t.accounting.settings.opsAssignments.noOpsManagers}
        </p>
      ) : (
        <>
          {/* Manager Selector */}
          <CustomSelect
            value={selectedManager}
            onChange={setSelectedManager}
            placeholder={t.accounting.settings.opsAssignments.selectOpsManager}
            className="w-full"
            emptyMessage={t.accounting.settings.opsAssignments.noManagers}
            options={managers.map((m) => ({
              value: m.id,
              label: `${m.firstName} ${m.lastName}`,
            }))}
          />

          {selectedManager && (
            <>
              {/* Assigned Apartments */}
              {assignmentsLoading ? (
                <div className="flex justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                </div>
              ) : assignments.length === 0 ? (
                <p className="text-xs text-secondary/40 font-dubai text-center py-4">
                  {t.accounting.settings.opsAssignments.noAssignments}
                </p>
              ) : (
                <div className="space-y-1.5 max-h-[250px] overflow-y-auto">
                  {assignments.map((a) => (
                    <motion.div
                      key={a.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-between bg-primary/5 rounded-xl px-3 py-2"
                    >
                      <div className="flex items-center gap-2">
                        <Building2 className="w-3.5 h-3.5 text-primary" />
                        <span className="text-sm font-medium text-secondary font-dubai">
                          {a.apartment.name}
                        </span>
                        {a.apartment.project && (
                          <span className="text-[10px] text-secondary/40 font-dubai">
                            ({a.apartment.project.name})
                          </span>
                        )}
                      </div>
                      <button
                        onClick={() => handleRemoveAssignment(a.id, a.apartmentId)}
                        disabled={isSaving}
                        className="p-1 hover:bg-red-50 rounded-lg transition disabled:opacity-50"
                      >
                        <Trash2 className="w-3 h-3 text-red-400" />
                      </button>
                    </motion.div>
                  ))}
                </div>
              )}

              {/* Add apartment button */}
              <button
                onClick={() => setShowAdd(true)}
                disabled={unassignedApartments.length === 0}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold
                  bg-secondary text-white rounded-lg hover:bg-secondary/90 transition font-dubai
                  disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <Plus className="w-3 h-3" /> {t.accounting.settings.opsAssignments.addApartment}
              </button>
            </>
          )}
        </>
      )}

      {/* Add Apartment Modal */}
      <AnimatePresence>
        {showAdd && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowAdd(false)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-gradient-to-tl from-[#ece1cf] to-white rounded-2xl shadow-[0_20px_50px_-12px_rgba(0,0,0,0.3)] w-full max-w-sm z-10 overflow-hidden border-2 border-[#e0cdb8]"
            >
              <div className="flex items-center justify-between px-5 py-3.5 border-b-2 border-primary/10">
                <h4 className="text-sm font-bold text-secondary font-dubai">{t.accounting.settings.opsAssignments.addApartment}</h4>
                <button onClick={() => setShowAdd(false)}>
                  <X className="w-4 h-4 text-secondary/40" />
                </button>
              </div>
              <div className="p-5 space-y-2 max-h-[300px] overflow-y-auto" dir={language === 'ar' ? 'rtl' : 'ltr'}>
                {unassignedApartments.length === 0 ? (
                  <p className="text-xs text-secondary/40 font-dubai text-center py-4">{t.accounting.settings.opsAssignments.allAssigned}</p>
                ) : (
                  unassignedApartments.map((apt) => (
                    <button
                      key={apt.id}
                      onClick={() => handleAddApartment(apt.id)}
                      disabled={isSaving}
                      className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl hover:bg-primary/10 transition text-right disabled:opacity-50"
                    >
                      <Building2 className="w-4 h-4 text-primary shrink-0" />
                      <div className="flex-1">
                        <p className="text-sm font-medium text-secondary font-dubai">{apt.name}</p>
                        {apt.project && (
                          <p className="text-[10px] text-secondary/40 font-dubai">{apt.project.name}</p>
                        )}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OpsApartmentAssignments;
