'use client';

import React, { useRef, useEffect, useMemo } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { motion, useMotionValue, useSpring, AnimatePresence } from 'framer-motion';
import Container from './ui/Container';
import Badge from './ui/Badge';
import Button from './ui/Button';
import UserIcon from './ui/UserIcon';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useGyroscope } from '@/hooks/useGyroscope';
import { 
  fadeInUp, 
  slideInLeft,
  slideInRight,
  staggerContainer
} from '@/lib/animations/variants';
import AnimatedStroke from './ui/AnimatedStroke';

interface Service {
  id: number;
  image: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  price: string;
  buttonText: string;
  studentsCount?: string;
  userIconVariants?: Array<'gold' | 'green' | 'beige' | 'teal'>;
  href: string;
}

const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null!);
  const gridRef = useRef<HTMLDivElement>(null!);
  const [showGyroButton, setShowGyroButton] = React.useState(false);
  const [gyroRequested, setGyroRequested] = React.useState(false);
  
  const isHeaderInView = useScrollAnimation(headerRef, { threshold: 0.3, once: true });
  const isGridInView = useScrollAnimation(gridRef, { threshold: 0.1, once: true });
  
  
  const gyro = useGyroscope(0.8);

  
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const needsPermission = 
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    
    
    const gyroPermissionGranted = localStorage.getItem('gyroPermissionGranted') === 'true';
    
    if (isIOS && needsPermission && !gyroRequested && gyro.needsPermission && !gyroPermissionGranted) {
      setShowGyroButton(true);
      
      
      const timer = setTimeout(() => {
        setShowGyroButton(false);
      }, 4000);
      
      return () => clearTimeout(timer);
    }
  }, [gyroRequested, gyro.needsPermission]);

  const handleGyroRequest = async () => {
    try {
      if (gyro.requestPermission) {
        await gyro.requestPermission();
        setGyroRequested(true);
        setShowGyroButton(false);
        
        localStorage.setItem('gyroPermissionGranted', 'true');
        
        // تحديث الصفحة بعد الموافقة
        window.location.reload();
      }
    } catch (error) {
      console.error('Error requesting gyroscope permission:', error);
      setShowGyroButton(false);
    }
  };

  const services: Service[] = useMemo(() => [
    {
      id: 1,
      image: '/images/services/no_nzol_mydany.jpg',
      badge: 'الأكثر طلباً',
      badgeVariant: 'info',
      title: 'دراسة جدوى بدون نزول ميداني',
      description: 'تحليل شامل للسوق والمنطقة وتوقعات الإيرادات بدون الحاجة لزيارة العقار',
      price: '٢,٥٠٠ جنيه',
      buttonText: 'اطلب الآن',
      studentsCount: '2K+',
      userIconVariants: ['gold', 'green', 'beige', 'teal'],
      href: '/feasibility-request?type=without-field',
    },
    {
      id: 2,
      image: '/images/services/nzol_mydany.jpg',
      badge: 'شامل',
      badgeVariant: 'success',
      title: 'دراسة جدوى مع نزول ميداني',
      description: 'دراسة شاملة تتضمن زيارة ميدانية للعقار وخطة تجهيز كاملة مع التكاليف',
      price: '٥,٠٠٠ جنيه',
      buttonText: 'اطلب الآن',
      studentsCount: '1.5K+',
      userIconVariants: ['teal', 'gold', 'green', 'beige'],
      href: '/feasibility-request?type=with-field',
    },
  ], []);

  return (
    <section ref={sectionRef} className="py-20 bg-white" id="services">
      <Container>
        {}
        <AnimatePresence>
          {showGyroButton && (
            <motion.div
              initial={{ opacity: 0, y: 100 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 100 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 w-[90%] max-w-md"
            >
            <div className="bg-accent/95 backdrop-blur-md rounded-2xl shadow-2xl border border-primary/20 p-5">
              <div className="flex items-start gap-4">
                {}
                <motion.div
                  animate={{ 
                    rotate: [-8, 8, -8, 8, -8, 8, 0],
                  }}
                  transition={{ 
                    duration: 2,
                    repeat: Infinity,
                    repeatDelay: 1,
                    ease: "easeInOut"
                  }}
                  className="shrink-0 relative"
                >
                  {}
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <rect x="6" y="2" width="12" height="20" rx="2" stroke="#10302b" strokeWidth="1.5" fill="#edbf8c"/>
                    <rect x="9" y="18" width="6" height="1.5" rx="0.75" fill="#10302b"/>
                    <line x1="6" y1="5" x2="18" y2="5" stroke="#10302b" strokeWidth="1"/>
                  </svg>
                </motion.div>

                {}
                <div className="flex-1">
                  <p className="text-secondary text-sm leading-relaxed mb-4">
                    هذه الصفحة تمتلك أنيميشن وتأثيرات 3D عند تحريك الهاتف. هل تريد السماح بتفعيل الميزة؟
                  </p>
                  
                  {}
                  <div className="flex gap-3">
                    <motion.button
                      onClick={handleGyroRequest}
                      className="flex-1 bg-secondary text-primary px-4 py-2.5 rounded-xl font-bold text-sm shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      نعم
                    </motion.button>
                    <motion.button
                      onClick={() => setShowGyroButton(false)}
                      className="flex-1 bg-white/50 text-secondary px-4 py-2.5 rounded-xl font-semibold text-sm border border-secondary/20"
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                    >
                      لا
                    </motion.button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
          )}
        </AnimatePresence>

        {}
        <motion.div 
          ref={headerRef}
          className="text-center mb-16"
          initial="hidden"
          animate={isHeaderInView ? "visible" : "hidden"}
          variants={fadeInUp}
        >
          <motion.h2 
            className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone"
            variants={fadeInUp}
          >
            <AnimatedStroke delay={0.3}>
              الخدمات المتاحة
            </AnimatedStroke>
          </motion.h2>
          <motion.p 
            className="text-lg text-secondary/70 max-w-2xl mx-auto"
            variants={fadeInUp}
          >
            برامج شاملة لتطوير مشروعك في الإيجار القصير
          </motion.p>
        </motion.div>

        {/* Services Grid */}
        <motion.div 
          ref={gridRef}
          className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto"
          variants={staggerContainer}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
        >
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} gyroData={gyro} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
};


const ServiceCard: React.FC<{ service: Service; index: number; gyroData: { rotateX: number; rotateY: number; isSupported: boolean; needsPermission: boolean; requestPermission: () => Promise<void> } }> = ({ service, index, gyroData }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  
  useEffect(() => {
    if (isMobile && gyroData.isSupported) {
      rotateX.set(gyroData.rotateX);
      rotateY.set(gyroData.rotateY);
    }
  }, [gyroData.rotateX, gyroData.rotateY, isMobile, gyroData.isSupported, rotateX, rotateY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotY = ((x - centerX) / centerX) * 3;
    const rotX = -((y - centerY) / centerY) * 3;
    
    rotateX.set(rotX);
    rotateY.set(rotY);
  };

  
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!cardRef.current || !isMobile) return;
    
    const touch = e.touches[0];
    const rect = cardRef.current.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotY = ((x - centerX) / centerX) * 8;
    const rotX = -((y - centerY) / centerY) * 8;
    
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

  const handleTouchEnd = () => {
    if (isMobile && !gyroData.isSupported) {
      rotateX.set(0);
      rotateY.set(0);
    }
  };

  const cardVariant = {
    hidden: { 
      opacity: 0,
      y: 40
    },
    visible: { 
      opacity: 1,
      y: 0,
      transition: { 
        duration: 0.7,
        delay: index * 0.15,
        ease: [0.4, 0, 0.2, 1] as [number, number, number, number]
      }
    }
  };

  return (
    <motion.div
      ref={cardRef}
      variants={cardVariant}
      whileHover={{ y: -10 }}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      style={{
        rotateX: rotateXSpring,
        rotateY: rotateYSpring,
        transformStyle: 'preserve-3d',
        perspective: '1000px'
      }}
      transition={{ 
        y: { duration: 0.3, ease: [0.4, 0, 0.2, 1] }
      }}
      className="group bg-[#ead3b9]/30 rounded-2xl overflow-visible shadow-lg hover:shadow-2xl transition-shadow duration-300 relative border border-[#ead3b9]"
    >
      {}
      <div className="relative h-72 overflow-hidden rounded-xl m-3" style={{ transform: 'translateZ(20px)' }}>
        <motion.div
          className="w-full h-full"
          whileHover={{ scale: 1.1 }}
          transition={{ duration: 0.5 }}
        >
          <Image
            src={service.image}
            alt={service.title}
            fill
            className="object-cover rounded-xl"
          />
        </motion.div>
        
        {/* Badge */}
        {service.badge && (
          <motion.div 
            className="absolute top-4 right-4 z-10"
            style={{ transform: 'translateZ(40px)' }}
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: index * 0.1 + 0.3, type: 'spring' }}
          >
            <Badge variant={service.badgeVariant} size="md">
              {service.badge}
            </Badge>
          </motion.div>
        )}
      </div>

      {/* Student Count Badge */}
      {service.userIconVariants && service.studentsCount && (
        <div className="absolute right-6 z-50 pointer-events-none" style={{ top: 'calc(18rem - 1rem)', transform: 'translateZ(40px)' }}>
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="pointer-events-auto"
          >
          <div className="flex items-center gap-2 bg-[#ead3b9]/95 backdrop-blur-sm rounded-full px-5 py-2 shadow-xl border border-[#edbf8c]">
            <div className="flex items-center -space-x-2">
              {service.userIconVariants.slice(0, 4).map((variant, i) => (
                <motion.div
                  key={i}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 + i * 0.05 }}
                >
                  <UserIcon variant={variant} size="md" className="border-white" />
                </motion.div>
              ))}
            </div>
            <span className="text-sm font-bold text-secondary mr-1">
              {service.studentsCount} عميل
            </span>
          </div>
          </motion.div>
        </div>
      )}

      {}
      <div className="p-6 pt-10" style={{ transform: 'translateZ(30px)' }}>
        {}
        <motion.h3 
          className="text-xl font-bold text-secondary mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.6 }}
        >
          {service.title}
        </motion.h3>

        {}
        <motion.p 
          className="text-secondary/70 leading-relaxed mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.7 }}
        >
          {service.description}
        </motion.p>

        {}
        <motion.div 
          className="flex items-center justify-between gap-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.1 + 0.8 }}
          style={{ transform: 'translateZ(40px)' }}
        >
          <span className="text-2xl font-bold text-secondary font-bristone">
            {service.price}
          </span>
          <Link href={service.href}>
            <motion.span
              className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-linear-to-tl from-[#e5b483] to-[#edc49f] rounded-lg shadow-[0_0_15px_rgba(180,130,80,0.25)] relative overflow-hidden cursor-pointer"
              whileHover={{ 
                scale: 1.05,
                boxShadow: '0 0 20px rgba(180,130,80,0.35)'
              }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="relative z-10">{service.buttonText}</span>
              <motion.span
                animate={{ x: [0, 5, 0] }}
                transition={{ duration: 1.5, repeat: Infinity }}
              >
                <ArrowLeft size={16} className="relative z-10" />
              </motion.span>
            </motion.span>
          </Link>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default React.memo(ServicesSection);
