/**
 * ============================================================================
 * COUPON VALIDATOR - Joi Validation Schemas and Middleware
 * ============================================================================
 *
 * Provides request validation for coupon endpoints using Joi.
 * Follows the same pattern as adminValidator.js.
 *
 * ============================================================================
 */

const Joi = require('joi');

// ==================== Schemas ====================

/**
 * Schema for creating a new coupon (admin)
 */
const createCouponSchema = Joi.object({
  code: Joi.string()
    .trim()
    .uppercase()
    .min(3)
    .max(30)
    .pattern(/^[A-Z0-9_-]+$/)
    .required()
    .messages({
      'string.pattern.base': 'Code must only contain letters, numbers, underscores, and hyphens',
      'string.min': 'Code must be at least 3 characters',
      'string.max': 'Code must be at most 30 characters',
      'any.required': 'Coupon code is required',
    }),
  description: Joi.string().trim().max(200).optional().allow(''),
  discountType: Joi.string()
    .valid('percentage', 'flat')
    .required()
    .messages({
      'any.only': 'Discount type must be either "percentage" or "flat"',
      'any.required': 'Discount type is required',
    }),
  discountValue: Joi.number()
    .positive()
    .required()
    .when('discountType', {
      is: 'percentage',
      then: Joi.number().max(100).messages({
        'number.max': 'Percentage discount cannot exceed 100%',
      }),
    })
    .messages({
      'number.positive': 'Discount value must be greater than 0',
      'any.required': 'Discount value is required',
    }),
  minimumOrderValue: Joi.number().min(0).default(0),
  maxUses: Joi.number().integer().min(0).default(0),
  maxUsesPerUser: Joi.number().integer().min(0).default(1),
  isActive: Joi.boolean().default(true),
  expiryDate: Joi.date().iso().min('now').optional().allow(null).messages({
    'date.min': 'Expiry date must be in the future',
  }),
  appliesTo: Joi.string().trim().max(100).default('all'),
  salesChannel: Joi.string().trim().max(50).optional().allow(''),
});

/**
 * Schema for updating an existing coupon (admin)
 */
const updateCouponSchema = Joi.object({
  description: Joi.string().trim().max(200).optional().allow(''),
  discountType: Joi.string().valid('percentage', 'flat').optional(),
  discountValue: Joi.number().positive().optional(),
  minimumOrderValue: Joi.number().min(0).optional(),
  maxUses: Joi.number().integer().min(0).optional(),
  maxUsesPerUser: Joi.number().integer().min(0).optional(),
  isActive: Joi.boolean().optional(),
  expiryDate: Joi.date().iso().optional().allow(null),
  appliesTo: Joi.string().trim().max(100).optional(),
  salesChannel: Joi.string().trim().max(50).optional().allow(''),
}).min(1).messages({
  'object.min': 'At least one field must be provided for update',
});

/**
 * Schema for validating a coupon code (customer-facing)
 */
const validateCouponCodeSchema = Joi.object({
  code: Joi.string().trim().uppercase().min(3).max(30).required().messages({
    'any.required': 'Coupon code is required',
  }),
  cartSubtotal: Joi.number().positive().required().messages({
    'number.positive': 'Cart subtotal must be greater than 0',
    'any.required': 'Cart subtotal is required',
  }),
});

/**
 * Schema for listing coupons with pagination/filtering (admin)
 */
const couponQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  isActive: Joi.boolean().optional(),
  salesChannel: Joi.string().trim().max(50).optional(),
  search: Joi.string().trim().max(100).optional(),
  sortBy: Joi.string().valid('createdAt', 'code', 'usageCount', 'discountValue').default('createdAt'),
  order: Joi.string().valid('asc', 'desc').default('desc'),
});

// ==================== Validation Error Formatter ====================

const formatValidationError = (error) => {
  const details = error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message,
  }));

  return {
    success: false,
    error: 'Validation Error',
    details,
  };
};

// ==================== Middleware Functions ====================

/**
 * Validate create coupon request body
 */
const validateCreateCoupon = (req, res, next) => {
  const { error, value } = createCouponSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedBody = value;
  next();
};

/**
 * Validate update coupon request body
 */
const validateUpdateCoupon = (req, res, next) => {
  const { error, value } = updateCouponSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedBody = value;
  next();
};

/**
 * Validate coupon code + cart subtotal (customer-facing validation)
 */
const validateCouponCode = (req, res, next) => {
  const { error, value } = validateCouponCodeSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedBody = value;
  next();
};

/**
 * Validate coupon list query parameters
 */
const validateCouponQuery = (req, res, next) => {
  const { error, value } = couponQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

// ==================== Exports ====================

module.exports = {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponCode,
  validateCouponQuery,
};
