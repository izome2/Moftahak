'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import ServicesSection from '@/components/ServicesSection';
import PremiumSection from '@/components/PremiumSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContentSection from '@/components/ContentSection';
import CTASection from '@/components/CTASection';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function HomePage() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Preload all critical hero images
    const images = [
      '/images/hero/hero-bg.jpg',
      '/images/hero/slide-1.jpg'
    ];
    
    let loadedCount = 0;
    const totalImages = images.length;
    
    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        // Add small delay to ensure smooth transition
        setTimeout(() => setIsLoading(false), 300);
      }
    };
    
    // Timeout fallback - max 5 seconds
    const timer = setTimeout(() => setIsLoading(false), 5000);
    
    images.forEach(src => {
      const img = new window.Image();
      img.src = src;
      img.onload = checkAllLoaded;
      img.onerror = checkAllLoaded;
    });

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen />;
  }

  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <AboutSection />
        <FeaturesSection />
        <ServicesSection />
        <PremiumSection />
        <TestimonialsSection />
        <ContentSection />
        <CTASection />
      </main>
    </>
  );
}
