/**
 * Type definitions for animations
 */

import { Variants, Transition } from 'framer-motion';

// ============================================
// ANIMATION TYPES
// ============================================

export type AnimationDirection = 'up' | 'down' | 'left' | 'right';

export type AnimationType = 
  | 'fade'
  | 'slide'
  | 'scale'
  | 'rotate'
  | 'blur'
  | 'none';

export type AnimationSpeed = 'instant' | 'fast' | 'normal' | 'slow' | 'verySlow';

export type EasingType = 
  | 'easeIn'
  | 'easeOut'
  | 'easeInOut'
  | 'smooth'
  | 'snappy'
  | 'elegant'
  | 'bouncy';

// ============================================
// VIEWPORT OPTIONS
// ============================================

export interface ViewportOptions {
  once?: boolean;
  amount?: number | 'some' | 'all';
  margin?: string;
  root?: Element | null;
}

// ============================================
// ANIMATION PROPS
// ============================================

export interface AnimationProps {
  type?: AnimationType;
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
  easing?: EasingType;
  variants?: Variants;
  viewport?: ViewportOptions;
  disabled?: boolean;
}

// ============================================
// SCROLL ANIMATION
// ============================================

export interface ScrollAnimationConfig {
  threshold?: number;
  once?: boolean;
  offset?: number;
  smooth?: boolean;
}

export interface ScrollPosition {
  scrollY: number;
  scrollX: number;
  scrollProgress: number;
}

// ============================================
// PARALLAX
// ============================================

export interface ParallaxConfig {
  speed?: number;
  direction?: 'up' | 'down';
  disabled?: boolean;
}

export interface ParallaxOffset {
  x: number;
  y: number;
}

// ============================================
// MOUSE POSITION
// ============================================

export interface MousePosition {
  x: number;
  y: number;
}

export interface MouseMovementConfig {
  strength?: number;
  smooth?: boolean;
  inverted?: boolean;
}

// ============================================
// MAGNETIC EFFECT
// ============================================

export interface MagneticConfig {
  strength?: number;
  radius?: number;
  smooth?: boolean;
}

// ============================================
// COUNTER ANIMATION
// ============================================

export interface CounterConfig {
  start?: number;
  end: number;
  duration?: number;
  decimals?: number;
  prefix?: string;
  suffix?: string;
  separator?: string;
  onComplete?: () => void;
}

// ============================================
// TEXT SPLIT
// ============================================

export type SplitType = 'words' | 'characters' | 'lines';

export interface TextSplitConfig {
  type?: SplitType;
  staggerDelay?: number;
  animationDelay?: number;
}

// ============================================
// CURSOR TRAIL
// ============================================

export interface CursorParticle {
  id: string;
  x: number;
  y: number;
  size: number;
  color: string;
  opacity: number;
  createdAt: number;
}

export interface CursorTrailConfig {
  maxParticles?: number;
  particleLifetime?: number;
  spawnInterval?: number;
  particleSize?: {
    min: number;
    max: number;
  };
  colors?: string[];
  enabled?: boolean;
}

// ============================================
// SCROLL INDICATOR
// ============================================

export interface ScrollIndicatorConfig {
  threshold?: number;
  smooth?: boolean;
  target?: string | Element;
}

// ============================================
// PAGE TRANSITION
// ============================================

export interface PageTransitionConfig {
  type?: 'fade' | 'slide' | 'scale';
  duration?: number;
  delay?: number;
}

// ============================================
// STAGGER CONFIG
// ============================================

export interface StaggerConfig {
  staggerChildren?: number;
  delayChildren?: number;
  staggerDirection?: 1 | -1;
}

// ============================================
// ANIMATION CONTROLS
// ============================================

export interface AnimationControls {
  start: () => void;
  stop: () => void;
  reset: () => void;
  pause: () => void;
  resume: () => void;
}

// ============================================
// HOVER ANIMATION
// ============================================

export interface HoverAnimationConfig {
  scale?: number;
  translateY?: number;
  translateX?: number;
  rotate?: number;
  shadow?: string;
  duration?: number;
  easing?: EasingType;
}

// ============================================
// IMAGE REVEAL
// ============================================

export interface ImageRevealConfig {
  type?: 'fade' | 'clipPath' | 'blur' | 'scale';
  direction?: AnimationDirection;
  duration?: number;
  delay?: number;
}

// ============================================
// GRADIENT ANIMATION
// ============================================

export interface GradientAnimationConfig {
  colors: string[];
  duration?: number;
  angle?: number;
  loop?: boolean;
}
