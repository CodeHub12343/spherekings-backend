# Code Citations

## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```


## License: unknown
https://github.com/daspe/mern-ninja/blob/78f877dafd037c946560c95dd9dce5325e3dba68/frontend/src/hooks/useLogin.js

```
# Spherekings Marketplace Frontend Implementation Roadmap

## Executive Summary

Based on the backend analysis, here's a complete frontend implementation plan for a production-ready Spherekings Marketplace with Affiliate System using Next.js App Router.

---

## Part 1: Backend Architecture Analysis

### Available Backend Modules

| Module | Routes | Status |
|--------|--------|--------|
| Authentication | `/api/v1/auth/*` | ✅ Ready |
| Users/Profile | `/api/v1/users/*` | ✅ Ready |
| Products | `/api/v1/products` | ✅ Ready |
| Cart | `/api/v1/cart/*` | ✅ Ready |
| Checkout | `/api/v1/checkout/*` | ✅ Ready |
| Orders | `/api/v1/orders` | ✅ Ready |
| Affiliates | `/api/v1/affiliate/*` | ✅ Ready |
| Commissions | `/api/v1/affiliate/commissions` | ✅ Ready |
| Payouts | `/api/v1/payouts` | ✅ Ready |
| Referral Tracking | `/api/v1/ref/*`, `/api/v1/tracking/*` | ✅ Ready |
| Admin | `/api/v1/admin/*` | ✅ Ready |
| Leaderboard | `/api/v1/leaderboard` | ✅ Ready |

---

## Part 2: Frontend Implementation Roadmap

### Stage 1: Foundation & Authentication (Week 1)

**Purpose:** Establish user authentication, session management, and API infrastructure.

**Frontend Pages to Build:**
- `app/(auth)/login/page.jsx`
- `app/(auth)/register/page.jsx`
- `app/dashboard/page.jsx` (redirect based on role)

**Components Required:**
```
components/
├── auth/
│   ├── LoginForm.jsx
│   ├── RegisterForm.jsx
│   └── ProtectedRoute.jsx
└── layout/
    ├── Navbar.jsx
    └── Footer.jsx
```

**State Management:**
```javascript
// stores/authStore.js (Zustand)
- user (null | {_id, email, role, name})
- token (null | jwt_string)
- isAuthenticated (boolean)
- login(email, password)
- register(userData)
- logout()
- refreshToken()
```

**API Routes Used:**
- `POST /api/v1/auth/register`
- `POST /api/v1/auth/login`
- `POST /api/v1/auth/refresh`

**API Documentation:**

```javascript
// Register User
POST /api/v1/auth/register
Headers: Content-Type: application/json
Body: {
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  message: "User registered successfully",
  data: {
    user: { _id, email, firstName, lastName, role },
    tokens: { accessToken, refreshToken }
  }
}

// Login
POST /api/v1/auth/login
Headers: Content-Type: application/json
Body: {
  email: "john@example.com",
  password: "SecurePass123!"
}
Response: {
  success: true,
  data: {
    user: { _id, email, role, name },
    tokens: { accessToken, refreshToken }
  }
}
```

**Frontend Implementation:**

```javascript
// app/(auth)/login/page.jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '@/components/auth/LoginForm';

export default function LoginPage() {
  const router = useRouter();
  const { login, isLoading } = useAuth();

  const handleLogin = async (credentials) => {
    try {
      await login(credentials.email, credentials.password);
      router.push('/dashboard');
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoginForm onSubmit={handleLogin} isLoading={isLoading} />
    </div>
  );
}
```

**Data Flow:**
1. User enters credentials
2. Frontend validates (react-hook-form + zod)
3. POST request to `/api/v1/auth/login`
4. Backend validates and returns JWT tokens
5. Store token in localStorage & Zustand
6. Set Authorization header for future requests
7. Redirect to dashboard

---

### Stage 2: User Profile & Settings (Week 1-2)

**Purpose:** Allow users to view and manage their profile information.

**Frontend Pages to Build:**
- `app/dashboard/profile/page.jsx`
- `app/dashboard/settings/page.jsx`

**Components Required:**
```
components/
├── profile/
│   ├── ProfileForm.jsx
│   ├── AvatarUpload.jsx
│   └── ProfileHeader.jsx
└── settings/
    ├── SecuritySettings.jsx
    ├── NotificationSettings.jsx
    └── PrivacySettings.jsx
```

**State Management:**
```javascript
// stores/profileStore.js (Zustand)
- profile (user object)
- isLoading (boolean)
- error (null | string)
- fetchProfile()
- updateProfile(updates)
- uploadAvatar(file)
```

**API Routes Used:**
- `GET /api/v1/users/me`
- `PUT /api/v1/users/profile`
- `POST /api/v1/users/me/avatar`

**API Documentation:**

```javascript
// Get Current User Profile
GET /api/v1/users/me
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Response: {
  success: true,
  data: {
    _id: "507f...",
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    avatar: "https://...",
    role: "user",
    createdAt: "2026-03-14T...",
    updatedAt: "2026-03-14T..."
  }
}

// Update Profile
PUT /api/v1/users/profile
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  firstName: "John",
  lastName: "Doe",
  phone: "+1234567890"
}
Response: { success: true, data: { updated user object } }

// Upload Avatar
POST /api/v1/users/me/avatar
Headers: {
  Authorization: "Bearer {JWT_TOKEN}"
  // Content-Type: multipart/form-data (automatic)
}
Body: FormData with file field
Response: {
  success: true,
  data: {
    url: "https://cloudinary.com/...",
    publicId: "..."
  }
}
```

---

### Stage 3: Product Marketplace (Week 2)

**Purpose:** Display products and enable browsing with filtering/search.

**Frontend Pages to Build:**
- `app/marketplace/page.jsx` (product listing)
- `app/products/[id]/page.jsx` (product details)
- `app/search/page.jsx` (search results)

**Components Required:**
```
components/
├── products/
│   ├── ProductCard.jsx
│   ├── ProductGrid.jsx
│   ├── ProductFilter.jsx
│   ├── ProductSearch.jsx
│   └── ProductDetails.jsx
├── common/
│   ├── Pagination.jsx
│   └── Rating.jsx
```

**State Management:**
```javascript
// stores/productStore.js (Zustand)
- products (array)
- selectedProduct (null | product object)
- filters { category, priceRange, rating, search }
- pagination { page, limit, totalPages }
- isLoading (boolean)
- fetchProducts(filters, page)
- setSelectedProduct(id)
- updateFilters(newFilters)
```

**API Routes Used:**
- `GET /api/v1/products` (with query filters)
- `GET /api/v1/products/:id`

**API Documentation:**

```javascript
// Get All Products
GET /api/v1/products?category=board-games&sort=price&order=asc&page=1&limit=20
Response: {
  success: true,
  data: {
    products: [
      {
        _id: "69b4f206b785fd4ef981cbd6",
        name: "Sphere of Kings Board Game",
        description: "An epic board game experience...",
        price: 79.99,
        category: "board-games",
        images: ["https://..."],
        stock: 100,
        rating: 4.5,
        reviews: 24,
        sku: "SKU123",
        status: "active",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: {
      currentPage: 1,
      totalPages: 5,
      totalItems: 100
    }
  }
}

// Get Single Product
GET /api/v1/products/69b4f206b785fd4ef981cbd6
Response: {
  success: true,
  data: {
    // ... full product object with reviews
  }
}
```

---

### Stage 4: Shopping Cart (Week 2-3)

**Purpose:** Allow users to add products to cart and manage quantities.

**Frontend Pages to Build:**
- `app/cart/page.jsx` (cart view)

**Components Required:**
```
components/
├── cart/
│   ├── CartItem.jsx
│   ├── CartSummary.jsx
│   ├── CartEmpty.jsx
│   └── CartActions.jsx
```

**State Management:**
```javascript
// stores/cartStore.js (Zustand)
- cart { items, summary: { subtotal, tax, total } }
- isLoading (boolean)
- error (null | string)
- fetchCart()
- addToCart(productId, quantity, variant)
- updateCartItem(cartItemId, quantity, variant)
- removeFromCart(cartItemId)
- clearCart()
```

**API Routes Used:**
- `GET /api/v1/cart`
- `POST /api/v1/cart/add`
- `POST /api/v1/cart/update`
- `POST /api/v1/cart/remove`

**API Documentation:**

```javascript
// Get Cart
GET /api/v1/cart
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f1f77bcf86cd799439011",
    userId: "507f1f77bcf86cd799439010",
    items: [
      {
        _id: "607f1f77bcf86cd799439013",
        productId: { /* full product object */ },
        quantity: 2,
        price: 79.99,
        variant: { color: "Red" },
        subtotal: 159.98
      }
    ],
    summary: {
      itemCount: 1,
      totalItems: 2,
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78
    }
  }
}

// Add to Cart
POST /api/v1/cart/add
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  productId: "69b4f206b785fd4ef981cbd6",
  quantity: 2,
  variant: { color: "Red" }  // optional
}
Response: { success: true, data: { updated cart } }

// Update Cart Item
POST /api/v1/cart/update
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013",
  quantity: 5,
  variant: { color: "Blue" }
}
Response: { success: true, data: { updated cart } }

// Remove from Cart
POST /api/v1/cart/remove
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  cartItemId: "607f1f77bcf86cd799439013"
}
Response: { success: true, data: { updated cart } }
```

---

### Stage 5: Checkout & Payment (Week 3)

**Purpose:** Process payments through Stripe integration.

**Frontend Pages to Build:**
- `app/checkout/page.jsx` (checkout page)
- `app/checkout/success/page.jsx` (success confirmation)
- `app/checkout/cancel/page.jsx` (cancellation page)

**Components Required:**
```
components/
├── checkout/
│   ├── CheckoutForm.jsx
│   ├── OrderSummary.jsx
│   ├── ShippingForm.jsx
│   ├── PaymentForm.jsx
│   └── StripePaymentElement.jsx
```

**State Management:**
```javascript
// stores/checkoutStore.js (Zustand)
- checkoutSession (null | session object)
- isProcessing (boolean)
- error (null | string)
- createCheckoutSession(affiliateId?)
- handlePaymentSuccess(sessionId)
```

**API Routes Used:**
- `POST /api/v1/checkout/create-session`

**API Documentation:**

```javascript
// Create Checkout Session
POST /api/v1/checkout/create-session?affiliateId=AFFP038HUSQ75C
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    sessionId: "cs_test_...",
    url: "https://checkout.stripe.com/pay/cs_test_...",
    metadata: {
      cartItems: [...],
      subtotal: 159.98,
      tax: 12.80,
      total: 172.78,
      affiliateId: "AFFP038HUSQ75C"
    }
  }
}
```

**Frontend Implementation:**

```javascript
// app/checkout/page.jsx
'use client';
import { useCart } from '@/hooks/useCart';
import { useCheckout } from '@/hooks/useCheckout';
import { loadStripe } from '@stripe/js';

export default function CheckoutPage() {
  const { cart } = useCart();
  const { createCheckoutSession, isProcessing } = useCheckout();

  const handleCheckout = async () => {
    const session = await createCheckoutSession();
    const stripe = await loadStripe(process.env.NEXT_PUBLIC_STRIPE_KEY);
    await stripe.redirectToCheckout({ sessionId: session.sessionId });
  };

  return (
    <div className="checkout-container">
      <OrderSummary cart={cart} />
      <ShippingForm />
      <button onClick={handleCheckout} disabled={isProcessing}>
        Complete Payment
      </button>
    </div>
  );
}
```

---

### Stage 6: Order History (Week 3)

**Purpose:** Display user's past orders and order details.

**Frontend Pages to Build:**
- `app/dashboard/orders/page.jsx` (orders list)
- `app/dashboard/orders/[id]/page.jsx` (order details)

**Components Required:**
```
components/
├── orders/
│   ├── OrderCard.jsx
│   ├── OrderList.jsx
│   ├── OrderDetails.jsx
│   └── OrderTimeline.jsx
```

**API Routes Used:**
- `GET /api/v1/orders` (user's orders)
- `GET /api/v1/orders/:id` (single order)

**API Documentation:**

```javascript
// Get User Orders
GET /api/v1/orders?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-20260314-123456",
        status: "delivered",
        totalAmount: 172.78,
        items: [...],
        createdAt: "2026-03-14T...",
        updatedAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Single Order
GET /api/v1/orders/507f...
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    _id: "507f...",
    orderNumber: "ORD-20260314-123456",
    status: "delivered",
    items: [...],
    summary: { subtotal, tax, total },
    shipping: { address, method, trackingNumber },
    payment: { method, status },
    timeline: [...]
  }
}
```

---

### Stage 7: Affiliate Registration & Dashboard (Week 4)

**Purpose:** Allow users to become affiliates and track earnings.

**Frontend Pages to Build:**
- `app/affiliate/register/page.jsx` (registration form)
- `app/affiliate/dashboard/page.jsx` (main dashboard)
- `app/affiliate/referrals/page.jsx` (referral clicks)
- `app/affiliate/sales/page.jsx` (attributed sales)

**Components Required:**
```
components/
├── affiliate/
│   ├── AffiliateRegistrationForm.jsx
│   ├── AffiliateDashboard.jsx
│   ├── ReferralLink.jsx
│   ├── ReferralStats.jsx
│   ├── SalesTable.jsx
│   ├── CommissionChart.jsx
│   └── PayoutCard.jsx
```

**State Management:**
```javascript
// stores/affiliateStore.js (Zustand)
- affiliate (null | affiliate object)
- dashboard (stats object)
- isAffiliate (boolean)
- affiliateCode (null | string)
- fetchAffiliateDashboard()
- registerAffiliate(data)
- getReferralCode()
```

**API Routes Used:**
- `POST /api/v1/affiliate/register`
- `GET /api/v1/affiliate/dashboard`
- `GET /api/v1/tracking/referrals/:affiliateId`
- `GET /api/v1/tracking/sales/:affiliateId`
- `GET /api/v1/tracking/stats/:affiliateId`
- `GET /api/v1/affiliate/commissions`
- `GET /api/v1/leaderboard`

**API Documentation:**

```javascript
// Register as Affiliate
POST /api/v1/affiliate/register
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Content-Type: "application/json"
}
Body: {
  website: "https://mydomain.com",
  trafficSources: ["social", "blog", "email"],
  bankDetails: {
    accountName: "John Doe",
    accountNumber: "123456789",
    bankName: "Example Bank"
  },
  termsAccepted: true
}
Response: {
  success: true,
  message: "Affiliate account created and activated",
  data: {
    affiliateId: "69b4fcf27d8e2dc3b40db4b4",
    affiliateCode: "AFFP038HUSQ75C",
    referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
    status: "active"
  }
}

// Get Affiliate Dashboard
GET /api/v1/affiliate/dashboard
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    dashboard: {
      _id: "69b4fcf27d8e2dc3b40db4b4",
      affiliateCode: "AFFP038HUSQ75C",
      status: "active",
      referralUrl: "https://sphereofkings.com/?ref=AFFP038HUSQ75C",
      stats: {
        totalClicks: 150,
        totalConversions: 12,
        conversionRate: 8.0,
        totalCommissions: 1550.00,
        uniqueVisitorCount: 120
      },
      earnings: {
        totalEarnings: 500.00,
        pendingEarnings: 150.00,
        paidEarnings: 350.00,
        minimumPayoutThreshold: 50,
        meetsThreshold: true,
        hasPayoutConfigured: false
      },
      status: {
        isActive: true,
        hasVerifiedEmail: true,
        hasAcceptedTerms: true
      }
    }
  }
}

// Get Referral Clicks
GET /api/v1/tracking/referrals/:affiliateId?page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    referrals: [
      {
        _id: "69b505f02592ac3219b426a3",
        affiliateCode: "AFFP038HUSQ75C",
        visitorId: "visitor_...",
        ipAddress: "127.0.0.1",
        device: "desktop",
        referralSource: "direct",
        convertedToSale: false,
        createdAt: "2026-03-14T06:53:36.184Z"
      }
    ],
    pagination: { ... }
  }
}

// Get Commissions
GET /api/v1/affiliate/commissions?status=pending&page=1&limit=20
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    commissions: [
      {
        _id: "507f...",
        orderId: "507f...",
        amount: 15.50,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get Leaderboard
GET /api/v1/leaderboard?limit=10&sortBy=totalEarnings
Response: {
  success: true,
  data: {
    affiliates: [
      {
        rank: 1,
        affiliateCode: "AFFP038HUSQ75C",
        totalEarnings: 5000.00,
        totalSales: 100,
        totalClicks: 500
      }
    ]
  }
}
```

---

### Stage 8: Referral Integration (Week 4)

**Purpose:** Track referral links and attribute sales to affiliates.

**Frontend Implementation:**
- Add referral link copy functionality
- Display tracking code on product pages
- Handle `?ref=AFFILIATE_CODE` URL parameter
- Store affiliate cookie for attribution

**API Routes Used:**
- `GET /api/v1/ref/:affiliateCode` (public tracking)
- `GET /api/v1/tracking/stats/:affiliateId`

**Implementation Pattern:**

```javascript
// hooks/useReferral.js
'use client';
import { useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

export function useReferral() {
  const searchParams = useSearchParams();

  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      // Call tracking endpoint
      fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/ref/${refCode}`)
        .catch(err => console.error('Referral tracking error:', err));
      
      // Store in localStorage for checkout
      localStorage.setItem('affiliateCode', refCode);
    }
  }, [searchParams]);
}

// app/page.jsx (homepage)
'use client';
import { useReferral } from '@/hooks/useReferral';

export default function HomePage() {
  useReferral(); // Automatically track referral
  
  return (
    // ... home page content
  );
}
```

---

### Stage 9: Affiliate Payout Management (Week 4-5)

**Purpose:** Allow affiliates to request and track payouts.

**Frontend Pages to Build:**
- `app/affiliate/payouts/page.jsx` (payout history)
- `app/affiliate/settings/page.jsx` (payout settings)

**Components Required:**
```
components/
├── payouts/
│   ├── PayoutHistory.jsx
│   ├── PayoutSettings.jsx
│   ├── PaymentMethodForm.jsx
│   └── WithdrawRequest.jsx
```

**API Routes Used:**
- `GET /api/v1/payouts` (payout history)
- `POST /api/v1/payouts/request` (request payout)
- `POST /api/v1/affiliate/payout-settings` (update settings)
- `GET /api/v1/affiliate/commissions/stats` (commission stats)

**API Documentation:**

```javascript
// Get Payout History
GET /api/v1/payouts?page=1&limit=20&status=completed
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    payouts: [
      {
        _id: "507f...",
        amount: 500.00,
        status: "completed",
        method: "stripe",
        processedAt: "2026-03-14T...",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Request Payout
POST /api/v1/payouts/request
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  method: "stripe",
  beneficiary: "acct_1234567890"
}
Response: {
  success: true,
  message: "Payout request submitted",
  data: {
    _id: "507f...",
    amount: 250.00,
    status: "pending",
    createdAt: "2026-03-14T..."
  }
}

// Update Payout Settings
POST /api/v1/affiliate/payout-settings
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Body: {
  payoutMethod: "stripe",
  payoutData: "acct_1234567890abcdefg",
  minimumThreshold: 50
}
Response: {
  success: true,
  message: "Payout settings updated",
  data: {
    payoutMethod: "stripe",
    minimumThreshold: 50
  }
}
```

---

### Stage 10: Admin Dashboard (Week 5)

**Purpose:** Provide admin interface for managing platform.

**Frontend Pages to Build:**
- `app/admin/dashboard/page.jsx` (main dashboard)
- `app/admin/orders/page.jsx` (orders management)
- `app/admin/products/page.jsx` (products management)
- `app/admin/affiliates/page.jsx` (affiliates management)
- `app/admin/analytics/page.jsx` (analytics)

**Components Required:**
```
components/
├── admin/
│   ├── AdminDashboard.jsx
│   ├── OrdersTable.jsx
│   ├── ProductsManagement.jsx
│   ├── AffiliatesOverview.jsx
│   ├── AnalyticsChart.jsx
│   └── SystemStats.jsx
```

**API Routes Used:**
- `GET /api/v1/admin/dashboard`
- `GET /api/v1/admin/orders`
- `GET /api/v1/admin/products`
- `GET /api/v1/admin/affiliates`
- `GET /api/v1/admin/commissions`
- `GET /api/v1/admin/payouts`
- `GET /api/v1/admin/stats`

**API Documentation:**

```javascript
// Get Admin Dashboard
GET /api/v1/admin/dashboard
Headers: {
  Authorization: "Bearer {JWT_TOKEN}",
  Role: "admin"  // Verified by backend
}
Response: {
  success: true,
  data: {
    overview: {
      totalUsers: 150,
      totalOrders: 450,
      totalRevenue: 45000.00,
      totalAffiliates: 45,
      totalCommissions: 4500.00
    },
    recentOrders: [...],
    topProducts: [...],
    affiliateStats: {...}
  }
}

// Get All Orders (Admin)
GET /api/v1/admin/orders?page=1&limit=20&status=pending
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    orders: [
      {
        _id: "507f...",
        orderNumber: "ORD-...",
        customer: { name, email },
        totalAmount: 172.78,
        status: "pending",
        createdAt: "2026-03-14T..."
      }
    ],
    pagination: { ... }
  }
}

// Get All Affiliates (Admin)
GET /api/v1/admin/affiliates?page=1&limit=20&status=active
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    affiliates: [
      {
        _id: "507f...",
        affiliateCode: "AFFP038HUSQ75C",
        user: { name, email },
        status: "active",
        totalEarnings: 1500.00,
        totalSales: 45,
        totalClicks: 200
      }
    ],
    pagination: { ... }
  }
}

// Get System Stats (Admin)
GET /api/v1/admin/stats
Headers: { Authorization: "Bearer {JWT_TOKEN}" }
Response: {
  success: true,
  data: {
    systemStatus: {
      apiHealth: "healthy",
      databaseStatus: "connected",
      uptime: "45 days",
      lastBackup: "2026-03-14T..."
    },
    performance: {
      avgResponseTime: "145ms",
      requestsPerMinute: 450
    }
  }
}
```

---

## Part 3: Frontend Folder Structure

```
spherekings-frontend/
├── app/
│   ├── (auth)/
│   │   ├── login/
│   │   ├── register/
│   │   └── forgot-password/
│   ├── (marketplace)/
│   │   ├── products/
│   │   ├── search/
│   │   └── category/
│   ├── cart/
│   ├── checkout/
│   │   ├── page.jsx
│   │   ├── success/
│   │   └── cancel/
│   ├── dashboard/
│   │   ├── profile/
│   │   ├── orders/
│   │   ├── settings/
│   │   └── page.jsx
│   ├── affiliate/
│   │   ├── register/
│   │   ├── dashboard/
│   │   ├── referrals/
│   │   ├── sales/
│   │   ├── payouts/
│   │   └── settings/
│   ├── admin/
│   │   ├── dashboard/
│   │   ├── orders/
│   │   ├── products/
│   │   ├── affiliates/
│   │   ├── commissions/
│   │   ├── analytics/
│   │   └── settings/
│   ├── api/
│   │   └── trpc/
│   ├── layout.jsx
│   └── page.jsx
│
├── components/
│   ├── auth/
│   │   ├── LoginForm.jsx
│   │   ├── RegisterForm.jsx
│   │   └── ProtectedRoute.jsx
│   ├── products/
│   │   ├── ProductCard.jsx
│   │   ├── ProductGrid.jsx
│   │   ├── ProductFilter.jsx
│   │   └── ProductDetails.jsx
│   ├── cart/
│   │   ├── CartItem.jsx
│   │   ├── CartSummary.jsx
│   │   └── CartActions.jsx
│   ├── checkout/
│   │   ├── CheckoutForm.jsx
│   │   ├── ShippingForm.jsx
│   │   └── PaymentForm.jsx
│   ├── affiliate/
│   │   ├── AffiliateDashboard.jsx
│   │   ├── ReferralLink.jsx
│   │   └── CommissionChart.jsx
│   ├── admin/
│   │   ├── AdminDashboard.jsx
│   │   ├── OrdersTable.jsx
│   │   └── AnalyticsChart.jsx
│   ├── layout/
│   │   ├── Navbar.jsx
│   │   ├── Footer.jsx
│   │   ├── Sidebar.jsx
│   │   └── BreadcrumbNav.jsx
│   └── common/
│       ├── Button.jsx
│       ├── Modal.jsx
│       ├── Toast.jsx
│       └── LoadingSpinner.jsx
│
├── hooks/
│   ├── useAuth.js
│   ├── useCart.js
│   ├── useCheckout.js
│   ├── useAffiliate.js
│   ├── useProfile.js
│   └── useReferral.js
│
├── stores/
│   ├── authStore.js
│   ├── cartStore.js
│   ├── checkoutStore.js
│   ├── productStore.js
│   ├── affiliateStore.js
│   └── adminStore.js
│
├── services/
│   ├── api/
│   │   ├── client.js
│   │   ├── authService.js
│   │   ├── productService.js
│   │   ├── cartService.js
│   │   ├── checkoutService.js
│   │   ├── orderService.js
│   │   ├── affiliateService.js
│   │   ├── payoutService.js
│   │   └── adminService.js
│   └── localStorage.js
│
├── utils/
│   ├── validators.js
│   ├── formatters.js
│   ├── constants.js
│   └── helpers.js
│
├── styles/
│   ├── globals.css
│   ├── variables.css
│   └── tailwind.config.js
│
├── public/
│   ├── images/
│   ├── icons/
│   └── fonts/
│
├── .env.local
├── next.config.js
├── tailwind.config.js
├── jsconfig.json
└── package.json
```

---

## Part 4: API Service Layer Architecture

```javascript
// services/api/client.js
'use client';
import axios from 'axios';
import { useAuth } from '@/hooks/useAuth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export const createApiClient = (token) => {
  const client = axios.create({
    baseURL: `${API_BASE_URL}/api/v1`,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (token) {
    client.defaults.headers.common['Authorization'] = `Bearer ${token}`;
  }

  // Response interceptor for error handling
  client.interceptors.response.use(
    (response) => response.data,
    (error) => {
      if (error.response?.status === 401) {
        // Handle token refresh
        window.location.href = '/login';
      }
      throw error;
    }
  );

  return client;
};

// services/api/authService.js
export const authService = {
  login: async (email, password) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return response.json();
  },

  register: async (userData) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    return response.json();
  },
};

// services/api/productService.js
export const productService = {
  fetchProducts: async (filters = {}) => {
    const params = new URLSearchParams(filters);
    const response = await fetch(
      `${API_BASE_URL}/api/v1/products?${params}`
    );
    return response.json();
  },

  fetchProduct: async (id) => {
    const response = await fetch(`${API_BASE_URL}/api/v1/products/${id}`);
    return response.json();
  },
};
```

---

## Part 5: State Management Architecture

```javascript
// stores/authStore.js using Zustand
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (data.success) {
        localStorage.setItem('token', data.data
```

