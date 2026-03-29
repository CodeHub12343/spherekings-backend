/**
 * Order Controller
 * HTTP request handlers for order operations
 */

const orderService = require('../services/orderService');
const { ValidationError } = require('../utils/errors');

class OrderController {
  /**
   * GET /api/orders
   *
   * Retrieve authenticated user's orders with pagination and filtering
   *
   * Query Parameters:
   *   page - Page number (default 1)
   *   limit - Items per page (default 10, max 100)
   *   status - Filter by order status
   *   paymentStatus - Filter by payment status
   *   dateFrom, dateTo - Date range (ISO format)
   *   minAmount, maxAmount - Price range
   *   sortBy - Sort field (createdAt, total, status)
   *   sortOrder - asc or desc (default desc)
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getMyOrders(req, res, next) {
    try {
      const userId = req.user._id;

      // Extract filters from query
      const filters = {
        status: req.query.status,
        paymentStatus: req.query.paymentStatus,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        minAmount: req.query.minAmount,
        maxAmount: req.query.maxAmount,
      };

      // Extract pagination from query
      const pagination = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
      };

      // Call service to get orders
      const result = await orderService.getUserOrders(userId, filters, pagination);

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: result.orders,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id
   *
   * Retrieve a specific order belonging to authenticated user
   *
   * Security: Verifies user owns this order
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {string} req.params.id - Order ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getOrderById(req, res, next) {
    try {
      const { id: orderId } = req.params;
      const userId = req.user._id;
      const userRole = req.user.role; // Get user role for authorization

      // Get order with ownership verification (admins can view any order)
      const order = await orderService.getUserOrderById(userId, orderId, userRole);

      return res.status(200).json({
        success: true,
        message: 'Order retrieved successfully',
        data: { order },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id/summary
   *
   * Get user's order summary statistics
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getOrderSummary(req, res, next) {
    try {
      const userId = req.user._id;

      // Get summary statistics
      const summary = await orderService.getUserOrderSummary(userId);

      return res.status(200).json({
        success: true,
        message: 'Order summary retrieved successfully',
        data: { summary },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/orders
   *
   * Retrieve all orders in system with advanced filtering (ADMIN ONLY)
   *
   * Query Parameters:
   *   page - Page number (default 1)
   *   limit - Items per page (default 20, max 100)
   *   status - Filter by order status
   *   paymentStatus - Filter by payment status
   *   userId - Filter by user ID
   *   affiliateId - Filter by affiliate ID
   *   dateFrom, dateTo - Date range (ISO format)
   *   search - Search by orderNumber or user email/name
   *   sortBy - Sort field (default createdAt)
   *   sortOrder - asc or desc (default desc)
   *
   * @param {Object} req - Express request
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAllOrders(req, res, next) {
    try {
      // Extract filters from query
      const filters = {
        status: req.query.status,
        paymentStatus: req.query.paymentStatus,
        userId: req.query.userId,
        affiliateId: req.query.affiliateId,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
        search: req.query.search,
      };

      // Extract pagination from query
      const pagination = {
        page: req.query.page,
        limit: req.query.limit,
        sortBy: req.query.sortBy || 'createdAt',
        sortOrder: req.query.sortOrder || 'desc',
      };

      // Call service to get all orders
      const result = await orderService.getAdminOrders(filters, pagination);

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        data: {
          orders: result.orders,
          pagination: result.pagination,
          statistics: result.statistics,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/orders/:id/status
   *
   * Update order fulfillment status (ADMIN ONLY)
   *
   * Request Body:
   *   {
   *     "status": "shipped",
   *     "reason": "Order picked and shipped to customer"
   *   }
   *
   * Valid Transitions:
   *   pending → processing, cancelled
   *   processing → shipped, confirmed, cancelled, refunded
   *   confirmed → shipped, cancelled, refunded
   *   shipped → delivered, returned
   *   delivered → complete, returned
   *   cancelled, refunded, returned, complete → (terminal)
   *
   * @param {Object} req - Express request
   * @param {string} req.params.id - Order ID
   * @param {Object} req.body - Status update data
   * @param {string} req.body.status - New status
   * @param {string} req.body.reason - Status change reason (optional)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async updateOrderStatus(req, res, next) {
    try {
      const { id: orderId } = req.params;
      const { status, reason } = req.body;

      // Validate required field
      if (!status) {
        return next(new ValidationError('Status is required'));
      }

      // Update order status
      const updatedOrder = await orderService.updateOrderStatus(orderId, status, reason);

      return res.status(200).json({
        success: true,
        message: `Order status updated to ${status}`,
        data: { order: updatedOrder },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/affiliate/orders
   *
   * Retrieve orders referred by authenticated affiliate
   *
   * Query Parameters:
   *   page - Page number
   *   limit - Items per page
   *
   * Returns orders where this user is the affiliate with commission info
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated affiliate user ID
   * @param {Object} req.query - Query parameters
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAffiliateOrdersAndCommissions(req, res, next) {
    try {
      const affiliateId = req.user._id;

      // Extract pagination
      const pagination = {
        page: req.query.page,
        limit: req.query.limit,
      };

      // Get affiliate's orders and commission statistics
      const result = await orderService.getAffiliateOrders(affiliateId, pagination);

      return res.status(200).json({
        success: true,
        message: 'Affiliate orders retrieved successfully',
        data: {
          orders: result.orders,
          pagination: result.pagination,
          statistics: result.statistics,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/orders/search
   *
   * Advanced search for orders (customer can search own orders)
   *
   * Request Body:
   *   {
   *     "orderNumber": "ORD-20240101-123456",
   *     "status": "shipped",
   *     "dateFrom": "2024-01-01",
   *     "dateTo": "2024-12-31"
   *   }
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {Object} req.body - Search criteria
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async searchMyOrders(req, res, next) {
    try {
      const userId = req.user._id;
      const { orderNumber, status, dateFrom, dateTo, minAmount, maxAmount } = req.body;

      // Build search filters
      const filters = {
        status,
        dateFrom,
        dateTo,
        minAmount,
        maxAmount,
      };

      // If searching by order number, add to filters
      const pagination = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      };

      // Get orders
      const result = await orderService.getUserOrders(userId, filters, pagination);

      // If orderNumber provided, filter results in-memory
      if (orderNumber) {
        result.orders = result.orders.filter((order) =>
          order.orderNumber.includes(orderNumber)
        );
      }

      return res.status(200).json({
        success: true,
        message: 'Search results retrieved successfully',
        data: {
          orders: result.orders,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/orders/:id/invoice
   *
   * Generate order invoice (for future email/PDF generation)
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {string} req.params.id - Order ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getOrderInvoice(req, res, next) {
    try {
      const { id: orderId } = req.params;
      const userId = req.user._id;

      // Get order with ownership verification
      const order = await orderService.getUserOrderById(userId, orderId);

      // TODO: Format invoice data
      // Could integrate with PDF generation library here

      return res.status(200).json({
        success: true,
        message: 'Invoice data retrieved successfully',
        data: {
          invoice: {
            orderNumber: order.orderNumber,
            orderDate: order.createdAt,
            items: order.items,
            subtotal: order.subtotal,
            tax: order.tax,
            total: order.total,
            paymentDetails: {
              method: order.paymentDetails.paymentMethod,
              status: order.paymentStatus,
              transactionId: order.paymentDetails.transactionId,
            },
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new OrderController();
