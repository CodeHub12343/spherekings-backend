/**
 * Referral Tracking Routes
 * Public and authenticated routes for affiliate referral tracking
 */

const express = require('express');
const router = express.Router();
const referralTrackingController = require('../controllers/referralTrackingController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const {
  validateTrackReferral,
  validateReferralStats,
  validateReferralsList,
  validateSalesList,
} = require('../validators/referralValidator');

/**
 * ==================== PUBLIC ROUTES ====================
 * No authentication required
 */

/**
 * GET /api/ref/:affiliateCode
 *
 * Track referral click and redirect to landing page
 *
 * Purpose: Entry point for affiliate referral links
 * Captures click metadata, sets attribution cookie, and redirects to website
 *
 * URL Examples:
 *   /api/ref/AFF123456?redirect=/products/sphere-of-kings
 *   /api/ref/AFF123456?utm_campaign=summer2024&utm_source=email
 *
 * Query Parameters:
 *   redirect - Landing page path (default: /)
 *   utm_campaign - UTM campaign name (optional)
 *   utm_medium - UTM medium (optional)
 *   utm_source - UTM source (optional)
 *   utm_content - UTM content (optional)
 *
 * Response: 302 Redirect to landing page
 * Side Effects:
 *   - Records referral click in database
 *   - Sets affiliate_ref cookie for 30 days
 */
router.get('/:affiliateCode', validateTrackReferral, (req, res, next) => {
  referralTrackingController.trackReferral(req, res, next);
});

/**
 * GET /api/tracking/health
 *
 * Health check endpoint for referral tracking system
 * No authentication required
 *
 * Response: 200 OK with system status
 */
router.get('/status/health', (req, res) => {
  referralTrackingController.getSystemHealth(req, res);
});

/**
 * ==================== AUTHENTICATED ROUTES ====================
 * Requires valid JWT token
 */

/**
 * GET /api/tracking/stats/:affiliateId
 *
 * Get referral statistics for an affiliate
 *
 * Purpose: Retrieve aggregated statistics on referral performance
 *
 * Security: User must be authenticated
 *
 * URL Parameters:
 *   affiliateId - Affiliate ID (MongoDB ObjectId)
 *
 * Query Parameters:
 *   dateFrom - Start date in ISO format (optional)
 *   dateTo - End date in ISO format (optional)
 *
 * Response: 200 OK
 * Returns:
 *   - overview: Aggregated metrics (clicks, conversions, commissions, rates)
 *   - bySource: Breakdown by referral source
 *   - byDevice: Breakdown by device type
 */
router.get('/stats/:affiliateId', authenticateToken, validateReferralStats, (req, res, next) => {
  referralTrackingController.getReferralStats(req, res, next);
});

/**
 * GET /api/tracking/referrals/:affiliateId
 *
 * Get individual referral clicks for an affiliate
 *
 * Purpose: View detailed referral click records with pagination
 *
 * Security: User must be authenticated
 *
 * URL Parameters:
 *   affiliateId - Affiliate ID (MongoDB ObjectId)
 *
 * Query Parameters:
 *   page - Page number (default: 1)
 *   limit - Items per page (default: 20, max: 100)
 *   convertedOnly - Show only converted referrals (true/false, default: false)
 *   dateFrom - Start date in ISO format (optional)
 *   dateTo - End date in ISO format (optional)
 *
 * Response: 200 OK
 * Returns:
 *   - referrals: Array of referral click records
 *   - pagination: Page metadata
 */
router.get('/referrals/:affiliateId', authenticateToken, validateReferralsList, (req, res, next) => {
  referralTrackingController.getReferrals(req, res, next);
});

/**
 * GET /api/tracking/sales/:affiliateId
 *
 * Get sales attributed to an affiliate
 *
 * Purpose: View orders that were generated through affiliate referrals
 *
 * Security: User must be authenticated
 *
 * URL Parameters:
 *   affiliateId - Affiliate ID (MongoDB ObjectId)
 *
 * Query Parameters:
 *   page - Page number (default: 1)
 *   limit - Items per page (default: 20, max: 100)
 *   dateFrom - Start date in ISO format (optional)
 *   dateTo - End date in ISO format (optional)
 *
 * Response: 200 OK
 * Returns:
 *   - sales: Array of attributed orders with commission data
 *   - pagination: Page metadata
 */
router.get('/sales/:affiliateId', authenticateToken, validateSalesList, (req, res, next) => {
  referralTrackingController.getSales(req, res, next);
});

/**
 * ==================== SWAGGER/DOCS ====================
 */

/**
 * @swagger
 * /api/ref/{affiliateCode}:
 *   get:
 *     tags:
 *       - Referral Tracking
 *     summary: Track affiliate referral click
 *     description: Records a referral click, sets attribution cookie, and redirects to landing page
 *     parameters:
 *       - in: path
 *         name: affiliateCode
 *         required: true
 *         schema:
 *           type: string
 *         description: Affiliate code (e.g., AFF123456)
 *       - in: query
 *         name: redirect
 *         schema:
 *           type: string
 *           default: /
 *         description: Landing page path
 *       - in: query
 *         name: utm_campaign
 *         schema:
 *           type: string
 *         description: UTM campaign parameter
 *       - in: query
 *         name: utm_source
 *         schema:
 *           type: string
 *         description: UTM source parameter
 *     responses:
 *       302:
 *         description: Redirect to landing page with affiliate_ref cookie set
 *       400:
 *         description: Invalid affiliate code
 *       404:
 *         description: Affiliate code not found or inactive
 */

/**
 * @swagger
 * /api/tracking/stats/{affiliateId}:
 *   get:
 *     tags:
 *       - Referral Tracking
 *     summary: Get referral statistics
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: affiliateId
 *         required: true
 *         schema:
 *           type: string
 *         description: Affiliate ID
 *       - in: query
 *         name: dateFrom
 *         schema:
 *           type: string
 *           format: date-time
 *         description: Start date for statistics
 *       - in: query
 *         name: dateTo
 *         schema:
 *           type: string
 *           format: date-time
 *         description: End date for statistics
 *     responses:
 *       200:
 *         description: Referral statistics retrieved successfully
 *       401:
 *         description: Unauthorized
 */

module.exports = router;
