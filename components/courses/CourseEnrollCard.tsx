'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Play, BookOpen, Clock, Award, Infinity } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import CourseLevelBadge from './CourseLevelBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDuration, formatDurationEn, formatCoursePrice } from '@/lib/courses/utils';
import type { CourseLevel } from '@/types/courses';

interface CourseEnrollCardProps {
  price: number;
  currency: string;
  level: CourseLevel;
  totalDuration: number;
  lessonsCount: number;
  slug: string;
}

export default function CourseEnrollCard({
  price,
  currency,
  level,
  totalDuration,
  lessonsCount,
  slug,
}: CourseEnrollCardProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const { data: session } = useSession();
  const router = useRouter();
  const ct = t.courses;

  const durationText = isRTL ? formatDuration(totalDuration) : formatDurationEn(totalDuration);
  const isFree = price === 0;
  const currencyLabel = isRTL && currency.toUpperCase() === 'EGP' ? 'ج.م' : currency;
  const handleCourseAction = () => {
    if (!session?.user) {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
      return;
    }

    router.push(isFree ? `/courses/${slug}/watch` : `/courses/${slug}/enroll`);
  };

  const infoItems = [
    { icon: BookOpen, label: ct.totalLessons, value: String(lessonsCount) },
    { icon: Clock, label: ct.totalDuration, value: durationText },
    { icon: Award, label: ct.courseLevel, value: '' },
    { icon: Infinity, label: ct.lifetime, value: '' },
  ];

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="sticky top-28 z-30"
      >
        <div className="rounded-2xl bg-[#ead3b9]/20 shadow-lg border-2 border-[#ead3b9]/70 overflow-hidden">
          {/* Course info */}
          <div className="px-6 py-5 space-y-4">
            {infoItems.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-[#ead3b9]/40 flex items-center justify-center flex-shrink-0">
                  <item.icon className="w-[18px] h-[18px] text-[#c4956a]" />
                </div>
                <span className="text-[15px] text-gray-600 flex-1">{item.label}</span>
                {item.value ? (
                  <span className="text-[15px] font-semibold text-gray-900">{item.value}</span>
                ) : item.label === ct.courseLevel ? (
                  <CourseLevelBadge level={level} size="sm" />
                ) : (
                  <span className="text-[15px] font-semibold text-primary">✓</span>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Price & Action */}
        <motion.div
          animate={{ y: [0, -4, 0] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
          className="mt-4 hidden overflow-hidden rounded-2xl border-2 border-[#ead3b9]/60 bg-[#fdf6ee]/55 shadow-[0_18px_50px_rgba(73,48,28,0.13)] backdrop-blur-xl md:block"
        >
          <div className="px-6 py-5">
            <motion.button
              onClick={handleCourseAction}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary py-4 text-sm font-bold text-[#ffffff] shadow-[0_14px_35px_rgba(16,48,43,0.28)] transition-colors hover:bg-secondary/90"
            >
              <span aria-hidden="true" className="course-enroll-shine" />
              {isFree && <Play className="relative z-10 w-4 h-4 fill-current" />}
              <span className="relative z-10">{isFree ? ct.watchNow : ct.enrollNow}</span>
              {!isFree && (
                <>
                  <span className="relative z-10 h-5 w-px bg-white/25" />
                  <span className="relative z-10 flex items-baseline gap-1.5">
                    <span className="text-base font-bold">{formatCoursePrice(price)}</span>
                    <span className="text-xs font-bold text-white/70">{currencyLabel}</span>
                  </span>
                </>
              )}
            </motion.button>
          </div>
        </motion.div>
      </motion.div>

      <div className="h-24 md:hidden" />

      <motion.div
        initial={{ y: 96, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.32, ease: [0.22, 1, 0.36, 1] }}
        className="fixed inset-x-3 bottom-3 z-[80] md:hidden"
      >
        <motion.div
          animate={{ y: [0, -3, 0] }}
          transition={{ duration: 3.8, repeat: Infinity, ease: 'easeInOut' }}
          className="rounded-2xl border-2 border-[#ead3b9]/60 bg-[#fdf6ee]/75 p-3 shadow-[0_16px_42px_rgba(16,48,43,0.22)] backdrop-blur-xl"
          style={{ paddingBottom: 'calc(0.75rem + env(safe-area-inset-bottom))' }}
        >
          <motion.button
            onClick={handleCourseAction}
            whileTap={{ scale: 0.98 }}
            className="relative flex w-full cursor-pointer items-center justify-center gap-3 overflow-hidden rounded-xl bg-secondary py-4 text-base font-bold text-white shadow-[0_14px_35px_rgba(16,48,43,0.32)]"
          >
            <span aria-hidden="true" className="course-enroll-shine" />
            {isFree && <Play className="relative z-10 w-4 h-4 fill-current" />}
            <span className="relative z-10">{isFree ? ct.watchNow : ct.enrollNow}</span>
            {!isFree && (
              <>
                <span className="relative z-10 h-5 w-px bg-white/25" />
                <span className="relative z-10 flex items-baseline gap-1.5">
                  <span className="text-lg font-bold">{formatCoursePrice(price)}</span>
                  <span className="text-xs font-bold text-white/70">{currencyLabel}</span>
                </span>
              </>
            )}
          </motion.button>
        </motion.div>
      </motion.div>
    </>
  );
}
