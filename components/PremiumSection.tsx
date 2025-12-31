'use client';

import React, { useRef, useState } from 'react';
import { MessageCircle, Building2, CheckCircle2, ArrowLeft, Sparkles, GraduationCap } from 'lucide-react';
import { motion, useInView, useMotionValue, useSpring, useTransform } from 'framer-motion';
import Container from './ui/Container';
import Badge from './ui/Badge';

interface Package {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  bgColor: string;
}

// Component for individual card with independent magnetic effect
const MagneticCard: React.FC<{ 
  pkg: Package; 
  index: number; 
  isInView: boolean;
  hoveredCard: number | null;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}> = ({ pkg, index, isInView, hoveredCard, onMouseEnter, onMouseLeave }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  // Spring physics for smooth magnetic effect
  const springConfig = { stiffness: 150, damping: 20, mass: 0.5 };
  const smoothMouseX = useSpring(mouseX, springConfig);
  const smoothMouseY = useSpring(mouseY, springConfig);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    
    mouseX.set(x * 0.1);
    mouseY.set(y * 0.1);
  };

  const handleMouseLeaveCard = () => {
    mouseX.set(0);
    mouseY.set(0);
    onMouseLeave();
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  };

  const iconVariants = {
    hidden: { 
      scale: 0,
      rotate: -180,
    },
    visible: {
      scale: 1,
      rotate: 0,
      transition: {
        type: "spring" as const,
        stiffness: 200,
        damping: 15,
        delay: 0.3,
      },
    },
    hover: {
      scale: 1.1,
      rotate: 5,
      transition: {
        type: "spring" as const,
        stiffness: 400,
        damping: 10,
      },
    },
  };

  const isHovered = hoveredCard === pkg.id;

  return (
    <motion.div
      variants={cardVariants}
      whileHover={{ 
        y: -10,
        transition: { type: "spring", stiffness: 400, damping: 25 }
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={onMouseEnter}
      onMouseLeave={handleMouseLeaveCard}
      className={`
        relative rounded-2xl overflow-hidden shadow-lg
        ${pkg.bgColor}
        p-6 md:p-6
        border-2 border-[#ead3b9]
        lg:col-span-2
        cursor-pointer
      `}
      style={{
        x: smoothMouseX,
        y: smoothMouseY,
      }}
    >
      {/* Shine Effect on Hover */}
      <motion.div
        className="absolute inset-0 bg-linear-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: '-100%', opacity: 0 }}
        animate={isHovered ? { 
          x: '100%', 
          opacity: 1,
          transition: { duration: 0.6, ease: "easeInOut" }
        } : { x: '-100%', opacity: 0 }}
      />

      {/* Glow Effect on Hover */}
      <motion.div
        className="absolute inset-0 rounded-2xl"
        initial={{ opacity: 0 }}
        animate={isHovered ? {
          opacity: 1,
          boxShadow: '0 0 30px rgba(237, 191, 140, 0.3), inset 0 0 20px rgba(237, 191, 140, 0.1)',
        } : { opacity: 0 }}
        transition={{ duration: 0.3 }}
      />

      {/* Large Background Icon - Animated */}
      <motion.div 
        className="absolute -top-8 -left-8 z-0 opacity-10"
        animate={isHovered ? {
          scale: 1.1,
          rotate: 5,
          opacity: 0.15,
        } : {
          scale: 1,
          rotate: 0,
          opacity: 0.1,
        }}
        transition={{ duration: 0.4, ease: "easeOut" }}
      >
        <div className="text-primary relative">
          {pkg.id === 1 ? (
            <>
              <MessageCircle className="w-64 h-64" strokeWidth={1.5} />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-3">
                <div className="w-28 h-4 bg-current rounded-full" />
                <div className="w-32 h-4 bg-current rounded-full" />
              </div>
            </>
          ) : (
            React.cloneElement(pkg.icon as React.ReactElement<any>, { 
              className: "w-64 h-64",
              strokeWidth: 1.5
            })
          )}
        </div>
      </motion.div>

      {/* Content */}
      <div className="relative z-10">
        {/* Animated Icon */}
        <motion.div
          variants={iconVariants}
          whileHover="hover"
          className="mb-4 inline-block text-primary"
        >
          {pkg.id === 1 ? (
            <div className="relative w-12 h-12">
              <MessageCircle className="w-12 h-12" />
              <motion.div 
                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1.5"
                animate={isHovered ? {
                  scale: [1, 1.1, 1],
                } : { scale: 1 }}
                transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
              >
                <div className="w-6 h-1 bg-current rounded-full" />
                <div className="w-7 h-1 bg-current rounded-full" />
              </motion.div>
            </div>
          ) : (
            React.cloneElement(pkg.icon as React.ReactElement<any>, {
              className: "w-12 h-12"
            })
          )}
        </motion.div>

        {/* Title with stagger animation */}
        <motion.h3 
          className="text-xl md:text-2xl font-bold text-secondary mb-3 font-bristone"
          initial={{ opacity: 0, x: -20 }}
          animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
          transition={{ duration: 0.5, delay: 0.3 + index * 0.15 }}
        >
          {pkg.title}
        </motion.h3>

        {/* Description with fade-in */}
        <motion.p 
          className="text-sm text-secondary/80 leading-relaxed mb-4"
          initial={{ opacity: 0, y: 10 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
          transition={{ duration: 0.5, delay: 0.5 + index * 0.15 }}
        >
          {pkg.description}
        </motion.p>

        {/* Animated Button */}
        <motion.button 
          className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-secondary bg-linear-to-tl from-[#e5b483] to-[#edc49f] rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(180,130,80,0.25)] relative overflow-hidden group/btn"
          whileHover={{ 
            scale: 1.05,
            boxShadow: '0 0 25px rgba(180,130,80,0.4)',
          }}
          whileTap={{ scale: 0.95 }}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
          transition={{ duration: 0.4, delay: 0.7 + index * 0.15, type: "spring" }}
        >
          {/* Button shine effect on button hover - من اليمين لليسار */}
          <span className="absolute inset-0 bg-linear-to-l from-transparent via-white/40 to-transparent translate-x-full group-hover/btn:-translate-x-full transition-transform duration-700 ease-in-out pointer-events-none" />
          
          <span className="relative z-10">{pkg.buttonText}</span>
          <motion.div
            animate={isHovered ? {
              x: [-2, -5, -2],
            } : { x: 0 }}
            transition={{ duration: 0.6, repeat: isHovered ? Infinity : 0 }}
          >
            <ArrowLeft size={20} className="shrink-0 relative z-10" />
          </motion.div>
        </motion.button>
      </div>

      {/* Floating particles effect */}
      {isHovered && (
        <>
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-2 h-2 bg-primary/40 rounded-full"
              initial={{ 
                x: Math.random() * 100 + '%',
                y: '100%',
                opacity: 0,
              }}
              animate={{
                y: '-20%',
                opacity: [0, 1, 0],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: "easeOut",
              }}
            />
          ))}
        </>
      )}
    </motion.div>
  );
};

interface Package {
  id: number;
  icon: React.ReactNode;
  title: string;
  description: string;
  buttonText: string;
  bgColor: string;
}

const PremiumSection: React.FC = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: false, amount: 0.3 });
  
  // Mouse tracking for magnetic effect - separate for each card
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  const packages: Package[] = [
    {
      id: 1,
      icon: (
        <div className="relative w-10 h-10">
          <MessageCircle className="w-10 h-10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col gap-1">
            <div className="w-5 h-1 bg-current rounded-full" />
            <div className="w-6 h-1 bg-current rounded-full" />
          </div>
        </div>
      ),
      title: 'الاستشارات',
      description: 'جلسات فردية 1:1 (أونلاين وأوفلاين) مع عبد الله لمساعدتك في اتخاذ قرارات عقارية صحيحة وحل التحديات الاستثمارية والتنفيذية بثقة.',
      buttonText: 'للحجز والتفاصيل',
      bgColor: 'bg-[#ead3b9]/20',
    },
    {
      id: 2,
      icon: <Building2 className="w-10 h-10" />,
      title: 'لأصحاب الشركات',
      description: 'رؤية عقارية واضحة تبني قرارات استراتيجية مدروسة وتساعدك على تنمية أعمالك العقارية وتحقيق أفضل عائد استثماري.',
      buttonText: 'للحجز والتفاصيل',
      bgColor: 'bg-[#ead3b9]/20',
    },
  ];

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1,
      },
    },
  };

  const cardVariants = {
    hidden: { 
      opacity: 0, 
      y: 50,
      scale: 0.9,
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.6,
        ease: [0.22, 1, 0.36, 1] as any,
      },
    },
  };

  const handleMouseEnter = (cardId: number) => {
    setHoveredCard(cardId);
  };

  const handleMouseLeave = () => {
    setHoveredCard(null);
  };

  return (
    <section className="py-20 bg-white relative overflow-hidden" id="packages" ref={sectionRef}>
      {/* Animated Background Pattern */}
      <motion.div 
        className="absolute inset-0 opacity-5"
        initial={{ opacity: 0 }}
        animate={isInView ? { opacity: 0.05 } : { opacity: 0 }}
        transition={{ duration: 1 }}
      >
        <motion.div 
          className="absolute top-0 left-0 w-full h-full"
          animate={{
            backgroundPosition: ['0% 0%', '100% 100%'],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            repeatType: 'reverse',
            ease: 'linear',
          }}
          style={{
            backgroundImage: 'radial-gradient(circle, #edbf8c 1px, transparent 1px)',
            backgroundSize: '50px 50px',
          }}
        />
      </motion.div>

      <Container>
        {/* Section Header */}
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: -30 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: -30 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={isInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
              <motion.span
                className="inline-block"
                initial={{ opacity: 0, x: -20 }}
                animate={isInView ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                خدمات للمستثمرين ومالكي العقارات
              </motion.span>
            </h2>
          </motion.div>
          
          <motion.p 
            className="text-lg text-secondary/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
            transition={{ duration: 0.6, delay: 0.5 }}
          >
            حلول شاملة لتحويل عقارك إلى استثمار مربح
          </motion.p>

          {/* Decorative Line */}
          <motion.div
            className="mt-6 mx-auto w-24 h-1 bg-linear-to-r from-transparent via-primary to-transparent"
            initial={{ width: 0, opacity: 0 }}
            animate={isInView ? { width: 96, opacity: 1 } : { width: 0, opacity: 0 }}
            transition={{ duration: 0.8, delay: 0.7 }}
          />
        </motion.div>

        {/* Packages Grid */}
        <motion.div 
          className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto"
          variants={containerVariants}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {packages.map((pkg, index) => (
            <MagneticCard
              key={pkg.id}
              pkg={pkg}
              index={index}
              isInView={isInView}
              hoveredCard={hoveredCard}
              onMouseEnter={() => handleMouseEnter(pkg.id)}
              onMouseLeave={handleMouseLeave}
            />
          ))}

          {/* Coming Soon Card - Square */}
          <motion.div 
            variants={cardVariants}
            whileHover={{ 
              y: -5,
              transition: { type: "spring", stiffness: 400, damping: 25 }
            }}
            className="
              relative rounded-2xl overflow-hidden shadow-lg
              bg-linear-to-br from-secondary/5 to-primary/5
              p-5 md:p-6
              border-2 border-dashed border-secondary/30
              flex flex-col items-center justify-center
              lg:col-span-1
              min-h-full
              cursor-default
            "
          >
            {/* Pulse animation on background */}
            <motion.div
              className="absolute inset-0 bg-primary/5 rounded-2xl"
              animate={{
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Icon */}
            <motion.div 
              className="mb-4 p-3 bg-primary/10 rounded-2xl border-2 border-primary/20 relative z-10"
              initial={{ scale: 0, rotate: -180 }}
              animate={isInView ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -180 }}
              transition={{ 
                type: "spring", 
                stiffness: 200, 
                damping: 15,
                delay: 0.6,
              }}
              whileHover={{
                rotate: [0, -10, 10, -10, 0],
                transition: { duration: 0.5 }
              }}
            >
              <GraduationCap className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </motion.div>

            {/* Title */}
            <motion.h3 
              className="text-xl font-bold text-secondary mb-2 font-bristone text-center relative z-10"
              initial={{ opacity: 0, y: 10 }}
              animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              ورش العمل
            </motion.h3>

            {/* Coming Soon Badge */}
            <motion.div 
              className="inline-flex items-center gap-2 px-3 py-1.5 relative z-10"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isInView ? { 
                opacity: 1, 
                scale: 1,
              } : { opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.4, delay: 1 }}
            >
              <motion.span 
                className="text-xs font-semibold text-secondary"
                animate={{
                  opacity: [0.5, 1, 0.5],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                قريباً
              </motion.span>
            </motion.div>

            {/* Sparkle effect */}
            <motion.div
              className="absolute top-2 right-2 z-10"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Sparkles className="w-4 h-4 text-primary" />
            </motion.div>
          </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default PremiumSection;
