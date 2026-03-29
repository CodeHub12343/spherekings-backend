/**
 * Commission Table Component
 * Display list of commissions with pagination
 */

import React from 'react';
import styled from 'styled-components';
import CommissionStatusBadge from './CommissionStatusBadge';

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

const Actions = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 6px;
    width: 100%;
  }

  button {
    padding: 6px 12px;
    font-size: 12px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: all 0.2s;
    min-height: 32px;

    @media (max-width: 640px) {
      min-height: 40px;
      width: 100%;
      padding: 8px 12px;
    }

    @media (max-width: 480px) {
      min-height: 44px;
      padding: 10px 12px;
      font-size: 11px;
    }

    &.primary {
      background-color: #2563eb;
      color: white;

      &:hover:not(:disabled) {
        background-color: #1d4ed8;
      }
    }

    &.secondary {
      background-color: #6b7280;
      color: white;

      &:hover:not(:disabled) {
        background-color: #4b5563;
      }
    }

    &.danger {
      background-color: #dc3545;
      color: white;

      &:hover:not(:disabled) {
        background-color: #c82333;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #999;

  h3 {
    margin: 0 0 10px 0;
    color: #666;
  }

  p {
    margin: 0;
    font-size: 14px;
  }

  @media (max-width: 640px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
    font-size: 12px;
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

/**
 * Commission Table
 * 
 * @param {Array} commissions - List of commissions
 * @param {Object} pagination - Pagination metadata
 * @param {Function} onPageChange - Callback for page change
 * @param {Function} onRowClick - Callback for row click
 * @param {Function} onAction - Callback for action buttons (approve, pay, reverse)
 * @param {Array<string>} actions - Available actions (approve, pay, reverse, view)
 * @param {boolean} showCheckboxes - Show selection checkboxes
 * @param {Array<string>} selectedIds - Selected commission IDs
 * @param {Function} onSelectChange - Callback for checkbox change
 * @param {boolean} isLoading - Loading state
 * @returns {JSX.Element}
 */
export function CommissionTable({
  commissions = [],
  pagination = {},
  onPageChange,
  onRowClick,
  onAction,
  actions = ['view'],
  showCheckboxes = false,
  selectedIds = [],
  onSelectChange,
  isLoading = false,
}) {
  const formatCurrency = (amount) => `$${(amount || 0).toFixed(2)}`;
  const formatDate = (date) => new Date(date).toLocaleDateString();

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      const allIds = commissions.map((c) => c._id);
      onSelectChange && onSelectChange(allIds);
    } else {
      onSelectChange && onSelectChange([]);
    }
  };

  const handleSelectRow = (id) => {
    const newSelection = selectedIds.includes(id)
      ? selectedIds.filter((sid) => sid !== id)
      : [...selectedIds, id];
    onSelectChange && onSelectChange(newSelection);
  };

  if (isLoading) {
    return (
      <TableContainer>
        <EmptyState>
          <p>Loading commissions...</p>
        </EmptyState>
      </TableContainer>
    );
  }

  if (!commissions || commissions.length === 0) {
    return (
      <TableContainer>
        <EmptyState>
          <h3>No commissions found</h3>
          <p>Adjust your filters or check back later</p>
        </EmptyState>
      </TableContainer>
    );
  }

  const currentPage = pagination.page || 1;
  const totalPages = Math.ceil((pagination.total || 0) / (pagination.limit || 20));
  const allSelected =
    commissions.length > 0 && selectedIds.length === commissions.length;

  return (
    <>
      <TableContainer>
        <Table>
          <thead>
            <tr>
              {showCheckboxes && (
                <th>
                  <Checkbox
                    type="checkbox"
                    checked={allSelected}
                    onChange={handleSelectAll}
                    disabled={commissions.length === 0}
                  />
                </th>
              )}
              <th>Order #</th>
              <th>Amount</th>
              <th>Rate</th>
              <th>Status</th>
              <th>Date</th>
              {actions.length > 0 && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {commissions.map((commission) => (
              <tr key={commission._id} onClick={() => onRowClick?.(commission)}>
                {showCheckboxes && (
                  <td data-label="Select" onClick={(e) => e.stopPropagation()}>
                    <Checkbox
                      type="checkbox"
                      checked={selectedIds.includes(commission._id)}
                      onChange={() => handleSelectRow(commission._id)}
                    />
                  </td>
                )}
                <td data-label="Order #">{commission.orderNumber}</td>
                <td data-label="Amount">{formatCurrency(commission.calculation.amount)}</td>
                <td data-label="Rate">{(commission.calculation.rate * 100).toFixed(1)}%</td>
                <td data-label="Status">
                  <CommissionStatusBadge status={commission.status} />
                </td>
                <td data-label="Date">{formatDate(commission.createdAt)}</td>
                {actions.length > 0 && (
                  <td data-label="Actions" onClick={(e) => e.stopPropagation()}>
                    <Actions>
                      {actions.includes('view') && (
                        <button
                          className="primary"
                          onClick={() => onRowClick?.(commission)}
                          title="View details"
                        >
                          View
                        </button>
                      )}
                      {actions.includes('approve') && commission.status === 'pending' && (
                        <button
                          className="secondary"
                          onClick={() => onAction?.('approve', commission._id)}
                          title="Approve commission"
                        >
                          Approve
                        </button>
                      )}
                      {actions.includes('pay') && commission.status === 'approved' && (
                        <button
                          className="primary"
                          onClick={() => onAction?.('pay', commission._id)}
                          title="Mark as paid"
                        >
                          Pay
                        </button>
                      )}
                      {actions.includes('reverse') && ['pending', 'approved'].includes(commission.status) && (
                        <button
                          className="danger"
                          onClick={() => onAction?.('reverse', commission._id)}
                          title="Reverse commission"
                        >
                          Reverse
                        </button>
                      )}
                    </Actions>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </Table>
      </TableContainer>

      {pagination.total && totalPages > 1 && (
        <PaginationContainer>
          <PaginationInfo>
            Showing {(currentPage - 1) * (pagination.limit || 20) + 1} to{' '}
            {Math.min(currentPage * (pagination.limit || 20), pagination.total)} of{' '}
            {pagination.total} commissions
          </PaginationInfo>
          <PaginationButtons>
            <PaginationButton
              disabled={currentPage === 1}
              onClick={() => onPageChange?.(currentPage - 1)}
            >
              Previous
            </PaginationButton>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <PaginationButton
                key={page}
                $active={page === currentPage}
                onClick={() => onPageChange?.(page)}
              >
                {page}
              </PaginationButton>
            ))}
            <PaginationButton
              disabled={currentPage === totalPages}
              onClick={() => onPageChange?.(currentPage + 1)}
            >
              Next
            </PaginationButton>
          </PaginationButtons>
        </PaginationContainer>
      )}
    </>
  );
}

export default CommissionTable;
