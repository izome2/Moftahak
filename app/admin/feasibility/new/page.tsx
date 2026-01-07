'use client';

import React, { useEffect } from 'react';
import { useFeasibilityEditor } from '@/contexts/FeasibilityEditorContext';
import EditorCanvas from '@/components/feasibility/editor/EditorCanvas';
import EditorToolbar from '@/components/feasibility/editor/EditorToolbar';

export default function NewFeasibilityStudyPage() {
  const editor = useFeasibilityEditor();

  // تفعيل المحرر عند الدخول
  useEffect(() => {
    editor.setIsEditorActive(true);
    editor.setStudyId('new');
    editor.setClientName('عميل تجريبي');

    return () => {
      editor.setIsEditorActive(false);
    };
  }, []);

  const handleUpdateSlideData = (data: Parameters<typeof editor.updateSlideData>[1]) => {
    if (editor.activeSlide) {
      editor.updateSlideData(editor.activeSlide.id, data);
    }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative">
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
      />

      {/* منطقة العمل */}
      <div className="flex-1 overflow-hidden">
        <EditorCanvas
          zoom={editor.zoom}
          slide={editor.activeSlide}
          slideIndex={editor.activeSlideIndex}
          totalSlides={editor.slides.length}
          isSidebarOpen={true}
          onToggleSidebar={() => {}}
          onUpdateSlideData={handleUpdateSlideData}
          onGenerateRoomSlides={editor.generateRoomSlides}
        />
      </div>
    </div>
  );
}
