/**
 * Authentication Store
 * Zustand store for managing authentication state globally
 */

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { useShallow } from 'zustand/react/shallow';

const initialState = {
  user: null,
  token: null,
  refreshToken: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const useAuthStore = create(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // Set user data
        setUser: (user) => {
          set(() => ({
            user,
            isAuthenticated: !!user,
          }));
        },

        // Set tokens
        setTokens: (token, refreshToken) => {
          set(() => ({
            token,
            refreshToken,
            isAuthenticated: !!token,
          }));
        },

        // Set token
        setToken: (token) => {
          set(() => ({
            token,
            isAuthenticated: !!token,
          }));
        },

        // Set loading state
        setLoading: (isLoading) => {
          set(() => ({
            isLoading,
          }));
        },

        // Set error
        setError: (error) => {
          set(() => ({
            error,
          }));
        },

        // Login (store auth data)
        login: (user, token, refreshToken) => {
          set(() => ({
            user,
            token,
            refreshToken,
            isAuthenticated: true,
            error: null,
          }));
        },

        // Logout
        logout: () => {
          set(initialState);
        },

        // Refresh token
        refreshAccessToken: (token) => {
          set(() => ({
            token,
          }));
        },

        // Clear error
        clearError: () => {
          set(() => ({
            error: null,
          }));
        },

        // Update user
        updateUser: (updates) => {
          set((state) => ({
            user: state.user ? { ...state.user, ...updates } : null,
          }));
        },

        // Reset store
        reset: () => {
          set(initialState);
        },
      }),
      {
        name: 'auth-store',
        partialize: (state) => ({
          user: state.user,
          token: state.token,
          refreshToken: state.refreshToken,
          isAuthenticated: state.isAuthenticated,
        }),
      }
    ),
    { name: 'auth-store' }
  )
);

// =============== Selectors ===============

export const useAuthUser = () =>
  useAuthStore((state) => state.user);

export const useAuthToken = () =>
  useAuthStore((state) => state.token);

export const useIsAuthenticated = () =>
  useAuthStore((state) => state.isAuthenticated);

export const useAuthLoading = () =>
  useAuthStore((state) => state.isLoading);

export const useAuthError = () =>
  useAuthStore((state) => state.error);

export const useAuthState = () =>
  useAuthStore(
    useShallow((state) => ({
      user: state.user,
      token: state.token,
      isAuthenticated: state.isAuthenticated,
      isLoading: state.isLoading,
      error: state.error,
    }))
  );

export default useAuthStore;
