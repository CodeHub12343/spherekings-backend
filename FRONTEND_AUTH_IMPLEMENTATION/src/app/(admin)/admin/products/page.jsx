'use client';

import { useState } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { useProducts, useDeleteProduct } from '@/hooks/useProducts';
import { Edit2, Trash2, Plus, Eye, MoreVertical, Star, Copy, ToggleLeft, ToggleRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';

// ============================================================================
// DESKTOP TABLE STYLES
// ============================================================================

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 20px;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
  }
`;

const PageHeader = styled.div`
  max-width: 1400px;
  margin: 0 auto 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 20px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 16px;
    margin-bottom: 24px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 16px;
  }
`;

const TitleSection = styled.div`
  flex: 1;
  min-width: 0;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }

  @media (max-width: 480px) {
    font-size: 20px;
  }
`;

const Subtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 4px 0 0;

  @media (max-width: 480px) {
    font-size: 12px;
  }
`;

const ContentContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const TableContainer = styled.div`
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    border-radius: 8px;
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.08);
  }
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
  display: table;

  @media (max-width: 768px) {
    display: none;
  }

  th {
    background: #f9fafb;
    padding: 16px;
    text-align: left;
    font-weight: 600;
    font-size: 12px;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 2px solid #e5e7eb;
  }

  td {
    padding: 16px;
    border-bottom: 1px solid #e5e7eb;
    color: #1f2937;

    &:first-child {
      font-weight: 500;
    }
  }

  tr:hover {
    background: #f3f4f6;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

// ============================================================================
// MOBILE CARD LAYOUT STYLES
// ============================================================================

const MobileProductList = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;
    gap: 12px;
    padding: 0;
  }

  @media (max-width: 480px) {
    gap: 10px;
  }
`;

const ProductCard = styled.div`
  display: none;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.2s ease;

  @media (max-width: 768px) {
    display: flex;
    flex-direction: column;

    &:hover {
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
      border-color: #d1d5db;
    }
  }

  @media (max-width: 480px) {
    border-radius: 6px;
  }
`;

const ProductCardImage = styled.div`
  width: 100%;
  height: 160px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  border-bottom: 1px solid #e5e7eb;

  @media (max-width: 480px) {
    height: 140px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  svg {
    width: 40px;
    height: 40px;
    color: #d1d5db;
  }
`;

const ProductCardContent = styled.div`
  padding: 16px;
  flex: 1;
  display: flex;
  flex-direction: column;

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

// Header: Title + Status Badge
const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    gap: 8px;
    margin-bottom: 10px;
  }
`;

const ProductCardTitle = styled.h3`
  font-size: 15px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  flex: 1;
  min-width: 0;
  word-break: break-word;
  line-height: 1.3;

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

// Key Metrics Row: Price + Stock
const KeyMetricsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    gap: 10px;
    margin-bottom: 10px;
  }
`;

const MetricItem = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const MetricLabel = styled.span`
  font-size: 10px;
  font-weight: 700;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

const MetricValue = styled.span`
  font-size: 16px;
  font-weight: 700;
  color: #1f2937;

  @media (max-width: 480px) {
    font-size: 15px;
  }
`;

const StockIndicator = styled.span`
  font-size: 15px;
  font-weight: 700;
  color: ${(props) => {
    if (props.stock > 20) return '#10b981';
    if (props.stock > 5) return '#f59e0b';
    return '#ef4444';
  }};

  @media (max-width: 480px) {
    font-size: 14px;
  }
`;

// Status row: Category, SKU, Featured
const DetailsRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  padding: 10px 0;
  border-top: 1px solid #f3f4f6;
  border-bottom: 1px solid #f3f4f6;
  margin-bottom: 12px;

  @media (max-width: 480px) {
    gap: 10px;
    padding: 8px 0;
    margin-bottom: 10px;
  }
`;

const DetailField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 3px;
`;

const DetailLabel = styled.span`
  font-size: 10px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 9px;
  }
`;

const DetailValue = styled.span`
  font-size: 12px;
  font-weight: 500;
  color: #4b5563;
  word-break: break-word;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

// Badge for Status and Featured
const BadgeContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  @media (max-width: 480px) {
    gap: 5px;
  }
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: ${(props) => {
    switch (props.status) {
      case 'active':
        return '#d1fae5';
      case 'inactive':
        return '#fef3c7';
      case 'out_of_stock':
        return '#fee2e2';
      default:
        return '#e5e7eb';
    }
  }};
  color: ${(props) => {
    switch (props.status) {
      case 'active':
        return '#065f46';
      case 'inactive':
        return '#92400e';
      case 'out_of_stock':
        return '#991b1b';
      default:
        return '#374151';
    }
  }};
  text-transform: capitalize;
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 3px 8px;
    font-size: 10px;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

const FeaturedBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 10px;
  border-radius: 20px;
  font-size: 11px;
  font-weight: 600;
  background: #fef3c7;
  color: #92400e;
  white-space: nowrap;

  @media (max-width: 480px) {
    padding: 3px 8px;
    font-size: 10px;
  }

  svg {
    width: 12px;
    height: 12px;
  }
`;

// Quick Actions Row
const QuickActionsRow = styled.div`
  display: flex;
  gap: 8px;
  justify-content: space-between;
  align-items: center;

  @media (max-width: 480px) {
    gap: 6px;
  }
`;

const ActionButton = styled.button`
  padding: 8px 12px;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
  flex: 1;

  &:hover {
    border-color: #5b4dff;
    color: #5b4dff;
    background: #f9f7ff;
  }

  &:active {
    transform: scale(0.98);
  }

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    padding: 7px 10px;
    font-size: 11px;
    flex: 1;

    svg {
      width: 13px;
      height: 13px;
    }
  }
`;

const ActionMenuButton = styled.button`
  width: 36px;
  height: 36px;
  padding: 0;
  border-radius: 6px;
  border: 1px solid #e5e7eb;
  background: white;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  position: relative;

  &:hover {
    border-color: #5b4dff;
    color: #5b4dff;
    background: #f9f7ff;
  }

  svg {
    width: 16px;
    height: 16px;
  }

  @media (max-width: 480px) {
    width: 36px;
    height: 36px;
  }
`;

const ActionMenu = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 200px;
  margin-top: 4px;
  overflow: hidden;
`;

const ActionMenuItem = styled.button`
  width: 100%;
  padding: 12px 16px;
  background: white;
  border: none;
  text-align: left;
  font-size: 13px;
  font-weight: 500;
  color: #374151;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: #f9f7ff;
    color: #5b4dff;
  }

  &:first-child {
    border-bottom: 1px solid #f3f4f6;
  }

  &:last-child {
    color: #ef4444;

    &:hover {
      background: #fef2f2;
    }
  }

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 12px;

    svg {
      width: 15px;
      height: 15px;
    }
  }
`;

// Loading and Empty States
const LoadingMessage = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;

  @media (max-width: 768px) {
    padding: 30px 20px;
  }

  @media (max-width: 480px) {
    padding: 20px 16px;
    font-size: 14px;
  }
`;

const EmptyMessage = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: #6b7280;

  h3 {
    color: #1f2937;
    margin: 0 0 8px;
    font-size: 18px;
  }

  p {
    margin: 0;
    font-size: 14px;
  }

  @media (max-width: 768px) {
    padding: 40px 20px;

    h3 {
      font-size: 16px;
    }

    p {
      font-size: 13px;
    }
  }

  @media (max-width: 480px) {
    padding: 30px 16px;

    h3 {
      font-size: 15px;
    }

    p {
      font-size: 12px;
    }
  }
`;

// Legacy desktop table styles (keep for backward compat)
const ProductName = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;

  @media (max-width: 480px) {
    gap: 6px;
  }

  a,
  button {
    width: 32px;
    height: 32px;
    border-radius: 6px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e5e7eb;
    background: white;
    cursor: pointer;
    transition: all 0.2s;
    color: #6b7280;
    text-decoration: none;
    flex-shrink: 0;

    &:hover {
      border-color: #5b4dff;
      color: #5b4dff;
    }

    svg {
      width: 16px;
      height: 16px;
    }

    @media (max-width: 480px) {
      width: 36px;
      height: 36px;
      border-radius: 4px;

      svg {
        width: 18px;
        height: 18px;
      }
    }
  }

  .delete-btn {
    &:hover {
      border-color: #ef4444;
      color: #ef4444;
    }
  }
`;

/**
 * Admin Product Management Dashboard
 * Desktop: Table layout | Mobile: Card layout with images & actions
 */
export default function AdminProductDashboard() {
  const [page, setPage] = useState(1);
  const [openMenuId, setOpenMenuId] = useState(null);
  const { data, isLoading } = useProducts({ page, limit: 20 });
  const deleteProduct = useDeleteProduct();

  const handleDelete = async (productId) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await deleteProduct.mutateAsync(productId);
        setOpenMenuId(null);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleToggleStatus = (product) => {
    console.log('Toggle status for:', product._id, 'Current:', product.status);
    // TODO: Implement API call to toggle product status
    setOpenMenuId(null);
  };

  const handleToggleFeatured = (product) => {
    console.log('Toggle featured for:', product._id, 'Current:', product.isFeatured);
    // TODO: Implement API call to toggle featured status
    setOpenMenuId(null);
  };

  const handleCopySKU = (sku) => {
    navigator.clipboard.writeText(sku);
    setOpenMenuId(null);
  };

  const products = data?.data || [];
  const pagination = data?.pagination || {};

  return (
    <PageContainer>
      <PageHeader>
        <TitleSection>
          <Title>Products</Title>
          <Subtitle>Manage your product catalog ({pagination.totalItems || 0} total)</Subtitle>
        </TitleSection>
        <Button as={Link} href="/admin/products/new">
          <Plus size={16} /> New Product
        </Button>
      </PageHeader>

      <ContentContainer>
        <TableContainer>
          {isLoading ? (
            <LoadingMessage>Loading products...</LoadingMessage>
          ) : products.length === 0 ? (
            <EmptyMessage>
              <h3>No products yet</h3>
              <p>Click "New Product" to create your first product</p>
            </EmptyMessage>
          ) : (
            <>
              {/* ===== DESKTOP TABLE ===== */}
              <Table>
                <thead>
                  <tr>
                    <th>Product Name</th>
                    <th>Price</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Category</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => (
                    <tr key={product._id}>
                      <td>
                        <ProductName>{product.name}</ProductName>
                      </td>
                      <td>${product.price.toFixed(2)}</td>
                      <td>
                        {product.stock > 0 ? (
                          <span style={{ color: '#10b981' }}>
                            {product.stock}
                          </span>
                        ) : (
                          <span style={{ color: '#ef4444' }}>0</span>
                        )}
                      </td>
                      <td>
                        <StatusBadge status={product.status}>
                          {product.status}
                        </StatusBadge>
                      </td>
                      <td>{product.category || '—'}</td>
                      <td>
                        {new Date(product.createdAt).toLocaleDateString()}
                      </td>
                      <td>
                        <ActionButtons>
                          <Link
                            href={`/products/${product._id}`}
                            title="View product"
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Eye />
                          </Link>
                          <button
                            className="delete-btn"
                            onClick={() => handleDelete(product._id)}
                            title="Delete product"
                            type="button"
                          >
                            <Trash2 />
                          </button>
                        </ActionButtons>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>

              {/* ===== MOBILE CARD LAYOUT ===== */}
              <MobileProductList>
                {products.map((product) => (
                  <ProductCard key={product._id}>
                    {/* Product Image */}
                    <ProductCardImage>
                      {product.images && product.images.length > 0 ? (
                        <img
                          src={product.images[0]}
                          alt={product.name}
                          loading="lazy"
                        />
                      ) : (
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor">
                          <rect x="3" y="3" width="18" height="18" rx="2" />
                          <circle cx="8.5" cy="8.5" r="1.5" />
                          <path d="M21 15l-5-5L5 21" />
                        </svg>
                      )}
                    </ProductCardImage>

                    {/* Card Content */}
                    <ProductCardContent>
                      {/* Header: Title + Status Badge */}
                      <CardHeader>
                        <ProductCardTitle>{product.name}</ProductCardTitle>
                      </CardHeader>

                      {/* Key Metrics: Price + Stock */}
                      <KeyMetricsRow>
                        <MetricItem>
                          <MetricLabel>Price</MetricLabel>
                          <MetricValue>${product.price.toFixed(2)}</MetricValue>
                        </MetricItem>
                        <MetricItem>
                          <MetricLabel>Stock</MetricLabel>
                          <StockIndicator stock={product.stock}>
                            {product.stock}
                          </StockIndicator>
                        </MetricItem>
                      </KeyMetricsRow>

                      {/* Details Row: Category + SKU */}
                      <DetailsRow>
                        <DetailField>
                          <DetailLabel>Category</DetailLabel>
                          <DetailValue>{product.category || '—'}</DetailValue>
                        </DetailField>
                        <DetailField>
                          <DetailLabel>SKU</DetailLabel>
                          <DetailValue>{product.sku || '—'}</DetailValue>
                        </DetailField>
                      </DetailsRow>

                      {/* Status & Featured Badges */}
                      <BadgeContainer>
                        <StatusBadge status={product.status}>
                          {product.status}
                        </StatusBadge>
                        {product.isFeatured && (
                          <FeaturedBadge>
                            <Star size={12} />
                            Featured
                          </FeaturedBadge>
                        )}
                      </BadgeContainer>

                      {/* Quick Actions Row */}
                      <div style={{ marginTop: '12px' }}>
                        <QuickActionsRow>
                          <Link
                            href={`/products/${product._id}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            style={{ textDecoration: 'none', flex: 1 }}
                          >
                            <ActionButton as="span" style={{ justifyContent: 'center' }}>
                              <Eye size={14} />
                              View
                            </ActionButton>
                          </Link>
                          <button
                            onClick={() => handleDelete(product._id)}
                            style={{ flex: 1, border: 'none', background: 'none', cursor: 'pointer', padding: 0 }}
                            title="Delete product"
                            type="button"
                          >
                            <ActionButton as="span" style={{ justifyContent: 'center' }}>
                              <Trash2 size={14} />
                              Delete
                            </ActionButton>
                          </button>
                          <div style={{ position: 'relative' }}>
                            <ActionMenuButton
                              onClick={() => setOpenMenuId(
                                openMenuId === product._id ? null : product._id
                              )}
                            >
                              <MoreVertical size={16} />
                            </ActionMenuButton>

                            {/* Action Dropdown Menu */}
                            {openMenuId === product._id && (
                              <ActionMenu>
                                <ActionMenuItem
                                  onClick={() => handleToggleStatus(product)}
                                >
                                  {product.status === 'active' ? (
                                    <>
                                      <ToggleLeft size={14} /> Deactivate
                                    </>
                                  ) : (
                                    <>
                                      <ToggleRight size={14} /> Activate
                                    </>
                                  )}
                                </ActionMenuItem>
                                <ActionMenuItem
                                  onClick={() => handleToggleFeatured(product)}
                                >
                                  <Star size={14} />
                                  {product.isFeatured ? 'Unfeature' : 'Feature'}
                                </ActionMenuItem>
                                <ActionMenuItem
                                  onClick={() => handleCopySKU(product.sku || '')}
                                >
                                  <Copy size={14} /> Copy SKU
                                </ActionMenuItem>
                                <ActionMenuItem
                                  onClick={() => handleDelete(product._id)}
                                >
                                  <Trash2 size={14} /> Delete
                                </ActionMenuItem>
                              </ActionMenu>
                            )}
                          </div>
                        </QuickActionsRow>
                      </div>
                    </ProductCardContent>
                  </ProductCard>
                ))}
              </MobileProductList>
            </>
          )}
        </TableContainer>
      </ContentContainer>
    </PageContainer>
  );
}
