'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, User, ShoppingCart } from 'lucide-react';
import Button from './ui/Button';
import Container from './ui/Container';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isOutOfHero, setIsOutOfHero] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

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

  const navLinks = [
    { label: 'الرئيسية', href: '#home' },
    { label: 'من أنا', href: '#about' },
    { label: 'الخدمات', href: '#services' },
    { label: 'المحتوى', href: '#content' },
    { label: 'تواصل معي', href: '#contact' },
  ];

  const scrollToSection = (href: string) => {
    const element = document.querySelector(href);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
      setIsMobileMenuOpen(false);
    }
  };

  return (
    <header
      className={`fixed z-50 transition-all duration-500 top-3 left-[10%] right-[10%] rounded-2xl ${
        isScrolled
          ? 'bg-[#fdf6ee]/88 backdrop-blur-md shadow-[0_0_25px_rgba(180,130,80,0.30)]'
          : 'bg-transparent shadow-none'
      } max-lg:left-4 max-lg:right-4 md:max-lg:left-8 md:max-lg:right-8 ${
        isOutOfHero 
          ? 'max-lg:top-3 md:max-lg:top-4 max-lg:animate-in max-lg:slide-in-from-top max-lg:duration-500' 
          : 'max-lg:-top-24'
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
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-secondary hover:text-primary font-semibold text-base transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Desktop Actions - positioned absolutely on the left */}
          <div className="hidden lg:flex items-center gap-4 absolute left-0">
            <button
              className="p-2 text-secondary hover:text-primary transition-colors duration-300"
              aria-label="السلة"
            >
              <ShoppingCart size={22} />
            </button>
            <button
              className="p-2 text-secondary hover:text-primary transition-colors duration-300"
              aria-label="تسجيل الدخول"
            >
              <User size={22} />
            </button>
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
            className="lg:hidden p-2 text-secondary hover:text-primary transition-colors absolute left-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="القائمة"
          >
            {isMobileMenuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </nav>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-6 border-t border-accent animate-in fade-in slide-in-from-top duration-300">
            <div className="flex flex-col gap-4">
              {navLinks.map((link) => (
                <button
                  key={link.href}
                  onClick={() => scrollToSection(link.href)}
                  className="text-right text-secondary hover:text-primary font-semibold py-2 transition-colors duration-300"
                >
                  {link.label}
                </button>
              ))}
              <div className="flex items-center gap-4 pt-4 border-t border-accent">
                <button
                  className="p-2 text-secondary hover:text-primary transition-colors"
                  aria-label="السلة"
                >
                  <ShoppingCart size={22} />
                </button>
                <button
                  className="p-2 text-secondary hover:text-primary transition-colors"
                  aria-label="تسجيل الدخول"
                >
                  <User size={22} />
                </button>
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
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
