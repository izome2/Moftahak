'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Lock, Eye, EyeOff, Phone } from 'lucide-react';
import { signIn } from 'next-auth/react';
import Button from '@/components/ui/Button';
import { staggerFormFields, fieldVariant } from '@/lib/animations/modalVariants';
import { isEmail, isPhone, looksLikePhone, normalizePhone } from '@/lib/validations/auth';

interface LoginFormProps {
  onSwitchToRegister: () => void;
  onSwitchToForgotPassword: () => void;
  onSuccess?: () => void;
}

const LoginForm: React.FC<LoginFormProps> = ({ onSwitchToRegister, onSwitchToForgotPassword, onSuccess }) => {
  const [showPassword, setShowPassword] = useState(false);
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Detect if input LOOKS LIKE email or phone (for UI hints)
  const startsWithLetter = /^[a-zA-Z]/.test(identifier);
  const inputType = identifier.includes('@') || startsWithLetter ? 'email' : 'phone';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate input
    if (!identifier.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف');
      setIsLoading(false);
      return;
    }

    if (!isEmail(identifier) && !isPhone(identifier)) {
      setError('يرجى إدخال بريد إلكتروني أو رقم هاتف صالح');
      setIsLoading(false);
      return;
    }
    
    try {
      // Normalize phone number if it's a phone
      const normalizedIdentifier = isPhone(identifier) ? normalizePhone(identifier) : identifier;
      
      const result = await signIn('credentials', {
        identifier: normalizedIdentifier,
        password,
        redirect: false,
      });

      if (result?.error) {
        // Translate error messages to Arabic
        const errorMessages: { [key: string]: string } = {
          'CredentialsSignin': 'البيانات غير صحيحة',
          'البريد الإلكتروني/رقم الهاتف وكلمة المرور مطلوبان': 'البريد الإلكتروني/رقم الهاتف وكلمة المرور مطلوبان',
          'البيانات غير صحيحة': 'البيانات غير صحيحة',
          'البريد الإلكتروني أو رقم الهاتف غير صالح': 'البريد الإلكتروني أو رقم الهاتف غير صالح',
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
      {/* Email/Phone Input */}
      <motion.div variants={fieldVariant}>
        <div className="relative">
          {inputType === 'email' ? (
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          ) : (
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          )}
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="رقم الهاتف أو البريد الإلكتروني"
            required
            className="w-full px-4 pr-12 py-3.5 rounded-full border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai text-right"
          />
        </div>
      </motion.div>

      {/* Password Input */}
      <motion.div variants={fieldVariant}>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="كلمة المرور"
            required
            className="w-full px-4 pr-12 pl-12 py-3.5 rounded-full border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai text-right"
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
          onClick={onSwitchToForgotPassword}
          className="text-sm text-secondary hover:text-secondary/70 font-semibold transition-colors font-dubai"
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
        <p className="text-secondary font-dubai">
          ليس لديك حساب؟{' '}
          <button
            type="button"
            onClick={onSwitchToRegister}
            className="text-secondary hover:text-secondary/70 font-bold transition-colors"
          >
            إنشاء حساب جديد
          </button>
        </p>
      </motion.div>
    </motion.form>
  );
};

export default LoginForm;
