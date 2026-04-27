"use client";

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { Menu, X, Crown } from 'lucide-react';

const HeaderContent = () => {
  const [isScrolled, setIsScrolled] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const registerHref = ref ? `/register?ref=${ref}` : '/register';

  useEffect(() => {
    setIsMounted(true);
    setIsScrolled(window.scrollY > 50);

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = 'var(--scrollbar-width, 0px)';
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isMobileMenuOpen]);

  const navLinks = [
    { label: 'Products', href: '#products' },
    { label: 'Influencers', href: '#influencers' },
    { label: 'Sponsorships', href: '#sponsorships' },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 w-full transition-all duration-300 will-change-transform ${
        isMounted ? (isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-transparent') : 'bg-transparent'
      }`}
      style={{ boxSizing: 'border-box' }}
    >
      <div className="section-container w-full">
        <div className="flex items-center justify-between h-[72px]">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center transition-transform duration-300 group-hover:scale-110">
              <Crown className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold text-navy">SphereKings</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {navLinks.map((link) => (
              <button
                key={link.label}
                onClick={() => {
                  const element = document.querySelector(link.href);
                  if (element) {
                    element.scrollIntoView({ behavior: 'smooth' });
                  }
                }}
                className="text-[15px] font-medium text-gray-text hover:text-primary transition-colors duration-200 relative group"
              >
                {link.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
          </nav>

          {/* CTA Buttons */}
          <div className="hidden lg:flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-medium text-gray-text hover:text-primary transition-colors duration-200 px-4 py-2"
            >
              Sign In
            </Link>
            <Link
              href={registerHref}
              className="btn-primary text-sm inline-flex items-center justify-center"
            >
              Get Started
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden p-2 text-navy hover:text-primary transition-colors flex-shrink-0"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`lg:hidden fixed top-[72px] left-0 right-0 bg-white shadow-lg transition-all duration-300 ${
          isMobileMenuOpen
            ? 'opacity-100 visible translate-y-0'
            : 'opacity-0 invisible -translate-y-4'
        }`}
      >
        <nav className="section-container w-full py-6 flex flex-col gap-4">
          {navLinks.map((link) => (
            <button
              key={link.label}
              onClick={() => {
                const element = document.querySelector(link.href);
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
                setIsMobileMenuOpen(false);
              }}
              className="text-left text-[16px] font-medium text-gray-text hover:text-primary transition-colors duration-200 py-2"
            >
              {link.label}
            </button>
          ))}
          <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
            <Link
              href="/login"
              className="text-center text-[16px] font-medium text-gray-text hover:text-primary transition-colors duration-200 py-2"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sign In
            </Link>
            <Link
              href={registerHref}
              className="btn-primary text-sm inline-flex items-center justify-center w-full"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Get Started
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
};

const Header = () => (
  <Suspense fallback={<HeaderSkeleton />}>
    <HeaderContent />
  </Suspense>
);

const HeaderSkeleton = () => (
  <header className="fixed top-0 left-0 right-0 z-50 bg-transparent h-[72px] w-full" style={{ boxSizing: 'border-box' }}>
    <div className="section-container w-full">
      <div className="flex items-center justify-between h-[72px]">
        <div className="flex items-center gap-2">
          <div className="w-10 h-10 rounded-xl bg-primary" />
          <div className="w-32 h-6 bg-gray-200 rounded" />
        </div>
        <div className="lg:hidden w-6 h-6 bg-gray-200 rounded" />
      </div>
    </div>
  </header>
);

export default Header;