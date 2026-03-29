'use client';

import React from 'react';
import { getSourceName, formatNumber } from '@/utils/referralUtils';

/**
 * ReferralSourceChart Component
 * Bar chart showing referral clicks and conversions by source
 */
export default function ReferralSourceChart({ data = [], isLoading = false }) {
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
        <h3 className="font-semibold text-lg mb-4">Traffic by Source</h3>
        <div className="h-64 flex items-center justify-center text-gray-500">
          No data available
        </div>
      </div>
    );
  }

  // Find max value for scaling
  const maxClicks = Math.max(...data.map((item) => item.count || 0));
  const barWidth = (clicks) => `${(clicks / maxClicks) * 100}%`;

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <h3 className="font-semibold text-lg mb-6">Traffic by Source</h3>

      <div className="space-y-4">
        {data.map((item) => (
          <div key={item._id} className="flex items-center gap-4">
            <div className="w-24 text-sm font-medium">{getSourceName(item._id)}</div>

            <div className="flex-1">
              <div className="h-8 bg-gray-100 rounded-lg overflow-hidden flex items-center">
                {item.count > 0 && (
                  <>
                    <div className="h-full bg-blue-500 flex items-center px-2 text-xs font-bold text-white transition-all"
                      style={{ width: barWidth(item.count) }}
                    >
                      {formatNumber(item.count)}
                    </div>
                    {item.conversions > 0 && (
                      <div className="h-full bg-green-500 flex items-center px-2 text-xs font-bold text-white"
                        style={{ width: `${(item.conversions / maxClicks) * 100}%` }}
                      >
                        {formatNumber(item.conversions)}
                      </div>
                    )}
                  </>
                )}
              </div>
            </div>

            <div className="w-20 text-right">
              <div className="text-sm font-bold">
                {item.conversions > 0 ? ((item.conversions / item.count) * 100).toFixed(1) : 0}%
              </div>
              <div className="text-xs text-gray-600">conversion</div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex gap-4 text-xs">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-blue-500 rounded"></div>
          <span>Clicks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded"></div>
          <span>Conversions</span>
        </div>
      </div>
    </div>
  );
}
