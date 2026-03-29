"use client";

import { useEffect, useRef } from 'react';
import { Shield, Lock, FileCheck, Check, ArrowRight } from 'lucide-react';

const securityFeatures = [
  'SSL/TLS encryption on all data',
  'Two-factor authentication available',
  'SOC 2 Type II certified',
  'GDPR & CCPA compliant',
  'Annual third-party security audits',
  'Privacy policy transparency',
  'Zero sale of user data',
  'Dedicated fraud prevention team',
];

const TrustSecurity = () => {
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
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="section-container">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-center">
          {/* Left Column - Content */}
          <div>
            <h2 className="heading-2 mb-4 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
              Your Trust is Our{' '}
              <span className="text-primary">Priority</span>
            </h2>
            <p className="subheading mb-6 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
              Security, privacy, and transparency in everything we do.
            </p>
            <p className="body-text-lg mb-8 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
              We protect your data with bank-level security. Every transaction
              is encrypted. Your bank details are never stored on our servers.
              We're SOC 2 Type II certified and comply with GDPR/CCPA.
            </p>

            {/* Security Features List */}
            <div className="grid sm:grid-cols-2 gap-3 mb-8">
              {securityFeatures.map((feature, index) => (
                <div
                  key={index}
                  className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out flex items-center gap-3"
                >
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-success" />
                  </div>
                  <span className="text-[14px] text-navy">{feature}</span>
                </div>
              ))}
            </div>

            {/* CTA */}
            <a
              href="#"
              className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out inline-flex items-center gap-2 text-primary font-semibold hover:gap-3 transition-all duration-300"
            >
              Read Our Security & Privacy Policy
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* Right Column - Visual */}
          <div className="reveal-item opacity-0 translate-x-8 transition-all duration-500 ease-out">
            <div className="relative">
              {/* Security Icons Grid */}
              <div className="grid grid-cols-2 gap-4">
                {/* Shield Card */}
                <div className="bg-gray-surface rounded-card p-6 md:p-8 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Shield className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-navy mb-1">
                    Bank-Level Encryption
                  </h4>
                  <p className="text-[13px] text-gray-text">
                    256-bit SSL protection
                  </p>
                </div>

                {/* Lock Card */}
                <div className="bg-gray-surface rounded-card p-6 md:p-8 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <Lock className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-navy mb-1">
                    Two-Factor Auth
                  </h4>
                  <p className="text-[13px] text-gray-text">
                    Extra layer of security
                  </p>
                </div>

                {/* Certificate Card */}
                <div className="bg-gray-surface rounded-card p-6 md:p-8 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
                    <FileCheck className="w-8 h-8 text-primary" />
                  </div>
                  <h4 className="font-semibold text-navy mb-1">
                    SOC 2 Certified
                  </h4>
                  <p className="text-[13px] text-gray-text">
                    Industry standard compliance
                  </p>
                </div>

                {/* Check Card */}
                <div className="bg-gray-surface rounded-card p-6 md:p-8 text-center hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300">
                  <div className="w-16 h-16 rounded-2xl bg-success/10 flex items-center justify-center mx-auto mb-4">
                    <Check className="w-8 h-8 text-success" />
                  </div>
                  <h4 className="font-semibold text-navy mb-1">
                    Regular Audits
                  </h4>
                  <p className="text-[13px] text-gray-text">
                    Third-party verified
                  </p>
                </div>
              </div>

              {/* Decorative Elements */}
              <div className="absolute -top-4 -right-4 w-24 h-24 bg-primary/5 rounded-full blur-2xl" />
              <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .reveal-item.animate-in {
          opacity: 1;
          transform: translateY(0) translateX(0);
        }
      `}</style>
    </section>
  );
};

export default TrustSecurity;
