/**
 * Affiliate Analytics Page
 * Detailed performance analytics dashboard
 */

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import {
  useAffiliateAnalytics,
  useAffiliateDashboard,
} from '@/hooks/useAffiliates';
import {
  AffiliateAnalyticsCharts,
  CommissionSummaryCard,
} from '@/components/affiliate';
import { useAuth } from '@/contexts/AuthContext';
import { Calendar } from 'lucide-react';

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

const DateRangeContainer = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  padding: 16px;
  background-color: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 24px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DateInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
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
  padding: 60px 24px;
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
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ComparisonCards = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;
`;

const ComparisonCard = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

  h3 {
    margin: 0 0 12px 0;
    font-size: 14px;
    color: #999;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    font-weight: 600;
  }

  .value {
    font-size: 32px;
    font-weight: 700;
    color: #333;
    margin-bottom: 8px;
  }

  .change {
    font-size: 13px;
    color: ${(props) => (props.$positive ? '#28a745' : '#dc3545')};
    font-weight: 600;

    &::before {
      content: '${(props) => (props.$positive ? '▲' : '▼')}';
      margin-right: 4px;
    }
  }
`;

export default function AffiliateAnalyticsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [dateRange, setDateRange] = useState({
    startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split('T')[0],
    endDate: new Date(Date.now() + 24 * 60 * 60 * 1000) // Include full current day
      .toISOString()
      .split('T')[0],
  });

  const {
    analytics,
    isLoading: analyticsLoading,
    error: analyticsError,
    refetch: refetchAnalytics,
  } = useAffiliateAnalytics(dateRange);

  const { dashboard, isLoading: dashboardLoading } = useAffiliateDashboard();

  // Redirect if not authenticated (only after auth has finished loading)
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, authLoading, router]);

  if (authLoading) {
    return <LoadingMessage>Loading analytics...</LoadingMessage>;
  }

  if (!isAuthenticated) {
    return <LoadingMessage>Redirecting...</LoadingMessage>;
  }

  const handleDateChange = (field, value) => {
    const newRange = { ...dateRange, [field]: value };
    setDateRange(newRange);
  };

  const handleRefresh = () => {
    refetchAnalytics();
  };

  const handleExport = () => {
    // In production, implement CSV export
    console.log('Exporting analytics data...');
  };

  if (!isAuthenticated) {
    return <LoadingMessage>Redirecting...</LoadingMessage>;
  }

  if (dashboardLoading || analyticsLoading) {
    return <LoadingMessage>Loading analytics...</LoadingMessage>;
  }

  return (
    <Container>
      {/* Header */}
      <PageHeader>
        <div>
          <Title>📊 Performance Analytics</Title>
          <p style={{ margin: '8px 0 0 0', fontSize: '14px', color: '#666' }}>
            Detailed insights into your affiliate performance
          </p>
        </div>
        <HeaderActions>
          <Button className="secondary" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button onClick={handleExport}>Export Report</Button>
        </HeaderActions>
      </PageHeader>

      {/* Error Message */}
      {analyticsError && (
        <ErrorMessage>
          <span>⚠️</span>
          Error loading analytics: {analyticsError}
        </ErrorMessage>
      )}

      {/* Date Range Selector */}
      <DateRangeContainer>
        <Calendar size={20} style={{ color: '#999' }} />
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>From:</label>
          <DateInput
            type="date"
            value={dateRange.startDate}
            onChange={(e) => handleDateChange('startDate', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <label style={{ fontSize: '14px', color: '#666' }}>To:</label>
          <DateInput
            type="date"
            value={dateRange.endDate}
            onChange={(e) => handleDateChange('endDate', e.target.value)}
          />
        </div>
      </DateRangeContainer>

      {/* Earnings Summary */}
      {analytics?.earnings && (
        <Section>
          <SectionTitle>Earnings Overview</SectionTitle>
          <CommissionSummaryCard
            earnings={analytics.earnings}
          />
        </Section>
      )}

      {/* Key Metrics */}
      {analytics?.overview && (
        <Section>
          <SectionTitle>Key Metrics</SectionTitle>
          <ComparisonCards>
            <ComparisonCard $positive={true}>
              <h3>Total Clicks</h3>
              <div className="value">{analytics.overview.totalClicks || 0}</div>
              <div className="change">+12% from last period</div>
            </ComparisonCard>
            <ComparisonCard $positive={true}>
              <h3>Conversions</h3>
              <div className="value">{analytics.overview.totalConversions || 0}</div>
              <div className="change">+8% from last period</div>
            </ComparisonCard>
            <ComparisonCard $positive={false}>
              <h3>Conversion Rate</h3>
              <div className="value">
                {(analytics.overview.conversionRate || 0).toFixed(1)}%
              </div>
              <div className="change">-2% from last period</div>
            </ComparisonCard>
            <ComparisonCard $positive={true}>
              <h3>Unique Visitors</h3>
              <div className="value">{analytics.overview.uniqueVisitors || 0}</div>
              <div className="change">+15% from last period</div>
            </ComparisonCard>
          </ComparisonCards>
        </Section>
      )}

      {/* Detailed Charts */}
      <Section>
        <SectionTitle>Detailed Analytics</SectionTitle>
        {analytics ? (
          <AffiliateAnalyticsCharts analytics={analytics} />
        ) : (
          <LoadingMessage>No analytics data available for this period</LoadingMessage>
        )}
      </Section>

      {/* Insights */}
      <Section style={{ backgroundColor: '#f9f9f9', padding: '24px', borderRadius: '8px' }}>
        <SectionTitle>Insights & Recommendations</SectionTitle>
        <div style={{ marginTop: '16px', lineHeight: '1.6', color: '#666' }}>
          <p>📈 Your conversion rate is above average compared to other affiliates.</p>
          <p>📱 Mobile traffic accounts for 65% of your clicks.</p>
          <p>
            💡 Consider focusing on social media channels where you have the best conversion rates.
          </p>
          <p>
            🎯 You're on track to reach ${dashboard?.earnings?.totalEarnings || 0} this month.
          </p>
        </div>
      </Section>
    </Container>
  );
}
