'use client';

import React, { useEffect, useState, use } from 'react';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Navbar from '@/components/Navbar';
import CourseDetailHero from '@/components/courses/CourseDetailHero';
import CourseOverviewTab from '@/components/courses/CourseOverviewTab';
import CourseCurriculumTab from '@/components/courses/CourseCurriculumTab';
import CourseReviewsTab from '@/components/courses/CourseReviewsTab';
import CourseEnrollCard from '@/components/courses/CourseEnrollCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { AIRBNB_LANDING_ENTRY_SOURCE, AIRBNB_LANDING_ROUTE, isAirbnbCourse } from '@/lib/courses/airbnb-landing';
import type { CourseLevel } from '@/types/courses';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  isFree: boolean;
  sortOrder: number;
}

interface Section {
  id: string;
  title: string;
  sortOrder: number;
  lessons: Lesson[];
}

interface CourseData {
  id: string;
  title: string;
  slug: string;
  description: string;
  shortDescription: string | null;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  previewVideoUrl: string | null;
  features: string[] | null;
  level: CourseLevel;
  totalDuration: number;
  lessonsCount: number;
  enrollmentsCount: number;
  reviewsCount: number;
  averageRating: number;
  instructor: string;
  instructorImage: string | null;
  sections: Section[];
  createdAt: string;
}

export default function CourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const router = useRouter();
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;

  const [course, setCourse] = useState<CourseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [entrySource, setEntrySource] = useState<string | null>(null);
  const [entrySourceReady, setEntrySourceReady] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    setEntrySource(new URLSearchParams(window.location.search).get('from'));
    setEntrySourceReady(true);
  }, [slug]);

  useEffect(() => {
    if (!entrySourceReady) return;

    let cancelled = false;

    (async () => {
      try {
        const decodedSlug = decodeURIComponent(slug);
        const res = await fetch(`/api/courses/${encodeURIComponent(decodedSlug)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();

        if (isAirbnbCourse(data.course) && entrySource !== AIRBNB_LANDING_ENTRY_SOURCE) {
          const accessRes = await fetch(`/api/courses/${encodeURIComponent(decodedSlug)}/access`);
          const accessData = accessRes.ok ? await accessRes.json() : { enrolled: false };

          if (!accessData.enrolled) {
            if (!cancelled) {
              setRedirecting(true);
              router.replace(AIRBNB_LANDING_ROUTE);
            }
            return;
          }
        }

        if (!cancelled) setCourse(data.course);
      } catch {
        if (!cancelled) setError(true);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [entrySource, entrySourceReady, router, slug]);

  // Loading
  if (!entrySourceReady || loading || redirecting) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <div className="text-center">
            <Loader2 className="w-8 h-8 text-primary animate-spin mx-auto mb-3" />
            <p className="text-sm text-gray-400 font-dubai">{t.admin.loading}</p>
          </div>
        </div>
      </div>
    );
  }

  // Error / Not found
  if (error || !course) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[60vh] pt-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center bg-[#ffffff] rounded-2xl p-8 shadow-sm border border-gray-200"
          >
            <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h2 className="text-xl font-bold text-gray-900 mb-2 font-dubai">{ct.courseNotFound}</h2>
            <p className="text-sm text-gray-500 mb-6">{ct.courseNotFoundDesc}</p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-secondary text-[#ffffff] text-sm font-medium hover:bg-secondary-light transition-colors"
            >
              {ct.backToHome}
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#faf7f2]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Hero */}
      <CourseDetailHero
        title={course.title}
        shortDescription={course.shortDescription}
        thumbnailUrl={course.thumbnailUrl}
        previewVideoUrl={course.previewVideoUrl}
        level={course.level}
        totalDuration={course.totalDuration}
        lessonsCount={course.lessonsCount}
        enrollmentsCount={course.enrollmentsCount}
        averageRating={course.averageRating}
        reviewsCount={course.reviewsCount}
        instructor={course.instructor}
      />

      {/* Main content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: All sections stacked */}
          <div className="lg:col-span-2 space-y-8">
            {/* Curriculum */}
            <CourseCurriculumTab
              sections={course.sections}
              totalDuration={course.totalDuration}
              lessonsCount={course.lessonsCount}
            />

            {/* Overview */}
            <CourseOverviewTab
              description={course.description}
              features={course.features}
            />

            {/* Reviews */}
            <CourseReviewsTab
              slug={course.slug}
              reviewsCount={course.reviewsCount}
              averageRating={course.averageRating}
            />
          </div>

          {/* Right: Enroll card (sticky) */}
          <div className="lg:col-span-1">
            <CourseEnrollCard
              price={course.price}
              currency={course.currency}
              level={course.level}
              totalDuration={course.totalDuration}
              lessonsCount={course.lessonsCount}
              slug={course.slug}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
