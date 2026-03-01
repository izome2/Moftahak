'use client';

/**
 * RoomHeader - مكون رأس الغرفة
 * 
 * يعرض عنوان الغرفة مع أيقونة ووصف توضيحي
 * يستخدم في جميع شرائح الغرف
 */

import React from 'react';
import { motion } from 'framer-motion';
import { 
  ChefHat, 
  Bed, 
  Sofa, 
  Bath,
  Library,
  type LucideIcon 
} from 'lucide-react';
import { 
  SHADOWS, 
  headerVariants,
  scaleInVariants,
  ROOM_CONTENT 
} from '@/lib/feasibility/design-system';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';

// ============================================
// 📋 TYPES
// ============================================

export type RoomType = 'kitchen' | 'bedroom' | 'livingRoom' | 'bathroom';

export interface RoomHeaderProps {
  /** نوع الغرفة */
  roomType: RoomType;
  /** رقم الغرفة (اختياري) */
  roomNumber?: number;
  /** عنوان مخصص (اختياري - يتجاوز العنوان الافتراضي) */
  customTitle?: string;
  /** وصف مخصص (اختياري - يتجاوز الوصف الافتراضي) */
  customDescription?: string;
  /** عدد العناصر المضافة */
  itemsCount?: number;
  /** الإجمالي */
  totalCost?: number;
  /** هل التحرير مفعل */
  isEditing?: boolean;
  /** دالة فتح المكتبة */
  onOpenLibrary?: () => void;
  /** className إضافي */
  className?: string;
}

// ============================================
// 🎨 ICON MAPPING
// ============================================

const ROOM_ICONS: Record<RoomType, LucideIcon> = {
  kitchen: ChefHat,
  bedroom: Bed,
  livingRoom: Sofa,
  bathroom: Bath,
};

// ============================================
// 🎨 COMPONENT
// ============================================

const RoomHeader: React.FC<RoomHeaderProps> = ({
  roomType,
  roomNumber,
  customTitle,
  customDescription,
  itemsCount = 0,
  totalCost,
  isEditing = false,
  onOpenLibrary,
  className = '',
}) => {
  // الحصول على محتوى الغرفة
  const roomContent = ROOM_CONTENT[roomType];
  const Icon = ROOM_ICONS[roomType];
  const { currencySymbol } = useCurrencyFormatter();
  
  // تحديد العنوان
  const title = customTitle || (
    roomNumber && roomNumber > 1 
      ? `${roomContent.titleAlt} ${roomNumber}`
      : roomContent.title
  );
  
  // تحديد الوصف
  const description = customDescription || roomContent.description;

  // تنسيق السعر
  const formatPrice = (price: number): string => {
    return new Intl.NumberFormat('ar-EG').format(price);
  };

  return (
    <motion.div 
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={`mb-6 ${className}`}
    >
      {/* الرأس الرئيسي */}
      <div className="flex items-start justify-between gap-4 mb-4">
        {/* الجانب الأيمن: الأيقونة والنص */}
        <div className="flex items-center gap-4">
          {/* حاوية الأيقونة */}
          <motion.div 
            variants={scaleInVariants}
            className="w-16 h-16 rounded-2xl flex items-center justify-center
                       bg-linear-to-br from-secondary to-secondary/80"
            style={{ boxShadow: SHADOWS.icon }}
          >
            <Icon className="w-8 h-8 text-primary" />
          </motion.div>
          
          {/* النصوص */}
          <div>
            <h2 className="text-2xl font-bold text-secondary font-dubai mb-1">
              {title}
            </h2>
            <p className="text-secondary/60 text-sm font-dubai max-w-md">
              {description}
            </p>
          </div>
        </div>

        {/* الجانب الأيسر: زر المكتبة */}
        {isEditing && onOpenLibrary && (
          <motion.button
            whileHover={{ scale: 1.02, y: -2 }}
            whileTap={{ scale: 0.98 }}
            onClick={onOpenLibrary}
            className="flex items-center gap-2 px-4 py-2.5
                       bg-primary text-secondary font-bold font-dubai text-sm
                       rounded-xl transition-all duration-200"
            style={{ boxShadow: SHADOWS.soft }}
          >
            <Library className="w-4 h-4" />
            <span>فتح المكتبة</span>
          </motion.button>
        )}
      </div>

      {/* خط فاصل مزخرف */}
      <div className="relative h-px mb-4">
        <div className="absolute inset-0 bg-linear-to-r from-transparent via-secondary/20 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                        w-2 h-2 rounded-full bg-primary/40" />
      </div>

      {/* شريط المعلومات */}
      <div className="flex items-center justify-between">
        {/* عدد العناصر */}
        <div className="flex items-center gap-2">
          <span className="text-sm text-secondary/50 font-dubai">العناصر المضافة:</span>
          <span className="px-2.5 py-1 bg-secondary/5 rounded-lg text-sm font-bold text-secondary">
            {itemsCount} عنصر
          </span>
        </div>

        {/* الإجمالي */}
        {totalCost !== undefined && (
          <motion.div 
            key={totalCost}
            initial={{ scale: 1.1 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
            className="flex items-center gap-2"
          >
            <span className="text-sm text-secondary/50 font-dubai">الإجمالي:</span>
            <span className="px-3 py-1.5 bg-primary/10 rounded-xl text-lg font-bold text-primary">
              {formatPrice(totalCost)} {currencySymbol}
            </span>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
};

// ============================================
// 📤 EXPORT
// ============================================

export { RoomHeader };
export default RoomHeader;

// ============================================
// 🔧 VARIANT: Compact Header (للمساحات الصغيرة)
// ============================================

export interface CompactHeaderProps {
  /** نوع الغرفة */
  roomType: RoomType;
  /** رقم الغرفة */
  roomNumber?: number;
  /** عنوان مخصص */
  customTitle?: string;
  /** className إضافي */
  className?: string;
}

export const CompactHeader: React.FC<CompactHeaderProps> = ({
  roomType,
  roomNumber,
  customTitle,
  className = '',
}) => {
  const roomContent = ROOM_CONTENT[roomType];
  const Icon = ROOM_ICONS[roomType];
  
  const title = customTitle || (
    roomNumber && roomNumber > 1 
      ? `${roomContent.titleAlt} ${roomNumber}`
      : roomContent.title
  );

  return (
    <motion.div 
      variants={headerVariants}
      initial="hidden"
      animate="visible"
      className={`flex items-center gap-3 ${className}`}
    >
      {/* أيقونة صغيرة */}
      <div 
        className="w-10 h-10 rounded-xl flex items-center justify-center
                   bg-linear-to-br from-secondary to-secondary/80"
        style={{ boxShadow: SHADOWS.soft }}
      >
        <Icon className="w-5 h-5 text-primary" />
      </div>
      
      {/* العنوان */}
      <h3 className="text-lg font-bold text-secondary font-dubai">
        {title}
      </h3>
    </motion.div>
  );
};
