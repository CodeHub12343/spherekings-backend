# QUICK REFERENCE - AFFILIATE SYSTEM TESTING

## Essential Commands

### 1. Start Backend
```bash
npm run dev
```

### 2. Seed Test Data (Most Important!)
```bash
npm run seed:affiliate
# Creates: test user, affiliate, referrals, orders, commissions, payouts
```

### 3. Run Automated Tests
```bash
npm run test:affiliate
# Tests all endpoints and generates report
```

### 4. View Debug Guide
```bash
npm run debug:affiliate
# Outputs complete debugging guide
```

---

## Testing Workflow (30 minutes)

### Step 1: Seed Database
```bash
npm run seed:affiliate
```
**Output shows:**
```
✅ Test User: affiliate-seed-xxxxx@test.com / TestPassword123!
✅ Affiliate Code: AFF123456
✅ Referral Clicks: 10
✅ Orders Created: 5
✅ Commissions: 5
✅ Payouts: 1
```

### Step 2: Check Frontend Dashboard
```
URL: http://localhost:3000/affiliate/dashboard
Login: Use credentials from seeding output
```

**Verify these display real numbers:**
- ✅ Total Clicks: 10 (or similar)
- ✅ Conversions: 3-4 (30-40% conversion rate)
- ✅ Total Earnings: ~$1,000-2,000
- ✅ Pending Commissions: Count shown
- ✅ Charts render with data

### Step 3: Check Admin Dashboard
```
URL: http://localhost:3000/admin/dashboard
Login: As admin (create if needed)
```

**Verify:**
- ✅ Total Affiliates: 1+
- ✅ Top Affiliates: Your test affiliate shows
- ✅ Commission metrics: Show real amounts

### Step 4: Verify Database
```bash
mongosh
use spherekings

# Check referrals
db.referrals.countDocuments()  # Should be 10+

# Check orders with affiliate
db.orders.countDocuments({"affiliateDetails.affiliateId": {$exists: true}})  # Should be 5+

# Check commissions
db.commissions.countDocuments()  # Should be 5+

# Total commission amount
db.commissions.aggregate([{$group: {_id: null, total: {$sum: "$commissionAmount"}}}])
```

---

## Manual API Testing (Curl Commands)

### Get Token
```bash
RESPONSE=$(curl -s -X POST http://localhost:5000/api/v1/users/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test-'$(date +%s)'@test.com",
    "password": "TestPassword123!",
    "name": "Test"
  }')

TOKEN=$(echo $RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
echo "Token: $TOKEN"
```

### Register Affiliate
```bash
curl -X POST http://localhost:5000/api/v1/affiliate/register \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"termsAccepted": true}'
```

### Get Dashboard Data
```bash
curl -X GET http://localhost:5000/api/v1/affiliate/dashboard \
  -H "Authorization: Bearer $TOKEN"
```

### Get Commissions
```bash
curl -X GET http://localhost:5000/api/v1/affiliate/commissions/stats \
  -H "Authorization: Bearer $TOKEN"
```

### Get Analytics
```bash
curl -X GET "http://localhost:5000/api/v1/affiliate/analytics" \
  -H "Authorization: Bearer $TOKEN"
```

---

## Key Endpoints Reference

### Affiliate Endpoints (Protected)
| Method | Endpoint | Purpose |
|--------|----------|---------|
| POST | `/api/v1/affiliate/register` | Register as affiliate |
| GET | `/api/v1/affiliate/dashboard` | Get dashboard with stats |
| GET | `/api/v1/affiliate/commissions/stats` | Get commission statistics |
| GET | `/api/v1/affiliate/commissions` | List commissions |
| GET | `/api/v1/affiliate/analytics` | Get analytics breakdown |
| GET | `/api/v1/affiliate/sales` | Get attributed sales |
| GET | `/api/v1/tracking/stats/{affiliateId}` | Get referral stats |

### Admin Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/v1/admin/affiliates/top` | List top affiliates |
| GET | `/api/v1/admin/commissions` | List all commissions |
| POST | `/api/v1/admin/commissions/{id}/approve` | Approve commission |
| POST | `/api/v1/admin/commissions/{id}/pay` | Pay commission |
| GET | `/api/v1/admin/payouts` | List all payouts |

### Public Endpoints
| Method | Endpoint | Purpose |
|--------|----------|---------|
| GET | `/api/ref/{affiliateCode}` | Track referral click + redirect |
| GET | `/api/tracking/health` | Health check |

---

## Expected Test Results

### If Everything Works ✅
```
✅ Frontend shows real metrics
✅ Clicks: 10
✅ Conversions: 3-4
✅ Earnings: $1000-2000
✅ Commissions display correctly
✅ Admin sees affiliate data
✅ Database records exist
✅ All charts render
```

### If Not Working ❌
```
Problem: Dashboard shows "0 Clicks"
Solution: Check db.referrals.countDocuments() returns > 0

Problem: Commissions show $0
Solution: Verify db.commissions has commissionAmount > 0

Problem: API returns 401
Solution: Check token in Authorization header

Problem: Slow performance
Solution: Add database indexes
```

---

## Debugging Commands

### Check Backend Logs
```bash
# Look for errors in terminal running 'npm run dev'
# Filter for: ❌, error, failed
```

### Check Frontend Console
```
DevTools: F12 → Console
Look for: red errors, failed API calls
```

### Check Network Requests
```
DevTools: Network tab
• Filter by: dashboard
• Check response status: 200 OK
• Check response has data fields
```

### Check MongoDB
```bash
mongosh

# Count records
db.referrals.countDocuments()
db.orders.countDocuments({"affiliateDetails.affiliateId": {$exists: true}})
db.commissions.countDocuments()

# Find newest record
db.referrals.findOne({}, {sort: {createdAt: -1}})

# Check specific affiliate
db.affiliates.findOne({affiliateCode: "AFF123456"})
```

---

## Data Seeding Details

The seed script creates:

```
1 Test User
  └─ email: affiliate-seed-{timestamp}@test.com
  └─ password: TestPassword123!

1 Affiliate Account
  └─ affiliateCode: AFF{timestamp}
  └─ commissionRate: 15%
  └─ status: active

10 Referral Clicks
  └─ 30% conversion rate (3 converted)
  └─ Sources: organic, email, social, paid_ad
  └─ Devices: desktop, mobile, tablet

5 Orders
  └─ total: varies by product
  └─ status: delivered
  └─ paymentStatus: paid

5 Commissions
  └─ 2 pending, 2 approved, 1 paid
  └─ Amount: order.total × 0.15

1 Payout
  └─ status: pending/approved
  └─ amount: sum of approved commissions
```

---

## Files Created for Testing

| File | Purpose |
|------|---------|
| `test-affiliate-system.js` | Automated test suite |
| `seed-test-data.js` | Database seeding script |
| `AFFILIATE_DEBUG_GUIDE.js` | Debug reference |
| `AFFILIATE_TESTING_GUIDE.md` | Complete testing guide |
| `QUICK_REFERENCE.md` | This file |

---

## npm Scripts Added to package.json

```json
{
  "scripts": {
    "test:affiliate": "node test-affiliate-system.js",
    "seed:affiliate": "node seed-test-data.js",
    "debug:affiliate": "node AFFILIATE_DEBUG_GUIDE.js"
  }
}
```

---

## Success Indicators

### Database Level ✅
- ReferralTracking documents exist
- Orders have affiliate attribution
- Commissions created automatically
- Commission amounts calculated correctly

### API Level ✅
- /dashboard returns stats with values > 0
- /commissions/stats shows breakdown
- /analytics shows chart data
- All endpoints return 200 OK

### Frontend Level ✅
- Dashboard loads without errors
- Metrics display real numbers
- Charts render with data
- No console errors

### Business Logic ✅
- Click tracked → Referral record created
- Order placed → Commission created
- Commission approved → Status updated
- Payout requested → Payout record created

---

## Next Steps

1. **Run:** `npm run seed:affiliate`
2. **Wait:** ~30 seconds for completion
3. **Login:** Use credentials from output
4. **Check:** http://localhost:3000/affiliate/dashboard
5. **Verify:** Metrics show real numbers
6. **If Issues:** Check debug guide for solutions

---

## Support Resources

- **Full Debug Guide**: `npm run debug:affiliate`
- **Complete Testing Plan**: `./AFFILIATE_TESTING_GUIDE.md`
- **Backend Logs**: Terminal where `npm run dev` runs
- **Frontend Logs**: Browser DevTools (F12)
- **Database**: mongosh CLI or Compass GUI

---

## Last Updated
March 17, 2026

**Status**: Ready for testing
**Next Action**: Run `npm run seed:affiliate`
