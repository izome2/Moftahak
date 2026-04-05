'use client';

import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Send, Loader2, AlertCircle, LogIn, CheckCircle } from 'lucide-react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import FirebasePhoneVerification from '@/components/feasibility-request/FirebasePhoneVerification';
import CourseSummaryCard from './CourseSummaryCard';
import EnrollmentSuccess from './EnrollmentSuccess';
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Success state
  const [success, setSuccess] = useState(false);
  const [paymentCode, setPaymentCode] = useState<string>('');
  const [isFreeSuccess, setIsFreeSuccess] = useState(false);

  const phoneRef = useRef<HTMLDivElement>(null);
  const userPhone = session?.user?.phone && !session?.user?.email ? session.user.phone : undefined;

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

  // Free course success
  if (isFreeSuccess) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="max-w-xl mx-auto px-4 py-12 text-center"
      >
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl py-10 px-6 shadow-xl border border-secondary/10 relative overflow-hidden">
          <div className="w-24 h-24 mx-auto mb-5 rounded-full bg-emerald-100 flex items-center justify-center">
            <CheckCircle className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-2xl font-bold text-secondary mb-3 font-dubai">{et.freeCourseSuccess}</h2>
          <Link
            href={`/courses/${course.slug}/watch`}
            className="inline-flex items-center gap-2 mt-4 px-6 py-3 rounded-xl bg-secondary text-white font-medium hover:bg-secondary/90 transition-colors"
          >
            {et.goToCourse}
          </Link>
        </div>
      </motion.div>
    );
  }

  // Paid course success with payment code
  if (success && paymentCode) {
    return (
      <EnrollmentSuccess
        paymentCode={paymentCode}
        courseTitle={course.title}
        amount={course.price}
      />
    );
  }

  const handleSubmit = async () => {
    setError(null);

    if (!isPhoneVerified) {
      setError(et.phoneRequired);
      phoneRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await fetch('/api/courses/enroll', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId: course.id,
          phone: phoneNumber,
          isPhoneVerified: true,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || et.error);
      }

      if (data.free) {
        setIsFreeSuccess(true);
      } else {
        setPaymentCode(data.paymentCode);
        setSuccess(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : et.error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl md:text-3xl font-bold text-secondary font-dubai text-center mb-6">
        {et.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Form */}
        <div className="lg:col-span-3">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-xl border border-secondary/10 p-6 space-y-6">
            {/* User info */}
            <div>
              <h3 className="text-base font-bold text-secondary mb-3">{et.yourInfo}</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-secondary/70 mb-1.5">{et.fullName}</label>
                  <div className="px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-sm text-secondary">
                    {session.user.firstName} {session.user.lastName}
                  </div>
                </div>
                {session.user.email && (
                  <div>
                    <label className="block text-sm font-medium text-secondary/70 mb-1.5">Email</label>
                    <div className="px-4 py-2.5 rounded-xl bg-primary/5 border border-primary/10 text-sm text-secondary" dir="ltr">
                      {session.user.email}
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
                onPhoneChange={(phone) => {
                  setPhoneNumber(phone);
                  setIsPhoneVerified(false);
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
                  <Send className="w-5 h-5" />
                  {et.submit}
                </>
              )}
            </motion.button>
          </div>
        </div>

        {/* Summary card */}
        <div className="lg:col-span-2">
          <div className="sticky top-6">
            <h3 className="text-sm font-bold text-secondary/50 uppercase tracking-wider mb-3">{et.courseSummary}</h3>
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
