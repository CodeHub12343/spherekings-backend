/**
 * Product Service
 * Handles all product API calls
 * Integrates with backend Product endpoints
 */

import client from '@/api/client';

// API endpoints
const PRODUCT_ENDPOINTS = {
  // Public routes
  LIST: '/products',
  FEATURED: '/products/featured',
  SEARCH: '/products/search',
  DETAIL: (id) => `/products/${id}`,
  RELATED: (id) => `/products/${id}/related`,
  
  // Admin routes
  CREATE: '/products',
  UPDATE: (id) => `/products/${id}`,
  DELETE: (id) => `/products/${id}`,
  UPDATE_STOCK: (id) => `/products/${id}/stock`,
};

/**
 * Get all products with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {number} params.page - Page number (default: 1)
 * @param {number} params.limit - Items per page (default: 10)
 * @param {string} params.status - Filter by status (active, inactive, out_of_stock)
 * @param {string} params.category - Filter by category
 * @param {string} params.sort - Sort order (price, createdAt, etc.)
 * @returns {Promise} Products list with pagination metadata
 */
export const getProducts = async (params = {}) => {
  try {
    console.log('📤 GET Products - Request params:', params);
    
    const response = await client.get(PRODUCT_ENDPOINTS.LIST, { params });
    
    console.log('✅ GET Products - Success Response:', {
      status: response.status,
      dataKeys: Object.keys(response.data),
      productsCount: response.data?.data?.length || 0,
      pagination: response.data?.pagination,
      fullResponse: response.data,
    });
    
    return response.data;
  } catch (error) {
    console.error('❌ Get products error:', {
      message: error.message,
      status: error.response?.status,
      statusText: error.response?.statusText,
      responseData: error.response?.data,
      requestURL: error.config?.url,
    });
    throw error;
  }
};

/**
 * Get featured products
 * @param {number} limit - Number of products to return
 * @returns {Promise} Featured products array
 */
export const getFeaturedProducts = async (limit = 6) => {
  try {
    const response = await client.get(PRODUCT_ENDPOINTS.FEATURED, {
      params: { limit },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get featured products error:', error.message);
    throw error;
  }
};

/**
 * Search products by name or description
 * @param {string} query - Search query
 * @param {Object} params - Additional params (page, limit, etc.)
 * @returns {Promise} Search results
 */
export const searchProducts = async (query, params = {}) => {
  try {
    const response = await client.get(PRODUCT_ENDPOINTS.SEARCH, {
      params: { q: query, ...params },
    });
    return response.data;
  } catch (error) {
    console.error('❌ Search products error:', error.message);
    throw error;
  }
};

/**
 * Get single product details
 * @param {string} productId - Product ID
 * @returns {Promise} Product details
 */
export const getProductById = async (productId) => {
  try {
    console.log(`📤 GET Product by ID - ${productId}`);
    
    const response = await client.get(PRODUCT_ENDPOINTS.DETAIL(productId));
    
    // Backend returns: { success, message, data: product }
    // Must extract the product from nested data structure
    const productData = response.data?.data;
    
    console.log(`✅ GET Product Success:`, {
      status: response.status,
      hasProductData: !!productData,
      productId: productData?._id,
      productName: productData?.name,
      productPrice: productData?.price,
      productStock: productData?.stock,
    });
    
    if (!productData) {
      throw new Error('Invalid product response: missing data');
    }
    
    // Return ONLY the product object, not the wrapper
    return productData;
  } catch (error) {
    console.error(`❌ Get product ${productId} error:`, {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    throw error;
  }
};

/**
 * Get related products
 * @param {string} productId - Product ID
 * @param {number} limit - Number of related products
 * @returns {Promise} Related products array
 */
export const getRelatedProducts = async (productId, limit = 4) => {
  try {
    console.log(`📤 GET Related Products - ${productId}, limit: ${limit}`);
    
    const response = await client.get(PRODUCT_ENDPOINTS.RELATED(productId), {
      params: { limit },
    });
    
    // Backend returns: { success, message, data: products[] }
    // Extract the products array from nested data structure
    const productsData = response.data?.data;
    
    console.log(`✅ GET Related Products Success:`, {
      status: response.status,
      productsCount: Array.isArray(productsData) ? productsData.length : 0,
      isArray: Array.isArray(productsData),
    });
    
    // Return the products array, default to empty array if missing
    return Array.isArray(productsData) ? productsData : [];
  } catch (error) {
    console.error(`❌ Get related products error:`, {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    throw error;
  }
};

/**
 * Create a new product (Admin only)
 * @param {Object|FormData} productData - Product data or FormData with images
 * @returns {Promise} Created product
 */
export const createProduct = async (productData) => {
  try {
    console.log('📤 Creating product:', {
      isFormData: productData instanceof FormData,
      dataType: typeof productData,
    });
    
    // FormData is automatically handled by axios interceptor
    const response = await client.post(PRODUCT_ENDPOINTS.CREATE, productData);
    
    console.log('✅ Product created successfully:', {
      status: response.status,
      success: response.data?.success,
      message: response.data?.message,
    });
    
    return response.data;
  } catch (error) {
    // Handle different error types
    const backendResponse = error.response?.data;
    const status = error.response?.status;
    
    console.error('❌ Create product error - Full error:', {
      errorMessage: error.message,
      status: status,
      hasResponse: !!error.response,
      backendMessage: backendResponse?.message,
      backendErrors: backendResponse?.errors,
      fullError: error,
      config: error.config?.url,
    });
    
    // Determine the best error message
    let errorMessage = 'Failed to create product';
    
    if (status === 401) {
      errorMessage = 'Unauthorized: You must be logged in to create products';
    } else if (status === 403) {
      errorMessage = 'Forbidden: You do not have permission to create products';
    } else if (status === 409) {
      errorMessage = 'Product with this SKU already exists';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Update an existing product (Admin only)
 * @param {string} productId - Product ID
 * @param {Object} productData - Product data to update
 * @returns {Promise} Updated product
 */
export const updateProduct = async (productId, productData) => {
  try {
    console.log(`📤 Updating product ${productId}:`, productData);
    
    const response = await client.put(
      PRODUCT_ENDPOINTS.UPDATE(productId),
      productData
    );
    
    console.log('✅ Product updated successfully:', response.data);
    return response.data;
  } catch (error) {
    const backendResponse = error.response?.data;
    const status = error.response?.status;
    
    console.error('❌ Update product error - Full error:', {
      errorMessage: error.message,
      status: status,
      hasResponse: !!error.response,
      backendMessage: backendResponse?.message,
      backendErrors: backendResponse?.errors,
    });
    
    let errorMessage = 'Failed to update product';
    
    if (status === 401) {
      errorMessage = 'Unauthorized: You must be logged in';
    } else if (status === 403) {
      errorMessage = 'Forbidden: You do not have permission to update products';
    } else if (status === 404) {
      errorMessage = 'Product not found';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Delete a product (Soft delete) (Admin only)
 * @param {string} productId - Product ID
 * @returns {Promise} Deleted product
 */
export const deleteProduct = async (productId) => {
  try {
    console.log(`📤 Deleting product ${productId}`);
    
    const response = await client.delete(PRODUCT_ENDPOINTS.DELETE(productId));
    
    console.log('✅ Product deleted successfully');
    return response.data;
  } catch (error) {
    const backendResponse = error.response?.data;
    const status = error.response?.status;
    
    console.error('❌ Delete product error - Full error:', {
      errorMessage: error.message,
      status: status,
      hasResponse: !!error.response,
      backendMessage: backendResponse?.message,
    });
    
    let errorMessage = 'Failed to delete product';
    
    if (status === 401) {
      errorMessage = 'Unauthorized: You must be logged in';
    } else if (status === 403) {
      errorMessage = 'Forbidden: You do not have permission to delete products';
    } else if (status === 404) {
      errorMessage = 'Product not found';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Update product stock (Admin only)
 * @param {string} productId - Product ID
 * @param {number} quantity - Quantity to add/remove
 * @param {string} operation - 'increment' or 'decrement'
 * @returns {Promise} Updated product
 */
export const updateStock = async (productId, quantity, operation = 'decrement') => {
  try {
    console.log(`📤 Updating stock for product ${productId}:`, {
      quantity,
      operation,
    });
    
    const response = await client.put(
      PRODUCT_ENDPOINTS.UPDATE_STOCK(productId),
      { quantity, operation }
    );
    
    console.log('✅ Stock updated successfully');
    return response.data;
  } catch (error) {
    const backendResponse = error.response?.data;
    const status = error.response?.status;
    
    console.error('❌ Update stock error - Full error:', {
      errorMessage: error.message,
      status: status,
      hasResponse: !!error.response,
      backendMessage: backendResponse?.message,
    });
    
    let errorMessage = 'Failed to update stock';
    
    if (status === 401) {
      errorMessage = 'Unauthorized: You must be logged in';
    } else if (status === 403) {
      errorMessage = 'Forbidden: You do not have permission to update stock';
    } else if (status === 404) {
      errorMessage = 'Product not found';
    } else if (backendResponse?.message) {
      errorMessage = backendResponse.message;
    } else if (error.message) {
      errorMessage = error.message;
    }
    
    throw new Error(errorMessage);
  }
};

/**
 * Export all product service methods
 */
export const productService = {
  getProducts,
  getFeaturedProducts,
  searchProducts,
  getProductById,
  getRelatedProducts,
  createProduct,
  updateProduct,
  deleteProduct,
  updateStock,
};

export default productService;
