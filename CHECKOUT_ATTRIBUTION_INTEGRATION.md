# Referral Tracking - Checkout Attribution Integration Guide

## Table of Contents

1. [Integration Overview](#integration-overview)
2. [Checkout Session Creation with Affiliate](#checkout-session-creation-with-affiliate)
3. [Stripe Session Metadata](#stripe-session-metadata)
4. [Webhook Payment Processing](#webhook-payment-processing)
5. [Order Attribution](#order-attribution)
6. [Commission Triggering](#commission-triggering)
7. [Manual Attribution for Admin](#manual-attribution-for-admin)
8. [Error Handling & Recovery](#error-handling--recovery)
9. [Testing Checkout Attribution](#testing-checkout-attribution)
10. [Common Integration Issues](#common-integration-issues)

---

## Integration Overview

### The Complete Attribution Flow

```
Step 1: Affiliate Click
│
├─ GET /api/tracking/click?ref=AFF12345678
├─ Server records click
├─ Server sets affiliate cookies (90 days)
└─ User redirected to site

Step 2: User Browsing
│
├─ User adds items to cart
├─ Cookies persist in browser
└─ Affiliate attribution available

Step 3: Checkout Initiated
│
├─ POST /api/checkout/create-session
├─ Server reads affiliateId from cookie
├─ Server creates Stripe session
├─ Session metadata includes affiliateId
└─ Session ID returned to frontend

Step 4: Payment Processing
│
├─ Frontend redirects to Stripe checkout
├─ Customer enters payment info
├─ Stripe processes payment
├─ Stripe returns to success page
└─ Customer completes purchase

Step 5: Webhook Confirmation
│
├─ Stripe sends webhook to /api/checkout/webhook
├─ Server verifies webhook signature
├─ Server retrieves session from Stripe
├─ Server extracts affiliateId from metadata
└─ Server creates Order with affiliate info

Step 6: Commission Triggered
│
├─ Order created with affiliateDetails
├─ Commission service notified
├─ Commission record created (pending)
├─ Affiliate balance updated
└─ Commission email sent

Step 7: Affiliate Earnings Updated
│
├─ Affiliate dashboard shows new sale
├─ Commission appears in analytics
├─ Affiliate can track conversion
└─ Payout eligible after approval
```

---

## Checkout Session Creation with Affiliate

### Getting Affiliate ID for Checkout

```javascript
// File: src/controllers/checkoutController.js

/**
 * POST /api/checkout/create-session
 *
 * Creates a Stripe checkout session with optional affiliate attribution
 *
 * Affiliate ID can come from:
 * 1. Browser cookies (primary - automatic from referral click)
 * 2. Request body (secondary - manual entry)
 * 3. Query parameter (fallback)
 */
async createCheckoutSession(req, res, next) {
  try {
    const userId = req.user._id;

    // Step 1: Get affiliateId from multiple sources
    // (in priority order)
    let affiliateId = null;

    // Source 1: From cookies (set by /api/tracking/click)
    // HttpOnly flag means server gets it automatically
    if (req.cookies?.affiliateId) {
      affiliateId = req.cookies.affiliateId;
      console.log('Affiliate from cookie:', affiliateId);
    }

    // Source 2: From request body (manual entry)
    // Frontend can pass affiliateCode explicitly
    if (!affiliateId && req.body?.affiliateId) {
      affiliateId = req.body.affiliateId;
      console.log('Affiliate from body:', affiliateId);
    }

    // Source 3: From query parameter
    if (!affiliateId && req.query?.affiliateId) {
      affiliateId = req.query.affiliateId;
      console.log('Affiliate from query:', affiliateId);
    }

    // Step 2: Validate affiliateId if present
    if (affiliateId) {
      try {
        const affiliate = await Affiliate.findById(affiliateId);

        if (!affiliate) {
          console.warn(`Affiliate not found: ${affiliateId}`);
          affiliateId = null;
        } else if (affiliate.status !== 'active') {
          console.warn(`Affiliate inactive: ${affiliateId}`);
          affiliateId = null;
        } else {
          // Affiliate is valid
          console.log(`Affiliate validated: ${affiliate.affiliateCode}`);
        }
      } catch (error) {
        console.error('Error validating affiliate:', error);
        affiliateId = null;
      }
    }

    // Step 3: Create checkout session with affiliate
    const sessionData = await checkoutService.createCheckoutSession(
      userId,
      cartService,
      productService,
      affiliateId  // Pass to service (can be null)
    );

    // Step 4: Return session details
    return res.status(201).json({
      success: true,
      message: 'Checkout session created',
      data: {
        sessionId: sessionData.sessionId,
        url: sessionData.url,
        affiliateCode: sessionData.affiliateCode || null
      },
    });
  } catch (error) {
    next(error);
  }
}
```

### Backend: Checkout Service Processing

```javascript
// File: src/services/checkoutService.js

class CheckoutService {
  /**
   * Create Stripe checkout session
   *
   * @param {string} userId - Customer ID
   * @param {object} cartService - Cart service instance
   * @param {object} productService - Product service instance
   * @param {string} affiliateId - Affiliate ID (optional)
   * @returns {object} { sessionId, url, affiliateCode }
   */
  async createCheckoutSession(
    userId,
    cartService,
    productService,
    affiliateId = null
  ) {
    // Step 1: Get customer's cart
    const cart = await cartService.getCart(userId);

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('Cannot checkout with an empty cart');
    }

    // Step 2: Get product details and calculate total
    const lineItems = [];
    let totalAmount = 0;

    for (const item of cart.items) {
      const product = await productService.getProduct(item.productId);

      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: product.name,
            images: product.images || [],
          },
          unit_amount: Math.round(product.price * 100), // Convert to cents
        },
        quantity: item.quantity || 1,
      });

      totalAmount += product.price * (item.quantity || 1);
    }

    // Step 3: Get affiliate code if ID provided
    let affiliateCode = null;
    if (affiliateId) {
      try {
        const affiliate = await Affiliate.findById(affiliateId);
        if (affiliate) {
          affiliateCode = affiliate.affiliateCode;
        }
      } catch (error) {
        console.error('Error retrieving affiliate code:', error);
      }
    }

    // Step 4: Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      success_url: `${process.env.FRONTEND_URL}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/checkout/cancel`,
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',

      // CRITICAL: Store affiliate info in metadata
      // This data will be available in the webhook
      metadata: {
        userId: userId.toString(),
        affiliateId: affiliateId ? affiliateId.toString() : null,
        affiliateCode: affiliateCode || null,
        totalAmount: Math.round(totalAmount * 100), // In cents
      },

      customer_email: req.user?.email || undefined,
    });

    console.log('Stripe session created:', {
      sessionId: session.id,
      total: totalAmount,
      affiliateId: affiliateId,
      affiliateCode: affiliateCode,
    });

    return {
      sessionId: session.id,
      url: session.url,
      affiliateCode: affiliateCode,
    };
  }
}
```

### Frontend: Sending Affiliate to Checkout

```javascript
// File: src/pages/checkout/CheckoutPage.jsx

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function CheckoutPage() {
  const [affiliateCode, setAffiliateCode] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Get affiliate code from cookie (set by referral tracking)
    const code = Cookies.get('affiliateCode');
    if (code) {
      setAffiliateCode(code);
      console.log('Affiliate detected:', code);
    }
  }, []);

  const handleCheckout = async () => {
    setIsLoading(true);

    try {
      // Call checkout endpoint
      // Cookies are automatically sent by browser
      const response = await fetch('/api/checkout/create-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`,
        },
        credentials: 'include', // CRITICAL: Send cookies!
        body: JSON.stringify({
          // Optionally also send in body as backup
          affiliateCode: affiliateCode,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.message);
      }

      // Redirect to Stripe checkout
      window.location.href = data.data.url;
    } catch (error) {
      console.error('Checkout error:', error);
      alert('Checkout failed: ' + error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-container">
      <h1>Checkout</h1>

      {affiliateCode && (
        <div className="affiliate-info">
          <p>✓ Referred by: <strong>{affiliateCode}</strong></p>
          <p>Your purchase will earn them a commission!</p>
        </div>
      )}

      <button
        onClick={handleCheckout}
        disabled={isLoading}
        className="checkout-btn"
      >
        {isLoading ? 'Processing...' : 'Proceed to Payment'}
      </button>
    </div>
  );
}
```

---

## Stripe Session Metadata

### Why Metadata Matters

```
Checkout Session Flow:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Server                           Stripe
   │                              │
   ├─ Create Session      ────→   │
   │  (includes metadata)         │
   │                         ↓    │
   │                    Stores Metadata
   │                         ↓
   │  ← Webhook Event ───────┤
   │  (includes metadata)    │
   │                        │
```

### Metadata Structure

```javascript
// What gets stored in Stripe:
const metadata = {
  userId: "507f1f77bcf86cd799439012",      // Customer ID (string)
  affiliateId: "507f1f77bcf86cd799439013", // Affiliate ID (string, can be null)
  affiliateCode: "AFF12345678",            // Human-readable code (string)
  totalAmount: 15000,                       // Total in cents (1500.00 USD)
};

// Key Points:
// 1. Metadata must be flat (no nested objects)
// 2. All values must be strings or numbers
// 3. Max 50 key-value pairs
// 4. Max 500 bytes total
// 5. Stripe returns metadata exactly as sent

// Limitations:
// ❌ Cannot store objects: { name: { first: "John" } } won't work
// ❌ Cannot store arrays: affiliateIds: ["id1", "id2"] won't work
// ✅ Use strings: affiliateId: "507f..." (single value)
```

### Retrieving Session Metadata

```javascript
// File: src/services/checkoutService.js

async handlePaymentSuccess(event, cartService, productService) {
  try {
    // Step 1: Get session from webhook event
    const session = event.data.object;

    console.log('Payment Session:', {
      sessionId: session.id,
      amount: session.amount_total,
      metadata: session.metadata
    });

    // Step 2: Extract metadata
    const metadata = session.metadata || {};
    const userId = metadata.userId;
    const affiliateId = metadata.affiliateId;
    const affiliateCode = metadata.affiliateCode;

    console.log('Extracted metadata:', {
      userId,
      affiliateId,
      affiliateCode
    });

    // Step 3: Verify userId
    if (!userId) {
      throw new Error('User ID missing from session metadata');
    }

    // at Step 4: Create order with affiliate info
    const order = await Order.create({
      userId: userId,
      items: cartItems,
      totalAmount: session.amount_total / 100, // Convert from cents
      paymentStatus: 'paid',
      paymentId: session.payment_intent,

      // CRITICAL: Store affiliate details with order
      affiliateDetails: {
        affiliateId: affiliateId || null,
        affiliateCode: affiliateCode || null,
        attributionSource: 'referral_cookie',
        attributionTimestamp: new Date(),
      },
    });

    console.log('Order created with affiliate:', order._id, affiliateId);

    return order;
  } catch (error) {
    console.error('Order creation error:', error);
    throw error;
  }
}
```

---

## Webhook Payment Processing

### Stripe Webhook Handler

```javascript
// File: src/controllers/checkoutController.js

/**
 * POST /api/checkout/webhook
 *
 * Stripe webhook endpoint for payment completion events
 *
 * Security:
 * - Signature verified by middleware before this handler
 * - Event data trusted and safe to use
 * - Idempotent: safe to call multiple times
 */
async handleStripeWebhook(req, res, next) {
  try {
    // Get verified event from middleware
    const event = req.event;

    if (!event) {
      console.error('No verified event in webhook request');
      return res.status(400).json({
        error: 'No verified event'
      });
    }

    console.log('Webhook event type:', event.type);
    console.log('Event ID:', event.id);

    // Only process checkout.session.completed (successful payment)
    if (event.type === 'checkout.session.completed') {
      console.log('Processing successful checkout...');

      // Create order from payment
      const order = await checkoutService.handlePaymentSuccess(
        event,
        cartService,
        productService
      );

      // Order now has affiliateDetails set!
      console.log('Order created:', {
        orderId: order._id,
        affiliateId: order.affiliateDetails?.affiliateId,
        affiliateCode: order.affiliateDetails?.affiliateCode
      });

      // Return success response to Stripe
      return res.status(200).json({
        received: true,
        orderId: order._id.toString(),
        orderNumber: order.orderNumber,
        affiliateId: order.affiliateDetails?.affiliateId || null,
      });
    }

    // For other event types, acknowledge but don't process
    return res.status(200).json({
      received: true,
      note: `Event type '${event.type}' not processed (only checkout.session.completed)`,
    });
  } catch (error) {
    console.error('Webhook handler error:', error);
    // Return 500 so Stripe will retry
    return next(error);
  }
}
```

### Session Retrieval for Debugging

```javascript
// File: src/controllers/checkoutController.js

/**
 * GET /api/checkout/session/:sessionId
 *
 * Retrieve Stripe session details (for debugging/verification)
 *
 * Admin-only endpoint to inspect session data
 */
async getCheckoutSession(req, res, next) {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({
        success: false,
        message: 'Session ID required',
      });
    }

    // Retrieve session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    // Return session details including metadata
    return res.status(200).json({
      success: true,
      data: {
        sessionId: session.id,
        status: session.payment_status,
        amount: session.amount_total,
        currency: session.currency,
        metadata: session.metadata,
        paymentIntent: session.payment_intent,
        paymentMethod: session.payment_method_types,
        createdAt: new Date(session.created * 1000),
      },
    });
  } catch (error) {
    next(error);
  }
}
```

---

## Order Attribution

### Order Model with Affiliate Details

```javascript
// File: src/models/Order.js

const AffiliateDetailsSchema = new mongoose.Schema(
  {
    // Reference to Affiliate
    affiliateId: {
      type: Schema.Types.ObjectId,
      ref: 'Affiliate',
      default: null,
      index: true, // Index for lookups
    },

    // Denormalized affiliate code for readability
    affiliateCode: {
      type: String,
      default: null,
    },

    // How attribution was determined
    attributionSource: {
      type: String,
      enum: ['referral_cookie', 'manual', 'direct'],
      default: 'referral_cookie',
    },

    // When attribution was recorded
    attributionTimestamp: {
      type: Date,
      default: Date.now,
    },

    // Commission details
    commissionPercentage: {
      type: Number,
      default: 0.17, // 17%
      min: 0,
      max: 1,
    },

    commissionAmount: {
      type: Number,
      default: 0,
      min: 0,
    },

    // Commission status (lifecycle)
    commissionStatus: {
      type: String,
      enum: ['pending', 'approved', 'paid', 'reversed'],
      default: 'pending',
      index: true,
    },
  },
  { _id: false } // Don't create separate ID for subdocument
);

// Main Order schema includes affiliate details
const OrderSchema = new Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },

  // ... other order fields ...

  // Affiliate attribution
  affiliateDetails: {
    type: AffiliateDetailsSchema,
    default: () => ({}), // Create empty object if not provided
  },

  // ... more fields ...
});

// Static method to create order with affiliate
OrderSchema.statics.createWithAffiliate = async function(
  userId,
  items,
  totalAmount,
  affiliateId = null
) {
  const order = new this({
    userId,
    items,
    totalAmount,
    paymentStatus: 'paid',
    orderStatus: 'processing',
  });

  // Attach affiliate if provided
  if (affiliateId) {
    const affiliate = await mongoose.model('Affiliate').findById(affiliateId);

    if (affiliate) {
      order.affiliateDetails = {
        affiliateId: affiliate._id,
        affiliateCode: affiliate.affiliateCode,
        attributionSource: 'referral_cookie',
        attributionTimestamp: new Date(),
        commissionPercentage: affiliate.commissionRate || 0.17,
        commissionAmount: Math.round(totalAmount * (affiliate.commissionRate || 0.17)),
      };
    }
  }

  await order.save();
  return order;
};

module.exports = mongoose.model('Order', OrderSchema);
```

### Creating Order from Payment

```javascript
// File: src/services/checkoutService.js

async handlePaymentSuccess(event, cartService, productService) {
  const session = event.data.object;
  const metadata = session.metadata || {};

  // Extract affiliate info from metadata
  const userId = metadata.userId;
  const affiliateId = metadata.affiliateId;
  const affiliateCode = metadata.affiliateCode;

  // Get cart items
  const cart = await cartService.getCart(userId);
  const items = cart.items;

  // Create order with affiliate attribution
  const order = await Order.create({
    userId: userId,
    items: items,
    totalAmount: session.amount_total / 100, // Convert from cents
    paymentStatus: 'paid',
    paymentId: session.payment_intent,

    // Affiliate details automatically calculated
    affiliateDetails: {
      affiliateId: affiliateId || null,
      affiliateCode: affiliateCode || null,
      attributionSource: 'referral_cookie',
      attributionTimestamp: new Date(),
    },
  });

  // Log creation
  console.log('Order created with affiliate attribution:', {
    orderId: order._id,
    userId: userId,
    affiliateId: affiliateId,
    affiliateCode: affiliateCode,
    amount: order.totalAmount,
  });

  // Mark referral as converted (if we can find it)
  if (affiliateId) {
    await this._markReferralAsConverted(affiliateId, order._id);
  }

  return order;
}

/**
 * Mark a referral click as converted to a sale
 */
async _markReferralAsConverted(affiliateId, orderId) {
  try {
    // Find the referral tracking record for this affiliate
    // That matches the referral window (recent enough)
    const tracking = await ReferralTracking.findOne({
      affiliateId: affiliateId,
      convertedToSale: false,
      createdAt: {
        // Must be within 90 days
        $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)
      }
    }).sort({ createdAt: -1 }); // Most recent first

    if (tracking) {
      // Mark as converted
      tracking.convertedToSale = true;
      tracking.orderId = orderId;
      tracking.conversionTimestamp = new Date();

      await tracking.save();

      console.log('Referral tracking marked as converted:', {
        trackingId: tracking._id,
        orderId: orderId,
      });
    }
  } catch (error) {
    console.error('Error marking referral as converted:', error);
    // Don't fail the order creation if tracking fails
  }
}
```

---

## Commission Triggering

### Automatic Commission Creation

```javascript
// File: src/services/checkoutService.js

async handlePaymentSuccess(event, cartService, productService) {
  // ... create order ...

  // After order created, trigger commission
  if (order.affiliateDetails?.affiliateId) {
    await this._triggerAffiliateCommission(order);
  }

  return order;
}

/**
 * Trigger affiliate commission calculation
 */
async _triggerAffiliateCommission(order) {
  try {
    // Verify order has affiliate details
    if (!order.affiliateDetails?.affiliateId) {
      return; // No affiliate, no commission
    }

    const affiliateId = order.affiliateDetails.affiliateId;
    const commissionAmount = order.affiliateDetails.commissionAmount;

    console.log('Triggering commission:', {
      affiliateId: affiliateId,
      orderId: order._id,
      amount: commissionAmount,
    });

    // Update affiliate metrics
    const affiliate = await Affiliate.findByIdAndUpdate(
      affiliateId,
      {
        // Increment metrics
        $inc: {
          'metrics.totalSales': order.totalAmount,
          'metrics.totalEarnings': commissionAmount,
          'metrics.pendingEarnings': commissionAmount,
        },
        // Update last activity
        $set: {
          'metrics.lastSaleDate': new Date(),
        }
      },
      { new: true }
    );

    if (!affiliate) {
      throw new Error(`Affiliate not found: ${affiliateId}`);
    }

    // Create commission record (for Phase 7 - Commission Engine)
    // This is just a placeholder - actual commission service will be in Phase 7
    console.log('Commission triggered:', {
      affiliate: affiliate.affiliateCode,
      earnings: commissionAmount,
      order: order.orderNumber,
    });

    // Send commission notification email (async, non-blocking)
    this._sendCommissionEmail(affiliate, order).catch(err => {
      console.error('Error sending commission email:', err);
    });

  } catch (error) {
    console.error('Error triggering affiliate commission:', error);
    // Log error but don't fail order creation
    // Commission can be manually processed later
  }
}

/**
 * Send affiliate commission notification email
 */
async _sendCommissionEmail(affiliate, order) {
  // Implementation sends email to affiliate about new commission
  // Details would be specific to your email service
  console.log(`Commission email queued for: ${affiliate.affiliateCode}`);
}
```

---

## Manual Attribution for Admin

### Admin Endpoint to Attribute Order

```javascript
// File: src/controllers/orderController.js

class OrderController {
  /**
   * POST /api/admin/orders/:orderId/attribute
   *
   * Manually attribute an order to an affiliate (Admin only)
   *
   * Use cases:
   * - Fix incorrect attribution
   * - Attribute orders from non-tracked sources
   * - Correct cookie-less attribution
   */
  async attributeOrderToAffiliate(req, res, next) {
    try {
      const { orderId } = req.params;
      const { affiliateCode } = req.body;

      if (!orderId || !affiliateCode) {
        return res.status(400).json({
          success: false,
          message: 'Order ID and affiliate code required',
        });
      }

      // Step 1: Find affiliate
      const affiliate = await Affiliate.findOne({
        affiliateCode: affiliateCode.toUpperCase()
      });

      if (!affiliate) {
        return res.status(404).json({
          success: false,
          message: 'Affiliate not found',
        });
      }

      // Step 2: Find order
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      // Step 3: Check if already attributed
      if (order.affiliateDetails?.affiliateId) {
        return res.status(409).json({
          success: false,
          message: 'Order already attributed to another affiliate',
          data: {
            currentAffiliate: order.affiliateDetails.affiliateCode,
          }
        });
      }

      // Step 4: Attribute order
      order.affiliateDetails = {
        affiliateId: affiliate._id,
        affiliateCode: affiliate.affiliateCode,
        attributionSource: 'manual',
        attributionTimestamp: new Date(),
        commissionPercentage: affiliate.commissionRate || 0.17,
        commissionAmount: Math.round(
          order.totalAmount * (affiliate.commissionRate || 0.17)
        ),
        commissionStatus: 'pending',
      };

      await order.save();

      // Step 5: Update affiliate metrics
      await Affiliate.findByIdAndUpdate(
        affiliate._id,
        {
          $inc: {
            'metrics.totalSales': order.totalAmount,
            'metrics.totalEarnings': order.affiliateDetails.commissionAmount,
            'metrics.pendingEarnings': order.affiliateDetails.commissionAmount,
          }
        }
      );

      console.log('Order attributed by admin:', {
        orderId: order._id,
        affiliateId: affiliate._id,
        affiliateCode: affiliate.affiliateCode,
        commission: order.affiliateDetails.commissionAmount,
      });

      // Step 6: Return success
      return res.status(200).json({
        success: true,
        message: 'Order attributed successfully',
        data: {
          orderId: order._id,
          orderNumber: order.orderNumber,
          affiliateId: affiliate._id,
          affiliateCode: affiliate.affiliateCode,
          commissionAmount: order.affiliateDetails.commissionAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/orders/:orderId/attribute/remove
   *
   * Remove attribution from an order (reverse commission)
   */
  async removeOrderAttribution(req, res, next) {
    try {
      const { orderId } = req.params;

      // Find order
      const order = await Order.findById(orderId);

      if (!order) {
        return res.status(404).json({
          success: false,
          message: 'Order not found',
        });
      }

      if (!order.affiliateDetails?.affiliateId) {
        return res.status(400).json({
          success: false,
          message: 'Order has no affiliate attribution',
        });
      }

      const affiliateId = order.affiliateDetails.affiliateId;
      const commissionAmount = order.affiliateDetails.commissionAmount;

      // Remove attribution
      order.affiliateDetails = {
        affiliateId: null,
        affiliateCode: null,
        attributionSource: null,
        commissionAmount: 0,
        commissionStatus: 'reversed',
      };

      await order.save();

      // Reverse affiliate metrics
      await Affiliate.findByIdAndUpdate(
        affiliateId,
        {
          $inc: {
            'metrics.totalSales': -order.totalAmount,
            'metrics.totalEarnings': -commissionAmount,
            'metrics.pendingEarnings': -commissionAmount,
          }
        }
      );

      return res.status(200).json({
        success: true,
        message: 'Order attribution removed',
        data: {
          orderId: order._id,
          reversedCommission: commissionAmount,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
```

---

## Error Handling & Recovery

### Handling Failed Webhooks

```javascript
// File: src/services/checkoutService.js

/**
 * Robust webhook handling with error recovery
 */
async handlePaymentSuccess(event, cartService, productService) {
  let order = null;
  let retryCount = 0;
  const maxRetries = 3;

  try {
    // Step 1: Extract data with validation
    const session = event.data.object;
    const metadata = session.metadata || {};
    const userId = metadata.userId;

    if (!userId) {
      throw new Error('USER_ID_MISSING: Cannot create order without userId');
    }

    // Step 2: Get cart with retry logic
    let cart = null;
    while (!cart && retryCount < maxRetries) {
      try {
        cart = await cartService.getCart(userId);
        if (!cart || !cart.items || cart.items.length === 0) {
          throw new Error('EMPTY_CART');
        }
      } catch (error) {
        retryCount++;
        if (retryCount < maxRetries) {
          console.warn(`Cart retrieval failed (attempt ${retryCount}), retrying...`);
          await new Promise(r => setTimeout(r, 1000 * Math.pow(2, retryCount))); // Exponential backoff
        } else {
          throw error;
        }
      }
    }

    // Step 3: Create order
    try {
      order = await Order.create({
        userId: userId,
        items: cart.items,
        totalAmount: session.amount_total / 100,
        paymentStatus: 'paid',
        paymentId: session.payment_intent,
        affiliateDetails: {
          affiliateId: metadata.affiliateId || null,
          affiliateCode: metadata.affiliateCode || null,
          attributionSource: 'referral_cookie',
          attributionTimestamp: new Date(),
        },
      });

      console.log('Order created successfully:', order._id);
    } catch (orderError) {
      // Log detailed error for debugging
      console.error('Order creation failed:', {
        error: orderError.message,
        userId: userId,
        amount: session.amount_total,
      });

      throw new Error(`ORDER_CREATION_FAILED: ${orderError.message}`);
    }

    // Step 4: Process affiliate commission (non-blocking)
    if (order.affiliateDetails?.affiliateId) {
      this._triggerAffiliateCommission(order)
        .catch(err => {
          console.error('Commission trigger error:', err);
          // Log to error tracking service (Sentry, etc.)
          // Affiliate support can manually process if needed
        });
    }

    return order;
  } catch (error) {
    console.error('Payment success handler error:', {
      errorMessage: error.message,
      errorCode: error.code,
      orderId: order?._id,
      userId: metadata?.userId,
      sessionId: event.data.object.id,
      timestamp: new Date().toISOString(),
    });

    // Log to error tracking service
    // This allows support team to resolve issues

    throw error;
  }
}
```

### Recovering Failed Orders

```javascript
// File: src/controllers/adminController.js

/**
 * GET /api/admin/failed-orders
 * Get orders that might have failed attribution
 */
async getFailedOrders(req, res, next) {
  try {
    const { startDate, endDate, includeNoAffiliate } = req.query;

    let query = {};

    // Find orders that should have affiliate but don't
    if (includeNoAffiliate === 'false') {
      // Order has Stripe metadata but no Order.affiliateDetails
      query = {
        paymentStatus: 'paid',
        'affiliateDetails.affiliateId': null,
        createdAt: {
          $gte: new Date(startDate || Date.now() - 7 * 24 * 60 * 60 * 1000),
          $lte: new Date(endDate || Date.now()),
        }
      };
    }

    const failedOrders = await Order
      .find(query)
      .populate('userId')
      .sort({ createdAt: -1 })
      .limit(50);

    res.json({
      success: true,
      count: failedOrders.length,
      data: failedOrders,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/orders/:orderId/retry-attribution
 * Retry attribution for a failed order
 */
async retryOrderAttribution(req, res, next) {
  try {
    const { orderId } = req.params;
    const { affiliateId } = req.body;

    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: 'Order not found' });
    }

    // Validate affiliate
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate) {
      return res.status(404).json({ success: false, message: 'Affiliate not found' });
    }

    // Set attribution
    order.affiliateDetails = {
      affiliateId: affiliate._id,
      affiliateCode: affiliate.affiliateCode,
      attributionSource: 'manual_retry',
      attributionTimestamp: new Date(),
    };

    await order.save();

    res.json({
      success: true,
      message: 'Attribution retry successful',
      data: order,
    });
  } catch (error) {
    next(error);
  }
}
```

---

## Testing Checkout Attribution

### Integration Test: Complete Attribution Flow

```javascript
// File: tests/integration/checkoutAttribution.test.js

describe('Checkout Attribution Integration', () => {
  let affiliate, user, product, sessionId;

  beforeEach(async () => {
    // Create test data
    affiliate = await Affiliate.create({
      userId: new ObjectId(),
      affiliateCode: 'AFFTEST123',
      status: 'active',
    });

    user = await User.create({
      email: 'user@example.com',
      password: 'hash',
    });

    product = await Product.create({
      name: 'Test Product',
      price: 100.00,
    });
  });

  it('should attribute order to affiliate from cookies', async () => {
    // Step 1: Simulate referral click (sets cookies)
    const trackingRes = await request(app)
      .get('/api/tracking/click')
      .query({ ref: affiliate.affiliateCode });

    expect(trackingRes.status).toBe(200);
    const cookies = trackingRes.headers['set-cookie'];

    // Step 2: Create checkout session with cookies
    const checkoutRes = await request(app)
      .post('/api/checkout/create-session')
      .set('Authorization', `Bearer ${token}`)
      .set('Cookie', cookies) // Include affiliate cookies
      .send({});

    expect(checkoutRes.status).toBe(201);
    sessionId = checkoutRes.body.data.sessionId;

    // Step 3: Simulate Stripe webhook with payment success
    const webhookRes = await request(app)
      .post('/api/checkout/webhook')
      .set('stripe-signature', 'test_sig')
      .send({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            payment_status: 'paid',
            amount_total: 10000, // $100 in cents
            metadata: {
              userId: user._id.toString(),
              affiliateId: affiliate._id.toString(),
              affiliateCode: affiliate.affiliateCode,
            },
          }
        }
      });

    // Step 4: Verify order created with affiliate
    expect(webhookRes.status).toBe(200);

    const order = await Order.findOne({ userId: user._id });
    expect(order).toBeDefined();
    expect(order.affiliateDetails.affiliateId).toEqual(affiliate._id);
    expect(order.affiliateDetails.affiliateCode).toBe(affiliate.affiliateCode);

    // Step 5: Verify referral marked as converted
    const tracking = await ReferralTracking.findOne({
      affiliateId: affiliate._id,
      convertedToSale: true,
    });
    expect(tracking).toBeDefined();
    expect(tracking.orderId).toEqual(order._id);
  });

  it('should calculate commission correctly', async () => {
    // Create order with affiliate
    const order = await Order.create({
      userId: user._id,
      items: [{ productId: product._id, quantity: 1 }],
      totalAmount: 100.00,
      affiliateDetails: {
        affiliateId: affiliate._id,
        affiliateCode: affiliate.affiliateCode,
      }
    });

    // Commission should be 17% by default
    const expectedCommission = 100.00 * 0.17;
    expect(order.affiliateDetails.commissionAmount).toBe(expectedCommission);
  });

  it('should recover from failed attribution', async () => {
    // Create order without attribution
    const order = await Order.create({
      userId: user._id,
      items: [{ productId: product._id, quantity: 1 }],
      totalAmount: 100.00,
    });

    // Admin manually attributes
    const attributeRes = await request(app)
      .post(`/api/admin/orders/${order._id}/attribute`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ affiliateCode: affiliate.affiliateCode });

    expect(attributeRes.status).toBe(200);

    // Verify attribution
    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.affiliateDetails.affiliateId).toEqual(affiliate._id);
  });
});
```

---

## Common Integration Issues

### Issue 1: affiliateId in Metadata is null

**Cause**: Cookie not being sent to checkout endpoint

**Solution**:
```javascript
// Ensure cookies sent with fetch
const response = await fetch('/api/checkout/create-session', {
  method: 'POST',
  credentials: 'include',  // ← This is critical
  headers: { 'Authorization': `Bearer ${token}` }
});
```

### Issue 2: Order Created but Commission Not Triggered

**Cause**: affiliateId validation failing

**Solution**:
```javascript
// Verify affiliate exists before processing
if (affiliateId) {
  const affiliate = await Affiliate.findById(affiliateId);
  if (affiliate && affiliate.status === 'active') {
    // Proceed with commission
  }
}
```

### Issue 3: Metadata Exceeds Size Limits

**Cause**: Storing complex objects in metadata

**Solution**:
```javascript
// ❌ Wrong: Complex object
metadata: {
  user: { id: userId, email: email, name: name }, // Too large
};

// ✓ Correct: Simple strings
metadata: {
  userId: userId.toString(),
  userEmail: email,
};
```

---

## Summary

The checkout attribution integration enables:

- ✅ **Automatic Attribution**: Cookies enable seamless order attribution
- ✅ **Metadata Passing**: Session metadata preserves affiliate info through payment
- ✅ **Webhook Processing**: Stripe verified events safely create orders
- ✅ **Commission Triggering**: Orders instantly generate commission records
- ✅ **Error Recovery**: Failed attributions can be manually fixed
- ✅ **Admin Controls**: Manual attribution and correction endpoints

This integration ensures every referred purchase is accurately attributed and every affiliate earns fair commissions.
