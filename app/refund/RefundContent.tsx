'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { RefreshCw, Clock, ClipboardCheck, XCircle, Send, CreditCard, Ban, Mail, ArrowRight } from 'lucide-react';
import Container from '@/components/ui/Container';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const sections = [
  {
    icon: Clock,
    title: 'مدة الاسترداد',
    content: 'يمكنك طلب استرداد قيمة الدورة خلال 7 أيام من تاريخ الشراء.',
    extra: 'بعد مرور هذه المدة، لا يتم قبول الاسترداد إلا في حال وجود مشكلة تقنية جوهرية تمنعك من الوصول للمحتوى ولم يتم حلها من جانبنا.',
  },
  {
    icon: ClipboardCheck,
    title: 'شروط الاسترداد',
    content: 'يُقبل طلب الاسترداد إذا:',
    list: [
      'تم تقديمه خلال 7 أيام من الشراء.',
      'كان الطلب من نفس البريد المستخدم في الشراء.',
      'لم يتم استخدام الحساب بشكل مخالف.',
      'لم يتم مشاركة أو نسخ أو تسجيل محتوى الدورة.',
    ],
  },
  {
    icon: XCircle,
    title: 'حالات لا يشملها الاسترداد',
    content: 'لا يتم قبول الاسترداد في حال:',
    list: [
      'مرور أكثر من 7 أيام.',
      'مشاهدة جزء كبير من محتوى الدورة.',
      'مشاركة الحساب مع آخرين.',
      'محاولة نسخ أو نشر المحتوى.',
      'طلب الاسترداد بسبب عدم تحقيق أرباح أو نتائج معينة.',
    ],
  },
  {
    icon: Send,
    title: 'طريقة طلب الاسترداد',
    content: 'يمكنك طلب الاسترداد من خلال قسم تواصل معي في الموقع.',
  },
  {
    icon: CreditCard,
    title: 'تنفيذ الاسترداد',
    content: 'بعد مراجعة الطلب وقبوله، يتم رد المبلغ من خلال وسيلة الدفع الأصلية متى كان ذلك متاحًا.',
    extra: 'قد تختلف مدة وصول المبلغ حسب البنك أو بوابة الدفع.',
  },
  {
    icon: Ban,
    title: 'إلغاء الوصول',
    content: 'عند إتمام الاسترداد، يتم إلغاء وصولك إلى الدورة المرتبطة بعملية الشراء.',
  },
];

export default function RefundContent() {
  const heroRef = useRef<HTMLDivElement>(null);
  const isHeroInView = useScrollAnimation(heroRef as React.RefObject<Element>, { threshold: 0.1, once: true });
  const contentRef = useRef<HTMLDivElement>(null);
  const isContentInView = useScrollAnimation(contentRef as React.RefObject<Element>, { threshold: 0.1, once: true });

  return (
    <main className="min-h-screen">
      {/* Hero Section - matching main site hero style */}
      <section className="relative pt-24 pb-20 md:pt-28 md:pb-24 overflow-hidden bg-white">
        {/* Dark green background card */}
        <div 
          className="absolute top-16 left-4 right-4 bottom-0 md:top-20 md:left-8 md:right-8 xl:left-16 xl:right-16 bg-secondary rounded-2xl"
          style={{ filter: 'drop-shadow(0px 10px 25px rgba(0, 0, 0, 0.35))' }}
        >
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
            <motion.div variants={fadeInUp} className="mb-8">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-accent/60 hover:text-primary transition-colors duration-300 text-sm font-medium"
              >
                <ArrowRight size={16} />
                العودة للصفحة الرئيسية
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="mb-6 flex justify-center">
              <div className="p-4 bg-primary/10 border-2 border-primary/30 rounded-2xl transition-all duration-300">
                <RefreshCw className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-5 leading-tight font-bristone"
            >
              سياسة الاسترداد
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-accent/80 leading-relaxed max-w-2xl mx-auto"
            >
              نسعى في مفتاحك لتقديم تجربة واضحة وعادلة لجميع المستخدمين.
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

            {/* Contact CTA */}
            <motion.div
              variants={fadeInUp}
              className="mt-12 bg-secondary rounded-2xl p-8 md:p-10 text-center relative overflow-hidden border-2 border-[#2e5852]"
              style={{ boxShadow: '0 6px 50px rgba(16, 48, 43, 0.3)' }}
            >
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
                <h3 className="text-2xl font-bold text-primary mb-3 font-bristone">لأي استفسار</h3>
                <p className="text-white/70 mb-6 max-w-md mx-auto">تواصل معنا من خلال قسم تواصل معي</p>
                <Link
                  href="/#contact"
                  className="inline-flex items-center gap-2 bg-primary hover:bg-primary/90 text-secondary font-bold px-8 py-3 rounded-xl transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                >
                  تواصل معنا
                  <ArrowRight size={18} className="rotate-180" />
                </Link>
              </div>
            </motion.div>
          </motion.div>
        </Container>
      </section>
    </main>
  );
}
