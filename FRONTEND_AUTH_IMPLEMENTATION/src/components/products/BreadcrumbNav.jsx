'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

const BreadcrumbContainer = styled.nav`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  color: #6b7280;
  flex-wrap: wrap;
  word-break: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;

  @media (max-width: 768px) {
    margin-bottom: 24px;
    font-size: 12px;
    gap: 6px;
  }

  @media (max-width: 640px) {
    margin-bottom: 20px;
    font-size: 12px;
    gap: 4px;
  }

  @media (max-width: 480px) {
    margin-bottom: 16px;
    font-size: 11px;
    gap: 3px;
  }
`;

const BreadcrumbItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    gap: 6px;
  }
`;

const BreadcrumbLink = styled(Link)`
  color: #5b4dff;
  text-decoration: none;
  transition: all 0.2s;
  font-weight: 500;

  &:hover {
    color: #4c3fcc;
    text-decoration: underline;
  }

  &:active {
    color: #3d2db8;
  }

  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

const BreadcrumbText = styled.span`
  color: #1f2937;
  font-weight: 600;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;
  overflow: hidden;

  @media (max-width: 768px) {
    font-size: 12px;
    word-break: break-word;
  }

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const Separator = styled(ChevronRight)`
  width: 16px;
  height: 16px;
  color: #d1d5db;
  flex-shrink: 0;

  @media (max-width: 768px) {
    width: 14px;
    height: 14px;
  }
`;

/**
 * BreadcrumbNav Component
 * 
 * Navigation breadcrumb showing category hierarchy
 * Helps users understand their location and navigate back
 */
export default function BreadcrumbNav({
  category = null,
  productName = null,
}) {
  return (
    <BreadcrumbContainer role="navigation" aria-label="Breadcrumb">
      <BreadcrumbItem>
        <BreadcrumbLink href="/products" aria-current="false">
          Products
        </BreadcrumbLink>
      </BreadcrumbItem>

      <Separator aria-hidden="true" />

      {category && (
        <>
          <BreadcrumbItem>
            <BreadcrumbLink 
              href={`/products?category=${encodeURIComponent(category)}`}
              aria-current="false"
            >
              {category}
            </BreadcrumbLink>
          </BreadcrumbItem>
          <Separator aria-hidden="true" />
        </>
      )}

      {productName && (
        <BreadcrumbItem>
          <BreadcrumbText aria-current="page">
            {productName.length > 50 
              ? `${productName.substring(0, 50)}...` 
              : productName
            }
          </BreadcrumbText>
        </BreadcrumbItem>
      )}
    </BreadcrumbContainer>
  );
}
