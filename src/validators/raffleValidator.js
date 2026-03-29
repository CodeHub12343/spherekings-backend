/**
 * Raffle Validators
 * Input validation for raffle entry submissions
 * Uses Joi for schema validation
 */

const Joi = require('joi');

/**
 * Validate raffle entry submission
 * Used when user submits the entry form before payment
 */
const validateRaffleEntry = (data) => {
  const schema = Joi.object({
    fullName: Joi.string()
      .required()
      .min(2)
      .max(100)
      .trim()
      .messages({
        'string.empty': 'Full name is required',
        'string.min': 'Full name must be at least 2 characters',
        'string.max': 'Full name cannot exceed 100 characters',
      }),

    email: Joi.string()
      .email()
      .required()
      .lowercase()
      .messages({
        'string.email': 'Valid email address is required',
        'string.empty': 'Email is required',
      }),

    phone: Joi.string()
      .optional()
      .allow('')
      .trim()
      .messages({
        'string.phone': 'Invalid phone number format',
      }),

    shippingAddress: Joi.object({
      street: Joi.string()
        .required()
        .min(5)
        .max(200)
        .trim()
        .messages({
          'string.empty': 'Street address is required',
          'string.min': 'Street address must be at least 5 characters',
        }),

      city: Joi.string()
        .required()
        .min(2)
        .max(100)
        .trim()
        .messages({
          'string.empty': 'City is required',
          'string.min': 'City is required',
        }),

      state: Joi.string()
        .required()
        .min(2)
        .max(100)
        .trim()
        .messages({
          'string.empty': 'State is required',
        }),

      zipCode: Joi.string()
        .required()
        .min(3)
        .max(20)
        .trim()
        .messages({
          'string.empty': 'ZIP code is required',
          'string.min': 'ZIP code is required',
        }),

      country: Joi.string()
        .required()
        .min(2)
        .max(100)
        .trim()
        .messages({
          'string.empty': 'Country is required',
        }),
    })
      .required()
      .messages({
        'any.required': 'Complete shipping address is required',
      }),

    paymentMethod: Joi.string()
      .optional()
      .valid('stripe', 'wise', 'sendwave', 'western_union', 'worldremit')
      .messages({
        'any.only': 'Payment method must be one of: stripe, wise, sendwave, western_union, worldremit',
      }),
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

/**
 * Validate raffle entry for admin winner selection
 */
const validateWinnerSelection = (data) => {
  const schema = Joi.object({
    cycleId: Joi.string()
      .required()
      .messages({
        'string.empty': 'Cycle ID is required',
      }),
  });

  return schema.validate(data, {
    abortEarly: false,
    stripUnknown: true,
  });
};

module.exports = {
  validateRaffleEntry,
  validateWinnerSelection,
};
