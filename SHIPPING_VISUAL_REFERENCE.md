# 🔴 Shipping Data Flow - Visual Reference

## System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      CHECKOUT SHIPPING PROCESS                      │
└─────────────────────────────────────────────────────────────────────┘

┌──────────────┐
│ ShippingForm │
│ Component    │
└──────┬───────┘
       │ formData submitted
       ↓
┌────────────────────────────┐
│ useShipping Hook           │
│ .handleSubmit(             │
│   onSuccess callback       │
│ )                          │
└──────┬──────────────────────┘
       │ 
       ├─→ Validate with Zod schema
       │
       ├─→ setShippingAddress(validated)  
       │   ↓
       │   ┌──────────────────────┐
       │   │ Zustand Store        │
       │   │ shippingAddress:     │
       │   │ { firstName, ... }   │
       │   └──────────────────────┘
       │
       └─→ Call onSuccess callback
           ↓
           ┌──────────────────────────────────────┐
           │ CheckoutShippingPage                 │
           │ .handleShippingSubmit()              │
           │ calls                                │
           │ checkoutService.createCheckoutSession│
           │ (options)                            │
           └─────────┬────────────────────────────┘
                     │
                     ├─→ Store intercepts: 
                     │   adds shippingAddress to options
                     │
                     ├─→ checkoutService receives:
                     │   { 
                     │     affiliateId: "...",
                     │     shippingAddress: { ... }  ✅
                     │   }
                     │
                     ├─→ Service Function:
                     │   const { affiliateId, metadata } = options
                     │                        ❌ shippingAddress lost!
                     │
                     ├─→ API Request:
                     │   POST /checkout/create-session
                     │   { metadata: null }
                     │              ❌ shipping missing!
                     │
                     └─→ Backend API ❌
                         (no shipping address)
```

---

## Data State at Each Step

### Step 1: ShippingForm Input
```javascript
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+1-555-0123",
  street: "123 Main Street",
  city: "Springfield",
  state: "IL",
  postalCode: "62701",
  country: "US"
}
✅ Complete and valid
```

### Step 2: After Hook Validation
```javascript
// Same object after zod validation
{
  firstName: "John",
  lastName: "Doe",
  email: "john@example.com",
  phone: "+1-555-0123",
  street: "123 Main Street",
  city: "Springfield",
  state: "IL",
  postalCode: "62701",
  country: "US"
}
✅ Saved to Zustand store
```

### Step 3: Store → Service Call
```javascript
// What store passes to service
{
  affiliateId: "aff_123456789",
  shippingAddress: {                    ✅ Present
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    street: "123 Main Street",
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
    country: "US"
  }
}
```

### Step 4: Service Receives ✅
```javascript
// checkoutService.createCheckoutSession(options) receives:
options = {
  affiliateId: "aff_123456789",
  shippingAddress: {                    ✅ In options
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1-555-0123",
    street: "123 Main Street",
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
    country: "US"
  }
}
```

### Step 5: Service Destructuring ❌
```javascript
// BROKEN CODE
const { affiliateId, metadata } = options;

// Result:
affiliateId = "aff_123456789"  ✅
metadata = undefined           ✅ (not passed, so undefined)
shippingAddress = ?            ❌ NOT EXTRACTED - LEFT IN options!

// The shippingAddress is still in options, but it's not in a variable
```

### Step 6: Request Body Built ❌
```javascript
// BROKEN CODE
const body = {
  ...(metadata && { metadata }),
};

// Result:
body = {}  ❌ EMPTY!
// The shippingAddress was never added to body

// Request to API will be:
// POST /checkout/create-session
// {}
```

### Step 7: Backend Receives ❌
```javascript
// Backend gets:
{
  // Empty or minimal data
  // shippingAddress is completely missing
}
❌ Cannot process order without shipping address
```

---

## The 2-Line Fix

### File: src/api/services/checkoutService.js

**BEFORE (Lines 28-40):**
```javascript
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata } = options;  // ❌ Problem line
    
    console.log('🛒 Creating checkout session...');
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    const body = {
      ...(metadata && { metadata }),  // ❌ Problem line
    };
```

**AFTER (Lines 28-40):**
```javascript
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata, shippingAddress } = options;  // ✅ Add shippingAddress
    
    console.log('🛒 Creating checkout session...');
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    const body = {
      ...(metadata && { metadata }),
      ...(shippingAddress && { shippingAddress }),  // ✅ Add this line
    };
```

---

## Verification Checklist

After applying the fix:

- [ ] Extract `shippingAddress` from options destructuring
- [ ] Add `shippingAddress` conditional to request body
- [ ] Test shipping form submission
- [ ] Verify DevTools Network tab shows shipping in request body
- [ ] Check backend logs show shipping address received
- [ ] Confirm Stripe session created with shipping info

---

## Files Involved

| File | Role | Status |
|------|------|--------|
| `src/components/checkout/ShippingForm.jsx` | Collects form input | ✅ Working |
| `src/hooks/useShipping.js` | Validates & saves to store | ✅ Working |
| `src/stores/checkoutStore.js` | Manages state & adds to options | ✅ Working |
| `src/app/(app)/checkout/shipping/page.jsx` | Page handler | ✅ Working |
| `src/api/services/checkoutService.js` | **API service - BROKEN** | ❌ **NEEDS FIX** |
| Backend API | Receives request | ❌ Gets empty data |

---

## Message Flow Sequence

```
1. User fills form (firstName, lastName, email, phone, street, city, state, postalCode, country)
   ↓
2. Form submitted to ShippingForm component
   ↓
3. handleFormSubmit calls useShipping().handleSubmit(onSuccess)
   ↓
4. useShipping validates with shippingAddressSchema
   ↓
5. setShippingAddress(validated) saves to Zustand
   ↓
6. onSuccess callback fires → CheckoutShippingPage.handleShippingSubmit()
   ↓
7. Page calls checkoutService.createCheckoutSession({ affiliateId })
   ↓
8. Store intercepts and adds shippingAddress to options
   ✅ Options now has: { affiliateId, shippingAddress }
   ↓
9. Service receives options with shippingAddress
   ✅ options.shippingAddress exists
   ↓
10. Service does: const { affiliateId, metadata } = options
    ❌ shippingAddress NOT extracted
    ❌ Left in the options object unused
   ↓
11. Service builds body: { metadata: ... }
    ❌ shippingAddress NOT included in body
   ↓
12. Service POSTs to API with incomplete body
    ❌ shippingAddress never sent to backend
   ↓
13. Backend receives request without shipping
    ❌ Cannot complete order setup
```

---

## Code Quality Issue

This is not a **logic error** but a **parameter handling error**:
- The infrastructure is correct (store passes it)
- The validation is correct (Zod validates it)
- The storage is correct (Zustand stores it)
- **The service function simply fails to extract and forward it**

It's as if you collected a package, put it on the shipping trucks' manifest, the truck arrived at the warehouse, but the truck driver forgot to unload it from the truck bed.

---

## Why This Happened

Most likely scenarios:

1. **Copy-paste error** - Function template copied without full parameter handling
2. **Incomplete refactoring** - Added store integration but forgot to update service
3. **Testing gap** - Unit tests may have used mocked data
4. **Parameter evolution** - Code evolved over time, parameters were added to store but not to service

---

## Prevention

For future shipping address handling:

1. ✅ Add parameter to destructuring
2. ✅ Add parameter to request body
3. ✅ Test with DevTools Network inspector
4. ✅ Add audit log: `console.log('Shipping in request:', body.shippingAddress)`
5. ✅ Backend validation: Require shippingAddress in checkout endpoint
