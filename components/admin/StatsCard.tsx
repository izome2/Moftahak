'use client';

import React, { useEffect, useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useCounter } from '@/hooks/useCounter';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: number | string;
  suffix?: string;
  iconBgColor?: string;
  iconColor?: string;
  index?: number;
}

const StatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  suffix = '',
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary',
  index = 0,
}) => {
  const ref = useRef(null);
  const isInView = useScrollAnimation(ref, { threshold: 0.3, once: true });
  
  // Handle string values (like "...") during loading
  const numericValue = typeof value === 'number' ? value : 0;
  const isLoading = typeof value === 'string';
  
  const count = useCounter({ start: 0, end: numericValue, duration: 2 }, isInView && !isLoading);
  const [isHovered, setIsHovered] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  // Background icon parallax (opposite direction)
  const bgIconX = useTransform(smoothMouseX, (value) => -value * 0.5);
  const bgIconY = useTransform(smoothMouseY, (value) => -value * 0.5);

  // Icon parallax
  const iconX = useTransform(smoothMouseX, (value) => value * 0.3);
  const iconY = useTransform(smoothMouseY, (value) => value * 0.3);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (isMobile) return;
    
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    mouseX.set(x * 0.06);
    mouseY.set(y * 0.06);
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      mouseX.set(0);
      mouseY.set(0);
    }
    setIsHovered(false);
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ 
        duration: 0.4,
        delay: index * 0.1,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white p-4 sm:p-6 border-2 border-primary/20 cursor-pointer group will-change-transform"
      style={{
        x: smoothMouseX,
        y: smoothMouseY,
        boxShadow: '0 4px 20px rgba(237, 191, 140, 0.15)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Hover Glow Effect */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isHovered ? {
          opacity: 1,
          boxShadow: '0 0 40px rgba(237, 191, 140, 0.4), inset 0 0 20px rgba(237, 191, 140, 0.15)',
        } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Background Icon (Large) */}
      <motion.div 
        className="absolute -top-4 -left-4 z-0 opacity-[0.07] pointer-events-none"
        animate={isHovered ? {
          scale: 1.1,
          opacity: 0.1,
        } : {
          scale: 1,
          opacity: 0.07,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        style={{
          x: bgIconX,
          y: bgIconY,
        }}
      >
        <Icon className="w-40 h-40 text-primary" strokeWidth={1.5} />
      </motion.div>

      <div className="relative z-10">
        {/* Icon */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.1 + 0.1,
            ease: [0.25, 0.1, 0.25, 1],
          }}
          className={`mb-4 p-4 rounded-xl inline-flex ${iconBgColor} shadow-md border-2 border-primary/30`}
          style={{
            x: iconX,
            y: iconY,
          }}
          whileHover={{ scale: 1.1 }}
        >
          <Icon size={28} className={iconColor} strokeWidth={2} />
        </motion.div>

        {/* Value */}
        <motion.h3 
          className="text-3xl sm:text-4xl font-bold text-secondary mb-2 font-bristone"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.1 + 0.15,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {isLoading ? value : (isInView ? count : 0)}{!isLoading && suffix}
        </motion.h3>

        {/* Label */}
        <motion.p 
          className="text-secondary/60 font-dubai text-xs sm:text-sm"
          initial={{ opacity: 0 }}
          animate={isInView ? { opacity: 1 } : { opacity: 0 }}
          transition={{ 
            duration: 0.3,
            delay: index * 0.1 + 0.2,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {label}
        </motion.p>
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        initial={{ x: '100%', opacity: 0 }}
        animate={isHovered ? {
          x: '-100%',
          opacity: [0, 0.3, 0],
        } : { x: '100%', opacity: 0 }}
        transition={{ duration: 0.6, ease: "easeInOut" }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.5), transparent)',
        }}
      />
    </motion.div>
  );
};

export default StatsCard;
