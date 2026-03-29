# Affiliate System End-to-End Testing & Activation Guide

## Overview

This document provides a complete step-by-step plan to test, debug, and activate the entire affiliate, referral tracking, commission, and payout system.

**Current Status**: System implemented but not yet tested with real data flows

**Goal**: Execute complete end-to-end testing to ensure:
- ✅ Backend endpoints functioning correctly
- ✅ Database records being created properly
- ✅ Frontend receives real data
- ✅ All metrics display correctly
- ✅ Commission workflow works end-to-end

---

## Part 1: Preparation

### 1.1 System Health Check
```bash
# Check backend is running
curl http://localhost:5000/api/v1/health

# Check frontend is running
curl http://localhost:3000

# Check MongoDB is running
mongosh --eval "db.adminCommand('ping')"
```

### 1.2 Environment Verification
```bash
# Verify .env has required variables
cat .env | grep -E "MONGODB_URI|JWT_SECRET|STRIPE_SECRET"

# Verify all services
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo "MongoDB: mongodb://localhost:27017"
```

---

## Part 2: Data Seeding (CRITICAL STEP)

The database needs realistic test data before testing frontend displays.

### 2.1 Run Seed Script
```bash
npm run seed:affiliate

# Output will show:
# ✅ Test user created
# ✅ Affiliate registered (code: AFF...)
# ✅ 10 referral clicks created
# ✅ 5 test orders created
# ✅ 5 commissions created (various statuses)
# ✅ Payouts created
```

**Save this information:**
- Test User Email: `affiliate-seed-XXXXX@test.com`
- Test User Password: `TestPassword123!`
- Affiliate Code: `AFF...`
- Admin Email: Create separately if needed

### 2.2 Verify Seeded Data in MongoDB
```javascript
// Check affiliate was created
db.affiliates.findOne({})

// Check referrals were created
db.referrals.countDocuments()  // Should be ~10

// Check orders were created
db.orders.find({"affiliateDetails.affiliateId": {$exists: true}}).count()  // Should be ~5

// Check commissions were created
db.commissions.countDocuments()  // Should be ~5
```

---

## Part 3: Automated Test Suite

### 3.1 Run Tests
```bash
npm run test:affiliate

# This will:
# 1. Create test users
# 2. Register affiliate
# 3. Test all endpoints
# 4. Verify responses
# 5. Generate summary report
```

### 3.2 Review Test Output
Look for:
```
✅ User Registration
✅ Affiliate Registration  
✅ Referral Tracking
✅ Commission System
✅ Payout System
✅ Dashboard Analytics
```

All should show ✅. If any show ❌, note the error for debugging.

---

## Part 4: Manual Endpoint Testing

### 4.1 Get Authentication Token

**Register Test User:**
```bash
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "manual-test-'$(date +%s)'@test.com",
    "password": "TestPassword123!",
    "name": "Manual Test User"
  }'

# Save the returned 'token' value
```

**Save token in variable:**
```bash
TOKEN="paste-token-here"
```

### 4.2 Register as Affiliate
```bash
curl -X POST http://localhost:5000/api/v1/affiliate/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"termsAccepted": true}'

# Save the returned 'affiliateCode' (AFF...)
AFFILIATE_CODE="AFF..."
```

### 4.3 Test Referral Click Tracking
```bash
# This simulates clicking an affiliate link
curl -v http://localhost:5000/api/ref/$AFFILIATE_CODE?redirect=/products

# Expected:
# HTTP 302 Redirect
# Set-Cookie: affiliate_ref=...
```

### 4.4 Get Affiliate Dashboard Data
```bash
AFFILIATE_ID="paste-affiliate-id-from-registration"

curl -X GET http://localhost:5000/api/v1/affiliate/dashboard \
  -H "Authorization: Bearer $TOKEN"

# Check response contains:
# - stats.totalClicks
# - stats.conversions  
# - stats.totalEarnings
# - stats.pendingCommissions
```

### 4.5 Get Commission Data
```bash
curl -X GET http://localhost:5000/api/v1/affiliate/commissions/stats \
  -H "Authorization: Bearer $TOKEN"

# Response should show:
# pending: {count, total}
# approved: {count, total}
# paid: {count, total}
```

### 4.6 Get Affiliate Analytics
```bash
curl -X GET "http://localhost:5000/api/v1/affiliate/analytics?limit=30" \
  -H "Authorization: Bearer $TOKEN"

# Response should have:
# - dailyMetrics array
# - bySource object
# - byDevice object
```

---

## Part 5: Frontend Dashboard Verification

### 5.1 Test Affiliate Dashboard

1. Open browser: `http://localhost:3000/login`
2. Use credentials from seeding (email/password) or registration
3. Navigate to: `http://localhost:3000/affiliate/dashboard`
4. **Verify these metrics display real numbers:**
   - ✅ Total Clicks: Should be > 0 (from seeded referrals)
   - ✅ Conversions: Should show count
   - ✅ Total Earnings: Should show sum of order amounts
   - ✅ Pending Commissions: Should show count/amount
   - ✅ Completed Payouts: Should show count/amount

### 5.2 Test Commissions Page

1. Navigate to: `http://localhost:3000/affiliate/commissions`
2. **Verify:**
   - ✅ Table shows commission records
   - ✅ Columns: Order ID, Amount, Commission, Status, Date
   - ✅ Each row has correct commission amount (order * rate)
   - ✅ Status badges show correctly (pending/approved/paid)
   - ✅ Filter by status works

### 5.3 Test Analytics Charts

1. Stay on dashboard tab
2. **Verify charts display:**
   - ✅ Referral trend chart (line chart)
   - ✅ Commission status pie chart
   - ✅ Top products chart
   - ✅ Revenue trend chart

### 5.4 Test Admin Dashboard

1. Create admin user or use existing
2. Navigate to: `http://localhost:3000/admin/dashboard`
3. **Verify affiliate metrics section shows:**
   - ✅ Total Affiliates count
   - ✅ Active Affiliates count
   - ✅ Top Affiliates chart with names & earnings
   - ✅ Total commission amount
   - ✅ Pending commission count

---

## Part 6: Admin Workflow Testing

### 6.1 Get Admin Token
```bash
# Register admin (or create via MongoDB)
curl -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin-'$(date +%s)'@test.com",
    "password": "AdminPassword123!",
    "name": "Admin User",
    "role": "admin"
  }'

ADMIN_TOKEN="paste-admin-token"
```

### 6.2 List All Commissions (Admin)
```bash
curl -X GET "http://localhost:5000/api/v1/admin/commissions?page=1&limit=20" \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should list all commissions with status breakdown
```

### 6.3 Approve a Commission
```bash
COMMISSION_ID="paste-commission-id-from-list"

curl -X POST http://localhost:5000/api/v1/admin/commissions/$COMMISSION_ID/approve \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"notes": "Approved for payment"}'

# Response should show status changed to "approved"
```

### 6.4 Pay a Commission
```bash
curl -X POST http://localhost:5000/api/v1/admin/commissions/$COMMISSION_ID/pay \
  -H "Authorization: Bearer $ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "method": "bank_transfer",
    "transactionId": "txn_'$(date +%s)'"
  }'

# Response should show status changed to "paid"
```

### 6.5 Get Commission Analytics
```bash
curl -X GET http://localhost:5000/api/v1/admin/commissions/analytics \
  -H "Authorization: Bearer $ADMIN_TOKEN"

# Should show:
# - totalCommissions
# - byStatus breakdown
# - topAffiliates
```

---

## Part 7: Data Verification in MongoDB

### 7.1 Connect to MongoDB
```bash
mongosh
use spherekings
```

### 7.2 Check Key Collections
```javascript
// Affiliates
db.affiliates.findOne()
// Verify: userId, affiliateCode, status, commissionRate

// Referral Tracking
db.referrals.find({}).limit(5)
// Verify: affiliateCode, source, device, converted

// Orders with Affiliate
db.orders.find({"affiliateDetails.affiliateId": {$exists: true}}).limit(3)
// Verify: affiliateDetails.affiliateId, total, paymentStatus

// Commissions
db.commissions.find({}).limit(5)
// Verify: affiliateId, commissionAmount, status, orderId

// Payouts
db.payouts.find({}).limit(3)
// Verify: affiliateId, amount, status, method
```

### 7.3 Calculate Totals
```javascript
// Total referral clicks
db.referrals.countDocuments()

// Total orders with affiliate
db.orders.countDocuments({"affiliateDetails.affiliateId": {$exists: true}})

// Total commission amount
db.commissions.aggregate([
  {$group: {_id: null, total: {$sum: "$commissionAmount"}}}
])

// Commissions by status
db.commissions.aggregate([
  {$group: {_id: "$status", count: {$sum: 1}}}
])
```

---

## Part 8: Debugging Checklist

### If Frontend Shows "0 Clicks"
- [ ] Check database: `db.referrals.countDocuments()` returns > 0
- [ ] Check API endpoint returns data: `curl http://localhost:5000/api/v1/affiliate/dashboard`
- [ ] Check response has `stats.totalClicks` > 0
- [ ] Clear browser cache and refresh (Ctrl+Shift+Delete, then Ctrl+F5)
- [ ] Check browser Network tab for 200 OK responses

### If Commissions Show $0
- [ ] Check `db.commissions.findOne()` has `commissionAmount` > 0
- [ ] Check affiliate has `commissionRate` > 0
- [ ] Check order has positive `total`
- [ ] Calculate: `order.total × affiliate.commissionRate = commission amount`
- [ ] Verify calculation matches stored value

### If API Returns 401 Unauthorized
- [ ] Check token is included: `Authorization: Bearer $TOKEN`
- [ ] Check token hasn't expired (use jwt.io to decode)
- [ ] Check user exists in database
- [ ] Get new token and retry

### If Dashboard Loads Slow
- [ ] Check MongoDB indexes: `db.collection.getIndexes()`
- [ ] Add index on affiliateId: `db.collection.createIndex({affiliateId: 1})`
- [ ] Check backend logs for slow queries
- [ ] Restart MongoDB and backend

---

## Part 9: Success Criteria

### Backend ✅
- [ ] All endpoints respond with 200 OK
- [ ] No 500 errors in backend logs
- [ ] Database records created for all test data
- [ ] Commissions created automatically on order
- [ ] API responses contain expected fields

### Frontend ✅
- [ ] Dashboard loads without errors
- [ ] Metrics display real numbers (not 0 or NaN)
- [ ] Charts render with data
- [ ] Filter/pagination works
- [ ] Admin dashboard shows affiliate data

### Data Flow ✅
- [ ] Referral click → ReferralTracking record
- [ ] Order placement → Commission record created
- [ ] Commission approval → Status change
- [ ] Payout request → Payout record
- [ ] All data visible in frontend dashboards

### System Health ✅
- [ ] No console errors
- [ ] API response times < 500ms
- [ ] No database connection errors
- [ ] All calculations correct
- [ ] All status transitions work

---

## Part 10: Execution Timeline

### Phase 1: Setup (5 minutes)
```bash
npm run seed:affiliate
```

### Phase 2: Automated Testing (2 minutes)
```bash
npm run test:affiliate
```

### Phase 3: Manual API Testing (10 minutes)
Run curl commands from Part 4

### Phase 4: Frontend Verification (5 minutes)
Check dashboards in browser

### Phase 5: Data Verification (5 minutes)
Verify MongoDB records

### Phase 6: Admin Workflow (5 minutes)
Approve commissions and payouts

**Total Time: ~35 minutes**

---

## Part 11: Troubleshooting Resources

### Common Issues & Fixes
1. **Token expires**: Get new token with login endpoint
2. **Database connection fails**: Check MongoDB is running on 27017
3. **API 404 errors**: Verify routes are registered in server.js
4. **CORS errors**: Check cors middleware is configured
5. **Zero values in frontend**: Ensure seed script ran successfully

### Log Locations
- **Backend logs**: Terminal where `npm run dev` is running
- **Frontend logs**: Browser DevTools Console (F12)
- **Database logs**: MongoDB logs (usually in `/var/log/mongodb/`)

### Key Files to Review
- `src/services/affiliateService.js` - Business logic
- `src/controllers/affiliateController.js` - API handlers
- `src/models/Affiliate.js`, `Commission.js` - Schemas
- `FRONTEND_AUTH_IMPLEMENTATION/src/api/services/affiliateService.js` - Frontend API
- `FRONTEND_AUTH_IMPLEMENTATION/src/pages/affiliate/dashboard.jsx` - Dashboard UI

---

## Part 12: Performance Optimization

After testing succeeds, optimize:

```javascript
// 1. Add database indexes
db.affiliates.createIndex({userId: 1, affiliateCode: 1})
db.referrals.createIndex({affiliateId: 1, converted: 1})
db.commissions.createIndex({affiliateId: 1, status: 1})
db.payouts.createIndex({affiliateId: 1, status: 1})

// 2. Cache API responses (frontend)
// Already configured with React Query (5-10 min stale time)

// 3. Pagination limits
// Affiliate dashboard: limit 20 records per page
// Admin dashboard: limit 50 records per page

// 4. Field selection (backend)
// Only query needed fields, omit sensitive data
```

---

## Part 13: Deployment Checklist

Before going to production:

- [ ] All tests pass
- [ ] No console errors
- [ ] API response times acceptable
- [ ] Database backups configured
- [ ] Error monitoring set up (Sentry)
- [ ] Rate limiting configured
- [ ] Stripe live mode credentials set
- [ ] Email notifications working
- [ ] Security audit passed
- [ ] Load testing completed

---

## Summary

This guide provides a complete testing strategy to activate the affiliate system. Follow each part sequentially:

1. **Seed data** → Real records in database
2. **Run tests** → Verify endpoints work
3. **Test manually** → Curl endpoints directly
4. **Check frontend** → Dashboards display real data
5. **Verify data** → MongoDB records correct
6. **Test admin** → Commission workflow works
7. **Debug issues** → Fix any problems
8. **Deploy** → Go live with confidence

**Next Step**: Run `npm run seed:affiliate` to begin!

