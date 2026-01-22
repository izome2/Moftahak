import { lazy, Suspense } from 'react';
import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import StatsSection from '@/components/StatsSection';
import LoadingSpinner from '@/components/LoadingSpinner';

// Lazy load non-critical sections for better performance
const FeaturesSection = lazy(() => import('@/components/FeaturesSection'));
const ServicesSection = lazy(() => import('@/components/ServicesSection'));
const PremiumSection = lazy(() => import('@/components/PremiumSection'));
const AboutSection = lazy(() => import('@/components/AboutSection'));
const TestimonialsSection = lazy(() => import('@/components/TestimonialsSection'));
const ContentSection = lazy(() => import('@/components/ContentSection'));
const CTASection = lazy(() => import('@/components/CTASection'));

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <StatsSection />
        <Suspense fallback={<LoadingSpinner />}>
          <AboutSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <FeaturesSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <ServicesSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <PremiumSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <TestimonialsSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <ContentSection />
        </Suspense>
        <Suspense fallback={<LoadingSpinner />}>
          <CTASection />
        </Suspense>
      </main>
    </>
  );
}
