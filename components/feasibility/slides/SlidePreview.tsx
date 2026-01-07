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
  Lock,
  GripVertical
} from 'lucide-react';
import type { Slide, SlideType } from '@/types/feasibility';

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
  statistics: BarChart3,
  footer: FileText,
};

// ألوان خلفية الشرائح المصغرة
const slidePreviewColors: Record<SlideType, { bg: string; iconBg: string }> = {
  cover: { bg: 'bg-secondary', iconBg: 'bg-primary/30' },
  introduction: { bg: 'bg-accent', iconBg: 'bg-primary/40' },
  'room-setup': { bg: 'bg-blue-50', iconBg: 'bg-blue-200' },
  kitchen: { bg: 'bg-orange-50', iconBg: 'bg-orange-200' },
  bathroom: { bg: 'bg-cyan-50', iconBg: 'bg-cyan-200' },
  bedroom: { bg: 'bg-purple-50', iconBg: 'bg-purple-200' },
  'living-room': { bg: 'bg-green-50', iconBg: 'bg-green-200' },
  'cost-summary': { bg: 'bg-yellow-50', iconBg: 'bg-yellow-200' },
  'area-study': { bg: 'bg-rose-50', iconBg: 'bg-rose-200' },
  map: { bg: 'bg-emerald-50', iconBg: 'bg-emerald-200' },
  statistics: { bg: 'bg-indigo-50', iconBg: 'bg-indigo-200' },
  footer: { bg: 'bg-secondary', iconBg: 'bg-primary/30' },
};

interface SlidePreviewProps {
  slide: Slide;
  index: number;
  isActive: boolean;
  isDragging?: boolean;
  onClick: () => void;
  onContextMenu?: (e: React.MouseEvent) => void;
}

const SlidePreview: React.FC<SlidePreviewProps> = ({
  slide,
  index,
  isActive,
  isDragging = false,
  onClick,
  onContextMenu,
}) => {
  const Icon = slideIcons[slide.type];
  const colors = slidePreviewColors[slide.type];
  const isLocked = slide.isLocked;

  return (
    <motion.div
      onClick={onClick}
      onContextMenu={onContextMenu}
      className={`
        w-full flex items-center gap-3 p-2 cursor-pointer transition-all group
        ${isActive 
          ? 'bg-primary/20 ring-2 ring-primary' 
          : 'hover:bg-secondary-light/50'
        }
        ${isDragging ? 'opacity-50' : ''}
      `}
      whileHover={{ x: -2 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* مقبض السحب أو أيقونة القفل */}
      <div className="w-5 flex items-center justify-center shrink-0">
        {isLocked ? (
          <Lock className="w-3.5 h-3.5 text-primary/50" />
        ) : (
          <GripVertical className="w-3.5 h-3.5 text-primary/30 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing" />
        )}
      </div>

      {/* المعاينة المصغرة */}
      <div 
        className={`
          w-16 h-20 shrink-0 relative overflow-hidden shadow-sm
          ${colors.bg}
          ${isActive ? 'ring-2 ring-primary ring-offset-1' : ''}
        `}
      >
        {/* محتوى المعاينة */}
        <div className="absolute inset-0 flex flex-col">
          {/* شريط علوي للغلاف والخاتمة */}
          {(slide.type === 'cover' || slide.type === 'footer') && (
            <div className="h-1/4 bg-secondary" />
          )}
          
          {/* محتوى الشريحة */}
          <div className="flex-1 flex items-center justify-center">
            <div className={`w-6 h-6 ${colors.iconBg} flex items-center justify-center`}>
              <Icon className="w-3 h-3 text-secondary/70" />
            </div>
          </div>

          {/* أشرطة وهمية للنص */}
          {slide.type !== 'cover' && slide.type !== 'footer' && (
            <div className="p-1.5 space-y-1">
              <div className="h-0.5 w-full bg-secondary/10 rounded-full" />
              <div className="h-0.5 w-3/4 bg-secondary/10 rounded-full" />
            </div>
          )}
        </div>

        {/* رقم الشريحة */}
        <div className="absolute bottom-0.5 left-0.5 w-4 h-4 bg-secondary/80 text-white text-[8px] flex items-center justify-center font-bold">
          {index + 1}
        </div>
      </div>

      {/* معلومات الشريحة */}
      <div className="flex-1 min-w-0">
        <p className={`
          text-sm font-dubai truncate
          ${isActive ? 'text-secondary font-medium' : 'text-primary'}
        `}>
          {slide.title}
        </p>
        <p className="text-xs text-primary/50 font-dubai">
          {getSlideTypeLabel(slide.type)}
        </p>
      </div>
    </motion.div>
  );
};

// تسميات أنواع الشرائح
function getSlideTypeLabel(type: SlideType): string {
  const labels: Record<SlideType, string> = {
    cover: 'غلاف',
    introduction: 'مقدمة',
    'room-setup': 'تكوين',
    kitchen: 'مطبخ',
    bathroom: 'حمام',
    bedroom: 'غرفة نوم',
    'living-room': 'صالة',
    'cost-summary': 'تكاليف',
    'area-study': 'دراسة',
    map: 'خريطة',
    statistics: 'إحصائيات',
    footer: 'خاتمة',
  };
  return labels[type] || type;
}

export default SlidePreview;
