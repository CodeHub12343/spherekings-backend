/**
 * Commission Action Modals
 * Approval, Payment, and Reversal modals for admin operations
 */

import React, { useState } from 'react';
import styled from 'styled-components';

const ModalOverlay = styled.div`
  display: ${(props) => (props.$isOpen ? 'flex' : 'none')};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.2);
  max-width: 500px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  padding: 20px;
  border-bottom: 1px solid #e0e0e0;
  display: flex;
  justify-content: space-between;
  align-items: center;

  h2 {
    margin: 0;
    font-size: 18px;
    font-weight: 600;
  }

  button {
    background: none;
    border: none;
    font-size: 24px;
    cursor: pointer;
    color: #666;

    &:hover {
      color: #000;
    }
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const ModalFooter = styled.div`
  padding: 20px;
  border-top: 1px solid #e0e0e0;
  display: flex;
  gap: 10px;
  justify-content: flex-end;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;
    transition: all 0.2s;

    &.primary {
      background-color: #007bff;
      color: white;

      &:hover {
        background-color: #0056b3;
      }

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }

    &.secondary {
      background-color: #f0f0f0;
      color: #333;

      &:hover {
        background-color: #e0e0e0;
      }
    }
  }
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;

  span {
    color: #dc3545;
    margin-left: 2px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 80px;
  transition: border-color 0.2s;

  &:focus {
    outline: none;
    border-color: #007bff;
    box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 12px;
  margin-top: 6px;
`;

const SuccessMessage = styled.div`
  background-color: #d4edda;
  color: #155724;
  padding: 12px;
  border-radius: 4px;
  margin-bottom: 16px;
  font-size: 14px;
`;

/**
 * Approval Modal
 */
export function ApprovalModal({
  isOpen,
  commissionId,
  notes,
  isLoading,
  error,
  onApprove,
  onClose,
}) {
  const [localNotes, setLocalNotes] = useState(notes || '');

  const handleApprove = () => {
    onApprove?.({ commissionId, notes: localNotes });
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Approve Commission</h2>
          <button onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormGroup>
            <Label htmlFor="approval-notes">Approval Notes</Label>
            <Textarea
              id="approval-notes"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
              placeholder="Add optional notes for the affiliate..."
              disabled={isLoading}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <button className="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="primary" onClick={handleApprove} disabled={isLoading}>
            {isLoading ? 'Approving...' : 'Approve'}
          </button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

/**
 * Payment Modal
 */
export function PaymentModal({
  isOpen,
  commissionId,
  method,
  transactionId,
  receiptId,
  isLoading,
  error,
  onPay,
  onClose,
}) {
  const [localMethod, setLocalMethod] = useState(method || 'stripe');
  const [localTransactionId, setLocalTransactionId] = useState(transactionId || '');
  const [localReceiptId, setLocalReceiptId] = useState(receiptId || '');

  const handlePay = () => {
    if (!localTransactionId.trim()) {
      alert('Transaction ID is required');
      return;
    }
    onPay?.({
      commissionId,
      method: localMethod,
      transactionId: localTransactionId,
      receiptId: localReceiptId,
    });
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Mark as Paid</h2>
          <button onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormGroup>
            <Label htmlFor="payment-method">
              Payment Method <span>*</span>
            </Label>
            <Select
              id="payment-method"
              value={localMethod}
              onChange={(e) => setLocalMethod(e.target.value)}
              disabled={isLoading}
            >
              <option value="stripe">Stripe</option>
              <option value="paypal">PayPal</option>
              <option value="bank_transfer">Bank Transfer</option>
              <option value="cryptocurrency">Cryptocurrency</option>
              <option value="manual">Manual</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="transaction-id">
              Transaction ID <span>*</span>
            </Label>
            <Input
              id="transaction-id"
              type="text"
              value={localTransactionId}
              onChange={(e) => setLocalTransactionId(e.target.value)}
              placeholder="Enter transaction reference ID..."
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="receipt-id">Receipt ID (Optional)</Label>
            <Input
              id="receipt-id"
              type="text"
              value={localReceiptId}
              onChange={(e) => setLocalReceiptId(e.target.value)}
              placeholder="Enter receipt number..."
              disabled={isLoading}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <button className="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="primary" onClick={handlePay} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Mark as Paid'}
          </button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

/**
 * Reversal Modal
 */
export function ReversalModal({
  isOpen,
  commissionId,
  reason,
  details,
  amount,
  isLoading,
  error,
  onReverse,
  onClose,
}) {
  const [localReason, setLocalReason] = useState(reason || '');
  const [localDetails, setLocalDetails] = useState(details || '');
  const [localAmount, setLocalAmount] = useState(amount || '');

  const handleReverse = () => {
    if (!localReason.trim()) {
      alert('Reversal reason is required');
      return;
    }
    onReverse?.({
      commissionId,
      reason: localReason,
      details: localDetails,
      amount: localAmount ? parseFloat(localAmount) : undefined,
    });
  };

  return (
    <ModalOverlay $isOpen={isOpen} onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <h2>Reverse Commission</h2>
          <button onClick={onClose} disabled={isLoading}>
            ×
          </button>
        </ModalHeader>
        <ModalBody>
          {error && <ErrorMessage>{error}</ErrorMessage>}
          <FormGroup>
            <Label htmlFor="reversal-reason">
              Reason <span>*</span>
            </Label>
            <Select
              id="reversal-reason"
              value={localReason}
              onChange={(e) => setLocalReason(e.target.value)}
              disabled={isLoading}
            >
              <option value="">Select a reason...</option>
              <option value="refund">Refund</option>
              <option value="chargeback">Chargeback</option>
              <option value="fraud">Fraud</option>
              <option value="order_issue">Order Issue</option>
              <option value="affiliate_request">Affiliate Request</option>
              <option value="other">Other</option>
            </Select>
          </FormGroup>
          <FormGroup>
            <Label htmlFor="reversal-details">Details</Label>
            <Textarea
              id="reversal-details"
              value={localDetails}
              onChange={(e) => setLocalDetails(e.target.value)}
              placeholder="Add additional details about the reversal..."
              disabled={isLoading}
            />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="reversal-amount">Reversal Amount (Optional)</Label>
            <Input
              id="reversal-amount"
              type="number"
              step="0.01"
              value={localAmount}
              onChange={(e) => setLocalAmount(e.target.value)}
              placeholder="Leave empty to reverse full amount"
              disabled={isLoading}
            />
          </FormGroup>
        </ModalBody>
        <ModalFooter>
          <button className="secondary" onClick={onClose} disabled={isLoading}>
            Cancel
          </button>
          <button className="primary" onClick={handleReverse} disabled={isLoading}>
            {isLoading ? 'Processing...' : 'Reverse Commission'}
          </button>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
}

export default {
  ApprovalModal,
  PaymentModal,
  ReversalModal,
};
