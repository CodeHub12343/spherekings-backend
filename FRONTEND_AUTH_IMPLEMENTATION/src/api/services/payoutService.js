/**
 * Payout API Service
 * Handles all API communication for payout operations
 * 
 * Endpoints:
 * - Affiliate: request, list, stats, detail
 * - Admin: list, approve, process, reject, pending, ready, batch operations
 */

import axios from 'axios';
import { tokenManager } from '@/utils/tokenManager';

// Use consistent API URL across all services
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

/**
 * Create axios instance with base config
 */
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

/**
 * Add Authorization header to all requests
 */
apiClient.interceptors.request.use((config) => {
  const token = tokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

/**
 * ==================== AFFILIATE ENDPOINTS ====================
 */

/**
 * Request a new payout
 * 
 * @param {object} payoutData - Payout request data
 * @param {number} payoutData.amount - Payout amount in dollars
 * @param {string} payoutData.method - Payment method
 * @param {object} payoutData.beneficiary - Payment details
 * @param {string} payoutData.notes - Optional notes
 * @returns {Promise<object>} Created payout
 */
export const requestPayout = async (payoutData) => {
  try {
    const requestBody = {
      amount: payoutData.amount,
      method: payoutData.method,
      beneficiary: payoutData.beneficiary,
      notes: payoutData.notes || ''
    };

    console.log('📨 [PAYOUT-SERVICE] POST /payouts/request with:', requestBody);
    
    const response = await apiClient.post('/payouts/request', requestBody);

    console.log('✅ [PAYOUT-SERVICE] Success response:', response.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to request payout');
    }

    return response.data.data;
  } catch (error) {
    console.error('❌ [PAYOUT-SERVICE] Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message || 'Request payout failed');
  }
};

/**
 * Get affiliate payout history
 * 
 * @param {object} filters - Filter and pagination options
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @param {string} filters.status - Filter by status
 * @param {string} filters.dateFrom - Start date
 * @param {string} filters.dateTo - End date
 * @returns {Promise<object>} Payouts and pagination data
 */
export const getAffiliatePayouts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const response = await apiClient.get(`/payouts?${params.toString()}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch payouts');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Fetch payouts failed');
  }
};

/**
 * Get affiliate payout statistics
 * 
 * @returns {Promise<object>} Payout statistics
 */
export const getAffiliatePayoutStats = async () => {
  try {
    const response = await apiClient.get('/payouts/stats');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch payout stats');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Fetch stats failed');
  }
};

/**
 * Get single payout details
 * 
 * @param {string} payoutId - Payout ID
 * @returns {Promise<object>} Payout details
 */
export const getPayoutDetail = async (payoutId) => {
  try {
    console.log('🔍 [PAYOUT-SERVICE] Fetching payout detail:', { payoutId });
    
    const response = await apiClient.get(`/payouts/${payoutId}`);

    console.log('✅ [PAYOUT-SERVICE] Payout detail response:', {
      statusCode: response.status,
      hasSuccess: !!response.data?.success,
      hasData: !!response.data?.data,
      dataType: typeof response.data?.data
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch payout');
    }

    if (!response.data.data) {
      throw new Error('Payout data is missing from response');
    }

    return response.data.data;
  } catch (error) {
    console.error('❌ [PAYOUT-SERVICE] Failed to fetch payout detail:', {
      payoutId,
      error: error.message,
      responseData: error.response?.data
    });
    throw new Error(error.response?.data?.message || error.message || 'Fetch payout detail failed');
  }
};

/**
 * ==================== ADMIN ENDPOINTS ====================
 */

/**
 * Get all payouts (admin view)
 * 
 * @param {object} filters - Filter and pagination options
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @param {string} filters.status - Filter by status
 * @param {string} filters.affId - Filter by affiliate ID
 * @param {string} filters.method - Filter by payment method
 * @param {string} filters.dateFrom - Start date
 * @param {string} filters.dateTo - End date
 * @returns {Promise<object>} Payouts and pagination data
 */
export const getAllPayouts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);
    if (filters.status) params.append('status', filters.status);
    if (filters.affId) params.append('affiliateId', filters.affId);
    if (filters.method) params.append('method', filters.method);
    if (filters.dateFrom) params.append('dateFrom', filters.dateFrom);
    if (filters.dateTo) params.append('dateTo', filters.dateTo);

    const url = `/admin/payouts?${params.toString()}`;
    console.log('📨 [PAYOUT-SERVICE] Fetching payouts from:', url);
    
    const response = await apiClient.get(url);

    console.log('✅ [PAYOUT-SERVICE] API Response structure:', {
      hasSuccess: response.data.success,
      dataType: Array.isArray(response.data.data) ? 'array' : typeof response.data.data,
      dataKeys: response.data.data && typeof response.data.data === 'object' ? Object.keys(response.data.data) : 'N/A',
      paginationType: typeof response.data.pagination,
      totalItems: response.data.pagination?.total || response.data.pagination?.totalItems || 'N/A'
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch payouts');
    }

    // Handle both response formats:
    // Format 1 (current): { success, data: [...], pagination: {...} }
    // Format 2 (expected): { success, data: { payouts: [...], pagination: {...} } }
    
    const responseData = response.data.data;
    
    if (Array.isArray(responseData)) {
      // Format 1: data is directly an array, pagination is sibling
      console.log('📦 [PAYOUT-SERVICE] Using Format 1: data is array with sibling pagination');
      return {
        payouts: responseData,
        pagination: response.data.pagination || {}
      };
    } else if (responseData && responseData.payouts) {
      // Format 2: data contains { payouts, pagination }
      console.log('📦 [PAYOUT-SERVICE] Using Format 2: data.payouts structure');
      return responseData;
    } else {
      // Fallback
      console.warn('⚠️ [PAYOUT-SERVICE] Unexpected response structure:', responseData);
      return {
        payouts: [],
        pagination: {}
      };
    }
  } catch (error) {
    console.error('❌ [PAYOUT-SERVICE] Fetch admin payouts error:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Fetch admin payouts failed');
  }
};

/**
 * Approve pending payout
 * 
 * @param {string} payoutId - Payout ID
 * @param {string} notes - Approval notes
 * @returns {Promise<object>} Updated payout
 */
export const approvePayout = async (payoutId, notes = '') => {
  try {
    const response = await apiClient.post(`/admin/payouts/${payoutId}/approve`, {
      notes
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to approve payout');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Approve payout failed');
  }
};

/**
 * Mark payout as paid (manual payment)
 * 
 * @param {string} payoutId - Payout ID
 * @param {string} receiptId - Receipt/proof of payment
 * @param {string} transactionId - Optional transaction ID
 * @returns {Promise<object>} Updated payout
 */
export const processPayout = async (payoutId, receiptId = '', transactionId = '') => {
  try {
    const response = await apiClient.post(`/admin/payouts/${payoutId}/process`, {
      receiptId,
      transactionId
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to mark payout as paid');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Mark payout as paid failed');
  }
};

/**
 * Reject or cancel payout
 * 
 * @param {string} payoutId - Payout ID
 * @param {string} reason - Rejection reason
 * @param {string} details - Additional details
 * @returns {Promise<object>} Updated payout
 */
export const rejectPayout = async (payoutId, reason, details = '') => {
  try {
    const response = await apiClient.post(`/admin/payouts/${payoutId}/reject`, {
      reason,
      details
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to reject payout');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Reject payout failed');
  }
};

/**
 * Get pending payouts (approval queue)
 * 
 * @param {object} options - Options
 * @param {number} options.limit - Max results (default 100, max 500)
 * @returns {Promise<array>} Pending payouts
 */
export const getPendingPayouts = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.limit) params.append('limit', Math.min(options.limit, 500));

    const response = await apiClient.get(`/admin/payouts/pending?${params.toString()}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch pending payouts');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Fetch pending payouts failed');
  }
};

/**
 * Get ready-to-process payouts (approved, not yet processed)
 * 
 * @param {object} filters - Filter and pagination options
 * @param {number} filters.page - Page number
 * @param {number} filters.limit - Items per page
 * @returns {Promise<object>} Ready payouts and pagination
 */
export const getReadyPayouts = async (filters = {}) => {
  try {
    const params = new URLSearchParams();
    if (filters.page) params.append('page', filters.page);
    if (filters.limit) params.append('limit', filters.limit);

    const response = await apiClient.get(`/admin/payouts/ready?${params.toString()}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch ready payouts');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Fetch ready payouts failed');
  }
};

/**
 * Get system-wide payout statistics (admin)
 * 
 * @param {object} options - Options
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @returns {Promise<object>} System statistics
 */
export const getSystemPayoutStats = async (options = {}) => {
  try {
    const params = new URLSearchParams();
    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    const url = `/admin/payouts/stats${queryString}`;
    console.log('📊 [PAYOUT-SERVICE] Fetching system stats from:', url);
    
    const response = await apiClient.get(url);

    console.log('✅ [PAYOUT-SERVICE] Stats response:', response.data.data);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch system stats');
    }

    const rawData = response.data.data;
    
    // Transform API response to match component structure
    // API returns: { byStatus: [...], totalMetrics: [...], recentPayouts: [...] }
    // Component expects: { totalPayouts, pendingCount, approvedCount, ... }
    
    const statusMap = {};
    if (Array.isArray(rawData.byStatus)) {
      rawData.byStatus.forEach(status => {
        statusMap[status._id] = status.count;
      });
    }

    const totalMetrics = Array.isArray(rawData.totalMetrics) && rawData.totalMetrics.length > 0 
      ? rawData.totalMetrics[0] 
      : {};

    const transformedData = {
      totalPayouts: totalMetrics.totalPayouts || 0,
      pendingCount: statusMap.pending || 0,
      approvedCount: statusMap.approved || 0,
      completedCount: statusMap.completed || 0,
      totalPaidOut: totalMetrics.totalPaidOut || 0,
      totalPending: totalMetrics.totalPending || 0
    };

    console.log('📦 [PAYOUT-SERVICE] Transformed stats:', transformedData);

    return transformedData;
  } catch (error) {
    console.error('❌ [PAYOUT-SERVICE] Fetch system stats error:', error.message);
    throw new Error(error.response?.data?.message || error.message || 'Fetch system stats failed');
  }
};

/**
 * Batch approve multiple payouts
 * 
 * @param {array} payoutIds - Array of payout IDs (max 500)
 * @param {string} notes - Approval notes
 * @returns {Promise<object>} Batch operation result
 */
export const batchApprovePayout = async (payoutIds, notes = '') => {
  try {
    if (!Array.isArray(payoutIds) || payoutIds.length === 0) {
      throw new Error('Payout IDs must be a non-empty array');
    }

    if (payoutIds.length > 500) {
      throw new Error('Maximum 500 payouts can be approved at once');
    }

    const response = await apiClient.post('/admin/batch-approve', {
      payoutIds,
      notes
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to batch approve payouts');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Batch approve failed');
  }
};

/**
 * Batch process multiple payouts
 * 
 * @param {array} payoutIds - Array of payout IDs (max 500)
 * @param {string} stripeConnectId - Optional Stripe Connect ID
 * @returns {Promise<object>} Batch operation result
 */
export const batchProcessPayout = async (payoutIds, stripeConnectId = '') => {
  try {
    if (!Array.isArray(payoutIds) || payoutIds.length === 0) {
      throw new Error('Payout IDs must be a non-empty array');
    }

    if (payoutIds.length > 500) {
      throw new Error('Maximum 500 payouts can be processed at once');
    }

    const response = await apiClient.post('/admin/batch-process', {
      payoutIds,
      stripeConnectId
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to batch process payouts');
    }

    return response.data.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || error.message || 'Batch process failed');
  }
};

export default {
  // Affiliate endpoints
  requestPayout,
  getAffiliatePayouts,
  getAffiliatePayoutStats,
  getPayoutDetail,

  // Admin endpoints
  getAllPayouts,
  approvePayout,
  processPayout,
  rejectPayout,
  getPendingPayouts,
  getReadyPayouts,
  getSystemPayoutStats,
  batchApprovePayout,
  batchProcessPayout
};
