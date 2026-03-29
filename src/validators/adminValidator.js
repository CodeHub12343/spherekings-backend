/**
 * ============================================================================
 * ADMIN VALIDATOR - Joi Validation Schemas and Middleware
 * ============================================================================
 *
 * Provides request validation for admin endpoints using Joi.
 * Includes pagination, filtering, sorting, and date range validation.
 *
 * ============================================================================
 */

const Joi = require('joi');

/**
 * Validation schemas
 */
const adminQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(20),
  sortBy: Joi.string().optional(),
  order: Joi.string().valid('asc', 'desc').default('asc')
});

const ordersQuerySchema = adminQuerySchema.keys({
  status: Joi.string().valid('pending', 'completed', 'failed').optional(),
  affiliateId: Joi.string().optional(),
  userId: Joi.string().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional()
});

const productsQuerySchema = adminQuerySchema.keys({
  status: Joi.string().valid('active', 'inactive').optional(),
  category: Joi.string().optional(),
  search: Joi.string().max(100).optional()
});

const affiliatesQuerySchema = adminQuerySchema.keys({
  status: Joi.string().valid('active', 'inactive', 'suspended').optional(),
  search: Joi.string().max(100).optional()
});

const commissionsQuerySchema = adminQuerySchema.keys({
  status: Joi.string().valid('pending', 'approved', 'paid', 'reversed').optional(),
  affiliateId: Joi.string().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional()
});

const payoutsQuerySchema = adminQuerySchema.keys({
  status: Joi.string().valid('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled').optional(),
  affiliateId: Joi.string().optional(),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional()
});

const revenueQuerySchema = Joi.object({
  groupBy: Joi.string().valid('day', 'week', 'month').default('day'),
  dateFrom: Joi.date().iso().optional(),
  dateTo: Joi.date().iso().optional()
});

const topEntitiesQuerySchema = Joi.object({
  limit: Joi.number().integer().min(1).max(50).default(10)
});

const affiliateIdParamSchema = Joi.object({
  affiliateId: Joi.string().required()
});

/**
 * Validation error formatter
 */
const formatValidationError = (error) => {
  const details = error.details.map((detail) => ({
    field: detail.path.join('.'),
    message: detail.message
  }));

  return {
    success: false,
    error: 'Validation Error',
    details
  };
};

/**
 * Middleware functions
 */

const validateOrdersQuery = (req, res, next) => {
  const { error, value } = ordersQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

const validateProductsQuery = (req, res, next) => {
  const { error, value } = productsQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

const validateAffiliatesQuery = (req, res, next) => {
  const { error, value } = affiliatesQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

const validateCommissionsQuery = (req, res, next) => {
  const { error, value } = commissionsQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

const validatePayoutsQuery = (req, res, next) => {
  const { error, value } = payoutsQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

const validateRevenueQuery = (req, res, next) => {
  const { error, value } = revenueQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

const validateTopEntitiesQuery = (req, res, next) => {
  const { error, value } = topEntitiesQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedQuery = value;
  next();
};

const validateAffiliateIdParam = (req, res, next) => {
  const { error, value } = affiliateIdParamSchema.validate(req.params, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    return res.status(400).json(formatValidationError(error));
  }

  req.validatedParams = value;
  next();
};

/**
 * Export validation middleware
 */
module.exports = {
  validateOrdersQuery,
  validateProductsQuery,
  validateAffiliatesQuery,
  validateCommissionsQuery,
  validatePayoutsQuery,
  validateRevenueQuery,
  validateTopEntitiesQuery,
  validateAffiliateIdParam
};
