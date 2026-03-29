'use client';

import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Header from '@/components/layout/Header';
import AffiliateSidebar from '@/components/layout/AffiliateSidebar';

const AffiliateLayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 250px 1fr;
  min-height: 100vh;
  background: #f9fafb;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SidebarWrapper = styled.aside`
  border-right: 1px solid #e5e7eb;
  background: white;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
`;

export default function AffiliateLayout({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    // Remove role check - let individual pages handle authorization
    // This allows /affiliate/register to be accessible to non-affiliates
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <AffiliateLayoutContainer>
        <MainContent>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading...
          </div>
        </MainContent>
      </AffiliateLayoutContainer>
    );
  }

  return (
    <>
      <Header />
      <AffiliateLayoutContainer>
        <SidebarWrapper>
          <AffiliateSidebar />
        </SidebarWrapper>
        <MainContent>
          <ContentArea>
            {children}
          </ContentArea>
        </MainContent>
      </AffiliateLayoutContainer>
    </>
  );
}
