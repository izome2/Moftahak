/**
 * عناصر غرفة النوم
 * تعريف جميع العناصر المتاحة لغرفة النوم مع الأيقونات والأسعار
 */

import { 
  Bed,
  Lamp,
  Wind,
  Tv,
  Armchair,
  Frame,
  Clock,
  Shirt,
  BookOpen,
  Lightbulb,
  Fan,
  Blinds,
  Palette,
  Square,
  Lock,
  type LucideIcon
} from 'lucide-react';

// تعريف نوع عنصر غرفة النوم
export interface BedroomItemDefinition {
  id: string;
  name: string;
  nameEn: string;
  icon: LucideIcon;
  emoji: string;
  defaultPrice: number;
  category: 'beds' | 'furniture' | 'lighting' | 'appliances' | 'decor';
  description?: string;
}

// فئات عناصر غرفة النوم
export const bedroomCategories = {
  beds: {
    name: 'الأسرّة',
    nameEn: 'Beds',
    icon: Bed,
  },
  furniture: {
    name: 'الأثاث',
    nameEn: 'Furniture',
    icon: Armchair,
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

// قائمة عناصر غرفة النوم
export const bedroomItems: BedroomItemDefinition[] = [
  // الأسرّة
  {
    id: 'single-bed',
    name: 'سرير فردي',
    nameEn: 'Single Bed',
    icon: Bed,
    emoji: '🛏️',
    defaultPrice: 3000,
    category: 'beds',
    description: 'سرير فردي مقاس 90×190 سم',
  },
  {
    id: 'double-bed',
    name: 'سرير مزدوج',
    nameEn: 'Double Bed',
    icon: Bed,
    emoji: '🛏️',
    defaultPrice: 5500,
    category: 'beds',
    description: 'سرير مزدوج مقاس 160×200 سم',
  },
  {
    id: 'king-bed',
    name: 'سرير كينج',
    nameEn: 'King Bed',
    icon: Bed,
    emoji: '🛏️',
    defaultPrice: 8000,
    category: 'beds',
    description: 'سرير كينج مقاس 180×200 سم',
  },
  {
    id: 'bunk-bed',
    name: 'سرير بطابقين',
    nameEn: 'Bunk Bed',
    icon: Bed,
    emoji: '🛏️',
    defaultPrice: 4500,
    category: 'beds',
    description: 'سرير بطابقين للأطفال',
  },
  {
    id: 'mattress',
    name: 'مرتبة',
    nameEn: 'Mattress',
    icon: Square,
    emoji: '🛏️',
    defaultPrice: 2500,
    category: 'beds',
    description: 'مرتبة طبية مريحة',
  },
  
  // الأثاث
  {
    id: 'wardrobe',
    name: 'دولاب ملابس',
    nameEn: 'Wardrobe',
    icon: Shirt,
    emoji: '🚪',
    defaultPrice: 6000,
    category: 'furniture',
    description: 'دولاب ملابس 3 أبواب',
  },
  {
    id: 'wardrobe-large',
    name: 'دولاب كبير',
    nameEn: 'Large Wardrobe',
    icon: Shirt,
    emoji: '🚪',
    defaultPrice: 9000,
    category: 'furniture',
    description: 'دولاب ملابس 5 أبواب مع مرآة',
  },
  {
    id: 'dresser',
    name: 'تسريحة',
    nameEn: 'Dresser',
    icon: Frame,
    emoji: '🪞',
    defaultPrice: 3500,
    category: 'furniture',
    description: 'تسريحة مع مرآة',
  },
  {
    id: 'nightstand',
    name: 'كومودينو',
    nameEn: 'Nightstand',
    icon: Square,
    emoji: '🗄️',
    defaultPrice: 800,
    category: 'furniture',
    description: 'طاولة جانبية للسرير',
  },
  {
    id: 'desk',
    name: 'مكتب',
    nameEn: 'Desk',
    icon: BookOpen,
    emoji: '🖥️',
    defaultPrice: 2000,
    category: 'furniture',
    description: 'مكتب للدراسة أو العمل',
  },
  {
    id: 'desk-chair',
    name: 'كرسي مكتب',
    nameEn: 'Desk Chair',
    icon: Armchair,
    emoji: '💺',
    defaultPrice: 1200,
    category: 'furniture',
    description: 'كرسي مكتب مريح',
  },
  {
    id: 'armchair',
    name: 'كرسي استرخاء',
    nameEn: 'Armchair',
    icon: Armchair,
    emoji: '🛋️',
    defaultPrice: 2500,
    category: 'furniture',
    description: 'كرسي استرخاء مريح',
  },
  {
    id: 'shoe-rack',
    name: 'رف أحذية',
    nameEn: 'Shoe Rack',
    icon: Square,
    emoji: '👟',
    defaultPrice: 600,
    category: 'furniture',
    description: 'رف لتنظيم الأحذية',
  },
  
  // الإضاءة
  {
    id: 'bedside-lamp',
    name: 'أباجورة',
    nameEn: 'Bedside Lamp',
    icon: Lamp,
    emoji: '💡',
    defaultPrice: 400,
    category: 'lighting',
    description: 'مصباح جانبي للسرير',
  },
  {
    id: 'ceiling-light',
    name: 'نجفة سقف',
    nameEn: 'Ceiling Light',
    icon: Lightbulb,
    emoji: '💡',
    defaultPrice: 1500,
    category: 'lighting',
    description: 'إضاءة سقف رئيسية',
  },
  {
    id: 'floor-lamp',
    name: 'مصباح أرضي',
    nameEn: 'Floor Lamp',
    icon: Lamp,
    emoji: '🪔',
    defaultPrice: 800,
    category: 'lighting',
    description: 'مصباح أرضي للزوايا',
  },
  {
    id: 'led-strip',
    name: 'شريط LED',
    nameEn: 'LED Strip',
    icon: Lightbulb,
    emoji: '✨',
    defaultPrice: 300,
    category: 'lighting',
    description: 'إضاءة LED ديكورية',
  },
  
  // الأجهزة
  {
    id: 'ac',
    name: 'تكييف',
    nameEn: 'Air Conditioner',
    icon: Wind,
    emoji: '❄️',
    defaultPrice: 12000,
    category: 'appliances',
    description: 'تكييف سبليت 1.5 حصان',
  },
  {
    id: 'fan',
    name: 'مروحة سقف',
    nameEn: 'Ceiling Fan',
    icon: Fan,
    emoji: '🌀',
    defaultPrice: 1200,
    category: 'appliances',
    description: 'مروحة سقف مع إضاءة',
  },
  {
    id: 'heater',
    name: 'دفاية',
    nameEn: 'Heater',
    icon: Wind,
    emoji: '🔥',
    defaultPrice: 1500,
    category: 'appliances',
    description: 'دفاية كهربائية',
  },
  {
    id: 'bedroom-tv',
    name: 'تلفزيون',
    nameEn: 'TV',
    icon: Tv,
    emoji: '📺',
    defaultPrice: 5000,
    category: 'appliances',
    description: 'تلفزيون 43 بوصة سمارت',
  },
  {
    id: 'safe',
    name: 'خزنة',
    nameEn: 'Safe',
    icon: Lock,
    emoji: '🔒',
    defaultPrice: 1500,
    category: 'appliances',
    description: 'خزنة صغيرة للمقتنيات الثمينة',
  },
  
  // الديكور
  {
    id: 'mirror',
    name: 'مرآة كبيرة',
    nameEn: 'Large Mirror',
    icon: Frame,
    emoji: '🪞',
    defaultPrice: 1000,
    category: 'decor',
    description: 'مرآة أرضية كاملة',
  },
  {
    id: 'wall-art',
    name: 'لوحة فنية',
    nameEn: 'Wall Art',
    icon: Frame,
    emoji: '🖼️',
    defaultPrice: 500,
    category: 'decor',
    description: 'لوحة فنية للحائط',
  },
  {
    id: 'curtains',
    name: 'ستائر',
    nameEn: 'Curtains',
    icon: Blinds,
    emoji: '🪟',
    defaultPrice: 1200,
    category: 'decor',
    description: 'ستائر بلاك أوت',
  },
  {
    id: 'carpet',
    name: 'سجادة',
    nameEn: 'Carpet',
    icon: Square,
    emoji: '🧶',
    defaultPrice: 800,
    category: 'decor',
    description: 'سجادة أرضية',
  },
  {
    id: 'wall-clock',
    name: 'ساعة حائط',
    nameEn: 'Wall Clock',
    icon: Clock,
    emoji: '🕐',
    defaultPrice: 300,
    category: 'decor',
    description: 'ساعة حائط ديكورية',
  },
  {
    id: 'plant',
    name: 'نبتة زينة',
    nameEn: 'Plant',
    icon: Palette,
    emoji: '🪴',
    defaultPrice: 200,
    category: 'decor',
    description: 'نبتة زينة داخلية',
  },
];

// دالة للحصول على العناصر حسب الفئة
export const getBedroomItemsByCategory = (category: BedroomItemDefinition['category']): BedroomItemDefinition[] => {
  return bedroomItems.filter(item => item.category === category);
};

// دالة للحصول على جميع الفئات مع عناصرها
export const getBedroomItemsGroupedByCategory = (): Record<string, BedroomItemDefinition[]> => {
  const grouped: Record<string, BedroomItemDefinition[]> = {};
  
  Object.keys(bedroomCategories).forEach(category => {
    grouped[category] = getBedroomItemsByCategory(category as BedroomItemDefinition['category']);
  });
  
  return grouped;
};

// دالة لإنشاء عنصر غرفة من التعريف
export const createBedroomRoomItem = (itemDef: BedroomItemDefinition, quantity: number = 1) => {
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
export const calculateBedroomTotalCost = (items: { price: number; quantity: number }[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
