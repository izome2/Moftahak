'use client';

import { useEffect, useState, useRef } from 'react';

export default function CustomScrollbar() {
  const [scrollPercentage, setScrollPercentage] = useState(0);
  const [isDesktop, setIsDesktop] = useState(false);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const checkDevice = () => {
      setIsDesktop(window.innerWidth >= 1024);
    };

    checkDevice();
    window.addEventListener('resize', checkDevice);

    return () => {
      window.removeEventListener('resize', checkDevice);
    };
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const windowHeight = window.innerHeight;
      const documentHeight = document.documentElement.scrollHeight;
      const scrollTop = window.scrollY;
      
      const scrollableHeight = documentHeight - windowHeight;
      const percentage = scrollableHeight > 0 ? (scrollTop / scrollableHeight) * 100 : 0;
      
      setScrollPercentage(percentage);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll();

    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  if (!isDesktop) return null;

  return (
    <div
      ref={scrollbarRef}
      style={{
        position: 'fixed',
        right: '30px',
        top: '50%',
        transform: 'translateY(-50%)',
        width: '6px',
        height: '25%',
        backgroundColor: '#e1d2c133',
        borderRadius: '10px',
        zIndex: 9999,
        pointerEvents: 'none',
      }}
    >
      <div
        ref={thumbRef}
        style={{
          position: 'absolute',
          right: '0',
          top: `calc(${scrollPercentage}% * (100% - 50px) / 100%)`,
          width: '100%',
          height: '50px',
          backgroundColor: '#ead4ba',
          borderRadius: '10px',
        }}
      />
    </div>
  );
}
