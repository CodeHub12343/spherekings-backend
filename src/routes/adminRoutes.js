/**
 * ============================================================================
 * ADMIN ROUTES - API Endpoint Definitions for Admin Dashboard
 * ============================================================================
 *
 * Endpoint routing for all admin dashboard operations.
 * All routes are protected by admin authentication and authorization.
 *
 * Authentication: JWT Bearer token required
 * Authorization: User must have role === 'admin'
 *
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const {
  validateOrdersQuery,
  validateProductsQuery,
  validateAffiliatesQuery,
  validateCommissionsQuery,
  validatePayoutsQuery,
  validateRevenueQuery,
  validateTopEntitiesQuery,
  validateAffiliateIdParam
} = require('../validators/adminValidator');
const {
  validateApprovalNotes,
  validateRejectionReason,
  validateBatchApprove,
  validateBatchProcess
} = require('../validators/payoutValidator');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Middleware: All admin routes require authentication and admin role
 */
router.use(authenticateToken);
router.use(authorize('admin'));

/**
 * ============================================================================
 * DASHBOARD ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/dashboard
 *
 * @description Get dashboard overview with key platform metrics
 *
 * @returns {Object}
 *   - revenue: {total, averageOrderValue, minOrderValue, maxOrderValue}
 *   - orders: {total, completed, pending, failed}
 *   - products: {total, active}
 *   - affiliates: {total, active}
 *   - commissions: {pending, approved, paid, reversed} (with counts)
 *   - payouts: {pending, approved, processing, completed, failed, cancelled}
 *
 * @example
 *   GET /api/admin/dashboard
 *   Authorization: Bearer {token}
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "message": "Dashboard data retrieved successfully",
 *     "data": {
 *       "revenue": { "total": 50000.00, ... },
 *       "orders": { "total": 500, "completed": 480, ... },
 *       ...
 *     }
 *   }
 */
router.get('/dashboard', (req, res, next) => {
  adminController.getDashboard(req, res, next);
});

/**
 * ============================================================================
 * ORDER MONITORING ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/orders
 *
 * @description Get all orders with filtering, pagination, and sorting
 *
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Results per page (default: 20, max: 100)
 * @query {String} status - Filter by status: pending|completed|failed
 * @query {String} affiliateId - Filter by affiliate
 * @query {String} userId - Filter by user/buyer
 * @query {Date} dateFrom - Start date (ISO format)
 * @query {Date} dateTo - End date (ISO format)
 * @query {String} sortBy - Field to sort by (default: createdAt)
 * @query {String} order - Sort direction: asc|desc (default: desc)
 *
 * @returns {Array} Array of order objects with pagination metadata
 *
 * @example
 *   GET /api/admin/orders?page=1&limit=20&status=completed
 *   Authorization: Bearer {token}
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": [{...orders...}],
 *     "pagination": { "page": 1, "limit": 20, "total": 5000, "pages": 250 }
 *   }
 */
router.get('/orders', validateOrdersQuery, (req, res, next) => {
  adminController.getOrders(req, res, next);
});

/**
 * GET /api/admin/orders/analytics
 *
 * @description Get order analytics and metrics breakdown
 *
 * @returns {Object}
 *   - byStatus: [{_id: status, count, totalRevenue}]
 *   - byPaymentMethod: [{_id: method, count, totalRevenue}]
 *   - byAffiliateSource: [{_id: affiliateId, count, totalRevenue}]
 *
 * @example
 *   GET /api/admin/orders/analytics
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": {
 *       "byStatus": [
 *         { "_id": "completed", "count": 480, "totalRevenue": 48000 },
 *         { "_id": "pending", "count": 15, "totalRevenue": 1500 },
 *         ...
 *       ],
 *       ...
 *     }
 *   }
 */
router.get('/orders/analytics', (req, res, next) => {
  adminController.getOrderAnalytics(req, res, next);
});

/**
 * ============================================================================
 * PRODUCT MONITORING ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/products
 *
 * @description Get all products with filtering and pagination
 *
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Results per page (default: 20, max: 100)
 * @query {String} status - Filter by status: active|inactive
 * @query {String} category - Filter by category
 * @query {String} search - Text search in product name and description
 *
 * @returns {Array} Array of product objects with pagination metadata
 *
 * @example
 *   GET /api/admin/products?status=active&limit=50
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": [{...products...}],
 *     "pagination": { "page": 1, "limit": 50, "total": 150, "pages": 3 }
 *   }
 */
router.get('/products', validateProductsQuery, (req, res, next) => {
  adminController.getProducts(req, res, next);
});

/**
 * GET /api/admin/products/top
 *
 * @description Get top selling products by revenue
 *
 * @query {Number} limit - Number of products to return (default: 10, max: 50)
 *
 * @returns {Array}
 *   [{
 *     _id: productId,
 *     productName: String,
 *     category: String,
 *     totalRevenue: Number,
 *     totalQuantitySold: Number,
 *     totalOrders: Number
 *   }]
 *
 * @example
 *   GET /api/admin/products/top?limit=20
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": [
 *       {
 *         "_id": "...",
 *         "productName": "Premium Widget",
 *         "totalRevenue": 50000,
 *         "totalQuantitySold": 500,
 *         ...
 *       },
 *       ...
 *     ]
 *   }
 */
router.get('/products/top', validateTopEntitiesQuery, (req, res, next) => {
  adminController.getTopProducts(req, res, next);
});

/**
 * ============================================================================
 * AFFILIATE MONITORING ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/affiliates
 *
 * @description Get all affiliate accounts with performance metrics
 *
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Results per page (default: 20, max: 100)
 * @query {String} status - Filter by status: active|inactive|suspended
 * @query {String} search - Search by affiliate name or email
 *
 * @returns {Array} Array of affiliate objects with earning statistics
 *
 * @example
 *   GET /api/admin/affiliates?status=active&limit=50
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": [
 *       {
 *         "_id": "...",
 *         "name": "John Affiliate",
 *         "email": "john@example.com",
 *         "status": "active",
 *         "earnings": { ... },
 *         "commissionStats": { ... }
 *       },
 *       ...
 *     ],
 *     "pagination": { "page": 1, "limit": 50, "total": 250, "pages": 5 }
 *   }
 */
router.get('/affiliates', validateAffiliatesQuery, (req, res, next) => {
  adminController.getAffiliates(req, res, next);
});

/**
 * GET /api/admin/affiliates/top
 *
 * @description Get top performing affiliates by commission earnings
 *
 * @query {Number} limit - Number of affiliates to return (default: 10, max: 50)
 *
 * @returns {Array}
 *   [{
 *     _id: affiliateId,
 *     affiliateName: String,
 *     affiliateEmail: String,
 *     totalCommission: Number,
 *     totalReferrals: Number,
 *     averageCommission: Number,
 *     earnedBalance: Number
 *   }]
 *
 * @example
 *   GET /api/admin/affiliates/top?limit=20
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": [
 *       {
 *         "_id": "...",
 *         "affiliateName": "Top Seller",
 *         "totalCommission": 25000,
 *         "totalReferrals": 500,
 *         ...
 *       },
 *       ...
 *     ]
 *   }
 */
router.get('/affiliates/top', validateTopEntitiesQuery, (req, res, next) => {
  adminController.getTopAffiliates(req, res, next);
});

/**
 * GET /api/admin/affiliates/:affiliateId
 *
 * @description Get detailed performance metrics for specific affiliate
 *
 * @params {String} affiliateId - Affiliate user ID
 *
 * @returns {Object}
 *   {
 *     affiliate: {_id, name, email, status, earnings},
 *     commissionStats: {totalCommissions, totalAmount, pending, approved, paid},
 *     payoutStats: {totalPayouts, totalAmount, completed, pending}
 *   }
 *
 * @example
 *   GET /api/admin/affiliates/507f1f77bcf86cd799439011
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "affiliate": { ... },
 *     "commissionStats": { ... },
 *     "payoutStats": { ... }
 *   }
 */
router.get('/affiliates/:affiliateId', validateAffiliateIdParam, (req, res, next) => {
  adminController.getAffiliateDetails(req, res, next);
});

/**
 * ============================================================================
 * COMMISSION MONITORING ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/commissions
 *
 * @description Get all commission records with filtering
 *
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Results per page (default: 20, max: 100)
 * @query {String} status - Filter by status: pending|approved|paid|reversed
 * @query {String} affiliateId - Filter by affiliate
 * @query {Date} dateFrom - Start date (ISO format)
 * @query {Date} dateTo - End date (ISO format)
 *
 * @returns {Array} Array of commission objects with affiliate and order details
 *
 * @example
 *   GET /api/admin/commissions?status=pending&limit=50
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": [{...commissions...}],
 *     "pagination": { "page": 1, "limit": 50, "total": 1000, "pages": 20 }
 *   }
 */
router.get('/commissions', validateCommissionsQuery, (req, res, next) => {
  adminController.getCommissions(req, res, next);
});

/**
 * GET /api/admin/commissions/analytics
 *
 * @description Get commission analytics and metrics breakdown
 *
 * @returns {Object}
 *   {
 *     byStatus: [{_id: status, count, totalAmount}],
 *     totalMetrics: {totalCommissions, totalAmount, averageCommission},
 *     byAffiliate: top 20 affiliates by commission amount
 *   }
 *
 * @example
 *   GET /api/admin/commissions/analytics
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": {
 *       "byStatus": [...],
 *       "totalMetrics": {...},
 *       "byAffiliate": [...]
 *     }
 *   }
 */
router.get('/commissions/analytics', (req, res, next) => {
  adminController.getCommissionAnalytics(req, res, next);
});

/**
 * GET /api/admin/commissions/stats
 * 
 * @description Get commission statistics (alias for analytics)
 * Returns commission breakdown by status, totals, top affiliates
 */
router.get('/commissions/stats', (req, res, next) => {
  adminController.getCommissionAnalytics(req, res, next);
});

/**
 * POST /api/admin/commissions/:commissionId/approve
 *
 * @description Approve a pending commission for payment
 *
 * @params {String} commissionId - Commission ID
 * @body {String} notes - Approval notes (optional)
 *
 * @returns {Object} Updated commission record
 *
 * @example
 *   POST /api/admin/commissions/507f1f77bcf86cd799439011/approve
 *   {
 *     "notes": "Approved for processing"
 *   }
 */
router.post('/commissions/:commissionId/approve', (req, res, next) => {
  const commissionController = require('../controllers/commissionController');
  commissionController.approveCommission(req, res, next);
});

/**
 * POST /api/admin/commissions/:commissionId/pay
 *
 * @description Mark a commission as paid
 *
 * @params {String} commissionId - Commission ID
 * @body {String} method - Payment method [REQUIRED]
 * @body {String} transactionId - Transaction reference [REQUIRED]
 *
 * @returns {Object} Updated commission record
 */
router.post('/commissions/:commissionId/pay', (req, res, next) => {
  const commissionController = require('../controllers/commissionController');
  commissionController.markCommissionAsPaid(req, res, next);
});

/**
 * POST /api/admin/commissions/:commissionId/reverse
 *
 * @description Reverse a commission (refund/chargeback handling)
 *
 * @params {String} commissionId - Commission ID
 * @body {String} reason - Reversal reason [REQUIRED]
 * @body {String} details - Additional details (optional)
 *
 * @returns {Object} Updated commission record
 */
router.post('/commissions/:commissionId/reverse', (req, res, next) => {
  const commissionController = require('../controllers/commissionController');
  commissionController.reverseCommission(req, res, next);
});

/**
 * POST /api/admin/commissions/batch-approve
 *
 * @description Batch approve multiple commissions
 *
 * @body {Array} commissionIds - Commission IDs to approve [REQUIRED]
 * @body {String} notes - Approval notes (optional)
 *
 * @returns {Object} {approved: [...], failed: [...], total: Number}
 */
router.post('/commissions/batch-approve', (req, res, next) => {
  const commissionController = require('../controllers/commissionController');
  commissionController.batchApproveCommissions(req, res, next);
});

/**
 * POST /api/admin/commissions/batch-pay
 *
 * @description Batch mark commissions as paid
 *
 * @body {Array} commissionIds - Commission IDs to pay [REQUIRED]
 * @body {String} method - Payment method [REQUIRED]
 * @body {String} transactionIdPrefix - Transaction ID prefix [REQUIRED]
 *
 * @returns {Object} {paid: [...], failed: [...], total: Number}
 */
router.post('/commissions/batch-pay', (req, res, next) => {
  const commissionController = require('../controllers/commissionController');
  commissionController.batchMarkAsPaid(req, res, next);
});

/**
 * ============================================================================
 * PAYOUT MONITORING ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/payouts
 *
 * @description Get all affiliate payout records with filtering
 *
 * @query {Number} page - Page number (default: 1)
 * @query {Number} limit - Results per page (default: 20, max: 100)
 * @query {String} status - Filter by status: pending|approved|processing|completed|failed|cancelled
 * @query {String} affiliateId - Filter by affiliate
 * @query {Date} dateFrom - Start date (ISO format)
 * @query {Date} dateTo - End date (ISO format)
 *
 * @returns {Array} Array of payout objects with affiliate details
 *
 * @example
 *   GET /api/admin/payouts?status=completed&limit=50
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": [{...payouts...}],
 *     "pagination": { "page": 1, "limit": 50, "total": 5000, "pages": 100 }
 *   }
 */
router.get('/payouts', validatePayoutsQuery, (req, res, next) => {
  adminController.getPayouts(req, res, next);
});

/**
 * GET /api/admin/payouts/analytics
 *
 * @description Get payout analytics and metrics breakdown
 *
 * @returns {Object}
 *   {
 *     byStatus: [{_id: status, count, totalAmount}],
 *     totalMetrics: {totalPayouts, totalPaidOut, totalPending},
 *     recentPayouts: last 20 payouts
 *   }
 *
 * @example
 *   GET /api/admin/payouts/analytics
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": {
 *       "byStatus": [...],
 *       "totalMetrics": {
 *         "totalPayouts": 5000,
 *         "totalPaidOut": 500000,
 *         "totalPending": 50000
 *       },
 *       "recentPayouts": [...]
 *     }
 *   }
 */
router.get('/payouts/analytics', (req, res, next) => {
  adminController.getPayoutAnalytics(req, res, next);
});

/**
 * GET /api/admin/payouts/stats
 *
 * @description Get payout statistics (alias for analytics)
 *
 * @returns {Object} Same as /payouts/analytics
 *
 * @example
 *   GET /api/admin/payouts/stats
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "data": {...}
 *   }
 */
router.get('/payouts/stats', (req, res, next) => {
  adminController.getPayoutAnalytics(req, res, next);
});

/**
 * ============================================================================
 * ANALYTICS ENDPOINTS
 * ============================================================================
 */

/**
 * GET /api/admin/revenue
 *
 * @description Get revenue analytics grouped by time period
 *
 * @query {String} groupBy - Time grouping: day|week|month (default: day)
 * @query {Date} dateFrom - Start date (ISO format)
 * @query {Date} dateTo - End date (ISO format)
 *
 * @returns {Array}
 *   [{
 *     _id: period (e.g., "2026-03-13"),
 *     revenue: Number,
 *     orderCount: Number,
 *     averageOrderValue: Number
 *   }]
 *
 * @example
 *   GET /api/admin/revenue?groupBy=day&dateFrom=2026-03-01&dateTo=2026-03-13
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "groupBy": "day",
 *     "data": [
 *       {
 *         "_id": "2026-03-01",
 *         "revenue": 5000,
 *         "orderCount": 50,
 *         "averageOrderValue": 100
 *       },
 *       ...
 *     ]
 *   }
 */
router.get('/revenue', validateRevenueQuery, (req, res, next) => {
  adminController.getRevenueAnalytics(req, res, next);
});

/**
 * GET /api/admin/system
 *
 * @description Get system health and real-time metrics
 *
 * @returns {Object}
 *   {
 *     metrics: {
 *       lastOrders: [...],
 *       pendingCommissions: Number,
 *       failedPayouts: Number,
 *       totalAffiliates: Number,
 *       health: { ... }
 *     }
 *   }
 *
 * @example
 *   GET /api/admin/system
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "metrics": {
 *       "pendingCommissions": 25,
 *       "failedPayouts": 3,
 *       "health": { "isHealthy": true }
 *     }
 *   }
 */
router.get('/system', (req, res, next) => {
  adminController.getSystemAnalytics(req, res, next);
});

/**
 * GET /api/admin/reconciliation
 *
 * @description Get financial reconciliation report
 *
 * @returns {Object}
 *   {
 *     reconciliation: {
 *       totalOrderRevenue: Number,
 *       totalCommissionsGenerated: Number,
 *       totalPayoutsProcessed: Number,
 *       totalAffiliateEarnings: Number,
 *       discrepancy: Number,
 *       isBalanced: Boolean
 *     }
 *   }
 *
 * @example
 *   GET /api/admin/reconciliation
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "reconciliation": {
 *       "totalOrderRevenue": 500000,
 *       "totalPayoutsProcessed": 50000,
 *       "discrepancy": 0,
 *       "isBalanced": true
 *     }
 *   }
 */
router.get('/reconciliation', (req, res, next) => {
  adminController.getFinancialReconciliation(req, res, next);
});

/**
 * ============================================================================
 * PAYOUT ACTION ENDPOINTS
 * ============================================================================
 */

/**
 * POST /api/admin/payouts/:payoutId/approve
 *
 * @description Approve pending payout request
 *
 * @param {String} payoutId - Payout ID (path param)
 * @body {String} notes - Optional approval notes
 *
 * @returns {Object} Updated payout object with approved status
 *
 * @example
 *   POST /api/admin/payouts/69be38bf1445e4eaa8d9b43e/approve
 *   Body: { "notes": "Approved for processing" }
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "message": "Payout approved successfully",
 *     "data": {...payout}
 *   }
 */
router.post('/payouts/:payoutId/approve', validateApprovalNotes, (req, res, next) => {
  const payoutController = require('../controllers/payoutController');
  payoutController.approvePayout(req, res, next);
});

/**
 * POST /api/admin/payouts/:payoutId/process
 *
 * @description Process approved payout (submit to payment provider)
 *
 * @param {String} payoutId - Payout ID (path param)
 * @body {String} stripeConnectId - Optional Stripe Connect account ID
 *
 * @returns {Object} Updated payout object with processing status
 *
 * @example
 *   POST /api/admin/payouts/69be38bf1445e4eaa8d9b43e/process
 *   Body: { "stripeConnectId": "acct_123456" }
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "message": "Payout processing started",
 *     "data": {...payout}
 *   }
 */
router.post('/payouts/:payoutId/process', (req, res, next) => {
  const payoutController = require('../controllers/payoutController');
  payoutController.processPayout(req, res, next);
});

/**
 * POST /api/admin/payouts/:payoutId/reject
 *
 * @description Reject or cancel payout
 *
 * @param {String} payoutId - Payout ID (path param)
 * @body {String} reason - Rejection reason (required)
 * @body {String} details - Additional details (optional)
 *
 * @returns {Object} Updated payout object with rejected status
 *
 * @example
 *   POST /api/admin/payouts/69be38bf1445e4eaa8d9b43e/reject
 *   Body: { "reason": "Invalid bank details", "details": "Account number mismatch" }
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "message": "Payout rejected successfully",
 *     "data": {...payout}
 *   }
 */
router.post('/payouts/:payoutId/reject', validateRejectionReason, (req, res, next) => {
  const payoutController = require('../controllers/payoutController');
  payoutController.rejectPayout(req, res, next);
});

/**
 * POST /api/admin/payouts/batch-approve
 *
 * @description Approve multiple payouts at once
 *
 * @body {Array} payoutIds - Array of payout IDs (max 500)
 * @body {String} notes - Optional approval notes
 *
 * @returns {Object} { approved: Number, failed: Number, payouts: [...] }
 *
 * @example
 *   POST /api/admin/payouts/batch-approve
 *   Body: { "payoutIds": ["id1", "id2", "id3"], "notes": "Batch approved" }
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "message": "Batch approval completed",
 *     "data": { "approved": 3, "failed": 0, "payouts": [...] }
 *   }
 */
router.post('/payouts/batch-approve', validateBatchApprove, (req, res, next) => {
  const payoutController = require('../controllers/payoutController');
  payoutController.batchApprovePayout(req, res, next);
});

/**
 * POST /api/admin/payouts/batch-process
 *
 * @description Process multiple approved payouts
 *
 * @body {Array} payoutIds - Array of payout IDs (max 500)
 * @body {String} stripeConnectId - Optional Stripe Connect account ID
 *
 * @returns {Object} { processed: Number, failed: Number, payouts: [...] }
 *
 * @example
 *   POST /api/admin/payouts/batch-process
 *   Body: { "payoutIds": ["id1", "id2", "id3"] }
 *
 *   Response: 200 OK
 *   {
 *     "success": true,
 *     "message": "Batch processing started",
 *     "data": { "processed": 3, "failed": 0, "payouts": [...] }
 *   }
 */
router.post('/payouts/batch-process', validateBatchProcess, (req, res, next) => {
  const payoutController = require('../controllers/payoutController');
  payoutController.batchProcessPayout(req, res, next);
});

/**
 * Export routes
 */
module.exports = router;
