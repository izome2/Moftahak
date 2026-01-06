'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Menu } from 'lucide-react';
import Sidebar from '@/components/admin/Sidebar';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // حماية الصفحة
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/');
    } else if (status === 'authenticated' && session?.user?.role !== 'ADMIN') {
      router.push('/');
    }
  }, [status, session, router]);

  // عرض loading أثناء التحقق
  if (status === 'loading' || !session || session?.user?.role !== 'ADMIN') {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-secondary font-dubai">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="fixed inset-0 bg-gradient-to-l from-primary/20 via-accent/40 to-accent/60 -z-10" />
      <div className="min-h-screen font-dubai" dir="rtl">
        <Sidebar 
          isMobileOpen={isMobileMenuOpen} 
          onClose={() => setIsMobileMenuOpen(false)}
          onOpen={() => setIsMobileMenuOpen(true)}
        />
        
        <main className="relative lg:mr-[21rem] min-h-screen">
          <div className="p-4 sm:p-6 lg:p-8 lg:pr-4 min-h-screen flex items-stretch">
            <div className="flex-1 bg-white/80 backdrop-blur-md rounded-xl lg:rounded-2xl shadow-[0_15px_60px_rgba(237,191,140,0.65)] border-2 border-primary/10 p-4 sm:p-6 lg:p-8 overflow-y-auto">
              {children}
            </div>
          </div>
        </main>
      </div>
    </>
  );
}
