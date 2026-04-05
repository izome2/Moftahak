'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Play, Clock, BookOpen, Users } from 'lucide-react';
import CourseRatingStars from './CourseRatingStars';
import CourseLevelBadge from './CourseLevelBadge';
import CourseDefaultThumbnail from './CourseDefaultThumbnail';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDuration, formatDurationEn } from '@/lib/courses/utils';
import type { CourseLevel } from '@/types/courses';

interface CourseDetailHeroProps {
  title: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  level: CourseLevel;
  totalDuration: number;
  lessonsCount: number;
  enrollmentsCount: number;
  averageRating: number;
  reviewsCount: number;
  instructor: string;
}

export default function CourseDetailHero({
  title,
  shortDescription,
  thumbnailUrl,
  previewVideoUrl,
  level,
  totalDuration,
  lessonsCount,
  enrollmentsCount,
  averageRating,
  reviewsCount,
  instructor,
}: CourseDetailHeroProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;
  const [showVideo, setShowVideo] = useState(false);

  const durationText = isRTL ? formatDuration(totalDuration) : formatDurationEn(totalDuration);

  return (
    <div className="pt-24 sm:pt-28 px-4 sm:px-6 lg:px-8">
      <div className="relative max-w-6xl mx-auto bg-secondary rounded-3xl overflow-hidden border-2 border-[#ead3b9]/70 shadow-lg">
        {/* Pattern overlay with bottom-to-top fade */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/pattern-vertical-white.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            opacity: 0.06,
            maskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
            WebkitMaskImage: 'linear-gradient(to top, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 70%)',
          }}
        />

        <div className="relative z-10 px-5 sm:px-8 lg:px-10 py-8 sm:py-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          {/* Text content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="order-2 lg:order-1"
          >
            <CourseLevelBadge level={level} size="md" />

            <h1 className="mt-3 text-2xl sm:text-3xl lg:text-4xl font-bold text-white font-dubai leading-snug">
              {title}
            </h1>

            {shortDescription && (
              <p className="mt-3 text-base text-white/80 leading-relaxed">
                {shortDescription}
              </p>
            )}

            {/* Rating + students */}
            <div className="mt-4 flex items-center gap-4 flex-wrap">
              {averageRating > 0 && (
                <div className="flex items-center gap-2">
                  <CourseRatingStars rating={averageRating} size="sm" />
                  <span className="text-sm text-white/90 font-medium">
                    {averageRating.toFixed(1)}
                  </span>
                  <span className="text-xs text-white/50">
                    ({ct.reviewsCount(reviewsCount)})
                  </span>
                </div>
              )}
              {enrollmentsCount > 0 && (
                <div className="flex items-center gap-1.5 text-white/70 text-sm">
                  <Users className="w-3.5 h-3.5" />
                  {ct.studentsCount(enrollmentsCount)}
                </div>
              )}
            </div>

            {/* Stats pills */}
            <div className="mt-5 flex items-center gap-3 flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-medium backdrop-blur-sm">
                <BookOpen className="w-3.5 h-3.5" />
                {ct.lessonsCount(lessonsCount)}
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/15 text-white/90 text-xs font-medium backdrop-blur-sm">
                <Clock className="w-3.5 h-3.5" />
                {durationText}
              </span>
            </div>

            {/* Instructor */}
            <p className="mt-4 text-sm text-white/60">
              {ct.instructor}: <span className="text-primary font-medium">{instructor}</span>
            </p>
          </motion.div>

          {/* Media */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="order-1 lg:order-2"
          >
            <div className="relative aspect-video rounded-2xl overflow-hidden shadow-2xl border-2 border-secondary ring-1 ring-secondary/30">
              {showVideo && previewVideoUrl ? (
                <video
                  src={previewVideoUrl}
                  className="w-full h-full object-cover"
                  controls
                  autoPlay
                />
              ) : thumbnailUrl ? (
                <>
                  <Image
                    src={thumbnailUrl}
                    alt={title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    priority
                  />
                  {previewVideoUrl && (
                    <button
                      onClick={() => setShowVideo(true)}
                      className="absolute inset-0 flex items-center justify-center bg-black/30 hover:bg-black/40 transition-colors group"
                    >
                      <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                        <Play className="w-7 h-7 text-secondary fill-secondary ml-1" />
                      </div>
                    </button>
                  )}
                </>
              ) : (
                <CourseDefaultThumbnail title={title} />
              )}
            </div>
          </motion.div>
        </div>
      </div>
      </div>
    </div>
  );
}
