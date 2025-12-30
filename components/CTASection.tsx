'use client';

import React, { useState } from 'react';
import { Mail, ArrowLeft, Sparkles, TrendingUp, CheckCircle2, User, MessageSquare } from 'lucide-react';
import Container from './ui/Container';
import Input from './ui/Input';
import Button from './ui/Button';

const CTASection: React.FC = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Form submitted:', formData);
    // TODO: Add actual form submission logic
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="pt-24 pb-8 relative overflow-visible bg-gradient-to-b from-[#fffcf9] via-[#f5e6d3] to-[#f0dcc4]" id="cta">
      {/* Background Pattern - extends to bottom of page */}
      <div className="absolute inset-0" style={{ bottom: '-400px' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/patterns/pattern-horizontal-white.png)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.2,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, black 100%)'
        }} />
      </div>

      {/* Background color extends to page bottom */}
      <div className="absolute inset-x-0 top-0" style={{ bottom: '-400px', background: 'linear-gradient(to bottom, white 0%, #f5e6d3 40%, #f0dcc4 70%, #f0dcc4 100%)', zIndex: -1 }} />

      <Container className="relative z-10">
        <div className="max-w-7xl mx-auto relative">
          {/* Background SVG Shape */}
          <div className="absolute -inset-8 md:-inset-16">
            <img src="/images/contact.svg" alt="" className="w-full h-full" style={{ objectFit: 'fill' }} />
          </div>
          
          {/* Content on top of SVG */}
          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-7 gap-8 px-8 md:px-12 lg:px-16 py-24 md:py-28 lg:py-32">
            {/* Right Side - Form */}
            <div className="lg:col-span-4">
              <div className="mb-6">
                <h3 className="text-2xl md:text-3xl font-bold text-secondary mb-2">
                  تواصل معي
                </h3>
                <p className="text-secondary/60">
                  املأ النموذج وسنتواصل معك قريباً
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="firstName"
                    placeholder="الاسم الأول"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    leftIcon={<User size={20} />}
                    className="bg-[#fffffff1] border-2 border-primary/20 focus:border-primary rounded-xl h-12"
                    required
                  />
                  <Input
                    type="text"
                    name="lastName"
                    placeholder="الاسم الأخير"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    leftIcon={<User size={20} />}
                    className="bg-[#fffffff1] border-2 border-primary/20 focus:border-primary rounded-xl h-12"
                    required
                  />
                </div>
                
                <Input
                  type="email"
                  name="email"
                  placeholder="البريد الإلكتروني"
                  value={formData.email}
                  onChange={handleInputChange}
                  leftIcon={<Mail size={20} />}
                  className="bg-[#fffffff1] border-2 border-primary/20 focus:border-primary rounded-xl h-12"
                  required
                />

                <div className="relative">
                  <MessageSquare size={20} className="absolute right-3 top-3 text-secondary/40 z-10" />
                  <textarea
                    name="message"
                    placeholder="رسالتك"
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pr-10 pl-4 py-3 bg-[#ffffffc7] border-2 border-primary/20 focus:border-primary rounded-xl text-secondary placeholder:text-secondary/40 focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
                    required
                  />
                </div>

                <div className="flex justify-start">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="bg-secondary hover:bg-secondary/90 text-primary hover:shadow-xl transition-all duration-300 h-11 rounded-xl font-bold px-8"
                    rightIcon={<ArrowLeft size={20} />}
                  >
                    إرسال الرسالة
                  </Button>
                </div>

                <p className="text-xs text-secondary/50 text-center mt-3">
                  🔒 نحترم خصوصيتك. لن نشارك بياناتك مع أي جهة خارجية.
                </p>
              </form>
            </div>

            {/* Left Side - Content */}
            <div className="lg:col-span-3 flex flex-col justify-center items-center text-center space-y-12 pt-16">
              <div>
                {/* Title */}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-3 leading-tight">
                  هل أنت مستعد لتطوير
                  <br />
                  <span className="text-transparent bg-clip-text bg-gradient-to-l from-primary via-[#d4a574] to-primary">
                    مشروعك اليوم؟
                  </span>
                </h2>

                {/* Subtitle */}
                <p className="text-base md:text-lg text-secondary/70 leading-relaxed">
                  انضم إلى مالكي العقارات الذين حولوا وحداتهم إلى استثمارات مربحة
                </p>
              </div>

              {/* Benefits Grid */}
              <div className="grid grid-cols-3 gap-2">
                <div className="flex items-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-2 border border-primary/20">
                  <CheckCircle2 className="text-primary flex-shrink-0" size={18} />
                  <span className="text-secondary font-medium text-xs">استشارة مجانية</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-2 border border-primary/20">
                  <TrendingUp className="text-primary flex-shrink-0" size={18} />
                  <span className="text-secondary font-medium text-xs">خطة عمل مخصصة</span>
                </div>
                <div className="flex items-center gap-2 bg-gradient-to-br from-primary/10 to-primary/5 rounded-xl p-2 border border-primary/20">
                  <Sparkles className="text-primary flex-shrink-0" size={18} />
                  <span className="text-secondary font-medium text-xs">متابعة مستمرة</span>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-8 pt-6 border-t-2 border-primary/10">
                <div className="text-center group">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-primary via-[#d4a574] to-primary bg-clip-text text-transparent mb-1 font-bristone group-hover:scale-110 transition-transform duration-300">
                    50+
                  </div>
                  <div className="text-secondary/70 text-sm font-medium">عميل راضٍ</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-primary via-[#d4a574] to-primary bg-clip-text text-transparent mb-1 font-bristone group-hover:scale-110 transition-transform duration-300">
                    100+
                  </div>
                  <div className="text-secondary/70 text-sm font-medium">وحدة مطورة</div>
                </div>
                <div className="text-center group">
                  <div className="text-2xl md:text-3xl font-bold bg-gradient-to-l from-primary via-[#d4a574] to-primary bg-clip-text text-transparent mb-1 font-bristone group-hover:scale-110 transition-transform duration-300">
                    4.9/5
                  </div>
                  <div className="text-secondary/70 text-sm font-medium">التقييم</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default CTASection;
