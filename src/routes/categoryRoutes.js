/**
 * Category Routes
 * Defines all category-related API endpoints
 */

const express = require('express');
const router = express.Router();

// Import controller
const categoryController = require('../controllers/categoryController');

// Import middleware
const { authenticate } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * =====================================================
 * PUBLIC ROUTES (No authentication required)
 * =====================================================
 */

/**
 * GET /api/v1/categories
 * Get all categories
 * Query params: isActive (optional - 'true' to get only active)
 */
router.get('/', categoryController.getCategories);

/**
 * GET /api/v1/categories/:id
 * Get single category by ID
 */
router.get('/:id', categoryController.getCategoryById);

/**
 * =====================================================
 * ADMIN ROUTES (Protected - Admin only)
 * =====================================================
 */

/**
 * POST /api/v1/categories
 * Create new category
 * Body: { name, displayName, description?, image?, sortOrder? }
 */
router.post(
  '/',
  authenticate,
  authorize('admin'),
  categoryController.createCategory
);

/**
 * PUT /api/v1/categories/:id
 * Update category
 * Body: { name?, displayName?, description?, image?, sortOrder?, isActive? }
 */
router.put(
  '/:id',
  authenticate,
  authorize('admin'),
  categoryController.updateCategory
);

/**
 * DELETE /api/v1/categories/:id
 * Delete category
 */
router.delete(
  '/:id',
  authenticate,
  authorize('admin'),
  categoryController.deleteCategory
);

module.exports = router;
