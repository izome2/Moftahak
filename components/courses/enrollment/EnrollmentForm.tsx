'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { CreditCard, Loader2, AlertCircle, LogIn, CheckCircle, UserRound, Mail, IdCard } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import FirebasePhoneVerification from '@/components/feasibility-request/FirebasePhoneVerification';
import CourseSummaryCard from './CourseSummaryCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CourseLevel } from '@/types/courses';

interface CourseInfo {
  id: string;
  title: string;
  slug: string;
  price: number;
  currency: string;
  level: CourseLevel;
  lessonsCount: number;
  totalDuration: number;
  features: string[] | null;
  thumbnailUrl: string | null;
}

interface EnrollmentFormProps {
  course: CourseInfo;
}

export default function EnrollmentForm({ course }: EnrollmentFormProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;
  const et = ct.enrollment;
  const { data: session, status: authStatus } = useSession();

  const [phoneNumber, setPhoneNumber] = useState('');
  const [isPhoneVerified, setIsPhoneVerified] = useState(false);
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const phoneRef = useRef<HTMLDivElement>(null);
  const userPhone = session?.user?.phone && !session?.user?.email ? session.user.phone : undefined;

  useEffect(() => {
    if (session?.user?.email) {
      setEmail(session.user.email);
    }
  }, [session?.user?.email]);

  // Not logged in
  if (authStatus === 'loading') {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 text-primary animate-spin" />
      </div>
    );
  }

  if (!session?.user) {
    return (
      <div className="max-w-lg mx-auto text-center py-16">
        <LogIn className="w-12 h-12 text-primary/40 mx-auto mb-4" />
        <h2 className="text-xl font-bold text-secondary mb-2 font-dubai">{et.loginRequired}</h2>
        <Link
          href={`/auth/login?callbackUrl=/courses/${course.slug}/enroll`}
          className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-secondary text-white font-medium hover:bg-secondary/90 transition-colors"
        >
          {et.loginFirst}
        </Link>
      </div>
    );
  }

  const handleSubmit = async () => {
    setError(null);

    if (!isPhoneVerified) {
      setError(isRTL ? 'يجب تأكيد رقم الهاتف أولًا قبل الدفع' : 'Please verify your phone number before payment');
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    const emailToUse = (session.user.email || email).trim().toLowerCase();
    if (!emailToUse) {
      setError(isRTL ? 'البريد الإلكتروني مطلوب للدفع' : 'Email is required for payment');
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/paymob/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseSlug: course.slug,
          user: {
            name: `${session.user.firstName} ${session.user.lastName}`.trim(),
            email: emailToUse,
            phone: phoneNumber,
          },
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || et.error);
      }

      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
        return;
      }

      throw new Error(et.error);
    } catch (err) {
      setError(err instanceof Error ? err.message : et.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-secondary font-dubai text-center mb-6">
        {et.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
        {/* Form */}
        <div className="lg:col-span-7">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-secondary/10 p-6 space-y-6">
            {/* User info */}
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-primary/15 text-secondary/75 border border-primary/25 flex items-center justify-center">
                  <IdCard className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-bold text-secondary font-dubai">{et.yourInfo}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="rounded-2xl border border-secondary/10 bg-[#fbf7f0] p-4 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white border border-primary/25 flex items-center justify-center shrink-0">
                      <UserRound className="w-5 h-5 text-secondary" />
                    </div>
                    <div className="min-w-0">
                      <label className="block text-xs font-bold text-secondary/45 mb-1">{et.fullName}</label>
                      <div className="text-sm md:text-base font-bold text-secondary truncate">
                        {session.user.firstName} {session.user.lastName}
                      </div>
                    </div>
                  </div>
                </div>
                {session.user.email ? (
                  <div className="rounded-2xl border border-secondary/10 bg-[#fbf7f0] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-primary/25 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="min-w-0">
                        <label className="block text-xs font-bold text-secondary/45 mb-1">Email</label>
                        <div className="text-sm md:text-base font-bold text-secondary truncate" dir="ltr">
                          {session.user.email}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="rounded-2xl border border-secondary/10 bg-[#fbf7f0] p-4 shadow-sm">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-white border border-primary/25 flex items-center justify-center shrink-0">
                        <Mail className="w-5 h-5 text-secondary" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <label className="block text-xs font-bold text-secondary/45 mb-1.5">Email</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(event) => setEmail(event.target.value)}
                          className="w-full px-3 py-2 rounded-xl bg-white border border-primary/20 text-sm text-secondary outline-none focus:border-secondary/50 transition-colors"
                          placeholder="name@example.com"
                          dir="ltr"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Phone verification */}
            <div ref={phoneRef}>
              <h3 className="text-base font-bold text-secondary mb-3">{et.phoneVerification}</h3>
              <FirebasePhoneVerification
                phoneNumber={phoneNumber}
                isVerified={isPhoneVerified}
                onPhoneChange={(phone, keepVerification) => {
                  setPhoneNumber(phone);
                  if (!keepVerification) {
                    setIsPhoneVerified(false);
                  }
                }}
                onVerified={(verified) => setIsPhoneVerified(verified)}
                userPhone={userPhone}
              />
            </div>

            {/* Error */}
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-50 text-red-600 text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Submit */}
            <motion.button
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-3 rounded-xl bg-secondary text-white font-bold font-dubai text-base hover:bg-secondary/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {et.submitting}
                </>
              ) : (
                <>
                  <CreditCard className="w-5 h-5" />
                  {et.submit}
                </>
              )}
            </motion.button>

            <div className="flex items-center justify-center gap-2 text-center text-xs font-bold text-secondary/60">
              <CheckCircle className="w-4 h-4 text-primary shrink-0" />
              <span>
                {isRTL
                  ? 'سيتم تفعيل الوصول بعد تأكيد الدفع من Paymob'
                  : 'Access is activated after Paymob confirms payment'}
              </span>
            </div>
          </div>
        </div>

        {/* Summary card */}
        <div className="lg:col-span-5">
          <div className="sticky top-6">
            <CourseSummaryCard
              title={course.title}
              price={course.price}
              currency={course.currency}
              level={course.level}
              lessonsCount={course.lessonsCount}
              totalDuration={course.totalDuration}
              features={course.features}
              thumbnailUrl={course.thumbnailUrl}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
