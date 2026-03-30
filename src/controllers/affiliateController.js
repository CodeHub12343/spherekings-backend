/**
 * Affiliate Controller
 * HTTP request handlers for affiliate endpoints
 */

const affiliateService = require('../services/affiliateService');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

class AffiliateController {
  /**
   * POST /api/affiliate/register
   * Register authenticated user as an affiliate
   *
   * Request Body:
   *   termsAccepted (boolean) - Must accept terms
   *   marketingChannels (string) - Where they will promote
   *   website (string, optional) - Website or social profile URL
   *   expectedMonthlyReferrals (number, optional) - Expected monthly referrals
   *   commissionRate (number, optional) - Commission percentage
   */
  async registerAffiliate(req, res, next) {
    try {
      const { 
        termsAccepted, 
        commissionRate,
        marketingChannels,
        website,
        expectedMonthlyReferrals,
      } = req.body;

      if (!termsAccepted) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'You must accept the affiliate terms and conditions',
          errors: [
            {
              field: 'termsAccepted',
              message: 'Terms must be accepted to register as an affiliate',
            },
          ],
        });
      }

      const result = await affiliateService.registerAffiliate(req.user._id, {
        termsAccepted,
        commissionRate,
        marketingChannels,
        website,
        expectedMonthlyReferrals,
      });

      return res.status(201).json({
        success: true,
        statusCode: 201,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/affiliate/dashboard
   * Get affiliate profile and dashboard analytics
   *
   * Query Parameters:
   *   startDate (string, optional) - ISO date
   *   endDate (string, optional) - ISO date
   *   affiliateId (string, optional) - For admins to view specific affiliate (must be admin)
   */
  async getAffiliateDashboard(req, res, next) {
    try {
      const filterOptions = {};
      
      // Determine which affiliate to get dashboard for
      let targetAffiliateId = req.user._id;
      
      // If user is a customer, look up their affiliate account
      if (req.user.role === 'customer' && !req.query.affiliateId) {
        const Affiliate = require('../models/Affiliate');
        const affiliate = await Affiliate.findOne({ userId: req.user._id });
        
        if (affiliate) {
          targetAffiliateId = affiliate._id;
        }
      }
      
      // If affiliateId query param provided, user must be admin
      if (req.query.affiliateId) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            statusCode: 403,
            message: 'Only admins can view other affiliates\' dashboards',
          });
        }
        targetAffiliateId = req.query.affiliateId;
      }

      if (req.query.startDate) {
        const date = new Date(req.query.startDate);
        if (isNaN(date)) {
          return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Invalid startDate format',
            errors: [{ field: 'startDate', message: 'Must be valid ISO date' }],
          });
        }
        filterOptions.startDate = req.query.startDate;
      }

      if (req.query.endDate) {
        const date = new Date(req.query.endDate);
        if (isNaN(date)) {
          return res.status(400).json({
            success: false,
            statusCode: 400,
            message: 'Invalid endDate format',
            errors: [{ field: 'endDate', message: 'Must be valid ISO date' }],
          });
        }
        filterOptions.endDate = req.query.endDate;
      }

      const dashboard = await affiliateService.getAffiliateProfile(targetAffiliateId, filterOptions);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Affiliate dashboard retrieved successfully',
        data: {
          dashboard,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/affiliate/referrals
   * Get referral traffic history
   *
   * Query Parameters:
   *   page (number) - Default 1
   *   limit (number) - Default 20, max 100
   *   convertedOnly (boolean) - Show only converted referrals
   *   startDate, endDate (string) - Date range
   */
  async getAffiliateReferrals(req, res, next) {
    try {
      let targetAffiliateId = req.user._id;
      
      // If user is a customer, look up their affiliate account
      if (req.user.role === 'customer') {
        const Affiliate = require('../models/Affiliate');
        const affiliate = await Affiliate.findOne({ userId: req.user._id });
        
        if (affiliate) {
          targetAffiliateId = affiliate._id;
        } else {
          // Customer has no affiliate account
          return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Referral history retrieved successfully',
            data: {
              referrals: [],
              pagination: { page: 1, limit: 20, total: 0, pages: 0 },
            },
          });
        }
      }
      
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        convertedOnly: req.query.convertedOnly || false,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
      };

      const result = await affiliateService.getAffiliateReferrals(targetAffiliateId, options);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Referral history retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/affiliate/sales
   * Get sales generated through affiliate referrals
   *
   * Query Parameters:
   *   page (number) - Default 1
   *   limit (number) - Default 20, max 100
   *   status (string) - Commission status
   *   startDate, endDate (string) - Date range
   */
  async getAffiliateSales(req, res, next) {
    try {
      let targetAffiliateId = req.user._id;
      
      // If user is a customer, look up their affiliate account
      if (req.user.role === 'customer') {
        const Affiliate = require('../models/Affiliate');
        const affiliate = await Affiliate.findOne({ userId: req.user._id });
        
        if (affiliate) {
          targetAffiliateId = affiliate._id;
        } else {
          // Customer has no affiliate account
          return res.status(200).json({
            success: true,
            statusCode: 200,
            message: 'Affiliate sales retrieved successfully',
            data: {
              sales: [],
              pagination: { page: 1, limit: 20, total: 0, pages: 0 },
              statistics: {
                totalSalesAmount: 0,
                totalCommissions: 0,
                salesCount: 0,
                averageOrderValue: 0,
              },
            },
          });
        }
      }
      
      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 20,
        status: req.query.status || null,
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
      };

      const result = await affiliateService.getAffiliateSales(targetAffiliateId, options);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Affiliate sales retrieved successfully',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/affiliate/analytics
   * Get detailed analytics for affiliate
   *
   * Query Parameters:
   *   startDate (string) - ISO date
   *   endDate (string) - ISO date
   *   affiliateId (string, optional) - For admins to view specific affiliate (must be admin)
   */
  async getAffiliateAnalytics(req, res, next) {
    try {
      const options = {
        startDate: req.query.startDate || null,
        endDate: req.query.endDate || null,
      };
      
      // Determine which affiliate to get analytics for
      let targetAffiliateId = req.user._id;
      
      // If user is a customer, look up their affiliate account
      if (req.user.role === 'customer' && !req.query.affiliateId) {
        const Affiliate = require('../models/Affiliate');
        const affiliate = await Affiliate.findOne({ userId: req.user._id });
        
        if (affiliate) {
          targetAffiliateId = affiliate._id;
        }
      }
      
      // If affiliateId query param provided, user must be admin
      if (req.query.affiliateId) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            statusCode: 403,
            message: 'Only admins can view other affiliates\' analytics',
          });
        }
        targetAffiliateId = req.query.affiliateId;
      }

      const analytics = await affiliateService.getAffiliateAnalytics(targetAffiliateId, options);

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Affiliate analytics retrieved successfully',
        data: {
          analytics,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/affiliate/payout-settings
   * Update affiliate payout method and settings
   *
   * Request Body:
   *   payoutMethod (string) - stripe, bank_transfer, paypal, none
   *   payoutData (string) - Method-specific data
   *   minimumThreshold (number, optional) - Minimum payout amount
   */
  async updatePayoutSettings(req, res, next) {
    try {
      const { payoutMethod, payoutData, minimumThreshold } = req.body;

      if (!payoutMethod) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Validation error',
          errors: [
            {
              field: 'payoutMethod',
              message: 'payoutMethod is required',
            },
          ],
        });
      }

      const result = await affiliateService.updatePayoutSettings(req.user._id, {
        payoutMethod,
        payoutData,
        minimumThreshold,
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: result.message,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Middleware: Record referral click
   * Called automatically for all visitors
   * Stores ref=CODE in cookie for purchase attribution
   *
   * This is typically called from a tracking endpoint or middleware
   *
   * Query Parameter: ref (affiliate code)
   */
  async recordReferralClick(req, res, next) {
    try {
      const { ref } = req.query;
      
      console.log(`📍 [TRACKING/CLICK] Endpoint called with ref: ${ref}`);

      if (!ref) {
        console.log(`⚠️  [TRACKING/CLICK] No affiliate code provided`);
        // No affiliate code, just continue
        return res.status(200).json({
          success: true,
          message: 'No referral code',
          data: null,
        });
      }

      const clickData = {
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('user-agent') || null,
        referrer: req.get('referer') || null,
        referralSource: req.headers['x-referral-source'] || 'direct',
        device: req.headers['x-device-type'] || 'desktop',
        cookieId: req.cookies?.cookieId || null,
        sessionId: req.sessionID || null,
        utmCampaign: req.query.utm_campaign || null,
        utmMedium: req.query.utm_medium || null,
        utmSource: req.query.utm_source || null,
        utmContent: req.query.utm_content || null,
      };

      console.log(`🔍 [TRACKING/CLICK] Click data prepared`);
      const trackingData = await affiliateService.recordReferralClick(ref, clickData);
      console.log(`✅ [TRACKING/CLICK] ReferralTracking record created:`, trackingData);

      // 🎯 CRITICAL: Set affiliate_ref cookie for frontend to read during checkout
      console.log('\n╔═══════════════════════════════════════════════════════════╗');
      console.log('║       SETTING affiliate_ref COOKIE FOR CHECKOUT             ║');
      console.log('╚═══════════════════════════════════════════════════════════╝');
      
      // Generate unique visitor ID for tracking
      const visitorId = `visitor_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // Prepare affiliate_ref cookie data (in same format frontend expects)
      const affiliateRefData = {
        affiliateId: trackingData.affiliateId.toString(),
        affiliateCode: trackingData.affiliateCode,
        visitorId,
        timestamp: new Date().toISOString(),
      };
      
      console.log('📋 [COOKIE DATA] Creating affiliate_ref cookie with:', {
        affiliateId: affiliateRefData.affiliateId.substring(0, 12) + '...',
        affiliateCode: affiliateRefData.affiliateCode,
        visitorId: visitorId.substring(0, 20) + '...',
        timestamp: affiliateRefData.timestamp,
      });

      // Set SINGLE affiliate_ref cookie (NOT httpOnly so frontend can read!)
      res.cookie('affiliate_ref', JSON.stringify(affiliateRefData), {
        maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
        httpOnly: false, // 🔓 CRITICAL: Must be false so frontend JS can read it
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'Lax',
        path: '/',
      });

      console.log('✅ [COOKIE SET] affiliate_ref cookie created successfully');
      console.log('📌 [COOKIE INFO] Frontend will be able to read this cookie during checkout');
      console.log('═══════════════════════════════════════════════════════════\n');

      console.log(`🎯 [TRACKING/CLICK] Referral tracked successfully for: ${ref}`);
      console.log(`✅ [SUCCESS] Affiliate attribution data ready for order checkout\n`);
      
      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Referral tracked successfully',
        data: {
          ...trackingData,
          visitorId,
          cookieSet: true,
          cookieName: 'affiliate_ref',
        },
      });
    } catch (error) {
      // Log the error details
      console.error(`\n❌ [TRACKING/CLICK] ERROR tracking referral:`, {
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        status: error.status,
        refCode: ref,
        stack: error.stack?.split('\n').slice(0, 3),
      });
      
      console.log('⚠️  [TRACKING/CLICK] Affiliate attribution may be incomplete');
      console.log('📌 [NOTE] Still returning 200 to avoid blocking frontend\n');
      
      // Still return success to not block the request, but log the error
      res.status(200).json({
        success: false,
        message: `Referral tracking error: ${error.message}`,
        data: null,
        error: 'AFFILIATE_TRACKING_ERROR',
      });
    }
  }

  /**
   * GET /api/leaderboard/affiliates
   * Get top performing affiliates (public/open)
   *
   * Query Parameters:
   *   limit (number) - Max 50, default 10
   *   sortBy (string) - totalEarnings, totalSales, totalClicks
   */
  async getTopAffiliates(req, res, next) {
    try {
      const limit = Math.min(50, parseInt(req.query.limit) || 10);
      const sortBy = req.query.sortBy || 'totalEarnings';

      const topAffiliates = await affiliateService.getTopAffiliates({
        limit,
        sortBy,
      });

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Top affiliates retrieved successfully',
        data: {
          affiliates: topAffiliates,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/affiliate-stats
   * Get affiliate system statistics (admin only)
   */
  async getAffiliateSystemStats(req, res, next) {
    try {
      const stats = await affiliateService.getAffiliateSystemStats();

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Affiliate system statistics retrieved',
        data: {
          statistics: stats,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/affiliate/:affiliateId/suspend
   * Suspend an affiliate account (admin only)
   */
  async suspendAffiliate(req, res, next) {
    try {
      const { affiliateId } = req.params;
      const { reason } = req.body;

      const Affiliate = require('../models/Affiliate');
      const affiliate = await Affiliate.findById(affiliateId);

      if (!affiliate) {
        return res.status(404).json({
          success: false,
          statusCode: 404,
          message: 'Affiliate not found',
        });
      }

      await affiliate.suspend(reason || 'Admin suspension');

      return res.status(200).json({
        success: true,
        statusCode: 200,
        message: 'Affiliate suspended successfully',
        data: {
          affiliateId: affiliate._id,
          status: affiliate.status,
          reason: affiliate.suspensionReason,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export as singleton
module.exports = new AffiliateController();
