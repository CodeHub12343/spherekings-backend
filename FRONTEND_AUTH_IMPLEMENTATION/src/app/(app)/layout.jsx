'use client';

import styled from 'styled-components';
import Header from '@/components/layout/Header';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

const AppLayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const AppContent = styled.main`
  flex: 1;
  width: 100%;
  background: #f9fafb;
`;

export default function AppLayout({ children }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <AppLayoutContainer>
        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          Loading...
        </div>
      </AppLayoutContainer>
    );
  }

  return (
    <AppLayoutContainer>
      <Header />
      <AppContent>
        {children}
      </AppContent>
    </AppLayoutContainer>
  );
}
