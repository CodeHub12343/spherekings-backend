/**
 * Validation Utilities
 * Form validation schemas and helper functions
 */

/**
 * Email validation regex
 */
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Password validation regex
 * Requires: minimum 8 characters, uppercase, lowercase, number, special character
 */
const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

/**
 * Validate email format (returns object with isValid and error)
 */
export const validateEmail = (email) => {
  let error = '';
  if (!email) error = 'Email is required';
  else if (!EMAIL_REGEX.test(email)) error = 'Invalid email format';
  
  return {
    isValid: !error,
    error
  };
};

/**
 * Validate password strength
 */
export const validatePassword = (password) => {
  if (!password) return 'Password is required';
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[a-z]/.test(password)) return 'Password must include lowercase letters';
  if (!/[A-Z]/.test(password)) return 'Password must include uppercase letters';
  if (!/\d/.test(password)) return 'Password must include numbers';
  if (!/[@$!%*?&]/.test(password)) return 'Password must include special characters (@$!%*?&)';
  return '';
};

/**
 * Validate confirm password matches password
 */
export const validatePasswordMatch = (password, confirmPassword) => {
  if (!confirmPassword) return 'Please confirm your password';
  if (password !== confirmPassword) return 'Passwords do not match';
  return '';
};

/**
 * Validate name field
 */
export const validateName = (name, fieldName = 'Name') => {
  if (!name) return `${fieldName} is required`;
  if (name.trim().length < 2) return `${fieldName} must be at least 2 characters`;
  if (name.trim().length > 50) return `${fieldName} must not exceed 50 characters`;
  return '';
};

/**
 * Validate phone number (basic validation)
 */
export const validatePhone = (phone) => {
  if (!phone) return '';
  // Allow formats like +1234567890, +1 (234) 567-8900, etc.
  const phoneRegex = /^[\d\s\-+()]{7,}$/;
  if (!phoneRegex.test(phone)) return 'Invalid phone number format';
  return '';
};

/**
 * Login form validation
 */
export const validateLoginForm = (formData) => {
  const errors = {};

  // Email validation
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  // Password validation
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Register form validation
 */
export const validateRegisterForm = (formData) => {
  const errors = {};

  // Email validation
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  // Validate combined name (firstName + lastName)
  // Backend expects a single 'name' field, so we validate them together
  const fullName = `${formData.firstName || ''} ${formData.lastName || ''}`.trim();
  
  if (!fullName) {
    // Set errors for both fields as they're both required for the combined name
    if (!formData.firstName) errors.firstName = 'First name is required';
    if (!formData.lastName) errors.lastName = 'Last name is required';
  } else {
    // Validate combined name length
    if (fullName.length < 2) {
      errors.firstName = 'Full name must be at least 2 characters';
    } else if (fullName.length > 50) {
      errors.firstName = 'Full name must not exceed 50 characters';
    } else {
      // Validate individual fields for reasonable length
      if (formData.firstName && formData.firstName.trim().length < 1) {
        errors.firstName = 'First name cannot be empty';
      }
      if (formData.lastName && formData.lastName.trim().length < 1) {
        errors.lastName = 'Last name cannot be empty';
      }
    }
  }

  // Password validation
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  // Confirm password validation
  const confirmError = validatePasswordMatch(formData.password, formData.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  // Validate terms agreement
  if (!formData.agreeToTerms) {
    errors.agreeToTerms = 'You must agree to the terms and conditions';
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Forgot password form validation
 */
export const validateForgotPasswordForm = (formData) => {
  const errors = {};

  // Email validation
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Reset password form validation
 */
export const validateResetPasswordForm = (formData) => {
  const errors = {};

  // Password validation
  const passwordError = validatePassword(formData.password);
  if (passwordError) errors.password = passwordError;

  // Confirm password validation
  const confirmError = validatePasswordMatch(formData.password, formData.confirmPassword);
  if (confirmError) errors.confirmPassword = confirmError;

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};

/**
 * Check if form has errors
 */
export const hasErrors = (errors) => {
  return Object.keys(errors).length > 0;
};

/**
 * Get first error field
 */
export const getFirstError = (errors) => {
  const firstKey = Object.keys(errors)[0];
  return firstKey ? errors[firstKey] : '';
};

/**
 * Validate street address
 */
export const validateStreetAddress = (street) => {
  if (!street) return 'Street address is required';
  if (street.trim().length < 5) return 'Street address must be at least 5 characters';
  if (street.trim().length > 200) return 'Street address cannot exceed 200 characters';
  return '';
};

/**
 * Validate city name
 */
export const validateCity = (city) => {
  if (!city) return 'City is required';
  if (city.trim().length < 2) return 'City must be at least 2 characters';
  if (city.trim().length > 50) return 'City cannot exceed 50 characters';
  return '';
};

/**
 * Validate state/province
 */
export const validateState = (state) => {
  if (!state) return 'State/Province is required';
  if (state.trim().length < 2) return 'State/Province must be at least 2 characters';
  if (state.trim().length > 50) return 'State/Province cannot exceed 50 characters';
  return '';
};

/**
 * Validate zip/postal code
 */
export const validateZipCode = (zipCode) => {
  if (!zipCode) return 'ZIP/Postal code is required';
  const zipRegex = /^[A-Z0-9]{3,10}$/i;
  if (!zipRegex.test(zipCode)) return 'Invalid ZIP/Postal code format';
  return '';
};

/**
 * Validate country
 */
export const validateCountry = (country) => {
  if (!country) return 'Country is required';
  return '';
};

/**
 * Raffle entry form validation
 */
export const validateRaffleEntryForm = (formData) => {
  const errors = {};

  // Full name validation
  const nameError = validateName(formData.fullName, 'Full name');
  if (nameError) errors.fullName = nameError;

  // Email validation
  const emailValidation = validateEmail(formData.email);
  if (!emailValidation.isValid) errors.email = emailValidation.error;

  // Phone validation (optional)
  const phoneError = validatePhone(formData.phone || '');
  if (phoneError) errors.phone = phoneError;

  // Address validation
  if (formData.shippingAddress) {
    const streetError = validateStreetAddress(formData.shippingAddress.street);
    if (streetError) errors['shippingAddress.street'] = streetError;

    const cityError = validateCity(formData.shippingAddress.city);
    if (cityError) errors['shippingAddress.city'] = cityError;

    const stateError = validateState(formData.shippingAddress.state);
    if (stateError) errors['shippingAddress.state'] = stateError;

    const zipError = validateZipCode(formData.shippingAddress.zipCode);
    if (zipError) errors['shippingAddress.zipCode'] = zipError;

    const countryError = validateCountry(formData.shippingAddress.country);
    if (countryError) errors['shippingAddress.country'] = countryError;
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

export default {
  validateEmail,
  validatePassword,
  validatePasswordMatch,
  validateName,
  validatePhone,
  validateStreetAddress,
  validateCity,
  validateState,
  validateZipCode,
  validateCountry,
  validateLoginForm,
  validateRegisterForm,
  validateForgotPasswordForm,
  validateResetPasswordForm,
  validateRaffleEntryForm,
  hasErrors,
  getFirstError,
};
