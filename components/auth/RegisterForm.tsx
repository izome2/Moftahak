'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle2, Phone, ChevronDown, Loader2, RefreshCw, ArrowLeft, ArrowRight } from 'lucide-react';
import { signIn } from 'next-auth/react';
import { isEmail, normalizePhone } from '@/lib/validations/auth';
import { 
  signInWithPhoneNumber, 
  ConfirmationResult 
} from 'firebase/auth';
import { 
  getFirebaseAuth, 
  createRecaptchaVerifier, 
  isValidEgyptianPhone,
  RecaptchaVerifier
} from '@/lib/firebase';

interface RegisterFormProps {
  onSwitchToLogin: () => void;
  onSuccess?: () => void;
}

type RegistrationMethod = 'email' | 'phone' | null;

const RegisterForm: React.FC<RegisterFormProps> = ({ onSwitchToLogin, onSuccess }) => {
  // Registration method (null = selection screen, 'email' or 'phone' = form)
  const [registrationMethod, setRegistrationMethod] = useState<RegistrationMethod>(null);
  
  // Mobile step (1 = names, 2 = rest of form)
  const [mobileStep, setMobileStep] = useState(1);
  
  // Form data
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Phone verification
  const [countryCode, setCountryCode] = useState<'+20' | '+966'>('+20');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  // UI states
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errors, setErrors] = useState<{[key: string]: string}>({});

  // Refs
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const recaptchaCounterRef = useRef(0);

  // Clean and validate phone number based on country code
  const cleanPhoneNumber = (phone: string, code: '+20' | '+966'): string => {
    // Remove all non-digits except + at the beginning
    let cleaned = phone.replace(/[^\d+]/g, '');
    
    if (code === '+20') {
      // Egyptian number
      // Remove country code if present
      if (cleaned.startsWith('+20')) {
        cleaned = cleaned.substring(3);
      } else if (cleaned.startsWith('20') && cleaned.length > 10) {
        cleaned = cleaned.substring(2);
      }
      // Remove leading 0 if present
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      return cleaned; // Should be 10 digits like 1095058413
    } else {
      // Saudi number
      // Remove country code if present
      if (cleaned.startsWith('+966')) {
        cleaned = cleaned.substring(4);
      } else if (cleaned.startsWith('966') && cleaned.length > 9) {
        cleaned = cleaned.substring(3);
      }
      // Remove leading 0 if present
      if (cleaned.startsWith('0')) {
        cleaned = cleaned.substring(1);
      }
      return cleaned; // Should be 9 digits like 512345678
    }
  };
  
  // Format phone for display (country code + local number)
  const formatPhoneForDisplay = (): string => {
    const cleaned = cleanPhoneNumber(formData.phone, countryCode);
    return `${countryCode} ${cleaned}`;
  };

  // Validate phone based on country code (accepts various formats)
  const isValidPhoneNumber = (() => {
    const cleaned = cleanPhoneNumber(formData.phone, countryCode);
    
    if (countryCode === '+20') {
      // Egyptian: 10 digits starting with 1[0125]
      return /^1[0125]\d{8}$/.test(cleaned);
    } else {
      // Saudi: 9 digits starting with 5
      return /^5\d{8}$/.test(cleaned);
    }
  })();

  // Countdown timer
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowCountryDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const goBackToSelection = () => {
    setRegistrationMethod(null);
    setMobileStep(1);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: ''
    });
    setErrors({});
    setIsPhoneVerified(false);
    setShowOtpInput(false);
    setOtp(['', '', '', '', '', '']);
  };

  // Mobile step validation
  const canProceedToStep2 = formData.firstName.trim() !== '' && formData.lastName.trim() !== '';
  
  const handleMobileNextStep = () => {
    const newErrors: {[key: string]: string} = {};
    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'اسم العائلة مطلوب';
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }
    setMobileStep(2);
  };

  // Send OTP for phone verification
  const handleSendOtp = useCallback(async () => {
    if (!isValidPhoneNumber) {
      setErrors({ phone: 'رقم الهاتف غير صالح' });
      return;
    }

    setIsSendingOtp(true);
    setErrors({});

    try {
      // First, check if phone already exists
      const cleanedPhone = cleanPhoneNumber(formData.phone, countryCode);
      const formattedPhone = `${countryCode}${cleanedPhone}`;
      
      const checkResponse = await fetch('/api/auth/check-phone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone: formattedPhone }),
      });
      
      const checkData = await checkResponse.json();
      
      if (checkData.exists) {
        setErrors({ phone: 'رقم الهاتف مسجل بالفعل. هل تريد تسجيل الدخول؟' });
        setIsSendingOtp(false);
        return;
      }
      
      const auth = getFirebaseAuth();
      
      // Clear existing verifier if present
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {
          // Ignore cleanup errors
        }
        setRecaptchaVerifier(null);
      }
      
      // Clear the container content
      if (recaptchaContainerRef.current) {
        recaptchaContainerRef.current.innerHTML = '';
      }
      
      // Increment counter for unique widget ID
      recaptchaCounterRef.current += 1;
      const containerId = `recaptcha-widget-${recaptchaCounterRef.current}`;
      
      // Create a new div inside the container
      if (recaptchaContainerRef.current) {
        const newDiv = document.createElement('div');
        newDiv.id = containerId;
        recaptchaContainerRef.current.appendChild(newDiv);
      }
      
      // Small delay to ensure DOM is updated
      await new Promise(resolve => setTimeout(resolve, 50));
      
      // Create new verifier with unique container ID
      const verifier = createRecaptchaVerifier(containerId);
      setRecaptchaVerifier(verifier);
      
      // Use already cleaned and formatted phone number
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      
      setShowOtpInput(true);
      setCountdown(60);
      
      setTimeout(() => otpInputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      console.error('Firebase phone auth error:', err);
      
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/invalid-phone-number') {
        setErrors({ phone: 'رقم الهاتف غير صالح' });
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setErrors({ phone: 'تم إرسال عدد كبير من الطلبات. يرجى المحاولة لاحقاً.' });
      } else if (firebaseError.code === 'auth/invalid-app-credential') {
        setErrors({ phone: 'خطأ في التحقق الأمني. يرجى تحديث الصفحة والمحاولة مرة أخرى.' });
      } else if (firebaseError.code === 'auth/captcha-check-failed') {
        setErrors({ phone: 'فشل التحقق الأمني. يرجى تحديث الصفحة والمحاولة مرة أخرى.' });
      } else {
        setErrors({ phone: 'حدث خطأ في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.' });
      }
      
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {
          // Ignore
        }
        setRecaptchaVerifier(null);
      }
    } finally {
      setIsSendingOtp(false);
    }
  }, [formData.phone, countryCode, recaptchaVerifier, isValidPhoneNumber]);

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setErrors({});

    if (digit && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }

    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
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
      otpInputRefs.current[5]?.focus();
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) {
      setErrors({ otp: 'انتهت صلاحية الجلسة. يرجى طلب رمز جديد.' });
      return;
    }

    setIsVerifyingOtp(true);
    setErrors({});

    try {
      const result = await confirmationResult.confirm(code);
      const idToken = await result.user.getIdToken();
      
      // Clean phone number and format for storage
      const cleanedPhone = cleanPhoneNumber(formData.phone, countryCode);
      const fullPhoneNumber = `${countryCode.replace('+', '')}${cleanedPhone}`;
      
      const response = await fetch('/api/phone-verification/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          phoneNumber: fullPhoneNumber,
          firebaseUid: result.user.uid,
          idToken: idToken
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل حفظ التحقق');
      }

      setFormData(prev => ({ ...prev, phone: fullPhoneNumber }));
      setIsPhoneVerified(true);
      setShowOtpInput(false);
    } catch (err: unknown) {
      console.error('OTP verification error:', err);
      
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/invalid-verification-code') {
        setErrors({ otp: 'رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.' });
      } else if (firebaseError.code === 'auth/code-expired') {
        setErrors({ otp: 'انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.' });
      } else {
        setErrors({ otp: firebaseError.message || 'حدث خطأ في التحقق. يرجى المحاولة مرة أخرى.' });
      }
      
      setOtp(['', '', '', '', '', '']);
      otpInputRefs.current[0]?.focus();
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName.trim()) newErrors.firstName = 'الاسم الأول مطلوب';
    if (!formData.lastName.trim()) newErrors.lastName = 'اسم العائلة مطلوب';
    
    if (registrationMethod === 'email') {
      if (!formData.email.trim()) {
        newErrors.email = 'البريد الإلكتروني مطلوب';
      } else if (!isEmail(formData.email)) {
        newErrors.email = 'البريد الإلكتروني غير صالح';
      }
    } else if (registrationMethod === 'phone') {
      if (!isPhoneVerified) {
        newErrors.phone = 'يجب التحقق من رقم الهاتف أولاً';
      }
    }

    if (!formData.password) {
      newErrors.password = 'كلمة المرور مطلوبة';
    } else if (formData.password.length < 8) {
      newErrors.password = 'كلمة المرور يجب أن تكون 8 أحرف على الأقل';
    } else if (!/[a-z]/.test(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف صغير';
    } else if (!/[A-Z]/.test(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على حرف كبير';
    } else if (!/[0-9]/.test(formData.password)) {
      newErrors.password = 'كلمة المرور يجب أن تحتوي على رقم';
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
      // Build full phone number with country code (cleaned)
      let fullPhoneNumber: string | undefined;
      if (registrationMethod === 'phone') {
        const cleanedPhone = cleanPhoneNumber(formData.phone, countryCode);
        fullPhoneNumber = `${countryCode}${cleanedPhone}`.replace(/[^0-9+]/g, '');
      }
      
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: registrationMethod === 'email' ? formData.email : undefined,
          phone: fullPhoneNumber,
          password: formData.password,
          confirmPassword: formData.confirmPassword,
          phoneVerified: registrationMethod === 'phone' ? isPhoneVerified : undefined,
        }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccessMessage('تم إنشاء الحساب بنجاح! جاري تسجيل الدخول...');
        
        // Auto-login after successful registration
        // For phone, normalize the number to match database format
        const loginIdentifier = registrationMethod === 'email' 
          ? formData.email 
          : normalizePhone(fullPhoneNumber || '');
        
        const loginResult = await signIn('credentials', {
          identifier: loginIdentifier,
          password: formData.password,
          redirect: false,
        });
        
        if (loginResult?.ok) {
          // Success - close modal
          if (onSuccess) onSuccess();
          // Use replace to avoid back button issues
          window.location.href = window.location.pathname;
        } else {
          // If auto-login fails, show message and redirect to login
          console.error('Auto-login failed:', loginResult?.error);
          setSuccessMessage('تم إنشاء الحساب! يرجى تسجيل الدخول.');
          setTimeout(() => {
            onSwitchToLogin();
          }, 2000);
        }
      } else {
        console.error('Registration failed:', data);
        if (data.error === 'EMAIL_EXISTS') {
          setErrors({ email: 'هذا البريد الإلكتروني مسجل بالفعل. هل تريد تسجيل الدخول؟' });
        } else if (data.error === 'PHONE_EXISTS') {
          setErrors({ phone: 'هذا الرقم مسجل بالفعل. هل تريد تسجيل الدخول؟' });
        } else if (data.errors) {
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
    <div className="space-y-5">
      {/* Success Message */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-primary text-secondary px-4 py-3 rounded-2xl text-sm font-dubai flex items-center gap-2 shadow-md"
        >
          <CheckCircle2 size={18} className="text-primary" />
          {successMessage}
        </motion.div>
      )}

      {/* General Error Message */}
      {errors.general && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white border-2 border-red-400 text-red-600 px-4 py-3 rounded-2xl text-sm font-dubai shadow-md"
        >
          {errors.general}
        </motion.div>
      )}

      {/* Hidden recaptcha container */}
      <div ref={recaptchaContainerRef} className="hidden" />

      <AnimatePresence mode="wait">
        {/* Method Selection Screen */}
        {registrationMethod === null ? (
          <motion.div
            key="selection"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <h3 className="text-center text-lg font-semibold text-secondary font-dubai mb-6">
              كيف تريد إنشاء حسابك؟
            </h3>
            
            <button
              type="button"
              onClick={() => setRegistrationMethod('phone')}
              className="w-full p-4 rounded-2xl border-2 border-accent bg-white hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Phone className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-right flex-1">
                <p className="font-semibold text-secondary font-dubai">برقم الهاتف</p>
                <p className="text-sm text-secondary/60 font-dubai">سنرسل لك رمز تحقق عبر SMS</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-secondary/50" />
            </button>

            <button
              type="button"
              onClick={() => setRegistrationMethod('email')}
              className="w-full p-4 rounded-2xl border-2 border-accent bg-white hover:border-primary hover:bg-primary/5 transition-all flex items-center gap-4"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Mail className="w-6 h-6 text-secondary" />
              </div>
              <div className="text-right flex-1">
                <p className="font-semibold text-secondary font-dubai">بالبريد الإلكتروني</p>
                <p className="text-sm text-secondary/60 font-dubai">أدخل بريدك الإلكتروني وكلمة مرور</p>
              </div>
              <ArrowLeft className="w-5 h-5 text-secondary/50" />
            </button>

            {/* Switch to Login */}
            <div className="text-center pt-4">
              <p className="text-secondary font-dubai">
                لديك حساب بالفعل؟{' '}
                <button
                  type="button"
                  onClick={onSwitchToLogin}
                  className="text-secondary hover:text-secondary/70 font-bold transition-colors"
                >
                  تسجيل الدخول
                </button>
              </p>
            </div>
          </motion.div>
        ) : (
          /* Registration Form */
          <motion.form
            key="form"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* ===== MOBILE STEP 1: Names Only ===== */}
            <div className={`md:hidden ${mobileStep === 1 ? 'block' : 'hidden'}`}>
              <div className="space-y-4">
                {/* First Name - Full Width on Mobile */}
                <div>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="الاسم الأول"
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
                </div>

                {/* Last Name - Full Width on Mobile */}
                <div>
                  <div className="relative">
                    <User className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="اسم العائلة"
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
                </div>

                {/* Next Button - Mobile Step 1 */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleMobileNextStep}
                    disabled={!canProceedToStep2}
                    className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg ${
                      !canProceedToStep2
                        ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
                        : 'bg-primary text-secondary cursor-pointer'
                    }`}
                  >
                    التالي
                  </button>
                </div>
              </div>
            </div>

            {/* ===== MOBILE STEP 2: Phone/Email + Password ===== */}
            <div className={`md:hidden ${mobileStep === 2 ? 'block' : 'hidden'}`}>
              <div className="space-y-4">
                {/* Email - only for email method */}
                {registrationMethod === 'email' && (
                  <div>
                    <div className="relative">
                      <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                      <input
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="البريد الإلكتروني"
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
                  </div>
                )}

                {/* Password */}
                <div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="كلمة المرور"
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
                  {errors.password && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
                      <AlertCircle size={14} />
                      {errors.password}
                    </p>
                  )}
                </div>

                {/* Confirm Password */}
                <div>
                  <div className="relative">
                    <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      placeholder="تأكيد كلمة المرور"
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
                </div>

                {/* Phone Section - only for phone method */}
                {registrationMethod === 'phone' && (
                  <div className="space-y-3">
                    {isPhoneVerified ? (
                      <div className="p-3 rounded-xl bg-white border-2 border-primary shadow-md">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <CheckCircle2 className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-secondary font-dubai text-sm">تم التحقق من رقم الهاتف</p>
                            <p className="text-secondary/70 text-xs font-bristone" dir="ltr">
                              {formatPhoneForDisplay()}
                            </p>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div>
                          <div className="relative">
                            <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                            <div ref={dropdownRef} className="absolute left-2 top-1/2 -translate-y-1/2">
                              <button
                                type="button"
                                onClick={() => !showOtpInput && setShowCountryDropdown(!showCountryDropdown)}
                                disabled={showOtpInput}
                                className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-bristone text-secondary transition-all disabled:opacity-50"
                                dir="ltr"
                              >
                                <span>{countryCode === '+20' ? '🇪🇬' : '🇸🇦'}</span>
                                <span className="font-medium text-xs">{countryCode}</span>
                                <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                              </button>
                              <AnimatePresence>
                                {showCountryDropdown && (
                                  <motion.div
                                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                    transition={{ duration: 0.15 }}
                                    className="absolute bottom-full left-0 mb-2 w-36 bg-[#f5f5f5] rounded-xl shadow-lg border border-secondary/10 overflow-hidden z-50"
                                    dir="ltr"
                                  >
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCountryCode('+20');
                                        setShowCountryDropdown(false);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm font-bristone flex items-center gap-2 transition-colors ${
                                        countryCode === '+20' ? 'bg-[#e0e0e0] text-secondary font-medium' : 'text-secondary/70 hover:bg-[#ebebeb]'
                                      }`}
                                    >
                                      <span>🇪🇬</span>
                                      <span>مصر +20</span>
                                    </button>
                                    <div className="h-px bg-secondary/10"></div>
                                    <button
                                      type="button"
                                      onClick={() => {
                                        setCountryCode('+966');
                                        setShowCountryDropdown(false);
                                      }}
                                      className={`w-full px-4 py-2.5 text-left text-sm font-bristone flex items-center gap-2 transition-colors ${
                                        countryCode === '+966' ? 'bg-[#e0e0e0] text-secondary font-medium' : 'text-secondary/70 hover:bg-[#ebebeb]'
                                      }`}
                                    >
                                      <span>🇸🇦</span>
                                      <span>السعودية +966</span>
                                    </button>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </div>
                            <input
                              type="tel"
                              name="phone"
                              value={formData.phone}
                              onChange={(e) => {
                                const maxLength = countryCode === '+20' ? 11 : 9;
                                const cleaned = e.target.value.replace(/\D/g, '').slice(0, maxLength);
                                setFormData(prev => ({ ...prev, phone: cleaned }));
                                if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                              }}
                              placeholder="رقم الهاتف"
                              disabled={showOtpInput}
                              className={`w-full px-4 pr-12 pl-28 py-3.5 rounded-full border-2 ${
                                errors.phone ? 'border-red-500' : 'border-accent'
                              } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai disabled:opacity-50 text-right`}
                            />
                          </div>
                          {errors.phone && (
                            <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
                              <AlertCircle size={14} />
                              {errors.phone}
                            </p>
                          )}
                        </div>
                        {!showOtpInput ? (
                          <button
                            type="button"
                            onClick={handleSendOtp}
                            disabled={isSendingOtp || !isValidPhoneNumber}
                            className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg ${
                              isSendingOtp || !isValidPhoneNumber
                                ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
                                : 'bg-primary text-secondary cursor-pointer'
                            }`}
                          >
                            {isSendingOtp ? (
                              <span className="flex items-center justify-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                جاري الإرسال...
                              </span>
                            ) : (
                              'إرسال رمز التحقق'
                            )}
                          </button>
                        ) : (
                          <div className="space-y-3">
                            <p className="text-sm text-secondary/70 font-dubai text-center">
                              أدخل رمز التحقق المرسل إلى {countryCode} {formData.phone}
                            </p>
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
                                  disabled={isVerifyingOtp}
                                  className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 ${
                                    errors.otp ? 'border-red-500' : digit ? 'border-primary' : 'border-accent'
                                  } bg-white text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50`}
                                />
                              ))}
                            </div>
                            {errors.otp && (
                              <p className="text-center text-sm text-red-600 font-dubai">{errors.otp}</p>
                            )}
                            {isVerifyingOtp && (
                              <div className="flex items-center justify-center gap-2 text-secondary/70">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                <span className="font-dubai text-sm">جاري التحقق...</span>
                              </div>
                            )}
                            <div className="text-center">
                              {countdown > 0 ? (
                                <p className="text-sm text-secondary/60 font-dubai">إعادة الإرسال خلال {countdown} ثانية</p>
                              ) : (
                                <button
                                  type="button"
                                  onClick={handleSendOtp}
                                  disabled={isSendingOtp}
                                  className="text-sm text-secondary hover:text-secondary/70 font-semibold transition-colors font-dubai flex items-center gap-2 mx-auto"
                                >
                                  <RefreshCw className={`w-4 h-4 ${isSendingOtp ? 'animate-spin' : ''}`} />
                                  إعادة إرسال الرمز
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                )}

                {/* Register Button - Mobile */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading || (registrationMethod === 'phone' && !isPhoneVerified)}
                    className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg ${
                      isLoading || (registrationMethod === 'phone' && !isPhoneVerified)
                        ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
                        : 'bg-primary text-secondary cursor-pointer'
                    }`}
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
                  </button>
                </div>
              </div>
            </div>

            {/* ===== DESKTOP: All fields in one view ===== */}
            <div className="hidden md:block space-y-4">
              {/* First Name & Last Name - Same Row */}
              <div className="flex gap-3">
                {/* First Name */}
                <div className="flex-1">
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50" size={18} />
                    <input
                      type="text"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      placeholder="الاسم الأول"
                      className={`w-full px-3 pr-10 py-3.5 rounded-full border-2 ${
                        errors.firstName ? 'border-red-500' : 'border-accent'
                      } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai text-sm`}
                    />
                  </div>
                  {errors.firstName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-dubai">
                      <AlertCircle size={12} />
                      {errors.firstName}
                    </p>
                  )}
                </div>

                {/* Last Name */}
                <div className="flex-1">
                  <div className="relative">
                    <User className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary/50" size={18} />
                    <input
                      type="text"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      placeholder="اسم العائلة"
                      className={`w-full px-3 pr-10 py-3.5 rounded-full border-2 ${
                        errors.lastName ? 'border-red-500' : 'border-accent'
                      } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai text-sm`}
                    />
                  </div>
                  {errors.lastName && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1 font-dubai">
                      <AlertCircle size={12} />
                      {errors.lastName}
                    </p>
                  )}
                </div>
              </div>

              {/* Email - only for email method */}
              {registrationMethod === 'email' && (
                <div>
                  <div className="relative">
                    <Mail className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="البريد الإلكتروني"
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
                </div>
              )}

              {/* Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="كلمة المرور"
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
                {errors.password && (
                  <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
                    <AlertCircle size={14} />
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="تأكيد كلمة المرور"
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
              </div>

              {/* Phone Section - only for phone method, at the bottom */}
              {registrationMethod === 'phone' && (
                <div className="space-y-3">
                  {/* Phone Verified State */}
                  {isPhoneVerified ? (
                    <div className="p-3 rounded-xl bg-white border-2 border-primary shadow-md">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                          <CheckCircle2 className="w-5 h-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-secondary font-dubai text-sm">تم التحقق من رقم الهاتف</p>
                          <p className="text-secondary/70 text-xs font-bristone" dir="ltr">
                            {formatPhoneForDisplay()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <>
                      {/* Phone Input */}
                      <div>
                        <div className="relative">
                          <Phone className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/50" size={20} />
                          
                          {/* Country Code Selector */}
                          <div ref={dropdownRef} className="absolute left-2.5 top-1/2 -translate-y-1/2">
                            <button
                              type="button"
                              onClick={() => !showOtpInput && setShowCountryDropdown(!showCountryDropdown)}
                              disabled={showOtpInput}
                              className="flex items-center gap-1.5 px-3 py-2 rounded-full bg-primary/10 border border-primary/30 text-sm font-bristone text-secondary transition-all disabled:opacity-50"
                              dir="ltr"
                            >
                              <span>{countryCode === '+20' ? '🇪🇬' : '🇸🇦'}</span>
                              <span className="font-medium text-xs">{countryCode}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
                            </button>
                            
                            <AnimatePresence>
                              {showCountryDropdown && (
                                <motion.div
                                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                                  animate={{ opacity: 1, y: 0, scale: 1 }}
                                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                                  transition={{ duration: 0.15 }}
                                  className="absolute bottom-full left-0 mb-2 w-36 bg-[#f5f5f5] rounded-xl shadow-lg border border-secondary/10 overflow-hidden z-50"
                                  dir="ltr"
                                >
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCountryCode('+20');
                                      setShowCountryDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-bristone flex items-center gap-2 transition-colors ${
                                      countryCode === '+20' 
                                        ? 'bg-[#e0e0e0] text-secondary font-medium' 
                                        : 'text-secondary/70 hover:bg-[#ebebeb]'
                                    }`}
                                  >
                                    <span>🇪🇬</span>
                                    <span>مصر +20</span>
                                  </button>
                                  <div className="h-px bg-secondary/10"></div>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setCountryCode('+966');
                                      setShowCountryDropdown(false);
                                    }}
                                    className={`w-full px-4 py-2.5 text-left text-sm font-bristone flex items-center gap-2 transition-colors ${
                                      countryCode === '+966' 
                                        ? 'bg-[#e0e0e0] text-secondary font-medium' 
                                        : 'text-secondary/70 hover:bg-[#ebebeb]'
                                    }`}
                                  >
                                    <span>🇸🇦</span>
                                    <span>السعودية +966</span>
                                  </button>
                                </motion.div>
                              )}
                            </AnimatePresence>
                          </div>
                          
                          <input
                            type="tel"
                            name="phone"
                            value={formData.phone}
                            onChange={(e) => {
                              const maxLength = countryCode === '+20' ? 11 : 9;
                              const cleaned = e.target.value.replace(/\D/g, '').slice(0, maxLength);
                              setFormData(prev => ({ ...prev, phone: cleaned }));
                              if (errors.phone) setErrors(prev => ({ ...prev, phone: '' }));
                            }}
                            placeholder="رقم الهاتف"
                            disabled={showOtpInput}
                            className={`w-full px-4 pr-12 pl-28 py-3.5 rounded-full border-2 ${
                              errors.phone ? 'border-red-500' : 'border-accent'
                            } bg-white text-secondary placeholder:text-secondary/50 focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all duration-300 shadow-md font-dubai disabled:opacity-50 text-right`}
                          />
                        </div>
                        {errors.phone && (
                          <p className="mt-1 text-sm text-red-600 flex items-center gap-1 font-dubai">
                            <AlertCircle size={14} />
                            {errors.phone}
                          </p>
                        )}
                      </div>

                      {/* OTP Section */}
                      {!showOtpInput ? (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp || !isValidPhoneNumber}
                          className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg ${
                            isSendingOtp || !isValidPhoneNumber
                              ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
                              : 'bg-primary text-secondary cursor-pointer'
                          }`}
                        >
                          {isSendingOtp ? (
                            <span className="flex items-center justify-center gap-2">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              جاري الإرسال...
                            </span>
                          ) : (
                            'إرسال رمز التحقق'
                          )}
                        </button>
                      ) : (
                        <div className="space-y-3">
                          <p className="text-sm text-secondary/70 font-dubai text-center">
                            أدخل رمز التحقق المرسل إلى {countryCode} {formData.phone}
                          </p>
                          
                          {/* OTP Inputs */}
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
                                disabled={isVerifyingOtp}
                                className={`w-11 h-13 text-center text-xl font-bold rounded-xl border-2 ${
                                  errors.otp ? 'border-red-500' : digit ? 'border-primary' : 'border-accent'
                                } bg-white text-secondary focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20 transition-colors disabled:opacity-50`}
                              />
                            ))}
                          </div>

                          {errors.otp && (
                            <p className="text-center text-sm text-red-600 font-dubai">
                              {errors.otp}
                            </p>
                          )}

                          {isVerifyingOtp && (
                            <div className="flex items-center justify-center gap-2 text-secondary/70">
                              <Loader2 className="w-5 h-5 animate-spin" />
                              <span className="font-dubai text-sm">جاري التحقق...</span>
                            </div>
                          )}

                          {/* Resend OTP */}
                          <div className="text-center">
                            {countdown > 0 ? (
                              <p className="text-sm text-secondary/60 font-dubai">
                                إعادة الإرسال خلال {countdown} ثانية
                              </p>
                            ) : (
                              <button
                                type="button"
                                onClick={handleSendOtp}
                                disabled={isSendingOtp}
                                className="text-sm text-secondary hover:text-secondary/70 font-semibold transition-colors font-dubai flex items-center gap-2 mx-auto"
                              >
                                <RefreshCw className={`w-4 h-4 ${isSendingOtp ? 'animate-spin' : ''}`} />
                                إعادة إرسال الرمز
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              )}

              {/* Register Button - Desktop */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isLoading || (registrationMethod === 'phone' && !isPhoneVerified)}
                  className={`w-full py-3.5 rounded-full text-lg font-bold font-dubai shadow-lg ${
                    isLoading || (registrationMethod === 'phone' && !isPhoneVerified)
                      ? 'bg-primary/50 text-secondary/50 cursor-not-allowed'
                      : 'bg-primary text-secondary cursor-pointer'
                  }`}
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
                </button>
              </div>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
};

export default RegisterForm;
