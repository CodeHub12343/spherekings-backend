# Shipping Checkout Data Flow Analysis

## 🔴 CRITICAL ISSUE IDENTIFIED

The shipping address is **lost between the store and the API call**. The data never reaches the backend.

---

## Data Flow Trace

### 1️⃣ **ShippingForm → useShipping Hook** ✅
**File:** [src/components/checkout/ShippingForm.jsx](src/components/checkout/ShippingForm.jsx)
```javascript
const handleFormSubmit = async (e) => {
  e.preventDefault();
  
  const success = await handleSubmit(async (validatedData) => {
    if (onSubmit) {
      await onSubmit(validatedData);  // Pass validatedData to parent
    }
  });
};
```

### 2️⃣ **useShipping Hook → Zustand Store** ✅
**File:** [src/hooks/useShipping.js](src/hooks/useShipping.js#L130-L160)
```javascript
const handleSubmit = useCallback(
  async (onSuccess) => {
    // ... validation ...
    const validated = shippingAddressSchema.parse(formData);
    
    // ✅ SAVES TO STORE
    setShippingAddress(validated);
    
    // Calls success callback
    if (onSuccess) {
      await onSuccess(validated);
    }
  },
  [formData, validateForm, setShippingAddress]
);
```

### 3️⃣ **CheckoutShippingPage → checkoutService** ❌ ISSUE HERE
**File:** [src/app/(app)/checkout/shipping/page.jsx](src/app/(app)/checkout/shipping/page.jsx#L148-L165)
```javascript
const handleShippingSubmit = async (validatedAddress) => {
  try {
    console.log('🚚 Shipping form submitted, creating checkout session...');
    
    // ❌ NOT PASSING SHIPPING ADDRESS TO SERVICE!
    const sessionData = await checkoutService.createCheckoutSession({
      affiliateId: getAffiliateId(),
      // 🔴 validatedAddress is NOT being passed
      // 🔴 Relying on store instead
    });
  }
};
```

### 4️⃣ **checkoutStore → API Service** ⚠️ PARTIALLY WORKING
**File:** [src/stores/checkoutStore.js](src/stores/checkoutStore.js#L92-94)
```javascript
createCheckoutSession: async (options = {}) => {
  // ✅ Store TRIES to pass shipping:
  const sessionData = await checkoutService.createCheckoutSession({
    ...options,
    shippingAddress: get().shippingAddress,  // ✅ Passed here
  });
},
```

### 5️⃣ **checkoutService.createCheckoutSession** 🔴 DATA LOST HERE
**File:** [src/api/services/checkoutService.js](src/api/services/checkoutService.js#L27-40)
```javascript
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata } = options;
    // 🔴 shippingAddress is NOT destructured!
    
    console.log('🛒 Creating checkout session...');
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    const body = {
      ...(metadata && { metadata }),
      // 🔴 shippingAddress is NOT added to body!
    };
    
    const response = await client.post(
      '/checkout/create-session',
      Object.keys(body).length > 0 ? body : undefined,  // ❌ Missing shipping!
      config
    );
  }
}
```

---

## The Problem

| Step | What's Sent | Status |
|------|-----------|--------|
| 1. Form submission | `validatedAddress` object | ✅ OK |
| 2. Hook save to store | `validated` object | ✅ OK |
| 3. Page to service | `{ affiliateId }` only | ❌ Address lost |
| 4. Store adds shipping | `{ affiliateId, shippingAddress }` | ✅ Attempted |
| 5. Service receives | `{ affiliateId, shippingAddress }` | ✅ Received |
| 6. Service sends to API | `{ metadata }` only | 🔴 **DATA LOST** |

---

## Root Causes

### Issue #1: Destructuring Loss
The service extracts `affiliateId` and `metadata` but **never extracts `shippingAddress`**:
```javascript
const { affiliateId, metadata } = options;
// shippingAddress is lost in options object
```

### Issue #2: Body Construction
The request body only includes `metadata`, not `shippingAddress`:
```javascript
const body = {
  ...(metadata && { metadata }),
  // Should include: ...(shippingAddress && { shippingAddress }),
};
```

### Issue #3: Missing Parameter Handling
Even if destructured, there's no logic to include it in the request:
```javascript
// Current - only metadata is conditionally added
// Need to add shipping address handling
```

---

## Expected Data Structure

### Current (WRONG) ❌
```javascript
POST /checkout/create-session
Body: { metadata: {...} }
Query: ?affiliateId=aff_123
```

### Should Be (CORRECT) ✅
```javascript
POST /checkout/create-session
Body: {
  metadata: {...},
  shippingAddress: {
    firstName: "John",
    lastName: "Doe",
    email: "john@example.com",
    phone: "+1234567890",
    street: "123 Main St",
    city: "Springfield",
    state: "IL",
    postalCode: "62701",
    country: "US"
  }
}
Query: ?affiliateId=aff_123
```

---

## Store State ✅
**File:** [src/stores/checkoutStore.js](src/stores/checkoutStore.js#L310-320)
```javascript
// Shipping address selectors work correctly
export const useShippingAddress = () =>
  useCheckoutStore(
    useShallow((state) => state.shippingAddress)
  );

export const useShippingActions = () =>
  useCheckoutStore(
    useShallow((state) => ({
      setShippingAddress: state.setShippingAddress,
      updateShippingField: state.updateShippingField,
      clearShippingAddress: state.clearShippingAddress,
    }))
  );
```

---

## Fix Required

### Fix checkoutService.js

**Current broken code (lines 27-40):**
```javascript
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata } = options;  // ❌ Missing shippingAddress
```

**Should be:**
```javascript
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata, shippingAddress } = options;  // ✅ Extract shipping

    const body = {
      ...(metadata && { metadata }),
      ...(shippingAddress && { shippingAddress }),  // ✅ Include in body
    };
```

---

## Summary

- ✅ **Form → Hook:** Data flows correctly
- ✅ **Hook → Store:** Data stored correctly  
- ✅ **Store → Page:** Page can retrieve shipping data
- ❌ **Service function:** Doesn't extract or forward shipping address
- 🔴 **API call:** Shipping address never reaches backend

**The shipping address is intentionally being passed by the store but then ignored by the service function.**
