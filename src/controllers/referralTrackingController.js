/**
 * Referral Tracking Controller
 * HTTP request handlers for affiliate referral tracking and attribution
 */

const referralTrackingService = require('../services/referralTrackingService');
const { ValidationError } = require('../utils/errors');

class ReferralTrackingController {
  /**
   * GET /api/ref/:affiliateCode
   *
   * Track referral click and redirect to landing page
   *
   * Flow:
   * 1. Extract affiliate code from URL
   * 2. Extract request metadata (IP, user agent, etc.)
   * 3. Validate and record referral click
   * 4. Set referral attribution cookie
   * 5. Redirect to landing page (or home if not specified)
   *
   * Query Parameters:
   *   ref - Affiliate code (also in URL path)
   *   redirect - Landing page (default: /)
   *   utm_campaign - UTM campaign parameter
   *   utm_medium - UTM medium parameter
   *   utm_source - UTM source parameter
   *   utm_content - UTM content parameter
   *
   * Cookies Set:
   *   affiliate_ref - JSON with { affiliateCode, affiliateId, visitorId, timestamp }
   *   Expires: 30 days
   *   HttpOnly: false (allows frontend JS to read)
   *   Secure: true (HTTPS only in production)
   *   SameSite: Lax
   *
   * @param {Object} req - Express request
   * @param {string} req.params.affiliateCode - Affiliate code from URL
   * @param {string} req.query.redirect - Landing page path
   * @param {string} req.query.utm_* - UTM parameters
   * @param {Object} req - Contains IP, user agent, cookies
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {void} Sets cookie and redirects
   */
  async trackReferral(req, res, next) {
    try {
      const { affiliateCode } = req.params;

      // Extract request metadata
      const requestInfo = {
        ipAddress: req.clientIp || req.ip || '0.0.0.0',
        userAgent: req.headers['user-agent'] || '',
        referrerUrl: req.headers['referer'] || '',
        landingPage: req.query.redirect || '/',
        device: req.deviceType || 'desktop',
        sessionId: req.sessionId || null,
        utmCampaign: req.query.utm_campaign || null,
        utmMedium: req.query.utm_medium || null,
        utmSource: req.query.utm_source || null,
        utmContent: req.query.utm_content || null,
      };

      // Validate parameter
      if (!affiliateCode) {
        throw new ValidationError('Affiliate code is required');
      }

      // Record referral click via service
      const referralData = await referralTrackingService.recordReferralClick(
        affiliateCode,
        requestInfo
      );

      // Set referral cookie (30-day expiration)
      const cookieMaxAge = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

      res.cookie('affiliate_ref', JSON.stringify(referralData.cookieData), {
        maxAge: cookieMaxAge,
        httpOnly: false, // Allow frontend JS to read the cookie
        secure: process.env.NODE_ENV === 'production', // HTTPS in production
        sameSite: 'Lax', // Prevent CSRF while allowing navigation
        path: '/',
      });

      // Log the tracking event
      console.log(
        `📍 Referral Tracked - Code: ${affiliateCode}, IP: ${requestInfo.ipAddress}, Device: ${requestInfo.device}`
      );

      // In development mode without frontend, return JSON instead of redirecting
      if (process.env.NODE_ENV === 'development' && !process.env.FRONTEND_URL) {
        return res.status(200).json({
          success: true,
          message: 'Referral tracked successfully',
          data: referralData,
        });
      }

      // Determine redirect URL
      const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
      const redirectPath = requestInfo.landingPage.startsWith('/')
        ? requestInfo.landingPage
        : `/${requestInfo.landingPage}`;

      const redirectUrl = `${frontendUrl}${redirectPath}`;

      // Redirect to landing page
      return res.redirect(302, redirectUrl);
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tracking/stats/:affiliateId
   *
   * Get referral statistics for an affiliate
   * Requires authentication
   *
   * Query Parameters:
   *   dateFrom - Start date (ISO format, optional)
   *   dateTo - End date (ISO format, optional)
   *
   * @param {Object} req - Express request
   * @param {string} req.params.affiliateId - Affiliate ID
   * @param {string} req.query.dateFrom - Start date
   * @param {string} req.query.dateTo - End date
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getReferralStats(req, res, next) {
    try {
      const { affiliateId } = req.params;

      const options = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      // Get statistics
      const stats = await referralTrackingService.getAffiliateReferralStats(
        affiliateId,
        options
      );

      return res.status(200).json({
        success: true,
        message: 'Referral statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tracking/referrals/:affiliateId
   *
   * Get referral clicks for an affiliate with pagination
   * Requires authentication
   *
   * Query Parameters:
   *   page - Page number (default: 1)
   *   limit - Items per page (default: 20, max: 100)
   *   convertedOnly - Show only converted referrals (default: false)
   *   dateFrom - Start date (ISO format, optional)
   *   dateTo - End date (ISO format, optional)
   *
   * @param {Object} req - Express request
   * @param {string} req.params.affiliateId - Affiliate ID
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getReferrals(req, res, next) {
    try {
      const { affiliateId } = req.params;

      // Parse pagination parameters
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 20;

      // Validate and cap pagination
      page = Math.max(1, page);
      limit = Math.min(limit, 100); // Max 100 per page

      const options = {
        page,
        limit,
        convertedOnly: req.query.convertedOnly === 'true',
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      // Get referrals
      const result = await referralTrackingService.getAffiliateReferrals(
        affiliateId,
        options
      );

      return res.status(200).json({
        success: true,
        message: 'Referral clicks retrieved successfully',
        data: {
          referrals: result.referrals,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tracking/sales/:affiliateId
   *
   * Get sales attributed to an affiliate
   * Requires authentication
   *
   * Query Parameters:
   *   page - Page number (default: 1)
   *   limit - Items per page (default: 20, max: 100)
   *   dateFrom - Start date (ISO format, optional)
   *   dateTo - End date (ISO format, optional)
   *
   * @param {Object} req - Express request
   * @param {string} req.params.affiliateId - Affiliate ID
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getSales(req, res, next) {
    try {
      const { affiliateId } = req.params;

      // Parse pagination parameters
      let page = parseInt(req.query.page) || 1;
      let limit = parseInt(req.query.limit) || 20;

      // Validate and cap pagination
      page = Math.max(1, page);
      limit = Math.min(limit, 100); // Max 100 per page

      const options = {
        page,
        limit,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      // Get sales
      const result = await referralTrackingService.getAffiliateSales(
        affiliateId,
        options
      );

      return res.status(200).json({
        success: true,
        message: 'Sales retrieved successfully',
        data: {
          sales: result.sales,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/tracking/health
   *
   * Health check endpoint for referral tracking system
   * Returns system status information
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @returns {void}
   */
  async getSystemHealth(req, res) {
    res.status(200).json({
      success: true,
      message: 'Referral tracking system is operational',
      status: 'healthy',
      timestamp: new Date().toISOString(),
      features: {
        clickTracking: true,
        cookieAttribution: true,
        fraudDetection: true,
        analytics: true,
      },
    });
  }
}

// Export singleton instance
module.exports = new ReferralTrackingController();
