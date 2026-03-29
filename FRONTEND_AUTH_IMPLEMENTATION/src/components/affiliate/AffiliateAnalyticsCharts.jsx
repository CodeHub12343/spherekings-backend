/**
 * Affiliate Analytics Charts Component
 * Displays performance analytics with trends
 */

import styled from 'styled-components';
import { BarChart3, TrendingUp, Users, ClickIcon } from 'lucide-react';

const Container = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
`;

const CardTitle = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrendBadge = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  background-color: ${(props) => (props.$positive ? '#d4edda' : '#f8d7da')};
  color: ${(props) => (props.$positive ? '#155724' : '#721c24')};
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
`;

const MetricItem = styled.div`
  background-color: #f9f9f9;
  padding: 16px;
  border-radius: 6px;
  border: 1px solid #f0f0f0;
`;

const MetricLabel = styled.div`
  font-size: 12px;
  color: #999;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const MetricValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const SimpleChart = styled.div`
  display: flex;
  align-items: flex-end;
  gap: 8px;
  height: 120px;
  margin-top: 16px;
`;

const ChartBar = styled.div`
  flex: 1;
  background: linear-gradient(180deg, #4a90e2 0%, #357abd 100%);
  border-radius: 4px 4px 0 0;
  height: ${(props) => props.$height}%;
  min-height: 8px;
  position: relative;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: linear-gradient(180deg, #357abd 0%, #2d5fa3 100%);
    box-shadow: 0 4px 8px rgba(74, 144, 226, 0.3);
  }

  &:hover::after {
    content: '${(props) => props.$label}';
    position: absolute;
    bottom: 100%;
    left: 50%;
    transform: translateX(-50%);
    background-color: #333;
    color: white;
    padding: 4px 8px;
    border-radius: 4px;
    font-size: 11px;
    white-space: nowrap;
    margin-bottom: 4px;
  }
`;

const ChartLegend = styled.div`
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
  font-size: 12px;
  color: #666;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;

  &::before {
    content: '';
    width: 12px;
    height: 12px;
    border-radius: 2px;
    background-color: ${(props) => props.$color || '#4a90e2'};
  }
`;

export const AffiliateAnalyticsCharts = ({
  analytics = {
    period: { startDate: null, endDate: null },
    overview: {
      totalClicks: 0,
      totalConversions: 0,
      conversionRate: 0,
      totalCommissions: 0,
      uniqueVisitors: 0,
    },
    bySource: [],
    byDevice: [],
    earnings: {
      totalEarnings: 0,
      pendingEarnings: 0,
      paidEarnings: 0,
    },
  },
}) => {
  const {
    overview = {},
    bySource = [],
    byDevice = [],
    earnings = {},
  } = analytics;

  // Prepare data for charts
  const maxValue = Math.max(
    ...bySource.map((s) => s.count || 0),
    1
  );

  const formatDate = (date) => {
    if (!date) return '';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container>
      {/* Overview Card */}
      <Card>
        <CardHeader>
          <CardTitle>
            <BarChart3 size={20} />
            Overview
          </CardTitle>
        </CardHeader>
        <MetricGrid>
          <MetricItem>
            <MetricLabel>Total Clicks</MetricLabel>
            <MetricValue>{overview.totalClicks || 0}</MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Conversions</MetricLabel>
            <MetricValue>{overview.totalConversions || 0}</MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Conversion Rate</MetricLabel>
            <MetricValue>{(overview.conversionRate || 0).toFixed(1)}%</MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Unique Visitors</MetricLabel>
            <MetricValue>{overview.uniqueVisitors || 0}</MetricValue>
          </MetricItem>
        </MetricGrid>
      </Card>

      {/* Traffic by Source Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Traffic by Source</CardTitle>
        </CardHeader>
        {bySource.length > 0 ? (
          <>
            <SimpleChart>
              {bySource.slice(0, 6).map((source, idx) => (
                <ChartBar
                  key={idx}
                  $height={(source.count / maxValue) * 100}
                  $label={source._id}
                />
              ))}
            </SimpleChart>
            <ChartLegend>
              {bySource.slice(0, 4).map((source, idx) => (
                <LegendItem key={idx} $color="#4a90e2">
                  {source._id}: {source.count} ({source.conversions || 0} conversions)
                </LegendItem>
              ))}
            </ChartLegend>
          </>
        ) : (
          <MetricItem style={{ textAlign: 'center', color: '#999' }}>
            No traffic data available
          </MetricItem>
        )}
      </Card>

      {/* Device Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Device Breakdown</CardTitle>
        </CardHeader>
        <MetricGrid style={{ gridTemplateColumns: '1fr' }}>
          {byDevice.length > 0 ? (
            byDevice.map((device, idx) => (
              <MetricItem key={idx}>
                <MetricLabel>
                  {device._id === 'mobile' ? '📱' : '💻'} {device._id}
                </MetricLabel>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <MetricValue>{device.count} clicks</MetricValue>
                  <div style={{ fontSize: '14px', color: '#666' }}>
                    {device.conversions || 0} conversions
                  </div>
                </div>
              </MetricItem>
            ))
          ) : (
            <MetricItem style={{ textAlign: 'center', color: '#999' }}>
              No device data available
            </MetricItem>
          )}
        </MetricGrid>
      </Card>

      {/* Earnings Summary */}
      <Card>
        <CardHeader>
          <CardTitle>
            <TrendingUp size={20} />
            Earnings Summary
          </CardTitle>
        </CardHeader>
        <MetricGrid>
          <MetricItem>
            <MetricLabel>Total Commission</MetricLabel>
            <MetricValue>${(earnings.totalEarnings || 0).toFixed(2)}</MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Pending</MetricLabel>
            <MetricValue style={{ color: '#856404' }}>
              ${(earnings.pendingEarnings || 0).toFixed(2)}
            </MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Paid Out</MetricLabel>
            <MetricValue style={{ color: '#155724' }}>
              ${(earnings.paidEarnings || 0).toFixed(2)}
            </MetricValue>
          </MetricItem>
          <MetricItem>
            <MetricLabel>Total Commission Rate</MetricLabel>
            <MetricValue>{overview.totalCommissions || 0}%</MetricValue>
          </MetricItem>
        </MetricGrid>
      </Card>
    </Container>
  );
};

export default AffiliateAnalyticsCharts;
