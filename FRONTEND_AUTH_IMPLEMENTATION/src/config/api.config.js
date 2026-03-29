/**
 * API Configuration
 * Centralized API settings for the environment
 */

const API_CONFIG = {
  BASE_URL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1',
  APP_URL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
  
  // Timeout settings (in milliseconds)
  // Increased to 60s for file uploads (product images, etc.)
  TIMEOUT: 60000,
  
  // Token settings
  ACCESS_TOKEN_KEY: 'spherekings_access_token',
  REFRESH_TOKEN_KEY: 'spherekings_refresh_token',
  TOKEN_EXPIRY_KEY: 'spherekings_token_expiry',
  
  // Refresh token settings
  REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh if 5 minutes left
  
  // API Endpoints
  ENDPOINTS: {
    AUTH: {
      REGISTER: '/auth/register',
      LOGIN: '/auth/login',
      LOGOUT: '/auth/logout',
      REFRESH: '/auth/refresh',
      ME: '/auth/me',
      FORGOT_PASSWORD: '/auth/forgot-password',
      RESET_PASSWORD: '/auth/reset-password',
    },
  },
  
  // Error messages
  ERROR_MESSAGES: {
    NETWORK_ERROR: 'Network error. Please check your connection.',
    INVALID_CREDENTIALS: 'Invalid email or password.',
    EMAIL_EXISTS: 'Email already registered.',
    INVALID_TOKEN: 'Invalid or expired reset token.',
    PASSWORD_MISMATCH: 'Passwords do not match.',
    VALIDATION_ERROR: 'Please check your form for errors.',
    SERVER_ERROR: 'Server error. Please try again later.',
    UNAUTHORIZED: 'Please log in to continue.',
    FORBIDDEN: 'You do not have permission for this action.',
  },
};

export default API_CONFIG;
