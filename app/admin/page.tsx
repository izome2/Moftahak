'use client';

import React, { useEffect } from 'react';
import { Users, FileText, Building2, Star, Menu } from 'lucide-react';
import StatsCard from '@/components/admin/StatsCard';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';

export default function AdminDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();

  // حماية الصفحة - إعادة توجيه إذا لم يكن أدمن
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  // عرض loading أثناء التحقق
  if (status === 'loading' || !session || session.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary font-dubai">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  // بيانات مؤقتة - سيتم استبدالها بـ API calls حقيقية
  const stats = {
    totalUsers: 156,
    newRequests: 23,
    properties: 47,
    reviews: 89,
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
              إليك نظرة عامة على أداء الموقع اليوم
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
          aria-label="فتح القائمة"
        >
          <Menu size={28} className="text-secondary" />
        </button>
      </motion.div>

      {/* البطاقات الإحصائية */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-6">
        <StatsCard
          icon={Users}
          label="إجمالي المستخدمين"
          value={stats.totalUsers}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={0}
        />
        <StatsCard
          icon={FileText}
          label="الطلبات الجديدة"
          value={stats.newRequests}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={1}
        />
        <StatsCard
          icon={Building2}
          label="العقارات المنشورة"
          value={stats.properties}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={2}
        />
        <StatsCard
          icon={Star}
          label="المراجعات"
          value={stats.reviews}
          iconBgColor="bg-primary/20"
          iconColor="text-primary"
          index={3}
        />
      </div>

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
          <h2 className="text-xl font-bold text-secondary mb-4 font-dubai">
            آخر المستخدمين المسجلين
          </h2>
          <div className="space-y-3">
            <p className="text-secondary/60 text-center py-8 font-dubai">
              قريباً...
            </p>
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
          <h2 className="text-xl font-bold text-secondary mb-4 font-dubai">
            آخر الطلبات
          </h2>
          <div className="space-y-3">
            <p className="text-secondary/60 text-center py-8 font-dubai">
              قريباً...
            </p>
          </div>
        </motion.div>
      </div>

      {/* رسالة تطوير */}
      <motion.div 
        className="bg-gradient-to-br from-primary/10 to-primary/5 border-2 border-primary/30 p-6 rounded-2xl text-center shadow-[0_4px_20px_rgba(237,191,140,0.1)] will-change-transform"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2, ease: [0.25, 0.1, 0.25, 1] }}
        style={{ transform: 'translateZ(0)' }}
      >
        <p className="text-secondary font-dubai text-lg">
          🚀 هذه النسخة التجريبية من لوحة التحكم. سيتم إضافة المزيد من الميزات قريباً!
        </p>
      </motion.div>
    </div>
  );
}
