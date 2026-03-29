/**
 * Admin Dashboard Frontend - Implementation Guide
 * 
 * Comprehensive documentation for the production-ready admin dashboard system
 */

# Admin Dashboard Frontend - Complete Implementation Guide

## Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Technology Stack](#technology-stack)
4. [File Structure](#file-structure)
5. [API Integration](#api-integration)
6. [State Management](#state-management)
7. [Components](#components)
8. [Pages](#pages)
9. [Utilities](#utilities)
10. [Security](#security)
11. [Performance](#performance)
12. [Development Guide](#development-guide)
13. [Troubleshooting](#troubleshooting)

---

## Project Overview

The Admin Dashboard is a comprehensive frontend application for managing the Spherekings Marketplace platform. It provides administrators with:

- **Dashboard Overview**: Key platform metrics and analytics at a glance
- **Order Monitoring**: View, filter, and analyze all customer orders
- **Product Management**: Monitor product inventory and performance
- **Affiliate Tracking**: Monitor affiliate performance and commissions
- **Commission Management**: Track and manage affiliate commissions
- **Payout Monitoring**: Oversee affiliate payouts and payments
- **Revenue Analytics**: Analyze platform revenue trends
- **System Health**: Monitor system health and performance metrics
- **Financial Reconciliation**: Reconcile financial data across all systems

---

## Architecture

### Design Pattern

The admin dashboard follows a **modern React architecture pattern**:

```
API Layer (Services)
    ↓
React Query (Server State)
    ↓
Zustand Store (Client State)
    ↓
Components/Pages (UI)
```

### Data Flow

1. **Services** (`src/api/services/adminService.js`)
   - Axios HTTP clients with automatic authentication
   - Request/response interceptors
   - Error handling and formatting

2. **React Query** (`src/api/hooks/useAdmin.js`)
   - Server state management
   - Caching and stale-time strategies
   - Automatic refetching and invalidation

3. **Zustand** (`src/stores/adminStore.js`)
   - Client-side filter and preference state
   - Modal and selection management
   - LocalStorage persistence

4. **Components & Pages**
   - Reusable UI components
   - Page-level containers
   - Styled-components for styling

---

## Technology Stack

### Frontend Framework
- **Next.js 14+** (App Router)
- **React 18+**
- **TypeScript** (optional but recommended)

### State Management
- **TanStack Query (React Query)** - Server state
- **Zustand** - Client state
- **Context API** - Authentication

### Styling
- **styled-components** - CSS-in-JS
- **Responsive design** - Mobile-first approach

### HTTP Client
- **Axios** - REST API calls
- **Bearer token authentication** - JWT

### Charts & Visualization
- **Recharts** - Data visualization library
- **Line, Bar, Pie charts** - Analytics

### Build & Dev
- **npm/yarn** - Package management
- **ESLint** - Code linting
- **Prettier** - Code formatting

---

## File Structure

```
src/
├── api/
│   ├── services/
│   │   └── adminService.js          # API client for admin endpoints
│   └── hooks/
│       └── useAdmin.js               # React Query hooks
├── stores/
│   └── adminStore.js                 # Zustand store
├── components/
│   └── admin/
│       ├── AdminStatsCards.jsx       # Dashboard stat cards
│       ├── OrdersTable.jsx           # Orders table component
│       ├── ProductsTable.jsx         # Products table component
│       ├── AffiliatesTable.jsx       # Affiliates table component
│       ├── TablesData.jsx            # Commissions & Payouts tables
│       ├── StatusBadge.jsx           # Status badge component
│       ├── Pagination.jsx            # Pagination controls
│       ├── DateRangeFilter.jsx       # Date filter component
│       └── Charts.jsx                # Analytics charts
├── app/
│   └── admin/
│       ├── dashboard/
│       │   └── page.jsx              # Main dashboard
│       ├── orders/
│       │   └── page.jsx              # Orders page
│       ├── products/
│       │   └── page.jsx              # Products page
│       ├── affiliates/
│       │   ├── page.jsx              # Affiliates list
│       │   └── [affiliateId]/
│       │       └── page.jsx          # Affiliate details
│       ├── commissions/
│       │   └── page.jsx              # Commissions page
│       ├── payouts/
│       │   └── page.jsx              # Payouts page
│       ├── revenue/
│       │   └── page.jsx              # Revenue analytics
│       ├── system/
│       │   └── page.jsx              # System health
│       └── reconciliation/
│           └── page.jsx              # Financial reconciliation
└── utils/
    └── adminUtils.js                 # Helper functions
```

---

## API Integration

### Admin Service Methods

All API calls are centralized in `adminService.js`:

#### Dashboard
```javascript
// Get overview with key metrics
getDashboardOverview()
```

#### Orders
```javascript
getOrders(params)              // List orders with filters
getOrderAnalytics()            // Order analytics breakdown
```

#### Products
```javascript
getProducts(params)            // List products with filters
getTopProducts(limit)          // Top selling products
```

#### Affiliates
```javascript
getAffiliates(params)          // List affiliates
getTopAffiliates(limit)        // Top performing affiliates
getAffiliateDetails(id)        // Affiliate performance details
```

#### Commissions
```javascript
getCommissions(params)         // List commissions
getCommissionAnalytics()       // Commission analytics
```

#### Payouts
```javascript
getPayouts(params)             // List payouts
getPayoutAnalytics()           // Payout analytics
```

#### Analytics
```javascript
getRevenueAnalytics(params)    // Revenue breakdown
getSystemHealthMetrics()       // System health status
getFinancialReconciliation()   // Financial reconciliation
```

### Query Parameters

#### Orders
- `page` - Pagination page
- `limit` - Records per page (max 100)
- `status` - Filter by status (completed|pending|failed)
- `affiliateId` - Filter by affiliate
- `userId` - Filter by customer
- `dateFrom` - Start date (ISO format)
- `dateTo` - End date (ISO format)
- `sortBy` - Sort field
- `order` - Sort direction (asc|desc)

#### Products
- `page` - Pagination page
- `limit` - Records per page
- `status` - Filter by status (active|inactive)
- `category` - Filter by category
- `search` - Text search

#### Affiliates
- `page` - Pagination page
- `limit` - Records per page
- `status` - Filter by status
- `search` - Search by name or email

#### Commissions/Payouts
- `page` - Pagination page
- `limit` - Records per page
- `status` - Filter by status
- `affiliateId` - Filter by affiliate
- `dateFrom` - Start date
- `dateTo` - End date

#### Revenue Analytics
- `groupBy` - Time grouping (day|week|month)
- `dateFrom` - Start date
- `dateTo` - End date

---

## State Management

### React Query (Server State)

Handles data fetching, caching, and synchronization with backend.

#### Query Keys Structure
```javascript
adminQueryKeys = {
  all: ['admin'],
  dashboard: ['admin', 'dashboard'],
  orders: ['admin', 'orders'],
  products: ['admin', 'products'],
  // ... all other entities
}
```

#### Cache Strategy
- Dashboard: 5 minutes stale time
- Lists (Orders, Products, Affiliates): 3 minutes
- Analytics: 10 minutes
- System Health: 5 minutes

#### Usage Example
```javascript
import { useOrders } from '@/api/hooks/useAdmin';

function MyComponent() {
  const { data, isLoading, error } = useOrders({ 
    page: 1, 
    limit: 20,
    status: 'completed' 
  });

  return (
    <>
      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <OrdersTable orders={data.data} />}
    </>
  );
}
```

### Zustand (Client State)

Manages UI state, filters, and preferences.

#### Store Structure
```javascript
{
  // Filters for each entity
  orderFilters: { page, limit, status, dateFrom, dateTo, ... },
  productFilters: { ... },
  
  // Modal states
  modals: {
    orderDetail: { isOpen, selectedId },
    affiliateDetail: { isOpen, selectedId },
    ...
  },
  
  // Selected items for bulk operations
  selectedItems: {
    orders: [],
    affiliates: [],
    ...
  },
  
  // UI preferences
  uiPreferences: {
    sidebarCollapsed: false,
    theme: 'light',
    autoRefresh: true,
    refreshInterval: 30000
  }
}
```

#### Usage Example
```javascript
import { useOrderFilters, useSetOrderFilters } from '@/stores/adminStore';

function FilterComponent() {
  const filters = useOrderFilters();
  const setFilters = useSetOrderFilters();

  const handleStatusChange = (status) => {
    setFilters({ status, page: 1 });
  };

  return (
    <select value={filters.status} onChange={(e) => handleStatusChange(e.target.value)}>
      <option value="">All</option>
      <option value="completed">Completed</option>
    </select>
  );
}
```

---

## Components

### AdminStatsCards
Displays key platform metrics in card format.

**Props:**
```typescript
interface AdminStatsCardsProps {
  data?: StatsData;
  isLoading?: boolean;
}
```

**Usage:**
```jsx
<AdminStatsCards data={overview.data?.data} isLoading={overview.isLoading} />
```

### OrdersTable, ProductsTable, AffiliatesTable
Reusable table components with sorting and click handlers.

**Props:**
```typescript
interface TableProps {
  data: any[];
  isLoading?: boolean;
  onRowClick?: (row: any) => void;
}
```

### StatusBadge
Universal status indicator with color coding.

**Props:**
```typescript
interface StatusBadgeProps {
  status: string;
  showIcon?: boolean;
  label?: string;
}
```

### Pagination
Pagination controls with page selection and limit options.

**Props:**
```typescript
interface PaginationProps {
  page: number;
  limit: number;
  total: number;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
}
```

### DateRangeFilter
Date range picker with preset buttons.

**Props:**
```typescript
interface DateRangeFilterProps {
  dateFrom: string;
  dateTo: string;
  onDateFromChange: (date: string) => void;
  onDateToChange: (date: string) => void;
  onReset?: () => void;
}
```

### Chart Components
Analytics charts using Recharts library.

**Available Charts:**
- `RevenueChart` - Line chart for revenue trends
- `TopProductsChart` - Bar chart for top products
- `TopAffiliatesChart` - Bar chart for top affiliates
- `OrderAnalyticsChart` - Pie chart for order status distribution

---

## Pages

### /admin/dashboard
Main entry point showing overview of all platform metrics.

**Features:**
- Statistics cards
- Revenue analytics chart
- Order distribution chart
- Top products and affiliates
- System health status

### /admin/orders
Order monitoring and analysis.

**Features:**
- Order listing with pagination
- Filtering by status, affiliate, date range
- Order analytics breakdown
- Date range selection

### /admin/products
Product monitoring and inventory.

**Features:**
- Product listing with pagination
- Filtering by status, category, search
- Top products chart
- Stock and pricing information

### /admin/affiliates
Affiliate management and performance tracking.

**Features:**
- Affiliate listing with earnings
- Top performing affiliates chart
- Status filtering
- Commission and payout information

### /admin/commissions
Commission tracking and management.

**Features:**
- Commission listing
- Status-based filtering
- Commission analytics
- Affiliate performance breakdown

### /admin/payouts
Payout monitoring and processing.

**Features:**
- Payout listing
- Status filtering
- Payout analytics
- Financial tracking

### /admin/revenue
Revenue analytics and trends.

**Features:**
- Revenue trends over time
- Time grouping options (day/week/month)
- Date range filtering
- Order value analysis

### /admin/system
System health and monitoring.

**Features:**
- System health metrics
- Recent activity
- Failed payouts and pending commissions
- Platform alert suggestions

### /admin/reconciliation
Financial reconciliation report.

**Features:**
- Revenue vs commissions vs payouts comparison
- Discrepancy detection
- Balance verification
- Financial integrity checks

---

## Utilities

### Formatting Functions
```javascript
formatCurrency(amount)              // Format as currency
formatNumber(value)                 // Format with thousand separators
formatDate(dateString)              // Format date
formatDateTime(dateString)          // Format date and time
formatPercentage(value)             // Format as percentage
truncateId(id)                      // Truncate long IDs
```

### Data Functions
```javascript
sortData(data, sortBy, order)      // Sort array of objects
filterData(data, conditions)        // Filter with multiple conditions
paginateData(data, page, limit)    // Paginate data
calculateAverage(values)            // Calculate average
getMinMax(values)                   // Get min/max values
```

### Export Functions
```javascript
exportToCSV(data, filename)         // Export to CSV
exportToJSON(data, filename)        // Export to JSON
batchExportData(fetchFn, options)  // Batch export with filters
```

### Validation Functions
```javascript
isValidDateRange(from, to)         // Validate date range
validateFilters(filters)           // Validate filter parameters
getAlertSuggestions(metrics)       // Get alert suggestions
```

---

## Security

### Authentication
- All requests include Bearer token in Authorization header
- Tokens are stored in localStorage and injected via Axios interceptor
- 401 responses trigger redirect to login page

### Authorization
- Admin role check on page load
- Unauthorized access redirects to home page
- Backend validates admin role on all endpoints

### XSS Prevention
- React automatically escapes content
- No `dangerouslySetInnerHTML` used
- User inputs are validated and sanitized

### CSRF Protection
- Axios automatically includes CSRF tokens if configured
- All sensitive operations use POST/PUT/DELETE methods

### Data Protection
- No sensitive data stored in localStorage except auth token
- Sensitive URLs are protected by backend validation
- Error messages don't leak sensitive information

---

## Performance

### Optimization Strategies

#### 1. React Query Caching
```javascript
// Dashboard data cached for 5 minutes
useDashboardOverview({
  staleTime: 5 * 60 * 1000,
  gcTime: 30 * 60 * 1000
})
```

#### 2. Code Splitting
```javascript
// Pages are automatically code-split by Next.js
// Component lazy loading available via dynamic imports
```

#### 3. Pagination
```javascript
// Server-side pagination
// Only load visible data instead of entire dataset
useOrders({ page: 1, limit: 20 })
```

#### 4. Selector Hooks (Zustand)
```javascript
// Only rerender when specific state changes
const filters = useOrderFilters() // Reacts only to filter changes
```

#### 5. Memoization
```javascript
// Components wrapped with React.memo if needed
// useMemo and useCallback for expensive operations
```

---

## Development Guide

### Setup
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Access admin dashboard
http://localhost:3000/admin/dashboard
```

### Adding New Filters

1. Add filter to Zustand store:
```javascript
// In adminStore.js
myFilters: { page: 1, ... },
setMyFilters: (filters) => { ... }
```

2. Create selector hook:
```javascript
export const useMyFilters = () => useAdminStore(state => state.myFilters);
export const useSetMyFilters = () => useAdminStore(state => state.setMyFilters);
```

3. Use in component:
```javascript
const filters = useMyFilters();
const setFilters = useSetMyFilters();
```

### Adding New API Endpoint

1. Add service function:
```javascript
// In adminService.js
export const getMyData = async (params) => {
  try {
    const response = await adminClient.get('/my-data', { params });
    return response.data;
  } catch (error) {
    throw new Error(error.response?.data?.message || 'Failed');
  }
};
```

2. Create React Query hook:
```javascript
// In useAdmin.js
export const useMyData = (params = {}) => {
  return useQuery({
    queryKey: ['admin', 'myData', params],
    queryFn: () => adminService.getMyData(params),
    staleTime: 5 * 60 * 1000,
    retry: 2
  });
};
```

3. Use in component:
```javascript
const { data, isLoading } = useMyData(filters);
```

### Styling with styled-components

```javascript
import styled from 'styled-components';

const Button = styled.button`
  padding: 8px 16px;
  background: #3b82f6;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;

  &:hover {
    background: #2563eb;
  }
`;
```

---

## Troubleshooting

### Common Issues

#### Issue: "Access Denied" redirects to home page
**Solution:** Ensure user has admin role assigned in backend.

#### Issue: Charts not rendering
**Solution:** Verify Recharts is installed (`npm install recharts`).

#### Issue: Stale data in tables
**Solution:** Use `queryClient.invalidateQueries()` after mutations.

#### Issue: Filters not persisting on page reload
**Solution:** Zustand persistence is enabled - check localStorage for admin_store key.

#### Issue: API calls failing with 401
**Solution:** Check auth token in localStorage, ensure token is not expired.

#### Issue: Slow page loads
**Solution:** 
- Check React Query cache settings
- Enable request deduplication
- Use pagination instead of loading all data
- Implement lazy loading for charts

### Debug Mode

Enable debug logging:
```javascript
// In components
const { data, isLoading, error } = useOrders(filters);

if (error) {
  console.log('Query Error:', error);
  console.log('Error Details:', error.response?.data);
}
```

### Performance Profiling

Use React DevTools Profiler:
1. Open React DevTools
2. Go to Profiler tab
3. Record component interactions
4. Identify unnecessary re-renders

---

## Deployment

### Build
```bash
npm run build
```

### Environment Variables
```env
NEXT_PUBLIC_API_BASE_URL=https://api.production.com
NEXT_PUBLIC_APP_NAME=Spherekings Admin
```

### Production Checklist
- [ ] Bundle size optimized
- [ ] All console warnings resolved
- [ ] Error boundaries implemented
- [ ] Analytics integrated
- [ ] Monitoring/logging configured
- [ ] Security headers configured
- [ ] CORS properly configured
- [ ] Rate limiting enabled on API

---

## Support & Maintenance

### Common Maintenance Tasks

1. **Update cache times** (React Query staleTime)
2. **Add new filter types** (Update Zustand store + hooks + components)
3. **Monitor API response times** (Check Network tab in DevTools)
4. **Review error logs** (Check console and backend logs)

### Monitoring
- Track API response times
- Monitor component render counts
- Alert on failed queries
- Track user interactions

---

**Last Updated:** March 16, 2026
**Version:** 1.0.0
**Status:** Production Ready
