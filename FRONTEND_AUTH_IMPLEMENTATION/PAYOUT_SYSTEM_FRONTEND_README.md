# Payout Management System - Frontend Implementation Guide

## Overview

Complete production-ready frontend implementation for the **Affiliate Payout System** in the Spherekings Marketplace. This guide covers the architecture, API integration, component usage, and deployment considerations.

---

## Table of Contents

1. [Project Structure](#project-structure)
2. [Architecture Overview](#architecture-overview)
3. [API Integration](#api-integration)
4. [State Management](#state-management)
5. [Components](#components)
6. [Pages](#pages)
7. [Usage Examples](#usage-examples)
8. [Performance Optimization](#performance-optimization)
9. [Security Considerations](#security-considerations)
10. [Troubleshooting](#troubleshooting)

---

## Project Structure

```
src/
├── api/
│   ├── services/
│   │   └── payoutService.js          # All API endpoint calls
│   └── hooks/
│       └── usePayouts.js             # React Query hooks
├── stores/
│   └── payoutStore.js               # Zustand global state
├── components/
│   └── payouts/
│       ├── PayoutStatusBadge.jsx     # Status display badge
│       ├── PayoutStatsCards.jsx      # Statistics cards
│       ├── PayoutTable.jsx           # Payout list table
│       ├── PayoutFilters.jsx         # Filter interface
│       ├── PayoutRequestForm.jsx     # Form for new requests
│       ├── PayoutModals.jsx          # Admin action modals
│       └── BatchPayoutProcessingPanel.jsx # Batch operations
├── app/
│   ├── affiliate/
│   │   └── payouts/
│   │       ├── page.jsx              # Affiliate list page
│   │       ├── request/
│   │       │   └── page.jsx          # Request payout form
│   │       └── [payoutId]/
│   │           └── page.jsx          # Payout detail
│   └── admin/
│       └── payouts/
│           ├── page.jsx              # Admin dashboard
│           ├── pending/
│           │   └── page.jsx          # Approval queue
│           └── [payoutId]/
│               └── page.jsx          # Admin detail view
└── utils/
    └── payoutUtils.js               # Utility functions
```

---

## Architecture Overview

### Technology Stack

- **Framework**: Next.js 16+ with React 18+
- **State Management**: 
  - Zustand (client state & filters)
  - React Query (server state & caching)
- **Styling**: Styled-components
- **HTTP Client**: Axios
- **Form Handling**: React Hook Form (optional, integrated in components)
- **Validation**: Zod schemas (recommended for forms)

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Components                           │
│  (AffiliatePayoutsPage, AdminPayoutsPage, etc.)        │
└────────────────────┬────────────────────────────────────┘
                     │
        ┌────────────┴────────────┐
        │                         │
        ▼                         ▼
┌───────────────────┐   ┌─────────────────┐
│  React Query      │   │  Zustand Store  │
│  (Server State)   │   │  (Client State) │
│                   │   │                 │
│ - useAllPayouts   │   │ - filters       │
│ - usePayoutDetail │   │ - modals        │
│ - usePending      │   │ - selections    │
│ - mutations       │   │ - batch ops     │
└────────┬──────────┘   └────────┬────────┘
         │                       │
         │        ┌──────────────┘
         │        │
         ▼        ▼
┌────────────────────────────────────┐
│    Payout API Service              │
│  (payoutService.js)                │
│                                    │
│ - requestPayout()                  │
│ - getAffiliatePayouts()            │
│ - getAllPayouts()                  │
│ - approvePayout()                  │
│ - processPayout()                  │
│ - etc.                             │
└────────────┬─────────────────────┘
             │
             ▼
    ┌──────────────────┐
    │  Backend API     │
    │  /api/payouts... │
    └──────────────────┘
```

---

## API Integration

### Service Layer Setup

**File**: `src/api/services/payoutService.js`

The service layer handles all HTTP communication:

```javascript
import PayoutService from '@/api/services/payoutService';

// Affiliate endpoints
const payouts = await PayoutService.getAffiliatePayouts({ page: 1, limit: 20 });
const stats = await PayoutService.getAffiliatePayoutStats();
const payout = await PayoutService.getPayoutDetail(payoutId);
await PayoutService.requestPayout(payoutData);

// Admin endpoints
const allPayouts = await PayoutService.getAllPayouts(filters);
await PayoutService.approvePayout(payoutId, notes);
await PayoutService.processPayout(payoutId, stripeConnectId);
await PayoutService.rejectPayout(payoutId, reason, details);
const pending = await PayoutService.getPendingPayouts();
const ready = await PayoutService.getReadyPayouts();
await PayoutService.batchApprovePayout(payoutIds, notes);
await PayoutService.batchProcessPayout(payoutIds, stripeConnectId);
```

### Authentication

All API requests automatically include the Bearer token from localStorage:

```javascript
// Interceptor adds token to all requests
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## State Management

### Zustand Store

**File**: `src/stores/payoutStore.js`

#### Affiliate Filters

```javascript
const filters = useAffiliateFilters();
// {
//   page: 1,
//   limit: 20,
//   status: '',
//   dateFrom: '',
//   dateTo: ''
// }

const { setAffiliateFilters, resetAffiliateFilters } = usePayoutStore();
setAffiliateFilters({ status: 'completed', page: 1 });
```

#### Admin Filters

```javascript
const filters = useAdminFilters();
// {
//   page: 1,
//   limit: 20,
//   status: '',
//   affId: '',
//   method: '',
//   dateFrom: '',
//   dateTo: ''
// }
```

#### Modal Management

```javascript
const {
  openApprovalModal,
  closeApprovalModal,
  openProcessingModal,
  closeProcessingModal,
  openRejectionModal,
  closeRejectionModal,
  modals
} = usePayoutStore();

// Open modal for specific payout
openApprovalModal(payoutId);

// Check if modal is open
if (modals.approvalModal.isOpen) { ... }
```

#### Batch Operations

```javascript
const batchSelection = useBatchSelection();
// {
//   selected: ['id1', 'id2', ...],
//   selectAll: false,
//   totalCount: 2
// }

const { toggleBatchSelection, setBatchSelection, clearBatchSelection } = usePayoutStore();

// Toggle single selection
toggleBatchSelection(payoutId);

// Set multiple selections
setBatchSelection([id1, id2, id3]);

// Clear all selections
clearBatchSelection();
```

---

## Components

### PayoutStatusBadge

Displays payout status with color coding.

```javascript
import PayoutStatusBadge from '@/components/payouts/PayoutStatusBadge';

<PayoutStatusBadge status="pending" showDot />
// Outputs: "Awaiting Approval" badge with dot indicator

// Status values: pending, approved, processing, completed, failed, cancelled
```

### PayoutStatsCards

Displays statistics summary cards.

```javascript
import PayoutStatsCards from '@/components/payouts/PayoutStatsCards';

<PayoutStatsCards stats={{
  totalPayouts: 150,
  pendingCount: 5,
  approvedCount: 10,
  completedCount: 135,
  totalPaidOut: 12500.00,
  totalPending: 3500.00
}} />
```

### PayoutTable

Payout list table with pagination, selection, and actions.

```javascript
import PayoutTable from '@/components/payouts/PayoutTable';

<PayoutTable
  payouts={payoutData}
  pagination={{ page: 1, limit: 20, total: 100, pages: 5 }}
  selectedIds={[]}
  onSelectChange={(ids) => console.log(ids)}
  onPageChange={(page) => console.log(page)}
  onRowClick={(payout) => navigate(`/payouts/${payout._id}`)}
  onAction={(action, payoutId) => console.log(action, payoutId)}
  actions={['view', 'approve', 'process', 'reject']}
  isLoading={false}
/>
```

### PayoutFilters

Filter interface for payouts.

```javascript
import PayoutFilters from '@/components/payouts/PayoutFilters';

<PayoutFilters
  filters={{
    status: 'pending',
    dateFrom: '2026-01-01',
    dateTo: '2026-01-31',
    limit: 20
  }}
  onFilterChange={(newFilters) => console.log(newFilters)}
  onApply={() => console.log('Apply')}
  onReset={() => console.log('Reset')}
  isLoading={false}
  isAdmin={true}
/>
```

### PayoutRequestForm

Form for affiliates to request payouts.

```javascript
import PayoutRequestForm from '@/components/payouts/PayoutRequestForm';

<PayoutRequestForm
  availableBalance={5000}
  onSubmit={(formData) => {
    // formData = {
    //   amount: 500,
    //   method: 'bank_transfer',
    //   beneficiary: {...},
    //   notes: ''
    // }
  }}
  isLoading={false}
  onCancel={() => navigate(-1)}
/>
```

### PayoutModals

Admin action modals (approval, processing, rejection).

```javascript
import {
  ApprovalModal,
  ProcessingModal,
  RejectionModal
} from '@/components/payouts/PayoutModals';

// Approval Modal
<ApprovalModal
  isOpen={true}
  payoutId="12345"
  notes=""
  isLoading={false}
  error={null}
  onApprove={({ payoutId, notes }) => {...}}
  onClose={() => {...}}
/>

// Processing Modal
<ProcessingModal
  isOpen={true}
  payoutId="12345"
  stripeConnectId=""
  isLoading={false}
  error={null}
  onProcess={({ payoutId, stripeConnectId }) => {...}}
  onClose={() => {...}}
/>

// Rejection Modal
<RejectionModal
  isOpen={true}
  payoutId="12345"
  reason=""
  details=""
  isLoading={false}
  error={null}
  onReject={({ payoutId, reason, details }) => {...}}
  onClose={() => {...}}
/>
```

### BatchPayoutProcessingPanel

Interface for batch payout operations.

```javascript
import BatchPayoutProcessingPanel from '@/components/payouts/BatchPayoutProcessingPanel';

<BatchPayoutProcessingPanel
  selectedIds={['id1', 'id2', 'id3']}
  totalAmount={1500}
  operationType="approve"  // or "process"
  isProcessing={false}
  progress={{ successCount: 0, failureCount: 0, currentProgress: 0 }}
  onApprove={(ids, notes) => {...}}
  onProcess={(ids, stripeConnectId) => {...}}
  onClear={() => {...}}
/>
```

---

## Pages

### Affiliate Pages

#### `/affiliate/payouts` - Payout List

```javascript
// Features:
// - Display all payouts with filters
// - Statistics cards
// - Pagination
// - Link to request new payout
// - View individual payouts
```

#### `/affiliate/payouts/request` - Request Payout

```javascript
// Features:
// - Form to submit payout request
// - Form validation
// - Display available balance
// - Beneficiary information collection
// - Error handling and success message
```

#### `/affiliate/payouts/[payoutId]` - Payout Detail

```javascript
// Features:
// - Display full payout details
// - Status timeline
// - Beneficiary information
// - Payment details (when available)
// - Status history
```

### Admin Pages

#### `/admin/payouts` - Admin Dashboard

```javascript
// Features:
// - System statistics cards
// - Advanced filters (status, method, date range, affiliate)
// - Paginated payout table
// - Batch selection and operations
// - Modal actions (approve, process, reject)
// - Batch processing panel
```

#### `/admin/payouts/pending` - Approval Queue

```javascript
// Features:
// - Pending payouts only (status = pending)
// - Approval queue counter
// - Batch approval interface
// - Approve/Reject modals
// - Auto-reload queue
```

#### `/admin/payouts/[payoutId]` - Admin Detail View

```javascript
// Features:
// - Full payout details
// - Admin action buttons
// - Approve, Process, Reject modals
// - Status history
// - Affiliate information
```

---

## Usage Examples

### Affiliate: View Payouts

```javascript
import { useAffiliatePayouts } from '@/api/hooks/usePayouts';

function MyPayouts() {
  const filters = useAffiliateFilters();
  const { data, isLoading } = useAffiliatePayouts(filters, {
    enabled: isAuthenticated
  });

  return (
    <div>
      {isLoading && <p>Loading...</p>}
      <PayoutTable payouts={data?.payouts} />
    </div>
  );
}
```

### Affiliate: Request Payout

```javascript
import { useRequestPayout } from '@/api/hooks/usePayouts';
import PayoutRequestForm from '@/components/payouts/PayoutRequestForm';

function RequestPayoutPage() {
  const mutation = useRequestPayout({
    onSuccess: () => navigate('/affiliate/payouts')
  });

  return (
    <PayoutRequestForm
      availableBalance={5000}
      onSubmit={(data) => mutation.mutate(data)}
      isLoading={mutation.isPending}
    />
  );
}
```

### Admin: Approve Payout

```javascript
import { useApprovePayout } from '@/api/hooks/usePayouts';

function ApprovePayoutsModal({ payoutId, onClose }) {
  const mutation = useApprovePayout({
    onSuccess: () => {
      onClose();
      // Query will auto-invalidate
    }
  });

  return (
    <ApprovalModal
      isOpen={true}
      payoutId={payoutId}
      onApprove={({ payoutId, notes }) => {
        mutation.mutate({ payoutId, notes });
      }}
      onClose={onClose}
    />
  );
}
```

### Admin: Batch Process

```javascript
import { useBatchProcessPayout } from '@/api/hooks/usePayouts';

function BatchProcessPayouts() {
  const batchSelection = useBatchSelection();
  const mutation = useBatchProcessPayout({
    onSuccess: () => clearBatchSelection()
  });

  return (
    <BatchPayoutProcessingPanel
      selectedIds={batchSelection.selected}
      onProcess={(ids, stripeId) => {
        mutation.mutate({ payoutIds: ids, stripeConnectId: stripeId });
      }}
    />
  );
}
```

---

## Performance Optimization

### React Query Caching

```javascript
// Default cache times:
// - Affiliate payouts: 5 minutes
// - System stats: 5 minutes
// - Pending payouts: 2 minutes (more frequent updates)

// Manual cache invalidation after actions:
useApprovePayout({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['payouts', 'admin'] });
  }
});
```

### Component Memoization

```javascript
import { useCallback } from 'react';

// Memoize filter change handlers
const handleFilterChange = useCallback((newFilters) => {
  setFilters(newFilters);
}, []);

// Memoize action handlers
const handleApprove = useCallback(({ payoutId, notes }) => {
  mutation.mutate({ payoutId, notes });
}, [mutation]);
```

### Pagination

```javascript
// Table displays 20, 50, or 100 items per page
// Only one page loaded at a time
// Prevents loading entire dataset

<PayoutTable
  pagination={{
    page: 1,
    limit: 50,  // Configurable
    total: 1000,
    pages: 20
  }}
/>
```

### Lazy Loading

```javascript
// Pages only query when enabled
useAffiliatePayouts(filters, {
  enabled: isAuthenticated && !authLoading
});

// Prevents unnecessary requests during auth check
```

---

## Security Considerations

### Authentication

- ✅ JWT Bearer token required for all requests
- ✅ Automatic redirect to login on 401 Unauthorized
- ✅ Token stored in localStorage (accessible via JS)
- ⚠️  Consider moving token to httpOnly cookie for REST APIs

```javascript
// Check authentication before rendering
if (!isAuthenticated) {
  return <Redirect to="/login" />;
}
```

### Authorization

- ✅ Affiliate pages check user role
- ✅ Admin pages check role === 'admin'
- ✅ API endpoints validate role server-side

```javascript
// Client-side check
if (user?.role !== 'admin') {
  router.push('/');
  return null;
}
```

### Data Privacy

- ✅ Account numbers masked in display (show last 4 digits only)
- ✅ Beneficiary information only shown to owner/admin
- ✅ Sensitive data not logged

```javascript
// Mask account number
<DetailValue>****{payout.request.beneficiary.accountNumber?.slice(-4)}</DetailValue>
```

### Form Validation

- ✅ Client-side validation on request form
- ✅ Amount cannot exceed available balance
- ✅ Required fields marked clearly

```javascript
validateForm() {
  if (formData.amount > availableBalance) {
    errors.amount = 'Amount exceeds available balance';
  }
}
```

---

## Troubleshooting

### Common Issues

**Issue: Hook ordering error in AdminPayoutsPage**

```
Error: Rendered more hooks than during previous render
```

**Solution**: Ensure all hooks are declared BEFORE any conditional returns.

```javascript
// ✅ CORRECT
function Page() {
  const data = useQuery(...);  // Hook first
  const mutation = useMutation(...);  // All hooks here
  
  if (!isAuthenticated) return null;  // Then condition
  
  return <div>...</div>;
}

// ❌ WRONG
function Page() {
  if (!isAuthenticated) return null;  // Condition first
  
  const data = useQuery(...);  // Hook after condition - ERROR!
}
```

**Issue: PayoutsData is undefined**

```javascript
// Check if data exists before accessing
const payouts = payoutData?.payouts || [];
const total = payoutData?.pagination?.total || 0;
```

**Issue: Batch operation not updating**

```javascript
// Ensure query invalidation
useBatchApprovePayout({
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ['payouts', 'admin'] });
  }
});
```

**Issue: Modals not showing**

```javascript
// Check modal state in store
console.log(modals.approvalModal.isOpen);  // Should be true

// Ensure onClose properly closes modal
closeApprovalModal();  // Resets state
```

**Issue: Filters not persisting**

```javascript
// Zustand store persists filters to localStorage
// Clear with reset function
usePayoutStore.getState().resetAffiliateFilters();
```

---

## Environment Variables

Create `.env.local`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api
```

---

## API Response Formats

### Success Response

```json
{
  "success": true,
  "data": {
    "payouts": [...],
    "pagination": { "page": 1, "limit": 20, "total": 100, "pages": 5 }
  }
}
```

### Error Response

```json
{
  "success": false,
  "message": "Failed to fetch payouts",
  "error": "FETCH_ERROR"
}
```

---

## Deployment Checklist

- ✅ Environment variables configured
- ✅ API base URL correct for environment
- ✅ Authentication working (tokens valid)
- ✅ All pages load without errors
- ✅ Responsive design tested on mobile
- ✅ Cross-browser compatibility verified
- ✅ Performance metrics acceptable
- ✅ Security scan passed
- ✅ Error boundaries in place
- ✅ Loading states display correctly

---

## Support & Resources

- Backend API: `/api/payouts...`
- Payout Model: MongoDB with status lifecycle
- Related Systems: Commission System, Auth System
- Contact: [Backend team]

---

**Last Updated**: March 15, 2026  
**Version**: 1.0.0 - Production Ready
