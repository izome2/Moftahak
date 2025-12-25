'use client';

import React from 'react';
import Image from 'next/image';
import { CheckCircle2, ArrowLeft } from 'lucide-react';
import Container from './ui/Container';
import Badge from './ui/Badge';
import Button from './ui/Button';

const AboutSection: React.FC = () => {
  const expertise = [
    'تطوير أنظمة تشغيل وسير عمل',
    'تنظيم وتدريب الفرق الميدانية',
    'تحسين تجربة الضيوف والتواصل',
    'إدارة الأداء والتسعير والشفافية المالية',
  ];

  return (
    <section className="py-20 bg-white" id="about">
      <Container>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Right Side - Image */}
          <div className="order-2 lg:order-1 animate-in fade-in slide-in-from-right duration-700">
            <div className="relative">
              {/* Main Image */}
              <div className="relative h-125 md:h-150 rounded-3xl overflow-hidden shadow-2xl">
                <Image
                  src="/images/hero/abdullah-profile.jpg"
                  alt="عبد الله الخضر"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Decorative Elements */}
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-primary/20 rounded-full blur-3xl -z-10" />
              <div className="absolute -top-6 -left-6 w-32 h-32 bg-secondary/20 rounded-full blur-3xl -z-10" />
            </div>
          </div>

          {/* Left Side - Content */}
          <div className="order-1 lg:order-2 animate-in fade-in slide-in-from-left duration-700">
            {/* Badge */}
            <Badge variant="primary" size="lg" className="mb-6">
              عبد الله الخضر
            </Badge>

            {/* Title */}
            <h2 className="text-4xl md:text-5xl font-bold text-secondary mb-6 font-bristone leading-tight">
              من وحدة واحدة إلى نموذج ضيافة متكامل
            </h2>

            {/* Bio Text */}
            <div className="space-y-4 text-secondary/80 leading-relaxed mb-8">
              <p>
                أنا <span className="font-bold text-secondary">عبد الله الخضر</span>، رائد أعمال ومشغل في مجال الإيجارات قصيرة المدى والشقق الفندقية في القاهرة.
              </p>
              <p>
                أركز على بناء تجارب ضيافة تجمع بين الراحة والكفاءة ومعايير عالية من الخدمة. بدأت رحلتي بوحدة واحدة ونمت لتصبح عملية ضيافة منظمة تعتمد على أنظمة واضحة، وتدريب الفريق، والتزام قوي بتجربة ضيوف استثنائية.
              </p>
              <p>
                اليوم، أعمل على تطوير نموذج مستدام للإيجارات قصيرة المدى في مصر - مبني على البيانات، الشفافية، والقابلية للنمو.
              </p>
            </div>

            {/* Expertise List */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-secondary mb-4">مجالات الخبرة:</h3>
              <ul className="space-y-3">
                {expertise.map((item, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <CheckCircle2 size={24} className="text-primary shrink-0 mt-0.5" />
                    <span className="text-secondary/80 font-medium">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Additional Note */}
            <div className="bg-primary/10 border-r-4 border-primary rounded-xl p-6 mb-8">
              <p className="text-secondary/80 leading-relaxed">
                كما أقوم بإنشاء محتوى تعليمي عن استضافة Airbnb ومجال الإيجار القصير، أشارك من خلاله رؤى عملية وتجارب حقيقية مع المستضيفين الجدد والطامحين.
              </p>
            </div>

            {/* CTA Button */}
            <Button
              variant="primary"
              size="lg"
              rightIcon={<ArrowLeft size={20} />}
            >
              تواصل للشراكة أو الاستثمار
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
};

export default AboutSection;
