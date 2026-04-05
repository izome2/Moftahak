'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { 
  ClipboardList, Search, Loader2, Menu, CheckCircle2, 
  Clock, XCircle, RefreshCw, DollarSign, Users, TrendingUp,
  ChevronLeft, ChevronRight
} from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatCoursePrice } from '@/lib/courses/utils';

type EnrollmentStatus = 'PENDING' | 'CONFIRMED' | 'EXPIRED' | 'REFUNDED';

interface Enrollment {
  id: string;
  paymentCode: string;
  status: EnrollmentStatus;
  phone: string;
  amount: number;
  completedLessons: number;
  lastAccessedAt: string | null;
  createdAt: string;
  user: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    image: string | null;
  };
  course: {
    id: string;
    title: string;
    slug: string;
    price: number;
  };
}

interface Stats {
  totalEnrollments: number;
  pendingEnrollments: number;
  confirmedEnrollments: number;
  totalRevenue: number;
}

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

const statusConfig: Record<EnrollmentStatus, { icon: React.ElementType; color: string; bg: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-600', bg: 'bg-amber-100' },
  CONFIRMED: { icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-100' },
  EXPIRED: { icon: XCircle, color: 'text-red-600', bg: 'bg-red-100' },
  REFUNDED: { icon: RefreshCw, color: 'text-blue-600', bg: 'bg-blue-100' },
};

export default function EnrollmentsPage() {
  const { data: session, status: authStatus } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { language } = useLanguage();

  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [stats, setStats] = useState<Stats>({ totalEnrollments: 0, pendingEnrollments: 0, confirmedEnrollments: 0, totalRevenue: 0 });
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const ep = t.admin.enrollmentsPage;

  useEffect(() => {
    if (authStatus === 'unauthenticated') router.push('/');
    else if (authStatus === 'authenticated' && session?.user?.role !== 'ADMIN') router.push('/');
  }, [authStatus, session, router]);

  const fetchEnrollments = useCallback(async (page = 1) => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({ page: String(page), limit: '20' });
      if (filterStatus !== 'all') params.set('status', filterStatus);
      if (search.trim()) params.set('search', search.trim());

      const res = await fetch(`/api/admin/courses/enrollments?${params}`);
      const data = await res.json();

      if (res.ok) {
        setEnrollments(data.enrollments);
        setPagination(data.pagination);
        setStats(data.stats);
      }
    } catch {
      // silent
    } finally {
      setIsLoading(false);
    }
  }, [filterStatus, search]);

  useEffect(() => {
    if (authStatus === 'authenticated' && session?.user?.role === 'ADMIN') {
      fetchEnrollments(1);
    }
  }, [authStatus, session, fetchEnrollments]);

  const handleAction = async (enrollmentId: string, action: 'confirm' | 'reject' | 'refund') => {
    const confirmMessages: Record<string, string> = {
      confirm: ep.confirmConfirm,
      reject: ep.confirmReject,
      refund: ep.confirmRefund,
    };

    if (!window.confirm(confirmMessages[action])) return;

    setActionLoading(enrollmentId);
    try {
      const res = await fetch(`/api/admin/courses/enrollments/${enrollmentId}/${action}`, {
        method: 'POST',
      });
      const data = await res.json();

      if (res.ok) {
        // تحديث الطلب في القائمة
        setEnrollments(prev =>
          prev.map(e => {
            if (e.id === enrollmentId) {
              const newStatus: Record<string, EnrollmentStatus> = {
                confirm: 'CONFIRMED',
                reject: 'EXPIRED',
                refund: 'REFUNDED',
              };
              return { ...e, status: newStatus[action] };
            }
            return e;
          })
        );
        // إعادة جلب الإحصائيات
        fetchEnrollments(pagination.page);
      } else {
        alert(data.error || ep.error);
      }
    } catch {
      alert(ep.error);
    } finally {
      setActionLoading(null);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  if (authStatus === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  const filterTabs: { key: string; label: string }[] = [
    { key: 'all', label: ep.allEnrollments },
    { key: 'PENDING', label: ep.pending },
    { key: 'CONFIRMED', label: ep.confirmed },
    { key: 'EXPIRED', label: ep.expired },
    { key: 'REFUNDED', label: ep.refunded },
  ];

  const statsCards = [
    { label: ep.totalEnrollments, value: stats.totalEnrollments, icon: ClipboardList, color: 'text-secondary' },
    { label: ep.pendingCount, value: stats.pendingEnrollments, icon: Clock, color: 'text-amber-600' },
    { label: ep.confirmedCount, value: stats.confirmedEnrollments, icon: CheckCircle2, color: 'text-emerald-600' },
    { label: ep.totalRevenue, value: `${formatCoursePrice(stats.totalRevenue)} ${ep.egp}`, icon: DollarSign, color: 'text-primary' },
  ];

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex items-center justify-between gap-3"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">{ep.title}</h1>
          <p className="text-sm text-secondary/60 font-dubai mt-1">{ep.subtitle}</p>
        </div>
        <button
          onClick={() => {
            const event = new CustomEvent('openAdminMenu');
            window.dispatchEvent(event);
          }}
          className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
        >
          <Menu size={28} className="text-secondary" />
        </button>
      </motion.div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        {statsCards.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-white border-2 border-primary/20 rounded-2xl p-4 shadow-[0_4px_20px_rgba(237,191,140,0.15)]"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <Icon className={`w-5 h-5 ${card.color}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-secondary/60 font-dubai truncate">{card.label}</p>
                  <p className="text-lg font-bold text-secondary font-dubai">{card.value}</p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-secondary/40" />
          <input
            type="text"
            placeholder={ep.searchPlaceholder}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && fetchEnrollments(1)}
            className="w-full pr-10 pl-4 py-2.5 bg-white border-2 border-primary/20 rounded-xl font-dubai text-sm focus:border-primary focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterStatus(tab.key)}
            className={`px-4 py-2 rounded-xl text-sm font-dubai whitespace-nowrap transition-colors ${
              filterStatus === tab.key
                ? 'bg-primary text-white shadow-[0_4px_15px_rgba(237,191,140,0.4)]'
                : 'bg-white border-2 border-primary/20 text-secondary hover:bg-primary/10'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="bg-white border-2 border-primary/20 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] overflow-hidden"
      >
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : enrollments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3">
            <ClipboardList className="w-12 h-12 text-secondary/30" />
            <p className="text-secondary/60 font-dubai font-semibold">{ep.noEnrollments}</p>
            <p className="text-sm text-secondary/40 font-dubai">
              {search.trim() ? ep.tryDifferentSearch : ep.noEnrollmentsDesc}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-accent/50 border-b-2 border-primary/10">
                  <tr>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.paymentCode}</th>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.studentName}</th>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.courseName}</th>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.amount}</th>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.phone}</th>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.status}</th>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.date}</th>
                    <th className="px-4 py-3 text-right font-dubai font-semibold text-secondary">{ep.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {enrollments.map((enrollment) => {
                    const statusInfo = statusConfig[enrollment.status];
                    const StatusIcon = statusInfo.icon;
                    return (
                      <tr
                        key={enrollment.id}
                        className="border-b border-primary/10 hover:bg-accent/20 transition-colors"
                      >
                        <td className="px-4 py-3">
                          <span className="font-mono text-sm font-bold text-secondary bg-accent/50 px-2 py-1 rounded-lg">
                            {enrollment.paymentCode}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="font-dubai font-semibold text-secondary">
                            {enrollment.user.firstName} {enrollment.user.lastName}
                          </div>
                          <div className="text-xs text-secondary/50 font-dubai">{enrollment.user.email}</div>
                        </td>
                        <td className="px-4 py-3 font-dubai text-secondary max-w-[200px] truncate">
                          {enrollment.course.title}
                        </td>
                        <td className="px-4 py-3 font-dubai font-semibold text-secondary">
                          {formatCoursePrice(enrollment.amount)} {ep.egp}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs text-secondary/70" dir="ltr">
                          {enrollment.phone}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-dubai ${statusInfo.bg} ${statusInfo.color}`}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {ep.statusLabels[enrollment.status]}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs text-secondary/60 font-dubai">
                          {formatDate(enrollment.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-1.5">
                            {enrollment.status === 'PENDING' && (
                              <>
                                <button
                                  onClick={() => handleAction(enrollment.id, 'confirm')}
                                  disabled={actionLoading === enrollment.id}
                                  className="p-1.5 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors disabled:opacity-50"
                                  title={ep.confirmPayment}
                                >
                                  {actionLoading === enrollment.id ? (
                                    <Loader2 className="w-4 h-4 animate-spin" />
                                  ) : (
                                    <CheckCircle2 className="w-4 h-4" />
                                  )}
                                </button>
                                <button
                                  onClick={() => handleAction(enrollment.id, 'reject')}
                                  disabled={actionLoading === enrollment.id}
                                  className="p-1.5 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-colors disabled:opacity-50"
                                  title={ep.rejectRequest}
                                >
                                  <XCircle className="w-4 h-4" />
                                </button>
                              </>
                            )}
                            {enrollment.status === 'CONFIRMED' && (
                              <button
                                onClick={() => handleAction(enrollment.id, 'refund')}
                                disabled={actionLoading === enrollment.id}
                                className="p-1.5 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-colors disabled:opacity-50"
                                title={ep.refund}
                              >
                                {actionLoading === enrollment.id ? (
                                  <Loader2 className="w-4 h-4 animate-spin" />
                                ) : (
                                  <RefreshCw className="w-4 h-4" />
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-primary/10">
              {enrollments.map((enrollment) => {
                const statusInfo = statusConfig[enrollment.status];
                const StatusIcon = statusInfo.icon;
                return (
                  <div key={enrollment.id} className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-sm font-bold text-secondary bg-accent/50 px-2 py-1 rounded-lg">
                        {enrollment.paymentCode}
                      </span>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-dubai ${statusInfo.bg} ${statusInfo.color}`}>
                        <StatusIcon className="w-3.5 h-3.5" />
                        {ep.statusLabels[enrollment.status]}
                      </span>
                    </div>
                    <div>
                      <p className="font-dubai font-semibold text-secondary">
                        {enrollment.user.firstName} {enrollment.user.lastName}
                      </p>
                      <p className="text-xs text-secondary/50 font-dubai">{enrollment.user.email}</p>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-dubai text-secondary/70 truncate max-w-[50%]">{enrollment.course.title}</span>
                      <span className="font-dubai font-bold text-secondary">{formatCoursePrice(enrollment.amount)} {ep.egp}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-secondary/50 font-dubai">{formatDate(enrollment.createdAt)}</span>
                      <div className="flex gap-2">
                        {enrollment.status === 'PENDING' && (
                          <>
                            <button
                              onClick={() => handleAction(enrollment.id, 'confirm')}
                              disabled={actionLoading === enrollment.id}
                              className="px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-700 text-xs font-dubai hover:bg-emerald-200 transition-colors disabled:opacity-50"
                            >
                              {ep.confirmPayment}
                            </button>
                            <button
                              onClick={() => handleAction(enrollment.id, 'reject')}
                              disabled={actionLoading === enrollment.id}
                              className="px-3 py-1.5 rounded-lg bg-red-100 text-red-700 text-xs font-dubai hover:bg-red-200 transition-colors disabled:opacity-50"
                            >
                              {ep.rejectRequest}
                            </button>
                          </>
                        )}
                        {enrollment.status === 'CONFIRMED' && (
                          <button
                            onClick={() => handleAction(enrollment.id, 'refund')}
                            disabled={actionLoading === enrollment.id}
                            className="px-3 py-1.5 rounded-lg bg-blue-100 text-blue-700 text-xs font-dubai hover:bg-blue-200 transition-colors disabled:opacity-50"
                          >
                            {ep.refund}
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-primary/10">
                <button
                  onClick={() => fetchEnrollments(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className="p-2 rounded-lg hover:bg-primary/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronRight className="w-5 h-5 text-secondary" />
                </button>
                <span className="text-sm font-dubai text-secondary/70">
                  {pagination.page} / {pagination.totalPages}
                </span>
                <button
                  onClick={() => fetchEnrollments(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className="p-2 rounded-lg hover:bg-primary/10 disabled:opacity-30 transition-colors"
                >
                  <ChevronLeft className="w-5 h-5 text-secondary" />
                </button>
              </div>
            )}
          </>
        )}
      </motion.div>
    </div>
  );
}
