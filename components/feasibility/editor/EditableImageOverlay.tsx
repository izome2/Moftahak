'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Move, ZoomIn, ZoomOut, RotateCw } from 'lucide-react';

export interface ImageOverlayItem {
  id: string;
  type: 'image';
  src: string;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
}

interface EditableImageOverlayProps {
  item: ImageOverlayItem;
  scale: number;
  onUpdate: (item: ImageOverlayItem) => void;
  onDelete: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const EditableImageOverlay: React.FC<EditableImageOverlayProps> = ({
  item,
  scale,
  onUpdate,
  onDelete,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isResizing, setIsResizing] = useState(false);
  const [isSelected, setIsSelected] = useState(true);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [resizeStart, setResizeStart] = useState({ width: 0, height: 0, x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: item.width, height: item.height });
  const elementRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // تحميل الصورة لمعرفة أبعادها الحقيقية
  useEffect(() => {
    const img = new window.Image();
    img.onload = () => {
      // حساب الأبعاد الفعلية للصورة داخل الـ container
      const containerAspect = item.width / item.height;
      const imageAspect = img.naturalWidth / img.naturalHeight;
      
      let actualWidth, actualHeight;
      
      if (imageAspect > containerAspect) {
        // الصورة أعرض من الـ container - العرض هو الحد
        actualWidth = item.width;
        actualHeight = item.width / imageAspect;
      } else {
        // الصورة أطول من الـ container - الارتفاع هو الحد
        actualHeight = item.height;
        actualWidth = item.height * imageAspect;
      }
      
      setImageSize({ width: actualWidth, height: actualHeight });
    };
    img.src = item.src;
  }, [item.src, item.width, item.height]);

  // إغلاق التحديد عند النقر خارج العنصر
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (elementRef.current && !elementRef.current.contains(e.target as Node)) {
        setIsSelected(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsSelected(true);
    setIsDragging(true);
    setDragStart({
      x: e.clientX / scale - item.x,
      y: e.clientY / scale - item.y,
    });
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = e.clientX / scale - dragStart.x;
      const newY = e.clientY / scale - dragStart.y;

      onUpdate({
        ...item,
        x: newX,
        y: newY,
      });
    } else if (isResizing) {
      const deltaX = (e.clientX - resizeStart.x) / scale;
      const deltaY = (e.clientY - resizeStart.y) / scale;
      
      // الحفاظ على نسبة العرض إلى الارتفاع
      const aspectRatio = resizeStart.width / resizeStart.height;
      const newWidth = Math.max(50, resizeStart.width + deltaX);
      const newHeight = newWidth / aspectRatio;

      onUpdate({
        ...item,
        width: newWidth,
        height: newHeight,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    setIsResizing(false);
  };

  useEffect(() => {
    if (isDragging || isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, isResizing, dragStart, resizeStart, item, scale]);

  const handleResizeStart = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsResizing(true);
    setResizeStart({
      width: item.width,
      height: item.height,
      x: e.clientX,
      y: e.clientY,
    });
  };

  const handleZoomIn = () => {
    onUpdate({
      ...item,
      width: item.width * 1.1,
      height: item.height * 1.1,
    });
  };

  const handleZoomOut = () => {
    onUpdate({
      ...item,
      width: Math.max(50, item.width * 0.9),
      height: Math.max(50, item.height * 0.9),
    });
  };

  const handleRotate = () => {
    // تدوير بـ 15 درجة في كل مرة للتحكم الأفضل
    onUpdate({
      ...item,
      rotation: (item.rotation + 15) % 360,
    });
  };

  // تحديد إذا كان في وضع التحرير (سحب أو تغيير حجم أو محدد)
  const isEditing = isDragging || isResizing || isSelected;

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute cursor-move select-none ${
        isSelected ? 'z-[100]' : 'z-50'
      }`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
        width: `${item.width}px`,
        height: `${item.height}px`,
      }}
      onMouseDown={handleMouseDown}
      onClick={(e) => {
        e.stopPropagation();
        setIsSelected(true);
      }}
    >
      {/* wrapper للصورة مع التدوير */}
      <div
        className="relative w-full h-full flex items-center justify-center"
        style={{
          transform: `rotate(${item.rotation}deg)`,
          transformOrigin: 'center center',
        }}
      >
        {/* الصورة مع البوردر المطابق */}
        <div
          className={`relative transition-all rounded-xl overflow-hidden ${
            isEditing
              ? 'border-2 border-dashed border-primary/60'
              : 'border-2 border-primary/30'
          }`}
          style={{
            width: `${imageSize.width}px`,
            height: `${imageSize.height}px`,
            // الظل والبوردر فقط عندما لا يكون في وضع التحرير
            boxShadow: !isEditing
              ? 'rgba(237, 191, 140, 0.4) 0px 6px 20px'
              : 'none',
            borderStyle: isEditing ? 'dashed' : 'solid',
            borderColor: isEditing ? 'rgba(237, 191, 140, 0.6)' : 'rgba(237, 191, 140, 0.5)',
          }}
        >
          {/* استخدام img عادي بدلاً من next/image لعرض الصورة كاملة */}
          <img
            ref={imgRef}
            src={item.src}
            alt="صورة مضافة"
            className="w-full h-full object-contain pointer-events-none"
            draggable={false}
          />
        </div>
      </div>

      {/* مقابض التحجيم */}
      {isSelected && (
        <>
          {/* الزاوية السفلية اليمنى */}
          <div
            className="absolute -bottom-2 -right-2 w-4 h-4 bg-primary border-2 border-white shadow-lg cursor-se-resize rounded-full"
            onMouseDown={handleResizeStart}
          />
          {/* الزاوية السفلية اليسرى */}
          <div
            className="absolute -bottom-2 -left-2 w-4 h-4 bg-primary border-2 border-white shadow-lg cursor-sw-resize rounded-full"
            onMouseDown={handleResizeStart}
          />
          {/* الزاوية العلوية اليمنى */}
          <div
            className="absolute -top-2 -right-2 w-4 h-4 bg-primary border-2 border-white shadow-lg cursor-ne-resize rounded-full"
            onMouseDown={handleResizeStart}
          />
          {/* الزاوية العلوية اليسرى */}
          <div
            className="absolute -top-2 -left-2 w-4 h-4 bg-primary border-2 border-white shadow-lg cursor-nw-resize rounded-full"
            onMouseDown={handleResizeStart}
          />
        </>
      )}

      {/* شريط الأدوات */}
      {isSelected && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-14 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white px-3 py-2 shadow-lg border border-primary/20 rounded-xl"
        >
          <button
            onClick={handleZoomIn}
            className="p-1.5 text-secondary hover:bg-primary/10 rounded-lg"
            title="تكبير"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 text-secondary hover:bg-primary/10 rounded-lg"
            title="تصغير"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleRotate}
            className="p-1.5 text-secondary hover:bg-primary/10 rounded-lg"
            title="تدوير 15°"
          >
            <RotateCw className="w-4 h-4" />
          </button>
          <div className="w-px h-4 bg-primary/20" />
          <button
            onClick={() => onDelete(item.id)}
            className="p-1.5 text-red-500 hover:bg-red-100 rounded-lg"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EditableImageOverlay;
