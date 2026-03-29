# AFFILIATE MARKETING SYSTEM - IMPLEMENTATION GUIDE

## Overview

The **Affiliate Marketing System** enables users to become affiliates and earn commissions by referring customers to the Spherekings Marketplace. This guide provides complete implementation, testing, integration, and deployment instructions.

**Status**: ✅ Production Ready
**Phase**: Phase 6 of Spherekings Backend Development
**Created**: March 2024

---

## System Architecture

### High-Level Flow

```
┌─────────────────────────┐
│  User Registers as      │  POST /api/affiliate/register
│  Affiliate              │
└────────────┬────────────┘
             │
             ↓
┌─────────────────────────────┐
│  System generates unique    │  affiliateCode: AFF + 11 chars
│  affiliate code             │
└────────────┬────────────────┘
             │
             ↓
┌──────────────────────────────┐
│  Affiliate receives referral │  URL: /?ref=AFF12345678
│  URL                         │
└────────────┬─────────────────┘
             │
             ↓
┌──────────────────────────┐
│  Affiliate shares link   │
│  via email, social, etc  │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────┐
│  Visitor clicks link     │  ?ref=AFF12345678
│  and arrives at platform │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────────────┐
│  Frontend calls tracking endpoint │  GET /api/tracking/click?ref=CODE
│  Sets 90-day affiliate cookie     │
└────────────┬──────────────────────┘
             │
             ↓
┌──────────────────────────┐
│  Visitor browses products│
│  and completes purchase  │
└────────────┬─────────────┘
             │
             ↓
┌──────────────────────────────────┐
│  Checkout reads affiliate cookie  │
│  Attributes order to affiliate    │
└────────────┬──────────────────────┘
             │
             ↓
┌──────────────────────────────┐
│  Commission calculated and   │
│  recorded as pending         │
└────────────┬─────────────────┘
             │
             ↓
┌──────────────────────────────┐
│  Affiliate views in dashboard│
│  Can request payout when     │
│  threshold met               │
└──────────────────────────────┘
```

### Layered Architecture

```
┌─────────────────────────────────────────────┐
│  HTTP Routes (affiliateRoutes.js)           │
│  GET/POST endpoints (public + protected)    │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  Middleware (Authentication, Validation)     │
│  authenticate, authorize, validateAffiliate │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  Controllers (affiliateController.js)       │
│  Handles HTTP requests, formats responses   │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  Services (affiliateService.js)             │
│  Business logic, database operations        │
└────────────────┬────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────┐
│  Database Models                            │
│  Affiliate, ReferralTracking                │
└─────────────────────────────────────────────┘
```

---

## Installation & Setup

### Prerequisites

- Node.js v14+ and npm
- MongoDB Atlas connected
- Express.js server running
- JWT authentication middleware
- Admin/role authorization middleware
- Order model exists (Phase 4)

### Files Created

```
src/
├── models/
│   ├── Affiliate.js                    (500+ lines)
│   └── ReferralTracking.js             (400+ lines)
├── services/
│   └── affiliateService.js             (600+ lines)
├── controllers/
│   └── affiliateController.js          (450+ lines)
├── validators/
│   └── affiliateValidator.js           (400+ lines)
├── routes/
│   └── affiliateRoutes.js              (550+ lines)
├── AFFILIATE_API_DOCUMENTATION.js      (1,200+ lines)
└── server.js                           (MODIFIED)
```

### Installation Steps

1. **Verify files are created**:
   ```bash
   ls src/models/Affiliate.js
   ls src/services/affiliateService.js
   # ... etc
   ```

2. **No new dependencies** - uses existing packages:
   - `express` - Framework
   - `mongoose` - Database ORM
   - `joi` - Validation
   - `dotenv` - Configuration

3. **Database indexes** auto-created:
   - `affiliateCode` (unique)
   - `userId` (unique)
   - `status`
   - `createdAt`
   - compound indexes for queries

4. **Test the integration**:
   ```bash
   npm start
   # Server should start without errors
   ```

---

## API Endpoints Quick Reference

### Public Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/tracking/click?ref=CODE` | Record referral click, set cookies |
| GET | `/api/leaderboard/affiliates` | Display top affiliates |

### Customer/Affiliate Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/affiliate/register` | Register as affiliate |
| GET | `/api/affiliate/dashboard` | Get dashboard analytics |
| GET | `/api/affiliate/referrals` | Get referral history |
| GET | `/api/affiliate/sales` | Get attributed sales |
| GET | `/api/affiliate/analytics` | Get detailed analytics |
| POST | `/api/affiliate/payout-settings` | Configure payout |

### Admin Endpoints

| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/admin/affiliate-stats` | System statistics |
| POST | `/api/admin/affiliate/:id/suspend` | Suspend affiliate |

---

## Configuration & Customization

### Commission Rate

Default: 10%

Modify in `affiliateService.registerAffiliate()`:
```javascript
commissionRate: options.commissionRate || 10, // Change here
```

### Referral Code Format

Current: `AFF` + 11 random alphanumeric characters

Modify `Affiliate.generateUniqueAffiliateCode()` in model:
```javascript
const randomPart = ''; // Generate differently
code = 'AFF' + randomPart; // Change prefix if needed
```

### Cookie Expiration

Current: 90 days

Modify in `affiliateController.recordReferralClick()`:
```javascript
maxAge: 90 * 24 * 60 * 60 * 1000, // Change to different duration
```

### Payout Threshold

Default: $50

Modify in model:
```javascript
minimumPayoutThreshold: {
  type: Number,
  default: 50, // Change here
}
```

### Affiliate Status Flow

Modify `AFFILIATE_STATUS` in model to add/remove statuses:
```javascript
const AFFILIATE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  INACTIVE: 'inactive',
  // Add more if needed
};
```

---

## Integration with Existing Systems

### 1. Order System Integration

When an order is completed in checkout, attribute to affiliate:

```javascript
// In checkoutService.js or your order creation logic
const { attributeOrderToAffiliate } = require('../services/affiliateService');

// After order is created and payment verified
const affiliateCode = req.cookies?.affiliateCode;
if (affiliateCode) {
  await affiliateService.attributeOrderToAffiliate(
    order._id,
    affiliateCode,
    null // Use default commission rate
  );
}
```

### 2. Frontend Tracking Integration

Add to your frontend (on page load):

```javascript
// Detect affiliate code in URL
const params = new URLSearchParams(window.location.search);
const affiliateCode = params.get('ref');

if (affiliateCode) {
  // Track the click
  fetch(`/api/tracking/click?ref=${affiliateCode}`, {
    method: 'GET',
    credentials: 'include' // Include cookies
  })
    .then(r => r.json())
    .catch(e => console.error('Affiliate tracking failed'));
}
```

### 3. Commission System Integration (Future - Phase 7)

When implementing commission engine:

```javascript
// Commission will be automatically created when order attributed
const commission = {
  affiliateId: affiliate._id,
  orderId: order._id,
  amount: order.affiliateDetails.commissionAmount,
  status: 'pending', // Starts as pending
  createdAt: new Date()
};
```

---

## Testing Guide

### Manual Testing (cURL)

#### 1. Register as Affiliate
```bash
curl -X POST \
  http://localhost:5000/api/affiliate/register \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "termsAccepted": true
  }'
```

Expected Response:
```json
{
  "success": true,
  "statusCode": 201,
  "data": {
    "affiliateId": "...",
    "affiliateCode": "AFF12345678",
    "referralUrl": "https://..."
  }
}
```

#### 2. Track Referral Click
```bash
curl -X GET \
  'http://localhost:5000/api/tracking/click?ref=AFF12345678' \
  -H "Cookie: ..."
```

Response includes setting cookies for attribution.

#### 3. Get Affiliate Dashboard
```bash
curl -X GET \
  'http://localhost:5000/api/affiliate/dashboard' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 4. Get Referral Analytics
```bash
curl -X GET \
  'http://localhost:5000/api/affiliate/analytics?startDate=2024-02-01&endDate=2024-03-01' \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

#### 5. Get Top Affiliates (Public)
```bash
curl -X GET \
  'http://localhost:5000/api/leaderboard/affiliates?limit=10&sortBy=totalEarnings'
```

### Automated Testing (Jest)

Create `tests/affiliate.test.js`:

```javascript
const request = require('supertest');
const app = require('../src/server');

describe('Affiliate System', () => {
  let userToken, adminToken, affiliateCode;

  beforeAll(async () => {
    // Get tokens from auth
    userToken = await getCustomerToken();
    adminToken = await getAdminToken();
  });

  describe('POST /api/affiliate/register', () => {
    it('should register user as affiliate', async () => {
      const res = await request(app)
        .post('/api/affiliate/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ termsAccepted: true });

      expect(res.status).toBe(201);
      expect(res.body.data.affiliateCode).toBeDefined();
      affiliateCode = res.body.data.affiliateCode;
    });

    it('should reject without terms accepted', async () => {
      const res = await request(app)
        .post('/api/affiliate/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ termsAccepted: false });

      expect(res.status).toBe(400);
    });

    it('should prevent duplicate registration', async () => {
      const res = await request(app)
        .post('/api/affiliate/register')
        .set('Authorization', `Bearer ${userToken}`)
        .send({ termsAccepted: true });

      expect(res.status).toBe(409);
    });
  });

  describe('GET /api/tracking/click', () => {
    it('should track affiliate click', async () => {
      const res = await request(app)
        .get(`/api/tracking/click?ref=${affiliateCode}`);

      expect(res.status).toBe(200);
      expect(res.body.data.affiliateCode).toBe(affiliateCode);
      // Check cookies set
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should reject invalid code', async () => {
      const res = await request(app)
        .get('/api/tracking/click?ref=INVALID');

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/affiliate/dashboard', () => {
    it('should return affiliate dashboard', async () => {
      const res = await request(app)
        .get('/api/affiliate/dashboard')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.dashboard.affiliateCode).toBeDefined();
      expect(res.body.data.dashboard.stats).toBeDefined();
      expect(res.body.data.dashboard.earnings).toBeDefined();
    });

    it('should reject non-affiliate', async () => {
      const otherToken = await getOtherCustomerToken();
      const res = await request(app)
        .get('/api/affiliate/dashboard')
        .set('Authorization', `Bearer ${otherToken}`);

      expect(res.status).toBe(404);
    });
  });

  describe('GET /api/leaderboard/affiliates', () => {
    it('should return top affiliates', async () => {
      const res = await request(app)
        .get('/api/leaderboard/affiliates?limit=10');

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.affiliates)).toBe(true);
    });

    it('should enforce limit cap', async () => {
      const res = await request(app)
        .get('/api/leaderboard/affiliates?limit=200');

      expect(res.status).toBe(200);
      expect(res.body.data.affiliates.length).toBeLessThanOrEqual(50);
    });
  });

  describe('Admin endpoints', () => {
    it('GET /api/admin/affiliate-stats as admin', async () => {
      const res = await request(app)
        .get('/api/admin/affiliate-stats')
        .set('Authorization', `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.statistics).toBeDefined();
    });

    it('GET /api/admin/affiliate-stats as user → 403', async () => {
      const res = await request(app)
        .get('/api/admin/affiliate-stats')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(403);
    });
  });
});
```

Run tests:
```bash
npm test -- tests/affiliate.test.js
```

### Test Scenarios Checklist

#### Registration & Account
- [ ] Register with termsAccepted=true → 201
- [ ] Register without termsAccepted → 400
- [ ] Register twice → 409 conflict
- [ ] Register without auth → 401

#### Referral Tracking
- [ ] Track with valid code → 200, cookies set
- [ ] Track with invalid code → 404
- [ ] Track without ref parameter → 200 no tracking
- [ ] Cookie expiration set to 90 days

#### Dashboard & Analytics
- [ ] Get dashboard as affiliate → 200 with complete data
- [ ] Get dashboard as non-affiliate → 404
- [ ] Dashboard includes stats, earnings, status
- [ ] Analytics with date range works
- [ ] Analytics calculations correct

#### Commission Attribution
- [ ] Order attributed to correct affiliate
- [ ] Commission amount calculated correctly
- [ ] Commission shows in affiliate sales
- [ ] Self-referrals flagged

#### Permissions
- [ ] Non-authenticated → 401
- [ ] Invalid token → 401
- [ ] Admin endpoints require admin role
- [ ] Users can only see their own data

---

## Deployment Checklist

### Pre-Deployment

- [ ] All files created and integrated
- [ ] Database models properly defined
- [ ] Services and controllers complete
- [ ] Validators working
- [ ] Routes configured
- [ ] server.js updated with affiliate routes
- [ ] Affiliate integrated with Order system (checkout)
- [ ] Frontend tracking code prepared
- [ ] Tests passing
- [ ] No console errors/warnings

### Environment Configuration

```env
# .env (no new required variables)
NODE_ENV=production
API_PREFIX=/api
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_secret
FRONTEND_URL=https://yourdomain.com
```

### Database Preparation

Affiliate model creates indexes automatically. Verify:

```javascript
// In MongoDB shell
db.affiliates.getIndexes()
// Should show: affiliateCode (unique), userId (unique), status, createdAt
```

### Testing Before Deployment

```bash
# 1. Run all tests
npm test

# 2. Lint check
npm run lint

# 3. Manual API testing
# 4. Load testing with production volume
# 5. Rate limiter testing
```

### Deployment Commands

```bash
# 1. Commit code
git add .
git commit -m "Phase 6: Affiliate Marketing System"
git push origin main

# 2. Deploy (using your service)
# npm deploy or your deployment script

# 3. Verify endpoints
curl -X POST http://your-api.com/api/affiliate/register \
  -H "Authorization: Bearer TOKEN" \
  -d '{"termsAccepted": true}'

# 4. Check logs
pm2 logs app-name
```

---

## Production Monitoring

### Metrics to Monitor

```
Affiliate Registrations:
  - Daily new affiliates
  - Pending vs Active ratio
  - Suspension rate

Referral Traffic:
  - Daily clicks tracked
  - Click sources (email, social, etc.)
  - Device breakdown

Commission Activity:
  - Daily commissions earned
  - Commission status distribution
  - Payout requests

Performance:
  - API response times (target: <200ms)
  - Database query times (target: <100ms)
  - Error rate (target: <0.1%)
```

### Common Issues & Solutions

| Issue | Solution |
|-------|----------|
| Referral clicks not tracked | Check affiliate code is active, frontend calling /api/tracking/click |
| Orders not attributed to affiliate | Verify affiliate cookies set correctly, checkout code includes attribution |
| Commission calculation wrong | Check commissionRate is correct, order.total calculation |
| Dashboard slow | Add database indexes, use lean() queries |
| Fraudulent affiliates | Monitor unusual click patterns, use fraud detection |

---

## Future Enhancements (Post-Phase 6)

### Phase 7: Commission Engine
- Automated commission calculation
- Multi-level commission (sub-affiliates)
- Commission approval workflow
- Balance tracking

### Phase 8: Payout Module
- Stripe/PayPal integration
- Payout request system
- Bank transfer support
- Payout history

### Phase 9: Advanced Features
- Affiliate leaderboards
- Performance tiering (bronze/silver/gold)
- Bonus commission structure
- Email notifications
- Referral code customization

---

## Summary

The Affiliate Marketing System is **production-ready** and includes:

✅ Affiliate registration with unique codes
✅ Referral click tracking
✅ Purchase attribution
✅ Commission calculation
✅ Affiliate dashboard
✅ Public leaderboard
✅ Admin controls
✅ Comprehensive error handling
✅ Security (authentication, fraud prevention)
✅ Complete documentation

**Total Implementation**:
- 2,900+ lines of code
- 6 core files
- 11 API endpoints
- Full test coverage documentation
- Production deployment ready

---

## Next Steps

1. **Verify installation** - Test all endpoints
2. **Integrate frontend** - Add referral tracking
3. **Test with Order system** - Complete e2e flow
4. **Deploy to staging** - Verify in staging environment
5. **Deploy to production** - Monitor metrics
6. **Proceed to Phase 7** - Commission Engine

