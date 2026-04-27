# 🔍 SphereKings Marketplace - Comprehensive Codebase Analysis

**Analysis Date:** April 5, 2026  
**Project Status:** Production-Ready with Active Development  
**Analyzed by:** GitHub Copilot (Claude Haiku 4.5)

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Tech Stack](#2-tech-stack)
3. [Core Features](#3-core-features)
4. [Database Schema](#4-database-schema)
5. [API Structure](#5-api-structure)
6. [Frontend Architecture](#6-frontend-architecture)
7. [Current Implementation Status](#7-current-implementation-status)
8. [Key File Locations](#8-key-file-locations)

---

## 1. Project Overview

### What is This Application?

**SphereKings Marketplace & Affiliate System** is a full-stack e-commerce platform specifically designed to enable early-stage distribution and community-driven marketing of the **Sphere of Kings board game**.

### Main Purpose and Goals

The platform serves three primary objectives:

1. **Direct Sales Channel** - Create an online marketplace where customers can purchase Sphere of Kings products directly
2. **Affiliate Marketing Network** - Enable individuals to become affiliate marketers, promoting the product through personal networks
3. **Revenue Generation** - Generate early sales revenue while building a community-driven distribution network before retail availability

### Target Users/Audience

| User Type | Role in System | Key Features |
|-----------|----------------|--------------|
| **Customers** | Buyers | Browse products, add to cart, checkout with Stripe, track orders |
| **Affiliates** | Marketers/Influencers | Referral links, sales tracking, commission earnings, payout dashboard |
| **Admins** | System Operators | Manage products, orders, affiliates, commissions, payouts, view analytics |
| **Influencers** | Content Creators | Apply for influencer status, participate in sponsorships, earn commissions |

---

## 2. Tech Stack

### Frontend

**Framework & Build Tools:**
- **Next.js** (React) - Full-stack framework with SSR/SSG capabilities
- **Location:** `FRONTEND_AUTH_IMPLEMENTATION/src`
- **Node Version:** >=14.0.0

**Key Libraries:**
- **React Query** - Server state management and data fetching
- **Axios** - HTTP client with interceptors for authentication
- **React Hook Form** (inferred) - Form state management
- **Zod/Joi** - Schema validation on frontend
- **CSS/Tailwind** - Styling (globals.css with responsive utilities)

**Pages & Structure:**
- App routes organized in layout groups: `(app)`, `(auth)`, `(admin)`, `(affiliate)`
- Optional routes: `influencer/`, `raffle/`, `sponsorship/`

**Environment Configuration:**
- `.env.local` - `NEXT_PUBLIC_API_URL` for backend API base URL

### Backend

**Runtime & Framework:**
- **Node.js** - JavaScript runtime (>=14.0.0)
- **Express.js** (v4.18.2) - HTTP server framework
- **Location:** `src/` root directory

**Database:**
- **MongoDB** - NoSQL document database
- **Mongoose** (v7.0.0) - ODM with schema validation and relationship management
- **Connection:** `src/config/database.js` with retry logic and Atlas support

**Authentication & Security:**
- **JWT (jsonwebtoken v9.0.0)** - Token-based authentication
- **bcryptjs** (v3.0.3) - Password hashing
- **Helmet** (v7.0.0) - Security headers (XSS, CSRF, clickjacking protection)
- **express-rate-limit** (v6.7.0) - Rate limiting/DDoS protection
- **express-mongo-sanitize** (v2.2.0) - NoSQL injection prevention
- **cookie-parser** (v1.4.6) - Cookie parsing and management

**Payment Processing:**
- **Stripe** (v20.4.1) - Payment processing with webhook signature verification
- Webhook endpoints: `/api/v1/checkout/webhook` (production)

**File Uploads:**
- **Multer** (v2.1.1) - Middleware for handling multipart/form-data
- **Cloudinary** (v2.9.0) - Cloud storage for product images and user uploads
- Utility: `src/utils/cloudinaryUpload.js`

**Validation:**
- **Joi** (v17.9.0) - Schema validation for request bodies
- Location: `src/validators/*.js` (8 validator files)

**Development:**
- **Nodemon** (v3.0.1) - Auto-restart on file changes
- **ESLint** (v8.52.0) - Code quality/linting
- **Jest** (v29.7.0) - Unit testing framework
- **Supertest** (v6.3.3) - HTTP assertion library

### Deployment Platforms

**Currently Supported:**
- **Render.com** - Can host both backend and frontend
- **Vercel** - Optimized for Next.js frontend deployment
- **MongoDB Atlas** - Cloud-hosted database

**Configuration Files:**
- `render.yaml` - Render.com deployment specification
- Documentation: `DEPLOYMENT_RENDER_VERCEL_GUIDE.md`, `QUICK_DEPLOY_RENDER_VERCEL.md`

---

## 3. Core Features

### 3.1 Authentication System

**Registration & Login:**
- Endpoint: `POST /api/v1/auth/register` - New user signup
- Endpoint: `POST /api/v1/auth/login` - User login
- Returns: `{ user, accessToken, refreshToken }`
- Role assignment: defaults to `'customer'`

**Token Management:**
- Access Token: Short-lived (JWT), includes userId, role, type
- Refresh Token: Long-lived (JWT), used to obtain new access tokens
- Refresh Endpoint: `POST /api/v1/auth/refresh`
- Storage: Frontend uses localStorage with `tokenManager.js` utility

**Password Management:**
- Password Reset: `POST /api/v1/auth/password-reset`
- Email Verification: Optional (system supports but not required)
- Rate Limiting: Password reset limiter prevents brute force

**Security Features:**
- Account lockout after failed login attempts
- IP-based tracking and blocking for suspicious activity
- CORS validation on all requests
- Request metadata tracking: IP, device, session info

### 3.2 User Roles & Permissions

**Three-Tier Role System:**

| Role | Registration | Features | Key Permissions |
|------|--------------|----------|------------------|
| **customer** | Default on signup | Browse products, cart, checkout, order history | View own orders, update profile |
| **affiliate** | Via affiliate registration OR upgrade | Referral dashboard, commission tracking, payout requests | Generate referral links, view sales, request payouts |
| **admin** | Manual creation via admin endpoint | Full system control, analytics, moderation | Manage all products/orders/affiliates/payouts, approve commissions |

**Role Enforcement:**
- Middleware: `src/middlewares/roleMiddleware.js` - `authorize('role1', 'role2', ...)`
- Applied to protected routes to verify user has required role
- Returns 403 Forbidden if role check fails

**Affiliate Upgrade Path:**
1. Customer registers as normal user
2. Applies for affiliate status via `/api/v1/affiliates/apply`
3. Admin approves via admin dashboard
4. System creates Affiliate model with unique code (AFF + 11 randomchars)

### 3.3 Marketplace (Products & Shopping)

**Product Management:**

| Feature | Endpoint | Details |
|---------|----------|---------|
| List Products | `GET /api/v1/products` | Supports filters, pagination, search |
| Product Detail | `GET /api/v1/products/:id` | Includes images, variants, category |
| Create Product | `POST /api/v1/products` | Admin only, multipart/form-data |
| Update Product | `PUT /api/v1/products/:id` | Admin only |
| Delete Product | `DELETE /api/v1/products/:id` | Admin only |

**Product Fields (from Product model):**
- `name`, `description`, `price` (in cents in DB, dollars in API)
- `status` - 'active', 'inactive', 'discontinued'
- `sku` - Unique identifier
- `category` - Reference to Category model
- `images` - Array of URLs
- `inventory` - Quantity tracking
- `variants` - Optional color/size combinations
- `ratings`, `reviews` - Customer feedback
- `createdAt`, `updatedAt` - Timestamps

**Shopping Cart:**

| Feature | Endpoint | Details |
|---------|----------|---------|
| Get Cart | `GET /api/v1/cart` | User's current cart |
| Add Item | `POST /api/v1/cart/add` | Add product to cart |
| Update Item | `POST /api/v1/cart/update` | Modify quantity |
| Remove Item | `POST /api/v1/cart/remove` | Delete product from cart |
| Clear Cart | `POST /api/v1/cart/clear` | Empty entire cart |

**Cart Data Structure:**
- Linked to User via userId
- Items array with: `{ productId, quantity, price }`
- Timestamps and total price calculation

### 3.4 Payment & Checkout

**Stripe Integration:**

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/v1/checkout/session` | POST | Create Stripe Checkout Session |
| `/api/v1/checkout/webhook` | POST | Receive Stripe webhook events |
| `/api/v1/checkout/refund` | POST | Process refunds (admin) |

**Checkout Flow:**
1. User provides shipping address via form
2. Frontend sends cart items + shipping to `/api/v1/checkout/session`
3. Backend validates products, calculates total, creates Stripe session
4. **CRITICAL:** Affiliate attribution happens here via middleware
5. Returns Stripe session URL
6. User redirected to Stripe hosted checkout
7. On payment success, Stripe sends webhook `charge.succeeded`
8. Backend: Creates Order, calculates Commission, updates Affiliate stats

**Affiliate Attribution (During Checkout):**
```javascript
// Three ways affiliate ID is determined:
1. req.affiliate?.referralId (from URL ?aff=CODE or affiliate middleware)
2. req.query.affiliateId or req.body.affiliateId (explicit)
3. Referral cookie (old referral link)
```
- Order gets `affiliateDetails` field with referral information
- Commission automatically created with status 'pending'

**Payment Processing:**
- Stripe Webhook signature verification (must come BEFORE body parsing)
- Webhook events: `charge.succeeded`, `charge.failed`, `charge.refunded`
- Order status: pending → completed (on success) or failed (on failure)

### 3.5 Order Management

**Order Endpoints:**

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/orders` | GET | List user orders (paginated) | Customer |
| `/api/v1/orders/:id` | GET | Get order details | Customer (own) / Admin |
| `/api/v1/orders/admin/all` | GET | Admin list (all orders) | Admin |
| `/api/v1/orders/:id/refund` | POST | Request refund | Admin |

**Order Model:**
```javascript
{
  userId: ObjectId,
  items: [{ productId, name, price, quantity, subtotal }],
  shippingAddress: { name, email, address, city, state, zip, country },
  paymentDetails: { stripeSessionId, stripeIntentId, method: 'stripe' },
  affiliateDetails: { affiliateId, code, commission, tier },
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  totalAmount: number (cents),
  shippingCost: number (cents),
  tax: number (cents, if applicable),
  createdAt, updatedAt
}
```

**Order Status Flow:**
1. Order created in 'pending' status when checkout session initiated
2. Status changes to 'completed' when Stripe confirms payment
3. Can be marked 'refunded' by admin after refund processed
4. Commission calculation triggered on completion

### 3.6 Affiliate System

**Affiliate Features:**
- Unique referral code generation: Format `AFF{11 alphanumeric chars}` (14 chars total)
- Referral link: `https://domain.com?aff={AFFILIATE_CODE}`
- Click tracking: Records every click via referral link
- Sales attribution: Links completed orders to affiliate
- Commission calculation: Automatic upon order completion

**Affiliate Endpoints:**

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/affiliates/apply` | POST | Apply for affiliate status | Customer |
| `/api/v1/affiliates/profile` | GET | Get affiliate profile/stats | Affiliate |
| `/api/v1/affiliates/:code` | GET | Get public affiliate info | Public |
| `/api/v1/affiliates/:id` | PUT | Update affiliate profile | Affiliate |
| `/api/v1/affiliates/admin/list` | GET | Admin list affiliates | Admin |
| `/api/v1/affiliates/admin/:id/approve` | POST | Approve affiliate | Admin |
| `/api/v1/affiliates/admin/:id/suspend` | POST | Suspend affiliate | Admin |

**Affiliate Model:**
```javascript
{
  userId: ObjectId (unique reference to User),
  affiliateCode: String (unique, indexed),
  status: 'pending' | 'active' | 'suspended' | 'inactive',
  commissionRate: number (e.g., 0.10 for 10%),
  totalClicks: number,
  totalSales: number (in cents),
  totalEarnings: number (in cents),
  totalReferrals: number,
  bankDetails: { accountName, accountNumber, routingNumber },
  paymentFrequency: 'weekly' | 'monthly' | 'on-demand',
  createdAt, updatedAt
}
```

**Referral Tracking:**
- Middleware: `src/middlewares/referralMiddleware.js`
- Detects: URL parameter `?aff=CODE` or existing cookie
- Sets cookie: `sph_referral_code` with 30-day expiration
- Records click: Creates ReferralTracking document for analytics
- Prevents self-referral: Validates affiliate ≠ customer

### 3.7 Commission System

**Commission Calculation:**
- Triggered automatically when order status = 'completed'
- Commission Engine: `src/services/commissionService.js`
- Tiered system: Different rates based on affiliate performance

**Commission Endpoints:**

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/commissions` | GET | List affiliate commissions | Affiliate/Admin |
| `/api/v1/commissions/:id` | GET | Get commission details | Affiliate/Admin |
| `/api/v1/commissions/admin/all` | GET | Admin commission list | Admin |
| `/api/v1/commissions/admin/:id/approve` | POST | Approve pending | Admin |
| `/api/v1/commissions/admin/:id/reverse` | POST | Reverse commission | Admin |

**Commission Model:**
```javascript
{
  affiliateId: ObjectId,
  orderId: ObjectId,
  amount: number (cents, calculated as percentage of order total),
  rate: number (0-1, e.g., 0.10 = 10%),
  tier: string (e.g., 'bronze', 'silver', 'gold'),
  status: 'pending' | 'approved' | 'paid' | 'reversed',
  statusHistory: [{ status, timestamp, notes }],
  payoutId: ObjectId (reference to Payout model),
  createdAt, updatedAt
}
```

**Status Workflow:**
1. Created in 'pending' status automatically
2. Admin reviews and approves individually
3. Approved commissions aggregated for payouts
4. Status changes to 'paid' when payout processed
5. Can be reversed for refunded orders

### 3.8 Payout System

**Payout Endpoints:**

| Endpoint | Method | Purpose | Auth |
|----------|--------|---------|------|
| `/api/v1/payouts` | GET | List payouts | Affiliate/Admin |
| `/api/v1/payouts/request` | POST | Submit payout request | Affiliate |
| `/api/v1/payouts/:id` | GET | Get payout details | Affiliate/Admin |
| `/api/v1/payouts/admin/all` | GET | Admin payout list | Admin |
| `/api/v1/payouts/admin/:id/approve` | POST | Approve payout request | Admin |
| `/api/v1/payouts/admin/:id/process` | POST | Send payment | Admin |

**Payout Model:**
```javascript
{
  affiliateId: ObjectId,
  commissionIds: [ObjectId], // linked commissions
  totalAmount: number (cents),
  status: 'pending' | 'approved' | 'processing' | 'paid' | 'failed',
  paymentMethod: 'bank_transfer' | 'stripe_connect' | 'paypal',
  bankDetails: {...}, // stored for payment
  requestDate: Date,
  approvalDate: Date,
  paymentDate: Date,
  failureReason: string (if status = 'failed'),
  createdAt, updatedAt
}
```

**Payout Thresholds:**
- Minimum payout: $5.00 (500 cents)
- Affiliates can request payout when balance exceeds minimum
- Admin can adjust threshold in configuration

### 3.9 Admin Functionality

**Admin Dashboard Endpoints:**
- Products management (CRUD operations)
- Orders overview and refund processing
- Affiliate management and approval workflows
- Commission approval and manual adjustments
- Payout request processing
- System analytics and reporting

**Admin Features:**
- View all users, filter by role
- Approve/reject affiliate applications
- Approve pending commissions
- Process payout requests
- View sales analytics
- System health monitoring

**Key Admin Endpoints:**
- `GET /api/v1/admin/dashboard` - Overview metrics
- `GET /api/v1/admin/analytics` - Sales and affiliate data
- `POST /api/v1/admin/users/:id/role` - Change user role
- `POST /api/v1/admin/system/settings` - Update settings

### 3.10 Third-Party Integrations

**Stripe Integration:**
- Live Key Management (if applicable)
- Webhook signature verification in middleware
- Automatic order creation on charge success
- Refund processing capability

**Cloudinary Integration:**
- Product image uploads
- User profile image uploads
- Automatic CDN delivery
- Performance optimization

**Email Integration (Noted but Verify):**
- Order confirmation emails
- Payout notification emails
- Commission update emails
- System notifications

**Additional Modules (Advanced Features):**

#### 3.10a Influencer Sponsorship System
- **Purpose:** Enable content creators to sponsor/promote products
- **Routes:** `src/routes/influencerRoutes.js`, `sponsorshipRoutes.js`
- **Models:** `InfluencerApplication.js`, `SponsorshipTier.js`, `SponsorshipRecord.js`
- **Features:**
  - Influencer application workflow
  - Sponsorship tier offerings
  - Payment processing for tier purchases
  - Content delivery tracking
  - Admin approval workflow

#### 3.10b Raffle System
- **Purpose:** Gamification feature for customer engagement
- **Routes:** `src/routes/raffleRoutes.js`
- **Models:** `RaffleCycle.js`, `RaffleEntry.js`, `RaffleWinner.js`
- **Features:**
  - Raffle cycle management (start/end dates)
  - Entry submissions by customers/affiliates
  - Random winner selection
  - Prize distribution
  - Fraud prevention (duplicate entries)

#### 3.10c Follower Counter System
- **Purpose:** Track influencer follower metrics
- **Routes:** `src/routes/followerRoutes.js`
- **Models:** `Follower.js`
- **Features:**
  - Track follower counts across platforms
  - Historical metrics for analytics
  - Performance benchmarking

#### 3.10d Retail Location Management
- **Purpose:** Manage physical retail locations
- **Routes:** `src/routes/retailLocationRoutes.js`
- **Models:** `RetailLocation.js`
- **Features:**
  - Location listing with addresses
  - Inventory at locations
  - In-store vs online sales tracking

---

## 4. Database Schema

### 4.1 Collections Overview

**12 Main Collections:**

| Model | Purpose | Key Fields | Relationships |
|-------|---------|-----------|----------------|
| **User** | User accounts | name, email, password, role, address, profileImage | → Affiliate (1:1 optional) |
| **Product** | Marketplace items | name, description, price, status, category, images, inventory | ← Cart, Order, ReferralTracking |
| **Category** | Product grouping | name, description, slug, image | ← Product |
| **Cart** | Shopping carts | userId, items[], totalPrice | → User (1:1) |
| **Order** | Completed purchases | userId, items[], status, paymentDetails, affiliateDetails, totalAmount | ← Commission, Referral, RaffleEntry |
| **Commission** | Affiliate earnings | affiliateId, orderId, amount, rate, status | → Affiliate, Order, Payout |
| **Payout** | Payment distributions | affiliateId, commissionIds[], totalAmount, status | ← Commission |
| **Affiliate** | Affiliate accounts | userId, affiliateCode, status, commissionRate, stats | → User (1:1), Commission, Payout |
| **ReferralTracking** | Click analytics | affiliateId, productId, source, timestamp, converted | → Affiliate, Product |
| **InfluencerApplication** | Influencer signup | userId, status, platforms, followerCounts, approvalDate | → User |
| **SponsorshipTier** | Sponsorship offers | name, price, description, benefitList | ← SponsorshipRecord |
| **SponsorshipRecord** | Purchased sponsorships | userId, tierId, stripePaymentId, status, deliveryDate | → User, SponsorshipTier |
| **RaffleCycle** | Raffle campaigns | name, startDate, endDate, prize, maxEntries | ← RaffleEntry, RaffleWinner |
| **RaffleEntry** | Raffle participations | userId, cycleid, orderId, entryDate, status | → User, RaffleCycle, Order |
| **RaffleWinner** | Raffle outcomes | userId, cycleId, prizeId, wonDate, claimedDate | → User, RaffleCycle |
| **Follower** | Influencer metrics | userId, platform, followerCount, timestamp, monthlyGrowth | → User |
| **RetailLocation** | Physical stores | name, address, city, state, zip, inventory, contactInfo | Standalone |

### 4.2 User Model Details

**Fields & Validation:**

```javascript
{
  _id: ObjectId,
  name: String (2-50 chars, required),
  email: String (unique, lowercase, email format, required),
  password: String (6+ chars, bcrypt hashed, required, select:false),
  role: Enum ['customer', 'affiliate', 'admin'] (default: 'customer'),
  
  // Profile
  profileImage: String (Cloudinary URL, optional),
  bio: String (max 500 chars, optional),
  address: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  
  // Account Status
  isEmailVerified: Boolean (default: false),
  isAccountLocked: Boolean (default: false, for security),
  lastLoginAt: Date,
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto)
}
```

**Indexes:**
- `email` - indexed (unique)
- `role` - indexed (for role-based queries)
- `createdAt` - indexed (for sorting)

### 4.3 Product Model Details

```javascript
{
  _id: ObjectId,
  name: String (required, unique),
  description: String (max 2000 chars),
  price: Number (in cents, e.g., 2999 = $29.99),
  status: Enum ['active', 'inactive', 'discontinued'] (default: 'active'),
  sku: String (required, unique, indexed),
  
  // Categorization
  category: ObjectId (ref: Category),
  tags: [String] (for search/filtering),
  
  // Physical Attributes
  images: [String] (Cloudinary URLs),
  variants: [{
    name: String (e.g., 'Color'),
    options: [String] (e.g., ['Red', 'Blue', 'Green'])
  }],
  
  // Inventory
  inventory: {
    sku: String,
    quantity: Number (units in stock),
    reorderLevel: Number (minimum qty threshold)
  },
  
  // Ratings & Reviews
  averageRating: Number (0-5, calculated),
  reviewCount: Number,
  reviews: [ObjectId] (ref: Review, if Review model exists),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `sku` - unique
- `status` - for filtering
- `category` - for category pages
- `name` - text index for search

### 4.4 Order Model Details

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, required),
  
  // Order Items
  items: [{
    productId: ObjectId (ref: Product),
    name: String,
    price: Number (in cents, unit price),
    quantity: Number,
    subtotal: Number (in cents)
  }],
  
  // Shipping
  shippingAddress: {
    name: String,
    email: String,
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String,
    phone: String (optional)
  },
  
  // Payment
  paymentDetails: {
    method: 'stripe' (string),
    stripeSessionId: String (Checkout Session ID),
    stripeIntentId: String (Payment Intent ID),
    cardLast4: String (last 4 digits, optional),
    status: 'succeeded' | 'processing' | 'failed'
  },
  
  // Affiliate Attribution
  affiliateDetails: {
    affiliateId: ObjectId (ref: Affiliate),
    affiliateCode: String,
    affiliateName: String,
    commissionAmount: Number (in cents),
    tier: String
  },
  
  // Totals
  subtotal: Number (in cents),
  shippingCost: Number (in cents, default: 0),
  tax: Number (in cents, calculated based on state),
  totalAmount: Number (in cents),
  
  // Status
  status: Enum ['pending', 'completed', 'failed', 'refunded'] (default: 'pending'),
  statusHistory: [{
    status: String,
    timestamp: Date,
    note: String
  }],
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `userId` - for user order queries
- `status` - for admin filtering
- `createdAt` - for sorting/analytics
- `paymentDetails.stripeIntentId` - for matching webhooks

### 4.5 Affiliate Model Details

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique, required),
  
  // Affiliate Code
  affiliateCode: String (unique, indexed, format: AFF{11 alphanumeric}),
  
  // Account Status
  status: Enum ['pending', 'active', 'suspended', 'inactive'] (default: 'pending'),
  statusChangedAt: Date,
  suspensionReason: String (if suspended),
  
  // Commission
  commissionRate: Number (0-1, default: 0.10 for 10%),
  commissionTier: String (e.g., 'bronze', 'silver', 'gold'),
  
  // Analytics
  totalClicks: Number (default: 0),
  totalReferrals: Number (default: 0),
  totalSales: Number (in cents),
  totalEarnings: Number (in cents),
  conversionRate: Number (calculated: sales/clicks),
  
  // Payout
  bankDetails: {
    accountHolderName: String,
    accountNumber: String (encrypted),
    routingNumber: String (encrypted),
    bankName: String
  },
  paymentFrequency: Enum ['weekly', 'monthly', 'on-demand'] (default: 'monthly'),
  minimumPayoutThreshold: Number (in cents, default: 50000 = $500),
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `affiliateCode` - unique
- `userId` - unique
- `status` - for affiliate management queries
- `totalEarnings` - for leaderboards

### 4.6 Commission Model Details

```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId (ref: Affiliate, required),
  orderId: ObjectId (ref: Order, required),
  
  // Amount Calculation
  amount: Number (in cents, auto-calculated),
  rate: Number (0-1, e.g., 0.10 for 10%),
  baseAmount: Number (order total in cents),
  
  // Tier & Category
  tier: String (e.g., 'bronze', 'silver', 'gold'),
  category: String (optional, for report grouping),
  
  // Status Tracking
  status: Enum ['pending', 'approved', 'paid', 'reversed'] (default: 'pending'),
  statusHistory: [{
    status: String,
    timestamp: Date,
    approvedBy: ObjectId (ref: User, if admin),
    notes: String
  }],
  
  // Payout Link
  payoutId: ObjectId (ref: Payout, optional),
  payoutProcessedAt: Date,
  
  // Notes
  notes: String (admin notes),
  
  // Timestamps
  createdAt: Date (auto, when order completes),
  updatedAt: Date
}
```

**Indexes:**
- `affiliateId` - for affiliate commission queries
- `orderId` - for order-commission lookup
- `status` - for approval workflows
- `createdAt` - for date range analytics

### 4.7 Payout Model Details

```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId (ref: Affiliate, required),
  commissionIds: [ObjectId] (ref: Commission),
  
  // Amount
  totalAmount: Number (in cents, aggregated commissions),
  feesDeducted: Number (in cents, if any),
  netAmount: Number (in cents, total - fees),
  
  // Payment Details
  paymentMethod: Enum ['bank_transfer', 'stripe_connect', 'paypal'],
  bankDetails: {
    accountHolderName: String,
    accountNumber: String (encrypted),
    routingNumber: String (encrypted),
    bankName: String
  },
  stripeConnectPayoutId: String (if using Stripe),
  paypalTransactionId: String (if using PayPal),
  
  // Status & Dates
  status: Enum ['pending', 'approved', 'processing', 'paid', 'failed'] (default: 'pending'),
  requestedAt: Date (when affiliate requested),
  approvedAt: Date,
  processedAt: Date,
  paidAt: Date,
  failedAt: Date,
  failureReason: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Indexes:**
- `affiliateId` - for payout history
- `status` - for admin processing queue
- `requestedAt` - for timeline queries

### 4.8 ReferralTracking Model Details

```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId (ref: Affiliate, required),
  
  // Click Source
  source: Enum ['url_param', 'cookie', 'direct_link'],
  referralCode: String (AFF code used),
  
  // Optional Product
  productId: ObjectId (ref: Product, optional),
  
  // Click Info
  ipAddress: String (for analytics),
  userAgent: String (device info),
  clickedAt: Date (auto, timestamp),
  
  // Conversion
  converted: Boolean (default: false),
  orderId: ObjectId (ref: Order, if purchase resulted),
  conversionAmount: Number (in cents, if converted),
  
  // Timestamps
  createdAt: Date,
  expiredAt: Date (30 days from creation)
}
```

**Indexes:**
- `affiliateId` - for affiliate click metrics
- `clickedAt` - for time-based analytics
- `converted` - for conversion rate calculations
- `sphére_referral_code` (cookie name for client-side)

### 4.9 Relationship Diagram

```
User (1) ──── (1) Affiliate
           ├── (N) Order
           ├── (N) Commission
           ├── (N) Payout
           ├── (N) RaffleEntry
           ├── (N) InfluencerApplication
           ├── (N) SponsorshipRecord
           └── (N) Follower

Product (1) ──── (N) CartItem
         ├── (N) OrderItem
         ├── (N) ReferralTracking
         └── (1) Category

Order (1) ──── (N) Commission
              └── (1) Affiliate [via affiliateDetails]

Commission (1) ──── (1) Payout
              ├── (1) Affiliate
              └── (1) Order

Affiliate (1) ──── (N) Commission
            ├── (N) Payout
            ├── (N) ReferralTracking
            └── (1) User
```

---

## 5. API Structure

### 5.1 Base Configuration

**API Prefix:** `/api/v1` (from `src/config/environment.js`)

**Base URL:** Environment-dependent:
- Backend runs on port 5000 (default): `http://localhost:5000`
- Frontend at port 3000 accesses via `NEXT_PUBLIC_API_URL`

**Response Format (Standard):**
```javascript
{
  success: boolean,
  message: string,
  data: any, // or array
  errors: {} // only on validation failure (status 400)
}
```

**HTTP Status Codes:**
- `200` - Success (GET, POST, PUT, DELETE)
- `201` - Created (POST)
- `400` - Validation error (invalid input)
- `401` - Unauthorized (missing/invalid token)
- `403` - Forbidden (role check failed)
- `404` - Not found (resource doesn't exist)
- `429` - Too many requests (rate limited)
- `500` - Server error

### 5.2 Route Organization

**17 Route Files (from `src/routes/`):**

| Route File | Path | Purpose | Main Endpoints |
|-----------|------|---------|----------------|
| authRoutes.js | `/api/v1/auth` | Authentication | /register, /login, /refresh, /password-reset |
| productRoutes.js | `/api/v1/products` | Product CRUD | GET/POST/PUT/DELETE /:id |
| categoryRoutes.js | `/api/v1/categories` | Category management | GET/:id, POST (admin) |
| cartRoutes.js | `/api/v1/cart` | Shopping cart | /add, /update, /remove, /clear |
| checkoutRoutes.js | `/api/v1/checkout` | Payment sessions | /session, /webhook, /refund |
| orderRoutes.js | `/api/v1/orders` | Order management | GET /:id, GET /admin/all |
| affiliateRoutes.js | `/api/v1/affiliates` | Affiliate accounts | /apply, /profile, /admin/:id/approve |
| commissionRoutes.js | `/api/v1/commissions` | Commission tracking | GET /:id, /admin/:id/approve |
| payoutRoutes.js | `/api/v1/payouts` | Payout management | /request, /admin/:id/approve |
| referralTrackingRoutes.js | `/api/v1/referral-tracking` | Clicks tracking | GET /stats, /admin/analytics |
| influencerRoutes.js | `/api/v1/influencers` | Influencer applications | /apply, /content-link, /admin/list |
| sponsorshipRoutes.js | `/api/v1/sponsorships` | Sponsorships | /tiers, /purchase, /my-sponsorships |
| raffleRoutes.js | `/api/v1/raffles` | Raffle system | /cycles, /enter, /winners |
| followerRoutes.js | `/api/v1/followers` | Follower tracking | /track, /history/:userId |
| retailLocationRoutes.js | `/api/v1/retail-locations` | Retail stores | GET /:id, POST (admin) |
| adminRoutes.js | `/api/v1/admin` | Admin operations | /dashboard, /analytics, /system/settings |
| fileUploadRoutes.js | `/api/v1/upload` | File uploads | /image, /document |

### 5.3 Authentication

**Auth Middleware:**
- **Location:** `src/middlewares/authMiddleware.js`
- **Functions:**
  - `authenticateToken(req, res, next)` - Verifies JWT access token
  - `authenticateRefreshToken(req, res, next)` - Verifies refresh token

**How it Works:**
1. Frontend sends `Authorization: Bearer {accessToken}` header
2. Middleware extracts and verifies token using JWT secret
3. Decodes token to get: `{ userId, role, type }`
4. Attaches `req.user` object to request
5. Next handler receives authenticated user info

**Token Format:**
```javascript
{
  userId: ObjectId,
  role: 'customer' | 'affiliate' | 'admin',
  type: 'access' | 'refresh',
  iat: timestamp,
  exp: timestamp
}
```

**Protected Route Pattern:**
```javascript
router.get('/profile', authenticateToken, authorize('affiliate'), affiliateController.getProfile);
// Token required AND role must be 'affiliate'
```

### 5.4 Error Handling

**Global Error Handler:**
- **Location:** `src/middlewares/errorHandler.js`
- **Pattern:** Try-catch in controllers → `next(error)`
- **Catches:** All unhandled errors and validation errors
- **Response:**
```javascript
{
  success: false,
  message: error.message,
  errors: error.details (optional)
}
```

**Custom Error Classes:**
- **Location:** `src/utils/errors.js`
- Types: `ValidationError`, `AuthenticationError`, `AuthorizationError`, `NotFoundError`, `ServerError`

### 5.5 Request Validation

**Validation Pattern:**
```javascript
const { valid, data, errors } = validate(schema)(req.body);
if (!valid) {
  return res.status(400).json({ success: false, message: 'Validation failed', errors });
}
```

**Validation Files:**
- `src/validators/authValidator.js` - Auth request schemas
- `src/validators/productValidator.js` - Product CRUD schemas
- `src/validators/cartValidator.js` - Cart operation schemas
- `src/validators/orderValidator.js` - Order schemas
- `src/validators/affiliateValidator.js` - Affiliate schemas
- `src/validators/commissionValidator.js` - Commission schemas
- `src/validators/payoutValidator.js` - Payout schemas
- `src/validators/adminValidator.js` - Admin operation schemas

**Validation Rules Examples:**
- Email: lowercase, valid format
- Passwords: min 6 characters
- Affiliate Code: format with regex `AFF[A-Z0-9]{11}`
- Amounts: positive numbers (in cents)
- Enums: valid status values only

### 5.6 Security Features

**Rate Limiting:**
- **Global Limiter:** 100 requests per 15 minutes per IP
- **Auth Limiter:** 5 login attempts per 15 minutes
- **Password Reset Limiter:** 3 resets per 24 hours
- **Affiliate Signup:** 10 applications per day
- **Checkout Limiter:** Prevents abuse of payment sessions
- **Admin Limiter:** Stricter limits on admin operations

**Location:** `src/middlewares/securityMiddleware.js`

**IP Blocking:**
- Tracks suspicious activity
- Auto-blocks IPs after multiple failed attempts
- Admin can manually block/unblock IPs

**Security Headers (Helmet):**
- XSS Protection
- Clickjacking protection
- CSRF protection
- Content Security Policy

**Other Security:**
- CORS validation (allowed origins)
- MongoDB sanitization (prevents injection)
- Content-Type validation
- Request body size limits

### 5.7 Key Endpoint Examples

**Authentication:**
```
POST /api/v1/auth/register
  { name, email, password, role? }
  → { user, accessToken, refreshToken }

POST /api/v1/auth/login
  { email, password }
  → { user, accessToken, refreshToken }

POST /api/v1/auth/refresh
  { refreshToken }
  → { accessToken }
```

**Products:**
```
GET /api/v1/products?page=1&limit=20&status=active
  → { data: [products...], total, pages }

GET /api/v1/products/:id
  → { data: product }

POST /api/v1/products [ADMIN]
  FormData: { name, description, price, sku, images[], variants }
  → { data: newProduct }
```

**Cart:**
```
GET /api/v1/cart [AUTH]
  → { data: { items: [...], totalPrice } }

POST /api/v1/cart/add [AUTH]
  { productId, quantity }
  → { data: updatedCart }

POST /api/v1/cart/remove [AUTH]
  { productId }
  → { data: updatedCart }
```

**Checkout:**
```
POST /api/v1/checkout/session [AUTH]
  { shippingAddress, items? }
  → { data: { sessionId, sessionUrl } }
  [Redirects to Stripe]

POST /api/v1/checkout/webhook [PUBLIC]
  Stripe event (raw body)
  → { received: true }
```

**Orders:**
```
GET /api/v1/orders [AUTH - CUSTOMER]
  → { data: [userOrders...] }

GET /api/v1/orders/admin/all [ADMIN]
  → { data: [allOrders...], analytics }

GET /api/v1/orders/:id [AUTH - OWNER OR ADMIN]
  → { data: order }
```

**Affiliates:**
```
POST /api/v1/affiliates/apply [AUTH - CUSTOMER]
  { bankDetails?, paymentFrequency? }
  → { data: affiliateApplication }

GET /api/v1/affiliates/profile [AUTH - AFFILIATE]
  → { data: { code, stats, earnings } }

POST /api/v1/affiliates/admin/:id/approve [ADMIN]
  { commissionRate }
  → { data: updatedAffiliate }
```

**Commissions:**
```
GET /api/v1/commissions [AUTH - AFFILIATE]
  → { data: [affiliateCommissions...] }

POST /api/v1/commissions/admin/:id/approve [ADMIN]
  { notes? }
  → { data: approvedCommission }
```

**Payouts:**
```
POST /api/v1/payouts/request [AUTH - AFFILIATE]
  { amount? }
  → { data: payoutRequest }

GET /api/v1/payouts/admin/all [ADMIN]
  → { data: [payouts...], awaiting: number }

POST /api/v1/payouts/admin/:id/process [ADMIN]
  { bankDetails }
  → { data: processedPayout }
```

---

## 6. Frontend Architecture

### 6.1 Project Structure

**Location:** `FRONTEND_AUTH_IMPLEMENTATION/src`

**Main Directories:**

```
src/
├── app/                          # Next.js app router (file-based routes)
│   ├── (admin)/                  # Admin dashboard group
│   │   └── admin/
│   │       ├── dashboard/        # Analytics overview
│   │       ├── products/         # Product management
│   │       ├── orders/           # Order management
│   │       ├── commissions/      # Commission approvals
│   │       ├── payouts/          # Payout processing
│   │       └── affiliates/       # Affiliate management
│   ├── (affiliate)/              # Affiliate routes group
│   │   └── affiliate/
│   │       ├── dashboard/        # Affiliate overview
│   │       ├── referrals/
│   │       │   ├── sales/        # Sales tracking
│   │       │   └── clicks/       # Click analytics
│   │       ├── commissions/      # Commission history
│   │       ├── payouts/          # Payout requests
│   │       └── profile/          # Profile settings
│   ├── (app)/                    # Customer app group
│   │   ├── shop/                 # Product listing
│   │   ├── product/[id]/         # Product detail
│   │   ├── cart/                 # Shopping cart
│   │   ├── checkout/             # Payment page
│   │   ├── orders/               # Order history
│   │   └── profile/              # Customer profile
│   ├── (auth)/                   # Authentication routes
│   │   ├── login/                # Login page
│   │   ├── register/             # Registration
│   │   └── password-reset/       # Password reset
│   ├── influencer/               # Influencer routes
│   │   ├── apply/                # Influencer application
│   │   └── dashboard/            # Influencer dashboard
│   ├── raffle/                   # Raffle routes
│   │   └── [id]/                 # Raffle detail
│   ├── sponsorship/              # Sponsorship routes
│   │   ├── tiers/                # Available sponsorships
│   │   └── my-sponsorships/      # User sponsorships
│   ├── layout.jsx                # Root layout
│   ├── page.jsx                  # Landing page
│   └── providers.jsx             # Context/provider setup
│
├── sections/                     # Landing page sections
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── ValueProp.jsx
│   ├── HowItWorks.jsx
│   ├── FeaturesShowcase.jsx
│   ├── RaffleSection.jsx
│   ├── FollowersSection.jsx
│   ├── InfluencerShowcase.jsx
│   ├── SponsorshipShowcase.jsx
│   ├── SocialProof.jsx
│   ├── TrustSecurity.jsx
│   ├── DualCTA.jsx
│   ├── FAQ.jsx
│   ├── FinalCTA.jsx
│   └── Footer.jsx
│
├── components/                   # Reusable components
│   ├── admin/                    # Admin-specific components
│   │   ├── ProductManagement.jsx
│   │   ├── OrderList.jsx
│   │   ├── CommissionApproval.jsx
│   │   ├── PayoutProcessing.jsx
│   │   └── AffiliateApproval.jsx
│   ├── affiliate/                # Affiliate components
│   │   ├── ReferralLink.jsx
│   │   ├── SalesChart.jsx
│   │   ├── CommissionHistory.jsx
│   │   └── PayoutRequest.jsx
│   ├── auth/                     # Auth components
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── PasswordResetForm.jsx
│   ├── cart/                     # Shopping cart
│   │   ├── CartSummary.jsx
│   │   ├── CartItems.jsx
│   │   └── CartActions.jsx
│   ├── checkout/                 # Payment components
│   │   ├── ShippingForm.jsx
│   │   ├── OrderReview.jsx
│   │   └── PaymentButton.jsx
│   ├── products/                 # Product components
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetail.jsx
│   ├── orders/                   # Order components
│   │   ├── OrderList.jsx
│   │   └── OrderDetail.jsx
│   ├── commissions/              # Commission components
│   │   ├── CommissionList.jsx
│   │   └── CommissionDetail.jsx
│   ├── payouts/                  # Payout components
│   │   ├── PayoutList.jsx
│   │   ├── PayoutForm.jsx
│   │   └── PayoutStatus.jsx
│   ├── common/                   # Shared components
│   │   ├── Header.jsx
│   │   ├── Footer.jsx
│   │   ├── Navigation.jsx
│   │   ├── Sidebar.jsx
│   │   ├── Loading.jsx
│   │   └── ErrorBoundary.jsx
│   ├── layout/                   # Layout components
│   │   └── Dashboard.jsx
│   ├── ui/                       # UI elements
│   │   ├── Button.jsx
│   │   ├── Modal.jsx
│   │   ├── Card.jsx
│   │   └── Badge.jsx
│   ├── sections/                 # Page sections
│   │   ├── InfluencerShowcase.jsx
│   │   └── SponsorshipShowcase.jsx
│   └── ProtectedRoute.jsx        # Route protection
│
├── api/                          # API integration layer
│   ├── client.js                 # Axios instance with interceptors
│   ├── config/                   # API configuration
│   │   └── index.js              # API_CONFIG constants
│   ├── hooks/                    # React Query hooks
│   │   ├── useAuth.js            # Authentication hooks
│   │   ├── useProducts.js        # Product queries
│   │   ├── useCart.js            # Cart mutations
│   │   ├── useOrders.js          # Order queries
│   │   ├── useAffiliates.js      # Affiliate queries
│   │   ├── useCommissions.js     # Commission hooks
│   │   ├── usePayouts.js         # Payout hooks
│   │   ├── useAdmin.js           # Admin hooks
│   │   ├── useInfluencer.js      # Influencer hooks
│   │   └── useSponsorship.js     # Sponsorship hooks
│   └── services/                 # API service functions
│       ├── authService.js        # Auth API calls
│       ├── productService.js     # Product API calls
│       ├── cartService.js        # Cart API calls
│       ├── checkoutService.js    # Checkout API calls
│       ├── orderService.js       # Order API calls
│       ├── affiliateService.js   # Affiliate API calls
│       ├── commissionService.js  # Commission API calls
│       ├── payoutService.js      # Payout API calls
│       ├── adminService.js       # Admin API calls
│       ├── influencerService.js  # Influencer API calls
│       └── sponsorshipService.js # Sponsorship API calls
│
├── hooks/                        # Custom React hooks
│   ├── useAuthContext.js
│   ├── usePageTitle.js
│   └── ...
│
├── contexts/                     # React Context
│   ├── AuthContext.jsx           # Auth state
│   └── ...
│
├── stores/                       # State management
│   └── ... (Zustand or similar)
│
├── utils/                        # Utility functions
│   ├── tokenManager.js           # JWT token handling
│   ├── validation.js             # Form validation
│   ├── formatting.js             # Number/date formatting
│   ├── commissionUtils.js        # Commission calculations
│   ├── payoutUtils.js            # Payout utilities
│   ├── adminUtils.js             # Admin utilities
│   ├── referralUtils.js          # Referral utilities
│   └── ...
│
├── styles/                       # Global styles
│   ├── globals.css               # Global styles
│   ├── variables.css             # CSS variables
│   └── ...
│
├── lib/                          # Custom utilities
│   └── ...
│
├── validations/                  # Validation schemas
│   └── ... (Zod or Joi)
│
├── App.css                       # App-level styles
├── index.css                     # Index styles
├── next.config.mjs               # Next.js configuration
└── jsconfig.json                 # JavaScript configuration
```

### 6.2 Page Structure

**Landing Page (`src/app/page.jsx`):**
- Component-based sections approach
- Renders 15 sections in sequence
- No database calls (static content)
- Optimized for SEO with proper heading hierarchy

**Protected Routes Pattern:**
```javascript
// Example: /affiliate/dashboard
// Wraps pages with ProtectedRoute component
// Checks: hasValidToken && userRole === 'affiliate'
// Redirects to /login if not authenticated
```

**Dynamic Routes:**
- `[id]` syntax for product/:id, order/:id, etc.
- Fetch data on page load via useQuery hooks
- Show loading state while fetching
- Handle 404 if resource not found

### 6.3 API Client Architecture

**Axios Client Instance (`src/api/client.js`):**

```javascript
// Features:
- Base URL: process.env.NEXT_PUBLIC_API_URL
- Request Interceptor:
  • Auto-inject Authorization header
  • Detect FormData vs JSON
- Response Interceptor:
  • Handle 401 (token expired)
  • Automatically refresh token
  • Queue requests while refreshing
- Error Handling:
  • Extract error message from response
  • Standardized error format
```

**Service Layer Pattern (`src/api/services/*.js`):**

```javascript
// Each service file:
- Uses client.get/post/put/delete
- Wraps with try-catch
- Returns { success, data, error }
- Handles FormData for file uploads

Example:
const productService = {
  getProducts: async (page, limit) => {
    try {
      const response = await client.get('/products', {
        params: { page, limit }
      });
      return { success: true, data: response.data };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
};
```

**Hook Pattern (`src/api/hooks/*.js`):**

```javascript
// React Query pattern:
- useQuery for fetching
- useMutation for mutations
- Query keys: ['products'], ['product', id]
- Stale time: 5-10 minutes (varies by hook)
- Automatic cache invalidation on mutation

Example:
export const useProducts = (page = 1, limit = 20) => {
  const { data, isLoading, error } = useQuery(
    ['products', page, limit],
    () => productService.getProducts(page, limit),
    { staleTime: 5 * 60 * 1000 }
  );
  return { products: data?.data, isLoading, error };
};
```

### 6.4 State Management

**Authentication State:**
- Context: `AuthContext` (likely in `contexts/AuthContext.jsx`)
- Stores: user object, tokens, isLoggedIn flag
- Persists to localStorage via tokenManager

**Data State:**
- React Query handles server state (products, orders, etc.)
- Local component state for forms
- Zustand or Context for global UI state

**Token Management (`src/utils/tokenManager.js`):**
```javascript
- getAccessToken() - Retrieve from localStorage
- setAccessToken(token) - Store in localStorage
- getRefreshToken() - Retrieve refresh token
- setRefreshToken(token) - Store refresh token
- removeTokens() - Clear on logout
```

### 6.5 Component Examples

**Product Card Component:**
- Displays product image, name, price
- Add to cart button
- Link to detail page
- Loading state with skeleton

**Affiliate Dashboard:**
- Overview metrics (clicks, sales, earnings)
- Referral link copy button
- Charts: sales over time, earnings breakdown
- Action buttons: request payout, view analytics

**Admin Commission Table:**
- Paginated list of pending commissions
- Columns: affiliate name, amount, order date, status
- Approve/Reject buttons
- Bulk approval option

**Checkout Form:**
- Personal info (pre-filled from user)
- Shipping address form
- Order review
- Stripe payment button
- Error handling and validation

### 6.6 Form Handling

**Pattern (Controlled Components):**
```javascript
- useState for each field
- onChange handlers to update state
- onSubmit validation
- Error messages display below fields
- Loading state while submitting
- Success notification on completion
```

**Validation:**
- Client-side validation (instant feedback)
- Form libraries: React Hook Form or Formik (likely React Hook Form)
- Validation schemas: Zod or Joi
- Server-side validation (backend returns errors)

### 6.7 Environment Configuration

**`.env.local` Variables:**
- `NEXT_PUBLIC_API_URL` - Backend API base URL
- Other public variables prefixed with `NEXT_PUBLIC_`

**Build & Development:**
```bash
npm install             # Install dependencies
npm run dev             # Start dev server (port 3000)
npm run build           # Production build
npm start               # Production server
```

### 6.8 UI/UX Features

**Responsive Design:**
- Mobile-first approach
- Tailwind CSS for styling
- Grid/flex layouts
- Media queries for breakpoints

**Accessibility:**
- Semantic HTML
- ARIA labels where needed
- Keyboard navigation
- Color contrast compliance

**Error Handling:**
- Error boundaries for crashed components
- User-friendly error messages
- Retry mechanisms
- Toast notifications for alerts

**Performance:**
- Code splitting via Next.js
- Image optimization
- Lazy loading
- React Query caching

---

## 7. Current Implementation Status

### 7.1 Completed Features ✅

**Backend (Production Ready):**
- ✅ Complete authentication system (register, login, refresh, password reset)
- ✅ Product catalog CRUD operations
- ✅ Shopping cart management
- ✅ Stripe payment integration with webhooks
- ✅ Order processing and tracking
- ✅ Affiliate system (registration, approval, code generation)
- ✅ Commission calculation engine (automatic on order completion)
- ✅ Payout system (request, approval, processing)
- ✅ Referral tracking and click analytics
- ✅ Admin dashboard and moderation tools
- ✅ Security features (rate limiting, IP blocking, fraud detection)
- ✅ Database migration and schema optimization
- ✅ Error handling and validation
- ✅ Category management
- ✅ Influencer application system
- ✅ Sponsorship tier system
- ✅ Raffle system (cycles, entries, winners)
- ✅ Follower tracking metrics
- ✅ Retail location management

**Frontend (Complete):**
- ✅ Landing page with 15 sections
- ✅ Authentication UI (login, register, password reset)
- ✅ Customer dashboard and order history
- ✅ Product browsing and filtering
- ✅ Shopping cart UI
- ✅ Checkout page with Stripe integration
- ✅ Affiliate dashboard with analytics
- ✅ Commission tracking page
- ✅ Payout request system
- ✅ Admin product management
- ✅ Admin order management
- ✅ Admin affiliate approval workflow
- ✅ Admin commission approval
- ✅ Admin payout processing
- ✅ Influencer application form
- ✅ Sponsorship tier showcase
- ✅ Sponsorship purchase flow
- ✅ Raffle entry interface
- ✅ Mobile-responsive design
- ✅ Protected route system

### 7.2 Recent Fixes & Improvements

**Major Issues Resolved:**
1. ✅ Affiliate sales attribution - Fixed affiliateId passing through checkout
2. ✅ Commission calculation - Automatic on order completion
3. ✅ Frontend data access - Corrected nested data paths
4. ✅ Rate limiting - Tuned for /me endpoint and affiliate endpoints
5. ✅ Token management - Standardized across frontend services
6. ✅ Product status validation - Changed from .active() to status field
7. ✅ ObjectId conversion - Fixed regex validation for ObjectIds
8. ✅ Shipping data persistence - Proper address handling in orders
9. ✅ Currency handling - Consistent cents/dollars conversion
10. ✅ Webhook verification - Properly positioned before body parsing

**Performance Improvements:**
- React Query cache optimization
- Pagination for large datasets
- Lazy loading for components
- Image optimization via Cloudinary

### 7.3 In-Progress Work

**Potential Areas (Based on Documentation):**
- Advanced analytics features
- Email notification system (order confirmations, payouts)
- Mobile app considerations
- Additional payment methods (PayPal, etc.)
- Batch operations (admin)
- Custom reporting dashboards

### 7.4 Known Limitations & Considerations

**Technical Debt:**
- Some validation might need standardization (Joi vs Zod)
- Email service integration notes in various docs (implement as needed)
- Some scripts in root for testing/debugging (can be organized into `/scripts`)

**Security Considerations:**
- Bank details encrypted (implementation present)
- CORS properly configured
- Rate limiting tuned
- Fraud detection middleware active

**Database:**
- MongoDB Atlas recommended for production
- Indexes optimized for common queries
- Referential integrity via ObjectIds

**API Limits:**
- Currently single-region deployment
- Could benefit from CDN for static assets
- Webhook retry logic handled by Stripe

### 7.5 Deployment Status

**Backend Deployment:**
- Render.com ready (has configuration)
- Environment variables properly configured
- Database connection with retry logic
- Webhook URL will differ per environment

**Frontend Deployment:**
- Vercel ready (Next.js optimized)
- Environment variables for API URL
- Static site generation where possible
- Automatic deployments on push

**Live Considerations:**
- Stripe live keys required
- MongoDB Atlas production instance
- Email service configuration
- Rate limiting tuning for real traffic
- Monitoring/logging setup

---

## 8. Key File Locations

### 8.1 Critical Backend Files

**Configuration:**
- [src/server.js](src/server.js) - Main Express app initialization
- [src/config/database.js](src/config/database.js) - MongoDB connection
- [src/config/environment.js](src/config/environment.js) - Environment variables
- [src/config/stripe.js](src/config/stripe.js) - Stripe SDK setup

**Models (Database Schemas):**
- [src/models/User.js](src/models/User.js) - User schema (3 roles)
- [src/models/Product.js](src/models/Product.js) - Product catalog
- [src/models/Category.js](src/models/Category.js) - Product categories
- [src/models/Cart.js](src/models/Cart.js) - Shopping carts
- [src/models/Order.js](src/models/Order.js) - Completed orders
- [src/models/Affiliate.js](src/models/Affiliate.js) - Affiliate accounts
- [src/models/Commission.js](src/models/Commission.js) - Commissions
- [src/models/Payout.js](src/models/Payout.js) - Payouts
- [src/models/ReferralTracking.js](src/models/ReferralTracking.js) - Click tracking
- [src/models/InfluencerApplication.js](src/models/InfluencerApplication.js) - Influencer signup
- [src/models/SponsorshipTier.js](src/models/SponsorshipTier.js) - Sponsorship offerings
- [src/models/SponsorshipRecord.js](src/models/SponsorshipRecord.js) - Purchased sponsorships
- [src/models/RaffleCycle.js](src/models/RaffleCycle.js) - Raffle campaigns
- [src/models/RaffleEntry.js](src/models/RaffleEntry.js) - Raffle participations
- [src/models/RaffleWinner.js](src/models/RaffleWinner.js) - Raffle outcomes
- [src/models/Follower.js](src/models/Follower.js) - Influencer metrics

**Controllers (Request Handlers):**
- [src/controllers/authController.js](src/controllers/authController.js)
- [src/controllers/productController.js](src/controllers/productController.js)
- [src/controllers/cartController.js](src/controllers/cartController.js)
- [src/controllers/checkoutController.js](src/controllers/checkoutController.js)
- [src/controllers/orderController.js](src/controllers/orderController.js)
- [src/controllers/affiliateController.js](src/controllers/affiliateController.js)
- [src/controllers/commissionController.js](src/controllers/commissionController.js)
- [src/controllers/payoutController.js](src/controllers/payoutController.js)
- [src/controllers/adminController.js](src/controllers/adminController.js)

**Services (Business Logic):**
- [src/services/authService.js](src/services/authService.js)
- [src/services/productService.js](src/services/productService.js)
- [src/services/cartService.js](src/services/cartService.js)
- [src/services/checkoutService.js](src/services/checkoutService.js)
- [src/services/orderService.js](src/services/orderService.js)
- [src/services/affiliateService.js](src/services/affiliateService.js)
- [src/services/commissionService.js](src/services/commissionService.js)
- [src/services/payoutService.js](src/services/payoutService.js)
- [src/services/adminService.js](src/services/adminService.js)

**Middleware:**
- [src/middlewares/authMiddleware.js](src/middlewares/authMiddleware.js) - JWT verification
- [src/middlewares/roleMiddleware.js](src/middlewares/roleMiddleware.js) - Role authorization
- [src/middlewares/securityMiddleware.js](src/middlewares/securityMiddleware.js) - Rate limiting, IP blocking
- [src/middlewares/fraudDetectionMiddleware.js](src/middlewares/fraudDetectionMiddleware.js) - Fraud prevention
- [src/middlewares/referralMiddleware.js](src/middlewares/referralMiddleware.js) - Affiliate attribution
- [src/middlewares/errorHandler.js](src/middlewares/errorHandler.js) - Global error handling
- [src/middlewares/requestMetadata.js](src/middlewares/requestMetadata.js) - Request tracking

**Utilities:**
- [src/utils/jwtUtils.js](src/utils/jwtUtils.js) - Token generation/verification
- [src/utils/passwordUtils.js](src/utils/passwordUtils.js) - Password hashing/reset
- [src/utils/cloudinaryUpload.js](src/utils/cloudinaryUpload.js) - Image uploads
- [src/utils/errors.js](src/utils/errors.js) - Custom error classes
- [src/utils/fraudDetection.js](src/utils/fraudDetection.js) - Fraud algorithms

**Webhook & Integration:**
- [src/webhooks/stripeWebhook.js](src/webhooks/stripeWebhook.js) - Stripe webhook handler

### 8.2 Critical Frontend Files

**Configuration:**
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/client.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/client.js) - Axios setup
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/config/index.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/config/index.js) - API constants
- [FRONTEND_AUTH_IMPLEMENTATION/.env.local](.env.local) - Environment variables

**Pages:**
- [FRONTEND_AUTH_IMPLEMENTATION/src/app/page.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/app/page.jsx) - Landing page
- [FRONTEND_AUTH_IMPLEMENTATION/src/app/(auth)/login/page.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/app/(auth)/login/page.jsx)
- [FRONTEND_AUTH_IMPLEMENTATION/src/app/(app)/shop/page.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/app/(app)/shop/page.jsx)
- [FRONTEND_AUTH_IMPLEMENTATION/src/app/(app)/cart/page.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/app/(app)/cart/page.jsx)
- [FRONTEND_AUTH_IMPLEMENTATION/src/app/(app)/checkout/page.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/app/(app)/checkout/page.jsx)
- [FRONTEND_AUTH_IMPLEMENTATION/src/app/(affiliate)/affiliate/dashboard/page.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/app/(affiliate)/affiliate/dashboard/page.jsx)

**Services:**
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/services/authService.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/authService.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/services/productService.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/productService.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/services/affiliateService.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/affiliateService.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/services/commissionService.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/commissionService.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/services/payoutService.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/payoutService.js)

**Hooks:**
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useAuth.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useAuth.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useProducts.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useProducts.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useCart.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useCart.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useAffiliates.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useAffiliates.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useOrders.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useOrders.js)

**Utilities:**
- [FRONTEND_AUTH_IMPLEMENTATION/src/utils/tokenManager.js](FRONTEND_AUTH_IMPLEMENTATION/src/utils/tokenManager.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/utils/validation.js](FRONTEND_AUTH_IMPLEMENTATION/src/utils/validation.js)
- [FRONTEND_AUTH_IMPLEMENTATION/src/utils/formatting.js](FRONTEND_AUTH_IMPLEMENTATION/src/utils/formatting.js)

### 8.3 Documentation Files

**Architecture & Setup:**
- [Readme.md](Readme.md) - Project overview
- [IMPLEMENTATION_GUIDE.md](IMPLEMENTATION_GUIDE.md) - Complete implementation docs
- [PROJECT_COMPLETION_SUMMARY.md](PROJECT_COMPLETION_SUMMARY.md) - Status summary

**Feature Guides:**
- [AFFILIATE_SYSTEM_README.md](AFFILIATE_SYSTEM_README.md) - Affiliate system details
- [PRODUCT_SYSTEM_README.md](PRODUCT_SYSTEM_README.md) - Product system
- [CHECKOUT_SYSTEM_README.md](CHECKOUT_SYSTEM_README.md) - Checkout flow
- [ORDER_SYSTEM_README.md](ORDER_SYSTEM_README.md) - Order management
- [CART_SYSTEM_README.md](CART_SYSTEM_README.md) - Shopping cart

**Deployment & Operations:**
- [DEPLOYMENT_RENDER_VERCEL_GUIDE.md](DEPLOYMENT_RENDER_VERCEL_GUIDE.md)
- [QUICK_DEPLOY_RENDER_VERCEL.md](QUICK_DEPLOY_RENDER_VERCEL.md)
- [STRIPE_LIVE_SETUP_GUIDE.md](STRIPE_LIVE_SETUP_GUIDE.md)

**Testing & Debugging:**
- [COMPLETE_WORKFLOW_TESTING_GUIDE.md](COMPLETE_WORKFLOW_TESTING_GUIDE.md)
- [AFFILIATE_TESTING_GUIDE.md](AFFILIATE_TESTING_GUIDE.md)
- [Postman Collections](Spherekings-API-Collection.postman_collection.json)

### 8.4 Configuration Files

**Root Level:**
- [package.json](package.json) - Backend dependencies and scripts
- [.env](/.env) - Backend environment variables
- [.env.example](/.env.example) - Environment template
- [.gitignore](.gitignore) - Git ignore rules
- [render.yaml](render.yaml) - Render.com deployment config

**Frontend:**
- [FRONTEND_AUTH_IMPLEMENTATION/package.json](FRONTEND_AUTH_IMPLEMENTATION/package.json)
- [FRONTEND_AUTH_IMPLEMENTATION/.env.local](FRONTEND_AUTH_IMPLEMENTATION/.env.local)
- [FRONTEND_AUTH_IMPLEMENTATION/next.config.mjs](FRONTEND_AUTH_IMPLEMENTATION/next.config.mjs)
- [FRONTEND_AUTH_IMPLEMENTATION/jsconfig.json](FRONTEND_AUTH_IMPLEMENTATION/jsconfig.json)

---

## 9. Summary & Insights

### Key Takeaways

1. **Modular Architecture:** Well-organized backend with clear separation of concerns (models, controllers, services)
2. **Complete Feature Set:** All core e-commerce and affiliate functionality implemented
3. **Security-First:** Multiple layers of security (JWT, rate limiting, fraud detection, encryption)
4. **Production-Ready:** Both backend and frontend are deployment-ready
5. **Scalable Design:** Database indexes, pagination, and caching strategies in place
6. **Rich API:** 17+ route files covering all business requirements
7. **Advanced Features:** Beyond basic marketplace - raffle system, influencer sponsorships, referral tracking
8. **Well-Documented:** Extensive guides for deployment, testing, and troubleshooting

### Next Steps (If Continuing Development)

1. **Email Integration** - Set up transactional emails for orders, payouts, etc.
2. **Analytics Dashboard** - Enhanced metrics and reporting
3. **Monitoring & Logging** - Production observability setup
4. **Performance Optimization** - CDN, caching layers, database query optimization
5. **Mobile App** - React Native version of frontend
6. **API Documentation** - Swagger/OpenAPI spec generation
7. **Automated Testing** - Unit and integration tests for critical paths
8. **Multi-Currency Support** - If expanding internationally
9. **Advanced Fraud Detection** - ML-based pattern analysis
10. **Custom Reports** - Admin-generated reports for business intelligence

---

**End of Comprehensive Analysis**

*For specific questions about implementation details, file locations, or feature behavior, refer to the sections above or investigate the actual source files.*
