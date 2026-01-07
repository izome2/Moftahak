/**
 * نظام التصميم لدراسة الجدوى
 * Feasibility Study Design System
 * 
 * يحتوي على الألوان، الظلال، الأنماط، وتأثيرات الحركة
 */

import type { Variants } from 'framer-motion';

// ============================================
// 🎨 الألوان - COLORS
// ============================================

export const COLORS = {
  // الألوان الأساسية
  primary: '#edbf8c',      // الذهبي الفاتح
  secondary: '#10302b',    // الأخضر الداكن
  accent: '#ead3b9',       // البيج الفاتح
  white: '#fdf6ee',        // الأبيض الكريمي
  
  // ألوان شفافة
  primaryLight: 'rgba(237, 191, 140, 0.1)',
  primaryMedium: 'rgba(237, 191, 140, 0.2)',
  secondaryLight: 'rgba(16, 48, 43, 0.05)',
  secondaryMedium: 'rgba(16, 48, 43, 0.1)',
  
  // ألوان الخلفية
  bgLight: 'rgba(234, 211, 185, 0.2)',
  bgMedium: 'rgba(234, 211, 185, 0.3)',
  bgWhite: 'rgba(253, 246, 238, 0.9)',
} as const;

// ============================================
// 🌫️ الظلال - SHADOWS
// ============================================

export const SHADOWS = {
  // ظل Widget الأساسي
  widget: '0 4px 20px rgba(16, 48, 43, 0.08), 0 1px 3px rgba(16, 48, 43, 0.1)',
  
  // ظل Widget عند Hover
  widgetHover: '0 8px 30px rgba(16, 48, 43, 0.12), 0 4px 8px rgba(16, 48, 43, 0.08)',
  
  // ظل Widget مرتفع (للعناصر المحددة)
  widgetElevated: '0 12px 40px rgba(16, 48, 43, 0.15), 0 4px 12px rgba(16, 48, 43, 0.1)',
  
  // ظل البطاقات الكبيرة
  card: '0 10px 40px rgba(16, 48, 43, 0.1), 0 2px 8px rgba(16, 48, 43, 0.06)',
  
  // ظل ناعم
  soft: '0 2px 8px rgba(16, 48, 43, 0.06)',
  
  // ظل داخلي
  inner: 'inset 0 2px 4px rgba(16, 48, 43, 0.06)',
  
  // ظل للأيقونات
  icon: '0 4px 12px rgba(16, 48, 43, 0.1)',
  
  // ظل للمكتبة المنبثقة
  popup: '0 20px 60px rgba(16, 48, 43, 0.2), 0 8px 20px rgba(16, 48, 43, 0.1)',
} as const;

// ============================================
// 📐 أنماط Widget - WIDGET STYLES (Tailwind Classes)
// ============================================

export const WIDGET_CLASSES = {
  // Widget الأساسي
  base: 'bg-white rounded-2xl border border-secondary/5',
  
  // Widget تفاعلي
  interactive: 'cursor-pointer transition-all duration-300 ease-out',
  
  // Widget مع hover
  hoverable: 'hover:-translate-y-1 hover:border-primary/20',
  
  // Widget محدد
  selected: 'ring-2 ring-primary border-primary/30',
  
  // حاوية الأيقونة
  iconContainer: 'w-12 h-12 rounded-xl flex items-center justify-center bg-gradient-to-br from-primary/20 to-primary/10',
  
  // حاوية الأيقونة الكبيرة
  iconContainerLg: 'w-16 h-16 rounded-2xl flex items-center justify-center bg-gradient-to-br from-secondary to-secondary/80',
  
  // أزرار التحكم
  controlButton: 'w-8 h-8 rounded-lg flex items-center justify-center transition-all duration-200',
  controlButtonPlus: 'bg-primary/20 hover:bg-primary/30 text-secondary',
  controlButtonMinus: 'bg-secondary/10 hover:bg-secondary/20 text-secondary',
  controlButtonDelete: 'bg-red-50 hover:bg-red-100 text-red-500',
  
  // حقل الإدخال
  input: 'w-16 text-center font-bold text-secondary bg-transparent border-0 focus:outline-none',
  
  // السعر
  price: 'text-lg font-bold text-primary',
  priceLabel: 'text-xs text-secondary/60',
} as const;

// ============================================
// 🎭 أنماط الخلفية - BACKGROUND STYLES
// ============================================

export const BACKGROUND_CLASSES = {
  // الخلفية الرئيسية للشرائح
  slide: 'bg-gradient-to-br from-accent/20 via-white to-accent/30',
  
  // خلفية مع نمط
  slideWithPattern: 'bg-gradient-to-br from-accent/20 via-white to-accent/30 relative overflow-hidden',
  
  // الطبقة الزخرفية
  decorativeLayer: 'absolute inset-0 opacity-30 pointer-events-none',
} as const;

// ============================================
// 🎬 تأثيرات الحركة - ANIMATION VARIANTS
// ============================================

// Container مع Stagger للأطفال
export const containerVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.1,
    },
  },
};

// Widget Item Animation
export const widgetVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20, 
    scale: 0.95 
  },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 24,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.9,
    y: -10,
    transition: {
      duration: 0.2,
    },
  },
};

// Fade In Up للعناوين
export const headerVariants: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20 
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 20,
    },
  },
};

// تأثير الظهور مع Scale
export const scaleInVariants: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.8 
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20,
    },
  },
};

// تأثير Slide من اليمين (RTL)
export const slideFromRightVariants: Variants = {
  hidden: { 
    opacity: 0, 
    x: 50 
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: {
      type: 'spring',
      stiffness: 200,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    x: 50,
    transition: {
      duration: 0.2,
    },
  },
};

// تأثير المكتبة المنبثقة
export const popupVariants: Variants = {
  hidden: { 
    opacity: 0,
    scale: 0.95,
    y: 10,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 25,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 10,
    transition: {
      duration: 0.15,
    },
  },
};

// Overlay Animation
export const overlayVariants: Variants = {
  hidden: { 
    opacity: 0 
  },
  visible: {
    opacity: 1,
    transition: {
      duration: 0.2,
    },
  },
  exit: {
    opacity: 0,
    transition: {
      duration: 0.15,
    },
  },
};

// ============================================
// 🎯 Hover Animations (for whileHover)
// ============================================

export const HOVER_EFFECTS = {
  // تأثير الرفع
  lift: {
    y: -4,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  // تأثير التكبير
  scale: {
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  // تأثير الرفع والتكبير معاً
  liftAndScale: {
    y: -4,
    scale: 1.02,
    transition: { duration: 0.2, ease: 'easeOut' },
  },
  
  // تأثير خفيف
  subtle: {
    y: -2,
    transition: { duration: 0.15, ease: 'easeOut' },
  },
} as const;

// ============================================
// 🔘 Tap Animations (for whileTap)
// ============================================

export const TAP_EFFECTS = {
  // تأثير الضغط
  press: {
    scale: 0.98,
    transition: { duration: 0.1 },
  },
  
  // تأثير الضغط الخفيف
  softPress: {
    scale: 0.995,
    transition: { duration: 0.1 },
  },
} as const;

// ============================================
// 📏 الأبعاد - DIMENSIONS
// ============================================

export const DIMENSIONS = {
  // أبعاد Widget
  widgetPadding: 'p-4',
  widgetPaddingLg: 'p-5',
  widgetGap: 'gap-3',
  
  // Grid
  gridCols2: 'grid-cols-1 sm:grid-cols-2',
  gridCols3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
  gridCols4: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4',
  gridGap: 'gap-4',
  gridGapLg: 'gap-6',
  
  // Spacing
  sectionPadding: 'p-6 sm:p-8',
  headerMargin: 'mb-6',
} as const;

// ============================================
// 🏷️ النصوص التوضيحية للغرف - ROOM DESCRIPTIONS
// ============================================

export const ROOM_CONTENT = {
  kitchen: {
    title: 'المطبخ',
    titleAlt: 'مطبخ',
    description: 'أضف الأجهزة والمستلزمات اللازمة لتجهيز مطبخ عملي ومتكامل',
    icon: 'ChefHat', // Lucide icon name
  },
  bedroom: {
    title: 'غرفة النوم',
    titleAlt: 'غرفة نوم',
    description: 'جهز غرفة نوم مريحة وعملية لضيوفك',
    icon: 'Bed',
  },
  livingRoom: {
    title: 'الصالة',
    titleAlt: 'صالة',
    description: 'صمم صالة ضيافة أنيقة ومريحة',
    icon: 'Sofa',
  },
  bathroom: {
    title: 'الحمام',
    titleAlt: 'حمام',
    description: 'تجهيزات الحمام الأساسية والكمالية',
    icon: 'Bath',
  },
} as const;

// ============================================
// 🔧 دوال مساعدة - HELPER FUNCTIONS
// ============================================

/**
 * دمج classes مع الأنماط الأساسية
 */
export const getWidgetClasses = (
  options: {
    interactive?: boolean;
    hoverable?: boolean;
    selected?: boolean;
    className?: string;
  } = {}
): string => {
  const classes: string[] = [WIDGET_CLASSES.base];
  
  if (options.interactive) classes.push(WIDGET_CLASSES.interactive);
  if (options.hoverable) classes.push(WIDGET_CLASSES.hoverable);
  if (options.selected) classes.push(WIDGET_CLASSES.selected);
  if (options.className) classes.push(options.className);
  
  return classes.join(' ');
};

/**
 * الحصول على style الظل
 */
export const getShadowStyle = (
  type: keyof typeof SHADOWS = 'widget',
  hoverType?: keyof typeof SHADOWS
): React.CSSProperties => {
  return {
    boxShadow: SHADOWS[type],
    '--hover-shadow': hoverType ? SHADOWS[hoverType] : SHADOWS.widgetHover,
  } as React.CSSProperties;
};

/**
 * تنسيق السعر بالجنيه المصري
 */
export const formatPrice = (price: number): string => {
  return new Intl.NumberFormat('ar-EG').format(price);
};

// ============================================
// 📤 التصدير الافتراضي
// ============================================

const designSystem = {
  COLORS,
  SHADOWS,
  WIDGET_CLASSES,
  BACKGROUND_CLASSES,
  DIMENSIONS,
  ROOM_CONTENT,
  // Variants
  containerVariants,
  widgetVariants,
  headerVariants,
  scaleInVariants,
  slideFromRightVariants,
  popupVariants,
  overlayVariants,
  // Effects
  HOVER_EFFECTS,
  TAP_EFFECTS,
  // Helpers
  getWidgetClasses,
  getShadowStyle,
  formatPrice,
};

export default designSystem;
