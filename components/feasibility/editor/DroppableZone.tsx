'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, MousePointer2 } from 'lucide-react';

interface DroppableZoneProps {
  id: string;
  children?: React.ReactNode;
  className?: string;
  disabled?: boolean;
  acceptTypes?: string[]; // أنواع العناصر المقبولة
  placeholder?: string;
  showPlaceholder?: boolean;
  minHeight?: string;
}

const DroppableZone: React.FC<DroppableZoneProps> = ({
  id,
  children,
  className = '',
  disabled = false,
  acceptTypes,
  placeholder = 'اسحب العناصر إلى هنا',
  showPlaceholder = true,
  minHeight = '120px',
}) => {
  const { isOver, setNodeRef, active } = useDroppable({
    id,
    disabled,
    data: {
      acceptTypes,
    },
  });

  // التحقق من قبول نوع العنصر
  const isAccepted = React.useMemo(() => {
    if (!active || !acceptTypes) return true;
    const activeType = active.data.current?.type;
    return acceptTypes.includes(activeType);
  }, [active, acceptTypes]);

  // حالة الـ hover مع القبول
  const isActiveAndAccepted = isOver && isAccepted;
  const isActiveButRejected = isOver && !isAccepted;

  // التحقق من وجود محتوى
  const hasContent = React.Children.count(children) > 0;

  return (
    <div
      ref={setNodeRef}
      className={`
        relative transition-all duration-200
        ${isActiveAndAccepted ? 'ring-2 ring-primary ring-offset-2 bg-primary/5' : ''}
        ${isActiveButRejected ? 'ring-2 ring-red-400 ring-offset-2 bg-red-50' : ''}
        ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
        ${className}
      `}
      style={{ minHeight }}
      dir="rtl"
    >
      {/* المحتوى */}
      {children}

      {/* Placeholder عند عدم وجود محتوى */}
      <AnimatePresence>
        {showPlaceholder && !hasContent && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={`
              absolute inset-0 flex flex-col items-center justify-center
              border-2 border-dashed transition-colors
              ${isActiveAndAccepted 
                ? 'border-primary bg-primary/5' 
                : isActiveButRejected 
                  ? 'border-red-400 bg-red-50' 
                  : 'border-secondary/20 hover:border-secondary/40'
              }
            `}
          >
            <div className={`
              w-12 h-12 flex items-center justify-center mb-3 transition-colors
              ${isActiveAndAccepted 
                ? 'bg-primary text-secondary' 
                : isActiveButRejected 
                  ? 'bg-red-400 text-white' 
                  : 'bg-accent text-secondary/50'
              }
            `}>
              {isActiveAndAccepted ? (
                <Plus className="w-6 h-6" />
              ) : (
                <MousePointer2 className="w-6 h-6" />
              )}
            </div>
            
            <p className={`
              text-sm font-dubai text-center px-4 transition-colors
              ${isActiveAndAccepted 
                ? 'text-secondary' 
                : isActiveButRejected 
                  ? 'text-red-600' 
                  : 'text-secondary/50'
              }
            `}>
              {isActiveButRejected 
                ? 'هذا النوع غير مقبول هنا' 
                : placeholder
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* تأثير الهوفر عند وجود محتوى */}
      <AnimatePresence>
        {hasContent && isActiveAndAccepted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-primary/10 border-2 border-primary pointer-events-none z-10"
          >
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-secondary px-4 py-2 font-dubai text-sm shadow-lg">
              أفلت هنا للإضافة
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DroppableZone;
