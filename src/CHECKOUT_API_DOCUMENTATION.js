/**
 * Checkout & Payment Processing API Documentation
 * Complete reference for checkout operations and Stripe payment integration
 *
 * API Base URL: /api/checkout
 * All endpoints require HTTPS in production for security
 */

/**
 * ==========================================
 * 1. CREATE CHECKOUT SESSION
 * ==========================================
 *
 * POST /api/checkout/create-session
 *
 * Creates a Stripe checkout session from the authenticated user's cart.
 * The user is redirected to Stripe's hosted payment page to complete the purchase.
 *
 * This endpoint:
 * - Validates the user's cart
 * - Fetches fresh product prices (prevents client-side manipulation)
 * - Creates a Stripe payment session
 * - Returns a checkout URL for redirect
 *
 * ==========================================
 * REQUEST
 * ==========================================
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 *   Content-Type: application/json
 *
 * Query Parameters (optional):
 *   ?affiliateId=507f1f77bcf86cd799439011  - ID of referring affiliate
 *
 * Body:
 *   {} (empty - uses authenticated user's cart)
 *
 * ==========================================
 * RESPONSE (201 Created)
 * ==========================================
 *
 * {
 *   "success": true,
 *   "message": "Checkout session created",
 *   "data": {
 *     "sessionId": "cs_test_a1b2c3d4e5f6g7h8i9j0",
 *     "url": "https://checkout.stripe.com/pay/cs_test_a1b2c3d4e5f6g7h8i9j0?client_reference_id=123"
 *   }
 * }
 *
 * ==========================================
 * EXAMPLE REQUEST (cURL)
 * ==========================================
 *
 * curl -X POST https://api.spherekings.com/api/checkout/create-session \
 *   -H "Authorization: Bearer eyJhbGc..." \
 *   -H "Content-Type: application/json" \
 *   -d '{}'
 *
 * ==========================================
 * EXAMPLE REQUEST (JavaScript)
 * ==========================================
 *
 * const response = await fetch('/api/checkout/create-session', {
 *   method: 'POST',
 *   headers: {
 *     'Authorization': `Bearer ${token}`,
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({})
 * });
 *
 * const data = await response.json();
 *
 * if (data.success) {
 *   // Redirect user to Stripe checkout
 *   window.location.href = data.data.url;
 * }
 *
 * ==========================================
 * EXAMPLE REQUEST (With Affiliate)
 * ==========================================
 *
 * // Include affiliate ID from referral link/cookie
 * const response = await fetch('/api/checkout/create-session?affiliateId=aff123', {
 *   method: 'POST',
 *   headers: { 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({})
 * });
 *
 * ==========================================
 * ERROR RESPONSES
 * ==========================================
 *
 * 400 Bad Request - Empty Cart
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Cannot checkout with an empty cart",
 *   "errors": {
 *     "message": "Cannot checkout with an empty cart"
 *   }
 * }
 *
 * 400 Bad Request - Out of Stock
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Cart validation failed: Deluxe Edition is out of stock",
 *   "errors": {
 *     "message": "Cart validation failed: Deluxe Edition is out of stock"
 *   }
 * }
 *
 * 400 Bad Request - Product Not Found
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Cart validation failed: Product not found",
 *   "errors": {
 *     "message": "Cart validation failed: Product not found"
 *   }
 * }
 *
 * 401 Unauthorized - Missing Token
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "No auth token. Access denied.",
 *   "errors": {}
 * }
 *
 * 401 Unauthorized - Invalid Token
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Invalid token",
 *   "errors": {}
 * }
 *
 * 500 Server Error - Stripe API Issue
 * {
 *   "success": false,
 *   "statusCode": 500,
 *   "message": "Stripe API error: Connection timeout",
 *   "errors": {
 *     "message": "Stripe API error: Connection timeout"
 *   }
 * }
 *
 * ==========================================
 * SECURITY NOTES
 * ==========================================
 *
 * - Requires JWT authentication (token must be valid)
 * - Cart is validated on server side (prevents tampering)
 * - Product prices fetched from database (not client-provided)
 * - Uses HTTPS in production (required for payment security)
 * - Session ID is short-lived (expires in 24 hours by default)
 * - Uses secure cookies for session management
 *
 * ==========================================
 * CHECKOUT FLOW
 * ==========================================
 *
 * 1. User clicks "Checkout" button on cart page
 *    ↓
 * 2. Frontend calls POST /api/checkout/create-session
 *    ↓
 * 3. Backend:
 *    - Authenticates user
 *    - Fetches user's cart
 *    - Validates cart items (stock, prices, product existence)
 *    - Creates Stripe checkout session
 *    - Returns session URL
 *    ↓
 * 4. Frontend redirects user to Stripe checkout URL
 *    ↓
 * 5. User completes payment on Stripe-hosted page
 *    ↓
 * 6. Stripe sends webhook event to backend (checkout.session.completed)
 *    ↓
 * 7. Backend creates Order in database
 *    ↓
 * 8. Backend sends success URL or awaits webhook completion
 *
 */

/**
 * ==========================================
 * 2. STRIPE WEBHOOK ENDPOINT
 * ==========================================
 *
 * POST /api/checkout/webhook
 *
 * Stripe webhook endpoint for payment event confirmation.
 * This endpoint receives payment completion events from Stripe.
 *
 * CRITICAL SECURITY: This endpoint:
 * - Verifies Stripe webhook signature (prevents unauthorized requests)
 * - Does NOT require JWT authentication (verified via signature)
 * - Must be registered in Stripe Dashboard
 * - Must return 200 OK for Stripe to consider event processed
 * - Will be retried by Stripe if non-200 response received
 *
 * ==========================================
 * WEBHOOK REGISTRATION
 * ==========================================
 *
 * In Stripe Dashboard:
 * 1. Go to Developers → Webhooks
 * 2. Click "Add endpoint"
 * 3. Enter endpoint URL: https://your-domain.com/api/checkout/webhook
 * 4. Select events: checkout.session.completed
 * 5. Copy signing secret to .env file: STRIPE_WEBHOOK_SECRET=whsec_...
 *
 * ==========================================
 * REQUEST (from Stripe)
 * ==========================================
 *
 * Headers:
 *   stripe-signature: t=1614556800,v1=abc123...
 *   content-type: application/json
 *
 * Body (raw JSON):
 * {
 *   "id": "evt_1234567890",
 *   "object": "event",
 *   "type": "checkout.session.completed",
 *   "data": {
 *     "object": {
 *       "id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
 *       "object": "checkout.session",
 *       "payment_status": "paid",
 *       "payment_intent": "pi_1234567890",
 *       "metadata": {
 *         "userId": "507f1f77bcf86cd799439011",
 *         "cartId": "607f1f77bcf86cd799439012",
 *         "affiliateId": "707f1f77bcf86cd799439013"
 *       }
 *     }
 *   }
 * }
 *
 * ==========================================
 * RESPONSE (200 OK)
 * ==========================================
 *
 * {
 *   "received": true,
 *   "orderId": "507f1f77bcf86cd799439014",
 *   "orderNumber": "ORD-20240115-123456"
 * }
 *
 * ==========================================
 * ERROR RESPONSES
 * ==========================================
 *
 * 400 Bad Request - Missing Signature
 * {
 *   "success": false,
 *   "error": "Stripe signature header missing"
 * }
 *
 * 401 Unauthorized - Invalid Signature
 * {
 *   "success": false,
 *   "error": "Webhook signature verification failed"
 * }
 *
 * 500 Server Error - Order Creation Failed
 * Status 500 returned to Stripe (will retry)
 *
 * ==========================================
 * WEBHOOK EVENTS PROCESSED
 * ==========================================
 *
 * checkout.session.completed (Primary)
 *   - Payment completed
 *   - Creates Order in database
 *   - Clears user's cart
 *   - Triggers affiliate commission
 *
 * charge.refunded (Supported)
 *   - Refund processed
 *   - Updates Order status to 'refunded'
 *
 * charge.dispute.created (Supported)
 *   - Chargeback/dispute filed
 *   - Marks Order as 'disputed'
 *
 * ==========================================
 * WEBHOOK RELIABILITY
 * ==========================================
 *
 * Retries:
 *   - Stripe retries on non-200 responses for up to 3 days
 *   - Exponential backoff with initial 5-second delay
 *
 * Idempotency:
 *   - Same event may be delivered multiple times
 *   - Backend checks if Order already exists (prevents duplicates)
 *   - Order lookup uses unique stripeSessionId
 *
 * Testing:
 *   - Use 'test' CLI or Webhook Testing tab in Stripe Dashboard
 *   - Send test events to verify endpoint is working
 *   - Check webhook delivery logs in Stripe Dashboard
 *
 * ==========================================
 * WEBHOOK TESTING
 * ==========================================
 *
 * Using Stripe CLI:
 *
 * 1. Install Stripe CLI: https://stripe.com/docs/stripe-cli
 *
 * 2. Forward events to localhost:
 *    $ stripe listen --forward-to localhost:3000/api/checkout/webhook
 *
 * 3. Trigger test event:
 *    $ stripe trigger checkout.session.completed
 *
 * 4. Check console for webhook received message
 *
 */

/**
 * ==========================================
 * 3. GET CHECKOUT SESSION
 * ==========================================
 *
 * GET /api/checkout/session/:sessionId
 *
 * Retrieve details of a specific checkout session.
 * Used for debugging and front-end verification.
 *
 * ==========================================
 * REQUEST
 * ==========================================
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 *   Content-Type: application/json
 *
 * URL Parameters:
 *   sessionId - Stripe checkout session ID
 *
 * ==========================================
 * RESPONSE (200 OK)
 * ==========================================
 *
 * {
 *   "success": true,
 *   "data": {
 *     "id": "cs_test_a1b2c3d4e5f6g7h8i9j0",
 *     "object": "checkout.session",
 *     "payment_status": "paid",
 *     "payment_intent": "pi_1234567890",
 *     "customer_email": "customer@example.com",
 *     "line_items": {
 *       "object": "list",
 *       "data": [
 *         {
 *           "id": "li_1234567890",
 *           "amount_subtotal": 4900,
 *           "amount_total": 4900,
 *           "currency": "usd",
 *           "description": "Deluxe Edition",
 *           "quantity": 1,
 *           "type": "sku"
 *         }
 *       ]
 *     },
 *     "metadata": {
 *       "userId": "507f1f77bcf86cd799439011",
 *       "cartId": "607f1f77bcf86cd799439012"
 *     },
 *     "created": 1614556800,
 *     "expires_at": 1614643200
 *   }
 * }
 *
 * ==========================================
 * EXAMPLE REQUEST
 * ==========================================
 *
 * curl -X GET https://api.spherekings.com/api/checkout/session/cs_test_123abc \
 *   -H "Authorization: Bearer eyJhbGc..."
 *
 */

/**
 * ==========================================
 * 4. REQUEST REFUND
 * ==========================================
 *
 * POST /api/checkout/refund
 *
 * Request refund for a completed order.
 * Creates a refund in Stripe and updates Order status.
 *
 * ==========================================
 * REQUEST
 * ==========================================
 *
 * Headers:
 *   Authorization: Bearer <jwt_token>
 *   Content-Type: application/json
 *
 * Body:
 * {
 *   "paymentIntentId": "pi_1234567890",
 *   "amount": 5000,
 *   "reason": "requested_by_customer"
 * }
 *
 * Parameters:
 *   paymentIntentId (required) - Stripe payment intent ID from order
 *   amount (optional) - Amount to refund in cents (omit for full refund)
 *   reason (optional) - Refund reason:
 *     - "duplicate"
 *     - "fraudulent"
 *     - "requested_by_customer"
 *     - "product_unsatisfactory"
 *
 * ==========================================
 * RESPONSE (200 OK)
 * ==========================================
 *
 * {
 *   "success": true,
 *   "message": "Refund processed",
 *   "data": {
 *     "refundId": "re_1234567890",
 *     "amount": 5000,
 *     "status": "succeeded",
 *     "created": 1614556900
 *   }
 * }
 *
 * ==========================================
 * ERROR RESPONSES
 * ==========================================
 *
 * 400 Bad Request - Missing Payment Intent
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Payment intent ID is required",
 *   "errors": { ... }
 * }
 *
 * 400 Bad Request - Already Refunded
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Stripe error: Charge already refunded",
 *   "errors": { ... }
 * }
 *
 * 401 Unauthorized - Invalid Token
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "No auth token. Access denied.",
 *   "errors": {}
 * }
 *
 */

/**
 * ==========================================
 * PAYMENT FLOW DIAGRAMS
 * ==========================================
 *
 * =============================================================================
 * SUCCESSFUL PAYMENT FLOW
 * =============================================================================
 *
 *   Customer               Frontend              Backend              Stripe
 *      │                      │                     │                   │
 *      │ 1. Click Checkout    │                     │                   │
 *      ├─────────────────────→│                     │                   │
 *      │                      │ POST /checkout/     │                   │
 *      │                      │ create-session      │                   │
 *      │                      ├────────────────────→│ Create Session    │
 *      │                      │                     ├──────────────────→│
 *      │                      │                     │  sessionId        │
 *      │                      │  sessionId, url     │←──────────────────┤
 *      │                      │←────────────────────┤                   │
 *      │                      │                     │                   │
 *      │ 2. Redirect to       │                     │                   │
 *      │ Stripe Checkout  ────→ https://checkout   │                   │
 *      │                      │ .stripe.com?…       │                   │
 *      │                      │                     │                   │
 *      │ 3. Enter payment    │                     │                   │
 *      │ details, pay    ────→ Process Payment  ───────────────────────→│
 *      │                      │                     │                   │
 *      │ 4. Payment Success   │                     │  webhook event    │
 *      │ notification    ←────→ checkout.session.  ←──────────────────┤
 *      │                      │ completed           │                   │
 *      │                      │                     │ Create Order      │
 *      │                      │  Success Page  ←────┤ Clear Cart        │
 *      │ 5. See order       ←─┤ Order #details     │ Trigger Affiliate │
 *      │ confirmation        │                     │
 *
 * =============================================================================
 * PAYMENT FAILURE FLOW
 * =============================================================================
 *
 *   Customer               Frontend              Backend              Stripe
 *      │                      │                     │                   │
 *      │ 1. Click Checkout    │                     │                   │
 *      ├─────────────────────→│                     │                   │
 *      │                      │ POST /checkout/     │                   │
 *      │                      │ create-session      │                   │
 *      │                      ├────────────────────→│ Create Session    │
 *      │                      │                     ├──────────────────→│
 *      │                      │   sessionId, url    │  sessionId        │
 *      │                      │←────────────────────┤←──────────────────┤
 *      │ 2. Redirect to       │                     │                   │
 *      │ Stripe Checkout      │ https://checkout    │                   │
 *      │                      │ .stripe.com?…       │                   │
 *      │                      │                     │                   │
 *      │ 3. Enter payment    │                     │                   │
 *      │ details, pay    ────→ Card Declined   ───────────────────────→│
 *      │                      │                     │                   │
 *      │ 4. Payment Failed    │                     │                   │
 *      │ notification    ←────┤ Error Message       │                   │
 *      │                      │                     │                   │
 *      │ 5. Return to cart ←──┤ Cancel URL          │                   │
 *      │ and retry            │                     │                   │
 *
 * =============================================================================
 * WEBHOOK RETRY LOGIC
 * =============================================================================
 *
 *   Stripe                          Backend
 *      │                               │
 *      │ POST /webhook (Event)    ────→│
 *      │                               │ Process Order
 *      │                               │ (Error Occurs)
 *      │                               │ Return 500
 *      │←──────────────────────────────┤
 *      │                               │
 *      │ Wait 5 seconds...             │
 *      │                               │
 *      │ POST /webhook (Retry 1)  ────→│
 *      │                               │ Check idempotency
 *      │                               │ (Order exists - skip)
 *      │                               │ Return 200
 *      │←──────────────────────────────┤
 *      │                               │
 *      │ ✓ Success - Stop retrying     │
 *
 * =============================================================================
 */

/**
 * ==========================================
 * STATUS CODES REFERENCE
 * ==========================================
 *
 * 200 OK
 *   Successfully processed request
 *   Used for: GET session, refund success
 *
 * 201 Created
 *   Resource created successfully
 *   Used for: Checkout session creation
 *
 * 400 Bad Request
 *   Invalid request (validation error)
 *   Reasons: Empty cart, invalid product, out of stock
 *
 * 401 Unauthorized
 *   Missing or invalid authentication
 *   Reasons: No token, expired token, invalid token
 *
 * 403 Forbidden
 *   Valid authentication but insufficient permissions
 *   Reasons: Accessing another user's data
 *
 * 404 Not Found
 *   Resource not found
 *   Reasons: Invalid session ID, product not found
 *
 * 500 Internal Server Error
 *   Server error
 *   Reasons: Stripe API error, database error
 *           Webhook handler will retry these
 *
 */

/**
 * ==========================================
 * ENVIRONMENT VARIABLES
 * ==========================================
 *
 * Required Variables:
 *
 * STRIPE_PUBLIC_KEY=pk_test_... or pk_live_...
 *   Public key for Stripe.js on frontend
 *
 * STRIPE_SECRET_KEY=sk_test_... or sk_live_...
 *   Secret key for backend API calls
 *   KEEP THIS SECRET - Never expose in frontend
 *
 * STRIPE_WEBHOOK_SECRET=whsec_...
 *   Webhook signing secret for signature verification
 *   Required for secure webhook processing
 *
 * Optional Variables:
 *
 * FRONTEND_URL=http://localhost:3000 or https://spherekings.com
 *   Frontend base URL for checkout redirects
 *
 * CHECKOUT_SUCCESS_URL=/checkout/success
 *   Relative URL after successful payment
 *
 * CHECKOUT_CANCEL_URL=/checkout/cancel
 *   Relative URL if customer cancels payment
 *
 * TAX_RATE=0.08
 *   Tax rate for automatic tax calculation (0.08 = 8%)
 *
 * CURRENCY=usd
 *   Default currency for payments (usd, eur, gbp, etc.)
 *
 * COMMISSION_RATE=0.1
 *   Default affiliate commission rate (0.1 = 10%)
 *
 * STRIPE_TAX_ENABLED=false
 *   Enable Stripe automatic tax calculation
 *
 */

/**
 * ==========================================
 * COMMON ERRORS & SOLUTIONS
 * ==========================================
 *
 * Error: "Cannot checkout with an empty cart"
 *   Cause: Cart has no items
 *   Solution: Add items to cart before checkout
 *
 * Error: "Insufficient stock: Only 2 remaining"
 *   Cause: Requested quantity exceeds available stock
 *   Solution: Reduce quantity or wait for restock
 *
 * Error: "Product is not available"
 *   Cause: Product is inactive or out of stock
 *   Solution: Choose different product
 *
 * Error: "Webhook signature verification failed"
 *   Cause: Invalid STRIPE_WEBHOOK_SECRET or tampered request
 *   Solution: Check webhook secret in Stripe Dashboard
 *
 * Error: "No userId found in Stripe session metadata"
 *   Cause: Checkout session missing user information
 *   Solution: Ensure user is authenticated before checkout
 *
 * Error: "Charge already refunded"
 *   Cause: Attempting to refund already refunded charge
 *   Solution: Check Order.paymentStatus before refunding
 *
 * Error: "Stripe API error: No such payment_intent"
 *   Cause: Invalid payment intent ID
 *   Solution: Verify payment intent ID from Order.paymentDetails
 *
 */

/**
 * ==========================================
 * TESTING CHECKLIST
 * ==========================================
 *
 * Checkout Session Creation:
 *   ✓ Valid user with items in cart
 *   ✓ Empty cart (should fail)
 *   ✓ Out of stock items (should fail)
 *   ✓ Invalid product (should fail)
 *   ✓ Unauthenticated user (should fail 401)
 *
 * Payment Processing:
 *   ✓ Successful payment creates order
 *   ✓ Order has correct items and totals
 *   ✓ Cart is cleared after payment
 *   ✓ Affiliate commission created if applicable
 *
 * Webhook Handling:
 *   ✓ Valid webhook signature accepted
 *   ✓ Invalid webhook signature rejected (401)
 *   ✓ Duplicate webhook doesn't create duplicate order
 *   ✓ Order status updated correctly
 *
 * Error Handling:
 *   ✓ Handles Stripe API timeouts
 *   ✓ Handles network failures
 *   ✓ Handles missing product in cart
 *   ✓ Prevents race conditions
 *
 * Refunds:
 *   ✓ Full refund succeeds
 *   ✓ Partial refund succeeds
 *   ✓ Cannot refund already refunded charge
 *   ✓ Order status updated to refunded
 *
 */

module.exports = {
  apiBasePath: '/api/checkout',
  version: '1.0.0',
  documentation: 'See comments in this file for complete API reference',
  endpoints: {
    createSession: 'POST /create-session',
    webhook: 'POST /webhook',
    getSession: 'GET /session/:sessionId',
    requestRefund: 'POST /refund',
  },
};
