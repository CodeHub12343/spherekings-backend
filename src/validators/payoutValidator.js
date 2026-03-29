/**
 * Payout Validator
 * Joi validation schemas and middleware for payout APIs
 */

const Joi = require('joi');

/**
 * ==================== SCHEMAS ====================
 */

/**
 * Payout Request Schema
 * Validates affiliate payout request submission
 */
const payoutRequestSchema = Joi.object({
  amount: Joi.number()
    .required()
    .positive()
    .precision(2)
    .messages({
      'number.base': 'Amount must be a number',
      'any.required': 'Amount is required',
      'number.positive': 'Amount must be positive'
    }),

  method: Joi.string()
    .valid('bank_transfer', 'paypal', 'stripe', 'cryptocurrency', 'manual')
    .required()
    .messages({
      'any.required': 'Payment method is required',
      'any.only': 'Invalid payment method'
    }),

  beneficiary: Joi.object()
    .required()
    .messages({
      'any.required': 'Beneficiary payment details are required'
    }),

  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
}).unknown(false);

/**
 * Approval Notes Schema
 * Validates admin approval request
 */
const approvalNotesSchema = Joi.object({
  notes: Joi.string()
    .max(1000)
    .optional()
    .allow('')
}).unknown(false);

/**
 * Rejection Reason Schema
 * Validates payout rejection/cancellation
 */
const rejectionReasonSchema = Joi.object({
  reason: Joi.string()
    .valid(
      'insufficient_funds',
      'invalid_details',
      'fraud_flag',
      'system_error',
      'admin_discretion'
    )
    .required()
    .messages({
      'any.required': 'Rejection reason is required',
      'any.only': 'Invalid rejection reason'
    }),

  details: Joi.string()
    .max(1000)
    .optional()
    .allow('')
}).unknown(false);

/**
 * Payout Query Schema
 * Validates filtering and pagination parameters
 */
const payoutQuerySchema = Joi.object({
  page: Joi.number()
    .integer()
    .min(1)
    .default(1),

  limit: Joi.number()
    .integer()
    .min(1)
    .max(100)
    .default(20),

  status: Joi.string()
    .valid('pending', 'approved', 'processing', 'completed', 'failed', 'cancelled')
    .optional(),

  dateFrom: Joi.date()
    .iso()
    .optional(),

  dateTo: Joi.date()
    .iso()
    .optional()
}).with('dateFrom', 'dateTo');

/**
 * Stripe Connect Payout Schema
 * Validates Stripe payout processing
 */
const stripeConnectPayoutSchema = Joi.object({
  stripeConnectId: Joi.string()
    .regex(/^acct_/)
    .required()
    .messages({
      'string.pattern.base': 'Invalid Stripe Connect account ID',
      'any.required': 'Stripe Connect ID is required'
    })
}).unknown(false);

/**
 * Batch Approve Schema
 * Validates batch approval request
 */
const batchApproveSchema = Joi.object({
  payoutIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .max(500)
    .required()
    .messages({
      'array.min': 'At least one payout ID is required',
      'array.max': 'Cannot approve more than 500 payouts at once',
      'any.required': 'payoutIds is required'
    }),

  notes: Joi.string()
    .max(1000)
    .optional()
    .allow('')
}).unknown(false);

/**
 * Batch Process Schema
 * Validates batch processing request
 */
const batchProcessSchema = Joi.object({
  payoutIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .max(500)
    .required()
    .messages({
      'array.min': 'At least one payout ID is required',
      'array.max': 'Cannot process more than 500 payouts at once',
      'any.required': 'payoutIds is required'
    }),

  stripeConnectId: Joi.string()
    .regex(/^acct_/)
    .optional()
    .messages({
      'string.pattern.base': 'Invalid Stripe Connect account ID'
    })
}).unknown(false);

/**
 * ==================== VALIDATION MIDDLEWARE ====================
 */

/**
 * Validate payout request
 */
const validatePayoutRequest = (req, res, next) => {
  const { error, value } = payoutRequestSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate approval notes
 */
const validateApprovalNotes = (req, res, next) => {
  const { error, value } = approvalNotesSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate rejection reason
 */
const validateRejectionReason = (req, res, next) => {
  const { error, value } = rejectionReasonSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate payout query parameters
 */
const validatePayoutQuery = (req, res, next) => {
  const { error, value } = payoutQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  req.query = value;
  next();
};

/**
 * Validate Stripe payout
 */
const validateStripeConnectPayout = (req, res, next) => {
  const { error, value } = stripeConnectPayoutSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate batch approve
 */
const validateBatchApprove = (req, res, next) => {
  const { error, value } = batchApproveSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  req.body = value;
  next();
};

/**
 * Validate batch process
 */
const validateBatchProcess = (req, res, next) => {
  const { error, value } = batchProcessSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const messages = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));

    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: messages
    });
  }

  req.body = value;
  next();
};

module.exports = {
  // Schemas
  payoutRequestSchema,
  approvalNotesSchema,
  rejectionReasonSchema,
  payoutQuerySchema,
  stripeConnectPayoutSchema,
  batchApproveSchema,
  batchProcessSchema,

  // Middleware
  validatePayoutRequest,
  validateApprovalNotes,
  validateRejectionReason,
  validatePayoutQuery,
  validateStripeConnectPayout,
  validateBatchApprove,
  validateBatchProcess
};
