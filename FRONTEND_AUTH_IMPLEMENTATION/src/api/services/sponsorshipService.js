/**
 * Sponsorship Service
 * API integration for sponsorship tiers and purchases
 */

import client from '@/api/client';

const API_BASE = '/sponsorship';

/**
 * Get all sponsorship tiers (public)
 */
export const getTiers = async (params = {}) => {
  try {
    const response = await client.get(`${API_BASE}/tiers`, { params });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch sponsorship tiers',
    };
  }
};

/**
 * Get single sponsorship tier (public)
 */
export const getTier = async (tierId) => {
  try {
    const response = await client.get(`${API_BASE}/tiers/${tierId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch sponsorship tier',
    };
  }
};

/**
 * Initiate sponsorship purchase (create Stripe checkout)
 */
export const initiatePurchase = async (purchaseData) => {
  try {
    const response = await client.post(`${API_BASE}/purchase`, purchaseData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
      sessionId: response.data.data?.sessionId,
      checkoutUrl: response.data.data?.checkoutUrl,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to initiate purchase',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Get user's sponsorships
 */
export const getMySponsorships = async () => {
  try {
    const response = await client.get(`${API_BASE}/my-sponsorships`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch your sponsorships',
    };
  }
};

/**
 * List all sponsorship records (admin)
 */
export const listRecords = async (params = {}) => {
  try {
    const response = await client.get(`${API_BASE}/records`, { params });
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch sponsorship records',
    };
  }
};

/**
 * Get single sponsorship record (admin)
 */
export const getRecord = async (recordId) => {
  try {
    const response = await client.get(`${API_BASE}/records/${recordId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch sponsorship record',
    };
  }
};

/**
 * Add video link to sponsorship (admin)
 * Normalizes platform name to title case (YouTube, TikTok, Instagram, etc.)
 */
export const addVideoLink = async (recordId, videoData) => {
  try {
    // Normalize platform name to match schema enum values
    const platformMap = {
      'youtube': 'YouTube',
      'tiktok': 'TikTok',
      'instagram': 'Instagram',
      'twitter': 'Twitter',
      'twitch': 'Twitch',
      'facebook': 'Facebook',
    };
    
    const normalizedData = {
      ...videoData,
      platform: platformMap[videoData.platform?.toLowerCase()] || videoData.platform,
    };

    const response = await client.put(
      `${API_BASE}/records/${recordId}/add-video`,
      normalizedData
    );
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

/**
 * Update sponsorship status (admin)
 */
export const updateStatus = async (recordId, statusData) => {
  try {
    const response = await client.put(
      `${API_BASE}/records/${recordId}/status`,
      statusData
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update sponsorship status',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Create sponsorship tier (admin)
 */
export const createTier = async (tierData) => {
  try {
    const response = await client.post(`${API_BASE}/tiers`, tierData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to create sponsorship tier',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Update sponsorship tier (admin)
 */
export const updateTier = async (tierId, tierData) => {
  try {
    const response = await client.put(`${API_BASE}/tiers/${tierId}`, tierData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update sponsorship tier',
      errors: error.response?.data?.errors || {},
    };
  }
};

export default {
  getTiers,
  getTier,
  initiatePurchase,
  getMySponsorships,
  listRecords,
  getRecord,
  addVideoLink,
  updateStatus,
  createTier,
  updateTier,
};
