/**
 * Referral Tracking Service
 * Handles affiliate referral click tracking, cookie management, and attribution logic
 */

const ReferralTracking = require('../models/ReferralTracking');
const Affiliate = require('../models/Affiliate');
const Order = require('../models/Order');
const { ValidationError, NotFoundError } = require('../utils/errors');
const crypto = require('crypto');

class ReferralTrackingService {
  /**
   * Record a referral click when user visits affiliate link
   *
   * Flow:
   * 1. Validate affiliate code exists
   * 2. Extract IP, user agent, and device info
   * 3. Check for suspicious patterns
   * 4. Create referral tracking record
   * 5. Generate or retrieve visitor ID
   * 6. Return data for cookie setting
   *
   * @param {string} affiliateCode - Affiliate code from URL
   * @param {Object} requestInfo - Request metadata
   *   - ipAddress: Visitor IP
   *   - userAgent: Browser user agent
   *   - referrerUrl: HTTP referrer
   *   - landingPage: Destination page
   *   - device: Device type (mobile, tablet, desktop)
   *   - utm_*: UTM parameters
   * @returns {Promise<Object>} { visitorId, affiliateId, cookieData }
   */
  async recordReferralClick(affiliateCode, requestInfo) {
    try {
      // Validate affiliate code format
      if (!affiliateCode || typeof affiliateCode !== 'string') {
        throw new ValidationError('Invalid affiliate code');
      }

      affiliateCode = affiliateCode.toUpperCase().trim();

      // Find affiliate by code
      const affiliate = await Affiliate.findOne({
        affiliateCode,
        status: 'active',
      }).select('_id affiliateCode');

      if (!affiliate) {
        throw new NotFoundError(`Affiliate code ${affiliateCode} not found or inactive`);
      }

      // Extract request info with defaults
      const {
        ipAddress = '0.0.0.0',
        userAgent = '',
        referrerUrl = '',
        landingPage = '/',
        device = 'desktop',
        sessionId = null,
        utmCampaign = null,
        utmMedium = null,
        utmSource = null,
        utmContent = null,
      } = requestInfo;

      // Check for suspicious patterns (fraud prevention)
      const suspiciousFlags = await this._checkSuspiciousActivity(ipAddress, affiliateCode);

      // Generate visitor ID
      const visitorId = this._generateVisitorId();
      const cookieId = crypto.randomBytes(16).toString('hex');

      // Create referral tracking record
      const referralRecord = await ReferralTracking.create({
        affiliateId: affiliate._id,
        affiliateCode: affiliate.affiliateCode,
        ipAddress,
        userAgent,
        httpReferrer: referrerUrl,
        referralSource: this._extractReferralSource(referrerUrl, utmSource),
        utmCampaign,
        utmMedium,
        utmSource,
        utmContent,
        cookieId,
        sessionId,
        landingUrl: landingPage,
        device,
        visitorId,
        suspicious: suspiciousFlags.isSuspicious,
        suspiciousReason: suspiciousFlags.reason,
      });

      // Log referral click
      console.log(`✅ Referral Click Tracked - Code: ${affiliateCode}, IP: ${ipAddress}`);

      return {
        visitorId,
        affiliateId: affiliate._id.toString(),
        affiliateCode: affiliate.affiliateCode,
        cookieData: {
          visitorId,
          cookieId,
          affiliateCode,
          affiliateId: affiliate._id.toString(),
          timestamp: new Date().toISOString(),
        },
      };
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new Error(`Failed to record referral click: ${error.message}`);
    }
  }

  /**
   * Attribute an order to an affiliate based on stored referral cookie
   *
   * Flow:
   * 1. Extract referral cookie data
   * 2. Validate affiliate code and affiliateId
   * 3. Find most recent referral click for this visitor
   * 4. Verify affiliate is active
   * 5. Check for self-referral
   * 6. Create referral-order linkage
   * 7. Update affiliate metrics
   *
   * @param {Object} orderData - Order information
   *   - orderId: Order ID
   *   - userId: User/Customer ID
   *   - total: Order total amount
   *   - affiliateCookie: Referral cookie data
   * @param {number} commissionPercentage - Commission percentage to calculate
   * @returns {Promise<Object>} { affiliateId, commissionAmount, attributionSuccess }
   */
  async attributeOrderToAffiliate(orderData, commissionPercentage = 10) {
    try {
      const { orderId, userId, total, affiliateCookie } = orderData;

      // Validate required data
      if (!orderId || !total || !affiliateCookie) {
        return {
          affiliateId: null,
          commissionAmount: 0,
          attributionSuccess: false,
          reason: 'Missing order or affiliate data',
        };
      }

      let { affiliateCode, affiliateId, visitorId } = affiliateCookie;

      // If we don't have affiliateCode but have affiliateId, look it up
      if (!affiliateCode && affiliateId) {
        try {
          const Affiliate = require('../models/Affiliate');
          const affiliate = await Affiliate.findById(affiliateId).select('affiliateCode');
          if (affiliate) {
            affiliateCode = affiliate.affiliateCode;
          }
        } catch (e) {
          // Continue without affiliate code
        }
      }

      // Validate we have at least affiliateId
      if (!affiliateId) {
        return {
          affiliateId: null,
          commissionAmount: 0,
          attributionSuccess: false,
          reason: 'Missing affiliate ID',
        };
      }

      // Try to find the original referral click
      // Priority: visitorId + affiliateCode (if available), then just affiliateCode
      let referralClick = null;
      
      if (visitorId && affiliateCode) {
        // Try exact match with visitorId and code
        referralClick = await ReferralTracking.findOne({
          affiliateCode: affiliateCode.toUpperCase(),
          visitorId,
        })
          .sort({ createdAt: -1 })
          .limit(1);
      } else if (affiliateCode) {
        // Fall back to just affiliateCode match for this affiliate
        referralClick = await ReferralTracking.findOne({
          affiliateCode: affiliateCode.toUpperCase(),
        })
          .sort({ createdAt: -1 })
          .limit(1);
      }

      // If we have a referral click but it's already converted, still allow conversion
      // (user might have made multiple purchases)
      if (!referralClick && affiliateCode) {
        console.warn(
          `⚠️  No matching referral click found for ${affiliateCode} / visitor ${visitorId}, but proceeding with order attribution`
        );
      }

      // Verify affiliate is still active
      const affiliate = await Affiliate.findById(affiliateId).select('_id status userId');

      if (!affiliate || affiliate.status !== 'active') {
        return {
          affiliateId: null,
          commissionAmount: 0,
          attributionSuccess: false,
          reason: 'Affiliate is not active',
        };
      }

      // Prevent self-referral (affiliate purchasing through own link)
      if (affiliate.userId.toString() === userId.toString()) {
        console.warn(`⚠️  Self-referral prevented - Affiliate ${affiliateId} purchasing own link`);

        return {
          affiliateId: null,
          commissionAmount: 0,
          attributionSuccess: false,
          reason: 'Self-referral not allowed',
        };
      }

      // Calculate commission
      const commissionAmount = Number((total * (commissionPercentage / 100)).toFixed(2));

      // Update referral tracking record with conversion if found
      if (referralClick) {
        await referralClick.convertToSale(orderId, commissionAmount);
        console.log(
          `✅ Referral Click Converted - Order: ${orderId}, Affiliate: ${affiliateCode}, Commission: $${commissionAmount}`
        );
      }

      console.log(
        `✅ Order Attributed - Order: ${orderId}, Affiliate: ${affiliateCode}, Commission: $${commissionAmount}`
      );

      return {
        affiliateId: affiliate._id.toString(),
        commissionAmount,
        attributionSuccess: true,
        reason: 'Order successfully attributed',
      };
    } catch (error) {
      console.error(`❌ Attribution Error: ${error.message}`);
      return {
        affiliateId: null,
        commissionAmount: 0,
        attributionSuccess: false,
        reason: error.message,
      };
    }
  }

  /**
   * Get referral cookie data from HTTP cookies
   * Used during checkout to read affiliate attribution
   *
   * @param {Object} cookies - Express cookies object
   * @returns {Object|null} Cookie data or null
   */
  getReferralCookieData(cookies) {
    try {
      if (!cookies || !cookies.affiliate_ref) {
        return null;
      }

      // Parse cookie data (should be JSON)
      const cookieData = JSON.parse(cookies.affiliate_ref);

      // Validate required fields
      if (!cookieData.affiliateCode || !cookieData.affiliateId) {
        return null;
      }

      return cookieData;
    } catch (error) {
      // Invalid cookie format, return null
      return null;
    }
  }

  /**
   * Get referral statistics for an affiliate
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Options
   *   - dateFrom: Start date
   *   - dateTo: End date
   * @returns {Promise<Object>} Detailed statistics
   */
  async getAffiliateReferralStats(affiliateId, options = {}) {
    try {
      const { dateFrom, dateTo } = options;

      // Build date filter
      const dateFilter = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);

      const query = { affiliateId };
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      // Get basic stats using static method
      const stats = await ReferralTracking.getAffiliateStats(affiliateId, dateFrom, dateTo);

      // Get stats by source
      const bySource = await ReferralTracking.getReferralsBySource(affiliateId);

      // Get stats by device
      const byDevice = await ReferralTracking.getReferralsByDevice(affiliateId);

      return {
        overview: stats,
        bySource: bySource || [],
        byDevice: byDevice || [],
      };
    } catch (error) {
      throw new Error(`Failed to get referral statistics: ${error.message}`);
    }
  }

  /**
   * Get referral clicks with pagination
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Pagination and filter options
   * @returns {Promise<Object>} Paginated referral clicks
   */
  async getAffiliateReferrals(affiliateId, options = {}) {
    try {
      const { page = 1, limit = 20, convertedOnly = false, dateFrom, dateTo } = options;

      // Build date filter
      const dateFilter = {};
      if (dateFrom) dateFilter.$gte = new Date(dateFrom);
      if (dateTo) dateFilter.$lte = new Date(dateTo);

      const query = { affiliateId };
      if (Object.keys(dateFilter).length > 0) {
        query.createdAt = dateFilter;
      }

      if (convertedOnly) {
        query.convertedToSale = true;
      }

      // Execute paginated query
      const referrals = await ReferralTracking.getReferralsInDateRange(
        affiliateId,
        dateFrom ? new Date(dateFrom) : new Date(0),
        dateTo ? new Date(dateTo) : new Date(),
        { limit, page, convertedOnly }
      );

      return referrals;
    } catch (error) {
      throw new Error(`Failed to get referral clicks: ${error.message}`);
    }
  }

  /**
   * Get sales attributed to affiliate
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Sales data with pagination
   */
  async getAffiliateSales(affiliateId, options = {}) {
    try {
      const { page = 1, limit = 20, dateFrom, dateTo } = options;
      const skip = (page - 1) * limit;

      // Build query for affiliated orders
      const query = {
        'affiliateDetails.affiliateId': affiliateId,
        paymentStatus: 'paid', // Only paid orders
      };

      // Add date filter if provided
      if (dateFrom || dateTo) {
        query.createdAt = {};
        if (dateFrom) query.createdAt.$gte = new Date(dateFrom);
        if (dateTo) query.createdAt.$lte = new Date(dateTo);
      }

      // Get orders with affiliate attribution
      const Order = require('../models/Order');
      const sales = await Order.find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('orderNumber total paymentStatus affiliateDetails createdAt')
        .lean();

      // Get total count
      const total = await Order.countDocuments(query);

      // Enrich sales with commission data from Commission model
      const Commission = require('../models/Commission');
      const enrichedSales = await Promise.all(
        sales.map(async (sale) => {
          const commission = await Commission.findOne({ orderId: sale._id }).lean();
          return {
            ...sale,
            orderId: sale._id,
            commissionAmount: commission?.calculation?.amount || 0,
            commissionStatus: commission?.status || 'pending',
          };
        })
      );

      return {
        sales: enrichedSales,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new Error(`Failed to get affiliate sales: ${error.message}`);
    }
  }

  /**
   * Check for suspicious referral activity (fraud prevention)
   *
   * @private
   * @param {string} ipAddress - IP address to check
   * @param {string} affiliateCode - Affiliate code
   * @returns {Promise<Object>} { isSuspicious, reason }
   */
  async _checkSuspiciousActivity(ipAddress, affiliateCode) {
    try {
      // Check for excessive clicks from same IP in 24 hours
      const last24Hours = new Date(Date.now() - 24 * 60 * 60 * 1000);

      const recentClicks = await ReferralTracking.countDocuments({
        ipAddress,
        createdAt: { $gte: last24Hours },
      });

      // Flag if more than 50 clicks from same IP in 24 hours
      if (recentClicks > 50) {
        return {
          isSuspicious: true,
          reason: `Excessive clicks (${recentClicks}) from IP ${ipAddress} in 24 hours`,
        };
      }

      // Check for multiple affiliate codes from same IP (rapid switching)
      const affiliateCodes = await ReferralTracking.find({
        ipAddress,
        createdAt: { $gte: last24Hours },
      }).distinct('affiliateCode');

      if (affiliateCodes.length > 10) {
        return {
          isSuspicious: true,
          reason: `Multiple affiliate codes (${affiliateCodes.length}) from same IP`,
        };
      }

      return {
        isSuspicious: false,
        reason: null,
      };
    } catch (error) {
      // Don't fail on fraud check, just log and continue
      console.warn(`Fraud check error: ${error.message}`);
      return {
        isSuspicious: false,
        reason: null,
      };
    }
  }

  /**
   * Extract referral source from HTTP referrer or UTM source
   *
   * @private
   * @param {string} referrerUrl - HTTP referrer URL
   * @param {string} utmSource - UTM source parameter
   * @returns {string} Referral source enum value
   */
  _extractReferralSource(referrerUrl, utmSource) {
    // Priority: UTM source > domain analysis
    if (utmSource) {
      const sources = ['email', 'facebook', 'twitter', 'instagram', 'tiktok', 'reddit', 'blog'];
      for (const source of sources) {
        if (utmSource.toLowerCase().includes(source)) {
          return source;
        }
      }
      return utmSource.length > 0 ? 'other' : 'direct';
    }

    // Analyze referrer domain
    if (!referrerUrl) return 'direct';

    try {
      const url = new URL(referrerUrl);
      const domain = url.hostname.toLowerCase();

      if (domain.includes('facebook.com')) return 'facebook';
      if (domain.includes('twitter.com') || domain.includes('x.com')) return 'twitter';
      if (domain.includes('instagram.com')) return 'instagram';
      if (domain.includes('tiktok.com')) return 'tiktok';
      if (domain.includes('reddit.com')) return 'reddit';
      if (domain.includes('gmail.com') || domain.includes('outlook.com')) return 'email';
    } catch (error) {
      // Invalid URL, default to other
    }

    return 'other';
  }

  /**
   * Generate unique visitor identifier
   *
   * @private
   * @returns {string} Visitor ID
   */
  _generateVisitorId() {
    return `visitor_${crypto.randomBytes(12).toString('hex')}`;
  }
}

// Export singleton instance
module.exports = new ReferralTrackingService();
