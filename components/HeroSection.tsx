'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Users, Award, Phone } from 'lucide-react';
import Button from './ui/Button';
import Container from './ui/Container';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

/**
 * Hero Section Component - Cinematic landing section
 * Features:
 * - Full height (100vh)
 * - Dynamic pattern background
 * - Bold typography with animations
 * - CTA buttons
 * - Stats cards
 * - Scroll indicator
 */
const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  title = 'مُفتاحك للاستثمار العقاري',
  subtitle = 'وجهتك الأولى للعقارات الراقية والشقق الفندقية',
}) => {
  const [showFloatingButton, setShowFloatingButton] = useState(true);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setShowFloatingButton(scrollPercentage < 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-20 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="قسم البطل الرئيسي"
    >
      {/* Background Container with Border Radius */}
      <div 
        className="absolute inset-12 sm:inset-16 lg:inset-20 xl:inset-24 rounded-3xl overflow-hidden shadow-2xl flex items-center justify-center"
        style={{
          backgroundImage: `url('/images/hero/hero-bg.jpg')`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      >
        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage: 'url(/patterns/pattern-vertical-white.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            maskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 100%)',
            WebkitMaskImage: 'linear-gradient(to right, rgba(0,0,0,1) 0%, rgba(0,0,0,0) 25%, rgba(0,0,0,0) 75%, rgba(0,0,0,1) 100%)',
          }}
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-secondary/85 via-secondary/80 to-secondary/75" />

        {/* Content */}
        <Container className="relative z-10 py-16 w-full">
          <div className="text-center space-y-8 max-w-5xl mx-auto px-4 animate-in fade-in slide-in-from-bottom duration-1000">
          {/* Main Title */}
          <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-primary leading-[1.15] font-bristone animate-in fade-in slide-in-from-bottom duration-700 delay-200">
            {title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl sm:text-2xl md:text-3xl text-accent font-medium leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-300">
            {subtitle}
          </p>

          {/* Description */}
          <p className="text-base sm:text-lg md:text-xl text-accent/90 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-400">
            تجربة استثنائية مع <span className="text-primary font-semibold">برامج تدريبية احترافية</span>
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-5 justify-center items-center pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-500">
            {/* Primary Button - اكتشف العقارات */}
            <Button
              variant="primary"
              size="lg"
              onClick={() => {
                const section = document.getElementById('services');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              اكتشف الخدمات
            </Button>

            {/* Secondary Button - تواصل معي */}
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const section = document.getElementById('contact');
                section?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              تواصل معي
            </Button>
          </div>

          {/* Stats - مربعات شفافة مع تأثير لمعان */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 md:gap-6 pt-12 max-w-4xl mx-auto animate-in fade-in slide-in-from-bottom duration-700 delay-700">
            {/* Stat Card 1 - عقار متميز */}
            <div className="group relative overflow-hidden rounded-2xl">
              {/* Background with glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border-2 border-primary/30 rounded-2xl transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-2xl group-hover:shadow-primary/20" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl">
                <div className="absolute inset-0 translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000 bg-gradient-to-l from-transparent via-primary/20 to-transparent skew-x-12" />
              </div>
              
              {/* Content */}
              <div className="relative text-center space-y-2.5 p-5 md:p-7 transform transition-transform duration-500 group-hover:scale-105">
                {/* Icon */}
                <div className="flex justify-center mb-1.5">
                  <div className="p-2.5 bg-primary/10 border-2 border-primary/30 rounded-xl transition-all duration-500 group-hover:bg-primary/15 group-hover:border-primary/40 group-hover:shadow-md group-hover:shadow-primary/20">
                    <Building2 className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500 group-hover:scale-110" />
                  </div>
                </div>
                
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary font-bristone transition-all duration-500 group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.25)]">
                  500+
                </div>
                <div className="text-sm md:text-base text-accent font-semibold transition-colors duration-500 group-hover:text-primary/90">
                  عقار متميز
                </div>
              </div>
            </div>

            {/* Stat Card 2 - عميل راضٍ */}
            <div className="group relative overflow-hidden rounded-2xl">
              {/* Background with glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border-2 border-primary/30 rounded-2xl transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-2xl group-hover:shadow-primary/20" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl">
                <div className="absolute inset-0 translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000 bg-gradient-to-l from-transparent via-primary/20 to-transparent skew-x-12" />
              </div>
              
              {/* Content */}
              <div className="relative text-center space-y-2.5 p-5 md:p-7 transform transition-transform duration-500 group-hover:scale-105">
                {/* Icon */}
                <div className="flex justify-center mb-1.5">
                  <div className="p-2.5 bg-primary/10 border-2 border-primary/30 rounded-xl transition-all duration-500 group-hover:bg-primary/15 group-hover:border-primary/40 group-hover:shadow-md group-hover:shadow-primary/20">
                    <Users className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500 group-hover:scale-110" />
                  </div>
                </div>
                
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary font-bristone transition-all duration-500 group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.25)]">
                  1200+
                </div>
                <div className="text-sm md:text-base text-accent font-semibold transition-colors duration-500 group-hover:text-primary/90">
                  عميل راضٍ
                </div>
              </div>
            </div>

            {/* Stat Card 3 - سنة خبرة */}
            <div className="group relative overflow-hidden rounded-2xl">
              {/* Background with glass effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-transparent backdrop-blur-sm border-2 border-primary/30 rounded-2xl transition-all duration-500 group-hover:border-primary/60 group-hover:shadow-2xl group-hover:shadow-primary/20" />
              
              {/* Shine effect on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl">
                <div className="absolute inset-0 translate-x-[100%] group-hover:translate-x-[-100%] transition-transform duration-1000 bg-gradient-to-l from-transparent via-primary/20 to-transparent skew-x-12" />
              </div>
              
              {/* Content */}
              <div className="relative text-center space-y-2.5 p-5 md:p-7 transform transition-transform duration-500 group-hover:scale-105">
                {/* Icon */}
                <div className="flex justify-center mb-1.5">
                  <div className="p-2.5 bg-primary/10 border-2 border-primary/30 rounded-xl transition-all duration-500 group-hover:bg-primary/15 group-hover:border-primary/40 group-hover:shadow-md group-hover:shadow-primary/20">
                    <Award className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500 group-hover:scale-110" />
                  </div>
                </div>
                
                <div className="text-3xl md:text-4xl lg:text-5xl font-bold text-primary font-bristone transition-all duration-500 group-hover:drop-shadow-[0_0_6px_rgba(212,175,55,0.25)]">
                  15+
                </div>
                <div className="text-sm md:text-base text-accent font-semibold transition-colors duration-500 group-hover:text-primary/90">
                  سنة خبرة
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator - Inside Background */}
        <button
          className="absolute bottom-8 left-1/2 -translate-x-1/2 text-primary cursor-pointer z-20 hover:scale-110 active:scale-90 transition-transform"
          onClick={scrollToNext}
          aria-label="انتقل إلى القسم التالي"
          type="button"
        >
          <div className="flex flex-col items-center gap-2">
            <span className="text-sm text-accent/80">اكتشف المزيد</span>
            <ChevronDown 
              size={32} 
              className="text-primary animate-[bounce_2s_ease-in-out_infinite]" 
              aria-hidden="true" 
            />
          </div>
        </button>
      </Container>
      </div>

      {/* Floating Button - احجز استشارة مجانية */}
      {showFloatingButton && (
        <button
          onClick={() => {
            const section = document.getElementById('cta');
            section?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="fixed bottom-8 right-12 sm:right-16 lg:right-20 xl:right-24 z-50 group bg-primary hover:bg-primary/90 text-secondary px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom"
          aria-label="احجز استشارة مجانية"
          type="button"
        >
          <Phone 
            size={18} 
            className="transition-transform duration-300 group-hover:scale-105" 
          />
          <span className="font-semibold text-sm">احجز استشارة مجانية</span>
        </button>
      )}
    </section>
  );
};

// Export memoized component
export const HeroSection = React.memo(HeroSectionComponent);

export default HeroSection;
