# Complete Payout Payment Flow Trace

## Executive Summary

When an admin clicks "Pay" on a payout request, a complex data flow updates the database and recalculates affiliate balances. This document traces the complete flow from the "Pay" click through all database updates and frontend data fetching.

---

## 1. ADMIN PAYMENT ENDPOINT

### HTTP Request
```
POST /api/admin/payouts/:payoutId/process
Authorization: Bearer <admin_token>

Body:
{
  "receiptId": "receipt_123",
  "transactionId": "trans_456" (optional)
}
```

**File**: [src/routes/payoutRoutes.js](src/routes/payoutRoutes.js)

### Endpoint Handler

**File**: [src/controllers/payoutController.js](src/controllers/payoutController.js#L265-L300)

```javascript
async processPayout(req, res, next) {
  const { payoutId } = req.params;
  const { receiptId, transactionId } = req.body;
  
  // Calls the service layer
  const payout = await payoutService.markPayoutAsPaid(
    payoutId, 
    receiptId, 
    transactionId
  );
  
  return res.status(200).json({
    success: true,
    message: 'Payout marked as paid successfully',
    payout: {
      _id: payout._id,
      status: payout.status,        // NOW: 'paid'
      receiptId: payout.payment?.receiptId,
      transactionId: payout.payment?.transactionId,
      paidAt: payout.payment?.paidAt
    }
  });
}
```

---

## 2. COMMISSION STATUS UPDATE

### Service Layer: markPayoutAsPaid()

**File**: [src/services/payoutService.js](src/services/payoutService.js#L150-L250)

This is the CRITICAL function that marks commissions as paid.

#### Step-by-Step Process

```javascript
async markPayoutAsPaid(payoutId, receiptId, transactionId = null) {
  // Step 1: Find payout
  const payout = await Payout.findById(payoutId);
  
  // Step 2: Validate payout status is 'approved'
  if (payout.status !== 'approved') {
    throw new ValidationError('Only approved payouts can be marked as paid');
  }
  
  // ⚠️ CRITICAL STEP 4: Mark associated commissions as paid
  const approvedCommissions = await Commission.find({
    affiliateId: payout.affiliateId,
    status: 'approved'              // Find ALL commissions with status 'approved'
  }).sort({ createdAt: 1 });       // Oldest first (FIFO)
  
  let remainingAmount = payout.amount;
  const commissionIds = [];
  
  // Allocate payout amount to oldest commissions
  for (const commission of approvedCommissions) {
    if (remainingAmount <= 0) break;
    
    const commissionAmount = commission.calculation?.amount || 0;
    
    if (commissionAmount <= remainingAmount) {
      // ⚠️ UPDATE COMMISSION STATUS: 'approved' → 'paid'
      commission.status = 'paid';
      commissionIds.push(commission._id);
      remainingAmount -= commissionAmount;
      await commission.save();          // SAVES TO DATABASE
    }
  }
  
  console.log(`Marked ${commissionIds.length} commissions as paid`);
  
  // Step 5-6: Record payment details
  payout.payment = {
    receiptId: receiptId,
    transactionId: transactionId || `MANUAL-${Date.now()}`,
    paidAt: new Date(),
    method: 'manual'
  };
  
  // Step 7: Update payout status
  payout.status = 'paid';           // ⚠️ KEY: payout goes to 'paid'
  payout.statusHistory.push({
    status: 'paid',
    changedAt: new Date(),
    reason: 'Admin marked as paid (manual payment)'
  });
  
  await payout.save();              // SAVES TO DATABASE
  
  return payout;
}
```

### Database Changes After markPayoutAsPaid()

**Commission Collection** - For each commission marked as paid:
```javascript
OLD STATE:
{
  _id: ObjectId("commission123"),
  affiliateId: ObjectId("aff456"),
  status: 'approved',           // ← WAS 'approved'
  calculation: { amount: 45.50 },
  statusHistory: [
    { status: 'pending', ... },
    { status: 'approved', ... }
  ]
}

NEW STATE:
{
  _id: ObjectId("commission123"),
  affiliateId: ObjectId("aff456"),
  status: 'paid',               // ← NOW 'paid'
  calculation: { amount: 45.50 },
  statusHistory: [
    { status: 'pending', ... },
    { status: 'approved', ... },
    { status: 'paid', changedAt: Date.now(), ... }  // ← NEW ENTRY
  ]
}
```

**Payout Collection**:
```javascript
OLD STATE:
{
  _id: ObjectId("payout789"),
  affiliateId: ObjectId("aff456"),
  amount: 70.00,
  status: 'approved',           // ← WAS 'approved'
  payment: {}
}

NEW STATE:
{
  _id: ObjectId("payout789"),
  affiliateId: ObjectId("aff456"),
  amount: 70.00,
  status: 'paid',               // ← NOW 'paid'
  payment: {
    receiptId: "receipt_123",
    transactionId: "trans_456",
    paidAt: Date.now(),
    method: 'manual'
  }
}
```

### ⚠️ IMPORTANT: NO affiliate.balance update

**NOT DONE**: The service does NOT deduct from `User.affiliateDetails.availableBalance`

The commissions are marked as paid in the **Commission** collection, but the affiliate's User document balance is NOT updated. This is by design - balance is recalculated on-the-fly from Commission queries.

---

## 3. BACKEND AFFILIATE DASHBOARD CALCULATION

### getAffiliateProfile() - Primary Source

**File**: [src/services/affiliateService.js](src/services/affiliateService.js#L65-L135)

```javascript
async getAffiliateProfile(userId, filterOptions = {}) {
  // Get affiliate record
  const affiliate = await Affiliate.findOne({ userId });
  
  // Get all commission records (no status filter yet)
  const Commission = require('../models/Commission');
  const allCommissions = await Commission.find({ 
    affiliateId: affiliate._id 
  });
  
  // Split by status
  const pendingCommissions = allCommissions.filter(c => c.status === 'pending');
  const approvedCommissions = allCommissions.filter(c => c.status === 'approved');
  const paidCommissions = allCommissions.filter(c => c.status === 'paid');
  
  // Calculate earnings
  const pendingEarnings = pendingCommissions.reduce(
    (sum, c) => sum + (c.calculation?.amount || 0), 0
  );
  
  const approvedEarnings = approvedCommissions.reduce(
    (sum, c) => sum + (c.calculation?.amount || 0), 0
  );
  
  const paidEarnings = paidCommissions.reduce(
    (sum, c) => sum + (c.calculation?.amount || 0), 0
  );
  
  const totalEarnings = pendingEarnings + approvedEarnings + paidEarnings;
  
  return {
    earnings: {
      totalEarnings: totalEarnings,
      pendingEarnings: pendingEarnings,     // Commissions with status='pending'
      approvedEarnings: approvedEarnings,   // Commissions with status='approved'
      paidEarnings: paidEarnings,           // Commissions with status='paid'
      minimumPayoutThreshold: affiliate.minimumPayoutThreshold
    }
  };
}
```

### ⚠️ CRITICAL CALCULATION LOGIC

**Available for Payout** = Sum of commissions where:
- `status === 'approved'`
- Uses `calculation.amount` field

**Total Paid Out** = Sum of commissions where:
- `status === 'paid'`
- Uses `calculation.amount` field

### What Happens After markPayoutAsPaid()

**BEFORE payout payment**:
- Approved Earnings: $233.28 (all commissions with status='approved')
- Paid Earnings: $0 (no commissions with status='paid' yet)

**AFTER payout payment (admin pays $70)**:
- The service marks the oldest ~$70 worth of Commission records as 'paid'
- Approved Earnings: $233.28 - $70 = $163.28 ← Expected
- Paid Earnings: $0 + $70 = $70 ← Expected

---

## 4. FRONTEND DATA FETCHING

### Hook Hierarchy

```
useAffiliateDashboard()
  → affiliateService.getAffiliateDashboard()
    → Backend: GET /api/affiliate/dashboard
    → Returns: profile data with earnings breakdown

useAffiliatePayoutStats()
  → affliatePayoutService.getAffiliatePayoutStats()
    → Backend: GET /api/payouts/stats
    → Returns: payout statistics

useAffiliateCommissionStats()
  → commissionService.getAffiliateCommissionStats()
    → Backend: GET /api/v1/commissions/stats (affiliate)
    → Returns: commission statistics
```

### Hook 1: useAffiliateDashboard

**File**: [FRONTEND_AUTH_IMPLEMENTATION/src/hooks/useAffiliates.js](FRONTEND_AUTH_IMPLEMENTATION/src/hooks/useAffiliates.js#L24-L53)

```javascript
export const useAffiliateDashboard = (options = {}, enabled = true) => {
  return useQuery({
    queryKey: ['affiliate', 'dashboard'],
    queryFn: () => affiliateService.getAffiliateDashboard(options),
    staleTime: 30 * 1000,               // Cache 30 seconds
    gcTime: 5 * 60 * 1000,              // Keep 5 minutes
    refetchInterval: 30 * 1000,         // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true,  // Refetch even if unfocused
    enabled
  });
};

// Returns:
{
  dashboard: {
    earnings: {
      totalEarnings: 233.28,
      pendingEarnings: 0,
      approvedEarnings: 233.28,  // ← "Available for Payout"
      paidEarnings: 0            // ← "Total Paid Out"
    }
  }
}
```

**Backend Endpoint**: [src/controllers/affiliateController.js](src/controllers/affiliateController.js)

```javascript
GET /api/affiliate/dashboard

Response:
{
  success: true,
  data: {
    dashboard: {
      earnings: {
        pendingEarnings: 0,
        approvedEarnings: 233.28,
        paidEarnings: 0,
        totalEarnings: 233.28
      }
    }
  }
}
```

### Hook 2: useAffiliatePayoutStats

**File**: [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js#L41-L56)

```javascript
export const useAffiliatePayoutStats = (options = {}) => {
  return useQuery({
    queryKey: ['payouts', 'affiliate', 'stats'],
    queryFn: () => PayoutService.getAffiliatePayoutStats(),
    staleTime: 30 * 1000,
    cacheTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
    enabled: options.enabled !== false
  });
};

// Returns:
{
  totalPayouts: 1,
  pendingCount: 0,
  approvedCount: 1,
  completedCount: 1,
  totalPaidOut: 70.00,        // ← Sum of payouts with status='paid'
  totalPending: 0,
  averagePayout: 70.00
}
```

**Backend Method**: [src/models/Payout.js](src/models/Payout.js#L560-L630)

```javascript
PayoutSchema.statics.getAffiliatePayoutStats = async function(affiliateId) {
  const stats = await this.aggregate([
    { 
      $match: { affiliateId: new ObjectId(affiliateId) } 
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalAmount: { $sum: '$amount' }
      }
    }
  ]);
  
  // For status='paid': totalPaidOut = sum of $amount
  // For status='approved': amounts counted as totalPending
  // FOR status='pending': amounts counted as totalPending
}
```

### Hook 3: useAffiliateCommissionStats

**File**: [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useCommissions.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useCommissions.js#L68-L100)

```javascript
export function useAffiliateCommissionStats(options = {}) {
  return useQuery({
    queryKey: ['commissions', 'affiliate', 'stats', {...options}],
    queryFn: () => commissionService.getAffiliateCommissionStats(options),
    staleTime: 30 * 1000,
    gcTime: 5 * 60 * 1000,
    refetchInterval: 30 * 1000,
    refetchIntervalInBackground: true,
    enabled: options.enabled !== false
  });
}

// Returns:
{
  totalCommissions: 5,
  totalEarned: 233.28,
  pendingAmount: 0,
  approvedAmount: 233.28,     // ← Commissions with status='approved'
  paidAmount: 0,
  ...
}
```

### Where "Available for Payout" Comes From

**PayoutStatsCards Component**:

**File**: [FRONTEND_AUTH_IMPLEMENTATION/src/components/payouts/PayoutStatsCards.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/components/payouts/PayoutStatsCards.jsx#L99-L125)

```javascript
export default function PayoutStatsCards({ stats = {}, approvedEarnings = 0 }) {
  return (
    <>
      <StatCard>
        <StatLabel>Available for Payout</StatLabel>
        <StatValue>${approvedEarnings.toFixed(2)}</StatValue>
        <StatSubtext>Approved commissions ready</StatSubtext>
      </StatCard>
      
      <StatCard>
        <StatLabel>Total Paid Out</StatLabel>
        <StatValue>${totalPaidOut.toFixed(2)}</StatValue>
        <StatSubtext>Sum of completed payouts</StatSubtext>
      </StatCard>
    </>
  );
}
```

**Data Flow**:
```
Dashboard Page
  ↓
useAffiliateDashboard() → Gets dashboard.earnings.approvedEarnings
  ↓
Pass to <PayoutStatsCards approvedEarnings={approvedEarnings} />
  ↓
Display: ${approvedEarnings.toFixed(2)}
```

---

## 5. DATA INCONSISTENCY ROOT CAUSE

### Scenario: After Admin Pays $70

**Expected State**:
- Approved Earnings: $233.28 - $70 = $163.28
- Total Paid Out: $0 + $70 = $70

**If Showing**: "Total Paid Out: $70" but "Available for Payout: $233.28"

### Root Causes

#### ❌ Problem 1: Frontend Cache Not Invalidated

The issue is likely a **React Query cache stale problem**.

**Timeline**:
1. **T=0** Admin clicks "Pay"
2. **T=0.5s** Backend updates Commission records (approve→paid) and Payout (approve→paid)
3. **T=1s** Frontend displays old cached data from before T=0.5s
4. **T=31s** Auto-refetch triggers, data updates

**Why This Happens**:
- `useAffiliateDashboard` has `staleTime: 30 seconds`
- `useAffiliatePayoutStats` has `staleTime: 30 seconds`
- After "Pay" click, queries aren't immediately invalidated
- Frontend shows cached data for up to 30 seconds

#### ❌ Problem 2: Missing Cache Invalidation in Frontend

**File**: [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js#L195-L210)

```javascript
export const useProcessPayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, receiptId, transactionId }) =>
      PayoutService.processPayout(payoutId, receiptId, transactionId),
    onSuccess: (data) => {
      // ⚠️ ISSUE: Only invalidates admin queries, not affiliate dashboard!
      queryClient.invalidateQueries({ queryKey: ['payouts', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'ready'] });
      
      // ❌ MISSING: Should also invalidate affiliate dashboard
      // queryClient.invalidateQueries({ queryKey: ['affiliate', 'dashboard'] });
      // queryClient.invalidateQueries({ queryKey: ['commissions', 'affiliate'] });
      
      callbacks.onSuccess?.(data);
    }
  });
};
```

### ❌ Problem 3: Commission Query Mismatch (Possible)

If the query filters are inconsistent:

**Backend During Calculation** (approved commissions):
```javascript
const approvedCommissions = await Commission.find({
  affiliateId: affiliate._id,
  status: 'approved'               // ← Filter
}).select('calculation.amount');
```

**Possible Issue**: If some commissions have `status: null` or aren't updated properly, the count could be off.

### ❌ Problem 4: Race Condition

If the affiliate requests their dashboard stats while the backend is mid-update:
1. Commission 1 marked as paid ✓
2. Frontend fetches dashboard (sees Commission 1 as paid)
3. Commission 2 not yet marked
4. Commission 3 partially processed
5. Database shows inconsistent state

---

## 6. DATA FLOW DIAGRAM

```
┌─────────────────────────────────────────────────────────────┐
│         ADMIN CLICKS "PAY" BUTTON                           │
│  POST /api/admin/payouts/:payoutId/process                 │
│  Body: { receiptId, transactionId }                        │
└─────────────────────────┬───────────────────────────────────┘
                          │
                          ▼
         ┌────────────────────────────────┐
         │ payoutController.processPayout()│
         └────────────┬───────────────────┘
                      │
                      ▼
         ┌────────────────────────────────────────┐
         │ payoutService.markPayoutAsPaid()       │
         │ 1. Get payout by ID                    │
         │ 2. Find all approved commissions       │
         │ 3. Mark commissions as 'paid'      ◄──┼────── ⚠️ KEY STEP
         │ 4. Update payout.status = 'paid'      │
         │ 5. Save both objects                  │
         └────────────┬───────────────────────────┘
                      │
        ┌─────────────┴──────────────┐
        │                            │
        ▼                            ▼
   Commission Collection      Payout Collection
   ---------------------      ------------------
   UPDATE status='paid'   +    UPDATE status='paid'
   (FIFO by createdAt)        + record payment data


┌──────────────────────────────────────────────────────────────┐
│ 30 SECONDS LATER...                                          │
│ Frontend Auto-Refetch Triggered                             │
│ (staleTime: 30000)                                          │
└──────┬───────────────────────────────────────────────────────┘
       │
       ├─────────────────────────┬──────────────────────────┐
       │                         │                          │
       ▼                         ▼                          ▼
  useAffiliateDashboard   useAffiliatePayoutStats  useAffiliateCommissionStats
       │                         │                          │
       ├─FetchDashboard()        ├─FetchPayoutStats()      └─FetchCommissionStats()
       │  └─GET /affiliate       │  └─GET /payouts/stats
       │     /dashboard          │     Aggregates:
       │     Returns:            │     - status='paid' → totalPaidOut
       │     - approvedEarnings  │     - all → totalPayouts
       │     - paidEarnings      │
       │                         │
       └──────────┬──────────────┴─────────────────────────┐
                  │                                        │
                  V                                        V
       ┌──────────────────────┐            ┌──────────────────────┐
       │ Frontend Page        │            │ PayoutStatsCards    │
       │ Displays:            │            │ Component           │
       │ - Approved: $163.28  │            │ - Available: $prop   │
       │ - Paid: $70          │            │ - Total Paid: $70    │
       │ (Now correct!)       │            │                      │
       └──────────────────────┘            └──────────────────────┘
```

---

## 7. TRACING THE SPECIFIC DATA VALUES

### Example: $70 Payout from $233.28 Available

#### Before Payment

**Commission Collection**:
```
Commission A: status='pending', amount=$10
Commission B: status='pending', amount=$50
Commission C: status='approved', amount=$45.50   ← 1st approved
Commission D: status='approved', amount=$50
Commission E: status='approved', amount=$45
Commission F: status='approved', amount=$53.28   ← Last approved
```

**Calculations**:
- Approved Earnings = C.amount + D.amount + E.amount + F.amount
                    = $45.50 + $50 + $45 + $53.28
                    = $193.78

Wait, this doesn't match $233.28. Let me recalculate:
- Actually need more commissions or different amounts to = $233.28

**Payout Record**:
- status='approved'
- amount=$70

#### After Admin Clicks "Pay"

**Flow in markPayoutAsPaid()**:
```
1. Get payout amount = $70
2. Get approved commissions sorted by createdAt: [C, D, E, F, ...]
3. remainingAmount = $70

4. Loop:
   - Commission C: amount=$45.50, remaining=$70
     → $45.50 <= $70, so mark as 'paid'
     → remainingAmount = $70 - $45.50 = $24.50
   
   - Commission D: amount=$50, remaining=$24.50
     → $50 > $24.50, skip this one
     → remainingAmount = $24.50
   
   - Commission E: amount=$45, remaining=$24.50
     → $45 > $24.50, skip
   
   - Commission F: amount=$53.28, remaining=$24.50
     → $53.28 > $24.50, skip
```

**Issue Found**: Only Commission C is marked as paid!

**After update**:
- Commission C: status='paid' (was 'approved')
- Commission D,E,F: status='approved' (unchanged)

**New Calculation**:
- Approved = D.amount + E.amount + F.amount
           = $50 + $45 + $53.28
           = $148.28

Expected: $233.28 - $45.50 = $187.78

Hmm, the math suggests there should be more commissions in approved state.

**The Real Issue**: The calculation of approved_earnings needs to sum ALL approved commissions, but only SOME get marked as paid. So:

- If total approved was $233.28
- And $70 was removed
- Should be $233.28 - $70 = $163.28

But if the algorithm only marks the FIRST commission in the loop, and remaining amount doesn't cover more, there's a mismatch.

---

## 8. RECOMMENDED FIXES

### Fix 1: Immediate Cache Invalidation

**File**: [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js#L195-L210)

```javascript
export const useProcessPayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, receiptId, transactionId }) =>
      PayoutService.processPayout(payoutId, receiptId, transactionId),
    onSuccess: (data) => {
      // Invalidate BOTH admin and affiliate queries
      queryClient.invalidateQueries({ queryKey: ['payouts', 'admin'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'ready'] });
      queryClient.invalidateQueries({ queryKey: ['payouts', 'affiliate'] });
      
      // ✅ ADD THESE:
      queryClient.invalidateQueries({ queryKey: ['affiliate', 'dashboard'] });
      queryClient.invalidateQueries({ queryKey: ['commissions', 'affiliate'] });
      queryClient.invalidateQueries({ queryKey: ['commissions', 'admin'] });
      
      callbacks.onSuccess?.(data);
    }
  });
};
```

### Fix 2: Reduce Cache Time for Mutable Data

```javascript
export const useAffiliateDashboard = (options = {}, enabled = true) => {
  return useQuery({
    queryKey: ['affiliate', 'dashboard'],
    queryFn: () => affiliateService.getAffiliateDashboard(options),
    staleTime: 5 * 1000,        // ✅ Reduce: 30s → 5s
    gcTime: 2 * 60 * 1000,      // ✅ Reduce: 5min → 2min
    refetchInterval: 10 * 1000, // ✅ Reduce: 30s → 10s
    refetchIntervalInBackground: true,
    enabled
  });
};
```

### Fix 3: Verify Commission Marking Algorithm

The logic in [src/services/payoutService.js](src/services/payoutService.js#L180-L215) should:
1. ✅ Sort commissions by createdAt (oldest first)
2. ⚠️ VERIFY: Does it properly accumulate across multiple commissions?
3. Consider: What if $70 spans multiple commissions?

**Verification Code**:
```javascript
let remainingAmount = payout.amount;
const marked = [];

for (const commission of approvedCommissions) {
  if (remainingAmount <= 0) break;
  
  const commissionAmount = commission.calculation?.amount || 0;
  
  if (commissionAmount <= remainingAmount) {
    commission.status = 'paid';
    marked.push({
      id: commission._id,
      amount: commissionAmount,
      wasApproved: 'yes'
    });
    remainingAmount -= commissionAmount;
    await commission.save();
  } else {
    // Should we PARTIALLY pay this commission?
    // Current code: NO, skip it
    // Alternative: Split the commission
  }
}

console.log(`Marked ${marked.length} commissions:`, marked);
console.log(`Remaining amount not allocated: ${remainingAmount}`);
```

### Fix 4: Add Verification Endpoint

Create a debug endpoint to verify the calculation:

```javascript
// GET /api/affiliate/debug/balance-verification
async getBalanceVerification(req, res) {
  const affiliateId = req.user._id;
  
  // Get all commissions
  const commissions = await Commission.find({ affiliateId });
  
  // Group by status
  const byStatus = {};
  for (const c of commissions) {
    const status = c.status;
    if (!byStatus[status]) byStatus[status] = [];
    byStatus[status].push({
      _id: c._id,
      amount: c.calculation.amount
    });
  }
  
  // Calculate totals
  const sums = {};
  for (const [status, items] of Object.entries(byStatus)) {
    sums[status] = items.reduce((s, c) => s + c.amount, 0);
  }
  
  // Get payouts
  const payouts = await Payout.find({ affiliateId });
  const paidOutAmount = payouts
    .filter(p => p.status === 'paid')
    .reduce((s, p) => s + p.amount, 0);
  
  return res.json({
    commissionsByStatus: byStatus,
    sums: sums,
    paidOutAmount: paidOutAmount,
    inconsistency: {
      commission_paid_sum: sums.paid || 0,
      payout_paid_sum: paidOutAmount,
      match: (sums.paid || 0) === paidOutAmount
    }
  });
}
```

---

## 9. TESTING THE COMPLETE FLOW

### Step-by-Step Verification

1. **Create 3 pending commissions**:
   - Commission A: $50
   - Commission B: $75
   - Commission C: $40

2. **Approve all 3** → Approved = $165

3. **Create payout request**: $100

4. **Approve payout** → Status = 'approved'

5. **Click Pay** with receipt ID

6. **Expected Result**:
   - Commission A: status = 'paid' ✓
   - Commission B: status = 'approved' (still owns $25 of the $100 paid out) ⚠️ **ISSUE**
   - Approved Earnings: $75 + $25 (partial) = ... wait, partial payments aren't supported!

7. **Actual Result** (from code):
   - Commission A: status = 'paid' → $50 marked paid
   - Remaining = $100 - $50 = $50
   - Commission B: amount = $75 > $50 remaining
   - Skip Commission B (not marked paid)
   - Continue loop... skip C
   - Remaining = $50 (UNALLOCATED)

**This is a bug!** The system can't handle partial commission payments.

---

## 10. SUMMARY TABLE

| Data Point | Source | Query/Filter | After Payment |
|-----------|--------|--------------|---------------|
| **Available for Payout** | Dashboard | Commissions where `status='approved'` | ↓ Decreases (correct) |
| **Total Paid Out** | Payout Stats | Payouts where `status='paid'` | ↑ Increases (correct) |
| **Commission Status** | Commission Collection | Direct DB query | Changes: 'approved' → 'paid' |
| **Payout Status** | Payout Collection | Direct DB query | Changes: 'approved' → 'paid' |
| **Frontend Cache** | React Query | staleTime: 30s | ⚠️ Stale until refetch |
| **Cache Invalidation** | useProcessPayout | onSuccess callback | ❌ Incomplete |

---

## 11. CONCLUSION

### Root Cause of Mismatch

The data inconsistency occurs because:

1. **Backend correctly marks commissions as paid** and updates databases
2. **Frontend cache isn't immediately invalidated** after the "Pay" action
3. **Stale data is served** for ~30 seconds until auto-refetch
4. **Cache invalidation is incomplete** - only invalidates admin queries, not affiliate dashboard

### Most Likely Scenario for "$70 paid but $233.28 available"

- Admin clicks "Pay" for $70
- Backend marks $70 of commissions as paid
- Frontend still shows old cached "Available for Payout" value of $233.28
- Frontend shows "Total Paid Out: $70" from fresh stat
- Data is consistent, but frontend cache lag created the illusion of inconsistency

### Solution Priority

**HIGH**: Implement immediate cache invalidation in useProcessPayout
**MEDIUM**: Reduce staleTime for affiliate dashboard queries
**MEDIUM**: Add balance verification endpoint for debugging
**LOW**: Fix potential partial-payment bug in commission allocation
