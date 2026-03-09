'use client';

import React, { useEffect, useState, useCallback } from 'react';
import {
  Building2,
  Plus,
  Menu,
  RefreshCw,
  Search,
  Filter,
  Loader2,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { getEffectiveAccountingRole } from '@/lib/permissions';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import ApartmentCard from '@/components/accounting/apartments/ApartmentCard';
import ApartmentForm from '@/components/accounting/apartments/ApartmentForm';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';

// --- Types ---
interface Project {
  id: string;
  name: string;
  _count?: { apartments: number };
}

interface Apartment {
  id: string;
  name: string;
  floor?: string | null;
  type?: string | null;
  projectId: string;
  project?: { id: string; name: string } | null;
  _count?: { bookings: number; investors: number };
}

interface ApartmentSummary {
  apartmentId: string;
  totalRevenue: number;
  totalExpenses: number;
  profit: number;
  bookingsCount: number;
}

// --- Helpers ---
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function ApartmentsPage() {
  const { data: session } = useSession();
  const canManage = session?.user?.role === 'GENERAL_MANAGER' || session?.user?.role === 'ADMIN';
  const effectiveRole = getEffectiveAccountingRole(session?.user?.role || '');
  const isOpsManager = effectiveRole === 'OPS_MANAGER';

  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [summaries, setSummaries] = useState<Record<string, ApartmentSummary>>({});
  const [month, setMonth] = useState(getCurrentMonth);
  const [selectedProject, setSelectedProject] = useState<string>('all');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [summariesLoading, setSummariesLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editApartment, setEditApartment] = useState<Apartment | null>(null);

  // --- Fetch apartments & projects ---
  const fetchData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const [aptsRes, projRes] = await Promise.all([
        fetch('/api/accounting/apartments'),
        fetch('/api/accounting/projects'),
      ]);

      const [aptsJson, projJson] = await Promise.all([
        aptsRes.json(),
        projRes.json(),
      ]);

      if (!aptsRes.ok) throw new Error(aptsJson.error || 'خطأ في جلب الشقق');
      if (!projRes.ok) throw new Error(projJson.error || 'خطأ في جلب المشاريع');

      setApartments(aptsJson.apartments);
      setProjects(projJson.projects);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Fetch summaries for current month ---
  const fetchSummaries = useCallback(async (apts: Apartment[], m: string) => {
    if (apts.length === 0) return;
    try {
      setSummariesLoading(true);
      const results = await Promise.all(
        apts.map(apt =>
          fetch(`/api/accounting/apartments/${apt.id}/summary?month=${m}`)
            .then(r => r.json())
            .then(j => j.data?.summary as ApartmentSummary | undefined)
            .catch(() => undefined)
        )
      );

      const map: Record<string, ApartmentSummary> = {};
      results.forEach(s => {
        if (s) map[s.apartmentId] = s;
      });
      setSummaries(map);
    } finally {
      setSummariesLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    if (apartments.length > 0) {
      fetchSummaries(apartments, month);
    }
  }, [apartments, month, fetchSummaries]);

  // --- Form handlers ---
  const handleCreateApartment = async (data: { name: string; floor?: string; type?: string; projectId: string }) => {
    const res = await fetch('/api/accounting/apartments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطأ في إنشاء الشقة');
    await fetchData();
  };

  const handleUpdateApartment = async (data: { id?: string; name: string; floor?: string; type?: string; projectId: string }) => {
    if (!data.id) return;
    const res = await fetch(`/api/accounting/apartments/${data.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, floor: data.floor, type: data.type, projectId: data.projectId }),
    });
    const json = await res.json();
    if (!res.ok) throw new Error(json.error || 'خطأ في تعديل الشقة');
    await fetchData();
  };

  // --- Filter apartments ---
  const filteredApartments = apartments.filter(apt => {
    if (selectedProject !== 'all' && apt.projectId !== selectedProject) return false;
    if (search && !apt.name.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  // Group by project
  const groupedByProject = filteredApartments.reduce<Record<string, { project: Project | null; apts: Apartment[] }>>((acc, apt) => {
    const pId = apt.projectId;
    if (!acc[pId]) {
      acc[pId] = {
        project: projects.find(p => p.id === pId) || apt.project as Project | null,
        apts: [],
      };
    }
    acc[pId].apts.push(apt);
    return acc;
  }, {});

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="flex items-center justify-between gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <Building2 size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">الشقق</h1>
            <p className="text-sm text-secondary/60 font-dubai">إدارة الشقق والمشاريع</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {canManage && (
            <button
              onClick={() => { setEditApartment(null); setShowForm(true); }}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors"
            >
              <Plus size={16} />
              <span className="hidden sm:inline">إضافة شقة</span>
            </button>
          )}
          <button
            onClick={() => fetchData()}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="تحديث"
          >
            <RefreshCw size={20} className={`text-secondary/60 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => window.dispatchEvent(new CustomEvent('openAccountingMenu'))}
            className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="فتح القائمة"
          >
            <Menu size={28} className="text-secondary" />
          </button>
        </div>
      </motion.div>

      {/* Month Selector */}
      <MonthSelector month={month} onChange={setMonth} />

      {/* Filters */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.1 }}
        className="flex flex-col sm:flex-row gap-3"
      >
        {/* Search */}
        <div className="relative flex-1">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/40" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border-2 border-primary/20 bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
          />
        </div>

        {/* Project Filter */}
        <CustomSelect
          value={selectedProject}
          onChange={setSelectedProject}
          variant="filter"
          className="min-w-[160px]"
          icon={<Filter size={16} className="text-secondary/40" />}
          options={[
            { value: 'all', label: 'كل المشاريع' },
            ...projects.map(p => ({ value: p.id, label: p.name })),
          ]}
        />
      </motion.div>

      {/* Error */}
      {error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-xl text-center">
          <p className="text-red-600 font-dubai text-sm">{error}</p>
          <button onClick={fetchData} className="mt-2 text-sm text-red-500 underline font-dubai">
            إعادة المحاولة
          </button>
        </div>
      )}

      {/* Loading */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      ) : filteredApartments.length === 0 ? (
        <div className="text-center py-16">
          <Building2 size={48} className="text-secondary/20 mx-auto mb-3" />
          <p className="text-secondary/50 font-dubai">
            {search || selectedProject !== 'all' ? 'لا توجد شقق مطابقة للفلتر' : 'لا توجد شقق بعد'}
          </p>
          {canManage && !search && selectedProject === 'all' && (
            <button
              onClick={() => { setEditApartment(null); setShowForm(true); }}
              className="mt-4 px-6 py-2.5 rounded-xl bg-secondary text-white font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors"
            >
              إضافة أول شقة
            </button>
          )}
        </div>
      ) : (
        /* Grouped by Project */
        <div className="space-y-8">
          {Object.entries(groupedByProject).map(([projectId, { project, apts }]) => (
            <motion.div
              key={projectId}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              {/* Project Title */}
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-6 bg-primary rounded-full" />
                <h2 className="text-lg font-bold text-secondary font-dubai">
                  {project?.name || 'بدون مشروع'}
                </h2>
                <span className="text-xs bg-primary/10 text-secondary/60 px-2 py-0.5 rounded-full font-dubai">
                  {apts.length} شقة
                </span>
              </div>

              {/* Apartment Cards Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {apts.map((apt, i) => (
                  <ApartmentCard
                    key={apt.id}
                    apartment={apt}
                    summary={summaries[apt.id] || null}
                    index={i}
                    isLoading={summariesLoading}
                    hideRevenue={isOpsManager}
                  />
                ))}
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Apartment Form Modal */}
      <ApartmentForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditApartment(null); }}
        onSubmit={editApartment ? handleUpdateApartment : handleCreateApartment}
        initialData={editApartment ? {
          id: editApartment.id,
          name: editApartment.name,
          floor: editApartment.floor || '',
          type: editApartment.type || '',
          projectId: editApartment.projectId,
        } : null}
        projects={projects}
      />
    </div>
  );
}
