/**
 * API Configuration
 * Centralized API settings and constants
 */

// API Base URL
export const BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api/v1';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

// Token Storage Keys
export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'spherekings_access_token',
  REFRESH_TOKEN: 'spherekings_refresh_token',
  TOKEN_EXPIRY: 'spherekings_token_expiry',
};

// Token Configuration
export const TOKEN_CONFIG = {
  REFRESH_THRESHOLD: 5 * 60 * 1000, // 5 minutes in milliseconds
  EXPIRY_BUFFER: 60000, // 1 minute buffer
};

// API Endpoints - Organized by module
export const API_ENDPOINTS = {
  AUTH: {
    REGISTER: '/auth/register',
    LOGIN: '/auth/login',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    ME: '/auth/me',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },
  USER: {
    GET_PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    UPLOAD_AVATAR: '/users/avatar',
    CHANGE_PASSWORD: '/users/password',
    GET_USER_STATS: '/users/stats',
  },
  PRODUCTS: {
    GET_PRODUCTS: '/products',
    GET_PRODUCT: '/products/:id',
    GET_CATEGORIES: '/products/categories',
  },
  CART: {
    GET_CART: '/cart',
    ADD_TO_CART: '/cart/items',
    UPDATE_CART: '/cart/items/:id',
    REMOVE_FROM_CART: '/cart/items/:id',
  },
  ORDERS: {
    CREATE_ORDER: '/orders',
    GET_ORDERS: '/orders',
    GET_ORDER: '/orders/:id',
  },
  AFFILIATE: {
    GET_STATUS: '/affiliate/status',
    GET_COMMISSIONS: '/affiliate/commissions',
    REQUEST_PAYOUT: '/affiliate/payouts/request',
  },
};

// Keep flat version for backward compatibility
export const ENDPOINTS = {
  // Authentication
  REGISTER: '/auth/register',
  LOGIN: '/auth/login',
  LOGOUT: '/auth/logout',
  REFRESH: '/auth/refresh',
  GET_CURRENT_USER: '/auth/me',
  FORGOT_PASSWORD: '/auth/forgot-password',
  RESET_PASSWORD: '/auth/reset-password',

  // User Management (examples - add as needed)
  GET_PROFILE: '/users/profile',
  UPDATE_PROFILE: '/users/profile',
  UPLOAD_AVATAR: '/users/avatar',
  CHANGE_PASSWORD: '/users/password',
  GET_USER_STATS: '/users/stats',

  // Product (examples)
  GET_PRODUCTS: '/products',
  GET_PRODUCT: '/products/:id',
  GET_CATEGORIES: '/products/categories',

  // Cart (examples)
  GET_CART: '/cart',
  ADD_TO_CART: '/cart/items',
  UPDATE_CART: '/cart/items/:id',
  REMOVE_FROM_CART: '/cart/items/:id',

  // Orders (examples)
  CREATE_ORDER: '/orders',
  GET_ORDERS: '/orders',
  GET_ORDER: '/orders/:id',

  // Affiliate (examples)
  GET_AFFILIATE_STATUS: '/affiliate/status',
  GET_COMMISSIONS: '/affiliate/commissions',
  REQUEST_PAYOUT: '/affiliate/payouts/request',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid email or password.',
  EMAIL_ALREADY_REGISTERED: 'Email already registered. Please login or use forgot password.',
  UNAUTHORIZED: 'You are not authorized to access this resource.',
  FORBIDDEN: 'Access forbidden.',
  NOT_FOUND: 'Resource not found.',
  SERVER_ERROR: 'Server error. Please try again later.',
  RATE_LIMIT: 'Too many requests. Please try again later.',
  INVALID_TOKEN: 'Session expired. Please login again.',
  GENERIC: 'An unexpected error occurred. Please try again.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN: 'Login successful!',
  REGISTER: 'Account created successfully!',
  LOGOUT: 'Logged out successfully.',
  PASSWORD_RESET: 'Password reset successfully.',
  UPDATE_SUCCESS: 'Updated successfully.',
  ACTION_SUCCESS: 'Action completed successfully.',
};

// HTTP Status Codes
export const HTTP_STATUS = {
  OK: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE_ENTITY: 422,
  RATE_LIMIT: 429,
  INTERNAL_SERVER_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

// Form Constraints
export const FORM_CONSTRAINTS = {
  EMAIL_MIN: 5,
  EMAIL_MAX: 255,
  PASSWORD_MIN: 8,
  PASSWORD_MAX: 128,
  NAME_MIN: 2,
  NAME_MAX: 50,
  PHONE_MIN: 7,
  PHONE_MAX: 20,
};

// Default config export
export default {
  BASE_URL,
  APP_URL,
  TOKEN_KEYS,
  TOKEN_CONFIG,
  API_ENDPOINTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  HTTP_STATUS,
  FORM_CONSTRAINTS,
};
