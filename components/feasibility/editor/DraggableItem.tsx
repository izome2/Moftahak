'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { motion } from 'framer-motion';
import { GripVertical } from 'lucide-react';
import type { DraggableData } from '@/hooks/useDragAndDrop';

interface DraggableItemProps {
  id: string;
  data: DraggableData;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  showHandle?: boolean;
}

const DraggableItem: React.FC<DraggableItemProps> = ({
  id,
  data,
  children,
  className = '',
  disabled = false,
  showHandle = true,
}) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id,
    data,
    disabled,
  });

  // تحويل CSS للموضع
  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : disabled ? 'not-allowed' : 'grab',
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      className={`
        relative select-none
        ${isDragging ? 'z-50 shadow-xl' : 'z-10'}
        ${disabled ? 'opacity-50' : ''}
        ${className}
      `}
      whileHover={!disabled ? { scale: 1.02 } : undefined}
      whileTap={!disabled ? { scale: 0.98 } : undefined}
      {...attributes}
      {...(showHandle ? {} : listeners)}
    >
      {/* مقبض السحب */}
      {showHandle && !disabled && (
        <div
          className="absolute right-0 top-0 bottom-0 w-8 flex items-center justify-center cursor-grab active:cursor-grabbing bg-secondary/5 hover:bg-secondary/10 transition-colors"
          {...listeners}
        >
          <GripVertical className="w-4 h-4 text-secondary/40" />
        </div>
      )}

      {/* المحتوى */}
      <div className={showHandle ? 'pr-8' : ''}>
        {children || (
          <DefaultItemContent data={data} />
        )}
      </div>

      {/* مؤشر السحب النشط */}
      {isDragging && (
        <div className="absolute inset-0 border-2 border-primary bg-primary/10 pointer-events-none" />
      )}
    </motion.div>
  );
};

// محتوى افتراضي للعنصر
interface DefaultItemContentProps {
  data: DraggableData;
}

const DefaultItemContent: React.FC<DefaultItemContentProps> = ({ data }) => {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-accent hover:border-primary/30 transition-colors" dir="rtl">
      {/* الأيقونة */}
      {data.icon && (
        <span className="text-2xl">{data.icon}</span>
      )}
      
      {/* المعلومات */}
      <div className="flex-1 min-w-0">
        <div className="font-dubai font-medium text-secondary truncate">
          {data.name}
        </div>
        {data.price !== undefined && (
          <div className="text-xs text-secondary/60 font-dubai">
            {data.price.toLocaleString('ar-EG')} ج.م
          </div>
        )}
      </div>
    </div>
  );
};

export default DraggableItem;
