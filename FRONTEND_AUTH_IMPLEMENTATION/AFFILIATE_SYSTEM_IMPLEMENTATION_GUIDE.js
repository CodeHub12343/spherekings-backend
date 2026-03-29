/**
 * AFFILIATE SYSTEM IMPLEMENTATION GUIDE
 * Complete production-ready frontend affiliate system
 * 
 * This guide covers implementation, usage, and integration patterns
 * for the complete affiliate system.
 */

/*
===============================================================================
1. ARCHITECTURE OVERVIEW
===============================================================================

The affiliate system is built with a layered architecture:

┌─────────────────────────────────────────────────────────────┐
│                    Pages (Next.js Routes)                   │
├─────────────────────────────────────────────────────────────┤
│ - /affiliate/register       - Registration form             │
│ - /affiliate/dashboard      - Main dashboard               │
│ - /affiliate/analytics      - Performance analytics        │
│ - /affiliate/settings       - Payout configuration         │
│ - /leaderboard              - Public leaderboard           │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│            UI Components (Styled Components)                │
├─────────────────────────────────────────────────────────────┤
│ - AffiliateStatusBadge      - Status display               │
│ - ReferralLinkCard          - Copy-to-clipboard link       │
│ - ReferralClicksTable       - Click history               │
│ - AffiliateSalesTable       - Sales with commissions       │
│ - CommissionSummaryCard     - Earnings breakdown           │
│ - AffiliateAnalyticsCharts  - Performance charts           │
│ - PayoutSettingsForm        - Payout method config        │
│ - LeaderboardTable          - Top affiliates ranking       │
│ - ReferralTracker           - URL parameter tracking       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│        Custom Hooks (React Query + Zustand)                 │
├─────────────────────────────────────────────────────────────┤
│ Data Fetching:                                              │
│ - useAffiliateDashboard()   - Fetch dashboard data         │
│ - useAffiliateReferrals()   - Fetch referrals w/pagination │
│ - useAffiliateSales()       - Fetch sales w/filtering      │
│ - useAffiliateAnalytics()   - Fetch analytics data         │
│ - useAffiliateLeaderboard() - Fetch public leaderboard     │
│                                                             │
│ Mutations:                                                  │
│ - useRegisterAffiliate()    - Register as affiliate        │
│ - useUpdatePayoutSettings() - Update payout method        │
│ - useTrackReferralClick()   - Track clicks (public)        │
│                                                             │
│ Combined:                                                   │
│ - useAffiliate()            - All data hooks combined       │
│ - useAffiliateRegistration() - Registration flow           │
│ - useAffiliatePayoutFlow()   - Payout settings flow        │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│      State Management (Zustand Store + React Query)         │
├─────────────────────────────────────────────────────────────┤
│ Zustand Store (affiliateStore):                            │
│ - Profile data                                              │
│ - Dashboard data                                            │
│ - Pagination states                                         │
│ - Loading/error states                                      │
│                                                             │
│ React Query:                                                │
│ - API response caching                                      │
│ - Background refetching                                     │
│ - Paginated queries                                         │
│ - Mutation management                                       │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│           API Service Layer (Axios)                         │
├─────────────────────────────────────────────────────────────┤
│ 8 Functions:                                                │
│ - registerAffiliate()       - POST /api/v1/affiliate/reg   │
│ - getAffiliateDashboard()   - GET /api/v1/affiliate/dash   │
│ - getAffiliateReferrals()   - GET /api/v1/affiliate/refs   │
│ - getAffiliateSales()       - GET /api/v1/affiliate/sales  │
│ - getAffiliateAnalytics()   - GET /api/v1/affiliate/analytics
│ - updatePayoutSettings()    - POST /api/v1/affiliate/payout
│ - getAffiliateLeaderboard() - GET /api/v1/leaderboard      │
│ - trackReferralClick()      - GET /api/v1/tracking/click   │
└─────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────┐
│         Backend APIs (Express/MongoDB)                      │
├─────────────────────────────────────────────────────────────┤
│ Public:     /api/v1/tracking/click, /api/v1/leaderboard   │
│ Auth:       /api/v1/affiliate/* (6 endpoints)             │
│ Admin:      /api/v1/admin/affiliate/* (2 endpoints)       │
└─────────────────────────────────────────────────────────────┘

===============================================================================
2. QUICK START SETUP
===============================================================================

A. Install Required Dependencies (if not already present)
   $ npm install zustand @tanstack/react-query axios styled-components lucide-react

B. Add ReferralTracker to Your App Root (layout.jsx or app wrapper)
   
   import { ReferralTracker } from '@/components/affiliate';
   
   export default function RootLayout({ children }) {
     return (
       <html>
         <body>
           <ReferralTracker /> {/* Add here - tracks ?ref= parameter */}
           {children}
         </body>
       </html>
     );
   }

C. Ensure Axios Interceptor Has JWT Token
   
   The system assumes axios is configured with:
   - JWT Bearer token in Authorization header
   - Base URL set to your API endpoint
   
   Example configuration in next.config or api setup:
   
   ```javascript
   import axios from 'axios';
   import useAuthStore from '@/stores/authStore';
   
   const apiClient = axios.create({
     baseURL: process.env.NEXT_PUBLIC_API_URL,
   });
   
   apiClient.interceptors.request.use((config) => {
     const token = useAuthStore.getState().token;
     if (token) {
       config.headers.Authorization = `Bearer ${token}`;
     }
     return config;
   });
   ```

===============================================================================
3. COMPONENT USAGE EXAMPLES
===============================================================================

Example 1: Dashboard Page
───────────────────────────

import { useAffiliateDashboard } from '@/hooks/useAffiliates';
import {
  CommissionSummaryCard,
  ReferralLinkCard,
  AffiliateAnalyticsCharts,
} from '@/components/affiliate';

export default function Dashboard() {
  const { dashboard, isLoading, error } = useAffiliateDashboard();

  if (isLoading) return <div>Loading...</div>;
  if (!dashboard) return <div>Not registered</div>;

  return (
    <div>
      <CommissionSummaryCard earnings={dashboard.earnings} />
      <ReferralLinkCard
        referralUrl={dashboard.referralUrl}
        affiliateCode={dashboard.affiliateCode}
        stats={dashboard.stats}
      />
      <AffiliateAnalyticsCharts />
    </div>
  );
}


Example 2: Referrals Table with Pagination
────────────────────────────────────────────

import { useAffiliateReferrals } from '@/hooks/useAffiliates';
import { ReferralClicksTable } from '@/components/affiliate';

export default function ReferralsPage() {
  const {
    referrals,
    pagination,
    isLoading,
    setPage,
    convertedOnly,
    setConvertedOnly,
  } = useAffiliateReferrals({ page: 1, limit: 20 });

  return (
    <ReferralClicksTable
      referrals={referrals}
      pagination={pagination}
      onPageChange={setPage}
      onFilterConvertedOnly={setConvertedOnly}
      convertedOnly={convertedOnly}
      isLoading={isLoading}
    />
  );
}


Example 3: Payout Settings Form
────────────────────────────────

import { useAffiliatePayoutFlow } from '@/hooks/useAffiliates';
import { PayoutSettingsForm } from '@/components/affiliate';

export default function SettingsPage() {
  const {
    handleUpdatePayout,
    isLoading,
    isSuccess,
    error,
  } = useAffiliatePayoutFlow();

  return (
    <PayoutSettingsForm
      initialData={{
        payoutMethod: 'stripe',
        payoutData: {},
        minimumThreshold: 50,
      }}
      onSubmit={async (formData) => {
        await handleUpdatePayout(
          formData.payoutMethod,
          formData.payoutData,
          formData.minimumThreshold
        );
      }}
      isLoading={isLoading}
      successMessage={isSuccess ? 'Settings updated!' : null}
      errorMessage={error}
    />
  );
}


Example 4: Public Leaderboard
──────────────────────────────

import { useAffiliateLeaderboard } from '@/hooks/useAffiliates';
import { LeaderboardTable } from '@/components/affiliate';

export default function LeaderboardPage() {
  const [sortBy, setSortBy] = useState('totalEarnings');
  const { affiliates, isLoading } = useAffiliateLeaderboard({
    limit: 50,
    sortBy,
  });

  return (
    <LeaderboardTable
      affiliates={affiliates}
      sortBy={sortBy}
      onSortChange={setSortBy}
      isLoading={isLoading}
    />
  );
}


Example 5: Referral Registration
────────────────────────────────

import { useRegisterAffiliate } from '@/hooks/useAffiliates';

export default function RegisterPage() {
  const { registerAffiliate, isLoading, error } = useRegisterAffiliate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    registerAffiliate({
      marketingChannels: 'Instagram, Blog',
      website: 'https://mysite.com',
      expectedMonthlyReferrals: '100',
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* form fields */}
      <button disabled={isLoading}>Register</button>
      {error && <div>{error}</div>}
    </form>
  );
}

===============================================================================
4. REFERRAL TRACKING FLOW
===============================================================================

How Referral Tracking Works:
────────────────────────────

1. User visits / with ?ref=AFFILIATE_CODE parameter
   Example: https://sphere-of-kings.com/?ref=AFF12ABC456DEF

2. ReferralTracker component (in root layout) detects the parameter
   - Automatically called on page mount
   - No user action needed

3. Calls trackReferralClick() API endpoint (public - no auth required)

4. Backend:
   - Records the click
   - Sets secure cookies for attribution
   - Returns tracking ID and affiliate info

5. Cookies persist through entire session

6. When user checks out, backend associates purchase with affiliate code

7. Commission generated automatically


Implementation Checklist:
────────────────────────

□ Add <ReferralTracker /> to app root layout
□ Ensure useSearchParams hook available (Next.js 13+)
□ Add tracking parameter to affiliate links
□ Test with: https://yoursite.com/?ref=YOUR_AFFILIATE_CODE
□ Verify cookies set in browser DevTools
□ Test checkout flow with affiliate code
□ Verify commissions appear in dashboard

===============================================================================
5. STATE MANAGEMENT
===============================================================================

Zustand Store Structure (affiliateStore.js):
─────────────────────────────────────────────

const useAffiliateStore = create((set, get) => ({
  // Data
  profile: null,
  dashboard: null,
  referrals: [],
  sales: [],
  analytics: null,
  leaderboard: [],
  
  // Pagination
  referralsPagination: { page: 1, limit: 20, total: 0, pages: 0 },
  salesPagination: { page: 1, limit: 20, total: 0, pages: 0 },
  
  // Loading states
  isDashboardLoading: false,
  isReferralsLoading: false,
  isSalesLoading: false,
  isAnalyticsLoading: false,
  isSettingsUpdating: false,
  isLeaderboardLoading: false,
  isRegistering: false,
  
  // Error states
  error: null,
  errorDetails: null,
  
  // Actions (15+)
  fetchDashboard: async (options) => { /* ... */ },
  fetchReferrals: async (options) => { /* ... */ },
  fetchSales: async (options) => { /* ... */ },
  fetchAnalytics: async (options) => { /* ... */ },
  updatePayoutSettings: async (data) => { /* ... */ },
  registerAffiliate: async (data) => { /* ... */ },
  fetchLeaderboard: async (options) => { /* ... */ },
  setProfile: (profile) => { /* ... */ },
  clearError: () => { /* ... */ },
  reset: () => { /* ... */ },
}));

// Selectors (10+)
export const useAffiliateDashboard = () => { /* ... */ };
export const useAffiliateReferrals = () => { /* ... */ };
export const useAffiliateSales = () => { /* ... */ };
export const useAffiliateAnalytics = () => { /* ... */ };
export const useAffiliateProfile = () => { /* ... */ };
export const useAffiliateError = () => { /* ... */ };


React Query Integration:
────────────────────────

- All data hooks use React Query for caching
- Query keys organized by feature (dashboard, referrals, sales, etc.)
- Stale times set to prevent excessive refetches
- useShallow for selector memoization
- Automatic refetching on focus/visibility change


Cache Strategy:
───────────────

Dashboard:        staleTime: 5min,  gcTime: 10min
Referrals:        staleTime: 2min,  gcTime: 5min
Sales:            staleTime: 2min,  gcTime: 5min
Analytics:        staleTime: 5min,  gcTime: 10min
Leaderboard:      staleTime: 10min, gcTime: 20min

===============================================================================
6. COMMISSION STATES & AFFILIATE STATUSES
===============================================================================

Commission States Flowchart:
────────────────────────────

Order Placed
    ↓
Commission Generated (pending)
    ↓
Approval Process
    ↓
    ├─→ Commission Approved (approved)
    │       ↓
    │   Reaches Threshold
    │       ↓
    │   Payout Processed (paid)
    │
    └─→ Commission Reversed (reversed)

Commission Status Badges:
- pending:   Yellow badge - awaiting approval
- approved:  Blue badge - ready for payout
- paid:      Green badge - successfully paid
- reversed:  Red badge - commission cancelled


Affiliate Status Flow:
──────────────────────

Registration
    ↓
pending (email verification needed)
    ↓
active (verified, can earn commissions)
    ├─→ suspended (policy violation)
    └─→ inactive (user requested deactivation)


Status Meanings:
- pending:    Can't earn commissions yet, awaiting verification
- active:     Fully verified, earning commissions
- suspended:  Disabled due to fraud or policy violation
- inactive:   Temporarily or permanently disabled by user

===============================================================================
7. ERROR HANDLING & VALIDATION
===============================================================================

API Error Handling:
───────────────────

try {
  const data = await affiliateService.getAffiliateDashboard();
} catch (error) {
  // error structure:
  // {
  //   message: 'User message',
  //   status: 401|403|404|500,
  //   details: 'Technical details'
  // }
}


Form Validation:
────────────────

PayoutSettingsForm validates:
- Requires payout method selection
- Email validation for Stripe/PayPal
- Bank details for bank transfers
- Minimum threshold >= $1
- Displays field-level error messages


Data Validation:
────────────────

Referral tracking silently fails for:
- Network errors
- Invalid affiliate codes
- Rate limiting

These don't throw exceptions, allowing graceful degradation

===============================================================================
8. PRODUCTION CHECKLIST
===============================================================================

Before deploying to production:

□ API Configuration
  □ Backend URLs correct for environment
  □ JWT token interceptor configured
  □ CORS settings allow requests
  □ Rate limiting acceptable

□ Component Setup
  □ ReferralTracker in root layout
  □ React Query QueryProvider in app wrapper
  □ Zustand store available globally
  □ Styled-components theme provider configured

□ Environmental Variables
  □ NEXT_PUBLIC_API_URL set
  □ Payment gateway keys configured
  □ Email notification system ready

□ Testing
  □ Registration flow tested end-to-end
  □ Referral tracking tested (?ref=CODE)
  □ Dashboard loads correctly
  □ Pagination working
  □ Form submissions working
  □ Error states displaying correctly
  □ Mobile responsive on all pages
  □ Performance metrics acceptable

□ Security
  □ JWT tokens handled securely
  □ Password fields use type="password"
  □ Bank details masked/hidden
  □ XSS protection enabled (React default)
  □ No sensitive data in URLs
  □ Rate limiting on tracking endpoint

□ Analytics & Monitoring
  □ Error tracking configured
  □ Performance monitoring enabled
  □ API call logging in place
  □ User action tracking for analytics

□ Documentation
  □ This guide completed
  □ API documentation up-to-date
  □ Deployment procedures documented
  □ Rollback procedures prepared

===============================================================================
9. COMMON ISSUES & SOLUTIONS
===============================================================================

Issue: Dashboard not loading
Solution: 
- Check if user is authenticated
- Verify API endpoint correct
- Check console for network errors
- Ensure JWT token in Authorization header

Issue: Referral clicks not tracking
Solution:
- Verify ?ref= parameter in URL
- Check ReferralTracker in layout
- Verify useSearchParams available
- Check browser cookies are enabled
- Review Network tab for tracking endpoint calls

Issue: Commission calculations off
Solution:
- Verify commission rate in affiliate model
- Check order status (should be "paid" for commission)
- Verify conversion rate calculation formula
- Check for manual reversals in admin

Issue: Payout form not submitting
Solution:
- Verify all required fields filled
- Check form validation rules
- Verify API endpoint accessible
- Check console for validation errors

Issue: Pagination buttons disabled
Solution:
- Verify pagination data from API
- Check limit and page parameters
- Ensure total count correct from backend
- Verify pages calculated correctly (pages = total/limit)

===============================================================================
10. PERFORMANCE OPTIMIZATION
===============================================================================

Current Optimizations:
- React Query caching with stale times
- Zustand selectors with useShallow
- Pagination to reduce list sizes
- Lazy loading pages with Next.js
- Styled-components for CSS-in-JS efficiency

Further Optimizations:
- Implement virtual scrolling for large lists
- Add search debouncing on tables
- Implement infinite scroll pagination
- Add image optimization for avatars
- Monitor bundle size regularly

===============================================================================
11. CUSTOMIZATION GUIDE
===============================================================================

To customize commission rates by affiliate:
────────────────────────────────────────────

1. Backend: Update Affiliate model to include custom rate
2. Frontend: Add rate field to affiliate profile
3. Update commission calculation with custom rate
4. Add admin interface to set rates per affiliate


To add new payout method:
─────────────────────────

1. Backend: Add method to payout methods enum
2. Frontend: Add radio option in PayoutSettingsForm
3. Add method-specific fields component
4. Update validation for new fields
5. Update affiliateService to handle new method


To add custom analytics:
────────────────────────

1. Backend: Add new analytics endpoint
2. Frontend: Add useAffiliateCustomAnalytics hook
3. Create custom chart component
4. Add to analytics page
5. Implement caching strategy

===============================================================================
12. SUPPORT & CONTACT
===============================================================================

For issues or questions:
- Review console errors and network tab
- Check this documentation
- Review component prop types
- Inspect React DevTools for state
- Use Network tab to debug API calls
- Check backend logs for API errors

*/

export default {
  // This file is documentation only
  version: '1.0.0',
  lastUpdated: '2024-03-13',
};
