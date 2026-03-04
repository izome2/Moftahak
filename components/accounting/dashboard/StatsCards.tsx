'use client';

import React, { useRef, useState, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface StatsCardProps {
  icon: LucideIcon;
  label: string;
  value: string;
  subtitle?: string;
  iconBgColor?: string;
  iconColor?: string;
  index?: number;
  isLoading?: boolean;
}

const AccountingStatsCard: React.FC<StatsCardProps> = ({
  icon: Icon,
  label,
  value,
  subtitle,
  iconBgColor = 'bg-primary/10',
  iconColor = 'text-primary',
  index = 0,
  isLoading = false,
}) => {
  const ref = useRef(null);
  const isInView = useScrollAnimation(ref, { threshold: 0.3, once: true });
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

  const bgIconX = useTransform(smoothMouseX, (v) => -v * 0.5);
  const bgIconY = useTransform(smoothMouseY, (v) => -v * 0.5);
  const iconX = useTransform(smoothMouseX, (v) => v * 0.3);
  const iconY = useTransform(smoothMouseY, (v) => v * 0.3);

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
        delay: index * 0.08,
        ease: [0.25, 0.1, 0.25, 1],
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      className="relative rounded-xl sm:rounded-2xl overflow-hidden bg-white p-4 sm:p-5 border-2 border-primary/20 cursor-pointer group will-change-transform"
      style={{
        x: smoothMouseX,
        y: smoothMouseY,
        boxShadow: '0 4px 20px rgba(237, 191, 140, 0.15)',
        transform: 'translateZ(0)',
        backfaceVisibility: 'hidden',
      }}
    >
      {/* Hover Glow */}
      <motion.div
        className="absolute inset-0 rounded-2xl pointer-events-none"
        initial={{ opacity: 0 }}
        animate={isHovered ? {
          opacity: 1,
          boxShadow: '0 0 40px rgba(237, 191, 140, 0.4), inset 0 0 20px rgba(237, 191, 140, 0.15)',
        } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Background Icon */}
      <motion.div
        className="absolute -top-3 -left-3 z-0 opacity-[0.07] pointer-events-none"
        animate={isHovered ? { scale: 1.1, opacity: 0.1 } : { scale: 1, opacity: 0.07 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        style={{ x: bgIconX, y: bgIconY }}
      >
        <Icon className="w-32 h-32 text-primary" strokeWidth={1.5} />
      </motion.div>

      <div className="relative z-10">
        {/* Header: Icon + Label */}
        <div className="flex items-center gap-3 mb-3">
          <motion.div
            className={`p-2.5 rounded-xl ${iconBgColor} shadow-md border-2 border-primary/30`}
            style={{ x: iconX, y: iconY }}
            whileHover={{ scale: 1.1 }}
          >
            <Icon size={22} className={iconColor} strokeWidth={2} />
          </motion.div>
          <p className="text-secondary/60 font-dubai text-xs sm:text-sm leading-tight">
            {label}
          </p>
        </div>

        {/* Value */}
        {isLoading ? (
          <div className="h-8 bg-primary/10 rounded-lg w-24 animate-pulse" />
        ) : (
          <motion.h3
            className="text-2xl sm:text-3xl font-bold text-secondary font-dubai"
            initial={{ opacity: 0 }}
            animate={isInView ? { opacity: 1 } : { opacity: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 + 0.15 }}
          >
            {value}
          </motion.h3>
        )}

        {/* Subtitle */}
        {subtitle && (
          <p className="text-xs text-secondary/50 font-dubai mt-1">{subtitle}</p>
        )}
      </div>

      {/* Shine Effect */}
      <motion.div
        className="absolute inset-0 z-20 pointer-events-none"
        initial={{ x: '100%', opacity: 0 }}
        animate={isHovered ? { x: '-100%', opacity: [0, 0.3, 0] } : { x: '100%', opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
        style={{
          background: 'linear-gradient(90deg, transparent, rgba(237, 191, 140, 0.5), transparent)',
        }}
      />
    </motion.div>
  );
};

export default AccountingStatsCard;
