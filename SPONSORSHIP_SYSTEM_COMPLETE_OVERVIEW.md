# Sponsorship System - Complete Overview

## Executive Summary

The sponsorship system is a two-sided marketplace feature that allows brands/companies to purchase video mentions from the content creators. Users discover sponsorship opportunities on the homepage, browse available tiers, complete a Stripe-based checkout, and track their sponsorships. Admins manage sponsorship tiers and delivery status.

---

## 1. FRONTEND FLOW - User Journey

### 1.1 Discovery - Homepage (`/`)

**Where it appears:**
- The `SponsorshipShowcase` component is embedded in the main homepage in [src/app/page.jsx](src/app/page.jsx#L10)
- It appears as a marketing section between other features (after DualCTA, before FAQ)

**What's displayed:**
- **Section title:** "Promote Your Brand Through Video Mentions"
- **Description:** "Get guaranteed video mentions across our popular social media platforms. Simple pricing, flexible packages, and measurable results."
- **Featured tiers:** Shows top 3 sponsorship tiers (sorted by `displayOrder`)
- **Call-to-action:** 
  - "View All" button on each tier card
  - "View All Sponsorship Tiers" button below
  - All CTAs route to `/sponsorship/tiers`

**Behavior:**
```
User clicks "View All Sponsorship Tiers" 
  ↓ (routes to /sponsorship/tiers)
```

---

### 1.2 Browse Tiers Page (`/sponsorship/tiers`)

**Location:** [src/app/sponsorship/tiers/page.jsx](src/app/sponsorship/tiers/page.jsx)

**What's displayed:**
1. **Header**
   - Title: "Sponsorship Tiers"
   - Subheading about flexible packages and measurable results

2. **Tier cards in grid layout**
   - Shows all active sponsorship tiers
   - Cards are sorted by `displayOrder`
   - Featured tier gets special styling (elevated, different border color)

3. **Each tier card displays:**
   - Tier icon (emoji)
   - Tier name
   - Tier slug (uppercase, small)
   - Price (formatted as $X.XX one-time)
   - Video mentions count with 🎬 emoji
   - Cost per mention
   - Benefits summary paragraph
   - Benefits list (up to 10 items, marked with ✓)
   - Description text
   - "Choose Plan" button

4. **Call-to-action section**
   - "Have Questions?" section
   - "Contact Us" button routes to `/contact`

**Data displayed from tier:**
```javascript
{
  _id: ObjectId,
  name: string,                 // e.g., "Starter"
  slug: string,                 // e.g., "starter"
  price: number,                // in cents (e.g., 50000 = $500)
  videoMentions: number,        // e.g., 5
  benefitsSummary: string,      // "Quick turnaround, direct content..."
  benefits: [string],           // ["Feature in intro", "Logo in description", ...]
  description: string,          // Detailed tier description
  featured: boolean,            // If true, shows special styling
  displayOrder: number,         // Sort order
  icon: string,                 // Emoji like "👑"
  cardColor: string,            // Background color
  badgeText: string,            // "MOST POPULAR"
  active: boolean,              // Whether tier is available
  maxSponsors: number | null,   // null = unlimited
  sponsorCount: number          // Current count
}
```

---

### 1.3 Purchase Modal

**Triggered by:** Clicking "Choose Plan" on any tier

**Modal fields:** (collected from user)
1. **Your Name** * (required)
   - Pre-filled with authenticated user's name
2. **Email Address** * (required)
   - Pre-filled with authenticated user's email
   - Format: email validation required
3. **Company** (optional)
   - Text field for company name

**Modal displays:**
- Price summary: "$X.XX"
- Video count: "N mentions included"
- Cancel/Proceed buttons

**Validation:**
- Name must be non-empty
- Email must be non-empty

**Authentication check:**
- If user not authenticated → toast shows "Please sign in to purchase a sponsorship"
- Redirects to `/login`

---

### 1.4 Checkout & Payment Flow

**Trigger:** User completes modal and clicks "Proceed"

**API Call:** [useInitiatePurchase hook](src/api/hooks/useSponsorship.js#L48)
```
POST /api/sponsorship/purchase
{
  tierId: tier._id,
  sponsorName: string,
  sponsorEmail: string,
  sponsorCompany?: string
}
```

**Backend response contains:**
- `sessionId`: Stripe session ID
- `checkoutUrl`: Complete Stripe checkout URL

**User flow:**
```
Click "Proceed" in modal
  ↓
initiatePurchase() API call
  ↓
Validates tier exists, is active, has capacity
  ↓
Creates pending SponsorshipRecord (status: 'pending_payment')
  ↓
Creates Stripe checkout session
  ↓
Redirects window to Stripe checkout: window.location.href = checkoutUrl
```

**Stripe integration:**
- Uses Stripe checkout (hosted)
- Success URL: `/sponsorship/success?session_id={SESSION_ID}&record_id={RECORD_ID}`
- Cancel URL: `/sponsorship/tiers`

---

### 1.5 Success Page (`/sponsorship/success`)

**Location:** [src/app/sponsorship/success/page.jsx](src/app/sponsorship/success/page.jsx)

**Triggered after:** Successful Stripe payment (redirects to this page)

**URL params:**
- `session_id`: Stripe checkout session ID
- `record_id`: SponsorshipRecord ID (passed as metadata in Stripe session)

**What's displayed:**

1. **Success animation**
   - Checkmark icon (✓) with bounce animation
   - "Payment Confirmed!" heading
   - "Your sponsorship has been activated. Our team will begin posting video mentions across our platforms."

2. **Sponsorship info section**
   - Sponsorship Tier name
   - Sponsorship Amount: $X.XX
   - Video Count: N videos
   - Status badge (completed, active, in_progress, pending_payment, failed)

3. **Timeline section** (shows sponsorship delivery timeline)
   - "Payment Confirmed" (✓ completed)
   - "Promotion Starts" (start date)
   - "Videos Begin" (estimated)
   - "Promotion Ends" (end date)
   - "All Delivered" (final status, uncompleted initially)

4. **Action buttons**
   - "View My Sponsorships" → `/my-sponsorships`
   - "Explore More Tiers" → `/sponsorship/tiers`

**Data source:**
- Uses [useSponsorshipRecord hook](src/api/hooks/useSponsorship.js#L92) to fetch by recordId

---

### 1.6 My Sponsorships Page (`/sponsorship/my-sponsorships`)

**Location:** [src/app/sponsorship/my-sponsorships/page.jsx](src/app/sponsorship/my-sponsorships/page.jsx)

**Authentication:** Requires login
- Shows message "Please Sign In" if not authenticated
- Links to `/login`

**What's displayed:**

1. **Header**
   - "My Sponsorships" title
   - "Buy More" button → `/sponsorship/tiers`

2. **Sponsorship cards grid** (one per purchased sponsorship)

Each card shows:
- **Status badge** (color-coded by status)
  - `completed`: Green (#ecfdf5)
  - `active`: Purple (#eef2ff)
  - `in_progress`: Orange (#fef3c7)
  - `pending_payment`: Gray (#f3f4f6)
  - `failed`: Red (#fee2e2)

- **Left border** (indicates status with color)

- **Tier info**
  - Tier name
  - Amount: $X.XX
  - Videos included: N

- **Campaign progress**
  - Progress bar: `videosCompleted / videoMentions`
  - Percentage display: "X / N videos"
  - Promotion dates: "Start → End"

**Data fields per sponsorship:**
```javascript
{
  _id: ObjectId,
  tierName: string,
  amount: number,              // in cents
  videoMentions: number,       // total videos
  videosCompleted: number,     // completed so far
  status: string,              // pending_payment, active, in_progress, completed, failed
  paymentStatus: string,       // pending, completed, failed, refunded
  promotionStartDate: Date,    // when promotion starts
  promotionEndDate: Date,      // when promotion ends
  createdAt: Date,
  tierId: ref -> SponsorshipTier
}
```

**Empty state:** "No Active Sponsorships" with CTA to view tiers

---

## 2. API INTEGRATION

### 2.1 Service Layer

**File:** [src/api/services/sponsorshipService.js](src/api/services/sponsorshipService.js)

**API Base URL:** `/sponsorship`

**Exported functions:**

| Function | Method | Endpoint | Auth | Returns |
|----------|--------|----------|------|---------|
| `getTiers(params)` | GET | `/sponsorship/tiers` | No | { success, data: Tier[] } |
| `getTier(tierId)` | GET | `/sponsorship/tiers/:id` | No | { success, data: Tier } |
| `initiatePurchase(data)` | POST | `/sponsorship/purchase` | Yes | { success, sessionId, checkoutUrl } |
| `getMySponsorships()` | GET | `/sponsorship/my-sponsorships` | Yes | { success, data: SponsorshipRecord[] } |
| `listRecords(params)` | GET | `/sponsorship/records` | Admin | { success, data, pagination } |
| `getRecord(recordId)` | GET | `/sponsorship/records/:id` | Admin | { success, data: Record } |
| `addVideoLink(recordId, videoData)` | PUT | `/sponsorship/records/:id/add-video` | Admin | { success, message } |
| `updateStatus(recordId, statusData)` | PUT | `/sponsorship/records/:id/status` | Admin | { success, message } |
| `createTier(tierData)` | POST | `/sponsorship/tiers` | Admin | { success, data: Tier } |
| `updateTier(tierId, tierData)` | PUT | `/sponsorship/tiers/:id` | Admin | { success, data: Tier } |

---

### 2.2 React Hooks

**File:** [src/api/hooks/useSponsorship.js](src/api/hooks/useSponsorship.js)

**Cache key factory:**
```javascript
sponsorshipKeys = {
  all: ['sponsorship'],
  tiers: () => [..., 'tiers'],
  tiersList: (params) => [..., 'tiers', { params }],
  tier: (id) => [..., 'tier', id],
  mySponsorships: () => [..., 'my-sponsorships'],
  records: () => [..., 'records'],
  recordsList: (params) => [..., 'records', { params }],
  record: (id) => [..., 'record', id],
}
```

**Stale times & GC:**
- Tier lists: stale 10min, GC 20min
- Tier detail: stale 5min, GC 15min
- My sponsorships: stale 3min, GC 10min
- Records list: stale 2min, GC 10min
- Record detail: stale 2min, GC 10min

**Available hooks:**

1. **useSponsorshipTiers(params)**
   - Fetches all tiers
   - Returns: `{ data, isLoading, error }`

2. **useSponsorshipTier(tierId)**
   - Fetches single tier
   - Enabled only if `tierId` provided

3. **useInitiatePurchase()**
   - Mutation for purchase
   - Invalidates `mySponsorships` on success
   - Returns: `{ mutate, isPending }`

4. **useMySponsorships()**
   - Requires authentication
   - Returns: `{ data, isLoading, error }`

5. **useSponsorshipRecordsList(params)**
   - Admin only
   - Returns: `{ data, isLoading, error }`

6. **useSponsorshipRecord(recordId)**
   - Fetch single record for admin
   - Enabled only if `recordId` provided

7. **useAddVideoLink()**
   - Admin mutation to add video URLs
   - Invalidates records list on success

8. **useUpdateSponsorshipStatus()**
   - Admin mutation to change status
   - Invalidates records list on success

---

### 2.3 Data Flow - Purchase

```
Frontend                          Backend                    Stripe
─────────────────────────────────────────────────────────────────

User fills modal
    ↓
Click "Proceed"
    ↓
useInitiatePurchase() ────────→ POST /sponsorship/purchase
                               ├─ Validate purchase data
                               ├─ Check tier exists & active
                               ├─ Check capacity (maxSponsors)
                               ├─ Create pending SponsorshipRecord
                               ├─ Create Stripe checkout session ─────→ Stripe
                               │                                        (session)
                               └─ Return { sessionId, checkoutUrl } ────┐
                                  (includes recordId in metadata)       │
                                                                        │
User redirected to Stripe checkout ←──────────────────────────────────┘
    ↓
User completes payment on Stripe ───────────────────────→ Stripe processes
    ↓
Stripe redirects to success URL with session_id ←────────┘
    ↓
Frontend: /sponsorship/success?session_id={ID}&record_id={ID}
    ↓
useSponsorshipRecord(recordId) ──────→ GET /sponsorship/records/{recordId}
                                       └─ Fetch updated record (paymentStatus now 'completed')
    ↓
Display success page with sponsorship details
```

**Webhook flow:**
- Stripe → Backend: POST `/sponsorship/webhook`
- Updates SponsorshipRecord payment status
- Sets `paidAt` timestamp
- Calculates `promotionStartDate` and `promotionEndDate`

---

## 3. DATA MODELS & STRUCTURE

### 3.1 SponsorshipTier Model

**Collection:** `sponsorship_tiers`

**Base fields:**
```javascript
{
  // Tier Information
  name: string,                // unique, min 3 chars, max 50
  slug: string,                // unique, lowercase
  price: number,               // in cents, min $1 = 100
  videoMentions: number,       // min 1
  
  // Benefits
  benefitsSummary: string,     // max 300 chars
  benefits: [string],          // 1-10 items, 10-150 chars each
  description: string,         // max 1000 chars
  
  // Delivery
  defaultDeliveryDays: number, // default 45, range 7-365
  campaignCycle: string,       // e.g., "kickstarter_2026_q2"
  
  // Display & Marketing
  featured: boolean,           // special styling on frontend
  displayOrder: number,        // sort order
  icon: string,                // emoji like "👑"
  badgeText: string,           // e.g., "MOST POPULAR"
  cardColor: string,           // hex color or tailwind class
  
  // Admin Controls
  active: boolean,             // default true
  deprecated: boolean,         // soft delete
  maxSponsors: number | null,  // null = unlimited
  sponsorCount: number,        // tracks current sponsors
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

**Virtuals:**
- `canAddMore`: boolean - can add more sponsors (if maxSponsors not reached)
- `fillPercentage`: number - (sponsorCount / maxSponsors) * 100

**Indexes:**
- `{ active: 1, featured: 1, displayOrder: 1 }`
- `{ campaignCycle: 1, active: 1 }`
- `{ slug: 1, name: 1 }`

---

### 3.2 SponsorshipRecord Model

**Collection:** `sponsorship_records`

**Sponsor Information:**
```javascript
sponsorName: string,           // min 2, max 100 chars
sponsorEmail: string,          // lowercase, indexed
sponsorCompany: string | null, // optional, max 100 chars
sponsorUserId: ObjectId | null // ref to User if authenticated
```

**Sponsorship Tier Info:**
```javascript
tierId: ObjectId,              // ref to SponsorshipTier
tierName: string,              // denormalized (for history)
tierSlug: string,              // denormalized
```

**Amount & Videos:**
```javascript
amount: number,                // in cents, min $1 = 100
currency: string,              // default "USD"
videoMentions: number,         // total videos committed
videosCompleted: number,       // delivered so far, default 0
videosRemaining: number,       // calculated: videoMentions - videosCompleted
```

**Payment Information:**
```javascript
stripeSessionId: string,       // unique, indexed, required
stripePaymentIntentId: string | null,
paymentStatus: enum,           // 'pending' | 'completed' | 'failed' | 'refunded'
paidAt: Date | null,           // when payment confirmed
refundedAt: Date | null,       // when refund processed
refundReason: string | null,   // if refunded
```

**Delivery Tracking:**
```javascript
promotionStartDate: Date | null, // when videos start
promotionEndDate: Date | null,   // when videos end
videosCompleted: number,         // progress tracking
videosRemaining: number,         // remaining to deliver
completedAt: Date | null,        // when all deliverables done
```

**Status & Tracking:**
```javascript
status: enum,                  // 'pending_payment' | 'active' | 'in_progress' | 'completed' | 'failed'
videoLinks: [{
  platform: string,            // e.g., "youtube", "tiktok"
  url: string,
  uploadedAt: Date,
  viewCount: number | null
}]
```

**Timestamps:**
```javascript
createdAt: Date,
updatedAt: Date
```

**Virtuals:**
- `isOverdue`: boolean - promotionEndDate has passed
- `progressPercentage`: number - (videosCompleted / videoMentions) * 100

**Indexes:**
- `{ sponsorEmail: 1, createdAt: -1 }`
- `{ paymentStatus: 1, status: 1 }`
- `{ tierName: 1, createdAt: -1 }`
- `{ promotionStartDate: 1, promotionEndDate: 1 }`
- `{ stripeSessionId: 1 }` (unique)

---

## 4. SPONSORSHIP TYPES & PRICING

### 4.1 Tier Structure

All tiers share the same structure but differ in:

| Aspect | Details |
|--------|---------|
| **Price** | Fixed one-time payment (in cents) |
| **Videos Included** | Number of video mentions (calculated from price/10000) |
| **Benefits** | List of perks specific to tier |
| **Capacity** | Optional max sponsors limit |
| **Delivery Timeline** | Default 45 days, can be customized |

### 4.2 Tier Example Data

```javascript
// Example: "Starter" Tier
{
  name: "Starter",
  slug: "starter",
  price: 50000,                    // $500
  videoMentions: 5,                // 5 videos
  benefitsSummary: "Perfect for emerging brands looking to build awareness",
  benefits: [
    "Feature in video intro (3-5 seconds)",
    "Logo placement in video description",
    "Brand mention in outro",
    "Social media post shoutout",
    "Email newsletter feature"
  ],
  description: "Our entry-level sponsorship package...",
  featured: false,
  displayOrder: 1,
  icon: "⭐",
  cardColor: "white",
  maxSponsors: 50,
  sponsorCount: 23
}

// Example: "Premium" Tier
{
  name: "Premium",
  slug: "premium",
  price: 150000,                   // $1500
  videoMentions: 15,               // 15 videos
  benefitsSummary: "Ideal for established brands seeking maximum exposure",
  benefits: [
    "Featured 15-second intro segment",
    "Multiple logo placements",
    "Dedicated video series (3 episodes)",
    "Blog feature + backlinks",
    "Weekly social media mentions",
    "Direct contact with content team"
  ],
  featured: true,                  // "MOST POPULAR" badge
  displayOrder: 2,
  badgeText: "MOST POPULAR",
  icon: "👑",
  cardColor: "#f0f9ff",
  maxSponsors: null,               // unlimited
  sponsorCount: 127
}
```

### 4.3 Pricing Metrics

```
Price per mention = Price / Video Mentions
Example: $500 tier with 5 videos = $100 per mention
Example: $1500 tier with 15 videos = $100 per mention

Typical calculation:
- Entry tier: $500 (5 videos) = $100/video
- Mid tier: $1000 (10 videos) = $100/video  
- Premium tier: $1500 (15 videos) = $100/video
```

---

## 5. USER EXPERIENCE FLOW - Complete Journey

### 5.1 Anonymous User (not logged in)

```
1. Lands on homepage
   ↓
2. Sees SponsorshipShowcase with featured tiers
   ↓
3. Clicks "View All Sponsorship Tiers"
   ↓
4. Browses all tiers on /sponsorship/tiers
   ↓
5. Clicks "Choose Plan" on desired tier
   ↓
6. Modal pops up (form asks for name, email, company)
   ↓
7. Starts filling form
   ↓
8. Clicks "Proceed"
   ↓
9. Toast: "Please sign in to purchase a sponsorship"
   ↓
10. Redirects to /login
   ↓
11. User logs in or registers
   ↓
12. Redirected back to /sponsorship/tiers
   ↓
13. Repeats from step 5 (now authenticated)
```

### 5.2 Authenticated User (full purchase)

```
1. Lands on homepage
   ↓
2. Clicks "View All Sponsorship Tiers" (or navigates directly to /sponsorship/tiers)
   ↓
3. Browses tiers
   ↓
4. Clicks "Choose Plan" on desired tier
   ↓
5. Modal appears:
   - Name: pre-filled from user account
   - Email: pre-filled from user account
   - Company: empty (user can fill optional)
   ↓
6. User reviews and clicks "Proceed"
   ↓
7. useInitiatePurchase() makes API call:
   POST /sponsorship/purchase
   {
     tierId: tier._id,
     sponsorName: user.name,
     sponsorEmail: user.email,
     sponsorCompany: "Acme Corp"
   }
   ↓
8. Backend creates:
   - SponsorshipRecord (status: pending_payment)
   - Stripe checkout session
   ↓
9. window.location.href redirects to Stripe checkout
   ↓
10. User fills Stripe payment form on Stripe's hosted page
   ↓
11. User submits payment
   ↓
12. Stripe processes payment
   ↓
13. Stripe sends webhook to backend:
    POST /sponsorship/webhook
    └─ Updates SponsorshipRecord:
       - paymentStatus: 'completed'
       - paidAt: now
       - promotionStartDate: calculated
       - promotionEndDate: calculated
   ↓
14. Stripe redirects user to success page:
    /sponsorship/success?session_id={ID}&record_id={RECORD_ID}
   ↓
15. useSponsorshipRecord() fetches updated record
   ↓
16. Success page displays:
    - Checkmark animation
    - Sponsorship details
    - Timeline (Payment → Promotion Start → Videos Begin → End)
    ↓
17. User can click:
    - "View My Sponsorships" → /my-sponsorships
    - "Explore More Tiers" → /sponsorship/tiers
```

### 5.3 User Viewing Sponsorships

```
1. User navigates to /my-sponsorships
   ↓
2. Check: Is authenticated?
   - If NO: Show "Please Sign In" with login button
   - If YES: Continue...
   ↓
3. useMySponsorships() fetches:
   GET /sponsorship/my-sponsorships
   └─ Returns all SponsorshipRecords for this user
   ↓
4. Display sponsorship cards in grid:
   - For each sponsorship:
     • Show status badge (color-coded)
     • Show tier name, amount, videos
     • Show progress bar (completed / total)
     • Show promotion date range
   ↓
5. User can:
   - Track delivery progress
   - See which videos delivered
   - View promotion timeline
   ↓
6. Click "Buy More" to purchase additional sponsorships
   ↓
7. Redirects to /sponsorship/tiers
```

---

## 6. ADMIN FEATURES - Sponsorship Management

**Location:** [src/app/(admin)/admin/sponsorship/records/page.jsx](src/app/(admin)/admin/sponsorship/records/page.jsx)

### 6.1 Admin Sponsorship Records Dashboard

**Access:** `/admin/sponsorship/records` (admin only)

**Features:**

1. **Stats cards**
   - Total records
   - Pending payments
   - Total revenue
   - Completion rate

2. **Filter controls**
   - Status filter
   - Payment status filter
   - Tier filter
   - Date range

3. **Records table**
   - Sponsor name
   - Email
   - Tier
   - Amount
   - Status
   - Payment status
   - Videos progress
   - Actions

4. **Actions per record**
   - Add video links (upload YouTube/TikTok URLs)
   - Update status (pending → active → in_progress → completed)
   - View details
   - Edit delivery dates

### 6.2 Admin API Endpoints

**Available admin actions:**

```javascript
// List all records with filtering
GET /sponsorship/records?status=active&paymentStatus=completed&page=1&limit=50

// Get single record
GET /sponsorship/records/:id

// Add video link to sponsorship
PUT /sponsorship/records/:id/add-video
{
  platform: "youtube",      // or "tiktok", "instagram", etc.
  url: "https://youtube.com/watch?v=...",
  viewCount?: number
}

// Update sponsorship status
PUT /sponsorship/records/:id/status
{
  status: "completed"        // or "active", "in_progress", "failed"
}

// Create new sponsorship tier
POST /sponsorship/tiers
{
  name: "Enterprise",
  slug: "enterprise",
  price: 500000,
  videoMentions: 50,
  benefits: [...],
  // ... other fields
}

// Update sponsorship tier
PUT /sponsorship/tiers/:id
{
  // fields to update
}
```

---

## 7. KEY TECHNICAL PATTERNS

### 7.1 Price Handling

**Frontend displays:** Dollars (divide by 100)
```javascript
const priceInDollars = (tier.price / 100).toFixed(2); // $500.00
```

**Backend stores:** Cents
```javascript
price: 50000  // = $500
```

**Conversion:**
- User input $500 → multiply by 100 → store 50000
- Display price → divide by 100 → show $500.00

### 7.2 Status Transitions

```
SponsorshipRecord status flow:

pending_payment (initial, waiting for Stripe confirmation)
    ↓
    ├─ [Payment webhook fails]
    └─> failed
    
    └─ [Payment webhook succeeds]
    └─> active (ready for video production)
        ↓
        ├─> in_progress (videos being posted)
        │   ↓
        │   └─> completed (all videos delivered)
        │
        └─> cancelled (sponsor requested cancellation)
```

### 7.3 Cache Invalidation

**On purchase:**
- Invalidate `mySponsorships` query

**On video link added:**
- Update specific record in cache
- Invalidate records list

**On status update:**
- Update specific record in cache
- Invalidate records list

### 7.4 React Query Patterns

```javascript
// Stale times configured per query type
const useSponsorshipTiers = (params = {}) => {
  return useQuery({
    queryKey: sponsorshipKeys.tiersList(params),
    queryFn: () => sponsorshipService.getTiers(params),
    staleTime: 10 * 60 * 1000,        // 10 min
    gcTime: 20 * 60 * 1000,           // 20 min garbage collection
  });
};

// Mutations with cache updates
const useInitiatePurchase = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: sponsorshipService.initiatePurchase,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: sponsorshipKeys.mySponsorships(),
      });
    },
  });
};
```

---

## 8. COMPONENT HIERARCHY

```
Frontend Structure:

Homepage (src/app/page.jsx)
  └─ SponsorshipShowcase (sections/SponsorshipShowcase.jsx)
     ├─ SponsorshipTierCard (sponsorship/SponsorshipTierCard.jsx) × 3 displayed
     └─ CTA to /sponsorship/tiers

/sponsorship/tiers (app/sponsorship/tiers/page.jsx)
  └─ SponsorshipTierCard × all tiers
  └─ PurchaseModal
     └─ Form (name, email, company)
     └─ Price preview

/sponsorship/success (app/sponsorship/success/page.jsx)
  └─ SuccessCard
     ├─ Status badge
     ├─ InfoSection (tier, amount, videos)
     ├─ TimelineSection (payment → promotion → delivery → complete)
     └─ Action buttons

/sponsorship/my-sponsorships (app/sponsorship/my-sponsorships/page.jsx)
  ├─ Header + "Buy More" button
  └─ SponsorshipCard × each sponsorship
     ├─ Status badge
     ├─ Info grid (amount, videos)
     ├─ Progress bar (completed / total)
     └─ Date range

Admin Dashboard (/admin/sponsorship/records)
  ├─ Stats cards
  ├─ Filter controls
  └─ Records table (with edit/update actions)
```

---

## 9. PAYMENT FLOW DETAILS

### 9.1 Stripe Integration

**Configuration:**
- Uses Stripe checkout (hosted payment page)
- Session-based (not card-in-form)

**Session metadata:**
```javascript
{
  sponsorshipRecordId: recordId,
  tierId: tier._id,
  sponsorEmail: sponsorEmail
}
```

**Success flow:**
1. User completes payment on Stripe
2. Stripe sends webhook to `/sponsorship/webhook`
3. Backend verifies webhook signature
4. Updates `SponsorshipRecord`:
   - `paymentStatus`: 'completed'
   - `paidAt`: now()
   - `promotionStartDate`: now() or configured date
   - `promotionEndDate`: calculated from defaultDeliveryDays
   - `status`: 'active'
5. Redirects user to success page with session_id and record_id

**Cancel flow:**
1. User cancels on Stripe
2. Redirected to `/sponsorship/tiers`
3. `SponsorshipRecord` remains with `paymentStatus: 'pending'`
4. Can retry purchase

### 9.2 Error Handling

**Frontend:**
- Validation: name, email required
- Toast notifications for errors
- Graceful fallbacks if record not found

**Backend:**
- Validates tier exists & is active
- Checks capacity (maxSponsors)
- Validates user data
- Handles Stripe API errors
- Webhook signature verification

---

## 10. SUMMARY TABLE

| Aspect | Implementation |
|--------|-----------------|
| **Discovery** | Homepage SponsorshipShowcase (featured 3 tiers) |
| **Browse** | /sponsorship/tiers (all tiers in grid) |
| **Select** | Click "Choose Plan" → Modal form |
| **Provide info** | Name, Email, Company (email format validated) |
| **Payment** | Stripe hosted checkout via window.location.href |
| **Confirmation** | /sponsorship/success with timeline |
| **View my purchases** | /sponsorship/my-sponsorships (requires auth) |
| **Track progress** | Progress bar (videosCompleted / videoMentions) |
| **Pricing** | Price in cents (backend), dollars (frontend) |
| **Tier types** | All same structure, differ in price/benefits |
| **Benefits** | List of perks specific to tier |
| **Capacity** | Optional maxSponsors limit per tier |
| **Delivery** | Default 45 days, customizable via defaultDeliveryDays |
| **Admin manage** | /admin/sponsorship/records (add videos, update status) |
| **Status flow** | pending_payment → active → in_progress → completed |
| **Cache strategy** | React Query with 2-10 min stale times |

---

## 11. RELATED FILES REFERENCE

### Frontend Files
- [Homepage](FRONTEND_AUTH_IMPLEMENTATION/src/app/page.jsx)
- [Sponsorship Showcase](FRONTEND_AUTH_IMPLEMENTATION/src/components/sections/SponsorshipShowcase.jsx)
- [Tiers Page](FRONTEND_AUTH_IMPLEMENTATION/src/app/sponsorship/tiers/page.jsx)
- [Tier Card](FRONTEND_AUTH_IMPLEMENTATION/src/components/sponsorship/SponsorshipTierCard.jsx)
- [Success Page](FRONTEND_AUTH_IMPLEMENTATION/src/app/sponsorship/success/page.jsx)
- [My Sponsorships](FRONTEND_AUTH_IMPLEMENTATION/src/app/sponsorship/my-sponsorships/page.jsx)
- [Admin Records](FRONTEND_AUTH_IMPLEMENTATION/src/app/(admin)/admin/sponsorship/records/page.jsx)

### API Files
- [Service](FRONTEND_AUTH_IMPLEMENTATION/src/api/services/sponsorshipService.js)
- [Hooks](FRONTEND_AUTH_IMPLEMENTATION/src/api/hooks/useSponsorship.js)

### Backend Files
- [Models: SponsorshipTier](src/models/SponsorshipTier.js)
- [Models: SponsorshipRecord](src/models/SponsorshipRecord.js)
- [Controller](src/controllers/sponsorshipController.js)
- [Routes](src/routes/sponsorshipRoutes.js)
- [Validators](src/validators/sponsorshipValidator.js)

---

## Conclusion

The sponsorship system is a complete marketplace feature enabling brands to purchase video mentions from content creators. It features:

✅ **User-friendly discovery** via homepage showcase  
✅ **Detailed tier browsing** with filterable options  
✅ **Secure Stripe payments** with session-based checkout  
✅ **Real-time delivery tracking** with progress visualization  
✅ **Admin control** over tier management and video delivery  
✅ **Robust status management** from purchase to delivery  
✅ **Efficient caching** with React Query  

Users can discover → Browse → Purchase → Track → View sponsorships in a seamless, intuitive flow.
