'use client';

import React, { useState, useEffect } from 'react';
import { ChevronDown, Building2, Users, Award, Phone, Moon, Menu, X, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setShowFloatingButton(scrollPercentage < 1);
      
      // Close mobile menu on scroll
      if (isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isMobileMenuOpen]);

  const scrollToNext = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const navLinks = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'من أنا', href: '#about' },
    { label: 'الخدمات', href: '#services' },
    { label: 'المحتوى', href: '#content' },
    { label: 'تواصل معي', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <section
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-16 pb-24 md:pb-16 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="قسم البطل الرئيسي"
    >
      {/* Backdrop blur overlay - shown when mobile menu is open */}
      {isMobileMenuOpen && (
        <div 
          className="lg:hidden absolute inset-0 bg-black/20 backdrop-blur-sm z-40 animate-in fade-in duration-300"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Mobile/Tablet Navbar - Inside Hero */}
      <div className="lg:hidden absolute top-8 left-6 right-6 md:top-10 md:left-12 md:right-12 z-50">
        <div className="rounded-2xl px-2 md:px-4">
          <nav className="flex items-center justify-between h-11 md:h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 md:gap-2 hover:opacity-80 transition-opacity">
              <div className="relative w-7 h-7 md:w-8 md:h-8">
                <Image
                  src="/logos/logo-white-icon.png"
                  alt="مفتاحك"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-sm md:text-lg font-bold text-accent font-bristone hidden sm:block">
                MOFTAHAK
              </span>
            </Link>

            {/* Menu Button */}
            <button
              className="p-1 md:p-2 text-accent hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="القائمة"
            >
              {isMobileMenuOpen ? <X size={24} className="md:hidden" /> : <Menu size={24} className="md:hidden" />}
              {isMobileMenuOpen ? <X size={28} className="hidden md:block" /> : <Menu size={28} className="hidden md:block" />}
            </button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <div className="py-6 border-t border-accent animate-in fade-in slide-in-from-top duration-300 bg-[#fdf6ee]/95 backdrop-blur-md rounded-2xl -mx-3 md:-mx-4 px-3 md:px-4 shadow-lg">
              <div className="flex flex-col gap-4">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-right text-secondary hover:text-primary font-semibold py-2 transition-colors duration-300"
                  >
                    {link.label}
                  </button>
                ))}
                <div className="flex items-center gap-4 pt-4 border-t border-accent">
                  <button
                    className="p-2 text-secondary hover:text-primary transition-colors"
                    aria-label="السلة"
                  >
                    <ShoppingCart size={22} />
                  </button>
                  <button
                    className="p-2 text-secondary hover:text-primary transition-colors"
                    aria-label="تسجيل الدخول"
                  >
                    <User size={22} />
                  </button>
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Phone size={18} />}
                    onClick={() => scrollToSection('#contact')}
                    className="flex-1"
                  >
                    تواصل معي
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* SVG Clip Path Definition - Hidden on mobile and tablet, shown on lg+ */}
      <svg width="0" height="0" className="absolute hidden lg:block">
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
        className="absolute inset-4 bottom-8 lg:top-20 lg:left-16 lg:right-16 xl:left-20 xl:right-20 lg:bottom-12"
        style={{ 
          filter: 'drop-shadow(0px 10px 25px rgba(0, 0, 0, 0.35))',
        }}
      >
        {/* Background Container with Custom Shape */}
        <div 
          className="w-full h-full bg-secondary rounded-2xl lg:rounded-none"
          style={{ 
            clipPath: 'var(--hero-clip-path, none)',
          }}
        >
        {/* Slideshow Background Images with Ken Burns Effect */}
        <div className="absolute inset-0 rounded-2xl lg:rounded-none overflow-hidden opacity-30">
          <div 
            className="absolute inset-0 w-full h-full animate-slideshow-1"
            style={{
              backgroundImage: `url('/images/hero/hero-bg.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div 
            className="absolute inset-0 w-full h-full animate-slideshow-2"
            style={{
              backgroundImage: `url('/images/hero/slide-1.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div 
            className="absolute inset-0 w-full h-full animate-slideshow-3"
            style={{
              backgroundImage: `url('/images/hero/slide-2.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
          <div 
            className="absolute inset-0 w-full h-full animate-slideshow-4"
            style={{
              backgroundImage: `url('/images/hero/slide-3.jpg')`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              backgroundRepeat: 'no-repeat',
            }}
          />
        </div>
        
        {/* Pattern Overlay */}
        <div 
          className="absolute inset-0 opacity-20 rounded-2xl lg:rounded-none overflow-hidden z-[1]"
          style={{
            backgroundImage: 'url(/patterns/pattern_hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center py-4 md:py-6 px-4 md:px-6">
          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 max-w-4xl mx-auto w-full animate-in fade-in slide-in-from-bottom duration-1000">
            {/* Main Title */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-primary leading-[1.15] font-bristone animate-in fade-in slide-in-from-bottom duration-700 delay-200">
              {title}
            </h1>

            {/* Subtitle */}
            <p className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl text-accent font-medium leading-relaxed animate-in fade-in slide-in-from-bottom duration-700 delay-300 px-2">
              {subtitle}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-1 md:pt-2 animate-in fade-in slide-in-from-bottom duration-700 delay-500 w-full px-4">
              <Button
                variant="primary"
                size="lg"
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
                size="lg"
                onClick={() => {
                  const section = document.getElementById('contact');
                  section?.scrollIntoView({ behavior: 'smooth' });
                }}
                className="w-full sm:w-auto backdrop-blur-md bg-white/10"
              >
                تواصل معي
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-5 pt-4 md:pt-6 max-w-3xl w-full px-4 sm:px-0 animate-in fade-in slide-in-from-bottom duration-700 delay-700">
              {/* Stat Card 1 */}
              <div className="group relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10" />
                
                <div className="relative text-center space-y-1 md:space-y-2 px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5 transform transition-transform duration-500 group-hover:scale-105">
                  <div className="flex justify-center mb-1 md:mb-2">
                    <div className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Moon className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-0.5 md:pt-1">
                    <div className="text-2xl md:text-3xl lg:text-3xl font-bold text-primary font-bristone">
                      3000
                    </div>
                    <div className="text-base md:text-lg lg:text-lg text-accent font-semibold">
                      ليلة
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 2 */}
              <div className="group relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10" />
                
                <div className="relative text-center space-y-1 md:space-y-2 px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5 transform transition-transform duration-500 group-hover:scale-105">
                  <div className="flex justify-center mb-1 md:mb-2">
                    <div className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Users className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-0.5 md:pt-1">
                    <div className="text-2xl md:text-3xl lg:text-3xl font-bold text-primary font-bristone">
                      1200
                    </div>
                    <div className="text-base md:text-lg lg:text-lg text-accent font-semibold">
                      عميل راضي
                    </div>
                  </div>
                </div>
              </div>

              {/* Stat Card 3 */}
              <div className="group relative overflow-hidden rounded-xl">
                <div className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10" />
                
                <div className="relative text-center space-y-1 md:space-y-2 px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5 transform transition-transform duration-500 group-hover:scale-105">
                  <div className="flex justify-center mb-1 md:mb-2">
                    <div className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Award className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500 group-hover:scale-110" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-0.5 md:pt-1">
                    <div className="text-2xl md:text-3xl lg:text-3xl font-bold text-primary font-bristone">
                      5
                    </div>
                    <div className="text-base md:text-lg lg:text-lg text-accent font-semibold">
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

      {/* Scroll Indicator - Hidden on mobile and tablet, shown on lg+ screens */}
      <button
        className="hidden lg:block absolute cursor-pointer z-1 active:scale-90 transition-transform"
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
          className="fixed bottom-12 right-8 sm:right-8 lg:right-10 xl:right-12 z-50 group bg-primary hover:bg-primary/90 text-secondary px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5 animate-in fade-in slide-in-from-bottom"
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
