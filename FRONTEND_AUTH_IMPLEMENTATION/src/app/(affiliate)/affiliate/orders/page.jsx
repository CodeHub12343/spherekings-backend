/**
 * Affiliate Orders Dashboard Page
 * Shows affiliate's referred orders and commissions
 */

'use client';

import styled from 'styled-components';
import { useEffect } from 'react';
import { useAffiliateOrdersHook } from '@/hooks/useOrders';
import { CommissionStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge';
import OrderCard from '@/components/orders/OrderCard';

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  margin-bottom: 32px;

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

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;

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
  }

  .detail {
    font-size: 0.75rem;
    color: #6b7280;
  }
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: #111827;
  border-bottom: 2px solid #e5e7eb;
  padding-bottom: 12px;
`;

const OrdersContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-bottom: 24px;
`;

const LoadingState = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  color: #6b7280;
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

const OrderTableContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow-x: auto;
`;

const OrderTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f9fafb;
    border-bottom: 2px solid #e5e7eb;

    th {
      padding: 12px;
      text-align: left;
      font-size: 0.875rem;
      font-weight: 600;
      color: #374151;
    }
  }

  tbody {
    tr {
      border-bottom: 1px solid #e5e7eb;

      &:hover {
        background: #f9fafb;
      }

      &:last-child {
        border-bottom: none;
      }
    }

    td {
      padding: 12px;
      font-size: 0.875rem;
      color: #111827;
    }
  }
`;

const OrderNumberLink = styled.a`
  color: #2563eb;
  text-decoration: none;
  font-weight: 500;

  &:hover {
    text-decoration: underline;
  }
`;

export default function AffiliateOrdersPage() {
  const {
    orders,
    statistics,
    pagination,
    isLoading,
    error,
    fetchAffiliateOrders,
    setPagination,
  } = useAffiliateOrdersHook();

  useEffect(() => {
    fetchAffiliateOrders({ page: 1, limit: 20 });
  }, [fetchAffiliateOrders]);

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

  const handlePageChange = (page) => {
    setPagination(page, 20);
    fetchAffiliateOrders({ page, limit: 20 });
  };

  if (error) {
    return (
      <PageContainer>
        <Header>
          <h1>Affiliate Orders</h1>
          <p>Manage your referred orders and commissions</p>
        </Header>
        <EmptyState>
          <h3>Error Loading Orders</h3>
          <p>{error}</p>
        </EmptyState>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <Header>
        <h1>Affiliate Orders Dashboard</h1>
        <p>Track your referred orders and commission earnings</p>
      </Header>

      {/* Statistics */}
      {statistics && (
        <StatsGrid>
          <StatCard>
            <h3>Total Commission</h3>
            <div className="value">{formatPrice(statistics.totalCommission)}</div>
            <div className="detail">From all referred orders</div>
          </StatCard>

          <StatCard>
            <h3>Paid Commission</h3>
            <div className="value">{formatPrice(statistics.paidCommission)}</div>
            <div className="detail">Already withdrawn</div>
          </StatCard>

          <StatCard>
            <h3>Pending Commission</h3>
            <div className="value">{formatPrice(statistics.pendingCommission)}</div>
            <div className="detail">Ready to withdraw</div>
          </StatCard>

          <StatCard>
            <h3>Total Sales</h3>
            <div className="value">{formatPrice(statistics.totalSales)}</div>
            <div className="detail">From referred customers</div>
          </StatCard>
        </StatsGrid>
      )}

      <SectionTitle>Referred Orders</SectionTitle>

      {isLoading ? (
        <LoadingState>Loading orders...</LoadingState>
      ) : orders && orders.length > 0 ? (
        <>
          <OrderTableContainer>
            <OrderTable>
              <thead>
                <tr>
                  <th>Order</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Total</th>
                  <th>Commission</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order._id}>
                    <td>
                      <OrderNumberLink href={`/orders/${order._id}`}>
                        {order.orderNumber}
                      </OrderNumberLink>
                    </td>
                    <td>{formatDate(order.createdAt)}</td>
                    <td>{order.userId || 'N/A'}</td>
                    <td>{formatPrice(order.total)}</td>
                    <td>
                      <div>
                        <div>{formatPrice(order.affiliateDetails?.commissionAmount || 0)}</div>
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {(
                            (order.affiliateDetails?.commissionRate || 0) * 100
                          ).toFixed(1)}
                          %
                        </div>
                      </div>
                    </td>
                    <td>
                      <CommissionStatusBadge status={order.affiliateDetails?.status} />
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
          <h3>No Referred Orders</h3>
          <p>You haven't referred any orders yet. Share your affiliate link to start earning!</p>
        </EmptyState>
      )}
    </PageContainer>
  );
}
