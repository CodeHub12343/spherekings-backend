/**
 * Commission Filters Component
 * Filter interface for commission lists
 */

import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  align-items: flex-end;

  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    padding: 16px;
    margin-bottom: 16px;
    gap: 12px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const Label = styled.label`
  font-size: 0.875rem;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 4px;
  }
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  min-height: 40px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  @media (max-width: 480px) {
    min-height: 44px;
    font-size: 0.875rem;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  transition: border-color 0.2s;
  min-height: 40px;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  @media (max-width: 480px) {
    min-height: 44px;
    font-size: 0.875rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  grid-column: 1 / -1;

  @media (max-width: 1024px) {
    grid-column: auto;
  }

  @media (max-width: 640px) {
    grid-column: 1 / -1;
    flex-direction: column;
    gap: 10px;
  }

  button {
    padding: 8px 16px;
    border: 1px solid #d1d5db;
    border-radius: 6px;
    background-color: white;
    cursor: pointer;
    font-size: 0.875rem;
    font-weight: 500;
    transition: all 0.2s;
    min-height: 40px;

    @media (max-width: 480px) {
      min-height: 44px;
      width: 100%;
    }

    &.primary {
      background-color: #2563eb;
      color: white;
      border-color: #2563eb;

      &:hover:not(:disabled) {
        background-color: #1d4ed8;
      }
    }

    &.secondary {
      background-color: #f3f4f6;
      color: #374151;

      &:hover:not(:disabled) {
        background-color: #e5e7eb;
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
    }
  }
`;

/**
 * Commission Filters
 * 
 * @param {Object} filters - Current filter values
 * @param {Function} onFilterChange - Callback when filters change
 * @param {Function} onApply - Callback to apply filters
 * @param {Function} onReset - Callback to reset filters
 * @param {boolean} isLoading - Loading state
 * @returns {JSX.Element}
 */
export function CommissionFilters({
  filters = {},
  onFilterChange,
  onApply,
  onReset,
  isLoading = false,
}) {
  const handleStatusChange = (value) => {
    onFilterChange?.({ status: value || null });
  };

  const handleDateFromChange = (value) => {
    onFilterChange?.({ dateFrom: value || null });
  };

  const handleDateToChange = (value) => {
    onFilterChange?.({ dateTo: value || null });
  };

  return (
    <FilterContainer>
      <FilterGroup>
        <Label htmlFor="status-filter">Status</Label>
        <Select
          id="status-filter"
          value={filters.status || ''}
          onChange={(e) => handleStatusChange(e.target.value)}
          disabled={isLoading}
        >
          <option value="">All Statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="paid">Paid</option>
          <option value="reversed">Reversed</option>
        </Select>
      </FilterGroup>

      <FilterGroup>
        <Label htmlFor="date-from">Date From</Label>
        <Input
          id="date-from"
          type="date"
          value={filters.dateFrom || ''}
          onChange={(e) => handleDateFromChange(e.target.value)}
          disabled={isLoading}
        />
      </FilterGroup>

      <FilterGroup>
        <Label htmlFor="date-to">Date To</Label>
        <Input
          id="date-to"
          type="date"
          value={filters.dateTo || ''}
          onChange={(e) => handleDateToChange(e.target.value)}
          disabled={isLoading}
        />
      </FilterGroup>

      <ButtonGroup>
        <button
          className="primary"
          onClick={onApply}
          disabled={isLoading}
        >
          Apply Filters
        </button>
        <button
          className="secondary"
          onClick={onReset}
          disabled={isLoading}
        >
          Reset
        </button>
      </ButtonGroup>
    </FilterContainer>
  );
}

export default CommissionFilters;
