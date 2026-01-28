'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Phone, Moon, Users, Award } from 'lucide-react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import Button from './ui/Button';
import { scrollIndicator } from '@/lib/animations/variants';
import { useCounter } from '@/hooks/useCounter';

interface HeroSectionProps {
  title?: string;
  subtitle?: string;
}

const HeroSectionComponent: React.FC<HeroSectionProps> = ({
  title = 'مُفتاحك للاستثمار العقاري',
  subtitle = 'طور مشروعك ومهاراتك في العقارات مع عبد الله الخضر',
}) => {
  // useMemo for sentences array
  const sentences = useMemo(() => [
    'طور مشروعك ومهاراتك في العقارات مع عبد الله الخضر',
    'حوّل وحدتك إلى استثمار فندقي ناجح مع عبد الله الخضر',
    'ارتقِ بالإيجارات قصيرة الأجل بخبرة عبد الله الخضر',
    'استثمر بذكاء في الشقق الفندقية مع عبد الله الخضر',
    'ابْنِ نموذجًا عقاريًا مربحًا مع عبد الله الخضر',
  ], []);
  
  const [showFloatingButton, setShowFloatingButton] = useState(true);
  const [currentSentenceIndex, setCurrentSentenceIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const sectionRef = useRef<HTMLElement>(null);

  // Counters for stats (only used on sm+ screens)
  const nightsCount = useCounter({ start: 0, end: 3000, duration: 2500 }, isVisible);
  const clientsCount = useCounter({ start: 0, end: 1200, duration: 2500 }, isVisible);
  const yearsCount = useCounter({ start: 0, end: 5, duration: 2000 }, isVisible);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  useEffect(() => {
    const sentenceInterval = setInterval(() => {
      setCurrentSentenceIndex((prev) => (prev + 1) % sentences.length);
    }, 4000);
    
    return () => {
      clearInterval(sentenceInterval);
    };
  }, [sentences.length]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollPercentage = (window.scrollY / document.documentElement.scrollHeight) * 100;
      setShowFloatingButton(scrollPercentage < 1);
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const scrollToNext = () => {
    const nextSection = document.getElementById('features');
    if (nextSection) {
      nextSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section
      ref={sectionRef}
      id="home"
      className="relative min-h-screen flex items-center justify-center pt-16 pb-24 md:pb-16 px-4 sm:px-6 lg:px-8 bg-white"
      aria-label="hero section"
    >
      {/* SVG Clip Path for Hero */}
      <svg width="0" height="0" className="absolute hidden xl:block">
        <defs>
          <clipPath id="heroClip" clipPathUnits="objectBoundingBox">
            <path
              d="M 0.987,1 L 0.565,1 C 0.558,1 0.552,0.997 0.547,0.991 C 0.542,0.985 0.535,0.97 0.525,0.95 C 0.52,0.94 0.515,0.93 0.51,0.925 C 0.505,0.92 0.495,0.92 0.49,0.925 C 0.485,0.93 0.48,0.94 0.475,0.95 C 0.465,0.97 0.458,0.985 0.453,0.991 C 0.448,0.997 0.442,1 0.435,1 L 0.013,1 C 0.006,1 0,0.989 0,0.975 L 0,0.025 C 0,0.011 0.006,0 0.013,0 L 0.987,0 C 0.994,0 1,0.011 1,0.025 L 1,0.975 C 1,0.989 0.994,1 0.987,1 Z"
            />
          </clipPath>
        </defs>
      </svg>

      {}
      <div 
        className="absolute top-20 left-4 right-4 bottom-6 md:top-22 md:bottom-8 xl:top-20 xl:left-16 xl:right-16 xl:bottom-12 2xl:left-20 2xl:right-20"
        style={{ 
          filter: 'drop-shadow(0px 10px 25px rgba(0, 0, 0, 0.35))',
        }}
      >
        {}
        <div 
          className="w-full h-full bg-secondary rounded-2xl xl:rounded-none"
          style={{ 
            clipPath: 'var(--hero-clip-path, none)',
          }}
        >
        {}
        <div className="absolute inset-0 rounded-2xl xl:rounded-none overflow-hidden opacity-20 sm:opacity-30">
          <div 
            className="absolute inset-0 w-full h-full animate-slideshow-1"
            style={{
              backgroundImage: `url('/images/hero/hero-1.jpg')`,
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
        
        {}
        <div 
          className="absolute inset-0 opacity-20 rounded-2xl xl:rounded-none overflow-hidden z-[1]"
          style={{
            backgroundImage: 'url(/patterns/pattern_hero.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />

        {}
        <div className="relative z-10 h-full flex flex-col items-center justify-center py-4 md:py-6 px-4 md:px-6">
          {}
          <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 sm:space-y-3 md:space-y-4 max-w-4xl mx-auto w-full">
            {}
            <motion.h1 
              className="text-5xl leading-[1.1] sm:text-5xl md:text-6xl lg:text-6xl xl:text-7xl font-bold text-primary sm:leading-[1.15] font-bristone"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <span className="block sm:inline">مُفتاحك</span>
              <span className="block sm:inline"> للاستثمار العقاري</span>
            </motion.h1>

            {}
            <motion.div 
              className="text-xl sm:text-xl md:text-2xl lg:text-2xl xl:text-3xl text-accent font-medium leading-relaxed px-2 min-h-[5rem] sm:min-h-[3rem] md:min-h-[3.5rem] flex items-center justify-center mt-2 sm:mt-0"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
            >
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSentenceIndex}
                  className="flex flex-wrap gap-x-2 gap-y-1 justify-center items-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.4 }}
                >
                  {sentences[currentSentenceIndex].split(' ').map((word, index) => (
                    <motion.span
                      key={`${currentSentenceIndex}-${index}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{
                        duration: 0.3,
                        delay: index * 0.05,
                      }}
                    >
                      {word}
                    </motion.span>
                  ))}
                </motion.div>
              </AnimatePresence>
            </motion.div>

            {}
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

            {/* Stats Cards - Hidden on mobile, shown on sm+ */}
            <motion.div 
              className="hidden sm:grid grid-cols-3 gap-3 sm:gap-5 pt-4 sm:pt-6 max-w-3xl w-full"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.4, delay: 1.1 }}
            >
              {/* Nights Card */}
              <motion.div 
                className="group relative overflow-hidden rounded-xl will-change-transform"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.5, 
                  delay: 1.2,
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
                whileHover={{ scale: 1.04 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-primary/5 border-2 border-primary/20 rounded-xl transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10"
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                  transition={{ duration: 0.5, delay: 1.2 }}
                />
                
                <div className="relative text-center space-y-1 sm:space-y-2 px-3 sm:px-6 pt-2 sm:pt-4 pb-3 sm:pb-5">
                  <div className="flex justify-center mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Moon className="w-5 h-5 sm:w-8 sm:h-8 text-primary transition-colors duration-300" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <div className="text-xl sm:text-3xl font-bold text-primary font-bristone">
                      {nightsCount}
                    </div>
                    <div className="text-sm sm:text-lg text-accent font-semibold whitespace-nowrap">
                      ليلة
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Clients Card */}
              <motion.div 
                className="group relative overflow-hidden rounded-xl will-change-transform"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.4,
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
                whileHover={{ scale: 1.04 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-primary/5 border-2 border-primary/20 rounded-xl transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10"
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                  transition={{ duration: 0.6, delay: 1.4 }}
                />
                
                <div className="relative text-center space-y-1 sm:space-y-2 px-3 sm:px-6 pt-2 sm:pt-4 pb-3 sm:pb-5">
                  <div className="flex justify-center mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Users className="w-5 h-5 sm:w-8 sm:h-8 text-primary transition-colors duration-300" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <div className="text-xl sm:text-3xl font-bold text-primary font-bristone">
                      {clientsCount}
                    </div>
                    <div className="text-sm sm:text-lg text-accent font-semibold whitespace-nowrap">
                      عميل راضي
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Years Card */}
              <motion.div 
                className="group relative overflow-hidden rounded-xl will-change-transform"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ 
                  duration: 0.6, 
                  delay: 1.6,
                  scale: { duration: 0.2, ease: "easeOut" }
                }}
                whileHover={{ scale: 1.04 }}
              >
                <motion.div 
                  className="absolute inset-0 bg-primary/5 border-2 border-primary/20 rounded-xl transition-all duration-300 group-hover:border-primary/40 group-hover:shadow-xl group-hover:bg-primary/10"
                  initial={{ opacity: 0, backdropFilter: "blur(0px)" }}
                  animate={{ opacity: 1, backdropFilter: "blur(12px)" }}
                  transition={{ duration: 0.6, delay: 1.6 }}
                />
                
                <div className="relative text-center space-y-1 sm:space-y-2 px-3 sm:px-6 pt-2 sm:pt-4 pb-3 sm:pb-5">
                  <div className="flex justify-center mb-1 sm:mb-2">
                    <div className="p-1.5 sm:p-2.5 bg-primary/10 border border-primary/20 rounded-lg transition-all duration-300 group-hover:bg-primary/20 group-hover:border-primary/30">
                      <Award className="w-5 h-5 sm:w-8 sm:h-8 text-primary transition-colors duration-300" />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-center gap-1 sm:gap-2">
                    <div className="text-xl sm:text-3xl font-bold text-primary font-bristone">
                      {yearsCount}
                    </div>
                    <div className="text-sm sm:text-lg text-accent font-semibold whitespace-nowrap">
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

      {}
      <motion.button
        className="hidden xl:block absolute cursor-pointer z-1 active:scale-90 transition-transform"
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

      {}
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


export const HeroSection = React.memo(HeroSectionComponent);

export default HeroSection;
