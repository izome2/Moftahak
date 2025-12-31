/**
 * Custom Hook for Scroll-based Animations
 * يكشف متى يظهر العنصر في viewport ويفعّل الأنميشن
 */

'use client';

import { useEffect, useState, RefObject } from 'react';

interface UseScrollAnimationOptions {
  threshold?: number; // نسبة الظهور المطلوبة (0-1)
  once?: boolean; // هل يحدث مرة واحدة فقط؟
  rootMargin?: string; // هامش إضافي
  disabled?: boolean; // تعطيل الأنميشن
}

/**
 * Hook to detect when element enters viewport
 * @param ref - Reference to the element to observe
 * @param options - Configuration options
 * @returns boolean indicating if element is in view
 */
export function useScrollAnimation(
  ref: RefObject<Element>,
  options: UseScrollAnimationOptions = {}
): boolean {
  const {
    threshold = 0.3,
    once = false,
    rootMargin = '0px 0px -10% 0px',
    disabled = false
  } = options;

  const [isInView, setIsInView] = useState(false);

  useEffect(() => {
    if (disabled) {
      setIsInView(true);
      return;
    }

    const element = ref.current;
    if (!element) return;

    // Check if user prefers reduced motion
    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      setIsInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        // إذا العنصر ظهر
        if (entry.isIntersecting) {
          setIsInView(true);
          
          // إذا once = true، نوقف المراقبة
          if (once) {
            observer.unobserve(element);
          }
        } else if (!once) {
          // إذا once = false، نخفي العنصر عند الخروج
          setIsInView(false);
        }
      },
      {
        threshold,
        rootMargin
      }
    );

    observer.observe(element);

    return () => {
      observer.unobserve(element);
    };
  }, [ref, threshold, once, rootMargin, disabled]);

  return isInView;
}

/**
 * Hook to get scroll progress (0-1)
 * @returns scroll progress value between 0 and 1
 */
export function useScrollProgress(): number {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const throttleDelay = 16; // ~60fps

    const handleScroll = () => {
      const now = Date.now();
      
      if (rafId === null && now - lastUpdateTime >= throttleDelay) {
        rafId = requestAnimationFrame(() => {
          const totalHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = window.scrollY / totalHeight;
          setScrollProgress(Math.min(Math.max(progress, 0), 1));
          lastUpdateTime = now;
          rafId = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return scrollProgress;
}

/**
 * Hook to get scroll Y position
 * @returns current scroll Y position
 */
export function useScrollY(): number {
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const throttleDelay = 16; // ~60fps

    const handleScroll = () => {
      const now = Date.now();
      
      if (rafId === null && now - lastUpdateTime >= throttleDelay) {
        rafId = requestAnimationFrame(() => {
          setScrollY(window.scrollY);
          lastUpdateTime = now;
          rafId = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, []);

  return scrollY;
}

/**
 * Hook to detect scroll direction
 * @returns 'up' | 'down' | null
 */
export function useScrollDirection(): 'up' | 'down' | null {
  const [scrollDirection, setScrollDirection] = useState<'up' | 'down' | null>(null);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const throttleDelay = 100; // Update less frequently for direction

    const handleScroll = () => {
      const now = Date.now();
      
      if (rafId === null && now - lastUpdateTime >= throttleDelay) {
        rafId = requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          
          if (Math.abs(currentScrollY - lastScrollY) > 5) { // Minimum movement threshold
            if (currentScrollY > lastScrollY) {
              setScrollDirection('down');
            } else if (currentScrollY < lastScrollY) {
              setScrollDirection('up');
            }
            setLastScrollY(currentScrollY);
          }
          
          lastUpdateTime = now;
          rafId = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [lastScrollY]);

  return scrollDirection;
}

/**
 * Hook to check if scrolled past a certain point
 * @param threshold - Y position threshold
 * @returns boolean indicating if scrolled past threshold
 */
export function useScrollPast(threshold: number = 100): boolean {
  const [isPast, setIsPast] = useState(false);

  useEffect(() => {
    let rafId: number | null = null;
    let lastUpdateTime = 0;
    const throttleDelay = 100;

    const handleScroll = () => {
      const now = Date.now();
      
      if (rafId === null && now - lastUpdateTime >= throttleDelay) {
        rafId = requestAnimationFrame(() => {
          setIsPast(window.scrollY > threshold);
          lastUpdateTime = now;
          rafId = null;
        });
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial call

    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
    };
  }, [threshold]);

  return isPast;
}
