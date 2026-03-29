/**
 * EXAMPLE: Product Detail Page with Shopping Cart Integration
 * 
 * This example shows how to integrate the AddToCartButton and cart system
 * into your product detail page. Copy and adapt this to your needs.
 */

'use client';

import { use, useState } from 'react';
import styled from 'styled-components';
import ProductDetail from '@/components/products/ProductDetail';
import AddToCartButton from '@/components/cart/AddToCartButton';
import { useProductQuantityInCart, useIsProductInCart } from '@/hooks/useCart';

const PageContainer = styled.div`
  min-height: 100vh;
  background: white;
  padding: 40px 20px;
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const BreadcrumbNav = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  color: #6b7280;

  a {
    color: #5b4dff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const MainContent = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 40px;
  margin-bottom: 60px;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const ActionPanel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  padding: 24px;
  background: #f9fafb;
  border-radius: 12px;
  height: fit-content;
  position: sticky;
  top: 20px;

  @media (max-width: 968px) {
    position: static;
  }
`;

const QuantityControlSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const QuantityLabel = styled.label`
  font-size: 14px;
  font-weight: 600;
  color: #1f2937;
`;

const QuantityInput = styled.input`
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 16px;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const CartStatus = styled.div`
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 13px;
  color: #6b7280;
  text-align: center;

  &.in-cart {
    background: #d1fae5;
    border-color: #a7f3d0;
    color: #065f46;
  }
`;

const RelatedSection = styled.div`
  margin-top: 60px;
  padding: 40px 20px;
  background: #f9fafb;
  border-radius: 12px;
`;

const SectionTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px;
`;

/**
 * EXAMPLE: Integration with AddToCartButton
 * 
 * This page demonstrates:
 * 1. Displaying product details
 * 2. Quantity selection with input validation
 * 3. Add to cart button with error handling
 * 4. Display quantity already in cart
 * 5. Show related products (optional)
 */
export default function ProductDetailPageExample({ params }) {
  const { id } = use(params);
  
  // State
  const [quantity, setQuantity] = useState(1);
  const [selectedVariant, setSelectedVariant] = useState({});

  // Cart hooks
  const isProductInCart = useIsProductInCart(id);
  const quantityInCart = useProductQuantityInCart(id);

  // Mock product data - replace with actual data from API
  const product = {
    _id: id,
    name: 'Premium Product',
    description: 'A great product for everyone',
    price: 99.99,
    stock: 50,
    category: 'Electronics',
    sku: 'PROD-001',
    images: [],
    variants: [],
  };

  const handleQuantityChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (value >= 1 && value <= 1000) {
      setQuantity(value);
    }
  };

  const handleVariantChange = (variantName, variantValue) => {
    setSelectedVariant((prev) => ({
      ...prev,
      [variantName]: variantValue,
    }));
  };

  return (
    <PageContainer>
      <ContentWrapper>
        {/* Breadcrumb */}
        <BreadcrumbNav>
          <a href="/">Home</a>
          <span>/</span>
          <a href="/products">Products</a>
          <span>/</span>
          <span>{product.name}</span>
        </BreadcrumbNav>

        {/* Main Content */}
        <MainContent>
          {/* Product Details */}
          <div>
            <ProductDetail
              product={product}
              onAddToCart={() => {
                console.log('Product being added to cart');
              }}
            />
          </div>

          {/* Action Panel */}
          <ActionPanel>
            {/* Quantity Selection */}
            <QuantityControlSection>
              <QuantityLabel htmlFor="quantity">Quantity:</QuantityLabel>
              <QuantityInput
                id="quantity"
                type="number"
                min="1"
                max="1000"
                value={quantity}
                onChange={handleQuantityChange}
              />
            </QuantityControlSection>

            {/* Variant Selection Example */}
            {/* Uncomment if your product has variants */}
            {/* 
            <div>
              <QuantityLabel>Color:</QuantityLabel>
              <select
                value={selectedVariant.color || ''}
                onChange={(e) => handleVariantChange('color', e.target.value)}
              >
                <option value="">Select color...</option>
                <option value="red">Red</option>
                <option value="blue">Blue</option>
                <option value="black">Black</option>
              </select>
            </div>
            */}

            {/* Cart Status */}
            {isProductInCart && (
              <CartStatus className="in-cart">
                ✓ {quantityInCart} item{quantityInCart !== 1 ? 's' : ''} already in cart
              </CartStatus>
            )}

            {/* Add to Cart Button */}
            <AddToCartButton
              productId={product._id}
              quantity={quantity}
              variant={selectedVariant}
              stock={product.stock}
              onAddSuccess={() => {
                // Reset quantity after successfully adding to cart
                setQuantity(1);
                setSelectedVariant({});
              }}
            />

            {/* Additional Information */}
            <CartStatus>
              Free shipping on orders over $50
            </CartStatus>
          </ActionPanel>
        </MainContent>

        {/* Related Products Section */}
        <RelatedSection>
          <SectionTitle>Related Products</SectionTitle>
          {/* Add related products component here */}
          <p style={{ color: '#6b7280' }}>
            Add your RelatedProductsList component here
          </p>
        </RelatedSection>
      </ContentWrapper>
    </PageContainer>
  );
}

/**
 * IMPLEMENTATION NOTES:
 * 
 * 1. Replace mock product data with actual data from API:
 *    const { data: product } = useProductDetail(id);
 * 
 * 2. For products with variants, show variant selectors:
 *    - Color, Size, Style, etc.
 *    - Pass selectedVariant to AddToCartButton
 * 
 * 3. Quantity validation:
 *    - Min: 1
 *    - Max: 1000 (backend limit)
 *    - Max available: product.stock
 * 
 * 4. Error handling:
 *    - AddToCartButton handles errors internally
 *    - Shows toast notifications
 *    - User can retry if needed
 * 
 * 5. User feedback:
 *    - Show quantity already in cart
 *    - Show stock availability
 *    - Show success/error messages
 * 
 * 6. Mobile optimization:
 *    - Stack quantity and variant controls
 *    - Full-width buttons
 *    - Touch-friendly inputs
 * 
 * 7. Performance:
 *    - useProductQuantityInCart only re-renders when quantity changes
 *    - useIsProductInCart only re-renders when in-cart status changes
 *    - Minimize re-renders with proper dependency arrays
 */
