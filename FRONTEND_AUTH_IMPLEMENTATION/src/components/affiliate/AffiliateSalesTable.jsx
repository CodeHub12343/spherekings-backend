/**
 * Affiliate Sales Table Component
 * Displays sales with commission details and status filtering
 */

import { useState } from 'react';
import styled from 'styled-components';
import { ChevronLeft, ChevronRight, Filter } from 'lucide-react';

const Container = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #f0f0f0;
`;

const Title = styled.h3`
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const FilterContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const FilterButton = styled.button`
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  color: #333;
  transition: all 0.2s ease;

  &:hover {
    background-color: #e8e8e8;
    border-color: #ccc;
  }

  &.active {
    background-color: #4a90e2;
    color: white;
    border-color: #4a90e2;
  }
`;

const TableWrapper = styled.div`
  overflow-x: auto;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f9f9f9;
    border-bottom: 2px solid #e0e0e0;
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #666;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 14px;
    color: #333;
  }

  tbody tr {
    transition: background-color 0.15s ease;

    &:hover {
      background-color: #f9f9f9;
    }

    &:last-child td {
      border-bottom: none;
    }
  }
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  color: #999;

  p {
    margin: 0;
    font-size: 16px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-top: 1px solid #f0f0f0;
  background-color: #fafafa;
`;

const PaginationInfo = styled.span`
  font-size: 14px;
  color: #666;
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 8px;
`;

const PaginationButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #f5f5f5;
    border-color: #999;
  }

  &:disabled {
    background-color: #f0f0f0;
    border-color: #e0e0e0;
    color: #ccc;
    cursor: not-allowed;
  }
`;

const CommissionBadge = styled.span`
  display: inline-block;
  padding: 6px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;

  ${(props) => {
    switch (props.$status) {
      case 'paid':
        return `
          background-color: #d4edda;
          color: #155724;
        `;
      case 'approved':
        return `
          background-color: #cce5ff;
          color: #0056b3;
        `;
      case 'pending':
        return `
          background-color: #fff3cd;
          color: #856404;
        `;
      case 'reversed':
        return `
          background-color: #f8d7da;
          color: #721c24;
        `;
      default:
        return `
          background-color: #e2e3e5;
          color: #383d41;
        `;
    }
  }}
`;

const OrderStatusBadge = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background-color: #e3f2fd;
  color: #1565c0;
  border-radius: 4px;
  font-size: 12px;
`;

export const AffiliateSalesTable = ({
  sales = [],
  pagination = { page: 1, limit: 20, total: 0, pages: 0 },
  statistics = {},
  onPageChange,
  onStatusFilter,
  status = '',
  isLoading = false,
}) => {
  const statuses = ['', 'pending', 'approved', 'paid', 'reversed'];

  const handlePreviousPage = () => {
    if (pagination.page > 1) {
      onPageChange?.(pagination.page - 1);
    }
  };

  const handleNextPage = () => {
    if (pagination.page < pagination.pages) {
      onPageChange?.(pagination.page + 1);
    }
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <Container>
      <Header>
        <Title>💰 Sales & Commissions</Title>
        <FilterContainer>
          {statuses.map((s) => (
            <FilterButton
              key={s}
              className={status === s ? 'active' : ''}
              onClick={() => onStatusFilter?.(s)}
            >
              {s || 'All'}
            </FilterButton>
          ))}
        </FilterContainer>
      </Header>

      {isLoading ? (
        <EmptyState>
          <p>Loading sales...</p>
        </EmptyState>
      ) : sales.length === 0 ? (
        <EmptyState>
          <p>
            {status ? `No ${status} sales yet` : 'No sales attributed to you yet'}
          </p>
        </EmptyState>
      ) : (
        <>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Order Number</th>
                  <th>Date</th>
                  <th>Order Total</th>
                  <th>Commission Rate</th>
                  <th>Commission Earned</th>
                  <th>Commission Status</th>
                  <th>Order Status</th>
                </tr>
              </thead>
              <tbody>
                {sales.map((sale) => (
                  <tr key={sale._id}>
                    <td>
                      <strong>{sale.orderNumber}</strong>
                    </td>
                    <td>{formatDate(sale.createdAt)}</td>
                    <td>${sale.total?.toFixed(2) || '0.00'}</td>
                    <td>
                      <strong>{sale.affiliateDetails?.commissionRate || 0}%</strong>
                    </td>
                    <td>${sale.affiliateDetails?.commissionAmount?.toFixed(2) || '0.00'}</td>
                    <td>
                      <CommissionBadge $status={sale.affiliateDetails?.status}>
                        {sale.affiliateDetails?.status}
                      </CommissionBadge>
                    </td>
                    <td>
                      <OrderStatusBadge>{sale.orderStatus || 'Pending'}</OrderStatusBadge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </TableWrapper>

          {pagination.pages > 1 && (
            <PaginationContainer>
              <PaginationInfo>
                Page {pagination.page} of {pagination.pages} (
                {pagination.total} total)
              </PaginationInfo>
              <PaginationButtons>
                <PaginationButton onClick={handlePreviousPage} disabled={pagination.page === 1}>
                  <ChevronLeft size={16} />
                </PaginationButton>
                <PaginationButton
                  onClick={handleNextPage}
                  disabled={pagination.page === pagination.pages}
                >
                  <ChevronRight size={16} />
                </PaginationButton>
              </PaginationButtons>
            </PaginationContainer>
          )}
        </>
      )}
    </Container>
  );
};

export default AffiliateSalesTable;
