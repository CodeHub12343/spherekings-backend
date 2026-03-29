/**
 * PayoutStatusBadge Component
 * Displays payout status with color coding
 */

import React from 'react';
import styled from 'styled-components';

const BadgeContainer = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${(props) => {
    switch (props.status) {
      case 'pending':
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'approved':
        return `
          background-color: #d1ecf1;
          color: #0c5460;
          border: 1px solid #bee5eb;
        `;
      case 'processing':
        return `
          background-color: #b8daff;
          color: #004085;
          border: 1px solid #b6d4fe;
        `;
      case 'completed':
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'failed':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'cancelled':
        return `
          background-color: #e2e3e5;
          color: #383d41;
          border: 1px solid #d3d6d8;
        `;
      default:
        return `
          background-color: #e2e3e5;
          color: #383d41;
          border: 1px solid #d3d6d8;
        `;
    }
  }}
`;

const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
  display: inline-block;
`;

const statusLabels = {
  pending: 'Awaiting Approval',
  approved: 'Approved',
  processing: 'Processing',
  completed: 'Paid',
  failed: 'Failed',
  cancelled: 'Cancelled'
};

export default function PayoutStatusBadge({ status = 'pending', showDot = true }) {
  return (
    <BadgeContainer status={status}>
      {showDot && <Dot />}
      {statusLabels[status] || status}
    </BadgeContainer>
  );
}
