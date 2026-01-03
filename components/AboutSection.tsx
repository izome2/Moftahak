'use client';

import React, { useRef, useEffect, useState } from 'react';
import Image from 'next/image';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Container from './ui/Container';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCounter } from '@/hooks/useCounter';
import { useGyroscope } from '@/hooks/useGyroscope';
import { 
  fadeInUp, 
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem
} from '@/lib/animations/variants';
import AnimatedStroke from './ui/AnimatedStroke';

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement | null>(null);
  const imageRef = useRef<HTMLDivElement | null>(null);
  
  const isContentInView = useScrollAnimation(contentRef as React.RefObject<Element>, { threshold: 0.2, once: false });
  const isImageInView = useScrollAnimation(imageRef as React.RefObject<Element>, { threshold: 0.3, once: false });

  const expertise = [
    'خبرة عملية حقيقية في تشغيل وتطوير الشقق الفندقية والإيجارات قصيرة الأجل.',
    'أنظمة واضحة وحلول قابلة للتنفيذ تحقق نتائج فعلية.',
    'رؤية مبنية على البيانات والشفافية لتعظيم العائد وقابلية التوسع.',
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white" id="about">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
          {}
          <motion.div 
            ref={contentRef}
            className="order-1 lg:order-1"
            initial="hidden"
            animate={isContentInView ? "visible" : "hidden"}
            variants={slideInLeft}
          >
            {}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isContentInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.3, duration: 1 }}
            >
              <Image
                src="/logos/logo-dark.png"
                alt="مفتاحك"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </motion.div>

            {}
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight"
              variants={fadeInUp}
            >
              <AnimatedStroke delay={0.6}>
                عبد الله الخضر
              </AnimatedStroke>
            </motion.h2>

            {}
            <motion.div 
              className="space-y-5 text-secondary/70 leading-relaxed mb-8 text-lg"
              variants={fadeInUp}
            >
              <p>
                رائد أعمال ومتخصص في الإيجارات قصيرة الأجل والشقق الفندقية في القاهرة، بدأ رحلته بوحدة واحدة ونجح في بناء نموذج تشغيل احترافي يعتمد على الأنظمة الواضحة والقرارات المبنية على البيانات وتقديم تجربة نزيل عالية الجودة، حيث يعمل على مساعدة ملاك العقارات في تحويل وحداتهم إلى وحدات فندقية مربحة وقابلة للتوسع، إلى جانب مشاركته خبراته العملية من خلال محتوى تعليمي متخصص حول Airbnb والإيجارات قصيرة الأجل.
              </p>
            </motion.div>

            {}
            <motion.div 
              className="mb-8"
              variants={staggerContainer}
              initial="hidden"
              animate={isContentInView ? "visible" : "hidden"}
            >
              <motion.h3 
                className="text-2xl font-bold text-secondary mb-5"
                variants={staggerItem}
              >
                لماذا تختار عبد الله؟
              </motion.h3>
              <ul className="space-y-5">
                {expertise.map((item, index) => (
                  <motion.li 
                    key={index} 
                    className="flex items-start gap-4"
                    variants={staggerItem}
                    whileHover={{ x: 5 }}
                    transition={{ duration: 0.2 }}
                  >
                    <motion.div 
                      className="shrink-0 mt-1"
                      whileHover={{ rotate: 360 }}
                      transition={{ duration: 0.6 }}
                    >
                      <Image
                        src="/logos/logo-dark-icon.png"
                        alt="مفتاحك"
                        width={20}
                        height={20}
                        className="w-5 h-5"
                      />
                    </motion.div>
                    <span className="text-secondary/70 font-medium leading-relaxed text-lg">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </motion.div>

            {}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 1.5, duration: 0.9 }}
            >
              <Button
                variant="primary"
                size="md"
                rightIcon={<ArrowLeft size={20} />}
              >
              المزيد عن عبد الله
            </Button>
          </motion.div>
          </motion.div>

          {}
          <motion.div 
            ref={imageRef}
            className="order-2 lg:order-2 lg:pr-10"
            initial="hidden"
            animate={isImageInView ? "visible" : "hidden"}
            variants={slideInRight}
          >
            <ImageWith3D isImageInView={isImageInView} />
          </motion.div>
        </div>
      </Container>
    </section>
  );
};


const ImageWith3D: React.FC<{ isImageInView: boolean }> = ({ isImageInView }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  
  
  const xBackground = useTransform(rotateYSpring, [-3, 3], [-6, 6]);
  const yBackground = useTransform(rotateXSpring, [-3, 3], [6, -6]);
  
  
  const xOverlay1 = useTransform(rotateYSpring, [-3, 3], [-10 + 2, -10 - 2]);
  const yOverlay1 = useTransform(rotateXSpring, [-3, 3], [-2, 2]);
  
  const xOverlay2 = useTransform(rotateYSpring, [-3, 3], [2.5, -2.5]);
  const yOverlay2 = useTransform(rotateXSpring, [-3, 3], [-2.5, 2.5]);

  
  const gyro = useGyroscope(0.8);

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  useEffect(() => {
    if (isMobile && gyro.isSupported) {
      rotateX.set(gyro.rotateX);
      rotateY.set(gyro.rotateY);
    }
  }, [gyro.rotateX, gyro.rotateY, isMobile, gyro.isSupported, rotateX, rotateY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current || isMobile) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotY = ((x - centerX) / centerX) * 3;
    const rotX = -((y - centerY) / centerY) * 3;
    
    rotateX.set(rotX);
    rotateY.set(rotY);
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);
    if (!isMobile) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  return (
    <div 
      ref={containerRef}
      className="relative max-w-lg mx-auto lg:mx-0"
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{
        perspective: '1200px'
      }}
    >
      <motion.div
        style={{
          rotateX: rotateXSpring,
          rotateY: rotateYSpring,
          transformStyle: 'preserve-3d'
        }}
        className="relative"
      >
        {}
        <motion.div 
          className="absolute inset-0 z-0"
          initial={{ opacity: 0, y: 20 }}
          animate={isImageInView ? { 
            opacity: 1, 
            y: [0, -8, 0],
          } : { opacity: 0, y: 20 }}
          transition={{ 
            opacity: { delay: 1.2, duration: 2 },
            y: {
              delay: 1.8,
              duration: 6,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{ 
            x: xBackground,
            scale: 0.95
          }}
        >
          <Image
            src="/images/hero/background-0.png"
            alt=""
            width={800}
            height={800}
            className="w-full h-full object-contain"
          />
        </motion.div>

        {}
        <motion.div 
          className="relative overflow-hidden rounded-3xl z-10"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={isImageInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
          transition={{ delay: 0.5, duration: 1.2 }}
          whileHover={{ scale: 1.02 }}
        >
          <Image
            src="/images/hero/abdullah-profile.jpg"
            alt="عبد الله الخضر"
            width={800}
            height={800}
            className="w-full h-auto object-contain"
          />
        </motion.div>

        {}
        <motion.div 
          className="absolute inset-0 z-20 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={isImageInView ? { 
            opacity: 1, 
            y: [0, 10, 0],
          } : { opacity: 0, y: 20 }}
          transition={{ 
            opacity: { delay: 0.8, duration: 2 },
            y: {
              delay: 2.5,
              duration: 7,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{ 
            x: xOverlay1,
            scale: 1.05
          }}
        >
          <Image
            src="/images/hero/overlay-1.png"
            alt=""
            width={800}
            height={800}
            className="w-full h-full object-contain"
          />
        </motion.div>

        {}
        <motion.div 
          className="absolute inset-0 z-30 pointer-events-none"
          initial={{ opacity: 0, y: 20 }}
          animate={isImageInView ? { 
            opacity: 1, 
            y: [0, -12, 0],
          } : { opacity: 0, y: 20 }}
          transition={{ 
            opacity: { delay: 1.5, duration: 2 },
            y: {
              delay: 3.5,
              duration: 6.5,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
          style={{ 
            x: xOverlay2,
            scale: 1.08
          }}
        >
          <Image
            src="/images/hero/overlay-2.png"
            alt=""
            width={800}
            height={800}
            className="w-full h-full object-contain"
          />
        </motion.div>
      </motion.div>

      {}
      <motion.div 
        className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={isImageInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: 2.2, duration: 1.5 }}
      />
      <motion.div 
        className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -z-10"
        initial={{ scale: 0, opacity: 0 }}
        animate={isImageInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
        transition={{ delay: 2.4, duration: 1.5 }}
      />
    </div>
  );
};

export default React.memo(AboutSection);
