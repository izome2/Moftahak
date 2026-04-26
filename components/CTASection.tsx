'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import { Mail, ArrowLeft, Sparkles, TrendingUp, CheckCircle2, User, MessageSquare, Facebook, Instagram, Linkedin, Phone, MapPin, Loader2 } from 'lucide-react';
import { FaTiktok } from 'react-icons/fa';
import Container from './ui/Container';
import Input from './ui/Input';
import Button from './ui/Button';
import { fadeInUp, staggerContainer } from '@/lib/animations/variants';
import { useScrollAnimation } from '@/hooks/useScrollAnimation';
import { useTranslation } from '@/hooks/useTranslation';
import { useLanguage } from '@/contexts/LanguageContext';

const CTASection: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useScrollAnimation(ref as React.RefObject<Element>, { threshold: 0.1, rootMargin: '0px 0px 200px 0px', once: true });
  const { data: session } = useSession();
  const t = useTranslation();
  const { language } = useLanguage();
  const isRTL = language === 'ar';
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    message: '',
  });
  
  // تحويل رقم الهاتف الدولي إلى محلي (إزالة رمز الدولة)
  const formatPhoneToLocal = (phone: string): string => {
    if (!phone) return '';
    // مصر: 20 -> 0
    if (phone.startsWith('20') && phone.length === 12) {
      return '0' + phone.slice(2);
    }
    // السعودية: 966 -> 0
    if (phone.startsWith('966') && phone.length === 12) {
      return '0' + phone.slice(3);
    }
    // إذا كان يبدأ بـ + نزيله ونحوله
    if (phone.startsWith('+20')) {
      return '0' + phone.slice(3);
    }
    if (phone.startsWith('+966')) {
      return '0' + phone.slice(4);
    }
    return phone;
  };

  // تعبئة بيانات المستخدم تلقائياً إذا كان مسجلاً
  useEffect(() => {
    if (session?.user) {
      setFormData(prev => ({
        ...prev,
        firstName: session.user.firstName || '',
        lastName: session.user.lastName || '',
        // إضافة رقم الهاتف إذا كان مسجلاً به (محول للصيغة المحلية)
        phone: formatPhoneToLocal(session.user.phone || ''),
      }));
    }
  }, [session]);
  
  // حالات الإرسال
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const footerLinks = {
    quick: [
      { label: t.cta.quickLinkItems[0], href: '#home' },
      { label: t.cta.quickLinkItems[1], href: '#about' },
      { label: t.cta.quickLinkItems[2], href: '#services' },
      { label: t.cta.quickLinkItems[3], href: '#content' },
      { label: t.cta.quickLinkItems[4], href: '#contact' },
    ],
    services: [
      { label: t.cta.serviceItems[0], href: '#services' },
      { label: t.cta.serviceItems[1], href: '#services' },
      { label: t.cta.serviceItems[2], href: '#services' },
      { label: t.cta.serviceItems[3], href: '#content' },
      { label: t.cta.serviceItems[4], href: '#contact' },
    ],
  };

  const socialLinks = [
    { icon: FaTiktok, href: 'https://www.tiktok.com/@abdullahelkhedr', label: 'TikTok' },
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitError('');
    
    try {
      const response = await fetch('/api/consultations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'حدث خطأ أثناء الإرسال');
      }
      
      setSubmitSuccess(true);
      setFormData({ firstName: '', lastName: '', phone: '', message: '' });
      
      // إخفاء رسالة النجاح بعد 5 ثوان
      setTimeout(() => setSubmitSuccess(false), 5000);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : 'حدث خطأ غير متوقع');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <section className="pt-24 relative overflow-visible bg-linear-to-b from-[#fdf6ee] via-[#f5e6d3] to-[#f0dcc4]" id="contact">
      {}
      <div className="absolute inset-0" style={{ bottom: '0' }}>
        <div className="absolute inset-0" style={{
          backgroundImage: 'url(/patterns/pattern-vertical-white.png)',
          backgroundSize: 'cover',
          backgroundRepeat: 'no-repeat',
          backgroundPosition: 'center',
          opacity: 0.4,
          maskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, black 100%)',
          WebkitMaskImage: 'linear-gradient(to bottom, transparent 0%, black 30%, black 70%, black 100%)'
        }} />
      </div>

      {}
      <div className="absolute inset-x-0 top-0" style={{ bottom: '0', background: 'linear-gradient(to bottom, white 0%, #f5e6d3 40%, #f0dcc4 70%, #f0dcc4 100%)', zIndex: -1 }} />

      <Container className="relative z-10 pb-8">
        <motion.div 
          ref={ref}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={staggerContainer}
          className="max-w-7xl mx-auto relative"
        >
          
          <motion.div 
            variants={fadeInUp}
            className="relative"
          >
          {/* Contact SVG background */}
          <div className={`absolute top-0 ${isRTL ? 'right-0' : 'left-0'} w-67 h-33 z-20`} style={{ transform: `translateY(-70%)${!isRTL ? ' scaleX(-1)' : ''}` }}>
            <img src="/images/contact.svg" alt="" className="w-full h-full" />
          </div>
          
          {/* Contact icon + title */}
          <div className={`absolute top-0 ${isRTL ? 'right-6 md:right-8' : 'left-6 md:left-8'} z-30 flex items-center gap-2`} style={{ transform: 'translateY(-80%)' }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-secondary">
              <path d="M22 17a2 2 0 0 1-2 2H6.828a2 2 0 0 0-1.414.586l-2.202 2.202A.71.71 0 0 1 2 21.286V5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2z"></path>
            </svg>
            <h3 className="text-3xl md:text-3xl font-bold text-secondary">
              {t.cta.sectionTitle}
            </h3>
          </div>
          
          <div className={`lg:overflow-hidden lg:border-2 lg:border-[#e8cebc] ${isRTL ? 'lg:rounded-[1.5rem_0_1.5rem_1.5rem]' : 'lg:rounded-[0_1.5rem_1.5rem_1.5rem]'} lg:shadow-[0_0_40px_rgba(212,165,116,0.5)]`}>
            <style jsx>{`
              @media (min-width: 1024px) {
                .contact-card-wrapper {
                  box-shadow: none !important;
                }
              }
            `}</style>
            <div className="contact-card-wrapper grid grid-cols-1 lg:grid-cols-7 gap-6 lg:gap-0">
            {}
            <div 
              className="lg:col-span-4 p-5 md:p-6 lg:p-8 border-2 border-[#e8cebc] lg:border-0 rounded-bl-2xl rounded-br-2xl rounded-tl-2xl lg:rounded-none shadow-[0_0_40px_rgba(212,165,116,0.5)] lg:shadow-none" 
              style={{ background: 'linear-gradient(45deg, #f8f0ea, #faeee6)' }}
            >
              <motion.div variants={fadeInUp} className="mb-2">
                <p className="text-secondary/60">
                  {t.cta.formSubtitle}
                </p>
              </motion.div>

              <motion.form 
                variants={staggerContainer}
                onSubmit={handleSubmit} 
                className="space-y-3"
              >
                <motion.div variants={fadeInUp} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    type="text"
                    name="firstName"
                    placeholder={t.cta.firstName}
                    value={formData.firstName}
                    onChange={handleInputChange}
                    leftIcon={<User size={20} />}
                    className="bg-[#fffffff1] border border-primary/20 focus:border-primary rounded-xl h-12"
                    required
                  />
                  <Input
                    type="text"
                    name="lastName"
                    placeholder={t.cta.lastName}
                    value={formData.lastName}
                    onChange={handleInputChange}
                    leftIcon={<User size={20} />}
                    className="bg-[#fffffff1] border border-primary/20 focus:border-primary rounded-xl h-12"
                    required
                  />
                </motion.div>
                
                <motion.div variants={fadeInUp}>
                  <Input
                    type="tel"
                    name="phone"
                    placeholder={t.cta.phone}
                    value={formData.phone}
                    onChange={handleInputChange}
                    rightIcon={<Phone size={20} />}
                    className="bg-[#fffffff1] border border-primary/20 focus:border-primary rounded-xl h-12 text-right"
                    required
                    dir="ltr"
                  />
                </motion.div>

                <motion.div variants={fadeInUp} className="relative">
                  <MessageSquare size={20} className="absolute right-3 top-3 text-secondary/40 z-10" />
                  <textarea
                    name="message"
                    placeholder={t.cta.message}
                    value={formData.message}
                    onChange={handleInputChange}
                    rows={4}
                    className="w-full pr-10 pl-4 py-3 bg-[#fdf6ee] border border-primary/20 focus:border-primary rounded-xl text-secondary placeholder:text-secondary/40 focus:outline-none transition-all resize-none"
                    required
                  />
                </motion.div>

                {/* رسائل النجاح والخطأ */}
                <AnimatePresence>
                  {submitSuccess && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-green-100 border border-green-300 rounded-xl text-green-700"
                    >
                      <CheckCircle2 className="w-5 h-5" />
                      <span className="text-sm">{t.cta.successMessage}</span>
                    </motion.div>
                  )}
                  {submitError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="flex items-center gap-2 p-3 bg-red-100 border border-red-300 rounded-xl text-red-700"
                    >
                      <span className="text-sm">{submitError}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                <motion.div variants={fadeInUp} className="flex justify-start">
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    disabled={isSubmitting}
                    className="bg-secondary hover:bg-secondary/90 text-primary hover:shadow-xl transition-all duration-300 h-11 rounded-xl font-bold px-8 disabled:opacity-50 disabled:cursor-not-allowed"
                    rightIcon={isSubmitting ? <Loader2 size={20} className="animate-spin" /> : <ArrowLeft size={20} />}
                  >
                    {isSubmitting ? t.cta.sending : t.cta.sendMessage}
                  </Button>
                </motion.div>

                <motion.p variants={fadeInUp} className="text-xs text-secondary/50 text-center mt-3">
                  {t.cta.privacy}
                </motion.p>
              </motion.form>
            </div>

            {}
            <div 
              className="lg:col-span-3 flex flex-col justify-center items-center text-center space-y-8 p-5 md:p-6 lg:p-8 border-2 border-[#e8cebc] lg:border-0 rounded-2xl lg:rounded-none shadow-[0_0_40px_rgba(212,165,116,0.5)] lg:shadow-none" 
              style={{ background: 'linear-gradient(125deg, #f9f1ea, #fcf7f2)' }}
            >
              <motion.div variants={fadeInUp}>
                {}
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-secondary mb-3 leading-tight">
                  {t.cta.readyTitle}
                  <br />
                  <span className="text-transparent bg-clip-text bg-linear-to-l from-[#c98f4d] via-[#c59766] to-[#c98f4d]">
                    {t.cta.readyHighlight}
                  </span>
                </h2>

                {}
                <p className="hidden lg:block text-base md:text-lg text-secondary/70 leading-relaxed">
                  {t.cta.readySubtitle}
                </p>
              </motion.div>

              {}
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-3 gap-3 lg:gap-2 w-full"
              >
                <motion.div variants={fadeInUp} className="flex items-center gap-3 lg:gap-2 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl p-4 lg:p-2 border border-primary/20">
                  <CheckCircle2 className="text-primary shrink-0" size={24} />
                  <span className="text-secondary font-medium text-base lg:text-xs">{t.cta.freeConsultation}</span>
                </motion.div>
                <motion.div variants={fadeInUp} className="flex items-center gap-3 lg:gap-2 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl p-4 lg:p-2 border border-primary/20">
                  <TrendingUp className="text-primary shrink-0" size={24} />
                  <span className="text-secondary font-medium text-base lg:text-xs">{t.cta.customPlan}</span>
                </motion.div>
                <motion.div variants={fadeInUp} className="flex items-center gap-3 lg:gap-2 bg-linear-to-br from-primary/10 to-primary/5 rounded-xl p-4 lg:p-2 border border-primary/20">
                  <Sparkles className="text-primary shrink-0" size={24} />
                  <span className="text-secondary font-medium text-base lg:text-xs">{t.cta.continuousSupport}</span>
                </motion.div>
              </motion.div>

              {}
              <motion.div 
                variants={staggerContainer}
                className="grid grid-cols-3 gap-8 pt-6 border-t-2 border-primary/10"
              >
                <motion.div variants={fadeInUp} className="text-center group">
                  <div className="text-2xl md:text-3xl font-bold bg-linear-to-l from-primary via-[#d4a574] to-primary bg-clip-text text-transparent mb-1 font-bristone group-hover:scale-110 transition-transform duration-300">
                    50+
                  </div>
                  <div className="text-secondary/70 text-sm font-medium">{t.cta.happyClients}</div>
                </motion.div>
                <motion.div variants={fadeInUp} className="text-center group">
                  <div className="text-2xl md:text-3xl font-bold bg-linear-to-l from-primary via-[#d4a574] to-primary bg-clip-text text-transparent mb-1 font-bristone group-hover:scale-110 transition-transform duration-300">
                    100+
                  </div>
                  <div className="text-secondary/70 text-sm font-medium">{t.cta.developedUnits}</div>
                </motion.div>
                <motion.div variants={fadeInUp} className="text-center group">
                  <div className="text-2xl md:text-3xl font-bold bg-linear-to-l from-primary via-[#d4a574] to-primary bg-clip-text text-transparent mb-1 font-bristone group-hover:scale-110 transition-transform duration-300">
                    4.9/5
                  </div>
                  <div className="text-secondary/70 text-sm font-medium">{t.cta.rating}</div>
                </motion.div>
              </motion.div>
            </div>
          </div>
          </div>
          </motion.div>

        {}
        <motion.div 
          variants={fadeInUp}
          className="mt-32 max-w-7xl mx-auto"
        >
          <div className="bg-secondary text-white rounded-2xl relative overflow-hidden border-2 border-[#2e5852]" style={{ boxShadow: '0 6px 50px rgba(16, 48, 43, 0.5)' }}>
            <div className="relative z-10">
              {}
              <motion.div 
                variants={staggerContainer}
                className="py-12 px-8 md:px-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
              >
                {}
                <motion.div variants={fadeInUp} className="space-y-4">
                  <Link href="/" className="inline-block">
                    <div className="flex items-center gap-3">
                      <div className="relative w-10 h-10">
                        <Image
                          src="/logos/logo-white.png"
                          alt="مفتاحك"
                          fill
                          className="object-contain"
                        />
                      </div>
                      <span className="text-xl font-bold text-primary font-bristone">
                        {t.cta.footerBrand}
                      </span>
                    </div>
                  </Link>
                  <p className="text-white/70 leading-relaxed text-sm">
                    {t.cta.footerDescription}
                  </p>
                  {}
                  <div className="flex items-center gap-2">
                    {socialLinks.map((social) => (
                      <a
                        key={social.label}
                        href={social.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-9 h-9 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-secondary transition-all duration-300 hover:scale-110"
                        aria-label={social.label}
                      >
                        <social.icon size={16} />
                      </a>
                    ))}
                  </div>
                </motion.div>

                {}
                <motion.div variants={fadeInUp} className="hidden lg:block">
                  <h3 className="text-lg font-bold mb-4 text-primary">{t.cta.quickLinks}</h3>
                  <ul className="space-y-2">
                    {footerLinks.quick.map((link) => (
                      <li key={link.label}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-white/70 hover:text-primary transition-colors duration-300 text-right text-sm"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {}
                <motion.div variants={fadeInUp} className="hidden lg:block">
                  <h3 className="text-lg font-bold mb-4 text-primary">{t.cta.servicesTitle}</h3>
                  <ul className="space-y-2">
                    {footerLinks.services.map((link) => (
                      <li key={link.label}>
                        <button
                          onClick={() => scrollToSection(link.href)}
                          className="text-white/70 hover:text-primary transition-colors duration-300 text-right text-sm"
                        >
                          {link.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </motion.div>

                {}
                <motion.div variants={fadeInUp}>
                  <h3 className="text-lg font-bold mb-4 text-primary">{t.cta.contactUs}</h3>
                  <ul className="space-y-3">
                    <li className="flex items-start gap-2">
                      <Mail size={18} className="text-primary shrink-0 mt-1" />
                      <a 
                        href="mailto:abdullah.she7ata@gmail.com"
                        className="text-white/70 hover:text-primary transition-colors duration-300 text-sm"
                      >
                        info@moftahak.com
                      </a>
                    </li>
                    <li className="flex items-start gap-2">
                      <Phone size={18} className="text-primary shrink-0 mt-1" />
                      <a 
                        href="tel:+201091507717"
                        className="text-white/70 hover:text-primary transition-colors duration-300 text-sm"
                        dir="ltr"
                      >
                        +20 109 150 7717
                      </a>
                    </li>
                    <li className="flex items-start gap-2">
                      <MapPin size={18} className="text-primary shrink-0 mt-1" />
                      <span className="text-white/70 text-sm">{t.cta.location}</span>
                    </li>
                  </ul>
                </motion.div>
              </motion.div>

              {}
              <motion.div 
                variants={fadeInUp}
                className="py-4 px-8 md:px-12 border-t border-white/10"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                  <p className="text-white/60 text-xs">
                    {t.cta.copyright(currentYear)}
                  </p>
                  <div className="flex items-center gap-4">
                    <Link 
                      href="/privacy" 
                      className="text-white/60 hover:text-primary text-xs transition-colors duration-300"
                    >
                      {t.cta.privacyPolicy}
                    </Link>
                    <Link 
                      href="/refund" 
                      className="text-white/60 hover:text-primary text-xs transition-colors duration-300"
                    >
                      {t.cta.refundPolicy}
                    </Link>
                    <Link 
                      href="/terms" 
                      className="text-white/60 hover:text-primary text-xs transition-colors duration-300"
                    >
                      {t.cta.terms}
                    </Link>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
        </motion.div>
      </Container>
    </section>
  );
};

export default CTASection;
