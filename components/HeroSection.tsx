'use client';

import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Building2, Users, Award, Phone, Moon, Menu, X, User, ShoppingCart } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import Container from './ui/Container';
import { 
  heroTitle, 
  heroSubtitle, 
  heroButtons, 
  heroStats, 
  heroStatItem,
  scrollIndicator,
  navbarSlideDown,
  staggerContainer
} from '@/lib/animations/variants';
import { useCounter } from '@/hooks/useCounter';

const sentences = [
  'طور مشروعك ومهاراتك في العقارات مع عبد الله الخضر',
  'حوّل وحدتك إلى استثمار فندقي ناجح مع عبد الله الخضر',
  'ارتقِ بالإيجارات قصيرة الأجل بخبرة عبد الله الخضر',
  'استثمر بذكاء في الشقق الفندقية مع عبد الله الخضر',
  'ابْنِ نموذجًا عقاريًا مربحًا مع عبد الله الخضر',
];

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
  const [isVisible, setIsVisible] = useState(false);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  
  // Animated counters
  const nightsCount = useCounter({ start: 0, end: 3000, duration: 2500 }, isVisible);
  const clientsCount = useCounter({ start: 0, end: 1200, duration: 2500 }, isVisible);
  const yearsCount = useCounter({ start: 0, end: 5, duration: 2000 }, isVisible);

  useEffect(() => {
    // Trigger animations on mount
    setIsVisible(true);
  }, []);

  useEffect(() => {
    // Rotate sentences every 4 seconds
    const sentenceInterval = setInterval(() => {
      setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length);
    }, 4000);
    
    return () => {
      clearInterval(sentenceInterval);
    };
  }, []);

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
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
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
      ref={sectionRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-16 pb-24 md:pb-16 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="hero section"
    >
      {/* Backdrop blur overlay - shown when mobile menu is open */}
      {isMobileMenuOpen && (
        <motion.div 
          className="lg:hidden absolute inset-0 bg-black/20 backdrop-blur-sm z-40"
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        />
      )}

      {/* Mobile/Tablet Navbar - Inside Hero */}
      <motion.div 
        className="lg:hidden absolute top-8 left-6 right-6 md:top-10 md:left-12 md:right-12 z-50"
        initial="hidden"
        animate="visible"
        variants={navbarSlideDown}
      >
        <div className="rounded-2xl px-2 md:px-4">
          <nav className="flex items-center justify-between h-11 md:h-14">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-1.5 md:gap-2 hover:opacity-80 transition-opacity">
              <motion.div 
                className="relative w-7 h-7 md:w-8 md:h-8"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.6 }}
              >
                <Image
                  src="/logos/logo-white-icon.png"
                  alt="مفتاحك"
                  fill
                  className="object-contain"
                  priority
                />
              </motion.div>
              <span className="text-sm md:text-lg font-bold text-accent font-bristone hidden sm:block">
                MOFTAHAK
              </span>
            </Link>

            {/* Menu Button */}
            <motion.button
              className="p-1 md:p-2 text-accent hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="القائمة"
              whileTap={{ scale: 0.9 }}
            >
              {isMobileMenuOpen ? <X size={24} className="md:hidden" /> : <Menu size={24} className="md:hidden" />}
              {isMobileMenuOpen ? <X size={28} className="hidden md:block" /> : <Menu size={28} className="hidden md:block" />}
            </motion.button>
          </nav>

          {/* Mobile Menu */}
          {isMobileMenuOpen && (
            <motion.div 
              className="py-6 border-t border-accent bg-[#fdf6ee]/95 backdrop-blur-md rounded-2xl -mx-3 md:-mx-4 px-3 md:px-4 shadow-lg"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <motion.div 
                className="flex flex-col gap-4"
                variants={staggerContainer}
                initial="hidden"
                animate="visible"
              >
                {navLinks.map((link, index) => (
                  <motion.button
                    key={link.href}
                    onClick={() => scrollToSection(link.href)}
                    className="text-right text-secondary hover:text-primary font-semibold py-2 transition-colors duration-300"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    whileHover={{ x: 5 }}
                  >
                    {link.label}
                  </motion.button>
                ))}
                <div className="flex items-center gap-4 pt-4 border-t border-accent">
                  <motion.button
                    className="p-2 text-secondary hover:text-primary transition-colors"
                    aria-label="السلة"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <ShoppingCart size={22} />
                  </motion.button>
                  <motion.button
                    className="p-2 text-secondary hover:text-primary transition-colors"
                    aria-label="تسجيل الدخول"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    <User size={22} />
                  </motion.button>
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
              </motion.div>
            </motion.div>
          )}
        </div>
      </motion.div>

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
          <Image 
            src="/images/hero/hero-bg.jpg"
            alt=""
            fill
            className="absolute inset-0 w-full h-full object-cover animate-slideshow-1"
            priority
            quality={85}
            sizes="100vw"
          />
          <Image 
            src="/images/hero/slide-1.jpg"
            alt=""
            fill
            className="absolute inset-0 w-full h-full object-cover animate-slideshow-2"
            priority
            quality={85}
            sizes="100vw"
          />
          <Image 
            src="/images/hero/slide-2.jpg"
            alt=""
            fill
            className="absolute inset-0 w-full h-full object-cover animate-slideshow-3"
            priority
            quality={85}
            sizes="100vw"
          />
          <Image 
            src="/images/hero/slide-3.jpg"
            alt=""
            fill
            className="absolute inset-0 w-full h-full object-cover animate-slideshow-4"
            priority
            quality={85}
            sizes="100vw"
          />
        </div>
        
        {/* Pattern Overlay */}
        <div className="absolute inset-0 opacity-20 rounded-2xl lg:rounded-none overflow-hidden z-[1]">
          <Image 
            src="/patterns/pattern_hero.png"
            alt=""
            fill
            className="object-cover"
            quality={70}
            priority={false}
            sizes="100vw"
          />
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center py-4 md:py-6 px-4 md:px-6">
          {/* Main Content */}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-3 md:space-y-4 max-w-4xl mx-auto w-full">
            {/* Main Title */}
            <motion.h1 
              className="text-4xl sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-primary leading-[1.15] font-bristone"
              initial={{ opacity: 0, y: 30, filter: "blur(10px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              {title}
            </motion.h1>

            {/* Animated Subtitle with Word-by-Word Fade */}
            <motion.div 
              className="text-lg sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl text-accent font-medium leading-relaxed px-2 min-h-[4rem] sm:min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSentenceIndex}
                  className="flex flex-wrap gap-x-2 gap-y-1 justify-center items-center"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  exit={{ opacity: 0, filter: "blur(10px)" }}
                  transition={{ duration: 0.5 }}
                >
                  {sentences[currentSentenceIndex].split(' ').map((word, index) => (
                    <motion.span
                      key={`${currentSentenceIndex}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.4,
                        delay: index * 0.08,
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {/* CTA Buttons */}
            <motion.div 
              className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center pt-1 md:pt-2 w-full px-4"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.9 }}
                className="w-full sm:w-auto"
              >
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
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 1.0 }}
                className="w-full sm:w-auto"
              >
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
              </motion.div>
            </motion.div>

            {/* Stats */}
            <motion.div 
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 md:gap-5 pt-4 md:pt-6 max-w-3xl w-full px-4 sm:px-0"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.1 }}
            >
              {/* Stat Card 1 */}
              <motion.div 
                className="group relative overflow-hidden rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.2 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 1.2 }}
                />
                
                <div className="relative text-center space-y-1 md:space-y-2 px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5">
                  <div className="flex justify-center mb-1 md:mb-2">
                    <motion.div 
                      className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30"
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Moon className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500" />
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-0.5 md:pt-1">
                    <div className="text-2xl md:text-3xl lg:text-3xl font-bold text-primary font-bristone">
                      {nightsCount}
                    </div>
                    <div className="text-base md:text-lg lg:text-lg text-accent font-semibold">
                      ليلة
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stat Card 2 */}
              <motion.div 
                className="group relative overflow-hidden rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.4 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                />
                
                <div className="relative text-center space-y-1 md:space-y-2 px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5">
                  <div className="flex justify-center mb-1 md:mb-2">
                    <motion.div 
                      className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30"
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Users className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500" />
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-0.5 md:pt-1">
                    <div className="text-2xl md:text-3xl lg:text-3xl font-bold text-primary font-bristone">
                      {clientsCount}
                    </div>
                    <div className="text-base md:text-lg lg:text-lg text-accent font-semibold">
                      عميل راضي
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Stat Card 3 */}
              <motion.div 
                className="group relative overflow-hidden rounded-xl"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 1.6 }}
                whileHover={{ scale: 1.05, y: -5 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-primary/5 backdrop-blur-md border-2 border-primary/20 rounded-xl transition-all duration-500 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10"
                  initial={{ opacity: 0, filter: "blur(10px)" }}
                  animate={{ opacity: 1, filter: "blur(0px)" }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                />
                
                <div className="relative text-center space-y-1 md:space-y-2 px-4 md:px-6 pt-3 md:pt-4 pb-4 md:pb-5">
                  <div className="flex justify-center mb-1 md:mb-2">
                    <motion.div 
                      className="p-2 md:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-500 group-hover:bg-primary/20 group-hover:border-primary/30"
                      whileHover={{ scale: 1.15, rotate: 10 }}
                      transition={{ duration: 0.3, ease: "easeOut" }}
                    >
                      <Award className="w-7 h-7 md:w-8 md:h-8 text-primary transition-all duration-500" />
                    </motion.div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1.5 md:gap-2 pt-0.5 md:pt-1">
                    <div className="text-2xl md:text-3xl lg:text-3xl font-bold text-primary font-bristone">
                      {yearsCount}
                    </div>
                    <div className="text-base md:text-lg lg:text-lg text-accent font-semibold">
                      سنين خبرة
                    </div>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>
      </div>
      </div>

      {/* Scroll Indicator - Hidden on mobile and tablet, shown on lg+ screens */}
      <motion.button
        className="hidden lg:block absolute cursor-pointer z-1 active:scale-90 transition-transform"
        style={{ 
          bottom: '2rem', 
          transform: 'translateX(-50%)',
          transformOrigin: 'center center'
        }}
        onClick={scrollToNext}
        aria-label="انتقل إلى القسم التالي"
        type="button"
        variants={scrollIndicator}
        initial="hidden"
        animate={showFloatingButton ? "visible" : "hidden"}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
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
      </motion.button>

      {/* Floating Button - احجز استشارة مجانية */}
      {showFloatingButton && (
        <motion.button
          onClick={() => {
            const section = document.getElementById('cta');
            section?.scrollIntoView({ behavior: 'smooth' });
          }}
          className="fixed bottom-12 right-8 sm:right-8 lg:right-10 xl:right-12 z-50 group bg-primary hover:bg-primary/90 text-secondary px-5 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-300 flex items-center gap-2.5"
          aria-label="احجز استشارة مجانية"
          type="button"
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          transition={{ duration: 0.5, delay: 1.5 }}
          whileHover={{ scale: 1.05, boxShadow: '0 0 20px rgba(237, 191, 140, 0.6)' }}
          whileTap={{ scale: 0.95 }}
        >
          <Phone 
            size={18} 
            className="transition-transform duration-300 group-hover:scale-105" 
          />
          <span className="font-semibold text-sm">احجز استشارة مجانية</span>
        </motion.button>
      )}
    </section>
  );
}

// Export memoized component
export const HeroSection = React.memo(HeroSectionComponent);

export default HeroSection;
