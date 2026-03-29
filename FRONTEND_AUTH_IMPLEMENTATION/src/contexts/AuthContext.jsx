'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

import { authService } from '@/api/services/authService';
import { tokenManager } from '@/utils/tokenManager';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Initialize auth on app load
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check if token exists
        const token = tokenManager.getAccessToken();

        if (token && !tokenManager.isTokenExpired(token)) {
          // Token valid, fetch current user
          try {
            const userData = await authService.getCurrentUser();
            setUser(userData);
            setIsAuthenticated(true);
          } catch (err) {
            // Token invalid or user fetch failed
            tokenManager.clearTokens();
            setIsAuthenticated(false);
          }
        } else if (token && tokenManager.isTokenExpired(token)) {
          // Token expired, try to refresh
          try {
            const refreshToken = tokenManager.getRefreshToken();
            if (refreshToken) {
              await authService.refreshToken(refreshToken);
              // Retry fetching user
              const userData = await authService.getCurrentUser();
              setUser(userData);
              setIsAuthenticated(true);
            } else {
              tokenManager.clearTokens();
              setIsAuthenticated(false);
            }
          } catch (err) {
            tokenManager.clearTokens();
            setIsAuthenticated(false);
          }
        } else {
          // No token
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Auth initialization failed:', err);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Register user
  const register = useCallback(async (userData) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.register(userData);

      // Store tokens
      if (response.accessToken && response.refreshToken) {
        tokenManager.setTokens(response.accessToken, response.refreshToken);
      }

      // Set user
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Registration failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Login user
  const login = useCallback(async (credentials) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await authService.login(credentials);

      // Store tokens
      if (response.accessToken && response.refreshToken) {
        tokenManager.setTokens(response.accessToken, response.refreshToken);
      }

      // Set user
      setUser(response.user);
      setIsAuthenticated(true);

      return response;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Login failed';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Logout user
  const logout = useCallback(async () => {
    setIsLoading(true);

    try {
      // Optional: Call backend logout endpoint
      try {
        await authService.logout();
      } catch (err) {
        // Ignore errors from backend logout
        console.warn('Backend logout failed:', err);
      }

      // Clear local state
      tokenManager.clearTokens();
      setUser(null);
      setIsAuthenticated(false);
      setError(null);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update user
  const updateUser = useCallback((userData) => {
    setUser((prev) => ({
      ...prev,
      ...userData,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = {
    user,
    isAuthenticated,
    isLoading,
    error,
    register,
    login,
    logout,
    updateUser,
    clearError,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
