# Affiliate Payout Request Page - Complete Exploration

## Overview
The payout request system allows affiliates to submit withdrawal requests for their earned commissions. The available balance is calculated from accumulated earnings and is fetched from the affiliate profile data.

---

## 1. File Locations & Structure

### Frontend Page
- **File**: [FRONTEND_AUTH_IMPLEMENTATION/src/app/(affiliate)/affiliate/payouts/request/page.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/app/(affiliate)/affiliate/payouts/request/page.jsx)
- **Route**: `/affiliate/payouts/request`
- **Type**: Next.js Client Component (server-side rendering)
- **Authentication**: Required (redirects to `/login` if not authenticated)

### Form Component
- **File**: [FRONTEND_AUTH_IMPLEMENTATION/src/components/payouts/PayoutRequestForm.jsx](FRONTEND_AUTH_IMPLEMENTATION/src/components/payouts/PayoutRequestForm.jsx)
- **Purpose**: Reusable form component for payout requests
- **Features**: Amount validation, beneficiary info collection, payment method selection

### API Hooks
- **File**: [FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js)
- **Key Hooks**:
  - `useRequestPayout()` - Mutation hook for submitting payout requests
  - `useAffiliatePayouts()` - Query hook for fetching payout history
  - `useAffiliatePayoutStats()` - Query hook for payout statistics

### API Service
- **File**: [FRONTEND_AUTH_IMPLEMENTATION/src/api/services/payoutService.js](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/payoutService.js)
- **Purpose**: Axios API client for all payout endpoints

### Backend Routes
- **File**: [src/routes/payoutRoutes.js](src/routes/payoutRoutes.js)
- **Main Endpoint**: `POST /api/payouts/request`

### Backend Controller
- **File**: [src/controllers/payoutController.js](src/controllers/payoutController.js)
- **Handler**: `requestPayout()` method

### Backend Service
- **File**: [src/services/payoutService.js](src/services/payoutService.js)
- **Core Logic**: `requestPayout()` method with 7-step validation

---

## 2. Available Balance - Where It Comes From

### Balance Calculation
The available balance is calculated from the affiliate's earnings:

```
availableBalance = pendingEarnings + approvedEarnings + paidEarnings
```

- **pendingEarnings**: Commissions awaiting approval
- **approvedEarnings**: Commissions approved but not yet paid
- **paidEarnings**: Already paid commissions (available for re-withdrawal if in pending state)

### Data Flow to Frontend

```
1. GET /api/affiliate/dashboard
   ↓
   affiliateService.getAffiliateProfile(userId)
   ↓
   Calculates earnings from Commission records
   ↓
   Returns: { earnings: { totalEarnings, pendingEarnings, approvedEarnings, paidEarnings } }
   ↓
2. Frontend receives data in AuthContext
   ↓
   user.affiliateDetails.availableBalance
   ↓
3. Page Component sets state
   useEffect(() => {
     setAvailableBalance(user?.affiliateDetails?.availableBalance);
   })
```

### Where Balance is Fetched in Page Component

```jsx
// File: /affiliate/payouts/request/page.jsx
// Lines: 66-70

useEffect(() => {
  if (user?.affiliateDetails?.availableBalance) {
    setAvailableBalance(user.affiliateDetails.availableBalance);
  }
}, [user]);
```

---

## 3. Data Fetching Hooks & React Query Setup

### Hook: `useRequestPayout`

**Location**: [src/api/hooks/usePayouts.js (lines 98-116)](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/usePayouts.js#L98-L116)

**Purpose**: Mutation hook for submitting payout requests

**Usage**:
```javascript
const requestMutation = useRequestPayout({
  onSuccess: (data) => {
    // Handle success - navigate to payouts list
    router.push('/affiliate/payouts');
  },
  onError: (error) => {
    // Handle error
    console.error('Failed to request payout:', error);
  }
});

// Submit form data
requestMutation.mutate(formData);
```

**Invalidation Strategy**:
- Invalidates `payoutKeys.affiliate()` (all affiliate payout queries)
- Invalidates `payoutKeys.affiliateStats()` (payout statistics)
- Re-fetches latest balance and payout history

**Return Values**:
- `mutate(payoutData)` - Function to submit the request
- `isPending` - Boolean for loading state
- `error` - Error object if failed
- `isSuccess` - Boolean if successful

### Hook: `useAffiliatePayouts`

**Purpose**: Fetch payout history with filtering

**Usage**:
```javascript
const { data, isLoading, error } = useAffiliatePayouts({
  page: 1,
  limit: 20,
  status: 'pending'
});
```

**Cache Configuration**:
- staleTime: 5 minutes
- cacheTime: 10 minutes
- Refetch on window focus

---

## 4. API Routes & Endpoints

### Primary Endpoint: POST /api/payouts/request

**Location**: [src/routes/payoutRoutes.js (lines 31-47)](src/routes/payoutRoutes.js#L31-L47)

**Request Body**:
```json
{
  "amount": 500.00,
  "method": "bank_transfer",
  "beneficiary": {
    "accountHolderName": "John Doe",
    "accountNumber": "123456789",
    "routingNumber": "987654321",
    "bankName": "Chase Bank"
  },
  "notes": "Please process as soon as possible"
}
```

**Response** (201 Created):
```json
{
  "success": true,
  "message": "Payout request submitted successfully",
  "payout": {
    "_id": "507f1f77bcf86cd799439011",
    "amount": 500.00,
    "method": "bank_transfer",
    "status": "pending",
    "requestedAt": "2024-03-21T10:30:00Z",
    "createdAt": "2024-03-21T10:30:00Z"
  }
}
```

### Related Endpoints

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/payouts` | GET | Get payout history for affiliate |
| `/api/payouts/stats` | GET | Get payout statistics |
| `/api/payouts/:payoutId` | GET | Get specific payout details |
| `/api/admin/payouts/:payoutId/approve` | POST | Admin approves payout |
| `/api/admin/payouts/:payoutId/process` | POST | Admin processes payout |

---

## 5. Payout Request Form Details

### Form Component Hierarchy

```
AffiliatePayoutRequestPage (page.jsx)
  └── PayoutRequestForm (PayoutRequestForm.jsx)
      ├── AvailableBalance (display component)
      ├── FormGroup (amount input)
      ├── FormGroup (payment method select)
      ├── FormGroup (beneficiary details)
      │   ├── accountHolderName
      │   ├── accountNumber
      │   ├── routingNumber (conditional)
      │   └── bankName
      ├── FormGroup (optional notes)
      └── ButtonGroup (submit/cancel)
```

### Form Data Structure

```javascript
{
  amount: '',                    // Required, positive, ≤ availableBalance
  method: 'bank_transfer',       // Required: bank_transfer|paypal|stripe|cryptocurrency
  beneficiary: {
    accountHolderName: '',       // Required
    accountNumber: '',           // Required
    routingNumber: '',           // Required for bank_transfer
    bankName: ''                 // Required
  },
  notes: ''                      // Optional, max 500 chars
}
```

### Form Validation

**File**: [PayoutRequestForm.jsx (lines 217-241)](FRONTEND_AUTH_IMPLEMENTATION/src/components/payouts/PayoutRequestForm.jsx#L217-L241)

Validates:
1. ✓ Amount > 0
2. ✓ Amount ≤ availableBalance
3. ✓ Payment method is selected
4. ✓ All beneficiary fields required
5. ✓ Routing number required for bank transfers
6. ✓ Notes max 500 characters

**Error Display**: Inline error messages below each field

### Form Submission Flow

```javascript
// Page Component (request/page.jsx)
const handleSubmit = (formData) => {
  requestMutation.mutate(formData);  // Pass data to mutation
};

// Mutation Hook (usePayouts.js)
mutationFn: (payoutData) => PayoutService.requestPayout(payoutData)

// Service (payoutService.js)
export const requestPayout = async (payoutData) => {
  const response = await apiClient.post('/payouts/request', {
    amount: payoutData.amount,
    method: payoutData.method,
    beneficiary: payoutData.beneficiary,
    notes: payoutData.notes || ''
  });
  return response.data.data;
};
```

---

## 6. Backend Payout Request Processing

### Request Handler Chain

```
POST /api/payouts/request
  ↓
authentcateToken middleware (JWT validation)
  ↓
validatePayoutRequest middleware (schema validation)
  ↓
payoutController.requestPayout()
  ↓
payoutService.requestPayout()
```

### Backend Validation (7 Steps)

**File**: [src/services/payoutService.js (lines 37-133)](src/services/payoutService.js#L37-L133)

1. **Affiliate Verification**
   - Check affiliate exists
   - Verify affiliate is active

2. **Amount Validation**
   - Must be positive number
   - Minimum: $10.00
   - Maximum: ≤ availableBalance

3. **Balance Check**
   - Current balance ≥ requested amount
   - Uses atomic transaction for safety

4. **Method Validation**
   - Valid method: bank_transfer, paypal, stripe, cryptocurrency

5. **Beneficiary Validation**
   - Method-specific field validation
   - Encryption of sensitive data

6. **Payout Request Creation**
   - Creates Payout record with status: 'pending'
   - Stores encrypted beneficiary details
   - Records submission timestamp

7. **Status History**
   - Logs "Payout request submitted by affiliate"
   - Tracks all status changes

### Payout Model

**File**: [src/models/Payout.js](src/models/Payout.js)

Key Fields:
```javascript
{
  affiliateId: ObjectId,        // Reference to User
  amount: Number,               // Amount in dollars
  method: String,               // bank_transfer, paypal, stripe, cryptocurrency
  status: String,               // pending → approved → processing → completed
  request: {
    submittedAt: Date,          // When affiliate submitted
    notes: String,              // Affiliate notes
    beneficiary: {              // Encrypted payment details
      accountHolderName,
      accountNumber,
      routingNumber,
      bankName
    }
  },
  statusHistory: [              // Audit trail of all status changes
    {
      status: String,
      changedAt: Date,
      reason: String
    }
  ]
}
```

---

## 7. Component Props & Interfaces

### PayoutRequestForm Component

**Props**:
```typescript
interface PayoutRequestFormProps {
  availableBalance: number;      // Current available balance in dollars
  onSubmit: (formData) => void;  // Callback when form is submitted
  isLoading: boolean;            // Whether request is in progress
  onCancel?: () => void;         // Callback for cancel button
}
```

**Styled Components**:
- `FormContainer` - Main form wrapper
- `FormTitle` - Form heading
- `AvailableBalance` - Balance display box
- `FormGroup` - Reusable field wrapper
- `Label` - Field label with required indicator
- `Input` - Text/number input field
- `Select` - Dropdown for payment method
- `Textarea` - Notes field
- `ButtonGroup` - Submit/Cancel buttons
- `ErrorMessage` - Inline validation errors
- `HelperText` - Additional field guidance

---

## 8. Error Handling

### Frontend Error Handling

**File**: [request/page.jsx (lines 80-85)](FRONTEND_AUTH_IMPLEMENTATION/src/app/(affiliate)/affiliate/payouts/request/page.jsx#L80-L85)

```javascript
onError: (error) => {
  console.error('Failed to request payout:', error);
  // Error message displayed in form
}
```

### Form Validation Errors

- Amount > balance
- Missing required fields
- Invalid payment method
- Invalid amount format

### Backend Validation Errors

- Affiliate not found (404)
- Affiliate inactive (400)
- Insufficient balance (400)
- Invalid beneficiary details (400)

### Error Responses

**400 Bad Request**:
```json
{
  "success": false,
  "message": "Amount exceeds available balance",
  "details": "Requested: $X, Available: $Y"
}
```

**404 Not Found**:
```json
{
  "success": false,
  "message": "Affiliate not found or not active"
}
```

---

## 9. Session & Caching Recovery

### Balance Recovery After Payout Request

1. **Query Invalidation**
   ```javascript
   queryClient.invalidateQueries({ queryKey: payoutKeys.affiliate() });
   queryClient.invalidateQueries({ queryKey: payoutKeys.affiliateStats() });
   ```

2. **Automatic Re-fetch**
   - React Query automatically refetches invalidated queries
   - User sees updated balance after success

3. **Cache Invalidation Strategy**
   - Affiliate payouts list: invalidated
   - Payout statistics: invalidated
   - User profile: NOT invalidated (balance not deducted on request)

**Note**: Balance is only deducted when admin **processes** the payout, not when affiliate requests it.

---

## 10. How the Form Data Flows Through the System

```
User enters form data
  ↓
PayoutRequestForm validates locally
  ↓
onSubmit -> requestMutation.mutate(formData)
  ↓
usePayouts hook calls PayoutService.requestPayout()
  ↓
axios POST to /api/payouts/request (with JWT token)
  ↓
Backend payoutController.requestPayout()
  ↓
payoutService.requestPayout() (7-step validation)
  ↓
Payout record created (status: 'pending')
  ↓
Response: { success, payout }
  ↓
onSuccess callback triggered
  ↓
Queries invalidated (re-fetch balance)
  ↓
Success message displayed
  ↓
Navigate to /affiliate/payouts (after 2 seconds)
```

---

## 11. Key Technical Details

### Payment Methods Supported
- `bank_transfer` - Bank account details required
- `paypal` - PayPal email
- `stripe` - Stripe Connect account
- `cryptocurrency` - Wallet address

### Beneficiary Encryption
Sensitive beneficiary details are encrypted before storage:
```javascript
beneficiary: this._encryptBeneficiary(beneficiary)
```

### Minimum Payout Threshold
Default: $10.00 per request
Can be configured per affiliate

### Status Workflow
```
pending (affiliate submitted)
  ↓
approved (admin approved)
  ↓
processing (payment provider submission)
  ↓
completed (payment received)
  └─ OR cancelled/failed (no retry available)
```

### Balance is NOT Deducted on Request
- Balance deduction happens when admin **processes** the payout
- Allows admin to reject without affecting balance
- Only locked/reserved if explicitly reserved by admin

---

## 12. Related Pages & Navigation

- **Payout List**: `/affiliate/payouts` - View all payouts with status filters
- **Payout Detail**: `/affiliate/payouts/[payoutId]` - Full details including status timeline
- **Settings**: `/affiliate/settings` - Configure payout method
- **Dashboard**: `/affiliate/dashboard` - View available balance at a glance

---

## Summary Table

| Aspect | Details |
|--------|---------|
| **Page Route** | `/affiliate/payouts/request` |
| **Balance Source** | `user.affiliateDetails.availableBalance` |
| **Balance Calculation** | pendingEarnings + approvedEarnings + paidEarnings |
| **Main Hook** | `useRequestPayout()` from `usePayouts.js` |
| **API Endpoint** | `POST /api/payouts/request` |
| **Form Component** | `PayoutRequestForm.jsx` |
| **Backend Service** | `payoutService.requestPayout()` |
| **Validation Steps** | 7 (affiliate, amount, balance, method, beneficiary, creation, history) |
| **Request Body** | amount, method, beneficiary, notes |
| **Response Status** | 201 Created on success |
| **Cache Strategy** | Invalidate affiliate queries, re-fetch on success |
| **User Feedback** | Success message, redirect to payouts list |
