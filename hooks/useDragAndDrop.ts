'use client';

import { useState, useCallback } from 'react';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';

// أنواع العناصر القابلة للسحب
export type DraggableItemType = 
  | 'room-item'      // عنصر غرفة (أثاث، أجهزة)
  | 'slide'          // شريحة
  | 'room-card';     // بطاقة غرفة

// بيانات العنصر القابل للسحب
export interface DraggableData {
  id: string;
  type: DraggableItemType;
  name: string;
  icon?: string;
  price?: number;
  category?: string;
  sourceId?: string; // معرف المصدر (مثلاً: kitchen-library)
}

// حالة السحب النشط
export interface ActiveDragState {
  id: string;
  data: DraggableData;
}

// خيارات الـ hook
export interface UseDragAndDropOptions {
  gridSize?: number; // حجم الشبكة للـ snap-to-grid
  onItemDropped?: (item: DraggableData, targetId: string) => void;
  onItemRemoved?: (itemId: string, sourceId: string) => void;
}

// دالة الـ snap-to-grid
export const snapToGrid = (value: number, gridSize: number): number => {
  return Math.round(value / gridSize) * gridSize;
};

// دالة تحويل الإحداثيات مع snap-to-grid
export const createSnapModifier = (gridSize: number) => {
  return ({ transform }: { transform: { x: number; y: number } }) => {
    return {
      ...transform,
      x: snapToGrid(transform.x, gridSize),
      y: snapToGrid(transform.y, gridSize),
    };
  };
};

export const useDragAndDrop = (options: UseDragAndDropOptions = {}) => {
  const { gridSize = 10, onItemDropped, onItemRemoved } = options;

  // حالة العنصر المسحوب حالياً
  const [activeItem, setActiveItem] = useState<ActiveDragState | null>(null);
  
  // حالة المنطقة التي يتم التحويم فوقها
  const [overZoneId, setOverZoneId] = useState<string | null>(null);
  
  // حالة السحب الجارية
  const [isDragging, setIsDragging] = useState(false);

  // معالج بدء السحب
  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const data = active.data.current as DraggableData;
    
    setActiveItem({
      id: active.id as string,
      data,
    });
    setIsDragging(true);
  }, []);

  // معالج التحويم فوق منطقة
  const handleDragOver = useCallback((event: DragOverEvent) => {
    const { over } = event;
    
    if (over) {
      setOverZoneId(over.id as string);
    } else {
      setOverZoneId(null);
    }
  }, []);

  // معالج انتهاء السحب
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    
    if (over && activeItem) {
      const targetId = over.id as string;
      const data = active.data.current as DraggableData;
      
      // استدعاء callback عند إفلات العنصر
      if (onItemDropped) {
        onItemDropped(data, targetId);
      }
    }
    
    // إعادة تعيين الحالة
    setActiveItem(null);
    setOverZoneId(null);
    setIsDragging(false);
  }, [activeItem, onItemDropped]);

  // معالج إلغاء السحب
  const handleDragCancel = useCallback(() => {
    setActiveItem(null);
    setOverZoneId(null);
    setIsDragging(false);
  }, []);

  // إزالة عنصر من منطقة
  const removeItem = useCallback((itemId: string, sourceId: string) => {
    if (onItemRemoved) {
      onItemRemoved(itemId, sourceId);
    }
  }, [onItemRemoved]);

  // التحقق مما إذا كانت المنطقة نشطة (يتم التحويم فوقها)
  const isZoneActive = useCallback((zoneId: string) => {
    return overZoneId === zoneId;
  }, [overZoneId]);

  // إنشاء معدل snap-to-grid
  const snapModifier = createSnapModifier(gridSize);

  return {
    // الحالة
    activeItem,
    overZoneId,
    isDragging,
    
    // المعالجات
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    
    // الدوال المساعدة
    removeItem,
    isZoneActive,
    snapModifier,
    
    // ثوابت
    gridSize,
  };
};

export default useDragAndDrop;
