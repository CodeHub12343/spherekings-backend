/**
 * Currency Utility Functions
 * Handles currency formatting and conversion
 */

/**
 * Format currency value (in cents) to display format
 * @param {number} cents - Amount in cents (e.g., 1000 = $10.00)
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency string (e.g., "$10.00")
 */
export const formatCurrency = (cents, currency = 'USD') => {
  if (cents === null || cents === undefined) {
    return '$0.00';
  }

  const dollars = cents / 100;
  
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return formatter.format(dollars);
};

/**
 * Parse currency string to cents
 * @param {string} currencyString - Currency string (e.g., "$10.00")
 * @returns {number} Amount in cents
 */
export const parseCurrency = (currencyString) => {
  if (!currencyString) return 0;
  
  // Remove currency symbol and convert to number
  const cleaned = currencyString.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned) || 0;
  
  return Math.round(dollars * 100); // Convert to cents
};

/**
 * Parse user input string to cents
 * Handles both "$10.00" and "10.00" formats
 * @param {string} inputString - User input (e.g., "10.50" or "$10.50")
 * @returns {number} Amount in cents
 */
export const parseFromString = (inputString) => {
  if (!inputString) return 0;
  
  // Remove all non-numeric characters except decimal point
  const cleaned = inputString.replace(/[^0-9.]/g, '');
  const dollars = parseFloat(cleaned) || 0;
  
  return Math.round(dollars * 100); // Convert to cents
};

/**
 * Format cents to readable amount text
 * @param {number} cents - Amount in cents
 * @returns {string} Readable format (e.g., "$1,000.00")
 */
export const formatAmount = (cents) => {
  return formatCurrency(cents, 'USD');
};

/**
 * Get currency symbol
 * @param {string} currency - Currency code
 * @returns {string} Currency symbol
 */
export const getCurrencySymbol = (currency = 'USD') => {
  const symbols = {
    USD: '$',
    EUR: '€',
    GBP: '£',
    CAD: 'C$',
  };
  return symbols[currency] || '$';
};

export default {
  formatCurrency,
  parseCurrency,
  parseFromString,
  formatAmount,
  getCurrencySymbol,
};
