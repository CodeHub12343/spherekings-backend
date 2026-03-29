'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { AlertCircle, Loader } from 'lucide-react';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import { useSubmitRaffleEntry } from '@/api/hooks/useRaffle';
import { validateRaffleEntryForm } from '@/utils/validation';
import { useToast } from '@/components/ui/Toast';

const FormWrapper = styled.form`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  display: block;
`;

const LabelHint = styled.span`
  font-weight: 400;
  color: #9ca3af;
`;

const InputField = styled(Input)`
  width: 100%;
`;

const ErrorMessage = styled.div`
  font-size: 13px;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 4px;

  svg {
    width: 14px;
    height: 14px;
    flex-shrink: 0;
  }
`;

const Section = styled.div`
  border-top: 1px solid #e5e7eb;
  padding-top: 20px;

  &:first-child {
    border-top: none;
    padding-top: 0;
  }

  h3 {
    font-size: 14px;
    font-weight: 600;
    color: #1f2937;
    margin-bottom: 16px;
  }
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
`;

const SubmitButton = styled(Button)`
  margin-top: 10px;
`;

const AlertBox = styled.div`
  background: #fef3c7;
  border: 1px solid #fcd34d;
  border-radius: 8px;
  padding: 12px 16px;
  display: flex;
  gap: 10px;
  font-size: 13px;
  color: #78350f;

  svg {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    margin-top: 1px;
  }
`;

const RaffleEntryForm = ({ onSuccess, cycle }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
  });

  const [errors, setErrors] = useState({});
  const toast = useToast();
  const { mutate: submitEntry, isPending } = useSubmitRaffleEntry();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const handleAddressChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      shippingAddress: {
        ...prev.shippingAddress,
        [name]: value,
      },
    }));
    // Clear error when user starts typing
    const fieldKey = `shippingAddress.${name}`;
    if (errors[fieldKey]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[fieldKey];
        return newErrors;
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Validate form
    const validation = validateRaffleEntryForm(formData);
    if (!validation.isValid) {
      setErrors(validation.errors);
      toast.error('Please fix the errors below');
      return;
    }

    // For multi-step flow: pass data to onSuccess callback (forms main handler, not direct redirect)
    // This allows RaffleEntryModal to control the next step
    if (onSuccess && typeof onSuccess === 'function') {
      onSuccess(formData);
    }
  };

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <AlertBox>
        <AlertCircle />
        <span>
          <strong>$1 entry fee</strong> includes management and shipping (US & select countries)
        </span>
      </AlertBox>

      {/* Personal Information */}
      <Section>
        <h3>Personal Information</h3>

        <FormGroup>
          <Label htmlFor="fullName">
            Full Name <LabelHint>*</LabelHint>
          </Label>
          <InputField
            id="fullName"
            type="text"
            name="fullName"
            placeholder="John Doe"
            value={formData.fullName}
            onChange={handleInputChange}
            required
          />
          {errors.fullName && (
            <ErrorMessage>
              <AlertCircle />
              {errors.fullName}
            </ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="email">
            Email <LabelHint>*</LabelHint>
          </Label>
          <InputField
            id="email"
            type="email"
            name="email"
            placeholder="your@email.com"
            value={formData.email}
            onChange={handleInputChange}
            required
          />
          {errors.email && (
            <ErrorMessage>
              <AlertCircle />
              {errors.email}
            </ErrorMessage>
          )}
        </FormGroup>

        <FormGroup>
          <Label htmlFor="phone">
            Phone <LabelHint>(optional)</LabelHint>
          </Label>
          <InputField
            id="phone"
            type="tel"
            name="phone"
            placeholder="+1 (555) 123-4567"
            value={formData.phone}
            onChange={handleInputChange}
          />
          {errors.phone && (
            <ErrorMessage>
              <AlertCircle />
              {errors.phone}
            </ErrorMessage>
          )}
        </FormGroup>
      </Section>

      {/* Shipping Address */}
      <Section>
        <h3>Shipping Address</h3>

        <FormGroup>
          <Label htmlFor="street">
            Street Address <LabelHint>*</LabelHint>
          </Label>
          <InputField
            id="street"
            type="text"
            name="street"
            placeholder="123 Main Street"
            value={formData.shippingAddress.street}
            onChange={handleAddressChange}
            required
          />
          {errors['shippingAddress.street'] && (
            <ErrorMessage>
              <AlertCircle />
              {errors['shippingAddress.street']}
            </ErrorMessage>
          )}
        </FormGroup>

        <Grid>
          <FormGroup>
            <Label htmlFor="city">
              City <LabelHint>*</LabelHint>
            </Label>
            <InputField
              id="city"
              type="text"
              name="city"
              placeholder="New York"
              value={formData.shippingAddress.city}
              onChange={handleAddressChange}
              required
            />
            {errors['shippingAddress.city'] && (
              <ErrorMessage>
                <AlertCircle />
                {errors['shippingAddress.city']}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="state">
              State <LabelHint>*</LabelHint>
            </Label>
            <InputField
              id="state"
              type="text"
              name="state"
              placeholder="NY"
              value={formData.shippingAddress.state}
              onChange={handleAddressChange}
              required
            />
            {errors['shippingAddress.state'] && (
              <ErrorMessage>
                <AlertCircle />
                {errors['shippingAddress.state']}
              </ErrorMessage>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="zipCode">
              ZIP Code <LabelHint>*</LabelHint>
            </Label>
            <InputField
              id="zipCode"
              type="text"
              name="zipCode"
              placeholder="10001"
              value={formData.shippingAddress.zipCode}
              onChange={handleAddressChange}
              required
            />
            {errors['shippingAddress.zipCode'] && (
              <ErrorMessage>
                <AlertCircle />
                {errors['shippingAddress.zipCode']}
              </ErrorMessage>
            )}
          </FormGroup>
        </Grid>

        <FormGroup>
          <Label htmlFor="country">
            Country <LabelHint>*</LabelHint>
          </Label>
          <InputField
            id="country"
            type="text"
            name="country"
            placeholder="United States"
            value={formData.shippingAddress.country}
            onChange={handleAddressChange}
            required
          />
          {errors['shippingAddress.country'] && (
            <ErrorMessage>
              <AlertCircle />
              {errors['shippingAddress.country']}
            </ErrorMessage>
          )}
        </FormGroup>
      </Section>

      {/* Submit */}
      <SubmitButton
        type="submit"
        disabled={isPending}
        onClick={() => {}}
      >
        {isPending ? (
          <>
            <Loader style={{ animation: 'spin 1s linear infinite' }} />
            Processing...
          </>
        ) : (
          'Continue to Payment'
        )}
      </SubmitButton>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </FormWrapper>
  );
};

export default RaffleEntryForm;
