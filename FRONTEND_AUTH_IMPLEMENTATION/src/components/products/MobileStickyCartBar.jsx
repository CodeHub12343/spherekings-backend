'use client';

import styled from 'styled-components';
import { ShoppingCart } from 'lucide-react';

const StickyBar = styled.div`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: none;
  gap: 12px;
  padding: 12px;
  background: white;
  border-top: 1px solid #e5e7eb;
  z-index: 40;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  
  /* Safe area for notch devices */
  padding-bottom: max(12px, env(safe-area-inset-bottom));

  @media (max-width: 768px) {
    display: flex;
  }

  @media (max-width: 480px) {
    padding: 10px;
    gap: 10px;
  }
`;

const PriceDisplay = styled.div`
  flex: 0 0 auto;
  font-weight: 700;
  font-size: 18px;
  color: #1f2937;
  min-width: 80px;
`;

const AddButton = styled.button`
  flex: 1;
  padding: 12px 16px;
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;

  &:active {
    transform: scale(0.98);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  svg {
    width: 18px;
    height: 18px;
    flex-shrink: 0;
  }

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
    gap: 6px;
  }
`;

/**
 * MobileStickyCartBar Component
 * 
 * Sticky action bar for mobile that keeps Add to Cart visible
 * while user scrolls through product details
 */
export default function MobileStickyCartBar({
  price = 0,
  isOutOfStock = false,
  onAddToCart = () => {},
  quantity = 1,
}) {
  return (
    <StickyBar>
      <PriceDisplay>${price.toFixed(2)}</PriceDisplay>
      <AddButton
        disabled={isOutOfStock}
        onClick={onAddToCart}
        aria-label={isOutOfStock ? 'Out of stock' : `Add ${quantity} item to cart`}
      >
        <ShoppingCart size={18} />
        {isOutOfStock ? 'Out of Stock' : 'Add to Cart'}
      </AddButton>
    </StickyBar>
  );
}
