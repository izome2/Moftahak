'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Inbox, Search, AlertCircle, FileX } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/hooks/useTranslation';

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

const PRESET_ICONS: Record<EmptyPreset, React.ElementType> = {
  'no-data': Inbox,
  'no-results': Search,
  error: AlertCircle,
  'no-file': FileX,
};

export default function EmptyState({
  title,
  description,
  icon,
  preset = 'no-data',
  action,
  className,
}: EmptyStateProps) {
  const t = useTranslation();
  const presetKey = preset === 'no-file' ? 'noFiles' : preset === 'no-data' ? 'noData' : preset === 'no-results' ? 'noResults' : 'error';
  const presetDescKey = preset === 'no-file' ? 'noFilesDesc' : preset === 'no-data' ? 'noDataDesc' : preset === 'no-results' ? 'noResultsDesc' : 'errorDesc';
  const Icon = icon || PRESET_ICONS[preset];
  const displayTitle = title || t.accounting.shared.emptyState[presetKey];
  const displayDesc = description || t.accounting.shared.emptyState[presetDescKey];

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
      <p className="text-sm text-secondary/75 font-dubai max-w-xs mb-4">
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
