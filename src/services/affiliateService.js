/**
 * Affiliate Service
 * Business logic for affiliate registration, tracking, and dashboard
 */

const Affiliate = require('../models/Affiliate');
const User = require('../models/User');
const ReferralTracking = require('../models/ReferralTracking');
const Order = require('../models/Order');
const { ValidationError, NotFoundError, ForbiddenError, ConflictError } = require('../utils/errors');

class AffiliateService {
  /**
   * Register user as an affiliate
   * Creates affiliate account with unique code
   *
   * @param {ObjectId} userId - User ID registering as affiliate
   * @param {Object} options - Registration options
   *   - termsAccepted (required)
   *   - commissionRate (optional)
   *   - marketingChannels (optional)
   *   - website (optional)
   *   - expectedMonthlyReferrals (optional)
   * @returns {Object} Created affiliate
   */
  async registerAffiliate(userId, options = {}) {
    // Check if user already has an affiliate account
    const existing = await Affiliate.findOne({ userId });
    if (existing) {
      throw new ConflictError('User already has an affiliate account');
    }

    // Generate unique affiliate code
    const affiliateCode = await Affiliate.generateUniqueAffiliateCode();

    // Determine affiliate status based on environment
    const affiliateStatus = process.env.NODE_ENV === 'development' ? Affiliate.STATUS.ACTIVE : Affiliate.STATUS.PENDING;

    // Create new affiliate
    const affiliate = new Affiliate({
      userId,
      affiliateCode,
      status: affiliateStatus,
      emailVerified: process.env.NODE_ENV === 'development' ? true : false,
      commissionRate: options.commissionRate || 10,
      termsAccepted: options.termsAccepted || false,
      termsAcceptedAt: options.termsAccepted ? new Date() : null,
      // Registration info
      marketingChannels: options.marketingChannels || null,
      website: options.website || null,
      expectedMonthlyReferrals: options.expectedMonthlyReferrals || 0,
    });

    await affiliate.save();

    // Update User model to reflect affiliate status
    await User.findByIdAndUpdate(
      userId,
      {
        affiliateStatus: affiliateStatus,
        role: 'affiliate'
      },
      { new: true, runValidators: true }
    );

    const message = process.env.NODE_ENV === 'development' 
      ? 'Affiliate account created successfully and activated for development.'
      : 'Affiliate account created successfully. Please verify your email to activate.';

    return {
      affiliateId: affiliate._id,
      affiliateCode: affiliate.affiliateCode,
      referralUrl: affiliate.getFullReferralUrl(),
      status: affiliate.status,
      message,
    };
  }

  /**
   * Get affiliate profile/dashboard data
   *
   * @param {ObjectId} affiliateId - Affiliate ID (or userId for backward compatibility)
   * @param {Object} filterOptions - Optional date range filters
   */
  async getAffiliateProfile(affiliateId, filterOptions = {}) {
    let affiliate;
    
    // Try to find by affiliateId first (direct Affiliate._id)
    affiliate = await Affiliate.findById(affiliateId);
    
    // If not found, try as userId (User ID)
    if (!affiliate) {
      affiliate = await Affiliate.findOne({ userId: affiliateId });
    }
    
    if (!affiliate) {
      throw new NotFoundError('Affiliate account not found');
    }

    console.log(`\n🔵 [DASHBOARD] Calculating profile for affiliate ${affiliate._id}`);

    // Get total click count (all-time)
    const totalClicks = await ReferralTracking.countDocuments({ affiliateId: affiliate._id });

    // Get CONVERSIONS from Commission records (all-time)
    const Commission = require('../models/Commission');
    const allCommissions = await Commission.find({ affiliateId: affiliate._id });
    const totalConversions = allCommissions.length;
    
    console.log(`   📋 Total commissions in database: ${allCommissions.length}`);
    if (allCommissions.length > 0) {
      allCommissions.forEach((c, idx) => {
        console.log(`      [${idx + 1}] ${c._id} | Status: ${c.status} | Amount: $${c.calculation?.amount || 0}`);
      });
    }
    
    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2)) : 0;

    // Calculate earnings from all commissions
    const pendingCommissions = allCommissions.filter(c => c.status === 'pending');
    const approvedCommissions = allCommissions.filter(c => c.status === 'approved');
    const paidCommissions = allCommissions.filter(c => c.status === 'paid');

    const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const approvedEarnings = approvedCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    
    // Calculate paidEarnings from actual paid payouts instead of commission status
    // This accounts for partial payments where commissions are reduced but never marked as "paid"
    const Payout = require('../models/Payout');
    const paidPayouts = await Payout.aggregate([
      {
        $match: {
          affiliateId: affiliate._id,
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
    
    let paidEarnings = 0;
    if (paidPayouts.length > 0 && paidPayouts[0].totalPaidAmount) {
      paidEarnings = paidPayouts[0].totalPaidAmount;
    }
    
    const totalEarnings = pendingEarnings + approvedEarnings + paidEarnings;
    const totalCommissions = Math.round(totalEarnings * 100) / 100;

    console.log(`\n   💰 Earnings Breakdown:`);
    console.log(`      Pending (${pendingCommissions.length}): $${pendingEarnings.toFixed(2)}`);
    console.log(`      Approved (${approvedCommissions.length}): $${approvedEarnings.toFixed(2)}`);
    console.log(`      Paid from Payouts: $${paidEarnings.toFixed(2)}`);
    console.log(`      TOTAL: $${totalEarnings.toFixed(2)}\n`);

    // Convert Mongoose document to plain object
    const affiliateData = affiliate.toObject();

    // Calculate threshold percentage based on actual earned earnings
    const thresholdPercentage = affiliate.minimumPayoutThreshold > 0 
      ? Math.round((totalEarnings / affiliate.minimumPayoutThreshold) * 100)
      : 0;
    const amountNeeded = Math.max(0, affiliate.minimumPayoutThreshold - totalEarnings);

    return {
      ...affiliateData,
      referralUrl: this._getAffiliateUrl(affiliate.affiliateCode),
      stats: {
        totalClicks: totalClicks,
        totalConversions: totalConversions,
        conversionRate: conversionRate,
        totalCommissions: totalCommissions,
        uniqueVisitorCount: totalClicks, // Approximate
      },
      earnings: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        pendingEarnings: Math.round(pendingEarnings * 100) / 100,
        approvedEarnings: Math.round(approvedEarnings * 100) / 100,
        paidEarnings: Math.round(paidEarnings * 100) / 100,
        minimumPayoutThreshold: affiliate.minimumPayoutThreshold,
        thresholdPercentage: Math.min(100, thresholdPercentage), // Cap at 100%
        amountNeeded: amountNeeded,
        meetsThreshold: totalEarnings >= affiliate.minimumPayoutThreshold,
        hasPayoutConfigured: affiliate.hasPayoutConfigured(),
      },
      status: {
        isActive: affiliate.canEarnCommissions(),
        hasVerifiedEmail: affiliate.emailVerified,
        hasAcceptedTerms: affiliate.termsAccepted,
        suspensionReason: affiliate.suspensionReason,
      },
    };
  }

  /**
   * Record a referral click
   * Called when visitor accesses platform with ?ref=CODE parameter
   *
   * @param {string} affiliateCode - Affiliate code from URL
   * @param {Object} clickData - Click metadata (IP, userAgent, etc.)
   * @returns {Object} Tracking data
   */
  async recordReferralClick(affiliateCode, clickData = {}) {
    console.log(`📍 [AFFILIATE-SERVICE] recordReferralClick() called with code: ${affiliateCode}`);
    
    if (!affiliateCode || affiliateCode.trim() === '') {
      console.error(`❌ [AFFILIATE-SERVICE] Affiliate code is empty`);
      throw new ValidationError('Affiliate code is required');
    }

    // Find affiliate by code
    console.log(`🔍 [AFFILIATE-SERVICE] Looking up affiliate code: ${affiliateCode}`);
    const affiliate = await Affiliate.findByCode(affiliateCode);
    if (!affiliate) {
      console.error(`❌ [AFFILIATE-SERVICE] Affiliate not found: ${affiliateCode}`);
      throw new NotFoundError('Invalid affiliate code');
    }
    console.log(`✅ [AFFILIATE-SERVICE] Affiliate found:`, affiliate.affiliateCode);

    // Check if affiliate is active
    if (affiliate.status !== Affiliate.STATUS.ACTIVE) {
      console.error(`❌ [AFFILIATE-SERVICE] Affiliate not active: ${affiliate.status}`);
      throw new ForbiddenError('Affiliate account is not active');
    }

    // Record the click
    console.log(`💾 [AFFILIATE-SERVICE] Creating ReferralTracking record...`);
    const referralTrack = new ReferralTracking({
      affiliateId: affiliate._id,
      affiliateCode: affiliate.affiliateCode,
      ipAddress: clickData.ipAddress || 'unknown',
      userAgent: clickData.userAgent || null,
      httpReferrer: clickData.referrer || null,
      referralSource: clickData.referralSource || 'direct',
      device: clickData.device || 'desktop',
      cookieId: clickData.cookieId || null,
      sessionId: clickData.sessionId || null,
      utmCampaign: clickData.utmCampaign || null,
      utmMedium: clickData.utmMedium || null,
      utmSource: clickData.utmSource || null,
      utmContent: clickData.utmContent || null,
      country: clickData.country || null,
      state: clickData.state || null,
      city: clickData.city || null,
      browser: clickData.browser || {},
      os: clickData.os || {},
    });

    try {
      await referralTrack.save();
      console.log(`✅ [AFFILIATE-SERVICE] ReferralTracking saved:`, referralTrack._id);
    } catch (saveError) {
      console.error(`❌ [AFFILIATE-SERVICE] Failed to save ReferralTracking:`, saveError.message);
      throw saveError;
    }

    // Update affiliate click count
    console.log(`📊 [AFFILIATE-SERVICE] Updating affiliate click count...`);
    try {
      await affiliate.recordReferralClick();
      console.log(`✅ [AFFILIATE-SERVICE] Click count updated for affiliate: ${affiliate.affiliateCode}`);
    } catch (clickError) {
      console.error(`⚠️  [AFFILIATE-SERVICE] Failed to update click count:`, clickError.message);
      // Don't throw - the tracking record is already saved
    }

    // Return tracking data for cookie storage
    console.log(`🎯 [AFFILIATE-SERVICE] Returning tracking data for affiliate: ${affiliate.affiliateCode}`);
    return {
      trackingId: referralTrack._id,
      affiliateId: affiliate._id,
      affiliateCode: affiliate.affiliateCode,
      expiresAt: referralTrack.expiresAt,
    };
  }

  /**
   * Attribute an order to an affiliate
   * Called during order completion in checkout
   *
   * @param {ObjectId} orderId - Order being attributed
   * @param {string} affiliateCode - Affiliate code from customer cookie/session
   * @param {number} commissionRate - Commission percentage for this order
   * @returns {Object} Attribution result
   */
  async attributeOrderToAffiliate(orderId, affiliateCode, commissionRate = null) {
    if (!affiliateCode) {
      // No affiliate, return early
      return {
        attributed: false,
        message: 'No affiliate code found',
      };
    }

    // Get affiliate
    const affiliate = await Affiliate.findByCode(affiliateCode);
    if (!affiliate || !affiliate.canEarnCommissions()) {
      return {
        attributed: false,
        message: 'Affiliate cannot earn commissions',
      };
    }

    // Get order
    const order = await Order.findById(orderId);
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Prevent self-referrals (if supported)
    if (order.userId.toString() === affiliate.userId.toString()) {
      await affiliate.flagSuspiciousActivity(
        'self-referral',
        'User placed order using own affiliate code'
      );
      affiliate.fraudFlags.selfReferralDetected = true;
      await affiliate.save();

      return {
        attributed: false,
        message: 'Self-referrals are not permitted',
      };
    }

    // Calculate commission
    const rate = commissionRate || affiliate.commissionRate;
    const commissionAmount = Math.round((order.total * (rate / 100)) * 100) / 100;

    // Update order with affiliate details
    order.affiliateDetails = {
      affiliateId: affiliate._id,
      affiliateEmail: null, // Will be populated from user if needed
      commissionRate: rate,
      commissionAmount: commissionAmount,
      status: 'pending', // Commission starts as pending
    };
    await order.save();

    // Record the sale for affiliate
    await affiliate.recordAffiliateSale(commissionAmount, 'pending');

    // Update referral tracking to mark as converted
    const referralTrack = await ReferralTracking.findOne({
      affiliateId: affiliate._id,
      orderId: null, // Not yet converted
      createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24 hours
    }).sort({ createdAt: -1 }); // Most recent

    if (referralTrack) {
      await referralTrack.convertToSale(orderId, commissionAmount);
    }

    return {
      attributed: true,
      affiliateId: affiliate._id,
      commissionAmount: commissionAmount,
      commissionRate: rate,
      message: 'Order attributed to affiliate successfully',
    };
  }

  /**
   * Get referral history for affiliate
   *
   * @param {ObjectId} userId - User ID
   * @param {Object} options - Pagination and filtering
   */
  async getAffiliateReferrals(affiliateId, options = {}) {
    let affiliate;
    
    // Try to find by affiliateId first (direct Affiliate._id)
    affiliate = await Affiliate.findById(affiliateId);
    
    // If not found, try as userId (User ID)
    if (!affiliate) {
      affiliate = await Affiliate.findOne({ userId: affiliateId });
    }
    
    if (!affiliate) {
      throw new NotFoundError('Affiliate account not found');
    }

    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, parseInt(options.limit) || 20);
    const convertedOnly = options.convertedOnly === 'true' || options.convertedOnly === true;

    // Use provided dates or default to all-time (not 30 days) to match dashboard overview
    const startDate = options.startDate ? new Date(options.startDate) : new Date('2000-01-01');
    const endDate = options.endDate ? new Date(options.endDate) : new Date();

    const result = await ReferralTracking.getReferralsInDateRange(
      affiliate._id,
      startDate,
      endDate,
      {
        page,
        limit,
        convertedOnly,
      }
    );

    // Get accurate conversion count from Commission records for this date range
    const Commission = require('../models/Commission');
    const commissionsInDateRange = await Commission.find({
      affiliateId: affiliate._id,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalClicks = await ReferralTracking.countDocuments({
      affiliateId: affiliate._id,
      createdAt: { $gte: startDate, $lte: endDate }
    });

    const totalConversions = commissionsInDateRange.length;
    const conversionRate = totalClicks > 0 ? parseFloat(((totalConversions / totalClicks) * 100).toFixed(2)) : 0;
    const totalCommissionAmount = commissionsInDateRange.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);

    return {
      referrals: result.referrals,
      pagination: result.pagination,
      summary: {
        period: `${startDate.toISOString()} to ${endDate.toISOString()}`,
        convertedOnly,
        totalClicks: totalClicks,
        totalConversions: totalConversions,
        conversionRate: conversionRate,
        totalCommissionAmount: Math.round(totalCommissionAmount * 100) / 100,
      },
    };
  }

  /**
   * Get affiliate sales (orders attributed to affiliate)
   *
   * @param {ObjectId} userId - User ID
   * @param {Object} options - Pagination and filtering
   */
  async getAffiliateSales(affiliateId, options = {}) {
    let affiliate;
    
    // Try to find by affiliateId first (direct Affiliate._id)
    affiliate = await Affiliate.findById(affiliateId);
    
    // If not found, try as userId (User ID)
    if (!affiliate) {
      affiliate = await Affiliate.findOne({ userId: affiliateId });
    }
    
    if (!affiliate) {
      throw new NotFoundError('Affiliate account not found');
    }

    const page = Math.max(1, parseInt(options.page) || 1);
    const limit = Math.min(100, parseInt(options.limit) || 20);
    const skip = (page - 1) * limit;

    // Find orders attributed to this affiliate
    const query = { 'affiliateDetails.affiliateId': affiliate._id };

    if (options.status) {
      query['affiliateDetails.status'] = options.status;
    }

    const startDate = options.startDate ? new Date(options.startDate) : null;
    const endDate = options.endDate ? new Date(options.endDate) : null;

    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = startDate;
      if (endDate) query.createdAt.$lte = endDate;
    }

    const orders = await Order.find(query)
      .select('orderNumber total paymentStatus orderStatus affiliateDetails createdAt')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const totalOrders = await Order.countDocuments(query);

    // Get commissions for all matching orders to calculate accurate commission totals
    const Commission = require('../models/Commission');
    const commissionQuery = { affiliateId: affiliate._id };
    
    if (startDate || endDate) {
      commissionQuery.createdAt = {};
      if (startDate) commissionQuery.createdAt.$gte = startDate;
      if (endDate) commissionQuery.createdAt.$lte = endDate;
    }
    
    const commissions = await Commission.find(commissionQuery).lean();
    const totalCommissionsAmount = commissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const totalSalesAmount = orders.reduce((sum, order) => sum + (order.total || 0), 0);

    return {
      sales: orders,
      pagination: {
        currentPage: page,
        itemsPerPage: limit,
        totalItems: totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
      },
      statistics: {
        totalSalesAmount: totalSalesAmount,
        totalCommissions: totalCommissionsAmount,
        salesCount: orders.length,
        averageOrderValue: orders.length > 0 ? Math.round((totalSalesAmount / orders.length) * 100) / 100 : 0,
        averageCommissionPerSale: orders.length > 0 ? Math.round((totalCommissionsAmount / orders.length) * 100) / 100 : 0,
      },
    };
  }

  /**
   * Get affiliate analytics
   *
   * @param {ObjectId} userId - User ID
   * @param {Object} options - Date range options
   */
  async getAffiliateAnalytics(affiliateId, options = {}) {
    let affiliate;
    
    // Try to find by affiliateId first (direct Affiliate._id)
    affiliate = await Affiliate.findById(affiliateId);
    
    // If not found, try as userId (User ID)
    if (!affiliate) {
      affiliate = await Affiliate.findOne({ userId: affiliateId });
    }
    
    if (!affiliate) {
      throw new NotFoundError('Affiliate account not found');
    }

    let startDate = options.startDate ? new Date(options.startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    let endDate = options.endDate ? new Date(options.endDate) : new Date();

    // If endDate was a date string (format: YYYY-MM-DD), adjust to end of day (23:59:59.999Z)
    if (options.endDate && typeof options.endDate === 'string' && options.endDate.match(/^\d{4}-\d{2}-\d{2}$/)) {
      // Date string like "2026-03-28" - set to end of that day
      endDate.setUTCHours(23, 59, 59, 999);
    }

    console.log(`📊 [ANALYTICS] Date range: ${startDate.toISOString()} to ${endDate.toISOString()}`);

    // Get TOTAL clicks (all-time, not filtered by date)
    const clickStats = await ReferralTracking.countDocuments({ affiliateId: affiliate._id });
    
    // Get traffic by source and device (all-time for these breakdowns)
    const bySource = await ReferralTracking.getReferralsBySource(affiliate._id);
    const byDevice = await ReferralTracking.getReferralsByDevice(affiliate._id);

    // Get CONVERSIONS from Commission model (filtered by date range)
    // This is more reliable than ReferralTracking since Commission is definitive
    const Commission = require('../models/Commission');
    const commissionsInDateRange = await Commission.find({
      affiliateId: affiliate._id,
      createdAt: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    // Get ALL commissions for earnings breakdown (across all time)
    const allCommissions = await Commission.find({ affiliateId: affiliate._id });
    
    // Calculate earnings from all commissions
    const pendingCommissions = allCommissions.filter(c => c.status === 'pending');
    const approvedCommissions = allCommissions.filter(c => c.status === 'approved');
    
    const pendingEarnings = pendingCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const approvedEarnings = approvedCommissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    
    // Calculate paidEarnings from actual paid payouts instead of commission status
    // This accounts for partial payments where commissions are reduced but never marked as "paid"
    const Payout = require('../models/Payout');
    const paidPayouts = await Payout.aggregate([
      {
        $match: {
          affiliateId: affiliate._id,
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
    
    let paidEarnings = 0;
    if (paidPayouts.length > 0 && paidPayouts[0].totalPaidAmount) {
      paidEarnings = paidPayouts[0].totalPaidAmount;
    }
    
    const totalEarnings = pendingEarnings + approvedEarnings + paidEarnings;

    // Calculate conversions and rate from date-filtered commissions
    const totalConversions = commissionsInDateRange.length;
    const totalCommissionsInRange = commissionsInDateRange.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);
    const conversionRate = clickStats > 0 ? parseFloat(((totalConversions / clickStats) * 100).toFixed(2)) : 0;

    console.log(`📊 [ANALYTICS] Stats: Clicks=${clickStats}, Conversions=${totalConversions}, Rate=${conversionRate}%`);

    return {
      period: {
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
      },
      overview: {
        totalClicks: clickStats,
        totalConversions: totalConversions,
        conversionRate: conversionRate,
        totalCommissions: Math.round(totalCommissionsInRange * 100) / 100,
        uniqueVisitors: await ReferralTracking.countDocuments({ 
          affiliateId: affiliate._id,
          ipAddress: { $exists: true, $ne: null }
        }).then(count => count), // Simplified
      },
      bySource: bySource,
      byDevice: byDevice,
      earnings: {
        totalEarnings: Math.round(totalEarnings * 100) / 100,
        pendingEarnings: Math.round(pendingEarnings * 100) / 100,
        approvedEarnings: Math.round(approvedEarnings * 100) / 100,
        paidEarnings: Math.round(paidEarnings * 100) / 100,
      },
    };
  }

  /**
   * Update affiliate payout settings
   *
   * @param {ObjectId} userId - User ID
   * @param {Object} payoutDetails - Payout method and details
   */
  async updatePayoutSettings(userId, payoutDetails) {
    const affiliate = await Affiliate.findOne({ userId });
    if (!affiliate) {
      throw new NotFoundError('Affiliate account not found');
    }

    const { payoutMethod, payoutData, minimumThreshold } = payoutDetails;

    if (!payoutMethod || !['stripe', 'bank_transfer', 'paypal', 'none'].includes(payoutMethod)) {
      throw new ValidationError('Invalid payout method');
    }

    if (payoutMethod !== 'none' && !payoutData) {
      throw new ValidationError('Payout data required for selected method');
    }

    affiliate.payoutMethod = payoutMethod;
    affiliate.payoutDetails = payoutData || null;

    if (minimumThreshold && minimumThreshold > 0) {
      affiliate.minimumPayoutThreshold = minimumThreshold;
    }

    await affiliate.save();

    return {
      message: 'Payout settings updated successfully',
      payoutMethod: affiliate.payoutMethod,
      minimumThreshold: affiliate.minimumPayoutThreshold,
    };
  }

  /**
   * Check for suspicious referral activity
   *
   * @param {string} ipAddress - IP to check
   */
  async checkSuspiciousActivity(ipAddress) {
    const suspicious = await ReferralTracking.findSuspiciousPatterns(ipAddress, 50);
    return {
      hasSuspiciousActivity: suspicious.length > 0,
      patterns: suspicious,
    };
  }

  /**
   * Get top affiliates
   * Admin/public leaderboard
   *
   * @param {Object} options - Limit, sortBy
   */
  async getTopAffiliates(options = {}) {
    const { limit = 10, sortBy = 'totalEarnings' } = options;
    const validSortFields = ['totalEarnings', 'totalSales', 'totalClicks'];

    if (!validSortFields.includes(sortBy)) {
      throw new ValidationError('Invalid sort field');
    }

    const topAffiliates = await Affiliate.getTopAffiliates(limit, sortBy);

    return topAffiliates.map((aff) => ({
      userId: aff.userId,
      affiliateCode: aff.affiliateCode,
      totalEarnings: aff.totalEarnings,
      totalSales: aff.totalSales,
      totalClicks: aff.totalClicks,
      conversionRate: aff.getConversionRate(),
    }));
  }

  /**
   * Get affiliate statistics (admin)
   */
  async getAffiliateSystemStats() {
    const stats = await Affiliate.getStatistics();
    const totalReferrals = await ReferralTracking.countDocuments({});
    const topSources = await ReferralTracking.getTopReferralSources(5);

    return {
      byStatus: stats,
      totalReferrals,
      topReferralSources: topSources,
    };
  }

  /**
   * Helper: Get affiliate URL
   */
  _getAffiliateUrl(code, baseUrl = process.env.FRONTEND_URL || 'https://sphereofkings.com') {
    return `${baseUrl}/?ref=${code}`;
  }
}

// Export as singleton
module.exports = new AffiliateService();
