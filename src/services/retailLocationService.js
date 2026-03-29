/**
 * Retail Location Service
 * Business logic for managing retail locations / stores
 */

const RetailLocation = require('../models/RetailLocation');

class RetailLocationService {
  /**
   * Create a new retail location
   * @param {Object} locationData - Location data including name, address, city, state, country, logoUrl, description
   * @returns {Promise<Object>} Created location document
   */
  async createRetailLocation(locationData) {
    try {
      const newLocation = new RetailLocation({
        name: locationData.name,
        address: locationData.address,
        city: locationData.city,
        state: locationData.state,
        country: locationData.country,
        logoUrl: locationData.logoUrl,
        description: locationData.description,
        websiteUrl: locationData.websiteUrl || null,
        phone: locationData.phone || null,
        logoPublicId: locationData.logoPublicId || null,
        isFeatured: locationData.isFeatured || false,
      });

      const savedLocation = await newLocation.save();
      console.log(`✅ Retail location created: ${savedLocation.name} (${savedLocation._id})`);

      return savedLocation;
    } catch (error) {
      console.error('❌ Error creating retail location:', error.message);
      throw error;
    }
  }

  /**
   * Get all retail locations (with filtering and pagination)
   * @param {Object} options - Query options
   * @param {Number} options.page - Page number (default: 1)
   * @param {Number} options.limit - Results per page (default: 20)
   * @param {String} options.city - Filter by city
   * @param {String} options.country - Filter by country
   * @param {Boolean} options.featured - Filter by featured status
   * @param {String} options.sortBy - Field to sort by (default: name)
   * @param {String} options.order - Sort order: asc|desc (default: asc)
   * @returns {Promise<Object>} { locations, total, page, limit, pages }
   */
  async getAllRetailLocations(options = {}) {
    try {
      const page = parseInt(options.page) || 1;
      const limit = parseInt(options.limit) || 20;
      const skip = (page - 1) * limit;

      // Build filter
      const filter = { isActive: true }; // Only show active locations

      if (options.city) {
        filter.city = options.city.toLowerCase();
      }

      if (options.country) {
        filter.country = options.country.toLowerCase();
      }

      if (options.featured !== undefined) {
        filter.isFeatured = options.featured;
      }

      // Build sort
      const sortBy = options.sortBy || 'name';
      const order = options.order === 'desc' ? -1 : 1;
      const sort = { [sortBy]: order };

      // Execute query
      const locations = await RetailLocation.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean(); // Use lean() for better performance on read-only queries

      // Get total count
      const total = await RetailLocation.countDocuments(filter);
      const pages = Math.ceil(total / limit);

      console.log(`📍 Retrieved ${locations.length} retail locations (Page ${page}/${pages})`);

      return {
        success: true,
        data: locations,
        pagination: {
          total,
          page,
          limit,
          pages,
        },
      };
    } catch (error) {
      console.error('❌ Error fetching retail locations:', error.message);
      throw error;
    }
  }

  /**
   * Get a single retail location by ID
   * @param {String} locationId - Location MongoDB ID
   * @returns {Promise<Object>} Location document
   */
  async getRetailLocationById(locationId) {
    try {
      const location = await RetailLocation.findById(locationId).lean();

      if (!location) {
        const error = new Error('Retail location not found');
        error.statusCode = 404;
        throw error;
      }

      console.log(`📍 Retrieved retail location: ${location.name}`);
      return location;
    } catch (error) {
      console.error('❌ Error fetching retail location:', error.message);
      throw error;
    }
  }

  /**
   * Update a retail location
   * @param {String} locationId - Location MongoDB ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} Updated location document
   */
  async updateRetailLocation(locationId, updateData) {
    try {
      // Only allow updating specific fields
      const allowedFields = [
        'name',
        'address',
        'city',
        'state',
        'country',
        'logoUrl',
        'description',
        'websiteUrl',
        'phone',
        'isActive',
        'isFeatured',
        'logoPublicId',
      ];

      const updatePayload = {};
      for (const field of allowedFields) {
        if (updateData[field] !== undefined) {
          updatePayload[field] = updateData[field];
        }
      }

      // Always update the updatedAt timestamp
      updatePayload.updatedAt = new Date();

      const updatedLocation = await RetailLocation.findByIdAndUpdate(
        locationId,
        updatePayload,
        { new: true, runValidators: true }
      );

      if (!updatedLocation) {
        const error = new Error('Retail location not found');
        error.statusCode = 404;
        throw error;
      }

      console.log(`✅ Retail location updated: ${updatedLocation.name}`);
      return updatedLocation;
    } catch (error) {
      console.error('❌ Error updating retail location:', error.message);
      throw error;
    }
  }

  /**
   * Delete a retail location (soft delete - set isActive to false)
   * @param {String} locationId - Location MongoDB ID
   * @returns {Promise<Object>} Deleted location document
   */
  async deleteRetailLocation(locationId) {
    try {
      const deletedLocation = await RetailLocation.findByIdAndUpdate(
        locationId,
        { isActive: false, updatedAt: new Date() },
        { new: true }
      );

      if (!deletedLocation) {
        const error = new Error('Retail location not found');
        error.statusCode = 404;
        throw error;
      }

      console.log(`🗑️ Retail location deleted (soft): ${deletedLocation.name}`);
      return deletedLocation;
    } catch (error) {
      console.error('❌ Error deleting retail location:', error.message);
      throw error;
    }
  }

  /**
   * Get retail locations by country
   * Useful for location-specific landing pages or regional filters
   * @param {String} country - Country name
   * @returns {Promise<Array>} Array of locations in that country
   */
  async getLocationsByCountry(country) {
    try {
      const locations = await RetailLocation.find({
        country: country.toLowerCase(),
        isActive: true,
      })
        .sort({ isFeatured: -1, name: 1 })
        .lean();

      console.log(`📍 Retrieved ${locations.length} locations for ${country}`);
      return locations;
    } catch (error) {
      console.error('❌ Error fetching locations by country:', error.message);
      throw error;
    }
  }

  /**
   * Get all unique countries with active retail locations
   * Useful for building a location filter
   * @returns {Promise<Array>} Array of country names
   */
  async getAvailableCountries() {
    try {
      const countries = await RetailLocation.distinct('country', {
        isActive: true,
      });

      return countries.sort();
    } catch (error) {
      console.error('❌ Error fetching available countries:', error.message);
      throw error;
    }
  }

  /**
   * Get featured retail locations (for homepage display)
   * @param {Number} limit - Number of featured locations to return
   * @returns {Promise<Array>} Array of featured locations
   */
  async getFeaturedRetailLocations(limit = 5) {
    try {
      const locations = await RetailLocation.find({
        isFeatured: true,
        isActive: true,
      })
        .sort({ createdAt: -1 })
        .limit(limit)
        .lean();

      console.log(`⭐ Retrieved ${locations.length} featured retail locations`);
      return locations;
    } catch (error) {
      console.error('❌ Error fetching featured locations:', error.message);
      throw error;
    }
  }

  /**
   * Get total count of active retail locations
   * @returns {Promise<Number>} Total count
   */
  async getTotalRetailLocationCount() {
    try {
      const count = await RetailLocation.countDocuments({ isActive: true });
      return count;
    } catch (error) {
      console.error('❌ Error counting retail locations:', error.message);
      throw error;
    }
  }
}

// Export singleton instance
module.exports = new RetailLocationService();
