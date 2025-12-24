'use client';

import React from 'react';
import Image from 'next/image';
import { ArrowLeft } from 'lucide-react';
import Container from './ui/Container';
import Badge from './ui/Badge';
import Button from './ui/Button';

interface Service {
  id: number;
  image: string;
  badge?: string;
  badgeVariant?: 'primary' | 'success' | 'warning' | 'info';
  title: string;
  description: string;
  price: string;
  buttonText: string;
  studentsCount?: string;
  studentImages?: string[];
}

const ServicesSection: React.FC = () => {
  const services: Service[] = [
    {
      id: 1,
      image: 'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&h=600&fit=crop',
      badge: 'الأكثر طلباً',
      badgeVariant: 'info',
      title: 'استشارة إعداد وحدة جديدة',
      description: 'خطة كاملة لتحويل شقتك إلى وحدة إيجار قصير احترافية',
      price: '2,500 جنيه',
      buttonText: 'احجز الآن',
      studentsCount: '2K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3',
        'https://i.pravatar.cc/150?img=4',
      ],
    },
    {
      id: 2,
      image: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=800&h=600&fit=crop',
      badge: 'جديد',
      badgeVariant: 'success',
      title: 'برنامج إدارة العمليات الكاملة',
      description: 'نظام شامل لإدارة حجوزاتك وفريقك ومالياتك بشفافية',
      price: '5,000 جنيه',
      buttonText: 'سجل الآن',
      studentsCount: '1.5K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=5',
        'https://i.pravatar.cc/150?img=6',
        'https://i.pravatar.cc/150?img=7',
        'https://i.pravatar.cc/150?img=8',
      ],
    },
    {
      id: 3,
      image: 'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=800&h=600&fit=crop',
      badge: 'Online',
      badgeVariant: 'warning',
      title: 'دورة استضافة Airbnb للمبتدئين',
      description: 'تعلم أساسيات بدء مشروع إيجار قصير ناجح من الصفر',
      price: '999 جنيه',
      buttonText: 'ابدأ التعلم',
      studentsCount: '3K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=9',
        'https://i.pravatar.cc/150?img=10',
        'https://i.pravatar.cc/150?img=11',
        'https://i.pravatar.cc/150?img=12',
      ],
    },
    {
      id: 4,
      image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&h=600&fit=crop',
      badge: 'شخصياً',
      badgeVariant: 'primary',
      title: 'تدريب الفرق الميدانية',
      description: 'تدريب عملي على معايير الخدمة الفندقية والتعامل مع الضيوف',
      price: '4,000 جنيه',
      buttonText: 'اطلب تدريب',
      studentsCount: '800+',
      studentImages: [
        'https://i.pravatar.cc/150?img=13',
        'https://i.pravatar.cc/150?img=14',
        'https://i.pravatar.cc/150?img=15',
        'https://i.pravatar.cc/150?img=16',
      ],
    },
    {
      id: 5,
      image: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&h=600&fit=crop',
      title: 'استشارة التسعير والأداء',
      description: 'تحليل شامل لأداء وحدتك واستراتيجية تسعير ديناميكية',
      price: '1,500 جنيه',
      buttonText: 'احجز الآن',
      studentsCount: '1.2K+',
      studentImages: [
        'https://i.pravatar.cc/150?img=17',
        'https://i.pravatar.cc/150?img=18',
        'https://i.pravatar.cc/150?img=19',
        'https://i.pravatar.cc/150?img=20',
      ],
    },
    {
      id: 6,
      image: 'https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=800&h=600&fit=crop',
      badge: 'VIP',
      badgeVariant: 'primary',
      title: 'حزمة الإدارة الكاملة',
      description: 'ندير عقارك بالكامل من التسويق حتى استقبال الضيوف',
      price: 'من 15% من الإيرادات',
      buttonText: 'استفسر الآن',
      studentsCount: '500+',
      studentImages: [
        'https://i.pravatar.cc/150?img=21',
        'https://i.pravatar.cc/150?img=22',
        'https://i.pravatar.cc/150?img=23',
        'https://i.pravatar.cc/150?img=24',
      ],
    },
  ];

  return (
    <section className="py-20 bg-white" id="services">
      <Container>
        {/* Section Header */}
        <div className="text-center mb-16 animate-in fade-in slide-in-from-bottom duration-700">
          <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-4 font-bristone">
            الخدمات المتاحة
          </h2>
          <p className="text-lg text-secondary/70 max-w-2xl mx-auto">
            برامج شاملة لتطوير مشروعك في الإيجار القصير
          </p>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {services.map((service, index) => (
            <div
              key={service.id}
              className="group bg-[#ead3b9]/30 rounded-2xl overflow-visible shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 animate-in fade-in slide-in-from-bottom relative border border-[#ead3b9]"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image Container */}
              <div className="relative h-72 overflow-hidden rounded-xl m-3">
                <Image
                  src={service.image}
                  alt={service.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-110 rounded-xl"
                />
                {/* Badge */}
                {service.badge && (
                  <div className="absolute top-4 right-4">
                    <Badge variant={service.badgeVariant} size="md">
                      {service.badge}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Students Badge - Positioned between image and content */}
              {service.studentImages && service.studentsCount && (
                <div className="absolute right-6 z-10" style={{ top: 'calc(18rem - 1rem)' }}>
                  <div className="flex items-center gap-2 bg-[#ead3b9]/95 backdrop-blur-sm rounded-full px-5 py-2 shadow-xl border border-[#edbf8c]">
                    <div className="flex items-center -space-x-2">
                      {service.studentImages.slice(0, 4).map((img, i) => (
                        <div
                          key={i}
                          className="relative w-7 h-7 rounded-full border-2 border-white overflow-hidden"
                        >
                          <Image
                            src={img}
                            alt={`Student ${i + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>
                    <span className="text-sm font-bold text-secondary mr-1">
                      {service.studentsCount} طالب
                    </span>
                  </div>
                </div>
              )}

              {/* Content */}
              <div className="p-6 pt-10">
                {/* Title */}
                <h3 className="text-xl font-bold text-secondary mb-3">
                  {service.title}
                </h3>

                {/* Description */}
                <p className="text-secondary/70 leading-relaxed mb-6">
                  {service.description}
                </p>

                {/* Price & Button */}
                <div className="flex items-center justify-between gap-4">
                  <span className="text-2xl font-bold text-secondary font-bristone">
                    {service.price}
                  </span>
                  <button
                    className="shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-secondary border-2 border-secondary rounded-lg transition-all duration-300 hover:bg-secondary hover:text-[#ead3b9]"
                  >
                    {service.buttonText}
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
};

export default ServicesSection;
