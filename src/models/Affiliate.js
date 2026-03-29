/**
 * Affiliate Model
 * Represents an affiliate account in the system
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

/**
 * Affiliate Status Values
 * pending - Awaiting email verification or admin approval
 * active - Fully verified and able to earn commissions
 * suspended - Temporarily disabled (fraud, policy violation, etc.)
 * inactive - User intentionally deactivated account
 */
const AFFILIATE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
};

const AffiliateSchema = new Schema(
  {
    // Reference to User
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true, // One affiliate account per user
      index: true,
    },

    // Unique affiliate code for referral tracking
    // Format: AFF + 8 uppercase alphanumeric characters
    // Example: AFF12ABC456DEF
    affiliateCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      index: true,
      trim: true,
    },

    // Full referral URL (constructed from affiliate code)
    // Example: https://sphereofkings.com/?ref=AFF12ABC456DEF
    referralUrl: {
      type: String,
      required: false, // Can be constructed from code
    },

    // Current status of affiliate account
    status: {
      type: String,
      enum: Object.values(AFFILIATE_STATUS),
      default: AFFILIATE_STATUS.PENDING,
      index: true,
    },

    // Email verification status
    emailVerified: {
      type: Boolean,
      default: false,
    },

    // Email verification token (cleared after verified)
    emailVerificationToken: {
      type: String,
      default: null,
    },

    // Email verification token expiration
    emailVerificationTokenExpires: {
      type: Date,
      default: null,
    },

    // ==================== ANALYTICS ====================

    // Total number of referral link clicks tracked
    totalClicks: {
      type: Number,
      default: 0,
      index: true,
    },

    // Total number of attributed purchases
    totalSales: {
      type: Number,
      default: 0,
      index: true,
    },

    // Total commission value earned (paid + pending)
    totalEarnings: {
      type: Number,
      default: 0,
      min: 0,
      set: (val) => Math.round(val * 100) / 100, // Round to 2 decimals
    },

    // Commission amount awaiting approval/payout
    pendingEarnings: {
      type: Number,
      default: 0,
      min: 0,
      set: (val) => Math.round(val * 100) / 100,
    },

    // Commission amount already paid
    paidEarnings: {
      type: Number,
      default: 0,
      min: 0,
      set: (val) => Math.round(val * 100) / 100,
    },

    // ==================== PERFORMANCE METRICS ====================

    // Click-to-Sale conversion rate (%)
    conversionRate: {
      type: Number,
      default: 0,
      get: function() {
        if (this.totalClicks === 0) return 0;
        return (this.totalSales / this.totalClicks * 100);
      },
    },

    // Average commission per sale
    averageOrderValue: {
      type: Number,
      default: 0,
      get: function() {
        if (this.totalSales === 0) return 0;
        return this.totalEarnings / this.totalSales;
      },
    },

    // ==================== REGISTRATION INFO ====================

    // Where they plan to promote Sphere of Kings
    marketingChannels: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    // Website or social media profile URL
    website: {
      type: String,
      default: null,
      trim: true,
      maxlength: 500,
    },

    // Expected monthly referrals
    expectedMonthlyReferrals: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================== SETTINGS & PREFERENCES ====================

    // Commission rate applied to this affiliate (e.g., 10 for 10%)
    commissionRate: {
      type: Number,
      default: 10, // Default 10% (should be set globally in config)
      min: 0,
      max: 100,
    },

    // Payout method (stripe, bank_transfer, paypal, etc.)
    payoutMethod: {
      type: String,
      enum: ['stripe', 'bank_transfer', 'paypal', 'none'],
      default: 'none', // User must configure before payout
    },

    // Payout method details (encrypted)
    payoutDetails: {
      // For Stripe: stripe account ID
      // For bank: account number (encrypted)
      // For PayPal: email address
      type: String,
      default: null,
    },

    // Minimum payout threshold ($)
    minimumPayoutThreshold: {
      type: Number,
      default: 50,
      min: 0,
    },

    // ==================== RESTRICTIONS & FRAUD PREVENTION ====================

    // Whether affiliate has agreed to terms
    termsAccepted: {
      type: Boolean,
      default: false,
    },

    // Date terms were accepted
    termsAcceptedAt: {
      type: Date,
      default: null,
    },

    // Fraud flags
    fraudFlags: {
      // IP addresses used for suspicious clicks
      suspiciousIPs: [String],
      
      // Self-referral detected
      selfReferralDetected: {
        type: Boolean,
        default: false,
      },

      // Unusual click patterns
      unusualActivity: {
        type: Boolean,
        default: false,
      },

      // Reason for any flags
      description: String,

      // Date suspicious activity detected
      flaggedAt: Date,
    },

    // Suspension reason (if suspended)
    suspensionReason: {
      type: String,
      default: null,
    },

    // Suspension date
    suspendedAt: {
      type: Date,
      default: null,
    },

    // ==================== METADATA ====================

    // Last time affiliate logged in
    lastLoginAt: {
      type: Date,
      default: null,
    },

    // Last time dashboard was accessed
    lastDashboardAccessAt: {
      type: Date,
      default: null,
    },

    // Referral link last shared
    lastSharedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
    toJSON: {
      getters: true, // Include custom getters in JSON
      transform: (doc, ret) => {
        // Remove sensitive fields from JSON response
        delete ret.emailVerificationToken;
        delete ret.emailVerificationTokenExpires;
        delete ret.payoutDetails; // Don't expose in API responses
        return ret;
      },
    },
  }
);

// ==================== INDEXES ====================

// Compound index for affiliate analytics queries
AffiliateSchema.index({ userId: 1, status: 1 });
AffiliateSchema.index({ status: 1, totalEarnings: -1 }); // For leaderboards
AffiliateSchema.index({ createdAt: -1 }); // For new affiliates
AffiliateSchema.index({ 'fraudFlags.suspiciousIPs': 1 }); // For fraud detection

// ==================== INSTANCE METHODS ====================

/**
 * Generate a unique affiliate code
 * Format: AFF + 11 uppercase alphanumeric characters
 * Example: AFF12ABC456DEF78
 */
AffiliateSchema.statics.generateUniqueAffiliateCode = async function() {
  let code;
  let exists = true;
  let attempts = 0;
  const MAX_ATTEMPTS = 10;

  while (exists && attempts < MAX_ATTEMPTS) {
    // Generate: AFF + 11 random chars
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomPart = '';
    for (let i = 0; i < 11; i++) {
      randomPart += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    code = 'AFF' + randomPart;

    // Check if code already exists
    exists = await this.exists({ affiliateCode: code });
    attempts++;
  }

  if (exists) {
    throw new Error('Unable to generate unique affiliate code after multiple attempts');
  }

  return code;
};

/**
 * Construct full referral URL
 */
AffiliateSchema.methods.getFullReferralUrl = function(baseUrl = process.env.FRONTEND_URL || 'https://sphereofkings.com') {
  return `${baseUrl}/?ref=${this.affiliateCode}`;
};

/**
 * Update analytics: increment click count
 */
AffiliateSchema.methods.recordReferralClick = async function() {
  this.totalClicks += 1;
  this.lastSharedAt = new Date();
  return this.save();
};

/**
 * Update analytics: increment sales count and add commission
 * Called when order is attributed to affiliate
 *
 * @param {number} commissionAmount - Commission to add (in dollars)
 * @param {string} status - Initial commission status (pending, approved)
 */
AffiliateSchema.methods.recordAffiliateSale = async function(commissionAmount, status = 'pending') {
  this.totalSales += 1;

  if (status === 'pending') {
    this.pendingEarnings = Math.round((this.pendingEarnings + commissionAmount) * 100) / 100;
  } else if (status === 'approved') {
    this.totalEarnings = Math.round((this.totalEarnings + commissionAmount) * 100) / 100;
  }

  return this.save();
};

/**
 * Mark commission as approved (ready for payout)
 *
 * @param {number} amount - Amount being approved
 */
AffiliateSchema.methods.approvePendingCommission = async function(amount) {
  const roundedAmount = Math.round(amount * 100) / 100;
  
  if (this.pendingEarnings < roundedAmount) {
    throw new Error('Cannot approve more than pending earnings');
  }

  this.pendingEarnings = Math.round((this.pendingEarnings - roundedAmount) * 100) / 100;
  this.totalEarnings = Math.round((this.totalEarnings + roundedAmount) * 100) / 100;

  return this.save();
};

/**
 * Mark commission as paid (already paid out)
 *
 * @param {number} amount - Amount being paid
 */
AffiliateSchema.methods.recordPayout = async function(amount) {
  const roundedAmount = Math.round(amount * 100) / 100;

  if (this.totalEarnings < roundedAmount) {
    throw new Error('Cannot pay more than total earnings');
  }

  this.totalEarnings = Math.round((this.totalEarnings - roundedAmount) * 100) / 100;
  this.paidEarnings = Math.round((this.paidEarnings + roundedAmount) * 100) / 100;

  return this.save();
};

/**
 * Activate affiliate account (after email verification)
 */
AffiliateSchema.methods.activate = async function() {
  this.status = AFFILIATE_STATUS.ACTIVE;
  this.emailVerified = true;
  this.emailVerificationToken = null;
  this.emailVerificationTokenExpires = null;
  return this.save();
};

/**
 * Suspend affiliate account
 *
 * @param {string} reason - Reason for suspension
 */
AffiliateSchema.methods.suspend = async function(reason = 'Policy violation') {
  this.status = AFFILIATE_STATUS.SUSPENDED;
  this.suspensionReason = reason;
  this.suspendedAt = new Date();
  return this.save();
};

/**
 * Deactivate affiliate account
 */
AffiliateSchema.methods.deactivate = async function() {
  this.status = AFFILIATE_STATUS.INACTIVE;
  return this.save();
};

/**
 * Check if affiliate can earn commissions
 * (Active status, not suspended, email verified)
 */
AffiliateSchema.methods.canEarnCommissions = function() {
  return (
    this.status === AFFILIATE_STATUS.ACTIVE &&
    this.emailVerified &&
    this.termsAccepted &&
    !this.fraudFlags?.selfReferralDetected &&
    !this.fraudFlags?.unusualActivity
  );
};

/**
 * Check if affiliate has configured payout method
 */
AffiliateSchema.methods.hasPayoutConfigured = function() {
  return this.payoutMethod !== 'none' && this.payoutDetails !== null;
};

/**
 * Check if affiliate meets minimum payout threshold
 */
AffiliateSchema.methods.meetsPayoutThreshold = function() {
  return this.totalEarnings >= this.minimumPayoutThreshold;
};

/**
 * Get conversion rate (%)
 */
AffiliateSchema.methods.getConversionRate = function() {
  if (this.totalClicks === 0) return 0;
  return parseFloat((this.totalSales / this.totalClicks * 100).toFixed(2));
};

/**
 * Get average commission per sale
 */
AffiliateSchema.methods.getAverageCommissionPerSale = function() {
  if (this.totalSales === 0) return 0;
  return parseFloat((this.totalEarnings / this.totalSales).toFixed(2));
};

/**
 * Record suspicious activity
 */
AffiliateSchema.methods.flagSuspiciousActivity = async function(ipAddress, reason) {
  if (!this.fraudFlags) {
    this.fraudFlags = {};
  }

  if (!this.fraudFlags.suspiciousIPs) {
    this.fraudFlags.suspiciousIPs = [];
  }

  if (!this.fraudFlags.suspiciousIPs.includes(ipAddress)) {
    this.fraudFlags.suspiciousIPs.push(ipAddress);
  }

  this.fraudFlags.unusualActivity = true;
  this.fraudFlags.description = reason;
  this.fraudFlags.flaggedAt = new Date();

  return this.save();
};

// ==================== PRE/POST HOOKS ====================

/**
 * Before save: Update lastLoginAt for activity tracking
 */
AffiliateSchema.pre('save', function(next) {
  if (!this.isModified('lastLoginAt')) {
    this.lastLoginAt = this.lastLoginAt || new Date();
  }
  next();
});

// ==================== STATIC METHODS ====================

/**
 * Find active affiliates by performance
 * Used for leaderboards
 */
AffiliateSchema.statics.getTopAffiliates = async function(limit = 10, sortBy = 'totalEarnings') {
  return this.find({ status: AFFILIATE_STATUS.ACTIVE })
    .sort({ [sortBy]: -1 })
    .limit(limit)
    .populate('userId', 'name email');
};

/**
 * Get affiliate by code
 */
AffiliateSchema.statics.findByCode = async function(affiliateCode) {
  return this.findOne({ affiliateCode: affiliateCode.toUpperCase() });
};

/**
 * Get affiliate statistics for admin
 */
AffiliateSchema.statics.getStatistics = async function() {
  const stats = await this.aggregate([
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalEarnings: { $sum: '$totalEarnings' },
        totalClicks: { $sum: '$totalClicks' },
        totalSales: { $sum: '$totalSales' },
      },
    },
  ]);

  return stats;
};

const Affiliate = mongoose.model('Affiliate', AffiliateSchema);

// Export status constants
Affiliate.STATUS = AFFILIATE_STATUS;

module.exports = Affiliate;
