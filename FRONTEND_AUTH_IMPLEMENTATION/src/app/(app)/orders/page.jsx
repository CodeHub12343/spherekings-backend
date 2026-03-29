/**
 * Orders Page
 * Customer orders listing page
 */

'use client';

import { useEffect } from 'react';
import styled from 'styled-components';
import { useOrders } from '@/hooks/useOrders';
import OrdersList from '@/components/orders/OrdersList';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const ErrorAlert = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  color: #991b1b;

  button {
    margin-top: 12px;
    padding: 8px 16px;
    background: #991b1b;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;

    &:hover {
      background: #7f1d1d;
    }
  }
`;

export default function OrdersPage() {
  const {
    orders,
    pagination,
    filters,
    isLoading,
    fetchOrders,
    setFilters,
    clearFilters,
    setPagination,
  } = useOrders();

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchOrders({ page: 1 });
  };

  const handlePaginationChange = (page, limit) => {
    setPagination(page, limit);
    fetchOrders({ page, limit });
  };

  const handleClearFilters = () => {
    clearFilters();
    fetchOrders({ page: 1 });
  };

  return (
    <PageContainer>
      <OrdersList
        orders={orders}
        pagination={pagination}
        filters={filters}
        isLoading={isLoading}
        onFilterChange={handleFilterChange}
        onPaginationChange={handlePaginationChange}
      />
    </PageContainer>
  );
}
