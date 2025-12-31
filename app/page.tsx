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
    const handleImageLoaded = () => {
      setIsLoading(false);
    };

    window.addEventListener('heroImageLoaded', handleImageLoaded);

    return () => {
      window.removeEventListener('heroImageLoaded', handleImageLoaded);
    };
  }, []);

  if (isLoading) {
    return <LoadingSpinner fullScreen text="جاري التحميل" />;
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
