/**
 * Formatting utilities for dates, currencies, and other display values
 */

/**
 * Format a date string to a readable format
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date (e.g., "Mar 20, 2026 at 9:00 AM")
 */
export function formatDate(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true
    });
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}

/**
 * Format a date to short format
 * @param {string|Date} dateString - ISO date string or Date object
 * @returns {string} Formatted date (e.g., "Mar 20, 2026")
 */
export function formatDateShort(dateString) {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '';
    
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch (err) {
    console.error('Error formatting date:', err);
    return '';
  }
}

/**
 * Format a number as currency
 * @param {number} amount - Amount to format
 * @param {string} currency - Currency code (default: 'USD')
 * @returns {string} Formatted currency (e.g., "$456.83")
 */
export function formatCurrency(amount, currency = 'USD') {
  if (typeof amount !== 'number' || isNaN(amount)) {
    return '$0.00';
  }
  
  try {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  } catch (err) {
    console.error('Error formatting currency:', err);
    return `$${amount.toFixed(2)}`;
  }
}

/**
 * Format a percentage value
 * @param {number} value - Percentage value (e.g., 6.7)
 * @param {number} decimals - Number of decimal places (default: 1)
 * @returns {string} Formatted percentage (e.g., "6.7%")
 */
export function formatPercentage(value, decimals = 1) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0%';
  }
  
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format a number with commas
 * @param {number} value - Number to format
 * @param {number} decimals - Number of decimal places
 * @returns {string} Formatted number (e.g., "1,234.56")
 */
export function formatNumber(value, decimals = 0) {
  if (typeof value !== 'number' || isNaN(value)) {
    return '0';
  }
  
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals
  }).format(value);
}

/**
 * Truncate text with ellipsis
 * @param {string} text - Text to truncate
 * @param {number} maxLength - Maximum length
 * @returns {string} Truncated text
 */
export function truncateText(text, maxLength = 50) {
  if (!text || typeof text !== 'string') return '';
  if (text.length <= maxLength) return text;
  
  return text.substring(0, maxLength - 3) + '...';
}

/**
 * Format order status for display
 * @param {string} status - Order status
 * @returns {string} Formatted status
 */
export function formatOrderStatus(status) {
  if (!status) return '';
  
  return status
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Format payment status for display
 * @param {string} status - Payment status
 * @returns {string} Formatted status
 */
export function formatPaymentStatus(status) {
  if (!status) return '';
  
  const statusMap = {
    pending: 'Pending',
    paid: 'Paid',
    failed: 'Failed',
    refunded: 'Refunded',
    partial: 'Partial Refund'
  };
  
  return statusMap[status] || formatOrderStatus(status);
}

/**
 * Format commission status for display
 * @param {string} status - Commission status
 * @returns {string} Formatted status
 */
export function formatCommissionStatus(status) {
  if (!status) return '';
  
  const statusMap = {
    pending: 'Pending',
    calculated: 'Calculated',
    approved: 'Approved',
    paid: 'Paid',
    reversed: 'Reversed'
  };
  
  return statusMap[status] || formatOrderStatus(status);
}
