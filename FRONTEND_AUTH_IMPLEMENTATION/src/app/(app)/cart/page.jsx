'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import styled from 'styled-components';
import CartItemCard from '@/components/cart/CartItemCard';
import CartSummaryPanel from '@/components/cart/CartSummaryPanel';
import CartEmptyState from '@/components/cart/CartEmptyState';
import CartLoader from '@/components/cart/CartLoader';
import CartErrorState from '@/components/cart/CartErrorState';
import {
  useCart,
  useValidationIssues,
  useClearCartError,
} from '@/hooks/useCart';

const PageContainer = styled.div`
  min-height: 100vh;
  background: #f9fafb;
  padding: 40px 20px;

  @media (max-width: 640px) {
    padding: 20px 12px;
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;

  @media (max-width: 640px) {
    margin-bottom: 24px;
  }
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const ItemCount = styled.span`
  font-size: 14px;
  color: #6b7280;
  background: white;
  padding: 4px 12px;
  border-radius: 20px;
  border: 1px solid #e5e7eb;
`;

const CartLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr 340px;
  gap: 32px;
  align-items: start;

  @media (max-width: 968px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const CartItems = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const CartActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: space-between;
  padding: 16px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  align-items: center;
`;

const ClearCartBtn = styled.button`
  padding: 8px 16px;
  border: 1px solid #fecaca;
  background: white;
  color: #dc2626;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 500;
  font-size: 14px;
  transition: all 0.2s;

  &:hover {
    background: #fef2f2;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const SelectAllLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #6b7280;

  input {
    cursor: pointer;
  }
`;

const ValidationAlert = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 20px;
`;

const ValidationTitle = styled.h3`
  font-size: 14px;
  font-weight: 600;
  color: #92400e;
  margin: 0 0 12px;
`;

const ValidationIssuesList = styled.ul`
  margin: 0;
  padding-left: 20px;
  list-style: disc;

  li {
    font-size: 13px;
    color: #78350f;
    margin-bottom: 6px;

    &:last-child {
      margin-bottom: 0;
    }
  }
`;

const QuickLinks = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;

  a {
    font-size: 13px;
    color: #5b4dff;
    text-decoration: none;
    cursor: pointer;

    &:hover {
      text-decoration: underline;
    }
  }
`;

/**
 * Cart Page
 * Main shopping cart page showing all items and checkout options
 */
export default function CartPage() {
  const router = useRouter();
  const {
    items,
    summary,
    loading,
    error,
    isCartEmpty,
    validateCart,
    fetchCart,
    clearCart,
  } = useCart();

  const validationIssues = useValidationIssues();
  const clearError = useClearCartError();
  const [selectAll, setSelectAll] = useState(false);

  // Fetch cart on mount
  useEffect(() => {
    fetchCart().catch((err) => {
      console.error('Error fetching cart:', err);
    });
  }, [fetchCart]);

  const handleCheckout = async () => {
    try {
      const result = await validateCart();

      if (result.valid) {
        // Proceed to shipping step (first step in checkout flow)
        router.push('/checkout/shipping');
      }
      // Else, validation issues are shown in the UI
    } catch (err) {
      console.error('Validation error:', err);
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Are you sure you want to clear your cart?')) {
      try {
        await clearCart();
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    }
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

  // Loading state
  if (loading.fetchingCart) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <Title>Shopping Cart</Title>
          </PageHeader>
          <CartLayout>
            <CartItems>
              <CartLoader count={3} />
            </CartItems>
            <div style={{ height: '200px', background: '#e5e7eb', borderRadius: '8px' }} />
          </CartLayout>
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Error state
  if (error && !isCartEmpty) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <Title>Shopping Cart</Title>
          </PageHeader>
          <CartErrorState
            error={error}
            onRetry={() => {
              clearError();
              fetchCart();
            }}
          />
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Empty cart state
  if (isCartEmpty) {
    return (
      <PageContainer>
        <ContentWrapper>
          <PageHeader>
            <Title>Shopping Cart</Title>
          </PageHeader>
          <CartEmptyState />
        </ContentWrapper>
      </PageContainer>
    );
  }

  // Get issues by type
  const stockIssues = validationIssues?.filter(
    (i) => i.issue && !i.issue.includes('price') && i.issue !== 'price_updated'
  ) || [];
  const priceIssues = validationIssues?.filter((i) => i.issue === 'price_updated') || [];

  return (
    <PageContainer>
      <ContentWrapper>
        <PageHeader>
          <Title>Shopping Cart</Title>
          <ItemCount>{items.length} item{items.length !== 1 ? 's' : ''}</ItemCount>
        </PageHeader>

        {/* Validation alerts */}
        {stockIssues.length > 0 && (
          <ValidationAlert>
            <ValidationTitle>⚠️ Availability Issues</ValidationTitle>
            <ValidationIssuesList>
              {stockIssues.map((issue, idx) => (
                <li key={idx}>{issue.issue}</li>
              ))}
            </ValidationIssuesList>
          </ValidationAlert>
        )}

        {priceIssues.length > 0 && (
          <ValidationAlert style={{ background: '#d1fae5', borderColor: '#a7f3d0' }}>
            <ValidationTitle style={{ color: '#065f46' }}>✓ Price Updates</ValidationTitle>
            <ValidationIssuesList>
              {priceIssues.map((issue, idx) => (
                <li key={idx} style={{ color: '#047857' }}>
                  Price changed from ${issue.oldPrice} to ${issue.newPrice}
                </li>
              ))}
            </ValidationIssuesList>
          </ValidationAlert>
        )}

        <CartLayout>
          {/* Cart Items */}
          <div>
            {items.length > 0 && (
              <CartActions>
                <SelectAllLabel>
                  <input
                    type="checkbox"
                    checked={selectAll}
                    onChange={(e) => setSelectAll(e.target.checked)}
                  />
                  Select All
                </SelectAllLabel>
                <ClearCartBtn onClick={handleClearCart} disabled={loading.clearingCart}>
                  {loading.clearingCart ? 'Clearing...' : 'Clear Cart'}
                </ClearCartBtn>
              </CartActions>
            )}

            <CartItems>
              {items.map((item) => (
                <CartItemCard
                  key={item._id}
                  item={item}
                  isLoading={loading.updatingItem || loading.removingItem}
                />
              ))}
            </CartItems>
          </div>

          {/* Summary Panel */}
          <CartSummaryPanel
            summary={summary}
            isValidating={loading.validatingCart}
            validationIssues={validationIssues}
            onCheckout={handleCheckout}
            onContinueShopping={handleContinueShopping}
          />
        </CartLayout>
      </ContentWrapper>
    </PageContainer>
  );
}
