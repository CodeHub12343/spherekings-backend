# Referral Tracking System - Complete Backend Implementation Guide

## Table of Contents

1. [System Overview](#system-overview)
2. [Architecture & Components](#architecture--components)
3. [Referral Tracking Flow](#referral-tracking-flow)
4. [Database Schema](#database-schema)
5. [Referral Click Tracking Endpoint](#referral-click-tracking-endpoint)
6. [Cookie Management Strategy](#cookie-management-strategy)
7. [Checkout Attribution Integration](#checkout-attribution-integration)
8. [Security & Fraud Prevention](#security--fraud-prevention)
9. [Implementation Guide](#implementation-guide)
10. [Testing Strategy](#testing-strategy)
11. [Monitoring & Analytics](#monitoring--analytics)
12. [Troubleshooting](#troubleshooting)

---

## System Overview

The **Referral Tracking System** is a critical component of the Spherekings Marketplace affiliate infrastructure. It records every affiliate link click, stores comprehensive analytics, sets persistent attribution cookies, and ensures accurate purchase attribution to generate correct commissions.

### Key Responsibilities

- **Click Recording**: Capture every visit to an affiliate referral link
- **Cookie Attribution**: Set persistent cookies to identify referred visitors
- **Attribution Persistence**: Maintain referral attribution across multiple sessions
- **Analytics Collection**: Store detailed click metadata for reporting
- **Fraud Prevention**: Detect and prevent fraudulent click patterns
- **Order Attribution**: Link completed orders to the referring affiliate

### Business Impact

The referral tracking system enables:

- **Accurate Commission Calculation**: Only legitimate referred sales generate commissions
- **Fraud Prevention**: Detect and prevent duplicate commission claims
- **Analytics Reporting**: Track affiliate performance and ROI
- **Visitor Attribution**: Understand which marketing channels drive sales
- **Affiliate Confidence**: Transparent tracking builds trust with affiliate partners

---

## Architecture & Components

### Component Diagram

```
External Referral Click
        │
        ▼
GET /api/tracking/click?ref=AFF12345678
        │
        ▼
┌─────────────────────────────────────┐
│   Affiliate Reference Validation     │
│   - Validate affiliate code exists   │
│   - Check affiliate is active        │
│   - Prevent self-referrals           │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   Click Data Collection              │
│   - IP address                       │
│   - User agent                       │
│   - Referrer URL                     │
│   - Device type                      │
│   - UTM parameters                   │
│   - Geographic location              │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   Database Record Creation           │
│   ReferralTracking Document         │
│   - Store click analytics             │
│   - Index for fast queries            │
│   - Set 90-day TTL                    │
└─────────────────────────────────────┘
        │
        ▼
┌─────────────────────────────────────┐
│   Attribution Cookie Setting         │
│   - affiliate_ref cookie (90 days)   │
│   - HttpOnly for security             │
│   - SameSite=Lax for compatibility   │
└─────────────────────────────────────┘
        │
        ▼
Redirect to Landing Page
        │
        ▼
Cookie Available for Later Attribution
```

### System Components

#### 1. **ReferralTracking Model**
- Stores every affiliate click
- Tracks click analytics and metadata
- Records conversion data when purchase occurs
- Auto-expires after 90 days (TTL index)

#### 2. **Affiliate Model** (From Phase 6)
- Stores affiliate profile and configuration
- Tracks total clicks, sales, and earnings
- Manages affiliate status (active, suspended)
- Stores affiliate unique code

#### 3. **Referral Tracking Endpoint**
- `GET /api/tracking/click?ref=AFF12345678`
- Public endpoint (no authentication required)
- Records click and sets cookies
- Validates affiliate code
- Redirects visitor to landing page

#### 4. **Checkout Integration**
- Reads referral cookie during checkout
- Attaches affiliateId to checkout session
- Passes affiliate information to order creation
- Enables commission calculation

#### 5. **Order Integration**
- Stores affiliateDetails with order
- Links to referral tracking records
- Enables commission calculation
- Supports refund and commission reversal

---

## Referral Tracking Flow

### End-to-End User Journey

```
Step 1: Affiliate Creates Referral Link
├─ Affiliate dashboard generates: https://spherekings.com/?ref=AFF12345678
├─ Affiliate shares link via email, social, blog, etc.
└─ Link is valid for indefinite time until affiliate suspends

Step 2: Potential Customer Clicks Link
├─ Browser makes GET request to /api/tracking/click?ref=AFF12345678
├─ Server validates affiliate code exists and is active
├─ Server records click data (IP, device, referrer, UTM params)
├─ Server creates ReferralTracking document in database
├─ Server sets affiliate_ref cookie (90 days, HttpOnly)
└─ Server redirects user to landing page (e.g., /products)

Step 3: Customer Browses Platform
├─ Affiliate cookie persists in browser
├─ Customer can browse for minutes, hours, or days
├─ Affiliate attribution remains active
└─ Other analytics systems track behavior

Step 4: Customer Adds Items to Cart
├─ Cookie still active
├─ Cart system doesn't need to know about affiliate yet
└─ Customer accumulates items

Step 5: Customer Initiates Checkout
├─ Frontend reads affiliate_ref cookie
├─ Frontend sends POST /api/checkout/create-session
├─ Request includes affiliateId from cookie
├─ Backend creates Stripe session with affiliateId metadata
└─ Stripe session stores affiliate reference

Step 6: Customer Completes Payment
├─ Frontend redirects to Stripe checkout
├─ Customer enters payment information
├─ Stripe processes payment
├─ Stripe sends webhook to /api/checkout/webhook
├─ Server creates Order with affiliateDetails
├─ Server records affiliate commission
└─ Affiliate earnings updated

Step 7: Affiliate Attribution Complete
├─ ReferralTracking marked as convertedToSale
├─ Order linked to referral tracking record
├─ Commission calculated and stored
├─ Affiliate balance updated
└─ Affiliate sees sale in dashboard

Step 8: Affiliate Receives Commission
├─ Commission moved to approved status (if auto-approved)
├─ Affiliate can request payout
├─ Admin approves payout
└─ Payment sent to affiliate
```

### Timing Considerations

- **Cookie Duration**: 90 days (configurable)
- **Attribution Window**: Same as cookie duration
- **Click Recording**: Immediate (async operation)
- **Conversion Recording**: Triggered when order is created
- **Commission Processing**: Can be immediate or require approval

---

## Database Schema

### ReferralTracking Collection

```javascript
{
  _id: ObjectId,
  
  // Basic Referral Information
  affiliateId: ObjectId (ref: Affiliate),
  affiliateCode: "AFF12345678" (indexed),
  visitorId: "user123" (optional, for identified users),
  
  // Cookie Information
  cookieId: "cookie_abc123" (indexed),
  sessionId: "session_xyz789" (optional),
  
  // Network Information
  ipAddress: "192.168.1.1" (indexed),
  userAgent: "Mozilla/5.0...",
  httpReferrer: "https://facebook.com/...",
  
  // Traffic Source
  referralSource: "email|social|blog|direct|other" (enum),
  utmCampaign: "summer_sale",
  utmMedium: "email",
  utmSource: "mailchimp",
  utmContent: "summer_discount",
  
  // Landing Information
  landingUrl: "/products",
  
  // Device & Location
  device: "mobile|tablet|desktop" (enum),
  browser: {
    name: "Chrome",
    version: "96.0.4664"
  },
  os: {
    name: "Windows",
    version: "10"
  },
  country: "US" (ISO code),
  state: "CA",
  city: "San Francisco",
  
  // Conversion Information
  convertedToSale: false (boolean, indexed),
  orderId: ObjectId (ref: Order, nullable),
  commissionAmount: 25.50 (nullable, min: 0),
  conversionTimestamp: Date (when conversion occurred),
  
  // System Information
  createdAt: Date (indexed),
  expiresAt: Date (TTL index - 90 days from creation),
  
  // Metadata
  metadata: {
    affiliateWasActive: true,
    fraudFlags: [],
    notes: ""
  }
}
```

### Indexes for Performance

```javascript
// Primary Lookup Indexes
{ affiliateId: 1 }                    // Find all clicks by affiliate
{ affiliateCode: 1 }                  // Validate code quickly
{ _id: 1, expiresAt: 1 }             // TTL Index (auto-delete after 90 days)

// Conversion Tracking
{ convertedToSale: 1 }                // Find converted clicks
{ orderId: 1 }                        // Find tracking by order
{ affiliateId: 1, convertedToSale: 1} // Affiliate conversions

// Analytics
{ createdAt: 1 }                      // Time-series queries
{ device: 1, createdAt: 1 }          // Device analytics
{ referralSource: 1, createdAt: 1 }  // Source analytics

// Security & Fraud Detection
{ ipAddress: 1, createdAt: 1 }       // IP pattern detection
{ cookieId: 1 }                      // Cookie-based tracking
{ visitorId: 1 }                     // Identified visitor tracking

// Geo-location Analytics
{ country: 1, createdAt: 1 }         // Geographic insights
{ state: 1, createdAt: 1 }
{ city: 1, createdAt: 1 }
```

---

## Referral Click Tracking Endpoint

### Endpoint Specification

```
GET /api/tracking/click

Query Parameters:
  ref (required)       - Affiliate code (e.g., AFF12345678)
  utm_campaign        - UTM campaign identifier
  utm_medium          - UTM medium (email, social, etc.)
  utm_source          - UTM source platform
  utm_content         - UTM content identifier
  redirect_to         - Optional custom landing page (default: /products)

Headers:
  User-Agent          - Browser/device info (captured automatically)
  Referer             - Referrer URL (captured automatically)
  X-Referral-Source   - Optional custom source identifier
  X-Device-Type       - Optional device code (mobile, tablet, desktop)

Response:
  Status: 200 OK
  Content-Type: application/json
  
  {
    success: true,
    statusCode: 200,
    message: "Referral tracked successfully",
    data: {
      trackingId: "507f1f77bcf86cd799439011",
      affiliateId: "507f1f77bcf86cd799439012",
      affiliateCode: "AFF12345678",
      cookieId: "cookie_abc123",
      cookieExpires: "2026-03-13T12:00:00Z",
      redirectUrl: "/products"
    }
  }

Error Response (Invalid Code):
  Status: 200 OK (tracks anyway for analytics)
  
  {
    success: true,
    message: "No referral code",
    data: null
  }
```

### Implementation Details

#### Location: `src/controllers/affiliateController.js`

```javascript
async recordReferralClick(req, res, next) {
  try {
    const { ref } = req.query;

    // Handle missing affiliate code
    if (!ref) {
      return res.status(200).json({
        success: true,
        message: 'No referral code',
        data: null,
      });
    }

    // Collect click metadata
    const clickData = {
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('user-agent') || null,
      referrer: req.get('referer') || null,
      referralSource: req.headers['x-referral-source'] || 'direct',
      device: req.headers['x-device-type'] || 'desktop',
      cookieId: req.cookies?.cookieId || null,
      sessionId: req.sessionID || null,
      utmCampaign: req.query.utm_campaign || null,
      utmMedium: req.query.utm_medium || null,
      utmSource: req.query.utm_source || null,
      utmContent: req.query.utm_content || null,
    };

    // Record click in database
    const trackingData = await affiliateService.recordReferralClick(
      ref,
      clickData
    );

    // Set affiliate tracking cookies
    res.cookie('affiliateId', trackingData.affiliateId.toString(), {
      maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
      httpOnly: true,                     // Secure - JS cannot access
      secure: process.env.NODE_ENV === 'production', // HTTPS only
      sameSite: 'Lax',                   // CSRF protection
      path: '/',
    });

    res.cookie('affiliateCode', trackingData.affiliateCode, {
      maxAge: 90 * 24 * 60 * 60 * 1000,
      httpOnly: false,                    // Can be accessed by JS
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
    });

    return res.status(200).json({
      success: true,
      statusCode: 200,
      message: 'Referral tracked successfully',
      data: trackingData,
    });
  } catch (error) {
    // Don't fail the request for tracking errors
    console.error('Referral tracking error:', error);
    res.status(200).json({
      success: true,
      message: 'Referral tracking completed',
      data: null,
    });
  }
}
```

#### Service Layer: `src/services/affiliateService.js`

```javascript
async recordReferralClick(affiliateCode, clickData) {
  // Step 1: Validate affiliate code
  const affiliate = await Affiliate.findOne({
    affiliateCode: affiliateCode.toUpperCase(),
  });

  if (!affiliate) {
    throw new NotFoundError('Affiliate code not found');
  }

  // Step 2: Prevent self-referrals
  if (clickData.userId && clickData.userId.equals(affiliate.userId)) {
    throw new ForbiddenError('Cannot use your own referral link');
  }

  // Step 3: Create referral tracking record
  const tracking = new ReferralTracking({
    affiliateId: affiliate._id,
    affiliateCode: affiliate.affiliateCode,
    ...clickData,
  });

  await tracking.save();

  // Step 4: Update affiliate click counter
  affiliate.metrics.totalClicks += 1;
  await affiliate.save();

  // Step 5: Return tracking data
  return {
    trackingId: tracking._id,
    affiliateId: affiliate._id,
    affiliateCode: affiliate.affiliateCode,
    cookieId: tracking.cookieId,
    cookieExpires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
  };
}
```

### Usage Examples

#### Example 1: Direct Affiliate Link
```
GET /api/tracking/click?ref=AFF12345678
```

Response:
```json
{
  "success": true,
  "message": "Referral tracked successfully",
  "data": {
    "trackingId": "507f...",
    "affiliateId": "507f...",
    "affiliateCode": "AFF12345678"
  }
}
```

#### Example 2: Email Campaign with UTM Parameters
```
GET /api/tracking/click?ref=AFF12345678&utm_campaign=summer_sale&utm_medium=email&utm_source=mailchimp
```

#### Example 3: Social Media Traffic
```
GET /api/tracking/click?ref=AFF12345678&utm_medium=social&utm_source=facebook&utm_content=post_123
```

#### Example 4: Blog Post Referral
```
GET /api/tracking/click?ref=AFF12345678&utm_medium=blog&utm_source=myblog&utm_content=game_review
```

---

## Cookie Management Strategy

### Cookie Architecture

The system uses **two complementary cookies** for referral tracking and attribution:

#### Cookie 1: `affiliateId` (Primary Attribution Cookie)

```
Name:        affiliateId
Value:       507f1f77bcf86cd799439012 (ObjectId as string)
Domain:      .spherekings.com
Path:        /
Duration:    90 days
HttpOnly:    true     ← CRITICAL: Prevents JavaScript access
Secure:      true     ← HTTPS only in production
SameSite:    Lax      ← CSRF protection
```

**Purpose**: Stores the actual affiliate ID for backend attribution during checkout
**Security**: HttpOnly flag ensures only server can read it
**Usage**: Read by checkout server during payment creation

#### Cookie 2: `affiliateCode` (Public Reference Cookie)

```
Name:        affiliateCode
Value:       AFF12345678
Domain:      .spherekings.com
Path:        /
Duration:    90 days
HttpOnly:    false    ← Can be read by JavaScript
Secure:      true     ← HTTPS only in production
SameSite:    Lax      ← CSRF protection
```

**Purpose**: Stores affiliate code for frontend display/tracking
**Security**: Not HttpOnly (client can read it)
**Usage**: Display in UI, client-side tracking, verification

### Cookie Lifecycle

```
Time 0: Click Referral Link
├─ GET /api/tracking/click?ref=AFF12345678
├─ Server validates affiliate code
├─ Server creates ReferralTracking document
├─ Server sets cookies in response
└─ Browser stores cookies

Time 0-90 Days: Customer Browses
├─ Cookies persist across sessions
├─ Other pages read affiliateCode from cookie
├─ Multiple page views under same affiliate
└─ Customer can leave and return within 90 days

Time T: Customer Checks Out
├─ Frontend reads affiliateCode from cookie
├─ Frontend reads affiliateId from httpOnly cookie (via server)
├─ Frontend submits POST /api/checkout/create-session
├─ Backend reads affiliateId from cookies
├─ Backend creates Stripe session with affiliate metadata
└─ Checkout process continues

Time T + Payment Time: Payment Completes
├─ Stripe webhook received
├─ Order created with affiliateId from session metadata
├─ ReferralTracking marked as convertedToSale
├─ Commission recorded
└─ Cookies no longer needed (conversion happened)

Time 90 Days + 1: Cookie Expires
├─ Browser automatically removes cookies
├─ ReferralTracking document TTL expires
├─ MongoDB auto-deletes old tracking records
└─ Affiliate cannot be attributed after 90 days
```

### Cookie Handling in Checkout

#### Step 1: Frontend Detects Affiliate Cookie

```javascript
// Frontend: Read affiliate code from cookie
const affiliateCode = document.cookie
  .split('; ')
  .find(row => row.startsWith('affiliateCode='))
  ?.split('=')[1];

console.log('Affiliate Code:', affiliateCode); // Output: AFF12345678
```

#### Step 2: Send to Checkout

```javascript
// Frontend: POST /api/checkout/create-session
const response = await fetch('/api/checkout/create-session', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    affiliateCode: affiliateCode // Sent from cookie
  })
});
```

#### Step 3: Backend Reads Cookie

```javascript
// Backend: Express middleware automatically reads cookies
// via cookieParser middleware
app.use(cookieParser());

// In checkout controller:
router.post('/create-session', authenticate, (req, res) => {
  // Cookies automatically available in req.cookies
  const affiliateId = req.cookies.affiliateId;
  const affiliateCode = req.cookies.affiliateCode;
  
  // Use in checkout creation
});
```

#### Step 4: Store in Order

```javascript
// Backend: Save affiliate info with order
const order = await Order.create({
  userId: req.user._id,
  items: cartItems,
  totalAmount: total,
  affiliateDetails: {
    affiliateId: req.cookies.affiliateId,
    affiliateCode: req.cookies.affiliateCode,
  },
  ...otherFields
});
```

### Cookie Security Considerations

#### SecurityFlags

| Flag | Value | Purpose |
|------|-------|---------|
| HttpOnly | true | Prevents XSS attacks (can't steal via JS) |
| Secure | true | HTTPS only (encrypted in transit) |
| SameSite | Lax | CSRF protection (same-origin policy) |
| Domain | .spherekings.com | Subdomain sharing |
| Path | / | Available on all paths |

#### Vulnerability Prevention

| Attack | Prevention |
|--------|-----------|
| XSS Cookie Theft | HttpOnly flag on affiliateId |
| Man-in-the-middle | Secure flag (HTTPS only) |
| CSRF Attack | SameSite=Lax |
| Cross-site Read | SameSite policy + HttpOnly |
| Cookie Hijacking | Secure + HttpOnly + Domain restriction |

### Cookie Configuration

#### Production Configuration
```javascript
// src/controllers/affiliateController.js
res.cookie('affiliateId', trackingData.affiliateId.toString(), {
  maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days
  httpOnly: true,                     // Prevent XSS
  secure: true,                       // HTTPS only
  sameSite: 'Lax',                    // CSRF protection
  path: '/',
  domain: '.spherekings.com'          // Subdomain sharing
});
```

#### Development Configuration
```javascript
// src/controllers/affiliateController.js
const isProduction = process.env.NODE_ENV === 'production';

res.cookie('affiliateId', trackingData.affiliateId.toString(), {
  maxAge: 90 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: isProduction,               // HTTPS only in production
  sameSite: isProduction ? 'Strict' : 'Lax', // Stricter in production
  path: '/',
  domain: isProduction ? '.spherekings.com' : 'localhost'
});
```

---

## Checkout Attribution Integration

### Affiliate Attribution During Checkout

The checkout system integrates referral cookies to attribute purchases to the correct affiliate.

### Checkout Session Creation Flow

```javascript
// src/services/checkoutService.js

async createCheckoutSession(userId, cartService, productService, affiliateId = null) {
  // Step 1: Validate cart
  const cart = await cartService.getCart(userId);
  
  // Step 2: Calculate totals
  const items = await Promise.all(
    cart.items.map(item => productService.getProduct(item.productId))
  );
  
  const total = items.reduce((sum, item) => sum + item.price, 0);
  
  // Step 3: Create Stripe session with affiliate metadata
  const session = await stripe.checkout.sessions.create({
    success_url: 'https://spherekings.com/checkout/success',
    cancel_url: 'https://spherekings.com/checkout/cancel',
    payment_method_types: ['card'],
    line_items: items.map(item => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: 1,
    })),
    
    // Critical: Store affiliate info in session metadata
    metadata: {
      userId: userId.toString(),
      affiliateId: affiliateId ? affiliateId.toString() : null,
      affiliateCode: req.cookies?.affiliateCode || null,
    },
    
    mode: 'payment',
  });
  
  return {
    sessionId: session.id,
    url: session.url,
  };
}
```

### Webhook Payment Processing

```javascript
// src/services/checkoutService.js

async handlePaymentSuccess(event, cartService, productService) {
  // Step 1: Extract session data
  const session = event.data.object;
  const metadata = session.metadata;
  
  // Step 2: Retrieve affiliate info from session metadata
  const affiliateId = metadata.affiliateId;
  const affiliateCode = metadata.affiliateCode;
  
  // Step 3: Create order with affiliate details
  const order = await Order.create({
    userId: metadata.userId,
    items: cartItems,
    totalAmount: session.amount_total / 100,
    paymentStatus: 'paid',
    
    // Store affiliate attribution with order
    affiliateDetails: {
      affiliateId: affiliateId || null,
      affiliateCode: affiliateCode || null,
      attributionTimestamp: new Date(),
    },
  });
  
  // Step 4: Trigger commission if affiliate
  if (order.affiliateDetails?.affiliateId) {
    await this._triggerAffiliateCommission(order);
  }
  
  return order;
}
```

### Manual Affiliate Attribution (for Admin)

```javascript
// src/controllers/orderController.js

async attributeOrderToAffiliate(req, res, next) {
  try {
    const { orderId } = req.params;
    const { affiliateCode } = req.body;
    
    // Find affiliate
    const affiliate = await Affiliate.findOne({
      affiliateCode: affiliateCode.toUpperCase()
    });
    
    if (!affiliate) {
      return res.status(404).json({
        success: false,
        message: 'Affiliate not found'
      });
    }
    
    // Find order
    const order = await Order.findById(orderId);
    
    // Check if already attributed
    if (order.affiliateDetails?.affiliateId) {
      return res.status(400).json({
        success: false,
        message: 'Order already attributed to another affiliate'
      });
    }
    
    // Attribute order
    order.affiliateDetails = {
      affiliateId: affiliate._id,
      affiliateCode: affiliate.affiliateCode,
      attributionTimestamp: new Date(),
      attributedBy: 'admin',
    };
    
    await order.save();
    
    // Trigger commission
    await affiliateService.attributeOrderToAffiliate(order);
    
    return res.json({
      success: true,
      message: 'Order attributed successfully',
      data: order
    });
  } catch (error) {
    next(error);
  }
}
```

---

## Security & Fraud Prevention

### Fraud Detection Mechanisms

#### 1. **IP-Based Fraud Detection**

```javascript
// src/services/affiliateService.js

async detectFraudPatterns(affiliateId, ipAddress, timeWindow = 3600000) {
  // Find clicks from same IP in recent time window
  const recentClicks = await ReferralTracking.find({
    affiliateId,
    ipAddress,
    createdAt: { $gt: new Date(Date.now() - timeWindow) }
  }).limit(100);
  
  // If more than 10 clicks from same IP in 1 hour, flag as suspicious
  if (recentClicks.length > 10) {
    return {
      fraudFlag: 'SUSPICIOUS_IP_PATTERN',
      clicksInWindow: recentClicks.length,
      severity: 'high'
    };
  }
  
  return null;
}
```

#### 2. **Self-Referral Prevention**

```javascript
// src/services/affiliateService.js

async preventSelfReferral(affiliateId, userId) {
  // Check if user is trying to use their own affiliate link
  const affiliate = await Affiliate.findById(affiliateId);
  
  if (affiliate.userId.equals(userId)) {
    throw new ForbiddenError('Cannot use your own referral link');
  }
  
  return true;
}
```

#### 3. **Affiliate Code Validation**

```javascript
// src/validators/affiliateValidator.js

const referralClickSchema = Joi.object({
  ref: Joi.string()
    .length(15)                    // AFF + 11 chars
    .uppercase()
    .matches(/^AFF[A-Z0-9]{11}$/) // Enforce format
    .required(),
  utm_campaign: Joi.string().optional(),
  utm_medium: Joi.string().optional(),
  utm_source: Joi.string().optional(),
  utm_content: Joi.string().optional(),
});
```

#### 4. **Cookie Validation**

```javascript
// src/middlewares/validateReferralCookie.js

async function validateReferralCookie(req, res, next) {
  const affiliateId = req.cookies?.affiliateId;
  
  if (!affiliateId) {
    return next(); // No cookie, continue
  }
  
  try {
    // Verify affiliate exists and is active
    const affiliate = await Affiliate.findById(affiliateId);
    
    if (!affiliate || affiliate.status !== 'active') {
      // Clear invalid cookie
      res.clearCookie('affiliateId');
      res.clearCookie('affiliateCode');
      return next();
    }
    
    req.validAffiliate = affiliate;
    next();
  } catch (error) {
    console.error('Cookie validation error:', error);
    next(); // Continue despite error
  }
}
```

#### 5. **Device Fingerprinting**

```javascript
// src/utils/deviceFingerprint.js

function generateDeviceFingerprint(req) {
  const crypto = require('crypto');
  
  const components = [
    req.get('user-agent'),
    req.ip,
    req.get('accept-language'),
    req.get('accept-encoding'),
  ].filter(Boolean).join('|');
  
  return crypto
    .createHash('sha256')
    .update(components)
    .digest('hex');
}

// Usage in tracking controller
const deviceFingerprint = generateDeviceFingerprint(req);
clickData.deviceFingerprint = deviceFingerprint;
```

### Security Best Practices

#### Access Control

```javascript
// Public endpoint - no authentication needed
app.get('/api/tracking/click', affiliateController.recordReferralClick);

// Protected - authenticated users only
app.get(
  '/api/affiliate/dashboard',
  authenticate,
  affiliateController.getAffiliateDashboard
);

// Admin only
app.post(
  '/api/admin/affiliate/:id/suspend',
  authenticate,
  authorize('admin'),
  affiliateController.suspendAffiliate
);
```

#### Input Validation

```javascript
// All inputs validated with Joi schemas
const referralClickSchema = Joi.object({
  ref: Joi.string().required().length(15),
  utm_campaign: Joi.string().max(255),
  utm_medium: Joi.string().max(50),
  utm_source: Joi.string().max(50),
  utm_content: Joi.string().max(255),
});

// Validate before processing
const { error, value } = referralClickSchema.validate(req.query);
if (error) throw new ValidationError(error.message);
```

#### XSS Prevention

```javascript
// Express auto-escapes JSON responses
res.json({ message: 'Referral tracked' });
// Output: {"message":"Referral tracked"}
// Safe from XSS

// NoSQL injection prevention via mongoose sanitization
const { ref } = req.query;
// MongoDB drivers properly escape parameters
await ReferralTracking.findOne({ affiliateCode: ref });
```

#### Rate Limiting

```javascript
// Global rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per IP
});

app.use(limiter);

// Stricter limit for /api/tracking/click
const trackingLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30, // 30 clicks per IP per minute
  skip: (req) => req.query.ref === undefined, // Skip if no ref
});

app.get('/api/tracking/click', trackingLimiter, recordReferralClick);
```

---

## Implementation Guide

### Prerequisites

- Node.js 14+
- MongoDB with mongoose
- Express.js
- JWT authentication middleware
- Joi validation

### Step 1: Database Indexes

Ensure ReferralTracking indexes are created:

```bash
# Run mongoose schema sync or manually create indexes
db.referraltrackings.createIndex({ affiliateId: 1 })
db.referraltrackings.createIndex({ affiliateCode: 1 })
db.referraltrackings.createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 })
db.referraltrackings.createIndex({ ipAddress: 1, createdAt: 1 })
db.referraltrackings.createIndex({ convertedToSale: 1 })
```

### Step 2: Environment Variables

```bash
# .env
NODE_ENV=production
API_PREFIX=/api
CORS_ORIGIN=https://spherekings.com
COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
AFFILIATE_COOKIE_DURATION=7776000000 # 90 days in ms
FRAUD_DETECTION_ENABLED=true
SELF_REFERRAL_CHECK=true
```

### Step 3: Route Registration

```javascript
// src/server.js
const affiliateRoutes = require('./routes/affiliateRoutes');

// Mount referral tracking routes
app.use(`${config.API_PREFIX}/tracking`, affiliateRoutes);
```

### Step 4: Cookie Parser Middleware

```javascript
// src/server.js
const cookieParser = require('cookie-parser');

// Parse cookies (must come before routes)
app.use(cookieParser());
```

### Step 5: Test Referral Tracking

```bash
# Test tracking endpoint
curl "http://localhost:3000/api/tracking/click?ref=AFF12345678" \
  -H "User-Agent: Test Browser"

# Expected response
{
  "success": true,
  "message": "Referral tracked successfully",
  "data": {
    "trackingId": "507f...",
    "affiliateId": "507f...",
    "affiliateCode": "AFF12345678"
  }
}
```

### Step 6: Verify Cookies

```bash
# Cookies should be set in response headers
Set-Cookie: affiliateId=507f...; Max-Age=7776000; Path=/; HttpOnly; Secure; SameSite=Lax
Set-Cookie: affiliateCode=AFF12345678; Max-Age=7776000; Path=/; HttpOnly; Secure; SameSite=Lax
```

---

## Testing Strategy

### Unit Tests

#### Test Affiliate Code Validation

```javascript
// tests/controllers/affiliateController.test.js

describe('recordReferralClick', () => {
  it('should track valid affiliate code', async () => {
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.affiliateCode).toBe('AFF12345678');
  });
  
  it('should reject invalid affiliate code', async () => {
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'INVALID' });
    
    expect(response.status).toBe(200);
    expect(response.body.data).toBe(null);
  });
  
  it('should set affiliate cookies', async () => {
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    expect(response.headers['set-cookie']).toBeDefined();
    expect(response.headers['set-cookie'].some(c => c.includes('affiliateId'))).toBe(true);
  });
  
  it('should detect self-referrals', async () => {
    const affiliate = await Affiliate.findOne();
    const response = await request(app)
      .post('/api/tracking/click')
      .set('Authorization', `Bearer ${affiliateToken}`)
      .query({ ref: affiliate.affiliateCode });
    
    expect(response.status).toBe(403);
    expect(response.body.message).toMatch(/cannot use your own/i);
  });
});
```

#### Test Cookie Security

```javascript
describe('Cookie Security', () => {
  it('affiliateId cookie should be HttpOnly', async () => {
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    const setCookieHeader = response.headers['set-cookie'].find(
      c => c.includes('affiliateId')
    );
    
    expect(setCookieHeader).toMatch(/HttpOnly/);
  });
  
  it('affiliateId cookie should be Secure', async () => {
    // In production
    process.env.NODE_ENV = 'production';
    
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    const setCookieHeader = response.headers['set-cookie'].find(
      c => c.includes('affiliateId')
    );
    
    expect(setCookieHeader).toMatch(/Secure/);
  });
  
  it('cookies should expire in 90 days', async () => {
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    const setCookieHeader = response.headers['set-cookie'].find(
      c => c.includes('affiliateId')
    );
    
    // Max-Age should be 90 days in milliseconds
    expect(setCookieHeader).toMatch(/Max-Age=7776000/);
  });
});
```

#### Test Fraud Detection

```javascript
describe('Fraud Detection', () => {
  it('should detect rapid clicks from same IP', async () => {
    const affiliate = await Affiliate.findOne();
    
    // Simulate 15 clicks in 1 minute from same IP
    for (let i = 0; i < 15; i++) {
      await request(app)
        .get('/api/tracking/click')
        .query({ ref: affiliate.affiliateCode });
    }
    
    // Check for fraud flags
    const tracking = await ReferralTracking.findOne({
      affiliateId: affiliate._id
    });
    
    expect(tracking.metadata?.fraudFlags).toContain('SUSPICIOUS_CLICK_PATTERN');
  });
  
  it('should flag suspicious IP patterns', async () => {
    // Mock suspicious pattern
    const fraudCheck = await affiliateService.detectFraudPatterns(
      affiliateId,
      '192.168.1.1'
    );
    
    expect(fraudCheck.fraudFlag).toBe('SUSPICIOUS_IP_PATTERN');
  });
});
```

### Integration Tests

#### Test End-to-End Referral Attribution

```javascript
// tests/integration/referralAttribution.test.js

describe('End-to-End Referral Attribution', () => {
  it('should attribute order to affiliate', async () => {
    const affiliate = await Affiliate.findOne();
    
    // Step 1: Click referral link
    const trackingResponse = await request(app)
      .get('/api/tracking/click')
      .query({ ref: affiliate.affiliateCode });
    
    expect(trackingResponse.status).toBe(200);
    
    // Step 2: Create checkout session with affiliate
    const checkoutResponse = await request(app)
      .post('/api/checkout/create-session')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Cookie', trackingResponse.headers['set-cookie'])
      .send({});
    
    expect(checkoutResponse.status).toBe(201);
    const sessionId = checkoutResponse.body.data.sessionId;
    
    // Step 3: Simulate Stripe webhook
    const webhookResponse = await request(app)
      .post('/api/checkout/webhook')
      .set('stripe-signature', 'test_signature')
      .send({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            metadata: {
              userId: user._id.toString(),
              affiliateId: affiliate._id.toString(),
            },
            amount_total: 5000,
          }
        }
      });
    
    // Step 4: Verify order attributed to affiliate
    const order = await Order.findOne({ 'affiliateDetails.affiliateId': affiliate._id });
    expect(order).toBeDefined();
    expect(order.affiliateDetails.affiliateId).toEqual(affiliate._id);
    
    // Step 5: Verify referral marked as converted
    const referral = await ReferralTracking.findOne({
      affiliateId: affiliate._id,
      convertedToSale: true
    });
    expect(referral).toBeDefined();
  });
});
```

#### Test Checkout with Referral Cookies

```javascript
describe('Checkout with Referral Cookies', () => {
  it('should read affiliateId from cookie', async () => {
    const affiliate = await Affiliate.findOne();
    
    // Step 1: Track referral click (sets cookies)
    const trackingRes = await request(app)
      .get('/api/tracking/click')
      .query({ ref: affiliate.affiliateCode });
    
    const cookies = trackingRes.headers['set-cookie'];
    
    // Step 2: Create checkout with cookies
    const checkoutRes = await request(app)
      .post('/api/checkout/create-session')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Cookie', cookies) // Include affiliate cookies
      .send({});
    
    // Step 3: Verify Stripe session has affiliate metadata
    expect(checkoutRes.body.data).toBeDefined();
    const session = await Stripe.checkout.sessions.retrieve(
      checkoutRes.body.data.sessionId
    );
    
    expect(session.metadata.affiliateId).toBe(affiliate._id.toString());
  });
});
```

### Manual Testing Checklist

```markdown
# Manual Testing Checklist

## Referral Tracking Endpoint
- [ ] Valid affiliate code returns 200 with tracking data
- [ ] Invalid affiliate code returns 200 with null data
- [ ] Cookies are set in response headers
- [ ] IP address is captured correctly
- [ ] User agent is captured correctly
- [ ] UTM parameters are stored correctly
- [ ] Multiple clicks increment affiliate click counter

## Cookie Testing
- [ ] affiliateId cookie is HttpOnly
- [ ] affiliateId cookie persists for 90 days
- [ ] affiliateCode cookie is accessible to JavaScript
- [ ] Cookies are cleared on browser close (if session)
- [ ] Cookies persist across page navigation
- [ ] Cookies are sent to checkout endpoint

## Checkout Attribution
- [ ] Checkout detects affiliate cookies
- [ ] affiliateId passed to Stripe session
- [ ] Order created with affiliateDetails
- [ ] Commission calculated for attributed order
- [ ] Affiliate earnings updated
- [ ] ReferralTracking marked as converted

## Security
- [ ] Self-referral attempts return 403
- [ ] Invalid codes don't create tracking records
- [ ] Rapid clicks from same IP flagged
- [ ] Cookie tampering detected
- [ ] XSS attacks prevented
- [ ] NoSQL injection prevented

## Analytics
- [ ] Dashboard shows correct click count
- [ ] Dashboard shows correct conversion rate
- [ ] Source breakdown by utm_source works
- [ ] Device breakdown works
- [ ] Geographic breakdown works
- [ ] Time-series analytics work
```

---

## Monitoring & Analytics

### Key Metrics to Track

```
1. Click Metrics
   - Total clicks per affiliate
   - Click growth trend
   - Clicks by source (email, social, blog)
   - Clicks by device type
   - Clicks by geography

2. Conversion Metrics
   - Click-to-conversion rate
   - Conversion value per click
   - Average order value from referrals
   - Conversion time (days from click to purchase)

3. Quality Metrics
   - Bounce rate (clicks without landing)
   - Session duration
   - Pages per session
   - Return rate (repeat visitor percentage)

4. Fraud Metrics
   - Suspicious IP patterns
   - Self-referral attempts
   - Cookie tampering attempts
   - Rapid-fire click patterns
```

### Dashboard Queries

#### Get Affiliate Click Statistics

```javascript
const stats = await ReferralTracking.aggregate([
  { $match: { affiliateId: new ObjectId(affiliateId) } },
  {
    $group: {
      _id: null,
      totalClicks: { $sum: 1 },
      totalConversions: { $sum: { $cond: ['$convertedToSale', 1, 0] } },
      totalCommissions: { $sum: '$commissionAmount' },
      avgCommission: { $avg: '$commissionAmount' },
    }
  },
  {
    $addFields: {
      conversionRate: {
        $multiply: [
          { $divide: ['$totalConversions', '$totalClicks'] },
          100
        ]
      }
    }
  }
]);
```

#### Get Click Trends (Last 30 Days)

```javascript
const trends = await ReferralTracking.aggregate([
  {
    $match: {
      affiliateId: new ObjectId(affiliateId),
      createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    }
  },
  {
    $group: {
      _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
      clicks: { $sum: 1 },
      conversions: { $sum: { $cond: ['$convertedToSale', 1, 0] } },
    }
  },
  { $sort: { _id: 1 } }
]);
```

#### Get Source Breakdown

```javascript
const sourceStats = await ReferralTracking.aggregate([
  { $match: { affiliateId: new ObjectId(affiliateId) } },
  {
    $group: {
      _id: '$referralSource',
      clicks: { $sum: 1 },
      conversions: { $sum: { $cond: ['$convertedToSale', 1, 0] } },
      revenue: { $sum: '$commissionAmount' },
    }
  },
  { $sort: { clicks: -1 } }
]);
```

---

## Troubleshooting

### Issue: Cookies Not Being Set

**Symptom**: After clicking referral link, no cookies appear in browser

**Diagnosis**:
```bash
# Check if tracking endpoint is responding
curl -v "http://localhost:3000/api/tracking/click?ref=AFF12345678"

# Look for Set-Cookie headers in response
```

**Solutions**:
1. Verify affiliate code exists in database
2. Check if cookieParser middleware is enabled in server.js
3. Verify secure cookie settings in production/development
4. Clear browser cookies and try again
5. Check browser console for cookie allow/deny policies

### Issue: Cookies Not Persisting

**Symptom**: Cookies are set but disappear on page reload

**Diagnosis**:
1. Check cookie expiration time
2. Verify domain matches current site
3. Check if browser is in private/incognito mode

**Solutions**:
```javascript
// Ensure maxAge is set correctly (90 days in ms)
res.cookie('affiliateId', value, {
  maxAge: 90 * 24 * 60 * 60 * 1000, // NOT missing
  path: '/',
  domain: '.spherekings.com'
});
```

### Issue: Orders Not Attributed to Affiliates

**Symptom**: Referral clicks recorded, but orders not attributed

**Diagnosis**:
```javascript
// Check if cookie is readable in checkout
const affiliateId = req.cookies?.affiliateId;
if (!affiliateId) {
  console.log('No affiliate cookie found');
}

// Check checkout session metadata
const session = await stripe.checkout.sessions.retrieve(sessionId);
console.log('Session metadata:', session.metadata);
```

**Solutions**:
1. Verify cookies are being sent to checkout endpoint
2. Check if checkout reads cookies correctly
3. Verify Stripe session creation includes metadata
4. Check webhook handler processes affiliate ID
5. Verify affiliate exists and is active

### Issue: Duplicate Orders for Same Affiliate

**Symptom**: Multiple orders attributed to same affiliate for same customer

**Diagnosis**:
```javascript
// Check for duplicate referral clicks with same sessionId/cookieId
const dupes = await ReferralTracking.find({
  affiliateId: new ObjectId(affiliateId),
  cookieId: cookieId,
  convertedToSale: true
}).count();
```

**Solutions**:
1. Implement idempotency keys in checkout
2. Check cookie replacement logic
3. Verify one order per session
4. Add constraint to prevent duplicate conversions

### Issue: High False-Positive Fraud Flags

**Symptom**: Legitimate affiliates flagged as fraudulent

**Diagnosis**:
```javascript
// Check fraud flag thresholds
const clicks = await ReferralTracking.count({
  affiliateId,
  createdAt: { $gt: new Date(Date.now() - 3600000) }
});

console.log('Clicks in 1 hour:', clicks);
```

**Solutions**:
1. Adjust thresholds based on affiliate size
2. Implement whitelist for trusted IPs
3. Learn from false positives and refine rules
4. Use machine learning for better detection
5. Manual review before blocking

---

## Environment Variables Reference

```bash
# Core Configuration
NODE_ENV=production
API_PREFIX=/api
PORT=3000

# Database
MONGODB_URI=mongodb+srv://...:...@...

# Authentication
JWT_SECRET=your-secret-key
JWT_EXPIRE=7d

# CORS
CORS_ORIGIN=https://spherekings.com

# Cookies
COOKIE_SECURE=true
COOKIE_SAME_SITE=Strict
AFFILIATE_COOKIE_DURATION=7776000000

# Stripe
STRIPE_PUBLIC_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Affiliate System
AFFILIATE_COMMISSION_RATE=0.10
AFFILIATE_MIN_PAYOUT=50
AFFILIATE_ACTIVE_REQUIREMENT=true

# Fraud Detection
FRAUD_DETECTION_ENABLED=true
FRAUD_IP_CLICKS_LIMIT=10
FRAUD_IP_TIME_WINDOW=3600000
SELF_REFERRAL_CHECK=true

# Logging
LOG_LEVEL=info
ENABLE_TRACKING_LOGS=true
```

---

## Summary

The **Referral Tracking System** is a critical component that:

1. ✅ **Tracks every affiliate click** with comprehensive metadata
2. ✅ **Sets attribution cookies** for 90-day affiliate window
3. ✅ **Attributes orders** to correct affiliates during checkout
4. ✅ **Prevents fraud** with multiple detection mechanisms
5. ✅ **Provides analytics** for affiliate performance tracking
6. ✅ **Enables commissions** based on accurate attribution
7. ✅ **Scales reliably** with database indexes and TTL cleanup
8. ✅ **Maintains security** with HttpOnly cookies and validation

This system forms the foundation of the affiliate marketing platform, ensuring that affiliates are fairly compensated for their marketing efforts while preventing fraud and maintaining data integrity.
