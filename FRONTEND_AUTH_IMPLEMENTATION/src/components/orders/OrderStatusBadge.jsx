/**
 * Order Status Badge Component
 * Displays order status with appropriate styling
 */

import styled from 'styled-components';

const StatusBadgeStyled = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  white-space: nowrap;
  background-color: ${(props) => {
    const statusColors = {
      pending: '#FEF3C7',
      processing: '#DBEAFE',
      confirmed: '#D1F3EA',
      shipped: '#E0E7FF',
      delivered: '#D1F3D1',
      cancelled: '#FED7D7',
      refunded: '#FED7D7',
      returned: '#FED7D7',
      complete: '#D1F3D1',
    };
    return statusColors[props.$status] || '#F3F4F6';
  }};
  color: ${(props) => {
    const statusTextColors = {
      pending: '#B45309',
      processing: '#1E40AF',
      confirmed: '#0D6D4F',
      shipped: '#3730A3',
      delivered: '#15803D',
      cancelled: '#991B1B',
      refunded: '#991B1B',
      returned: '#991B1B',
      complete: '#15803D',
    };
    return statusTextColors[props.$status] || '#374151';
  }};
`;

const StatusDot = styled.span`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
`;

const orderStatusLabels = {
  pending: 'Pending',
  processing: 'Processing',
  confirmed: 'Confirmed',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
  refunded: 'Refunded',
  returned: 'Returned',
  complete: 'Complete',
};

const paymentStatusLabels = {
  paid: 'Paid',
  pending: 'Pending',
  failed: 'Failed',
  refunded: 'Refunded',
};

/**
 * Order Status Badge
 */
export function OrderStatusBadge({ status }) {
  if (!status) return null;

  return (
    <StatusBadgeStyled $status={status}>
      <StatusDot />
      {orderStatusLabels[status] || status}
    </StatusBadgeStyled>
  );
}

/**
 * Payment Status Badge
 */
export function PaymentStatusBadge({ status }) {
  if (!status) return null;

  const StatusBadgePaymentStyled = styled(StatusBadgeStyled)`
    background-color: ${(props) => {
      const statusColors = {
        paid: '#D1F3D1',
        pending: '#FEF3C7',
        failed: '#FED7D7',
        refunded: '#FED7D7',
      };
      return statusColors[props.$status] || '#F3F4F6';
    }};
    color: ${(props) => {
      const statusTextColors = {
        paid: '#15803D',
        pending: '#B45309',
        failed: '#991B1B',
        refunded: '#991B1B',
      };
      return statusTextColors[props.$status] || '#374151';
    }};
  `;

  return (
    <StatusBadgePaymentStyled $status={status}>
      <StatusDot />
      {paymentStatusLabels[status] || status}
    </StatusBadgePaymentStyled>
  );
}

/**
 * Commission Status Badge (for affiliates)
 */
export function CommissionStatusBadge({ status }) {
  if (!status) return null;

  const commissionLabels = {
    pending: 'Pending',
    calculated: 'Calculated',
    approved: 'Approved',
    paid: 'Paid',
    reversed: 'Reversed',
  };

  const CommissionBadgeStyled = styled(StatusBadgeStyled)`
    background-color: ${(props) => {
      const statusColors = {
        pending: '#FEF3C7',
        calculated: '#DBEAFE',
        approved: '#D1F3EA',
        paid: '#D1F3D1',
        reversed: '#FED7D7',
      };
      return statusColors[props.$status] || '#F3F4F6';
    }};
    color: ${(props) => {
      const statusTextColors = {
        pending: '#B45309',
        calculated: '#1E40AF',
        approved: '#0D6D4F',
        paid: '#15803D',
        reversed: '#991B1B',
      };
      return statusTextColors[props.$status] || '#374151';
    }};
  `;

  return (
    <CommissionBadgeStyled $status={status}>
      <StatusDot />
      {commissionLabels[status] || status}
    </CommissionBadgeStyled>
  );
}

export default OrderStatusBadge;
