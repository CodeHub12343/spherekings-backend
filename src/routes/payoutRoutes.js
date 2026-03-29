/**
 * Payout Routes
 * API endpoints for affiliate payout operations
 */

const express = require('express');
const router = express.Router();
const payoutController = require('../controllers/payoutController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  validatePayoutRequest,
  validatePayoutQuery
} = require('../validators/payoutValidator');

/**
 * ==================== AFFILIATE ROUTES ====================
 * Requires: Authentication (JWT)
 * Access: Authenticated users view own payouts
 */

/**
 * POST /api/payouts/request
 *
 * Submit payout request
 *
 * Body:
 *   amount (required): Payout amount in dollars
 *   method (required): bank_transfer, paypal, stripe, cryptocurrency
 *   beneficiary (required): Payment details object
 *   notes (optional): Affiliate notes
 *
 * Response: 201 Created
 */
router.post(
  '/request',
  authenticateToken,
  validatePayoutRequest,
  (req, res, next) => {
    payoutController.requestPayout(req, res, next);
  }
);

/**
 * GET /api/payouts
 *
 * Get payout history for authenticated affiliate
 *
 * Query Parameters:
 *   page (1): Page number
 *   limit (20): Items per page, max 100
 *   status: Filter by status (pending, completed, etc.)
 *   dateFrom: Start date (ISO format)
 *   dateTo: End date (ISO format)
 *
 * Response: 200 OK
 */
router.get(
  '/',
  authenticateToken,
  validatePayoutQuery,
  (req, res, next) => {
    payoutController.getAffiliatePayouts(req, res, next);
  }
);

/**
 * GET /api/payouts/stats
 *
 * Get payout statistics for authenticated affiliate
 *
 * Returns:
 *   - totalPayouts
 *   - pendingCount, approvedCount, processingCount, completedCount
 *   - totalPaidOut, totalPending
 *   - averagePayout
 *
 * Response: 200 OK
 */
router.get(
  '/stats',
  authenticateToken,
  (req, res, next) => {
    payoutController.getAffiliatePayoutStats(req, res, next);
  }
);

/**
 * GET /api/payouts/:payoutId
 *
 * Get specific payout details
 *
 * Access control:
 *   - Affiliate can view own only
 *   - Admin can view any
 *
 * Response: 200 OK
 */
router.get(
  '/:payoutId([0-9a-f]{24})',
  authenticateToken,
  (req, res, next) => {
    payoutController.getPayout(req, res, next);
  }
);

module.exports = router;
