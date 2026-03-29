/**
 * Affiliate Store
 * Zustand store for managing affiliate state globally
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import affiliateService from '@/api/services/affiliateService';

const initialState = {
  // Affiliate profile data
  profile: null,
  
  // Dashboard data
  dashboard: null,
  
  // Referrals data
  referrals: [],
  
  // Sales data
  sales: [],
  
  // Analytics data
  analytics: null,
  
  // Payout settings
  payoutSettings: null,
  
  // Leaderboard data
  leaderboard: [],
  
  // Pagination
  referralsPagination: { page: 1, limit: 20, total: 0, pages: 0 },
  salesPagination: { page: 1, limit: 20, total: 0, pages: 0 },
  
  // Loading states
  isDashboardLoading: false,
  isReferralsLoading: false,
  isSalesLoading: false,
  isAnalyticsLoading: false,
  isSettingsUpdating: false,
  isLeaderboardLoading: false,
  isRegistering: false,
  
  // Error states
  error: null,
  errorDetails: null,
};

export const useAffiliateStore = create(
  devtools(
    (set, get) => ({
      ...initialState,

      // =============== Dashboard ===============

      fetchDashboard: async (options = {}) => {
        set(() => ({
          isDashboardLoading: true,
          error: null,
        }));

        try {
          const dashboard = await affiliateService.getAffiliateDashboard(options);
          set((state) => ({
            dashboard,
            isDashboardLoading: false,
          }));
          return dashboard;
        } catch (err) {
          set((state) => ({
            isDashboardLoading: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      // =============== Referrals ===============

      fetchReferrals: async (options = {}) => {
        set(() => ({
          isReferralsLoading: true,
          error: null,
        }));

        try {
          const data = await affiliateService.getAffiliateReferrals(options);
          
          set((state) => ({
            referrals: data.referrals,
            referralsPagination: data.pagination || {},
            isReferralsLoading: false,
          }));
          
          return data;
        } catch (err) {
          set((state) => ({
            isReferralsLoading: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      // =============== Sales ===============

      fetchSales: async (options = {}) => {
        set(() => ({
          isSalesLoading: true,
          error: null,
        }));

        try {
          const data = await affiliateService.getAffiliateSales(options);
          
          set((state) => ({
            sales: data.sales,
            salesPagination: data.pagination || {},
            isSalesLoading: false,
          }));
          
          return data;
        } catch (err) {
          set((state) => ({
            isSalesLoading: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      // =============== Analytics ===============

      fetchAnalytics: async (options = {}) => {
        set(() => ({
          isAnalyticsLoading: true,
          error: null,
        }));

        try {
          const analytics = await affiliateService.getAffiliateAnalytics(options);
          
          set((state) => ({
            analytics,
            isAnalyticsLoading: false,
          }));
          
          return analytics;
        } catch (err) {
          set((state) => ({
            isAnalyticsLoading: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      // =============== Payout Settings ===============

      updatePayoutSettings: async (data) => {
        set(() => ({
          isSettingsUpdating: true,
          error: null,
        }));

        try {
          const settings = await affiliateService.updatePayoutSettings(data);
          
          set((state) => ({
            payoutSettings: settings,
            isSettingsUpdating: false,
          }));
          
          return settings;
        } catch (err) {
          set((state) => ({
            isSettingsUpdating: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      // =============== Registration ===============

      registerAffiliate: async (data) => {
        set(() => ({
          isRegistering: true,
          error: null,
        }));

        try {
          const affiliate = await affiliateService.registerAffiliate(data);
          
          set((state) => ({
            profile: affiliate,
            isRegistering: false,
          }));
          
          return affiliate;
        } catch (err) {
          set((state) => ({
            isRegistering: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      // =============== Leaderboard ===============

      fetchLeaderboard: async (options = {}) => {
        set(() => ({
          isLeaderboardLoading: true,
          error: null,
        }));

        try {
          const data = await affiliateService.getAffiliateLeaderboard(options);
          
          set((state) => ({
            leaderboard: data.affiliates || [],
            isLeaderboardLoading: false,
          }));
          
          return data;
        } catch (err) {
          set((state) => ({
            isLeaderboardLoading: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      // =============== Utility ===============

      clearError: () => {
        set(() => ({
          error: null,
          errorDetails: null,
        }));
      },

      reset: () => {
        set(initialState);
      },

      setProfile: (profile) => {
        set(() => ({
          profile,
        }));
      },
    }),
    { name: 'affiliate-store' }
  )
);

// =============== Selectors ===============

export const useAffiliateDashboard = () =>
  useAffiliateStore((state) => ({
    dashboard: state.dashboard,
    isLoading: state.isDashboardLoading,
    error: state.error,
  }));

export const useAffiliateReferrals = () =>
  useAffiliateStore(
    useShallow((state) => ({
      referrals: state.referrals,
      pagination: state.referralsPagination,
      isLoading: state.isReferralsLoading,
      error: state.error,
    }))
  );

export const useAffiliateSales = () =>
  useAffiliateStore(
    useShallow((state) => ({
      sales: state.sales,
      pagination: state.salesPagination,
      isLoading: state.isSalesLoading,
      error: state.error,
    }))
  );

export const useAffiliateAnalytics = () =>
  useAffiliateStore((state) => ({
    analytics: state.analytics,
    isLoading: state.isAnalyticsLoading,
    error: state.error,
  }));

export const useAffiliateProfile = () =>
  useAffiliateStore((state) => state.profile);

export const useAffiliateError = () =>
  useAffiliateStore(
    useShallow((state) => ({
      error: state.error,
      errorDetails: state.errorDetails,
    }))
  );

export default useAffiliateStore;
