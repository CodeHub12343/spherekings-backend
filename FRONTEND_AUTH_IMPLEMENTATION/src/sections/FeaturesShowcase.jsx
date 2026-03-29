"use client";

import { useEffect, useRef } from 'react';
import {
  BarChart3,
  Link2,
  Mail,
  Users,
  Zap,
  DollarSign,
  Clock,
  Check,
} from 'lucide-react';

const FeaturesShowcase = () => {
  const sectionRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const cards = entry.target.querySelectorAll('.bento-card');
            cards.forEach((card, index) => {
              setTimeout(() => {
                card.classList.add('animate-in');
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

  return (
    <section ref={sectionRef} className="section-padding bg-white">
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16">
          <h2 className="heading-2 mb-4">
            Powerful Tools <span className="text-primary">Built for Success</span>
          </h2>
          <p className="body-text-lg">
            Everything you need to grow your affiliate business.
          </p>
        </div>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Featured Card 1 - Large */}
          <div className="bento-card md:col-span-2 lg:col-span-2 card-base opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-5">
                <BarChart3 className="w-7 h-7 text-primary" />
              </div>
              <h3 className="heading-3 mb-3">Advanced Analytics Dashboard</h3>
              <p className="body-text mb-6">
                Real-time tracking of clicks, conversions, and revenue. See
                which products are top performers. Identify your best traffic
                sources. Export reports in seconds.
              </p>
              <ul className="space-y-2 mt-auto">
                {[
                  'Conversion funnel analysis',
                  'Traffic source breakdown',
                  'Hourly/daily/monthly reporting',
                  'Custom date range filtering',
                  'Exportable data (CSV, PDF)',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-2 text-[14px] text-gray-text">
                    <Check className="w-4 h-4 text-success flex-shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Card 2 */}
          <div className="bento-card card-base opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <div className="icon-circle mb-5">
              <Link2 className="w-6 h-6" />
            </div>
            <h3 className="heading-4 mb-3">Link Management</h3>
            <p className="body-text">
              Unlimited custom links. Organize by campaign. Track performance
              per link.
            </p>
          </div>

          {/* Card 3 */}
          <div className="bento-card card-base opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <div className="icon-circle mb-5">
              <Mail className="w-6 h-6" />
            </div>
            <h3 className="heading-4 mb-3">Swipe Files</h3>
            <p className="body-text">
              Pre-written email templates, social posts, ad copy. Copy & paste
              → win.
            </p>
          </div>

          {/* Card 4 */}
          <div className="bento-card card-base opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <div className="icon-circle mb-5">
              <Users className="w-6 h-6" />
            </div>
            <h3 className="heading-4 mb-3">Affiliate Network</h3>
            <p className="body-text">
              Connect with top earners. Share strategies in private forums.
              Learn from the best.
            </p>
          </div>

          {/* Card 5 */}
          <div className="bento-card card-base opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <div className="icon-circle mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="heading-4 mb-3">Instant Notifications</h3>
            <p className="body-text">
              Real-time alerts on new conversions, payouts, and performance
              milestones.
            </p>
          </div>

          {/* Featured Card 2 - Large */}
          <div className="bento-card md:col-span-2 lg:col-span-2 card-base opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <div className="flex flex-col h-full">
              <div className="w-14 h-14 rounded-xl bg-primary-light flex items-center justify-center mb-5">
                <DollarSign className="w-7 h-7 text-primary" />
              </div>
              <h3 className="heading-3 mb-3">Performance-Based Rewards</h3>
              <p className="body-text mb-6">
                Earn bonuses for hitting milestones. Rewards paid alongside
                regular commissions.
              </p>
              <div className="grid sm:grid-cols-3 gap-4 mt-auto">
                {[
                  { amount: '$1K/month', bonus: '+1% commission boost' },
                  { amount: '$5K/month', bonus: '+3% commission boost' },
                  { amount: '$10K/month', bonus: 'Custom rate negotiation' },
                ].map((tier, i) => (
                  <div
                    key={i}
                    className="bg-gray-surface rounded-lg p-4 text-center"
                  >
                    <p className="font-semibold text-navy mb-1">{tier.amount}</p>
                    <p className="text-[13px] text-gray-text">{tier.bonus}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 6 */}
          <div className="bento-card card-base opacity-0 translate-y-8 transition-all duration-500 ease-out">
            <div className="icon-circle mb-5">
              <Clock className="w-6 h-6" />
            </div>
            <h3 className="heading-4 mb-3">Flexible Payouts</h3>
            <p className="body-text">
              Request payment whenever you want. No minimums on first payout.
              Paid within 3 business days.
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .bento-card.animate-in {
          opacity: 1;
          transform: translateY(0);
        }
      `}</style>
    </section>
  );
};

export default FeaturesShowcase;
