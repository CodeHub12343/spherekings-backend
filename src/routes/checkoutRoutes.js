/**
 * Checkout Routes
 * API endpoints for checkout and payment operations
 */

const express = require('express');
const router = express.Router();
const checkoutController = require('../controllers/checkoutController');
const { authenticate } = require('../middlewares/authMiddleware');
const { verifyWebhookSignature } = require('../webhooks/stripeWebhook');

/**
 * POST /api/checkout/create-session
 *
 * Create a Stripe checkout session from authenticated user's cart
 *
 * Security: Requires JWT authentication
 *
 * Request:
 *   Authorization: Bearer <jwt_token>
 *   Query: ?affiliateId=xxx (optional)
 *
 * Response (201):
 *   {
 *     "success": true,
 *     "message": "Checkout session created",
 *     "data": {
 *       "sessionId": "cs_test_...",
 *       "url": "https://checkout.stripe.com/pay/cs_test_..."
 *     }
 *   }
 *
 * Error (400, 401, 500):
 *   {
 *     "success": false,
 *     "statusCode": 400,
 *     "message": "Error description",
 *     "errors": { ... }
 *   }
 */
router.post(
  '/create-session',
  authenticate, // Requires valid JWT token
  checkoutController.createCheckoutSession
);

/**
 * POST /api/checkout/webhook
 *
 * Stripe webhook endpoint for payment confirmation
 *
 * Security: Verified via Stripe signature (NOT authenticated with JWT)
 * This endpoint is public but protected by webhook signature verification
 *
 * Headers:
 *   stripe-signature: <signature> (from Stripe)
 *   content-type: application/json
 *
 * Body: Raw Stripe webhook event (must NOT be parsed by standard middleware)
 *
 * Response (200):
 *   {
 *     "received": true,
 *     "orderId": "507f1f77bcf86cd799439011",
 *     "orderNumber": "ORD-20240101-123456"
 *   }
 *
 * Important: This endpoint MUST:
 * 1. Receive raw request body (not parsed JSON)
 * 2. Verify Stripe signature before processing
 * 3. Return 200 OK for successful processing or errors
 * 4. Stripe will retry on non-200 responses
 *
 * Stripe Dashboard Setup:
 * - Register webhook endpoint URL
 * - Select events: checkout.session.completed
 * - Copy webhook signing secret to .env (STRIPE_WEBHOOK_SECRET)
 *
 * @note The webhook middleware must be added BEFORE body parsing
 * @see src/server.js - Special webhook setup required
 */
router.post(
  '/webhook',
  // Log that webhook route was matched
  (req, res, next) => {
    console.log('📍 [ROUTE] Webhook route handler called');
    console.log('🔍 [ROUTE] req.event exists:', !!req.event);
    if (req.event) {
      console.log('📋 [ROUTE] Event type:', req.event.type);
    }
    next();
  },
  // IMPORTANT: Webhook route MUST receive raw body for signature verification
  // This middleware is configured in server.js BEFORE standard JSON parsing
  //
  // Standard flow:
  // 1. Express receives raw body
  // 2. Webhook middleware creates req.event via signature verification
  // 3. Controller uses req.event
  //
  // See authentication pattern in comment above for details

  // Handler for webhook (signature verified by middleware in server.js)
  checkoutController.handleStripeWebhook
);

/**
 * GET /api/checkout/session/:sessionId
 *
 * Retrieve checkout session details
 *
 * Security: Requires JWT authentication
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "id": "cs_test_...",
 *       "payment_status": "paid",
 *       "metadata": { ... },
 *       ...
 *     }
 *   }
 */
router.get(
  '/session/:sessionId',
  authenticate,
  checkoutController.getCheckoutSession
);

/**
 * GET /api/checkout/order/:sessionId
 *
 * Retrieve order details by Stripe session ID
 * Used by success page to display order confirmation
 *
 * Security: Public endpoint (no auth required)
 * Rate limit: Standard checkout limiter applies
 *
 * Request Params:
 *   sessionId: Stripe checkout session ID from URL query
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "_id": "...",
 *       "orderNumber": "ORD-20260317-656919",
 *       "items": [...],
 *       "subtotal": 159.98,
 *       "tax": 12.8,
 *       "total": 172.78,
 *       "paymentStatus": "paid",
 *       "orderStatus": "processing",
 *       "createdAt": "2026-03-17T14:36:15.370Z"
 *     }
 *   }
 *
 * Response (404):
 *   {
 *     "success": false,
 *     "error": "Order not found for this session"
 *   }
 */
router.get('/order/:sessionId', checkoutController.getOrderBySessionId);

/**
 * POST /api/checkout/refund
 *
 * Request refund for an order
 *
 * Security: Requires JWT authentication
 *
 * Request Body:
 *   {
 *     "paymentIntentId": "pi_...",
 *     "amount": 5000 (optional, in cents),
 *     "reason": "requested_by_customer"
 *   }
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Refund processed",
 *     "data": {
 *       "refundId": "re_...",
 *       "amount": 5000,
 *       "status": "succeeded"
 *     }
 *   }
 */
router.post(
  '/refund',
  authenticate,
  checkoutController.requestRefund
);

// ==================== Webhook Signature Verification Middleware ====================

/**
 * Custom middleware to verify Stripe webhook signature
 *
 * This middleware:
 * 1. Gets raw request body
 * 2. Extracts stripe-signature header
 * 3. Verifies signature using Stripe library
 * 4. Parses and attaches verified event to req.event
 * 5. Handling errors gracefully
 *
 * Usage in server.js:
 *   const { verifyWebhookSignature } = require('./webhooks/stripeWebhook');
 *
 *   // BEFORE standard JSON parsing middleware
 *   app.post('/api/checkout/webhook',
 *     (req, res, next) => {
 *       let body = '';
 *       req.on('data', chunk => { body += chunk.toString(); });
 *       req.on('end', () => {
 *         const signature = req.headers['stripe-signature'];
 *         try {
 *           req.event = verifyWebhookSignature(body, signature);
 *           req.body = JSON.parse(body);
 *           next();
 *         } catch (error) {
 *           res.status(400).json({ error: error.message });
 *         }
 *       });
 *     },
 *     checkoutApp.post('/webhook', ...)
 *   );
 *
 * See Alternative Implementation Below:
 */

/**
 * Alternative: Express Raw Body Middleware
 *
 * If using express.raw() instead of express.json() for webhook route:
 *
 * app.post('/api/checkout/webhook',
 *   express.raw({ type: 'application/json' }),  // Raw body Buffer
 *   (req, res, next) => {
 *     const signature = req.headers['stripe-signature'];
 *     try {
 *       req.event = verifyWebhookSignature(req.body, signature);
 *       next();
 *     } catch (error) {
 *       res.status(400).json({ error: error.message });
 *     }
 *   },
 *   checkoutController.handleStripeWebhook
 * );
 */

module.exports = router;
