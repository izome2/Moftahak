'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Sparkles } from 'lucide-react';
import Container from './ui/Container';
import Input from './ui/Input';
import Button from './ui/Button';

const CTASection: React.FC = () => {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Email submitted:', email);
    // TODO: Add actual form submission logic
  };

  return (
    <section className="py-20 relative overflow-hidden" id="cta">
      {/* Background */}
      <div className="absolute inset-0 bg-secondary" />
      
      {/* Pattern Overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: 'url(/patterns/pattern-horizontal-dark.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Decorative Shapes */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl translate-y-1/2 -translate-x-1/2" />

      {/* Hexagon Shape (Optional decorative element) */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-200 h-200 opacity-5">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <polygon
            points="50 1 95 25 95 75 50 99 5 75 5 25"
            fill="currentColor"
            className="text-primary"
          />
        </svg>
      </div>

      <Container className="relative z-10">
        <div className="max-w-4xl mx-auto text-center animate-in fade-in zoom-in duration-700">
          {/* Icon */}
          <div className="inline-flex p-4 bg-primary/20 backdrop-blur-sm rounded-full mb-6 border-2 border-primary/30">
            <Sparkles size={40} className="text-primary" />
          </div>

          {/* Title */}
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 font-bristone leading-tight">
            هل أنت مستعد لتطوير
            <br />
            <span className="text-primary">مشروعك اليوم؟</span>
          </h2>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-white/90 mb-12 leading-relaxed">
            انضم إلى مالكي العقارات الذين حولوا وحداتهم إلى استثمارات مربحة
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  type="email"
                  placeholder="أدخل بريدك الإلكتروني"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  leftIcon={<Mail size={20} />}
                  className="text-lg h-14"
                  required
                />
              </div>
              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="bg-primary text-secondary hover:bg-primary/90 shadow-2xl px-8 whitespace-nowrap"
                rightIcon={<ArrowLeft size={20} />}
              >
                احجز استشارة مجانية
              </Button>
            </div>

            {/* Privacy Note */}
            <p className="text-sm text-white/60">
              نحترم خصوصيتك. لن نشارك بياناتك مع أي جهة خارجية.
            </p>
          </form>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 mt-16 pt-16 border-t border-white/20">
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-bristone">
                50+
              </div>
              <div className="text-white/80">عميل راضٍ</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-bristone">
                100+
              </div>
              <div className="text-white/80">وحدة تم تطويرها</div>
            </div>
            <div className="text-center">
              <div className="text-4xl md:text-5xl font-bold text-primary mb-2 font-bristone">
                4.9/5
              </div>
              <div className="text-white/80">تقييم العملاء</div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
