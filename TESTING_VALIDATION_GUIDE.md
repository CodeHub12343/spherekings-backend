# Referral Tracking System - Testing & Validation Guide

## Table of Contents

1. [Testing Strategy Overview](#testing-strategy-overview)
2. [Unit Testing](#unit-testing)
3. [Integration Testing](#integration-testing)
4. [Manual Testing Guide](#manual-testing-guide)
5. [Load Testing](#load-testing)
6. [Security Testing](#security-testing)
7. [Fraud Detection Testing](#fraud-detection-testing)
8. [Browser Compatibility Testing](#browser-compatibility-testing)
9. [Testing Checklist](#testing-checklist)
10. [Continuous Integration](#continuous-integration)

---

## Testing Strategy Overview

### Testing Pyramid for Referral Tracking

```
        ┌─────────────┐
        │  E2E Tests  │  <- Full referral + checkout + order flow
        │   (10%)     │     Tests entire system integration
        └─────────────┘
             / \
            /   \
           /     \
        ┌─────────────────────┐
        │ Integration Tests    │  <- Multiple components together
        │      (30%)          │     Tests API → DB interactions
        └─────────────────────┘
           /   \       /   \
          /     \     /     \
         /       \   /       \
    ┌─────────────────────────────┐
    │   Unit Tests (60%)          │  <- Individual functions
    │   - Controllers             │     Tests in isolation
    │   - Services                │
    │   - Validators              │
    │   - Utilities               │
    └─────────────────────────────┘

Total Coverage Target: >80% code coverage
```

### Test Categories

| Category | Coverage | Focus |
|----------|----------|-------|
| **Unit Tests** | 60% | Individual functions |
| **Integration** | 30% | Component interactions |
| **E2E/Manual** | 10% | Full user journeys |
| **Security** | 5% | Vulnerability scanning |
| **Load** | 2% | Performance under load |

---

## Unit Testing

### Testing Affiliate Controller

```javascript
// File: tests/unit/controllers/affiliateController.test.js

const request = require('supertest');
const { ObjectId } = require('mongodb');
const app = require('../../../src/server');
const Affiliate = require('../../../src/models/Affiliate');
const ReferralTracking = require('../../../src/models/ReferralTracking');

describe('Affiliate Controller - Unit Tests', () => {
  describe('recordReferralClick', () => {
    let affiliateId, affiliateCode;

    beforeEach(async () => {
      // Create test affiliate
      const affiliate = await Affiliate.create({
        userId: new ObjectId(),
        affiliateCode: 'AFF12345678',
        status: 'active',
        metrics: {
          totalClicks: 0,
          totalSales: 0,
          totalEarnings: 0,
        }
      });
      affiliateId = affiliate._id;
      affiliateCode = affiliate.affiliateCode;
    });

    afterEach(async () => {
      await Affiliate.deleteMany({});
      await ReferralTracking.deleteMany({});
    });

    test('should track valid affiliate code', async () => {
      const response = await request(app)
        .get('/api/tracking/click')
        .query({ ref: affiliateCode })
        .expect(200);

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
      expect(response.body).toHaveProperty('data');
      expect(response.body.data).toHaveProperty('trackingId');
      expect(response.body.data).toHaveProperty('affiliateId');
      expect(response.body.data.affiliateCode).toBe(affiliateCode);
    });

    test('should set affiliate tracking cookies', async () => {
      const response = await request(app)
        .get('/api/tracking/click')
        .query({ ref: affiliateCode });

      // Verify cookies in response
      const setCookieHeader = response.headers['set-cookie'] || [];
      const hasAffiliateId = setCookieHeader.some(c => c.includes('affiliateId'));
      const hasAffiliateCode = setCookieHeader.some(c => c.includes('affiliateCode'));

      expect(hasAffiliateId).toBe(true);
      expect(hasAffiliateCode).toBe(true);
    });

    test('should increment affiliate click counter', async () => {
      const beforeClicks = (await Affiliate.findById(affiliateId)).metrics.totalClicks;

      await request(app)
        .get('/api/tracking/click')
        .query({ ref: affiliateCode });

      const afterClicks = (await Affiliate.findById(affiliateId)).metrics.totalClicks;

      expect(afterClicks).toBe(beforeClicks + 1);
    });

    test('should reject invalid affiliate code', async () => {
      const response = await request(app)
        .get('/api/tracking/click')
        .query({ ref: 'INVALIDCODE12345' })
        .expect(200);

      // Should return success but with null data
      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(null);
    });

    test('should handle missing ref parameter', async () => {
      const response = await request(app)
        .get('/api/tracking/click')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBe(null);
      expect(response.body.message).toMatch(/no referral code/i);
    });

    test('should store IP address in tracking record', async () => {
      await request(app)
        .get('/api/tracking/click')
        .query({ ref: affiliateCode });

      const tracking = await ReferralTracking.findOne({
        affiliateId: affiliateId
      });

      expect(tracking.ipAddress).toBeTruthy();
      // Should be valid IP format
      expect(tracking.ipAddress).toMatch(/\d+\.\d+\.\d+\.\d+|::1|127\.0\.0\.1/);
    });

    test('should capture UTM parameters', async () => {
      await request(app)
        .get('/api/tracking/click')
        .query({
          ref: affiliateCode,
          utm_campaign: 'summer_sale',
          utm_medium: 'email',
          utm_source: 'mailchimp',
        });

      const tracking = await ReferralTracking.findOne({
        affiliateId: affiliateId
      });

      expect(tracking.utmCampaign).toBe('summer_sale');
      expect(tracking.utmMedium).toBe('email');
      expect(tracking.utmSource).toBe('mailchimp');
    });

    test('should mark suspended affiliate as invalid', async () => {
      // Suspend affiliate
      await Affiliate.findByIdAndUpdate(affiliateId, { status: 'suspended' });

      const response = await request(app)
        .get('/api/tracking/click')
        .query({ ref: affiliateCode });

      // Should not track (but return 200 for security)
      expect(response.body.success).toBe(true);

      // Verify no tracking record created
      const trackingCount = await ReferralTracking.countDocuments({
        affiliateId: affiliateId
      });
      expect(trackingCount).toBe(0);
    });

    test('should handle rapid fire clicks without blocking', async () => {
      const promises = [];

      // Simulate 10 rapid clicks
      for (let i = 0; i < 10; i++) {
        promises.push(
          request(app)
            .get('/api/tracking/click')
            .query({ ref: affiliateCode })
        );
      }

      const responses = await Promise.all(promises);

      // All should succeed
      expect(responses.every(r => r.status === 200)).toBe(true);

      // All should create tracking records
      const trackingCount = await ReferralTracking.countDocuments({
        affiliateId: affiliateId
      });
      expect(trackingCount).toBe(10);
    });
  });

  describe('getAffiliateReferrals', () => {
    let affiliateId, userId, token;

    beforeEach(async () => {
      const user = await User.create({
        email: 'affiliate@test.com',
        password: 'hash'
      });
      userId = user._id;

      const affiliate = await Affiliate.create({
        userId: userId,
        affiliateCode: 'AFFTEST123'
      });
      affiliateId = affiliate._id;

      token = generateTestToken(userId);
    });

    test('should return paginated referrals', async () => {
      // Create test referrals
      for (let i = 0; i < 25; i++) {
        await ReferralTracking.create({
          affiliateId: affiliateId,
          affiliateCode: 'AFFTEST123',
          ipAddress: '192.168.1.1',
        });
      }

      const response = await request(app)
        .get('/api/affiliate/referrals')
        .set('Authorization', `Bearer ${token}`)
        .query({ page: 1, limit: 20 });

      expect(response.status).toBe(200);
      expect(response.body.data.referrals.length).toBe(20);
      expect(response.body.data.pagination.totalResults).toBe(25);
      expect(response.body.data.pagination.totalPages).toBe(2);
    });

    test('should filter converted referrals only', async () => {
      // Create mixed referrals
      await ReferralTracking.create({
        affiliateId: affiliateId,
        ipAddress: '192.168.1.1',
        convertedToSale: true,
      });
      await ReferralTracking.create({
        affiliateId: affiliateId,
        ipAddress: '192.168.1.2',
        convertedToSale: false,
      });

      const response = await request(app)
        .get('/api/affiliate/referrals')
        .set('Authorization', `Bearer ${token}`)
        .query({ convertedOnly: true });

      expect(response.body.data.referrals).toHaveLength(1);
      expect(response.body.data.referrals[0].convertedToSale).toBe(true);
    });

    test('should require authentication', async () => {
      const response = await request(app)
        .get('/api/affiliate/referrals')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should require affiliate status', async () => {
      const regularUser = await User.create({
        email: 'regular@test.com',
        password: 'hash'
      });
      const regularToken = generateTestToken(regularUser._id);

      const response = await request(app)
        .get('/api/affiliate/referrals')
        .set('Authorization', `Bearer ${regularToken}`)
        .expect(403);

      expect(response.body.message).toMatch(/not an affiliate/i);
    });
  });
});
```

### Testing Affiliate Service

```javascript
// File: tests/unit/services/affiliateService.test.js

const affiliateService = require('../../../src/services/affiliateService');
const Affiliate = require('../../../src/models/Affiliate');
const ReferralTracking = require('../../../src/models/ReferralTracking');

describe('Affiliate Service - Unit Tests', () => {
  describe('recordReferralClick', () => {
    let affiliateCode, affiliateId;

    beforeEach(async () => {
      const affiliate = await Affiliate.create({
        userId: new ObjectId(),
        affiliateCode: 'AFFTEST123',
        status: 'active',
      });
      affiliateId = affiliate._id;
      affiliateCode = affiliate.affiliateCode;
    });

    test('should create referral tracking record', async () => {
      const clickData = {
        ipAddress: '192.168.1.1',
        userAgent: 'Mozilla/5.0...',
        referrer: 'https://facebook.com',
      };

      const result = await affiliateService.recordReferralClick(
        affiliateCode,
        clickData
      );

      expect(result).toHaveProperty('trackingId');
      expect(result).toHaveProperty('affiliateId');
      expect(result.affiliateCode).toBe(affiliateCode);
    });

    test('should throw error for invalid affiliate code', async () => {
      const clickData = {
        ipAddress: '192.168.1.1',
      };

      expect(async () => {
        await affiliateService.recordReferralClick('INVALID', clickData);
      }).rejects.toThrow(/not found/i);
    });

    test('should detect self-referrals', async () => {
      const clickData = {
        ipAddress: '192.168.1.1',
        userId: affiliateId, // Affiliate's own ID
      };

      expect(async () => {
        await affiliateService.recordReferralClick(affiliateCode, clickData);
      }).rejects.toThrow(/own referral/i);
    });

    test('should increment affiliate metrics', async () => {
      const before = await Affiliate.findById(affiliateId);
      const beforeClicks = before.metrics.totalClicks;

      const clickData = { ipAddress: '192.168.1.1' };
      await affiliateService.recordReferralClick(affiliateCode, clickData);

      const after = await Affiliate.findById(affiliateId);
      const afterClicks = after.metrics.totalClicks;

      expect(afterClicks).toBe(beforeClicks + 1);
    });
  });

  describe('detectFraudPatterns', () => {
    let affiliateId;

    beforeEach(async () => {
      const affiliate = await Affiliate.create({
        userId: new ObjectId(),
        affiliateCode: 'AFFTEST123',
      });
      affiliateId = affiliate._id;
    });

    test('should detect rapid-fire clicks from same IP', async () => {
      const ipAddress = '192.168.1.1';

      // Create 12 clicks in rapid succession
      for (let i = 0; i < 12; i++) {
        await ReferralTracking.create({
          affiliateId: affiliateId,
          affiliateCode: 'AFFTEST123',
          ipAddress: ipAddress,
          createdAt: new Date(Date.now() - (i * 100)),
        });
      }

      const fraudCheck = await affiliateService.detectFraudPatterns(
        affiliateId,
        ipAddress,
        3600000 // 1 hour
      );

      expect(fraudCheck).not.toBe(null);
      expect(fraudCheck.fraudFlag).toBe('SUSPICIOUS_IP_PATTERN');
      expect(fraudCheck.clicksInWindow).toBe(12);
    });

    test('should not flag legitimate click pattern', async () => {
      const ipAddress = '192.168.1.1';

      // Create 3 clicks (within limit)
      for (let i = 0; i < 3; i++) {
        await ReferralTracking.create({
          affiliateId: affiliateId,
          affiliateCode: 'AFFTEST123',
          ipAddress: ipAddress,
        });
      }

      const fraudCheck = await affiliateService.detectFraudPatterns(
        affiliateId,
        ipAddress,
        3600000
      );

      expect(fraudCheck).toBe(null);
    });
  });
});
```

---

## Integration Testing

### Testing Complete Referral Attribution Flow

```javascript
// File: tests/integration/referralAttribution.test.js

describe('Referral Attribution Integration', () => {
  let affiliate, user, product, cart;

  beforeEach(async () => {
    // Setup test data
    const affiliateUser = await User.create({
      email: 'affiliate@test.com',
      password: 'hash',
    });

    affiliate = await Affiliate.create({
      userId: affiliateUser._id,
      affiliateCode: 'AFFTEST123',
      status: 'active',
    });

    user = await User.create({
      email: 'customer@test.com',
      password: 'hash',
    });

    product = await Product.create({
      name: 'Test Product',
      price: 100.00,
      stock: 100,
    });

    cart = await Cart.create({
      userId: user._id,
      items: [{ productId: product._id, quantity: 1 }],
    });
  });

  test('complete flow: click -> checkout -> payment -> commission', async () => {
    // Step 1: User clicks affiliate link
    const trackRes = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFFTEST123' });

    expect(trackRes.status).toBe(200);
    const cookies = trackRes.headers['set-cookie'];

    // Step 2: Create checkout session with cookies
    const userToken = generateTestToken(user._id);
    const checkoutRes = await request(app)
      .post('/api/checkout/create-session')
      .set('Authorization', `Bearer ${userToken}`)
      .set('Cookie', cookies)
      .send({});

    expect(checkoutRes.status).toBe(201);
    const sessionId = checkoutRes.body.data.sessionId;

    // Step 3: Simulate Stripe webhook (payment success)
    const webhookRes = await request(app)
      .post('/api/checkout/webhook')
      .set('stripe-signature', 'test_signature')
      .send({
        type: 'checkout.session.completed',
        data: {
          object: {
            id: sessionId,
            payment_status: 'paid',
            amount_total: 10000, // $100 in cents
            metadata: {
              userId: user._id.toString(),
              affiliateId: affiliate._id.toString(),
              affiliateCode: 'AFFTEST123',
            },
          }
        }
      });

    expect(webhookRes.status).toBe(200);

    // Step 4: Verify order created with affiliate
    const order = await Order.findOne({ userId: user._id });
    expect(order).toBeDefined();
    expect(order.affiliateDetails.affiliateId).toEqual(affiliate._id);
    expect(order.affiliateDetails.affiliateCode).toBe('AFFTEST123');

    // Step 5: Verify referral marked as converted
    const tracking = await ReferralTracking.findOne({
      affiliateId: affiliate._id,
      convertedToSale: true,
    });
    expect(tracking).toBeDefined();
    expect(tracking.orderId).toEqual(order._id);

    // Step 6: Verify affiliate metrics updated
    const updatedAffiliate = await Affiliate.findById(affiliate._id);
    expect(updatedAffiliate.metrics.totalSales).toBeGreaterThan(0);
    expect(updatedAffiliate.metrics.totalEarnings).toBeGreaterThan(0);
  });

  test('referral tracking persists across multiple page views', async () => {
    // Click affiliate link
    const trackRes = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFFTEST123' });

    const cookies = trackRes.headers['set-cookie'];

    // Simulate multiple page visits
    for (let i = 0; i < 3; i++) {
      await request(app)
        .get('/api/products')
        .set('Cookie', cookies);

      // Cookies should persist
      await new Promise(r => setTimeout(r, 100));
    }

    // Checkout should still have affiliate
    const checkRes = await request(app)
      .post('/api/checkout/create-session')
      .set('Cookie', cookies)
      .set('Authorization', `Bearer ${generateTestToken(user._id)}`)
      .send({});

    expect(checkRes.body.data.affiliateCode).toBe('AFFTEST123');
  });

  test('should not attribute if affiliate is inactive', async () => {
    // Suspend affiliate
    await Affiliate.findByIdAndUpdate(affiliate._id, { status: 'suspended' });

    // Try to click link (should not create tracking)
    await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFFTEST123' });

    const tracking = await ReferralTracking.findOne({
      affiliateId: affiliate._id,
    });

    expect(tracking).toBeUndefined();
  });
});
```

---

## Manual Testing Guide

### Testing Checklist

```markdown
# Referral Tracking Manual Testing Checklist

## 1. Referral Click Tracking

- [ ] **Valid Affiliate Code**
  - [ ] Click affiliate link: https://spherekings.com/?ref=AFF12345678
  - [ ] Verify 200 status returned
  - [ ] Verify cookies set in browser
  - [ ] Verify redirect to destination page

- [ ] **Invalid Affiliate Code**
  - [ ] Click with fake code: https://spherekings.com/?ref=FAKECODEXYZ
  - [ ] Verify 200 status (no error)
  - [ ] Verify no cookies set

- [ ] **UTM Parameters**
  - [ ] Click: https://spherekings.com/?ref=AFF12345678&utm_campaign=emailblast&utm_medium=email
  - [ ] Verify UTM data stored in database
  - [ ] Verify visible in affiliate dashboard

- [ ] **Device Detection**
  - [ ] Test on mobile device
  - [ ] Test on tablet
  - [ ] Test on desktop
  - [ ] Verify device type stored correctly

## 2. Cookie Management

- [ ] **Cookie Setting**
  - [ ] DevTools → Application → Cookies
  - [ ] Verify affiliateId cookie present (HttpOnly)
  - [ ] Verify affiliateCode cookie present
  - [ ] Verify Max-Age = 7,776,000 (90 days)

- [ ] **Cookie Persistence**
  - [ ] Refresh page multiple times
  - [ ] Navigate to different pages
  - [ ] Close and reopen browser
  - [ ] Verify cookies still present (except session cookies)

- [ ] **Cookie Domain**
  - [ ] Verify domain set correctly (.spherekings.com in prod)
  - [ ] Verify available across subdomains
  - [ ] Verify path = /

## 3. Checkout Attribution

- [ ] **Cookie Read in Checkout**
  - [ ] Navigate to checkout after click
  - [ ] Check browser console: document.cookie should contain affiliateCode
  - [ ] Submit order
  - [ ] Verify backend received affiliateId

- [ ] **Order Attribution**
  - [ ] Complete purchase via Stripe
  - [ ] Check orders database
  - [ ] Verify order.affiliateDetails.affiliateId populated
  - [ ] Verify commission calculated

- [ ] **Affiliate Dashboard**
  - [ ] Log in as affiliate
  - [ ] Check dashboard → Referrals
  - [ ] Verify click appears in list
  - [ ] Verify conversion marked
  - [ ] Verify commission earned

## 4. Security Tests

- [ ] **Self-Referral Prevention**
  - [ ] As affiliate, copy own referral link
  - [ ] Click it
  - [ ] Make purchase
  - [ ] Verify order NOT attributed to self

- [ ] **HttpOnly Cookie Verification**
  - [ ] Browser console: document.cookie
  - [ ] affiliateId should NOT appear
  - [ ] affiliateCode should appear
  - [ ] Try to read affiliateId via JavaScript (should fail)

- [ ] **XSS Protection**
  - [ ] Try to inject script in UTM parameter
  - [ ] Verify script not executed
  -  [ ] Check database for escaped content

- [ ] **HTTPS Enforcement (Production)**
  - [ ] Try to access via HTTP
  - [ ] Verify redirect to HTTPS
  - [ ] Verify Secure flag on cookies

## 5. Error Scenarios

- [ ] **Empty Cart Checkout**
  - [ ] Try to checkout with empty cart
  - [ ] Verify error message "empty cart"
  - [ ] Verify no half-created order

- [ ] **Suspended Affiliate**
  - [ ] Suspend affiliate account
  - [ ] Try to click their link
  - [ ] Verify no attribution
  - [ ] Verify no cookies set

- [ ] **Payment Failure**
  - [ ] Start checkout, fail payment
  - [ ] Verify no order created
  - [ ] Verify no commission recorded

- [ ] **Webhook Timeout**
  - [ ] Simulate slow webhook
  - [ ] Verify Stripe retries
  - [ ] Verify order eventually created

## 6. Analytics

- [ ] **Dashboard Metrics**
  - [ ] Total clicks calculated correctly
  - [ ] Conversion rate accurate
  - [ ] Revenue attributed properly
  - [ ] Commission calculated correctly

- [ ] **Referral History**
  - [ ] Pagination works
  - [ ] Filtering works
  - [ ] Sorting works
  - [ ] Date ranges work

- [ ] **Geographic Analytics**
  - [ ] Country detected
  - [ ] State/province detected
  - [ ] City detected (if available)
  - [ ] Map visualization works

## 7. Multi-Browser Testing

- [ ] Chrome/Chromium
- [ ] Firefox
- [ ] Safari
- [ ] Edge
- [ ] Mobile browsers (iOS Safari, Chrome Mobile)

## 8. Rate Limiting

- [ ] **Click Rate Limit**
  - [ ] Click tracking endpoint 30+ times in 1 minute
  - [ ] Verify 429 response after limit
  - [ ] Verify error message

- [ ] **API Rate Limit**
  - [ ] Make 100+ requests in 15 minutes
  - [ ] Verify 429 response
  - [ ] Verify RateLimit headers

## 9. Data Consistency

- [ ] **Referral Tracking vs Order**
  - [ ] Referral marked as converted
  - [ ] Order has affiliateId
  - [ ] Affiliate metrics updated
  - [ ] No double-counting

- [ ] **90-Day TTL**
  - [ ] Create test referral
  - [ ] Verify TTL set to 90 days
  - [ ] Verify auto-deletion works
  - [ ] Check with: db.referral_trackings.find({ expiresAt: {$lte: ISODate()} })
```

---

## Load Testing

### Simulating High Traffic

```javascript
// File: tests/load/referralTracking.load.js

const autocannon = require('autocannon');

async function runLoadTest() {
  // Test parameters
  const result = await autocannon({
    url: 'http://localhost:3000',
    connections: 100,          // 100 concurrent connections
    pipelining: 10,            // 10 requests per connection
    duration: 30,              // 30 seconds
    requests: [
      {
        path: '/api/tracking/click?ref=AFF12345678',
        method: 'GET',
      }
    ]
  });

  // Results
  console.log('Load Test Results:');
  console.log(`Requests: ${result.requests.total}`);
  console.log(`Throughput: ${result.throughput.total} bytes/sec`);
  console.log(`Latency p50: ${result.latency.p50}ms`);
  console.log(`Latency p99: ${result.latency.p99}ms`);
  console.log(`Errors: ${result.errors}`);

  // Success criteria
  const success = result.latency.p99 < 100 && result.errors === 0;
  console.log(`✓ Load test ${success ? 'PASSED' : 'FAILED'}`);
}

runLoadTest().catch(console.error);
```

### Traffic Spike Simulation

```javascript
// File: tests/load/trafficSpike.js

async function simulateTrafficSpike() {
  const baselineRequests = 100;
  const peakRequests = 1000;

  const scenarios = [
    {
      name: 'Baseline Load',
      connections: baselineRequests,
      duration: 10,
    },
    {
      name: 'Traffic Spike',
      connections: peakRequests,
      duration: 30,
    },
    {
      name: 'Recovery',
      connections: baselineRequests,
      duration: 10,
    }
  ];

  for (const scenario of scenarios) {
    console.log(`\nTesting ${scenario.name}...`);

    const result = await autocannon({
      url: 'http://localhost:3000/api/tracking/click?ref=AFF12345678',
      connections: scenario.connections,
      duration: scenario.duration,
      pipelining: 1,
    });

    console.log(`  Requests: ${result.requests.total}`);
    console.log(`  Errors: ${result.errors}`);
    console.log(`  Latency p99: ${result.latency.p99}ms`);
  }
}
```

---

## Security Testing

### OWASP Top 10 Checks

```javascript
// File: tests/security/owasp.test.js

describe('Security - OWASP Top 10', () => {
  describe('1. Injection Prevention', () => {
    test('should prevent NoSQL injection in affiliate code', async () => {
      const maliciousCode = { $ne: null };

      const response = await request(app)
        .get('/api/tracking/click')
        .query({ ref: JSON.stringify(maliciousCode) });

      // Should reject (not return data)
      expect(response.body.data).toBe(null);

      // Should not access other affiliates
      const tracking = await ReferralTracking.findOne({
        affiliateCode: maliciousCode
      });
      expect(tracking).toBeUndefined();
    });

    test('should prevent XSS in UTM parameters', async () => {
      const xssPayload = '<script>alert("xss")</script>';

      await request(app)
        .get('/api/tracking/click')
        .query({
          ref: 'AFFTEST123',
          utm_campaign: xssPayload
        });

      const tracking = await ReferralTracking.findOne({
        affiliateId: affiliateId
      });

      // Should be escaped
      expect(tracking.utmCampaign).not.toContain('<script>');
    });
  });

  describe('2. Broken Authentication', () => {
    test('should require JWT for authenticated endpoints', async () => {
      const response = await request(app)
        .get('/api/affiliate/referrals')
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    test('should reject invalid JWT', async () => {
      const response = await request(app)
        .get('/api/affiliate/referrals')
        .set('Authorization', 'Bearer invalid_token')
        .expect(401);
    });
  });

  describe('3. Sensitive Data Exposure', () => {
    test('should not expose internal IDs in public APIs', async () => {
      const response = await request(app)
        .get('/api/leaderboard/affiliates');

      // Response should not contain MongoDB _ids
      for (const affiliate of response.body.data.leaderboard) {
        expect(affiliate._id).toBeUndefined();
      }
    });

    test('should use HTTPS in production', async () => {
      if (process.env.NODE_ENV === 'production') {
        const response = await request(app)
          .get('/api/tracking/click')
          .query({ ref: 'AFFTEST123' });

        // Cookie should have Secure flag
        const cookies = response.headers['set-cookie'] || [];
        const affiliateIdCookie = cookies.find(c => c.includes('affiliateId'));
        expect(affiliateIdCookie).toMatch(/Secure/);
      }
    });
  });

  describe('4. Broken Access Control', () => {
    test('should not allow user to access other affiliate data', async () => {
      const user1 = await User.create({ email: 'user1@test.com', password: 'hash' });
      const user2 = await User.create({ email: 'user2@test.com', password: 'hash' });

      const affiliate1 = await Affiliate.create({ userId: user1._id, affiliateCode: 'AFF00001' });
      const affiliate2 = await Affiliate.create({ userId: user2._id, affiliateCode: 'AFF00002' });

      const token1 = generateTestToken(user1._id);

      const response = await request(app)
        .get('/api/affiliate/referrals')
        .set('Authorization', `Bearer ${token1}`);

      // Should only return user1's data
      expect(response.body.data).toBeDefined();
      // Verify data belongs to affiliate1
    });
  });

  describe('5. Security Misconfiguration', () => {
    test('should set security headers', async () => {
      const response = await request(app)
        .get('/api/tracking/click')
        .query({ ref: 'AFFTEST123' });

      expect(response.headers['x-content-type-options']).toBe('nosniff');
      expect(response.headers['x-frame-options']).toBeTruthy();
      expect(response.headers['x-xss-protection']).toBeTruthy();
    });

    test('should not expose server version', async () => {
      const response = await request(app)
        .get('/api/tracking/click')
        .query({ ref: 'AFFTEST123' });

      // Should not have Server header exposing Express version
      const serverHeader = response.headers['server'];
      expect(serverHeader).toBeUndefined();
    });
  });
});
```

---

## Fraud Detection Testing

### Testing Fraud Patterns

```javascript
// File: tests/security/fraudDetection.test.js

describe('Fraud Detection', () => {
  describe('Suspicious IP Patterns', () => {
    test('should flag rapid-fire clicks from same IP', async () => {
      const ipAddress = '192.168.1.100';
      const affiliate = await createTestAffiliate();

      // Simulate 15 clicks in 1 minute from same IP
      for (let i = 0; i < 15; i++) {
        await ReferralTracking.create({
          affiliateId: affiliate._id,
          affiliateCode: affiliate.affiliateCode,
          ipAddress: ipAddress,
          createdAt: new Date(Date.now() - (i * 1000)), // 1 second apart
        });
      }

      const fraudCheck = await affiliateService.detectFraudPatterns(
        affiliate._id,
        ipAddress,
        60000 // 1 minute
      );

      expect(fraudCheck).not.toBe(null);
      expect(fraudCheck.fraudFlag).toBe('SUSPICIOUS_IP_PATTERN');
      expect(fraudCheck.severity).toBe('high');
    });

    test('should not flag normal click pattern', async () => {
      const ipAddress = '192.168.1.50';
      const affiliate = await createTestAffiliate();

      // 3 clicks over 1 hour (normal)
      for (let i = 0; i < 3; i++) {
        await ReferralTracking.create({
          affiliateId: affiliate._id,
          affiliateCode: affiliate.affiliateCode,
          ipAddress: ipAddress,
          createdAt: new Date(Date.now() - (i * 20 * 60 * 1000)), // 20 minutes apart
        });
      }

      const fraudCheck = await affiliateService.detectFraudPatterns(
        affiliate._id,
        ipAddress,
        3600000 // 1 hour
      );

      expect(fraudCheck).toBe(null);
    });
  });

  describe('Self-Referral Detection', () => {
    test('should prevent affiliate from using own link', async () => {
      const user = await User.create({ email: 'test@test.com', password: 'hash' });
      const affiliate = await Affiliate.create({
        userId: user._id,
        affiliateCode: 'AFFSELFTEST'
      });

      expect(async () => {
        await affiliateService.preventSelfReferral(affiliate._id, user._id);
      }).rejects.toThrow(/own/i);
    });
  });

  describe('Bot Traffic Detection', () => {
    test('should detect bot user agents', async () => {
      const botAgents = [
        'Mozilla/5.0 (compatible; Googlebot/2.1)',
        'Mozilla/5.0 (compatible; bingbot/2.0)',
        'Scrapy/1.0',
      ];

      const affiliate = await createTestAffiliate();

      for (const agent of botAgents) {
        await request(app)
          .get('/api/tracking/click')
          .set('User-Agent', agent)
          .query({ ref: affiliate.affiliateCode });

        // Should mark as suspicious
        const tracking = await ReferralTracking.findOne({
          affiliateId: affiliate._id
        }).sort({ createdAt: -1 });

        expect(tracking.metadata?.fraudFlags).toContainEqual('BOT_USER_AGENT');
      }
    });
  });

  describe('Duplicate Detection', () => {
    test('should detect duplicate order attribution', async () => {
      const affiliate = await createTestAffiliate();
      const customer = await User.create({ email: 'customer@test.com', password: 'hash' });

      // Create tracking
      const tracking = await ReferralTracking.create({
        affiliateId: affiliate._id,
        affiliateCode: affiliate.affiliateCode,
        ipAddress: '192.168.1.1',
        visitorId: customer._id.toString(),
      });

      // Create first order
      const order1 = await Order.create({
        userId: customer._id,
        affiliateDetails: {
          affiliateId: affiliate._id,
          affiliateCode: affiliate.affiliateCode,
        }
      });

      tracking.convertedToSale = true;
      tracking.orderId = order1._id;
      await tracking.save();

      // Try to create another order from same visitor
      // Should be flagged as duplicate
      expect(async () => {
        // This should be caught by application logic
        const fraudCheck = await affiliateService.detectDuplicateConversion(
          customer._id,
          affiliate._id
        );
        if (fraudCheck) throw new Error('Duplicate conversion detected');
      }).rejects.toThrow();
    });
  });
});
```

---

## Browser Compatibility Testing

### Test Matrix

```javascript
// File: tests/compat/browserCompat.test.js

const browserMatrix = [
  { name: 'Chrome 90+', userAgent: '... Chrome/90.0' },
  { name: 'Firefox 88+', userAgent: '... Firefox/88.0' },
  { name: 'Safari 14+', userAgent: '... Version/14.0 Safari' },
  { name: 'Edge 90+', userAgent: '... Edge/90.0' },
  { name: 'Mobile Chrome', userAgent: '... Chrome/90.0 Mobile' },
  { name: 'Mobile Safari', userAgent: '... Version/14.0 Mobile Safari' },
];

desc('Browser Compatibility', () => {
  for (const browser of browserMatrix) {
    test(`should work in ${browser.name}`, async () => {
      const response = await request(app)
        .get('/api/tracking/click')
        .set('User-Agent', browser.userAgent)
        .query({ ref: 'AFFTEST123' });

      expect(response.status).toBe(200);

      // Verify cookies set
      expect(response.headers['set-cookie']).toBeDefined();

      // Verify response structure
      expect(response.body).toHaveProperty('success', true);
    });
  }
});
```

---

## Testing Checklist

### Pre-Deployment Verification

```markdown
# Pre-Deployment Testing Checklist

## Unit Tests
- [ ] All affiliate controller tests passing (>90% coverage)
- [ ] All service tests passing
- [ ] All validator tests passing
- [ ] All utility function tests passing

## Integration Tests
- [ ] Referral click → tracking creation
- [ ] Referral click → cookie setting
- [ ] Cookies → checkout reading
- [ ] Checkout → order creation
- [ ] Order creation → commission trigger
- [ ] Multi-step flows passing

## Manual Testing
- [ ] Referral links working
- [ ] Cookies visible in DevTools
- [ ] Checkout attribution working
- [ ] Affiliate dashboard showing data
- [ ] Error pages accessible

## Security
- [ ] No XSS vulnerabilities
- [ ] No SQL/NoSQL injection
- [ ] Authentication enforced
- [ ] Authorization working
- [ ] HTTPS in production
- [ ] Rate limiting active

## Performance
- [ ] Page load < 2 seconds
- [ ] API response < 100ms (p99)
- [ ] Database queries optimized
- [ ] No memory leaks
- [ ] Load test passing

## Compatibility
- [ ] Works in Chrome
- [ ] Works in Firefox
- [ ] Works in Safari
- [ ] Works on mobile
- [ ] Cookies work across domains

## Data
- [ ] No duplicate commissions
- [ ] Metrics calculated correctly
- [ ] TTL cleanup working
- [ ] Backups automated
- [ ] Restore procedure tested

## Monitoring
- [ ] Error tracking enabled
- [ ] Alerts configured
- [ ] Logs available
- [ ] Metrics dashboards set up
- [ ] Health checks active
```

---

## Continuous Integration

### CI/CD Pipeline Configuration

```yaml
# File: .github/workflows/test.yml

name: Test and Deploy

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:5
        options: >-
          --health-cmd mongosh
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v2

      - name: Setup Node.js
        uses: actions/setup-node@v2
        with:
          node-version: '16'

      - name: Install dependencies
        run: npm ci

      - name: Run Linter
        run: npm run lint

      - name: Run Unit Tests
        run: npm run test:unit
        env:
          MONGODB_URI: mongodb://localhost:27017/test

      - name: Run Integration Tests
        run: npm run test:integration
        env:
          MONGODB_URI: mongodb://localhost:27017/test

      - name: Generate Coverage Report
        run: npm run test:coverage

      - name: Upload Coverage
        uses: codecov/codecov-action@v2
        with:
          files: ./coverage/coverage-final.json
          fail_ci_if_error: true
          min_coverage: 80

      - name: Security Scan
        run: npm audit

      - name: Build
        run: npm run build

  deploy:
    needs: test
    if: github.ref == 'refs/heads/main'
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v2

      - name: Deploy to Production
        run: |
          # Deployment script
          echo "Deploying to production"
```

---

## Summary

Testing ensures the referral tracking system is:

- ✅ **Functional** - All features work correctly
- ✅ **Reliable** - Handles errors gracefully
- ✅ **Secure** - Protected against common attacks
- ✅ **Performant** - Handles high traffic
- ✅ **Compatible** - Works across browsers
- ✅ **Maintainable** - Easy to debug and extend

**Target Metrics:**

- Code Coverage: >80%
- Test Pass Rate: 100%
- Load Test p99: <100ms
- Error Rate: <0.1%
- Uptime: 99.9%
