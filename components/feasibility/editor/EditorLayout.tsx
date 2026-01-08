'use client';

import React, { useState, ReactNode } from 'react';
import { motion } from 'framer-motion';
import EditorToolbar from './EditorToolbar';
import EditorCanvas from './EditorCanvas';
import { SlideManager } from '@/components/feasibility/slides';
import { useSlides } from '@/hooks/useSlides';
import type { SlideType, SlideData } from '@/types/feasibility';

interface EditorLayoutProps {
  studyId: string;
  clientName?: string;
  children?: ReactNode;
}

const EditorLayout: React.FC<EditorLayoutProps> = ({ 
  studyId, 
  clientName = 'العميل',
  children 
}) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [zoom, setZoom] = useState(100);

  // استخدام hook الشرائح
  const {
    slides,
    activeSlideIndex,
    activeSlide,
    setActiveSlideIndex,
    addSlide,
    removeSlide,
    updateSlideData,
    reorderSlides,
    duplicateSlide,
    canRemoveSlide,
    generateRoomSlides,
  } = useSlides({ clientName });

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 10, 200));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 10, 50));
  };

  const handleSave = async () => {
    // سيتم تنفيذ الحفظ في مرحلة لاحقة
    console.log('حفظ الدراسة...', { studyId, slides });
  };

  const handlePreview = () => {
    // سيتم تنفيذ المعاينة في مرحلة لاحقة
    console.log('معاينة الدراسة...');
  };

  const handleShare = () => {
    // سيتم تنفيذ المشاركة في مرحلة لاحقة
    console.log('مشاركة الدراسة...');
  };

  const handleAddSlide = (type: SlideType, afterIndex?: number) => {
    addSlide(type, afterIndex);
  };

  const handleRemoveSlide = (id: string) => {
    removeSlide(id);
  };

  const handleDuplicateSlide = (id: string) => {
    duplicateSlide(id);
  };

  const handleReorderSlides = (fromIndex: number, toIndex: number) => {
    reorderSlides(fromIndex, toIndex);
  };

  const handleUpdateSlideData = (data: Partial<SlideData>) => {
    if (activeSlide) {
      updateSlideData(activeSlide.id, data);
    }
  };

  return (
    <div className="h-screen flex flex-col bg-accent overflow-hidden relative" dir="rtl">
      {/* شريط الأدوات العائم */}
      <EditorToolbar
        studyId={studyId}
        clientName={clientName}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onSave={handleSave}
        onPreview={handlePreview}
        onShare={handleShare}
      />

      {/* المحتوى الرئيسي */}
      <div className="flex-1 flex overflow-hidden">
        {/* الشريط الجانبي */}
        <motion.div
          initial={false}
          animate={{
            width: isSidebarOpen ? 280 : 0,
            opacity: isSidebarOpen ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
          className="h-full overflow-hidden"
        >
          <SlideManager
            slides={slides}
            activeSlideIndex={activeSlideIndex}
            onSlideSelect={setActiveSlideIndex}
            onAddSlide={handleAddSlide}
            onRemoveSlide={handleRemoveSlide}
            onDuplicateSlide={handleDuplicateSlide}
            onReorderSlides={handleReorderSlides}
            canRemoveSlide={canRemoveSlide}
          />
        </motion.div>

        {/* منطقة العمل الرئيسية */}
        <div className="flex-1 overflow-hidden">
          <EditorCanvas
            zoom={zoom}
            slide={activeSlide}
            allSlides={slides}
            slideIndex={activeSlideIndex}
            totalSlides={slides.length}
            isSidebarOpen={isSidebarOpen}
            onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
            onUpdateSlideData={handleUpdateSlideData}
            onGenerateRoomSlides={generateRoomSlides}
            onZoomChange={setZoom}
          />
        </div>
      </div>

      {/* الأطفال الإضافيين (مثل الـ modals) */}
      {children}
    </div>
  );
};

export default EditorLayout;
