/**
 * Commission Utilities
 * Helper functions for commission operations
 */

/**
 * Format commission amount as currency
 * @param {number} amount - Amount to format
 * @returns {string} Formatted currency string
 */
export const formatCommissionAmount = (amount) => {
  if (typeof amount !== 'number') return '$0.00';
  return `$${amount.toFixed(2)}`;
};

/**
 * Format commission rate as percentage
 * @param {number} rate - Rate as decimal (0-1)
 * @returns {string} Formatted percentage string
 */
export const formatCommissionRate = (rate) => {
  if (typeof rate !== 'number') return '0%';
  return `${(rate * 100).toFixed(2)}%`;
};

/**
 * Get status label from status value
 * @param {string} status - Commission status
 * @returns {string} Human-readable status label
 */
export const getStatusLabel = (status) => {
  const labels = {
    pending: 'Pending',
    approved: 'Approved',
    paid: 'Paid',
    reversed: 'Reversed',
  };
  return labels[status] || status;
};

/**
 * Get status color for UI display
 * @param {string} status - Commission status
 * @returns {string} Color code or CSS variable name
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: '#ffc107',    // warning
    approved: '#17a2b8',   // info
    paid: '#28a745',       // success
    reversed: '#dc3545',   // danger
  };
  return colors[status] || '#6c757d';
};

/**
 * Calculate total amount from commission list
 * @param {Array} commissions - Array of commission objects
 * @returns {number} Total commission amount
 */
export const calculateTotalCommissions = (commissions) => {
  if (!Array.isArray(commissions)) return 0;
  return commissions.reduce((total, c) => total + (c.calculation?.amount || 0), 0);
};

/**
 * Calculate average commission from list
 * @param {Array} commissions - Array of commission objects
 * @returns {number} Average commission amount
 */
export const calculateAverageCommission = (commissions) => {
  if (!Array.isArray(commissions) || commissions.length === 0) return 0;
  const total = calculateTotalCommissions(commissions);
  return total / commissions.length;
};

/**
 * Filter commissions by status
 * @param {Array} commissions - Array of commission objects
 * @param {string} status - Status to filter by
 * @returns {Array} Filtered commissions
 */
export const filterCommissionsByStatus = (commissions, status) => {
  if (!Array.isArray(commissions) || !status) return commissions;
  return commissions.filter((c) => c.status === status);
};

/**
 * Filter commissions by date range
 * @param {Array} commissions - Array of commission objects
 * @param {Date|string} fromDate - Start date
 * @param {Date|string} toDate - End date
 * @returns {Array} Filtered commissions
 */
export const filterCommissionsByDateRange = (commissions, fromDate, toDate) => {
  if (!Array.isArray(commissions)) return commissions;

  const from = new Date(fromDate);
  const to = new Date(toDate);

  return commissions.filter((c) => {
    const commissionDate = new Date(c.createdAt);
    return commissionDate >= from && commissionDate <= to;
  });
};

/**
 * Group commissions by status
 * @param {Array} commissions - Array of commission objects
 * @returns {Object} Commissions grouped by status
 */
export const groupCommissionsByStatus = (commissions) => {
  if (!Array.isArray(commissions)) return {};

  return commissions.reduce((groups, commission) => {
    const status = commission.status || 'unknown';
    if (!groups[status]) {
      groups[status] = [];
    }
    groups[status].push(commission);
    return groups;
  }, {});
};

/**
 * Get fraud risk label
 * @param {string} riskLevel - Risk level (low, medium, high)
 * @returns {string} Human-readable risk label
 */
export const getFraudRiskLabel = (riskLevel) => {
  const labels = {
    low: 'Low Risk',
    medium: 'Medium Risk',
    high: 'High Risk',
  };
  return labels[riskLevel] || 'Unknown';
};

/**
 * Get fraud risk color
 * @param {string} riskLevel - Risk level
 * @returns {string} Color code
 */
export const getFraudRiskColor = (riskLevel) => {
  const colors = {
    low: '#28a745',
    medium: '#fd7e14',
    high: '#dc3545',
  };
  return colors[riskLevel] || '#6c757d';
};

/**
 * Check if commission can be approved
 * @param {Object} commission - Commission object
 * @returns {boolean} Whether commission can be approved
 */
export const canApproveCommission = (commission) => {
  return commission?.status === 'pending' && !commission?.approval?.approvedAt;
};

/**
 * Check if commission can be paid
 * @param {Object} commission - Commission object
 * @returns {boolean} Whether commission can be paid
 */
export const canPayCommission = (commission) => {
  return commission?.status === 'approved' && !commission?.payment?.paidAt;
};

/**
 * Check if commission can be reversed
 * @param {Object} commission - Commission object
 * @returns {boolean} Whether commission can be reversed
 */
export const canReverseCommission = (commission) => {
  return ['pending', 'approved'].includes(commission?.status) && !commission?.reversal?.reversedAt;
};

/**
 * Format date for display
 * @param {Date|string} date - Date to format
 * @param {boolean} includeTime - Whether to include time
 * @returns {string} Formatted date string
 */
export const formatCommissionDate = (date, includeTime = false) => {
  if (!date) return 'N/A';
  const d = new Date(date);
  if (includeTime) {
    return d.toLocaleString();
  }
  return d.toLocaleDateString();
};

/**
 * Calculate commission statistics
 * @param {Array} commissions - Array of commission objects
 * @returns {Object} Statistics object
 */
export const calculateCommissionStats = (commissions) => {
  if (!Array.isArray(commissions) || commissions.length === 0) {
    return {
      total: 0,
      count: 0,
      average: 0,
      max: 0,
      min: 0,
      byStatus: {},
    };
  }

  const amounts = commissions.map((c) => c.calculation?.amount || 0);
  const totalByStatus = groupCommissionsByStatus(commissions);

  return {
    total: amounts.reduce((a, b) => a + b, 0),
    count: commissions.length,
    average: amounts.reduce((a, b) => a + b, 0) / commissions.length,
    max: Math.max(...amounts),
    min: Math.min(...amounts),
    byStatus: Object.keys(totalByStatus).reduce((acc, status) => {
      acc[status] = {
        count: totalByStatus[status].length,
        total: calculateTotalCommissions(totalByStatus[status]),
      };
      return acc;
    }, {}),
  };
};

/**
 * Export commissions to CSV
 * @param {Array} commissions - Array of commission objects
 * @param {string} filename - Output filename
 */
export const exportCommissionsToCSV = (commissions, filename = 'commissions.csv') => {
  if (!Array.isArray(commissions) || commissions.length === 0) {
    console.warn('No commissions to export');
    return;
  }

  const headers = [
    'Order Number',
    'Amount',
    'Rate',
    'Status',
    'Created Date',
    'Affiliate ID',
    'Customer ID',
  ];

  const rows = commissions.map((c) => [
    c.orderNumber,
    c.calculation?.amount || 0,
    (c.calculation?.rate || 0) * 100,
    c.status,
    formatCommissionDate(c.createdAt),
    c.affiliateId,
    c.buyerId,
  ]);

  const csv = [
    headers.join(','),
    ...rows.map((row) =>
      row.map((cell) => (typeof cell === 'string' ? `"${cell}"` : cell)).join(',')
    ),
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
};

/**
 * Validate commission data
 * @param {Object} commission - Commission object to validate
 * @returns {Array} Array of validation errors (empty if valid)
 */
export const validateCommission = (commission) => {
  const errors = [];

  if (!commission.orderNumber) {
    errors.push('Order number is required');
  }

  if (typeof commission.calculation?.amount !== 'number' || commission.calculation.amount < 0) {
    errors.push('Invalid commission amount');
  }

  if (typeof commission.calculation?.rate !== 'number' || commission.calculation.rate < 0 || commission.calculation.rate > 1) {
    errors.push('Invalid commission rate');
  }

  if (!['pending', 'approved', 'paid', 'reversed'].includes(commission.status)) {
    errors.push('Invalid commission status');
  }

  return errors;
};

export default {
  formatCommissionAmount,
  formatCommissionRate,
  getStatusLabel,
  getStatusColor,
  calculateTotalCommissions,
  calculateAverageCommission,
  filterCommissionsByStatus,
  filterCommissionsByDateRange,
  groupCommissionsByStatus,
  getFraudRiskLabel,
  getFraudRiskColor,
  canApproveCommission,
  canPayCommission,
  canReverseCommission,
  formatCommissionDate,
  calculateCommissionStats,
  exportCommissionsToCSV,
  validateCommission,
};
