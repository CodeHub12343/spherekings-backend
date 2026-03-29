# Stripe Webhook Implementation - Complete Guide

## Overview
This system implements a complete Stripe webhook handler for `checkout.session.completed` events that automatically creates orders, applies affiliate attribution, and triggers commission calculations.

---

## Architecture Diagram

```
1. Customer Completes Checkout
   └─> Stripe Payment Successful
       └─> Stripe Sends Webhook Event
           └─> POST /api/checkout/webhook
               └─> Webhook Middleware (Signature Verification)
                   └─> CheckoutController.handleStripeWebhook()
                       └─> CheckoutService.handlePaymentSuccess()
                           ├─> Extract Session Data
                           ├─> Idempotency Check (prevent duplicates)
                           ├─> Fetch Payment Intent & Charge ID
                           ├─> Get Cart & Product Data
                           ├─> Create Order Document
                           ├─> Clear User's Cart
                           └─> Trigger Affiliate Commission
```

---

## 1. WEBHOOK CONFIGURATION & SETUP

### Environment Variables (.env)
```
STRIPE_SECRET_KEY=sk_test_...              # Secret API key
STRIPE_WEBHOOK_SECRET=whsec_...            # Webhook signing secret
WEBHOOK_URL=https://your-domain.com/api/checkout/webhook
```

### Stripe Configuration Module
**File:** [src/config/stripe.js](src/config/stripe.js)

```javascript
const Stripe = require('stripe');

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY.trim(), {
  apiVersion: '2024-01-01',
  timeout: 10000,
  maxNetworkRetries: 2,
});

const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

module.exports = {
  stripe,
  STRIPE_WEBHOOK_SECRET,
};
```

**Key Points:**
- Validates secret key format (must start with `sk_`)
- Sets timeout to 10 seconds for Stripe API calls
- Configures 2 retries for failed network requests
- Warns if webhook secret not configured

---

## 2. WEBHOOK SIGNATURE VERIFICATION

### File: [src/webhooks/stripeWebhook.js](src/webhooks/stripeWebhook.js)

#### verifyWebhookSignature()
```javascript
function verifyWebhookSignature(body, signature) {
  if (!STRIPE_WEBHOOK_SECRET) {
    throw new Error('STRIPE_WEBHOOK_SECRET not configured');
  }

  try {
    const event = stripe.webhooks.constructEvent(
      body,        // Raw request body (Buffer or string)
      signature,   // stripe-signature header
      STRIPE_WEBHOOK_SECRET
    );
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}
```

**Security Features:**
- Verifies HMAC-SHA256 signature from Stripe
- Prevents unauthorized requests from triggering order creation
- Returns verified event object if signature matches
- Throws error if verification fails (400 Bad Request returned to client)

**Supported Events:**
1. `checkout.session.completed` - Payment completed, create order
2. `charge.refunded` - Refund processed
3. `charge.dispute.created` - Chargeback/dispute filed

---

## 3. WEBHOOK MIDDLEWARE IN SERVER

### File: [src/server.js](src/server.js)

```javascript
// Import webhook handler
const { verifyWebhookSignature } = require('./webhooks/stripeWebhook');

// Webhook verification middleware (BEFORE body parsing)
const webhookMiddleware = [
  express.raw({ type: 'application/json' }),  // Capture raw body
  (req, res, next) => {
    console.log('📨 [WEBHOOK] Incoming webhook request to', req.path);
    
    const signature = req.headers['stripe-signature'];
    if (!signature) {
      return res.status(400).json({
        success: false,
        error: 'Stripe signature header missing',
      });
    }

    try {
      // Verify signature and attach verified event to request
      req.event = verifyWebhookSignature(req.body, signature);
      console.log('✅ [WEBHOOK] Signature verified, event type:', req.event?.type);
      next();
    } catch (error) {
      console.error('❌ [WEBHOOK] Verification failed:', error.message);
      return res.status(401).json({
        success: false,
        error: 'Webhook signature verification failed',
      });
    }
  }
];

// Register middleware for BOTH paths (backward compatibility)
app.use('/api/checkout/webhook', webhookMiddleware);
app.use('/api/v1/checkout/webhook', webhookMiddleware);

// Handler routes
app.post('/api/checkout/webhook', (req, res, next) =>
  checkoutController.handleStripeWebhook(req, res, next)
);

app.post('/api/v1/checkout/webhook', (req, res, next) =>
  checkoutController.handleStripeWebhook(req, res, next)
);
```

**Critical Implementation Details:**
- ✅ `express.raw()` middleware BEFORE body parsing to capture raw request body
- ✅ Signature verification happens BEFORE routing
- ✅ Verified event attached to `req.event`
- ✅ Returns 200 OK to Stripe (Stripe will retry on non-200)
- ✅ Two endpoint paths for backward compatibility

---

## 4. WEBHOOK ROUTE DEFINITIONS

### File: [src/routes/checkoutRoutes.js](src/routes/checkoutRoutes.js)

```javascript
/**
 * POST /api/checkout/webhook
 *
 * Stripe webhook endpoint for payment confirmation
 *
 * Security: Verified via Stripe signature (NOT authenticated with JWT)
 * Headers:
 *   stripe-signature: <signature> (from Stripe)
 *   content-type: application/json
 *
 * Body: Raw Stripe webhook event
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
 */
router.post('/webhook', checkoutController.handleStripeWebhook);
```

---

## 5. WEBHOOK HANDLER CONTROLLER

### File: [src/controllers/checkoutController.js](src/controllers/checkoutController.js)

```javascript
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

      try {
        // Call checkout service to handle payment
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
    // Return error to Stripe (will retry)
    console.error('❌ [WEBHOOK] Unhandled webhook error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    next(error);
  }
}
```

**Key Features:**
- ✅ Verifies event type is `checkout.session.completed`
- ✅ Extracts session data and logs for debugging
- ✅ Calls checkout service for payment processing
- ✅ Returns 200 OK regardless of outcome (Stripe requirement)
- ✅ Comprehensive error logging with stack traces

---

## 6. PAYMENT SUCCESS HANDLER

### File: [src/services/checkoutService.js](src/services/checkoutService.js)

#### handlePaymentSuccess() - Complete Flow

```javascript
async handlePaymentSuccess(stripeEvent, cartService, productService) {
  const session = stripeEvent.data.object;

  try {
    console.log('🔄 [CHECKOUT] Starting payment success handling...');

    // ====== STEP 1: Extract Session Data ======
    const stripeSessionId = session.id;
    const paymentIntentId = session.payment_intent;
    const userId = session.metadata?.userId;
    const affiliateId = session.metadata?.affiliateId;

    console.log('📋 [CHECKOUT] Extracted metadata:', { 
      stripeSessionId, 
      userId, 
      affiliateId 
    });

    if (!userId) {
      throw new ValidationError('No userId found in Stripe session metadata');
    }

    if (!paymentIntentId) {
      throw new ValidationError('No payment intent ID found in Stripe session');
    }

    // ====== STEP 2: Idempotency Check ======
    // Prevent duplicate order creation if webhook is replayed
    console.log('🔍 [CHECKOUT] Checking for existing order...');
    const existingOrder = await Order.findByStripeSessionId(stripeSessionId);

    if (existingOrder) {
      console.log(`✅ [CHECKOUT] Order already exists for session ${stripeSessionId}`);
      return existingOrder;
    }

    // ====== STEP 3: Fetch Payment Intent & Charge ID ======
    console.log('💳 [CHECKOUT] Fetching payment intent...');
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
      expand: ['charges.data']  // Explicitly expand charges
    });

    console.log('📊 [CHECKOUT] Payment intent retrieved:', {
      status: paymentIntent.status,
      chargesCount: paymentIntent.charges?.data?.length || 0
    });

    let chargeId = null;

    // Try to get charge ID from payment intent
    if (paymentIntent.charges?.data?.length > 0) {
      chargeId = paymentIntent.charges.data[0].id;
      console.log('✅ [CHECKOUT] Charge ID from intent:', chargeId);
    } else {
      // Fallback: Fetch charges directly
      console.log('⚠️  [CHECKOUT] No charges in intent, trying direct lookup...');
      try {
        const charges = await stripe.charges.list({
          payment_intent: paymentIntentId,
          limit: 1
        });

        if (charges.data?.length > 0) {
          chargeId = charges.data[0].id;
          console.log('✅ [CHECKOUT] Charge ID from direct lookup:', chargeId);
        }
      } catch (chargeError) {
        console.warn('⚠️  [CHECKOUT] Could not fetch charges:', chargeError.message);
      }
    }

    // Fallback: Use payment intent ID if charge ID not found
    if (!chargeId) {
      console.log('⚠️  [CHECKOUT] Using payment intent ID as transaction ID');
      chargeId = paymentIntentId;
    }

    // ====== STEP 4: Fetch Cart & Line Items ======
    console.log('🛒 [CHECKOUT] Fetching user cart...');
    let cart = null;
    let lineItems = [];
    
    try {
      cart = await cartService.getCart(userId);
      
      if (cart?.items?.length > 0) {
        console.log(`✅ [CHECKOUT] Cart found with ${cart.items.length} items`);
        lineItems = cart.items;
      } else {
        console.log('⚠️  [CHECKOUT] Cart is empty, fetching from Stripe session...');
        // Fallback: Get line items from Stripe session
        const sessionLineItems = await stripe.checkout.sessions.listLineItems(
          stripeSessionId
        );
        if (sessionLineItems.data?.length > 0) {
          lineItems = sessionLineItems.data;
          console.log(`✅ [CHECKOUT] Retrieved ${lineItems.length} items from Stripe`);
        }
      }
    } catch (cartError) {
      console.log('⚠️  [CHECKOUT] Could not fetch cart, trying Stripe fallback...');
      // Fallback: Get line items from Stripe session
      const sessionLineItems = await stripe.checkout.sessions.listLineItems(
        stripeSessionId
      );
      if (sessionLineItems.data?.length > 0) {
        lineItems = sessionLineItems.data;
        console.log(`✅ [CHECKOUT] Retrieved ${lineItems.length} items from Stripe`);
      }
    }

    if (!lineItems?.length) {
      throw new NotFoundError(
        'No order items - cart empty and Stripe session has no line items'
      );
    }

    // ====== STEP 5: Build Order Items ======
    console.log('📦 [CHECKOUT] Building order items...');
    const orderItems = [];
    let subtotal = 0;

    for (const lineItem of lineItems) {
      // Handle both cart items and Stripe line items format
      const productId = lineItem.productId || lineItem.price?.product;
      const quantity = lineItem.quantity;
      const priceData = lineItem.price?.unit_amount_decimal || lineItem.price;
      
      if (!productId && !lineItem.description) {
        console.log('⚠️  [CHECKOUT] Skipping line item with no product ID');
        continue;
      }

      // Extract actual product ID (handle full objects)
      let actualProductId = productId;
      if (typeof actualProductId === 'object' && actualProductId._id) {
        actualProductId = actualProductId._id;
      }

      console.log(`📝 [CHECKOUT] Processing item:`, {
        productId: actualProductId,
        quantity,
        price: priceData
      });

      try {
        let product;
        if (actualProductId) {
          product = await productService.getProductById(actualProductId);
        } else {
          // Fallback: use line item data
          product = {
            _id: 'unknown-' + Date.now(),
            name: lineItem.description || 'Unknown Product',
            price: priceData ? parseFloat(priceData) / 100 : 0
          };
        }

        if (!product) {
          console.warn(`⚠️  [CHECKOUT] Product ${actualProductId} not found`);
          continue;
        }

        const itemSubtotal = product.price * quantity;
        subtotal += itemSubtotal;

        orderItems.push({
          productId: product._id,
          productName: product.name,
          sku: product.sku || '',
          variant: lineItem.variant || '',
          quantity,
          price: product.price,
          subtotal: itemSubtotal,
        });
      } catch (productError) {
        console.error(`❌ [CHECKOUT] Error fetching product ${actualProductId}:`, 
          productError.message);
        // Continue processing other items
        continue;
      }
    }

    if (!orderItems.length) {
      throw new ValidationError('No valid items found to create order');
    }

    console.log(`✅ [CHECKOUT] Order items prepared (${orderItems.length} items, $${subtotal})`);

    // ====== STEP 6: Create Order Document ======
    console.log('💾 [CHECKOUT] Creating order in database...');
    const order = await Order.createFromCheckout(
      userId,
      orderItems,
      {
        stripeSessionId,
        paymentIntentId,
        chargeId,
      },
      affiliateId || null
    );

    console.log('✅ [CHECKOUT] Order created successfully:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      status: order.orderStatus,
      paymentStatus: order.paymentStatus
    });

    // ====== STEP 7: Clear User's Cart ======
    try {
      console.log('🧹 [CHECKOUT] Clearing user cart...');
      await cartService.clearCart(userId);
      console.log('✅ [CHECKOUT] Cart cleared');
    } catch (cartError) {
      console.error(`❌ [CHECKOUT] Error clearing cart:`, cartError.message);
      // Don't fail operation if cart clearing fails
    }

    // ====== STEP 8: Trigger Affiliate Commission ======
    if (order.affiliateDetails?.affiliateId) {
      try {
        console.log('💰 [CHECKOUT] Triggering affiliate commission...');
        await this._triggerAffiliateCommission(order);
        console.log('✅ [CHECKOUT] Affiliate commission triggered');
      } catch (commissionError) {
        console.error(`❌ [CHECKOUT] Error triggering commission:`, 
          commissionError.message);
        // Don't fail operation if commission trigger fails
      }
    }

    console.log('🎉 [CHECKOUT] Payment success handling completed!');
    return order;

  } catch (error) {
    console.error('❌ [CHECKOUT] Payment success handling failed:', {
      name: error.name,
      message: error.message,
      userId: session.metadata?.userId
    });
    throw new ServerError(
      `Failed to handle payment success: ${error.message}`
    );
  }
}
```

**Key Features:**
1. **Idempotency**: Checks if order already exists (prevents duplicates on webhook replay)
2. **Robust Error Handling**: Multiple fallbacks for fetching cart/line items
3. **Product Data**: Fetches current product data to ensure accurate pricing
4. **Affiliate Attribution**: Passes `affiliateId` from session metadata to Order
5. **Cart Clearing**: Removes items from user's cart after successful payment
6. **Commission Trigger**: Initiates affiliate commission calculation if applicable
7. **Comprehensive Logging**: Detailed logs at each step for debugging

---

## 7. getOrderBySessionId ENDPOINT

### Frontend Service: [FRONTEND_AUTH_IMPLEMENTATION/src/api/services/checkoutService.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/checkoutService.js)

```javascript
/**
 * Get order by Stripe session ID
 * Used by success page to display order confirmation
 */
export async function getOrderBySessionId(sessionId) {
  try {
    const response = await client.get(`/checkout/order/${sessionId}`);
    return response.data.data || null;
  } catch (error) {
    if (error.response?.status === 404) {
      return null;
    }
    throw error;
  }
}
```

### Backend Controller: [src/controllers/checkoutController.js](src/controllers/checkoutController.js)

```javascript
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

    console.log('✅ [CHECKOUT] Order found:', { 
      orderId: order._id, 
      orderNumber: order.orderNumber 
    });

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
```

### Backend Service: [src/services/checkoutService.js](src/services/checkoutService.js)

```javascript
async getOrderBySessionId(stripeSessionId) {
  try {
    console.log(
      '🔍 [CHECKOUT-SERVICE] Finding order by session ID:', 
      stripeSessionId
    );
    
    const order = await Order.findOne({
      'paymentDetails.stripeSessionId': stripeSessionId,
    }).populate('userId', 'name email').lean();

    if (!order) {
      console.log(
        '⚠️  [CHECKOUT-SERVICE] No order found for session:', 
        stripeSessionId
      );
      return null;
    }

    console.log('✅ [CHECKOUT-SERVICE] Order found:', {
      orderId: order._id,
      orderNumber: order.orderNumber,
      itemCount: order.items.length,
    });

    return order;
  } catch (error) {
    console.error(
      '❌ [CHECKOUT-SERVICE] Error fetching order by session:', {
        error: error.message,
        stripeSessionId,
      }
    );
    throw new ServerError(`Failed to fetch order: ${error.message}`);
  }
}
```

**Route Definition:**
```javascript
// GET /api/checkout/order/:sessionId
router.get('/order/:sessionId', checkoutController.getOrderBySessionId);
```

**Usage on Frontend (Success Page):**
```jsx
import { checkoutService } from '@/api/services/checkoutService';

export default function CheckoutSuccessPage() {
  const sessionId = useSearchParams().get('session_id');
  const [order, setOrder] = useState(null);

  useEffect(() => {
    const fetchOrder = async () => {
      const order = await checkoutService.getOrderBySessionId(sessionId);
      setOrder(order);
    };
    fetchOrder();
  }, [sessionId]);

  return (
    <div>
      <h1>Order Confirmation</h1>
      <p>Order Number: {order?.orderNumber}</p>
      <p>Total: ${order?.total}</p>
    </div>
  );
}
```

---

## 8. DATA FLOW SUMMARY

### 1. Session Metadata (Set During Checkout Creation)

```javascript
// In CheckoutService.createCheckoutSession()
const sessionConfig = {
  // ... other config ...
  metadata: {
    userId: userId.toString(),
    cartId: cart._id.toString(),
    ...(affiliateId && { affiliateId: affiliateId.toString() }),
  },
};
```

**Metadata passed to Webhook:**
- `userId`: User who created the order
- `cartId`: Cart that was checked out
- `affiliateId`: Affiliate who referred this purchase (if applicable)

### 2. Webhook Event Flow

```
Stripe Dashboard
    ↓
Sends POST to /api/checkout/webhook
    ↓
Webhook Middleware:
  ├─ Captures raw body (express.raw())
  ├─ Gets stripe-signature header
  ├─ Calls verifyWebhookSignature()
  ├─ Verifies HMAC-SHA256 signature
  └─ Attaches verified event to req.event
    ↓
CheckoutController.handleStripeWebhook()
    ├─ Gets req.event (verified by middleware)
    ├─ Checks event.type === 'checkout.session.completed'
    └─ Calls CheckoutService.handlePaymentSuccess(event)
        ↓
        CheckoutService.handlePaymentSuccess()
        ├─ Step 1: Extract userId, paymentIntentId, affiliateId from metadata
        ├─ Step 2: Check if order already exists (idempotency)
        ├─ Step 3: Fetch Payment Intent to get Charge ID
        ├─ Step 4: Get Cart items AND product data
        ├─ Step 5: Build Order items with current pricing
        ├─ Step 6: Create Order document with:
        │          ├─ paymentDetails: { stripeSessionId, paymentIntentId, chargeId }
        │          ├─ affiliateDetails: { affiliateId, commissionRate }
        │          └─ All order metadata needed for success page
        ├─ Step 7: Clear user's cart
        └─ Step 8: Trigger affiliate commission calculation
            ↓
        Return order to controller
    ↓
CheckoutController returns 200 OK to Stripe with:
{
  "received": true,
  "orderId": "...",
  "orderNumber": "..."
}
```

### 3. Success Page Retrieval

```
Frontend User Redirected to /checkout/success?session_id=cs_test_...
    ↓
Success Page Component
    ├─ Extract session_id from URL query param
    └─ Call checkoutService.getOrderBySessionId(sessionId)
        ↓
        Frontend Service
        └─ GET /api/checkout/order/{sessionId}
            ↓
            Backend Controller
            └─ Find order by paymentDetails.stripeSessionId
                ↓
                Return order details (orderNumber, items, total, etc.)
                ↓
        Display order confirmation to user
```

---

## 9. Error HANDLING & EDGE CASES

### Idempotency (Duplicate Webhook Events)
```javascript
// If Stripe resends the same webhook event:
// Check Step 2: Idempotency Check
const existingOrder = await Order.findByStripeSessionId(stripeSessionId);
if (existingOrder) {
  return existingOrder;  // Return existing order, don't create new one
}
```

### Missing Cart (Post-Payment)
```javascript
// If user deletes cart between payment and webhook:
// Step 4: Has fallback to Stripe session line items
try {
  const sessionLineItems = await stripe.checkout.sessions.listLineItems(
    stripeSessionId
  );
  // Use Stripe line items instead of local cart
}
```

### Missing Charge ID
```javascript
// If charge ID not in payment intent:
// Try fallback lookup: stripe.charges.list()
// If still not found: Use payment intent ID as transaction ID
```

### Product Deleted
```javascript
// If product was deleted after checkout:
// Skip that item but continue processing others
// Order will still be created with available items
```

### Affiliate Commission Failure
```javascript
// If affiliate commission trigger fails:
// STILL return 200 OK to Stripe
// Order is created successfully
// Commission can be manually triggered later
```

---

## 10. STRIPE DASHBOARD SETUP

### Registering the Webhook Endpoint

1. **Go to Stripe Dashboard → Developers → Webhooks**
2. **Click "Add an endpoint"**
3. **Enter endpoint URL:**
   ```
   https://your-domain.com/api/checkout/webhook
   ```
   OR
   ```
   https://your-domain.com/api/v1/checkout/webhook
   ```

4. **Select "Events to listen to":**
   - Select `checkout.session.completed`
   - Optionally add: `charge.refunded`, `charge.dispute.created`

5. **Click "Add endpoint"**

6. **Copy the Signing Secret:**
   ```
   whsec_xxx...
   ```

7. **Add to .env:**
   ```
   STRIPE_WEBHOOK_SECRET=whsec_xxx...
   ```

### Local Testing with ngrok

```bash
# Install ngrok: https://ngrok.com/download

# Start ngrok tunnel
ngrok http 3000

# Forwarding URL: https://abc123.ngrok-free.dev

# Register in Stripe Dashboard:
# https://abc123.ngrok-free.dev/api/checkout/webhook

# Test webhook using Stripe CLI instead:
stripe listen --forward-to localhost:3000/api/checkout/webhook
```

---

## 11. KEY FILES SUMMARY

| File | Purpose |
|------|---------|
| [src/config/stripe.js](src/config/stripe.js) | Stripe SDK initialization & secrets validation |
| [src/webhooks/stripeWebhook.js](src/webhooks/stripeWebhook.js) | Webhook signature verification functions |
| [src/server.js](src/server.js#L100-L170) | Webhook middleware setup with raw body handling |
| [src/routes/checkoutRoutes.js](src/routes/checkoutRoutes.js) | Route definitions for webhook endpoints |
| [src/controllers/checkoutController.js](src/controllers/checkoutController.js) | handleStripeWebhook() & getOrderBySessionId() handlers |
| [src/services/checkoutService.js](src/services/checkoutService.js) | handlePaymentSuccess() & getOrderBySessionId() service logic |
| [.env](.env#L58) | `STRIPE_WEBHOOK_SECRET` configuration |

---

## 12. TESTING THE WEBHOOK

### Using Stripe Test Mode

```bash
# 1. Use Stripe test credit card
Card Number: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits

# 2. Complete checkout on your site
# 3. Check webhook logs in Stripe Dashboard
# 4. Verify order created in your database
```

### Using Stripe CLI

```bash
# Install: https://stripe.com/docs/stripe-cli

# 1. Login to your Stripe account
stripe login

# 2. Forward webhooks to local server
stripe listen --forward-to localhost:3000/api/checkout/webhook

# 3. Trigger test events
stripe trigger checkout.session.completed

# 4. Check your server logs
```

### Direct API Test

```javascript
// Check order was created
const order = await Order.findOne({
  'paymentDetails.stripeSessionId': 'cs_test_xxx'
});

console.log(order);
// Should show: orderNumber, items, total, paymentStatus: 'paid', etc.
```

---

## 13. DEBUGGING TIPS

### Check Webhook Logs
1. Stripe Dashboard → Developers → Webhooks
2. Click your endpoint
3. View Event Log
4. Click event to see request/response details

### Server Logs
```javascript
// All webhook processing logs start with:
// 📨 [WEBHOOK]
// ✅ [CHECKOUT]
// ❌ [CHECKOUT]

// Grep for webhook issues:
grep "\[WEBHOOK\]\|\[CHECKOUT\]" server.log | tail -100
```

### Database Query
```javascript
// Find orders by Stripe session
db.orders.findOne({ 'paymentDetails.stripeSessionId': 'cs_test_xxx' })

// Find orders by user + date
db.orders.find({ userId: ObjectId('...') }).sort({ createdAt: -1 })
```

### Common Issues

| Issue | Solution |
|-------|----------|
| **Webhook returns 401** | Verify `STRIPE_WEBHOOK_SECRET` in .env matches Stripe Dashboard |
| **No order created** | Check user exists with matching `userId` in metadata |
| **Cart not cleared** | Check cartService.clearCart() - may need debugging |
| **Affiliate commission not triggered** | Check if `affiliateId` in metadata; affiliate must exist |
| **Order has wrong pricing** | Ensure product data fetched during webhook (Step 4) |
| **"Order not found" on success page** | Session ID query param mismatch - verify URL format |

---

## 14. SECURITY CONSIDERATIONS

✅ **Stripe Signature Verification**
- Every webhook verified with HMAC-SHA256 signature
- Prevents spoofed requests from creating orders

✅ **Idempotency Check**
- Duplicate webhook events return existing order
- Prevents duplicate charge issues

✅ **Webhook Secret in Environment**
- Never committed to source control
- Used only in webhook middleware

✅ **Public Endpoint (No JWT Required)**
- Webhook endpoint does NOT require authentication
- Protected only by Stripe signature verification
- Stripe sends signature in `stripe-signature` header

✅ **Cart Clearing**
- Prevents double-spending
- Clears user's cart after order creation

✅ **Affiliate Attribution**
- Only applies commission if `affiliateId` in metadata
- Validates affiliate exists before applying

---

## 15. INTEGRATION WITH OTHER SYSTEMS

### Affiliate System
- **Trigger:** Step 8 in handlePaymentSuccess()
- **Method:** `_triggerAffiliateCommission(order)`
- **Updates:** Affiliate balance, commission status, referral tracking

### Notification System
- Could add order confirmation emails
- Add SMS notifications
- Update user's order status in real-time

### Analytics
- Track successful payments
- Monitor webhook hit rate
- Alert on processing errors

### Refund System
- Webhook also handles `charge.refunded` events
- Updates order status to 'refunded'
- Records refund details

---

## QUICK REFERENCE

**webhook.js Functions:**
```javascript
verifyWebhookSignature(body, signature)        // Verify HMAC signature
handleStripeEvent(event, handlers)             // Route event to handler
handleCheckoutSessionCompleted(event, service) // Process payment
handleChargeRefunded(event, orderModel)        // Handle refunds
handleChargeDispute(event, orderModel)         // Handle chargebacks
```

**Server Setup:**
```javascript
// Webhook middleware (raw body capture and signature verification)
app.use('/api/checkout/webhook', webhookMiddleware);

// Handler routes
app.post('/api/checkout/webhook', handleStripeWebhook);
app.post('/api/v1/checkout/webhook', handleStripeWebhook);
```

**Service Methods:**
```javascript
handlePaymentSuccess(stripeEvent, cartService, productService)
getOrderBySessionId(stripeSessionId)
_triggerAffiliateCommission(order)
```

**Controller Endpoints:**
```javascript
POST   /api/checkout/webhook                  // Stripe sends webhook here
GET    /api/checkout/order/:sessionId         // Success page retrieves order
```
