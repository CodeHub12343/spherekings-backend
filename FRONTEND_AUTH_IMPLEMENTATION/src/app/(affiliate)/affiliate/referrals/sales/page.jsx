'use client';

import React, { useState, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useReferralSales, useReferralStats } from '@/api/hooks/useReferrals';
import ReferralSalesTable from '@/components/referrals/ReferralSalesTable';
import DateRangeFilter from '@/components/referrals/DateRangeFilter';
import { formatCurrency } from '@/utils/referralUtils';

const Container = styled.div`
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;

  h1 {
    font-size: 1.875rem;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
  }
`;

const FilterSection = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ContentSection = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #6b7280;
  font-size: 1rem;
`;

const ErrorMessage = styled.div`
  background: #fee;
  border: 1px solid #fcc;
  border-radius: 0.375rem;
  padding: 1rem;
  color: #c00;
  margin-bottom: 1rem;
`;

const StatsBar = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: linear-gradient(to bottom, #f9fafb, #f3f4f6);
  border: 1px solid #e5e7eb;
  border-radius: 0.375rem;
  padding: 1rem;
  text-align: center;

  .label {
    font-size: 0.875rem;
    color: #6b7280;
    font-weight: 500;
    margin-bottom: 0.5rem;
  }

  .value {
    font-size: 1.5rem;
    font-weight: 700;
    color: #1f2937;
  }

  .subtitle {
    font-size: 0.75rem;
    color: #9ca3af;
    margin-top: 0.25rem;
  }
`;

export default function ReferralSalesPage() {
  // Auth check
  const router = useRouter();
  const { user, authLoading, isAuthenticated } = useAuth();

  // State for date range
  const [dateFrom, setDateFrom] = useState(null);
  const [dateTo, setDateTo] = useState(null);

  // Fetch referral sales and stats
  const {
    data: salesData,
    isLoading: salesLoading,
    error: salesError,
  } = useReferralSales(user?.affiliateId, {
    dateFrom,
    dateTo,
    page: 1,
    limit: 100,
    enabled: !!user?.affiliateId,
  });

  const {
    data: statsData,
  } = useReferralStats(user?.affiliateId, {
    dateFrom,
    dateTo,
    enabled: !!user?.affiliateId,
  });

  // Calculate summary stats
  const stats = useMemo(
    () => ({
      totalSales: statsData?.totalSales || 0,
      totalCommission: statsData?.totalCommission || 0,
      avgOrderValue: statsData?.avgOrderValue || 0,
      commissionRate: statsData?.commissionRate || 0,
    }),
    [statsData]
  );

  // Loading state
  if (authLoading) {
    return (
      <Container>
        <LoadingMessage>Loading authentication...</LoadingMessage>
      </Container>
    );
  }

  // Auth check
  if (!isAuthenticated) {
    router.push('/login');
    return null;
  }

  // Page content
  return (
    <Container>
      <Header>
        <h1>Attributed Sales</h1>
      </Header>

      {/* Stats Bar */}
      <StatsBar>
        <StatCard>
          <div className="label">Total Sales</div>
          <div className="value">{stats.totalSales.toLocaleString()}</div>
        </StatCard>
        <StatCard>
          <div className="label">Total Commission</div>
          <div className="value">{formatCurrency(stats.totalCommission)}</div>
        </StatCard>
        <StatCard>
          <div className="label">Avg Order Value</div>
          <div className="value">{formatCurrency(stats.avgOrderValue)}</div>
        </StatCard>
        <StatCard>
          <div className="label">Commission Rate</div>
          <div className="value">{stats.commissionRate.toFixed(2)}%</div>
        </StatCard>
      </StatsBar>

      {/* Filters */}
      <FilterSection>
        <h2 style={{ margin: '0 0 1rem 0', fontSize: '1rem', fontWeight: 600 }}>
          Date Range
        </h2>
        <DateRangeFilter
          dateFrom={dateFrom}
          dateTo={dateTo}
          onDateFromChange={setDateFrom}
          onDateToChange={setDateTo}
        />
      </FilterSection>

      {/* Error message */}
      {salesError && (
        <ErrorMessage>
          Error loading sales: {salesError}
        </ErrorMessage>
      )}

      {/* Content */}
      <ContentSection>
        {salesLoading ? (
          <LoadingMessage>Loading attributed sales...</LoadingMessage>
        ) : (
          <ReferralSalesTable
            sales={salesData?.data?.sales || []}
            isLoading={salesLoading}
          />
        )}
      </ContentSection>
    </Container>
  );
}
