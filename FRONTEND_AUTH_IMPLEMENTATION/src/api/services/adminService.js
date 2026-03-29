/**
 * ============================================================================
 * ADMIN SERVICE - API integration for admin dashboard
 * ============================================================================
 *
 * Centralized service for all admin dashboard API calls.
 * Handles authentication, error handling, and response formatting.
 *
 * All endpoints require JWT Bearer token authentication.
 * Base URL: /api/admin
 *
 * ============================================================================
 */

import axios from 'axios';
import TokenManager from '../../utils/tokenManager';

// Create axios instance with base URL
const adminClient = axios.create({
  baseURL: 'http://localhost:5000/api/v1/admin',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor to add auth token
adminClient.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    } else {
      console.warn('⚠️ No auth token found. Admin requests may fail.');
    }
    console.log(`📡 Admin API request: ${config.method.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
adminClient.interceptors.response.use(
  (response) => {
    console.log(`✅ Admin API response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error) => {
    console.error(`❌ Admin API error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    if (error.response?.status === 401) {
      // Token expired or invalid - redirect to login
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

/**
 * ============================================================================
 * DASHBOARD ENDPOINTS
 * ============================================================================
 */

/**
 * Get dashboard overview with key metrics
 * GET /dashboard
 */
export const getDashboardOverview = async () => {
  try {
    const response = await adminClient.get('/dashboard');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch dashboard overview');
  }
};

/**
 * ============================================================================
 * ORDER ENDPOINTS
 * ============================================================================
 */

/**
 * Get orders with filtering, pagination, and sorting
 * GET /orders
 */
export const getOrders = async (params = {}) => {
  try {
    const response = await adminClient.get('/orders', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch orders');
  }
};

/**
 * Get order analytics and metrics
 * GET /orders/analytics
 */
export const getOrderAnalytics = async () => {
  try {
    const response = await adminClient.get('/orders/analytics');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch order analytics');
  }
};

/**
 * ============================================================================
 * PRODUCT ENDPOINTS
 * ============================================================================
 */

/**
 * Get products with filtering and pagination
 * GET /products
 */
export const getProducts = async (params = {}) => {
  try {
    const response = await adminClient.get('/products', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch products');
  }
};

/**
 * Get top selling products
 * GET /products/top
 */
export const getTopProducts = async (limit = 10) => {
  try {
    const response = await adminClient.get('/products/top', {
      params: { limit: Math.min(limit, 50) }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch top products');
  }
};

/**
 * ============================================================================
 * AFFILIATE ENDPOINTS
 * ============================================================================
 */

/**
 * Get affiliates with performance metrics
 * GET /affiliates
 */
export const getAffiliates = async (params = {}) => {
  try {
    const response = await adminClient.get('/affiliates', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch affiliates');
  }
};

/**
 * Get top performing affiliates
 * GET /affiliates/top
 */
export const getTopAffiliates = async (limit = 10) => {
  try {
    const response = await adminClient.get('/affiliates/top', {
      params: { limit: Math.min(limit, 50) }
    });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch top affiliates');
  }
};

/**
 * Get affiliate performance details
 * GET /affiliates/:affiliateId
 */
export const getAffiliateDetails = async (affiliateId) => {
  if (!affiliateId) throw new Error('Affiliate ID is required');

  try {
    const response = await adminClient.get(`/affiliates/${affiliateId}`);
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch affiliate details');
  }
};

/**
 * ============================================================================
 * COMMISSION ENDPOINTS
 * ============================================================================
 */

/**
 * Get commissions with filtering and pagination
 * GET /commissions
 */
export const getCommissions = async (params = {}) => {
  try {
    const response = await adminClient.get('/commissions', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch commissions');
  }
};

/**
 * Get commission analytics and metrics
 * GET /commissions/analytics
 */
export const getCommissionAnalytics = async () => {
  try {
    const response = await adminClient.get('/commissions/analytics');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch commission analytics');
  }
};

/**
 * ============================================================================
 * PAYOUT ENDPOINTS
 * ============================================================================
 */

/**
 * Get payouts with filtering and pagination
 * GET /payouts
 */
export const getPayouts = async (params = {}) => {
  try {
    const response = await adminClient.get('/payouts', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payouts');
  }
};

/**
 * Get payout analytics and metrics
 * GET /payouts/analytics
 */
export const getPayoutAnalytics = async () => {
  try {
    const response = await adminClient.get('/payouts/analytics');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch payout analytics');
  }
};

/**
 * ============================================================================
 * ANALYTICS ENDPOINTS
 * ============================================================================
 */

/**
 * Get revenue analytics grouped by time period
 * GET /revenue
 */
export const getRevenueAnalytics = async (params = {}) => {
  try {
    const response = await adminClient.get('/revenue', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch revenue analytics');
  }
};

/**
 * Get system health and real-time metrics
 * GET /system
 */
export const getSystemHealthMetrics = async () => {
  try {
    const response = await adminClient.get('/system');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch system metrics');
  }
};

/**
 * Get financial reconciliation report
 * GET /reconciliation
 */
export const getFinancialReconciliation = async () => {
  try {
    const response = await adminClient.get('/reconciliation');
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed to fetch reconciliation data');
  }
};

export default adminClient;
