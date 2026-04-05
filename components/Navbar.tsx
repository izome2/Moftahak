'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X, Phone, User, ShoppingCart, Calculator } from 'lucide-react';
import Button from './ui/Button';
import AuthModal from './auth/AuthModal';
import UserDropdown from './user/UserDropdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';

// الأدوار المسموح لها بالوصول لنظام الحسابات
const ACCOUNTING_ROLES = ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'];

interface NavLink {
  label: string;
  href: string;
  isPage?: boolean; // true إذا كان الرابط لصفحة منفصلة وليس قسم في الصفحة الرئيسية
}

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Listen for custom event to open auth modal from other components
  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    if (isMobileMenuOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        if (!target.closest('nav') && !target.closest('.mobile-menu')) {
          setIsMobileMenuOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [isMobileMenuOpen]);

  const navLinks: NavLink[] = [
    { label: t.nav.home, href: '#home' },
    { label: t.nav.about, href: '#about' },
    { label: t.nav.services, href: '#services' },
    { label: t.nav.courses, href: '#courses' },
    { label: t.nav.feasibility, href: '/feasibility-request', isPage: true },
    { label: t.nav.content, href: '#content' },
    { label: t.nav.contact, href: '#contact' },
  ];

  // إضافة رابط الحسابات إذا كان المستخدم لديه صلاحية
  const hasAccountingAccess = useMemo(() => {
    const role = session?.user?.role;
    return role && ACCOUNTING_ROLES.includes(role);
  }, [session?.user?.role]);

  // رابط الحسابات المناسب لدور المستثمر
  const accountingHref = session?.user?.role === 'INVESTOR' ? '/accounting/my-investments' : '/accounting';

  const handleNavClick = (link: NavLink) => {
    if (link.isPage) {
      // الانتقال لصفحة منفصلة
      router.push(link.href);
    } else {
      // التحقق إذا كنا في الصفحة الرئيسية
      if (window.location.pathname === '/') {
        // التمرير لقسم في الصفحة الرئيسية
        scrollToSection(link.href);
      } else {
        // الانتقال للصفحة الرئيسية مع القسم المطلوب
        router.push('/' + link.href);
      }
    }
    setIsMobileMenuOpen(false);
  };

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <>
      {/* Desktop Navbar */}
      <header
        dir="ltr"
        className={`hidden xl:block fixed z-50 transition-all duration-500 top-3 left-[10%] right-[10%] rounded-2xl ${
          isScrolled
            ? 'bg-[#fdf6ee]/88 backdrop-blur-md shadow-[0_0_25px_rgba(180,130,80,0.30)]'
            : 'bg-transparent shadow-none'
        }`}
      >
        <div className="mx-auto px-3 md:px-4">
          <nav className="flex items-center justify-center h-14 md:h-16 lg:h-14 relative">
            {/* Logo - positioned absolutely on the right */}
            <Link href="/" className="absolute end-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
              <span className="text-lg font-bold text-secondary font-bristone hidden sm:block">
                MOFTAHAK
              </span>
              <div className="relative w-8 h-8">
                <Image
                  src="/logos/logo-dark-icon.png"
                  alt="مفتاحك"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
            </Link>

            {/* Desktop Navigation - Centered */}
            <div className="hidden xl:flex items-center gap-8">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link)}
                  className={`font-semibold text-base transition-colors duration-300 relative group ${
                    link.isPage 
                      ? 'text-secondary hover:text-primary' 
                      : 'text-secondary hover:text-primary'
                  }`}
                >
                  {link.label}
                  <span className="absolute top-[calc(100%+4px)] end-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </button>
              ))}
              {hasAccountingAccess && (
                <Link
                  href={accountingHref}
                  className="font-semibold text-base transition-colors duration-300 relative group text-secondary hover:text-primary flex items-center gap-1.5"
                >
                  <Calculator size={16} />
                  {t.nav.accounting}
                  <span className="absolute top-[calc(100%+4px)] end-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
                </Link>
              )}
            </div>

            {/* Desktop Actions - positioned absolutely on the left */}
            <div className="hidden xl:flex items-center gap-4 absolute start-0">
              <button
                onClick={toggleLanguage}
                className="px-2.5 py-1 text-sm font-bold text-secondary hover:text-primary transition-colors duration-300 border border-secondary/20 rounded-lg hover:border-primary/40"
                aria-label="Switch language"
              >
                {language === 'ar' ? 'EN' : 'AR'}
              </button>
              <button
                className="p-2 text-secondary hover:text-primary transition-colors duration-300"
                aria-label={t.nav.cart}
              >
                <ShoppingCart size={22} />
              </button>
              {session ? (
                <UserDropdown />
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2 text-secondary hover:text-primary transition-colors duration-300"
                  aria-label={t.nav.login}
                >
                  <User size={22} />
                </button>
              )}
              <Button
                variant="primary"
                size="sm"
                leftIcon={<Phone size={16} />}
                onClick={() => scrollToSection('#contact')}
                className="shadow-none"
              >
                {t.nav.contactMe}
              </Button>
            </div>
          </nav>
        </div>
      </header>

      {/* Mobile & Tablet Navbar */}
      <header
        dir="ltr"
        className={`xl:hidden fixed z-50 w-full transition-all duration-300 ${
          isScrolled
            ? 'top-3 px-3'
            : 'top-0 px-0'
        }`}
      >
        <nav
          className={`transition-all duration-300 ${
            isScrolled
              ? 'bg-[#fdf6ee]/95 backdrop-blur-md shadow-[0_0_20px_rgba(180,130,80,0.25)] rounded-2xl'
              : 'bg-[#fdf6ee]/70 backdrop-blur-sm shadow-sm'
          }`}
        >
          <div className="flex items-center justify-between h-16 px-4 md:px-6">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity z-10">
              <div className="relative w-9 h-9">
                <Image
                  src="/logos/logo-dark-icon.png"
                  alt="مفتاحك"
                  fill
                  className="object-contain"
                  priority
                />
              </div>
              <span className="text-base md:text-lg font-bold text-secondary font-bristone">
                MOFTAHAK
              </span>
            </Link>

            {/* Mobile Actions */}
            <div className="flex items-center gap-2 z-10">
              <button
                onClick={(e) => { e.stopPropagation(); toggleLanguage(); }}
                className="px-2 py-1 text-xs font-bold text-secondary hover:text-primary transition-colors rounded-lg hover:bg-primary/10 border border-secondary/20"
                aria-label="Switch language"
              >
                {language === 'ar' ? 'EN' : 'AR'}
              </button>
              <button
                className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                aria-label={t.nav.cart}
                onClick={(e) => e.stopPropagation()}
              >
                <ShoppingCart size={22} />
              </button>
              
              {session ? (
                <div onClick={(e) => e.stopPropagation()}>
                  <UserDropdown />
                </div>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsAuthModalOpen(true);
                  }}
                  className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                  aria-label={t.nav.login}
                >
                  <User size={22} />
                </button>
              )}

              <button
                className="p-2 text-secondary hover:text-primary transition-colors rounded-lg hover:bg-primary/10"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMobileMenuOpen(!isMobileMenuOpen);
                }}
                aria-label={t.nav.menu}
              >
                {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
              </button>
            </div>
          </div>

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-menu border-t border-accent/30 animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 md:px-6 py-4 space-y-1">
                {navLinks.map((link) => (
                  <button
                    key={link.href}
                    onClick={() => handleNavClick(link)}
                    className="w-full text-right font-semibold py-3 px-4 transition-all duration-200 text-secondary hover:text-primary hover:bg-primary/5 rounded-lg flex items-center justify-end gap-2"
                  >
                    {link.label}
                  </button>
                ))}
                
                {hasAccountingAccess && (
                  <Link
                    href={accountingHref}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="w-full text-right font-semibold py-3 px-4 transition-all duration-200 text-secondary hover:text-primary hover:bg-primary/5 rounded-lg flex items-center justify-end gap-2"
                  >
                    {t.nav.accounting}
                    <Calculator size={18} />
                  </Link>
                )}

                <div className="pt-3 mt-3 border-t border-accent/30">
                  <Button
                    variant="primary"
                    size="md"
                    leftIcon={<Phone size={18} />}
                    onClick={() => scrollToSection('#contact')}
                    className="w-full justify-center"
                  >
                    {t.nav.contactMe}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </nav>
      </header>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </>
  );
};

export default Navbar;
