/**
 * Referral Tracking Utility Functions
 * Helper functions for formatting, calculations, and data manipulation
 */

/**
 * Format currency value
 *
 * @param {number} value - Value to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string
 */
export function formatCurrency(value, currency = 'USD') {
  if (typeof value !== 'number') return '$0.00';

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

/**
 * Format date to readable string
 *
 * @param {string|Date} date - Date to format
 * @param {string} format - Format type ('short', 'long', 'time')
 * @returns {string} Formatted date
 */
export function formatDate(date, format = 'short') {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (format === 'short') {
    return dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: '2-digit' });
  } else if (format === 'long') {
    return dateObj.toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  } else if (format === 'time') {
    return dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  }

  return dateObj.toLocaleDateString();
}

/**
 * Format datetime with both date and time
 *
 * @param {string|Date} date - Date to format
 * @returns {string} Formatted datetime
 */
export function formatDateTime(date) {
  if (!date) return 'N/A';

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  return dateObj.toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format percentage
 *
 * @param {number} value - Value as decimal (e.g., 0.25 for 25%)
 * @param {number} decimals - Decimal places (default: 1)
 * @returns {string} Formatted percentage
 */
export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number') return '0%';

  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format number with commas
 *
 * @param {number} value - Value to format
 * @param {number} decimals - Decimal places (default: 0)
 * @returns {string} Formatted number
 */
export function formatNumber(value, decimals = 0) {
  if (typeof value !== 'number') return '0';

  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Get device name from device type
 *
 * @param {string} device - Device type ('mobile', 'tablet', 'desktop')
 * @returns {string} Device display name
 */
export function getDeviceName(device) {
  const deviceMap = {
    mobile: '📱 Mobile',
    tablet: '📱 Tablet',
    desktop: '💻 Desktop',
  };

  return deviceMap[device] || device || 'Unknown';
}

/**
 * Get device icon
 *
 * @param {string} device - Device type
 * @returns {string} Device emoji icon
 */
export function getDeviceIcon(device) {
  const iconMap = {
    mobile: '📱',
    tablet: '📱',
    desktop: '💻',
  };

  return iconMap[device] || '🖥️';
}

/**
 * Get referral source display name
 *
 * @param {string} source - Referral source code
 * @returns {string} Display name
 */
export function getSourceName(source) {
  const sourceMap = {
    direct: 'Direct',
    email: '📧 Email',
    facebook: '👍 Facebook',
    twitter: '🐦 Twitter/X',
    instagram: '📷 Instagram',
    tiktok: '🎵 TikTok',
    reddit: '🤖 Reddit',
    blog: '📝 Blog',
    other: 'Other',
  };

  return sourceMap[source] || source || 'Unknown';
}

/**
 * Get referral source icon
 *
 * @param {string} source - Referral source code
 * @returns {string} Icon emoji
 */
export function getSourceIcon(source) {
  const iconMap = {
    direct: '🔗',
    email: '📧',
    facebook: '👍',
    twitter: '🐦',
    instagram: '📷',
    tiktok: '🎵',
    reddit: '🤖',
    blog: '📝',
    other: '📌',
  };

  return iconMap[source] || '📌';
}

/**
 * Get status badge color for referral
 *
 * @param {boolean} convertedToSale - Conversion status
 * @returns {string} Tailwind color class
 */
export function getConversionStatusColor(convertedToSale) {
  return convertedToSale ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800';
}

/**
 * Get status label for referral
 *
 * @param {boolean} convertedToSale - Conversion status
 * @returns {string} Status label
 */
export function getConversionStatusLabel(convertedToSale) {
  return convertedToSale ? '✅ Converted' : '⏳ Pending';
}

/**
 * Calculate conversion rate
 *
 * @param {number} conversions - Number of conversions
 * @param {number} clicks - Total clicks
 * @returns {number} Conversion rate (0-1)
 */
export function calculateConversionRate(conversions, clicks) {
  if (!clicks || clicks === 0) return 0;
  return conversions / clicks;
}

/**
 * Calculate average commission per conversion
 *
 * @param {number} totalCommissions - Total commission amount
 * @param {number} conversions - Number of conversions
 * @returns {number} Average commission
 */
export function calculateAvgCommission(totalCommissions, conversions) {
  if (!conversions || conversions === 0) return 0;
  return totalCommissions / conversions;
}

/**
 * Generate CSV from referral data
 *
 * @param {Array} referrals - Referral array
 * @param {Array} columns - Column definitions
 * @returns {string} CSV content
 */
export function generateCSV(referrals, columns) {
  // Header row
  const headers = columns.map((col) => col.label).join(',');

  // Data rows
  const rows = referrals.map((referral) => {
    return columns
      .map((col) => {
        let value = referral[col.field];

        if (col.format === 'currency') {
          value = formatCurrency(value);
        } else if (col.format === 'date') {
          value = formatDate(value);
        } else if (col.format === 'percentage') {
          value = formatPercentage(value);
        }

        // Escape quotes in CSV values
        if (typeof value === 'string' && value.includes(',')) {
          value = `"${value.replace(/"/g, '""')}"`;
        }

        return value || '';
      })
      .join(',');
  });

  return [headers, ...rows].join('\n');
}

/**
 * Download CSV file
 *
 * @param {string} csvContent - CSV content
 * @param {string} filename - File name
 */
export function downloadCSV(csvContent, filename = 'referrals.csv') {
  const element = document.createElement('a');
  element.setAttribute('href', `data:text/csv;charset=utf-8,${encodeURIComponent(csvContent)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Generate JSON from referral data
 *
 * @param {Array} referrals - Referral array
 * @param {number} decimals - Decimal places for numbers
 * @returns {string} JSON content
 */
export function generateJSON(referrals, decimals = 2) {
  const data = referrals.map((referral) => ({
    ...referral,
    commissionAmount:
      referral.commissionAmount ?
        parseFloat(referral.commissionAmount.toFixed(decimals))
      : null,
  }));

  return JSON.stringify(data, null, 2);
}

/**
 * Download JSON file
 *
 * @param {string} jsonContent - JSON content
 * @param {string} filename - File name
 */
export function downloadJSON(jsonContent, filename = 'referrals.json') {
  const element = document.createElement('a');
  element.setAttribute('href', `data:application/json;charset=utf-8,${encodeURIComponent(jsonContent)}`);
  element.setAttribute('download', filename);
  element.style.display = 'none';

  document.body.appendChild(element);
  element.click();
  document.body.removeChild(element);
}

/**
 * Generate PDF filename with timestamp
 *
 * @param {string} prefix - Filename prefix
 * @returns {string} Filename with timestamp
 */
export function generatePDFFilename(prefix = 'referrals') {
  const now = new Date();
  const timestamp = now.toISOString().split('T')[0];
  return `${prefix}-${timestamp}.pdf`;
}

/**
 * Aggregate referrals by source
 *
 * @param {Array} referrals - Referral array
 * @returns {Object} Aggregated data by source
 */
export function aggregateBySource(referrals) {
  const sources = {};

  referrals.forEach((referral) => {
    const source = referral.referralSource || 'unknown';

    if (!sources[source]) {
      sources[source] = {
        source,
        clicks: 0,
        conversions: 0,
        totalCommission: 0,
      };
    }

    sources[source].clicks += 1;
    if (referral.convertedToSale) {
      sources[source].conversions += 1;
      sources[source].totalCommission += referral.commissionAmount || 0;
    }
  });

  return Object.values(sources);
}

/**
 * Aggregate referrals by device
 *
 * @param {Array} referrals - Referral array
 * @returns {Object} Aggregated data by device
 */
export function aggregateByDevice(referrals) {
  const devices = {};

  referrals.forEach((referral) => {
    const device = referral.device || 'unknown';

    if (!devices[device]) {
      devices[device] = {
        device,
        clicks: 0,
        conversions: 0,
        totalCommission: 0,
      };
    }

    devices[device].clicks += 1;
    if (referral.convertedToSale) {
      devices[device].conversions += 1;
      devices[device].totalCommission += referral.commissionAmount || 0;
    }
  });

  return Object.values(devices);
}

/**
 * Create time series data from referrals
 *
 * @param {Array} referrals - Referral array
 * @param {string} granularity - Time granularity ('day', 'week', 'month')
 * @returns {Array} Time series data
 */
export function createTimeSeries(referrals, granularity = 'day') {
  const series = {};

  referrals.forEach((referral) => {
    const date = new Date(referral.createdAt);
    let key;

    if (granularity === 'day') {
      key = date.toISOString().split('T')[0];
    } else if (granularity === 'week') {
      const weekStart = new Date(date);
      weekStart.setDate(weekStart.getDate() - weekStart.getDay());
      key = weekStart.toISOString().split('T')[0];
    } else if (granularity === 'month') {
      key = date.toISOString().substring(0, 7);
    }

    if (!series[key]) {
      series[key] = {
        date: key,
        clicks: 0,
        conversions: 0,
        totalCommission: 0,
      };
    }

    series[key].clicks += 1;
    if (referral.convertedToSale) {
      series[key].conversions += 1;
      series[key].totalCommission += referral.commissionAmount || 0;
    }
  });

  return Object.values(series).sort((a, b) => new Date(a.date) - new Date(b.date));
}

/**
 * Parse URL search params for filters
 *
 * @param {string} queryString - Query string
 * @returns {Object} Parsed filters
 */
export function parseFilterFromURL(queryString) {
  const params = new URLSearchParams(queryString);

  return {
    dateFrom: params.get('dateFrom') || null,
    dateTo: params.get('dateTo') || null,
    convertedOnly: params.get('convertedOnly') === 'true',
    source: params.get('source') || null,
    device: params.get('device') || null,
  };
}

/**
 * Convert filter state to URL params
 *
 * @param {Object} filters - Filter object
 * @returns {string} Query string
 */
export function filterToURLParams(filters) {
  const params = new URLSearchParams();

  if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.append('dateTo', filters.dateTo);
  if (filters.convertedOnly) params.append('convertedOnly', 'true');
  if (filters.source) params.append('source', filters.source);
  if (filters.device) params.append('device', filters.device);

  return params.toString();
}

/**
 * Check if IP looks suspicious (simple heuristic)
 *
 * @param {string} ipAddress - IP address
 * @returns {boolean} Is suspicious
 */
export function isSuspiciousIP(ipAddress) {
  // Check for localhost or private IPs
  if (ipAddress === '0.0.0.0' || ipAddress === '::1') return true;
  if (ipAddress.startsWith('127.') || ipAddress.startsWith('192.168.')) return true;
  if (ipAddress.startsWith('10.') || ipAddress.startsWith('172.')) return true;

  return false;
}

/**
 * Format IP address for display
 *
 * @param {string} ipAddress - IP address
 * @param {boolean} mask - Mask last octet
 * @returns {string} Formatted IP
 */
export function formatIPAddress(ipAddress, mask = false) {
  if (!ipAddress || ipAddress === '0.0.0.0') return 'Unknown';

  if (!mask) return ipAddress;

  const parts = ipAddress.split('.');
  if (parts.length === 4) {
    parts[3] = '***';
    return parts.join('.');
  }

  return ipAddress;
}

/**
 * Calculate engagement score (simple metric)
 *
 * @param {Object} stats - Statistics object
 * @returns {number} Score 0-100
 */
export function calculateEngagementScore(stats) {
  let score = 0;

  // Conversion rate component (max 50 points)
  if (stats.conversionRate) {
    score += Math.min(stats.conversionRate * 500, 50);
  }

  // Activity level component (max 30 points)
  if (stats.totalClicks) {
    score += Math.min((stats.totalClicks / 100) * 30, 30);
  }

  // Consistency component (max 20 points)
  if (stats.uniqueVisitors) {
    const consistency = stats.totalClicks > 0 ? stats.uniqueVisitors / stats.totalClicks : 0;
    score += Math.min(consistency * 100, 20);
  }

  return Math.round(score);
}

/**
 * Get engagement score label
 *
 * @param {number} score - Engagement score (0-100)
 * @returns {string} Label with emoji
 */
export function getEngagementScoreLabel(score) {
  if (score >= 80) return '🔥 Excellent';
  if (score >= 60) return '👍 Good';
  if (score >= 40) return '📊 Average';
  if (score >= 20) return '📉 Low';
  return '❄️ Very Low';
}

/**
 * Get engagement score color
 *
 * @param {number} score - Engagement score (0-100)
 * @returns {string} Tailwind color class
 */
export function getEngagementScoreColor(score) {
  if (score >= 80) return 'text-red-600';
  if (score >= 60) return 'text-green-600';
  if (score >= 40) return 'text-yellow-600';
  if (score >= 20) return 'text-orange-600';
  return 'text-gray-600';
}
