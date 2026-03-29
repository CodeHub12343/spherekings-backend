/**
 * Payout Settings Form Component
 * Form for configuring affiliate payout method and details
 */

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Save, AlertCircle, CheckCircle } from 'lucide-react';

const Container = styled.div`
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  padding: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const Title = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const Description = styled.p`
  margin: 0 0 24px 0;
  font-size: 14px;
  color: #666;
  line-height: 1.5;
`;

const FormSection = styled.div`
  margin-bottom: 28px;
  padding-bottom: 28px;
  border-bottom: 1px solid #f0f0f0;

  &:last-of-type {
    border-bottom: none;
  }
`;

const SectionTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #333;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #333;

  span {
    color: #e74c3c;
    margin-left: 2px;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #4a90e2;
    box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.1);
  }

  &:disabled {
    background-color: #f5f5f5;
    color: #999;
    cursor: not-allowed;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const RadioOption = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background-color: #f9f9f9;
    border-color: #4a90e2;
  }

  input {
    cursor: pointer;
  }

  &.selected {
    background-color: #f0f8ff;
    border-color: #4a90e2;
  }
`;

const RadioLabel = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const RadioTitle = styled.div`
  font-weight: 600;
  color: #333;
`;

const RadioDescription = styled.div`
  font-size: 12px;
  color: #999;
`;

const HelperText = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #666;
  line-height: 1.4;
`;

const Alert = styled.div`
  display: flex;
  gap: 12px;
  padding: 12px 16px;
  border-radius: 6px;
  margin-bottom: 16px;
  font-size: 13px;
  line-height: 1.5;

  ${(props) => {
    switch (props.$type) {
      case 'info':
        return `
          background-color: #e3f2fd;
          border-left: 4px solid #2196f3;
          color: #1565c0;
        `;
      case 'success':
        return `
          background-color: #d4edda;
          border-left: 4px solid #28a745;
          color: #155724;
        `;
      case 'warning':
        return `
          background-color: #fff3cd;
          border-left: 4px solid #ffc107;
          color: #856404;
        `;
      case 'error':
        return `
          background-color: #f8d7da;
          border-left: 4px solid #dc3545;
          color: #721c24;
        `;
      default:
        return ``;
    }
  }}
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 24px;
  border-radius: 6px;
  border: none;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  ${(props) => {
    switch (props.$variant) {
      case 'primary':
        return `
          background-color: #4a90e2;
          color: white;

          &:hover:not(:disabled) {
            background-color: #357abd;
            box-shadow: 0 4px 12px rgba(74, 144, 226, 0.3);
          }
        `;
      case 'secondary':
        return `
          background-color: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;

          &:hover:not(:disabled) {
            background-color: #e8e8e8;
          }
        `;
      default:
        return ``;
    }
  }}

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PayoutSettingsForm = ({
  initialData = {
    payoutMethod: 'stripe',
    payoutData: {},
    minimumThreshold: 50,
  },
  onSubmit,
  isLoading = false,
  successMessage = null,
  errorMessage = null,
}) => {
  const [formData, setFormData] = useState({
    payoutMethod: initialData.payoutMethod || 'stripe',
    payoutData: initialData.payoutData || {},
    minimumThreshold: initialData.minimumThreshold || 50,
  });

  const [errors, setErrors] = useState({});
  const [showSuccess, setShowSuccess] = useState(false);

  useEffect(() => {
    if (successMessage) {
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 3000);
    }
  }, [successMessage]);

  const handleMethodChange = (method) => {
    setFormData((prev) => ({
      ...prev,
      payoutMethod: method,
      payoutData: {},
    }));
    setErrors({});
  };

  const handleDataChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      payoutData: {
        ...prev.payoutData,
        [field]: value,
      },
    }));
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.payoutMethod) {
      newErrors.payoutMethod = 'Please select a payout method';
    }

    switch (formData.payoutMethod) {
      case 'stripe':
        if (!formData.payoutData.stripeEmail) {
          newErrors.stripeEmail = 'Stripe email is required';
        }
        break;
      case 'paypal':
        if (!formData.payoutData.paypalEmail) {
          newErrors.paypalEmail = 'PayPal email is required';
        }
        break;
      case 'bank_transfer':
        if (!formData.payoutData.accountNumber) {
          newErrors.accountNumber = 'Account number is required';
        }
        if (!formData.payoutData.routingNumber) {
          newErrors.routingNumber = 'Routing number is required';
        }
        if (!formData.payoutData.accountHolder) {
          newErrors.accountHolder = 'Account holder name is required';
        }
        break;
      default:
        break;
    }

    if (!formData.minimumThreshold || formData.minimumThreshold < 1) {
      newErrors.minimumThreshold = 'Minimum threshold must be at least $1';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await onSubmit?.(formData);
    } catch (error) {
      console.error('Form submission error:', error);
    }
  };

  return (
    <Container>
      <Title>💳 Payout Settings</Title>
      <Description>
        Configure how and when you want to receive your affiliate commissions
      </Description>

      {successMessage && showSuccess && (
        <Alert $type="success">
          <CheckCircle size={16} />
          {successMessage}
        </Alert>
      )}

      {errorMessage && (
        <Alert $type="error">
          <AlertCircle size={16} />
          {errorMessage}
        </Alert>
      )}

      <form onSubmit={handleSubmit}>
        {/* Payout Method Section */}
        <FormSection>
          <SectionTitle>Select Payout Method</SectionTitle>
          <RadioGroup>
            {/* Stripe Option */}
            <RadioOption
              className={formData.payoutMethod === 'stripe' ? 'selected' : ''}
            >
              <input
                type="radio"
                name="payoutMethod"
                value="stripe"
                checked={formData.payoutMethod === 'stripe'}
                onChange={(e) => handleMethodChange(e.target.value)}
              />
              <RadioLabel>
                <RadioTitle>Stripe</RadioTitle>
                <RadioDescription>
                  Receive payouts directly to your Stripe account
                </RadioDescription>
              </RadioLabel>
            </RadioOption>

            {/* PayPal Option */}
            <RadioOption
              className={formData.payoutMethod === 'paypal' ? 'selected' : ''}
            >
              <input
                type="radio"
                name="payoutMethod"
                value="paypal"
                checked={formData.payoutMethod === 'paypal'}
                onChange={(e) => handleMethodChange(e.target.value)}
              />
              <RadioLabel>
                <RadioTitle>PayPal</RadioTitle>
                <RadioDescription>
                  Receive payouts directly to your PayPal account
                </RadioDescription>
              </RadioLabel>
            </RadioOption>

            {/* Bank Transfer Option */}
            <RadioOption
              className={formData.payoutMethod === 'bank_transfer' ? 'selected' : ''}
            >
              <input
                type="radio"
                name="payoutMethod"
                value="bank_transfer"
                checked={formData.payoutMethod === 'bank_transfer'}
                onChange={(e) => handleMethodChange(e.target.value)}
              />
              <RadioLabel>
                <RadioTitle>Bank Transfer</RadioTitle>
                <RadioDescription>
                  Receive payouts via direct bank transfer (ACH)
                </RadioDescription>
              </RadioLabel>
            </RadioOption>

            {/* None Option */}
            <RadioOption
              className={formData.payoutMethod === 'none' ? 'selected' : ''}
            >
              <input
                type="radio"
                name="payoutMethod"
                value="none"
                checked={formData.payoutMethod === 'none'}
                onChange={(e) => handleMethodChange(e.target.value)}
              />
              <RadioLabel>
                <RadioTitle>No Payout</RadioTitle>
                <RadioDescription>
                  Don't receive automatic payouts (can be changed later)
                </RadioDescription>
              </RadioLabel>
            </RadioOption>
          </RadioGroup>
        </FormSection>

        {/* Method-Specific Fields */}
        {formData.payoutMethod === 'stripe' && (
          <FormSection>
            <SectionTitle>Stripe Account</SectionTitle>
            <FormGroup>
              <Label>
                Email Address <span>*</span>
              </Label>
              <Input
                type="email"
                value={formData.payoutData.stripeEmail || ''}
                onChange={(e) => handleDataChange('stripeEmail', e.target.value)}
                placeholder="your-email@example.com"
                disabled={isLoading}
              />
              {errors.stripeEmail && (
                <Alert $type="error">
                  <AlertCircle size={14} />
                  {errors.stripeEmail}
                </Alert>
              )}
              <HelperText>
                Enter the email associated with your Stripe account
              </HelperText>
            </FormGroup>
          </FormSection>
        )}

        {formData.payoutMethod === 'paypal' && (
          <FormSection>
            <SectionTitle>PayPal Account</SectionTitle>
            <FormGroup>
              <Label>
                Email Address <span>*</span>
              </Label>
              <Input
                type="email"
                value={formData.payoutData.paypalEmail || ''}
                onChange={(e) => handleDataChange('paypalEmail', e.target.value)}
                placeholder="your-email@example.com"
                disabled={isLoading}
              />
              {errors.paypalEmail && (
                <Alert $type="error">
                  <AlertCircle size={14} />
                  {errors.paypalEmail}
                </Alert>
              )}
              <HelperText>
                Enter the email associated with your PayPal account
              </HelperText>
            </FormGroup>
          </FormSection>
        )}

        {formData.payoutMethod === 'bank_transfer' && (
          <FormSection>
            <SectionTitle>Bank Account Details</SectionTitle>
            <FormGroup>
              <Label>
                Account Holder Name <span>*</span>
              </Label>
              <Input
                type="text"
                value={formData.payoutData.accountHolder || ''}
                onChange={(e) => handleDataChange('accountHolder', e.target.value)}
                placeholder="John Doe"
                disabled={isLoading}
              />
              {errors.accountHolder && (
                <Alert $type="error">
                  <AlertCircle size={14} />
                  {errors.accountHolder}
                </Alert>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                Account Number <span>*</span>
              </Label>
              <Input
                type="password"
                value={formData.payoutData.accountNumber || ''}
                onChange={(e) => handleDataChange('accountNumber', e.target.value)}
                placeholder="••••••••••••••••"
                disabled={isLoading}
              />
              {errors.accountNumber && (
                <Alert $type="error">
                  <AlertCircle size={14} />
                  {errors.accountNumber}
                </Alert>
              )}
            </FormGroup>

            <FormGroup>
              <Label>
                Routing Number <span>*</span>
              </Label>
              <Input
                type="password"
                value={formData.payoutData.routingNumber || ''}
                onChange={(e) => handleDataChange('routingNumber', e.target.value)}
                placeholder="•••••••••"
                disabled={isLoading}
              />
              {errors.routingNumber && (
                <Alert $type="error">
                  <AlertCircle size={14} />
                  {errors.routingNumber}
                </Alert>
              )}
            </FormGroup>
          </FormSection>
        )}

        {/* Minimum Threshold */}
        <FormSection>
          <SectionTitle>Payout Threshold</SectionTitle>
          <FormGroup>
            <Label>
              Minimum Amount <span>*</span>
            </Label>
            <Input
              type="number"
              min="1"
              step="0.01"
              value={formData.minimumThreshold}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  minimumThreshold: parseFloat(e.target.value),
                }))
              }
              placeholder="50"
              disabled={isLoading}
            />
            {errors.minimumThreshold && (
              <Alert $type="error">
                <AlertCircle size={14} />
                {errors.minimumThreshold}
              </Alert>
            )}
            <HelperText>
              You will only receive payouts when your earnings reach this amount
            </HelperText>
          </FormGroup>
        </FormSection>

        <ButtonGroup>
          <Button $variant="primary" type="submit" disabled={isLoading}>
            <Save size={16} />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
          <Button $variant="secondary" type="button" onClick={() => {
            window.history.back();
          }} disabled={isLoading}>
            Cancel
          </Button>
        </ButtonGroup>
      </form>
    </Container>
  );
};

export default PayoutSettingsForm;
