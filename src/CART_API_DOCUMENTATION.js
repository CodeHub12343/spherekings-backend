/**
 * SHOPPING CART API - COMPLETE REFERENCE
 * 
 * Production-ready implementation of the Shopping Cart system for Spherekings Marketplace
 * 
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * IMPORTANT: All Cart Endpoints Require Authentication
 * Every request must include: Authorization: Bearer <jwt_token>
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 1: GET /api/cart
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * PURPOSE: Retrieve authenticated user's complete shopping cart
 * 
 * METHOD: GET
 * ENDPOINT: /api/cart
 * AUTHENTICATION: Required (Bearer token in Authorization header)
 * 
 * REQUEST
 * ───────────────────────────────────────────────────────────────────────────
 * Headers:
 *   Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *   Content-Type: application/json
 * 
 * 
 * RESPONSE (200 OK)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": true,
 *   "message": "Cart retrieved successfully",
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "userId": "507f1f77bcf86cd799439012",
 *     "items": [
 *       {
 *         "_id": "607f1f77bcf86cd799439013",
 *         "productId": "507f1f77bcf86cd799439014",
 *         "quantity": 2,
 *         "price": 49.99,
 *         "variant": {
 *           "color": "Red",
 *           "edition": "Deluxe"
 *         },
 *         "subtotal": 99.98,
 *         "addedAt": "2026-03-13T10:00:00Z"
 *       },
 *       {
 *         "_id": "607f1f77bcf86cd799439014",
 *         "productId": "507f1f77bcf86cd799439015",
 *         "quantity": 1,
 *         "price": 29.99,
 *         "variant": {},
 *         "subtotal": 29.99,
 *         "addedAt": "2026-03-13T10:30:00Z"
 *       }
 *     ],
 *     "summary": {
 *       "itemCount": 2,
 *       "totalItems": 3,
 *       "subtotal": 129.97,
 *       "tax": 10.40,
 *       "total": 140.37
 *     },
 *     "createdAt": "2026-03-13T10:00:00Z",
 *     "updatedAt": "2026-03-13T10:30:00Z"
 *   }
 * }
 * 
 * 
 * EXAMPLE cURL
 * ───────────────────────────────────────────────────────────────────────────
 * curl -X GET "http://localhost:5000/api/cart" \
 *   -H "Authorization: Bearer <your_token>" \
 *   -H "Content-Type: application/json"
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 2: POST /api/cart/add
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * PURPOSE: Add product to cart or increase quantity if same product with variant exists
 * 
 * METHOD: POST
 * ENDPOINT: /api/cart/add
 * AUTHENTICATION: Required
 * 
 * REQUEST
 * ───────────────────────────────────────────────────────────────────────────
 * Headers:
 *   Authorization: Bearer <token>
 *   Content-Type: application/json
 * 
 * Body:
 * {
 *   "productId": "507f1f77bcf86cd799439014",
 *   "quantity": 2,
 *   "variant": {
 *     "color": "Red",
 *     "edition": "Deluxe"
 *   }
 * }
 * 
 * Field Descriptions:
 *   - productId (required): Valid MongoDB ObjectId of product from catalog
 *   - quantity (required): Positive integer (1-1000)
 *   - variant (optional): Object with variant selections (e.g., { color: "Red" })
 *     If product with same variant exists in cart, quantity increases instead of duplicating
 * 
 * 
 * RESPONSE (201 Created)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": true,
 *   "message": "Product added to cart successfully",
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "userId": "507f1f77bcf86cd799439012",
 *     "items": [ ... updated items array ... ],
 *     "summary": { ... updated summary ... }
 *   }
 * }
 * 
 * 
 * ERROR CASES
 * ───────────────────────────────────────────────────────────────────────────
 * 400 Bad Request - Invalid Input:
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": {
 *     "quantity": "Quantity must be at least 1"
 *   }
 * }
 * 
 * 404 Not Found - Product doesn't exist:
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Product not found"
 * }
 * 
 * 400 Bad Request - Out of stock:
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": {
 *     "productId": "This product is out of stock"
 *   }
 * }
 * 
 * 400 Bad Request - Invalid variant:
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": {
 *     "variant": "Variant type \"size\" is not available for this product"
 *   }
 * }
 * 
 * 
 * EXAMPLE cURL
 * ───────────────────────────────────────────────────────────────────────────
 * curl -X POST "http://localhost:5000/api/cart/add" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "productId": "507f1f77bcf86cd799439014",
 *     "quantity": 2,
 *     "variant": { "color": "Red" }
 *   }'
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 3: POST /api/cart/update
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * PURPOSE: Update quantity or variant of existing cart item
 * 
 * METHOD: POST
 * ENDPOINT: /api/cart/update
 * AUTHENTICATION: Required
 * 
 * REQUEST
 * ───────────────────────────────────────────────────────────────────────────
 * Body:
 * {
 *   "cartItemId": "607f1f77bcf86cd799439013",
 *   "quantity": 5
 * }
 * 
 * OR update variant:
 * {
 *   "cartItemId": "607f1f77bcf86cd799439013",
 *   "variant": { "color": "Blue" }
 * }
 * 
 * OR update both:
 * {
 *   "cartItemId": "607f1f77bcf86cd799439013",
 *   "quantity": 3,
 *   "variant": { "color": "Blue" }
 * }
 * 
 * Field Descriptions:
 *   - cartItemId (required): ID of cart item to update (NOT product ID)
 *     This is the _id field in the items array
 *   - quantity (optional): New quantity (1-1000)
 *   - variant (optional): New variant selection
 *   At least one of quantity or variant must be provided
 * 
 * 
 * RESPONSE (200 OK)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": true,
 *   "message": "Cart item updated successfully",
 *   "data": {
 *     ... updated cart ...
 *   }
 * }
 * 
 * 
 * ERROR CASES
 * ───────────────────────────────────────────────────────────────────────────
 * 404 Not Found - Item not in cart:
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Item not found in cart"
 * }
 * 
 * 400 Bad Request - Insufficient stock:
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": {
 *     "quantity": "Only 10 units available in stock"
 *   }
 * }
 * 
 * 
 * EXAMPLE cURL
 * ───────────────────────────────────────────────────────────────────────────
 * curl -X POST "http://localhost:5000/api/cart/update" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "cartItemId": "607f1f77bcf86cd799439013",
 *     "quantity": 5
 *   }'
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 4: POST /api/cart/remove
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * PURPOSE: Remove specific item from cart
 * 
 * METHOD: POST
 * ENDPOINT: /api/cart/remove
 * AUTHENTICATION: Required
 * 
 * REQUEST
 * ───────────────────────────────────────────────────────────────────────────
 * Body:
 * {
 *   "cartItemId": "607f1f77bcf86cd799439013"
 * }
 * 
 * Field Descriptions:
 *   - cartItemId (required): ID of item to remove (the _id from items array)
 *     Note: This is the item ID, not the product ID.
 *           Use this to remove one variant while keeping same product with different variant
 * 
 * 
 * RESPONSE (200 OK)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": true,
 *   "message": "Item removed from cart successfully",
 *   "data": {
 *     ... updated cart without that item ...
 *   }
 * }
 * 
 * 
 * ERROR CASES
 * ───────────────────────────────────────────────────────────────────────────
 * 404 Not Found - Item not found:
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Item not found in cart"
 * }
 * 
 * 
 * EXAMPLE cURL
 * ───────────────────────────────────────────────────────────────────────────
 * curl -X POST "http://localhost:5000/api/cart/remove" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{
 *     "cartItemId": "607f1f77bcf86cd799439013"
 *   }'
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 5: POST /api/cart/clear
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * PURPOSE: Remove all items from cart at once
 * 
 * METHOD: POST
 * ENDPOINT: /api/cart/clear
 * AUTHENTICATION: Required
 * 
 * REQUEST
 * ───────────────────────────────────────────────────────────────────────────
 * Headers:
 *   Authorization: Bearer <token>
 *   Content-Type: application/json
 * 
 * Body: {} (Empty)
 * 
 * 
 * RESPONSE (200 OK)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": true,
 *   "message": "Cart cleared successfully",
 *   "data": {
 *     "_id": "507f1f77bcf86cd799439011",
 *     "userId": "507f1f77bcf86cd799439012",
 *     "items": [],
 *     "summary": {
 *       "itemCount": 0,
 *       "totalItems": 0,
 *       "subtotal": 0,
 *       "tax": 0,
 *       "total": 0
 *     }
 *   }
 * }
 * 
 * 
 * EXAMPLE cURL
 * ───────────────────────────────────────────────────────────────────────────
 * curl -X POST "http://localhost:5000/api/cart/clear" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{}'
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 6: GET /api/cart/summary
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * PURPOSE: Get cart totals and item counts (lightweight endpoint)
 * 
 * METHOD: GET
 * ENDPOINT: /api/cart/summary
 * AUTHENTICATION: Required
 * 
 * USE CASE: Quick summary data without fetching full cart details
 * Useful for: Header cart badge, cart icon counters, checkout pages
 * 
 * 
 * RESPONSE (200 OK)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": true,
 *   "message": "Cart summary retrieved successfully",
 *   "data": {
 *     "itemCount": 2,
 *     "totalItems": 3,
 *     "subtotal": 129.97,
 *     "tax": 10.40,
 *     "total": 140.37
 *   }
 * }
 * 
 * 
 * EXAMPLE cURL
 * ───────────────────────────────────────────────────────────────────────────
 * curl -X GET "http://localhost:5000/api/cart/summary" \
 *   -H "Authorization: Bearer <token>"
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ENDPOINT 7: POST /api/cart/validate
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * PURPOSE: Validate cart before checkout
 * 
 * METHOD: POST
 * ENDPOINT: /api/cart/validate
 * AUTHENTICATION: Required
 * 
 * Validates:
 * - All products still exist
 * - All products are still active
 * - All items have sufficient stock
 * - Prices haven't changed (reports if they have)
 * 
 * USE CASE: Call this before redirecting to checkout to catch issues
 * 
 * 
 * RESPONSE (200 OK - Cart Valid)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": true,
 *   "message": "Cart validation completed",
 *   "data": {
 *     "valid": true,
 *     "cart": {
 *       ... full cart data ...
 *       "summary": { ... }
 *     }
 *   }
 * }
 * 
 * 
 * RESPONSE (400 Bad Request - Validation Issues)
 * ───────────────────────────────────────────────────────────────────────────
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Cart validation failed",
 *   "errors": {
 *     "issues": [
 *       {
 *         "itemId": "607f1f77bcf86cd799439013",
 *         "productId": "507f1f77bcf86cd799439014",
 *         "issue": "Only 2 units available (requested 5)"
 *       },
 *       {
 *         "itemId": "607f1f77bcf86cd799439014",
 *         "productId": "507f1f77bcf86cd799439015",
 *         "issue": "price_updated",
 *         "oldPrice": 49.99,
 *         "newPrice": 54.99
 *       }
 *     ]
 *   }
 * }
 * 
 * 
 * EXAMPLE cURL
 * ───────────────────────────────────────────────────────────────────────────
 * curl -X POST "http://localhost:5000/api/cart/validate" \
 *   -H "Authorization: Bearer <token>" \
 *   -H "Content-Type: application/json" \
 *   -d '{}'
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// COMPLETE WORKFLOW EXAMPLE
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * TYPICAL USER FLOW
 * 
 * 1. User logs in and gets JWT token
 *    POST /api/auth/login
 *    Response includes: { token: "...", user: {...} }
 * 
 * 2. User browses products
 *    GET /api/products
 *    (No auth required)
 * 
 * 3. User clicks "Add to Cart" button
 *    POST /api/cart/add
 *    Body: { productId: "...", quantity: 1, variant: {...} }
 *    Response: Updated cart
 * 
 * 4. User continues shopping, adds more products
 *    POST /api/cart/add (multiple times)
 * 
 * 5. User views shopping cart
 *    GET /api/cart
 *    Response: Full cart with all items and totals
 * 
 * 6. User updates cart
 *    POST /api/cart/update
 *    Body: { cartItemId: "...", quantity: 5 }
 *    Response: Updated cart
 * 
 * 7. User decides not to buy one item
 *    POST /api/cart/remove
 *    Body: { cartItemId: "..." }
 *    Response: Updated cart without that item
 * 
 * 8. User proceeds to checkout
 *    POST /api/cart/validate (optional but recommended)
 *    Response: Validates everything is OK
 * 
 * 9. Checkout system receives valid cart
 *    Data from cart converted to order
 *    Stock is decremented
 *    Cart can be cleared after order creation
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// ERROR CODES & HTTP STATUS
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * 200 OK
 * - Successful GET or status-check POST
 * - Cart retrieved, summary fetched, validation completed
 * 
 * 201 Created
 * - Product successfully added to cart
 * - POST /api/cart/add returns 201
 * 
 * 400 Bad Request
 * - Validation error in request body
 * - Invalid productId, quantity, or variant
 * - Product out of stock
 * - Insufficient stock for quantity
 * - Invalid variant selection
 * - No updates provided to cart/update endpoint
 * 
 * 401 Unauthorized
 * - Missing or invalid JWT token
 * - User must be authenticated
 * 
 * 404 Not Found
 * - Product doesn't exist
 * - Cart item not found in user's cart
 * 
 * 500 Internal Server Error
 * - Unexpected server error
 * - Database connection issue
 */

// ════════════════════════════════════════════════════════════════════════════════════════
// IMPORTANT NOTES
// ════════════════════════════════════════════════════════════════════════════════════════

/**
 * CART ITEM IDs vs PRODUCT IDs
 * ──────────────────────────────────────────────────────────────────────────
 * When removing or updating items, use cartItemId, NOT productId
 * 
 * Example cart structure:
 * {
 *   items: [
 *     {
 *       _id: "CART_ITEM_ID_1",        ← Use THIS for remove/update
 *       productId: "PRODUCT_ID_1",    ← Use THIS for adding
 *       quantity: 2,
 *       variant: { color: "Red" }
 *     }
 *   ]
 * }
 * 
 * VARIANTS & DUPLICATE PRODUCTS
 * ──────────────────────────────────────────────────────────────────────────
 * Same product with different variants creates separate cart items
 * 
 * Example:
 * - Add: { productId: "ABC", variant: { color: "Red" }, qty: 2 } → Creates item 1
 * - Add: { productId: "ABC", variant: { color: "Blue" }, qty: 3 } → Creates item 2
 * 
 * But:
 * - Add: { productId: "ABC", variant: { color: "Red" }, qty: 2 }
 * - Add: { productId: "ABC", variant: { color: "Red" }, qty: 3 } → Updates qty to 5
 * 
 * PRICE SNAPSHOTS
 * ──────────────────────────────────────────────────────────────────────────
 * Price stored in cart is the price at the time item was added
 * If product price changes, cart still shows original price
 * Validation endpoint warns about price changes
 * 
 * TAX CALCULATION
 * ──────────────────────────────────────────────────────────────────────────
 * Tax is calculated at 8% by default (configurable)
 * formula: tax = subtotal * 0.08
 * 
 * ITEM COUNT vs TOTAL ITEMS
 * ──────────────────────────────────────────────────────────────────────────
 * itemCount = number of unique items in cart
 * totalItems = sum of all quantities (what customers usually expect)
 * 
 * Example: { Red: qty 2, Blue: qty 3 }
 * itemCount = 2
 * totalItems = 5
 */

module.exports = {
  description: 'Shopping Cart API Documentation',
  version: '1.0.0',
  lastUpdated: '2026-03-13',
  endpoints: 7,
  requiresAuthentication: true,
  features: [
    'Add to cart with variants',
    'Update quantities',
    'Change variants',
    'Remove items',
    'Clear cart',
    'Cart summaries',
    'Pre-checkout validation',
    'Stock validation',
    'Price integrity',
  ],
};
