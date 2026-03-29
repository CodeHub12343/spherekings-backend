/**
 * Follower API Service
 * Client-side API calls for follower endpoints
 */

import axiosClient from '../client';

class FollowerService {
  /**
   * Subscribe a new follower
   * @param {string} email - Email address
   * @returns {Promise<{success, message, data}>}
   */
  async subscribeFollower(email) {
    try {
      const response = await axiosClient.post('/followers/subscribe', { email });
      return {
        success: response.data.success,
        message: response.data.message,
        totalFollowers: response.data.data.totalFollowers,
        isDuplicate: response.data.data.isDuplicate,
      };
    } catch (error) {
      console.error('❌ Error subscribing follower:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || error.message || 'Failed to subscribe',
        errors: error.response?.data?.errors || {},
      };
    }
  }

  /**
   * Get follower count
   * @returns {Promise<number>} Total follower count
   */
  async getFollowerCount() {
    try {
      const response = await axiosClient.get('/followers/count');
      return response.data.data.totalFollowers;
    } catch (error) {
      console.error('❌ Error fetching follower count:', error.message);
      throw error;
    }
  }

  /**
   * Unsubscribe a follower
   * @param {string} email - Email address
   * @returns {Promise<{success, message, totalFollowers}>}
   */
  async unsubscribeFollower(email) {
    try {
      const response = await axiosClient.post('/followers/unsubscribe', { email });
      return {
        success: response.data.success,
        message: response.data.message,
        totalFollowers: response.data.data.totalFollowers,
      };
    } catch (error) {
      console.error('❌ Error unsubscribing:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || error.message,
      };
    }
  }

  /**
   * Get follower stats (admin only)
   * @returns {Promise<stats>}
   */
  async getFollowerStats() {
    try {
      const response = await axiosClient.get('/followers/stats');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching follower stats:', error.message);
      throw error;
    }
  }

  /**
   * Get recent followers (admin only)
   * @param {number} limit - Number of followers to fetch
   * @returns {Promise<array>}
   */
  async getRecentFollowers(limit = 10) {
    try {
      const response = await axiosClient.get(`/followers/recent?limit=${limit}`);
      return response.data.data.followers;
    } catch (error) {
      console.error('❌ Error fetching recent followers:', error.message);
      throw error;
    }
  }
}

export default new FollowerService();
