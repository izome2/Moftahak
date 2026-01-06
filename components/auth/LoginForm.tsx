'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { staggerFormFields, fieldVariant } from '@/lib/animations/modalVariants';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Translate error messages to Arabic
        const errorMessages: { [key: string]: string } = {
          'CredentialsSignin': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
          'البريد الإلكتروني وكلمة المرور مطلوبان': 'البريد الإلكتروني وكلمة المرور مطلوبان',
          'البريد الإلكتروني أو كلمة المرور غير صحيحة': 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
        };
        
        setError(errorMessages[result.error] || 'فشل تسجيل الدخول. يرجى التحقق من بياناتك');
      } else if (result?.ok) {
        // Success - close modal and refresh
        if (onSuccess) onSuccess();
        window.location.reload();
      }
    } catch (err) {
      setError('حدث خطأ غير متوقع');
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
      className="space-y-6"
    >
      {/* Email Input */}
      <motion.div variants={fieldVariant}>
        <label className="block text-sm font-semibold text-secondary mb-2 font-dubai">
          البريد الإلكتروني
        </label>
        <div className="relative">
          <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@email.com"
            required
            className="w-full px-4 pr-12 py-3.5 rounded-full border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai"
          />
        </div>
      </motion.div>

      {/* Password Input */}
      <motion.div variants={fieldVariant}>
        <label className="block text-sm font-semibold text-secondary mb-2 font-dubai">
          كلمة المرور
        </label>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            required
            className="w-full px-4 pr-12 pl-12 py-3.5 rounded-full border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary transition-colors"
          >
            {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>
      </motion.div>

      {/* Error Message */}
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-2xl text-sm font-dubai"
        >
          {error}
        </motion.div>
      )}

      {/* Forgot Password */}
      <motion.div variants={fieldVariant} className="text-left">
        <button
          type="button"
          className="text-sm text-primary hover:text-primary/80 font-semibold transition-colors font-dubai"
        >
          نسيت كلمة المرور؟
        </button>
      </motion.div>

      {/* Login Button */}
      <motion.div variants={fieldVariant}>
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
              جاري تسجيل الدخول...
            </span>
          ) : (
            'تسجيل الدخول'
          )}
        </Button>
      </motion.div>

      {/* Switch to Register */}
      <motion.div variants={fieldVariant} className="text-center pt-4">
        <p className="text-secondary/70 font-dubai">
          ليس لديك حساب؟{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-primary hover:text-primary/80 font-bold transition-colors"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;
