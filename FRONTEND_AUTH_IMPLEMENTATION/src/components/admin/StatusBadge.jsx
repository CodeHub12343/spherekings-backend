/**
 * StatusBadge - Universal status indicator component
 * Used across admin dashboard for order, commission, payout statuses
 */

'use client';

import styled from 'styled-components';

const BadgeStyled = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 4px 10px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  white-space: nowrap;
  
  ${(props) => {
    const statusStyles = {
      completed: {
        bg: '#d1fae5',
        color: '#065f46',
        border: '1px solid #a7f3d0'
      },
      pending: {
        bg: '#fef3c7',
        color: '#92400e',
        border: '1px solid #fcd34d'
      },
      active: {
        bg: '#dbeafe',
        color: '#1e40af',
        border: '1px solid #93c5fd'
      },
      inactive: {
        bg: '#f3f4f6',
        color: '#4b5563',
        border: '1px solid #d1d5db'
      },
      approved: {
        bg: '#d1fae5',
        color: '#065f46',
        border: '1px solid #a7f3d0'
      },
      rejected: {
        bg: '#fee2e2',
        color: '#7f1d1d',
        border: '1px solid #fca5a5'
      },
      processing: {
        bg: '#ede9fe',
        color: '#5b21b6',
        border: '1px solid #ddd6fe'
      },
      failed: {
        bg: '#fee2e2',
        color: '#7f1d1d',
        border: '1px solid #fca5a5'
      },
      paid: {
        bg: '#d1fae5',
        color: '#065f46',
        border: '1px solid #a7f3d0'
      },
      cancelled: {
        bg: '#f3f4f6',
        color: '#4b5563',
        border: '1px solid #d1d5db'
      },
      suspended: {
        bg: '#fee2e2',
        color: '#7f1d1d',
        border: '1px solid #fca5a5'
      }
    };

    const style = statusStyles[props.status] || statusStyles.inactive;
    return `
      background-color: ${style.bg};
      color: ${style.color};
      border: ${style.border};
    `;
  }}
`;

const StatusIcon = styled.span`
  display: inline-block;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background-color: currentColor;
`;

const STATUS_LABELS = {
  completed: 'Completed',
  pending: 'Pending',
  active: 'Active',
  inactive: 'Inactive',
  approved: 'Approved',
  rejected: 'Rejected',
  processing: 'Processing',
  failed: 'Failed',
  paid: 'Paid',
  cancelled: 'Cancelled',
  suspended: 'Suspended'
};

/**
 * StatusBadge Component
 * @param {Object} props - Component props
 * @param {string} props.status - Status value (e.g., 'completed', 'pending', 'active')
 * @param {boolean} [props.showIcon=true] - Whether to show status indicator icon
 * @param {string} [props.label] - Custom label to display (defaults to STATUS_LABELS mapping)
 * @returns {JSX.Element} Status badge component
 */
export function StatusBadge({
  status,
  showIcon = true,
  label
}) {
  const displayLabel = label || STATUS_LABELS[status] || status;

  return (
    <BadgeStyled status={status}>
      {showIcon && <StatusIcon />}
      {displayLabel}
    </BadgeStyled>
  );
}
