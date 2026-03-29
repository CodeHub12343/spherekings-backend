/**
 * Order Routes
 * API endpoints for order operations
 */

const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const {
  validateOrder,
  userOrdersQuerySchema,
  adminOrdersQuerySchema,
  updateOrderStatusSchema,
  searchOrdersSchema,
} = require('../validators/orderValidator');

/**
 * ==================== CUSTOMER ROUTES ====================
 */

/**
 * GET /api/orders
 *
 * Retrieve authenticated user's orders with pagination and filtering
 *
 * Query Parameters:
 *   page (number) - Page number, default 1
 *   limit (number) - Items per page, default 10, max 100
 *   status (string) - Filter by order status
 *   paymentStatus (string) - Filter by payment status
 *   dateFrom, dateTo (string) - ISO date range
 *   minAmount, maxAmount (number) - Price range
 *   sortBy (string) - Sort field: createdAt, total, status
 *   sortOrder (string) - asc or desc
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Orders retrieved successfully",
 *     "data": {
 *       "orders": [ ... ],
 *       "pagination": {
 *         "currentPage": 1,
 *         "itemsPerPage": 10,
 *         "totalItems": 25,
 *         "totalPages": 3,
 *         "hasMore": true
 *       }
 *     }
 *   }
 */
router.get(
  '/',
  authenticate,
  validateOrder(userOrdersQuerySchema, 'query'),
  orderController.getMyOrders
);

/**
 * GET /api/orders/summary
 *
 * Get user's order summary statistics
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "summary": {
 *         "totalOrders": 5,
 *         "totalSpent": 249.95,
 *         "averageOrder": 49.99,
 *         "lastOrderDate": "2024-03-13T10:30:00Z",
 *         "pendingOrders": 1
 *       }
 *     }
 *   }
 */
router.get(
  '/summary',
  authenticate,
  orderController.getOrderSummary
);

/**
 * GET /api/orders/:id
 *
 * Retrieve a specific order belonging to authenticated user
 *
 * Security: Verifies user owns this order
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Order retrieved successfully",
 *     "data": {
 *       "order": { ... }
 *     }
 *   }
 *
 * Error (404):
 *   {
 *     "success": false,
 *     "statusCode": 404,
 *     "message": "Order not found"
 *   }
 *
 * Error (403):
 *   {
 *     "success": false,
 *     "statusCode": 403,
 *     "message": "Unauthorized: you do not have access to this order"
 *   }
 */
router.get(
  '/:id',
  authenticate,
  orderController.getOrderById
);

/**
 * POST /api/orders/search
 *
 * Advanced search for user's orders
 *
 * Body:
 *   {
 *     "orderNumber": "ORD-20240101-123456",
 *     "status": "shipped",
 *     "dateFrom": "2024-01-01",
 *     "dateTo": "2024-12-31",
 *     "minAmount": 0,
 *     "maxAmount": 500
 *   }
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "orders": [ ... ],
 *       "pagination": { ... }
 *     }
 *   }
 */
router.post(
  '/search',
  authenticate,
  validateOrder(searchOrdersSchema, 'body'),
  orderController.searchMyOrders
);

/**
 * GET /api/orders/:id/invoice
 *
 * Generate order invoice data (for PDF/email generation)
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "invoice": {
 *         "orderNumber": "ORD-20240101-123456",
 *         "orderDate": "2024-03-13T10:30:00Z",
 *         "items": [ ... ],
 *         "subtotal": 99.99,
 *         "tax": 8.00,
 *         "total": 107.99,
 *         "paymentDetails": { ... }
 *       }
 *     }
 *   }
 */
router.get(
  '/:id/invoice',
  authenticate,
  orderController.getOrderInvoice
);

/**
 * ==================== AFFILIATE ROUTES ====================
 */

/**
 * GET /api/affiliate/orders
 *
 * Retrieve orders referred by authenticated affiliate
 *
 * Returns:
 *   - Orders where this user is the affiliate
 *   - Commission information and statistics
 *
 * Query:
 *   page, limit - Pagination
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "data": {
 *       "orders": [ ... ],
 *       "pagination": { ... },
 *       "statistics": {
 *         "totalCommission": 250.00,
 *         "paidCommission": 100.00,
 *         "pendingCommission": 150.00,
 *         "totalSales": 2500.00
 *       }
 *     }
 *   }
 */
router.get(
  '/affiliate/orders',
  authenticate,
  orderController.getAffiliateOrdersAndCommissions
);

/**
 * ==================== ADMIN ROUTES ====================
 */

/**
 * GET /api/admin/orders
 *
 * Retrieve all orders in system with advanced filtering
 *
 * Roles: admin only
 *
 * Query Parameters:
 *   page (number) - Default 1
 *   limit (number) - Default 20, max 100
 *   status (string) - Order status
 *   paymentStatus (string) - Payment status
 *   userId (string) - Filter by user ID (MongoDB ObjectId)
 *   affiliateId (string) - Filter by affiliate (MongoDB ObjectId)
 *   dateFrom, dateTo (string) - Date range (ISO format)
 *   search (string) - Search by orderNumber or user email/name
 *   sortBy (string) - Sort field
 *   sortOrder (string) - asc or desc
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Orders retrieved successfully",
 *     "data": {
 *       "orders": [ ... ],
 *       "pagination": { ... },
 *       "statistics": {
 *         "totalAmount": 10000.00,
 *         "paidAmount": 9000.00,
 *         "refundedAmount": 500.00,
 *         "averageOrder": 200.00,
 *         "ordersCount": 50
 *       }
 *     }
 *   }
 */
router.get(
  '/admin/orders',
  authenticate,
  authorize('admin'),
  validateOrder(adminOrdersQuerySchema, 'query'),
  orderController.getAllOrders
);

/**
 * PUT /api/admin/orders/:id/status
 *
 * Update order fulfillment status
 *
 * Roles: admin only
 *
 * Body:
 *   {
 *     "status": "shipped",
 *     "reason": "Order picked and shipped to customer"
 *   }
 *
 * Valid Status Transitions:
 *   pending → processing, cancelled
 *   processing → confirmed, shipped, cancelled, refunded
 *   confirmed → shipped, cancelled, refunded
 *   shipped → delivered, returned
 *   delivered → complete, returned
 *   cancelled, refunded, returned, complete → (terminal states)
 *
 * Response (200):
 *   {
 *     "success": true,
 *     "message": "Order status updated to shipped",
 *     "data": {
 *       "order": { ... }
 *     }
 *   }
 *
 * Error (400):
 *   {
 *     "success": false,
 *     "statusCode": 400,
 *     "message": "Cannot transition from 'pending' to 'delivered'"
 *   }
 */
router.put(
  '/admin/orders/:id/status',
  authenticate,
  authorize('admin'),
  validateOrder(updateOrderStatusSchema, 'body'),
  orderController.updateOrderStatus
);

/**
 * ==================== ROUTE NOTES ====================
 *
 * Middleware Chain Explanation:
 *
 * 1. authenticate - Verifies JWT token and extracts user info
 *    - Adds req.user = { _id, email, role }
 *    - Returns 401 if no token or invalid token
 *
 * 2. authorize('admin') - Checks user role is admin
 *    - Must come after authenticate
 *    - Returns 403 if role is not admin
 *
 * 3. validateOrder(schema, source) - Validates request data
 *    - Checks format/types of query/body parameters
 *    - Converts types (string "10" → number 10)
 *    - Returns 400 if validation fails
 *    - Updated req.query/req.body with valid data
 *
 * Order of middleware matters:
 *   - Authentication must come first
 *   - Authorization before business logic
 *   - Validation before controller
 *
 */

module.exports = router;
