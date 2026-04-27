'use client';

import { useState, useEffect } from 'react';
import styled from 'styled-components';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import CartBadge from '@/components/cart/CartBadge';
import { useAuth } from '@/contexts/AuthContext';

// ===== STYLED COMPONENTS =====

const HeaderContainer = styled.header`
  background: white;
  border-bottom: 1px solid #e5e7eb;
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
  box-sizing: border-box;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  width: 100%;
  margin: 0 auto;
  padding: 16px 20px;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 40px;
  position: relative;
  box-sizing: border-box;

  @media (max-width: 640px) {
    padding: 12px 16px;
    justify-content: space-between;
    gap: 12px;
  }
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 24px;
  flex-shrink: 0;
  position: absolute;
  left: 20px;

  @media (max-width: 640px) {
    gap: 12px;
    position: relative;
    left: 0;
  }
`;

const Logo = styled(Link)`
  font-size: 20px;
  font-weight: 700;
  color: #5b4dff;
  text-decoration: none;
  letter-spacing: -0.5px;
  transition: color 0.2s;

  &:hover {
    color: #4940d4;
  }

  @media (max-width: 640px) {
    font-size: 18px;
  }
`;

// Desktop Navigation
const DesktopNav = styled.nav`
  display: flex;
  gap: 40px;
  align-items: center;
  justify-content: center;
  flex: 1;

  @media (max-width: 1024px) {
    gap: 32px;
  }

  @media (max-width: 768px) {
    gap: 24px;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const NavLink = styled(Link)`
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  transition: color 0.2s ease;
  white-space: nowrap;

  &:hover {
    color: #5b4dff;
  }

  &.active {
    color: #5b4dff;
    font-weight: 600;
  }

  @media (max-width: 768px) {
    font-size: 13px;
  }
`;

const RightSection = styled.div`
  display: flex;
  gap: 20px;
  align-items: center;
  flex-shrink: 0;
  position: absolute;
  right: 20px;

  @media (max-width: 640px) {
    gap: 12px;
    position: relative;
    right: 0;
  }
`;

// Mobile Menu Button
const MobileMenuButton = styled.button`
  display: none;
  background: none;
  border: none;
  color: #5b4dff;
  cursor: pointer;
  padding: 8px;
  font-size: 20px;
  transition: color 0.2s;

  &:hover {
    color: #4940d4;
  }

  @media (max-width: 640px) {
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

// Mobile Menu Overlay
const MobileMenuOverlay = styled.div`
  display: none;
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 999;

  @media (max-width: 640px) {
    display: ${props => (props.isOpen ? 'block' : 'none')};
  }
`;

// Mobile Menu Container
const MobileMenu = styled.div`
  display: none;
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: 100%;
  max-width: 300px;
  background: white;
  flex-direction: column;
  z-index: 1000;
  animation: slideIn 0.3s ease-out;

  @keyframes slideIn {
    from {
      transform: translateX(100%);
    }
    to {
      transform: translateX(0);
    }
  }

  @media (max-width: 640px) {
    display: ${props => (props.isOpen ? 'flex' : 'none')};
  }
`;

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e5e7eb;
`;

const MobileMenuClose = styled.button`
  background: none;
  border: none;
  color: #6b7280;
  cursor: pointer;
  padding: 8px;
  font-size: 20px;
  transition: color 0.2s;

  &:hover {
    color: #5b4dff;
  }
`;

const MobileMenuContent = styled.div`
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const MobileNavLink = styled(Link)`
  display: block;
  width: 100%;
  padding: 16px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s, color 0.2s;
  box-sizing: border-box;

  &:hover {
    background-color: #f9fafb;
    color: #5b4dff;
  }

  &.active {
    background-color: #f0f0ff;
    color: #5b4dff;
    font-weight: 600;
  }
`;

const MobileMenuSection = styled.div`
  border-bottom: 1px solid #e5e7eb;
  padding: 12px 0;

  &:last-child {
    border-bottom: none;
  }
`;

const MobileMenuSectionTitle = styled.div`
  padding: 12px 20px;
  font-size: 12px;
  font-weight: 600;
  color: #9ca3af;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

// User Dropdown
const UserDropdownContainer = styled.div`
  position: relative;
`;

const UserMenuButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  padding: 8px 12px;
  cursor: pointer;
  transition: background-color 0.2s, border-color 0.2s;

  &:hover {
    background-color: #f9fafb;
    border-color: #d1d5db;
  }

  @media (max-width: 640px) {
    display: none;
  }
`;

const UserMenuIcon = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #5b4dff 0%, #0f172a 100%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 14px;
`;

const ChevronIcon = styled(ChevronDown)`
  width: 16px;
  height: 16px;
  color: #6b7280;
  transition: transform 0.2s;
  transform: ${props => (props.isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const UserDropdown = styled.div`
  position: absolute;
  top: 100%;
  right: 0;
  margin-top: 8px;
  width: 200px;
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
  display: ${props => (props.isOpen ? 'block' : 'none')};
  z-index: 1000;
  animation: fadeIn 0.2s ease-out;

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-8px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
`;

const DropdownItem = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: none;
  border: none;
  color: #6b7280;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #f9fafb;
    color: #5b4dff;
  }

  &:first-child {
    border-radius: 8px 8px 0 0;
  }

  &:last-child {
    border-radius: 0 0 8px 8px;
    border-top: 1px solid #e5e7eb;
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const DropdownDivider = styled.div`
  height: 1px;
  background-color: #e5e7eb;
  margin: 4px 0;
`;

// Admin Tools Bar
const AdminToolsBar = styled.nav`
  background: #1a2642;
  border-bottom: 1px solid #2d3a52;
  padding: 12px 20px;
  display: flex;
  gap: 8px;
  overflow-x: auto;
  align-items: center;

  @media (max-width: 640px) {
    display: none;
  }

  scrollbar-width: thin;
  scrollbar-color: #2d3a52 transparent;

  &::-webkit-scrollbar {
    height: 4px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: #2d3a52;
    border-radius: 2px;
  }
`;

const AdminToolLink = styled(Link)`
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  color: #d1d5db;
  text-decoration: none;
  white-space: nowrap;
  border-radius: 4px;
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: #2d3a52;
    color: #fff;
  }

  &.active {
    background-color: #5b4dff;
    color: white;
  }
`;

// Collapsible Section Header (Mobile)
const CollapsibleSectionHeader = styled.button`
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  background: #f9fafb;
  border: none;
  border-bottom: 1px solid #e5e7eb;
  font-size: 14px;
  font-weight: 600;
  color: #5b4dff;
  cursor: pointer;
  transition: background-color 0.2s;
  box-sizing: border-box;

  &:hover {
    background-color: #f3f4f6;
  }

  svg {
    width: 18px;
    height: 18px;
    transition: transform 0.2s;
    transform: ${props => (props.isOpen ? 'rotate(180deg)' : 'rotate(0)')};
  }
`;

const CollapsibleSectionContent = styled.div`
  display: ${props => (props.isOpen ? 'block' : 'none')};
  max-height: ${props => (props.isOpen ? 'none' : '0')};
  overflow-y: ${props => (props.isOpen ? 'auto' : 'hidden')};
  transition: max-height 0.3s ease;
  
  /* Allow internal scrolling for long lists */
  @media (max-width: 640px) {
    max-height: ${props => (props.isOpen ? 'calc(100vh - 300px)' : '0')};
  }
`;

const CollapsibleNavLink = styled(Link)`
  display: block;
  width: 100%;
  padding: 14px 20px 14px 36px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  text-decoration: none;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s, color 0.2s;
  box-sizing: border-box;

  &:hover {
    background-color: #f9fafb;
    color: #5b4dff;
  }

  &.active {
    background-color: #f0f0ff;
    color: #5b4dff;
    font-weight: 600;
  }
`;

// ===== HEADER COMPONENT =====

/**
 * Improved Header Component
 * Features:
 * - Full desktop navigation (Dashboard, Products, Affiliate, Leaderboard)
 * - Mobile hamburger menu with full navigation
 * - User dropdown with Profile, Settings, Logout
 * - Responsive design for all screen sizes
 * - Role-aware navigation visibility
 * - Cart badge integration
 * - Auto-hide on auth routes
 */
export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();
  
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserDropdownOpen, setIsUserDropdownOpen] = useState(false);
  const [expandedMobileSection, setExpandedMobileSection] = useState(null);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }

    // Cleanup function to restore scroll on unmount
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isMobileMenuOpen]);

  // Hide header on auth routes
  const authRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));

  if (isAuthRoute) {
    return null;
  }

  // Check if a link is active
  const isActive = (href) => {
    if (href === '/') return pathname === '/';
    return pathname.startsWith(href);
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      setIsUserDropdownOpen(false);
      setIsMobileMenuOpen(false);
      setExpandedMobileSection(null);
      
      await logout();
      
      // Use replace to prevent back button issues and ensure redirect happens
      // Add small delay to ensure auth state is fully cleared
      setTimeout(() => {
        router.replace('/login');
      }, 100);
    } catch (error) {
      console.error('Logout failed:', error);
      // Still redirect even if logout fails
      router.replace('/login');
    }
  };

  // Get user initials for avatar
  const userInitials = user
    ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase()
    : 'U';

  // Check if user is an existing affiliate
  const isAffiliate = user?.role === 'affiliate' || user?.role === 'admin' || user?.affiliateProfile;
  const isAdmin = user?.role === 'admin';
  const isUserLoggedIn = isAuthenticated && user;

  // Admin tools navigation
  const adminTools = [
    { label: 'Analytics', href: '/admin/analytics' },
    { label: 'Dashboard', href: '/admin/dashboard' },
    { label: 'Products', href: '/admin/products' },
    { label: 'Orders', href: '/admin/orders' },
    { label: 'Commissions', href: '/admin/commissions' },
    { label: 'Payouts', href: '/admin/payouts' },
    { label: 'Sponsorships', href: '/admin/sponsorship/records' },
    { label: 'Influencers', href: '/admin/influencer/applications' },
    { label: 'Retail Locations', href: '/admin/retail-locations' },
    { label: 'Raffles', href: '/admin/raffle' },
  ];

  // Navigation items configuration
  const navigationItems = [
    { label: 'Products', href: '/products' },
    { label: 'Sponsorships', href: '/sponsorship/tiers' },
    { label: 'Influencers', href: '/influencer/apply' },
    { label: "Stores", href: '/stores' }
  ];

  // Conditionally add admin link
  const adminItem = isAdmin ? [
    {
      label: 'Admin',
      href: '/admin/dashboard',
      visible: true,
    },
  ] : [];

  // Conditionally add affiliate link
  const affiliateItem = isUserLoggedIn ? [
    {
      label: isAffiliate ? 'Affiliate Dashboard' : 'Become Affiliate',
      href: isAffiliate ? '/affiliate/dashboard' : '/affiliate/register',
      visible: true,
    },
  ] : [];

  // Combine all navigation items
  const visibleNavItems = [...navigationItems, ...adminItem, ...affiliateItem];

  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          {/* Logo */}
          <LogoSection>
            <Logo href="/">
              Spherekings
            </Logo>
          </LogoSection>

          {/* Desktop Navigation */}
          <DesktopNav>
            {visibleNavItems.map((item) => (
              <NavLink
                key={item.href}
                href={item.href}
                className={isActive(item.href) ? 'active' : ''}
              >
                {item.label}
              </NavLink>
            ))}
          </DesktopNav>

          {/* Right Section: Cart + User Menu */}
          <RightSection>
            <CartBadge />

            {/* User Dropdown (Desktop) */}
            {isAuthenticated && (
              <UserDropdownContainer>
                <UserMenuButton
                  onClick={() => setIsUserDropdownOpen(!isUserDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsUserDropdownOpen(false), 150)}
                >
                  <UserMenuIcon title={`${user?.firstName} ${user?.lastName}`}>
                    {userInitials}
                  </UserMenuIcon>
                  <ChevronIcon isOpen={isUserDropdownOpen} />
                </UserMenuButton>

                <UserDropdown isOpen={isUserDropdownOpen}>
                  <DropdownItem
                    onClick={() => {
                      router.push('/profile/orders');
                      setIsUserDropdownOpen(false);
                    }}
                  >
                    <User size={16} />
                    Profile
                  </DropdownItem>
                  <DropdownDivider />
                  <DropdownItem onClick={handleLogout}>
                    <LogOut size={16} />
                    Logout
                  </DropdownItem>
                </UserDropdown>
              </UserDropdownContainer>
            )}

            {/* Mobile Menu Button */}
            <MobileMenuButton
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle mobile menu"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </MobileMenuButton>
          </RightSection>
        </HeaderContent>
      </HeaderContainer>

      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay 
        isOpen={isMobileMenuOpen} 
        onClick={() => {
          setIsMobileMenuOpen(false);
          setExpandedMobileSection(null);
        }} 
      />

      {/* Mobile Menu */}
      <MobileMenu isOpen={isMobileMenuOpen}>
        <MobileMenuHeader>
          <span style={{ fontSize: '16px', fontWeight: '600', color: '#5b4dff' }}>
            Menu
          </span>
          <MobileMenuClose
            onClick={() => setIsMobileMenuOpen(false)}
            aria-label="Close menu"
          >
            <X size={24} />
          </MobileMenuClose>
        </MobileMenuHeader>

        <MobileMenuContent>
          {/* Global Navigation Section */}
          <MobileMenuSection>
            <MobileNavLink
              href="/products"
              className={isActive('/products') ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Products
            </MobileNavLink>
             <MobileNavLink
              href="/stores"
              className={isActive('/stores') ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Stores
            </MobileNavLink>
             <MobileNavLink
              href="/raffle/my-entries"
              className={isActive('/raffle/my-entries') ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              My Entries
            </MobileNavLink>
               </MobileMenuSection>                          

          {/* Sponsorship Section */}
          <MobileMenuSection>
            <MobileNavLink
              href="/sponsorship/tiers"
              className={isActive('/sponsorship') ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Sponsorship Tiers
            </MobileNavLink>
            {isUserLoggedIn && (
              <>
                <MobileNavLink
                  href="/sponsorship/my-sponsorships"
                  className={isActive('/sponsorship/my-sponsorships') ? 'active' : ''}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  My Sponsorships
                </MobileNavLink>
              </>
            )}
          </MobileMenuSection>

          {/* Influencer Section */}
          <MobileMenuSection>
            <MobileNavLink
              href="/influencer/apply"
              className={isActive('/influencer/apply') ? 'active' : ''}
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Become an Influencer
            </MobileNavLink>
            {isUserLoggedIn && (
              <MobileNavLink
                href="/influencer/dashboard"
                className={isActive('/influencer/dashboard') ? 'active' : ''}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Influencer Dashboard
              </MobileNavLink>
            )}
          </MobileMenuSection>

          {/* Account Section - All Users */}
          {isUserLoggedIn && (
            <div>
              <CollapsibleSectionHeader
                onClick={() => setExpandedMobileSection(expandedMobileSection === 'account' ? null : 'account')}
                isOpen={expandedMobileSection === 'account'}
              >
                Account
                <ChevronDown size={18} />
              </CollapsibleSectionHeader>
              <CollapsibleSectionContent isOpen={expandedMobileSection === 'account'}>
                <CollapsibleNavLink
                  href="/profile/orders"
                  className={isActive('/profile/orders') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Profile
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    handleLogout();
                  }}
                  style={{ color: '#dc2626' }}
                >
                  Logout
                </CollapsibleNavLink>
              </CollapsibleSectionContent>
            </div>
          )}

          {/* Affiliate Tools Section - Affiliates Only */}
          {isUserLoggedIn && (
            <div>
              <CollapsibleSectionHeader
                onClick={() => setExpandedMobileSection(expandedMobileSection === 'affiliate' ? null : 'affiliate')}
                isOpen={expandedMobileSection === 'affiliate'}
              >
                Affiliate Tools
                <ChevronDown size={18} />
              </CollapsibleSectionHeader>
              <CollapsibleSectionContent isOpen={expandedMobileSection === 'affiliate'}>
                <CollapsibleNavLink
                  href="/affiliate/dashboard"
                  className={isActive('/affiliate/dashboard') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Dashboard
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/affiliate/analytics"
                  className={isActive('/affiliate/analytics') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Analytics
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/affiliate/commissions"
                  className={isActive('/affiliate/commissions') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Commissions
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/affiliate/payouts"
                  className={isActive('/affiliate/payouts') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Payouts
                </CollapsibleNavLink>
              </CollapsibleSectionContent>
            </div>
          )}

          {/* Admin Tools Section - Admins Only */}
          {isAdmin && (
            <div>
              <CollapsibleSectionHeader
                onClick={() => setExpandedMobileSection(expandedMobileSection === 'admin' ? null : 'admin')}
                isOpen={expandedMobileSection === 'admin'}
              >
                Admin Tools
                <ChevronDown size={18} />
              </CollapsibleSectionHeader>
              <CollapsibleSectionContent isOpen={expandedMobileSection === 'admin'}>
                <CollapsibleNavLink
                  href="/admin/dashboard"
                  className={isActive('/admin/dashboard') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Dashboard
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/products"
                  className={isActive('/admin/products') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Products
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/orders"
                  className={isActive('/admin/orders') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Orders
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/commissions"
                  className={isActive('/admin/commissions') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Commissions
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/payouts"
                  className={isActive('/admin/payouts') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Payouts
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/sponsorship/records"
                  className={isActive('/admin/sponsorship') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Sponsorships
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/influencer/applications"
                  className={isActive('/admin/influencer') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Influencers
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/retail-locations"
                  className={isActive('/admin/retail-location') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Retail Locations
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/raffle"
                  className={isActive('/admin/raffle') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Raffles
                </CollapsibleNavLink>
                <CollapsibleNavLink
                  href="/admin/categories"
                  className={isActive('/admin/categories') ? 'active' : ''}
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setExpandedMobileSection(null);
                  }}
                >
                  Categories
                </CollapsibleNavLink>
              </CollapsibleSectionContent>
            </div>
          )}

          {/* Auth Links - Logged Out Users Only */}
          {!isAuthenticated && (
            <MobileMenuSection>
              <MobileNavLink
                href="/login"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Login
              </MobileNavLink>
              <MobileNavLink
                href="/register"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Register
              </MobileNavLink>
            </MobileMenuSection>
          )}
        </MobileMenuContent>
      </MobileMenu>
    </>
  );
}
