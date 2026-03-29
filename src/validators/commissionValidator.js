/**
 * Commission Validator
 * Joi schemas and validation middleware for commission API endpoints
 */

const Joi = require('joi');

/**
 * ==================== SCHEMAS ====================
 */

/**
 * Commission Query Schema
 * Validates filtering and pagination parameters
 */
const commissionQuerySchema = Joi.object({
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
    .valid('pending', 'approved', 'paid', 'reversed')
    .optional(),
  
  dateFrom: Joi.date()
    .iso()
    .optional(),
  
  dateTo: Joi.date()
    .iso()
    .optional(),
  
  fraudOnly: Joi.boolean()
    .optional()
}).with('dateFrom', 'dateTo');

/**
 * Commission Approval Schema
 * Validates commission approval request body
 *
 * Required: None
 * Optional: notes
 */
const commissionApprovalSchema = Joi.object({
  notes: Joi.string()
    .max(500)
    .optional()
    .allow('')
}).unknown(false);

/**
 * Commission Payment Schema
 * Validates mark-as-paid request body
 *
 * Required: method, transactionId
 * Optional: receiptId
 */
const commissionPaymentSchema = Joi.object({
  method: Joi.string()
    .valid('stripe', 'paypal', 'bank_transfer', 'cryptocurrency', 'manual')
    .required()
    .messages({
      'string.base': 'Payment method must be a string',
      'any.required': 'Payment method is required',
      'any.only': 'Payment method must be one of: stripe, paypal, bank_transfer, cryptocurrency, manual'
    }),
  
  transactionId: Joi.string()
    .required()
    .trim()
    .min(3)
    .max(100)
    .messages({
      'string.base': 'Transaction ID must be a string',
      'any.required': 'Transaction ID is required',
      'string.min': 'Transaction ID must be at least 3 characters'
    }),
  
  receiptId: Joi.string()
    .optional()
    .trim()
    .max(100)
    .allow('')
}).unknown(false);

/**
 * Commission Reversal Schema
 * Validates commission reversal request body
 *
 * Required: reason
 * Optional: details, amount
 */
const commissionReversalSchema = Joi.object({
  reason: Joi.string()
    .valid('refund', 'chargeback', 'fraud', 'order_issue', 'affiliate_request', 'other')
    .required()
    .messages({
      'any.required': 'Reversal reason is required',
      'any.only': 'Reason must be one of: refund, chargeback, fraud, order_issue, affiliate_request, other'
    }),
  
  details: Joi.string()
    .optional()
    .max(1000)
    .allow(''),
  
  amount: Joi.number()
    .optional()
    .positive()
    .messages({
      'number.base': 'Amount must be a number',
      'number.positive': 'Amount must be positive'
    })
}).unknown(false);

/**
 * Batch Approval Schema
 * Validates batch approval request body
 *
 * Required: commissionIds (array)
 * Optional: notes
 */
const batchApprovalSchema = Joi.object({
  commissionIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .max(500)
    .required()
    .messages({
      'array.base': 'commissionIds must be an array',
      'array.min': 'At least one commission ID is required',
      'array.max': 'Cannot approve more than 500 commissions at once',
      'any.required': 'commissionIds is required'
    }),
  
  notes: Joi.string()
    .optional()
    .max(500)
    .allow('')
}).unknown(false);

/**
 * Batch Payment Schema
 * Validates batch payment request body
 *
 * Required: commissionIds, method, transactionIdPrefix
 */
const batchPaymentSchema = Joi.object({
  commissionIds: Joi.array()
    .items(Joi.string().trim())
    .min(1)
    .max(500)
    .required()
    .messages({
      'array.base': 'commissionIds must be an array',
      'array.min': 'At least one commission ID is required',
      'array.max': 'Cannot pay more than 500 commissions at once',
      'any.required': 'commissionIds is required'
    }),
  
  method: Joi.string()
    .valid('stripe', 'paypal', 'bank_transfer', 'cryptocurrency', 'manual')
    .required()
    .messages({
      'string.base': 'Payment method must be a string',
      'any.required': 'Payment method is required',
      'any.only': 'Payment method must be one of: stripe, paypal, bank_transfer, cryptocurrency, manual'
    }),
  
  transactionIdPrefix: Joi.string()
    .required()
    .trim()
    .max(50)
    .messages({
      'string.base': 'Transaction ID prefix must be a string',
      'any.required': 'Transaction ID prefix is required',
      'string.max': 'Transaction ID prefix cannot exceed 50 characters'
    })
}).unknown(false);

/**
 * ==================== VALIDATION MIDDLEWARE ====================
 */

/**
 * Validate Commission Query Parameters
 *
 * Usage: router.get('/path', validateCommissionQuery, handler)
 *
 * Validates:
 *   - page and limit for pagination
 *   - status filter
 *   - date range for filtering
 *
 * Error Response: 400 Bad Request with details
 */
const validateCommissionQuery = (req, res, next) => {
  const { error, value } = commissionQuerySchema.validate(req.query, {
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
 * Validate Commission Approval Request
 *
 * Usage: router.post('/commissions/:id/approve', validateCommissionApproval, handler)
 *
 * Validates:
 *   - notes (optional, max 500 chars)
 *
 * Error Response: 400 Bad Request with details
 */
const validateCommissionApproval = (req, res, next) => {
  const { error, value } = commissionApprovalSchema.validate(req.body, {
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
 * Validate Mark Commission as Paid Request
 *
 * Usage: router.post('/commissions/:id/pay', validateCommissionPayment, handler)
 *
 * Validates:
 *   - method (required): stripe, paypal, bank_transfer, cryptocurrency, manual
 *   - transactionId (required): 3-100 chars
 *   - receiptId (optional): max 100 chars
 *
 * Error Response: 400 Bad Request with details
 */
const validateCommissionPayment = (req, res, next) => {
  const { error, value } = commissionPaymentSchema.validate(req.body, {
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
 * Validate Commission Reversal Request
 *
 * Usage: router.post('/commissions/:id/reverse', validateCommissionReversal, handler)
 *
 * Validates:
 *   - reason (required): refund, chargeback, fraud, order_issue, affiliate_request, other
 *   - details (optional): max 1000 chars
 *   - amount (optional): positive number
 *
 * Error Response: 400 Bad Request with details
 */
const validateCommissionReversal = (req, res, next) => {
  const { error, value } = commissionReversalSchema.validate(req.body, {
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
 * Validate Batch Approval Request
 *
 * Usage: router.post('/batch-approve', validateBatchApproval, handler)
 *
 * Validates:
 *   - commissionIds (required): non-empty array of strings, max 500
 *   - notes (optional): max 500 chars
 *
 * Error Response: 400 Bad Request with details
 */
const validateBatchApproval = (req, res, next) => {
  const { error, value } = batchApprovalSchema.validate(req.body, {
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
 * Validate Batch Payment Request
 *
 * Usage: router.post('/batch-pay', validateBatchPayment, handler)
 *
 * Validates:
 *   - commissionIds (required): non-empty array of strings, max 500
 *   - method (required): stripe, paypal, bank_transfer, cryptocurrency, manual
 *   - transactionIdPrefix (required): max 50 chars
 *
 * Error Response: 400 Bad Request with details
 */
const validateBatchPayment = (req, res, next) => {
  const { error, value } = batchPaymentSchema.validate(req.body, {
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
 * ==================== EXPORTS ====================
 */

module.exports = {
  // Schemas
  commissionQuerySchema,
  commissionApprovalSchema,
  commissionPaymentSchema,
  commissionReversalSchema,
  batchApprovalSchema,
  batchPaymentSchema,

  // Middleware
  validateCommissionQuery,
  validateCommissionApproval,
  validateCommissionPayment,
  validateCommissionReversal,
  validateBatchApproval,
  validateBatchPayment
};
