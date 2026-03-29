/**
 * ShippingForm Component
 * Collects shipping address information from customer
 * 
 * Features:
 * - All 9 shipping address fields
 * - Real-time validation on blur
 * - Field-level error display
 * - Mobile-responsive layout
 * - Loading state during submission
 * - Optional "Save to profile" checkbox
 */

import styled from 'styled-components';
import { useState } from 'react';
import useShipping from '@/hooks/useShipping';
import { COUNTRIES, US_STATES } from '@/validations/shippingSchema';

const FormContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 32px 24px;
  max-width: 600px;
  margin: 0 auto;

  @media (max-width: 768px) {
    padding: 24px 16px;
  }
`;

const FormTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 8px;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 768px) {
    font-size: 20px;
  }
`;

const FormSubtitle = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 24px;
`;

const FormGrid = styled.form`
  display: grid;
  gap: 16px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 16px;

  &.full-width {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

const FormField = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
`;

const Label = styled.label`
  font-size: 13px;
  font-weight: 600;
  color: #374151;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  .required {
    color: #ef4444;
    margin-left: 4px;
  }
`;

const Input = styled.input`
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:hover:not(:focus) {
    border-color: #d1d5db;
  }

  ${(props) =>
    props.$error &&
    `
    border-color: #ef4444;
    background-color: #fef2f2;

    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 16px; /* Prevent zoom on iOS */
  }
`;

const Select = styled.select`
  padding: 12px;
  border: 2px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  background-color: white;
  cursor: pointer;
  transition: all 0.2s ease;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:hover:not(:focus) {
    border-color: #d1d5db;
  }

  ${(props) =>
    props.$error &&
    `
    border-color: #ef4444;
    background-color: #fef2f2;

    &:focus {
      box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
    }
  `}

  @media (max-width: 768px) {
    padding: 12px;
    font-size: 16px;
  }
`;

const ErrorMessage = styled.span`
  font-size: 12px;
  color: #ef4444;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;

  &::before {
    content: '⚠️';
    display: inline;
  }
`;

const CheckboxField = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
  padding-top: 16px;
  border-top: 1px solid #f3f4f6;
`;

const CheckboxInput = styled.input`
  width: 18px;
  height: 18px;
  cursor: pointer;
  accent-color: #5b4dff;

  @media (max-width: 768px) {
    width: 20px;
    height: 20px;
  }
`;

const CheckboxLabel = styled.label`
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  user-select: none;
`;

const SubmitButton = styled.button`
  background: linear-gradient(135deg, #5b4dff 0%, #4c3fcc 100%);
  color: white;
  border: none;
  padding: 14px 24px;
  border-radius: 8px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 24px;
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;

  &:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 8px 16px rgba(91, 77, 255, 0.3);
    background: linear-gradient(135deg, #4c3fcc 0%, #3d305a 100%);
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: 0 2px 8px rgba(91, 77, 255, 0.2);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  @media (max-width: 768px) {
    padding: 12px 20px;
    font-size: 14px;
  }
`;

const LoadingSpinner = styled.span`
  display: inline-block;
  width: 14px;
  height: 14px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const InfoBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #0ea5e9;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 13px;
  color: #0369a1;
  margin-bottom: 20px;
  display: flex;
  gap: 8px;
  align-items: flex-start;

  &::before {
    content: 'ℹ️';
    flex-shrink: 0;
  }
`;

/**
 * ShippingForm Component
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onSubmit - Callback after successful form submission
 * @param {boolean} props.showSaveProfile - Show "save to profile" checkbox
 * @returns {JSX.Element}
 */
export default function ShippingForm({ onSubmit, showSaveProfile = true }) {
  const {
    formData,
    errors,
    touched,
    isSubmitting,
    handleChange,
    handleBlur,
    handleSubmit,
    isFilled,
  } = useShipping();

  const [saveToProfile, setSaveToProfile] = useState(false);

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    console.log('📝 ShippingForm.handleFormSubmit called');
    console.log('📝 Form data:', formData);

    const success = await handleSubmit(async (validatedData) => {
      console.log('✅ Form validation passed, calling onSubmit with:', validatedData);
      if (onSubmit) {
        await onSubmit(validatedData);
      }
    });

    if (success && saveToProfile) {
      // TODO: Save address to user profile
      console.log('📌 Saving address to profile...');
    }
  };

  const countryValue = formData.country || '';
  const isUSSelected = countryValue === 'US';

  return (
    <FormContainer>
      <FormTitle>
        🚚 Shipping Address
      </FormTitle>
      <FormSubtitle>
        Please enter your shipping address to continue with checkout
      </FormSubtitle>

      <InfoBox>
        Your address will be used for order delivery and cannot be changed after payment
      </InfoBox>

      <FormGrid onSubmit={handleFormSubmit}>
        {/* Name Row */}
        <FormRow>
          <FormField>
            <Label>
              First Name
              <span className="required">*</span>
            </Label>
            <Input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="John"
              $error={touched.firstName && !!errors.firstName}
              disabled={isSubmitting}
            />
            {touched.firstName && errors.firstName && (
              <ErrorMessage>{errors.firstName}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <Label>
              Last Name
              <span className="required">*</span>
            </Label>
            <Input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Doe"
              $error={touched.lastName && !!errors.lastName}
              disabled={isSubmitting}
            />
            {touched.lastName && errors.lastName && (
              <ErrorMessage>{errors.lastName}</ErrorMessage>
            )}
          </FormField>
        </FormRow>

        {/* Contact Row */}
        <FormRow>
          <FormField>
            <Label>
              Email
              <span className="required">*</span>
            </Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="john@example.com"
              $error={touched.email && !!errors.email}
              disabled={isSubmitting}
            />
            {touched.email && errors.email && (
              <ErrorMessage>{errors.email}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <Label>
              Phone
              <span className="required">*</span>
            </Label>
            <Input
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="+1234567890"
              $error={touched.phone && !!errors.phone}
              disabled={isSubmitting}
            />
            {touched.phone && errors.phone && (
              <ErrorMessage>{errors.phone}</ErrorMessage>
            )}
          </FormField>
        </FormRow>

        {/* Address Row */}
        <FormRow className="full-width">
          <FormField>
            <Label>
              Street Address
              <span className="required">*</span>
            </Label>
            <Input
              type="text"
              name="street"
              value={formData.street}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="123 Main Street, Apt 4B"
              $error={touched.street && !!errors.street}
              disabled={isSubmitting}
            />
            {touched.street && errors.street && (
              <ErrorMessage>{errors.street}</ErrorMessage>
            )}
          </FormField>
        </FormRow>

        {/* City State Zip Row */}
        <FormRow>
          <FormField>
            <Label>
              City
              <span className="required">*</span>
            </Label>
            <Input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder="Springfield"
              $error={touched.city && !!errors.city}
              disabled={isSubmitting}
            />
            {touched.city && errors.city && (
              <ErrorMessage>{errors.city}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <Label>
              {isUSSelected ? 'State' : 'State/Province'}
              <span className="required">*</span>
            </Label>
            {isUSSelected ? (
              <Select
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                $error={touched.state && !!errors.state}
                disabled={isSubmitting}
              >
                <option value="">Select State</option>
                {US_STATES.map((state) => (
                  <option key={state} value={state}>
                    {state}
                  </option>
                ))}
              </Select>
            ) : (
              <Input
                type="text"
                name="state"
                value={formData.state}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Province / Region"
                $error={touched.state && !!errors.state}
                disabled={isSubmitting}
              />
            )}
            {touched.state && errors.state && (
              <ErrorMessage>{errors.state}</ErrorMessage>
            )}
          </FormField>

          <FormField>
            <Label>
              {isUSSelected ? 'ZIP Code' : 'Postal Code'}
              <span className="required">*</span>
            </Label>
            <Input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              onBlur={handleBlur}
              placeholder={isUSSelected ? '62701' : 'A1A 1A1'}
              $error={touched.postalCode && !!errors.postalCode}
              disabled={isSubmitting}
            />
            {touched.postalCode && errors.postalCode && (
              <ErrorMessage>{errors.postalCode}</ErrorMessage>
            )}
          </FormField>
        </FormRow>

        {/* Country Row */}
        <FormRow className="full-width">
          <FormField>
            <Label>
              Country
              <span className="required">*</span>
            </Label>
            <Select
              name="country"
              value={formData.country}
              onChange={handleChange}
              onBlur={handleBlur}
              $error={touched.country && !!errors.country}
              disabled={isSubmitting}
            >
              <option value="">Select Country</option>
              {COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </Select>
            {touched.country && errors.country && (
              <ErrorMessage>{errors.country}</ErrorMessage>
            )}
          </FormField>
        </FormRow>

        {/* Save to Profile Checkbox */}
        {showSaveProfile && (
          <CheckboxField>
            <CheckboxInput
              id="saveProfile"
              type="checkbox"
              checked={saveToProfile}
              onChange={(e) => setSaveToProfile(e.target.checked)}
              disabled={isSubmitting}
            />
            <CheckboxLabel htmlFor="saveProfile">
              Save this address to my profile for future orders
            </CheckboxLabel>
          </CheckboxField>
        )}

        {/* Submit Button */}
        <SubmitButton
          type="submit"
          disabled={isSubmitting || !isFilled}
          title={!isFilled ? 'Please fill in all fields' : 'Continue to payment'}
        >
          {isSubmitting ? (
            <>
              <LoadingSpinner />
              Validating Address...
            </>
          ) : (
            <>
              Continue to Payment
              <span>→</span>
            </>
          )}
        </SubmitButton>
      </FormGrid>
    </FormContainer>
  );
}
