/**
 * Affiliate Routes
 * API endpoints for affiliate registration, tracking, and dashboard
 */

const express = require('express');
const router = express.Router();
const affiliateController = require('../controllers/affiliateController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  validateAffiliate,
  registerAffiliateSchema,
  dashboardQuerySchema,
  referralsQuerySchema,
  salesQuerySchema,
  analyticsQuerySchema,
  payoutSettingsSchema,
  leaderboardQuerySchema,
  suspendAffiliateSchema,
} = require('../validators/affiliateValidator');

/**
 * ==================== PUBLIC ROUTES ====================
 */

/**
 * GET /api/tracking/click
 *
 * Public endpoint to track referral clicks
 * Called by frontend when visitor arrives with ?ref=CODE parameter
 *
 * Query Parameters:
 *   ref (string) - Affiliate code
 *   utm_campaign, utm_medium, utm_source, utm_content (optional) - UTM parameters
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Referral tracked successfully",
 *     "data": {
 *       "trackingId": "ObjectId",
 *       "affiliateId": "ObjectId",
 *       "affiliateCode": "AFF12345678"
 *     }
 *   }
 *
 * Sets cookies:
 * - affiliateId: Secure, HttpOnly
 * - affiliateCode: Not HttpOnly (for client access if needed)
 */
router.get('/click', (req, res, next) => {
  console.log('🎯 [ROUTE] /click route handler invoked');
  console.log('🎯 [ROUTE] Query params:', req.query);
  console.log('🎯 [ROUTE] Referral cookie:', req.referralCookie);
  next();
}, affiliateController.recordReferralClick);

/**
 * GET /api/leaderboard
 *
 * Public endpoint to view top performing affiliates
 * Can be used for public leaderboard display
 *
 * Query Parameters:
 *   limit (number) - Default 10, max 50
 *   sortBy (string) - totalEarnings, totalSales, totalClicks
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "affiliates": [ ... ]
 *     }
 *   }
 */
router.get('/', validateAffiliate(leaderboardQuerySchema, 'query'), affiliateController.getTopAffiliates);

/**
 * ==================== CUSTOMER/AFFILIATE ROUTES ====================
 * All routes below require JWT authentication
 */

/**
 * POST /api/affiliate/register
 *
 * Register authenticated user as an affiliate
 *
 * Requires:
 * - Authentication: JWT token
 * - User doesn't already have affiliate account
 *
 * Request Body:
 *   {
 *     "termsAccepted": true,
 *     "commissionRate": 10 (optional, uses system default if not provided)
 *   }
 *
 * Response (201 Created):
 *   {
 *     "success": true,
 *     "statusCode": 201,
 *     "message": "Affiliate account created successfully. Please verify your email to activate.",
 *     "data": {
 *       "affiliateId": "ObjectId",
 *       "affiliateCode": "AFF12345678",
 *       "referralUrl": "https://sphereofkings.com/?ref=AFF12345678",
 *       "status": "pending"
 *     }
 *   }
 *
 * Error (409 Conflict - User already has affiliate account):
 *   {
 *     "success": false,
 *     "statusCode": 409,
 *     "message": "User already has an affiliate account"
 *   }
 */
router.post(
  '/register',
  authenticate,
  validateAffiliate(registerAffiliateSchema, 'body'),
  affiliateController.registerAffiliate
);

/**
 * GET /api/affiliate/dashboard
 *
 * Get authenticated affiliate's dashboard with analytics
 *
 * Requires:
 * - Authentication: JWT token
 * - User must have active affiliate account
 *
 * Query Parameters:
 *   startDate (string, optional) - ISO date for analytics period
 *   endDate (string, optional) - ISO date for analytics period
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Affiliate dashboard retrieved successfully",
 *     "data": {
 *       "dashboard": {
 *         "affiliateCode": "AFF12345678",
 *         "referralUrl": "https://...",
 *         "status": "active",
 *         "stats": {
 *           "totalClicks": 150,
 *           "totalConversions": 12,
 *           "conversionRate": 8.0,
 *           "totalCommissions": 1549.99,
 *           "uniqueVisitors": 120
 *         },
 *         "earnings": {
 *           "totalEarnings": 500.00,
 *           "pendingEarnings": 150.00,
 *           "paidEarnings": 350.00,
 *           "meetsThreshold": true,
 *           "minimumPayoutThreshold": 50
 *         }
 *       }
 *     }
 *   }
 */
router.get(
  '/dashboard',
  authenticate,
  validateAffiliate(dashboardQuerySchema, 'query'),
  affiliateController.getAffiliateDashboard
);

/**
 * GET /api/affiliate/referrals
 *
 * Get referral click history for affiliate
 *
 * Query Parameters:
 *   page (number) - Default 1
 *   limit (number) - Default 20, max 100
 *   convertedOnly (boolean) - Show only clicks that converted to sales
 *   startDate (string) - ISO date
 *   endDate (string) - ISO date
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "referrals": [
 *         {
 *           "_id": "ObjectId",
 *           "affiliateCode": "AFF12345678",
 *           "ipAddress": "192.168.1.1",
 *           "device": "mobile",
 *           "referralSource": "email",
 *           "convertedToSale": true,
 *           "commissionAmount": 50.00,
 *           "createdAt": "2024-03-13T10:30:00Z"
 *         }
 *       ],
 *       "pagination": { ... }
 *     }
 *   }
 */
router.get(
  '/referrals',
  authenticate,
  validateAffiliate(referralsQuerySchema, 'query'),
  affiliateController.getAffiliateReferrals
);

/**
 * GET /api/affiliate/sales
 *
 * Get orders attributed to affiliate with commission details
 *
 * Query Parameters:
 *   page (number) - Default 1
 *   limit (number) - Default 20, max 100
 *   status (string) - Commission status: pending, approved, paid, reversed
 *   startDate (string) - ISO date
 *   endDate (string) - ISO date
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "sales": [
 *         {
 *           "_id": "ObjectId",
 *           "orderNumber": "ORD-20240101-123456",
 *           "total": 199.99,
 *           "paymentStatus": "paid",
 *           "orderStatus": "shipped",
 *           "affiliateDetails": {
 *             "commissionAmount": 20.00,
 *             "commissionRate": 10,
 *             "status": "pending"
 *           },
 *           "createdAt": "2024-03-13T10:30:00Z"
 *         }
 *       ],
 *       "pagination": { ... },
 *       "statistics": {
 *         "totalSalesAmount": 5000.00,
 *         "totalCommissions": 500.00,
 *         "salesCount": 25,
 *         "averageOrderValue": 200.00
 *       }
 *     }
 *   }
 */
router.get(
  '/sales',
  authenticate,
  validateAffiliate(salesQuerySchema, 'query'),
  affiliateController.getAffiliateSales
);

/**
 * GET /api/affiliate/analytics
 *
 * Get detailed analytics and performance metrics
 *
 * Query Parameters:
 *   startDate (string, optional) - ISO date
 *   endDate (string, optional) - ISO date
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "analytics": {
 *         "period": {
 *           "startDate": "2024-02-13T00:00:00Z",
 *           "endDate": "2024-03-13T23:59:59Z"
 *         },
 *         "overview": {
 *           "totalClicks": 150,
 *           "totalConversions": 12,
 *           "conversionRate": 8.0,
 *           "totalCommissions": 1549.99,
 *           "uniqueVisitors": 120
 *         },
 *         "bySource": [
 *           {
 *             "_id": "email",
 *             "count": 50,
 *             "conversions": 5
 *           }
 *         ],
 *         "byDevice": [
 *           {
 *             "_id": "mobile",
 *             "count": 80,
 *             "conversions": 8
 *           }
 *         ],
 *         "earnings": {
 *           "totalEarnings": 500.00,
 *           "pendingEarnings": 150.00,
 *           "paidEarnings": 350.00
 *         }
 *       }
 *     }
 *   }
 */
router.get(
  '/analytics',
  authenticate,
  validateAffiliate(analyticsQuerySchema, 'query'),
  affiliateController.getAffiliateAnalytics
);

/**
 * POST /api/affiliate/payout-settings
 *
 * Update payout method and settings
 *
 * Request Body:
 *   {
 *     "payoutMethod": "stripe",
 *     "payoutData": "stripeAccountId or email or bank account",
 *     "minimumThreshold": 50
 *   }
 *
 * Supported Payout Methods:
 * - stripe: Stripe Connect account ID
 * - paypal: PayPal email address
 * - bank_transfer: Bank account details (encrypted)
 * - none: No payout configured
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Payout settings updated successfully",
 *     "data": {
 *       "payoutMethod": "stripe",
 *       "minimumThreshold": 50
 *     }
 *   }
 */
router.post(
  '/payout-settings',
  authenticate,
  validateAffiliate(payoutSettingsSchema, 'body'),
  affiliateController.updatePayoutSettings
);

/**
 * ==================== ADMIN ROUTES ====================
 * All routes below require JWT + admin role
 */

/**
 * GET /api/admin/affiliate-stats
 *
 * Get overall affiliate system statistics (admin only)
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "statistics": {
 *         "byStatus": [
 *           { "_id": "active", "count": 45, "totalEarnings": 5000.00 },
 *           { "_id": "pending", "count": 12, "totalEarnings": 0 }
 *         ],
 *         "totalReferrals": 15000,
 *         "topReferralSources": [
 *           { "_id": "email", "clicks": 5000, "conversions": 400 }
 *         ]
 *       }
 *     }
 *   }
 */
router.get(
  '/admin/stats',
  authenticate,
  authorize('admin'),
  affiliateController.getAffiliateSystemStats
);

/**
 * POST /api/admin/affiliate/:affiliateId/suspend
 *
 * Suspend an affiliate account (admin only)
 *
 * URL Parameters:
 *   affiliateId (string) - Affiliate ID to suspend
 *
 * Request Body:
 *   {
 *     "reason": "Fraudulent activity detected"
 *   }
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Affiliate suspended successfully",
 *     "data": {
 *       "affiliateId": "ObjectId",
 *       "status": "suspended",
 *       "reason": "Fraudulent activity detected"
 *     }
 *   }
 */
router.post(
  '/admin/affiliate/:affiliateId/suspend',
  authenticate,
  authorize('admin'),
  validateAffiliate(suspendAffiliateSchema, 'body'),
  affiliateController.suspendAffiliate
);

/**
 * ==================== ROUTE NOTES ====================
 *
 * Middleware Chain Explanation:
 *
 * 1. authenticate - Verifies JWT token and extracts user
 *    - Adds req.user = { _id, email, role }
 *    - Returns 401 if no token or invalid token
 *
 * 2. authorize('admin') - Checks user role is admin
 *    - Must come after authenticate
 *    - Returns 403 if role is not admin
 *
 * 3. validateAffiliate(schema, source) - Validates request data
 *    - Checks format/types of query/body/params
 *    - Converts types (string "10" → number 10)
 *    - Returns 400 if validation fails
 *    - Updates req.query/req.body with valid data
 *
 * Public vs Protected:
 * - /tracking/click: Public (no auth required)
 * - /leaderboard: Public (no auth required)
 * - /register, /dashboard, /referrals, /sales, /analytics, /payout-settings:
 *   Protected by authenticate (require JWT)
 * - /admin/*: Protected by authenticate + authorize('admin')
 *
 * Cookie Setting:
 * - /tracking/click sets affiliateId and affiliateCode cookies
 * - Cookies expire in 90 days
 * - Used for purchase attribution in checkout
 */

module.exports = router;
