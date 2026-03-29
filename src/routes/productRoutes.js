/**
 * Product Routes
 * Defines all product-related API endpoints
 * Includes public browsing routes and admin management routes
 * Protected by authentication and authorization middleware
 */

const express = require('express');
const router = express.Router();

// Import controllers
const productController = require('../controllers/productController');

// Import middleware
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');
const { uploadMultipleImages } = require('../middlewares/fileUploadMiddleware');

// Import validators
const {
  validateProduct,
  createProductSchema,
  updateProductSchema,
  paginationSchema,
  searchProductSchema,
  updateStockSchema,
} = require('../validators/productValidator');

/**
 * PUBLIC ROUTES
 * Accessible to all users (no authentication required)
 */

/**
 * GET /api/products
 * Retrieve all active products with pagination and filtering
 * Query params: page, limit, status, category, sort
 */
router.get('/', productController.getProducts);

/**
 * GET /api/products/featured
 * Get featured products for homepage display
 * Query params: limit (optional)
 */
router.get('/featured', productController.getFeaturedProducts);

/**
 * GET /api/products/search
 * Search products by name or description
 * Query params: q (search term), page, limit
 */
router.get(
  '/search',
  validateProduct(searchProductSchema, 'query'),
  productController.searchProducts
);

/**
 * GET /api/products/:id
 * Retrieve single product details by ID
 */
router.get('/:id', productController.getProductById);

/**
 * GET /api/products/:id/related
 * Get related products based on category or variants
 * Query params: limit (optional)
 */
router.get('/:id/related', productController.getRelatedProducts);

/**
 * =====================================================
 * ADMIN ROUTES (Protected)
 * Require authentication and admin role
 * =====================================================
 */

/**
 * POST /api/v1/products
 * Create a new product
 * Body: { name, description, price, stock, category, sku, isFeatured, status }
 * Files: images (multipart/form-data)
 * Access: Admin only
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  uploadMultipleImages,
  validateProduct(createProductSchema, 'body'),
  productController.createProduct
);

/**
 * PUT /api/admin/products/:id
 * Update an existing product
 * Body: Product fields to update (partial)
 * Files: images (optional multipart/form-data)
 * Access: Admin only
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  uploadMultipleImages,
  validateProduct(updateProductSchema, 'body'),
  productController.updateProduct
);

/**
 * DELETE /api/admin/products/:id
 * Soft delete a product
 * Access: Admin only
 */
router.delete('/:id', authenticate, authorize('admin'), productController.deleteProduct);

/**
 * PUT /api/admin/products/:id/stock
 * Update product stock (for orders, refunds, etc.)
 * Body: { quantity, operation: 'increment' | 'decrement' }
 * Access: Admin only
 */
router.put(
  '/:id/stock',
  authenticate,
  authorize('admin'),
  validateProduct(updateStockSchema, 'body'),
  productController.updateStock
);

module.exports = router;
