'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Receipt,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  BarChart3,
  XCircle,
  MessageSquare,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import ExpenseForm, { type ExpenseFormData } from '@/components/accounting/expenses/ExpenseForm';
import ExpensesList from '@/components/accounting/expenses/ExpensesList';
import ExpenseSummary from '@/components/accounting/expenses/ExpenseSummary';
import CategoryPieChart from '@/components/accounting/expenses/CategoryPieChart';
import { CATEGORY_STYLE_MAP } from '@/components/accounting/expenses/CategoryBadge';
import ConfirmDialog from '@/components/accounting/shared/ConfirmDialog';
import { useToast } from '@/components/accounting/shared/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { useChartsVisibility } from '@/hooks/useChartsVisibility';

// --- Types ---
interface Apartment {
  id: string;
  name: string;
  project?: { id: string; name: string } | null;
}

interface ExpenseRow {
  id: string;
  description: string;
  category: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string | null;
  apartment?: { id: string; name: string } | null;
  approvalStatus?: string;
  rejectionReason?: string | null;
}

interface CategoryBreakdown {
  category: string;
  amount: number;
  count: number;
}

// --- Helpers ---
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function ExpensesPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const t = useTranslation();
  const { language } = useLanguage();
  const userRole = session?.user?.role;
  const canAdd = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN' || userRole === 'OPS_MANAGER';
  const canEdit = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN' || userRole === 'OPS_MANAGER';
  const canDelete = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN';
  const canApprove = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN';

  // State
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [month, setMonth] = useState(getCurrentMonth);
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Totals from API (DB aggregation)
  const [totals, setTotals] = useState({ count: 0, amount: 0 });
  const [byCategory, setByCategory] = useState<Record<string, { amount: number; count: number }>>({});

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editExpense, setEditExpense] = useState<ExpenseFormData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<ExpenseRow | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Approval state
  const [approveConfirm, setApproveConfirm] = useState<ExpenseRow | null>(null);
  const [rejectTarget, setRejectTarget] = useState<ExpenseRow | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [isApproving, setIsApproving] = useState(false);

  // Show charts toggle
  const { showCharts, toggleCharts } = useChartsVisibility();

  // --- Fetch apartments ---
  const fetchApartments = useCallback(async () => {
    try {
      const res = await fetch('/api/accounting/apartments');
      const json = await res.json();
      if (res.ok) setApartments(json.apartments || []);
    } catch { /* silent */ }
  }, []);

  // --- Fetch expenses ---
  const fetchExpenses = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ month });
      if (selectedApartment) params.set('apartmentId', selectedApartment);
      if (selectedCategory) params.set('category', selectedCategory);
      if (selectedStatus) params.set('approvalStatus', selectedStatus);

      const res = await fetch(`/api/accounting/expenses?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || t.accounting.errors.fetchExpenses);

      setExpenses(json.expenses || []);
      setTotals(json.totals || { count: 0, amount: 0 });
      setByCategory(json.byCategory || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsLoading(false);
    }
  }, [month, selectedApartment, selectedCategory, selectedStatus]);

  useEffect(() => { fetchApartments(); }, [fetchApartments]);
  useEffect(() => { fetchExpenses(); }, [fetchExpenses]);

  // --- Compute category breakdown for chart ---
  const categoryBreakdown = useMemo<CategoryBreakdown[]>(() => {
    return Object.entries(byCategory)
      .map(([category, data]) => ({ category, amount: data.amount, count: data.count }))
      .filter(d => d.amount > 0)
      .sort((a, b) => b.amount - a.amount);
  }, [byCategory]);

  // --- Compute apartment expense comparison ---
  const apartmentExpenses = useMemo(() => {
    const map = new Map<string, { name: string; expense: number }>();
    for (const e of expenses) {
      const key = e.apartment?.id || 'unknown';
      const curr = map.get(key) || { name: e.apartment?.name || '—', expense: 0 };
      curr.expense += e.amount;
      map.set(key, curr);
    }
    return Array.from(map.values()).sort((a, b) => b.expense - a.expense);
  }, [expenses]);

  // --- Unique apartments count ---
  const activeApartmentsCount = useMemo(() => {
    const set = new Set<string>();
    for (const e of expenses) {
      if (e.apartment?.id) set.add(e.apartment.id);
    }
    return set.size;
  }, [expenses]);

  // --- Top category ---
  const topCategory = useMemo(() => {
    if (categoryBreakdown.length === 0) return null;
    const top = categoryBreakdown[0];
    const expenseCatsShort = t.accounting.expenseCategoriesShort as Record<string, string>;
    return { label: expenseCatsShort[top.category] || top.category, amount: top.amount };
  }, [categoryBreakdown, t]);

  // --- Search filter (client-side) ---
  const filteredExpenses = useMemo(() => {
    if (!search.trim()) return expenses;
    const q = search.trim().toLowerCase();
    return expenses.filter(
      e =>
        e.description.toLowerCase().includes(q) ||
        e.notes?.toLowerCase().includes(q) ||
        e.apartment?.name?.toLowerCase().includes(q)
    );
  }, [expenses, search]);

  // --- Create / Update expense ---
  const handleSubmitExpense = async (data: ExpenseFormData) => {
    const isEditOp = !!data.id;
    const url = isEditOp ? `/api/accounting/expenses/${data.id}` : '/api/accounting/expenses';
    const method = isEditOp ? 'PUT' : 'POST';

    const body = {
      apartmentId: data.apartmentId,
      description: data.description,
      category: data.category,
      amount: data.amount,
      currency: data.currency || 'USD',
      date: data.date,
      notes: data.notes || undefined,
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || t.accounting.errors.saveFailed);

    toast.success(isEditOp ? t.accounting.success.expenseUpdated : t.accounting.success.expenseAdded);
    await fetchExpenses();
  };

  // --- Delete expense (soft) ---
  const handleDeleteExpense = async () => {
    if (!deleteConfirm) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/accounting/expenses/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t.accounting.errors.deleteFailed);
      toast.success(t.accounting.success.expenseDeleted);
      setDeleteConfirm(null);
      await fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.accounting.errors.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Edit handler ---
  const handleEdit = (expense: ExpenseRow) => {
    setEditExpense({
      id: expense.id,
      apartmentId: expense.apartment?.id || '',
      description: expense.description,
      category: expense.category,
      amount: expense.amount,
      currency: expense.currency || 'USD',
      date: expense.date,
      notes: expense.notes || '',
    });
    setShowForm(true);
  };

  // --- Approve handler ---
  const handleApprove = async () => {
    if (!approveConfirm) return;
    try {
      setIsApproving(true);
      const res = await fetch(`/api/accounting/expenses/${approveConfirm.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'approve' }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t.accounting.errors.unexpected);
      toast.success(t.accounting.expenses.approvedSuccess);
      setApproveConfirm(null);
      await fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsApproving(false);
    }
  };

  // --- Reject handler ---
  const handleReject = async () => {
    if (!rejectTarget || !rejectionReason.trim()) return;
    try {
      setIsApproving(true);
      const res = await fetch(`/api/accounting/expenses/${rejectTarget.id}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reject', rejectionReason: rejectionReason.trim() }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t.accounting.errors.unexpected);
      toast.success(t.accounting.expenses.rejectedSuccess);
      setRejectTarget(null);
      setRejectionReason('');
      await fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsApproving(false);
    }
  };

  // --- Group apartments for form selector ---
  const formApartments = useMemo(
    () => apartments.map(a => ({
      id: a.id,
      name: a.name,
      project: a.project ? { name: a.project.name } : null,
    })),
    [apartments],
  );

  return (
    <div className="flex-1 flex flex-col gap-3">
      {/* Header + Filters */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] p-3 sm:p-4 md:p-5 lg:p-6 space-y-2 sm:space-y-3">
      {/* Title + Actions */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-br from-secondary to-secondary/80 shadow-lg flex items-center justify-center shrink-0">
            <Receipt size={16} className="text-white sm:w-5 sm:h-5" />
          </div>
          <div className="min-w-0">
            <h1 className="text-base sm:text-xl md:text-2xl font-bold text-secondary font-dubai tracking-tight truncate">{t.accounting.expenses.title}</h1>
            <p className="text-xs text-secondary font-dubai mt-0.5 hidden sm:block">{t.accounting.expenses.subtitle}</p>
          </div>
        </div>
        <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={fetchExpenses}
              disabled={isLoading}
              className="p-2 sm:p-2.5 hover:bg-secondary/5 rounded-xl transition-all"
              title={t.accounting.common.refresh}
            >
              <RefreshCw size={15} className={`text-secondary/90 sm:w-4 sm:h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
            <button
              onClick={toggleCharts}
              className={`p-2 sm:p-2.5 rounded-xl transition-all ${showCharts ? 'bg-secondary/8 text-secondary' : 'hover:bg-secondary/5 text-secondary/90'}`}
              aria-label={showCharts ? t.accounting.common.hideCharts : t.accounting.common.showCharts}
            >
              <BarChart3 size={15} className="sm:w-4 sm:h-4" />
            </button>
            {canAdd && (
              <button
                onClick={() => { setEditExpense(null); setShowForm(true); }}
                className="flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-secondary to-secondary/90 text-white rounded-xl font-dubai text-xs sm:text-sm font-bold hover:shadow-lg hover:shadow-secondary/20 transition-all duration-300"
              >
                <Plus size={14} className="sm:w-4 sm:h-4" />
                {t.accounting.expenses.addExpense}
              </button>
            )}
        </div>
      </div>

      {/* Month Selector */}
      <div className="flex items-center justify-center">
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      {/* Filters */}
      <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
              <CustomSelect
                value={selectedApartment}
                onChange={setSelectedApartment}
                variant="filter"
                icon={<Filter size={13} className="text-secondary/80" />}
                options={[
                  { value: '', label: t.accounting.expenses.allApartments },
                  ...apartments.map(apt => ({
                    value: apt.id,
                    label: `${apt.name}${apt.project ? ` (${apt.project.name})` : ''}`,
                  })),
                ]}
              />
              <CustomSelect
                value={selectedCategory}
                onChange={setSelectedCategory}
                variant="filter"
                options={[
                  { value: '', label: t.accounting.expenses.allCategories },
                  ...Object.keys(CATEGORY_STYLE_MAP).map(key => ({
                    value: key,
                    label: (t.accounting.expenseCategoriesShort as Record<string, string>)[key] || key,
                  })),
                ]}
              />
              {canApprove && (
                <CustomSelect
                  value={selectedStatus}
                  onChange={setSelectedStatus}
                  variant="filter"
                  options={[
                    { value: '', label: t.accounting.expenses.allStatuses },
                    { value: 'PENDING', label: t.accounting.expenses.statusPENDING },
                    { value: 'APPROVED', label: t.accounting.expenses.statusAPPROVED },
                    { value: 'REJECTED', label: t.accounting.expenses.statusREJECTED },
                  ]}
                />
              )}
          <div className="relative col-span-full sm:col-span-1 sm:max-w-xs">
            <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-primary/90" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={t.accounting.expenses.searchPlaceholder}
              className="w-full pr-10 pl-4 py-2.5 rounded-xl border-2 border-primary/20 bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-primary/40 transition-colors placeholder:text-secondary/90"
            />
          </div>
      </div>
      </div>

      {/* Content */}
      <div className="bg-white/95 rounded-2xl shadow-sm border border-secondary/[0.08] flex-1 p-3 sm:p-4 md:p-6 lg:p-8 space-y-4 sm:space-y-5 overflow-y-auto">

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50/80 border border-red-200/60 rounded-xl p-4 text-center backdrop-blur-sm"
        >
          <p className="text-red-600 font-dubai text-sm">{error}</p>
          <button
            onClick={fetchExpenses}
            className="mt-2 text-xs text-red-500 hover:text-red-700 font-dubai font-bold transition-colors"
          >
            {t.accounting.common.retry}
          </button>
        </motion.div>
      )}

      {/* Summary Cards */}
      <ExpenseSummary
        totalExpenses={totals.amount}
        totalCount={totals.count}
        apartmentsCount={activeApartmentsCount}
        topCategory={topCategory}
        isLoading={isLoading}
      />

      {/* Charts */}
      {showCharts && (
        <CategoryPieChart
          categoryData={categoryBreakdown}
          apartmentData={apartmentExpenses}
          isLoading={isLoading}
        />
      )}

      {/* Expenses Table */}
      <ExpensesList
        expenses={filteredExpenses}
        totalAmount={totals.amount}
        totalCount={totals.count}
        isLoading={isLoading}
        showApartment={!selectedApartment}
        canEdit={canEdit}
        canDelete={canDelete}
        canApprove={canApprove}
        onEdit={handleEdit}
        onDelete={(e) => setDeleteConfirm(e as ExpenseRow)}
        onApprove={(e) => setApproveConfirm(e as ExpenseRow)}
        onReject={(e) => setRejectTarget(e as ExpenseRow)}
      />

      {/* Expense Form Modal */}
      <ExpenseForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditExpense(null); }}
        onSubmit={handleSubmitExpense}
        initialData={editExpense}
        apartments={formApartments}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => !isDeleting && setDeleteConfirm(null)}
        onConfirm={handleDeleteExpense}
        title={t.accounting.expenses.deleteExpense}
        message={t.accounting.expenses.deleteConfirm(deleteConfirm?.description || '')}
        confirmLabel={t.accounting.common.confirmDelete}
        cancelLabel={t.accounting.common.cancel}
        variant="danger"
        isLoading={isDeleting}
      />

      {/* Approve Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!approveConfirm}
        onClose={() => !isApproving && setApproveConfirm(null)}
        onConfirm={handleApprove}
        title={t.accounting.expenses.approveConfirm}
        message={t.accounting.expenses.approveConfirmMsg}
        confirmLabel={t.accounting.expenses.approve}
        cancelLabel={t.accounting.common.cancel}
        variant="info"
        isLoading={isApproving}
      />

      {/* Rejection Reason Dialog */}
      {rejectTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => !isApproving && (setRejectTarget(null), setRejectionReason(''))} />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
            className="relative w-full max-w-md bg-white rounded-2xl border border-secondary/[0.08] shadow-[0_25px_60px_-12px_rgba(0,0,0,0.25)] overflow-hidden"
          >
            <div className="flex items-center gap-2.5 px-5 py-4 border-b border-secondary/[0.06]">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-rose-500/80 flex items-center justify-center">
                <XCircle size={15} className="text-white" />
              </div>
              <div>
                <h3 className="text-base font-bold text-secondary font-dubai tracking-tight">{t.accounting.expenses.rejectionReasonTitle}</h3>
                <p className="text-[11px] text-secondary/90 font-dubai">{rejectTarget.description}</p>
              </div>
            </div>
            <div className="p-5 space-y-5">
              <div>
                <label className="flex items-center gap-1.5 mb-2">
                  <span className="w-5 h-5 rounded-md bg-secondary/[0.06] flex items-center justify-center shrink-0">
                    <MessageSquare size={11} className="text-secondary/90" />
                  </span>
                  <span className="text-[13px] font-bold text-secondary font-dubai">{t.accounting.expenses.rejectionReasonTitle}</span>
                  <span className="text-red-400 text-xs">*</span>
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder={t.accounting.expenses.rejectionReasonPlaceholder}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-secondary/[0.08] bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-secondary/20 focus:ring-[3px] focus:ring-secondary/[0.04] transition-all placeholder:text-secondary/80 resize-none h-24"
                  dir="rtl"
                />
              </div>
              {rejectionReason.trim() === '' && (
                <p className="text-sm text-red-500 font-dubai bg-red-50/80 p-2.5 rounded-xl border border-red-100">{t.accounting.expenses.rejectionReasonRequired}</p>
              )}
              <div className="flex items-center gap-3">
                <button
                  onClick={() => { setRejectTarget(null); setRejectionReason(''); }}
                  disabled={isApproving}
                  className="flex-1 py-2.5 rounded-xl border border-secondary/[0.08] text-secondary/90 font-dubai text-sm font-bold hover:bg-secondary/[0.02] transition-colors"
                >
                  {t.accounting.common.cancel}
                </button>
                <button
                  onClick={handleReject}
                  disabled={isApproving || !rejectionReason.trim()}
                  className="flex-1 py-2.5 rounded-xl bg-red-600 text-white font-dubai text-sm font-bold hover:bg-red-700 hover:shadow-lg hover:shadow-red-600/15 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isApproving ? <Loader2 size={16} className="animate-spin" /> : t.accounting.expenses.reject}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
      </div>
    </div>
  );
}
