'use client';

import { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

/**
 * ProtectedRoute Component
 * Wraps pages to require authentication
 * Redirects to /login if user is not authenticated
 * 
 * Usage:
 * export default function DashboardPage() {
 *   return (
 *     <ProtectedRoute>
 *       <DashboardContent />
 *     </ProtectedRoute>
 *   );
 * }
 */
export default function ProtectedRoute({ 
  children, 
  requiredRole = null,
  redirectTo = '/login' 
}) {
  const router = useRouter();
  const { isAuthenticated, isLoading, user } = useAuth();

  useEffect(() => {
    // Don't redirect while loading to prevent flashing login page
    if (isLoading) return;

    // Redirect if not authenticated
    if (!isAuthenticated) {
      router.push(redirectTo);
      return;
    }

    // Check role-based access if required
    if (requiredRole && user?.role !== requiredRole) {
      router.push('/unauthorized');
      return;
    }
  }, [isAuthenticated, isLoading, user, requiredRole, redirectTo, router]);

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          height: '100vh',
          backgroundColor: '#f9fafb',
        }}
      >
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '12px',
        }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              border: '4px solid #e5e7eb',
              borderTopColor: '#5b4dff',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }}
          />
          <p style={{
            margin: 0,
            color: '#6b7280',
            fontSize: '14px',
            fontWeight: 500,
          }}>
            Loading...
          </p>
          <style>{`
            @keyframes spin {
              to {
                transform: rotate(360deg);
              }
            }
          `}</style>
        </div>
      </div>
    );
  }

  // Don't render children if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  // Render protected content
  return children;
}

/**
 * withProtectedRoute - Higher Order Component version
 * 
 * Usage:
 * export default withProtectedRoute(DashboardPage);
 * 
 * Or with role:
 * export default withProtectedRoute(AdminPage, { requiredRole: 'admin' });
 */
export function withProtectedRoute(Component, options = {}) {
  const { requiredRole = null, redirectTo = '/login' } = options;

  return function ProtectedComponent(props) {
    return (
      <ProtectedRoute requiredRole={requiredRole} redirectTo={redirectTo}>
        <Component {...props} />
      </ProtectedRoute>
    );
  };
}
