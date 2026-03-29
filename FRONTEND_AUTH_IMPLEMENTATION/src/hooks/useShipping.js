/**
 * useShipping Hook
 * Custom React hook for managing shipping address form state and validation
 * 
 * Features:
 * - Manages form state (values and errors)
 * - Real-time field validation
 * - Form submission validation
 * - Integration with Zustand checkout store
 * - Automatic persistence to store
 */

import { useState, useCallback, useEffect } from 'react';
import { useShippingAddress, useShippingActions } from '@/stores/checkoutStore';
import {
  shippingAddressSchema,
  validateShippingAddress,
  validateShippingField,
  defaultShippingAddress,
} from '@/validations/shippingSchema';

/**
 * useShipping Hook
 * 
 * @returns {Object} Shipping form state and handlers
 * @example
 * const {
 *   formData,
 *   errors,
 *   touched,
 *   isSubmitting,
 *   handleChange,
 *   handleBlur,
 *   handleSubmit,
 *   setFormData,
 *   isValid
 * } = useShipping();
 */
export function useShipping() {
  const storedAddress = useShippingAddress();
  const { setShippingAddress, updateShippingField } = useShippingActions();

  // Form state
  const [formData, setFormData] = useState(storedAddress || defaultShippingAddress);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Sync with store on mount and when stored address changes
  useEffect(() => {
    if (storedAddress && Object.values(storedAddress).some(v => v !== '')) {
      setFormData(storedAddress);
    }
  }, [storedAddress]);

  /**
   * Handle field change
   * Updates form state and syncs to store
   */
  const handleChange = useCallback(
    (e) => {
      const { name, value } = e.target;
      
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));

      // Sync to store
      updateShippingField(name, value);

      // Clear error for this field if user starts typing
      if (errors[name]) {
        setErrors((prev) => ({
          ...prev,
          [name]: null,
        }));
      }
    },
    [errors, updateShippingField]
  );

  /**
   * Handle field blur (validate on blur)
   */
  const handleBlur = useCallback(
    (e) => {
      const { name } = e.target;
      setTouched((prev) => ({
        ...prev,
        [name]: true,
      }));

      // Validate single field on blur
      if (formData[name]) {
        const validation = validateShippingField(name, formData[name]);
        if (!validation.valid) {
          setErrors((prev) => ({
            ...prev,
            [name]: validation.error,
          }));
        } else {
          setErrors((prev) => ({
            ...prev,
            [name]: null,
          }));
        }
      }
    },
    [formData]
  );

  /**
   * Validate entire form
   */
  const validateForm = useCallback(() => {
    const validation = validateShippingAddress(formData);

    if (!validation.success) {
      setErrors(validation.errors || {});
      setTouched(
        Object.keys(formData).reduce((acc, key) => {
          acc[key] = true;
          return acc;
        }, {})
      );
      return false;
    }

    setErrors({});
    return true;
  }, [formData]);

  /**
   * Handle form submission
   */
  const handleSubmit = useCallback(
    async (onSuccess) => {
      setIsSubmitting(true);
      console.log('🔄 useShipping.handleSubmit called');
      console.log('🔄 Current formData:', formData);

      // Validate form
      if (!validateForm()) {
        setIsSubmitting(false);
        console.warn('❌ Shipping form validation failed at validateForm()');
        return false;
      }

      try {
        // Mark all fields as touched
        setTouched(
          Object.keys(formData).reduce((acc, key) => {
            acc[key] = true;
            return acc;
          }, {})
        );

        // Parse and validate with Zod schema
        console.log('🔄 Validating with Zod schema...');
        const validated = shippingAddressSchema.parse(formData);
        console.log('✅ Zod validation passed, validated data:', validated);

        // Save to store
        console.log('🔄 Saving to Zustand store...');
        setShippingAddress(validated);

        // Call success callback if provided
        if (onSuccess) {
          console.log('🔄 Calling onSuccess callback with:', validated);
          await onSuccess(validated);
        }

        console.log('✅ Shipping form submitted successfully');
        return true;
      } catch (error) {
        console.error('❌ Shipping form submission error:', error);
        return false;
      } finally {
        setIsSubmitting(false);
      }
    },
    [formData, validateForm, setShippingAddress]
  );

  /**
   * Reset form to initial state
   */
  const resetForm = useCallback(() => {
    setFormData(defaultShippingAddress);
    setErrors({});
    setTouched({});
  }, []);

  /**
   * Check if all required fields are filled (basic check)
   */
  const isFormFilled = useCallback(() => {
    return Object.values(formData).every((value) => value && value.trim() !== '');
  }, [formData]);

  /**
   * Check if form is valid (no errors)
   */
  const isFormValid = useCallback(() => {
    return Object.keys(errors).length === 0 && isFormFilled();
  }, [errors, isFormFilled]);

  return {
    // State
    formData,
    errors,
    touched,
    isSubmitting,
    
    // Methods
    handleChange,
    handleBlur,
    handleSubmit,
    resetForm,
    setFormData,
    validateForm,
    
    // Computed
    isValid: isFormValid(),
    isFilled: isFormFilled(),
  };
}

export default useShipping;
