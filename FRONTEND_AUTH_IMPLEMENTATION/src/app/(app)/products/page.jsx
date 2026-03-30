'use client';

import { useState, useEffect, useMemo, useRef, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import styled from 'styled-components';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';
import { useCategories } from '@/hooks/useCategories';
import ProductList from '@/components/products/ProductList';
import SearchBar from '@/components/products/SearchBar';

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
  margin: 0 0 24px;
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
 * Products Listing Page (Enhanced)
 * 
 * Features:
 * - Search bar with category suggestions
 * - Sidebar filters (desktop)
 * - Mobile filter drawer
 * - Advanced filtering (status, category, price)
 * - URL state persistence (bookmark & share filtered views)
 * - Product grid with pagination
 * - Skeleton loading states
 * - Add to cart integration
 * 
 * URL Query Parameters:
 * - ?page=1 - Current page number
 * - ?search=iPhone - Search query
 * - ?status=active - Product status filter
 * - ?category=Electronics - Category filter
 * - ?minPrice=100 - Min price filter
 * - ?maxPrice=900 - Max price filter
 * 
 * Example: /products?search=iPhone&category=Electronics&maxPrice=900&page=1
 */
function ProductsPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // ⚠️ IMPORTANT: useSearchParams() can be empty on initial render in Next.js 13+
  // We need to track hydration and prevent URL sync loops during initial mount
  const [isHydrated, setIsHydrated] = useState(false);
  const isInitialMount = useRef(true);

  // Initialize state from URL query parameters
  // Note: We'll sync these after hydration to avoid empty params on first render
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('-createdAt');
  const [filters, setFilters] = useState({
    status: '',
    category: '',
    minPrice: 0,
    maxPrice: 1000,
  });

  // Sync state with URL search params AFTER hydration (ONLY on first mount)
  useEffect(() => {
    if (!isInitialMount.current) return; // Only run on initial mount
    
    // Mark as hydrated - now searchParams should be available
    setIsHydrated(true);

    // Parse search params and update state
    const newPage = parseInt(searchParams.get('page') || '1');
    const newSearch = searchParams.get('search') || '';
    const newSort = searchParams.get('sort') || '-createdAt';
    const newFilters = {
      status: searchParams.get('status') || '',
      category: searchParams.get('category') || '',
      minPrice: parseInt(searchParams.get('minPrice') || '0'),
      maxPrice: parseInt(searchParams.get('maxPrice') || '1000'),
    };

    console.log('🔄 Hydration - Syncing state from URL params:', {
      page: newPage,
      search: newSearch,
      sort: newSort,
      filters: newFilters,
    });

    setPage(newPage);
    setSearch(newSearch);
    setSort(newSort);
    setFilters(newFilters);
    
    // Mark that initial mount is complete to prevent re-running
    isInitialMount.current = false;
  }, []); // Empty deps - only run once on mount

  // Products query with all filters
  // ⚠️ IMPORTANT: Only run query AFTER hydration to ensure params are correct
  const params = useMemo(() => ({
    page,
    limit: 12,
    status: filters.status || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
    search: search || undefined,
    sort: sort || '-createdAt',
  }), [page, filters, search, sort]);

  // Use conditional to skip query until hydration complete
  // ✅ Only enable query after hydration to avoid empty params on first render
  const { data, isLoading, error } = useProducts(params, {
    enabled: isHydrated,
  });

  // Fetch categories from backend
  const { data: categoriesData = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  // Cart integration
  const { addToCart } = useAddToCart();
  const { success, error: showError } = useToast();

  // Get React Query client for cache management
  const queryClient = useQueryClient();

  // Invalidate and refetch when URL filter parameters change
  // This ensures fresh data when user navigates back with filter params or changes filters
  // ⚠️ Only run AFTER hydration is complete
  useEffect(() => {
    if (!isHydrated) return; // Skip until hydration complete

    // Invalidate the products query to trigger immediate refetch
    queryClient.invalidateQueries({
      queryKey: ['products', 'list', params],
    });
    
    console.log('🔄 Products query invalidated for params:', {
      page: params.page,
      category: params.category,
      minPrice: params.minPrice,
      maxPrice: params.maxPrice,
      search: params.search,
      sort: params.sort,
    });
  }, [page, filters, search, sort, queryClient, isHydrated]); // Watch actual state changes + hydration

  // Format categories from backend API - MOVED HERE to avoid temporal dead zone
  // Must be defined before useEffect that references it
  const formattedCategories = useMemo(() => {
    if (!Array.isArray(categoriesData)) return [];
    
    return categoriesData
      .filter(cat => cat.isActive !== false) // Show only active categories
      .map(cat => ({
        ...cat,
        displayLabel: cat.displayName || cat.name, // Label for dropdown display
      }))
      .sort((a, b) => {
        // Sort by sortOrder first, then by displayLabel
        if (a.sortOrder !== b.sortOrder) {
          return (a.sortOrder || 0) - (b.sortOrder || 0);
        }
        return (a.displayLabel || '').localeCompare(b.displayLabel || '');
      });
  }, [categoriesData]);

  // Update URL when page or filters change
  // ⚠️ Skip first update during hydration and initial state setup
  useEffect(() => {
    // Don't sync URL until we've finished the initial hydration
    // isInitialMount will be false after the hydration effect runs
    if (isInitialMount.current) return;

    const queryParams = new URLSearchParams();
    
    if (page !== 1) queryParams.set('page', page.toString());
    if (search) queryParams.set('search', search);
    if (filters.status) queryParams.set('status', filters.status);
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.minPrice > 0) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 1000) queryParams.set('maxPrice', filters.maxPrice.toString());
    if (sort && sort !== '-createdAt') queryParams.set('sort', sort);

    const queryString = queryParams.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    
    console.log('🔗 URL Sync - Updating URL to:', newUrl);
    router.push(newUrl, { scroll: false });
  }, [page, filters, search, sort, router]); // Remove isHydrated, use isInitialMount instead

  // Debug logging
  useEffect(() => {
    console.log('📦 Products Page Query State:', {
      isHydrated, // ✅ Log hydration status
      isLoading,
      hasError: !!error,
      errorMessage: error?.message || null,
      responseDataKeys: data ? Object.keys(data) : [],
      hasProductsArray: !!data?.data,
      productsCount: data?.data?.length || 0,
      paginationInfo: data?.pagination,
      currentFilters: {
        page,
        search,
        status: filters.status,
        category: filters.category,
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        sort,
      },
    });
    
    // Log if products are empty but data exists
    if (!isLoading && data && data?.data?.length === 0) {
      console.warn('⚠️ WARNING: Query returned no products with current filters:', {
        appliedFilters: Object.entries(filters).filter(([, v]) => v),
        totalItemsFromPagination: data?.pagination?.totalItems,
      });
    }
  }, [data, isLoading, error, filters, search, page, sort, isHydrated]);

  // Debug categories loading
  useEffect(() => {
    console.log('📂 Categories State:', {
      isLoading: categoriesLoading,
      hasError: !!categoriesError,
      errorMessage: categoriesError?.message || null,
      totalCategories: categoriesData?.length || 0,
      categoriesData: categoriesData?.map(cat => ({ 
        _id: cat._id,
        name: cat.name,
        displayName: cat.displayName,
        isActive: cat.isActive,
        sortOrder: cat.sortOrder
      })) || [],
      formattedCount: formattedCategories?.length || 0,
      selectedCategory: filters.category,
    });
  }, [categoriesData, formattedCategories, categoriesLoading, categoriesError, filters.category]);

  const pagination = {
    page: data?.pagination?.currentPage || 1,
    totalPages: data?.pagination?.totalPages || 1,
    totalItems: data?.pagination?.totalItems || 0,
    limit: data?.pagination?.itemsPerPage || 12,
  };

  // Get price range from products
  const priceRange = useMemo(() => {
    if (!data?.data || data.data.length === 0) {
      return { min: 0, max: 1000 };
    }
    const prices = data.data.map(p => p.price);
    return {
      min: Math.floor(Math.min(...prices) / 10) * 10,
      max: Math.ceil(Math.max(...prices) / 10) * 10,
    };
  }, [data]);

  const handlePageChange = (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (newFilters) => {
    // Extract sort if present, handle separately
    const { sort: newSort, ...filterData } = newFilters;
    setFilters(filterData);
    if (newSort && newSort !== sort) {
      setSort(newSort);
    }
    setPage(1); // Reset to page 1 when filters change
  };

  const handleSearch = (searchQuery) => {
    setSearch(searchQuery);
    setPage(1); // Reset to page 1 when search changes
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
  };

  // Show loading state while hydrating (syncing search params from URL)
  if (!isHydrated) {
    return (
      <PageContainer>
        <PageHeader>
          <Title>Our Products</Title>
          <Subtitle>Loading filters...</Subtitle>
        </PageHeader>
        <ContentContainer>
          <p style={{ textAlign: 'center', color: '#6b7280' }}>Initializing page with your filters...</p>
        </ContentContainer>
      </PageContainer>
    );
  }

  // Show error if query failed
  if (error && !isLoading) {
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
  }

  return (
    <PageContainer>
      <PageHeader>
        <Title>Our Products</Title>
        <Subtitle>
          Browse our collection of {pagination.totalItems || 0} products
        </Subtitle>
      </PageHeader>

      <ContentContainer>
        {/* Search Bar with Category Suggestions */}
        <SearchBar
          value={search}
          onChange={setSearch}
          onSearch={handleSearch}
          suggestions={formattedCategories.map(cat => cat.displayLabel)}
          placeholder="Search products by name, category..."
        />

        {/* Product List with Filters */}
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
          categories={formattedCategories}
          minPrice={priceRange.min}
          maxPrice={priceRange.max}
          sort={sort}
        />
      </ContentContainer>
    </PageContainer>
  );
}

export default function ProductsPage() {
  return (
    <Suspense fallback={null}>
      <ProductsPageInner />
    </Suspense>
  );
}
