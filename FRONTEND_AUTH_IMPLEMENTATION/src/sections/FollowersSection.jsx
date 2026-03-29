'use client';

import styled from 'styled-components';
import { Crown } from 'lucide-react';
import FollowerCounter from './FollowerCounter';
import FollowersSubscriptionForm from './FollowersSubscriptionForm';

const SectionWrapper = styled.section`
  width: 100%;
  padding: 80px 20px;
  background: linear-gradient(135deg, #f5f5f5 0%, #fafafa 100%);
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 60px 16px;
  }

  @media (max-width: 640px) {
    padding: 48px 16px;
  }

  /* Background decorative elements */
  &::before {
    content: '';
    position: absolute;
    top: -40%;
    right: -10%;
    width: 400px;
    height: 400px;
    background: radial-gradient(circle, rgba(91, 77, 255, 0.1) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    content: '';
    position: absolute;
    bottom: -20%;
    left: -5%;
    width: 300px;
    height: 300px;
    background: radial-gradient(circle, rgba(91, 77, 255, 0.05) 0%, transparent 70%);
    border-radius: 50%;
    pointer-events: none;
  }
`;

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
`;

const HeaderSection = styled.div`
  text-align: center;
  margin-bottom: 48px;

  @media (max-width: 640px) {
    margin-bottom: 36px;
  }
`;

const Badge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: linear-gradient(135deg, rgba(91, 77, 255, 0.1) 0%, rgba(76, 63, 209, 0.05) 100%);
  border: 1px solid rgba(91, 77, 255, 0.2);
  padding: 8px 12px;
  border-radius: 20px;
  margin-bottom: 16px;
  font-size: 12px;
  font-weight: 600;
  color: #5b4dff;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

const Title = styled.h2`
  font-size: 44px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 16px 0;
  line-height: 1.2;

  @media (max-width: 768px) {
    font-size: 36px;
  }

  @media (max-width: 640px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 18px;
  color: #6b7280;
  margin: 0;
  line-height: 1.6;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const CounterSection = styled.div`
  margin-bottom: 48px;
  display: flex;
  justify-content: center;

  @media (max-width: 640px) {
    margin-bottom: 36px;
  }
`;

const FormSection = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 40px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);

  @media (max-width: 640px) {
    padding: 24px;
  }
`;

const FormDescription = styled.p`
  font-size: 14px;
  color: #6b7280;
  text-align: center;
  margin: 0;
  line-height: 1.5;
`;

/**
 * FollowersSection
 * Main landing page section for follower counter and subscription
 */
export default function FollowersSection() {
  return (
    <SectionWrapper>
      <Container>
        <HeaderSection>
          <Badge>
            <Crown size={14} />
            Join the Movement
          </Badge>

          <Title>Be Part of Something Great</Title>

          <Subtitle>
            Join thousands of others who are following SphereKings. Get exclusive updates,
            early access to new features, and stay connected to our growing community.
          </Subtitle>
        </HeaderSection>

        <CounterSection>
          <FollowerCounter />
        </CounterSection>

        <FormSection>
          <FollowersSubscriptionForm />
          <FormDescription style={{ marginTop: '16px' }}>
            ✨ Be part of our kingdom. Real people, real growth, real opportunities.
          </FormDescription>
        </FormSection>
      </Container>
    </SectionWrapper>
  );
}
