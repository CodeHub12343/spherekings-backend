"use client";

import { useState, useEffect, useRef } from 'react';
import { ChevronDown } from 'lucide-react';

const faqItems = [
  {
    question: "What's the commission structure?",
    answer:
      'Standard rate is 15% of the sale price. No caps, no limits. If you drive consistent high-volume traffic ($5K+/month), we can negotiate custom rates. Top affiliates earn 18-20%.',
  },
  {
    question: 'How long does approval take?',
    answer:
      'Usually instant. We approve 99% of affiliate applications in under 5 minutes. If manual review is needed (rare), it takes 24 hours max.',
  },
  {
    question: 'When do I get paid?',
    answer:
      "Every Wednesday, we process payouts from the prior week's approved sales. Paid directly to your bank account. Typical delivery: 2-3 business days.",
  },
  {
    question: 'Do you have a minimum payout threshold?',
    answer:
      'Yes, $100 minimum per payout request. No maximum. Withdraw as often as you want (we process weekly).',
  },
  {
    question: 'Can I use multiple referral links?',
    answer:
      'Absolutely. Create unlimited links organized by campaign. Track performance per link. Rotate them to test messaging.',
  },
  {
    question: 'What if a customer returns the product?',
    answer:
      "If the return happens within 14 days, the commission is refunded. If it's after 14 days, the commission stays with you. This protects both you and us from abuse.",
  },
  {
    question: 'Is there a contract or lock-in period?',
    answer:
      "No contract. No lock-in. Leave anytime (though we'd miss you!). All your earnings stay yours.",
  },
  {
    question: 'What support do you offer?',
    answer:
      'Dedicated email support (24-48hr response), private Slack community, weekly webinars, one-on-one onboarding, and performance coaching for top earners.',
  },
];

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);
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
      { threshold: 0.1, rootMargin: '0px 0px -10% 0px' }
    );

    if (sectionRef.current) {
      observer.observe(sectionRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const toggleItem = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section ref={sectionRef} className="section-padding bg-white" id="faq">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
          <h2 className="heading-2 mb-4">
            Common <span className="text-primary">Questions</span>
          </h2>
          <p className="body-text-lg">Got questions? We've got answers.</p>
        </div>

        {/* Accordion */}
        <div className="max-w-3xl mx-auto space-y-4">
          {faqItems.map((item, index) => (
            <div
              key={index}
              className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out border border-gray-border rounded-card overflow-hidden"
            >
              <button
                onClick={() => toggleItem(index)}
                className="w-full flex items-center justify-between p-5 md:p-6 text-left hover:bg-gray-surface/50 transition-colors duration-200"
                aria-expanded={openIndex === index}
              >
                <span className="font-semibold text-navy pr-4">{item.question}</span>
                <ChevronDown
                  className={`w-5 h-5 text-gray-text flex-shrink-0 transition-transform duration-300 ${
                    openIndex === index ? 'rotate-180' : ''
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === index ? 'max-h-96' : 'max-h-0'
                }`}
              >
                <div className="px-5 md:px-6 pb-5 md:pb-6">
                  <p className="body-text">{item.answer}</p>
                </div>
              </div>
            </div>
          ))}
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

export default FAQ;
