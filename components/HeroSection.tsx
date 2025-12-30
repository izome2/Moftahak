'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Users, Award, Phone, Moon } from 'lucide-react';
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
  subtitle = 'طور مشروعك ومهاراتك في العقارات مع عبد الله الخضر',
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
      className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16 pb-20 md:pb-6 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="قسم البطل الرئيسي"
    >
      {/* SVG Clip Path Definition - Hidden on mobile */}
      <svg width="0" height="0" className="absolute hidden md:block">
        <defs>
          <clipPath id="heroClip" clipPathUnits="objectBoundingBox">
            <path
              d="M 0.987,1 L 0.565,1 C 0.558,1 0.552,0.997 0.547,0.991 C 0.542,0.985 0.535,0.97 0.525,0.95 C 0.52,0.94 0.515,0.93 0.51,0.925 C 0.505,0.92 0.495,0.92 0.49,0.925 C 0.485,0.93 0.48,0.94 0.475,0.95 C 0.465,0.97 0.458,0.985 0.453,0.991 C 0.448,0.997 0.442,1 0.435,1 L 0.013,1 C 0.006,1 0,0.989 0,0.975 L 0,0.025 C 0,0.011 0.006,0 0.013,0 L 0.987,0 C 0.994,0 1,0.011 1,0.025 L 1,0.975 C 1,0.989 0.994,1 0.987,1 Z"
            />
          </clipPath>
        </defs>
      </svg>

      {/* Shadow wrapper - Outside clipped area */}
      <div 
        className="absolute inset-4 md:top-20 md:left-12 md:right-12 lg:left-16 lg:right-16 xl:left-20 xl:right-20 md:bottom-12"
        style={{ 
          filter: 'drop-shadow(0px 10px 25px rgba(0, 0, 0, 0.35))',
        }}
      >
        {/* Background Container with Custom Shape */}
        <div 
          className="w-full h-full bg-secondary rounded-2xl md:rounded-none"
          style={{ 
            clipPath: 'var(--hero-clip-path, none)',
          }}
        >
        {/* Background Image with Overlay */}
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('/images/hero/hero-bg.jpg')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        
        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: 'url(/patterns/pattern_hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center py-8 md:py-12 px-4 md:px-6">
          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 md:space-y-6 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom duration-1000">
            {/* Main Title */}
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-primary leading-[1.15] font-bristone animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl text-accent font-medium leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-300 px-2">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-2 md:pt-4 animate-in fade-in slide-in-from-bottom duration-700 delay-500 w-full px-4">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const section = document.getElementById('services');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto"
              >
                اكتشف الخدمات
              </Button>

              <Button
                variant="outline"
                size="md"
                onClick={() => {
                  const section = document.getElementById('contact');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto"
              >
                تواصل معي
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-5 pt-6 md:pt-12 max-w-3xl w-full animate-in fade-in slide-in-from-bottom duration-700 delay-700">
              {/* Stat Card 1 */}
              <div className="group relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10" />
                
                <div className="relative text-center space-y-2 md:space-y-4 px-4 md:px-6 pt-4 md:pt-6 pb-6 md:pb-8 transform transition-transform duration-500 group-hover:scale-105">
                  <div className="flex justify-center mb-2 md:mb-4">
                    <div className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Moon className="w-5 h-5 md:w-7 md:h-7 text-primary transition-all duration-500 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-1 md:pt-3">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary font-bristone">
                      3000
                    </div>
                    <div className="text-sm md:text-base lg:text-lg text-accent font-semibold">
                      ليلة
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="group relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10" />
                
                <div className="relative text-center space-y-2 md:space-y-4 px-4 md:px-6 pt-4 md:pt-6 pb-6 md:pb-8 transform transition-transform duration-500 group-hover:scale-105">
                  <div className="flex justify-center mb-2 md:mb-4">
                    <div className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Users className="w-5 h-5 md:w-7 md:h-7 text-primary transition-all duration-500 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-1 md:pt-3">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary font-bristone">
                      1200
                    </div>
                    <div className="text-sm md:text-base lg:text-lg text-accent font-semibold">
                      عميل راضي
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="group relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10" />
                
                <div className="relative text-center space-y-2 md:space-y-4 px-4 md:px-6 pt-4 md:pt-6 pb-6 md:pb-8 transform transition-transform duration-500 group-hover:scale-105">
                  <div className="flex justify-center mb-2 md:mb-4">
                    <div className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Award className="w-5 h-5 md:w-7 md:h-7 text-primary transition-all duration-500 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-1 md:pt-3">
                    <div className="text-xl md:text-2xl lg:text-3xl font-bold text-primary font-bristone">
                      5
                    </div>
                    <div className="text-sm md:text-base lg:text-lg text-accent font-semibold">
                      سنين خبرة
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile, shown on medium+ screens */}
      <button
        className="hidden md:block absolute cursor-pointer z-1 active:scale-90 transition-transform"
        style={{ 
          bottom: '2rem', 
          left: '50%', 
          transform: 'translateX(-50%)',
          transformOrigin: 'center center'
        }}
        onMouseEnter={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1.1)'}
        onMouseLeave={(e) => e.currentTarget.style.transform = 'translateX(-50%) scale(1)'}
        onClick={scrollToNext}
        aria-label="انتقل إلى القسم التالي"
        type="button"
      >
        <svg
          width={45}
          height={45}
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <g className="animate-float-delay-0">
            <path
              d="M11.4698 16.2776C11.7626 16.5702 12.2372 16.5702 12.5301 16.2776L14.7801 14.0291C15.0731 13.7363 15.0733 13.2614 14.7805 12.9684C14.4877 12.6754 14.0129 12.6753 13.7199 12.9681L11.9999 14.6868L10.2802 12.9681C9.98718 12.6753 9.5123 12.6754 9.2195 12.9684C8.9267 13.2614 8.92685 13.7363 9.21984 14.0291L11.4698 16.2776Z"
              fill="#10302b"
            />
          </g>

          <g className="animate-float-delay-1">
            <path
              d="M12 9.05488C11.5582 9.05488 11.2 8.69671 11.2 8.25488C11.2 7.81306 11.5582 7.45478 12 7.45478C12.4418 7.45478 12.8 7.81295 12.8 8.25478C12.8 8.69661 12.4418 9.05488 12 9.05488Z"
              fill="#10302b"
            />
          </g>

          <g className="animate-float-delay-2">
            <path
              d="M11.2 11.0713C11.2 11.5131 11.5582 11.8713 12 11.8713C12.4418 11.8713 12.8 11.5131 12.8 11.0713C12.8 10.6295 12.4418 10.2712 12 10.2712C11.5582 10.2712 11.2 10.6295 11.2 11.0713Z"
              fill="#10302b"
            />
          </g>

          <g className="animate-float-reverse">
            <path
              d="M12 2.00098C7.85786 2.00098 4.5 5.35884 4.5 9.50098V14.501C4.5 18.6431 7.85786 22.001 12 22.001C16.1421 22.001 19.5 18.6431 19.5 14.501V9.50098C19.5 5.35884 16.1421 2.00098 12 2.00098ZM6 9.50098C6 6.18727 8.68629 3.50098 12 3.50098C15.3137 3.50098 18 6.18727 18 9.50098V14.501C18 17.8147 15.3137 20.501 12 20.501C8.68629 20.501 6 17.8147 6 14.501V9.50098Z"
              fill="#10302b"
              fillRule="evenodd"
              clipRule="evenodd"
            />
          </g>
        </svg>
      </button>

      {/* Floating Button - احجز استشارة مجانية */}
      {showFloatingButton && (
        <button
          onClick={() => {
            const section = document.getElementById('cta');
            section?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="fixed bottom-8 right-6 sm:right-8 lg:right-10 xl:right-12 z-50 group bg-primary hover:bg-primary/90 text-secondary px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom"
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
