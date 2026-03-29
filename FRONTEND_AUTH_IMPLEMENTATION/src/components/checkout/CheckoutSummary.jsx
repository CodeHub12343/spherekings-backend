/**
 * CheckoutSummary Component
 * Displays order summary with totals and shipping address
 * 
 * Features:
 * - Shows subtotal, tax, and total
 * - Shows item count
 * - Displays collected shipping address
 * - Discount/promo support
 * - Responsive design
 */

import styled from 'styled-components';
import { useShippingAddress } from '@/stores/checkoutStore';
import ShippingSummary from './ShippingSummary';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  padding: 24px;
  border: 1px solid #e5e7eb;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  font-size: 14px;
  color: #6b7280;

  &.total {
    font-size: 18px;
    font-weight: 700;
    color: #1f2937;
    padding-top: 16px;
    border-top: 2px solid #f3f4f6;
    margin-top: 16px;
  }

  &.discount {
    color: #10b981;
    font-weight: 600;
  }
`;

const Label = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Value = styled.span`
  font-weight: 600;
  color: #1f2937;
`;

const Badge = styled.span`
  display: inline-block;
  background: #f3f4f6;
  color: #6b7280;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 600;
`;

const InfoText = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 16px 0 0;
  text-align: center;
`;

const PriceBreakdown = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin: 12px 0;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  border-left: 3px solid #5b4dff;
`;

const BreakdownRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 13px;
  color: #6b7280;

  &.highlight {
    color: #1f2937;
    font-weight: 600;
  }
`;

/**
 * CheckoutSummary Component
 * 
 * @param {Object} props - Component props
 * @param {Object} props.totals - Price totals
 * @param {number} props.totals.subtotal - Subtotal before tax
 * @param {number} props.totals.tax - Tax amount
 * @param {number} props.totals.total - Final total
 * @param {number} props.totals.discount - Discount amount (optional)
 * @param {number} props.itemCount - Number of items
 * @param {string} props.title - Section title
 * @param {boolean} props.showBreakdown - Show detailed breakdown
 * @param {boolean} props.showShippingNote - Show shipping note
 * @param {Function} props.onEditShipping - Callback when user clicks edit shipping
 * @returns {JSX.Element}
 */
export default function CheckoutSummary({
  totals = {
    subtotal: 0,
    tax: 0,
    total: 0,
    discount: 0,
  },
  itemCount = 0,
  title = 'Order Summary',
  showBreakdown = true,
  showShippingNote = true,
  onEditShipping,
}) {
  const shippingAddress = useShippingAddress();
  const { subtotal, tax, discount = 0, total } = totals;

  const formatPrice = (price) => {
    // Price is already in dollars, don't divide by 100
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Container>
      <Title>{title}</Title>

      {/* Item Count Badge */}
      {itemCount > 0 && (
        <Row>
          <Label>Items ({itemCount})</Label>
          <Badge>{itemCount} in cart</Badge>
        </Row>
      )}

      {/* Detailed Breakdown */}
      {showBreakdown && (
        <PriceBreakdown>
          <BreakdownRow>
            <span>Subtotal:</span>
            <Value>{formatPrice(subtotal)}</Value>
          </BreakdownRow>

          {tax > 0 && (
            <BreakdownRow>
              <span>Tax (10%):</span>
              <Value>{formatPrice(tax)}</Value>
            </BreakdownRow>
          )}

          {discount > 0 && (
            <BreakdownRow className="discount">
              <span>Discount:</span>
              <Value>-{formatPrice(discount)}</Value>
            </BreakdownRow>
          )}

          <BreakdownRow className="highlight">
            <span>Total:</span>
            <Value>{formatPrice(total)}</Value>
          </BreakdownRow>
        </PriceBreakdown>
      )}

      {/* Simple View (Without Breakdown) */}
      {!showBreakdown && (
        <>
          <Row>
            <Label>Subtotal</Label>
            <Value>{formatPrice(subtotal)}</Value>
          </Row>

          {tax > 0 && (
            <Row>
              <Label>Tax</Label>
              <Value>{formatPrice(tax)}</Value>
            </Row>
          )}

          {discount > 0 && (
            <Row className="discount">
              <Label>Discount</Label>
              <Value>-{formatPrice(discount)}</Value>
            </Row>
          )}

          <Row className="total">
            <Label>Total</Label>
            <Value>{formatPrice(total)}</Value>
          </Row>
        </>
      )}

      {/* Shipping Info Note */}
      {showShippingNote && (
        <InfoText>
          ✓ Free shipping on all orders | Estimated delivery: 3-5 business days
        </InfoText>
      )}

      {/* Shipping Address Section */}
      {shippingAddress && Object.values(shippingAddress).some(v => v) && (
        <div style={{ marginTop: '24px', paddingTop: '24px', borderTop: '1px solid #f3f4f6' }}>
          <h4 style={{ fontSize: '14px', fontWeight: '600', color: '#1f2937', margin: '0 0 12px' }}>
            Shipping Address
          </h4>
          <ShippingSummary onEdit={onEditShipping} />
        </div>
      )}
    </Container>
  );
}
