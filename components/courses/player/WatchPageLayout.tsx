'use client';

import React, { useCallback, useMemo } from 'react';
import VideoPlayer from './VideoPlayer';
import LessonLikeButton from './LessonLikeButton';
import LessonsSidebar from './LessonsSidebar';
import { CommentsSection } from '@/components/courses/comments';
import { cn } from '@/lib/utils';

interface Section {
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
}

interface WatchPageLayoutProps {
  course: {
    id: string;
    title: string;
    slug: string;
    instructor?: { firstName: string; lastName: string; image: string | null };
  };
  lesson: {
    id: string;
    title: string;
    videoUrl: string;
    duration: number;
    isFree: boolean;
    sectionId: string;
    sectionTitle: string;
  };
  sections: Section[];
  initialProgress: { watchedSeconds: number; lastPosition: number } | null;
  allProgress: { lessonId: string }[];
  enrolled: boolean;
  isRTL: boolean;
  translations: {
    backToCourse: string;
    courseContent: string;
    playing: string;
    paused: string;
    play: string;
    pause: string;
    mute: string;
    unmute: string;
    fullscreen: string;
    exitFullscreen: string;
    speed: string;
    normal: string;
    forward: string;
    backward: string;
    nextLesson: string;
    previousLesson: string;
    progress: string;
    freeLesson: string;
    upNext: string;
    autoPlayNext: string;
    like: string;
    likes: (count: number) => string;
  };
  onLessonChange: (lessonId: string) => void;
}

export default function WatchPageLayout({
  course,
  lesson,
  sections,
  initialProgress,
  allProgress,
  enrolled,
  isRTL,
  translations: t,
  onLessonChange,
}: WatchPageLayoutProps) {
  // Build flat lesson list for navigation
  const flatLessons = useMemo(() => {
    const list: { id: string; title: string; sectionTitle: string; hasAccess: boolean }[] = [];
    for (const section of sections) {
      for (const l of section.lessons) {
        list.push({ id: l.id, title: l.title, sectionTitle: section.title, hasAccess: l.hasAccess });
      }
    }
    return list;
  }, [sections]);

  const currentIndex = flatLessons.findIndex((l) => l.id === lesson.id);
  const nextLesson = currentIndex < flatLessons.length - 1 ? flatLessons[currentIndex + 1] : null;
  const prevLesson = currentIndex > 0 ? flatLessons[currentIndex - 1] : null;

  const totalLessons = flatLessons.length;

  // Progress callback
  const handleProgressUpdate = useCallback(
    async (data: { watchedSeconds: number; lastPosition: number }) => {
      if (!enrolled) return;
      try {
        await fetch(`/api/courses/${course.slug}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: lesson.id, ...data }),
        });
      } catch {
        // Silently fail - progress will be saved next time
      }
    },
    [enrolled, course.slug, lesson.id]
  );

  // Video ended handler - auto advance to next lesson
  const handleVideoEnded = useCallback(() => {
    if (nextLesson?.hasAccess) {
      onLessonChange(nextLesson.id);
    }
  }, [nextLesson, onLessonChange]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_minmax(340px,400px)] gap-4 h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main area */}
      <div className="min-w-0 space-y-4">
        {/* Video Player */}
        <div className="relative rounded-2xl overflow-hidden shadow-lg border-2 border-[#ead3b9]">
          <VideoPlayer
            key={lesson.id}
            src={lesson.videoUrl}
            title={lesson.title}
            courseSlug={course.slug}
            lessonId={lesson.id}
            initialPosition={initialProgress?.lastPosition ?? 0}
            onProgressUpdate={enrolled ? handleProgressUpdate : undefined}
            onEnded={handleVideoEnded}
            isRTL={isRTL}
            translations={{
              play: t.play,
              pause: t.pause,
              mute: t.mute,
              unmute: t.unmute,
              fullscreen: t.fullscreen,
              exitFullscreen: t.exitFullscreen,
              speed: t.speed,
              normal: t.normal,
              forward: t.forward,
              backward: t.backward,
            }}
          />
        </div>

        {/* Lesson info card — notch tab, instructor + like, comments */}
        <div className="relative">
          {/* Notch tab — floats above the card, same beige bg + border, no bottom border */}
          <div className="relative z-10 flex" dir={isRTL ? 'rtl' : 'ltr'}>
            <div className="flex items-end">
              {/* Tab content */}
              <div className="flex items-center gap-2 bg-[#ead3b9]/20 text-secondary border-2 border-[#ead3b9] border-b-0 px-5 py-2 font-dubai text-sm font-bold rounded-t-xl">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="shrink-0"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                <span className="line-clamp-1 max-w-[300px] sm:max-w-[500px]">{lesson.title}</span>
              </div>
              {/* Smooth curve tail — matches card bg */}
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className={cn('shrink-0 -mb-[2px]', isRTL && '-scale-x-100')}>
                <path d="M0 0 C0 11.046 8.954 20 20 20 L0 20 Z" fill="rgba(234,211,185,0.2)" />
              </svg>
            </div>
          </div>

          {/* Card body */}
          <div className={cn(
            'rounded-2xl overflow-hidden shadow-lg bg-[#ead3b9]/20 border-2 border-[#ead3b9] -mt-px',
            isRTL ? 'rounded-tr-none' : 'rounded-tl-none'
          )} dir={isRTL ? 'rtl' : 'ltr'}>

          {/* Instructor + like row */}
          <div className="flex items-center justify-between gap-3 px-5 md:px-6 py-4" dir={isRTL ? 'rtl' : 'ltr'}>
            {/* Instructor */}
            {course.instructor && (
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#ead3b9]/30 flex items-center justify-center text-sm font-bold text-[#c4956a] overflow-hidden ring-2 ring-[#ead3b9]/40">
                  {course.instructor.image ? (
                    <img src={course.instructor.image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <span>{course.instructor.firstName[0]}</span>
                  )}
                </div>
                <div>
                  <p className="text-sm font-bold text-secondary font-dubai leading-tight">
                    {course.instructor.firstName} {course.instructor.lastName}
                  </p>
                  <p className="text-xs text-secondary/60 font-dubai">{course.title}</p>
                </div>
              </div>
            )}

            {/* Like button */}
            {enrolled && (
              <div className="shrink-0">
                <LessonLikeButton
                  courseSlug={course.slug}
                  lessonId={lesson.id}
                  likeLabel={t.like}
                  likesLabel={t.likes}
                />
              </div>
            )}
          </div>

          {/* Comments */}
          <div className="border-t border-[#ead3b9]/40 p-5 md:p-6">
            <CommentsSection
              courseSlug={course.slug}
              lessonId={lesson.id}
              enrolled={enrolled}
            />
          </div>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <LessonsSidebar
        sections={sections}
        activeLessonId={lesson.id}
        courseTitle={course.title}
        totalLessons={totalLessons}
        isRTL={isRTL}
        onLessonSelect={onLessonChange}
        translations={{
          courseContent: t.courseContent,
          progress: t.progress,
          freeLesson: t.freeLesson,
        }}
      />
    </div>
  );
}
