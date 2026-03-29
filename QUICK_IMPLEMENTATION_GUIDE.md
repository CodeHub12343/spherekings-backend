# SphereKings - Quick Implementation Reference

## Project Architecture at a Glance

```
FULL-STACK MARKETPLACE
│
├─ BACKEND (Node.js + Express)
│  ├─ 8 Models (User, Product, Cart, Order, Commission, Affiliate, Payout, ReferralTracking)
│  ├─ 11 API Routes (/api/v1/...)
│  ├─ JWT Auth + 3-Role System (customer|affiliate|admin)
│  ├─ Stripe Payment Processing
│  └─ MongoDB Storage (Mongoose ODM)
│
└─ FRONTEND (Next.js + React)
   ├─ Landing Page (11 sections)
   ├─ Authentication Pages (login, register)
   ├─ Customer Dashboard (products, cart, checkout, orders)
   ├─ Affiliate Dashboard (referrals, commissions, payouts)
   └─ Admin Dashboard (metrics, approvals, management)
```

---

## File Organization Map

### BACKEND (src/)
```
src/
├── config/
│   ├── database.js          ← MongoDB connection
│   ├── environment.js       ← ENV variables (API_PREFIX: /api/v1)
│   └── stripe.js            ← Stripe SDK
│
├── models/ [8 files]
│   ├── User.js              ← User schema (role, affiliateStatus)
│   ├── Product.js           ← Product with variants
│   ├── Cart.js              ← Shopping cart
│   ├── Order.js             ← Completed purchase
│   ├── Commission.js        ← Affiliate earnings (pending→approved→paid)
│   ├── Affiliate.js         ← Affiliate account (code, stats)
│   ├── Payout.js            ← Payout requests
│   └── ReferralTracking.js  ← Click tracking
│
├── routes/ [11 files]
│   ├── authRoutes.js        ← /api/v1/auth/*
│   ├── productRoutes.js     ← /api/v1/products/*
│   ├── cartRoutes.js        ← /api/v1/cart/*
│   ├── checkoutRoutes.js    ← /api/v1/checkout/* (Stripe)
│   ├── orderRoutes.js       ← /api/v1/orders/*
│   ├── affiliateRoutes.js   ← /api/v1/affiliate/*
│   ├── commissionRoutes.js  ← /api/v1/commissions/*
│   ├── payoutRoutes.js      ← /api/v1/payouts/*
│   ├── adminRoutes.js       ← /api/v1/admin/* (role: admin)
│   ├── referralTrackingRoutes.js
│   └── fileUploadRoutes.js  ← /api/v1/upload/*
│
├── controllers/ [11 files] ← HTTP handlers
├── services/ [10 files]    ← Business logic
├── validators/ [8 files]   ← Joi schemas
├── middlewares/
│   ├── authMiddleware.js   ← JWT verification
│   ├── roleMiddleware.js   ← authorize(...roles)
│   ├── securityMiddleware.js ← Rate limiting, validation
│   ├── fraudDetectionMiddleware.js
│   ├── referralMiddleware.js ← Affiliate tracking
│   └── errorHandler.js     ← Global error handling
├── utils/
│   ├── jwtUtils.js
│   ├── passwordUtils.js
│   ├── cloudinaryUpload.js
│   └── ...
└── server.js               ← Express app + middleware setup
```

### FRONTEND (FRONTEND_AUTH_IMPLEMENTATION/src/)
```
src/
├── app/ [Next.js routes]
│   ├── page.jsx            ← Landing page (import 11 sections)
│   ├── layout.jsx          ← Root layout
│   ├── providers.jsx       ← Context/Redux setup
│   ├── (auth)/
│   │   ├── login/page.jsx  ← Login form
│   │   └── register/page.jsx ← Register form
│   ├── (app)/              ← Customer routes
│   │   ├── dashboard/page.jsx
│   │   ├── products/page.jsx
│   │   ├── cart/page.jsx
│   │   └── checkout/page.jsx
│   ├── (affiliate)/        ← Affiliate routes
│   │   ├── dashboard/page.jsx
│   │   ├── commissions/page.jsx
│   │   ├── payouts/page.jsx
│   │   └── referrals/page.jsx
│   └── (admin)/            ← Admin routes
│       ├── dashboard/page.jsx
│       ├── orders/page.jsx
│       ├── products/page.jsx
│       ├── commissions/page.jsx
│       └── payouts/page.jsx
│
├── sections/ [Landing page]
│   ├── Header.jsx
│   ├── Hero.jsx
│   ├── ValueProp.jsx
│   ├── HowItWorks.jsx
│   ├── FeaturesShowcase.jsx
│   ├── SocialProof.jsx
│   ├── TrustSecurity.jsx
│   ├── DualCTA.jsx         ← Dual CTA (Customer / Affiliate)
│   ├── FAQ.jsx
│   ├── FinalCTA.jsx
│   └── Footer.jsx
│
├── components/ [Reusable]
│   ├── auth/                ← Login/Register forms
│   ├── products/            ← Product list, detail
│   ├── cart/                ← Cart display, checkout
│   ├── commissions/         ← Commission display
│   ├── payouts/             ← Payout management
│   ├── admin/               ← Admin-specific components
│   └── common/              ← Shared (Header, Footer, etc)
│
├── api/
│   ├── client.js           ← Axios instance (interceptors)
│   ├── services/           ← API service functions
│   │   ├── authService.js  ← register, login, logout
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── orderService.js
│   │   ├── checkoutService.js ← Stripe integration
│   │   ├── affiliateService.js
│   │   ├── commissionService.js
│   │   └── payoutService.js
│   └── hooks/              ← React Query hooks
│       ├── useAuth.js
│       ├── useProducts.js
│       ├── useCart.js
│       ├── useOrders.js
│       ├── useAffiliates.js
│       ├── useCommissions.js
│       └── usePayouts.js
│
├── utils/
│   ├── tokenManager.js     ← localStorage/cookie management
│   ├── validation.js       ← Form validation
│   ├── formatting.js       ← Display formatting
│   ├── commissionUtils.js
│   ├── payoutUtils.js
│   └── ...
│
└── next.config.mjs
```

---

## Key Integration Points

### 1. Authentication Flow
```
Frontend                          Backend
─────────────────────────────────────────
POST /auth/register    ──────→   Create User
    (name, email, pw)  ←──────   Return tokens
                                 access + refresh
                                 
POST /auth/login       ──────→   Verify email/password
    (email, pw)        ←──────   Return tokens
                                 
All subsequent requests:
    Header: Authorization: Bearer {accessToken}
                          ↓
                   authenticateToken MW
                   (sets req.user = {_id, role})
```

### 2. Product → Cart → Order → Commission Flow
```
Browse Products              Display from GET /api/v1/products
    ↓
Add to Cart                  POST /api/v1/cart/update
    ↓
Checkout                     POST /api/v1/checkout/checkoutSession
    ↓                        (Stripe creates session)
Stripe Payment              (Redirect to stripe.com)
    ↓
Webhook Received            POST /api/v1/checkout/webhook
    ↓
Create Order                (Stripe webhook triggers)
    ↓
Create Commission           (IF order.affiliateDetails exists)
    ↓
Affiliate can request       POST /api/v1/payouts/request
payout of accumulated
commissions
```

### 3. Affiliate Attribution
```
User visits with referral link: 
    https://marketplace.com/?ref=AFF123ABCD456

    ↓ (Tracked by referralMiddleware)
    
Affiliate code stored in:
    - Cookie (7-30 day expiry)
    - Query param (immediate)
    
    ↓
User purchases

    ↓ (Checkout creates order)
    
Order links affiliate:
    order.affiliateDetails = {
      affiliateId: ObjectId,
      affiliateCode: 'AFF123ABC456',
      commissionAmount: calculated
    }
    
    ↓
Commission created automatically
    commission.status = 'pending' (awaits admin approval)
```

### 4. Admin Approval Workflow
```
Commission/Payout Created (pending)
    ↓
Admin Dashboard: GET /api/v1/admin/commissions
    ↓
Admin Reviews
    ↓
Admin Approves: PUT /api/v1/admin/commissions/:id/approve
    ↓
Commission.status = 'approved'
    ↓
Affiliate can request payout: POST /api/v1/payouts/request
    ↓
Payout (pending) sent to admin
    ↓
Admin approves: PUT /api/v1/admin/payouts/:id/approve
    ↓
Payout.status = 'approved' → 'processing' → 'completed'
```

---

## API Endpoint Summary

### Public (No Auth Required)
```
POST   /api/v1/auth/register        ← Register new account
POST   /api/v1/auth/login           ← Login account
POST   /api/v1/auth/refresh         ← Refresh token
GET    /api/v1/products             ← Browse products
GET    /api/v1/products/:id         ← Product detail
```

### Customer (Auth Required, role: customer)
```
GET    /api/v1/cart                 ← View cart
POST   /api/v1/cart/update          ← Add item to cart
POST   /api/v1/cart/remove          ← Remove from cart
POST   /api/v1/checkout/checkoutSession  ← Create Stripe session
GET    /api/v1/orders               ← My orders
GET    /api/v1/orders/:id           ← Order detail
```

### Affiliate (Auth Required, role: affiliate)
```
GET    /api/v1/affiliate/profile    ← My profile
GET    /api/v1/affiliate/stats      ← Referral stats
GET    /api/v1/commissions          ← My commissions
POST   /api/v1/payouts/request      ← Request payout
GET    /api/v1/payouts              ← My payouts
GET    /api/v1/referrals            ← My referral links
```

### Admin (Auth Required, role: admin)
```
GET    /api/v1/admin/dashboard      ← System overview
GET    /api/v1/admin/orders         ← All orders
GET    /api/v1/admin/products       ← All products
PUT    /api/v1/admin/products/:id   ← Update product
GET    /api/v1/admin/affiliates     ← All affiliates
PUT    /api/v1/admin/affiliates/:id/status ← Suspend/activate
GET    /api/v1/admin/commissions    ← All commissions
PUT    /api/v1/admin/commissions/:id/approve   ← Approve
PUT    /api/v1/admin/commissions/:id/reverse   ← Reverse
GET    /api/v1/admin/payouts        ← All payouts
PUT    /api/v1/admin/payouts/:id/approve       ← Approve payout
POST   /api/v1/admin/payouts/batch-approve    ← Bulk approve
```

### Webhook (No Auth)
```
POST   /api/v1/checkout/webhook     ← Stripe webhook
POST   /api/checkout/webhook        ← (Legacy compatibility)
```

---

## Database Collections (MongoDB)

| Collection | Key Fields | Purpose |
|-----------|-----------|---------|
| **users** | _id, email, password, role, affiliateStatus | User accounts |
| **products** | _id, name, price, status, images, variants | Product catalog |
| **carts** | userId (unique), items[] | Shopping carts |
| **orders** | _id, userId, items[], paymentDetails, affiliateDetails, status | Purchases |
| **commissions** | affiliateId, orderId (unique), amount, status, statusHistory[] | Earnings |
| **affiliates** | userId (unique), affiliateCode (unique), status, totalClicks, totalSales | Affiliate profiles |
| **payouts** | affiliateId, amount, status, bankAccount | Payout requests |
| **referraltrackins** | affiliateId, clicks, conversionRate | Tracking data |

---

## Common Code Patterns

### Pattern: Controller with Service
```javascript
// Controller
const register = async (req, res, next) => {
  try {
    const result = await authService.registerUser(req.body);
    res.status(201).json({ 
      success: true, 
      data: result,
      tokens: { accessToken: result.accessToken, refreshToken: result.refreshToken }
    });
  } catch (error) {
    next(error);  // => Global error handler
  }
};
```

### Pattern: Middleware Chain
```javascript
router.put(
  '/admin/orders/:id/refund',
  authenticateToken,      // Requires auth
  authorize('admin'),     // Must be admin
  validateRefund,         // Validate input
  orderController.refund  // Execute
);
```

### Pattern: Service with Validation
```javascript
const createCommission = async (orderId, affiliateId) => {
  // Verify order exists and has correct status
  const order = await Order.findById(orderId);
  if (!order || order.status !== 'completed') {
    throw new Error('Invalid order');
  }
  
  // Verify affiliate exists and is active
  const affiliate = await Affiliate.findById(affiliateId);
  if (!affiliate || affiliate.status !== 'active') {
    throw new Error('Invalid affiliate');
  }
  
  // Calculate commission
  const rate = 0.10; // 10%
  const amount = Math.round(order.totalAmount * rate * 100) / 100;
  
  // Create commission
  const commission = await Commission.create({
    affiliateId,
    orderId,
    amount,
    status: 'pending'
  });
  
  return commission;
};
```

### Pattern: Frontend API Service
```javascript
// authService.js
import client from '@/api/client';

export const register = async (userData) => {
  try {
    const response = await client.post('/auth/register', userData);
    return { success: true, data: response.data };
  } catch (error) {
    return { 
      success: false, 
      error: error.response?.data?.message || 'Request failed' 
    };
  }
};
```

### Pattern: React Hook with React Query
```javascript
// useAuth.js
import { useMutation } from '@tanstack/react-query';
import * as authService from '@/api/services/authService';

export const useRegister = () => {
  const mutation = useMutation({
    mutationFn: authService.register,
    onSuccess: (data) => {
      TokenManager.setTokens(data.tokens);
      // Redirect to dashboard
    },
    onError: (error) => {
      // Show error toast
    }
  });
  return mutation;
};
```

---

## Critical Implementation Rules

### Backend
1. **All errors bubble to middleware** - Never `res.json()` in catch, always `next(error)`
2. **JWT verification first** - `authenticateToken` before `authorize`
3. **Status codes matter** - 400 (validation), 401 (no auth), 403 (wrong role), 404 (not found)
4. **Timestamps on everything** - `createdAt`, `updatedAt` on all models
5. **Stripe webhook signature verification** - Non-negotiable security
6. **Unique constraints** - Email, affiliateCode, stripeSessionId must be unique

### Frontend
1. **Store tokens securely** - localStorage safe for this project (consider httpOnly in production)
2. **Auto-token refresh** - axios interceptor handles 401 + retry
3. **FormData for file uploads** - Don't set Content-Type header
4. **React Query invalidation** - Invalidate queries after mutations
5. **Protected routes** - ProtectedRoute component checks auth before rendering
6. **Error handling** - Show user-friendly messages from `error.response?.data?.message`

### Database
1. **Index frequently queried fields** - email, status, timestamps
2. **Unique constraints where needed** - email, affiliateCode, stripeSessionId
3. **ObjectId references** - Not string IDs
4. **Denormalization strategically** - Keep payment/affiliate details in Order for fewer queries

---

## Startup Commands

```bash
# Backend (src as entry)
cd <root>
npm install
npm run dev   # nodemon auto-restart on file changes
npm start     # production

# Frontend (separate app)
cd FRONTEND_AUTH_IMPLEMENTATION
npm install
npm run dev   # Next.js dev server (port 3000 default)
npm run build # Production build
npm start     # Run production build
```

---

## Environment Configuration

**Backend (.env) - Required Variables:**
```env
MONGODB_URI=mongodb+srv://user:pass@cluster.mongodb.net/dbname
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-refresh-secret
STRIPE_SECRET_KEY=sk_live_xxxxx
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
CORS_ORIGIN=http://localhost:3000
NODE_ENV=development
CLOUDINARY_URL=cloudinary://key@account/path
```

**Frontend (.env.local) - Required Variables:**
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_xxxxx
```

---

## Implementation Priority

### Phase 1: Core Functionality (Backend ✓, connect Frontend)
- [ ] Landing page sections (landing page already exists)
- [ ] Auth pages (register, login, logout)
- [ ] Connect frontend auth to backend

### Phase 2: Customer Features
- [ ] Product listing page
- [ ] Product detail page
- [ ] Shopping cart
- [ ] Checkout (Stripe integration)
- [ ] Order history

### Phase 3: Affiliate Features
- [ ] Affiliate dashboard
- [ ] Referral tracking display
- [ ] Commission display
- [ ] Payout request form
- [ ] Affiliate analytics

### Phase 4: Admin Features
- [ ] Admin dashboard (metrics)
- [ ] Commission management (approve/reject)
- [ ] Payout management (approve/process)
- [ ] Product management
- [ ] User/affiliate management

---

This quick reference should help you navigate the codebase quickly. Refer to CODEBASE_ANALYSIS.md for deeper details on any section.
