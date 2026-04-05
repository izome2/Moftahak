'use client';

import React from 'react';
import { useTranslation } from '@/hooks/useTranslation';
import type { CourseLevel } from '@/types/courses';

interface CourseLevelBadgeProps {
  level: CourseLevel;
  size?: 'sm' | 'md';
}

const LEVEL_STYLES: Record<CourseLevel, string> = {
  BEGINNER: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  INTERMEDIATE: 'bg-amber-50 text-amber-700 border-amber-200',
  ADVANCED: 'bg-rose-50 text-rose-700 border-rose-200',
};

export default function CourseLevelBadge({ level, size = 'md' }: CourseLevelBadgeProps) {
  const t = useTranslation();
  const ct = t.courses;

  const labels: Record<CourseLevel, string> = {
    BEGINNER: ct.beginner,
    INTERMEDIATE: ct.intermediate,
    ADVANCED: ct.advanced,
  };

  return (
    <span
      className={`inline-flex items-center border font-medium rounded-full ${LEVEL_STYLES[level]} ${
        size === 'sm' ? 'px-2 py-0.5 text-[10px]' : 'px-2.5 py-0.5 text-xs'
      }`}
    >
      {labels[level]}
    </span>
  );
}
