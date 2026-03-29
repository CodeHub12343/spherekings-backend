/**
 * Cart Routes
 * Defines all shopping cart API endpoints
 * All routes require authentication - customers can only access their own cart
 */

const express = require('express');
const router = express.Router();

// Import controller
const cartController = require('../controllers/cartController');

// Import middleware
const { authenticate } = require('../middlewares/authMiddleware');

// Import validators
const {
  validateCart,
  addToCartSchema,
  updateCartItemSchema,
  removeFromCartSchema,
} = require('../validators/cartValidator');

/**
 * =====================================================
 * ALL CART ROUTES REQUIRE AUTHENTICATION
 * User can only access their own cart (tied to req.user)
 * =====================================================
 */

/**
 * GET /api/cart
 * Retrieve authenticated user's shopping cart
 * Includes all items with product details and calculated totals
 *
 * Response:
 * {
 *   "success": true,
 *   "message": "Cart retrieved successfully",
 *   "data": {
 *     "_id": "...",
 *     "userId": "...",
 *     "items": [
 *       {
 *         "_id": "...",
 *         "productId": "...",
 *         "quantity": 2,
 *         "price": 49.99,
 *         "variant": { "color": "Red" },
 *         "subtotal": 99.98,
 *         "addedAt": "..."
 *       }
 *     ],
 *     "summary": {
 *       "itemCount": 1,
 *       "totalItems": 2,
 *       "subtotal": 99.98,
 *       "tax": 8.00,
 *       "total": 107.98
 *     }
 *   }
 * }
 */
router.get('/', authenticate, cartController.getCart);

/**
 * POST /api/cart/add
 * Add product to cart or increase quantity if product with same variant exists
 * Validates product exists, is active, and has sufficient stock
 *
 * Request Body:
 * {
 *   "productId": "507f1f77bcf86cd799439011",
 *   "quantity": 2,
 *   "variant": { "color": "Red", "edition": "Deluxe" }
 * }
 *
 * Response (201 Created):
 * {
 *   "success": true,
 *   "message": "Product added to cart successfully",
 *   "data": { ... updated cart ... }
 * }
 *
 * Possible Errors:
 * - 400 Bad Request: Invalid input data
 * - 404 Not Found: Product doesn't exist
 * - 400 Bad Request: Product out of stock or insufficient stock
 * - 400 Bad Request: Invalid variant selection
 */
router.post('/add', authenticate, validateCart(addToCartSchema, 'body'), cartController.addToCart);

/**
 * POST /api/cart/update
 * Update quantity or variant of existing cart item
 * Can update one or both fields
 *
 * Request Body:
 * {
 *   "cartItemId": "607f1f77bcf86cd799439013",
 *   "quantity": 5,
 *   "variant": { "color": "Blue" }
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Cart item updated successfully",
 *   "data": { ... updated cart ... }
 * }
 *
 * Possible Errors:
 * - 400 Bad Request: Invalid input or no updates provided
 * - 404 Not Found: Cart item not found
 * - 400 Bad Request: Insufficient stock for new quantity
 * - 400 Bad Request: Invalid variant selection
 */
router.post(
  '/update',
  authenticate,
  validateCart(updateCartItemSchema, 'body'),
  cartController.updateCartItem
);

/**
 * POST /api/cart/remove
 * Remove specific item from cart
 * Identified by cart item ID (not product ID)
 *
 * Request Body:
 * {
 *   "cartItemId": "607f1f77bcf86cd799439013"
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Item removed from cart successfully",
 *   "data": { ... updated cart ... }
 * }
 *
 * Possible Errors:
 * - 400 Bad Request: Invalid cart item ID
 * - 404 Not Found: Item not found in cart
 */
router.post(
  '/remove',
  authenticate,
  validateCart(removeFromCartSchema, 'body'),
  cartController.removeFromCart
);

/**
 * POST /api/cart/clear
 * Remove all items from cart
 * No request body required
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Cart cleared successfully",
 *   "data": {
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
 */
router.post('/clear', authenticate, cartController.clearCart);

/**
 * GET /api/cart/summary
 * Get cart totals summary without full item details
 * Lightweight endpoint for quick summary info
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Cart summary retrieved successfully",
 *   "data": {
 *     "itemCount": 3,
 *     "totalItems": 5,
 *     "subtotal": 249.95,
 *     "tax": 20.00,
 *     "total": 269.95
 *   }
 * }
 */
router.get('/summary', authenticate, cartController.getCartSummary);

/**
 * POST /api/cart/validate
 * Validate cart before checkout
 * Checks all products still exist, in stock, prices current
 * Returns validation issues if any
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "message": "Cart validation completed",
 *   "data": {
 *     "valid": true,
 *     "cart": { ... full cart data ... }
 *   }
 * }
 *
 * Response (400 Bad Request):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Cart validation failed",
 *   "errors": {
 *     "issues": [
 *       { "itemId": "...", "issue": "Only 2 units available (requested 5)" },
 *       { "itemId": "...", "issue": "price_updated", "oldPrice": 49.99, "newPrice": 54.99 }
 *     ]
 *   }
 * }
 */
router.post('/validate', authenticate, cartController.validateCart);

module.exports = router;
