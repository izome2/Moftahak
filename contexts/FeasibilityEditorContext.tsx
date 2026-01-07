'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useSlides } from '@/hooks/useSlides';
import type { Slide, SlideType, SlideData, RoomData } from '@/types/feasibility';

interface FeasibilityEditorContextType {
  // حالة المحرر
  isEditorActive: boolean;
  setIsEditorActive: (active: boolean) => void;
  
  // بيانات الدراسة
  studyId: string;
  setStudyId: (id: string) => void;
  clientName: string;
  setClientName: (name: string) => void;
  
  // الشرائح
  slides: Slide[];
  activeSlideIndex: number;
  activeSlide: Slide | null;
  setActiveSlideIndex: (index: number) => void;
  addSlide: (type: SlideType, afterIndex?: number) => Slide;
  removeSlide: (id: string) => boolean;
  updateSlideData: (id: string, data: Partial<SlideData>) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  duplicateSlide: (id: string) => Slide | null;
  canRemoveSlide: (id: string) => boolean;
  generateRoomSlides: (roomCounts: { bedrooms: number; livingRooms: number; kitchens: number; bathrooms: number }) => void;
  
  // التكبير
  zoom: number;
  setZoom: (zoom: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
}

const FeasibilityEditorContext = createContext<FeasibilityEditorContextType | null>(null);

export function useFeasibilityEditor() {
  const context = useContext(FeasibilityEditorContext);
  if (!context) {
    throw new Error('useFeasibilityEditor must be used within FeasibilityEditorProvider');
  }
  return context;
}

// Hook آمن يرجع null إذا لم يكن داخل Provider
export function useFeasibilityEditorSafe() {
  return useContext(FeasibilityEditorContext);
}

interface FeasibilityEditorProviderProps {
  children: ReactNode;
  initialStudyId?: string;
  initialClientName?: string;
}

export function FeasibilityEditorProvider({
  children,
  initialStudyId = 'new',
  initialClientName = 'العميل',
}: FeasibilityEditorProviderProps) {
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [studyId, setStudyId] = useState(initialStudyId);
  const [clientName, setClientName] = useState(initialClientName);
  const [zoom, setZoom] = useState(100);

  const slidesHook = useSlides({ clientName });

  const zoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 10, 50));

  const value: FeasibilityEditorContextType = {
    isEditorActive,
    setIsEditorActive,
    studyId,
    setStudyId,
    clientName,
    setClientName,
    slides: slidesHook.slides,
    activeSlideIndex: slidesHook.activeSlideIndex,
    activeSlide: slidesHook.activeSlide,
    setActiveSlideIndex: slidesHook.setActiveSlideIndex,
    addSlide: slidesHook.addSlide,
    removeSlide: slidesHook.removeSlide,
    updateSlideData: slidesHook.updateSlideData,
    reorderSlides: slidesHook.reorderSlides,
    duplicateSlide: slidesHook.duplicateSlide,
    canRemoveSlide: slidesHook.canRemoveSlide,
    generateRoomSlides: slidesHook.generateRoomSlides,
    zoom,
    setZoom,
    zoomIn,
    zoomOut,
  };

  return (
    <FeasibilityEditorContext.Provider value={value}>
      {children}
    </FeasibilityEditorContext.Provider>
  );
}
