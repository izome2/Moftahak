'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle, Loader2, RefreshCw, ShieldCheck, ChevronDown } from 'lucide-react';
import { 
  signInWithPhoneNumber, 
  ConfirmationResult,
  PhoneAuthProvider,
  signInWithCredential
} from 'firebase/auth';
import { 
  getFirebaseAuth, 
  createRecaptchaVerifier, 
  formatPhoneNumberForFirebase,
  isValidEgyptianPhone,
  RecaptchaVerifier
} from '@/lib/firebase';

interface FirebasePhoneVerificationProps {
  phoneNumber: string;
  isVerified: boolean;
  error?: string;
  onPhoneChange: (phone: string, keepVerification?: boolean) => void;
  onVerified: (verified: boolean) => void;
}

// localStorage key for phone verification
const VERIFICATION_STORAGE_KEY = 'moftahak_phone_verified';
const VERIFICATION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours (1 day)

// Extract local phone number from full number with country code
const extractLocalPhone = (fullPhone: string, code: '+20' | '+966'): string => {
  const digits = fullPhone.replace(/\D/g, '');
  const countryPrefix = code.replace('+', '');
  
  if (digits.startsWith(countryPrefix)) {
    return digits.slice(countryPrefix.length);
  }
  return digits;
};

export default function FirebasePhoneVerification({ 
  phoneNumber, 
  isVerified, 
  error,
  onPhoneChange,
  onVerified 
}: FirebasePhoneVerificationProps) {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const [recaptchaVerifier, setRecaptchaVerifier] = useState<RecaptchaVerifier | null>(null);
  const [countryCode, setCountryCode] = useState<'+20' | '+966'>('+20');
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  
  // Local phone display state (without country code)
  const [localPhone, setLocalPhone] = useState(() => extractLocalPhone(phoneNumber, '+20'));
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const recaptchaContainerRef = useRef<HTMLDivElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Sync local phone when phoneNumber prop changes externally
  useEffect(() => {
    const extracted = extractLocalPhone(phoneNumber, countryCode);
    if (extracted !== localPhone && !isVerified) {
      setLocalPhone(extracted);
    }
  }, [phoneNumber, countryCode, isVerified, localPhone]);

  // Check localStorage for existing verification on mount
  useEffect(() => {
    if (phoneNumber && !isVerified) {
      const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (stored) {
        try {
          const { phone: storedPhone, expiresAt, countryCode: storedCountryCode } = JSON.parse(stored);
          // Normalize phone numbers for comparison
          const normalizedStored = storedPhone.replace(/\D/g, '').slice(-10);
          const normalizedCurrent = phoneNumber.replace(/\D/g, '').slice(-10);
          
          // Only auto-verify if it's the SAME phone number and not expired
          if (normalizedStored === normalizedCurrent && new Date(expiresAt) > new Date()) {
            // Restore country code from localStorage
            if (storedCountryCode && (storedCountryCode === '+20' || storedCountryCode === '+966')) {
              setCountryCode(storedCountryCode);
            }
            onVerified(true);
          } else {
            // Different phone or expired - reset verification state
            onVerified(false);
            if (new Date(expiresAt) <= new Date()) {
              localStorage.removeItem(VERIFICATION_STORAGE_KEY);
            }
          }
        } catch {
          localStorage.removeItem(VERIFICATION_STORAGE_KEY);
          onVerified(false);
        }
      } else {
        // No stored verification
        onVerified(false);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phoneNumber]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Store previous phone to detect changes
  const prevPhoneRef = useRef(phoneNumber);

  // Reset state when phone changes
  useEffect(() => {
    // Only reset if phone actually changed (not on every render)
    if (prevPhoneRef.current !== phoneNumber) {
      prevPhoneRef.current = phoneNumber;
      setShowOtpInput(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError(null);
      setConfirmationResult(null);
      
      // Check if new phone is already verified in localStorage
      const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (stored) {
        try {
          const { phone: storedPhone, expiresAt } = JSON.parse(stored);
          const normalizedStored = storedPhone.replace(/\D/g, '').slice(-10);
          const normalizedCurrent = phoneNumber.replace(/\D/g, '').slice(-10);
          
          if (normalizedStored === normalizedCurrent && new Date(expiresAt) > new Date()) {
            onVerified(true);
            return;
          }
        } catch {
          // Ignore parse errors
        }
      }
      onVerified(false);
    }
  }, [phoneNumber, onVerified]);

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

  // Validate phone based on country code
  const isValidPhone = countryCode === '+20' 
    ? isValidEgyptianPhone(localPhone)
    : /^5[0-9]{8}$/.test(localPhone);

  const handlePhoneChange = (value: string) => {
    // Only allow numbers and limit based on country code
    const maxLength = countryCode === '+20' ? 11 : 9; // Egypt: 11 digits (01xxxxxxxxx), Saudi: 9 digits (5xxxxxxxx)
    const cleaned = value.replace(/\D/g, '').slice(0, maxLength);
    setLocalPhone(cleaned);
    onPhoneChange(cleaned);
  };

  const handleSendOtp = useCallback(async () => {
    // Validate phone based on country code
    let phoneValid = false;
    if (countryCode === '+20') {
      phoneValid = isValidEgyptianPhone(localPhone);
    } else if (countryCode === '+966') {
      // Saudi numbers: start with 5 and are 9 digits
      phoneValid = /^5[0-9]{8}$/.test(localPhone);
    }
    
    if (!phoneValid) {
      if (countryCode === '+20') {
        setOtpError('رقم الهاتف غير صالح. يجب أن يبدأ بـ 010, 011, 012, أو 015');
      } else {
        setOtpError('رقم الهاتف غير صالح. يجب أن يبدأ بـ 5');
      }
      return;
    }

    // Check rate limiting in localStorage
    const rateLimitKey = 'moftahak_phone_otp_rate';
    const rateLimit = localStorage.getItem(rateLimitKey);
    if (rateLimit) {
      const { count, resetAt } = JSON.parse(rateLimit);
      if (new Date(resetAt) > new Date() && count >= 3) {
        const remainingMinutes = Math.ceil((new Date(resetAt).getTime() - Date.now()) / 60000);
        setOtpError(`تم إرسال عدد كبير من الطلبات. يرجى الانتظار ${remainingMinutes} دقيقة.`);
        return;
      }
      if (new Date(resetAt) <= new Date()) {
        localStorage.removeItem(rateLimitKey);
      }
    }

    setIsSending(true);
    setOtpError(null);

    try {
      const auth = getFirebaseAuth();
      
      // Clear existing recaptcha if any
      if (recaptchaVerifier) {
        recaptchaVerifier.clear();
      }
      
      // Create new recaptcha verifier
      const verifier = createRecaptchaVerifier('recaptcha-container');
      setRecaptchaVerifier(verifier);
      
      // Format phone number for Firebase with country code
      const formattedPhone = `${countryCode}${localPhone}`;
      
      // Send OTP
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, verifier);
      setConfirmationResult(confirmation);
      
      // Update rate limiting
      const currentRate = rateLimit ? JSON.parse(rateLimit) : { count: 0, resetAt: new Date(Date.now() + 5 * 60 * 1000).toISOString() };
      if (new Date(currentRate.resetAt) <= new Date()) {
        currentRate.count = 1;
        currentRate.resetAt = new Date(Date.now() + 5 * 60 * 1000).toISOString();
      } else {
        currentRate.count += 1;
      }
      localStorage.setItem(rateLimitKey, JSON.stringify(currentRate));
      
      setShowOtpInput(true);
      setCountdown(60); // 60 seconds countdown for resend
      
      // Focus first OTP input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      console.error('Firebase phone auth error:', err);
      
      // Handle specific Firebase errors
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/invalid-phone-number') {
        setOtpError('رقم الهاتف غير صالح');
      } else if (firebaseError.code === 'auth/too-many-requests') {
        setOtpError('تم إرسال عدد كبير من الطلبات. يرجى المحاولة لاحقاً.');
      } else if (firebaseError.code === 'auth/captcha-check-failed') {
        setOtpError('فشل التحقق من reCAPTCHA. يرجى إعادة المحاولة.');
      } else if (firebaseError.code === 'auth/quota-exceeded') {
        setOtpError('تم تجاوز الحد المسموح. يرجى المحاولة غداً.');
      } else if (firebaseError.code === 'auth/billing-not-enabled') {
        setOtpError('خدمة SMS غير مفعلة. يرجى التواصل مع الدعم الفني.');
      } else if (firebaseError.code === 'auth/internal-error') {
        setOtpError('خطأ داخلي. يرجى التأكد من تفعيل Phone Authentication في Firebase.');
      } else {
        setOtpError('حدث خطأ في إرسال رمز التحقق. يرجى المحاولة مرة أخرى.');
      }
      
      // Clear recaptcha on error (safely)
      if (recaptchaVerifier) {
        try {
          recaptchaVerifier.clear();
        } catch {
          // Ignore clear errors
        }
        setRecaptchaVerifier(null);
      }
    } finally {
      setIsSending(false);
    }
  }, [localPhone, recaptchaVerifier, countryCode]);

  const handleOtpChange = (index: number, value: string) => {
    // Only allow single digit
    const digit = value.replace(/\D/g, '').slice(-1);
    
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);
    setOtpError(null);

    // Auto-focus next input
    if (digit && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }

    // Auto-verify when all digits entered
    if (newOtp.every(d => d !== '') && newOtp.join('').length === 6) {
      verifyOtp(newOtp.join(''));
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
    
    if (pastedData.length === 6) {
      const newOtp = pastedData.split('');
      setOtp(newOtp);
      inputRefs.current[5]?.focus();
      verifyOtp(pastedData);
    }
  };

  const verifyOtp = async (code: string) => {
    if (!confirmationResult) {
      setOtpError('انتهت صلاحية الجلسة. يرجى طلب رمز جديد.');
      return;
    }

    setIsVerifying(true);
    setOtpError(null);

    try {
      // Verify the OTP code with Firebase
      const result = await confirmationResult.confirm(code);
      
      // Get the user's ID token for server-side verification
      const idToken = await result.user.getIdToken();
      
      // Full phone number with country code (without +)
      const fullPhoneNumber = `${countryCode.replace('+', '')}${localPhone}`;
      
      // Save verification to server
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

      // Save to localStorage for 24 hours
      const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS).toISOString();
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify({
        phone: fullPhoneNumber,
        countryCode: countryCode,
        expiresAt,
      }));

      // Update the phone number in form to include country code (keepVerification = true)
      onPhoneChange(fullPhoneNumber, true);
      onVerified(true);
    } catch (err: unknown) {
      console.error('OTP verification error:', err);
      
      const firebaseError = err as { code?: string; message?: string };
      if (firebaseError.code === 'auth/invalid-verification-code') {
        setOtpError('رمز التحقق غير صحيح. يرجى المحاولة مرة أخرى.');
      } else if (firebaseError.code === 'auth/code-expired') {
        setOtpError('انتهت صلاحية رمز التحقق. يرجى طلب رمز جديد.');
      } else {
        setOtpError(firebaseError.message || 'حدث خطأ في التحقق. يرجى المحاولة مرة أخرى.');
      }
      
      setOtp(['', '', '', '', '', '']);
      inputRefs.current[0]?.focus();
    } finally {
      setIsVerifying(false);
    }
  };

  // Verified state
  if (isVerified) {
    return (
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="p-3 md:p-4 rounded-xl bg-primary/10 border-2 border-primary/30"
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-primary/20 flex items-center justify-center">
            <CheckCircle className="w-5 h-5 md:w-6 md:h-6 text-secondary" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-secondary font-dubai text-sm md:text-base">تم التحقق من رقم الهاتف</p>
            <p className="text-secondary/60 text-xs font-bristone" dir="ltr">
              {countryCode} {localPhone || extractLocalPhone(phoneNumber, countryCode)}
            </p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
      {/* Phone Input */}
      <div>
        <label className="block text-xs md:text-sm font-medium text-secondary mb-1.5 md:mb-2 font-dubai">
          رقم الهاتف للتحقق <span className="text-red-500">*</span>
        </label>
        <div className="relative">
          <div className="absolute right-3 md:right-4 top-1/2 -translate-y-1/2 text-secondary/40">
            <Phone className="w-4 h-4 md:w-5 md:h-5" />
          </div>
          {/* Country Code Selector - Custom Dropdown */}
          <div ref={dropdownRef} className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2">
            <button
              type="button"
              onClick={() => !showOtpInput && setShowCountryDropdown(!showCountryDropdown)}
              disabled={showOtpInput && countdown > 0}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-secondary/10 text-xs md:text-sm font-bristone text-secondary hover:bg-secondary/15 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              dir="ltr"
            >
              <span>{countryCode === '+20' ? '🇪🇬 +20' : '🇸🇦 +966'}</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showCountryDropdown ? 'rotate-180' : ''}`} />
            </button>
            
            <AnimatePresence>
              {showCountryDropdown && (
                <motion.div
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.15 }}
                  className="absolute bottom-full left-0 mb-2 w-36 bg-[#f5f5f5] rounded-xl shadow-[0_8px_20px_rgba(16,48,43,0.15)] border border-secondary/10 overflow-hidden z-[9999]"
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
            dir="ltr"
            value={localPhone}
            onChange={(e) => handlePhoneChange(e.target.value)}
            placeholder="1234567890"
            disabled={showOtpInput && countdown > 0}
            className="w-full pr-10 md:pr-12 pl-24 md:pl-28 py-2.5 md:py-3 rounded-xl border-2 bg-white/50 focus:outline-none focus:border-primary transition-all font-bristone text-left text-sm md:text-base disabled:bg-secondary/5 disabled:cursor-not-allowed border-secondary/20"
          />
        </div>
        <p className="mt-1 md:mt-1.5 text-[10px] md:text-xs text-secondary/50 font-dubai">
          سيتم إرسال رمز تحقق SMS إلى هذا الرقم
        </p>
      </div>

      {/* reCAPTCHA Container (invisible) */}
      <div id="recaptcha-container" ref={recaptchaContainerRef}></div>

      {/* Verification Button */}
      {!showOtpInput && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3 md:p-4 rounded-xl bg-primary/10 border border-primary/20"
        >
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
            <div className="flex items-start gap-2 md:gap-3 flex-1">
              <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4 md:w-5 md:h-5 text-secondary" />
              </div>
              <div>
                <p className="font-medium text-secondary font-dubai text-xs md:text-sm">
                  التحقق من رقم الهاتف مطلوب
                </p>
                <p className="text-secondary/60 text-[10px] md:text-xs font-dubai mt-0.5 md:mt-1">
                  سنرسل رسالة SMS تحتوي على رمز مكون من 6 أرقام
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending || !isValidPhone}
              className={`
                w-full md:w-auto px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all font-dubai text-sm
                flex items-center justify-center gap-2 md:shrink-0
                ${isValidPhone 
                  ? 'bg-primary text-secondary hover:bg-primary/90' 
                  : 'bg-secondary/10 text-secondary/40 cursor-not-allowed'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSending ? (
                <>
                  <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" />
                  جاري الإرسال...
                </>
              ) : (
                <>
                  <Phone className="w-4 h-4 md:w-5 md:h-5" />
                  إرسال رمز التحقق
                </>
              )}
            </button>
          </div>
          
          {(error || otpError) && (
            <p className="mt-2 text-sm text-red-500 font-dubai text-center">{error || otpError}</p>
          )}
        </motion.div>
      )}

      {/* OTP Input */}
      <AnimatePresence>
        {showOtpInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-3 md:p-5 rounded-xl bg-secondary/5 border border-secondary/10">
              <p className="text-xs md:text-sm text-secondary/70 mb-3 md:mb-4 text-center font-dubai">
                أدخل رمز التحقق المكون من 6 أرقام المرسل إلى
                <span className="font-bold text-secondary block mt-1 font-bristone text-xs md:text-sm" dir="ltr">
                  {countryCode} {phoneNumber}
                </span>
              </p>

              {/* OTP Boxes */}
              <div 
                className="flex justify-center gap-1.5 md:gap-2 mb-3 md:mb-4" 
                dir="ltr"
                onPaste={handlePaste}
              >
                {otp.map((digit, index) => (
                  <input
                    key={index}
                    ref={(el) => { inputRefs.current[index] = el; }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    onKeyDown={(e) => handleKeyDown(index, e)}
                    disabled={isVerifying}
                    className={`
                      w-9 h-11 md:w-11 md:h-14 text-center text-lg md:text-xl font-bold rounded-lg border-2
                      focus:outline-none focus:border-primary
                      transition-all font-bristone
                      disabled:bg-secondary/10 disabled:cursor-not-allowed
                      ${otpError ? 'border-red-400' : 'border-secondary/20'}
                    `}
                  />
                ))}
              </div>

              {/* Error */}
              {otpError && (
                <p className="text-sm text-red-500 text-center mb-3 font-dubai">{otpError}</p>
              )}

              {/* Verifying Loader */}
              {isVerifying && (
                <div className="flex items-center justify-center gap-2 text-secondary/70">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  <span className="text-sm font-dubai">جاري التحقق...</span>
                </div>
              )}

              {/* Resend */}
              {!isVerifying && (
                <div className="text-center">
                  {countdown > 0 ? (
                    <p className="text-sm text-secondary/50 font-dubai">
                      إعادة إرسال الرمز بعد {countdown} ثانية
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={handleSendOtp}
                      disabled={isSending}
                      className="inline-flex items-center gap-2 text-sm text-primary hover:text-primary/80 font-medium font-dubai"
                    >
                      <RefreshCw className="w-4 h-4" />
                      إعادة إرسال الرمز
                    </button>
                  )}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
