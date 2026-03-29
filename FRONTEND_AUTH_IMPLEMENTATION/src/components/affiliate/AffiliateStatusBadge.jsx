/**
 * Affiliate Status Badge Component
 * Displays affiliate status with appropriate styling
 */

import styled from 'styled-components';

const BadgeWrapper = styled.span`
  display: inline-block;
  padding: 6px 12px;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  ${(props) => {
    switch (props.$status) {
      case 'active':
        return `
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        `;
      case 'pending':
        return `
          background-color: #fff3cd;
          color: #856404;
          border: 1px solid #ffeaa7;
        `;
      case 'suspended':
        return `
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        `;
      case 'inactive':
        return `
          background-color: #e2e3e5;
          color: #383d41;
          border: 1px solid #d3d4d6;
        `;
      default:
        return `
          background-color: #e2e3e5;
          color: #383d41;
          border: 1px solid #d3d4d6;
        `;
    }
  }}
`;

export const AffiliateStatusBadge = ({ status, children }) => (
  <BadgeWrapper $status={status}>
    {children || status}
  </BadgeWrapper>
);

export default AffiliateStatusBadge;
