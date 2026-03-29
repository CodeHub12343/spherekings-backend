/**
 * PayoutStatsCards Component
 * Displays payout statistics summary cards
 */

import React from 'react';
import styled from 'styled-components';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }

  @media (max-width: 640px) {
    padding: 16px;
    min-height: auto;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const StatLabel = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 500;
  margin-bottom: 8px;
  letter-spacing: 0.5px;

  @media (max-width: 640px) {
    font-size: 0.75rem;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    margin-bottom: 6px;
  }
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 4px;
  word-break: break-word;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
    margin-bottom: 2px;
  }
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #6b7280;

  @media (max-width: 480px) {
    font-size: 0.65rem;
  }
`;

export default function PayoutStatsCards({ stats = {}, approvedEarnings = 0 }) {
  const {
    totalPayouts = 0,
    pendingCount = 0,
    approvedCount = 0,
    completedCount = 0,
    totalPaidOut = 0,
    totalPending = 0
  } = stats;

  React.useEffect(() => {
    console.log(`🔵[FRONTEND] PayoutStatsCards received:`);
    console.log(`   Stats:`, stats);
    console.log(`   Approved Earnings: $${approvedEarnings}`);
  }, [stats, approvedEarnings]);

  console.log(`✅[FRONTEND] Payout stats rendered:`);
  console.log(`   Total Paid Out: $${totalPaidOut}`);
  console.log(`   Available for Payout: $${approvedEarnings}`);
  console.log(`   Completed Count: ${completedCount}\n`);

  return (
    <StatsContainer>
      <StatCard>
        <StatLabel>Available for Payout</StatLabel>
        <StatValue style={{ color: '#2563eb' }}>
          ${approvedEarnings.toFixed(2)}
        </StatValue>
        <StatSubtext>Approved commissions ready</StatSubtext>
      </StatCard>

      <StatCard>
        <StatLabel>Pending Approval</StatLabel>
        <StatValue>{pendingCount}</StatValue>
        <StatSubtext>Awaiting admin review</StatSubtext>
      </StatCard>

      <StatCard>
        <StatLabel>Approved Requests</StatLabel>
        <StatValue>{approvedCount}</StatValue>
        <StatSubtext>Payout requests approved</StatSubtext>
      </StatCard>

      <StatCard>
        <StatLabel>Completed</StatLabel>
        <StatValue>{completedCount}</StatValue>
        <StatSubtext>Successfully paid</StatSubtext>
      </StatCard>

      <StatCard>
        <StatLabel>Total Paid Out</StatLabel>
        <StatValue style={{ color: '#27ae60' }}>
          ${totalPaidOut.toFixed(2)}
        </StatValue>
        <StatSubtext>Sum of completed payouts</StatSubtext>
      </StatCard>

      <StatCard>
        <StatLabel>Total Pending</StatLabel>
        <StatValue style={{ color: '#f39c12' }}>
          ${totalPending.toFixed(2)}
        </StatValue>
        <StatSubtext>Pending + approved amounts</StatSubtext>
      </StatCard>
    </StatsContainer>
  );
}