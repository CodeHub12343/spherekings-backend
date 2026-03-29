/**
 * ============================================================================
 * ADMIN REACT QUERY HOOKS - Server state management
 * ============================================================================
 *
 * Custom React Query hooks for admin dashboard queries and mutations.
 * Handles caching, refetching, and automatic invalidation.
 *
 * Cache Strategy:
 * - Dashboard: 5 minutes stale time
 * - Orders/Products: 3 minutes stale time
 * - Analytics: 10 minutes stale time
 * - Details: 5 minutes stale time
 *
 * ============================================================================
 */

import { useQuery, useQueries, useQueryClient } from '@tanstack/react-query';
import * as adminService from '../services/adminService';

// Query key factory for consistent cache management
export const adminQueryKeys = {
  all: ['admin'],
  dashboard: ['admin', 'dashboard'],
  orders: ['admin', 'orders'],
  ordersAnalytics: ['admin', 'ordersAnalytics'],
  products: ['admin', 'products'],
  productsTop: ['admin', 'productsTop'],
  affiliates: ['admin', 'affiliates'],
  affiliatesTop: ['admin', 'affiliatesTop'],
  affiliateDetail: (id) => ['admin', 'affiliate', id],
  commissions: ['admin', 'commissions'],
  commissionsAnalytics: ['admin', 'commissionsAnalytics'],
  payouts: ['admin', 'payouts'],
  payoutsAnalytics: ['admin', 'payoutsAnalytics'],
  revenue: ['admin', 'revenue'],
  system: ['admin', 'system'],
  reconciliation: ['admin', 'reconciliation']
};

/**
 * ============================================================================
 * DASHBOARD QUERIES
 * ============================================================================
 */

/**
 * Fetch dashboard overview with all key metrics
 */
export const useDashboardOverview = (options = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.dashboard,
    queryFn: adminService.getDashboardOverview,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * ============================================================================
 * ORDER QUERIES
 * ============================================================================
 */

/**
 * Fetch orders with filters and pagination
 */
export const useOrders = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.orders, params],
    queryFn: () => adminService.getOrders(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch order analytics
 */
export const useOrderAnalytics = (options = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.ordersAnalytics,
    queryFn: adminService.getOrderAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * ============================================================================
 * PRODUCT QUERIES
 * ============================================================================
 */

/**
 * Fetch products with filters and pagination
 */
export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.products, params],
    queryFn: () => adminService.getProducts(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch top selling products
 */
export const useTopProducts = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.productsTop, { limit }],
    queryFn: () => adminService.getTopProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * ============================================================================
 * AFFILIATE QUERIES
 * ============================================================================
 */

/**
 * Fetch affiliates with filters and pagination
 */
export const useAffiliates = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.affiliates, params],
    queryFn: () => adminService.getAffiliates(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch top performing affiliates
 */
export const useTopAffiliates = (limit = 10, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.affiliatesTop, { limit }],
    queryFn: () => adminService.getTopAffiliates(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch affiliate performance details
 */
export const useAffiliateDetail = (affiliateId, options = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.affiliateDetail(affiliateId),
    queryFn: () => adminService.getAffiliateDetails(affiliateId),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    enabled: !!affiliateId,
    ...options
  });
};

/**
 * ============================================================================
 * COMMISSION QUERIES
 * ============================================================================
 */

/**
 * Fetch commissions with filters and pagination
 */
export const useCommissions = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.commissions, params],
    queryFn: () => adminService.getCommissions(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch commission analytics
 */
export const useCommissionAnalytics = (options = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.commissionsAnalytics,
    queryFn: adminService.getCommissionAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * ============================================================================
 * PAYOUT QUERIES
 * ============================================================================
 */

/**
 * Fetch payouts with filters and pagination
 */
export const usePayouts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.payouts, params],
    queryFn: () => adminService.getPayouts(params),
    staleTime: 3 * 60 * 1000, // 3 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch payout analytics
 */
export const usePayoutAnalytics = (options = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.payoutsAnalytics,
    queryFn: adminService.getPayoutAnalytics,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * ============================================================================
 * ANALYTICS QUERIES
 * ============================================================================
 */

/**
 * Fetch revenue analytics with grouping options
 */
export const useRevenueAnalytics = (params = {}, options = {}) => {
  return useQuery({
    queryKey: [...adminQueryKeys.revenue, params],
    queryFn: () => adminService.getRevenueAnalytics(params),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch system health metrics
 */
export const useSystemMetrics = (options = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.system,
    queryFn: adminService.getSystemHealthMetrics,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 30 * 60 * 1000, // 30 minutes
    retry: 2,
    ...options
  });
};

/**
 * Fetch financial reconciliation report
 */
export const useReconciliation = (options = {}) => {
  return useQuery({
    queryKey: adminQueryKeys.reconciliation,
    queryFn: adminService.getFinancialReconciliation,
    staleTime: 15 * 60 * 1000, // 15 minutes
    gcTime: 60 * 60 * 1000, // 1 hour
    retry: 2,
    ...options
  });
};

/**
 * ============================================================================
 * UTILITY HOOKS
 * ============================================================================
 */

/**
 * Refetch all admin dashboard data
 */
export const useRefreshAdminDashboard = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.refetchQueries({
      queryKey: adminQueryKeys.all,
      type: 'active'
    });
  };
};

/**
 * Invalidate specific admin query
 */
export const useInvalidateAdminQuery = () => {
  const queryClient = useQueryClient();

  return (queryKey) => {
    queryClient.invalidateQueries({ queryKey });
  };
};

/**
 * Fetch multiple independent queries in parallel
 * Useful for dashboard that needs multiple datasets at once
 */
export const useDashboardData = (options = {}) => {
  const queries = useQueries({
    queries: [
      {
        queryKey: adminQueryKeys.dashboard,
        queryFn: adminService.getDashboardOverview,
        staleTime: 5 * 60 * 1000,
        retry: 2
      },
      {
        queryKey: adminQueryKeys.ordersAnalytics,
        queryFn: adminService.getOrderAnalytics,
        staleTime: 10 * 60 * 1000,
        retry: 2
      },
      {
        queryKey: [...adminQueryKeys.productsTop, { limit: 10 }],
        queryFn: () => adminService.getTopProducts(10),
        staleTime: 10 * 60 * 1000,
        retry: 2
      },
      {
        queryKey: [...adminQueryKeys.affiliatesTop, { limit: 10 }],
        queryFn: () => adminService.getTopAffiliates(10),
        staleTime: 10 * 60 * 1000,
        retry: 2
      },
      {
        queryKey: [...adminQueryKeys.revenue, { groupBy: 'day' }],
        queryFn: () => adminService.getRevenueAnalytics({ groupBy: 'day' }),
        staleTime: 10 * 60 * 1000,
        retry: 2
      },
      {
        queryKey: adminQueryKeys.system,
        queryFn: adminService.getSystemHealthMetrics,
        staleTime: 5 * 60 * 1000,
        retry: 2
      }
    ]
  });

  return {
    overview: queries[0],
    orderAnalytics: queries[1],
    topProducts: queries[2],
    topAffiliates: queries[3],
    revenueAnalytics: queries[4],
    system: queries[5],
    isLoading: queries.some((q) => q.isLoading),
    isError: queries.some((q) => q.isError),
    errors: queries.map((q) => q.error).filter(Boolean)
  };
};

/**
 * Get admin query status for debugging
 */
export const useAdminQueryStatus = () => {
  const queryClient = useQueryClient();

  return () => {
    const cache = queryClient.getQueryCache();
    return cache.getAll().map((query) => ({
      key: query.queryKey,
      state: query.state,
      dataUpdatedAt: query.state.dataUpdatedAt
    }));
  };
};
