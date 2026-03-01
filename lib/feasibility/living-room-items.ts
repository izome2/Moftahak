/**
 * عناصر غرفة المعيشة (الصالة)
 * تعريف جميع العناصر المتاحة لغرفة المعيشة مع الأيقونات والأسعار
 */

import { 
  Sofa,
  Tv,
  Speaker,
  Lamp,
  Coffee,
  BookOpen,
  Frame,
  Blinds,
  Wind,
  Fan,
  Gamepad2,
  Wifi,
  Lightbulb,
  Square,
  Clock,
  Palette,
  Armchair,
  type LucideIcon
} from 'lucide-react';

// تعريف نوع عنصر غرفة المعيشة
export interface LivingRoomItemDefinition {
  id: string;
  name: string;
  nameEn: string;
  icon: LucideIcon;
  emoji: string;
  defaultPrice: number;
  category: 'seating' | 'entertainment' | 'tables' | 'lighting' | 'appliances' | 'decor';
  description?: string;
}

// فئات عناصر غرفة المعيشة
export const livingRoomCategories = {
  seating: {
    name: 'الجلوس',
    nameEn: 'Seating',
    icon: Sofa,
  },
  entertainment: {
    name: 'الترفيه',
    nameEn: 'Entertainment',
    icon: Tv,
  },
  tables: {
    name: 'الطاولات',
    nameEn: 'Tables',
    icon: Coffee,
  },
  lighting: {
    name: 'الإضاءة',
    nameEn: 'Lighting',
    icon: Lamp,
  },
  appliances: {
    name: 'الأجهزة',
    nameEn: 'Appliances',
    icon: Wind,
  },
  decor: {
    name: 'الديكور',
    nameEn: 'Decor',
    icon: Frame,
  },
} as const;

// قائمة عناصر غرفة المعيشة
export const livingRoomItems: LivingRoomItemDefinition[] = [
  // الجلوس
  {
    id: 'sofa-2-seater',
    name: 'كنبة 2 مقعد',
    nameEn: '2-Seater Sofa',
    icon: Sofa,
    emoji: '🛋️',
    defaultPrice: 4000,
    category: 'seating',
    description: 'كنبة مريحة لشخصين',
  },
  {
    id: 'sofa-3-seater',
    name: 'كنبة 3 مقعد',
    nameEn: '3-Seater Sofa',
    icon: Sofa,
    emoji: '🛋️',
    defaultPrice: 6000,
    category: 'seating',
    description: 'كنبة مريحة لثلاث أشخاص',
  },
  {
    id: 'sofa-corner',
    name: 'كنبة زاوية',
    nameEn: 'Corner Sofa',
    icon: Sofa,
    emoji: '🛋️',
    defaultPrice: 12000,
    category: 'seating',
    description: 'كنبة زاوية كبيرة',
  },
  {
    id: 'armchair-living',
    name: 'كرسي فردي',
    nameEn: 'Armchair',
    icon: Armchair,
    emoji: '💺',
    defaultPrice: 2500,
    category: 'seating',
    description: 'كرسي مريح فردي',
  },
  {
    id: 'bean-bag',
    name: 'بين باج',
    nameEn: 'Bean Bag',
    icon: Sofa,
    emoji: '🟤',
    defaultPrice: 800,
    category: 'seating',
    description: 'مقعد بين باج مريح',
  },
  {
    id: 'ottoman',
    name: 'بوف',
    nameEn: 'Ottoman',
    icon: Square,
    emoji: '🟫',
    defaultPrice: 600,
    category: 'seating',
    description: 'مقعد بوف مع تخزين',
  },
  
  // الترفيه
  {
    id: 'tv-43',
    name: 'تلفزيون 43 بوصة',
    nameEn: '43" Smart TV',
    icon: Tv,
    emoji: '📺',
    defaultPrice: 5000,
    category: 'entertainment',
    description: 'تلفزيون سمارت 43 بوصة',
  },
  {
    id: 'tv-55',
    name: 'تلفزيون 55 بوصة',
    nameEn: '55" Smart TV',
    icon: Tv,
    emoji: '📺',
    defaultPrice: 8000,
    category: 'entertainment',
    description: 'تلفزيون سمارت 55 بوصة',
  },
  {
    id: 'tv-65',
    name: 'تلفزيون 65 بوصة',
    nameEn: '65" Smart TV',
    icon: Tv,
    emoji: '📺',
    defaultPrice: 12000,
    category: 'entertainment',
    description: 'تلفزيون سمارت 65 بوصة',
  },
  {
    id: 'tv-stand',
    name: 'طاولة تلفزيون',
    nameEn: 'TV Stand',
    icon: Tv,
    emoji: '🗄️',
    defaultPrice: 2000,
    category: 'entertainment',
    description: 'طاولة تلفزيون مع أدراج',
  },
  {
    id: 'soundbar',
    name: 'ساوند بار',
    nameEn: 'Soundbar',
    icon: Speaker,
    emoji: '🔊',
    defaultPrice: 2500,
    category: 'entertainment',
    description: 'نظام صوت ساوند بار',
  },
  {
    id: 'home-theater',
    name: 'هوم ثياتر',
    nameEn: 'Home Theater',
    icon: Speaker,
    emoji: '🎬',
    defaultPrice: 5000,
    category: 'entertainment',
    description: 'نظام هوم ثياتر 5.1',
  },
  {
    id: 'gaming-console',
    name: 'جهاز ألعاب',
    nameEn: 'Gaming Console',
    icon: Gamepad2,
    emoji: '🎮',
    defaultPrice: 4000,
    category: 'entertainment',
    description: 'جهاز بلايستيشن أو إكس بوكس',
  },
  
  // الطاولات
  {
    id: 'coffee-table',
    name: 'طاولة قهوة',
    nameEn: 'Coffee Table',
    icon: Coffee,
    emoji: '☕',
    defaultPrice: 1500,
    category: 'tables',
    description: 'طاولة قهوة مركزية',
  },
  {
    id: 'side-table',
    name: 'طاولة جانبية',
    nameEn: 'Side Table',
    icon: Square,
    emoji: '🪑',
    defaultPrice: 600,
    category: 'tables',
    description: 'طاولة جانبية صغيرة',
  },
  {
    id: 'console-table',
    name: 'كونسول',
    nameEn: 'Console Table',
    icon: Square,
    emoji: '🗄️',
    defaultPrice: 2000,
    category: 'tables',
    description: 'كونسول للمدخل أو الحائط',
  },
  {
    id: 'bookshelf',
    name: 'مكتبة',
    nameEn: 'Bookshelf',
    icon: BookOpen,
    emoji: '📚',
    defaultPrice: 2500,
    category: 'tables',
    description: 'مكتبة للكتب والديكور',
  },
  
  // الإضاءة
  {
    id: 'chandelier',
    name: 'ثريا',
    nameEn: 'Chandelier',
    icon: Lightbulb,
    emoji: '💫',
    defaultPrice: 3000,
    category: 'lighting',
    description: 'ثريا رئيسية للصالة',
  },
  {
    id: 'floor-lamp-living',
    name: 'مصباح أرضي',
    nameEn: 'Floor Lamp',
    icon: Lamp,
    emoji: '🪔',
    defaultPrice: 800,
    category: 'lighting',
    description: 'مصباح أرضي للزوايا',
  },
  {
    id: 'table-lamp',
    name: 'مصباح طاولة',
    nameEn: 'Table Lamp',
    icon: Lamp,
    emoji: '💡',
    defaultPrice: 400,
    category: 'lighting',
    description: 'مصباح طاولة ديكوري',
  },
  {
    id: 'spot-lights',
    name: 'سبوت لايت',
    nameEn: 'Spot Lights',
    icon: Lightbulb,
    emoji: '✨',
    defaultPrice: 200,
    category: 'lighting',
    description: 'إضاءة سبوت موجهة',
  },
  {
    id: 'led-strip-living',
    name: 'شريط LED',
    nameEn: 'LED Strip',
    icon: Lightbulb,
    emoji: '🌈',
    defaultPrice: 300,
    category: 'lighting',
    description: 'إضاءة LED ديكورية',
  },
  
  // الأجهزة
  {
    id: 'ac-living',
    name: 'تكييف',
    nameEn: 'Air Conditioner',
    icon: Wind,
    emoji: '❄️',
    defaultPrice: 15000,
    category: 'appliances',
    description: 'تكييف سبليت 2.25 حصان',
  },
  {
    id: 'fan-living',
    name: 'مروحة سقف',
    nameEn: 'Ceiling Fan',
    icon: Fan,
    emoji: '🌀',
    defaultPrice: 1200,
    category: 'appliances',
    description: 'مروحة سقف مع إضاءة',
  },
  {
    id: 'air-purifier',
    name: 'منقي هواء',
    nameEn: 'Air Purifier',
    icon: Wind,
    emoji: '🌬️',
    defaultPrice: 2000,
    category: 'appliances',
    description: 'جهاز تنقية الهواء',
  },
  {
    id: 'router',
    name: 'راوتر واي فاي',
    nameEn: 'WiFi Router',
    icon: Wifi,
    emoji: '📶',
    defaultPrice: 500,
    category: 'appliances',
    description: 'راوتر واي فاي سريع',
  },
  
  // الديكور
  {
    id: 'curtains-living',
    name: 'ستائر',
    nameEn: 'Curtains',
    icon: Blinds,
    emoji: '🪟',
    defaultPrice: 2000,
    category: 'decor',
    description: 'ستائر كبيرة للصالة',
  },
  {
    id: 'carpet-living',
    name: 'سجادة كبيرة',
    nameEn: 'Large Carpet',
    icon: Square,
    emoji: '🧶',
    defaultPrice: 2500,
    category: 'decor',
    description: 'سجادة كبيرة للصالة',
  },
  {
    id: 'wall-art-living',
    name: 'لوحات فنية',
    nameEn: 'Wall Art',
    icon: Frame,
    emoji: '🖼️',
    defaultPrice: 1000,
    category: 'decor',
    description: 'مجموعة لوحات فنية',
  },
  {
    id: 'mirror-living',
    name: 'مرآة ديكورية',
    nameEn: 'Decorative Mirror',
    icon: Frame,
    emoji: '🪞',
    defaultPrice: 1200,
    category: 'decor',
    description: 'مرآة ديكورية كبيرة',
  },
  {
    id: 'clock-living',
    name: 'ساعة حائط',
    nameEn: 'Wall Clock',
    icon: Clock,
    emoji: '🕐',
    defaultPrice: 400,
    category: 'decor',
    description: 'ساعة حائط أنيقة',
  },
  {
    id: 'vase',
    name: 'فازة',
    nameEn: 'Vase',
    icon: Palette,
    emoji: '🏺',
    defaultPrice: 300,
    category: 'decor',
    description: 'فازة ديكورية',
  },
  {
    id: 'plants-living',
    name: 'نباتات زينة',
    nameEn: 'Decorative Plants',
    icon: Palette,
    emoji: '🪴',
    defaultPrice: 400,
    category: 'decor',
    description: 'نباتات زينة داخلية',
  },
  {
    id: 'cushions',
    name: 'وسائد',
    nameEn: 'Cushions',
    icon: Square,
    emoji: '🛋️',
    defaultPrice: 150,
    category: 'decor',
    description: 'وسائد ديكورية للكنب',
  },
];

// دالة للحصول على العناصر حسب الفئة
export const getLivingRoomItemsByCategory = (category: LivingRoomItemDefinition['category']): LivingRoomItemDefinition[] => {
  return livingRoomItems.filter(item => item.category === category);
};

// دالة للحصول على جميع الفئات مع عناصرها
export const getLivingRoomItemsGroupedByCategory = (): Record<string, LivingRoomItemDefinition[]> => {
  const grouped: Record<string, LivingRoomItemDefinition[]> = {};
  
  Object.keys(livingRoomCategories).forEach(category => {
    grouped[category] = getLivingRoomItemsByCategory(category as LivingRoomItemDefinition['category']);
  });
  
  return grouped;
};

// دالة لإنشاء عنصر غرفة من التعريف
export const createLivingRoomRoomItem = (itemDef: LivingRoomItemDefinition, quantity: number = 1) => {
  return {
    id: `${itemDef.id}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: itemDef.name,
    icon: itemDef.emoji,
    price: itemDef.defaultPrice,
    quantity,
    category: itemDef.category,
  };
};

// دالة لحساب التكلفة الإجمالية
export const calculateLivingRoomTotalCost = (items: { price: number; quantity: number }[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
