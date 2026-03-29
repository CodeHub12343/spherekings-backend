/**
 * OrderConfirmationCard Component
 * Display order confirmation details
 * 
 * Features:
 * - Shows order number and status
 * - Lists items ordered
 * - Shows total price
 * - Download invoice option
 */

import styled from 'styled-components';
import Link from 'next/link';

const Card = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px;
  border: 2px solid #d1fae5;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const Header = styled.div`
  text-align: center;
  margin-bottom: 32px;
  padding-bottom: 24px;
  border-bottom: 1px solid #f3f4f6;
`;

const StatusBadge = styled.div`
  display: inline-block;
  background: #d1fae5;
  color: #065f46;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 12px;
`;

const ConfirmationIcon = styled.div`
  width: 80px;
  height: 80px;
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  font-size: 40px;
  box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
`;

const Title = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #1f2937;
  margin: 16px 0 8px;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const Message = styled.p`
  font-size: 16px;
  color: #6b7280;
  margin: 0;
`;

const OrderDetails = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const DetailRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 0;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;

  &:last-child {
    border-bottom: none;
  }

  &.highlight {
    font-weight: 600;
    color: #1f2937;
    font-size: 16px;
    padding: 16px 0;
  }
`;

const Label = styled.span`
  color: #6b7280;
  font-weight: 500;
`;

const Value = styled.span`
  color: #1f2937;
  font-weight: 600;
`;

const ItemsList = styled.div`
  margin-bottom: 24px;
`;

const ItemsTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  text-transform: uppercase;
  color: #6b7280;
  margin: 0 0 12px;
`;

const Item = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  margin-bottom: 9px;
  font-size: 14px;

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }
`;

const ItemName = styled.span`
  font-weight: 600;
  color: #1f2937;
  flex: 1;
`;

const ItemQty = styled.span`
  color: #6b7280;
  margin-right: 16px;

  @media (max-width: 768px) {
    margin-right: 0;
  }
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const Button = styled(Link)`
  flex: 1;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  text-align: center;
  text-decoration: none;
  transition: all 0.3s ease;
  font-size: 14px;
  display: inline-block;

  @media (max-width: 768px) {
    flex: 1;
    min-width: 100%;
  }
`;

const PrimaryButton = styled(Button)`
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(91, 77, 255, 0.3);
  }
`;

const SecondaryButton = styled(Button)`
  background: white;
  color: #5b4dff;
  border: 2px solid #5b4dff;

  &:hover {
    background: #f3f4f6;
  }
`;

const InfoBox = styled.div`
  background: #f0f9ff;
  border-left: 4px solid #0ea5e9;
  padding: 16px;
  border-radius: 6px;
  margin-top: 24px;
  font-size: 13px;
  color: #0c4a6e;
  line-height: 1.6;

  strong {
    display: block;
    margin-bottom: 8px;
  }
`;

const formatPrice = (price) => {
  // Price is already in dollars, don't divide by 100
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

/**
 * OrderConfirmationCard Component
 * 
 * @param {Object} props - Component props
 * @param {string} props.orderNumber - Order number (e.g., "ORD-20240115-123456")
 * @param {string} props.orderId - Order ID
 * @param {Array} props.items - Order items
 * @param {number} props.total - Total amount
 * @param {string} props.email - Customer email
 * @param {string} props.paymentStatus - Payment status
 * @param {string} props.message - Custom message to display
 * @returns {JSX.Element}
 */
export default function OrderConfirmationCard({
  orderNumber = 'PENDING',
  orderId = '',
  items = [],
  total = 0,
  email = '',
  paymentStatus = 'paid',
  message = 'Thank you for your order! We\'re preparing your items for shipment.',
}) {
  return (
    <Card>
      {/* Header */}
      <Header>
        <StatusBadge>✓ Order Confirmed</StatusBadge>
        <ConfirmationIcon>✓</ConfirmationIcon>
        <Title>Thank You for Your Order!</Title>
        <Message>{message}</Message>
      </Header>

      {/* Order Details */}
      <OrderDetails>
        <DetailRow>
          <Label>Order Number</Label>
          <Value>{orderNumber}</Value>
        </DetailRow>
        <DetailRow>
          <Label>Order Date</Label>
          <Value>{new Date().toLocaleDateString()}</Value>
        </DetailRow>
        {email && (
          <DetailRow>
            <Label>Confirmation Email</Label>
            <Value>{email}</Value>
          </DetailRow>
        )}
        <DetailRow>
          <Label>Payment Status</Label>
          <Value style={{ color: '#10b981', fontWeight: 700 }}>
            {paymentStatus === 'paid' ? '✓ Paid' : paymentStatus}
          </Value>
        </DetailRow>
      </OrderDetails>

      {/* Items */}
      {items.length > 0 && (
        <ItemsList>
          <ItemsTitle>Order Items ({items.length})</ItemsTitle>
          {items.map((item, index) => (
            <Item key={index}>
              <ItemName>{item.productName || item.name}</ItemName>
              <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                <ItemQty>Qty: {item.quantity}</ItemQty>
                <span style={{ color: '#1f2937', fontWeight: 600 }}>
                  {formatPrice(item.subtotal || item.price * item.quantity)}
                </span>
              </div>
            </Item>
          ))}
        </ItemsList>
      )}

      {/* Total */}
      <OrderDetails>
        <DetailRow className="highlight">
          <Label>Order Total</Label>
          <Value>{formatPrice(total)}</Value>
        </DetailRow>
      </OrderDetails>

      {/* Info Box */}
      <InfoBox>
        <strong>What happens next?</strong>
        <div>
          ✓ We'll send you a tracking number to your email once your order ships
          <br />
          ✓ Standard delivery takes 3-5 business days
          <br />
          ✓ You can track your order anytime in your account dashboard
        </div>
      </InfoBox>

      {/* Action Buttons */}
      <ActionButtons
        style={{
          marginTop: '24px',
          gap: '12px',
        }}
      >
        <PrimaryButton href="/products">Continue Shopping</PrimaryButton>
        <SecondaryButton href="/profile/orders">View All Orders</SecondaryButton>
      </ActionButtons>
    </Card>
  );
}
