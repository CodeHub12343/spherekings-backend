'use client';

import styled from 'styled-components';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';

// ============================================================================
// LAYOUT STYLES
// ============================================================================

const FormContainer = styled.form`
  max-width: 900px;
  margin: 0 auto;
  padding-bottom: 120px;

  @media (max-width: 768px) {
    padding-bottom: 100px;
  }

  @media (max-width: 480px) {
    padding-bottom: 80px;
  }
`;

const FormSection = styled.div`
  background: white;
  padding: 28px 24px;
  border-radius: 12px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;

  @media (max-width: 768px) {
    padding: 20px 16px;
    margin-bottom: 16px;
    border-radius: 10px;
  }

  @media (max-width: 480px) {
    padding: 16px 12px;
    margin-bottom: 12px;
    border-radius: 8px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 700;
  color: #1f2937;
  margin: 0 0 24px 0;
  padding-bottom: 12px;
  border-bottom: 2px solid #f3f4f6;
  letter-spacing: -0.3px;

  @media (max-width: 768px) {
    font-size: 16px;
    margin-bottom: 16px;
  }

  @media (max-width: 480px) {
    font-size: 15px;
    margin-bottom: 12px;
  }
`;

const SectionDescription = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: -16px 0 16px 0;
  font-weight: 400;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: ${(props) => (props.cols ? `repeat(${props.cols}, 1fr)` : '1fr')};
  gap: 20px;
  margin-bottom: 20px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }

  @media (max-width: 480px) {
    gap: 12px;
  }
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

// ============================================================================
// INPUT STYLES
// ============================================================================

const Label = styled.label`
  font-weight: 600;
  color: #1f2937;
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
  letter-spacing: -0.2px;

  @media (max-width: 480px) {
    font-size: 13px;
  }
`;

const RequiredIndicator = styled.span`
  color: #ef4444;
  font-weight: 700;
`;

const FormInput = styled.input`
  padding: 11px 13px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
    background: white;
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  ${(props) =>
    props.error &&
    `
    border-color: #dc2626;
    background: #fef2f2;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  `}

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 16px;
  }
`;

const TextArea = styled.textarea`
  padding: 12px 13px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  resize: vertical;
  min-height: 120px;
  transition: all 0.2s;
  background: #fafafa;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
    background: white;
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  ${(props) =>
    props.error &&
    `
    border-color: #dc2626;
    background: #fef2f2;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  `}

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 16px;
  }
`;

const SelectField = styled.select`
  padding: 11px 13px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  font-size: 14px;
  font-family: inherit;
  transition: all 0.2s;
  background: white;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
  }

  &:disabled {
    background: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  ${(props) =>
    props.error &&
    `
    border-color: #dc2626;
    background: #fef2f2;
    
    &:focus {
      box-shadow: 0 0 0 3px rgba(220, 38, 38, 0.1);
    }
  `}

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 16px;
  }
`;

// ============================================================================
// FILE UPLOAD STYLES
// ============================================================================

const FileUploadArea = styled.div`
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
  padding: 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;

  &:hover {
    border-color: #5b4dff;
    background: #f3f0ff;
  }

  ${(props) =>
    props.isDragging &&
    `
    border-color: #5b4dff;
    background: #f3f0ff;
  `}

  ${(props) =>
    props.error &&
    `
    border-color: #dc2626;
    background: #fef2f2;
  `}

  @media (max-width: 480px) {
    padding: 16px;
  }
`;

const FileUploadInput = styled.input`
  display: none;
`;

const UploadIcon = styled.div`
  font-size: 32px;
  margin-bottom: 8px;
  color: #5b4dff;
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #1f2937;
  font-weight: 600;
  margin-bottom: 4px;
`;

const UploadSubtext = styled.p`
  margin: 0;
  font-size: 12px;
  color: #6b7280;
`;

const ImagePreview = styled.div`
  position: relative;
  display: inline-block;
  margin-top: 16px;
`;

const PreviewImage = styled.img`
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  border: 1px solid #e5e7eb;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: -8px;
  right: -8px;
  background: #dc2626;
  border: none;
  border-radius: 50%;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #b91c1c;
    transform: scale(1.1);
  }
`;

// ============================================================================
// ERROR & VALIDATION STYLES
// ============================================================================

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #dc2626;
  font-size: 13px;
  margin-top: 8px;

  svg {
    flex-shrink: 0;
  }
`;

const FieldError = styled.span`
  display: flex;
  align-items: center;
  gap: 4px;
  color: #dc2626;
  font-size: 13px;
  margin-top: 4px;

  svg {
    width: 14px;
    height: 14px;
  }
`;

// ============================================================================
// BUTTON STYLES
// ============================================================================

const FormActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid #f3f4f6;

  @media (max-width: 480px) {
    flex-direction: column-reverse;
  }
`;

const CancelButton = styled(Button)`
  background: white;
  color: #6b7280;
  border: 1px solid #e5e7eb;

  &:hover {
    background: #f9fafb;
    border-color: #d1d5db;
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

// ============================================================================
// RETAIL LOCATION FORM COMPONENT
// ============================================================================

export default function RetailLocationForm({ onSubmit, isLoading = false, initialData = null }) {
  const fileInputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState(initialData?.logoUrl || null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errors, setErrors] = useState({});
  const [serverError, setServerError] = useState(null);

  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    address: initialData?.address || '',
    city: initialData?.city || '',
    state: initialData?.state || '',
    country: initialData?.country || '',
    description: initialData?.description || '',
  });

  // Validation rules
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name?.trim()) {
      newErrors.name = 'Location name is required';
    } else if (formData.name.length < 2) {
      newErrors.name = 'Location name must be at least 2 characters';
    } else if (formData.name.length > 100) {
      newErrors.name = 'Location name cannot exceed 100 characters';
    }

    if (!formData.address?.trim()) {
      newErrors.address = 'Address is required';
    } else if (formData.address.length < 5) {
      newErrors.address = 'Address must be at least 5 characters';
    }

    if (!formData.city?.trim()) {
      newErrors.city = 'City is required';
    } else if (formData.city.length < 2) {
      newErrors.city = 'City must be at least 2 characters';
    }

    if (!formData.state?.trim()) {
      newErrors.state = 'State/Province is required';
    } else if (formData.state.length < 2) {
      newErrors.state = 'State/Province must be at least 2 characters';
    }

    if (!formData.country?.trim()) {
      newErrors.country = 'Country is required';
    }

    if (!formData.description?.trim()) {
      newErrors.description = 'Store description is required';
    } else if (formData.description.length < 10) {
      newErrors.description = 'Description must be at least 10 characters';
    } else if (formData.description.length > 1000) {
      newErrors.description = 'Description cannot exceed 1000 characters';
    }

    return newErrors;
  };

  // Handle input changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error for this field when user starts typing
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }));
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Process selected file
  const processFile = (file) => {
    // Validate file type
    if (!file.type.startsWith('image/')) {
      setErrors((prev) => ({
        ...prev,
        logo: 'Please select an image file (JPG, PNG, etc.)',
      }));
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors((prev) => ({
        ...prev,
        logo: 'Image must be smaller than 5MB',
      }));
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);

    // Clear error
    setErrors((prev) => ({
      ...prev,
      logo: null,
    }));
  };

  // Handle drag and drop
  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const file = e.dataTransfer.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  // Remove image
  const handleRemoveImage = () => {
    setPreview(null);
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setServerError(null);

    // Validate form
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    try {
      // Build FormData
      const submitData = new FormData();
      submitData.append('name', formData.name.trim());
      submitData.append('address', formData.address.trim());
      submitData.append('city', formData.city.trim());
      submitData.append('state', formData.state.trim());
      submitData.append('country', formData.country.trim());
      submitData.append('description', formData.description.trim());

      // Add logo if selected
      if (selectedFile) {
        submitData.append('logo', selectedFile);
      }

      await onSubmit(submitData);
    } catch (err) {
      setServerError(err.message || 'Failed to save retail location');
    }
  };

  return (
    <FormContainer onSubmit={handleSubmit}>
      {/* Basic Information Section */}
      <FormSection>
        <SectionTitle>Basic Information</SectionTitle>
        <SectionDescription>General details about the retail location</SectionDescription>

        <FormGrid cols={2}>
          <FormGroup>
            <Label>
              Location Name
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <FormInput
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., SphereKings New York"
              error={!!errors.name}
              disabled={isLoading}
            />
            {errors.name && (
              <FieldError>
                <AlertCircle size={14} />
                {errors.name}
              </FieldError>
            )}
          </FormGroup>

          <FormGroup>
            <Label>
              Country
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <SelectField
              name="country"
              value={formData.country}
              onChange={handleChange}
              error={!!errors.country}
              disabled={isLoading}
            >
              <option value="">Select a country</option>
              <option value="United States">United States</option>
              <option value="Canada">Canada</option>
              <option value="United Kingdom">United Kingdom</option>
              <option value="Australia">Australia</option>
              <option value="Germany">Germany</option>
              <option value="France">France</option>
              <option value="Japan">Japan</option>
              <option value="India">India</option>
              <option value="Brazil">Brazil</option>
              <option value="Mexico">Mexico</option>
              <option value="Other">Other</option>
            </SelectField>
            {errors.country && (
              <FieldError>
                <AlertCircle size={14} />
                {errors.country}
              </FieldError>
            )}
          </FormGroup>
        </FormGrid>

        <FormGrid cols={1}>
          <FormGroup>
            <Label>
              Address
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <FormInput
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Street address"
              error={!!errors.address}
              disabled={isLoading}
            />
            {errors.address && (
              <FieldError>
                <AlertCircle size={14} />
                {errors.address}
              </FieldError>
            )}
          </FormGroup>
        </FormGrid>

        <FormGrid cols={2}>
          <FormGroup>
            <Label>
              City
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <FormInput
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              error={!!errors.city}
              disabled={isLoading}
            />
            {errors.city && (
              <FieldError>
                <AlertCircle size={14} />
                {errors.city}
              </FieldError>
            )}
          </FormGroup>

          <FormGroup>
            <Label>
              State/Province
              <RequiredIndicator>*</RequiredIndicator>
            </Label>
            <FormInput
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State or Province"
              error={!!errors.state}
              disabled={isLoading}
            />
            {errors.state && (
              <FieldError>
                <AlertCircle size={14} />
                {errors.state}
              </FieldError>
            )}
          </FormGroup>
        </FormGrid>
      </FormSection>

      {/* Description Section */}
      <FormSection>
        <SectionTitle>Store Details</SectionTitle>
        <SectionDescription>Describe your retail location for customers</SectionDescription>

        <FormGroup>
          <Label>
            Store Description
            <RequiredIndicator>*</RequiredIndicator>
          </Label>
          <TextArea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Describe this retail location, services offered, operating hours, etc."
            error={!!errors.description}
            disabled={isLoading}
          />
          {errors.description && (
            <FieldError>
              <AlertCircle size={14} />
              {errors.description}
            </FieldError>
          )}
        </FormGroup>
      </FormSection>

      {/* Logo Upload Section */}
      <FormSection>
        <SectionTitle>Store Logo</SectionTitle>
        <SectionDescription>Upload a logo or store image (optional)</SectionDescription>

        <FormGroup>
          <FileUploadArea
            onClick={() => fileInputRef.current?.click()}
            onDragEnter={handleDragEnter}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            isDragging={isDragging}
            error={!!errors.logo}
            style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
          >
            <UploadIcon>
              <Upload size={32} />
            </UploadIcon>
            <UploadText>Drag and drop your image here</UploadText>
            <UploadSubtext>or click to browse (JPG, PNG - Max 5MB)</UploadSubtext>
            <FileUploadInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </FileUploadArea>

          {preview && (
            <ImagePreview>
              <PreviewImage src={preview} alt="Logo preview" />
              <RemoveImageButton
                type="button"
                onClick={handleRemoveImage}
                disabled={isLoading}
                title="Remove image"
              >
                <X size={18} />
              </RemoveImageButton>
            </ImagePreview>
          )}

          {errors.logo && (
            <ErrorMessage>
              <AlertCircle size={16} />
              {errors.logo}
            </ErrorMessage>
          )}
        </FormGroup>
      </FormSection>

      {/* Server Error */}
      {serverError && (
        <ErrorMessage style={{ marginBottom: '20px' }}>
          <AlertCircle size={16} />
          {serverError}
        </ErrorMessage>
      )}

      {/* Form Actions */}
      <FormSection style={{ marginBottom: 0 }}>
        <FormActions>
          <CancelButton
            type="button"
            disabled={isLoading}
            onClick={() => window.history.back()}
          >
            Cancel
          </CancelButton>
          <Button
            type="submit"
            disabled={isLoading}
            isLoading={isLoading}
          >
            {initialData ? 'Update Location' : 'Create Location'}
          </Button>
        </FormActions>
      </FormSection>
    </FormContainer>
  );
}
