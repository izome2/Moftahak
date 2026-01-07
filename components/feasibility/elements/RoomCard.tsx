'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Bed, Sofa, ChefHat, Bath, ChevronLeft, Trash2 } from 'lucide-react';
import type { RoomType, RoomData } from '@/types/feasibility';

// أيقونات أنواع الغرف
const roomIcons: Record<RoomType, React.ElementType> = {
  bedroom: Bed,
  'living-room': Sofa,
  kitchen: ChefHat,
  bathroom: Bath,
};

// ألوان أنواع الغرف
const roomColors: Record<RoomType, { bg: string; text: string; border: string }> = {
  bedroom: {
    bg: 'bg-blue-50',
    text: 'text-blue-600',
    border: 'border-blue-200',
  },
  'living-room': {
    bg: 'bg-amber-50',
    text: 'text-amber-600',
    border: 'border-amber-200',
  },
  kitchen: {
    bg: 'bg-orange-50',
    text: 'text-orange-600',
    border: 'border-orange-200',
  },
  bathroom: {
    bg: 'bg-cyan-50',
    text: 'text-cyan-600',
    border: 'border-cyan-200',
  },
};

// أسماء أنواع الغرف
const roomTypeNames: Record<RoomType, string> = {
  bedroom: 'غرفة نوم',
  'living-room': 'صالة',
  kitchen: 'مطبخ',
  bathroom: 'حمام',
};

interface RoomCardProps {
  room: RoomData;
  onClick?: () => void;
  onDelete?: () => void;
  isSelected?: boolean;
  showDelete?: boolean;
  compact?: boolean;
}

const RoomCard: React.FC<RoomCardProps> = ({
  room,
  onClick,
  onDelete,
  isSelected = false,
  showDelete = false,
  compact = false,
}) => {
  const Icon = roomIcons[room.type];
  const colors = roomColors[room.type];

  // الاسم المعروض للغرفة
  const displayName = room.number > 0 
    ? `${roomTypeNames[room.type]} ${room.number}`
    : roomTypeNames[room.type];

  if (compact) {
    return (
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        onClick={onClick}
        className={`
          flex items-center gap-2 px-3 py-2.5 transition-all rounded-xl shadow-soft
          ${colors.bg} ${colors.border} border
          ${isSelected ? 'ring-2 ring-primary ring-offset-1' : ''}
          ${onClick ? 'cursor-pointer hover:shadow-medium' : 'cursor-default'}
        `}
        dir="rtl"
      >
        <Icon className={`w-4 h-4 ${colors.text}`} />
        <span className="font-dubai text-sm text-secondary">
          {displayName}
        </span>
      </motion.button>
    );
  }

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      className={`
        relative p-4 transition-all rounded-xl shadow-soft
        ${colors.bg} ${colors.border} border
        ${isSelected ? 'ring-2 ring-primary ring-offset-2' : ''}
        ${onClick ? 'cursor-pointer hover:shadow-medium' : 'cursor-default'}
      `}
      onClick={onClick}
      dir="rtl"
    >
      {/* زر الحذف */}
      {showDelete && onDelete && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="absolute top-2 left-2 w-7 h-7 bg-red-100 text-red-600 flex items-center justify-center hover:bg-red-200 transition-colors rounded-lg"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      )}

      {/* أيقونة الغرفة */}
      <div className={`w-12 h-12 ${colors.text} bg-white flex items-center justify-center mb-3 shadow-soft rounded-xl`}>
        <Icon className="w-6 h-6" />
      </div>

      {/* اسم الغرفة */}
      <h4 className="font-dubai font-bold text-secondary mb-1">
        {displayName}
      </h4>

      {/* عدد العناصر والتكلفة */}
      <div className="flex items-center justify-between text-sm">
        <span className="text-secondary/60 font-dubai">
          {room.items.length} عنصر
        </span>
        <span className={`font-dubai font-medium ${colors.text}`}>
          {room.totalCost.toLocaleString('ar-EG')} ج.م
        </span>
      </div>

      {/* سهم التفاصيل */}
      {onClick && (
        <div className="absolute left-3 top-1/2 -translate-y-1/2">
          <ChevronLeft className={`w-5 h-5 ${colors.text}`} />
        </div>
      )}
    </motion.div>
  );
};

export default RoomCard;
