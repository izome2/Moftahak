'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Copy, Check, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { useTranslation } from '@/hooks/useTranslation';

interface EnrollmentSuccessProps {
  paymentCode: string;
  courseTitle: string;
  amount: number;
}

export default function EnrollmentSuccess({
  paymentCode,
  courseTitle,
  amount,
}: EnrollmentSuccessProps) {
  const t = useTranslation();
  const et = t.courses.enrollment;
  const [codeCopied, setCodeCopied] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [hideCountdown, setHideCountdown] = useState(false);
  const manualRedirectRef = useRef(false);

  const copyCode = () => {
    navigator.clipboard.writeText(paymentCode);
    setCodeCopied(true);
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const getWhatsAppLink = () => {
    const phone = '201091507717';
    const message = `🎓 طلب اشتراك في دورة
━━━━━━━━━━━━━━━━
📌 الدورة: ${courseTitle}
💰 المبلغ: ${amount} جنيه
🔑 رمز الدفع: ${paymentCode}
━━━━━━━━━━━━━━━━
⚠️ تنبيه: يرجى عدم تعديل هذه الرسالة`;
    return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
  };

  useEffect(() => {
    const countdown = setInterval(() => {
      setRedirectCountdown((prev) => {
        if (prev <= 1 && !manualRedirectRef.current) {
          clearInterval(countdown);
          manualRedirectRef.current = true;
          setHideCountdown(true);
          window.open(getWhatsAppLink(), '_blank');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(countdown);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-xl mx-auto px-1 md:px-4 py-3 md:py-12"
    >
      <div className="bg-white/90 backdrop-blur-sm rounded-2xl py-10 px-6 pb-6 md:py-12 md:px-10 text-center shadow-xl border border-secondary/10 relative overflow-hidden w-full">
        {/* Decorative circles */}
        <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-20 -left-20 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* Success icon */}
        <div className="w-28 h-28 mx-auto mb-5 rounded-full bg-primary/20 flex items-center justify-center relative z-10">
          <Send className="w-14 h-14 text-primary" />
        </div>

        <h2 className="text-2xl font-bold text-secondary mb-3 font-dubai relative z-10">
          {et.successTitle}
        </h2>

        <p className="text-secondary/70 mb-5 font-dubai text-base relative z-10 leading-relaxed">
          {et.successDesc}
        </p>

        {/* Countdown */}
        {redirectCountdown > 0 && !hideCountdown && (
          <div className="mb-4 p-3 bg-primary/10 border border-primary/30 rounded-xl text-secondary text-sm font-dubai relative z-10">
            {et.autoRedirect(redirectCountdown)}
          </div>
        )}

        {/* Payment code */}
        <div className="p-5 md:p-6 bg-primary/10 rounded-2xl mb-5 border-2 border-primary/30 relative z-10">
          <p className="text-secondary/60 text-sm mb-2 font-dubai">{et.paymentCode}</p>
          <div className="flex items-center justify-center gap-3">
            <span className="text-3xl font-bold text-secondary font-mono tracking-widest" dir="ltr">
              {paymentCode}
            </span>
            <button
              onClick={copyCode}
              className="p-1.5 rounded-lg bg-secondary/10 hover:bg-secondary/20 transition-colors"
              title={et.copyCode}
            >
              {codeCopied ? (
                <Check className="w-4 h-4 text-green-600" />
              ) : (
                <Copy className="w-4 h-4 text-secondary" />
              )}
            </button>
          </div>
        </div>

        {/* Payment methods */}
        <div className="mb-6 relative z-10">
          <p className="text-secondary/70 mb-3 font-dubai text-sm">{et.paymentMethods}</p>
          <div className="flex justify-center items-center gap-4">
            <Image src="/images/payment/vodafone-cash.png" alt="فودافون كاش" width={50} height={50} className="object-contain rounded-lg" />
            <Image src="/images/payment/instapay.png" alt="انستا باي" width={50} height={50} className="object-contain rounded-lg" />
            <Image src="/images/payment/visa.png" alt="فيزا" width={50} height={50} className="object-contain rounded-lg" />
          </div>
        </div>
      </div>

      {/* WhatsApp button */}
      <a
        href={getWhatsAppLink()}
        target="_blank"
        rel="noopener noreferrer"
        onClick={() => {
          manualRedirectRef.current = true;
          setHideCountdown(true);
        }}
        className="mt-4 w-full bg-[#22c55e] hover:bg-[#20BA5A] text-white rounded-2xl shadow-xl border-2 border-[#1fbb58] p-4 md:p-5 transition-all inline-flex items-center justify-center gap-3 font-bold font-dubai text-base"
      >
        <Image src="/images/payment/whatsapp.png" alt="واتساب" width={35} height={35} className="object-contain" />
        <span>{et.goToWhatsapp}</span>
      </a>

      {/* Back home */}
      <button
        onClick={() => window.location.href = '/'}
        className="mt-4 w-full bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-secondary/10 p-4 md:p-5 hover:bg-white/80 transition-all inline-flex items-center justify-center gap-2 text-secondary font-bold font-dubai text-base"
      >
        <span>{t.courses.backToHome}</span>
        <ArrowRight className="w-5 h-5 flex-shrink-0" />
      </button>
    </motion.div>
  );
}
