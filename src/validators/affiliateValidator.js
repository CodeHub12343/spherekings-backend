/**
 * Affiliate Validation Schemas
 * Joi schemas for request validation
 */

const Joi = require('joi');

/**
 * Affiliate registration schema
 * POST /api/affiliate/register
 */
const registerAffiliateSchema = Joi.object({
  termsAccepted: Joi.boolean().required().messages({
    'any.required': 'You must accept the affiliate terms and conditions',
    'boolean.base': 'termsAccepted must be a boolean',
  }),
  commissionRate: Joi.number().integer().min(0).max(100).optional().messages({
    'number.base': 'commissionRate must be a number',
    'number.min': 'commissionRate must be at least 0',
    'number.max': 'commissionRate cannot exceed 100',
  }),
  marketingChannels: Joi.string().required().max(1000).messages({
    'any.required': 'Please tell us where you will promote us',
    'string.base': 'Marketing channels must be text',
    'string.max': 'Marketing channels description cannot exceed 1000 characters',
  }),
  website: Joi.string()
    .optional()
    .allow('')
    .max(500)
    .messages({
      'string.base': 'Website must be text',
      'string.max': 'Website URL cannot exceed 500 characters',
    }),
  expectedMonthlyReferrals: Joi.number()
    .integer()
    .min(0)
    .optional()
    .default(0)
    .messages({
      'number.base': 'Expected monthly referrals must be a number',
      'number.min': 'Expected monthly referrals cannot be negative',
    }),
});

/**
 * Query parameters for affiliate dashboard
 * GET /api/affiliate/dashboard
 */
const dashboardQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'startDate must be a valid ISO date',
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': 'endDate must be a valid ISO date',
  }),
});

/**
 * Query parameters for affiliate referrals
 * GET /api/affiliate/referrals
 */
const referralsQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'page must be a number',
    'number.min': 'page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'limit must be a number',
    'number.min': 'limit must be at least 1',
    'number.max': 'limit cannot exceed 100',
  }),
  convertedOnly: Joi.boolean().optional().messages({
    'boolean.base': 'convertedOnly must be a boolean',
  }),
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'startDate must be a valid ISO date',
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': 'endDate must be a valid ISO date',
  }),
});

/**
 * Query parameters for affiliate sales
 * GET /api/affiliate/sales
 */
const salesQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1).messages({
    'number.base': 'page must be a number',
    'number.min': 'page must be at least 1',
  }),
  limit: Joi.number().integer().min(1).max(100).default(20).messages({
    'number.base': 'limit must be a number',
    'number.min': 'limit must be at least 1',
    'number.max': 'limit cannot exceed 100',
  }),
  status: Joi.string()
    .valid('pending', 'approved', 'paid', 'reversed')
    .optional()
    .messages({
      'any.only': 'status must be one of: pending, approved, paid, reversed',
    }),
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'startDate must be a valid ISO date',
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': 'endDate must be a valid ISO date',
  }),
}).unknown(false); // Reject unknown fields

/**
 * Query parameters for affiliate analytics
 * GET /api/affiliate/analytics
 */
const analyticsQuerySchema = Joi.object({
  startDate: Joi.date().iso().optional().messages({
    'date.base': 'startDate must be a valid ISO date',
  }),
  endDate: Joi.date().iso().optional().messages({
    'date.base': 'endDate must be a valid ISO date',
  }),
});

/**
 * Payout settings schema
 * POST /api/affiliate/payout-settings
 */
const payoutSettingsSchema = Joi.object({
  payoutMethod: Joi.string()
    .required()
    .valid('stripe', 'bank_transfer', 'paypal', 'none')
    .messages({
      'any.required': 'payoutMethod is required',
      'any.only': 'payoutMethod must be one of: stripe, bank_transfer, paypal, none',
    }),
  payoutData: Joi.when('payoutMethod', {
    is: Joi.string().valid('stripe', 'bank_transfer', 'paypal'),
    then: Joi.string().required().messages({
      'any.required': 'payoutData is required for the selected payout method',
    }),
    otherwise: Joi.optional(),
  }),
  minimumThreshold: Joi.number()
    .positive()
    .max(10000)
    .optional()
    .messages({
      'number.positive': 'minimumThreshold must be greater than 0',
      'number.max': 'minimumThreshold cannot exceed 10000',
    }),
});

/**
 * Referral click tracking schema
 * GET /api/tracking/click?ref=CODE
 */
const referralClickSchema = Joi.object({
  ref: Joi.string().required().max(20).messages({
    'string.required': 'Affiliate code is required',
    'string.max': 'Affiliate code format invalid',
  }),
}).unknown(true); // Allow other query params (utm_*, etc.)

/**
 * Top affiliates leaderboard query schema
 * GET /api/leaderboard/affiliates
 */
const leaderboardQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10).messages({
    'number.base': 'limit must be a number',
    'number.min': 'limit must be at least 1',
    'number.max': 'limit cannot exceed 50',
  }),
  sortBy: Joi.string()
    .valid('totalEarnings', 'totalSales', 'totalClicks')
    .default('totalEarnings')
    .messages({
      'any.only': 'sortBy must be one of: totalEarnings, totalSales, totalClicks',
    }),
});

/**
 * Suspend affiliate schema
 * POST /api/admin/affiliate/:affiliateId/suspend
 */
const suspendAffiliateSchema = Joi.object({
  reason: Joi.string().max(500).optional().messages({
    'string.max': 'Reason cannot exceed 500 characters',
  }),
});

/**
 * Generic middleware to validate request data
 * Applies schema to query, body, or params
 *
 * Usage:
 *   router.get('/endpoint', validateAffiliate(dashboardQuerySchema, 'query'), controller.handler)
 *   router.post('/endpoint', validateAffiliate(registerAffiliateSchema, 'body'), controller.handler)
 */
const validateAffiliate = (schema, source = 'body') => {
  return (req, res, next) => {
    const data = req[source];

    const { error, value } = schema.validate(data, {
      abortEarly: false, // Collect all errors
      stripUnknown: true, // Remove unknown fields
      convert: true, // Convert types
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message,
      }));

      return res.status(400).json({
        success: false,
        statusCode: 400,
        message: 'Validation error',
        errors,
      });
    }

    // Update request with validated data
    req[source] = value;
    next();
  };
};

module.exports = {
  registerAffiliateSchema,
  dashboardQuerySchema,
  referralsQuerySchema,
  salesQuerySchema,
  analyticsQuerySchema,
  payoutSettingsSchema,
  referralClickSchema,
  leaderboardQuerySchema,
  suspendAffiliateSchema,
  validateAffiliate,
};
