/**
 * Referral Clicks Table Component
 * Displays paginated referral click history
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
  gap: 12px;
  align-items: center;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
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

const BadgeConverted = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background-color: #d4edda;
  color: #155724;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const BadgePending = styled.span`
  display: inline-block;
  padding: 4px 8px;
  background-color: #fff3cd;
  color: #856404;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

export const ReferralClicksTable = ({
  referrals = [],
  pagination = { page: 1, limit: 20, total: 0, pages: 0 },
  onPageChange,
  onFilterConvertedOnly,
  convertedOnly = false,
  isLoading = false,
}) => {
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <Container>
      <Header>
        <Title>📊 Referral Clicks History</Title>
        <FilterContainer>
          <FilterButton
            className={convertedOnly ? 'active' : ''}
            onClick={() => onFilterConvertedOnly?.(!convertedOnly)}
          >
            <Filter size={16} />
            Conversions Only
          </FilterButton>
        </FilterContainer>
      </Header>

      {isLoading ? (
        <EmptyState>
          <p>Loading referrals...</p>
        </EmptyState>
      ) : referrals.length === 0 ? (
        <EmptyState>
          <p>
            {convertedOnly
              ? 'No converted referrals yet'
              : 'No referral clicks yet. Share your link to get started!'}
          </p>
        </EmptyState>
      ) : (
        <>
          <TableWrapper>
            <Table>
              <thead>
                <tr>
                  <th>Date & Time</th>
                  <th>IP Address</th>
                  <th>Device</th>
                  <th>Source</th>
                  <th>Status</th>
                  <th>Commission</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map((referral) => (
                  <tr key={referral._id}>
                    <td>{formatDate(referral.createdAt)}</td>
                    <td>
                      <code>{referral.ipAddress}</code>
                    </td>
                    <td>
                      {referral.device === 'mobile' ? '📱 Mobile' : '💻 Desktop'}
                    </td>
                    <td>{referral.referralSource || 'Direct'}</td>
                    <td>
                      {referral.convertedToSale ? (
                        <BadgeConverted>Converted</BadgeConverted>
                      ) : (
                        <BadgePending>Pending</BadgePending>
                      )}
                    </td>
                    <td>
                      <strong>
                        ${referral.commissionAmount?.toFixed(2) || '0.00'}
                      </strong>
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

export default ReferralClicksTable;
