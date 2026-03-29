/**
 * ============================================================================
 * ADMIN UTILITIES - Helper functions for admin dashboard
 * ============================================================================
 *
 * Formatting, validation, and export utilities for admin operations.
 *
 * ============================================================================
 */

/**
 * Format currency values
 */
export const formatCurrency = (amount, currency = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(amount || 0);
};

/**
 * Format numbers with thousand separators
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(value || 0);
};

/**
 * Format date/time
 */
export const formatDate = (dateString, options = {}) => {
  const defaults = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  };

  return new Date(dateString).toLocaleDateString('en-US', {
    ...defaults,
    ...options
  });
};

export const formatDateTime = (dateString) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Format percentages
 */
export const formatPercentage = (value, decimals = 1) => {
  return `${(value || 0).toFixed(decimals)}%`;
};

/**
 * Truncate long IDs for display
 */
export const truncateId = (id, length = 8) => {
  if (!id) return '-';
  return id.length > length ? `${id.slice(0, length)}...` : id;
};

/**
 * Get status color classes
 */
export const getStatusColor = (status) => {
  const statusColors = {
    completed: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    active: 'bg-blue-100 text-blue-800',
    inactive: 'bg-gray-100 text-gray-800',
    approved: 'bg-green-100 text-green-800',
    rejected: 'bg-red-100 text-red-800',
    processing: 'bg-purple-100 text-purple-800',
    failed: 'bg-red-100 text-red-800',
    paid: 'bg-green-100 text-green-800',
    cancelled: 'bg-gray-100 text-gray-800',
    suspended: 'bg-red-100 text-red-800'
  };

  return statusColors[status] || statusColors.inactive;
};

/**
 * Calculate growth percentage
 */
export const calculateGrowth = (current, previous) => {
  if (!previous || previous === 0) return 100;
  return ((current - previous) / previous) * 100;
};

/**
 * Format growth indicator with arrow
 */
export const getGrowthIndicator = (growth) => {
  if (growth > 0) {
    return { icon: '📈', color: '#10b981', text: `+${growth.toFixed(1)}%` };
  }
  if (growth < 0) {
    return { icon: '📉', color: '#ef4444', text: `${growth.toFixed(1)}%` };
  }
  return { icon: '➡️', color: '#9ca3af', text: '0%' };
};

/**
 * Export data to CSV
 */
export const exportToCSV = (data, filename = 'export.csv') => {
  if (!data || data.length === 0) {
    console.warn('No data to export');
    return;
  }

  // Get headers from first object
  const headers = Object.keys(data[0]);

  // Create CSV content
  const csvContent = [
    headers.join(','),
    ...data.map((row) =>
      headers
        .map((header) => {
          const value = row[header];
          // Handle quoted fields
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`;
          }
          return value;
        })
        .join(',')
    )
  ].join('\n');

  // Create blob and download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Export data to JSON
 */
export const exportToJSON = (data, filename = 'export.json') => {
  if (!data) {
    console.warn('No data to export');
    return;
  }

  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Batch export with filtering
 */
export const batchExportData = async (
  fetchFunction,
  options = { format: 'csv', filters: {} }
) => {
  try {
    const data = await fetchFunction(options.filters);
    const timestamp = new Date().toISOString().slice(0, 10);
    const filename = `admin-export-${timestamp}.${options.format}`;

    if (options.format === 'csv') {
      exportToCSV(data, filename);
    } else if (options.format === 'json') {
      exportToJSON(data, filename);
    }

    return { success: true, message: `Exported ${data.length} records` };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

/**
 * Validate date range
 */
export const isValidDateRange = (dateFrom, dateTo) => {
  if (!dateFrom || !dateTo) return true;

  const from = new Date(dateFrom);
  const to = new Date(dateTo);

  return from <= to;
};

/**
 * Get date range description
 */
export const getDateRangeDescription = (dateFrom, dateTo) => {
  if (!dateFrom && !dateTo) return 'All time';
  if (!dateFrom) return `Until ${formatDate(dateTo)}`;
  if (!dateTo) return `From ${formatDate(dateFrom)}`;

  return `${formatDate(dateFrom)} - ${formatDate(dateTo)}`;
};

/**
 * Calculate average value
 */
export const calculateAverage = (values) => {
  if (!values || values.length === 0) return 0;
  const sum = values.reduce((acc, val) => acc + val, 0);
  return sum / values.length;
};

/**
 * Find min/max in array
 */
export const getMinMax = (values, key = null) => {
  if (!values || values.length === 0) return { min: 0, max: 0 };

  const extractValue = (item) => (key ? item[key] : item);
  const nums = values.map(extractValue).filter((v) => typeof v === 'number');

  return {
    min: Math.min(...nums),
    max: Math.max(...nums)
  };
};

/**
 * Sort array of objects
 */
export const sortData = (data, sortBy, order = 'asc') => {
  return [...data].sort((a, b) => {
    const aVal = a[sortBy];
    const bVal = b[sortBy];

    if (typeof aVal === 'string') {
      return order === 'asc'
        ? aVal.localeCompare(bVal)
        : bVal.localeCompare(aVal);
    }

    return order === 'asc' ? aVal - bVal : bVal - aVal;
  });
};

/**
 * Filter data with multiple conditions
 */
export const filterData = (data, conditions) => {
  return data.filter((item) => {
    return Object.entries(conditions).every(([key, value]) => {
      if (!value) return true; // Skip empty filters
      if (typeof item[key] === 'string') {
        return item[key].toLowerCase().includes(value.toLowerCase());
      }
      return item[key] === value;
    });
  });
};

/**
 * Paginate data
 */
export const paginateData = (data, page = 1, limit = 20) => {
  const start = (page - 1) * limit;
  const end = start + limit;

  return {
    data: data.slice(start, end),
    pagination: {
      page,
      limit,
      total: data.length,
      pages: Math.ceil(data.length / limit)
    }
  };
};

/**
 * Get dashboard metric change indicator
 */
export const getMetricChange = (current, previous) => {
  if (!previous || previous === 0) {
    return {
      percentage: current > 0 ? 100 : 0,
      direction: current > 0 ? 'up' : 'down',
      text: 'New'
    };
  }

  const percentage = ((current - previous) / previous) * 100;
  const direction = percentage > 0 ? 'up' : percentage < 0 ? 'down' : 'flat';

  return {
    percentage: Math.abs(percentage),
    direction,
    text: `${direction === 'up' ? '+' : direction === 'down' ? '-' : ''}${Math.abs(
      percentage
    ).toFixed(1)}%`
  };
};

/**
 * Format performance metrics
 */
export const formatMetrics = (metrics) => {
  return {
    ...metrics,
    revenue: formatCurrency(metrics.revenue),
    orders: formatNumber(metrics.orders),
    conversion: formatPercentage(metrics.conversion),
    avgOrderValue: formatCurrency(metrics.avgOrderValue)
  };
};

/**
 * Validate admin filters
 */
export const validateFilters = (filters) => {
  const errors = [];

  if (filters.dateFrom && filters.dateTo) {
    if (!isValidDateRange(filters.dateFrom, filters.dateTo)) {
      errors.push('Date range is invalid: "From" date must be before "To" date');
    }
  }

  if (filters.limit) {
    if (filters.limit < 1 || filters.limit > 100) {
      errors.push('Limit must be between 1 and 100');
    }
  }

  if (filters.page) {
    if (filters.page < 1) {
      errors.push('Page must be greater than 0');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Get alert suggestions based on metrics
 */
export const getAlertSuggestions = (metrics) => {
  const suggestions = [];

  // Check for concerning metrics
  if (metrics.failedPayouts && metrics.failedPayouts > 10) {
    suggestions.push({
      level: 'warning',
      message: `⚠️ ${metrics.failedPayouts} failed payouts pending review`
    });
  }

  if (metrics.pendingCommissions && metrics.pendingCommissions > 100) {
    suggestions.push({
      level: 'warning',
      message: `⚠️ ${metrics.pendingCommissions} commissions awaiting review`
    });
  }

  if (metrics.failedOrders && metrics.failedOrders > 20) {
    suggestions.push({
      level: 'info',
      message: `ℹ️ ${metrics.failedOrders} orders failed - investigate patterns`
    });
  }

  return suggestions;
};
