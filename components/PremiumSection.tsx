'use client';

import React from 'react';
import { Briefcase, Building2, CheckCircle2, ArrowLeft, Sparkles } from 'lucide-react';
import Container from './ui/Container';
import Badge from './ui/Badge';

interface Package {
  id: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  features: string[];
  price: string;
  priceNote?: string;
  buttonText: string;
  isPopular?: boolean;
  bgColor: string;
}

const PremiumSection: React.FC = () => {
  const packages: Package[] = [
    {
      id: 1,
      icon: <Briefcase className="w-10 h-10" />,
      title: 'باقة الإعداد الكامل للمستثمرين',
      subtitle: 'للمستثمرين الجدد',
      features: [
        'دراسة جدوى للعقار',
        'خطة تشغيلية كاملة',
        'تأسيس نظام الحجوزات',
        'تدريب الفريق الأساسي',
        'متابعة لمدة 3 أشهر',
      ],
      price: '15,000 جنيه',
      priceNote: 'ابتداءً من',
      buttonText: 'احجز استشارة',
      isPopular: true,
      bgColor: 'bg-[#ead3b9]/20',
    },
    {
      id: 2,
      icon: <Building2 className="w-10 h-10" />,
      title: 'استشارة تطوير وتحسين عقار قائم',
      subtitle: 'لأصحاب العقارات الحالية',
      features: [
        'تقييم العقار الحالي',
        'خطة تحسين الإيرادات',
        'استراتيجية تسعير متقدمة',
        'تحسين تجربة الضيوف',
        'تقرير أداء شهري',
      ],
      price: '8,000 جنيه',
      priceNote: 'ابتداءً من',
      buttonText: 'ابدأ الآن',
      bgColor: 'bg-white',
      gradient: 'from-secondary via-secondary/90 to-primary',
    },
  ];

  return (
    <section className="py-20 bg-white" id="packages">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-primary/10 mb-6">
            <Sparkles className="text-primary" size={32} />
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
            خدمات للمستثمرين ومالكي العقارات
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            حلول شاملة لتحويل عقارك إلى استثمار مربح
          </p>
        </div>

        {/* Packages Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`
                relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl
                ${pkg.bgColor}
                p-7 md:p-8
                border-2 ${pkg.isPopular ? 'border-primary' : 'border-[#ead3b9]'}
                group hover:-translate-y-2 transition-all duration-500
                animate-in fade-in slide-in-from-bottom
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Popular Badge */}
              {pkg.isPopular && (
                <div className="absolute top-6 left-6">
                  <Badge variant="primary" size="md">
                    الأكثر طلباً
                  </Badge>
                </div>
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Icon */}
                <div className="mb-5 inline-flex p-3.5 bg-primary/10 rounded-xl border-2 border-primary/30 text-primary group-hover:scale-110 transition-transform duration-300">
                  {pkg.icon}
                </div>

                {/* Subtitle & Title Box */}
                <div className="mb-5 p-4 bg-secondary/5 rounded-lg border border-secondary/10">
                  <p className="text-xs font-semibold mb-1.5 text-secondary/60 uppercase tracking-wide">
                    {pkg.subtitle}
                  </p>
                  <h3 className="text-xl md:text-2xl font-bold leading-tight text-secondary">
                    {pkg.title}
                  </h3>
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 mb-5">
                  {pkg.features.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2.5">
                      <div className="shrink-0 mt-0.5">
                        <CheckCircle2 
                          size={18} 
                          className="text-primary"
                        />
                      </div>
                      <span className="text-sm text-secondary/80 leading-relaxed">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Price Box */}
                <div className="mb-5 p-4 bg-primary/5 rounded-lg border border-primary/20">
                  <p className="text-xs text-secondary/60 mb-0.5">{pkg.priceNote}</p>
                  <p className="text-2xl font-bold font-bristone text-secondary">{pkg.price}</p>
                </div>

                {/* Button */}
                <button className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 text-sm font-semibold text-secondary border-2 border-secondary rounded-xl transition-all duration-300 hover:bg-secondary hover:text-[#ead3b9] group/btn">
                  <span>{pkg.buttonText}</span>
                  <ArrowLeft size={18} className="transition-transform duration-300 group-hover/btn:translate-x-[-4px]" />
                </button>
              </div>

              {/* Decorative Corner */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-bl-full transform translate-x-16 -translate-y-16" />
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default PremiumSection;
