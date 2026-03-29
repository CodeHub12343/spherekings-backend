# Shipping Checkout Data Flow - Executive Summary

## 🚨 Critical Finding

**The shipping address is intentionally extracted and prepared by the Zustand store but then DISCARDED by the checkoutService function before sending to the backend API.**

### Path of the Shipping Address:

```
Form Input (valid address)
    ↓
useShipping.handleSubmit() saves to store
    ↓
Store state: shippingAddress = { firstName, lastName, ... }
    ↓
Store.createCheckoutSession() adds to options: { affiliateId, shippingAddress }
    ↓
checkoutService.createCheckoutSession(options) RECEIVES it
    ↓
❌ Service destructures: const { affiliateId, metadata } = options;
    → shippingAddress is NOT extracted
    ↓
❌ Service builds body: { metadata: ... }
    → shippingAddress is NOT included
    ↓
❌ API receives empty/missing shipping data
```

---

## 📍 Exact Problem Location

### File: src/api/services/checkoutService.js
### Lines: 27-40

```javascript
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata } = options;  // ❌ Missing shippingAddress
    
    console.log('🛒 Creating checkout session...');
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    const body = {
      ...(metadata && { metadata }),  // ❌ shippingAddress not added
    };
    
    const response = await client.post(
      '/checkout/create-session',
      Object.keys(body).length > 0 ? body : undefined,
      config
    );
    // ...
  }
}
```

---

## ✅ Evidence Trail

### 1. Store Properly Prepares Shipping (Line 92-94)
```javascript
const sessionData = await checkoutService.createCheckoutSession({
  ...options,
  shippingAddress: get().shippingAddress,  // ✅ Being sent
});
```
**Status:** ✅ Correct - Store adds shipping to the options object

### 2. Hook Saves to Store (Line 165-167)
```javascript
const validated = shippingAddressSchema.parse(formData);
setShippingAddress(validated);  // ✅ Saved to store
```
**Status:** ✅ Correct - Validated address is in Zustand store

### 3. Form Collects Valid Data (9 fields)
- firstName, lastName, email, phone, street, city, state, postalCode, country
**Status:** ✅ Correct - All fields validated by Zod schema

### 4. Service Function Called
```javascript
checkoutService.createCheckoutSession({
  affiliateId: "...",
  shippingAddress: { firstName, lastName, ... }  // ✅ Passed in
})
```
**Status:** ❌ **Problem - Parameter received but not used**

### 5. API Request Sent
```javascript
POST /checkout/create-session HTTP/1.1
Content-Type: application/json

{
  "metadata": null  // ❌ Missing shipping address
}
```
**Status:** ❌ **Critical - Shipping address not in request body**

---

## 🔍 Data Structure Expected by Backend

Based on the error handling in the page component (lines 157-167):

```javascript
if (error.details?.shippingAddress) {
  errorMessage = `Shipping address error: ${JSON.stringify(error.details.shippingAddress)}`;
}
if (error.details?.email) {
  errorMessage = `Email error: ${error.details.email}`;
}
```

**Backend expects:**
```javascript
{
  shippingAddress: {
    firstName: string,
    lastName: string,
    email: string,
    phone: string,
    street: string,
    city: string,
    state: string,
    postalCode: string,
    country: string
  }
}
```

---

## 🎯 The Fix

### Option 1: Minimal Fix (Recommended)
**File:** src/api/services/checkoutService.js, lines 28-40

**Change this:**
```javascript
const { affiliateId, metadata } = options;

const body = {
  ...(metadata && { metadata }),
};
```

**To this:**
```javascript
const { affiliateId, metadata, shippingAddress } = options;

const body = {
  ...(metadata && { metadata }),
  ...(shippingAddress && { shippingAddress }),
};
```

**Result:** Shipping address will be included in the POST request body

---

### Option 2: Alternative - Use Store Directly (Not Recommended)
While possible, it would require importing the store into the service, which violates separation of concerns. The store already handles this correctly by passing it as a parameter.

---

## Summary Table

| Component | Function | Data Passed | Data Received | Status |
|-----------|----------|------------|---------------|--------|
| ShippingForm | handleFormSubmit | ✅ validatedData | ✅ validatedData | ✅ OK |
| useShipping | handleSubmit | ✅ formData | ✅ saved to store | ✅ OK |
| Zustand Store | setShippingAddress | ✅ validated address | ✅ stored | ✅ OK |
| Zustand Store | createCheckoutSession | ✅ shippingAddress in options | ✅ passed to service | ✅ OK |
| checkoutService | createCheckoutSession | ✅ options with shippingAddress | ❌ NOT extracted | ❌ **BROKEN** |
| API Request | POST /checkout/create-session | ❌ NO shipping in body | ❌ empty shipping | ❌ **BROKEN** |

---

## Impact

- ❌ Stripe session created without shipping information
- ❌ Backend cannot process orders without shipping address
- ❌ Checkout fails or proceeds with incomplete data
- ❌ Customer may not reach payment screen or order cannot be completed

---

## How to Verify the Fix

After fixing checkoutService.js:

1. Open browser DevTools Network tab
2. Submit shipping form
3. Inspect POST request to `/api/checkout/create-session`
4. **Before fix:** Body only contains `{ metadata: null }`
5. **After fix:** Body should contain:
   ```json
   {
     "metadata": null,
     "shippingAddress": {
       "firstName": "John",
       "lastName": "Doe",
       "email": "john@example.com",
       "phone": "+1234567890",
       "street": "123 Main St",
       "city": "Springfield",
       "state": "IL",
       "postalCode": "62701",
       "country": "US"
     }
   }
   ```

---

## Timeline of Data Loss

1. **T0:** User fills shipping form ← Valid data
2. **T1:** Form submitted to hook ← Data present ✅
3. **T2:** Hook validates and saves to store ← Data in store ✅
4. **T3:** Store adds to API options ← Data in options ✅
5. **T4:** Service receives options ← Data received ✅
6. **T5:** Service extracts parameters ← Data DROPPED ❌
7. **T6:** Service sends to API ← Data MISSING ❌
8. **T7:** Backend receives request ← No shipping data ❌

**Data loss occurs at T5 in the destructuring assignment.**
