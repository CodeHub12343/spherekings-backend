/**
 * Commission Model
 * Stores affiliate commission transactions from order payments
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Commission Status Lifecycle:
 * pending → approved → paid [goal state]
 * or
 * pending → reversed [if order refunded]
 */

const CommissionSchema = new Schema(
  {
    // Reference to the affiliate who earned the commission
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },

    // Reference to the order that generated the commission
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
      unique: true, // One commission per order
      index: true,
    },

    // Order details (denormalized for performance and audit trail)
    orderNumber: {
      type: String,
      required: true,
      index: true,
    },

    // Customer/buyer information
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },

    // Commission calculation details
    calculation: {
      // Order total amount
      orderTotal: {
        type: Number,
        required: true,
        min: 0,
      },

      // Commission rate applied (percentage, 0-1, e.g., 0.10 = 10%)
      rate: {
        type: Number,
        required: true,
        min: 0,
        max: 1,
        default: 0.10, // 10% default
      },

      // Commission amount in dollars
      amount: {
        type: Number,
        required: true,
        min: 0,
      },

      // How commission was calculated (manual, tiered, flat, referral, etc.)
      tier: {
        type: String,
        enum: ['standard', 'tiered', 'promotional', 'manual'],
        default: 'standard',
      },

      // Calculation timestamp for audit
      calculatedAt: {
        type: Date,
        default: Date.now,
      },

      // Notes about calculation (e.g., "Promo tier 15%")
      notes: String,
    },

    // Commission status tracking
    status: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'reversed'],
      default: 'pending',
      index: true,
    },

    // Status change history
    statusHistory: [
      {
        status: {
          type: String,
          enum: ['pending', 'approved', 'paid', 'reversed'],
        },
        changedAt: {
          type: Date,
          default: Date.now,
        },
        changedBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
        reason: String,
      },
    ],

    // Payment details (populated when commission is paid)
    payment: {
      // Payment method (stripe, paypal, bank_transfer, etc.)
      method: String,

      // Payment transaction ID/reference
      transactionId: String,

      // When payment was completed
      paidAt: Date,

      // Payment receipt/reference number
      receiptId: String,
    },

    // Reversal information (if cancelled/reversed)
    reversal: {
      // Reason for reversal (refund, chargeback, fraud, etc.)
      reason: String,

      // When reversal occurred
      reversedAt: Date,

      // Reason details
      details: String,

      // Refund amount (may be less than original if partial refund)
      amount: Number,
    },

    // Referral tracking metadata
    referral: {
      // How customer was referred (from ReferralTracking)
      referralClickId: {
        type: Schema.Types.ObjectId,
        ref: 'ReferralTracking',
      },

      // Traffic source (direct, email, social, etc.)
      source: String,

      // Device type that clicked referral link
      device: String,

      // UTM campaign if tracked
      utmCampaign: String,
      utmMedium: String,
      utmSource: String,
    },

    // Fraud detection flags
    fraudIndicators: {
      // Whether system flagged as suspicious
      flagged: {
        type: Boolean,
        default: false,
      },

      // Reason if flagged
      reason: String,

      // Risk level (low, medium, high)
      riskLevel: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'low',
      },

      // Fraud score (0-100)
      score: Number,
    },

    // Approval workflow
    approval: {
      // Whether manual approval is required
      requiresApproval: {
        type: Boolean,
        default: false,
      },

      // Admin who approved (if manual approval)
      approvedBy: {
        type: Schema.Types.ObjectId,
        ref: 'User',
      },

      // When approved
      approvedAt: Date,

      // Reason for manual approval requirement
      reason: String,

      // Approval notes
      notes: String,
    },

    // Reconciliation information
    reconciliation: {
      // Whether reconciled with accounting
      reconciled: {
        type: Boolean,
        default: false,
      },

      // Reconciliation date
      reconciledAt: Date,

      // Reconciliation ID (link to accounting system)
      reconciliationId: String,
    },

    // Tax information (for reporting)
    tax: {
      // Tax amount if applicable
      amount: Number,

      // Tax rate applied
      rate: Number,

      // Tax jurisdiction
      jurisdiction: String,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ==================== INDEXES ====================

// Efficient querying by affiliate
CommissionSchema.index({ affiliateId: 1, createdAt: -1 });

// Prevent duplicate commissions for same order
CommissionSchema.index({ orderId: 1 }, { unique: true });

// Efficient status filtering
CommissionSchema.index({ status: 1, createdAt: -1 });

// Find pending commissions for approval
CommissionSchema.index({ status: 1, 'approval.requiresApproval': 1 });

// Fraud tracking
CommissionSchema.index({ 'fraudIndicators.flagged': 1, 'fraudIndicators.riskLevel': 1 });

// Payment tracking
CommissionSchema.index({ 'payment.paidAt': 1 });

// Date-based queries
CommissionSchema.index({ createdAt: -1 });

// Combined queries
CommissionSchema.index({ affiliateId: 1, status: 1, createdAt: -1 });

// ==================== INSTANCE METHODS ====================

/**
 * Approve a commission for payment
 *
 * Transitions from pending to approved
 * Updates approval metadata
 *
 * @param {ObjectId} approvedBy - Admin user ID
 * @param {string} notes - Approval notes (optional)
 */
CommissionSchema.methods.approve = async function(approvedBy, notes = '') {
  if (this.status !== 'pending') {
    throw new Error(`Cannot approve commission with status ${this.status}`);
  }

  this.status = 'approved';
  this.approval.approvedBy = approvedBy;
  this.approval.approvedAt = new Date();
  this.approval.notes = notes;

  // Add to status history
  this.statusHistory.push({
    status: 'approved',
    changedAt: new Date(),
    changedBy: approvedBy,
    reason: notes,
  });

  return this.save();
};

/**
 * Mark commission as paid
 *
 * Transitions from approved to paid
 * Records payment details
 *
 * @param {Object} paymentDetails - Payment information
 *   - method: Payment method (stripe, paypal, etc.)
 *   - transactionId: Transaction reference
 *   - receiptId: Receipt number (optional)
 */
CommissionSchema.methods.markAsPaid = async function(paymentDetails = {}) {
  if (this.status !== 'approved') {
    throw new Error(`Cannot mark as paid - current status is ${this.status}`);
  }

  this.status = 'paid';
  this.payment = {
    ...paymentDetails,
    paidAt: new Date(),
  };

  // Add to status history
  this.statusHistory.push({
    status: 'paid',
    changedAt: new Date(),
    reason: `Paid via ${paymentDetails.method || 'unknown method'}`,
  });

  return this.save();
};

/**
 * Reverse a commission (for refunds, chargebacks, etc.)
 *
 * Can be reversed from any status
 * Records reversal reason and details
 *
 * @param {Object} reversalInfo - Reversal information
 *   - reason: Reversal reason (refund, chargeback, fraud, etc.)
 *   - details: Additional details
 *   - amount: Amount being reversed (optional, default is full amount)
 */
CommissionSchema.methods.reverse = async function(reversalInfo = {}) {
  const { reason = 'Unknown', details = '', amount = this.calculation.amount } = reversalInfo;

  this.status = 'reversed';
  this.reversal = {
    reason,
    details,
    reversedAt: new Date(),
    amount,
  };

  // Add to status history
  this.statusHistory.push({
    status: 'reversed',
    changedAt: new Date(),
    reason: `${reason}: ${details}`,
  });

  return this.save();
};

/**
 * Get commission status summary
 */
CommissionSchema.methods.getStatus = function() {
  return {
    currentStatus: this.status,
    amount: this.calculation.amount,
    orderTotal: this.calculation.orderTotal,
    rate: `${(this.calculation.rate * 100).toFixed(1)}%`,
    createdAt: this.createdAt,
    paidAt: this.payment?.paidAt || null,
    fraudFlagged: this.fraudIndicators.flagged,
  };
};

/**
 * Check if commission can be paid
 */
CommissionSchema.methods.canBePaid = function() {
  return this.status === 'approved' && !this.fraudIndicators.flagged;
};

/**
 * Add status change to history
 */
CommissionSchema.methods.addStatusChange = async function(newStatus, changedBy, reason = '') {
  this.statusHistory.push({
    status: newStatus,
    changedAt: new Date(),
    changedBy,
    reason,
  });

  this.status = newStatus;
  return this.save();
};

// ==================== STATIC METHODS ====================

/**
 * Get commissions for an affiliate with pagination
 *
 * @param {ObjectId} affiliateId - Affiliate ID
 * @param {Object} options - Query options
 *   - page: Page number (default: 1)
 *   - limit: Results per page (default: 20)
 *   - status: Filter by status (optional)
 *   - dateFrom: Start date (optional)
 *   - dateTo: End date (optional)
 */
CommissionSchema.statics.getAffiliateCommissions = async function(
  affiliateId,
  options = {}
) {
  const { page = 1, limit = 20, status, dateFrom, dateTo } = options;
  const skip = (page - 1) * limit;

  const query = { affiliateId };

  if (status) {
    query.status = status;
  }

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  const commissions = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .populate('orderId', 'orderNumber total paymentStatus')
    .select('-statusHistory'); // Exclude large status history for list view

  const total = await this.countDocuments(query);

  return {
    commissions,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get commission statistics for an affiliate
 *
 * @param {ObjectId} affiliateId - Affiliate ID
 * @param {Object} options - Statistics options
 *   - dateFrom: Start date
 *   - dateTo: End date
 */
CommissionSchema.statics.getAffiliateStats = async function(affiliateId, options = {}) {
  const { dateFrom, dateTo } = options;

  const query = { affiliateId };

  if (dateFrom || dateTo) {
    query.createdAt = {};
    if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
    if (dateTo) query.createdAt.$lte = new Date(dateTo);
  }

  console.log(`\n🔵 [STATS] Calculating commission stats for affiliate ${affiliateId}`);
  console.log(`   Query: ${JSON.stringify(query)}`);

  const stats = await this.aggregate([
    { $match: query },
    {
      $group: {
        _id: null,
        totalCommissions: { $sum: 1 },
        pendingCount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] },
        },
        approvedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] },
        },
        paidCount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] },
        },
        reversedCount: {
          $sum: { $cond: [{ $eq: ['$status', 'reversed'] }, 1, 0] },
        },
        totalPending: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$calculation.amount', 0] },
        },
        totalApproved: {
          $sum: { $cond: [{ $eq: ['$status', 'approved'] }, '$calculation.amount', 0] },
        },
        averageCommission: { $avg: '$calculation.amount' },
        maxCommission: { $max: '$calculation.amount' },
      },
    },
  ]);

  console.log(`   📊 Raw stats from aggregation:`, stats[0] || 'NO RESULTS');

  if (stats.length === 0) {
    console.log(`   ⚠️  No commissions found - returning zero stats\n`);
    return {
      totalCommissions: 0,
      pendingCount: 0,
      approvedCount: 0,
      paidCount: 0,
      reversedCount: 0,
      totalEarned: 0,
      totalPending: 0,
      totalApproved: 0,
      averageCommission: 0,
      maxCommission: 0,
    };
  }

  // Calculate totalEarned from actual paid payouts instead of commission status
  // This accounts for partial payments where commissions are reduced but never marked as "paid"
  const Payout = require('./Payout');
  const paidPayouts = await Payout.aggregate([
    {
      $match: {
        affiliateId: affiliateId instanceof require('mongoose').Types.ObjectId ? affiliateId : require('mongoose').Types.ObjectId.createFromHexString(affiliateId.toString()),
        status: 'paid'
      }
    },
    {
      $group: {
        _id: null,
        totalPaidAmount: { $sum: '$amount' }
      }
    }
  ]);

  let totalEarned = 0;
  if (paidPayouts.length > 0 && paidPayouts[0].totalPaidAmount) {
    totalEarned = paidPayouts[0].totalPaidAmount;
  }

  const data = stats[0];
  const result = {
    totalCommissions: data.totalCommissions,
    pendingCount: data.pendingCount,
    approvedCount: data.approvedCount,
    paidCount: data.paidCount,
    reversedCount: data.reversedCount,
    totalEarned: Math.round(totalEarned * 100) / 100,
    totalPending: Math.round(data.totalPending * 100) / 100,
    totalApproved: Math.round(data.totalApproved * 100) / 100,
    averageCommission: Math.round(data.averageCommission * 100) / 100,
    maxCommission: Math.round(data.maxCommission * 100) / 100,
  };

  console.log(`   ✅ Calculated stats:`);
  console.log(`      Total Earned (paid): $${result.totalEarned}`);
  console.log(`      Paid Count: ${result.paidCount}`);
  console.log(`      Approved Count: ${result.approvedCount}`);
  console.log(`      Pending Count: ${result.pendingCount}\n`);

  return result;
};

/**
 * Get all pending commissions for admin approval
 *
 * @param {Object} options - Filter options
 *   - page: Page number
 *   - limit: Results per page
 *   - fraudOnly: Only show flagged commissions
 */
CommissionSchema.statics.getPendingCommissions = async function(options = {}) {
  const { page = 1, limit = 20, fraudOnly = false } = options;
  const skip = (page - 1) * limit;

  // Build query - get ALL commissions, not just pending
  const query = {};

  if (fraudOnly) {
    query['fraudIndicators.flagged'] = true;
  }

  console.log(`📝 [COMMISSION-MODEL] getPendingCommissions query:`, JSON.stringify(query), `Page: ${page}, Limit: ${limit}`);

  const total = await this.countDocuments(query);
  console.log(`📊 [COMMISSION-MODEL] Total documents matching query:`, total);

  const commissions = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit)
    .select('-statusHistory')
    .lean();

  console.log(`✅ [COMMISSION-MODEL] Retrieved ${commissions.length} commissions from database`);

  return {
    commissions,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get pending payouts ready for batch processing
 *
 * Only includes approved commissions from non-flagged affiliates
 *
 * @param {number} limit - Max commissions to retrieve
 */
CommissionSchema.statics.getReadyForPayout = async function(limit = 100) {
  return this.find({
    status: 'approved',
    'fraudIndicators.flagged': false,
    'payment.paidAt': { $exists: false },
  })
    .sort({ createdAt: 1 }) // Oldest first (FIFO)
    .limit(limit)
    .populate('affiliateId', '_id payoutMethod payoutDetails')
    .populate('orderId', 'orderNumber');
};

/**
 * Get system-wide commission statistics
 *
 * @param {Object} options - Statistics options
 */
CommissionSchema.statics.getSystemStats = async function(options = {}) {
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
        _id: null,
        totalCommissions: { $sum: 1 },
        totalAffiliates: { $addToSet: '$affiliateId' },
        statusBreakdown: {
          $push: '$status',
        },
        totalAmount: { $sum: '$calculation.amount' },
        paidAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'paid'] }, '$calculation.amount', 0] },
        },
        pendingAmount: {
          $sum: { $cond: [{ $eq: ['$status', 'pending'] }, '$calculation.amount', 0] },
        },
        averageAmount: { $avg: '$calculation.amount' },
        fraudFlagged: {
          $sum: { $cond: ['$fraudIndicators.flagged', 1, 0] },
        },
      },
    },
  ]);

  if (stats.length === 0) {
    return {
      totalCommissions: 0,
      totalAffiliates: 0,
      totalAmount: 0,
      paidAmount: 0,
      pendingAmount: 0,
      averageAmount: 0,
      fraudFlagged: 0,
    };
  }

  const data = stats[0];
  return {
    totalCommissions: data.totalCommissions,
    totalAffiliates: data.totalAffiliates.length,
    totalAmount: Math.round(data.totalAmount * 100) / 100,
    paidAmount: Math.round(data.paidAmount * 100) / 100,
    pendingAmount: Math.round(data.pendingAmount * 100) / 100,
    averageAmount: Math.round(data.averageAmount * 100) / 100,
    fraudFlagged: data.fraudFlagged,
    statusBreakdown: {
      pending: data.statusBreakdown.filter((s) => s === 'pending').length,
      approved: data.statusBreakdown.filter((s) => s === 'approved').length,
      paid: data.statusBreakdown.filter((s) => s === 'paid').length,
      reversed: data.statusBreakdown.filter((s) => s === 'reversed').length,
    },
  };
};

module.exports = mongoose.model('Commission', CommissionSchema);
