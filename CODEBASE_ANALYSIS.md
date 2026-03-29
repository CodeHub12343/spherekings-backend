# SphereKings Marketplace - Comprehensive Codebase Analysis

**Analysis Date:** March 25, 2026  
**Project Status:** Backend production-ready | Frontend implementation in progress

---

## Executive Summary

The SphereKings marketplace is a **full-stack e-commerce application** with a sophisticated **affiliate commission system**. The backend (Express.js + MongoDB) is feature-complete with 11 API routes, multi-role authentication, Stripe payment processing, and fraud detection. The frontend (Next.js) has a landing page framework and beginning admin/affiliate dashboard scaffolding.

---

## 1. LANDING PAGE STRUCTURE

### Current Implementation
**Location:** `FRONTEND_AUTH_IMPLEMENTATION/src/app/page.jsx`

The landing page is built as a **component composition pattern** with 11 discrete sections:

```jsx
// page.jsx structure
import Header from '../sections/Header';
import Hero from '../sections/Hero';
import ValueProp from '../sections/ValueProp';
import HowItWorks from '../sections/HowItWorks';
import FeaturesShowcase from '../sections/FeaturesShowcase';
import SocialProof from '../sections/SocialProof';
import TrustSecurity from '../sections/TrustSecurity';
import DualCTA from '../sections/DualCTA';         // Customer vs Affiliate CTAs
import FAQ from '../sections/FAQ';
import FinalCTA from '../sections/FinalCTA';
import Footer from '../sections/Footer';

export default function App() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main>
        {/* 11 sections in sequence */}
      </main>
      <Footer />
    </div>
  );
}
```

### Sections Directory
All located in `FRONTEND_AUTH_IMPLEMENTATION/src/sections/`:
- **Header.jsx** - Navigation with auth links
- **Hero.jsx** - Primary value proposition  
- **ValueProp.jsx** - Key benefits breakdown
- **HowItWorks.jsx** - 3-4 step process explanation
- **FeaturesShowcase.jsx** - Product/platform features grid
- **SocialProof.jsx** - Testimonials, reviews, metrics
- **TrustSecurity.jsx** - Security badges, compliance
- **DualCTA.jsx** - Dual call-to-action (customer signup vs affiliate signup)
- **FAQ.jsx** - Collapsible FAQ section
- **FinalCTA.jsx** - Final conversion push before footer
- **Footer.jsx** - Links, social, copyright

### Styling Approach
- **Tailwind CSS** (evidenced by `min-h-screen`, `bg-white` classes)
- Global CSS: `src/App.css`
- Each section is self-contained with its own styling
- Next.js page-based routing

### Component Patterns Observed
1. **Functional components** (React 16.8+)
2. **No state management visible** in sections (likely static content)
3. **External links** to `/auth/register` and `/auth/login` pages
4. **Responsive design** expectations (Tailwind responsive utilities)

---

## 2. BACKEND ARCHITECTURE

### Overview
**Location:** `src/`  
**Runtime:** Node.js + Express.js  
**Database:** MongoDB (Mongoose ODM)  
**API Prefix:** `/api/v1`

### Complete Directory Structure

```
src/
├── config/
│   ├── database.js          # MongoDB connection (Mongoose)
│   ├── environment.js       # Config: API_PREFIX=/api/v1, ports, secrets
│   └── stripe.js            # Stripe SDK initialization
├── models/ (8 collections)
│   ├── User.js              # 3-role system: customer|affiliate|admin
│   ├── Product.js           # Products with variants, images, status
│   ├── Cart.js              # Shopping cart with items array
│   ├── Order.js             # Completed orders (nested payment + affiliate data)
│   ├── Commission.js        # Affiliate earnings (status: pending→approved→paid)
│   ├── Affiliate.js         # Affiliate profile + analytics
│   ├── Payout.js            # Payout requests (status workflow)
│   └── ReferralTracking.js  # Click/visit tracking
├── routes/ (11 route files)
│   ├── authRoutes.js
│   ├── productRoutes.js
│   ├── cartRoutes.js
│   ├── checkoutRoutes.js
│   ├── orderRoutes.js
│   ├── affiliateRoutes.js
│   ├── commissionRoutes.js
│   ├── payoutRoutes.js
│   ├── adminRoutes.js
│   ├── referralTrackingRoutes.js
│   └── fileUploadRoutes.js
├── controllers/ (11 controllers)
│   └── HTTP request handlers (business logic delegated to services)
├── services/ (10 services)
│   └── Business logic + database operations
├── validators/ (8 validator files)
│   └── Joi schemas with custom error messages
├── middlewares/
│   ├── authMiddleware.js        # JWT verification
│   ├── roleMiddleware.js        # authorize(...roles) function
│   ├── securityMiddleware.js    # Rate limiting, IP blocking, validation
│   ├── fraudDetectionMiddleware.js
│   ├── referralMiddleware.js    # Affiliate code extraction
│   ├── fileUploadMiddleware.js  # Multer configuration
│   ├── errorHandler.js          # Global error handler + custom errors
│   └── requestMetadata.js       # IP, device, session tracking
├── utils/
│   ├── jwtUtils.js              # Token generation/verification
│   ├── passwordUtils.js         # Bcrypt hash/compare, reset tokens
│   ├── cloudinaryUpload.js      # Image upload service
│   ├── cookieUtils.js
│   ├── adminAnalytics.js
│   ├── referralAnalytics.js
│   ├── fraudDetection.js
│   └── errors.js                # Custom error classes
├── security/
│   └── securityLogger.js        # Audit logging
├── webhooks/
│   └── stripeWebhook.js         # Stripe event handling
└── server.js                    # Express app initialization + middleware setup
```

### API Route Structure (11 Endpoints)

Each route file follows the pattern:
```javascript
const router = express.Router();
router.use(authenticateToken);           // Verify JWT
router.use(authorize(...roles));          // Check role
router.post('/endpoint', handler);        // Controller function
```

**All routes use API_PREFIX `/api/v1`:**

| Module | Routes | Key Features |
|--------|--------|--------------|
| **Auth** | register, login, refresh, logout, profile, changePassword, forgotPassword, resetPassword | JWT tokens, bcrypt, email verification |
| **Products** | GET list/[id], POST/PUT/DELETE (admin only) | Images, variants, status field (not boolean) |
| **Cart** | POST update, POST remove, GET | Per-user cart with item snapshots |
| **Checkout** | POST checkoutSession, webhook | Stripe integration, order creation |
| **Orders** | GET list/[id], POST refund | Order history, affiliate attribution |
| **Affiliates** | GET list/[id], POST register, PUT status | Code generation, email verification |
| **Commissions** | GET list/stats, PUT approve/reverse | Auto-calculated on order completion |
| **Payouts** | GET list/[id], POST request, PUT approve/process | Payout workflow with admin approval |
| **Admin** | GET dashboard/orders/products/affiliates/commissions/payouts | System overview + analytics |
| **Referrals** | GET stats, POST trackClick | Cookie-based tracking |
| **Files** | POST upload | Cloudinary integration |

### Key Technical Implementation Details

#### Authentication Pattern
```javascript
// JWT Structure
const token = {
  userId: user._id,
  role: 'customer|affiliate|admin',
  type: 'access|refresh'
}

// Middleware: req.user = { _id, userId, role }
```

**Locations:**
- Token generation: `src/utils/jwtUtils.js`
- Verification: `src/middlewares/authMiddleware.js` 
- Usage: `authenticateToken` middleware before protected routes

#### Role-Based Authorization
```javascript
// Middleware: authorize('admin', 'affiliate')
router.use(authorize('admin'));  // Single role check

// Usage in admin routes
router.use(authenticateToken);
router.use(authorize('admin'));
```

**Three roles:**
- `customer` - Default, can purchase
- `affiliate` - Earns commissions on referred sales
- `admin` - System administration

#### Error Handling Architecture
```javascript
// Global error handler in server.js catches all errors
app.use(errorHandler);

// Pattern in controllers
const getDashboard = async (req, res, next) => {
  try {
    // logic
  } catch (error) {
    next(error);  // Passes to global handler
  }
}

// Response format
{
  success: true/false,
  message: "User-friendly message",
  data: {...},           // Success case
  errors: {...}          // Validation failure
}
```

**Status Codes:**
- 200/201: Success
- 400: Validation error
- 401: Unauthorized (no token)
- 403: Forbidden (role check failed)
- 404: Not found
- 500: Server error

#### Validation Pattern (Joi)
```javascript
// src/validators/authValidator.js example
const registerSchema = Joi.object({
  name: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required().lowercase(),
  password: Joi.string().min(6).required(),
  confirmPassword: Joi.string().valid(Joi.ref('password')).required(),
  role: Joi.string().valid('customer', 'affiliate', 'admin').default('customer'),
  agreeToTerms: Joi.boolean().valid(true).required()
});

// Usage in controller
const validation = validate(registerSchema)(req.body);
if (!validation.valid) {
  return res.status(400).json({
    success: false,
    errors: validation.errors
  });
}
```

---

## 3. AUTHENTICATION & AUTHORIZATION

### Architecture

```
User Login
    ↓
loginController (validates input)
    ↓
authService.loginUser (business logic)
    ↓
User model (database query)
    ↓
bcryptjs.compare (password verification)
    ↓
generateTokenPair (creates access + refresh tokens)
    ↓
Return: { user, accessToken, refreshToken }
```

### JWT Implementation

**Token Types:**
1. **Access Token** - Short-lived (15 min default), used for API requests
2. **Refresh Token** - Long-lived (7 days default), used to get new access token

**Token Generation:**
- Location: `src/utils/jwtUtils.js`
- Signature: `generateAccessToken(userId, role)` → Bearer token
- Contains: `userId`, `role`, `type`, `exp` (expiration)

**Token Verification:**
```javascript
// In authenticateToken middleware
const decoded = verifyAccessToken(token);
req.user = {
  _id: decoded.userId,
  userId: decoded.userId,
  role: decoded.role
};
```

### Password Security

**Hashing:**
- Library: `bcryptjs` (not bare bcrypt)
- Salt rounds: (check `src/utils/passwordUtils.js`)
- Pattern: `bcrypt.hash(password, saltRounds)`
- Verification: `bcrypt.compare(inputPassword, hashedPassword)`

**Reset Flow:**
1. User requests reset: `POST /api/v1/auth/forgot-password` (email)
2. Token generated + sent via email
3. User clicks link → enters new password
4. `POST /api/v1/auth/reset-password` with token + new password
5. Token verified, password updated

**Properties on User model:**
```javascript
passwordResetToken: String (selected: false),
passwordResetExpires: Date (selected: false),
loginAttempts: Number,
lockUntil: Date
```

### Three-Role Architecture

| Role | Capabilities | Model Fields |
|------|--------------|--------------|
| **customer** | Browse products, purchase, view orders | None additional |
| **affiliate** | Earn commissions, request payouts, view stats | Linked to Affiliate model |
| **admin** | Manage products, view dashboard, approve/reject items | Full system access |

**Affiliate Linking:**
```javascript
// User model: role='affiliate'
// Links to Affiliate model via userId
Affiliate {
  userId: ObjectId (ref: User),
  affiliateCode: 'AFF' + 11 alphanumeric,
  status: 'pending|active|suspended|inactive'
}
```

**Affiliate Status Lifecycle:**
- `pending` - Awaiting email verification
- `active` - Can earn commissions
- `suspended` - Fraud or policy violation
- `inactive` - User deactivated

**Role Checking:**
```javascript
// middleware/roleMiddleware.js
const authorize = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Required roles: ${allowedRoles.join(', ')}` 
      });
    }
    next();
  };
};

// Usage in routes
router.use(authorize('admin'));  // Only admin
router.use(authorize('affiliate', 'admin'));  // Either role
```

---

## 4. PAYMENT INTEGRATION (Stripe)

### Current Implementation

**Configuration:**
- Location: `src/config/stripe.js`
- SDK: `stripe` npm package v20.4.1
- Keys: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET` (from .env)

```javascript
const Stripe = require('stripe');
const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2024-01-01',
  timeout: 10000,
  maxNetworkRetries: 2
});
```

### Payment Flow Architecture

```
1. Cart Ready
    ↓
2. User initiates checkout
    ↓
3. POST /api/v1/checkout/session
    ↓
4. checkoutController → checkoutService
    ↓
5. Validate cart items (product exists, active, price check)
    ↓
6. stripe.checkout.sessions.create()  ← Stripe creates payment session
    ↓
7. Return sessionId to frontend
    ↓
8. Frontend redirects to Stripe Checkout
    ↓
9. User pays (card, Apple Pay, Google Pay)
    ↓
10. Stripe sends webhook to /api/v1/checkout/webhook
    ↓
11. checkoutController.handleStripeWebhook()
    ↓
12. Create Order + Commission records
    ↓
13. Update inventory + affiliate stats
```

### Webhook Implementation

**Webhook Middleware (Critical Architecture):**
```javascript
// In server.js - BEFORE body parsing middleware
const webhookMiddleware = [
  express.raw({ type: 'application/json' }),  // Raw body for signature
  (req, res, next) => {
    const signature = req.headers['stripe-signature'];
    req.event = verifyWebhookSignature(req.body, signature);
    next();
  }
];

// Mount on both paths for compatibility
app.use('/api/checkout/webhook', webhookMiddleware);
app.use('/api/v1/checkout/webhook', webhookMiddleware);
```

**Webhook Events Handled:**
- `charge.succeeded` - Successful payment
- `charge.failed` - Payment failure
- (Potentially: refund events)

**Webhook Location:** `src/webhooks/stripeWebhook.js`

### Order Creation on Payment

**Trigger:** After webhook verification  
**Location:** `src/controllers/checkoutController.handleStripeWebhook()`  
**Creates:**
1. Order document with payment details
2. Commission document(s) if order has affiliate
3. Updates Product inventory (if applicable)
4. Updates Affiliate stats

**Order Structure:**
```javascript
Order {
  userId: ObjectId,
  items: [OrderItem] (product, variant, quantity, price, subtotal),
  paymentDetails: {
    stripeSessionId,
    paymentIntentId,
    chargeId,
    transactionId,
    paidAt
  },
  affiliateDetails: {  // If order via affiliate
    affiliateId,
    affiliateCode,
    commissionAmount
  },
  status: 'completed|failed|refunded',
  totalAmount,
  taxes,
  shipping
}
```

### Payment Fields to Track

**Product Model:**
- `price: Number` (min: $0.01)
- `status: String` (enum: 'active', 'inactive', 'archived')

**Cart Item:**
- `price` snapshot at add time (prevents client-side manipulation)
- `quantity` with validation (1-1000)

**Order Item:**
- `price` at purchase time
- `subtotal` calculated
- Preserves variant selection

---

## 5. ADMIN DASHBOARD & REVIEW SYSTEMS

### Current Admin Implementation

**Location:** `FRONTEND_AUTH_IMPLEMENTATION/src/app/(admin)/admin/`

**Sections:**
```
admin/
├── dashboard/          # Overview metrics
├── commissions/        # Commission management
├── orders/             # Order history + refunds
├── payouts/            # Payout approvals
└── products/           # Product management
```

### Backend Admin API

**Location:** `src/routes/adminRoutes.js` + `src/controllers/adminController.js`

**All admin routes protected by:**
```javascript
router.use(authenticateToken);  // Must be logged in
router.use(authorize('admin'));  // Must have admin role
```

**Key Admin Endpoints:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/admin/dashboard` | GET | Overview (revenue, orders, affiliates, commissions, payouts) |
| `/api/v1/admin/orders` | GET | All orders with filtering, pagination, sorting |
| `/api/v1/admin/orders/:id` | GET | Order detail |
| `/api/v1/admin/orders/:id/refund` | POST | Initiate refund |
| `/api/v1/admin/products` | GET/POST/PUT/DELETE | Product CRUD |
| `/api/v1/admin/affiliates` | GET | All affiliates list |
| `/api/v1/admin/affiliates/:id` | GET | Affiliate detail + stats |
| `/api/v1/admin/affiliates/:id/status` | PUT | Suspend/unsuspend |
| `/api/v1/admin/commissions` | GET | All commissions |
| `/api/v1/admin/commissions/stats` | GET | Commission summary |
| `/api/v1/admin/commissions/:id/approve` | PUT | Approve commission |
| `/api/v1/admin/commissions/:id/reverse` | PUT | Reverse commission |
| `/api/v1/admin/payouts` | GET | All payout requests |
| `/api/v1/admin/payouts/:id` | GET | Payout detail |
| `/api/v1/admin/payouts/:id/approve` | PUT | Approve payout |
| `/api/v1/admin/payouts/batch-approve` | POST | Batch approve |

### Commission Workflow

**Automatic Calculation:**
1. Order placed and paid (Stripe webhook triggers)
2. `commissionService.createCommission()` called automatically
3. If order has `affiliateDetails.affiliateId`, commission created
4. Commission status: `pending` (awaits admin approval)

**Admin Approval Flow:**
```
Commission: pending
    ↓
Admin: PUT /api/v1/admin/commissions/:id/approve
    ↓
Status → approved
    ↓
Can be included in payout requests
```

**Commission Reversal:**
```
Commission: paid
    ↓
Admin: PUT /api/v1/admin/commissions/:id/reverse
    ↓
Status → reversed
    ↓
Deducted from affiliate balance
```

**Commission Model Fields:**
```javascript
Commission {
  affiliateId: ObjectId,          // Who earned it
  orderId: ObjectId,              // From which order (unique)
  orderNumber: String,
  buyerId: ObjectId,              // Who purchased
  calculation: {
    orderTotal: Number,           // Order amount
    rate: Number,                 // 0-1 (e.g., 0.10 = 10%)
    amount: Number,               // Commission amount
    tier: String,                 // 'standard|tiered|promotional|manual'
    calculatedAt: Date,
    notes: String
  },
  status: String,                 // 'pending|approved|paid|reversed'
  statusHistory: [
    {
      from: String,
      to: String,
      changedAt: Date,
      changedBy: ObjectId,
      reason: String
    }
  ]
}
```

### Payout System

**Workflow:**
```
Affiliate: accumulated earnings
    ↓
POST /api/v1/payouts/request (submission)
    ↓
Payout: status = pending
    ↓
Admin reviews in dashboard
    ↓
PUT /api/v1/payouts/:id/approve
    ↓
Status = approved → ready for payment
    ↓
PUT /api/v1/payouts/:id/process
    ↓
Status = processing → submitting to payment provider
    ↓
Webhook from payment processor
    ↓
Status = completed OR failed
```

**Payout Model Fields:**
```javascript
Payout {
  affiliateId: ObjectId,
  amount: Number,                 // Min: $0.01, Max: $1,000,000
  currency: String,               // 'usd', etc.
  status: String,                 // pending→approved→processing→completed|failed|cancelled
  bankAccount: {                  // For payment routing
    accountHolderName: String,
    accountNumber: String (hashed),
    routingNumber: String (hashed),
    bankName: String
  },
  reason: String,                 // Why payout requested
  approvalNotes: String,          // Admin notes
  rejectionReason: String,        // If rejected
  createdAt: Date,
  approvedAt: Date,
  processedAt: Date,
  completedAt: Date
}
```

**Admin Approval Pattern:**
```javascript
// PUT /api/v1/payouts/:id/approve
router.put('/:id/approve', (req, res, next) => {
  // Validate approvalNotes in body
  // Update payout status to 'approved'
  // Add admin ID to approvedBy
  // Send email to affiliate
});

// PUT /api/v1/payouts/batch-approve
router.post('/batch-approve', (req, res, next) => {
  // Body: { payoutIds: [...], approvalNotes: "..." }
  // Update multiple payouts in one call
});
```

---

## 6. DATABASE SCHEMA PATTERNS

### Technology
- **Database:** MongoDB (cloud or local)
- **ODM:** Mongoose v7.0.0
- **Connection:** `src/config/database.js`

### Schema Design Patterns

#### Pattern 1: Nested Subdocuments (Denormalization)
Used to reduce queries and keep related data together:
```javascript
// Order includes nested PaymentDetails & AffiliateDetails
Order {
  items: [OrderItem],
  paymentDetails: { stripeSessionId, paymentIntentId, ... },
  affiliateDetails: { affiliateId, affiliateCode, commissionAmount }
}
```

**Rationale:** Payment and affiliate info tied to order; rarely updated separately.

#### Pattern 2: Document References (Normalization)
Used for frequently updated or shared data:
```javascript
Commission {
  affiliateId: ObjectId (ref: 'User'),   // Reference, not nested
  orderId: ObjectId (ref: 'Order'),
  buyerId: ObjectId (ref: 'User')
}
```

**Rationale:** Commissions linked to multiple documents; kept separately for query flexibility.

#### Pattern 3: Status Fields & Lifecycle
```javascript
// Enum values with clear states
status: {
  type: String,
  enum: ['pending', 'approved', 'paid', 'reversed'],
  index: true  // Frequently queried
}

// Status history for audit trail
statusHistory: [
  {
    from: String,
    to: String,
    changedAt: Date,
    changedBy: ObjectId,
    reason: String
  }
]
```

#### Pattern 4: Timestamps
```javascript
{
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: Date  // Soft deletes
}
```

#### Pattern 5: Indexing for Performance
```javascript
// Frequently queried fields are indexed
email: { type: String, unique: true, index: true },
affiliateCode: { type: String, unique: true, index: true },
status: { type: String, enum: [...], index: true },
createdAt: { type: Date, default: Date.now, index: true }
```

### Model Relationships Map

```
User (8 fields per role)
├── role: 'customer'
│   └── creates Orders
│       └── creates Commissions (if via affiliate)
├── role: 'affiliate'
│   └── has Affiliate (1:1)
│       ├── earns Commissions
│       ├── makes Payout requests
│       └── generates ReferralTracking records
└── role: 'admin'
    └── reviews/approves all above

Product
└── appears in Cart items
    └── purchased in Orders
        └── triggers Commission (if affiliate)

Cart
├── belongs to User (1:1)
└── contains CartItems (many)
    └── link to Products

Order
├── belongs to User
├── references Products (via OrderItems)
├── has Commissions (if affiliate order)
└── has PaymentDetails (from Stripe)

Commission
├── belongs to Affiliate (User)
├── references Order (1:1 unique)
└── has statusHistory
```

---

## 7. FORM & INPUT PATTERNS

### Frontend Form Handling

**Location:** `FRONTEND_AUTH_IMPLEMENTATION/src/api/services/`

**Service Layer Pattern:**
```javascript
// authService.js example
export const register = async (formData) => {
  try {
    const response = await client.post('/auth/register', {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      confirmPassword: formData.confirmPassword,
      role: formData.role || 'customer',
      agreeToTerms: true
    });
    
    return {
      success: response.data.success,
      data: response.data,
      error: null
    };
  } catch (error) {
    return {
      success: false,
      data: null,
      error: error.response?.data?.message || error.message
    };
  }
};
```

**Axios Client Configuration:**
```javascript
// api/client.js
import axios from 'axios';

const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
  headers: { /* ... */ }
});

// Request Interceptor: Injects Authorization header
client.interceptors.request.use((config) => {
  const token = TokenManager.getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  
  // Content-Type detection
  if (config.data instanceof FormData) {
    // FormData: let browser set multipart/form-data
    delete config.headers['Content-Type'];
  } else if (config.data && typeof config.data === 'object') {
    config.headers['Content-Type'] = 'application/json';
  }
  
  return config;
});

// Response Interceptor: Handles token refresh on 401
client.interceptors.response.use(
  response => response,
  async (error) => {
    if (error.response?.status === 401 && !isRefreshing) {
      // Token expired, request new one
      isRefreshing = true;
      const newToken = await TokenManager.refreshAccessToken();
      isRefreshing = false;
      
      // Retry failed request with new token
      error.config.headers.Authorization = `Bearer ${newToken}`;
      return client(error.config);
    }
    return Promise.reject(error);
  }
);
```

### Backend Validation Pattern

**Joi Validation:**
```javascript
// validators/authValidator.js
const registerSchema = Joi.object({
  name: Joi.string()
    .min(2).max(50)
    .required()
    .messages({ 'string.min': 'Name must be at least 2 characters' }),
  
  email: Joi.string()
    .email()
    .required()
    .lowercase()
    .messages({ 'string.email': 'Invalid email address' }),
  
  password: Joi.string()
    .min(6)
    .required(),
  
  confirmPassword: Joi.string()
    .valid(Joi.ref('password'))
    .required()
    .messages({ 'any.only': 'Passwords do not match' }),
  
  role: Joi.string()
    .valid('customer', 'affiliate', 'admin')
    .default('customer'),
  
  agreeToTerms: Joi.boolean()
    .valid(true)
    .required()
});

// Usage
const validation = validate(registerSchema)(req.body);
if (!validation.valid) {
  return res.status(400).json({
    success: false,
    errors: validation.errors  // { field: 'error message' }
  });
}
```

### File Upload Handling

**Frontend:**
```javascript
// Example: uploading product image
const formData = new FormData();
formData.append('image', fileInput.files[0]);  // File object
formData.append('productId', productId);

const response = await client.post('/upload', formData);
// Axios automatically sets Content-Type: multipart/form-data
```

**Backend:**
```javascript
// fileUploadRoutes.js uses multer middleware
const multer = require('multer');
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/upload', authenticateToken, upload.single('image'), uploadController.uploadFile);

// uploadController.js
const uploadFile = async (req, res, next) => {
  try {
    // req.file contains: fieldname, originalname, encoding, mimetype, size, destination, filename
    
    // Upload to Cloudinary
    const cloudinaryUrl = await cloudinaryUpload(req.file.path);
    
    // Update database
    
    return res.json({ success: true, data: { url: cloudinaryUrl } });
  } catch (error) {
    next(error);
  }
};
```

**Cloudinary Integration:**
- Location: `src/utils/cloudinaryUpload.js`
- Config: Environment variable `CLOUDINARY_URL`
- Replaces file-based storage with cloud CDN

### Form Validation Constraints

**User Registration:**
- Name: 2-50 characters
- Email: Valid email format
- Password: Min 6 characters
- Terms: Must agree

**Product Creation (Admin):**
- Name: 3-100 characters, unique, lowercase
- Description: 20-2000 characters
- Price: $0.01+, 2 decimal places
- Images: 1-10 per product, URL format
- Variants: Max 10 per product, each with up to 20 options
- SKU: Optional but unique if provided

**Order/Cart:**
- Quantity: 1-1000 per item
- Cart size: Max 1000 items

**Commission:**
- Rate: 0-1 (0% to 100%)
- Amount: Auto-calculated from order total

**Payout:**
- Amount: $0.01 - $1,000,000
- Status transitions: pending → approved → processing → completed

---

## 8. EXISTING CODE PATTERNS TO FOLLOW

### Pattern 1: Controller → Service → Model
```javascript
// Controller
const register = async (req, res, next) => {
  try {
    const result = await registerUser(req.body);  // Delegates to service
    res.status(201).json({ success: true, data: result });
  } catch (error) {
    next(error);  // Error propagates to global handler
  }
};

// Service
const registerUser = async (userData) => {
  // Validation
  const existing = await User.findOne({ email: userData.email });
  if (existing) throw new Error('Email already registered');
  
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  // Create document
  const user = await User.create({ ...userData, password: hashedPassword });
  
  // Generate tokens
  const tokens = generateTokenPair(user._id, user.role);
  
  return { user, ...tokens };
};

// Model
const user = await User.create({ /* ... */ });  // Direct DB call
```

**Key Points:**
1. Controllers validate input and format response
2. Services handle business logic
3. Models contain schema only (no logic)
4. Errors bubble up to middleware

### Pattern 2: Middleware Chaining
```javascript
// Route definition
router.post(
  '/sensitive-action',
  authenticateToken,        // Verify JWT
  authorize('admin'),       // Check role
  validateInput,            // Validate request body
  resourceOwnershipCheck,   // Verify ownership
  asyncHandler(controller)  // Execute
);
```

### Pattern 3: Error Handling
```javascript
// Custom error class
class ValidationError extends Error {
  constructor(message, errors) {
    super(message);
    this.statusCode = 400;
    this.errors = errors;
  }
}

// Global handler
app.use((err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = statusCode === 500 ? 'Internal server error' : err.message;
  
  return res.status(statusCode).json({
    success: false,
    message,
    errors: err.errors || undefined
  });
});
```

### Pattern 4: Query Building
```javascript
// With filters, pagination, sorting
const getOrders = async (req, res, next) => {
  let query = Order.find();
  
  // Filter by status
  if (req.query.status) {
    query = query.where('status', req.query.status);
  }
  
  // Filter by date range
  if (req.query.fromDate && req.query.toDate) {
    query = query.where('createdAt')
      .gte(new Date(req.query.fromDate))
      .lte(new Date(req.query.toDate));
  }
  
  // Pagination
  const page = req.query.page || 1;
  const limit = req.query.limit || 20;
  query = query.skip((page - 1) * limit).limit(limit);
  
  // Sorting
  if (req.query.sortBy) {
    const sortOrder = req.query.sortOrder === 'desc' ? -1 : 1;
    query = query.sort({ [req.query.sortBy]: sortOrder });
  }
  
  const orders = await query.exec();
  return res.json({ success: true, data: orders });
};
```

### Pattern 5: Status Lifecycle Management
```javascript
// Define valid transitions
const VALID_TRANSITIONS = {
  'draft': ['published', 'deleted'],
  'published': ['archived', 'draft'],
  'archived': ['published']
};

// Validation before updating
const updateStatus = async (req, res, next) => {
  const { newStatus } = req.body;
  const doc = await Model.findById(req.params.id);
  
  if (!VALID_TRANSITIONS[doc.status].includes(newStatus)) {
    throw new Error(`Cannot transition from ${doc.status} to ${newStatus}`);
  }
  
  // Record history
  doc.statusHistory.push({
    from: doc.status,
    to: newStatus,
    changedAt: new Date(),
    changedBy: req.user._id
  });
  
  doc.status = newStatus;
  await doc.save();
};
```

---

## 9. IMPLEMENTATION CHECKLIST

### Files to Modify
- [x] **Backend:** Already complete (11 routes, all controllers/services)
- [ ] **Frontend:** Landing page sections (enhance existing)
- [ ] **Frontend:** Auth pages (register/login)
- [ ] **Frontend:** Dashboard pages (customer, affiliate, admin)
- [ ] **Frontend:** Hooks for React Query (example: `useFetchCommissions`)
- [ ] **Frontend:** API services (example: `commissionService.js`)

### New Files to Create
#### Frontend Pages
- [ ] `app/(auth)/login/page.jsx`
- [ ] `app/(auth)/register/page.jsx`
- [ ] `app/(app)/dashboard/page.jsx`
- [ ] `app/(app)/products/page.jsx`
- [ ] `app/(app)/products/[id]/page.jsx`
- [ ] `app/(app)/cart/page.jsx`
- [ ] `app/(app)/checkout/page.jsx`
- [ ] `app/(affiliate)/dashboard/page.jsx`
- [ ] `app/(affiliate)/referrals/page.jsx`

#### Frontend Components
- [ ] Auth component set (LoginForm, RegisterForm, ProtectedRoute)
- [ ] Product listing component (grid, filters)
- [ ] Product detail component (images, variants, add to cart)
- [ ] Cart component (item list, remove, update qty)
- [ ] Checkout component (stripe integration)
- [ ] Commission display (affiliate earning summary)
- [ ] Payout request form (affiliate)

#### Frontend Services/Hooks
- [ ] `api/hooks/useAuthentication.js` → register, login, logout, me
- [ ] `api/hooks/useProducts.js` → getProducts, getProduct
- [ ] `api/hooks/useCart.js` → addToCart, updateCart, removeFromCart
- [ ] `api/hooks/useOrders.js` → getOrders, getOrder
- [ ] `api/hooks/useAffiliates.js` → getAffiliateProfile, getStats
- [ ] `api/hooks/useCommissions.js` → getCommissions, getStats
- [ ] `api/hooks/usePayouts.js` → requestPayout, getPayouts

### Integration Points

**Authentication:**
- [ ] Connect register form to `POST /api/v1/auth/register`
- [ ] Connect login form to `POST /api/v1/auth/login`
- [ ] Store tokens in localStorage or secure cookie
- [ ] Set up auto-token refresh on 401

**Products:**
- [ ] Fetch products: `GET /api/v1/products`
- [ ] Fetch product detail: `GET /api/v1/products/:id`
- [ ] Display variant selections

**Cart:**
- [ ] Add to cart: `POST /api/v1/cart/update`
- [ ] Remove from cart: `POST /api/v1/cart/remove`
- [ ] Display cart summary

**Checkout:**
- [ ] Create session: `POST /api/v1/checkout/checkoutSession`
- [ ] Redirect to Stripe Checkout via sessionId
- [ ] On success, order created via webhook

**Affiliate Features:**
- [ ] Fetch affiliate stats: `GET /api/v1/affiliate/stats`
- [ ] Fetch commissions: `GET /api/v1/commissions`
- [ ] Request payout: `POST /api/v1/payouts/request`
- [ ] Display referral URL: `${config.FRONTEND_URL}/?ref=${affiliateCode}`

**Admin Features:**
- [ ] Dashboard: `GET /api/v1/admin/dashboard`
- [ ] Approve commission: `PUT /api/v1/admin/commissions/:id/approve`
- [ ] Approve payout: `PUT /api/v1/admin/payouts/:id/approve`

---

## 10. KEY CONSTRAINTS & VALIDATION RULES

### Product
- **Name:** 3-100 chars, unique, lowercase
- **Price:** $0.01+ (2 decimals)
- **Description:** 20-2000 chars
- **Images:** 1-10, valid URLs
- **Status:** 'active' | 'inactive' | 'archived' (critical: not boolean)

### User/Auth
- **Name:** 2-50 chars
- **Email:** Unique, valid format
- **Password:** Min 6 chars (strength checking in service)
- **Roles:** 'customer' | 'affiliate' | 'admin'

### Affiliate
- **Code:** 'AFF' + 11 alphanumeric (format: /^AFF[A-Z0-9]{11}$/)
- **Status:** 'pending' → 'active' (after email verify) → 'suspended' or 'inactive'
- **Email verification:** Required before active

### Commission
- **Rate:** 0-1 (e.g., 0.10 = 10%)
- **Tier:** 'standard' | 'tiered' | 'promotional' | 'manual'
- **Status:** 'pending' → 'approved' → 'paid' (or 'reversed')

### Payout
- **Amount:** $0.01 - $1,000,000
- **Status:** 'pending' → 'approved' → 'processing' → 'completed' (or 'failed'|'cancelled')
- **Min payout threshold:** (check service for exact amount)

### Cart
- **Max items:** 1000 per cart
- **Qty per item:** 1-1000
- **Price snapshot:** Captured at add time (prevents manipulation)

---

## 11. CRITICAL NOTES FOR DEVELOPERS

### Database
- **Indexes:** Ensure created on: email, affiliateCode, status fields for performance
- **Unique fields:** email (User), affiliateCode (Affiliate), stripeSessionId (Order)
- **Relationships:** Use ObjectId references, not string IDs

### Authentication
- **Token payload:** { userId, role, type } (not _id)
- **Middleware order:** authenticateToken BEFORE authorize
- **Refresh token ONLY valid for token refresh endpoint, not API calls

### Stripe Integration
- **Webhook middleware placement:** MUST come before body parsing
- **Signature verification:** Non-negotiable; return 401 if invalid
- **Retries:** Stripe retries failed webhooks; idempotency is critical (use unique stripeSessionId)

### Affiliate System
- **Commission calculations:** Triggered AFTER order payment webhook
- **Status changes:** Log all status transitions in `statusHistory` for audit trail
- **Email verification:** Block affiliate activation until verified (unless dev mode)

### Error Handling
- **All errors propagate to middleware** - don't send res.json() in every place
- **Global error handler** should be last middleware in stack
- **Status codes:** Validation (400), Unauthorized (401), Forbidden (403), Not Found (404), Server Error (500)

### Frontend
- **Token refresh:** Automatically retried on 401 (axios interceptor handles)
- **FormData:** Don't set Content-Type header; let browser set multipart boundary
- **React Query:** Use staleTime/gcTime intelligently to reduce API calls

---

## 12. DEPLOYMENT CONSIDERATIONS

### Environment Variables Required
**Backend (.env):**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-secret-key
JWT_REFRESH_SECRET=your-refresh-key
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
STRIPE_PUBLISHABLE_KEY=pk_live_xxxxx
CORS_ORIGIN=https://yourfrontend.com
NODE_ENV=production
CLOUDINARY_URL=cloudinary://xxxxx@yyyyy/zzzz
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=https://api.yourbackend.com
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

### Build & Start
**Backend:**
```bash
npm install
npm run dev  # dev with nodemon
npm start    # production
```

**Frontend:**
```bash
npm install
npm run build
npm start    # production
# or
npm run dev  # development
```

---

## Summary Matrix

| Aspect | Stack | Key Files | Pattern |
|--------|-------|-----------|---------|
| **Backend** | Express.js, MongoDB, Mongoose | `src/` | Controller → Service → Model |
| **Frontend** | Next.js, React, Axios, React Query | `FRONTEND_AUTH_IMPLEMENTATION/src/` | Service → Hook → Component |
| **Auth** | JWT (access + refresh), bcryptjs | `authService`, `authMiddleware` | Token pair w/ refresh |
| **Database** | MongoDB collections (8) | `models/*.js` | Mongoose ODM with indexes |
| **Payment** | Stripe | `webhooks/stripeWebhook.js` | Webhook → Order creation |
| **Affiliate** | Custom tracking | `affiliateService`, `commissionService` | Attribution → Commission → Payout |
| **Admin** | Role-based dashboard | `adminController`, `adminRoutes` | authorize('admin') middleware |
| **Validation** | Joi on backend, built-in on frontend | `validators/*.js` | Schema with custom messages |
| **Error Handling** | Global middleware | `middlewares/errorHandler.js` | Centralized, standardized format |
| **Styling** | Tailwind CSS | Landing page sections | Utility-first CSS framework |

---

**This analysis provides the complete architectural blueprint. Refer back to this document when creating or modifying any system component.**
