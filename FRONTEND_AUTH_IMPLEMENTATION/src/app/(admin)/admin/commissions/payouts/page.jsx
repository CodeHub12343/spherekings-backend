/**
 * Admin Ready Payouts Page
 * /admin/commissions/payouts
 * 
 * Displays:
 * - Approved commissions ready to be paid
 * - Batch payment interface
 * - Payment processing
 */

'use client';

import React, { useState, useEffect, useMemo } from 'react';
import styled from 'styled-components';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import {
  useReadyPayouts,
  useBatchPayCommissions,
} from '@/api/hooks/useCommissions';
import useCommissionStore, { useBatchSelection } from '@/stores/commissionStore';
import CommissionTable from '@/components/commissions/CommissionTable';
import BatchProcessingPanel from '@/components/commissions/BatchProcessingPanel';

const PageContainer = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const PageHeader = styled.div`
  margin-bottom: 30px;

  h1 {
    margin: 0 0 8px 0;
    font-size: 28px;
    font-weight: 700;
  }

  p {
    margin: 0;
    color: #666;
    font-size: 14px;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 40px;
  color: #999;
  font-size: 16px;
`;

const ErrorMessage = styled.div`
  background-color: #f8d7da;
  color: #721c24;
  padding: 16px;
  border-radius: 4px;
  margin-bottom: 20px;
  border: 1px solid #f5c6cb;
`;

const SuccessMessage = styled(ErrorMessage)`
  background-color: #d4edda;
  color: #155724;
  border-color: #c3e6cb;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const StatBox = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;

  .label {
    font-size: 12px;
    color: #666;
    text-transform: uppercase;
    font-weight: 600;
    margin-bottom: 8px;
  }

  .value {
    font-size: 24px;
    font-weight: 700;
    color: #27ae60;
  }
`;

/**
 * Admin Ready Payouts Page
 */
export default function AdminReadyPayoutsPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const batchSelection = useBatchSelection();
  const {
    toggleBatchSelection,
    clearBatchSelection,
  } = useCommissionStore();

  const [page, setPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [paymentDetails, setPaymentDetails] = useState({});

  // Redirect if not admin
  useEffect(() => {
    if (!authLoading && (!isAuthenticated || user?.role !== 'admin')) {
      router.push('/');
    }
  }, [isAuthenticated, authLoading, user, router]);

  // Fetch ready payouts
  const {
    data: payoutData,
    isLoading: payoutsLoading,
    error: payoutsError,
  } = useReadyPayouts({
    page,
    limit: 50,
    enabled: isAuthenticated && !authLoading && user?.role === 'admin',
  });

  // Batch pay mutation
  const batchPayMutation = useBatchPayCommissions({
    onSuccess: (data) => {
      setSuccessMessage(`Successfully paid ${data.successCount} commissions`);
      clearBatchSelection();
      setPaymentDetails({});
      setTimeout(() => setSuccessMessage(''), 3000);
    },
    onError: (error) => {
      setErrorMessage(error.message || 'Failed to process batch payments');
    },
  });

  // Handle loading state
  if (authLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Verifying authentication...</LoadingMessage>
      </PageContainer>
    );
  }

  if (!isAuthenticated || user?.role !== 'admin') {
    return null;
  }

  if (payoutsLoading) {
    return (
      <PageContainer>
        <LoadingMessage>Loading ready payouts...</LoadingMessage>
      </PageContainer>
    );
  }

  // Calculate totals
  const commissions = payoutData?.commissions || [];
  const selectedCommissions = commissions.filter((c) =>
    batchSelection.selected.includes(c._id)
  );
  const totalAmount = selectedCommissions.reduce(
    (sum, c) => sum + (c.calculation?.amount || 0),
    0
  );
  const readyCount = payoutData?.pagination?.total || 0;

  // Handlers
  const handleSelectChange = (newSelection) => {
    const currentIds = commissions.map((c) => c._id);
    const idsToToggle = newSelection.filter((id) => !batchSelection.selected.includes(id));
    
    idsToToggle.forEach((id) => toggleBatchSelection(id));
    batchSelection.selected
      .filter((id) => !newSelection.includes(id))
      .forEach((id) => toggleBatchSelection(id));
  };

  const handleBatchPay = (selectedIds) => {
    if (!paymentDetails.method || !paymentDetails.transactionId) {
      setErrorMessage('Payment method and transaction ID are required');
      return;
    }

    const commissionPayments = selectedIds.map((id) => ({
      id,
      method: paymentDetails.method,
      transactionId: `${paymentDetails.transactionId}-${id.substr(-4)}`, // Unique ID per commission
      receiptId: paymentDetails.receiptId || undefined,
    }));

    batchPayMutation.mutate({ commissions: commissionPayments });
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Ready Payouts</h1>
        <p>Approved commissions ready to be marked as paid</p>
      </PageHeader>

      {successMessage && <SuccessMessage>{successMessage}</SuccessMessage>}
      {errorMessage && <ErrorMessage>{errorMessage}</ErrorMessage>}

      {/* Statistics */}
      <StatsContainer>
        <StatBox>
          <div className="label">Ready to Pay</div>
          <div className="value">{readyCount}</div>
        </StatBox>
        <StatBox>
          <div className="label">Selected</div>
          <div className="value">{selectedCommissions.length}</div>
        </StatBox>
        <StatBox>
          <div className="label">Total Amount</div>
          <div className="value">${totalAmount.toFixed(2)}</div>
        </StatBox>
      </StatsContainer>

      {/* Batch Processing Panel */}
      {selectedCommissions.length > 0 && (
        <BatchProcessingPanel
          selectedIds={batchSelection.selected}
          totalAmount={totalAmount}
          onClear={clearBatchSelection}
          isProcessing={batchPayMutation.isPending}
          progress={{}}
        />
      )}

      {/* Payment Details Form */}
      {selectedCommissions.length > 0 && (
        <PaymentDetailsForm
          details={paymentDetails}
          onChange={setPaymentDetails}
          onPay={() => handleBatchPay(batchSelection.selected)}
          isLoading={batchPayMutation.isPending}
        />
      )}

      {/* Commission Table */}
      <CommissionTable
        commissions={commissions}
        pagination={payoutData?.pagination || {}}
        onPageChange={setPage}
        onRowClick={(commission) => {
          router.push(`/admin/commissions/${commission._id}`);
        }}
        showCheckboxes={true}
        selectedIds={batchSelection.selected}
        onSelectChange={handleSelectChange}
        isLoading={payoutsLoading}
      />
    </PageContainer>
  );
}

/**
 * Payment Details Form Component
 */
const FormContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 24px;
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
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;

  span {
    color: #dc3545;
    margin-left: 2px;
  }
`;

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;

  &:focus {
    outline: none;
    border-color: #007bff;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;

  button {
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    font-weight: 500;

    &.primary {
      background-color: #28a745;
      color: white;

      &:hover:not(:disabled) {
        background-color: #218838;
      }

      &:disabled {
        background-color: #ccc;
        cursor: not-allowed;
      }
    }
  }
`;

function PaymentDetailsForm({ details, onChange, onPay, isLoading }) {
  return (
    <FormContainer>
      <h3 style={{ margin: '0 0 16px 0' }}>Payment Details</h3>
      <Row>
        <FormGroup>
          <Label htmlFor="method">
            Payment Method <span>*</span>
          </Label>
          <Select
            id="method"
            value={details.method || ''}
            onChange={(e) => onChange({ ...details, method: e.target.value })}
            disabled={isLoading}
          >
            <option value="">Select method...</option>
            <option value="stripe">Stripe</option>
            <option value="paypal">PayPal</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cryptocurrency">Cryptocurrency</option>
            <option value="manual">Manual</option>
          </Select>
        </FormGroup>
        <FormGroup>
          <Label htmlFor="transactionId">
            Base Transaction ID <span>*</span>
          </Label>
          <Input
            id="transactionId"
            type="text"
            value={details.transactionId || ''}
            onChange={(e) => onChange({ ...details, transactionId: e.target.value })}
            placeholder="Batch transaction reference..."
            disabled={isLoading}
          />
        </FormGroup>
      </Row>
      <FormGroup>
        <Label htmlFor="receiptId">Receipt ID (Optional)</Label>
        <Input
          id="receiptId"
          type="text"
          value={details.receiptId || ''}
          onChange={(e) => onChange({ ...details, receiptId: e.target.value })}
          placeholder="Batch receipt number..."
          disabled={isLoading}
        />
      </FormGroup>
      <ButtonGroup>
        <button className="primary" onClick={onPay} disabled={isLoading}>
          {isLoading ? 'Processing...' : 'Pay Selected Commissions'}
        </button>
      </ButtonGroup>
    </FormContainer>
  );
}
