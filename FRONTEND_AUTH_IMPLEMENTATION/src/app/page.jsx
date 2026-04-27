'use client';

import { Suspense } from 'react';
import Header from '../sections/Header';
import PromoAnnouncementBar from '../sections/PromoAnnouncementBar';
import Hero from '../sections/Hero';
import ValueProp from '../sections/ValueProp';
import HowItWorks from '../sections/HowItWorks';
import FeaturesShowcase from '../sections/FeaturesShowcase';
import SocialProof from '../sections/SocialProof';
import TrustSecurity from '../sections/TrustSecurity';
import DualCTA from '../sections/DualCTA';
import RaffleSection from '../sections/RaffleSection';
import FollowersSection from '../sections/FollowersSection';
import InfluencerShowcase from '../components/sections/InfluencerShowcase';
import SponsorshipShowcase from '../components/sections/SponsorshipShowcase';
import FAQ from '../sections/FAQ';
import FinalCTA from '../sections/FinalCTA';
import Footer from '../sections/Footer';
import '../App.css';

function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <PromoAnnouncementBar 
        ctaUrl="/register" 
        showCounter={false}
        isVisible={true}
      />
      <main>
        <Hero />
        <ValueProp />
        <HowItWorks />
        <FeaturesShowcase />
        <RaffleSection />
        <FollowersSection />
        <SocialProof />
        <TrustSecurity />
        <DualCTA />
        <InfluencerShowcase />
        <SponsorshipShowcase />
        <FAQ />
        <FinalCTA />
      </main>
      <Footer />
    </div>
  );
}


export default function HomePage() {
  return (
    <Suspense fallback={null}>
      <App />
    </Suspense>
  );
}
