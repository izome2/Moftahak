/**
 * Animation Variants for Framer Motion
 * مجموعة شاملة من variants للاستخدام في جميع أنحاء الموقع
 */

import { Variants } from 'framer-motion';

// ============================================
// FADE VARIANTS - للظهور والاختفاء
// ============================================

export const fadeIn: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
  }
};

export const fadeInUp: Variants = {
  hidden: { 
    opacity: 0, 
    y: 20,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.8, ease: [0.25, 1, 0.5, 1] }
  }
};

export const fadeInDown: Variants = {
  hidden: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
  }
};

export const fadeInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -30,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
  }
};

export const fadeInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 30,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
  }
};

export const fadeInScale: Variants = {
  hidden: { opacity: 0, scale: 0.8 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.7, ease: [0.25, 1, 0.5, 1] }
  }
};

export const fadeInBlur: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.6, ease: [0.25, 1, 0.5, 1] }
  }
};

// ============================================
// SCALE VARIANTS - للتكبير والتصغير
// ============================================

export const scaleUp: Variants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
  }
};

export const scaleBounce: Variants = {
  hidden: { scale: 0 },
  visible: { 
    scale: 1,
    transition: { 
      type: 'spring',
      stiffness: 120,
      damping: 25
    }
  }
};

export const scalePopIn: Variants = {
  hidden: { scale: 0, opacity: 0 },
  visible: { 
    scale: 1, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 180,
      damping: 30
    }
  }
};

// ============================================
// SLIDE VARIANTS - للحركة الجانبية
// ============================================

export const slideInLeft: Variants = {
  hidden: { 
    x: -60, 
    opacity: 0,
    transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
  }
};

export const slideInRight: Variants = {
  hidden: { 
    x: 60, 
    opacity: 0,
    transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
  },
  visible: { 
    x: 0, 
    opacity: 1,
    transition: { duration: 1.2, ease: [0.4, 0, 0.2, 1] }
  }
};

// ============================================
// ROTATE VARIANTS - للدوران
// ============================================

export const rotateIn: Variants = {
  hidden: { rotate: -180, opacity: 0, scale: 0.5 },
  visible: { 
    rotate: 0, 
    opacity: 1, 
    scale: 1,
    transition: { duration: 0.8, ease: [0.4, 0, 0.2, 1] }
  }
};

export const rotateFadeIn: Variants = {
  hidden: { rotate: -10, opacity: 0 },
  visible: { 
    rotate: 0, 
    opacity: 1,
    transition: { duration: 0.7, ease: [0.4, 0, 0.2, 1] }
  }
};

// ============================================
// STAGGER VARIANTS - للتتابع
// ============================================

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.6
    }
  }
};

export const staggerItem: Variants = {
  hidden: { 
    opacity: 0, 
    y: 15,
    transition: { duration: 0.9, ease: [0.4, 0, 0.2, 1] }
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 1, ease: [0.4, 0, 0.2, 1] }
  }
};

export const staggerFast: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

export const staggerSlow: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.25,
      delayChildren: 0.5
    }
  }
};

// ============================================
// CARD VARIANTS - للكروت
// ============================================

export const cardHover: Variants = {
  rest: { 
    scale: 1, 
    y: 0,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  },
  hover: { 
    scale: 1.03, 
    y: -8,
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

export const cardTilt: Variants = {
  rest: { rotateX: 0, rotateY: 0 },
  hover: {
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// ============================================
// BUTTON VARIANTS - للأزرار
// ============================================

export const buttonHover: Variants = {
  rest: { 
    scale: 1,
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
  },
  hover: { 
    scale: 1.05,
    boxShadow: '0 10px 15px -3px rgba(237, 191, 140, 0.4)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  tap: { 
    scale: 0.95,
    transition: { duration: 0.15, ease: [0.4, 0, 0.2, 1] }
  }
};

export const buttonGlow: Variants = {
  rest: { 
    boxShadow: '0 0 0 0 rgba(237, 191, 140, 0)'
  },
  hover: { 
    boxShadow: '0 0 20px 5px rgba(237, 191, 140, 0.5)',
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

export const buttonMagnetic = {
  x: 0,
  y: 0,
  transition: { 
    type: 'spring',
    stiffness: 80,
    damping: 20,
    mass: 0.5
  }
};

// ============================================
// HERO VARIANTS - لقسم Hero
// ============================================

export const heroTitle: Variants = {
  hidden: { opacity: 0, y: 50, scale: 0.9 },
  visible: { 
    opacity: 1, 
    y: 0, 
    scale: 1,
    transition: { 
      duration: 0.9, 
      ease: [0.4, 0, 0.2, 1],
      delay: 0.2
    }
  }
};

export const heroSubtitle: Variants = {
  hidden: { opacity: 0, y: 30, filter: 'blur(10px)' },
  visible: { 
    opacity: 1, 
    y: 0,
    filter: 'blur(0px)',
    transition: { 
      duration: 0.9, 
      ease: [0.4, 0, 0.2, 1],
      delay: 0.5
    }
  }
};

export const heroButtons: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.8 },
  visible: { 
    opacity: 1, 
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.7, 
      ease: [0.4, 0, 0.2, 1],
      delay: 0.8
    }
  }
};

export const heroStats: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 1
    }
  }
};

export const heroStatItem: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.8 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { 
      duration: 0.7, 
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

// ============================================
// SCROLL INDICATOR VARIANTS
// ============================================

export const scrollIndicator: Variants = {
  visible: {
    y: [0, 10, 0],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 2.5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  },
  hidden: {
    opacity: 0,
    y: -20,
    transition: { duration: 0.5, ease: [0.16, 0.85, 0.45, 1] }
  }
};

// ============================================
// TEXT SPLIT VARIANTS - لتقسيم النص
// ============================================

export const textContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.2
    }
  }
};

export const textWord: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  }
};

export const textCharacter: Variants = {
  hidden: { opacity: 0, y: 50 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: [0.4, 0, 0.2, 1] }
  }
};

// ============================================
// NAVBAR VARIANTS
// ============================================

export const navbarSlideDown: Variants = {
  hidden: { y: -100, opacity: 0 },
  visible: { 
    y: 0, 
    opacity: 1,
    transition: { 
      type: 'spring',
      stiffness: 80,
      damping: 25,
      delay: 0.1
    }
  }
};

export const navItem: Variants = {
  hidden: { opacity: 0, y: -10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// ============================================
// IMAGE REVEAL VARIANTS
// ============================================

export const imageReveal: Variants = {
  hidden: { 
    scale: 1.2, 
    opacity: 0,
    filter: 'blur(20px)'
  },
  visible: { 
    scale: 1, 
    opacity: 1,
    filter: 'blur(0px)',
    transition: { 
      duration: 1, 
      ease: [0.4, 0, 0.2, 1]
    }
  }
};

export const imageClipPath: Variants = {
  hidden: { 
    clipPath: 'inset(0 100% 0 0)'
  },
  visible: { 
    clipPath: 'inset(0 0% 0 0)',
    transition: { 
      duration: 1.4, 
      ease: [0.33, 0.85, 0.4, 0.96]
    }
  }
};

// ============================================
// COUNTER VARIANTS - للأرقام
// ============================================

export const counterVariants: Variants = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.6, ease: [0.4, 0, 0.2, 1] }
  }
};

// ============================================
// PAGE TRANSITION VARIANTS
// ============================================

export const pageTransition: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.5, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0, 
    y: -20,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  }
};

// ============================================
// FLOATING ANIMATION - للعناصر الطافية
// ============================================

export const floating: Variants = {
  animate: {
    y: [-10, 10, -10],
    transition: {
      duration: 4,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

export const floatingRotate: Variants = {
  animate: {
    y: [-10, 10, -10],
    rotate: [-2, 2, -2],
    transition: {
      duration: 5,
      repeat: Infinity,
      ease: 'easeInOut'
    }
  }
};

// ============================================
// MODAL/OVERLAY VARIANTS
// ============================================

export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1,
    transition: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
  },
  exit: { 
    opacity: 0,
    transition: { duration: 0.2, ease: [0.4, 0, 0.2, 1] }
  }
};

export const modalContent: Variants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.4,
      ease: [0.4, 0, 0.2, 1]
    }
  },
  exit: { 
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: 0.25, ease: [0.4, 0, 0.2, 1] }
  }
};
