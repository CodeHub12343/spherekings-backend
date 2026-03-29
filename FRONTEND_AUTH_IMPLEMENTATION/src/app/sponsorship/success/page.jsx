/**
 * Sponsorship Success Page
 * Confirmation page after successful payment
 */

'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSponsorshipRecord } from '@/api/hooks/useSponsorship';
import Button from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: linear-gradient(135deg, #ecfdf5 0%, #e0fdf4 100%);
  padding: 60px 20px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const SuccessCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 48px;
  max-width: 600px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(16, 185, 129, 0.1);
  text-align: center;

  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const SuccessIcon = styled.div`
  font-size: 64px;
  margin-bottom: 24px;
  animation: bounce 0.6s ease-in-out;

  @keyframes bounce {
    0% {
      transform: scale(0.5);
      opacity: 0;
    }
    50% {
      transform: scale(1.05);
    }
    100% {
      transform: scale(1);
      opacity: 1;
    }
  }
`;

const Title = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #065f46;
  margin: 0 0 16px 0;

  @media (max-width: 768px) {
    font-size: 28px;
  }
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #047857;
  margin: 0 0 32px 0;
  line-height: 1.6;
`;

const InfoSection = styled.div`
  background: #f0fdf4;
  border: 1px solid #bbf7d0;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #bbf7d0;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const InfoLabel = styled.span`
  font-size: 14px;
  color: #6b7280;
  font-weight: 500;
`;

const InfoValue = styled.span`
  font-size: 14px;
  color: #047857;
  font-weight: 600;
`;

const TimelineSection = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 32px;
  text-align: left;
`;

const TimelineTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
  text-align: center;
`;

const Timeline = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const TimelineItem = styled.div`
  display: flex;
  gap: 12px;

  .timeline-icon {
    flex-shrink: 0;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    background: ${(props) => (props.completed ? '#10b981' : '#d1d5db')};
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 16px;
  }

  .timeline-content {
    flex: 1;
    padding-top: 4px;
  }

  .timeline-label {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 2px;
  }

  .timeline-desc {
    font-size: 13px;
    color: #6b7280;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: center;

  @media (max-width: 480px) {
    flex-direction: column;

    button {
      width: 100%;
    }
  }
`;

const LoadingContainer = styled.div`
  text-align: center;

  p {
    color: #6b7280;
    font-size: 16px;
  }
`;

export default function SponsorshipSuccessPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

  const sessionId = searchParams.get('session_id');
  const recordId = searchParams.get('record_id');

  // Optional: try to fetch record details (but don't block if it fails)
  const { data: recordData, isLoading } = useSponsorshipRecord(recordId, {
    enabled: !!recordId,
  });

  const [isRedirecting, setIsRedirecting] = useState(false);

  useEffect(() => {
    if (!sessionId && !recordId) {
      toast.error('Invalid success page access');
      router.push('/sponsorship/tiers');
    }
  }, [sessionId, recordId, router, toast]);

  const record = recordData?.data;

  // Show success message even without record data
  // Record is just optional extra details
  const showBasicSuccess = sessionId || recordId;

  if (isLoading) {
    return (
      <PageContainer>
        <SuccessCard>
          <SuccessIcon>✅</SuccessIcon>
          <Title>Thank You!</Title>
          <Subtitle>Your sponsorship purchase has been completed successfully.</Subtitle>
          <InfoSection>
            <InfoRow>
              <InfoLabel>Status:</InfoLabel>
              <InfoValue>Processing...</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Confirmation Email:</InfoLabel>
              <InfoValue>Check your email for details</InfoValue>
            </InfoRow>
          </InfoSection>
          <ButtonGroup>
            <Button onClick={() => router.push('/sponsorship/tiers')}>
              View More Tiers
            </Button>
            <Button onClick={() => router.push('/sponsorship/my-sponsorships')}>
              My Sponsorships
            </Button>
          </ButtonGroup>
        </SuccessCard>
      </PageContainer>
    );
  }

  if (!showBasicSuccess) {
    return (
      <PageContainer>
        <SuccessCard>
          <Title>Thank You!</Title>
          <Subtitle>Your sponsorship purchase is being processed. Check your email for confirmation.</Subtitle>
          <ButtonGroup>
            <Button onClick={() => router.push('/sponsorship/tiers')}>
              View More Tiers
            </Button>
            <Button onClick={() => router.push('/dashboard')}>
              Go to Dashboard
            </Button>
          </ButtonGroup>
        </SuccessCard>
      </PageContainer>
    );
  }

  // If record data is not available yet, show basic success
  if (!record) {
    return (
      <PageContainer>
        <SuccessCard>
          <SuccessIcon>✅</SuccessIcon>
          <Title>Payment Confirmed!</Title>
          <Subtitle>Your sponsorship has been activated successfully.</Subtitle>
          <InfoSection>
            <InfoRow>
              <InfoLabel>Status:</InfoLabel>
              <InfoValue style={{ color: '#10b981' }}>Active</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Confirmation Email:</InfoLabel>
              <InfoValue>Check your email for complete details</InfoValue>
            </InfoRow>
          </InfoSection>
          <ButtonGroup>
            <Button onClick={() => router.push('/sponsorship/tiers')}>
              View More Tiers
            </Button>
            <Button onClick={() => router.push('/sponsorship/my-sponsorships')}>
              My Sponsorships
            </Button>
          </ButtonGroup>
        </SuccessCard>
      </PageContainer>
    );
  }

  const sponsorshipStartDate = record.promotionStartDate
    ? new Date(record.promotionStartDate).toLocaleDateString()
    : 'Immediately';

  const sponsorshipEndDate = record.promotionEndDate
    ? new Date(record.promotionEndDate).toLocaleDateString()
    : 'Unknown';

  return (
    <PageContainer>
      <SuccessCard>
        <SuccessIcon>✓</SuccessIcon>

        <Title>Payment Confirmed!</Title>
        <Subtitle>
          Your sponsorship has been activated. Our team will begin posting video mentions across our
          platforms.
        </Subtitle>

        <InfoSection>
          <InfoRow>
            <InfoLabel>Sponsorship Tier:</InfoLabel>
            <InfoValue>{record.tierName}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Amount Paid:</InfoLabel>
            <InfoValue>${(record.amount / 100).toFixed(2)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Video Mentions:</InfoLabel>
            <InfoValue>{record.videoMentions} videos</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Campaign Status:</InfoLabel>
            <InfoValue style={{ color: '#10b981' }}>Active</InfoValue>
          </InfoRow>
        </InfoSection>

        <TimelineSection>
          <TimelineTitle>🎬 What Happens Next?</TimelineTitle>
          <Timeline>
            <TimelineItem completed={true}>
              <div className="timeline-icon">✓</div>
              <div className="timeline-content">
                <div className="timeline-label">Confirmation Email Sent</div>
                <div className="timeline-desc">Check your inbox for sponsorship details</div>
              </div>
            </TimelineItem>

            <TimelineItem completed={true}>
              <div className="timeline-icon">✓</div>
              <div className="timeline-content">
                <div className="timeline-label">Campaign Activation</div>
                <div className="timeline-desc" data-cy="timeline-campaign">
                  Starting {sponsorshipStartDate}
                </div>
              </div>
            </TimelineItem>

            <TimelineItem>
              <div className="timeline-icon">2</div>
              <div className="timeline-content">
                <div className="timeline-label">Video Production & Posting</div>
                <div className="timeline-desc">
                  {record.videoMentions} videos will be posted across our platforms
                </div>
              </div>
            </TimelineItem>

            <TimelineItem>
              <div className="timeline-icon">3</div>
              <div className="timeline-content">
                <div className="timeline-label">Campaign Completion</div>
                <div className="timeline-desc">Ending {sponsorshipEndDate}</div>
              </div>
            </TimelineItem>
          </Timeline>
        </TimelineSection>

        <ButtonGroup>
          <Button
            variant="primary"
            onClick={() => {
              setIsRedirecting(true);
              router.push('/sponsorship/my-sponsorships');
            }}
            disabled={isRedirecting}
          >
            View My Sponsorships
          </Button>
          <Button variant="outline" onClick={() => router.push('/')}>
            Back to Home
          </Button>
        </ButtonGroup>
      </SuccessCard>
    </PageContainer>
  );
}
