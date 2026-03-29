/**
 * Category Controller
 * Handles all product category operations
 */

const Category = require('../models/Category');
const { NotFoundError, ValidationError, ConflictError, ServerError } = require('../utils/errors');

class CategoryController {
  /**
   * GET /api/v1/categories
   * Get all categories (public endpoint)
   * Query params: isActive (optional)
   */
  async getCategories(req, res) {
    try {
      const { isActive } = req.query;
      
      const filter = {};
      if (isActive === 'true') {
        filter.isActive = true;
      }

      const categories = await Category.find(filter)
        .sort({ sortOrder: 1, name: 1 })
        .lean();

      console.log(`📂 GET /categories - Found ${categories.length} categories`);

      return res.json({
        success: true,
        data: categories,
        count: categories.length,
      });
    } catch (error) {
      console.error('❌ Error fetching categories:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching categories',
        error: error.message,
      });
    }
  }

  /**
   * GET /api/v1/categories/:id
   * Get single category by ID
   */
  async getCategoryById(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      console.log(`✅ GET /categories/${id} - Retrieved: ${category.name}`);

      return res.json({
        success: true,
        data: category.toJSON(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      console.error('❌ Error fetching category:', error);
      return res.status(500).json({
        success: false,
        message: 'Error fetching category',
        error: error.message,
      });
    }
  }

  /**
   * POST /api/v1/categories
   * Create new category (Admin only)
   */
  async createCategory(req, res) {
    try {
      const { name, displayName, description, image, sortOrder } = req.body;

      // Validation
      if (!name || !displayName) {
        throw new ValidationError('Name and display name are required');
      }

      // Check if category already exists
      const existing = await Category.findOne({
        $or: [
          { name: name.toLowerCase().trim() },
          { displayName: displayName.trim() },
        ],
      });

      if (existing) {
        throw new ConflictError('Category already exists with this name or display name');
      }

      // Create category
      const category = new Category({
        name: name.toLowerCase().trim(),
        displayName: displayName.trim(),
        description: description?.trim() || '',
        image: image?.trim() || null,
        sortOrder: sortOrder || 0,
      });

      await category.save();

      console.log(`✅ Created category: ${category.name}`);

      return res.status(201).json({
        success: true,
        message: 'Category created successfully',
        data: category.toJSON(),
      });
    } catch (error) {
      if (error instanceof ValidationError || error instanceof ConflictError) {
        return res.status(error instanceof ValidationError ? 400 : 409).json({
          success: false,
          message: error.message,
        });
      }

      if (error.code === 11000) {
        return res.status(409).json({
          success: false,
          message: 'Category with this name already exists',
        });
      }

      console.error('❌ Error creating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Error creating category',
        error: error.message,
      });
    }
  }

  /**
   * PUT /api/v1/categories/:id
   * Update category (Admin only)
   */
  async updateCategory(req, res) {
    try {
      const { id } = req.params;
      const { name, displayName, description, image, sortOrder, isActive } = req.body;

      const category = await Category.findById(id);

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      // Update allowed fields
      if (name) category.name = name.toLowerCase().trim();
      if (displayName) category.displayName = displayName.trim();
      if (description !== undefined) category.description = description?.trim() || '';
      if (image !== undefined) category.image = image?.trim() || null;
      if (sortOrder !== undefined) category.sortOrder = sortOrder;
      if (isActive !== undefined) category.isActive = isActive;

      await category.save();

      console.log(`✅ Updated category: ${category.name}`);

      return res.json({
        success: true,
        message: 'Category updated successfully',
        data: category.toJSON(),
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      console.error('❌ Error updating category:', error);
      return res.status(500).json({
        success: false,
        message: 'Error updating category',
        error: error.message,
      });
    }
  }

  /**
   * DELETE /api/v1/categories/:id
   * Delete category (Admin only)
   */
  async deleteCategory(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findByIdAndDelete(id);

      if (!category) {
        throw new NotFoundError('Category not found');
      }

      console.log(`✅ Deleted category: ${category.name}`);

      return res.json({
        success: true,
        message: 'Category deleted successfully',
      });
    } catch (error) {
      if (error instanceof NotFoundError) {
        return res.status(404).json({
          success: false,
          message: error.message,
        });
      }

      console.error('❌ Error deleting category:', error);
      return res.status(500).json({
        success: false,
        message: 'Error deleting category',
        error: error.message,
      });
    }
  }
}

module.exports = new CategoryController();
