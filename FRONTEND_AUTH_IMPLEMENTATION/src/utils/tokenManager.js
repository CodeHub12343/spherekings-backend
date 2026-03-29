/**
 * Token Manager
 * Handles JWT token storage, validation, and retrieval
 */

import API_CONFIG from '@/config/api.config';

const TokenManager = {
  /**
   * Store tokens in localStorage
   */
  setTokens: (accessToken, refreshToken) => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.setItem(API_CONFIG.ACCESS_TOKEN_KEY, accessToken);
        if (refreshToken) {
          localStorage.setItem(API_CONFIG.REFRESH_TOKEN_KEY, refreshToken);
        }
        
        // Decode and store expiry time
        const expiryTime = TokenManager.getTokenExpirationTime(accessToken);
        localStorage.setItem(API_CONFIG.TOKEN_EXPIRY_KEY, expiryTime.toString());
      }
    } catch (error) {
      console.error('Error setting tokens:', error);
    }
  },

  /**
   * Get access token from localStorage
   */
  getAccessToken: () => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(API_CONFIG.ACCESS_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting access token:', error);
    }
    return null;
  },

  /**
   * Get refresh token from localStorage
   */
  getRefreshToken: () => {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(API_CONFIG.REFRESH_TOKEN_KEY);
      }
    } catch (error) {
      console.error('Error getting refresh token:', error);
    }
    return null;
  },

  /**
   * Check if access token exists
   */
  hasAccessToken: () => {
    const token = TokenManager.getAccessToken();
    return !!token && !TokenManager.isTokenExpired(token);
  },

  /**
   * Clear all tokens from localStorage
   */
  clearTokens: () => {
    try {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(API_CONFIG.ACCESS_TOKEN_KEY);
        localStorage.removeItem(API_CONFIG.REFRESH_TOKEN_KEY);
        localStorage.removeItem(API_CONFIG.TOKEN_EXPIRY_KEY);
      }
    } catch (error) {
      console.error('Error clearing tokens:', error);
    }
  },

  /**
   * Decode JWT token (client-side only)
   * Does NOT validate signature - signature validation must happen on backend
   */
  decodeToken: (token) => {
    try {
      if (!token) return null;
      
      // JWT format: header.payload.signature
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      // Decode payload (second part)
      const payload = parts[1];
      const decoded = JSON.parse(
        Buffer.from(payload, 'base64').toString('utf-8')
      );
      
      return decoded;
    } catch (error) {
      console.error('Error decoding token:', error);
      return null;
    }
  },

  /**
   * Check if token is expired
   */
  isTokenExpired: (token) => {
    try {
      if (!token) return true;
      
      const decoded = TokenManager.decodeToken(token);
      if (!decoded || !decoded.exp) return true;
      
      // exp is in seconds, convert to milliseconds
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      
      return currentTime >= expiryTime;
    } catch (error) {
      console.error('Error checking token expiration:', error);
      return true;
    }
  },

  /**
   * Get time until token expiration in milliseconds
   */
  getTokenExpirationTime: (token) => {
    try {
      if (!token) return 0;
      
      const decoded = TokenManager.decodeToken(token);
      if (!decoded || !decoded.exp) return 0;
      
      // exp is in seconds, convert to milliseconds
      const expiryTime = decoded.exp * 1000;
      const currentTime = Date.now();
      const timeUntilExpiry = expiryTime - currentTime;
      
      return Math.max(0, timeUntilExpiry);
    } catch (error) {
      console.error('Error getting token expiration time:', error);
      return 0;
    }
  },

  /**
   * Check if token needs refresh (within threshold)
   */
  shouldRefreshToken: () => {
    try {
      const token = TokenManager.getAccessToken();
      if (!token) return false;
      
      const timeUntilExpiry = TokenManager.getTokenExpirationTime(token);
      return timeUntilExpiry > 0 && timeUntilExpiry < API_CONFIG.REFRESH_THRESHOLD;
    } catch (error) {
      console.error('Error checking if token should refresh:', error);
      return false;
    }
  },

  /**
   * Get user ID from access token
   */
  getUserId: () => {
    try {
      const token = TokenManager.getAccessToken();
      if (!token) return null;
      
      const decoded = TokenManager.decodeToken(token);
      return decoded?.userId || decoded?.sub || null;
    } catch (error) {
      console.error('Error getting user ID:', error);
      return null;
    }
  },

  /**
   * Get user role from access token
   */
  getUserRole: () => {
    try {
      const token = TokenManager.getAccessToken();
      if (!token) return null;
      
      const decoded = TokenManager.decodeToken(token);
      return decoded?.role || null;
    } catch (error) {
      console.error('Error getting user role:', error);
      return null;
    }
  },
};

export const tokenManager = TokenManager;
export default TokenManager;
