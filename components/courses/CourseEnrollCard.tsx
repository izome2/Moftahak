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

  const infoItems = [
    { icon: BookOpen, label: ct.totalLessons, value: String(lessonsCount) },
    { icon: Clock, label: ct.totalDuration, value: durationText },
    { icon: Award, label: ct.courseLevel, value: '' },
    { icon: Infinity, label: ct.lifetime, value: '' },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="sticky top-28"
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
      <div className="mt-4 rounded-2xl bg-[#ead3b9]/20 shadow-lg border-2 border-[#ead3b9]/70 overflow-hidden">
        <div className="px-6 py-5">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[15px] font-medium text-gray-600">{isRTL ? 'سعر الدورة' : 'Course Price'}</span>
            <div className="flex items-baseline gap-1.5">
              {isFree ? (
                <span className="text-[15px] font-bold text-secondary">{ct.free}</span>
              ) : (
                <>
                  <span className="text-[15px] font-bold text-secondary">
                    {formatCoursePrice(price)}
                  </span>
                  <span className="text-xs text-gray-400">{currency}</span>
                </>
              )}
            </div>
          </div>
          <motion.button
            onClick={() => {
              if (!session?.user) {
                window.dispatchEvent(new CustomEvent('open-auth-modal'));
                return;
              }
              router.push(isFree ? `/courses/${slug}/watch` : `/courses/${slug}/enroll`);
            }}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-xl bg-secondary text-[#ffffff] text-sm font-bold hover:bg-secondary/90 transition-colors shadow-sm cursor-pointer"
          >
            {isFree && <Play className="w-4 h-4 fill-current" />}
            {isFree ? ct.watchNow : ct.enrollNow}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
