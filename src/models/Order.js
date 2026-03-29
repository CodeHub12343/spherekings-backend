/**
 * Order Model
 * Stores completed purchase orders with payment details and affiliate information
 */

const mongoose = require('mongoose');

/**
 * Order Item Schema - Individual products in an order
 */
const OrderItemSchema = new mongoose.Schema(
  {
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    sku: {
      type: String,
    },
    variant: {
      type: mongoose.Schema.Types.Mixed, // Flexible variant storage
      default: {},
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
      max: 1000,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: true }
);

/**
 * Payment Details Schema - Stripe transaction information
 */
const PaymentDetailsSchema = new mongoose.Schema(
  {
    stripeSessionId: {
      type: String,
      required: true,
      unique: true, // Prevent duplicate orders
      sparse: true,
    },
    paymentIntentId: {
      type: String,
      required: true,
      index: true,
    },
    chargeId: {
      type: String,
    },
    transactionId: {
      type: String, // Unique transaction identifier
      unique: true,
      sparse: true,
    },
    paymentMethod: {
      type: String, // 'card', 'paypal', etc.
      default: 'card',
    },
    currency: {
      type: String,
      default: 'usd',
      uppercase: true,
    },
    paidAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Affiliate Commission Schema - Commission tracking for affiliates
 */
const AffiliateDetailsSchema = new mongoose.Schema(
  {
    affiliateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    affiliateCode: {
      type: String,
    },
    orderValue: {
      type: Number,
      min: 0,
    },
    commissionRate: {
      type: Number,
      min: 0,
      max: 1, // 0-100%
      default: 0.1, // 10% default
    },
    commissionAmount: {
      type: Number,
      min: 0,
    },
    status: {
      type: String,
      enum: ['pending', 'calculated', 'approved', 'paid', 'reversed'],
      default: 'pending',
    },
    referralClickId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ReferralClick', // Link to original click event
    },
    recordedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

/**
 * Main Order Schema
 */
const OrderSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    orderNumber: {
      type: String,
      unique: true,
      sparse: true, // Allow null for auto-generation
      index: true,
    },
    items: {
      type: [OrderItemSchema],
      required: true,
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'Order must contain at least one item',
      },
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
    },
    taxRate: {
      type: Number,
      min: 0,
      default: 0.08, // 8% default tax rate
    },
    shipping: {
      type: Number,
      min: 0,
      default: 0,
    },
    discount: {
      type: Number,
      min: 0,
      default: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentStatus: {
      type: String,
      enum: ['pending', 'paid', 'failed', 'refunded'],
      default: 'pending',
      index: true,
    },
    orderStatus: {
      type: String,
      enum: [
        'pending',
        'processing',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'returned',
      ],
      default: 'pending',
      index: true,
    },
    paymentDetails: PaymentDetailsSchema,
    affiliateDetails: AffiliateDetailsSchema,
    shippingAddress: {
      firstName: String,
      lastName: String,
      email: String,
      phone: String,
      street: String,
      city: String,
      state: String,
      postalCode: String,
      country: String,
    },
    notes: String,
    cancellationReason: String,
    refundDetails: {
      refundIntentId: String,
      refundAmount: Number,
      refundedAt: Date,
      reason: String,
    },
  },
  {
    timestamps: true,
    indexes: [
      { userId: 1, createdAt: -1 }, // User orders by date
      { paymentStatus: 1 }, // Filter by payment
      { orderStatus: 1 }, // Filter by order status
      { 'paymentDetails.stripeSessionId': 1 }, // Webhook lookup
      { 'affiliateDetails.affiliateId': 1 }, // Affiliate lookup
      { createdAt: -1 }, // Recent orders
    ],
  }
);

// ==================== Instance Methods ====================

/**
 * Generate order number if not already set
 * Format: ORD-20240101-123456
 */
OrderSchema.methods.generateOrderNumber = function () {
  if (this.orderNumber) return this.orderNumber;

  const date = new Date();
  const dateStr = date.toISOString().split('T')[0].replace(/-/g, '');
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');
  this.orderNumber = `ORD-${dateStr}-${random}`;
  return this.orderNumber;
};

/**
 * Calculate and update order totals
 */
OrderSchema.methods.calculateTotals = function () {
  // Calculate subtotal from items
  this.subtotal = this.items.reduce((sum, item) => sum + item.subtotal, 0);

  // Calculate tax
  this.tax = Math.round(this.subtotal * this.taxRate * 100) / 100;

  // Calculate total
  this.total = this.subtotal + this.tax + this.shipping - this.discount;

  return {
    subtotal: this.subtotal,
    tax: this.tax,
    shipping: this.shipping,
    discount: this.discount,
    total: this.total,
  };
};

/**
 * Mark order as paid with Stripe details
 */
OrderSchema.methods.markAsPaid = function (stripeData) {
  this.paymentStatus = 'paid';
  this.orderStatus = 'processing'; // Automatically move to processing
  this.paymentDetails = {
    stripeSessionId: stripeData.stripeSessionId,
    paymentIntentId: stripeData.paymentIntentId,
    chargeId: stripeData.chargeId,
    transactionId: stripeData.chargeId, // Use chargeId as transaction ID
    paidAt: new Date(),
  };
  return this;
};

/**
 * Record affiliate commission for this order
 */
OrderSchema.methods.recordAffiliateCommission = function (
  affiliateId,
  commissionRate,
  referralClickId = null
) {
  const commissionAmount = Math.round(this.orderValue * commissionRate * 100) / 100;

  this.affiliateDetails = {
    affiliateId,
    commissionRate,
    orderValue: this.subtotal, // Commission based on order subtotal
    commissionAmount,
    status: 'pending',
    referralClickId,
    recordedAt: new Date(),
  };

  return this;
};

/**
 * Cancel order and refund payment
 */
OrderSchema.methods.cancelOrder = function (reason = 'Customer requested') {
  this.orderStatus = 'cancelled';
  this.paymentStatus = 'refunded';
  this.cancellationReason = reason;
  return this;
};

/**
 * Update order status
 */
OrderSchema.methods.updateStatus = function (newStatus) {
  const validStatuses = [
    'pending',
    'processing',
    'confirmed',
    'shipped',
    'delivered',
    'cancelled',
    'refunded',
  ];

  if (!validStatuses.includes(newStatus)) {
    throw new Error(`Invalid order status: ${newStatus}`);
  }

  this.orderStatus = newStatus;
  return this;
};

/**
 * Check if order can be cancelled
 */
OrderSchema.methods.canBeCancelled = function () {
  return !['delivered', 'cancelled', 'refunded'].includes(this.orderStatus);
};

/**
 * Serialize order to JSON (remove sensitive data if needed)
 */
OrderSchema.methods.toJSON = function () {
  const obj = this.toObject({ virtuals: true });
  // Could remove sensitive payment data here if needed
  return obj;
};

// ==================== Static Methods ====================

/**
 * Create order from checkout session
 */
OrderSchema.statics.createFromCheckout = async function (
  userId,
  cartItems,
  stripeData,
  affiliateId = null,
  shippingAddress = null // SHIPPING ADDRESS PARAMETER - NEW
) {
  console.log('📝 [ORDER.CREATE] Starting order creation from checkout...');

  try {
    // Calculate totals
    const taxRate = parseFloat(process.env.TAX_RATE || 0.08);
    const subtotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);
    const tax = Math.round(subtotal * taxRate * 100) / 100;
    const total = subtotal + tax;

    console.log('💰 [ORDER.CREATE] Calculated totals:', { subtotal, tax, total, taxRate });

    // Create order
    const order = new this({
      userId,
      items: cartItems.map((item) => ({
        productId: item.productId,
        productName: item.productName,
        sku: item.sku,
        variant: item.variant,
        quantity: item.quantity,
        price: item.price,
        subtotal: item.subtotal,
      })),
      subtotal,
      tax,
      taxRate,
      total,
      paymentStatus: 'paid',
      orderStatus: 'processing',
    });

    console.log('📋 [ORDER.CREATE] Order object created in memory');

    // Add Stripe payment details
    order.paymentDetails = {
      stripeSessionId: stripeData.stripeSessionId,
      paymentIntentId: stripeData.paymentIntentId,
      chargeId: stripeData.chargeId,
      transactionId: stripeData.chargeId,
      paidAt: new Date(),
    };

    console.log('💳 [ORDER.CREATE] Payment details added');

    // Add shipping address if provided
    if (shippingAddress) {
      order.shippingAddress = shippingAddress;
      console.log('🚚 [ORDER.CREATE] Shipping address added:', {
        street: shippingAddress.street,
        city: shippingAddress.city,
        state: shippingAddress.state
      });
    } else {
      console.warn('⚠️  [ORDER.CREATE] No shipping address provided for order');
    }

    // Add affiliate details if applicable
    if (affiliateId) {
      const commissionRate = parseFloat(process.env.COMMISSION_RATE || 0.1); // 10%
      
      // Fetch affiliate code from Affiliate model
      let affiliateCode = null;
      try {
        const Affiliate = require('./Affiliate');
        const affiliate = await Affiliate.findById(affiliateId).select('affiliateCode');
        if (affiliate) {
          affiliateCode = affiliate.affiliateCode;
          console.log(`✅ [ORDER.CREATE] Affiliate code retrieved: ${affiliateCode}`);
        } else {
          console.warn(`⚠️  [ORDER.CREATE] Affiliate not found for ID: ${affiliateId}`);
        }
      } catch (affiliateLookupError) {
        console.warn(`⚠️  [ORDER.CREATE] Error fetching affiliate code: ${affiliateLookupError.message}`);
      }
      
      order.affiliateDetails = {
        affiliateId,
        affiliateCode, // Now includes the affiliate code
        commissionRate,
        orderValue: subtotal,
        commissionAmount: Math.round(subtotal * commissionRate * 100) / 100,
        status: 'pending',
        recordedAt: new Date(),
      };
      console.log('🤝 [ORDER.CREATE] Affiliate details added:', { affiliateId, affiliateCode, commissionRate });
    }

    // Generate order number
    order.generateOrderNumber();
    console.log('🏷️  [ORDER.CREATE] Order number generated:', order.orderNumber);

    // Validate order before saving
    const validationError = order.validateSync();
    if (validationError) {
      console.error('❌ [ORDER.CREATE] Order validation error:', validationError.message);
      throw validationError;
    }

    console.log('✅ [ORDER.CREATE] Order validation passed');

    // Save to database
    console.log('💾 [ORDER.CREATE] Saving order to database...');
    await order.save();

    console.log('✅ [ORDER.CREATE] Order saved successfully:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus
    });

    return order;
  } catch (error) {
    console.error('❌ [ORDER.CREATE] Order creation failed:', {
      errorName: error.name,
      errorMessage: error.message,
      userId,
      itemCount: cartItems.length
    });
    throw error;
  }
};

/**
 * Find order by Stripe session ID (idempotency check)
 */
OrderSchema.statics.findByStripeSessionId = async function (stripeSessionId) {
  return this.findOne({ 'paymentDetails.stripeSessionId': stripeSessionId });
};

/**
 * Find user's recent orders
 */
OrderSchema.statics.findUserOrders = async function (userId, limit = 10) {
  return this.find({ userId })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'name email')
    .populate('items.productId', 'name price')
    .populate('affiliateDetails.affiliateId', 'name email');
};

// ==================== Middleware ====================

/**
 * Pre-save: Generate order number if not set
 */
OrderSchema.pre('save', function (next) {
  if (!this.orderNumber) {
    this.generateOrderNumber();
  }
  next();
});

/**
 * Pre-save: Calculate totals
 */
OrderSchema.pre('save', function (next) {
  if (this.isModified('items')) {
    this.calculateTotals();
  }
  next();
});

// ==================== Create and Export Model ====================

const Order = mongoose.model('Order', OrderSchema);

module.exports = Order;
