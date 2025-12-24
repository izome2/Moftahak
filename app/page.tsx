import Navbar from '@/components/Navbar';
import HeroSection from '@/components/HeroSection';
import FeaturesSection from '@/components/FeaturesSection';
import ServicesSection from '@/components/ServicesSection';
import PremiumSection from '@/components/PremiumSection';
import AboutSection from '@/components/AboutSection';
import TestimonialsSection from '@/components/TestimonialsSection';
import ContentSection from '@/components/ContentSection';
import CTASection from '@/components/CTASection';
import Footer from '@/components/Footer';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main>
        <HeroSection />
        <FeaturesSection />
        <ServicesSection />
        <PremiumSection />
        <AboutSection />
        <TestimonialsSection />
        <ContentSection />
        <CTASection />
      </main>
      <Footer />
    </>
  );
}
