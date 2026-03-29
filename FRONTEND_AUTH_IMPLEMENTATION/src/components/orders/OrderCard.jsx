/**
 * Order Card Component
 * Displays order summary in card format
 */

'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { OrderStatusBadge, PaymentStatusBadge } from './OrderStatusBadge';

const CardContainer = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
  transition: all 0.3s ease;

  &:hover {
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
    border-color: #d1d5db;
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const OrderNumber = styled.h3`
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;

  a {
    color: #2563eb;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

const OrderDate = styled.p`
  margin: 4px 0 0 0;
  font-size: 0.875rem;
  color: #6b7280;
`;

const StatusContainer = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const OrderContent = styled.div`
  margin-bottom: 16px;
`;

const ItemsList = styled.div`
  margin-bottom: 12px;
`;

const ItemRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const ItemName = styled.span`
  flex: 1;
  font-weight: 500;
`;

const ItemQuantity = styled.span`
  color: #6b7280;
  margin: 0 12px;
`;

const ItemPrice = styled.span`
  font-weight: 500;
  color: #111827;
`;

const PricingSection = styled.div`
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;
  margin-bottom: 16px;
`;

const PricingRow = styled.div`
  display: flex;
  justify-content: space-between;
  font-size: 0.875rem;
  color: #374151;
  margin-bottom: 8px;

  &:last-child {
    margin-bottom: 0;
  }

  &.total {
    font-size: 1rem;
    font-weight: 600;
    color: #111827;
  }
`;

const FooterContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ActionLink = styled(Link)`
  padding: 8px 16px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;
  text-align: center;

  &:hover {
    background: #1d4ed8;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const SecondaryLink = styled(ActionLink)`
  background: #f3f4f6;
  color: #111827;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #e5e7eb;
  }
`;

const MetaInfo = styled.div`
  font-size: 0.875rem;
  color: #6b7280;
`;

/**
 * Order Card Component
 */
export function OrderCard({ order, showActions = true }) {
  if (!order) return null;

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <CardContainer>
      <CardHeader>
        <div>
          <OrderNumber>
            <Link href={`/orders/${order._id}`}>
              {order.orderNumber}
            </Link>
          </OrderNumber>
          <OrderDate>{formatDate(order.createdAt)}</OrderDate>
        </div>
        <StatusContainer>
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </StatusContainer>
      </CardHeader>

      <OrderContent>
        <ItemsList>
          {order.items && order.items.length > 0 ? (
            order.items.slice(0, 3).map((item, index) => (
              <ItemRow key={index}>
                <ItemName>{item.productName}</ItemName>
                <ItemQuantity>x{item.quantity}</ItemQuantity>
                <ItemPrice>{formatPrice(item.subtotal)}</ItemPrice>
              </ItemRow>
            ))
          ) : (
            <ItemRow>
              <ItemName>No items</ItemName>
            </ItemRow>
          )}
          {order.items && order.items.length > 3 && (
            <ItemRow>
              <ItemName>+{order.items.length - 3} more items</ItemName>
            </ItemRow>
          )}
        </ItemsList>
      </OrderContent>

      <PricingSection>
        <PricingRow>
          <span>Subtotal:</span>
          <span>{formatPrice(order.subtotal)}</span>
        </PricingRow>
        {order.tax > 0 && (
          <PricingRow>
            <span>Tax:</span>
            <span>{formatPrice(order.tax)}</span>
          </PricingRow>
        )}
        {order.shipping > 0 && (
          <PricingRow>
            <span>Shipping:</span>
            <span>{formatPrice(order.shipping)}</span>
          </PricingRow>
        )}
        {order.discount > 0 && (
          <PricingRow>
            <span>Discount:</span>
            <span>-{formatPrice(order.discount)}</span>
          </PricingRow>
        )}
        <PricingRow className="total">
          <span>Total:</span>
          <span>{formatPrice(order.total)}</span>
        </PricingRow>
      </PricingSection>

      <FooterContainer>
        <MetaInfo>
          {order.items ? `${order.items.length} items` : '0 items'}
        </MetaInfo>
        {showActions && (
          <div style={{ display: 'flex', gap: '8px', flex: 1, justifyContent: 'flex-end' }}>
            <SecondaryLink href={`/orders/${order._id}/invoice`}>
              Invoice
            </SecondaryLink>
            <ActionLink href={`/orders/${order._id}`}>
              Details
            </ActionLink>
          </div>
        )}
      </FooterContainer>
    </CardContainer>
  );
}

export default OrderCard;
