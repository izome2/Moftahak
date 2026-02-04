'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { User, Mail, Phone } from 'lucide-react';
import Button from '@/components/ui/Button';

interface ProfileFormProps {
  onSuccess?: () => void;
}

const ProfileForm: React.FC<ProfileFormProps> = ({ onSuccess }) => {
  const { data: session, update } = useSession();
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    firstName: session?.user?.firstName || '',
    lastName: session?.user?.lastName || '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('تم تحديث المعلومات بنجاح');
        
        // Update session
        await update({
          firstName: formData.firstName,
          lastName: formData.lastName,
        });

        if (onSuccess) onSuccess();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'حدث خطأ أثناء التحديث');
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-2 border-green-200 text-green-700 px-5 py-4 rounded-2xl text-sm font-dubai shadow-sm flex items-center gap-3"
        >
          <span className="w-2 h-2 rounded-full bg-green-500"></span>
          {successMessage}
        </motion.div>
      )}

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border-2 border-red-200 text-red-700 px-5 py-4 rounded-2xl text-sm font-dubai shadow-sm flex items-center gap-3"
        >
          <span className="w-2 h-2 rounded-full bg-red-500"></span>
          {error}
        </motion.div>
      )}

      {/* First Name */}
      <div>
        <label className="block text-sm font-bold text-secondary mb-3 font-dubai">
          الاسم الأول
        </label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            required
            className="w-full px-4 pr-12 py-4 rounded-xl border-2 border-primary/20 bg-white text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300 font-dubai shadow-sm hover:border-primary/40"
          />
        </div>
      </div>

      {/* Last Name */}
      <div>
        <label className="block text-sm font-bold text-secondary mb-3 font-dubai">
          اسم العائلة
        </label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            required
            className="w-full px-4 pr-12 py-4 rounded-xl border-2 border-primary/20 bg-white text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300 font-dubai shadow-sm hover:border-primary/40"
          />
        </div>
      </div>

      {/* Email or Phone (readonly) */}
      <div>
        <label className="block text-sm font-bold text-secondary mb-3 font-dubai">
          {session?.user?.phone ? 'رقم الهاتف' : 'البريد الإلكتروني'}
        </label>
        <div className="relative">
          {session?.user?.phone ? (
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          ) : (
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          )}
          <input
            type={session?.user?.phone ? 'tel' : 'email'}
            value={session?.user?.phone 
              ? `+${session.user.phone.startsWith('20') ? session.user.phone.replace(/^20/, '20 ') : session.user.phone.startsWith('966') ? session.user.phone.replace(/^966/, '966 ') : session.user.phone}`
              : session?.user?.email || ''}
            readOnly
            dir="ltr"
            className="w-full px-4 pr-12 py-4 rounded-xl border-2 border-accent bg-accent/30 text-secondary/60 cursor-not-allowed font-dubai"
          />
        </div>
        <p className="mt-2 text-xs text-secondary/50 font-dubai flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary/30"></span>
          {session?.user?.phone ? 'لا يمكن تغيير رقم الهاتف' : 'لا يمكن تغيير البريد الإلكتروني'}
        </p>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        variant="primary"
        className="w-full py-4 text-base shadow-[0_4px_15px_rgba(16,48,43,0.2)] hover:shadow-[0_6px_20px_rgba(16,48,43,0.3)]"
        disabled={isLoading}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            جاري الحفظ...
          </span>
        ) : (
          'حفظ التغييرات'
        )}
      </Button>
    </form>
  );
};

export default ProfileForm;
