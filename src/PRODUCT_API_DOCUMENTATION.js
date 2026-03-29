/**
 * PRODUCT CATALOG & MARKETPLACE BACKEND - IMPLEMENTATION COMPLETE
 * 
 * Production-ready implementation of the Product Catalog system for Spherekings Marketplace
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * API ENDPOINTS - COMPREHENSIVE REFERENCE
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// PUBLIC ENDPOINTS (No Authentication Required)
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * 1. GET /api/products
 * ─────────────────────────────────────────────────────────────────────────────
 * Retrieve all active products with pagination and filtering
 * 
 * Query Parameters:
 *   - page (number, optional, default: 1) - Page number for pagination
 *   - limit (number, optional, default: 10, max: 100) - Items per page
 *   - status (string, optional, default: 'active') - Filter by status: active|inactive|out_of_stock
 *   - category (string, optional) - Filter by category
 *   - sort (string, optional, default: '-createdAt') - Sort field (prefix with - for descending)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Products retrieved successfully",
 *   "data": [
 *     {
 *       "_id": "507f1f77bcf86cd799439011",
 *       "name": "sphere of kings deluxe edition",
 *       "description": "Premium board game with enhanced components...",
 *       "price": 49.99,
 *       "images": ["https://cdn.example.com/image1.jpg"],
 *       "variants": [
 *         { "name": "color", "options": ["Red", "Blue", "Gold"] }
 *       ],
 *       "stock": 100,
 *       "status": "active",
 *       "isFeatured": true,
 *       "createdAt": "2026-03-13T10:00:00Z",
 *       "updatedAt": "2026-03-13T10:00:00Z"
 *     }
 *   ],
 *   "pagination": {
 *     "currentPage": 1,
 *     "totalPages": 5,
 *     "totalItems": 45,
 *     "itemsPerPage": 10,
 *     "hasNextPage": true,
 *     "hasPreviousPage": false
 *   }
 * }
 * 
 * Example:
 * curl "http://localhost:5000/api/products?page=1&limit=10&status=active"
 */

/**
 * 2. GET /api/products/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Retrieve detailed information for a single product
 * 
 * URL Parameters:
 *   - id (string, required) - MongoDB product ID (24-char hex string)
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Product retrieved successfully",
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "name": "sphere of kings deluxe edition",
 *     "description": "Premium board game with enhanced components...",
 *     "price": 49.99,
 *     "images": [
 *       "https://cdn.example.com/image1.jpg",
 *       "https://cdn.example.com/image2.jpg",
 *       "https://cdn.example.com/image3.jpg"
 *     ],
 *     "variants": [
 *       { "name": "color", "options": ["Red", "Blue", "Gold"] },
 *       { "name": "edition", "options": ["Standard", "Deluxe"] }
 *     ],
 *     "stock": 100,
 *     "status": "active",
 *     "category": "board-games",
 *     "sku": "SKU001",
 *     "isFeatured": true,
 *     "createdAt": "2026-03-13T10:00:00Z",
 *     "updatedAt": "2026-03-13T10:00:00Z"
 *   }
 * }
 * 
 * Error (404 Not Found):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Product not found"
 * }
 * 
 * Example:
 * curl "http://localhost:5000/api/products/507f1f77bcf86cd799439011"
 */

/**
 * 3. GET /api/products/featured
 * ─────────────────────────────────────────────────────────────────────────────
 * Get featured products for homepage display
 * 
 * Query Parameters:
 *   - limit (number, optional, default: 8) - Maximum number of products to return
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Featured products retrieved successfully",
 *   "data": [
 *     { ... product object ... },
 *     { ... product object ... }
 *   ]
 * }
 * 
 * Example:
 * curl "http://localhost:5000/api/products/featured?limit=8"
 */

/**
 * 4. GET /api/products/search?q=query
 * ─────────────────────────────────────────────────────────────────────────────
 * Search products by name or description (full-text search)
 * 
 * Query Parameters:
 *   - q (string, required) - Search term (min: 2, max: 100 characters)
 *   - page (number, optional, default: 1) - Page number
 *   - limit (number, optional, default: 10, max: 100) - Items per page
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Search completed successfully",
 *   "data": [ ... matching products ... ],
 *   "pagination": { ... pagination info ... }
 * }
 * 
 * Error (400 Bad Request):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": {
 *     "q": "Search term is required"
 *   }
 * }
 * 
 * Example:
 * curl "http://localhost:5000/api/products/search?q=deluxe&page=1&limit=10"
 */

/**
 * 5. GET /api/products/:id/related
 * ─────────────────────────────────────────────────────────────────────────────
 * Get products related to a specific product (by category or variants)
 * 
 * URL Parameters:
 *   - id (string, required) - MongoDB product ID
 * 
 * Query Parameters:
 *   - limit (number, optional, default: 5) - Maximum number of related products
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Related products retrieved successfully",
 *   "data": [ ... related products ... ]
 * }
 * 
 * Example:
 * curl "http://localhost:5000/api/products/507f1f77bcf86cd799439011/related?limit=5"
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ADMIN ENDPOINTS (Authentication & Admin Role Required)
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * 6. POST /api/products
 * ─────────────────────────────────────────────────────────────────────────────
 * Create a new product (Admin only)
 * 
 * Authentication:
 *   - Header: Authorization: Bearer <jwt_token>
 *   - User must have role: 'admin'
 * 
 * Request Body:
 * {
 *   "name": "Sphere of Kings Deluxe Edition",
 *   "description": "Premium board game with enhanced components and exclusive accessories",
 *   "price": 49.99,
 *   "images": [
 *     "https://cdn.example.com/image1.jpg",
 *     "https://cdn.example.com/image2.jpg"
 *   ],
 *   "variants": [
 *     {
 *       "name": "color",
 *       "options": ["Red", "Blue", "Gold"]
 *     },
 *     {
 *       "name": "edition",
 *       "options": ["Standard", "Deluxe"]
 *     }
 *   ],
 *   "stock": 100,
 *   "category": "board-games",
 *   "sku": "SKU001",
 *   "isFeatured": true
 * }
 * 
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Product created successfully",
 *   "data": { ... created product with _id ... }
 * }
 * 
 * Error (409 Conflict):
 * {
 *   "success": false,
 *   "statusCode": 409,
 *   "message": "Product with name \"Sphere of Kings Deluxe Edition\" already exists"
 * }
 * 
 * Error (400 Bad Request - Validation):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": {
 *     "price": "Price must be a positive number",
 *     "stock": "Stock cannot be negative"
 *   }
 * }
 * 
 * Example:
 * curl -X POST "http://localhost:5000/api/products" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{ "name": "...", "description": "...", ... }'
 */

/**
 * 7. PUT /api/products/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Update an existing product (Admin only)
 * 
 * Authentication:
 *   - Header: Authorization: Bearer <jwt_token>
 *   - User must have role: 'admin'
 * 
 * URL Parameters:
 *   - id (string, required) - MongoDB product ID
 * 
 * Request Body (all fields optional, send only what you want to update):
 * {
 *   "price": 54.99,
 *   "stock": 85,
 *   "status": "active",
 *   "isFeatured": false
 * }
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Product updated successfully",
 *   "data": { ... updated product ... }
 * }
 * 
 * Error (404 Not Found):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Product not found"
 * }
 * 
 * Example:
 * curl -X PUT "http://localhost:5000/api/products/507f1f77bcf86cd799439011" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{ "price": 54.99, "stock": 85 }'
 */

/**
 * 8. DELETE /api/products/:id
 * ─────────────────────────────────────────────────────────────────────────────
 * Delete/deactivate a product (Admin only)
 * Uses soft delete - product is marked as deleted but retained in database
 * 
 * Authentication:
 *   - Header: Authorization: Bearer <jwt_token>
 *   - User must have role: 'admin'
 * 
 * URL Parameters:
 *   - id (string, required) - MongoDB product ID
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Product deleted successfully",
 *   "data": { ... soft-deleted product with deletedAt timestamp ... }
 * }
 * 
 * Error (404 Not Found):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Product not found"
 * }
 * 
 * Example:
 * curl -X DELETE "http://localhost:5000/api/products/507f1f77bcf86cd799439011" \
 *   -H "Authorization: Bearer <token>"
 */

/**
 * 9. PUT /api/products/:id/stock
 * ─────────────────────────────────────────────────────────────────────────────
 * Update product stock (for orders, refunds, returns)
 * Admin only - performs atomic stock updates
 * 
 * Authentication:
 *   - Header: Authorization: Bearer <jwt_token>
 *   - User must have role: 'admin'
 * 
 * URL Parameters:
 *   - id (string, required) - MongoDB product ID
 * 
 * Request Body:
 * {
 *   "quantity": 10,
 *   "operation": "decrement"
 * }
 * 
 * Fields:
 *   - quantity (number, required) - Amount to increment/decrement (must be positive)
 *   - operation (string, required) - 'increment' or 'decrement'
 * 
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Product stock updated successfully",
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "name": "sphere of kings deluxe edition",
 *     "stock": 90,
 *     "status": "active",
 *     ... other product fields ...
 *   }
 * }
 * 
 * Note: If stock reaches 0, status automatically changes to 'out_of_stock'
 * 
 * Error (400 Bad Request):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": {
 *     "quantity": "Quantity must be a positive number",
 *     "operation": "Operation must be 'increment' or 'decrement'"
 *   }
 * }
 * 
 * Example:
 * curl -X PUT "http://localhost:5000/api/products/507f1f77bcf86cd799439011/stock" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{ "quantity": 10, "operation": "decrement" }'
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// AUTHENTICATION FLOW EXAMPLE
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * Step 1: Get JWT Token (via /api/auth/login endpoint)
 * ─────────────────────────────────────────────────────────────────────────
 * POST /api/auth/login
 * {
 *   "email": "admin@spherekings.com",
 *   "password": "securePassword123"
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
 *   "user": {
 *     "_id": "507f1f77bcf86cd799439012",
 *     "email": "admin@spherekings.com",
 *     "name": "Admin User",
 *     "role": "admin"
 *   }
 * }
 */

/**
 * Step 2: Use Token in Admin Requests
 * ─────────────────────────────────────────────────────────────────────────
 * POST /api/products (or any admin endpoint)
 * Headers:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *   Content-Type: application/json
 * 
 * Body:
 *   { "name": "Product", "description": "...", ... }
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ERROR RESPONSE CODES & MESSAGES
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * 200 OK
 * - Successful GET, PUT request
 * 
 * 201 Created
 * - Successful POST request (product created)
 * 
 * 400 Bad Request
 * - Validation error in request body/params
 * - Missing required fields
 * - Invalid field formats
 * 
 * 401 Unauthorized
 * - Missing or invalid JWT token
 * - Token has expired
 * 
 * 403 Forbidden
 * - User authenticated but lacks required role
 * - Trying to access admin endpoints with customer role
 * 
 * 404 Not Found
 * - Product ID doesn't exist
 * - Invalid product ID format
 * 
 * 409 Conflict
 * - Product name already exists
 * - Duplicate unique field
 * 
 * 500 Internal Server Error
 * - Unexpected server error
 * - Database connection issue
 * - Unhandled exception
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// PROJECT STRUCTURE
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * src/
 * ├── config/
 * │   └── database.js              - MongoDB connection configuration
 * │
 * ├── models/
 * │   └── Product.js               - Mongoose schema with validation, helpers, indexes
 * │
 * ├── services/
 * │   └── productService.js        - Business logic layer (CRUD, search, stock management)
 * │
 * ├── controllers/
 * │   └── productController.js     - HTTP request handlers, response formatting
 * │
 * ├── routes/
 * │   └── productRoutes.js         - API endpoint definitions with middleware chain
 * │
 * ├── validators/
 * │   └── productValidator.js      - Joi validation schemas and middleware
 * │
 * ├── middlewares/
 * │   ├── authMiddleware.js        - JWT authentication (existing)
 * │   ├── roleMiddleware.js        - Role-based authorization (existing)
 * │   └── errorHandler.js          - Global error handling (existing)
 * │
 * ├── utils/
 * │   └── errors.js                - Custom error classes
 * │
 * └── server.js                    - Express app setup, middleware integration
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// FEATURE CAPABILITIES
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * ✅ Product Management
 *    - Create products with variants, images, pricing
 *    - Update product details (partial updates supported)
 *    - Soft delete products (preserve data)
 *    - Manage product status (active/inactive/out_of_stock)
 *    - Set featured products for homepage
 * 
 * ✅ Product Browsing
 *    - List all active products with pagination
 *    - Filter by status, category
 *    - Sort by various fields
 *    - Full-text search on name/description
 *    - View detailed product information
 * 
 * ✅ Inventory Management
 *    - Track product stock levels
 *    - Atomic stock updates (increment/decrement)
 *    - Automatic status updates based on stock
 *    - Stock updates for orders/refunds/returns
 * 
 * ✅ Product Variants
 *    - Support for color, edition, size, material variants
 *    - Multiple variant types per product
 *    - Multiple options per variant type
 *    - Flexible variant structure
 * 
 * ✅ Product Features
 *    - Multiple product images
 *    - Product categories
 *    - SKU management
 *    - Featured product selection
 *    - Related products recommendation
 *    - Product creation/update timestamps
 * 
 * ✅ Data Integrity
 *    - Input validation with detailed error messages
 *    - MongoDB schema validation
 *    - Unique constraint on product name
 *    - Required field validation
 *    - Type enforcement
 * 
 * ✅ Security
 *    - Admin-only product management
 *    - JWT authentication
 *    - Role-based authorization
 *    - Input sanitization
 *    - No sensitive data leaks in errors
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// INTEGRATION WITH AFFILIATE SYSTEM
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * The Product Catalog integrates seamlessly with the Affiliate System:
 * 
 * 1. Product Browsing
 *    - Customers browse products via GET /api/products endpoints
 *    - Affiliate links include ?ref=<affiliateCode> parameter
 *    - Frontend tracks affiliate code in cookies before purchase
 * 
 * 2. Orders & Commissions
 *    - When order is created, affiliate ID is stored in Order.affiliateId
 *    - Commission Engine calculates earnings based on product price
 *    - Stock is decremented via PUT /api/products/:id/stock endpoint
 * 
 * 3. Affiliate Performance
 *    - Products can be flagged as featured to promote high-margin items
 *    - Product data included in affiliate dashboard
 *    - Sales generated through affiliate links attributed to products
 */

module.exports = {
  description: 'Product Catalog & Marketplace API Documentation',
  version: '1.0.0',
  lastUpdated: '2026-03-13'
};
