/**
 * Leaderboard Page
 * Public affiliate rankings and top performers
 */

'use client';

import styled from 'styled-components';
import { useEffect, useState } from 'react';
import { useLeaderboard } from '@/hooks/useLeaderboard';
import LeaderboardTable from '@/components/leaderboard/LeaderboardTable';
import StatsCards from '@/components/leaderboard/StatsCards';
import Link from 'next/link';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 32px 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 40px;
  text-align: center;

  @media (max-width: 640px) {
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;

  @media (max-width: 640px) {
    font-size: 1.875rem;
  }
`;

const Subtitle = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
  line-height: 1.6;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 32px;
  justify-content: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    margin-bottom: 24px;
  }
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 2px solid #d1d5db;
  background: white;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    border-color: #9ca3af;
    color: #374151;
  }

  &.active {
    background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
    border-color: #5b4dff;
    color: white;
  }
`;

const StatsSection = styled.div`
  margin-bottom: 40px;
`;

const TableSection = styled.div`
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  overflow: hidden;

  @media (max-width: 640px) {
    border-radius: 8px;
  }
`;

const CTASection = styled.div`
  margin-top: 48px;
  padding: 40px;
  text-align: center;
  background: linear-gradient(135deg, rgba(91, 77, 255, 0.05) 0%, rgba(76, 63, 204, 0.05) 100%);
  border-radius: 12px;
  border: 1px solid rgba(91, 77, 255, 0.1);

  @media (max-width: 640px) {
    padding: 24px;
    margin-top: 32px;
  }
`;

const CTATitle = styled.h2`
  font-size: 1.5rem;
  font-weight: 700;
  color: #111827;
  margin: 0 0 12px 0;
`;

const CTADescription = styled.p`
  font-size: 1rem;
  color: #6b7280;
  margin: 0 0 24px 0;
  max-width: 500px;
  margin-left: auto;
  margin-right: auto;
`;

const BenefitsList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const BenefitItem = styled.li`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #374151;
  font-size: 0.9rem;

  &:before {
    content: '✓';
    display: flex;
    align-items: center;
    justify-content: center;
    width: 20px;
    height: 20px;
    background: #10b981;
    color: white;
    border-radius: 50%;
    font-size: 0.75rem;
    font-weight: bold;
  }
`;

const CTAButton = styled(Link)`
  display: inline-block;
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  padding: 12px 32px;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  text-align: center;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(91, 77, 255, 0.3);
  }
`;

const LoadingState = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  color: #6b7280;
  font-size: 1rem;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 4px solid #e5e7eb;
  border-top-color: #5b4dff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin-right: 12px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

/**
 * LeaderboardPage Component
 * Displays top performing affiliates
 */
export default function LeaderboardPage() {
  const {
    leaderboard,
    stats,
    isLoading,
    error,
    timeframe,
    setTimeframe,
    fetchLeaderboard,
  } = useLeaderboard();

  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchLeaderboard();
  }, [fetchLeaderboard]);

  const handleTimeframeChange = (newTimeframe) => {
    setTimeframe(newTimeframe);
  };

  return (
    <PageContainer>
      {/* Header */}
      <Header>
        <Title>Affiliate Leaderboard</Title>
        <Subtitle>
          See who's leading the pack. Join our top performers and start earning
          real rewards.
        </Subtitle>
      </Header>

      {/* Timeframe Filter */}
      <FilterContainer>
        <FilterButton
          className={timeframe === 'week' ? 'active' : ''}
          onClick={() => handleTimeframeChange('week')}
        >
          This Week
        </FilterButton>
        <FilterButton
          className={timeframe === 'month' ? 'active' : ''}
          onClick={() => handleTimeframeChange('month')}
        >
          This Month
        </FilterButton>
        <FilterButton
          className={timeframe === 'year' ? 'active' : ''}
          onClick={() => handleTimeframeChange('year')}
        >
          This Year
        </FilterButton>
        <FilterButton
          className={timeframe === 'all' ? 'active' : ''}
          onClick={() => handleTimeframeChange('all')}
        >
          All Time
        </FilterButton>
      </FilterContainer>

      {isLoading ? (
        <LoadingState>
          <Spinner /> Loading leaderboard...
        </LoadingState>
      ) : error ? (
        <LoadingState style={{ color: '#ef4444' }}>
          Failed to load leaderboard. Please try again later.
        </LoadingState>
      ) : (
        <>
          {/* Stats Cards */}
          {stats && (
            <StatsSection>
              <StatsCards stats={stats} timeframe={timeframe} />
            </StatsSection>
          )}

          {/* Leaderboard Table */}
          <TableSection>
            <LeaderboardTable
              data={leaderboard || []}
              timeframe={timeframe}
              emptyMessage="No affiliates found for this period."
            />
          </TableSection>

          {/* Call to Action */}
          <CTASection>
            <CTATitle>Ready to Join the Ranks?</CTATitle>
            <CTADescription>
              Become an affiliate partner and start earning competitive commissions
              on every sale you refer. Our top performers earn $5,000+ per month.
            </CTADescription>

            <BenefitsList>
              <BenefitItem>Up to 30% commission per sale</BenefitItem>
              <BenefitItem>Real-time tracking dashboard</BenefitItem>
              <BenefitItem>Marketing materials included</BenefitItem>
              <BenefitItem>Weekly payouts</BenefitItem>
              <BenefitItem>Dedicated support team</BenefitItem>
              <BenefitItem>Performance bonuses</BenefitItem>
            </BenefitsList>

            <div style={{ display: 'flex', gap: '12px', justifyContent: 'center', flexWrap: 'wrap' }}>
              <CTAButton href="/affiliate/register">Become an Affiliate</CTAButton>
              <CTAButton href="/affiliate/apply" style={{ background: 'white', color: '#5b4dff', border: '2px solid #5b4dff' }}>
                Learn More
              </CTAButton>
            </div>
          </CTASection>
        </>
      )}
    </PageContainer>
  );
}
