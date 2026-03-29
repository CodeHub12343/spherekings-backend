/**
 * Checkout Store
 * Zustand store for managing checkout state
 * 
 * State structure:
 * - session: Current Stripe checkout session
 * - loading: Loading states for different operations
 * - error: Checkout error messages
 * - order: Order data after successful payment
 * - shippingAddress: Collected shipping address for order
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import checkoutService from '@/api/services/checkoutService';
import { defaultShippingAddress } from '@/validations/shippingSchema';

const initialState = {
  // Checkout session data
  session: {
    id: null,
    url: null,
    metadata: null,
    status: null, // 'created', 'redirected', 'completed', 'canceled'
  },

  // Shipping address (collected before Stripe)
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

  // Loading states
  isCreatingSession: false,
  isVerifyingSession: false,
  isProcessing: false,

  // Error state
  error: null,
  errorDetails: null,

  // Redirect state
  isRedirected: false,
  redirectUrl: null,
};

export const useCheckoutStore = create(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // Actions
      /**
       * Start checkout session creation
       */
      startCreatingSession: () => {
        set(() => ({
          isCreatingSession: true,
          error: null,
          errorDetails: null,
        }));
      },

      /**
       * Create checkout session
       * 
       * @param {Object} options - Checkout options
       * @param {string} options.affiliateId - Optional affiliate ID
       * @returns {Promise<Object>} Created session
       */
      createCheckoutSession: async (options = {}) => {
        set((state) => ({
          ...state,
          isCreatingSession: true,
          error: null,
          errorDetails: null,
        }));

        try {
          console.log('📦 Store: Creating checkout session...');
          // Include shipping address in checkout session creation
          const sessionData = await checkoutService.createCheckoutSession({
            ...options,
            shippingAddress: get().shippingAddress, // Include shipping from store
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

          set((state) => ({
            ...state,
            isCreatingSession: false,
            error: error.message,
            errorDetails: error.details,
          }));

          throw error;
        }
      },

      /**
       * Mark checkout as redirected to Stripe
       */
      markAsRedirected: () => {
        set((state) => ({
          ...state,
          session: {
            ...state.session,
            status: 'redirected',
          },
          isRedirected: true,
        }));
      },

      /**
       * Verify checkout session after redirect
       * 
       * @param {string} sessionId - Stripe session ID from URL
       * @returns {Promise<Object>} Verified session
       */
      verifyCheckoutSession: async (sessionId) => {
        set((state) => ({
          ...state,
          isVerifyingSession: true,
          error: null,
          errorDetails: null,
        }));

        try {
          console.log('🔐 Store: Verifying session...');
          const session = await checkoutService.verifyCheckoutSession(sessionId);

          set((state) => ({
            ...state,
            session: {
              ...state.session,
              id: session.id,
              status: 'completed',
            },
            isVerifyingSession: false,
          }));

          return session;
        } catch (error) {
          console.error('❌ Store: Verification failed:', error.message);

          set((state) => ({
            ...state,
            isVerifyingSession: false,
            error: error.message,
            errorDetails: error.details,
          }));

          throw error;
        }
      },

      /**
       * Set order data after successful payment
       * 
       * @param {Object} orderData - Order information
       */
      setOrderData: (orderData) => {
        set((state) => ({
          ...state,
          order: {
            id: orderData.id,
            number: orderData.orderNumber,
            items: orderData.items || [],
            totals: {
              subtotal: orderData.subtotal || 0,
              tax: orderData.tax || 0,
              total: orderData.total || 0,
            },
            paymentStatus: orderData.paymentStatus,
          },
        }));
      },

      /**
       * Handle checkout cancel
       */
      handleCancel: () => {
        set((state) => ({
          ...state,
          session: {
            ...state.session,
            status: 'canceled',
          },
          error: 'Checkout was canceled',
        }));
      },

      /**
       * Clear error
       */
      clearError: () => {
        set((state) => ({
          ...state,
          error: null,
          errorDetails: null,
        }));
      },

      /**
       * Set shipping address
       * 
       * @param {Object} address - Shipping address object
       */
      setShippingAddress: (address) => {
        set((state) => ({
          ...state,
          shippingAddress: address,
        }));
      },

      /**
       * Update a single field in shipping address
       * 
       * @param {string} fieldName - Name of field to update
       * @param {any} value - New value for field
       */
      updateShippingField: (fieldName, value) => {
        set((state) => ({
          ...state,
          shippingAddress: {
            ...state.shippingAddress,
            [fieldName]: value,
          },
        }));
      },

      /**
       * Clear shipping address (reset to default empty state)
       */
      clearShippingAddress: () => {
        set((state) => ({
          ...state,
          shippingAddress: { ...defaultShippingAddress },
        }));
      },

      /**
       * Reset checkout state (e.g., after successful order or for new checkout)
       */
      reset: () => {
        set(() => initialState);
      },

      /**
       * Reset only session (keep order data and shipping)
       */
      resetSession: () => {
        set((state) => ({
          ...state,
          session: initialState.session,
          isCreatingSession: false,
          isVerifyingSession: false,
          error: null,
          errorDetails: null,
          isRedirected: false,
          redirectUrl: null,
        }));
      },
    }),
    { name: 'checkout-store' }
  )
);

// Selectors for efficient re-rendering
export const useCheckoutSession = () =>
  useCheckoutStore((state) => state.session);

export const useCheckoutOrder = () =>
  useCheckoutStore((state) => state.order);

export const useCheckoutLoading = () =>
  useCheckoutStore(
    useShallow((state) => ({
      isCreatingSession: state.isCreatingSession,
      isVerifyingSession: state.isVerifyingSession,
      isProcessing: state.isProcessing,
    }))
  );

export const useCheckoutError = () =>
  useCheckoutStore(
    useShallow((state) => ({
      error: state.error,
      errorDetails: state.errorDetails,
    }))
  );

export const useCheckoutStatus = () =>
  useCheckoutStore((state) => state.session.status);

// Shipping address selectors
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

export default useCheckoutStore;
