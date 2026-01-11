'use client';

/**
 * BathroomSlide - شريحة الحمام
 * 
 * تصميم احترافي مع:
 * - بطاقات بزوايا rounded-xl/2xl
 * - ظلال احترافية
 * - أيقونة خلفية كبيرة شفافة
 * - تأثير shimmer عند hover
 */

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  DndContext, 
  DragOverlay,
  useDroppable, 
  useDraggable,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core';
import { 
  Bath, 
  Plus, 
  Package,
  Minus,
  Trash2,
  X,
  Search,
  Sparkles,
} from 'lucide-react';
import type { RoomItem, RoomSlideData, SlideData } from '@/types/feasibility';
import { bathroomIcons } from '@/lib/feasibility/icons';
import { 
  bathroomItems, 
  bathroomCategories, 
  type BathroomItemDefinition 
} from '@/lib/feasibility/bathroom-items';
import AddCustomItemModal, { getCustomIcon, type CustomItemData } from '@/components/feasibility/shared/AddCustomItemModal';

// مفتاح التخزين المحلي للعناصر المخصصة
const CUSTOM_BATHROOM_ITEMS_KEY = 'moftahak_custom_bathroom_items';

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const THEME = {
  primary: '#edbf8c',
  secondary: '#10302b',
  accent: '#ead3b9',
};

const SHADOWS = {
  card: 'rgba(237, 191, 140, 0.15) 0px 4px 20px',
  cardHover: 'rgba(237, 191, 140, 0.25) 0px 8px 30px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
  icon: 'rgba(237, 191, 140, 0.3) 0px 4px 12px',
  modal: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
  inner: 'inset 0 2px 4px rgba(16, 48, 43, 0.06)',
};

// ============================================
// 📋 TYPES
// ============================================

interface BathroomSlideProps {
  data: RoomSlideData;
  isEditing?: boolean;
  onUpdate?: (data: Partial<SlideData>) => void;
  roomNumber?: number;
}

type BathroomCategory = keyof typeof bathroomCategories;

// ============================================
// 💰 HELPERS
// ============================================

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

// ============================================
// 🚿 ITEM WIDGET
// ============================================

interface ItemWidgetProps {
  item: RoomItem;
  isEditing: boolean;
  onRemove: (id: string) => void;
  onPriceChange: (id: string, price: number) => void;
  onQuantityChange: (id: string, quantity: number) => void;
  onImageChange: (id: string, image: string | undefined) => void;
}

// دالة ضغط الصورة
const compressImage = (file: File, maxWidth: number = 200, quality: number = 0.7): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ratio = Math.min(maxWidth / img.width, maxWidth / img.height);
        canvas.width = img.width * ratio;
        canvas.height = img.height * ratio;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        } else {
          reject(new Error('Could not get canvas context'));
        }
      };
      img.onerror = reject;
      img.src = e.target?.result as string;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
};

const ItemWidget: React.FC<ItemWidgetProps> = ({
  item,
  isEditing,
  onRemove,
  onPriceChange,
  onQuantityChange,
  onImageChange,
}) => {
  const itemKey = item.id.split('-')[0];
  // التحقق من العناصر المخصصة
  const isCustomItem = item.id.startsWith('custom-');
  const IconComponent = isCustomItem 
    ? getCustomIcon(item.icon as string) 
    : (bathroomIcons[itemKey] || Package);
  const unitPrice = Math.round(item.price / item.quantity);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // معالج اختيار الصورة
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressedImage = await compressImage(file, 300, 0.85);
        onImageChange(item.id, compressedImage);
      } catch (error) {
        console.error('Error compressing image:', error);
      }
    }
  };

  // معالج إزالة الصورة
  const handleRemoveImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    onImageChange(item.id, undefined);
  };

  return (
    <motion.div
      layout="position"
      initial={{ opacity: 0, scale: 0.9, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -20 }}
      whileHover={{ scale: 1.02, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 25, layout: { duration: 0 } }}
      className="relative rounded-xl sm:rounded-2xl bg-white p-4 sm:p-5 border-2 border-primary/20 cursor-pointer group"
      style={{ boxShadow: SHADOWS.card, willChange: 'auto' }}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleImageSelect}
        className="hidden"
      />

      {/* Hover Glow Effect */}
      <motion.div 
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        whileHover={{ 
          opacity: 1,
          boxShadow: `${SHADOWS.cardHover}, inset 0 0 0 2px rgba(237, 191, 140, 0.3)`,
        }}
      />

      {/* Background Icon - Large Transparent */}
      <div className="absolute -top-4 -left-4 z-0 opacity-[0.10] pointer-events-none">
        <IconComponent className="w-40 h-40 text-primary" strokeWidth={1.5} />
      </div>

      {/* Image Upload Box - يظهر على اليسار */}
      {isEditing && (
        <div 
          className={`absolute top-4 left-4 z-20 transition-opacity ${item.image ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}
          onClick={(e) => e.stopPropagation()}
        >
          {item.image ? (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="relative w-28 h-28 rounded-xl border-2 border-primary/50 overflow-hidden bg-accent/30 hover:border-primary transition-all cursor-pointer"
              title="تغيير الصورة"
            >
              <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
            </button>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-28 h-28 rounded-xl border-2 border-dashed border-primary/40 bg-white/80 flex items-center justify-center hover:border-primary hover:bg-primary/10 transition-all"
              title="إضافة صورة"
            >
              <Plus size={32} className="text-primary" />
            </button>
          )}
        </div>
      )}

      {/* Shimmer Effect on Hover */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.4), transparent)',
        }}
        initial={{ opacity: 0, x: '-100%' }}
        whileHover={{ opacity: 1, x: '100%' }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />

      {/* Delete Button */}
      {isEditing && (
        <motion.button
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            onRemove(item.id);
          }}
          className="absolute -top-3 -right-3 w-9 h-9 text-secondary rounded-lg flex items-center justify-center border-2 border-primary/30 hover:opacity-80 transition-all z-30 opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: '#faeee2', boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
        >
          <Trash2 size={16} />
        </motion.button>
      )}

      {/* Content */}
      <div className="relative z-10">
        {/* Icon Container */}
        <motion.div 
          className="mb-4 p-4 rounded-xl inline-flex bg-primary/20 shadow-md border-2 border-primary/30"
          whileHover={{ scale: 1.05, rotate: 5 }}
          transition={{ type: 'spring', stiffness: 300 }}
        >
          <IconComponent className="w-7 h-7 text-primary" strokeWidth={2} />
        </motion.div>

        {/* Item Name */}
        <motion.h3 
          className="text-lg sm:text-xl font-bold text-secondary mb-1 font-dubai"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
        >
          {item.name}
        </motion.h3>

        {/* Quantity Info */}
        {item.quantity > 1 && (
          <p className="text-secondary/50 text-xs font-dubai mb-3">
            {formatPrice(unitPrice)} ج.م × {item.quantity}
          </p>
        )}

        {/* Quantity Controls */}
        <div className="flex items-center justify-between py-3 border-t border-secondary/10 mt-3">
          <span className="text-sm text-secondary/60 font-dubai">الكمية</span>
          <div className="flex items-center gap-3">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                if (item.quantity > 1) onQuantityChange(item.id, item.quantity - 1);
              }}
              disabled={!isEditing || item.quantity <= 1}
              className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary/20 transition-colors"
            >
              <Minus size={14} />
            </motion.button>
            <span className="font-dubai font-bold text-secondary text-lg min-w-8 text-center">
              {item.quantity}
            </span>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                onQuantityChange(item.id, item.quantity + 1);
              }}
              disabled={!isEditing}
              className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed hover:bg-secondary/20 transition-colors"
            >
              <Plus size={14} />
            </motion.button>
          </div>
        </div>

        {/* Price */}
        <div className="flex items-center justify-between pt-3 border-t border-secondary/10">
          <span className="text-sm text-secondary/60 font-dubai">السعر</span>
          {isEditing ? (
            <div className="flex items-center gap-2">
              <input
                type="number"
                value={unitPrice}
                onChange={(e) => onPriceChange(item.id, parseInt(e.target.value) || 0)}
                onClick={(e) => e.stopPropagation()}
                className="w-24 h-9 text-center font-dubai font-bold text-secondary bg-white border-2 border-primary/30 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              <span className="text-xs text-secondary/50 font-dubai">ج.م</span>
            </div>
          ) : (
            <motion.span 
              className="font-dubai font-bold text-primary text-xl"
              key={item.price}
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
            >
              {formatPrice(item.price)} ج.م
            </motion.span>
          )}
        </div>
      </div>
    </motion.div>
  );
};

// ============================================
// 📚 LIBRARY POPUP
// ============================================

interface LibraryPopupProps {
  isOpen: boolean;
  onClose: () => void;
  onAddItem: (item: BathroomItemDefinition) => void;
  customItems: BathroomItemDefinition[];
  onAddCustomItem: (item: CustomItemData) => void;
  onDeleteCustomItem: (itemId: string) => void;
}

// مكون العنصر القابل للسحب
const DraggableLibraryItem: React.FC<{ 
  item: BathroomItemDefinition; 
  onAddItem: (item: BathroomItemDefinition) => void;
  isCustom?: boolean;
  onDelete?: (itemId: string) => void;
}> = ({ item, onAddItem, isCustom, onDelete }) => {
  // استخدام getCustomIcon للعناصر المخصصة
  const IconComponent = isCustom 
    ? getCustomIcon(item.icon as unknown as string) 
    : (bathroomIcons[item.id] || item.icon || Package);
  
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: `library-${item.id}`,
    data: {
      type: 'library-item',
      item: item,
    },
  });

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    onAddItem(item);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (onDelete) {
      onDelete(item.id);
    }
  };

  return (
    <motion.div
      ref={setNodeRef}
      whileHover={!isDragging ? { scale: 1.03, y: -2 } : undefined}
      whileTap={!isDragging ? { scale: 0.97 } : undefined}
      className={`relative p-3 bg-white rounded-xl border-2 border-secondary/10 text-right 
        hover:border-primary hover:shadow-lg group w-full select-none
        ${isDragging ? 'opacity-30 cursor-grabbing' : 'cursor-pointer'}`}
      onPointerDown={(e) => e.stopPropagation()}
      onClick={handleClick}
    >
      {/* زر حذف العنصر المخصص */}
      {isCustom && onDelete && (
        <button
          onClick={handleDelete}
          className="absolute -top-2 -right-2 w-6 h-6 text-secondary rounded-md flex items-center justify-center border border-primary/30 hover:scale-110 active:scale-95 transition-all z-50 opacity-0 group-hover:opacity-100"
          style={{ backgroundColor: 'rgb(250, 238, 226)', boxShadow: 'rgba(237, 191, 140, 0.3) 0px 4px 12px' }}
        >
          <Trash2 size={12} />
        </button>
      )}
      
      <div 
        {...attributes}
        {...listeners}
        className="absolute inset-0 z-20"
        style={{ touchAction: 'none' }}
      />
      
      <motion.div
        className="absolute inset-0 pointer-events-none z-10"
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.3), transparent)',
        }}
        initial={{ opacity: 0, x: '-100%' }}
        whileHover={{ opacity: 1, x: '100%' }}
        transition={{ duration: 0.5 }}
      />
      
      <div className="flex flex-col items-center gap-2 relative z-10">
        <div className="w-10 h-10 bg-primary/15 rounded-xl flex items-center justify-center shrink-0 group-hover:bg-primary/25 transition-colors">
          <IconComponent className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div className="text-center">
          <h5 className="font-dubai font-bold text-secondary text-xs truncate mb-0.5">
            {item.name}
          </h5>
          <span className="text-xs text-primary font-dubai font-bold">
            {formatPrice(item.defaultPrice)} ج.م
          </span>
        </div>
      </div>
    </motion.div>
  );
};

// مكون عرض العنصر أثناء السحب
const DragOverlayItem: React.FC<{ item: BathroomItemDefinition }> = ({ item }) => {
  const IconComponent = bathroomIcons[item.id] || item.icon || Package;
  
  return (
    <div 
      className="p-3 bg-white rounded-xl border-2 border-primary shadow-2xl w-32"
      style={{ boxShadow: SHADOWS.cardHover }}
    >
      <div className="flex flex-col items-center gap-2">
        <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
          <IconComponent className="w-5 h-5 text-primary" strokeWidth={2} />
        </div>
        <div className="text-center">
          <h5 className="font-dubai font-bold text-secondary text-xs truncate">
            {item.name}
          </h5>
        </div>
      </div>
    </div>
  );
};

const LibraryPopup: React.FC<LibraryPopupProps> = ({ isOpen, onClose, onAddItem, customItems, onAddCustomItem, onDeleteCustomItem }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<BathroomCategory | 'all' | 'custom'>('all');
  const [activeItem, setActiveItem] = useState<BathroomItemDefinition | null>(null);
  const [showAddCustomModal, setShowAddCustomModal] = useState(false);

  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: { distance: 8 },
  });
  const touchSensor = useSensor(TouchSensor, {
    activationConstraint: { delay: 200, tolerance: 5 },
  });
  const sensors = useSensors(mouseSensor, touchSensor);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const { active } = event;
    const item = active.data.current?.item as BathroomItemDefinition;
    if (item) {
      setActiveItem(item);
    }
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active } = event;
    setActiveItem(null);
    
    const item = active.data.current?.item as BathroomItemDefinition;
    if (item) {
      onAddItem(item);
    }
  }, [onAddItem]);

  const filteredItems = useMemo(() => {
    // إذا كانت الفئة المختارة هي "مخصص"
    if (selectedCategory === 'custom') {
      return customItems.filter((item) => {
        const matchesSearch = item.name.includes(searchTerm) || item.description?.includes(searchTerm);
        return matchesSearch;
      });
    }
    
    return bathroomItems.filter((item) => {
      const matchesSearch = item.name.includes(searchTerm) || item.description?.includes(searchTerm);
      const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchTerm, selectedCategory, customItems]);

  const groupedItems = useMemo(() => {
    if (selectedCategory === 'custom') {
      return { custom: filteredItems };
    }
    if (selectedCategory !== 'all') {
      return { [selectedCategory]: filteredItems };
    }
    return filteredItems.reduce((acc, item) => {
      if (!acc[item.category]) acc[item.category] = [];
      acc[item.category].push(item);
      return acc;
    }, {} as Record<string, typeof filteredItems>);
  }, [filteredItems, selectedCategory]);

  if (!isOpen) return null;

  return createPortal(
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
    <AnimatePresence>
      <motion.div
        data-library-popup="true"
        initial={{ opacity: 0, x: -100 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -100 }}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        className="fixed top-28 bottom-16 left-8 w-96 bg-white rounded-2xl overflow-hidden flex flex-col z-9999 editor-cursor"
        style={{ boxShadow: SHADOWS.modal }}
        onPointerDown={(e) => e.stopPropagation()}
        onMouseDown={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-linear-to-r from-primary to-primary/80 p-4 flex items-center justify-between relative overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <Bath className="absolute -top-10 -right-10 w-40 h-40 text-secondary" />
          </div>
          
          <div className="flex items-center gap-3 relative z-10">
            <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
              <Bath className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <h3 className="font-dubai font-bold text-secondary text-base">مكتبة عناصر الحمام</h3>
              <p className="text-secondary/70 text-xs font-dubai">اختر العناصر لإضافتها</p>
            </div>
          </div>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose}
            className="w-8 h-8 bg-white/20 rounded-lg text-secondary flex items-center justify-center hover:bg-white/30 transition-colors relative z-10"
          >
            <X size={18} />
          </motion.button>
        </div>

        {/* Search & Filters */}
        <div className="p-3 border-b border-secondary/10 space-y-3 bg-accent/20">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-secondary/40" />
            <input
              type="text"
              placeholder="ابحث عن عنصر..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pr-10 pl-3 bg-white rounded-xl border-2 border-secondary/10 font-dubai text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="flex gap-1.5 flex-wrap">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-dubai font-bold ${
                selectedCategory === 'all'
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-white text-secondary border border-secondary/10 hover:border-secondary/30'
              }`}
            >
              الكل
            </motion.button>
            {(Object.keys(bathroomCategories) as BathroomCategory[]).map((cat) => (
              <motion.button
                key={cat}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-dubai font-bold ${
                  selectedCategory === cat
                    ? 'bg-secondary text-white shadow-md'
                    : 'bg-white text-secondary border border-secondary/10 hover:border-secondary/30'
                }`}
              >
                {bathroomCategories[cat].name}
              </motion.button>
            ))}
            {/* زر الفئة المخصصة */}
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedCategory('custom')}
              className={`px-3 py-1.5 rounded-lg text-xs font-dubai font-bold ${
                selectedCategory === 'custom'
                  ? 'bg-secondary text-white shadow-md'
                  : 'bg-white text-secondary border border-secondary/10 hover:border-secondary/30'
              }`}
            >
              مخصص ({customItems.length})
            </motion.button>
          </div>
        </div>

        {/* Items Grid */}
        <div className="flex-1 overflow-y-auto p-3 space-y-4 bg-accent/10" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {/* عناصر مخصصة - أول قسم */}
          <div>
            <h4 className="font-dubai font-bold text-secondary text-sm mb-3 flex items-center gap-2">
              <span className="w-1 h-5 bg-primary rounded-full" />
              عناصر مخصصة
              <span className="text-xs text-secondary/40 font-normal">({customItems.length})</span>
            </h4>
            <div className="grid grid-cols-2 gap-2">
              {/* زر إضافة عنصر مخصص */}
              <motion.button
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => setShowAddCustomModal(true)}
                className="p-3 bg-white rounded-xl border-2 border-dashed border-primary/40 hover:border-primary hover:bg-primary/5 transition-all group flex flex-col items-center justify-center gap-2"
              >
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center group-hover:bg-primary/30 transition-colors">
                  <Plus className="w-5 h-5 text-primary" strokeWidth={2} />
                </div>
                <span className="text-xs text-primary font-dubai font-bold">إضافة</span>
              </motion.button>
              {/* العناصر المخصصة المضافة */}
              {customItems.map((item) => (
                <DraggableLibraryItem 
                  key={item.id} 
                  item={item} 
                  onAddItem={onAddItem}
                  isCustom={true}
                  onDelete={onDeleteCustomItem}
                />
              ))}
            </div>
          </div>
          
          {/* العناصر العادية */}
          {Object.entries(groupedItems).filter(([category]) => category !== 'custom').map(([category, items]) => (
            <div key={category}>
              <h4 className="font-dubai font-bold text-secondary text-sm mb-3 flex items-center gap-2">
                <span className="w-1 h-5 rounded-full bg-primary" />
                {category === 'custom' ? 'عناصر مخصصة' : (bathroomCategories[category as BathroomCategory]?.name || category)}
                <span className="text-xs text-secondary/40 font-normal">({items.length})</span>
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {items.map((item) => (
                  <DraggableLibraryItem 
                    key={item.id} 
                    item={item} 
                    onAddItem={onAddItem}
                    isCustom={item.id.startsWith('custom-')}
                    onDelete={item.id.startsWith('custom-') ? onDeleteCustomItem : undefined}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
        
        {/* نافذة إضافة عنصر مخصص */}
        <AddCustomItemModal
          isOpen={showAddCustomModal}
          onClose={() => setShowAddCustomModal(false)}
          onAdd={onAddCustomItem}
          roomType="bathroom"
          defaultCategory="custom"
        />
      </motion.div>
    </AnimatePresence>
    
    <DragOverlay dropAnimation={null}>
      {activeItem ? <DragOverlayItem item={activeItem} /> : null}
    </DragOverlay>
    </DndContext>,
    document.body
  );
};

// ============================================
// 🚿 MAIN COMPONENT
// ============================================

// دوال تحميل وحفظ العناصر المخصصة
const loadCustomItems = (): BathroomItemDefinition[] => {
  if (typeof window === 'undefined') return [];
  try {
    const saved = localStorage.getItem(CUSTOM_BATHROOM_ITEMS_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (error) {
    console.error('Error loading custom items:', error);
  }
  return [];
};

const saveCustomItems = (items: BathroomItemDefinition[]): void => {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(CUSTOM_BATHROOM_ITEMS_KEY, JSON.stringify(items));
  } catch (error) {
    console.error('Error saving custom items:', error);
  }
};

const BathroomSlide: React.FC<BathroomSlideProps> = ({
  data,
  isEditing = false,
  onUpdate,
  roomNumber = 1,
}) => {
  const room = data.room;
  const [items, setItems] = useState<RoomItem[]>(room?.items || []);
  const [showLibrary, setShowLibrary] = useState(false);
  const [customItems, setCustomItems] = useState<BathroomItemDefinition[]>([]);

  // تحميل العناصر المخصصة عند التحميل
  useEffect(() => {
    setCustomItems(loadCustomItems());
  }, []);

  // إضافة عنصر مخصص
  const handleAddCustomItem = useCallback((itemData: CustomItemData) => {
    const newCustomItem: BathroomItemDefinition = {
      id: itemData.id,
      name: itemData.name,
      nameEn: itemData.name, // استخدام نفس الاسم
      icon: itemData.icon as unknown as typeof Package,
      emoji: '📦', // أيقونة افتراضية
      defaultPrice: itemData.defaultPrice,
      category: 'essentials' as const, // استخدام فئة موجودة
      description: 'عنصر مخصص',
    };
    
    const updatedItems = [...customItems, newCustomItem];
    setCustomItems(updatedItems);
    saveCustomItems(updatedItems);
  }, [customItems]);

  // حذف عنصر مخصص
  const handleDeleteCustomItem = useCallback((itemId: string) => {
    const updatedItems = customItems.filter(item => item.id !== itemId);
    setCustomItems(updatedItems);
    saveCustomItems(updatedItems);
  }, [customItems]);

  const { setNodeRef, isOver } = useDroppable({
    id: `bathroom-${roomNumber}`,
    data: { type: 'bathroom', roomNumber },
  });

  const updateParent = (newItems: RoomItem[]) => {
    const totalCost = newItems.reduce((sum, item) => sum + item.price, 0);
    if (onUpdate) {
      const updatedRoom = {
        id: room?.id || 'bathroom-1',
        type: 'bathroom' as const,
        name: room?.name || 'الحمام',
        number: roomNumber,
        items: newItems,
        totalCost,
      };
      
      onUpdate({
        room: {
          room: updatedRoom,
          showImage: data.showImage ?? false,
          imagePosition: data.imagePosition ?? 'right',
        },
      });
    }
  };

  const handleAddItem = (itemDef: BathroomItemDefinition) => {
    const existingItem = items.find((i) => i.name === itemDef.name);
    
    if (existingItem) {
      const newItems = items.map((i) =>
        i.id === existingItem.id 
          ? { ...i, quantity: i.quantity + 1, price: (i.price / i.quantity) * (i.quantity + 1) } 
          : i
      );
      setItems(newItems);
      updateParent(newItems);
    } else {
      // التحقق من إذا كان العنصر مخصص
      const isCustom = itemDef.id.startsWith('custom-');
      const newItem: RoomItem = {
        id: `${itemDef.id}-${Date.now()}`,
        name: itemDef.name,
        icon: isCustom ? (itemDef.icon as unknown as string) : itemDef.emoji,
        price: itemDef.defaultPrice,
        quantity: 1,
      };
      const newItems = [...items, newItem];
      setItems(newItems);
      updateParent(newItems);
    }
  };

  const handleRemoveItem = (itemId: string) => {
    const newItems = items.filter((item) => item.id !== itemId);
    setItems(newItems);
    updateParent(newItems);
  };

  const handlePriceChange = (itemId: string, newUnitPrice: number) => {
    const newItems = items.map((item) =>
      item.id === itemId
        ? { ...item, price: newUnitPrice * item.quantity }
        : item
    );
    setItems(newItems);
    updateParent(newItems);
  };

  const handleQuantityChange = (itemId: string, newQuantity: number) => {
    const newItems = items.map((item) => {
      if (item.id === itemId) {
        const unitPrice = Math.round(item.price / item.quantity);
        return {
          ...item,
          quantity: newQuantity,
          price: unitPrice * newQuantity,
        };
      }
      return item;
    });
    setItems(newItems);
    updateParent(newItems);
  };

  const handleImageChange = (itemId: string, image: string | undefined) => {
    const newItems = items.map((item) =>
      item.id === itemId ? { ...item, image } : item
    );
    setItems(newItems);
    updateParent(newItems);
  };

  const totalCost = items.reduce((sum, item) => sum + item.price, 0);

  useEffect(() => {
    if (room?.items) {
      setItems(room.items);
    }
  }, [room?.items]);

  return (
    <div className="min-h-full p-6 md:p-8 bg-linear-to-br from-accent/30 via-white to-accent/20 pb-24">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-5xl mx-auto space-y-8"
      >
        {/* Header Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-white p-6 sm:p-8 border-2 border-primary/20"
          style={{ boxShadow: SHADOWS.card }}
        >
          <div className="absolute -top-8 -left-8 opacity-[0.08] pointer-events-none">
            <Bath className="w-56 h-56 text-primary" strokeWidth={1.5} />
          </div>

          <div className="relative z-10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex items-center gap-4">
              <motion.div 
                className="p-4 rounded-2xl bg-primary/20 border-2 border-primary/30"
                whileHover={{ scale: 1.05, rotate: 5 }}
                style={{ boxShadow: SHADOWS.icon }}
              >
                <Bath className="w-8 h-8 text-primary" strokeWidth={2} />
              </motion.div>
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-secondary font-dubai">
                  {roomNumber > 1 ? `الحمام ${roomNumber}` : 'الحمام'}
                </h2>
                <p className="text-secondary/60 font-dubai text-sm">
                  أضف وعدّل عناصر ومستلزمات الحمام
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="text-center px-4 py-2 bg-accent/30 rounded-xl">
                <span className="block text-2xl font-bold text-secondary font-bristone">{items.length}</span>
                <span className="text-xs text-secondary/60 font-dubai">عنصر</span>
              </div>
              <div className="text-center px-4 py-2 bg-primary/20 rounded-xl">
                <span className="block text-xl font-bold text-primary font-bristone">{formatPrice(totalCost)}</span>
                <span className="text-xs text-secondary/60 font-dubai">ج.م</span>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Items Container */}
        <motion.div
          ref={setNodeRef}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={`
            min-h-100 p-6 rounded-2xl sm:rounded-3xl border-2
            ${isOver 
              ? 'border-primary bg-primary/5' 
              : 'border-dashed border-secondary/20 bg-white/50'
            }
          `}
          style={{ boxShadow: isOver ? SHADOWS.cardHover : 'none' }}
        >
          {items.length === 0 ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full min-h-87 flex flex-col items-center justify-center text-center"
            >
              <motion.div
                animate={{ 
                  y: [0, -10, 0],
                  rotate: [0, 5, -5, 0],
                }}
                transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
                className="relative mb-6"
              >
                <div className="absolute inset-0 bg-primary/20 rounded-3xl blur-xl" />
                <div 
                  className="relative w-24 h-24 bg-linear-to-br from-primary/30 to-primary/10 rounded-3xl flex items-center justify-center border-2 border-primary/30"
                  style={{ boxShadow: SHADOWS.icon }}
                >
                  <Bath className="w-16 h-16 text-primary" strokeWidth={1.5} />
                </div>
              </motion.div>
              
              <h4 className="font-dubai font-bold text-secondary text-xl mb-2">
                لا توجد عناصر بعد
              </h4>
              <p className="font-dubai text-secondary/50 text-sm max-w-sm mb-6">
                ابدأ بإضافة عناصر الحمام من المكتبة لحساب التكلفة المتوقعة
              </p>
              
              {isEditing && (
                <motion.button
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => setShowLibrary(true)}
                  className="flex items-center gap-3 px-6 py-3 bg-linear-to-r from-primary to-primary/80 text-secondary rounded-xl font-dubai font-bold shadow-lg hover:shadow-xl transition-shadow"
                  style={{ boxShadow: SHADOWS.button }}
                >
                  <Sparkles size={18} />
                  فتح مكتبة العناصر
                </motion.button>
              )}
            </motion.div>
          ) : (
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                <AnimatePresence mode="popLayout">
                  {items.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, scale: 0.8, y: 20 }}
                      animate={{ 
                        opacity: 1, 
                        scale: 1, 
                        y: 0,
                        transition: { delay: index * 0.05 }
                      }}
                      exit={{ opacity: 0, scale: 0.8, y: -20 }}
                    >
                      <ItemWidget
                        item={item}
                        isEditing={isEditing}
                        onRemove={handleRemoveItem}
                        onPriceChange={handlePriceChange}
                        onQuantityChange={handleQuantityChange}
                        onImageChange={handleImageChange}
                      />
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {isEditing && (
                <motion.button
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  whileHover={{ scale: 1.01, y: -2 }}
                  whileTap={{ scale: 0.99 }}
                  onClick={() => setShowLibrary(true)}
                  className="w-full p-5 rounded-2xl border-2 border-dashed border-primary/40 bg-primary/5 text-primary font-dubai font-bold flex items-center justify-center gap-3 hover:bg-primary/10 hover:border-primary"
                >
                  <Plus size={22} />
                  إضافة عنصر جديد
                </motion.button>
              )}
            </div>
          )}
        </motion.div>

        {/* Total Card */}
        {items.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="relative rounded-2xl sm:rounded-3xl overflow-hidden bg-linear-to-r from-secondary to-secondary/90 p-6 text-white"
            style={{ boxShadow: SHADOWS.modal }}
          >
            <div className="absolute -top-10 -left-10 opacity-10 pointer-events-none">
              <Bath className="w-40 h-40 text-white" strokeWidth={1.5} />
            </div>

            <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                  <Bath className="w-7 h-7 text-primary" />
                </div>
                <div>
                  <h4 className="font-dubai font-bold text-xl">إجمالي تكلفة الحمام</h4>
                  <span className="text-white/70 text-sm font-dubai">{items.length} عنصر مضاف</span>
                </div>
              </div>
              
              <motion.div 
                key={totalCost}
                initial={{ scale: 1.1 }}
                animate={{ scale: 1 }}
                className="text-center sm:text-left"
              >
                <span className="font-bristone font-bold text-4xl text-primary">
                  {formatPrice(totalCost)}
                </span>
                <span className="text-white/70 text-lg font-dubai mr-2">ج.م</span>
              </motion.div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <LibraryPopup
        isOpen={showLibrary}
        onClose={() => setShowLibrary(false)}
        onAddItem={handleAddItem}
        customItems={customItems}
        onAddCustomItem={handleAddCustomItem}
        onDeleteCustomItem={handleDeleteCustomItem}
      />
    </div>
  );
};

export default BathroomSlide;
