/**
 * AdminStatsCards - Summary statistics displayed in dashboard
 * Shows key metrics: revenue, orders, products, affiliates, commissions, payouts
 */

'use client';

import styled from 'styled-components';

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 30px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
    margin-bottom: 12px;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.2s ease;

  &:hover {
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
    border-color: #d1d5db;
  }

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const StatLabel = styled.p`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 8px 0;

  @media (max-width: 480px) {
    font-size: 11px;
    margin: 0 0 6px 0;
  }
`;

const StatValue = styled.h3`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
  }
`;

const StatSubtext = styled.p`
  font-size: 13px;
  color: #9ca3af;
  margin: 8px 0 0 0;

  @media (max-width: 768px) {
    font-size: 12px;
    margin: 6px 0 0 0;
  }

  @media (max-width: 480px) {
    font-size: 11px;
    margin: 4px 0 0 0;
  }
`;

const StatIcon = styled.div`
  font-size: 24px;
  margin-bottom: 12px;

  @media (max-width: 768px) {
    font-size: 22px;
    margin-bottom: 10px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
    margin-bottom: 8px;
  }
`;

/**
 * @typedef {Object} StatsData
 * @property {Object} [revenue]
 * @property {number} revenue.total
 * @property {number} [revenue.averageOrderValue]
 * @property {Object} [orders]
 * @property {number} orders.total
 * @property {number} [orders.completed]
 * @property {number} [orders.pending]
 * @property {number} [orders.failed]
 * @property {Object} [products]
 * @property {number} products.total
 * @property {number} [products.active]
 * @property {Object} [affiliates]
 * @property {number} affiliates.total
 * @property {number} [affiliates.active]
 * @property {Object} [commissions]
 * @property {Object} [commissions.pending]
 * @property {number} commissions.pending.count
 * @property {number} commissions.pending.total
 * @property {Object} [commissions.approved]
 * @property {number} commissions.approved.count
 * @property {number} commissions.approved.total
 * @property {Object} [commissions.paid]
 * @property {number} commissions.paid.count
 * @property {number} commissions.paid.total
 * @property {Object} [payouts]
 * @property {Object} [payouts.pending]
 * @property {number} payouts.pending.count
 * @property {number} payouts.pending.total
 * @property {Object} [payouts.completed]
 * @property {number} payouts.completed.count
 * @property {number} payouts.completed.total
 */

/**
 * @typedef {Object} AdminStatsCardsProps
 * @property {StatsData} [data]
 * @property {boolean} [isLoading]
 */

/**
 * @param {AdminStatsCardsProps} props
 */
export function AdminStatsCards({ data = {}, isLoading = false }) {
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatNumber = (value) => {
    return new Intl.NumberFormat('en-US').format(value);
  };

  const stats = [
    {
      icon: '💰',
      label: 'Total Revenue',
      value: data.revenue ? formatCurrency(data.revenue.total) : '$0',
      subtext: data.revenue ? formatCurrency(data.revenue.averageOrderValue || 0) + ' avg' : '',
      color: '#10b981'
    },
    {
      icon: '📦',
      label: 'Total Orders',
      value: data.orders ? formatNumber(data.orders.total) : '0',
      subtext: data.orders
        ? `${data.orders.completed || 0} completed, ${data.orders.pending || 0} pending`
        : '',
      color: '#3b82f6'
    },
    {
      icon: '🏷️',
      label: 'Total Products',
      value: data.products ? formatNumber(data.products.total) : '0',
      subtext: data.products ? `${data.products.active || 0} active` : '',
      color: '#8b5cf6'
    },
    {
      icon: '👥',
      label: 'Total Affiliates',
      value: data.affiliates ? formatNumber(data.affiliates.total) : '0',
      subtext: data.affiliates ? `${data.affiliates.active || 0} active` : '',
      color: '#f59e0b'
    },
    {
      icon: '💳',
      label: 'Pending Commissions',
      value: data.commissions ? formatNumber(data.commissions.pending?.count || 0) : '0',
      subtext: data.commissions
        ? formatCurrency(data.commissions.pending?.total || 0)
        : '',
      color: '#ec4899'
    },
    {
      icon: '💸',
      label: 'Completed Payouts',
      value: data.payouts ? formatNumber(data.payouts.completed?.count || 0) : '0',
      subtext: data.payouts ? formatCurrency(data.payouts.completed?.total || 0) : '',
      color: '#14b8a6'
    }
  ];

  return (
    <StatsContainer>
      {stats.map((stat, index) => (
        <StatCard key={index}>
          <StatIcon>{stat.icon}</StatIcon>
          <StatLabel>{stat.label}</StatLabel>
          <StatValue>{isLoading ? '...' : stat.value}</StatValue>
          {stat.subtext && <StatSubtext>{stat.subtext}</StatSubtext>}
        </StatCard>
      ))}
    </StatsContainer>
  );
}
