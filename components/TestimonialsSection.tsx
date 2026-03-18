'use client';

import React, { useRef, useMemo } from 'react';
import { Quote, User } from 'lucide-react';
import AnimatedStroke from './ui/AnimatedStroke';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  text: string;
}

const TestimonialsSection: React.FC = () => {
  const scrollRef1 = useRef<HTMLDivElement>(null);
  const scrollRef2 = useRef<HTMLDivElement>(null);
  const t = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';

  const testimonials: Testimonial[] = useMemo(() => 
    t.testimonials.items.map((item, index) => ({
      id: index + 1,
      name: item.name,
      role: item.role,
      text: item.text,
    })), [t]);

  // تقسيم الشهادات إلى صفين
  const row1Testimonials = useMemo(() => testimonials.filter((_, index) => index % 2 === 0), [testimonials]);
  const row2Testimonials = useMemo(() => testimonials.filter((_, index) => index % 2 !== 0), [testimonials]);
  
  // تكرار كل صف 2 مرات فقط (بدلاً من 3)
  const duplicatedRow1 = useMemo(() => [...row1Testimonials, ...row1Testimonials], [row1Testimonials]);
  const duplicatedRow2 = useMemo(() => [...row2Testimonials, ...row2Testimonials], [row2Testimonials]);

  return (
    <section className="py-20 bg-white overflow-hidden" id="testimonials">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone flex items-center justify-center gap-3">
            <AnimatedStroke delay={0.2}>
              {t.testimonials.title}
            </AnimatedStroke>
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            {t.testimonials.subtitle}
          </p>
        </div>

        {/* Scrolling Testimonials */}
        <div className="relative">
          {/* Gradient Overlays */}
          <div className="absolute left-0 top-0 bottom-0 w-32 bg-linear-to-r from-[#fdf6ee] to-transparent z-10 pointer-events-none"></div>
          <div className="absolute right-0 top-0 bottom-0 w-32 bg-linear-to-l from-[#fdf6ee] to-transparent z-10 pointer-events-none"></div>
          
          {/* First Row - Scrolling Left to Right */}
          <div className="overflow-hidden mb-6">
            <div 
              ref={scrollRef1}
              className={`flex gap-6 ${isRTL ? 'animate-scroll-rtl' : 'animate-scroll-ltr'}`}
            >
              {duplicatedRow1.map((testimonial, index) => (
                <div
                  key={`row1-${index}`}
                  className="relative shrink-0 w-125 rounded-2xl overflow-hidden bg-[#ead3b9]/20 p-8 border-2 border-[#ead3b9]"
                >
                  {/* Background Icon */}
                  <div className="absolute -top-8 -left-8 z-0 opacity-5">
                    <div className="text-secondary relative">
                      <Quote size={256} fill="currentColor" />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div className="relative z-10">
                    <p className="text-secondary/80 leading-relaxed mb-6 min-h-30">
                      {testimonial.text}
                    </p>

                    {/* Author Info with Avatar */}
                    <div className="pt-4 border-t-0 flex items-center justify-between relative">
                      {/* Gradient Border */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-secondary/10 to-transparent"></div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#ead3b9]/30 flex items-center justify-center shrink-0 border-2 border-[#ead3b9]">
                          <User size={24} className="text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary mb-1">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-secondary/60">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="text-secondary">
                        <Quote size={28} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Second Row - Scrolling Left to Right */}
          <div className="overflow-hidden">
            <div 
              ref={scrollRef2}
              className={`flex gap-6 ${isRTL ? 'animate-scroll-rtl-delayed' : 'animate-scroll-ltr-delayed'}`}
            >
              {duplicatedRow2.map((testimonial, index) => (
                <div
                  key={`row2-${index}`}
                  className="relative shrink-0 w-125 rounded-2xl overflow-hidden bg-[#ead3b9]/20 p-8 border-2 border-[#ead3b9]"
                >
                  {/* Background Icon */}
                  <div className="absolute -top-8 -left-8 z-0 opacity-5">
                    <div className="text-secondary relative">
                      <Quote size={256} fill="currentColor" />
                    </div>
                  </div>

                  {/* Testimonial Text */}
                  <div className="relative z-10">
                    <p className="text-secondary/80 leading-relaxed mb-6 min-h-30">
                      {testimonial.text}
                    </p>

                    {/* Author Info with Avatar */}
                    <div className="pt-4 border-t-0 flex items-center justify-between relative">
                      {/* Gradient Border */}
                      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-secondary/10 to-transparent"></div>
                      
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-full bg-[#ead3b9]/30 flex items-center justify-center shrink-0 border-2 border-[#ead3b9]">
                          <User size={24} className="text-secondary" />
                        </div>
                        <div>
                          <h4 className="font-bold text-secondary mb-1">
                            {testimonial.name}
                          </h4>
                          <p className="text-sm text-secondary/60">{testimonial.role}</p>
                        </div>
                      </div>
                      <div className="text-secondary">
                        <Quote size={28} fill="currentColor" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes scroll-rtl {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(50%);
          }
        }

        @keyframes scroll-ltr {
          from {
            transform: translateX(0);
          }
          to {
            transform: translateX(-50%);
          }
        }

        .animate-scroll-rtl {
          animation: scroll-rtl 10s linear infinite;
          will-change: transform;
        }

        .animate-scroll-rtl-delayed {
          animation: scroll-rtl 10s linear infinite;
          animation-delay: -5s;
          will-change: transform;
        }

        .animate-scroll-ltr {
          animation: scroll-ltr 10s linear infinite;
          will-change: transform;
        }

        .animate-scroll-ltr-delayed {
          animation: scroll-ltr 10s linear infinite;
          animation-delay: -5s;
          will-change: transform;
        }
      `}</style>
    </section>
  );
};

export default React.memo(TestimonialsSection);
