/**
 * Admin Pending Payouts Page
 * /admin/payouts/pending
 *
 * Approval queue - pending payouts awaiting admin review
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import {
  usePendingPayouts,
  useApprovePayout,
  useRejectPayout,
  useBatchApprovePayout
} from '@/api/hooks/usePayouts';
import usePayoutStore from '@/stores/payoutStore';
import PayoutTable from '@/components/payouts/PayoutTable';
import {
  ApprovalModal,
  RejectionModal
} from '@/components/payouts/PayoutModals';
import BatchPayoutProcessingPanel from '@/components/payouts/BatchPayoutProcessingPanel';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`;

const QueueInfo = styled.div`
  background-color: #e3f2fd;
  border: 1px solid #90caf9;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;

  .count {
    font-size: 16px;
    font-weight: 700;
    color: #1565c0;
  }

  .description {
    font-size: 13px;
    color: #1565c0;
    margin-top: 4px;
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

const SuccessMessage = styled(ErrorMessage)`
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
`;

export default function AdminPendingPayoutsPage() {
  // ==================== ALL HOOKS DECLARED FIRST ====================

  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const { setBatchSelection, clearBatchSelection } = usePayoutStore();
  const {
    openApprovalModal,
    closeApprovalModal,
    openRejectionModal,
    closeRejectionModal,
    modals,
    batchSelection
  } = usePayoutStore();

  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');
  const [selectedIds, setSelectedIds] = React.useState([]);

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch pending payouts
  const {
    data: pendingPayouts = [],
    isLoading: payoutsLoading,
    error: payoutsError
  } = usePendingPayouts({
    limit: 500,
    enabled: isAuthenticated && !authLoading && user?.role === 'admin'
  });

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

  const batchApproveMutation = useBatchApprovePayout({
    onSuccess: (data) => {
      setSuccessMessage(`Successfully approved ${data.successCount} payout(s)`);
      clearBatchSelection();
      setSelectedIds([]);
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to batch approve payouts');
    }
  });

  // Handlers
  const handleSelectChange = useCallback((ids) => {
    setSelectedIds(ids);
    setBatchSelection(ids);
  }, [setBatchSelection]);

  const handleAction = useCallback((action, payoutId) => {
    switch (action) {
      case 'view':
        router.push(`/admin/payouts/${payoutId}`);
        break;
      case 'approve':
        openApprovalModal(payoutId);
        break;
      case 'reject':
        openRejectionModal(payoutId);
        break;
      default:
        break;
    }
  }, [router, openApprovalModal, openRejectionModal]);

  const handleApprove = useCallback(({ payoutId, notes }) => {
    approveMutation.mutate({ payoutId, notes });
  }, [approveMutation]);

  const handleReject = useCallback(({ payoutId, reason, details }) => {
    rejectMutation.mutate({ payoutId, reason, details });
  }, [rejectMutation]);

  const handleBatchApprove = useCallback((ids, notes) => {
    batchApproveMutation.mutate({ payoutIds: ids, notes });
  }, [batchApproveMutation]);

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

  const totalAmount = selectedIds.reduce((sum, id) => {
    const payout = pendingPayouts.find((p) => p._id === id);
    return sum + (payout?.amount || 0);
  }, 0);

  return (
    <PageContainer>
      <PageHeader>
        <h1>Pending Approvals</h1>
        <p>Affiliate payout requests awaiting your review</p>
      </PageHeader>

      <QueueInfo>
        <div className="count">
          {pendingPayouts.length} payout(s) pending approval
        </div>
        <div className="description">
          Review and approve or reject payout requests from affiliates
        </div>
      </QueueInfo>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* Batch Processing Panel */}
      {selectedIds.length > 0 && (
        <BatchPayoutProcessingPanel
          selectedIds={selectedIds}
          totalAmount={totalAmount}
          operationType="approve"
          isProcessing={batchApproveMutation.isPending}
          onApprove={handleBatchApprove}
          onClear={() => {
            setSelectedIds([]);
            clearBatchSelection();
          }}
        />
      )}

      {/* Pending Payouts Table */}
      <PayoutTable
        payouts={pendingPayouts}
        selectedIds={selectedIds}
        onSelectChange={handleSelectChange}
        onAction={handleAction}
        actions={['view', 'approve', 'reject']}
        isLoading={payoutsLoading}
      />

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
