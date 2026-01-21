'use client';

import React, { useState, useEffect, useRef } from 'react';
import { Edit3, Check, X } from 'lucide-react';

interface EditableSectionTitleProps {
  title: string;
  subtitle?: string;
  isEditing?: boolean;
  onTitleChange?: (newTitle: string) => void;
  onSubtitleChange?: (newSubtitle: string) => void;
  className?: string;
  titleClassName?: string;
  subtitleClassName?: string;
}

/**
 * مكون العنوان القابل للتعديل
 * يمكن استخدامه في جميع شرائح دراسة الجدوى
 */
const EditableSectionTitle: React.FC<EditableSectionTitleProps> = ({
  title,
  subtitle,
  isEditing = false,
  onTitleChange,
  onSubtitleChange,
  className = '',
  titleClassName = 'text-2xl sm:text-3xl font-bold text-secondary font-dubai',
  subtitleClassName = 'text-secondary/60 font-dubai text-sm',
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [isEditingSubtitle, setIsEditingSubtitle] = useState(false);
  const [localTitle, setLocalTitle] = useState(title);
  const [localSubtitle, setLocalSubtitle] = useState(subtitle || '');
  const titleInputRef = useRef<HTMLInputElement>(null);
  const subtitleInputRef = useRef<HTMLInputElement>(null);

  // تحديث القيم المحلية عند تغيير الـ props
  useEffect(() => {
    setLocalTitle(title);
  }, [title]);

  useEffect(() => {
    setLocalSubtitle(subtitle || '');
  }, [subtitle]);

  // التركيز على الحقل عند بدء التعديل
  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    if (isEditingSubtitle && subtitleInputRef.current) {
      subtitleInputRef.current.focus();
      subtitleInputRef.current.select();
    }
  }, [isEditingSubtitle]);

  // حفظ العنوان
  const handleSaveTitle = () => {
    setIsEditingTitle(false);
    if (onTitleChange && localTitle.trim()) {
      onTitleChange(localTitle.trim());
    }
  };

  // إلغاء تعديل العنوان
  const handleCancelTitle = () => {
    setIsEditingTitle(false);
    setLocalTitle(title);
  };

  // حفظ العنوان الفرعي
  const handleSaveSubtitle = () => {
    setIsEditingSubtitle(false);
    if (onSubtitleChange) {
      onSubtitleChange(localSubtitle.trim());
    }
  };

  // إلغاء تعديل العنوان الفرعي
  const handleCancelSubtitle = () => {
    setIsEditingSubtitle(false);
    setLocalSubtitle(subtitle || '');
  };

  return (
    <div className={className}>
      {/* العنوان الرئيسي */}
      {isEditing && isEditingTitle ? (
        <div className="flex items-center gap-2 mb-1">
          <input
            ref={titleInputRef}
            type="text"
            value={localTitle}
            onChange={(e) => setLocalTitle(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSaveTitle();
              if (e.key === 'Escape') handleCancelTitle();
            }}
            className={`${titleClassName} bg-white/50 border border-primary/30 px-3 py-1 rounded-xl focus:outline-none focus:border-primary w-full`}
          />
          <button
            onClick={handleSaveTitle}
            className="p-2 bg-primary/20 hover:bg-primary/30 transition-colors rounded-xl flex-shrink-0"
          >
            <Check className="w-5 h-5 text-primary" />
          </button>
          <button
            onClick={handleCancelTitle}
            className="p-2 bg-red-100 hover:bg-red-200 transition-colors rounded-xl flex-shrink-0"
          >
            <X className="w-5 h-5 text-red-500" />
          </button>
        </div>
      ) : (
        <div 
          className={`group relative flex items-center gap-2 ${isEditing ? 'cursor-pointer' : ''}`}
          onClick={() => isEditing && setIsEditingTitle(true)}
        >
          <h2 className={titleClassName}>
            {localTitle}
          </h2>
          {isEditing && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsEditingTitle(true);
              }}
              className="opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
            >
              <Edit3 className="w-5 h-5 text-primary/60 hover:text-primary" />
            </button>
          )}
        </div>
      )}

      {/* العنوان الفرعي */}
      {subtitle !== undefined && (
        <>
          {isEditing && isEditingSubtitle ? (
            <div className="flex items-center gap-2 mt-1">
              <input
                ref={subtitleInputRef}
                type="text"
                value={localSubtitle}
                onChange={(e) => setLocalSubtitle(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleSaveSubtitle();
                  if (e.key === 'Escape') handleCancelSubtitle();
                }}
                className={`${subtitleClassName} bg-white/50 border border-primary/30 px-2 py-1 rounded-lg focus:outline-none focus:border-primary w-full`}
              />
              <button
                onClick={handleSaveSubtitle}
                className="p-1.5 bg-primary/20 hover:bg-primary/30 transition-colors rounded-lg flex-shrink-0"
              >
                <Check className="w-4 h-4 text-primary" />
              </button>
              <button
                onClick={handleCancelSubtitle}
                className="p-1.5 bg-red-100 hover:bg-red-200 transition-colors rounded-lg flex-shrink-0"
              >
                <X className="w-4 h-4 text-red-500" />
              </button>
            </div>
          ) : (
            <p 
              className={`${subtitleClassName} ${isEditing ? 'cursor-pointer hover:text-secondary/80 group' : ''} flex items-center gap-1`}
              onClick={() => isEditing && onSubtitleChange && setIsEditingSubtitle(true)}
            >
              {localSubtitle}
              {isEditing && onSubtitleChange && (
                <Edit3 className="w-3 h-3 text-primary/40 opacity-0 group-hover:opacity-100 transition-opacity inline" />
              )}
            </p>
          )}
        </>
      )}
    </div>
  );
};

export default EditableSectionTitle;
