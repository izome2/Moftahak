'use client';

import React, { useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { FileText, Globe, UserCog, BookOpen, Wallet, Copyright, ShieldOff, AlertTriangle, RefreshCw, Info, ArrowRight, Mail } from 'lucide-react';
import Container from '@/components/ui/Container';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';

const sections = [
  {
    icon: Globe,
    title: 'استخدام الموقع',
    content: 'يلتزم المستخدم باستخدام الموقع بطريقة قانونية وآمنة، وعدم إساءة استخدام الخدمات أو الإضرار بالموقع أو المستخدمين.',
  },
  {
    icon: UserCog,
    title: 'الحساب',
    list: [
      'قد تحتاج إلى إنشاء حساب للوصول إلى الدورات.',
      'أنت مسؤول عن صحة بياناتك وسرية معلومات الدخول الخاصة بك.',
      'لا يجوز مشاركة الحساب أو بيعه أو استخدامه من أكثر من شخص.',
    ],
  },
  {
    icon: BookOpen,
    title: 'الدورات والمحتوى',
    content: 'الدورات داخل مفتاحك محتوى تعليمي وإرشادي في مجال الشقق الفندقية والإيجارات قصيرة الأجل.',
    extra: 'لا نضمن تحقيق أرباح أو نتائج مالية محددة، لأن النتائج تختلف حسب السوق، التنفيذ، رأس المال، والموقع.',
  },
  {
    icon: Wallet,
    title: 'الدفع والوصول',
    list: [
      'تتم عمليات الدفع من خلال وسائل الدفع المتاحة داخل الموقع.',
      'بعد نجاح الدفع، يتم تفعيل الوصول إلى الدورة داخل حسابك.',
    ],
  },
  {
    icon: Copyright,
    title: 'الملكية الفكرية',
    content: 'جميع محتويات الموقع والدورات مملوكة لمفتاحك أو لعبد الله الخضر.',
    extra: 'لا يجوز نسخ أو تسجيل أو نشر أو بيع أي جزء من المحتوى دون إذن كتابي.',
  },
  {
    icon: ShieldOff,
    title: 'الاستخدام المحظور',
    content: 'يُمنع:',
    list: [
      'مشاركة الحساب.',
      'تسجيل أو تحميل محتوى الدورة.',
      'إعادة نشر أو بيع المحتوى.',
      'محاولة اختراق الموقع.',
      'تقديم بيانات غير صحيحة.',
    ],
    warning: 'قد يؤدي ذلك إلى إيقاف الحساب دون استرداد.',
  },
  {
    icon: RefreshCw,
    title: 'الاسترداد',
    content: 'تخضع طلبات الاسترداد لسياسة الاسترداد المنشورة على الموقع، ويمكن طلب الاسترداد خلال 7 أيام من الشراء وفق الشروط الموضحة.',
    link: { text: 'اطلع على سياسة الاسترداد', href: '/refund' },
  },
  {
    icon: AlertTriangle,
    title: 'إخلاء المسؤولية',
    content: 'المحتوى المقدم تعليمي ولا يعتبر استشارة مالية أو قانونية أو استثمارية ملزمة.',
    extra: 'يتحمل المستخدم مسؤولية قراراته بناءً على ظروفه الخاصة.',
  },
  {
    icon: Info,
    title: 'تحديث الشروط',
    content: 'قد يتم تحديث هذه الشروط عند الحاجة، ويتم نشر النسخة الأحدث على هذه الصفحة.',
  },
];

export default function TermsContent() {
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
                <FileText className="w-10 h-10 text-primary" />
              </div>
            </motion.div>

            <motion.h1
              variants={fadeInUp}
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-primary mb-5 leading-tight font-bristone"
            >
              شروط الخدمة
            </motion.h1>

            <motion.p
              variants={fadeInUp}
              className="text-lg md:text-xl text-accent/80 leading-relaxed max-w-2xl mx-auto"
            >
              باستخدامك لموقع مفتاحك أو شرائك لأي دورة أو خدمة، فإنك توافق على الشروط التالية.
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
                    className={`group bg-[#fff3e6] border border-accent rounded-2xl p-6 md:p-8 shadow-lg hover:shadow-2xl hover:-translate-y-2 transition-all duration-300 ${
                      // Last item (odd count) spans full width
                      index === sections.length - 1 && sections.length % 2 !== 0 ? 'md:col-span-2 md:max-w-md md:mx-auto' : ''
                    }`}
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
                    {section.content && (
                      <p className="text-secondary/70 leading-relaxed text-center">{section.content}</p>
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

                    {section.extra && (
                      <div className="mt-4 p-4 bg-primary/5 rounded-xl border border-primary/15">
                        <p className="text-secondary/60 leading-relaxed text-sm text-center">{section.extra}</p>
                      </div>
                    )}

                    {'warning' in section && section.warning && (
                      <div className="mt-4 p-4 bg-red-50 rounded-xl border border-red-200/50">
                        <p className="text-red-600/80 leading-relaxed text-sm text-center font-medium">
                          ⚠️ {section.warning}
                        </p>
                      </div>
                    )}

                    {'link' in section && section.link && (
                      <div className="mt-4 flex justify-center">
                        <Link
                          href={section.link.href}
                          className="inline-flex items-center gap-2 text-primary hover:text-primary/80 font-bold transition-colors duration-300 text-sm"
                        >
                          {section.link.text}
                          <ArrowRight size={14} className="rotate-180" />
                        </Link>
                      </div>
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
