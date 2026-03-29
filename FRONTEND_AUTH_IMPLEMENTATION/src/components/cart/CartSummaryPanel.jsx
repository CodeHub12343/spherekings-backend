'use client';

import styled from 'styled-components';
import { Button } from '@/components/ui/Button';
import CheckoutButton from '@/components/checkout/CheckoutButton';
import { ChevronRight } from 'lucide-react';

const SummaryContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: fit-content;
  position: sticky;
  top: 20px;

  @media (max-width: 768px) {
    position: static;
    padding: 20px;
  }
`;

const Title = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
  margin: 0;
`;

const SummaryRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #6b7280;

  &.total {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    padding-top: 16px;
    border-top: 2px solid #f3f4f6;
  }
`;

const Label = styled.span`
  color: #6b7280;
`;

const Value = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const DiscountBadge = styled.span`
  display: inline-block;
  background: #d1fae5;
  color: #065f46;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const Divider = styled.div`
  height: 1px;
  background: #f3f4f6;
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const ContinueShoppingButtonStyled = styled(Button)`
  width: 100%;
  background: white;
  color: #5b4dff;
  border: 1px solid #5b4dff;

  &:hover {
    background: #f9f5ff;
  }
`;

const PromoCodeSection = styled.div`
  display: flex;
  gap: 8px;
`;

const PromoInput = styled.input`
  flex: 1;
  padding: 10px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const PromoButton = styled.button`
  padding: 10px 16px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  color: #6b7280;
  transition: all 0.2s;

  &:hover {
    background: #e5e7eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  background: #eff6ff;
  border-left: 4px solid #3b82f6;
  padding: 12px;
  border-radius: 4px;
  font-size: 13px;
  color: #1e40af;
`;

/**
 * CartSummaryPanel Component
 * Displays cart totals and checkout options
 * Integrated with Checkout system
 */
export default function CartSummaryPanel({
  summary = {},
  isValidating = false,
  validationIssues = null,
  onContinueShopping = () => {},
  onPromoCode = () => {},
  affiliateId = null,
}) {
  const {
    itemCount = 0,
    totalItems = 0,
    subtotal = 0,
    tax = 0,
    total = 0,
  } = summary;

  const hasIssues = validationIssues && validationIssues.length > 0;
  const priceChanges = validationIssues?.filter((issue) => issue.issue === 'price_updated') || [];
  const savingsAmount = priceChanges.reduce((total, issue) => {
    return total + (issue.oldPrice - issue.newPrice) * (issue.quantity || 1);
  }, 0);

  return (
    <SummaryContainer>
      <Title>Order Summary</Title>

      <div>
        <SummaryRow>
          <Label>Items ({totalItems})</Label>
          <Value>${subtotal.toFixed(2)}</Value>
        </SummaryRow>
        <SummaryRow>
          <Label>Shipping</Label>
          <Value>FREE</Value>
        </SummaryRow>
        <SummaryRow>
          <Label>Tax</Label>
          <Value>${tax.toFixed(2)}</Value>
        </SummaryRow>

        {savingsAmount > 0 && (
          <SummaryRow>
            <Label>Savings</Label>
            <DiscountBadge>-${savingsAmount.toFixed(2)}</DiscountBadge>
          </SummaryRow>
        )}
      </div>

      <Divider />

      <SummaryRow className="total">
        <Label>Total</Label>
        <Value>${total.toFixed(2)}</Value>
      </SummaryRow>

      {hasIssues && (
        <InfoBox>
          ⚠️ Some items in your cart have changed availability or price. Please review
          before checkout.
        </InfoBox>
      )}

      <ButtonGroup>
        <CheckoutButton
          fullWidth
          disabled={isValidating || totalItems === 0}
          label={isValidating ? 'Validating...' : 'Proceed to Checkout'}
          affiliateId={affiliateId}
        />
        <ContinueShoppingButtonStyled onClick={onContinueShopping} variant="outline">
          Continue Shopping
        </ContinueShoppingButtonStyled>
      </ButtonGroup>

      <PromoCodeSection>
        <PromoInput placeholder="Enter promo code" />
        <PromoButton onClick={() => onPromoCode()}>Apply</PromoButton>
      </PromoCodeSection>
    </SummaryContainer>
  );
}
