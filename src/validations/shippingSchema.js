/**
 * Shipping Address Validation Schema
 * 
 * Defines validation rules for shipping addresses used in checkout
 * Enforced both at API request validation and before storing in database
 */

/**
 * Validate shipping address object
 * 
 * @param {Object} address - Shipping address to validate
 * @param {string} address.firstName - Customer first name
 * @param {string} address.lastName - Customer last name
 * @param {string} address.email - Customer email
 * @param {string} address.phone - Customer phone with country code
 * @param {string} address.street - Street address
 * @param {string} address.city - City name
 * @param {string} address.state - State or province
 * @param {string} address.postalCode - Postal/ZIP code
 * @param {string} address.country - 2-character ISO country code
 * 
 * @returns {Object} Validated address object (same structure)
 * @throws {Error} If validation fails, includes field-level error messages
 */
function validateShippingAddress(address) {
  if (!address || typeof address !== 'object') {
    throw new Error('Shipping address must be a valid object');
  }

  const errors = {};

  // Validate firstName
  if (!address.firstName || typeof address.firstName !== 'string') {
    errors.firstName = 'First name is required';
  } else if (address.firstName.trim().length < 2) {
    errors.firstName = 'First name must be at least 2 characters';
  } else if (address.firstName.length > 50) {
    errors.firstName = 'First name cannot exceed 50 characters';
  }

  // Validate lastName
  if (!address.lastName || typeof address.lastName !== 'string') {
    errors.lastName = 'Last name is required';
  } else if (address.lastName.trim().length < 2) {
    errors.lastName = 'Last name must be at least 2 characters';
  } else if (address.lastName.length > 50) {
    errors.lastName = 'Last name cannot exceed 50 characters';
  }

  // Validate email
  if (!address.email || typeof address.email !== 'string') {
    errors.email = 'Email is required';
  } else {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(address.email)) {
      errors.email = 'Please enter a valid email address';
    } else if (address.email.length > 100) {
      errors.email = 'Email cannot exceed 100 characters';
    }
  }

  // Validate phone
  if (!address.phone || typeof address.phone !== 'string') {
    errors.phone = 'Phone number is required';
  } else {
    // International phone format: +1234567890 (+ followed by 1-15 digits)
    const phoneRegex = /^\+?[1-9]\d{1,14}$/;
    if (!phoneRegex.test(address.phone.replace(/[\s\-()]/g, ''))) {
      errors.phone = 'Please enter a valid phone number with country code (e.g., +1234567890)';
    }
  }

  // Validate street
  if (!address.street || typeof address.street !== 'string') {
    errors.street = 'Street address is required';
  } else if (address.street.trim().length < 5) {
    errors.street = 'Street address must be at least 5 characters';
  } else if (address.street.length > 100) {
    errors.street = 'Street address cannot exceed 100 characters';
  }

  // Validate city
  if (!address.city || typeof address.city !== 'string') {
    errors.city = 'City is required';
  } else if (address.city.trim().length < 2) {
    errors.city = 'City must be at least 2 characters';
  } else if (address.city.length > 50) {
    errors.city = 'City cannot exceed 50 characters';
  }

  // Validate state
  if (!address.state || typeof address.state !== 'string') {
    errors.state = 'State/Province is required';
  } else if (address.state.trim().length < 2) {
    errors.state = 'State/Province must be at least 2 characters';
  } else if (address.state.length > 50) {
    errors.state = 'State/Province cannot exceed 50 characters';
  }

  // Validate postalCode
  if (!address.postalCode || typeof address.postalCode !== 'string') {
    errors.postalCode = 'Postal code is required';
  } else if (address.postalCode.trim().length < 3) {
    errors.postalCode = 'Postal code must be at least 3 characters';
  } else if (address.postalCode.length > 20) {
    errors.postalCode = 'Postal code cannot exceed 20 characters';
  }

  // Validate country
  if (!address.country || typeof address.country !== 'string') {
    errors.country = 'Country is required';
  } else if (address.country.toUpperCase().length !== 2) {
    errors.country = 'Country must be a 2-character ISO code (e.g., US, CA, UK)';
  }

  // If there are errors, throw with all field errors
  if (Object.keys(errors).length > 0) {
    const error = new Error('Shipping address validation failed');
    error.name = 'ValidationError';
    error.statusCode = 400;
    error.errors = errors;
    throw error;
  }

  // Return trimmed/normalized address
  return {
    firstName: address.firstName.trim(),
    lastName: address.lastName.trim(),
    email: address.email.toLowerCase().trim(),
    phone: address.phone.replace(/[\s\-()]/g, ''),  // Normalize phone
    street: address.street.trim(),
    city: address.city.trim(),
    state: address.state.trim(),
    postalCode: address.postalCode.trim().toUpperCase(),
    country: address.country.toUpperCase(),
  };
}

/**
 * Check if shipping address is required
 * (Can be extended for conditional logic in future)
 * 
 * @returns {boolean} Always true - shipping required for all orders
 */
function isShippingRequired() {
  return true;
}

module.exports = {
  validateShippingAddress,
  isShippingRequired,
};
