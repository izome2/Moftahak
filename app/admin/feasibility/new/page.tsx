'use client';

import React, { useEffect, useState, useCallback } from 'react';
import { useFeasibilityEditor } from '@/contexts/FeasibilityEditorContext';
import EditorCanvas from '@/components/feasibility/editor/EditorCanvas';
import EditorToolbar from '@/components/feasibility/editor/EditorToolbar';
import type { TextOverlayItem } from '@/components/feasibility/editor/EditableTextOverlay';
import type { ImageOverlayItem } from '@/components/feasibility/editor/EditableImageOverlay';

// نوع العناصر المضافة
type OverlayItem = TextOverlayItem | ImageOverlayItem;

export default function NewFeasibilityStudyPage() {
  const editor = useFeasibilityEditor();
  
  // حالة الحفظ
  const [saving, setSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [showSavedMessage, setShowSavedMessage] = useState(false);
  const [createdStudyId, setCreatedStudyId] = useState<string | null>(null);
  
  // العناصر المضافة (نصوص وصور) - مخزنة حسب معرف الشريحة
  const [overlayItems, setOverlayItems] = useState<Record<string, OverlayItem[]>>({});

  // تفعيل المحرر عند الدخول
  useEffect(() => {
    editor.setIsEditorActive(true);
    editor.setStudyId('new');
    editor.setClientName('عميل جديد');
    editor.setStudyType('WITH_FIELD_VISIT'); // الدراسات اليدوية تكون مع نزول ميداني افتراضياً
    
    // إنشاء شرائح افتراضية (غلاف، مقدمة، تكوين الشقة)
    const initialSlides = [
      {
        id: 'cover-1',
        type: 'cover' as const,
        title: 'الغلاف',
        order: 0,
        data: {
          cover: {
            clientName: 'عميل جديد',
            studyTitle: 'دراسة جدوى',
            date: new Date().toLocaleDateString('ar-EG'),
          },
        },
        isLocked: true,
      },
      {
        id: 'introduction-1',
        type: 'introduction' as const,
        title: 'المقدمة',
        order: 1,
        data: {
          introduction: {
            title: 'مرحباً بك في دراسة الجدوى',
            description: 'تم إعداد هذه الدراسة خصيصاً لمساعدتك في تجهيز شقتك للإيجار السياحي.',
            bulletPoints: [
              'تحليل شامل لاحتياجات الشقة',
              'تكلفة تقديرية للتجهيزات',
              'دراسة المنطقة المحيطة',
              'إحصائيات وتوقعات الإيجار',
            ],
          },
        },
        isLocked: true,
      },
      {
        id: 'room-setup-1',
        type: 'room-setup' as const,
        title: 'تكوين الشقة',
        order: 2,
        data: {
          roomSetup: {
            rooms: {
              bedrooms: 1,
              livingRooms: 1,
              kitchens: 1,
              bathrooms: 1,
            },
            slidesGenerated: false,
          },
        },
      },
    ];
    
    editor.setSlides(initialSlides);

    return () => {
      editor.setIsEditorActive(false);
    };
  }, []);

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

  // حفظ الدراسة
  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      // حساب التكلفة الإجمالية من الشرائح
      let totalCost = 0;
      editor.slides.forEach(slide => {
        if (slide.data.room?.room.totalCost) {
          totalCost += slide.data.room.room.totalCost;
        }
      });

      // إذا كانت الدراسة موجودة بالفعل، قم بتحديثها
      if (createdStudyId) {
        const response = await fetch(`/api/admin/feasibility/${createdStudyId}`, {
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
      } else {
        // إنشاء دراسة جديدة
        const response = await fetch('/api/admin/feasibility', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            title: `دراسة جدوى - ${editor.clientName}`,
            clientName: editor.clientName,
            slides: editor.slides,
            totalCost,
          }),
        });
        
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'حدث خطأ أثناء الحفظ');
        }
        
        // حفظ معرف الدراسة للحفظ التالي
        setCreatedStudyId(data.study.id);
        editor.setStudyId(data.study.id);
      }
      
      setLastSaved(new Date());
      setShowSavedMessage(true);
      
    } catch (err) {
      alert(err instanceof Error ? err.message : 'حدث خطأ أثناء الحفظ');
    } finally {
      setSaving(false);
    }
  }, [editor.slides, editor.clientName, createdStudyId]);

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
      
      // تحديث اسم العميل في الcontext عند تعديله في شريحة الغلاف
      if (data.cover?.clientName) {
        editor.setClientName(data.cover.clientName);
      }
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
        onSave={handleSave}
        onPreview={() => console.log('معاينة الدراسة...')}
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
