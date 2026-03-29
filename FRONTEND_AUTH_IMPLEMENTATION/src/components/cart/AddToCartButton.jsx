'use client';

import styled from 'styled-components';
import { useState } from 'react';
import { Button } from '@/components/ui/Button';
import { useAddToCart } from '@/hooks/useCart';
import { useToast } from '@/components/ui/Toast';
import { ShoppingCart } from 'lucide-react';

const ButtonWrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const StockInfo = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0;
`;

const AddButton = styled(Button)`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
`;

/**
 * AddToCartButton Component
 * Button to add a product to cart from product page
 */
export default function AddToCartButton({
  productId,
  quantity = 1,
  variant = {},
  stock = 0,
  onAddSuccess = () => {},
  className = '',
}) {
  const { addToCart, isLoading, error } = useAddToCart();
  const { success, error: showError } = useToast();
  const [localError, setLocalError] = useState(null);

  const isOutOfStock = stock === 0;

  const handleAddToCart = async () => {
    setLocalError(null);
    try {
      await addToCart(productId, quantity, variant);
      success(`Added ${quantity} item${quantity > 1 ? 's' : ''} to cart`);
      onAddSuccess();
    } catch (err) {
      const errorMessage = err.message || 'Failed to add to cart';
      setLocalError(errorMessage);
      showError(errorMessage);
    }
  };

  return (
    <ButtonWrap className={className}>
      <AddButton
        onClick={handleAddToCart}
        disabled={isLoading || isOutOfStock}
        title={isOutOfStock ? 'Product is out of stock' : 'Add to cart'}
      >
        <ShoppingCart size={18} />
        {isLoading ? 'Adding...' : 'Add to Cart'}
      </AddButton>
      {isOutOfStock && (
        <StockInfo style={{ color: '#dc2626' }}>Out of stock</StockInfo>
      )}
      {stock > 0 && stock < 10 && (
        <StockInfo>Only {stock} left in stock</StockInfo>
      )}
      {localError && (
        <StockInfo style={{ color: '#dc2626' }}>{localError}</StockInfo>
      )}
    </ButtonWrap>
  );
}
