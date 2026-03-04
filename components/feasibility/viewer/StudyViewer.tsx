'use client';

import React, { useState, useMemo, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Menu, 
  X,
  FileText,
  Home,
  ChefHat,
  Bed,
  Sofa,
  Bath,
  DollarSign,
  MapPin,
  Building2,
  BarChart3,
  Settings,
  Layers
} from 'lucide-react';
import type { Slide, SlideData, SlideType } from '@/types/feasibility';
import CoverSlide from '@/components/feasibility/slides/CoverSlide';
import IntroductionSlide from '@/components/feasibility/slides/IntroductionSlide';
import CostSummarySlide from '@/components/feasibility/slides/CostSummarySlide';
import AreaStudyIntroSlide from '@/components/feasibility/slides/AreaStudyIntroSlide';
import FooterSlide from '@/components/feasibility/slides/FooterSlide';
import { 
  RoomSetupSlide, 
  KitchenSlide, 
  BedroomSlide, 
  LivingRoomSlide, 
  BathroomSlide, 
  MapSlide, 
  NearbyApartmentsSlide, 
  StatisticsSlide
} from '@/components/feasibility/elements';
import { ViewerCurrencyProvider } from './CurrencyContext';
import type { CurrencyCode } from '@/lib/feasibility/currency';

// ============================================
// 📋 TYPES
// ============================================

interface StudyViewerProps {
  study: {
    id: string;
    title: string;
    clientName: string;
    slides: Slide[];
    totalCost: number;
    createdAt: string;
    studyType?: 'WITH_FIELD_VISIT' | 'WITHOUT_FIELD_VISIT';
    currency?: CurrencyCode;
  };
}

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  document: 'rgba(16, 48, 43, 0.15) 0px 25px 50px -12px, rgba(237, 191, 140, 0.1) 0px 0px 0px 1px',
  slide: 'rgba(16, 48, 43, 0.12) 0px 10px 30px -5px, rgba(237, 191, 140, 0.1) 0px 0px 0px 1px',
  slideHover: 'rgba(16, 48, 43, 0.18) 0px 15px 40px -5px, rgba(237, 191, 140, 0.15) 0px 0px 0px 1px',
  sidebar: 'rgba(16, 48, 43, 0.15) 0px 10px 40px -10px',
};

// أيقونات أنواع الشرائح (نفس المحرر)
const slideIcons: Record<SlideType, React.ElementType> = {
  cover: FileText,
  introduction: Home,
  'room-setup': Settings,
  kitchen: ChefHat,
  bathroom: Bath,
  bedroom: Bed,
  'living-room': Sofa,
  'cost-summary': DollarSign,
  'area-study': MapPin,
  map: MapPin,
  'nearby-apartments': Building2,
  statistics: BarChart3,
  footer: FileText,
};

// ألوان الشرائح (نفس المحرر)
const slideColors: Record<SlideType, string> = {
  cover: 'bg-secondary',
  introduction: 'bg-primary/20',
  'room-setup': 'bg-blue-100',
  kitchen: 'bg-orange-100',
  bathroom: 'bg-cyan-100',
  bedroom: 'bg-purple-100',
  'living-room': 'bg-green-100',
  'cost-summary': 'bg-yellow-100',
  'area-study': 'bg-rose-100',
  map: 'bg-emerald-100',
  'nearby-apartments': 'bg-teal-100',
  statistics: 'bg-indigo-100',
  footer: 'bg-secondary',
};

// ============================================
//  MAIN COMPONENT
// ============================================

const StudyViewer: React.FC<StudyViewerProps> = ({ study }) => {
  const { slides, studyType = 'WITH_FIELD_VISIT', currency = 'EGP' } = study;
  const isWithFieldVisit = studyType === 'WITH_FIELD_VISIT';
  
  // حالة الشريط الجانبي
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSlideId, setActiveSlideId] = useState<string | null>(null);
  
  // حساب ديناميكي لموضع الدراسة وعرضها
  const [contentOffset, setContentOffset] = useState(0);
  const [studyMaxWidth, setStudyMaxWidth] = useState<string>('max-w-275');
  
  // ثوابت القائمة الجانبية
  const SIDEBAR_WIDTH = 288; // w-72 = 18rem = 288px
  const SIDEBAR_RIGHT = 32; // right-8 = 2rem = 32px
  const SIDEBAR_GAP = 24; // مسافة آمنة بين القائمة والدراسة
  const STUDY_MAX_WIDTH = 1100; // max-w-275 = 275 * 4 = 1100px
  const LEFT_SAFE_MARGIN = 32; // مسافة آمنة من اليسار
  
  const calculateOffset = useCallback(() => {
    if (typeof window === 'undefined') return;
    
    const screenWidth = window.innerWidth;
    const isDesktop = screenWidth >= 1280; // xl breakpoint - القائمة الجانبية تظهر فقط على xl وأكبر
    
    if (!isDesktop) {
      setContentOffset(0);
      setStudyMaxWidth('max-w-275');
      return;
    }
    
    // موقع الحافة اليسرى للقائمة الجانبية
    const sidebarLeftEdge = screenWidth - SIDEBAR_RIGHT - SIDEBAR_WIDTH;
    
    // المساحة المتاحة للدراسة (من اليسار حتى القائمة)
    const availableWidth = sidebarLeftEdge - SIDEBAR_GAP - LEFT_SAFE_MARGIN;
    
    // موقع الدراسة إذا كانت في المنتصف
    const studyWidth = Math.min(STUDY_MAX_WIDTH, screenWidth - 64); // مع padding
    const studyCenterPosition = (screenWidth - studyWidth) / 2;
    const studyRightEdge = studyCenterPosition + studyWidth;
    
    // هل ستتداخل؟
    const wouldOverlap = studyRightEdge + SIDEBAR_GAP > sidebarLeftEdge;
    
    if (wouldOverlap) {
      // هل المساحة المتاحة أصغر من عرض الدراسة؟
      if (availableWidth < studyWidth) {
        // صغّر الدراسة لتناسب المساحة المتاحة
        const newMaxWidth = Math.max(availableWidth, 600); // حد أدنى 600px
        setStudyMaxWidth(`${newMaxWidth}px`);
        setContentOffset(0); // لا إزاحة، الدراسة ستتمركز في المساحة المتاحة تلقائياً
        
        // احسب الإزاحة لتكون في منتصف المساحة المتاحة
        const currentCenterPosition = (screenWidth - newMaxWidth) / 2;
        const targetCenterPosition = LEFT_SAFE_MARGIN + (availableWidth - newMaxWidth) / 2;
        const offset = currentCenterPosition - targetCenterPosition;
        setContentOffset(Math.max(0, offset));
      } else {
        // احسب الإزاحة لجعل الدراسة في منتصف المساحة المتبقية
        setStudyMaxWidth('max-w-275');
        const newCenterPosition = LEFT_SAFE_MARGIN + (availableWidth - studyWidth) / 2;
        const offset = studyCenterPosition - newCenterPosition;
        setContentOffset(Math.max(0, offset));
      }
    } else {
      setContentOffset(0);
      setStudyMaxWidth('max-w-275');
    }
  }, []);
  
  useEffect(() => {
    calculateOffset();
    window.addEventListener('resize', calculateOffset);
    return () => window.removeEventListener('resize', calculateOffset);
  }, [calculateOffset]);
  
  // أنواع الشرائح المخفية للنوع بدون نزول ميداني
  const hiddenSlideTypes = isWithFieldVisit ? [] : ['kitchen', 'bedroom', 'living-room', 'bathroom', 'cost-summary'];
  
  // ترتيب الشرائح حسب الترتيب وفلترة حسب النوع
  const sortedSlides = useMemo(() => [...slides]
    .filter(slide => !hiddenSlideTypes.includes(slide.type))
    .sort((a, b) => a.order - b.order), [slides, hiddenSlideTypes]);

  // التمرير إلى شريحة معينة
  const scrollToSlide = (slideId: string) => {
    const element = document.getElementById(`slide-${slideId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      setActiveSlideId(slideId);
      setIsSidebarOpen(false);
    }
  };

  // مكون عنصر الشريحة في القائمة (نفس تصميم المحرر)
  const SlideItem: React.FC<{ slide: Slide; index: number }> = ({ slide, index }) => {
    const Icon = slideIcons[slide.type];
    const isActive = activeSlideId === slide.id;

    return (
      <div
        onClick={() => scrollToSlide(slide.id)}
        className={`
          relative w-full p-3 lg:p-2.5 flex items-center gap-3 lg:gap-2.5 cursor-pointer group rounded-xl overflow-hidden border-2 transition-all duration-200
          ${isActive 
            ? 'bg-primary/10 border-primary/30 shadow-[0_4px_20px_rgba(237,191,140,0.25)]' 
            : 'bg-white border-primary/20 hover:shadow-[0_4px_20px_rgba(237,191,140,0.15)] hover:scale-[1.02] active:scale-[0.98]'
          }
        `}
        style={{ boxShadow: isActive ? 'rgba(237, 191, 140, 0.25) 0px 4px 20px' : undefined }}
      >
        {/* أيقونة خلفية شفافة */}
        <div className="absolute -top-1 -left-1 opacity-[0.10] pointer-events-none">
          <Icon className="w-14 h-14 lg:w-12 lg:h-12 text-primary" />
        </div>
        
        {/* تأثير التحويم */}
        <div 
          className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity duration-300"
          style={{ 
            background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
            transform: 'translateX(-100%)',
          }}
        />
        
        <div className="flex items-center gap-3 lg:gap-2.5 relative z-10 w-full">
          {/* معاينة الشريحة */}
          <div className="w-12 h-12 lg:w-9 lg:h-9 bg-primary/20 flex items-center justify-center rounded-lg border border-primary/30 shrink-0">
            <Icon className="w-6 h-6 lg:w-4 lg:h-4 text-primary" />
          </div>

          {/* معلومات الشريحة */}
          <div className="flex-1 min-w-0 text-right">
            <span className="text-base lg:text-sm font-dubai font-bold block truncate text-secondary">
              {slide.title}
            </span>
            <span className="text-sm lg:text-xs text-secondary/60 block">
              شريحة {index + 1}
            </span>
          </div>
        </div>
      </div>
    );
  };

  // عرض محتوى الشريحة
  const renderSlideContent = (slide: Slide, index: number) => {
    // بيانات افتراضية
    const defaultIntroData = {
      title: 'دراسة الجدوى الخاصة بك',
      description: 'تم إعداد هذه الدراسة خصيصاً لمساعدتك في تجهيز شقتك للإيجار السياحي.',
      bulletPoints: ['تحليل شامل لاحتياجات الشقة', 'تكلفة تقديرية للتجهيزات', 'دراسة المنطقة المحيطة'],
    };

    const defaultRoomSetupData = {
      rooms: { bedrooms: 1, livingRooms: 1, kitchens: 1, bathrooms: 1 },
    };

    const defaultKitchenData = {
      room: { id: 'kitchen-1', type: 'kitchen' as const, name: 'المطبخ', number: 0, items: [], totalCost: 0 },
      showImage: false,
      imagePosition: 'right' as const,
    };

    const defaultBedroomData = {
      room: { id: 'bedroom-1', type: 'bedroom' as const, name: 'غرفة نوم 1', number: 1, items: [], totalCost: 0 },
      showImage: false,
      imagePosition: 'right' as const,
    };

    const defaultLivingRoomData = {
      room: { id: 'living-room-1', type: 'living-room' as const, name: 'الصالة', number: 1, items: [], totalCost: 0 },
      showImage: false,
      imagePosition: 'right' as const,
    };

    const defaultBathroomData = {
      room: { id: 'bathroom-1', type: 'bathroom' as const, name: 'الحمام', number: 1, items: [], totalCost: 0 },
      showImage: false,
      imagePosition: 'right' as const,
    };

    const defaultCostSummaryData = { rooms: [], additionalCosts: [], discount: 0 };

    const defaultMapData = {
      center: { lat: 30.0444, lng: 31.2357 },
      zoom: 13,
      pins: [],
    };

    switch (slide.type) {
      case 'cover':
        return (
          <CoverSlide
            data={slide.data.cover || { clientName: study.clientName, studyTitle: study.title }}
            isEditing={false}
          />
        );
      
      case 'introduction':
        return (
          <IntroductionSlide
            data={slide.data.introduction || defaultIntroData}
            isEditing={false}
            clientName={study.clientName}
          />
        );
      
      case 'room-setup':
        return (
          <RoomSetupSlide
            data={slide.data.roomSetup || defaultRoomSetupData}
            isEditing={false}
          />
        );
      
      case 'kitchen':
        return (
          <KitchenSlide
            key={slide.id}
            data={slide.data.room || defaultKitchenData}
            isEditing={false}
            roomNumber={slide.data.room?.room?.number || 1}
          />
        );
      
      case 'bedroom':
        return (
          <BedroomSlide
            key={slide.id}
            data={slide.data.room || defaultBedroomData}
            isEditing={false}
            roomNumber={slide.data.room?.room?.number || 1}
          />
        );
      
      case 'living-room':
        return (
          <LivingRoomSlide
            key={slide.id}
            data={slide.data.room || defaultLivingRoomData}
            isEditing={false}
            roomNumber={slide.data.room?.room?.number || 1}
          />
        );
      
      case 'bathroom':
        return (
          <BathroomSlide
            key={slide.id}
            data={slide.data.room || defaultBathroomData}
            isEditing={false}
            roomNumber={slide.data.room?.room?.number || 1}
          />
        );
      
      case 'cost-summary':
        // جمع بيانات الغرف من جميع شرائح الغرف
        const roomSlides = sortedSlides.filter(s => 
          ['kitchen', 'bedroom', 'living-room', 'bathroom'].includes(s.type) && s.data.room?.room
        );
        const collectedRooms = roomSlides.map(s => s.data.room!.room);
        
        const costSummaryWithRooms = {
          ...defaultCostSummaryData,
          ...slide.data.costSummary,
          rooms: collectedRooms,
        };
        
        return (
          <CostSummarySlide
            data={costSummaryWithRooms}
            isEditing={false}
          />
        );
      
      case 'area-study':
        return (
          <AreaStudyIntroSlide
            data={slide.data.areaStudy || { title: 'دراسة المنطقة المحيطة', description: '' }}
            isEditing={false}
          />
        );
      
      case 'map':
        return (
          <MapSlide
            data={slide.data.map || defaultMapData}
            isEditing={false}
          />
        );
      
      case 'nearby-apartments':
        const mapSlide = sortedSlides.find(s => s.type === 'map');
        const mapDataForApartments = mapSlide?.data?.map;
        return (
          <NearbyApartmentsSlide
            data={slide.data.nearbyApartments || { apartments: [] }}
            mapData={mapDataForApartments}
            isEditing={false}
          />
        );
      
      case 'statistics':
        // جمع بيانات الغرف تلقائياً للإحصائيات
        const roomSlidesForStats = sortedSlides.filter(s => 
          ['kitchen', 'bedroom', 'living-room', 'bathroom'].includes(s.type) && s.data.room?.room
        );
        const roomsCostForStats = roomSlidesForStats.map(s => ({
          name: s.data.room!.room.name,
          cost: s.data.room!.room.totalCost,
        }));
        const totalCostFromRooms = roomsCostForStats.reduce((sum, r) => sum + r.cost, 0);
        
        // حساب إحصائيات المنطقة تلقائياً من الشقق المجاورة
        // جلب بيانات الخريطة والشقق المحفوظة
        const nearbyApartmentsSlideForStats = sortedSlides.find(s => s.type === 'nearby-apartments');
        const mapSlideForStatsViewer = sortedSlides.find(s => s.type === 'map');
        const savedApartmentsForStats = nearbyApartmentsSlideForStats?.data.nearbyApartments?.apartments || [];
        const mapPinsForStats = mapSlideForStatsViewer?.data?.map?.pins || [];
        
        // دمج بيانات الخريطة مع البيانات المحفوظة (نفس المنطق في NearbyApartmentsSlide)
        let nearbyApartmentsForStats: typeof savedApartmentsForStats = [];
        if (mapPinsForStats.length > 0) {
          nearbyApartmentsForStats = mapPinsForStats
            .filter((pin: any) => pin.apartment)
            .map((pin: any) => {
              const savedApartment = savedApartmentsForStats.find(a => a.id === pin.apartment.id);
              return {
                ...pin.apartment,
                price: savedApartment?.price ?? pin.apartment.price ?? 0,
                occupancy: savedApartment?.occupancy ?? pin.apartment.occupancy ?? 0,
                isClientApartment: pin.apartment.isClientApartment,
              };
            });
        } else {
          nearbyApartmentsForStats = savedApartmentsForStats;
        }
        
        // استبعاد شقة العميل من الحسابات
        const otherApartmentsForStats = nearbyApartmentsForStats.filter(apt => !apt.isClientApartment);
        
        // حساب المتوسطات
        // الإيراد السنوي = 365 × (متوسط نسبة الإشغال / 100) × متوسط سعر الليلة
        const calculatedAreaStatsForViewer = otherApartmentsForStats.length > 0 ? {
          averageDailyRate: Math.round(otherApartmentsForStats.reduce((sum, apt) => sum + (apt.price || 0), 0) / otherApartmentsForStats.length),
          averageOccupancy: Math.round(otherApartmentsForStats.reduce((sum, apt) => sum + (apt.occupancy || 0), 0) / otherApartmentsForStats.length),
          get averageAnnualRevenue() {
            // استخدام متوسط السعر ومتوسط الإشغال المحسوبين
            return Math.round(365 * (this.averageOccupancy / 100) * this.averageDailyRate);
          }
        } : {
          averageDailyRate: 0,
          averageOccupancy: 0,
          averageAnnualRevenue: 0,
        };
        
        const statisticsWithData = {
          totalCost: totalCostFromRooms,
          averageRent: slide.data.statistics?.averageRent || 0,
          roomsCost: roomsCostForStats,
          operationalCosts: slide.data.statistics?.operationalCosts || [],
          areaStatistics: calculatedAreaStatsForViewer,
          monthlyOccupancy: slide.data.statistics?.monthlyOccupancy,
          year: slide.data.statistics?.year,
        };
        
        return (
          <StatisticsSlide
            data={statisticsWithData}
            isEditing={false}
            studyType={studyType}
          />
        );
      
      case 'footer':
        return (
          <FooterSlide
            data={slide.data.footer || { 
              message: 'شكراً لثقتكم بنا', 
              contactInfo: {
                phone: '', 
                email: 'info@moftahak.com', 
                website: 'www.moftahak.com', 
                whatsapp: ''
              },
              socialLinks: {}
            }}
            isEditing={false}
          />
        );
      
      default:
        return null;
    }
  };

  return (
    <ViewerCurrencyProvider currency={currency}>
    <div 
      className="min-h-screen"
      style={{ backgroundColor: '#ead3b9' }}
      dir="rtl"
    >
      {/* زر فتح الشريط الجانبي - للهاتف فقط */}
      <motion.button
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
        onClick={() => setIsSidebarOpen(true)}
        className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 px-6 py-3 rounded-full bg-white text-secondary hover:bg-primary/10 transition-all duration-300 hover:scale-105 xl:hidden flex items-center gap-2"
        style={{ boxShadow: 'rgba(16, 48, 43, 0.15) 0px 10px 40px, rgba(237, 191, 140, 0.3) 0px 0px 0px 1px' }}
        aria-label="فتح قائمة التنقل"
      >
        <Layers className="w-5 h-5" />
        <span className="font-dubai text-sm font-medium">الشرائح</span>
      </motion.button>

      {/* الشريط الجانبي - ثابت على الشاشات الكبيرة في منتصف Y على اليمين */}
      <aside className="hidden xl:flex fixed right-8 top-1/2 -translate-y-1/2 h-[calc(100vh-8rem)] max-h-[800px] w-72 bg-white shadow-[0_8px_30px_rgba(237,191,140,0.5)] border-2 border-primary/20 flex-col overflow-hidden z-40 rounded-2xl">
        {/* رأس الشريط الجانبي مع الشعار واسم العميل */}
        <div className="px-4 py-6 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent">
          <div className="flex items-center gap-3">
            {/* شعار المنصة */}
            <div className="w-7 h-7 relative shrink-0">
              <Image
                src="/logos/logo-dark-icon.png"
                alt="مفتاحك"
                fill
                className="object-contain"
                sizes="28px"
              />
            </div>
            {/* اسم الدراسة والعميل */}
            <div className="flex flex-col min-w-0 flex-1 mr-1">
              <span className="text-secondary font-dubai text-base truncate">دراسة جدوى</span>
              <span className="text-secondary/60 text-sm font-dubai truncate">{study.clientName}</span>
            </div>
          </div>
        </div>

        {/* قسم الشرائح */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* عنوان الشرائح */}
          <div className="px-4 py-2.5 bg-linear-to-br from-accent/30 to-transparent">
            <div className="flex items-center gap-2.5">
              <Layers className="w-5 h-5 text-secondary" />
              <h3 className="font-dubai font-medium text-base text-secondary">الشرائح</h3>
              <span className="text-sm mr-auto text-secondary/60 bg-primary/20 px-2.5 py-0.5 rounded-full">
                {sortedSlides.length}
              </span>
            </div>
          </div>
          
          {/* قائمة الشرائح */}
          <div className="flex-1 overflow-y-auto px-2.5 py-2" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <ul className="space-y-1.5">
              {sortedSlides.map((slide, index) => (
                <li key={slide.id}>
                  <SlideItem slide={slide} index={index} />
                </li>
              ))}
            </ul>
          </div>
        </div>
      </aside>

      {/* الشريط الجانبي المنبثق من الأسفل - للهاتف فقط */}
      <AnimatePresence>
        {isSidebarOpen && (
          <>
            {/* خلفية داكنة مع بلور خفيف */}
            <motion.div
              initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              animate={{ opacity: 1, backdropFilter: 'blur(4px)' }}
              exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
              transition={{ duration: 0.15 }}
              className="fixed inset-0 bg-black/25 z-40 xl:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
            
            {/* Bottom Sheet مع إمكانية السحب - منبثق مع مسافة من الجوانب */}
            <motion.aside
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              drag="y"
              dragConstraints={{ top: 0, bottom: 0 }}
              dragElastic={{ top: 0, bottom: 0.5 }}
              onDragEnd={(_, info) => {
                if (info.offset.y > 100 || info.velocity.y > 500) {
                  setIsSidebarOpen(false);
                }
              }}
              transition={{ type: 'spring', damping: 30, stiffness: 400 }}
              className="fixed bottom-4 left-4 right-4 h-[calc(100vh-6rem)] max-h-[70vh] bg-[#fefaf5] shadow-[0_-4px_30px_rgba(16,48,43,0.15)] flex flex-col overflow-hidden z-50 xl:hidden rounded-[1.5rem] touch-none"
            >
              {/* مقبض السحب */}
              <div className="flex justify-center py-2.5">
                <div className="w-16 h-1 bg-primary rounded-full" />
              </div>

              {/* رأس الشريط الجانبي مع الشعار واسم العميل */}
              <div className="px-4 py-3 border-b border-primary/20 bg-linear-to-br from-accent/30 to-transparent">
                <div className="flex items-center gap-3">
                  {/* شعار المنصة */}
                  <div className="w-7 h-7 relative shrink-0">
                    <Image
                      src="/logos/logo-dark-icon.png"
                      alt="مفتاحك"
                      fill
                      className="object-contain"
                      sizes="28px"
                    />
                  </div>
                  {/* اسم الدراسة والعميل */}
                  <div className="flex flex-col min-w-0 flex-1">
                    <span className="text-secondary font-dubai text-base truncate">دراسة جدوى</span>
                    <span className="text-secondary/60 text-sm font-dubai truncate">{study.clientName}</span>
                  </div>
                  {/* عدد الشرائح */}
                  <span className="text-sm text-secondary/60 bg-primary/20 px-2.5 py-0.5 rounded-full">
                    {sortedSlides.length}
                  </span>
                </div>
              </div>

              {/* قائمة الشرائح */}
              <div className="flex-1 overflow-y-auto px-3 py-3" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
                <style jsx>{`
                  div::-webkit-scrollbar {
                    display: none;
                  }
                `}</style>
                <ul className="space-y-2">
                  {sortedSlides.map((slide, index) => (
                    <li key={slide.id}>
                      <SlideItem slide={slide} index={index} />
                    </li>
                  ))}
                </ul>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* المحتوى الرئيسي - يتحرك ديناميكياً لتجنب القائمة */}
      <div 
        className="py-8 px-4 sm:px-6 lg:px-8 transition-all duration-300"
        style={{ transform: `translateX(-${contentOffset}px)` }}
      >
        {/* الوثيقة */}
        <div 
          className="mx-auto transition-all duration-300"
          style={{ maxWidth: studyMaxWidth.startsWith('max-w') ? '1100px' : studyMaxWidth }}
        >
          <style jsx global>{`
            .study-viewer-document .pb-24 {
              padding-bottom: 2rem !important;
            }
            .study-viewer-document [class*="bg-linear-to-br"][class*="from-accent"] {
              background-image: none !important;
              background-color: transparent !important;
            }
          `}</style>
          
          {/* الشرائح */}
          <div className="space-y-8">
            {sortedSlides.map((slide) => (
              <div
                key={slide.id}
                id={`slide-${slide.id}`}
                className="relative"
              >
                {/* حاوية الشريحة مع خلفية تدريجية بيج خفيفة */}
                <div
                  className="relative overflow-hidden study-viewer-document border transition-shadow duration-300 hover:shadow-[rgba(16,48,43,0.18)_0px_15px_40px_-5px,rgba(237,191,140,0.15)_0px_0px_0px_1px]"
                  style={{
                    borderRadius: '20px',
                    background: 'linear-gradient(135deg, #f8eddf 0%, #fdfbf7 50%, #faf0e5 100%)',
                    borderColor: 'rgba(212, 184, 150, 0.5)',
                    boxShadow: SHADOWS.slide,
                  }}
                >
                  {/* محتوى الشريحة */}
                  <div>
                    {renderSlideContent(slide, sortedSlides.indexOf(slide))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-secondary/50 font-dubai text-sm">
          <p>تم إنشاء هذه الدراسة بواسطة منصة مفتاحك</p>
          <p className="mt-1">© {new Date().getFullYear()} Moftahak. جميع الحقوق محفوظة</p>
        </div>
      </div>
    </div>
    </ViewerCurrencyProvider>
  );
};

export default StudyViewer;
