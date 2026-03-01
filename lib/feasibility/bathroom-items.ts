/**
 * عناصر الحمام
 * تعريف جميع العناصر المتاحة للحمام مع الأيقونات والأسعار
 */

import { 
  Bath,
  Droplets,
  Flame,
  Sparkles,
  Wind,
  Lightbulb,
  Square,
  Pipette,
  ShowerHead,
  type LucideIcon
} from 'lucide-react';

// تعريف نوع عنصر الحمام
export interface BathroomItemDefinition {
  id: string;
  name: string;
  nameEn: string;
  icon: LucideIcon;
  emoji: string;
  defaultPrice: number;
  category: 'fixtures' | 'accessories' | 'appliances' | 'storage' | 'essentials';
  description?: string;
}

// فئات عناصر الحمام
export const bathroomCategories = {
  fixtures: {
    name: 'التركيبات الأساسية',
    nameEn: 'Fixtures',
    icon: Bath,
  },
  accessories: {
    name: 'الإكسسوارات',
    nameEn: 'Accessories',
    icon: Sparkles,
  },
  appliances: {
    name: 'الأجهزة',
    nameEn: 'Appliances',
    icon: Flame,
  },
  storage: {
    name: 'التخزين',
    nameEn: 'Storage',
    icon: Square,
  },
  essentials: {
    name: 'المستلزمات',
    nameEn: 'Essentials',
    icon: Droplets,
  },
} as const;

// قائمة عناصر الحمام
export const bathroomItems: BathroomItemDefinition[] = [
  // التركيبات الأساسية
  {
    id: 'toilet',
    name: 'مرحاض',
    nameEn: 'Toilet',
    icon: Bath,
    emoji: '🚽',
    defaultPrice: 2500,
    category: 'fixtures',
    description: 'مرحاض سيراميك عالي الجودة',
  },
  {
    id: 'toilet-seat',
    name: 'غطاء مرحاض',
    nameEn: 'Toilet Seat',
    icon: Square,
    emoji: '🚽',
    defaultPrice: 200,
    category: 'fixtures',
    description: 'غطاء مرحاض ناعم الإغلاق',
  },
  {
    id: 'sink',
    name: 'حوض غسيل',
    nameEn: 'Sink',
    icon: Droplets,
    emoji: '🚰',
    defaultPrice: 1500,
    category: 'fixtures',
    description: 'حوض غسيل سيراميك',
  },
  {
    id: 'sink-pedestal',
    name: 'حوض بقاعدة',
    nameEn: 'Pedestal Sink',
    icon: Droplets,
    emoji: '🚰',
    defaultPrice: 2000,
    category: 'fixtures',
    description: 'حوض غسيل مع قاعدة',
  },
  {
    id: 'faucet',
    name: 'خلاط مياه',
    nameEn: 'Faucet',
    icon: Pipette,
    emoji: '🚿',
    defaultPrice: 800,
    category: 'fixtures',
    description: 'خلاط مياه ساخنة وباردة',
  },
  {
    id: 'shower',
    name: 'دش',
    nameEn: 'Shower',
    icon: ShowerHead,
    emoji: '🚿',
    defaultPrice: 600,
    category: 'fixtures',
    description: 'رأس دش مع خرطوم',
  },
  {
    id: 'shower-set',
    name: 'طقم دش كامل',
    nameEn: 'Shower Set',
    icon: ShowerHead,
    emoji: '🚿',
    defaultPrice: 1500,
    category: 'fixtures',
    description: 'طقم دش مع خلاط وحامل',
  },
  {
    id: 'bathtub',
    name: 'بانيو',
    nameEn: 'Bathtub',
    icon: Bath,
    emoji: '🛁',
    defaultPrice: 3500,
    category: 'fixtures',
    description: 'بانيو أكريليك 150 سم',
  },
  {
    id: 'bathtub-jacuzzi',
    name: 'جاكوزي',
    nameEn: 'Jacuzzi',
    icon: Bath,
    emoji: '🛁',
    defaultPrice: 8000,
    category: 'fixtures',
    description: 'بانيو جاكوزي مع تدليك مائي',
  },
  {
    id: 'shower-cabin',
    name: 'كابينة شاور',
    nameEn: 'Shower Cabin',
    icon: Square,
    emoji: '🚿',
    defaultPrice: 4000,
    category: 'fixtures',
    description: 'كابينة شاور زجاجية',
  },
  {
    id: 'bidet',
    name: 'شطاف',
    nameEn: 'Bidet',
    icon: Droplets,
    emoji: '💧',
    defaultPrice: 300,
    category: 'fixtures',
    description: 'شطاف مع خلاط',
  },
  
  // الإكسسوارات
  {
    id: 'mirror',
    name: 'مرآة',
    nameEn: 'Mirror',
    icon: Square,
    emoji: '🪞',
    defaultPrice: 500,
    category: 'accessories',
    description: 'مرآة حمام مع إطار',
  },
  {
    id: 'mirror-led',
    name: 'مرآة LED',
    nameEn: 'LED Mirror',
    icon: Lightbulb,
    emoji: '🪞',
    defaultPrice: 1200,
    category: 'accessories',
    description: 'مرآة مع إضاءة LED مدمجة',
  },
  {
    id: 'towel-rack',
    name: 'علاقة مناشف',
    nameEn: 'Towel Rack',
    icon: Square,
    emoji: '🧺',
    defaultPrice: 200,
    category: 'accessories',
    description: 'علاقة مناشف معدنية',
  },
  {
    id: 'towel-ring',
    name: 'حلقة مناشف',
    nameEn: 'Towel Ring',
    icon: Square,
    emoji: '⭕',
    defaultPrice: 100,
    category: 'accessories',
    description: 'حلقة لتعليق المناشف',
  },
  {
    id: 'soap-holder',
    name: 'حامل صابون',
    nameEn: 'Soap Holder',
    icon: Square,
    emoji: '🧼',
    defaultPrice: 80,
    category: 'accessories',
    description: 'حامل صابون سيراميك أو معدني',
  },
  {
    id: 'soap-dispenser',
    name: 'موزع صابون',
    nameEn: 'Soap Dispenser',
    icon: Droplets,
    emoji: '🧴',
    defaultPrice: 120,
    category: 'accessories',
    description: 'موزع صابون سائل',
  },
  {
    id: 'toilet-brush',
    name: 'فرشاة مرحاض',
    nameEn: 'Toilet Brush',
    icon: Sparkles,
    emoji: '🧹',
    defaultPrice: 100,
    category: 'accessories',
    description: 'فرشاة مرحاض مع حامل',
  },
  {
    id: 'toilet-paper-holder',
    name: 'حامل ورق تواليت',
    nameEn: 'Toilet Paper Holder',
    icon: Square,
    emoji: '🧻',
    defaultPrice: 80,
    category: 'accessories',
    description: 'حامل ورق تواليت معدني',
  },
  {
    id: 'bath-mat',
    name: 'سجادة حمام',
    nameEn: 'Bath Mat',
    icon: Square,
    emoji: '🛁',
    defaultPrice: 150,
    category: 'accessories',
    description: 'سجادة حمام مانعة للانزلاق',
  },
  {
    id: 'shower-curtain',
    name: 'ستارة شاور',
    nameEn: 'Shower Curtain',
    icon: Square,
    emoji: '🚿',
    defaultPrice: 200,
    category: 'accessories',
    description: 'ستارة شاور مقاومة للماء',
  },
  {
    id: 'robe-hook',
    name: 'علاقة روب',
    nameEn: 'Robe Hook',
    icon: Square,
    emoji: '🧥',
    defaultPrice: 60,
    category: 'accessories',
    description: 'علاقة للروب أو الملابس',
  },
  
  // الأجهزة
  {
    id: 'water-heater',
    name: 'سخان مياه كهربائي',
    nameEn: 'Electric Water Heater',
    icon: Flame,
    emoji: '🔥',
    defaultPrice: 2500,
    category: 'appliances',
    description: 'سخان مياه كهربائي 50 لتر',
  },
  {
    id: 'water-heater-gas',
    name: 'سخان مياه غاز',
    nameEn: 'Gas Water Heater',
    icon: Flame,
    emoji: '🔥',
    defaultPrice: 3000,
    category: 'appliances',
    description: 'سخان مياه غاز فوري',
  },
  {
    id: 'exhaust-fan',
    name: 'شفاط هواء',
    nameEn: 'Exhaust Fan',
    icon: Wind,
    emoji: '🌀',
    defaultPrice: 400,
    category: 'appliances',
    description: 'شفاط هواء للتهوية',
  },
  {
    id: 'hand-dryer',
    name: 'مجفف يدين',
    nameEn: 'Hand Dryer',
    icon: Wind,
    emoji: '💨',
    defaultPrice: 800,
    category: 'appliances',
    description: 'مجفف يدين كهربائي',
  },
  {
    id: 'hair-dryer',
    name: 'سشوار شعر',
    nameEn: 'Hair Dryer',
    icon: Wind,
    emoji: '💇',
    defaultPrice: 300,
    category: 'appliances',
    description: 'سشوار شعر للحمام',
  },
  {
    id: 'heated-towel-rail',
    name: 'مجفف مناشف',
    nameEn: 'Heated Towel Rail',
    icon: Flame,
    emoji: '🧺',
    defaultPrice: 1500,
    category: 'appliances',
    description: 'علاقة مناشف مع تسخين',
  },
  
  // التخزين
  {
    id: 'bathroom-cabinet',
    name: 'دولاب حمام',
    nameEn: 'Bathroom Cabinet',
    icon: Square,
    emoji: '🗄️',
    defaultPrice: 1500,
    category: 'storage',
    description: 'دولاب حمام معلق',
  },
  {
    id: 'vanity-unit',
    name: 'وحدة تخزين تحت الحوض',
    nameEn: 'Vanity Unit',
    icon: Square,
    emoji: '🗄️',
    defaultPrice: 2500,
    category: 'storage',
    description: 'وحدة تخزين أسفل الحوض',
  },
  {
    id: 'medicine-cabinet',
    name: 'خزانة أدوية',
    nameEn: 'Medicine Cabinet',
    icon: Square,
    emoji: '💊',
    defaultPrice: 800,
    category: 'storage',
    description: 'خزانة أدوية مع مرآة',
  },
  {
    id: 'corner-shelf',
    name: 'رف زاوية',
    nameEn: 'Corner Shelf',
    icon: Square,
    emoji: '📐',
    defaultPrice: 150,
    category: 'storage',
    description: 'رف زاوية للشامبو والصابون',
  },
  {
    id: 'laundry-basket',
    name: 'سلة غسيل',
    nameEn: 'Laundry Basket',
    icon: Square,
    emoji: '🧺',
    defaultPrice: 200,
    category: 'storage',
    description: 'سلة غسيل ملابس',
  },
  {
    id: 'trash-bin',
    name: 'سلة مهملات',
    nameEn: 'Trash Bin',
    icon: Square,
    emoji: '🗑️',
    defaultPrice: 100,
    category: 'storage',
    description: 'سلة مهملات صغيرة للحمام',
  },
  
  // المستلزمات
  {
    id: 'towel-set',
    name: 'طقم مناشف',
    nameEn: 'Towel Set',
    icon: Square,
    emoji: '🛁',
    defaultPrice: 400,
    category: 'essentials',
    description: 'طقم مناشف (وجه، يد، استحمام)',
  },
  {
    id: 'bathrobe',
    name: 'روب حمام',
    nameEn: 'Bathrobe',
    icon: Square,
    emoji: '🧥',
    defaultPrice: 300,
    category: 'essentials',
    description: 'روب حمام قطني',
  },
  {
    id: 'slippers',
    name: 'شبشب حمام',
    nameEn: 'Bathroom Slippers',
    icon: Square,
    emoji: '🩴',
    defaultPrice: 50,
    category: 'essentials',
    description: 'شبشب حمام مقاوم للماء',
  },
  {
    id: 'toilet-paper',
    name: 'ورق تواليت',
    nameEn: 'Toilet Paper',
    icon: Square,
    emoji: '🧻',
    defaultPrice: 30,
    category: 'essentials',
    description: 'عبوة ورق تواليت',
  },
  {
    id: 'hand-soap',
    name: 'صابون يد',
    nameEn: 'Hand Soap',
    icon: Droplets,
    emoji: '🧴',
    defaultPrice: 40,
    category: 'essentials',
    description: 'صابون يد سائل',
  },
  {
    id: 'shampoo-set',
    name: 'طقم شامبو',
    nameEn: 'Shampoo Set',
    icon: Droplets,
    emoji: '🧴',
    defaultPrice: 100,
    category: 'essentials',
    description: 'شامبو وبلسم وجل استحمام',
  },
  {
    id: 'air-freshener',
    name: 'معطر جو',
    nameEn: 'Air Freshener',
    icon: Sparkles,
    emoji: '🌸',
    defaultPrice: 50,
    category: 'essentials',
    description: 'معطر جو للحمام',
  },
];

// دالة للحصول على العناصر حسب الفئة
export const getBathroomItemsByCategory = (category: BathroomItemDefinition['category']): BathroomItemDefinition[] => {
  return bathroomItems.filter(item => item.category === category);
};

// دالة للحصول على جميع الفئات مع عناصرها
export const getBathroomItemsGroupedByCategory = (): Record<string, BathroomItemDefinition[]> => {
  const grouped: Record<string, BathroomItemDefinition[]> = {};
  
  Object.keys(bathroomCategories).forEach(category => {
    grouped[category] = getBathroomItemsByCategory(category as BathroomItemDefinition['category']);
  });
  
  return grouped;
};

// دالة لإنشاء عنصر غرفة من التعريف
export const createBathroomRoomItem = (itemDef: BathroomItemDefinition, quantity: number = 1) => {
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
export const calculateBathroomTotalCost = (items: { price: number; quantity: number }[]): number => {
  return items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
};
