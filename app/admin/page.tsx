'use client';

import React, { useEffect, useState } from 'react';
import { Users, FileText, MessageSquare, Star, Menu, Loader2, Clock, CheckCircle2, Eye, Calculator, PlayCircle, ClipboardList, DollarSign } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

// Types
interface RecentUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  image: string | null;
  createdAt: string;
}

interface RecentConsultation {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: 'PENDING' | 'READ' | 'COMPLETED';
  createdAt: string;
}

interface DashboardStats {
  totalUsers: number;
  pendingConsultations: number;
  totalFeasibilityStudies: number;
  totalReviews: number;
  totalCourses: number;
  pendingEnrollments: number;
  totalCourseRevenue: number;
}

interface RecentEnrollment {
  id: string;
  paymentCode: string;
  status: string;
  amount: number;
  createdAt: string;
  user: { firstName: string; lastName: string };
  course: { title: string };
}

const statusIcons: Record<string, { icon: React.ElementType; color: string }> = {
  PENDING: { icon: Clock, color: 'text-amber-600' },
  READ: { icon: Eye, color: 'text-blue-600' },
  COMPLETED: { icon: CheckCircle2, color: 'text-primary' },
};

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { language } = useLanguage();
  
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    pendingConsultations: 0,
    totalFeasibilityStudies: 0,
    totalReviews: 0,
    totalCourses: 0,
    pendingEnrollments: 0,
    totalCourseRevenue: 0,
  });
  const [recentUsers, setRecentUsers] = useState<RecentUser[]>([]);
  const [recentConsultations, setRecentConsultations] = useState<RecentConsultation[]>([]);
  const [recentEnrollments, setRecentEnrollments] = useState<RecentEnrollment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // حماية الصفحة - إعادة توجيه إذا لم يكن أدمن
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  // جلب الإحصائيات من API
  useEffect(() => {
    const fetchStats = async () => {
      if (status !== 'authenticated' || session?.user?.role !== 'ADMIN') return;
      
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/admin/stats');
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'حدث خطأ أثناء جلب البيانات');
        }
        
        setStats(data.stats);
        setRecentUsers(data.recentUsers);
        setRecentConsultations(data.recentConsultations);
        setRecentEnrollments(data.recentEnrollments || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [status, session]);

  // عرض loading أثناء التحقق
  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary font-dubai">{t.admin.loading}</p>
        </div>
      </div>
    );
  }

  // تنسيق التاريخ
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString(language === 'ar' ? 'ar-EG' : 'en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-8">
      {/* الترحيب */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
        className="flex items-center justify-between gap-3 sm:gap-4 will-change-transform"
        style={{ transform: 'translateZ(0)' }}
      >
        <div className="flex items-center gap-3 sm:gap-4">
          <div className="relative w-12 h-12 sm:w-16 sm:h-16 flex-shrink-0">
            <Image
              src="/logos/logo-dark-icon.png"
              alt="مفتاحك"
              fill
              className="object-contain"
            />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-secondary font-bristone">
              MOFTAHAK
            </h1>
            <p className="text-sm sm:text-base text-secondary/60 font-dubai">
              {t.admin.dashboard.overview}
            </p>
          </div>
        </div>
        
        {/* زر القائمة للموبايل والآيباد */}
        <button
          onClick={() => {
            const event = new CustomEvent('openAdminMenu');
            window.dispatchEvent(event);
          }}
          className="lg:hidden p-2 hover:bg-primary/10 rounded-lg transition-colors"
          aria-label={t.admin.openMenu}
        >
          <Menu size={28} className="text-secondary" />
        </button>
      </motion.div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          icon={Users}
          label={t.admin.dashboard.totalUsers}
          value={isLoading ? '...' : stats.totalUsers}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={0}
        />
        <StatsCard
          icon={MessageSquare}
          label={t.admin.dashboard.newConsultations}
          value={isLoading ? '...' : stats.pendingConsultations}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={1}
        />
        <StatsCard
          icon={FileText}
          label={t.admin.dashboard.feasibilityStudies}
          value={isLoading ? '...' : stats.totalFeasibilityStudies}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={2}
        />
        <StatsCard
          icon={Star}
          label={t.admin.dashboard.reviews}
          value={isLoading ? '...' : stats.totalReviews}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={3}
        />
      </div>

      {/* بطاقات إحصائيات الدورات */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
        <StatsCard
          icon={PlayCircle}
          label={t.admin.dashboard.totalCourses}
          value={isLoading ? '...' : stats.totalCourses}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={4}
        />
        <StatsCard
          icon={ClipboardList}
          label={t.admin.dashboard.pendingEnrollments}
          value={isLoading ? '...' : stats.pendingEnrollments}
          iconBgColor="bg-amber-100"
          iconColor="text-amber-600"
          index={5}
        />
        <StatsCard
          icon={DollarSign}
          label={t.admin.dashboard.courseRevenue}
          value={isLoading ? '...' : `${new Intl.NumberFormat(language === 'ar' ? 'ar-EG' : 'en-US').format(stats.totalCourseRevenue)} ${language === 'ar' ? 'ج.م' : 'EGP'}`}
          iconBgColor="bg-emerald-100"
          iconColor="text-emerald-600"
          index={6}
        />
      </div>

      {/* بطاقة نظام الحسابات */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transform: 'translateZ(0)' }}
      >
        <Link
          href="/accounting"
          className="block bg-gradient-to-l from-secondary to-secondary/90 border-2 border-primary/30 p-6 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] hover:shadow-[0_8px_30px_rgba(237,191,140,0.25)] transition-all duration-300 hover:-translate-y-1 group"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-xl bg-primary/20 flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                <Calculator className="w-7 h-7 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white font-dubai">{t.admin.dashboard.accountingSystem}</h3>
                <p className="text-sm text-white/60 font-dubai mt-1">
                  {t.admin.dashboard.accountingDesc}
                </p>
              </div>
            </div>
            <div className="text-primary text-2xl group-hover:translate-x-[-4px] transition-transform">
              ←
            </div>
          </div>
        </Link>
      </motion.div>

      {/* الأقسام الإضافية */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* آخر المستخدمين */}
        <motion.div 
          className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] hover:shadow-[0_8px_30px_rgba(237,191,140,0.25)] will-change-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary font-dubai">
              {t.admin.dashboard.recentUsers}
            </h2>
            <Link 
              href="/admin/users" 
              className="text-sm text-primary hover:text-primary/80 font-dubai transition-colors"
            >
              {t.admin.viewAll}
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center py-8 font-dubai">{error}</p>
            ) : recentUsers.length === 0 ? (
              <p className="text-secondary/60 text-center py-8 font-dubai">
                {t.admin.dashboard.noUsersYet}
              </p>
            ) : (
              recentUsers.map((user) => (
                <div 
                  key={user.id} 
                  className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="relative w-10 h-10 rounded-full overflow-hidden bg-primary/10 flex-shrink-0">
                    {user.image ? (
                      <Image
                        src={user.image}
                        alt={`${user.firstName} ${user.lastName}`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-secondary font-bold text-sm">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary font-dubai truncate">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-secondary/60 font-dubai truncate">
                      {user.email}
                    </p>
                  </div>
                  <p className="text-xs text-secondary/50 font-dubai flex-shrink-0">
                    {formatDate(user.createdAt)}
                  </p>
                </div>
              ))
            )}
          </div>
        </motion.div>

        {/* آخر الطلبات */}
        <motion.div 
          className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] hover:shadow-[0_8px_30px_rgba(237,191,140,0.25)] will-change-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary font-dubai">
              {t.admin.dashboard.recentConsultations}
            </h2>
            <Link 
              href="/admin/consultations" 
              className="text-sm text-primary hover:text-primary/80 font-dubai transition-colors"
            >
              {t.admin.viewAll}
            </Link>
          </div>
          <div className="space-y-3">
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="w-6 h-6 text-primary animate-spin" />
              </div>
            ) : error ? (
              <p className="text-red-500 text-center py-8 font-dubai">{error}</p>
            ) : recentConsultations.length === 0 ? (
              <p className="text-secondary/60 text-center py-8 font-dubai">
                {t.admin.dashboard.noRequestsYet}
              </p>
            ) : (
              recentConsultations.map((consultation) => {
                const statusLabels: Record<string, string> = {
                  PENDING: t.admin.consultationStatus.new,
                  READ: t.admin.consultationStatus.read,
                  COMPLETED: t.admin.consultationStatus.completed,
                };
                const iconInfo = statusIcons[consultation.status] || statusIcons.PENDING;
                const StatusIcon = iconInfo.icon;
                
                return (
                  <Link 
                    key={consultation.id}
                    href={`/admin/consultations/${consultation.id}`}
                    className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-secondary font-dubai truncate">
                        {consultation.firstName} {consultation.lastName}
                      </p>
                      <p className="text-xs text-secondary/60 font-dubai truncate">
                        {consultation.email}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1 flex-shrink-0">
                      <span className={`flex items-center gap-1 text-xs font-dubai ${iconInfo.color}`}>
                        <StatusIcon className="w-3 h-3" />
                        {statusLabels[consultation.status] || statusLabels.PENDING}
                      </span>
                      <p className="text-xs text-secondary/50 font-dubai">
                        {formatDate(consultation.createdAt)}
                      </p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </motion.div>
      </div>

      {/* آخر طلبات الاشتراك في الدورات */}
      {recentEnrollments.length > 0 && (
        <motion.div 
          className="bg-white border-2 border-primary/20 p-6 rounded-2xl shadow-[0_4px_20px_rgba(237,191,140,0.15)] hover:shadow-[0_8px_30px_rgba(237,191,140,0.25)] will-change-transform"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-secondary font-dubai">
              {t.admin.dashboard.recentEnrollments}
            </h2>
            <Link 
              href="/admin/courses/enrollments" 
              className="text-sm text-primary hover:text-primary/80 font-dubai transition-colors"
            >
              {t.admin.viewAll}
            </Link>
          </div>
          <div className="space-y-3">
            {recentEnrollments.map((enrollment) => {
              const statusColors: Record<string, string> = {
                PENDING: 'text-amber-600',
                CONFIRMED: 'text-emerald-600',
                EXPIRED: 'text-red-600',
                REFUNDED: 'text-blue-600',
              };
              return (
                <Link 
                  key={enrollment.id}
                  href="/admin/courses/enrollments"
                  className="flex items-center gap-3 p-3 bg-accent/30 rounded-xl hover:bg-accent/50 transition-colors"
                >
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <ClipboardList className="w-5 h-5 text-secondary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-secondary font-dubai truncate">
                      {enrollment.user.firstName} {enrollment.user.lastName}
                    </p>
                    <p className="text-xs text-secondary/60 font-dubai truncate">
                      {enrollment.course.title}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-1 flex-shrink-0">
                    <span className={`font-mono text-xs font-bold ${statusColors[enrollment.status] || 'text-secondary'}`}>
                      {enrollment.paymentCode}
                    </span>
                    <p className="text-xs text-secondary/50 font-dubai">
                      {formatDate(enrollment.createdAt)}
                    </p>
                  </div>
                </Link>
              );
            })}
          </div>
        </motion.div>
      )}
    </div>
  );
}
