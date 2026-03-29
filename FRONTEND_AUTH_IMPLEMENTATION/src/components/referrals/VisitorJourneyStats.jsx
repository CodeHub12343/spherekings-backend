'use client';

import React from 'react';
import {
  calculateEngagementScore,
  getEngagementScoreLabel,
  getEngagementScoreColor,
} from '@/utils/referralUtils';

/**
 * VisitorJourneyStats Component
 * Shows visitor journey metrics and engagement scoring
 */
export default function VisitorJourneyStats({ stats, isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <div className="h-48 bg-gray-50 animate-pulse rounded-lg" />
      </div>
    );
  }

  const engagementScore = calculateEngagementScore(stats);

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <h3 className="font-semibold text-lg mb-6">Visitor Journey</h3>

      <div className="space-y-6">
        {/* Engagement Score Gauge */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-gray-700">Engagement Score</span>
            <span className={`text-lg font-bold ${getEngagementScoreColor(engagementScore)}`}>
              {engagementScore}
              <span className="text-xs text-gray-500 ml-1">/ 100</span>
            </span>
          </div>

          <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 transition-all"
              style={{ width: `${engagementScore}%` }}
            />
          </div>

          <div className={`text-sm font-medium ${getEngagementScoreColor(engagementScore)} mt-2`}>
            {getEngagementScoreLabel(engagementScore)}
          </div>
        </div>

        {/* Journey Funnel */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 mb-3">Visitor Funnel</h4>

          <div className="space-y-2">
            {/* Visitors */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>👥 Unique Visitors</span>
                <span className="font-bold">{stats?.uniqueVisitors || 0}</span>
              </div>
              <div className="h-2 bg-blue-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '100%' }} />
              </div>
            </div>

            {/* Clicks */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>🔗 Clicks</span>
                <span className="font-bold">{stats?.totalClicks || 0}</span>
              </div>
              <div className="h-2 bg-purple-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-purple-500"
                  style={{
                    width: stats?.totalClicks && stats?.uniqueVisitors
                      ? `${(stats.totalClicks / stats.uniqueVisitors) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>

            {/* Conversions */}
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span>✅ Conversions</span>
                <span className="font-bold">{stats?.totalConversions || 0}</span>
              </div>
              <div className="h-2 bg-green-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-green-500"
                  style={{
                    width: stats?.totalConversions && stats?.totalClicks
                      ? `${(stats.totalConversions / stats.totalClicks) * 100}%`
                      : '0%',
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Conversion Metrics */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-gray-200">
          <div>
            <p className="text-xs text-gray-600 mb-1">Click-to-Visitor Ratio</p>
            <p className="text-xl font-bold">
              {stats?.uniqueVisitors && stats?.totalClicks
                ? (stats.totalClicks / stats.uniqueVisitors).toFixed(2)
                : '0.00'}
              x
            </p>
          </div>

          <div>
            <p className="text-xs text-gray-600 mb-1">Conversion Rate</p>
            <p className="text-xl font-bold">
              {stats?.conversionRate ? `${stats.conversionRate.toFixed(1)}%` : '0%'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
