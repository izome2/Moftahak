'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  Facebook, 
  Instagram, 
  Youtube, 
  Linkedin, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin 
} from 'lucide-react';
import Container from './ui/Container';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    quick: [
      { label: 'الرئيسية', href: '#home' },
      { label: 'من أنا', href: '#about' },
      { label: 'الخدمات', href: '#services' },
      { label: 'المحتوى', href: '#content' },
      { label: 'تواصل معي', href: '#contact' },
    ],
    services: [
      { label: 'استشارات فردية', href: '#services' },
      { label: 'برامج تدريبية', href: '#services' },
      { label: 'إدارة كاملة', href: '#services' },
      { label: 'محتوى تعليمي', href: '#content' },
      { label: 'شراكات', href: '#contact' },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: 'https://facebook.com', label: 'Facebook' },
    { icon: Instagram, href: 'https://instagram.com', label: 'Instagram' },
    { icon: Youtube, href: 'https://youtube.com', label: 'YouTube' },
    { icon: Linkedin, href: 'https://linkedin.com', label: 'LinkedIn' },
    { icon: Twitter, href: 'https://twitter.com', label: 'Twitter' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <footer className="bg-secondary text-white relative overflow-hidden">
      {/* Pattern Background */}
      <div 
        className="absolute inset-0 opacity-5"
        style={{
          backgroundImage: 'url(/patterns/pattern-horizontal-white.png)',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      <Container className="relative z-10">
        {/* Main Footer Content */}
        <div className="py-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Column 1: About & Logo */}
          <div className="space-y-6">
            <Link href="/" className="inline-block">
              <div className="flex items-center gap-3">
                <div className="relative w-12 h-12">
                  <Image
                    src="/logos/logo-white.png"
                    alt="مفتاحك"
                    fill
                    className="object-contain"
                  />
                </div>
                <span className="text-2xl font-bold text-primary font-bristone">
                  مفتاحك
                </span>
              </div>
            </Link>
            <p className="text-white/70 leading-relaxed">
              عبد الله الخضر - مستشارك في مجال الإيجارات قصيرة المدى والشقق الفندقية
            </p>
            {/* Social Media Icons */}
            <div className="flex items-center gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-white/10 backdrop-blur-sm flex items-center justify-center hover:bg-primary hover:text-secondary transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon size={18} />
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">روابط سريعة</h3>
            <ul className="space-y-3">
              {footerLinks.quick.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-primary transition-colors duration-300 text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Services */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">الخدمات</h3>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <button
                    onClick={() => scrollToSection(link.href)}
                    className="text-white/70 hover:text-primary transition-colors duration-300 text-right"
                  >
                    {link.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Contact Info */}
          <div>
            <h3 className="text-xl font-bold mb-6 text-primary">تواصل معنا</h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Mail size={20} className="text-primary shrink-0 mt-1" />
                <a 
                  href="mailto:info@abdallahalkhedr.com"
                  className="text-white/70 hover:text-primary transition-colors duration-300"
                >
                  info@abdallahalkhedr.com
                </a>
              </li>
              <li className="flex items-start gap-3">
                <Phone size={20} className="text-primary shrink-0 mt-1" />
                <a 
                  href="tel:+20123456789"
                  className="text-white/70 hover:text-primary transition-colors duration-300"
                  dir="ltr"
                >
                  +20 123 456 789
                </a>
              </li>
              <li className="flex items-start gap-3">
                <MapPin size={20} className="text-primary shrink-0 mt-1" />
                <span className="text-white/70">القاهرة، مصر</span>
              </li>
              <li className="text-sm text-white/60 italic">
                متوفر من السبت للخميس
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="py-6 border-t border-white/10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-white/60 text-sm">
              © {currentYear} عبد الله الخضر - مفتاحك. جميع الحقوق محفوظة
            </p>
            <div className="flex items-center gap-6">
              <Link 
                href="/privacy" 
                className="text-white/60 hover:text-primary text-sm transition-colors duration-300"
              >
                سياسة الخصوصية
              </Link>
              <Link 
                href="/terms" 
                className="text-white/60 hover:text-primary text-sm transition-colors duration-300"
              >
                الشروط والأحكام
              </Link>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  );
};

export default Footer;
