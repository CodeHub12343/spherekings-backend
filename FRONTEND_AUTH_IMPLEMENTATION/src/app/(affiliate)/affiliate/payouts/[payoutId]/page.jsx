/**
 * Affiliate Payout Detail Page
 * /affiliate/payouts/[payoutId]
 *
 * Displays detailed information about a specific payout
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { usePayoutDetail } from '@/api/hooks/usePayouts';
import PayoutStatusBadge from '@/components/payouts/PayoutStatusBadge';

const PageContainer = styled.div`
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;

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
    text-align: right;
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

const TimelineContainer = styled.div`
  position: relative;
  padding-left: 30px;
`;

const TimelineItem = styled.div`
  position: relative;
  padding-bottom: 20px;

  &::before {
    content: '';
    position: absolute;
    left: -30px;
    top: 0;
    width: 12px;
    height: 12px;
    background-color: #2563eb;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 0 1px #2563eb;
  }

  &:last-child {
    padding-bottom: 0;

    &::after {
      content: '';
      position: absolute;
      left: -24px;
      top: 18px;
      width: 1px;
      height: 0;
      background-color: transparent;
    }
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    left: -24px;
    top: 18px;
    width: 1px;
    height: calc(100% + 2px);
    background-color: #e0e0e0;
  }
`;

const TimelineDate = styled.div`
  font-size: 12px;
  color: #999;
  margin-bottom: 4px;
`;

const TimelineText = styled.div`
  font-size: 13px;
  color: #333;
`;

export default function AffiliatePayoutDetailPage() {
  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const payoutId = params?.payoutId;

  const { data: payout, isLoading, error } = usePayoutDetail(payoutId, {
    enabled: isAuthenticated && !authLoading && !!payoutId
  });

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
        <LoadingMessage>Loading payout details...</LoadingMessage>
      </PageContainer>
    );
  }

  if (error) {
    return (
      <PageContainer>
        <ErrorMessage>{error.message || 'Failed to load payout details'}</ErrorMessage>
      </PageContainer>
    );
  }

  if (!payout) {
    return (
      <PageContainer>
        <ErrorMessage>Payout not found</ErrorMessage>
      </PageContainer>
    );
  }

  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleString();

  return (
    <PageContainer>
      <PageHeader>
        <h1>Payout #{payout._id.slice(-8).toUpperCase()}</h1>
        <button onClick={() => router.back()}>← Back</button>
      </PageHeader>

      {/* Status */}
      <DetailCard>
        <DetailSection>
          <SectionTitle>Status</SectionTitle>
          <DetailRow>
            <DetailLabel>Current Status</DetailLabel>
            <DetailValue className="status">
              <PayoutStatusBadge status={payout.status} showDot />
            </DetailValue>
          </DetailRow>
        </DetailSection>
      </DetailCard>

      {/* Amount & Method */}
      <DetailCard>
        <DetailSection>
          <SectionTitle>Payout Information</SectionTitle>
          <DetailRow>
            <DetailLabel>Amount</DetailLabel>
            <DetailValue className="currency">
              {formatCurrency(payout.amount)}
            </DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Payment Method</DetailLabel>
            <DetailValue>
              {payout.method?.replace(/_/g, ' ').toUpperCase()}
            </DetailValue>
          </DetailRow>
        </DetailSection>
      </DetailCard>

      {/* Dates */}
      <DetailCard>
        <DetailSection>
          <SectionTitle>Timeline</SectionTitle>
          <DetailRow>
            <DetailLabel>Requested</DetailLabel>
            <DetailValue>{formatDate(payout.request?.submittedAt || payout.createdAt)}</DetailValue>
          </DetailRow>
          {payout.approval?.approvedAt && (
            <DetailRow>
              <DetailLabel>Approved</DetailLabel>
              <DetailValue>{formatDate(payout.approval.approvedAt)}</DetailValue>
            </DetailRow>
          )}
          {payout.payment?.paidAt && (
            <DetailRow>
              <DetailLabel>Paid</DetailLabel>
              <DetailValue>{formatDate(payout.payment.paidAt)}</DetailValue>
            </DetailRow>
          )}
        </DetailSection>
      </DetailCard>

      {/* Beneficiary Information */}
      {payout.request?.beneficiary && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Beneficiary Information</SectionTitle>
            <DetailRow>
              <DetailLabel>Name</DetailLabel>
              <DetailValue>{payout.request.beneficiary.accountHolderName}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Bank Name</DetailLabel>
              <DetailValue>{payout.request.beneficiary.bankName}</DetailValue>
            </DetailRow>
            <DetailRow>
              <DetailLabel>Account Number</DetailLabel>
              <DetailValue>****{payout.request.beneficiary.accountNumber?.slice(-4)}</DetailValue>
            </DetailRow>
          </DetailSection>
        </DetailCard>
      )}

      {/* Payment Details */}
      {payout.payment?.transactionId && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Payment Details</SectionTitle>
            <DetailRow>
              <DetailLabel>Transaction ID</DetailLabel>
              <DetailValue>{payout.payment.transactionId}</DetailValue>
            </DetailRow>
            {payout.payment.receiptId && (
              <DetailRow>
                <DetailLabel>Receipt ID</DetailLabel>
                <DetailValue>{payout.payment.receiptId}</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </DetailCard>
      )}

      {/* Notes */}
      {payout.request?.notes && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Additional Notes</SectionTitle>
            <DetailRow>
              <DetailValue>{payout.request.notes}</DetailValue>
            </DetailRow>
          </DetailSection>
        </DetailCard>
      )}

      {/* Status History */}
      {payout.statusHistory && payout.statusHistory.length > 0 && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Status History</SectionTitle>
            <TimelineContainer>
              {[...payout.statusHistory].reverse().map((item, index) => (
                <TimelineItem key={index}>
                  <TimelineDate>{formatDate(item.changedAt)}</TimelineDate>
                  <TimelineText>
                    {item.status.charAt(0).toUpperCase() + item.status.slice(1)}
                    {item.reason && ` - ${item.reason}`}
                  </TimelineText>
                </TimelineItem>
              ))}
            </TimelineContainer>
          </DetailSection>
        </DetailCard>
      )}
    </PageContainer>
  );
}
