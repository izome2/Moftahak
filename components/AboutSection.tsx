'use client';

import React, { useRef } from 'react';
import Image from 'next/image';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import { motion } from 'framer-motion';
import Container from './ui/Container';
import Badge from './ui/Badge';
import Button from './ui/Button';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useCounter } from '@/hooks/useCounter';
import { 
  fadeInUp, 
  slideInLeft,
  slideInRight,
  staggerContainer,
  staggerItem
} from '@/lib/animations/variants';

const AboutSection: React.FC = () => {
  const sectionRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  
  const isContentInView = useScrollAnimation(contentRef, { threshold: 0.2 });
  const isImageInView = useScrollAnimation(imageRef, { threshold: 0.3 });

  const expertise = [
    'خبرة عملية حقيقية في تشغيل وتطوير الشقق الفندقية والإيجارات قصيرة الأجل.',
    'أنظمة واضحة وحلول قابلة للتنفيذ تحقق نتائج فعلية.',
    'رؤية مبنية على البيانات والشفافية لتعظيم العائد وقابلية التوسع.',
  ];

  return (
    <section ref={sectionRef} className="py-20 bg-white" id="about">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-12 items-center">
          {/* Left Side - Content */}
          <motion.div 
            ref={contentRef}
            className="order-1 lg:order-1"
            initial="hidden"
            animate={isContentInView ? "visible" : "hidden"}
            variants={slideInLeft}
          >
            {/* Company Logo */}
            <motion.div 
              className="mb-6"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={isContentInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
              transition={{ delay: 0.2 }}
            >
              <Image
                src="/logos/logo-dark.png"
                alt="مفتاحك"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </motion.div>

            {/* Title */}
            <motion.h2 
              className="text-4xl md:text-5xl font-bold text-secondary mb-6 leading-tight"
              variants={fadeInUp}
            >
              عبد الله الخضر
            </motion.h2>

            {/* Bio Text */}
            <motion.div 
              className="space-y-5 text-secondary/70 leading-relaxed mb-8 text-lg"
              variants={fadeInUp}
            >
              <p>
                رائد أعمال ومتخصص في الإيجارات قصيرة الأجل والشقق الفندقية في القاهرة، بدأ رحلته بوحدة واحدة ونجح في بناء نموذج تشغيل احترافي يعتمد على الأنظمة الواضحة والقرارات المبنية على البيانات وتقديم تجربة نزيل عالية الجودة، حيث يعمل على مساعدة ملاك العقارات في تحويل وحداتهم إلى وحدات فندقية مربحة وقابلة للتوسع، إلى جانب مشاركته خبراته العملية من خلال محتوى تعليمي متخصص حول Airbnb والإيجارات قصيرة الأجل.
              </p>
            </motion.div>

            {/* Expertise List */}
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

            {/* CTA Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={isContentInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
              transition={{ delay: 0.8 }}
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

          {/* Right Side - Image */}
          <motion.div 
            ref={imageRef}
            className="order-2 lg:order-2 lg:pr-10"
            initial="hidden"
            animate={isImageInView ? "visible" : "hidden"}
            variants={slideInRight}
          >
            <div className="relative max-w-lg mx-auto lg:mx-0">
              {/* Overlay Image 1 (appears first) */}
              <motion.div 
                className="absolute inset-0 z-20 pointer-events-none"
                initial={{ opacity: 0, y: 20 }}
                animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.4, duration: 1.5 }}
              >
                <Image
                  src="/images/hero/overlay-1.png"
                  alt=""
                  width={800}
                  height={800}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Background Image (appears second) */}
              <motion.div 
                className="absolute inset-0 z-0"
                initial={{ opacity: 0, y: 20 }}
                animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 0.8, duration: 1.5 }}
              >
                <Image
                  src="/images/hero/background-0.png"
                  alt=""
                  width={800}
                  height={800}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Main Image */}
              <motion.div 
                className="relative overflow-hidden rounded-3xl z-10"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={isImageInView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.9 }}
                transition={{ delay: 0.2, duration: 0.8 }}
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

              {/* Overlay Image 2 (appears last) */}
              <motion.div 
                className="absolute inset-0 z-20 pointer-events-none"
                initial={{ opacity: 0, y: 20 }}
                animate={isImageInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                transition={{ delay: 1.2, duration: 1.5 }}
              >
                <Image
                  src="/images/hero/overlay-2.png"
                  alt=""
                  width={800}
                  height={800}
                  className="w-full h-full object-contain"
                />
              </motion.div>

              {/* Decorative Elements */}
              <motion.div 
                className="absolute -bottom-6 -left-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={isImageInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ delay: 1.5, duration: 1 }}
              />
              <motion.div 
                className="absolute -top-6 -right-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -z-10"
                initial={{ scale: 0, opacity: 0 }}
                animate={isImageInView ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ delay: 1.6, duration: 1 }}
              />
            </div>
          </motion.div>
        </div>
      </Container>
    </section>
  );
};

export default AboutSection;
