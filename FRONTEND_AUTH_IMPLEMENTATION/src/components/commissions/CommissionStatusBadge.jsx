/**
 * Commission Status Badge Component
 * Displays commission status with color coding
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
  white-space: nowrap;

  ${(props) => {
    switch (props.$status) {
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
      case 'paid':
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'reversed':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      default:
        return `
          background-color: #e2e3e5;
          color: #383d41;
          border: 1px solid #d6d8db;
        `;
    }
  }}
`;

const Dot = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
`;

/**
 * Commission Status Badge
 * 
 * @param {string} status - Commission status (pending, approved, paid, reversed)
 * @param {string} className - Additional CSS class
 * @returns {JSX.Element}
 */
export function CommissionStatusBadge({ status, className }) {
  const getStatusLabel = (status) => {
    const mapping = {
      pending: 'Pending',
      approved: 'Approved',
      paid: 'Paid',
      reversed: 'Reversed',
    };
    return mapping[status] || status;
  };

  return (
    <BadgeContainer $status={status} className={className} title={`Status: ${status}`}>
      <Dot />
      {getStatusLabel(status)}
    </BadgeContainer>
  );
}

export default CommissionStatusBadge;
