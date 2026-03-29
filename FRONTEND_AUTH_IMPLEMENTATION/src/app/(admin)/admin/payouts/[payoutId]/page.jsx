/**
 * Admin Payout Detail Page
 * /admin/payouts/[payoutId]
 *
 * Displays full payout details with admin actions
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import {
  usePayoutDetail,
  useApprovePayout,
  useProcessPayout,
  useRejectPayout
} from '@/api/hooks/usePayouts';
import usePayoutStore from '@/stores/payoutStore';
import PayoutStatusBadge from '@/components/payouts/PayoutStatusBadge';
import {
  ApprovalModal,
  ProcessingModal,
  RejectionModal
} from '@/components/payouts/PayoutModals';

const PageContainer = styled.div`
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f5f7fa 0%, #ffffff 100%);
  min-height: 100vh;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #f0f0f0;

  h1 {
    margin: 0;
    font-size: 32px;
    font-weight: 700;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  button {
    padding: 10px 18px;
    background: white;
    color: #666;
    border: 2px solid #e0e0e0;
    border-radius: 8px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;

    &:hover {
      background-color: #f8f9fa;
      border-color: #2563eb;
      color: #2563eb;
      transform: translateX(-2px);
    }
  }
`;

const DetailCard = styled.div`
  background: white;
  border: 1px solid #e8e8e8;
  border-radius: 12px;
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
  }
`;

const DetailSection = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }

  &:first-child {
    padding-top: 0;
  }
`;

const SectionTitle = styled.h2`
  font-size: 16px;
  font-weight: 700;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #e8e8e8;
  color: #1a202c;
  letter-spacing: 0.3px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 14px 0;
  border-bottom: 1px solid #f5f5f5;
  align-items: center;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const DetailLabel = styled.div`
  font-weight: 600;
  color: #666;
  min-width: 240px;
  font-size: 14px;
  letter-spacing: 0.2px;

  @media (max-width: 768px) {
    min-width: auto;
  }
`;

const DetailValue = styled.div`
  color: #1a202c;
  text-align: right;
  font-weight: 500;
  font-size: 14px;

  &.currency {
    color: #27ae60;
    font-family: 'Monaco', 'Courier New', monospace;
    font-weight: 700;
    font-size: 16px;
  }

  &.status {
    text-align: right;
  }

  @media (max-width: 768px) {
    text-align: left;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 60px 20px;
  color: #999;
  font-size: 16px;
  font-weight: 500;

  &::after {
    content: '...';
    animation: dots 1.5s steps(3, end) infinite;
  }

  @keyframes dots {
    0%, 20% {
      content: '.';
    }
    40% {
      content: '..';
    }
    60%, 100% {
      content: '...';
    }
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
`;

const SuccessMessage = styled(ErrorMessage)`
  background: linear-gradient(135deg, #efe 0%, #dfd 100%);
  color: #155724;
  border-left-color: #27ae60;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.1);
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #f0f0f0;
  flex-wrap: wrap;
  align-items: center;

  @media (max-width: 768px) {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
  }
`;

const ActionButton = styled.button`
  padding: 12px 24px;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.3px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  min-width: 140px;

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.5);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  &:hover:not(:disabled)::before {
    width: 300px;
    height: 300px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  }

  /* Success - Approve */
  &.success {
    background: linear-gradient(135deg, #27ae60 0%, #229954 100%);
    color: white;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #229954 0%, #1e8449 100%);
    }
  }

  /* Danger - Reject */
  &.danger {
    background: linear-gradient(135deg, #dc3545 0%, #c82333 100%);
    color: white;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #c82333 0%, #bd2130 100%);
    }
  }

  /* Primary - Process */
  &.primary {
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
    color: white;

    &:hover:not(:disabled) {
      background: linear-gradient(135deg, #1d4ed8 0%, #1e40af 100%);
    }
  }

  /* Secondary - Default */
  &.secondary {
    background: white;
    color: #333;
    border: 2px solid #e0e0e0;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

    &:hover:not(:disabled) {
      border-color: #2563eb;
      color: #2563eb;
      background: #f8f9ff;
    }
  }
`;

export default function AdminPayoutDetailPage() {
  // ==================== ALL HOOKS DECLARED FIRST ====================

  const router = useRouter();
  const params = useParams();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const payoutId = params?.payoutId;
  const {
    openApprovalModal,
    closeApprovalModal,
    openProcessingModal,
    closeProcessingModal,
    openRejectionModal,
    closeRejectionModal,
    modals
  } = usePayoutStore();

  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch payout
  const { data: payout, isLoading, error } = usePayoutDetail(payoutId, {
    enabled: isAuthenticated && !authLoading && !!payoutId && user?.role === 'admin'
  });

  // Debug logging
  React.useEffect(() => {
    console.log('📋 [PAYOUT-DETAIL-PAGE] Query result:', {
      payoutId,
      isLoading,
      hasError: !!error,
      errorMessage: error?.message,
      payoutData: payout ? { _id: payout._id, amount: payout.amount, status: payout.status } : null
    });
  }, [payout, isLoading, error, payoutId]);

  // Mutations
  const approveMutation = useApprovePayout({
    onSuccess: () => {
      setSuccessMessage('Payout approved successfully');
      closeApprovalModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to approve payout');
    }
  });

  const processMutation = useProcessPayout({
    onSuccess: () => {
      setSuccessMessage('Payout marked as paid successfully');
      closeProcessingModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to mark payout as paid');
    }
  });

  const rejectMutation = useRejectPayout({
    onSuccess: () => {
      setSuccessMessage('Payout rejected successfully');
      closeRejectionModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to reject payout');
    }
  });

  // Handlers
  const handleApprove = useCallback(({ payoutId, notes }) => {
    approveMutation.mutate({ payoutId, notes });
  }, [approveMutation]);

  const handleProcess = useCallback(({ payoutId, receiptId, transactionId }) => {
    processMutation.mutate({ payoutId, receiptId, transactionId });
  }, [processMutation]);

  const handleReject = useCallback(({ payoutId, reason, details }) => {
    rejectMutation.mutate({ payoutId, reason, details });
  }, [rejectMutation]);

  // ==================== CONDITIONAL RENDERING AFTER ALL HOOKS ====================

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
        <button onClick={() => router.back()} title="Go back to payouts list">
          ← Back
        </button>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* Status & Actions */}
      <DetailCard>
        <DetailSection>
          <SectionTitle>Status & Actions</SectionTitle>
          <DetailRow>
            <DetailLabel>Current Status</DetailLabel>
            <DetailValue className="status">
              <PayoutStatusBadge status={payout.status} showDot />
            </DetailValue>
          </DetailRow>
        </DetailSection>
        <ActionButtons>
          {payout.status === 'pending' && (
            <>
              <ActionButton
                className="success"
                onClick={() => openApprovalModal(payout._id)}
                title="Approve this payout request"
              >
                <span>✓</span>
                Approve
              </ActionButton>
              <ActionButton
                className="danger"
                onClick={() => openRejectionModal(payout._id)}
                title="Reject this payout request"
              >
                <span>✕</span>
                Reject
              </ActionButton>
            </>
          )}
          {payout.status === 'approved' && (
            <>
              <ActionButton
                className="success"
                onClick={() => openProcessingModal(payout._id)}
                title="Mark payout as paid"
              >
                <span>💳</span>
                Pay
              </ActionButton>
              <ActionButton
                className="danger"
                onClick={() => openRejectionModal(payout._id)}
                title="Reject this payout request"
              >
                <span>✕</span>
                Reject
              </ActionButton>
            </>
          )}
        </ActionButtons>
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

      {/* Affiliate Info */}
      <DetailCard>
        <DetailSection>
          <SectionTitle>Affiliate Information</SectionTitle>
          <DetailRow>
            <DetailLabel>Affiliate ID</DetailLabel>
            <DetailValue>
              {typeof payout.affiliateId === 'object' ? payout.affiliateId._id : payout.affiliateId}
            </DetailValue>
          </DetailRow>
          {typeof payout.affiliateId === 'object' && (
            <>
              <DetailRow>
                <DetailLabel>Name</DetailLabel>
                <DetailValue>{payout.affiliateId.name}</DetailValue>
              </DetailRow>
              <DetailRow>
                <DetailLabel>Email</DetailLabel>
                <DetailValue>{payout.affiliateId.email}</DetailValue>
              </DetailRow>
            </>
          )}
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
              <DetailValue>{payout.request.beneficiary.accountNumber}</DetailValue>
            </DetailRow>
            {payout.request.beneficiary.routingNumber && (
              <DetailRow>
                <DetailLabel>Routing Number</DetailLabel>
                <DetailValue>{payout.request.beneficiary.routingNumber}</DetailValue>
              </DetailRow>
            )}
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

      {/* Modals */}
      <ApprovalModal
        isOpen={modals.approvalModal.isOpen}
        payoutId={modals.approvalModal.payoutId}
        notes={modals.approvalModal.notes}
        isLoading={approveMutation.isPending}
        error={approveMutation.error?.message}
        onApprove={handleApprove}
        onClose={closeApprovalModal}
      />

      <ProcessingModal
        isOpen={modals.processingModal.isOpen}
        payoutId={modals.processingModal.payoutId}
        receiptId={modals.processingModal.receiptId}
        transactionId={modals.processingModal.transactionId}
        isLoading={processMutation.isPending}
        error={processMutation.error?.message}
        onProcess={handleProcess}
        onClose={closeProcessingModal}
      />

      <RejectionModal
        isOpen={modals.rejectionModal.isOpen}
        payoutId={modals.rejectionModal.payoutId}
        reason={modals.rejectionModal.reason}
        details={modals.rejectionModal.details}
        isLoading={rejectMutation.isPending}
        error={rejectMutation.error?.message}
        onReject={handleReject}
        onClose={closeRejectionModal}
      />
    </PageContainer>
  );
}
