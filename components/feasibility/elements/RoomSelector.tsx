'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus, Bed, Sofa, ChefHat, Bath } from 'lucide-react';
import type { RoomType } from '@/types/feasibility';

// تعريف أنواع الغرف
export interface RoomTypeConfig {
  type: RoomType;
  name: string;
  namePlural: string;
  icon: React.ElementType;
  color: string;
  bgColor: string;
  min: number;
  max: number;
}

// إعدادات أنواع الغرف
export const roomTypesConfig: RoomTypeConfig[] = [
  {
    type: 'bedroom',
    name: 'غرفة نوم',
    namePlural: 'غرف النوم',
    icon: Bed,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    min: 0,
    max: 6,
  },
  {
    type: 'living-room',
    name: 'صالة',
    namePlural: 'الصالات',
    icon: Sofa,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    min: 0,
    max: 3,
  },
  {
    type: 'kitchen',
    name: 'مطبخ',
    namePlural: 'المطابخ',
    icon: ChefHat,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    min: 0,
    max: 2,
  },
  {
    type: 'bathroom',
    name: 'حمام',
    namePlural: 'الحمامات',
    icon: Bath,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    min: 0,
    max: 4,
  },
];

// بيانات عدد الغرف
export interface RoomCounts {
  bedroom: number;
  'living-room': number;
  kitchen: number;
  bathroom: number;
}

interface RoomSelectorProps {
  counts: RoomCounts;
  onChange: (counts: RoomCounts) => void;
  disabled?: boolean;
}

const RoomSelector: React.FC<RoomSelectorProps> = ({
  counts,
  onChange,
  disabled = false,
}) => {
  // تحديث عدد نوع معين من الغرف
  const handleCountChange = (type: RoomType, delta: number) => {
    const config = roomTypesConfig.find((c) => c.type === type);
    if (!config) return;

    const currentCount = counts[type];
    const newCount = Math.max(config.min, Math.min(config.max, currentCount + delta));

    if (newCount !== currentCount) {
      onChange({
        ...counts,
        [type]: newCount,
      });
    }
  };

  // حساب إجمالي الغرف
  const totalRooms = Object.values(counts).reduce((sum, count) => sum + count, 0);

  return (
    <div className="space-y-4" dir="rtl">
      {/* عنوان */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-dubai font-bold text-secondary">
          تكوين الشقة
        </h3>
        <span className="text-sm text-secondary/60 font-dubai">
          إجمالي: {totalRooms} غرف
        </span>
      </div>

      {/* قائمة أنواع الغرف */}
      <div className="space-y-3">
        {roomTypesConfig.map((config, index) => {
          const Icon = config.icon;
          const count = counts[config.type];
          const canDecrease = count > config.min;
          const canIncrease = count < config.max;

          return (
            <motion.div
              key={config.type}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-4 bg-white border border-accent/50 hover:border-primary/30 hover:shadow-medium transition-all rounded-xl"
            >
              {/* معلومات نوع الغرفة */}
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 ${config.bgColor} flex items-center justify-center rounded-xl shadow-soft`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                <span className="font-dubai font-medium text-secondary">
                  {config.namePlural}
                </span>
              </div>

              {/* أزرار التحكم */}
              <div className="flex items-center gap-2">
                {/* زر الإنقاص */}
                <button
                  onClick={() => handleCountChange(config.type, -1)}
                  disabled={disabled || !canDecrease}
                  className={`
                    w-9 h-9 flex items-center justify-center transition-all rounded-lg
                    ${canDecrease && !disabled
                      ? 'bg-secondary text-white hover:bg-secondary/80 shadow-soft'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Minus className="w-4 h-4" />
                </button>

                {/* العدد */}
                <div className="w-12 h-9 flex items-center justify-center bg-accent/50 font-dubai font-bold text-secondary text-lg rounded-lg">
                  {count}
                </div>

                {/* زر الزيادة */}
                <button
                  onClick={() => handleCountChange(config.type, 1)}
                  disabled={disabled || !canIncrease}
                  className={`
                    w-9 h-9 flex items-center justify-center transition-all rounded-lg
                    ${canIncrease && !disabled
                      ? 'bg-primary text-secondary hover:bg-primary/80 shadow-soft'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    }
                  `}
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* ملاحظة */}
      <p className="text-xs text-secondary/50 font-dubai text-center">
        حدد عدد الغرف في الشقة لإنشاء شرائح مخصصة لكل غرفة
      </p>
    </div>
  );
};

export default RoomSelector;
