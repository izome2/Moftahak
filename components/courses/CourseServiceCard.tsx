'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft, Clock, BookOpen, Star, Users } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Badge from '@/components/ui/Badge';
import UserIcon from '@/components/ui/UserIcon';
import CourseDefaultThumbnail from './CourseDefaultThumbnail';
import { formatDuration, formatDurationEn } from '@/lib/courses/utils';
import { getAirbnbCourseLandingHref } from '@/lib/courses/airbnb-landing';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

interface CourseCardData {
  id: string;
  title: string;
  slug: string;
  shortDescription: string | null;
  price: number;
  currency: string;
  thumbnailUrl: string | null;
  level: string;
  totalDuration: number;
  lessonsCount: number;
  enrollmentsCount: number;
  reviewsCount: number;
  averageRating: number;
}

interface CourseServiceCardProps {
  course: CourseCardData;
  index: number;
  gyroData: {
    rotateX: number;
    rotateY: number;
    isSupported: boolean;
  };
}

const CourseServiceCard: React.FC<CourseServiceCardProps> = ({ course, index, gyroData }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const { language } = useLanguage();
  const t = useTranslation();

  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);

  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    if (isMobile && gyroData.isSupported) {
      rotateX.set(gyroData.rotateX);
      rotateY.set(gyroData.rotateY);
    }
  }, [gyroData.rotateX, gyroData.rotateY, isMobile, gyroData.isSupported, rotateX, rotateY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rotateX.set(-((y - centerY) / centerY) * 3);
    rotateY.set(((x - centerX) / centerX) * 3);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isMobile) return;
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    rotateX.set(-((y - centerY) / centerY) * 8);
    rotateY.set(((x - centerX) / centerX) * 8);
  };

  const handleTouchEnd = () => {
    if (isMobile && !gyroData.isSupported) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  const levelLabels: Record<string, string> = {
    BEGINNER: t.courses.beginner,
    INTERMEDIATE: t.courses.intermediate,
    ADVANCED: t.courses.advanced,
  };

  const formattedPrice = course.price === 0
    ? t.courses.free
    : language === 'ar'
    ? `${new Intl.NumberFormat('ar-EG').format(course.price)} جنيه`
    : `${new Intl.NumberFormat('en-US').format(course.price)} EGP`;

  const durationText = language === 'ar'
    ? formatDuration(course.totalDuration)
    : formatDurationEn(course.totalDuration);
  const courseHref = getAirbnbCourseLandingHref(course);

  const cardVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number],
      },
    },
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariant}
      whileHover={{ y: -10 }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
        perspective: '1000px',
      }}
      transition={{ y: { duration: 0.3, ease: [0.4, 0, 0.2, 1] } }}
      className="group bg-[#ead3b9]/30 rounded-2xl overflow-visible shadow-lg hover:shadow-2xl transition-shadow duration-300 relative border border-[#ead3b9]"
    >
      {/* Image */}
      <div className="relative h-72 overflow-hidden rounded-xl m-3" style={{ transform: 'translateZ(20px)' }}>
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          {course.thumbnailUrl ? (
            <Image
              src={course.thumbnailUrl}
              alt={course.title}
              fill
              className="object-cover rounded-xl"
            />
          ) : (
            <CourseDefaultThumbnail title={course.title} className="rounded-xl" />
          )}
        </motion.div>

        {/* Level Badge */}
        <motion.div
          className="absolute top-4 right-4 z-10"
          style={{ transform: 'translateZ(40px)' }}
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
        >
          <Badge variant="primary" size="md">
            {levelLabels[course.level] || course.level}
          </Badge>
        </motion.div>

        {/* Rating Badge */}
        {course.averageRating > 0 && (
          <motion.div
            className="absolute top-4 left-4 z-10"
            style={{ transform: 'translateZ(40px)' }}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.4, type: 'spring' }}
          >
            <div className="flex items-center gap-1 bg-white/90 backdrop-blur-sm rounded-lg px-2.5 py-1 shadow-md">
              <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
              <span className="text-xs font-bold text-secondary">{course.averageRating}</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Enrollments Count Badge */}
      {course.enrollmentsCount > 0 && (
        <div className="absolute right-6 z-50 pointer-events-none" style={{ top: 'calc(18rem - 1rem)', transform: 'translateZ(40px)' }}>
          <motion.div
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="pointer-events-auto"
          >
            <div className="flex items-center gap-2 bg-[#ead3b9]/95 backdrop-blur-sm rounded-full px-5 py-2 shadow-xl border border-[#edbf8c]">
              <div className="flex items-center -space-x-2">
                {['gold', 'green', 'beige', 'teal'].slice(0, Math.min(course.enrollmentsCount, 4)).map((variant, i) => (
                  <motion.div
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: index * 0.1 + 0.5 + i * 0.05 }}
                  >
                    <UserIcon variant={variant as 'gold' | 'green' | 'beige' | 'teal'} size="md" className="border-white" />
                  </motion.div>
                ))}
              </div>
              <span className="text-sm font-bold text-secondary mr-1">
                {course.enrollmentsCount}+ {t.services.student}
              </span>
            </div>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 pt-10" style={{ transform: 'translateZ(30px)' }}>
        <motion.h3
          className="text-xl font-bold text-secondary mb-3 line-clamp-2"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.6 }}
        >
          {course.title}
        </motion.h3>

        {course.shortDescription && (
          <motion.p
            className="text-secondary/70 leading-relaxed mb-4 line-clamp-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.7 }}
          >
            {course.shortDescription}
          </motion.p>
        )}

        {/* Info Icons */}
        <motion.div
          className="flex items-center gap-4 mb-5 text-secondary/60 text-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.75 }}
        >
          <span className="flex items-center gap-1">
            <BookOpen className="w-4 h-4" />
            {course.lessonsCount} {t.courses.lessons}
          </span>
          <span className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {durationText}
          </span>
          {course.enrollmentsCount > 0 && (
            <span className="flex items-center gap-1">
              <Users className="w-4 h-4" />
              {course.enrollmentsCount}
            </span>
          )}
        </motion.div>

        {/* Price + Button */}
        <motion.div
          className="flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.8 }}
          style={{ transform: 'translateZ(40px)' }}
        >
          <span className="text-2xl font-bold text-secondary font-bristone">
            {formattedPrice}
          </span>
          <Link href={courseHref}>
            <motion.span
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-linear-to-tl from-[#e5b483] to-[#edc49f] rounded-lg shadow-[0_0_15px_rgba(180,130,80,0.25)] relative overflow-hidden cursor-pointer"
              whileHover={{
                scale: 1.05,
                boxShadow: '0 0 20px rgba(180,130,80,0.35)',
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">{t.services.viewCourse}</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowLeft size={16} className="relative z-10" />
              </motion.span>
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(CourseServiceCard);
