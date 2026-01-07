'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { X, Edit3 } from 'lucide-react';
import type { RoomItem } from '@/types/feasibility';

interface KitchenItemProps {
  item: RoomItem;
  onRemove?: () => void;
  onPriceChange?: (newPrice: number) => void;
  onQuantityChange?: (newQuantity: number) => void;
  isEditing?: boolean;
  compact?: boolean;
}

const KitchenItem: React.FC<KitchenItemProps> = ({
  item,
  onRemove,
  onPriceChange,
  onQuantityChange,
  isEditing = true,
  compact = false,
}) => {
  const [isEditingPrice, setIsEditingPrice] = React.useState(false);
  const [localPrice, setLocalPrice] = React.useState(item.price);

  // حفظ السعر الجديد
  const handlePriceSave = () => {
    setIsEditingPrice(false);
    if (onPriceChange && localPrice !== item.price) {
      onPriceChange(localPrice);
    }
  };

  // الإجمالي
  const totalPrice = item.price * item.quantity;

  if (compact) {
    return (
      <motion.div
        layout
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="flex items-center gap-2 p-2 bg-white border border-orange-200 group"
      >
        <span className="text-lg">{item.icon}</span>
        <span className="text-sm font-dubai text-secondary flex-1 truncate">
          {item.name}
        </span>
        {isEditing && onRemove && (
          <button
            onClick={onRemove}
            className="w-5 h-5 bg-red-100 text-red-600 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
          >
            <X className="w-3 h-3" />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className="flex items-center gap-3 p-3 bg-white border border-orange-200 hover:border-orange-300 transition-colors group"
      dir="rtl"
    >
      {/* الأيقونة */}
      <div className="w-10 h-10 bg-orange-50 flex items-center justify-center text-xl">
        {item.icon}
      </div>

      {/* المعلومات */}
      <div className="flex-1 min-w-0">
        <h4 className="font-dubai font-medium text-secondary truncate">
          {item.name}
        </h4>
        
        {/* السعر - قابل للتحرير */}
        <div className="flex items-center gap-2 mt-1">
          {isEditing && isEditingPrice ? (
            <input
              type="number"
              value={localPrice}
              onChange={(e) => setLocalPrice(Number(e.target.value))}
              onBlur={handlePriceSave}
              onKeyDown={(e) => e.key === 'Enter' && handlePriceSave()}
              className="w-20 text-sm bg-orange-50 border border-orange-200 px-2 py-0.5 outline-none focus:border-orange-400 font-dubai"
              autoFocus
            />
          ) : (
            <span 
              className={`text-sm text-orange-600 font-dubai ${isEditing ? 'cursor-pointer hover:underline' : ''}`}
              onClick={() => isEditing && setIsEditingPrice(true)}
            >
              {item.price.toLocaleString('ar-EG')} ج.م
            </span>
          )}
          
          {isEditing && !isEditingPrice && (
            <Edit3 className="w-3 h-3 text-orange-400 opacity-0 group-hover:opacity-100 transition-opacity" />
          )}
        </div>
      </div>

      {/* الكمية */}
      <div className="flex items-center gap-1">
        {isEditing && onQuantityChange && (
          <button
            onClick={() => item.quantity > 1 && onQuantityChange(item.quantity - 1)}
            disabled={item.quantity <= 1}
            className="w-6 h-6 bg-orange-100 text-orange-600 flex items-center justify-center disabled:opacity-50"
          >
            -
          </button>
        )}
        
        <span className="w-8 text-center font-dubai font-medium text-secondary">
          {item.quantity}
        </span>
        
        {isEditing && onQuantityChange && (
          <button
            onClick={() => onQuantityChange(item.quantity + 1)}
            className="w-6 h-6 bg-orange-100 text-orange-600 flex items-center justify-center"
          >
            +
          </button>
        )}
      </div>

      {/* الإجمالي */}
      <div className="text-left min-w-17.5">
        <span className="text-sm font-dubai font-bold text-secondary">
          {totalPrice.toLocaleString('ar-EG')}
        </span>
        <span className="text-xs text-secondary/60 font-dubai mr-1">ج.م</span>
      </div>

      {/* زر الحذف */}
      {isEditing && onRemove && (
        <button
          onClick={onRemove}
          className="w-8 h-8 bg-red-50 text-red-500 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-100"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </motion.div>
  );
};

export default KitchenItem;
