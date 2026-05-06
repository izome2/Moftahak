'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X, Phone, User, Calculator, Clock } from 'lucide-react';
import Button from './ui/Button';
import AuthModal from './auth/AuthModal';
import UserDropdown from './user/UserDropdown';
import { useLanguage } from '@/contexts/LanguageContext';
import { useTranslation } from '@/hooks/useTranslation';
import {
  airbnbLandingContent,
  getDiscountCountdownParts,
  type DiscountCountdownParts,
} from '@/lib/courses/airbnb-landing';

// الأدوار المسموح لها بالوصول لنظام الحسابات
const ACCOUNTING_ROLES = ['GENERAL_MANAGER', 'OPS_MANAGER', 'BOOKING_MANAGER', 'INVESTOR'];

interface NavLink {
  label: string;
  href: string;
  isPage?: boolean; // true إذا كان الرابط لصفحة منفصلة وليس قسم في الصفحة الرئيسية
}

interface NavbarProps {
  variant?: 'default' | 'airbnbLanding';
}

function AirbnbCountdownUnit({ value, label }: { value: number; label: string }) {
  return (
    <div className="min-w-[42px] text-center sm:min-w-[50px] xl:min-w-[58px]">
      <p className="font-bristone text-[1.35rem] font-bold leading-none text-secondary sm:text-2xl xl:text-[1.65rem]">
        {String(value).padStart(2, '0')}
      </p>
      <p className="mt-1 text-[11px] font-bold leading-none text-secondary/68 sm:text-xs">{label}</p>
    </div>
  );
}

function AirbnbNavbarCountdown({ parts }: { parts: DiscountCountdownParts }) {
  return (
    <div
      dir="rtl"
      className="airbnb-countdown-strip relative isolate overflow-hidden border-t border-secondary/10 px-3 pb-3 pt-2 sm:px-5 xl:px-6 xl:pb-3.5 xl:pt-2.5"
    >
      <span aria-hidden="true" className="airbnb-countdown-glow airbnb-countdown-glow-orange" />
      <span aria-hidden="true" className="airbnb-countdown-glow airbnb-countdown-glow-green" />
      <div className="relative z-10 flex items-center justify-between gap-3 text-secondary xl:justify-center xl:gap-7">
        <div className="flex shrink-0 items-center gap-2 text-start">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-secondary/8 text-secondary xl:h-9 xl:w-9">
            <Clock className="h-4 w-4 xl:h-5 xl:w-5" />
          </span>
          <div>
            <p className="text-base font-black leading-tight text-secondary sm:text-lg xl:text-xl">
              تبقّى على نهاية الخصم
            </p>
            <p className="text-xs font-bold leading-tight text-secondary/58 sm:text-sm">
              العرض ينتهي قريبًا
            </p>
          </div>
        </div>
        <div
          className="flex min-w-0 flex-1 items-center justify-end gap-1.5 sm:gap-3 xl:flex-none xl:justify-center xl:gap-4"
          aria-label="تبقى على نهاية الخصم"
        >
          <AirbnbCountdownUnit value={parts.seconds} label="ثانية" />
          <AirbnbCountdownUnit value={parts.minutes} label="دقيقة" />
          <AirbnbCountdownUnit value={parts.hours} label="ساعة" />
          <AirbnbCountdownUnit value={parts.days} label="يوم" />
        </div>
      </div>
    </div>
  );
}

const Navbar: React.FC<NavbarProps> = ({ variant = 'default' }) => {
  const { data: session } = useSession();
  const router = useRouter();
  const { language, toggleLanguage } = useLanguage();
  const t = useTranslation();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHidden, setIsHidden] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [airbnbCountdown, setAirbnbCountdown] = useState<{ now: Date; endsAt: Date } | null>(null);
  const lastScrollYRef = useRef(0);
  const isAirbnbLanding = variant === 'airbnbLanding';
  const shouldHideNav = isAirbnbLanding && isHidden && !isMobileMenuOpen;
  const airbnbCountdownParts = airbnbCountdown
    ? getDiscountCountdownParts(airbnbCountdown.now, airbnbCountdown.endsAt)
    : { days: 0, hours: 0, minutes: 0, seconds: 0 };

  // Listen for custom event to open auth modal from other components
  useEffect(() => {
    const handleOpenAuth = () => setIsAuthModalOpen(true);
    window.addEventListener('open-auth-modal', handleOpenAuth);
    return () => window.removeEventListener('open-auth-modal', handleOpenAuth);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = Math.max(window.scrollY, 0);
      const scrollDelta = currentScrollY - lastScrollYRef.current;

      setIsScrolled(currentScrollY > 20);

      if (isAirbnbLanding) {
        if (currentScrollY < 24 || isMobileMenuOpen) {
          setIsHidden(false);
        } else if (Math.abs(scrollDelta) > 8) {
          setIsHidden(scrollDelta > 0);
        }
      }

      lastScrollYRef.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, [isAirbnbLanding, isMobileMenuOpen]);

  useEffect(() => {
    if (!isAirbnbLanding) return;

    const endDate = new Date(Date.now() + airbnbLandingContent.discountDurationMs);
    const updateCountdown = () => {
      setAirbnbCountdown({ now: new Date(), endsAt: endDate });
    };

    updateCountdown();
    const interval = window.setInterval(updateCountdown, 1000);

    return () => window.clearInterval(interval);
  }, [isAirbnbLanding]);

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
  const mobileNavLinks = navLinks.filter((link) => link.href !== '#contact');

  // إضافة رابط الحسابات إذا كان المستخدم لديه صلاحية
  const hasAccountingAccess = useMemo(() => {
    const role = session?.user?.role;
    return role && ACCOUNTING_ROLES.includes(role);
  }, [session?.user?.role]);

  // رابط الحسابات المناسب لدور المستثمر
  const accountingHref = session?.user?.role === 'INVESTOR' ? '/accounting/my-investments' : '/accounting';

  // اسم القسم حسب دور المستخدم
  const accountingLabel = useMemo(() => {
    const role = session?.user?.role;
    if (role && t.nav.accountingByRole[role]) return t.nav.accountingByRole[role];
    return t.nav.accounting;
  }, [session?.user?.role, t]);

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
          shouldHideNav ? '-translate-y-[calc(100%+1.5rem)] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } ${
          isAirbnbLanding
            ? 'bg-[#fdf6ee]/95 backdrop-blur-md shadow-[0_0_25px_rgba(180,130,80,0.30)]'
            : isScrolled
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
                  {accountingLabel}
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
          {isAirbnbLanding && <AirbnbNavbarCountdown parts={airbnbCountdownParts} />}
        </div>
      </header>

      {/* Mobile & Tablet Navbar */}
      <header
        dir="ltr"
        className={`xl:hidden fixed z-50 w-full transition-all duration-300 ${
          shouldHideNav ? '-translate-y-[calc(100%+1.25rem)] opacity-0 pointer-events-none' : 'translate-y-0 opacity-100'
        } ${
          isScrolled
            ? 'top-3 px-3'
            : 'top-0 px-0'
        }`}
      >
        <nav
          className={`transition-all duration-300 ${
            isAirbnbLanding
              ? `bg-[#fdf6ee]/95 backdrop-blur-md shadow-[0_0_20px_rgba(180,130,80,0.25)] ${isScrolled ? 'rounded-2xl' : ''}`
              : isScrolled
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
          {isAirbnbLanding && <AirbnbNavbarCountdown parts={airbnbCountdownParts} />}

          {/* Mobile Menu Dropdown */}
          {isMobileMenuOpen && (
            <div 
              className="mobile-menu border-t border-accent/30 animate-in fade-in slide-in-from-top-2 duration-200"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="px-4 md:px-6 py-4 space-y-1">
                {mobileNavLinks.map((link) => (
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
                    {accountingLabel}
                    <Calculator size={18} />
                  </Link>
                )}

                <div className="pt-3 mt-3 border-t border-accent/30">
                  <div dir="rtl" className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2">
                    <Button
                      variant="primary"
                      size="md"
                      leftIcon={<Phone size={18} />}
                      onClick={() => scrollToSection('#contact')}
                      className="w-full justify-center"
                    >
                      {t.nav.contactMe}
                    </Button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLanguage();
                      }}
                      className="flex h-11 min-w-12 items-center justify-center rounded-xl border border-secondary/20 bg-white/55 px-3 text-sm font-bold text-secondary transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                      aria-label="Switch language"
                    >
                      {language === 'ar' ? 'EN' : 'AR'}
                    </button>
                    {session ? (
                      <div
                        className="flex h-11 min-w-12 items-center justify-center rounded-xl border border-secondary/20 bg-white/55 px-1 text-secondary transition-colors hover:border-primary/40 hover:bg-primary/10"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <UserDropdown />
                      </div>
                    ) : (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsMobileMenuOpen(false);
                          setIsAuthModalOpen(true);
                        }}
                        className="flex h-11 min-w-12 items-center justify-center rounded-xl border border-secondary/20 bg-white/55 px-3 text-secondary transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                        aria-label={t.nav.login}
                      >
                        <User size={20} />
                      </button>
                    )}
                  </div>
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
