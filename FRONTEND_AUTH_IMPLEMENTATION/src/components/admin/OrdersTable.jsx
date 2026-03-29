/**
 * OrdersTable - Table component for displaying orders
 * Shows order details, status, amounts, and affiliate information
 */

'use client';

import styled from 'styled-components';
import { StatusBadge } from './StatusBadge';

const TableContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background: #f9fafb;
    border-bottom: 1px solid #e5e7eb;
  }

  th {
    padding: 12px 16px;
    text-align: left;
    font-size: 12px;
    font-weight: 600;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    background: #f9fafb;
  }

  td {
    padding: 12px 16px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 13px;
    color: #374151;
  }

  tbody tr {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: #f9fafb;
    }
  }
`;

const IdCell = styled.td`
  font-size: 12px;
  color: #6b7280;
  font-family: 'Courier New', monospace;
`;

const AmountCell = styled.td`
  font-weight: 600;
  color: #10b981;
`;

const LoadingRow = styled.tr`
  td {
    text-align: center;
    padding: 32px 16px;
    color: #9ca3af;
  }
`;

const EmptyRow = styled.tr`
  td {
    text-align: center;
    padding: 32px 16px;
    color: #9ca3af;
  }
`;

interface Order {
  _id?: string;
  id?: string;
  status: string;
  totalAmount: number;
  userId?: string;
  affiliateDetails?: {
    affiliateId?: string;
    affiliateName?: string;
  };
  paymentMethod?: string;
  createdAt: string;
  updatedAt?: string;
}

interface OrdersTableProps {
  orders: Order[];
  isLoading?: boolean;
  onOrderClick?: (order: Order) => void;
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const truncateId = (id: string) => {
  return id ? id.slice(0, 8) + '...' : '-';
};

export function OrdersTable({ orders = [], isLoading = false, onOrderClick }: OrdersTableProps) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Affiliate</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <LoadingRow>
              <td colSpan={5}>Loading orders...</td>
            </LoadingRow>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  if (orders.length === 0) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Order ID</th>
              <th>Status</th>
              <th>Total Amount</th>
              <th>Affiliate</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <EmptyRow>
              <td colSpan={5}>No orders found</td>
            </EmptyRow>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <th>Order ID</th>
            <th>Status</th>
            <th>Total Amount</th>
            <th>Affiliate</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr
              key={order._id || order.id}
              onClick={() => onOrderClick?.(order)}
              style={{ cursor: onOrderClick ? 'pointer' : 'default' }}
            >
              <IdCell title={order._id || order.id}>{truncateId(order._id || order.id || '')}</IdCell>
              <td>
                <StatusBadge status={order.status} />
              </td>
              <AmountCell>{formatCurrency(order.totalAmount)}</AmountCell>
              <td>{order.affiliateDetails?.affiliateName || '-'}</td>
              <td>{formatDate(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
