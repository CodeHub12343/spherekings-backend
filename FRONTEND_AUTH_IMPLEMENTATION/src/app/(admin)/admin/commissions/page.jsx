/**
 * Admin Commission Management Page
 * /admin/commissions
 * 
 * Displays:
 * - System-wide commission statistics
 * - All commissions with filtering
 * - Approval, payment, and reversal actions
 * - Batch operations
 */

'use client';

import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAllCommissions,
  useSystemStatistics,
  useApproveCommission,
  useMarkCommissionAsPaid,
  useReverseCommission,
} from '@/api/hooks/useCommissions';
import useCommissionStore, { useAdminFilters } from '@/stores/commissionStore';
import CommissionStatsCards from '@/components/commissions/CommissionStatsCards';
import CommissionTable from '@/components/commissions/CommissionTable';
import CommissionFilters from '@/components/commissions/CommissionFilters';
import {
  ApprovalModal,
  PaymentModal,
  ReversalModal,
} from '@/components/commissions/CommissionModals';

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

/**
 * Admin Commission Management Page
 */
export default function AdminCommissionsPage() {
  // ==================== ALL HOOKS DECLARED FIRST ====================
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const adminFilters = useAdminFilters();
  const { setAdminFilters } = useCommissionStore();
  const {
    openApprovalModal,
    closeApprovalModal,
    openPaymentModal,
    closePaymentModal,
    openReversalModal,
    closeReversalModal,
    modals,
  } = useCommissionStore();

  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch data
  const {
    data: commissionData,
    isLoading: commissionsLoading,
    error: commissionsError,
  } = useAllCommissions({
    ...adminFilters,
    enabled: isAuthenticated && !authLoading && user?.role === 'admin',
  });

  const {
    data: statsData,
    isLoading: statsLoading,
  } = useSystemStatistics({
    dateFrom: adminFilters.dateFrom,
    dateTo: adminFilters.dateTo,
    enabled: isAuthenticated && !authLoading && user?.role === 'admin',
  });

  // Mutations
  const approveMutation = useApproveCommission({
    onSuccess: () => {
      setSuccessMessage('Commission approved successfully');
      closeApprovalModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to approve commission');
    },
  });

  const payMutation = useMarkCommissionAsPaid({
    onSuccess: () => {
      setSuccessMessage('Commission marked as paid successfully');
      closePaymentModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to mark commission as paid');
    },
  });

  const reverseMutation = useReverseCommission({
    onSuccess: () => {
      setSuccessMessage('Commission reversed successfully');
      closeReversalModal();
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to reverse commission');
    },
  });

  // Handlers - all useCallback hooks declared here BEFORE conditional rendering
  const handleFilterChange = (newFilters) => {
    setAdminFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are already applied
  };

  const handleResetFilters = () => {
    useCommissionStore.getState().resetAdminFilters();
  };

  const handlePageChange = (page) => {
    setAdminFilters({ page });
  };

  const handleRowClick = (commission) => {
    router.push(`/admin/commissions/${commission._id}`);
  };

  const handleAction = useCallback(
    (action, commissionId) => {
      switch (action) {
        case 'approve':
          openApprovalModal(commissionId);
          break;
        case 'pay':
          openPaymentModal(commissionId);
          break;
        case 'reverse':
          openReversalModal(commissionId);
          break;
        default:
          break;
      }
    },
    [openApprovalModal, openPaymentModal, openReversalModal]
  );

  const handleApprove = ({ commissionId, notes }) => {
    approveMutation.mutate({ commissionId, notes });
  };

  const handlePay = ({ commissionId, method, transactionId, receiptId }) => {
    payMutation.mutate({ commissionId, method, transactionId, receiptId });
  };

  const handleReverse = ({ commissionId, reason, details, amount }) => {
    reverseMutation.mutate({ commissionId, reason, details, amount });
  };

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

  return (
    <PageContainer>
      <PageHeader>
        <h1>Commission Management</h1>
        <p>Review and process all affiliate commissions</p>
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
          <CommissionStatsCards stats={statsData} />
        </Section>
      )}

      {/* Filters */}
      <Section>
        <CommissionFilters
          filters={adminFilters}
          onFilterChange={handleFilterChange}
          onApply={handleApplyFilters}
          onReset={handleResetFilters}
          isLoading={commissionsLoading}
        />
      </Section>

      {/* Commission Table */}
      <Section>
        <CommissionTable
          commissions={commissionData?.commissions || []}
          pagination={commissionData?.pagination || {}}
          onPageChange={handlePageChange}
          onRowClick={handleRowClick}
          onAction={handleAction}
          actions={['view', 'approve', 'pay', 'reverse']}
          isLoading={commissionsLoading}
        />
      </Section>

      {/* Modals */}
      <ApprovalModal
        isOpen={modals.approvalModal.isOpen}
        commissionId={modals.approvalModal.commissionId}
        notes={modals.approvalModal.notes}
        isLoading={approveMutation.isPending}
        error={approveMutation.error?.message}
        onApprove={handleApprove}
        onClose={closeApprovalModal}
      />

      <PaymentModal
        isOpen={modals.paymentModal.isOpen}
        commissionId={modals.paymentModal.commissionId}
        method={modals.paymentModal.method}
        transactionId={modals.paymentModal.transactionId}
        receiptId={modals.paymentModal.receiptId}
        isLoading={payMutation.isPending}
        error={payMutation.error?.message}
        onPay={handlePay}
        onClose={closePaymentModal}
      />

      <ReversalModal
        isOpen={modals.reversalModal.isOpen}
        commissionId={modals.reversalModal.commissionId}
        reason={modals.reversalModal.reason}
        details={modals.reversalModal.details}
        amount={modals.reversalModal.amount}
        isLoading={reverseMutation.isPending}
        error={reverseMutation.error?.message}
        onReverse={handleReverse}
        onClose={closeReversalModal}
      />
    </PageContainer>
  );
}
