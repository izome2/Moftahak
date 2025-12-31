'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface AnimatedStrokeProps {
  children: React.ReactNode;
  className?: string;
  strokeColor?: string;
  strokeWidth?: number;
  delay?: number;
}

/**
 * AnimatedStroke Component
 * يضيف خط stroke متحرك بشكل يد خلف النص
 * مع أطراف دائرية وأنيميشن رسم تدريجي
 */
const AnimatedStroke: React.FC<AnimatedStrokeProps> = ({
  children,
  className = '',
  strokeColor = '#efa862', // بيج
  strokeWidth = 8,
  delay = 0,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const isInView = useScrollAnimation(containerRef as React.RefObject<Element>, { threshold: 0.5, once: false });

  return (
    <div ref={containerRef} className={`relative inline-block ${className}`}>
      {/* النص */}
      <span className="relative z-10">{children}</span>
      
      {/* SVG Stroke الخلفي */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ 
          left: '-2%',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '104%',
          height: '120%',
        }}
        viewBox="0 0 200 30"
        preserveAspectRatio="none"
      >
        <motion.path
          d="M 190,12 L 110,12 L 116,18 L 10,18"
          fill="none"
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={{ pathLength: 0, opacity: 0, pathOffset: 0 }}
          animate={isInView ? { 
            pathLength: [0, 1, 0],
            pathOffset: [0, 0, 1],
            opacity: [0, 0.7, 0],
          } : { 
            pathLength: 0, 
            pathOffset: 0,
            opacity: 0 
          }}
          transition={{
            duration: 2.0,
            delay: delay,
            times: [0, 0.6, 1],
            ease: [0.43, 0.13, 0.23, 0.96],
          }}
        />
      </svg>
    </div>
  );
};

export default AnimatedStroke;
