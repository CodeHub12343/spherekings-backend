'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { ShoppingCart } from 'lucide-react';
import { useCartItemCount } from '@/hooks/useCart';

const CartLink = styled(Link)`
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #1f2937;
  text-decoration: none;
  transition: color 0.2s;

  &:hover {
    color: #5b4dff;
  }
`;

const Icon = styled.div`
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 24px;
    height: 24px;
  }
`;

const Badge = styled.span`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  color: white;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  border: 2px solid white;
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 500;

  @media (max-width: 640px) {
    display: none;
  }
`;

/**
 * CartBadge Component
 * Displays cart icon with item count badge
 * Typically used in header navigation
 */
export default function CartBadge() {
  const itemCount = useCartItemCount();

  return (
    <CartLink href="/cart" title="View shopping cart">
      <Icon>
        <ShoppingCart />
        {itemCount > 0 && <Badge>{itemCount > 99 ? '99+' : itemCount}</Badge>}
      </Icon>
      <Label>Cart</Label>
    </CartLink>
  );
}
