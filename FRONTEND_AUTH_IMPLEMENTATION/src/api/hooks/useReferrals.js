/**
 * Referral Tracking React Query Hooks
 * Custom hooks for fetching referral data with caching and invalidation
 */

'use client';

import { useQuery, useInfiniteQuery, useQueryClient } from '@tanstack/react-query';
import referralService from '../services/referralService';

// ==================== QUERY HOOKS ====================

/**
 * Hook to fetch referral statistics for an affiliate
 * Caches data for 5 minutes
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 *   - dateFrom: Start date (ISO string)
 *   - dateTo: End date (ISO string)
 *   - enabled: Whether to run the query (default: true)
 * @returns {Object} Query result with data, isLoading, error, etc.
 */
export function useReferralStats(affiliateId, options = {}) {
  const { dateFrom = null, dateTo = null, enabled = true } = options;

  return useQuery({
    queryKey: ['referrals', 'stats', affiliateId, dateFrom, dateTo],
    queryFn: async () => {
      const result = await referralService.getReferralStats(affiliateId, {
        dateFrom,
        dateTo,
      });
      return result;
    },
    enabled: enabled && !!affiliateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
}

/**
 * Hook to fetch paginated referral clicks
 * Caches per-page data independently
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 *   - page: Current page (default: 1)
 *   - limit: Items per page (default: 20)
 *   - convertedOnly: Show only converted referrals (default: false)
 *   - dateFrom: Start date (ISO string)
 *   - dateTo: End date (ISO string)
 *   - enabled: Whether to run the query (default: true)
 * @returns {Object} Query result with paginated data
 */
export function useReferralClicks(affiliateId, options = {}) {
  const {
    page = 1,
    limit = 20,
    convertedOnly = false,
    dateFrom = null,
    dateTo = null,
    enabled = true,
  } = options;

  return useQuery({
    queryKey: ['referrals', 'clicks', affiliateId, page, limit, convertedOnly, dateFrom, dateTo],
    queryFn: async () => {
      const result = await referralService.getReferrals(affiliateId, {
        page,
        limit,
        convertedOnly,
        dateFrom,
        dateTo,
      });
      return result;
    },
    enabled: enabled && !!affiliateId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch paginated sales attributed to affiliate
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 *   - page: Current page (default: 1)
 *   - limit: Items per page (default: 20)
 *   - dateFrom: Start date (ISO string)
 *   - dateTo: End date (ISO string)
 *   - enabled: Whether to run the query (default: true)
 * @returns {Object} Query result with paginated sales
 */
export function useReferralSales(affiliateId, options = {}) {
  const { page = 1, limit = 20, dateFrom = null, dateTo = null, enabled = true } = options;

  return useQuery({
    queryKey: ['referrals', 'sales', affiliateId, page, limit, dateFrom, dateTo],
    queryFn: async () => {
      const result = await referralService.getSales(affiliateId, {
        page,
        limit,
        dateFrom,
        dateTo,
      });
      return result;
    },
    enabled: enabled && !!affiliateId,
    staleTime: 3 * 60 * 1000, // 3 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch referrals aggregated by source
 * Derived from stats, useful for source analytics chart
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Filter options
 * @returns {Object} Query result with source breakdown
 */
export function useReferralsBySource(affiliateId, options = {}) {
  const { dateFrom = null, dateTo = null } = options;

  return useQuery({
    queryKey: ['referrals', 'source', affiliateId, dateFrom, dateTo],
    queryFn: async () => {
      const stats = await referralService.getReferralStats(affiliateId, {
        dateFrom,
        dateTo,
      });
      return stats.bySource || [];
    },
    enabled: !!affiliateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch referrals aggregated by device
 * Useful for device analytics chart
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Filter options
 * @returns {Object} Query result with device breakdown
 */
export function useReferralsByDevice(affiliateId, options = {}) {
  const { dateFrom = null, dateTo = null } = options;

  return useQuery({
    queryKey: ['referrals', 'device', affiliateId, dateFrom, dateTo],
    queryFn: async () => {
      const stats = await referralService.getReferralStats(affiliateId, {
        dateFrom,
        dateTo,
      });
      return stats.byDevice || [];
    },
    enabled: !!affiliateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch time-series referral data
 * Useful for trend charts - fetches clicks across multiple days
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 *   - dateFrom: Start date
 *   - dateTo: End date
 * @returns {Object} Time-series data aggregated by day
 */
export function useReferralTrends(affiliateId, options = {}) {
  const { dateFrom = null, dateTo = null } = options;

  return useQuery({
    queryKey: ['referrals', 'trends', affiliateId, dateFrom, dateTo],
    queryFn: async () => {
      // Fetch all referrals in date range
      const result = await referralService.getReferrals(affiliateId, {
        page: 1,
        limit: 1000, // Fetch up to 1000 records
        dateFrom,
        dateTo,
      });

      // Group by date to create time series
      const trends = {};

      if (result.referrals && Array.isArray(result.referrals)) {
        result.referrals.forEach((referral) => {
          const date = new Date(referral.createdAt).toLocaleDateString();

          if (!trends[date]) {
            trends[date] = {
              date,
              clicks: 0,
              conversions: 0,
              conversionRate: 0,
            };
          }

          trends[date].clicks += 1;
          if (referral.convertedToSale) {
            trends[date].conversions += 1;
          }
        });

        // Calculate conversion rates
        Object.keys(trends).forEach((date) => {
          trends[date].conversionRate =
            trends[date].clicks > 0
              ? parseFloat(((trends[date].conversions / trends[date].clicks) * 100).toFixed(2))
              : 0;
        });
      }

      return Object.values(trends).sort((a, b) => new Date(a.date) - new Date(b.date));
    },
    enabled: !!affiliateId && !!dateFrom && !!dateTo,
    staleTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

/**
 * Hook to fetch combined overview metrics
 * Useful for summary/achievement cards
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 * @returns {Object} Combined metrics data
 */
export function useReferralOverview(affiliateId, options = {}) {
  const { dateFrom = null, dateTo = null } = options;

  return useQuery({
    queryKey: ['referrals', 'overview', affiliateId, dateFrom, dateTo],
    queryFn: async () => {
      const stats = await referralService.getReferralStats(affiliateId, {
        dateFrom,
        dateTo,
      });

      // Format for easy consumption by summary components
      return {
        totalClicks: stats.overview?.totalClicks || 0,
        totalConversions: stats.overview?.totalConversions || 0,
        conversionRate: stats.overview?.conversionRate || 0,
        totalCommissions: stats.overview?.totalCommissions || 0,
        uniqueVisitors: stats.overview?.uniqueVisitorCount || 0,
        avgCommissionPerConversion:
          stats.overview?.totalConversions > 0
            ? (stats.overview?.totalCommissions / stats.overview?.totalConversions).toFixed(2)
            : 0,
        topSource: stats.bySource?.[0] || null,
        topDevice: stats.byDevice?.[0] || null,
      };
    },
    enabled: !!affiliateId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    retry: 2,
  });
}

/**
 * Hook to fetch system health status
 * Used to check if referral tracking system is operational
 *
 * @returns {Object} Health status
 */
export function useSystemHealth() {
  return useQuery({
    queryKey: ['system', 'health'],
    queryFn: async () => {
      return await referralService.getSystemHealth();
    },
    staleTime: 60 * 1000, // 1 minute
    retry: 1,
  });
}

// ==================== INFINITE QUERY HOOKS ====================

/**
 * Hook for infinite scrolling through referral clicks
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 * @returns {Object} Infinite query result
 */
export function useInfiniteReferralClicks(affiliateId, options = {}) {
  const {
    limit = 20,
    convertedOnly = false,
    dateFrom = null,
    dateTo = null,
  } = options;

  return useInfiniteQuery({
    queryKey: ['referrals', 'clicks', 'infinite', affiliateId, convertedOnly, dateFrom, dateTo],
    queryFn: async ({ pageParam = 1 }) => {
      return await referralService.getReferrals(affiliateId, {
        page: pageParam,
        limit,
        convertedOnly,
        dateFrom,
        dateTo,
      });
    },
    enabled: !!affiliateId,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination || {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

/**
 * Hook for infinite scrolling through attributed sales
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 * @returns {Object} Infinite query result
 */
export function useInfiniteReferralSales(affiliateId, options = {}) {
  const { limit = 20, dateFrom = null, dateTo = null } = options;

  return useInfiniteQuery({
    queryKey: ['referrals', 'sales', 'infinite', affiliateId, dateFrom, dateTo],
    queryFn: async ({ pageParam = 1 }) => {
      return await referralService.getSales(affiliateId, {
        page: pageParam,
        limit,
        dateFrom,
        dateTo,
      });
    },
    enabled: !!affiliateId,
    getNextPageParam: (lastPage) => {
      const { currentPage, totalPages } = lastPage.pagination || {};
      return currentPage < totalPages ? currentPage + 1 : undefined;
    },
    staleTime: 3 * 60 * 1000, // 3 minutes
  });
}

// ==================== UTILITY HOOKS ====================

/**
 * Hook to manually invalidate referral queries
 * Useful after user actions or filters change
 *
 * @returns {Function} Invalidation functions
 */
export function useReferralInvalidation() {
  const queryClient = useQueryClient();

  return {
    invalidateStats: (affiliateId) => {
      queryClient.invalidateQueries({
        queryKey: ['referrals', 'stats', affiliateId],
      });
    },
    invalidateClicks: (affiliateId) => {
      queryClient.invalidateQueries({
        queryKey: ['referrals', 'clicks', affiliateId],
      });
    },
    invalidateSales: (affiliateId) => {
      queryClient.invalidateQueries({
        queryKey: ['referrals', 'sales', affiliateId],
      });
    },
    invalidateAll: (affiliateId) => {
      queryClient.invalidateQueries({
        queryKey: ['referrals'],
      });
    },
  };
}
