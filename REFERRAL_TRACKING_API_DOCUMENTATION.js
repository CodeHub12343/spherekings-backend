/**
 * REFERRAL TRACKING API DOCUMENTATION
 *
 * Complete API reference for the Referral Tracking System
 * Used to track affiliate clicks, set attribution cookies, and link referrals to purchases
 *
 * Base URL: https://api.spherekings.com/api
 * Version: 1.0.0
 * Last Updated: March 2026
 */

// ============================================================================
// API OVERVIEW
// ============================================================================

/**
 * The Referral Tracking API provides endpoints for:
 *
 * 1. CLICK TRACKING
 *    - Record affiliate link clicks
 *    - Set attribution cookies
 *    - Redirect to landing page
 *
 * 2. ATTRIBUTION MANAGEMENT
 *    - Attribute orders to affiliates
 *    - Manage referral attribution
 *    - Verify affiliate information
 *
 * 3. ANALYTICS RETRIEVAL
 *    - Get referral statistics
 *    - Analyze traffic sources
 *    - Track conversion rates
 *
 * 4. FRAUD DETECTION
 *    - Monitor suspicious patterns
 *    - Flag invalid clicks
 *    - Block fraudulent traffic
 */

// ============================================================================
// ENDPOINT: Record Referral Click
// ============================================================================

/**
 * GET /api/tracking/click
 *
 * Record an affiliate referral click and set attribution cookies
 *
 * This is the PRIMARY entry point for affiliate marketing traffic.
 * When a visitor clicks an affiliate link, this endpoint records the click,
 * validates the affiliate code, and sets persistent cookies for attribution.
 *
 * AUTHENTICATION: None (public endpoint, IP rate-limited)
 * METHOD: GET
 * RESPONSE TIME: < 100ms
 * SIDE EFFECTS:
 *   - Creates ReferralTracking document
 *   - Sets 2 cookies (90-day duration)
 *   - Increments affiliate click counter
 *
 * QUERY PARAMETERS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * ref (required, string, length: 15)
 *   Affiliate referral code from affiliate dashboard
 *   Format: AFF[11-alphanumeric chars]
 *   Example: AFF12345678ABC
 *   Validation: Uppercase, alphanumeric only
 *
 * utm_campaign (optional, string, max: 255 chars)
 *   UTM campaign identifier for tracking marketing campaigns
 *   Used to identify which campaign generated the click
 *   Example: "summer_sale", "black_friday_2026", "email_blast_march"
 *
 * utm_medium (optional, string, max: 50 chars)
 *   UTM medium type (how the traffic arrived)
 *   Example: "email", "social", "blog", "video", "podcast"
 *
 * utm_source (optional, string, max: 50 chars)
 *   UTM source platform (where the traffic came from)
 *   Example: "gmail", "facebook", "twitter", "myblog.com", "instagram"
 *
 * utm_content (optional, string, max: 255 chars)
 *   UTM content identifier (specific element clicked)
 *   Example: "post_123", "email_link_above", "sidebar_banner"
 *
 * HEADERS (Captured Automatically):
 * ─────────────────────────────────────────────────────────────────────────
 *
 * User-Agent
 *   Browser/device information (captured automatically)
 *   Used for device type detection (mobile, tablet, desktop)
 *   Example: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_6...) AppleWebKit/605.1.15"
 *
 * Referer
 *   HTTP referrer header showing where click originated
 *   Used for analytics and traffic source attribution
 *   Example: "https://facebook.com/SphereOfKings"
 *
 * X-Forwarded-For (optional)
 *   Client IP when behind proxy
 *   Used instead of remote IP if present
 *
 * COOKIES SET (in response):
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Cookie 1: affiliateId
 *   Value: MongoDB ObjectId (string)
 *   Duration: 90 days
 *   HttpOnly: true (secure, JS cannot access)
 *   Secure: true (HTTPS only)
 *   SameSite: Lax (CSRF protection)
 *   Used by: Checkout system for affiliate attribution
 *
 * Cookie 2: affiliateCode
 *   Value: Affiliate code (string, e.g., "AFF12345678")
 *   Duration: 90 days
 *   HttpOnly: false (frontend can read)
 *   Secure: true (HTTPS only)
 *   SameSite: Lax (CSRF protection)
 *   Used by: Frontend for display, analytics
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Referral tracked successfully",
 *   "data": {
 *     "trackingId": "507f1f77bcf86cd799439011",
 *     "affiliateId": "507f1f77bcf86cd799439012",
 *     "affiliateCode": "AFF12345678",
 *     "cookieId": "cookie_abc123xyz",
 *     "cookieExpires": "2026-06-13T12:34:56.789Z",
 *     "redirectUrl": "/products"
 *   }
 * }
 *
 * Field Descriptions:
 *   trackingId      - Unique referral tracking record ID
 *   affiliateId     - ID of affiliate who generated the click
 *   affiliateCode   - Affiliate's referral code
 *   cookieId        - Unique identifier for this referral session
 *   cookieExpires   - When the attribution cookie expires
 *   redirectUrl     - Where user is redirected (default: /products)
 *
 * NO AFFILIATE CODE RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * If no 'ref' parameter provided, no click is tracked:
 *
 * {
 *   "success": true,
 *   "message": "No referral code",
 *   "data": null
 * }
 *
 * INVALID AFFILIATE CODE RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * If affiliate code doesn't exist or is suspended:
 *
 * {
 *   "success": true,
 *   "message": "Referral tracking completed",
 *   "data": null
 * }
 *
 * Note: Always returns 200 OK to avoid exposing valid affiliate codes
 *
 * RATE LIMITING:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * Global Rate Limit: 100 requests per IP per 15 minutes
 * Tracking Endpoint: 30 requests per IP per minute (if no ref parameter)
 * Reason: Prevent bot spam and click fraud
 *
 * SECURITY FEATURES:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 1. IP Validation
 *    - Detects rapid clicks from same IP
 *    - Flags suspicious IP patterns
 *    - Blocks IPs with >10 clicks/minute
 *
 * 2. Self-Referral Prevention
 *    - Prevents affiliates from using own links
 *    - Returns error if affiliate = user
 *
 * 3. Cookie Validation
 *    - HttpOnly flag prevents JavaScript theft
 *    - Secure flag enforces HTTPS only
 *    - SameSite prevents CSRF attacks
 *
 * 4. Input Validation
 *    - Affiliate code format validated
 *    - UTM parameter length checked
 *    - No special characters allowed
 *
 * FRAUD DETECTION:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * System monitors for:
 *   - Rapid-fire clicks from single IP
 *   - Bot traffic patterns
 *   - Self-referral attempts
 *   - Fake affiliate codes
 *   - Cookie tampering attempts
 *
 * Suspicious activity is logged but doesn't block requests
 * (to avoid alerting fraudsters)
 *
 * EXAMPLE USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * // Basic tracking
 * GET https://api.spherekings.com/api/tracking/click?ref=AFF12345678
 *
 * // With UTM parameters (email campaign)
 * GET https://api.spherekings.com/api/tracking/click?ref=AFF12345678&utm_campaign=summer_sale&utm_medium=email&utm_source=mailchimp
 *
 * // With custom content tracking
 * GET https://api.spherekings.com/api/tracking/click?ref=AFF12345678&utm_campaign=blog_review&utm_medium=blog&utm_source=myblog.com&utm_content=post_123
 *
 * // With short-link mapping
 * GET https://api.spherekings.com/api/tracking/click?ref=AFF12345678&utm_campaign=twitter_campaign&utm_medium=social&utm_source=twitter
 *
 * FRONTEND INTEGRATION:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * // 1. Detect affiliate code from URL
 * const urlParams = new URLSearchParams(window.location.search);
 * const affiliateCode = urlParams.get('ref');
 *
 * // 2. If code exists, redirect to tracking endpoint
 * if (affiliateCode) {
 *   // Redirect to tracking endpoint which sets cookies
 *   window.location.href = `/api/tracking/click?ref=${affiliateCode}`;
 * }
 *
 * // 3. Cookies are automatically set by server
 *
 * // 4. Checkout can read cookies
 * const affiliateCode = document.cookie
 *   .split('; ')
 *   .find(row => row.startsWith('affiliateCode='))
 *   ?.split('=')[1];
 *
 * // 5. Send to checkout endpoint
 * await fetch('/api/checkout/create-session', {
 *   method: 'POST',
 *   headers: { 'Authorization': `Bearer ${token}` },
 *   body: JSON.stringify({ affiliateCode })
 * });
 *
 * ANALYTICS CAPTURED:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * For each click, the system records:
 *   - Affiliate ID and code
 *   - IP address and device type
 *   - Browser, OS, and device fingerprint
 *   - UTM parameters for campaign attribution
 *   - Geographic location (country, state, city)
 *   - Timestamp of click
 *   - Referrer URL and landing page
 *   - Whether click converted to sale
 *   - Commission amount (if converted)
 *
 * This data enables detailed analytics dashboards showing:
 *   - Clicks by source (email, social, blog, etc.)
 *   - Clicks by geography
 *   - Clicks by device type
 *   - Conversion rates
 *   - Revenue attribution
 *   - ROI by marketing channel
 */

// ============================================================================
// ENDPOINT: Get Affiliate Referrals
// ============================================================================

/**
 * GET /api/affiliate/referrals
 *
 * Retrieve referral click history for authenticated affiliate
 *
 * Returns paginated list of all clicks generated by affiliate,
 * with option to filter for converted sales only.
 *
 * AUTHENTICATION: Required (JWT Bearer token)
 * AUTHORIZATION: Affiliate (user who registered as affiliate)
 * METHOD: GET
 * RATE LIMIT: 50 requests per minute
 *
 * QUERY PARAMETERS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * page (optional, number, default: 1, min: 1)
 *   Pagination page number
 *   Example: page=2 (get second page of results)
 *
 * limit (optional, number, default: 20, min: 1, max: 100)
 *   Results per page
 *   Example: limit=50 (get 50 results per page)
 *
 * convertedOnly (optional, boolean, default: false)
 *   Filter to show only clicks that converted to sales
 *   Example: convertedOnly=true
 *
 * startDate (optional, string, ISO 8601 format)
 *   Start of date range (inclusive)
 *   Example: 2026-01-01T00:00:00Z
 *
 * endDate (optional, string, ISO 8601 format)
 *   End of date range (inclusive)
 *   Example: 2026-03-13T23:59:59Z
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Referral history retrieved successfully",
 *   "data": {
 *     "referrals": [
 *       {
 *         "_id": "507f1f77bcf86cd799439011",
 *         "affiliateId": "507f1f77bcf86cd799439012",
 *         "affiliateCode": "AFF12345678",
 *         "ipAddress": "192.168.1.1",
 *         "device": "mobile",
 *         "referralSource": "email",
 *         "utmCampaign": "summer_sale",
 *         "utmMedium": "email",
 *         "utmSource": "mailchimp",
 *         "convertedToSale": true,
 *         "orderId": "507f1f77bcf86cd799439013",
 *         "commissionAmount": 25.50,
 *         "country": "US",
 *         "state": "CA",
 *         "createdAt": "2026-03-10T12:34:56.789Z",
 *         "conversionTimestamp": "2026-03-10T14:45:00.000Z"
 *       },
 *       {
 *         "_id": "507f1f77bcf86cd799439014",
 *         "affiliateId": "507f1f77bcf86cd799439012",
 *         "affiliateCode": "AFF12345678",
 *         "ipAddress": "192.168.1.2",
 *         "device": "desktop",
 *         "referralSource": "blog",
 *         "convertedToSale": false,
 *         "orderId": null,
 *         "commissionAmount": null,
 *         "country": "US",
 *         "state": "NY",
 *         "createdAt": "2026-03-11T10:20:30.000Z",
 *         "conversionTimestamp": null
 *       }
 *     ],
 *     "pagination": {
 *       "currentPage": 1,
 *       "totalPages": 5,
 *       "totalResults": 95,
 *       "resultsPerPage": 20,
 *       "hasNextPage": true,
 *       "hasPreviousPage": false
 *     }
 *   }
 * }
 *
 * ERROR RESPONSES:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 401 Unauthorized (Missing or invalid JWT)
 * 403 Forbidden (User is not an affiliate)
 * 400 Bad Request (Invalid query parameters)
 *
 * FIELD EXPLANATIONS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * _id                    - Unique tracking record ID
 * affiliateId            - ID of affiliate
 * affiliateCode          - Affiliate's referral code
 * ipAddress              - Visitor's IP address
 * device                 - Device type (mobile, tablet, desktop)
 * referralSource         - How visitor found link (email, social, blog, etc.)
 * utmCampaign            - UTM campaign identifier
 * utmMedium              - UTM medium
 * utmSource              - UTM source
 * convertedToSale        - Whether this click resulted in purchase
 * orderId                - Order ID if converted (null if not)
 * commissionAmount       - Commission earned (null if not converted)
 * country                - Visitor's country (ISO code)
 * state                  - Visitor's state/province
 * createdAt              - When click occurred
 * conversionTimestamp    - When purchase occurred (null if not converted)
 *
 * EXAMPLE USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * // Get first page of referrals
 * GET /api/affiliate/referrals
 * Authorization: Bearer <jwt_token>
 *
 * // Get second page with 50 results per page
 * GET /api/affiliate/referrals?page=2&limit=50
 * Authorization: Bearer <jwt_token>
 *
 * // Get only converted referrals
 * GET /api/affiliate/referrals?convertedOnly=true
 * Authorization: Bearer <jwt_token>
 *
 * // Get referrals from date range
 * GET /api/affiliate/referrals?startDate=2026-01-01&endDate=2026-03-13
 * Authorization: Bearer <jwt_token>
 *
 * // Get converted referrals from email source, second page
 * GET /api/affiliate/referrals?convertedOnly=true&utm_medium=email&page=2
 * Authorization: Bearer <jwt_token>
 *
 * FRONTEND USAGE:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * async function getReferrals(page = 1, convertedOnly = false) {
 *   const response = await fetch(
 *     `/api/affiliate/referrals?page=${page}&limit=20&convertedOnly=${convertedOnly}`,
 *     {
 *       headers: { 'Authorization': `Bearer ${token}` }
 *     }
 *   );
 *   return response.json();
 * }
 *
 * // Usage: Get converted referrals for dashboard
 * const data = await getReferrals(1, true);
 * const conversions = data.data.referrals.filter(r => r.convertedToSale);
 * const totalCommission = conversions.reduce((sum, r) => sum + r.commissionAmount, 0);
 *
 * USE CASES:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 1. Affiliate Dashboard
 *    - Display recent referral clicks
 *    - Show conversion history
 *    - Track commission earnings
 *    - Analyze traffic sources
 *
 * 2. Performance Analysis
 *    - Identify best-performing sources
 *    - Compare campaigns
 *    - Track conversion rates
 *    - Find optimization opportunities
 *
 * 3. Troubleshooting
 *    - Verify clicks are being recorded
 *    - Check conversion attribution
 *    - Investigate missing commissions
 *    - Track UTM parameter accuracy
 */

// ============================================================================
// ENDPOINT: Get Affiliate Sales
// ============================================================================

/**
 * GET /api/affiliate/sales
 *
 * Retrieve orders generated through affiliate referrals
 *
 * Returns paginated list of orders attributed to the affiliate,
 * with commission details for each sale.
 *
 * AUTHENTICATION: Required (JWT Bearer token)
 * AUTHORIZATION: Affiliate
 * METHOD: GET
 * RATE LIMIT: 50 requests per minute
 *
 * QUERY PARAMETERS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * page (optional, number, default: 1)
 *   Pagination page number
 *
 * limit (optional, number, default: 20, max: 100)
 *   Results per page
 *
 * status (optional, string)
 *   Filter by commission status
 *   Values: pending, approved, paid, reversed
 *
 * startDate, endDate (optional, ISO 8601)
 *   Date range for order creation
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate sales retrieved successfully",
 *   "data": {
 *     "sales": [
 *       {
 *         "_id": "507f1f77bcf86cd799439013",
 *         "orderId": "507f1f77bcf86cd799439014",
 *         "orderNumber": "ORD-2026-001234",
 *         "userId": "507f1f77bcf86cd799439015",
 *         "customerName": "John Doe",
 *         "customerEmail": "john@example.com",
 *         "totalAmount": 150.00,
 *         "itemCount": 1,
 *         "productNames": ["Sphere of Kings - Deluxe Edition"],
 *         "affiliateId": "507f1f77bcf86cd799439012",
 *         "affiliateCode": "AFF12345678",
 *         "commissionAmount": 25.50,
 *         "commissionPercentage": 17,
 *         "commissionStatus": "pending",
 *         "orderStatus": "delivered",
 *         "createdAt": "2026-03-10T14:45:00.000Z",
 *         "estimatedPayout": "2026-04-14T00:00:00.000Z"
 *       },
 *       {
 *         "_id": "507f1f77bcf86cd799439016",
 *         "orderId": "507f1f77bcf86cd799439017",
 *         "orderNumber": "ORD-2026-001235",
 *         "userId": "507f1f77bcf86cd799439018",
 *         "customerName": "Jane Smith",
 *         "customerEmail": "jane@example.com",
 *         "totalAmount": 75.00,
 *         "itemCount": 1,
 *         "productNames": ["Sphere of Kings - Standard Edition"],
 *         "affiliateId": "507f1f77bcf86cd799439012",
 *         "affiliateCode": "AFF12345678",
 *         "commissionAmount": 12.75,
 *         "commissionPercentage": 17,
 *         "commissionStatus": "paid",
 *         "orderStatus": "delivered",
 *         "createdAt": "2026-03-08T10:20:00.000Z",
 *         "paidDate": "2026-03-15T12:00:00.000Z"
 *       }
 *     ],
 *     "statistics": {
 *       "totalSales": 250.00,
 *       "totalCommissions": 42.50,
 *       "averageOrderValue": 125.00,
 *       "totalOrders": 2,
 *       "commission_status_breakdown": {
 *         "pending": 1,
 *         "approved": 0,
 *         "paid": 1,
 *         "reversed": 0
 *       }
 *     },
 *     "pagination": {
 *       "currentPage": 1,
 *       "totalPages": 1,
 *       "totalResults": 2
 *     }
 *   }
 * }
 *
 * FIELD EXPLANATIONS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * orderId                - MongoDB Order document ID
 * orderNumber            - Human-readable order number
 * totalAmount            - Total order amount in USD
 * itemCount              - Number of items in order
 * commissionAmount       - Affiliate's commission for this sale
 * commissionPercentage   - Commission rate applied (percent)
 * commissionStatus       - Current status of commission
 *   pending              - Waiting for approval before payout
 *   approved             - Approved for payout
 *   paid                 - Already paid to affiliate
 *   reversed             - Cancelled (e.g., due to refund)
 * estimatedPayout        - Estimated when commission will be paid
 * paidDate               - When commission was actually paid
 *
 * USE CASES:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 1. Affiliate Dashboard
 *    - Show recent sales
 *    - Display pending commissions
 *    - Track paid earnings
 *    - Project payout amounts
 *
 * 2. Financial Tracking
 *    - Calculate total earnings
 *    - Track payment history
 *    - Identify late payments
 *    - Verify commission calculations
 *
 * 3. Tax Reporting
 *    - Export sales data
 *    - Calculate annual earnings
 *    - Generate statements
 *    - Support affiliate accounting
 */

// ============================================================================
// ENDPOINT: Get Affiliate Analytics
// ============================================================================

/**
 * GET /api/affiliate/analytics
 *
 * Get detailed analytics for affiliate performance
 *
 * Returns comprehensive statistics about clicks, conversions, revenue,
 * and performance metrics for the affiliate.
 *
 * AUTHENTICATION: Required
 * AUTHORIZATION: Affiliate
 * METHOD: GET
 *
 * QUERY PARAMETERS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * metric (optional, string)
 *   Specific metric to retrieve
 *   Options: clicks, conversions, revenue, engagement, geographic
 *
 * startDate, endDate (optional)
 *   Date range for analysis
 *
 * groupBy (optional, string)
 *   Group results by dimension
 *   Options: source, device, country, date, campaign
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate analytics retrieved successfully",
 *   "data": {
 *     "period": {
 *       "startDate": "2026-02-11T00:00:00.000Z",
 *       "endDate": "2026-03-13T23:59:59.999Z"
 *     },
 *     "overview": {
 *       "totalClicks": 1523,
 *       "totalConversions": 47,
 *       "conversionRate": 3.09,
 *       "totalRevenue": 5887.50,
 *       "totalCommissions": 999.88,
 *       "commissionPercentage": 17,
 *       "averageOrderValue": 125.27,
 *       "averageCommissionPerSale": 21.27,
 *       "returningVisitorRate": 18.5
 *     },
 *     "performanceMetrics": {
 *       "clickGrowthRate": 5.2,
 *       "conversionTrend": "improving",
 *       "topPerformingSource": "email",
 *       "topPerformingDevice": "mobile",
 *       "topPerformingRegion": "United States",
 *       "bestPerformingDay": "Friday",
 *       "peakHour": "14:00-15:00"
 *     },
 *     "trafficBySource": [
 *       {
 *         "source": "email",
 *         "clicks": 612,
 *         "conversions": 25,
 *         "revenue": 3127.50,
 *         "commissionRate": 17,
 *         "earnings": 531.68,
 *         "conversionRate": 4.08,
 *         "roi": 3.47
 *       },
 *       {
 *         "source": "social",
 *         "clicks": 511,
 *         "conversions": 12,
 *         "revenue": 1502.40,
 *         "commissionRate": 17,
 *         "earnings": 255.41,
 *         "conversionRate": 2.35,
 *         "roi": 2.28
 *       },
 *       {
 *         "source": "blog",
 *         "clicks": 400,
 *         "conversions": 10,
 *         "revenue": 1257.70,
 *         "commissionRate": 17,
 *         "earnings": 213.80,
 *         "conversionRate": 2.50,
 *         "roi": 1.98
 *       }
 *     ],
 *     "trafficByDevice": [
 *       {
 *         "device": "mobile",
 *         "clicks": 823,
 *         "conversions": 28,
 *         "revenue": 3502.30,
 *         "earnings": 595.39,
 *         "conversionRate": 3.40
 *       },
 *       {
 *         "device": "desktop",
 *         "clicks": 650,
 *         "conversions": 18,
 *         "revenue": 2251.50,
 *         "earnings": 382.76,
 *         "conversionRate": 2.77
 *       },
 *       {
 *         "device": "tablet",
 *         "clicks": 50,
 *         "conversions": 1,
 *         "revenue": 133.70,
 *         "earnings": 22.73,
 *         "conversionRate": 2.00
 *       }
 *     ],
 *     "geographicBreakdown": [
 *       {
 *         "country": "US",
 *         "state": "CA",
 *         "clicks": 450,
 *         "conversions": 18,
 *         "revenue": 2250.00,
 *         "earnings": 382.50,
 *         "conversionRate": 4.00
 *       },
 *       {
 *         "country": "US",
 *         "state": "NY",
 *         "clicks": 380,
 *         "conversions": 14,
 *         "revenue": 1750.00,
 *         "earnings": 297.50,
 *         "conversionRate": 3.68
 *       },
 *       {
 *         "country": "US",
 *         "state": "TX",
 *         "clicks": 320,
 *         "conversions": 10,
 *         "revenue": 1250.00,
 *         "earnings": 212.50,
 *         "conversionRate": 3.13
 *       }
 *     ],
 *     "dailyTrend": [
 *       {
 *         "date": "2026-03-13",
 *         "clicks": 45,
 *         "conversions": 2,
 *         "revenue": 315.00,
 *         "earnings": 53.55
 *       },
 *       {
 *         "date": "2026-03-12",
 *         "clicks": 62,
 *         "conversions": 3,
 *         "revenue": 450.00,
 *         "earnings": 76.50
 *       }
 *     ],
 *     "campaignPerformance": [
 *       {
 *         "campaign": "summer_sale",
 *         "clicks": 750,
 *         "conversions": 30,
 *         "revenue": 3750.00,
 *         "earnings": 637.50,
 *         "conversionRate": 4.00,
 *         "roi": 3.75
 *       },
 *       {
 *         "campaign": "spring_promo",
 *         "clicks": 500,
 *         "conversions": 12,
 *         "revenue": 1500.00,
 *         "earnings": 255.00,
 *         "conversionRate": 2.40,
 *         "roi": 2.15
 *       }
 *     ]
 *   }
 * }
 *
 * METRIC DEFINITIONS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * totalClicks                  - Total referral clicks in period
 * totalConversions             - Clicks that resulted in purchases
 * conversionRate (%)           - conversions / clicks * 100
 * totalRevenue                 - Total order value from attributed sales
 * totalCommissions             - Total commission earned
 * averageOrderValue            - Average price of attributed orders
 * averageCommissionPerSale     - Average commission per conversion
 * returningVisitorRate (%)     - Percentage of repeat visitors
 * clickGrowthRate (%)          - % change from previous period
 * roi                          - Return on investment (earnings / clicks)
 *
 * USE CASES:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * 1. Dashboard Display
 *    - Show performance overview widgets
 *    - Display charts and trends
 *    - Highlight top performing channels
 *    - Show earnings projections
 *
 * 2. Strategy Optimization
 *    - Identify best traffic sources
 *    - Compare device performance
 *    - Find geographic opportunities
 *    - Test new campaigns
 *
 * 3. Reporting
 *    - Generate monthly reports
 *    - Share with partners
 *    - Track KPIs
 *    - Demonstrate ROI
 */

// ============================================================================
// ENDPOINT: Update Payout Settings
// ============================================================================

/**
 * POST /api/affiliate/payout-settings
 *
 * Update affiliate payout configuration (payment method, frequency, threshold)
 *
 * AUTHENTICATION: Required
 * AUTHORIZATION: Affiliate
 * METHOD: POST
 *
 * REQUEST BODY:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "payoutMethod": "stripe|bank|paypal",      // (required) Payment method
 *   "payoutFrequency": "weekly|biweekly|monthly", // (optional) Payout schedule
 *   "minimumPayout": 50,                        // (optional) Minimum earnings threshold
 *   "stripeConnectedAccountId": "acct_...",    // (if payoutMethod=stripe)
 *   "bankAccountNumber": "123456789",          // (if payoutMethod=bank)
 *   "bankRoutingNumber": "021000021",          // (if payoutMethod=bank)
 *   "paypalEmail": "user@example.com"          // (if payoutMethod=paypal)
 * }
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Payout settings updated successfully",
 *   "data": {
 *     "affiliateId": "507f...",
 *     "payoutMethod": "stripe",
 *     "payoutFrequency": "monthly",
 *     "minimumPayout": 50,
 *     "stripeConnectedAccountId": "acct_...",
 *     "lastUpdated": "2026-03-13T12:34:56.789Z"
 *   }
 * }
 */

// ============================================================================
// ENDPOINT: Get Top Affiliates (Public)
// ============================================================================

/**
 * GET /api/leaderboard/affiliates
 *
 * Retrieve top performing affiliates leaderboard
 *
 * Public endpoint showing top affiliates for motivation and recognition
 *
 * AUTHENTICATION: None (public endpoint)
 * METHOD: GET
 *
 * QUERY PARAMETERS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * metric (optional, string)
 *   Ranking metric
 *   Values: earnings, sales, clicks, conversionRate
 *   Default: earnings
 *
 * period (optional, string)
 *   Time period for ranking
 *   Values: thisMonth, lastMonth, thisYear, allTime
 *   Default: thisMonth
 *
 * limit (optional, number, default: 10, max: 100)
 *   Number of top affiliates to return
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Top affiliates retrieved successfully",
 *   "data": {
 *     "leaderboard": [
 *       {
 *         "rank": 1,
 *         "affiliateCode": "AFF12345678",
 *         "displayName": "Email Marketing Pro",
 *         "metric_value": 4500.50,
 *         "metric_label": "Total Earnings",
 *         "period": "March 2026",
 *         "badge": "Platinum"
 *       },
 *       {
 *         "rank": 2,
 *         "affiliateCode": "AFF23456789",
 *         "displayName": "Social Media Guru",
 *         "metric_value": 3250.75,
 *         "metric_label": "Total Earnings",
 *         "period": "March 2026",
 *         "badge": "Gold"
 *       }
 *     ],
 *     "period": {
 *       "label": "March 2026",
 *       "startDate": "2026-03-01T00:00:00.000Z",
 *       "endDate": "2026-03-31T23:59:59.999Z"
 *     }
 *   }
 * }
 */

// ============================================================================
// ENDPOINT: Get Affiliate Dashboard
// ============================================================================

/**
 * GET /api/affiliate/dashboard
 *
 * Get affiliate profile and overview statistics
 *
 * AUTHENTICATION: Required
 * AUTHORIZATION: Affiliate
 * METHOD: GET
 *
 * QUERY PARAMETERS:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * startDate (optional, ISO 8601)
 *   Dashboard data start date
 *
 * endDate (optional, ISO 8601)
 *   Dashboard data end date
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "statusCode": 200,
 *   "message": "Affiliate dashboard retrieved successfully",
 *   "data": {
 *     "dashboard": {
 *       "profile": {
 *         "_id": "507f...",
 *         "userId": "507f...",
 *         "affiliateCode": "AFF12345678",
 *         "status": "active",
 *         "joinDate": "2026-01-15T10:30:00.000Z",
 *         "referralLink": "https://spherekings.com/?ref=AFF12345678"
 *       },
 *       "metrics": {
 *         "thisMonth": {
 *           "totalClicks": 450,
 *           "totalConversions": 18,
 *           "conversionRate": 4.00,
 *           "totalEarnings": 2250.00,
 *           "pendingEarnings": 500.00,
 *           "paidEarnings": 1750.00
 *         },
 *         "allTime": {
 *           "totalClicks": 2150,
 *           "totalConversions": 87,
 *           "conversionRate": 4.05,
 *           "totalEarnings": 10887.50
 *         }
 *       },
 *       "recentSales": [
 *         {
 *           "orderNumber": "ORD-2026-001234",
 *           "amount": 150.00,
 *           "commission": 25.50,
 *           "date": "2026-03-13T14:30:00.000Z"
 *         }
 *       ],
 *       "payoutStatus": {
 *         "method": "stripe",
 *         "nextPayoutDate": "2026-04-15T00:00:00.000Z",
 *         "minimumPayout": 50.00,
 *         "pendingAmount": 500.00
 *       }
 *     }
 *   }
 * }
 */

// ============================================================================
// ATTRIBUTE ORDER TO AFFILIATE (Admin)
// ============================================================================

/**
 * POST /api/admin/orders/:orderId/attribute
 *
 * Manually attribute an order to an affiliate (Admin only)
 *
 * AUTHENTICATION: Required
 * AUTHORIZATION: Admin
 * METHOD: POST
 *
 * REQUEST BODY:
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "affiliateCode": "AFF12345678"
 * }
 *
 * SUCCESS RESPONSE: 200 OK
 * ─────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": true,
 *   "message": "Order attributed successfully",
 *   "data": {
 *     "orderId": "507f...",
 *     "affiliateId": "507f...",
 *     "affiliateCode": "AFF12345678",
 *     "commissionAmount": 25.50
 *   }
 * }
 */

// ============================================================================
// DATA MODELS & STRUCTURE
// ============================================================================

/**
 * ReferralTracking Document Structure
 * ──────────────────────────────────────────────────────────────────────────
 *
 * {
 *   _id: ObjectId,
 *   affiliateId: ObjectId (ref: Affiliate),
 *   affiliateCode: String (AFF12345678),
 *   visitorId: String (optional, user ID if identified),
 *   ipAddress: String,
 *   userAgent: String,
 *   httpReferrer: String,
 *   referralSource: String (email|social|blog|direct|other),
 *   utmCampaign: String (optional),
 *   utmMedium: String (optional),
 *   utmSource: String (optional),
 *   utmContent: String (optional),
 *   landingUrl: String,
 *   device: String (mobile|tablet|desktop),
 *   browser: { name, version },
 *   os: { name, version },
 *   country: String (US),
 *   state: String (CA),
 *   city: String (San Francisco),
 *   cookieId: String (optional, unique session ID),
 *   sessionId: String (optional),
 *   convertedToSale: Boolean,
 *   orderId: ObjectId (optional, ref: Order),
 *   commissionAmount: Number (optional),
 *   conversionTimestamp: Date (optional),
 *   createdAt: Date,
 *   expiresAt: Date (TTL: 90 days),
 *   metadata: {
 *     affiliateWasActive: Boolean,
 *     fraudFlags: [String],
 *     notes: String
 *   }
 * }
 */

// ============================================================================
// ERROR CODES & MESSAGES
// ============================================================================

/**
 * Error Response Format:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": false,
 *   "statusCode": 400,
 *   "message": "Error description",
 *   "errors": [
 *     {
 *       "field": "fieldName",
 *       "message": "Field error description"
 *     }
 *   ]
 * }
 *
 * Common HTTP Status Codes:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 200 OK                    - Request succeeded
 * 201 Created              - Resource created
 * 400 Bad Request          - Invalid parameters
 * 401 Unauthorized         - Missing/invalid authentication
 * 403 Forbidden            - User not authorized for resource
 * 404 Not Found            - Resource not found
 * 409 Conflict             - Request conflicts with existing data
 * 429 Too Many Requests    - Rate limit exceeded
 * 500 Internal Server Error - Server error
 *
 * Specific Error Messages:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * "Affiliate code not found"
 *   - Affiliate doesn't exist or is inactive
 *   Action: Verify affiliate code is correct
 *
 * "Cannot use your own referral link"
 *   - Affiliate tried to use their own code
 *   Action: Not allowed for fraud prevention
 *
 * "Invalid date format"
 *   - Date parameters not ISO 8601
 *   Action: Use format: YYYY-MM-DDTHH:MM:SS.sssZ
 *
 * "User is not an affiliate"
 *   - Attempting to access affiliate endpoint as regular user
 *   Action: Register as affiliate first
 *
 * "Affiliate not found"
 *   - Affiliate ID doesn't exist
 *   Action: Verify affiliate ID is correct
 */

// ============================================================================
// RATE LIMITING INFORMATION
// ============================================================================

/**
 * Global Rate Limits:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * Default: 100 requests per 15 minutes per IP
 *
 * Endpoint-Specific Limits:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * GET /api/tracking/click
 *   - 30 requests/minute without ref parameter
 *   - Reason: Prevent bot spam
 *
 * GET /api/affiliate/referrals
 *   - 50 requests/minute
 *   - Reason: Prevent scraping
 *
 * GET /api/affiliate/analytics
 *   - 20 requests/minute
 *   - Reason: Expensive query
 *
 * POST /api/affiliate/payout-settings
 *   - 10 requests/minute
 *   - Reason: Sensitive financial operation
 *
 * Rate Limit Response Headers:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * RateLimit-Limit: 100
 * RateLimit-Remaining: 95
 * RateLimit-Reset: 1615660000
 *
 * Rate Limit Exceeded Response: 429 Too Many Requests
 * ──────────────────────────────────────────────────────────────────────────
 *
 * {
 *   "success": false,
 *   "statusCode": 429,
 *   "message": "Too many requests from this IP, please try again later",
 *   "retryAfter": 60
 * }
 */

// ============================================================================
// BEST PRACTICES
// ============================================================================

/**
 * For Affiliate Management:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 1. Always include UTM parameters with referral links
 *    - utm_campaign: Campaign identifier
 *    - utm_medium: Channel (email, social, blog)
 *    - utm_source: Specific platform
 *    - Enables detailed analytics and ROI tracking
 *
 * 2. Monitor conversion rates regularly
 *    - Target: 3-5% typical for product referrals
 *    - Low rate: Improve landing page or traffic quality
 *    - High rate: Scale up, use as model for others
 *
 * 3. Test multiple traffic sources
 *    - Email campaigns: Higher quality, lower volume
 *    - Social media: Higher volume, higher fraud risk
 *    - Blog content: Medium quality, sustainable
 *    - Compare ROI by source
 *
 * 4. Use short links for better tracking
 *    - Create memorable short links (e.g., domain.com/ref/AFF12345678)
 *    - Easier to share on social media
 *    - Better email compatibility
 *
 * 5. Optimize for mobile
 *    - Mobile has higher conversion rates
 *    - Ensure landing pages are mobile-friendly
 *    - Use mobile-optimized tracking parameters
 *
 * For API Consumers:
 * ──────────────────────────────────────────────────────────────────────────
 *
 * 1. Always include proper error handling
 *    - Handle network timeouts
 *    - Retry on 5xx errors
 *    - Log unexpected responses
 *
 * 2. Cache dashboard data
 *    - Expensive queries to retrieve
 *    - Refresh every minute or on-demand
 *    - Use client-side caching for UI
 *
 * 3. Implement proper pagination
 *    - Don't retrieve all results at once
 *    - Use limit/offset pattern
 *    - Provide pagination controls in UI
 *
 * 4. Store dates consistently
 *    - Always use ISO 8601 format
 *    - Store in UTC
 *    - Convert in frontend for display
 *
 * 5. Secure sensitive data
 *    - Don't log affiliate codes in frontend
 *    - Use HTTPS for all API calls
 *    - Clear cookies on logout
 */

// ============================================================================
// SUMMARY
// ============================================================================

/**
 * The Referral Tracking API enables:
 *
 * 1. PUBLIC CLICK TRACKING
 *    - Record affiliate referral clicks
 *    - Validate affiliate codes
 *    - Set attribution cookies
 *    - Instant redirect to site
 *
 * 2. AFFILIATE ANALYTICS
 *    - View referral click history
 *    - See attribution metrics
 *    - Track commission earnings
 *    - Analyze traffic sources
 *
 * 3. PURCHASE ATTRIBUTION
 *    - Cookies enable checkout attribution
 *    - Orders linked to affiliates
 *    - Commissions calculated automatically
 *    - Performance metrics tracked
 *
 * 4. FRAUD PREVENTION
 *    - IP validation and pattern detection
 *    - Self-referral prevention
 *    - Cookie security features
 *    - Rate limiting
 *
 * This system ensures that affiliate marketing is:
 * ✅ Fair - Accurate attribution and commission calculation
 * ✅ Transparent - Detailed analytics and tracking
 * ✅ Secure - Multiple fraud detection mechanisms
 * ✅ Scalable - Efficient database queries and caching
 * ✅ Reliable - 99.9% uptime target, automatic cleanup
 */
