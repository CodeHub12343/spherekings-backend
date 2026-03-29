"use client";
import Link from 'next/link';

import { useEffect, useRef } from 'react';
import { ShoppingCart, TrendingUp, Check, ArrowRight } from 'lucide-react';

const shopperFeatures = [
  '5,000+ premium products',
  'Secure checkout',
  '30-day money-back guarantee',
  '24/7 customer support',
];

const affiliateFeatures = [
  '15% commission (no cap)',
  'Real-time analytics',
  '500+ active affiliates',
  'Top earner makes $50K+/month',
];

const DualCTA = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const elements = entry.target.querySelectorAll('.reveal-item');
            elements.forEach((el, index) => {
              setTimeout(() => {
                el.classList.add('animate-in');
              }, index * 150);
            });
          }
        });
      },
      { threshold: 0.2, rootMargin: '0px 0px -10% 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section ref={sectionRef} className="section-padding bg-surface-gradient" id="products">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
          <h2 className="heading-2 mb-4">
            What Do You Want to <span className="text-primary">Do?</span>
          </h2>
        </div>

        {/* Cards */}
        <div className="grid md:grid-cols-2 gap-6 md:gap-8 max-w-5xl mx-auto">
          {/* Shopper Card */}
          <div className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out bg-white rounded-card p-8 md:p-10 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <ShoppingCart className="w-8 h-8 text-primary" />
            </div>
            <h3 className="heading-3 mb-2">Shop Premium Products</h3>
            <p className="subheading text-primary mb-4">
              Browse our curated marketplace
            </p>
            <p className="body-text mb-6">
              Discover high-quality products across categories. Fast shipping,
              easy returns, trusted sellers.
            </p>

            <ul className="space-y-3 mb-8">
              {shopperFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-[14px] text-navy"
                >
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <Link href="/products" className="btn-secondary w-full block text-center">
              Browse Products
              <ArrowRight className="w-4 h-4 inline ml-2" />
            </Link>
          </div>

          {/* Affiliate Card - Gold Accent */}
          <div className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out bg-white rounded-card p-8 md:p-10 shadow-card hover:shadow-card-hover hover:-translate-y-2 transition-all duration-300 border-2 border-gold/30 relative overflow-hidden">
            {/* Gold accent badge */}
            <div className="absolute top-4 right-4 bg-gold/10 text-gold text-[12px] font-semibold px-3 py-1 rounded-full">
              Recommended
            </div>

            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6">
              <TrendingUp className="w-8 h-8 text-primary" />
            </div>
            <h3 className="heading-3 mb-2">Join Our Affiliate Program</h3>
            <p className="subheading text-primary mb-4">
              Start earning unlimited commissions
            </p>
            <p className="body-text mb-6">
              Turn your audience into income. High commission rates, instant
              payouts, world-class support.
            </p>

            <ul className="space-y-3 mb-8">
              {affiliateFeatures.map((feature, i) => (
                <li
                  key={i}
                  className="flex items-center gap-3 text-[14px] text-navy"
                >
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button
              onClick={() => {
                const element = document.querySelector('#final-cta');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn-primary w-full"
            >
              Become an Affiliate
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Sign In Link */}
        <p className="text-center mt-8 text-[14px] text-gray-text reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
          Already have an account?{' '}
          <Link href="/login" className="text-primary font-semibold hover:underline">
            Sign in
          </Link>
        </p>
      </div>

      <style>{`
        .reveal-item.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

export default DualCTA;
