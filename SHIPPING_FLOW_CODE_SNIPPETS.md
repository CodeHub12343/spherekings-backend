# Shipping Data Flow - Code Snippets & Fix

## 🔍 Key Code Locations

### 1. ShippingForm Component
**File:** src/components/checkout/ShippingForm.jsx (Line 224-232)
```javascript
const handleFormSubmit = async (e) => {
  e.preventDefault();

  const success = await handleSubmit(async (validatedData) => {
    if (onSubmit) {
      await onSubmit(validatedData);  // ✅ Passes validated address
    }
  });
};
```
**What it does:** Calls the hook's `handleSubmit` which validates and saves to store, then calls `onSubmit` callback

---

### 2. useShipping Hook - handleSubmit
**File:** src/hooks/useShipping.js (Line 128-178)
```javascript
const handleSubmit = useCallback(
  async (onSuccess) => {
    setIsSubmitting(true);

    if (!validateForm()) {
      setIsSubmitting(false);
      console.warn('❌ Shipping form validation failed');
      return false;
    }

    try {
      setTouched(
        Object.keys(formData).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );

      // ✅ Parse form data with validation
      const validated = shippingAddressSchema.parse(formData);

      // ✅ SAVE TO STORE
      setShippingAddress(validated);

      // ✅ Call success callback with validated data
      if (onSuccess) {
        await onSuccess(validated);
      }

      console.log('✅ Shipping form submitted successfully');
      return true;
    } catch (error) {
      console.error('❌ Shipping form submission error:', error);
      return false;
    } finally {
      setIsSubmitting(false);
    }
  },
  [formData, validateForm, setShippingAddress]
);
```
**What it does:**
1. Validates form with Zod schema
2. Saves validated data to Zustand store via `setShippingAddress()`
3. Calls `onSuccess` callback

**Returns:** validated address to page component

---

### 3. CheckoutShippingPage - handleShippingSubmit
**File:** src/app/(app)/checkout/shipping/page.jsx (Line 145-174)
```javascript
const handleShippingSubmit = async (validatedAddress) => {
  try {
    console.log('🚚 Shipping form submitted, creating checkout session...');

    // ❌ PROBLEM: Not passing validatedAddress to service!
    // The page receives it but doesn't use it
    const sessionData = await checkoutService.createCheckoutSession({
      affiliateId: getAffiliateId(),
      // 🔴 Missing: validatedAddress (or shippingAddress)
    });

    console.log('✅ Checkout session created:', sessionData.sessionId);

    if (sessionData.url) {
      window.location.href = sessionData.url;
    } else {
      console.error('No checkout URL received');
      alert('Error creating checkout session. Please try again.');
    }
  } catch (error) {
    console.error('❌ Error creating checkout session:', error);
    
    let errorMessage = 'Error creating checkout session. Please try again.';
    if (error.message) {
      errorMessage = error.message;
    }
    if (error.details?.shippingAddress) {
      errorMessage = `Shipping address error: ${JSON.stringify(error.details.shippingAddress)}`;
    }
    if (error.details?.email) {
      errorMessage = `Email error: ${error.details.email}`;
    }

    alert(errorMessage);
  }
};
```
**Problem:** `validatedAddress` parameter is ignored - service not called with shipping data

**Note:** The page also retrieves shipping from store:
```javascript
const shippingAddress = useShippingAddress();
```
But this variable is never used!

---

### 4. checkoutStore.js - createCheckoutSession
**File:** src/stores/checkoutStore.js (Line 72-93)
```javascript
createCheckoutSession: async (options = {}) => {
  set((state) => ({
    ...state,
    isCreatingSession: true,
    error: null,
    errorDetails: null,
  }));

  try {
    console.log('📦 Store: Creating checkout session...');
    
    // ✅ TRIES to include shipping address from store state
    const sessionData = await checkoutService.createCheckoutSession({
      ...options,
      shippingAddress: get().shippingAddress, // ✅ Adds shipping to options
    });

    set((state) => ({
      ...state,
      session: {
        id: sessionData.sessionId,
        url: sessionData.url,
        metadata: sessionData.metadata,
        status: 'created',
      },
      isCreatingSession: false,
      redirectUrl: sessionData.url,
    }));

    return sessionData;
  } catch (error) {
    console.error('❌ Store: Error creating session:', error.message);
    // ... error handling ...
  }
},
```
**What it does:** Adds `shippingAddress: get().shippingAddress` to options passed to service

**Result:** Service receives `{ affiliateId, shippingAddress }`

---

### 5. checkoutService.js - createCheckoutSession (BROKEN)
**File:** src/api/services/checkoutService.js (Line 27-68)
```javascript
export async function createCheckoutSession(options = {}) {
  try {
    // 🔴 PROBLEM: Only destructures affiliateId and metadata
    // shippingAddress is in options but NOT extracted
    const { affiliateId, metadata } = options;
    
    console.log('🛒 Creating checkout session...');
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    // 🔴 PROBLEM: Body doesn't include shippingAddress
    const body = {
      ...(metadata && { metadata }),
      // Missing: ...(shippingAddress && { shippingAddress }),
    };
    
    // 🔴 PROBLEM: Sends incomplete body to API
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
    // ... error handling ...
  }
}
```

**Issues:**
1. Line 29: `const { affiliateId, metadata } = options;` → **doesn't extract shippingAddress**
2. Line 38-40: Body doesn't include shipping → **incomplete request body**
3. Result: Backend receives no shipping address ❌

---

## 📊 Data Flow Diagram

```
ShippingForm
    ↓
  (calls)
    ↓
useShipping.handleSubmit()
    ↓ (validates + saves)
    ├→ Zustand Store (✅ saved)
    └→ onSuccess callback
        ↓
CheckoutShippingPage.handleShippingSubmit(validatedAddress)
    ↓ (receives address but ignores it)
    ↓
checkoutService.createCheckoutSession({ affiliateId })
    ↓ (❌ no shipping in params)
    ↓
Backend API /checkout/create-session
    ↓ (❌ receives no shipping address)
    ↓
Stripe Session Created (❌ WITHOUT shipping info)
```

---

## 🔒 Store State Structure

**File:** src/stores/checkoutStore.js (Line 6-27)
```javascript
const initialState = {
  // Checkout session data
  session: {
    id: null,
    url: null,
    metadata: null,
    status: null,
  },

  // ✅ Shipping address is stored here
  shippingAddress: { ...defaultShippingAddress },

  // Order data after successful payment
  order: {
    id: null,
    number: null,
    items: [],
    totals: {
      subtotal: 0,
      tax: 0,
      total: 0,
    },
    paymentStatus: null,
  },

  // ... other state fields
};
```

**Access Methods:**
```javascript
// Get shipping address from store
export const useShippingAddress = () =>
  useCheckoutStore(
    useShallow((state) => state.shippingAddress)
  );
```

---

## 🛠️ What Needs Fixing

1. **checkoutService.createCheckoutSession** - Extract and forward shippingAddress
2. **checkoutStore.js** - Already passes it correctly ✅
3. **CheckoutShippingPage** - Already receives it, just needs to use it (optional, since store handles it)

### Minimal Fix (checkoutService.js only):
```javascript
export async function createCheckoutSession(options = {}) {
  try {
    // Extract all parameters including shippingAddress
    const { affiliateId, metadata, shippingAddress } = options;
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    // Include shippingAddress in request body
    const body = {
      ...(metadata && { metadata }),
      ...(shippingAddress && { shippingAddress }),  // ADD THIS LINE
    };
    
    const response = await client.post(
      '/checkout/create-session',
      Object.keys(body).length > 0 ? body : undefined,
      config
    );
    
    // ... rest of function
  }
}
```

---

## ✅ Validation Schema

**File:** src/validations/shippingSchema.js
```javascript
// Default empty values
export const defaultShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: 'US',
};

// Validation schema (9 required fields)
export const shippingAddressSchema = z.object({
  firstName: z.string().min(2, 'First name is required'),
  lastName: z.string().min(2, 'Last name is required'),
  email: z.string().email('Valid email is required'),
  phone: z.string().min(10, 'Valid phone number is required'),
  street: z.string().min(5, 'Street address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  postalCode: z.string().min(5, 'Valid postal code is required'),
  country: z.string().min(2, 'Country is required'),
});
```
