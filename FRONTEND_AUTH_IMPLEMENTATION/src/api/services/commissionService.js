/**
 * Commission Service Layer
 * Handles all commission-related API calls
 * 
 * Endpoints:
 * - Affiliate Commission Management (list, stats, details)
 * - Admin Commission Management (approve, pay, reverse, batch operations)
 * - System Statistics and Reporting
 */

import axios from '@/api/client';

const COMMISSION_ENDPOINTS = {
  // Affiliate endpoints
  AFFILIATE_COMMISSIONS: '/affiliate/commissions',
  AFFILIATE_STATS: '/affiliate/commissions/stats',
  COMMISSION_DETAIL: '/affiliate/:commissionId',
  
  // Admin endpoints
  ADMIN_COMMISSIONS: '/admin/commissions',
  ADMIN_STATS: '/admin/commissions/stats',
  ADMIN_APPROVE: '/admin/commissions/:commissionId/approve',
  ADMIN_PAY: '/admin/commissions/:commissionId/pay',
  ADMIN_REVERSE: '/admin/commissions/:commissionId/reverse',
  ADMIN_PAYOUTS_READY: '/admin/commissions/payouts/ready',
  ADMIN_BATCH_APPROVE: '/admin/commissions/batch-approve',
  ADMIN_BATCH_PAY: '/admin/commissions/batch-pay',
};

/**
 * ==================== AFFILIATE COMMISSION ENDPOINTS ====================
 */

/**
 * Get commissions for authenticated affiliate
 * 
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 20, max: 100)
 * @param {string} options.status - Filter by status (pending, approved, paid, reversed)
 * @param {string} options.dateFrom - Start date (ISO format)
 * @param {string} options.dateTo - End date (ISO format)
 * @returns {Promise} Commission list with pagination
 */
export async function getAffiliateCommissions(options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      dateFrom,
      dateTo,
    } = options;

    const response = await axios.get(COMMISSION_ENDPOINTS.AFFILIATE_COMMISSIONS, {
      params: {
        page,
        limit: Math.min(limit, 100),
        ...(status && { status }),
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching affiliate commissions:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch commissions',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get commission statistics for affiliate
 * 
 * @param {Object} options - Query parameters
 * @param {string} options.dateFrom - Start date (ISO format)
 * @param {string} options.dateTo - End date (ISO format)
 * @returns {Promise} Commission statistics
 */
export async function getAffiliateCommissionStats(options = {}) {
  try {
    const { dateFrom, dateTo } = options;

    const response = await axios.get(COMMISSION_ENDPOINTS.AFFILIATE_STATS, {
      params: {
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching commission stats:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch statistics',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get details of a specific commission
 * 
 * @param {string} commissionId - Commission ID
 * @returns {Promise} Commission details
 */
export async function getCommissionDetail(commissionId) {
  try {
    if (!commissionId) {
      throw new Error('Commission ID is required');
    }

    const response = await axios.get(
      COMMISSION_ENDPOINTS.COMMISSION_DETAIL.replace(':commissionId', commissionId)
    );

    return response.data.data;
  } catch (error) {
    console.error('Error fetching commission detail:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch commission details',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * ==================== ADMIN COMMISSION ENDPOINTS ====================
 */

/**
 * Get all commissions (admin only)
 * 
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by status
 * @param {boolean} options.fraudOnly - Show only flagged commissions
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @returns {Promise} All commissions with pagination
 */
export async function getAllCommissions(options = {}) {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      fraudOnly = false,
      dateFrom,
      dateTo,
    } = options;

    const response = await axios.get(COMMISSION_ENDPOINTS.ADMIN_COMMISSIONS, {
      params: {
        page,
        limit: Math.min(limit, 100),
        ...(status && { status }),
        fraudOnly,
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching all commissions:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch commissions',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get system-wide commission statistics (admin only)
 * 
 * @param {Object} options - Query parameters
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @returns {Promise} System statistics
 */
export async function getSystemStatistics(options = {}) {
  try {
    const { dateFrom, dateTo } = options;

    const response = await axios.get(COMMISSION_ENDPOINTS.ADMIN_STATS, {
      params: {
        ...(dateFrom && { dateFrom }),
        ...(dateTo && { dateTo }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching system statistics:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch statistics',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Approve a pending commission (admin only)
 * 
 * @param {string} commissionId - Commission ID
 * @param {Object} data - Approval data
 * @param {string} data.notes - Approval notes (optional)
 * @returns {Promise} Updated commission
 */
export async function approveCommission(commissionId, data = {}) {
  try {
    if (!commissionId) {
      throw new Error('Commission ID is required');
    }

    const response = await axios.post(
      COMMISSION_ENDPOINTS.ADMIN_APPROVE.replace(':commissionId', commissionId),
      {
        notes: data.notes || '',
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error approving commission:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to approve commission',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Mark commission as paid (admin only)
 * 
 * @param {string} commissionId - Commission ID
 * @param {Object} data - Payment data
 * @param {string} data.method - Payment method (stripe, paypal, bank_transfer, etc.)
 * @param {string} data.transactionId - Payment transaction reference
 * @param {string} data.receiptId - Receipt number (optional)
 * @returns {Promise} Updated commission
 */
export async function markCommissionAsPaid(commissionId, data) {
  try {
    if (!commissionId) {
      throw new Error('Commission ID is required');
    }

    if (!data.method || !data.transactionId) {
      throw new Error('Payment method and transaction ID are required');
    }

    const response = await axios.post(
      COMMISSION_ENDPOINTS.ADMIN_PAY.replace(':commissionId', commissionId),
      {
        method: data.method,
        transactionId: data.transactionId,
        ...(data.receiptId && { receiptId: data.receiptId }),
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error marking commission as paid:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to mark commission as paid',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Reverse a commission (admin only)
 * 
 * @param {string} commissionId - Commission ID
 * @param {Object} data - Reversal data
 * @param {string} data.reason - Reversal reason (refund, chargeback, fraud, etc.)
 * @param {string} data.details - Additional details
 * @param {number} data.amount - Reversal amount (optional, default: full)
 * @returns {Promise} Updated commission
 */
export async function reverseCommission(commissionId, data) {
  try {
    if (!commissionId) {
      throw new Error('Commission ID is required');
    }

    if (!data.reason) {
      throw new Error('Reversal reason is required');
    }

    const response = await axios.post(
      COMMISSION_ENDPOINTS.ADMIN_REVERSE.replace(':commissionId', commissionId),
      {
        reason: data.reason,
        ...(data.details && { details: data.details }),
        ...(data.amount && { amount: parseFloat(data.amount) }),
      }
    );

    return response.data.data;
  } catch (error) {
    console.error('Error reversing commission:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to reverse commission',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get ready payouts (admin only)
 * Commissions approved and ready to be marked as paid
 * 
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise} Ready commissions with pagination
 */
export async function getReadyPayouts(options = {}) {
  try {
    const { page = 1, limit = 20 } = options;

    const response = await axios.get(COMMISSION_ENDPOINTS.ADMIN_PAYOUTS_READY, {
      params: {
        page,
        limit: Math.min(limit, 100),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching ready payouts:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch ready payouts',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Batch approve commissions (admin only)
 * 
 * @param {Object} data - Batch operation data
 * @param {Array<string>} data.commissionIds - Array of commission IDs
 * @param {string} data.notes - Approval notes (optional)
 * @returns {Promise} Result of batch operation
 */
export async function batchApproveCommissions(data) {
  try {
    if (!data.commissionIds || !Array.isArray(data.commissionIds) || data.commissionIds.length === 0) {
      throw new Error('At least one commission ID is required');
    }

    if (data.commissionIds.length > 500) {
      throw new Error('Cannot approve more than 500 commissions at once');
    }

    const response = await axios.post(COMMISSION_ENDPOINTS.ADMIN_BATCH_APPROVE, {
      commissionIds: data.commissionIds,
      notes: data.notes || '',
    });

    return response.data.data;
  } catch (error) {
    console.error('Error batch approving commissions:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to batch approve commissions',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Batch pay commissions (admin only)
 * 
 * @param {Object} data - Batch operation data
 * @param {Array<Object>} data.commissions - Array of commission payment objects
 *   Each object: { id, method, transactionId, receiptId (optional) }
 * @returns {Promise} Result of batch operation
 */
export async function batchPayCommissions(data) {
  try {
    if (!data.commissions || !Array.isArray(data.commissions) || data.commissions.length === 0) {
      throw new Error('At least one commission is required');
    }

    if (data.commissions.length > 500) {
      throw new Error('Cannot pay more than 500 commissions at once');
    }

    // Validate each commission has required fields
    data.commissions.forEach((commission, index) => {
      if (!commission.id || !commission.method || !commission.transactionId) {
        throw new Error(`Commission at index ${index} is missing required fields (id, method, transactionId)`);
      }
    });

    const response = await axios.post(COMMISSION_ENDPOINTS.ADMIN_BATCH_PAY, {
      commissions: data.commissions,
    });

    return response.data.data;
  } catch (error) {
    console.error('Error batch paying commissions:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to batch pay commissions',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

export default {
  // Affiliate
  getAffiliateCommissions,
  getAffiliateCommissionStats,
  getCommissionDetail,
  
  // Admin
  getAllCommissions,
  getSystemStatistics,
  approveCommission,
  markCommissionAsPaid,
  reverseCommission,
  getReadyPayouts,
  batchApproveCommissions,
  batchPayCommissions,
};
