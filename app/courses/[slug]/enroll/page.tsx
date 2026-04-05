'use client';

import React, { useEffect, useState, use } from 'react';
import { Loader2, AlertCircle, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Container from '@/components/ui/Container';
import EnrollmentForm from '@/components/courses/enrollment/EnrollmentForm';
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

export default function EnrollPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;

  const [course, setCourse] = useState<CourseInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const decodedSlug = decodeURIComponent(slug);
        const res = await fetch(`/api/courses/${encodeURIComponent(decodedSlug)}`);
        if (!res.ok) throw new Error();
        const data = await res.json();
        setCourse({
          id: data.course.id,
          title: data.course.title,
          slug: data.course.slug,
          price: data.course.price,
          currency: data.course.currency,
          level: data.course.level,
          lessonsCount: data.course.lessonsCount,
          totalDuration: data.course.totalDuration,
          features: data.course.features,
          thumbnailUrl: data.course.thumbnailUrl,
        });
      } catch {
        setError(true);
      } finally {
        setLoading(false);
      }
    })();
  }, [slug]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#fdf6ee] via-[#f5e6d3] to-[#f0dcc4]" dir={isRTL ? 'rtl' : 'ltr'}>
      <Navbar />

      {/* Pattern background */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/patterns/pattern-vertical-white.png')",
            backgroundSize: 'cover',
            backgroundRepeat: 'no-repeat',
            backgroundPosition: 'center',
            opacity: 0.3,
          }}
        />
      </div>

      <main className="relative z-10 min-h-[calc(100vh-64px)] pt-24 sm:pt-28 pb-8">
        <Container className="w-full">
          {loading ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <Loader2 className="w-8 h-8 text-primary animate-spin" />
            </div>
          ) : error || !course ? (
            <div className="flex items-center justify-center min-h-[50vh]">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-center"
              >
                <AlertCircle className="w-12 h-12 text-primary/40 mx-auto mb-4" />
                <h2 className="text-xl font-bold text-secondary mb-2 font-dubai">{ct.courseNotFound}</h2>
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
                >
                  {ct.backToHome}
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <EnrollmentForm course={course} />
            </motion.div>
          )}
        </Container>
      </main>
    </div>
  );
}
