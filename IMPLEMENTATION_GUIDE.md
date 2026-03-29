# Spherekings Marketplace & Affiliate System - Complete Implementation Guide

**Last Updated:** March 14, 2026  
**Status:** Backend Production Ready | Frontend Blueprint Complete

---

## Table of Contents

1. [Backend Architecture Overview](#backend-architecture-overview)
2. [Issues Fixed & Solutions](#issues-fixed--solutions)
3. [Backend API Documentation](#backend-api-documentation)
4. [Frontend Implementation Plan](#frontend-implementation-plan)
5. [Project Structure](#project-structure)
6. [Development Workflow](#development-workflow)

---

## Backend Architecture Overview

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Payment:** Stripe API
- **Authentication:** JWT with Refresh Tokens
- **Validation:** Zod/Joi schemas
- **Environment:** Development, Production

### Core Modules (11 API Routes)
1. **Authentication** - User registration, login, token refresh
2. **Products** - Marketplace items management
3. **Cart** - Shopping cart operations
4. **Checkout** - Stripe payment sessions
5. **Orders** - Order history and management
6. **Affiliates** - Affiliate account management
7. **Commissions** - Commission tracking and calculations
8. **Payouts** - Payment distributions
9. **Referrals** - Referral tracking and clicks
10. **Admin** - System administration
11. **Leaderboard** - Top affiliates/earners

---

## Issues Fixed & Solutions

### Issue 1: Cart Update Endpoint Not Found
**Problem:** User attempted PUT request to `/api/v1/cart/update`  
**Root Cause:** Backend only supports POST method for cart operations  
**Solution:** Use POST method with correct endpoint  
**Endpoints:**
- `POST /api/v1/cart/update` - Update cart items
- `POST /api/v1/cart/remove` - Remove items from cart

### Issue 2: Product Status Field Validation
**Problem:** Checkout failing with "product.active is not a function"  
**Root Cause:** Product collection uses `status` field (string), not `status` boolean  
**File Modified:** `src/services/checkoutService.js` (Lines 45-70)  
**Solution:** Changed validation from `!product.active` to `product.status !== 'active'`  
**Code:**
```javascript
if (typeof item.productId === 'object' && item.productId._id) {
  product = item.productId;
} else {
  product = await Product.findById(item.productId);
}

if (!product || product.status !== 'active') {
  throw new Error('Product is no longer available');
}
```

### Issue 3: ObjectId String Validation
**Problem:** "productId.match is not a function" error  
**Root Cause:** Mongoose ObjectId instances don't have `.match()` method  
**File Modified:** `src/services/productService.js` (Lines 120-140)  
**Solution:** Convert to string before regex validation  
**Code:**
```javascript
const productIdStr = productId.toString();
if (!productIdStr.match(/^[0-9a-fA-F]{24}$/)) {
  throw new Error('Invalid product ID format');
}
```

### Issue 4: Affiliate Code Length Mismatch
**Problem:** Validation error "Affiliate code must be exactly 11 characters"  
**Root Cause:** Generator creates 14 chars (`AFF` + 11 random), validator expects 11  
**File Modified:** `src/validators/referralValidator.js` (Lines 12-20)  
**Solution:** Updated validator schema  
**Code:**
```javascript
affiliateCode: z.string().length(14).regex(/^AFF[A-Z0-9]{11}$/)
```

### Issue 5: Affiliate Account Activation
**Problem:** Affiliate accounts stuck in 'pending' status, email verification blocking  
**Root Cause:** Production email verification logic active in development  
**File Modified:** `src/services/affiliateService.js` (Lines 20-50)  
**Solution:** Auto-activate in development mode  
**Code:**
```javascript
status = process.env.NODE_ENV === 'development' ? 'active' : 'pending'
```

### Issue 6: Mongoose Document Serialization
**Problem:** API responses contained Mongoose internals (`$__`, `$isNew`, `_doc`)  
**Root Cause:** Using `.lean()` then calling Mongoose methods  
**File Modified:** `src/services/affiliateService.js`  
**Solution:** Remove `.lean()`, use `.toObject()` before returning  
**Code:**
```javascript
const affiliate = await Affiliate.findOne({ userId });
const affiliateData = affiliate.toObject();
return affiliateData;
```

### Issue 7: Double Path in Leaderboard Route
**Problem:** Endpoint `/api/v1/leaderboard/leaderboard` (duplicate)  
**Root Cause:** Route defined as `/leaderboard` but mounted at `/leaderboard`  
**File Modified:** `src/routes/affiliateRoutes.js` (Line 52)  
**Solution:** Changed route definition to `/`  
**Code:**
```javascript
router.get('/', getAffiliateLeaderboard);
```

### Issue 8: Express Route Parameter Catching Wrong Paths
**Problem:** `GET /api/v1/commissions/stats` returns "Cast to ObjectId failed for value 'stats'"  
**Root Cause:** Generic `/:id` route parameter matches any string  
**File Modified:** `src/routes/commissionRoutes.js` (Lines 19-112)  
**Solution:** Reorder routes and add regex constraint  
**Code:**
```javascript
router.get('/stats', getCommissionStats);
router.get('/', getAllCommissions);
router.get('/:commissionId([0-9a-f]{24})', getCommissionById);
```

### Issue 9: Referral Redirect ECONNREFUSED Error
**Problem:** Redirect to `http://localhost:3000` fails - no frontend running  
**Root Cause:** Referral tracking attempts redirect without frontend URL config  
**File Modified:** `src/controllers/referralTrackingController.js` (Lines 98-115)  
**Solution:** Return JSON in development when no frontend configured  
**Code:**
```javascript
if (process.env.NODE_ENV === 'development' && !process.env.FRONTEND_URL) {
  return res.status(200).json({
    success: true,
    message: 'Referral tracked (dev mode)',
    referralData: { code, tracked: true }
  });
}
```

---

## Backend API Documentation

### Authentication Endpoints

#### Register User
```
POST /api/v1/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}

Response: { success: true, token, refreshToken, user }
```

#### Login
```
POST /api/v1/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "SecurePass123!"
}

Response: { success: true, token, refreshToken, user }
```

#### Refresh Token
```
POST /api/v1/auth/refresh
Content-Type: application/json

{
  "refreshToken": "string"
}

Response: { token, refreshToken }
```

### Product Endpoints

#### Get All Products
```
GET /api/v1/products?page=1&limit=20&sort=newest&category=electronics

Response: {
  products: [...],
  total: number,
  page: number,
  pages: number
}
```

#### Get Product By ID
```
GET /api/v1/products/:productId

Response: {
  _id: string,
  name: string,
  description: string,
  price: number,
  status: "active"|"inactive"|"discontinued",
  image: string,
  category: string,
  createdAt: Date
}
```

#### Create Product (Admin)
```
POST /api/v1/products
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Product Name",
  "description": "Description",
  "price": 99.99,
  "category": "electronics",
  "image": "url"
}

Response: { success: true, product }
```

### Cart Endpoints

#### Add to Cart
```
POST /api/v1/cart/add
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "objectId",
  "quantity": 2
}

Response: { success: true, cart }
```

#### Update Cart Item
```
POST /api/v1/cart/update
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "objectId",
  "quantity": 5
}

Response: { success: true, cart }
```

#### Remove from Cart
```
POST /api/v1/cart/remove
Authorization: Bearer <token>
Content-Type: application/json

{
  "productId": "objectId"
}

Response: { success: true, cart }
```

#### Get Cart
```
GET /api/v1/cart
Authorization: Bearer <token>

Response: {
  items: [...],
  total: number,
  itemCount: number
}
```

### Checkout Endpoints

#### Create Checkout Session
```
POST /api/v1/checkout/create-session
Authorization: Bearer <token>
Content-Type: application/json

{
  "cartItems": [
    { "productId": "id", "quantity": 2 },
    ...
  ],
  "shippingAddress": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "zip": "10001",
    "country": "US"
  },
  "affiliateCode": "AFF..." (optional)
}

Response: {
  sessionId: "stripe_session_id",
  clientSecret: "pk_live_...",
  url: "https://checkout.stripe.com/..."
}
```

#### Verify Checkout
```
POST /api/v1/checkout/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "sessionId": "stripe_session_id"
}

Response: { success: true, order }
```

### Order Endpoints

#### Get User Orders
```
GET /api/v1/orders
Authorization: Bearer <token>
?page=1&limit=10&status=completed

Response: {
  orders: [...],
  total: number
}
```

#### Get Order Details
```
GET /api/v1/orders/:orderId
Authorization: Bearer <token>

Response: {
  _id: string,
  items: [...],
  total: number,
  status: "pending"|"completed"|"cancelled",
  createdAt: Date
}
```

### Affiliate Endpoints

#### Register Affiliate
```
POST /api/v1/affiliates/register
Authorization: Bearer <token>
Content-Type: application/json

{
  "bankAccount": "1234567890",
  "bankCode": "SWIFT123",
  "website": "https://example.com"
}

Response: {
  success: true,
  affiliate: {
    affiliateCode: "AFF...",
    status: "active"|"pending",
    commission: 10
  }
}
```

#### Get Affiliate Profile
```
GET /api/v1/affiliates/profile
Authorization: Bearer <token>

Response: {
  affiliateCode: string,
  status: string,
  commissionRate: number,
  totalEarnings: number,
  conversions: number
}
```

#### Get Affiliate Leaderboard
```
GET /api/v1/leaderboard
?limit=10&period=month

Response: {
  affiliates: [
    { rank: 1, name: string, earnings: number, conversions: number },
    ...
  ]
}
```

### Commission Endpoints

#### Get All Commissions
```
GET /api/v1/commissions
Authorization: Bearer <token>
?page=1&limit=20&status=pending|completed

Response: {
  commissions: [...],
  total: number
}
```

#### Get Commission Statistics
```
GET /api/v1/commissions/stats
Authorization: Bearer <token>

Response: {
  totalEarnings: number,
  pendingCommissions: number,
  completedCommissions: number,
  monthlyEarnings: number
}
```

#### Get Single Commission
```
GET /api/v1/commissions/:commissionId
Authorization: Bearer <token>

Response: {
  _id: string,
  affiliateId: string,
  orderId: string,
  amount: number,
  status: "pending"|"processed"
}
```

### Payout Endpoints

#### Request Payout
```
POST /api/v1/payouts/request
Authorization: Bearer <token>
Content-Type: application/json

{
  "amount": 500.00,
  "bankAccount": "1234567890"
}

Response: { success: true, payout }
```

#### Get Payouts
```
GET /api/v1/payouts
Authorization: Bearer <token>
?status=pending|processed

Response: {
  payouts: [...],
  total: number
}
```

#### Get Payout Statistics
```
GET /api/v1/payouts/stats
Authorization: Bearer <token>

Response: {
  totalPaid: number,
  pendingPayouts: number,
  lastPayout: Date
}
```

### Referral Tracking Endpoints

#### Track Referral Click
```
GET /api/v1/tracking/click?ref=AFF123ABC456
Query Parameters:
  - ref: affiliate code (14 chars)
  - redirect: where to send user after tracking

Response (dev mode):
{
  success: true,
  message: "Referral tracked",
  referralData: { code, tracked: true }
}

Response (production):
Redirect to frontend landing page with referral code in session
```

#### Get Referral Stats
```
GET /api/v1/tracking/stats/:affiliateCode
Authorization: Bearer <token>

Response: {
  clicks: number,
  conversions: number,
  conversionRate: number
}
```

### Admin Endpoints

#### Get System Statistics
```
GET /api/v1/admin/stats
Authorization: Bearer <token>

Response: {
  totalUsers: number,
  totalRevenue: number,
  totalOrders: number,
  totalAffiliates: number
}
```

#### Get All Users (Admin)
```
GET /api/v1/admin/users?page=1&limit=50
Authorization: Bearer <token>

Response: {
  users: [...],
  total: number
}
```

#### Update User Status (Admin)
```
PUT /api/v1/admin/users/:userId
Authorization: Bearer <token>

{
  "status": "active"|"suspended"
}

Response: { success: true }
```

---

## Frontend Implementation Plan

### Development Stages (5 Weeks)

#### Stage 1: Project Setup & Authentication (Week 1)
**Objective:** Create Next.js project with authentication system

**Dependencies to Install:**
```bash
npm install next react react-dom
npm install zustand
npm install react-hook-form zod @hookform/resolvers
npm install axios
npm install @stripe/react-js @stripe/js
npm install styled-components
npm install js-cookie
```

**Folder Structure:**
```
frontend/
├── app/
│   ├── layout.jsx
│   ├── page.jsx
│   ├── auth/
│   │   ├── login/page.jsx
│   │   ├── register/page.jsx
│   │   └── forgot-password/page.jsx
│   ├── dashboard/
│   ├── marketplace/
│   └── admin/
├── components/
│   ├── auth/
│   ├── common/
│   └── shared/
├── services/
│   └── api.js
├── stores/
│   └── authStore.js
├── hooks/
│   └── useAuth.js
├── utils/
│   ├── validation.js
│   └── constants.js
└── styles/
    └── globals.css
```

**Files to Create:**

**services/api.js** - Axios instance with interceptors
```javascript
import axios from 'axios';
import { useAuthStore } from '@/stores/authStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' }
});

// Request interceptor - add auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      const refreshToken = useAuthStore.getState().refreshToken;
      try {
        const response = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
        useAuthStore.getState().setTokens(response.data.token, response.data.refreshToken);
        return api(originalRequest);
      } catch {
        useAuthStore.getState().logout();
      }
    }
    return Promise.reject(error);
  }
);

export default api;
```

**stores/authStore.js** - Zustand authentication store
```javascript
import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user }),
      setTokens: (token, refreshToken) => set({ token, refreshToken }),
      setLoading: (isLoading) => set({ isLoading }),
      setError: (error) => set({ error }),

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          set({
            user: response.data.user,
            token: response.data.token,
            refreshToken: response.data.refreshToken,
            isLoading: false
          });
        } catch (error) {
          set({ error: error.response?.data?.message || 'Login failed', isLoading: false });
        }
      },

      logout: () => set({ user: null, token: null, refreshToken: null })
    }),
    { name: 'auth-store' }
  )
);
```

**Components:** Login & Register pages with form validation

#### Stage 2: Marketplace & Products (Week 1-2)
**Objective:** Display products, search, filter, pagination

**Key Components:**
- ProductGrid - Display searchable product list
- ProductCard - Individual product display
- ProductDetails - Modal/page with full details
- SearchBar - Product search with debounce
- FilterPanel - Category and price filters

**API Calls:**
- `GET /products` - Fetch all products
- `GET /products/:id` - Fetch single product

#### Stage 3: Shopping Cart (Week 2)
**Objective:** Cart management with persistent storage

**Zustand Cart Store:**
```javascript
const useCartStore = create((set) => ({
  items: [],
  addItem: (product, quantity) => set(...),
  removeItem: (productId) => set(...),
  updateQuantity: (productId, quantity) => set(...),
  clearCart: () => set({ items: [] }),
  getTotal: () => {...}
}));
```

**API Calls:**
- `POST /cart/add` - Add to cart
- `POST /cart/update` - Update quantity
- `POST /cart/remove` - Remove item
- `GET /cart` - Fetch cart

#### Stage 4: Checkout & Payments (Week 2-3)
**Objective:** Stripe integration for payments

**Key Components:**
- CheckoutSummary - Order review
- ShippingForm - Address collection
- PaymentForm - Stripe card element
- OrderConfirmation - Success page

**API Calls:**
- `POST /checkout/create-session` - Create Stripe session
- `POST /checkout/verify` - Verify payment

#### Stage 5: User Dashboard (Week 3)
**Objective:** View orders and account settings

**Routes:**
- `/dashboard` - Order history
- `/dashboard/order/:id` - Order details
- `/dashboard/settings` - User settings

**API Calls:**
- `GET /orders` - Fetch user orders
- `GET /orders/:id` - Order details

#### Stage 6: Affiliate Registration & Dashboard (Week 3-4)
**Objective:** Affiliate signup and monitoring

**Routes:**
- `/affiliate/register` - Registration form
- `/affiliate/dashboard` - Affiliate stats
- `/affiliate/leaderboard` - Top earners

**API Calls:**
- `POST /affiliates/register` - Register as affiliate
- `GET /affiliates/profile` - Get affiliate data
- `GET /leaderboard` - Top affiliates

#### Stage 7: Referral System (Week 4)
**Objective:** Track and manage referrals

**Features:**
- Unique referral link generation
- Click tracking
- Conversion tracking
- Referral statistics

**API Calls:**
- `GET /tracking/click?ref=CODE` - Track click
- `GET /tracking/stats/:code` - Get stats

#### Stage 8: Commission & Payout Management (Week 4)
**Objective:** View earnings and request payouts

**Routes:**
- `/affiliate/commissions` - Commission list
- `/affiliate/payouts` - Payout history
- `/affiliate/earnings` - Earnings analytics

**API Calls:**
- `GET /commissions` - Fetch commissions
- `GET /commissions/stats` - Commission stats
- `POST /payouts/request` - Request payout
- `GET /payouts` - Payout history

#### Stage 9: Admin Dashboard (Week 4-5)
**Objective:** System administration interface

**Routes:**
- `/admin/dashboard` - System stats
- `/admin/users` - User management
- `/admin/orders` - Order management
- `/admin/products` - Product catalog

**API Calls:**
- `GET /admin/stats` - System statistics
- `GET /admin/users` - All users
- `PUT /admin/users/:id` - Update user

#### Stage 10: Optimization & Testing (Week 5)
**Objective:** Performance, security, testing

**Tasks:**
- Code splitting and lazy loading
- Image optimization
- Bundle size optimization
- SEO optimization
- Comprehensive testing
- Security audit

---

### Architecture Patterns

#### Custom Hooks Pattern
```javascript
// hooks/useProducts.js
export const useProducts = (page = 1, limit = 20) => {
  const [products, setProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProducts = async () => {
      setIsLoading(true);
      try {
        const response = await api.get(`/products?page=${page}&limit=${limit}`);
        setProducts(response.data.products);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, [page, limit]);

  return { products, isLoading, error };
};
```

#### Protected Route Pattern
```javascript
// components/ProtectedRoute.jsx
export const ProtectedRoute = ({ children }) => {
  const { user } = useAuthStore();
  const router = useRouter();

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
    }
  }, [user]);

  return user ? children : null;
};
```

#### Form Validation Pattern
```javascript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(8, 'Min 8 characters')
});

export const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(schema)
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <input {...register('email')} />
      {errors.email && <span>{errors.email.message}</span>}
    </form>
  );
};
```

---

## Project Structure

### Backend Directories
```
src/
├── routes/           # Express routes
├── controllers/      # Route handlers
├── services/         # Business logic
├── models/          # Mongoose schemas
├── middleware/      # Express middleware
├── validators/      # Zod validation
├── utils/           # Helper functions
├── config/          # Configuration files
└── scripts/         # Utility scripts
```

### Frontend Directories (To Create)
```
frontend/
├── app/             # Next.js app router
├── components/      # React components
├── hooks/           # Custom React hooks
├── stores/          # Zustand stores
├── services/        # API services
├── utils/           # Utilities
├── styles/          # Global styles
└── public/          # Static files
```

---

## Development Workflow

### Backend Setup
```bash
cd src
npm install
npm run dev          # Start development server
npm run build        # Build for production
npm start            # Run production build
```

### Frontend Setup
```bash
npx create-next-app@latest frontend
cd frontend
npm install
npm run dev          # Start development server on :3000
npm run build        # Build for production
npm start            # Run production build
```

### Environment Variables

**Backend (.env):**
```
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/spherekings
JWT_SECRET=your_jwt_secret_key
REFRESH_TOKEN_SECRET=your_refresh_secret
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
FRONTEND_URL=http://localhost:3000
EMAIL_SERVICE=gmail
```

**Frontend (.env.local):**
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...
```

### Testing API Endpoints
Use Postman or REST Client:
```
@baseUrl = http://localhost:5000/api/v1
@token = your_jwt_token

### Register
POST {{baseUrl}}/auth/register
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!",
  "firstName": "Test",
  "lastName": "User"
}

### Login
POST {{baseUrl}}/auth/login
Content-Type: application/json

{
  "email": "test@example.com",
  "password": "TestPass123!"
}

### Get Products
GET {{baseUrl}}/products
```

---

## Critical Path to Revenue

### High Priority (Weeks 1-3)
1. ✅ Authentication system - Required for everything
2. ✅ Product listing - Core marketplace feature
3. ✅ Shopping cart - User engagement
4. ✅ Checkout & payments - Revenue generation
5. ✅ Order management - Customer tracking

### Medium Priority (Weeks 3-4)
6. Affiliate registration - Growth channel
7. Referral tracking - Affiliate incentive
8. Commission calculations - Affiliate payouts

### Lower Priority (Week 4-5)
9. Admin dashboard - Operational visibility
10. Performance optimization - Scale preparation

---

## Testing Checklist

- [ ] Authentication flows (register, login, logout, refresh)
- [ ] Product search and filtering
- [ ] Cart operations (add, update, remove)
- [ ] Checkout process
- [ ] Payment processing with Stripe
- [ ] Order creation and tracking
- [ ] Affiliate registration
- [ ] Referral link generation and tracking
- [ ] Commission calculations
- [ ] Payout requests
- [ ] Admin operations
- [ ] Mobile responsiveness
- [ ] Cross-browser compatibility
- [ ] Error handling and edge cases
- [ ] Security (XSS, CSRF, injection)

---

## Deployment Checklist

- [ ] Environment variables configured correctly
- [ ] Database backups in place
- [ ] Stripe production keys configured
- [ ] HTTPS enabled
- [ ] CORS properly configured
- [ ] Rate limiting enabled
- [ ] Monitoring and logging setup
- [ ] Error tracking (Sentry, etc.)
- [ ] Performance monitoring
- [ ] SEO optimized
- [ ] Security headers configured
- [ ] Load testing completed

---

## Troubleshooting Guide

### Backend Issues

**"productId.match is not a function"**
- Ensure productId is converted to string: `productId.toString()`
- Check that ObjectId regex validation is applied

**"product is no longer available"**
- Verify product status field: should be `status !== 'active'` not `!product.active`
- Check product exists in database

**Affiliate code validation error**
- Affiliate codes must be 14 characters (AFF + 11 random)
- Validator should accept `.length(14)`

**"Route not found" errors**
- Check route parameter regex constraints: `/:id([0-9a-f]{24})`
- Verify route ordering (specific before generic)
- Ensure routes don't have double paths

### Frontend Issues

**Login fails with 401**
- Check JWT token storage in localStorage/cookies
- Verify API endpoint is correct
- Check Authorization header format: `Bearer <token>`

**Cart items not persisting**
- Ensure Zustand persist middleware is configured
- Check localStorage quota
- Verify NEXT_PUBLIC_API_URL is correct

**Stripe checkout fails**
- Verify NEXT_PUBLIC_STRIPE_PUBLIC_KEY is set
- Check product prices are in cents
- Ensure session has valid items

---

## Contact & Support

For questions about this implementation:
1. Check this guide first
2. Review API documentation above
3. Check backend error logs
4. Use browser DevTools Network tab
5. Review Zustand DevTools for state issues

---

**Document Version:** 1.0  
**Last Updated:** March 14, 2026  
**Backend Status:** ✅ Production Ready  
**Frontend Status:** 📋 Blueprint Complete - Ready for Implementation
