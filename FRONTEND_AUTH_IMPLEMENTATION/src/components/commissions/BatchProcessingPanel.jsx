/**
 * Batch Processing Component
 * Interface for batch approval and payment operations
 */

import React, { useState } from 'react';
import styled from 'styled-components';

const BatchContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 20px;
`;

const BatchHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
  }
`;

const SelectionInfo = styled.div`
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;

  strong {
    color: #000;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

const Button = styled.button`
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  &.primary {
    background-color: #28a745;
    color: white;

    &:hover:not(:disabled) {
      background-color: #218838;
    }
  }

  &.secondary {
    background-color: #007bff;
    color: white;

    &:hover:not(:disabled) {
      background-color: #0056b3;
    }
  }

  &.danger {
    background-color: #dc3545;
    color: white;

    &:hover:not(:disabled) {
      background-color: #c82333;
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e0e0e0;
  border-radius: 3px;
  overflow: hidden;
  margin-bottom: 8px;

  .progress {
    height: 100%;
    background-color: #28a745;
    transition: width 0.3s ease;
    width: ${(props) => props.$percentage}%;
  }
`;

const ProgressInfo = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
`;

/**
 * Batch Processing Panel
 * 
 * @param {Array<string>} selectedIds - Selected commission IDs
 * @param {number} totalAmount - Total amount to be approved/paid
 * @param {Function} onApprove - Callback for batch approve
 * @param {Function} onPay - Callback for batch pay
 * @param {Function} onClear - Callback to clear selection
 * @param {Object} progress - Progress tracking { current, total, status }
 * @param {boolean} isProcessing - Processing state
 * @returns {JSX.Element}
 */
export function BatchProcessingPanel({
  selectedIds = [],
  totalAmount = 0,
  onApprove,
  onPay,
  onClear,
  progress = {},
  isProcessing = false,
}) {
  if (!selectedIds || selectedIds.length === 0) {
    return null;
  }

  const progressPercentage = progress.total > 0 
    ? (progress.current / progress.total) * 100 
    : 0;

  return (
    <BatchContainer>
      <BatchHeader>
        <h3>Batch Operations</h3>
        <Button className="secondary" onClick={onClear} disabled={isProcessing}>
          Clear Selection
        </Button>
      </BatchHeader>

      <SelectionInfo>
        <strong>{selectedIds.length}</strong> commission{selectedIds.length !== 1 ? 's' : ''} selected
        {totalAmount > 0 && <> • Total: <strong>${totalAmount.toFixed(2)}</strong></>}
      </SelectionInfo>

      {isProcessing && progress.total > 0 && (
        <div style={{ marginBottom: '16px' }}>
          <ProgressBar $percentage={progressPercentage}>
            <div className="progress" />
          </ProgressBar>
          <ProgressInfo>
            Processing {progress.current} of {progress.total} commissions...
          </ProgressInfo>
        </div>
      )}

      <ButtonGroup>
        <Button
          className="primary"
          onClick={() => onApprove?.(selectedIds)}
          disabled={isProcessing || selectedIds.length === 0}
        >
          {isProcessing ? 'Approving...' : 'Batch Approve'}
        </Button>
        <Button
          className="secondary"
          onClick={() => onPay?.(selectedIds)}
          disabled={isProcessing || selectedIds.length === 0}
        >
          {isProcessing ? 'Processing...' : 'Batch Pay'}
        </Button>
      </ButtonGroup>
    </BatchContainer>
  );
}

export default BatchProcessingPanel;
