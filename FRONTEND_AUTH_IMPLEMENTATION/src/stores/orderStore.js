/**
 * Order Store
 * Zustand store for managing order state
 * 
 * Manages:
 * - Orders list with pagination
 * - Order details
 * - Filters and search
 * - Loading states
 * - Error handling
 * - Admin and affiliate specific data
 */

import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';
import orderService from '@/api/services/orderService';

const initialState = {
  // Customer orders
  orders: [],
  selectedOrder: null,
  orderSummary: null,

  // Affiliate data
  affiliateOrders: [],
  affiliateStats: null,

  // Admin data
  adminOrders: [],
  adminStats: null,

  // Pagination
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 0,
    totalPages: 0,
    hasMore: false,
  },

  // Filters
  filters: {
    status: null,
    paymentStatus: null,
    dateFrom: null,
    dateTo: null,
    minAmount: null,
    maxAmount: null,
    sortBy: 'createdAt',
    sortOrder: 'desc',
  },

  // Search
  searchQuery: '',
  searchResults: [],

  // Loading and error states
  isLoading: false,
  isLoadingDetails: false,
  isSearching: false,
  isUpdating: false,
  error: null,
  errorDetails: null,
};

export const useOrderStore = create(
  devtools(
    (set, get) => ({
      // Initial state
      ...initialState,

      // =============== Customer Actions ===============

      /**
       * Fetch user's orders
       */
      fetchOrders: async (options = {}) => {
        set(() => ({
          isLoading: true,
          error: null,
        }));

        try {
          const { orders, pagination } = await orderService.getUserOrders({
            page: options.page || get().pagination.currentPage,
            limit: options.limit || get().pagination.itemsPerPage,
            ...get().filters,
          });

          set((state) => ({
            orders,
            pagination,
            isLoading: false,
          }));

          return { orders, pagination };
        } catch (err) {
          console.error('Error fetching orders:', err.message);
          set((state) => ({
            isLoading: false,
            error: err.message,
            errorDetails: err.details,
          }));
          throw err;
        }
      },

      /**
       * Fetch order details
       */
      fetchOrderDetails: async (orderId) => {
        set(() => ({
          isLoadingDetails: true,
          error: null,
        }));

        try {
          const order = await orderService.getOrderById(orderId);

          set((state) => {
            // Only update if order actually changed
            const prev = state.selectedOrder;
            const isSame = prev && order && prev._id === order._id && JSON.stringify(prev) === JSON.stringify(order);
            return {
              selectedOrder: isSame ? state.selectedOrder : order,
              isLoadingDetails: false,
            };
          });

          return order;
        } catch (err) {
          set((state) => ({
            isLoadingDetails: false,
            error: err.message,
          }));
          throw err;
        }
      },

      /**
       * Fetch order summary
       */
      fetchOrderSummary: async () => {
        try {
          const summary = await orderService.getOrderSummary();
          set((state) => ({
            orderSummary: summary,
          }));
          return summary;
        } catch (err) {
          console.error('Error fetching summary:', err.message);
          throw err;
        }
      },

      /**
       * Search orders
       */
      searchOrders: async (criteria = {}) => {
        set(() => ({
          isSearching: true,
          error: null,
        }));

        try {
          const { orders, pagination } = await orderService.searchOrders(criteria);

          set((state) => ({
            searchResults: orders,
            pagination,
            searchQuery: criteria.orderNumber || '',
            isSearching: false,
          }));

          return { orders, pagination };
        } catch (err) {
          set((state) => ({
            isSearching: false,
            error: err.message,
          }));
          throw err;
        }
      },

      /**
       * Update filters
       */
      setFilters: (newFilters) => {
        set((state) => ({
          filters: {
            ...state.filters,
            ...newFilters,
          },
          pagination: {
            ...state.pagination,
            currentPage: 1,
          },
        }));
      },

      /**
       * Clear filters
       */
      clearFilters: () => {
        set((state) => ({
          filters: initialState.filters,
          pagination: initialState.pagination,
        }));
      },

      /**
       * Set pagination
       */
      setPagination: (page, limit) => {
        set((state) => ({
          pagination: {
            ...state.pagination,
            currentPage: page,
            itemsPerPage: limit,
          },
        }));
      },

      // =============== Affiliate Actions ===============

      /**
       * Fetch affiliate orders
       */
      fetchAffiliateOrders: async (options = {}) => {
        set(() => ({
          isLoading: true,
          error: null,
        }));

        try {
          const { orders, pagination, statistics } =
            await orderService.getAffiliateOrders({
              page: options.page || 1,
              limit: options.limit || 20,
            });

          set((state) => ({
            affiliateOrders: orders,
            affiliateStats: statistics,
            pagination,
            isLoading: false,
          }));

          return { orders, pagination, statistics };
        } catch (err) {
          set((state) => ({
            isLoading: false,
            error: err.message,
          }));
          throw err;
        }
      },

      // =============== Admin Actions ===============

      /**
       * Fetch all orders (admin)
       */
      fetchAdminOrders: async (options = {}) => {
        set(() => ({
          isLoading: true,
          error: null,
        }));

        try {
          const { orders, pagination, statistics } =
            await orderService.getAdminOrders({
              page: options.page || 1,
              limit: options.limit || 20,
              ...options.filters,
            });

          set((state) => ({
            adminOrders: orders,
            adminStats: statistics,
            pagination,
            isLoading: false,
          }));

          return { orders, pagination, statistics };
        } catch (err) {
          set((state) => ({
            isLoading: false,
            error: err.message,
          }));
          throw err;
        }
      },

      /**
       * Update order status (admin)
       */
      updateOrderStatus: async (orderId, status, reason = '') => {
        set(() => ({
          isUpdating: true,
          error: null,
        }));

        try {
          const updatedOrder = await orderService.updateOrderStatus(
            orderId,
            status,
            reason
          );

          // Update in stores
          set((state) => ({
            adminOrders: state.adminOrders.map((order) =>
              order._id === orderId ? updatedOrder : order
            ),
            selectedOrder:
              state.selectedOrder?._id === orderId
                ? updatedOrder
                : state.selectedOrder,
            isUpdating: false,
          }));

          return updatedOrder;
        } catch (err) {
          set((state) => ({
            isUpdating: false,
            error: err.message,
          }));
          throw err;
        }
      },

      // =============== Utility Actions ===============

      /**
       * Clear error
       */
      clearError: () => {
        set((state) => ({
          error: null,
          errorDetails: null,
        }));
      },

      /**
       * Reset store
       */
      reset: () => {
        set(initialState);
      },
    }),
    { name: 'order-store' }
  )
);

// =============== Selectors ===============

export const useOrdersList = () =>
  useOrderStore((state) => state.orders);

export const useSelectedOrder = () =>
  useOrderStore((state) => state.selectedOrder);

export const useOrderSummary = () =>
  useOrderStore((state) => state.orderSummary);

export const useOrderPagination = () =>
  useOrderStore(
    useShallow((state) => state.pagination)
  );

export const useOrderFilters = () =>
  useOrderStore(
    useShallow((state) => state.filters)
  );

export const useOrderLoading = () =>
  useOrderStore(
    useShallow((state) => ({
      isLoading: state.isLoading,
      isLoadingDetails: state.isLoadingDetails,
      isSearching: state.isSearching,
      isUpdating: state.isUpdating,
    }))
  );

export const useOrderError = () =>
  useOrderStore(
    useShallow((state) => ({
      error: state.error,
      errorDetails: state.errorDetails,
    }))
  );

export const useAffiliateOrders = () =>
  useOrderStore(
    useShallow((state) => ({
      orders: state.affiliateOrders,
      statistics: state.affiliateStats,
    }))
  );

export const useAdminOrders = () =>
  useOrderStore(
    useShallow((state) => ({
      orders: state.adminOrders,
      statistics: state.adminStats,
    }))
  );

export default useOrderStore;
