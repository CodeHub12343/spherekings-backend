/**
 * Cart Service
 * Handles all cart-related API calls to the backend
 * Manages shopping cart operations: add, update, remove, clear, and validation
 */

import client from '@/api/client';

// API endpoints
const CART_ENDPOINTS = {
  GET: '/cart',
  ADD: '/cart/add',
  UPDATE: '/cart/update',
  REMOVE: '/cart/remove',
  CLEAR: '/cart/clear',
  SUMMARY: '/cart/summary',
  VALIDATE: '/cart/validate',
};

/**
 * Get user's shopping cart
 * @returns {Promise} Cart data with items and summary
 */
export const getCart = async () => {
  try {
    console.log('📤 GET Cart');

    const response = await client.get(CART_ENDPOINTS.GET);

    console.log('✅ GET Cart Success:', {
      status: response.status,
      itemsCount: response.data?.data?.items?.length || 0,
      summary: response.data?.data?.summary,
    });

    return response.data?.data || response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendResponse = error.response?.data;

    console.error('❌ Get cart error:', {
      status,
      message: backendResponse?.message || error.message,
      errors: backendResponse?.errors,
    });

    throw error;
  }
};

/**
 * Add product to cart
 * If product with same variant already exists, quantity is increased
 * @param {string} productId - Product ID to add
 * @param {number} quantity - Quantity (1-1000)
 * @param {Object} variant - Optional variant selection (e.g., { color: 'red', size: 'M' })
 * @returns {Promise} Updated cart
 */
export const addToCart = async (productId, quantity = 1, variant = {}) => {
  try {
    console.log('📤 Add to Cart:', {
      productId,
      quantity,
      hasVariant: Object.keys(variant).length > 0,
    });

    const payload = {
      productId,
      quantity,
      variant: Object.keys(variant).length > 0 ? variant : undefined,
    };

    const response = await client.post(CART_ENDPOINTS.ADD, payload);

    console.log('✅ Add to Cart Success:', {
      status: response.status,
      itemsCount: response.data?.data?.items?.length || 0,
    });

    return response.data?.data || response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendResponse = error.response?.data;

    let errorMessage = 'Failed to add product to cart';

    if (status === 400) {
      errorMessage = backendResponse?.message || 'Invalid product or quantity';
    } else if (status === 404) {
      errorMessage = 'Product not found';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    }

    console.error('❌ Add to cart error:', {
      status,
      message: errorMessage,
      errors: backendResponse?.errors,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Update cart item (quantity or variant)
 * @param {string} cartItemId - Cart item ID (from cart.items[].id)
 * @param {Object} updates - Updates object { quantity?, variant? }
 * @returns {Promise} Updated cart
 */
export const updateCartItem = async (cartItemId, updates = {}) => {
  try {
    const { quantity, variant } = updates;

    console.log('📤 Update Cart Item:', {
      cartItemId,
      quantity,
      hasVariant: variant && Object.keys(variant).length > 0,
    });

    const payload = {
      cartItemId,
      ...(quantity !== undefined && { quantity }),
      ...(variant && Object.keys(variant).length > 0 && { variant }),
    };

    const response = await client.post(CART_ENDPOINTS.UPDATE, payload);

    console.log('✅ Update Cart Item Success:', {
      status: response.status,
      itemsCount: response.data?.data?.items?.length || 0,
    });

    return response.data?.data || response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendResponse = error.response?.data;

    let errorMessage = 'Failed to update cart item';

    if (status === 400) {
      errorMessage = backendResponse?.message || 'Invalid quantity or variant';
    } else if (status === 404) {
      errorMessage = 'Cart item not found';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    }

    console.error('❌ Update cart item error:', {
      status,
      message: errorMessage,
      errors: backendResponse?.errors,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Remove item from cart
 * @param {string} cartItemId - Cart item ID to remove
 * @returns {Promise} Updated cart
 */
export const removeFromCart = async (cartItemId) => {
  try {
    console.log('📤 Remove from Cart:', { cartItemId });

    const response = await client.post(CART_ENDPOINTS.REMOVE, { cartItemId });

    console.log('✅ Remove from Cart Success:', {
      status: response.status,
      itemsCount: response.data?.data?.items?.length || 0,
    });

    return response.data?.data || response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendResponse = error.response?.data;

    let errorMessage = 'Failed to remove item from cart';

    if (status === 404) {
      errorMessage = 'Cart item not found';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    }

    console.error('❌ Remove from cart error:', {
      status,
      message: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Clear all items from cart
 * @returns {Promise} Empty cart
 */
export const clearCart = async () => {
  try {
    console.log('📤 Clear Cart');

    const response = await client.post(CART_ENDPOINTS.CLEAR);

    console.log('✅ Clear Cart Success', {
      status: response.status,
    });

    return response.data?.data || response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendResponse = error.response?.data;

    let errorMessage = 'Failed to clear cart';

    if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    }

    console.error('❌ Clear cart error:', {
      status,
      message: errorMessage,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Get cart summary (lightweight version)
 * @returns {Promise} Cart summary with totals
 */
export const getCartSummary = async () => {
  try {
    console.log('📤 GET Cart Summary');

    const response = await client.get(CART_ENDPOINTS.SUMMARY);

    console.log('✅ GET Cart Summary Success:', {
      status: response.status,
      summary: response.data?.data,
    });

    return response.data?.data || response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendResponse = error.response?.data;

    console.error('❌ Get cart summary error:', {
      status,
      message: backendResponse?.message || error.message,
    });

    throw error;
  }
};

/**
 * Validate cart before checkout
 * Checks all items are still available, in stock, and prices haven't changed
 * @returns {Promise} Validation result with any issues
 */
export const validateCart = async () => {
  try {
    console.log('📤 Validate Cart');

    const response = await client.post(CART_ENDPOINTS.VALIDATE);

    console.log('✅ Validate Cart Success:', {
      status: response.status,
      isValid: response.data?.data?.valid,
      issuesCount: response.data?.data?.issues?.length || 0,
    });

    return response.data?.data || response.data;
  } catch (error) {
    const status = error.response?.status;
    const backendResponse = error.response?.data;

    let errorMessage = 'Failed to validate cart';

    if (status === 400) {
      errorMessage = backendResponse?.message || 'Cart validation failed';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    }

    console.error('❌ Validate cart error:', {
      status,
      message: errorMessage,
      errors: backendResponse?.errors,
    });

    throw new Error(errorMessage);
  }
};

/**
 * Export all cart service methods
 */
export const cartService = {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartSummary,
  validateCart,
};

export default cartService;
