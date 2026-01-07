'use client';

import React from 'react';
import { DragOverlay as DndKitDragOverlay } from '@dnd-kit/core';
import { motion } from 'framer-motion';
import type { DraggableData } from '@/hooks/useDragAndDrop';

interface DragOverlayProps {
  activeItem: { id: string; data: DraggableData } | null;
  children?: React.ReactNode;
}

const DragOverlay: React.FC<DragOverlayProps> = ({ activeItem, children }) => {
  return (
    <DndKitDragOverlay dropAnimation={{
      duration: 200,
      easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
    }}>
      {activeItem ? (
        children || <DefaultOverlayContent data={activeItem.data} />
      ) : null}
    </DndKitDragOverlay>
  );
};

// محتوى افتراضي للـ overlay
interface DefaultOverlayContentProps {
  data: DraggableData;
}

const DefaultOverlayContent: React.FC<DefaultOverlayContentProps> = ({ data }) => {
  return (
    <motion.div
      initial={{ scale: 1, rotate: 0 }}
      animate={{ scale: 1.05, rotate: 2 }}
      className="bg-white border-2 border-primary shadow-2xl p-3 min-w-37.5 cursor-grabbing"
      style={{
        transform: 'rotate(3deg)',
      }}
      dir="rtl"
    >
      <div className="flex items-center gap-3">
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

      {/* شارة السحب */}
      <div className="absolute -top-2 -right-2 w-6 h-6 bg-primary text-secondary flex items-center justify-center text-xs font-bold shadow-md">
        ↗
      </div>
    </motion.div>
  );
};

export default DragOverlay;
