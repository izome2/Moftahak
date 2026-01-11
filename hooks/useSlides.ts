'use client';

import { useState, useCallback, useMemo } from 'react';
import type { Slide, SlideType, SlideData, RoomData } from '@/types/feasibility';

// القوالب الافتراضية للشرائح
const defaultSlideTemplates: Record<SlideType, { title: string; data: SlideData; isLocked?: boolean }> = {
  cover: {
    title: 'الغلاف',
    data: {
      cover: {
        clientName: 'اسم العميل',
        studyTitle: 'دراسة جدوى',
        date: new Date().toLocaleDateString('ar-EG'),
      },
    },
    isLocked: true,
  },
  introduction: {
    title: 'المقدمة',
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
  'room-setup': {
    title: 'تكوين الشقة',
    data: {
      roomSetup: {
        rooms: {
          bedrooms: 2,
          livingRooms: 1,
          kitchens: 1,
          bathrooms: 1,
        },
      },
    },
  },
  kitchen: {
    title: 'المطبخ',
    data: {
      room: {
        room: {
          id: '',
          type: 'kitchen',
          name: 'المطبخ',
          number: 1,
          items: [],
          totalCost: 0,
        },
        showImage: false,
        imagePosition: 'right',
      },
    },
  },
  bathroom: {
    title: 'الحمام',
    data: {
      room: {
        room: {
          id: '',
          type: 'bathroom',
          name: 'الحمام',
          number: 1,
          items: [],
          totalCost: 0,
        },
        showImage: false,
        imagePosition: 'right',
      },
    },
  },
  'living-room': {
    title: 'الصالة',
    data: {
      room: {
        room: {
          id: '',
          type: 'living-room',
          name: 'الصالة',
          number: 1,
          items: [],
          totalCost: 0,
        },
        showImage: false,
        imagePosition: 'right',
      },
    },
  },
  bedroom: {
    title: 'غرفة النوم',
    data: {
      room: {
        room: {
          id: '',
          type: 'bedroom',
          name: 'غرفة النوم',
          number: 1,
          items: [],
          totalCost: 0,
        },
        showImage: false,
        imagePosition: 'right',
      },
    },
  },
  'cost-summary': {
    title: 'ملخص التكاليف',
    data: {
      costSummary: {
        rooms: [],
        additionalCosts: [],
      },
    },
  },
  'area-study': {
    title: 'دراسة المنطقة',
    data: {
      areaStudy: {
        title: 'دراسة المناطق المحيطة',
        description: 'تحليل شامل للشقق المحيطة وأسعار الإيجار في المنطقة.',
      },
    },
  },
  map: {
    title: 'الخريطة',
    data: {
      map: {
        center: { lat: 30.0444, lng: 31.2357 }, // القاهرة افتراضياً
        zoom: 14,
        pins: [],
      },
    },
  },
  'nearby-apartments': {
    title: 'الشقق المحيطة',
    data: {
      nearbyApartments: {
        apartments: [],
        showFromMap: true,
      },
    },
  },
  statistics: {
    title: 'الإحصائيات',
    data: {
      statistics: {
        totalCost: 0,
        averageRent: 0,
        roomsCost: [],
        comparisonData: [],
      },
    },
  },
  footer: {
    title: 'الخاتمة',
    data: {
      footer: {
        message: 'شكراً لثقتكم بنا',
        contactInfo: {
          phone: '',
          email: 'info@moftahak.com',
          website: 'www.moftahak.com',
          whatsapp: '',
        },
        socialLinks: {},
      },
    },
    isLocked: true,
  },
};

// الشرائح الافتراضية عند إنشاء دراسة جديدة
const createDefaultSlides = (clientName: string): Slide[] => [
  {
    id: 'cover-1',
    type: 'cover',
    title: 'الغلاف',
    order: 0,
    data: {
      cover: {
        clientName,
        studyTitle: 'دراسة جدوى',
        date: new Date().toLocaleDateString('ar-EG'),
      },
    },
    isLocked: true,
  },
  {
    id: 'introduction-1',
    type: 'introduction',
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
    type: 'room-setup',
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

// توليد ID فريد
const generateId = () => `slide-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

interface UseSlidesOptions {
  clientName?: string;
  initialSlides?: Slide[];
}

interface UseSlidesReturn {
  slides: Slide[];
  setSlides: React.Dispatch<React.SetStateAction<Slide[]>>;
  activeSlideIndex: number;
  activeSlide: Slide | null;
  setActiveSlideIndex: (index: number) => void;
  addSlide: (type: SlideType, afterIndex?: number) => Slide;
  removeSlide: (id: string) => boolean;
  updateSlide: (id: string, updates: Partial<Slide>) => void;
  updateSlideData: (id: string, data: Partial<SlideData>) => void;
  reorderSlides: (fromIndex: number, toIndex: number) => void;
  setSlideOrder: (newOrder: Slide[]) => void;
  duplicateSlide: (id: string) => Slide | null;
  getSlideByType: (type: SlideType) => Slide[];
  canRemoveSlide: (id: string) => boolean;
  getTotalCost: () => number;
  getRooms: () => RoomData[];
  generateRoomSlides: (roomCounts: { bedrooms: number; livingRooms: number; kitchens: number; bathrooms: number }) => void;
}

export function useSlides(options: UseSlidesOptions = {}): UseSlidesReturn {
  const { clientName = 'العميل', initialSlides } = options;

  const [slides, setSlides] = useState<Slide[]>(
    initialSlides || createDefaultSlides(clientName)
  );
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);

  // الشريحة النشطة
  const activeSlide = useMemo(() => {
    return slides[activeSlideIndex] || null;
  }, [slides, activeSlideIndex]);

  // إضافة شريحة جديدة
  const addSlide = useCallback((type: SlideType, afterIndex?: number): Slide => {
    const template = defaultSlideTemplates[type];
    const existingOfType = slides.filter(s => s.type === type).length;
    
    const newSlide: Slide = {
      id: generateId(),
      type,
      title: existingOfType > 0 ? `${template.title} ${existingOfType + 1}` : template.title,
      order: afterIndex !== undefined ? afterIndex + 1 : slides.length,
      data: JSON.parse(JSON.stringify(template.data)), // نسخة عميقة
      isLocked: template.isLocked,
    };

    // تحديث ID الغرفة إذا كانت شريحة غرفة
    if (newSlide.data.room) {
      newSlide.data.room.room.id = newSlide.id;
      newSlide.data.room.room.number = existingOfType + 1;
    }

    setSlides(prev => {
      const insertIndex = afterIndex !== undefined ? afterIndex + 1 : prev.length;
      const newSlides = [...prev];
      newSlides.splice(insertIndex, 0, newSlide);
      // تحديث الترتيب
      return newSlides.map((slide, index) => ({ ...slide, order: index }));
    });

    // تحديد الشريحة الجديدة
    const newIndex = afterIndex !== undefined ? afterIndex + 1 : slides.length;
    setActiveSlideIndex(newIndex);

    return newSlide;
  }, [slides]);

  // التحقق من إمكانية حذف الشريحة
  const canRemoveSlide = useCallback((id: string): boolean => {
    const slide = slides.find(s => s.id === id);
    if (!slide) return false;
    return !slide.isLocked;
  }, [slides]);

  // حذف شريحة
  const removeSlide = useCallback((id: string): boolean => {
    if (!canRemoveSlide(id)) return false;

    setSlides(prev => {
      const newSlides = prev.filter(s => s.id !== id);
      return newSlides.map((slide, index) => ({ ...slide, order: index }));
    });

    // تعديل الشريحة النشطة إذا لزم الأمر
    setActiveSlideIndex(prev => {
      const deletedIndex = slides.findIndex(s => s.id === id);
      if (deletedIndex < prev) return prev - 1;
      if (deletedIndex === prev && prev >= slides.length - 1) return Math.max(0, prev - 1);
      return prev;
    });

    return true;
  }, [slides, canRemoveSlide]);

  // تحديث شريحة
  const updateSlide = useCallback((id: string, updates: Partial<Slide>) => {
    setSlides(prev => prev.map(slide => 
      slide.id === id ? { ...slide, ...updates } : slide
    ));
  }, []);

  // تحديث بيانات شريحة
  const updateSlideData = useCallback((id: string, data: Partial<SlideData>) => {
    setSlides(prev => prev.map(slide => 
      slide.id === id ? { ...slide, data: { ...slide.data, ...data } } : slide
    ));
  }, []);

  // إعادة ترتيب الشرائح
  const reorderSlides = useCallback((fromIndex: number, toIndex: number) => {
    // لا يمكن نقل الشرائح المقفلة
    if (slides[fromIndex]?.isLocked) return;

    setSlides(prev => {
      const newSlides = [...prev];
      const [removed] = newSlides.splice(fromIndex, 1);
      newSlides.splice(toIndex, 0, removed);
      return newSlides.map((slide, index) => ({ ...slide, order: index }));
    });

    // تحديث الشريحة النشطة
    setActiveSlideIndex(toIndex);
  }, [slides]);

  // تعيين ترتيب الشرائح مباشرة (لـ Framer Motion Reorder)
  const setSlideOrder = useCallback((newOrder: Slide[]) => {
    // التحقق من أن الشرائح المقفلة لم تتحرك
    const lockedSlides = slides.filter(s => s.isLocked);
    const newLockedPositions = lockedSlides.map(ls => newOrder.findIndex(s => s.id === ls.id));
    const oldLockedPositions = lockedSlides.map(ls => slides.findIndex(s => s.id === ls.id));
    
    // إذا تحركت شريحة مقفلة، لا نقبل التغيير
    const lockedMoved = newLockedPositions.some((pos, i) => pos !== oldLockedPositions[i]);
    if (lockedMoved) return;

    setSlides(newOrder.map((slide, index) => ({ ...slide, order: index })));
  }, [slides]);

  // تكرار شريحة
  const duplicateSlide = useCallback((id: string): Slide | null => {
    const slide = slides.find(s => s.id === id);
    if (!slide || slide.isLocked) return null;

    const slideIndex = slides.findIndex(s => s.id === id);
    const existingOfType = slides.filter(s => s.type === slide.type).length;
    
    // إنشاء نسخة عميقة من بيانات الشريحة
    const duplicatedData = JSON.parse(JSON.stringify(slide.data));
    
    const newSlide: Slide = {
      id: generateId(),
      type: slide.type,
      title: `${slide.title} (نسخة)`,
      order: slideIndex + 1,
      data: duplicatedData,
      isLocked: false, // النسخ لا تكون مقفلة
    };

    // تحديث ID الغرفة إذا كانت شريحة غرفة
    if (newSlide.data.room) {
      newSlide.data.room.room.id = newSlide.id;
      newSlide.data.room.room.number = existingOfType + 1;
      // إنشاء IDs جديدة لكل العناصر لتجنب التكرار
      newSlide.data.room.room.items = newSlide.data.room.room.items.map((item: { id: string; name: string; icon: string; price: number; quantity: number }) => ({
        ...item,
        id: `${item.id.split('-')[0]}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      }));
    }

    setSlides(prev => {
      const newSlides = [...prev];
      newSlides.splice(slideIndex + 1, 0, newSlide);
      return newSlides.map((s, index) => ({ ...s, order: index }));
    });

    setActiveSlideIndex(slideIndex + 1);

    return newSlide;
  }, [slides]);

  // الحصول على شرائح من نوع معين
  const getSlideByType = useCallback((type: SlideType): Slide[] => {
    return slides.filter(s => s.type === type);
  }, [slides]);

  // حساب التكلفة الإجمالية
  const getTotalCost = useCallback((): number => {
    return slides.reduce((total, slide) => {
      if (slide.data.room) {
        return total + slide.data.room.room.totalCost;
      }
      return total;
    }, 0);
  }, [slides]);

  // الحصول على جميع الغرف
  const getRooms = useCallback((): RoomData[] => {
    return slides
      .filter(s => s.data.room)
      .map(s => s.data.room!.room);
  }, [slides]);

  // إنشاء شرائح الغرف بناءً على تكوين الشقة
  const generateRoomSlides = useCallback((roomCounts: { 
    bedrooms: number; 
    livingRooms: number; 
    kitchens: number; 
    bathrooms: number 
  }) => {
    // البحث عن موقع شريحة room-setup لإضافة الشرائح بعدها
    const roomSetupIndex = slides.findIndex(s => s.type === 'room-setup');
    if (roomSetupIndex === -1) return;

    // حذف الشرائح القديمة للغرف وجميع الشرائح اللاحقة (سنعيد إنشاءها)
    const slidesToRemove: SlideType[] = [
      'kitchen', 'bedroom', 'living-room', 'bathroom',
      'cost-summary', 'area-study', 'map', 'nearby-apartments', 'statistics', 'footer'
    ];
    const slidesWithoutRoomsAndOthers = slides.filter(s => !slidesToRemove.includes(s.type));

    // إنشاء الشرائح الجديدة
    const newSlides: Slide[] = [];
    let slideOrder = roomSetupIndex + 1;

    // المطابخ
    for (let i = 1; i <= roomCounts.kitchens; i++) {
      newSlides.push({
        id: generateId(),
        type: 'kitchen',
        title: roomCounts.kitchens === 1 ? 'المطبخ' : `المطبخ ${i}`,
        order: slideOrder++,
        data: {
          room: {
            room: {
              id: `kitchen-${i}`,
              type: 'kitchen',
              name: roomCounts.kitchens === 1 ? 'المطبخ' : `مطبخ ${i}`,
              number: roomCounts.kitchens === 1 ? 0 : i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // غرف النوم
    for (let i = 1; i <= roomCounts.bedrooms; i++) {
      newSlides.push({
        id: generateId(),
        type: 'bedroom',
        title: `غرفة نوم ${i}`,
        order: slideOrder++,
        data: {
          room: {
            room: {
              id: `bedroom-${i}`,
              type: 'bedroom',
              name: `غرفة نوم ${i}`,
              number: i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // الصالات
    for (let i = 1; i <= roomCounts.livingRooms; i++) {
      newSlides.push({
        id: generateId(),
        type: 'living-room',
        title: roomCounts.livingRooms === 1 ? 'الصالة' : `الصالة ${i}`,
        order: slideOrder++,
        data: {
          room: {
            room: {
              id: `living-room-${i}`,
              type: 'living-room',
              name: roomCounts.livingRooms === 1 ? 'الصالة' : `صالة ${i}`,
              number: roomCounts.livingRooms === 1 ? 0 : i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // الحمامات
    for (let i = 1; i <= roomCounts.bathrooms; i++) {
      newSlides.push({
        id: generateId(),
        type: 'bathroom',
        title: roomCounts.bathrooms === 1 ? 'الحمام' : `الحمام ${i}`,
        order: slideOrder++,
        data: {
          room: {
            room: {
              id: `bathroom-${i}`,
              type: 'bathroom',
              name: roomCounts.bathrooms === 1 ? 'الحمام' : `حمام ${i}`,
              number: roomCounts.bathrooms === 1 ? 0 : i,
              items: [],
              totalCost: 0,
            },
            showImage: false,
            imagePosition: 'right',
          },
        },
      });
    }

    // إضافة شريحة ملخص التكاليف
    newSlides.push({
      id: generateId(),
      type: 'cost-summary',
      title: 'ملخص التكاليف',
      order: slideOrder++,
      data: {
        costSummary: {
          rooms: [],
          additionalCosts: [],
          discount: 0,
        },
      },
    });

    // إضافة شريحة دراسة المنطقة
    newSlides.push({
      id: generateId(),
      type: 'area-study',
      title: 'دراسة المنطقة',
      order: slideOrder++,
      data: {
        areaStudy: {
          title: 'دراسة المناطق المحيطة',
          description: 'تحليل شامل للشقق المحيطة وأسعار الإيجار في المنطقة.',
        },
      },
    });

    // إضافة شريحة الخريطة
    newSlides.push({
      id: generateId(),
      type: 'map',
      title: 'الخريطة',
      order: slideOrder++,
      data: {
        map: {
          center: { lat: 30.0444, lng: 31.2357 }, // القاهرة افتراضياً
          zoom: 14,
          pins: [],
        },
      },
    });

    // إضافة شريحة الشقق المحيطة
    newSlides.push({
      id: generateId(),
      type: 'nearby-apartments',
      title: 'الشقق المحيطة',
      order: slideOrder++,
      data: {
        nearbyApartments: {
          apartments: [],
          showFromMap: true,
        },
      },
    });

    // إضافة شريحة الإحصائيات
    newSlides.push({
      id: generateId(),
      type: 'statistics',
      title: 'الإحصائيات',
      order: slideOrder++,
      data: {
        statistics: {
          totalCost: 0,
          averageRent: 0,
          roomsCost: [],
          comparisonData: [],
        },
      },
    });

    // إضافة شريحة الخاتمة
    newSlides.push({
      id: generateId(),
      type: 'footer',
      title: 'الخاتمة',
      order: slideOrder++,
      data: {
        footer: {
          message: 'شكراً لثقتكم بنا',
          contactInfo: {
            phone: '',
            email: 'info@moftahak.com',
            website: 'www.moftahak.com',
            whatsapp: '',
          },
          socialLinks: {},
        },
      },
      isLocked: true,
    });

    // دمج الشرائح: قبل room-setup + room-setup + شرائح الغرف الجديدة + الشرائح الأخرى
    const beforeRoomSetup = slidesWithoutRoomsAndOthers.slice(0, roomSetupIndex + 1);

    const finalSlides = [
      ...beforeRoomSetup,
      ...newSlides,
    ].map((slide, index) => ({ ...slide, order: index }));

    setSlides(finalSlides);

    // الانتقال لأول شريحة غرفة
    if (newSlides.length > 0) {
      setActiveSlideIndex(roomSetupIndex + 1);
    }
  }, [slides]);

  return {
    slides,
    setSlides,
    activeSlideIndex,
    activeSlide,
    setActiveSlideIndex,
    addSlide,
    removeSlide,
    updateSlide,
    updateSlideData,
    reorderSlides,
    setSlideOrder,
    duplicateSlide,
    getSlideByType,
    canRemoveSlide,
    getTotalCost,
    getRooms,
    generateRoomSlides,
  };
}

export default useSlides;
