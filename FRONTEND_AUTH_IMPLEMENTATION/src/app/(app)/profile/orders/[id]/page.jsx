'use client';

import { useParams, useRouter } from 'next/navigation';
import styled from 'styled-components';
import { useOrderDetails } from '@/hooks/useOrders';
import { formatDate, formatCurrency, formatOrderStatus, formatPaymentStatus } from '@/utils/formatting';
import { useEffect, useState } from 'react';

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const HeaderSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 32px;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  padding: 0;
  color: #5b4dff;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    color: #4c3fcc;
  }
`;

const OrderTitle = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;

  @media (max-width: 640px) {
    font-size: 24px;
  }
`;

const OrderSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0;
`;

const StatusSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatusCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 16px;
`;

const StatusLabel = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 8px;
`;

const StatusValue = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 700;
  text-transform: capitalize;

  background-color: ${props => {
    switch (props.status) {
      case 'paid':
      case 'delivered':
        return '#d1fae5';
      case 'pending':
      case 'processing':
      case 'confirmed':
      case 'shipped':
        return '#fef3c7';
      case 'failed':
      case 'cancelled':
      case 'refunded':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};

  color: ${props => {
    switch (props.status) {
      case 'paid':
      case 'delivered':
        return '#065f46';
      case 'pending':
      case 'processing':
      case 'confirmed':
      case 'shipped':
        return '#92400e';
      case 'failed':
      case 'cancelled':
      case 'refunded':
        return '#7f1d1d';
      default:
        return '#374151';
    }
  }};
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 32px;
  margin-bottom: 32px;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
    gap: 24px;
  }
`;

const MainColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
`;

const Card = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;

  @media (max-width: 640px) {
    padding: 16px;
  }
`;

const CardTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
  padding-bottom: 16px;
  border-bottom: 1px solid #f3f4f6;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;

  thead {
    background-color: #f9fafb;
  }

  th {
    padding: 12px;
    text-align: left;
    font-size: 12px;
    font-weight: 700;
    color: #6b7280;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    border-bottom: 1px solid #e5e7eb;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #e5e7eb;
    font-size: 14px;
    color: #0f172a;
  }

  tr:last-child td {
    border-bottom: none;
  }

  @media (max-width: 768px) {
    font-size: 12px;

    th,
    td {
      padding: 8px;
    }
  }
`;

const ItemName = styled.span`
  display: flex;
  flex-direction: column;
  gap: 4px;

  strong {
    color: #0f172a;
    font-weight: 600;
  }

  small {
    color: #6b7280;
    font-size: 12px;
  }
`;

const TotalsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 14px;
  color: #0f172a;

  &.total {
    font-size: 18px;
    font-weight: 700;
    color: #5b4dff;
    padding-top: 12px;
    border-top: 1px solid #e5e7eb;
    margin-top: 12px;
  }

  &.highlight span:last-child {
    font-weight: 700;
  }
`;

const AddressBlock = styled.div`
  font-size: 14px;
  line-height: 1.6;
  color: #0f172a;
  white-space: pre-line;
`;

const Section = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionLabel = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #6b7280;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 6px;
`;

const SectionValue = styled.span`
  display: block;
  font-size: 14px;
  color: #0f172a;
  font-weight: 500;
`;

const AffiliateCard = styled(Card)`
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
  border-color: #d8d0ff;
`;

const AffiliateLabel = styled(SectionLabel)`
  color: #5b4dff;
`;

const SideColumn = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;
  align-content: start;
`;

const PrintButton = styled.button`
  padding: 12px 24px;
  background-color: white;
  color: #5b4dff;
  border: 1px solid #d8d0ff;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #ede9fe;
  }

  @media (max-width: 640px) {
    width: 100%;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  font-size: 16px;
  color: #6b7280;
`;

const ErrorContainer = styled.div`
  background-color: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 12px;
  padding: 20px;
  color: #7f1d1d;

  h3 {
    margin: 0 0 8px 0;
    font-size: 16px;
    font-weight: 600;
  }

  p {
    margin: 0;
    font-size: 14px;
  }
`;

// ==================== COMPONENT ====================

export default function ProfileOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderId = params.id;
  const { order, isLoading, error } = useOrderDetails(orderId);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 640);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>Loading order details...</LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <ErrorContainer>
          <h3>Order Not Found</h3>
          <p>{error || 'The order you are looking for does not exist or you do not have access to it.'}</p>
        </ErrorContainer>
      </PageContainer>
    );
  }

  const customerName = order.shippingAddress?.firstName || 'Customer';
  const hasAffiliateDetails = order.affiliateDetails?.affiliateId;

  return (
    <PageContainer>
      {/* Header */}
      <HeaderSection>
        <HeaderContent>
          <BackLink onClick={() => router.back()}>← Back to Orders</BackLink>
          <OrderTitle>{order.orderNumber}</OrderTitle>
          <OrderSubtitle>
            {formatDate(order.createdAt)} • {customerName}
          </OrderSubtitle>
        </HeaderContent>
        <PrintButton onClick={handlePrint}>🖨️ Print</PrintButton>
      </HeaderSection>

      {/* Status Section */}
      <StatusSection>
        <StatusCard>
          <StatusLabel>Order Status</StatusLabel>
          <StatusValue status={order.orderStatus}>
            {formatOrderStatus(order.orderStatus)}
          </StatusValue>
        </StatusCard>

        <StatusCard>
          <StatusLabel>Payment Status</StatusLabel>
          <StatusValue status={order.paymentStatus}>
            {formatPaymentStatus(order.paymentStatus)}
          </StatusValue>
        </StatusCard>

        {order.paymentStatus === 'paid' && order.paymentDetails?.paidAt && (
          <StatusCard>
            <StatusLabel>Paid On</StatusLabel>
            <SectionValue>{formatDate(order.paymentDetails.paidAt)}</SectionValue>
          </StatusCard>
        )}

        {order.total && (
          <StatusCard>
            <StatusLabel>Order Total</StatusLabel>
            <SectionValue style={{ fontSize: '18px', fontWeight: 700, color: '#5b4dff' }}>
              {formatCurrency(order.total)}
            </SectionValue>
          </StatusCard>
        )}
      </StatusSection>

      {/* Content Grid */}
      <ContentGrid>
        <MainColumn>
          {/* Order Items */}
          <Card>
            <CardTitle>Items</CardTitle>
            <ItemsTable>
              <thead>
                <tr>
                  <th>Product</th>
                  <th align="center" style={{ textAlign: 'center' }}>Qty</th>
                  <th align="right" style={{ textAlign: 'right' }}>Price</th>
                  <th align="right" style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items?.map((item, idx) => (
                  <tr key={idx}>
                    <td>
                      <ItemName>
                        <strong>{item.productName}</strong>
                        {item.sku && <small>SKU: {item.sku}</small>}
                      </ItemName>
                    </td>
                    <td align="center" style={{ textAlign: 'center' }}>
                      {item.quantity}
                    </td>
                    <td align="right" style={{ textAlign: 'right' }}>
                      {formatCurrency(item.price)}
                    </td>
                    <td align="right" style={{ textAlign: 'right' }}>
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ItemsTable>

            {/* Totals */}
            <TotalsSection>
              <TotalRow>
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </TotalRow>

              {order.tax > 0 && (
                <TotalRow>
                  <span>Tax:</span>
                  <span>{formatCurrency(order.tax)}</span>
                </TotalRow>
              )}

              {order.shipping > 0 && (
                <TotalRow>
                  <span>Shipping:</span>
                  <span>{formatCurrency(order.shipping)}</span>
                </TotalRow>
              )}

              {order.discount > 0 && (
                <TotalRow>
                  <span>Discount:</span>
                  <span>-{formatCurrency(order.discount)}</span>
                </TotalRow>
              )}

              <TotalRow className="total highlight">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </TotalRow>
            </TotalsSection>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardTitle>Shipping Address</CardTitle>
            <AddressBlock>
              {order.shippingAddress?.firstName} {order.shippingAddress?.lastName}
              {'\n'}
              {order.shippingAddress?.street}
              {'\n'}
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
              {'\n'}
              {order.shippingAddress?.country}
              {order.shippingAddress?.phone && (
                <>
                  {'\n'}
                  {order.shippingAddress.phone}
                </>
              )}
              {order.shippingAddress?.email && (
                <>
                  {'\n'}
                  {order.shippingAddress.email}
                </>
              )}
            </AddressBlock>
          </Card>
        </MainColumn>

        <SideColumn>
          {/* Payment Details */}
          <Card>
            <CardTitle>Payment Details</CardTitle>
            <Section>
              <SectionLabel>Method</SectionLabel>
              <SectionValue>
                {order.paymentDetails?.paymentMethod || 'Card'}
              </SectionValue>
            </Section>

            {order.paymentDetails?.transactionId && (
              <Section>
                <SectionLabel>Transaction ID</SectionLabel>
                <SectionValue style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                  {order.paymentDetails.transactionId}
                </SectionValue>
              </Section>
            )}

            {order.paymentDetails?.chargeId && (
              <Section>
                <SectionLabel>Charge ID</SectionLabel>
                <SectionValue style={{ fontSize: '12px', wordBreak: 'break-all' }}>
                  {order.paymentDetails.chargeId}
                </SectionValue>
              </Section>
            )}

            {order.paymentDetails?.currency && (
              <Section>
                <SectionLabel>Currency</SectionLabel>
                <SectionValue>
                  {order.paymentDetails.currency.toUpperCase()}
                </SectionValue>
              </Section>
            )}
          </Card>

          {/* Affiliate Commission - Only show if applicable */}
          {hasAffiliateDetails && (
            <AffiliateCard>
              <CardTitle>Affiliate Commission</CardTitle>
              <Section>
                <AffiliateLabel>Affiliate Code</AffiliateLabel>
                <SectionValue>{order.affiliateDetails?.affiliateCode}</SectionValue>
              </Section>

              <Section>
                <AffiliateLabel>Commission Rate</AffiliateLabel>
                <SectionValue>
                  {((order.affiliateDetails?.commissionRate || 0) * 100).toFixed(1)}%
                </SectionValue>
              </Section>

              <Section>
                <AffiliateLabel>Commission Amount</AffiliateLabel>
                <SectionValue style={{ fontSize: '16px', fontWeight: 700, color: '#5b4dff' }}>
                  {formatCurrency(order.affiliateDetails?.commissionAmount || 0)}
                </SectionValue>
              </Section>

              <Section>
                <AffiliateLabel>Status</AffiliateLabel>
                <SectionValue style={{ textTransform: 'capitalize' }}>
                  {order.affiliateDetails?.status}
                </SectionValue>
              </Section>
            </AffiliateCard>
          )}

          {/* Order Metadata */}
          <Card>
            <CardTitle>Order Info</CardTitle>
            <Section>
              <SectionLabel>Created</SectionLabel>
              <SectionValue>{formatDate(order.createdAt)}</SectionValue>
            </Section>

            <Section>
              <SectionLabel>Updated</SectionLabel>
              <SectionValue>{formatDate(order.updatedAt)}</SectionValue>
            </Section>

            {order.notes && (
              <Section>
                <SectionLabel>Notes</SectionLabel>
                <SectionValue>{order.notes}</SectionValue>
              </Section>
            )}

            {order.cancellationReason && (
              <Section>
                <SectionLabel>Cancellation Reason</SectionLabel>
                <SectionValue>{order.cancellationReason}</SectionValue>
              </Section>
            )}
          </Card>
        </SideColumn>
      </ContentGrid>
    </PageContainer>
  );
}
