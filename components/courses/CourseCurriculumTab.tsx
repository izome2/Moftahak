'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, PlayCircle, Lock, Clock, ListVideo, BookOpen } from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDuration, formatDurationEn } from '@/lib/courses/utils';

interface Lesson {
  id: string;
  title: string;
  duration: number;
  isFree: boolean;
}

interface Section {
  id: string;
  title: string;
  lessons: Lesson[];
}

interface CourseCurriculumTabProps {
  sections: Section[];
  totalDuration: number;
  lessonsCount: number;
}

export default function CourseCurriculumTab({
  sections,
  totalDuration,
  lessonsCount,
}: CourseCurriculumTabProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.courses;

  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(sections.length > 0 ? [sections[0].id] : [])
  );

  const toggleSection = (id: string) => {
    setExpandedSections((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const fmtDuration = isRTL ? formatDuration : formatDurationEn;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="rounded-2xl bg-[#ead3b9]/20 border-2 border-[#ead3b9]/70 shadow-lg overflow-hidden">
        {/* Section header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#ead3b9]/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#ead3b9]/40 flex items-center justify-center">
              <ListVideo className="w-[18px] h-[18px] text-[#c4956a]" />
            </div>
            <h3 className="text-base font-bold text-secondary">{ct.curriculum || 'محتوى الدورة'}</h3>
          </div>
          {/* Stats pills */}
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffffff]/60 border border-[#ead3b9]/50 text-xs text-gray-600 font-medium">
              <BookOpen className="w-3 h-3" />
              {ct.lessonsCount(lessonsCount)}
            </span>
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#ffffff]/60 border border-[#ead3b9]/50 text-xs text-gray-600 font-medium">
              <Clock className="w-3 h-3" />
              {fmtDuration(totalDuration)}
            </span>
          </div>
        </div>

        {/* Sections accordion */}
        <div className="divide-y divide-[#ead3b9]/30">
          {sections.map((section, sIndex) => {
            const isExpanded = expandedSections.has(section.id);
            const sectionDuration = section.lessons.reduce((sum, l) => sum + l.duration, 0);

            return (
              <div key={section.id}>
                {/* Section header */}
                <button
                  onClick={() => toggleSection(section.id)}
                  className="w-full flex items-center justify-between px-6 py-4 hover:bg-[#ead3b9]/10 transition-colors text-start"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="w-7 h-7 rounded-full bg-primary/15 flex items-center justify-center text-xs font-bold text-primary flex-shrink-0">
                      {sIndex + 1}
                    </span>
                    <span className="text-[15px] font-bold text-gray-900 truncate">
                      {section.title}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span className="text-xs text-gray-400">
                      {ct.sectionLessons(section.lessons.length)}
                      <span className="hidden sm:inline"> &middot; {fmtDuration(sectionDuration)}</span>
                    </span>
                    <motion.div
                      animate={{ rotate: isExpanded ? 180 : 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown className="w-4 h-4 text-gray-400" />
                    </motion.div>
                  </div>
                </button>

                {/* Lessons */}
                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="bg-[#ead3b9]/10 divide-y divide-[#ead3b9]/20">
                        {section.lessons.map((lesson, lIndex) => (
                          <div
                            key={lesson.id}
                            className="flex items-center gap-3 px-6 py-3.5 hover:bg-[#ead3b9]/15 transition-colors"
                          >
                            {/* Icon */}
                            {lesson.isFree ? (
                              <PlayCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            ) : (
                              <Lock className="w-3.5 h-3.5 text-gray-300 flex-shrink-0" />
                            )}

                            {/* Title */}
                            <span className="flex-1 text-[15px] text-gray-700 truncate">
                              {sIndex + 1}.{lIndex + 1} {lesson.title}
                            </span>

                            {/* Free badge */}
                            {lesson.isFree && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] bg-emerald-50 text-emerald-600 font-medium border border-emerald-100">
                                {ct.freeLesson}
                              </span>
                            )}

                            {/* Duration */}
                            <div className="flex items-center gap-1 text-xs text-gray-400 flex-shrink-0">
                              <Clock className="w-3 h-3" />
                              {fmtDuration(lesson.duration)}
                            </div>
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
    </motion.div>
  );
}
