'use client';

/**
 * BatchPayoutProcessingPanel Component
 * Interface for batch payout operations (approve/process)
 */

import React, { useState } from 'react';
import styled from 'styled-components';

const PanelContainer = styled.div`
  background: #f0f7ff;
  border: 1px solid #b8daff;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;

  @media (max-width: 640px) {
    padding: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    padding: 12px;
    margin-bottom: 12px;
  }
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const PanelTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  margin: 0;
  color: #004085;
`;

const BatchInfo = styled.div`
  display: flex;
  gap: 24px;
  margin-bottom: 20px;
  padding-bottom: 16px;
  border-bottom: 1px solid #b8daff;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
    margin-bottom: 16px;
    padding-bottom: 12px;
  }
`;

const InfoItem = styled.div`
  .label {
    font-size: 11px;
    color: #004085;
    text-transform: uppercase;
    font-weight: 600;
    letter-spacing: 0.5px;
    margin-bottom: 4px;
  }

  .value {
    font-size: 18px;
    font-weight: 700;
    color: #004085;
  }
`;

const ProgressContainer = styled.div`
  margin-bottom: 20px;
`;

const ProgressLabel = styled.div`
  font-size: 12px;
  color: #004085;
  margin-bottom: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 20px;
  background-color: #e7f1ff;
  border-radius: 4px;
  overflow: hidden;
  border: 1px solid #b8daff;
`;

const ProgressFill = styled.div`
  height: 100%;
  background: linear-gradient(90deg, #2563eb, #1d4ed8);
  width: ${(props) => props.progress}%;
  transition: width 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  color: white;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;

  @media (max-width: 480px) {
    margin-bottom: 12px;
  }

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 0.875rem;
  font-weight: 600;
  color: #004085;
  margin-bottom: 6px;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    margin-bottom: 5px;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #b8daff;
  border-radius: 6px;
  font-size: 0.875rem;
  background-color: white;
  min-height: 40px;
  transition: border-color 0.2s ease;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    min-height: 44px;
    padding: 10px;
  }

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #b8daff;
  border-radius: 6px;
  font-size: 0.875rem;
  min-height: 40px;
  transition: border-color 0.2s ease;

  @media (max-width: 480px) {
    font-size: 0.8rem;
    min-height: 44px;
    padding: 10px;
  }

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
  }

  &:disabled {
    background-color: #f8f9fa;
    color: #999;
    cursor: not-allowed;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 10px;
    margin-top: 12px;
  }

  @media (max-width: 480px) {
    margin-top: 10px;
  }
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 6px;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  &:hover:not(:disabled) {
    transform: translateY(-1px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  @media (max-width: 480px) {
    padding: 12px 16px;
    min-height: 44px;
    font-size: 0.8rem;
    width: 100%;
  }

  &.primary {
    background-color: #2563eb;
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: #1d4ed8;
    }
  }

  &.success {
    background-color: #27ae60;
    color: white;
    border: none;

    &:hover:not(:disabled) {
      background-color: #229954;
    }
  }

  &.secondary {
    background-color: #f3f4f6;
    color: #374151;
    border: 1px solid #d1d5db;

    &:hover:not(:disabled) {
      background-color: #e5e7eb;
    }
  }
`;

export default function BatchPayoutProcessingPanel({
  selectedIds = [],
  totalAmount = 0,
  operationType = 'approve', // 'approve' or 'process'
  isProcessing = false,
  progress = {},
  onApprove,
  onProcess,
  onClear
}) {
  const [details, setDetails] = useState({
    notes: '',
    stripeConnectId: ''
  });

  const { successCount = 0, failureCount = 0, currentProgress = 0 } = progress;

  const handleApprove = () => {
    onApprove?.(selectedIds, details.notes);
  };

  const handleProcess = () => {
    onProcess?.(selectedIds, details.stripeConnectId);
  };

  return (
    <PanelContainer>
      <PanelHeader>
        <PanelTitle>
          Batch {operationType === 'approve' ? 'Approval' : 'Processing'} - {selectedIds.length}{' '}
          Selected
        </PanelTitle>
        <Button onClick={onClear} disabled={isProcessing}>
          Clear Selection
        </Button>
      </PanelHeader>

      <BatchInfo>
        <InfoItem>
          <div className="label">Selected Payouts</div>
          <div className="value">{selectedIds.length}</div>
        </InfoItem>
        <InfoItem>
          <div className="label">Total Amount</div>
          <div className="value">${totalAmount.toFixed(2)}</div>
        </InfoItem>
        {isProcessing && (
          <>
            <InfoItem>
              <div className="label">Successful</div>
              <div className="value" style={{ color: '#27ae60' }}>
                {successCount}
              </div>
            </InfoItem>
            <InfoItem>
              <div className="label">Failed</div>
              <div className="value" style={{ color: '#dc3545' }}>
                {failureCount}
              </div>
            </InfoItem>
          </>
        )}
      </BatchInfo>

      {isProcessing && (
        <ProgressContainer>
          <ProgressLabel>
            Processing batch... ({successCount + failureCount} of {selectedIds.length})
          </ProgressLabel>
          <ProgressBar>
            <ProgressFill progress={currentProgress}>
              {currentProgress}%
            </ProgressFill>
          </ProgressBar>
        </ProgressContainer>
      )}

      {!isProcessing && (
        <>
          {operationType === 'approve' ? (
            <FormGroup>
              <Label>Approval Notes (Optional)</Label>
              <Input
                type="text"
                value={details.notes}
                onChange={(e) => setDetails({ ...details, notes: e.target.value })}
                placeholder="Add notes for these approvals..."
              />
            </FormGroup>
          ) : (
            <FormGroup>
              <Label>Stripe Connect ID (Optional)</Label>
              <Input
                type="text"
                value={details.stripeConnectId}
                onChange={(e) =>
                  setDetails({ ...details, stripeConnectId: e.target.value })
                }
                placeholder="acct_1234567890..."
              />
            </FormGroup>
          )}

          <ButtonGroup>
            <Button onClick={onClear} disabled={isProcessing}>
              Cancel
            </Button>
            <Button
              className="success"
              onClick={operationType === 'approve' ? handleApprove : handleProcess}
              disabled={isProcessing || selectedIds.length === 0}
            >
              {operationType === 'approve'
                ? `Approve ${selectedIds.length}`
                : `Process ${selectedIds.length}`}
            </Button>
          </ButtonGroup>
        </>
      )}
    </PanelContainer>
  );
}
