'use client';

import React from 'react';
import { getDeviceName, formatNumber, formatPercentage } from '@/utils/referralUtils';

/**
 * DeviceAnalyticsChart Component
 * Pie chart showing referral distribution by device type
 */
export default function DeviceAnalyticsChart({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <div className="h-64 bg-gray-50 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <h3 className="font-semibold text-lg mb-4">Traffic by Device</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  const totalClicks = data.reduce((sum, item) => sum + (item.count || 0), 0);
  const totalConversions = data.reduce((sum, item) => sum + (item.conversions || 0), 0);

  const deviceColors = {
    mobile: 'bg-blue-500',
    tablet: 'bg-purple-500',
    desktop: 'bg-emerald-500',
  };

  const deviceBgColors = {
    mobile: 'bg-blue-50',
    tablet: 'bg-purple-50',
    desktop: 'bg-emerald-50',
  };

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <h3 className="font-semibold text-lg mb-6">Traffic by Device</h3>

      <div className="flex gap-8">
        {/* Pie chart visualization */}
        <div className="flex-1 flex items-center justify-center">
          <div className="relative w-48 h-48">
            <svg viewBox="0 0 100 100" className="w-full h-full transform -rotate-90">
              {data.map((item, index) => {
                const startAngle = data.slice(0, index).reduce((sum, d) => sum + (d.count / totalClicks) * 360, 0);
                const endAngle = startAngle + (item.count / totalClicks) * 360;
                const startRad = (startAngle * Math.PI) / 180;
                const endRad = (endAngle * Math.PI) / 180;
                const radius = 30;
                const x1 = 50 + radius * Math.cos(startRad);
                const y1 = 50 + radius * Math.sin(startRad);
                const x2 = 50 + radius * Math.cos(endRad);
                const y2 = 50 + radius * Math.sin(endRad);
                const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

                return (
                  <path
                    key={`path-${item._id}`}
                    d={`M 50 50 L ${x1} ${y1} A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`}
                    fill={`url(#${item._id})`}
                    className="cursor-pointer hover:opacity-80 transition"
                  />
                );
              })}
              <defs>
                {Object.entries(deviceColors).map(([device, color]) => (
                  <linearGradient key={device} id={device}>
                    <stop offset="0%" stopColor={color === 'bg-blue-500' ? '#3b82f6' : color === 'bg-purple-500' ? '#a855f7' : '#10b981'} />
                    <stop offset="100%" stopColor={color === 'bg-blue-500' ? '#1e40af' : color === 'bg-purple-500' ? '#7c3aed' : '#059669'} />
                  </linearGradient>
                ))}
              </defs>
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className="text-2xl font-bold">{formatNumber(totalClicks)}</div>
                <div className="text-xs text-gray-600">total clicks</div>
              </div>
            </div>
          </div>
        </div>

        {/* Statistics */}
        <div className="flex-1 space-y-4">
          {data.map((item) => {
            const percentage = totalClicks > 0 ? (item.count / totalClicks) * 100 : 0;
            const conversionRate = item.count > 0 ? (item.conversions / item.count) * 100 : 0;
            const colorClass = deviceColors[item._id] || 'bg-gray-500';

            return (
              <div key={item._id} className={`p-4 rounded-lg ${deviceBgColors[item._id] || 'bg-gray-50'}`}>
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{getDeviceName(item._id)}</span>
                  <span className="text-sm text-gray-600">{percentage.toFixed(1)}%</span>
                </div>

                <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                  <div
                    className={`h-full ${colorClass}`}
                    style={{ width: `${percentage}%` }}
                  />
                </div>

                <div className="flex justify-between text-xs text-gray-600">
                  <span>{formatNumber(item.count)} clicks</span>
                  <span>{conversionRate.toFixed(1)}% conv.</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
