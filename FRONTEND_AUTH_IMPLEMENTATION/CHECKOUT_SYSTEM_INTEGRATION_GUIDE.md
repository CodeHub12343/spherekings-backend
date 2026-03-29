# Frontend Checkout System Integration Guide

Production-ready checkout system for Spherekings Marketplace integrated with Stripe Checkout and affiliate tracking.

## 📋 Table of Contents

- [Architecture Overview](#architecture-overview)
- [API Reference](#api-reference)
- [State Management](#state-management)
- [Custom Hooks](#custom-hooks)
- [UI Components](#ui-components)
- [Integration Examples](#integration-examples)
- [Checkout Flow](#checkout-flow)
- [Affiliate Tracking](#affiliate-tracking)
- [Error Handling](#error-handling)
- [Testing](#testing)

---

## 🏗️ Architecture Overview

### Technology Stack

- **Frontend Framework**: Next.js 14+ (Client Components)
- **API Client**: Axios with JWT interceptors
- **State Management**: Zustand with DevTools
- **Styling**: styled-components
- **Payment Provider**: Stripe Checkout (hosted)
- **Authentication**: JWT Bearer tokens

### Folder Structure

```
src/
├── api/
│   └── services/
│       └── checkoutService.js          # API calls
├── stores/
│   └── checkoutStore.js                # Zustand store
├── hooks/
│   └── useCheckout.js                  # Custom hooks
├── components/
│   └── checkout/
│       ├── CheckoutButton.jsx          # CTA button
│       ├── CheckoutSummary.jsx         # Order summary
│       ├── OrderConfirmationCard.jsx   # Confirmation
│       └── ...
├── app/
│   ├── cart/
│   │   └── page.jsx                    # Cart page
│   └── checkout/
│       ├── success/
│       │   └── page.jsx                # Success page
│       └── cancel/
│           └── page.jsx                # Cancel page
└── ...
```

### Data Flow

```
Cart Page
    ↓
[User clicks "Proceed to Checkout"]
    ↓
CheckoutButton (with CheckoutButton component)
    ↓
useCheckout() hook
    ↓
checkoutStore.createCheckoutSession(affiliateId)
    ↓
checkoutService.createCheckoutSession()
    ↓
POST /api/v1/checkout/create-session
    ↓
Backend validates cart & creates Stripe session
    ↓
Returns { sessionId, url }
    ↓
Redirect to Stripe Checkout URL
    ↓
User completes payment on Stripe
    ↓
Stripe redirects to /checkout/success?session_id={ID}
    ↓
Frontend verifies session via backend
    ↓
Shows OrderConfirmationCard
```

---

## 🔌 API Reference

### Checkout Service Functions

All functions are located in `src/api/services/checkoutService.js`

#### `createCheckoutSession(options)`

Creates a Stripe checkout session for the user's cart.

**Parameters:**
```javascript
{
  affiliateId: string,        // Optional affiliate ID for referral tracking
  metadata: object            // Optional additional metadata
}
```

**Returns:**
```javascript
Promise<{
  sessionId: string,          // Stripe session ID (cs_test_...)
  url: string,                // Redirect URL to Stripe Checkout
  metadata: {
    cartItems: Array,
    subtotal: number,
    tax: number,
    total: number,
    affiliateId: string
  }
}>
```

**Example:**
```javascript
import checkoutService from '@/api/services/checkoutService';

const session = await checkoutService.createCheckoutSession({
  affiliateId: 'aff_12345',
});

window.location.href = session.url;
```

**Error Handling:**
```javascript
try {
  const session = await checkoutService.createCheckoutSession();
} catch (error) {
  console.error(error.message);        // Human-readable error
  console.error(error.status);         // HTTP status
  console.error(error.details);        // Backend errors object
}
```

#### `getCheckoutSession(sessionId)`

Retrieves details about a checkout session (used for verification).

**Parameters:**
```javascript
sessionId: string  // Stripe session ID (e.g., from URL query param)
```

**Returns:**
```javascript
Promise<{
  id: string,
  payment_status: 'paid' | 'unpaid',
  metadata: object,
  customer_email: string,
  amount_total: number,
  ...
}>
```

#### `verifyCheckoutSession(sessionId)`

Verifies that payment was completed successfully.

**Parameters:**
```javascript
sessionId: string  // From URL: /checkout/success?session_id={ID}
```

**Returns:**
```javascript
Promise<Object>  // Verified session data
```

**Throws error if:**
- Session not found
- Payment status is not 'paid'

#### `requestRefund(options)`

Requests a refund for a completed payment.

**Parameters:**
```javascript
{
  paymentIntentId: string,      // Required: Stripe payment intent ID
  amount: number,               // Optional: refund amount in cents (full refund if omitted)
  reason: string                // Optional: refund reason
}
```

**Returns:**
```javascript
Promise<{
  refundId: string,
  amount: number,
  status: string
}>
```

---

## 💾 State Management

### Zustand Store

The checkout store manages all checkout-related state.

**Located at:** `src/stores/checkoutStore.js`

#### Store Structure

```javascript
{
  // Session data
  session: {
    id: null,
    url: null,
    metadata: null,
    status: 'created' | 'redirected' | 'completed' | 'canceled'
  },

  // Order data after payment
  order: {
    id: null,
    number: null,
    items: [],
    totals: {
      subtotal: 0,
      tax: 0,
      total: 0
    }
  },

  // Loading states
  isCreatingSession: false,
  isVerifyingSession: false,
  isProcessing: false,

  // Error handling
  error: null,
  errorDetails: null,

  // Redirect tracking
  isRedirected: false,
  redirectUrl: null
}
```

#### Store Actions

```javascript
import useCheckoutStore from '@/stores/checkoutStore';

// Start creating session
store.startCreatingSession();

// Create checkout session
await store.createCheckoutSession({ affiliateId: 'aff_123' });

// Mark as redirected
store.markAsRedirected();

// Verify after redirect
await store.verifyCheckoutSession(sessionId);

// Set order data
store.setOrderData(orderData);

// Handle cancel
store.handleCancel();

// Clear error
store.clearError();

// Reset all state
store.reset();

// Reset only session (keep order)
store.resetSession();
```

#### Store Selectors

Use selectors for efficient re-rendering (only subscribe to needed state):

```javascript
import useCheckoutStore, {
  useCheckoutSession,
  useCheckoutOrder,
  useCheckoutLoading,
  useCheckoutError,
  useCheckoutStatus
} from '@/stores/checkoutStore';

// Get session
const session = useCheckoutSession();

// Get order
const order = useCheckoutOrder();

// Get loading states
const { isCreatingSession, isVerifyingSession } = useCheckoutLoading();

// Get error
const { error, errorDetails } = useCheckoutError();

// Get status
const status = useCheckoutStatus();
```

---

## 🎣 Custom Hooks

All hooks located in `src/hooks/useCheckout.js`

### `useCheckout()`

Main hook providing complete checkout functionality.

**Returns:**
```javascript
{
  // State
  session,           // Current Stripe session
  order,             // Order after payment
  status,            // 'created' | 'redirected' | 'completed' | 'canceled'
  loading,           // { isCreatingSession, isVerifyingSession, isProcessing }
  error,             // Error message
  errorDetails,      // Detailed error info

  // Actions
  handleCheckout,         // Initiate checkout
  handleSuccessRedirect,  // Handle redirect from Stripe
  handleCancel,           // Handle cancel
  clearError,             // Clear error
  resetCheckout           // Reset all state
}
```

**Example:**
```javascript
import { useCheckout } from '@/hooks/useCheckout';

export default function CheckoutDemo() {
  const { 
    handleCheckout, 
    loading, 
    error 
  } = useCheckout();

  return (
    <>
      {error && <div className="error">{error}</div>}
      <button 
        onClick={() => handleCheckout('aff_123')} 
        disabled={loading.isCreatingSession}
      >
        {loading.isCreatingSession ? 'Processing...' : 'Checkout'}
      </button>
    </>
  );
}
```

### `useCreateCheckoutSession()`

Simplified hook for just initiating checkout.

**Returns:**
```javascript
{
  handleCheckout: (affiliateId?) => Promise<void>,
  isLoading: boolean,
  error: string | null
}
```

**Example:**
```javascript
const { handleCheckout, isLoading } = useCreateCheckoutSession();

<button onClick={() => handleCheckout()} disabled={isLoading}>
  Checkout
</button>
```

### `useCheckoutAffiliateTracking()`

Manage affiliate ID tracking via cookies.

**Returns:**
```javascript
{
  getAffiliateId: () => string | null,
  setAffiliateId: (affiliateId: string) => void
}
```

**Example:**
```javascript
const { getAffiliateId, setAffiliateId } = useCheckoutAffiliateTracking();

// Get affiliate ID from cookie
const affId = getAffiliateId();

// Set affiliate ID (saves to cookie)
setAffiliateId('aff_123456');
```

### `useVerifyCheckoutSession()`

Handle session verification after Stripe redirect.

**Returns:**
```javascript
{
  verifySession: (sessionId: string) => Promise<Object>,
  isVerifying: boolean,
  error: string | null
}
```

---

## 🎨 UI Components

### CheckoutButton

Button to initiate Stripe checkout.

**Features:**
- Automatic affiliate tracking
- Loading state with spinner
- Error display via toast
- Responsive design
- Stripe icon indicator

**Props:**
```javascript
{
  disabled?: boolean,              // Disable button
  fullWidth?: boolean,             // 100% width
  label?: string,                  // Button text
  affiliateId?: string,            // Optional affiliate ID
  onCheckoutStart?: () => void,    // Callback before checkout
  onCheckoutError?: (err) => void  // Error callback
}
```

**Example:**
```javascript
import CheckoutButton from '@/components/checkout/CheckoutButton';

<CheckoutButton
  fullWidth
  label="Complete Purchase"
  affiliateId="aff_123"
  onCheckoutStart={() => console.log('Starting checkout...')}
  onCheckoutError={(err) => console.error(err.message)}
/>
```

### CheckoutSummary

Display order summary with totals.

**Props:**
```javascript
{
  totals?: {
    subtotal: number,      // In cents
    tax: number,           // In cents
    total: number,         // In cents
    discount?: number      // In cents
  },
  itemCount?: number,
  title?: string,
  showBreakdown?: boolean,
  showShippingNote?: boolean
}
```

**Example:**
```javascript
import CheckoutSummary from '@/components/checkout/CheckoutSummary';

<CheckoutSummary
  totals={{
    subtotal: 9999,
    tax: 1000,
    total: 10999
  }}
  itemCount={3}
  showBreakdown={true}
/>
```

### OrderConfirmationCard

Display order confirmation after successful payment.

**Props:**
```javascript
{
  orderNumber: string,     // e.g., "ORD-20240115-123456"
  orderId: string,
  items: Array<{
    productName: string,
    quantity: number,
    subtotal: number
  }>,
  total: number,           // In cents
  email: string,
  paymentStatus: string,
  message: string
}
```

**Example:**
```javascript
import OrderConfirmationCard from '@/components/checkout/OrderConfirmationCard';

<OrderConfirmationCard
  orderNumber="ORD-20240115-001234"
  orderId="507f1f77bcf86cd799439011"
  items={[
    { productName: 'Product 1', quantity: 2, subtotal: 9998 }
  ]}
  total={10998}
  email="user@example.com"
  paymentStatus="paid"
  message="Your order has been confirmed!"
/>
```

---

## 📖 Integration Examples

### Example 1: Basic Checkout from Cart Page

```javascript
// src/app/cart/page.jsx
'use client';

import CheckoutButton from '@/components/checkout/CheckoutButton';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import { useCartStore } from '@/stores/cartStore';

export default function CartPage() {
  const items = useCartStore(state => state.items);
  const summary = useCartStore(state => state.summary);

  return (
    <div>
      {/* Cart items... */}
      
      {/* Summary with checkout */}
      <CheckoutSummary
        totals={summary}
        itemCount={items.length}
      />

      <CheckoutButton 
        fullWidth
        label="Proceed to Checkout"
      />
    </div>
  );
}
```

### Example 2: With Affiliate Tracking

```javascript
// src/app/cart/page.jsx
import CheckoutButton from '@/components/checkout/CheckoutButton';
import { useCheckoutAffiliateTracking } from '@/hooks/useCheckout';

export default function CartPage() {
  const { getAffiliateId } = useCheckoutAffiliateTracking();

  // Get affiliate ID from cookie (if user came from affiliate link)
  const affiliateId = getAffiliateId();

  return (
    <CheckoutButton
      fullWidth
      affiliateId={affiliateId}
      onCheckoutError={(err) => {
        console.error('Checkout failed:', err.message);
      }}
    />
  );
}
```

### Example 3: Manual Checkout Flow

```javascript
'use client';

import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutDemo() {
  const {
    handleCheckout,
    loading,
    error,
    clearError
  } = useCheckout();

  const { error: showError, success } = useToast();

  const handleClick = async () => {
    try {
      clearError();
      await handleCheckout('aff_123456');
      success('Redirecting to payment...');
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading.isCreatingSession}
    >
      {loading.isCreatingSession ? 'Processing...' : 'Pay Now'}
    </button>
  );
}
```

### Example 4: Success Page Handler

The `src/app/checkout/success/page.jsx` automatically:
1. Extracts `session_id` from URL
2. Verifies session via backend
3. Displays `OrderConfirmationCard`
4. Clears cart after confirmation

No additional integration needed!

---

## ✅ Checkout Flow with Affiliate Support

### Complete User Journey

```
1. User browsing products
   ├─ Clicks affiliate link (sets affiliate_ref cookie)
   └─ Cookie contains: { affiliateId, timestamp }

2. User adds items to cart
   └─ Cart stores items locally

3. User goes to cart page
   ├─ Sees CartSummaryPanel with CheckoutButton
   └─ Cart integration automatically detects affiliate cookie

4. User clicks "Proceed to Checkout"
   ├─ CheckoutButton extracts affiliateId from cookie
   ├─ Calls useCheckout() with affiliateId
   └─ Creates checkout session with affiliate tracking

5. Backend processes checkout
   ├─ Validates cart
   ├─ Creates Stripe session with affiliateId in metadata
   ├─ Returns Stripe checkout URL
   └─ URL is stored in session.redirectUrl

6. Frontend redirects to Stripe
   └─ window.location.href = session.url

7. User completes payment on Stripe
   └─ Stripe redirects to /checkout/success?session_id={ID}

8. Frontend verifies payment
   ├─ Extracts session_id from URL
   ├─ Calls verifyCheckoutSession()
   ├─ Backend confirms payment + processes order
   └─ Backend handles affiliate commission

9. Show success page
   ├─ Display OrderConfirmationCard
   ├─ Clear cart
   └─ Offer: Continue Shopping or View Orders
```

### Affiliate Cookie Structure

Affiliate cookies are automatically set when redirected from affiliate links:

```javascript
// Cookie name: affiliate_ref
{
  affiliateId: "aff_abc123def456",
  timestamp: 1705334400000
}

// Expires: 30 days from set time
// Path: /
```

The `CheckoutButton` automatically reads this cookie and passes `affiliateId` to the backend.

---

## 🚨 Error Handling

### Common Errors

#### 1. Empty Cart
```javascript
Error: Cannot checkout with an empty cart

// Solution:
// - Show toast: "Please add items to cart"
// - Redirect to products page
```

#### 2. Session Creation Failed
```javascript
Error: Failed to create checkout session

// Possible causes:
// - Product out of stock
// - Price mismatch
// - Backend API error
// - Network error

// Solution:
// - Display error message
// - Offer retry button
// - Check backend logs
```

#### 3. Payment Verification Failed
```javascript
Error: Failed to verify payment

// Solution:
// - Contact support (provide session ID from URL)
// - Retry verification
// - Check email for order confirmation
```

### Global Error Handling

All errors are caught and displayed via toast notifications:

```javascript
import { useToast } from '@/components/ui/Toast';

const { success, error: showError, warning } = useToast();

try {
  await handleCheckout();
  success('Payment initiated!');
} catch (err) {
  showError(err.message);
}
```

### Error Details Object

Network errors include detailed information:

```javascript
error.message      // "Payment intent not found"
error.status       // 404
error.details      // { code: "payment_intent_not_found", ... }
```

---

## 🧪 Testing

### Unit Tests

**Test 1: Session Creation**
```javascript
import checkoutService from '@/api/services/checkoutService';

describe('checkoutService', () => {
  it('should create checkout session', async () => {
    const result = await checkoutService.createCheckoutSession({
      affiliateId: 'aff_test'
    });

    expect(result).toHaveProperty('sessionId');
    expect(result).toHaveProperty('url');
    expect(result.url).toContain('checkout.stripe.com');
  });
});
```

### Component Tests

**Test 2: CheckoutButton**
```javascript
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutButton from '@/components/checkout/CheckoutButton';

test('should call handleCheckout on click', async () => {
  render(<CheckoutButton label="Pay Now" />);
  
  const button = screen.getByRole('button', { name: /pay now/i });
  fireEvent.click(button);
  
  // Should show loading state
  expect(screen.getByText(/processing/i)).toBeInTheDocument();
});
```

### Integration Tests

**Test 3: Complete Checkout Flow**
```javascript
test('complete checkout flow', async () => {
  // 1. Render cart page
  render(<CartPage />);

  // 2. Verify CheckoutButton present
  const checkoutBtn = screen.getByText(/proceed to checkout/i);
  expect(checkoutBtn).toBeInTheDocument();

  // 3. Click checkout
  fireEvent.click(checkoutBtn);

  // 4. Verify session created and redirect initiated
  // (mock window.location.href)
  expect(window.location.href).toContain('checkout.stripe.com');
});
```

---

## 🔒 Security Best Practices

### JWT Authentication
All API calls include JWT bearer token automatically via axios interceptor:
```
Authorization: Bearer eyJhbGciOiJIUzI1NiIs...
```

### No Sensitive Data on Frontend
- ✓ Stripe secret keys stay on backend
- ✓ Webhook signatures verified server-side only
- ✓ Payment intents created server-side
- ✓ Refund requests authenticated with JWT

### Stripe Security
- Only redirect to official Stripe checkout URLs
- Never collect card data directly (use Stripe Checkout)
- Session verification happens on backend
- Webhook events verified with signing secret

### Environment Variables
```env
# Backend API
NEXT_PUBLIC_API_URL=https://api.spherekings.com
NEXT_PUBLIC_FRONTEND_URL=https://app.spherekings.com

# Note: STRIPE_PUBLIC_KEY not needed (using Checkout redirect)
# SECRET_KEY stays on backend only
```

---

## 📞 Support & Troubleshooting

### Debugging Checkout

Enable debug logging:
```javascript
// Automatic in:
// - checkoutService.js
// - checkoutStore.js
// - useCheckout.js

// Check browser console for:
// 🛒 Creating checkout session...
// ✅ Checkout session created: { sessionId, url }
// ➡️ Redirecting to Stripe Checkout...
// 🔐 Verifying checkout session...
// ✅ Session verified - payment confirmed
```

### Common Issues

**Issue: Session creation returns 400 error**
```
Solution: Check that cart is not empty and all products are available
- Use cart validation endpoint before checkout
- Check product status (not inactive/out_of_stock)
```

**Issue: Redirect not happening**
```
Solution: Check that FRONTEND_URL is set correctly in backend
- Verify /checkout/success route exists
- Check that session.url is not null
```

**Issue: Order not created after payment**
```
Solution: Backend webhook might be processing slowly
- Wait 2-3 seconds before checking order status
- Verify webhook endpoint is configured in Stripe dashboard
- Check backend logs for webhook errors
```

---

## 📚 Additional Resources

- [Stripe Checkout Documentation](https://stripe.com/docs/checkout)
- [Zustand State Management](https://github.com/pmndrs/zustand)
- [Next.js App Router](https://nextjs.org/docs/app)
- [React Hooks](https://react.dev/reference/react)

---

**Version:** 1.0.0  
**Last Updated:** March 14, 2026  
**Maintained by:** Spherekings Engineering Team
