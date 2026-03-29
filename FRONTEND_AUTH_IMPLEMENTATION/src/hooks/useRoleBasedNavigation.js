'use client';

import { useMemo } from 'react';

/**
 * Hook to get navigation menu items based on user role
 * Returns different menu structures for guest, affiliate, and admin users
 */
export function useRoleBasedNavigation(user, affiliateStatus) {
  return useMemo(() => {
    if (!user) {
      // Guest user menu
      return [
        {
          section: 'Browse',
          items: [
            { label: 'Products', icon: '🛍️', href: '/products' },
            { label: 'Leaderboard', icon: '🏆', href: '/leaderboard' },
          ],
        },
        {
          section: 'Shopping',
          items: [
            { label: 'Cart', icon: '🛒', href: '/cart' },
            { label: 'Become Affiliate', icon: '💰', href: '/affiliate/register' },
          ],
        },
      ];
    }

    if (user.role === 'admin') {
      // Admin user menu
      return [
        {
          section: 'Dashboard',
          items: [
            { label: 'Dashboard', icon: '📊', href: '/admin/dashboard' },
            { label: 'Analytics', icon: '📈', href: '/admin/analytics' },
          ],
        },
        {
          section: 'Store Management',
          items: [
            { label: 'Products', icon: '📦', href: '/admin/products' },
            { label: 'Orders', icon: '📋', href: '/admin/orders' },
            { label: 'Inventory', icon: '📍', href: '/admin/inventory' },
          ],
        },
        {
          section: 'Affiliate Management',
          items: [
            { label: 'Affiliates', icon: '👥', href: '/admin/affiliates' },
            { label: 'Commissions', icon: '💵', href: '/admin/commissions' },
            { label: 'Payouts', icon: '💸', href: '/admin/payouts' },
          ],
        },
        {
          section: 'Account',
          items: [
            { label: 'Settings', icon: '⚙️', href: '/admin/settings' },
            { label: 'Logout', icon: '🚪', href: '/logout', action: 'logout' },
          ],
        },
      ];
    }

    if (affiliateStatus === 'active') {
      // Affiliate user menu
      return [
        {
          section: 'Dashboard',
          items: [
            { label: 'Dashboard', icon: '📊', href: '/affiliate/dashboard' },
            { label: 'Analytics', icon: '📈', href: '/affiliate/analytics' },
          ],
        },
        {
          section: 'Earnings',
          items: [
            { label: 'Referrals', icon: '🔗', href: '/affiliate/referrals' },
            { label: 'Sales', icon: '💰', href: '/affiliate/referrals/sales' },
            { label: 'Commissions', icon: '💵', href: '/affiliate/commissions' },
            { label: 'Payouts', icon: '🏦', href: '/affiliate/payouts' },
          ],
        },
        {
          section: 'Account',
          items: [
            { label: 'Settings', icon: '⚙️', href: '/affiliate/settings' },
            { label: 'Logout', icon: '🚪', href: '/logout', action: 'logout' },
          ],
        },
      ];
    }

    // Regular authenticated user (not affiliate, not admin)
    return [
      {
        section: 'Shopping',
        items: [
          { label: 'Products', icon: '🛍️', href: '/products' },
          { label: 'Cart', icon: '🛒', href: '/cart' },
          { label: 'Orders', icon: '📋', href: '/account/orders' },
        ],
      },
      {
        section: 'Account',
        items: [
          { label: 'Profile', icon: '👤', href: '/account/profile' },
          { label: 'Become Affiliate', icon: '💰', href: '/affiliate/register' },
          { label: 'Settings', icon: '⚙️', href: '/account/settings' },
          { label: 'Logout', icon: '🚪', href: '/logout', action: 'logout' },
        ],
      },
    ];
  }, [user, affiliateStatus]);
}
