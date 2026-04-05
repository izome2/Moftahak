'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  PlayCircle,
  Loader2,
  RefreshCw,
  AlertCircle,
  BookOpen,
} from 'lucide-react';
import CourseCard from '@/components/admin/courses/CourseCard';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface CourseListItem {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  thumbnailUrl: string | null;
  price: number;
  currency: string;
  level: 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
  isPublished: boolean;
  totalDuration: number;
  lessonsCount: number;
  enrollmentsCount?: number;
  averageRating?: number;
  instructor?: string;
  createdAt: string;
}

type FilterTab = 'all' | 'published' | 'draft';

export default function AdminCoursesPage() {
  const router = useRouter();
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.admin.coursesPage;

  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch('/api/admin/courses');
      if (!res.ok) throw new Error('Failed to fetch courses');
      const data = await res.json();
      setCourses(data.courses || []);
    } catch {
      setError('حدث خطأ في تحميل الدورات');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  // تصفية الدورات
  const filteredCourses = courses.filter((course) => {
    const matchSearch =
      !search ||
      course.title.toLowerCase().includes(search.toLowerCase()) ||
      (course.shortDescription || '').toLowerCase().includes(search.toLowerCase());

    const matchFilter =
      filter === 'all' ||
      (filter === 'published' && course.isPublished) ||
      (filter === 'draft' && !course.isPublished);

    return matchSearch && matchFilter;
  });

  const handleEdit = (id: string) => {
    router.push(`/admin/courses/${id}/edit`);
  };

  const handleDelete = async (id: string) => {
    if (!confirm(ct.confirmDelete)) return;
    try {
      const res = await fetch(`/api/admin/courses/${id}`, { method: 'DELETE' });
      if (res.ok) {
        setCourses((prev) => prev.filter((c) => c.id !== id));
      }
    } catch {
      // ignore
    }
  };

  const handleTogglePublish = async (id: string, isPublished: boolean) => {
    try {
      const res = await fetch(`/api/admin/courses/${id}/publish`, { method: 'POST' });
      if (res.ok) {
        setCourses((prev) =>
          prev.map((c) => (c.id === id ? { ...c, isPublished: !isPublished } : c))
        );
      } else {
        const data = await res.json();
        alert(data.error || 'Error');
      }
    } catch {
      // ignore
    }
  };

  const publishedCount = courses.filter((c) => c.isPublished).length;
  const draftCount = courses.filter((c) => !c.isPublished).length;

  const filterTabs: { key: FilterTab; label: string; count: number }[] = [
    { key: 'all', label: ct.allCourses, count: courses.length },
    { key: 'published', label: ct.published, count: publishedCount },
    { key: 'draft', label: ct.draft, count: draftCount },
  ];

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex-none p-6 pb-0">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          {/* العنوان */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <PlayCircle className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-secondary">{ct.title}</h1>
              <p className="text-sm text-secondary/50">{ct.subtitle}</p>
            </div>
          </div>

          {/* زر إنشاء دورة */}
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => router.push('/admin/courses/new')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors shadow-md"
          >
            <Plus className="w-4 h-4" />
            {ct.newCourse}
          </motion.button>
        </div>

        {/* شريط البحث و التصفية */}
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* بحث */}
          <div className="relative flex-1">
            <Search className={`absolute top-1/2 -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} w-4 h-4 text-secondary/30`} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={ct.searchPlaceholder}
              className={`w-full ${isRTL ? 'pr-10 pl-4' : 'pl-10 pr-4'} py-2.5 rounded-xl border border-primary/15 bg-white/80 focus:outline-none focus:ring-2 focus:ring-primary/30 text-sm text-secondary placeholder:text-secondary/30 transition-all`}
            />
          </div>

          {/* تبويبات */}
          <div className="flex gap-1 p-1 rounded-xl bg-primary/5 border border-primary/10">
            {filterTabs.map(({ key, label, count }) => (
              <button
                key={key}
                onClick={() => setFilter(key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${
                  filter === key
                    ? 'bg-white text-secondary shadow-sm'
                    : 'text-secondary/50 hover:text-secondary/70'
                }`}
              >
                {label} ({count})
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* المحتوى */}
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
            <p className="text-sm text-secondary/50">{t.admin.loading}</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20">
            <AlertCircle className="w-8 h-8 text-red-400 mb-3" />
            <p className="text-sm text-red-500 mb-3">{error}</p>
            <button
              onClick={fetchCourses}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-secondary/5 text-secondary text-sm hover:bg-secondary/10 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
              {isRTL ? 'إعادة المحاولة' : 'Retry'}
            </button>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
              <BookOpen className="w-8 h-8 text-primary/40" />
            </div>
            <p className="text-secondary/60 font-medium mb-1">
              {search ? ct.tryDifferentSearch : ct.noCourses}
            </p>
            {!search && (
              <p className="text-sm text-secondary/40 mb-4">{ct.startCreating}</p>
            )}
            {!search && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/admin/courses/new')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-secondary text-white text-sm font-medium hover:bg-secondary/90 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {ct.newCourse}
              </motion.button>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              <AnimatePresence mode="popLayout">
                {filteredCourses.map((course) => (
                  <CourseCard
                    key={course.id}
                    course={course}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                    onTogglePublish={handleTogglePublish}
                  />
                ))}
              </AnimatePresence>
            </div>

            {/* ملخص */}
            <div className="mt-6 text-center text-xs text-secondary/40">
              {ct.totalCourses(courses.length)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
