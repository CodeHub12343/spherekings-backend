/**
 * Axios API Client
 * Configured with JWT interceptors for automatic token injection and refresh
 */

import axios from 'axios';
import API_CONFIG from '@/config/api.config';
import TokenManager from '@/utils/tokenManager';

// Create axios instance
const client = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  withCredentials: true, // ← CRITICAL: Send cookies with cross-origin requests (affiliate tracking)
  headers: {
    // Don't set Content-Type globally - let it be set based on data type
    // FormData will automatically use multipart/form-data
    // JSON data will use application/json in the interceptor
  },
});

// Flag to prevent multiple refresh token requests
let isRefreshing = false;
let failedQueue = [];

// Process queued requests after token refresh
const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

/**
 * Request Interceptor
 * Injects access token in Authorization header
 * Sets Content-Type based on data type
 */
client.interceptors.request.use(
  (config) => {
    const token = TokenManager.getAccessToken();

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Set Content-Type based on data type
    // FormData: let browser set multipart/form-data automatically
    // JSON data: use application/json
    if (config.data instanceof FormData) {
      // Don't set Content-Type - browser will set it with correct boundary
      delete config.headers['Content-Type'];
    } else if (config.data && typeof config.data === 'object') {
      // For JSON objects, set JSON content type
      config.headers['Content-Type'] = 'application/json';
    } else if (!config.headers['Content-Type']) {
      // Default to JSON for other cases
      config.headers['Content-Type'] = 'application/json';
    }

    console.log('📤 Request Config:', {
      url: config.url,
      method: config.method,
      dataType: config.data instanceof FormData ? 'FormData' : typeof config.data,
      contentType: config.headers['Content-Type'],
      hasAuth: !!config.headers.Authorization,
    });

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

/**
 * Response Interceptor
 * Handles token refresh on 401 errors
 */
client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is not 401 or request already retried, reject
    if (error.response?.status !== 401 || originalRequest._retry) {
      // Handle 403 Forbidden - don't auto-redirect, let components handle
      // This allows pages like /sponsorship/success to show graceful fallbacks
      if (error.response?.status === 403) {
        console.warn('Access denied to resource:', error.config.url);
        return Promise.reject(error);
      }

      // Handle 429 Too Many Requests
      if (error.response?.status === 429) {
        console.warn('Too many requests. Please try again later.');
      }

      return Promise.reject(error);
    }

    // If already refreshing, queue the request
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        failedQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return client(originalRequest);
        })
        .catch((err) => Promise.reject(err));
    }

    // Start token refresh
    isRefreshing = true;
    originalRequest._retry = true;

    try {
      const refreshToken = TokenManager.getRefreshToken();

      if (!refreshToken) {
        // No refresh token available - can't refresh
        TokenManager.clearTokens();
        return Promise.reject(new Error('No refresh token available'));
      }

      // Request new access token
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.AUTH.REFRESH}`,
        { refreshToken },
        { timeout: API_CONFIG.TIMEOUT }
      );

      const { token: newAccessToken, refreshToken: newRefreshToken } = response.data;

      // Store new tokens
      TokenManager.setTokens(newAccessToken, newRefreshToken);

      // Update original request with new token
      originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;

      // Process queued requests
      processQueue(null, newAccessToken);
      isRefreshing = false;

      // Retry original request
      return client(originalRequest);
    } catch (refreshError) {
      // Token refresh failed - clear tokens but don't auto-redirect
      // Let components handle the error gracefully
      TokenManager.clearTokens();
      processQueue(refreshError, null);
      isRefreshing = false;

      return Promise.reject(refreshError);
    }
  }
);

export default client;
