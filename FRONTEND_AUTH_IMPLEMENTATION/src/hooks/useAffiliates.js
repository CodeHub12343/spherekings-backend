'use client';

/**
 * Affiliate Hooks
 * Custom React hooks for affiliate operations
 */

import { useState, useCallback, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import useAffiliateStore from '@/stores/affiliateStore';
import affiliateService from '@/api/services/affiliateService';

// =============== Query Keys ===============

export const affiliateQueryKeys = {
  all: ['affiliate'],
  dashboard: () => ['affiliate', 'dashboard'],
  referrals: (options) => ['affiliate', 'referrals', options],
  sales: (options) => ['affiliate', 'sales', options],
  analytics: (options) => ['affiliate', 'analytics', options],
  leaderboard: (options) => ['affiliate', 'leaderboard', options],
};

// =============== Main Hooks ===============

/**
 * useAffiliateDashboard Hook
 * Fetches and caches affiliate dashboard data
 */
export const useAffiliateDashboard = (options = {}, enabled = true) => {
  const queryClient = useQueryClient();
  const { fetchDashboard } = useAffiliateStore();

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: affiliateQueryKeys.dashboard(),
    queryFn: () => affiliateService.getAffiliateDashboard(options),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching in background
  });

  return {
    dashboard: data,
    isLoading,
    error: error?.response?.data?.message || error?.message,
    refetch,
  };
};

/**
 * useAffiliateReferrals Hook
 * Fetches and caches referral data with pagination
 */
export const useAffiliateReferrals = (
  options = { page: 1, limit: 20 },
  enabled = true
) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(options.page || 1);
  const [limit, setLimit] = useState(options.limit || 20);
  const [convertedOnly, setConvertedOnly] = useState(options.convertedOnly || false);

  const currentOptions = { ...options, page, limit, convertedOnly };

  const { data, isLoading, error, refetch, isPreviousData } = useQuery({
    queryKey: affiliateQueryKeys.referrals(currentOptions),
    queryFn: () => affiliateService.getAffiliateReferrals(currentOptions),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    referrals: data?.referrals || [],
    pagination: data?.pagination || { page, limit, total: 0, pages: 0 },
    metrics: data?.metrics,
    isLoading,
    isPreviousData,
    error: error?.response?.data?.message || error?.message,
    refetch,
    page,
    setPage,
    limit,
    setLimit,
    convertedOnly,
    setConvertedOnly,
  };
};

/**
 * useAffiliateSales Hook
 * Fetches and caches sales data with filtering
 */
export const useAffiliateSales = (
  options = { page: 1, limit: 20 },
  enabled = true
) => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(options.page || 1);
  const [limit, setLimit] = useState(options.limit || 20);
  const [status, setStatus] = useState(options.status || '');

  const currentOptions = { ...options, page, limit, status };

  const { data, isLoading, error, refetch, isPreviousData } = useQuery({
    queryKey: affiliateQueryKeys.sales(currentOptions),
    queryFn: () => affiliateService.getAffiliateSales(currentOptions),
    enabled,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });

  return {
    sales: data?.sales || [],
    pagination: data?.pagination || { page, limit, total: 0, pages: 0 },
    statistics: data?.statistics,
    isLoading,
    isPreviousData,
    error: error?.response?.data?.message || error?.message,
    refetch,
    page,
    setPage,
    limit,
    setLimit,
    status,
    setStatus,
  };
};

/**
 * useAffiliateAnalytics Hook
 * Fetches and caches analytics data
 */
export const useAffiliateAnalytics = (
  options = { startDate: null, endDate: null },
  enabled = true
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: affiliateQueryKeys.analytics(options),
    queryFn: () => affiliateService.getAffiliateAnalytics(options),
    enabled,
    staleTime: 30 * 1000, // 30 seconds
    gcTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Auto-refetch every 30 seconds
    refetchIntervalInBackground: true, // Keep refetching in background
  });

  return {
    analytics: data,
    isLoading,
    error: error?.response?.data?.message || error?.message,
    refetch,
  };
};

/**
 * useAffiliateLeaderboard Hook
 * Fetches public leaderboard data
 */
export const useAffiliateLeaderboard = (
  options = { limit: 50, sortBy: 'totalEarnings' },
  enabled = true
) => {
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: affiliateQueryKeys.leaderboard(options),
    queryFn: () => affiliateService.getAffiliateLeaderboard(options),
    enabled,
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 20 * 60 * 1000, // 20 minutes
  });

  return {
    affiliates: data?.affiliates || [],
    isLoading,
    error: error?.response?.data?.message || error?.message,
    refetch,
  };
};

// =============== Mutation Hooks ===============

/**
 * useRegisterAffiliate Hook
 * Register user as affiliate
 */
export const useRegisterAffiliate = () => {
  const queryClient = useQueryClient();
  const { registerAffiliate } = useAffiliateStore();

  const mutation = useMutation({
    mutationFn: (data) => affiliateService.registerAffiliate(data),
    onSuccess: (data) => {
      // Invalidate dashboard cache
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.dashboard() });
      // Update store
      registerAffiliate(data);
    },
    onError: (error) => {
      console.error('Registration failed:', error);
    },
  });

  return {
    registerAffiliate: mutation.mutate,
    registerAffiliateAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.response?.data?.message || mutation.error?.message,
    data: mutation.data,
  };
};

/**
 * useUpdatePayoutSettings Hook
 * Update affiliate payout settings
 */
export const useUpdatePayoutSettings = () => {
  const queryClient = useQueryClient();
  const { updatePayoutSettings } = useAffiliateStore();

  const mutation = useMutation({
    mutationFn: (data) => affiliateService.updatePayoutSettings(data),
    onSuccess: (data) => {
      // Invalidate dashboard cache
      queryClient.invalidateQueries({ queryKey: affiliateQueryKeys.dashboard() });
      // Update store
      updatePayoutSettings(data);
    },
    onError: (error) => {
      console.error('Settings update failed:', error);
    },
  });

  return {
    updateSettings: mutation.mutate,
    updateSettingsAsync: mutation.mutateAsync,
    isLoading: mutation.isPending,
    isSuccess: mutation.isSuccess,
    isError: mutation.isError,
    error: mutation.error?.response?.data?.message || mutation.error?.message,
    data: mutation.data,
  };
};

/**
 * useTrackReferralClick Hook
 * Track referral click (public endpoint)
 */
export const useTrackReferralClick = () => {
  const [trackingId, setTrackingId] = useState(null);
  const [isTracked, setIsTracked] = useState(false);

  const trackClick = useCallback(async (options = {}) => {
    try {
      const result = await affiliateService.trackReferralClick(options);
      setTrackingId(result?.trackingId);
      setIsTracked(true);
      return result;
    } catch (error) {
      console.error('Failed to track referral click:', error);
      // Silently fail for public endpoint
    }
  }, []);

  return {
    trackClick,
    trackingId,
    isTracked,
  };
};

// =============== Combined Hooks ===============

/**
 * useAffiliate Hook
 * Main hook combining dashboard, referrals, sales, and analytics
 */
export const useAffiliate = (enableAutoFetch = true) => {
  const dashboard = useAffiliateDashboard(undefined, enableAutoFetch);
  const referrals = useAffiliateReferrals(undefined, enableAutoFetch);
  const sales = useAffiliateSales(undefined, enableAutoFetch);
  const analytics = useAffiliateAnalytics(undefined, enableAutoFetch);

  return {
    dashboard,
    referrals,
    sales,
    analytics,
  };
};

/**
 * useAffiliateRegistration Hook
 * Complete registration flow hook
 */
export const useAffiliateRegistration = () => {
  const { registerAffiliate, isLoading, isSuccess, error } = useRegisterAffiliate();
  const [formData, setFormData] = useState({});

  const handleRegister = useCallback(
    async (data) => {
      setFormData(data);
      try {
        await registerAffiliate(data);
        return true;
      } catch (err) {
        console.error('Registration error:', err);
        return false;
      }
    },
    [registerAffiliate]
  );

  return {
    handleRegister,
    isLoading,
    isSuccess,
    error,
    formData,
  };
};

/**
 * useAffiliatePayoutFlow Hook
 * Complete payout settings flow
 */
export const useAffiliatePayoutFlow = () => {
  const {
    updateSettings,
    isLoading,
    isSuccess,
    error,
  } = useUpdatePayoutSettings();

  const handleUpdatePayout = useCallback(
    async (payoutMethod, payoutData, minimumThreshold) => {
      try {
        await updateSettings({
          payoutMethod,
          payoutData,
          minimumThreshold,
        });
        return true;
      } catch (err) {
        console.error('Payout update error:', err);
        return false;
      }
    },
    [updateSettings]
  );

  return {
    handleUpdatePayout,
    isLoading,
    isSuccess,
    error,
  };
};

export default useAffiliate;
