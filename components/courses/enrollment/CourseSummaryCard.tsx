'use client';

import React from 'react';
import Image from 'next/image';
import { BookOpen, Clock, Award, ReceiptText } from 'lucide-react';
import CourseLevelBadge from '../CourseLevelBadge';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDuration, formatDurationEn, formatCoursePrice } from '@/lib/courses/utils';
import type { CourseLevel } from '@/types/courses';

interface CourseSummaryCardProps {
  title: string;
  price: number;
  currency: string;
  level: CourseLevel;
  lessonsCount: number;
  totalDuration: number;
  features: string[] | null;
  thumbnailUrl: string | null;
}

export default function CourseSummaryCard({
  title,
  price,
  currency,
  level,
  lessonsCount,
  totalDuration,
  thumbnailUrl,
}: CourseSummaryCardProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;

  const durationText = isRTL ? formatDuration(totalDuration) : formatDurationEn(totalDuration);
  const isFree = price === 0;

  return (
    <div className="overflow-hidden rounded-2xl border border-secondary/10 bg-white/95 shadow-[0_18px_45px_rgba(16,48,43,0.10)]">
      {thumbnailUrl && (
        <div className="p-3 pb-0">
          <div className="relative aspect-[16/10] overflow-hidden rounded-2xl bg-secondary/10">
          <Image
            src={thumbnailUrl}
            alt={title}
            fill
            sizes="(min-width: 1024px) 420px, 100vw"
            className="object-cover"
          />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-secondary/45 to-transparent" />
          </div>
        </div>
      )}

      <div className="p-5 md:p-6">
        <div className="pb-4 border-b border-secondary/10">
          <div className="min-w-0">
            <p className="text-xs font-bold text-secondary/45 mb-1">{isRTL ? 'الدورة المختارة' : 'Selected Course'}</p>
            <h3 className="text-xl font-bold text-secondary font-dubai leading-snug line-clamp-2">
              {title}
            </h3>
          </div>
        </div>

        <div className="py-5 space-y-3">
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-bold text-secondary/55">
              <BookOpen className="w-4 h-4 text-primary" />
              {ct.totalLessons}
            </span>
            <span className="text-sm font-bold text-secondary">{ct.lessonsCount(lessonsCount)}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-bold text-secondary/55">
              <Clock className="w-4 h-4 text-primary" />
              {ct.totalDuration}
            </span>
            <span className="text-sm font-bold text-secondary">{durationText}</span>
          </div>
          <div className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-2 text-sm font-bold text-secondary/55">
              <Award className="w-4 h-4 text-primary" />
              {ct.courseLevel}
            </span>
            <CourseLevelBadge level={level} size="sm" />
          </div>
        </div>

        <div className="pt-5 border-t border-secondary/10">
          <div className="rounded-2xl bg-secondary px-4 py-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-white/10 text-primary flex items-center justify-center">
                <ReceiptText className="w-5 h-5" />
              </div>
              <span className="text-sm font-bold text-white/70">{isRTL ? 'الإجمالي' : 'Total'}</span>
            </div>
            <div className="flex items-baseline gap-2 text-white">
              {isFree ? (
                <span className="text-2xl font-bold text-primary">{ct.free}</span>
              ) : (
                <>
                  <span className="text-3xl font-bold tracking-normal">{formatCoursePrice(price)}</span>
                  <span className="text-sm font-bold text-white/50">{currency}</span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
