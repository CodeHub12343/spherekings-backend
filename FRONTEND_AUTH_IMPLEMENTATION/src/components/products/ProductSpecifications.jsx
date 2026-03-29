'use client';

import styled from 'styled-components';

const SpecsContainer = styled.div`
  padding: 24px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  margin-top: 32px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 16px;
    border-radius: 8px;
    margin-top: 24px;
  }

  @media (max-width: 640px) {
    padding: 14px;
    margin-top: 20px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-top: 16px;
  }
`;

const SpecTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;

  @media (max-width: 640px) {
    font-size: 16px;
    margin: 0 0 16px;
  }
`;

const SpecsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

const SpecItem = styled.div`
  padding: 16px;
  background: #f9fafb;
  border-radius: 8px;
  border-left: 3px solid #5b4dff;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    padding: 12px;
  }

  @media (max-width: 480px) {
    padding: 10px;
    border-left-width: 2px;
  }
`;

const SpecLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  text-transform: uppercase;
  font-weight: 700;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
  word-break: break-word;
  overflow-wrap: break-word;

  @media (max-width: 768px) {
    font-size: 11px;
    margin-bottom: 6px;
  }

  @media (max-width: 480px) {
    font-size: 10px;
    margin-bottom: 4px;
  }
`;

const SpecValue = styled.div`
  font-size: 16px;
  color: #1f2937;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: break-word;
  min-height: 1.2em;

  @media (max-width: 768px) {
    font-size: 14px;
  }

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

/**
 * ProductSpecifications Component
 * 
 * Displays key product specifications in a grid layout
 * Mobile-responsive design with visual hierarchy
 */
export default function ProductSpecifications({ product = {} }) {
  if (!product) return null;

  // Build specs array from product data
  const specs = [
    {
      label: 'SKU',
      value: product.sku || 'N/A',
      visible: !!product.sku,
    },
    {
      label: 'Category',
      value: product.category || 'Uncategorized',
      visible: !!product.category,
    },
    {
      label: 'Status',
      value: product.status ? product.status.charAt(0).toUpperCase() + product.status.slice(1) : 'N/A',
      visible: !!product.status,
    },
    {
      label: 'Stock',
      value: product.stock ? `${product.stock} units` : 'Out of Stock',
      visible: product.stock !== undefined,
    },
    {
      label: 'Featured',
      value: product.isFeatured ? 'Yes' : 'No',
      visible: product.isFeatured !== undefined,
    },
    {
      label: 'Added',
      value: product.createdAt ? new Date(product.createdAt).toLocaleDateString() : 'N/A',
      visible: !!product.createdAt,
    },
  ];

  // Filter only visible specs
  const visibleSpecs = specs.filter(spec => spec.visible);

  if (visibleSpecs.length === 0) {
    return null;
  }

  return (
    <SpecsContainer role="region" aria-label="Product specifications">
      <SpecTitle>Product Specifications</SpecTitle>
      <SpecsGrid>
        {visibleSpecs.map((spec, idx) => (
          <SpecItem key={idx}>
            <SpecLabel>{spec.label}</SpecLabel>
            <SpecValue>{spec.value}</SpecValue>
          </SpecItem>
        ))}
      </SpecsGrid>
    </SpecsContainer>
  );
}
