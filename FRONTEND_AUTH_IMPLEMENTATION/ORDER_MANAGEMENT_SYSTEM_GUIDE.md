# Order Management System - Complete Integration Guide

## Overview

The Order Management System provides a complete production-ready solution for managing customer orders, affiliate commissions, and admin order administration. It integrates seamlessly with the backend Order APIs and provides comprehensive UI components for all user roles.

**Architecture:**
- API Service Layer: `src/api/services/orderService.js`
- State Management: `src/stores/orderStore.js` + Custom Hooks
- UI Components: `src/components/orders/*`
- Pages: `src/app/orders/*`, `src/app/affiliate/orders/*`, `src/app/admin/orders/*`

---

## File Structure

```
src/
├── api/services/
│   └── orderService.js              # Order API calls (8 functions)
├── stores/
│   └── orderStore.js                # Zustand store for order state
├── hooks/
│   └── useOrders.js                 # 12+ custom hooks
├── components/orders/
│   ├── OrderStatusBadge.jsx          # Status badge components
│   ├── OrderCard.jsx                 # Individual order card
│   ├── OrdersList.jsx                # Orders list with filters/pagination
│   └── OrderDetails.jsx              # Full order details view
└── app/
    ├── orders/
    │   ├── page.jsx                  # Customer orders listing
    │   ├── [orderId]/
    │   │   ├── page.jsx              # Order details page
    │   │   └── invoice/
    │   │       └── page.jsx          # Invoice viewer/printer
    ├── affiliate/orders/
    │   └── page.jsx                  # Affiliate orders dashboard
    └── admin/orders/
        └── page.jsx                  # Admin orders management
```

---

## API Service Layer

### Location
`src/api/services/orderService.js`

### Functions

#### 1. getUserOrders(options)
Fetch authenticated user's orders with filtering and pagination.

```javascript
import orderService from '@/api/services/orderService';

const { orders, pagination } = await orderService.getUserOrders({
  page: 1,
  limit: 10,
  status: 'shipped',
  paymentStatus: 'paid',
  dateFrom: '2024-01-01',
  dateTo: '2024-12-31',
  minAmount: 50,
  maxAmount: 500,
  sortBy: 'createdAt',
  sortOrder: 'desc'
});
```

**Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10, max: 100)
- `status` (string): Order status filter
- `paymentStatus` (string): Payment status filter
- `dateFrom` (string): Start date filter (ISO 8601)
- `dateTo` (string): End date filter (ISO 8601)
- `minAmount` (number): Minimum order amount
- `maxAmount` (number): Maximum order amount
- `sortBy` (string): Sort field (default: 'createdAt')
- `sortOrder` (string): 'asc' or 'desc'

**Returns:**
```javascript
{
  orders: [...],
  pagination: {
    currentPage: 1,
    itemsPerPage: 10,
    totalItems: 100,
    totalPages: 10,
    hasMore: true
  }
}
```

#### 2. getOrderById(orderId)
Get complete details of a specific order.

```javascript
const order = await orderService.getOrderById('66ae5f1c3b8d0a001f2b3c4d');

// Returns full order object with all details
```

#### 3. getOrderSummary()
Get order statistics for current user.

```javascript
const summary = await orderService.getOrderSummary();

// Returns:
// {
//   totalOrders: 5,
//   totalSpent: 1099.95,
//   averageOrder: 219.99,
//   lastOrderDate: "2024-03-14T10:00:00Z",
//   pendingOrders: 1
// }
```

#### 4. searchOrders(criteria)
Advanced search with multiple filters.

```javascript
const { orders, pagination } = await orderService.searchOrders({
  orderNumber: 'ORD-20240314',
  status: 'shipped',
  dateFrom: '2024-03-01',
  dateTo: '2024-03-31',
  minAmount: 100
});
```

#### 5. getOrderInvoice(orderId)
Get formatted invoice data for printing/downloading.

```javascript
const { invoice } = await orderService.getOrderInvoice(orderId);

// Contains: orderNumber, orderDate, items, subtotal, tax, total, paymentDetails
```

#### 6. getAffiliateOrders(options)
Get orders referred by current affiliate with commission stats.

```javascript
const { orders, pagination, statistics } = await orderService.getAffiliateOrders({
  page: 1,
  limit: 20
});

// statistics: {
//   totalCommission: 250.00,
//   paidCommission: 100.00,
//   pendingCommission: 150.00,
//   totalSales: 2500.00
// }
```

#### 7. getAdminOrders(options)
Get all orders in system (admin only).

```javascript
const { orders, pagination, statistics } = await orderService.getAdminOrders({
  page: 1,
  limit: 20,
  status: 'pending',
  paymentStatus: 'paid',
  userId: 'user123',
  affiliateId: 'affiliate456',
  search: 'ORD-123',
  sortBy: 'createdAt',
  sortOrder: 'desc'
});

// statistics: {
//   totalAmount: 10000.00,
//   paidAmount: 9000.00,
//   refundedAmount: 500.00,
//   averageOrder: 200.00,
//   ordersCount: 50
// }
```

#### 8. updateOrderStatus(orderId, status, reason)
Update order fulfillment status (admin only).

```javascript
const updatedOrder = await orderService.updateOrderStatus(
  orderId,
  'shipped',
  'Ready for shipment'
);

// Valid statuses: pending, processing, confirmed, shipped, delivered,
// cancelled, refunded, returned, complete
```

---

## State Management

### Zustand Store
`src/stores/orderStore.js`

Uses Zustand for lightweight state management with devtools integration.

### Store Structure

```javascript
{
  // Customer orders
  orders: [],
  selectedOrder: null,
  orderSummary: null,
  
  // Affiliate data
  affiliateOrders: [],
  affiliateStats: null,
  
  // Admin data
  adminOrders: [],
  adminStats: null,
  
  // Pagination
  pagination: { currentPage, itemsPerPage, totalItems, totalPages, hasMore },
  
  // Filters
  filters: { status, paymentStatus, dateFrom, dateTo, minAmount, maxAmount, sortBy, sortOrder },
  
  // Search
  searchQuery: '',
  searchResults: [],
  
  // Loading/Error states
  isLoading: false,
  isLoadingDetails: false,
  isSearching: false,
  isUpdating: false,
  error: null,
  errorDetails: null
}
```

### Store Actions

```javascript
// Customer actions
store.fetchOrders(options)
store.fetchOrderDetails(orderId)
store.fetchOrderSummary()
store.searchOrders(criteria)
store.setFilters(newFilters)
store.clearFilters()
store.setPagination(page, limit)

// Affiliate actions
store.fetchAffiliateOrders(options)

// Admin actions
store.fetchAdminOrders(options)
store.updateOrderStatus(orderId, status, reason)

// Utility actions
store.clearError()
store.reset()
```

### Selectors (with useShallow for performance)

```javascript
import { useOrdersList, useOrderPagination, useOrderError } from '@/stores/orderStore';

const orders = useOrdersList();
const pagination = useOrderPagination();
const { error } = useOrderError();
```

---

## Custom Hooks

### Location
`src/hooks/useOrders.js`

### Main Hooks

#### useOrders()
Complete hook for customer order management.

```javascript
import { useOrders } from '@/hooks/useOrders';

function MyComponent() {
  const {
    orders,
    pagination,
    filters,
    isLoading,
    fetchOrders,
    setFilters,
    clearFilters,
    setPagination
  } = useOrders();

  // Auto-fetch on mount
  useEffect(() => {
    fetchOrders();
  }, []);

  // Apply filters
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchOrders({ page: 1 });
  };

  // Change page
  const handlePageChange = (page) => {
    setPagination(page, pagination.itemsPerPage);
    fetchOrders({ page });
  };

  return (
    <OrdersList
      orders={orders}
      pagination={pagination}
      isLoading={isLoading}
      onFilterChange={handleFilterChange}
      onPaginationChange={handlePageChange}
    />
  );
}
```

#### useOrderDetails(orderId)
Fetch and manage individual order details with auto-refetch.

```javascript
import { useOrderDetails } from '@/hooks/useOrders';

function OrderDetailView({ params }) {
  const { orderId } = params;
  const { order, isLoading, error, refetch } = useOrderDetails(orderId);

  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return <OrderDetails order={order} />;
}
```

#### useOrderSummaryHook()
Get user's order statistics.

```javascript
import { useOrderSummaryHook } from '@/hooks/useOrders';

function SummaryCard() {
  const { summary, isLoading } = useOrderSummaryHook();

  return (
    <div>
      <p>Total Orders: {summary?.totalOrders}</p>
      <p>Total Spent: ${summary?.totalSpent}</p>
    </div>
  );
}
```

#### useOrderSearch()
Advanced order search functionality.

```javascript
import { useOrderSearch } from '@/hooks/useOrders';

function SearchOrders() {
  const { search, isSearching } = useOrderSearch();

  const handleSearch = async () => {
    const { orders } = await search({
      orderNumber: 'ORD-123',
      status: 'shipped'
    });
  };

  return <button onClick={handleSearch}>Search</button>;
}
```

#### useAffiliateOrdersHook()
Affiliate-specific orders and commissions.

```javascript
import { useAffiliateOrdersHook } from '@/hooks/useOrders';

function AffiliateOrders() {
  const {
    orders,
    statistics,
    pagination,
    isLoading,
    fetchAffiliateOrders,
    setPagination
  } = useAffiliateOrdersHook();

  useEffect(() => {
    fetchAffiliateOrders({ page: 1, limit: 20 });
  }, []);

  return (
    <div>
      <div>Total Commission: ${statistics?.totalCommission}</div>
      <OrderTable orders={orders} />
    </div>
  );
}
```

#### useAdminOrdersHook()
Admin orders management with full filtering.

```javascript
import { useAdminOrdersHook } from '@/hooks/useOrders';

function AdminOrders() {
  const {
    orders,
    statistics,
    pagination,
    filters,
    isLoading,
    fetchAdminOrders,
    setFilters,
    setPagination
  } = useAdminOrdersHook();

  const handleFilter = (newFilters) => {
    setFilters(newFilters);
    fetchAdminOrders({ page: 1, limit: 20, filters: newFilters });
  };

  return <AdminOrdersTable orders={orders} onFilter={handleFilter} />;
}
```

#### useOrderStatusUpdate()
Update order status (admin only).

```javascript
import { useOrderStatusUpdate } from '@/hooks/useOrders';

function OrderStatusUpdater({ orderId }) {
  const { updateStatus, isUpdating, error } = useOrderStatusUpdate();

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(orderId, newStatus, 'Reason for change');
    } catch (err) {
      console.error('Update failed:', err);
    }
  };

  return <select onChange={(e) => handleStatusChange(e.target.value)} />;
}
```

### Utility Hooks

```javascript
// Page-level data fetching
const { orders, pagination, isLoading, error, refetch } = useOrdersPage();

// Get filters
const { filters, updateFilter, reset } = useOrderFilterState();

// Get pagination
const { currentPage, goToPage, nextPage, prevPage } = useOrderPaginationState();

// Loading states
const { isLoading, isLoadingDetails, isSearching, isUpdating } = useOrdersLoading();

// Error handling
const { error, clearError } = useOrdersError();
```

---

## UI Components

### OrderStatusBadge
Displays order status with appropriate styling.

```javascript
import { OrderStatusBadge, PaymentStatusBadge, CommissionStatusBadge } from '@/components/orders/OrderStatusBadge';

<OrderStatusBadge status="shipped" />
<PaymentStatusBadge status="paid" />
<CommissionStatusBadge status="pending" />
```

### OrderCard
Individual order card component.

```javascript
import OrderCard from '@/components/orders/OrderCard';

<OrderCard 
  order={orderData} 
  showActions={true}
/>
```

### OrdersList
Complete orders listing with filters and pagination.

```javascript
import OrdersList from '@/components/orders/OrdersList';

<OrdersList
  orders={orders}
  pagination={pagination}
  filters={filters}
  isLoading={isLoading}
  onFilterChange={handleFilterChange}
  onPaginationChange={handlePaginationChange}
/>
```

### OrderDetails
Full order information display.

```javascript
import OrderDetails from '@/components/orders/OrderDetails';

<OrderDetails
  order={order}
  isLoading={isLoading}
  error={error}
/>
```

---

## Pages

### Customer Orders Page
**Route:** `/orders`
**File:** `src/app/orders/page.jsx`

Shows customer's orders with filtering by status and pagination.

### Order Details Page
**Route:** `/orders/[orderId]`
**File:** `src/app/orders/[orderId]/page.jsx`

Complete order information with all details and items.

### Invoice Page
**Route:** `/orders/[orderId]/invoice`
**File:** `src/app/orders/[orderId]/invoice/page.jsx`

Printable invoice view with print and download options.

### Affiliate Orders Dashboard
**Route:** `/affiliate/orders`
**File:** `src/app/affiliate/orders/page.jsx`

Dashboard showing:
- Referred orders list
- Commission statistics (total, paid, pending)
- Sales tracking
- Commission status for each order

### Admin Orders Dashboard
**Route:** `/admin/orders`
**File:** `src/app/admin/orders/page.jsx`

Complete order management with:
- Advanced filtering (status, payment status, date range, user, affiliate)
- Inline order status updates
- Order statistics
- Search functionality
- Pagination

---

## Order Status Lifecycle

Valid order status transitions:

```
pending
├── processing
│   ├── confirmed
│   │   ├── shipped
│   │   │   ├── delivered (or)
│   │   │   └── returned
│   │   └── cancelled
│   └── cancelled
└── cancelled

Final states: delivered, returned, cancelled, complete
```

---

## Payment Status Values

- `paid`: Payment completed successfully
- `pending`: Awaiting payment
- `failed`: Payment failed
- `refunded`: Payment refunded

---

## Commission Status Values (Affiliate)

- `pending`: Commission awaiting calculation
- `calculated`: Commission calculated
- `approved`: Commission approved for payout
- `paid`: Commission paid out
- `reversed`: Commission reversed

---

## Integration Examples

### Example 1: Customer Orders Page with Initialization

```javascript
'use client';

import { useEffect } from 'react';
import { useOrders } from '@/hooks/useOrders';
import OrdersList from '@/components/orders/OrdersList';

export default function OrdersPage() {
  const {
    orders,
    pagination,
    filters,
    isLoading,
    fetchOrders,
    setFilters,
    setPagination
  } = useOrders();

  // Fetch orders on mount
  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchOrders({ page: 1 });
  };

  const handlePageChange = (page) => {
    setPagination(page, 10);
    fetchOrders({ page });
  };

  return (
    <OrdersList
      orders={orders}
      pagination={pagination}
      filters={filters}
      isLoading={isLoading}
      onFilterChange={handleFilterChange}
      onPaginationChange={handlePageChange}
    />
  );
}
```

### Example 2: Order Details with Auto-Refetch

```javascript
'use client';

import { useOrderDetails } from '@/hooks/useOrders';
import OrderDetails from '@/components/orders/OrderDetails';

export default function OrderDetailPage({ params }) {
  const { orderId } = params;
  const { order, isLoading, error, refetch } = useOrderDetails(orderId);

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <OrderDetails order={order} isLoading={isLoading} error={error} />
    </div>
  );
}
```

### Example 3: Affiliate Dashboard

```javascript
'use client';

import { useEffect } from 'react';
import { useAffiliateOrdersHook } from '@/hooks/useOrders';

export default function AffiliateOrdersPage() {
  const {
    orders,
    statistics,
    isLoading,
    fetchAffiliateOrders
  } = useAffiliateOrdersHook();

  useEffect(() => {
    fetchAffiliateOrders({ page: 1, limit: 20 });
  }, [fetchAffiliateOrders]);

  if (isLoading) return <div>Loading...</div>;

  return (
    <div>
      <h1>Affiliate Orders</h1>
      <div>Total Commission: ${statistics?.totalCommission}</div>
      <div>Pending Commission: ${statistics?.pendingCommission}</div>
      <OrderTable orders={orders} />
    </div>
  );
}
```

### Example 4: Admin Order Status Update

```javascript
'use client';

import { useOrderStatusUpdate } from '@/hooks/useOrders';

function OrderStatusSelector({ orderId, currentStatus }) {
  const { updateStatus, isUpdating, error } = useOrderStatusUpdate();

  const handleStatusChange = async (newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      alert('Status updated successfully!');
    } catch (err) {
      alert(`Error: ${error}`);
    }
  };

  return (
    <select 
      value={currentStatus} 
      onChange={(e) => handleStatusChange(e.target.value)}
      disabled={isUpdating}
    >
      <option value="pending">Pending</option>
      <option value="processing">Processing</option>
      <option value="shipped">Shipped</option>
      <option value="delivered">Delivered</option>
      <option value="cancelled">Cancelled</option>
    </select>
  );
}
```

---

## Data Structures

### Order Object

```javascript
{
  _id: "66ae5f1c3b8d0a001f2b3c4d",
  userId: "66ae5f1c3b8d0a001f2b3c4d",
  orderNumber: "ORD-20240314-123456",
  items: [
    {
      productId: "...",
      productName: "Product Name",
      sku: "SKU123",
      variant: { color: "red", size: "M" },
      quantity: 2,
      price: 99.99,
      subtotal: 199.98
    }
  ],
  subtotal: 199.98,
  tax: 16.00,
  shipping: 0,
  discount: 0,
  total: 215.98,
  paymentStatus: "paid",  // pending, paid, failed, refunded
  orderStatus: "shipped",  // 9 possible statuses
  paymentDetails: {
    stripeSessionId: "cs_test_...",
    paymentIntentId: "pi_...",
    chargeId: "ch_...",
    paidAt: "2024-03-14T10:00:00Z"
  },
  affiliateDetails: {
    affiliateId: "...",
    affiliateCode: "AFF123",
    commissionRate: 0.10,
    commissionAmount: 19.99,
    status: "pending"  // pending, calculated, approved, paid, reversed
  },
  createdAt: "2024-03-14T10:00:00Z",
  updatedAt: "2024-03-14T10:00:00Z"
}
```

### Pagination Object

```javascript
{
  currentPage: 1,
  itemsPerPage: 10,
  totalItems: 100,
  totalPages: 10,
  hasMore: true
}
```

### Statistics Objects

**Customer Summary:**
```javascript
{
  totalOrders: 5,
  totalSpent: 1099.95,
  averageOrder: 219.99,
  lastOrderDate: "2024-03-14T10:00:00Z",
  pendingOrders: 1
}
```

**Affiliate Stats:**
```javascript
{
  totalCommission: 250.00,
  paidCommission: 100.00,
  pendingCommission: 150.00,
  totalSales: 2500.00
}
```

**Admin Stats:**
```javascript
{
  totalAmount: 10000.00,
  paidAmount: 9000.00,
  refundedAmount: 500.00,
  averageOrder: 200.00,
  ordersCount: 50
}
```

---

## Error Handling

### API Errors

All API calls include comprehensive error handling:

```javascript
try {
  const { orders } = await orderService.getUserOrders();
} catch (err) {
  // err.message: Human-readable error message
  // err.details: Detailed error information
  // err.status: HTTP status code (401, 403, 404, 500, etc.)
  
  console.error(err.message);
}
```

### Common Errors

| Error | Cause | Solution |
|-------|-------|----------|
| 401 Unauthorized | Missing or invalid JWT token | Check authentication |
| 403 Forbidden | Insufficient permissions for operation | Verify user role |
| 404 Not Found | Order not found | Check order ID |
| 422 Unprocessable Entity | Invalid data submitted | Check request parameters |
| 500 Server Error | Backend error | Contact support |

### Store Error Handling

```javascript
import { useOrdersError } from '@/hooks/useOrders';

function MyComponent() {
  const { error, errorDetails, clearError } = useOrdersError();

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <p>{error}</p>
        <button onClick={clearError}>Dismiss</button>
      </div>
    );
  }
}
```

---

## Performance Optimization

### 1. Selector Memoization
Using `useShallow` for object comparisons:

```javascript
const pagination = useOrderPagination();  // Returns memoized object
const { isLoading, error } = useOrderLoading();  // Returns memoized object
```

### 2. Pagination
Always use pagination for large datasets:

```javascript
// Instead of fetching all orders
const { orders } = await orderService.getUserOrders({
  page: 1,
  limit: 20  // Fetch only 20 per page
});
```

### 3. Debouncing Search
Implement search debouncing to reduce API calls:

```javascript
import { useCallback } from 'react';
import debounce from 'lodash/debounce';

const debouncedSearch = useCallback(
  debounce(async (query) => {
    const { orders } = await orderService.searchOrders({ search: query });
  }, 300),
  []
);
```

### 4. Lazy Loading Components
Use dynamic imports for heavy components:

```javascript
import dynamic from 'next/dynamic';

const AdminDashboard = dynamic(() => import('@/components/AdminDashboard'), {
  loading: () => <div>Loading...</div>
});
```

---

## Security Best Practices

1. **Authentication:**
   - JWT tokens sent with every request via Authorization header
   - Automatically handled by axios interceptor

2. **Data Privacy:**
   - Users can only see their own orders
   - Affiliates can only see their referred orders
   - Admins see all orders with role validation

3. **Admin Operations:**
   - Only admins can update order status
   - Only admins can view all orders
   - Role verification on backend

4. **Invoice Handling:**
   - Never expose sensitive payment details in frontend
   - Use secure print/download mechanisms

---

## Common Gotchas & Solutions

### 1. Infinite Loop on Filter Changes

**Problem:** Filters reset causing infinite re-renders

**Solution:**
```javascript
// Don't include store in dependency arrays
useEffect(() => {
  fetchOrders();
}, [fetchOrders]);  // fetchOrders is stable

// Or use useCallback with proper dependencies
const handleFetch = useCallback(() => {
  fetchOrders(filters);
}, [filters]);
```

### 2. States Not Updating

**Problem:** Changes don't reflect in UI

**Solution:**
```javascript
// Make sure to use the store's setFilters
const { setFilters, fetchOrders } = useOrders();

const handleFilterChange = (newFilters) => {
  setFilters(newFilters);  // Update store
  fetchOrders({ page: 1 }); // Fetch with new filters
};
```

### 3. Stale OrderId in Details Page

**Problem:** OrderId param not used to fetch data

**Solution:**
```javascript
// Pass orderId explicitly
const { orderId } = params;
const { order } = useOrderDetails(orderId);

// Hook handles auto-fetch when orderId changes
useEffect(() => {
  if (orderId) {
    fetchOrderDetails(orderId);
  }
}, [orderId]);
```

### 4. No Action Feedback

**Problem:** User doesn't know if action succeeded

**Solution:**
```javascript
const handleStatusUpdate = async (orderId, newStatus) => {
  try {
    await updateStatus(orderId, newStatus);
    toast.success('Status updated successfully!');
    refetch();  // Refresh data
  } catch (err) {
    toast.error(`Error: ${err.message}`);
  }
};
```

---

## Testing

### Unit Testing Hooks

```javascript
import { renderHook, act, waitFor } from '@testing-library/react';
import { useOrders } from '@/hooks/useOrders';

test('fetches orders on mount', async () => {
  const { result } = renderHook(() => useOrders());

  await act(async () => {
    await result.current.fetchOrders();
  });

  await waitFor(() => {
    expect(result.current.orders.length).toBeGreaterThan(0);
  });
});
```

### Component Testing

```javascript
import { render, screen } from '@testing-library/react';
import OrderCard from '@/components/orders/OrderCard';

test('displays order number', () => {
  const order = { 
    _id: '123',
    orderNumber: 'ORD-123',
    total: 50,
    items: []
  };
  
  render(<OrderCard order={order} />);
  expect(screen.getByText('ORD-123')).toBeInTheDocument();
});
```

---

## Troubleshooting

### Issue: Orders not loading

**Debug Steps:**
1. Check Network tab for API errors
2. Verify JWT token in Authorization header
3. Check browser console for JavaScript errors
4. Verify backend API endpoint is reachable

### Issue: Pagination not working

**Debug Steps:**
1. Check pagination.hasMore value
2. Verify page parameter is changing
3. Clear browser cache
4. Check API response for pagination fields

### Issue: Filters not applying

**Debug Steps:**
1. Verify setFilters is being called
2. Check filters object in Redux DevTools (Zustand DevTools)
3. Ensure fetchOrders is called after setFilters
4. Clear local component filters state

### Issue: Status updates failing

**Debug Steps:**
1. Check if user is admin (403 error)
2. Verify orderId is correct
3. Check if status value is in valid list
4. Check for permission errors

---

## Deployment Checklist

- [ ] All environment variables configured
- [ ] Backend API endpoints correct for environment
- [ ] JWT token handling working
- [ ] Page routes registered in Next.js
- [ ] Responsive design tested on mobile
- [ ] Error messages helpful to users
- [ ] Loading states functional
- [ ] Pagination tested with large datasets
- [ ] Invoice print/download working
- [ ] Admin filters functional
- [ ] Affiliate commission calculations correct
- [ ] Performance optimized (pagination, selectors)
- [ ] No console errors/warnings
- [ ] Security scan completed (no exposed tokens)

---

## Support & Maintenance

### Monitoring

Monitor these metrics:
- API response times
- Error rates
- User session duration
- Order processing time
- Commission calculation accuracy

### Updates

Regularly update:
- Order status validation rules
- Commission calculation rates
- API filtering options
- UI/UX based on user feedback

---

## Related Documentation

- Backend Order APIs: See `BACKEND_ORDER_API.md`
- Checkout System: See `CHECKOUT_SYSTEM_INTEGRATION_GUIDE.md`
- Cart System: See `CART_SYSTEM_INTEGRATION_GUIDE.md`
- Authentication: See `AUTHENTICATION_SYSTEM.md`

---

**Last Updated:** March 2024
**Version:** 1.0
**Status:** Production Ready
