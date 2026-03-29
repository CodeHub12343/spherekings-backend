/**
 * Referral Tracking Zustand Store
 * Client-side state management for referral analytics dashboard
 */

'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

// Get date 30 days ago
const getDefaultDateFrom = () => {
  const date = new Date();
  date.setDate(date.getDate() - 30);
  return date.toISOString().split('T')[0];
};

// Get today
const getDefaultDateTo = () => {
  return new Date().toISOString().split('T')[0];
};

export const useReferralStore = create(
  persist(
    (set, get) => ({
      // ==================== FILTER STATE ====================

      // Date range filter
      dateRange: {
        dateFrom: getDefaultDateFrom(),
        dateTo: getDefaultDateTo(),
      },

      // Referral clicks filter
      referralsFilter: {
        convertedOnly: false,
        source: null, // 'direct', 'email', 'facebook', etc.
        device: null, // 'mobile', 'tablet', 'desktop'
      },

      // ==================== PAGINATION STATE ====================

      // Referral clicks pagination
      clicksPagination: {
        page: 1,
        limit: 20,
      },

      // Sales pagination
      salesPagination: {
        page: 1,
        limit: 20,
      },

      // ==================== ANALYTICS VIEW STATE ====================

      // Active chart/view
      analyticsView: {
        activeTab: 'overview', // 'overview', 'by-source', 'by-device', 'trends'
        chartType: 'bar', // 'bar', 'pie', 'line'
        timeGranularity: 'day', // 'day', 'week', 'month'
      },

      // ==================== MODAL STATE ====================

      // Referral detail modal
      referralModal: {
        isOpen: false,
        selectedReferral: null,
      },

      // Export/Share modal
      exportModal: {
        isOpen: false,
        exportFormat: 'csv', // 'csv', 'json', 'pdf'
      },

      // ==================== SORTING STATE ====================

      sorting: {
        clicksSort: { field: 'createdAt', direction: 'desc' },
        salesSort: { field: 'createdAt', direction: 'desc' },
      },

      // ==================== FILTER ACTIONS ====================

      setDateRange: (dateFrom, dateTo) => {
        set((state) => ({
          dateRange: {
            dateFrom,
            dateTo,
          },
        }));
      },

      setReferralsFilter: (filterKey, value) => {
        set((state) => ({
          referralsFilter: {
            ...state.referralsFilter,
            [filterKey]: value,
          },
        }));
      },

      resetReferralsFilter: () => {
        set({
          referralsFilter: {
            convertedOnly: false,
            source: null,
            device: null,
          },
        });
      },

      // ==================== PAGINATION ACTIONS ====================

      setClicksPage: (page) => {
        set((state) => ({
          clicksPagination: {
            ...state.clicksPagination,
            page,
          },
        }));
      },

      setClicksLimit: (limit) => {
        set((state) => ({
          clicksPagination: {
            ...state.clicksPagination,
            limit,
            page: 1, // Reset to first page
          },
        }));
      },

      setSalesPage: (page) => {
        set((state) => ({
          salesPagination: {
            ...state.salesPagination,
            page,
          },
        }));
      },

      setSalesLimit: (limit) => {
        set((state) => ({
          salesPagination: {
            ...state.salesPagination,
            limit,
            page: 1, // Reset to first page
          },
        }));
      },

      // Reset pagination
      resetClicksPagination: () => {
        set({
          clicksPagination: {
            page: 1,
            limit: 20,
          },
        });
      },

      resetSalesPagination: () => {
        set({
          salesPagination: {
            page: 1,
            limit: 20,
          },
        });
      },

      // ==================== ANALYTICS VIEW ACTIONS ====================

      setActiveTab: (tab) => {
        set((state) => ({
          analyticsView: {
            ...state.analyticsView,
            activeTab: tab,
          },
        }));
      },

      setChartType: (chartType) => {
        set((state) => ({
          analyticsView: {
            ...state.analyticsView,
            chartType,
          },
        }));
      },

      setTimeGranularity: (granularity) => {
        set((state) => ({
          analyticsView: {
            ...state.analyticsView,
            timeGranularity: granularity,
          },
        }));
      },

      // ==================== MODAL ACTIONS ====================

      openReferralModal: (referral) => {
        set({
          referralModal: {
            isOpen: true,
            selectedReferral: referral,
          },
        });
      },

      closeReferralModal: () => {
        set({
          referralModal: {
            isOpen: false,
            selectedReferral: null,
          },
        });
      },

      openExportModal: () => {
        set((state) => ({
          exportModal: {
            ...state.exportModal,
            isOpen: true,
          },
        }));
      },

      closeExportModal: () => {
        set({
          exportModal: {
            isOpen: false,
            exportFormat: 'csv',
          },
        });
      },

      setExportFormat: (format) => {
        set((state) => ({
          exportModal: {
            ...state.exportModal,
            exportFormat: format,
          },
        }));
      },

      // ==================== SORTING ACTIONS ====================

      setClicksSort: (field, direction) => {
        set((state) => ({
          sorting: {
            ...state.sorting,
            clicksSort: { field, direction },
          },
        }));
      },

      setSalesSort: (field, direction) => {
        set((state) => ({
          sorting: {
            ...state.sorting,
            salesSort: { field, direction },
          },
        }));
      },

      // Toggle sort direction
      toggleClicksSort: (field) => {
        set((state) => {
          const currentSort = state.sorting.clicksSort;
          const direction =
            currentSort.field === field && currentSort.direction === 'desc' ? 'asc' : 'desc';
          return {
            sorting: {
              ...state.sorting,
              clicksSort: { field, direction },
            },
          };
        });
      },

      toggleSalesSort: (field) => {
        set((state) => {
          const currentSort = state.sorting.salesSort;
          const direction =
            currentSort.field === field && currentSort.direction === 'desc' ? 'asc' : 'desc';
          return {
            sorting: {
              ...state.sorting,
              salesSort: { field, direction },
            },
          };
        });
      },

      // ==================== COMPOSITE ACTIONS ====================

      // Reset all filters and pagination
      resetAllFilters: () => {
        set({
          dateRange: {
            dateFrom: getDefaultDateFrom(),
            dateTo: getDefaultDateTo(),
          },
          referralsFilter: {
            convertedOnly: false,
            source: null,
            device: null,
          },
          clicksPagination: { page: 1, limit: 20 },
          salesPagination: { page: 1, limit: 20 },
        });
      },

      // Get current filter state for API calls
      getClicksFilterState: () => {
        const state = get();
        return {
          ...state.dateRange,
          ...state.referralsFilter,
          page: state.clicksPagination.page,
          limit: state.clicksPagination.limit,
        };
      },

      getSalesFilterState: () => {
        const state = get();
        return {
          ...state.dateRange,
          page: state.salesPagination.page,
          limit: state.salesPagination.limit,
        };
      },

      getStatsFilterState: () => {
        const state = get();
        return state.dateRange;
      },
    }),
    {
      name: 'referral-dashboard-storage', // localStorage key
      partialize: (state) => ({
        dateRange: state.dateRange,
        referralsFilter: state.referralsFilter,
        analyticsView: state.analyticsView,
        sorting: state.sorting,
      }),
    }
  )
);

// ==================== DERIVED STATE SELECTORS ====================

/**
 * Get formatted date range for display
 */
export const selectDateRangeForDisplay = (state) => {
  const options = { month: 'short', day: 'numeric' };
  const from = new Date(state.dateRange.dateFrom).toLocaleDateString(undefined, options);
  const to = new Date(state.dateRange.dateTo).toLocaleDateString(undefined, options);
  return `${from} - ${to}`;
};

/**
 * Get active filters count
 */
export const selectActiveFiltersCount = (state) => {
  let count = 0;
  if (state.referralsFilter.convertedOnly) count += 1;
  if (state.referralsFilter.source) count += 1;
  if (state.referralsFilter.device) count += 1;
  return count;
};

/**
 * Check if any filters are active
 */
export const selectHasActiveFilters = (state) => {
  return selectActiveFiltersCount(state) > 0;
};
