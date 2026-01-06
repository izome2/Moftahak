'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User as UserIcon, Lock, Image as ImageIcon } from 'lucide-react';
import { useSession } from 'next-auth/react';
import AvatarUpload from './AvatarUpload';
import ProfileForm from './ProfileForm';
import PasswordChangeForm from './PasswordChangeForm';
import { overlayVariants, slideInRight, slideInLeft } from '@/lib/animations/modalVariants';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'profile' | 'password';
}

const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, 
  onClose, 
  defaultTab = 'profile' 
}) => {
  const { data: session, update } = useSession();
  const [activeTab, setActiveTab] = useState<'profile' | 'password'>(defaultTab);

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

  // Reset tab when modal closes
  useEffect(() => {
    if (!isOpen) {
      setTimeout(() => setActiveTab(defaultTab), 300);
    }
  }, [isOpen, defaultTab]);

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

  const handleImageChange = async (imageUrl: string) => {
    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imageUrl }),
      });

      if (response.ok) {
        await update({ image: imageUrl });
      }
    } catch (error) {
      console.error('Error updating image:', error);
    }
  };

  return (
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
            className="fixed inset-0 bg-black/40 backdrop-blur-md z-50"
            style={{ touchAction: 'none' }}
          />

          {/* Modal Container */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <div className="w-full max-w-6xl h-[90vh] max-h-200 flex relative pointer-events-auto">
              
              {/* Left Side - Background (Desktop only) */}
              <motion.div
                variants={slideInLeft}
                initial="hidden"
                animate="visible"
                exit="exit"
                className="hidden lg:flex lg:w-1/2 relative rounded-r-3xl overflow-hidden"
              >
                {/* Background Image with Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center"
                  style={{ 
                    backgroundImage: "url('https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800')",
                  }}
                />
                <div className="absolute inset-0 bg-linear-to-t from-secondary via-secondary/80 to-secondary/60" />
                
                {/* Content */}
                <div className="relative z-10 p-12 flex flex-col justify-end text-white">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.6 }}
                  >
                    {/* Logo */}
                    <div className="mb-3">
                      <img 
                        src="logos/logo-white-icon.png" 
                        alt="مفتاحك" 
                        className="h-20 w-auto"
                      />
                    </div>
                    <p className="text-xl mb-8 text-[#ead3b9] font-dubai">
                      إدارة حسابك وإعداداتك الشخصية
                    </p>
                    
                    {/* Bottom Elements */}
                    <div className="flex gap-4 mt-8">
                      <button className="px-6 py-3 rounded-2xl bg-white/20 backdrop-blur-lg border border-white/30 text-white hover:bg-white/30 transition-all duration-300 font-dubai font-semibold">
                        تعرف أكثر
                      </button>
                      <button className="px-6 py-3 rounded-2xl bg-primary/90 backdrop-blur-lg border border-primary text-secondary hover:bg-primary transition-all duration-300 font-dubai font-semibold">
                        تواصل معنا
                      </button>
                    </div>
                  </motion.div>
                </div>
              </motion.div>

              {/* Right Side - Settings Content */}
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

                {/* Content */}
                <div className="p-8 md:p-12">
                  {/* Header */}
                  <div className="mb-8 text-center">
                    <h1 className="text-4xl font-bold text-secondary mb-2 font-dubai">
                      الإعدادات
                    </h1>
                    <p className="text-secondary/70 font-dubai">
                      قم بتحديث معلومات حسابك
                    </p>
                  </div>

                  {/* Tabs */}
                  <div className="flex gap-2 mb-8 bg-white rounded-2xl p-2 shadow-sm">
                    <button
                      onClick={() => setActiveTab('profile')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-dubai ${
                        activeTab === 'profile'
                          ? 'bg-secondary text-white font-semibold shadow-md'
                          : 'text-secondary/70 hover:bg-accent/50 hover:text-secondary'
                      }`}
                    >
                      <UserIcon size={20} />
                      الملف الشخصي
                    </button>
                    <button
                      onClick={() => setActiveTab('password')}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl transition-all font-dubai ${
                        activeTab === 'password'
                          ? 'bg-secondary text-white font-semibold shadow-md'
                          : 'text-secondary/70 hover:bg-accent/50 hover:text-secondary'
                      }`}
                    >
                      <Lock size={20} />
                      كلمة المرور
                    </button>
                  </div>

                  {/* Content Area */}
                  <div className="space-y-6">
                    {activeTab === 'profile' && (
                      <>
                        {/* Avatar Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(16,48,43,0.12)] border border-primary/10">
                          <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3 font-dubai pb-4 border-b border-primary/10">
                            <div className="p-2 bg-primary/10 rounded-xl">
                              <ImageIcon size={20} className="text-secondary" />
                            </div>
                            الصورة الشخصية
                          </h3>
                          <AvatarUpload
                            currentImage={session?.user?.image}
                            onImageChange={handleImageChange}
                          />
                        </div>

                        {/* Profile Info Section */}
                        <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(16,48,43,0.12)] border border-primary/10">
                          <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3 font-dubai pb-4 border-b border-primary/10">
                            <div className="p-2 bg-primary/10 rounded-xl">
                              <UserIcon size={20} className="text-secondary" />
                            </div>
                            المعلومات الشخصية
                          </h3>
                          <ProfileForm />
                        </div>
                      </>
                    )}

                    {activeTab === 'password' && (
                      <div className="bg-white rounded-2xl p-6 shadow-[0_8px_30px_rgba(16,48,43,0.12)] border border-primary/10">
                        <h3 className="text-xl font-bold text-secondary mb-6 flex items-center gap-3 font-dubai pb-4 border-b border-primary/10">
                          <div className="p-2 bg-primary/10 rounded-xl">
                            <Lock size={20} className="text-secondary" />
                          </div>
                          تغيير كلمة المرور
                        </h3>
                        <PasswordChangeForm />
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default SettingsModal;
