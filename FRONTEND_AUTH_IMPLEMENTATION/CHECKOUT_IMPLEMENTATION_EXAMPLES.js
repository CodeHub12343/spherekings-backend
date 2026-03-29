/**
 * Checkout Integration Examples
 * Complete working examples of checkout system integration
 * 
 * Copy and adapt these examples for your use case
 */

// ============================================================================
// EXAMPLE 1: Basic Integration in Cart Page
// ============================================================================

export const EXAMPLE_1_CART_PAGE = `
'use client';

import { useEffect, useState } from 'react';
import styled from 'styled-components';
import CartItemCard from '@/components/cart/CartItemCard';
import CartSummaryPanel from '@/components/cart/CartSummaryPanel';
import CartEmptyState from '@/components/cart/CartEmptyState';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import { useCartStore } from '@/stores/cartStore';
import { useToast } from '@/components/ui/Toast';

export default function CartPage() {
  const items = useCartStore((state) => state.items);
  const summary = useCartStore((state) => state.summary);
  const removeItem = useCartStore((state) => state.removeFromCart);
  const updateItem = useCartStore((state) => state.updateCartItem);
  const clearCart = useCartStore((state) => state.clearCart);
  const { success, error: showError } = useToast();

  // Empty cart state
  if (items.length === 0) {
    return <CartEmptyState />;
  }

  return (
    <PageContainer>
      <Title>Shopping Cart</Title>

      <CartLayout>
        {/* Left: Cart Items */}
        <CartItems>
          {items.map((item) => (
            <CartItemCard
              key={item._id}
              item={item}
              onUpdateQuantity={async (qty) => {
                try {
                  await updateItem(item._id, { quantity: qty });
                  success('Cart updated');
                } catch (err) {
                  showError('Failed to update cart');
                }
              }}
              onRemove={async () => {
                try {
                  await removeItem(item._id);
                  success('Item removed');
                } catch (err) {
                  showError('Failed to remove item');
                }
              }}
            />
          ))}
        </CartItems>

        {/* Right: Summary with Checkout */}
        <CartSummary>
          <CartSummaryPanel
            summary={summary}
            itemCount={items.length}
            onContinueShopping={() => router.push('/products')}
          />
          
          {/* Checkout Button */}
          <CheckoutButton
            fullWidth
            label="Complete Purchase"
            onCheckoutError={(err) => {
              showError(err.message);
            }}
          />
        </CartSummary>
      </CartLayout>
    </PageContainer>
  );
}
`;

// ============================================================================
// EXAMPLE 2: Advanced Checkout with Affiliate Tracking
// ============================================================================

export const EXAMPLE_2_WITH_AFFILIATE_TRACKING = `
'use client';

import { useEffect, useState } from 'react';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import { useCheckoutAffiliateTracking } from '@/hooks/useCheckout';

export default function CheckoutWithAffiliates() {
  const { getAffiliateId } = useCheckoutAffiliateTracking();
  const [affiliateId, setAffiliateId] = useState(null);
  const [affiliateData, setAffiliateData] = useState(null);

  useEffect(() => {
    // Get affiliate ID from cookie (set by affiliate link redirect)
    const aff = getAffiliateId();
    setAffiliateId(aff);

    // Optional: Show affiliate info
    if (aff) {
      console.log('User is referred by affiliate:', aff);
      // Could display: "You're shopping with our partner XYZ"
    }
  }, []);

  return (
    <div>
      {/* Optional: Show affiliate badge */}
      {affiliateId && (
        <AffiliateNotice>
          ✓ You're support a partner merchant with this purchase
        </AffiliateNotice>
      )}

      {/* Checkout button with affiliate tracking */}
      <CheckoutButton
        fullWidth
        label="Proceed to Secure Checkout"
        affiliateId={affiliateId}
        onCheckoutStart={() => {
          console.log('Starting checkout for affiliate:', affiliateId);
        }}
        onCheckoutError={(err) => {
          console.error('Checkout failed:', err.message);
        }}
      />
    </div>
  );
}
`;

// ============================================================================
// EXAMPLE 3: Manual Checkout Flow with Full Control
// ============================================================================

export const EXAMPLE_3_MANUAL_FLOW = `
'use client';

import { useEffect, useState } from 'react';
import { useCheckout } from '@/hooks/useCheckout';
import { useRouter } from 'next/navigation';

export default function ManualCheckoutFlow() {
  const router = useRouter();
  const {
    session,
    loading,
    error,
    handleCheckout,
    clearError,
  } = useCheckout();

  const [customMetadata, setCustomMetadata] = useState(null);

  const handleInitiateCheckout = async () => {
    try {
      clearError();

      // Optional: Get current affiliate from URL or cookie
      const params = new URLSearchParams(window.location.search);
      const affiliateId = params.get('ref') || localStorage.getItem('affiliateId');

      // Start checkout
      console.log('Starting checkout with affiliate:', affiliateId);
      
      await handleCheckout(affiliateId);

      // At this point, user is redirected to Stripe
      // No need to do anything else, Stripe handles the flow
    } catch (err) {
      console.error('Checkout error:', {
        message: err.message,
        status: err.status,
        details: err.details,
      });
    }
  };

  return (
    <CheckoutContainer>
      {/* Error Display */}
      {error && (
        <ErrorBanner>
          <strong>Checkout Error:</strong> {error}
        </ErrorBanner>
      )}

      {/* Session Info (for debugging) */}
      {session.id && (
        <SessionInfo>
          Session ID: {session.id}
          <br />
          Status: {session.status}
        </SessionInfo>
      )}

      {/* Checkout Button */}
      <CheckoutBtn
        onClick={handleInitiateCheckout}
        disabled={loading.isCreatingSession}
      >
        {loading.isCreatingSession ? (
          <>
            <Spinner />
            Processing Checkout...
          </>
        ) : (
          'Proceed to Payment'
        )}
      </CheckoutBtn>

      {/* Help Text */}
      <HelpText>
        You'll be redirected to Stripe's secure payment page.
        No credit card info is stored on our servers.
      </HelpText>
    </CheckoutContainer>
  );
}
`;

// ============================================================================
// EXAMPLE 4: Product Page Quick Checkout
// ============================================================================

export const EXAMPLE_4_QUICK_CHECKOUT_FROM_PRODUCT = `
'use client';

import { useState } from 'react';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';

export default function ProductQuickCheckout({ product }) {
  const [quantity, setQuantity] = useState(1);
  const { addToCart, isLoading: isAddingToCart } = useAddToCart();
  const { success, error: showError } = useToast();

  const handleDirectCheckout = async () => {
    try {
      // Add to cart first
      await addToCart(product._id, quantity);
      success('Added to cart! Redirecting to checkout...');

      // Wait a moment for cart to update
      setTimeout(() => {
        // Trigger checkout (CheckoutButton handles this)
        document.getElementById('quick-checkout-btn')?.click();
      }, 500);
    } catch (err) {
      showError(err.message);
    }
  };

  return (
    <ProductCheckoutContainer>
      {/* Quantity Selector */}
      <QuantityControl>
        <button onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
        <input type="number" value={quantity} min="1" />
        <button onClick={() => setQuantity(q => q + 1)}>+</button>
      </QuantityControl>

      {/* Quick Checkout Option 1: Add to Cart + Checkout */}
      <CheckoutButton
        id="quick-checkout-btn"
        fullWidth
        label="Buy Now"
        onCheckoutStart={handleDirectCheckout}
      />

      {/* Quick Checkout Option 2: Add to Cart Only */}
      <AddToCartBtn
        onClick={handleDirectCheckout}
        disabled={isAddingToCart}
      >
        {isAddingToCart ? 'Adding...' : 'Add to Cart'}
      </AddToCartBtn>
    </ProductCheckoutContainer>
  );
}
`;

// ============================================================================
// EXAMPLE 5: Checkout Success Page Handler
// ============================================================================

export const EXAMPLE_5_SUCCESS_PAGE = `
'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import OrderConfirmationCard from '@/components/checkout/OrderConfirmationCard';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';
import { useCheckout } from '@/hooks/useCheckout';
import { useCartStore } from '@/stores/cartStore';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  
  const { handleSuccessRedirect, order, loading, error } = useCheckout();
  const { clearCart } = useCartStore();
  
  const [isProcessing, setIsProcessing] = useState(true);

  useEffect(() => {
    const verifyPayment = async () => {
      if (!sessionId) {
        setIsProcessing(false);
        return;
      }

      try {
        // Wait for webhook processing
        await new Promise(r => setTimeout(r, 2000));

        // Verify on backend
        await handleSuccessRedirect(sessionId);

        // Clear cart
        clearCart();

        setIsProcessing(false);
      } catch (err) {
        console.error('Verification failed:', err);
        setIsProcessing(false);
      }
    };

    verifyPayment();
  }, [sessionId]);

  if (isProcessing) {
    return <LoadingSpinner>Preparing your order...</LoadingSpinner>;
  }

  if (error) {
    return (
      <ErrorContainer>
        <h2>Verification Failed</h2>
        <p>{error}</p>
        <p>Session ID: {sessionId}</p>
      </ErrorContainer>
    );
  }

  return (
    <SuccessContainer>
      <OrderConfirmationCard
        orderNumber={order?.number}
        orderId={order?.id}
        items={order?.items}
        total={order?.totals?.total}
        paymentStatus="paid"
      />

      <CheckoutSummary
        totals={order?.totals}
        itemCount={order?.items?.length}
      />
    </SuccessContainer>
  );
}
`;

// ============================================================================
// EXAMPLE 6: Multi-Step Checkout Form Component
// ============================================================================

export const EXAMPLE_6_MULTI_STEP_CHECKOUT = `
'use client';

import React, { useState } from 'react';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import CheckoutSummary from '@/components/checkout/CheckoutSummary';

export default function MultiStepCheckout() {
  const [step, setStep] = useState('review');
  const [formData, setFormData] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zip: ''
  });

  const steps = {
    review: 'Review Order',
    shipping: 'Shipping Address',
    payment: 'Payment'
  };

  const handleNext = async () => {
    if (step === 'review') setStep('shipping');
    else if (step === 'shipping') {
      // Validate shipping data
      if (!formData.address || !formData.city) {
        alert('Please fill all fields');
        return;
      }
      setStep('payment');
    }
  };

  return (
    <div>
      {/* Step Indicator */}
      <StepIndicator>
        {Object.entries(steps).map(([key, label]) => (
          <Step
            key={key}
            active={step === key}
            onClick={() => setStep(key)}
          >
            {label}
          </Step>
        ))}
      </StepIndicator>

      {/* Step 1: Review */}
      {step === 'review' && (
        <StepContent>
          <h2>Review Your Order</h2>
          <CheckoutSummary totals={{ subtotal: 9999, tax: 1000, total: 10999 }} />
          <button onClick={handleNext}>Continue to Shipping</button>
        </StepContent>
      )}

      {/* Step 2: Shipping */}
      {step === 'shipping' && (
        <StepContent>
          <h2>Shipping Address</h2>
          <input
            placeholder="Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
          <input
            placeholder="Address"
            value={formData.address}
            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
          />
          {/* More fields... */}
          <button onClick={handleNext}>Continue to Payment</button>
        </StepContent>
      )}

      {/* Step 3: Payment */}
      {step === 'payment' && (
        <StepContent>
          <h2>Complete Payment</h2>
          <CheckoutButton fullWidth label="Pay Now" />
        </StepContent>
      )}
    </div>
  );
}
`;

// ============================================================================
// EXAMPLE 7: Handling Checkout Errors
// ============================================================================

export const EXAMPLE_7_ERROR_HANDLING = `
'use client';

import { useCheckout } from '@/hooks/useCheckout';
import { useToast } from '@/components/ui/Toast';

export default function CheckoutWithErrorHandling() {
  const { handleCheckout, error, clearError } = useCheckout();
  const { error: showError } = useToast();

  const handleCheckoutClick = async () => {
    try {
      clearError();
      await handleCheckout();
    } catch (err) {
      console.error('Checkout error details:', {
        message: err.message,
        status: err.status,
        details: err.details,
      });

      // Show user-friendly error
      showError(err.message);

      // Handle specific errors
      if (err.status === 400) {
        // Validation error - probably empty cart
        showError('Please add items to your cart');
      } else if (err.status === 401) {
        // Not authenticated
        showError('Please sign in to checkout');
      } else if (err.status === 404) {
        // Not found - maybe product deleted
        showError('Some items in your cart are no longer available');
      } else if (err.status === 500) {
        // Server error
        showError('Something went wrong. Please try again later.');
      }
    }
  };

  return (
    <div>
      {error && (
        <ErrorAlert>
          {error}
          <button onClick={clearError}>Dismiss</button>
        </ErrorAlert>
      )}

      <button onClick={handleCheckoutClick}>Checkout</button>
    </div>
  );
}
`;

// ============================================================================
// EXAMPLE 8: Mobile-Optimized Checkout
// ============================================================================

export const EXAMPLE_8_MOBILE_CHECKOUT = `
'use client';

import styled from 'styled-components';
import CheckoutButton from '@/components/checkout/CheckoutButton';

const MobileContainer = styled.div\`
  max-width: 600px;
  margin: 0 auto;
  padding-bottom: 100px; // Space for fixed button
\`;

const FixedCheckoutBar = styled.div\`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  padding: 12px 20px;
  border-top: 1px solid #e5e7eb;
  box-shadow: 0 -2px 8px rgba(0,0,0,0.1);
  z-index: 100;

  @media (min-width: 769px) {
    display: none;
  }
\`;

export default function MobileCheckout() {
  return (
    <>
      <MobileContainer>
        {/* Cart items and summary */}
        <h1>Your Cart</h1>
        {/* Items list... */}
      </MobileContainer>

      {/* Sticky checkout button at bottom */}
      <FixedCheckoutBar>
        <CheckoutButton
          fullWidth
          label="Checkout - \\$99.99"
        />
      </FixedCheckoutBar>
    </>
  );
}
`;

export default {
  EXAMPLE_1_CART_PAGE,
  EXAMPLE_2_WITH_AFFILIATE_TRACKING,
  EXAMPLE_3_MANUAL_FLOW,
  EXAMPLE_4_QUICK_CHECKOUT_FROM_PRODUCT,
  EXAMPLE_5_SUCCESS_PAGE,
  EXAMPLE_6_MULTI_STEP_CHECKOUT,
  EXAMPLE_7_ERROR_HANDLING,
  EXAMPLE_8_MOBILE_CHECKOUT,
};
