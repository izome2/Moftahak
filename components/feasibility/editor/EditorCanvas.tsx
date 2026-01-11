'use client';

import React, { useRef, useState, useEffect } from 'react';
import { SlideCanvas } from '@/components/feasibility/slides';
import type { Slide, SlideData } from '@/types/feasibility';
import EditableTextOverlay, { type TextOverlayItem } from './EditableTextOverlay';
import EditableImageOverlay, { type ImageOverlayItem } from './EditableImageOverlay';

// نوع العناصر المضافة
type OverlayItem = TextOverlayItem | ImageOverlayItem;

interface EditorCanvasWrapperProps {
  zoom: number;
  slide: Slide | null;
  allSlides?: Slide[];
  slideIndex: number;
  totalSlides: number;
  isSidebarOpen: boolean;
  onToggleSidebar: () => void;
  onUpdateSlideData?: (data: Partial<SlideData>) => void;
  onGenerateRoomSlides?: (roomCounts: { bedrooms: number; livingRooms: number; kitchens: number; bathrooms: number }) => void;
  onZoomChange?: (zoom: number) => void;
  overlayItems?: OverlayItem[];
  onUpdateOverlayItem?: (item: OverlayItem) => void;
  onDeleteOverlayItem?: (id: string) => void;
}

const EditorCanvasWrapper: React.FC<EditorCanvasWrapperProps> = ({
  zoom,
  slide,
  allSlides = [],
  slideIndex,
  totalSlides,
  isSidebarOpen,
  onToggleSidebar,
  onUpdateSlideData,
  onGenerateRoomSlides,
  onZoomChange,
  overlayItems = [],
  onUpdateOverlayItem,
  onDeleteOverlayItem,
}) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const slideContainerRef = useRef<HTMLDivElement>(null);
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });

  // أبعاد الشريحة الثابتة (عمودي قليلاً)
  const SLIDE_WIDTH = 1100; // عرض ثابت
  const SLIDE_HEIGHT = 1200; // ارتفاع ثابت (عمودي قليلاً)

  // التعامل مع بداية السحب
  const handleMouseDown = (e: React.MouseEvent) => {
    // السماح بالسحب فقط على الخلفية، ليس على الشريحة أو المكتبة
    const target = e.target as HTMLElement;
    
    // تجاهل النقر على الشريحة
    if (target.closest('.slide-canvas-container')) {
      return;
    }
    
    // تجاهل النقر على المكتبة (Portal)
    if (target.closest('[data-library-popup]')) {
      return;
    }
    
    // تجاهل أي عنصر بـ z-index عالي (مثل المكتبة)
    const zIndex = window.getComputedStyle(target).zIndex;
    if (zIndex && parseInt(zIndex) > 1000) {
      return;
    }

    setIsPanning(true);
    setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
  };

  // التعامل مع السحب
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isPanning) return;

    const newX = e.clientX - panStart.x;
    const newY = e.clientY - panStart.y;
    setPanOffset({ x: newX, y: newY });
  };

  // التعامل مع نهاية السحب
  const handleMouseUp = () => {
    setIsPanning(false);
  };

  // التعامل مع التكبير بعجلة الماوس (Ctrl/Cmd + Scroll)
  const handleWheel = (e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const delta = -e.deltaY;
      const zoomStep = 5;
      const newZoom = Math.max(25, Math.min(200, zoom + (delta > 0 ? zoomStep : -zoomStep)));
      
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    }
  };

  // إضافة مستمع عالمي لـ mouseup
  useEffect(() => {
    const handleGlobalMouseUp = () => {
      setIsPanning(false);
    };

    document.addEventListener('mouseup', handleGlobalMouseUp);
    return () => document.removeEventListener('mouseup', handleGlobalMouseUp);
  }, []);

  // حساب التحويل (transform) بناءً على الزوم والإزاحة
  const scale = zoom / 100;
  const cursor = isPanning ? 'grabbing' : 'grab';

  return (
    <div 
      ref={canvasRef}
      className="h-full flex flex-col bg-accent/20 relative"
      style={{ 
        cursor,
        userSelect: 'none',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onWheel={handleWheel}
    >
      {/* منطقة العمل - بدون scrollbars */}
      <div className="flex-1 overflow-hidden pt-24 pb-24 flex items-center justify-center">
        {/* Canvas Container مع التحويل */}
        <div
          style={{
            transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${scale})`,
            transformOrigin: 'center center',
            willChange: isPanning ? 'transform' : 'auto',
          }}
        >
          {/* عرض الشريحة بأبعاد ثابتة */}
          {slide ? (
            <div ref={slideContainerRef} className="relative slide-canvas-container" style={{ pointerEvents: 'auto' }}>
              <div
                style={{
                  width: `${SLIDE_WIDTH}px`,
                  height: `${SLIDE_HEIGHT}px`,
                }}
              >
                <SlideCanvas
                  slide={slide}
                  allSlides={allSlides}
                  zoom={100} // نمرر 100 دائماً لأن التكبير يتم عبر CSS transform
                  isEditing={true}
                  onUpdateSlideData={onUpdateSlideData}
                  onGenerateRoomSlides={onGenerateRoomSlides}
                />
              </div>
              
              {/* العناصر المضافة (نصوص وصور) */}
              {overlayItems.map((item) => {
                if (item.type === 'text') {
                  return (
                    <EditableTextOverlay
                      key={item.id}
                      item={item as TextOverlayItem}
                      scale={scale}
                      containerRef={slideContainerRef}
                      onUpdate={(updated) => onUpdateOverlayItem?.(updated)}
                      onDelete={(id) => onDeleteOverlayItem?.(id)}
                    />
                  );
                } else if (item.type === 'image') {
                  return (
                    <EditableImageOverlay
                      key={item.id}
                      item={item as ImageOverlayItem}
                      scale={scale}
                      containerRef={slideContainerRef}
                      onUpdate={(updated) => onUpdateOverlayItem?.(updated)}
                      onDelete={(id) => onDeleteOverlayItem?.(id)}
                    />
                  );
                }
                return null;
              })}
            </div>
          ) : (
            <div 
              className="bg-white shadow-large rounded-2xl flex items-center justify-center" 
              style={{ 
                width: `${SLIDE_WIDTH}px`, 
                height: `${SLIDE_HEIGHT}px`,
              }}
            >
              <p className="text-secondary/40 font-dubai">لا توجد شريحة محددة</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EditorCanvasWrapper;
