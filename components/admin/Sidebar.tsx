'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  MessageSquare, 
  Settings, 
  LogOut,
  ChevronLeft,
  Menu,
  X,
  Home
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface SidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isMobileOpen, onClose, onOpen }) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);
  const t = useTranslation();
  const { isRTL } = useLanguage();

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
    { icon: LayoutDashboard, label: t.admin.sidebar.dashboard, href: '/admin' },
    { icon: FileText, label: t.admin.sidebar.feasibilityStudies, href: '/admin/feasibility' },
    { icon: MessageSquare, label: t.admin.sidebar.consultationRequests, href: '/admin/consultations' },
    { icon: Users, label: t.admin.sidebar.users, href: '/admin/users' },
    { icon: Settings, label: t.admin.sidebar.settings, href: '/admin/settings' },
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
            initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
            exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="fixed inset-0 bg-secondary/50 z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <motion.aside
        initial={false}
        animate={{
          x: isMobile ? (isMobileOpen ? 0 : (isRTL ? '100%' : '-100%')) : 0
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className={`fixed top-0 h-full w-80 max-w-[85vw] bg-white shadow-[0_8px_30px_rgba(237,191,140,0.5)] flex flex-col overflow-hidden z-50 lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-72 lg:rounded-2xl lg:border-2 ${
          isRTL 
            ? 'right-0 border-l-2 border-primary/20 lg:right-8' 
            : 'left-0 border-r-2 border-primary/20 lg:left-8'
        }`}
      >
        {/* هيدر - معلومات المستخدم */}
        {session?.user && (
          <div className="p-6 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent">
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
                  {session.user.role === 'ADMIN' ? t.admin.sidebar.systemAdmin : t.admin.sidebar.user}
                </p>
              </div>
              <Link 
                href="/"
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors"
                title={t.admin.sidebar.backToHome}
              >
                <Home size={24} className="text-secondary" />
              </Link>
            </div>
          </div>
        )}

        {/* قائمة التنقل */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              const isSettingsPage = item.href === '/admin/settings';

              // منع التفاعل مع زر الإعدادات
              if (isSettingsPage) {
                return (
                  <li key={item.href}>
                    <div
                      className="
                        flex items-center gap-3 px-4 py-3 rounded-xl
                        opacity-50 cursor-not-allowed text-secondary/40
                      "
                      onClick={(e) => e.preventDefault()}
                    >
                      <Icon size={20} />
                      <span className={`font-semibold font-dubai text-sm flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {item.label}
                      </span>
                    </div>
                  </li>
                );
              }

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
                      <span className={`font-semibold font-dubai text-sm flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
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
            <span className={`font-semibold font-dubai text-sm flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
              {t.admin.sidebar.logout}
            </span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default Sidebar;
