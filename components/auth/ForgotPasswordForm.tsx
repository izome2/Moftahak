'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { signIn } from 'next-auth/react';
import { Mail, Phone, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, ArrowRight, Loader2 } from 'lucide-react';
import { isEmail, isPhone, looksLikePhone, normalizePhone } from '@/lib/validations/auth';
import { staggerFormFields, fieldVariant } from '@/lib/animations/modalVariants';
import { 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { 
  getFirebaseAuth, 
  createRecaptchaVerifier, 
  RecaptchaVerifier 
} from '@/lib/firebase';

interface ForgotPasswordFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

type Step = 'request' | 'verify' | 'reset' | 'success';
type VerificationMethod = 'email' | 'phone';

const ForgotPasswordForm: React.FC<ForgotPasswordFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  const [step, setStep] = useState<Step>('request');
  const [identifier, setIdentifier] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [verificationMethod, setVerificationMethod] = useState<VerificationMethod>('email');
  const [resendCooldown, setResendCooldown] = useState(0);
  
  // Firebase phone verification
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaCounterRef = useRef(0);
  
  // Cooldown timer effect
  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => setResendCooldown(resendCooldown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);
  
  // Cleanup recaptcha on unmount
  useEffect(() => {
    return () => {
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {
          // Ignore cleanup errors
        }
      }
    };
  }, [recaptchaVerifier]);
  
  // Initialize reCAPTCHA for phone
  const initRecaptcha = useCallback(async () => {
    if (!recaptchaContainerRef.current) return null;
    
    try {
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      
      // Create unique ID for recaptcha widget
      recaptchaCounterRef.current += 1;
      const widgetId = `forgot-recaptcha-widget-${recaptchaCounterRef.current}`;
      
      // Create new div for recaptcha
      const existingWidget = recaptchaContainerRef.current.querySelector(`#${widgetId}`);
      if (!existingWidget) {
        recaptchaContainerRef.current.innerHTML = '';
        const newDiv = document.createElement('div');
        newDiv.id = widgetId;
        recaptchaContainerRef.current.appendChild(newDiv);
      }
      
      // Small delay to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Create new verifier with unique container ID (same pattern as RegisterForm)
      const verifier = createRecaptchaVerifier(widgetId);
      setRecaptchaVerifier(verifier);
      return verifier;
    } catch (err) {
      console.error('Failed to initialize reCAPTCHA:', err);
      return null;
    }
  }, [recaptchaVerifier]);
  
  // Detect if input LOOKS LIKE email or phone (for UI hints)
  const inputType = looksLikePhone(identifier) ? 'phone' : 'email';

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!identifier.trim()) {
      setError('يرجى إدخال البريد الإلكتروني أو رقم الهاتف');
      return;
    }
    
    // Validate using actual validators (not just UI hints)
    const isEmailInput = isEmail(identifier);
    const isPhoneInput = isPhone(identifier);
    
    if (!isEmailInput && !isPhoneInput) {
      setError('يرجى إدخال بريد إلكتروني أو رقم هاتف صالح');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Normalize phone if it's a phone number
      const normalizedIdentifier = isPhoneInput ? normalizePhone(identifier) : identifier;
      
      // First check if user exists and get method preference
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier: normalizedIdentifier }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        if (data.requiresPhoneVerification) {
          // Phone verification via Firebase
          setVerificationMethod('phone');
          
          // Initialize reCAPTCHA and send SMS
          const verifier = await initRecaptcha();
          if (!verifier) {
            setError('فشل تهيئة التحقق. يرجى تحديث الصفحة.');
            setIsLoading(false);
            return;
          }
          
          const auth = getFirebaseAuth();
          // Format phone for Firebase (needs + prefix)
          const firebasePhone = `+${normalizedIdentifier}`;
          
          const result = await signInWithPhoneNumber(auth, firebasePhone, verifier);
          setConfirmationResult(result);
          setSuccessMessage('تم إرسال رمز التحقق إلى هاتفك');
          setResendCooldown(60); // Start 60 second cooldown
          setStep('verify');
          setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        } else {
          // Email verification
          setVerificationMethod('email');
          setSuccessMessage('تم إرسال رمز التحقق إلى بريدك الإلكتروني');
          setResendCooldown(60); // Start 60 second cooldown
          setStep('verify');
          setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
        }
      } else {
        setError(data.message);
      }
    } catch (err) {
      console.error('Forgot password error:', err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/invalid-phone-number') {
        setError('رقم الهاتف غير صالح');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setError('تم إرسال عدد كبير من الرسائل. يرجى المحاولة لاحقاً.');
      } else {
        setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setError('');
    
    // Auto-focus next input
    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
    
    // Auto-verify when all digits are entered
    if (digit && index === 5 && newOtp.every(d => d)) {
      // Don't auto-submit, let user click verify button
      // This prevents issues with async Firebase verification
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      // Don't auto-submit, let user click verify button
    }
  };

  const handleVerifyAndProceed = async () => {
    if (!otp.every(d => d)) {
      setError('يرجى إدخال رمز التحقق كاملاً');
      return;
    }
    
    setError('');
    setIsLoading(true);
    
    try {
      if (verificationMethod === 'phone' && confirmationResult) {
        // Verify Firebase OTP for phone
        await confirmationResult.confirm(otp.join(''));
        // Firebase verification successful, proceed to reset
        setStep('reset');
      } else {
        // Email - verify OTP with server first
        const response = await fetch('/api/auth/verify-reset-code', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            identifier,
            code: otp.join(''),
          }),
        });
        
        const data = await response.json();
        
        if (data.success) {
          setStep('reset');
        } else {
          setError(data.message || 'رمز التحقق غير صحيح');
          setOtp(['', '', '', '', '', '']);
          otpInputRefs.current[0]?.focus();
        }
      }
    } catch (err) {
      console.error('OTP verification error:', err);
      const firebaseError = err as { code?: string };
      if (firebaseError.code === 'auth/invalid-verification-code') {
        setError('رمز التحقق غير صحيح');
      } else if (firebaseError.code === 'auth/code-expired') {
        setError('انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.');
      } else {
        setError('حدث خطأ في التحقق. يرجى المحاولة مرة أخرى.');
      }
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!newPassword) {
      setError('يرجى إدخال كلمة المرور الجديدة');
      return;
    }
    
    if (newPassword.length < 8) {
      setError('كلمة المرور يجب أن تكون 8 أحرف على الأقل');
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setError('كلمة المرور غير متطابقة');
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Normalize identifier if it's a phone number
      const isPhoneInput = isPhone(identifier) || looksLikePhone(identifier);
      const normalizedIdentifier = isPhoneInput ? normalizePhone(identifier) : identifier;
      
      const response = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          identifier: normalizedIdentifier,
          code: otp.join(''),
          newPassword,
          confirmPassword,
        }),
      });
      
      const data = await response.json();
      
      if (data.success) {
        setStep('success');
        
        // Auto-login after password reset
        const loginIdentifier = isPhoneInput ? normalizedIdentifier : identifier;
        const loginResult = await signIn('credentials', {
          identifier: loginIdentifier,
          password: newPassword,
          redirect: false,
        });
        
        setTimeout(() => {
          if (loginResult?.ok) {
            // Success - close modal and refresh
            if (onSuccess) onSuccess();
            window.location.href = window.location.pathname;
          } else {
            // If auto-login fails, switch to login form
            if (onSuccess) onSuccess();
            onSwitchToLogin();
          }
        }, 1500);
      } else {
        setError(data.message);
        if (data.message.includes('منتهي الصلاحية') || data.message.includes('غير صالح')) {
          // Go back to verify step
          setStep('verify');
        }
      }
    } catch {
      setError('حدث خطأ غير متوقع. يرجى المحاولة لاحقاً.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderRequestStep = () => (
    <motion.form
      variants={staggerFormFields}
      initial="hidden"
      animate="visible"
      onSubmit={handleRequestCode}
      className="space-y-6"
    >
      <motion.div variants={fieldVariant}>
        <p className="text-secondary/70 font-dubai text-center mb-6">
          أدخل بريدك الإلكتروني أو رقم هاتفك المسجل وسنرسل لك رمز التحقق
        </p>
      </motion.div>

      <motion.div variants={fieldVariant}>
        <div className="relative">
          {inputType === 'phone' ? (
            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          ) : (
            <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          )}
          <input
            type="text"
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            placeholder="البريد الإلكتروني أو رقم الهاتف"
            className="w-full px-4 pr-12 py-3.5 rounded-full border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai text-right"
          />
        </div>
      </motion.div>

      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-red-400 text-red-600 px-4 py-3 rounded-2xl text-sm font-dubai flex items-center gap-2 shadow-md"
        >
          <AlertCircle size={18} />
          {error}
        </motion.div>
      )}

      <motion.div variants={fieldVariant}>
        <button
          type="submit"
          disabled={isLoading}
          className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg ${
            isLoading
              ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
              : 'bg-primary text-secondary cursor-pointer'
          }`}
        >
          {isLoading ? (
            <span className="flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin" />
              جاري الإرسال...
            </span>
          ) : (
            'إرسال رمز التحقق'
          )}
        </button>
      </motion.div>

      <motion.div variants={fieldVariant} className="text-center">
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-secondary hover:text-secondary/70 font-dubai flex items-center gap-2 mx-auto"
        >
          <ArrowRight size={18} />
          العودة لتسجيل الدخول
        </button>
      </motion.div>
    </motion.form>
  );

  const renderVerifyStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center">
        <p className="text-secondary/70 font-dubai mb-2">
          تم إرسال رمز التحقق إلى
        </p>
        <p className="text-secondary font-bold font-dubai">
          {identifier}
        </p>
      </div>

      {successMessage && (
        <div className="bg-white border-2 border-primary text-secondary px-4 py-3 rounded-2xl text-sm font-dubai flex items-center gap-2 shadow-md">
          <CheckCircle2 size={18} className="text-primary" />
          {successMessage}
        </div>
      )}

      <div className="flex justify-center gap-2" dir="ltr">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={el => { otpInputRefs.current[index] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={digit}
            onChange={(e) => handleOtpChange(index, e.target.value)}
            onKeyDown={(e) => handleOtpKeyDown(index, e)}
            onPaste={handleOtpPaste}
            className={`w-12 h-14 text-center text-xl font-bold rounded-xl border-2 ${
              digit ? 'border-primary' : 'border-accent'
            } bg-white text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors`}
          />
        ))}
      </div>

      {error && (
        <div className="bg-white border-2 border-red-400 text-red-600 px-4 py-3 rounded-2xl text-sm font-dubai flex items-center gap-2 shadow-md">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleVerifyAndProceed}
        disabled={!otp.every(d => d) || isLoading}
        className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg flex items-center justify-center gap-2 ${
          !otp.every(d => d) || isLoading
            ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
            : 'bg-primary text-secondary cursor-pointer'
        }`}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري التحقق...
          </>
        ) : (
          'التالي'
        )}
      </button>

      <div className="text-center space-y-2">
        <button
          type="button"
          onClick={() => {
            if (resendCooldown === 0) {
              setOtp(['', '', '', '', '', '']);
              setError('');
              setSuccessMessage('');
              handleRequestCode({ preventDefault: () => {} } as React.FormEvent);
            }
          }}
          disabled={resendCooldown > 0 || isLoading}
          className={`text-sm font-dubai ${
            resendCooldown > 0 || isLoading
              ? 'text-secondary/40 cursor-not-allowed'
              : 'text-primary hover:text-primary/70 cursor-pointer'
          }`}
        >
          {resendCooldown > 0 
            ? `إعادة إرسال الرمز بعد ${resendCooldown} ثانية`
            : 'إعادة إرسال الرمز'
          }
        </button>
        
        <button
          type="button"
          onClick={() => setStep('request')}
          className="text-secondary hover:text-secondary/70 font-dubai flex items-center gap-2 mx-auto"
        >
          <ArrowRight size={18} />
          {verificationMethod === 'phone' ? 'تغيير رقم الهاتف' : 'تغيير البريد الإلكتروني'}
        </button>
      </div>
    </motion.div>
  );

  const renderResetStep = () => (
    <motion.form
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      onSubmit={handleResetPassword}
      className="space-y-6"
    >
      <div className="text-center">
        <p className="text-secondary/70 font-dubai">
          أدخل كلمة المرور الجديدة
        </p>
      </div>

      <div>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type={showPassword ? 'text' : 'password'}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            placeholder="كلمة المرور الجديدة"
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
      </div>

      <div>
        <div className="relative">
          <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="تأكيد كلمة المرور"
            className="w-full px-4 pr-12 pl-12 py-3.5 rounded-full border-2 border-accent bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai text-right"
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-secondary/50 hover:text-secondary transition-colors"
          >
            {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
          {confirmPassword && newPassword === confirmPassword && (
            <CheckCircle2 className="absolute left-12 top-1/2 -translate-y-1/2 text-green-500" size={20} />
          )}
        </div>
      </div>

      {error && (
        <div className="bg-white border-2 border-red-400 text-red-600 px-4 py-3 rounded-2xl text-sm font-dubai flex items-center gap-2 shadow-md">
          <AlertCircle size={18} />
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg ${
          isLoading
            ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
            : 'bg-primary text-secondary cursor-pointer'
        }`}
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            جاري التحديث...
          </span>
        ) : (
          'تحديث كلمة المرور'
        )}
      </button>
    </motion.form>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <div className="w-24 h-24 bg-primary rounded-full flex items-center justify-center mx-auto shadow-lg">
        <CheckCircle2 className="w-14 h-14 text-white" strokeWidth={2.5} />
      </div>
      <div>
        <h3 className="text-xl font-bold text-secondary font-dubai mb-2">
          تم تغيير كلمة المرور بنجاح
        </h3>
        <p className="text-secondary/70 font-dubai">
          يمكنك الآن تسجيل الدخول بكلمة المرور الجديدة
        </p>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-5">
      {/* reCAPTCHA container for phone verification */}
      <div ref={recaptchaContainerRef} className="hidden" />
      
      {step === 'request' && renderRequestStep()}
      {step === 'verify' && renderVerifyStep()}
      {step === 'reset' && renderResetStep()}
      {step === 'success' && renderSuccessStep()}
    </div>
  );
};

export default ForgotPasswordForm;
