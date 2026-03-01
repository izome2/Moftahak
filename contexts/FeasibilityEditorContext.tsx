'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';
import { useSlides } from '@/hooks/useSlides';
import type { Slide, SlideType, SlideData, RoomData } from '@/types/feasibility';
import type { CurrencyCode } from '@/lib/feasibility/currency';
import { DEFAULT_CURRENCY } from '@/lib/feasibility/currency';

// نوع دراسة الجدوى
export type StudyType = 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';

// ترتيب تبديل العملات
const CURRENCY_CYCLE: CurrencyCode[] = ['EGP', 'SAR', 'USD'];

interface FeasibilityEditorContextType {
  // حالة المحرر
  isEditorActive: boolean;
  setIsEditorActive: (active: boolean) => void;
  
  // بيانات الدراسة
  studyId: string;
  setStudyId: (id: string) => void;
  clientName: string;
  setClientName: (name: string) => void;
  studyType: StudyType;
  setStudyType: (type: StudyType) => void;
  
  // العملة
  currency: CurrencyCode;
  setCurrency: (currency: CurrencyCode) => void;
  cycleCurrency: () => void;
  
  // الشرائح
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  activeSlideIndex: number;
  activeSlide: Slide | null;
  setActiveSlideIndex: (index: number) => void;
  addSlide: (type: SlideType, afterIndex?: number) => Slide;
  removeSlide: (id: string) => boolean;
  updateSlideData: (id: string, data: Partial<SlideData>) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setSlideOrder: (newOrder: Slide[]) => void;
  duplicateSlide: (id: string) => Slide | null;
  canRemoveSlide: (id: string) => boolean;
  generateRoomSlides: (roomCounts: { bedrooms: number; livingRooms: number; kitchens: number; bathrooms: number }, studyType?: StudyType) => void;
  
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
  initialStudyType?: StudyType;
  initialCurrency?: CurrencyCode;
}

export function FeasibilityEditorProvider({
  children,
  initialStudyId = 'new',
  initialClientName = 'العميل',
  initialStudyType = 'WITH_FIELD_VISIT',
  initialCurrency = DEFAULT_CURRENCY,
}: FeasibilityEditorProviderProps) {
  const [isEditorActive, setIsEditorActive] = useState(false);
  const [studyId, setStudyId] = useState(initialStudyId);
  const [clientName, setClientName] = useState(initialClientName);
  const [studyType, setStudyType] = useState<StudyType>(initialStudyType);
  const [currency, setCurrency] = useState<CurrencyCode>(initialCurrency);
  const [zoom, setZoom] = useState(100);

  const slidesHook = useSlides({ clientName });

  const zoomIn = () => setZoom(prev => Math.min(prev + 10, 200));
  const zoomOut = () => setZoom(prev => Math.max(prev - 10, 50));
  
  // تبديل العملة عند النقر: EGP -> SAR -> USD -> EGP
  const cycleCurrency = useCallback(() => {
    setCurrency(prev => {
      const currentIndex = CURRENCY_CYCLE.indexOf(prev);
      const nextIndex = (currentIndex + 1) % CURRENCY_CYCLE.length;
      return CURRENCY_CYCLE[nextIndex];
    });
  }, []);

  const value: FeasibilityEditorContextType = {
    isEditorActive,
    setIsEditorActive,
    studyId,
    setStudyId,
    clientName,
    setClientName,
    studyType,
    setStudyType,
    currency,
    setCurrency,
    cycleCurrency,
    slides: slidesHook.slides,
    setSlides: slidesHook.setSlides,
    activeSlideIndex: slidesHook.activeSlideIndex,
    activeSlide: slidesHook.activeSlide,
    setActiveSlideIndex: slidesHook.setActiveSlideIndex,
    addSlide: slidesHook.addSlide,
    removeSlide: slidesHook.removeSlide,
    updateSlideData: slidesHook.updateSlideData,
    reorderSlides: slidesHook.reorderSlides,
    setSlideOrder: slidesHook.setSlideOrder,
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
