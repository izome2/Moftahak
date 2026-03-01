/**
 * Modal Animation Variants
 * variants خاصة بالـ modals والعناصر المنزلقة
 */

import { Variants } from 'framer-motion';

// Overlay backdrop animation
export const overlayVariants: Variants = {
  hidden: { 
    opacity: 0,
    transition: { duration: 0.3 }
  },
  visible: { 
    opacity: 1,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.3, delay: 0.2 }
  }
};

// Slide in from right animation (للنموذج الأيمن)
export const slideInRight: Variants = {
  hidden: { 
    opacity: 0, 
    x: 100,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 1, 0.5, 1],
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: 100,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  }
};

// Slide in from left animation (للخلفية اليسرى)
export const slideInLeft: Variants = {
  hidden: { 
    opacity: 0, 
    x: -100,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  },
  visible: { 
    opacity: 1, 
    x: 0,
    transition: { 
      duration: 0.6, 
      ease: [0.25, 1, 0.5, 1],
      delay: 0.1
    }
  },
  exit: {
    opacity: 0,
    x: -100,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  }
};

// Form transition animation (للتبديل بين Login و Register)
export const formTransition: Variants = {
  hidden: { 
    opacity: 0,
    y: 10,
    transition: { duration: 0.2 }
  },
  visible: { 
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.25, 1, 0.5, 1] }
  },
  exit: {
    opacity: 0,
    y: -10,
    transition: { duration: 0.2 }
  }
};

// Stagger for form fields
export const staggerFormFields: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

// Individual field animation
export const fieldVariant: Variants = {
  hidden: { 
    opacity: 0, 
    y: 10
  },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { duration: 0.4, ease: [0.25, 1, 0.5, 1] }
  }
};
