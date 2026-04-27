/**
 * Checkout Controller
 * HTTP request handlers for checkout operations
 */

const checkoutService = require('../services/checkoutService');
const cartService = require('../services/cartService');
const productService = require('../services/productService');
const referralTrackingService = require('../services/referralTrackingService');
const couponService = require('../services/couponService');
const { ValidationError } = require('../utils/errors');

class CheckoutController {
  /**
   * POST /api/checkout/create-session
   *
   * Create a Stripe checkout session from the authenticated user's cart
   *
   * Flow:
   * 1. Extract userId from authenticated request (jwt)
   * 2. Get affiliateId from query param or body (from referral cookie)
   * 3. Validate cart exists and has items
   * 4. Create Stripe checkout session
   * 5. Return session URL for redirect
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {string} req.query.affiliateId - Optional affiliate ID from referral
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   *
   * @example
   * POST /api/checkout/create-session
   * Authorization: Bearer <jwt_token>
   *
   * Response: 201 Created
   * {
   *   success: true,
   *   message: "Checkout session created",
   *   data: {
   *     sessionId: "cs_test_...",
   *     url: "https://checkout.stripe.com/pay/cs_test_..."
   *   }
   * }
   *
   * @example Error Response (400)
   * {
   *   success: false,
   *   statusCode: 400,
   *   message: "Cannot checkout with an empty cart",
   *   errors: { message: "..." }
   * }
   */
  async createCheckoutSession(req, res, next) {
    try {
      // Extract user ID from authenticated request
      const userId = req.user._id;

      if (!userId) {
        return next(new ValidationError('User ID not found in request'));
      }

      // Priority order for affiliate ID:
      // 1. From query parameter
      // 2. From request body
      // 3. From req.affiliate.referralId (set by affiliateAttributionMiddleware from validated cookie)
      let affiliateId = req.query.affiliateId || req.body.affiliateId || req.affiliate?.referralId;

      // Extract visitor ID from referral cookie for conversion tracking
      let visitorId = null;
      if (req.cookies.affiliate_ref) {
        try {
          const cookieData = JSON.parse(req.cookies.affiliate_ref);
          visitorId = cookieData.visitorId;
        } catch (e) {
          // Cookie parsing failed, continue without visitorId
        }
      }

      if (affiliateId) {
        console.log(`✅ [CHECKOUT] Affiliate attribution - Using affiliateId: ${affiliateId}, visitorId: ${visitorId || 'none'}`);
      } else {
        console.log(`ℹ️  [CHECKOUT] No affiliate attribution for this order`);
      }

      // Extract shipping address from request body - REQUIRED
      const shippingAddress = req.body.shippingAddress;
      
      if (!shippingAddress) {
        console.warn('⚠️  [CHECKOUT] No shipping address provided in request body');
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: 'Shipping address is required',
          errors: { shippingAddress: 'Shipping address must be provided' }
        });
      }

      console.log('📦 [CHECKOUT] Shipping address received - will be validated in service');

      // Extract coupon code from request body (optional)
      const couponCode = req.body.couponCode || null;
      let couponData = null;

      if (couponCode) {
        console.log('🏷️  [CHECKOUT] Coupon code received:', couponCode);

        // Re-validate the coupon at checkout time (prevents stale validation)
        // We need the cart subtotal — fetch the cart first
        try {
          const cart = await cartService.getCart(userId);
          const cartSubtotal = cart?.summary?.subtotal || 0;

          if (cartSubtotal > 0) {
            const couponResult = await couponService.validateAndApplyCoupon(
              couponCode,
              cartSubtotal,
              userId
            );

            if (couponResult.valid) {
              couponData = {
                couponId: couponResult.couponId,
                code: couponResult.code,
                discountType: couponResult.discountType,
                discountValue: couponResult.discountValue,
                discountAmount: couponResult.discountAmount,
                salesChannel: couponResult.salesChannel || '',
              };
              console.log('✅ [CHECKOUT] Coupon validated:', couponData);
            } else {
              console.warn('⚠️  [CHECKOUT] Coupon invalid at checkout:', couponResult.reason);
              return res.status(400).json({
                success: false,
                statusCode: 400,
                message: `Coupon error: ${couponResult.reason}`,
                errors: { couponCode: couponResult.reason },
              });
            }
          }
        } catch (couponError) {
          console.error('❌ [CHECKOUT] Coupon validation error:', couponError.message);
          return res.status(400).json({
            success: false,
            statusCode: 400,
            message: `Coupon validation failed: ${couponError.message}`,
            errors: { couponCode: couponError.message },
          });
        }
      }

      // Create checkout session (pass shipping address and coupon data to service)
      const sessionData = await checkoutService.createCheckoutSession(
        userId,
        cartService,
        productService,
        affiliateId,
        visitorId,
        shippingAddress,
        couponData // PASS COUPON DATA
      );

      // Return successful response
      return res.status(201).json({
        success: true,
        message: 'Checkout session created',
        data: {
          sessionId: sessionData.sessionId,
          url: sessionData.url,
        },
      });
    } catch (error) {
      // Handle shipping validation errors with field-level details
      if (error.name === 'ValidationError' && error.errors) {
        return res.status(400).json({
          success: false,
          statusCode: 400,
          message: error.message,
          errors: error.errors
        });
      }
      
      next(error);
    }
  }

  /**
   * POST /api/checkout/webhook
   *
   * Stripe webhook endpoint for handling payment completion
   *
   * Security:
   * - Stripe signature must be verified (stripeWebhook module)
   * - This endpoint is public but signature-protected
   * - Must be registered in Stripe dashboard
   *
   * Flow:
   * 1. Get raw request body and stripe-signature header
   * 2. Verify webhook signature (in middleware)
   * 3. Parse webhook event
   * 4. Check event type (checkout.session.completed)
   * 5. Handle payment success (create order, clear cart, trigger commission)
   * 6. Return 200 OK to Stripe
   *
   * @param {Object} req - Express request
   * @param {Buffer} req.body - Raw request body (must be Buffer, not parsed JSON)
   * @param {Object} req.event - Verified Stripe event (from webhook middleware)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   *
   * @note This endpoint does NOT require authentication (verified via signature)
   * @note The webhook URL must be registered in Stripe dashboard
   * @note Stripe will retry on non-200 responses
   *
   * @example Webhook URL in Stripe Dashboard
   * POST https://your-domain.com/api/checkout/webhook
   * Events to listen for: checkout.session.completed
   *
   * @example Success Response (200)
   * {
   *   received: true,
   *   orderId: "507f1f77bcf86cd799439011"
   * }
   *
   * @example Error Response - Stripe will retry
   * Status: 500 (any non-200)
   */
  async handleStripeWebhook(req, res, next) {
    try {
      // Get verified event from middleware
      const event = req.event;

      console.log('📨 [WEBHOOK] Event received:', {
        type: event?.type,
        eventId: event?.id,
        timestamp: new Date().toISOString()
      });

      if (!event) {
        console.error('❌ [WEBHOOK] No verified event in request');
        return next(new ValidationError('No verified Stripe event in request'));
      }

      // Only process checkout.session.completed events
      if (event.type === 'checkout.session.completed') {
        console.log('✅ [WEBHOOK] Processing checkout.session.completed event');
        
        const sessionData = event.data?.object;
        console.log('📋 [WEBHOOK] Session data:', {
          sessionId: sessionData?.id,
          userId: sessionData?.metadata?.userId,
          cartId: sessionData?.metadata?.cartId,
          paymentStatus: sessionData?.payment_status
        });

        // Skip if this is a sponsorship webhook (has sponsorshipRecordId in metadata)
        if (sessionData?.metadata?.sponsorshipRecordId) {
          console.log('⏭️  [WEBHOOK] Skipping sponsorship webhook - routing to sponsorship handler');
          return res.status(200).json({ received: true, reason: 'sponsorship_webhook' });
        }

        // Call checkout service to handle payment
        try {
          const order = await checkoutService.handlePaymentSuccess(
            event,
            cartService,
            productService
          );

          console.log('✅ [WEBHOOK] Order created successfully:', {
            orderId: order._id,
            orderNumber: order.orderNumber,
            userId: order.userId,
            total: order.total
          });

          return res.status(200).json({
            received: true,
            orderId: order._id,
            orderNumber: order.orderNumber,
          });
        } catch (serviceError) {
          console.error('❌ [WEBHOOK] Error in handlePaymentSuccess:', {
            name: serviceError.name,
            message: serviceError.message,
            stack: serviceError.stack
          });
          throw serviceError;
        }
      }

      // Acknowledge other event types without processing
      console.log(`⏭️  [WEBHOOK] Skipping event type: ${event.type}`);
      return res.status(200).json({
        received: true,
        note: `Event type '${event.type}' not processed`,
      });
    } catch (error) {
      // Log error and return 500 to Stripe so it retries
      console.error('❌ [WEBHOOK] Unhandled webhook error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      // MUST return response to prevent 502 errors
      return res.status(500).json({
        received: false,
        error: 'Webhook processing failed - Stripe will retry',
        message: error.message
      });
    }
  }

  /**
   * GET /api/checkout/session/:sessionId
   *
   * Retrieve details of a checkout session (for debugging/verification)
   *
   * @param {Object} req - Express request
   * @param {string} req.params.sessionId - Stripe session ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getCheckoutSession(req, res, next) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return next(
          new ValidationError('Session ID is required')
        );
      }

      const session = await checkoutService.getCheckoutSession(sessionId);

      return res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/checkout/order/:sessionId
   *
   * Retrieve order details by Stripe session ID
   * Used by success page to display order confirmation
   *
   * @param {Object} req - Express request
   * @param {string} req.params.sessionId - Stripe session ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getOrderBySessionId(req, res, next) {
    try {
      const { sessionId } = req.params;

      if (!sessionId) {
        return next(new ValidationError('Session ID is required'));
      }

      console.log('📦 [CHECKOUT] Fetching order for session:', sessionId);
      const order = await checkoutService.getOrderBySessionId(sessionId);

      if (!order) {
        console.warn('⚠️  [CHECKOUT] No order found for session:', sessionId);
        return res.status(404).json({
          success: false,
          error: 'Order not found for this session',
        });
      }

      console.log('✅ [CHECKOUT] Order found:', { orderId: order._id, orderNumber: order.orderNumber });

      return res.status(200).json({
        success: true,
        data: {
          _id: order._id,
          orderNumber: order.orderNumber,
          userId: order.userId,
          items: order.items,
          subtotal: order.subtotal,
          tax: order.tax,
          total: order.total,
          paymentStatus: order.paymentStatus,
          orderStatus: order.orderStatus,
          paymentDetails: {
            stripeSessionId: order.paymentDetails?.stripeSessionId,
            chargeId: order.paymentDetails?.chargeId,
            paidAt: order.paymentDetails?.paidAt,
          },
          createdAt: order.createdAt,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/checkout/refund
   *
   * Request refund for an order
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {string} req.body.paymentIntentId - Stripe payment intent ID
   * @param {number} req.body.amount - Amount to refund (optional, full if omitted)
   * @param {string} req.body.reason - Refund reason
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async requestRefund(req, res, next) {
    try {
      const userId = req.user._id;
      const { paymentIntentId, amount, reason = 'requested_by_customer' } = req.body;

      if (!paymentIntentId) {
        return next(
          new ValidationError('Payment intent ID is required')
        );
      }

      // Process refund
      const refund = await checkoutService.refundPayment(
        paymentIntentId,
        amount,
        reason
      );

      return res.status(200).json({
        success: true,
        message: 'Refund processed',
        data: {
          refundId: refund.id,
          amount: refund.amount,
          status: refund.status,
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new CheckoutController();
