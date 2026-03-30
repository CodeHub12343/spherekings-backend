'use client';

import styled from 'styled-components';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  DollarSign,
  TrendingUp,
  Settings,
  LogOut,
  BarChart3,
  FileText,
  Store,
  Gift
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
  border-bottom: 1px solid #2d3a52;
  margin-bottom: 24px;

  h1 {
    margin: 0;
    font-size: 18px;
    font-weight: 700;
    color: #fff;
  }

  p {
    margin: 4px 0 0 0;
    font-size: 12px;
    color: #9ca3af;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    max-width: 230px;
  }
`;

const NavGroup = styled.div`
  margin-bottom: 16px;
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
  color: #6b7280;
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
  color: #c7d2e0;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;

  svg {
    width: 18px;
    height: 18px;
  }

  &:hover {
    background: rgba(91, 77, 255, 0.1);
    color: #5b4dff;
  }

  &.active {
    background: rgba(91, 77, 255, 0.15);
    color: #5b4dff;
    font-weight: 600;
    border-left: 3px solid #5b4dff;
    padding-left: 9px;
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
  color: #f87171;
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
    background: rgba(248, 113, 113, 0.1);
    color: #ff6b6b;
  }
`;

const ADMIN_MENU = [
  {
    group: 'Analytics',
    items: [
      { label: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
    ]
  },
  {
    group: 'Management',
    items: [
      { label: 'Products', href: '/admin/products', icon: Package },
      { label: 'Orders', href: '/admin/orders', icon: ShoppingCart },
      { label: 'Commissions', href: '/admin/commissions', icon: DollarSign },
      { label: 'Payouts', href: '/admin/payouts', icon: TrendingUp },
      { label: 'Retail Locations', href: '/admin/retail-locations', icon: Store },
      { label: 'Raffles', href: '/admin/raffle', icon: Gift },
      { label: 'Categories', href: '/admin/categories', icon: FileText },
    ]
  },
  {
    group: 'Partnerships',
    items: [
      { label: 'Sponsorships', href: '/admin/sponsorship/records', icon: TrendingUp },
      { label: 'Influencers', href: '/admin/influencer/applications', icon: Users },
    ]
  }
];

export default function AdminSidebar({ user }) {
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
        <h1>🔧 Admin</h1>
        <p>{user?.email}</p>
      </Logo>

      {ADMIN_MENU.map((group) => (
        <NavGroup key={group.group}>
          <NavGroupTitle>{group.group}</NavGroupTitle>
          {group.items.map((item) => (
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
      ))}

      <NavGroup>
        <LogoutButton onClick={handleLogout}>
          <LogOut size={18} />
          Logout
        </LogoutButton>
      </NavGroup>
    </SidebarContainer>
  );
}
