/**
 * Order Details Component
 * Displays complete order information
 */

'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { OrderStatusBadge, PaymentStatusBadge, CommissionStatusBadge } from './OrderStatusBadge';

const Container = styled.div`
  max-width: 900px;
  margin: 0 auto;
`;

const Header = styled.div`
  margin-bottom: 32px;
  border-bottom: 1px solid #e5e7eb;
  padding-bottom: 24px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 1.875rem;
    font-weight: 700;
    color: #111827;
  }

  p {
    margin: 0;
    color: #6b7280;
    font-size: 0.875rem;
  }
`;

const StatusSection = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const BackLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  color: #2563eb;
  text-decoration: none;
  font-size: 0.875rem;
  margin-bottom: 16px;
  transition: color 0.2s;

  &:hover {
    color: #1d4ed8;
    text-decoration: underline;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Section = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 20px;
`;

const SectionTitle = styled.h2`
  margin: 0 0 16px 0;
  font-size: 1rem;
  font-weight: 600;
  color: #111827;
";
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 12px 0;
  border-bottom: 1px solid #f3f4f6;

  &:last-child {
    border-bottom: none;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    gap: 4px;
  }
`;

const InfoLabel = styled.span`
  color: #6b7280;
  font-size: 0.875rem;
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: #111827;
  font-size: 0.875rem;
  font-weight: 600;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
`;

const TableHeader = styled.thead`
  background: #f9fafb;
  border-bottom: 2px solid #e5e7eb;

  th {
    padding: 12px;
    text-align: left;
    font-size: 0.875rem;
    font-weight: 600;
    color: #374151;
  }
`;

const TableBody = styled.tbody`
  td {
    padding: 12px;
    border-bottom: 1px solid #f3f4f6;
    font-size: 0.875rem;
    color: #111827;
  }

  tr:last-child td {
    border-bottom: none;
  }
`;

const PricingTable = styled(ItemsTable)`
  margin-top: 24px;

  td {
    padding: 8px 12px;
    text-align: right;
    border: none;

    &:first-child {
      text-align: left;
      color: #6b7280;
    }
  }

  tr.total td {
    border-top: 2px solid #d1d5db;
    padding-top: 12px;
    font-weight: 600;
    color: #111827;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
  flex-wrap: wrap;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const Button = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 10px 16px;
  background: #2563eb;
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  transition: background 0.2s;

  &:hover {
    background: #1d4ed8;
  }

  @media (max-width: 480px) {
    width: 100%;
  }
`;

const SecondaryButton = styled(Button)`
  background: #f3f4f6;
  color: #111827;
  border: 1px solid #d1d5db;

  &:hover {
    background: #e5e7eb;
  }
`;

const AffiliateSection = styled(Section)`
  grid-column: 1 / -1;
`;

const LoadingState = styled.div`
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 48px;
  text-align: center;
  color: #6b7280;
`;

const ErrorState = styled(LoadingState)`
  background: #fef2f2;
  border-color: #fecaca;
  color: #991b1b;
`;

/**
 * Order Details Component
 */
export function OrderDetails({ order, isLoading = false, error = null }) {
  if (isLoading) {
    return (
      <Container>
        <BackLink href="/orders">← Back to Orders</BackLink>
        <LoadingState>Loading order details...</LoadingState>
      </Container>
    );
  }

  if (error || !order) {
    return (
      <Container>
        <BackLink href="/orders">← Back to Orders</BackLink>
        <ErrorState>{error || 'Order not found'}</ErrorState>
      </Container>
    );
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <Container>
      <BackLink href="/orders">← Back to Orders</BackLink>

      <Header>
        <h1>{order.orderNumber}</h1>
        <p>Order placed on {formatDate(order.createdAt)}</p>
        <StatusSection>
          <OrderStatusBadge status={order.orderStatus} />
          <PaymentStatusBadge status={order.paymentStatus} />
        </StatusSection>
      </Header>

      <Grid>
        {/* Order Information */}
        <Section>
          <SectionTitle>Order Information</SectionTitle>
          <InfoRow>
            <InfoLabel>Order Number</InfoLabel>
            <InfoValue>{order.orderNumber}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Order Date</InfoLabel>
            <InfoValue>{formatDate(order.createdAt)}</InfoValue>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Order Status</InfoLabel>
            <div>
              <OrderStatusBadge status={order.orderStatus} />
            </div>
          </InfoRow>
          <InfoRow>
            <InfoLabel>Payment Status</InfoLabel>
            <div>
              <PaymentStatusBadge status={order.paymentStatus} />
            </div>
          </InfoRow>
        </Section>

        {/* Billing Information */}
        <Section>
          <SectionTitle>Billing Information</SectionTitle>
          <InfoRow>
            <InfoLabel>Subtotal</InfoLabel>
            <InfoValue>{formatPrice(order.subtotal)}</InfoValue>
          </InfoRow>
          {order.tax > 0 && (
            <InfoRow>
              <InfoLabel>Tax</InfoLabel>
              <InfoValue>{formatPrice(order.tax)}</InfoValue>
            </InfoRow>
          )}
          {order.shipping > 0 && (
            <InfoRow>
              <InfoLabel>Shipping</InfoLabel>
              <InfoValue>{formatPrice(order.shipping)}</InfoValue>
            </InfoRow>
          )}
          {order.discount > 0 && (
            <InfoRow>
              <InfoLabel>Discount</InfoLabel>
              <InfoValue>-{formatPrice(order.discount)}</InfoValue>
            </InfoRow>
          )}
          <InfoRow>
            <InfoLabel style={{ fontWeight: 700 }}>Total</InfoLabel>
            <InfoValue style={{ fontSize: '1rem' }}>
              {formatPrice(order.total)}
            </InfoValue>
          </InfoRow>
        </Section>

        {/* Payment Details */}
        {order.paymentDetails && (
          <Section>
            <SectionTitle>Payment Details</SectionTitle>
            {order.paymentDetails.paidAt && (
              <InfoRow>
                <InfoLabel>Paid at</InfoLabel>
                <InfoValue>{formatDate(order.paymentDetails.paidAt)}</InfoValue>
              </InfoRow>
            )}
            {order.paymentDetails.chargeId && (
              <InfoRow>
                <InfoLabel>Charge ID</InfoLabel>
                <InfoValue style={{ fontSize: '0.75rem', fontFamily: 'monospace' }}>
                  {order.paymentDetails.chargeId}
                </InfoValue>
              </InfoRow>
            )}
          </Section>
        )}

        {/* Affiliate Information */}
        {order.affiliateDetails && (
          <Section>
            <SectionTitle>Affiliate Information</SectionTitle>
            <InfoRow>
              <InfoLabel>Affiliate Code</InfoLabel>
              <InfoValue>{order.affiliateDetails.affiliateCode}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Commission Rate</InfoLabel>
              <InfoValue>
                {(order.affiliateDetails.commissionRate * 100).toFixed(1)}%
              </InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Commission Amount</InfoLabel>
              <InfoValue>{formatPrice(order.affiliateDetails.commissionAmount)}</InfoValue>
            </InfoRow>
            <InfoRow>
              <InfoLabel>Commission Status</InfoLabel>
              <div>
                <CommissionStatusBadge status={order.affiliateDetails.status} />
              </div>
            </InfoRow>
          </Section>
        )}
      </Grid>

      {/* Order Items */}
      <Section>
        <SectionTitle>Order Items ({order.items?.length || 0})</SectionTitle>
        {order.items && order.items.length > 0 ? (
          <>
            <ItemsTable>
              <TableHeader>
                <tr>
                  <th>Product</th>
                  <th style={{ textAlign: 'center' }}>Quantity</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </TableHeader>
              <TableBody>
                {order.items.map((item, index) => (
                  <tr key={index}>
                    <td>
                      <div style={{ marginBottom: '4px', fontWeight: 500 }}>
                        {item.productName}
                      </div>
                      {item.sku && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          SKU: {item.sku}
                        </div>
                      )}
                      {item.variant && Object.keys(item.variant).length > 0 && (
                        <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>
                          {Object.entries(item.variant)
                            .map(([key, value]) => `${key}: ${value}`)
                            .join(', ')}
                        </div>
                      )}
                    </td>
                    <td style={{ textAlign: 'center' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>{formatPrice(item.price)}</td>
                    <td style={{ textAlign: 'right', fontWeight: 500 }}>
                      {formatPrice(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </TableBody>
            </ItemsTable>

            <PricingTable>
              <tbody>
                <tr>
                  <td>Subtotal:</td>
                  <td>{formatPrice(order.subtotal)}</td>
                </tr>
                {order.tax > 0 && (
                  <tr>
                    <td>Tax:</td>
                    <td>{formatPrice(order.tax)}</td>
                  </tr>
                )}
                {order.shipping > 0 && (
                  <tr>
                    <td>Shipping:</td>
                    <td>{formatPrice(order.shipping)}</td>
                  </tr>
                )}
                {order.discount > 0 && (
                  <tr>
                    <td>Discount:</td>
                    <td>-{formatPrice(order.discount)}</td>
                  </tr>
                )}
                <tr className="total">
                  <td>Total:</td>
                  <td>{formatPrice(order.total)}</td>
                </tr>
              </tbody>
            </PricingTable>
          </>
        ) : (
          <p>No items found</p>
        )}
      </Section>

      <ActionContainer>
        <SecondaryButton href={`/orders/${order._id}/invoice`} as={Link}>
          Download Invoice
        </SecondaryButton>
        <SecondaryButton href="/orders" as={Link}>
          Back to Orders
        </SecondaryButton>
      </ActionContainer>
    </Container>
  );
}

export default OrderDetails;
