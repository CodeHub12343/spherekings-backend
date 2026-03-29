/**
 * Analytics Chart Components
 * RevenueChart, TopProductsChart, TopAffiliatesChart, OrderAnalyticsChart
 */

'use client';

import styled from 'styled-components';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';

const ChartContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const ChartTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0 0 20px 0;
`;

const ChartWrapper = styled.div`
  width: 100%;
  height: 300px;
`;

const CustomTooltip = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  font-size: 12px;
  color: #374151;
`;

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#14b8a6'];

// ============================================================================
// REVENUE CHART
// ============================================================================

/**
 * @typedef {Object} RevenueData
 * @property {string} _id
 * @property {number} revenue
 * @property {number} orderCount
 * @property {number} averageOrderValue
 */

/**
 * @typedef {Object} RevenueChartProps
 * @property {RevenueData[]} [data]
 * @property {boolean} [isLoading]
 */

/**
 * @param {RevenueChartProps} props
 */
export function RevenueChart({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>Revenue Analytics</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '120px', color: '#9ca3af' }}>
            Loading chart...
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Revenue Analytics</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '120px', color: '#9ca3af' }}>
            No data available
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>Revenue Analytics</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="_id"
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Line
              type="monotone"
              dataKey="revenue"
              stroke="#3b82f6"
              strokeWidth={2}
              dot={{ fill: '#3b82f6', r: 4 }}
              activeDot={{ r: 6 }}
            />
            <Line
              type="monotone"
              dataKey="orderCount"
              stroke="#10b981"
              strokeWidth={2}
              dot={{ fill: '#10b981', r: 4 }}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}

// ============================================================================
// TOP PRODUCTS CHART
// ============================================================================

/**
 * @typedef {Object} TopProductData
 * @property {string} _id
 * @property {string} productName
 * @property {number} totalRevenue
 * @property {number} totalQuantitySold
 */

/**
 * @typedef {Object} TopProductsChartProps
 * @property {TopProductData[]} [data]
 * @property {boolean} [isLoading]
 * @property {number} [limit]
 */

/**
 * @param {TopProductsChartProps} props
 */
export function TopProductsChart({ data = [], isLoading = false, limit = 10 }) {
  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>Top Selling Products</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '120px', color: '#9ca3af' }}>
            Loading chart...
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Top Selling Products</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '120px', color: '#9ca3af' }}>
            No data available
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  return (
    <ChartContainer>
      <ChartTitle>Top {Math.min(limit, data.length)} Selling Products</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data.slice(0, limit)} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="productName"
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
            />
            <Legend />
            <Bar dataKey="totalRevenue" fill="#3b82f6" name="Total Revenue" />
            <Bar dataKey="totalQuantitySold" fill="#10b981" name="Quantity Sold" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}

// ============================================================================
// TOP AFFILIATES CHART
// ============================================================================

/**
 * @typedef {Object} TopAffiliateData
 * @property {string} _id
 * @property {string} affiliateName
 * @property {number} totalCommission
 * @property {number} totalReferrals
 */

/**
 * @typedef {Object} TopAffiliatesChartProps
 * @property {TopAffiliateData[]} [data]
 * @property {boolean} [isLoading]
 * @property {number} [limit]
 */

/**
 * @param {TopAffiliatesChartProps} props
 */
export function TopAffiliatesChart({
  data = [],
  isLoading = false,
  limit = 10
}) {
  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>Top Performing Affiliates</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '120px', color: '#9ca3af' }}>
            Loading chart...
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Top Performing Affiliates</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '120px', color: '#9ca3af' }}>
            No data available
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  // Transform data to include display label combining name and email for uniqueness
  const chartData = data.slice(0, limit).map((affiliate) => ({
    ...affiliate,
    displayName: affiliate.affiliateEmail 
      ? `${affiliate.affiliateName} (${affiliate.affiliateEmail.split('@')[0]})`
      : affiliate.affiliateName || `Affiliate ${affiliate._id}`
  }));

  return (
    <ChartContainer>
      <ChartTitle>Top {Math.min(limit, chartData.length)} Performing Affiliates</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 60 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis
              dataKey="displayName"
              angle={-45}
              textAnchor="end"
              height={80}
              stroke="#9ca3af"
              style={{ fontSize: '12px' }}
            />
            <YAxis stroke="#9ca3af" style={{ fontSize: '12px' }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '6px'
              }}
              labelComponent={({ active, payload }) => {
                if (active && payload && payload[0]) {
                  const data = payload[0].payload;
                  return (
                    <div style={{ backgroundColor: '#fff', padding: '12px', border: '1px solid #e5e7eb', borderRadius: '6px' }}>
                      <p style={{ margin: '0 0 8px 0', fontWeight: '600', color: '#111' }}>
                        {data.affiliateName}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                        Email: {data.affiliateEmail}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', color: '#666' }}>
                        Status: {data.status}
                      </p>
                      <p style={{ margin: '0 0 4px 0', fontSize: '12px', fontWeight: '600', color: '#f59e0b' }}>
                        Commission: ${data.totalCommission.toFixed(2)}
                      </p>
                      <p style={{ margin: '0', fontSize: '12px', fontWeight: '600', color: '#8b5cf6' }}>
                        Referrals: {data.totalReferrals}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <Legend />
            <Bar dataKey="totalCommission" fill="#f59e0b" name="Total Commission" />
            <Bar dataKey="totalReferrals" fill="#8b5cf6" name="Total Referrals" />
          </BarChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}

// ============================================================================
// ORDER ANALYTICS CHART (by status)
// ============================================================================

/**
 * @typedef {Object} OrderStatusData
 * @property {string} _id
 * @property {number} count
 * @property {number} totalRevenue
 */

/**
 * @typedef {Object} OrderAnalyticsChartProps
 * @property {OrderStatusData[]} [data]
 * @property {boolean} [isLoading]
 */

/**
 * @param {OrderAnalyticsChartProps} props
 */
export function OrderAnalyticsChart({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <ChartContainer>
        <ChartTitle>Order Status Distribution</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '80px', color: '#9ca3af' }}>
            Loading chart...
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  if (!data || data.length === 0) {
    return (
      <ChartContainer>
        <ChartTitle>Order Status Distribution</ChartTitle>
        <ChartWrapper>
          <div style={{ textAlign: 'center', paddingTop: '80px', color: '#9ca3af' }}>
            No data available
          </div>
        </ChartWrapper>
      </ChartContainer>
    );
  }

  const pieData = data.map((item) => ({
    name: item._id?.toUpperCase() || 'Unknown',
    value: item.count || 0,
    revenue: item.totalRevenue || 0
  }));

  return (
    <ChartContainer>
      <ChartTitle>Order Status Distribution</ChartTitle>
      <ChartWrapper>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, value }) => `${name}: ${value}`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </ChartWrapper>
    </ChartContainer>
  );
}
