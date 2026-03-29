/**
 * Retail Location Controller
 * HTTP request handlers for retail location endpoints
 */

const retailLocationService = require('../services/retailLocationService');
const {
  validateCreateRetailLocation,
  validateUpdateRetailLocation,
  validateListQuery,
} = require('../validators/retailLocationValidator');
const { ValidationError } = require('../utils/errors');

/**
 * POST /api/v1/retail-locations
 * Create a new retail location (admin only)
 * Body: multipart/form-data with image + json fields
 * Protected: Admin role required
 */
exports.createRetailLocation = async (req, res, next) => {
  try {
    const locationData = req.body;

    // Handle logo file upload if provided
    if (req.file) {
      try {
        const cloudinaryUpload = require('../utils/cloudinaryUpload');
        const uploadResult = await cloudinaryUpload.uploadProductImage(
          req.file.buffer,
          'retail-location-logo'
        );
        locationData.logoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return next(new ValidationError('Failed to upload logo image', { logo: uploadError.message }));
      }
    }

    // Validate all required fields (after logo upload)
    const { error, value } = validateCreateRetailLocation(locationData);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return next(new ValidationError('Invalid retail location data', errors));
    }

    // Create the location
    const location = await retailLocationService.createRetailLocation(value);

    return res.status(201).json({
      success: true,
      message: 'Retail location created successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/retail-locations
 * Get all retail locations (public, with pagination and filtering)
 * Query parameters:
 *   - page: page number (default: 1)
 *   - limit: results per page (default: 20)
 *   - city: filter by city
 *   - country: filter by country
 *   - featured: filter by featured status (true/false)
 *   - sortBy: field to sort by (name, city, country, createdAt - default: name)
 *   - order: sort direction (asc/desc - default: asc)
 * Public endpoint (no auth required)
 */
exports.getRetailLocations = async (req, res, next) => {
  try {
    // Validate query parameters
    const { error, value } = validateListQuery(req.query);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return next(new ValidationError('Invalid query parameters', errors));
    }

    // Get locations
    const result = await retailLocationService.getAllRetailLocations(value);

    return res.status(200).json({
      success: true,
      message: 'Retail locations retrieved successfully',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/retail-locations/:id
 * Get a single retail location by ID
 * Parameters:
 *   - id: location MongoDB ID
 * Public endpoint (no auth required)
 */
exports.getRetailLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await retailLocationService.getRetailLocationById(id);

    return res.status(200).json({
      success: true,
      message: 'Retail location retrieved successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/v1/retail-locations/:id
 * Update a retail location (admin only)
 * Parameters:
 *   - id: location MongoDB ID
 * Body: multipart/form-data (all fields optional, partial update)
 * Protected: Admin role required
 */
exports.updateRetailLocation = async (req, res, next) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    // Handle new logo file upload if provided
    if (req.file) {
      try {
        const cloudinaryUpload = require('../utils/cloudinaryUpload');
        const uploadResult = await cloudinaryUpload.uploadProductImage(
          req.file.buffer,
          `retail-location-${id}`
        );
        updateData.logoUrl = uploadResult.secure_url;
      } catch (uploadError) {
        console.error('Logo upload error:', uploadError);
        return next(new ValidationError('Failed to upload logo image', { logo: uploadError.message }));
      }
    }

    // Validate update data
    const { error, value } = validateUpdateRetailLocation(updateData);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return next(new ValidationError('Invalid retail location data', errors));
    }

    // Update the location
    const location = await retailLocationService.updateRetailLocation(id, value);

    return res.status(200).json({
      success: true,
      message: 'Retail location updated successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/v1/retail-locations/:id
 * Delete a retail location (admin only - soft delete)
 * Parameters:
 *   - id: location MongoDB ID
 * Protected: Admin role required
 */
exports.deleteRetailLocation = async (req, res, next) => {
  try {
    const { id } = req.params;

    const location = await retailLocationService.deleteRetailLocation(id);

    return res.status(200).json({
      success: true,
      message: 'Retail location deleted successfully',
      data: location,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/retail-locations/featured/list
 * Get featured retail locations (public)
 * Query:
 *   - limit: number of featured locations to return (default: 5)
 * Public endpoint (no auth required)
 * Useful for homepage display
 */
exports.getFeaturedRetailLocations = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 5, 20); // Max 20

    const locations = await retailLocationService.getFeaturedRetailLocations(limit);

    return res.status(200).json({
      success: true,
      message: 'Featured retail locations retrieved successfully',
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/retail-locations/countries/available
 * Get list of all countries with active retail locations
 * Public endpoint (no auth required)
 * Useful for building location filters
 */
exports.getAvailableCountries = async (req, res, next) => {
  try {
    const countries = await retailLocationService.getAvailableCountries();

    return res.status(200).json({
      success: true,
      message: 'Available countries retrieved successfully',
      data: countries,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/retail-locations/count/total
 * Get total count of active retail locations
 * Public endpoint (no auth required)
 * Useful for stats/dashboard display
 */
exports.getTotalRetailLocationCount = async (req, res, next) => {
  try {
    const count = await retailLocationService.getTotalRetailLocationCount();

    return res.status(200).json({
      success: true,
      message: 'Retail location count retrieved successfully',
      data: {
        total: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/retail-locations/by-country/:country
 * Get retail locations for a specific country
 * Parameters:
 *   - country: country name
 * Public endpoint (no auth required)
 */
exports.getRetailLocationsByCountry = async (req, res, next) => {
  try {
    const { country } = req.params;

    if (!country || country.trim().length === 0) {
      return next(new ValidationError('Country name is required'));
    }

    const locations = await retailLocationService.getLocationsByCountry(country);

    return res.status(200).json({
      success: true,
      message: `Retail locations for ${country} retrieved successfully`,
      data: locations,
    });
  } catch (error) {
    next(error);
  }
};
