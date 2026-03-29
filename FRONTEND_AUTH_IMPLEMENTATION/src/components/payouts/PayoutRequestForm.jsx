/**
 * PayoutRequestForm Component
 * Form for affiliates to request payouts
 */

import React, { useState } from 'react';
import styled from 'styled-components';

const FormContainer = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  max-width: 600px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  font-size: 20px;
  font-weight: 700;
  margin: 0 0 24px 0;
  color: #1a1a1a;
`;

const FormGroup = styled.div`
  margin-bottom: 20px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: #333;
  margin-bottom: 6px;
`;

const Required = styled.span`
  color: #dc3545;
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

  &.error {
    border-color: #dc3545;
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

  &.error {
    border-color: #dc3545;
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
  min-height: 100px;
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: #2563eb;
    box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.1);
  }
`;

const ErrorMessage = styled.span`
  display: block;
  font-size: 12px;
  color: #dc3545;
  margin-top: 4px;
`;

const HelperText = styled.span`
  display: block;
  font-size: 12px;
  color: #999;
  margin-top: 4px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 24px;
  justify-content: space-between;
`;

const Button = styled.button`
  padding: 10px 20px;
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
`;

const AvailableBalance = styled.div`
  background-color: #e8f5e9;
  border: 1px solid #c8e6c9;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  
  .label {
    font-size: 12px;
    color: #2e7d32;
    font-weight: 600;
    margin-bottom: 4px;
  }

  .value {
    font-size: 18px;
    color: #1b5e20;
    font-weight: 700;
  }

  &.insufficient {
    background-color: #ffebee;
    border-color: #ef5350;

    .label {
      color: #c62828;
    }

    .value {
      color: #b71c1c;
    }
  }
`;

const MinimumRequirement = styled.div`
  background-color: #fff3e0;
  border: 1px solid #ffb74d;
  border-radius: 4px;
  padding: 12px;
  margin-bottom: 20px;
  font-size: 13px;
  color: #e65100;

  .title {
    font-weight: 600;
    margin-bottom: 4px;
  }

  .amount-needed {
    color: #d84315;
    font-weight: 700;
  }
`;

export default function PayoutRequestForm({
  availableBalance = 0,
  onSubmit,
  isLoading = false,
  onCancel
}) {
  const [formData, setFormData] = useState({
    amount: '',
    method: 'bank_transfer',
    beneficiary: {
      accountHolderName: '',
      accountNumber: '',
      routingNumber: '',
      bankName: ''
    },
    notes: ''
  });

  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};
    const MINIMUM_PAYOUT = 50;

    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    } else if (parseFloat(formData.amount) < MINIMUM_PAYOUT) {
      newErrors.amount = `Minimum payout amount is $${MINIMUM_PAYOUT}`;
    } else if (parseFloat(formData.amount) > availableBalance) {
      newErrors.amount = 'Amount exceeds available balance';
    }

    if (!formData.method) {
      newErrors.method = 'Payment method is required';
    }

    if (!formData.beneficiary.accountHolderName) {
      newErrors.accountHolderName = 'Account holder name is required';
    }

    if (!formData.beneficiary.accountNumber) {
      newErrors.accountNumber = 'Account number is required';
    }

    if (formData.method === 'bank_transfer' && !formData.beneficiary.routingNumber) {
      newErrors.routingNumber = 'Routing number is required for bank transfers';
    }

    if (!formData.beneficiary.bankName) {
      newErrors.bankName = 'Bank name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value
    }));
    if (errors[field]) {
      setErrors((prev) => ({
        ...prev,
        [field]: ''
      }));
    }
  };

  const handleBeneficiaryChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      beneficiary: {
        ...prev.beneficiary,
        [field]: value
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (validateForm()) {
      console.log('📝 [FORM] Payout request form validated, submitting:', formData);
      onSubmit?.(formData);
    }
  };

  const MINIMUM_PAYOUT = 50;
  const meetsMinimum = availableBalance >= MINIMUM_PAYOUT;
  const amountNeeded = Math.max(0, MINIMUM_PAYOUT - availableBalance);

  return (
    <FormContainer>
      <FormTitle>Request Payout</FormTitle>

      <AvailableBalance className={!meetsMinimum ? 'insufficient' : ''}>
        <div className="label">Available Balance</div>
        <div className="value">${availableBalance.toFixed(2)}</div>
      </AvailableBalance>

      {!meetsMinimum && (
        <MinimumRequirement>
          <div className="title">⚠️ Minimum Balance Required</div>
          <div>You need $<span className="amount-needed">{amountNeeded.toFixed(2)}</span> more to request a payout.</div>
          <div style={{ marginTop: '4px', fontSize: '12px' }}>
            Minimum withdrawal amount is ${MINIMUM_PAYOUT.toFixed(2)}.
          </div>
        </MinimumRequirement>
      )}

      <form onSubmit={handleSubmit}>
        {/* Amount */}
        <FormGroup>
          <Label>
            Payout Amount <Required>*</Required>
          </Label>
          <Input
            type="number"
            step="0.01"
            min="0.01"
            max={availableBalance}
            value={formData.amount}
            onChange={(e) => handleChange('amount', e.target.value)}
            disabled={isLoading}
            className={errors.amount ? 'error' : ''}
            placeholder="Enter amount in USD"
          />
          {errors.amount && <ErrorMessage>{errors.amount}</ErrorMessage>}
          <HelperText>Maximum available: ${availableBalance.toFixed(2)}</HelperText>
        </FormGroup>

        {/* Payment Method */}
        <FormGroup>
          <Label>
            Payment Method <Required>*</Required>
          </Label>
          <Select
            value={formData.method}
            onChange={(e) => handleChange('method', e.target.value)}
            disabled={isLoading}
            className={errors.method ? 'error' : ''}
          >
            <option value="bank_transfer">Bank Transfer</option>
            <option value="paypal">PayPal</option>
            <option value="stripe">Stripe</option>
            <option value="cryptocurrency">Cryptocurrency</option>
          </Select>
          {errors.method && <ErrorMessage>{errors.method}</ErrorMessage>}
        </FormGroup>

        {/* Beneficiary Information */}
        <FormGroup>
          <Label style={{ marginBottom: '12px' }}>
            Beneficiary Information <Required>*</Required>
          </Label>

          <FormGroup style={{ marginBottom: 0 }}>
            <Label style={{ marginBottom: '6px', fontSize: '12px' }}>
              Account Holder Name
            </Label>
            <Input
              type="text"
              value={formData.beneficiary.accountHolderName}
              onChange={(e) => handleBeneficiaryChange('accountHolderName', e.target.value)}
              disabled={isLoading}
              className={errors.accountHolderName ? 'error' : ''}
              placeholder="Full name"
            />
            {errors.accountHolderName && (
              <ErrorMessage>{errors.accountHolderName}</ErrorMessage>
            )}
          </FormGroup>

          <FormRow style={{ marginTop: '12px' }}>
            <FormGroup style={{ marginBottom: 0 }}>
              <Label style={{ marginBottom: '6px', fontSize: '12px' }}>
                Account Number
              </Label>
              <Input
                type="text"
                value={formData.beneficiary.accountNumber}
                onChange={(e) => handleBeneficiaryChange('accountNumber', e.target.value)}
                disabled={isLoading}
                className={errors.accountNumber ? 'error' : ''}
                placeholder="Account number"
              />
              {errors.accountNumber && (
                <ErrorMessage>{errors.accountNumber}</ErrorMessage>
              )}
            </FormGroup>

            {formData.method === 'bank_transfer' && (
              <FormGroup style={{ marginBottom: 0 }}>
                <Label style={{ marginBottom: '6px', fontSize: '12px' }}>
                  Routing Number
                </Label>
                <Input
                  type="text"
                  value={formData.beneficiary.routingNumber}
                  onChange={(e) => handleBeneficiaryChange('routingNumber', e.target.value)}
                  disabled={isLoading}
                  className={errors.routingNumber ? 'error' : ''}
                  placeholder="Routing number"
                />
                {errors.routingNumber && (
                  <ErrorMessage>{errors.routingNumber}</ErrorMessage>
                )}
              </FormGroup>
            )}
          </FormRow>

          <FormGroup style={{ marginTop: '12px', marginBottom: 0 }}>
            <Label style={{ marginBottom: '6px', fontSize: '12px' }}>Bank Name</Label>
            <Input
              type="text"
              value={formData.beneficiary.bankName}
              onChange={(e) => handleBeneficiaryChange('bankName', e.target.value)}
              disabled={isLoading}
              className={errors.bankName ? 'error' : ''}
              placeholder="Bank name"
            />
            {errors.bankName && <ErrorMessage>{errors.bankName}</ErrorMessage>}
          </FormGroup>
        </FormGroup>

        {/* Notes */}
        <FormGroup>
          <Label>Additional Notes (Optional)</Label>
          <Textarea
            value={formData.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            disabled={isLoading}
            placeholder="Any additional information..."
          />
        </FormGroup>

        {/* Buttons */}
        <ButtonGroup>
          <Button onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" className="primary" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit Request'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
}
