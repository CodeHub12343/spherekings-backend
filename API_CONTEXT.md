# Spherekings API Context & Documentation
**Status:** Production Ready | Last Updated: March 14, 2026

---

## Table of Contents
1. [Architecture Overview](#architecture-overview)
2. [Authentication & Authorization](#authentication--authorization)
3. [API Response Format](#api-response-format)
4. [Complete Endpoint Reference](#complete-endpoint-reference)
5. [Data Models](#data-models)
6. [Error Handling](#error-handling)
7. [Middleware & Security](#middleware--security)

---

## Architecture Overview

### Technology Stack
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB + Mongoose ODM
- **Payment:** Stripe API (Live & Test modes)
- **File Storage:** Cloudinary (Images & Documents)
- **Authentication:** JWT (Access & Refresh tokens)
- **Security:** Helmet, CORS, Rate Limiting, Request Validation

### API Configuration
```
Base URL: http://localhost:5000 (development)
API Prefix: /api
API Version: v1
Rate Limit: 100 requests per 15 minutes per IP
Timeout: 30 seconds per request
Cache: Redis (optional, for performance)
```

### Server Architecture
```
Express App
├── Global Middleware (Helmet, CORS, Logger)
├── Routes (11 route modules)
│   ├── Auth Routes → Auth Controller → Auth Service
│   ├── Product Routes → Product Controller → Product Service
│   ├── Cart Routes → Cart Controller → Cart Service
│   ├── Checkout Routes → Checkout Controller → Checkout Service
│   ├── Order Routes → Order Controller → Order Service
│   ├── Affiliate Routes → Affiliate Controller → Affiliate Service
│   ├── Referral Tracking Routes → Tracking Controller → Tracking Service
│   ├── Commission Routes → Commission Controller → Commission Service
│   ├── Payout Routes → Payout Controller → Payout Service
│   ├── Admin Routes → Admin Controller → Admin Service
│   ├── File Upload Routes → Upload Controller → Upload Service
│   └── Webhook Routes → Webhook Handler
├── Error Handler Middleware
└── Database Connection
```

---

## Authentication & Authorization

### JWT Token Structure

**Access Token:**
- Duration: 15 minutes
- Contains: `userId`, `email`, `role`
- Location: `Authorization: Bearer <token>` header
- Used for: API requests

**Refresh Token:**
- Duration: 7 days
- Stored: HTTPOnly cookie (secure) + localStorage
- Used for: Obtaining new access token

### Authentication Flow

```
1. User registers or logs in
2. Backend returns: { accessToken, refreshToken, user }
3. Frontend stores tokens (localStorage + cookie)
4. Every API request includes: Authorization: Bearer <accessToken>
5. If token expires (401): Send refreshToken to /auth/refresh
6. If both tokens invalid: Redirect to login
```

### Authorization Levels

**Public Endpoints**
- No authentication required
- Examples: Product listing, referral tracking, leaderboard

**Protected Endpoints**
- Requires valid JWT token + `role: 'customer'` or `'affiliate'` or `'admin'`
- Includes: Cart, Orders, User Profile, Affiliate Dashboard

**Admin Only Endpoints**
- Requires valid JWT token + `role: 'admin'`
- Includes: Product Management, User Management, Commission Approval, Payouts

**Affiliate Only Endpoints**
- Requires valid JWT token + `role: 'affiliate'` + `affiliateStatus: 'active'`
- Includes: Referral Stats, Commission Viewing, Payout Requests

---

## API Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "statusCode": 200,
  "data": { /* response data */ },
  "meta": {
    "timestamp": "2026-03-14T10:30:00Z",
    "version": "1.0",
    "path": "/api/endpoint"
  }
}
```

### Paginated Response
```json
{
  "success": true,
  "statusCode": 200,
  "data": {
    "items": [ /* array of items */ ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 150,
      "pages": 8,
      "hasNextPage": true,
      "hasPrevPage": false
    }
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [ /* specific errors */ ]
  }
}
```

---

## Complete Endpoint Reference

### 1. AUTHENTICATION ENDPOINTS (`/api/auth`)

#### Register User
```
POST /api/auth/register
Content-Type: application/json
Authentication: None (Public)

Request Body:
{
  "email": "user@example.com" (string, required, valid email, unique),
  "password": "SecurePass123!" (string, required, min 8 chars, must include uppercase, lowercase, number),
  "firstName": "John" (string, required, 2-50 chars),
  "lastName": "Doe" (string, required, 2-50 chars)
}

Response (201 Created):
{
  "success": true,
  "data": {
    "user": {
      "_id": "objectId",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "isEmailVerified": false
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Login
```
POST /api/auth/login
Content-Type: application/json
Authentication: None (Public)

Request Body:
{
  "email": "user@example.com" (string, required),
  "password": "SecurePass123!" (string, required)
}

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "_id": "objectId",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "lastLogin": "2026-03-14T10:30:00Z"
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

#### Get Current User
```
GET /api/auth/me
Authentication: Required (Bearer token)

Response (200 OK):
{
  "success": true,
  "data": {
    "user": {
      "_id": "objectId",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "customer",
      "profileImage": "url",
      "address": {
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "US"
      },
      "createdAt": "2026-03-01T00:00:00Z"
    }
  }
}
```

#### Refresh Token
```
POST /api/auth/refresh
Content-Type: application/json
Authentication: Required (Bearer refresh token)

Request Body:
{
  "refreshToken": "refresh_token_string"
}

Response (200 OK):
{
  "success": true,
  "data": {
    "accessToken": "new_jwt_token",
    "refreshToken": "new_refresh_token"
  }
}
```

#### Update Profile
```
PUT /api/auth/profile
Content-Type: application/json
Authentication: Required

Request Body:
{
  "firstName": "John" (optional),
  "lastName": "Doe" (optional),
  "phoneNumber": "+1234567890" (optional),
  "address": {
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  } (optional),
  "profileImage": "url" (optional),
  "bio": "User biography" (optional, max 500 chars)
}

Response (200 OK):
{
  "success": true,
  "data": { "user": { /* updated user data */ } }
}
```

#### Change Password
```
POST /api/auth/change-password
Content-Type: application/json
Authentication: Required

Request Body:
{
  "currentPassword": "OldPass123!",
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}

Response (200 OK):
{
  "success": true,
  "message": "Password updated successfully"
}
```

#### Forgot Password
```
POST /api/auth/forgot-password
Content-Type: application/json
Authentication: None (Public)

Request Body:
{
  "email": "user@example.com"
}

Response (200 OK):
{
  "success": true,
  "message": "Password reset email sent. Check your inbox.",
  "data": {
    "resetEmailSent": true,
    "expiresIn": "1 hour"
  }
}
```

#### Reset Password (with token from email)
```
POST /api/auth/reset-password/:resetToken
Content-Type: application/json
Authentication: None (Public)

Request Body:
{
  "newPassword": "NewPass456!",
  "confirmPassword": "NewPass456!"
}

Response (200 OK):
{
  "success": true,
  "message": "Password reset successfully"
}
```

---

### 2. PRODUCT ENDPOINTS (`/api/products`)

#### Get All Products
```
GET /api/products
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20, max: 100)
  - sort: string (newest|popular|price_low|price_high, default: newest)
  - category: string (filter by category)
  - minPrice: number (price >= this)
  - maxPrice: number (price <= this)
  - featured: boolean (true|false)
  - search: string (search in name/description)

Authentication: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "products": [
      {
        "_id": "objectId",
        "name": "Product Name",
        "description": "Product description",
        "price": 99.99,
        "images": ["url1", "url2"],
        "category": "electronics",
        "sku": "PROD-001",
        "stock": 50,
        "status": "active",
        "isFeatured": true,
        "rating": 4.5,
        "reviewCount": 125
      }
      /* ... more products ... */
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 500,
      "pages": 25,
      "hasNextPage": true
    }
  }
}
```

#### Get Product Details
```
GET /api/products/:productId
Authentication: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "product": {
      "_id": "objectId",
      "name": "Product Name",
      "description": "Detailed description",
      "price": 99.99,
      "images": ["url1", "url2", "url3"],
      "variants": [
        {
          "name": "color",
          "options": ["red", "blue", "green"]
        },
        {
          "name": "size",
          "options": ["S", "M", "L", "XL"]
        }
      ],
      "category": "electronics",
      "sku": "PROD-001",
      "stock": 50,
      "status": "active",
      "isFeatured": true,
      "rating": 4.5,
      "reviewCount": 125,
      "createdAt": "2026-01-01T00:00:00Z"
    }
  }
}
```

#### Get Featured Products
```
GET /api/products/featured
Query Parameters:
  - limit: number (default: 10)

Authentication: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "products": [ /* array of featured products (same structure as above) */ ]
  }
}
```

#### Search Products
```
GET /api/products/search
Query Parameters:
  - q: string (search query, min 2 chars) - REQUIRED
  - page: number (default: 1)
  - limit: number (default: 20)

Authentication: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "products": [ /* matching products */ ],
    "pagination": { /* pagination data */ }
  }
}
```

#### Create Product (Admin Only)
```
POST /api/products
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "name": "New Product" (string, required, 3-100 chars),
  "description": "Product description" (string, required, 20-2000 chars),
  "price": 99.99 (number, required, >= 0.01),
  "category": "electronics" (string, required),
  "images": ["url1", "url2"] (array of strings, required, 1-10 items),
  "variants": [
    { "name": "color", "options": ["red", "blue"] },
    { "name": "size", "options": ["S", "M", "L"] }
  ] (array, optional, max 5 variants),
  "sku": "PROD-001" (string, required, unique, uppercase),
  "stock": 100 (number, required, >= 0),
  "isFeatured": false (boolean, optional)
}

Response (201 Created):
{
  "success": true,
  "data": { "product": { /* created product */ } }
}
```

#### Update Product (Admin Only)
```
PUT /api/products/:productId
Content-Type: application/json
Authentication: Required + Admin role

Request Body: (all fields optional, same structure as create)
{
  "name": "Updated Name",
  "description": "Updated description",
  "price": 89.99,
  /* ... other updatable fields ... */
}

Response (200 OK):
{
  "success": true,
  "data": { "product": { /* updated product */ } }
}
```

#### Delete Product (Soft Delete, Admin Only)
```
DELETE /api/products/:productId
Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "message": "Product deleted successfully"
}
```

#### Update Product Stock (Admin Only)
```
PUT /api/products/:productId/stock
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "quantity": 50 (number, required, full value to set stock to),
  "operation": "set" (string: "set", "increment", "decrement")
}

Response (200 OK):
{
  "success": true,
  "data": {
    "product": {
      "_id": "objectId",
      "name": "Product Name",
      "stock": 50,
      "status": "active"
    }
  }
}
```

---

### 3. CART ENDPOINTS (`/api/cart`)

#### Get User's Cart
```
GET /api/cart
Authentication: Required

Response (200 OK):
{
  "success": true,
  "data": {
    "cart": {
      "_id": "cartObjectId",
      "userId": "userObjectId",
      "items": [
        {
          "_id": "itemObjectId",
          "productId": "productObjectId",
          "productName": "Product Name",
          "price": 99.99,
          "quantity": 2,
          "variant": {
            "color": "red",
            "size": "M"
          },
          "subtotal": 199.98
        }
        /* ... more items ... */
      ],
      "subtotal": 199.98,
      "estimatedTax": 15.99,
      "estimatedTotal": 215.97,
      "lastUpdated": "2026-03-14T10:00:00Z"
    }
  }
}
```

#### Add to Cart
```
POST /api/cart/add
Content-Type: application/json
Authentication: Required

Request Body:
{
  "productId": "objectId" (string, required),
  "quantity": 2 (number, required, 1-1000),
  "variant": {
    "color": "red",
    "size": "M"
  } (object, optional)
}

Response (200 OK):
{
  "success": true,
  "message": "Item added to cart",
  "data": {
    "cart": { /* updated cart with new item */ }
  }
}

Errors:
- 404: Product not found
- 400: Out of stock
- 400: Invalid quantity
```

#### Update Cart Item
```
POST /api/cart/update
Content-Type: application/json
Authentication: Required

Request Body:
{
  "productId": "objectId" (string, required),
  "quantity": 5 (number, required, 0+ for removal, 1+ for update),
  "variant": { /* optional update */ }
}

Response (200 OK):
{
  "success": true,
  "data": { "cart": { /* updated cart */ } }
}
```

#### Remove from Cart
```
POST /api/cart/remove
Content-Type: application/json
Authentication: Required

Request Body:
{
  "productId": "objectId" (string, required)
}

Response (200 OK):
{
  "success": true,
  "message": "Item removed from cart",
  "data": { "cart": { /* updated cart */ } }
}
```

#### Clear Cart
```
POST /api/cart/clear
Authentication: Required

Response (200 OK):
{
  "success": true,
  "message": "Cart cleared",
  "data": { "cart": { "items": [] } }
}
```

#### Get Cart Summary
```
GET /api/cart/summary
Authentication: Required

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": {
      "itemCount": 3,
      "uniqueProducts": 2,
      "subtotal": 299.97,
      "estimatedTax": 23.99,
      "estimatedShipping": 10.00,
      "estimatedTotal": 333.96
    }
  }
}
```

#### Validate Cart (Before Checkout)
```
POST /api/cart/validate
Authentication: Required

Response (200 OK - Valid):
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "Cart is ready for checkout"
  }
}

Response (400 - Invalid):
{
  "success": false,
  "data": {
    "isValid": false,
    "errors": [
      {
        "productId": "objectId",
        "productName": "Product Name",
        "issue": "out_of_stock" | "price_changed" | "unavailable",
        "details": "..."
      }
    ]
  }
}
```

---

### 4. CHECKOUT ENDPOINTS (`/api/checkout`)

#### Create Checkout Session (Stripe)
```
POST /api/checkout/create-session
Content-Type: application/json
Authentication: Required

Request Body:
{
  "cartItems": [
    {
      "productId": "objectId",
      "quantity": 2,
      "variant": {
        "color": "red",
        "size": "M"
      }
    }
    /* ... more items ... */
  ] (array, required, at least 1 item),
  
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "street": "123 Main St",
    "city": "New York",
    "state": "NY",
    "postalCode": "10001",
    "country": "US"
  } (object, required),
  
  "affiliateCode": "AFFABC12DEF3" (string, optional - only if referred by affiliate)
}

Response (200 OK):
{
  "success": true,
  "data": {
    "sessionId": "cs_test_..." (Stripe session ID),
    "clientSecret": "pi_test_..." (Stripe client secret),
    "url": "https://checkout.stripe.com/..." (Stripe checkout URL),
    "expires_at": "2026-03-14T11:30:00Z"
  }
}

Errors:
- 400: Cart validation failed
- 400: Invalid shipping address
- 400: Affiliate code not found (if provided)
- 402: Stripe payment processing failed
```

#### Stripe Webhook Handler
```
POST /api/checkout/webhook
Content-Type: application/json (with Stripe signature header)
Authentication: None (Webhook signature verified)

Handles Events:
- checkout.session.completed (payment successful - creates order)
- charge.failed (payment failed - notifies user)
- charge.refunded (refund processed - updates order)

No request body needed - Stripe sends event data to this endpoint
```

#### Get Checkout Session Details
```
GET /api/checkout/session/:sessionId
Authentication: Required

Response (200 OK):
{
  "success": true,
  "data": {
    "session": {
      "sessionId": "cs_test_...",
      "status": "open" | "complete" | "expired",
      "paymentStatus": "unpaid" | "paid",
      "customer": {
        "email": "user@example.com"
      },
      "metadata": {
        "userId": "objectId",
        "orderId": "objectId"
      },
      "createdAt": "2026-03-14T10:30:00Z",
      "expiresAt": "2026-03-14T11:30:00Z"
    }
  }
}
```

#### Request Refund
```
POST /api/checkout/refund
Content-Type: application/json
Authentication: Required

Request Body:
{
  "orderId": "objectId" (string, required),
  "reason": "changed_mind" | "defective" | "not_as_described" | "other" (string, required),
  "comments": "Additional explanation" (string, optional)
}

Response (200 OK):
{
  "success": true,
  "message": "Refund request submitted",
  "data": {
    "refundId": "objectId",
    "status": "pending_review",
    "orderId": "objectId",
    "estimatedRefund": 99.99
  }
}
```

---

### 5. ORDER ENDPOINTS (`/api/orders`)

#### Get User's Orders
```
GET /api/orders
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 10)
  - status: string (filter: pending|processing|confirmed|shipped|delivered|cancelled|refunded)
  - sort: string (newest|oldest|highest|lowest, default: newest)
  - dateFrom: ISO date (filter orders after this date)
  - dateTo: ISO date (filter orders before this date)

Authentication: Required

Response (200 OK):
{
  "success": true,
  "data": {
    "orders": [
      {
        "_id": "objectId",
        "orderNumber": "ORD-20260314-ABC123",
        "createdAt": "2026-03-14T10:00:00Z",
        "items": [
          {
            "productId": "objectId",
            "productName": "Product Name",
            "quantity": 2,
            "price": 99.99,
            "subtotal": 199.98
          }
        ],
        "subtotal": 199.98,
        "tax": 15.99,
        "shipping": 10.00,
        "total": 225.97,
        "paymentStatus": "paid",
        "orderStatus": "shipped",
        "shippingAddress": { /* ... */ },
        "estimatedDelivery": "2026-03-21T00:00:00Z"
      }
      /* ... more orders ... */
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Get Single Order Details
```
GET /api/orders/:orderId
Authentication: Required (user must own order)

Response (200 OK):
{
  "success": true,
  "data": {
    "order": {
      "_id": "objectId",
      "orderNumber": "ORD-20260314-ABC123",
      "userId": "objectId",
      "createdAt": "2026-03-14T10:00:00Z",
      "items": [ /* detailed items array */ ],
      "subtotal": 199.98,
      "tax": 15.99,
      "taxRate": 0.08,
      "shipping": 10.00,
      "discount": 0,
      "total": 225.97,
      "paymentStatus": "paid",
      "orderStatus": "shipped",
      "paymentDetails": {
        "stripeSessionId": "cs_test_...",
        "chargeId": "ch_test_...",
        "paidAt": "2026-03-14T10:15:00Z",
        "currency": "usd"
      },
      "shippingAddress": {
        "firstName": "John",
        "lastName": "Doe",
        "email": "john@example.com",
        "phone": "+1234567890",
        "street": "123 Main St",
        "city": "New York",
        "state": "NY",
        "postalCode": "10001",
        "country": "US"
      },
      "notes": "...",
      "affiliateDetails": {
        "affiliateCode": "AFFABC12DEF3",
        "commissionRate": 0.10,
        "commissionAmount": 20.00,
        "status": "pending",
        "referralClickId": "objectId"
      }
    }
  }
}
```

#### Search/Filter Orders (Advanced)
```
POST /api/orders/search
Content-Type: application/json
Authentication: Required

Request Body:
{
  "query": "keyword search in order number or product name",
  "filters": {
    "status": "shipped",
    "paymentStatus": "paid",
    "dateRange": {
      "from": "2026-03-01T00:00:00Z",
      "to": "2026-03-14T23:59:59Z"
    },
    "minTotal": 100,
    "maxTotal": 500
  }
}

Response (200 OK): (same as Get Orders response)
```

#### Get Order Summary Stats
```
GET /api/orders/summary
Authentication: Required

Response (200 OK):
{
  "success": true,
  "data": {
    "summary": {
      "totalOrders": 15,
      "totalSpent": 3750.50,
      "averageOrderValue": 250.03,
      "lastOrderDate": "2026-03-14T10:00:00Z",
      "ordersByStatus": {
        "pending": 1,
        "processing": 0,
        "confirmed": 0,
        "shipped": 2,
        "delivered": 12,
        "cancelled": 0,
        "refunded": 0
      }
    }
  }
}
```

#### Get Order Invoice (PDF data)
```
GET /api/orders/:orderId/invoice
Authentication: Required (user must own order)

Response (200 OK):
{
  "success": true,
  "data": {
    "invoice": {
      "invoiceNumber": "INV-20260314-ABC123",
      "orderNumber": "ORD-20260314-ABC123",
      "issueDate": "2026-03-14T10:00:00Z",
      "dueDate": "2026-04-14T00:00:00Z",
      "status": "paid",
      "billTo": {
        "name": "John Doe",
        "email": "john@example.com",
        "address": "..."
      },
      "items": [ /* items array */ ],
      "subtotal": 199.98,
      "tax": 15.99,
      "total": 215.97,
      "pdfUrl": "https://..." /* URL to downloadable PDF */
    }
  }
}
```

---

### 6. AFFILIATE ENDPOINTS (`/api/affiliate`, `/api/leaderboard`)

#### Register as Affiliate
```
POST /api/affiliate/register
Content-Type: application/json
Authentication: Required

Request Body:
{
  "website": "https://mywebsite.com" (string, required, valid URL),
  "payoutMethod": "stripe" | "bank_transfer" | "paypal" (string, required),
  "payoutDetails": "stripe_account_id | IBAN | PayPal email" (string, required),
  "agreeToTerms": true (boolean, required)
}

Response (200 OK):
{
  "success": true,
  "message": "Affiliate account created successfully",
  "data": {
    "affiliate": {
      "_id": "objectId",
      "userId": "objectId",
      "affiliateCode": "AFFABC12DEF3",
      "referralUrl": "https://spherekings.com/ref/AFFABC12DEF3",
      "status": "active" (or "pending" if email verification required),
      "commissionRate": 10,
      "totalEarnings": 0.00,
      "pendingEarnings": 0.00,
      "createdAt": "2026-03-14T10:00:00Z"
    }
  }
}

Errors:
- 400: User already an affiliate
- 400: Invalid payout details
- 409: Terms must be accepted
```

#### Get Affiliate Profile/Dashboard
```
GET /api/affiliate/dashboard
Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "affiliate": {
      "_id": "objectId",
      "affiliateCode": "AFFABC12DEF3",
      "referralUrl": "https://spherekings.com/ref/AFFABC12DEF3",
      "status": "active",
      "commissionRate": 10,
      "totalClicks": 150,
      "totalSales": 5,
      "totalEarnings": 250.00,
      "pendingEarnings": 75.00,
      "paidEarnings": 175.00,
      "conversionRate": 3.33,
      "averageOrderValue": 75.00,
      "lastLoginAt": "2026-03-14T10:00:00Z",
      "lastSharedAt": "2026-03-14T09:00:00Z"
    }
  }
}
```

#### Get Affiliate Referrals (Click History)
```
GET /api/affiliate/referrals
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (converted|pending|expired)
  - dateFrom: ISO date
  - dateTo: ISO date
  - device: string (mobile|tablet|desktop)

Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "referrals": [
      {
        "_id": "objectId",
        "affiliateCode": "AFFABC12DEF3",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "referralSource": "email" | "facebook" | "twitter" | "direct" | "other",
        "device": "mobile" | "tablet" | "desktop",
        "country": "US",
        "state": "NY",
        "clickedAt": "2026-03-14T10:00:00Z",
        "convertedToSale": false,
        "orderId": null,
        "commissionAmount": null
      }
      /* ... more referrals ... */
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Get Affiliate Sales (Converted Orders)
```
GET /api/affiliate/sales
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (pending|approved|paid|reversed)
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "sales": [
      {
        "_id": "objectId",
        "referralId": "objectId",
        "orderId": "objectId",
        "orderNumber": "ORD-20260314-ABC123",
        "orderValue": 200.00,
        "commissionRate": 0.10,
        "commissionAmount": 20.00,
        "status": "pending" | "approved" | "paid" | "reversed",
        "convertedAt": "2026-03-14T10:05:00Z",
        "approvedAt": null,
        "paidAt": null
      }
      /* ... more sales ... */
    ],
    "pagination": { /* ... */ },
    "summary": {
      "totalSales": 5,
      "totalValue": 1000.00,
      "totalEarnings": 100.00,
      "byStatus": {
        "pending": { count: 2, earnings: 30.00 },
        "approved": { count: 1, earnings: 15.00 },
        "paid": { count: 2, earnings: 55.00 }
      }
    }
  }
}
```

#### Get Affiliate Analytics
```
GET /api/affiliate/analytics
Query Parameters:
  - period: string (week|month|quarter|year, default: month)
  - dateFrom: ISO date (overrides period)
  - dateTo: ISO date

Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "analytics": {
      "period": "2026-02-14 to 2026-03-14",
      "totalClicks": 150,
      "totalConversions": 5,
      "conversionRate": 3.33,
      "totalEarnings": 100.00,
      "averageOrderValue": 200.00,
      "clicksBySource": {
        "email": 75,
        "facebook": 40,
        "twitter": 20,
        "direct": 10,
        "other": 5
      },
      "clicksByDevice": {
        "desktop": 80,
        "mobile": 60,
        "tablet": 10
      },
      "clicksByCountry": {
        "US": 100,
        "CA": 30,
        "UK": 20
      },
      "earningsByDay": [
        { date: "2026-03-14", clicks: 50, conversions: 2, earnings: 25.00 },
        /* ... more days ... */
      ]
    }
  }
}
```

#### Update Payout Settings
```
POST /api/affiliate/payout-settings
Content-Type: application/json
Authentication: Required + Affiliate role

Request Body:
{
  "payoutMethod": "stripe" | "bank_transfer" | "paypal",
  "payoutDetails": "account_id | IBAN | email",
  "minimumPayoutThreshold": 50.00 (number, min: 10, optional)
}

Response (200 OK):
{
  "success": true,
  "message": "Payout settings updated",
  "data": {
    "affiliate": {
      "payoutMethod": "stripe",
      "minimumPayoutThreshold": 50.00
    }
  }
}
```

#### Get Leaderboard (Public)
```
GET /api/leaderboard
Query Parameters:
  - limit: number (default: 10, max: 100)
  - period: string (week|month|quarter|year, default: month)
  - sortBy: string (earnings|clicks|conversions, default: earnings)

Authentication: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "leaderboard": [
      {
        "rank": 1,
        "affiliateCode": "AFFABC12DEF3",
        "userId": "objectId" (hidden for privacy, only use code),
        "totalEarnings": 5000.00,
        "totalSales": 50,
        "conversionRate": 10.5,
        "period": "month"
      },
      {
        "rank": 2,
        "affiliateCode": "AFFXYZ98UVW5",
        "totalEarnings": 4500.00,
        "totalSales": 45,
        "conversionRate": 9.8
      }
      /* ... more affiliates ... */
    ]
  }
}
```

---

### 7. COMMISSION ENDPOINTS (`/api/affiliate`, `/api/admin`)

#### Get User's Commission Stats
```
GET /api/affiliate/commissions/stats
Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "totalEarnings": 5000.00,
      "pendingEarnings": 500.00 (approved but not yet paid),
      "approvedEarnings": 1500.00 (awaiting approval),
      "paidEarnings": 3000.00,
      "pendingCommissions": 10,
      "approvedCommissions": 5,
      "paidCommissions": 30,
      "reversedCommissions": 2,
      "lifetimeEarnings": 5000.00
    }
  }
}
```

#### Get User's Commissions
```
GET /api/affiliate/commissions
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (pending|approved|paid|reversed)
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "commissions": [
      {
        "_id": "objectId",
        "affiliateId": "objectId",
        "orderId": "objectId",
        "orderNumber": "ORD-20260314-ABC123",
        "orderValue": 100.00,
        "commissionRate": 0.10,
        "commissionAmount": 10.00,
        "status": "pending|approved|paid|reversed",
        "createdAt": "2026-03-14T10:00:00Z",
        "approvedAt": null,
        "paidAt": null,
        "reversalReason": null
      }
      /* ... more commissions ... */
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Get Single Commission
```
GET /api/affiliate/commissions/:commissionId
Authentication: Required (affiliate or admin)

Response (200 OK):
{
  "success": true,
  "data": {
    "commission": {
      /* same structure as above */
    }
  }
}
```

#### Admin: Get All Commissions
```
GET /api/admin/commissions
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (pending|approved|paid|reversed)
  - affiliateId: string (filter by affiliate)
  - orderId: string (filter by order)
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "commissions": [ /* all system commissions */ ],
    "pagination": { /* ... */ }
  }
}
```

#### Admin: Approve Commission
```
POST /api/admin/commissions/:commissionId/approve
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "notes": "Approval notes" (string, optional)
}

Response (200 OK):
{
  "success": true,
  "message": "Commission approved",
  "data": {
    "commission": {
      /* updated commission with status: approved */
    }
  }
}
```

#### Admin: Mark Commission as Paid
```
POST /api/admin/commissions/:commissionId/pay
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "paymentMethod": "stripe|bank_transfer|paypal" (string, required),
  "transactionId": "unique_payment_id" (string, required),
  "notes": "Payment notes" (string, optional)
}

Response (200 OK):
{
  "success": true,
  "message": "Commission marked as paid",
  "data": {
    "commission": {
      /* updated commission with status: paid, paidAt: timestamp */
    }
  }
}
```

#### Admin: Reverse Commission
```
POST /api/admin/commissions/:commissionId/reverse
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "reason": "refund|fraud|chargebacks|other" (string, required),
  "description": "Detailed reason" (string, required)
}

Response (200 OK):
{
  "success": true,
  "message": "Commission reversed",
  "data": {
    "commission": {
      /* updated commission with status: reversed */
    }
  }
}
```

---

### 8. PAYOUT ENDPOINTS (`/api/payouts`, `/api/admin`)

#### Request Payout
```
POST /api/payouts/request
Content-Type: application/json
Authentication: Required + Affiliate role

Request Body:
{
  "amount": 500.00 (number, required, >= 50),
  "bankAccount": "account_identifier" (string, optional - uses profile if not provided)
}

Response (201 Created):
{
  "success": true,
  "message": "Payout request submitted",
  "data": {
    "payout": {
      "_id": "objectId",
      "affiliateId": "objectId",
      "amount": 500.00,
      "status": "pending",
      "payoutMethod": "stripe",
      "requestedAt": "2026-03-14T10:00:00Z",
      "estimatedProcessingTime": "5-7 business days"
    }
  }
}

Errors:
- 400: Insufficient available balance
- 400: Amount below minimum threshold
- 400: Invalid amount
```

#### Get User's Payouts
```
GET /api/payouts
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (pending|approved|processing|completed|failed|rejected)
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "payouts": [
      {
        "_id": "objectId",
        "amount": 500.00,
        "status": "completed",
        "payoutMethod": "stripe",
        "requestedAt": "2026-03-14T10:00:00Z",
        "approvedAt": "2026-03-14T11:00:00Z",
        "processedAt": "2026-03-15T09:00:00Z",
        "transactionId": "payout_123456",
        "notes": ""
      }
      /* ... more payouts ... */
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Get Payout Stats
```
GET /api/payouts/stats
Authentication: Required + Affiliate role

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "totalRequested": 2500.00,
      "totalApproved": 2000.00,
      "totalProcessing": 500.00,
      "totalCompleted": 1500.00,
      "totalFailed": 0.00,
      "pendingPayouts": 2,
      "completedPayouts": 15,
      "lastPayoutDate": "2026-03-10T00:00:00Z",
      "nextEstimatedPayout": "2026-03-20T00:00:00Z"
    }
  }
}
```

#### Get Single Payout
```
GET /api/payouts/:payoutId
Authentication: Required (affiliate or admin)

Response (200 OK):
{
  "success": true,
  "data": {
    "payout": {
      /* detailed payout information */
    }
  }
}
```

#### Admin: Get All Payouts
```
GET /api/admin/payouts
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string
  - affiliateId: string
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "payouts": [ /* array of all payouts */ ],
    "pagination": { /* ... */ }
  }
}
```

#### Admin: Approve Payout
```
POST /api/admin/payouts/:payoutId/approve
Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "message": "Payout approved",
  "data": { "payout": { /* updated with status: approved */ } }
}
```

#### Admin: Process Payout
```
POST /api/admin/payouts/:payoutId/process
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "transactionId": "unique_transaction_id" (string, required),
  "notes": "Processing notes" (string, optional)
}

Response (200 OK):
{
  "success": true,
  "message": "Payout processed",
  "data": { "payout": { /* updated with status: completed */ } }
}
```

#### Admin: Reject Payout
```
POST /api/admin/payouts/:payoutId/reject
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "reason": "insufficient_balance|invalid_account|other" (string, required),
  "notes": "Rejection notes" (string, required)
}

Response (200 OK):
{
  "success": true,
  "message": "Payout rejected",
  "data": { "payout": { /* updated with status: rejected */ } }
}
```

---

### 9. REFERRAL TRACKING ENDPOINTS (`/api/ref`, `/api/tracking`)

#### Track Referral Click (Public Redirect)
```
GET /api/ref/:affiliateCode?redirect=/path/to/landing
Query Parameters:
  - affiliateCode: in URL path (required, format: AFF[A-Z0-9]{8})
  - redirect: where to send user after tracking (optional)
  - utm_source: marketing source (optional)
  - utm_medium: medium (optional)
  - utm_campaign: campaign name (optional)
  - utm_content: content identifier (optional)

Authentication: None (Public)

Response (302 Redirect / 200 in dev):
- Production: Redirects to specified landing page or homepage with affiliate code in session
- Development: Returns JSON confirmation

{
  "success": true,
  "message": "Referral tracked",
  "data": {
    "referralId": "objectId",
    "affiliateCode": "AFFABC12DEF3",
    "tracked": true,
    "redirectUrl": "https://spherekings.com/products"
  }
}
```

#### Get Referral Stats
```
GET /api/tracking/stats/:affiliateCode
Authentication: Required + Affiliate role (or public for own code)

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "affiliateCode": "AFFABC12DEF3",
      "totalClicks": 150,
      "uniqueVisitors": 120,
      "conversions": 5,
      "conversionRate": 3.33,
      "totalRevenue": 500.00,
      "averageOrderValue": 100.00,
      "clicksByDevice": {
        "desktop": 80,
        "mobile": 60,
        "tablet": 10
      },
      "clicksByCountry": [
        { code: "US", count: 100 },
        { code: "CA", count: 30 }
      ],
      "lastClickAt": "2026-03-14T10:00:00Z"
    }
  }
}
```

#### Get Detailed Referral History
```
GET /api/tracking/referrals/:affiliateCode
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - device: string (desktop|mobile|tablet)
  - country: string (country code)
  - converted: boolean (true|false)
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required (affiliate or admin)

Response (200 OK):
{
  "success": true,
  "data": {
    "referrals": [
      {
        "_id": "objectId",
        "affiliateCode": "AFFABC12DEF3",
        "visitorId": "unique_visitor_id",
        "ipAddress": "192.168.1.1",
        "userAgent": "Mozilla/5.0...",
        "device": "mobile",
        "country": "US",
        "state": "NY",
        "clickedAt": "2026-03-14T10:00:00Z",
        "clickedUrl": "https://spherekings.com/ref/AFFABC12DEF3?redirect=/products",
        "convertedToSale": false,
        "orderId": null,
        "commissionAmount": null
      }
      /* ... more referrals ... */
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Get Sales from Affiliate
```
GET /api/tracking/sales/:affiliateCode
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required + Affiliate role or Admin

Response (200 OK):
{
  "success": true,
  "data": {
    "sales": [
      {
        "_id": "objectId",
        "orderId": "objectId",
        "orderNumber": "ORD-20260314-ABC123",
        "affiliateCode": "AFFABC12DEF3",
        "referralId": "objectId",
        "orderValue": 100.00,
        "commissionRate": 0.10,
        "commissionAmount": 10.00,
        "status": "pending|approved|paid|reversed",
        "orderDate": "2026-03-14T10:00:00Z",
        "conversionDate": "2026-03-14T10:05:00Z"
      }
      /* ... more sales ... */
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Health Check (Tracking System)
```
GET /api/tracking/health
Authentication: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "status": "operational",
    "message": "Referral tracking system is operational",
    "timestamp": "2026-03-14T10:00:00Z"
  }
}
```

---

### 10. ADMIN ENDPOINTS (`/api/admin`)

#### Admin Dashboard
```
GET /api/admin/dashboard
Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "dashboard": {
      "overview": {
        "totalRevenue": 50000.00,
        "totalOrders": 500,
        "totalCustomers": 300,
        "totalAffiliates": 50,
        "activeAffiliates": 45,
        "pendingCommissions": 5000.00,
        "monthlyGrowth": 12.5
      },
      "sales": {
        "today": 1250.00,
        "thisWeek": 8500.00,
        "thisMonth": 35000.00,
        "lastMonth": 31000.00,
        "trend": "up" | "stable" | "down"
      },
      "affiliates": {
        "total": 50,
        "active": 45,
        "pending": 3,
        "suspended": 2,
        "topEarner": {
          "code": "AFFABC12DEF3",
          "earnings": 5000.00,
          "sales": 50
        }
      },
      "payouts": {
        "pending": 2,
        "approved": 5,
        "processing": 1,
        "completed": 250,
        "totalPending": 2500.00
      },
      "recent": {
        "orders": [ /* last 5 orders */ ],
        "payouts": [ /* last 5 payouts */ ],
        "affiliates": [ /* last 5 registrations */ ]
      }
    }
  }
}
```

#### Get All Orders (Admin)
```
GET /api/admin/orders
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (pending|processing|confirmed|shipped|delivered|cancelled)
  - paymentStatus: string (pending|paid|failed|refunded)
  - dateFrom: ISO date
  - dateTo: ISO date
  - userId: string (filter by customer)
  - minTotal: number
  - maxTotal: number

Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "orders": [ /* array of all orders */ ],
    "pagination": { /* ... */ }
  }
}
```

#### Get Products (Admin)
```
GET /api/admin/products
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (active|inactive|discontinued)
  - category: string
  - search: string (product name/description)
  - featured: boolean
  - lowStock: boolean (show products below 10 units)

Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "products": [ /* all products */ ],
    "pagination": { /* ... */ }
  }
}
```

#### Get All Affiliates (Admin)
```
GET /api/admin/affiliates
Query Parameters:
  - page: number (default: 1)
  - limit: number (default: 20)
  - status: string (active|pending|suspended|inactive)
  - sortBy: string (earnings|clicks|sales, default: earnings)

Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "affiliates": [
      {
        "_id": "objectId",
        "userId": "objectId",
        "affiliateCode": "AFFABC12DEF3",
        "email": "affiliate@example.com",
        "status": "active",
        "totalEarnings": 5000.00,
        "pendingEarnings": 500.00,
        "totalClicks": 150,
        "totalSales": 50,
        "createdAt": "2026-01-01T00:00:00Z",
        "lastActiveAt": "2026-03-14T10:00:00Z"
      }
      /* ... more affiliates ... */
    ],
    "pagination": { /* ... */ }
  }
}
```

#### Suspend/Activate Affiliate (Admin)
```
POST /api/admin/affiliates/:affiliateId/suspend
Content-Type: application/json
Authentication: Required + Admin role

Request Body:
{
  "reason": "fraud|spam|violation|other" (string, required),
  "description": "Detailed reason" (string, required),
  "suspend": true (boolean, true to suspend, false to reactivate)
}

Response (200 OK):
{
  "success": true,
  "message": "Affiliate suspended",
  "data": { "affiliate": { /* updated affiliate */ } }
}
```

#### Get Affiliate Analytics (Admin)
```
GET /api/admin/affiliate-stats
Query Parameters:
  - dateFrom: ISO date
  - dateTo: ISO date
  - topN: number (default: 10, show top N affiliates)

Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "totalAffiliates": 50,
      "activeAffiliates": 45,
      "totalClicks": 15000,
      "totalConversions": 500,
      "conversionRate": 3.33,
      "totalEarnings": 50000.00,
      "averageEarningsPerAffiliate": 1000.00,
      "topAffiliates": [ /* top 10 */ ],
      "clicksBySource": { /* breakdown */ },
      "conversionTrend": [ /* time series */ ]
    }
  }
}
```

#### Get Commission Analytics (Admin)
```
GET /api/admin/commissions/stats
Query Parameters:
  - dateFrom: ISO date
  - dateTo: ISO date

Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "totalCommissions": 500,
      "totalAmount": 50000.00,
      "byStatus": {
        "pending": { count: 100, amount: 10000.00 },
        "approved": { count: 150, amount: 15000.00 },
        "paid": { count: 250, amount: 25000.00 }
      },
      "averageCommission": 100.00,
      "commissionRate": { min: 5, max: 20, average: 10 }
    }
  }
}
```

#### Get Payout Statistics (Admin)
```
GET /api/admin/payouts/stats
Authentication: Required + Admin role

Response (200 OK):
{
  "success": true,
  "data": {
    "stats": {
      "totalPayoutRequests": 200,
      "totalPayoutAmount": 45000.00,
      "byStatus": {
        "pending": { count: 10, amount: 5000.00 },
        "approved": { count: 20, amount: 8000.00 },
        "processing": { count: 5, amount: 2000.00 },
        "completed": { count: 165, amount: 30000.00 }
      },
      "averagePayout": 225.00,
      "lastPayoutDate": "2026-03-14T00:00:00Z"
    }
  }
}
```

---

### 11. FILE UPLOAD ENDPOINTS (`/api/upload`)

#### Upload Product Image
```
POST /api/upload/product-image
Content-Type: multipart/form-data
Authentication: Public (or Protected for user uploads)

Request Body (multipart):
{
  "file": <File> (required, image only: jpg, png, webp, gif, max 5MB),
  "title": "Image title" (optional)
}

Response (200 OK):
{
  "success": true,
  "data": {
    "image": {
      "publicId": "spherekings/products/abc123",
      "url": "https://res.cloudinary.com/...",
      "secureUrl": "https://res.cloudinary.com/... (https)",
      "format": "jpg",
      "width": 1200,
      "height": 800,
      "bytes": 125000,
      "uploadedAt": "2026-03-14T10:00:00Z"
    }
  }
}
```

#### Upload Multiple Product Images
```
POST /api/upload/product-images
Content-Type: multipart/form-data
Authentication: Public

Request Body (multipart):
{
  "files": [<File>, <File>, ...] (required, 1-10 files),
  "productName": "Product Name" (optional)
}

Response (200 OK):
{
  "success": true,
  "data": {
    "images": [
      { /* image object */ },
      { /* image object */ },
      ...
    ],
    "uploadedCount": 3,
    "totalCount": 3
  }
}
```

#### Upload Avatar
```
POST /api/upload/avatar
Content-Type: multipart/form-data
Authentication: Required

Request Body (multipart):
{
  "file": <File> (required, image only, max 2MB)
}

Response (200 OK):
{
  "success": true,
  "data": {
    "avatar": {
      "publicId": "spherekings/avatars/user123",
      "url": "https://res.cloudinary.com/...",
      "uploadedAt": "2026-03-14T10:00:00Z"
    }
  }
}
```

#### Delete File from Cloudinary
```
DELETE /api/upload/:publicId
Authentication: Public

Request Body:
{
  "publicId": "spherekings/products/abc123" (string, required)
}

Response (200 OK):
{
  "success": true,
  "message": "File deleted successfully"
}
```

#### Get Transformed Image URL
```
GET /api/upload/transform/:publicId
Query Parameters:
  - width: number (width in pixels)
  - height: number (height in pixels)
  - crop: string (fill|fit|pad)
  - quality: string (auto|good|best, default: auto)
  - format: string (auto|jpg|png|webp, default: auto)

Authentication: None (Public)

Response (200 OK):
{
  "success": true,
  "data": {
    "url": "https://res.cloudinary.com/...w_300,h_300,c_fill/...",
    "width": 300,
    "height": 300,
    "quality": "auto"
  }
}
```

---

## Data Models

### User Schema
```javascript
{
  _id: ObjectId (primary key),
  email: string (unique, required, lowercase),
  password: string (encrypted with bcrypt, required),
  firstName: string (required, 2-50 chars),
  lastName: string (required, 2-50 chars),
  role: enum ['customer', 'affiliate', 'admin'] (default: 'customer'),
  
  // Profile
  phoneNumber: string (optional),
  profileImage: string (optional, Cloudinary URL),
  bio: string (optional, max 500 chars),
  address: {
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  
  // Account Status
  isActive: boolean (default: true),
  isEmailVerified: boolean (default: false),
  emailVerificationToken: string (select: false),
  emailVerificationExpires: Date,
  
  // Security
  lastLogin: Date,
  loginAttempts: number (default: 0, select: false),
  lockUntil: Date (select: false),
  passwordResetToken: string (select: false),
  passwordResetExpires: Date,
  
  // Affiliate Fields
  affiliateCode: string (unique, optional),
  affiliateStatus: enum ['pending', 'active', 'inactive', 'suspended'],
  
  // Timestamps
  createdAt: Date (auto),
  updatedAt: Date (auto),
  deletedAt: Date (soft delete)
}
```

### Product Schema
```javascript
{
  _id: ObjectId,
  name: string (required, unique, 3-100 chars),
  description: string (required, 20-2000 chars),
  price: number (required, >= 0.01, rounded to 2 decimals),
  images: [string] (required, 1-10 URLs),
  variants: [
    {
      name: enum ['color', 'size', 'edition', 'material'],
      options: [string] (1-20 options)
    }
  ],
  category: string (required, lowercase),
  sku: string (required, unique, uppercase),
  stock: number (default: 0, >= 0),
  status: enum ['active', 'inactive', 'out_of_stock'] (default: 'active'),
  isFeatured: boolean (default: false),
  rating: number (0-5, auto-calculated from reviews),
  reviewCount: number (auto-calculated),
  createdAt: Date,
  updatedAt: Date,
  deletedAt: Date (soft delete)
}
```

### Order Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required),
  orderNumber: string (unique, format: ORD-YYYYMMDD-XXXXXX),
  
  items: [
    {
      productId: ObjectId (ref: 'Product'),
      productName: string,
      sku: string,
      variant: Mixed,
      quantity: number (1-1000),
      price: number (snapshot price),
      subtotal: number,
      addedAt: Date
    }
  ],
  
  subtotal: number,
  tax: number,
  taxRate: number (default: 0.08),
  shipping: number (default: 0),
  discount: number (default: 0),
  total: number,
  
  paymentStatus: enum ['pending', 'paid', 'failed', 'refunded'],
  orderStatus: enum ['pending', 'processing', 'confirmed', 'shipped', 'delivered', 'cancelled', 'refunded'],
  
  paymentDetails: {
    stripeSessionId: string (unique),
    paymentIntentId: string,
    chargeId: string,
    transactionId: string,
    currency: string (default: 'usd'),
    paidAt: Date
  },
  
  affiliateDetails: {
    affiliateId: ObjectId (ref: 'User'),
    affiliateCode: string,
    orderValue: number,
    commissionRate: number (0-1),
    commissionAmount: number,
    status: enum ['pending', 'calculated', 'approved', 'paid', 'reversed'],
    referralClickId: ObjectId (ref: 'ReferralTracking')
  },
  
  shippingAddress: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  },
  
  notes: string,
  createdAt: Date,
  updatedAt: Date
}
```

### Affiliate Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, unique),
  affiliateCode: string (unique, uppercase, 14 chars),
  referralUrl: string,
  
  status: enum ['pending', 'active', 'suspended', 'inactive'],
  emailVerified: boolean (default: false),
  
  totalClicks: number (default: 0),
  totalSales: number (default: 0),
  totalEarnings: number (default: 0),
  pendingEarnings: number (default: 0),
  paidEarnings: number (default: 0),
  
  commissionRate: number (0-100, default: 10),
  payoutMethod: enum ['stripe', 'bank_transfer', 'paypal', 'none'],
  payoutDetails: string (encrypted),
  minimumPayoutThreshold: number (default: 50),
  
  termsAccepted: boolean,
  termsAcceptedAt: Date,
  
  fraudFlags: {
    suspiciousIPs: [string],
    selfReferralDetected: boolean,
    unusualActivity: boolean,
    flaggedAt: Date
  },
  
  suspensionReason: string,
  suspendedAt: Date,
  
  lastLoginAt: Date,
  lastDashboardAccessAt: Date,
  lastSharedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### ReferralTracking Schema
```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId (ref: 'Affiliate', required),
  affiliateCode: string (required),
  
  visitorId: string,
  ipAddress: string (required),
  userAgent: string,
  httpReferrer: string,
  
  referralSource: enum ['direct', 'email', 'facebook', 'twitter', 'instagram', 'tiktok', 'reddit', 'blog', 'other'],
  
  utmCampaign: string,
  utmMedium: string,
  utmSource: string,
  utmContent: string,
  
  cookieId: string,
  sessionId: string,
  landingUrl: string,
  
  convertedToSale: boolean (default: false),
  orderId: ObjectId (ref: 'Order'),
  commissionAmount: number,
  
  device: enum ['mobile', 'tablet', 'desktop'],
  country: string,
  state: string,
  
  clickedAt: Date,
  convertedAt: Date,
  expiresAt: Date (30-day attribution window)
}
```

### Cart Schema
```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: 'User', required, unique),
  
  items: [
    {
      _id: ObjectId,
      productId: ObjectId (ref: 'Product'),
      variant: Mixed (flexible),
      quantity: number (1-1000),
      price: number (snapshot price),
      addedAt: Date
    }
  ],
  
  createdAt: Date,
  updatedAt: Date
}
```

### Commission Schema
```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId (ref: 'User', required),
  orderId: ObjectId (ref: 'Order', required),
  referralClickId: ObjectId (ref: 'ReferralTracking'),
  
  orderValue: number (required),
  commissionRate: number (0-1, required),
  commissionAmount: number (calculated),
  
  status: enum ['pending', 'calculated', 'approved', 'paid', 'reversed'],
  
  approvedAt: Date,
  paidAt: Date,
  reversalReason: string,
  reversedAt: Date,
  
  createdAt: Date,
  updatedAt: Date
}
```

### Payout Schema
```javascript
{
  _id: ObjectId,
  affiliateId: ObjectId (ref: 'User', required),
  
  amount: number (required, >= 50),
  status: enum ['pending', 'approved', 'processing', 'completed', 'failed', 'rejected'],
  
  payoutMethod: enum ['stripe', 'bank_transfer', 'paypal'],
  bankAccount: string (optional),
  
  requestedAt: Date,
  approvedAt: Date,
  processedAt: Date,
  completedAt: Date,
  
  transactionId: string,
  notes: string,
  rejectionReason: string,
  
  createdAt: Date,
  updatedAt: Date
}
```

---

## Error Handling

### HTTP Status Codes Used
- **200 OK** - Successful GET request
- **201 Created** - Successful POST request (resource created)
- **204 No Content** - Successful DELETE request
- **400 Bad Request** - Invalid request body or parameters
- **401 Unauthorized** - Missing or invalid authentication token
- **403 Forbidden** - Authenticated but insufficient permissions
- **404 Not Found** - Resource doesn't exist
- **409 Conflict** - Resource already exists (duplicate email, code, etc.)
- **422 Unprocessable Entity** - Validation failed
- **429 Too Many Requests** - Rate limit exceeded
- **500 Internal Server Error** - Server error
- **503 Service Unavailable** - Service temporarily down

### Error Response Format
```json
{
  "success": false,
  "statusCode": 400,
  "message": "User-friendly error message",
  "error": {
    "code": "ERROR_CODE",
    "field": "fieldName" (if validation error),
    "details": "Additional details"
  }
}
```

### Common Error Codes
- `INVALID_INPUT` - Request validation failed
- `UNAUTHORIZED` - No or invalid token
- `FORBIDDEN` - Insufficient permissions
- `RESOURCE_NOT_FOUND` - Item doesn't exist
- `DUPLICATE_ENTRY` - Item already exists
- `PAYMENT_FAILED` - Stripe payment error
- `OUT_OF_STOCK` - Product unavailable
- `AFFILIATE_INACTIVE` - Affiliate account not active
- `INSUFFICIENT_BALANCE` - Not enough earnings to request payout

---

## Middleware & Security

### Authentication Middleware
Validates JWT token and adds user data to request object.

```javascript
// Protected route example
app.get('/api/orders', authMiddleware, orderController.getOrders);

// Admin-only route example
app.get('/api/admin/users', authMiddleware, adminMiddleware, adminController.getAllUsers);
```

### Global Security Headers (Helmet)
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security: max-age=31536000
- X-XSS-Protection: 1; mode=block

### CORS Configuration
- Allows frontend domain (configurable)
- Credentials: true (for cookies)
- Allowed headers: Content-Type, Authorization

### Rate Limiting
- 100 requests per 15 minutes per IP
- Stricter limits on sensitive endpoints (auth, payouts)

### Input Validation
All endpoints validate:
- Email format and uniqueness
- Password strength (min 8 chars, uppercase, lowercase, number)
- Required fields
- Data type and format
- Min/max values

### SQL/NoSQL Injection Prevention
- Mongoose schemas with defined fields
- No raw queries
- Input sanitization via validators

---

## Important Backend Notes

### Authentication Flow
1. User registers or logs in
2. Backend generates access token (15 min) + refresh token (7 days)
3. Frontend stores tokens in localStorage (+ httpOnly cookie for refresh token)
4. Every API request includes Authorization header: `Bearer <accessToken>`
5. When token expires, frontend sends refresh token to `/auth/refresh`
6. Backend validates refresh token and issues new access token
7. If refresh token invalid, user redirected to login

### Affiliate System Flow
1. User registers as affiliate (must be regular user first)
2. System generates unique affiliate code (AFF + 11 random chars)
3. Affiliate shares referral link: `https://spherekings.com/ref/AFFABC12DEF3`
4. When someone clicks link (without logging in first):
   - Referral click is tracked with device, IP, location, UTM params
   - Cookie/Session created to remember affiliate code
5. When user makes purchase (referred or not):
   - System looks for active referral click in attribution window (30 days)
   - If found, commission is calculated and attached to order
   - Commission status starts as "pending"
6. Admin approves commissions → Status becomes "approved"
7. Affiliate requests payout → Creates payout record
8. Admin approves payout → Status becomes "approved"
9. Admin processes payout → Money transferred via Stripe/Bank/PayPal

### Payment Processing
1. User adds items to cart → Cart stored in DB
2. User proceeds to checkout → Validates cart and products
3. Create Stripe checkout session → Returns session ID + URL
4. Stripe handles payment securely
5. User redirects to confirmation if successful
6. Stripe webhook confirms payment → Order created + Affiliate commission calculated
7. Order confirmation email sent

### Referral Attribution Window
- Default: 30 days from click
- If purchase made within 30 days of click → Commission awarded
- If no purchase within 30 days → Referral expires

### Commission Calculation
Formula: `commissionAmount = orderValue × (commissionRate / 100)`
Example: $100 order × 10% commission rate = $10 commission

### Payout Thresholds
- Minimum payout requirement: Configurable per affiliate (default: $50)
- Affiliate can request payout only if pendingEarnings >= minimumThreshold

---

**Document Version:** 2.0  
**Last Updated:** March 14, 2026  
**Status:** ✅ Complete & Production Ready
