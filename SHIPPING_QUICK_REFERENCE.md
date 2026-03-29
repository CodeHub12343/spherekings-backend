# SHIPPING DATA FLOW QUICK REFERENCE

## 🎯 Problem in One Sentence
The `checkoutService.createCheckoutSession()` function receives the shipping address in its `options` parameter but never extracts or forwards it to the backend API.

---

## 📍 Exact Location of Bug

**File:** `src/api/services/checkoutService.js`
**Lines:** 27-40

---

## 🔴 Current Code (BROKEN)

```javascript
// Line 27: Function definition
export async function createCheckoutSession(options = {}) {
  try {
    // Line 29: PROBLEM - shippingAddress not destructured
    const { affiliateId, metadata } = options;
    
    // Line 31
    console.log('🛒 Creating checkout session...');
    
    // Line 33-35
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    // Line 37-40: PROBLEM - shippingAddress not in body
    const body = {
      ...(metadata && { metadata }),
    };
    
    // Result: API request sent WITHOUT shipping address ❌
    const response = await client.post(
      '/checkout/create-session',
      Object.keys(body).length > 0 ? body : undefined,
      config
    );
```

---

## ✅ Fixed Code (CORRECT)

```javascript
// Line 27: Function definition
export async function createCheckoutSession(options = {}) {
  try {
    // Line 29: FIX - Add shippingAddress to destructuring
    const { affiliateId, metadata, shippingAddress } = options;
    
    // Line 31
    console.log('🛒 Creating checkout session...');
    
    // Line 33-35
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    // Line 37-41: FIX - Add shippingAddress to body
    const body = {
      ...(metadata && { metadata }),
      ...(shippingAddress && { shippingAddress }),
    };
    
    // Result: API request sent WITH shipping address ✅
    const response = await client.post(
      '/checkout/create-session',
      Object.keys(body).length > 0 ? body : undefined,
      config
    );
```

---

## Changes Required

### Change 1: Line 29
**OLD:**
```javascript
const { affiliateId, metadata } = options;
```

**NEW:**
```javascript
const { affiliateId, metadata, shippingAddress } = options;
```

---

### Change 2: Lines 37-40
**OLD:**
```javascript
const body = {
  ...(metadata && { metadata }),
};
```

**NEW:**
```javascript
const body = {
  ...(metadata && { metadata }),
  ...(shippingAddress && { shippingAddress }),
};
```

---

## What Gets Sent to Backend

### BEFORE FIX (❌)
```
POST /api/v1/checkout/create-session
Query: ?affiliateId=aff_123456
Body: {}
```

### AFTER FIX (✅)
```
POST /api/v1/checkout/create-session
Query: ?affiliateId=aff_123456
Body: {
  "shippingAddress": {
    "firstName": "John",
    "lastName": "Doe",
    "email": "john@example.com",
    "phone": "+1-555-0123",
    "street": "123 Main Street",
    "city": "Springfield",
    "state": "IL",
    "postalCode": "62701",
    "country": "US"
  }
}
```

---

## Complete Fixed Function

```javascript
/**
 * Create a Stripe checkout session from user's cart
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.affiliateId - Optional affiliate ID for referral tracking
 * @param {Object} options.metadata - Optional additional metadata
 * @param {Object} options.shippingAddress - Shipping address for order
 * @returns {Promise<Object>} { sessionId, url }
 */
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata, shippingAddress } = options;
    
    console.log('🛒 Creating checkout session...');
    console.log('📦 Shipping address included:', !!shippingAddress);
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    const body = {
      ...(metadata && { metadata }),
      ...(shippingAddress && { shippingAddress }),
    };
    
    const response = await client.post(
      '/checkout/create-session',
      Object.keys(body).length > 0 ? body : undefined,
      config
    );
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to create checkout session');
    }
    
    console.log('✅ Checkout session created:', {
      sessionId: response.data.data.sessionId,
      url: response.data.data.url,
    });
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error creating checkout session:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
    
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.message ||
      'Failed to create checkout session. Please try again.';
    
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.details = error.response?.data?.errors;
    
    throw customError;
  }
}
```

---

## Data Flow After Fix

```
1. User submits shipping form ✅
   ↓
2. Hook validates and saves to Zustand ✅
   ↓
3. Page calls service with shipping address ✅
   ↓
4. Store adds shipping to options ✅
   ↓
5. Service receives: { affiliateId, shippingAddress } ✅
   ↓
6. Service extracts: affiliateId, shippingAddress ✅ (AFTER FIX)
   ↓
7. Service includes in body: { shippingAddress } ✅ (AFTER FIX)
   ↓
8. API receives shipping address ✅ (AFTER FIX)
   ↓
9. Backend processes order with shipping ✅ (AFTER FIX)
```

---

## Testing the Fix

### Before applying fix:
1. Open DevTools → Network tab
2. Fill and submit shipping form
3. Check the POST request to `/api/v1/checkout/create-session`
4. **Request body is empty: `{}` ❌**

### After applying fix:
1. Open DevTools → Network tab
2. Fill and submit shipping form
3. Check the POST request to `/api/v1/checkout/create-session`
4. **Request body contains shipping: `{ "shippingAddress": {...} }` ✅**

---

## Impact of This Bug

- ❌ Shipping address never reaches backend
- ❌ Stripe session created without shipping data
- ❌ Order cannot be properly fulfilled
- ❌ Customer may not be able to complete checkout
- ❌ Backend validation errors about missing shipping address

---

## Additional Notes

- This is a **parameter handling bug**, not a logic error
- The infrastructure is correct (store passes it correctly)
- Only the service function fails to extract and forward it
- **2 lines of code need to change** to fix it completely
- No schema changes needed
- No API contract changes needed
- Backend likely already expects this field

---

## Files Mentioned

- ✅ `src/components/checkout/ShippingForm.jsx` - Works correctly
- ✅ `src/hooks/useShipping.js` - Works correctly
- ✅ `src/stores/checkoutStore.js` - Works correctly
- ✅ `src/app/(app)/checkout/shipping/page.jsx` - Works correctly
- ❌ `src/api/services/checkoutService.js` - **NEEDS 2 CHANGES**

---

## Quick Summary

| Aspect | Status | Details |
|--------|--------|---------|
| Form validation | ✅ Works | Zod validates all 9 fields |
| Store integration | ✅ Works | Zustand stores the address |
| Store → Service | ✅ Works | Passing in options parameter |
| Service extraction | ❌ Broken | Not destructuring shippingAddress |
| API payload | ❌ Broken | Not including in request body |
| Backend | ❌ Broken | Receives no shipping address |

**Fix required:** 1 file, 2 line changes
**Effort:** 5 minutes
**Impact:** Critical for checkout flow
