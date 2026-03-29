'use client';

import styled from 'styled-components';
import { useState, useRef } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { createProductSchema, updateProductSchema } from '@/utils/productValidation';
import { useCategories } from '@/hooks/useCategories';
import { X, Plus, AlertCircle, CheckCircle, Eye, EyeOff, Copy } from 'lucide-react';

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
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s;
  appearance: none;
  padding-right: 36px;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 10px center;
  background-size: 16px;

  &:focus {
    outline: none;
    border-color: #5b4dff;
    box-shadow: 0 0 0 3px rgba(91, 77, 255, 0.1);
    background-color: white;
  }

  &:disabled {
    background-color: #f3f4f6;
    color: #9ca3af;
    cursor: not-allowed;
  }

  ${(props) =>
    props.error &&
    `
    border-color: #dc2626;
    background-color: #fef2f2;
    
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
// ERROR & VALIDATION STYLES
// ============================================================================

const ErrorText = styled.span`
  color: #dc2626;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 6px;

  @media (max-width: 480px) {
    font-size: 12px;
  }

  svg {
    flex-shrink: 0;
    width: 14px;
    height: 14px;
  }
`;

const HelperText = styled.span`
  color: #6b7280;
  font-size: 12px;
  font-weight: 400;

  @media (max-width: 480px) {
    font-size: 11px;
  }
`;

const FormAlert = styled.div`
  background: ${(props) =>
    props.type === 'error'
      ? '#fee2e2'
      : props.type === 'success'
        ? '#dcfce7'
        : '#fef3c7'};
  color: ${(props) =>
    props.type === 'error'
      ? '#991b1b'
      : props.type === 'success'
        ? '#15803d'
        : '#92400e'};
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 20px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 8px;

  @media (max-width: 480px) {
    padding: 10px 12px;
    font-size: 13px;
  }

  svg {
    flex-shrink: 0;
    width: 16px;
    height: 16px;
  }
`;

// ============================================================================
// CHECKBOX & TOGGLE STYLES
// ============================================================================

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-weight: 500;
  color: #1f2937;
  user-select: none;

  input {
    cursor: pointer;
    accent-color: #5b4dff;
    width: 18px;
    height: 18px;

    @media (max-width: 480px) {
      width: 16px;
      height: 16px;
    }
  }

  &:hover input {
    accent-color: #4a3dd4;
  }
`;

// ============================================================================
// IMAGE UPLOAD STYLES
// ============================================================================

const ImageUploadArea = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 10px;
  padding: 32px 24px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  background: #fafafa;

  &:hover {
    border-color: #5b4dff;
    background: #f9f7ff;
  }

  &:active {
    border-color: #4a3dd4;
    background: #f3f0ff;
  }

  ${(props) =>
    props.isDragActive &&
    `
    border-color: #5b4dff;
    background: #f9f7ff;
  `}

  p {
    margin: 0;
    color: #6b7280;
  }

  @media (max-width: 768px) {
    padding: 24px 16px;
  }

  @media (max-width: 480px) {
    padding: 20px 12px;
    border-radius: 8px;
  }
`;

const UploadIcon = styled.div`
  font-size: 36px;
  margin: 0 auto 12px;
  color: #5b4dff;

  svg {
    width: 36px;
    height: 36px;
  }

  @media (max-width: 480px) {
    margin-bottom: 8px;

    svg {
      width: 28px;
      height: 28px;
    }
  }
`;

const ImagePreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 16px;
  margin-top: 16px;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
    gap: 12px;
    margin-top: 12px;
  }

  @media (max-width: 480px) {
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
    margin-top: 10px;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  aspect-ratio: 1;
  background: #f3f4f6;
  border-radius: 10px;
  overflow: hidden;
  border: 2px solid #e5e7eb;
  transition: all 0.2s;

  &:hover {
    border-color: #5b4dff;
    box-shadow: 0 4px 12px rgba(91, 77, 255, 0.1);
  }

  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }

  button {
    position: absolute;
    top: 6px;
    right: 6px;
    width: 28px;
    height: 28px;
    border-radius: 6px;
    background: #ef4444;
    color: white;
    border: none;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: all 0.2s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);

    &:hover {
      background: #dc2626;
    }
  }

  &:hover button {
    opacity: 1;
  }

  @media (max-width: 480px) {
    border-radius: 8px;

    button {
      width: 24px;
      height: 24px;
      opacity: 1;
      top: 4px;
      right: 4px;
    }
  }
`;

const ImageCountText = styled.p`
  font-size: 13px;
  color: #6b7280;
  margin: 12px 0 16px;

  strong {
    color: #1f2937;
    font-weight: 600;
  }

  @media (max-width: 480px) {
    font-size: 12px;
    margin: 8px 0 12px;
  }
`;

// ============================================================================
// SUBMIT BUTTON STYLES
// ============================================================================

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 20px;
  border-top: 2px solid #f3f4f6;

  @media (max-width: 768px) {
    padding-top: 16px;
  }

  @media (max-width: 480px) {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 12px 16px;
    gap: 8px;
    border-top: 1px solid #e5e7eb;
    background: white;
    justify-content: stretch;
    border-top: 1px solid #e5e7eb;
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.05);

    button {
      flex: 1;
    }
  }
`;

// ============================================================================
// QUICK ACTION STYLES
// ============================================================================

const QuickActionButton = styled.button`
  padding: 6px 12px;
  background: #f3f4f6;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 600;
  color: #5b4dff;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover {
    background: #ede9fe;
    border-color: #5b4dff;
  }

  svg {
    width: 12px;
    height: 12px;
  }

  @media (max-width: 480px) {
    padding: 5px 10px;
    font-size: 11px;
  }
`;

/**
 * ProductForm Component - Enhanced Version
 * Form for creating and editing products (Admin only)
 * Supports file upload from computer/mobile with real-time validation
 */

/**
 * ProductForm Component
 * Form for creating and editing products (Admin only)
 * Supports file upload from computer/mobile
 */
const ProductForm = ({
  product = null,
  isLoading = false,
  onSubmit = () => {},
}) => {
  const isEdit = !!product;
  const fileInputRef = useRef(null);
  
  // Fetch categories from database
  const { data: categories = [], isLoading: categoriesLoading, error: categoriesError } = useCategories();

  // Form state
  const [formData, setFormData] = useState({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || '',
    stock: product?.stock || 0,
    category: product?.category || '',
    sku: product?.sku || '',
    isFeatured: product?.isFeatured || false,
    status: product?.status || 'active',
  });

  const [images, setImages] = useState(product?.images || []);
  const [uploadingImages, setUploadingImages] = useState(false);
  const [errors, setErrors] = useState({});
  const [imageUploadError, setImageUploadError] = useState('');

  // Handle text input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    // Clear error for this field
    setErrors(prev => ({ ...prev, [name]: '' }));
  };

  // Handle file upload from computer/mobile
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files || []);
    const totalImages = images.length + files.length;

    // Validation
    if (totalImages > 10) {
      setImageUploadError(`Maximum 10 images allowed. You have ${images.length} and trying to add ${files.length}.`);
      return;
    }

    if (files.some(file => file.size > 5 * 1024 * 1024)) {
      setImageUploadError('One or more files exceed 5MB limit');
      return;
    }

    setUploadingImages(true);
    setImageUploadError('');

    try {
      // Create preview URLs for selected files
      const newImages = files.map(file => ({
        file,
        preview: URL.createObjectURL(file),
        name: file.name,
      }));

      setImages(prev => [...prev, ...newImages]);
    } catch (error) {
      setImageUploadError('Failed to process images. Please try again.');
      console.error('Image upload error:', error);
    } finally {
      setUploadingImages(false);
      // Reset file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Remove image from preview
  const handleRemoveImage = (index) => {
    setImages(prev => {
      const newImages = [...prev];
      // Clean up preview URL if it exists
      if (newImages[index]?.preview) {
        URL.revokeObjectURL(newImages[index].preview);
      }
      newImages.splice(index, 1);
      return newImages;
    });
  };

  // Validate form
  const validateForm = () => {
    const newErrors = {};

    if (!formData.name.trim()) newErrors.name = 'Product name is required';
    if (!formData.description.trim()) newErrors.description = 'Description is required';
    if (!formData.price) newErrors.price = 'Price is required';
    if (parseFloat(formData.price) <= 0) newErrors.price = 'Price must be greater than 0';
    if (!formData.stock && formData.stock !== 0) newErrors.stock = 'Stock is required';
    // Only require images for new products, not when editing
    if (!isEdit && images.length === 0) {
      newErrors.images = 'At least one image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    // Prepare FormData for file upload
    const formDataToSend = new FormData();
    
    // Add text fields
    formDataToSend.append('name', formData.name);
    formDataToSend.append('description', formData.description);
    formDataToSend.append('price', parseFloat(formData.price));
    formDataToSend.append('stock', parseInt(formData.stock, 10));
    formDataToSend.append('category', formData.category);
    formDataToSend.append('sku', formData.sku);
    // Convert boolean to string for FormData
    formDataToSend.append('isFeatured', formData.isFeatured ? 'true' : 'false');
    // Note: 'status' is NOT sent - it's set by backend with default 'active' value
    
    // For edit mode: send only NEW image files, keep existing images in DB
    // For create mode: send all image files
    let newImageCount = 0;
    images.forEach((image) => {
      if (image.file) {
        // New file upload - always send these
        formDataToSend.append('images', image.file);
        newImageCount++;
      }
      // For existing images (strings/URLs), we don't send them in FormData
      // The backend will keep them unless we're replacing all images
    });

    try {
      // Debug: Log FormData contents
      console.log('📤 FormData contents:');
      let imageCount = 0;
      for (let [key, value] of formDataToSend.entries()) {
        if (key === 'images') {
          imageCount++;
          console.log(`  ${key}: File(${value.name})`);
        } else if (key !== 'description') {
          console.log(`  ${key}:`, value);
        }
      }
      console.log(`✏️ New image files: ${newImageCount}, Total images to keep: ${images.length}`);
      
      await onSubmit(formDataToSend);
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors(prev => ({ ...prev, form: error.message }));
    }
  };

  return (
    <FormContainer onSubmit={handleFormSubmit}>
      {errors.form && (
        <div style={{
          background: '#fee2e2',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '20px',
          fontSize: '14px'
        }}>
          {errors.form}
        </div>
      )}

      {/* Basic Information */}
      <FormSection>
        <SectionTitle>Basic Information</SectionTitle>
        <FormGrid cols={2}>
          <FormGroup>
            <Label htmlFor="name">Product Name *</Label>
            <input
              id="name"
              name="name"
              placeholder="Enter product name"
              value={formData.name}
              onChange={handleInputChange}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                borderColor: errors.name ? '#dc2626' : '#e5e7eb',
              }}
            />
            {errors.name && <ErrorText>{errors.name}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="category">Category</Label>
            <SelectField
              id="category"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              disabled={categoriesLoading}
            >
              <option value="">
                {categoriesLoading ? 'Loading categories...' : 'Select category'}
              </option>
              {categories.length > 0 ? (
                categories.map((cat) => (
                  <option key={cat._id} value={cat.name}>
                    {cat.displayName}
                  </option>
                ))
              ) : (
                <option disabled>No categories available</option>
              )}
            </SelectField>
            {categoriesError && (
              <ErrorText>Failed to load categories</ErrorText>
            )}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="sku">SKU</Label>
            <input
              id="sku"
              name="sku"
              placeholder="e.g., PROD-001"
              value={formData.sku}
              onChange={handleInputChange}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
              }}
            />
          </FormGroup>
        </FormGrid>

        <FormGroup>
          <Label htmlFor="description">Description *</Label>
          <TextArea
            id="description"
            name="description"
            placeholder="Enter detailed product description (min 20 chars)"
            value={formData.description}
            onChange={handleInputChange}
            style={{
              borderColor: errors.description ? '#dc2626' : '#e5e7eb',
            }}
          />
          {errors.description && <ErrorText>{errors.description}</ErrorText>}
        </FormGroup>
      </FormSection>

      {/* Pricing & Stock */}
      <FormSection>
        <SectionTitle>Pricing & Inventory</SectionTitle>
        <FormGrid cols={3}>
          <FormGroup>
            <Label htmlFor="price">Price *</Label>
            <input
              id="price"
              name="price"
              type="number"
              step="0.01"
              min="0"
              placeholder="0.00"
              value={formData.price}
              onChange={handleInputChange}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                borderColor: errors.price ? '#dc2626' : '#e5e7eb',
              }}
            />
            {errors.price && <ErrorText>{errors.price}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="stock">Stock *</Label>
            <input
              id="stock"
              name="stock"
              type="number"
              min="0"
              value={formData.stock}
              onChange={handleInputChange}
              style={{
                padding: '10px 12px',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '14px',
                borderColor: errors.stock ? '#dc2626' : '#e5e7eb',
              }}
            />
            {errors.stock && <ErrorText>{errors.stock}</ErrorText>}
          </FormGroup>

          <FormGroup>
            <Label htmlFor="status">Status</Label>
            <SelectField
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="out_of_stock">Out of Stock</option>
            </SelectField>
          </FormGroup>
        </FormGrid>

        <FormGroup>
          <CheckboxLabel>
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleInputChange}
            />
            Mark as Featured Product
          </CheckboxLabel>
        </FormGroup>
      </FormSection>

      {/* Images */}
      <FormSection>
        <SectionTitle>Product Images *</SectionTitle>
        <FormGroup>
          <Label htmlFor="imageUpload">Upload Images (JPG, PNG, WebP - Max 5MB each)</Label>
          <input
            id="imageUpload"
            type="file"
            multiple
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileUpload}
            style={{ display: 'none' }}
            ref={fileInputRef}
          />
          <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
            <Plus size={32} color="#5b4dff" style={{ margin: '0 auto 12px' }} />
            <p style={{ fontWeight: 600, color: '#1f2937', marginBottom: '4px' }}>
              Click to upload or drag and drop
            </p>
            <p style={{ fontSize: '12px' }}>PNG, JPG, WebP up to 5MB each</p>
          </ImageUploadArea>
          {errors.images && <ErrorText>{errors.images}</ErrorText>}
        </FormGroup>

        {images.length > 0 && (
          <>
            <p style={{ fontSize: '13px', color: '#6b7280', marginTop: '12px' }}>
              {images.length} image(s) selected (max 10)
            </p>
            <ImagePreviewContainer>
              {images.map((image, idx) => (
                <ImagePreview key={idx}>
                  {image.preview ? (
                    <img src={image.preview} alt={`Preview ${idx + 1}`} />
                  ) : (
                    <img src={image} alt={`Product ${idx + 1}`} />
                  )}
                  <button
                    type="button"
                    onClick={() => handleRemoveImage(idx)}
                    title="Remove image"
                  >
                    <X size={14} />
                  </button>
                </ImagePreview>
              ))}
            </ImagePreviewContainer>
          </>
        )}
      </FormSection>

      {/* Submit */}
      <FormSection>
        <ButtonGroup>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              setFormData({
                name: '',
                description: '',
                price: '',
                stock: 0,
                category: '',
                sku: '',
                isFeatured: false,
                status: 'active',
              });
              setImages([]);
              setErrors({});
            }}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading} style={{ opacity: isLoading ? 0.6 : 1 }}>
            {isLoading ? 'Creating...' : isEdit ? 'Update Product' : 'Create Product'}
          </Button>
        </ButtonGroup>
      </FormSection>
    </FormContainer>
  );
};

export default ProductForm;
