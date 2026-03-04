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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import ExpenseForm, { type ExpenseFormData } from '@/components/accounting/expenses/ExpenseForm';
import ExpensesList from '@/components/accounting/expenses/ExpensesList';
import ExpenseSummary from '@/components/accounting/expenses/ExpenseSummary';
import CategoryPieChart from '@/components/accounting/expenses/CategoryPieChart';
import { CATEGORY_MAP } from '@/components/accounting/expenses/CategoryBadge';
import ConfirmDialog from '@/components/accounting/shared/ConfirmDialog';
import { useToast } from '@/components/accounting/shared/Toast';

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

const CATEGORY_FILTER_OPTIONS = [
  { value: '', label: 'كل الأقسام' },
  ...Object.entries(CATEGORY_MAP).map(([value, config]) => ({ value, label: config.label })),
];

export default function ExpensesPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const userRole = session?.user?.role;
  const canAdd = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN' || userRole === 'OPS_MANAGER';
  const canEdit = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN' || userRole === 'OPS_MANAGER';
  const canDelete = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN';

  // State
  const [expenses, setExpenses] = useState<ExpenseRow[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [month, setMonth] = useState(getCurrentMonth);
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
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

  // Show charts toggle
  const [showCharts, setShowCharts] = useState(true);

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

      const res = await fetch(`/api/accounting/expenses?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || 'خطأ في جلب المصروفات');

      setExpenses(json.expenses || []);
      setTotals(json.totals || { count: 0, amount: 0 });
      setByCategory(json.byCategory || {});
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsLoading(false);
    }
  }, [month, selectedApartment, selectedCategory]);

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
    return { label: CATEGORY_MAP[top.category]?.label || top.category, amount: top.amount };
  }, [categoryBreakdown]);

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
    if (!res.ok) throw new Error(json.error || 'حدث خطأ أثناء الحفظ');

    toast.success(isEditOp ? 'تم تحديث المصروف بنجاح' : 'تم إضافة المصروف بنجاح');
    await fetchExpenses();
  };

  // --- Delete expense (soft) ---
  const handleDeleteExpense = async () => {
    if (!deleteConfirm) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/accounting/expenses/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'حدث خطأ أثناء الحذف');
      toast.success('تم حذف المصروف بنجاح');
      setDeleteConfirm(null);
      await fetchExpenses();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'حدث خطأ أثناء الحذف');
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
    <div className="p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <Receipt size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary font-dubai">المصروفات</h1>
            <p className="text-sm text-secondary/60 font-dubai">شيت المصروفات حسب الشقة</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchExpenses}
            disabled={isLoading}
            className="p-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
            title="تحديث"
          >
            <RefreshCw size={18} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowCharts(prev => !prev)}
            className={`p-2.5 rounded-xl transition-colors ${showCharts ? 'bg-secondary text-white' : 'bg-primary/10 text-secondary hover:bg-primary/20'}`}
            title={showCharts ? 'إخفاء الرسوم البيانية' : 'إظهار الرسوم البيانية'}
          >
            <BarChart3 size={18} />
          </button>
          {canAdd && (
            <button
              onClick={() => { setEditExpense(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors shadow-sm"
            >
              <Plus size={16} />
              إضافة مصروف
            </button>
          )}
        </div>
      </div>

      {/* Month Selector */}
      <MonthSelector month={month} onChange={setMonth} />

      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-sm">
          <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالوصف أو الملاحظات..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border-2 border-primary/20 bg-white text-secondary font-dubai text-sm focus:outline-none focus:border-primary transition-colors placeholder:text-secondary/30"
          />
        </div>

        {/* Apartment filter */}
        <CustomSelect
          value={selectedApartment}
          onChange={setSelectedApartment}
          variant="filter"
          icon={<Filter size={14} className="text-secondary/30" />}
          options={[
            { value: '', label: 'كل الشقق' },
            ...apartments.map(apt => ({
              value: apt.id,
              label: `${apt.name}${apt.project ? ` (${apt.project.name})` : ''}`,
            })),
          ]}
        />

        {/* Category filter */}
        <CustomSelect
          value={selectedCategory}
          onChange={setSelectedCategory}
          variant="filter"
          options={CATEGORY_FILTER_OPTIONS}
        />
      </div>

      {/* Error */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 rounded-xl p-4 text-red-600 font-dubai text-sm"
        >
          {error}
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
        onEdit={handleEdit}
        onDelete={(e) => setDeleteConfirm(e as ExpenseRow)}
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
        title="حذف المصروف؟"
        message={`سيتم حذف "${deleteConfirm?.description || ''}" بشكل نهائي. لا يمكن التراجع عن هذا الإجراء.`}
        confirmLabel="تأكيد الحذف"
        cancelLabel="إلغاء"
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
