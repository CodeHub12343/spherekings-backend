# SphereKings Influencer Marketing + Sponsorship Feature
## Complete Implementation Guide

**Date:** March 25, 2026  
**Status:** Production-Ready Implementation Plan  
**Tech Stack:** Next.js + Express.js + MongoDB + Stripe

---

## EXECUTIVE SUMMARY

This implementation adds two interconnected features to SphereKings:

1. **Influencer Application System** - Product exchange program for influencers
   - Application form (name, socials, followers, shipping address)
   - Auto-approval or admin review workflow
   - Track approved influencers in system
   - Tie to fulfillment/product exchange

2. **Sponsorship Tier System** - Premium sponsor packages with video mentions
   - 5 sponsorship tiers ($1K - $10K)
   - Sponsorship calculation: $100 = 1 video mention
   - Stripe payment integration
   - Admin dashboard to manage tiers and track sponsorships

---

## FEATURE ARCHITECTURE

### Influencer Applications Flow

```
User clicks "Become an Influencer"
          ↓
Form displayed (name, email, socials, platforms, followers, address)
          ↓
User submits form
          ↓
Backend validates and creates InfluencerApplication record
          ↓
Decision point:
  - Auto-approve (followers > threshold)
  - OR require admin review
          ↓
If approved:
  - Mark as "approved" in database
  - Show success message with next steps
  - Admin can assign product to send
          ↓
Approved influencer shows "Influencer Status" in dashboard
```

### Sponsorship Flow

```
User clicks "Become a Sponsor"
          ↓
Sponsorship tier selection displayed (5 cards)
          ↓
User selects tier
          ↓
Payment details and benefits summary shown
          ↓
User clicks "Complete Payment"
          ↓
Stripe checkout initiated
          ↓
Webhook processes payment confirmation
          ↓
SponsorshipRecord created in database
          ↓
Admin dashboard shows sponsorship with delivery timeline
```

---

## DATABASE SCHEMA (MongoDB)

### InfluencerApplication Model

```javascript
{
  _id: ObjectId,
  
  // User reference
  userId: ObjectId (ref: User), // If authenticated, null if not
  
  // Basic Information
  name: String (required, 2-100 chars),
  email: String (required, validated),
  
  // Social Media
  platforms: [String], // ['TikTok', 'Instagram', 'YouTube', etc]
  socialHandles: {
    tiktok: String,
    instagram: String,
    youtube: String,
    twitter: String,
    twitch: String
  },
  followerCount: Number (required, >0),
  averageEngagementRate: Number, // Optional: percentage
  
  // Shipping/Contact
  shippingAddress: {
    street: String,
    city: String,
    state: String,
    postalCode: String,
    country: String
  },
  phoneNumber: String,
  
  // Content Commitment
  contentCommitment: String, // 'videos_per_day' or 'lump_sum'
  videosPerDay: Number, // If daily commitment
  totalVideos: Number, // Calculated from followerCount threshold
  
  // Status & Approval
  status: String, // 'pending' | 'approved' | 'rejected'
  approvalNotes: String, // Admin notes
  approvedAt: Date,
  approvedBy: ObjectId, // Admin user reference
  
  // Product Assignment
  productAssigned: ObjectId, // Ref to Product
  fulfillmentStatus: String, // 'pending' | 'shipped' | 'delivered'
  trackingNumber: String,
  
  // Timestamps
  createdAt: Date (default: now),
  updatedAt: Date,
  
  // Metadata
  ipAddress: String,
  userAgent: String
}
```

### SponsorshipTier Model

```javascript
{
  _id: ObjectId,
  
  name: String, // 'King's Pawn', 'Royal Knight', etc
  slug: String, // 'kings-pawn' (for URL)
  price: Number, // In cents (e.g., 100000 = $1000)
  
  // Benefits
  benefitsSummary: String,
  benefits: [String], // Array of benefit descriptions
  videoMentions: Number, // Calculated: price / 10000 (e.g., $1000 = 10 videos)
  
  // Delivery Info
  deliveryDays: Number, // Days to complete all video mentions
  startDate: Date, // When promotion starts
  endDate: Date, // When promotion ends
  
  // Campaign Integration
  campaignCycle: String, // e.g., 'kickstarter_2026_q2'
  
  // Display & Marketing
  featured: Boolean,
  displayOrder: Number,
  icon: String, // Icon name or emoji
  
  // Admin Controls
  active: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### SponsorshipRecord Model

```javascript
{
  _id: ObjectId,
  
  // Sponsor Information
  sponsorName: String,
  sponsorEmail: String,
  sponsorCompany: String,
  sponsorContact: String,
  
  // Sponsorship Details
  tierId: ObjectId, // Ref to SponsorshipTier
  tierName: String, // Denormalized for display
  amount: Number, // In cents
  videoMentions: Number, // Calculated at time of purchase
  
  // Payment Information
  stripeSessionId: String,
  stripePaymentIntentId: String,
  paymentStatus: String, // 'pending' | 'completed' | 'failed'
  paidAt: Date,
  
  // Delivery Tracking
  videosCompleted: Number, // Counter: how many videos posted
  videosRemaining: Number, // Auto-calculated
  promoteStart: Date,
  promotionDeadline: Date,
  
  // Content Links
  videoLinks: [
    {
      url: String,
      platform: String, // 'youtube', 'tiktok', 'instagram'
      postedAt: Date,
      views: Number
    }
  ],
  
  // Status
  status: String, // 'pending_payment' | 'active' | 'in_progress' | 'completed' | 'failed'
  
  // Admin Notes
  adminNotes: String,
  
  // Timestamps
  createdAt: Date,
  updatedAt: Date
}
```

---

## BACKEND IMPLEMENTATION

### 1. New Routes File: `src/routes/influencerRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const influencerController = require('../controllers/influencerController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @POST /api/influencer/apply
 * Submit influencer application (public endpoint, optional auth)
 * If authenticated, links to user account
 */
router.post(
  '/apply',
  asyncHandler(influencerController.submitApplication)
);

/**
 * @GET /api/influencer/my-application
 * Get current user's influencer application
 * Requires authentication
 */
router.get(
  '/my-application',
  authenticateToken,
  asyncHandler(influencerController.getMyApplication)
);

/**
 * @GET /api/influencer/applications (ADMIN)
 * List all influencer applications with filters
 * Requires admin role
 */
router.get(
  '/applications',
  authenticateToken,
  authorize('admin'),
  asyncHandler(influencerController.listApplications)
);

/**
 * @GET /api/influencer/applications/:id
 * Get single application details
 * Requires admin role
 */
router.get(
  '/applications/:id',
  authenticateToken,
  authorize('admin'),
  asyncHandler(influencerController.getApplication)
);

/**
 * @PUT /api/influencer/applications/:id/approve
 * Approve influencer application
 * Requires admin role
 */
router.put(
  '/applications/:id/approve',
  authenticateToken,
  authorize('admin'),
  asyncHandler(influencerController.approveApplication)
);

/**
 * @PUT /api/influencer/applications/:id/reject
 * Reject influencer application
 * Requires admin role
 */
router.put(
  '/applications/:id/reject',
  authenticateToken,
  authorize('admin'),
  asyncHandler(influencerController.rejectApplication)
);

/**
 * @PUT /api/influencer/applications/:id/assign-product
 * Assign product to approved influencer
 * Requires admin role
 */
router.put(
  '/applications/:id/assign-product',
  authenticateToken,
  authorize('admin'),
  asyncHandler(influencerController.assignProduct)
);

module.exports = router;
```

### 2. New Routes File: `src/routes/sponsorshipRoutes.js`

```javascript
const express = require('express');
const router = express.Router();
const sponsorshipController = require('../controllers/sponsorshipController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/authMiddleware');
const { asyncHandler } = require('../middlewares/errorHandler');

/**
 * @GET /api/sponsorship/tiers
 * Get all active sponsorship tiers
 * Public endpoint
 */
router.get(
  '/tiers',
  asyncHandler(sponsorshipController.getTiers)
);

/**
 * @GET /api/sponsorship/tiers/:id
 * Get single sponsorship tier details
 * Public endpoint
 */
router.get(
  '/tiers/:id',
  asyncHandler(sponsorshipController.getTier)
);

/**
 * @POST /api/sponsorship/purchase
 * Initiate sponsorship purchase (create Stripe session)
 * Requires authentication
 */
router.post(
  '/purchase',
  authenticateToken,
  asyncHandler(sponsorshipController.initiatePurchase)
);

/**
 * @GET /api/sponsorship/my-sponsorships
 * Get current user's sponsorship records
 * Requires authentication
 */
router.get(
  '/my-sponsorships',
  authenticateToken,
  asyncHandler(sponsorshipController.getMySponsorships)
);

/**
 * @GET /api/sponsorship/records (ADMIN)
 * List all sponsorship records with filters
 * Requires admin role
 */
router.get(
  '/records',
  authenticateToken,
  authorize('admin'),
  asyncHandler(sponsorshipController.listRecords)
);

/**
 * @GET /api/sponsorship/records/:id (ADMIN)
 * Get single sponsorship record details
 * Requires admin role
 */
router.get(
  '/records/:id',
  authenticateToken,
  authorize('admin'),
  asyncHandler(sponsorshipController.getRecord)
);

/**
 * @PUT /api/sponsorship/records/:id/update-progress (ADMIN)
 * Update sponsorship progress (add video links, mark videos as posted)
 * Requires admin role
 */
router.put(
  '/records/:id/update-progress',
  authenticateToken,
  authorize('admin'),
  asyncHandler(sponsorshipController.updateProgress)
);

/**
 * @POST /api/sponsorship/webhook
 * Stripe webhook for sponsorship confirmation
 * Similar to checkout webhook, but for sponsorship tier purchases
 */
router.post(
  '/webhook',
  asyncHandler(sponsorshipController.handlePaymentWebhook)
);

module.exports = router;
```

---

## FRONTEND IMPLEMENTATION

### 1. New Landing Page Sections

**Location:** `src/sections/` directory

#### `InfluencerShowcase.jsx` - Landing page section promoting influencer program

#### `SponsorshipShowcase.jsx` - Landing page section promoting sponsorships

### 2. New Frontend Pages

**Location:** `src/app/(marketing)/` or appropriate route

#### `/influencer/apply` - Influencer application form page
#### `/sponsorship/tiers` - Sponsorship tier selection page
#### `/sponsorship/success` - Confirmation page after sponsorship purchase

### 3. Admin Pages

#### `/admin/influencer/applications` - Admin dashboard for influencer applications
#### `/admin/sponsorship/overview` - Admin sponsorship management dashboard

---

## IMPLEMENTATION PRIORITIES

### Phase 1: Core Models & Routes (2-3 days)
- [ ] Create InfluencerApplication model
- [ ] Create SponsorshipTier model
- [ ] Create SponsorshipRecord model
- [ ] Create influencerController with all methods
- [ ] Create sponsorshipController with all methods
- [ ] Register routes in main server.js

### Phase 2: Frontend Pages (2-3 days)
- [ ] Build influencer application form page
- [ ] Build sponsorship tier selection page
- [ ] Build sponsorship confirmation page
- [ ] Build admin review dashboards
- [ ] Add landing page sections

### Phase 3: Integration & Admin Features (2-3 days)
- [ ] Stripe webhook integration for sponsorships
- [ ] Admin approval workflow UI
- [ ] Email notifications (optional)
- [ ] Analytics/reporting

### Phase 4: Testing & Deployment (1-2 days)
- [ ] End-to-end testing
- [ ] Security validation
- [ ] Performance optimization
- [ ] Deployment checklist

---

## PAYMENT FLOW (Stripe Integration)

```
Sponsor selects tier + clicks "Purchase"
          ↓
Stripe checkout session created (similar to product checkout)
  - Amount: tier.price
  - Metadata: { tierId, sponsorEmail, sponsorName }
          ↓
Stripe hosted checkout page displayed
          ↓
Sponsor completes payment
          ↓
Stripe sends webhook: checkout.session.completed
          ↓
Backend validates webhook signature
          ↓
Create SponsorshipRecord with status='completed'
          ↓
Send confirmation email to sponsor
          ↓
Admin dashboard shows new sponsorship pending deliverables
```

---

## VALIDATION RULES

### Influencer Application

```
- Name: Required, 2-100 characters
- Email: Required, valid email format
- Platforms: At least 1 required
- Follower count: Required, minimum 1000 recommended
- Shipping address: All fields required
- Phone: Optional but recommended
- Social handles: At least 1 required (matching selected platforms)
```

### Sponsorship Purchase

```
- Tier selection: Required
- Sponsor name: Required, 2-100 characters
- Sponsor email: Required, valid format
- Payment: Stripe handles validation
- Amount: Must match selected tier price
```

---

## SECURITY CONSIDERATIONS

1. **Influencer Applications:**
   - Sanitize all text inputs (XSS prevention)
   - Validate email format and optionally verify ownership
   - Rate limit application submissions (prevent spam)
   - Require CAPTCHA if not authenticated
   - Log all applications with IP/user agent

2. **Sponsorship Purchases:**
   - Use Stripe's built-in fraud detection
   - Verify webhook signatures (Stripe library handles this)
   - Validate tier exists and is active before charging
   - Idempotent webhook handling (don't double-charge)
   - Encrypt sponsor contact information

3. **Admin Functions:**
   - Require admin role for all admin endpoints
   - Log admin actions (approvals, rejections, assignments)
   - Validate all input data
   - Implement audit trail

---

## ERROR HANDLING STRATEGY

```javascript
// Consistent error response format:
{
  success: false,
  statusCode: 400-500,
  message: "User-friendly error message",
  errors: {
    field_name: "Specific validation error"
  }
}
```

**Status Codes:**
- 200: Success
- 201: Created
- 400: Validation error
- 401: Unauthorized (no token)
- 403: Forbidden (wrong role)
- 404: Not found
- 409: Conflict (duplicate application for same email)
- 422: Unprocessable entity
- 500: Server error

---

## DEPLOYMENT CHECKLIST

**Before going live:**

- [ ] All models created and indexed
- [ ] All routes registered in server.js
- [ ] Environment variables set:
  - `STRIPE_PUBLISHABLE_KEY`
  - `STRIPE_SECRET_KEY`
  - `SPONSORSHIP_WEBHOOK_SECRET` (new)
  - `INFLUENCER_AUTO_APPROVE_THRESHOLD` (e.g., 5000 followers)
- [ ] Database backups created
- [ ] Stripe webhook endpoint registered in dashboard
- [ ] Email templates created (optional)
- [ ] Frontend pages tested on mobile/desktop
- [ ] Admin workflows tested
- [ ] Payment flow tested with Stripe test mode
- [ ] CORS configured if needed
- [ ] Rate limiting tuned
- [ ] Analytics logging set up

---

## FILE CHECKLIST

### New Backend Files
- [ ] `src/models/InfluencerApplication.js` - ~150 lines
- [ ] `src/models/SponsorshipTier.js` - ~120 lines
- [ ] `src/models/SponsorshipRecord.js` - ~150 lines
- [ ] `src/controllers/influencerController.js` - ~300 lines
- [ ] `src/controllers/sponsorshipController.js` - ~400 lines
- [ ] `src/routes/influencerRoutes.js` - ~70 lines
- [ ] `src/routes/sponsorshipRoutes.js` - ~70 lines
- [ ] `src/validators/influencerValidator.js` - ~80 lines
- [ ] `src/validators/sponsorshipValidator.js` - ~60 lines

### New Frontend Files
- [ ] `src/sections/InfluencerShowcase.jsx` - ~200 lines
- [ ] `src/sections/SponsorshipShowcase.jsx` - ~250 lines
- [ ] `src/app/influencer/apply/page.jsx` - ~150 lines
- [ ] `src/app/sponsorship/tiers/page.jsx` - ~200 lines
- [ ] `src/app/sponsorship/success/page.jsx` - ~100 lines
- [ ] `src/components/forms/InfluencerApplicationForm.jsx` - ~250 lines
- [ ] `src/components/sponsorship/TierCard.jsx` - ~150 lines
- [ ] `src/app/admin/influencer/page.jsx` - ~200 lines
- [ ] `src/app/admin/sponsorship/page.jsx` - ~200 lines

### Modified Files
- [ ] `src/server.js` - Add routes registration and webhook setup
- [ ] `src/app/page.jsx` - Add sections to landing page
- [ ] Navigation/Header - Add influencer and sponsorship links

---

## ASSUMPTIONS & DECISIONS

1. **Auto-Approval Threshold:** Applications with >5000 followers auto-approve; below threshold require admin review
2. **Payment Model:** Sponsorships use Stripe checkout (similar to product purchases)
3. **Video Calculation:** $100 tier price = 1 video mention (derived from $10,000 = 100 videos)
4. **Admin Review:** Influencer applications visible in admin dashboard similar to commission approvals
5. **Influencer Status:** Approved influencers can optionally be tracked with badge in dashboard
6. **Multi-Tier Access:** Both influencer and sponsorship features available to all users (no separate role)
7. **No Inventory Management:** Sponsorships are unlimited (no inventory cap)
8. **Email Notifications:** Optional send confirmation emails (can add later)
9. **Analytics:** Track sponsorship ROI via dashboard (can add later)

---

This implementation document provides the complete blueprint. The actual code files will implement these designs precisely.