/**
 * Coupon Model
 * Stores promo/discount codes for marketing campaigns and sales channel tracking.
 *
 * Business rules:
 * - A coupon must be validated before it can affect the order total.
 * - A coupon's usageCount is incremented ONLY after successful payment (webhook).
 * - Inactive or expired coupons are always rejected.
 * - Each coupon can represent a marketing channel, influencer, or campaign via salesChannel.
 */

const mongoose = require('mongoose');

/**
 * Coupon Schema
 */
const CouponSchema = new mongoose.Schema(
  {
    code: {
      type: String,
      required: [true, 'Coupon code is required'],
      unique: true,
      trim: true,
      uppercase: true,
      minlength: [3, 'Coupon code must be at least 3 characters'],
      maxlength: [30, 'Coupon code must be at most 30 characters'],
      match: [/^[A-Z0-9_-]+$/, 'Coupon code must only contain letters, numbers, underscores, and hyphens'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [200, 'Description must be at most 200 characters'],
      default: '',
    },
    discountType: {
      type: String,
      required: [true, 'Discount type is required'],
      enum: {
        values: ['percentage', 'flat'],
        message: 'Discount type must be either "percentage" or "flat"',
      },
    },
    discountValue: {
      type: Number,
      required: [true, 'Discount value is required'],
      min: [0.01, 'Discount value must be greater than 0'],
      validate: {
        validator: function (v) {
          // Percentage discounts cannot exceed 100%
          if (this.discountType === 'percentage' && v > 100) {
            return false;
          }
          return true;
        },
        message: 'Percentage discount cannot exceed 100%',
      },
    },
    minimumOrderValue: {
      type: Number,
      min: [0, 'Minimum order value cannot be negative'],
      default: 0,
    },
    maxUses: {
      type: Number,
      min: [0, 'Max uses cannot be negative'],
      default: 0, // 0 = unlimited
    },
    maxUsesPerUser: {
      type: Number,
      min: [0, 'Max uses per user cannot be negative'],
      default: 1, // 1 = each customer can use it once; 0 = unlimited
    },
    usageCount: {
      type: Number,
      min: 0,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    expiryDate: {
      type: Date,
      default: null, // null = no expiry
    },
    appliesTo: {
      type: String,
      trim: true,
      default: 'all', // e.g., 'all', 'category:board-games', 'product:<id>'
    },
    salesChannel: {
      type: String,
      trim: true,
      default: '', // e.g., 'facebook', 'instagram', 'influencer', 'email'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
    indexes: [
      { code: 1 },           // Fast code lookups
      { isActive: 1 },       // Filter active coupons
      { createdBy: 1 },      // Admin's coupons
      { salesChannel: 1 },   // Channel-based analytics
      { expiryDate: 1 },     // Expiry queries
    ],
  }
);

// ==================== Instance Methods ====================

/**
 * Check if coupon is currently valid (active, not expired, not maxed out)
 * @returns {{ valid: boolean, reason?: string }}
 */
CouponSchema.methods.isValid = function () {
  if (!this.isActive) {
    return { valid: false, reason: 'Coupon is inactive' };
  }

  if (this.expiryDate && new Date() > this.expiryDate) {
    return { valid: false, reason: 'Coupon has expired' };
  }

  if (this.maxUses > 0 && this.usageCount >= this.maxUses) {
    return { valid: false, reason: 'Coupon has reached its maximum number of uses' };
  }

  return { valid: true };
};

/**
 * Calculate the discount for a given order subtotal
 * @param {number} orderSubtotal - The cart/order subtotal before discount
 * @returns {{ discountAmount: number, newTotal: number }}
 */
CouponSchema.methods.calculateDiscount = function (orderSubtotal) {
  if (orderSubtotal <= 0) {
    return { discountAmount: 0, newTotal: 0 };
  }

  let discountAmount;

  if (this.discountType === 'percentage') {
    discountAmount = Math.round(orderSubtotal * (this.discountValue / 100) * 100) / 100;
  } else {
    // flat discount
    discountAmount = this.discountValue;
  }

  // Discount cannot exceed the order subtotal
  discountAmount = Math.min(discountAmount, orderSubtotal);

  // Round to 2 decimal places
  discountAmount = Math.round(discountAmount * 100) / 100;

  const newTotal = Math.round((orderSubtotal - discountAmount) * 100) / 100;

  return { discountAmount, newTotal };
};

/**
 * Serialize coupon to JSON
 */
CouponSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  return obj;
};

// ==================== Static Methods ====================

/**
 * Find a coupon by its code (case-insensitive)
 * @param {string} code - The coupon code to look up
 * @returns {Promise<Object|null>} Coupon document or null
 */
CouponSchema.statics.findByCode = async function (code) {
  if (!code) return null;
  return this.findOne({ code: code.toUpperCase().trim() });
};

/**
 * Atomically increment usage count for a coupon
 * Uses MongoDB $inc to prevent race conditions
 * @param {string} couponId - The coupon ObjectId
 * @returns {Promise<Object>} Updated coupon document
 */
CouponSchema.statics.incrementUsage = async function (couponId) {
  return this.findByIdAndUpdate(
    couponId,
    { $inc: { usageCount: 1 } },
    { new: true }
  );
};

// ==================== Middleware ====================

/**
 * Pre-save: Ensure code is uppercase
 */
CouponSchema.pre('save', function (next) {
  if (this.isModified('code')) {
    this.code = this.code.toUpperCase().trim();
  }
  next();
});

// ==================== Create and Export Model ====================

const Coupon = mongoose.model('Coupon', CouponSchema);

module.exports = Coupon;
