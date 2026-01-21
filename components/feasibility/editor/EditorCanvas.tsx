'use client';

import React, { useRef, useEffect, useCallback } from 'react';
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

  // أبعاد الشريحة الثابتة (عمودي قليلاً)
  const SLIDE_WIDTH = 1100; // عرض ثابت
  const SLIDE_HEIGHT = 1200; // ارتفاع ثابت (عمودي قليلاً)

  // التعامل مع التكبير بعجلة الماوس (Ctrl/Cmd + Scroll)
  const handleWheel = useCallback((e: React.WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      
      const delta = -e.deltaY;
      const zoomStep = 5;
      const newZoom = Math.max(25, Math.min(200, zoom + (delta > 0 ? zoomStep : -zoomStep)));
      
      if (onZoomChange) {
        onZoomChange(newZoom);
      }
    }
  }, [zoom, onZoomChange]);

  // التعامل مع أزرار الكيبورد للتمرير
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!canvasRef.current) return;
      
      const scrollAmount = 100;
      
      switch (e.key) {
        case 'ArrowUp':
          canvasRef.current.scrollTop -= scrollAmount;
          e.preventDefault();
          break;
        case 'ArrowDown':
          canvasRef.current.scrollTop += scrollAmount;
          e.preventDefault();
          break;
        case 'PageUp':
          canvasRef.current.scrollTop -= canvasRef.current.clientHeight * 0.8;
          e.preventDefault();
          break;
        case 'PageDown':
          canvasRef.current.scrollTop += canvasRef.current.clientHeight * 0.8;
          e.preventDefault();
          break;
        case 'Home':
          canvasRef.current.scrollTop = 0;
          e.preventDefault();
          break;
        case 'End':
          canvasRef.current.scrollTop = canvasRef.current.scrollHeight;
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // حساب التحويل (transform) بناءً على الزوم
  const scale = zoom / 100;

  return (
    <div 
      ref={canvasRef}
      className="h-full flex flex-col bg-accent/20 relative overflow-y-auto overflow-x-hidden"
      style={{ 
        scrollBehavior: 'smooth',
      }}
      onWheel={handleWheel}
    >
      {/* منطقة العمل - تمرير عمودي فقط */}
      <div className="flex-1 pt-24 pb-24 flex justify-center min-h-max">
        {/* Canvas Container مع التحويل - ثابت في المنتصف أفقياً */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'top center',
            willChange: 'transform',
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
