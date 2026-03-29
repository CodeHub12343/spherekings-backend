# Frontend Codebase Structure Exploration

**Last Updated**: March 25, 2026  
**Purpose**: Complete reference guide for implementing Influencer & Sponsorship features

---

## 1. DIRECTORY STRUCTURE

### Root Structure
```
FRONTEND_AUTH_IMPLEMENTATION/
├── src/
│   ├── app/                 # Next.js App Router (Route Groups)
│   ├── components/          # Reusable React components
│   ├── api/                 # API services & configuration
│   ├── hooks/               # Custom React hooks
│   ├── stores/              # Zustand state management
│   ├── contexts/            # React Context providers
│   ├── styles/              # Global styling
│   ├── utils/               # Utility functions
│   ├── config/              # Configuration files
│   ├── lib/                 # Helper libraries
│   └── sections/            # Page sections/organisms
├── public/                  # Static assets
├── next.config.mjs          # Next.js config
└── jsconfig.json            # JS config with path aliases
```

### App Router Structure (Next.js)
```
src/app/
├── layout.jsx               # Root layout (Providers wrapper)
├── page.jsx                 # Home page
├── providers.jsx            # QueryClient & Theme provider setup
│
├── (auth)/                  # Auth route group
│   ├── layout.jsx           # Auth layout (minimal header)
│   ├── login/page.jsx
│   ├── register/page.jsx
│   ├── forgot-password/page.jsx
│   └── reset-password/[token]/page.jsx
│
├── (app)/                   # Main app route group (authenticated)
│   ├── layout.jsx           # App layout with Header
│   ├── dashboard/page.jsx
│   ├── products/
│   │   ├── page.jsx         # Product listing
│   │   └── [id]/page.jsx    # Product detail
│   ├── cart/page.jsx
│   ├── checkout/page.jsx
│   ├── orders/page.jsx
│   ├── profile/
│   │   ├── layout.jsx
│   │   └── orders/page.jsx
│   └── leaderboard/page.jsx
│
├── (admin)/                 # Admin route group (role-based)
│   ├── layout.jsx           # Admin layout with sidebar
│   └── admin/
│       ├── dashboard/page.jsx
│       ├── products/
│       │   ├── page.jsx     # Product management list
│       │   ├── new/page.jsx # Create product
│       │   └── [id]/
│       │       └── edit/page.jsx
│       ├── orders/page.jsx
│       ├── payouts/page.jsx
│       ├── commissions/page.jsx
│       └── affiliates/page.jsx
│
└── (affiliate)/             # Affiliate route group (role-based)
    ├── layout.jsx
    └── affiliate/
        ├── dashboard/page.jsx
        ├── register/page.jsx
        ├── referrals/page.jsx
        ├── payouts/page.jsx
        ├── settings/page.jsx
        └── leaderboard/page.jsx
```

### Components Directory Structure
```
src/components/
├── ui/                      # Shadcn-style base UI components
│   ├── Button.jsx
│   ├── Input.jsx
│   ├── Card.tsx
│   ├── Dialog.tsx
│   ├── Toast.tsx
│   └── ... (40+ UI components)
│
├── layout/                  # Layout components
│   ├── Header.jsx
│   ├── AdminSidebar.jsx
│   ├── Footer.jsx
│   └── Navigation.jsx
│
├── products/                # Product-related components
│   ├── ProductList.jsx
│   ├── ProductCard.jsx
│   ├── ProductForm.jsx
│   ├── ProductDetail.jsx
│   └── SearchBar.jsx
│
├── admin/                   # Admin dashboard components
│   ├── AdminStatsCards.jsx
│   ├── Charts.jsx
│   ├── ProductsTable.jsx
│   ├── OrdersTable.jsx
│   ├── AffiliatesTable.jsx
│   └── DateRangeFilter.jsx
│
├── affiliate/               # Affiliate system components
│   ├── ReferralLinkCard.jsx
│   ├── CommissionSummaryCard.jsx
│   ├── AffiliateSalesTable.jsx
│   ├── AffiliateAnalyticsCharts.jsx
│   ├── PayoutSettingsForm.jsx
│   └── LeaderboardTable.jsx
│
├── checkout/                # Checkout components
│   ├── CheckoutSummary.jsx
│   ├── CheckoutButton.jsx
│   └── OrderConfirmationCard.jsx
│
├── cart/                    # Cart components
│   ├── CartSummary.jsx
│   ├── CartItem.jsx
│   └── CartDrawer.jsx
│
├── commissions/             # Commission tracking components
│   └── ... (approval, detail components)
│
├── orders/                  # Order management components
│   └── ... (order list, detail components)
│
├── payouts/                 # Payout system components
│   └── ... (payout list, request components)
│
├── referrals/               # Referral tracking components
│   └── ... (referral list, tracker components)
│
├── leaderboard/             # Leaderboard components
│   └── ... (leaderboard display components)
│
├── common/                  # Common reusable components
│   ├── ConfirmDialog.jsx
│   ├── LoadingSpinner.jsx
│   └── ErrorBoundary.jsx
│
└── ProtectedRoute.jsx       # Route protection wrapper
```

---

## 2. EXISTING PATTERNS

### 2.1 Route Groups & Page Structure

**Pattern**: Next.js route groups `(name)` organize routes:
- Route groups don't affect URL paths
- Each group can have its own `layout.jsx`
- Create distinct layouts per user role/section

**Examples**:
```jsx
// (app)/layout.jsx - App layout with Header
export default function AppLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <AppLayoutContainer>
      <Header />
      <AppContent>{children}</AppContent>
    </AppLayoutContainer>
  );
}

// (admin)/layout.jsx - Admin layout with sidebar
export default function AdminLayout({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  return (
    <AdminLayoutContainer>
      <SidebarWrapper>
        <AdminSidebar />
      </SidebarWrapper>
      <MainContent>
        <Header />
        <ContentArea>{children}</ContentArea>
      </MainContent>
    </AdminLayoutContainer>
  );
}
```

### 2.2 API Service Pattern

**Pattern**: Service files in `/api/services/` for API calls
- One service file per feature (authService, productService, etc.)
- Uses Axios client with JWT interceptor
- Returns standardized responses
- Detailed logging for debugging

**Example**:
```javascript
// api/services/productService.js
import client from '@/api/client';

const PRODUCT_ENDPOINTS = {
  LIST: '/products',
  DETAIL: (id) => `/products/${id}`,
  CREATE: '/products',
  UPDATE: (id) => `/products/${id}`,
  DELETE: (id) => `/products/${id}`,
};

export const getProducts = async (params = {}) => {
  try {
    console.log('📤 GET Products - Request params:', params);
    const response = await client.get(PRODUCT_ENDPOINTS.LIST, { params });
    console.log('✅ GET Products - Success', {
      status: response.status,
      productsCount: response.data?.data?.length || 0,
    });
    return response.data;
  } catch (error) {
    console.error('❌ Get products error:', {
      message: error.message,
      status: error.response?.status,
      responseData: error.response?.data,
    });
    throw error;
  }
};

export const getProductById = async (id) => {
  const response = await client.get(PRODUCT_ENDPOINTS.DETAIL(id));
  return response.data;
};
```

**Axios Client Setup** (`api/client.js`):
```javascript
const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request Interceptor - Injects JWT token
client.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    // Auto-set Content-Type based on data type
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type']; // Browser sets multipart/form-data
    } else if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor - Handles token refresh on 401
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      // Token refresh logic...
    }
    return Promise.reject(error);
  }
);
```

### 2.3 React Query Hook Pattern

**Pattern**: Custom hooks wrapping React Query useQuery/useMutation
- Query keys organized for cache management
- Configurable staleTime & gcTime
- Automatic error & loading handling

**Example**:
```javascript
// hooks/useProducts.js
import { useQuery } from '@tanstack/react-query';
import { productService } from '@/api/services/productService';

export const productQueryKeys = {
  all: ['products'],
  list: (filters) => ['products', 'list', filters],
  detail: (id) => ['products', 'detail', id],
};

export const useProducts = (params = {}, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.list(params),
    queryFn: () => productService.getProducts(params),
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,   // 10 minutes
    retry: 2,
    ...options,
  });
};

export const useProductDetail = (productId, options = {}) => {
  return useQuery({
    queryKey: productQueryKeys.detail(productId),
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId, // Only run if ID exists
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    ...options,
  });
};
```

**Usage in Components**:
```jsx
export default function ProductsPage() {
  const { data, isLoading, error } = useProducts({ 
    page: 1, 
    limit: 12,
    status: 'active'
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorAlert error={error} />;

  return (
    <ProductGrid>
      {data?.data?.map(product => (
        <ProductCard key={product._id} product={product} />
      ))}
    </ProductGrid>
  );
}
```

### 2.4 Form Pattern (Controlled Components)

**Pattern**: React hooks (useState) for form state, manual validation
- No external form libraries like react-hook-form
- Validation via custom functions or Zod schemas
- Form state in component or Zustand store
- Error handling with state

**Example**:
```jsx
'use client';
import { useState } from 'react';
import styled from 'styled-components';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function ProductForm() {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newErrors = validateForm();
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsSubmitting(true);
    try {
      // Call API
      await productService.createProduct(formData);
      toast.success('Product created!');
    } catch (error) {
      setErrors({ submit: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form onSubmit={handleSubmit}>
      <FormGroup>
        <Label>Product Name *</Label>
        <Input
          type="text"
          name="name"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
        {errors.name && <ErrorMessage>{errors.name}</ErrorMessage>}
      </FormGroup>

      <FormGroup>
        <Label>Description *</Label>
        <TextArea
          name="description"
          value={formData.description}
          onChange={handleChange}
        />
      </FormGroup>

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Creating...' : 'Create Product'}
      </Button>
    </Form>
  );
}
```

### 2.5 Styling Pattern (Styled-Components)

**Pattern**: Styled-components for component styling
- Global styles in `/styles/`
- Theme provided via ThemeProvider
- Responsive design with media queries
- Theming colors via `theme.colors`

**Theme Configuration** (`providers.jsx`):
```javascript
const theme = {
  colors: {
    primary: '#5b4dff',
    secondary: '#0f172a',
    accent: '#f59e0b',
    danger: '#dc2626',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#0f172a',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
  },
};
```

**Component Example**:
```javascript
import styled from 'styled-components';

const PageContainer = styled.div`
  min-height: 100vh;
  background: ${({ theme }) => theme.colors.surface};
  padding: 40px 20px;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 24px 16px;
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: 16px 12px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.text};
  margin: 0;

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: 24px;
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.colors.primary};
  color: white;
  padding: 12px 24px;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: ${({ theme }) => theme.colors.secondary};
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
```

---

## 3. COMPONENT LIBRARY & UI COMPONENTS

### 3.1 Core UI Components (src/components/ui/)

**Available Components**:
```
Button.jsx          - Styled button with 6+ variants (primary, secondary, ghost, outline, danger, success)
Input.jsx           - Text input field
Card.tsx            - Card container with shadow & padding
Dialog.tsx          - Modal dialog overlay
Toast.tsx           - Toast notification system (Sonner)
Alert.tsx           - Alert box (error, warning, info, success)
Badge.tsx           - Status badge component
Avatar.tsx          - User avatar image
Spinner.tsx         - Loading spinner animation
Table.tsx           - Data table component
Tabs.tsx            - Tab interface
Pagination.tsx      - Pagination controls
Select.tsx          - Dropdown select
Checkbox.tsx        - Checkbox input
Radio.tsx           - Radio button group
Switch.tsx          - Toggle switch
Slider.tsx          - Range slider
DatePicker.tsx      - Calendar date picker
TextField.tsx       - Enhanced text field with label & error
TextArea.tsx        - Multi-line text input
Menu/Dropdown.tsx   - Dropdown menu
Tooltip.tsx         - Tooltip hover component
DropZone.tsx        - File upload area
Breadcrumb.tsx      - Navigation breadcrumb
Accordion.tsx       - Accordion expandable sections
```

### 3.2 Button Component Example

```jsx
// components/ui/Button.jsx
import styled, { css } from 'styled-components';

const baseButtonStyles = css`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  border: none;
  border-radius: 8px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  white-space: nowrap;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const StyledButton = styled.button`
  ${baseButtonStyles}
  ${(props) => {
    switch (props.variant) {
      case 'primary':
        return css`
          background-color: #5b4dff;
          color: white;
          &:hover:not(:disabled) {
            background-color: #4c3fcc;
            box-shadow: 0 4px 12px rgba(91, 77, 255, 0.3);
          }
        `;
      case 'secondary':
        return css`
          background-color: #0f172a;
          color: white;
          &:hover:not(:disabled) {
            background-color: #1a232f;
          }
        `;
      case 'ghost':
        return css`
          background-color: transparent;
          color: #5b4dff;
          border: 1px solid #e5e7eb;
          &:hover:not(:disabled) {
            background-color: #f9fafb;
            border-color: #5b4dff;
          }
        `;
      default:
        return '';
    }
  }};

  ${(props) =>
    props.size === 'sm' &&
    css`
      padding: 8px 12px;
      font-size: 14px;
    `}

  ${(props) =>
    props.size === 'lg' &&
    css`
      padding: 14px 28px;
      font-size: 18px;
    `}
`;

export const Button = ({ variant = 'primary', size = 'md', ...props }) => (
  <StyledButton variant={variant} size={size} {...props} />
);
```

### 3.3 Usage Examples
```jsx
// In components
<Button variant="primary" size="lg">Create Campaign</Button>
<Button variant="secondary">Cancel</Button>
<Button variant="ghost" size="sm">Learn More</Button>
<Button variant="danger" disabled={isSubmitting}>
  {isSubmitting ? 'Deleting...' : 'Delete'}
</Button>
```

---

## 4. STATE MANAGEMENT

### 4.1 React Query (Server State)

**Purpose**: Cache API data, sync with server
**Configuration**: Global in `providers.jsx`

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 minutes before data considered stale
      gcTime: 10 * 60 * 1000,        // 10 minutes before cache garbage collected
      retry: 1,                       // Retry failed requests once
      refetchOnWindowFocus: false,    // Don't refetch when window regains focus
    },
  },
});
```

**Query Cache Key Factory Pattern**:
```javascript
export const productQueryKeys = {
  all: ['products'],
  lists: () => [...productQueryKeys.all, 'list'],
  list: (filters) => [...productQueryKeys.lists(), filters],
  details: () => [...productQueryKeys.all, 'detail'],
  detail: (id) => [...productQueryKeys.details(), id],
};

// Usage
useQuery({
  queryKey: productQueryKeys.list({ page: 1, status: 'active' }),
  queryFn: () => productService.getProducts({ page: 1, status: 'active' }),
});

// Invalidate cache after mutation
queryClient.invalidateQueries(productQueryKeys.lists());
queryClient.invalidateQueries(productQueryKeys.details());
```

### 4.2 Zustand (Client State)

**Purpose**: UI state, user preferences, cart/checkout state
**Stores**:
```
authStore.js          - User auth state
cartStore.js          - Shopping cart items & summary
checkoutStore.js      - Checkout flow state
orderStore.js         - Order history state
payoutStore.js        - Payout requests & history
affiliateStore.js     - Affiliate account state
commissionStore.js    - Commission tracking state
referralStore.js      - Referral link state
adminStore.js         - Admin panel state
```

**Example**:
```javascript
// stores/authStore.js
import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

export const useAuthStore = create(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,

        setUser: (user) => set(() => ({ user, isAuthenticated: !!user })),
        setTokens: (token, refreshToken) => set(() => ({ token, refreshToken })),
        login: (user, token, refreshToken) => set(() => ({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        })),
        logout: () => set(() => ({
          user: null,
          token: null,
          refreshToken: null,
          isAuthenticated: false,
        })),
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    )
  )
);

// Usage in components
function MyComponent() {
  const { user, logout } = useAuthStore();
  return <button onClick={logout}>Logout {user?.name}</button>;
}
```

### 4.3 React Context (Global Providers)

**Contexts**:
```
AuthContext.jsx       - Authentication state & methods
ToastContext.jsx      - Toast notification system
ThemeContext.jsx      - Theme (via styled-components)
```

**AuthContext Example**:
```javascript
// contexts/AuthContext.jsx
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = tokenManager.getAccessToken();
        if (token && !tokenManager.isTokenExpired(token)) {
          const userData = await authService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
        } else {
          tokenManager.clearTokens();
        }
      } finally {
        setIsLoading(false);
      }
    };
    initializeAuth();
  }, []);

  const login = useCallback(async (credentials) => {
    const response = await authService.login(credentials);
    tokenManager.setTokens(response.accessToken, response.refreshToken);
    setUser(response.user);
    setIsAuthenticated(true);
    return response;
  }, []);

  const logout = useCallback(async () => {
    try {
      await authService.logout();
    } finally {
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
    }
  }, []);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
```

---

## 5. EXAMPLE PAGES & PATTERNS

### 5.1 Products Listing Page Pattern

**File**: `(app)/products/page.jsx`

**Features**:
- Search & filtering
- Pagination
- URL state persistence (bookmarking)
- Loading skeletons
- Error handling
- Responsive grid layout

**Structure**:
```jsx
'use client';
import { useState, useEffect, useMemo } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';

export default function ProductsPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // State from URL params
  const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
  const [search, setSearch] = useState(() => searchParams.get('search') || '');
  const [filters, setFilters] = useState(() => ({
    status: searchParams.get('status') || 'active',
    category: searchParams.get('category') || '',
    minPrice: parseInt(searchParams.get('minPrice') || '0'),
    maxPrice: parseInt(searchParams.get('maxPrice') || '1000'),
  }));

  // Fetch data
  const params = useMemo(() => ({
    page,
    limit: 12,
    status: filters.status || undefined,
    category: filters.category || undefined,
    minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
    maxPrice: filters.maxPrice < 1000 ? filters.maxPrice : undefined,
    search: search || undefined,
  }), [page, filters, search]);

  const { data, isLoading, error } = useProducts(params);
  const { addToCart } = useAddToCart();

  // Update URL when state changes
  useEffect(() => {
    const queryParams = new URLSearchParams();
    if (page !== 1) queryParams.set('page', page.toString());
    if (search) queryParams.set('search', search);
    if (filters.status !== 'active') queryParams.set('status', filters.status);
    if (filters.category) queryParams.set('category', filters.category);
    if (filters.minPrice > 0) queryParams.set('minPrice', filters.minPrice.toString());
    if (filters.maxPrice < 1000) queryParams.set('maxPrice', filters.maxPrice.toString());

    const queryString = queryParams.toString();
    const newUrl = queryString ? `/products?${queryString}` : '/products';
    router.push(newUrl, { scroll: false });
  }, [page, filters, search, router]);

  if (error) return <ErrorAlert message={error.message} />;

  return (
    <PageContainer>
      <PageHeader>
        <Title>Products</Title>
      </PageHeader>

      <ContentContainer>
        <SearchBar value={search} onChange={setSearch} />
        <FilterBar filters={filters} onFiltersChange={setFilters} />

        {isLoading ? (
          <SkeletonGrid />
        ) : (
          <>
            <ProductGrid>
              {data?.data?.map(product => (
                <ProductCard 
                  key={product._id} 
                  product={product}
                  onAddToCart={() => addToCart(product._id, 1)}
                />
              ))}
            </ProductGrid>
            <Pagination
              current={page}
              total={Math.ceil((data?.pagination?.total || 0) / 12)}
              onChange={setPage}
            />
          </>
        )}
      </ContentContainer>
    </PageContainer>
  );
}
```

### 5.2 Admin Dashboard Pattern

**File**: `(admin)/admin/dashboard/page.jsx`

**Features**:
- Key metrics (revenue, orders, products)
- Chart data visualization
- Real-time updates optional
- Data filtering (date range)

**Structure**:
```jsx
'use client';
import { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useDashboardData } from '@/api/hooks/useAdmin';
import { AdminStatsCards, RevenueChart, TopProductsChart } from '@/components/admin';

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const { data, isLoading: dataLoading } = useDashboardData();

  useEffect(() => {
    if (!isLoading && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isLoading, user]);

  if (isLoading || dataLoading) return <DashboardSkeleton />;

  return (
    <DashboardContainer>
      <Header>
        <h1>Dashboard</h1>
        <TimeDisplay>Last updated: {new Date().toLocaleString()}</TimeDisplay>
      </Header>

      <AdminStatsCards stats={data?.stats} />

      <Grid2Col>
        <RevenueChart data={data?.revenue} />
        <OrderAnalyticsChart data={data?.orders} />
      </Grid2Col>

      <Grid3Col>
        <TopProductsChart data={data?.topProducts} />
        <TopAffiliatesChart data={data?.topAffiliates} />
        <RecentOrdersChart data={data?.recentOrders} />
      </Grid3Col>
    </DashboardContainer>
  );
}
```

### 5.3 Affiliate Register Page Pattern

**File**: `(affiliate)/affiliate/register/page.jsx`

**Features**:
- Form validation
- Error messages
- Success confirmation
- Terms acceptance

```jsx
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useRegisterAffiliate } from '@/hooks/useAffiliates';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

export default function AffiliateRegister() {
  const router = useRouter();
  const { user } = useAuth();
  const { registerAffiliate, isLoading, error } = useRegisterAffiliate();
  
  const [formData, setFormData] = useState({
    businessName: '',
    website: '',
    description: '',
    agreeToTerms: false,
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value, checked, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.agreeToTerms) {
      setErrors({ agreeToTerms: 'You must agree to the terms' });
      return;
    }

    try {
      await registerAffiliate(formData);
      router.push('/affiliate/dashboard');
    } catch (err) {
      setErrors({ submit: err.message });
    }
  };

  return (
    <Container>
      <Card>
        <Title>Become an Affiliate</Title>
        <Subtitle>Start earning commissions on referrals</Subtitle>

        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label>Business Name *</Label>
            <Input
              type="text"
              name="businessName"
              value={formData.businessName}
              onChange={handleChange}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>Website</Label>
            <Input
              type="url"
              name="website"
              value={formData.website}
              onChange={handleChange}
            />
          </FormGroup>

          <FormGroup>
            <Label>Description</Label>
            <TextArea
              name="description"
              value={formData.description}
              onChange={handleChange}
              placeholder="Tell us about your audience..."
            />
          </FormGroup>

          <FormGroup>
            <Checkbox
              type="checkbox"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
            />
            <label>I agree to the Affiliate Terms & Conditions</label>
          </FormGroup>

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Registering...' : 'Register as Affiliate'}
          </Button>
        </Form>
      </Card>
    </Container>
  );
}
```

---

## 6. AUTHENTICATION & PROTECTED ROUTES

### 6.1 Protected Route Component

**Usage**: Wrap pages to require authentication

```jsx
// Example: /dashboard/protected-page.jsx
'use client';
import ProtectedRoute from '@/components/ProtectedRoute';

export default function ProtectedPage() {
  return (
    <ProtectedRoute requiredRole="customer">
      <ProtectedContent />
    </ProtectedRoute>
  );
}
```

**Implementation**:
```jsx
// components/ProtectedRoute.jsx
export default function ProtectedRoute({ 
  children, 
  requiredRole = null,
  redirectTo = '/login' 
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized');
    }
  }, [isAuthenticated, isLoading, user, requiredRole, router]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  if (!isAuthenticated) {
    return null;
  }

  return children;
}
```

### 6.2 Auth Layout Patterns

**AppLayout** (Protected - with Header):
- Used by `(app)` route group
- Requires authentication
- Redirects to /login if not authenticated
- Displays header navigation

**AdminLayout** (Protected + Role Check - with Sidebar):
- Used by `(admin)` route group
- Requires auth + admin role
- Redirects to /login if not authenticated
- Redirects to /dashboard if not admin role
- Displays admin sidebar

**AuthLayout** (Public - minimal):
- Used by `(auth)` route group
- No auth check
- Minimal styling for auth forms

---

## 7. API CONFIGURATION & AXIOS SETUP

### 7.1 API Configuration File

**File**: `api/config/api.config.js`

```javascript
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'spherekings_access_token',
  REFRESH_TOKEN: 'spherekings_refresh_token',
  TOKEN_EXPIRY: 'spherekings_token_expiry',
};

export const TOKEN_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes
  EXPIRY_BUFFER: 60000,              // 1 minute
};

export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  PRODUCTS: {
    GET_PRODUCTS: '/products',
    GET_PRODUCT: '/products/:id',
    CREATE: '/products',
    UPDATE: '/products/:id',
    DELETE: '/products/:id',
  },
  // ... more endpoints
};
```

**Environment Variables** (`.env.local`):
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 7.2 Axios Client with JWT Interceptors

**File**: `api/client.js`

```javascript
import axios from 'axios';
import API_CONFIG from '@/config/api.config';
import TokenManager from '@/utils/tokenManager';

const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: 30000,
});

// Request interceptor: Add JWT token
client.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Auto content-type detection
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object') {
      config.headers['Content-Type'] = 'application/json';
    }
    
    return config;
  }
);

// Response interceptor: Handle token refresh
let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach(prom => {
    if (error) prom.reject(error);
    else prom.resolve(token);
  });
  failedQueue = [];
};

client.interceptors.response.use(
  response => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(token => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshToken = TokenManager.getRefreshToken();
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/auth/refresh`,
          { refreshToken }
        );
        
        const { accessToken, refreshToken: newRefreshToken } = response.data;
        TokenManager.setTokens(accessToken, newRefreshToken);
        
        originalRequest.headers.Authorization = `Bearer ${accessToken}`;
        processQueue(null, accessToken);
        
        return client(originalRequest);
      } catch (err) {
        TokenManager.clearTokens();
        window.location.href = '/login';
        processQueue(err, null);
        return Promise.reject(err);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export default client;
```

---

## 8. COMMON IMPLEMENTATION PATTERNS

### 8.1 URL Query State Pattern

**Purpose**: Persist filters/search in URL for bookmarkable views

```jsx
// Pattern used in products page
const [page, setPage] = useState(() => parseInt(searchParams.get('page') || '1'));
const [search, setSearch] = useState(() => searchParams.get('search') || '');
const [filters, setFilters] = useState(() => ({
  status: searchParams.get('status') || 'active',
  category: searchParams.get('category') || '',
}));

// Update URL when state changes
useEffect(() => {
  const queryParams = new URLSearchParams();
  if (page !== 1) queryParams.set('page', page.toString());
  if (search) queryParams.set('search', search);
  if (filters.status !== 'active') queryParams.set('status', filters.status);
  if (filters.category) queryParams.set('category', filters.category);

  const queryString = queryParams.toString();
  const newUrl = queryString ? `/products?${queryString}` : '/products';
  router.push(newUrl, { scroll: false });
}, [page, filters, search, router]);
```

### 8.2 Skeleton Loading State Pattern

```jsx
// ProductCardSkeleton.jsx
export const ProductCardSkeleton = () => (
  <SkeletonCard>
    <SkeletonImage />
    <SkeletonTitle />
    <SkeletonText lines={2} />
    <SkeletonButton />
  </SkeletonCard>
);

// Usage
{isLoading && (
  <ProductGrid>
    {[...Array(12)].map((_, i) => <ProductCardSkeleton key={i} />)}
  </ProductGrid>
)}
```

### 8.3 Error Handling Pattern

```jsx
// Generic error alert
<ErrorAlert>
  <ErrorTitle>Error Loading Products</ErrorTitle>
  <ErrorMessage>{error?.message}</ErrorMessage>
  {error?.details && (
    <ErrorDetails>
      <p>Status: {error.status}</p>
      <p>Message: {error.details}</p>
    </ErrorDetails>
  )}
</ErrorAlert>

// Toast notifications
const { success, error: showError } = useToast();
try {
  await addToCart(productId, quantity);
  success('Added to cart!');
} catch (err) {
  showError('Failed to add to cart');
}
```

### 8.4 Data Fetching Pattern with Dependencies

```jsx
// Refetch when dependencies change
export const useProductDetail = (productId) => {
  return useQuery({
    queryKey: ['products', productId],
    queryFn: () => productService.getProductById(productId),
    enabled: !!productId, // Only fetches if productId exists
    staleTime: 5 * 60 * 1000,
  });
};

// Usage
const { id } = useParams();
const { data: product, isLoading } = useProductDetail(id);
```

---

## 9. FILE ORGANIZATION REFERENCE

### Key Service Files

```
api/services/
├── authService.js         - login, register, refresh, logout, getCurrentUser
├── productService.js      - getProducts, getProductById, createProduct, updateProduct
├── cartService.js         - addToCart, removeFromCart, fetchCart, checkout
├── orderService.js        - createOrder, getOrders, getOrder, updateOrder
├── checkoutService.js     - validateOrder, processPayment, confirmOrder
├── affiliateService.js    - getAffiliateStatus, getCommissions, requestPayout
├── adminService.js        - getDashboard, getOrders, getAffiliates, etc.
├── commissionService.js   - getCommissions, getApprovals, approveCommission
├── payoutService.js       - getPayouts, requestPayout, updatePayout
└── referralService.js     - getReferrals, trackReferral, generateLink
```

### Key Hook Files

```
api/hooks/
├── useAdmin.js            - useDashboardData, useOrders, useAffiliates
└── (indirectly used via React Query)

hooks/
├── useProducts.js         - useProducts, useProductDetail, useFeaturedProducts, useSearchProducts
├── useCart.js             - useCartItems, useAddToCart, useFetchCart, useCartTotal
├── useCheckout.js         - useCheckout, useProcessPayment
├── useOrders.js           - useOrders, useOrderDetail, useCreateOrder
├── useAffiliates.js       - useAffiliateDashboard, useRegisterAffiliate
├── useRoleBasedNavigation.js - useRoleBasedNavigation
├── useMobile.js           - useIsMobile (responsive hook)
└── useLeaderboard.js      - useLeaderboard, useLeaderboardStats
```

### Key Store Files

```
stores/
├── authStore.js           - User auth state (Zustand)
├── cartStore.js           - Cart items & summary
├── checkoutStore.js       - Checkout flow & validation
├── orderStore.js          - Order history cache
├── payoutStore.js         - Payout requests
├── affiliateStore.js      - Affiliate account info
├── commissionStore.js     - Commission tracking
└── referralStore.js       - Referral links & clicks
```

---

## 10. TECHNOLOGY STACK

| Category | Technology | Details |
|----------|-----------|---------|
| **Framework** | Next.js 14+ | App Router, server/client components |
| **Styling** | Styled-components | CSS-in-JS, theme provider |
| **State (Server)** | TanStack Query (React Query) | API data caching, sync |
| **State (Client)** | Zustand | Global client state |
| **Context** | React Context | Auth, toast providers |
| **HTTP Client** | Axios | With JWT interceptors |
| **UI Components** | Shadcn/UI pattern | Headless components |
| **Icons** | Lucide React | Beautiful SVG icons |
| **Animations** | Framer Motion | Page transitions, micro-interactions |
| **Form Validation** | Custom + Zod | Controlled components, schema validation |
| **Notifications** | Sonner Toast | Toast system |
| **Routing** | Next.js routing | File-based routing with groups |

---

## 11. KEY CONFIGURATION FILES

### jsconfig.json
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

### next.config.mjs
```javascript
const nextConfig = {
  reactStrictMode: true,
  compiler: {
    styledComponents: true,
  },
};
export default nextConfig;
```

### .env.local
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## 12. SUMMARY TABLE: PATTERN QUICK REFERENCE

| Task | File Location | Pattern | Example |
|------|---------------|---------|---------|
| Create page | `app/(group)/page-name/page.jsx` | useAuth, useQuery, styled-components | products page |
| Create service | `api/services/featureService.js` | Axios client, try-catch, logging | productService |
| Create hook | `hooks/useFeature.js` | useQuery/useMutation, query keys | useProducts |
| Create component | `components/feature/Component.jsx` | Styled-components, props, Fragment | ProductCard |
| Add store | `stores/featureStore.js` | Zustand with devtools/persist | authStore |
| Protect route | Layout wrap + ProtectedRoute | useAuth, redirect, loading state | (admin) layout |
| Form handling | Component with useState | onChange, validation, onSubmit | ProductForm |
| API call | In hook with useQuery | Fetch with error handling | useProducts |
| Styling | Styled-components with theme | Template literals, media queries | Button |
| Navigation | useRouter, Link | Push/replace routes | useRouter().push() |

---

## IMPLEMENTATION READINESS

The frontend codebase is **fully structured and ready** for:

✅ **Influencer & Sponsorship Feature Implementation** with:
- Established page structure (use (app) for customer, (admin) for admin features)
- Proven API integration pattern (services + hooks + React Query)
- Consistent UI component library ready to use
- State management setup for new features
- Authentication & authorization system in place
- Responsive styling system with theme provider
- Error handling & loading patterns established
- Form validation framework in place

**Template files to create** for new features:
1. **API Service**: `/api/services/sponsorshipService.js`
2. **Hooks**: `/hooks/useSponsorship.js` (with React Query)
3. **Pages**: `/app/(app)/sponsorship/*` and `/app/(admin)/admin/sponsorships/*`
4. **Components**: `/components/sponsorship/*` (cards, forms, tables)
5. **Store** (optional): `/stores/sponsorshipStore.js` for client state
6. **Types/Validation** (optional): Zod schemas for form validation

All existing patterns are proven, tested, and ready to extend.
