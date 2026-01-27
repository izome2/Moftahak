'use client';

import React, { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Trash2, Move, Check, X } from 'lucide-react';

export interface TextOverlayItem {
  id: string;
  type: 'text';
  content: string;
  x: number;
  y: number;
  fontSize: number;
  color: string;
  fontWeight: 'normal' | 'bold';
}

interface EditableTextOverlayProps {
  item: TextOverlayItem;
  scale: number;
  onUpdate: (item: TextOverlayItem) => void;
  onDelete: (id: string) => void;
  containerRef: React.RefObject<HTMLDivElement | null>;
}

const EditableTextOverlay: React.FC<EditableTextOverlayProps> = ({
  item,
  scale,
  onUpdate,
  onDelete,
  containerRef,
}) => {
  const [isEditing, setIsEditing] = useState(item.content === 'نص جديد');
  const [isDragging, setIsDragging] = useState(false);
  const [isSelected, setIsSelected] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [editContent, setEditContent] = useState(item.content);
  const inputRef = useRef<HTMLInputElement>(null);
  const elementRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  // إغلاق التحديد عند النقر خارج العنصر
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (elementRef.current && !elementRef.current.contains(target)) {
        setIsSelected(false);
        if (isEditing) {
          handleSave();
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [isEditing, editContent]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isEditing) return;
    
    setIsSelected(true);
    setIsDragging(true);
    setDragStart({
      x: e.clientX / scale - item.x,
      y: e.clientY / scale - item.y,
    });
  };

  // Touch events للأجهزة اللمسية
  const handleTouchStart = (e: React.TouchEvent) => {
    e.stopPropagation();
    if (isEditing) return;
    
    if (e.touches.length === 1) {
      const touch = e.touches[0];
      setIsSelected(true);
      setIsDragging(true);
      setDragStart({
        x: touch.clientX / scale - item.x,
        y: touch.clientY / scale - item.y,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const newX = e.clientX / scale - dragStart.x;
    const newY = e.clientY / scale - dragStart.y;

    onUpdate({
      ...item,
      x: newX,
      y: newY,
    });
  };

  const handleTouchMove = (e: TouchEvent) => {
    if (!isDragging) return;
    e.preventDefault(); // منع التمرير أثناء السحب

    if (e.touches.length === 1) {
      const touch = e.touches[0];
      const newX = touch.clientX / scale - dragStart.x;
      const newY = touch.clientY / scale - dragStart.y;

      onUpdate({
        ...item,
        x: newX,
        y: newY,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      // Mouse events
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      // Touch events
      document.addEventListener('touchmove', handleTouchMove, { passive: false });
      document.addEventListener('touchend', handleTouchEnd);
      document.addEventListener('touchcancel', handleTouchEnd);
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
        document.removeEventListener('touchcancel', handleTouchEnd);
      };
    }
  }, [isDragging, dragStart, item, scale]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
    setEditContent(item.content);
  };

  const handleSave = () => {
    if (editContent.trim()) {
      onUpdate({ ...item, content: editContent.trim() });
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(item.content);
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  return (
    <motion.div
      ref={elementRef}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`absolute cursor-move select-none touch-none ${
        isSelected ? 'z-[100]' : 'z-50'
      }`}
      style={{
        left: `${item.x}px`,
        top: `${item.y}px`,
      }}
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
    >
      {/* النص أو حقل التعديل - بدون خلفية */}
      <div className="relative">
        {isEditing ? (
          <div className="flex items-center gap-2 bg-white/95 px-3 py-2 rounded-xl border-2 border-primary shadow-lg">
            <input
              ref={inputRef}
              type="text"
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              onKeyDown={handleKeyDown}
              className="bg-transparent border-none outline-none font-dubai text-secondary min-w-[100px]"
              style={{
                fontSize: `${item.fontSize}px`,
                fontWeight: item.fontWeight,
              }}
              dir="rtl"
            />
            <button
              onClick={handleSave}
              className="p-1 text-green-600 hover:bg-green-100 rounded-lg"
            >
              <Check className="w-4 h-4" />
            </button>
            <button
              onClick={handleCancel}
              className="p-1 text-red-500 hover:bg-red-100 rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="relative group">
            {/* النص بدون خلفية */}
            <span
              className="font-dubai block transition-all"
              style={{
                fontSize: `${item.fontSize}px`,
                fontWeight: item.fontWeight,
                color: item.color,
                textShadow: '0 1px 2px rgba(255,255,255,0.8)',
              }}
              dir="rtl"
            >
              {item.content}
            </span>
            
            {/* مؤشر التحديد - حد منقط عند التحديد */}
            {isSelected && (
              <div 
                className="absolute -inset-2 border-2 border-dashed border-primary/60 rounded-lg pointer-events-none"
              />
            )}
          </div>
        )}

        {/* أيقونة التحريك */}
        {isSelected && !isEditing && (
          <div className="absolute -top-3 -right-3 p-1 bg-primary text-secondary rounded-full shadow-lg">
            <Move className="w-3 h-3" />
          </div>
        )}
      </div>

      {/* شريط الأدوات */}
      {isSelected && !isEditing && (
        <motion.div
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute -top-12 left-1/2 -translate-x-1/2 flex items-center gap-1 bg-white px-2 py-1 shadow-lg border border-primary/20 rounded-xl"
        >
          <button
            onClick={() => onUpdate({ ...item, fontSize: Math.min(item.fontSize + 2, 48) })}
            className="px-2 py-1 text-sm font-bold text-secondary hover:bg-primary/10 rounded-lg"
            title="تكبير الخط"
          >
            A+
          </button>
          <button
            onClick={() => onUpdate({ ...item, fontSize: Math.max(item.fontSize - 2, 12) })}
            className="px-2 py-1 text-sm text-secondary hover:bg-primary/10 rounded-lg"
            title="تصغير الخط"
          >
            A-
          </button>
          <button
            onClick={() =>
              onUpdate({
                ...item,
                fontWeight: item.fontWeight === 'bold' ? 'normal' : 'bold',
              })
            }
            className={`px-2 py-1 text-sm font-bold text-secondary hover:bg-primary/10 rounded-lg ${
              item.fontWeight === 'bold' ? 'bg-primary/20' : ''
            }`}
            title="عريض"
          >
            B
          </button>
          <div className="w-px h-4 bg-primary/20" />
          <button
            onClick={() => onDelete(item.id)}
            className="p-1 text-red-500 hover:bg-red-100 rounded-lg"
            title="حذف"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </motion.div>
      )}
    </motion.div>
  );
};

export default EditableTextOverlay;
