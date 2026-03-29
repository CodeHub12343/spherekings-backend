'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ShoppingBag } from 'lucide-react';

const EmptyContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 24px;
  padding: 80px 40px;
  text-align: center;

  @media (max-width: 640px) {
    padding: 60px 20px;
    gap: 20px;
  }
`;

const IconWrapper = styled.div`
  width: 120px;
  height: 120px;
  background: #f3f4f6;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #d1d5db;

  @media (max-width: 640px) {
    width: 100px;
    height: 100px;
  }

  svg {
    width: 60px;
    height: 60px;

    @media (max-width: 640px) {
      width: 50px;
      height: 50px;
    }
  }
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const Description = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
  max-width: 400px;

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

const ShoppingButton = styled(Button)`
  margin-top: 12px;
`;

/**
 * CartEmptyState Component
 * Displays when cart is empty
 */
export default function CartEmptyState() {
  return (
    <EmptyContainer>
      <IconWrapper>
        <ShoppingBag />
      </IconWrapper>
      <div>
        <Title>Your Cart is Empty</Title>
        <Description>
          Looks like you haven't added any products to your cart yet. Start shopping to add items!
        </Description>
      </div>
      <Link href="/products">
        <ShoppingButton>Browse Products</ShoppingButton>
      </Link>
    </EmptyContainer>
  );
}
