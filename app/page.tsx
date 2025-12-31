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
    // Preload the first hero image
    const img = new window.Image();
    img.src = '/images/hero/hero-bg.jpg';
    
    // Set loading to false when image loads or after max 3 seconds
    const timer = setTimeout(() => setIsLoading(false), 3000);
    
    img.onload = () => {
      setIsLoading(false);
      clearTimeout(timer);
    };
    
    img.onerror = () => {
      setIsLoading(false);
      clearTimeout(timer);
    };

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
