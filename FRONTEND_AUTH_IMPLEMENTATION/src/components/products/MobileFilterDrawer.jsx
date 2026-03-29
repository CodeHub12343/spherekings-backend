'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { X, ChevronDown } from 'lucide-react';
import PriceRangeSlider from './PriceRangeSlider';

const Overlay = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'block' : 'none')};
  }
`;

const DrawerContainer = styled.div`
  display: none;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  max-height: 85vh;
  background: white;
  border-radius: 16px 16px 0 0;
  z-index: 1000;
  animation: slideUp 0.3s ease-out;
  flex-direction: column;

  @keyframes slideUp {
    from {
      transform: translateY(100%);
    }
    to {
      transform: translateY(0);
    }
  }

  @media (max-width: 768px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
  }
`;

const DrawerHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
  flex-shrink: 0;
`;

const DrawerTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  font-size: 20px;
  transition: color 0.2s;

  &:hover {
    color: #1f2937;
  }

  svg {
    width: 24px;
    height: 24px;
  }
`;

const DrawerContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 24px;

  /* Hide scrollbar but keep functionality */
  scrollbar-width: thin;
  scrollbar-color: #d1d5db transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #d1d5db;
    border-radius: 3px;

    &:hover {
      background: #9ca3af;
    }
  }
`;

const FilterSection = styled.div`
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 16px;

  &:last-child {
    border-bottom: none;
    padding-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  option {
    color: #1f2937;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;
  transition: color 0.2s;

  &:hover {
    color: #1f2937;
  }

  input {
    cursor: pointer;
    width: 18px;
    height: 18px;
    accent-color: #5b4dff;
  }
`;

const DrawerFooter = styled.div`
  display: flex;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e5e7eb;
  flex-shrink: 0;
`;

const Button = styled.button`
  flex: 1;
  padding: 12px 16px;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
  }
`;

const ApplyButton = styled(Button)`
  background: #5b4dff;
  color: white;

  &:hover {
    background: #4940d4;
  }
`;

const ClearButton = styled(Button)`
  background: white;
  border: 1px solid #e5e7eb;
  color: #6b7280;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }
`;

/**
 * MobileFilterDrawer Component
 * 
 * Features:
 * - Bottom-sliding drawer for mobile
 * - Status, category, and price filters
 * - Apply and Clear buttons
 * - Responsive design (hidden on desktop)
 * - Touch-friendly interactions
 * 
 * Usage:
 * <MobileFilterDrawer
 *   isOpen={showMobileFilters}
 *   onClose={handleCloseFilters}
 *   filters={filters}
 *   onFilterChange={handleFilterChange}
 *   categories={['Electronics', 'Clothing', 'Home']}
 *   onApply={handleApplyFilters}
 *   onClear={handleClearFilters}
 * />
 */
export default function MobileFilterDrawer({
  isOpen = false,
  onClose = () => {},
  filters = {},
  onFilterChange = () => {},
  categories = [],
  onApply = () => {},
  onClear = () => {},
  minPrice = 0,
  maxPrice = 1000,
}) {
  const [localFilters, setLocalFilters] = useState({
    status: filters.status || '',
    category: filters.category || '',
    minPrice: filters.minPrice || minPrice,
    maxPrice: filters.maxPrice || maxPrice,
  });

  const handleSelectChange = (name, value) => {
    const updated = { ...localFilters, [name]: value };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handlePriceChange = (min, max) => {
    const updated = { ...localFilters, minPrice: min, maxPrice: max };
    setLocalFilters(updated);
    onFilterChange(updated);
  };

  const handleApply = () => {
    onApply(localFilters);
    onClose();
  };

  const handleClear = () => {
    const cleared = {
      status: '',
      category: '',
      minPrice: minPrice,
      maxPrice: maxPrice,
    };
    setLocalFilters(cleared);
    onFilterChange(cleared);
    onClear();
  };

  return (
    <>
      <Overlay isOpen={isOpen} onClick={onClose} />

      <DrawerContainer isOpen={isOpen}>
        {/* Header */}
        <DrawerHeader>
          <DrawerTitle>Filters</DrawerTitle>
          <CloseButton onClick={onClose} aria-label="Close filters">
            <X />
          </CloseButton>
        </DrawerHeader>

        {/* Content */}
        <DrawerContent>
          {/* Status Filter */}
          <FilterSection>
            <FilterLabel htmlFor="mobile-status">Status</FilterLabel>
            <FilterSelect
              id="mobile-status"
              value={localFilters.status}
              onChange={(e) => handleSelectChange('status', e.target.value)}
            >
              <option value="">All Products</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </FilterSelect>
          </FilterSection>

          {/* Category Filter */}
          {categories.length > 0 && (
            <FilterSection>
              <FilterLabel htmlFor="mobile-category">Category</FilterLabel>
              <FilterSelect
                id="mobile-category"
                value={localFilters.category}
                onChange={(e) => handleSelectChange('category', e.target.value)}
              >
                <option value="">All Categories</option>
                {categories.map((cat) => (
                  <option key={cat.name || cat} value={cat.name || cat}>
                    {cat.displayLabel || cat.displayName || cat}
                  </option>
                ))}
              </FilterSelect>
            </FilterSection>
          )}

          {/* Price Range Filter */}
          <FilterSection>
            <PriceRangeSlider
              min={minPrice}
              max={maxPrice}
              minPrice={localFilters.minPrice}
              maxPrice={localFilters.maxPrice}
              onPriceChange={handlePriceChange}
              label="Price Range"
            />
          </FilterSection>
        </DrawerContent>

        {/* Footer with Action Buttons */}
        <DrawerFooter>
          <ClearButton onClick={handleClear}>Clear All</ClearButton>
          <ApplyButton onClick={handleApply}>Apply Filters</ApplyButton>
        </DrawerFooter>
      </DrawerContainer>
    </>
  );
}
