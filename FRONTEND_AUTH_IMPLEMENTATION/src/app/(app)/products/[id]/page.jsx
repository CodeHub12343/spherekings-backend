'use client';

import { use } from 'react';
import styled from 'styled-components';
import ProductDetail from '@/components/products/ProductDetail';
import ProductList from '@/components/products/ProductList';
import ProductSpecifications from '@/components/products/ProductSpecifications';
import MobileStickyCartBar from '@/components/products/MobileStickyCartBar';
import BreadcrumbNav from '@/components/products/BreadcrumbNav';
import { useProductDetail, useRelatedProducts } from '@/hooks/useProducts';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';
import { useState } from 'react';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding: 40px 20px;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;

  @media (max-width: 768px) {
    padding: 24px 16px;
    padding-bottom: 120px;
  }

  @media (max-width: 640px) {
    padding: 20px 14px;
    padding-bottom: 120px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    padding-bottom: 130px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  width: 100%;
  box-sizing: border-box;
  overflow-x: hidden;
`;

const RelatedSection = styled.div`
  margin-top: 60px;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 12px;
  width: 100%;
  box-sizing: border-box;
  overflow: hidden;

  @media (max-width: 768px) {
    margin-top: 40px;
    padding: 24px 16px;
    border-radius: 8px;
  }

  @media (max-width: 640px) {
    margin-top: 32px;
    padding: 20px 12px;
  }

  @media (max-width: 480px) {
    margin-top: 24px;
    padding: 16px 10px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;
  word-break: break-word;
  overflow-wrap: break-word;
  max-width: 100%;

  @media (max-width: 640px) {
    font-size: 20px;
    margin: 0 0 16px;
  }

  @media (max-width: 480px) {
    font-size: 18px;
    margin: 0 0 12px;
  }
`;

/**
 * Product Detail Page
 * Display details of a single product with related products
 * Features:
 * - Mobile-optimized swipeable image carousel
 * - Desktop image gallery with zoom
 * - Product specifications and details
 * - Mobile sticky cart bar
 * - Related products section
 */
export default function ProductDetailPage({ params }) {
  const { id } = use(params);
  const [cartQuantity, setCartQuantity] = useState(1);

  const {
    data: product,
    isLoading,
    error,
  } = useProductDetail(id);

  const {
    data: relatedProducts,
    isLoading: relatedLoading,
  } = useRelatedProducts(id, 4);

  // Cart integration
  const { addToCart, isLoading: isAddingToCart } = useAddToCart();
  const { success, error: showError } = useToast();

  // Debug logging
  console.log('📦 Product Detail Page:', {
    id,
    isLoading,
    error: error?.message || null,
    hasProduct: !!product,
  });

  if (error) {
    return (
      <PageContainer>
        <ContentWrapper>
          <h1>❌ Error Loading Product</h1>
          <p>{error.message}</p>
          <p style={{ fontSize: '12px', color: '#6b7280', marginTop: '12px' }}>
            Product ID: {id}
          </p>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Handle add to cart
  const handleAddToCart = async (cartData) => {
    try {
      const { productId, quantity, selectedVariants } = cartData;

      console.log('🛒 Adding to cart:', {
        productId,
        quantity,
        selectedVariants,
      });

      await addToCart(productId, quantity, selectedVariants);
      setCartQuantity(1); // Reset quantity after adding

      success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
    } catch (err) {
      console.error('❌ Error adding to cart:', err);
      showError(err.message || 'Failed to add product to cart');
    }
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Breadcrumb Navigation */}
        {product && (
          <BreadcrumbNav 
            category={product.category}
            productName={product.name}
          />
        )}

        {/* Product Detail */}
        <ProductDetail
          product={product}
          isLoading={isLoading}
          onAddToCart={handleAddToCart}
        />

        {/* Product Specifications */}
        {product && (
          <ProductSpecifications product={product} />
        )}

        {/* Related Products */}
        {relatedProducts && relatedProducts.length > 0 && (
          <RelatedSection>
            <SectionTitle>Related Products</SectionTitle>
            <ProductList
              products={relatedProducts}
              isLoading={relatedLoading}
              pagination={{}}
              showFilters={false}
              canAddToCart={true}
            />
          </RelatedSection>
        )}

        {/* Mobile Sticky Cart Bar */}
        {product && (
          <MobileStickyCartBar
            price={product.price || 0}
            isOutOfStock={product.status === 'out_of_stock' || product.stock === 0}
            onAddToCart={() => handleAddToCart({
              productId: product._id,
              quantity: cartQuantity,
              selectedVariants: {},
            })}
            quantity={cartQuantity}
          />
        )}
      </ContentWrapper>
    </PageContainer>
  );
}
