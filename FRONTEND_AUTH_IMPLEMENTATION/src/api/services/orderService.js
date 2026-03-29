/**
 * Order API Service
 * Handles all API calls to backend order endpoints
 * 
 * Endpoints:
 * - GET /api/v1/orders - Get user's orders
 * - GET /api/v1/orders/:id - Get order details
 * - GET /api/v1/orders/summary - Get order summary
 * - POST /api/v1/orders/search - Search orders
 * - GET /api/v1/orders/:id/invoice - Get invoice
 * - GET /api/v1/affiliate/orders - Get affiliate orders
 * - GET /api/v1/admin/orders - Get all orders (admin)
 * - PUT /api/v1/admin/orders/:id/status - Update order status (admin)
 */

import client from '@/api/client';

/**
 * Get authenticated user's orders
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number (default: 1)
 * @param {number} options.limit - Items per page (default: 10, max: 100)
 * @param {string} options.status - Filter by order status
 * @param {string} options.paymentStatus - Filter by payment status
 * @param {string} options.dateFrom - ISO date start
 * @param {string} options.dateTo - ISO date end
 * @param {number} options.minAmount - Minimum order amount
 * @param {number} options.maxAmount - Maximum order amount
 * @param {string} options.sortBy - Sort field (createdAt, total, status)
 * @param {string} options.sortOrder - Sort direction (asc, desc)
 * @returns {Promise<Object>} { orders, pagination }
 */
export async function getUserOrders(options = {}) {
  try {
    console.log('📦 Fetching user orders...', options);

    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);
    if (options.status) params.append('status', options.status);
    if (options.paymentStatus) params.append('paymentStatus', options.paymentStatus);
    if (options.dateFrom) params.append('dateFrom', options.dateFrom);
    if (options.dateTo) params.append('dateTo', options.dateTo);
    if (options.minAmount) params.append('minAmount', options.minAmount);
    if (options.maxAmount) params.append('maxAmount', options.maxAmount);
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);

    const response = await client.get(
      `/orders?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }

    console.log('✅ Orders fetched:', {
      count: response.data.data.orders.length,
      pagination: response.data.data.pagination,
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching orders:', error.message);
    throw error;
  }
}

/**
 * Get order details by ID
 * 
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export async function getOrderById(orderId) {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('🔍 Fetching order details:', orderId);

    const response = await client.get(`/orders/${orderId}`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Order not found');
    }

    console.log('✅ Order retrieved:', response.data.data.order._id);
    return response.data.data.order;
  } catch (error) {
    console.error('❌ Error fetching order:', error.message);
    throw error;
  }
}

/**
 * Get order summary statistics
 * 
 * @returns {Promise<Object>} { totalOrders, totalSpent, averageOrder, lastOrderDate, pendingOrders }
 */
export async function getOrderSummary() {
  try {
    console.log('📊 Fetching order summary...');

    const response = await client.get('/orders/summary');

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch summary');
    }

    console.log('✅ Summary retrieved:', response.data.data.summary);
    return response.data.data.summary;
  } catch (error) {
    console.error('❌ Error fetching summary:', error.message);
    throw error;
  }
}

/**
 * Search user's orders
 * 
 * @param {Object} criteria - Search criteria
 * @param {string} criteria.orderNumber - Order number
 * @param {string} criteria.status - Order status
 * @param {string} criteria.dateFrom - Date from
 * @param {string} criteria.dateTo - Date to
 * @param {number} criteria.minAmount - Min amount
 * @param {number} criteria.maxAmount - Max amount
 * @returns {Promise<Object>} { orders, pagination }
 */
export async function searchOrders(criteria = {}) {
  try {
    console.log('🔎 Searching orders...', criteria);

    const response = await client.post('/orders/search', criteria);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Search failed');
    }

    console.log('✅ Search completed:', response.data.data.orders.length);
    return response.data.data;
  } catch (error) {
    console.error('❌ Error searching orders:', error.message);
    throw error;
  }
}

/**
 * Get order invoice
 * 
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Invoice data
 */
export async function getOrderInvoice(orderId) {
  try {
    if (!orderId) {
      throw new Error('Order ID is required');
    }

    console.log('📄 Fetching invoice:', orderId);

    const response = await client.get(`/orders/${orderId}/invoice`);

    if (!response.data.success) {
      throw new Error(response.data.message || 'Invoice not found');
    }

    console.log('✅ Invoice retrieved');
    return response.data.data.invoice;
  } catch (error) {
    console.error('❌ Error fetching invoice:', error.message);
    throw error;
  }
}

/**
 * Get affiliate's referred orders with commission stats
 * 
 * @param {Object} options - Options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @returns {Promise<Object>} { orders, pagination, statistics }
 */
export async function getAffiliateOrders(options = {}) {
  try {
    console.log('💼 Fetching affiliate orders...');

    const params = new URLSearchParams();
    if (options.page) params.append('page', options.page);
    if (options.limit) params.append('limit', options.limit);

    const response = await client.get(
      `/affiliate/orders?${params.toString()}`
    );

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch affiliate orders');
    }

    console.log('✅ Affiliate orders retrieved:', {
      orders: response.data.data.orders.length,
      stats: response.data.data.statistics,
    });

    return response.data.data;
  } catch (error) {
    console.error('❌ Error fetching affiliate orders:', error.message);
    throw error;
  }
}

/**
 * Get all orders (admin only)
 * 
 * @param {Object} options - Filter and pagination options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by status
 * @param {string} options.paymentStatus - Filter by payment status
 * @param {string} options.userId - Filter by user ID
 * @param {string} options.affiliateId - Filter by affiliate ID
 * @param {string} options.dateFrom - Date from
 * @param {string} options.dateTo - Date to
 * @param {string} options.search - Search by order number or user
 * @param {string} options.sortBy - Sort field
 * @param {string} options.sortOrder - Sort direction
 * @returns {Promise<Object>} { orders, pagination, statistics }
 */
export async function getAdminOrders(options = {}) {
  try {
    console.log('⚙️ Fetching admin orders with options:', options);

    const params = new URLSearchParams();
    Object.entries(options).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const response = await client.get(
      `/admin/orders?${params.toString()}`
    );

    console.log('📨 Raw API response:', {
      success: response.data.success,
      hasData: !!response.data.data,
      hasStatistics: !!response.data.statistics,
      dataCount: response.data.data?.length,
      statisticsKeys: response.data.statistics ? Object.keys(response.data.statistics) : [],
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to fetch orders');
    }

    // Extract from backend response structure: { success, data: [], statistics: {...}, pagination: {...} }
    const orders = response.data.data || [];
    const statistics = response.data.statistics || {};
    const pagination = response.data.pagination || {};

    console.log('✅ Admin orders retrieved:', {
      ordersCount: orders.length,
      ordersCountFromStats: statistics.ordersCount,
      stats: statistics,
      pagination,
    });

    return {
      orders,
      statistics,
      pagination,
    };
  } catch (error) {
    console.error('❌ Error fetching admin orders:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
    });
    throw error;
  }
}

/**
 * Update order status (admin only)
 * 
 * @param {string} orderId - Order ID
 * @param {string} status - New status (pending, processing, confirmed, shipped, delivered, cancelled, refunded, returned)
 * @param {string} reason - Reason for status change
 * @returns {Promise<Object>} Updated order
 */
export async function updateOrderStatus(orderId, status, reason = '') {
  try {
    if (!orderId || !status) {
      throw new Error('Order ID and status are required');
    }

    console.log('🔄 Updating order status:', { orderId, status, reason });

    const response = await client.put(`/orders/admin/orders/${orderId}/status`, {
      status,
      ...(reason && { reason }),
    });

    if (!response.data.success) {
      throw new Error(response.data.message || 'Failed to update status');
    }

    console.log('✅ Order status updated:', status);
    return response.data.data.order;
  } catch (error) {
    console.error('❌ Error updating order status:', error.message);
    throw error;
  }
}

export default {
  getUserOrders,
  getOrderById,
  getOrderSummary,
  searchOrders,
  getOrderInvoice,
  getAffiliateOrders,
  getAdminOrders,
  updateOrderStatus,
};
