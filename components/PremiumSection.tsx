'use client';

import React from 'react';
import { Briefcase, Building2, CheckCircle2, ArrowLeft } from 'lucide-react';
import Container from './ui/Container';
import Button from './ui/Button';

interface Package {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  features: string[];
  price: string;
  buttonText: string;
  gradient: string;
}

const PremiumSection: React.FC = () => {
  const packages: Package[] = [
    {
      id: 1,
      icon: <Briefcase className="w-12 h-12" />,
      title: 'باقة الإعداد الكامل للمستثمرين',
      subtitle: 'للمستثمرين الجدد',
      features: [
        'دراسة جدوى للعقار',
        'خطة تشغيلية كاملة',
        'تأسيس نظام الحجوزات',
        'تدريب الفريق الأساسي',
        'متابعة لمدة 3 أشهر',
      ],
      price: 'ابتداءً من 15,000 جنيه',
      buttonText: 'احجز استشارة',
      gradient: 'from-primary via-primary/90 to-secondary',
    },
    {
      id: 2,
      icon: <Building2 className="w-12 h-12" />,
      title: 'استشارة تطوير وتحسين عقار قائم',
      subtitle: 'لأصحاب العقارات الحالية',
      features: [
        'تقييم العقار الحالي',
        'خطة تحسين الإيرادات',
        'استراتيجية تسعير متقدمة',
        'تحسين تجربة الضيوف',
        'تقرير أداء شهري',
      ],
      price: 'ابتداءً من 8,000 جنيه',
      buttonText: 'ابدأ الآن',
      gradient: 'from-secondary via-secondary/90 to-primary',
    },
  ];

  return (
    <section className="py-20 bg-accent/10" id="packages">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
            خدمات للمستثمرين ومالكي العقارات
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            حلول شاملة لتحويل عقارك إلى استثمار مربح
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`
                relative rounded-3xl overflow-hidden shadow-2xl
                bg-linear-to-br ${pkg.gradient}
                p-8 md:p-10
                group hover:scale-105 transition-all duration-500
                animate-in fade-in slide-in-from-bottom
              `}
              style={{ animationDelay: `${index * 200}ms` }}
            >
              {/* Pattern Overlay */}
              <div 
                className="absolute inset-0 opacity-10"
                style={{
                  backgroundImage: 'url(/patterns/pattern-vertical-white.png)',
                  backgroundSize: 'cover',
                  backgroundPosition: 'center',
                }}
              />

              {/* Content */}
              <div className="relative z-10 text-white">
                {/* Icon */}
                <div className="mb-6 inline-flex p-4 bg-white/20 backdrop-blur-sm rounded-2xl border-2 border-white/30 group-hover:scale-110 transition-transform duration-300">
                  {pkg.icon}
                </div>

                {/* Subtitle */}
                <p className="text-sm font-semibold mb-2 text-white/80 uppercase tracking-wide">
                  {pkg.subtitle}
                </p>

                {/* Title */}
                <h3 className="text-2xl md:text-3xl font-bold mb-6 leading-tight">
                  {pkg.title}
                </h3>

                {/* Features List */}
                <ul className="space-y-3 mb-8">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 
                        size={20} 
                        className="shrink-0 mt-0.5 text-white/90" 
                      />
                      <span className="text-white/90 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price */}
                <div className="mb-6 pb-6 border-b border-white/20">
                  <p className="text-2xl font-bold font-bristone">{pkg.price}</p>
                </div>

                {/* Button */}
                <Button
                  variant="secondary"
                  size="lg"
                  className="w-full bg-white text-secondary hover:bg-white/90 shadow-xl"
                  rightIcon={<ArrowLeft size={20} />}
                >
                  {pkg.buttonText}
                </Button>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
              <div className="absolute -top-10 -left-10 w-40 h-40 bg-white/5 rounded-full blur-3xl" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PremiumSection;
