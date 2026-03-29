'use client';

import React from 'react';
import { formatNumber, formatDate } from '@/utils/referralUtils';

/**
 * ReferralTrendChart Component
 * Line chart showing referral trends over time
 */
export default function ReferralTrendChart({ data = [], isLoading = false }) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <div className="h-80 bg-gray-50 animate-pulse rounded-lg" />
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="rounded-lg border border-gray-200 p-6 bg-white">
        <h3 className="font-semibold text-lg mb-4">Referral Trends</h3>
        <div className="h-80 flex items-center justify-center text-gray-500">
          No data available for selected date range
        </div>
      </div>
    );
  }

  const maxClicks = Math.max(...data.map((item) => item.clicks || 0), 1);
  const maxConversions = Math.max(...data.map((item) => item.conversions || 0), 1);

  // Calculate line coordinates
  const graphHeight = 300;
  const graphWidth = data.length * 40;
  const padding = 40;

  const points = data.map((item, index) => {
    const x = padding + index * 40;
    const y = graphHeight - (item.clicks / maxClicks) * graphHeight;
    return { x, y, item };
  });

  const conversionPoints = data.map((item, index) => {
    const x = padding + index * 40;
    const y = graphHeight - (item.conversions / maxConversions) * graphHeight;
    return { x, y, item };
  });

  // Generate SVG line path
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  const conversionPath = conversionPoints
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

  return (
    <div className="rounded-lg border border-gray-200 p-6 bg-white">
      <h3 className="font-semibold text-lg mb-6">Referral Trends</h3>

      <div className="overflow-x-auto">
        <svg
          viewBox={`0 0 ${graphWidth + padding * 2} ${graphHeight + 80}`}
          className="w-full min-w-max"
        >
          {/* Grid lines */}
          {Array.from({ length: 5 }).map((_, i) => (
            <line
              key={`grid-${i}`}
              x1={padding}
              y1={padding + (i * graphHeight) / 4}
              x2={graphWidth + padding}
              y2={padding + (i * graphHeight) / 4}
              stroke="#e5e7eb"
              strokeDasharray="4"
            />
          ))}

          {/* Y-axis */}
          <line x1={padding} y1={padding} x2={padding} y2={padding + graphHeight} stroke="#ccc" />

          {/* X-axis */}
          <line x1={padding} y1={padding + graphHeight} x2={graphWidth + padding} y2={padding + graphHeight} stroke="#ccc" />

          {/* Y-axis labels */}
          {Array.from({ length: 5 }).map((_, i) => {
            const value = Math.round((maxClicks * (4 - i)) / 4);
            return (
              <text
                key={`y-label-${i}`}
                x={padding - 10}
                y={padding + (i * graphHeight) / 4 + 5}
                textAnchor="end"
                fontSize="12"
                fill="#666"
              >
                {formatNumber(value)}
              </text>
            );
          })}

          {/* Clicks line */}
          <path
            d={linePath}
            fill="none"
            stroke="#3b82f6"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Clicks points */}
          {points.map((p, i) => (
            <circle key={`click-${i}`} cx={p.x} cy={p.y} r="4" fill="#3b82f6" />
          ))}

          {/* Conversions line */}
          <path
            d={conversionPath}
            fill="none"
            stroke="#10b981"
            strokeWidth="2"
            strokeDasharray="5,5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Conversions points */}
          {conversionPoints.map((p, i) => (
            <circle key={`conv-${i}`} cx={p.x} cy={p.y} r="4" fill="#10b981" />
          ))}

          {/* X-axis labels */}
          {data.map((item, i) => (
            <text
              key={`x-label-${i}`}
              x={padding + i * 40}
              y={padding + graphHeight + 20}
              textAnchor="middle"
              fontSize="12"
              fill="#666"
            >
              {formatDate(item.date, 'short').split('/')[1]}
            </text>
          ))}
        </svg>
      </div>

      {/* Legend */}
      <div className="mt-6 flex gap-6 justify-center text-sm">
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-blue-500 rounded"></div>
          <span>Clicks</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-6 h-1 bg-green-500 rounded" style={{ backgroundImage: 'repeating-linear-gradient(90deg, #10b981 0, #10b981 5px, transparent 5px, transparent 10px)' }}></div>
          <span>Conversions</span>
        </div>
      </div>

      {/* Summary stats */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="p-3 bg-blue-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-blue-600">
            {formatNumber(data.reduce((sum, d) => sum + (d.clicks || 0), 0))}
          </div>
          <div className="text-xs text-blue-600">Total Clicks</div>
        </div>
        <div className="p-3 bg-green-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-green-600">
            {formatNumber(data.reduce((sum, d) => sum + (d.conversions || 0), 0))}
          </div>
          <div className="text-xs text-green-600">Total Conversions</div>
        </div>
        <div className="p-3 bg-purple-50 rounded-lg text-center">
          <div className="text-2xl font-bold text-purple-600">
            {(
              ((data.reduce((sum, d) => sum + (d.conversions || 0), 0) /
                data.reduce((sum, d) => sum + (d.clicks || 0), 0)) *
                100) ||
              0
            ).toFixed(1)}
            %
          </div>
          <div className="text-xs text-purple-600">Avg Conversion Rate</div>
        </div>
      </div>
    </div>
  );
}
