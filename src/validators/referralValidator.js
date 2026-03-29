/**
 * Referral Tracking Validator
 * Joi validation schemas for referral tracking endpoints
 */

const Joi = require('joi');

/**
 * Validate affiliate code in referral link
 * GET /api/ref/:affiliateCode
 */
const trackReferralSchema = Joi.object({
  affiliateCode: Joi.string()
    .required()
    .uppercase()
    .alphanum()
    .min(8)
    .max(14)
    .messages({
      'string.required': 'Affiliate code is required',
      'string.alphanum': 'Affiliate code must contain only letters and numbers',
      'string.min': 'Affiliate code must be at least 8 characters',
      'string.max': 'Affiliate code must not exceed 14 characters',
    }),

  redirect: Joi.string()
    .optional()
    .default('/')
    .pattern(/^(\/|https?:\/\/)/)
    .messages({
      'string.pattern.base': 'Redirect must be a valid path (starting with /) or URL (http:// or https://)',
    }),

  utm_campaign: Joi.string().optional().max(100),
  utm_medium: Joi.string().optional().max(100),
  utm_source: Joi.string().optional().max(100),
  utm_content: Joi.string().optional().max(100),
});

/**
 * Validate referral statistics request
 * GET /api/tracking/stats/:affiliateId
 */
const referralStatsSchema = Joi.object({
  affiliateId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/) // MongoDB ObjectId
    .messages({
      'string.required': 'Affiliate ID is required',
      'string.regex.base': 'Invalid affiliate ID format',
    }),

  dateFrom: Joi.date()
    .optional()
    .iso()
    .messages({
      'date.base': 'Date from must be a valid ISO date',
    }),

  dateTo: Joi.date()
    .optional()
    .iso()
    .min(Joi.ref('dateFrom'))
    .messages({
      'date.base': 'Date to must be a valid ISO date',
      'date.min': 'Date to must be after date from',
    }),
});

/**
 * Validate referral clicks list request
 * GET /api/tracking/referrals/:affiliateId
 */
const referralsListSchema = Joi.object({
  affiliateId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.required': 'Affiliate ID is required',
      'string.regex.base': 'Invalid affiliate ID format',
    }),

  page: Joi.number()
    .optional()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .optional()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

  convertedOnly: Joi.boolean()
    .optional()
    .default(false)
    .messages({
      'boolean.base': 'Converted only must be true or false',
    }),

  dateFrom: Joi.date()
    .optional()
    .iso()
    .messages({
      'date.base': 'Date from must be a valid ISO date',
    }),

  dateTo: Joi.date()
    .optional()
    .iso()
    .min(Joi.ref('dateFrom'))
    .messages({
      'date.base': 'Date to must be a valid ISO date',
      'date.min': 'Date to must be after date from',
    }),
});

/**
 * Validate referral sales list request
 * GET /api/tracking/sales/:affiliateId
 */
const salesListSchema = Joi.object({
  affiliateId: Joi.string()
    .required()
    .regex(/^[0-9a-fA-F]{24}$/)
    .messages({
      'string.required': 'Affiliate ID is required',
      'string.regex.base': 'Invalid affiliate ID format',
    }),

  page: Joi.number()
    .optional()
    .integer()
    .min(1)
    .default(1)
    .messages({
      'number.base': 'Page must be a number',
      'number.min': 'Page must be at least 1',
    }),

  limit: Joi.number()
    .optional()
    .integer()
    .min(1)
    .max(100)
    .default(20)
    .messages({
      'number.base': 'Limit must be a number',
      'number.min': 'Limit must be at least 1',
      'number.max': 'Limit cannot exceed 100',
    }),

  dateFrom: Joi.date()
    .optional()
    .iso()
    .messages({
      'date.base': 'Date from must be a valid ISO date',
    }),

  dateTo: Joi.date()
    .optional()
    .iso()
    .min(Joi.ref('dateFrom'))
    .messages({
      'date.base': 'Date to must be a valid ISO date',
      'date.min': 'Date to must be after date from',
    }),
});

/**
 * Middleware: Validate referral tracking request
 * Used for GET /api/ref/:affiliateCode
 */
const validateTrackReferral = (req, res, next) => {
  // Merge params and query
  const toValidate = {
    affiliateCode: req.params.affiliateCode,
    ...req.query,
  };

  const { error, value } = trackReferralSchema.validate(toValidate, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  // Attach validated data to request
  req.validatedData = value;
  next();
};

/**
 * Middleware: Validate referral statistics request
 * Used for GET /api/tracking/stats/:affiliateId
 */
const validateReferralStats = (req, res, next) => {
  // Merge params and query
  const toValidate = {
    affiliateId: req.params.affiliateId,
    ...req.query,
  };

  const { error, value } = referralStatsSchema.validate(toValidate, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Middleware: Validate referrals list request
 * Used for GET /api/tracking/referrals/:affiliateId
 */
const validateReferralsList = (req, res, next) => {
  // Merge params and query
  const toValidate = {
    affiliateId: req.params.affiliateId,
    ...req.query,
  };

  const { error, value } = referralsListSchema.validate(toValidate, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validatedData = value;
  next();
};

/**
 * Middleware: Validate sales list request
 * Used for GET /api/tracking/sales/:affiliateId
 */
const validateSalesList = (req, res, next) => {
  // Merge params and query
  const toValidate = {
    affiliateId: req.params.affiliateId,
    ...req.query,
  };

  const { error, value } = salesListSchema.validate(toValidate, {
    abortEarly: false,
    stripUnknown: true,
  });

  if (error) {
    const errors = {};
    error.details.forEach((detail) => {
      errors[detail.path[0]] = detail.message;
    });
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors,
    });
  }

  req.validatedData = value;
  next();
};

module.exports = {
  trackReferralSchema,
  referralStatsSchema,
  referralsListSchema,
  salesListSchema,
  validateTrackReferral,
  validateReferralStats,
  validateReferralsList,
  validateSalesList,
};
