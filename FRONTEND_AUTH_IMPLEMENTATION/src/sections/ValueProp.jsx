"use client";

import { useEffect, useRef } from 'react';
import {
  TrendingUp,
  DollarSign,
  Zap,
  Users,
  Lock,
  Award,
} from 'lucide-react';

const features = [
  {
    icon: TrendingUp,
    title: 'Real-Time Analytics',
    description:
      "Track every click, conversion, and commission in real-time. See what's working and optimize on the fly with our advanced dashboard. No guesswork, just data.",
  },
  {
    icon: DollarSign,
    title: 'Unlimited Earnings',
    description:
      'No caps on commissions. Earn 10%, 15%, or custom rates per product. The more you sell, the more you make. Simple as that.',
  },
  {
    icon: Zap,
    title: 'Instant Payouts',
    description:
      'Get approved sales paid directly to your bank. No 30-day holds, no hidden fees. Approved today, paid this week.',
  },
  {
    icon: Users,
    title: 'Real Community',
    description:
      'Connect with 500+ affiliates. Share strategies, collaborate, and grow together. Private forums, exclusive webinars, live support.',
  },
  {
    icon: Lock,
    title: 'Security First',
    description:
      'Bank-level security protects your data and earnings. SSL encryption, 2FA, regular audits. Your trust is our priority.',
  },
  {
    icon: Award,
    title: 'Expert Support',
    description:
      'Dedicated affiliate managers, onboarding help, and marketing resources. We want you to succeed.',
  },
];

const ValueProp = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.feature-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-in');
              }, index * 100);
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
    <section ref={sectionRef} className="section-padding bg-white" id="features">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="heading-2 mb-4">
            Why SphereKings <span className="text-primary">Stands Out</span>
          </h2>
          <p className="body-text-lg">
            A genuine two-sided marketplace designed for success.
          </p>
        </div>

        {/* Feature Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="feature-card card-base opacity-0 translate-y-8 transition-all duration-500 ease-out group"
            >
              <div className="icon-circle mb-5 transition-all duration-300 group-hover:scale-110 group-hover:rotate-[5deg]">
                <feature.icon className="w-6 h-6" />
              </div>
              <h3 className="heading-4 mb-3">{feature.title}</h3>
              <p className="body-text">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .feature-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

export default ValueProp;
