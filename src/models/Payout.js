/**
 * Payout Model
 * Represents affiliate payout transaction records
 *
 * A payout is a financial transaction where the platform transfers
 * an affiliate's accumulated earnings to their specified bank account
 * or payment account.
 */

const mongoose = require('mongoose');

/**
 * Payout Status Enum
 *
 * pending:    Affiliate submitted request, awaiting admin approval
 * approved:   Admin approved the payout, ready for processing
 * processing: Payment in progress (submitting to payment provider)
 * paid:       Payment successfully sent to affiliate (manual confirmation)
 * completed:  Payment successfully sent to affiliate (automated)
 * failed:     Payment attempt failed (network, provider error, etc.)
 * cancelled:  Admin cancelled the payout request
 */

const PayoutSchema = new mongoose.Schema(
  {
    // AFFILIATE REFERENCE
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: true,
      index: true,
      validate: {
        validator: async function (value) {
          // Validate affiliate exists and is active
          const Affiliate = require('./Affiliate');
          const affiliate = await Affiliate.findById(value);
          return affiliate && affiliate.status === 'active';
        },
        message: 'Affiliate must exist and be active'
      }
    },

    // PAYOUT AMOUNT & CURRENCY
    amount: {
      type: Number,
      required: true,
      min: [0.01, 'Payout amount must be at least $0.01'],
      max: [1000000, 'Payout amount exceeds maximum'],
      // Stored in cents to avoid floating point issues (optional)
      // Example: 10000 = $100.00
      validate: {
        validator: function (value) {
          // Ensure amount is not NaN or Infinity
          return Number.isFinite(value) && value > 0;
        },
        message: 'Payout amount must be a valid positive number'
      }
    },

    // PAYOUT PAYMENT METHOD
    method: {
      type: String,
      enum: ['bank_transfer', 'paypal', 'stripe', 'cryptocurrency', 'manual'],
      required: true,
      index: true,

      /**
       * Payment Methods:
       *
       * bank_transfer    - Direct bank transfer (ACH, SEPA, etc.)
       *                    Connect via Stripe Connect or similar
       *                    Usually 1-3 business days
       *
       * paypal           - PayPal API transfer
       *                    Instant to PayPal account
       *
       * stripe           - Stripe payout (via Stripe Connect)
       *                    2-3 business days to bank account
       *
       * cryptocurrency   - Crypto wallet transfer
       *                    Usually <1 hour blockchain confirmation
       *
       * manual           - Manual payout (check, cash, etc.)
       *                    Admin must process manually
       */
    },

    // PAYOUT STATUS & LIFECYCLE
    status: {
      type: String,
      enum: ['pending', 'approved', 'processing', 'paid', 'completed', 'failed', 'cancelled'],
      default: 'pending',
      index: true
    },

    // PAYMENT DETAILS
    payment: {
      // External payment processor reference
      transactionId: {
        type: String,
        unique: true,
        sparse: true,
        // Example: "stripe_payout_1234567890"
        // Example: "pp_123456789"
        // Null until payment is processed
      },

      // When payment was actually sent
      paidAt: Date,

      // Payment receipt/confirmation reference
      receiptId: String,

      // Additional metadata from payment provider
      metadata: mongoose.Schema.Types.Mixed
    },

    // REQUEST DETAILS
    request: {
      // When affiliate submitted the payout request
      submittedAt: {
        type: Date,
        default: Date.now
      },

      // Any notes from affiliate
      notes: {
        type: String,
        maxlength: 500
      },

      // Beneficiary bank/payment details (encrypted in production)
      beneficiary: {
        accountHolderName: String,
        accountNumber: String, // Encrypted
        routingNumber: String, // Encrypted (for US bank transfers)
        bankName: String,
        // For PayPal: email address
        // For Crypto: wallet address
      }
    },

    // APPROVAL WORKFLOW
    approval: {
      // Admin who approved this payout
      approvedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },

      // When approval was granted
      approvedAt: Date,

      // Why payout was approved
      approvalNotes: {
        type: String,
        maxlength: 1000
      }
    },

    // REJECTION/CANCELLATION
    rejection: {
      // Admin who rejected/cancelled
      rejectedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
      },

      // When rejection occurred
      rejectedAt: Date,

      // Reason for rejection
      reason: {
        type: String,
        enum: ['insufficient_funds', 'invalid_details', 'fraud_flag', 'system_error', 'admin_discretion'],
        required: function () {
          return this.status === 'cancelled' || this.status === 'failed';
        }
      },

      // Additional details about rejection
      details: String
    },

    // FINANCIAL RECONCILIATION
    reconciliation: {
      // Amount deducted from affiliate balance when approved
      deductedFrom: {
        availableBalance: Number,
        approvedEarnings: Number
      },

      // When balance was deducted
      deductedAt: Date,

      // Verification that payout matches balance deduction
      verified: Boolean,

      // Reconciliation notes
      notes: String
    },

    // FAILURE/RETRY INFORMATION
    failureInfo: {
      // Reason for failure
      errorCode: String,
      errorMessage: String,

      // Number of retry attempts
      retryCount: {
        type: Number,
        default: 0
      },

      // When last retry occurred
      lastRetryAt: Date,

      // Next scheduled retry (if applicable)
      nextRetryAt: Date
    },

    // AUDIT TRAIL
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'approved', 'processing', 'paid', 'completed', 'failed', 'cancelled']
        },
        changedAt: {
          type: Date,
          default: Date.now
        },
        changedBy: mongoose.Schema.Types.ObjectId,
        reason: String
      }
    ],

    // SYSTEM FIELDS
    createdAt: {
      type: Date,
      default: Date.now
    },

    updatedAt: {
      type: Date,
      default: Date.now
    }
  },

  {
    timestamps: true,
    collection: 'payouts'
  }
);

/**
 * ==================== INDEXES ====================
 */

// Fast lookup by affiliate
PayoutSchema.index({ affiliateId: 1, createdAt: -1 });

// Find payouts by status
PayoutSchema.index({ status: 1, createdAt: -1 });

// Find pending approval queue
PayoutSchema.index({ status: 1, request: 1 });

// Financial reconciliation
PayoutSchema.index({ 'reconciliation.verified': 1 });

// Transaction lookup by ID
PayoutSchema.index({ 'payment.transactionId': 1 });

/**
 * ==================== INSTANCE METHODS ====================
 */

/**
 * Approve payout request
 *
 * Transitions: pending → approved
 * Updates approval metadata
 * Does NOT deduct balance (done in service layer)
 *
 * @param {string} adminId - Admin user ID
 * @param {string} notes - Approval notes
 * @returns {Promise<void>}
 */
PayoutSchema.methods.approve = function (adminId, notes = '') {
  if (this.status !== 'pending') {
    throw new Error(`Cannot approve payout with status: ${this.status}`);
  }

  this.status = 'approved';
  this.approval = {
    approvedBy: adminId,
    approvedAt: new Date(),
    approvalNotes: notes
  };

  this.statusHistory.push({
    status: 'approved',
    changedAt: new Date(),
    changedBy: adminId,
    reason: notes || 'Admin approval'
  });
};

/**
 * Mark payout as processing
 *
 * Transitions: approved → processing
 * Called when payment is being submitted to provider
 *
 * @returns {Promise<void>}
 */
PayoutSchema.methods.markAsProcessing = function () {
  if (this.status !== 'approved') {
    throw new Error(`Cannot process payout with status: ${this.status}`);
  }

  this.status = 'processing';
  this.statusHistory.push({
    status: 'processing',
    changedAt: new Date(),
    reason: 'Payment processing initiated'
  });
};

/**
 * Mark payout as completed
 *
 * Transitions: processing → completed
 * Records transaction ID and payment timestamp
 *
 * @param {string} transactionId - Payment processor transaction ID
 * @param {string} receiptId - Optional receipt reference
 * @returns {Promise<void>}
 */
PayoutSchema.methods.markAsCompleted = function (transactionId, receiptId = '') {
  if (this.status !== 'processing') {
    throw new Error(`Cannot complete payout with status: ${this.status}`);
  }

  this.status = 'completed';
  this.payment = {
    transactionId,
    paidAt: new Date(),
    receiptId: receiptId || undefined
  };

  this.statusHistory.push({
    status: 'completed',
    changedAt: new Date(),
    reason: `Payment completed: ${transactionId}`
  });
};

/**
 * Mark payout as failed
 *
 * Transitions: processing → failed
 * Records failure reason and error details
 *
 * @param {string} reason - Failure reason code
 * @param {string} errorMessage - Error message from provider
 * @returns {Promise<void>}
 */
PayoutSchema.methods.markAsFailed = function (reason, errorMessage) {
  this.status = 'failed';
  this.failureInfo = {
    errorCode: reason,
    errorMessage,
    retryCount: (this.failureInfo?.retryCount || 0) + 1,
    lastRetryAt: new Date()
  };

  this.statusHistory.push({
    status: 'failed',
    changedAt: new Date(),
    reason: `Payment failed: ${reason}`
  });
};

/**
 * Cancel payout request
 *
 * Can transition from: pending, approved
 * Cannot cancel: completed, failed (already processed)
 *
 * @param {string} adminId - Admin cancelling payout
 * @param {string} reason - Cancellation reason
 * @param {string} details - Additional details
 * @returns {Promise<void>}
 */
PayoutSchema.methods.cancel = function (adminId, reason, details = '') {
  if (!['pending', 'approved'].includes(this.status)) {
    throw new Error(`Cannot cancel payout with status: ${this.status}`);
  }

  const previousStatus = this.status;
  this.status = 'cancelled';
  this.rejection = {
    rejectedBy: adminId,
    rejectedAt: new Date(),
    reason,
    details
  };

  this.statusHistory.push({
    status: 'cancelled',
    changedAt: new Date(),
    changedBy: adminId,
    reason: `Cancelled from ${previousStatus}: ${reason}`
  });
};

/**
 * Check if payout can be processed
 *
 * @returns {boolean}
 */
PayoutSchema.methods.canBeProcessed = function () {
  return this.status === 'approved' && (!this.payment?.transactionId);
};

/**
 * Get payout status display name
 *
 * @returns {string}
 */
PayoutSchema.methods.getStatusDisplay = function () {
  const statusLabels = {
    pending: 'Awaiting Admin Approval',
    approved: 'Approved - Ready for Processing',
    processing: 'Payment In Progress',
    completed: 'Paid to Affiliate',
    failed: 'Payment Failed',
    cancelled: 'Request Cancelled'
  };

  return statusLabels[this.status] || this.status;
};

/**
 * ==================== STATIC METHODS ====================
 */

/**
 * Get payouts for affiliate
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {object} options - { page, limit, status, dateFrom, dateTo }
 * @returns {Promise<{payouts: array, pagination: object}>}
 */
PayoutSchema.statics.getAffiliatePayouts = async function (affiliateId, options = {}) {
  const { page = 1, limit = 20, status, dateFrom, dateTo } = options;

  const query = { affiliateId };

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const skip = (page - 1) * limit;

  const [payouts, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .select('-request.beneficiary'), // Don't expose payment details

    this.countDocuments(query)
  ]);

  return {
    payouts,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

/**
 * Get payout statistics for affiliate
 *
 * @param {string} affiliateId - Affiliate ID
 * @returns {Promise<object>}
 */
PayoutSchema.statics.getAffiliatePayoutStats = async function (affiliateId) {
  console.log(`\n🔵 [PAYOUT STATS] Calculating for affiliate ${affiliateId}`);
  
  const stats = await this.aggregate([
    { $match: { affiliateId: new mongoose.Types.ObjectId(affiliateId) } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  console.log(`   📊 Raw aggregation results:`, stats);

  const result = {
    totalPayouts: 0,
    pendingCount: 0,
    approvedCount: 0,
    processingCount: 0,
    completedCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    totalPaidOut: 0,
    totalPending: 0,
    averagePayout: 0
  };

  for (const stat of stats) {
    const status = stat._id;
    const count = stat.count;
    const amount = stat.totalAmount;

    console.log(`   Processing status '${status}': count=${count}, amount=$${amount}`);

    result.totalPayouts += count;

    if (status === 'pending') {
      result.pendingCount = count;
      result.totalPending += amount;
    } else if (status === 'approved') {
      result.approvedCount = count;
      result.totalPending += amount;
    } else if (status === 'processing') {
      result.processingCount = count;
    } else if (status === 'paid') {
      result.completedCount += count;
      result.totalPaidOut += amount;
      console.log(`      ✅ Counting 'paid' toward completion: ${count} payouts, $${amount}`);
    } else if (status === 'completed') {
      result.completedCount += count;
      result.totalPaidOut += amount;
    } else if (status === 'failed') {
      result.failedCount = count;
    } else if (status === 'cancelled') {
      result.cancelledCount = count;
    }
  }

  if (result.totalPayouts > 0) {
    result.averagePayout = result.totalPaidOut / result.completedCount || 0;
  }

  console.log(`\n   ✅ Final payout stats:`);
  console.log(`      Total Paid Out: $${result.totalPaidOut}`);
  console.log(`      Completed Count: ${result.completedCount}`);
  console.log(`      Approved Count: ${result.approvedCount}\n`);

  return result;
};

/**
 * Get all pending payouts (admin approval queue)
 *
 * @param {object} options - { limit, dateFrom, dateTo }
 * @returns {Promise<array>}
 */
PayoutSchema.statics.getPendingPayouts = async function (options = {}) {
  const { limit = 100, dateFrom, dateTo } = options;

  const query = { status: 'pending' };

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  return this.find(query)
    .populate('affiliateId', 'email name affiliateDetails')
    .sort({ 'request.submittedAt': 1 })
    .limit(limit)
    .exec();
};

/**
 * Get payouts ready for processing
 *
 * Status = approved AND can be processed
 *
 * @param {object} options - { limit }
 * @returns {Promise<array>}
 */
PayoutSchema.statics.getReadyForProcessing = async function (options = {}) {
  const { limit = 100 } = options;

  return this.find({
    status: 'approved',
    'payment.transactionId': { $exists: false }
  })
    .populate('affiliateId', 'email name')
    .sort({ 'approval.approvedAt': 1 })
    .limit(limit)
    .exec();
};

/**
 * Get system-wide payout statistics
 *
 * @param {object} options - { dateFrom, dateTo }
 * @returns {Promise<object>}
 */
PayoutSchema.statics.getSystemStats = async function (options = {}) {
  const { dateFrom, dateTo } = options;

  const query = {};
  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);

  const result = {
    totalPayouts: 0,
    pendingCount: 0,
    approvedCount: 0,
    processingCount: 0,
    completedCount: 0,
    failedCount: 0,
    cancelledCount: 0,
    totalAmount: 0,
    totalPaidOut: 0,
    totalPending: 0,
    totalFailed: 0,
    averagePayout: 0
  };

  for (const stat of stats) {
    const status = stat._id;
    const count = stat.count;
    const amount = stat.totalAmount;

    result.totalPayouts += count;
    result.totalAmount += amount;

    if (status === 'pending') {
      result.pendingCount = count;
      result.totalPending += amount;
    } else if (status === 'approved') {
      result.approvedCount = count;
      result.totalPending += amount;
    } else if (status === 'processing') {
      result.processingCount = count;
    } else if (status === 'completed') {
      result.completedCount = count;
      result.totalPaidOut += amount;
    } else if (status === 'failed') {
      result.failedCount = count;
      result.totalFailed += amount;
    } else if (status === 'cancelled') {
      result.cancelledCount = count;
    }
  }

  if (result.completedCount > 0) {
    result.averagePayout = result.totalPaidOut / result.completedCount;
  }

  return result;
};

// Create and export model
const Payout = mongoose.model('Payout', PayoutSchema);
module.exports = Payout;
