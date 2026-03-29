/**
 * Orders List Component
 * Displays list of orders with pagination and filtering
 */

'use client';

import styled from 'styled-components';
import OrderCard from './OrderCard';
import { OrderStatusBadge } from './OrderStatusBadge';

const Container = styled.div`
  width: 100%;
`;

const Header = styled.div`
  margin-bottom: 24px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  align-items: center;
`;

const FilterButton = styled.button`
  padding: 8px 16px;
  border: 1px solid #d1d5db;
  background: ${(props) => (props.$active ? '#2563eb' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#374151')};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.$active ? '#1d4ed8' : '#f3f4f6')};
  }
`;

const ClearButton = styled.button`
  padding: 8px 16px;
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px 24px;
  background: #f9fafb;
  border-radius: 8px;

  h3 {
    margin: 0 0 8px 0;
    font-size: 1.125rem;
    font-weight: 600;
    color: #111827;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const LoadingState = styled.div`
  display: grid;
  gap: 16px;
`;

const LoadingCard = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  background: ${(props) => (props.$active ? '#2563eb' : 'white')};
  color: ${(props) => (props.$active ? 'white' : '#374151')};
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? '#1d4ed8' : '#f3f4f6')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const PageInfo = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
`;

const OrdersListStyled = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const orderStatusOptions = [
  'pending',
  'processing',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
];

/**
 * Orders List Component
 */
export function OrdersList({
  orders = [],
  pagination = {},
  filters = {},
  isLoading = false,
  onFilterChange,
  onPaginationChange,
}) {
  const {
    currentPage = 1,
    itemsPerPage = 10,
    totalItems = 0,
    totalPages = 1,
    hasMore = false,
  } = pagination;

  const handleStatusFilter = (status) => {
    onFilterChange?.({
      ...filters,
      status: filters.status === status ? null : status,
    });
  };

  const handleClearFilters = () => {
    onFilterChange?.({
      status: null,
      paymentStatus: null,
    });
  };

  const handlePaginationChange = (page) => {
    onPaginationChange?.(page, itemsPerPage);
  };

  const goToNextPage = () => {
    if (hasMore) {
      handlePaginationChange(currentPage + 1);
    }
  };

  const goToPrevPage = () => {
    if (currentPage > 1) {
      handlePaginationChange(currentPage - 1);
    }
  };

  return (
    <Container>
      <Header>
        <h1>Orders</h1>
        <p>Manage and track your orders</p>
      </Header>

      <FilterBar>
        <span style={{ fontSize: '0.875rem', color: '#6b7280' }}>Filter:</span>
        {orderStatusOptions.map((status) => (
          <FilterButton
            key={status}
            $active={filters.status === status}
            onClick={() => handleStatusFilter(status)}
          >
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </FilterButton>
        ))}
        {filters.status && (
          <ClearButton onClick={handleClearFilters}>Clear Filters</ClearButton>
        )}
      </FilterBar>

      {isLoading ? (
        <LoadingState>
          {[...Array(3)].map((_, i) => (
            <LoadingCard key={i} style={{ height: '200px' }} />
          ))}
        </LoadingState>
      ) : orders && orders.length > 0 ? (
        <>
          <OrdersListStyled>
            {orders.map((order) => (
              <OrderCard key={order._id} order={order} showActions={true} />
            ))}
          </OrdersListStyled>

          {totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton onClick={goToPrevPage} disabled={currentPage === 1}>
                Previous
              </PaginationButton>

              {[...Array(Math.min(totalPages, 5))].map((_, index) => {
                let pageNum = index + 1;
                if (totalPages > 5 && currentPage > 3) {
                  pageNum = currentPage - 2 + index;
                }
                if (pageNum > totalPages) return null;

                return (
                  <PaginationButton
                    key={pageNum}
                    $active={pageNum === currentPage}
                    onClick={() => handlePaginationChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}

              <PaginationButton onClick={goToNextPage} disabled={!hasMore}>
                Next
              </PaginationButton>

              <PageInfo>
                Page {currentPage} of {totalPages}
              </PageInfo>
            </PaginationContainer>
          )}
        </>
      ) : (
        <EmptyState>
          <h3>No Orders Found</h3>
          <p>
            {filters.status
              ? 'No orders found with the current filter. Try adjusting your filters.'
              : "You haven't placed any orders yet. Start shopping to create your first order!"}
          </p>
        </EmptyState>
      )}
    </Container>
  );
}

export default OrdersList;
