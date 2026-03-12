'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import AccountingSidebar from '@/components/accounting/Sidebar';
import { isAccountingRole } from '@/lib/permissions';
import { ToastProvider } from '@/components/accounting/shared/Toast';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

export default function AccountingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const t = useTranslation();
  const { language } = useLanguage();

  // حماية الصفحة - يجب أن يكون المستخدم مسجلاً ولديه دور حسابات
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && !isAccountingRole(session?.user?.role)) {
      router.push('/');
    }
  }, [status, session, router]);

  // عرض loading أثناء التحقق
  if (
    status === 'loading' ||
    !session ||
    !isAccountingRole(session?.user?.role)
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4" />
          <p className="text-secondary font-dubai">{t.accounting.common.loading}</p>
        </div>
      </div>
    );
  }

  return (
    <ToastProvider>
      <div className="fixed inset-0 bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60 -z-10" />
      <div className="min-h-screen font-dubai" dir={language === 'ar' ? 'rtl' : 'ltr'}>
        {/* Sidebar */}
        <AccountingSidebar
          isMobileOpen={isMobileMenuOpen}
          onClose={() => setIsMobileMenuOpen(false)}
          onOpen={() => setIsMobileMenuOpen(true)}
        />

        {/* زر فتح القائمة على الموبايل */}
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full bg-white text-secondary hover:bg-primary/10 transition-all duration-300 hover:scale-105 lg:hidden flex items-center gap-2 shadow-[0_10px_40px_rgba(16,48,43,0.15),0_0_0_1px_rgba(237,191,140,0.3)]"
          aria-label={t.accounting.common.openMenu}
        >
          <Menu className="w-5 h-5" />
          <span className="font-dubai text-sm font-medium">{t.accounting.sidebar.dashboard}</span>
        </button>

        {/* المحتوى الرئيسي */}
        <main className="relative min-h-screen lg:mr-[21rem]">
          <div className="h-full min-h-screen p-4 sm:p-6 lg:p-8 lg:pr-4">
            <div className="flex-1 overflow-visible flex flex-col bg-white/95 rounded-xl lg:rounded-2xl shadow-[0_15px_60px_rgba(237,191,140,0.65)] border-2 border-primary/10 min-h-[calc(100vh-4rem)]">
              {children}
            </div>
          </div>
        </main>
      </div>
    </ToastProvider>
  );
}
