'use client';

/**
 * Admin Orders Dashboard Page
 * Complete order management interface for admins
 */

import styled from 'styled-components';
import { useEffect, useState, useRef } from 'react';
import { useAdminOrdersHook, useOrderStatusUpdate } from '@/hooks/useOrders';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge';
import Link from 'next/link';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    padding: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    word-break: break-word;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }

  @media (max-width: 640px) {
    margin-bottom: 20px;

    h1 {
      font-size: 1.5rem;
      margin-bottom: 4px;
    }
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;

    h1 {
      font-size: 1.25rem;
    }
  }
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }

  h3 {
    margin: 0 0 8px 0;
    font-size: 0.875rem;
    font-weight: 500;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .value {
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
    margin-bottom: 4px;
    word-break: break-word;
  }

  .detail {
    font-size: 0.75rem;
    color: #6b7280;
  }

  @media (max-width: 640px) {
    padding: 16px;
    min-height: auto;

    h3 {
      font-size: 0.75rem;
    }

    .value {
      font-size: 1.5rem;
    }

    .detail {
      font-size: 0.7rem;
    }
  }

  @media (max-width: 480px) {
    padding: 12px;

    h3 {
      font-size: 0.7rem;
      margin-bottom: 6px;
    }

    .value {
      font-size: 1.25rem;
      margin-bottom: 2px;
    }

    .detail {
      font-size: 0.65rem;
    }
  }
`;

const FilterSection = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    padding: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
    margin-bottom: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;

  label {
    font-size: 0.875rem;
    font-weight: 500;
    color: #374151;
  }

  select,
  input {
    padding: 10px 12px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    font-size: 0.875rem;
    color: #111827;
    width: 100%;
    box-sizing: border-box;
    min-height: 40px;

    &:focus {
      outline: none;
      border-color: #2563eb;
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
    }
  }

  @media (max-width: 480px) {
    label {
      font-size: 0.8rem;
    }

    select,
    input {
      font-size: 0.8rem;
      padding: 10px;
      min-height: 44px;
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  @media (max-width: 480px) {
    margin-top: 10px;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    min-height: 44px;
    font-size: 0.8rem;
  }
`;

const SearchButton = styled(Button)`
  background: #2563eb;
  color: white;

  &:hover:not(:disabled) {
    background: #1d4ed8;
  }
`;

const ClearButton = styled(Button)`
  background: #f3f4f6;
  color: #374151;
  border: 1px solid #d1d5db;

  &:hover:not(:disabled) {
    background: #e5e7eb;
  }
`;

const OrderTableContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow-x: auto;
  margin-bottom: 24px;
  -webkit-overflow-scrolling: touch;

  @media (max-width: 640px) {
    overflow-x: visible;
    border: none;
    background: transparent;
    margin-bottom: 16px;
  }
`;

const OrderTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  display: table;

  @media (max-width: 640px) {
    display: grid;
    grid-template-columns: 1fr;
    gap: 12px;
    width: auto;
  }

  thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;
    display: table-header-group;

    @media (max-width: 640px) {
      display: none;
    }

    th {
      padding: 12px;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
  }

  tbody {
    display: table-row-group;

    @media (max-width: 640px) {
      display: contents;
    }

    tr {
      border-bottom: 1px solid #e5e7eb;
      display: table-row;

      @media (max-width: 640px) {
        background: white;
        border: 1px solid #e5e7eb;
        border-radius: 8px;
        padding: 16px;
        display: grid;
        grid-template-columns: 1fr;
        gap: 12px;
        margin: 0;
      }

      &:hover {
        background: #f9fafb;

        @media (max-width: 640px) {
          background: white;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }
      }

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 12px;
      font-size: 0.875rem;
      color: #111827;
      display: table-cell;

      @media (max-width: 640px) {
        padding: 0;
        display: grid;
        grid-template-columns: 120px 1fr;
        align-items: center;
        gap: 8px;

        &:before {
          content: attr(data-label);
          font-weight: 600;
          color: #6b7280;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
      }

      @media (max-width: 480px) {
        grid-template-columns: 100px 1fr;
        font-size: 0.8rem;

        &:before {
          font-size: 0.7rem;
        }
      }
    }
  }

  @media (max-width: 640px) {
    min-width: auto;
  }
`;

const OrderNumberLink = styled(Link)`
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;
  word-break: break-all;

  &:hover {
    text-decoration: underline;
  }

  @media (max-width: 480px) {
    font-size: 0.8rem;
  }
`;

const StatusSelect = styled.select`
  padding: 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  font-size: 0.75rem;
  color: #111827;
  cursor: pointer;
  min-height: 40px;
  width: 100%;

  &:focus {
    outline: none;
    border-color: #2563eb;
  }

  @media (max-width: 640px) {
    max-width: 100%;
  }

  @media (max-width: 480px) {
    font-size: 0.7rem;
    padding: 6px;
  }
`;

const LoadingState = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 48px 24px;
  text-align: center;
  color: #6b7280;
  font-size: 0.875rem;

  @media (max-width: 640px) {
    padding: 32px 16px;
    border-radius: 6px;
  }

  @media (max-width: 480px) {
    padding: 24px 12px;
    font-size: 0.8rem;
  }
`;

const EmptyState = styled(LoadingState)``;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 8px;
  margin-top: 24px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    margin-top: 16px;
    gap: 6px;
  }

  @media (max-width: 480px) {
    margin-top: 12px;
    gap: 4px;
  }
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
  min-height: 36px;
  min-width: 36px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    background: ${(props) => (props.$active ? '#1d4ed8' : '#f3f4f6')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    padding: 8px 10px;
    font-size: 0.8rem;
    min-height: 40px;
    min-width: 40px;
  }

  @media (max-width: 480px) {
    padding: 8px;
    font-size: 0.75rem;
    min-height: 40px;
    min-width: 40px;
  }
`;

const orderStatuses = [
  'pending',
  'processing',
  'confirmed',
  'shipped',
  'delivered',
  'cancelled',
  'refunded',
  'returned',
  'complete',
];

const paymentStatuses = ['paid', 'pending', 'failed', 'refunded'];

export default function AdminOrdersPage() {
  const {
    orders,
    statistics,
    pagination,
    filters,
    isLoading,
    error,
    fetchAdminOrders,
    setFilters,
    setPagination,
  } = useAdminOrdersHook();

  const { updateStatus, isUpdating } = useOrderStatusUpdate();

  const [localFilters, setLocalFilters] = useState({
    status: '',
    paymentStatus: '',
    search: '',
  });

  // Track if initial fetch has been done to prevent infinite loops
  const initialFetchDone = useRef(false);

  // Only fetch orders once on component mount
  useEffect(() => {
    if (!initialFetchDone.current) {
      console.log('📨 Fetching initial orders list...');
      initialFetchDone.current = true;
      fetchAdminOrders({ page: 1, limit: 20 });
    }
  }, []); // Empty dependency array - only run once on mount

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setLocalFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleApplyFilters = () => {
    const newFilters = {};
    if (localFilters.status) newFilters.status = localFilters.status;
    if (localFilters.paymentStatus) newFilters.paymentStatus = localFilters.paymentStatus;
    if (localFilters.search) newFilters.search = localFilters.search;

    setFilters(newFilters);
    fetchAdminOrders({ page: 1, limit: 20, filters: newFilters });
  };

  const handleClearFilters = () => {
    setLocalFilters({ status: '', paymentStatus: '', search: '' });
    setFilters({});
    fetchAdminOrders({ page: 1, limit: 20 });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      // Refresh orders list
      fetchAdminOrders({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        filters,
      });
    } catch (err) {
      console.error('Error updating order status:', err);
    }
  };

  const handlePageChange = (page) => {
    setPagination(page, 20);
    fetchAdminOrders({ page, limit: 20, filters });
  };

  return (
    <PageContainer>
      <Header>
        <h1>Orders Management</h1>
        <p>Manage all orders in the system</p>
      </Header>

      {/* Statistics */}
      {statistics && (
        <StatsGrid>
          <StatCard>
            <h3>Total Orders</h3>
            <div className="value">{statistics.ordersCount || 0}</div>
            <div className="detail">All system orders</div>
          </StatCard>

          <StatCard>
            <h3>Total Revenue</h3>
            <div className="value">{formatPrice(statistics.totalAmount)}</div>
            <div className="detail">From all orders</div>
          </StatCard>

          <StatCard>
            <h3>Paid Orders</h3>
            <div className="value">{formatPrice(statistics.paidAmount)}</div>
            <div className="detail">Successfully completed</div>
          </StatCard>

          <StatCard>
            <h3>Average Order</h3>
            <div className="value">{formatPrice(statistics.averageOrder)}</div>
            <div className="detail">Average order value</div>
          </StatCard>
        </StatsGrid>
      )}

      {/* Filters */}
      <FilterSection>
        <h3 style={{ margin: '0 0 16px 0', fontSize: '1rem', color: '#111827' }}>
          Filter Orders
        </h3>
        <FilterGrid>
          <FilterGroup>
            <label>Order Status</label>
            <select
              name="status"
              value={localFilters.status}
              onChange={handleFilterChange}
            >
              <option value="">All Statuses</option>
              {orderStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup>
            <label>Payment Status</label>
            <select
              name="paymentStatus"
              value={localFilters.paymentStatus}
              onChange={handleFilterChange}
            >
              <option value="">All Payment Statuses</option>
              {paymentStatuses.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </FilterGroup>

          <FilterGroup>
            <label>Search (Order#, Customer ID)</label>
            <input
              type="text"
              name="search"
              placeholder="ORD-123456 or user ID"
              value={localFilters.search}
              onChange={handleFilterChange}
            />
          </FilterGroup>
        </FilterGrid>

        <ButtonGroup>
          <SearchButton onClick={handleApplyFilters}>Apply Filters</SearchButton>
          <ClearButton onClick={handleClearFilters}>Clear Filters</ClearButton>
        </ButtonGroup>
      </FilterSection>

      {/* Orders Table */}
      {isLoading ? (
        <LoadingState>Loading orders...</LoadingState>
      ) : error ? (
        <EmptyState>{error}</EmptyState>
      ) : orders && Array.isArray(orders) && orders.length > 0 ? (
        <>
          <OrderTableContainer>
            <OrderTable>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Order Status</th>
                  <th>Payment</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td data-label="Order">
                      <OrderNumberLink href={`/admin/orders/${order._id}`}>
                        {order.orderNumber}
                      </OrderNumberLink>
                    </td>
                    <td data-label="Date">{formatDate(order.createdAt)}</td>
                    <td data-label="Customer" style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                      {order.userId?.substring(0, 8)}...
                    </td>
                    <td data-label="Total">{formatPrice(order.total)}</td>
                    <td data-label="Status">
                      <StatusSelect
                        value={order.orderStatus}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                        disabled={isUpdating}
                      >
                        {orderStatuses.map((status) => (
                          <option key={status} value={status}>
                            {status.charAt(0).toUpperCase() + status.slice(1)}
                          </option>
                        ))}
                      </StatusSelect>
                    </td>
                    <td data-label="Payment">
                      <PaymentStatusBadge status={order.paymentStatus} />
                    </td>
                    <td data-label="Actions">
                      <OrderNumberLink href={`/admin/orders/${order._id}`}>
                        View
                      </OrderNumberLink>
                    </td>
                  </tr>
                ))}
              </tbody>
            </OrderTable>
          </OrderTableContainer>

          {pagination?.totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </PaginationButton>

              {[...Array(Math.min(pagination.totalPages, 5))].map((_, index) => {
                let pageNum = index + 1;
                if (pagination.totalPages > 5 && pagination.currentPage > 3) {
                  pageNum = pagination.currentPage - 2 + index;
                }
                if (pageNum > pagination.totalPages) return null;

                return (
                  <PaginationButton
                    key={pageNum}
                    $active={pageNum === pagination.currentPage}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </PaginationButton>
                );
              })}

              <PaginationButton
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasMore}
              >
                Next
              </PaginationButton>

              <span style={{ color: '#6b7280', fontSize: '0.875rem' }}>
                Page {pagination.currentPage} of {pagination.totalPages}
              </span>
            </PaginationContainer>
          )}
        </>
      ) : (
        <EmptyState>
          <h3>No Orders Found</h3>
          <p>No orders match your current filters</p>
        </EmptyState>
      )}
    </PageContainer>
  );
}
