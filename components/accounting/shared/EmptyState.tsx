'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Search, AlertCircle, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// EmptyState - حالة عدم وجود بيانات
// ============================================================================

type EmptyPreset = 'no-data' | 'no-results' | 'error' | 'no-file';

interface EmptyStateProps {
  /** عنوان رئيسي */
  title?: string;
  /** وصف تفصيلي */
  description?: string;
  /** أيقونة مخصصة */
  icon?: React.ElementType;
  /** preset جاهز */
  preset?: EmptyPreset;
  /** زر إجراء */
  action?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

const PRESETS: Record<EmptyPreset, { icon: React.ElementType; title: string; description: string }> = {
  'no-data': {
    icon: Inbox,
    title: 'لا توجد بيانات',
    description: 'لم يتم إضافة أي سجلات بعد.',
  },
  'no-results': {
    icon: Search,
    title: 'لا توجد نتائج',
    description: 'جرّب تغيير عوامل التصفية أو البحث بكلمات مختلفة.',
  },
  error: {
    icon: AlertCircle,
    title: 'حدث خطأ',
    description: 'لم نتمكن من تحميل البيانات. حاول مرة أخرى.',
  },
  'no-file': {
    icon: FileX,
    title: 'لا توجد ملفات',
    description: 'لم يتم رفع أي ملفات بعد.',
  },
};

export default function EmptyState({
  title,
  description,
  icon,
  preset = 'no-data',
  action,
  className,
}: EmptyStateProps) {
  const presetConfig = PRESETS[preset];
  const Icon = icon || presetConfig.icon;
  const displayTitle = title || presetConfig.title;
  const displayDesc = description || presetConfig.description;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
      className={cn(
        'flex flex-col items-center justify-center py-12 px-6 text-center',
        className,
      )}
    >
      <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-primary/60" />
      </div>
      <h3 className="text-lg font-bold text-secondary font-dubai mb-1.5">
        {displayTitle}
      </h3>
      <p className="text-sm text-secondary/50 font-dubai max-w-xs mb-4">
        {displayDesc}
      </p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-5 py-2 bg-secondary text-white rounded-xl text-sm font-dubai hover:bg-secondary/90 transition-colors"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  );
}
