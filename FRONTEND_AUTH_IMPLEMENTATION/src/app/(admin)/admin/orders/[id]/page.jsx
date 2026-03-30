'use client';
export const dynamic = 'force-dynamic';

import { useParams, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import styled from 'styled-components';
import { useOrderDetails } from '@/hooks/useOrders';
import orderService from '@/api/services/orderService';
import { StatusBadge } from '@/components/admin/StatusBadge';
import { OrderStatusBadge } from '@/components/orders/OrderStatusBadge';
import { Button } from '@/components/ui/buttons';
import { Toast } from '@/utils/toast';
import { formatDate, formatCurrency } from '@/utils/formatting';

// ==================== STYLED COMPONENTS ====================

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px 16px;

  @media (min-width: 768px) {
    padding: 32px 24px;
  }

  @media (min-width: 1024px) {
    padding: 32px;
  }
`;

const HeaderSection = styled.div`
  margin-bottom: 32px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 16px;
  flex-wrap: wrap;

  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const BackLink = styled.button`
  background: none;
  border: none;
  color: #5b4dff;
  cursor: pointer;
  font-size: 14px;
  margin-bottom: 8px;
  padding: 0;
  display: flex;
  align-items: center;
  gap: 4px;

  &:hover {
    text-decoration: underline;
  }
`;

const PageTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 8px 0 4px 0;

  @media (max-width: 768px) {
    font-size: 24px;
  }
`;

const PageSubtitle = styled.p`
  font-size: 14px;
  color: #64748b;
  margin: 0;
`;

const ActionsSection = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;

  @media (max-width: 486px) {
    flex-direction: column;
    width: 100%;

    button {
      width: 100%;
    }
  }
`;

const ContentGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: 2fr 1fr;
  }
`;

const MainColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const SideColumn = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Card = styled.div`
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #0f172a;
  margin: 0 0 16px 0;
  padding-bottom: 12px;
  border-bottom: 1px solid #e2e8f0;
`;

const Section = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  margin-bottom: 4px;
`;

const SectionValue = styled.div`
  font-size: 14px;
  color: #0f172a;
  word-break: break-word;
`;

const StatusGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 20px;
`;

const StatusItem = styled.div`
  background: #f9fafb;
  border-radius: 8px;
  padding: 12px;
`;

const ItemsTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;

  thead {
    background: #f9fafb;
  }

  th {
    padding: 12px;
    text-align: left;
    font-weight: 600;
    color: #64748b;
    border-bottom: 1px solid #e2e8f0;
    font-size: 12px;
    text-transform: uppercase;
  }

  td {
    padding: 12px;
    border-bottom: 1px solid #e2e8f0;
    color: #0f172a;
  }

  tbody tr:last-child td {
    border-bottom: none;
  }

  tbody tr:hover {
    background: #f9fafb;
  }

  @media (max-width: 768px) {
    font-size: 12px;

    th,
    td {
      padding: 8px;
    }
  }
`;

const TotalsSection = styled.div`
  margin-top: 16px;
  padding-top: 16px;
  border-top: 2px solid #e2e8f0;
`;

const TotalRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;

  &.total {
    font-weight: 700;
    font-size: 16px;
    color: #0f172a;
    padding-top: 8px;
    border-top: 1px solid #e2e8f0;
  }

  &.highlight {
    background: #fffff0;
    padding: 8px 12px;
    border-radius: 4px;
    margin: 8px 0;
  }
`;

const AddressBlock = styled.div`
  background: #f9fafb;
  border-radius: 6px;
  padding: 12px;
  font-size: 13px;
  line-height: 1.6;
  color: #0f172a;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 60vh;
  color: #64748b;
`;

const ErrorContainer = styled.div`
  background: #fee2e2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  padding: 20px;
  color: #991b1b;
  text-align: center;
`;

const StatusUpdateModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 16px;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 20px 25px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 16px 0;
`;

const ModalSelect = styled.select`
  width: 100%;
  padding: 10px;
  margin-bottom: 16px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 14px;
  color: #0f172a;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
`;

const AffiliateCard = styled(Card)`
  background: linear-gradient(135deg, #ede9fe 0%, #f5f3ff 100%);
  border-color: #d8d0ff;
`;

// ==================== COMPONENT ====================

const VALID_STATUS_TRANSITIONS = {
  pending: ['processing', 'cancelled'],
  processing: ['confirmed', 'shipped', 'cancelled', 'refunded'],
  confirmed: ['shipped', 'cancelled', 'refunded'],
  shipped: ['delivered', 'returned'],
  delivered: ['returned'],
  cancelled: [],
  refunded: [],
  returned: []
};

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const queryClient = useQueryClient();
  const orderId = params.id;

  const { order, isLoading, error } = useOrderDetails(orderId);
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [newStatus, setNewStatus] = useState('');

  if (isLoading) {
    return (
      <PageContainer>
        <LoadingContainer>
          <div>Loading order details...</div>
        </LoadingContainer>
      </PageContainer>
    );
  }

  if (error || !order) {
    return (
      <PageContainer>
        <HeaderSection>
          <HeaderContent>
            <BackLink onClick={() => router.back()}>← Back to Orders</BackLink>
            <PageTitle>Order Not Found</PageTitle>
          </HeaderContent>
        </HeaderSection>
        <ErrorContainer>
          {error?.message || 'Could not load order details. Please try again.'}
        </ErrorContainer>
      </PageContainer>
    );
  }

  const handleUpdateStatus = async () => {
    if (!newStatus) return;

    setUpdatingStatus(true);
    try {
      await orderService.updateOrderStatus(orderId, newStatus);
      Toast.success({
        title: 'Success',
        message: `Order status updated to ${newStatus}`,
        duration: 3000
      });
      setShowStatusModal(false);
      setNewStatus('');
      // Refresh order data
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    } catch (err) {
      Toast.error({
        title: 'Error',
        message: err.message || 'Failed to update order status',
        duration: 3000
      });
    } finally {
      setUpdatingStatus(false);
    }
  };

  const validTransitions = VALID_STATUS_TRANSITIONS[order.orderStatus] || [];
  const customerName = order.shippingAddress?.firstName || 'Customer';
  const hasAffiliateDetails = order.affiliateDetails?.affiliateId;

  return (
    <PageContainer>
      {/* Header */}
      <HeaderSection>
        <HeaderContent>
          <BackLink onClick={() => router.back()}>← Back to Orders</BackLink>
          <PageTitle>{order.orderNumber}</PageTitle>
          <PageSubtitle>
            {formatDate(order.createdAt)} • {customerName}
          </PageSubtitle>
        </HeaderContent>
        <ActionsSection>
          {validTransitions.length > 0 && (
            <Button
              onClick={() => setShowStatusModal(true)}
              variant="primary"
            >
              Update Status
            </Button>
          )}
          <Button variant="secondary">Print</Button>
        </ActionsSection>
      </HeaderSection>

      {/* Main Content */}
      <ContentGrid>
        <MainColumn>
          {/* Status Section */}
          <Card>
            <CardTitle>Order Status</CardTitle>
            <StatusGrid>
              <StatusItem>
                <SectionLabel>Order Status</SectionLabel>
                <OrderStatusBadge
                  orderStatus={order.orderStatus}
                  paymentStatus={order.paymentStatus}
                />
              </StatusItem>
              <StatusItem>
                <SectionLabel>Payment Status</SectionLabel>
                <StatusBadge status={order.paymentStatus} />
              </StatusItem>
              {order.paymentDetails?.paidAt && (
                <StatusItem>
                  <SectionLabel>Paid Date</SectionLabel>
                  <SectionValue>
                    {formatDate(order.paymentDetails.paidAt)}
                  </SectionValue>
                </StatusItem>
              )}
            </StatusGrid>
          </Card>

          {/* Order Items */}
          <Card>
            <CardTitle>Items Ordered ({order.items.length})</CardTitle>
            <ItemsTable>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>SKU</th>
                  <th style={{ textAlign: 'right' }}>Qty</th>
                  <th style={{ textAlign: 'right' }}>Price</th>
                  <th style={{ textAlign: 'right' }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {order.items.map((item, idx) => (
                  <tr key={idx}>
                    <td>{item.productName}</td>
                    <td>{item.sku || '—'}</td>
                    <td style={{ textAlign: 'right' }}>{item.quantity}</td>
                    <td style={{ textAlign: 'right' }}>
                      {formatCurrency(item.price)}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      {formatCurrency(item.subtotal)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </ItemsTable>

            <TotalsSection>
              <TotalRow>
                <span>Subtotal:</span>
                <span>{formatCurrency(order.subtotal)}</span>
              </TotalRow>
              <TotalRow>
                <span>Tax ({(order.taxRate * 100).toFixed(1)}%):</span>
                <span>{formatCurrency(order.tax)}</span>
              </TotalRow>
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
              <TotalRow className="highlight total">
                <span>Total:</span>
                <span>{formatCurrency(order.total)}</span>
              </TotalRow>
            </TotalsSection>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardTitle>Shipping Address</CardTitle>
            <AddressBlock>
              {order.shippingAddress?.firstName}{' '}
              {order.shippingAddress?.lastName}
              <br />
              {order.shippingAddress?.street}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state}{' '}
              {order.shippingAddress?.postalCode}
              <br />
              {order.shippingAddress?.country}
              <br />
              {order.shippingAddress?.phone && (
                <>
                  {order.shippingAddress.phone}
                  <br />
                </>
              )}
              {order.shippingAddress?.email && order.shippingAddress.email}
            </AddressBlock>
          </Card>
        </MainColumn>

        <SideColumn>
          {/* Payment Details */}
          <Card>
            <CardTitle>Payment Details</CardTitle>
            <Section>
              <SectionLabel>Payment Method</SectionLabel>
              <SectionValue>
                {order.paymentDetails?.paymentMethod || 'Card'}
              </SectionValue>
            </Section>
            <Section>
              <SectionLabel>Transaction ID</SectionLabel>
              <SectionValue>
                {order.paymentDetails?.transactionId || 'N/A'}
              </SectionValue>
            </Section>
            <Section>
              <SectionLabel>Charge ID</SectionLabel>
              <SectionValue>
                {order.paymentDetails?.chargeId || 'N/A'}
              </SectionValue>
            </Section>
            <Section>
              <SectionLabel>Currency</SectionLabel>
              <SectionValue>
                {(order.paymentDetails?.currency || 'USD').toUpperCase()}
              </SectionValue>
            </Section>
          </Card>

          {/* Affiliate Information */}
          {hasAffiliateDetails && (
            <AffiliateCard>
              <CardTitle>🤝 Affiliate Commission</CardTitle>
              <Section>
                <SectionLabel>Affiliate Code</SectionLabel>
                <SectionValue>
                  {order.affiliateDetails?.affiliateCode || 'N/A'}
                </SectionValue>
              </Section>
              <Section>
                <SectionLabel>Commission Rate</SectionLabel>
                <SectionValue>
                  {(order.affiliateDetails?.commissionRate * 100 || 0).toFixed(
                    1
                  )}
                  %
                </SectionValue>
              </Section>
              <Section>
                <SectionLabel>Commission Amount</SectionLabel>
                <SectionValue>
                  {formatCurrency(
                    order.affiliateDetails?.commissionAmount || 0
                  )}
                </SectionValue>
              </Section>
              <Section>
                <SectionLabel>Commission Status</SectionLabel>
                <StatusBadge status={order.affiliateDetails?.status} />
              </Section>
            </AffiliateCard>
          )}

          {/* Order Metadata */}
          <Card>
            <CardTitle>Order Information</CardTitle>
            <Section>
              <SectionLabel>Order Date</SectionLabel>
              <SectionValue>{formatDate(order.createdAt)}</SectionValue>
            </Section>
            <Section>
              <SectionLabel>Last Updated</SectionLabel>
              <SectionValue>{formatDate(order.updatedAt)}</SectionValue>
            </Section>
            {order.notes && (
              <Section>
                <SectionLabel>Admin Notes</SectionLabel>
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

      {/* Status Update Modal */}
      {showStatusModal && (
        <StatusUpdateModal onClick={() => setShowStatusModal(false)}>
          <ModalContent onClick={(e) => e.stopPropagation()}>
            <ModalTitle>Update Order Status</ModalTitle>
            <p style={{ fontSize: '13px', color: '#64748b', marginBottom: '16px' }}>
              Current Status: <strong>{order.orderStatus}</strong>
            </p>
            <ModalSelect
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
            >
              <option value="">Select new status...</option>
              {validTransitions.map((status) => (
                <option key={status} value={status}>
                  {status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </ModalSelect>
            <ModalActions>
              <Button
                variant="ghost"
                onClick={() => setShowStatusModal(false)}
                disabled={updatingStatus}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleUpdateStatus}
                disabled={!newStatus || updatingStatus}
              >
                {updatingStatus ? 'Updating...' : 'Update Status'}
              </Button>
            </ModalActions>
          </ModalContent>
        </StatusUpdateModal>
      )}
    </PageContainer>
  );
}
