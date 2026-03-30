'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '@/contexts/AuthContext';
import { ToastProvider } from '@/components/ui/Toast';
import { ThemeProvider } from 'styled-components';
import GlobalStyles from '@/styles/globals';
import ReferralTracker from '@/components/affiliate/ReferralTracker';
import { useMemo, Suspense } from 'react';

const theme = {
  colors: {
    primary: '#5b4dff',
    secondary: '#0f172a',
    accent: '#f59e0b',
    danger: '#dc2626',
    success: '#10b981',
    warning: '#f59e0b',
    info: '#3b82f6',
    background: '#ffffff',
    surface: '#f9fafb',
    text: '#0f172a',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    '2xl': '48px',
  },
  breakpoints: {
    mobile: '640px',
    tablet: '768px',
    desktop: '1024px',
  },
};

export function Providers({ children }) {
  // Create QueryClient once and memoize it
  const queryClient = useMemo(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 10, // 10 minutes (formerly cacheTime)
            retry: 1,
            refetchOnWindowFocus: false,
          },
        },
      }),
    []
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <GlobalStyles />
        <AuthProvider>
          <ToastProvider>
            <Suspense fallback={null}>
              <ReferralTracker />
            </Suspense>
            {children}
          </ToastProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
