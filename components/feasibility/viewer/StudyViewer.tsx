'use client';

import React from 'react';
import { motion } from 'framer-motion';
import type { Slide, SlideData } from '@/types/feasibility';
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
  };
}

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  document: 'rgba(16, 48, 43, 0.15) 0px 25px 50px -12px, rgba(237, 191, 140, 0.1) 0px 0px 0px 1px',
};

// ============================================
//  MAIN COMPONENT
// ============================================

const StudyViewer: React.FC<StudyViewerProps> = ({ study }) => {
  const { slides, studyType = 'WITH_FIELD_VISIT' } = study;
  const isWithFieldVisit = studyType === 'WITH_FIELD_VISIT';
  
  // أنواع الشرائح المخفية للنوع بدون نزول ميداني
  const hiddenSlideTypes = isWithFieldVisit ? [] : ['kitchen', 'bedroom', 'living-room', 'bathroom', 'cost-summary'];
  
  // ترتيب الشرائح حسب الترتيب وفلترة حسب النوع
  const sortedSlides = [...slides]
    .filter(slide => !hiddenSlideTypes.includes(slide.type))
    .sort((a, b) => a.order - b.order);

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
        
        // جمع بيانات الشقق المحيطة للمقارنة
        const mapSlideForStats = sortedSlides.find(s => s.type === 'map');
        const apartmentsFromMap = mapSlideForStats?.data?.map?.pins?.map((pin: { apartment: { price: number; name: string } }) => pin.apartment) || [];
        
        const nearbyApartmentsForAverage = apartmentsFromMap.slice(1);
        const apartmentPrices = nearbyApartmentsForAverage.filter((a: { price: number }) => a.price > 0).map((a: { price: number }) => a.price);
        const averageRentFromApartments = apartmentPrices.length > 0 
          ? Math.round(apartmentPrices.reduce((sum: number, p: number) => sum + p, 0) / apartmentPrices.length)
          : 0;
        
        const comparisonFromApartments = nearbyApartmentsForAverage
          .filter((a: { price: number; name: string }) => a.price > 0)
          .slice(0, 6)
          .map((a: { name: string; price: number }) => ({ label: a.name, value: a.price }));
        
        const statisticsWithData = {
          totalCost: totalCostFromRooms,
          averageRent: slide.data.statistics?.averageRent || averageRentFromApartments,
          roomsCost: roomsCostForStats,
          comparisonData: comparisonFromApartments.length > 0 
            ? comparisonFromApartments 
            : (slide.data.statistics?.comparisonData || []),
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
    <div 
      className="min-h-screen py-8 px-4 sm:px-6 lg:px-8"
      style={{ backgroundColor: '#ead3b9' }}
      dir="rtl"
    >
      {/* الوثيقة / PDF */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-275 mx-auto overflow-hidden study-viewer-document border-2"
        style={{
          boxShadow: SHADOWS.document,
          borderRadius: '16px',
          backgroundColor: '#fdf6ee',
          borderColor: '#d4b896',
        }}
      >
        <style jsx global>{`
          .study-viewer-document [class*="bg-linear-to-br"][class*="from-accent"] {
            background-image: none !important;
            background-color: transparent !important;
          }
          .study-viewer-document .pb-24 {
            padding-bottom: 2rem !important;
          }
        `}</style>
        {/* الشرائح */}
        {sortedSlides.map((slide, index) => (
          <motion.div
            key={slide.id}
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-50px' }}
            transition={{ 
              duration: 0.5, 
              delay: index === 0 ? 0 : 0.1,
              ease: [0.25, 0.46, 0.45, 0.94]
            }}
          >
            {/* دوائر زخرفية خلف القسم */}
            {slide.type !== 'cover' && slide.type !== 'footer' && (
              <>
                <motion.div 
                  className="absolute -top-16 -right-16 w-72 h-72 bg-primary/30 rounded-full blur-3xl pointer-events-none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                />
                <motion.div 
                  className="absolute -bottom-16 -left-16 w-80 h-80 bg-primary/25 rounded-full blur-3xl pointer-events-none"
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                />
              </>
            )}
            {/* الغلاف بتنسيق خاص */}
            {slide.type === 'cover' ? (
              <div
                className="overflow-hidden"
                style={{
                  margin: '16px',
                  borderRadius: '16px',
                  boxShadow: 'rgba(16, 48, 43, 0.2) 0px 15px 40px -10px, rgba(237, 191, 140, 0.15) 0px 0px 0px 1px',
                }}
              >
                {renderSlideContent(slide, index)}
              </div>
            ) : (
              <div>
                {renderSlideContent(slide, index)}
              </div>
            )}
          </motion.div>
        ))}
      </motion.div>

      {/* Footer */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
        className="text-center mt-8 text-secondary/50 font-dubai text-sm"
      >
        <p>تم إنشاء هذه الدراسة بواسطة منصة مفتاحك</p>
        <p className="mt-1">© {new Date().getFullYear()} Moftahak. جميع الحقوق محفوظة</p>
      </motion.div>
    </div>
  );
};

export default StudyViewer;
