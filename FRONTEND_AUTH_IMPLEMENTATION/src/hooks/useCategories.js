'use client';

/**
 * useCategories Hook
 * Provides category data fetching and management
 * Used by forms and filter components
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '@/api/client';

const CATEGORY_ENDPOINTS = {
  LIST: '/categories',
  DETAIL: (id) => `/categories/${id}`,
  CREATE: '/categories',
  UPDATE: (id) => `/categories/${id}`,
  DELETE: (id) => `/categories/${id}`,
};

/**
 * Hook: Get all categories
 * Used by: ProductForm, Product filters, Category management
 */
export const useCategories = (options = {}) => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        console.log('📂 Fetching categories...');
        const response = await client.get(CATEGORY_ENDPOINTS.LIST, {
          params: { isActive: true }, // Only get active categories
        });
        console.log(`✅ Loaded ${response.data.data.length} categories`);
        return response.data.data || [];
      } catch (error) {
        console.error('❌ Error fetching categories:', error);
        throw new Error(error.response?.data?.message || 'Failed to fetch categories');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    ...options,
  });
};

/**
 * Hook: Get single category by ID
 */
export const useCategoryById = (categoryId, options = {}) => {
  return useQuery({
    queryKey: ['categories', categoryId],
    queryFn: async () => {
      try {
        const response = await client.get(CATEGORY_ENDPOINTS.DETAIL(categoryId));
        return response.data.data;
      } catch (error) {
        console.error(`❌ Error fetching category ${categoryId}:`, error);
        throw new Error(error.response?.data?.message || 'Failed to fetch category');
      }
    },
    enabled: !!categoryId,
    staleTime: 10 * 60 * 1000,
    gcTime: 30 * 60 * 1000,
    ...options,
  });
};

/**
 * Hook: Create new category (Admin only)
 */
export const useCreateCategory = (options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        console.log('📝 Creating category:', data.displayName);
        const response = await client.post(CATEGORY_ENDPOINTS.CREATE, data);
        console.log('✅ Category created:', response.data.data.displayName);
        return response.data.data;
      } catch (error) {
        console.error('❌ Error creating category:', error);
        throw new Error(error.response?.data?.message || 'Failed to create category');
      }
    },
    onSuccess: (newCategory) => {
      // Invalidate categories list to refetch
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      options.onSuccess?.(newCategory);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

/**
 * Hook: Update category (Admin only)
 */
export const useUpdateCategory = (categoryId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (data) => {
      try {
        console.log('✏️ Updating category:', data.displayName);
        const response = await client.put(CATEGORY_ENDPOINTS.UPDATE(categoryId), data);
        console.log('✅ Category updated:', response.data.data.displayName);
        return response.data.data;
      } catch (error) {
        console.error('❌ Error updating category:', error);
        throw new Error(error.response?.data?.message || 'Failed to update category');
      }
    },
    onSuccess: (updatedCategory) => {
      // Invalidate both list and detail queries
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      queryClient.invalidateQueries({
        queryKey: ['categories', categoryId],
      });
      options.onSuccess?.(updatedCategory);
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

/**
 * Hook: Delete category (Admin only)
 */
export const useDeleteCategory = (categoryId, options = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      try {
        console.log('🗑️ Deleting category:', categoryId);
        await client.delete(CATEGORY_ENDPOINTS.DELETE(categoryId));
        console.log('✅ Category deleted');
      } catch (error) {
        console.error('❌ Error deleting category:', error);
        throw new Error(error.response?.data?.message || 'Failed to delete category');
      }
    },
    onSuccess: () => {
      // Invalidate queries
      queryClient.invalidateQueries({
        queryKey: ['categories'],
      });
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error);
    },
  });
};

/**
 * Utility hook combining all category operations
 * Useful for components that need multiple category operations
 */
export const useCategoryManagement = () => {
  const categories = useCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  return {
    // Queries
    categories: categories.data || [],
    isLoadingCategories: categories.isLoading,
    categoriesError: categories.error,

    // Mutations
    createCategory,
    updateCategory,
    deleteCategory,

    // Utilities
    getCategoryById: (id) => categories.data?.find((c) => c._id === id),
    getCategoryByName: (name) => categories.data?.find((c) => c.name === name),
  };
};
