"use client";

import { useEffect, useRef } from 'react';
import { User, Link2, TrendingUp, ArrowRight } from 'lucide-react';

const steps = [
  {
    number: '1',
    icon: User,
    title: 'Sign Up & Get Approved',
    description:
      "Join as an affiliate in under 2 minutes. Verify your details, agree to terms, and you're in. We approve 99% of applicants.",
    details: 'Requires email, name, bank info. No application fee.',
  },
  {
    number: '2',
    icon: Link2,
    title: 'Get Your Unique Link',
    description:
      'Instantly receive your unique referral link and custom dashboard. Share it on your blog, social media, email. Track every referral automatically.',
    details: 'Link structure: spherekings.com?ref=yourname',
  },
  {
    number: '3',
    icon: TrendingUp,
    title: 'Earn on Every Sale',
    description:
      "Every purchase from your referral link earns you a commission. See earnings update in real-time. Request payout whenever you're ready.",
    details: 'Commissions paid weekly. Minimum $100 payout.',
  },
];

const HowItWorks = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const steps = entry.target.querySelectorAll('.step-item');
            steps.forEach((step, index) => {
              setTimeout(() => {
                step.classList.add('animate-in');
              }, index * 200);
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
    <section
      ref={sectionRef}
      className="section-padding bg-gray-surface"
      id="how-it-works"
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="heading-2 mb-4">
            Get Started in <span className="text-primary">3 Simple Steps</span>
          </h2>
          <p className="body-text-lg">
            From signup to your first commission in minutes.
          </p>
        </div>

        {/* Steps */}
        <div className="max-w-3xl mx-auto">
          <div className="relative">
            {/* Connecting Line */}
            <div className="absolute left-6 md:left-8 top-0 bottom-0 w-0.5 bg-gray-border hidden sm:block" />

            {/* Step Items */}
            <div className="space-y-10 md:space-y-12">
              {steps.map((step, index) => (
                <div
                  key={index}
                  className="step-item opacity-0 translate-y-8 transition-all duration-500 ease-out"
                >
                  <div className="flex gap-6 md:gap-8">
                    {/* Number Circle */}
                    <div className="relative flex-shrink-0">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-full bg-primary flex items-center justify-center text-white font-bold text-xl md:text-2xl shadow-button-hover z-10 relative">
                        {step.number}
                      </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 pt-1 md:pt-2">
                      <div className="flex items-center gap-3 mb-3">
                        <step.icon className="w-5 h-5 text-primary" />
                        <h3 className="heading-4">{step.title}</h3>
                      </div>
                      <p className="body-text mb-2">{step.description}</p>
                      <p className="small-text text-gray-light">
                        {step.details}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 md:mt-16 text-center step-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <button
              onClick={() => {
                const element = document.querySelector('#final-cta');
                if (element) {
                  element.scrollIntoView({ behavior: 'smooth' });
                }
              }}
              className="btn-primary inline-flex"
            >
              Ready to Start? Create Your Free Account
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      <style>{`
        .step-item.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

export default HowItWorks;
