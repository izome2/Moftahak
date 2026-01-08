'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  FileText,
  Home,
  ChefHat,
  Bath,
  Bed,
  Sofa,
  MapPin,
  BarChart3,
  DollarSign,
  Settings,
  MousePointer2,
  Building2
} from 'lucide-react';
import type { Slide, SlideType, SlideData } from '@/types/feasibility';
import CoverSlide from './CoverSlide';
import IntroductionSlide from './IntroductionSlide';
import CostSummarySlide from './CostSummarySlide';
import AreaStudyIntroSlide from './AreaStudyIntroSlide';
import FooterSlide from './FooterSlide';
import { RoomSetupSlide, KitchenSlide, BedroomSlide, LivingRoomSlide, BathroomSlide, MapSlide, NearbyApartmentsSlide, StatisticsSlide } from '@/components/feasibility/elements';

// أيقونات الشرائح
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

interface SlideCanvasProps {
  slide: Slide;
  allSlides?: Slide[];
  zoom: number;
  isEditing?: boolean;
  onUpdateSlideData?: (data: Partial<SlideData>) => void;
  onGenerateRoomSlides?: (roomCounts: { bedrooms: number; livingRooms: number; kitchens: number; bathrooms: number }) => void;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({
  slide,
  allSlides = [],
  zoom,
  isEditing = true,
  onUpdateSlideData,
  onGenerateRoomSlides,
}) => {
  // أبعاد الشريحة الثابتة (عمودي قليلاً) - بغض النظر عن الـ zoom
  const SLIDE_WIDTH = 1100;
  const SLIDE_HEIGHT = 1200;

  // البيانات الافتراضية لشريحة المقدمة
  const defaultIntroData = {
    title: 'دراسة الجدوى الخاصة بك',
    description: 'تم إعداد هذه الدراسة خصيصاً لمساعدتك في تجهيز شقتك للإيجار السياحي. ستجد فيها كل ما تحتاجه من معلومات وتحليلات.',
    bulletPoints: [
      'تحليل شامل لاحتياجات الشقة',
      'تكلفة تقديرية للتجهيزات',
      'دراسة المنطقة المحيطة',
      'إحصائيات وتوقعات الإيجار',
    ],
  };

  // البيانات الافتراضية لشريحة إعداد الغرف
  const defaultRoomSetupData = {
    rooms: {
      bedrooms: 1,
      livingRooms: 1,
      kitchens: 1,
      bathrooms: 1,
    },
  };

  // البيانات الافتراضية لشريحة المطبخ
  const defaultKitchenData = {
    room: {
      id: 'kitchen-1',
      type: 'kitchen' as const,
      name: 'المطبخ',
      number: 0,
      items: [],
      totalCost: 0,
    },
    showImage: false,
    imagePosition: 'right' as const,
  };

  // البيانات الافتراضية لشريحة غرفة النوم
  const defaultBedroomData = {
    room: {
      id: 'bedroom-1',
      type: 'bedroom' as const,
      name: 'غرفة نوم 1',
      number: 1,
      items: [],
      totalCost: 0,
    },
    showImage: false,
    imagePosition: 'right' as const,
  };

  // البيانات الافتراضية لشريحة غرفة المعيشة
  const defaultLivingRoomData = {
    room: {
      id: 'living-room-1',
      type: 'living-room' as const,
      name: 'الصالة',
      number: 1,
      items: [],
      totalCost: 0,
    },
    showImage: false,
    imagePosition: 'right' as const,
  };

  // البيانات الافتراضية لشريحة الحمام
  const defaultBathroomData = {
    room: {
      id: 'bathroom-1',
      type: 'bathroom' as const,
      name: 'الحمام',
      number: 1,
      items: [],
      totalCost: 0,
    },
    showImage: false,
    imagePosition: 'right' as const,
  };

  // البيانات الافتراضية لشريحة ملخص التكاليف
  const defaultCostSummaryData = {
    rooms: [],
    additionalCosts: [],
    discount: 0,
  };

  // البيانات الافتراضية لشريحة الخريطة
  const defaultMapData = {
    center: {
      lat: 30.0444, // القاهرة
      lng: 31.2357,
    },
    zoom: 13,
    pins: [],
  };

  // عرض محتوى الشريحة بناءً على نوعها
  const renderSlideContent = () => {
    switch (slide.type) {
      case 'cover':
        return (
          <CoverSlide
            data={slide.data.cover || { clientName: 'اسم العميل', studyTitle: 'دراسة جدوى' }}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
          />
        );
      case 'introduction':
        return (
          <IntroductionSlide
            data={slide.data.introduction || defaultIntroData}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
          />
        );
      case 'room-setup':
        return (
          <RoomSetupSlide
            data={slide.data.roomSetup || defaultRoomSetupData}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
            onGenerateRoomSlides={onGenerateRoomSlides}
          />
        );
      case 'kitchen':
        return (
          <KitchenSlide
            data={slide.data.room ? { room: slide.data.room, showImage: false, imagePosition: 'right' } : defaultKitchenData}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
          />
        );
      case 'bedroom':
        return (
          <BedroomSlide
            data={slide.data.room ? { room: slide.data.room, showImage: false, imagePosition: 'right' } : defaultBedroomData}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
            roomNumber={slide.data.room?.room?.number || 1}
          />
        );
      case 'living-room':
        return (
          <LivingRoomSlide
            data={slide.data.room ? { room: slide.data.room, showImage: false, imagePosition: 'right' } : defaultLivingRoomData}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
            roomNumber={slide.data.room?.room?.number || 1}
          />
        );
      case 'bathroom':
        return (
          <BathroomSlide
            data={slide.data.room ? { room: slide.data.room, showImage: false, imagePosition: 'right' } : defaultBathroomData}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
            roomNumber={slide.data.room?.room?.number || 1}
          />
        );
      case 'cost-summary':
        return (
          <CostSummarySlide
            data={slide.data.costSummary || defaultCostSummaryData}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
          />
        );
      case 'area-study':
        return (
          <AreaStudyIntroSlide
            data={slide.data.areaStudy || { title: 'دراسة المنطقة المحيطة', description: '' }}
            isEditing={isEditing}
            onUpdate={onUpdateSlideData}
          />
        );
      case 'map':
        return (
          <MapSlide
            data={slide.data.map || defaultMapData}
            isEditing={isEditing}
            onUpdate={(data) => onUpdateSlideData?.({ map: data })}
          />
        );
      case 'nearby-apartments':
        // الحصول على بيانات الخريطة من الشرائح الأخرى
        const mapSlide = allSlides.find(s => s.type === 'map');
        const mapDataForApartments = mapSlide?.data?.map;
        return (
          <NearbyApartmentsSlide
            data={slide.data.nearbyApartments || { apartments: [] }}
            mapData={mapDataForApartments}
            isEditing={isEditing}
            onUpdate={(data) => onUpdateSlideData?.({ nearbyApartments: data })}
          />
        );
      case 'statistics':
        return (
          <StatisticsSlide
            data={slide.data.statistics || { totalCost: 0, averageRent: 0, roomsCost: [], comparisonData: [] }}
            isEditing={isEditing}
            onUpdate={(data) => onUpdateSlideData?.({ statistics: data })}
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
              socialLinks: {
                facebook: '',
                instagram: '',
                twitter: ''
              }
            }}
            isEditing={isEditing}
            onUpdate={(data) => onUpdateSlideData?.({ footer: data })}
          />
        );
      default:
        return <PlaceholderSlideContent slide={slide} />;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-white shadow-xl rounded-2xl relative overflow-hidden ring-1 ring-black/5"
      style={{
        width: `${SLIDE_WIDTH}px`,
      }}
    >
      {renderSlideContent()}

      {/* حدود الشريحة (للتحرير) - لا تظهر للشرائح ذات التصميم الكامل */}
      {isEditing && !['cover', 'introduction', 'room-setup', 'kitchen', 'bedroom', 'living-room', 'bathroom', 'cost-summary', 'area-study', 'map', 'nearby-apartments', 'statistics', 'footer'].includes(slide.type) && (
        <div className="absolute inset-0 border-2 border-dashed border-accent/30 pointer-events-none" />
      )}
    </motion.div>
  );
};

// ============================================
// محتوى الشريحة الافتراضي (placeholder)
// ============================================
interface PlaceholderProps {
  slide: Slide;
}

const PlaceholderSlideContent: React.FC<PlaceholderProps> = ({ slide }) => {
  const Icon = slideIcons[slide.type];

  return (
    <div className="absolute inset-0 bg-gradient-to-br from-accent/40 to-accent/20 flex flex-col items-center justify-center p-8" dir="rtl">
      <div className="text-center">
        <div className="w-20 h-20 mx-auto mb-6 bg-white/80 backdrop-blur-sm rounded-2xl shadow-medium flex items-center justify-center">
          <Icon className="w-10 h-10 text-secondary/50" />
        </div>
        <h2 className="text-2xl font-dubai font-bold text-secondary/70 mb-2">
          {slide.title}
        </h2>
        <p className="text-secondary/50 font-dubai">
          سيتم بناء محتوى هذه الشريحة في المراحل القادمة
        </p>
        
        <div className="mt-8 flex items-center justify-center gap-2 text-secondary/40 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full">
          <MousePointer2 className="w-5 h-5" />
          <span className="text-sm font-dubai">اسحب العناصر من الشريط الجانبي</span>
        </div>
      </div>
    </div>
  );
};

export default SlideCanvas;
