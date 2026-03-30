/**
 * Referral Tracking API Service
 * Handles all affiliate referral tracking API calls
 */

import axios from 'axios';
import { tokenManager } from '@/utils/tokenManager';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

// Create axios instance with default headers
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
});

// Add Bearer token to authenticated requests
apiClient.interceptors.request.use(
  (config) => {
    // Get token using TokenManager (uses correct storage key)
    const token = tokenManager.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle response errors - don't auto-logout, let React Query handle retries
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    // Log error details but don't force logout
    if (error.response?.status === 401) {
      console.warn('Unauthorized - token may have expired');
      // Clear invalid token
      tokenManager.clearTokens();
      // Return error - let React Query retry or caller handle it
      return Promise.reject(error);
    }

    if (error.response?.status === 403) {
      console.error('Forbidden - access denied');
      return Promise.reject(error);
    }

    return Promise.reject(error);
  }
);

class ReferralTrackingService {
  /**
   * Track a referral click (public endpoint)
   * This should be called through server-side to avoid CORS issues
   *
   * @param {string} affiliateCode - Affiliate code
   * @param {Object} options - Click tracking options
   *   - redirect: Landing page path (default: /)
   *   - utm_campaign: Campaign name
   *   - utm_medium: Medium
   *   - utm_source: Source
   *   - utm_content: Content
   * @returns {Promise<Object>} Track result with redirect URL
   */
  async trackReferralClick(affiliateCode, options = {}) {
    try {
      const {
        redirect = '/',
        utm_campaign = null,
        utm_medium = null,
        utm_source = null,
        utm_content = null,
      } = options;

      // Build query string
      const params = new URLSearchParams();
      if (redirect) params.append('redirect', redirect);
      if (utm_campaign) params.append('utm_campaign', utm_campaign);
      if (utm_medium) params.append('utm_medium', utm_medium);
      if (utm_source) params.append('utm_source', utm_source);
      if (utm_content) params.append('utm_content', utm_content);

      const queryString = params.toString();
      const url = `/ref/${affiliateCode}${queryString ? `?${queryString}` : ''}`;

      // Return the URL for client-side redirect
      return {
        success: true,
        redirectUrl: `${API_BASE_URL}${url}`,
      };
    } catch (error) {
      console.error('Error tracking referral click:', error);
      throw new Error(`Failed to track referral click: ${error.message}`);
    }
  }

  /**
   * Get system health status (public endpoint)
   *
   * @returns {Promise<Object>} Health status
   */
  async getSystemHealth() {
    try {
      const response = await apiClient.get('/v1/ref/status/health');
      return response.data;
    } catch (error) {
      console.error('Error fetching system health:', error);
      throw new Error(`Failed to fetch system health: ${error.message}`);
    }
  }

  /**
   * Get referral statistics for an affiliate
   * Authenticated endpoint
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Filter options
   *   - dateFrom: Start date (ISO string)
   *   - dateTo: End date (ISO string)
   * @returns {Promise<Object>} Statistics data aggregated by dimensions
   */
  async getReferralStats(affiliateId, options = {}) {
    try {
      const { dateFrom = null, dateTo = null } = options;

      // Build query params
      const params = new URLSearchParams();
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const queryString = params.toString();
      const url = `/tracking/stats/${affiliateId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching referral stats:', error);
      throw new Error(`Failed to fetch referral stats: ${error.message}`);
    }
  }

  /**
   * Get referral clicks for an affiliate
   * Authenticated endpoint with pagination
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Query options
   *   - page: Page number (default: 1)
   *   - limit: Items per page (default: 20)
   *   - convertedOnly: Show only converted referrals (default: false)
   *   - dateFrom: Start date (ISO string)
   *   - dateTo: End date (ISO string)
   * @returns {Promise<Object>} Paginated referral click records
   */
  async getReferrals(affiliateId, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        convertedOnly = false,
        dateFrom = null,
        dateTo = null,
      } = options;

      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (convertedOnly) params.append('convertedOnly', 'true');
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const queryString = params.toString();
      const url = `/tracking/referrals/${affiliateId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching referrals:', error);
      throw new Error(`Failed to fetch referrals: ${error.message}`);
    }
  }

  /**
   * Get sales attributed to an affiliate
   * Authenticated endpoint with pagination
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Query options
   *   - page: Page number (default: 1)
   *   - limit: Items per page (default: 20)
   *   - dateFrom: Start date (ISO string)
   *   - dateTo: End date (ISO string)
   * @returns {Promise<Object>} Paginated attributed sales records
   */
  async getSales(affiliateId, options = {}) {
    try {
      const { page = 1, limit = 20, dateFrom = null, dateTo = null } = options;

      // Build query params
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', limit);
      if (dateFrom) params.append('dateFrom', dateFrom);
      if (dateTo) params.append('dateTo', dateTo);

      const queryString = params.toString();
      const url = `/tracking/sales/${affiliateId}${queryString ? `?${queryString}` : ''}`;

      const response = await apiClient.get(url);
      return response.data;
    } catch (error) {
      console.error('Error fetching sales:', error);
      throw new Error(`Failed to fetch sales: ${error.message}`);
    }
  }

  /**
   * Generate referral link for affiliate to share
   *
   * @param {string} affiliateCode - Affiliate code
   * @param {Object} options - Options
   *   - campaign: Campaign name
   *   - medium: Medium (email, social, etc.)
   *   - source: Source (facebook, twitter, etc.)
   *   - landingPage: Landing page path
   * @returns {string} Full referral URL
   */
  generateReferralLink(affiliateCode, options = {}) {
    const { campaign = '', medium = '', source = '', landingPage = '/' } = options;

    const baseUrl = process.env.NEXT_PUBLIC_WEBSITE_URL || 'http://localhost:3000';
    const params = new URLSearchParams();

    if (campaign) params.append('utm_campaign', campaign);
    if (medium) params.append('utm_medium', medium);
    if (source) params.append('utm_source', source);

    const queryString = params.toString();
    return `${baseUrl}/ref/${affiliateCode}?redirect=${encodeURIComponent(landingPage)}${
      queryString ? `&${queryString}` : ''
    }`;
  }

  /**
   * Get affiliate referral cookie data
   *
   * @returns {Object|null} Cookie data or null if not found
   */
  getReferralCookie() {
    try {
      if (typeof window === 'undefined') {
        console.log('🔗 [REFERRAL SERVICE] Running on server - skipping cookie read');
        return null;
      }

      // Parse affiliate_ref cookie
      const cookieString = document.cookie
        .split(';')
        .find((c) => c.trim().startsWith('affiliate_ref='));

      if (!cookieString) {
        console.log('🔗 [REFERRAL SERVICE] No affiliate_ref cookie found in document.cookie');
        return null;
      }

      const cookieValue = cookieString.split('=')[1];
      const parsed = JSON.parse(decodeURIComponent(cookieValue));
      console.log('✅ [REFERRAL SERVICE] affiliate_ref cookie parsed:', {
        affiliateId: parsed.affiliateId ? '✓ Present' : '✗ Missing',
        visitorId: parsed.visitorId ? '✓ Present' : '✗ Missing',
        data: parsed,
      });
      return parsed;
    } catch (error) {
      console.warn('❌ [REFERRAL SERVICE] Error parsing referral cookie:', error.message);
      return null;
    }
  }

  /**
   * Get referral source from HTTP referrer
   * Used for attribution if no affiliate_ref cookie
   *
   * @param {string} referrer - HTTP referrer header
   * @returns {string} Referral source
   */
  extractReferralSource(referrer) {
    if (!referrer) return 'direct';

    const sources = [
      { key: 'facebook', domains: ['facebook.com'] },
      { key: 'twitter', domains: ['twitter.com', 'x.com'] },
      { key: 'instagram', domains: ['instagram.com'] },
      { key: 'tiktok', domains: ['tiktok.com'] },
      { key: 'reddit', domains: ['reddit.com'] },
      { key: 'email', domains: ['gmail.com', 'outlook.com', 'yahoo.com'] },
    ];

    try {
      const url = new URL(referrer);
      const domain = url.hostname.toLowerCase();

      for (const source of sources) {
        if (source.domains.some((d) => domain.includes(d))) {
          return source.key;
        }
      }
    } catch (error) {
      // Invalid URL
    }

    return 'other';
  }
}

export default new ReferralTrackingService();
