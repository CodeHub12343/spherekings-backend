'use client';

/**
 * Order Hooks
 * Custom React hooks for order management
 * 
 * Includes:
 * - useOrders() - Main hook for customer orders
 * - useOrderDetails() - Order details hook
 * - useOrderSearch() - Order search hook
 * - useAffiliateOrdersHook() - Affiliate orders
 * - useAdminOrdersHook() - Admin orders management
 * - useOrderStatus() - Order status updates
 */

import { useCallback, useEffect, useRef } from 'react';
import useOrderStore, {
  useOrdersList,
  useSelectedOrder,
  useOrderSummary,
  useOrderPagination,
  useOrderFilters,
  useOrderLoading,
  useOrderError,
  useAffiliateOrders,
  useAdminOrders,
} from '@/stores/orderStore';

// =============== Main Hooks ===============

/**
 * Main hook for customer orders
 * Gets orders list, pagination, filters, and fetch function
 */
export function useOrders() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const orders = useOrdersList();
  const pagination = useOrderPagination();
  const filters = useOrderFilters();
  const { isLoading } = useOrderLoading();

  const fetchOrders = useCallback(
    async (options = {}) => {
      return store.fetchOrders(options);
    },
    [] // Zustand store is a singleton - no dependencies needed
  );

  const setFilters = useCallback(
    (newFilters) => {
      store.setFilters(newFilters);
    },
    [] // Zustand store is a singleton - no dependencies needed
  );

  const clearFilters = useCallback(() => {
    store.clearFilters();
  }, []); // Zustand store is a singleton - no dependencies needed

  const setPagination = useCallback(
    (page, limit) => {
      store.setPagination(page, limit);
    },
    [] // Zustand store is a singleton - no dependencies needed
  );

  return {
    orders,
    pagination,
    filters,
    isLoading,
    fetchOrders,
    setFilters,
    clearFilters,
    setPagination,
  };
}

/**
 * Hook for fetching order details
 */
export function useOrderDetails(orderId) {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const selectedOrder = useSelectedOrder();
  const { isLoadingDetails } = useOrderLoading();
  const { error } = useOrderError();

  // Auto-fetch on mount or when orderId changes
  useEffect(() => {
    if (!orderId) return;
    store.fetchOrderDetails(orderId);
  }, [orderId]);

  return {
    order: selectedOrder,
    isLoading: isLoadingDetails,
    error,
    refetch: useCallback(() => {
      if (orderId) {
        return store.fetchOrderDetails(orderId);
      }
    }, [orderId]), // Only depend on orderId
  };
}

/**
 * Hook for order summary
 */
export function useOrderSummaryHook() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const summary = useOrderSummary();
  const { isLoading } = useOrderLoading();

  const fetchSummary = useCallback(async () => {
    return store.fetchOrderSummary();
  }, [store]); // store from useRef is stable

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]); // fetchSummary is stable due to empty deps above

  return {
    summary,
    isLoading,
    refetch: fetchSummary,
  };
}

/**
 * Hook for searching orders
 */
export function useOrderSearch() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const { isSearching } = useOrderLoading();
  const { error } = useOrderError();

  const search = useCallback(
    async (criteria = {}) => {
      return store.searchOrders(criteria);
    },
    [store] // store from useRef is stable
  );

  return {
    search,
    isSearching,
    error,
  };
}

// =============== Affiliate Hooks ===============

/**
 * Hook for affiliate orders
 */
export function useAffiliateOrdersHook() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const { orders, statistics } = useAffiliateOrders();
  const pagination = useOrderPagination();
  const { isLoading } = useOrderLoading();
  const { error } = useOrderError();

  const fetchAffiliateOrders = useCallback(
    async (options = {}) => {
      return store.fetchAffiliateOrders(options);
    },
    [store] // store from useRef is stable
  );

  const setPagination = useCallback(
    (page, limit) => {
      store.setPagination(page, limit);
    },
    [store] // store from useRef is stable
  );

  return {
    orders,
    statistics,
    pagination,
    isLoading,
    error,
    fetchAffiliateOrders,
    setPagination,
  };
}

// =============== Admin Hooks ===============

/**
 * Hook for admin orders management
 */
export function useAdminOrdersHook() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const { orders, statistics } = useAdminOrders();
  const pagination = useOrderPagination();
  const filters = useOrderFilters();
  const { isLoading } = useOrderLoading();
  const { error } = useOrderError();

  const fetchAdminOrders = useCallback(
    async (options = {}) => {
      return store.fetchAdminOrders(options);
    },
    [store] // store from useRef is stable
  );

  const setFilters = useCallback(
    (newFilters) => {
      store.setFilters(newFilters);
    },
    [store] // store from useRef is stable
  );

  const setPagination = useCallback(
    (page, limit) => {
      store.setPagination(page, limit);
    },
    [store] // store from useRef is stable
  );

  return {
    orders,
    statistics,
    pagination,
    filters,
    isLoading,
    error,
    fetchAdminOrders,
    setFilters,
    setPagination,
  };
}

/**
 * Hook for updating order status (admin)
 */
export function useOrderStatusUpdate() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const { isUpdating } = useOrderLoading();
  const { error } = useOrderError();

  const updateStatus = useCallback(
    async (orderId, status, reason = '') => {
      return store.updateOrderStatus(orderId, status, reason);
    },
    [store] // store from useRef is stable
  );

  return {
    updateStatus,
    isUpdating,
    error,
  };
}

// =============== Utility Hooks ===============

/**
 * Hook for page-level orders data fetching
 */
export function useOrdersPage() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const orders = useOrdersList();
  const pagination = useOrderPagination();
  const { isLoading } = useOrderLoading();
  const { error } = useOrderError();

  useEffect(() => {
    store.fetchOrders();
  }, [store]); // store from useRef is stable, only run on mount

  const refetch = useCallback(() => {
    return store.fetchOrders();
  }, [store]); // store from useRef is stable

  return {
    orders,
    pagination,
    isLoading,
    error,
    refetch,
  };
}

/**
 * Hook for order details page
 */
export function useOrderDetailsPage(orderId) {
  return useOrderDetails(orderId);
}

/**
 * Hook for getting filters
 */
export function useOrderFilterState() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const filters = useOrderFilters();

  const updateFilter = useCallback(
    (filterName, value) => {
      store.setFilters({
        [filterName]: value,
      });
    },
    [store] // store from useRef is stable
  );

  const updateMultipleFilters = useCallback(
    (newFilters) => {
      store.setFilters(newFilters);
    },
    [store] // store from useRef is stable
  );

  const reset = useCallback(() => {
    store.clearFilters();
  }, [store]); // store from useRef is stable

  return {
    filters,
    updateFilter,
    updateMultipleFilters,
    reset,
  };
}

/**
 * Hook for pagination
 */
export function useOrderPaginationState() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const pagination = useOrderPagination();

  const goToPage = useCallback(
    (page) => {
      store.setPagination(page, pagination.itemsPerPage);
    },
    [store, pagination.itemsPerPage] // pagination.itemsPerPage is stable primitive
  );

  const setPageSize = useCallback(
    (limit) => {
      store.setPagination(1, limit);
    },
    [store] // store from useRef is stable
  );

  const nextPage = useCallback(() => {
    if (pagination.hasMore) {
      store.setPagination(pagination.currentPage + 1, pagination.itemsPerPage);
    }
  }, [store, pagination.currentPage, pagination.itemsPerPage, pagination.hasMore]); // all primitives

  const prevPage = useCallback(() => {
    if (pagination.currentPage > 1) {
      store.setPagination(pagination.currentPage - 1, pagination.itemsPerPage);
    }
  }, [store, pagination.currentPage, pagination.itemsPerPage]); // all primitives

  return {
    ...pagination,
    goToPage,
    setPageSize,
    nextPage,
    prevPage,
  };
}

/**
 * Hook for loading states
 */
export function useOrdersLoading() {
  return useOrderLoading();
}

/**
 * Hook for error handling
 */
export function useOrdersError() {
  const storeRef = useRef(null);
  if (!storeRef.current) {
    storeRef.current = useOrderStore.getState();
  }
  const store = storeRef.current;
  
  const { error, errorDetails } = useOrderError();

  const clearError = useCallback(() => {
    store.clearError();
  }, [store]); // store from useRef is stable

  return {
    error,
    errorDetails,
    clearError,
  };
}

export default useOrders;
