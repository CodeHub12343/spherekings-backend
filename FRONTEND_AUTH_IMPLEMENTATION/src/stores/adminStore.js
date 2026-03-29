/**
 * ============================================================================
 * ADMIN ZUSTAND STORE - Client state management
 * ============================================================================
 *
 * Manages client-side admin dashboard state including:
 * - Filter state (orders, products, affiliates, commissions, payouts)
 * - Pagination state
 * - Modal states
 * - UI preferences (sidebar collapsed, theme, etc.)
 *
 * Persists to localStorage for UX continuity.
 *
 * ============================================================================
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const STORAGE_KEY = 'admin_store';

export const useAdminStore = create(
  persist(
    (set, get) => ({
      /**
       * ================================================================
       * FILTER STATE
       * ================================================================
       */

      // Order filters
      orderFilters: {
        page: 1,
        limit: 20,
        status: '',
        affiliateId: '',
        userId: '',
        dateFrom: '',
        dateTo: '',
        sortBy: 'createdAt',
        order: 'desc'
      },

      setOrderFilters: (filters) => {
        set((state) => ({
          orderFilters: {
            ...state.orderFilters,
            ...filters,
            page: filters.page !== undefined ? filters.page : 1 // Reset to page 1 on filter change
          }
        }));
      },

      resetOrderFilters: () => {
        set({
          orderFilters: {
            page: 1,
            limit: 20,
            status: '',
            affiliateId: '',
            userId: '',
            dateFrom: '',
            dateTo: '',
            sortBy: 'createdAt',
            order: 'desc'
          }
        });
      },

      // Product filters
      productFilters: {
        page: 1,
        limit: 20,
        status: '',
        category: '',
        search: ''
      },

      setProductFilters: (filters) => {
        set((state) => ({
          productFilters: {
            ...state.productFilters,
            ...filters,
            page: filters.page !== undefined ? filters.page : 1
          }
        }));
      },

      resetProductFilters: () => {
        set({
          productFilters: {
            page: 1,
            limit: 20,
            status: '',
            category: '',
            search: ''
          }
        });
      },

      // Affiliate filters
      affiliateFilters: {
        page: 1,
        limit: 20,
        status: '',
        search: ''
      },

      setAffiliateFilters: (filters) => {
        set((state) => ({
          affiliateFilters: {
            ...state.affiliateFilters,
            ...filters,
            page: filters.page !== undefined ? filters.page : 1
          }
        }));
      },

      resetAffiliateFilters: () => {
        set({
          affiliateFilters: {
            page: 1,
            limit: 20,
            status: '',
            search: ''
          }
        });
      },

      // Commission filters
      commissionFilters: {
        page: 1,
        limit: 20,
        status: '',
        affiliateId: '',
        dateFrom: '',
        dateTo: ''
      },

      setCommissionFilters: (filters) => {
        set((state) => ({
          commissionFilters: {
            ...state.commissionFilters,
            ...filters,
            page: filters.page !== undefined ? filters.page : 1
          }
        }));
      },

      resetCommissionFilters: () => {
        set({
          commissionFilters: {
            page: 1,
            limit: 20,
            status: '',
            affiliateId: '',
            dateFrom: '',
            dateTo: ''
          }
        });
      },

      // Payout filters
      payoutFilters: {
        page: 1,
        limit: 20,
        status: '',
        affiliateId: '',
        dateFrom: '',
        dateTo: ''
      },

      setPayoutFilters: (filters) => {
        set((state) => ({
          payoutFilters: {
            ...state.payoutFilters,
            ...filters,
            page: filters.page !== undefined ? filters.page : 1
          }
        }));
      },

      resetPayoutFilters: () => {
        set({
          payoutFilters: {
            page: 1,
            limit: 20,
            status: '',
            affiliateId: '',
            dateFrom: '',
            dateTo: ''
          }
        });
      },

      // Revenue analytics filters
      revenueFilters: {
        groupBy: 'day',
        dateFrom: '',
        dateTo: ''
      },

      setRevenueFilters: (filters) => {
        set((state) => ({
          revenueFilters: {
            ...state.revenueFilters,
            ...filters
          }
        }));
      },

      resetRevenueFilters: () => {
        set({
          revenueFilters: {
            groupBy: 'day',
            dateFrom: '',
            dateTo: ''
          }
        });
      },

      /**
       * ================================================================
       * MODAL STATE
       * ================================================================
       */

      modals: {
        orderDetail: { isOpen: false, selectedId: null },
        affiliateDetail: { isOpen: false, selectedId: null },
        commissionDetail: { isOpen: false, selectedId: null },
        payoutDetail: { isOpen: false, selectedId: null }
      },

      openModal: (modalName, selectedId = null) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: { isOpen: true, selectedId }
          }
        }));
      },

      closeModal: (modalName) => {
        set((state) => ({
          modals: {
            ...state.modals,
            [modalName]: { isOpen: false, selectedId: null }
          }
        }));
      },

      closeAllModals: () => {
        set({
          modals: {
            orderDetail: { isOpen: false, selectedId: null },
            affiliateDetail: { isOpen: false, selectedId: null },
            commissionDetail: { isOpen: false, selectedId: null },
            payoutDetail: { isOpen: false, selectedId: null }
          }
        });
      },

      /**
       * ================================================================
       * SELECTION STATE
       * ================================================================
       */

      selectedItems: {
        orders: [],
        affiliates: [],
        commissions: [],
        payouts: []
      },

      toggleItemSelection: (category, itemId) => {
        set((state) => {
          const currentSelection = state.selectedItems[category] || [];
          const isSelected = currentSelection.includes(itemId);

          return {
            selectedItems: {
              ...state.selectedItems,
              [category]: isSelected
                ? currentSelection.filter((id) => id !== itemId)
                : [...currentSelection, itemId]
            }
          };
        });
      },

      selectAllItems: (category, itemIds) => {
        set((state) => ({
          selectedItems: {
            ...state.selectedItems,
            [category]: itemIds
          }
        }));
      },

      clearSelection: (category) => {
        set((state) => ({
          selectedItems: {
            ...state.selectedItems,
            [category]: []
          }
        }));
      },

      /**
       * ================================================================
       * UI PREFERENCES
       * ================================================================
       */

      uiPreferences: {
        sidebarCollapsed: false,
        theme: 'light',
        autoRefresh: true,
        refreshInterval: 30000 // 30 seconds
      },

      toggleSidebar: () => {
        set((state) => ({
          uiPreferences: {
            ...state.uiPreferences,
            sidebarCollapsed: !state.uiPreferences.sidebarCollapsed
          }
        }));
      },

      setTheme: (theme) => {
        set((state) => ({
          uiPreferences: {
            ...state.uiPreferences,
            theme
          }
        }));
      },

      setAutoRefresh: (enabled) => {
        set((state) => ({
          uiPreferences: {
            ...state.uiPreferences,
            autoRefresh: enabled
          }
        }));
      },

      setRefreshInterval: (interval) => {
        set((state) => ({
          uiPreferences: {
            ...state.uiPreferences,
            refreshInterval: interval
          }
        }));
      },

      /**
       * ================================================================
       * GRID/TABLE PREFERENCES
       * ================================================================
       */

      tablePreferences: {
        ordersColumnsVisible: [
          '_id',
          'status',
          'totalAmount',
          'affiliateDetails',
          'createdAt'
        ],
        productsColumnsVisible: ['name', 'category', 'status', 'price', 'createdAt'],
        affiliatesColumnsVisible: [
          'name',
          'email',
          'status',
          'affiliateDetails.totalCommissionsEarned',
          'createdAt'
        ],
        commissionsColumnsVisible: [
          'affiliateId',
          'commissionAmount',
          'status',
          'orderId',
          'createdAt'
        ],
        payoutsColumnsVisible: ['affiliateId', 'amount', 'status', 'createdAt']
      },

      toggleColumnVisibility: (table, columnName) => {
        set((state) => {
          const key = `${table}ColumnsVisible`;
          const currentColumns = state.tablePreferences[key] || [];

          return {
            tablePreferences: {
              ...state.tablePreferences,
              [key]: currentColumns.includes(columnName)
                ? currentColumns.filter((col) => col !== columnName)
                : [...currentColumns, columnName]
            }
          };
        });
      },

      resetTablePreferences: () => {
        set({
          tablePreferences: {
            ordersColumnsVisible: [
              '_id',
              'status',
              'totalAmount',
              'affiliateDetails',
              'createdAt'
            ],
            productsColumnsVisible: ['name', 'category', 'status', 'price', 'createdAt'],
            affiliatesColumnsVisible: [
              'name',
              'email',
              'status',
              'affiliateDetails.totalCommissionsEarned',
              'createdAt'
            ],
            commissionsColumnsVisible: [
              'affiliateId',
              'commissionAmount',
              'status',
              'orderId',
              'createdAt'
            ],
            payoutsColumnsVisible: ['affiliateId', 'amount', 'status', 'createdAt']
          }
        });
      },

      /**
       * ================================================================
       * EXPORT STATE
       * ================================================================
       */

      exportState: {
        isExporting: false,
        format: 'csv',
        selectedFields: []
      },

      setExportState: (state) => {
        set((prev) => ({
          exportState: {
            ...prev.exportState,
            ...state
          }
        }));
      },

      resetExportState: () => {
        set({
          exportState: {
            isExporting: false,
            format: 'csv',
            selectedFields: []
          }
        });
      }
    }),
    {
      name: STORAGE_KEY,
      partialize: (state) => ({
        orderFilters: state.orderFilters,
        productFilters: state.productFilters,
        affiliateFilters: state.affiliateFilters,
        commissionFilters: state.commissionFilters,
        payoutFilters: state.payoutFilters,
        revenueFilters: state.revenueFilters,
        uiPreferences: state.uiPreferences,
        tablePreferences: state.tablePreferences
      })
    }
  )
);

/**
 * Selector hooks for component usage
 * Prevents unnecessary re-renders by selecting specific state slices
 */

export const useOrderFilters = () => useAdminStore((state) => state.orderFilters);
export const useSetOrderFilters = () => useAdminStore((state) => state.setOrderFilters);

export const useProductFilters = () => useAdminStore((state) => state.productFilters);
export const useSetProductFilters = () => useAdminStore((state) => state.setProductFilters);

export const useAffiliateFilters = () => useAdminStore((state) => state.affiliateFilters);
export const useSetAffiliateFilters = () => useAdminStore((state) => state.setAffiliateFilters);

export const useCommissionFilters = () => useAdminStore((state) => state.commissionFilters);
export const useSetCommissionFilters = () =>
  useAdminStore((state) => state.setCommissionFilters);

export const usePayoutFilters = () => useAdminStore((state) => state.payoutFilters);
export const useSetPayoutFilters = () => useAdminStore((state) => state.setPayoutFilters);

export const useRevenueFilters = () => useAdminStore((state) => state.revenueFilters);
export const useSetRevenueFilters = () => useAdminStore((state) => state.setRevenueFilters);

export const useModals = () => useAdminStore((state) => state.modals);
export const useOpenModal = () => useAdminStore((state) => state.openModal);
export const useCloseModal = () => useAdminStore((state) => state.closeModal);

export const useSelectedItems = () => useAdminStore((state) => state.selectedItems);
export const useToggleItemSelection = () =>
  useAdminStore((state) => state.toggleItemSelection);
export const useClearSelection = () => useAdminStore((state) => state.clearSelection);

export const useUIPreferences = () => useAdminStore((state) => state.uiPreferences);
export const useToggleSidebar = () => useAdminStore((state) => state.toggleSidebar);
export const useSetTheme = () => useAdminStore((state) => state.setTheme);

export const useTablePreferences = () => useAdminStore((state) => state.tablePreferences);
export const useToggleColumnVisibility = () =>
  useAdminStore((state) => state.toggleColumnVisibility);
