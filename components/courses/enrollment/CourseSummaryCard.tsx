'use client';

import React from 'react';
import { BookOpen, Clock, Award, CheckCircle } from 'lucide-react';
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
  features,
  thumbnailUrl,
}: CourseSummaryCardProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;
  const et = ct.enrollment;

  const durationText = isRTL ? formatDuration(totalDuration) : formatDurationEn(totalDuration);
  const isFree = price === 0;

  return (
    <div className="bg-white/90 backdrop-blur-sm rounded-2xl border border-primary/15 overflow-hidden shadow-lg">
      {/* Thumbnail */}
      {thumbnailUrl && (
        <div className="aspect-video relative">
          <img src={thumbnailUrl} alt={title} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="p-5">
        <h3 className="text-lg font-bold text-secondary font-dubai mb-3">{title}</h3>

        {/* Price */}
        <div className="flex items-center gap-2 mb-4">
          {isFree ? (
            <span className="text-xl font-bold text-emerald-600">{ct.free}</span>
          ) : (
            <>
              <span className="text-2xl font-bold text-secondary">{formatCoursePrice(price)}</span>
              <span className="text-sm text-secondary/40">{currency}</span>
            </>
          )}
        </div>

        {/* Stats */}
        <div className="flex items-center gap-3 flex-wrap mb-4 text-sm text-secondary/60">
          <span className="flex items-center gap-1.5">
            <BookOpen className="w-3.5 h-3.5 text-primary" />
            {ct.lessonsCount(lessonsCount)}
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-primary" />
            {durationText}
          </span>
          <CourseLevelBadge level={level} size="sm" />
        </div>

        {/* Features */}
        {features && features.length > 0 && (
          <div className="border-t border-primary/10 pt-3 space-y-1.5">
            {features.slice(0, 4).map((f, i) => (
              <div key={i} className="flex items-start gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs text-secondary/60">{f}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
