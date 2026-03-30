'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { Sliders } from 'lucide-react';
import ProductCard from './ProductCard';
import ProductCardSkeleton from './ProductCardSkeleton';
import PriceRangeSlider from './PriceRangeSlider';
import MobileFilterDrawer from './MobileFilterDrawer';

const ListContainer = styled.div`
  width: 100%;
`;

const FiltersAndGridWrapper = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  gap: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 220px 1fr;
    gap: 24px;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

const DesktopFilterSidebar = styled.aside`
  display: block;

  @media (max-width: 768px) {
    display: none;
  }
`;

const FilterSection = styled.div`
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
`;

const FilterLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
`;

const FilterSelect = styled.select`
  width: 100%;
  padding: 8px 12px;
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
`;

const GridContentWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const FilterBarMobile = styled.div`
  display: none;
  gap: 12px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #5b4dff;
  cursor: pointer;
  transition: all 0.2s;

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 18px;
    height: 18px;
  }
`;

const SortSelect = styled(FilterSelect)`
  flex: 1;
  min-width: 150px;
`;

const GridLayout = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 32px;

  @media (max-width: 1200px) {
    grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
    gap: 16px;
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
  }
`;

const LoadingContainer = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #6b7280;
`;

const Spinner = styled.div`
  width: 48px;
  height: 48px;
  border: 4px solid #e5e7eb;
  border-top-color: #5b4dff;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto 16px;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 60px 20px;
  grid-column: 1 / -1;

  h3 {
    font-size: 18px;
    color: #1f2937;
    margin: 0 0 8px;
    font-weight: 600;
  }

  p {
    color: #6b7280;
    margin: 0;
    font-size: 14px;
  }
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 8px;
  flex-wrap: wrap;
`;

const PaginationButton = styled.button`
  padding: 8px 12px;
  border: 1px solid ${(props) => (props.active ? '#5b4dff' : '#e5e7eb')};
  background: ${(props) => (props.active ? '#5b4dff' : 'white')};
  color: ${(props) => (props.active ? 'white' : '#1f2937')};
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  font-size: 14px;

  &:hover:not(:disabled) {
    border-color: #5b4dff;
    background: ${(props) => (props.active ? '#4c3fcc' : '#f3f4f6')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 640px) {
    padding: 6px 10px;
    font-size: 12px;
  }
`;

/**
 * Enhanced ProductList Component
 * Display products in a grid with advanced filtering and pagination
 * 
 * Features:
 * - Desktop sidebar filters
 * - Mobile filter drawer
 * - Desktop and mobile pagination
 * - Skeleton loading states
 * - Category, status, price, and sort filters
 * - Responsive design
 */
const ProductList = ({
  products = [],
  isLoading = false,
  error = null,
  pagination = {},
  onPageChange = () => {},
  onFilterChange = () => {},
  onAddToCart = () => {},
  onWishlist = () => {},
  showFilters = true,
  canAddToCart = true,
  categories = [],
  minPrice = 0,
  maxPrice = 1000,
  sort = '-createdAt',
}) => {
  const [filters, setFilters] = useState({
    status: 'active',
    sort: sort,
    category: '',
    minPrice: minPrice,
    maxPrice: maxPrice,
  });
  
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Handle single filter change
  const handleFilterChange = (e) => {
    if (typeof e === 'object' && e.target) {
      // From select element
      const { name, value } = e.target;
      const newFilters = { ...filters, [name]: value };
      setFilters(newFilters);
      onFilterChange(newFilters);
    } else {
      // From direct update (price range, etc)
      const newFilters = { ...filters, ...e };
      setFilters(newFilters);
      onFilterChange(newFilters);
    }
  };

  // Handle price change from slider
  const handlePriceChange = (min, max) => {
    const newFilters = { ...filters, minPrice: min, maxPrice: max };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Handle mobile filter apply
  const handleMobileFilterApply = (mobileFilters) => {
    setFilters(mobileFilters);
    onFilterChange(mobileFilters);
    setIsMobileFilterOpen(false);
  };

  // Handle mobile filter clear
  const handleMobileFilterClear = () => {
    const cleared = {
      status: 'active',
      sort: 'createdAt',
      category: '',
      minPrice: minPrice,
      maxPrice: maxPrice,
    };
    setFilters(cleared);
    onFilterChange(cleared);
  };

  // Loading state with skeleton cards
  if (isLoading) {
    return (
      <ListContainer>
        <FiltersAndGridWrapper>
          <DesktopFilterSidebar style={{ visibility: 'hidden' }} />
          <GridLayout>
            {Array.from({ length: 12 }).map((_, i) => (
              <ProductCardSkeleton key={i} />
            ))}
          </GridLayout>
        </FiltersAndGridWrapper>
      </ListContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <ListContainer>
        <EmptyState>
          <h3>⚠️ Error loading products</h3>
          <p>{error.message || 'Something went wrong. Please try again.'}</p>
        </EmptyState>
      </ListContainer>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <ListContainer>
        <EmptyState>
          <h3>No products found</h3>
          <p>Try adjusting your filters or search criteria</p>
        </EmptyState>
      </ListContainer>
    );
  }

  return (
    <ListContainer>
      <FiltersAndGridWrapper>
        {/* Desktop Sidebar Filters */}
        {showFilters && (
          <DesktopFilterSidebar>
            {/* Status Filter */}
            <FilterSection>
              <FilterLabel htmlFor="desktop-status">Status</FilterLabel>
              <FilterSelect
                id="desktop-status"
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
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
                <FilterLabel htmlFor="desktop-category">Category</FilterLabel>
                <FilterSelect
                  id="desktop-category"
                  name="category"
                  value={filters.category}
                  onChange={handleFilterChange}
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
                minPrice={filters.minPrice}
                maxPrice={filters.maxPrice}
                onPriceChange={handlePriceChange}
                label="Price Range"
              />
            </FilterSection>
          </DesktopFilterSidebar>
        )}

        {/* Grid Content */}
        <GridContentWrapper>
          {/* Mobile Filter Bar */}
          <FilterBarMobile>
            <FilterButton
              onClick={() => setIsMobileFilterOpen(true)}
              aria-label="Open filters"
            >
              <Sliders />
              Filters
            </FilterButton>
            <SortSelect
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
              aria-label="Sort by"
            >
              <option value="-createdAt">Newest First</option>
              <option value="createdAt">Oldest First</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
              <option value="-name">Name: Z to A</option>
              <option value="-stock">Most Stock</option>
              <option value="stock">Least Stock</option>
            </SortSelect>
          </FilterBarMobile>

          {/* Products Grid */}
          <GridLayout>
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
                showActions={canAddToCart}
                onAddToCart={() => onAddToCart(product._id)}
                onWishlist={() => onWishlist(product._id)}
              />
            ))}
          </GridLayout>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <PaginationContainer>
              <PaginationButton
                disabled={pagination.page === 1}
                onClick={() => onPageChange(pagination.page - 1)}
                aria-label="Previous page"
              >
                ← Previous
              </PaginationButton>

              {Array.from({ length: pagination.totalPages }, (_, i) => i + 1)
                .filter((pageNum) => {
                  // On mobile, show current page ± 1
                  if (typeof window !== 'undefined' && window.innerWidth < 640) {
                    return (
                      pageNum === pagination.page ||
                      pageNum === pagination.page - 1 ||
                      pageNum === pagination.page + 1
                    );
                  }
                  // On desktop, show all pages
                  return true;
                })
                .map((pageNum, idx, arr) => {
                  // Add ellipsis if gap detected
                  if (
                    idx > 0 &&
                    arr[idx - 1] !== pageNum - 1 &&
                    pageNum > 1
                  ) {
                    return (
                      <span
                        key={`ellipsis-${pageNum}`}
                        style={{ padding: '0 4px', color: '#9ca3af' }}
                      >
                        ...
                      </span>
                    );
                  }

                  return (
                    <PaginationButton
                      key={pageNum}
                      active={pageNum === pagination.page}
                      onClick={() => onPageChange(pageNum)}
                      aria-label={`Go to page ${pageNum}`}
                      aria-current={pageNum === pagination.page ? 'page' : undefined}
                    >
                      {pageNum}
                    </PaginationButton>
                  );
                })}

              <PaginationButton
                disabled={pagination.page === pagination.totalPages}
                onClick={() => onPageChange(pagination.page + 1)}
                aria-label="Next page"
              >
                Next →
              </PaginationButton>
            </PaginationContainer>
          )}
        </GridContentWrapper>
      </FiltersAndGridWrapper>

      {/* Mobile Filter Drawer */}
      {showFilters && (
        <MobileFilterDrawer
          isOpen={isMobileFilterOpen}
          onClose={() => setIsMobileFilterOpen(false)}
          filters={filters}
          onFilterChange={handleFilterChange}
          categories={categories}
          onApply={handleMobileFilterApply}
          onClear={handleMobileFilterClear}
          minPrice={minPrice}
          maxPrice={maxPrice}
        />
      )}
    </ListContainer>
  );
};

export default ProductList;
