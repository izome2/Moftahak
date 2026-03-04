'use client';

/**
 * AddCustomItemModal - نافذة إضافة عنصر مخصص
 * 
 * تتيح للمستخدم إضافة عناصر مخصصة إلى المكتبة مع:
 * - اختيار أيقونة من المتوفر
 * - إدخال اسم العنصر
 * - إدخال السعر
 */

import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import useCurrencyFormatter from '@/hooks/useCurrencyFormatter';
import { 
  X, 
  Plus,
  Package,
  Check,
  // أيقونات متنوعة للاختيار
  Refrigerator, Flame, Microwave, CookingPot, Utensils, Coffee, Zap, Droplets, Fan,
  ChefHat, Soup, Pizza, Sandwich, Wine, Milk, Cookie, Archive, Trash2,
  Bed, Lamp, Moon, AlarmClock, Armchair, Shirt, BookOpen, Tv, Speaker, Wifi,
  Sofa, Monitor, Gamepad2, Music, Flower2, Frame, Clock,
  Bath, ShowerHead, Sparkles, Wind, Droplet, Pill, Heart,
  Box, Star, Home, Settings, Wrench, Hammer, Scissors, PaintBucket,
  type LucideIcon,
} from 'lucide-react';

// ============================================
// 🎨 DESIGN TOKENS
// ============================================

const SHADOWS = {
  modal: 'rgba(16, 48, 43, 0.25) 0px 25px 50px -12px',
  button: 'rgba(16, 48, 43, 0.15) 0px 4px 12px',
};

// ============================================
// 📋 TYPES
// ============================================

export interface CustomItemData {
  id: string;
  name: string;
  icon: string;
  defaultPrice: number;
  category: string;
  isCustom: true;
}

interface AddCustomItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: CustomItemData) => void;
  roomType: 'kitchen' | 'bedroom' | 'living-room' | 'bathroom';
  defaultCategory?: string;
}

// ============================================
// 🎨 AVAILABLE ICONS
// ============================================

const availableIcons: { id: string; icon: LucideIcon; name: string }[] = [
  // عامة
  { id: 'package', icon: Package, name: 'صندوق' },
  { id: 'box', icon: Box, name: 'علبة' },
  { id: 'star', icon: Star, name: 'نجمة' },
  { id: 'home', icon: Home, name: 'منزل' },
  { id: 'settings', icon: Settings, name: 'إعدادات' },
  { id: 'wrench', icon: Wrench, name: 'مفتاح' },
  { id: 'hammer', icon: Hammer, name: 'مطرقة' },
  { id: 'scissors', icon: Scissors, name: 'مقص' },
  { id: 'paint', icon: PaintBucket, name: 'دهان' },
  
  // مطبخ
  { id: 'refrigerator', icon: Refrigerator, name: 'ثلاجة' },
  { id: 'flame', icon: Flame, name: 'نار' },
  { id: 'microwave', icon: Microwave, name: 'مايكرويف' },
  { id: 'cooking-pot', icon: CookingPot, name: 'قدر' },
  { id: 'utensils', icon: Utensils, name: 'أدوات' },
  { id: 'coffee', icon: Coffee, name: 'قهوة' },
  { id: 'zap', icon: Zap, name: 'كهرباء' },
  { id: 'droplets', icon: Droplets, name: 'قطرات' },
  { id: 'fan', icon: Fan, name: 'مروحة' },
  { id: 'chef-hat', icon: ChefHat, name: 'قبعة شيف' },
  { id: 'soup', icon: Soup, name: 'شوربة' },
  { id: 'pizza', icon: Pizza, name: 'بيتزا' },
  { id: 'sandwich', icon: Sandwich, name: 'ساندويتش' },
  { id: 'wine', icon: Wine, name: 'كأس' },
  { id: 'milk', icon: Milk, name: 'حليب' },
  { id: 'cookie', icon: Cookie, name: 'بسكويت' },
  { id: 'archive', icon: Archive, name: 'أرشيف' },
  { id: 'trash', icon: Trash2, name: 'سلة' },
  
  // غرفة نوم
  { id: 'bed', icon: Bed, name: 'سرير' },
  { id: 'lamp', icon: Lamp, name: 'مصباح' },
  { id: 'moon', icon: Moon, name: 'قمر' },
  { id: 'alarm', icon: AlarmClock, name: 'منبه' },
  { id: 'armchair', icon: Armchair, name: 'كرسي' },
  { id: 'shirt', icon: Shirt, name: 'ملابس' },
  { id: 'book', icon: BookOpen, name: 'كتاب' },
  { id: 'tv', icon: Tv, name: 'تلفزيون' },
  { id: 'speaker', icon: Speaker, name: 'سماعة' },
  { id: 'wifi', icon: Wifi, name: 'واي فاي' },
  
  // صالة
  { id: 'sofa', icon: Sofa, name: 'أريكة' },
  { id: 'monitor', icon: Monitor, name: 'شاشة' },
  { id: 'gamepad', icon: Gamepad2, name: 'ألعاب' },
  { id: 'music', icon: Music, name: 'موسيقى' },
  { id: 'flower', icon: Flower2, name: 'زهرة' },
  { id: 'frame', icon: Frame, name: 'إطار' },
  { id: 'clock', icon: Clock, name: 'ساعة' },
  
  // حمام
  { id: 'bath', icon: Bath, name: 'حوض' },
  { id: 'shower', icon: ShowerHead, name: 'دش' },
  { id: 'sparkles', icon: Sparkles, name: 'لمعان' },
  { id: 'wind', icon: Wind, name: 'هواء' },
  { id: 'droplet', icon: Droplet, name: 'قطرة' },
  { id: 'pill', icon: Pill, name: 'دواء' },
  { id: 'heart', icon: Heart, name: 'قلب' },
];

// دالة للحصول على الأيقونة
export const getCustomIcon = (iconId: string): LucideIcon => {
  const found = availableIcons.find(i => i.id === iconId);
  return found?.icon || Package;
};

// ============================================
// 💰 HELPERS
// ============================================

const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

// ============================================
// 🎯 MAIN COMPONENT
// ============================================

const AddCustomItemModal: React.FC<AddCustomItemModalProps> = ({
  isOpen,
  onClose,
  onAdd,
  roomType,
  defaultCategory = 'custom',
}) => {
  const { currencySymbol } = useCurrencyFormatter();
  const [name, setName] = useState('');
  const [price, setPrice] = useState<number>(0);
  const [selectedIcon, setSelectedIcon] = useState<string>('package');
  const [error, setError] = useState<string>('');

  const handleSubmit = useCallback(() => {
    // التحقق من الحقول
    if (!name.trim()) {
      setError('يرجى إدخال اسم العنصر');
      return;
    }
    if (price <= 0) {
      setError('يرجى إدخال سعر صحيح');
      return;
    }

    const newItem: CustomItemData = {
      id: `custom-${roomType}-${Date.now()}`,
      name: name.trim(),
      icon: selectedIcon,
      defaultPrice: price,
      category: defaultCategory,
      isCustom: true,
    };

    onAdd(newItem);
    
    // إعادة تعيين الحقول
    setName('');
    setPrice(0);
    setSelectedIcon('package');
    setError('');
    onClose();
  }, [name, price, selectedIcon, roomType, defaultCategory, onAdd, onClose]);

  const handleClose = useCallback(() => {
    setName('');
    setPrice(0);
    setSelectedIcon('package');
    setError('');
    onClose();
  }, [onClose]);

  if (!isOpen) return null;

  return createPortal(
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-10000 flex items-center justify-center p-4 editor-cursor"
        onClick={handleClose}
      >
        {/* Backdrop */}
        <motion.div 
          className="absolute inset-0 bg-black/50"
          initial={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          animate={{ opacity: 1, backdropFilter: 'blur(6px)' }}
          exit={{ opacity: 0, backdropFilter: 'blur(0px)' }}
          transition={{ duration: 0.25, ease: 'easeInOut' }}
        />

        {/* Modal */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-white rounded-2xl overflow-hidden"
          style={{ boxShadow: SHADOWS.modal }}
          onClick={(e) => e.stopPropagation()}
          dir="rtl"
        >
          {/* Header */}
          <div className="bg-linear-to-r from-primary to-primary/80 p-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                <Plus className="w-4 h-4 text-secondary" />
              </div>
              <div>
                <h3 className="font-dubai font-bold text-secondary text-sm">إضافة عنصر مخصص</h3>
                <p className="text-secondary/70 text-xs font-dubai">أضف عنصر جديد</p>
              </div>
            </div>
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={handleClose}
              className="w-7 h-7 bg-white/20 rounded-lg text-secondary flex items-center justify-center hover:bg-white/30 transition-colors"
            >
              <X size={16} />
            </motion.button>
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {/* Name Input */}
            <div>
              <label className="block text-xs font-dubai font-bold text-secondary mb-1.5">
                اسم العنصر
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  if (error === 'يرجى إدخال اسم العنصر') setError('');
                }}
                placeholder="مثال: طاولة جانبية"
                className="w-full h-10 px-3 bg-accent/20 rounded-xl border-2 border-secondary/10 font-dubai text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
              />
              {error === 'يرجى إدخال اسم العنصر' && (
                <p className="text-red-500 text-xs font-dubai mt-1">{error}</p>
              )}
            </div>

            {/* Price Input */}
            <div>
              <label className="block text-xs font-dubai font-bold text-secondary mb-1.5">
                السعر ({currencySymbol})
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={price || ''}
                  onChange={(e) => {
                    setPrice(parseInt(e.target.value) || 0);
                    if (error === 'يرجى إدخال سعر صحيح') setError('');
                  }}
                  placeholder="0"
                  min="0"
                  className="flex-1 h-10 px-3 bg-accent/20 rounded-xl border-2 border-secondary/10 font-dubai text-sm focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20"
                />
                {error === 'يرجى إدخال سعر صحيح' && (
                  <span className="text-red-500 text-xs font-dubai whitespace-nowrap">{error}</span>
                )}
              </div>
            </div>

            {/* Icon Selection */}
            <div>
              <label className="block text-xs font-dubai font-bold text-secondary mb-1.5">
                اختر أيقونة
              </label>
              <div className="grid grid-cols-8 gap-1.5 max-h-32 overflow-y-auto p-2 bg-accent/10 rounded-xl">
                {availableIcons.map((iconData) => {
                  const IconComponent = iconData.icon;
                  const isSelected = selectedIcon === iconData.id;
                  
                  return (
                    <motion.button
                      key={iconData.id}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => setSelectedIcon(iconData.id)}
                      className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all relative
                        ${isSelected 
                          ? 'bg-primary text-secondary shadow-md' 
                          : 'bg-white text-secondary/60 hover:bg-primary/20 hover:text-secondary'
                        }`}
                      title={iconData.name}
                    >
                      <IconComponent size={16} />
                      {isSelected && (
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          className="absolute -top-0.5 -right-0.5 w-3.5 h-3.5 bg-secondary rounded-full flex items-center justify-center"
                        >
                          <Check size={8} className="text-white" />
                        </motion.div>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </div>

            {/* Preview */}
            <div className="p-3 bg-accent/20 rounded-xl">
              <p className="text-xs text-secondary/60 font-dubai mb-2">معاينة:</p>
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary/20 rounded-xl flex items-center justify-center">
                  {React.createElement(getCustomIcon(selectedIcon), { 
                    className: "w-5 h-5 text-primary",
                    strokeWidth: 2
                  })}
                </div>
                <div>
                  <h4 className="font-dubai font-bold text-secondary text-sm">
                    {name || 'اسم العنصر'}
                  </h4>
                  <span className="text-xs text-primary font-dubai font-bold">
                    {formatPrice(price)} {currencySymbol}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-secondary/10 flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleClose}
              className="flex-1 h-9 rounded-xl border-2 border-secondary/20 text-secondary font-dubai font-bold text-sm hover:bg-secondary/5 transition-colors"
            >
              إلغاء
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleSubmit}
              className="flex-1 h-9 rounded-xl bg-secondary text-white font-dubai font-bold text-sm hover:bg-secondary/90 transition-colors flex items-center justify-center gap-2"
              style={{ boxShadow: SHADOWS.button }}
            >
              <Plus size={16} />
              إضافة
            </motion.button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>,
    document.body
  );
};

export default AddCustomItemModal;
