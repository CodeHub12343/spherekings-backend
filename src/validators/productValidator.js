/**
 * Product Validation Schemas
 * Uses Joi for input validation of product data
 * Definitions for create, update, and search operations
 */

const Joi = require('joi');

/**
 * Variant schema for validation
 * Defines structure for product variants (colors, editions, etc.)
 */
const variantSchema = Joi.object({
  name: Joi.string()
    .lowercase()
    .valid('color', 'edition', 'size', 'material')
    .required()
    .messages({
      'any.only': 'Variant name must be one of: color, edition, size, material',
      'any.required': 'Variant name is required',
    }),
  options: Joi.array()
    .items(Joi.string().trim().min(1).max(50))
    .min(1)
    .max(20)
    .required()
    .messages({
      'array.min': 'Each variant must have at least 1 option',
      'array.max': 'Each variant cannot have more than 20 options',
      'any.required': 'Variant options are required',
    }),
})
  .unknown(false) // Don't allow extra fields
  .required();

/**
 * Create Product Schema
 * Validates all required fields and their formats for product creation
 */
const createProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Product name is required',
      'string.min': 'Product name must be at least 3 characters',
      'string.max': 'Product name cannot exceed 100 characters',
      'any.required': 'Product name is required',
    }),

  description: Joi.string()
    .trim()
    .min(20)
    .max(2000)
    .required()
    .messages({
      'string.empty': 'Product description is required',
      'string.min': 'Description must be at least 20 characters',
      'string.max': 'Description cannot exceed 2000 characters',
      'any.required': 'Product description is required',
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .required()
    .messages({
      'number.positive': 'Price must be a positive number',
      'number.base': 'Price must be a valid number',
      'any.required': 'Price is required',
    }),

  stock: Joi.number()
    .integer()
    .min(0)
    .required()
    .messages({
      'number.base': 'Stock must be a valid number',
      'number.integer': 'Stock must be a whole number',
      'number.min': 'Stock cannot be negative',
      'any.required': 'Stock is required',
    }),

  category: Joi.string()
    .trim()
    .lowercase()
    .optional()
    .messages({
      'string.base': 'Category must be a valid text value',
    }),

  sku: Joi.string()
    .trim()
    .uppercase()
    .optional()
    .messages({
      'string.base': 'SKU must be a valid text value',
    }),

  isFeatured: Joi.boolean()
    .default(false)
    .optional()
    .messages({
      'boolean.base': 'isFeatured must be true or false',
    }),
})
  .unknown(true) // Allow extra fields from multipart form data
  .required();

/**
 * Update Product Schema
 * Validates optional fields for product updates
 * All fields are optional since this is a partial update
 */
const updateProductSchema = Joi.object({
  name: Joi.string()
    .trim()
    .lowercase()
    .min(3)
    .max(100)
    .optional()
    .messages({
      'string.min': 'Product name must be at least 3 characters',
      'string.max': 'Product name cannot exceed 100 characters',
    }),

  description: Joi.string()
    .trim()
    .min(20)
    .max(2000)
    .optional()
    .messages({
      'string.min': 'Description must be at least 20 characters',
      'string.max': 'Description cannot exceed 2000 characters',
    }),

  price: Joi.number()
    .positive()
    .precision(2)
    .optional()
    .messages({
      'number.positive': 'Price must be a positive number',
      'number.base': 'Price must be a valid number',
    }),

  // Images validation skipped - handled separately in controller
  // Images can be URLs (existing) or Files (new upload) via FormData
  // variants: Joi.array()
  //   .items(variantSchema)
  //   .max(5)
  //   .optional()
  //   .messages({
  //     'array.max': 'Cannot have more than 5 variant types',
  //   }),

  stock: Joi.number()
    .integer()
    .min(0)
    .optional()
    .messages({
      'number.base': 'Stock must be a valid number',
      'number.integer': 'Stock must be a whole number',
      'number.min': 'Stock cannot be negative',
    }),

  category: Joi.string()
    .trim()
    .lowercase()
    .optional()
    .messages({
      'string.base': 'Category must be a valid text value',
    }),

  sku: Joi.string()
    .trim()
    .uppercase()
    .optional()
    .messages({
      'string.base': 'SKU must be a valid text value',
    }),

  isFeatured: Joi.boolean()
    .optional()
    .messages({
      'boolean.base': 'isFeatured must be true or false',
    }),
})
  .unknown(true) // Allow extra fields from FormData (files, etc.)
  .min(1) // At least one field must be provided
  .messages({
    'object.min': 'At least one field must be provided for update',
  });

/**
 * Search Query Schema
 * Validates search parameters
 */
const searchProductSchema = Joi.object({
  q: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required()
    .messages({
      'string.empty': 'Search term is required',
      'string.min': 'Search term must be at least 2 characters',
      'string.max': 'Search term cannot exceed 100 characters',
      'any.required': 'Search term (q parameter) is required',
    }),

  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a valid number',
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a valid number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),
});

/**
 * Pagination Query Schema
 * Validates pagination parameters used in various endpoints
 */
const paginationSchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .optional()
    .default(1)
    .messages({
      'number.base': 'Page must be a valid number',
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .optional()
    .default(10)
    .messages({
      'number.base': 'Limit must be a valid number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100 items',
    }),

  status: Joi.string()
    .lowercase()
    .valid('active', 'inactive', 'out_of_stock')
    .optional()
    .messages({
      'any.only': 'Status must be active, inactive, or out_of_stock',
    }),

  category: Joi.string()
    .trim()
    .lowercase()
    .optional(),

  sort: Joi.string()
    .pattern(/^-?[a-zA-Z]+$/)
    .optional()
    .default('-createdAt')
    .messages({
      'string.pattern.base': 'Invalid sort format',
    }),
});

/**
 * Update Stock Schema
 * Validates product stock update operations
 */
const updateStockSchema = Joi.object({
  quantity: Joi.number()
    .integer()
    .positive()
    .required()
    .messages({
      'number.base': 'Quantity must be a valid number',
      'number.integer': 'Quantity must be a whole number',
      'number.positive': 'Quantity must be a positive number',
      'any.required': 'Quantity is required',
    }),

  operation: Joi.string()
    .valid('increment', 'decrement')
    .required()
    .messages({
      'any.only': "Operation must be 'increment' or 'decrement'",
      'any.required': 'Operation is required',
    }),
});

/**
 * Validation middleware generator
 * Creates middleware for validating request data against a schema
 */
const validateProduct = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // Validate all fields, not just the first error
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.path[0]] = detail.message;
      });

      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Validation error',
        errors,
      });
    }

    // Replace request data with validated data
    req[source] = value;
    next();
  };
};

module.exports = {
  createProductSchema,
  updateProductSchema,
  searchProductSchema,
  paginationSchema,
  updateStockSchema,
  validateProduct,
};
