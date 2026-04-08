'use client';

import React from 'react';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { 
  PlayCircle, 
  Clock, 
  Users, 
  Star, 
  MoreVertical,
  Edit3,
  Trash2,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
} from 'lucide-react';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';
import { formatDuration, formatDurationEn, formatCoursePrice } from '@/lib/courses/utils';

interface CourseCardProps {
  course: {
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
  };
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onTogglePublish: (id: string, isPublished: boolean) => void;
}

const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  popup: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
};

const levelColors = {
  BEGINNER: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  INTERMEDIATE: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  ADVANCED: { bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
};

export default function CourseCard({ course, onEdit, onDelete, onTogglePublish }: CourseCardProps) {
  const t = useTranslation();
  const { isRTL } = useLanguage();
  const [showMenu, setShowMenu] = React.useState(false);
  const menuRef = React.useRef<HTMLDivElement>(null);

  const ct = t.admin.coursesPage;
  const et = ct.editor;
  const levelConfig = levelColors[course.level];
  const durationText = isRTL ? formatDuration(course.totalDuration) : formatDurationEn(course.totalDuration);
  const levelText = ct.courseLevel[course.level];

  // إغلاق القائمة عند النقر خارجها
  React.useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    if (showMenu) document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showMenu]);

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      whileHover={{ y: -4 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className="relative bg-white rounded-2xl border-2 border-primary/20 overflow-hidden group"
      style={{ boxShadow: SHADOWS.card }}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOWS.cardHover; }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.boxShadow = SHADOWS.card; }}
    >
      {/* الصورة المصغرة */}
      <div className="relative aspect-video bg-gradient-to-br from-primary/20 to-accent/30 overflow-hidden">
        {course.thumbnailUrl ? (
          <Image
            src={course.thumbnailUrl}
            alt={course.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <PlayCircle className="w-12 h-12 text-primary/40" />
          </div>
        )}

        {/* شارة الحالة */}
        <div className={`absolute top-3 ${isRTL ? 'right-3' : 'left-3'}`}>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium backdrop-blur-sm ${
            course.isPublished 
              ? 'bg-emerald-500/90 text-white' 
              : 'bg-gray-500/90 text-white'
          }`}>
            {course.isPublished ? ct.published : ct.draft}
          </span>
        </div>

        {/* شارة المستوى */}
        <div className={`absolute top-3 ${isRTL ? 'left-3' : 'right-3'}`}>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${levelConfig.bg} ${levelConfig.text} ${levelConfig.border}`}>
            {levelText}
          </span>
        </div>

        {/* شارة السعر */}
        <div className={`absolute bottom-3 ${isRTL ? 'right-3' : 'left-3'}`}>
          <span className="px-3 py-1.5 rounded-xl text-sm font-bold bg-secondary/90 text-white backdrop-blur-sm">
            {course.price === 0 ? ct.free : `${formatCoursePrice(course.price)} ${isRTL ? 'ج.م' : 'EGP'}`}
          </span>
        </div>

        {/* زر القائمة */}
        <div className={`absolute bottom-3 ${isRTL ? 'left-3' : 'right-3'}`} ref={menuRef}>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-secondary" />
          </button>

          {/* القائمة المنسدلة */}
          {showMenu && (
            <>
              <div 
                className="fixed inset-0 z-10"
                onClick={() => setShowMenu(false)}
              />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className={`absolute bottom-10 ${isRTL ? 'left-0' : 'right-0'} bg-white rounded-2xl border-2 border-primary/20 overflow-hidden z-20 min-w-[160px] py-2`}
                style={{ boxShadow: SHADOWS.popup }}
              >
                <button
                  onClick={() => { onEdit(course.id); setShowMenu(false); }}
                  className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-secondary hover:bg-primary/10 transition-colors font-dubai"
                >
                  <Edit3 className="w-4 h-4" />
                  {ct.editCourse}
                </button>
                <button
                  onClick={() => { onTogglePublish(course.id, course.isPublished); setShowMenu(false); }}
                  className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-secondary hover:bg-primary/10 transition-colors font-dubai"
                >
                  {course.isPublished ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  {course.isPublished ? ct.unpublishCourse : ct.publishCourse}
                </button>
                <button
                  onClick={() => { onDelete(course.id); setShowMenu(false); }}
                  className="w-[calc(100%-16px)] flex items-center gap-3 px-4 py-2.5 mx-2 rounded-xl text-sm text-red-600 hover:bg-red-50 transition-colors font-dubai"
                >
                  <Trash2 className="w-4 h-4" />
                  {ct.deleteCourse}
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* محتوى البطاقة */}
      <div className="p-4">
        <h3 className="font-bold text-secondary font-dubai text-base line-clamp-2 mb-2 leading-relaxed">
          {course.title}
        </h3>
        {course.shortDescription && (
          <p className="text-secondary/60 font-dubai text-sm line-clamp-2 mb-3">
            {course.shortDescription}
          </p>
        )}

        {/* إحصائيات */}
        <div className="flex items-center gap-3 text-xs text-secondary/50 mb-3 flex-wrap font-dubai">
          <span className="flex items-center gap-1">
            <BookOpen className="w-3.5 h-3.5" />
            {course.lessonsCount} {course.lessonsCount === 1 ? ct.lesson : ct.lessons}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-3.5 h-3.5" />
            {durationText}
          </span>
          {(course.enrollmentsCount ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-3.5 h-3.5" />
              {course.enrollmentsCount} {course.enrollmentsCount === 1 ? ct.student : ct.students}
            </span>
          )}
          {(course.averageRating ?? 0) > 0 && (
            <span className="flex items-center gap-1">
              <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
              {course.averageRating?.toFixed(1)}
            </span>
          )}
        </div>

        {/* زر التعديل الرئيسي */}
        <button
          onClick={() => onEdit(course.id)}
          className="w-full py-2.5 rounded-xl bg-primary/15 hover:bg-primary/25 border border-primary/20 text-secondary text-sm font-dubai font-medium transition-colors flex items-center justify-center gap-2"
        >
          <Edit3 className="w-4 h-4" />
          {ct.editCourse}
        </button>
      </div>
    </motion.div>
  );
}
