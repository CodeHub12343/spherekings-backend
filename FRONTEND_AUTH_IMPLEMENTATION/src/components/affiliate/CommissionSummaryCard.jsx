/**
 * Commission Summary Card Component
 * Displays earnings breakdown and payout threshold
 */

import styled from 'styled-components';
import { TrendingUp, Wallet, AlertCircle } from 'lucide-react';
import React from 'react';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const CardIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;

  ${(props) => {
    switch (props.$variant) {
      case 'total':
        return `background-color: #e3f2fd; color: #1565c0;`;
      case 'pending':
        return `background-color: #fff3cd; color: #856404;`;
      case 'paid':
        return `background-color: #d4edda; color: #155724;`;
      default:
        return `background-color: #f0f0f0; color: #666;`;
    }
  }}
`;

const CardTitle = styled.h4`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardValue = styled.div`
  font-size: 32px;
  font-weight: 700;
  color: #333;
  margin: 12px 0 8px 0;
  font-family: 'Monaco', 'Courier New', monospace;
`;

const CardSubtext = styled.p`
  margin: 0;
  font-size: 13px;
  color: #999;
  line-height: 1.4;
`;

const ThresholdContainer = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
`;

const ThresholdLabel = styled.div`
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 8px;
  background-color: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const ProgressFill = styled.div`
  height: 100%;
  background-color: ${(props) =>
    props.$percentage >= 100 ? '#28a745' : '#4a90e2'};
  width: ${(props) => Math.min(props.$percentage, 100)}%;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 12px;
  color: #666;
  text-align: right;
`;

const ReadyBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 12px;
`;

const LowBudgetAlert = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 6px;
  color: #856404;
  font-size: 13px;
  line-height: 1.5;
  margin-top: 12px;
`;

export const CommissionSummaryCard = ({
  earnings = {
    totalEarnings: 0,
    pendingEarnings: 0,
    paidEarnings: 0,
    meetsThreshold: false,
    minimumPayoutThreshold: 50,
  },
}) => {
  const {
    totalEarnings = 0,
    pendingEarnings = 0,
    paidEarnings = 0,
    meetsThreshold = false,
    minimumPayoutThreshold = 50,
  } = earnings;

  React.useEffect(() => {
    console.log(`🔵[FRONTEND] CommissionSummaryCard received earnings:`, earnings);
    console.log(`   Total Earnings: $${totalEarnings}`);
    console.log(`   Pending: $${pendingEarnings}`);
    console.log(`   Paid Out: $${paidEarnings}\n`);
  }, [earnings, totalEarnings, pendingEarnings, paidEarnings]);

  const thresholdPercentage = (totalEarnings / minimumPayoutThreshold) * 100;

  return (
    <Container>
      {/* Total Earnings Card */}
      <Card>
        <CardHeader>
          <CardIcon $variant="total">
            <TrendingUp size={24} />
          </CardIcon>
          <CardTitle>Total Earnings</CardTitle>
        </CardHeader>
        <CardValue>${totalEarnings.toFixed(2)}</CardValue>
        <CardSubtext>Lifetime commission earnings</CardSubtext>
      </Card>

      {/* Pending Earnings Card */}
      <Card>
        <CardHeader>
          <CardIcon $variant="pending">
            <Wallet size={24} />
          </CardIcon>
          <CardTitle>Pending Earnings</CardTitle>
        </CardHeader>
        <CardValue>${pendingEarnings.toFixed(2)}</CardValue>
        <CardSubtext>Awaiting approval from sales</CardSubtext>
      </Card>

      {/* Paid Earnings Card */}
      <Card>
        <CardHeader>
          <CardIcon $variant="paid">✓</CardIcon>
          <CardTitle>Paid Out</CardTitle>
        </CardHeader>
        <CardValue>${paidEarnings.toFixed(2)}</CardValue>
        <CardSubtext>Successfully paid commissions</CardSubtext>
      </Card>

      {/* Payout Threshold Card */}
      <Card>
        <CardHeader>
          <CardIcon>🎯</CardIcon>
          <CardTitle>Payout Threshold</CardTitle>
        </CardHeader>
        <ThresholdContainer>
          <ThresholdLabel>
            Minimum ${minimumPayoutThreshold.toFixed(2)} Required
          </ThresholdLabel>
          <ProgressBar>
            <ProgressFill $percentage={thresholdPercentage} />
          </ProgressBar>
          <ProgressText>
            {thresholdPercentage.toFixed(0)}% Complete
          </ProgressText>

          {meetsThreshold ? (
            <ReadyBadge>✓ Ready for Payout</ReadyBadge>
          ) : (
            <LowBudgetAlert>
              <AlertCircle size={16} />
              ${(minimumPayoutThreshold - totalEarnings).toFixed(2)} more to reach
              threshold
            </LowBudgetAlert>
          )}
        </ThresholdContainer>
      </Card>
    </Container>
  );
};

export default CommissionSummaryCard;
