'use client';

/**
 * Checkout Custom Hooks
 * React hooks for checkout operations
 * 
 * Usage:
 * - useCheckout() - Get all checkout state and actions
 * - useCreateCheckoutSession() - Trigger checkout creation
 * - useCheckoutSession() - Get current session
 * - useCheckoutOrder() - Get completed order
 */

import { useCallback } from 'react';
import { useRouter } from 'next/navigation';
import useCheckoutStore, {
  useCheckoutSession as selectCheckoutSession,
  useCheckoutOrder as selectCheckoutOrder,
  useCheckoutLoading as selectCheckoutLoading,
  useCheckoutError as selectCheckoutError,
  useCheckoutStatus as selectCheckoutStatus,
} from '@/stores/checkoutStore';
import { useToast } from '@/components/ui/Toast';

/**
 * Main checkout hook - provides all checkout functionality
 * 
 * @returns {Object} Checkout state and actions
 */
export function useCheckout() {
  const router = useRouter();
  const { success, error: showError } = useToast();

  // Get all state
  const session = selectCheckoutSession();
  const order = selectCheckoutOrder();
  const loading = selectCheckoutLoading();
  const { error, errorDetails } = selectCheckoutError();
  const status = selectCheckoutStatus();

  // Handle checkout initiation
  const handleCheckout = useCallback(
    async (affiliateId = null) => {
      try {
        console.log('🛒 Initiating checkout...');
        useCheckoutStore.setState({ isCreatingSession: true });

        const sessionData = await useCheckoutStore
          .getState()
          .createCheckoutSession({ affiliateId });

        // Mark as redirected
        useCheckoutStore.setState({ 
          session: {
            ...useCheckoutStore.getState().session,
            status: 'redirected'
          },
          isRedirected: true
        });

        // Redirect to Stripe
        console.log('➡️  Redirecting to Stripe Checkout...');
        window.location.href = sessionData.url;
      } catch (err) {
        console.error('❌ Checkout failed:', err.message);
        showError(err.message || 'Failed to start checkout');
      }
    },
    [showError]
  );

  // Handle success redirect
  const handleSuccessRedirect = useCallback(
    async (sessionId) => {
      try {
        console.log('✅ Handling checkout success...');
        useCheckoutStore.setState({ isVerifyingSession: true });

        // Verify session on backend
        const session = await useCheckoutStore
          .getState()
          .verifyCheckoutSession(sessionId);

        console.log('🎉 Checkout verified! Session:', session);
        success('Payment successful! Your order is being processed...');

        return session;
      } catch (err) {
        console.error('❌ Verification failed:', err.message);
        showError(err.message || 'Failed to verify payment');
        throw err;
      }
    },
    [success, showError]
  );

  // Handle cancel
  const handleCancel = useCallback(() => {
    console.log('❌ Checkout canceled');
    useCheckoutStore.getState().handleCancel();
    showError('Checkout was canceled. Your cart is still saved.');
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    useCheckoutStore.getState().clearError();
  }, []);

  // Reset checkout
  const resetCheckout = useCallback(() => {
    useCheckoutStore.getState().reset();
  }, []);

  return {
    // State
    session,
    order,
    status,
    loading,
    error,
    errorDetails,

    // Actions
    handleCheckout,
    handleSuccessRedirect,
    handleCancel,
    clearError,
    resetCheckout,
  };
}

/**
 * Hook to initiate checkout
 * 
 * @returns {Object} { handleCheckout, isLoading, error }
 * 
 * @example
 * const { handleCheckout, isLoading, error } = useCreateCheckoutSession();
 * 
 * return (
 *   <button onClick={() => handleCheckout(affiliateId)} disabled={isLoading}>
 *     {isLoading ? 'Creating...' : 'Checkout'}
 *   </button>
 * );
 */
export function useCreateCheckoutSession() {
  const { handleCheckout, loading, error } = useCheckout();

  return {
    handleCheckout,
    isLoading: loading.isCreatingSession,
    error,
  };
}

/**
 * Hook to get checkout session
 * 
 * @returns {Object} Session data
 */
export function useCheckoutSessionData() {
  return selectCheckoutSession();
}

/**
 * Hook to get completed order
 * 
 * @returns {Object} Order data
 */
export function useCheckoutOrderData() {
  return selectCheckoutOrder();
}

/**
 * Hook for verifying session after redirect
 * 
 * @returns {Object} { verifySession, isVerifying, error }
 */
export function useVerifyCheckoutSession() {
  const { handleSuccessRedirect, loading, error } = useCheckout();

  return {
    verifySession: handleSuccessRedirect,
    isVerifying: loading.isVerifyingSession,
    error,
  };
}

/**
 * Hook for checking checkout status
 * 
 * @returns {string} Current status: 'created', 'redirected', 'completed', 'canceled', null
 */
export function useCheckoutStatusCheck() {
  return selectCheckoutStatus();
}

/**
 * Hook for loading states
 * 
 * @returns {Object} { isCreatingSession, isVerifyingSession, isProcessing }
 */
export function useCheckoutLoadingStates() {
  return selectCheckoutLoading();
}

/**
 * Hook for error state
 * 
 * @returns {Object} { error, errorDetails }
 */
export function useCheckoutErrors() {
  return selectCheckoutError();
}

/**
 * Hook for affiliate tracking during checkout
 * 
 * @returns {Object} { getAffiliateId, setAffiliateId }
 */
export function useCheckoutAffiliateTracking() {
  const getAffiliateId = useCallback(() => {
    console.log('🔍 [CHECKOUT AFFILIATE] getAffiliateId() called - reading cookie...');
    console.log('🔍 [CHECKOUT AFFILIATE] document.cookie exists:', !!document.cookie);
    console.log('🔍 [CHECKOUT AFFILIATE] document.cookie value:', document.cookie);
    
    try {
      // Try to get from cookie
      const cookies = document.cookie.split(';');
      console.log('🔍 [CHECKOUT AFFILIATE] Total cookies:', cookies.length);
      
      for (let i = 0; i < cookies.length; i++) {
        const cookie = cookies[i];
        const [name, value] = cookie.trim().split('=');
        console.log(`🔍 [CHECKOUT AFFILIATE] Cookie ${i}: name="${name}", hasValue=${!!value}`);
        
        if (name === 'affiliate_ref') {
          console.log('✅ [CHECKOUT AFFILIATE] FOUND affiliate_ref cookie!');
          console.log('✅ [CHECKOUT AFFILIATE] Raw value:', value?.substring(0, 50));
          const decoded = JSON.parse(decodeURIComponent(value));
          console.log('✅ [CHECKOUT AFFILIATE] Decoded:', {
            affiliateId: decoded.affiliateId ? '✓ Present' : '✗ Missing',
            visitorId: decoded.visitorId ? '✓ Present' : '✗ Missing',
            fullAffiliateId: decoded.affiliateId,
          });
          return decoded.affiliateId;
        }
      }
      console.warn('⚠️  [CHECKOUT AFFILIATE] No affiliate_ref cookie found after checking all cookies');
      return null;
    } catch (e) {
      console.error('❌ [CHECKOUT AFFILIATE] Error parsing cookie:', e.message, e.stack);
      return null;
    }
  }, []);

  const setAffiliateId = useCallback((affiliateId) => {
    if (affiliateId) {
      const affiliateData = {
        affiliateId,
        timestamp: Date.now(),
      };
      document.cookie = `affiliate_ref=${encodeURIComponent(
        JSON.stringify(affiliateData)
      )}; path=/; max-age=${30 * 24 * 60 * 60}`; // 30 days
    }
  }, []);

  return {
    getAffiliateId,
    setAffiliateId,
  };
}

export default useCheckout;
