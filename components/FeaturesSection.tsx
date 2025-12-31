'use client';

import React from 'react';
import { TrendingUp, Users, Star } from 'lucide-react';
import Container from './ui/Container';
import Card from './ui/Card';
import AnimatedStroke from './ui/AnimatedStroke';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const FeaturesSection: React.FC = () => {
  const features: Feature[] = [
    {
      icon: <TrendingUp className="w-8 h-8" />,
      title: 'نظام عمل متكامل',
      description: 'أنظمة وسير عمل مصممة خصيصاً لضمان كفاءة العمليات اليومية وتحقيق الربحية',
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'فريق مدرب ومحترف',
      description: 'تنظيم وتدريب الفرق الميدانية لتقديم خدمة فندقية بمعايير عالمية',
    },
    {
      icon: <Star className="w-8 h-8" />,
      title: 'تجربة ضيوف مميزة',
      description: 'تحسين التواصل مع الضيوف وإدارة التوقعات لضمان تقييمات عالية',
    },
  ];

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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              className="text-center group animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 150}ms` }}
            >
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
          ))}
        </div>
      </Container>
    </section>
  );
};

export default FeaturesSection;
