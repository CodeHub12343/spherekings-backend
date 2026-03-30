'use client';

/**
 * Admin Dashboard Main Page
 * /admin/dashboard
 * 
 * Overview of all platform metrics and key statistics
 */

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/api/hooks/useAdmin';
import { AdminStatsCards } from '@/components/admin/AdminStatsCards';
import {
  RevenueChart,
  TopProductsChart,
  TopAffiliatesChart,
  OrderAnalyticsChart
} from '@/components/admin/Charts';

const DashboardContainer = styled.div`
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 8px;
  }
`;

const Header = styled.div`
  margin-bottom: 30px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  align-items: flex-start;

  h1 {
    font-size: 28px;
    font-weight: 700;
    color: #1f2937;
    margin: 0;
    flex: 1;
    min-width: 200px;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
    flex: 1 100%;
    display: flex;
    align-items: center;
    gap: 12px;
    flex-wrap: wrap;
  }

  @media (max-width: 768px) {
    margin-bottom: 20px;
    gap: 12px;

    h1 {
      font-size: 22px;
      width: 100%;
    }

    p {
      font-size: 12px;
      flex-direction: column;
      align-items: flex-start;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
    gap: 8px;

    h1 {
      font-size: 18px;
      width: 100%;
    }

    p {
      font-size: 11px;
      flex-direction: column;
      align-items: flex-start;
    }
  }
`;

const TimeDisplay = styled.span`
  color: #9ca3af;
  font-size: 13px;

  @media (max-width: 768px) {
    font-size: 12px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    display: block;
  }
`;

const Grid2Col = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(450px, 1fr));
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 12px;
  }
`;

const Grid3Col = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
  gap: 20px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const RefreshButton = styled.button`
  padding: 10px 20px;
  background: #5b4dff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;

  &:hover {
    background: #4a3dd4;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 8px 16px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    width: 100%;
    justify-content: center;
    padding: 10px 12px;
    font-size: 12px;
  }
`;

const ErrorBanner = styled.div`
  background: #fee2e2;
  border: 1px solid #fca5a5;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
  color: #991b1b;
  font-size: 13px;

  @media (max-width: 768px) {
    padding: 12px;
    margin-bottom: 16px;
    font-size: 12px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    margin-bottom: 12px;
    font-size: 11px;
  }
`;

const LoadingSpinner = styled.div`
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid #3b82f6;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user } = useAuth();
  
  // Fetch all dashboard data in parallel
  const {
    overview,
    orderAnalytics,
    topProducts,
    topAffiliates,
    revenueAnalytics,
    system,
    isLoading,
    isError,
    errors
  } = useDashboardData();

  // Check admin authorization
  useEffect(() => {
    if (user && user.role !== 'admin') {
      router.push('/');
    }
  }, [user, router]);

  if (!user || user.role !== 'admin') {
    return (
      <DashboardContainer>
        <ErrorBanner>
          Access Denied. You must be an administrator to view this page.
        </ErrorBanner>
      </DashboardContainer>
    );
  }

  const handleRefresh = () => {
    // Manually trigger refetch of all queries
    overview.refetch();
    orderAnalytics.refetch();
    topProducts.refetch();
    topAffiliates.refetch();
    system.refetch();
  };

  return (
    <DashboardContainer>
      {/* Header */}
      <Header>
        <h1>Admin Dashboard</h1>
        <p>
          Overview and analytics
          <TimeDisplay>
            {' '}
            (Last updated: {new Date().toLocaleTimeString()})
          </TimeDisplay>
          <RefreshButton
            onClick={handleRefresh}
            disabled={isLoading}
            style={{ marginLeft: '16px' }}
          >
            {isLoading && <LoadingSpinner />} {isLoading ? ' Refreshing...' : ' Refresh'}
          </RefreshButton>
        </p>
      </Header>

      {/* Error display */}
      {isError && errors.length > 0 && (
        <ErrorBanner>
          ⚠️ Dashboard data unavailable. Backend endpoints may not be responding.
          <div style={{ fontSize: '12px', marginTop: '8px', fontFamily: 'monospace' }}>
            Ensure backend is running on localhost:5000
            <br />
            Expected endpoints:
            <br />
            GET /api/v1/admin/dashboard
            <br />
            GET /api/v1/admin/orders/analytics
            <br />
            GET /api/v1/admin/products/top
            <br />
            GET /api/v1/admin/affiliates/top
            <br />
            GET /api/v1/admin/system
          </div>
        </ErrorBanner>
      )}

      {/* Top Stats Cards */}
      <AdminStatsCards data={overview.data?.data} isLoading={overview.isLoading} />

      {/* Main Analytics Grid */}
      <Grid2Col>
        <RevenueChart data={revenueAnalytics.data?.data || []} isLoading={revenueAnalytics.isLoading} />
        <OrderAnalyticsChart
          data={orderAnalytics.data?.data?.byStatus || []}
          isLoading={orderAnalytics.isLoading}
        />
      </Grid2Col>

      {/* Products and Affiliates */}
      <Grid3Col>
        <div>
          <TopProductsChart
            data={topProducts.data?.data || []}
            isLoading={topProducts.isLoading}
            limit={5}
          />
        </div>
        <div>
          <TopAffiliatesChart
            data={topAffiliates.data?.data || []}
            isLoading={topAffiliates.isLoading}
            limit={5}
          />
        </div>
      </Grid3Col>

      {/* System Health Status */}
      {system.data?.data && (
        <SystemHealthWidget data={system.data.data} isLoading={system.isLoading} />
      )}
    </DashboardContainer>
  );
}

// System Health Widget component
const SystemHealthWidgetContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const HealthTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 16px 0;
`;

const HealthGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const HealthItem = styled.div`
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 4px solid ${(props) => (props.healthy ? '#10b981' : '#ef4444')};

  p {
    margin: 0 0 4px 0;
    font-size: 12px;
    color: #6b7280;
    font-weight: 600;
    text-transform: uppercase;
  }

  span {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
  }
`;

function SystemHealthWidget({ data, isLoading }) {
  if (isLoading || !data.metrics) return null;

  const { metrics } = data;
  const isHealthy = metrics.health?.isHealthy;

  return (
    <SystemHealthWidgetContainer style={{ marginTop: '20px' }}>
      <HealthTitle>
        System Health {isHealthy ? '✅' : '⚠️'}
      </HealthTitle>
      <HealthGrid>
        <HealthItem healthy={metrics.lastOrders > 0}>
          <p>Recent Orders (24h)</p>
          <span>{metrics.lastOrders || 0}</span>
        </HealthItem>
        <HealthItem healthy={metrics.failedPayouts <= 10}>
          <p>Failed Payouts</p>
          <span>{metrics.failedPayouts || 0}</span>
        </HealthItem>
        <HealthItem healthy={metrics.pendingCommissions <= 100}>
          <p>Pending Commissions</p>
          <span>{metrics.pendingCommissions || 0}</span>
        </HealthItem>
        <HealthItem healthy={true}>
          <p>Total Affiliates</p>
          <span>{metrics.totalAffiliates || 0}</span>
        </HealthItem>
      </HealthGrid>
    </SystemHealthWidgetContainer>
  );
}
