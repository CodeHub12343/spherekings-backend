'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useOrders } from '@/hooks/useOrders';
import { formatDate, formatCurrency } from '@/utils/formatting';

// ==================== STYLED COMPONENTS ====================

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 32px;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeaderContent = styled.div`
  flex: 1;

  h1 {
    font-size: 32px;
    font-weight: 700;
    color: #0f172a;
    margin-bottom: 8px;

    @media (max-width: 640px) {
      font-size: 24px;
    }
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
  }
`;

const FilterSection = styled.div`
  display: flex;
  gap: 12px;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const Select = styled.select`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  color: #0f172a;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: #d1d5db;
  }

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const OrdersGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 32px;

  @media (min-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const OrderCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  transition: all 0.2s ease;
  cursor: pointer;

  &:hover {
    border-color: #d1d5db;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  }

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const OrderCardHeader = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const OrderInfoBlock = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const Label = styled.span`
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Value = styled.span`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const OrderCardFooter = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const StatusBadgesSection = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;

  background-color: ${props => {
    switch (props.status) {
      case 'pending':
      case 'processing':
        return '#fef3c7';
      case 'confirmed':
      case 'shipped':
        return '#dbeafe';
      case 'delivered':
        return '#d1fae5';
      case 'cancelled':
      case 'refunded':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'pending':
      case 'processing':
        return '#92400e';
      case 'confirmed':
      case 'shipped':
        return '#0c4a6e';
      case 'delivered':
        return '#065f46';
      case 'cancelled':
      case 'refunded':
        return '#7f1d1d';
      default:
        return '#374151';
    }
  }};
`;

const PaymentBadge = styled(StatusBadge)`
  ${props => {
    switch (props.paymentStatus) {
      case 'paid':
        return `
          background-color: #d1fae5;
          color: #065f46;
        `;
      case 'pending':
        return `
          background-color: #fef3c7;
          color: #92400e;
        `;
      case 'failed':
      case 'refunded':
        return `
          background-color: #fee2e2;
          color: #7f1d1d;
        `;
      default:
        return `
          background-color: #f3f4f6;
          color: #374151;
        `;
    }
  }};
`;

const ViewButton = styled.button`
  padding: 10px 16px;
  background-color: #5b4dff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #4c3fcc;
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  background: white;
  border: 1px dashed #e5e7eb;
  border-radius: 12px;

  h3 {
    font-size: 20px;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 8px;
  }

  p {
    font-size: 14px;
    color: #6b7280;
    margin-bottom: 24px;
  }
`;

const EmptyStateButton = styled.a`
  display: inline-block;
  padding: 12px 24px;
  background-color: #5b4dff;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover {
    background-color: #4c3fcc;
  }
`;

const LoadingContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
`;

const SkeletonCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 20px;
  animation: pulse 2s infinite;

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

const LoadingPagination = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  margin-top: 32px;
`;

const PaginationButton = styled.button`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  background-color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    border-color: #5b4dff;
    color: #5b4dff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &[data-active='true'] {
    background-color: #5b4dff;
    color: white;
    border-color: #5b4dff;
  }
`;

// ==================== COMPONENT ====================

export default function ProfileOrdersPage() {
  const router = useRouter();
  const { orders, isLoading, pagination, filters, setFilters, fetchOrders } = useOrders();
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentStatusFilter, setPaymentStatusFilter] = useState('all');

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders({
      page: 1,
      limit: 10,
      status: statusFilter === 'all' ? undefined : statusFilter,
      paymentStatus: paymentStatusFilter === 'all' ? undefined : paymentStatusFilter,
    });
  }, [statusFilter, paymentStatusFilter]);

  const handleStatusChange = (status) => {
    setStatusFilter(status);
  };

  const handlePaymentStatusChange = (status) => {
    setPaymentStatusFilter(status);
  };

  const handleViewOrder = (orderId) => {
    router.push(`/profile/orders/${orderId}`);
  };

  const handlePageChange = (page) => {
    fetchOrders({ page });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Format order status for display
  const formatStatus = (status) => {
    return status?.charAt(0).toUpperCase() + status?.slice(1) || 'Unknown';
  };

  // Loading state
  if (isLoading && orders.length === 0) {
    return (
      <>
        <PageHeader>
          <HeaderContent>
            <h1>My Orders</h1>
            <p>View and manage your orders</p>
          </HeaderContent>
        </PageHeader>

        <LoadingContainer>
          {[1, 2, 3].map(i => (
            <SkeletonCard key={i} style={{ height: '140px' }} />
          ))}
        </LoadingContainer>
      </>
    );
  }

  // Empty state
  if (!isLoading && orders.length === 0) {
    return (
      <>
        <PageHeader>
          <HeaderContent>
            <h1>My Orders</h1>
            <p>View and manage your orders</p>
          </HeaderContent>
        </PageHeader>

        <EmptyState>
          <h3>No Orders Yet</h3>
          <p>You haven&apos;t placed any orders yet. Start shopping to see your orders here.</p>
          <EmptyStateButton href="/products">Browse Products</EmptyStateButton>
        </EmptyState>
      </>
    );
  }

  return (
    <>
      <PageHeader>
        <HeaderContent>
          <h1>My Orders</h1>
          <p>Total {pagination?.totalItems || 0} orders</p>
        </HeaderContent>
      </PageHeader>

      {/* Filters */}
      <FilterSection>
        <Select
          value={statusFilter}
          onChange={e => handleStatusChange(e.target.value)}
        >
          <option value="all">All Order Status</option>
          <option value="pending">Pending</option>
          <option value="processing">Processing</option>
          <option value="confirmed">Confirmed</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="cancelled">Cancelled</option>
          <option value="refunded">Refunded</option>
        </Select>

        <Select
          value={paymentStatusFilter}
          onChange={e => handlePaymentStatusChange(e.target.value)}
        >
          <option value="all">All Payment Status</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="failed">Failed</option>
          <option value="refunded">Refunded</option>
        </Select>
      </FilterSection>

      {/* Orders List */}
      <OrdersGrid>
        {orders.map(order => (
          <OrderCard key={order._id}>
            <OrderCardHeader>
              <OrderInfoBlock>
                <Label>Order Number</Label>
                <Value>{order.orderNumber}</Value>
              </OrderInfoBlock>

              <OrderInfoBlock>
                <Label>Order Date</Label>
                <Value>{formatDate(order.createdAt)}</Value>
              </OrderInfoBlock>

              <OrderInfoBlock>
                <Label>Items</Label>
                <Value>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</Value>
              </OrderInfoBlock>

              <OrderInfoBlock>
                <Label>Total</Label>
                <Value>{formatCurrency(order.total)}</Value>
              </OrderInfoBlock>
            </OrderCardHeader>

            <OrderCardFooter>
              <StatusBadgesSection>
                <StatusBadge status={order.orderStatus}>
                  {formatStatus(order.orderStatus)}
                </StatusBadge>
                <PaymentBadge paymentStatus={order.paymentStatus}>
                  {formatStatus(order.paymentStatus)}
                </PaymentBadge>
              </StatusBadgesSection>

              <ViewButton onClick={() => handleViewOrder(order._id)}>
                View Details
              </ViewButton>
            </OrderCardFooter>
          </OrderCard>
        ))}
      </OrdersGrid>

      {/* Pagination */}
      {pagination?.totalPages > 1 && (
        <LoadingPagination>
          <PaginationButton
            onClick={() => handlePageChange(pagination.currentPage - 1)}
            disabled={pagination.currentPage === 1}
          >
            ← Previous
          </PaginationButton>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(page => (
            <PaginationButton
              key={page}
              onClick={() => handlePageChange(page)}
              data-active={page === pagination.currentPage}
            >
              {page}
            </PaginationButton>
          ))}

          <PaginationButton
            onClick={() => handlePageChange(pagination.currentPage + 1)}
            disabled={!pagination.hasMore}
          >
            Next →
          </PaginationButton>
        </LoadingPagination>
      )}
    </>
  );
}
