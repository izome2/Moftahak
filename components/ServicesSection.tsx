'use client';

import React, { useRef, useEffect } from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import { motion, useMotionValue, useSpring } from 'framer-motion';
import Container from './ui/Container';
import Badge from './ui/Badge';
import Button from './ui/Button';
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
  studentImages?: string[];
}

const ServicesSection: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLDivElement>(null!);
  const gridRef = useRef<HTMLDivElement>(null!);
  const [showGyroButton, setShowGyroButton] = React.useState(false);
  const [gyroRequested, setGyroRequested] = React.useState(false);
  
  const isHeaderInView = useScrollAnimation(headerRef, { threshold: 0.3, once: true });
  const isGridInView = useScrollAnimation(gridRef, { threshold: 0.1, once: true });

  // التحقق من الحاجة لطلب إذن الجايروسكوب على iOS
  useEffect(() => {
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const needsPermission = 
      typeof DeviceOrientationEvent !== 'undefined' &&
      typeof (DeviceOrientationEvent as any).requestPermission === 'function';
    
    if (isIOS && needsPermission && !gyroRequested) {
      setShowGyroButton(true);
    }
  }, [gyroRequested]);

  const handleGyroRequest = async () => {
    try {
      if (typeof (DeviceOrientationEvent as any).requestPermission === 'function') {
        await (DeviceOrientationEvent as any).requestPermission();
        setGyroRequested(true);
        setShowGyroButton(false);
      }
    } catch (error) {
      console.error('Error requesting gyroscope permission:', error);
    }
  };

  const services: Service[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      badge: 'الأكثر طلباً',
      badgeVariant: 'info',
      title: 'استشارة إعداد وحدة جديدة',
      description: 'خطة كاملة لتحويل شقتك إلى وحدة إيجار قصير احترافية',
      price: '2,500 جنيه',
      buttonText: 'احجز الآن',
      studentsCount: '2K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3',
        'https://i.pravatar.cc/150?img=4',
      ],
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      badge: 'جديد',
      badgeVariant: 'success',
      title: 'برنامج إدارة العمليات الكاملة',
      description: 'نظام شامل لإدارة حجوزاتك وفريقك ومالياتك بشفافية',
      price: '5,000 جنيه',
      buttonText: 'سجل الآن',
      studentsCount: '1.5K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=5',
        'https://i.pravatar.cc/150?img=6',
        'https://i.pravatar.cc/150?img=7',
        'https://i.pravatar.cc/150?img=8',
      ],
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
      badge: 'Online',
      badgeVariant: 'warning',
      title: 'دورة استضافة Airbnb للمبتدئين',
      description: 'تعلم أساسيات بدء مشروع إيجار قصير ناجح من الصفر',
      price: '999 جنيه',
      buttonText: 'ابدأ التعلم',
      studentsCount: '3K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=9',
        'https://i.pravatar.cc/150?img=10',
        'https://i.pravatar.cc/150?img=11',
        'https://i.pravatar.cc/150?img=12',
      ],
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      badge: 'شخصياً',
      badgeVariant: 'primary',
      title: 'تدريب الفرق الميدانية',
      description: 'تدريب عملي على معايير الخدمة الفندقية والتعامل مع الضيوف',
      price: '4,000 جنيه',
      buttonText: 'اطلب تدريب',
      studentsCount: '800+',
      studentImages: [
        'https://i.pravatar.cc/150?img=13',
        'https://i.pravatar.cc/150?img=14',
        'https://i.pravatar.cc/150?img=15',
        'https://i.pravatar.cc/150?img=16',
      ],
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      title: 'استشارة التسعير والأداء',
      description: 'تحليل شامل لأداء وحدتك واستراتيجية تسعير ديناميكية',
      price: '1,500 جنيه',
      buttonText: 'احجز الآن',
      studentsCount: '1.2K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=17',
        'https://i.pravatar.cc/150?img=18',
        'https://i.pravatar.cc/150?img=19',
        'https://i.pravatar.cc/150?img=20',
      ],
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      badge: 'VIP',
      badgeVariant: 'primary',
      title: 'حزمة الإدارة الكاملة',
      description: 'ندير عقارك بالكامل من التسويق حتى استقبال الضيوف',
      price: 'من 15% من الإيرادات',
      buttonText: 'استفسر الآن',
      studentsCount: '500+',
      studentImages: [
        'https://i.pravatar.cc/150?img=21',
        'https://i.pravatar.cc/150?img=22',
        'https://i.pravatar.cc/150?img=23',
        'https://i.pravatar.cc/150?img=24',
      ],
    },
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white" id="services">
      <Container>
        {/* زر تفعيل الجايروسكوب لأجهزة iOS */}
        {showGyroButton && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-24 left-1/2 -translate-x-1/2 z-50"
          >
            <motion.button
              onClick={handleGyroRequest}
              className="bg-secondary text-primary px-6 py-3 rounded-lg shadow-2xl border-2 border-primary font-bold text-sm flex items-center gap-3"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <motion.span
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
              >
                📱
              </motion.span>
              <span>تفعيل التأثيرات ثلاثية الأبعاد</span>
            </motion.button>
          </motion.div>
        )}

        {/* Section Header */}
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
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={isGridInView ? "visible" : "hidden"}
        >
          {services.map((service, index) => (
            <ServiceCard key={service.id} service={service} index={index} />
          ))}
        </motion.div>
      </Container>
    </section>
  );
};

// Service Card Component with 3D Tilt Effect
const ServiceCard: React.FC<{ service: Service; index: number }> = ({ service, index }) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isMobile, setIsMobile] = React.useState(false);
  const [isHovering, setIsHovering] = React.useState(false);
  
  const rotateX = useMotionValue(0);
  const rotateY = useMotionValue(0);
  
  const springConfig = { damping: 20, stiffness: 200, mass: 0.5 };
  const rotateXSpring = useSpring(rotateX, springConfig);
  const rotateYSpring = useSpring(rotateY, springConfig);

  // Gyroscope for mobile devices
  const gyro = useGyroscope(0.8);

  // Detect if mobile
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Apply gyroscope rotation on mobile
  useEffect(() => {
    if (isMobile && gyro.isSupported) {
      rotateX.set(gyro.rotateX);
      rotateY.set(gyro.rotateY);
    }
  }, [gyro.rotateX, gyro.rotateY, isMobile, gyro.isSupported, rotateX, rotateY]);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current || isMobile) return;
    
    const rect = cardRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;
    
    const rotY = ((x - centerX) / centerX) * 12;
    const rotX = -((y - centerY) / centerY) * 12;
    
    rotateX.set(rotX);
    rotateY.set(rotY);
  };

  // Touch move handler for mobile devices
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
    if (isMobile && !gyro.isSupported) {
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
      {/* Image Container */}
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

      {/* Students Badge - Separate Container with Higher Z-Index */}
      {service.studentImages && service.studentsCount && (
        <div className="absolute right-6 z-50 pointer-events-none" style={{ top: 'calc(18rem - 1rem)', transform: 'translateZ(40px)' }}>
          <motion.div 
            initial={{ x: 50, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: index * 0.1 + 0.4 }}
            className="pointer-events-auto"
          >
          <div className="flex items-center gap-2 bg-[#ead3b9]/95 backdrop-blur-sm rounded-full px-5 py-2 shadow-xl border border-[#edbf8c]">
            <div className="flex items-center -space-x-2">
              {service.studentImages.slice(0, 4).map((img, i) => (
                <motion.div
                  key={i}
                  className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.5 + i * 0.05 }}
                >
                  <Image
                    src={img}
                    alt={`Student ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </motion.div>
              ))}
            </div>
            <span className="text-sm font-bold text-secondary mr-1">
              {service.studentsCount} طالب
            </span>
          </div>
          </motion.div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 pt-10" style={{ transform: 'translateZ(30px)' }}>
        {/* Title */}
        <motion.h3 
          className="text-xl font-bold text-secondary mb-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.6 }}
        >
          {service.title}
        </motion.h3>

        {/* Description */}
        <motion.p 
          className="text-secondary/70 leading-relaxed mb-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 + 0.7 }}
        >
          {service.description}
        </motion.p>

        {/* Price & Button */}
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
          <motion.button
            className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary bg-linear-to-tl from-[#e5b483] to-[#edc49f] rounded-lg shadow-[0_0_15px_rgba(180,130,80,0.25)] relative overflow-hidden"
            whileHover={{ 
              scale: 1.05,
              boxShadow: '0 0 20px rgba(180,130,80,0.35)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            <span className="relative z-10">{service.buttonText}</span>
            <motion.div
              animate={{ x: [0, 5, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            >
              <ArrowLeft size={16} className="relative z-10" />
            </motion.div>
          </motion.button>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ServicesSection;
