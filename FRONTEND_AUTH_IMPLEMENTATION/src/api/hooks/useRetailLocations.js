/**
 * Retail Locations Hooks
 * React Query hooks for retail location feature with caching and state management
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import retailLocationService from '../services/retailLocationService';

// Cache key factory
const retailLocationKeys = {
  all: ['retail-locations'],
  lists: () => [...retailLocationKeys.all, 'list'],
  list: (filters) => [...retailLocationKeys.lists(), { filters }],
  featured: () => [...retailLocationKeys.all, 'featured'],
  countries: () => [...retailLocationKeys.all, 'countries'],
  count: () => [...retailLocationKeys.all, 'count'],
  detail: (id) => [...retailLocationKeys.all, 'detail', id],
  byCountry: (country) => [...retailLocationKeys.all, 'by-country', country],
};

/**
 * Hook: Get all retail locations (paginated with filtering)
 * Public endpoint - used for public store locator
 */
export const useRetailLocations = (params = {}) => {
  return useQuery({
    queryKey: retailLocationKeys.list(params),
    queryFn: async () => {
      try {
        const result = await retailLocationService.getRetailLocations(params);
        return {
          data: result.data,
          pagination: result.pagination,
        };
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch retail locations');
      }
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 2,
    enabled: true,
  });
};

/**
 * Hook: Get single retail location by ID
 * Public endpoint - used for detail page
 */
export const useRetailLocation = (locationId, enabled = true) => {
  return useQuery({
    queryKey: retailLocationKeys.detail(locationId),
    queryFn: async () => {
      try {
        const result = await retailLocationService.getRetailLocation(locationId);
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch retail location');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1,
    enabled: enabled && !!locationId,
  });
};

/**
 * Hook: Get featured retail locations
 * Public endpoint - used for homepage/landing page
 * Shows top retailers to build trust
 */
export const useFeaturedRetailLocations = (limit = 6) => {
  return useQuery({
    queryKey: retailLocationKeys.featured(),
    queryFn: async () => {
      try {
        const result = await retailLocationService.getFeaturedLocations(limit);
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch featured locations');
      }
    },
    staleTime: 15 * 60 * 1000, // 15 minutes (less frequent updates)
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 2,
  });
};

/**
 * Hook: Get available countries
 * Used for filter dropdowns
 */
export const useAvailableCountries = () => {
  return useQuery({
    queryKey: retailLocationKeys.countries(),
    queryFn: async () => {
      try {
        const result = await retailLocationService.getAvailableCountries();
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch countries');
      }
    },
    staleTime: 1 * 60 * 60 * 1000, // 1 hour (data changes rarely)
    gcTime: 1 * 60 * 60 * 1000, // 1 hour garbage collection
    retry: 1,
  });
};

/**
 * Hook: Get total retail location count
 * Used for admin dashboard stats
 */
export const useRetailLocationCount = () => {
  return useQuery({
    queryKey: retailLocationKeys.count(),
    queryFn: async () => {
      try {
        const result = await retailLocationService.getTotalRetailLocationCount();
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch count');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1,
  });
};

/**
 * Hook: Get locations by country
 * Used for country-specific filtering
 */
export const useRetailLocationsByCountry = (country, enabled = true) => {
  return useQuery({
    queryKey: retailLocationKeys.byCountry(country),
    queryFn: async () => {
      try {
        const result = await retailLocationService.getLocationsByCountry(country);
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to fetch locations');
      }
    },
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes garbage collection
    retry: 1,
    enabled: enabled && !!country,
  });
};

/**
 * Mutation: Create new retail location
 * Admin endpoint - requires authorization
 * Accepts multipart/form-data with logo file
 */
export const useCreateRetailLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (formData) => {
      try {
        const result = await retailLocationService.createRetailLocation(formData);
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to create retail location');
      }
    },
    onSuccess: (data) => {
      // Invalidate lists to refresh with new location
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.count() });
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.countries() });
    },
    onError: (error) => {
      console.error('❌ Create retail location failed:', error.message);
    },
  });
};

/**
 * Mutation: Update existing retail location
 * Admin endpoint - requires authorization
 * Accepts multipart/form-data with optional logo file
 */
export const useUpdateRetailLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ locationId, formData }) => {
      try {
        const result = await retailLocationService.updateRetailLocation(locationId, formData);
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to update retail location');
      }
    },
    onSuccess: (data, variables) => {
      // Invalidate affected queries
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.detail(variables.locationId) });
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.featured() });
    },
    onError: (error) => {
      console.error('❌ Update retail location failed:', error.message);
    },
  });
};

/**
 * Mutation: Delete (soft delete) retail location
 * Admin endpoint - requires authorization
 * Marks location as inactive rather than permanent deletion
 */
export const useDeleteRetailLocation = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (locationId) => {
      try {
        const result = await retailLocationService.deleteRetailLocation(locationId);
        return result;
      } catch (error) {
        throw new Error(error.message || 'Failed to delete retail location');
      }
    },
    onSuccess: (data, locationId) => {
      // Remove from detail cache
      queryClient.removeQueries({ queryKey: retailLocationKeys.detail(locationId) });
      // Invalidate lists to remove deleted location
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.lists() });
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.count() });
      queryClient.invalidateQueries({ queryKey: retailLocationKeys.featured() });
    },
    onError: (error) => {
      console.error('❌ Delete retail location failed:', error.message);
    },
  });
};

export default {
  retailLocationKeys,
  useRetailLocations,
  useRetailLocation,
  useFeaturedRetailLocations,
  useAvailableCountries,
  useRetailLocationCount,
  useRetailLocationsByCountry,
  useCreateRetailLocation,
  useUpdateRetailLocation,
  useDeleteRetailLocation,
};
