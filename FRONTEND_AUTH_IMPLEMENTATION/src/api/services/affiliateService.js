/**
 * Affiliate Service Layer
 * API calls for all affiliate-related endpoints
 * 
 * Handles:
 * - Affiliate registration
 * - Dashboard data fetching
 * - Referral tracking
 * - Sales tracking
 * - Analytics data
 * - Payout settings
 * - Leaderboard data
 */

import axios from '@/api/client';

/**
 * Register user as affiliate
 * @param {Object} data - Registration form data
 * @param {string} data.marketingChannels - Where will you promote us (required)
 * @param {string} data.website - Website or social media link (required)
 * @param {string} data.expectedMonthlyReferrals - Expected referrals per month (required)
 * @param {boolean} data.termsAccepted - Terms acceptance (optional)
 * @param {number} data.commissionRate - Custom commission rate (optional)
 */
export async function registerAffiliate(data) {
  try {
    const response = await axios.post('/affiliate/register', {
      marketingChannels: data.marketingChannels,
      website: data.website,
      expectedMonthlyReferrals: data.expectedMonthlyReferrals,
      termsAccepted: data.termsAccepted || false,
      commissionRate: data.commissionRate, // Optional
    });

    return response.data.data;
  } catch (error) {
    console.error('Error registering affiliate:', error.message);
    
    // Extract field errors from validation
    const fieldErrors = error.response?.data?.errors || [];
    const errorMessage = fieldErrors.length > 0 
      ? fieldErrors.map(e => `${e.field}: ${e.message}`).join(', ')
      : error.response?.data?.message || 'Failed to register as affiliate';
    
    throw {
      message: errorMessage,
      status: error.response?.status,
      details: fieldErrors,
    };
  }
}

/**
 * Get affiliate dashboard with stats
 * 
 * @param {Object} options - Query parameters
 * @param {string} options.startDate - ISO date (optional)
 * @param {string} options.endDate - ISO date (optional)
 */
export async function getAffiliateDashboard(options = {}) {
  try {
    const response = await axios.get('/affiliate/dashboard', {
      params: {
        ...(options.startDate && { startDate: options.startDate }),
        ...(options.endDate && { endDate: options.endDate }),
      },
    });

    return response.data.data.dashboard;
  } catch (error) {
    console.error('Error fetching dashboard:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch dashboard',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get affiliate referral history
 * 
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default 1)
 * @param {number} options.limit - Items per page (default 20)
 * @param {boolean} options.convertedOnly - Show only converted clicks
 * @param {string} options.startDate - ISO date
 * @param {string} options.endDate - ISO date
 */
export async function getAffiliateReferrals(options = {}) {
  try {
    const response = await axios.get('/affiliate/referrals', {
      params: {
        page: options.page || 1,
        limit: options.limit || 20,
        ...(options.convertedOnly !== undefined && { convertedOnly: options.convertedOnly }),
        ...(options.startDate && { startDate: options.startDate }),
        ...(options.endDate && { endDate: options.endDate }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching referrals:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch referrals',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get affiliate sales with commission details
 * 
 * @param {Object} options - Query parameters
 * @param {number} options.page - Page number (default 1)
 * @param {number} options.limit - Items per page (default 20)
 * @param {string} options.status - Commission status (pending, approved, paid, reversed)
 * @param {string} options.startDate - ISO date
 * @param {string} options.endDate - ISO date
 */
export async function getAffiliateSales(options = {}) {
  try {
    const response = await axios.get('/affiliate/sales', {
      params: {
        page: options.page || 1,
        limit: options.limit || 20,
        ...(options.status && { status: options.status }),
        ...(options.startDate && { startDate: options.startDate }),
        ...(options.endDate && { endDate: options.endDate }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching sales:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch sales',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get affiliate analytics
 * 
 * @param {Object} options - Query parameters
 * @param {string} options.startDate - ISO date (optional)
 * @param {string} options.endDate - ISO date (optional)
 */
export async function getAffiliateAnalytics(options = {}) {
  try {
    const response = await axios.get('/affiliate/analytics', {
      params: {
        ...(options.startDate && { startDate: options.startDate }),
        ...(options.endDate && { endDate: options.endDate }),
      },
    });

    return response.data.data.analytics;
  } catch (error) {
    console.error('Error fetching analytics:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch analytics',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Update payout settings
 * 
 * @param {Object} data - Payout settings
 * @param {string} data.payoutMethod - stripe, paypal, bank_transfer, none
 * @param {string} data.payoutData - Method-specific data
 * @param {number} data.minimumThreshold - Minimum payout threshold
 */
export async function updatePayoutSettings(data) {
  try {
    const response = await axios.post('/affiliate/payout-settings', {
      payoutMethod: data.payoutMethod,
      payoutData: data.payoutData,
      minimumThreshold: data.minimumThreshold,
    });

    return response.data.data;
  } catch (error) {
    console.error('Error updating payout settings:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to update payout settings',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Get public affiliate leaderboard
 * 
 * @param {Object} options - Query parameters
 * @param {number} options.limit - Number of affiliates to fetch (default 10, max 50)
 * @param {string} options.sortBy - Sort field: totalEarnings, totalSales, totalClicks
 */
export async function getAffiliateLeaderboard(options = {}) {
  try {
    const response = await axios.get('/leaderboard', {
      params: {
        limit: Math.min(options.limit || 10, 50),
        ...(options.sortBy && { sortBy: options.sortBy }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error fetching leaderboard:', error.message);
    throw {
      message: error.response?.data?.message || 'Failed to fetch leaderboard',
      status: error.response?.status,
      details: error.response?.data?.details,
    };
  }
}

/**
 * Track referral click (public endpoint)
 * Called when user visits with ?ref=CODE parameter
 * 
 * @param {Object} options - Query parameters
 * @param {string} options.ref - Affiliate code
 * @param {string} options.utm_campaign - UTM campaign (optional)
 * @param {string} options.utm_medium - UTM medium (optional)
 * @param {string} options.utm_source - UTM source (optional)
 * @param {string} options.utm_content - UTM content (optional)
 */
export async function trackReferralClick(options = {}) {
  try {
    const response = await axios.get('/tracking/click', {
      params: {
        ref: options.ref,
        ...(options.utm_campaign && { utm_campaign: options.utm_campaign }),
        ...(options.utm_medium && { utm_medium: options.utm_medium }),
        ...(options.utm_source && { utm_source: options.utm_source }),
        ...(options.utm_content && { utm_content: options.utm_content }),
      },
    });

    return response.data.data;
  } catch (error) {
    console.error('Error tracking referral click:', error.message);
    // Don't throw for public tracking endpoint - fail silently
    return null;
  }
}

export default {
  registerAffiliate,
  getAffiliateDashboard,
  getAffiliateReferrals,
  getAffiliateSales,
  getAffiliateAnalytics,
  updatePayoutSettings,
  getAffiliateLeaderboard,
  trackReferralClick,
};
