'use client';

/**
 * RoomSetupSlide - شريحة تكوين الشقة
 * 
 * تصميم احترافي مع:
 * - بطاقات بزوايا rounded-xl/2xl
 * - ظلال احترافية
 * - أيقونة خلفية كبيرة شفافة
 * - تأثير shimmer عند hover
 */

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { 
  Settings, 
  Home, 
  Sparkles, 
  Check, 
  Loader2,
  Bed,
  Sofa,
  ChefHat,
  Bath,
  Plus,
  Minus
} from 'lucide-react';
import type { RoomSetupSlideData, SlideData, RoomData, RoomType } from '@/types/feasibility';

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
  icon: 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
  modal: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
};

// ============================================
// 📋 TYPES & CONFIG
// ============================================

interface RoomSetupSlideProps {
  data: RoomSetupSlideData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<SlideData>) => void;
  onRoomsGenerated?: (rooms: RoomData[]) => void;
  onGenerateRoomSlides?: (roomCounts: { bedrooms: number; livingRooms: number; kitchens: number; bathrooms: number }) => void;
}

interface RoomCounts {
  bedroom: number;
  'living-room': number;
  kitchen: number;
  bathroom: number;
}

interface RoomTypeConfig {
  type: RoomType;
  name: string;
  namePlural: string;
  icon: React.ElementType;
  min: number;
  max: number;
}

const roomTypesConfig: RoomTypeConfig[] = [
  { type: 'bedroom', name: 'غرفة نوم', namePlural: 'غرف النوم', icon: Bed, min: 0, max: 6 },
  { type: 'living-room', name: 'صالة', namePlural: 'الصالات', icon: Sofa, min: 0, max: 3 },
  { type: 'kitchen', name: 'مطبخ', namePlural: 'المطابخ', icon: ChefHat, min: 0, max: 2 },
  { type: 'bathroom', name: 'حمام', namePlural: 'الحمامات', icon: Bath, min: 0, max: 4 },
];

const roomTypeNames: Record<RoomType, string> = {
  bedroom: 'غرفة نوم',
  'living-room': 'صالة',
  kitchen: 'مطبخ',
  bathroom: 'حمام',
};

const roomIcons: Record<RoomType, React.ElementType> = {
  bedroom: Bed,
  'living-room': Sofa,
  kitchen: ChefHat,
  bathroom: Bath,
};

// ============================================
// 🏠 GENERATED VIEW COMPONENT
// ============================================

interface RoomWidgetProps {
  icon: React.ElementType;
  title: string;
  count: number;
  delay: number;
}

const RoomWidget: React.FC<RoomWidgetProps> = ({ icon: Icon, title, count, delay }) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative rounded-2xl overflow-hidden bg-white border-2 border-primary/20 aspect-square flex flex-col items-center justify-center p-8"
      style={{ boxShadow: SHADOWS.card }}
    >
      {/* Shimmer */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
        }}
        initial={{ opacity: 0, x: '-100%' }}
        whileHover={{ opacity: 1, x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center gap-4">
        <motion.div 
          className="w-32 h-32 bg-primary/20 flex items-center justify-center rounded-2xl border-2 border-primary/30"
          whileHover={{ rotate: 5, scale: 1.1 }}
          style={{ boxShadow: SHADOWS.icon }}
        >
          <Icon className="w-24 h-24 text-primary" strokeWidth={1.5} />
        </motion.div>

        <motion.div 
          className="relative rounded-2xl overflow-hidden bg-white border-2 border-primary/20 px-6 py-3"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Shimmer للترقيم */}
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{
              background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
            }}
            initial={{ opacity: 0, x: '-100%' }}
            whileHover={{ opacity: 1, x: '100%' }}
            transition={{ duration: 0.6, ease: 'easeInOut' }}
          />
          <span className="relative z-10 block text-5xl font-bold text-secondary font-bristone">{count}</span>
        </motion.div>

        <h3 className="text-xl font-dubai font-bold text-secondary text-center">
          {title}
        </h3>
      </div>
    </motion.div>
  );
};

// Old RoomSection to be removed
interface RoomSectionProps {
  title: string;
  icon: React.ElementType;
  count: number;
  rooms: RoomData[];
  isReversed: boolean;
  delay: number;
}

const RoomSection: React.FC<RoomSectionProps> = ({ title, icon: Icon, count, rooms, isReversed, delay }) => {
  if (count === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      className={`flex items-center gap-6 ${isReversed ? 'flex-row-reverse' : ''}`}
    >
      {/* Title Side */}
      <div className={`flex-1 flex ${isReversed ? 'justify-start' : 'justify-end'}`}>
        <motion.div 
          className={`flex items-center gap-4 ${isReversed ? 'flex-row-reverse' : ''}`}
          whileHover={{ scale: 1.02 }}
        >
          <motion.div 
            className="w-16 h-16 bg-primary/20 flex items-center justify-center rounded-2xl border-2 border-primary/30"
            style={{ boxShadow: SHADOWS.icon }}
            whileHover={{ rotate: 5, scale: 1.1 }}
          >
            <Icon className="w-8 h-8 text-primary" strokeWidth={1.5} />
          </motion.div>
          <div className={isReversed ? 'text-left' : 'text-right'}>
            <h3 className="text-2xl font-dubai font-bold text-secondary">{title}</h3>
            <span className="text-sm text-secondary/60 font-dubai">{count} {count === 1 ? 'غرفة' : 'غرف'}</span>
          </div>
        </motion.div>
      </div>

      {/* Cards Side */}
      <div className="flex-1">
        <div className={`flex flex-wrap gap-3 ${isReversed ? 'justify-end' : 'justify-start'}`}>
          {rooms.map((room, index) => (
            <motion.div
              key={room.id}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: delay + 0.1 + index * 0.05 }}
              whileHover={{ scale: 1.05, y: -3 }}
              className="relative w-24 h-24 rounded-2xl overflow-hidden bg-white border-2 border-primary/20 group"
              style={{ boxShadow: SHADOWS.card }}
            >
              {/* Background Icon */}
              <div className="absolute inset-0 flex items-center justify-center opacity-[0.08] pointer-events-none">
                <Icon className="w-20 h-20 text-primary" strokeWidth={1.5} />
              </div>

              {/* Shimmer */}
              <motion.div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
                }}
                initial={{ opacity: 0, x: '-100%' }}
                whileHover={{ opacity: 1, x: '100%' }}
                transition={{ duration: 0.5 }}
              />

              {/* Content */}
              <div className="relative z-10 h-full flex flex-col items-center justify-center p-2">
                <motion.div 
                  className="w-10 h-10 bg-primary/20 flex items-center justify-center rounded-xl border border-primary/30 mb-1"
                  whileHover={{ rotate: 10 }}
                >
                  <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                </motion.div>
                <span className="font-dubai font-bold text-secondary text-xs text-center leading-tight">
                  {room.number > 0 ? `${room.number}` : ''}
                </span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// �🎯 MAIN COMPONENT
// ============================================

const RoomSetupSlide: React.FC<RoomSetupSlideProps> = ({
  data,
  isEditing = false,
  onUpdate,
  onRoomsGenerated,
  onGenerateRoomSlides,
}) => {
  const [roomCounts, setRoomCounts] = useState<RoomCounts>({
    bedroom: data.rooms?.bedrooms || 1,
    'living-room': data.rooms?.livingRooms || 1,
    kitchen: data.rooms?.kitchens || 1,
    bathroom: data.rooms?.bathrooms || 1,
  });

  const [generatedRooms, setGeneratedRooms] = useState<RoomData[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [hasGenerated, setHasGenerated] = useState(data.slidesGenerated || false);

  // إنشاء الغرف
  useEffect(() => {
    const rooms: RoomData[] = [];
    
    for (let i = 1; i <= roomCounts.bedroom; i++) {
      rooms.push({
        id: `bedroom-${i}`,
        type: 'bedroom',
        name: `غرفة نوم ${i}`,
        number: i,
        items: [],
        totalCost: 0,
      });
    }

    for (let i = 1; i <= roomCounts['living-room']; i++) {
      rooms.push({
        id: `living-room-${i}`,
        type: 'living-room',
        name: roomCounts['living-room'] === 1 ? 'الصالة' : `صالة ${i}`,
        number: roomCounts['living-room'] === 1 ? 0 : i,
        items: [],
        totalCost: 0,
      });
    }

    for (let i = 1; i <= roomCounts.kitchen; i++) {
      rooms.push({
        id: `kitchen-${i}`,
        type: 'kitchen',
        name: roomCounts.kitchen === 1 ? 'المطبخ' : `مطبخ ${i}`,
        number: roomCounts.kitchen === 1 ? 0 : i,
        items: [],
        totalCost: 0,
      });
    }

    for (let i = 1; i <= roomCounts.bathroom; i++) {
      rooms.push({
        id: `bathroom-${i}`,
        type: 'bathroom',
        name: roomCounts.bathroom === 1 ? 'الحمام' : `حمام ${i}`,
        number: roomCounts.bathroom === 1 ? 0 : i,
        items: [],
        totalCost: 0,
      });
    }

    setGeneratedRooms(rooms);
    if (onRoomsGenerated) onRoomsGenerated(rooms);
  }, [roomCounts, onRoomsGenerated]);

  const handleCountChange = (type: RoomType, delta: number) => {
    const config = roomTypesConfig.find((c) => c.type === type);
    if (!config) return;

    const currentCount = roomCounts[type];
    const newCount = Math.max(config.min, Math.min(config.max, currentCount + delta));

    if (newCount !== currentCount) {
      const newCounts = { ...roomCounts, [type]: newCount };
      setRoomCounts(newCounts);
      setHasGenerated(false);

      if (onUpdate) {
        onUpdate({
          roomSetup: {
            rooms: {
              bedrooms: newCounts.bedroom,
              livingRooms: newCounts['living-room'],
              kitchens: newCounts.kitchen,
              bathrooms: newCounts.bathroom,
            },
          },
        });
      }
    }
  };

  const handleGenerateSlides = () => {
    if (!onGenerateRoomSlides) return;
    
    setIsGenerating(true);
    setTimeout(() => {
      onGenerateRoomSlides({
        bedrooms: roomCounts.bedroom,
        livingRooms: roomCounts['living-room'],
        kitchens: roomCounts.kitchen,
        bathrooms: roomCounts.bathroom,
      });
      setIsGenerating(false);
      setHasGenerated(true);
      
      // حفظ حالة الإنشاء
      if (onUpdate) {
        onUpdate({
          roomSetup: {
            rooms: {
              bedrooms: roomCounts.bedroom,
              livingRooms: roomCounts['living-room'],
              kitchens: roomCounts.kitchen,
              bathrooms: roomCounts.bathroom,
            },
            slidesGenerated: true,
          },
        });
      }
    }, 500);
  };

  const totalRooms = Object.values(roomCounts).reduce((sum, count) => sum + count, 0);

  // تجميع الغرف حسب النوع
  const livingRooms = generatedRooms.filter(r => r.type === 'living-room');
  const bedrooms = generatedRooms.filter(r => r.type === 'bedroom');
  const kitchens = generatedRooms.filter(r => r.type === 'kitchen');
  const bathrooms = generatedRooms.filter(r => r.type === 'bathroom');


  if (hasGenerated) {
    return (
      <div className="relative bg-linear-to-br from-accent/30 via-white to-accent/20 overflow-hidden" style={{ minHeight: '1200px' }} dir="rtl">
        {/* Background Glow Effects */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

        {/* المحتوى الرئيسي */}
        <div className="relative h-full flex flex-col p-6 pt-16">
          {/* Header Card */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20 mb-6"
            style={{ boxShadow: SHADOWS.card }}
          >
            {/* Background Icon */}
            <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
              <Settings className="w-56 h-56 text-primary" strokeWidth={1.5} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-4">
                <motion.div 
                  className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <Settings className="w-8 h-8 text-primary" strokeWidth={2} />
                </motion.div>
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                    تكوين الشقة
                  </h2>
                  <p className="text-secondary/60 font-dubai text-sm">
                    تم إنشاء {totalRooms} غرفة بنجاح
                  </p>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center gap-4">
                <div className="text-center px-4 py-2 bg-accent/30 rounded-xl">
                  <span className="block text-2xl font-bold text-secondary font-bristone">{totalRooms}</span>
                  <span className="text-xs text-secondary/60 font-dubai">غرفة</span>
                </div>
              </div>
            </div>
          </motion.div>

          {/* الودجات - شبكة بسيطة */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-6 w-full max-w-3xl">
              <RoomWidget
                icon={Sofa}
                title="الصالات"
                count={roomCounts['living-room']}
                delay={0.1}
              />

              <RoomWidget
                icon={Bed}
                title="غرف النوم"
                count={roomCounts.bedroom}
                delay={0.2}
              />

              <RoomWidget
                icon={ChefHat}
                title="المطابخ"
                count={roomCounts.kitchen}
                delay={0.3}
              />

              <RoomWidget
                icon={Bath}
                title="الحمامات"
                count={roomCounts.bathroom}
                delay={0.4}
              />
            </div>
          </div>

          {/* النص السفلي */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5, delay: 0.5 }}
            className="mt-4 flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-green-500 rounded-full" />
              <span className="text-sm font-dubai font-bold text-secondary/60">
                تم تكوين الشقة بنجاح ✓
              </span>
            </div>
            
            <div className="flex items-center gap-1.5">
              <div className="w-10 h-1 bg-primary/30 rounded-full" />
              <div className="w-5 h-1 bg-primary/50 rounded-full" />
              <div className="w-3 h-1 bg-primary rounded-full" />
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  // ============================================
  // 🔧 SETUP VIEW - عرض التكوين
  // ============================================
  return (
    <div className="relative bg-linear-to-br from-accent/30 via-white to-accent/20 overflow-hidden" style={{ minHeight: '1200px' }} dir="rtl">
      {/* Background Glow Effects */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-secondary/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

      {/* المحتوى الرئيسي */}
      <div className="relative h-full flex flex-col p-6 pt-16">
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-5 sm:p-6 border-2 border-primary/20 mb-6"
          style={{ boxShadow: SHADOWS.card }}
        >
          {/* Background Icon */}
          <div className="absolute -top-6 -left-6 opacity-[0.08] pointer-events-none">
            <Settings className="w-48 h-48 text-primary" strokeWidth={1.5} />
          </div>

          <div className="relative z-10 flex items-center gap-4">
            <motion.div 
              className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
              whileHover={{ scale: 1.05, rotate: 5 }}
              style={{ boxShadow: SHADOWS.icon }}
            >
              <Settings className="w-7 h-7 text-primary" strokeWidth={2} />
            </motion.div>
            <div>
              <h1 className="text-2xl font-dubai font-bold text-secondary">
                تكوين شقة العميل
              </h1>
              <p className="text-sm text-secondary/60 font-dubai">
                حدد عدد ونوع الغرف في الشقة
              </p>
            </div>
            
            {/* Stats */}
            <div className="mr-auto flex items-center gap-3">
              <div className="text-center px-4 py-2 bg-accent/30 rounded-xl">
                <span className="block text-2xl font-bold text-secondary font-bristone">{totalRooms}</span>
                <span className="text-xs text-secondary/60 font-dubai">غرفة</span>
              </div>
            </div>
          </div>

          {/* الخط الزخرفي */}
          <div className="flex items-center gap-2 mt-4">
            <div className="w-20 h-1.5 bg-primary rounded-full" />
            <div className="w-6 h-1.5 bg-primary/50 rounded-full" />
            <div className="w-3 h-1.5 bg-primary/30 rounded-full" />
          </div>
        </motion.div>

        {/* المحتوى - تقسيم عمودين */}
        <div className="flex-1 grid grid-cols-2 gap-5">
          {/* العمود الأيمن - اختيار عدد الغرف */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-5 border-2 border-primary/20"
            style={{ boxShadow: SHADOWS.card }}
          >
            {/* Background Icon */}
            <div className="absolute -bottom-8 -left-8 opacity-[0.08] pointer-events-none">
              <Home className="w-56 h-56 text-primary" strokeWidth={1.5} />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-5">
                <motion.div 
                  className="p-3 rounded-xl bg-primary/20 border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <Home className="w-5 h-5 text-primary" />
                </motion.div>
                <h3 className="text-lg font-dubai font-bold text-secondary">
                  تكوين الشقة
                </h3>
              </div>

              {/* قائمة أنواع الغرف */}
              <div className="space-y-3">
                {roomTypesConfig.map((config, index) => {
                  const Icon = config.icon;
                  const count = roomCounts[config.type];
                  const canDecrease = count > config.min;
                  const canIncrease = count < config.max;

                  return (
                    <motion.div
                      key={config.type}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      whileHover={{ scale: 1.01, x: -2 }}
                      className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white p-4 border-2 border-primary/20 group"
                      style={{ boxShadow: SHADOWS.card }}
                    >
                      {/* Background Icon */}
                      <div className="absolute -top-2 -left-2 opacity-[0.10] pointer-events-none">
                        <Icon className="w-20 h-20 text-primary" strokeWidth={1.5} />
                      </div>

                      {/* Shimmer */}
                      <motion.div
                        className="absolute inset-0 pointer-events-none"
                        style={{
                          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
                        }}
                        initial={{ opacity: 0, x: '-100%' }}
                        whileHover={{ opacity: 1, x: '100%' }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                      />

                      <div className="flex items-center justify-between relative z-10">
                        <div className="flex items-center gap-3">
                          <motion.div 
                            className="w-11 h-11 bg-primary/20 flex items-center justify-center rounded-xl border-2 border-primary/30"
                            whileHover={{ scale: 1.1, rotate: 5 }}
                          >
                            <Icon className="w-5 h-5 text-primary" strokeWidth={2} />
                          </motion.div>
                          <span className="font-dubai font-bold text-secondary">
                            {config.namePlural}
                          </span>
                        </div>

                        {/* أزرار التحكم */}
                        <div className="flex items-center gap-2">
                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCountChange(config.type, -1)}
                            disabled={!isEditing || !canDecrease}
                            className={`
                              w-10 h-10 flex items-center justify-center rounded-xl
                              ${canDecrease && isEditing
                                ? 'bg-linear-to-br from-secondary to-secondary/80 text-white hover:opacity-90'
                                : 'bg-secondary/10 text-secondary/30 cursor-not-allowed'
                              }
                            `}
                            style={{ boxShadow: canDecrease && isEditing ? SHADOWS.button : 'none' }}
                          >
                            <Minus className="w-5 h-5" />
                          </motion.button>

                          <div className="w-14 h-10 flex items-center justify-center bg-accent/50 font-dubai font-bold text-secondary text-xl rounded-xl">
                            {count}
                          </div>

                          <motion.button
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                            onClick={() => handleCountChange(config.type, 1)}
                            disabled={!isEditing || !canIncrease}
                            className={`
                              w-10 h-10 flex items-center justify-center rounded-xl
                              ${canIncrease && isEditing
                                ? 'bg-primary text-secondary hover:bg-primary/80'
                                : 'bg-primary/20 text-secondary/30 cursor-not-allowed'
                              }
                            `}
                            style={{ boxShadow: canIncrease && isEditing ? SHADOWS.button : 'none' }}
                          >
                            <Plus className="w-5 h-5" />
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          </motion.div>

          {/* العمود الأيسر - الغرف المُنشأة */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-5 border-2 border-primary/20 flex flex-col"
            style={{ boxShadow: SHADOWS.card }}
          >
            {/* Background Icon */}
            <div className="absolute -bottom-8 -right-8 opacity-[0.08] pointer-events-none">
              <Home className="w-56 h-56 text-primary" strokeWidth={1.5} />
            </div>

            <div className="relative z-10 flex-1 flex flex-col">
              <div className="flex items-center gap-3 mb-5">
                <motion.div 
                  className="p-3 rounded-xl bg-primary/20 border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <Home className="w-5 h-5 text-primary" />
                </motion.div>
                <h3 className="text-lg font-dubai font-bold text-secondary">
                  الغرف المُنشأة
                </h3>
                <span className="mr-auto text-sm text-secondary/60 font-dubai bg-accent/50 px-3 py-1 rounded-full font-bold">
                  {generatedRooms.length} غرفة
                </span>
              </div>

              {/* قائمة الغرف */}
              <div className="flex-1 overflow-y-auto custom-scrollbar">
                {generatedRooms.length === 0 ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="h-full flex flex-col items-center justify-center text-center py-8"
                  >
                    <motion.div
                      animate={{ y: [0, -10, 0], rotate: [0, 5, -5, 0] }}
                      transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                      className="relative mb-4"
                    >
                      <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl" />
                      <div 
                        className="relative w-20 h-20 bg-linear-to-br from-primary/30 to-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/30"
                        style={{ boxShadow: SHADOWS.icon }}
                      >
                        <Home className="w-10 h-10 text-primary" strokeWidth={1.5} />
                      </div>
                    </motion.div>
                    <p className="font-dubai text-secondary/50 text-sm">
                      قم بإضافة غرف للبدء
                    </p>
                  </motion.div>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    <AnimatePresence mode="popLayout">
                      {generatedRooms.map((room, index) => {
                        const Icon = roomIcons[room.type];
                        const displayName = room.number > 0 
                          ? `${roomTypeNames[room.type]} ${room.number}`
                          : roomTypeNames[room.type];

                        return (
                          <motion.div
                            key={room.id}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            className="relative rounded-xl overflow-hidden bg-white p-3 border-2 border-primary/20 group"
                            style={{ boxShadow: SHADOWS.card }}
                          >
                            {/* Background Icon */}
                            <div className="absolute -top-1 -left-1 opacity-[0.10] pointer-events-none">
                              <Icon className="w-16 h-16 text-primary" strokeWidth={1.5} />
                            </div>

                            {/* Shimmer */}
                            <motion.div
                              className="absolute inset-0 pointer-events-none"
                              style={{
                                background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
                              }}
                              initial={{ opacity: 0, x: '-100%' }}
                              whileHover={{ opacity: 1, x: '100%' }}
                              transition={{ duration: 0.5 }}
                            />

                            <div className="flex items-center gap-2 relative z-10">
                              <motion.div 
                                className="w-9 h-9 bg-primary/20 flex items-center justify-center rounded-lg border border-primary/30"
                                whileHover={{ scale: 1.1, rotate: 5 }}
                              >
                                <Icon className="w-4 h-4 text-primary" strokeWidth={2} />
                              </motion.div>
                              <span className="font-dubai font-bold text-secondary text-sm">
                                {displayName}
                              </span>
                            </div>
                          </motion.div>
                        );
                      })}
                    </AnimatePresence>
                  </div>
                )}
              </div>

              {/* زر إنشاء الشرائح */}
              {generatedRooms.length > 0 && isEditing && onGenerateRoomSlides && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="mt-4 pt-4 border-t-2 border-primary/10"
                >
                  <motion.button
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleGenerateSlides}
                    disabled={isGenerating}
                    className={`
                      w-full py-4 px-5 rounded-2xl font-dubai font-bold text-base
                      flex items-center justify-center gap-3
                      ${hasGenerated 
                        ? 'bg-linear-to-l from-green-500 to-green-600 text-white' 
                        : 'bg-linear-to-l from-secondary to-secondary/80 text-primary'
                      }
                      ${isGenerating ? 'opacity-70 cursor-wait' : ''}
                    `}
                    style={{ boxShadow: SHADOWS.modal }}
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="w-6 h-6 animate-spin" />
                        <span>جارٍ إنشاء الشرائح...</span>
                      </>
                    ) : hasGenerated ? (
                      <>
                        <Check className="w-6 h-6" />
                        <span>تم إنشاء الشرائح بنجاح!</span>
                      </>
                    ) : (
                      <>
                        <Home className="w-6 h-6" />
                        <span>إنشاء شرائح الغرف ({generatedRooms.length} شرائح)</span>
                      </>
                    )}
                  </motion.button>
                  
                  {!hasGenerated && (
                    <p className="text-xs text-secondary/50 text-center mt-2 font-dubai">
                      اضغط لإنشاء شريحة منفصلة لكل غرفة
                    </p>
                  )}
                </motion.div>
              )}
            </div>
          </motion.div>
        </div>

        {/* النص السفلي */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.5 }}
          className="mt-4 flex items-center justify-between"
        >
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 bg-primary rounded-full" />
            <span className="text-sm font-dubai font-bold text-secondary/60">
              الخطوة الأولى: تحديد تكوين الشقة
            </span>
          </div>
          
          <div className="flex items-center gap-1.5">
            <div className="w-10 h-1 bg-primary/30 rounded-full" />
            <div className="w-5 h-1 bg-primary/50 rounded-full" />
            <div className="w-3 h-1 bg-primary rounded-full" />
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default RoomSetupSlide;
