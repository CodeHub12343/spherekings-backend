'use client';

import React from 'react';
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
  calculateAvgCommission,
} from '@/utils/referralUtils';

/**
 * ReferralStatsCards Component
 * Displays key referral statistics in card format
 *
 * Shows: total clicks, conversions, conversion rate, revenue, unique visitors, avg commission
 */
export default function ReferralStatsCards({ stats, isLoading = false }) {
  const statCards = [
    {
      id: 'clicks',
      label: 'Total Clicks',
      value: stats?.totalClicks || 0,
      icon: '🔗',
      color: 'blue',
      format: 'number',
    },
    {
      id: 'conversions',
      label: 'Conversions',
      value: stats?.totalConversions || 0,
      icon: '✅',
      color: 'green',
      format: 'number',
    },
    {
      id: 'rate',
      label: 'Conversion Rate',
      value: (stats?.conversionRate || 0) / 100,
      icon: '📊',
      color: 'purple',
      format: 'percentage',
    },
    {
      id: 'revenue',
      label: 'Total Revenue',
      value: stats?.totalCommissions || 0,
      icon: '💰',
      color: 'emerald',
      format: 'currency',
    },
    {
      id: 'visitors',
      label: 'Unique Visitors',
      value: stats?.uniqueVisitors || 0,
      icon: '👥',
      color: 'orange',
      format: 'number',
    },
    {
      id: 'avg',
      label: 'Avg Commission',
      value: calculateAvgCommission(stats?.totalCommissions || 0, stats?.totalConversions || 1),
      icon: '💵',
      color: 'indigo',
      format: 'currency',
    },
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 border-blue-100 text-blue-600',
      green: 'bg-green-50 border-green-100 text-green-600',
      purple: 'bg-purple-50 border-purple-100 text-purple-600',
      emerald: 'bg-emerald-50 border-emerald-100 text-emerald-600',
      orange: 'bg-orange-50 border-orange-100 text-orange-600',
      indigo: 'bg-indigo-50 border-indigo-100 text-indigo-600',
    };
    return colors[color] || colors.blue;
  };

  const formatValue = (value, format) => {
    if (format === 'currency') return formatCurrency(value);
    if (format === 'percentage') return formatPercentage(value, 1);
    return formatNumber(value);
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {statCards.map((card) => (
        <div
          key={card.id}
          className={`border rounded-lg p-6 transition-transform hover:scale-105 ${getColorClasses(
            card.color
          )}`}
        >
          <div className="flex items-start justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">{card.label}</p>
              <p className="text-2xl font-bold mt-2">{formatValue(card.value, card.format)}</p>
            </div>
            <span className="text-3xl">{card.icon}</span>
          </div>
        </div>
      ))}
    </div>
  );
}
