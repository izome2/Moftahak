'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Menu, X, Phone, User, ShoppingCart, FileText } from 'lucide-react';
import Button from './ui/Button';
import Container from './ui/Container';
import AuthModal from './auth/AuthModal';
import UserDropdown from './user/UserDropdown';

interface NavLink {
  label: string;
  href: string;
  isPage?: boolean; // true إذا كان الرابط لصفحة منفصلة وليس قسم في الصفحة الرئيسية
}

const Navbar: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOutOfHero, setIsOutOfHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
      
      // Check if we're out of hero section
      const heroSection = document.getElementById('home');
      if (heroSection) {
        const heroBottom = heroSection.offsetTop + heroSection.offsetHeight;
        setIsOutOfHero(window.scrollY > heroBottom - 100);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial check
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks: NavLink[] = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'من أنا', href: '#about' },
    { label: 'الخدمات', href: '#services' },
    { label: 'دراسة الجدوى', href: '/feasibility-request', isPage: true },
    { label: 'المحتوى', href: '#content' },
    { label: 'تواصل معي', href: '#contact' },
  ];

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
    <header
      className={`hidden xl:block fixed z-50 transition-all duration-500 top-3 left-[10%] right-[10%] rounded-2xl ${
        isScrolled
          ? 'bg-[#fdf6ee]/88 backdrop-blur-md shadow-[0_0_25px_rgba(180,130,80,0.30)]'
          : 'bg-transparent shadow-none'
      }`}
    >
      <div className="mx-auto px-3 md:px-4">
        <nav className="flex items-center justify-center h-14 md:h-16 lg:h-14 relative">
          {/* Logo - positioned absolutely on the right */}
          <Link href="/" className="absolute right-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
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
                <span className="absolute top-[calc(100%+4px)] right-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Desktop Actions - positioned absolutely on the left */}
          <div className="hidden xl:flex items-center gap-4 absolute left-0">
            <button
              className="p-2 text-secondary hover:text-primary transition-colors duration-300"
              aria-label="السلة"
            >
              <ShoppingCart size={22} />
            </button>
            {session ? (
              <UserDropdown />
            ) : (
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className="p-2 text-secondary hover:text-primary transition-colors duration-300"
                aria-label="تسجيل الدخول"
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
              تواصل معي
            </Button>
          </div>

          {/* Mobile Menu Button - positioned on the left */}
          <button
            className="xl:hidden p-2 text-secondary hover:text-primary transition-colors absolute left-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="xl:hidden py-6 border-t border-accent animate-in fade-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => handleNavClick(link)}
                  className="text-right font-semibold py-2 transition-colors duration-300 text-secondary hover:text-primary"
                >
                  {link.label}
                </button>
              ))}
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-accent">
              <button
                className="p-2 text-secondary hover:text-primary transition-colors"
                aria-label="السلة"
              >
                <ShoppingCart size={22} />
              </button>
              {session ? (
                <div className="flex-1">
                  <UserDropdown />
                </div>
              ) : (
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className="p-2 text-secondary hover:text-primary transition-colors"
                  aria-label="تسجيل الدخول"
                >
                  <User size={22} />
                </button>
              )}
              <Button
                variant="primary"
                size="md"
                leftIcon={<Phone size={18} />}
                onClick={() => scrollToSection('#contact')}
                className="flex-1"
              >
                تواصل معي
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Auth Modal */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
      />
    </header>
  );
};

export default Navbar;
