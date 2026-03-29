"use client";

import Link from 'next/link';
import { Crown, Linkedin, Twitter, Instagram, Check } from 'lucide-react';

const footerLinks = {
  shop: {
    title: 'Shop',
    links: [
      { label: 'Browse Products', href: '#' },
      { label: 'Best Sellers', href: '#' },
      { label: 'New Arrivals', href: '#' },
      { label: 'Categories', href: '#' },
      { label: 'Deals', href: '#' },
    ],
  },
  earn: {
    title: 'Earn',
    links: [
      { label: 'Become Affiliate', href: '#' },
      { label: 'Affiliate Dashboard', href: '#' },
      { label: 'Influencer Program', href: '/influencer/apply' },
      { label: 'Sponsorship Tiers', href: '/sponsorship/tiers' },
      { label: 'Earnings FAQ', href: '#' },
      { label: 'Top Affiliates', href: '#' },
      { label: 'Join Community', href: '#' },
    ],
  },
  company: {
    title: 'Company',
    links: [
      { label: 'About Us', href: '#' },
      { label: 'Blog', href: '#' },
      { label: 'Press Kit', href: '#' },
      { label: 'Careers', href: '#' },
      { label: 'Contact', href: '#' },
    ],
  },
  legal: {
    title: 'Legal',
    links: [
      { label: 'Terms of Service', href: '#' },
      { label: 'Privacy Policy', href: '#' },
      { label: 'Security', href: '#' },
      { label: 'Affiliate Agreement', href: '#' },
      { label: 'Refund Policy', href: '#' },
    ],
  },
};

const Footer = () => {
  return (
    <footer className="bg-gray-surface border-t border-gray-border">
      <div className="section-container py-16 md:py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center">
                <Crown className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-navy">SphereKings</span>
            </Link>
            <p className="text-[14px] text-gray-text mb-6">
              The marketplace where everyone wins.
            </p>
            <div className="flex gap-4">
              <button
                onClick={() => window.open('https://linkedin.com', '_blank')}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-text hover:text-primary hover:shadow-card transition-all duration-300"
                aria-label="LinkedIn"
              >
                <Linkedin className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.open('https://twitter.com', '_blank')}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-text hover:text-primary hover:shadow-card transition-all duration-300"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </button>
              <button
                onClick={() => window.open('https://instagram.com', '_blank')}
                className="w-10 h-10 rounded-full bg-white flex items-center justify-center text-gray-text hover:text-primary hover:shadow-card transition-all duration-300"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Shop Links */}
          <div>
            <h4 className="font-semibold text-navy mb-4">{footerLinks.shop.title}</h4>
            <ul className="space-y-3">
              {footerLinks.shop.links.map((link, i) => (
                <li key={i}>
                  {link.href.startsWith('/') ? (
                    <Link
                      href={link.href}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Earn Links */}
          <div>
            <h4 className="font-semibold text-navy mb-4">{footerLinks.earn.title}</h4>
            <ul className="space-y-3">
              {footerLinks.earn.links.map((link, i) => (
                <li key={i}>
                  {link.href.startsWith('/') ? (
                    <Link
                      href={link.href}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold text-navy mb-4">{footerLinks.company.title}</h4>
            <ul className="space-y-3">
              {footerLinks.company.links.map((link, i) => (
                <li key={i}>
                  {link.href.startsWith('/') ? (
                    <Link
                      href={link.href}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Legal Links */}
          <div>
            <h4 className="font-semibold text-navy mb-4">{footerLinks.legal.title}</h4>
            <ul className="space-y-3">
              {footerLinks.legal.links.map((link, i) => (
                <li key={i}>
                  {link.href.startsWith('/') ? (
                    <Link
                      href={link.href}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200"
                    >
                      {link.label}
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        const element = document.querySelector(link.href);
                        if (element) {
                          element.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-[14px] text-gray-text hover:text-primary transition-colors duration-200 bg-transparent border-none cursor-pointer"
                    >
                      {link.label}
                    </button>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-gray-border">
        <div className="section-container py-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-[13px] text-gray-text">
              © 2024 SphereKings. All rights reserved.
            </p>
            <p className="text-[13px] text-gray-light">
              Last updated March 21, 2026
            </p>
            <div className="flex items-center gap-2 text-[13px] text-success">
              <Check className="w-4 h-4" />
              All systems operational
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
