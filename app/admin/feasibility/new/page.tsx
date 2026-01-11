'use client';

import React, { useEffect, useState } from 'react';
import { useFeasibilityEditor } from '@/contexts/FeasibilityEditorContext';
import EditorCanvas from '@/components/feasibility/editor/EditorCanvas';
import EditorToolbar from '@/components/feasibility/editor/EditorToolbar';
import type { TextOverlayItem } from '@/components/feasibility/editor/EditableTextOverlay';
import type { ImageOverlayItem } from '@/components/feasibility/editor/EditableImageOverlay';

// نوع العناصر المضافة
type OverlayItem = TextOverlayItem | ImageOverlayItem;

export default function NewFeasibilityStudyPage() {
  const editor = useFeasibilityEditor();
  
  // العناصر المضافة (نصوص وصور) - مخزنة حسب معرف الشريحة
  const [overlayItems, setOverlayItems] = useState<Record<string, OverlayItem[]>>({});

  // تفعيل المحرر عند الدخول
  useEffect(() => {
    editor.setIsEditorActive(true);
    editor.setStudyId('new');
    editor.setClientName('عميل تجريبي');

    return () => {
      editor.setIsEditorActive(false);
    };
  }, []);

  // الحصول على العناصر للشريحة الحالية
  const currentSlideItems = editor.activeSlide ? (overlayItems[editor.activeSlide.id] || []) : [];

  // إضافة نص جديد
  const handleAddText = () => {
    if (!editor.activeSlide) return;
    
    const newTextItem: TextOverlayItem = {
      id: `text-${Date.now()}`,
      type: 'text',
      content: 'نص جديد',
      x: 100,
      y: 100,
      fontSize: 24,
      color: '#10302b',
      fontWeight: 'bold',
    };
    
    setOverlayItems(prev => ({
      ...prev,
      [editor.activeSlide!.id]: [...(prev[editor.activeSlide!.id] || []), newTextItem],
    }));
  };
  
  // إضافة صورة جديدة
  const handleAddImage = (imageSrc: string) => {
    if (!editor.activeSlide) return;
    if (!imageSrc) return;
    
    const newImageItem: ImageOverlayItem = {
      id: `image-${Date.now()}`,
      type: 'image',
      src: imageSrc,
      x: 350,
      y: 250,
      width: 300,
      height: 200,
      rotation: 0,
    };
    
    setOverlayItems(prev => ({
      ...prev,
      [editor.activeSlide!.id]: [...(prev[editor.activeSlide!.id] || []), newImageItem],
    }));
  };
  
  // تحديث عنصر
  const handleUpdateOverlayItem = (updatedItem: OverlayItem) => {
    if (!editor.activeSlide) return;
    
    setOverlayItems(prev => ({
      ...prev,
      [editor.activeSlide!.id]: (prev[editor.activeSlide!.id] || []).map(item =>
        item.id === updatedItem.id ? updatedItem : item
      ),
    }));
  };
  
  // حذف عنصر
  const handleDeleteOverlayItem = (itemId: string) => {
    if (!editor.activeSlide) return;
    
    setOverlayItems(prev => ({
      ...prev,
      [editor.activeSlide!.id]: (prev[editor.activeSlide!.id] || []).filter(item => item.id !== itemId),
    }));
  };

  const handleUpdateSlideData = (data: Parameters<typeof editor.updateSlideData>[1]) => {
    if (editor.activeSlide) {
      editor.updateSlideData(editor.activeSlide.id, data);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative editor-cursor">
      {/* شريط الأدوات العائم */}
      <EditorToolbar
        studyId={editor.studyId}
        clientName={editor.clientName}
        zoom={editor.zoom}
        onZoomIn={editor.zoomIn}
        onZoomOut={editor.zoomOut}
        onSave={() => console.log('حفظ الدراسة...')}
        onPreview={() => console.log('معاينة الدراسة...')}
        onShare={() => console.log('مشاركة الدراسة...')}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
      />

      {/* منطقة العمل */}
      <div className="flex-1 overflow-hidden">
        <EditorCanvas
          zoom={editor.zoom}
          slide={editor.activeSlide}
          allSlides={editor.slides}
          slideIndex={editor.activeSlideIndex}
          totalSlides={editor.slides.length}
          isSidebarOpen={true}
          onToggleSidebar={() => {}}
          onUpdateSlideData={handleUpdateSlideData}
          onGenerateRoomSlides={editor.generateRoomSlides}
          overlayItems={currentSlideItems}
          onUpdateOverlayItem={handleUpdateOverlayItem}
          onDeleteOverlayItem={handleDeleteOverlayItem}
        />
      </div>
    </div>
  );
}
