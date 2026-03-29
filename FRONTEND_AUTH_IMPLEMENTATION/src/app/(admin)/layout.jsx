'use client';

import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Header from '@/components/layout/Header';
import AdminSidebar from '@/components/layout/AdminSidebar';

const AdminLayoutContainer = styled.div`
  display: grid;
  grid-template-columns: 270px 1fr;
  min-height: 100vh;
  background: #0f172a;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const SidebarWrapper = styled.aside`
  background: #1a2642;
  position: sticky;
  top: 0;
  height: 100vh;
  overflow-y: auto;
  border-right: 1px solid #2d3a52;

  @media (max-width: 768px) {
    display: none;
  }

  /* Scrollbar styling */
  scrollbar-width: thin;
  scrollbar-color: #2d3a52 transparent;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #2d3a52;
    border-radius: 3px;
  }
`;

const MainContent = styled.main`
  display: flex;
  flex-direction: column;
  background: #f9fafb;
  width: 100%;
  box-sizing: border-box;
`;

const ContentArea = styled.div`
  flex: 1;
  overflow-y: auto;
  width: 100%;
  box-sizing: border-box;
`;

export default function AdminLayout({ children }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
    if (!isLoading && isAuthenticated && user?.role !== 'admin') {
      router.push('/dashboard');
    }
  }, [isAuthenticated, isLoading, user, router]);

  if (isLoading) {
    return (
      <AdminLayoutContainer>
        <MainContent>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            Loading...
          </div>
        </MainContent>
      </AdminLayoutContainer>
    );
  }

  return (
    <>
      <Header />
      <AdminLayoutContainer>
        <SidebarWrapper>
          <AdminSidebar user={user} />
        </SidebarWrapper>
        <MainContent>

          <ContentArea>
            {children}
          </ContentArea>
        </MainContent>
      </AdminLayoutContainer>
    </>
  );
}
