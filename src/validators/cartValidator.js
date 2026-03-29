/**
 * Cart Validation Schemas
 * Uses Joi for input validation of cart request data
 * Validates add-to-cart, update, and remove operations
 */

const Joi = require('joi');

/**
 * Variant schema for cart operations
 * Flexible to support any variant type
 */
const variantSchema = Joi.object().pattern(
  Joi.string().min(1).max(50), // variant name
  Joi.string().min(1).max(100) // variant value
);

/**
 * Add to Cart Schema
 * Validates product ID, quantity, and optional variant
 */
const addToCartSchema = Joi.object({
  productId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Product ID must be a valid MongoDB ObjectId',
      'any.required': 'Product ID is required',
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .required()
    .messages({
      'number.base': 'Quantity must be a valid number',
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Quantity cannot exceed 1000',
      'any.required': 'Quantity is required',
    }),

  variant: variantSchema
    .default({})
    .optional()
    .messages({
      'object.base': 'Variant must be an object',
    }),
})
  .unknown(false)
  .required();

/**
 * Update Cart Item Schema
 * Validates optional quantity and variant updates
 */
const updateCartItemSchema = Joi.object({
  cartItemId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Cart item ID must be a valid MongoDB ObjectId',
      'any.required': 'Cart item ID is required',
    }),

  quantity: Joi.number()
    .integer()
    .min(1)
    .max(1000)
    .optional()
    .messages({
      'number.base': 'Quantity must be a valid number',
      'number.integer': 'Quantity must be a whole number',
      'number.min': 'Quantity must be at least 1',
      'number.max': 'Quantity cannot exceed 1000',
    }),

  variant: variantSchema
    .optional()
    .messages({
      'object.base': 'Variant must be an object',
    }),
})
  .unknown(false)
  .min(2) // At least cartItemId and one of quantity/variant
  .messages({
    'object.min': 'Provide at least quantity or variant to update',
  });

/**
 * Remove from Cart Schema
 * Validates cart item ID for removal
 */
const removeFromCartSchema = Joi.object({
  cartItemId: Joi.string()
    .regex(/^[0-9a-fA-F]{24}$/)
    .required()
    .messages({
      'string.pattern.base': 'Cart item ID must be a valid MongoDB ObjectId',
      'any.required': 'Cart item ID is required',
    }),
})
  .unknown(false)
  .required();

/**
 * Validation middleware generator
 * Creates middleware for validating request data against a schema
 */
const validateCart = (schema, source = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[source], {
      abortEarly: false, // Validate all fields, not just first error
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
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
  validateCart,
};
