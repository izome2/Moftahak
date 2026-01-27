'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Layers, X, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { SlideManager } from '@/components/feasibility/slides';
import type { Slide, SlideType } from '@/types/feasibility';

interface EditorSidePanelProps {
  // SlideManager props
  slides: Slide[];
  activeSlideIndex: number;
  onSlideSelect: (index: number) => void;
  onAddSlide: (type: SlideType, afterIndex?: number) => void;
  onRemoveSlide: (id: string) => void;
  onDuplicateSlide: (id: string) => void;
  onReorderSlides: (fromIndex: number, toIndex: number) => void;
  onSetSlideOrder: (newOrder: Slide[]) => void;
  canRemoveSlide: (id: string) => boolean;
  clientName?: string;
  studyType?: 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';
}

const EditorSidePanel: React.FC<EditorSidePanelProps> = ({
  slides,
  activeSlideIndex,
  onSlideSelect,
  onAddSlide,
  onRemoveSlide,
  onDuplicateSlide,
  onReorderSlides,
  onSetSlideOrder,
  canRemoveSlide,
  clientName = 'عميل جديد',
  studyType = 'WITH_FIELD_VISIT',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* ======== Desktop Sidebar (≥1280px OR landscape ≥1024px) ======== */}
      <aside className="hidden xl:flex lg:landscape:flex fixed right-8 top-24 h-[calc(100vh-8rem)] w-72 bg-white shadow-[0_8px_30px_rgba(237,191,140,0.5)] border-2 border-primary/20 flex-col overflow-hidden z-30 rounded-2xl">
        {/* Header */}
        <div className="px-4 py-5 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent">
          <div className="flex items-center gap-3">
            {/* زر العودة */}
            <Link href="/admin/feasibility">
              <motion.div
                whileHover={{ x: -3 }}
                className="flex items-center justify-center w-9 h-9 text-secondary/70 hover:text-secondary hover:bg-primary/10 rounded-lg transition-colors"
              >
                <ArrowRight size={18} />
              </motion.div>
            </Link>
            
            {/* الشعار */}
            <div className="w-7 h-7 relative shrink-0">
              <Image
                src="/logos/logo-dark-icon.png"
                alt="مفتاحك"
                fill
                className="object-contain"
                sizes="28px"
              />
            </div>
            
            {/* معلومات الدراسة */}
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-secondary font-dubai text-sm truncate">دراسة جدوى</span>
              <span className="text-secondary/60 text-xs font-dubai truncate">{clientName}</span>
            </div>
          </div>
        </div>

        {/* Slide Manager */}
        <div className="flex-1 overflow-hidden">
          <SlideManager
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            onSlideSelect={onSlideSelect}
            onAddSlide={onAddSlide}
            onRemoveSlide={onRemoveSlide}
            onDuplicateSlide={onDuplicateSlide}
            onReorderSlides={onReorderSlides}
            onSetSlideOrder={onSetSlideOrder}
            canRemoveSlide={canRemoveSlide}
            studyType={studyType}
            compact
          />
        </div>
      </aside>

      {/* ======== Mobile/Tablet Button (<1280px portrait) ======== */}
      {/* يظهر فوق شريط الأدوات بمسافة كافية */}
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={() => setIsOpen(true)}
        className="fixed bottom-10 right-4 z-40 px-4 py-3 rounded-full bg-white text-secondary hover:bg-primary/10 transition-all duration-300 hover:scale-105 xl:hidden lg:landscape:hidden flex items-center gap-2.5"
        style={{ boxShadow: 'rgba(16, 48, 43, 0.15) 0px 10px 40px, rgba(237, 191, 140, 0.3) 0px 0px 0px 1px' }}
        aria-label="فتح قائمة الشرائح"
      >
        <Layers className="w-5 h-5" />
        <span className="font-dubai text-sm font-medium">الشرائح</span>
        <span className="bg-primary/20 px-2 py-0.5 rounded-full text-xs">{slides.length}</span>
      </motion.button>

      {/* ======== Mobile/Tablet Bottom Sheet (<1280px portrait) ======== */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/25 z-40 xl:hidden lg:landscape:hidden backdrop-blur-[2px]"
              onClick={() => setIsOpen(false)}
            />
            
            {/* Bottom Sheet */}
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setIsOpen(false);
                }
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed bottom-0 left-0 right-0 h-[70vh] bg-white shadow-[0_-4px_30px_rgba(16,48,43,0.15)] flex flex-col overflow-hidden z-50 xl:hidden lg:landscape:hidden rounded-t-3xl touch-none"
            >
              {/* Drag Handle */}
              <div className="flex justify-center py-3 shrink-0">
                <div className="w-16 h-1.5 bg-primary/40 rounded-full" />
              </div>

              {/* Header */}
              <div className="px-5 py-4 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent shrink-0">
                <div className="flex items-center gap-4">
                  {/* الشعار */}
                  <div className="w-9 h-9 relative shrink-0">
                    <Image
                      src="/logos/logo-dark-icon.png"
                      alt="مفتاحك"
                      fill
                      className="object-contain"
                      sizes="36px"
                    />
                  </div>
                  
                  {/* معلومات الدراسة */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-secondary font-dubai text-base truncate">دراسة جدوى</span>
                    <span className="text-secondary/60 text-sm font-dubai truncate">{clientName}</span>
                  </div>
                  
                  {/* زر الإغلاق */}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="p-2 rounded-lg hover:bg-primary/10 transition-colors"
                    aria-label="إغلاق"
                  >
                    <X className="w-6 h-6 text-secondary" />
                  </button>
                </div>
              </div>

              {/* Slide Manager */}
              <div className="flex-1 overflow-hidden">
                <SlideManager
                  slides={slides}
                  activeSlideIndex={activeSlideIndex}
                  onSlideSelect={(index) => {
                    onSlideSelect(index);
                    setIsOpen(false); // إغلاق القائمة بعد الاختيار
                  }}
                  onAddSlide={onAddSlide}
                  onRemoveSlide={onRemoveSlide}
                  onDuplicateSlide={onDuplicateSlide}
                  onReorderSlides={onReorderSlides}
                  onSetSlideOrder={onSetSlideOrder}
                  canRemoveSlide={canRemoveSlide}
                  studyType={studyType}
                  compact
                />
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

export default EditorSidePanel;
