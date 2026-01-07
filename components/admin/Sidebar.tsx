'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Building2, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu,
  X,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useFeasibilityEditorSafe } from '@/contexts/FeasibilityEditorContext';
import { SlideManager } from '@/components/feasibility/slides';

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose, onOpen }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  
  // التحقق من وجود محرر الجدوى - نتحقق من المسار مباشرة
  const editorContext = useFeasibilityEditorSafe();
  // نحن في المحرر إذا كان المسار يحتوي على /admin/feasibility/new أو /admin/feasibility/[id]
  const isInFeasibilityEditor = Boolean(
    pathname && 
    (pathname === '/admin/feasibility/new' || 
     (pathname.startsWith('/admin/feasibility/') && pathname !== '/admin/feasibility'))
  );

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    const handleOpenMenu = () => {
      onOpen();
    };
    
    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('openAdminMenu', handleOpenMenu);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('openAdminMenu', handleOpenMenu);
    };
  }, [onOpen]);

  useEffect(() => {
    if (isMobile && isMobileOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobile, isMobileOpen]);

  const menuItems = [
    { icon: LayoutDashboard, label: 'لوحة التحكم', href: '/admin' },
    { icon: FileText, label: 'دراسات الجدوى', href: '/admin/feasibility' },
    { icon: Users, label: 'المستخدمين', href: '/admin/users' },
    { icon: Building2, label: 'العقارات', href: '/admin/properties' },
    { icon: Settings, label: 'الإعدادات', href: '/admin/settings' },
  ];

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  return (
    <>
      {/* Overlay للموبايل */}
      <AnimatePresence>
        {isMobile && isMobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 bg-secondary/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isMobileOpen ? 0 : '100%') : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-[0_8px_30px_rgba(237,191,140,0.5)] border-l-2 border-primary/20 flex flex-col overflow-hidden z-50 lg:right-8 lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-72 lg:rounded-2xl lg:border-2"
      >
      {/* هيدر الـ Sidebar */}
      {isInFeasibilityEditor ? (
        /* هيدر المحرر - الشعار ومعلومات الدراسة */
        <div className="px-4 py-6 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent">
          {/* زر الإغلاق للموبايل */}
          {isMobile && (
            <button
              onClick={onClose}
              className="absolute left-4 top-4 p-2 rounded-lg hover:bg-primary/10 transition-colors lg:hidden"
              aria-label="إغلاق القائمة"
            >
              <X size={24} className="text-secondary" />
            </button>
          )}
          
          {/* كل العناصر في خط واحد */}
          <div className="flex items-center gap-3">
            {/* زر العودة */}
            <Link href="/admin/feasibility">
              <motion.div
                whileHover={{ x: -3 }}
                className="flex items-center justify-center w-10 h-10 text-secondary/70 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <ArrowRight size={20} />
              </motion.div>
            </Link>

            <div className="h-7 w-px bg-primary/20" />

            {/* الشعار */}
            <div className="w-9 h-9 relative shrink-0">
              <Image
                src="/logos/logo-icon.png"
                alt="مفتاحك"
                fill
                className="object-contain"
              />
            </div>

            <div className="h-7 w-px bg-primary/20" />
            
            {/* معلومات الدراسة */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-secondary font-dubai text-base truncate">
                دراسة جدوى
              </span>
              <span className="text-secondary/60 text-sm font-dubai truncate">
                {editorContext?.clientName || 'عميل تجريبي'}
              </span>
            </div>
          </div>
        </div>
      ) : (
        /* هيدر عادي - معلومات المستخدم */
        session?.user && (
          <div className="p-6 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent">
            {/* زر الإغلاق للموبايل */}
            {isMobile && (
              <button
                onClick={onClose}
                className="absolute left-4 top-4 p-2 rounded-lg hover:bg-primary/10 transition-colors lg:hidden"
                aria-label="إغلاق القائمة"
              >
                <X size={24} className="text-secondary" />
              </button>
            )}
            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.firstName || 'Admin'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary font-bold text-lg">
                    {session.user.firstName?.[0]}{session.user.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="text-right flex-1">
                <p className="font-semibold text-secondary font-dubai">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-secondary/60 font-dubai">
                  {session.user.role === 'ADMIN' ? 'مسؤول النظام' : 'مستخدم'}
                </p>
              </div>
            </div>
          </div>
        )
      )}

      {/* عرض SlideManager إذا كنا في محرر الجدوى */}
      {isInFeasibilityEditor ? (
        editorContext ? (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* مدير الشرائح */}
            <div className="flex-1 overflow-hidden">
              <SlideManager
                slides={editorContext.slides}
                activeSlideIndex={editorContext.activeSlideIndex}
                onSlideSelect={editorContext.setActiveSlideIndex}
                onAddSlide={editorContext.addSlide}
                onRemoveSlide={editorContext.removeSlide}
                onDuplicateSlide={editorContext.duplicateSlide}
                onReorderSlides={editorContext.reorderSlides}
                canRemoveSlide={editorContext.canRemoveSlide}
                compact
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center p-4">
            <div className="text-center text-secondary/60">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-3"></div>
              <p className="text-sm font-dubai">جاري تحميل المحرر...</p>
            </div>
          </div>
        )
      ) : (
        <>
          {/* قائمة التنقل */}
          <nav className="flex-1 p-4 overflow-y-auto">
            <ul className="space-y-2">
              {menuItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;

            return (
                  <li key={item.href}>
                    <Link href={item.href} onClick={handleLinkClick}>
                      <motion.div
                        whileHover={{ x: -5 }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 500, damping: 30 }}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-100
                          ${
                            isActive
                              ? 'bg-linear-to-l from-primary to-primary/80 text-white shadow-[0_4px_15px_rgba(237,191,140,0.4)]'
                              : 'text-secondary hover:bg-[#efc495]/30'
                          }
                        `}
                      >
                        <Icon size={20} />
                        <span className="font-semibold font-dubai text-sm flex-1 text-right">
                          {item.label}
                        </span>
                        {isActive && (
                          <ChevronLeft size={16} className="text-white" />
                        )}
                      </motion.div>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>

          {/* زر تسجيل الخروج */}
          <div className="p-4 border-t border-primary/20 bg-linear-to-br from-primary/5 to-transparent">
            <motion.button
              whileHover={{ x: -5 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleLogout}
              className="
                w-full flex items-center gap-3 px-4 py-3 rounded-xl
                text-red-600/80 hover:bg-red-500/10 hover:text-red-600
              "
            >
              <LogOut size={20} />
              <span className="font-semibold font-dubai text-sm flex-1 text-right">
                تسجيل الخروج
              </span>
            </motion.button>
          </div>
        </>
      )}
      </motion.aside>
    </>
  );
};

export default Sidebar;
