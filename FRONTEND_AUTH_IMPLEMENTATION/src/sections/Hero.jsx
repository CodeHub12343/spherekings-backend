"use client";

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ArrowRight, Users, TrendingUp, DollarSign, Shield } from 'lucide-react';

const Hero = () => {
  const heroRef = useRef(null);
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const registerHref = ref ? `/register?ref=${ref}` : '/register';

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    const elements = heroRef.current?.querySelectorAll('.reveal');
    elements?.forEach((el) => observer.observe(el));

    return () => observer.disconnect();
  }, []);

  return (
    <section
      ref={heroRef}
      className="min-h-screen bg-hero-gradient pt-[72px] flex items-center"
    >
      <div className="section-container py-12 md:py-20 lg:py-0">
        <div className="grid lg:grid-cols-2 gap-10 lg:gap-16 items-center">
          {/* Content */}
          <div className="order-2 lg:order-1">
            <h1 className="heading-1 mb-6 reveal opacity-0 translate-y-5 transition-all duration-600 ease-out">
              Earn While You Shop.{' '}
              <span className="text-primary">Build a Business</span> on
              Commission.
            </h1>

            <p className="body-text-lg mb-8 max-w-xl reveal opacity-0 translate-y-5 transition-all duration-600 ease-out delay-150">
              Join the SphereKings marketplace where customers shop premium
              products and affiliates earn unlimited commissions. Scale your
              earnings with real-time analytics and instant payouts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-10 reveal opacity-0 translate-y-5 transition-all duration-600 ease-out delay-300">
              <Link
                href={registerHref}
                className="btn-primary group"
              >
                Start Earning Today
                <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
              <a
                href="#products"
                className="btn-secondary"
              >
                Explore as Shopper
              </a>
            </div>

            {/* Trust Badges */}
            <div className="flex flex-wrap gap-4 md:gap-6 reveal opacity-0 translate-y-5 transition-all duration-600 ease-out delay-450">
              <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-gray-text">
                <Users className="w-4 h-4 text-success" />
                <span>10,000+ Customers</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-gray-text">
                <TrendingUp className="w-4 h-4 text-success" />
                <span>500+ Affiliates</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-gray-text">
                <DollarSign className="w-4 h-4 text-success" />
                <span>$45M+ Paid</span>
              </div>
              <div className="flex items-center gap-2 text-[13px] md:text-[14px] text-gray-text">
                <Shield className="w-4 h-4 text-success" />
                <span>Trusted since 2024</span>
              </div>
            </div>
          </div>

          {/* Visual */}
          <div className="order-1 lg:order-2 reveal opacity-0 translate-x-10 transition-all duration-600 ease-out delay-200">
            <div className="relative animate-float">
              <img
                src="/images/hero-visual.jpg"
                alt="SphereKings Dashboard Analytics"
                className="w-full h-auto rounded-2xl shadow-premium"
              />
              {/* Decorative elements */}
              <div className="absolute -top-4 -right-4 w-20 h-20 bg-primary/10 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .animate-in {
          opacity: 1 !important;
          transform: translateY(0) translateX(0) !important;
        }
      `}</style>
    </section>
  );
};

export default Hero;
