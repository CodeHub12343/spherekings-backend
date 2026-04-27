/**
 * ============================================================================
 * COUPON CONTROLLER - HTTP Request Handlers for Coupon System
 * ============================================================================
 *
 * Handles HTTP requests for coupon operations including:
 * - Admin: CRUD operations, analytics
 * - Customer: Coupon validation at checkout
 *
 * Follows the same class-based pattern as adminController.js.
 *
 * ============================================================================
 */

const couponService = require('../services/couponService');

class CouponController {
  // ==================== Admin CRUD Endpoints ====================

  /**
   * POST /api/v1/coupons
   * Create a new coupon (admin only)
   *
   * @param {Object} req - Express request (req.validatedBody from validator)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async createCoupon(req, res, next) {
    try {
      const adminUserId = req.user._id;
      const data = req.validatedBody || req.body;

      console.log('🏷️  [COUPON-CTRL] Create coupon request from admin:', adminUserId);

      const coupon = await couponService.createCoupon(data, adminUserId);

      return res.status(201).json({
        success: true,
        message: 'Coupon created successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('❌ [COUPON-CTRL] Create coupon error:', error.message);
      return next(error);
    }
  }

  /**
   * GET /api/v1/coupons
   * List all coupons with pagination and filtering (admin only)
   *
   * @param {Object} req - Express request (req.validatedQuery from validator)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async getCoupons(req, res, next) {
    try {
      const query = req.validatedQuery || req.query;
      const result = await couponService.getCoupons(query);

      return res.status(200).json({
        success: true,
        message: 'Coupons retrieved successfully',
        ...result,
      });
    } catch (error) {
      console.error('❌ [COUPON-CTRL] Get coupons error:', error.message);
      return next(error);
    }
  }

  /**
   * GET /api/v1/coupons/:id
   * Get a single coupon by ID (admin only)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async getCouponById(req, res, next) {
    try {
      const { id } = req.params;
      const coupon = await couponService.getCouponById(id);

      return res.status(200).json({
        success: true,
        message: 'Coupon retrieved successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('❌ [COUPON-CTRL] Get coupon error:', error.message);
      return next(error);
    }
  }

  /**
   * PUT /api/v1/coupons/:id
   * Update a coupon (admin only)
   *
   * @param {Object} req - Express request (req.validatedBody from validator)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async updateCoupon(req, res, next) {
    try {
      const { id } = req.params;
      const data = req.validatedBody || req.body;

      console.log('🏷️  [COUPON-CTRL] Update coupon request:', id);

      const coupon = await couponService.updateCoupon(id, data);

      return res.status(200).json({
        success: true,
        message: 'Coupon updated successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('❌ [COUPON-CTRL] Update coupon error:', error.message);
      return next(error);
    }
  }

  /**
   * DELETE /api/v1/coupons/:id
   * Deactivate a coupon (soft delete, admin only)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async deleteCoupon(req, res, next) {
    try {
      const { id } = req.params;

      console.log('🏷️  [COUPON-CTRL] Delete (deactivate) coupon request:', id);

      const coupon = await couponService.deleteCoupon(id);

      return res.status(200).json({
        success: true,
        message: 'Coupon deactivated successfully',
        data: coupon,
      });
    } catch (error) {
      console.error('❌ [COUPON-CTRL] Delete coupon error:', error.message);
      return next(error);
    }
  }

  // ==================== Customer-Facing Endpoint ====================

  /**
   * POST /api/v1/coupons/validate
   * Validate a coupon code and return the discount (customer)
   *
   * This does NOT increment usage — that happens only after payment success.
   *
   * @param {Object} req - Express request (req.validatedBody from validator)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async validateCoupon(req, res, next) {
    try {
      const { code, cartSubtotal } = req.validatedBody || req.body;
      const userId = req.user?._id || null;

      console.log('🔍 [COUPON-CTRL] Validate coupon request:', code, 'subtotal:', cartSubtotal);

      const result = await couponService.validateAndApplyCoupon(code, cartSubtotal, userId);

      if (!result.valid) {
        return res.status(400).json({
          success: false,
          message: result.reason,
          data: { valid: false },
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Coupon applied successfully',
        data: {
          valid: true,
          couponId: result.couponId,
          code: result.code,
          discountType: result.discountType,
          discountValue: result.discountValue,
          discountAmount: result.discountAmount,
          newTotal: result.newTotal,
        },
      });
    } catch (error) {
      console.error('❌ [COUPON-CTRL] Validate coupon error:', error.message);
      return next(error);
    }
  }

  // ==================== Analytics Endpoint ====================

  /**
   * GET /api/v1/coupons/analytics
   * Get coupon usage analytics for the admin dashboard
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   */
  async getCouponAnalytics(req, res, next) {
    try {
      console.log('📊 [COUPON-CTRL] Coupon analytics request');

      const result = await couponService.getCouponAnalytics();

      return res.status(200).json({
        success: true,
        message: 'Coupon analytics retrieved successfully',
        ...result,
      });
    } catch (error) {
      console.error('❌ [COUPON-CTRL] Analytics error:', error.message);
      return next(error);
    }
  }
}

module.exports = new CouponController();
