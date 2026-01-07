// عناصر المطبخ مع الأيقونات والأسعار الافتراضية
import type { RoomItem } from '@/types/feasibility';

// تصنيفات عناصر المطبخ
export type KitchenCategory = 'appliances' | 'cookware' | 'utensils' | 'storage' | 'essentials';

export interface KitchenItemDefinition {
  id: string;
  name: string;
  icon: string;
  category: KitchenCategory;
  defaultPrice: number;
  description?: string;
}

// أسماء التصنيفات بالعربية
export const kitchenCategoryNames: Record<KitchenCategory, string> = {
  appliances: 'الأجهزة الكهربائية',
  cookware: 'أدوات الطهي',
  utensils: 'أدوات المائدة',
  storage: 'التخزين',
  essentials: 'الأساسيات',
};

// قائمة عناصر المطبخ
export const kitchenItems: KitchenItemDefinition[] = [
  // الأجهزة الكهربائية
  { id: 'fridge', name: 'ثلاجة', icon: '🧊', category: 'appliances', defaultPrice: 8000, description: 'ثلاجة متوسطة الحجم' },
  { id: 'stove', name: 'بوتاجاز', icon: '🔥', category: 'appliances', defaultPrice: 5000, description: 'بوتاجاز 4 عيون' },
  { id: 'microwave', name: 'مايكرويف', icon: '📟', category: 'appliances', defaultPrice: 2500, description: 'مايكرويف متوسط' },
  { id: 'oven', name: 'فرن', icon: '🍕', category: 'appliances', defaultPrice: 3500, description: 'فرن كهربائي' },
  { id: 'dishwasher', name: 'غسالة أطباق', icon: '🍽️', category: 'appliances', defaultPrice: 6000, description: 'غسالة أطباق أوتوماتيكية' },
  { id: 'kettle', name: 'غلاية كهربائية', icon: '🫖', category: 'appliances', defaultPrice: 500, description: 'غلاية ماء كهربائية' },
  { id: 'coffee-maker', name: 'ماكينة قهوة', icon: '☕', category: 'appliances', defaultPrice: 1500, description: 'ماكينة قهوة إسبريسو' },
  { id: 'blender', name: 'خلاط', icon: '🧃', category: 'appliances', defaultPrice: 800, description: 'خلاط كهربائي' },
  { id: 'toaster', name: 'محمصة خبز', icon: '🍞', category: 'appliances', defaultPrice: 400, description: 'محمصة خبز كهربائية' },
  { id: 'mixer', name: 'عجانة', icon: '🥣', category: 'appliances', defaultPrice: 2000, description: 'عجانة كهربائية' },
  { id: 'water-filter', name: 'فلتر مياه', icon: '💧', category: 'appliances', defaultPrice: 1200, description: 'فلتر مياه متعدد المراحل' },
  { id: 'hood', name: 'شفاط', icon: '🌀', category: 'appliances', defaultPrice: 2500, description: 'شفاط مطبخ' },

  // أدوات الطهي
  { id: 'pots-set', name: 'طقم حلل', icon: '🍲', category: 'cookware', defaultPrice: 1500, description: 'طقم حلل ستانلس' },
  { id: 'frying-pan', name: 'مقلاة', icon: '🍳', category: 'cookware', defaultPrice: 300, description: 'مقلاة تيفال' },
  { id: 'baking-tray', name: 'صينية فرن', icon: '🥧', category: 'cookware', defaultPrice: 200, description: 'صينية فرن ألومنيوم' },
  { id: 'pressure-cooker', name: 'حلة ضغط', icon: '♨️', category: 'cookware', defaultPrice: 800, description: 'حلة ضغط ستانلس' },

  // أدوات المائدة
  { id: 'dishes-set', name: 'طقم أطباق', icon: '🍽️', category: 'utensils', defaultPrice: 600, description: 'طقم أطباق سيراميك' },
  { id: 'glasses-set', name: 'طقم أكواب', icon: '🥛', category: 'utensils', defaultPrice: 300, description: 'طقم أكواب زجاج' },
  { id: 'cutlery-set', name: 'طقم ملاعق وشوك', icon: '🍴', category: 'utensils', defaultPrice: 400, description: 'طقم ستانلس ستيل' },
  { id: 'mugs-set', name: 'طقم مجات', icon: '☕', category: 'utensils', defaultPrice: 250, description: 'طقم مجات سيراميك' },
  { id: 'serving-dishes', name: 'أطباق تقديم', icon: '🥗', category: 'utensils', defaultPrice: 350, description: 'أطباق تقديم متنوعة' },

  // التخزين
  { id: 'food-containers', name: 'علب حفظ طعام', icon: '📦', category: 'storage', defaultPrice: 300, description: 'مجموعة علب بلاستيكية' },
  { id: 'spice-rack', name: 'رف توابل', icon: '🧂', category: 'storage', defaultPrice: 200, description: 'رف توابل معلق' },
  { id: 'dish-rack', name: 'مجفف أطباق', icon: '🗑️', category: 'storage', defaultPrice: 250, description: 'مجفف أطباق ستانلس' },

  // الأساسيات
  { id: 'trash-bin', name: 'سلة مهملات', icon: '🗑️', category: 'essentials', defaultPrice: 150, description: 'سلة مهملات بغطاء' },
  { id: 'cutting-board', name: 'لوح تقطيع', icon: '🪓', category: 'essentials', defaultPrice: 100, description: 'لوح تقطيع خشب' },
  { id: 'kitchen-towels', name: 'مناشف مطبخ', icon: '🧻', category: 'essentials', defaultPrice: 100, description: 'طقم مناشف مطبخ' },
  { id: 'soap-dispenser', name: 'موزع صابون', icon: '🧴', category: 'essentials', defaultPrice: 80, description: 'موزع صابون يدوي' },
];

// تحويل عنصر المطبخ إلى RoomItem
export const createKitchenRoomItem = (item: KitchenItemDefinition, quantity: number = 1): RoomItem => ({
  id: `${item.id}-${Date.now()}`,
  name: item.name,
  icon: item.icon,
  price: item.defaultPrice,
  quantity,
});

// الحصول على عناصر حسب التصنيف
export const getKitchenItemsByCategory = (category: KitchenCategory): KitchenItemDefinition[] => {
  return kitchenItems.filter((item) => item.category === category);
};

// الحصول على جميع التصنيفات مع عناصرها
export const getKitchenItemsGrouped = (): Record<KitchenCategory, KitchenItemDefinition[]> => {
  return {
    appliances: getKitchenItemsByCategory('appliances'),
    cookware: getKitchenItemsByCategory('cookware'),
    utensils: getKitchenItemsByCategory('utensils'),
    storage: getKitchenItemsByCategory('storage'),
    essentials: getKitchenItemsByCategory('essentials'),
  };
};

// حساب إجمالي تكلفة قائمة عناصر
export const calculateKitchenTotalCost = (items: RoomItem[]): number => {
  return items.reduce((total, item) => total + (item.price * item.quantity), 0);
};

export default kitchenItems;
