# Checkout & Payment Processing System - Implementation Guide

Complete production-ready implementation of a secure Checkout and Payment Processing system using Stripe. This system creates checkout sessions, processes payments, verifies webhooks, creates orders, and integrates with the affiliate commission system.

## Overview

The Checkout & Payment Processing system is a three-phase workflow:

1. **Session Creation**: Create Stripe checkout session from user's cart
2. **Payment Processing**: User completes payment on Stripe's hosted page
3. **Webhook Verification**: Stripe notifies backend of payment completion
4. **Order Creation**: Backend creates Order, clears cart, and triggers affiliate commission

## Files Created

### Core Implementation Files

1. **src/config/stripe.js** - Stripe SDK initialization
   - Initializes Stripe JavaScript SDK
   - Configures API version and retry settings
   - Exports stripe instance for use in services
   - Loads webhook secret from environment

2. **src/models/Order.js** - Mongoose schema for orders
   - OrderSchema with all order details
   - OrderItemSchema for cart items in order
   - PaymentDetailsSchema for Stripe transaction info
   - AffiliateDetailsSchema for commission tracking
   - Methods: generateOrderNumber(), calculateTotals(), markAsPaid(), recordAffiliateCommission()
   - Statics: createFromCheckout(), findByStripeSessionId(), findUserOrders()
   - Indexes on userId, paymentStatus, orderStatus, stripeSessionId for fast queries

3. **src/services/checkoutService.js** - Business logic layer
   - createCheckoutSession(userId, cartService, productService, affiliateId) - Creates Stripe session
   - handlePaymentSuccess(event, cartService, productService) - Processes successful payment
   - getCheckoutSession(sessionId) - Retrieves session details
   - expireCheckoutSession(sessionId) - Expires/cancels session
   - refundPayment(paymentIntentId, amount, reason) - Processes refunds
   - Comprehensive error handling and validation

4. **src/webhooks/stripeWebhook.js** - Webhook handler
   - verifyWebhookSignature(body, signature) - Verifies Stripe webhook signature
   - handleStripeEvent(event, handlers) - Routes events to handlers
   - handleCheckoutSessionCompleted(event, checkoutService) - Handles payment completion
   - handleChargeRefunded(event, orderModel) - Handles refund events
   - handleChargeDispute(event, orderModel) - Handles chargebacks
   - Supports extensible event handler architecture

5. **src/controllers/checkoutController.js** - HTTP request handlers
   - createCheckoutSession() - POST /create-session
   - handleStripeWebhook() - POST /webhook (signature verified)
   - getCheckoutSession() - GET /session/:sessionId
   - requestRefund() - POST /refund
   - All handlers include comprehensive error handling

6. **src/routes/checkoutRoutes.js** - API endpoint definitions
   - 4 HTTP endpoints for checkout operations
   - Authentication middleware on all routes except webhook (verified via signature)
   - Comprehensive JSDoc documentation
   - Webhook signature verification in server.js middleware

7. **Updated src/server.js**
   - Added `const checkoutRoutes = require('./routes/checkoutRoutes');`
   - Added `const { verifyWebhookSignature } = require('./webhooks/stripeWebhook');`
   - Added webhook raw body middleware BEFORE standard JSON parsing
   - Registered checkout routes with /api/checkout prefix

### Documentation Files

- **src/CHECKOUT_API_DOCUMENTATION.js** - Complete API reference with examples
- **CHECKOUT_SYSTEM_README.md** - This implementation guide

## API Endpoints

### POST /api/checkout/create-session
**Protected**: Requires JWT authentication

Create a Stripe checkout session from the authenticated user's cart.

**Request**:
```javascript
{
  // No body required - uses authenticated user's cart
}
```

**Query Parameters**:
- `affiliateId` (optional) - ID of referring affiliate

**Response (201)**:
```javascript
{
  "success": true,
  "message": "Checkout session created",
  "data": {
    "sessionId": "cs_test_...",
    "url": "https://checkout.stripe.com/pay/cs_test_..."
  }
}
```

### POST /api/checkout/webhook
**Protected**: Verified via Stripe webhook signature (public but signature-protected)

Stripe webhook endpoint for payment confirmation events.

**Headers**:
- `stripe-signature: <signature>` (from Stripe)

**Body**: Raw Stripe webhook event

**Response (200)**:
```javascript
{
  "received": true,
  "orderId": "507f1f77bcf86cd799439011",
  "orderNumber": "ORD-20240101-123456"
}
```

**Events Processed**:
- `checkout.session.completed` - Creates Order
- `charge.refunded` - Updates Order to refunded
- `charge.dispute.created` - Marks Order as disputed

### GET /api/checkout/session/:sessionId
**Protected**: Requires JWT authentication

Retrieve details of a checkout session (for debugging).

**Response (200)**:
```javascript
{
  "success": true,
  "data": { /* Stripe session object */ }
}
```

### POST /api/checkout/refund
**Protected**: Requires JWT authentication

Request refund for a completed order.

**Request**:
```javascript
{
  "paymentIntentId": "pi_...",
  "amount": 5000,        // optional (cents)
  "reason": "requested_by_customer"
}
```

**Response (200)**:
```javascript
{
  "success": true,
  "message": "Refund processed",
  "data": {
    "refundId": "re_...",
    "amount": 5000,
    "status": "succeeded"
  }
}
```

## Key Features

### ✅ Secure Payment Processing
- Stripe-hosted checkout page (PCI compliant)
- No sensitive payment data handled by server
- Server-side validation prevents manipulation

### ✅ Webhook Signature Verification
- All webhooks verified using Stripe signing secret
- Prevents unauthorized requests
- Similar to JWT, but for Stripe events

### ✅ Idempotency Handling
- Same webhook event may be delivered multiple times
- Orders checked by unique `stripeSessionId`
- Prevents duplicate order creation
- Safe to retry failed webhooks

### ✅ Cart Validation
- Cart validated before checkout
- Fresh product prices fetched from database
- Stock verification prevents overselling
- Product existence checked

### ✅ Order Creation
- Complete Order document with all details
- Payment information stored for audit trail
- Affiliate information tracked
- Order status workflow (pending → processing → shipped)

### ✅ Affiliate Integration
- Affiliate ID captured from referral
- Commission amount calculated
- Commission status tracked (pending → calculated → approved → paid)
- Supports future commission export

### ✅ Error Handling
- Comprehensive error messages
- Proper HTTP status codes
- Validation errors before Stripe API calls
- Graceful handling of Stripe API failures

### ✅ Transaction Audit Trail
- All transaction IDs stored (stripeSessionId, paymentIntentId, chargeId)
- Complete payment history
- Refund tracking with reasons
- Dispute/chargeback notifications

## Architecture

### Data Flow: Checkout Session Creation
```
POST /api/checkout/create-session
        ↓
authenticate() - Verify JWT token
        ↓
checkoutController.createCheckoutSession()
        ↓
cartService.getCart(userId)
        ↓
cartService.validateCartForCheckout(userId)
        ↓
productService.getProductById() ← For each item
        ↓
Validate stock, prices, product existence
        ↓
stripe.checkout.sessions.create() ← Call Stripe API
        ↓
Return sessionId and URL
        ↓
Frontend redirects customer to Stripe
```

### Data Flow: Webhook Processing
```
POST /api/checkout/webhook
        ↓
verifyWebhookSignature() - Check signature
        ↓
checkoutController.handleStripeWebhook()
        ↓
checkoutService.handlePaymentSuccess()
        ↓
Check idempotency (Order.findByStripeSessionId())
        ↓
cartService.getCart(userId)
        ↓
Order.createFromCheckout()
        ↓
cartService.clearCart(userId)
        ↓
_triggerAffiliateCommission() - Record commission
        ↓
Return 200 OK to Stripe
```

## Security Considerations

| Feature | Implementation |
|---------|---|
| **Authentication** | JWT token required for sessions, endpoints |
| **Webhook Verification** | Stripe signature checked on every webhook |
| **Price Integrity** | Prices from database, not client-provided |
| **Stock Verification** | Real-time stock checking before order |
| **No Card Storage** | Stripe handles all payment data |
| **Idempotency** | Duplicate requests/webhooks handled safely |
| **Audit Trail** | All transaction IDs stored for investigation |
| **Error Messages** | No sensitive data in error responses |
| **Environment Variables** | API keys in .env, never committed |

## Environment Variables

```bash
# REQUIRED - Stripe Keys
STRIPE_PUBLIC_KEY=pk_test_... or pk_live_...
STRIPE_SECRET_KEY=sk_test_... or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# URLs
FRONTEND_URL=http://localhost:3000 or https://spherekings.com
CHECKOUT_SUCCESS_URL=http://localhost:3000/checkout/success
CHECKOUT_CANCEL_URL=http://localhost:3000/checkout/cancel

# Settings
CURRENCY=usd
TAX_RATE=0.08 (8%)
COMMISSION_RATE=0.1 (10%)
STRIPE_TAX_ENABLED=false
```

## Stripe Setup

### 1. Create Stripe Account
- Sign up at https://stripe.com
- Get test and live API keys
- Copy to .env file

### 2. Register Webhook Endpoint
- Go to Developers → Webhooks
- Click "Add endpoint"
- Enter URL: `https://your-domain.com/api/checkout/webhook`
- Select events: `checkout.session.completed`
- Copy signing secret to .env: `STRIPE_WEBHOOK_SECRET=whsec_...`

### 3. (Optional) Test Locally with Stripe CLI
```bash
# Install Stripe CLI
brew install stripe/stripe-cli/stripe

# Forward events to localhost
stripe listen --forward-to localhost:3000/api/checkout/webhook

# Trigger test events
stripe trigger checkout.session.completed
```

## Database Schema

### Order Document
```javascript
{
  _id: ObjectId,
  userId: ObjectId, // Reference to User
  orderNumber: "ORD-20240101-123456",
  items: [
    {
      productId: ObjectId,
      productName: "Deluxe Edition",
      variant: { color: "Red" },
      quantity: 2,
      price: 49.99,
      subtotal: 99.98
    }
  ],
  subtotal: 99.98,
  tax: 8.00,
  total: 107.98,
  paymentStatus: "paid", // pending, paid, failed, refunded
  orderStatus: "processing", // pending, processing, shipped, delivered, cancelled, refunded
  paymentDetails: {
    stripeSessionId: "cs_test_...",
    paymentIntentId: "pi_...",
    chargeId: "ch_...",
    transactionId: "ch_...",
    paidAt: Date
  },
  affiliateDetails: {
    affiliateId: ObjectId,
    commissionRate: 0.1,
    commissionAmount: 10.00,
    status: "pending" // pending, calculated, approved, paid, reversed
  },
  createdAt: Date,
  updatedAt: Date
}
```

## Integration Points

### With Cart System
- Fetches cart using `CartService.getCart(userId)`
- Validates using `CartService.validateCartForCheckout(userId)`
- Clears cart after payment via `CartService.clearCart(userId)`

### With Product System
- Fetches product details for current prices
- Validates product status (active/inactive)
- Checks stock availability

### With Affiliate System
- Stores affiliateId from referral
- Calculates commission based on order subtotal
- Records commission with status tracking

### With Auth System
- Requires JWT authentication
- Uses `req.user._id` for user identification
- Webhook bypasses auth (verified via signature instead)

## Error Handling

### Validation Errors (400)
```
- Empty cart
- Product out of stock
- Invalid product ID
- Insufficient stock for quantity
```

### Authentication Errors (401)
```
- Missing JWT token
- Invalid/expired token
- Invalid webhook signature
```

### Business Logic Errors (400)
```
- Product not found
- Product inactive
- Cart validation failed
- Stripe session creation failed
```

### Server Errors (500)
```
- Stripe API timeout
- Database error
- Webhook processing failure (Stripe will retry)
```

## Testing Checklist

- [ ] Create checkout session with valid cart
- [ ] Create checkout session with empty cart (fails)
- [ ] Create checkout session with out-of-stock items (fails)
- [ ] Redirect user to Stripe checkout
- [ ] Complete payment with test card (4242 4242 4242 4242)
- [ ] Receive webhook event for payment
- [ ] Verify Order created in database
- [ ] Verify order has correct items and totals
- [ ] Verify cart cleared after payment
- [ ] Verify commission created if affiliate
- [ ] Test webhook signature verification with invalid signature
- [ ] Test duplicate webhook (order not duplicated)
- [ ] Test refund processing
- [ ] Test refund creates refund record

## Test Stripe Card Numbers

For testing in Stripe test mode:

| Card | Number | CVC | Date |
|------|--------|-----|------|
| Visa | 4242 4242 4242 4242 | Any | Future |
| Mastercard | 5555 5555 5555 4444 | Any | Future |
| Amex | 3782 822463 10005 | Any | Future |
| Declined | 4000 0000 0000 0002 | Any | Future |

## Performance Notes

### Current Implementation
- Synchronous payment processing (blocks until Stripe responds)
- Direct database queries (no caching)
- Real-time stock verification

### Future Optimizations
- Queue webhook processing with BullMQ
- Cache product data during checkout
- Batch commission processing
- Redis webhook event deduplication
- Async email notifications
- Order status change webhooks

## Deployment Checklist

- [ ] Stripe account created with API keys
- [ ] Test keys verified with test payments
- [ ] Live keys obtained for production
- [ ] Webhook endpoint registered in Stripe Dashboard
- [ ] Environment variables configured for production
- [ ] HTTPS certificate installed (required for webhooks)
- [ ] Frontend URLs configured correctly
- [ ] Tax rate verified (if using automatic tax)
- [ ] Commission rate verified
- [ ] Database indexes created
- [ ] Error monitoring enabled (Sentry, etc.)
- [ ] Rate limiting configured for checkout endpoints
- [ ] CORS updated for Stripe domains
- [ ] Test webhook delivery in Stripe Dashboard
- [ ] Monitor webhook delivery logs for errors
- [ ] Set up alerts for failed webhooks

## File Structure

```
src/
├── config/
│   ├── stripe.js                  ✨ (new)
│   └── database.js                ✅ (existing)
├── models/
│   ├── Order.js                   ✨ (new)
│   ├── Product.js                 ✅ (existing)
│   ├── Cart.js                    ✅ (existing)
│   └── User.js                    ✅ (existing)
├── services/
│   ├── checkoutService.js         ✨ (new)
│   ├── cartService.js             ✅ (existing)
│   └── productService.js          ✅ (existing)
├── controllers/
│   ├── checkoutController.js      ✨ (new)
│   ├── cartController.js          ✅ (existing)
│   └── productController.js       ✅ (existing)
├── routes/
│   ├── checkoutRoutes.js          ✨ (new)
│   ├── cartRoutes.js              ✅ (existing)
│   ├── productRoutes.js           ✅ (existing)
│   └── authRoutes.js              ✅ (existing)
├── webhooks/
│   └── stripeWebhook.js           ✨ (new)
├── middlewares/
│   ├── authMiddleware.js          ✅ (existing)
│   └── errorHandler.js            ✅ (existing)
├── utils/
│   └── errors.js                  ✅ (existing)
├── CHECKOUT_API_DOCUMENTATION.js  ✨ (new)
├── CART_API_DOCUMENTATION.js      ✅ (existing)
├── PRODUCT_API_DOCUMENTATION.js   ✅ (existing)
└── server.js                      ✅ (updated)
```

## Usage Examples

### Frontend: Create Checkout Session
```javascript
const response = await fetch('/api/checkout/create-session', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({})
});

const { data } = await response.json();
window.location.href = data.url; // Redirect to Stripe
```

### Frontend: Handle Success URL
```javascript
// After payment, redirect to /checkout/success?session_id=cs_test_...
const sessionId = new URLSearchParams(location.search).get('session_id');
// Display success message
// Optionally fetch order details from backend
```

### Backend: Verify Order Creation
```javascript
const order = await Order.findOne({ 'paymentDetails.stripeSessionId': sessionId });
console.log(order); // Order with all details
```

## Next Steps

1. ✅ Checkout system implementation complete
2. → Integrate with Order Management/Fulfillment system
3. → Implement Affiliate Dashboard for commission tracking
4. → Add email notifications for orders
5. → Implement Commission Payout system
6. → Add Admin Dashboard for order management

## Common Issues

**Issue**: "STRIPE_WEBHOOK_SECRET environment variable is not set"
- **Cause**: Missing webhook secret in .env
- **Solution**: Add `STRIPE_WEBHOOK_SECRET=whsec_...` to .env

**Issue**: "Webhook signature verification failed"
- **Cause**: Invalid webhook secret or webhook not from Stripe
- **Solution**: Verify secret in Stripe Dashboard matches .env

**Issue**: "Cannot checkout with empty cart"
- **Cause**: User removed items or cart expired
- **Solution**: Add items to cart before checkout

**Issue**: "Stripe API error: No such payment_intent"
- **Cause**: Invalid payment intent ID (typo or old session)
- **Solution**: Verify paymentIntentId in Order.paymentDetails

**Issue**: Webhook not being delivered
- **Cause**: Webhook URL not registered or endpoint returning non-200
- **Solution**: Register in Stripe Dashboard, check endpoint returns 200 OK

## Support

For detailed API reference: **src/CHECKOUT_API_DOCUMENTATION.js**

For architecture details: Repository memory at `/memories/repo/CHECKOUT_SYSTEM_ARCHITECTURE.md`

For Stripe integration help: https://stripe.com/docs
