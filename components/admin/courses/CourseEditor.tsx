'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Save,
  Loader2,
  ArrowRight,
  ArrowLeft,
  ChevronDown,
  ChevronUp,
  Plus,
  Trash2,
  GripVertical,
  BookOpen,
  Film,
  ImageIcon,
  Star,
  X,
  AlertCircle,
  DollarSign,
  Gift,
} from 'lucide-react';
import VideoUploadZone from './VideoUploadZone';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import type { CourseLevel } from '@/types/courses';

// ---------- Types ----------

interface LessonData {
  id?: string;
  title: string;
  description: string;
  videoUrl: string;
  duration: number;
  sortOrder: number;
  isFree: boolean;
}

// استخراج مدة الفيديو تلقائياً
function getVideoDuration(url: string): Promise<number> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    // Timeout after 10 seconds
    const timeout = setTimeout(() => {
      video.src = '';
      resolve(0);
    }, 10000);
    video.onloadedmetadata = () => {
      clearTimeout(timeout);
      const duration = Math.round(video.duration);
      video.src = '';
      resolve(isFinite(duration) && duration > 0 ? duration : 0);
    };
    video.onerror = () => {
      clearTimeout(timeout);
      resolve(0);
    };
    // For local paths, ensure full URL
    video.src = url.startsWith('/') ? window.location.origin + url : url;
  });
}

interface SectionData {
  id?: string;
  title: string;
  description: string;
  sortOrder: number;
  lessons: LessonData[];
  isExpanded?: boolean;
}

interface CourseFormData {
  title: string;
  description: string;
  shortDescription: string;
  price: number;
  level: CourseLevel;
  features: string[];
  thumbnailUrl: string;
  previewVideoUrl: string;
  sections: SectionData[];
}

interface CourseEditorProps {
  courseId?: string; // undefined = create mode
}

const LEVEL_OPTIONS: { value: CourseLevel; label_ar: string; label_en: string }[] = [
  { value: 'BEGINNER', label_ar: 'مبتدئ', label_en: 'Beginner' },
  { value: 'INTERMEDIATE', label_ar: 'متوسط', label_en: 'Intermediate' },
  { value: 'ADVANCED', label_ar: 'متقدم', label_en: 'Advanced' },
];

const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
  icon: 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
  input: 'rgba(237, 191, 140, 0.08) 0px 2px 8px',
};

export default function CourseEditor({ courseId }: CourseEditorProps) {
  const router = useRouter();
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const ct = t.admin.coursesPage;
  const et = ct.editor;

  const isEdit = !!courseId;

  const [form, setForm] = useState<CourseFormData>({
    title: '',
    description: '',
    shortDescription: '',
    price: 0,
    level: 'BEGINNER',
    features: [],
    thumbnailUrl: '',
    previewVideoUrl: '',
    sections: [],
  });

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newFeature, setNewFeature] = useState('');

  // تتبع العناصر المحذوفة لحذفها من الخادم
  const [deletedSectionIds, setDeletedSectionIds] = useState<string[]>([]);
  const [deletedLessonIds, setDeletedLessonIds] = useState<{ sectionId: string; lessonId: string }[]>([]);

  // ---------- Load course data ----------

  useEffect(() => {
    if (!courseId) return;
    (async () => {
      try {
        const res = await fetch(`/api/admin/courses/${courseId}`);
        if (!res.ok) throw new Error('Failed to load');
        const data = await res.json();
        const course = data.course;
        setForm({
          title: course.title || '',
          description: course.description || '',
          shortDescription: course.shortDescription || '',
          price: course.price || 0,
          level: course.level || 'BEGINNER',
          features: course.features || [],
          thumbnailUrl: course.thumbnailUrl || '',
          previewVideoUrl: course.previewVideoUrl || '',
          sections: (course.sections || []).map((s: any, si: number) => ({
            id: s.id,
            title: s.title || '',
            description: s.description || '',
            sortOrder: s.sortOrder ?? si,
            isExpanded: false,
            lessons: (s.lessons || []).map((l: any, li: number) => ({
              id: l.id,
              title: l.title || '',
              description: l.description || '',
              videoUrl: l.videoUrl || '',
              duration: l.duration || 0,
              sortOrder: l.sortOrder ?? li,
              isFree: l.isFree || false,
            })),
          })),
        });
      } catch {
        setError('حدث خطأ في تحميل بيانات الدورة');
      } finally {
        setLoading(false);
      }
    })();
  }, [courseId]);

  // ---------- Form Helpers ----------

  const updateForm = (updates: Partial<CourseFormData>) => {
    setForm((prev) => ({ ...prev, ...updates }));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    updateForm({ features: [...form.features, newFeature.trim()] });
    setNewFeature('');
  };

  const removeFeature = (index: number) => {
    updateForm({ features: form.features.filter((_, i) => i !== index) });
  };

  // ---------- Section Helpers ----------

  const addSection = () => {
    const newSection: SectionData = {
      title: '',
      description: '',
      sortOrder: form.sections.length,
      lessons: [],
      isExpanded: true,
    };
    updateForm({ sections: [...form.sections, newSection] });
  };

  const updateSection = (sIndex: number, updates: Partial<SectionData>) => {
    setForm((prev) => {
      const sections = [...prev.sections];
      sections[sIndex] = { ...sections[sIndex], ...updates };
      return { ...prev, sections };
    });
  };

  const removeSection = (sIndex: number) => {
    if (!confirm(et.confirmDeleteSection)) return;
    const section = form.sections[sIndex];
    if (section.id) {
      setDeletedSectionIds((prev) => [...prev, section.id!]);
    }
    updateForm({ sections: form.sections.filter((_, i) => i !== sIndex) });
  };

  const toggleSection = (sIndex: number) => {
    updateSection(sIndex, { isExpanded: !form.sections[sIndex].isExpanded });
  };

  // ---------- Lesson Helpers ----------

  const addLesson = (sIndex: number) => {
    setForm((prev) => {
      const sections = [...prev.sections];
      const lessons = [...sections[sIndex].lessons];
      lessons.push({
        title: '',
        description: '',
        videoUrl: '',
        duration: 0,
        sortOrder: lessons.length,
        isFree: false,
      });
      sections[sIndex] = { ...sections[sIndex], lessons };
      return { ...prev, sections };
    });
  };

  const updateLesson = (sIndex: number, lIndex: number, updates: Partial<LessonData>) => {
    setForm((prev) => {
      const sections = [...prev.sections];
      const lessons = [...sections[sIndex].lessons];
      lessons[lIndex] = { ...lessons[lIndex], ...updates };
      sections[sIndex] = { ...sections[sIndex], lessons };
      return { ...prev, sections };
    });
  };

  const removeLesson = (sIndex: number, lIndex: number) => {
    if (!confirm(et.confirmDeleteLesson)) return;
    setForm((prev) => {
      const sections = [...prev.sections];
      const lesson = sections[sIndex].lessons[lIndex];
      if (lesson.id && sections[sIndex].id) {
        setDeletedLessonIds((dl) => [...dl, { sectionId: sections[sIndex].id!, lessonId: lesson.id! }]);
      }
      const lessons = sections[sIndex].lessons.filter((_, i) => i !== lIndex);
      sections[sIndex] = { ...sections[sIndex], lessons };
      return { ...prev, sections };
    });
  };

  // ---------- Save ----------

  const handleSave = async () => {
    // التحقق الشامل
    const validationErrors: string[] = [];
    
    if (!form.title.trim()) {
      validationErrors.push(isRTL ? 'يرجى إدخال عنوان الدورة' : 'Please enter course title');
    }
    if (!form.description.trim() || form.description.trim().length < 10) {
      validationErrors.push(isRTL ? 'يرجى إدخال وصف الدورة (10 أحرف على الأقل)' : 'Please enter course description (min 10 chars)');
    }
    
    // التحقق من الأقسام والدروس
    for (let si = 0; si < form.sections.length; si++) {
      const section = form.sections[si];
      if (!section.title.trim()) {
        validationErrors.push(isRTL ? `القسم ${si + 1} بدون عنوان` : `Section ${si + 1} has no title`);
      }
      for (let li = 0; li < section.lessons.length; li++) {
        const lesson = section.lessons[li];
        if (!lesson.title.trim()) {
          validationErrors.push(isRTL ? `الدرس ${li + 1} في القسم "${section.title || si + 1}" بدون عنوان` : `Lesson ${li + 1} in section "${section.title || si + 1}" has no title`);
        }
        if (!lesson.videoUrl) {
          validationErrors.push(isRTL ? `الدرس "${lesson.title || li + 1}" في القسم "${section.title || si + 1}" بدون فيديو` : `Lesson "${lesson.title || li + 1}" in section "${section.title || si + 1}" has no video`);
        }
      }
    }

    if (validationErrors.length > 0) {
      setError(validationErrors.join('\n'));
      return;
    }

    setSaving(true);
    setError(null);

    try {
      // 1. حفظ/إنشاء الدورة الأساسية
      const coursePayload = {
        title: form.title,
        description: form.description,
        shortDescription: form.shortDescription || undefined,
        price: form.price,
        level: form.level,
        features: form.features.length > 0 ? form.features : undefined,
        thumbnailUrl: form.thumbnailUrl || null,
        previewVideoUrl: form.previewVideoUrl || null,
      };

      let savedCourseId = courseId;

      if (isEdit) {
        const res = await fetch(`/api/admin/courses/${courseId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursePayload),
        });
        if (!res.ok) {
          const data = await res.json();
          const detail = data.details?.[0]?.message || data.detail || data.error;
          throw new Error(detail || 'Failed to update course');
        }
      } else {
        const res = await fetch('/api/admin/courses', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(coursePayload),
        });
        if (!res.ok) {
          const data = await res.json();
          const detail = data.details?.[0]?.message || data.detail || data.error;
          throw new Error(detail || 'Failed to create course');
        }
        const data = await res.json();
        savedCourseId = data.course.id;
      }

      // 2. حذف العناصر المحذوفة من الخادم
      const errors: string[] = [];
      if (savedCourseId && isEdit) {
        // حذف الدروس المحذوفة
        for (const dl of deletedLessonIds) {
          try {
            await fetch(`/api/admin/courses/${savedCourseId}/sections/${dl.sectionId}/lessons/${dl.lessonId}`, {
              method: 'DELETE',
            });
          } catch {
            // تجاهل أخطاء الحذف - الدرس قد يكون محذوفاً مع القسم
          }
        }
        // حذف الأقسام المحذوفة
        for (const sid of deletedSectionIds) {
          try {
            await fetch(`/api/admin/courses/${savedCourseId}/sections/${sid}`, {
              method: 'DELETE',
            });
          } catch {
            // تجاهل أخطاء الحذف
          }
        }
      }

      // 3. حفظ الأقسام والدروس
      if (savedCourseId) {
        for (let si = 0; si < form.sections.length; si++) {
          const section = form.sections[si];
          let sectionId = section.id;

          if (sectionId) {
            // تحديث القسم
            const res = await fetch(`/api/admin/courses/${savedCourseId}/sections/${sectionId}`, {
              method: 'PATCH',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: section.title, sortOrder: si }),
            });
            if (!res.ok) {
              const data = await res.json().catch(() => ({}));
              errors.push(`فشل تحديث القسم "${section.title}": ${data.error || res.statusText}`);
            }
          } else {
            if (!section.title.trim()) {
              errors.push(`القسم ${si + 1} بدون عنوان`);
              continue;
            }
            // إنشاء القسم
            const res = await fetch(`/api/admin/courses/${savedCourseId}/sections`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ title: section.title, sortOrder: si }),
            });
            if (res.ok) {
              const data = await res.json();
              sectionId = data.section.id;
            } else {
              const data = await res.json().catch(() => ({}));
              errors.push(`فشل إنشاء القسم "${section.title}": ${data.error || res.statusText}`);
            }
          }

          if (!sectionId) continue;

          // حفظ الدروس
          for (let li = 0; li < section.lessons.length; li++) {
            const lesson = section.lessons[li];
            if (lesson.id) {
              const res = await fetch(`/api/admin/courses/${savedCourseId}/sections/${sectionId}/lessons/${lesson.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: lesson.title,
                  description: lesson.description || undefined,
                  videoUrl: lesson.videoUrl,
                  duration: lesson.duration,
                  sortOrder: li,
                  isFree: lesson.isFree,
                }),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                errors.push(`فشل تحديث الدرس "${lesson.title}": ${data.error || res.statusText}`);
              }
            } else {
              if (!lesson.title || !lesson.videoUrl) {
                errors.push(`الدرس ${li + 1} في القسم "${section.title}" غير مكتمل (يجب إضافة عنوان وفيديو)`);
                continue;
              }
              const res = await fetch(`/api/admin/courses/${savedCourseId}/sections/${sectionId}/lessons`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                  title: lesson.title,
                  description: lesson.description || undefined,
                  videoUrl: lesson.videoUrl,
                  duration: lesson.duration,
                  sortOrder: li,
                  isFree: lesson.isFree,
                }),
              });
              if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                errors.push(`فشل إنشاء الدرس "${lesson.title}": ${data.error || res.statusText}`);
              }
            }
          }
        }
      }

      if (errors.length > 0) {
        setError(errors.join('\n'));
        setSaving(false);
        return;
      }

      router.push('/admin/courses');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  // ---------- Render ----------

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full font-dubai">
        <div className="flex flex-col items-center gap-4">
          <div
            className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center"
            style={{ boxShadow: SHADOWS.icon }}
          >
            <Loader2 className="w-7 h-7 text-primary animate-spin" />
          </div>
          <p className="text-sm text-secondary/50 font-dubai">
            {isRTL ? 'جاري التحميل...' : 'Loading...'}
          </p>
        </div>
      </div>
    );
  }

  const BackIcon = isRTL ? ArrowRight : ArrowLeft;
  const totalLessons = form.sections.reduce((sum, s) => sum + s.lessons.length, 0);

  return (
    <div className="h-full flex flex-col overflow-hidden font-dubai">
      {/* ─── Header ─── */}
      <div className="flex-none px-4 lg:px-6 py-3.5 border-b-2 border-primary/15 bg-white/80 backdrop-blur-sm">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <button
              onClick={() => router.push('/admin/courses')}
              className="w-10 h-10 rounded-xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center hover:bg-primary/20 transition-colors"
              style={{ boxShadow: SHADOWS.icon }}
            >
              <BackIcon className="w-4 h-4 text-secondary" />
            </button>
            <div>
              <h1 className="text-base lg:text-lg font-bold text-secondary font-dubai">
                {isEdit ? et.editTitle : et.createTitle}
              </h1>
              <p className="text-[11px] text-secondary/50 font-dubai hidden sm:block">
                {isRTL
                  ? isEdit ? 'تعديل بيانات ومحتوى الدورة' : 'أنشئ دورة جديدة وأضف الأقسام والدروس'
                  : isEdit ? 'Edit course details and content' : 'Create a new course with sections and lessons'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/admin/courses')}
              className="px-3 lg:px-4 py-2.5 rounded-xl text-sm text-secondary/60 hover:bg-primary/10 border-2 border-transparent hover:border-primary/15 transition-all font-dubai"
            >
              {et.cancel}
            </button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 px-4 lg:px-5 py-2.5 rounded-xl bg-secondary text-white text-sm font-bold font-dubai hover:bg-secondary/90 transition-colors disabled:opacity-50 border-2 border-secondary"
              style={{ boxShadow: SHADOWS.button }}
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              <span className="hidden sm:inline">{saving ? et.saving : et.save}</span>
            </motion.button>
          </div>
        </div>

        {/* Error Banner */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="mt-3 flex items-start gap-2.5 px-4 py-3 rounded-xl bg-red-50 border-2 border-red-200 text-red-600 text-sm font-dubai">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <div className="whitespace-pre-line flex-1">{error}</div>
                <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ─── Two-Panel Body ─── */}
      <div className="flex-1 overflow-y-auto lg:overflow-hidden" style={{ backgroundColor: '#fffffe' }}>
        <div className="lg:h-full flex flex-col lg:flex-row">

          {/* ═══ Right Panel: Form Inputs ═══ */}
          <div className="lg:w-[45%] lg:overflow-y-auto p-4 lg:p-5 space-y-4 lg:border-e-2 border-primary/10">

            {/* Card 1: Basic Info */}
            <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden" style={{ boxShadow: SHADOWS.card }}>
              <div className="px-4 lg:px-5 py-3 border-b border-primary/10 bg-primary/5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <BookOpen className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">{et.basicInfo}</h3>
              </div>
              <div className="p-4 lg:p-5 space-y-4">
                <div>
                  <label className="block text-xs font-bold text-secondary/60 mb-1.5 font-dubai">{et.courseTitle}</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => updateForm({ title: e.target.value })}
                    placeholder={et.courseTitlePlaceholder}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/15 bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 text-sm text-secondary font-dubai placeholder:text-secondary/30 transition-all"
                    style={{ boxShadow: SHADOWS.input }}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-secondary/60 mb-1.5 font-dubai">{et.description}</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => updateForm({ description: e.target.value })}
                    placeholder={et.descriptionPlaceholder}
                    rows={3}
                    className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/15 bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 text-sm text-secondary font-dubai placeholder:text-secondary/30 resize-none transition-all"
                    style={{ boxShadow: SHADOWS.input }}
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-secondary/60 mb-1.5 font-dubai">{et.courseLevel}</label>
                    <select
                      value={form.level}
                      onChange={(e) => updateForm({ level: e.target.value as CourseLevel })}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/15 bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 text-sm text-secondary font-dubai transition-all"
                      style={{ boxShadow: SHADOWS.input }}
                    >
                      {LEVEL_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {isRTL ? opt.label_ar : opt.label_en}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-secondary/60 mb-1.5 font-dubai">{et.instructorName}</label>
                    <input
                      type="text"
                      value={form.shortDescription}
                      onChange={(e) => updateForm({ shortDescription: e.target.value })}
                      placeholder={et.instructorNamePlaceholder}
                      className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/15 bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 text-sm text-secondary font-dubai placeholder:text-secondary/30 transition-all"
                      style={{ boxShadow: SHADOWS.input }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Pricing */}
            <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden" style={{ boxShadow: SHADOWS.card }}>
              <div className="px-4 lg:px-5 py-3 border-b border-primary/10 bg-primary/5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <DollarSign className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">{et.pricing}</h3>
              </div>
              <div className="p-4 lg:p-5 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => updateForm({ price: 0 })}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                      form.price === 0
                        ? 'border-emerald-400 bg-emerald-50/80'
                        : 'border-primary/15 bg-white hover:border-primary/30'
                    }`}
                    style={{ boxShadow: form.price === 0 ? '0 2px 12px rgba(52, 211, 153, 0.15)' : 'none' }}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      form.price === 0 ? 'bg-emerald-100 text-emerald-600' : 'bg-primary/10 text-secondary/40'
                    }`}>
                      <Gift className="w-4 h-4" />
                    </div>
                    <div className="text-start min-w-0">
                      <p className={`text-xs font-bold font-dubai ${form.price === 0 ? 'text-emerald-700' : 'text-secondary/60'}`}>{et.freeCourse}</p>
                      <p className="text-[10px] text-secondary/40 font-dubai truncate">{et.freeCourseHint}</p>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (form.price === 0) updateForm({ price: 100 }); }}
                    className={`relative flex items-center gap-2.5 p-3 rounded-xl border-2 transition-all ${
                      form.price > 0
                        ? 'border-primary bg-primary/5'
                        : 'border-primary/15 bg-white hover:border-primary/30'
                    }`}
                    style={{ boxShadow: form.price > 0 ? SHADOWS.input : 'none' }}
                  >
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      form.price > 0 ? 'bg-primary/20 text-secondary' : 'bg-primary/10 text-secondary/40'
                    }`}>
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <div className="text-start min-w-0">
                      <p className={`text-xs font-bold font-dubai ${form.price > 0 ? 'text-secondary' : 'text-secondary/60'}`}>{et.paidCourse}</p>
                      <p className="text-[10px] text-secondary/40 font-dubai truncate">{et.paidCourseHint}</p>
                    </div>
                  </button>
                </div>

                <AnimatePresence>
                  {form.price > 0 && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden"
                    >
                      <div className="pt-1">
                        <label className="block text-xs font-bold text-secondary/60 mb-1.5 font-dubai">{et.coursePrice}</label>
                        <div className="relative">
                          <input
                            type="number"
                            min={1}
                            value={form.price}
                            onChange={(e) => updateForm({ price: Math.max(1, Number(e.target.value) || 0) })}
                            placeholder={et.coursePricePlaceholder}
                            className="w-full px-4 py-2.5 rounded-xl border-2 border-primary/15 bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 text-sm text-secondary font-dubai placeholder:text-secondary/30 transition-all"
                            style={{ boxShadow: SHADOWS.input }}
                          />
                          <span className="absolute top-1/2 -translate-y-1/2 text-xs text-secondary/40 font-dubai ltr:right-4 rtl:left-4">
                            {isRTL ? 'ج.م' : 'EGP'}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Card 3: Media */}
            <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden" style={{ boxShadow: SHADOWS.card }}>
              <div className="px-4 lg:px-5 py-3 border-b border-primary/10 bg-primary/5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <ImageIcon className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">{et.media}</h3>
              </div>
              <div className="p-4 lg:p-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                <VideoUploadZone
                  type="thumbnail"
                  currentUrl={form.thumbnailUrl || null}
                  courseId={courseId}
                  onUploadComplete={(url) => updateForm({ thumbnailUrl: url })}
                  onRemove={() => updateForm({ thumbnailUrl: '' })}
                  label={et.thumbnail}
                />
                <VideoUploadZone
                  type="video"
                  currentUrl={form.previewVideoUrl || null}
                  courseId={courseId}
                  onUploadComplete={(url) => updateForm({ previewVideoUrl: url })}
                  onRemove={() => updateForm({ previewVideoUrl: '' })}
                  label={et.previewVideo}
                />
              </div>
            </div>

            {/* Card 4: Features */}
            <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden" style={{ boxShadow: SHADOWS.card }}>
              <div className="px-4 lg:px-5 py-3 border-b border-primary/10 bg-primary/5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                  <Star className="w-4 h-4 text-primary" />
                </div>
                <h3 className="text-sm font-bold text-secondary font-dubai">{et.features}</h3>
              </div>
              <div className="p-4 lg:p-5 space-y-2">
                {form.features.map((feature, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <span className="flex-1 px-3 py-2 rounded-xl bg-primary/5 text-sm text-secondary font-dubai border border-primary/10">
                      {feature}
                    </span>
                    <button
                      onClick={() => removeFeature(i)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newFeature}
                    onChange={(e) => setNewFeature(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                    placeholder={et.featurePlaceholder}
                    className="flex-1 px-3 py-2.5 rounded-xl border-2 border-primary/15 bg-white focus:outline-none focus:border-primary/40 focus:ring-2 focus:ring-primary/15 text-sm text-secondary font-dubai placeholder:text-secondary/30 transition-all"
                  />
                  <button
                    onClick={addFeature}
                    className="px-3 py-2.5 rounded-xl bg-primary/15 border-2 border-primary/20 text-secondary text-sm font-bold font-dubai hover:bg-primary/25 transition-colors"
                  >
                    {et.addFeature}
                  </button>
                </div>
              </div>
            </div>

          </div>

          {/* ═══ Left Panel: Course Sections & Lessons ═══ */}
          <div className="lg:w-[55%] lg:overflow-y-auto p-4 lg:p-5">
            <div className="bg-white border-2 border-primary/20 rounded-2xl overflow-hidden h-fit" style={{ boxShadow: SHADOWS.card }}>
              <div className="px-4 lg:px-5 py-3 border-b border-primary/10 bg-primary/5 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center">
                    <Film className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-secondary font-dubai">{et.sections}</h3>
                    <p className="text-[10px] text-secondary/40 font-dubai">
                      {form.sections.length} {form.sections.length === 1 ? (isRTL ? 'قسم' : 'section') : (isRTL ? 'أقسام' : 'sections')} • {totalLessons} {totalLessons === 1 ? ct.lesson : ct.lessons}
                    </p>
                  </div>
                </div>
                <button
                  onClick={addSection}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-secondary text-white text-xs font-bold font-dubai hover:bg-secondary/90 transition-colors border-2 border-secondary"
                  style={{ boxShadow: SHADOWS.button }}
                >
                  <Plus className="w-3.5 h-3.5" />
                  {et.addSection}
                </button>
              </div>

              {form.sections.length === 0 ? (
                <div className="text-center py-16 px-6">
                  <div
                    className="w-14 h-14 rounded-2xl bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4"
                    style={{ boxShadow: SHADOWS.icon }}
                  >
                    <Film className="w-7 h-7 text-primary/40" />
                  </div>
                  <p className="text-sm text-secondary/40 font-dubai mb-1">{et.noSections}</p>
                  <p className="text-xs text-secondary/30 font-dubai">
                    {isRTL ? 'أضف أقسام ودروس لبناء محتوى الدورة' : 'Add sections and lessons to build course content'}
                  </p>
                </div>
              ) : (
                <div className="p-3 lg:p-4 space-y-3">
                  <AnimatePresence mode="popLayout">
                    {form.sections.map((section, sIndex) => (
                      <motion.div
                        key={section.id || `new-${sIndex}`}
                        layout
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="bg-white border-2 border-primary/15 rounded-xl overflow-hidden"
                        style={{ boxShadow: 'rgba(237, 191, 140, 0.08) 0px 2px 10px' }}
                      >
                        {/* Section Header */}
                        <div
                          className="flex items-center gap-2.5 px-3 lg:px-4 py-3 bg-gradient-to-l from-primary/5 to-transparent cursor-pointer select-none hover:from-primary/10 transition-all"
                          onClick={() => toggleSection(sIndex)}
                        >
                          <GripVertical className="w-4 h-4 text-secondary/25 flex-shrink-0" />
                          <div className="w-7 h-7 rounded-lg bg-secondary/8 flex items-center justify-center flex-shrink-0">
                            <span className="text-xs font-bold text-secondary/50 font-dubai">{sIndex + 1}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <input
                              type="text"
                              value={section.title}
                              onChange={(e) => updateSection(sIndex, { title: e.target.value })}
                              onClick={(e) => e.stopPropagation()}
                              placeholder={et.sectionTitlePlaceholder}
                              className="w-full bg-transparent text-sm font-bold text-secondary font-dubai placeholder:text-secondary/30 focus:outline-none"
                            />
                          </div>
                          <span className="text-[10px] text-secondary/40 flex-shrink-0 font-dubai bg-primary/8 px-2 py-1 rounded-lg">
                            {section.lessons.length} {section.lessons.length === 1 ? ct.lesson : ct.lessons}
                          </span>
                          <button
                            onClick={(e) => { e.stopPropagation(); removeSection(sIndex); }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors flex-shrink-0"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                          <div className="w-7 h-7 rounded-lg flex items-center justify-center text-secondary/40 flex-shrink-0">
                            {section.isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                          </div>
                        </div>

                        {/* Lessons */}
                        <AnimatePresence>
                          {section.isExpanded && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="px-3 lg:px-4 pb-4 pt-2 space-y-3 border-t border-primary/8">
                                {section.lessons.length === 0 ? (
                                  <p className="text-center text-xs text-secondary/30 py-6 font-dubai">
                                    {et.noLessons}
                                  </p>
                                ) : (
                                  section.lessons.map((lesson, lIndex) => (
                                    <div
                                      key={lesson.id || `new-${sIndex}-${lIndex}`}
                                      className="border-2 border-primary/10 rounded-xl p-3 space-y-3 bg-accent/20 hover:border-primary/20 transition-colors"
                                    >
                                      <div className="flex items-start gap-2">
                                        <GripVertical className="w-4 h-4 text-secondary/20 mt-2.5 flex-shrink-0" />
                                        <div className="flex-1 space-y-3 min-w-0">
                                          {/* Lesson title */}
                                          <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-md bg-primary/10 flex items-center justify-center flex-shrink-0">
                                              <Film className="w-3 h-3 text-primary/60" />
                                            </div>
                                            <input
                                              type="text"
                                              value={lesson.title}
                                              onChange={(e) => updateLesson(sIndex, lIndex, { title: e.target.value })}
                                              placeholder={et.lessonTitlePlaceholder}
                                              className="flex-1 min-w-0 px-3 py-2 rounded-lg border-2 border-primary/10 bg-white focus:outline-none focus:border-primary/30 focus:ring-1 focus:ring-primary/15 text-sm text-secondary font-dubai placeholder:text-secondary/30 transition-all"
                                            />
                                          </div>

                                          {/* Video upload */}
                                          <VideoUploadZone
                                            type="video"
                                            currentUrl={lesson.videoUrl || null}
                                            courseId={courseId}
                                            onUploadComplete={(url) => {
                                              updateLesson(sIndex, lIndex, { videoUrl: url });
                                              // استخراج المدة تلقائياً
                                              getVideoDuration(url).then(duration => {
                                                if (duration > 0) updateLesson(sIndex, lIndex, { duration });
                                              });
                                            }}
                                            onRemove={() => updateLesson(sIndex, lIndex, { videoUrl: '', duration: 0 })}
                                            label={et.lessonVideo}
                                          />

                                          {/* Meta: Duration + Free toggle */}
                                          <div className="flex items-center justify-between flex-wrap gap-2">
                                            {lesson.duration > 0 && (
                                              <span className="text-[11px] text-secondary/40 flex items-center gap-1 font-dubai bg-primary/5 px-2 py-1 rounded-lg">
                                                <Film className="w-3 h-3" />
                                                {Math.floor(lesson.duration / 60)}:{String(lesson.duration % 60).padStart(2, '0')} {isRTL ? 'دقيقة' : 'min'}
                                              </span>
                                            )}
                                            <label className="flex items-center gap-2 cursor-pointer select-none">
                                              <input
                                                type="checkbox"
                                                checked={lesson.isFree}
                                                onChange={(e) => updateLesson(sIndex, lIndex, { isFree: e.target.checked })}
                                                className="w-4 h-4 rounded border-primary/20 text-primary focus:ring-primary/30 accent-primary"
                                              />
                                              <span className="text-[11px] text-secondary/50 font-dubai">
                                                {isRTL ? 'درس مجاني (معاينة)' : 'Free preview lesson'}
                                              </span>
                                            </label>
                                          </div>
                                        </div>
                                        <button
                                          onClick={() => removeLesson(sIndex, lIndex)}
                                          className="w-7 h-7 rounded-lg flex items-center justify-center text-red-400 hover:bg-red-50 transition-colors mt-1 flex-shrink-0"
                                        >
                                          <Trash2 className="w-3.5 h-3.5" />
                                        </button>
                                      </div>
                                    </div>
                                  ))
                                )}

                                {/* Add lesson button */}
                                <button
                                  onClick={() => addLesson(sIndex)}
                                  className="w-full py-2.5 rounded-xl border-2 border-dashed border-primary/15 text-xs text-secondary/40 font-dubai font-bold hover:border-primary/30 hover:text-secondary/60 hover:bg-primary/5 transition-all flex items-center justify-center gap-1.5"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  {et.addLesson}
                                </button>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Bottom padding */}
            <div className="h-6 lg:h-4" />
          </div>

        </div>
      </div>
    </div>
  );
}
