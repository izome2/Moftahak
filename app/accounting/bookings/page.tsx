'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import {
  CalendarCheck,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Loader2,
  BarChart3,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import MonthSelector from '@/components/accounting/apartments/MonthSelector';
import CustomSelect from '@/components/accounting/shared/CustomSelect';
import BookingForm, { type BookingFormData } from '@/components/accounting/bookings/BookingForm';
import BookingsList from '@/components/accounting/bookings/BookingsList';
import BookingSummary from '@/components/accounting/bookings/BookingSummary';
import BookingSourceChart from '@/components/accounting/bookings/BookingSourceChart';
import ConfirmDialog from '@/components/accounting/shared/ConfirmDialog';
import { useToast } from '@/components/accounting/shared/Toast';

// --- Types ---
interface Apartment {
  id: string;
  name: string;
  project?: { id: string; name: string } | null;
}

interface BookingRow {
  id: string;
  clientName: string;
  clientPhone?: string | null;
  checkIn: string;
  checkOut: string;
  nights: number;
  amount: number;
  currency: string;
  source: string;
  status: string;
  arrivalTime?: string | null;
  notes?: string | null;
  apartment?: { id: string; name: string } | null;
}

interface SourceBreakdown {
  source: string;
  amount: number;
  count: number;
}

// --- Helpers ---
const getCurrentMonth = () => {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
};

export default function BookingsPage() {
  const { data: session } = useSession();
  const toast = useToast();
  const t = useTranslation();
  const { language } = useLanguage();
  const locale = language === 'ar' ? 'ar-EG' : 'en-US';
  const currency = t.accounting.common.currency;
  const userRole = session?.user?.role;

  const SOURCE_OPTIONS = useMemo(() => [
    { value: '', label: t.accounting.bookingSourceFilters.all },
    { value: 'AIRBNB', label: 'Airbnb' },
    { value: 'BOOKING_COM', label: 'Booking.com' },
    { value: 'EXTERNAL', label: t.accounting.bookingSourceFilters.EXTERNAL },
    { value: 'DIRECT', label: t.accounting.bookingSourceFilters.DIRECT },
    { value: 'OTHER', label: t.accounting.bookingSourceFilters.OTHER },
  ], [t]);

  const STATUS_OPTIONS = useMemo(() => [
    { value: '', label: t.accounting.bookingStatusFilters.all },
    { value: 'CONFIRMED', label: t.accounting.bookingStatusFilters.CONFIRMED },
    { value: 'CHECKED_IN', label: t.accounting.bookingStatusFilters.CHECKED_IN },
    { value: 'CHECKED_OUT', label: t.accounting.bookingStatusFilters.CHECKED_OUT },
    { value: 'CANCELLED', label: t.accounting.bookingStatusFilters.CANCELLED },
  ], [t]);
  const canAdd = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN' || userRole === 'BOOKING_MANAGER';
  const canEdit = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN' || userRole === 'BOOKING_MANAGER';
  const canDelete = userRole === 'GENERAL_MANAGER' || userRole === 'ADMIN';
  const hideFinancials = userRole === 'BOOKING_MANAGER';

  // State
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [month, setMonth] = useState(getCurrentMonth);
  const [selectedApartment, setSelectedApartment] = useState<string>('');
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [selectedStatus, setSelectedStatus] = useState<string>('');
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Totals from API (DB aggregation)
  const [totals, setTotals] = useState({ count: 0, amount: 0, nights: 0 });

  // Form state
  const [showForm, setShowForm] = useState(false);
  const [editBooking, setEditBooking] = useState<BookingFormData | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<BookingRow | null>(null);
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

  // --- Fetch bookings ---
  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      const params = new URLSearchParams({ month });
      if (selectedApartment) params.set('apartmentId', selectedApartment);
      if (selectedSource) params.set('source', selectedSource);
      if (selectedStatus) params.set('status', selectedStatus);

      const res = await fetch(`/api/accounting/bookings?${params}`);
      const json = await res.json();

      if (!res.ok) throw new Error(json.error || t.accounting.errors.fetchBookings);

      setBookings(json.bookings || []);
      setTotals(json.totals || { count: 0, amount: 0, nights: 0 });
    } catch (err) {
      setError(err instanceof Error ? err.message : t.accounting.errors.unexpected);
    } finally {
      setIsLoading(false);
    }
  }, [month, selectedApartment, selectedSource, selectedStatus]);

  useEffect(() => {
    fetchApartments();
  }, [fetchApartments]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  // --- Compute source breakdown (from client data) ---
  const sourceBreakdown = useMemo<SourceBreakdown[]>(() => {
    const map = new Map<string, { amount: number; count: number }>();
    for (const b of bookings) {
      if (b.status === 'CANCELLED') continue;
      const curr = map.get(b.source) || { amount: 0, count: 0 };
      curr.amount += b.amount;
      curr.count += 1;
      map.set(b.source, curr);
    }
    return Array.from(map.entries()).map(([source, data]) => ({ source, ...data }));
  }, [bookings]);

  // --- Compute apartment revenue comparison ---
  const apartmentRevenue = useMemo(() => {
    const map = new Map<string, { name: string; revenue: number }>();
    for (const b of bookings) {
      if (b.status === 'CANCELLED') continue;
      const key = b.apartment?.id || 'unknown';
      const curr = map.get(key) || { name: b.apartment?.name || '—', revenue: 0 };
      curr.revenue += b.amount;
      map.set(key, curr);
    }
    return Array.from(map.values()).sort((a, b) => b.revenue - a.revenue);
  }, [bookings]);

  // --- Unique apartments count ---
  const activeApartmentsCount = useMemo(() => {
    const set = new Set<string>();
    for (const b of bookings) {
      if (b.status !== 'CANCELLED' && b.apartment?.id) set.add(b.apartment.id);
    }
    return set.size;
  }, [bookings]);

  // --- Search filter (client-side) ---
  const filteredBookings = useMemo(() => {
    if (!search.trim()) return bookings;
    const q = search.trim().toLowerCase();
    return bookings.filter(
      b =>
        b.clientName.toLowerCase().includes(q) ||
        b.clientPhone?.toLowerCase().includes(q) ||
        b.apartment?.name?.toLowerCase().includes(q)
    );
  }, [bookings, search]);

  // --- Create / Update booking ---
  const handleSubmitBooking = async (data: BookingFormData) => {
    const isEditOp = !!data.id;
    const url = isEditOp ? `/api/accounting/bookings/${data.id}` : '/api/accounting/bookings';
    const method = isEditOp ? 'PUT' : 'POST';

    const body = {
      apartmentId: data.apartmentId,
      clientName: data.clientName,
      clientPhone: data.clientPhone || undefined,
      source: data.source,
      checkIn: data.checkIn,
      checkOut: data.checkOut,
      nights: data.nights,
      amount: data.amount,
      currency: data.currency || 'USD',
      arrivalTime: data.arrivalTime || undefined,
      notes: data.notes || undefined,
      ...(isEditOp ? { status: data.status } : {}),
    };

    const res = await fetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    const json = await res.json();
    if (!res.ok) throw new Error(json.error || t.accounting.errors.saveFailed);

    toast.success(isEditOp ? t.accounting.success.bookingUpdated : t.accounting.success.bookingAdded);
    await fetchBookings();
  };

  // --- Delete booking (soft) ---
  const handleDeleteBooking = async () => {
    if (!deleteConfirm) return;
    try {
      setIsDeleting(true);
      const res = await fetch(`/api/accounting/bookings/${deleteConfirm.id}`, { method: 'DELETE' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t.accounting.errors.deleteFailed);
      toast.success(t.accounting.success.bookingDeleted);
      setDeleteConfirm(null);
      await fetchBookings();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : t.accounting.errors.deleteFailed);
    } finally {
      setIsDeleting(false);
    }
  };

  // --- Edit handler ---
  const handleEdit = (booking: BookingRow) => {
    setEditBooking({
      id: booking.id,
      apartmentId: booking.apartment?.id || '',
      clientName: booking.clientName,
      clientPhone: booking.clientPhone || '',
      source: booking.source,
      checkIn: booking.checkIn,
      checkOut: booking.checkOut,
      nights: booking.nights,
      amount: booking.amount,
      currency: booking.currency || 'USD',
      arrivalTime: booking.arrivalTime || '',
      notes: booking.notes || '',
      status: booking.status,
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
            <CalendarCheck size={24} className="text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-secondary font-dubai">{t.accounting.bookings.title}</h1>
            <p className="text-sm text-secondary/60 font-dubai">
              {hideFinancials ? t.accounting.bookings.subtitle : t.accounting.bookings.altSubtitle}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchBookings}
            disabled={isLoading}
            className="p-2.5 bg-primary/10 hover:bg-primary/20 rounded-xl transition-colors"
            title={t.accounting.common.refresh}
          >
            <RefreshCw size={18} className={`text-secondary ${isLoading ? 'animate-spin' : ''}`} />
          </button>
          {!hideFinancials && (
            <button
              onClick={() => setShowCharts(prev => !prev)}
              className={`p-2.5 rounded-xl transition-colors ${showCharts ? 'bg-secondary text-white' : 'bg-primary/10 text-secondary hover:bg-primary/20'}`}
              title={showCharts ? t.accounting.common.hideCharts : t.accounting.common.showCharts}
            >
              <BarChart3 size={18} />
            </button>
          )}
          {canAdd && (
            <button
              onClick={() => { setEditBooking(null); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-secondary text-white rounded-xl font-dubai text-sm font-bold hover:bg-secondary/90 transition-colors shadow-sm"
            >
              <Plus size={16} />
              {t.accounting.bookings.addBooking}
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
            placeholder={t.accounting.bookings.searchPlaceholder}
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
            { value: '', label: t.accounting.bookings.allApartments },
            ...apartments.map(apt => ({
              value: apt.id,
              label: `${apt.name}${apt.project ? ` (${apt.project.name})` : ''}`,
            })),
          ]}
        />

        {/* Source filter */}
        <CustomSelect
          value={selectedSource}
          onChange={setSelectedSource}
          variant="filter"
          options={SOURCE_OPTIONS}
        />

        {/* Status filter */}
        <CustomSelect
          value={selectedStatus}
          onChange={setSelectedStatus}
          variant="filter"
          options={STATUS_OPTIONS}
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
      <BookingSummary
        totalRevenue={hideFinancials ? undefined : totals.amount}
        totalBookings={totals.count}
        totalNights={totals.nights}
        apartmentsCount={activeApartmentsCount}
        isLoading={isLoading}
        hideFinancials={hideFinancials}
      />

      {/* Charts */}
      {showCharts && !hideFinancials && (
        <BookingSourceChart
          sourceData={sourceBreakdown}
          apartmentData={apartmentRevenue}
          isLoading={isLoading}
        />
      )}

      {/* Bookings Table */}
      <BookingsList
        bookings={filteredBookings}
        totalAmount={hideFinancials ? undefined : totals.amount}
        totalNights={totals.nights}
        totalCount={totals.count}
        isLoading={isLoading}
        showApartment={!selectedApartment}
        canEdit={canEdit}
        canDelete={canDelete}
        onEdit={handleEdit}
        onDelete={(b) => setDeleteConfirm(b as BookingRow)}
        hideFinancials={hideFinancials}
      />

      {/* Booking Form Modal */}
      <BookingForm
        isOpen={showForm}
        onClose={() => { setShowForm(false); setEditBooking(null); }}
        onSubmit={handleSubmitBooking}
        initialData={editBooking}
        apartments={formApartments}
        hideFinancials={hideFinancials}
        blockPastDates={hideFinancials}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!deleteConfirm}
        onClose={() => !isDeleting && setDeleteConfirm(null)}
        onConfirm={handleDeleteBooking}
        title={t.accounting.bookings.deleteBooking}
        message={t.accounting.bookings.deleteConfirm(deleteConfirm?.clientName || '')}
        confirmLabel={t.accounting.common.confirmDelete}
        cancelLabel={t.accounting.common.cancel}
        variant="danger"
        isLoading={isDeleting}
      />
    </div>
  );
}
