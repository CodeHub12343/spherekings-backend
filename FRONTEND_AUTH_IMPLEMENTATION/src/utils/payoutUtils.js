/**
 * Payout Utilities
 * Helper functions for payout operations
 */

/**
 * Format currency value
 */
export const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount || 0);
};

/**
 * Format date to locale string
 */
export const formatDate = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleString();
};

/**
 * Format date to short format (MM/DD/YYYY)
 */
export const formatDateShort = (date) => {
  if (!date) return '-';
  return new Date(date).toLocaleDateString();
};

/**
 * Get status color
 */
export const getStatusColor = (status) => {
  const colors = {
    pending: '#f39c12',
    approved: '#3498db',
    processing: '#2563eb',
    completed: '#27ae60',
    failed: '#dc3545',
    cancelled: '#6c757d'
  };
  return colors[status] || '#999';
};

/**
 * Get status display text
 */
export const getStatusDisplay = (status) => {
  const displays = {
    pending: 'Awaiting Approval',
    approved: 'Approved',
    processing: 'Processing',
    completed: 'Paid',
    failed: 'Failed',
    cancelled: 'Cancelled'
  };
  return displays[status] || status;
};

/**
 * Get payment method display text
 */
export const getPaymentMethodDisplay = (method) => {
  const displays = {
    bank_transfer: 'Bank Transfer',
    paypal: 'PayPal',
    stripe: 'Stripe',
    cryptocurrency: 'Cryptocurrency',
    manual: 'Manual'
  };
  return displays[method] || method;
};

/**
 * Format payout for export/display
 */
export const formatPayoutForDisplay = (payout) => {
  return {
    id: payout._id?.slice(-8).toUpperCase() || 'N/A',
    amount: formatCurrency(payout.amount),
    method: getPaymentMethodDisplay(payout.method),
    status: getStatusDisplay(payout.status),
    requested: formatDateShort(payout.request?.submittedAt || payout.createdAt),
    approved: formatDateShort(payout.approval?.approvedAt),
    paid: formatDateShort(payout.payment?.paidAt)
  };
};

/**
 * Calculate total amount from payouts array
 */
export const calculateTotalAmount = (payouts) => {
  return payouts.reduce((sum, payout) => sum + (payout.amount || 0), 0);
};

/**
 * Filter payouts by status
 */
export const filterPayoutsByStatus = (payouts, status) => {
  if (!status) return payouts;
  return payouts.filter((payout) => payout.status === status);
};

/**
 * Filter payouts by date range
 */
export const filterPayoutsByDateRange = (payouts, dateFrom, dateTo) => {
  return payouts.filter((payout) => {
    const payoutDate = new Date(payout.createdAt);
    if (dateFrom && payoutDate < new Date(dateFrom)) return false;
    if (dateTo && payoutDate > new Date(dateTo)) return false;
    return true;
  });
};

/**
 * Sort payouts by field
 */
export const sortPayouts = (payouts, field, order = 'asc') => {
  const sorted = [...payouts];
  sorted.sort((a, b) => {
    let aValue = a[field];
    let bValue = b[field];

    if (field === 'createdAt' || field === 'submittedAt') {
      aValue = new Date(aValue);
      bValue = new Date(bValue);
    }

    if (order === 'asc') {
      return aValue > bValue ? 1 : -1;
    } else {
      return aValue < bValue ? 1 : -1;
    }
  });
  return sorted;
};

/**
 * Export payouts to CSV
 */
export const exportPayoutsToCSV = (payouts) => {
  const headers = [
    'ID',
    'Amount',
    'Method',
    'Status',
    'Requested',
    'Approved',
    'Paid'
  ];

  const rows = payouts.map((payout) => {
    const formatted = formatPayoutForDisplay(payout);
    return [
      formatted.id,
      formatted.amount,
      formatted.method,
      formatted.status,
      formatted.requested,
      formatted.approved || '-',
      formatted.paid || '-'
    ];
  });

  const csv = [
    headers.join(','),
    ...rows.map((row) => row.map((cell) => `"${cell}"`).join(','))
  ].join('\n');

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `payouts-${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
};

/**
 * Validate payout request form
 */
export const validatePayoutRequest = (formData) => {
  const errors = {};

  if (!formData.amount || parseFloat(formData.amount) <= 0) {
    errors.amount = 'Amount must be greater than 0';
  }

  if (!formData.method) {
    errors.method = 'Payment method is required';
  }

  if (!formData.beneficiary?.accountHolderName) {
    errors.accountHolderName = 'Account holder name is required';
  }

  if (!formData.beneficiary?.accountNumber) {
    errors.accountNumber = 'Account number is required';
  }

  if (formData.method === 'bank_transfer' && !formData.beneficiary?.routingNumber) {
    errors.routingNumber = 'Routing number is required for bank transfers';
  }

  if (!formData.beneficiary?.bankName) {
    errors.bankName = 'Bank name is required';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Get status progression
 */
export const getStatusProgression = (status) => {
  const progression = ['pending', 'approved', 'processing', 'completed'];
  const index = progression.indexOf(status);
  return index >= 0 ? (index + 1) / progression.length : 0;
};

/**
 * Check if payout can be approved
 */
export const canApprovePayout = (payout) => {
  return payout?.status === 'pending';
};

/**
 * Check if payout can be processed
 */
export const canProcessPayout = (payout) => {
  return payout?.status === 'approved' && !payout?.payment?.transactionId;
};

/**
 * Check if payout can be rejected
 */
export const canRejectPayout = (payout) => {
  return ['pending', 'approved'].includes(payout?.status);
};

/**
 * Get payout statistics summary
 */
export const getPayoutStatsSummary = (stats) => {
  const summary = {
    totalPayouts: stats?.totalPayouts || 0,
    pendingAmount: stats?.totalPending || 0,
    paidAmount: stats?.totalPaidOut || 0,
    failedAmount: stats?.totalFailed || 0,
    pendingCount: stats?.pendingCount || 0,
    completedCount: stats?.completedCount || 0,
    averagePayout: stats?.averagePayout || 0
  };
  return summary;
};

/**
 * Build filter query string
 */
export const buildFilterQueryString = (filters) => {
  const params = new URLSearchParams();
  Object.keys(filters).forEach((key) => {
    if (filters[key]) {
      params.append(key, filters[key]);
    }
  });
  return params.toString();
};

export default {
  formatCurrency,
  formatDate,
  formatDateShort,
  getStatusColor,
  getStatusDisplay,
  getPaymentMethodDisplay,
  formatPayoutForDisplay,
  calculateTotalAmount,
  filterPayoutsByStatus,
  filterPayoutsByDateRange,
  sortPayouts,
  exportPayoutsToCSV,
  validatePayoutRequest,
  getStatusProgression,
  canApprovePayout,
  canProcessPayout,
  canRejectPayout,
  getPayoutStatsSummary,
  buildFilterQueryString
};
