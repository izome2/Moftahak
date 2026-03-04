'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  Users,
  Plus,
  RefreshCw,
  Loader2,
  Info,
  Search,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import InvestorsList from '@/components/accounting/investors/InvestorsList';
import AssignInvestorModal from '@/components/accounting/investors/AssignInvestorModal';
import WithdrawalForm from '@/components/accounting/investors/WithdrawalForm';

// --- Types ---
interface InvestmentInfo {
  id: string;
  percentage: number;
  investmentTarget: number;
  apartment: { id: string; name: string };
  _count: { withdrawals: number };
}

interface InvestorRow {
  id: string;
  firstName: string;
  lastName: string;
  email?: string | null;
  phone?: string | null;
  image?: string | null;
  investments: InvestmentInfo[];
}

interface Apartment {
  id: string;
  name: string;
  project?: { id: string; name: string } | null;
}

export default function InvestorsPage() {
  // Data
  const [investors, setInvestors] = useState<InvestorRow[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Modals
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [withdrawalTarget, setWithdrawalTarget] = useState<InvestorRow | null>(null);

  // Edit/delete state
  const [editInvestment, setEditInvestment] = useState<{
    investmentId: string;
    apartmentId: string;
    investor: InvestorRow;
  } | null>(null);
  const router = useRouter();
  const [deleteConfirm, setDeleteConfirm] = useState<{
    investmentId: string;
    apartmentId: string;
    investor: InvestorRow;
  } | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editPercentage, setEditPercentage] = useState('');
  const [editTarget, setEditTarget] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // --- Fetch investors ---
  const fetchInvestors = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const res = await fetch('/api/accounting/investors');
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'حدث خطأ');
        return;
      }
      setInvestors(json.investors || []);
    } catch {
      setError('فشل الاتصال بالخادم');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // --- Fetch apartments ---
  const fetchApartments = useCallback(async () => {
    try {
      const res = await fetch('/api/accounting/apartments');
      const json = await res.json();
      if (res.ok) setApartments(json.apartments || []);
    } catch { /* silent */ }
  }, []);

  useEffect(() => {
    fetchInvestors();
    fetchApartments();
  }, [fetchInvestors, fetchApartments]);

  // --- Handlers ---
  const handleAddWithdrawal = (investor: InvestorRow) => {
    setWithdrawalTarget(investor);
  };

  const handleViewDetails = (investor: InvestorRow) => {
    router.push(`/accounting/investors/${investor.id}`);
  };

  const handleEditInvestment = (investmentId: string, investor: InvestorRow) => {
    const inv = investor.investments.find(i => i.id === investmentId);
    if (!inv) return;
    setEditInvestment({
      investmentId,
      apartmentId: inv.apartment.id,
      investor,
    });
    setEditPercentage(String((inv.percentage * 100).toFixed(1)));
    setEditTarget(String(inv.investmentTarget || ''));
    setEditError(null);
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editInvestment) return;

    const pct = parseFloat(editPercentage) / 100;
    if (isNaN(pct) || pct < 0.01 || pct > 1) {
      setEditError('النسبة يجب أن تكون بين 1% و 100%');
      return;
    }

    setEditLoading(true);
    setEditError(null);

    try {
      const res = await fetch(
        `/api/accounting/apartments/${editInvestment.apartmentId}/investors/${editInvestment.investmentId}`,
        {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            percentage: pct,
            investmentTarget: editTarget ? parseFloat(editTarget) : 0,
          }),
        }
      );
      const json = await res.json();
      if (!res.ok) {
        setEditError(json.error || 'حدث خطأ');
        return;
      }
      setEditInvestment(null);
      fetchInvestors();
    } catch {
      setEditError('فشل الاتصال بالخادم');
    } finally {
      setEditLoading(false);
    }
  };

  const handleDeleteInvestment = (investmentId: string, investor: InvestorRow) => {
    const inv = investor.investments.find(i => i.id === investmentId);
    if (!inv) return;
    setDeleteConfirm({
      investmentId,
      apartmentId: inv.apartment.id,
      investor,
    });
  };

  const confirmDelete = async () => {
    if (!deleteConfirm) return;
    setIsDeleting(true);

    try {
      const res = await fetch(
        `/api/accounting/apartments/${deleteConfirm.apartmentId}/investors/${deleteConfirm.investmentId}`,
        { method: 'DELETE' }
      );
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || 'حدث خطأ في الحذف');
      } else {
        fetchInvestors();
      }
    } catch {
      setError('فشل الاتصال بالخادم');
    } finally {
      setIsDeleting(false);
      setDeleteConfirm(null);
    }
  };

  // Filter investors by search
  const filteredInvestors = search
    ? investors.filter(inv => {
        const name = `${inv.firstName} ${inv.lastName}`.toLowerCase();
        const email = (inv.email || '').toLowerCase();
        const q = search.toLowerCase();
        return name.includes(q) || email.includes(q);
      })
    : investors;

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-6" dir="rtl">
      {/* Page Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-primary/10 shadow-md border-2 border-primary/30">
            <Users size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">إدارة المستثمرين</h1>
            <p className="text-sm text-secondary/60 font-dubai">
              المستثمرين ونسبهم ومسحوباتهم
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchInvestors}
            disabled={isLoading}
            className="p-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw size={18} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={() => setShowAssignModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 text-sm font-bold
              bg-secondary text-white rounded-xl hover:bg-secondary/90
              transition-all duration-200 font-dubai"
          >
            <Plus className="w-4 h-4" />
            ربط مستثمر بشقة
          </button>
        </div>
      </motion.div>

      {/* Search */}
      <motion.div
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="relative"
      >
        <Search size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/30" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="بحث بالاسم أو البريد..."
          className="w-full pr-10 pl-4 py-2.5 text-sm border-2 border-primary/20 rounded-xl
            bg-white text-secondary font-dubai
            focus:outline-none focus:border-primary transition-colors
            placeholder:text-secondary/30"
        />
      </motion.div>

      {/* Summary */}
      {!isLoading && investors.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex items-center gap-4 text-sm text-secondary/60 font-dubai"
        >
          <span>{investors.length} مستثمر</span>
          <span>
            {investors.reduce((s, inv) => s + inv.investments.length, 0)} استثمار
          </span>
        </motion.div>
      )}

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            className="bg-red-50 border-2 border-red-200 rounded-xl px-4 py-3 text-sm text-red-600
              flex items-center gap-2 font-dubai"
          >
            <Info className="w-4 h-4 shrink-0" />
            {error}
            <button onClick={() => setError(null)} className="mr-auto text-red-400 hover:text-red-600">✕</button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Investors List */}
      <InvestorsList
        investors={filteredInvestors}
        isLoading={isLoading}
        onViewDetails={handleViewDetails}
        onEditInvestment={handleEditInvestment}
        onDeleteInvestment={handleDeleteInvestment}
        onAddWithdrawal={handleAddWithdrawal}
      />

      {/* Assign Investor Modal */}
      <AssignInvestorModal
        isOpen={showAssignModal}
        onClose={() => setShowAssignModal(false)}
        onSuccess={() => fetchInvestors()}
        apartments={apartments}
      />

      {/* Withdrawal Form Modal */}
      {withdrawalTarget && (
        <WithdrawalForm
          isOpen={!!withdrawalTarget}
          onClose={() => setWithdrawalTarget(null)}
          onSuccess={() => fetchInvestors()}
          investorId={withdrawalTarget.id}
          investorName={`${withdrawalTarget.firstName} ${withdrawalTarget.lastName}`}
          investments={withdrawalTarget.investments.map(inv => ({
            id: inv.id,
            apartment: inv.apartment,
            percentage: inv.percentage,
          }))}
        />
      )}

      {/* Edit Investment Modal */}
      <AnimatePresence>
        {editInvestment && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setEditInvestment(null)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm overflow-hidden z-10 border-2 border-primary/20"
            >
                <div className="flex items-center justify-between px-5 py-4 border-b-2 border-primary/10">
                <h2 className="text-base font-bold text-secondary font-dubai">تعديل النسبة</h2>
                <button onClick={() => setEditInvestment(null)} className="text-secondary/40 hover:text-secondary/70">✕</button>
              </div>
              <form onSubmit={handleEditSubmit} className="p-5 space-y-4" dir="rtl">
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1.5 block font-dubai">النسبة (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    max="100"
                    value={editPercentage}
                    onChange={(e) => setEditPercentage(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-primary/20 rounded-xl
                      focus:outline-none focus:border-primary font-dubai"
                    required
                  />
                </div>
                <div>
                  <label className="text-xs font-medium text-secondary/70 mb-1.5 block font-dubai">الهدف السنوي</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={editTarget}
                    onChange={(e) => setEditTarget(e.target.value)}
                    className="w-full px-3 py-2.5 text-sm border-2 border-primary/20 rounded-xl
                      focus:outline-none focus:border-primary font-dubai"
                  />
                </div>
                {editError && (
                  <p className="text-xs text-red-600 font-dubai">{editError}</p>
                )}
                <button
                  type="submit"
                  disabled={editLoading}
                  className="w-full py-2.5 bg-secondary text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-secondary/90 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {editLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {editLoading ? 'جاري الحفظ...' : 'حفظ التعديلات'}
                </button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Delete Confirm Modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDeleteConfirm(null)}
              className="absolute inset-0 bg-black/30 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative bg-white rounded-2xl shadow-xl w-full max-w-sm p-5 z-10 border-2 border-primary/20"
            >
              <h3 className="text-base font-bold text-secondary font-dubai mb-2">
                تأكيد الإزالة
              </h3>
              <p className="text-sm text-secondary/70 font-dubai mb-4">
                هل تريد إزالة <strong>{deleteConfirm.investor.firstName} {deleteConfirm.investor.lastName}</strong> من الشقة؟
                هذا الإجراء لا يمكن التراجع عنه.
              </p>
              <div className="flex items-center gap-2">
                <button
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-2 bg-red-600 text-white rounded-xl text-sm font-bold font-dubai
                    hover:bg-red-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                  {isDeleting ? 'جاري الحذف...' : 'نعم، إزالة'}
                </button>
                <button
                  onClick={() => setDeleteConfirm(null)}
                  className="flex-1 py-2 bg-primary/10 text-secondary rounded-xl text-sm font-medium font-dubai
                    hover:bg-primary/20"
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
}
