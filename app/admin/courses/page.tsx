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

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
  icon: 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
  popup: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
};

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
    <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* العنوان */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, ease: [0.25, 0.1, 0.25, 1] }}
          className="flex flex-col gap-4 will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div className="flex items-center gap-3 sm:gap-4">
            <motion.div 
              className="w-10 h-10 sm:w-14 sm:h-14 bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center border-2 border-primary/30"
              style={{ boxShadow: SHADOWS.icon }}
              whileHover={{ scale: 1.05 }}
            >
              <PlayCircle className="w-5 h-5 sm:w-7 sm:h-7 text-secondary" strokeWidth={1.5} />
            </motion.div>
            <div className="flex-1">
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-secondary font-dubai">
                {ct.title}
              </h1>
              <p className="text-secondary/60 text-xs sm:text-sm mt-0.5 sm:mt-1 font-dubai">
                {ct.subtitle}
              </p>
            </div>
          </div>
          
          <div className="flex flex-wrap items-center justify-end gap-2 sm:gap-3">
            {/* تبويبات التصفية */}
            <div className="flex gap-1 p-1 rounded-xl bg-white border-2 border-primary/20" style={{ boxShadow: SHADOWS.card }}>
              {filterTabs.map(({ key, label, count }) => (
                <button
                  key={key}
                  onClick={() => setFilter(key)}
                  className={`px-3 py-2 rounded-lg text-xs font-dubai font-medium transition-all whitespace-nowrap ${
                    filter === key
                      ? 'bg-primary/20 text-secondary border border-primary/30'
                      : 'text-secondary/50 hover:text-secondary/70 hover:bg-primary/5'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={fetchCourses}
              className="flex items-center gap-2 p-2 sm:px-4 sm:py-3 bg-white border-2 border-primary/30 rounded-xl font-dubai font-medium text-secondary hover:border-primary/50 transition-colors"
              style={{ boxShadow: SHADOWS.card }}
            >
              <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
            
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => router.push('/admin/courses/new')}
              className="flex items-center gap-1.5 sm:gap-2 bg-secondary text-accent px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl font-dubai font-bold text-sm transition-all hover:shadow-lg"
              style={{ boxShadow: SHADOWS.button }}
            >
              <Plus className="w-4 sm:w-5 h-4 sm:h-5" />
              <span className="hidden sm:inline">{ct.newCourse}</span>
              <span className="sm:hidden">{isRTL ? 'جديد' : 'New'}</span>
            </motion.button>
          </div>
        </motion.div>

        {/* شريط البحث */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.25, 0.1, 0.25, 1] }}
          className="relative will-change-transform"
          style={{ transform: 'translateZ(0)' }}
        >
          <div 
            className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden"
            style={{ boxShadow: SHADOWS.card }}
          >
            <div className="flex items-center px-4">
              <Search className="w-5 h-5 text-secondary/40" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={ct.searchPlaceholder}
                className="flex-1 px-4 py-4 bg-transparent text-secondary placeholder-secondary/40 focus:outline-none font-dubai"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
                >
                  <span className="text-secondary/40 text-sm">✕</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>

        {/* رسالة الخطأ */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="flex items-center gap-3 p-4 bg-red-50 border-2 border-red-200 rounded-2xl text-red-700"
            >
              <AlertCircle className="w-5 h-5 shrink-0" />
              <span className="font-dubai">{error}</span>
              <button
                onClick={fetchCourses}
                className="mr-auto flex items-center gap-2 px-3 py-1.5 rounded-xl bg-secondary text-white text-xs font-dubai hover:bg-secondary/90 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                {isRTL ? 'إعادة المحاولة' : 'Retry'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* المحتوى */}
        {loading ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div
              className="w-16 h-16 bg-primary/30 rounded-2xl flex items-center justify-center mb-4 border-2 border-primary/40"
              style={{ boxShadow: SHADOWS.icon }}
            >
              <Loader2 className="w-8 h-8 text-secondary animate-spin" />
            </div>
            <p className="text-secondary/60 font-dubai">{t.admin.loading}</p>
          </motion.div>
        ) : !error && filteredCourses.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16"
          >
            <div
              className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center mb-4 border-2 border-primary/30"
              style={{ boxShadow: SHADOWS.icon }}
            >
              <BookOpen className="w-8 h-8 text-secondary/40" />
            </div>
            <p className="text-secondary/60 font-dubai font-medium mb-1">
              {search ? ct.tryDifferentSearch : ct.noCourses}
            </p>
            {!search && (
              <p className="text-sm text-secondary/40 font-dubai mb-4">{ct.startCreating}</p>
            )}
            {!search && (
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => router.push('/admin/courses/new')}
                className="flex items-center gap-2 bg-secondary text-accent px-5 py-3 rounded-xl font-dubai font-bold text-sm transition-all hover:shadow-lg"
                style={{ boxShadow: SHADOWS.button }}
              >
                <Plus className="w-5 h-5" />
                {ct.newCourse}
              </motion.button>
            )}
          </motion.div>
        ) : !error && (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
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
            <div className="mt-6 text-center text-xs text-secondary/40 font-dubai">
              {ct.totalCourses(courses.length)}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
