/**
 * ============================================================================
 * COUPON SERVICE - Business Logic for Coupon System
 * ============================================================================
 *
 * Handles all coupon operations including:
 * - CRUD operations for admin management
 * - Coupon validation and discount calculation for customers
 * - Usage tracking (increment only after payment success)
 * - Analytics and reporting for the admin dashboard
 *
 * Follows the same class-based pattern as checkoutService.js.
 *
 * ============================================================================
 */

const Coupon = require('../models/Coupon');
const Order = require('../models/Order');
const { ValidationError, NotFoundError, ConflictError, ServerError } = require('../utils/errors');

class CouponService {
  // ==================== Admin CRUD ====================

  /**
   * Create a new coupon
   *
   * @param {Object} data - Validated coupon data
   * @param {string} adminUserId - ID of the admin creating the coupon
   * @returns {Promise<Object>} Created coupon document
   */
  async createCoupon(data, adminUserId) {
    try {
      console.log('🏷️  [COUPON] Creating coupon:', data.code);

      // Check for duplicate code
      const existing = await Coupon.findByCode(data.code);
      if (existing) {
        throw new ConflictError(`Coupon code "${data.code}" already exists`);
      }

      const coupon = new Coupon({
        ...data,
        code: data.code.toUpperCase().trim(),
        createdBy: adminUserId,
      });

      await coupon.save();

      console.log('✅ [COUPON] Coupon created:', {
        id: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
      });

      return coupon;
    } catch (error) {
      if (error.name === 'ConflictError') throw error;

      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        throw new ConflictError(`Coupon code "${data.code}" already exists`);
      }

      throw new ServerError(`Failed to create coupon: ${error.message}`);
    }
  }

  /**
   * Update an existing coupon
   *
   * @param {string} couponId - Coupon ObjectId
   * @param {Object} data - Validated update data
   * @returns {Promise<Object>} Updated coupon document
   */
  async updateCoupon(couponId, data) {
    try {
      console.log('🏷️  [COUPON] Updating coupon:', couponId);

      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        throw new NotFoundError(`Coupon not found: ${couponId}`);
      }

      // Apply updates
      Object.keys(data).forEach((key) => {
        coupon[key] = data[key];
      });

      await coupon.save();

      console.log('✅ [COUPON] Coupon updated:', coupon.code);
      return coupon;
    } catch (error) {
      if (error.name === 'NotFoundError') throw error;
      throw new ServerError(`Failed to update coupon: ${error.message}`);
    }
  }

  /**
   * Soft-delete a coupon (deactivate it)
   *
   * @param {string} couponId - Coupon ObjectId
   * @returns {Promise<Object>} Deactivated coupon document
   */
  async deleteCoupon(couponId) {
    try {
      console.log('🏷️  [COUPON] Deactivating coupon:', couponId);

      const coupon = await Coupon.findById(couponId);
      if (!coupon) {
        throw new NotFoundError(`Coupon not found: ${couponId}`);
      }

      coupon.isActive = false;
      await coupon.save();

      console.log('✅ [COUPON] Coupon deactivated:', coupon.code);
      return coupon;
    } catch (error) {
      if (error.name === 'NotFoundError') throw error;
      throw new ServerError(`Failed to deactivate coupon: ${error.message}`);
    }
  }

  /**
   * Get all coupons with pagination and filtering (admin)
   *
   * @param {Object} query - Validated query parameters
   * @returns {Promise<Object>} { data, pagination }
   */
  async getCoupons(query = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        isActive,
        salesChannel,
        search,
        sortBy = 'createdAt',
        order = 'desc',
      } = query;

      // Build filter
      const filter = {};
      if (typeof isActive === 'boolean') {
        filter.isActive = isActive;
      }
      if (salesChannel) {
        filter.salesChannel = salesChannel;
      }
      if (search) {
        filter.$or = [
          { code: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { salesChannel: { $regex: search, $options: 'i' } },
        ];
      }

      // Build sort
      const sort = {};
      sort[sortBy] = order === 'asc' ? 1 : -1;

      // Execute query with pagination
      const skip = (page - 1) * limit;
      const [coupons, total] = await Promise.all([
        Coupon.find(filter)
          .sort(sort)
          .skip(skip)
          .limit(limit)
          .populate('createdBy', 'name email')
          .lean(),
        Coupon.countDocuments(filter),
      ]);

      return {
        data: coupons,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit),
        },
      };
    } catch (error) {
      throw new ServerError(`Failed to fetch coupons: ${error.message}`);
    }
  }

  /**
   * Get a single coupon by ID (admin)
   *
   * @param {string} couponId - Coupon ObjectId
   * @returns {Promise<Object>} Coupon document
   */
  async getCouponById(couponId) {
    try {
      const coupon = await Coupon.findById(couponId)
        .populate('createdBy', 'name email')
        .lean();

      if (!coupon) {
        throw new NotFoundError(`Coupon not found: ${couponId}`);
      }

      return coupon;
    } catch (error) {
      if (error.name === 'NotFoundError') throw error;
      throw new ServerError(`Failed to fetch coupon: ${error.message}`);
    }
  }

  // ==================== Customer-Facing Validation ====================

  /**
   * Validate a coupon code and calculate the discount
   *
   * This is the customer-facing endpoint called when a user types a promo code.
   * It does NOT increment usage — that happens only after payment success.
   *
   * @param {string} code - The coupon code to validate
   * @param {number} cartSubtotal - Current cart subtotal
   * @param {string|null} userId - Optional user ID for per-user limit checks
   * @returns {Promise<Object>} { valid, couponId, code, discountType, discountValue, discountAmount, newTotal }
   */
  async validateAndApplyCoupon(code, cartSubtotal, userId = null) {
    try {
      console.log('🔍 [COUPON] Validating coupon:', code, 'for subtotal:', cartSubtotal);

      // Step 1: Find the coupon
      const coupon = await Coupon.findByCode(code);
      if (!coupon) {
        console.log('❌ [COUPON] Code not found:', code);
        return {
          valid: false,
          reason: 'Invalid coupon code',
        };
      }

      // Step 2: Check basic validity (active, not expired, not maxed out)
      const validity = coupon.isValid();
      if (!validity.valid) {
        console.log('❌ [COUPON] Validation failed:', validity.reason);
        return {
          valid: false,
          reason: validity.reason,
        };
      }

      // Step 3: Check minimum order value
      if (coupon.minimumOrderValue > 0 && cartSubtotal < coupon.minimumOrderValue) {
        console.log('❌ [COUPON] Below minimum order value:', coupon.minimumOrderValue);
        return {
          valid: false,
          reason: `Minimum order value of $${coupon.minimumOrderValue.toFixed(2)} required to use this coupon`,
        };
      }

      // Step 4: Check per-user limit (if userId is provided and maxUsesPerUser > 0)
      if (userId && coupon.maxUsesPerUser > 0) {
        const userUsageCount = await Order.countDocuments({
          userId: userId,
          'couponDetails.couponId': coupon._id,
          paymentStatus: 'paid',
        });

        if (userUsageCount >= coupon.maxUsesPerUser) {
          console.log('❌ [COUPON] Per-user limit reached:', userUsageCount, '>=', coupon.maxUsesPerUser);
          return {
            valid: false,
            reason: 'You have already used this coupon the maximum number of times',
          };
        }
      }

      // Step 5: Calculate discount
      const { discountAmount, newTotal } = coupon.calculateDiscount(cartSubtotal);

      console.log('✅ [COUPON] Coupon valid:', {
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        newTotal,
      });

      return {
        valid: true,
        couponId: coupon._id,
        code: coupon.code,
        discountType: coupon.discountType,
        discountValue: coupon.discountValue,
        discountAmount,
        newTotal,
        salesChannel: coupon.salesChannel || '',
      };
    } catch (error) {
      console.error('❌ [COUPON] Validation error:', error.message);
      throw new ServerError(`Failed to validate coupon: ${error.message}`);
    }
  }

  // ==================== Usage Tracking ====================

  /**
   * Increment coupon usage count (called ONLY after payment success)
   *
   * Uses atomic MongoDB $inc to prevent race conditions.
   * Wrapped in try/catch to never fail order creation.
   *
   * @param {string} couponId - Coupon ObjectId
   * @returns {Promise<Object|null>} Updated coupon or null on failure
   */
  async incrementUsage(couponId) {
    try {
      if (!couponId) return null;

      console.log('📈 [COUPON] Incrementing usage for coupon:', couponId);
      const updatedCoupon = await Coupon.incrementUsage(couponId);

      if (updatedCoupon) {
        console.log('✅ [COUPON] Usage incremented:', {
          code: updatedCoupon.code,
          newUsageCount: updatedCoupon.usageCount,
        });
      } else {
        console.warn('⚠️  [COUPON] Coupon not found for usage increment:', couponId);
      }

      return updatedCoupon;
    } catch (error) {
      // Never fail the order — log and continue
      console.error('❌ [COUPON] Failed to increment usage:', error.message);
      return null;
    }
  }

  // ==================== Analytics & Reporting ====================

  /**
   * Get coupon analytics for the admin dashboard
   *
   * Aggregates coupon usage data and revenue attribution from orders.
   *
   * @returns {Promise<Object>} Analytics data
   */
  async getCouponAnalytics() {
    try {
      console.log('📊 [COUPON] Fetching coupon analytics...');

      // Get all coupons with basic stats
      const coupons = await Coupon.find()
        .sort({ usageCount: -1 })
        .populate('createdBy', 'name email')
        .lean();

      // Get revenue data from orders that used coupons
      const revenueByCode = await Order.aggregate([
        {
          $match: {
            'couponDetails.couponId': { $exists: true, $ne: null },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: '$couponDetails.couponId',
            couponCode: { $first: '$couponDetails.code' },
            salesChannel: { $first: '$couponDetails.salesChannel' },
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            totalDiscount: { $sum: '$couponDetails.discountAmount' },
            averageOrderValue: { $avg: '$total' },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      // Merge coupon data with revenue data
      const revenueMap = {};
      revenueByCode.forEach((r) => {
        revenueMap[r._id.toString()] = r;
      });

      const couponAnalytics = coupons.map((coupon) => {
        const revenue = revenueMap[coupon._id.toString()] || {};
        return {
          _id: coupon._id,
          code: coupon.code,
          description: coupon.description,
          discountType: coupon.discountType,
          discountValue: coupon.discountValue,
          isActive: coupon.isActive,
          salesChannel: coupon.salesChannel,
          expiryDate: coupon.expiryDate,
          maxUses: coupon.maxUses,
          usageCount: coupon.usageCount,
          createdBy: coupon.createdBy,
          createdAt: coupon.createdAt,
          // Revenue data from orders
          totalOrders: revenue.totalOrders || 0,
          totalRevenue: Math.round((revenue.totalRevenue || 0) * 100) / 100,
          totalDiscount: Math.round((revenue.totalDiscount || 0) * 100) / 100,
          averageOrderValue: Math.round((revenue.averageOrderValue || 0) * 100) / 100,
        };
      });

      // Summary stats
      const summary = {
        totalCoupons: coupons.length,
        activeCoupons: coupons.filter((c) => c.isActive).length,
        totalUsage: coupons.reduce((sum, c) => sum + c.usageCount, 0),
        totalRevenue: Math.round(revenueByCode.reduce((sum, r) => sum + r.totalRevenue, 0) * 100) / 100,
        totalDiscount: Math.round(revenueByCode.reduce((sum, r) => sum + r.totalDiscount, 0) * 100) / 100,
      };

      // Revenue by sales channel
      const bySalesChannel = await Order.aggregate([
        {
          $match: {
            'couponDetails.salesChannel': { $exists: true, $ne: '' },
            paymentStatus: 'paid',
          },
        },
        {
          $group: {
            _id: '$couponDetails.salesChannel',
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$total' },
            totalDiscount: { $sum: '$couponDetails.discountAmount' },
          },
        },
        { $sort: { totalRevenue: -1 } },
      ]);

      console.log('✅ [COUPON] Analytics generated:', {
        totalCoupons: summary.totalCoupons,
        totalUsage: summary.totalUsage,
        totalRevenue: summary.totalRevenue,
      });

      return {
        data: {
          coupons: couponAnalytics,
          summary,
          bySalesChannel,
        },
      };
    } catch (error) {
      console.error('❌ [COUPON] Analytics error:', error.message);
      throw new ServerError(`Failed to fetch coupon analytics: ${error.message}`);
    }
  }
}

module.exports = new CouponService();
