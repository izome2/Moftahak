'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, CheckCircle, Loader2, RefreshCw, ShieldCheck } from 'lucide-react';

interface EmailVerificationProps {
  email: string;
  name: string;
  isVerified: boolean;
  error?: string;
  onVerified: (verified: boolean) => void;
}

export default function EmailVerification({ 
  email,
  name,
  isVerified, 
  error,
  onVerified 
}: EmailVerificationProps) {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  
  // localStorage key for email verification
  const VERIFICATION_STORAGE_KEY = 'moftahak_email_verified';
  const VERIFICATION_EXPIRY_MS = 10 * 60 * 1000; // 10 minutes

  // Check localStorage for existing verification on mount
  useEffect(() => {
    if (email && !isVerified) {
      const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (stored) {
        try {
          const { email: storedEmail, expiresAt } = JSON.parse(stored);
          if (storedEmail === email.toLowerCase() && new Date(expiresAt) > new Date()) {
            onVerified(true);
          } else {
            localStorage.removeItem(VERIFICATION_STORAGE_KEY);
          }
        } catch {
          localStorage.removeItem(VERIFICATION_STORAGE_KEY);
        }
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [email]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  // Store previous email to detect changes
  const prevEmailRef = useRef(email);

  // Reset state when email changes
  useEffect(() => {
    // Only reset if email actually changed (not on every render)
    if (prevEmailRef.current !== email) {
      prevEmailRef.current = email;
      setShowOtpInput(false);
      setOtp(['', '', '', '', '', '']);
      setOtpError(null);
      setVerificationId(null);
      
      // Check if new email is already verified in localStorage
      const stored = localStorage.getItem(VERIFICATION_STORAGE_KEY);
      if (stored) {
        try {
          const { email: storedEmail, expiresAt } = JSON.parse(stored);
          if (storedEmail === email.toLowerCase() && new Date(expiresAt) > new Date()) {
            onVerified(true);
            return;
          }
        } catch {
          // Ignore parse errors
        }
      }
      onVerified(false);
    }
  }, [email, onVerified]);

  const isValidEmail = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSendOtp = async () => {
    if (!isValidEmail) {
      setOtpError('البريد الإلكتروني غير صالح');
      return;
    }

    setIsSending(true);
    setOtpError(null);

    try {
      const response = await fetch('/api/email-verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, name }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'فشل إرسال رمز التحقق');
      }

      setVerificationId(data.verificationId);
      setShowOtpInput(true);
      setCountdown(60); // 60 seconds countdown for resend
      
      // Focus first OTP input
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSending(false);
    }
  };

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
    if (!verificationId) return;

    setIsVerifying(true);
    setOtpError(null);

    try {
      const response = await fetch('/api/email-verification/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          verificationId, 
          code 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'رمز التحقق غير صحيح');
      }

      // Save to localStorage for 10 minutes
      const expiresAt = new Date(Date.now() + VERIFICATION_EXPIRY_MS).toISOString();
      localStorage.setItem(VERIFICATION_STORAGE_KEY, JSON.stringify({
        email: email.toLowerCase(),
        expiresAt,
      }));

      onVerified(true);
    } catch (err) {
      setOtpError(err instanceof Error ? err.message : 'حدث خطأ في التحقق');
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
            <p className="font-medium text-secondary font-dubai text-sm md:text-base">تم التحقق من البريد الإلكتروني</p>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="space-y-3">
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
                  التحقق من البريد الإلكتروني مطلوب
                </p>
                <p className="text-secondary/60 text-[10px] md:text-xs font-dubai mt-0.5 md:mt-1">
                  سنرسل رمز تحقق مكون من 6 أرقام إلى بريدك الإلكتروني
                </p>
              </div>
            </div>
            
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending || !isValidEmail}
              className={`
                w-full md:w-auto px-4 py-2.5 md:py-3 rounded-xl font-bold transition-all font-dubai text-sm
                flex items-center justify-center gap-2 md:shrink-0
                ${isValidEmail 
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
                  <Mail className="w-4 h-4 md:w-5 md:h-5" />
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
                  {email}
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
