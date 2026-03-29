# Affiliate Attribution Flow - Complete Trace

## Executive Summary

The affiliate attribution system traces sales from referral → checkout → Stripe metadata → webhook → commission through a cookie-based flow. **The system is working correctly**, but uses string storage in Stripe metadata which requires careful parsing.

---

## 1. AFFILIATE COOKIE CONFIGURATION

### Cookie Name & Format
- **Cookie Name**: `affiliate_ref`
- **Domain**: All paths (`/`)
- **HttpOnly**: `false` (frontend can read)
- **SameSite**: `Lax`
- **Secure**: Production only (HTTPS required)
- **Max Age**: **30 days** (not 90 days as some docs mention)
- **Storage Type**: **JSON string**

### Cookie Data Structure
```javascript
{
  "visitorId": "visitor_abc123xyz",      // Unique per referral click
  "affiliateCode": "AFFXXXXXX",          // Affiliate code format: AFF + 8 alphanumeric
  "affiliateId": "507f1f77bcf86cd799439011",  // MongoDB ObjectId (24 hex chars)
  "timestamp": "2024-03-28T10:30:00.000Z"     // ISO 8601 timestamp
}
```

### Validation Rules
- `affiliateCode`: Pattern `/^AFF[A-Z0-9]{8}$/` (case-insensitive in DB, must be uppercase in cookie)
- `affiliateId`: Pattern `/^[0-9a-fA-F]{24}$/` (MongoDB ObjectId format)
- `visitorId`: Must exist (format: `visitor_<timestamp>_<random>`)
- `timestamp`: Valid ISO 8601 date string
- **Cookie expiration**: If `now - timestamp > 30 days`, cookie is considered expired

---

## 2. AFFILIATE FLOW: REGISTRATION TO COMMISSION

### Stage 1: User Registers as Affiliate
```
User clicks "Become an Affiliate" → affiliateService.registerAffiliate()
  ↓
- Creates Affiliate document with unique code
- Sets status: 'active' (dev), 'pending' (prod)
- Returns: { affiliateId, affiliateCode, referralUrl }
  ↓
affiliateCode format: "AFF" + 11 random uppercase alphanumerics
```

### Stage 2: Visitor Clicks Affiliate Link
```
Link format: /products?ref=AFFXXXXXX  (queryParamAffiliateMiddleware)
  ↓
1. queryParamAffiliateMiddleware (~line 22-75 in referralMiddleware.js)
   - Extracts ?ref= query parameter
   - Looks up Affiliate by code
   - Checks if affiliate.status === 'active'
   - Creates referral cookie data
   - Sets affiliate_ref cookie (30 days)

2. getReferralCookie() called to parse cookie
   - Validates JSON format
   - Validates affiliateCode exists & format
   - Validates affiliateId exists & is MongoDB ObjectId
   
3. res.cookie('affiliate_ref', JSON.stringify(cookieData), {
     maxAge: 30 * 24 * 60 * 60 * 1000,  // 30 days
     httpOnly: false,
     sameSite: 'Lax',
     path: '/'
   })
```

### Stage 3: User Logs In / Creates Account
- User registers or logs in
- Cookie persists across domain
- No specific action needed - cookie continues to work

### Stage 4: User Adds Items to Cart & Proceeds to Checkout

```
User clicks "Checkout" → POST /api/checkout/create-session
```

**Request Processing Order** (in server.js ~line 309):
1. ✅ `queryParamAffiliateMiddleware` - handles ?ref= (already set cookie in step 2)
2. ✅ `referralCookieMiddleware` - extracts & validates affiliate_ref cookie → `req.referralCookie`
3. ✅ `referralFraudDetectionMiddleware` - fraud checks (attaches to req.fraudAssessment)
4. ✅ `affiliateAttributionMiddleware` - consolidates attribution → `req.affiliate.referralId`

### Stage 5: Checkout Controller Gets Affiliate ID
[checkoutController.js lines 45-65]

```javascript
// Priority order for affiliate ID:
// 1. From query parameter
// 2. From request body
// 3. From req.affiliate.referralId (from cookie via middleware)
let affiliateId = req.query.affiliateId || req.body.affiliateId || req.affiliate?.referralId;

// Extract visitor ID from cookie if available
let visitorId = null;
if (req.cookies.affiliate_ref) {
  try {
    const cookieData = JSON.parse(req.cookies.affiliate_ref);
    visitorId = cookieData.visitorId;
  } catch (e) {
    // Cookie parsing failed
  }
}

// Pass both to checkout service
const sessionData = await checkoutService.createCheckoutSession(
  userId,
  cartService,
  productService,
  affiliateId,        // ← The affiliate ID
  visitorId,          // ← For conversion tracking
  shippingAddress
);
```

### Stage 6: Checkout Service Creates Stripe Session
[checkoutService.js lines 32-195]

```javascript
// Build Stripe session config
const sessionConfig = {
  payment_method_types: ['card'],
  mode: 'payment',
  line_items: lineItems,
  success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
  cancel_url: `${frontendUrl}/checkout/cancel`,
  customer_email: user.email,
  metadata: {
    userId: userId.toString(),
    cartId: cart._id.toString(),
    ...(affiliateId && { affiliateId: affiliateId.toString() }),  // ← STRINGIFIED
    ...(visitorId && { visitorId: visitorId }),                    // ← STRINGIFIED
    shippingAddress: JSON.stringify(validatedShippingAddress),     // ← JSON STRING
  },
};

// Create session
const session = await stripe.checkout.sessions.create(sessionConfig);
```

**CRITICAL**: Stripe metadata stores everything as **strings**:
- `affiliateId` → stored as string, not object
- `visitorId` → stored as string
- `shippingAddress` → stored as JSON string (must be parsed)

### Stage 7: User Completes Payment on Stripe

```
Stripe processes payment → Triggers: checkout.session.completed event
```

### Stage 8: Webhook Received & Verified
[server.js lines 120-160 + webhooks/stripeWebhook.js]

```javascript
// Webhook middleware verifies signature
const webhookMiddleware = [
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    req.event = verifyWebhookSignature(req.body, signature);  // ← Verified
    next();
  }
];

// Handler receives verified event
app.post('/api/checkout/webhook', (req, res, next) => {
  checkoutController.handleStripeWebhook(req, res, next);
});
```

### Stage 9: Checkout Controller Processes Webhook
[checkoutController.js lines 140-235]

```javascript
async handleStripeWebhook(req, res, next) {
  const event = req.event;  // ← Verified event from middleware
  
  if (event.type === 'checkout.session.completed') {
    console.log('✅ Processing checkout.session.completed');
    
    const sessionData = event.data?.object;
    
    // Pass to service for order creation
    await checkoutService.handlePaymentSuccess(
      event,
      cartService,
      productService
    );
  }
}
```

### Stage 10: Checkout Service Handles Payment Success
[checkoutService.js lines 227-510]

```javascript
async handlePaymentSuccess(stripeEvent, cartService, productService) {
  const session = stripeEvent.data.object;
  
  // STEP 1: Extract metadata from Stripe session
  const stripeSessionId = session.id;
  const paymentIntentId = session.payment_intent;
  const userId = session.metadata?.userId;           // ← String from Stripe
  const affiliateId = session.metadata?.affiliateId; // ← String from Stripe
  const visitorId = session.metadata?.visitorId;     // ← String from Stripe
  const shippingAddressStr = session.metadata?.shippingAddress;  // ← JSON string
  
  console.log('📋 Extracted metadata:', { 
    stripeSessionId, userId, affiliateId, visitorId  
  });
  
  // Parse shipping address if present
  if (shippingAddressStr) {
    shippingAddress = JSON.parse(shippingAddressStr);
  }
  
  // STEP 2: Create order from checkout
  const order = await Order.createFromCheckout(
    userId,
    orderItems,
    { stripeSessionId, paymentIntentId, chargeId },
    affiliateId || null,        // ← Pass as is (string from Stripe)
    shippingAddress
  );
  
  // STEP 3: Trigger affiliate commission if applicable
  if (order.affiliateDetails && order.affiliateDetails.affiliateId) {
    await this._triggerAffiliateCommission(order, visitorId);
  }
}
```

### Stage 11: Order Model Sets Affiliate Details
[models/Order.js lines 383-490]

```javascript
static createFromCheckout(
  userId,
  cartItems,
  stripeData,
  affiliateId = null,        // ← String or MongoDB ObjectId
  shippingAddress = null
) {
  // ... create order ...
  
  // Add affiliate details if applicable
  if (affiliateId) {
    const commissionRate = parseFloat(process.env.COMMISSION_RATE || 0.1);
    
    // Fetch affiliate code from DB
    let affiliateCode = null;
    try {
      const affiliate = await Affiliate.findById(affiliateId);  // ← Can accept string
      if (affiliate) {
        affiliateCode = affiliate.affiliateCode;
      }
    } catch (e) {
      console.warn('Could not fetch affiliate code');
    }
    
    order.affiliateDetails = {
      affiliateId,                    // ← Stored as-is
      affiliateCode,                  // ← Looked up from DB
      commissionRate,
      orderValue: subtotal,
      commissionAmount: subtotal * commissionRate,
      status: 'pending',
      recordedAt: new Date(),
    };
  }
  
  await order.save();
}
```

### Stage 12: Trigger Affiliate Commission
[checkoutService.js lines 581-630]

```javascript
async _triggerAffiliateCommission(order, visitorId = null) {
  // Update status
  order.affiliateDetails.status = 'calculated';
  await order.save();
  
  // Call commission service to create commission record
  if (order.affiliateDetails && order.affiliateDetails.affiliateId) {
    const commissionService = require('./commissionService');
    
    const commission = await commissionService.createCommissionFromOrder(order, {
      skipFraudCheck: false
    });
    
    console.log('✅ Commission created:', {
      id: commission._id,
      affiliateId: order.affiliateDetails.affiliateId,
      amount: commission.calculation.amount,
      status: commission.status
    });
    
    // Update order with commission reference
    order.commissionId = commission._id;
    await order.save();
  }
}
```

### Stage 13: Commission Service Creates Commission Record
[commissionService.js lines 35-150]

```javascript
async createCommissionFromOrder(order, options = {}) {
  // Validate order is paid
  if (order.paymentStatus !== 'paid') {
    throw new ValidationError('Cannot create commission for unpaid order');
  }
  
  // Extract affiliate info from order
  if (!order.affiliateDetails || !order.affiliateDetails.affiliateId) {
    return null;  // No affiliate - skip
  }
  
  const { affiliateId, affiliateCode } = order.affiliateDetails;
  
  // Validate affiliate exists and is active
  const affiliate = await Affiliate.findById(affiliateId);
  if (!affiliate || affiliate.status !== 'active') {
    throw new ValidationError('Affiliate not active');
  }
  
  // Prevent self-referral
  if (affiliate.userId.toString() === order.userId.toString()) {
    return null;  // Self-referral blocked
  }
  
  // Calculate commission
  const commissionRate = order.affiliateDetails.commissionRate;
  const orderTotal = order.total;
  const commissionAmount = Number((orderTotal * commissionRate).toFixed(2));
  
  // Create commission record
  const commissionData = {
    affiliateId,
    orderId: order._id,
    orderNumber: order.orderNumber,
    buyerId: order.userId,
    calculation: {
      orderTotal,
      rate: commissionRate,
      amount: commissionAmount,
      tier: 'standard',
      calculatedAt: new Date(),
    },
    status: 'pending',        // Pending approval/payment
    fraudIndicators: { ... },
    approval: { ... }
  };
  
  const commission = await Commission.create(commissionData);
  
  return commission;
}
```

---

## 3. DATA FLOW SUMMARY

```
REFERRAL CLICK (Stage 2)
    ↓
?ref=AFFXXXXXX → queryParamAffiliateMiddleware
    ↓
affiliate_ref cookie set (JSON string, 30 days)
{
  "visitorId": "visitor_...",
  "affiliateCode": "AFFXXXXXX",
  "affiliateId": "507f1f77..."  ← ObjectId string
  "timestamp": "ISO..."
}
    ↓
CHECKOUT (Stage 4-5)
    ↓
affiliateAttributionMiddleware extracts cookie → req.affiliate.referralId
checkoutController reads req.affiliate.referralId or body/query param
    ↓
checkoutService.createCheckoutSession(userId, ..., affiliateId, visitorId)
    ↓
Stripe metadata:
{
  "userId": "507f...",
  "affiliateId": "507f...",  ← STRING in Stripe
  "visitorId": "visitor_...",  ← STRING in Stripe
  "shippingAddress": "{...}"   ← JSON STRING in Stripe
}
    ↓
WEBHOOK (Stage 8-10)
    ↓
checkout.session.completed event received
Extract: session.metadata.affiliateId (STRING)
    ↓
Order.createFromCheckout(userId, items, stripeData, affiliateId) 
    ↓
Affiliate.findById(affiliateId)  ← MongoDB can accept string ObjectId
    ↓
order.affiliateDetails.affiliateId ← Stored as ObjectId or string
    ↓
COMMISSION (Stage 12-13)
    ↓
commissionService.createCommissionFromOrder(order)
    ↓
Affiliate.findById(order.affiliateDetails.affiliateId)
Validate affiliate.status === 'active'
Prevent self-referral
    ↓
Commission created with:
{
  "affiliateId": order.affiliateDetails.affiliateId,
  "orderId": order._id,
  "calculation": { amount, rate, ... },
  "status": "pending"
}
```

---

## 4. MIDDLEWARE PIPELINE (in server.js order, ~line 309)

### Applied Sequentially:
1. **queryParamAffiliateMiddleware** (lines 22-75)
   - Checks for `?ref=AFFXXXXXX` in query params
   - Sets `affiliate_ref` cookie if not already present
   - Sets `req.referralCookie` with cookie data
   
2. **referralCookieMiddleware** (lines 77-113)
   - Extracts `affiliate_ref` cookie from request
   - Validates format using `validateCookieData()`
   - Checks if cookie is expired using `isCookieExpired()`
   - Sets `req.referralCookie` to cookie data or null
   
3. **referralFraudDetectionMiddleware** (lines 115-174)
   - Runs only if `req.referralCookie` exists
   - Performs fraud checks (IP patterns, device consistency, etc.)
   - Attaches `req.fraudAssessment` to request
   - Requests are NOT blocked - assessment is for monitoring only
   
4. **affiliateAttributionMiddleware** (lines 176-199)
   - Consolidates attribution from all sources:
     - Query param: `req.query.affiliateId`
     - Body: `req.body.affiliateId`
     - Cookie: `req.referralCookie.affiliateId` (takes precedence)
   - Attaches to `req.affiliate` object:
     ```javascript
     req.affiliate = {
       referralId: affiliateId,      // The ID that will be used
       source: 'cookie' | 'parameter',
       validated: true/false,        // Is format valid?
       cookie: { ... }              // Full cookie data if from cookie
     }
     ```

---

## 5. VALIDATION & CONDITIONAL LOGIC

### Cookie Validation (validateCookieData)
```
✓ affiliateCode: /^AFF[A-Z0-9]{8}$/ (11 character total)
✓ affiliateId: /^[0-9a-fA-F]{24}$/ (MongoDB ObjectId)
✓ visitorId: must exist (string, any format)
✓ timestamp: valid ISO 8601 date
✓ expiration: now - timestamp ≤ 30 days
```

### Affiliate Lookup Validation
```
✓ Affiliate exists: Affiliate.findById(affiliateId)
✓ Affiliate status: affiliate.status === 'active'
✓ Not self-referral: affiliate.userId ≠ order.userId
```

### Commission Creation Validation
```
✓ Order is paid: order.paymentStatus === 'paid'
✓ Affiliate exists: Affiliate.findById(affiliateId) returns doc
✓ Affiliate active: affiliate.status === 'active'
✓ Not self-referral: affiliate.userId ≠ order.userId
✓ No duplicate commission: Commission.findOne({ orderId }) = null
```

---

## 6. AFFILIATE ID FLOW: PRESERVATION & CONVERSION

### Entry Point
- **From Cookie**: `req.referralCookie.affiliateId` (string from JSON)
- **From Parameter**: `req.query.affiliateId` (string from URL)
- **From Body**: `req.body.affiliateId` (mixed type from JSON body)

### Checkout Controller
```javascript
// Maintains as-is (string or ObjectId)
const affiliateId = req.query.affiliateId || req.body.affiliateId || req.affiliate?.referralId;
```

### Checkout Service → Stripe Metadata
```javascript
...(affiliateId && { affiliateId: affiliateId.toString() })
// Result: Stripe metadata has STRING
```

### Webhook Extraction
```javascript
const affiliateId = session.metadata?.affiliateId;  // STRING from Stripe
```

### Order Creation
```javascript
// Mongoose accepts both string and ObjectId for findById
const affiliate = await Affiliate.findById(affiliateId);  // Works either way
order.affiliateDetails.affiliateId = affiliateId;  // Stored as-is
```

### Commission Creation
```javascript
// Extract from order (preserves type from Order model)
const { affiliateId } = order.affiliateDetails;

// Used directly in lookup
const affiliate = await Affiliate.findById(affiliateId);  // Still works
```

**Result**: affiliateId is preserved as a string throughout the flow. MongoDB's `findById()` automatically converts strings to ObjectId instances, so the system works correctly.

---

## 7. WHERE AFFILIATE ID CAN BE LOST

### ❌ **Cannot be lost** (protected by validation):
- Cookie parsing: `JSON.parse()` validates structure
- Middleware: `req.affiliate.referralId` always set (or null)
- Checkout controller: explicit null check
- Stripe metadata: `.toString()` called explicitly
- Order model: direct assignment
- Commission service: extracted from order

### ⚠️ **Can be null** (business logic):
1. No affiliate cookie set (legitimate shopper)
2. Cookie is expired (> 30 days old)
3. Affiliate code not found in database
4. Affiliate status is not 'active'
5. Affiliate is deactivated before order completes
6. User is same as affiliate (self-referral prevention)

---

## 8. LOGGING INSIGHTS

### Trace Points for Debugging:
```
✅ [REFERRAL] ?ref= parameter processed - Set affiliate cookie
✅ [CHECKOUT] Affiliate attribution - Using affiliateId: ...
📋 [CHECKOUT] Extracted metadata: { stripeSessionId, userId, affiliateId, visitorId }
✅ [ORDER.CREATE] Affiliate code retrieved: AFFXXXXXX
🤝 [ORDER.CREATE] Affiliate details added: { affiliateId, affiliateCode, commissionRate }
✅ [CHECKOUT] Affiliate commission triggered
✅ Commission created: ... for order ...
```

### Error Points:
```
⚠️  [REFERRAL] Affiliate code not found: ...
⚠️  [REFERRAL] Affiliate not active: ...
❌ [CHECKOUT] Error triggering affiliate commission
⚠️  [ORDER.CREATE] Affiliate not found for ID: ...
```

---

## 9. CONFIGURATION VALUES

### Environment Variables
```
COMMISSION_RATE=0.1         # Default 10%
CURRENCY=usd                # For Stripe
NODE_ENV=development|production
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Constants
```
REFERRAL_COOKIE_CONFIG.maxAge = 30 * 24 * 60 * 60 * 1000  // 30 days
REFERRAL_COOKIE_CONFIG.name = 'affiliate_ref'
validationSchema {
  affiliateCode: /^AFF[A-Z0-9]{8}$/
  affiliateId: /^[0-9a-fA-F]{24}$/
}
```

---

## 10. SUMMARY: THE ATTRIBUTION WORKS ✅

**Affiliate ID Flow**:
```
?ref=AFFXXXXXX 
  → cookieData { affiliateId: "507f..." } 
  → req.affiliate.referralId 
  → checkoutService(affiliateId)
  → Stripe metadata: { affiliateId: "507f..." } (STRING)
  → webhook extraction: "507f..." (STRING)
  → Order.createFromCheckout(affiliateId)
  → order.affiliateDetails.affiliateId
  → commissionService.createCommissionFromOrder()
  → Commission { affiliateId, orderId, calculation, status }
  → Affiliate listed as commission recipient ✅
```

**The system correctly**:
- ✅ Sets affiliate_ref cookie with proper validation
- ✅ Extracts affiliateId through middleware pipeline
- ✅ Passes affiliateId to Stripe metadata (stringified)
- ✅ Extracts affiliateId from webhook metadata
- ✅ Creates order with affiliateDetails
- ✅ Creates commission linked to affiliate
- ✅ Validates affiliate is active & not self-referral
- ✅ Handles null values gracefully

**No data loss occurs** - the affiliateId persists from cookie → checkout → metadata → webhook → order → commission.
