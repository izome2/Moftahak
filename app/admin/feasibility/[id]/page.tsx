'use client';

import React, { useEffect, useState, useCallback, use } from 'react';
import { useFeasibilityEditor } from '@/contexts/FeasibilityEditorContext';
import EditorCanvas from '@/components/feasibility/editor/EditorCanvas';
import EditorToolbar from '@/components/feasibility/editor/EditorToolbar';
import type { TextOverlayItem } from '@/components/feasibility/editor/EditableTextOverlay';
import type { ImageOverlayItem } from '@/components/feasibility/editor/EditableImageOverlay';
import type { Slide, SlideData } from '@/types/feasibility';
import { Loader2, AlertCircle } from 'lucide-react';

// نوع العناصر المضافة
type OverlayItem = TextOverlayItem | ImageOverlayItem;

interface PageProps {
  params: Promise<{ id: string }>;
}

export default function EditFeasibilityStudyPage({ params }: PageProps) {
  const { id } = use(params);
  const editor = useFeasibilityEditor();
  
  // حالة التحميل والخطأ
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  
  // بيانات الدراسة من قاعدة البيانات
  const [studyData, setStudyData] = useState<{
    id: string;
    title: string;
    clientName: string;
    clientEmail: string | null;
    slides: Slide[];
    totalCost: number;
    status: string;
  } | null>(null);
  
  // العناصر المضافة (نصوص وصور)
  const [overlayItems, setOverlayItems] = useState<Record<string, OverlayItem[]>>({});

  // جلب بيانات الدراسة من قاعدة البيانات
  useEffect(() => {
    const fetchStudy = async () => {
      try {
        const response = await fetch(`/api/admin/feasibility/${id}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'حدث خطأ أثناء جلب الدراسة');
        }
        
        setStudyData({
          id: data.study.id,
          title: data.study.title,
          clientName: data.study.clientName,
          clientEmail: data.study.clientEmail,
          slides: data.study.slides as Slide[],
          totalCost: data.study.totalCost,
          status: data.study.status,
        });
        
        // تحديث المحرر بالشرائح من قاعدة البيانات
        editor.setStudyId(data.study.id);
        editor.setClientName(data.study.clientName);
        editor.setSlides(data.study.slides as Slide[]);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'حدث خطأ غير متوقع');
      } finally {
        setLoading(false);
      }
    };

    fetchStudy();
    editor.setIsEditorActive(true);

    return () => {
      editor.setIsEditorActive(false);
    };
  }, [id]);

  // حفظ الدراسة
  const handleSave = useCallback(async () => {
    if (!studyData) return;
    
    setSaving(true);
    try {
      // حساب التكلفة الإجمالية من الشرائح
      let totalCost = 0;
      editor.slides.forEach(slide => {
        if (slide.data.room?.room.totalCost) {
          totalCost += slide.data.room.room.totalCost;
        }
      });

      const response = await fetch(`/api/admin/feasibility/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slides: editor.slides,
          totalCost,
          clientName: editor.clientName,
        }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الحفظ');
      }
      
      setLastSaved(new Date());
      setShowSavedMessage(true);
      setStudyData(prev => prev ? { ...prev, slides: editor.slides, totalCost } : null);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }, [id, editor.slides, editor.clientName, studyData]);

  // إخفاء رسالة الحفظ بعد 3 ثواني
  useEffect(() => {
    if (showSavedMessage) {
      const timer = setTimeout(() => {
        setShowSavedMessage(false);
        setLastSaved(null);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSavedMessage]);

  // الحفظ التلقائي كل دقيقة
  useEffect(() => {
    if (!studyData) return;
    
    const autoSaveInterval = setInterval(() => {
      handleSave();
    }, 60000); // كل دقيقة

    return () => clearInterval(autoSaveInterval);
  }, [handleSave, studyData]);

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

  const handleUpdateSlideData = (data: Partial<SlideData>) => {
    if (editor.activeSlide) {
      editor.updateSlideData(editor.activeSlide.id, data);
      
      // تحديث اسم العميل في الcontext عند تعديله في شريحة الغلاف
      if (data.cover?.clientName) {
        editor.setClientName(data.cover.clientName);
      }
    }
  };

  // حالة التحميل
  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-primary mx-auto mb-4" />
          <p className="text-secondary/60">جاري تحميل الدراسة...</p>
        </div>
      </div>
    );
  }

  // حالة الخطأ
  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-secondary mb-2">حدث خطأ</h2>
          <p className="text-secondary/60 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-secondary text-primary rounded-lg hover:bg-secondary/90 transition-colors"
          >
            إعادة المحاولة
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden relative editor-cursor">
      {/* شريط الأدوات العائم */}
      <EditorToolbar
        studyId={studyData?.id || id}
        clientName={studyData?.clientName || editor.clientName}
        zoom={editor.zoom}
        onZoomIn={editor.zoomIn}
        onZoomOut={editor.zoomOut}
        onSave={handleSave}
        onPreview={() => {
          if (studyData?.id) {
            window.open(`/study/${studyData.id}`, '_blank');
          }
        }}
        onShare={() => console.log('مشاركة الدراسة...')}
        onAddText={handleAddText}
        onAddImage={handleAddImage}
        isSaving={saving}
        lastSaved={lastSaved}
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
