'use client';

import React from 'react';
import { MessageCircle, Building2, CheckCircle2, ArrowLeft, Sparkles, GraduationCap } from 'lucide-react';
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

const PremiumSection: React.FC = () => {
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

  return (
    <section className="py-20 bg-white" id="packages">
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
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 max-w-7xl mx-auto">
          {packages.map((pkg, index) => (
            <div
              key={pkg.id}
              className={`
                relative rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl
                ${pkg.bgColor}
                p-8 md:p-10
                border-2 border-[#ead3b9]
                group hover:-translate-y-2 transition-all duration-500
                animate-in fade-in slide-in-from-bottom
                lg:col-span-2
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {/* Large Background Icon - Overflowing */}
              <div className="absolute -top-8 -left-8 z-0 opacity-10">
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
              </div>

              {/* Content */}
              <div className="relative z-10">
                {/* Title */}
                <h3 className="text-xl md:text-2xl font-bold text-secondary mb-3 font-bristone">
                  {pkg.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-secondary/80 leading-relaxed mb-4">
                  {pkg.description}
                </p>

                {/* Button */}
                <button className="inline-flex items-center justify-center gap-2 px-6 py-3 text-base font-bold text-secondary bg-gradient-to-tl from-[#e5b483] to-[#edc49f] rounded-xl transition-all duration-300 hover:from-[#d9a46f] hover:to-[#e5b483] shadow-[0_0_15px_rgba(0,0,0,0.15)] hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:scale-105 active:scale-95 group/btn relative overflow-hidden before:absolute before:inset-0 before:bg-gradient-to-l before:from-transparent before:via-white/30 before:to-transparent before:translate-x-full hover:before:translate-x-[-100%] before:transition-transform before:duration-700">
                  <span className="relative z-10">{pkg.buttonText}</span>
                  <ArrowLeft size={20} className="shrink-0 transition-transform duration-300 group-hover/btn:-translate-x-1 relative z-10" />
                </button>
              </div>
            </div>
          ))}

          {/* Coming Soon Card - Square */}
          <div 
            className="
              relative rounded-2xl overflow-hidden shadow-lg
              bg-linear-to-br from-secondary/5 to-primary/5
              p-5 md:p-6
              border-2 border-dashed border-secondary/30
              flex flex-col items-center justify-center
              animate-in fade-in slide-in-from-bottom
              lg:col-span-1
              min-h-full
            "
            style={{ animationDelay: '300ms' }}
          >
            {/* Icon */}
            <div className="mb-4 p-3 bg-primary/10 rounded-2xl border-2 border-primary/20">
              <GraduationCap className="w-10 h-10 text-primary" strokeWidth={1.5} />
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-secondary mb-2 font-bristone text-center">
              ورش العمل
            </h3>

            {/* Coming Soon Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 ">
              <span className="text-xs font-semibold text-secondary">قريباً</span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default PremiumSection;
