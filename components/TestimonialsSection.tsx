'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';
import Container from './ui/Container';
import Card from './ui/Card';

interface Testimonial {
  id: number;
  name: string;
  role: string;
  avatar: string;
  rating: number;
  text: string;
  date: string;
}

const TestimonialsSection: React.FC = () => {
  const testimonials: Testimonial[] = [
    {
      id: 1,
      name: 'أحمد محمود',
      role: 'مالك 3 وحدات في القاهرة',
      avatar: 'https://i.pravatar.cc/150?img=25',
      rating: 5,
      text: 'بفضل عبد الله، حولت شقتي لمصدر دخل ثابت. الإشغال وصل 90% والخدمة احترافية جداً!',
      date: 'منذ شهرين',
    },
    {
      id: 2,
      name: 'سارة عبد الرحمن',
      role: 'مستثمرة عقارية',
      avatar: 'https://i.pravatar.cc/150?img=26',
      rating: 5,
      text: 'الدورة التدريبية كانت شاملة وعملية. تعلمت كل حاجة من الألف للياء!',
      date: 'منذ 3 أسابيع',
    },
    {
      id: 3,
      name: 'محمد علي',
      role: 'صاحب 5 وحدات في الساحل',
      avatar: 'https://i.pravatar.cc/150?img=27',
      rating: 5,
      text: 'نظام الإدارة الكاملة خلاني أركز على التوسع والاستثمار بدل ما أضيع وقت في التفاصيل.',
      date: 'منذ شهر',
    },
    {
      id: 4,
      name: 'نورهان السيد',
      role: 'Airbnb Superhost',
      avatar: 'https://i.pravatar.cc/150?img=28',
      rating: 5,
      text: 'استشارة التسعير زودت دخلي 40% في أول 3 شهور. استثمار يستحق كل قرش!',
      date: 'منذ أسبوعين',
    },
    {
      id: 5,
      name: 'خالد حسن',
      role: 'مضيف جديد',
      avatar: 'https://i.pravatar.cc/150?img=29',
      rating: 5,
      text: 'بدأت من الصفر وعبد الله ساعدني في كل خطوة. دلوقتي عندي حجوزات لشهرين قدام!',
      date: 'منذ 5 أيام',
    },
    {
      id: 6,
      name: 'مريم أحمد',
      role: 'مديرة عقارات',
      avatar: 'https://i.pravatar.cc/150?img=30',
      rating: 5,
      text: 'تدريب الفريق الميداني رفع مستوى الخدمة بشكل ملحوظ. التقييمات كلها 5 نجوم!',
      date: 'منذ شهر',
    },
  ];

  return (
    <section className="py-20 bg-[#ead3b9]/20" id="testimonials">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
            آراء العملاء
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            شاهد تجارب حقيقية من مضيفين نجحوا في تحويل عقاراتهم لمشاريع مربحة
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card
              key={testimonial.id}
              className="p-6 hover:shadow-xl transition-all duration-300 animate-in fade-in slide-in-from-bottom"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Quote Icon */}
              <div className="text-primary/20 mb-4">
                <Quote size={40} fill="currentColor" />
              </div>

              {/* Rating */}
              <div className="flex items-center gap-1 mb-4">
                {Array.from({ length: testimonial.rating }).map((_, i) => (
                  <Star key={i} size={16} fill="#edbf8c" className="text-primary" />
                ))}
              </div>

              {/* Testimonial Text */}
              <p className="text-secondary/80 leading-relaxed mb-6">
                {testimonial.text}
              </p>

              {/* Author Info */}
              <div className="flex items-center gap-4 pt-4 border-t border-secondary/10">
                <div className="relative w-12 h-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                  <Image
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h4 className="font-bold text-secondary mb-1">
                    {testimonial.name}
                  </h4>
                  <p className="text-sm text-secondary/60">{testimonial.role}</p>
                </div>
                <span className="text-xs text-secondary/50">{testimonial.date}</span>
              </div>
            </Card>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-12 animate-in fade-in slide-in-from-bottom duration-700" style={{ animationDelay: '600ms' }}>
          <p className="text-lg text-secondary/70 mb-6">
            انضم لأكثر من <span className="font-bold text-primary">2000+</span> مضيف ناجح
          </p>
          
          {/* Students Badge - Overall Summary */}
          <div className="inline-flex items-center gap-3 bg-white rounded-full px-6 py-3 shadow-lg">
            <div className="flex items-center -space-x-3">
              {[31, 32, 33, 34, 35, 36].map((imgNum, i) => (
                <div
                  key={i}
                  className="relative w-10 h-10 rounded-full border-2 border-white overflow-hidden"
                >
                  <Image
                    src={`https://i.pravatar.cc/150?img=${imgNum}`}
                    alt={`Student ${i + 1}`}
                    fill
                    className="object-cover"
                  />
                </div>
              ))}
            </div>
            <div className="text-right pr-2">
              <p className="text-sm font-bold text-secondary">
                أكثر من 8,000+ متدرب
              </p>
              <p className="text-xs text-secondary/60">
                في جميع الدورات والبرامج
              </p>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default TestimonialsSection;
