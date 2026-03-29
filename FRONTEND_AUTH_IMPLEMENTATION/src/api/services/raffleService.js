/**
 * Raffle Service
 * API integration for raffle entries, payment, and winner management
 */

import client from '@/api/client';

const API_BASE = '/raffle';

/**
 * Get current active raffle cycle information
 */
export const getRaffleCurrentCycle = async () => {
  try {
    const response = await client.get(`${API_BASE}/current-cycle`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch raffle cycle',
    };
  }
};

/**
 * Get past raffle winners (public display)
 */
export const getRafflePastWinners = async (limit = 10) => {
  try {
    const response = await client.get(`${API_BASE}/winners`, {
      params: { limit },
    });
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch winners',
    };
  }
};

/**
 * Submit raffle entry and get Stripe checkout session
 * Requires: fullName, email, shippingAddress
 */
export const submitRaffleEntry = async (entryData) => {
  try {
    const response = await client.post(`${API_BASE}/entry`, entryData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit raffle entry',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Get authenticated user's raffle entries
 */
export const getUserRaffleEntries = async () => {
  try {
    const response = await client.get(`${API_BASE}/my-entries`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch your entries',
    };
  }
};

/**
 * ADMIN: Select winner for current raffle cycle
 */
export const selectRaffleWinner = async (cycleId) => {
  try {
    const response = await client.post(`${API_BASE}/admin/select-winner`, {
      cycleId,
    });
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to select winner',
    };
  }
};

/**
 * ADMIN: Get raffle dashboard statistics
 */
export const getRaffleAdminStats = async () => {
  try {
    const response = await client.get(`${API_BASE}/admin/stats`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch admin stats',
    };
  }
};

/**
 * ADMIN: Get all raffle entries with pagination and filters
 */
export const getRaffleAdminEntries = async (filters = {}, page = 1, limit = 20) => {
  try {
    const response = await client.get(`${API_BASE}/admin/entries`, {
      params: {
        page,
        limit,
        cycleId: filters.cycleId,
        status: filters.status,
        search: filters.search,
      },
    });
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch raffle entries',
    };
  }
};

/**
 * ADMIN: Get specific raffle entry/winner details
 */
export const getRaffleWinnerDetails = async (entryId) => {
  try {
    const response = await client.get(`${API_BASE}/admin/entry/${entryId}`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch winner details',
    };
  }
};

/**
 * ADMIN: Mark winner as shipped
 */
export const markWinnerShipped = async (winnerId) => {
  try {
    const response = await client.post(`${API_BASE}/admin/mark-shipped`, {
      winnerId,
    });
    return {
      success: true,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to mark winner as shipped',
    };
  }
};

/**
 * Get P2P payment configuration
 * Returns recipient details for manual transfer instructions
 */
export const getP2PConfig = async () => {
  try {
    const response = await client.get(`${API_BASE}/p2p-config`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch P2P configuration',
    };
  }
};

/**
 * Submit P2P payment proof
 * User confirms they sent payment and can upload receipt or provide transaction ID
 */
export const submitP2PProof = async (formData) => {
  try {
    // Don't set Content-Type header - let axios handle it automatically with FormData
    // Setting it manually breaks the boundary encoding
    const response = await client.post(`${API_BASE}/submit-proof`, formData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit payment proof',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * ADMIN: Verify P2P raffle entry
 * Approve or reject payment proof
 */
export const verifyP2PEntry = async (entryId, approved, rejectionReason) => {
  try {
    const response = await client.post(`${API_BASE}/admin/verify-entry`, {
      entryId,
      approved,
      rejectionReason,
    });
    return {
      success: true,
      data: response.data.data,
      entryId: response.data.data.entryId,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to verify entry',
      errors: error.response?.data?.errors || {},
    };
  }
};

export default {
  getRaffleCurrentCycle,
  getRafflePastWinners,
  submitRaffleEntry,
  getUserRaffleEntries,
  selectRaffleWinner,
  getRaffleAdminStats,
  getRaffleAdminEntries,
  getRaffleWinnerDetails,
  markWinnerShipped,
  getP2PConfig,
  submitP2PProof,
  verifyP2PEntry,
};
