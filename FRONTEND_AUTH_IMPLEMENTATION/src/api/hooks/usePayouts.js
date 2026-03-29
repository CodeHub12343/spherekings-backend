/**
 * Payout Hooks - React Query Integration
 * 
 * Provides custom hooks for payout data fetching and mutations
 * Handles caching, automatic invalidation, and error handling
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import PayoutService from '@/api/services/payoutService';
import { affiliateQueryKeys } from '@/hooks/useAffiliates';
import { commissionQueryKeys } from './useCommissions';

/**
 * Query key factory for payout queries
 */
const payoutKeys = {
  all: ['payouts'],
  affiliate: () => [...payoutKeys.all, 'affiliate'],
  affiliateList: (filters) => [...payoutKeys.affiliate(), 'list', filters],
  affiliateStats: () => [...payoutKeys.affiliate(), 'stats'],
  detail: (id) => [...payoutKeys.all, 'detail', id],
  admin: () => [...payoutKeys.all, 'admin'],
  adminList: (filters) => [...payoutKeys.admin(), 'list', filters],
  pending: (options) => [...payoutKeys.admin(), 'pending', options],
  ready: (filters) => [...payoutKeys.admin(), 'ready', filters],
  systemStats: (options) => [...payoutKeys.admin(), 'stats', options]
};

/**
 * ==================== AFFILIATE QUERY HOOKS ====================
 */

/**
 * Hook: Get affiliate payout history
 * 
 * @param {object} filters - Filter and pagination options
 * @param {object} options - React Query options
 * @returns {object} Query result with data, loading, error
 */
export const useAffiliatePayouts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: payoutKeys.affiliateList(filters),
    queryFn: () => PayoutService.getAffiliatePayouts(filters),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching in background
    enabled: options.enabled !== false,
    ...options
  });
};

/**
 * Hook: Get affiliate payout statistics
 * 
 * @param {object} options - React Query options
 * @returns {object} Query result with data, loading, error
 */
export const useAffiliatePayoutStats = (options = {}) => {
  return useQuery({
    queryKey: payoutKeys.affiliateStats(),
    queryFn: () => PayoutService.getAffiliatePayoutStats(),
    staleTime: 30 * 1000, // 30 seconds
    cacheTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching in background
    enabled: options.enabled !== false,
    ...options
  });
};

/**
 * Hook: Get single payout details
 * 
 * @param {string} payoutId - Payout ID
 * @param {object} options - React Query options
 * @returns {object} Query result with data, loading, error
 */
export const usePayoutDetail = (payoutId, options = {}) => {
  return useQuery({
    queryKey: payoutKeys.detail(payoutId),
    queryFn: () => PayoutService.getPayoutDetail(payoutId),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: options.enabled !== false && !!payoutId,
    ...options
  });
};

/**
 * Hook: Request new payout (mutation)
 * 
 * @param {object} callbacks - onSuccess, onError callbacks
 * @returns {object} Mutation object with mutate, isPending, error, isSuccess
 */
export const useRequestPayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payoutData) => PayoutService.requestPayout(payoutData),
    onSuccess: (data) => {
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: payoutKeys.affiliate() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.affiliateStats() });
      callbacks.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks.onError?.(error);
    }
  });
};

/**
 * ==================== ADMIN QUERY HOOKS ====================
 */

/**
 * Hook: Get all payouts (admin view)
 * 
 * @param {object} filters - Filter and pagination options
 * @param {object} options - React Query options
 * @returns {object} Query result with data, loading, error
 */
export const useAllPayouts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: payoutKeys.adminList(filters),
    queryFn: () => PayoutService.getAllPayouts(filters),
    staleTime: 3 * 60 * 1000, // 3 minutes
    cacheTime: 10 * 60 * 1000,
    enabled: options.enabled !== false,
    ...options
  });
};

/**
 * Hook: Get pending payouts (approval queue)
 * 
 * @param {object} options - Query options (limit, enabled, etc.)
 * @returns {object} Query result
 */
export const usePendingPayouts = (options = {}) => {
  return useQuery({
    queryKey: payoutKeys.pending(options),
    queryFn: () => PayoutService.getPendingPayouts(options),
    staleTime: 2 * 60 * 1000, // 2 minutes (more frequent updates for pending)
    cacheTime: 10 * 60 * 1000,
    enabled: options.enabled !== false,
    ...options
  });
};

/**
 * Hook: Get ready-to-process payouts
 * 
 * @param {object} filters - Filter and pagination options
 * @param {object} options - React Query options
 * @returns {object} Query result
 */
export const useReadyPayouts = (filters = {}, options = {}) => {
  return useQuery({
    queryKey: payoutKeys.ready(filters),
    queryFn: () => PayoutService.getReadyPayouts(filters),
    staleTime: 3 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: options.enabled !== false,
    ...options
  });
};

/**
 * Hook: Get system payout statistics (admin)
 * 
 * @param {object} options - Query options (dateFrom, dateTo, enabled)
 * @returns {object} Query result
 */
export const useSystemPayoutStats = (options = {}) => {
  return useQuery({
    queryKey: payoutKeys.systemStats(options),
    queryFn: () => PayoutService.getSystemPayoutStats(options),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
    enabled: options.enabled !== false,
    ...options
  });
};

/**
 * ==================== ADMIN MUTATION HOOKS ====================
 */

/**
 * Hook: Approve payout mutation
 * 
 * @param {object} callbacks - onSuccess, onError callbacks
 * @returns {object} Mutation object
 */
export const useApprovePayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, notes }) => PayoutService.approvePayout(payoutId, notes),
    onSuccess: (data, variables) => {
      const { payoutId } = variables;
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: payoutKeys.ready({}) });
      // Invalidate the specific detail query so detail page refetches immediately
      queryClient.invalidateQueries({ queryKey: payoutKeys.detail(payoutId) });
      callbacks.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks.onError?.(error);
    }
  });
};

/**
 * Hook: Process payout mutation
 * 
 * @param {object} callbacks - onSuccess, onError callbacks
 * @returns {object} Mutation object
 */
export const useProcessPayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, receiptId, transactionId }) =>
      PayoutService.processPayout(payoutId, receiptId, transactionId),
    onSuccess: (data, variables) => {
      const { payoutId } = variables;
      // Invalidate admin payout queries
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.ready({}) });
      // Invalidate the specific detail query so detail page refetches immediately
      queryClient.invalidateQueries({ queryKey: payoutKeys.detail(payoutId) });
      
      // Invalidate affiliate queries so they see the updated earnings
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.sales() });
      
      // Invalidate commission queries so they see the updated commission statuses
      queryClient.invalidateQueries({ queryKey: commissionQueryKeys.affiliate });
      
      // Invalidate payout queries
      queryClient.invalidateQueries({ queryKey: payoutKeys.affiliate() });
      
      callbacks.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks.onError?.(error);
    }
  });
};

/**
 * Hook: Reject payout mutation
 * 
 * @param {object} callbacks - onSuccess, onError callbacks
 * @returns {object} Mutation object
 */
export const useRejectPayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutId, reason, details }) =>
      PayoutService.rejectPayout(payoutId, reason, details),
    onSuccess: (data, variables) => {
      const { payoutId } = variables;
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.pending({}) });
      // Invalidate the specific detail query so detail page refetches immediately
      queryClient.invalidateQueries({ queryKey: payoutKeys.detail(payoutId) });
      
      // Invalidate affiliate queries since payout was rejected
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.dashboard() });
      
      callbacks.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks.onError?.(error);
    }
  });
};

/**
 * Hook: Batch approve payouts mutation
 * 
 * @param {object} callbacks - onSuccess, onError callbacks
 * @returns {object} Mutation object
 */
export const useBatchApprovePayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutIds, notes }) =>
      PayoutService.batchApprovePayout(payoutIds, notes),
    onSuccess: (data, variables) => {
      const { payoutIds } = variables;
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.pending({}) });
      queryClient.invalidateQueries({ queryKey: payoutKeys.ready({}) });
      // Invalidate detail queries for all affected payouts
      payoutIds?.forEach(id => {
        queryClient.invalidateQueries({ queryKey: payoutKeys.detail(id) });
      });
      // Invalidate affiliate queries since payout was approved
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.dashboard() });
      callbacks.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks.onError?.(error);
    }
  });
};

/**
 * Hook: Batch process payouts mutation
 * 
 * @param {object} callbacks - onSuccess, onError callbacks
 * @returns {object} Mutation object
 */
export const useBatchProcessPayout = (callbacks = {}) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ payoutIds, stripeConnectId }) =>
      PayoutService.batchProcessPayout(payoutIds, stripeConnectId),
    onSuccess: (data, variables) => {
      const { payoutIds } = variables;
      queryClient.invalidateQueries({ queryKey: payoutKeys.admin() });
      queryClient.invalidateQueries({ queryKey: payoutKeys.ready({}) });
      // Invalidate detail queries for all affected payouts
      payoutIds?.forEach(id => {
        queryClient.invalidateQueries({ queryKey: payoutKeys.detail(id) });
      });
      
      // Invalidate affiliate queries so they see the updated earnings
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.analytics() });
      queryClient.invalidateQueries({ queryKey: commissionQueryKeys.affiliate });
      queryClient.invalidateQueries({ queryKey: payoutKeys.affiliate() });
      
      callbacks.onSuccess?.(data);
    },
    onError: (error) => {
      callbacks.onError?.(error);
    }
  });
};

export default {
  // Affiliate hooks
  useAffiliatePayouts,
  useAffiliatePayoutStats,
  usePayoutDetail,
  useRequestPayout,

  // Admin hooks
  useAllPayouts,
  usePendingPayouts,
  useReadyPayouts,
  useSystemPayoutStats,
  useApprovePayout,
  useProcessPayout,
  useRejectPayout,
  useBatchApprovePayout,
  useBatchProcessPayout
};
