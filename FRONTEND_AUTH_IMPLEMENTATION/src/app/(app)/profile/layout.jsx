'use client';

import { useEffect } from 'react';
import styled from 'styled-components';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// ==================== STYLED COMPONENTS ====================

const ProfileContainer = styled.div`
  min-height: 100vh;
  background-color: #f9fafb;
  padding: 24px 16px;

  @media (min-width: 768px) {
    padding: 32px 24px;
  }

  @media (min-width: 1024px) {
    padding: 32px 0;
  }
`;

const ProfileWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr;
  gap: 32px;

  @media (min-width: 1024px) {
    grid-template-columns: 280px 1fr;
    gap: 48px;
  }
`;

const SidebarNav = styled.nav`
  display: flex;
  gap: 8px;
  flex-direction: row;
  overflow-x: auto;
  padding-bottom: 12px;
  margin-bottom: 16px;

  @media (max-width: 1023px) {
    padding-bottom: 8px;
    margin-bottom: 24px;
    -webkit-overflow-scrolling: touch;
    scrollbar-width: thin;
    
    &::-webkit-scrollbar {
      height: 4px;
    }
    
    &::-webkit-scrollbar-track {
      background: #e5e7eb;
      border-radius: 2px;
    }
    
    &::-webkit-scrollbar-thumb {
      background: #9ca3af;
      border-radius: 2px;
      
      &:hover {
        background: #6b7280;
      }
    }
  }

  @media (min-width: 1024px) {
    flex-direction: column;
    gap: 0;
    margin-bottom: 0;
    padding-bottom: 0;
    overflow-x: visible;
  }
`;

const NavItem = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: all 0.2s ease;
  white-space: nowrap;
  border: 1px solid transparent;

  @media (min-width: 1024px) {
    padding: 12px 16px;
    border-radius: 8px;
    width: 100%;
  }

  &:hover {
    background-color: #f3f4f6;
    color: #5b4dff;
  }

  &[data-active='true'] {
    background-color: #ede9fe;
    color: #5b4dff;
    border-color: #d8d0ff;
    font-weight: 600;
  }
`;

const NavItemBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 20px;
  height: 20px;
  padding: 0 6px;
  border-radius: 10px;
  background-color: #10b981;
  color: white;
  font-size: 11px;
  font-weight: 700;
  margin-left: auto;
`;

const MainContent = styled.div`
  min-height: 600px;
`;

const Breadcrumb = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 24px;
  font-size: 14px;
  color: #6b7280;
`;

const BreadcrumbLink = styled.a`
  color: #5b4dff;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: #4c3fcc;
    text-decoration: underline;
  }
`;

const BreadcrumbSeparator = styled.span`
  color: #d1d5db;
`;

// ==================== COMPONENT ====================

export default function ProfileLayout({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <ProfileContainer>
        <ProfileWrapper>
          <div>Loading...</div>
        </ProfileWrapper>
      </ProfileContainer>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  // Determine active navigation item based on current path
  const getCurrentPath = () => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('/profile/orders')) return 'orders';
      if (path.includes('/profile/settings')) return 'settings';
      if (path.includes('/profile/address')) return 'address';
      if (path.includes('/profile/wishlist')) return 'wishlist';
      return 'profile';
    }
    return 'profile';
  };

  const currentPath = getCurrentPath();

  return (
    <ProfileContainer>
      <ProfileWrapper>
        {/* Sidebar Navigation */}
        <SidebarNav>
          <NavItem href="/profile/orders" data-active={currentPath === 'orders'}>
            📦 Orders
          </NavItem>
        </SidebarNav>

        {/* Main Content */}
        <MainContent>
          <Breadcrumb>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            <BreadcrumbSeparator>/</BreadcrumbSeparator>
            <span>Profile</span>
          </Breadcrumb>
          {children}
        </MainContent>
      </ProfileWrapper>
    </ProfileContainer>
  );
}
