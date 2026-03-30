'use client';

/**
 * Cart Hooks
 * Custom React hooks for cart operations
 * Provides convenient API for components to interact with cart store
 */

import { useCallback } from 'react';
import { useShallow } from 'zustand/react/shallow';
import useCartStore from '@/stores/cartStore';

/**
 * Hook: Get cart items
 */
export const useCartItems = () => {
  return useCartStore(useShallow((state) => state.items));
};

/**
 * Hook: Get cart summary (totals)
 */
export const useCartSummary = () => {
  return useCartStore(useShallow((state) => state.summary));
};

/**
 * Hook: Get cart loading states
 */
export const useCartLoading = () => {
  return useCartStore(useShallow((state) => state.loading));
};

/**
 * Hook: Get cart error
 */
export const useCartError = () => {
  return useCartStore((state) => state.error);
};

/**
 * Hook: Get validation issues
 */
export const useValidationIssues = () => {
  return useCartStore((state) => state.validationIssues);
};

/**
 * Hook: Check if cart is empty
 */
export const useIsCartEmpty = () => {
  return useCartStore((state) => state.items.length === 0);
};

/**
 * Hook: Get cart item count
 */
export const useCartItemCount = () => {
  return useCartStore((state) => state.getItemCount());
};

/**
 * Hook: Get cart total
 */
export const useCartTotal = () => {
  return useCartStore((state) => state.summary.total);
};

/**
 * Hook: Fetch cart on mount
 * @returns {Object} - Cart data and fetch function
 */
export const useFetchCart = () => {
  const items = useCartItems();
  const summary = useCartSummary();
  const isLoading = useCartLoading().fetchingCart;
  const error = useCartError();
  const fetchCart = useCartStore((state) => state.fetchCart);

  return {
    items,
    summary,
    isLoading,
    error,
    fetchCart,
  };
};

/**
 * Hook: Add to cart with loading state
 * @returns {Object} - addToCart function and loading state
 */
export const useAddToCart = () => {
  const addToCart = useCartStore((state) => state.addToCart);
  const isLoading = useCartStore((state) => state.loading.addingToCart);
  const error = useCartError();

  const handleAddToCart = useCallback(
    async (productId, quantity = 1, variant = {}) => {
      return addToCart(productId, quantity, variant);
    },
    [addToCart]
  );

  return {
    addToCart: handleAddToCart,
    isLoading,
    error,
  };
};

/**
 * Hook: Update cart item
 * @returns {Object} - updateCartItem function and loading state
 */
export const useUpdateCartItem = () => {
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const isLoading = useCartStore((state) => state.loading.updatingItem);
  const error = useCartError();

  const handleUpdateCartItem = useCallback(
    async (cartItemId, updates = {}) => {
      return updateCartItem(cartItemId, updates);
    },
    [updateCartItem]
  );

  return {
    updateCartItem: handleUpdateCartItem,
    isLoading,
    error,
  };
};

/**
 * Hook: Remove from cart
 * @returns {Object} - removeFromCart function and loading state
 */
export const useRemoveFromCart = () => {
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const isLoading = useCartStore((state) => state.loading.removingItem);
  const error = useCartError();

  const handleRemoveFromCart = useCallback(
    async (cartItemId) => {
      return removeFromCart(cartItemId);
    },
    [removeFromCart]
  );

  return {
    removeFromCart: handleRemoveFromCart,
    isLoading,
    error,
  };
};

/**
 * Hook: Clear cart
 * @returns {Object} - clearCart function and loading state
 */
export const useClearCart = () => {
  const clearCart = useCartStore((state) => state.clearCart);
  const isLoading = useCartStore((state) => state.loading.clearingCart);
  const error = useCartError();

  const handleClearCart = useCallback(async () => {
    return clearCart();
  }, [clearCart]);

  return {
    clearCart: handleClearCart,
    isLoading,
    error,
  };
};

/**
 * Hook: Validate cart before checkout
 * @returns {Object} - validateCart function, loading state, and validation issues
 */
export const useValidateCart = () => {
  const validateCart = useCartStore((state) => state.validateCart);
  const isLoading = useCartStore((state) => state.loading.validatingCart);
  const error = useCartError();
  const validationIssues = useValidationIssues();
  const clearValidationIssues = useCartStore((state) => state.clearValidationIssues);

  const handleValidateCart = useCallback(async () => {
    return validateCart();
  }, [validateCart]);

  return {
    validateCart: handleValidateCart,
    isLoading,
    error,
    validationIssues,
    clearValidationIssues,
  };
};

/**
 * Hook: Check if product is in cart
 * @param {string} productId - Product ID to check
 * @returns {boolean} - Whether product is in cart
 */
export const useIsProductInCart = (productId) => {
  return useCartStore((state) => state.isProductInCart(productId));
};

/**
 * Hook: Get product quantity in cart
 * @param {string} productId - Product ID
 * @returns {number} - Quantity of product in cart
 */
export const useProductQuantityInCart = (productId) => {
  return useCartStore((state) => state.getProductQuantity(productId));
};

/**
 * Hook: Get specific cart item
 * @param {string} cartItemId - Cart item ID
 * @returns {Object|null} - Cart item or null
 */
export const useGetCartItem = (cartItemId) => {
  return useCartStore((state) => state.getCartItem(cartItemId));
};

/**
 * Hook: Clear cart error
 * @returns {Function} - Function to clear error
 */
export const useClearCartError = () => {
  return useCartStore((state) => state.clearError);
};

/**
 * Hook: Complete cart operations (add, update, remove)
 * Provides all cart actions in one hook
 * @returns {Object} - All cart actions and state
 */
export const useCart = () => {
  const items = useCartItems();
  const summary = useCartSummary();
  const loading = useCartLoading();
  const error = useCartError();
  const validationIssues = useValidationIssues();
  const isCartEmpty = useIsCartEmpty();
  const itemCount = useCartItemCount();

  const fetchCart = useCartStore((state) => state.fetchCart);
  const addToCart = useCartStore((state) => state.addToCart);
  const updateCartItem = useCartStore((state) => state.updateCartItem);
  const removeFromCart = useCartStore((state) => state.removeFromCart);
  const clearCart = useCartStore((state) => state.clearCart);
  const validateCart = useCartStore((state) => state.validateCart);
  const clearError = useCartStore((state) => state.clearError);
  const clearValidationIssues = useCartStore((state) => state.clearValidationIssues);

  return {
    // State
    items,
    summary,
    loading,
    error,
    validationIssues,
    isCartEmpty,
    itemCount,

    // Actions
    fetchCart: useCallback(fetchCart, [fetchCart]),
    addToCart: useCallback(
      (productId, quantity = 1, variant = {}) => addToCart(productId, quantity, variant),
      [addToCart]
    ),
    updateCartItem: useCallback(
      (cartItemId, updates = {}) => updateCartItem(cartItemId, updates),
      [updateCartItem]
    ),
    removeFromCart: useCallback((cartItemId) => removeFromCart(cartItemId), [removeFromCart]),
    clearCart: useCallback(clearCart, [clearCart]),
    validateCart: useCallback(validateCart, [validateCart]),
    clearError: useCallback(clearError, [clearError]),
    clearValidationIssues: useCallback(clearValidationIssues, [clearValidationIssues]),
  };
};
