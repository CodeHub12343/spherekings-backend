/**
 * Order Validators
 * Joi validation schemas for order API requests
 */

const Joi = require('joi');

/**
 * Schema for retrieving user's orders with filtering and pagination
 */
const userOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  status: Joi.string()
    .valid(
      'pending',
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned'
    ),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded'),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional(),
  minAmount: Joi.number().min(0).optional(),
  maxAmount: Joi.number().min(0).optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'total', 'status', 'orderNumber')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
})
  .unknown(false)
  .messages({
    'number.base': '{#label} must be a number',
    'number.min': '{#label} must be at least {#limit}',
    'number.max': '{#label} cannot exceed {#limit}',
    'string.isoDate': '{#label} must be a valid ISO date',
    'any.only': '{#label} must be one of {#valids}',
  });

/**
 * Schema for admin orders query with additional filters
 */
const adminOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  status: Joi.string()
    .valid(
      'pending',
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned'
    ),
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded'),
  userId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  affiliateId: Joi.string().pattern(/^[0-9a-fA-F]{24}$/).optional(),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional(),
  search: Joi.string().max(100).optional(),
  sortBy: Joi.string()
    .valid('createdAt', 'total', 'status', 'orderNumber', 'userId')
    .default('createdAt'),
  sortOrder: Joi.string().valid('asc', 'desc').default('desc'),
})
  .unknown(false)
  .messages({
    'string.pattern.base': '{#label} must be a valid MongoDB ObjectId',
    'string.isoDate': '{#label} must be a valid ISO date',
  });

/**
 * Schema for updating order status
 */
const updateOrderStatusSchema = Joi.object({
  status: Joi.string()
    .required()
    .valid(
      'pending',
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned',
      'complete'
    )
    .messages({
      'any.required': 'Status is required',
      'any.only': 'Invalid status value',
    }),
  reason: Joi.string().max(500).optional().allow('').messages({
    'string.max': 'Reason cannot exceed 500 characters',
  }),
})
  .unknown(false)
  .messages({
    'object.unknown': 'Unknown field: {#unknownMark}',
  });

/**
 * Schema for order search request
 */
const searchOrdersSchema = Joi.object({
  orderNumber: Joi.string().max(50).optional(),
  status: Joi.string()
    .valid(
      'pending',
      'processing',
      'confirmed',
      'shipped',
      'delivered',
      'cancelled',
      'refunded',
      'returned'
    )
    .optional(),
  dateFrom: Joi.string().isoDate().optional(),
  dateTo: Joi.string().isoDate().optional(),
  minAmount: Joi.number().min(0).optional(),
  maxAmount: Joi.number().min(0).optional(),
})
  .unknown(false);

/**
 * Middleware generator for validating request data
 *
 * Usage:
 *   router.get('/orders', validateOrder(userOrdersQuerySchema, 'query'), controller);
 *   router.put('/orders/:id/status', validateOrder(updateStatusSchema, 'body'), controller);
 *
 * @param {Joi.Schema} schema - Joi validation schema
 * @param {string} source - Data source ('query', 'body', 'params')
 * @returns {Function} Express middleware
 */
function validateOrder(schema, source = 'query') {
  return (req, res, next) => {
    const dataToValidate = req[source];

    // Validate using Joi schema
    const { error, value } = schema.validate(dataToValidate, {
      abortEarly: false, // Collect all errors
      convert: true, // Attempt type conversion
      stripUnknown: true, // Remove unknown fields
    });

    if (error) {
      // Format validation errors
      const errors = {};
      error.details.forEach((detail) => {
        errors[detail.context.label] = detail.message;
      });

      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Validation error',
        errors,
      });
    }

    // Update request with validated/converted data
    if (source === 'query') {
      req.query = value;
    } else if (source === 'body') {
      req.body = value;
    } else if (source === 'params') {
      req.params = value;
    }

    next();
  };
}

module.exports = {
  validateOrder,
  userOrdersQuerySchema,
  adminOrdersQuerySchema,
  updateOrderStatusSchema,
  searchOrdersSchema,
};
