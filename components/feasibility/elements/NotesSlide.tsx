'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Bold,
  Italic,
  Underline,
  List,
  ALargeSmall
} from 'lucide-react';
import { NotesSlideData } from '@/types/feasibility';

// الظلال
const SHADOWS = {
  card: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(0, 0, 0, 0.05)',
  icon: '0 4px 12px rgba(237, 191, 140, 0.3)',
};

// ألوان الهايلايت (البيج والأخضر من الهوية) - مع شفافية خفيفة
const HIGHLIGHT_COLORS = [
  { id: 'beige', color: 'rgba(237, 191, 140, 0.5)', textColor: '#10302b', label: 'بيج' },
  { id: 'green', color: 'rgba(16, 48, 43, 0.8)', textColor: '#edbf8c', label: 'أخضر' },
];

interface NotesSlideProps {
  data?: NotesSlideData;
  isEditing?: boolean;
  onUpdate?: (data: NotesSlideData) => void;
}

// المكون الرئيسي
export default function NotesSlide({ data, isEditing = false, onUpdate }: NotesSlideProps) {
  const defaultData: NotesSlideData = {
    title: 'ملاحظات إضافية',
    content: '',
    showDecoration: true,
  };

  const slideData = { ...defaultData, ...data };
  const [localTitle, setLocalTitle] = useState(slideData.title);
  const [localContent, setLocalContent] = useState(slideData.content || '');
  const [showHighlightMenu, setShowHighlightMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalTitle(slideData.title);
    setLocalContent(slideData.content || '');
    // تحديث محتوى الـ contentEditable
    if (editorRef.current && !isEditing) {
      editorRef.current.innerHTML = slideData.content || '';
    }
  }, [slideData.title, slideData.content, isEditing]);

  // تحديث المحتوى عند تغيير الـ editor
  useEffect(() => {
    if (editorRef.current && isEditing && localContent) {
      // فقط عند التحميل الأول
      if (editorRef.current.innerHTML === '') {
        editorRef.current.innerHTML = localContent;
      }
    }
  }, [isEditing, localContent]);

  const handleTitleBlur = () => {
    if (localTitle !== slideData.title) {
      onUpdate?.({ ...slideData, title: localTitle });
    }
  };

  const handleContentBlur = () => {
    if (editorRef.current) {
      const content = editorRef.current.innerHTML;
      if (content !== slideData.content) {
        onUpdate?.({ ...slideData, content });
      }
    }
  };

  // حفظ التحديد الحالي
  const saveSelection = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      return selection.getRangeAt(0).cloneRange();
    }
    return null;
  }, []);

  // استعادة التحديد
  const restoreSelection = useCallback((range: Range | null) => {
    if (range) {
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        selection.addRange(range);
      }
    }
  }, []);

  // تطبيق التنسيق
  const applyFormat = useCallback((command: string, value?: string) => {
    const savedRange = saveSelection();
    document.execCommand(command, false, value);
    restoreSelection(savedRange);
    editorRef.current?.focus();
  }, [saveSelection, restoreSelection]);

  // تطبيق الهايلايت مع تغيير لون النص للأخضر
  const applyHighlight = useCallback((colorData: typeof HIGHLIGHT_COLORS[0]) => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const selectedText = range.toString();
      
      if (selectedText.trim()) {
        // إنشاء span جديد مع الهايلايت
        const span = document.createElement('span');
        span.style.backgroundColor = colorData.color;
        span.style.color = colorData.textColor;
        span.style.padding = '1px 4px';
        span.style.borderRadius = '3px';
        span.style.userSelect = 'text';
        span.style.cursor = 'text';
        span.setAttribute('data-highlight', colorData.id);
        
        // استخراج المحتوى المحدد ووضعه في الـ span
        const fragment = range.extractContents();
        span.appendChild(fragment);
        range.insertNode(span);
        
        // إعادة تحديد النص
        selection.removeAllRanges();
        const newRange = document.createRange();
        newRange.selectNodeContents(span);
        selection.addRange(newRange);
      }
    }
    setShowHighlightMenu(false);
    editorRef.current?.focus();
  }, []);

  // إزالة الهايلايت
  const removeHighlight = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // البحث عن أقرب span هايلايت
      let highlightSpan: HTMLElement | null = null;
      if (container.nodeType === Node.TEXT_NODE) {
        highlightSpan = container.parentElement?.closest('span[data-highlight]') as HTMLElement;
      } else if (container instanceof HTMLElement) {
        highlightSpan = container.closest('span[data-highlight]') as HTMLElement;
      }
      
      if (highlightSpan && highlightSpan.parentNode) {
        // استبدال الـ span بمحتواه النصي
        const textContent = highlightSpan.textContent || '';
        const textNode = document.createTextNode(textContent);
        highlightSpan.parentNode.replaceChild(textNode, highlightSpan);
      }
    }
    editorRef.current?.focus();
  }, []);

  // إضافة نقطة رأسية (bullet point) في موقع المؤشر مع مسافة بادئة
  const insertBullet = useCallback(() => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || !editorRef.current) return;
    
    // حفظ موقع المؤشر الحالي
    const range = selection.getRangeAt(0);
    
    // النقطة مع مسافة بادئة
    const bulletText = '    • ';
    
    // إدراج النقطة في موقع المؤشر الحالي
    const textNode = document.createTextNode(bulletText);
    range.insertNode(textNode);
    
    // نقل المؤشر إلى ما بعد النقطة مباشرة
    range.setStartAfter(textNode);
    range.setEndAfter(textNode);
    selection.removeAllRanges();
    selection.addRange(range);
  }, []);

  // تكبير/تصغير حجم الخط
  const toggleFontSize = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
      const range = selection.getRangeAt(0);
      const container = range.commonAncestorContainer;
      
      // البحث عن span حجم الخط الكبير
      let fontSpan: HTMLElement | null = null;
      if (container.nodeType === Node.TEXT_NODE) {
        fontSpan = container.parentElement?.closest('span[data-fontsize="large"]') as HTMLElement;
      } else if (container instanceof HTMLElement) {
        fontSpan = container.closest('span[data-fontsize="large"]') as HTMLElement;
      }
      
      if (fontSpan && fontSpan.parentNode) {
        // إرجاع الحجم الطبيعي
        const textContent = fontSpan.textContent || '';
        const textNode = document.createTextNode(textContent);
        fontSpan.parentNode.replaceChild(textNode, fontSpan);
      } else {
        // تكبير الخط
        const selectedText = range.toString();
        if (selectedText.trim()) {
          const span = document.createElement('span');
          span.style.fontSize = '1.2em';
          span.setAttribute('data-fontsize', 'large');
          
          const fragment = range.extractContents();
          span.appendChild(fragment);
          range.insertNode(span);
          
          // إعادة تحديد النص
          selection.removeAllRanges();
          const newRange = document.createRange();
          newRange.selectNodeContents(span);
          selection.addRange(newRange);
        }
      }
    }
    editorRef.current?.focus();
  }, []);

  // معالجة الخروج من الهايلايت عند الضغط على الأسهم
  const handleKeyDown = useCallback((e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const container = range.startContainer;
        
        // البحث عن span الهايلايت
        let highlightSpan: HTMLElement | null = null;
        if (container.nodeType === Node.TEXT_NODE) {
          highlightSpan = container.parentElement?.closest('span[data-highlight]') as HTMLElement;
        } else if (container instanceof HTMLElement) {
          highlightSpan = container.closest('span[data-highlight]') as HTMLElement;
        }
        
        if (highlightSpan) {
          const offset = range.startOffset;
          const textLength = container.textContent?.length || 0;
          
          // إذا كان المؤشر في النهاية وضغط سهم يمين (أو البداية وسهم يسار في RTL)
          if ((e.key === 'ArrowRight' && offset === 0) || 
              (e.key === 'ArrowLeft' && offset === textLength)) {
            // إنشاء مسافة بعد الهايلايت للخروج منه
            const space = document.createTextNode('\u200B'); // Zero-width space
            if (e.key === 'ArrowLeft') {
              highlightSpan.parentNode?.insertBefore(space, highlightSpan.nextSibling);
            } else {
              highlightSpan.parentNode?.insertBefore(space, highlightSpan);
            }
          }
        }
      }
    }
  }, []);



  return (
    <div className="min-h-full p-4 sm:p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-4"
      >
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl overflow-hidden bg-white p-5 sm:p-6 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Background Decoration */}
          {slideData.showDecoration && (
            <div className="absolute -top-6 -left-6 opacity-[0.06] pointer-events-none">
              <FileText className="w-40 h-40 text-primary" strokeWidth={1.5} />
            </div>
          )}

          <div className="relative z-10 flex items-center gap-3">
            <motion.div 
              className="p-3 rounded-xl bg-primary/20 border-2 border-primary/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              style={{ boxShadow: SHADOWS.icon }}
            >
              <FileText className="w-6 h-6 text-primary" strokeWidth={2} />
            </motion.div>
            <div className="flex-1">
              {isEditing ? (
                <input
                  type="text"
                  value={localTitle}
                  onChange={(e) => setLocalTitle(e.target.value)}
                  onBlur={handleTitleBlur}
                  className="text-xl sm:text-2xl font-bold text-secondary font-dubai bg-transparent border-b-2 border-transparent focus:border-primary/30 focus:outline-none transition-colors w-full"
                  placeholder="عنوان الشريحة"
                />
              ) : (
                <h2 className="text-xl sm:text-2xl font-bold text-secondary font-dubai">
                  {slideData.title}
                </h2>
              )}
            </div>
          </div>
        </motion.div>

        {/* Content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="relative rounded-2xl overflow-hidden bg-white p-5 sm:p-6 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* شريط الأدوات */}
          {isEditing && (
            <div className="flex items-center gap-1 mb-4 pb-3 border-b border-primary/10 flex-wrap">
              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormat('bold'); }}
                className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                title="نص عريض (Ctrl+B)"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormat('italic'); }}
                className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                title="نص مائل (Ctrl+I)"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                onMouseDown={(e) => { e.preventDefault(); applyFormat('underline'); }}
                className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                title="خط تحت النص (Ctrl+U)"
              >
                <Underline className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-primary/20 mx-1" />
              
              {/* تكبير الخط */}
              <button
                onMouseDown={(e) => { e.preventDefault(); toggleFontSize(); }}
                className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                title="تكبير/تصغير الخط"
              >
                <ALargeSmall className="w-4 h-4" />
              </button>
              
              {/* نقطة رأسية */}
              <button
                onMouseDown={(e) => { e.preventDefault(); insertBullet(); }}
                className="p-2 rounded-lg bg-white text-secondary/60 hover:text-secondary hover:bg-primary/10 border border-primary/20 transition-colors"
                title="إضافة نقطة رأسية"
              >
                <List className="w-4 h-4" />
              </button>
              
              <div className="w-px h-6 bg-primary/20 mx-1" />
              
              {/* أزرار الهايلايت */}
              {HIGHLIGHT_COLORS.map((hl) => (
                <button
                  key={hl.id}
                  onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); applyHighlight(hl); }}
                  className="w-6 h-6 rounded-full border-2 transition-transform hover:scale-110"
                  style={{ 
                    backgroundColor: hl.color,
                    borderColor: hl.id === 'beige' ? '#d4ad82' : '#1a3a34'
                  }}
                  title={`تمييز ${hl.label}`}
                />
              ))}
              <button
                onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); removeHighlight(); }}
                className="w-6 h-6 rounded-full border-2 border-red-400 bg-white text-red-400 text-sm font-bold flex items-center justify-center transition-transform hover:scale-110"
                style={{ paddingTop: '2px' }}
                title="إزالة التمييز"
              >
                ✕
              </button>
            </div>
          )}

          {/* محرر النص */}
          {isEditing ? (
            <div
              ref={editorRef}
              contentEditable
              onBlur={handleContentBlur}
              onKeyDown={handleKeyDown}
              className="w-full min-h-32 p-4 bg-accent/20 rounded-xl border-2 border-primary/10 focus:border-primary/30 focus:outline-none font-dubai text-secondary text-base leading-relaxed transition-colors"
              dir="rtl"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
              suppressContentEditableWarning
            />
          ) : (
            <div 
              className="font-dubai text-secondary text-base leading-relaxed w-full"
              dir="rtl"
              style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'break-word' }}
              dangerouslySetInnerHTML={{ __html: slideData.content || '<p class="text-secondary/50">لا توجد ملاحظات</p>' }}
            />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
