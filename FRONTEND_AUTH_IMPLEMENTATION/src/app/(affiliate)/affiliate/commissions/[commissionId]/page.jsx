/**
 * Affiliate Commission Detail Page
 * /affiliate/commissions/[commissionId]
 * 
 * Displays:
 * - Commission details
 * - Status and payment information
 * - Referral and order information
 */

'use client';

import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useCommissionDetail } from '@/api/hooks/useCommissions';
import CommissionStatusBadge from '@/components/commissions/CommissionStatusBadge';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h1 {
    margin: 0;
    font-size: 28px;
    font-weight: 700;
  }

  button {
    padding: 10px 20px;
    background-color: #6c757d;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;

    &:hover {
      background-color: #545b62;
    }
  }
`;

const DetailCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const DetailSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e0e0e0;
  color: #333;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;

  &:last-child {
    border-bottom: none;
  }
`;

const DetailLabel = styled.div`
  font-weight: 500;
  color: #666;
  min-width: 200px;
`;

const DetailValue = styled.div`
  color: #333;
  text-align: right;
  font-weight: 500;

  &.currency {
    color: #27ae60;
    font-family: 'Courier New', monospace;
  }

  &.status {
    display: flex;
    justify-content: flex-end;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

/**
 * Commission Detail Page
 */
export default function CommissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const commissionId = params?.commissionId;

  const { data: commission, isLoading, error } = useCommissionDetail(
    commissionId,
    { enabled: isAuthenticated && !authLoading && !!commissionId }
  );

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Verifying authentication...</LoadingMessage>
      </PageContainer>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Loading commission details...</LoadingMessage>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>{error.message || 'Failed to load commission details'}</ErrorMessage>
      </PageContainer>
    );
  }

  if (!commission) {
    return (
      <PageContainer>
        <ErrorMessage>Commission not found</ErrorMessage>
      </PageContainer>
    );
  }

  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleString();
  const formatPercentage = (rate) => `${(rate * 100).toFixed(2)}%`;

  return (
    <PageContainer>
      <PageHeader>
        <h1>Commission #{commission.orderNumber}</h1>
        <button onClick={() => router.back()}>← Back</button>
      </PageHeader>

      <GridLayout>
        {/* Commission Details */}
        <DetailCard>
          <DetailSection>
            <SectionTitle>Commission Details</SectionTitle>
            <DetailRow>
              <DetailLabel>Order Number</DetailLabel>
              <DetailValue>{commission.orderNumber}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Status</DetailLabel>
              <DetailValue className="status">
                <CommissionStatusBadge status={commission.status} />
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Created Date</DetailLabel>
              <DetailValue>{formatDate(commission.createdAt)}</DetailValue>
            </DetailRow>
          </DetailSection>
        </DetailCard>

        {/* Calculation Details */}
        <DetailCard>
          <DetailSection>
            <SectionTitle>Calculation</SectionTitle>
            <DetailRow>
              <DetailLabel>Order Total</DetailLabel>
              <DetailValue className="currency">
                {formatCurrency(commission.calculation.orderTotal)}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Commission Rate</DetailLabel>
              <DetailValue className="currency">
                {formatPercentage(commission.calculation.rate)}
              </DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Commission Amount</DetailLabel>
              <DetailValue className="currency">
                {formatCurrency(commission.calculation.amount)}
              </DetailValue>
            </DetailRow>
            {commission.calculation.tier && (
              <DetailRow>
                <DetailLabel>Tier</DetailLabel>
                <DetailValue>{commission.calculation.tier}</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </DetailCard>
      </GridLayout>

      {/* Payment Information */}
      {commission.status === 'paid' && commission.payment && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Payment Information</SectionTitle>
            <DetailRow>
              <DetailLabel>Payment Method</DetailLabel>
              <DetailValue>{commission.payment.method}</DetailValue>
            </DetailRow>
            {commission.payment.transactionId && (
              <DetailRow>
                <DetailLabel>Transaction ID</DetailLabel>
                <DetailValue>{commission.payment.transactionId}</DetailValue>
              </DetailRow>
            )}
            {commission.payment.receiptId && (
              <DetailRow>
                <DetailLabel>Receipt ID</DetailLabel>
                <DetailValue>{commission.payment.receiptId}</DetailValue>
              </DetailRow>
            )}
            {commission.payment.paidAt && (
              <DetailRow>
                <DetailLabel>Paid Date</DetailLabel>
                <DetailValue>{formatDate(commission.payment.paidAt)}</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </DetailCard>
      )}

      {/* Referral Information */}
      {commission.referral && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Referral Information</SectionTitle>
            {commission.referral.source && (
              <DetailRow>
                <DetailLabel>Traffic Source</DetailLabel>
                <DetailValue>{commission.referral.source}</DetailValue>
              </DetailRow>
            )}
            {commission.referral.device && (
              <DetailRow>
                <DetailLabel>Device</DetailLabel>
                <DetailValue>{commission.referral.device}</DetailValue>
              </DetailRow>
            )}
            {commission.referral.utmCampaign && (
              <DetailRow>
                <DetailLabel>UTM Campaign</DetailLabel>
                <DetailValue>{commission.referral.utmCampaign}</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </DetailCard>
      )}

      {/* Fraud Indicators */}
      {commission.fraudIndicators?.flagged && (
        <DetailCard style={{ borderColor: '#dc3545', backgroundColor: '#fff5f5' }}>
          <DetailSection>
            <SectionTitle style={{ color: '#dc3545' }}>⚠️ Fraud Alert</SectionTitle>
            <DetailRow>
              <DetailLabel>Risk Level</DetailLabel>
              <DetailValue>{commission.fraudIndicators.riskLevel}</DetailValue>
            </DetailRow>
            {commission.fraudIndicators.reason && (
              <DetailRow>
                <DetailLabel>Reason</DetailLabel>
                <DetailValue>{commission.fraudIndicators.reason}</DetailValue>
              </DetailRow>
            )}
            {commission.fraudIndicators.score !== undefined && (
              <DetailRow>
                <DetailLabel>Fraud Score</DetailLabel>
                <DetailValue>{commission.fraudIndicators.score}%</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </DetailCard>
      )}

      {/* Status History */}
      {commission.statusHistory && commission.statusHistory.length > 0 && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Status History</SectionTitle>
            {commission.statusHistory.map((history, index) => (
              <DetailRow key={index}>
                <DetailLabel>
                  {formatDate(history.changedAt)}
                </DetailLabel>
                <DetailValue>
                  {history.status.charAt(0).toUpperCase() + history.status.slice(1)}
                  {history.reason && ` - ${history.reason}`}
                </DetailValue>
              </DetailRow>
            ))}
          </DetailSection>
        </DetailCard>
      )}
    </PageContainer>
  );
}
