'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Lock, Eye, EyeOff } from 'lucide-react';
import Button from '@/components/ui/Button';

interface PasswordChangeFormProps {
  onSuccess?: () => void;
}

const PasswordChangeForm: React.FC<PasswordChangeFormProps> = ({ onSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [error, setError] = useState('');
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [formData, setFormData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccessMessage('');

    try {
      const response = await fetch('/api/user/password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('تم تغيير كلمة المرور بنجاح');
        
        // Reset form
        setFormData({
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
        });

        if (onSuccess) onSuccess();
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(''), 3000);
      } else {
        setError(data.message || 'حدث خطأ أثناء تغيير كلمة المرور');
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

      {/* Current Password */}
      <div>
        <label className="block text-sm font-bold text-secondary mb-3 font-dubai">
          كلمة المرور الحالية
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input
            type={showPasswords.current ? 'text' : 'password'}
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full pr-12 pl-12 py-4 rounded-xl border-2 border-primary/20 bg-white text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300 font-dubai shadow-sm hover:border-primary/40"
            placeholder="أدخل كلمة المرور الحالية"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('current')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary transition-colors"
          >
            {showPasswords.current ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-bold text-secondary mb-3 font-dubai">
          كلمة المرور الجديدة
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input
            type={showPasswords.new ? 'text' : 'password'}
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full pr-12 pl-12 py-4 rounded-xl border-2 border-primary/20 bg-white text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300 font-dubai shadow-sm hover:border-primary/40"
            placeholder="أدخل كلمة المرور الجديدة"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('new')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary transition-colors"
          >
            {showPasswords.new ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        <p className="text-xs text-secondary/50 mt-2 font-dubai flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-secondary/30"></span>
          يجب أن تحتوي على 8 أحرف على الأقل، حرف كبير، حرف صغير، ورقم
        </p>
      </div>

      {/* Confirm New Password */}
      <div>
        <label className="block text-sm font-bold text-secondary mb-3 font-dubai">
          تأكيد كلمة المرور الجديدة
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40" size={20} />
          <input
            type={showPasswords.confirm ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full pr-12 pl-12 py-4 rounded-xl border-2 border-primary/20 bg-white text-secondary placeholder:text-secondary/40 focus:outline-none focus:border-secondary focus:ring-4 focus:ring-secondary/10 transition-all duration-300 font-dubai shadow-sm hover:border-primary/40"
            placeholder="أعد إدخال كلمة المرور الجديدة"
            required
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => togglePasswordVisibility('confirm')}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/40 hover:text-secondary transition-colors"
          >
            {showPasswords.confirm ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 text-base shadow-[0_4px_15px_rgba(16,48,43,0.2)] hover:shadow-[0_6px_20px_rgba(16,48,43,0.3)]"
      >
        {isLoading ? 'جاري التحديث...' : 'تغيير كلمة المرور'}
      </Button>
    </form>
  );
};

export default PasswordChangeForm;
