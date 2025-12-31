/**
 * Animation Configuration
 * إعدادات مركزية للأنميشن في الموقع
 */

import { Transition, Easing } from 'framer-motion';

// ============================================
// TIMING CONSTANTS
// ============================================

export const ANIMATION_DURATION = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
  verySlow: 1.2
} as const;

export const STAGGER_DELAY = {
  fast: 0.05,
  normal: 0.1,
  slow: 0.15,
  verySlow: 0.2
} as const;

export const ENTRANCE_DELAY = {
  none: 0,
  fast: 0.1,
  normal: 0.3,
  slow: 0.5
} as const;

// ============================================
// EASING FUNCTIONS
// ============================================

// Cubic Bezier curves for smooth animations
export const EASING: Record<string, Easing> = {
  // Standard easings
  easeIn: [0.4, 0, 1, 1],
  easeOut: [0, 0, 0.2, 1],
  easeInOut: [0.4, 0, 0.2, 1],
  
  // Custom easings
  smooth: [0.25, 0.46, 0.45, 0.94],
  snappy: [0.34, 1.56, 0.64, 1],
  elegant: [0.6, 0.05, 0.01, 0.9],
  bouncy: [0.68, -0.55, 0.265, 1.55],
  
  // Material Design
  standard: [0.4, 0.0, 0.2, 1],
  decelerate: [0.0, 0.0, 0.2, 1],
  accelerate: [0.4, 0.0, 1, 1],
  
  // Special effects
  anticipate: [0.8, -0.4, 0.2, 1.4],
  overshoot: [0.34, 1.56, 0.64, 1]
} as const;

// ============================================
// SPRING CONFIGURATIONS
// ============================================

export const SPRING_CONFIG = {
  // Gentle spring
  gentle: {
    type: 'spring' as const,
    stiffness: 100,
    damping: 15,
    mass: 1
  },
  
  // Default spring
  default: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 20,
    mass: 1
  },
  
  // Snappy spring
  snappy: {
    type: 'spring' as const,
    stiffness: 260,
    damping: 20,
    mass: 0.8
  },
  
  // Bouncy spring
  bouncy: {
    type: 'spring' as const,
    stiffness: 400,
    damping: 25,
    mass: 1.2
  },
  
  // Stiff spring (no bounce)
  stiff: {
    type: 'spring' as const,
    stiffness: 300,
    damping: 30,
    mass: 1
  },
  
  // Magnetic effect
  magnetic: {
    type: 'spring' as const,
    stiffness: 150,
    damping: 15,
    mass: 0.1
  }
} as const;

// ============================================
// TRANSITION PRESETS
// ============================================

export const TRANSITIONS = {
  // Fast fade
  fastFade: {
    duration: ANIMATION_DURATION.fast,
    ease: EASING.easeOut
  } as Transition,
  
  // Normal fade
  fade: {
    duration: ANIMATION_DURATION.normal,
    ease: EASING.easeOut
  } as Transition,
  
  // Smooth slide
  slide: {
    duration: ANIMATION_DURATION.normal,
    ease: EASING.smooth
  } as Transition,
  
  // Bouncy scale
  scale: {
    duration: ANIMATION_DURATION.normal,
    ease: EASING.snappy
  } as Transition,
  
  // Elegant entrance
  entrance: {
    duration: ANIMATION_DURATION.slow,
    ease: EASING.elegant
  } as Transition,
  
  // Spring transition
  spring: SPRING_CONFIG.default,
  
  // Snappy spring
  springSnappy: SPRING_CONFIG.snappy,
  
  // Bouncy spring
  springBouncy: SPRING_CONFIG.bouncy
} as const;

// ============================================
// VIEWPORT SETTINGS
// ============================================

export const VIEWPORT_CONFIG = {
  // Trigger when element is 10% visible
  minimal: {
    once: true,
    amount: 0.1,
    margin: '0px 0px -10% 0px'
  },
  
  // Trigger when element is 30% visible (default)
  default: {
    once: true,
    amount: 0.3,
    margin: '0px 0px -20% 0px'
  },
  
  // Trigger when element is 50% visible
  half: {
    once: true,
    amount: 0.5,
    margin: '0px'
  },
  
  // Trigger when element is fully visible
  full: {
    once: true,
    amount: 0.8,
    margin: '0px'
  },
  
  // Repeat animation on scroll
  repeat: {
    once: false,
    amount: 0.3,
    margin: '0px 0px -20% 0px'
  }
} as const;

// ============================================
// ANIMATION TOGGLE
// ============================================

/**
 * Check if user prefers reduced motion
 */
export const shouldReduceMotion = (): boolean => {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
};

/**
 * Get appropriate animation config based on user preference
 */
export const getAnimationConfig = <T>(
  normalConfig: T,
  reducedConfig?: T
): T => {
  if (shouldReduceMotion()) {
    return reducedConfig || ({} as T);
  }
  return normalConfig;
};

// ============================================
// PERFORMANCE SETTINGS
// ============================================

export const PERFORMANCE = {
  // Use GPU acceleration
  willChange: {
    transform: true,
    opacity: true
  },
  
  // Reduce animations on mobile
  reducedOnMobile: typeof window !== 'undefined' && window.innerWidth < 768,
  
  // Disable parallax on mobile
  disableParallaxOnMobile: typeof window !== 'undefined' && window.innerWidth < 768,
  
  // Reduce particles on mobile
  reduceParticlesOnMobile: typeof window !== 'undefined' && window.innerWidth < 768
} as const;

// ============================================
// STAGGER CONFIGURATIONS
// ============================================

export const STAGGER = {
  // Container with fast stagger
  fast: {
    staggerChildren: STAGGER_DELAY.fast,
    delayChildren: ENTRANCE_DELAY.fast
  },
  
  // Container with normal stagger
  normal: {
    staggerChildren: STAGGER_DELAY.normal,
    delayChildren: ENTRANCE_DELAY.normal
  },
  
  // Container with slow stagger
  slow: {
    staggerChildren: STAGGER_DELAY.slow,
    delayChildren: ENTRANCE_DELAY.slow
  },
  
  // Container with very slow stagger
  verySlow: {
    staggerChildren: STAGGER_DELAY.verySlow,
    delayChildren: ENTRANCE_DELAY.slow
  }
} as const;

// ============================================
// HOVER SCALE VALUES
// ============================================

export const HOVER_SCALE = {
  subtle: 1.02,
  normal: 1.05,
  prominent: 1.1,
  dramatic: 1.15
} as const;

// ============================================
// SHADOW PRESETS
// ============================================

export const SHADOWS = {
  none: '0 0 0 0 rgba(0, 0, 0, 0)',
  sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
  default: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
  md: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
  lg: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
  xl: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  
  // Colored shadows (primary color)
  primarySm: '0 4px 6px -1px rgba(237, 191, 140, 0.2)',
  primary: '0 10px 15px -3px rgba(237, 191, 140, 0.3)',
  primaryLg: '0 20px 25px -5px rgba(237, 191, 140, 0.4)',
  
  // Colored shadows (secondary color)
  secondarySm: '0 4px 6px -1px rgba(16, 48, 43, 0.2)',
  secondary: '0 10px 15px -3px rgba(16, 48, 43, 0.3)',
  secondaryLg: '0 20px 25px -5px rgba(16, 48, 43, 0.4)'
} as const;

// ============================================
// Z-INDEX LAYERS
// ============================================

export const Z_INDEX = {
  background: -1,
  base: 0,
  content: 1,
  elevated: 10,
  sticky: 100,
  overlay: 1000,
  modal: 2000,
  toast: 3000,
  tooltip: 4000
} as const;

// ============================================
// CURSOR TRAIL CONFIG
// ============================================

export const CURSOR_TRAIL = {
  maxParticles: 20,
  particleLifetime: 1000, // ms
  spawnInterval: 50, // ms
  particleSize: { min: 4, max: 8 },
  colors: ['#edbf8c', '#10302b', '#ead3b9'],
  enabled: !PERFORMANCE.reducedOnMobile
} as const;

// ============================================
// MAGNETIC BUTTON CONFIG
// ============================================

export const MAGNETIC_BUTTON = {
  strength: 0.3, // How much the button moves (0-1)
  radius: 80, // Activation radius in pixels
  enabled: !PERFORMANCE.reducedOnMobile
} as const;
