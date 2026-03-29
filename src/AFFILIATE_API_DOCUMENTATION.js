/**
 * ==================== AFFILIATE MARKETING SYSTEM API DOCUMENTATION ====================
 *
 * Comprehensive API reference for the Spherekings Marketplace Affiliate System
 * Enables affiliates to register, generate referral links, track traffic, and earn commissions
 *
 * RESTful API following HTTP standards with JSON request/response bodies
 * All timestamps are ISO 8601 format (UTC)
 * All monetary values are in USD with 2 decimal places
 *
 * ========================================================================================
 */

/**
 * ==================== API OVERVIEW ====================
 *
 * Base URL: {BASE_URL}/api
 * Authentication: JWT Bearer token (protected endpoints only)
 * Content-Type: application/json
 *
 * Rate Limiting:
 *   - Standard: 100 requests per 15 minutes per IP
 *   - Admin: Same limits apply
 *   - Returns: 429 Too Many Requests if exceeded
 *
 * Response Format (Standard):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Description of result",
 *   "data": {
 *     ...endpoint-specific data...
 *   }
 * }
 *
 * Error Response Format:
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Error description",
 *   "errors": [
 *     { "field": "fieldName", "message": "Error message" }
 *   ]
 * }
 */

/**
 * ==================== AFFILIATE LIFECYCLE ====================
 *
 * Affiliate Flow:
 *
 * 1. REGISTRATION
 *    POST /api/affiliate/register
 *    - User registers with terms acceptance
 *    - System generates unique affiliate code (AFF + 11 chars)
 *    - Status: pending (email verification required)
 *
 * 2. EMAIL VERIFICATION
 *    - Verification email sent with confirmation link
 *    - User clicks link to verify email
 *    - Status: active (can now generate referral traffic)
 *
 * 3. REFERRAL GENERATION
 *    - Affiliate receives referral URL: https://sphereofkings.com/?ref=AFF12345678
 *    - Affiliate shares link via email, social, blog, etc.
 *    - Each click tracked and stored
 *
 * 4. VISITOR TRACKING
 *    GET /api/tracking/click?ref=AFF12345678
 *    - Frontend detects ?ref= parameter
 *    - Calls tracking endpoint
 *    - Sets 90-day cookie with affiliate ID
 *
 * 5. PURCHASE ATTRIBUTION
 *    - Customer completes purchase
 *    - Checkout system checks affiliateId cookie
 *    - Order attributed to affiliate
 *    - Commission calculated (e.g., 10% of order total)
 *
 * 6. COMMISSION ACCRUAL
 *    - Commission added to affiliate's pending earnings
 *    - Shown in affiliate dashboard
 *    - Status: pending (awaiting approval)
 *
 * 7. COMMISSION APPROVAL
 *    - Admin reviews commission
 *    - Status changes: pending → approved
 *    - Affiliate can request payout
 *
 * 8. PAYOUT
 *    - Affiliate configures payout method (Stripe, PayPal, bank)
 *    - Requests payout when threshold met
 *    - Payout processed
 *    - Status: paid
 *
 * Status Values:
 * - Affiliate Account Status:
 *   pending → active (after email verification)
 *   active → suspended (policy violation)
 *   suspended → active (appeal and reinstatement)
 *   active → inactive (user deactivates)
 *
 * - Commission Status:
 *   pending → approved (admin review)
 *   approved → paid (payout processed)
 *   any → reversed (refund/fraud)
 */

/**
 * ==================== DATA MODELS ====================
 */

// Affiliate Object Structure
const AFFILIATE_OBJECT = {
  _id: 'ObjectId (MongoDB ID)',
  userId: 'ObjectId (user who registered affiliate)',
  affiliateCode: 'AFF12ABC34DEF56 (unique, 14 characters)',
  referralUrl: 'https://sphereofkings.com/?ref=AFF12ABC34DEF56',
  status: 'pending | active | suspended | inactive',
  emailVerified: true,
  totalClicks: 150,
  totalSales: 12,
  totalEarnings: 500.00,
  pendingEarnings: 150.00,
  paidEarnings: 350.00,
  commissionRate: 10,
  conversionRate: 8.0, // Percentage (totalSales / totalClicks * 100)
  averageOrderValue: 41.67, // totalEarnings / totalSales
  payoutMethod: 'stripe | paypal | bank_transfer | none',
  minimumPayoutThreshold: 50.00,
  createdAt: '2024-03-13T10:30:00Z',
  updatedAt: '2024-03-13T10:30:00Z',
};

// Referral Tracking Object
const REFERRAL_TRACKING_OBJECT = {
  _id: 'ObjectId',
  affiliateId: 'ObjectId',
  affiliateCode: 'AFF12345678',
  ipAddress: '192.168.1.1',
  device: 'mobile | tablet | desktop',
  referralSource: 'direct | email | facebook | twitter | instagram | blog',
  userAgent: 'Mozilla/5.0...',
  cookieId: 'unique_identifier',
  sessionId: 'session_id',
  convertedToSale: false,
  orderId: 'ObjectId (if converted)',
  commissionAmount: 50.00,
  createdAt: '2024-03-13T10:30:00Z',
};

// Pagination Object
const PAGINATION_OBJECT = {
  currentPage: 1,
  itemsPerPage: 20,
  totalItems: 150,
  totalPages: 8,
};

/**
 * ==================== PUBLIC ENDPOINTS ====================
 * No authentication required
 */

/**
 * GET /api/tracking/click
 *
 * Track a referral click (called by frontend when visitor arrives with ?ref= parameter)
 *
 * Query Parameters:
 *   ref (string, required) - Affiliate code
 *   utm_campaign (string, optional) - UTM campaign
 *   utm_medium (string, optional) - UTM medium
 *   utm_source (string, optional) - UTM source
 *   utm_content (string, optional) - UTM content
 *
 * Example URL:
 *   GET /api/tracking/click?ref=AFF12ABC34&utm_campaign=summer_sale&utm_medium=email
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Referral tracked successfully",
 *   "data": {
 *     "trackingId": "507f1f77bcf86cd799439011",
 *     "affiliateId": "507f1f77bcf86cd799439012",
 *     "affiliateCode": "AFF12ABC34DEF56",
 *     "expiresAt": "2024-06-13T10:30:00Z"
 *   }
 * }
 *
 * Cookies Set (90-day expiration):
 *   - affiliateId: Secure, HttpOnly
 *   - affiliateCode: Not HttpOnly
 *
 * Error (400 Bad Request - Invalid Affiliate Code):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Affiliate code is required"
 * }
 *
 * Error (404 Not Found - Affiliate doesn't exist):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Invalid affiliate code"
 * }
 *
 * Use Cases:
 *   - Tracking visitors from affiliate links
 *   - Attribution in subsequent purchase
 *   - Analytics on traffic source
 */

/**
 * GET /api/leaderboard/affiliates
 *
 * Get top performing affiliates (public leaderboard)
 *
 * Query Parameters:
 *   limit (number) - Default 10, max 50
 *   sortBy (string) - totalEarnings | totalSales | totalClicks
 *
 * Example URL:
 *   GET /api/leaderboard/affiliates?limit=20&sortBy=totalEarnings
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Top affiliates retrieved successfully",
 *   "data": {
 *     "affiliates": [
 *       {
 *         "userId": "ObjectId",
 *         "affiliateCode": "AFF12ABC34DEF56",
 *         "totalEarnings": 5000.00,
 *         "totalSales": 100,
 *         "totalClicks": 1200,
 *         "conversionRate": 8.33
 *       }
 *     ]
 *   }
 * }
 *
 * Use Cases:
 *   - Display public leaderboard on website
 *   - Motivate affiliates with rankings
 *   - Show top performers to potential affiliates
 */

/**
 * ==================== CUSTOMER/AFFILIATE ENDPOINTS ====================
 * Require JWT authentication
 */

/**
 * POST /api/affiliate/register
 *
 * Register authenticated user as an affiliate
 *
 * Authorization: Required (JWT)
 * Role: customer, user
 *
 * Request Body:
 * {
 *   "termsAccepted": true,
 *   "commissionRate": 10 (optional, uses system default if omitted)
 * }
 *
 * Response (201 Created):
 * {
 *   "success": true,
 *   "statusCode": 201,
 *   "message": "Affiliate account created successfully. Please verify your email to activate.",
 *   "data": {
 *     "affiliateId": "507f1f77bcf86cd799439011",
 *     "affiliateCode": "AFF12ABC34DEF56",
 *     "referralUrl": "https://sphereofkings.com/?ref=AFF12ABC34DEF56",
 *     "status": "pending"
 *   }
 * }
 *
 * Error (400 Bad Request - Terms not accepted):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": [
 *     {
 *       "field": "termsAccepted",
 *       "message": "You must accept the affiliate terms and conditions"
 *     }
 *   ]
 * }
 *
 * Error (409 Conflict - Already an affiliate):
 * {
 *   "success": false,
 *   "statusCode": 409,
 *   "message": "User already has an affiliate account"
 * }
 *
 * Error (401 Unauthorized - No token):
 * {
 *   "success": false,
 *   "statusCode": 401,
 *   "message": "Unauthorized: invalid or missing token"
 * }
 *
 * Use Cases:
 *   - Becoming an affiliate
 *   - Receiving unique referral code
 */

/**
 * GET /api/affiliate/dashboard
 *
 * Get affiliate dashboard with comprehensive analytics
 *
 * Authorization: Required (JWT)
 * Role: affiliate (user must have active affiliate account)
 *
 * Query Parameters:
 *   startDate (string, optional) - ISO date for analytics period
 *   endDate (string, optional) - ISO date for analytics period
 *
 * Example URL:
 *   GET /api/affiliate/dashboard?startDate=2024-02-13&endDate=2024-03-13
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate dashboard retrieved successfully",
 *   "data": {
 *     "dashboard": {
 *       "_id": "507f1f77bcf86cd799439011",
 *       "affiliateCode": "AFF12ABC34DEF56",
 *       "referralUrl": "https://sphereofkings.com/?ref=AFF12ABC34DEF56",
 *       "status": "active",
 *       "emailVerified": true,
 *       "totalClicks": 150,
 *       "totalSales": 12,
 *       "stats": {
 *         "totalClicks": 150,
 *         "totalConversions": 12,
 *         "conversionRate": 8.0,
 *         "totalCommissions": 1549.99,
 *         "uniqueVisitors": 120
 *       },
 *       "earnings": {
 *         "totalEarnings": 500.00,
 *         "pendingEarnings": 150.00,
 *         "paidEarnings": 350.00,
 *         "minimumPayoutThreshold": 50,
 *         "meetsThreshold": true,
 *         "hasPayoutConfigured": true
 *       },
 *       "status": {
 *         "isActive": true,
 *         "hasVerifiedEmail": true,
 *         "hasAcceptedTerms": true,
 *         "suspensionReason": null
 *       }
 *     }
 *   }
 * }
 *
 * Error (404 Not Found - No affiliate account):
 * {
 *   "success": false,
 *   "statusCode": 404,
 *   "message": "Affiliate account not found"
 * }
 *
 * Use Cases:
 *   - Display affiliate dashboard to user
 *   - Show earnings and statistics
 *   - Monitor conversion rates
 */

/**
 * GET /api/affiliate/referrals
 *
 * Get referral click history with detailed tracking data
 *
 * Authorization: Required (JWT)
 *
 * Query Parameters:
 *   page (number) - Default 1
 *   limit (number) - Default 20, max 100
 *   convertedOnly (boolean) - Show only conversions
 *   startDate (string) - ISO date
 *   endDate (string) - ISO date
 *
 * Example URL:
 *   GET /api/affiliate/referrals?page=1&limit=50&convertedOnly=true
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Referral history retrieved successfully",
 *   "data": {
 *     "referrals": [
 *       {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "affiliateCode": "AFF12ABC34DEF56",
 *         "ipAddress": "192.168.1.1",
 *         "device": "mobile",
 *         "referralSource": "email",
 *         "convertedToSale": true,
 *         "orderId": "507f1f77bcf86cd799439012",
 *         "commissionAmount": 50.00,
 *         "createdAt": "2024-03-13T10:30:00Z"
 *       }
 *     ],
 *     "pagination": {
 *       "currentPage": 1,
 *       "itemsPerPage": 50,
 *       "totalItems": 150,
 *       "totalPages": 3
 *     }
 *   }
 * }
 *
 * Use Cases:
 *   - View all referral clicks
 *   - Track conversion sources
 *   - Identify top performing traffic sources
 */

/**
 * GET /api/affiliate/sales
 *
 * Get orders attributed to affiliate with commission details
 *
 * Authorization: Required (JWT)
 *
 * Query Parameters:
 *   page (number) - Default 1
 *   limit (number) - Default 20, max 100
 *   status (string) - pending | approved | paid | reversed
 *   startDate (string) - ISO date
 *   endDate (string) - ISO date
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate sales retrieved successfully",
 *   "data": {
 *     "sales": [
 *       {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "orderNumber": "ORD-20240101-123456",
 *         "total": 199.99,
 *         "paymentStatus": "paid",
 *         "orderStatus": "shipped",
 *         "affiliateDetails": {
 *           "commissionAmount": 20.00,
 *           "commissionRate": 10,
 *           "status": "pending"
 *         },
 *         "createdAt": "2024-03-13T10:30:00Z"
 *       }
 *     ],
 *     "pagination": PAGINATION_OBJECT,
 *     "statistics": {
 *       "totalSalesAmount": 5000.00,
 *       "totalCommissions": 500.00,
 *       "salesCount": 25,
 *       "averageOrderValue": 200.00,
 *       "averageCommissionPerSale": 20.00
 *     }
 *   }
 * }
 *
 * Use Cases:
 *   - Track commissions from sales
 *   - View attributed orders
 *   - Monitor commission status
 */

/**
 * GET /api/affiliate/analytics
 *
 * Get detailed analytics with breakdowns by source, device, etc.
 *
 * Authorization: Required (JWT)
 *
 * Query Parameters:
 *   startDate (string, optional) - ISO date
 *   endDate (string, optional) - ISO date (default: last 30 days)
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate analytics retrieved successfully",
 *   "data": {
 *     "analytics": {
 *       "period": {
 *         "startDate": "2024-02-13T00:00:00Z",
 *         "endDate": "2024-03-13T23:59:59Z"
 *       },
 *       "overview": {
 *         "totalClicks": 150,
 *         "totalConversions": 12,
 *         "conversionRate": 8.0,
 *         "totalCommissions": 1549.99,
 *         "uniqueVisitors": 120
 *       },
 *       "bySource": [
 *         {
 *           "_id": "email",
 *           "count": 80,
 *           "conversions": 10
 *         },
 *         {
 *           "_id": "facebook",
 *           "count": 50,
 *           "conversions": 2
 *         }
 *       ],
 *       "byDevice": [
 *         {
 *           "_id": "mobile",
 *           "count": 100,
 *           "conversions": 10
 *         },
 *         {
 *           "_id": "desktop",
 *           "count": 50,
 *           "conversions": 2
 *         }
 *       ],
 *       "earnings": {
 *         "totalEarnings": 500.00,
 *         "pendingEarnings": 150.00,
 *         "paidEarnings": 350.00
 *       }
 *     }
 *   }
 * }
 *
 * Use Cases:
 *   - Deep-dive analytics
 *   - Optimize traffic sources
 *   - Device-specific strategies
 */

/**
 * POST /api/affiliate/payout-settings
 *
 * Configure payout method and settings
 *
 * Authorization: Required (JWT)
 *
 * Request Body:
 * {
 *   "payoutMethod": "stripe",
 *   "payoutData": "stripeAccountId or email or bank account",
 *   "minimumThreshold": 50
 * }
 *
 * Supported Payout Methods:
 *   stripe: Stripe Connect account ID
 *   paypal: PayPal email address
 *   bank_transfer: Bank account details (encrypted)
 *   none: No payout configured
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Payout settings updated successfully",
 *   "data": {
 *     "payoutMethod": "stripe",
 *     "minimumThreshold": 50
 *   }
 * }
 *
 * Error (400 Bad Request - Invalid method):
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Validation error",
 *   "errors": [
 *     {
 *       "field": "payoutMethod",
 *       "message": "payoutMethod must be one of: stripe, bank_transfer, paypal, none"
 *     }
 *   ]
 * }
 *
 * Use Cases:
 *   - Configure payout method
 *   - Set minimum threshold
 *   - Request payout when eligible
 */

/**
 * ==================== ADMIN ENDPOINTS ====================
 * Require JWT + admin role
 */

/**
 * GET /api/admin/affiliate-stats
 *
 * Get overall affiliate system statistics (admin only)
 *
 * Authorization: Required (JWT + admin)
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate system statistics retrieved",
 *   "data": {
 *     "statistics": {
 *       "byStatus": [
 *         {
 *           "_id": "active",
 *           "count": 45,
 *           "totalEarnings": 5000.00,
 *           "totalClicks": 15000,
 *           "totalSales": 1200
 *         },
 *         {
 *           "_id": "pending",
 *           "count": 12,
 *           "totalEarnings": 0,
 *           "totalClicks": 100,
 *           "totalSales": 0
 *         }
 *       ],
 *       "totalReferrals": 50000,
 *       "topReferralSources": [
 *         {
 *           "_id": "email",
 *           "clicks": 20000,
 *           "conversions": 1500,
 *           "totalCommission": 3000.00
 *         }
 *       ]
 *     }
 *   }
 * }
 *
 * Use Cases:
 *   - System-wide analytics
 *   - Performance tracking
 *   - Revenue attribution
 */

/**
 * POST /api/admin/affiliate/:affiliateId/suspend
 *
 * Suspend an affiliate account for policy violations
 *
 * Authorization: Required (JWT + admin)
 *
 * URL Parameters:
 *   affiliateId (string) - Affiliate ID to suspend
 *
 * Request Body:
 * {
 *   "reason": "Fraudulent activity detected"
 * }
 *
 * Response (200 OK):
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate suspended successfully",
 *   "data": {
 *     "affiliateId": "507f1f77bcf86cd799439011",
 *     "status": "suspended",
 *     "reason": "Fraudulent activity detected"
 *   }
 * }
 *
 * Use Cases:
 *   - Fraud prevention
 *   - Policy enforcement
 *   - Account management
 */

/**
 * ==================== COMMISSION STATUS FLOW ====================
 *
 * Commission States:
 *
 * pending
 *   ├─ Initial state when order attributed to affiliate
 *   ├─ Commission stored but awaiting admin review
 *   └─ Affiliate can see in dashboard
 *
 * approved → payment eligible
 *   ├─ Admin reviewed and approved commission
 *   ├─ Affiliate can request payout
 *   └─ Payout processed
 *
 * paid → completed
 *   ├─ Payout processed to affiliate
 *   ├─ Funds transferred
 *   └─ No further action
 *
 * reversed → refund/fraud
 *   ├─ Order refunded or fraud detected
 *   ├─ Commission reversed
 *   └─ Affiliate loses earnings
 */

/**
 * ==================== ERROR CODES & HANDLING ====================
 *
 * HTTP Status Code | Error Type | Meaning
 * ================================================================================
 * 400 Bad Request | ValidationError | Invalid input parameters or request body
 * 401 Unauthorized | AuthenticationError | Missing or invalid JWT token
 * 403 Forbidden | ForbiddenError | User lacks permission for this resource
 * 404 Not Found | NotFoundError | Resource does not exist
 * 409 Conflict | ConflictError | User already has affiliate account
 * 429 Too Many Requests | RateLimitError | Rate limit exceeded
 * 500 Internal Server Error | ServerError | Unexpected server error
 *
 * Common Scenarios:
 *
 * Missing Authentication:
 *   Status: 401
 *   Solution: Include Authorization header with JWT
 *
 * Invalid Affiliate Code:
 *   Status: 404
 *   Solution: Verify code exists and is active
 *
 * Duplicate Registration:
 *   Status: 409
 *   Solution: One affiliate account per user
 *
 * Account Not Active:
 *   Status: 403
 *   Solution: Verify email before earning commissions
 */

/**
 * ==================== INTEGRATION PATTERNS ====================
 *
 * Pattern 1: Frontend Referral Tracking
 * =====================================
 * // On page load, detect ?ref= parameter
 * const params = new URLSearchParams(window.location.search);
 * const affiliateCode = params.get('ref');
 *
 * if (affiliateCode) {
 *   // Track the click
 *   fetch(`/api/tracking/click?ref=${affiliateCode}`)
 *     .then(r => r.json())
 *     .catch(e => console.log('Tracking failed'));
 *
 *   // Cookie automatically set by response
 *   // Used during checkout for attribution
 * }
 *
 * Pattern 2: Checkout Attribution
 * ================================
 * // In checkout, read affiliateId from cookie
 * const affiliateId = getCookie('affiliateId');
 * const affiliateCode = getCookie('affiliateCode');
 *
 * // Include in order creation
 * const order = {
 *   ...orderData,
 *   affiliateCode: affiliateCode
 * };
 *
 * Pattern 3: Affiliate Dashboard
 * ==============================
 * // Fetch dashboard data
 * GET /api/affiliate/dashboard
 * - Includes stats, earnings, referral URL
 * - Shows conversion metrics
 *
 * Pattern 4: Analytics Query
 * ==========================
 * // Get detailed analytics for date range
 * GET /api/affiliate/analytics?startDate=2024-02-01&endDate=2024-03-01
 */

/**
 * ==================== TESTING CHECKLIST ====================
 *
 * Affiliate Registration:
 * ✓ POST /api/affiliate/register with termsAccepted=true → 201
 * ✓ POST /api/affiliate/register without terms → 400
 * ✓ POST /api/affiliate/register twice → 409 (already registered)
 * ✓ POST without auth → 401
 *
 * Referral Tracking:
 * ✓ GET /api/tracking/click?ref=VALID_CODE → 200, sets cookies
 * ✓ GET /api/tracking/click?ref=INVALID_CODE → 404
 * ✓ GET /api/tracking/click without ref → 200 (no tracking)
 *
 * Dashboard:
 * ✓ GET /api/affiliate/dashboard for active affiliate → 200
 * ✓ GET /api/affiliate/dashboard for non-affiliate → 404
 * ✓ GET without auth → 401
 *
 * Analytics:
 * ✓ GET /api/affiliate/analytics with date range → 200
 * ✓ GET /api/affiliate/analytics with invalid date → 400
 * ✓ Conversion rate calculation correct
 *
 * Leaderboard:
 * ✓ GET /api/leaderboard/affiliates → 200, public
 * ✓ GET /api/leaderboard/affiliates?limit=50 → 50 results
 * ✓ GET /api/leaderboard/affiliates?sortBy=totalSales → sorted correctly
 *
 * Admin:
 * ✓ GET /api/admin/affiliate-stats as admin → 200
 * ✓ GET /api/admin/affiliate-stats as user → 403
 * ✓ POST /api/admin/affiliate/:id/suspend as admin → 200
 */

module.exports = {};
