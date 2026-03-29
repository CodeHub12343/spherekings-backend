# ORDER MANAGEMENT SYSTEM - IMPLEMENTATION GUIDE

## Overview

The Order Management System is a production-ready backend implementation for managing customer orders, affiliates' referred sales, and admin fulfillment operations within the Spherekings Marketplace. It provides comprehensive order retrieval, filtering, pagination, and lifecycle management with role-based access control.

**Status**: ✅ Production Ready
**Phase**: Phase 5 of Spherekings Backend Development
**Created**: March 2024

---

## System Architecture

### Layered Architecture Pattern

```
┌─────────────────────────────────────────────┐
│         HTTP Routes (orderRoutes.js)        │
│  GET/POST /api/orders, /admin/orders, etc.  │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│    Middleware (Authentication, Validation)   │
│  authenticate, authorize, validateOrder      │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│    Controllers (orderController.js)          │
│  Handles HTTP requests, formats responses    │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│    Services (orderService.js)                │
│  Business logic, queries, validations        │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│    Database (Order Model)                    │
│  MongoDB with Mongoose ORM                   │
└─────────────────────────────────────────────┘
```

### Files Included

1. **src/routes/orderRoutes.js** (550+ lines)
   - HTTP route definitions
   - Middleware chain configuration
   - 8+ endpoints for customer/affiliate/admin
   - Comprehensive JSDoc documentation

2. **src/controllers/orderController.js** (350+ lines)
   - Request handlers for all operations
   - Query parameter extraction
   - Response formatting
   - Error delegation to middleware

3. **src/services/orderService.js** (450+ lines)
   - Core business logic
   - Database queries with filtering/sorting
   - Pagination implementation
   - Ownership verification
   - Status transition validation

4. **src/validators/orderValidator.js** (200+ lines)
   - Joi validation schemas
   - Generic validation middleware
   - Field-level error messages
   - Type conversion and validation

5. **src/models/Order.js** (Must exist from Phase 4)
   - Mongoose schema definition
   - Order and OrderItem sub-documents
   - Instance and static methods
   - Pre-save middleware

6. **src/server.js** (Modified)
   - Added orderRoutes import
   - Registered order routes at `/api/orders`

---

## Installation & Setup

### Prerequisites

- Node.js v14+ and npm
- MongoDB Atlas connected and configured
- Express.js server running
- JWT authentication middleware implemented
- Admin/role middleware implemented

### Installation Steps

1. **Files Already Created**: All core files are in place:
   ```
   src/
   ├── routes/orderRoutes.js
   ├── controllers/orderController.js
   ├── services/orderService.js
   ├── validators/orderValidator.js
   ├── models/Order.js
   └── server.js (updated)
   ```

2. **No Dependencies to Install**: Uses existing packages:
   - `express` - Framework
   - `mongoose` - Database ORM
   - `joi` - Validation
   - `dotenv` - Configuration

3. **Environment Configuration** (no new variables needed):
   ```env
   # .env (existing)
   API_PREFIX=/api  # Used for route registration
   ```

4. **Database Indexes** (auto-created):
   - `userId` - For customer order lookups
   - `paymentStatus` - For payment filtering
   - `orderStatus` - For status filtering
   - `stripeSessionId` - For payment verification
   - `affiliateId` - For affiliate reports
   - compound index on `userId` and `createdAt`

### Verification

Test that routes are registered:
```bash
curl -H "Authorization: Bearer YOUR_TOKEN" http://localhost:5000/api/orders
```

Expected response (with valid token):
```json
{
  "success": true,
  "message": "Orders retrieved successfully",
  "data": { "orders": [], "pagination": { ... } }
}
```

---

## API Endpoints Quick Reference

### Customer Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/orders` | List customer's orders (paginated, filterable) |
| GET | `/api/orders/summary` | Get order statistics (count, total spent) |
| GET | `/api/orders/:id` | Get order details |
| POST | `/api/orders/search` | Advanced search for orders |
| GET | `/api/orders/:id/invoice` | Generate invoice data |

### Affiliate Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/affiliate/orders` | List orders referred by affiliate |

### Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/orders` | List all orders with statistics |
| PUT | `/api/admin/orders/:id/status` | Update order status |

---

## Configuration & Customization

### Order Status Workflow

Modify status transitions in **orderService.js** `_getValidTransitions()` method:

```javascript
_getValidTransitions(currentStatus) {
  const transitions = {
    pending: ['processing', 'cancelled'],
    processing: ['confirmed', 'shipped', 'cancelled', 'refunded'],
    confirmed: ['shipped', 'cancelled', 'refunded'],
    shipped: ['delivered', 'returned'],
    delivered: ['complete', 'returned'],
    // Add more as needed
  };
  return transitions[currentStatus] || [];
}
```

### Pagination Defaults

Modify in **orderService.js**:

```javascript
const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100; // Prevent DoS attacks
```

### Sort Fields

Supported sort fields in service:
- `createdAt` - Most common
- `total` - Order amount
- `status` - Alphabetical
- `orderNumber` - Unique identifier

### Validation Schemas

Customize validation in **orderValidator.js**:

```javascript
const userOrdersQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  // Add more as needed
});
```

---

## Testing Guide

### Manual Testing (Using cURL)

#### 1. Get Customer's Orders
```bash
curl -X GET \
  'http://localhost:5000/api/orders?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### 2. Filter by Status
```bash
curl -X GET \
  'http://localhost:5000/api/orders?status=shipped&limit=20' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### 3. Date Range Filter
```bash
curl -X GET \
  'http://localhost:5000/api/orders?dateFrom=2024-01-01&dateTo=2024-03-31' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### 4. Get Order Summary
```bash
curl -X GET \
  'http://localhost:5000/api/orders/summary' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### 5. Get Specific Order
```bash
curl -X GET \
  'http://localhost:5000/api/orders/507f1f77bcf86cd799439011' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN'
```

#### 6. Advanced Search
```bash
curl -X POST \
  'http://localhost:5000/api/orders/search' \
  -H 'Authorization: Bearer YOUR_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "shipped",
    "dateFrom": "2024-02-01",
    "dateTo": "2024-02-29"
  }'
```

#### 7. Admin - Get All Orders
```bash
curl -X GET \
  'http://localhost:5000/api/admin/orders?page=1&limit=20' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN'
```

#### 8. Admin - Update Order Status
```bash
curl -X PUT \
  'http://localhost:5000/api/admin/orders/507f1f77bcf86cd799439011/status' \
  -H 'Authorization: Bearer ADMIN_JWT_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "status": "shipped",
    "reason": "Tracking: 1Z999AA10123456784"
  }'
```

#### 9. Affiliate - Get Referred Orders
```bash
curl -X GET \
  'http://localhost:5000/api/affiliate/orders?page=1&limit=50' \
  -H 'Authorization: Bearer AFFILIATE_JWT_TOKEN'
```

### Automated Testing (Jest)

Create `tests/order.test.js`:

```javascript
const request = require('supertest');
const app = require('../src/server');

describe('Order Management API', () => {
  let userToken, adminToken, orderId;

  beforeAll(async () => {
    // Get tokens from auth endpoints
    userToken = await getCustomerToken();
    adminToken = await getAdminToken();
  });

  describe('GET /api/orders', () => {
    it('should return customer orders with pagination', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ page: 1, limit: 10 });

      expect(res.status).toBe(200);
      expect(res.body.data.orders).toBeInstanceOf(Array);
      expect(res.body.data.pagination).toHaveProperty('currentPage');
    });

    it('should filter by status', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ status: 'shipped' });

      expect(res.status).toBe(200);
      res.body.data.orders.forEach(order => {
        expect(order.orderStatus).toBe('shipped');
      });
    });

    it('should reject invalid status', async () => {
      const res = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .query({ status: 'invalid' });

      expect(res.status).toBe(400);
    });
  });

  describe('PUT /api/admin/orders/:id/status', () => {
    it('should update order status', async () => {
      const orderId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'shipped' });

      expect(res.status).toBe(200);
      expect(res.body.data.order.orderStatus).toBe('shipped');
    });

    it('should reject invalid status transition', async () => {
      const orderId = '507f1f77bcf86cd799439011';
      const res = await request(app)
        .put(`/api/admin/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid-transition' });

      expect(res.status).toBe(400);
      expect(res.body.message).toContain('transition');
    });
  });

  describe('Authorization', () => {
    it('should reject missing token', async () => {
      const res = await request(app).get('/api/orders');
      expect(res.status).toBe(401);
    });

    it('customer should not access admin endpoints', async () => {
      const res = await request(app)
        .get('/api/admin/orders')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
```

Run tests:
```bash
npm test -- tests/order.test.js
```

### Test Scenarios Checklist

#### Authentication & Authorization
- [ ] GET /orders without token → 401 Unauthorized
- [ ] GET /orders with invalid token → 401 Unauthorized
- [ ] GET /admin/orders as customer → 403 Forbidden
- [ ] GET /affiliate/orders as non-affiliate → 403 Forbidden
- [ ] GET /orders/:id (other user's order) → 403 Forbidden

#### Pagination & Filtering
- [ ] Page parameter validation (min 1)
- [ ] Limit parameter validation (max 100)
- [ ] Status filter with valid values
- [ ] Date range filtering (dateFrom, dateTo)
- [ ] Price range filtering (minAmount, maxAmount)
- [ ] Sorting (createdAt, total, status)

#### Order Details
- [ ] Retrieve own order → 200 with full details
- [ ] Retrieve non-existent order → 404 Not Found
- [ ] Generate invoice → 200 with formatted data
- [ ] Get order summary → 200 with statistics

#### Status Updates (Admin)
- [ ] Valid transition pending→processing → 200 Success
- [ ] Valid transition shipped→delivered → 200 Success
- [ ] Invalid transition shipped→pending → 400 Bad Request
- [ ] Terminal state transition → 400 Bad Request
- [ ] Update with reason → Stored successfully

#### Search Operations
- [ ] Search by order number
- [ ] Search by status
- [ ] Search by price range
- [ ] Search by date range
- [ ] Combined filters (status + date + price)

#### Error Cases
- [ ] Invalid ObjectId → 400 Bad Request
- [ ] Missing required fields → 400 Bad Request
- [ ] Invalid enum values → 400 Bad Request
- [ ] Rate limit exceeded → 429 Too Many Requests

---

## Performance Considerations

### Database Queries

All service methods use optimized MongoDB queries:

```javascript
// Lean queries for faster retrieval (no Mongoose overhead)
const orders = await Order.find(query).lean();

// Indexes prevent full collection scans
// Aggregate pipelines for statistics
const stats = await Order.aggregate([
  { $match: { userId: new ObjectId(userId) } },
  { $group: { _id: null, totalSpent: { $sum: '$total' } } }
]);

// Pagination prevents large result sets
.skip((page - 1) * limit)
.limit(Math.min(limit, MAX_LIMIT))
```

### Optimization Tips

1. **Frontend Pagination**: Load one page at a time, not all orders
2. **Caching**: Cache summary stats (hourly or on update)
3. **Indexes**: Ensure MongoDB indexes exist (see Database Indexes)
4. **Sorting**: Sort by indexed fields (createdAt, status)
5. **Projections**: Use select() to exclude unnecessary fields

### Load Testing

```bash
# Using Apache Bench
ab -n 1000 -c 10 \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/orders

# Using wrk
wrk -t4 -c100 -d30s \
  -H "Authorization: Bearer TOKEN" \
  http://localhost:5000/api/orders
```

---

## Common Issues & Solutions

### Issue: Orders Not Returning for Customer

**Symptoms**: GET /api/orders returns empty array for customer with orders

**Solutions**:
1. Verify JWT token has correct userId in payload
2. Check Order model has orderStatus field
3. Check database indexes created

```javascript
// Debug: Check if orders exist in DB
db.orders.find({ userId: ObjectId("...") }).count()
```

### Issue: Status Update Returns "Invalid Transition"

**Symptoms**: PUT /admin/orders/:id/status returns 400

**Solutions**:
1. Check current order status
2. Verify transition is in _getValidTransitions() rules
3. See STATUS WORKFLOW section in API docs

```javascript
// Valid transitions from pending:
pending -> processing, cancelled
// NOT: pending -> shipped
```

### Issue: Pagination Not Working

**Symptoms**: limit=1000 returns all results, DoS vulnerability

**Solutions**:
1. MAX_LIMIT capped at 100 in service
2. Page parameter validated (min 1)
3. Always enforce limits in queries

### Issue: Affiliate Orders Returning Wrong Data

**Symptoms**: GET /api/affiliate/orders returns all orders

**Solutions**:
1. Verify user has affiliate role in JWT
2. Check Service filters by req.user._id as affiliateId
3. Ensure Order.affiliateDetails.affiliateId matches

### Issue: Search Not Finding Orders

**Symptoms**: POST /api/orders/search returns empty results

**Solutions**:
1. Verify search parameters are correct type
2. Check orderNumber field exactly (case-sensitive)
3. Use partial matches: "ORD-202403" matches "ORD-20240301-123456"

---

## Deployment Checklist

### Pre-Deployment

- [ ] All dependencies installed (npm install)
- [ ] Environment variables configured (.env)
- [ ] MongoDB Atlas connection verified
- [ ] JWT authentication middleware working
- [ ] Admin/role authorization middleware working
- [ ] Database indexes created
- [ ] Order model matches Phase 4 specification

### Environment Configuration

```env
# .env
NODE_ENV=production
PORT=5000
API_PREFIX=/api
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret_key
CORS_ORIGIN=https://yourdomain.com
```

### Testing Before Deploy

```bash
# 1. Run tests
npm test

# 2. Lint check
npm run lint

# 3. Manual API testing (see Testing Guide)
# 4. Load testing with production data
# 5. Rate limiter testing
```

### Deployment Steps

```bash
# 1. Push to repository
git add .
git commit -m "Phase 5: Order Management System"
git push origin main

# 2. Deploy to server
# (Using your deployment service: Heroku, AWS, etc.)

# 3. Verify endpoints
curl -H "Authorization: Bearer TOKEN" https://api.example.com/api/orders

# 4. Check logs for errors
pm2 logs app-name
```

### Monitoring

Monitor these metrics in production:

```javascript
// API Response Times
GET /api/orders - Target: < 200ms
POST /api/orders/search - Target: < 500ms

// Database Performance
Order.find() average query time: < 100ms

// Rate Limiting
Monitor 429 responses (should be minimal)

// Error Rate
Target: < 0.1% of requests
```

---

## Integration with Other Systems

### Product Catalog (Phase 2)
- Orders reference ProductIds
- Product details populated in order items
- Price history for refunds

### Shopping Cart (Phase 3)
- Cart items converted to order items at checkout
- Cart cleared after successful payment
- Bundle deals applied

### Checkout & Payment (Phase 4)
- Orders created from Stripe webhook
- Payment verification before marking as paid
- Affiliate commission recorded at checkout

### Affiliate System (Phase 6 - Upcoming)
- Order.affiliateDetails populated at checkout
- Commission rates applied per affiliate
- Affiliate dashboard filters orders by affiliateId

### Commission Engine (Phase 7 - Upcoming)
- Orders trigger commission creation
- Status changes affect commission status
- Payout calculated from commissions

---

## Summary

The Order Management System provides complete backend functionality for:

✅ Customer order retrieval with advanced filtering and pagination
✅ Order status lifecycle management with workflow validation
✅ Affiliate performance tracking and commission visibility
✅ Admin order oversight and fulfillment control
✅ Comprehensive error handling and security

**Total Lines of Code**: 1,550+ lines across 4 files
**Development Time**: Single sprint
**Ready for Production**: Yes

---

## Next Steps (Phase 6)

Proceed to implement the **Affiliate System** which builds on the Order Management API:

1. Affiliate registration and profile management
2. Unique affiliate codes and referral links
3. Dashboard for tracking referred orders
4. Commission distribution settings

See AFFILIATE_SYSTEM_README.md for details.

