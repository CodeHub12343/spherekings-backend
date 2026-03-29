/**
 * ==================== ORDER MANAGEMENT API DOCUMENTATION ====================
 *
 * This file provides comprehensive documentation for the Order Management API
 * Used by the Spherekings Marketplace backend for order retrieval, filtering,
 * pagination, and status management
 *
 * RESTful API following HTTP standards with JSON request/response bodies
 * All timestamps are ISO 8601 format (UTC)
 * All monetary values are in USD with 2 decimal places
 *
 * ============================================================================
 */

/**
 * ==================== API OVERVIEW ====================
 *
 * Base URL: {BASE_URL}/api/orders
 * Authentication: JWT Bearer token (all endpoints except /webhook)
 * Content-Type: application/json
 *
 * Rate Limiting:
 *   - Standard: 100 requests per 15 minutes per IP
 *   - Returns: 429 Too Many Requests if exceeded
 *
 * Response Format (Standard):
 * {
 *   "success": true,
 *   "message": "Description of result",
 *   "statusCode": 200,
 *   "data": {
 *     ...endpoint-specific data...
 *   }
 * }
 *
 * Error Response Format:
 * {
 *   "success": false,
 *   "message": "Error description",
 *   "statusCode": 400,
 *   "errors": [
 *     { "field": "fieldName", "message": "Error message" }
 *   ]
 * }
 */

/**
 * ==================== ORDER STATUS WORKFLOW ====================
 *
 * Order Status States (8 total):
 *
 * 1. pending
 *    - Initial state after successful payment
 *    - Awaiting merchant fulfillment
 *    - Valid transitions: processing, cancelled
 *
 * 2. processing
 *    - Merchant is picking/packing order
 *    - Can be confirmed or shipped directly
 *    - Valid transitions: confirmed, shipped, cancelled, refunded
 *
 * 3. confirmed
 *    - Order ready for shipment (optional intermediate state)
 *    - Valid transitions: shipped, cancelled, refunded
 *
 * 4. shipped
 *    - Order sent to customer with tracking
 *    - Can be delivered or returned
 *    - Valid transitions: delivered, returned
 *
 * 5. delivered
 *    - Confirmed delivery to customer
 *    - Valid transitions: complete, returned
 *
 * 6. complete
 *    - Order fulfilled successfully [TERMINAL]
 *    - No further transitions
 *
 * 7. cancelled
 *    - Order cancelled before shipment [TERMINAL]
 *    - Money refunded to customer
 *    - No further transitions
 *
 * 8. refunded
 *    - Order refunded (can happen at any point) [TERMINAL]
 *    - No further transitions
 *
 * 9. returned
 *    - Product returned by customer [TERMINAL]
 *    - May process refund separately
 *    - No further transitions
 *
 * Status Transition Rules:
 *   pending    → processing, cancelled
 *   processing → confirmed, shipped, cancelled, refunded
 *   confirmed  → shipped, cancelled, refunded
 *   shipped    → delivered, returned
 *   delivered  → complete, returned
 *   [TERMINAL] → no transitions (complete, cancelled, refunded, returned)
 */

/**
 * ==================== DATA MODELS ====================
 */

// Order Object Structure
const ORDER_OBJECT = {
  _id: 'ObjectId (MongoDB ID)',
  orderNumber: 'ORD-20240101-123456 (unique identifier)',
  userId: 'ObjectId (customer who placed order)',
  items: [
    {
      productId: 'ObjectId',
      productName: 'Product Name',
      quantity: 2,
      price: 49.99,
      subtotal: 99.98,
      image: 'URL to product image',
      variant: {
        size: 'M',
        color: 'Blue',
      },
    },
  ],
  subtotal: 149.99,
  tax: 12.00,
  shippingCost: 5.00,
  discountAmount: 10.00,
  total: 156.99,
  paymentStatus: 'paid | pending | failed | refunded',
  orderStatus: 'pending | processing | shipped | delivered | complete | cancelled | refunded | returned',
  shippingAddress: {
    fullName: 'John Doe',
    email: 'john@example.com',
    phone: '+1234567890',
    street: '123 Main St',
    city: 'New York',
    state: 'NY',
    zipCode: '10001',
    country: 'United States',
  },
  billingAddress: {
    // Same structure as shippingAddress
  },
  paymentDetails: {
    method: 'stripe',
    stripeSessionId: 'cs_test_...',
    stripePaymentIntentId: 'pi_test_...',
    chargeId: 'ch_test_...',
    lastFourDigits: '4242',
    paidAt: '2024-03-13T10:30:00Z',
  },
  affiliateDetails: {
    affiliateId: 'ObjectId | null',
    affiliateEmail: 'affiliate@example.com | null',
    commissionRate: 10,
    commissionAmount: 15.70,
    commissionStatus: 'pending | approved | paid',
  },
  notes: 'Special instructions etc.',
  createdAt: '2024-03-13T10:30:00Z',
  updatedAt: '2024-03-13T10:30:00Z',
};

// Pagination Object Structure
const PAGINATION_OBJECT = {
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 45,
  totalPages: 5,
  hasMore: true,
};

// User Order Summary Statistics
const ORDER_SUMMARY_OBJECT = {
  totalOrders: 15,
  totalSpent: 2547.50,
  averageOrder: 169.83,
  lastOrderDate: '2024-03-13T10:30:00Z',
  pendingOrders: 2,
};

/**
 * ==================== CUSTOMER ENDPOINTS ====================
 */

/**
 * GET /api/orders
 *
 * Retrieve authenticated customer's order history with filtering and pagination
 *
 * Authorization: Required (JWT)
 * Role: customer, admin, affiliate
 *
 * Query Parameters (all optional):
 *   page (number)      - Page number, minimum 1, default 1
 *   limit (number)     - Items per page, 1-100, default 10
 *   status (string)    - Filter by order status (valid values: pending, processing, shipped, delivered, complete, cancelled, refunded, returned)
 *   paymentStatus (string) - Filter by payment status (paid, pending, failed, refunded)
 *   dateFrom (string)  - Start date (ISO 8601 format), filters createdAt >= dateFrom
 *   dateTo (string)    - End date (ISO 8601 format), filters createdAt <= dateTo
 *   minAmount (number) - Minimum order total (exclusive)
 *   maxAmount (number) - Maximum order total (inclusive)
 *   sortBy (string)    - Sort field (createdAt, total, status, orderNumber), default createdAt
 *   sortOrder (string) - asc or desc, default desc
 *
 * Example URL:
 *   GET /api/orders?page=1&limit=10&status=shipped&dateFrom=2024-01-01&sortBy=createdAt&sortOrder=desc
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Orders retrieved successfully",
 *   "statusCode": 200,
 *   "data": {
 *     "orders": [ { ...ORDER_OBJECT... } ],
 *     "pagination": PAGINATION_OBJECT
 *   }
 * }
 *
 * Error (400 Bad Request):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": [
 *     { "field": "limit", "message": "limit must be between 1 and 100" },
 *     { "field": "status", "message": "Invalid order status" }
 *   ]
 * }
 *
 * Error (401 Unauthorized):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: invalid or missing token"
 * }
 *
 * Common Patterns/Use Cases:
 *
 *   1. Get all user's orders (paginated):
 *      GET /api/orders?page=1&limit=20
 *
 *   2. Get recent shipped orders in price range:
 *      GET /api/orders?status=shipped&minAmount=50&maxAmount=200&sortOrder=desc
 *
 *   3. Get orders in date range with pending status:
 *      GET /api/orders?status=pending&dateFrom=2024-02-01&dateTo=2024-02-28
 *
 *   4. Get orders sorted by price (ascending):
 *      GET /api/orders?sortBy=total&sortOrder=asc
 *
 *   5. Get orders from March 2024 onwards, most recent first:
 *      GET /api/orders?dateFrom=2024-03-01&sortBy=createdAt&sortOrder=desc
 */

/**
 * GET /api/orders/summary
 *
 * Get customer's order statistics and summary information
 *
 * Authorization: Required (JWT)
 * Role: customer, admin, affiliate
 *
 * Query Parameters: None
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Order summary retrieved successfully",
 *   "statusCode": 200,
 *   "data": {
 *     "summary": {
 *       "totalOrders": 12,
 *       "totalSpent": 1549.87,
 *       "averageOrder": 129.16,
 *       "lastOrderDate": "2024-03-13T14:22:00Z",
 *       "pendingOrders": 1
 *     }
 *   }
 * }
 *
 * Error (401 Unauthorized):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: invalid or missing token"
 * }
 *
 * Use Cases:
 *   - Dashboard: Display customer spending statistics
 *   - Profile page: Show order count and total spent
 *   - Loyalty program: Calculate customer tier based on totalSpent
 *   - Email notifications: "You've spent $X with us!"
 */

/**
 * GET /api/orders/:id
 *
 * Retrieve a specific order by ID (with ownership verification)
 *
 * Authorization: Required (JWT)
 * Role: customer (own orders), admin (any order), affiliate (orders they referred)
 *
 * URL Parameters:
 *   id (string) - MongoDB ObjectId of the order
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Order retrieved successfully",
 *   "statusCode": 200,
 *   "data": {
 *     "order": { ...ORDER_OBJECT... }
 *   }
 * }
 *
 * Error (404 Not Found):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Order not found"
 * }
 *
 * Error (403 Forbidden):
 * {
 *   "success": false,
 *   "statusCode": 403,
 *   "message": "Unauthorized: you do not have access to this order"
 * }
 *
 * Error (401 Unauthorized):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: invalid or missing token"
 * }
 *
 * Use Cases:
 *   - Order detail page: Display full order information
 *   - Email verification: Verify order exists before sending tracking
 *   - Support tickets: Customer service pulls order details
 *   - Warranty claims: Check order date and items
 */

/**
 * POST /api/orders/search
 *
 * Advanced search for customer's orders with flexible filtering
 *
 * Authorization: Required (JWT)
 * Role: customer (own orders), admin (any orders)
 *
 * Request Body:
 * {
 *   "orderNumber": "ORD-20240101-123456",  // Optional, exact match or partial search
 *   "status": "shipped",                    // Optional, single status value
 *   "dateFrom": "2024-01-01",              // Optional, ISO date
 *   "dateTo": "2024-12-31",                // Optional, ISO date
 *   "minAmount": 0,                         // Optional, number
 *   "maxAmount": 500                        // Optional, number
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Search completed successfully",
 *   "statusCode": 200,
 *   "data": {
 *     "orders": [ { ...ORDER_OBJECT... } ],
 *     "pagination": PAGINATION_OBJECT
 *   }
 * }
 *
 * Response (400 Bad Request):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": [
 *     { "field": "dateFrom", "message": "Invalid date format" }
 *   ]
 * }
 *
 * Example Requests:
 *
 *   1. Search by order number:
 *      POST /api/orders/search
 *      { "orderNumber": "ORD-202403" }
 *
 *   2. Find refunded orders in specific month:
 *      POST /api/orders/search
 *      { "status": "refunded", "dateFrom": "2024-02-01", "dateTo": "2024-02-29" }
 *
 *   3. Find high-value orders:
 *      POST /api/orders/search
 *      { "minAmount": 500 }
 *
 *   4. Complex search with multiple filters:
 *      POST /api/orders/search
 *      {
 *        "status": "complete",
 *        "dateFrom": "2024-01-01",
 *        "dateTo": "2024-03-13",
 *        "minAmount": 100,
 *        "maxAmount": 1000
 *      }
 */

/**
 * GET /api/orders/:id/invoice
 *
 * Generate formatted invoice data for order (for PDF generation or email)
 *
 * Authorization: Required (JWT)
 * Role: customer (own orders), admin
 *
 * URL Parameters:
 *   id (string) - MongoDB ObjectId of the order
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Invoice retrieved successfully",
 *   "statusCode": 200,
 *   "data": {
 *     "invoice": {
 *       "invoiceNumber": "INV-20240101-123456",
 *       "orderNumber": "ORD-20240101-123456",
 *       "orderDate": "2024-03-13T10:30:00Z",
 *       "dueDate": "2024-03-20T23:59:59Z",
 *       "customer": {
 *         "name": "John Doe",
 *         "email": "john@example.com",
 *         "phone": "+1234567890"
 *       },
 *       "items": [
 *         {
 *           "id": 1,
 *           "productName": "Blue T-Shirt",
 *           "quantity": 2,
 *           "unitPrice": 29.99,
 *           "subtotal": 59.98
 *         }
 *       ],
 *       "subtotal": 149.99,
 *       "tax": 12.00,
 *       "shipping": 5.00,
 *       "discount": 10.00,
 *       "total": 156.99,
 *       "paymentMethod": "Credit Card",
 *       "shippingAddress": { ...address... },
 *       "billingAddress": { ...address... }
 *     }
 *   }
 * }
 *
 * Error (404 Not Found):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Order not found"
 * }
 *
 * Use Cases:
 *   - PDF generation: Convert invoice data to PDF
 *   - Email receipts: Send formatted invoice with order confirmation
 *   - Accounting: Import into accounting software
 *   - Tax: Print for tax records
 */

/**
 * ==================== AFFILIATE ENDPOINTS ====================
 */

/**
 * GET /api/affiliate/orders
 *
 * Retrieve orders referred by authenticated affiliate with commission details
 *
 * Authorization: Required (JWT)
 * Role: affiliate only
 *
 * Query Parameters (all optional):
 *   page (number)   - Page number, default 1
 *   limit (number)  - Items per page, 1-100, default 10
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Affiliate orders retrieved successfully",
 *   "statusCode": 200,
 *   "data": {
 *     "orders": [
 *       {
 *         ...ORDER_OBJECT,
 *         "affiliateDetails": {
 *           "affiliateId": "ObjectId",
 *           "affiliateEmail": "affiliate@example.com",
 *           "commissionRate": 10,
 *           "commissionAmount": 15.70,
 *           "commissionStatus": "pending"
 *         }
 *       }
 *     ],
 *     "pagination": PAGINATION_OBJECT,
 *     "statistics": {
 *       "totalCommission": 500.00,
 *       "paidCommission": 250.00,
 *       "pendingCommission": 250.00,
 *       "totalSales": 5000.00
 *     }
 *   }
 * }
 *
 * Error (401 Unauthorized):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: invalid or missing token"
 * }
 *
 * Error (403 Forbidden):
 * {
 *   "success": false,
 *   "statusCode": 403,
 *   "message": "Forbidden: user is not an affiliate"
 * }
 *
 * Use Cases:
 *   - Affiliate dashboard: Show referred sales and earnings
 *   - Commission tracking: Calculate total commissions earned
 *   - Performance analytics: Track conversion rates
 *   - Payout requests: Calculate eligible commission balance
 */

/**
 * ==================== ADMIN ENDPOINTS ====================
 */

/**
 * GET /api/admin/orders
 *
 * Retrieve all orders in system with advanced filtering, searching, and statistics
 *
 * Authorization: Required (JWT + admin role)
 * Role: admin only
 *
 * Query Parameters (all optional):
 *   page (number)        - Page number, default 1
 *   limit (number)       - Items per page, 1-100, default 20
 *   status (string)      - Filter by order status
 *   paymentStatus (string) - Filter by payment status (paid, pending, failed, refunded)
 *   userId (string)      - Filter by customer (MongoDB ObjectId)
 *   affiliateId (string) - Filter by referring affiliate (MongoDB ObjectId)
 *   dateFrom (string)    - Start date (ISO 8601)
 *   dateTo (string)      - End date (ISO 8601)
 *   minAmount (number)   - Minimum order total
 *   maxAmount (number)   - Maximum order total
 *   search (string)      - Search by order number, customer email, or customer name
 *   sortBy (string)      - Sort field (createdAt, total, status, orderNumber)
 *   sortOrder (string)   - asc or desc
 *
 * Example URL:
 *   GET /api/admin/orders?page=1&limit=20&status=pending&search=john@example.com&sortBy=createdAt&sortOrder=desc
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Orders retrieved successfully",
 *   "statusCode": 200,
 *   "data": {
 *     "orders": [ { ...ORDER_OBJECT... } ],
 *     "pagination": PAGINATION_OBJECT,
 *     "statistics": {
 *       "totalAmount": 10000.00,
 *       "paidAmount": 9500.00,
 *       "refundedAmount": 500.00,
 *       "averageOrder": 200.00,
 *       "ordersCount": 50
 *     }
 *   }
 * }
 *
 * Error (401 Unauthorized):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: invalid or missing token"
 * }
 *
 * Error (403 Forbidden):
 * {
 *   "success": false,
 *   "statusCode": 403,
 *   "message": "Forbidden: admin access required"
 * }
 *
 * Use Cases:
 *   - Orders dashboard: View all system orders with filtering
 *   - Revenue analytics: Calculate statistics for reporting
 *   - Customer support: Search for customer orders
 *   - Fraud detection: Filter by suspicious patterns
 *   - Affiliate management: View specific affiliate's referred sales
 */

/**
 * PUT /api/admin/orders/:id/status
 *
 * Update order fulfillment status (admin only)
 *
 * Authorization: Required (JWT + admin role)
 * Role: admin only
 *
 * URL Parameters:
 *   id (string) - MongoDB ObjectId of the order
 *
 * Request Body:
 * {
 *   "status": "shipped",                    // Required: new status value
 *   "reason": "Order picked and shipped"    // Optional: reason for status change
 * }
 *
 * Valid Status Values:
 *   - pending: Initial state after payment
 *   - processing: Merchant is picking/packing
 *   - confirmed: Ready for shipment (optional intermediate state)
 *   - shipped: Sent to customer
 *   - delivered: Confirmed at destination
 *   - complete: Order fulfilled successfully
 *   - cancelled: Order cancelled before shipment
 *   - refunded: Order refunded (money returned)
 *   - returned: Product returned by customer
 *
 * Valid Transitions (see workflow section above):
 *   pending -> processing, cancelled
 *   processing -> confirmed, shipped, cancelled, refunded
 *   confirmed -> shipped, cancelled, refunded
 *   shipped -> delivered, returned
 *   delivered -> complete, returned
 *   [Terminal states: complete, cancelled, refunded, returned]
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Order status updated to shipped",
 *   "statusCode": 200,
 *   "data": {
 *     "order": { ...ORDER_OBJECT with orderStatus: "shipped"... }
 *   }
 * }
 *
 * Error (400 Bad Request - Invalid Transition):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Invalid status transition",
 *   "errors": [
 *     {
 *       "field": "status",
 *       "message": "Cannot transition from 'pending' to 'delivered'"
 *     }
 *   ]
 * }
 *
 * Error (400 Bad Request - Invalid Status):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": [
 *     { "field": "status", "message": "Invalid or missing status value" }
 *   ]
 * }
 *
 * Error (404 Not Found):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Order not found"
 * }
 *
 * Error (403 Forbidden):
 * {
 *   "success": false,
 *   "statusCode": 403,
 *   "message": "Forbidden: admin access required"
 * }
 *
 * Example Requests:
 *
 *   1. Mark as shipped (basic):
 *      PUT /api/admin/orders/507f1f77bcf86cd799439011/status
 *      { "status": "shipped" }
 *
 *   2. Update with reason (recommended):
 *      PUT /api/admin/orders/507f1f77bcf86cd799439011/status
 *      {
 *        "status": "shipped",
 *        "reason": "Tracking number: 1Z999AA10123456784"
 *      }
 *
 *   3. Cancel order:
 *      PUT /api/admin/orders/507f1f77bcf86cd799439011/status
 *      {
 *        "status": "cancelled",
 *        "reason": "Out of stock"
 *      }
 *
 *   4. Process refund:
 *      PUT /api/admin/orders/507f1f77bcf86cd799439011/status
 *      {
 *        "status": "refunded",
 *        "reason": "Customer requested refund - processed"
 *      }
 *
 * Use Cases:
 *   - Order fulfillment: Move order through workflow stages
 *   - Shipment tracking: Update when order ships
 *   - Customer service: Handle returns and cancellations
 *   - Refunds: Process refunds via status change
 */

/**
 * ==================== AUTHENTICATION ====================
 *
 * All endpoints (except /webhook) require Firebase JWT authentication
 *
 * Header Format:
 *   Authorization: Bearer <JWT_TOKEN>
 *
 * Token Acquisition:
 *   1. Register user: POST /api/auth/register
 *   2. Login: POST /api/auth/login
 *   3. Token returned in response
 *
 * Token Expiration:
 *   - Typical: 7 days
 *   - Refresh: Use login endpoint again
 *
 * Error Response (Missing Token):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: missing or invalid token"
 * }
 *
 * Error Response (Invalid Token):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: token expired or invalid"
 * }
 */

/**
 * ==================== ERROR CODES AND HANDLING ====================
 *
 * HTTP Status Code | Error Type | Meaning
 * ================================================================================
 * 400 Bad Request | ValidationError | Invalid input parameters or request body
 * 401 Unauthorized | AuthenticationError | Missing or invalid JWT token
 * 403 Forbidden | ForbiddenError | User lacks permission for this resource
 * 404 Not Found | NotFoundError | Resource does not exist
 * 409 Conflict | ConflictError | Operation violates constraints (e.g., invalid status transition)
 * 429 Too Many Requests | RateLimitError | Rate limit exceeded
 * 500 Internal Server Error | ServerError | Unexpected server error
 *
 * Common Error Scenarios:
 *
 * 1. Missing Authentication Token:
 *    Status: 401
 *    Message: "Unauthorized: missing or invalid token"
 *    Solution: Include Authorization header with JWT
 *
 * 2. Invalid Status Transition:
 *    Status: 400
 *    Message: "Invalid status transition"
 *    Solution: Check status workflow (see STATUS WORKFLOW section)
 *
 * 3. Order Not Found:
 *    Status: 404
 *    Message: "Order not found"
 *    Solution: Verify order ID is correct and belongs to user
 *
 * 4. Trying to Access Another User's Order:
 *    Status: 403
 *    Message: "Unauthorized: you do not have access to this order"
 *    Solution: Only access orders where user is the customer or admin
 *
 * 5. Invalid Query Parameters:
 *    Status: 400
 *    Message: "Validation error"
 *    Errors: Array of field-level errors
 *    Solution: Check parameter formats and values
 *
 * 6. Rate Limit Exceeded:
 *    Status: 429
 *    Message: "Too many requests from this IP"
 *    Headers: RateLimit-Limit, RateLimit-Remaining, RateLimit-Reset
 *    Solution: Wait before making more requests
 */

/**
 * ==================== INTEGRATION PATTERNS ====================
 *
 * Pattern 1: Fetch Customer's Recent Orders
 * ==========================================
 * const response = await fetch('/api/orders?page=1&limit=10&sortBy=createdAt&sortOrder=desc', {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * });
 * const { data } = await response.json();
 * console.log(data.orders); // Recent orders first
 *
 * Pattern 2: Filter Shipped Orders in Date Range
 * ==============================================
 * const response = await fetch(
 *   '/api/orders?status=shipped&dateFrom=2024-01-01&dateTo=2024-03-31&limit=50',
 *   { headers: { 'Authorization': `Bearer ${token}` } }
 * );
 *
 * Pattern 3: Search for Specific Order
 * ===================================
 * const response = await fetch('/api/orders/507f1f77bcf86cd799439011', {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * });
 * const { data } = await response.json();
 * console.log(data.order); // Single order
 *
 * Pattern 4: Admin - Get All Pending Orders
 * ========================================
 * const response = await fetch('/api/admin/orders?status=pending&limit=100', {
 *   headers: { 'Authorization': `Bearer ${adminToken}` }
 * });
 * const { data } = await response.json();
 * console.log(data.statistics); // Revenue metrics
 *
 * Pattern 5: Admin - Update Order Status with Reason
 * =================================================
 * const response = await fetch('/api/admin/orders/507f1f77bcf86cd799439011/status', {
 *   method: 'PUT',
 *   headers: {
 *     'Authorization': `Bearer ${adminToken}`,
 *     'Content-Type': 'application/json'
 *   },
 *   body: JSON.stringify({
 *     status: 'shipped',
 *     reason: 'Tracking: 1Z999AA10123456784'
 *   })
 * });
 *
 * Pattern 6: Get Order for Invoice Generation
 * ==========================================
 * const response = await fetch('/api/orders/507f1f77bcf86cd799439011/invoice', {
 *   headers: { 'Authorization': `Bearer ${token}` }
 * });
 * const { data } = await response.json();
 * // Generate PDF from data.invoice
 *
 * Pattern 7: Affiliate Dashboard - Get Commission Stats
 * ==================================================
 * const response = await fetch('/api/affiliate/orders?page=1&limit=50', {
 *   headers: { 'Authorization': `Bearer ${affiliateToken}` }
 * });
 * const { data } = await response.json();
 * console.log(data.statistics.totalCommission); // Total earnings
 */

/**
 * ==================== TESTING CHECKLIST ====================
 *
 * Authentication & Authorization Tests:
 * ✓ GET /api/orders without token → 401
 * ✓ GET /api/orders with invalid token → 401
 * ✓ GET /api/admin/orders as customer → 403
 * ✓ GET /api/affiliate/orders as customer → 403
 * ✓ GET /api/orders/:id (other user's order) → 403
 *
 * Customer Endpoint Tests:
 * ✓ GET /api/orders → returns customer's orders only
 * ✓ GET /api/orders?page=1&limit=5 → pagination works
 * ✓ GET /api/orders?status=shipped → filtering works
 * ✓ GET /api/orders?sortBy=total&sortOrder=asc → sorting works
 * ✓ GET /api/orders?dateFrom=2024-01-01 → date filtering works
 * ✓ GET /api/orders/:id → returns order details
 * ✓ GET /api/orders/summary → returns statistics
 * ✓ POST /api/orders/search with various filters → search works
 * ✓ GET /api/orders/:id/invoice → returns invoice data
 *
 * Admin Endpoint Tests:
 * ✓ GET /api/admin/orders → returns all orders with stats
 * ✓ GET /api/admin/orders?search=email → search by email works
 * ✓ GET /api/admin/orders?userId=... → filter by user works
 * ✓ GET /api/admin/orders?affiliateId=... → filter by affiliate works
 * ✓ PUT /api/admin/orders/:id/status with valid transition → succeeds
 * ✓ PUT /api/admin/orders/:id/status with invalid transition → 400
 *
 * Affiliate Endpoint Tests:
 * ✓ GET /api/affiliate/orders → returns affiliate's referred orders
 * ✓ GET /api/affiliate/orders includes statistics → commission stats returned
 *
 * Error Handling Tests:
 * ✓ GET /api/orders/invalid-id → 400 or 404
 * ✓ GET /api/orders?limit=999 → capped to 100
 * ✓ GET /api/orders?page=0 → defaults to 1
 * ✓ PUT /api/admin/orders/:id/status pending→shipped → succeeds
 * ✓ PUT /api/admin/orders/:id/status shipped→pending → 400 (invalid transition)
 *
 * Performance Tests:
 * ✓ GET /api/orders with 1000+ customer orders → returns paginated results
 * ✓ GET /api/admin/orders with large result set → returns with aggregated statistics
 * ✓ Pagination with limit=100 → doesn't timeout
 */

/**
 * ==================== NEXT STEPS ====================
 *
 * After Order Management API is complete:
 *
 * 1. Affiliate System (Phase 6)
 *    - Affiliate registration and profile
 *    - Unique affiliate codes/links
 *    - Dashboard view
 *
 * 2. Commission Engine (Phase 7)
 *    - Calculate commissions from orders
 *    - Track commission status
 *    - Balance management
 *
 * 3. Payout Module (Phase 8)
 *    - Payout requests
 *    - Approval workflow
 *    - Payment processing
 *
 * 4. Admin Dashboard APIs (Phase 9)
 *    - Analytics and reporting
 *    - Bulk operations
 *    - Advanced search
 */

module.exports = {};
