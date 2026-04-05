'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { Loader2, AlertCircle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { WatchPageLayout } from '@/components/courses/player';
import Navbar from '@/components/Navbar';

interface LessonData {
  course: { id: string; title: string; slug: string; instructor?: { firstName: string; lastName: string; image: string | null } };
  lesson: {
    id: string;
    title: string;
    videoUrl: string;
    duration: number;
    isFree: boolean;
    sectionId: string;
    sectionTitle: string;
  };
  sections: {
    id: string;
    title: string;
    sortOrder: number;
    lessons: {
      id: string;
      title: string;
      duration: number;
      sortOrder: number;
      isFree: boolean;
      hasAccess: boolean;
      videoUrl?: string;
    }[];
  }[];
  progress: { watchedSeconds: number; lastPosition: number } | null;
  allProgress: { lessonId: string }[];
  enrolled: boolean;
}

export default function WatchPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug: rawSlug } = use(params);
  const slug = decodeURIComponent(rawSlug);
  const { data: session, status: sessionStatus } = useSession();
  const router = useRouter();
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;
  const pt = ct.player;

  const [data, setData] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<'not-found' | 'no-enrollment' | 'generic' | null>(null);
  const [currentLessonId, setCurrentLessonId] = useState<string | null>(null);

  // Fetch lesson data
  const fetchLesson = useCallback(
    async (lessonId?: string, isSwitch = false) => {
      try {
        if (!isSwitch) setLoading(true);
        setError(null);

        // Use "last" to get the most recently watched lesson, or first if no progress
        const targetId = lessonId || 'last';

        const res = await fetch(
          `/api/courses/${encodeURIComponent(slug)}/lessons/${encodeURIComponent(targetId)}`
        );

        if (res.status === 403) {
          setError('no-enrollment');
          return;
        }

        if (!res.ok) {
          setError(res.status === 404 ? 'not-found' : 'generic');
          return;
        }

        const lessonData: LessonData = await res.json();
        setData(lessonData);
        setCurrentLessonId(lessonData.lesson.id);
      } catch {
        setError('generic');
      } finally {
        if (!isSwitch) setLoading(false);
      }
    },
    [slug]
  );

  // Load first lesson on mount
  useEffect(() => {
    if (sessionStatus === 'loading') return;
    fetchLesson();
  }, [fetchLesson, sessionStatus]);

  // Not logged in — open auth modal via Navbar
  useEffect(() => {
    if (sessionStatus === 'unauthenticated') {
      window.dispatchEvent(new CustomEvent('open-auth-modal'));
    }
  }, [sessionStatus]);

  // Handle lesson change - instant switch
  const handleLessonChange = useCallback(
    (lessonId: string) => {
      if (lessonId === currentLessonId) return;
      setCurrentLessonId(lessonId);
      fetchLesson(lessonId, true);
    },
    [currentLessonId, fetchLesson]
  );

  // Auth loading or redirecting
  if (sessionStatus === 'loading' || !session?.user || (loading && !error)) {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] pt-24">
          <Loader2 className="w-8 h-8 text-primary animate-spin" />
        </div>
      </div>
    );
  }

  // Error states
  if (error === 'not-found') {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] pt-24 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-[#ffffff] rounded-2xl p-8 shadow-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-dubai">{ct.courseNotFound}</h2>
          <Link
            href="/"
            className="inline-flex items-center gap-2 mt-4 px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
          >
            {ct.backToHome}
          </Link>
        </motion.div>
        </div>
      </div>
    );
  }

  if (error === 'no-enrollment') {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] pt-24 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-sm bg-[#ffffff] rounded-2xl p-8 shadow-sm border border-gray-200">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
            <Lock className="w-7 h-7 text-primary" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2 font-dubai">{pt.enrollmentRequired}</h2>
          <Link
            href={`/courses/${slug}/enroll`}
            className="inline-flex items-center gap-2 mt-4 px-6 py-2.5 rounded-xl bg-primary text-secondary text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            {pt.enrollNow}
          </Link>
        </motion.div>
        </div>
      </div>
    );
  }

  if (error === 'generic') {
    return (
      <div className="min-h-screen bg-[#faf7f2]">
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] pt-24 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center bg-[#ffffff] rounded-2xl p-8 shadow-sm border border-gray-200">
          <AlertCircle className="w-12 h-12 text-red-400/60 mx-auto mb-4" />
          <h2 className="text-lg font-bold text-gray-900 mb-2 font-dubai">{pt.errorLoading}</h2>
          <button
            onClick={() => fetchLesson(currentLessonId ?? undefined)}
            className="mt-4 px-5 py-2.5 rounded-xl bg-primary text-secondary text-sm font-bold hover:bg-primary/90 transition-colors"
          >
            {pt.retry}
          </button>
        </motion.div>
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="min-h-screen bg-[#faf7f2]">
      <Navbar />
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 lg:px-5 pb-3 sm:pb-4 lg:pb-6 pt-24 sm:pt-28">
        <WatchPageLayout
          course={data.course}
          lesson={data.lesson}
          sections={data.sections}
          initialProgress={data.progress}
          allProgress={data.allProgress}
          enrolled={data.enrolled}
          isRTL={isRTL}
          translations={{
            backToCourse: pt.backToCourse,
            courseContent: pt.courseContent,
            playing: pt.playing,
            paused: pt.paused,
            play: pt.play,
            pause: pt.pause,
            mute: pt.mute,
            unmute: pt.unmute,
            fullscreen: pt.fullscreen,
            exitFullscreen: pt.exitFullscreen,
            speed: pt.speed,
            normal: pt.normal,
            forward: pt.forward,
            backward: pt.backward,
            nextLesson: pt.nextLesson,
            previousLesson: pt.previousLesson,
            progress: pt.progress,
            freeLesson: ct.freeLesson,
            upNext: pt.upNext,
            autoPlayNext: pt.autoPlayNext,
            like: ct.like,
            likes: ct.likes,
          }}
          onLessonChange={handleLessonChange}
        />
      </div>
    </div>
  );
}
