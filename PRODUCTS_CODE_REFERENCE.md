# Products Implementation - Complete Code Reference

## Table of Contents
1. Main Products Page
2. Product Detail Page  
3. ProductCard Component
4. ProductList Component
5. ProductDetail Component
6. useProducts Hook
7. useCart Hook
8. Product Service

---

## 1. Main Products Page
**File:** `src/app/(app)/products/page.jsx`

```jsx
'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';
import ProductList from '@/components/products/ProductList';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 20px;
`;

const PageHeader = styled.div`
  max-width: 1400px;
  margin: 0 auto 32px;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const ErrorAlert = styled.div`
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px;
  margin: 20px 0;
`;

const ErrorTitle = styled.h2`
  color: #991b1b;
  font-size: 18px;
  font-weight: 600;
  margin: 0 0 8px;
`;

const ErrorMessage = styled.p`
  color: #7f1d1d;
  font-size: 14px;
  margin: 0 0 12px;
`;

const ErrorDetails = styled.div`
  background: rgba(0, 0, 0, 0.05);
  border-radius: 4px;
  padding: 12px;
  font-family: monospace;
  font-size: 12px;
  color: #374151;

  p {
    margin: 4px 0;
  }
`;

/**
 * Products Listing Page
 * Display all products with filtering and pagination
 * Integrated with shopping cart system
 */
export default function ProductsPage() {
  const [page, setPage] = useState(1);
  const [filters, setFilters] = useState({
    status: 'active',
  });

  // Products query
  const params = {
    page,
    limit: 12,
    ...filters,
  };

  const { data, isLoading, error } = useProducts(params);

  // Cart integration
  const { addToCart, isLoading: isAddingToCart } = useAddToCart();
  const { success, error: showError } = useToast();

  // Debug logging
  useEffect(() => {
    console.log('📦 Products Query State:', {
      isLoading,
      error: error?.message || null,
      hasData: !!data,
      productsCount: data?.data?.length || 0,
      pagination: data?.pagination,
    });
  }, [data, isLoading, error]);

  const pagination = {
    page: data?.pagination?.currentPage || 1,
    totalPages: data?.pagination?.totalPages || 1,
    totalItems: data?.pagination?.totalItems || 0,
    limit: data?.pagination?.itemsPerPage || 12,
  };

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const handleAddToCart = async (productId) => {
    try {
      await addToCart(productId, 1);
      success('Added to cart!');
    } catch (err) {
      showError(err.message || 'Failed to add item to cart');
      console.error('❌ Add to cart error:', err);
    }
  };

  const handleWishlist = async (productId) => {
    // TODO: Implement wishlist functionality
    console.log('📌 Wishlist feature coming soon:', productId);
    // success('Added to wishlist!');
  };

  // Show error if query failed
  if (error) {
    return (
      <PageContainer>
        <PageHeader>
          <Title>Our Products</Title>
        </PageHeader>
        <ContentContainer>
          <ErrorAlert>
            <ErrorTitle>Failed to Load Products</ErrorTitle>
            <ErrorMessage>{error.message}</ErrorMessage>
            <ErrorDetails>
              <p>Status: {error.response?.status}</p>
              <p>Make sure the backend API is running on http://localhost:5000</p>
            </ErrorDetails>
          </ErrorAlert>
        </ContentContainer>
      </PageContainer>
    );
  };

  return (
    <PageContainer>
      <PageHeader>
        <Title>Our Products</Title>
        <Subtitle>
          Browse our collection of {pagination.totalItems || 0} products
        </Subtitle>
      </PageHeader>

      <ContentContainer>
        <ProductList
          products={data?.data || []}
          isLoading={isLoading}
          error={error}
          pagination={pagination}
          onPageChange={handlePageChange}
          onFilterChange={handleFilterChange}
          onAddToCart={handleAddToCart}
          onWishlist={handleWishlist}
          showFilters={true}
          canAddToCart={true}
        />
      </ContentContainer>
    </PageContainer>
  );
}
```

---

## 2. Product Detail Page
**File:** `src/app/(app)/products/[id]/page.jsx`

```jsx
'use client';

import { use } from 'react';
import styled from 'styled-components';
import ProductDetail from '@/components/products/ProductDetail';
import ProductList from '@/components/products/ProductList';
import { useProductDetail, useRelatedProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding: 40px 20px;

  @media (max-width: 640px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const RelatedSection = styled.div`
  margin-top: 60px;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 12px;

  @media (max-width: 640px) {
    margin-top: 40px;
    padding: 24px 16px;
    border-radius: 8px;
  }

  @media (max-width: 480px) {
    margin-top: 24px;
    padding: 16px 12px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;

  @media (max-width: 640px) {
    font-size: 20px;
    margin: 0 0 16px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin: 0 0 12px;
  }
`;

const BreadcrumbNav = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  color: #6b7280;

  a {
    color: #5b4dff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }

  @media (max-width: 640px) {
    font-size: 12px;
    margin-bottom: 20px;
  }
`;

/**
 * Product Detail Page
 * Display details of a single product with related products
 * Integrated with shopping cart system
 */
export default function ProductDetailPage({ params }) {
  const { id } = use(params);

  const {
    data: product,
    isLoading,
    error,
  } = useProductDetail(id);

  const {
    data: relatedProducts,
    isLoading: relatedLoading,
  } = useRelatedProducts(id, 4);

  // Cart integration
  const { addToCart, isLoading: isAddingToCart } = useAddToCart();
  const { success, error: showError } = useToast();

  // Debug logging
  console.log('📦 Product Detail Page:', {
    id,
    isLoading,
    error: error?.message || null,
    hasProduct: !!product,
    productData: product,
  });

  if (error) {
    return (
      <PageContainer>
        <ContentWrapper>
          <h1>❌ Error Loading Product</h1>
          <p>{error.message}</p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
            Product ID: {id}
          </p>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Handle add to cart
  const handleAddToCart = async (cartData) => {
    try {
      const { productId, quantity, selectedVariants } = cartData;

      console.log('🛒 Adding to cart:', {
        productId,
        quantity,
        selectedVariants,
      });

      await addToCart(productId, quantity, selectedVariants);

      success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      showError(err.message || 'Failed to add product to cart');
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Breadcrumb */}
        <BreadcrumbNav>
          <a href="/products">Products</a>
          <span>/</span>
          {product && <span>{product.name}</span>}
        </BreadcrumbNav>

        {/* Product Detail */}
        <ProductDetail
          product={product}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedSection>
            <SectionTitle>Related Products</SectionTitle>
            <ProductList
              products={relatedProducts}
              isLoading={relatedLoading}
              pagination={{}}
              showFilters={false}
              canAddToCart={true}
            />
          </RelatedSection>
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
```

---

## 3. ProductCard Component
**File:** `src/components/products/ProductCard.jsx`

```jsx
'use client';

import styled from 'styled-components';
import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ShoppingCart, Heart, Eye } from 'lucide-react';

const CardContainer = styled(motion.div)`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
    transform: translateY(-4px);
  }
`;

const ImageContainer = styled.div`
  position: relative;
  width: 100%;
  aspect-ratio: 1;
  background: #f3f4f6;
  overflow: hidden;

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
`;

const BadgeContainer = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  display: flex;
  gap: 8px;
`;

const Badge = styled.span`
  background: ${(props) => {
    switch (props.type) {
      case 'featured':
        return '#fbbf24';
      case 'sale':
        return '#ef4444';
      case 'new':
        return '#10b981';
      default:
        return '#6b7280';
    }
  }};
  color: white;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
`;

const StatusBadge = styled.div`
  position: absolute;
  bottom: 12px;
  left: 12px;
  background: ${(props) => {
    if (props.status === 'out_of_stock') return '#ef4444';
    if (props.stock === 0) return '#ef4444';
    return '#10b981';
  }};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
`;

const ActionButtons = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(to top, rgba(0, 0, 0, 0.8), transparent);
  padding: 20px 12px 12px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;

  ${CardContainer}:hover & {
    opacity: 1;
    transform: translateY(0);
  }
`;

const ActionButton = styled.button`
  flex: 1;
  background: ${(props) => (props.variant === 'primary' ? '#5b4dff' : 'rgba(255,255,255,0.2)')};
  color: white;
  border: none;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s;

  &:hover {
    background: ${(props) => (props.variant === 'primary' ? '#4c3fcc' : 'rgba(255,255,255,0.3)')};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ContentContainer = styled.div`
  padding: 16px;
`;

const Category = styled.p`
  font-size: 12px;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 6px;
`;

const ProductName = styled(Link)`
  display: block;
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 8px 0;
  text-decoration: none;
  line-height: 1.4;

  &:hover {
    color: #5b4dff;
  }
`;

const Description = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 8px 0;
  min-height: 36px;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const PriceContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 12px 0;
`;

const Price = styled.span`
  font-size: 20px;
  font-weight: 700;
  color: #1f2937;
`;

const OriginalPrice = styled.span`
  font-size: 14px;
  color: #9ca3af;
  text-decoration: line-through;
`;

const StockInfo = styled.p`
  font-size: 12px;
  color: ${(props) => (props.lowStock ? '#ef4444' : '#6b7280')};
  font-weight: ${(props) => (props.lowStock ? 600 : 400)};
  margin: 0;
`;

const VariantsContainer = styled.div`
  display: flex;
  gap: 6px;
  margin: 8px 0;
  flex-wrap: wrap;
`;

const VariantChip = styled.span`
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  color: #6b7280;
`;

/**
 * ProductCard Component
 * Reusable card component for displaying product information
 * @param {Object} props - Component props
 * @param {Object} props.product - Product data
 * @param {boolean} props.showActions - Show action buttons
 * @param {Function} props.onAddToCart - Add to cart callback
 * @param {Function} props.onWishlist - Wishlist callback
 */
const ProductCard = ({
  product,
  showActions = true,
  onAddToCart,
  onWishlist,
  ...rest
}) => {
  const {
    _id,
    name,
    description,
    price,
    images,
    stock,
    status,
    category,
    isFeatured,
    variants,
  } = product;

  const isOutOfStock = status === 'out_of_stock' || stock === 0;
  const lowStock = stock > 0 && stock < 5;

  return (
    <CardContainer
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.3 }}
      {...rest}
    >
      {/* Image Section */}
      <ImageContainer>
        <Image
          src={images?.[0] || '/images/placeholder-product.jpg'}
          alt={name}
          fill
          style={{ objectFit: 'cover' }}
        />

        {/* Badges */}
        <BadgeContainer>
          {isFeatured && <Badge type="featured">Featured</Badge>}
        </BadgeContainer>

        {/* Status Badge */}
        <StatusBadge status={status} stock={stock}>
          {isOutOfStock ? 'OUT OF STOCK' : 'IN STOCK'}
        </StatusBadge>

        {/* Action Buttons */}
        {showActions && !isOutOfStock && (
          <ActionButtons>
            <ActionButton
              variant="primary"
              onClick={onAddToCart}
              title="Add to cart"
            >
              <ShoppingCart />
              Add
            </ActionButton>
            <ActionButton onClick={onWishlist} title="Add to wishlist">
              <Heart />
            </ActionButton>
            <ActionButton
              as={Link}
              href={`/products/${_id}`}
              title="View details"
              style={{ textDecoration: 'none' }}
            >
              <Eye />
            </ActionButton>
          </ActionButtons>
        )}
      </ImageContainer>

      {/* Content Section */}
      <ContentContainer>
        {category && <Category>{category}</Category>}

        <ProductName href={`/products/${_id}`}>{name}</ProductName>

        {description && <Description>{description}</Description>}

        {/* Variants */}
        {variants && variants.length > 0 && (
          <VariantsContainer>
            {variants.map((variant, idx) => (
              <VariantChip key={idx}>
                {variant.name}: {variant.options.slice(0, 2).join(', ')}
                {variant.options.length > 2 ? '...' : ''}
              </VariantChip>
            ))}
          </VariantsContainer>
        )}

        {/* Price */}
        <PriceContainer>
          <Price>${price.toFixed(2)}</Price>
        </PriceContainer>

        {/* Stock Info */}
        <StockInfo lowStock={lowStock}>
          {isOutOfStock
            ? 'Out of stock'
            : lowStock
              ? `Only ${stock} left`
              : `${stock} in stock`}
        </StockInfo>
      </ContentContainer>
    </CardContainer>
  );
};

export default ProductCard;
```

---

## 4. ProductList Component
**File:** `src/components/products/ProductList.jsx`

```jsx
'use client';

import styled from 'styled-components';
import ProductCard from './ProductCard';
import { useState } from 'react';

const ListContainer = styled.div`
  width: 100%;
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

  svg {
    width: 80px;
    height: 80px;
    color: #d1d5db;
    margin-bottom: 16px;
  }

  h3 {
    font-size: 18px;
    color: #1f2937;
    margin: 0;
  }

  p {
    color: #6b7280;
    margin: 8px 0 0;
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

  &:hover:not(:disabled) {
    border-color: #5b4dff;
    background: ${(props) => (props.active ? '#4c3fcc' : '#f3f4f6')};
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const FilterBar = styled.div`
  display: flex;
  gap: 16px;
  margin-bottom: 24px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const FilterLabel = styled.label`
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  color: #1f2937;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

/**
 * ProductList Component
 * Display products in a grid with filtering and pagination
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
}) => {
  const [filters, setFilters] = useState({
    status: 'active',
    sort: 'createdAt',
  });

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  // Loading state
  if (isLoading) {
    return (
      <LoadingContainer>
        <Spinner />
        <p>Loading products...</p>
      </LoadingContainer>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState>
        <h3>⚠️ Error loading products</h3>
        <p>{error.message || 'Something went wrong'}</p>
      </EmptyState>
    );
  }

  // Empty state
  if (!products || products.length === 0) {
    return (
      <EmptyState>
        <h3>No products found</h3>
        <p>Try adjusting your filters or search criteria</p>
      </EmptyState>
    );
  }

  return (
    <ListContainer>
      {/* Filter Bar */}
      {showFilters && (
        <FilterBar>
          <FilterGroup>
            <FilterLabel htmlFor="status-filter">Status</FilterLabel>
            <FilterSelect
              id="status-filter"
              name="status"
              value={filters.status}
              onChange={handleFilterChange}
            >
              <option value="">All</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </FilterSelect>
          </FilterGroup>

          <FilterGroup>
            <FilterLabel htmlFor="sort-filter">Sort By</FilterLabel>
            <FilterSelect
              id="sort-filter"
              name="sort"
              value={filters.sort}
              onChange={handleFilterChange}
            >
              <option value="createdAt">Newest</option>
              <option value="-createdAt">Oldest</option>
              <option value="price">Price: Low to High</option>
              <option value="-price">Price: High to Low</option>
              <option value="name">Name: A to Z</option>
            </FilterSelect>
          </FilterGroup>
        </FilterBar>
      )}

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
          >
            ← Previous
          </PaginationButton>

          {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
            (pageNum) => (
              <PaginationButton
                key={pageNum}
                active={pageNum === pagination.page}
                onClick={() => onPageChange(pageNum)}
              >
                {pageNum}
              </PaginationButton>
            )
          )}

          <PaginationButton
            disabled={pagination.page === pagination.totalPages}
            onClick={() => onPageChange(pagination.page + 1)}
          >
            Next →
          </PaginationButton>
        </PaginationContainer>
      )}
    </ListContainer>
  );
};

export default ProductList;
```

---

## 5. useProducts Hook
**File:** `src/hooks/useProducts.js`

```javascript
/**
 * Product Hooks
 * React Query hooks for fetching and mutating product data
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productService } from '@/api/services/productService';

// Query keys for React Query cache
export const productQueryKeys = {
  all: ['products'],
  list: (filters) => ['products', 'list', filters],
  featured: ['products', 'featured'],
  search: (query) => ['products', 'search', query],
  detail: (id) => ['products', 'detail', id],
  related: (id) => ['products', 'related', id],
};

/**
 * Hook: Get all products with pagination and filtering
 * @param {Object} params - Query parameters
 * @param {Object} options - React Query options
 */
export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes (was cacheTime)
    retry: 2,
    ...options,
  });
};

/**
 * Hook: Get featured products
 * @param {number} limit - Number of products
 * @param {Object} options - React Query options
 */
export const useFeaturedProducts = (limit = 6, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.featured,
    queryFn: () => productService.getFeaturedProducts(limit),
    staleTime: 10 * 60 * 1000, // 10 minutes
    gcTime: 15 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

/**
 * Hook: Search products
 * @param {string} query - Search query
 * @param {Object} params - Additional params
 * @param {Object} options - React Query options
 */
export const useSearchProducts = (query, params = {}, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.search(query),
    queryFn: () => productService.searchProducts(query, params),
    enabled: !!query && query.length > 0, // Only run if query exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 1,
    ...options,
  });
};

/**
 * Hook: Get single product details
 * @param {string} productId - Product ID
 * @param {Object} options - React Query options
 */
export const useProductDetail = (productId, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId, // Only run if ID exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
    ...options,
  });
};

/**
 * Hook: Get related products
 * @param {string} productId - Product ID
 * @param {number} limit - Number of related products
 * @param {Object} options - React Query options
 */
export const useRelatedProducts = (productId, limit = 4, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.related(productId),
    queryFn: () => productService.getRelatedProducts(productId, limit),
    enabled: !!productId,
    staleTime: 10 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 1,
    ...options,
  });
};
```

---

**Document continues with remaining code files in the production repo...**

Last Updated: March 16, 2026
