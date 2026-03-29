/**
 * Commission Routes
 * API endpoints for commission management
 */

const express = require('express');
const router = express.Router();
const commissionController = require('../controllers/commissionController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { 
  validateCommissionQuery,
  validateCommissionApproval,
  validateCommissionPayment,
  validateCommissionReversal,
  validateBatchApproval,
  validateBatchPayment
} = require('../validators/commissionValidator');

/**
 * ==================== AFFILIATE ROUTES ====================
 * Requires: Authentication (JWT)
 * Access: Authenticated users can view their own commissions
 */

/**
 * GET /api/affiliate/commissions/stats
 *
 * Get commission statistics for authenticated affiliate
 *
 * Purpose: Affiliate dashboard - summary of commissions
 *
 * Security: User must be authenticated
 *
 * Query Parameters:
 *   dateFrom - Start date (optional)
 *   dateTo - End date (optional)
 *
 * Response: 200 OK
 * Returns:
 *   - totalCommissions: Total number of commissions
 *   - pendingCount: Commissions awaiting approval
 *   - approvedCount: Commissions approved but not paid
 *   - paidCount: Commissions that have been paid
 *   - reversedCount: Commissions that were reversed
 *   - totalEarned: Total paid commissions
 *   - totalPending: Total pending commissions
 *   - totalApproved: Total approved commissions
 *   - averageCommission: Average commission amount
 *   - maxCommission: Highest commission amount
 */
router.get(
  '/commissions/stats',
  authenticateToken,
  (req, res, next) => {
    commissionController.getAffiliateCommissionStats(req, res, next);
  }
);

/**
 * GET /api/affiliate/commissions
 *
 * Get commission records for authenticated affiliate
 *
 * Purpose: Affiliate dashboard - view commissions earned
 *
 * Security: User must be authenticated
 *
 * Query Parameters:
 *   page - Page number (default: 1)
 *   limit - Items per page (default: 20, max: 100)
 *   status - Filter by status (pending, approved, paid, reversed)
 *   dateFrom - Start date in ISO format
 *   dateTo - End date in ISO format
 *
 * Response: 200 OK
 * Returns:
 *   - commissions: Array of commission records
 *   - pagination: Page metadata
 *
 * Example:
 *   GET /api/affiliate/commissions?status=pending&page=1
 */
router.get(
  '/commissions',
  authenticateToken,
  validateCommissionQuery,
  (req, res, next) => {
    commissionController.getAffiliateCommissions(req, res, next);
  }
);

/**
 * GET /api/commissions/:commissionId
 *
 * Get a specific commission record
 *
 * Purpose: Commission detail view
 *
 * Security: 
 *   - User must be authenticated
 *   - Non-admins can only view their own commissions
 *   - Admins can view any commission
 *
 * URL Parameters:
 *   commissionId - Commission ID (MongoDB ObjectId)
 *
 * Response: 200 OK
 * Returns: Full commission record with all details
 */
router.get(
  '/:commissionId([0-9a-f]{24})',
  authenticateToken,
  (req, res, next) => {
    commissionController.getCommission(req, res, next);
  }
);

module.exports = router;
