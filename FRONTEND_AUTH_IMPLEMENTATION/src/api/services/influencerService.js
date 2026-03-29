/**
 * Influencer Service
 * API integration for influencer application and management
 */

import client from '@/api/client';

const API_BASE = '/influencer';

/**
 * Submit influencer application
 */
export const submitInfluencerApplication = async (applicationData) => {
  try {
    const response = await client.post(`${API_BASE}/apply`, applicationData);
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to submit application',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Get current user's influencer application
 */
export const getMyApplication = async () => {
  try {
    const response = await client.get(`${API_BASE}/my-application`);
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        success: false,
        data: null,
        notFound: true,
      };
    }
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch application',
    };
  }
};

/**
 * Add content link to application (influencer)
 */
export const addContentLink = async (applicationId, contentData) => {
  try {
    const response = await client.put(
      `${API_BASE}/${applicationId}/add-content`,
      contentData
    );
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to add content link',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * List all influencer applications (admin)
 */
export const listApplications = async (params = {}) => {
  try {
    const response = await client.get(`${API_BASE}/applications`, {
      params,
    });
    return {
      success: true,
      data: response.data.data,
      pagination: response.data.pagination,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch applications',
    };
  }
};

/**
 * Get single application (admin)
 */
export const getApplication = async (applicationId) => {
  try {
    const response = await client.get(
      `${API_BASE}/applications/${applicationId}`
    );
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to fetch application',
    };
  }
};

/**
 * Approve application (admin)
 */
export const approveApplication = async (applicationId, approvalData = {}) => {
  try {
    const response = await client.put(
      `${API_BASE}/applications/${applicationId}/approve`,
      approvalData
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to approve application',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Reject application (admin)
 */
export const rejectApplication = async (applicationId, rejectionData) => {
  try {
    const response = await client.put(
      `${API_BASE}/applications/${applicationId}/reject`,
      rejectionData
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to reject application',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Assign product to influencer (admin)
 */
export const assignProduct = async (applicationId, { productId, trackingNumber }) => {
  try {
    const response = await client.put(
      `${API_BASE}/applications/${applicationId}/assign-product`,
      { productId, trackingNumber }
    );
    return {
      success: true,
      data: response.data.data,
      message: response.data.message,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to assign product',
      errors: error.response?.data?.errors || {},
    };
  }
};

/**
 * Update fulfillment status (admin)
 */
export const updateFulfillmentStatus = async (
  applicationId,
  { fulfillmentStatus, trackingNumber }
) => {
  try {
    const response = await client.put(
      `${API_BASE}/applications/${applicationId}/fulfillment`,
      { fulfillmentStatus, trackingNumber }
    );
    return {
      success: true,
      data: response.data.data,
    };
  } catch (error) {
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to update fulfillment',
      errors: error.response?.data?.errors || {},
    };
  }
};

export default {
  submitInfluencerApplication,
  getMyApplication,
  addContentLink,
  listApplications,
  getApplication,
  approveApplication,
  rejectApplication,
  assignProduct,
  updateFulfillmentStatus,
};
