/**
 * Product Service Layer
 * Handles all business logic related to product management
 * Separates database operations from controller logic for clean architecture
 */

const Product = require('../models/Product');
const {
  NotFoundError,
  ValidationError,
  ConflictError,
  ServerError,
} = require('../utils/errors');

class ProductService {
  /**
   * Create a new product
   * @param {Object} productData - Product data including name, description, price, images, variants, stock
   * @returns {Promise<Object>} - Created product document
   * @throws {ValidationError|ConflictError|ServerError}
   */
  async createProduct(productData) {
    try {
      // Check if product with same name already exists
      const existingProduct = await Product.findOne({
        name: new RegExp(`^${productData.name}$`, 'i'),
        deletedAt: null,
      });

      if (existingProduct) {
        throw new ConflictError(
          `Product with name "${productData.name}" already exists`
        );
      }

      // Create new product
      const product = new Product(productData);
      await product.save();

      return product;
    } catch (error) {
      if (error instanceof ConflictError) {
        throw error;
      }

      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach((field) => {
          errors[field] = error.errors[field].message;
        });
        throw new ValidationError('Product validation failed', errors);
      }

      // Handle MongoDB duplicate key error
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictError(`A product with this ${field} already exists`);
      }

      throw new ServerError('Error creating product', error);
    }
  }

  /**
   * Get all products with pagination and filtering
   * @param {Object} options - Query options
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 10, max: 100)
   * @param {string|null} options.status - Filter by status (active, inactive, out_of_stock). If null/empty, returns ALL products regardless of status
   * @param {string} options.category - Filter by category (case-insensitive)
   * @param {number|null} options.minPrice - Minimum price filter (already converted to number)
   * @param {number|null} options.maxPrice - Maximum price filter (already converted to number)
   * @param {string} options.search - Search by name or description (full-text)
   * @param {string} options.sort - Sort order using MongoDB syntax (default: -createdAt)
   * @returns {Promise<Object>} - Product list with pagination metadata
   */
  async getProducts(options = {}) {
    try {
      const {
        page = 1,
        limit = 10,
        status = null, // ✅ Changed from 'active' to null (no default filter)
        category = null,
        minPrice = null,
        maxPrice = null,
        search = null,
        sort = '-createdAt',
      } = options;

      // Validate and convert pagination parameters
      const pageNum = Math.max(1, parseInt(page) || 1);
      const limitNum = Math.min(100, Math.max(1, parseInt(limit) || 10));
      const skip = (pageNum - 1) * limitNum;

      // Build filter query object
      const filter = { deletedAt: null };

      // Add status filter (if provided and not empty)
      if (status && status.trim()) {
        filter.status = status.trim().toLowerCase();
      }

      // Add category filter (case-insensitive)
      if (category && category.trim()) {
        filter.category = new RegExp(`^${category.trim()}$`, 'i');
      }

      // Add price range filters (minPrice and maxPrice should already be numbers)
      if (minPrice !== null || maxPrice !== null) {
        filter.price = {};
        if (minPrice !== null && typeof minPrice === 'number' && !isNaN(minPrice)) {
          filter.price.$gte = minPrice;
        }
        if (maxPrice !== null && typeof maxPrice === 'number' && !isNaN(maxPrice)) {
          filter.price.$lte = maxPrice;
        }
      }

      // Add full-text search filter (if provided)
      if (search && search.trim()) {
        filter.$text = { $search: search.trim() };
      }

      // Validate sort parameter (prevent injection)
      const validSortFields = [
        'createdAt',
        '-createdAt',
        'price',
        '-price',
        'name',
        '-name',
        'stock',
        '-stock',
        'isFeatured',
        '-isFeatured',
      ];
      const finalSort = validSortFields.includes(sort) ? sort : '-createdAt';

      console.log('🔍 MongoDB Filter built:', {
        statusFilter: filter.status || '(none)',
        categoryFilter: filter.category ? `(regex: ${filter.category})` : '(none)',
        priceFilter: filter.price ? `$${minPrice || 'any'} - $${maxPrice || 'any'}` : '(none)',
        searchFilter: filter.$text ? `(search: ${search})` : '(none)',
        sortBy: finalSort,
      });

      // Execute query with pagination and sorting
      const products = await Product.find(filter)
        .sort(finalSort)
        .limit(limitNum)
        .skip(skip)
        .lean(); // Use lean() for performance since we're only reading

      // Get total count for pagination metadata
      const total = await Product.countDocuments(filter);

      console.log(`✅ Query completed: Found ${products.length} products, total: ${total}`);

      return {
        success: true,
        data: products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
          hasNextPage: pageNum < Math.ceil(total / limitNum),
          hasPreviousPage: pageNum > 1,
        },
      };
    } catch (error) {
      console.error('❌ Error in getProducts:', error);
      throw new ServerError('Error fetching products', error);
    }
  }

  /**
   * Get a single product by ID
   * @param {String} productId - MongoDB product ID
   * @returns {Promise<Object>} - Product document
   * @throws {NotFoundError|ServerError}
   */
  async getProductById(productId) {
    try {
      // Convert to string in case it's an ObjectId instance
      const productIdStr = productId.toString();

      // Validate MongoDB ObjectId format
      if (!productIdStr.match(/^[0-9a-fA-F]{24}$/)) {
        throw new NotFoundError('Invalid product ID format');
      }

      const product = await Product.findOne({
        _id: productIdStr,
        deletedAt: null,
      });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error fetching product', error);
    }
  }

  /**
   * Update a product by ID
   * @param {String} productId - MongoDB product ID
   * @param {Object} updateData - Fields to update
   * @returns {Promise<Object>} - Updated product document
   * @throws {NotFoundError|ValidationError|ServerError}
   */
  async updateProduct(productId, updateData) {
    try {
      // Validate MongoDB ObjectId format
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new NotFoundError('Invalid product ID format');
      }

      // Don't allow updating these fields directly
      const restrictedFields = ['_id', 'createdAt', 'deletedAt'];
      restrictedFields.forEach((field) => {
        delete updateData[field];
      });

      // Find and update product
      const product = await Product.findOneAndUpdate(
        { _id: productId, deletedAt: null },
        updateData,
        {
          new: true, // Return updated document
          runValidators: true, // Run schema validators on update
        }
      );

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }

      // Handle MongoDB validation errors
      if (error.name === 'ValidationError') {
        const errors = {};
        Object.keys(error.errors).forEach((field) => {
          errors[field] = error.errors[field].message;
        });
        throw new ValidationError('Product validation failed', errors);
      }

      // Handle duplicate field errors
      if (error.code === 11000) {
        const field = Object.keys(error.keyPattern)[0];
        throw new ConflictError(`A product with this ${field} already exists`);
      }

      throw new ServerError('Error updating product', error);
    }
  }

  /**
   * Soft delete a product by ID
   * @param {String} productId - MongoDB product ID
   * @returns {Promise<Object>} - Deleted product document
   * @throws {NotFoundError|ServerError}
   */
  async deleteProduct(productId) {
    try {
      // Validate MongoDB ObjectId format
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new NotFoundError('Invalid product ID format');
      }

      const product = await Product.findById(productId);

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      // Use soft delete method
      await product.softDelete();

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error deleting product', error);
    }
  }

  /**
   * Search products by name or description
   * @param {String} searchTerm - Search query
   * @param {Object} options - Pagination options
   * @returns {Promise<Object>} - Search results with pagination
   */
  async searchProducts(searchTerm, options = {}) {
    try {
      const { page = 1, limit = 10 } = options;
      const pageNum = Math.max(1, parseInt(page));
      const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
      const skip = (pageNum - 1) * limitNum;

      const products = await Product.find(
        {
          $text: { $search: searchTerm },
          deletedAt: null,
        },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(limitNum)
        .skip(skip)
        .lean();

      const total = await Product.countDocuments({
        $text: { $search: searchTerm },
        deletedAt: null,
      });

      return {
        success: true,
        data: products,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(total / limitNum),
          totalItems: total,
          itemsPerPage: limitNum,
        },
      };
    } catch (error) {
      throw new ServerError('Error searching products', error);
    }
  }

  /**
   * Get featured products (for homepage display)
   * @param {Number} limit - Maximum number of featured products to return
   * @returns {Promise<Array>} - Array of featured products
   */
  async getFeaturedProducts(limit = 8) {
    try {
      const products = await Product.find({
        isFeatured: true,
        status: 'active',
        deletedAt: null,
      })
        .limit(parseInt(limit))
        .sort('-createdAt')
        .lean();

      return products;
    } catch (error) {
      throw new ServerError('Error fetching featured products', error);
    }
  }

  /**
   * Update product stock
   * @param {String} productId - Product ID
   * @param {Number} quantity - Quantity to add/subtract
   * @param {String} operation - 'increment' or 'decrement'
   * @returns {Promise<Object>} - Updated product
   */
  async updateStock(productId, quantity, operation = 'decrement') {
    try {
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new NotFoundError('Invalid product ID format');
      }

      const product = await Product.updateStock(productId, quantity, operation);

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      return product;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error updating stock', error);
    }
  }

  /**
   * Get related products based on category or variants
   * @param {String} productId - Product ID to find related products for
   * @param {Number} limit - Maximum number of related products
   * @returns {Promise<Array>} - Related products
   */
  async getRelatedProducts(productId, limit = 5) {
    try {
      const product = await this.getProductById(productId);

      const relatedProducts = await Product.find({
        _id: { $ne: productId },
        $or: [
          { category: product.category },
          { 'variants.name': { $in: product.variants.map((v) => v.name) } },
        ],
        status: 'active',
        deletedAt: null,
      })
        .limit(parseInt(limit))
        .lean();

      return relatedProducts;
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error fetching related products', error);
    }
  }
}

// Export a singleton instance of ProductService
module.exports = new ProductService();
