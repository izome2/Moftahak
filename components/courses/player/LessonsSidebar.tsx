'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, X, ListVideo } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';
import LessonItem from './LessonItem';

interface SidebarSection {
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

interface LessonsSidebarProps {
  sections: SidebarSection[];
  activeLessonId: string;
  courseTitle: string;
  totalLessons: number;
  isRTL?: boolean;
  onLessonSelect: (lessonId: string) => void;
  translations: {
    courseContent: string;
    progress: string;
    freeLesson: string;
  };
}

export default function LessonsSidebar({
  sections,
  activeLessonId,
  courseTitle,
  totalLessons,
  isRTL = false,
  onLessonSelect,
  translations: t,
}: LessonsSidebarProps) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const activeLessonRef = useRef<HTMLDivElement>(null);

  // Auto-expand section containing active lesson
  useEffect(() => {
    for (const section of sections) {
      if (section.lessons.some((l) => l.id === activeLessonId)) {
        setExpandedSections((prev) => new Set([...prev, section.id]));
        break;
      }
    }
  }, [activeLessonId, sections]);

  // Scroll active lesson into view
  useEffect(() => {
    setTimeout(() => {
      activeLessonRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }, 300);
  }, [activeLessonId]);

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const sidebarContent = (
    <div className="flex flex-col h-full" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header */}
      <div className="p-4 border-b border-[#ead3b9]/40">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-bold text-gray-900 font-dubai">{t.courseContent}</h3>
          <button
            onClick={() => setIsMobileOpen(false)}
            className="lg:hidden p-1 rounded-lg hover:bg-[#ead3b9]/20 transition-colors"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      </div>

      {/* Sections */}
      <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent">
        {sections.map((section) => {
          const isExpanded = expandedSections.has(section.id);

          return (
            <div key={section.id} className="border-b border-[#ead3b9]/30 last:border-b-0">
              {/* Section header */}
              <button
                onClick={() => toggleSection(section.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-[#ead3b9]/10 transition-colors"
              >
                <div className="text-start flex-1 min-w-0">
                  <p className="text-[15px] font-bold text-gray-800 font-dubai line-clamp-1">
                    {section.title}
                  </p>
                  <p className="text-xs text-gray-400 mt-0.5 font-dubai">
                    {section.lessons.length} {section.lessons.length === 1 ? (isRTL ? 'درس' : 'lesson') : (isRTL ? 'دروس' : 'lessons')}
                  </p>
                </div>
                <ChevronDown
                  className={cn(
                    'w-4 h-4 text-gray-400 shrink-0 transition-transform duration-200',
                    isExpanded && 'rotate-180'
                  )}
                />
              </button>

              {/* Lessons */}
              <AnimatePresence initial={false}>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pb-3 px-3 space-y-2">
                      {section.lessons.map((lesson) => (
                        <div
                          key={lesson.id}
                          ref={lesson.id === activeLessonId ? activeLessonRef : undefined}
                        >
                          <LessonItem
                            id={lesson.id}
                            title={lesson.title}
                            duration={lesson.duration}
                            videoUrl={lesson.videoUrl}
                            hasAccess={lesson.hasAccess}
                            isActive={lesson.id === activeLessonId}
                            isRTL={isRTL}
                            onClick={onLessonSelect}
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setIsMobileOpen(true)}
        className="lg:hidden fixed bottom-4 end-4 z-40 bg-[#ead3b9]/20 text-secondary p-3 rounded-2xl shadow-lg border-2 border-[#ead3b9]"
      >
        <ListVideo className="w-5 h-5" />
      </button>

      {/* Desktop sidebar */}
      <div className="hidden lg:flex flex-col bg-[#ead3b9]/20 rounded-2xl border-2 border-[#ead3b9] overflow-hidden sticky top-28 max-h-[calc(100vh-8rem)] shadow-lg">
        {sidebarContent}
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {isMobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/40 z-50"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.div
              initial={{ x: isRTL ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: isRTL ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className={cn(
                'lg:hidden fixed top-0 bottom-0 z-50 w-[320px] bg-[#ffffff] shadow-xl',
                isRTL ? 'start-0 border-e border-gray-200' : 'end-0 border-s border-gray-200'
              )}
            >
              {sidebarContent}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
