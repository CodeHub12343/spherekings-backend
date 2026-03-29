/**
 * Retail Location Validation Schemas
 * Uses Joi for input validation of retail location data
 * Definitions for create, update, and search operations
 */

const Joi = require('joi');

/**
 * Create Retail Location Schema
 * Validates all required fields for creating a new retail location
 */
const createRetailLocationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Store name is required',
      'string.min': 'Store name must be at least 3 characters',
      'string.max': 'Store name cannot exceed 100 characters',
      'any.required': 'Store name is required',
    }),

  address: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Address is required',
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 200 characters',
      'any.required': 'Address is required',
    }),

  city: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'City is required',
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City cannot exceed 50 characters',
      'any.required': 'City is required',
    }),

  state: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'State/Province is required',
      'string.min': 'State must be at least 2 characters',
      'string.max': 'State cannot exceed 50 characters',
      'any.required': 'State/Province is required',
    }),

  country: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .required()
    .messages({
      'string.empty': 'Country is required',
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country cannot exceed 50 characters',
      'any.required': 'Country is required',
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .required()
    .messages({
      'string.empty': 'Store description is required',
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 1000 characters',
      'any.required': 'Store description is required',
    }),

  // Logo URL comes from file upload after Cloudinary processing
  // Made optional here since the controller handles file upload and sets it
  logoUrl: Joi.string()
    .uri()
    .optional()
    .allow(null, '')
    .messages({
      'string.uri': 'Logo must be a valid URL',
    }),

  // Optional fields
  websiteUrl: Joi.string()
    .uri()
    .optional()
    .allow(null, '')
    .messages({
      'string.uri': 'Website URL must be a valid URL',
    }),

  phone: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters',
    }),

  isFeatured: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isFeatured must be true or false',
    }),
})
  .unknown(true) // Allow extra fields from multipart form data
  .required();

/**
 * Update Retail Location Schema
 * Validates optional fields for updating a retail location
 * All fields are optional since this is a partial update
 */
const updateRetailLocationSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Store name must be at least 3 characters',
      'string.max': 'Store name cannot exceed 100 characters',
    }),

  address: Joi.string()
    .trim()
    .min(5)
    .max(200)
    .optional()
    .messages({
      'string.min': 'Address must be at least 5 characters',
      'string.max': 'Address cannot exceed 200 characters',
    }),

  city: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'City must be at least 2 characters',
      'string.max': 'City cannot exceed 50 characters',
    }),

  state: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'State must be at least 2 characters',
      'string.max': 'State cannot exceed 50 characters',
    }),

  country: Joi.string()
    .trim()
    .lowercase()
    .min(2)
    .max(50)
    .optional()
    .messages({
      'string.min': 'Country must be at least 2 characters',
      'string.max': 'Country cannot exceed 50 characters',
    }),

  description: Joi.string()
    .trim()
    .min(10)
    .max(1000)
    .optional()
    .messages({
      'string.min': 'Description must be at least 10 characters',
      'string.max': 'Description cannot exceed 1000 characters',
    }),

  logoUrl: Joi.string()
    .uri()
    .optional()
    .messages({
      'string.uri': 'Logo must be a valid URL',
    }),

  websiteUrl: Joi.string()
    .uri()
    .optional()
    .allow(null, '')
    .messages({
      'string.uri': 'Website URL must be a valid URL',
    }),

  phone: Joi.string()
    .trim()
    .max(20)
    .optional()
    .allow(null, '')
    .messages({
      'string.max': 'Phone number cannot exceed 20 characters',
    }),

  isActive: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isActive must be true or false',
    }),

  isFeatured: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isFeatured must be true or false',
    }),
})
  .unknown(true) // Allow extra fields from multipart form data
  .optional();

/**
 * List Retail Locations Query Schema
 * Validates query parameters for listing retail locations
 */
const listRetailLocationsSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1)
    .optional()
    .messages({
      'number.base': 'Page must be a number',
      'number.integer': 'Page must be an integer',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .optional()
    .messages({
      'number.base': 'Limit must be a number',
      'number.integer': 'Limit must be an integer',
      'number.max': 'Limit cannot exceed 100',
    }),

  city: Joi.string()
    .trim()
    .lowercase()
    .optional()
    .messages({
      'string.base': 'City must be text',
    }),

  country: Joi.string()
    .trim()
    .lowercase()
    .optional()
    .messages({
      'string.base': 'Country must be text',
    }),

  featured: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'Featured must be true or false',
    }),

  sortBy: Joi.string()
    .valid('name', 'city', 'country', 'createdAt')
    .default('name')
    .optional()
    .messages({
      'any.only': 'sortBy must be one of: name, city, country, createdAt',
    }),

  order: Joi.string()
    .valid('asc', 'desc')
    .default('asc')
    .optional()
    .messages({
      'any.only': 'order must be asc or desc',
    }),
})
  .unknown(false) // Don't allow unexpected query parameters
  .required();

/**
 * Export validation schemas and helper functions
 */
module.exports = {
  createRetailLocationSchema,
  updateRetailLocationSchema,
  listRetailLocationsSchema,

  /**
   * Validate create retail location data
   * @param {Object} data - Data to validate
   * @returns {Object} { value, error }
   */
  validateCreateRetailLocation: (data) => {
    return createRetailLocationSchema.validate(data, { abortEarly: false });
  },

  /**
   * Validate update retail location data
   * @param {Object} data - Data to validate
   * @returns {Object} { value, error }
   */
  validateUpdateRetailLocation: (data) => {
    return updateRetailLocationSchema.validate(data, { abortEarly: false });
  },

  /**
   * Validate list query parameters
   * @param {Object} query - Query parameters to validate
   * @returns {Object} { value, error }
   */
  validateListQuery: (query) => {
    return listRetailLocationsSchema.validate(query, { abortEarly: false });
  },
};
