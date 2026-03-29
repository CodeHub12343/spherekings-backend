/**
 * Affiliate Commission List Page
 * /affiliate/commissions
 * 
 * Displays:
 * - Commission statistics
 * - Filterable commission table
 * - Pagination
 */

'use client';

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import {
  useAffiliateCommissions,
  useAffiliateCommissionStats,
} from '@/api/hooks/useCommissions';
import useCommissionStore, { useAffiliateFilters } from '@/stores/commissionStore';
import CommissionStatsCards from '@/components/commissions/CommissionStatsCards';
import CommissionTable from '@/components/commissions/CommissionTable';
import CommissionFilters from '@/components/commissions/CommissionFilters';

const PageContainer = styled.div`
  max-width: 1200px;
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

/**
 * Affiliate Commission Page
 */
export default function AffiliateCommissionsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const affiliateFilters = useAffiliateFilters();
  const { setAffiliateFilters } = useCommissionStore();

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Fetch commissions and stats
  const {
    data: commissionData,
    isLoading: commissionsLoading,
    error: commissionsError,
  } = useAffiliateCommissions({
    ...affiliateFilters,
    enabled: isAuthenticated && !authLoading,
  });

  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
  } = useAffiliateCommissionStats({
    dateFrom: affiliateFilters.dateFrom,
    dateTo: affiliateFilters.dateTo,
    enabled: isAuthenticated && !authLoading,
  });

  // Handle loading state
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

  // Handle errors
  const hasError = commissionsError || statsError;
  const errorMessage = commissionsError?.message || statsError?.message;

  // Handlers
  const handleFilterChange = (newFilters) => {
    setAffiliateFilters(newFilters);
  };

  const handleApplyFilters = () => {
    // Filters are already applied via store
  };

  const handleResetFilters = () => {
    useCommissionStore.getState().resetAffiliateFilters();
  };

  const handlePageChange = (page) => {
    setAffiliateFilters({ page });
  };

  const handleRowClick = (commission) => {
    router.push(`/affiliate/commissions/${commission._id}`);
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Commissions</h1>
        <p>Track all your affiliate commissions here</p>
      </PageHeader>

      {hasError && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* Statistics */}
      {!statsLoading && statsData && (
        <CommissionStatsCards stats={statsData} />
      )}

      {/* Filters */}
      <CommissionFilters
        filters={affiliateFilters}
        onFilterChange={handleFilterChange}
        onApply={handleApplyFilters}
        onReset={handleResetFilters}
        isLoading={commissionsLoading}
      />

      {/* Commission Table */}
      <CommissionTable
        commissions={commissionData?.commissions || []}
        pagination={commissionData?.pagination || {}}
        onPageChange={handlePageChange}
        onRowClick={handleRowClick}
        actions={['view']}
        isLoading={commissionsLoading}
      />
    </PageContainer>
  );
}
