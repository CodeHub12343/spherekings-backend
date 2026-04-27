/**
 * ============================================================================
 * COUPON ROUTES - API Endpoint Definitions for Coupon System
 * ============================================================================
 *
 * Endpoint routing for coupon operations:
 * - Admin: CRUD, analytics (requires admin role)
 * - Customer: Coupon validation (requires authentication)
 *
 * Authentication: JWT Bearer token required for all routes
 * Authorization: Admin role required for management routes
 *
 * ============================================================================
 */

const express = require('express');
const router = express.Router();
const couponController = require('../controllers/couponController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  validateCreateCoupon,
  validateUpdateCoupon,
  validateCouponCode,
  validateCouponQuery,
} = require('../validators/couponValidator');

// ==================== Customer-Facing Routes ====================
// These come FIRST so they match before the admin middleware

/**
 * POST /api/v1/coupons/validate
 *
 * Validate a coupon code and calculate discount
 * Available to all authenticated users (customers, affiliates, admin)
 *
 * Request Body:
 *   {
 *     "code": "FB_TRAFFIC",
 *     "cartSubtotal": 100.00
 *   }
 *
 * Success Response (200):
 *   {
 *     "success": true,
 *     "message": "Coupon applied successfully",
 *     "data": {
 *       "valid": true,
 *       "couponId": "...",
 *       "code": "FB_TRAFFIC",
 *       "discountType": "percentage",
 *       "discountValue": 15,
 *       "discountAmount": 15.00,
 *       "newTotal": 85.00
 *     }
 *   }
 *
 * Error Response (400):
 *   {
 *     "success": false,
 *     "message": "Coupon has expired",
 *     "data": { "valid": false }
 *   }
 */
router.post(
  '/validate',
  authenticateToken,
  validateCouponCode,
  (req, res, next) => {
    couponController.validateCoupon(req, res, next);
  }
);

// ==================== Admin Routes ====================
// All routes below require admin authentication

/**
 * GET /api/v1/coupons/analytics
 *
 * Get coupon usage analytics for the admin dashboard
 * NOTE: This must be registered BEFORE the /:id route to prevent "analytics" being treated as an ID
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "coupons": [...],
 *       "summary": { "totalCoupons": 10, "activeCoupons": 7, ... },
 *       "bySalesChannel": [...]
 *     }
 *   }
 */
router.get(
  '/analytics',
  authenticateToken,
  authorize('admin'),
  (req, res, next) => {
    couponController.getCouponAnalytics(req, res, next);
  }
);

/**
 * POST /api/v1/coupons
 *
 * Create a new coupon (admin only)
 *
 * Request Body:
 *   {
 *     "code": "FB_TRAFFIC",
 *     "discountType": "percentage",
 *     "discountValue": 15,
 *     "expiryDate": "2026-05-31T23:59:59.000Z",
 *     "salesChannel": "facebook",
 *     "maxUses": 100,
 *     "minimumOrderValue": 50
 *   }
 *
 * Response (201):
 *   {
 *     "success": true,
 *     "message": "Coupon created successfully",
 *     "data": { ...coupon }
 *   }
 */
router.post(
  '/',
  authenticateToken,
  authorize('admin'),
  validateCreateCoupon,
  (req, res, next) => {
    couponController.createCoupon(req, res, next);
  }
);

/**
 * GET /api/v1/coupons
 *
 * List all coupons with pagination and filtering (admin only)
 *
 * Query Parameters:
 *   - page (default: 1)
 *   - limit (default: 20, max: 100)
 *   - isActive (boolean, optional)
 *   - salesChannel (string, optional)
 *   - search (string, optional - searches code, description, salesChannel)
 *   - sortBy (createdAt|code|usageCount|discountValue, default: createdAt)
 *   - order (asc|desc, default: desc)
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": [...coupons],
 *     "pagination": { "page": 1, "limit": 20, "total": 50, "pages": 3 }
 *   }
 */
router.get(
  '/',
  authenticateToken,
  authorize('admin'),
  validateCouponQuery,
  (req, res, next) => {
    couponController.getCoupons(req, res, next);
  }
);

/**
 * GET /api/v1/coupons/:id
 *
 * Get a single coupon by ID (admin only)
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": { ...coupon }
 *   }
 */
router.get(
  '/:id',
  authenticateToken,
  authorize('admin'),
  (req, res, next) => {
    couponController.getCouponById(req, res, next);
  }
);

/**
 * PUT /api/v1/coupons/:id
 *
 * Update a coupon (admin only)
 *
 * Request Body: Any updateable coupon fields
 *   {
 *     "discountValue": 20,
 *     "isActive": false,
 *     "expiryDate": "2026-06-30T23:59:59.000Z"
 *   }
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Coupon updated successfully",
 *     "data": { ...coupon }
 *   }
 */
router.put(
  '/:id',
  authenticateToken,
  authorize('admin'),
  validateUpdateCoupon,
  (req, res, next) => {
    couponController.updateCoupon(req, res, next);
  }
);

/**
 * DELETE /api/v1/coupons/:id
 *
 * Deactivate a coupon (soft delete, admin only)
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Coupon deactivated successfully",
 *     "data": { ...coupon }
 *   }
 */
router.delete(
  '/:id',
  authenticateToken,
  authorize('admin'),
  (req, res, next) => {
    couponController.deleteCoupon(req, res, next);
  }
);

module.exports = router;
