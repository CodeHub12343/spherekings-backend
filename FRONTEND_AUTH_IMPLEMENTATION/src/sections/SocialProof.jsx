"use client";

import { useState, useEffect, useRef } from 'react';
import { Star, ChevronLeft, ChevronRight, Users, TrendingUp, DollarSign } from 'lucide-react';

const testimonials = [
  {
    stars: 5,
    quote:
      'I was skeptical at first, but SphereKings proved itself in month one. I made $3,000 from my first 100 referrals. The dashboard is intuitive, payouts are instant, and support actually responds. 10/10.',
    author: 'Sarah Chen',
    title: 'Digital Marketer',
    avatar: '/images/avatar-sarah.jpg',
  },
  {
    stars: 5,
    quote:
      "As a content creator with 50K followers, I was looking for a platform that wouldn't nickel-and-dime me. SphereKings doesn't. 15% commission, no cap, no games. I'm on track to earn $50K this year.",
    author: 'James Rodriguez',
    title: 'YouTuber',
    avatar: '/images/avatar-james.jpg',
  },
  {
    stars: 5,
    quote:
      'The analytics alone are worth it. I can see exactly which Pinterest pins drive sales and optimize from there. My ROI went from 2:1 to 5:1 in 60 days.',
    author: 'Lisa Wang',
    title: 'Content Strategist',
    avatar: '/images/avatar-lisa.jpg',
  },
];

const stats = [
  { icon: Users, value: '10,000+', label: 'Active Customers' },
  { icon: TrendingUp, value: '500+', label: 'Earning Affiliates' },
  { icon: DollarSign, value: '$45M+', label: 'Paid to Affiliates' },
];

const SocialProof = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const sectionRef = useRef(null);
  const autoPlayRef = useRef(null);

  useEffect(() => {
    if (isAutoPlaying) {
      autoPlayRef.current = setInterval(() => {
        setCurrentIndex((prev) => (prev + 1) % testimonials.length);
      }, 5000);
    }

    return () => {
      if (autoPlayRef.current) {
        clearInterval(autoPlayRef.current);
      }
    };
  }, [isAutoPlaying]);

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

  const goToPrevious = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev - 1 + testimonials.length) % testimonials.length);
  };

  const goToNext = () => {
    setIsAutoPlaying(false);
    setCurrentIndex((prev) => (prev + 1) % testimonials.length);
  };

  return (
    <section
      ref={sectionRef}
      className="section-padding bg-gray-surface"
      id="testimonials"
    >
      <div className="section-container">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 md:mb-16 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
          <h2 className="heading-2 mb-4">
            Trusted by <span className="text-primary">Thousands</span>
          </h2>
          <p className="body-text-lg">
            See what real affiliates are saying about SphereKings.
          </p>
        </div>

        {/* Testimonial Carousel */}
        <div className="max-w-4xl mx-auto mb-12 md:mb-16 reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
          <div
            className="relative"
            onMouseEnter={() => setIsAutoPlaying(false)}
            onMouseLeave={() => setIsAutoPlaying(true)}
          >
            {/* Testimonial Cards */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-500 ease-in-out"
                style={{ transform: `translateX(-${currentIndex * 100}%)` }}
              >
                {testimonials.map((testimonial, index) => (
                  <div
                    key={index}
                    className="w-full flex-shrink-0 px-4"
                  >
                    <div className="bg-white rounded-card p-8 md:p-10 shadow-card">
                      {/* Stars */}
                      <div className="flex gap-1 mb-6">
                        {[...Array(testimonial.stars)].map((_, i) => (
                          <Star
                            key={i}
                            className="w-5 h-5 fill-gold text-gold"
                          />
                        ))}
                      </div>

                      {/* Quote */}
                      <blockquote className="text-[16px] md:text-[18px] text-navy leading-relaxed mb-8">
                        "{testimonial.quote}"
                      </blockquote>

                      {/* Author */}
                      <div className="flex items-center gap-4">
                        <img
                          src={testimonial.avatar}
                          alt={testimonial.author}
                          className="w-12 h-12 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-semibold text-navy">
                            {testimonial.author}
                          </p>
                          <p className="text-[14px] text-gray-text">
                            {testimonial.title}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Arrows */}
            <button
              onClick={goToPrevious}
              className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-2 md:-translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-card flex items-center justify-center text-navy hover:text-primary hover:shadow-card-hover transition-all duration-300"
              aria-label="Previous testimonial"
            >
              <ChevronLeft className="w-5 h-5 md:w-6 md:h-6" />
            </button>
            <button
              onClick={goToNext}
              className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-2 md:translate-x-4 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white shadow-card flex items-center justify-center text-navy hover:text-primary hover:shadow-card-hover transition-all duration-300"
              aria-label="Next testimonial"
            >
              <ChevronRight className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            {/* Dots Indicator */}
            <div className="flex justify-center gap-2 mt-6">
              {testimonials.map((_, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsAutoPlaying(false);
                    setCurrentIndex(index);
                  }}
                  className={`w-2.5 h-2.5 rounded-full transition-all duration-300 ${
                    index === currentIndex
                      ? 'bg-primary w-8'
                      : 'bg-gray-border hover:bg-gray-text'
                  }`}
                  aria-label={`Go to testimonial ${index + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {stats.map((stat, index) => (
            <div
              key={index}
              className="reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out bg-white rounded-card p-6 md:p-8 text-center shadow-card hover:shadow-card-hover hover:-translate-y-1 transition-all duration-300"
            >
              <stat.icon className="w-8 h-8 text-primary mx-auto mb-4" />
              <p className="text-[32px] md:text-[40px] font-bold text-navy mb-2">
                {stat.value}
              </p>
              <p className="text-[14px] text-gray-text">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Average Rating */}
        <p className="text-center mt-8 text-[14px] text-gray-text reveal-item opacity-0 translate-y-8 transition-all duration-500 ease-out">
          Average Rating:{' '}
          <span className="font-semibold text-navy">4.9/5</span> from 847 reviews
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

export default SocialProof;
