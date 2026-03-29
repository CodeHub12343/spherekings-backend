/**
 * Product Hooks
 * React Query hooks for fetching and mutating product data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/api/services/productService';

// Query keys for React Query cache
export const productQueryKeys = {
  all: ['products'],
  list: (filters) => ['products', 'list', filters],
  featured: ['products', 'featured'],
  search: (query) => ['products', 'search', query],
  detail: (id) => ['products', 'detail', id],
  related: (id) => ['products', 'related', id],
};

/**
 * Hook: Get all products with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 * 
 * NOTE: staleTime is 0 (immediate) to ensure fresh data when:
 * - Navigating back to page with filter URL parameters
 * - Changing filter parameters
 * - Changing page number
 * This is critical for marketplace filtering to work correctly
 */
export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 0, // ⚡ Immediately stale - refetch on every navigation/filter change
    gcTime: 5 * 60 * 1000, // 5 minutes (keep in cache for back button navigation)
    retry: 2,
    refetchOnWindowFocus: true, // Refetch when user returns to browser tab
    refetchOnReconnect: true, // Refetch when internet reconnects
    ...options,
  });
};

/**
 * Hook: Get featured products
 * @param {number} limit - Number of products
 * @param {Object} options - React Query options
 */
export const useFeaturedProducts = (limit = 6, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.featured,
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

/**
 * Hook: Search products
 * @param {string} query - Search query
 * @param {Object} params - Additional params
 * @param {Object} options - React Query options
 */
export const useSearchProducts = (query, params = {}, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.search(query),
    queryFn: () => productService.searchProducts(query, params),
    enabled: !!query && query.length > 0, // Only run if query exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Hook: Get single product details
 * @param {string} productId - Product ID
 * @param {Object} options - React Query options
 */
export const useProductDetail = (productId, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId, // Only run if ID exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

/**
 * Hook: Get related products
 * @param {string} productId - Product ID
 * @param {number} limit - Number of related products
 * @param {Object} options - React Query options
 */
export const useRelatedProducts = (productId, limit = 4, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.related(productId),
    queryFn: () => productService.getRelatedProducts(productId, limit),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Hook: Create product mutation (Admin)
 */
export const useCreateProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => productService.createProduct(productData),
    onSuccess: (data) => {
      // Invalidate products list to refetch
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      console.log('✅ Product created:', data);
    },
    onError: (error) => {
      console.error('❌ Create product failed:', error.message);
    },
    ...options,
  });
};

/**
 * Hook: Update product mutation (Admin)
 */
export const useUpdateProduct = (productId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productData) => productService.updateProduct(productId, productData),
    onSuccess: (data) => {
      // Invalidate both list and detail
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(productId) });
      console.log('✅ Product updated:', data);
    },
    onError: (error) => {
      console.error('❌ Update product failed:', error.message);
    },
    ...options,
  });
};

/**
 * Hook: Delete product mutation (Admin)
 */
export const useDeleteProduct = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (productId) => productService.deleteProduct(productId),
    onSuccess: () => {
      // Invalidate products list
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      console.log('✅ Product deleted');
    },
    onError: (error) => {
      console.error('❌ Delete product failed:', error.message);
    },
    ...options,
  });
};

/**
 * Hook: Update product stock (Admin)
 */
export const useUpdateStock = (productId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ quantity, operation }) =>
      productService.updateStock(productId, quantity, operation),
    onSuccess: (data) => {
      // Invalidate product detail
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(productId) });
      // Also invalidate products list
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all });
      console.log('✅ Stock updated:', data);
    },
    onError: (error) => {
      console.error('❌ Update stock failed:', error.message);
    },
    ...options,
  });
};

/**
 * Hook: Multi-purpose product hook (wrapper)
 * Useful for getting products with automatic cache management
 */
export const useProductQueries = () => {
  const queryClient = useQueryClient();

  return {
    // Data fetching hooks
    useProducts,
    useFeaturedProducts,
    useSearchProducts,
    useProductDetail,
    useRelatedProducts,

    // Mutation hooks
    useCreateProduct,
    useUpdateProduct,
    useDeleteProduct,
    useUpdateStock,

    // Utilities
    queryKeys: productQueryKeys,
    invalidateAll: () =>
      queryClient.invalidateQueries({ queryKey: productQueryKeys.all }),
    invalidateList: (filters) =>
      queryClient.invalidateQueries({ queryKey: productQueryKeys.list(filters) }),
    invalidateDetail: (id) =>
      queryClient.invalidateQueries({ queryKey: productQueryKeys.detail(id) }),
  };
};
