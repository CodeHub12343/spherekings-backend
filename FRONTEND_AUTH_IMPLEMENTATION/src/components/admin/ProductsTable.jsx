/**
 * ProductsTable - Table component for displaying products
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

const PriceCell = styled.td`
  font-weight: 600;
  color: #3b82f6;
`;

interface Product {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  status: string;
  price: number;
  stock?: number;
  createdAt: string;
}

interface ProductsTableProps {
  products: Product[];
  isLoading?: boolean;
  onProductClick?: (product: Product) => void;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

export function ProductsTable({ products = [], isLoading = false, onProductClick }: ProductsTableProps) {
  if (isLoading) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <LoadingRow>
              <td colSpan={6}>Loading products...</td>
            </LoadingRow>
          </tbody>
        </Table>
      </TableContainer>
    );
  }

  if (products.length === 0) {
    return (
      <TableContainer>
        <Table>
          <thead>
            <tr>
              <th>Product Name</th>
              <th>Category</th>
              <th>Price</th>
              <th>Stock</th>
              <th>Status</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>
            <EmptyRow>
              <td colSpan={6}>No products found</td>
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
            <th>Product Name</th>
            <th>Category</th>
            <th>Price</th>
            <th>Stock</th>
            <th>Status</th>
            <th>Date</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <tr
              key={product._id || product.id}
              onClick={() => onProductClick?.(product)}
              style={{ cursor: onProductClick ? 'pointer' : 'default' }}
            >
              <td style={{ fontWeight: 500 }}>{product.name}</td>
              <td>{product.category}</td>
              <PriceCell>{formatCurrency(product.price)}</PriceCell>
              <td>{product.stock ?? 'N/A'}</td>
              <td>
                <StatusBadge status={product.status} />
              </td>
              <td>{formatDate(product.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </TableContainer>
  );
}
