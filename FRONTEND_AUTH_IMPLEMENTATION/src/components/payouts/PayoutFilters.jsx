/**
 * PayoutFilters Component
 * Filter interface for payouts
 */

import React from 'react';
import styled from 'styled-components';

const FilterContainer = styled.div`
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
    border-radius: 6px;
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
`;

const FilterLabel = styled.label`
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 5px;
  }
`;

const FilterSelect = styled.select`
  padding: 10px 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 0.875rem;
  color: #111827;
  width: 100%;
  box-sizing: border-box;
  min-height: 40px;
  transition: border-color 0.2s ease;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    min-height: 44px;
    padding: 10px;
  }

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  grid-column: 1 / -1;
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
    width: 100%;
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

export default function PayoutFilters({
  filters = {},
  onFilterChange,
  onApply,
  onReset,
  isLoading = false,
  isAdmin = false
}) {
  const handleChange = (field, value) => {
    onFilterChange?.({ ...filters, [field]: value });
  };

  return (
    <FilterContainer>
      <FilterGrid>
        {/* Status Filter */}
        <FilterGroup>
          <FilterLabel>Status</FilterLabel>
          <FilterSelect
            value={filters.status || ''}
            onChange={(e) => handleChange('status', e.target.value)}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="processing">Processing</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </FilterSelect>
        </FilterGroup>

        {/* Payment Method Filter (Admin Only) */}
        {isAdmin && (
          <FilterGroup>
            <FilterLabel>Payment Method</FilterLabel>
            <FilterSelect
              value={filters.method || ''}
              onChange={(e) => handleChange('method', e.target.value)}
            >
              <option value="">All Methods</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="paypal">PayPal</option>
              <option value="stripe">Stripe</option>
              <option value="cryptocurrency">Cryptocurrency</option>
              <option value="manual">Manual</option>
            </FilterSelect>
          </FilterGroup>
        )}



        {/* Buttons */}
        <ButtonGroup>
          <Button onClick={onReset} disabled={isLoading}>
            Reset
          </Button>
          <Button className="primary" onClick={onApply} disabled={isLoading}>
            {isLoading ? 'Applying...' : 'Apply Filters'}
          </Button>
        </ButtonGroup>
      </FilterGrid>
    </FilterContainer>
  );
}
