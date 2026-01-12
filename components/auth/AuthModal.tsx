'use client';

import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import AuthBackground from './AuthBackground';
import { overlayVariants, slideInRight } from '@/lib/animations/modalVariants';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultMode?: 'login' | 'register';
}

const AuthModal: React.FC<AuthModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultMode = 'login' 
}) => {
  const [mode, setMode] = useState<'login' | 'register'>(defaultMode);

  const handleAuthSuccess = () => {
    onClose();
  };

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      document.documentElement.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      document.documentElement.style.overflow = '';
    };
  }, [isOpen]);

  // Reset mode when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setMode(defaultMode), 300);
    }
  }, [isOpen, defaultMode]);

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  const handleSwitchToRegister = () => {
    setMode('register');
  };

  const handleSwitchToLogin = () => {
    setMode('login');
  };

  // Don't render on server
  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence mode="wait">
      {isOpen && (
        <>
          {/* Backdrop Overlay */}
          <motion.div
            variants={overlayVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-[9998]"
            style={{ touchAction: 'none' }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 overflow-y-auto">
            <div className="w-full max-w-6xl min-h-0 h-auto max-h-[90vh] flex relative my-auto">
              
              {/* Left Side - Background (Desktop only) */}
              <AuthBackground />

              {/* Right Side - Form */}
              <motion.div
                variants={slideInRight}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="w-full lg:w-1/2 bg-accent rounded-3xl lg:rounded-r-none shadow-2xl relative overflow-y-auto scrollbar-hide"
                style={{
                  scrollbarWidth: 'none',
                  msOverflowStyle: 'none',
                }}
              >
                {/* Close Button */}
                <button
                  onClick={onClose}
                  className="absolute top-6 left-6 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-secondary hover:text-primary transition-all duration-300 shadow-md"
                  aria-label="إغلاق"
                >
                  <X size={24} />
                </button>

                {/* Form Content */}
                <div className="p-8 md:p-12 lg:p-16">
                  {/* Logo & Title */}
                  <div className="text-center mb-8">
                    <h2 className="text-3xl md:text-4xl font-bold text-secondary mb-2 font-dubai">
                      {mode === 'login' ? 'مرحباً بعودتك' : 'إنشاء حساب جديد'}
                    </h2>
                    <p className="text-secondary/70 font-dubai">
                      {mode === 'login' 
                        ? 'سجل دخولك للوصول إلى حسابك' 
                        : 'انضم إلى مفتاحك وابدأ رحلتك العقارية'
                      }
                    </p>
                  </div>

                  {/* Mode Switcher Tabs */}
                  <div className="flex gap-2 mb-8 p-1 bg-white/60 rounded-full">
                    <button
                      onClick={handleSwitchToLogin}
                      className={`flex-1 py-3 rounded-full font-bold transition-all duration-300 font-dubai ${
                        mode === 'login'
                          ? 'bg-secondary text-white shadow-md'
                          : 'text-secondary/70 hover:text-secondary'
                      }`}
                    >
                      تسجيل الدخول
                    </button>
                    <button
                      onClick={handleSwitchToRegister}
                      className={`flex-1 py-3 rounded-full font-bold transition-all duration-300 font-dubai ${
                        mode === 'register'
                          ? 'bg-secondary text-white shadow-md'
                          : 'text-secondary/70 hover:text-secondary'
                      }`}
                    >
                      تسجيل
                    </button>
                  </div>

                  {/* Forms */}
                  <AnimatePresence mode="wait">
                    {mode === 'login' ? (
                      <motion.div
                        key="login"
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: 20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <LoginForm 
                          onSwitchToRegister={handleSwitchToRegister}
                          onSuccess={handleAuthSuccess}
                        />
                      </motion.div>
                    ) : (
                      <motion.div
                        key="register"
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                      >
                        <RegisterForm 
                          onSwitchToLogin={handleSwitchToLogin}
                          onSuccess={handleAuthSuccess}
                        />
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Divider */}
                  <div className="flex items-center gap-4 my-8">
                    <div className="flex-1 h-px bg-secondary/20" />
                    <span className="text-secondary/50 text-sm font-dubai">أو</span>
                    <div className="flex-1 h-px bg-secondary/20" />
                  </div>

                  {/* Social Login (placeholder for future implementation) */}
                  <div className="space-y-3">
                    <button
                      type="button"
                      className="w-full py-3 px-4 rounded-full border-2 border-secondary/20 bg-white hover:bg-secondary/5 text-secondary font-semibold transition-all duration-300 flex items-center justify-center gap-2 font-dubai"
                    >
                      <svg className="w-5 h-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      المتابعة مع Google
                    </button>
                  </div>

                  {/* Terms & Privacy */}
                  <p className="text-xs text-secondary text-center mt-6 font-dubai leading-relaxed">
                    بالمتابعة، أنت توافق على{' '}
                    <a href="#" className="text-secondary hover:text-secondary/70 font-semibold hover:underline">شروط الخدمة</a>
                    {' '}و{' '}
                    <a href="#" className="text-secondary hover:text-secondary/70 font-semibold hover:underline">سياسة الخصوصية</a>
                  </p>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>,
    document.body
  );
};

export default AuthModal;
