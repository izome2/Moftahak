'use client';

// نظام الأيقونات المتقدم للغرف - Lucide Icons
import React from 'react';
import {
  // أيقونات المطبخ
  Refrigerator,
  Flame,
  Microwave,
  CookingPot,
  Utensils,
  Coffee,
  Zap,
  Droplets,
  Fan,
  ChefHat,
  Soup,
  Pizza,
  Sandwich,
  Wine,
  Milk,
  Cookie,
  Package,
  Archive,
  Trash2,
  
  // أيقونات غرفة النوم
  Bed,
  Lamp,
  Moon,
  AlarmClock,
  Armchair,
  Shirt,
  BookOpen,
  Tv,
  Speaker,
  Wifi,
  
  // أيقونات غرفة المعيشة
  Sofa,
  Monitor,
  Gamepad2,
  Music,
  Flower2,
  Frame,
  Clock,
  
  // أيقونات الحمام
  Bath,
  ShowerHead,
  Sparkles,
  Wind,
  Droplet,
  Pill,
  Heart,
  
  // أيقونات عامة
  Plus,
  Package as Box,
  Circle,
  LucideIcon,
} from 'lucide-react';

// نوع دالة الأيقونة
export type IconComponent = LucideIcon;

// ===========================
// أيقونات المطبخ
// ===========================
export const kitchenIcons: Record<string, IconComponent> = {
  // الأجهزة الكهربائية
  'fridge': Refrigerator,
  'stove': Flame,
  'microwave': Microwave,
  'oven': Pizza,
  'dishwasher': Droplets,
  'kettle': Coffee,
  'coffee-maker': Coffee,
  'blender': Zap,
  'toaster': Sandwich,
  'mixer': CookingPot,
  'water-filter': Droplets,
  'hood': Fan,
  
  // أدوات الطهي
  'pots-set': CookingPot,
  'frying-pan': Soup,
  'baking-tray': Cookie,
  'pressure-cooker': CookingPot,
  
  // أدوات المائدة
  'dishes-set': Utensils,
  'glasses-set': Wine,
  'cutlery-set': Utensils,
  'mugs-set': Coffee,
  'serving-dishes': Utensils,
  
  // التخزين
  'food-containers': Package,
  'spice-rack': Archive,
  'dish-rack': Package,
  
  // الأساسيات
  'trash-bin': Trash2,
  'cutting-board': ChefHat,
  'kitchen-towels': Sparkles,
  'soap-dispenser': Droplet,
};

// ===========================
// أيقونات غرفة النوم
// ===========================
export const bedroomIcons: Record<string, IconComponent> = {
  'bed': Bed,
  'mattress': Bed,
  'pillows': Moon,
  'blankets': Sparkles,
  'bed-sheets': Sparkles,
  'wardrobe': Armchair,
  'dresser': Archive,
  'nightstand': Lamp,
  'lamp': Lamp,
  'mirror': Frame,
  'curtains': Frame,
  'alarm-clock': AlarmClock,
  'hanger': Shirt,
  'clothes': Shirt,
  'tv': Tv,
  'speaker': Speaker,
  'book': BookOpen,
  'wifi': Wifi,
};

// ===========================
// أيقونات غرفة المعيشة
// ===========================
export const livingRoomIcons: Record<string, IconComponent> = {
  'sofa': Sofa,
  'armchair': Armchair,
  'coffee-table': Box,
  'tv': Tv,
  'tv-stand': Monitor,
  'bookshelf': BookOpen,
  'rug': Frame,
  'curtains': Frame,
  'lamp': Lamp,
  'floor-lamp': Lamp,
  'plant': Flower2,
  'artwork': Frame,
  'clock': Clock,
  'speaker': Speaker,
  'gaming': Gamepad2,
  'music': Music,
};

// ===========================
// أيقونات الحمام
// ===========================
export const bathroomIcons: Record<string, IconComponent> = {
  'toilet': Bath,
  'sink': Droplet,
  'shower': ShowerHead,
  'bathtub': Bath,
  'mirror': Frame,
  'cabinet': Archive,
  'towels': Sparkles,
  'toilet-paper': Sparkles,
  'soap': Droplet,
  'shampoo': Droplet,
  'toothbrush': Sparkles,
  'hairdryer': Wind,
  'scale': Heart,
  'medicine': Pill,
  'trash-bin': Trash2,
};

// ===========================
// دالة الحصول على الأيقونة
// ===========================
export const getIcon = (
  itemId: string, 
  roomType: 'kitchen' | 'bedroom' | 'livingRoom' | 'bathroom'
): IconComponent => {
  const iconMaps = {
    kitchen: kitchenIcons,
    bedroom: bedroomIcons,
    livingRoom: livingRoomIcons,
    bathroom: bathroomIcons,
  };
  
  const iconMap = iconMaps[roomType];
  return iconMap[itemId] || Circle;
};

// ===========================
// دالة رندر الأيقونة
// ===========================
interface RenderIconProps {
  itemId: string;
  roomType: 'kitchen' | 'bedroom' | 'livingRoom' | 'bathroom';
  className?: string;
  size?: number;
}

export const RenderIcon: React.FC<RenderIconProps> = ({ 
  itemId, 
  roomType, 
  className = '', 
  size = 24 
}) => {
  const IconComponent = getIcon(itemId, roomType);
  return <IconComponent className={className} size={size} />;
};

// ===========================
// أيقونات الرأس لكل غرفة
// ===========================
export const roomHeaderIcons = {
  kitchen: ChefHat,
  bedroom: Bed,
  livingRoom: Sofa,
  bathroom: Bath,
};

// ===========================
// ألوان الأيقونات حسب الغرفة
// ===========================
export const iconColors = {
  kitchen: {
    primary: '#edbf8c',
    secondary: '#10302b',
    accent: '#f97316', // Orange
  },
  bedroom: {
    primary: '#edbf8c',
    secondary: '#10302b',
    accent: '#8b5cf6', // Purple
  },
  livingRoom: {
    primary: '#edbf8c',
    secondary: '#10302b',
    accent: '#3b82f6', // Blue
  },
  bathroom: {
    primary: '#edbf8c',
    secondary: '#10302b',
    accent: '#06b6d4', // Cyan
  },
};

// ===========================
// أنماط الأيقونات
// ===========================
export const iconStyles = {
  // أيقونة كبيرة للرأس
  header: 'w-10 h-10 stroke-[1.5]',
  
  // أيقونة متوسطة للعناصر
  widget: 'w-6 h-6 stroke-[1.5]',
  
  // أيقونة صغيرة للمكتبة
  library: 'w-5 h-5 stroke-[1.5]',
  
  // أيقونة مصغرة
  tiny: 'w-4 h-4 stroke-[2]',
};

export default {
  getIcon,
  RenderIcon,
  kitchenIcons,
  bedroomIcons,
  livingRoomIcons,
  bathroomIcons,
  roomHeaderIcons,
  iconColors,
  iconStyles,
};
