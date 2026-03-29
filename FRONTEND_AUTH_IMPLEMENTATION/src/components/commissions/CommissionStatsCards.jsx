/**
 * Commission Statistics Cards Component
 * Display commission summary statistics
 */

import React from 'react';
import styled from 'styled-components';

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;

  &:hover {
    border-color: #bbb;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.12);
  }

  ${(props) =>
    props.$highlighted &&
    `
    border-color: #2563eb;
    background: #f0f6ff;
  `}

  @media (max-width: 640px) {
    padding: 16px;
    min-height: auto;
  }

  @media (max-width: 480px) {
    padding: 14px;
  }
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    font-size: 0.7rem;
    margin-bottom: 8px;
  }
`;

const StatValue = styled.div`
  font-size: 1.875rem;
  font-weight: 700;
  color: #111827;
  margin-bottom: 8px;

  @media (max-width: 640px) {
    font-size: 1.5rem;
  }

  @media (max-width: 480px) {
    font-size: 1.25rem;
  }
`;

const StatSubtext = styled.div`
  font-size: 0.75rem;
  color: #6b7280;
  margin-top: 8px;

  @media (max-width: 480px) {
    font-size: 0.7rem;
    margin-top: 6px;
  }
`;

const CurrencyValue = styled(StatValue)`
  color: #27ae60;
`;

const PercentageChange = styled.span`
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 4px;
  background-color: ${(props) => (props.$positive ? '#d4edda' : '#f8d7da')};
  color: ${(props) => (props.$positive ? '#155724' : '#721c24')};
  margin-left: 8px;
`;

/**
 * Commission Statistics Cards
 * 
 * @param {Object} stats - Statistics object
 * @returns {JSX.Element}
 */
export function CommissionStatsCards({ stats, onRefresh }) {
  React.useEffect(() => {
    console.log(`🔵[FRONTEND] CommissionStatsCards received stats:`, stats);
  }, [stats]);

  if (!stats) {
    console.warn('⚠️ [FRONTEND] CommissionStatsCards: No stats provided');
    return null;
  }

  const {
    totalCommissions = 0,
    pendingCount = 0,
    approvedCount = 0,
    paidCount = 0,
    reversedCount = 0,
    totalEarned = 0,
    totalPending = 0,
    totalApproved = 0,
    averageCommission = 0,
    maxCommission = 0,
  } = stats;

  console.log(`✅[FRONTEND] Commission stats parsed:`);
  console.log(`   Total Earned (paid commissions): $${totalEarned}`);
  console.log(`   Paid Count: ${paidCount}`);
  console.log(`   Approved Count: ${approvedCount}\n`);

  return (
    <StatsGrid>
      {/* Total Earned */}
      <StatCard $highlighted>
        <StatLabel>Total Earned</StatLabel>
        <CurrencyValue>${totalEarned?.toFixed(2) || '0.00'}</CurrencyValue>
        <StatSubtext>{paidCount} paid commissions</StatSubtext>
      </StatCard>

      {/* Pending Commissions */}
      <StatCard>
        <StatLabel>Pending</StatLabel>
        <StatValue>{pendingCount}</StatValue>
        <StatSubtext>${totalPending?.toFixed(2) || '0.00'} in total</StatSubtext>
      </StatCard>

      {/* Approved Commissions */}
      <StatCard>
        <StatLabel>Approved</StatLabel>
        <StatValue>{approvedCount}</StatValue>
        <StatSubtext>${totalApproved?.toFixed(2) || '0.00'} in total</StatSubtext>
      </StatCard>

      {/* Average Commission */}
      <StatCard>
        <StatLabel>Average Commission</StatLabel>
        <CurrencyValue>${averageCommission?.toFixed(2) || '0.00'}</CurrencyValue>
        <StatSubtext>Per commission</StatSubtext>
      </StatCard>

      {/* Max Commission */}
      <StatCard>
        <StatLabel>Highest Commission</StatLabel>
        <CurrencyValue>${maxCommission?.toFixed(2) || '0.00'}</CurrencyValue>
        <StatSubtext>Best single commission</StatSubtext>
      </StatCard>

      {/* Total */}
      <StatCard>
        <StatLabel>Total Commissions</StatLabel>
        <StatValue>{totalCommissions}</StatValue>
        <StatSubtext>
          {reversedCount > 0 && `${reversedCount} reversed`}
        </StatSubtext>
      </StatCard>
    </StatsGrid>
  );
}

export default CommissionStatsCards;
