/**
 * Referral Tracking Model
 * Tracks every referral click for attribution and analytics
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const ReferralTrackingSchema = new Schema(
  {
    // Reference to Affiliate
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'Affiliate',
      required: true,
      index: true,
    },

    // Affiliate code used in the referral (denormalized for performance)
    affiliateCode: {
      type: String,
      required: true,
      uppercase: true,
      index: true,
    },

    // Unique visitor identifier (can be user ID if logged in, or anonymous)
    visitorId: {
      type: String,
      required: false, // May not be known for anonymous visitors
      index: true,
    },

    // IP address of referral click
    ipAddress: {
      type: String,
      required: true,
      index: true,
    },

    // User agent string
    userAgent: {
      type: String,
      required: false,
    },

    // HTTP referrer header
    httpReferrer: {
      type: String,
      required: false,
    },

    // Referral source (direct, email, facebook, twitter, etc.)
    referralSource: {
      type: String,
      enum: ['direct', 'email', 'facebook', 'twitter', 'instagram', 'tiktok', 'reddit', 'blog', 'other'],
      default: 'direct',
    },

    // UTM parameters for tracking campaign
    utmCampaign: String,
    utmMedium: String,
    utmSource: String,
    utmContent: String,

    // Cookie ID (for tracking across sessions)
    cookieId: {
      type: String,
      required: false,
      index: true,
    },

    // Session ID
    sessionId: {
      type: String,
      required: false,
      index: true,
    },

    // Landing page URL
    landingUrl: {
      type: String,
      required: false,
    },

    // Whether this click resulted in a purchase
    convertedToSale: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Reference to Order if converted
    orderId: {
      type: Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true,
    },

    // Commission amount if converted
    commissionAmount: {
      type: Number,
      default: null,
      min: 0,
    },

    // Device information (for analytics)
    device: {
      type: String,
      enum: ['mobile', 'tablet', 'desktop'],
      default: 'desktop',
    },

    // Country (from IP geolocation)
    country: {
      type: String,
      required: false,
    },

    // State/Province
    state: {
      type: String,
      required: false,
    },

    // City
    city: {
      type: String,
      required: false,
    },

    // Browser information
    browser: {
      name: String,
      version: String,
    },

    // Operating system
    os: {
      name: String,
      version: String,
    },

    // Retention period
    expiresAt: {
      type: Date,
      default: () => new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      index: true,
    },

    // When the click was converted to a sale (for analytics filtering)
    convertedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

// ==================== INDEXES ====================

// Compound indexes for common queries
ReferralTrackingSchema.index({ affiliateId: 1, createdAt: -1 });
ReferralTrackingSchema.index({ affiliateCode: 1, createdAt: -1 });
ReferralTrackingSchema.index({ ipAddress: 1, createdAt: -1 }); // For fraud detection
ReferralTrackingSchema.index({ convertedToSale: 1, convertedAt: -1 }); // For sales tracking by conversion date
ReferralTrackingSchema.index({ affiliateId: 1, convertedToSale: 1, convertedAt: -1 }); // For affiliate analytics
ReferralTrackingSchema.index({ cookieId: 1, createdAt: -1 }); // For session tracking

// TTL index for automatic expiration
ReferralTrackingSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

// ==================== INSTANCE METHODS ====================

/**
 * Mark referral as converted to sale
 *
 * @param {ObjectId} orderId - Order that was converted from this referral
 * @param {number} commissionAmount - Commission amount for this sale
 */
ReferralTrackingSchema.methods.convertToSale = async function(orderId, commissionAmount) {
  this.convertedToSale = true;
  this.orderId = orderId;
  this.commissionAmount = commissionAmount;
  this.convertedAt = new Date(); // Record the conversion timestamp
  return this.save();
};

/**
 * Get referral metrics
 */
ReferralTrackingSchema.methods.getMetrics = function() {
  return {
    affiliateId: this.affiliateId,
    affiliateCode: this.affiliateCode,
    ipAddress: this.ipAddress,
    device: this.device,
    referralSource: this.referralSource,
    convertedToSale: this.convertedToSale,
    commissionAmount: this.commissionAmount,
    createdAt: this.createdAt,
  };
};

// ==================== STATIC METHODS ====================

/**
 * Get referrals for affiliate in date range
 *
 * @param {ObjectId} affiliateId - Affiliate ID
 * @param {Date} startDate - Start date
 * @param {Date} endDate - End date
 */
ReferralTrackingSchema.statics.getReferralsInDateRange = async function(
  affiliateId,
  startDate,
  endDate,
  options = {}
) {
  const { limit = 100, page = 1, convertedOnly = false } = options;
  const skip = (page - 1) * limit;

  const query = {
    affiliateId,
    createdAt: { $gte: startDate, $lte: endDate },
  };

  if (convertedOnly) {
    query.convertedToSale = true;
  }

  const referrals = await this.find(query)
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  const total = await this.countDocuments(query);

  return {
    referrals,
    pagination: {
      currentPage: page,
      itemsPerPage: limit,
      totalItems: total,
      totalPages: Math.ceil(total / limit),
    },
  };
};

/**
 * Get referral statistics for affiliate
 *
 * @param {ObjectId} affiliateId - Affiliate ID
 * @param {Date} startDate - Optional start date
 * @param {Date} endDate - Optional end date
 */
ReferralTrackingSchema.statics.getAffiliateStats = async function(
  affiliateId,
  startDate = null,
  endDate = null
) {
  // For referral CLICKS, query by click date (createdAt)
  const clickQuery = { affiliateId };
  if (startDate || endDate) {
    clickQuery.createdAt = {};
    if (startDate) clickQuery.createdAt.$gte = startDate;
    if (endDate) clickQuery.createdAt.$lte = endDate;
  }

  // For CONVERSIONS, query by conversion date (convertedAt) - different from click date
  const conversionQuery = { affiliateId, convertedToSale: true };
  if (startDate || endDate) {
    conversionQuery.convertedAt = {};
    if (startDate) conversionQuery.convertedAt.$gte = startDate;
    if (endDate) conversionQuery.convertedAt.$lte = endDate;
  }

  // Count total clicks in the selected date range
  const clickStats = await this.aggregate([
    { $match: clickQuery },
    {
      $group: {
        _id: null,
        totalClicks: { $sum: 1 },
        uniqueVisitors: { $addToSet: '$ipAddress' },
      },
    },
  ]);

  // Count conversions that happened in the selected date range (regardless of when click occurred)
  const conversionStats = await this.aggregate([
    { $match: conversionQuery },
    {
      $group: {
        _id: null,
        totalConversions: { $sum: 1 },
        totalCommissions: { $sum: '$commissionAmount' },
      },
    },
  ]);

  const clicks = clickStats[0]?.totalClicks || 0;
  const conversions = conversionStats[0]?.totalConversions || 0;
  const commissions = conversionStats[0]?.totalCommissions || 0;

  return {
    totalClicks: clicks,
    totalConversions: conversions,
    totalCommissions: Math.round(commissions * 100) / 100,
    conversionRate: clicks > 0 ? parseFloat(((conversions / clicks) * 100).toFixed(2)) : 0,
    uniqueVisitorCount: clickStats[0]?.uniqueVisitors?.length || 0,
  };
};

/**
 * Get referrals by source for affiliate
 *
 * @param {ObjectId} affiliateId - Affiliate ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 */
ReferralTrackingSchema.statics.getReferralsBySource = async function(affiliateId, startDate = null, endDate = null) {
  const query = { affiliateId };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$referralSource',
        count: { $sum: 1 },
        conversions: {
          $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
        },
      },
    },
    { $sort: { count: -1 } },
  ]);
};

/**
 * Get referrals by device
 *
 * @param {ObjectId} affiliateId - Affiliate ID
 * @param {Date} startDate - Start date (optional)
 * @param {Date} endDate - End date (optional)
 */
ReferralTrackingSchema.statics.getReferralsByDevice = async function(affiliateId, startDate = null, endDate = null) {
  const query = { affiliateId };

  if (startDate || endDate) {
    query.createdAt = {};
    if (startDate) query.createdAt.$gte = startDate;
    if (endDate) query.createdAt.$lte = endDate;
  }

  return this.aggregate([
    { $match: query },
    {
      $group: {
        _id: '$device',
        count: { $sum: 1 },
        conversions: {
          $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
        },
      },
    },
  ]);
};

/**
 * Find suspicious referral patterns
 * Returns referrals from same IP with unusual frequency
 *
 * @param {string} ipAddress - IP address to check
 * @param {number} threshold - Clicks threshold (default 50)
 */
ReferralTrackingSchema.statics.findSuspiciousPatterns = async function(
  ipAddress,
  threshold = 50
) {
  const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

  return this.aggregate([
    {
      $match: {
        ipAddress,
        createdAt: { $gte: last24Hours },
      },
    },
    {
      $group: {
        _id: '$ipAddress',
        clickCount: { $sum: 1 },
        affiliateCount: { $addToSet: '$affiliateId' },
        conversions: {
          $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
        },
      },
    },
    {
      $match: {
        clickCount: { $gte: threshold },
      },
    },
  ]);
};

/**
 * Get top referral sources
 *
 * @param {number} limit - Limit results
 */
ReferralTrackingSchema.statics.getTopReferralSources = async function(limit = 10) {
  return this.aggregate([
    {
      $group: {
        _id: '$referralSource',
        clicks: { $sum: 1 },
        conversions: {
          $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
        },
        totalCommission: {
          $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, '$commissionAmount', 0] },
        },
      },
    },
    { $sort: { clicks: -1 } },
    { $limit: limit },
  ]);
};

/**
 * Get top performing countries
 *
 * @param {number} limit - Limit results
 */
ReferralTrackingSchema.statics.getTopCountries = async function(limit = 10) {
  return this.aggregate([
    { $match: { country: { $ne: null } } },
    {
      $group: {
        _id: '$country',
        clicks: { $sum: 1 },
        conversions: {
          $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
        },
      },
    },
    { $sort: { clicks: -1 } },
    { $limit: limit },
  ]);
};

const ReferralTracking = mongoose.model('ReferralTracking', ReferralTrackingSchema);

module.exports = ReferralTracking;
