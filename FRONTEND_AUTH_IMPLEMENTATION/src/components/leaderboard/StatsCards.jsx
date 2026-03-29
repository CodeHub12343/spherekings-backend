'use client';

import styled from 'styled-components';
import { TrendingUp, Users, DollarSign, Award } from 'lucide-react';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  transition: all 0.3s ease;

  &:hover {
    border-color: #5b4dff;
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.1);
    transform: translateY(-2px);
  }
`;

const StatHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.5px;
  margin: 0;
`;

const StatIcon = styled.div`
  width: 40px;
  height: 40px;
  background: linear-gradient(135deg, #5b4dff 0%, #a78bfa 100%);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;

  svg {
    width: 20px;
    height: 20px;
  }
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 8px 0;
`;

const StatTrend = styled.div`
  font-size: 12px;
  color: #10b981;
  display: flex;
  align-items: center;
  gap: 4px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

/**
 * LeaderboardStatsCards Component
 * 
 * Displays key performance metrics for the affiliate leaderboard
 */
export default function StatsCards({ stats = {}, timeframe = 'all' }) {
  const {
    totalAffiliates = 0,
    activeCampaigns = 0,
    totalCommissions = 0,
    topCommission = 0,
  } = stats;

  const cards = [
    {
      label: 'Total Affiliates',
      value: totalAffiliates.toLocaleString(),
      icon: Users,
      trend: '+12%',
    },
    {
      label: 'Active Campaigns',
      value: activeCampaigns,
      icon: Award,
      trend: '+8%',
    },
    {
      label: 'Total Commissions',
      value: `$${totalCommissions.toLocaleString()}`,
      icon: DollarSign,
      trend: '+24%',
    },
    {
      label: 'Top Commission',
      value: `$${topCommission.toLocaleString()}`,
      icon: TrendingUp,
      trend: `${timeframe}`,
    },
  ];

  return (
    <Container>
      {cards.map((card, index) => (
        <StatCard key={index}>
          <StatHeader>
            <StatLabel>{card.label}</StatLabel>
            <StatIcon>
              <card.icon />
            </StatIcon>
          </StatHeader>
          <StatValue>{card.value}</StatValue>
          <StatTrend>
            <TrendingUp size={14} />
            {card.trend}
          </StatTrend>
        </StatCard>
      ))}
    </Container>
  );
}
