/**
 * Admin Payouts Management Page
 * /admin/payouts
 *
 * Admin dashboard for viewing and managing all payouts
 */

'use client';

import React, { useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAllPayouts,
  useSystemPayoutStats,
  useApprovePayout,
  useProcessPayout,
  useRejectPayout,
  useBatchApprovePayout,
  useBatchProcessPayout
} from '@/api/hooks/usePayouts';
import usePayoutStore, {
  useAdminFilters,
  useBatchSelection
} from '@/stores/payoutStore';
import PayoutStatsCards from '@/components/payouts/PayoutStatsCards';
import PayoutTable from '@/components/payouts/PayoutTable';
import PayoutFilters from '@/components/payouts/PayoutFilters';
import {
  ApprovalModal,
  ProcessingModal,
  RejectionModal
} from '@/components/payouts/PayoutModals';
import BatchPayoutProcessingPanel from '@/components/payouts/BatchPayoutProcessingPanel';

const PageContainer = styled.div`
  max-width: 1400px;
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

  h1 {
    margin: 0 0 8px 0;
    font-size: 1.875rem;
    font-weight: 700;
    background: linear-gradient(135deg, #2563eb 0%, #1e40af 100%);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    word-break: break-word;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  @media (max-width: 640px) {
    margin-bottom: 20px;

    h1 {
      font-size: 1.5rem;
      margin-bottom: 4px;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;

    h1 {
      font-size: 1.25rem;
    }
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
  font-size: 14px;
  line-height: 1.5;
  word-break: break-word;

  @media (max-width: 640px) {
    padding: 14px 16px;
    font-size: 13px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 12px 14px;
    font-size: 12px;
    margin-bottom: 16px;
  }
`;

const SuccessMessage = styled(ErrorMessage)`
  background: linear-gradient(135deg, #efe 0%, #dfd 100%);
  color: #155724;
  border-left-color: #27ae60;
  box-shadow: 0 2px 8px rgba(39, 174, 96, 0.1);
`;

const Section = styled.div`
  margin-bottom: 24px;

  @media (max-width: 640px) {
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }
`;

export default function AdminPayoutsPage() {
  // ==================== ALL HOOKS DECLARED FIRST ====================
  
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const adminFilters = useAdminFilters();
  const batchSelection = useBatchSelection();
  const { setAdminFilters } = usePayoutStore();
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
  const [batchOperation, setBatchOperation] = React.useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch data
  const {
    data: payoutData,
    isLoading: payoutsLoading,
    error: payoutsError
  } = useAllPayouts(adminFilters, {
    enabled: isAuthenticated && !authLoading && user?.role === 'admin'
  });

  const {
    data: statsData,
    isLoading: statsLoading
  } = useSystemPayoutStats({
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

  const processMutation = useProcessPayout({
    onSuccess: () => {
      setSuccessMessage('Payout processing started');
      closeProcessingModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to process payout');
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
      usePayoutStore.getState().clearBatchSelection();
      setBatchOperation('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to batch approve payouts');
    }
  });

  const batchProcessMutation = useBatchProcessPayout({
    onSuccess: (data) => {
      setSuccessMessage(`Successfully processed ${data.successCount} payout(s)`);
      usePayoutStore.getState().clearBatchSelection();
      setBatchOperation('');
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to batch process payouts');
    }
  });

  // Handlers - all useCallback hooks declared BEFORE conditional rendering
  const handleFilterChange = useCallback((newFilters) => {
    setAdminFilters(newFilters);
  }, [setAdminFilters]);

  const handleApplyFilters = useCallback(() => {
    // Filters are already applied
  }, []);

  const handleResetFilters = useCallback(() => {
    usePayoutStore.getState().resetAdminFilters();
  }, []);

  const handlePageChange = useCallback((page) => {
    setAdminFilters({ page });
  }, [setAdminFilters]);

  const handleRowClick = useCallback((payout) => {
    router.push(`/admin/payouts/${payout._id}`);
  }, [router]);

  const handleSelectChange = useCallback((selectedIds) => {
    usePayoutStore.getState().setBatchSelection(selectedIds);
  }, []);

  const handleAction = useCallback((action, payoutId) => {
    switch (action) {
      case 'view':
        router.push(`/admin/payouts/${payoutId}`);
        break;
      case 'approve':
        openApprovalModal(payoutId);
        break;
      case 'process':
        openProcessingModal(payoutId);
        break;
      case 'reject':
        openRejectionModal(payoutId);
        break;
      default:
        break;
    }
  }, [router, openApprovalModal, openProcessingModal, openRejectionModal]);

  const handleApprove = useCallback(({ payoutId, notes }) => {
    approveMutation.mutate({ payoutId, notes });
  }, [approveMutation]);

  const handleProcess = useCallback(({ payoutId, stripeConnectId }) => {
    processMutation.mutate({ payoutId, stripeConnectId });
  }, [processMutation]);

  const handleReject = useCallback(({ payoutId, reason, details }) => {
    rejectMutation.mutate({ payoutId, reason, details });
  }, [rejectMutation]);

  const handleBatchApprove = useCallback((selectedIds, notes) => {
    batchApproveMutation.mutate({ payoutIds: selectedIds, notes });
  }, [batchApproveMutation]);

  const handleBatchProcess = useCallback((selectedIds, stripeConnectId) => {
    batchProcessMutation.mutate({ payoutIds: selectedIds, stripeConnectId });
  }, [batchProcessMutation]);

  // ==================== CONDITIONAL RENDERING AFTER ALL HOOKS ====================

  // Handle loading state
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

  // Debug logging
  console.log('📊 [ADMIN-PAYOUTS-PAGE] Data received:', {
    payoutDataType: typeof payoutData,
    isArray: Array.isArray(payoutData),
    keys: payoutData && typeof payoutData === 'object' ? Object.keys(payoutData) : 'N/A',
    payoutsProperty: payoutData?.payouts ? 'exists' : 'missing',
    paginationProperty: payoutData?.pagination ? 'exists' : 'missing'
  });

  const payouts = payoutData?.payouts || [];

  console.log('📦 [ADMIN-PAYOUTS-PAGE] Extracted payouts:', {
    count: payouts.length,
    isEmpty: payouts.length === 0
  });

  return (
    <PageContainer>
      <PageHeader>
        <h1>Payout Management</h1>
        <p>Monitor and manage all affiliate payouts</p>
      </PageHeader>

      {successMessage && (
        <Section>
          <SuccessMessage>{successMessage}</SuccessMessage>
        </Section>
      )}
      {errorMessage && (
        <Section>
          <ErrorMessage>{errorMessage}</ErrorMessage>
        </Section>
      )}

      {/* Statistics */}
      {!statsLoading && statsData && (
        <Section>
          <PayoutStatsCards stats={statsData} />
        </Section>
      )}

      {/* Filters */}
      <Section>
        <PayoutFilters
          filters={adminFilters}
          onFilterChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isLoading={payoutsLoading}
          isAdmin={true}
        />
      </Section>

      {/* Batch Processing Panel */}
      {batchSelection.selected.length > 0 && (
        <Section>
          <BatchPayoutProcessingPanel
            selectedIds={batchSelection.selected}
            totalAmount={payouts
              .filter((p) => batchSelection.selected.includes(p._id))
              .reduce((sum, p) => sum + (p.amount || 0), 0)}
            operationType={batchOperation}
            isProcessing={batchApproveMutation.isPending || batchProcessMutation.isPending}
            onApprove={handleBatchApprove}
            onProcess={handleBatchProcess}
            onClear={() => {
              usePayoutStore.getState().clearBatchSelection();
              setBatchOperation('');
            }}
          />
        </Section>
      )}

      {/* Payouts Table */}
      <Section>
        <PayoutTable
          payouts={payouts}
          pagination={payoutData?.pagination || {}}
          selectedIds={batchSelection.selected}
          onSelectChange={handleSelectChange}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          onAction={handleAction}
          actions={['view', 'approve', 'process', 'reject']}
          isLoading={payoutsLoading}
        />
      </Section>

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
        stripeConnectId={modals.processingModal.stripeConnectId}
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
