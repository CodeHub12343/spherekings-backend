/**
 * Retail Location API Service
 * Client-side API calls for retail location endpoints
 */

import axiosClient from '../client';

class RetailLocationService {
  /**
   * Get all retail locations (with pagination and filtering)
   * @param {Object} params - Query parameters {page, limit, city, country, featured, sortBy, order}
   * @returns {Promise<{data, pagination}>}
   */
  async getRetailLocations(params = {}) {
    try {
      const response = await axiosClient.get('/retail-locations', { params });
      return {
        data: response.data.data,
        pagination: response.data.pagination,
      };
    } catch (error) {
      console.error('❌ Error fetching retail locations:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to fetch retail locations',
      };
    }
  }

  /**
   * Get a single retail location by ID
   * @param {string} locationId - Location MongoDB ID
   * @returns {Promise<Object>} Location data
   */
  async getRetailLocation(locationId) {
    try {
      const response = await axiosClient.get(`/retail-locations/${locationId}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching retail location:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || 'Retail location not found',
      };
    }
  }

  /**
   * Get featured retail locations (for homepage)
   * @param {number} limit - Number of featured locations
   * @returns {Promise<Array>} Featured locations
   */
  async getFeaturedLocations(limit = 5) {
    try {
      const response = await axiosClient.get('/retail-locations/featured/list', {
        params: { limit },
      });
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching featured locations:', error.message);
      throw error;
    }
  }

  /**
   * Get total count of retail locations
   * @returns {Promise<number>} Total count
   */
  async getTotalRetailLocationCount() {
    try {
      const response = await axiosClient.get('/retail-locations/count/total');
      return response.data.data.total;
    } catch (error) {
      console.error('❌ Error fetching retail location count:', error.message);
      throw error;
    }
  }

  /**
   * Get available countries with locations
   * @returns {Promise<Array>} Array of country names
   */
  async getAvailableCountries() {
    try {
      const response = await axiosClient.get('/retail-locations/countries/available');
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching available countries:', error.message);
      throw error;
    }
  }

  /**
   * Get retail locations for a specific country
   * @param {string} country - Country name
   * @returns {Promise<Array>} Locations in that country
   */
  async getLocationsByCountry(country) {
    try {
      const response = await axiosClient.get(`/retail-locations/by-country/${country}`);
      return response.data.data;
    } catch (error) {
      console.error('❌ Error fetching locations for country:', error.message);
      throw error;
    }
  }

  /**
   * Create a new retail location (admin only)
   * @param {Object} formData - FormData object with location data and logo file
   * @returns {Promise<Object>} Created location data
   */
  async createRetailLocation(formData) {
    try {
      const response = await axiosClient.post('/retail-locations', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ Error creating retail location:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to create retail location',
        errors: error.response?.data?.errors || {},
      };
    }
  }

  /**
   * Update a retail location (admin only)
   * @param {string} locationId - Location MongoDB ID
   * @param {Object} formData - FormData object with updated location data
   * @returns {Promise<Object>} Updated location data
   */
  async updateRetailLocation(locationId, formData) {
    try {
      const response = await axiosClient.put(`/retail-locations/${locationId}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return {
        success: response.data.success,
        message: response.data.message,
        data: response.data.data,
      };
    } catch (error) {
      console.error('❌ Error updating retail location:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to update retail location',
        errors: error.response?.data?.errors || {},
      };
    }
  }

  /**
   * Delete a retail location (admin only)
   * @param {string} locationId - Location MongoDB ID
   * @returns {Promise<{success, message}>}
   */
  async deleteRetailLocation(locationId) {
    try {
      const response = await axiosClient.delete(`/retail-locations/${locationId}`);
      return {
        success: response.data.success,
        message: response.data.message,
      };
    } catch (error) {
      console.error('❌ Error deleting retail location:', error.message);
      throw {
        success: false,
        message: error.response?.data?.message || 'Failed to delete retail location',
      };
    }
  }
}

export default new RetailLocationService();
