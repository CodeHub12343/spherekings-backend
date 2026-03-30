/**
 * Cart Store
 * Zustand store for global cart state management
 * Handles cart data, loading states, and error handling
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import cartService from '@/api/services/cartService';

/**
 * Cart Store Structure:
 * - items: Array of cart items with product details
 * - summary: Cart totals (subtotal, tax, total, itemCount)
 * - loading: Loading states for operations
 * - error: Error state for failed operations
 * - validationIssues: Issues found during cart validation
 */
export const useCartStore = create(
  devtools(
    (set, get) => ({
      // State
      items: [],
      summary: {
        itemCount: 0,
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      },
      loading: {
        fetchingCart: false,
        addingToCart: false,
        updatingItem: false,
        removingItem: false,
        clearingCart: false,
        validatingCart: false,
      },
      error: null,
      validationIssues: null,

      // Actions
      /**
       * Fetch cart from backend
       */
      fetchCart: async () => {
        set((state) => ({
          loading: { ...state.loading, fetchingCart: true },
          error: null,
        }));

        try {
          const cartData = await cartService.getCart();
          set({
            items: cartData.items || [],
            summary: cartData.summary || {
              itemCount: 0,
              totalItems: 0,
              subtotal: 0,
              tax: 0,
              total: 0,
            },
            error: null,
          });
        } catch (error) {
          set({
            error: error.message || 'Failed to fetch cart',
          });
          throw error;
        } finally {
          set((state) => ({
            loading: { ...state.loading, fetchingCart: false },
          }));
        }
      },

      /**
       * Add product to cart
       */
      addToCart: async (productId, quantity = 1, variant = {}) => {
        set((state) => ({
          loading: { ...state.loading, addingToCart: true },
          error: null,
        }));

        try {
          const cartData = await cartService.addToCart(productId, quantity, variant);
          set({
            items: cartData.items || [],
            summary: cartData.summary || {},
            error: null,
          });
          return cartData;
        } catch (error) {
          set({
            error: error.message || 'Failed to add to cart',
          });
          throw error;
        } finally {
          set((state) => ({
            loading: { ...state.loading, addingToCart: false },
          }));
        }
      },

      /**
       * Update cart item (quantity or variant)
       */
      updateCartItem: async (cartItemId, updates = {}) => {
        set((state) => ({
          loading: { ...state.loading, updatingItem: true },
          error: null,
        }));

        try {
          const cartData = await cartService.updateCartItem(cartItemId, updates);
          set({
            items: cartData.items || [],
            summary: cartData.summary || {},
            error: null,
          });
          return cartData;
        } catch (error) {
          set({
            error: error.message || 'Failed to update cart item',
          });
          throw error;
        } finally {
          set((state) => ({
            loading: { ...state.loading, updatingItem: false },
          }));
        }
      },

      /**
       * Remove item from cart
       */
      removeFromCart: async (cartItemId) => {
        set((state) => ({
          loading: { ...state.loading, removingItem: true },
          error: null,
        }));

        try {
          const cartData = await cartService.removeFromCart(cartItemId);
          set({
            items: cartData.items || [],
            summary: cartData.summary || {},
            error: null,
          });
          return cartData;
        } catch (error) {
          set({
            error: error.message || 'Failed to remove item from cart',
          });
          throw error;
        } finally {
          set((state) => ({
            loading: { ...state.loading, removingItem: false },
          }));
        }
      },

      /**
       * Clear entire cart
       */
      clearCart: async () => {
        set((state) => ({
          loading: { ...state.loading, clearingCart: true },
          error: null,
        }));

        try {
          const cartData = await cartService.clearCart();
          set({
            items: [],
            summary: {
              itemCount: 0,
              totalItems: 0,
              subtotal: 0,
              tax: 0,
              total: 0,
            },
            error: null,
          });
          return cartData;
        } catch (error) {
          set({
            error: error.message || 'Failed to clear cart',
          });
          throw error;
        } finally {
          set((state) => ({
            loading: { ...state.loading, clearingCart: false },
          }));
        }
      },

      /**
       * Validate cart for checkout
       */
      validateCart: async () => {
        set((state) => ({
          loading: { ...state.loading, validatingCart: true },
          error: null,
        }));

        try {
          const result = await cartService.validateCart();

          if (result.issues && result.issues.length > 0) {
            set({
              validationIssues: result.issues,
            });

            // Refresh cart after validation to get updated prices/availability
            const cartData = await cartService.getCart();
            set({
              items: cartData.items || [],
              summary: cartData.summary || {},
            });

            return result;
          }

          set({
            validationIssues: null,
          });

          return result;
        } catch (error) {
          set({
            error: error.message || 'Failed to validate cart',
            validationIssues: null,
          });
          throw error;
        } finally {
          set((state) => ({
            loading: { ...state.loading, validatingCart: false },
          }));
        }
      },

      /**
       * Clear error state
       */
      clearError: () => {
        set({ error: null });
      },

      /**
       * Clear validation issues
       */
      clearValidationIssues: () => {
        set({ validationIssues: null });
      },

      /**
       * Optimistically update item (useful for UI responsiveness)
       * This updates the local state immediately, then syncs with server
       */
      optimisticUpdateItem: (cartItemId, updates = {}) => {
        const { items } = get();
        const updatedItems = items.map((item) => {
          if (item._id === cartItemId) {
            return {
              ...item,
              ...(updates.quantity !== undefined && { quantity: updates.quantity }),
              ...(updates.variant && { variant: updates.variant }),
            };
          }
          return item;
        });

        const summary = calculateCartSummary(updatedItems);
        set({
          items: updatedItems,
          summary,
        });
      },

      /**
       * Get cart total item count
       */
      getItemCount: () => {
        const { items } = get();
        return items.reduce((total, item) => total + item.quantity, 0);
      },

      /**
       * Get specific cart item by ID
       */
      getCartItem: (cartItemId) => {
        const { items } = get();
        return items.find((item) => item._id === cartItemId);
      },

      /**
       * Check if product is in cart
       */
      isProductInCart: (productId) => {
        const { items } = get();
        return items.some((item) => item.productId === productId);
      },

      /**
       * Get product quantity in cart
       */
      getProductQuantity: (productId) => {
        const { items } = get();
        const item = items.find((item) => item.productId === productId);
        return item ? item.quantity : 0;
      },
    }),
    { name: 'cartStore' }
  )
);

/**
 * Helper function to calculate cart summary from items
 */
function calculateCartSummary(items) {
  let subtotal = 0;
  let totalItems = 0;

  // Guard against undefined or null items
  if (!items || !Array.isArray(items)) {
    return {
      itemCount: 0,
      totalItems: 0,
      subtotal: 0,
      tax: 0,
      total: 0,
    };
  }

  items.forEach((item) => {
    subtotal += (item.price || 0) * (item.quantity || 0);
    totalItems += item.quantity || 0;
  });

  // Calculate tax (assuming 10% tax rate - adjust as needed)
  const taxRate = 0.1;
  const tax = subtotal * taxRate;
  const total = subtotal + tax;

  return {
    itemCount: items.length,
    totalItems,
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax: parseFloat(tax.toFixed(2)),
    total: parseFloat(total.toFixed(2)),
  };
}

/**
 * Selectors for common cart queries
 */
export const selectCartItems = (state) => state.items || [];
export const selectCartSummary = (state) => state.summary;
export const selectCartLoading = (state) => state.loading;
export const selectCartError = (state) => state.error;
export const selectValidationIssues = (state) => state.validationIssues;
export const selectCartIsEmpty = (state) => !state.items || state.items.length === 0;
export const selectItemCount = (state) => state.getItemCount();
export const selectCartTotal = (state) => state.summary.total;

export default useCartStore;
