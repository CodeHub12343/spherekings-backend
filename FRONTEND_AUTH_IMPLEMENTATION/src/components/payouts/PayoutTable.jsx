/**
 * PayoutTable Component
 * Displays paginated payout table with selection and actions
 */

import React, { useState } from 'react';
import styled from 'styled-components';
import PayoutStatusBadge from './PayoutStatusBadge';

const TableContainer = styled.div`
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

const Table = styled.table`
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
      text-align: left;

      @media (max-width: 640px) {
        padding: 0;
        display: grid;
        grid-template-columns: 120px 1fr;
        align-items: start;
        justify-items: start;
        gap: 8px;
        text-align: left;

        &:before {
          content: attr(data-label);
          font-weight: 600;
          color: #6b7280;
          font-size: 0.75rem;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          text-align: left;
          word-break: break-word;
        }
      }

      @media (max-width: 480px) {
        grid-template-columns: 100px 1fr;
        font-size: 0.8rem;
        text-align: left;

        &:before {
          font-size: 0.7rem;
          text-align: left;
          word-break: break-word;
        }
      }
    }
  }

  @media (max-width: 640px) {
    min-width: auto;
  }
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin: 0;
  border-radius: 4px;
  accent-color: #2563eb;
  transition: all 0.2s ease;

  @media (max-width: 480px) {
    width: 20px;
    height: 20px;
  }

  &:hover {
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const AmountCell = styled.td`
  color: #27ae60;
  font-family: 'Monaco', 'Courier New', monospace;
  font-weight: 700;
  letter-spacing: 0.5px;
`;

const ActionButton = styled.button`
  padding: 8px 14px;
  margin: 2px;
  border: none;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 12px;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  letter-spacing: 0.3px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.08);
  white-space: nowrap;
  min-height: 32px;

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 12px;
    min-height: 36px;
  }

  @media (max-width: 640px) {
    padding: 10px 12px;
    font-size: 12px;
    min-height: 40px;
    margin: 0;
    justify-content: flex-start;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;
    min-height: 44px;
    margin: 0;
    justify-content: flex-start;
    width: 100%;
  }

  &::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.6);
    transform: translate(-50%, -50%);
    transition: width 0.5s, height 0.5s;
  }

  &:hover:not(:disabled)::before {
    width: 200px;
    height: 200px;
  }

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 6px 12px rgba(0, 0, 0, 0.15);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  }

  &:disabled {
    opacity: 0.4;
    cursor: not-allowed;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
  }

  &.view {
    background: linear-gradient(135deg, #E3F2FD 0%, #BBDEFB 100%);
    color: #1565c0;
    border: 1px solid #90CAF9;
  }

  &.approve {
    background: linear-gradient(135deg, #E8F5E9 0%, #C8E6C9 100%);
    color: #1b5e20;
    border: 1px solid #81C784;
  }

  &.process {
    background: linear-gradient(135deg, #FFF3E0 0%, #FFE0B2 100%);
    color: #e65100;
    border: 1px solid #FFB74D;
  }

  &.reject {
    background: linear-gradient(135deg, #FFEBEE 0%, #FFCDD2 100%);
    color: #b71c1c;
    border: 1px solid #EF9A9A;
  }
`;

const ActionCell = styled.td`
  text-align: left;
  padding: 12px !important;

  @media (max-width: 768px) {
    padding: 10px !important;
    text-align: left;
  }

  @media (max-width: 640px) {
    padding: 0 !important;
    text-align: left;
    display: grid;
    grid-template-columns: 120px 1fr;
    align-items: start;
    justify-items: start;
    gap: 8px;

    &:before {
      content: attr(data-label);
      font-weight: 600;
      color: #6b7280;
      font-size: 0.75rem;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      text-align: left;
      word-break: break-word;
    }
  }

  @media (max-width: 480px) {
    grid-template-columns: 100px 1fr;
    text-align: left;

    &:before {
      font-size: 0.7rem;
      text-align: left;
      word-break: break-word;
    }
  }
`;

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

const PaginationInfo = styled.span`
  font-size: 12px;
  color: #718096;
  font-weight: 500;

  @media (max-width: 480px) {
    font-size: 13px;
    order: 2;
  }
`;

const PaginationButtons = styled.div`
  display: flex;
  gap: 10px;

  @media (max-width: 480px) {
    width: 100%;
    gap: 8px;
    order: 1;
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

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.85);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  color: #666;
  border-radius: 11px;
  font-weight: 500;
  backdrop-filter: blur(2px);

  @media (max-width: 480px) {
    font-size: 13px;
    border-radius: 8px;
  }
`;

const EmptyState = styled.div`
  padding: 60px 40px;
  text-align: center;
  color: #99a6b2;
  font-size: 14px;
  font-weight: 500;
  background: linear-gradient(135deg, #f9fafb 0%, #f5f7fa 100%);

  @media (max-width: 768px) {
    padding: 40px 30px;
    font-size: 13px;
  }

  @media (max-width: 480px) {
    padding: 30px 20px;
    font-size: 12px;
  }
`;

const TableWrapper = styled.div`
  position: relative;
  
  @media (max-width: 768px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  @media (max-width: 480px) {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
`;

export default function PayoutTable({
  payouts = [],
  pagination = {},
  selectedIds = [],
  onSelectChange,
  onPageChange,
  onAction,
  isLoading = false,
  actions = []
}) {
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectAll = (e) => {
    const newSelectAll = e.target.checked;
    setSelectAll(newSelectAll);

    if (newSelectAll) {
      onSelectChange?.(payouts.map((p) => p._id));
    } else {
      onSelectChange?.([]);
    }
  };

  const handleSelectOne = (e, payoutId) => {
    e.stopPropagation();
    const isSelected = selectedIds.includes(payoutId);

    if (isSelected) {
      onSelectChange?.(selectedIds.filter((id) => id !== payoutId));
    } else {
      onSelectChange?.([...selectedIds, payoutId]);
    }

    setSelectAll(false);
  };

  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const { page = 1, limit = 20, total = 0, pages = 1 } = pagination;
  const startIndex = (page - 1) * limit + 1;
  const endIndex = Math.min(page * limit, total);

  if (isLoading) {
    return (
      <TableWrapper>
        <TableContainer>
          <LoadingOverlay>Loading payouts...</LoadingOverlay>
        </TableContainer>
      </TableWrapper>
    );
  }

  if (payouts.length === 0) {
    return (
      <TableContainer>
        <EmptyState>No payouts found</EmptyState>
      </TableContainer>
    );
  }

  return (
    <TableWrapper>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th style={{ width: '40px' }}>
                <Checkbox
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                />
              </th>
              <th>ID</th>
              <th>Amount</th>
              <th>Method</th>
              <th>Status</th>
              <th>Requested</th>
              <th style={{ width: '200px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {payouts.map((payout) => {
              const isSelected = selectedIds.includes(payout._id);
              return (
                <tr key={payout._id} className={isSelected ? 'selected' : ''}>
                  <td>
                    <Checkbox
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => handleSelectOne(e, payout._id)}
                    />
                  </td>
                  <td>#{payout._id.slice(-8).toUpperCase()}</td>
                  <AmountCell>{formatCurrency(payout.amount)}</AmountCell>
                  <td style={{ textTransform: 'capitalize' }}>
                    {payout.method?.replace(/_/g, ' ')}
                  </td>
                  <td>
                    <PayoutStatusBadge status={payout.status} showDot />
                  </td>
                  <td>{formatDate(payout.request?.submittedAt || payout.createdAt)}</td>
                  <ActionCell>
                    {actions.includes('view') && (
                      <ActionButton className="view" onClick={() => onAction?.('view', payout._id)} title="View details">
                        <span>👁</span>
                        View
                      </ActionButton>
                    )}
                  </ActionCell>
                </tr>
              );
            })}
          </tbody>
        </Table>

        <PaginationContainer>
          <PaginationInfo>
            Showing {startIndex} to {endIndex} of {total} payouts
          </PaginationInfo>
          <PaginationButtons>
            <PaginationButton
              disabled={page === 1}
              onClick={() => onPageChange?.(page - 1)}
            >
              ← Previous
            </PaginationButton>
            <PaginationButton disabled>
              Page {page} of {pages}
            </PaginationButton>
            <PaginationButton
              disabled={page === pages}
              onClick={() => onPageChange?.(page + 1)}
            >
              Next →
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      </TableContainer>
    </TableWrapper>
  );
}
