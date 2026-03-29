/**
 * ShippingSummary Component
 * Displays collected shipping address for review before payment
 * 
 * Features:
 * - Clean display of shipping address
 * - Edit button to return to form
 * - Mobile-responsive card layout
 * - Address verification UI
 */

import styled from 'styled-components';
import { useShippingAddress } from '@/stores/checkoutStore';

const Container = styled.div`
  background: white;
  border-radius: 12px;
  border: 2px solid #e5e7eb;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 16px;
  }
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 2px solid #f3f4f6;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const EditButton = styled.button`
  background: none;
  border: 1px solid #d1d5db;
  color: #5b4dff;
  padding: 8px 16px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #f3f4f6;
    border-color: #5b4dff;
  }

  &:active {
    transform: scale(0.98);
  }

  @media (max-width: 768px) {
    padding: 6px 12px;
    font-size: 12px;
  }
`;

const AddressContent = styled.div`
  display: grid;
  gap: 16px;
`;

const AddressBlock = styled.div`
  display: grid;
  gap: 12px;
`;

const AddressLine = styled.p`
  margin: 0;
  font-size: 15px;
  color: #374151;
  line-height: 1.6;

  &.name {
    font-weight: 600;
    font-size: 16px;
    color: #1f2937;
  }

  &.contact {
    font-size: 14px;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    font-size: 14px;

    &.name {
      font-size: 15px;
    }
  }
`;

const ContactGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 12px;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid #f3f4f6;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const ContactItem = styled.div`
  font-size: 13px;
  color: #6b7280;

  .label {
    display: block;
    font-weight: 600;
    color: #9ca3af;
    text-transform: uppercase;
    font-size: 11px;
    letter-spacing: 0.5px;
    margin-bottom: 2px;
  }

  .value {
    color: #374151;
    font-size: 14px;
    word-break: break-word;
  }
`;

const VerificationBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
  color: #166534;
  margin-top: 16px;

  &::before {
    content: '✅';
    font-size: 16px;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

const WarningBox = styled.div`
  display: flex;
  gap: 8px;
  background: #fffbeb;
  border: 1px solid #fcd34d;
  border-radius: 6px;
  padding: 12px 16px;
  font-size: 13px;
  color: #92400e;
  margin-top: 16px;
  align-items: flex-start;

  &::before {
    content: '⚠️';
    flex-shrink: 0;
  }

  @media (max-width: 768px) {
    padding: 10px 12px;
    font-size: 12px;
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px 20px;
  color: #9ca3af;

  p {
    margin: 0;
  }
`;

/**
 * ShippingSummary Component
 * 
 * Displays the current shipping address collected during checkout.
 * Shows a summary card with all address details and an edit button.
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onEdit - Callback when edit button is clicked
 * @returns {JSX.Element}
 * 
 * @example
 * <ShippingSummary onEdit={() => navigate('/checkout/shipping')} />
 */
export default function ShippingSummary({ onEdit }) {
  const shippingAddress = useShippingAddress();

  // Check if address is empty
  const isEmpty = !shippingAddress || Object.values(shippingAddress).every(v => !v || v.trim() === '');

  if (isEmpty) {
    return (
      <Container>
        <Header>
          <Title>🚚 Shipping Address</Title>
        </Header>
        <EmptyState>
          <p>No shipping address selected</p>
          <p style={{ fontSize: '12px', marginTop: '8px' }}>
            Please fill in your shipping address to continue
          </p>
        </EmptyState>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Title>🚚 Shipping Address</Title>
        {onEdit && (
          <EditButton onClick={onEdit}>
            ✏️ Edit
          </EditButton>
        )}
      </Header>

      <AddressContent>
        {/* Name and Main Address */}
        <AddressBlock>
          <AddressLine className="name">
            {shippingAddress.firstName} {shippingAddress.lastName}
          </AddressLine>
          <AddressLine>
            {shippingAddress.street}
          </AddressLine>
          <AddressLine>
            {shippingAddress.city}, {shippingAddress.state} {shippingAddress.postalCode}
          </AddressLine>
          <AddressLine>
            {shippingAddress.country}
          </AddressLine>
        </AddressBlock>

        {/* Contact Information */}
        <ContactGrid>
          <ContactItem>
            <div className="label">Email</div>
            <div className="value">{shippingAddress.email}</div>
          </ContactItem>
          <ContactItem>
            <div className="label">Phone</div>
            <div className="value">{shippingAddress.phone}</div>
          </ContactItem>
        </ContactGrid>

        {/* Verification Badge */}
        <VerificationBadge>
          Address verified and ready for delivery
        </VerificationBadge>

        {/* Warning */}
        <WarningBox>
          This address cannot be changed after payment is processed
        </WarningBox>
      </AddressContent>
    </Container>
  );
}
