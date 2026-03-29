/**
 * Order Management System - Implementation Examples
 * 
 * Complete working examples demonstrating:
 * 1. Customer orders listing with filters
 * 2. Order details page
 * 3. Affiliate orders dashboard
 * 4. Admin order management
 * 5. Invoice viewer and download
 * 6. Order search functionality
 * 7. Real-time status updates
 * 8. Commission tracking
 */

// ==========================================
// EXAMPLE 1: Customer Orders Listing Page
// ==========================================

import { useEffect } from 'react';
import styled from 'styled-components';
import { useOrders } from '@/hooks/useOrders';
import OrdersList from '@/components/orders/OrdersList';

export function CustomerOrdersExample() {
  const {
    orders,
    pagination,
    filters,
    isLoading,
    fetchOrders,
    setFilters,
    clearFilters,
    setPagination,
  } = useOrders();

  // Fetch initial orders
  useEffect(() => {
    fetchOrders();
  }, []);

  // Fetch when page changes
  const handlePaginationChange = (page, limit) => {
    setPagination(page, limit);
    fetchOrders({ page, limit });
  };

  // Apply filters and reset to page 1
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
    fetchOrders({ page: 1 });
  };

  // Clear all filters
  const handleClearFilters = () => {
    clearFilters();
    fetchOrders({ page: 1 });
  };

  return (
    <OrdersList
      orders={orders}
      pagination={pagination}
      filters={filters}
      isLoading={isLoading}
      onFilterChange={handleFilterChange}
      onPaginationChange={handlePaginationChange}
    />
  );
}

// ==========================================
// EXAMPLE 2: Order Details Page
// ==========================================

import { useOrderDetails } from '@/hooks/useOrders';
import OrderDetails from '@/components/orders/OrderDetails';

export function OrderDetailsPageExample({ orderId }) {
  const { order, isLoading, error, refetch } = useOrderDetails(orderId);

  if (isLoading) {
    return <div>Loading order details...</div>;
  }

  if (error) {
    return (
      <div style={{ color: 'red' }}>
        <p>Error: {error}</p>
        <button onClick={refetch}>Retry</button>
      </div>
    );
  }

  return (
    <div>
      <button onClick={refetch}>Refresh</button>
      <OrderDetails order={order} />
    </div>
  );
}

// ==========================================
// EXAMPLE 3: Affiliate Orders Dashboard
// ==========================================

import { 
  useAffiliateOrdersHook, 
  useOrderPaginationState 
} from '@/hooks/useOrders';
import { CommissionStatusBadge } from '@/components/orders/OrderStatusBadge';

export function AffiliateOrdersDashboardExample() {
  const {
    orders,
    statistics,
    pagination,
    isLoading,
    error,
    fetchAffiliateOrders,
    setPagination,
  } = useAffiliateOrdersHook();

  useEffect(() => {
    fetchAffiliateOrders({ page: 1, limit: 20 });
  }, []);

  const handlePageChange = (page) => {
    setPagination(page, 20);
    fetchAffiliateOrders({ page, limit: 20 });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div>
      <h1>Affiliate Dashboard</h1>

      {/* Commission Statistics */}
      {statistics && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
          <div style={{ padding: '16px', background: '#f0f9ff', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#666' }}>Total Commission</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {formatPrice(statistics.totalCommission)}
            </p>
          </div>

          <div style={{ padding: '16px', background: '#f0fef0', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#666' }}>Pending Commission</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {formatPrice(statistics.pendingCommission)}
            </p>
          </div>

          <div style={{ padding: '16px', background: '#fef0f0', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#666' }}>Paid Commission</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {formatPrice(statistics.paidCommission)}
            </p>
          </div>

          <div style={{ padding: '16px', background: '#fef8f0', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#666' }}>Total Sales</p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {formatPrice(statistics.totalSales)}
            </p>
          </div>
        </div>
      )}

      {/* Orders Table */}
      {isLoading ? (
        <div>Loading orders...</div>
      ) : orders.length > 0 ? (
        <div>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Order Total</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Commission</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{order.orderNumber}</td>
                  <td style={{ padding: '12px' }}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {formatPrice(order.total)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {formatPrice(order.affiliateDetails?.commissionAmount || 0)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <CommissionStatusBadge 
                      status={order.affiliateDetails?.status} 
                    />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          {pagination?.totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '24px' }}>
              <button 
                onClick={() => handlePageChange(pagination.currentPage - 1)}
                disabled={pagination.currentPage === 1}
              >
                Previous
              </button>
              <span>{pagination.currentPage} / {pagination.totalPages}</span>
              <button 
                onClick={() => handlePageChange(pagination.currentPage + 1)}
                disabled={!pagination.hasMore}
              >
                Next
              </button>
            </div>
          )}
        </div>
      ) : (
        <div>No orders found</div>
      )}
    </div>
  );
}

// ==========================================
// EXAMPLE 4: Admin Order Management
// ==========================================

import { useAdminOrdersHook, useOrderStatusUpdate } from '@/hooks/useOrders';
import { OrderStatusBadge, PaymentStatusBadge } from '@/components/orders/OrderStatusBadge';

export function AdminOrderManagementExample() {
  const {
    orders,
    statistics,
    pagination,
    filters,
    isLoading,
    error,
    fetchAdminOrders,
    setFilters,
    setPagination,
  } = useAdminOrdersHook();

  const { updateStatus, isUpdating } = useOrderStatusUpdate();

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchAdminOrders({ page: 1, limit: 20 });
  }, []);

  const handleFilter = () => {
    const newFilters = {};
    if (statusFilter) newFilters.status = statusFilter;
    if (searchTerm) newFilters.search = searchTerm;

    setFilters(newFilters);
    fetchAdminOrders({ page: 1, limit: 20, filters: newFilters });
  };

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateStatus(orderId, newStatus);
      alert('Status updated successfully!');
      // Refresh orders
      fetchAdminOrders({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        filters,
      });
    } catch (err) {
      alert(`Error: ${err.message}`);
    }
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <div>
      <h1>Order Management</h1>

      {/* Statistics */}
      {statistics && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
          gap: '16px', 
          marginBottom: '32px' 
        }}>
          <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
              Total Orders
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {statistics.ordersCount}
            </p>
          </div>

          <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
              Total Revenue
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {formatPrice(statistics.totalAmount)}
            </p>
          </div>

          <div style={{ padding: '16px', border: '1px solid #ddd', borderRadius: '8px' }}>
            <p style={{ margin: '0 0 8px 0', color: '#666', fontSize: '14px' }}>
              Average Order
            </p>
            <p style={{ margin: 0, fontSize: '24px', fontWeight: 'bold' }}>
              {formatPrice(statistics.averageOrder)}
            </p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div style={{ 
        padding: '16px', 
        background: '#f9f9f9', 
        borderRadius: '8px', 
        marginBottom: '24px' 
      }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '12px', marginBottom: '12px' }}>
          <input
            type="text"
            placeholder="Search order number or user ID"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          />

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ padding: '8px', border: '1px solid #ddd', borderRadius: '4px' }}
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="processing">Processing</option>
            <option value="shipped">Shipped</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <button 
          onClick={handleFilter}
          style={{ 
            padding: '8px 16px', 
            background: '#2563eb', 
            color: 'white', 
            border: 'none', 
            borderRadius: '4px', 
            cursor: 'pointer' 
          }}
        >
          Apply Filters
        </button>
      </div>

      {/* Orders Table */}
      {isLoading ? (
        <div>Loading orders...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : orders.length > 0 ? (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd', background: '#f9f9f9' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Payment</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order._id} style={{ borderBottom: '1px solid #ddd' }}>
                  <td style={{ padding: '12px' }}>{order.orderNumber}</td>
                  <td style={{ padding: '12px', fontSize: '12px', fontFamily: 'monospace' }}>
                    {order.userId?.substring(0, 8)}...
                  </td>
                  <td style={{ padding: '12px', textAlign: 'right' }}>
                    {formatPrice(order.total)}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={order.orderStatus}
                      onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      disabled={isUpdating}
                      style={{ 
                        padding: '6px', 
                        borderRadius: '4px', 
                        border: '1px solid #ddd',
                        cursor: 'pointer'
                      }}
                    >
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td style={{ padding: '12px' }}>
                    <PaymentStatusBadge status={order.paymentStatus} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div>No orders found</div>
      )}
    </div>
  );
}

// ==========================================
// EXAMPLE 5: Invoice Viewer & Download
// ==========================================

export function InvoiceViewerExample({ orderId, order }) {
  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = () => {
    // This would typically use a library like react-pdf or html2pdf
    // For now, we'll use browser's print-to-PDF feature
    window.print();
  };

  if (!order) {
    return <div>Loading invoice...</div>;
  }

  return (
    <div>
      {/* Print Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '24px' }}>
        <h1>Invoice</h1>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button onClick={handlePrint}>Print</button>
          <button onClick={handleDownloadPDF}>Save as PDF</button>
        </div>
      </div>

      {/* Invoice Container */}
      <div style={{ border: '1px solid #ddd', padding: '32px', borderRadius: '8px', maxWidth: '900px' }}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '32px', paddingBottom: '24px', borderBottom: '2px solid #ddd' }}>
          <div>
            <h2 style={{ margin: 0 }}>Spherekings</h2>
            <p style={{ margin: '4px 0', color: '#666' }}>Your Marketplace</p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>Invoice #:</strong> {order.orderNumber}
            </p>
            <p style={{ margin: '0 0 4px 0' }}>
              <strong>Date:</strong> {new Date(order.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table style={{ width: '100%', borderCollapse: 'collapse', marginBottom: '32px' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd', background: '#f9f9f9' }}>
              <th style={{ padding: '12px', textAlign: 'left' }}>Product</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Qty</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Price</th>
              <th style={{ padding: '12px', textAlign: 'right' }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {order.items?.map((item, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid #eee' }}>
                <td style={{ padding: '12px' }}>{item.productName}</td>
                <td style={{ padding: '12px', textAlign: 'center' }}>{item.quantity}</td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {formatPrice(item.price)}
                </td>
                <td style={{ padding: '12px', textAlign: 'right' }}>
                  {formatPrice(item.subtotal)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '32px' }}>
          <div style={{ width: '300px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span>Subtotal:</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            {order.tax > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Tax:</span>
                <span>{formatPrice(order.tax)}</span>
              </div>
            )}
            {order.shipping > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <span>Shipping:</span>
                <span>{formatPrice(order.shipping)}</span>
              </div>
            )}
            <div style={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              paddingTop: '12px', 
              borderTop: '2px solid #ddd',
              fontWeight: 'bold',
              fontSize: '16px'
            }}>
              <span>Total:</span>
              <span>{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div style={{ textAlign: 'center', color: '#666', fontSize: '12px', borderTop: '1px solid #ddd', paddingTop: '16px' }}>
          <p>Thank you for your purchase!</p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// EXAMPLE 6: Order Search with Debounce
// ==========================================

import debounce from 'lodash/debounce';
import { useOrderSearch } from '@/hooks/useOrders';

export function OrderSearchExample() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const { search, isSearching } = useOrderSearch();

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce(async (query) => {
      if (query.length > 2) {
        const { orders } = await search({
          orderNumber: query
        });
        setSearchResults(orders);
      }
    }, 500),
    [search]
  );

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    debouncedSearch(value);
  };

  return (
    <div>
      <input
        type="text"
        placeholder="Search orders..."
        value={searchQuery}
        onChange={handleSearchChange}
        style={{ padding: '8px', width: '100%', maxWidth: '400px' }}
      />

      {isSearching && <p>Searching...</p>}

      {searchResults.length > 0 && (
        <div>
          <h3>Results: {searchResults.length}</h3>
          {searchResults.map((order) => (
            <div key={order._id} style={{ padding: '12px', border: '1px solid #ddd', marginBottom: '8px', borderRadius: '4px' }}>
              <p><strong>{order.orderNumber}</strong></p>
              <p>Total: ${order.total}</p>
              <p>Status: {order.orderStatus}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ==========================================
// EXAMPLE 7: Real-time Status Updates
// ==========================================

import { useOrderStatusUpdate } from '@/hooks/useOrders';

export function RealTimeStatusUpdateExample({ orderId, currentStatus }) {
  const { updateStatus, isUpdating, error } = useOrderStatusUpdate();
  const [statusMessage, setStatusMessage] = useState('');

  const handleStatusChange = async (newStatus) => {
    try {
      setStatusMessage('Updating...');
      await updateStatus(orderId, newStatus, 'Status updated from admin panel');
      setStatusMessage('✓ Status updated successfully!');
      setTimeout(() => setStatusMessage(''), 3000);
    } catch (err) {
      setStatusMessage(`✗ Error: ${error}`);
    }
  };

  return (
    <div>
      <select 
        value={currentStatus} 
        onChange={(e) => handleStatusChange(e.target.value)}
        disabled={isUpdating}
        style={{ 
          padding: '8px', 
          borderRadius: '4px', 
          border: '1px solid #ddd',
          cursor: 'pointer'
        }}
      >
        <option value="pending">Pending</option>
        <option value="processing">Processing</option>
        <option value="shipped">Shipped</option>
        <option value="delivered">Delivered</option>
      </select>

      {statusMessage && (
        <p style={{ marginTop: '8px', color: statusMessage.includes('✓') ? 'green' : 'red' }}>
          {statusMessage}
        </p>
      )}
    </div>
  );
}

// ==========================================
// EXAMPLE 8: Commission Tracking Widget
// ==========================================

import { useAffiliateOrdersHook } from '@/hooks/useOrders';

export function CommissionTrackingWidgetExample() {
  const { statistics, isLoading } = useAffiliateOrdersHook();

  if (isLoading) {
    return <div>Loading...</div>;
  }

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price || 0);
  };

  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      color: 'white',
      padding: '24px',
      borderRadius: '8px'
    }}>
      <h2 style={{ margin: '0 0 16px 0' }}>Commission Earnings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
        <div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Pending</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>
            {formatPrice(statistics?.pendingCommission)}
          </p>
        </div>

        <div>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Paid</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '24px', fontWeight: 'bold' }}>
            {formatPrice(statistics?.paidCommission)}
          </p>
        </div>

        <div style={{ gridColumn: '1 / -1' }}>
          <p style={{ margin: 0, opacity: 0.9, fontSize: '14px' }}>Total Commission</p>
          <p style={{ margin: '8px 0 0 0', fontSize: '28px', fontWeight: 'bold' }}>
            {formatPrice(statistics?.totalCommission)}
          </p>
        </div>
      </div>
    </div>
  );
}

export default {
  CustomerOrdersExample,
  OrderDetailsPageExample,
  AffiliateOrdersDashboardExample,
  AdminOrderManagementExample,
  InvoiceViewerExample,
  OrderSearchExample,
  RealTimeStatusUpdateExample,
  CommissionTrackingWidgetExample,
};
