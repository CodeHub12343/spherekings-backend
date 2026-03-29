/**
 * My Sponsorships Page
 * Display user's active sponsorships and tracking
 */

'use client';

import styled from 'styled-components';
import { useMySponsorships } from '@/api/hooks/useSponsorship';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';

const PageContainer = styled.div`
  width: 100%;
  min-height: 100vh;
  background: #f9fafb;
  padding: 60px 20px;

  @media (max-width: 768px) {
    padding: 40px 16px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 48px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 24px;
  }
`;

const Heading = styled.h1`
  font-size: 36px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
`;

const SponsorshipsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SponsorshipCard = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border-left: 4px solid ${(props) => {
    if (props.status === 'completed') return '#10b981';
    if (props.status === 'active') return '#5b4dff';
    if (props.status === 'in_progress') return '#f59e0b';
    if (props.status === 'pending_payment') return '#9ca3af';
    return '#dc2626';
  }};
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.12);
  }
`;

const TierName = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px 0;
`;

const Status = styled.div`
  display: inline-block;
  background: ${(props) => {
    if (props.status === 'completed') return '#ecfdf5';
    if (props.status === 'active') return '#eef2ff';
    if (props.status === 'in_progress') return '#fef3c7';
    if (props.status === 'pending_payment') return '#f3f4f6';
    return '#fee2e2';
  }};
  color: ${(props) => {
    if (props.status === 'completed') return '#047857';
    if (props.status === 'active') return '#4338ca';
    if (props.status === 'in_progress') return '#a16207';
    if (props.status === 'pending_payment') return '#6b7280';
    return '#991b1b';
  }};
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  margin-bottom: 16px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
  padding: 16px 0;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const InfoItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InfoLabel = styled.span`
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  font-weight: 600;
  letter-spacing: 0.5px;
`;

const InfoValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;
`;

const ProgressSection = styled.div`
  margin-top: 16px;
`;

const ProgressLabel = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  color: #6b7280;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background: #e5e7eb;
  border-radius: 4px;
  overflow: hidden;

  .bar {
    height: 100%;
    background: linear-gradient(90deg, #5b4dff, #4338ca);
    width: ${(props) => props.percentage || 0}%;
    transition: width 0.3s ease;
  }
`;

const DateRange = styled.div`
  font-size: 13px;
  color: #6b7280;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #e5e7eb;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border-radius: 12px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #4b5563;
    margin: 0 0 12px 0;
  }

  p {
    font-size: 14px;
    color: #9ca3af;
    margin: 0 0 24px 0;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 60px 20px;

  p {
    color: #6b7280;
  }
`;

export default function MySponsorshipsPage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const { data: sponsorshipsData, isLoading } = useMySponsorships();

  if (!isAuthenticated) {
    return (
      <PageContainer>
        <ContentWrapper>
          <EmptyState>
            <h3>Please Sign In</h3>
            <p>You need to be logged in to view your sponsorships</p>
            <Button onClick={() => router.push('/login')}>Sign In</Button>
          </EmptyState>
        </ContentWrapper>
      </PageContainer>
    );
  }

  if (isLoading) {
    return (
      <PageContainer>
        <ContentWrapper>
          <LoadingContainer>
            <p>Loading your sponsorships...</p>
          </LoadingContainer>
        </ContentWrapper>
      </PageContainer>
    );
  }

  const sponsorships = sponsorshipsData?.data || [];

  return (
    <PageContainer>
      <ContentWrapper>
        <Header>
          <Heading>My Sponsorships</Heading>
          <Button variant="primary" onClick={() => router.push('/sponsorship/tiers')}>
            Buy More
          </Button>
        </Header>

        {sponsorships.length === 0 ? (
          <EmptyState>
            <h3>No Active Sponsorships</h3>
            <p>You haven't purchased any sponsorships yet. Browse our tiers to get started!</p>
            <Button variant="primary" onClick={() => router.push('/sponsorship/tiers')}>
              View Sponsorship Tiers
            </Button>
          </EmptyState>
        ) : (
          <SponsorshipsGrid>
            {sponsorships.map((sponsorship) => {
              const progressPercentage =
                sponsorship.videoMentions > 0
                  ? Math.round((sponsorship.videosCompleted / sponsorship.videoMentions) * 100)
                  : 0;

              const startDate = sponsorship.promotionStartDate
                ? new Date(sponsorship.promotionStartDate).toLocaleDateString()
                : 'TBD';

              const endDate = sponsorship.promotionEndDate
                ? new Date(sponsorship.promotionEndDate).toLocaleDateString()
                : 'TBD';

              return (
                <SponsorshipCard key={sponsorship._id} status={sponsorship.status}>
                  <Status status={sponsorship.status}>{sponsorship.status.replace(/_/g, ' ')}</Status>

                  <TierName>{sponsorship.tierName}</TierName>

                  <InfoGrid>
                    <InfoItem>
                      <InfoLabel>Amount</InfoLabel>
                      <InfoValue>${(sponsorship.amount / 100).toFixed(2)}</InfoValue>
                    </InfoItem>

                    <InfoItem>
                      <InfoLabel>Videos Included</InfoLabel>
                      <InfoValue>{sponsorship.videoMentions}</InfoValue>
                    </InfoItem>
                  </InfoGrid>

                  {sponsorship.status !== 'pending_payment' && (
                    <ProgressSection>
                      <ProgressLabel>
                        <span>Campaign Progress</span>
                        <span>
                          {sponsorship.videosCompleted} / {sponsorship.videoMentions}
                        </span>
                      </ProgressLabel>
                      <ProgressBar percentage={progressPercentage}>
                        <div className="bar" />
                      </ProgressBar>
                    </ProgressSection>
                  )}

                  {/* Show uploaded videos */}
                  {sponsorship.videoLinks && sponsorship.videoLinks.length > 0 && (
                    <div style={{ 
                      marginTop: '12px', 
                      paddingTop: '12px', 
                      borderTop: '1px solid #e5e7eb',
                      fontSize: '13px'
                    }}>
                      <div style={{ fontWeight: 600, marginBottom: '8px', color: '#1f2937' }}>
                        📹 Posted Videos ({sponsorship.videoLinks.length})
                      </div>
                      {sponsorship.videoLinks.map((video) => (
                        <div
                          key={video._id}
                          style={{
                            marginBottom: '8px',
                            padding: '8px',
                            background: '#f9fafb',
                            borderRadius: '4px',
                            border: '1px solid #e5e7eb',
                          }}
                        >
                          <div style={{ fontWeight: 500, marginBottom: '4px', color: '#1f2937' }}>
                            {video.title || 'Untitled'} ({video.platform})
                          </div>
                          <a
                            href={video.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{
                              color: '#5b4dff',
                              textDecoration: 'none',
                              fontSize: '12px',
                              wordBreak: 'break-word',
                              display: 'block',
                              marginBottom: '4px',
                            }}
                          >
                            {video.url}
                          </a>
                          <div style={{ fontSize: '11px', color: '#9ca3af' }}>
                            Posted: {new Date(video.postedAt).toLocaleDateString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <DateRange>
                    📅 {startDate} to {endDate}
                  </DateRange>
                </SponsorshipCard>
              );
            })}
          </SponsorshipsGrid>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
