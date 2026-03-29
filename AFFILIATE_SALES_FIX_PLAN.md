# Affiliate Sales Data Issue - Root Cause Analysis & Fixes

## Root Cause Identified

The affiliate referral tracking is **BREAKING at the checkout stage** - affiliateId is not being properly passed through the order creation flow.

### Issue Chain:
1. ✅ `affiliateAttributionMiddleware` correctly extracts `affiliateId` from referral cookie → `req.affiliate.referralId`
2. ❌ `checkoutController.createCheckoutSession()` IGNORES `req.affiliate` and attempts to re-read from cookies directly
3. ❌ Due to complexity of cookie reading, affiliateId often ends up NULL
4. ❌ Order created WITHOUT affiliateDetails (because affiliateId is null)
5. ❌ No sales appear in affiliate dashboard

## Fix Strategy

### Backend Fixes Required:

**1. Fix checkoutController.js** (lines 68-76)
- Use `req.affiliate.referralId` instead of re-reading cookies
- This is guaranteed to be valid since middleware already validated it

```javascript
// BEFORE:
let affiliateId = req.query.affiliateId || req.body.affiliateId;
if (!affiliateId) {
  const referralCookie = getReferralCookie(req.cookies);
  if (referralCookie && !isCookieExpired(referralCookie)) {
    affiliateId = referralCookie.affiliateId;
  }
}

// AFTER:
let affiliateId = req.query.affiliateId || req.body.affiliateId || req.affiliate?.referralId;
```

**2. Verify webhooks also pass affiliateId**
- Check Stripe webhook handler - when order is marked paid, verify affiliateId is passed
- Ensure commission is created immediately after payment succeeds

### Frontend Fixes Required:

**1. Fix sales page data access** (line 212)
- Already fixed: `salesData?.data?.sales || []`

## Testing Strategy

Run these commands to verify fix:
```bash
# 1. Create new test affiliate
npm run seed:affiliate

# 2. Place order through affiliate referral link
# Visit: http://localhost:3000/ref/[AFFILIATE_CODE]
# Complete purchase

# 3. Query backend to verify affiliateDetails
# GET /api/v1/affiliate/profile 
# Should show: totalSales = 1, totalCommission = commission_rate * order_total

# 4. Frontend should display sales
# Visit: http://localhost:3000/affiliate/referrals/sales
# Should show: 1 sale, commission amount, order details
```

## Expected Results After Fix

✅ Orders created through referral links will have `order.affiliateDetails.affiliateId` set
✅ Commissions will be created and linked to orders
✅ Frontend affiliate sales page will display all attributed orders
✅ Commission calculations will appear correctly
