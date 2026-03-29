/**
 * Product Controller
 * Handles HTTP request/response logic for product-related endpoints
 * Delegates business logic to ProductService
 */

const productService = require('../services/productService');
const { ValidationError } = require('../utils/errors');

class ProductController {
  /**
   * GET /api/products
   * Retrieve all products with pagination, filtering, and sorting
   * Query params:
   *   - page: Page number (default: 1)
   *   - limit: Items per page (default: 10, max: 100)
   *   - status: Filter by status (active, inactive, out_of_stock)
   *   - category: Filter by category (case-insensitive)
   *   - minPrice: Minimum price filter (optional)
   *   - maxPrice: Maximum price filter (optional)
   *   - search: Search by name/description (full-text search)
   *   - sort: Sort order (createdAt, -createdAt, price, -price, name, -name, etc.)
   */
  async getProducts(req, res, next) {
    try {
      // Helper function to safely parse numeric query params
      const parseNumericParam = (value) => {
        if (value === undefined || value === null || value === '') {
          return null;
        }
        const parsed = parseFloat(value);
        return isNaN(parsed) ? null : parsed;
      };

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
        status: req.query.status && req.query.status !== '' ? req.query.status : null, // ✅ Changed: null instead of 'active'
        category: req.query.category && req.query.category !== '' ? req.query.category : null,
        minPrice: parseNumericParam(req.query.minPrice),
        maxPrice: parseNumericParam(req.query.maxPrice),
        search: req.query.search && req.query.search !== '' ? req.query.search : null,
        sort: req.query.sort || '-createdAt',
      };

      // Log the incoming request for debugging
      console.log('📦 GET /products - Parsed options:', {
        page: options.page,
        limit: options.limit,
        status: options.status,
        category: options.category,
        minPrice: options.minPrice,
        maxPrice: options.maxPrice,
        search: options.search,
        sort: options.sort,
      });

      const result = await productService.getProducts(options);

      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id
   * Retrieve a single product by ID with full details
   */
  async getProductById(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.getProductById(id);

      return res.status(200).json({
        success: true,
        message: 'Product retrieved successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/products
   * Create a new product (Admin only)
   * Body: { name, description, price, images, variants, stock }
   */
  /**
   * POST /api/v1/products
   * Create a new product with image uploads
   * Body: { name, description, price, stock, category, sku, isFeatured, status }
   * Files: images (multipart/form-data)
   */
  async createProduct(req, res, next) {
    try {
      const productData = req.body;
      const files = req.files;

      // Remove any images field from body - images should only come via multer
      delete productData.images;

      // If files are provided, upload them to Cloudinary
      if (files && files.length > 0) {
        const cloudinaryUpload = require('../utils/cloudinaryUpload');
        
        try {
          // Upload all images in parallel
          const uploadPromises = files.map((file) =>
            cloudinaryUpload.uploadProductImage(file.buffer, 'new')
          );
          
          const results = await Promise.all(uploadPromises);
          
          // Extract URLs from upload results
          const imageUrls = results.map((result) => result.secure_url);
          
          // Add images to product data
          productData.images = imageUrls;
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // Continue with product creation even if image upload fails
          productData.images = [];
        }
      } else {
        productData.images = [];
      }

      const product = await productService.createProduct(productData);

      return res.status(201).json({
        success: true,
        message: 'Product created successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/products/:id
   * Update an existing product (Admin only)
   * Body: Product fields to update
   * Files: New images to add (optional)
   */
  async updateProduct(req, res, next) {
    try {
      const { id } = req.params;
      const updateData = req.body;
      const files = req.files;

      // Remove images from body if present - images should only come via multer
      delete updateData.images;

      // Get existing product to preserve current images
      let existingProduct = null;
      try {
        existingProduct = await productService.getProductById(id);
      } catch (err) {
        console.warn('Could not fetch existing product:', err.message);
      }

      // Handle new file uploads if provided
      if (files && files.length > 0) {
        const cloudinaryUpload = require('../utils/cloudinaryUpload');
        
        try {
          // Upload all new images in parallel
          const uploadPromises = files.map((file) =>
            cloudinaryUpload.uploadProductImage(file.buffer, id)
          );
          
          const results = await Promise.all(uploadPromises);
          
          // Extract URLs from upload results - ensure they're strings
          const newImageUrls = results
            .map((result) => {
              // Ensure we extract clean string URLs
              return typeof result.secure_url === 'string' ? result.secure_url : null;
            })
            .filter(url => url && url.length > 0);
          
          // Preserve existing images
          let currentImages = [];
          if (existingProduct?.images && Array.isArray(existingProduct.images)) {
            // Convert to plain strings only
            currentImages = existingProduct.images
              .map(img => img.toString ? img.toString() : img)
              .filter(img => typeof img === 'string' && img.length > 0);
          }
          
          // Combine: existing images + new uploaded images
          updateData.images = [...currentImages, ...newImageUrls];
          
          console.log('📸 Image update:', {
            existing: currentImages.length,
            new: newImageUrls.length,
            total: updateData.images.length,
            imageUrls: updateData.images.slice(0, 2), // Log first 2 for debugging
          });
        } catch (uploadError) {
          console.error('Image upload error:', uploadError);
          // If upload fails, preserve existing images
          if (existingProduct?.images) {
            updateData.images = existingProduct.images;
          }
        }
      } else if (existingProduct?.images && !updateData.images) {
        // No new files and user didn't specify images - preserve existing
        updateData.images = existingProduct.images;
      }

      // Validate that at least one field is being updated
      if (Object.keys(updateData).length === 0) {
        throw new ValidationError('No fields provided for update', {
          body: 'At least one field must be provided',
        });
      }

      console.log('📝 Update data summary:', {
        id,
        fields: Object.keys(updateData),
        hasImages: !!updateData.images,
        imageCount: updateData.images?.length || 0,
      });

      const product = await productService.updateProduct(id, updateData);

      return res.status(200).json({
        success: true,
        message: 'Product updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * DELETE /api/admin/products/:id
   * Delete/deactivate a product (Admin only)
   * Uses soft delete to preserve data
   */
  async deleteProduct(req, res, next) {
    try {
      const { id } = req.params;
      const product = await productService.deleteProduct(id);

      return res.status(200).json({
        success: true,
        message: 'Product deleted successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/search
   * Search products by name or description
   * Query params: q (search term), page, limit
   */
  async searchProducts(req, res, next) {
    try {
      const { q } = req.query;

      if (!q) {
        throw new ValidationError('Search term is required', {
          q: 'Search term (q parameter) is required',
        });
      }

      const options = {
        page: req.query.page || 1,
        limit: req.query.limit || 10,
      };

      const result = await productService.searchProducts(q, options);

      return res.status(200).json({
        success: true,
        message: 'Search completed successfully',
        ...result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/featured
   * Get featured products for homepage display
   * Query params: limit (optional, default 8)
   */
  async getFeaturedProducts(req, res, next) {
    try {
      const limit = req.query.limit || 8;
      const products = await productService.getFeaturedProducts(limit);

      return res.status(200).json({
        success: true,
        message: 'Featured products retrieved successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/products/:id/related
   * Get products related to a specific product
   * Query params: limit (optional, default 5)
   */
  async getRelatedProducts(req, res, next) {
    try {
      const { id } = req.params;
      const limit = req.query.limit || 5;
      const products = await productService.getRelatedProducts(id, limit);

      return res.status(200).json({
        success: true,
        message: 'Related products retrieved successfully',
        data: products,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * PUT /api/admin/products/:id/stock
   * Update product stock (for orders, refunds, returns)
   * Body: { quantity, operation: 'increment' | 'decrement' }
   */
  async updateStock(req, res, next) {
    try {
      const { id } = req.params;
      const { quantity, operation } = req.body;

      // Validate required fields
      if (!quantity || !operation) {
        throw new ValidationError('Missing required fields', {
          quantity: 'Quantity is required',
          operation: 'Operation (increment/decrement) is required',
        });
      }

      // Validate operation value
      if (!['increment', 'decrement'].includes(operation)) {
        throw new ValidationError('Invalid operation', {
          operation: "Operation must be 'increment' or 'decrement'",
        });
      }

      const product = await productService.updateStock(id, quantity, operation);

      return res.status(200).json({
        success: true,
        message: 'Product stock updated successfully',
        data: product,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export a singleton instance of ProductController
module.exports = new ProductController();
