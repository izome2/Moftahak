'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X, Phone, User, ShoppingCart } from 'lucide-react';
import Button from './ui/Button';
import Container from './ui/Container';

const Navbar: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener('scroll', handleScroll);
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
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? 'bg-white/95 backdrop-blur-md shadow-lg'
          : 'bg-white/50 backdrop-blur-sm'
      }`}
    >
      <Container>
        <nav className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="relative w-12 h-12">
              <Image
                src="/logos/logo-dark.png"
                alt="مفتاحك"
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="text-2xl font-bold text-secondary font-bristone hidden sm:block">
              مفتاحك
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className="text-secondary hover:text-primary font-semibold transition-colors duration-300 relative group"
              >
                {link.label}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </div>

          {/* Desktop Actions */}
          <div className="hidden lg:flex items-center gap-4">
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
              size="md"
              leftIcon={<Phone size={18} />}
              onClick={() => scrollToSection('#contact')}
            >
              تواصل معي
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-secondary hover:text-primary transition-colors"
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
      </Container>
    </header>
  );
};

export default Navbar;
