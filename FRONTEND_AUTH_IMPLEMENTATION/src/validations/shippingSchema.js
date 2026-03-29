/**
 * Shipping Address Validation Schema (Frontend)
 * 
 * Zod schema for validating shipping address on the client side
 * Matches backend validation rules in src/validations/shippingSchema.js
 */

import { z } from 'zod';

/**
 * Zod schema for shipping address validation
 * 
 * Validates all required fields with appropriate constraints:
 * - Names: 2-50 characters
 * - Email: valid email format
 * - Phone: international format with +country code
 * - Street: 5-100 characters
 * - City: 2-50 characters
 * - State: 2-50 characters
 * - Postal Code: 3-20 characters
 * - Country: 2-character ISO code
 */
export const shippingAddressSchema = z.object({
  firstName: z
    .string()
    .min(2, 'First name must be at least 2 characters')
    .max(50, 'First name cannot exceed 50 characters')
    .trim(),

  lastName: z
    .string()
    .min(2, 'Last name must be at least 2 characters')
    .max(50, 'Last name cannot exceed 50 characters')
    .trim(),

  email: z
    .string()
    .email('Please enter a valid email address')
    .max(100, 'Email cannot exceed 100 characters')
    .toLowerCase(),

  phone: z
    .string()
    .regex(
      /^\+?[1-9]\d{1,14}$/,
      'Please enter a valid phone number with country code (e.g., +1234567890)'
    ),

  street: z
    .string()
    .min(5, 'Street address must be at least 5 characters')
    .max(100, 'Street address cannot exceed 100 characters')
    .trim(),

  city: z
    .string()
    .min(2, 'City must be at least 2 characters')
    .max(50, 'City cannot exceed 50 characters')
    .trim(),

  state: z
    .string()
    .min(2, 'State/Province must be at least 2 characters')
    .max(50, 'State/Province cannot exceed 50 characters')
    .trim(),

  postalCode: z
    .string()
    .min(3, 'Postal code must be at least 3 characters')
    .max(20, 'Postal code cannot exceed 20 characters')
    .trim()
    .toUpperCase(),

  country: z
    .string()
    .length(2, 'Country must be a 2-character ISO code (e.g., US, CA, UK)')
    .toUpperCase(),
});

/**
 * Default empty shipping address object
 * @type {Object}
 */
export const defaultShippingAddress = {
  firstName: '',
  lastName: '',
  email: '',
  phone: '',
  street: '',
  city: '',
  state: '',
  postalCode: '',
  country: '',
};

/**
 * Validate shipping address
 * 
 * @param {Object} data - Data to validate
 * @returns {Object} Validation result with data and errors
 * @example
 * const result = validateShippingAddress(formData);
 * if (result.success) {
 *   console.log('Valid address:', result.data);
 * } else {
 *   console.log('Field errors:', result.errors);
 * }
 */
export function validateShippingAddress(data) {
  try {
    const validated = shippingAddressSchema.parse(data);
    return {
      success: true,
      data: validated,
      errors: null,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      // Convert Zod errors to field-level object
      const fieldErrors = {};
      error.errors.forEach((err) => {
        const path = err.path[0]; // Get field name
        fieldErrors[path] = err.message;
      });

      return {
        success: false,
        data: null,
        errors: fieldErrors,
      };
    }

    return {
      success: false,
      data: null,
      errors: { general: 'Validation failed' },
    };
  }
}

/**
 * Validate a single field
 * Useful for real-time validation as user types
 * 
 * @param {string} fieldName - Name of field to validate
 * @param {any} value - Value to validate
 * @returns {Object} Field validation result
 * @example
 * const error = validateShippingField('email', 'invalid-email');
 * console.log(error.error); // "Please enter a valid email address"
 */
export function validateShippingField(fieldName, value) {
  try {
    const schema = shippingAddressSchema.pick({ [fieldName]: true });
    schema.parse({ [fieldName]: value });
    return { valid: true, error: null };
  } catch (error) {
    if (error instanceof z.ZodError && error.errors.length > 0) {
      return { valid: false, error: error.errors[0].message };
    }
    return { valid: false, error: 'Invalid value' };
  }
}

/**
 * List of valid countries (predefined for form select dropdown)
 * Can be extended or fetched from API
 * @type {Array<{code: string, name: string}>}
 */
export const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'AU', name: 'Australia' },
  { code: 'MX', name: 'Mexico' },
  { code: 'BR', name: 'Brazil' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'IT', name: 'Italy' },
  { code: 'ES', name: 'Spain' },
  { code: 'JP', name: 'Japan' },
  { code: 'CN', name: 'China' },
  { code: 'IN', name: 'India' },
  { code: 'SG', name: 'Singapore' },
  { code: 'NZ', name: 'New Zealand' },
];

/**
 * US States for state select dropdown (if country is US)
 */
export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
];
