/**
 * Checkout API Service
 * Handles all API calls to backend checkout endpoints
 * 
 * Endpoints:
 * - POST /api/v1/checkout/create-session - Create Stripe checkout session
 * - GET /api/v1/checkout/session/:sessionId - Get session details
 * - POST /api/v1/checkout/refund - Request refund
 */

import client from '@/api/client';

/**
 * Create a Stripe checkout session from user's cart
 * 
 * @param {Object} options - Configuration options
 * @param {string} options.affiliateId - Optional affiliate ID for referral tracking
 * @param {Object} options.metadata - Optional additional metadata
 * @returns {Promise<Object>} { sessionId, url }
 * 
 * @example
 * const result = await checkoutService.createCheckoutSession({
 *   affiliateId: 'aff_123456',
 * });
 * // Redirect to result.url
 * window.location.href = result.url;
 */
export async function createCheckoutSession(options = {}) {
  try {
    const { affiliateId, metadata, shippingAddress } = options;
    
    console.log('🛒 Creating checkout session...');
    console.log('📦 Shipping address:', shippingAddress);
    console.log('📦 Shipping address type:', typeof shippingAddress);
    console.log('📦 Shipping address is null:', shippingAddress === null);
    console.log('📦 Shipping address is undefined:', shippingAddress === undefined);
    
    const config = {
      ...(affiliateId && { params: { affiliateId } }),
    };
    
    const body = {
      ...(metadata && { metadata }),
      ...(shippingAddress && { shippingAddress }),
    };

    console.log('📨 Request body:', body);
    console.log('📨 Body keys:', Object.keys(body));
    console.log('📨 Body has shippingAddress:', 'shippingAddress' in body);
    
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
    console.error('❌ Error creating checkout session:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
      errors: error.response?.data?.errors,
    });
    
    // Extract meaningful error message
    const errorMessage =
      error.response?.data?.message ||
      error.response?.data?.errors?.message ||
      'Failed to create checkout session. Please try again.';
    
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    customError.details = error.response?.data?.errors;
    
    throw customError;
  }
}

/**
 * Get checkout session details
 * 
 * @param {string} sessionId - Stripe session ID
 * @returns {Promise<Object>} Session details including payment status
 * 
 * @example
 * const session = await checkoutService.getCheckoutSession('cs_test_...');
 * console.log(session.payment_status); // 'paid' or 'unpaid'
 */
export async function getCheckoutSession(sessionId) {
  try {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    console.log('🔍 Fetching checkout session:', sessionId);
    
    const response = await client.get(`/checkout/session/${sessionId}`);
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to get checkout session');
    }
    
    console.log('✅ Session retrieved:', {
      id: response.data.data.id,
      paymentStatus: response.data.data.payment_status,
    });
    
    return response.data.data;
  } catch (error) {
    console.error('❌ Error getting checkout session:', {
      sessionId,
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    });
    
    const errorMessage = error.response?.data?.message || error.message;
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    
    throw customError;
  }
}

/**
 * Verify checkout session by querying backend
 * 
 * Used after successful Stripe redirect to verify payment
 * 
 * @param {string} sessionId - Stripe session ID from URL
 * @returns {Promise<Object>} Verified session data
 */
export async function verifyCheckoutSession(sessionId) {
  try {
    console.log('🔐 Verifying checkout session...');
    const session = await getCheckoutSession(sessionId);
    
    if (session.payment_status !== 'paid') {
      throw new Error(
        `Payment not completed. Status: ${session.payment_status}`
      );
    }
    
    console.log('✅ Session verified - payment confirmed');
    return session;
  } catch (error) {
    console.error('❌ Session verification failed:', error.message);
    throw error;
  }
}

/**
 * Request refund for a payment
 * 
 * @param {Object} options - Refund options
 * @param {string} options.paymentIntentId - Stripe payment intent ID
 * @param {number} options.amount - Refund amount in cents (optional, full refund if not provided)
 * @param {string} options.reason - Refund reason (e.g., 'requested_by_customer')
 * @returns {Promise<Object>} Refund details
 * 
 * @example
 * const refund = await checkoutService.requestRefund({
 *   paymentIntentId: 'pi_1234567890',
 *   reason: 'requested_by_customer'
 * });
 */
export async function requestRefund(options = {}) {
  try {
    const { paymentIntentId, amount, reason } = options;
    
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
    }
    
    console.log('💰 Requesting refund...', {
      paymentIntentId,
      amount,
      reason,
    });
    
    const response = await client.post('/checkout/refund', {
      paymentIntentId,
      ...(amount && { amount }),
      ...(reason && { reason }),
    });
    
    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to process refund');
    }
    
    console.log('✅ Refund requested:', response.data.data);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error requesting refund:', {
      message: error.response?.data?.message || error.message,
      status: error.response?.status,
    });
    
    const errorMessage = error.response?.data?.message || error.message;
    const customError = new Error(errorMessage);
    customError.status = error.response?.status;
    
    throw customError;
  }
}

/**
 * Fetch order details by Stripe session ID
 * Used to display order confirmation on success page
 *
 * @param {string} sessionId - Stripe checkout session ID
 * @returns {Promise<Object>} Order details with all information
 *
 * @example
 * const order = await checkoutService.getOrderBySessionId('cs_test_...');
 * console.log(order.orderNumber); // ORD-20260317-656919
 */
export async function getOrderBySessionId(sessionId) {
  try {
    console.log('📦 [FRONTEND] Fetching order details for session:', sessionId);
    
    const response = await client.get(`/checkout/order/${sessionId}`);
    
    console.log('📨 [FRONTEND] API Response received:', {
      status: response.status,
      success: response.data?.success,
      hasData: !!response.data?.data,
      dataKeys: response.data?.data ? Object.keys(response.data.data) : [],
    });
    
    if (!response.data.success) {
      console.error('❌ [FRONTEND] API returned success=false');
      throw new Error('Failed to fetch order details');
    }
    
    const orderData = response.data.data;
    console.log('✅ [FRONTEND] Order data extraction:', {
      orderNumber: orderData?.orderNumber,
      total: orderData?.total,
      subtotal: orderData?.subtotal,
      tax: orderData?.tax,
      itemCount: orderData?.items?.length,
      paymentStatus: orderData?.paymentStatus,
    });
    
    return orderData;
  } catch (error) {
    console.error('❌ [FRONTEND] Error fetching order:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      sessionId,
    });
    throw error;
  }
}

export default {
  createCheckoutSession,
  getCheckoutSession,
  verifyCheckoutSession,
  requestRefund,
  getOrderBySessionId,
};
