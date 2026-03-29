/**
 * SponsorshipShowcase Section Component
 * Marketing section for the sponsorship program on landing page
 */

'use client';

import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import SponsorshipTierCard from '@/components/sponsorship/SponsorshipTierCard';
import { useSponsorshipTiers } from '@/api/hooks/useSponsorship';

const Section = styled.section`
  width: 100%;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f9fafb 0%, #f3f4f6 100%);
  scroll-behavior: smooth;

  @media (max-width: 768px) {
    padding: 60px 16px;
  }

  @media (max-width: 480px) {
    padding: 40px 16px;
  }
`;

const Container = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 64px;

  @media (max-width: 768px) {
    margin-bottom: 48px;
  }
`;

const Overline = styled.span`
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  color: #5b4dff;
`;

const Heading = styled.h2`
  font-size: 48px;
  font-weight: 800;
  line-height: 1.2;
  color: #0f172a;
  margin: 16px 0 20px 0;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 480px) {
    font-size: 28px;
  }
`;

const Description = styled.p`
  font-size: 18px;
  line-height: 1.6;
  color: #6b7280;
  margin: 0;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const TiersGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const CTA = styled.div`
  text-align: center;
  padding: 48px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const CTASubtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const LoadingSkeletons = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 28px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Skeleton = styled.div`
  background: #e5e7eb;
  border-radius: 12px;
  height: 400px;
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

export default function SponsorshipShowcase() {
  const router = useRouter();
  const { data: tiersData, isLoading } = useSponsorshipTiers();

  const tiers = tiersData?.data || [];
  // Show only featured tiers or top 3
  const featuredTiers = tiers
    .sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0))
    .slice(0, 3);

  return (
    <Section id="sponsorships">
      <Container>
        <Header>
          <Overline>Sponsorship Program</Overline>
          <Heading>Promote Your Brand Through Video Mentions</Heading>
          <Description>
            Get guaranteed video mentions across our popular social media platforms. Simple pricing,
            flexible packages, and measurable results.
          </Description>
        </Header>

        {isLoading ? (
          <LoadingSkeletons>
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} />
            ))}
          </LoadingSkeletons>
        ) : tiers.length === 0 ? (
          <CTA>
            <p>Sponsorship tiers are not currently available. Check back soon!</p>
          </CTA>
        ) : (
          <>
            <TiersGrid>
              {featuredTiers.map((tier) => (
                <SponsorshipTierCard
                  key={tier._id}
                  tier={tier}
                  featured={tier.featured}
                  onSelect={(tier) => router.push('/sponsorship/tiers')}
                  actionLabel="View All"
                />
              ))}
            </TiersGrid>

            <CTA>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '24px', fontWeight: '700', color: '#1f2937' }}>
                Ready to Boost Your Brand?
              </h3>
              <CTASubtitle>
                Choose the sponsorship tier that fits your budget and watch your brand reach thousands
                of potential customers.
              </CTASubtitle>
              <Button
                variant="primary"
                onClick={() => router.push('/sponsorship/tiers')}
                size="lg"
              >
                View All Sponsorship Tiers
              </Button>
            </CTA>
          </>
        )}
      </Container>
    </Section>
  );
}
