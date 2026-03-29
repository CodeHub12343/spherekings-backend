'use client';

import styled from 'styled-components';
import Image from 'next/image';
import { useState } from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useRemoveFromCart, useUpdateCartItem } from '@/hooks/useCart';

const ItemContainer = styled.div`
  display: grid;
  grid-template-columns: 100px 1fr auto;
  gap: 20px;
  padding: 20px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  align-items: center;

  @media (max-width: 640px) {
    grid-template-columns: 80px 1fr;
    gap: 12px;
    padding: 16px;
  }
`;

const ProductImage = styled.div`
  position: relative;
  width: 100px;
  height: 100px;
  background: #f3f4f6;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 80px;
    height: 80px;
  }

  img {
    object-fit: cover;
  }
`;

const ProductInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const ProductName = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
  line-height: 1.4;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const ProductMeta = styled.div`
  display: flex;
  gap: 12px;
  font-size: 13px;
  color: #6b7280;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const MetaItem = styled.span`
  display: flex;
  gap: 4px;

  strong {
    color: #374151;
  }
`;

const PriceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  grid-column: 2 / 4;
  justify-content: space-between;

  @media (max-width: 640px) {
    grid-column: 1 / 3;
    margin-top: 12px;
    padding-top: 12px;
    border-top: 1px solid #f3f4f6;
    flex-wrap: wrap;
  }
`;

const QuantityControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const QuantityButton = styled.button`
  width: 32px;
  height: 32px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;

  &:hover {
    border-color: #5b4dff;
    color: #5b4dff;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const QuantityDisplay = styled.span`
  min-width: 40px;
  text-align: center;
  font-weight: 600;
  color: #1f2937;
`;

const Price = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 4px;
  white-space: nowrap;
`;

const PricePerUnit = styled.span`
  font-size: 14px;
  color: #6b7280;
  text-decoration: line-through;
`;

const TotalPrice = styled.span`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;

  @media (max-width: 640px) {
    font-size: 16px;
  }
`;

const RemoveButton = styled.button`
  width: 40px;
  height: 40px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  border-radius: 8px;
  cursor: pointer;
  color: #dc2626;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  flex-shrink: 0;

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
  }

  &:hover {
    background: #fee2e2;
    border-color: #fca5a5;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 20px;
    height: 20px;
  }
`;

const VariantInfo = styled.div`
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6b7280;
  flex-wrap: wrap;
  margin-top: 6px;
`;

const VariantTag = styled.span`
  display: inline-block;
  background: #f3f4f6;
  padding: 4px 8px;
  border-radius: 4px;
  color: #374151;
`;

const SkeletonLoader = styled.div`
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
    }
    50% {
      opacity: 0.5;
    }
  }
`;

/**
 * CartItemCard Component
 * Displays a single cart item with quantity controls and remove option
 */
export default function CartItemCard({ item, isLoading = false }) {
  const { removeFromCart, isLoading: isRemoving } = useRemoveFromCart();
  const { updateCartItem, isLoading: isUpdating } = useUpdateCartItem();
  const [localQuantity, setLocalQuantity] = useState(item.quantity);

  if (isLoading) {
    return (
      <ItemContainer as={SkeletonLoader}>
        <ProductImage />
        <ProductInfo>
          <ProductName style={{ width: '200px', height: '20px', background: '#e5e7eb' }} />
          <ProductMeta style={{ width: '300px', height: '16px', background: '#e5e7eb' }} />
        </ProductInfo>
        <Price>
          <TotalPrice style={{ width: '80px', height: '20px', background: '#e5e7eb' }} />
        </Price>
      </ItemContainer>
    );
  }

  if (!item || !item.productId) {
    return (
      <ItemContainer>
        <div style={{ color: '#6b7280' }}>Product not found</div>
      </ItemContainer>
    );
  }

  const { productId, quantity, price, variant } = item;
  const totalPrice = (price * quantity).toFixed(2);
  const image = productId.images?.[0];

  const handleQuantityChange = async (newQuantity) => {
    if (newQuantity < 1 || newQuantity > 1000) return;

    setLocalQuantity(newQuantity);
    try {
      await updateCartItem(item._id, { quantity: newQuantity });
    } catch (error) {
      // Revert on error
      setLocalQuantity(quantity);
    }
  };

  const handleRemove = async () => {
    if (window.confirm('Remove this item from cart?')) {
      try {
        await removeFromCart(item._id);
      } catch (error) {
        console.error('Error removing item:', error);
      }
    }
  };

  return (
    <ItemContainer>
      <ProductImage>
        {image && (
          <Image src={image} alt={productId.name} fill style={{ objectFit: 'cover' }} />
        )}
      </ProductImage>

      <ProductInfo>
        <ProductName>{productId.name}</ProductName>
        <ProductMeta>
          <MetaItem>
            SKU: <strong>{productId.sku}</strong>
          </MetaItem>
          <MetaItem>
            Category: <strong>{productId.category}</strong>
          </MetaItem>
        </ProductMeta>

        {variant && Object.keys(variant).length > 0 && (
          <VariantInfo>
            {Object.entries(variant).map(([key, value]) => (
              <VariantTag key={key}>
                {key}: {value}
              </VariantTag>
            ))}
          </VariantInfo>
        )}
      </ProductInfo>

      <PriceInfo>
        <QuantityControl>
          <QuantityButton
            onClick={() => handleQuantityChange(localQuantity - 1)}
            disabled={isUpdating || localQuantity <= 1}
            title="Decrease quantity"
          >
            −
          </QuantityButton>
          <QuantityDisplay>{localQuantity}</QuantityDisplay>
          <QuantityButton
            onClick={() => handleQuantityChange(localQuantity + 1)}
            disabled={isUpdating || localQuantity >= 1000}
            title="Increase quantity"
          >
            +
          </QuantityButton>
        </QuantityControl>

        <Price>
          <PricePerUnit>${(price).toFixed(2)}</PricePerUnit>
          <TotalPrice>${totalPrice}</TotalPrice>
        </Price>

        <RemoveButton
          onClick={handleRemove}
          disabled={isRemoving}
          title="Remove from cart"
        >
          <Trash2 />
        </RemoveButton>
      </PriceInfo>
    </ItemContainer>
  );
}
