'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  BarChart3,
  PieChart,
  DollarSign,
  Settings,
  LogOut,
  TrendingUp,
  Users,
  Zap
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

const SidebarContainer = styled.div`
  padding: 24px 0;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const Logo = styled.div`
  padding: 0 20px 24px;
  border-bottom: 1px solid #e5e7eb;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #5b4dff;
  }
`;

const NavGroup = styled.div`
  margin-bottom: 24px;
  padding: 0 12px;

  &:last-of-type {
    margin-top: auto;
  }
`;

const NavGroupTitle = styled.div`
  padding: 0 12px 12px;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: #9ca3af;
  letter-spacing: 0.5px;
`;

const NavLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  text-decoration: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: #f3f4f6;
    color: #5b4dff;
  }

  &.active {
    background: #f0f0ff;
    color: #5b4dff;
    font-weight: 600;
  }
`;

const LogoutButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 12px;
  margin-bottom: 4px;
  border-radius: 6px;
  border: none;
  background: transparent;
  color: #dc2626;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  width: 100%;
  text-align: left;
  font-family: inherit;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: #fee2e2;
    color: #b91c1c;
  }
`;

const MENU_ITEMS = [
  { label: 'Dashboard', href: '/affiliate/dashboard', icon: BarChart3 },
  { label: 'Analytics', href: '/affiliate/analytics', icon: TrendingUp },
  { label: 'Commissions', href: '/affiliate/commissions', icon: DollarSign },
  { label: 'Payouts', href: '/affiliate/payouts', icon: PieChart },
];

export default function AffiliateSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const isActive = (href) => {
    return pathname.includes(href.split('/')[2]);
  };

  return (
    <SidebarContainer>
      <Logo>
        <h1>Spherekings</h1>
      </Logo>

      <NavGroup>
        <NavGroupTitle>Menu</NavGroupTitle>
        {MENU_ITEMS.map((item) => (
          <NavLink
            key={item.href}
            href={item.href}
            className={isActive(item.href) ? 'active' : ''}
          >
            <item.icon size={18} />
            {item.label}
          </NavLink>
        ))}
      </NavGroup>

      <NavGroup>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </LogoutButton>
      </NavGroup>
    </SidebarContainer>
  );
}
