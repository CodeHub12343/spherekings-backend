/**
 * Commission React Query Hooks (Affiliate)
 * Custom hooks for commission-related API calls using React Query
 * 
 * Provides:
 * - useAffiliateCommissions - List affiliate commissions with pagination
 * - useAffiliateCommissionStats - Get affiliate commission statistics
 * - useCommissionDetail - Get specific commission details
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import commissionService from '@/api/services/commissionService';

/**
 * Query Keys for Commission Data
 * Helps with caching and invalidation
 */
export const commissionQueryKeys = {
  all: ['commissions'],
  affiliate: ['commissions', 'affiliate'],
  affiliateList: (filters) => [...commissionQueryKeys.affiliate, 'list', filters],
  affiliateStats: (filters) => [...commissionQueryKeys.affiliate, 'stats', filters],
  admin: ['commissions', 'admin'],
  adminList: (filters) => [...commissionQueryKeys.admin, 'list', filters],
  adminStats: (filters) => [...commissionQueryKeys.admin, 'stats', filters],
  detail: (id) => ['commissions', 'detail', id],
  readyPayouts: (filters) => [...commissionQueryKeys.admin, 'ready-payouts', filters],
};

/**
 * ==================== AFFILIATE HOOKS ====================
 */

/**
 * Fetch affiliate commission list with pagination and filtering
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by status
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @param {boolean} options.enabled - Enable/disable query
 * @returns {Object} Query result with commissions and pagination
 */
export function useAffiliateCommissions(options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    dateFrom,
    dateTo,
    enabled = true,
  } = options;

  const queryKey = commissionQueryKeys.affiliateList({
    page,
    limit,
    status,
    dateFrom,
    dateTo,
  });

  return useQuery({
    queryKey,
    queryFn: () =>
      commissionService.getAffiliateCommissions({
        page,
        limit,
        status,
        dateFrom,
        dateTo,
      }),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching in background
    retry: 1,
    select: (data) => ({
      commissions: data.commissions || [],
      pagination: data.pagination || {},
    }),
  });
}

/**
 * Fetch affiliate commission statistics
 * 
 * @param {Object} options - Query options
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @param {boolean} options.enabled - Enable/disable query
 * @returns {Object} Query result with statistics
 */
export function useAffiliateCommissionStats(options = {}) {
  const {
    dateFrom,
    dateTo,
    enabled = true,
  } = options;

  const queryKey = commissionQueryKeys.affiliateStats({
    dateFrom,
    dateTo,
  });

  return useQuery({
    queryKey,
    queryFn: () =>
      commissionService.getAffiliateCommissionStats({
        dateFrom,
        dateTo,
      }),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching in background
    retry: 1,
    select: (data) => data,
  });
}

/**
 * Fetch specific commission details
 * 
 * @param {string} commissionId - Commission ID
 * @param {Object} options - Query options
 * @param {boolean} options.enabled - Enable/disable query
 * @returns {Object} Query result with commission details
 */
export function useCommissionDetail(commissionId, options = {}) {
  const { enabled = !!commissionId } = options;

  return useQuery({
    queryKey: commissionQueryKeys.detail(commissionId),
    queryFn: () => commissionService.getCommissionDetail(commissionId),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
  });
}

/**
 * ==================== ADMIN HOOKS ====================
 */

/**
 * Fetch all commissions (admin only)
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {string} options.status - Filter by status
 * @param {boolean} options.fraudOnly - Show only fraudulent
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @param {boolean} options.enabled - Enable/disable query
 * @returns {Object} Query result
 */
export function useAllCommissions(options = {}) {
  const {
    page = 1,
    limit = 20,
    status,
    fraudOnly = false,
    dateFrom,
    dateTo,
    enabled = true,
  } = options;

  const queryKey = commissionQueryKeys.adminList({
    page,
    limit,
    status,
    fraudOnly,
    dateFrom,
    dateTo,
  });

  return useQuery({
    queryKey,
    queryFn: () =>
      commissionService.getAllCommissions({
        page,
        limit,
        status,
        fraudOnly,
        dateFrom,
        dateTo,
      }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    select: (data) => ({
      commissions: data.commissions || [],
      pagination: data.pagination || {},
    }),
  });
}

/**
 * Fetch system-wide commission statistics (admin only)
 * 
 * @param {Object} options - Query options
 * @param {string} options.dateFrom - Start date
 * @param {string} options.dateTo - End date
 * @param {boolean} options.enabled - Enable/disable query
 * @returns {Object} Query result with statistics
 */
export function useSystemStatistics(options = {}) {
  const {
    dateFrom,
    dateTo,
    enabled = true,
  } = options;

  const queryKey = commissionQueryKeys.adminStats({
    dateFrom,
    dateTo,
  });

  return useQuery({
    queryKey,
    queryFn: () =>
      commissionService.getSystemStatistics({
        dateFrom,
        dateTo,
      }),
    enabled,
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    select: (data) => {
      // Transform backend response structure into component-expected format
      if (!data) return null;

      const { byStatus = [], totalMetrics = [], byAffiliate = [] } = data;
      
      // Extract total metrics (index 0 contains all totals)
      const totals = totalMetrics[0] || {};
      
      // Find breakdown by status
      const statusMap = {};
      byStatus.forEach(item => {
        statusMap[item._id] = {
          count: item.count || 0,
          amount: item.totalAmount || 0
        };
      });

      return {
        totalCommissions: totals.totalCommissions || 0,
        totalEarned: totals.totalCommissionAmount || 0,
        averageCommission: totals.averageCommission || 0,
        maxCommission: totals.maxCommission || 0,
        minCommission: totals.minCommission || 0,
        
        // Status-based breakdown
        pendingCount: statusMap.pending?.count || 0,
        pendingAmount: statusMap.pending?.amount || 0,
        
        approvedCount: statusMap.approved?.count || 0,
        approvedAmount: statusMap.approved?.amount || 0,
        
        paidCount: statusMap.paid?.count || 0,
        paidAmount: statusMap.paid?.amount || 0,
        
        reversedCount: statusMap.reversed?.count || 0,
        reversedAmount: statusMap.reversed?.amount || 0,
        
        // Aliases for component compatibility
        totalPending: statusMap.pending?.amount || 0,
        totalApproved: statusMap.approved?.amount || 0,
        
        // Additional data for future use
        raw: data,
        byAffiliate
      };
    },
  });
}

/**
 * Fetch ready payouts (admin only)
 * 
 * @param {Object} options - Query options
 * @param {number} options.page - Page number
 * @param {number} options.limit - Items per page
 * @param {boolean} options.enabled - Enable/disable query
 * @returns {Object} Query result
 */
export function useReadyPayouts(options = {}) {
  const {
    page = 1,
    limit = 20,
    enabled = true,
  } = options;

  const queryKey = commissionQueryKeys.readyPayouts({
    page,
    limit,
  });

  return useQuery({
    queryKey,
    queryFn: () =>
      commissionService.getReadyPayouts({
        page,
        limit,
      }),
    enabled,
    staleTime: 3 * 60 * 1000, // 3 minutes (more fresh for payouts)
    cacheTime: 10 * 60 * 1000, // 10 minutes
    retry: 1,
    select: (data) => ({
      commissions: data.commissions || [],
      pagination: data.pagination || {},
    }),
  });
}

/**
 * ==================== MUTATION HOOKS ====================
 */

/**
 * Approve a commission (admin only)
 * 
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useApproveCommission(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ commissionId, notes }) =>
      commissionService.approveCommission(commissionId, { notes }),
    onSuccess: (data, variables) => {
      // Invalidate related queries (ALWAYS runs)
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.admin,
      });
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.detail(variables.commissionId),
      });
      // Then call custom onSuccess if provided
      customOnSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Call custom onError if provided
      customOnError?.(error, variables);
    },
    ...restOptions,
  });
}

/**
 * Mark commission as paid (admin only)
 * 
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useMarkCommissionAsPaid(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ commissionId, method, transactionId, receiptId }) =>
      commissionService.markCommissionAsPaid(commissionId, {
        method,
        transactionId,
        receiptId,
      }),
    onSuccess: (data, variables) => {
      // Invalidate related queries (ALWAYS runs)
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.admin,
      });
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.detail(variables.commissionId),
      });
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.readyPayouts({}),
      });
      // Then call custom onSuccess if provided
      customOnSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Call custom onError if provided
      customOnError?.(error, variables);
    },
    ...restOptions,
  });
}

/**
 * Reverse a commission (admin only)
 * 
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useReverseCommission(options = {}) {
  const queryClient = useQueryClient();
  const { onSuccess: customOnSuccess, onError: customOnError, ...restOptions } = options;

  return useMutation({
    mutationFn: ({ commissionId, reason, details, amount }) =>
      commissionService.reverseCommission(commissionId, {
        reason,
        details,
        amount,
      }),
    onSuccess: (data, variables) => {
      // Invalidate related queries (ALWAYS runs)
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.admin,
      });
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.affiliate,
      });
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.detail(variables.commissionId),
      });
      // Then call custom onSuccess if provided
      customOnSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      // Call custom onError if provided
      customOnError?.(error, variables);
    },
    ...restOptions,
  });
}

/**
 * Batch approve commissions (admin only)
 * 
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useBatchApproveCommissions(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commissionIds, notes }) =>
      commissionService.batchApproveCommissions({
        commissionIds,
        notes,
      }),
    onSuccess: () => {
      // Invalidate all commission queries
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.all,
      });
    },
    ...options,
  });
}

/**
 * Batch pay commissions (admin only)
 * 
 * @param {Object} options - Mutation options
 * @returns {Object} Mutation result
 */
export function useBatchPayCommissions(options = {}) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ commissions }) =>
      commissionService.batchPayCommissions({ commissions }),
    onSuccess: () => {
      // Invalidate all commission queries
      queryClient.invalidateQueries({
        queryKey: commissionQueryKeys.all,
      });
    },
    ...options,
  });
}

export default {
  // Affiliate queries
  useAffiliateCommissions,
  useAffiliateCommissionStats,
  useCommissionDetail,
  
  // Admin queries
  useAllCommissions,
  useSystemStatistics,
  useReadyPayouts,
  
  // Mutations
  useApproveCommission,
  useMarkCommissionAsPaid,
  useReverseCommission,
  useBatchApproveCommissions,
  useBatchPayCommissions,
};
