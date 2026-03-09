'use client';

import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, Users, Star, Award } from 'lucide-react';
import Container from './ui/Container';
import Card from './ui/Card';
import AnimatedStroke from './ui/AnimatedStroke';
import { fadeInUp, fadeInUpRotateRight, fadeInUpRotateLeft, staggerContainer } from '@/lib/animations/variants';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeaturesSection: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useScrollAnimation(ref, { threshold: 0.2, once: true });

  const features: Feature[] = [
    {
      icon: <Star className="w-8 h-8" />,
      title: 'خبرة حقيقية',
      description: 'خبرة إدارة وتشغيل وحدات حقيقية حققت أرباحاً فعلية داخل السوق المصري والخليجي.',
    },
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'أرقام موثوقة',
      description: 'دراسات وأدوات مبنية على بيانات سوق حقيقية، من واقع خبرة حقيقية.',
    },
    {
      icon: <Award className="w-8 h-8" />,
      title: 'نتائج أسرع',
      description: 'منهج عملي مختصر يوصلك للربح بأقل وقت وتكلفة وأخطاء.',
    },
  ];

  // Different animation variants for each card position
  const getCardVariant = (index: number) => {
    if (index === 0) return fadeInUpRotateRight; // Right card: rotate from +30deg
    if (index === 1) return fadeInUp; // Center card: normal fade up
    return fadeInUpRotateLeft; // Left card: rotate from -30deg
  };

  return (
    <section className="py-20 bg-white" id="features">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
            <AnimatedStroke delay={0.2}>
              لماذا تختار العمل معي؟
            </AnimatedStroke>
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            خبرة مثبتة في تحويل الوحدات العقارية إلى مشاريع ناجحة ومربحة
          </p>
        </div>

        {/* Features Grid */}
        <motion.div 
          ref={ref}
          className="grid grid-cols-1 md:grid-cols-3 gap-8"
          variants={staggerContainer}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
        >
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={getCardVariant(index)}
            >
              <Card className="text-center group h-full">
                {/* Icon Container */}
                <div className="flex justify-center mb-6">
                  <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-2xl text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-secondary group-hover:scale-110 group-hover:rotate-6">
                    {feature.icon}
                  </div>
                </div>

                {/* Title */}
                <h3 className="text-2xl font-bold text-secondary mb-4 group-hover:text-primary transition-colors duration-300">
                  {feature.title}
                </h3>

                {/* Description */}
                <p className="text-secondary/70 leading-relaxed">
                  {feature.description}
                </p>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </Container>
    </section>
  );
};

export default React.memo(FeaturesSection);
