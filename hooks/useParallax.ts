/**
 * Custom Hook for Parallax Effects
 * يوفر تأثير parallax للعناصر بناءً على التمرير
 */

'use client';

import { useEffect, useState, RefObject } from 'react';
import { useScrollY } from './useScrollAnimation';

interface ParallaxConfig {
  speed?: number; // سرعة الحركة (0.1 - 1)
  direction?: 'up' | 'down'; // اتجاه الحركة
  disabled?: boolean; // تعطيل على الموبايل
}

interface ParallaxOffset {
  y: number;
}

/**
 * Hook for parallax scrolling effect
 * @param ref - Reference to the element
 * @param config - Parallax configuration
 * @returns Offset values for transform
 */
export function useParallax(
  ref: RefObject<HTMLElement>,
  config: ParallaxConfig = {}
): ParallaxOffset {
  const {
    speed = 0.5,
    direction = 'up',
    disabled = false
  } = config;

  const scrollY = useScrollY();
  const [offset, setOffset] = useState({ y: 0 });

  useEffect(() => {
    if (disabled || !ref.current) {
      setOffset({ y: 0 });
      return;
    }

    // Check if on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setOffset({ y: 0 });
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setOffset({ y: 0 });
      return;
    }

    const element = ref.current;
    const elementTop = element.getBoundingClientRect().top + scrollY;
    const elementHeight = element.offsetHeight;
    const windowHeight = window.innerHeight;

    // حساب المسافة بين العنصر ومركز الشاشة
    const distanceFromCenter = scrollY + windowHeight / 2 - (elementTop + elementHeight / 2);
    
    // حساب الإزاحة بناءً على السرعة والاتجاه
    const multiplier = direction === 'up' ? -1 : 1;
    const yOffset = distanceFromCenter * speed * multiplier;

    setOffset({ y: yOffset });
  }, [scrollY, ref, speed, direction, disabled]);

  return offset;
}

/**
 * Hook for simple parallax based on scroll position
 * @param speed - Parallax speed multiplier
 * @returns Y offset value
 */
export function useSimpleParallax(speed: number = 0.5): number {
  const scrollY = useScrollY();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Check if on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setOffset(0);
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setOffset(0);
      return;
    }

    setOffset(scrollY * speed);
  }, [scrollY, speed]);

  return offset;
}

/**
 * Hook for layered parallax effect (multiple speeds)
 * @param layers - Array of speed values for each layer
 * @returns Array of Y offset values
 */
export function useLayeredParallax(layers: number[]): number[] {
  const scrollY = useScrollY();
  const [offsets, setOffsets] = useState<number[]>([]);

  useEffect(() => {
    // Check if on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setOffsets(layers.map(() => 0));
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setOffsets(layers.map(() => 0));
      return;
    }

    const newOffsets = layers.map(speed => scrollY * speed);
    setOffsets(newOffsets);
  }, [scrollY, layers]);

  return offsets;
}

/**
 * Hook for horizontal parallax effect
 * @param speed - Parallax speed multiplier
 * @returns X offset value
 */
export function useHorizontalParallax(speed: number = 0.3): number {
  const scrollY = useScrollY();
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    // Check if on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setOffset(0);
      return;
    }

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setOffset(0);
      return;
    }

    setOffset(scrollY * speed);
  }, [scrollY, speed]);

  return offset;
}
