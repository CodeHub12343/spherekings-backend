'use client';

/**
 * PayoutModals Component
 * Admin modals for payout approval, processing, and rejection
 */

import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
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
  border-radius: 8px;
  padding: 24px;
  max-width: 500px;
  width: 90%;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
`;

const ModalTitle = styled.h3`
  font-size: 18px;
  font-weight: 700;
  margin: 0 0 16px 0;
  color: #1a1a1a;
`;

const ModalBody = styled.div`
  margin-bottom: 20px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #666;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #999;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 13px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #999;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 13px;
  border: 1px solid #f5c6cb;
`;

const HelperText = styled.div`
  font-size: 12px;
  color: #666;
  margin-top: 4px;
  line-height: 1.4;
`;

const ModalFooter = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const Button = styled.button`
  padding: 10px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  background: white;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  transition: all 0.2s ease;

  &:hover:not(:disabled) {
    background-color: #f8f9fa;
    border-color: #2563eb;
    color: #2563eb;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.primary {
    background-color: #2563eb;
    color: white;
    border-color: #2563eb;

    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
  }

  &.success {
    background-color: #27ae60;
    color: white;
    border-color: #27ae60;

    &:hover:not(:disabled) {
      background-color: #229954;
    }
  }

  &.danger {
    background-color: #dc3545;
    color: white;
    border-color: #dc3545;

    &:hover:not(:disabled) {
      background-color: #c82333;
    }
  }
`;

/**
 * Approval Modal
 */
export function ApprovalModal({
  isOpen = false,
  payoutId,
  notes = '',
  isLoading = false,
  error,
  onApprove,
  onClose
}) {
  const [localNotes, setLocalNotes] = useState(notes);

  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Approve Payout Request</ModalTitle>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormGroup>
            <Label>Approval Notes (Optional)</Label>
            <Textarea
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              disabled={isLoading}
              placeholder="Add notes for your records..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="success"
            onClick={() => onApprove({ payoutId, notes: localNotes })}
            disabled={isLoading}
          >
            {isLoading ? 'Approving...' : 'Approve'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

/**
 * Processing Modal - Mark Payout as Paid
 */
export function ProcessingModal({
  isOpen = false,
  payoutId,
  receiptId = '',
  transactionId = '',
  isLoading = false,
  error,
  onProcess,
  onClose
}) {
  const [localReceiptId, setLocalReceiptId] = useState(receiptId);
  const [localTransactionId, setLocalTransactionId] = useState(transactionId);

  useEffect(() => {
    setLocalReceiptId(receiptId);
    setLocalTransactionId(transactionId);
  }, [receiptId, transactionId]);

  const handleSubmit = () => {
    if (!localReceiptId.trim()) {
      console.error('Receipt ID is required');
      return;
    }
    onProcess({ 
      payoutId, 
      receiptId: localReceiptId,
      transactionId: localTransactionId
    });
  };

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Mark Payout as Paid</ModalTitle>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormGroup>
            <Label>Receipt ID <span style={{ color: '#d9534f' }}>*</span> (Required)</Label>
            <Input
              type="text"
              value={localReceiptId}
              onChange={(e) => setLocalReceiptId(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., BANK-TRANSFER-20260328-001"
              autoFocus
            />
            <HelperText>Enter the receipt number or reference for this payment (e.g., bank transfer reference, payment proof)</HelperText>
          </FormGroup>
          <FormGroup>
            <Label>Transaction ID (Optional)</Label>
            <Input
              type="text"
              value={localTransactionId}
              onChange={(e) => setLocalTransactionId(e.target.value)}
              disabled={isLoading}
              placeholder="e.g., TXN-123456789"
            />
            <HelperText>Optional transaction ID from your payment system</HelperText>
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="primary"
            onClick={handleSubmit}
            disabled={isLoading || !localReceiptId.trim()}
          >
            {isLoading ? 'Processing...' : 'Mark as Paid'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

/**
 * Rejection Modal
 */
export function RejectionModal({
  isOpen = false,
  payoutId,
  reason = '',
  details = '',
  isLoading = false,
  error,
  onReject,
  onClose
}) {
  const [localReason, setLocalReason] = useState(reason);
  const [localDetails, setLocalDetails] = useState(details);

  useEffect(() => {
    setLocalReason(reason);
    setLocalDetails(details);
  }, [reason, details]);

  if (!isOpen) return null;

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalTitle>Reject Payout Request</ModalTitle>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormGroup>
            <Label>Rejection Reason</Label>
            <Select
              value={localReason}
              onChange={(e) => setLocalReason(e.target.value)}
              disabled={isLoading}
            >
              <option value="">-- Select Reason --</option>
              <option value="insufficient_funds">Insufficient Funds</option>
              <option value="invalid_details">Invalid Details</option>
              <option value="fraud_flag">Fraud Flag</option>
              <option value="system_error">System Error</option>
              <option value="admin_discretion">Admin Discretion</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label>Additional Details</Label>
            <Textarea
              value={localDetails}
              onChange={(e) => setLocalDetails(e.target.value)}
              disabled={isLoading}
              placeholder="Provide details about the rejection..."
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            className="danger"
            onClick={() => onReject({ payoutId, reason: localReason, details: localDetails })}
            disabled={isLoading || !localReason}
          >
            {isLoading ? 'Rejecting...' : 'Reject'}
          </Button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}
