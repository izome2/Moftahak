'use client';

/**
 * ItemWidget - مكون Widget موحد للعناصر
 * 
 * يستخدم في جميع شرائح الغرف (المطبخ، غرفة النوم، الصالة، الحمام)
 * مصمم بظلال احترافية وتأثيرات حركة سلسة
 */

import React from 'react';
import { motion } from 'framer-motion';
import { Minus, Plus, Trash2, type LucideIcon } from 'lucide-react';
import { 
  SHADOWS, 
  WIDGET_CLASSES, 
  widgetVariants,
  HOVER_EFFECTS,
  TAP_EFFECTS,
  formatPrice 
} from '@/lib/feasibility/design-system';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';

// ============================================
// 📋 TYPES
// ============================================

export interface ItemWidgetProps {
  /** معرف العنصر */
  id: string;
  /** اسم العنصر */
  name: string;
  /** أيقونة Lucide للعنصر */
  icon: LucideIcon;
  /** السعر الإجمالي (السعر × الكمية) */
  price: number;
  /** سعر الوحدة */
  unitPrice: number;
  /** الكمية */
  quantity: number;
  /** هل التحرير مفعل */
  isEditing?: boolean;
  /** دالة تحديث الكمية */
  onQuantityChange?: (id: string, quantity: number) => void;
  /** دالة تحديث السعر */
  onPriceChange?: (id: string, price: number) => void;
  /** دالة الحذف */
  onDelete?: (id: string) => void;
  /** لون الأيقونة (اختياري) */
  iconColor?: string;
  /** لون خلفية الأيقونة (اختياري) */
  iconBgColor?: string;
  /** className إضافي */
  className?: string;
}

// ============================================
// 🎨 COMPONENT
// ============================================

const ItemWidget: React.FC<ItemWidgetProps> = ({
  id,
  name,
  icon: Icon,
  price,
  unitPrice,
  quantity,
  isEditing = false,
  onQuantityChange,
  onPriceChange,
  onDelete,
  iconColor = 'text-primary',
  iconBgColor = 'from-primary/20 to-primary/10',
  className = '',
}) => {
  const { currencySymbol } = useCurrencyFormatter();
  
  // تحديث الكمية
  const handleQuantityDecrease = () => {
    if (quantity > 1) {
      onQuantityChange?.(id, quantity - 1);
    }
  };

  const handleQuantityIncrease = () => {
    onQuantityChange?.(id, quantity + 1);
  };

  // تحديث السعر
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPrice = parseInt(e.target.value) || 0;
    onPriceChange?.(id, newPrice);
  };

  // حذف العنصر
  const handleDelete = () => {
    onDelete?.(id);
  };

  return (
    <motion.div
      layout
      variants={widgetVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      whileHover={isEditing ? HOVER_EFFECTS.liftAndScale : HOVER_EFFECTS.subtle}
      whileTap={isEditing ? TAP_EFFECTS.softPress : undefined}
      className={`
        ${WIDGET_CLASSES.base}
        ${WIDGET_CLASSES.interactive}
        overflow-hidden
        ${className}
      `}
      style={{ boxShadow: SHADOWS.widget }}
    >
      {/* المحتوى الرئيسي */}
      <div className="p-4">
        {/* الصف العلوي: الأيقونة والاسم */}
        <div className="flex items-start gap-3 mb-4">
          {/* حاوية الأيقونة */}
          <div 
            className={`
              w-12 h-12 rounded-xl flex items-center justify-center
              bg-linear-to-br ${iconBgColor}
              shrink-0
            `}
            style={{ boxShadow: SHADOWS.soft }}
          >
            <Icon className={`w-6 h-6 ${iconColor}`} />
          </div>
          
          {/* اسم العنصر */}
          <div className="flex-1 min-w-0 pt-1">
            <h4 className="font-dubai font-bold text-secondary text-base leading-tight truncate">
              {name}
            </h4>
            {quantity > 1 && (
              <span className="text-xs text-secondary/50 font-dubai">
                {formatPrice(unitPrice)} {currencySymbol} × {quantity}
              </span>
            )}
          </div>
        </div>

        {/* التحكم في الكمية */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-secondary/70 font-dubai">الكمية</span>
          
          <div className="flex items-center gap-2">
            {/* زر النقص */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuantityDecrease}
              disabled={!isEditing || quantity <= 1}
              className={`
                ${WIDGET_CLASSES.controlButton}
                ${WIDGET_CLASSES.controlButtonMinus}
                ${!isEditing || quantity <= 1 ? 'opacity-40 cursor-not-allowed' : ''}
              `}
              aria-label="تقليل الكمية"
            >
              <Minus className="w-4 h-4" />
            </motion.button>

            {/* عرض الكمية */}
            <span className="w-10 text-center font-bold text-secondary text-lg font-dubai">
              {quantity}
            </span>

            {/* زر الزيادة */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleQuantityIncrease}
              disabled={!isEditing}
              className={`
                ${WIDGET_CLASSES.controlButton}
                ${WIDGET_CLASSES.controlButtonPlus}
                ${!isEditing ? 'opacity-40 cursor-not-allowed' : ''}
              `}
              aria-label="زيادة الكمية"
            >
              <Plus className="w-4 h-4" />
            </motion.button>
          </div>
        </div>

        {/* خط فاصل */}
        <div className="h-px bg-linear-to-r from-transparent via-secondary/10 to-transparent mb-3" />

        {/* السعر */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-secondary/70 font-dubai">السعر الإجمالي</span>
          
          {isEditing ? (
            <div className="flex items-center gap-1">
              <input
                type="number"
                value={unitPrice}
                onChange={handlePriceChange}
                className="w-20 px-2 py-1 text-left text-base font-bold text-primary 
                         bg-accent/30 border border-secondary/10 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/30
                         transition-all duration-200"
                min="0"
              />
              <span className="text-xs text-secondary/60 font-dubai">{currencySymbol}</span>
            </div>
          ) : (
            <div className="flex items-baseline gap-1">
              <span className={WIDGET_CLASSES.price}>
                {formatPrice(price)}
              </span>
              <span className={WIDGET_CLASSES.priceLabel}>{currencySymbol}</span>
            </div>
          )}
        </div>
      </div>

      {/* زر الحذف - يظهر فقط في وضع التحرير */}
      {isEditing && (
        <motion.button
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          exit={{ opacity: 0, height: 0 }}
          whileHover={{ backgroundColor: 'rgba(239, 68, 68, 0.15)' }}
          whileTap={{ scale: 0.98 }}
          onClick={handleDelete}
          className="w-full px-4 py-2.5 flex items-center justify-center gap-2
                   bg-red-50 border-t border-red-100
                   text-red-500 text-sm font-dubai font-medium
                   transition-colors duration-200"
        >
          <Trash2 className="w-4 h-4" />
          <span>حذف العنصر</span>
        </motion.button>
      )}
    </motion.div>
  );
};

// ============================================
// 📤 EXPORT
// ============================================

export default ItemWidget;

// ============================================
// 🔧 VARIANT: Compact Widget (للمكتبة)
// ============================================

export interface CompactWidgetProps {
  /** اسم العنصر */
  name: string;
  /** أيقونة Lucide */
  icon: LucideIcon;
  /** السعر الافتراضي */
  defaultPrice: number;
  /** دالة الإضافة */
  onAdd: () => void;
  /** لون الأيقونة */
  iconColor?: string;
  /** className إضافي */
  className?: string;
}

export const CompactWidget: React.FC<CompactWidgetProps> = ({
  name,
  icon: Icon,
  defaultPrice,
  onAdd,
  iconColor = 'text-primary',
  className = '',
}) => {
  const { currencySymbol } = useCurrencyFormatter();
  
  return (
    <motion.button
      whileHover={HOVER_EFFECTS.lift}
      whileTap={TAP_EFFECTS.press}
      onClick={onAdd}
      className={`
        ${WIDGET_CLASSES.base}
        ${WIDGET_CLASSES.interactive}
        p-3 text-right w-full
        group
        ${className}
      `}
      style={{ boxShadow: SHADOWS.soft }}
    >
      <div className="flex items-center gap-3">
        {/* الأيقونة */}
        <div 
          className="w-10 h-10 rounded-xl flex items-center justify-center
                     bg-linear-to-br from-primary/20 to-primary/10
                     group-hover:from-primary/30 group-hover:to-primary/20
                     transition-all duration-300"
        >
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>

        {/* المعلومات */}
        <div className="flex-1 min-w-0">
          <p className="font-dubai font-medium text-secondary text-sm truncate">
            {name}
          </p>
          <p className="text-xs text-secondary/60 font-dubai">
            {formatPrice(defaultPrice)} {currencySymbol}
          </p>
        </div>

        {/* زر الإضافة */}
        <div 
          className="w-8 h-8 rounded-lg flex items-center justify-center
                     bg-primary/10 group-hover:bg-primary/20
                     transition-all duration-300"
        >
          <Plus className="w-4 h-4 text-primary" />
        </div>
      </div>
    </motion.button>
  );
};
