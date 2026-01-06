'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2 } from 'lucide-react';
import Button from '@/components/ui/Button';
import { staggerFormFields, fieldVariant } from '@/lib/animations/modalVariants';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    let strength = 0;
    if (password.length >= 8) strength++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++;
    if (/\d/.test(password)) strength++;
    if (/[^a-zA-Z\d]/.test(password)) strength++;
    return strength;
  };

  const passwordStrength = getPasswordStrength(formData.password);
  const strengthColors = ['bg-red-500', 'bg-orange-500', 'bg-yellow-500', 'bg-green-500'];
  const strengthLabels = ['ضعيفة', 'متوسطة', 'جيدة', 'قوية'];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'اسم العائلة مطلوب';
    if (!formData.email.trim()) {
      newErrors.email = 'البريد الإلكتروني مطلوب';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'البريد الإلكتروني غير صالح';
    }
    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    }
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'كلمة المرور غير متطابقة';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsLoading(true);
    setErrors({});
    setSuccessMessage('');
    
    try {
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage(data.message);
        // Wait 2 seconds then switch to login
        setTimeout(() => {
          onSwitchToLogin();
        }, 2000);
      } else {
        // Handle specific error
        if (data.error === 'EMAIL_EXISTS') {
          setErrors({ email: data.message });
        } else if (data.errors) {
          // Validation errors
          const newErrors: {[key: string]: string} = {};
          data.errors.forEach((err: { field: string; message: string }) => {
            newErrors[err.field] = err.message;
          });
          setErrors(newErrors);
        } else {
          setErrors({ general: data.message });
        }
      }
    } catch (err) {
      setErrors({ general: 'حدث خطأ غير متوقع. يرجى المحاولة مرة أخرى' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <motion.form
      variants={staggerFormFields}
      initial="hidden"
      animate="visible"
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-2xl text-sm font-dubai flex items-center gap-2"
        >
          <CheckCircle2 size={18} />
          {successMessage}
        </motion.div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-dubai"
        >
          {errors.general}
        </motion.div>
      )}

      {/* First Name */}
      <motion.div variants={fieldVariant}>
        <label className="block text-sm font-semibold text-secondary mb-2 font-dubai">
          الاسم الأول
        </label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            placeholder="أحمد"
            className={`w-full px-4 pr-12 py-3.5 rounded-full border-2 ${
              errors.firstName ? 'border-red-500' : 'border-accent'
            } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai`}
          />
        </div>
        {errors.firstName && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
            <AlertCircle size={14} />
            {errors.firstName}
          </p>
        )}
      </motion.div>

      {/* Last Name */}
      <motion.div variants={fieldVariant}>
        <label className="block text-sm font-semibold text-secondary mb-2 font-dubai">
          اسم العائلة
        </label>
        <div className="relative">
          <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type="text"
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            placeholder="محمد"
            className={`w-full px-4 pr-12 py-3.5 rounded-full border-2 ${
              errors.lastName ? 'border-red-500' : 'border-accent'
            } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai`}
          />
        </div>
        {errors.lastName && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
            <AlertCircle size={14} />
            {errors.lastName}
          </p>
        )}
      </motion.div>

      {/* Email */}
      <motion.div variants={fieldVariant}>
        <label className="block text-sm font-semibold text-secondary mb-2 font-dubai">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="example@email.com"
            className={`w-full px-4 pr-12 py-3.5 rounded-full border-2 ${
              errors.email ? 'border-red-500' : 'border-accent'
            } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai`}
          />
        </div>
        {errors.email && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
            <AlertCircle size={14} />
            {errors.email}
          </p>
        )}
      </motion.div>

      {/* Password */}
      <motion.div variants={fieldVariant}>
        <label className="block text-sm font-semibold text-secondary mb-2 font-dubai">
          كلمة المرور
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full px-4 pr-12 pl-12 py-3.5 rounded-full border-2 ${
              errors.password ? 'border-red-500' : 'border-accent'
            } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
        {/* Password Strength Indicator */}
        {formData.password && (
          <div className="mt-2">
            <div className="flex gap-1 mb-1">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    index < passwordStrength ? strengthColors[passwordStrength - 1] : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-secondary/70 font-dubai">
              قوة كلمة المرور: {strengthLabels[passwordStrength - 1] || 'ضعيفة جداً'}
            </p>
          </div>
        )}
        {errors.password && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
            <AlertCircle size={14} />
            {errors.password}
          </p>
        )}
      </motion.div>

      {/* Confirm Password */}
      <motion.div variants={fieldVariant}>
        <label className="block text-sm font-semibold text-secondary mb-2 font-dubai">
          تأكيد كلمة المرور
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            placeholder="••••••••"
            className={`w-full px-4 pr-12 pl-12 py-3.5 rounded-full border-2 ${
              errors.confirmPassword ? 'border-red-500' : 'border-accent'
            } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai`}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {formData.confirmPassword && formData.password === formData.confirmPassword && (
            <CheckCircle2 className="absolute left-12 top-1/2 -translate-y-1/2 text-green-500" size={20} />
          )}
        </div>
        {errors.confirmPassword && (
          <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
            <AlertCircle size={14} />
            {errors.confirmPassword}
          </p>
        )}
      </motion.div>

      {/* Register Button */}
      <motion.div variants={fieldVariant} className="pt-2">
        <Button
          type="submit"
          variant="primary"
          className="w-full py-3.5 rounded-full text-lg font-bold shadow-lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              جاري إنشاء الحساب...
            </span>
          ) : (
            'إنشاء حساب'
          )}
        </Button>
      </motion.div>

      {/* Switch to Login */}
      <motion.div variants={fieldVariant} className="text-center pt-2">
        <p className="text-secondary/70 font-dubai">
          لديك حساب بالفعل؟{' '}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-primary hover:text-primary/80 font-bold transition-colors"
          >
            تسجيل الدخول
          </button>
        </p>
      </motion.div>
    </motion.form>
  );
};

export default RegisterForm;
