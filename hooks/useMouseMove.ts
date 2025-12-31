/**
 * Custom Hook for Mouse Movement Tracking
 * يتتبع حركة الماوس للتأثيرات التفاعلية
 */

'use client';

import { useEffect, useState, RefObject } from 'react';

interface MousePosition {
  x: number;
  y: number;
}

/**
 * Hook to track mouse position
 * @returns Current mouse position {x, y}
 */
export function useMousePosition(): MousePosition {
  const [mousePosition, setMousePosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return mousePosition;
}

/**
 * Hook to track mouse position relative to an element
 * @param ref - Reference to the element
 * @returns Mouse position relative to element {x, y}
 */
export function useMousePositionRelative(
  ref: RefObject<HTMLElement>
): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      setPosition({ x, y });
    };

    element.addEventListener('mousemove', handleMouseMove);

    return () => element.removeEventListener('mousemove', handleMouseMove);
  }, [ref]);

  return position;
}

/**
 * Hook for magnetic button effect
 * @param ref - Reference to the button element
 * @param strength - Magnetic strength (0-1)
 * @param radius - Activation radius in pixels
 * @returns Transform values {x, y}
 */
export function useMagneticEffect(
  ref: RefObject<HTMLElement>,
  strength: number = 0.3,
  radius: number = 80
): MousePosition {
  const [transform, setTransform] = useState<MousePosition>({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setTransform({ x: 0, y: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      
      const distanceX = e.clientX - centerX;
      const distanceY = e.clientY - centerY;
      const distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);

      // Only activate within radius
      if (distance < radius) {
        const x = distanceX * strength;
        const y = distanceY * strength;
        setTransform({ x, y });
        setIsHovering(true);
      } else if (isHovering) {
        setTransform({ x: 0, y: 0 });
        setIsHovering(false);
      }
    };

    const handleMouseLeave = () => {
      setTransform({ x: 0, y: 0 });
      setIsHovering(false);
    };

    window.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, strength, radius, isHovering]);

  return transform;
}

/**
 * Hook for 3D tilt effect on cards
 * @param ref - Reference to the card element
 * @param intensity - Tilt intensity (0-1)
 * @returns Rotation values {rotateX, rotateY}
 */
export function useTiltEffect(
  ref: RefObject<HTMLElement>,
  intensity: number = 10
): { rotateX: number; rotateY: number } {
  const [rotation, setRotation] = useState({ rotateX: 0, rotateY: 0 });

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    // Check if on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setRotation({ rotateX: 0, rotateY: 0 });
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;
      
      // Calculate rotation based on mouse position relative to center
      // Inverted rotateY for more natural tilt (right side tilts right)
      const rotateY = ((x - centerX) / centerX) * intensity;
      const rotateX = -((y - centerY) / centerY) * intensity;
      
      setRotation({ rotateX, rotateY });
    };

    const handleMouseLeave = () => {
      // Smooth transition back to 0
      setRotation({ rotateX: 0, rotateY: 0 });
    };

    element.addEventListener('mousemove', handleMouseMove);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mousemove', handleMouseMove);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref, intensity]);

  return rotation;
}

/**
 * Hook to track if mouse is hovering over element
 * @param ref - Reference to the element
 * @returns Boolean indicating hover state
 */
export function useHover(ref: RefObject<HTMLElement>): boolean {
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => setIsHovering(false);

    element.addEventListener('mouseenter', handleMouseEnter);
    element.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      element.removeEventListener('mouseenter', handleMouseEnter);
      element.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [ref]);

  return isHovering;
}

/**
 * Hook for cursor spotlight effect
 * @returns Mouse position for spotlight
 */
export function useSpotlight(): MousePosition {
  const [position, setPosition] = useState<MousePosition>({ x: 0, y: 0 });

  useEffect(() => {
    // Check if on mobile
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      return;
    }

    const handleMouseMove = (e: MouseEvent) => {
      setPosition({ x: e.clientX, y: e.clientY });
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return position;
}
