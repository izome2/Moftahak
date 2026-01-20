'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, CheckCircle, Loader2, RefreshCw } from 'lucide-react';

interface PhoneVerificationProps {
  phoneNumber: string;
  isVerified: boolean;
  error?: string;
  onChange: (phone: string, verified: boolean) => void;
}

export default function PhoneVerification({ 
  phoneNumber, 
  isVerified, 
  error,
  onChange 
}: PhoneVerificationProps) {
  const [showOtpInput, setShowOtpInput] = useState(false);
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [otpError, setOtpError] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(0);
  const [verificationId, setVerificationId] = useState<string | null>(null);
  
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [countdown]);

  const handlePhoneChange = (value: string) => {
    // Only allow numbers and limit to 11 digits
    const cleaned = value.replace(/\D/g, '').slice(0, 11);
    onChange(cleaned, false);
    setShowOtpInput(false);
    setOtp(['', '', '', '', '', '']);
    setOtpError(null);
  };

  const handleSendOtp = async () => {
    if (phoneNumber.length !== 11) {
      setOtpError('رقم الهاتف يجب أن يكون 11 رقم');
      return;
    }

    setIsSending(true);
    setOtpError(null);

    try {
      const response = await fetch('/api/phone-verification/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phoneNumber }),
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
      const response = await fetch('/api/phone-verification/verify', {
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

      onChange(phoneNumber, true);
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
      <div className="p-4 rounded-xl bg-green-50 border-2 border-green-200">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <div className="flex-1">
            <p className="font-medium text-green-800 font-dubai">تم التحقق من رقم الهاتف</p>
            <p className="text-green-600 text-sm font-bristone" dir="ltr">
              +20 {phoneNumber.slice(0, 3)} {phoneNumber.slice(3, 7)} {phoneNumber.slice(7)}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Phone Input */}
      <div>
        <label className="block text-sm font-medium text-secondary mb-2 font-dubai">
          رقم الهاتف <span className="text-red-500">*</span>
        </label>
        <div className="flex gap-3">
          <div className="relative flex-1">
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-secondary/40">
              <Phone className="w-5 h-5" />
            </div>
            <input
              type="tel"
              dir="ltr"
              value={phoneNumber}
              onChange={(e) => handlePhoneChange(e.target.value)}
              placeholder="01234567890"
              disabled={showOtpInput && countdown > 0}
              className={`
                w-full pr-12 pl-4 py-3 rounded-xl border-2 bg-white/50
                focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
                transition-all font-bristone text-left
                disabled:bg-secondary/5 disabled:cursor-not-allowed
                ${error || otpError ? 'border-red-400' : 'border-secondary/20'}
              `}
            />
          </div>
          
          {!showOtpInput && (
            <button
              type="button"
              onClick={handleSendOtp}
              disabled={isSending || phoneNumber.length !== 11}
              className={`
                px-6 py-3 rounded-xl font-bold transition-all font-dubai whitespace-nowrap
                ${phoneNumber.length === 11 
                  ? 'bg-primary text-secondary hover:bg-primary/90' 
                  : 'bg-secondary/10 text-secondary/40 cursor-not-allowed'
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {isSending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                'إرسال الرمز'
              )}
            </button>
          )}
        </div>
        
        {(error || otpError) && !showOtpInput && (
          <p className="mt-1 text-sm text-red-500 font-dubai">{error || otpError}</p>
        )}
      </div>

      {/* OTP Input */}
      <AnimatePresence>
        {showOtpInput && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="p-5 rounded-xl bg-secondary/5 border border-secondary/10">
              <p className="text-sm text-secondary/70 mb-4 text-center font-dubai">
                أدخل رمز التحقق المكون من 6 أرقام المرسل إلى
                <span className="font-bold text-secondary block mt-1 font-bristone" dir="ltr">
                  +20 {phoneNumber}
                </span>
              </p>

              {/* OTP Boxes */}
              <div 
                className="flex justify-center gap-2 mb-4" 
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
                      w-11 h-14 text-center text-xl font-bold rounded-lg border-2
                      focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
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
