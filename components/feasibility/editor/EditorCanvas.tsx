'use client';

import React, { useRef, useEffect, useCallback, useState } from 'react';
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

// الزوم الافتراضي
const DEFAULT_ZOOM = 100;

// عرض القائمة الجانبية على الديسكتوب (w-72 = 288px + right-8 = 32px + gap)
const SIDEBAR_WIDTH = 336;
const SLIDE_BASE_WIDTH = 1100;
const SLIDE_BASE_HEIGHT = 1200;

// حساب الزوم المناسب والإزاحة عندما تقترب القائمة من الشريحة
const calculateZoomAndOffset = () => {
  if (typeof window === 'undefined') return { zoom: DEFAULT_ZOOM, offset: 0 };
  
  const screenWidth = window.innerWidth;
  const screenHeight = window.innerHeight;
  
  // على الموبايل والتابلت (أقل من 1024px) - القائمة مخفية، نجعل الشريحة Fit
  if (screenWidth < 1024) {
    const availableWidth = screenWidth - 32; // 32 = padding
    const availableHeight = screenHeight - 120; // 120 = مساحة للأزرار
    
    const zoomByWidth = (availableWidth / SLIDE_BASE_WIDTH) * 100;
    const zoomByHeight = (availableHeight / SLIDE_BASE_HEIGHT) * 100;
    
    const fitZoom = Math.min(zoomByWidth, zoomByHeight) * 0.95; // 95% للأمان
    return { zoom: Math.max(20, Math.floor(fitZoom)), offset: 0 };
  }
  
  // على الديسكتوب - نحسب إذا كانت الشريحة ستلمس القائمة
  // الشريحة في المنتصف، لذا نحسب المسافة من المنتصف إلى حافة القائمة
  const slideWidthAtDefaultZoom = SLIDE_BASE_WIDTH * (DEFAULT_ZOOM / 100);
  const slideHalfWidth = slideWidthAtDefaultZoom / 2;
  const screenCenter = screenWidth / 2;
  
  // حافة الشريحة اليمنى (في RTL، اليمين هو جهة القائمة)
  const slideRightEdge = screenCenter + slideHalfWidth;
  
  // حافة القائمة اليسرى (القائمة على اليمين بعرض SIDEBAR_WIDTH)
  const sidebarLeftEdge = screenWidth - SIDEBAR_WIDTH;
  
  // إذا كانت الشريحة لا تلمس القائمة (مع هامش أمان 20px)
  if (slideRightEdge < sidebarLeftEdge - 20) {
    return { zoom: DEFAULT_ZOOM, offset: 0 };
  }
  
  // الشريحة ستلمس القائمة - نحسب الزوم المناسب أو الإزاحة
  // المساحة المتاحة من يسار الشاشة إلى القائمة
  const availableWidth = sidebarLeftEdge - 40; // 40 = هامش من اليسار
  
  // نحاول أولاً الإزاحة بدون تصغير
  const neededOffset = slideRightEdge - sidebarLeftEdge + 30; // 30 = هامش أمان
  
  // إذا كانت الإزاحة معقولة (أقل من 200px)، نستخدمها فقط
  if (neededOffset <= 200) {
    return { zoom: DEFAULT_ZOOM, offset: neededOffset };
  }
  
  // وإلا نصغر الزوم ونزيح
  const optimalZoom = (availableWidth / SLIDE_BASE_WIDTH) * 100 * 0.95; // 95% للأمان
  const finalZoom = Math.max(40, Math.floor(optimalZoom));
  
  // نعيد حساب الإزاحة بعد التصغير
  const newSlideHalfWidth = (SLIDE_BASE_WIDTH * (finalZoom / 100)) / 2;
  const newSlideRightEdge = screenCenter + newSlideHalfWidth;
  const newOffset = Math.max(0, newSlideRightEdge - sidebarLeftEdge + 30);
  
  return { zoom: finalZoom, offset: newOffset };
};

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
  const [initialZoomSet, setInitialZoomSet] = useState(false);
  const [offsetX, setOffsetX] = useState(0);

  // أبعاد الشريحة الثابتة (عمودي قليلاً)
  const SLIDE_WIDTH = 1100; // عرض ثابت
  const SLIDE_HEIGHT = 1200; // ارتفاع ثابت (عمودي قليلاً)

  // تعيين الزوم والإزاحة عند التحميل الأول
  useEffect(() => {
    if (!initialZoomSet && onZoomChange) {
      const { zoom: optimalZoom, offset } = calculateZoomAndOffset();
      onZoomChange(optimalZoom);
      setOffsetX(offset);
      setInitialZoomSet(true);
    }
  }, [initialZoomSet, onZoomChange]);

  // إعادة حساب الزوم والإزاحة عند تغيير حجم الشاشة
  useEffect(() => {
    const handleResize = () => {
      if (onZoomChange) {
        const { zoom: optimalZoom, offset } = calculateZoomAndOffset();
        onZoomChange(optimalZoom);
        setOffsetX(offset);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [onZoomChange]);

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
      className="h-full w-full bg-accent/20 relative overflow-y-auto overflow-x-hidden transition-all duration-300 scrollbar-hide"
      style={{ 
        scrollBehavior: 'smooth',
      }}
      onWheel={handleWheel}
    >
      {/* منطقة العمل - الشريحة في مركز الشاشة، تتحرك لليسار عند وجود القائمة */}
      <div 
        className="min-h-full flex items-center justify-center py-12 transition-all duration-300"
        style={{
          transform: `translateX(-${offsetX}px)`,
        }}
      >
        {/* Canvas Container مع التحويل */}
        <div
          style={{
            transform: `scale(${scale})`,
            transformOrigin: 'center center',
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
