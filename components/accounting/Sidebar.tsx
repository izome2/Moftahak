'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signOut } from 'next-auth/react';
import {
  LayoutDashboard,
  Building2,
  CalendarCheck,
  Receipt,
  ClipboardList,
  Users,
  Wallet,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Home,
  X,
  ShieldCheck,
  ScrollText,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { type AccountingRole, getEffectiveAccountingRole } from '@/lib/permissions';

// ============================================================================
// تعريف عناصر القائمة
// ============================================================================

interface MenuItem {
  icon: React.FC<{ size?: number; className?: string }>;
  label: string;
  href: string;
  /** الأدوار المسموح لها برؤية هذا العنصر */
  roles: AccountingRole[];
}

const ALL_MENU_ITEMS: MenuItem[] = [
  {
    icon: LayoutDashboard,
    label: 'لوحة التحكم',
    href: '/accounting',
    roles: ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER'],
  },
  {
    icon: Building2,
    label: 'الشقق',
    href: '/accounting/apartments',
    roles: ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER'],
  },
  {
    icon: CalendarCheck,
    label: 'الحجوزات',
    href: '/accounting/bookings',
    roles: ['GENERAL_MANAGER', 'BOOKING_MANAGER'],
  },
  {
    icon: Receipt,
    label: 'المصروفات',
    href: '/accounting/expenses',
    roles: ['GENERAL_MANAGER', 'OPS_MANAGER'],
  },
  {
    icon: ClipboardList,
    label: 'المتابعة اليومية',
    href: '/accounting/daily',
    roles: ['GENERAL_MANAGER', 'OPS_MANAGER'],
  },
  {
    icon: Users,
    label: 'المستثمرين',
    href: '/accounting/investors',
    roles: ['GENERAL_MANAGER'],
  },
  {
    icon: Wallet,
    label: 'حساباتي',
    href: '/accounting/my-investments',
    roles: ['INVESTOR'],
  },
  {
    icon: BarChart3,
    label: 'التقارير',
    href: '/accounting/reports',
    roles: ['GENERAL_MANAGER'],
  },
  {
    icon: ShieldCheck,
    label: 'قفل الأشهر',
    href: '/accounting/month-lock',
    roles: ['GENERAL_MANAGER'],
  },
  {
    icon: ScrollText,
    label: 'سجل المراجعة',
    href: '/accounting/audit',
    roles: ['GENERAL_MANAGER'],
  },
  {
    icon: Settings,
    label: 'الإعدادات',
    href: '/accounting/settings',
    roles: ['GENERAL_MANAGER'],
  },
];

// ============================================================================
// ترجمة الأدوار
// ============================================================================

const ROLE_LABELS: Record<string, string> = {
  ADMIN: 'مسؤول الموقع و مدير عام',
  GENERAL_MANAGER: 'المدير العام',
  OPS_MANAGER: 'مدير التشغيل',
  BOOKING_MANAGER: 'مدير الحجوزات',
  INVESTOR: 'مستثمر',
};

// ============================================================================
// Sidebar Component
// ============================================================================

interface AccountingSidebarProps {
  isMobileOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
}

const AccountingSidebar: React.FC<AccountingSidebarProps> = ({
  isMobileOpen,
  onClose,
  onOpen,
}) => {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isMobile, setIsMobile] = useState(false);

  const userRole = (session?.user?.role || '') as string;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    const handleOpenMenu = () => {
      onOpen();
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    window.addEventListener('openAccountingMenu', handleOpenMenu);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('openAccountingMenu', handleOpenMenu);
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

  // فلترة العناصر حسب دور المستخدم (ADMIN يُعامَل كـ GENERAL_MANAGER)
  const effectiveRole = getEffectiveAccountingRole(userRole) || userRole;
  const visibleItems = ALL_MENU_ITEMS.filter(item =>
    item.roles.includes(effectiveRole as AccountingRole)
  );

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/' });
  };

  const handleLinkClick = () => {
    if (isMobile) {
      onClose();
    }
  };

  const isActive = (href: string) => {
    if (href === '/accounting') return pathname === '/accounting';
    return pathname?.startsWith(href);
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
          x: isMobile ? (isMobileOpen ? 0 : '100%') : 0,
        }}
        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
        className="fixed right-0 top-0 h-full w-80 max-w-[85vw] bg-white shadow-[0_8px_30px_rgba(237,191,140,0.5)] border-l-2 border-primary/20 flex flex-col overflow-hidden z-50 lg:right-8 lg:top-8 lg:h-[calc(100vh-4rem)] lg:w-72 lg:rounded-2xl lg:border-2"
      >
        {/* هيدر - معلومات المستخدم */}
        {session?.user && (
          <div className="p-6 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent">
            {/* زر إغلاق للموبايل */}
            {isMobile && (
              <button
                onClick={onClose}
                className="absolute top-4 left-4 p-1.5 rounded-lg hover:bg-primary/10 transition-colors lg:hidden"
                aria-label="إغلاق القائمة"
              >
                <X size={20} className="text-secondary/60" />
              </button>
            )}

            <div className="flex items-center gap-3">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-primary/10 shrink-0">
                {session.user.image ? (
                  <Image
                    src={session.user.image}
                    alt={session.user.firstName || 'User'}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-secondary font-bold text-lg">
                    {session.user.firstName?.[0]}
                    {session.user.lastName?.[0]}
                  </div>
                )}
              </div>
              <div className="text-right flex-1 min-w-0">
                <p className="font-semibold text-secondary font-dubai truncate">
                  {session.user.firstName} {session.user.lastName}
                </p>
                <p className="text-xs text-secondary/60 font-dubai">
                  {ROLE_LABELS[userRole] || ROLE_LABELS[effectiveRole] || userRole}
                </p>
              </div>
              <Link
                href="/"
                className="p-2.5 hover:bg-primary/10 rounded-xl transition-colors shrink-0"
                title="العودة للصفحة الرئيسية"
              >
                <Home size={24} className="text-secondary" />
              </Link>
            </div>
          </div>
        )}

        {/* قائمة التنقل */}
        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {visibleItems.map((item) => {
              const active = isActive(item.href);
              const Icon = item.icon;

              return (
                <li key={item.href}>
                  <Link href={item.href} onClick={handleLinkClick}>
                    <motion.div
                      whileHover={{ x: -5 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{
                        type: 'spring',
                        stiffness: 500,
                        damping: 30,
                      }}
                      className={`
                        flex items-center gap-3 px-4 py-3 rounded-xl transition-colors duration-100
                        ${
                          active
                            ? 'bg-linear-to-l from-primary to-primary/80 text-white shadow-[0_4px_15px_rgba(237,191,140,0.4)]'
                            : 'text-secondary hover:bg-[#efc495]/30'
                        }
                      `}
                    >
                      <Icon size={20} />
                      <span className="font-semibold font-dubai text-sm flex-1 text-right">
                        {item.label}
                      </span>
                      {active && (
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
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-600/80 hover:bg-red-500/10 hover:text-red-600"
          >
            <LogOut size={20} />
            <span className="font-semibold font-dubai text-sm flex-1 text-right">
              تسجيل الخروج
            </span>
          </motion.button>
        </div>
      </motion.aside>
    </>
  );
};

export default AccountingSidebar;
