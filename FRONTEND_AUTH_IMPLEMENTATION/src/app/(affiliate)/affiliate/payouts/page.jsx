/**
 * Affiliate Payouts Page
 * /affiliate/payouts
 *
 * Displays payout history for authenticated affiliate
 */

'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import {
  useAffiliatePayouts,
  useAffiliatePayoutStats
} from '@/api/hooks/usePayouts';
import { useAffiliateDashboard } from '@/hooks/useAffiliates';
import usePayoutStore, {
  useAffiliateFilters,
  useBatchSelection
} from '@/stores/payoutStore';
import PayoutStatsCards from '@/components/payouts/PayoutStatsCards';
import PayoutTable from '@/components/payouts/PayoutTable';
import PayoutFilters from '@/components/payouts/PayoutFilters';

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

const ActionBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #2563eb;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background-color: #1d4ed8;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
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

export default function AffiliatePayoutsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const filters = useAffiliateFilters();
  const batchSelection = useBatchSelection();
  const { setAffiliateFilters } = usePayoutStore();

  const [successMessage, setSuccessMessage] = React.useState('');
  const [errorMessage, setErrorMessage] = React.useState('');

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch payouts and stats
  const {
    data: payoutData,
    isLoading: payoutsLoading,
    error: payoutsError
  } = useAffiliatePayouts(filters, {
    enabled: isAuthenticated && !authLoading
  });

  const {
    data: statsData,
    isLoading: statsLoading
  } = useAffiliatePayoutStats({
    enabled: isAuthenticated && !authLoading
  });

  // Fetch dashboard to get approved commissions
  const {
    dashboard,
    isLoading: dashboardLoading
  } = useAffiliateDashboard();

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

  const handleFilterChange = (newFilters) => {
    setAffiliateFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are already applied
  };

  const handleResetFilters = () => {
    usePayoutStore.getState().resetAffiliateFilters();
  };

  const handlePageChange = (page) => {
    setAffiliateFilters({ page });
  };

  const handleRowClick = (payout) => {
    router.push(`/affiliate/payouts/${payout._id}`);
  };

  const handleRequestPayout = () => {
    router.push('/affiliate/payouts/request');
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>My Payouts</h1>
        <p>View and manage your payout requests and history</p>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* Statistics */}
      {!statsLoading && statsData && (
        <PayoutStatsCards 
          stats={statsData} 
          approvedEarnings={dashboard?.earnings?.approvedEarnings || 0}
        />
      )}

      {/* Action Bar */}
      <ActionBar>
        <div />
        <Button 
          onClick={handleRequestPayout}
          disabled={!dashboard?.earnings?.approvedEarnings || dashboard.earnings.approvedEarnings === 0}
        >
          + Request Payout
        </Button>
      </ActionBar>

      {/* Filters */}
      <PayoutFilters
        filters={filters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        isLoading={payoutsLoading}
        isAdmin={false}
      />

      {/* Payouts Table */}
      <PayoutTable
        payouts={payoutData?.payouts || []}
        pagination={payoutData?.pagination || {}}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        onAction={(action, payoutId) => {
          if (action === 'view') {
            router.push(`/affiliate/payouts/${payoutId}`);
          }
        }}
        actions={['view']}
        isLoading={payoutsLoading}
      />
    </PageContainer>
  );
}
