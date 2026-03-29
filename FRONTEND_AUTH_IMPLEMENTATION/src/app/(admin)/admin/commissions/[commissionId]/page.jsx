/**
 * Admin Commission Detail Page
 * /admin/commissions/[commissionId]
 * 
 * Displays:
 * - Full commission details
 * - Fraud indicators
 * - Payment information
 * - Status history
 * - Admin actions (approve, pay, reverse)
 */

'use client';

import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useRouter, useParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useQueryClient } from '@tanstack/react-query';
import {
  useCommissionDetail,
  useApproveCommission,
  useMarkCommissionAsPaid,
  useReverseCommission,
} from '@/api/hooks/useCommissions';
import CommissionStatusBadge from '@/components/commissions/CommissionStatusBadge';
import {
  ApprovalModal,
  PaymentModal,
  ReversalModal,
} from '@/components/commissions/CommissionModals';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const PageHeader = styled.div`
  margin-bottom: 32px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e8e8e8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  h1 {
    margin: 0;
    font-size: 1.875rem;
    font-weight: 700;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    word-break: break-word;
  }

  button {
    padding: 8px 16px;
    background-color: #6b7280;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    white-space: nowrap;
    min-height: 40px;

    &:hover:not(:disabled) {
      background-color: #4b5563;
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    margin-bottom: 20px;

    h1 {
      font-size: 1.5rem;
    }

    button {
      width: 100%;
      min-height: 44px;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
    padding-bottom: 16px;

    h1 {
      font-size: 1.25rem;
    }
  }
`;

const DetailCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  @media (max-width: 640px) {
    padding: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    padding: 14px;
    margin-bottom: 12px;
  }
`;

const DetailSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  @media (max-width: 640px) {
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
  color: #111827;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 640px) {
    margin-bottom: 12px;
    padding-bottom: 8px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    margin-bottom: 10px;
    padding-bottom: 6px;
    font-size: 0.75rem;
  }
`;

const DetailRow = styled.div`
  display: grid;
  grid-template-columns: 200px 1fr;
  gap: 16px;
  padding: 12px 0;
  border-bottom: 1px solid #f0f0f0;
  align-items: start;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 10px 0;
    gap: 6px;
  }

  @media (max-width: 480px) {
    padding: 8px 0;
    gap: 4px;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #6b7280;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 640px) {
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    font-size: 0.75rem;
  }
`;

const DetailValue = styled.div`
  color: #111827;
  text-align: left;
  font-weight: 500;
  font-size: 0.875rem;
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }

  &.currency {
    color: #27ae60;
    font-family: 'Monaco', 'Courier New', monospace;
  }

  &.status {
    display: flex;
    justify-content: flex-start;
  }

  &.high-risk {
    color: #dc3545;
    font-weight: 600;
  }

  &.medium-risk {
    color: #fd7e14;
    font-weight: 600;
  }

  &.low-risk {
    color: #28a745;
    font-weight: 600;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 48px 24px;
  color: #6b7280;
  font-size: 0.875rem;

  @media (max-width: 640px) {
    padding: 32px 16px;
  }

  @media (max-width: 480px) {
    padding: 24px 12px;
    font-size: 0.8rem;
  }
`;

const ErrorMessage = styled.div`
  background: linear-gradient(135deg, #fee 0%, #fdd 100%);
  color: #721c24;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #dc3545;
  box-shadow: 0 2px 8px rgba(220, 53, 69, 0.1);
  font-weight: 500;
  font-size: 0.875rem;
  line-height: 1.5;
  word-break: break-word;

  @media (max-width: 640px) {
    padding: 14px 16px;
    font-size: 0.8rem;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 0.75rem;
    margin-bottom: 16px;
  }
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  margin-bottom: 24px;

  @media (max-width: 960px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

const AlertBox = styled.div`
  background: linear-gradient(135deg, #fef3c7 0%, #fef08a 100%);
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px 20px;
  margin-bottom: 24px;
  color: #78350f;
  box-shadow: 0 2px 8px rgba(217, 119, 6, 0.1);

  h3 {
    margin: 0 0 8px 0;
    font-size: 0.875rem;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 0.875rem;
  }

  @media (max-width: 640px) {
    padding: 14px 16px;
    margin-bottom: 16px;

    h3 {
      font-size: 0.8rem;
      margin-bottom: 6px;
    }

    p {
      font-size: 0.8rem;
    }
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    margin-bottom: 12px;
    border-radius: 6px;

    h3 {
      font-size: 0.75rem;
    }

    p {
      font-size: 0.75rem;
    }
  }
`;

const SuccessMessage = styled.div`
  background: linear-gradient(135deg, #d4edda 0%, #d1e7dd 100%);
  color: #155724;
  padding: 16px 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  border-left: 4px solid #27ae60;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.1);
  font-weight: 500;
  font-size: 0.875rem;

  @media (max-width: 640px) {
    padding: 14px 16px;
    font-size: 0.8rem;
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 0.75rem;
  }
`;

const ActionButtonsSection = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 24px;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
    padding: 16px;
    margin-top: 16px;

    button {
      width: 100%;
    }
  }

  @media (max-width: 480px) {
    gap: 8px;
    padding: 14px;
    margin-top: 12px;
  }
`;

const ActionButton = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.875rem;
  font-weight: 600;
  transition: all 0.2s;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  @media (max-width: 480px) {
    min-height: 44px;
    padding: 10px 16px;
    font-size: 0.8rem;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  &.approve {
    background-color: #28a745;
    color: white;

    &:hover:not(:disabled) {
      background-color: #218838;
    }
  }

  &.pay {
    background-color: #2563eb;
    color: white;

    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
  }

  &.reverse {
    background-color: #dc3545;
    color: white;

    &:hover:not(:disabled) {
      background-color: #c82333;
    }
  }

  &.secondary {
    background-color: #6b7280;
    color: white;

    &:hover:not(:disabled) {
      background-color: #4b5563;
    }
  }
`;

const ReversalCard = styled(DetailCard)`
  border-color: #dc3545;
  background: linear-gradient(135deg, #fff5f5 0%, #fff0f0 100%);
`;

const ReversalTitle = styled(SectionTitle)`
  color: #dc3545;
`;

/**
 * Admin Commission Detail Page
 */
export default function AdminCommissionDetailPage() {
  const router = useRouter();
  const params = useParams();
  const queryClient = useQueryClient();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const commissionId = params?.commissionId;

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [modalStates, setModalStates] = useState({
    approval: false,
    payment: false,
    reversal: false,
  });

  const { data: commission, isLoading, error, refetch } = useCommissionDetail(
    commissionId,
    { enabled: isAuthenticated && !authLoading && !!commissionId && user?.role === 'admin' }
  );

  // Mutations
  const approveMutation = useApproveCommission({
    onSuccess: () => {
      setSuccessMessage('Commission approved successfully');
      setModalStates(prev => ({ ...prev, approval: false }));
      refetch();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to approve commission');
    },
  });

  const payMutation = useMarkCommissionAsPaid({
    onSuccess: () => {
      setSuccessMessage('Commission marked as paid successfully');
      setModalStates(prev => ({ ...prev, payment: false }));
      refetch();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to mark commission as paid');
    },
  });

  const reverseMutation = useReverseCommission({
    onSuccess: () => {
      setSuccessMessage('Commission reversed successfully');
      setModalStates(prev => ({ ...prev, reversal: false }));
      refetch();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to reverse commission');
    },
  });

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Action handlers
  const handleApprove = (notes) => {
    approveMutation.mutate({ commissionId, notes });
  };

  const handlePay = ({ method, transactionId, receiptId }) => {
    payMutation.mutate({ commissionId, method, transactionId, receiptId });
  };

  const handleReverse = ({ reason, details, amount }) => {
    reverseMutation.mutate({ commissionId, reason, details, amount });
  };

  if (authLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Verifying authentication...</LoadingMessage>
      </PageContainer>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
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
  const getRiskClassName = (level) => {
    if (level === 'high') return 'high-risk';
    if (level === 'medium') return 'medium-risk';
    return 'low-risk';
  };

  // Determine which actions are available based on status
  const canApprove = commission.status === 'pending';
  const canPay = commission.status === 'approved' && !commission.fraudIndicators?.flagged;
  const canReverse = ['pending', 'approved', 'paid'].includes(commission.status);

  return (
    <PageContainer>
      <PageHeader>
        <h1>Commission #{commission.orderNumber}</h1>
        <button onClick={() => router.back()}>← Back</button>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* Fraud Warning */}
      {commission.fraudIndicators?.flagged && (
        <AlertBox>
          <h3>⚠️ Fraud Alert</h3>
          <p>
            This commission has been flagged as potentially fraudulent.
            Risk Level: <strong>{commission.fraudIndicators.riskLevel}</strong>
          </p>
        </AlertBox>
      )}

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
            <DetailRow>
              <DetailLabel>Last Updated</DetailLabel>
              <DetailValue>{formatDate(commission.updatedAt)}</DetailValue>
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

      {/* Affiliate Information */}
      <DetailCard>
        <DetailSection>
          <SectionTitle>Affiliate & Customer</SectionTitle>
          <DetailRow>
            <DetailLabel>Affiliate ID</DetailLabel>
            <DetailValue>{commission.affiliateId}</DetailValue>
          </DetailRow>
          <DetailRow>
            <DetailLabel>Customer ID</DetailLabel>
            <DetailValue>{commission.buyerId}</DetailValue>
          </DetailRow>
        </DetailSection>
      </DetailCard>

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

      {/* Fraud Indicators */}
      {commission.fraudIndicators && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Fraud Analysis</SectionTitle>
            <DetailRow>
              <DetailLabel>Flagged</DetailLabel>
              <DetailValue>
                {commission.fraudIndicators.flagged ? '⚠️ Yes' : '✓ No'}
              </DetailValue>
            </DetailRow>
            {commission.fraudIndicators.riskLevel && (
              <DetailRow>
                <DetailLabel>Risk Level</DetailLabel>
                <DetailValue className={getRiskClassName(commission.fraudIndicators.riskLevel)}>
                  {commission.fraudIndicators.riskLevel.toUpperCase()}
                </DetailValue>
              </DetailRow>
            )}
            {commission.fraudIndicators.score !== undefined && (
              <DetailRow>
                <DetailLabel>Fraud Score</DetailLabel>
                <DetailValue>
                  {commission.fraudIndicators.score}%
                </DetailValue>
              </DetailRow>
            )}
            {commission.fraudIndicators.reason && (
              <DetailRow>
                <DetailLabel>Reason</DetailLabel>
                <DetailValue>{commission.fraudIndicators.reason}</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </DetailCard>
      )}

      {/* Referral Information */}
      {commission.referral && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Referral Tracking</SectionTitle>
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
            {commission.referral.utmMedium && (
              <DetailRow>
                <DetailLabel>UTM Medium</DetailLabel>
                <DetailValue>{commission.referral.utmMedium}</DetailValue>
              </DetailRow>
            )}
            {commission.referral.utmSource && (
              <DetailRow>
                <DetailLabel>UTM Source</DetailLabel>
                <DetailValue>{commission.referral.utmSource}</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </DetailCard>
      )}

      {/* Reversal Information */}
      {commission.reversal && (
        <ReversalCard>
          <DetailSection>
            <ReversalTitle>Reversal Information</ReversalTitle>
            <DetailRow>
              <DetailLabel>Reason</DetailLabel>
              <DetailValue>{commission.reversal.reason}</DetailValue>
            </DetailRow>
            {commission.reversal.reversedAt && (
              <DetailRow>
                <DetailLabel>Reversed Date</DetailLabel>
                <DetailValue>{formatDate(commission.reversal.reversedAt)}</DetailValue>
              </DetailRow>
            )}
            {commission.reversal.amount && (
              <DetailRow>
                <DetailLabel>Reversal Amount</DetailLabel>
                <DetailValue className="currency">
                  {formatCurrency(commission.reversal.amount)}
                </DetailValue>
              </DetailRow>
            )}
            {commission.reversal.details && (
              <DetailRow>
                <DetailLabel>Details</DetailLabel>
                <DetailValue>{commission.reversal.details}</DetailValue>
              </DetailRow>
            )}
          </DetailSection>
        </ReversalCard>
      )}

      {/* Status History */}
      {commission.statusHistory && commission.statusHistory.length > 0 && (
        <DetailCard>
          <DetailSection>
            <SectionTitle>Status History</SectionTitle>
            {commission.statusHistory.map((history, index) => (
              <DetailRow key={index}>
                <DetailLabel>{formatDate(history.changedAt)}</DetailLabel>
                <DetailValue>
                  <CommissionStatusBadge status={history.status} />
                  {history.reason && ` - ${history.reason}`}
                </DetailValue>
              </DetailRow>
            ))}
          </DetailSection>
        </DetailCard>
      )}

      {/* Admin Actions */}
      <ActionButtonsSection>
        {canApprove && (
          <ActionButton
            className="approve"
            onClick={() => setModalStates(prev => ({ ...prev, approval: true }))}
            disabled={approveMutation.isPending}
          >
            {approveMutation.isPending ? 'Approving...' : '✓ Approve'}
          </ActionButton>
        )}
        {canPay && (
          <ActionButton
            className="pay"
            onClick={() => setModalStates(prev => ({ ...prev, payment: true }))}
            disabled={payMutation.isPending}
          >
            {payMutation.isPending ? 'Processing...' : '💳 Pay'}
          </ActionButton>
        )}
        {canReverse && (
          <ActionButton
            className="reverse"
            onClick={() => setModalStates(prev => ({ ...prev, reversal: true }))}
            disabled={reverseMutation.isPending}
          >
            {reverseMutation.isPending ? 'Reversing...' : '↩️ Reverse'}
          </ActionButton>
        )}
        <ActionButton
          className="secondary"
          onClick={() => router.back()}
        >
          ← Back to List
        </ActionButton>
      </ActionButtonsSection>

      {/* Modals */}
      <ApprovalModal
        isOpen={modalStates.approval}
        commissionId={commissionId}
        isLoading={approveMutation.isPending}
        error={approveMutation.error?.message}
        onApprove={handleApprove}
        onClose={() => setModalStates(prev => ({ ...prev, approval: false }))}
      />

      <PaymentModal
        isOpen={modalStates.payment}
        commissionId={commissionId}
        isLoading={payMutation.isPending}
        error={payMutation.error?.message}
        onPay={handlePay}
        onClose={() => setModalStates(prev => ({ ...prev, payment: false }))}
      />

      <ReversalModal
        isOpen={modalStates.reversal}
        commissionId={commissionId}
        isLoading={reverseMutation.isPending}
        error={reverseMutation.error?.message}
        onReverse={handleReverse}
        onClose={() => setModalStates(prev => ({ ...prev, reversal: false }))}
      />
    </PageContainer>
  );
}
