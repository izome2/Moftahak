'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { createPortal } from 'react-dom';
import Image from 'next/image';
import { User, Settings, LogOut, ChevronDown, LayoutDashboard } from 'lucide-react';
import SettingsModal from './SettingsModal';

const UserDropdown: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 });
  const dropdownRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

  // للتأكد من أن المكون mounted على العميل
  useEffect(() => {
    setMounted(true);
  }, []);

  // Prefetch admin page for better performance when user is admin
  useEffect(() => {
    if (session?.user?.role === 'ADMIN') {
      router.prefetch('/admin');
    }
  }, [session?.user?.role, router]);

  // حساب موقع القائمة
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPosition({
        top: rect.bottom + 12,
        left: rect.left + (rect.width / 2) - 140, // 140 هو نصف عرض القائمة (280/2)
      });
    }
  }, [isOpen]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  if (!session?.user) {
    return null;
  }

  const userFullName = `${session.user.firstName} ${session.user.lastName}`;
  const userImage = session.user.image || '/images/default-avatar.png';

  const handleSignOut = async () => {
    await signOut({ callbackUrl: '/' });
  };

  return (
    <>
      <div className="relative">
        {/* User Avatar Button */}
        <button
          ref={buttonRef}
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center gap-2 p-1.5 rounded-full hover:bg-primary/10 transition-all duration-300 group"
          aria-label="قائمة المستخدم"
        >
          <div className="relative w-10 h-10 rounded-full overflow-hidden border-2 border-primary/30 group-hover:border-primary group-hover:scale-105 transition-all duration-300 shadow-md">
            {session.user.image ? (
              <Image
                src={userImage}
                alt={userFullName}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/10 flex items-center justify-center">
                <User className="text-secondary" size={20} />
              </div>
            )}
          </div>
          <ChevronDown 
            size={16} 
            className={`text-secondary transition-all duration-300 hidden sm:block group-hover:text-primary ${
              isOpen ? 'rotate-180' : ''
            }`}
          />
        </button>
      </div>

      {/* Dropdown Menu - Using Portal */}
      {mounted && isOpen && createPortal(
        <motion.div
          ref={dropdownRef}
          initial={{ opacity: 0, y: -20, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ 
            duration: 0.3,
            type: "spring",
            stiffness: 300,
            damping: 25
          }}
          style={{
            position: 'fixed',
            top: `${dropdownPosition.top}px`,
            left: `${dropdownPosition.left}px`,
          }}
          className="w-[280px] bg-[#fdf6ee]/80 backdrop-blur-xl rounded-2xl shadow-[0_8px_30px_rgba(180,130,80,0.30)] border border-primary/30 overflow-hidden z-[9999]"
        >
              {/* User Info */}
              <div className="p-5 border-b border-primary/20">
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-full overflow-hidden border-2 border-primary/40 flex-shrink-0">
                    {session.user.image ? (
                      <Image
                        src={userImage}
                        alt={userFullName}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="w-full h-full bg-primary/10 flex items-center justify-center">
                        <User className="text-primary" size={22} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-secondary font-bold text-lg truncate font-dubai mt-2">
                      {userFullName}
                    </p>
                    {session.user.role === 'ADMIN' && (
                      <span className="inline-flex items-center mt-1 px-3 py-1 bg-secondary/10 text-secondary text-xs rounded-full font-semibold font-dubai w-fit">
                        مدير
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Menu Items */}
              <div className="py-2">
                {/* Admin Dashboard - للأدمن فقط */}
                {session.user.role === 'ADMIN' && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      router.push('/admin');
                    }}
                    className="w-full flex items-center gap-3 px-5 py-3 text-secondary hover:bg-primary/10 rounded-xl mx-2 transition-all duration-300 group"
                  >
                    <LayoutDashboard 
                      size={20} 
                      className="text-secondary group-hover:scale-110 transition-transform duration-300"
                    />
                    <span className="font-semibold font-dubai text-base flex-1 text-right">لوحة التحكم</span>
                  </button>
                )}

                {/* Settings */}
                <button
                  onClick={() => {
                    setIsOpen(false);
                    setIsSettingsOpen(true);
                  }}
                  className="w-full flex items-center gap-3 px-5 py-3 text-secondary hover:bg-primary/10 rounded-xl mx-2 transition-all duration-300 group"
                >
                  <Settings 
                    size={20} 
                    className="text-secondary group-hover:rotate-45 transition-transform duration-300"
                  />
                  <span className="font-semibold font-dubai text-base flex-1 text-right">الإعدادات</span>
                </button>

                {/* Divider */}
                <div className="my-2 mx-4 border-t border-primary/20"></div>

                {/* Logout */}
                <button
                  onClick={handleSignOut}
                  className="w-[calc(100%-16px)] flex items-center gap-3 px-5 py-3 text-red-600/80 hover:text-red-600 hover:bg-red-500/5 rounded-xl mx-2 transition-all duration-300 group"
                >
                  <LogOut 
                    size={20} 
                    className="group-hover:translate-x-1 transition-transform duration-300"
                  />
                  <span className="font-semibold font-dubai text-base flex-1 text-right">تسجيل الخروج</span>
                </button>
              </div>
            </motion.div>,
        document.body
      )}

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
    </>
  );
};

export default UserDropdown;
