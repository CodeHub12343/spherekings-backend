'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { X, AlertCircle, CheckCircle, Image as ImageIcon } from 'lucide-react';

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 12px;
  max-width: 700px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1f2937;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  padding: 0;
  color: #6b7280;
  transition: color 0.2s;

  &:hover {
    color: #1f2937;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const Section = styled.div`
  margin-bottom: 24px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6b7280;
  letter-spacing: 0.5px;
`;

const InfoGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
`;

const InfoItem = styled.div`
  &:nth-child(odd):nth-last-child(odd) {
    grid-column: 1;
  }
`;

const InfoLabel = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #6b7280;
  text-transform: uppercase;
  margin-bottom: 6px;
`;

const InfoValue = styled.div`
  font-size: 14px;
  color: #1f2937;
  word-break: break-all;
`;

const ProofContainer = styled.div`
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  padding: 16px;
  background: #f9fafb;
  text-align: center;
`;

const ProofImage = styled.img`
  max-width: 100%;
  max-height: 400px;
  border-radius: 8px;
  margin: 12px 0;
`;

const ProofText = styled.div`
  font-size: 14px;
  color: #374151;
  font-family: 'Monaco', monospace;
  background: white;
  padding: 12px;
  border-radius: 6px;
  border: 1px solid #d1d5db;
  word-break: break-all;
  margin: 8px 0;
`;

const PlaceholderIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 120px;
  height: 120px;
  background: #e5e7eb;
  border-radius: 8px;
  margin: 0 auto;
  color: #9ca3af;
`;

const ReasonInput = styled.textarea`
  width: 100%;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  resize: vertical;
  min-height: 100px;

  &:focus {
    outline: none;
    border-color: #3b82f6;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }
`;

const ActionButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  border: none;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const ApproveButton = styled(Button)`
  background: #10b981;
  color: white;

  &:hover:not(:disabled) {
    background: #059669;
  }
`;

const RejectButton = styled(Button)`
  background: #ef4444;
  color: white;

  &:hover:not(:disabled) {
    background: #dc2626;
  }
`;

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 600;
  margin-top: 8px;
  background: ${(props) => {
    switch (props.type) {
      case 'pending':
        return '#fef3c7';
      case 'approved':
        return '#d1fae5';
      case 'rejected':
        return '#fee2e2';
      default:
        return '#f3f4f6';
    }
  }};
  color: ${(props) => {
    switch (props.type) {
      case 'pending':
        return '#92400e';
      case 'approved':
        return '#065f46';
      case 'rejected':
        return '#7f1d1d';
      default:
        return '#374151';
    }
  }};
`;

export default function P2PVerificationModal({
  entry,
  onClose,
  onApprove,
  onReject,
  isLoading,
}) {
  const [rejectionReason, setRejectionReason] = useState('');
  const [isRejecting, setIsRejecting] = useState(false);

  const handleApprove = async () => {
    await onApprove(entry._id);
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection reason');
      return;
    }
    setIsRejecting(true);
    await onReject(entry._id, rejectionReason.trim());
    setIsRejecting(false);
  };

  const paymentMethodLabel = {
    wise: 'Wise',
    sendwave: 'Sendwave',
    western_union: 'Western Union',
    worldremit: 'WorldRemit',
  }[entry.paymentMethod] || entry.paymentMethod;

  const hasImage = entry.proofOfPaymentUrl;
  const hasReference = entry.manualPaymentReference;

  return (
    <Overlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Verify P2P Entry</ModalTitle>
          <CloseButton onClick={onClose}>
            <X size={20} />
          </CloseButton>
        </ModalHeader>

        <ModalBody>
          {/* Entry Information */}
          <Section>
            <SectionTitle>Entry Information</SectionTitle>
            <InfoGrid>
              <InfoItem>
                <InfoLabel>Name</InfoLabel>
                <InfoValue>{entry.fullName}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Email</InfoLabel>
                <InfoValue>{entry.email}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Payment Method</InfoLabel>
                <InfoValue>{paymentMethodLabel}</InfoValue>
              </InfoItem>
              <InfoItem>
                <InfoLabel>Status</InfoLabel>
                <StatusBadge type={entry.paymentStatus}>
                  {entry.paymentStatus === 'pending_verification'
                    ? '⏳ Pending'
                    : entry.paymentStatus === 'approved'
                    ? '✓ Approved'
                    : '✗ Rejected'}
                </StatusBadge>
              </InfoItem>
            </InfoGrid>
          </Section>

          {/* Proof of Payment */}
          <Section>
            <SectionTitle>Proof of Payment</SectionTitle>
            <ProofContainer>
              {hasImage && (
                <div>
                  <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '13px' }}>
                    Receipt Screenshot:
                  </p>
                  <ProofImage src={entry.proofOfPaymentUrl} alt="Payment proof" />
                </div>
              )}

              {hasReference && (
                <div>
                  <p style={{ margin: '0 0 12px 0', color: '#6b7280', fontSize: '13px' }}>
                    Transaction Reference:
                  </p>
                  <ProofText>{entry.manualPaymentReference}</ProofText>
                </div>
              )}

              {!hasImage && !hasReference && (
                <div style={{ padding: '20px 0' }}>
                  <PlaceholderIcon>
                    <ImageIcon size={40} />
                  </PlaceholderIcon>
                  <p style={{ color: '#9ca3af', marginTop: '12px', fontSize: '14px' }}>
                    No proof provided
                  </p>
                </div>
              )}
            </ProofContainer>
          </Section>

          {/* Shipping Address */}
          <Section>
            <SectionTitle>Shipping Address</SectionTitle>
            <InfoValue>
              {entry.shippingAddress.street}
              <br />
              {entry.shippingAddress.city}, {entry.shippingAddress.state}{' '}
              {entry.shippingAddress.zipCode}
              <br />
              {entry.shippingAddress.country}
            </InfoValue>
          </Section>

          {/* Rejection Reason (show if rejecting) */}
          {isRejecting && (
            <Section>
              <SectionTitle>Rejection Reason</SectionTitle>
              <ReasonInput
                placeholder="Explain why you're rejecting this entry..."
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
              />
            </Section>
          )}

          {/* Action Buttons */}
          <ActionButtons>
            {!isRejecting ? (
              <>
                <ApproveButton onClick={handleApprove} disabled={isLoading}>
                  <CheckCircle size={16} />
                  Approve Entry
                </ApproveButton>
                <RejectButton onClick={() => setIsRejecting(true)} disabled={isLoading}>
                  <AlertCircle size={16} />
                  Reject Entry
                </RejectButton>
              </>
            ) : (
              <>
                <Button onClick={() => setIsRejecting(false)} style={{ background: '#d1d5db', color: '#1f2937' }}>
                  Back
                </Button>
                <RejectButton onClick={handleReject} disabled={isLoading}>
                  {isLoading ? 'Rejecting...' : 'Confirm Rejection'}
                </RejectButton>
              </>
            )}
          </ActionButtons>
        </ModalBody>
      </ModalContent>
    </Overlay>
  );
}
