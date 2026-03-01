'use client';

/**
 * SlideBackground - خلفية موحدة للشرائح
 * 
 * توفر خلفية متسقة ومتدرجة لجميع شرائح الغرف
 * مع أنماط زخرفية خفيفة
 */

import React from 'react';
import { motion } from 'framer-motion';

// ============================================
// 📋 TYPES
// ============================================

export interface SlideBackgroundProps {
  /** المحتوى الداخلي */
  children: React.ReactNode;
  /** نمط الخلفية */
  variant?: 'default' | 'warm' | 'cool' | 'neutral';
  /** إظهار النمط الزخرفي */
  showPattern?: boolean;
  /** إظهار التوهج */
  showGlow?: boolean;
  /** className إضافي */
  className?: string;
  /** padding داخلي */
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

// ============================================
// 🎨 STYLES
// ============================================

const BACKGROUND_STYLES = {
  default: {
    gradient: 'from-accent/30 via-white to-accent/20',
    glowColor: 'rgba(237, 191, 140, 0.15)',
    patternColor: 'rgba(16, 48, 43, 0.02)',
  },
  warm: {
    gradient: 'from-primary/20 via-white to-accent/25',
    glowColor: 'rgba(237, 191, 140, 0.2)',
    patternColor: 'rgba(237, 191, 140, 0.03)',
  },
  cool: {
    gradient: 'from-secondary/5 via-white to-accent/15',
    glowColor: 'rgba(16, 48, 43, 0.08)',
    patternColor: 'rgba(16, 48, 43, 0.02)',
  },
  neutral: {
    gradient: 'from-white via-accent/10 to-white',
    glowColor: 'rgba(234, 211, 185, 0.15)',
    patternColor: 'rgba(16, 48, 43, 0.015)',
  },
} as const;

const PADDING_STYLES = {
  none: '',
  sm: 'p-4',
  md: 'p-6 sm:p-8',
  lg: 'p-8 sm:p-10 lg:p-12',
} as const;

// ============================================
// 🎨 COMPONENT
// ============================================

const SlideBackground: React.FC<SlideBackgroundProps> = ({
  children,
  variant = 'default',
  showPattern = true,
  showGlow = true,
  className = '',
  padding = 'md',
}) => {
  const styles = BACKGROUND_STYLES[variant];
  const paddingClass = PADDING_STYLES[padding];

  return (
    <div 
      className={`
        w-full h-full relative overflow-hidden
        bg-linear-to-br ${styles.gradient}
        ${paddingClass}
        ${className}
      `}
    >
      {/* طبقة التوهج الخلفية */}
      {showGlow && (
        <>
          {/* توهج علوي يسار */}
          <div 
            className="absolute top-0 left-0 w-96 h-96 rounded-full blur-3xl pointer-events-none opacity-60"
            style={{ 
              background: `radial-gradient(circle, ${styles.glowColor} 0%, transparent 70%)` 
            }}
          />
          
          {/* توهج سفلي يمين */}
          <div 
            className="absolute bottom-0 right-0 w-80 h-80 rounded-full blur-3xl pointer-events-none opacity-50"
            style={{ 
              background: `radial-gradient(circle, ${styles.glowColor} 0%, transparent 70%)` 
            }}
          />
          
          {/* توهج مركزي خفيف */}
          <div 
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-100 rounded-full blur-3xl pointer-events-none opacity-30"
            style={{ 
              background: `radial-gradient(ellipse, ${styles.glowColor} 0%, transparent 60%)` 
            }}
          />
        </>
      )}

      {/* النمط الزخرفي */}
      {showPattern && (
        <div className="absolute inset-0 pointer-events-none opacity-40">
          {/* نمط النقاط */}
          <div 
            className="absolute inset-0"
            style={{
              backgroundImage: `radial-gradient(circle at 1px 1px, ${styles.patternColor} 1px, transparent 1px)`,
              backgroundSize: '24px 24px',
            }}
          />
          
          {/* خطوط مائلة خفيفة */}
          <svg 
            className="absolute inset-0 w-full h-full opacity-20"
            xmlns="http://www.w3.org/2000/svg"
          >
            <defs>
              <pattern 
                id="diagonal-lines" 
                patternUnits="userSpaceOnUse" 
                width="40" 
                height="40"
                patternTransform="rotate(45)"
              >
                <line 
                  x1="0" 
                  y1="0" 
                  x2="0" 
                  y2="40" 
                  stroke="currentColor" 
                  strokeWidth="0.5"
                  className="text-secondary/5"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#diagonal-lines)" />
          </svg>
        </div>
      )}

      {/* حدود زخرفية في الزوايا */}
      <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-primary/10 rounded-tl-3xl pointer-events-none" />
      <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-primary/10 rounded-tr-3xl pointer-events-none" />
      <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-primary/10 rounded-bl-3xl pointer-events-none" />
      <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-primary/10 rounded-br-3xl pointer-events-none" />

      {/* المحتوى */}
      <div className="relative z-10 w-full h-full">
        {children}
      </div>
    </div>
  );
};

// ============================================
// 📤 EXPORT
// ============================================

export { SlideBackground };
export default SlideBackground;

// ============================================
// 🔧 VARIANT: Simple Background (بدون زخارف)
// ============================================

export interface SimpleBackgroundProps {
  children: React.ReactNode;
  className?: string;
}

export const SimpleBackground: React.FC<SimpleBackgroundProps> = ({
  children,
  className = '',
}) => {
  return (
    <div 
      className={`
        w-full h-full
        bg-linear-to-br from-accent/20 via-white to-accent/30
        ${className}
      `}
    >
      {children}
    </div>
  );
};

// ============================================
// 🔧 VARIANT: Card Background (للبطاقات)
// ============================================

export interface CardBackgroundProps {
  children: React.ReactNode;
  className?: string;
  animate?: boolean;
}

export const CardBackground: React.FC<CardBackgroundProps> = ({
  children,
  className = '',
  animate = true,
}) => {
  const Wrapper = animate ? motion.div : 'div';
  const animationProps = animate ? {
    initial: { opacity: 0, y: 10 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.3 },
  } : {};

  return (
    <Wrapper
      {...animationProps}
      className={`
        bg-white/80 backdrop-blur-sm
        border border-secondary/5
        rounded-2xl
        shadow-[0_4px_20px_rgba(16,48,43,0.06)]
        ${className}
      `}
    >
      {children}
    </Wrapper>
  );
};

// ============================================
// 🔧 VARIANT: Glass Background (زجاجي)
// ============================================

export interface GlassBackgroundProps {
  children: React.ReactNode;
  className?: string;
  blur?: 'sm' | 'md' | 'lg';
}

export const GlassBackground: React.FC<GlassBackgroundProps> = ({
  children,
  className = '',
  blur = 'md',
}) => {
  const blurClass = {
    sm: 'backdrop-blur-sm',
    md: 'backdrop-blur-md',
    lg: 'backdrop-blur-lg',
  }[blur];

  return (
    <div
      className={`
        bg-white/60 ${blurClass}
        border border-white/20
        rounded-2xl
        shadow-[0_8px_32px_rgba(16,48,43,0.08)]
        ${className}
      `}
    >
      {children}
    </div>
  );
};
