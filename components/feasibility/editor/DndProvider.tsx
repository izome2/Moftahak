'use client';

import React from 'react';
import {
  DndContext,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  closestCenter,
  pointerWithin,
  rectIntersection,
} from '@dnd-kit/core';
import { restrictToWindowEdges } from '@dnd-kit/modifiers';

interface DndProviderProps {
  children: React.ReactNode;
  onDragStart?: (event: DragStartEvent) => void;
  onDragOver?: (event: DragOverEvent) => void;
  onDragEnd?: (event: DragEndEvent) => void;
  onDragCancel?: () => void;
}

const DndProvider: React.FC<DndProviderProps> = ({
  children,
  onDragStart,
  onDragOver,
  onDragEnd,
  onDragCancel,
}) => {
  // إعداد المستشعرات (sensors)
  const mouseSensor = useSensor(MouseSensor, {
    // تفعيل السحب بعد تحريك 5 بكسل
    activationConstraint: {
      distance: 5,
    },
  });

  const touchSensor = useSensor(TouchSensor, {
    // تفعيل السحب بعد الضغط لمدة 250ms
    activationConstraint: {
      delay: 250,
      tolerance: 5,
    },
  });

  const sensors = useSensors(mouseSensor, touchSensor);

  // استراتيجية الكشف عن التصادم المخصصة
  // تجمع بين pointerWithin و closestCenter للحصول على أفضل تجربة
  const collisionDetection = React.useCallback((args: Parameters<typeof closestCenter>[0]) => {
    // أولاً نحاول pointerWithin للدقة
    const pointerCollisions = pointerWithin(args);
    if (pointerCollisions.length > 0) {
      return pointerCollisions;
    }
    
    // ثم نحاول rectIntersection للتقاطعات
    const rectCollisions = rectIntersection(args);
    if (rectCollisions.length > 0) {
      return rectCollisions;
    }
    
    // أخيراً نستخدم closestCenter
    return closestCenter(args);
  }, []);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      modifiers={[restrictToWindowEdges]}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      {children}
    </DndContext>
  );
};

export default DndProvider;
