/**
 * Affiliate Dashboard Page
 * Main dashboard for affiliates showing stats, referrals, sales, and earnings
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  CommissionSummaryCard,
  ReferralLinkCard,
  AffiliateAnalyticsCharts,
  ReferralClicksTable,
  AffiliateSalesTable,
  AffiliateStatusBadge,
} from '@/components/affiliate';
import {
  useAffiliateDashboard,
  useAffiliateReferrals,
  useAffiliateSales,
  useAffiliateAnalytics,
} from '@/hooks/useAffiliates';
import { useAuth } from '@/contexts/AuthContext';

const Container = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
  }
`;

const Title = styled.h1`
  margin: 0;
  font-size: 28px;
  font-weight: 700;
  color: #333;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
`;

const Button = styled.button`
  padding: 10px 20px;
  background-color: #4a90e2;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background-color: #357abd;
    box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
  }

  &.secondary {
    background-color: #f5f5f5;
    color: #333;
    border: 1px solid #ddd;

    &:hover {
      background-color: #e8e8e8;
    }
  }
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 20px 0;
  font-size: 20px;
  font-weight: 700;
  color: #333;
  padding-bottom: 12px;
  border-bottom: 2px solid #4a90e2;
  display: inline-block;
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  border-radius: 6px;
  padding: 16px;
  color: #721c24;
  margin-bottom: 20px;
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  border-bottom: 2px solid #f0f0f0;
`;

const Tab = styled.button`
  padding: 12px 20px;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-size: 14px;
  font-weight: 600;
  color: #666;
  transition: all 0.2s ease;

  &:hover {
    color: #333;
  }

  &.active {
    color: #4a90e2;
    border-bottom-color: #4a90e2;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  background-color: #f9f9f9;
  border-radius: 8px;
  color: #999;

  p {
    margin: 0 0 20px 0;
    font-size: 16px;
  }

  button {
    padding: 10px 24px;
    background-color: #4a90e2;
    color: white;
    border: none;
    border-radius: 6px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 600;

    &:hover {
      background-color: #357abd;
    }
  }
`;

export default function AffiliateDashboardPage() {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  const {
    dashboard,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useAffiliateDashboard();

  const {
    referrals,
    pagination: referralsPagination,
    isLoading: referralsLoading,
    setPage: setReferralsPage,
    convertedOnly,
    setConvertedOnly,
  } = useAffiliateReferrals({ page: 1, limit: 10 });

  const {
    sales,
    pagination: salesPagination,
    isLoading: salesLoading,
    setPage: setSalesPage,
    status: salesStatus,
    setStatus: setSalesStatus,
  } = useAffiliateSales({ page: 1, limit: 10 });

  const {
    analytics,
    isLoading: analyticsLoading,
  } = useAffiliateAnalytics();

  // Redirect if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return <LoadingMessage>Loading your affiliate dashboard...</LoadingMessage>;
  }

  if (!isAuthenticated) {
    return <LoadingMessage>Redirecting...</LoadingMessage>;
  }

  if (dashboardLoading) {
    return <LoadingMessage>Loading your affiliate dashboard...</LoadingMessage>;
  }

  if (!dashboard) {
    return (
      <Container>
        <EmptyState>
          <p>You haven't registered as an affiliate yet</p>
          <button onClick={() => router.push('/affiliate/register')}>
            Register as Affiliate
          </button>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      {/* Header */}
      <PageHeader>
        <div>
          <Title>Affiliate Dashboard</Title>
          <div style={{ display: 'flex', gap: '12px', marginTop: '8px', alignItems: 'center' }}>
            <AffiliateStatusBadge status={dashboard.status?.isActive ? 'active' : 'pending'}>
              {dashboard.status?.isActive ? 'Active' : 'Pending'}
            </AffiliateStatusBadge>
            <code style={{ fontSize: '13px', color: '#999' }}>
              {dashboard.affiliateCode}
            </code>
          </div>
        </div>
        <HeaderActions>
          <Button className="secondary" onClick={() => router.push('/affiliate/settings')}>
            Settings
          </Button>
          <Button onClick={() => router.push('/affiliate/analytics')}>
            View Analytics
          </Button>
        </HeaderActions>
      </PageHeader>

      {/* Error Message */}
      {dashboardError && (
        <ErrorMessage>
          Error loading dashboard: {dashboardError}
        </ErrorMessage>
      )}

      {/* Commission Summary */}
      <Section>
        <SectionTitle>💰 Earnings</SectionTitle>
        <CommissionSummaryCard earnings={dashboard.earnings} />
      </Section>

      {/* Referral Link */}
      <Section>
        <SectionTitle>🔗 Your Referral Link</SectionTitle>
        <ReferralLinkCard
          referralUrl={dashboard.referralUrl}
          affiliateCode={dashboard.affiliateCode}
          stats={{
            totalClicks: dashboard.stats?.totalClicks || 0,
            totalConversions: dashboard.stats?.totalConversions || 0,
            conversionRate: dashboard.stats?.conversionRate || 0,
          }}
        />
      </Section>

      {/* Tabs */}
      <Section>
        <TabContainer>
          <Tab
            className={activeTab === 'overview' ? 'active' : ''}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Tab>
          <Tab
            className={activeTab === 'referrals' ? 'active' : ''}
            onClick={() => setActiveTab('referrals')}
          >
            Referrals
          </Tab>
          <Tab
            className={activeTab === 'sales' ? 'active' : ''}
            onClick={() => setActiveTab('sales')}
          >
            Sales
          </Tab>
        </TabContainer>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <Section>
            {analyticsLoading ? (
              <LoadingMessage>Loading analytics...</LoadingMessage>
            ) : (
              <AffiliateAnalyticsCharts analytics={analytics} />
            )}
          </Section>
        )}

        {/* Referrals Tab */}
        {activeTab === 'referrals' && (
          <ReferralClicksTable
            referrals={referrals}
            pagination={referralsPagination}
            onPageChange={setReferralsPage}
            onFilterConvertedOnly={setConvertedOnly}
            convertedOnly={convertedOnly}
            isLoading={referralsLoading}
          />
        )}

        {/* Sales Tab */}
        {activeTab === 'sales' && (
          <AffiliateSalesTable
            sales={sales}
            pagination={salesPagination}
            onPageChange={setSalesPage}
            onStatusFilter={setSalesStatus}
            status={salesStatus}
            isLoading={salesLoading}
          />
        )}
      </Section>
    </Container>
  );
}
