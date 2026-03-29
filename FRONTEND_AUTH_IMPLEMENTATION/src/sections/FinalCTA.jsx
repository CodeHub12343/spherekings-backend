"use client";
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { ArrowRight, MessageCircle } from 'lucide-react';

const FinalCTA = () => {
  const sectionRef = useRef(null);
  const searchParams = useSearchParams();
  const ref = searchParams.get('ref');
  const registerHref = ref ? `/register?ref=${ref}` : '/register';

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
    <section
      ref={sectionRef}
      className="py-20 md:py-28 bg-navy"
      id="final-cta"
    >
      <div className="section-container">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="heading-2 text-white mb-4 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
            Ready to Start <span className="text-primary">Earning?</span>
          </h2>

          <p className="text-[18px] md:text-[20px] text-gray-300 mb-4 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
            Join thousands of affiliates making real money with SphereKings.
          </p>

          <p className="text-[16px] text-gray-400 mb-10 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
            Get approved in minutes. Start earning immediately. No risk, no
            fees, no contracts. Just pure opportunity.
          </p>

          <div className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out mb-8">
            <Link
              href={registerHref}
              className="inline-flex items-center justify-center gap-3 px-8 md:px-12 py-4 bg-primary text-white font-semibold rounded-button transition-all duration-300 hover:bg-primary-dark animate-pulse-glow"
            >
              Create Your Free Account
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>

          <a
            href="#"
            className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors duration-200"
          >
            <MessageCircle className="w-4 h-4" />
            Have a question? Chat with us
          </a>

          <p className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out mt-8 text-[13px] text-gray-500 italic">
            New affiliates get +2% bonus commission first month
          </p>
        </div>
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

export default FinalCTA;
