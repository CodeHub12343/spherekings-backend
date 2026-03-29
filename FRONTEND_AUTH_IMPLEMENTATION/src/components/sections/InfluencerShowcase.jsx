/**
 * InfluencerShowcase Section Component
 * Marketing section for the influencer program on landing page
 */

'use client';

import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const Section = styled.section`
  width: 100%;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f5f3ff 0%, #faf5ff 100%);
  border-top: 1px solid rgba(91, 77, 255, 0.1);
  border-bottom: 1px solid rgba(91, 77, 255, 0.1);
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

const Content = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 64px;
  align-items: center;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 40px;
  }
`;

const TextContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
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
  margin: 0;

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

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 12px;
  font-size: 16px;
  color: #374151;
  line-height: 1.5;

  .icon {
    flex-shrink: 0;
    color: #10b981;
    font-weight: 700;
    font-size: 18px;
  }

  @media (max-width: 768px) {
    font-size: 15px;
  }
`;

const CTAGroup = styled.div`
  display: flex;
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 480px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const VisualContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  background: linear-gradient(135deg, rgba(91, 77, 255, 0.1) 0%, rgba(91, 77, 255, 0.05) 100%);
  border-radius: 16px;
  min-height: 400px;

  @media (max-width: 768px) {
    min-height: 300px;
    padding: 24px;
  }

  @media (max-width: 480px) {
    min-height: 250px;
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  width: 100%;

  @media (max-width: 480px) {
    gap: 16px;
  }
`;

const IconCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 12px;
  padding: 24px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const IconBig = styled.div`
  font-size: 40px;
`;

const IconLabel = styled.span`
  font-size: 13px;
  font-weight: 600;
  color: #1f2937;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

export default function InfluencerShowcase() {
  const router = useRouter();

  return (
    <Section id="influencers">
      <Container>
        <Content>
          <TextContent>
            <div>
              <Overline>Influencer Program</Overline>
              <Heading>Turn Your Influence Into Free Products</Heading>
              <Description>
                Join our influencer network and receive exclusive SphereKings products in exchange
                for sharing with your community. Auto-approved if you have 5,000+ followers.
              </Description>
            </div>

            <BenefitsList>
              <BenefitItem>
                <span className="icon">✓</span>
                <span>Free products selected for your niche</span>
              </BenefitItem>
              <BenefitItem>
                <span className="icon">✓</span>
                <span>Quick approval process (5,000+ followers auto-approved)</span>
              </BenefitItem>
              <BenefitItem>
                <span className="icon">✓</span>
                <span>Track shipment and manage your deliverables</span>
              </BenefitItem>
              <BenefitItem>
                <span className="icon">✓</span>
                <span>Flexible content commitment (daily or total videos)</span>
              </BenefitItem>
              <BenefitItem>
                <span className="icon">✓</span>
                <span>No hidden fees or payment required</span>
              </BenefitItem>
            </BenefitsList>

            <CTAGroup>
              <Button
                variant="primary"
                onClick={() => router.push('/influencer/apply')}
                size="lg"
              >
                Apply Now
              </Button>
              <Button
                variant="outline"
                onClick={() => router.push('#requirements')}
                size="lg"
              >
                Learn More
              </Button>
            </CTAGroup>
          </TextContent>

          <VisualContent>
            <IconGrid>
              <IconCard>
                <IconBig>🎁</IconBig>
                <IconLabel>Free Products</IconLabel>
              </IconCard>
              <IconCard>
                <IconBig>⚡</IconBig>
                <IconLabel>Auto-Approval</IconLabel>
              </IconCard>
              <IconCard>
                <IconBig>📦</IconBig>
                <IconLabel>Free Shipping</IconLabel>
              </IconCard>
              <IconCard>
                <IconBig>📊</IconBig>
                <IconLabel>Track Progress</IconLabel>
              </IconCard>
            </IconGrid>
          </VisualContent>
        </Content>
      </Container>
    </Section>
  );
}
