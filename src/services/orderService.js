/**
 * Order Service Layer
 * Business logic for orders: retrieval, filtering, pagination, status updates
 */

const Order = require('../models/Order');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

const DEFAULT_PAGE = 1;
const DEFAULT_LIMIT = 10;
const MAX_LIMIT = 100;

class OrderService {
  /**
   * Get authenticated user's orders with pagination and filtering
   *
   * @param {string} userId - User ID from JWT
   * @param {Object} filters - Filter options
   *   - status: Order status filter (pending, processing, shipped, etc.)
   *   - dateFrom, dateTo: ISO date strings for date range
   *   - minAmount, maxAmount: Price range filtering
   * @param {Object} pagination - Pagination options
   *   - page: Page number (default 1)
   *   - limit: Items per page (default 10, max 100)
   *   - sortBy: Sort field (createdAt, total, status)
   *   - sortOrder: 'asc' or 'desc' (default 'desc')
   * @returns {Promise<Object>} { orders, pagination metadata }
   */
  async getUserOrders(userId, filters = {}, pagination = {}) {
    try {
      // Validate and set pagination defaults
      const page = Math.max(1, parseInt(pagination.page) || DEFAULT_PAGE);
      let limit = parseInt(pagination.limit) || DEFAULT_LIMIT;
      limit = Math.min(limit, MAX_LIMIT); // Cap at MAX_LIMIT

      const skip = (page - 1) * limit;

      // Build filter query
      const query = { userId };

      // Status filter
      if (filters.status) {
        query.orderStatus = filters.status;
      }

      // Payment status filter
      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      // Price range filter
      if (filters.minAmount || filters.maxAmount) {
        query.total = {};
        if (filters.minAmount) {
          query.total.$gte = parseFloat(filters.minAmount);
        }
        if (filters.maxAmount) {
          query.total.$lte = parseFloat(filters.maxAmount);
        }
      }

      // Build sort option
      const sortBy = pagination.sortBy || 'createdAt';
      const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortOrder };

      // Execute query
      const orders = await Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .select(
          'orderNumber items total paymentStatus orderStatus affiliateDetails createdAt updatedAt'
        )
        .populate('userId', 'name email')
        .populate('items.productId', 'name')
        .populate('affiliateDetails.affiliateId', 'name');

      // Get total count for pagination metadata
      const totalOrders = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / limit);

      return {
        orders,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: totalOrders,
          totalPages,
          hasMore: page < totalPages,
        },
      };
    } catch (error) {
      throw new Error(`Failed to retrieve user orders: ${error.message}`);
    }
  }

  /**
   * Get specific order belonging to authenticated user
   *
   * @param {string} userId - User ID from JWT
   * @param {string} orderId - Order ID to retrieve
   * @returns {Promise<Object>} Order document
   * @throws {ForbiddenError} If order doesn't belong to user
   * @throws {NotFoundError} If order not found
   */
  async getUserOrderById(userId, orderId, userRole = null) {
    try {
      // Validate order ID format
      if (!this._isValidObjectId(orderId)) {
        throw new ValidationError('Invalid order ID format');
      }

      // Find order
      const order = await Order.findById(orderId)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name description price images')
        .populate('affiliateDetails.affiliateId', 'name email');

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Debug logging for authorization
      const orderUserId = order.userId._id.toString();
      const requestUserId = userId.toString();
      
      console.log('🔐 [ORDER AUTH] Checking authorization:', {
        orderId: orderId,
        orderUserId: orderUserId,
        requestUserId: requestUserId,
        userRole: userRole,
        match: orderUserId === requestUserId,
        orderUserIdType: typeof order.userId._id,
        requestUserIdType: typeof userId,
      });

      // Security: Verify user owns this order OR user is admin
      const isOwner = orderUserId === requestUserId;
      const isAdmin = userRole === 'admin' || userRole === 'super_admin';

      if (!isOwner && !isAdmin) {
        console.warn('❌ [ORDER AUTH] Authorization failed:', {
          orderId: orderId,
          orderOwnerId: orderUserId,
          requestedBy: requestUserId,
          userRole: userRole,
          reason: isOwner ? 'not_owner' : 'not_admin',
        });
        throw new ForbiddenError(
          'Unauthorized: you do not have access to this order'
        );
      }

      if (!isOwner && isAdmin) {
        console.log('✅ [ORDER AUTH] Authorization passed - ADMIN ACCESS');
      } else {
        console.log('✅ [ORDER AUTH] Authorization passed - OWNER');
      }
      return order;
    } catch (error) {
      if (
        error.name === 'ValidationError' ||
        error.name === 'NotFoundError' ||
        error.name === 'ForbiddenError'
      ) {
        throw error;
      }
      throw new Error(`Failed to retrieve order: ${error.message}`);
    }
  }

  /**
   * Get all orders in system with advanced filtering (ADMIN ONLY)
   *
   * @param {Object} filters - Filter options
   *   - status: Order status
   *   - paymentStatus: Payment status
   *   - userId: Filter by user
   *   - affiliateId: Filter by affiliate
   *   - dateFrom, dateTo: Date range
   *   - search: Search by orderNumber or user email
   * @param {Object} pagination - Pagination and sorting
   * @returns {Promise<Object>} { orders, pagination, statistics }
   */
  async getAdminOrders(filters = {}, pagination = {}) {
    try {
      // Set pagination defaults (higher for admin)
      const page = Math.max(1, parseInt(pagination.page) || DEFAULT_PAGE);
      let limit = parseInt(pagination.limit) || 20; // Default 20 for admin
      limit = Math.min(limit, MAX_LIMIT);

      const skip = (page - 1) * limit;

      // Build filter query
      const query = {};

      // Status filters
      if (filters.status) {
        query.orderStatus = filters.status;
      }

      if (filters.paymentStatus) {
        query.paymentStatus = filters.paymentStatus;
      }

      // User filter
      if (filters.userId) {
        if (!this._isValidObjectId(filters.userId)) {
          throw new ValidationError('Invalid userId format');
        }
        query.userId = filters.userId;
      }

      // Affiliate filter
      if (filters.affiliateId) {
        if (!this._isValidObjectId(filters.affiliateId)) {
          throw new ValidationError('Invalid affiliateId format');
        }
        query['affiliateDetails.affiliateId'] = filters.affiliateId;
      }

      // Date range filter
      if (filters.dateFrom || filters.dateTo) {
        query.createdAt = {};
        if (filters.dateFrom) {
          query.createdAt.$gte = new Date(filters.dateFrom);
        }
        if (filters.dateTo) {
          query.createdAt.$lte = new Date(filters.dateTo);
        }
      }

      // Search filter (orderNumber or user email/name)
      if (filters.search) {
        query.$or = [
          { orderNumber: new RegExp(filters.search, 'i') },
          { 'userId.email': new RegExp(filters.search, 'i') },
          { 'userId.name': new RegExp(filters.search, 'i') },
        ];
      }

      // Build sort
      const sortBy = pagination.sortBy || 'createdAt';
      const sortOrder = pagination.sortOrder === 'asc' ? 1 : -1;
      const sort = { [sortBy]: sortOrder };

      // Execute query with populate
      const orders = await Order.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email phone')
        .populate('items.productId', 'name price')
        .populate('affiliateDetails.affiliateId', 'name email');

      // Get counts and statistics
      const totalOrders = await Order.countDocuments(query);
      const totalPages = Math.ceil(totalOrders / limit);

      // Calculate statistics
      const stats = await Order.aggregate([
        { $match: query },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$total' },
            paidAmount: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'paid'] }, '$total', 0],
              },
            },
            refundedAmount: {
              $sum: {
                $cond: [{ $eq: ['$paymentStatus', 'refunded'] }, '$total', 0],
              },
            },
            averageOrder: { $avg: '$total' },
            ordersCount: { $sum: 1 },
          },
        },
      ]);

      const statistics = stats.length > 0
        ? stats[0]
        : {
            totalAmount: 0,
            paidAmount: 0,
            refundedAmount: 0,
            averageOrder: 0,
            ordersCount: 0,
          };

      return {
        orders,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: totalOrders,
          totalPages,
          hasMore: page < totalPages,
        },
        statistics,
      };
    } catch (error) {
      if (error.name === 'ValidationError') {
        throw error;
      }
      throw new Error(`Failed to retrieve admin orders: ${error.message}`);
    }
  }

  /**
   * Update order status with validation
   *
   * @param {string} orderId - Order ID to update
   * @param {string} newStatus - New status value
   * @param {string} reason - Reason for status change (optional)
   * @returns {Promise<Object>} Updated order
   */
  async updateOrderStatus(orderId, newStatus, reason = '') {
    try {
      // Validate order ID
      if (!this._isValidObjectId(orderId)) {
        throw new ValidationError('Invalid order ID format');
      }

      // Validate status value
      const validStatuses = [
        'pending',
        'processing',
        'confirmed',
        'shipped',
        'delivered',
        'cancelled',
        'refunded',
        'returned',
      ];

      if (!validStatuses.includes(newStatus)) {
        throw new ValidationError(`Invalid status: ${newStatus}`);
      }

      // Get current order
      const order = await Order.findById(orderId);

      if (!order) {
        throw new NotFoundError('Order not found');
      }

      // Validate status transition
      const currentStatus = order.orderStatus;
      const validTransitions = this._getValidTransitions(currentStatus);

      if (!validTransitions.includes(newStatus)) {
        throw new ValidationError(
          `Cannot transition from '${currentStatus}' to '${newStatus}'`
        );
      }

      // Update status
      order.orderStatus = newStatus;

      // Optional: Store status history (for future audit trail)
      if (!order.statusHistory) {
        order.statusHistory = [];
      }
      order.statusHistory = order.statusHistory || [];
      order.statusHistory.push({
        status: newStatus,
        changedAt: new Date(),
        reason: reason || '',
      });

      // Save and return updated order
      await order.save();

      return order;
    } catch (error) {
      if (
        error.name === 'ValidationError' ||
        error.name === 'NotFoundError'
      ) {
        throw error;
      }
      throw new Error(`Failed to update order status: ${error.message}`);
    }
  }

  /**
   * Get orders by various criteria (internal use)
   *
   * @param {Object} criteria - Query criteria
   * @param {Object} options - Query options (select, populate, lean)
   * @returns {Promise<Array>} Orders matching criteria
   */
  async findOrders(criteria, options = {}) {
    try {
      let query = Order.find(criteria);

      if (options.select) {
        query = query.select(options.select);
      }

      if (options.populate) {
        query = query.populate(options.populate);
      }

      if (options.lean) {
        query = query.lean();
      }

      if (options.limit) {
        query = query.limit(options.limit);
      }

      if (options.sort) {
        query = query.sort(options.sort);
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Failed to find orders: ${error.message}`);
    }
  }

  /**
   * Get user's order summary (for dashboard)
   *
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Order summary statistics
   */
  async getUserOrderSummary(userId) {
    try {
      const stats = await Order.aggregate([
        { $match: { userId: this._toObjectId(userId) } },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalSpent: { $sum: '$total' },
            averageOrder: { $avg: '$total' },
            lastOrderDate: { $max: '$createdAt' },
            pendingOrders: {
              $sum: {
                $cond: [{ $ne: ['$orderStatus', 'delivered'] }, 1, 0],
              },
            },
          },
        },
      ]);

      return stats.length > 0
        ? stats[0]
        : {
            totalOrders: 0,
            totalSpent: 0,
            averageOrder: 0,
            lastOrderDate: null,
            pendingOrders: 0,
          };
    } catch (error) {
      throw new Error(`Failed to get order summary: ${error.message}`);
    }
  }

  /**
   * Get orders with affiliate details (for affiliate dashboard)
   *
   * @param {string} affiliateId - Affiliate user ID
   * @param {Object} pagination - Pagination options
   * @returns {Promise<Object>} Affiliate's orders with commission info
   */
  async getAffiliateOrders(affiliateId, pagination = {}) {
    try {
      const page = Math.max(1, parseInt(pagination.page) || DEFAULT_PAGE);
      let limit = parseInt(pagination.limit) || DEFAULT_LIMIT;
      limit = Math.min(limit, MAX_LIMIT);

      const skip = (page - 1) * limit;

      // Find orders where this user is the affiliate
      const orders = await Order.find({
        'affiliateDetails.affiliateId': affiliateId,
      })
        .select(
          'orderNumber total paymentStatus orderStatus affiliateDetails createdAt'
        )
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate('userId', 'name email')
        .populate('items.productId', 'name price');

      const totalOrders = await Order.countDocuments({
        'affiliateDetails.affiliateId': affiliateId,
      });

      // Calculate affiliate statistics
      const stats = await Order.aggregate([
        { $match: { 'affiliateDetails.affiliateId': this._toObjectId(affiliateId) } },
        {
          $group: {
            _id: null,
            totalCommission: { $sum: '$affiliateDetails.commissionAmount' },
            paidCommission: {
              $sum: {
                $cond: [{ $eq: ['$affiliateDetails.status', 'paid'] }, '$affiliateDetails.commissionAmount', 0],
              },
            },
            pendingCommission: {
              $sum: {
                $cond: [{ $eq: ['$affiliateDetails.status', 'pending'] }, '$affiliateDetails.commissionAmount', 0],
              },
            },
            totalSales: { $sum: '$total' },
          },
        },
      ]);

      const statistics = stats.length > 0
        ? stats[0]
        : {
            totalCommission: 0,
            paidCommission: 0,
            pendingCommission: 0,
            totalSales: 0,
          };

      const totalPages = Math.ceil(totalOrders / limit);

      return {
        orders,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: totalOrders,
          totalPages,
        },
        statistics,
      };
    } catch (error) {
      throw new Error(`Failed to get affiliate orders: ${error.message}`);
    }
  }

  // ==================== Private Helper Methods ====================

  /**
   * Validate MongoDB ObjectId format
   *
   * @private
   * @param {string} id - ID to validate
   * @returns {boolean} True if valid ObjectId
   */
  _isValidObjectId(id) {
    return /^[0-9a-fA-F]{24}$/.test(id);
  }

  /**
   * Convert string to MongoDB ObjectId
   *
   * @private
   * @param {string} id - ID string
   * @returns {ObjectId} MongoDB ObjectId
   */
  _toObjectId(id) {
    const mongoose = require('mongoose');
    return mongoose.Types.ObjectId(id);
  }

  /**
   * Attribute an order to an affiliate for referral tracking
   *
   * Called after payment success to update referral tracking with order conversion
   *
   * @param {string} orderId - Order ID
   * @param {string} affiliateId - Affiliate ID (optional)
   * @param {number} commissionPercentage - Commission percentage (default 10)
   * @returns {Promise<Object>} Attribution result
   */
  async attributeOrderToAffiliate(orderId, affiliateId, commissionPercentage = 10, visitorId = null) {
    try {
      if (!orderId || !affiliateId) {
        return {
          success: false,
          reason: 'Missing orderId or affiliateId',
        };
      }

      // Get the order
      const order = await Order.findById(orderId);

      if (!order) {
        return {
          success: false,
          reason: 'Order not found',
        };
      }

      // Call referral tracking service to attribute order
      const referralTrackingService = require('./referralTrackingService');

      const attributionResult = await referralTrackingService.attributeOrderToAffiliate(
        {
          orderId,
          userId: order.userId,
          total: order.total,
          affiliateCookie: {
            affiliateId,
            affiliateCode: order.affiliateDetails?.affiliateCode || null,
            visitorId: visitorId, // Include visitorId from metadata for matching
          },
        },
        commissionPercentage
      );

      if (attributionResult.attributionSuccess) {
        console.log(
          `✅ Order Attribution Success - Order: ${orderId}, Affiliate: ${affiliateId}`
        );
      }

      return attributionResult;
    } catch (error) {
      console.error(`❌ Error attributing order to affiliate: ${error.message}`);
      return {
        success: false,
        reason: error.message,
      };
    }
  }

  /**
   * Get valid status transitions from current status
   *
   * @private
   * @param {string} currentStatus - Current order status
   * @returns {Array<string>} Valid next statuses
   */
  _getValidTransitions(currentStatus) {
    const transitions = {
      pending: ['processing', 'cancelled'],
      processing: ['confirmed', 'shipped', 'cancelled', 'refunded'],
      confirmed: ['shipped', 'cancelled', 'refunded'],
      shipped: ['delivered', 'returned'],
      delivered: ['complete', 'returned'],
      cancelled: [], // Terminal
      refunded: [], // Terminal
      returned: [], // Terminal
      complete: [], // Terminal
    };

    return transitions[currentStatus] || [];
  }
}

module.exports = new OrderService();
