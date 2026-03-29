/**
 * InfluencerApplicationForm Component
 * Form for submitting influencer applications
 */

'use client';

import { useState } from 'react';
import styled from 'styled-components';
import { useSubmitInfluencerApplication } from '@/api/hooks/useInfluencerApplication';
import Button from '@/components/ui/Button';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Textarea from '@/components/ui/Textarea';
import Alert from '@/components/ui/Alert';
import { useToast } from '@/components/ui/Toast';

const PLATFORMS = [
  { value: 'TikTok', label: 'TikTok' },
  { value: 'Instagram', label: 'Instagram' },
  { value: 'YouTube', label: 'YouTube' },
  { value: 'Twitter', label: 'Twitter/X' },
  { value: 'Twitch', label: 'Twitch' },
  { value: 'Facebook', label: 'Facebook' },
  { value: 'LinkedIn', label: 'LinkedIn' },
];

const FormWrapper = styled.form`
  background: #fff;
  border-radius: 12px;
  padding: 40px;
  max-width: 600px;
  margin: 0 auto;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);

  @media (max-width: 768px) {
    padding: 24px;
  }
`;

const FormSection = styled.div`
  margin-bottom: 32px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1f2937;
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 2px solid #e5e7eb;
`;

const InputGroup = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #374151;
  margin-bottom: 6px;
`;

const Error = styled.span`
  display: block;
  font-size: 12px;
  color: #dc2626;
  margin-top: 4px;
`;

const MultiCheckbox = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 12px;
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #374151;

  input {
    cursor: pointer;
    accent-color: #5b4dff;
  }
`;

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 32px;

  @media (max-width: 480px) {
    flex-direction: column;
  }
`;

const FieldRow = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const RequiredMark = styled.span`
  color: #dc2626;
`;

const SuccessMessage = styled.div`
  background: #ecfdf5;
  border-left: 4px solid #10b981;
  padding: 16px;
  border-radius: 6px;
  margin-bottom: 24px;

  h4 {
    color: #065f46;
    margin: 0 0 4px 0;
    font-size: 14px;
    font-weight: 600;
  }

  p {
    color: #047857;
    margin: 0;
    font-size: 14px;
  }
`;

export default function InfluencerApplicationForm({ onSuccess }) {
  const { addToast } = useToast();
  const { mutate: submitApplication, isPending, isSuccess } = useSubmitInfluencerApplication();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phoneNumber: '',
    platforms: [],
    socialHandles: {},
    followerCount: '',
    engagementRate: '',
    shippingAddress: {
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'United States',
    },
    contentCommitment: 'total_videos',
    totalVideos: '',
    videosPerDay: '',
  });

  const [errors, setErrors] = useState({});

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
  };

  const handlePlatformChange = (platform) => {
    setFormData((prev) => {
      const newPlatforms = prev.platforms.includes(platform)
        ? prev.platforms.filter((p) => p !== platform)
        : [...prev.platforms, platform];
      return {
        ...prev,
        platforms: newPlatforms,
      };
    });
  };

  const handleSocialHandleChange = (platform, handle) => {
    setFormData((prev) => ({
      ...prev,
      socialHandles: {
        ...prev.socialHandles,
        [platform]: handle,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrors({});

    // Basic client-side validation
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    if (!formData.phoneNumber.trim()) newErrors.phoneNumber = 'Phone number is required';
    if (formData.platforms.length === 0) newErrors.platforms = 'Select at least one platform';
    if (!formData.followerCount) newErrors.followerCount = 'Follower count is required';
    if (!formData.shippingAddress.street) newErrors.address_street = 'Street address is required';
    if (!formData.shippingAddress.city) newErrors.address_city = 'City is required';
    if (!formData.shippingAddress.state) newErrors.address_state = 'State is required';
    if (!formData.shippingAddress.postalCode) newErrors.address_postalCode = 'Postal code is required';
    if (!formData.totalVideos && formData.contentCommitment === 'total_videos')
      newErrors.totalVideos = 'Total videos is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      addToast({
        type: 'error',
        message: 'Please fill in all required fields',
      });
      return;
    }

    // Submit form
    submitApplication(formData, {
      onSuccess: (response) => {
        if (response.success) {
          addToast({
            type: 'success',
            message: response.message || 'Application submitted successfully!',
          });
          if (onSuccess) {
            onSuccess(response.data);
          }
        } else {
          addToast({
            type: 'error',
            message: response.error || 'Failed to submit application',
          });
          if (response.errors) {
            setErrors(response.errors);
          }
        }
      },
    });
  };

  if (isSuccess) {
    return (
      <FormWrapper>
        <SuccessMessage>
          <h4>✓ Application Submitted Successfully!</h4>
          <p>Thank you for applying! We'll review your application and get back to you soon.</p>
        </SuccessMessage>
      </FormWrapper>
    );
  }

  return (
    <FormWrapper onSubmit={handleSubmit}>
      <FormSection>
        <SectionTitle>Personal Information</SectionTitle>

        <InputGroup>
          <Label>
            Name <RequiredMark>*</RequiredMark>
          </Label>
          <Input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            placeholder="Your full name"
            hasError={!!errors.name}
          />
          {errors.name && <Error>{errors.name}</Error>}
        </InputGroup>

        <FieldRow>
          <InputGroup>
            <Label>
              Email <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              placeholder="your@email.com"
              hasError={!!errors.email}
            />
            {errors.email && <Error>{errors.email}</Error>}
          </InputGroup>

          <InputGroup>
            <Label>
              Phone Number <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="tel"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="+1 (555) 123-4567"
              hasError={!!errors.phoneNumber}
            />
            {errors.phoneNumber && <Error>{errors.phoneNumber}</Error>}
          </InputGroup>
        </FieldRow>
      </FormSection>

      <FormSection>
        <SectionTitle>Social Media Presence</SectionTitle>

        <InputGroup>
          <Label>
            Platforms <RequiredMark>*</RequiredMark>
          </Label>
          <MultiCheckbox>
            {PLATFORMS.map((platform) => (
              <CheckboxLabel key={platform.value}>
                <input
                  type="checkbox"
                  checked={formData.platforms.includes(platform.value)}
                  onChange={() => handlePlatformChange(platform.value)}
                />
                {platform.label}
              </CheckboxLabel>
            ))}
          </MultiCheckbox>
          {errors.platforms && <Error>{errors.platforms}</Error>}
        </InputGroup>

        {formData.platforms.length > 0 && (
          <>
            <SectionTitle style={{ marginTop: '16px', paddingTop: '16px' }}>
              Social Media Handles
            </SectionTitle>
            {formData.platforms.map((platform) => (
              <InputGroup key={platform}>
                <Label>{platform} Handle</Label>
                <Input
                  type="text"
                  placeholder={`@your${platform.toLowerCase()}handle`}
                  value={formData.socialHandles[platform] || ''}
                  onChange={(e) =>
                    handleSocialHandleChange(platform, e.target.value)
                  }
                />
              </InputGroup>
            ))}
          </>
        )}

        <FieldRow>
          <InputGroup>
            <Label>
              Follower Count <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="number"
              name="followerCount"
              value={formData.followerCount}
              onChange={handleInputChange}
              placeholder="10000"
              min="100"
              hasError={!!errors.followerCount}
            />
            {errors.followerCount && <Error>{errors.followerCount}</Error>}
          </InputGroup>

          <InputGroup>
            <Label>Engagement Rate (%)</Label>
            <Input
              type="number"
              name="engagementRate"
              value={formData.engagementRate}
              onChange={handleInputChange}
              placeholder="3.5"
              min="0"
              max="100"
              step="0.1"
            />
          </InputGroup>
        </FieldRow>
      </FormSection>

      <FormSection>
        <SectionTitle>Content Commitment</SectionTitle>

        <InputGroup>
          <Label>How would you prefer to commit?</Label>
          <Select
            name="contentCommitment"
            value={formData.contentCommitment}
            onChange={handleInputChange}
          >
            <option value="total_videos">Total number of videos</option>
            <option value="videos_per_day">Videos per day</option>
          </Select>
        </InputGroup>

        {formData.contentCommitment === 'total_videos' ? (
          <InputGroup>
            <Label>
              Total Videos <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="number"
              name="totalVideos"
              value={formData.totalVideos}
              onChange={handleInputChange}
              placeholder="5"
              min="1"
              max="100"
              hasError={!!errors.totalVideos}
            />
            {errors.totalVideos && <Error>{errors.totalVideos}</Error>}
          </InputGroup>
        ) : (
          <InputGroup>
            <Label>Videos Per Day</Label>
            <Input
              type="number"
              name="videosPerDay"
              value={formData.videosPerDay}
              onChange={handleInputChange}
              placeholder="1"
              min="1"
              max="10"
            />
          </InputGroup>
        )}
      </FormSection>

      <FormSection>
        <SectionTitle>Shipping Address</SectionTitle>

        <InputGroup>
          <Label>
            Street Address <RequiredMark>*</RequiredMark>
          </Label>
          <Input
            type="text"
            name="street"
            value={formData.shippingAddress.street}
            onChange={handleAddressChange}
            placeholder="123 Main Street"
            hasError={!!errors.address_street}
          />
          {errors.address_street && <Error>{errors.address_street}</Error>}
        </InputGroup>

        <FieldRow>
          <InputGroup>
            <Label>
              City <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="text"
              name="city"
              value={formData.shippingAddress.city}
              onChange={handleAddressChange}
              placeholder="New York"
              hasError={!!errors.address_city}
            />
            {errors.address_city && <Error>{errors.address_city}</Error>}
          </InputGroup>

          <InputGroup>
            <Label>
              State <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="text"
              name="state"
              value={formData.shippingAddress.state}
              onChange={handleAddressChange}
              placeholder="NY"
              hasError={!!errors.address_state}
            />
            {errors.address_state && <Error>{errors.address_state}</Error>}
          </InputGroup>
        </FieldRow>

        <FieldRow>
          <InputGroup>
            <Label>
              Postal Code <RequiredMark>*</RequiredMark>
            </Label>
            <Input
              type="text"
              name="postalCode"
              value={formData.shippingAddress.postalCode}
              onChange={handleAddressChange}
              placeholder="10001"
              hasError={!!errors.address_postalCode}
            />
            {errors.address_postalCode && <Error>{errors.address_postalCode}</Error>}
          </InputGroup>

          <InputGroup>
            <Label>Country</Label>
            <Select
              name="country"
              value={formData.shippingAddress.country}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  shippingAddress: {
                    ...prev.shippingAddress,
                    country: e.target.value,
                  },
                }))
              }
            >
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Other">Other</option>
            </Select>
          </InputGroup>
        </FieldRow>
      </FormSection>

      <FormActions>
        <Button type="submit" disabled={isPending} variant="primary">
          {isPending ? 'Submitting...' : 'Submit Application'}
        </Button>
      </FormActions>
    </FormWrapper>
  );
}
