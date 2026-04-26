'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Shield, Database, Eye, Share2, Lock, Cookie, UserCheck, ArrowRight, Mail } from 'lucide-react';
import Container from '@/components/ui/Container';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const sections = [
  {
    icon: Database,
    title: 'البيانات التي نجمعها',
    content: 'قد نطلب بعض البيانات مثل الاسم، البريد الإلكتروني، رقم الهاتف، بيانات الحساب، وبيانات الشراء.',
    extra: 'لا نقوم بتخزين بيانات البطاقات البنكية داخل الموقع، حيث تتم معالجة الدفع من خلال بوابة الدفع المعتمدة.',
  },
  {
    icon: Eye,
    title: 'كيف نستخدم بياناتك؟',
    content: 'نستخدم بياناتك من أجل:',
    list: [
      'إنشاء حسابك وتشغيله.',
      'تفعيل الدورات بعد الدفع.',
      'إرسال إشعارات مهمة عن حسابك أو مشترياتك.',
      'تقديم الدعم والرد على استفساراتك.',
      'تحسين خدمات الموقع.',
    ],
  },
  {
    icon: Share2,
    title: 'مشاركة البيانات',
    content: 'لا نبيع بياناتك لأي جهة.',
    extra: 'قد نشارك البيانات الضرورية فقط مع مزودي الخدمة، مثل بوابة الدفع، لإتمام عمليات الشراء أو تشغيل الخدمة.',
  },
  {
    icon: Lock,
    title: 'حماية البيانات',
    content: 'نحرص على حماية بياناتك باستخدام وسائل أمان مناسبة، مع العلم أن أي خدمة إلكترونية لا يمكن ضمان أمانها بشكل كامل.',
  },
  {
    icon: Cookie,
    title: 'ملفات الارتباط',
    content: 'قد يستخدم الموقع ملفات الارتباط لتحسين تجربة التصفح وتحليل أداء الموقع.',
  },
  {
    icon: UserCheck,
    title: 'حقوقك',
    content: 'يمكنك طلب تعديل أو حذف بياناتك، ما لم نكن بحاجة للاحتفاظ بها لأسباب قانونية أو تشغيلية.',
  },
];

export default function PrivacyContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useScrollAnimation(heroRef as React.RefObject<Element>, { threshold: 0.1, once: true });
  const contentRef = useRef<HTMLDivElement>(null);
  const isContentInView = useScrollAnimation(contentRef as React.RefObject<Element>, { threshold: 0.1, once: true });

  return (
    <main className="min-h-screen">
      {/* Hero Section - matching main site hero style */}
      <section className="relative pt-24 pb-20 md:pt-28 md:pb-24 overflow-hidden bg-white">
        {/* Dark green background card - matching hero style */}
        <div 
          className="absolute top-16 left-4 right-4 bottom-0 md:top-20 md:left-8 md:right-8 xl:left-16 xl:right-16 bg-secondary rounded-2xl"
          style={{ filter: 'drop-shadow(0px 10px 25px rgba(0, 0, 0, 0.35))' }}
        >
          {/* Background image slideshow */}
          <div className="absolute inset-0 rounded-2xl overflow-hidden opacity-15">
            <div 
              className="absolute inset-0 w-full h-full"
              style={{
                backgroundImage: `url('/images/hero/hero-1.jpg')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
          </div>
          {/* Pattern overlay */}
          <div 
            className="absolute inset-0 opacity-20 rounded-2xl overflow-hidden"
            style={{
              backgroundImage: 'url(/patterns/pattern_hero.png)',
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
        </div>

        <Container className="relative z-10">
          <motion.div
            ref={heroRef}
            initial="hidden"
            animate={isHeroInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="text-center pt-12 pb-6 md:pt-16 md:pb-10"
          >
            {/* Back link */}
            <motion.div variants={fadeInUp} className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-accent/60 hover:text-primary transition-colors duration-300 text-sm font-medium"
              >
                <ArrowRight size={16} />
                العودة للصفحة الرئيسية
              </Link>
            </motion.div>

            {/* Logo icon */}
            <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
              <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-2xl transition-all duration-300">
                <Shield className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            {/* Title */}
            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-5 leading-tight font-bristone"
            >
              سياسة الخصوصية
            </motion.h1>

            {/* Subtitle */}
            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-accent/80 leading-relaxed max-w-2xl mx-auto"
            >
              نحن في مفتاحك نحترم خصوصيتك، ونستخدم بياناتك فقط لتقديم خدماتنا وتحسين تجربتك داخل الموقع.
            </motion.p>
          </motion.div>
        </Container>
      </section>

      {/* Content Sections */}
      <section className="py-16 md:py-20 bg-white">
        <Container>
          <motion.div
            ref={contentRef}
            initial="hidden"
            animate={isContentInView ? 'visible' : 'hidden'}
            variants={staggerContainer}
            className="max-w-4xl mx-auto"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {sections.map((section, index) => {
                const Icon = section.icon;
                return (
                  <motion.div
                    key={index}
                    variants={fadeInUp}
                    className="group bg-[#fff3e6] border border-accent rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300"
                  >
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                      <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-2xl text-primary transition-all duration-300 group-hover:bg-primary group-hover:text-secondary group-hover:scale-110 group-hover:rotate-6">
                        <Icon className="w-8 h-8" />
                      </div>
                    </div>

                    {/* Title */}
                    <h2 className="text-xl font-bold text-secondary mb-4 text-center group-hover:text-primary transition-colors duration-300">
                      {section.title}
                    </h2>

                    {/* Content */}
                    <p className="text-secondary/70 leading-relaxed text-center">{section.content}</p>
                    
                    {section.extra && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/15">
                        <p className="text-secondary/60 leading-relaxed text-sm text-center">{section.extra}</p>
                      </div>
                    )}

                    {section.list && (
                      <ul className="mt-4 space-y-2">
                        {section.list.map((item, i) => (
                          <li key={i} className="flex items-start gap-3 text-secondary/70">
                            <div className="shrink-0 mt-1.5">
                              <Image
                                src="/logos/logo-dark-icon.png"
                                alt=""
                                width={16}
                                height={16}
                                className="w-4 h-4"
                              />
                            </div>
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </motion.div>

          {/* Contact CTA - Full width */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mt-16 max-w-7xl mx-auto bg-secondary rounded-2xl py-12 px-8 md:py-16 md:px-12 text-center relative overflow-hidden border-2 border-[#2e5852]"
            style={{ boxShadow: '0 6px 50px rgba(16, 48, 43, 0.3)' }}
          >
            {/* Pattern overlay */}
            <div 
              className="absolute inset-0 opacity-10"
              style={{
                backgroundImage: 'url(/patterns/pattern_hero.png)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            <div className="relative z-10">
              <div className="p-3 bg-primary/10 border-2 border-primary/30 rounded-2xl inline-flex mb-5">
                <Mail className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-2xl md:text-3xl font-bold text-primary mb-3 font-bristone">لأي استفسار</h3>
              <p className="text-white/70 mb-8 max-w-lg mx-auto text-lg">تواصل معنا من خلال قسم تواصل معي</p>
              <button
                onClick={() => {
                  window.location.href = '/#contact';
                  setTimeout(() => {
                    const el = document.getElementById('contact');
                    if (el) el.scrollIntoView({ behavior: 'smooth' });
                  }, 500);
                }}
                className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-secondary font-bold px-10 py-4 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02] text-lg"
              >
                تواصل معنا
                <ArrowRight size={20} className="rotate-180" />
              </button>
            </div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}

