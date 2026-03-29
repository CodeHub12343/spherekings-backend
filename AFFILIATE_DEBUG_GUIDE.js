/**
 * ============================================================================
 * AFFILIATE SYSTEM DEBUGGING & VERIFICATION GUIDE
 * ============================================================================
 *
 * Complete step-by-step guide to test, debug, and verify the affiliate system
 *
 * ============================================================================
 */

const fs = require('fs');

const guide = `
╔════════════════════════════════════════════════════════════════════════════╗
║     SPHEREKINGS AFFILIATE SYSTEM - DEBUGGING & VERIFICATION GUIDE          ║
╚════════════════════════════════════════════════════════════════════════════╝

This guide helps you test and debug the complete affiliate system.

═════════════════════════════════════════════════════════════════════════════
PART 1: PREREQUISITES & SETUP
═════════════════════════════════════════════════════════════════════════════

1.1 Ensure Services Are Running:
   □ MongoDB: mongodb://localhost:27017/spherekings
   □ Backend: npm run dev (port 5000)
   □ Frontend: npm run dev (port 3000)

1.2 Verify Backend is Healthy:
   curl http://localhost:5000/api/v1/health
   Expected: 200 OK with health status

1.3 Check Environment Variables:
   .env should contain:
   - MONGODB_URI=mongodb://localhost:27017/spherekings
   - JWT_SECRET=<your-secret>
   - STRIPE_SECRET_KEY=<test-key>
   - NODE_ENV=development

═════════════════════════════════════════════════════════════════════════════
PART 2: DATA SEEDING
═════════════════════════════════════════════════════════════════════════════

2.1 Populate Database with Test Data:
   npm run seed:affiliate
   
   This script will:
   ✓ Create test affiliate user
   ✓ Register as affiliate
   ✓ Generate 10 referral clicks
   ✓ Create 5 test orders with affiliate attribution
   ✓ Create 5 commission records (various statuses)
   ✓ Create payout records
   
   Output will show:
   - Test user email & password
   - Affiliate code (AFF...)
   - Referral click count
   - Order IDs and totals
   - Commission amounts

═════════════════════════════════════════════════════════════════════════════
PART 3: ENDPOINT TESTING (WITH CURL)
═════════════════════════════════════════════════════════════════════════════

3.1 Authentication & Getting Bearer Token:

   # Register/Login user
   curl -X POST http://localhost:5000/api/v1/users/register \\
     -H "Content-Type: application/json" \\
     -d '{
       "email": "test-affiliate@test.com",
       "password": "TestPassword123!",
       "name": "Test Affiliate"
     }'

   # Save the returned 'token' for use in subsequent requests
   TOKEN="your-token-here"

3.2 Register as Affiliate:

   curl -X POST http://localhost:5000/api/v1/affiliate/register \\
     -H "Authorization: Bearer \$TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"termsAccepted": true}'

   Expected Response:
   {
     "success": true,
     "affiliateId": "...",
     "affiliateCode": "AFF...",
     "referralUrl": "http://localhost:5000/api/ref/AFF..."
   }

3.3 Test Referral Tracking (PUBLIC - No auth needed):

   # Click tracking (simulates user clicking affiliate link)
   curl -i http://localhost:5000/api/ref/AFF123456?redirect=/products

   Expected: 302 Redirect
   Check: affiliate_ref cookie should be set

3.4 Get Referral Statistics:

   curl -X GET http://localhost:5000/api/v1/tracking/stats/{affiliateId} \\
     -H "Authorization: Bearer \$TOKEN"

   Expected fields:
   - totalClicks: number
   - conversions: number
   - conversionRate: percentage
   - bySource: {organic, email, social, ...}
   - byDevice: {desktop, mobile, tablet}

3.5 Get Commission Statistics:

   curl -X GET http://localhost:5000/api/v1/affiliate/commissions/stats \\
     -H "Authorization: Bearer \$TOKEN"

   Expected fields:
   - pending: {count, total, average}
   - approved: {count, total}
   - paid: {count, total}
   - reversed: {count, total}

3.6 List Commissions:

   curl -X GET "http://localhost:5000/api/v1/affiliate/commissions?page=1&limit=20" \\
     -H "Authorization: Bearer \$TOKEN"

   Expected: Array of commission objects with:
   - commissionAmount
   - status (pending/approved/paid/reversed)
   - orderId
   - createdAt

3.7 Get Affiliate Dashboard:

   curl -X GET http://localhost:5000/api/v1/affiliate/dashboard \\
     -H "Authorization: Bearer \$TOKEN"

   Expected fields in response:
   - stats.totalClicks
   - stats.conversions
   - stats.totalEarnings
   - stats.pendingCommissions
   - stats.completedPayouts
   - recentCommissions: []
   - topProducts: []

3.8 Get Affiliate Analytics:

   curl -X GET "http://localhost:5000/api/v1/affiliate/analytics?limit=30" \\
     -H "Authorization: Bearer \$TOKEN"

   Expected fields:
   - dailyMetrics: [{date, clicks, conversions, earnings}]
   - bySource: [{source, clicks, conversions, earnings}]
   - byDevice: [{device, clicks, conversions, earnings}]

═════════════════════════════════════════════════════════════════════════════
PART 4: ADMIN TESTING
═════════════════════════════════════════════════════════════════════════════

4.1 Get Admin Token (create admin user first):

   curl -X POST http://localhost:5000/api/v1/users/register \\
     -H "Content-Type: application/json" \\
     -d '{
       "email": "admin@test.com",
       "password": "AdminPassword123!",
       "name": "Admin User",
       "role": "admin"
     }'

   ADMIN_TOKEN="your-admin-token"

4.2 List All Commissions (Admin):

   curl -X GET "http://localhost:5000/api/v1/admin/commissions?page=1&limit=20" \\
     -H "Authorization: Bearer \$ADMIN_TOKEN"

4.3 Approve a Commission:

   curl -X POST http://localhost:5000/api/v1/admin/commissions/{commissionId}/approve \\
     -H "Authorization: Bearer \$ADMIN_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{"notes": "Approved for payment"}'

   Expected: Commission status changes to "approved"

4.4 Pay a Commission:

   curl -X POST http://localhost:5000/api/v1/admin/commissions/{commissionId}/pay \\
     -H "Authorization: Bearer \$ADMIN_TOKEN" \\
     -H "Content-Type: application/json" \\
     -d '{
       "method": "bank_transfer",
       "transactionId": "txn_123456"
     }'

   Expected: Commission status changes to "paid"

4.5 List Top Affiliates:

   curl -X GET "http://localhost:5000/api/v1/admin/affiliates/top?limit=10" \\
     -H "Authorization: Bearer \$ADMIN_TOKEN"

   Expected: Array of top affiliates by earnings

4.6 Get Commission Analytics:

   curl -X GET http://localhost:5000/api/v1/admin/commissions/analytics \\
     -H "Authorization: Bearer \$ADMIN_TOKEN"

   Expected breakdown:
   - totalCommissions: number
   - byStatus: {pending: count, approved: count, paid: count}
   - topAffiliates: [{affiliateId, totalAmount}]

═════════════════════════════════════════════════════════════════════════════
PART 5: FRONTEND DASHBOARD TESTING
═════════════════════════════════════════════════════════════════════════════

5.1 Affiliate Dashboard Verification:

   URL: http://localhost:3000/affiliate/dashboard
   
   ✓ Check these metrics display real values:
     • Total Clicks: Should show > 0 if referrals created
     • Conversions: Should show count of converted referrals
     • Total Earnings: Should match total order amounts
     • Pending Commissions: Should show pending status count
     • Completed Payouts: Should show completed payout count
   
   ✓ Charts should display:
     • Referral click trends (daily/weekly)
     • Commission breakdown (pending/approved/paid)
     • Top products (by commission)
   
   ✓ Recent activity section should show:
     • Recent commissions with amounts
     • Recent payouts with status
     • Recent sales with commissions

5.2 Commissions Page:

   URL: http://localhost:3000/affiliate/commissions
   
   ✓ Should display table with columns:
     • Order ID
     • Order Date
     • Order Amount
     • Commission Rate
     • Commission Amount
     • Status (pending/approved/paid)
     • Actions
   
   ✓ Filter by status:
     • Click status filter dropdown
     • Should only show matching commissions

5.3 Payouts Page:

   URL: http://localhost:3000/affiliate/payouts
   
   ✓ Should display:
     • Payout requests list
     • Status of each payout
     • Amounts
     • Dates
   
   ✓ Should have "Request Payout" button
     • Only enabled if balance > threshold

5.4 Admin Dashboard:

   URL: http://localhost:3000/admin/dashboard
   
   ✓ Check affiliate metrics:
     • Total Affiliates
     • Active Affiliates
     • Top Affiliates chart
     • Recent affiliate activity

═════════════════════════════════════════════════════════════════════════════
PART 6: DATA VERIFICATION IN DATABASE
═════════════════════════════════════════════════════════════════════════════

Use MongoDB Compass or mongosh CLI:

6.1 Check Affiliate Records:

   db.affiliates.findOne({affiliateCode: "AFF..."})
   
   Verify fields:
   - userId: reference to user
   - affiliateCode: unique code
   - status: "active"
   - commissionRate: decimal (0.15 = 15%)
   - stats: {totalReferrals, conversions, earnings}

6.2 Check ReferralTracking Records:

   db.referrals.find({affiliateId: ObjectId("...")}).limit(5)
   
   Verify fields:
   - affiliateCode: matches affiliate
   - source: organic/email/social/paid_ad
   - device: desktop/mobile/tablet
   - converted: true/false
   - utmCampaign, utmSource, etc.

6.3 Check Order Records:

   db.orders.find({
     "affiliateDetails.affiliateId": ObjectId("...")
   }).limit(5)
   
   Verify fields:
   - affiliateDetails.affiliateId: is set
   - affiliateDetails.affiliateCode: is set
   - affiliateDetails.commissionRate: is set
   - total: order amount
   - orderStatus: "delivered"
   - paymentStatus: "paid"

6.4 Check Commission Records:

   db.commissions.find({affiliateId: ObjectId("...")}).limit(5)
   
   Verify fields:
   - affiliateId: matches affiliate
   - orderId: references order
   - commissionAmount: calculated correctly
   - status: pending/approved/paid/reversed
   - statusHistory: array of status changes

6.5 Check Payout Records:

   db.payouts.find({affiliateId: ObjectId("...")})
   
   Verify fields:
   - affiliateId: matches affiliate
   - amount: > 0
   - status: pending/approved/processing/completed
   - method: bank_transfer/paypal/stripe/crypto

═════════════════════════════════════════════════════════════════════════════
PART 7: DEBUGGING COMMON ISSUES
═════════════════════════════════════════════════════════════════════════════

ISSUE: Frontend shows "0 Clicks" in affiliate dashboard
───────────────────────────────────────────────────────

Diagnostic Steps:
1. Check MongoDB for referral records:
   db.referrals.countDocuments({affiliateId: ObjectId("...")})
   Should return > 0

2. Check API endpoint returns data:
   curl http://localhost:5000/api/v1/tracking/stats/{affiliateId} \\
     -H "Authorization: Bearer \$TOKEN"
   Should show "totalClicks": number

3. Check frontend is calling correct API:
   Open browser DevTools → Network tab
   Look for GET /api/v1/affiliate/dashboard
   Check response has stats.totalClicks

4. Check cache issue:
   Clear browser cache (Ctrl+Shift+Delete)
   Refresh page (Ctrl+F5)


ISSUE: Commissions show amount of \$0
──────────────────────────────────────

Diagnostic Steps:
1. Check commission records in DB:
   db.commissions.findOne()
   Verify commissionAmount > 0

2. Check affiliate commission rate:
   db.affiliates.findOne({affiliateCode: "AFF..."})
   Look for commissionRate field (should be 0.15 or similar)

3. Check order total:
   db.orders.findOne({_id: commission.orderId})
   Verify total field > 0

4. Calculate manually:
   commissionAmount = order.total × affiliate.commissionRate
   Example: \$100 × 0.15 = \$15


ISSUE: Permission denied accessing commissions
───────────────────────────────────────────────

Diagnostic Steps:
1. Verify JWT token is valid:
   Check token expiration: jwt.io (paste token)

2. Check user is affiliate:
   db.users.findOne({_id: userId})
   Look for affiliateDetails.isAffiliate = true

3. Verify auth header format:
   Must be: Authorization: Bearer {token}
   Not: Authorization: {token}

4. Check API logs for auth errors:
   Look for "❌ Unauthorized" in backend console


ISSUE: Referral clicks not being tracked
─────────────────────────────────────────

Diagnostic Steps:
1. Test referral endpoint directly:
   curl -i http://localhost:5000/api/ref/AFF123456?redirect=/products
   Should return 302 redirect with Set-Cookie header

2. Check mongoose logs:
   Look for "ReferralTracking created" in backend

3. Verify affiliate code exists:
   db.affiliates.findOne({affiliateCode: "AFF123456"})
   Should return affiliate document

4. Check for errors in backend:
   Look for "❌" messages in server logs


═════════════════════════════════════════════════════════════════════════════
PART 8: COMPLETE TESTING WORKFLOW
═════════════════════════════════════════════════════════════════════════════

Run these commands in order:

Step 1: Seed test data
  npm run seed:affiliate

  Wait for completion, note the affiliate code and user email

Step 2: Run automated test suite
  npm run test:affiliate

  This will test all endpoints and report results

Step 3: Verify frontend displays data
  Open http://localhost:3000/affiliate/dashboard
  Login with credentials from Step 1
  Verify all metrics display > 0

Step 4: Inspect browser network
  Open DevTools → Network tab
  Refresh page
  Check that API calls return data (not errors)
  Check response payload for values

Step 5: Check MongoDB data
  Connect to MongoDB with Compass
  Verify documents exist in collections:
  - users
  - affiliates
  - referrals
  - orders
  - commissions
  - payouts

Step 6: Test admin flows
  Login as admin to http://localhost:3000/admin/dashboard
  Verify affiliate metrics display
  Check commissions/payouts queue

═════════════════════════════════════════════════════════════════════════════
PART 9: EXPECTED DATA FLOW VERIFICATION
═════════════════════════════════════════════════════════════════════════════

✓ Referral Click Flow:
  1. User clicks affiliate link: /api/ref/AFF123456
  2. ReferralTracking record created in DB
  3. affiliate_ref cookie set in browser
  4. User redirected to /products page
  5. Dashboard shows +1 click

✓ Order Attribution Flow:
  1. User makes purchase with affiliate_ref cookie
  2. Order created with affiliateDetails field populated
  3. Commission record automatically created
  4. Dashboard shows commission in "Pending" status
  5. Order total used to calculate commission

✓ Commission Approval Flow:
  1. Commission created with status "pending"
  2. Admin approves commission
  3. Status changes to "approved"
  4. Commission eligible for payout

✓ Payout Flow:
  1. Affiliate requests payout for total approved commissions
  2. Payout record created with status "pending"
  3. Admin approves payout
  4. Payout processed (status → "processing")
  5. Payout completed (status → "completed")
  6. Dashboard shows in "Completed Payouts"

═════════════════════════════════════════════════════════════════════════════
PART 10: KEY METRICS TO MONITOR
═════════════════════════════════════════════════════════════════════════════

Dashboard KPIs:
✓ Total Clicks: ReferralTracking count
✓ Conversions: ReferralTracking count where converted=true
✓ Conversion Rate: conversions ÷ clicks × 100
✓ Total Earnings: Sum of all commission amounts
✓ Pending Commissions: Sum of "pending" status commissions
✓ Completed Payouts: Sum of "completed" status payouts
✓ Average Commission: Total earnings ÷ conversion count

API Response Headers to Check:
✓ Authorization: Bearer token should be present
✓ Content-Type: application/json
✓ X-Request-ID: unique request identifier (if implemented)
✓ X-Response-Time: milliseconds (if implemented)

Database Indexing (for performance):
✓ affiliates: index on userId, affiliateCode
✓ referrals: index on affiliateId, converted
✓ orders: index on affiliateDetails.affiliateId
✓ commissions: index on affiliateId, status
✓ payouts: index on affiliateId, status

═════════════════════════════════════════════════════════════════════════════
PART 11: SUPPORT & RESOURCES
═════════════════════════════════════════════════════════════════════════════

Key Files:
• Backend: src/services/affiliateService.js
• Backend: src/models/Affiliate.js, Commission.js, Payout.js
• Frontend: src/api/services/affiliateService.js
• Frontend: src/pages/affiliate/dashboard.jsx
• Tests: test-affiliate-system.js
• Seed Script: seed-test-data.js

Documentation:
• API Routes: src/routes/affiliateRoutes.js
• Commission Logic: src/services/commissionService.js
• Referral Tracking: src/controllers/referralTrackingController.js

Useful npm Commands:
• npm run dev                 - Start dev server
• npm run seed:affiliate      - Populate test data
• npm run test:affiliate      - Run test suite
• npm run lint                - Check code quality
• npm run build               - Build for production

═════════════════════════════════════════════════════════════════════════════

NEXT STEPS:

1. Run: npm run seed:affiliate
2. Login to frontend dashboard
3. Verify metrics display real numbers
4. Check admin dashboard for affiliate data
5. Test commission approval/payout flow
6. Monitor backend logs for errors
7. Check MongoDB for data consistency

═════════════════════════════════════════════════════════════════════════════
`;

console.log(guide);

// Optionally save to file
fs.writeFileSync('./AFFILIATE_DEBUG_GUIDE.txt', guide);
console.log('\n✅ Guide saved to AFFILIATE_DEBUG_GUIDE.txt');
