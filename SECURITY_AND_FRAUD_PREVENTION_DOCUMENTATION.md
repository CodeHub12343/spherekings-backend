/**
 * ============================================================================
 * SECURITY & FRAUD PREVENTION SYSTEM - COMPREHENSIVE DOCUMENTATION
 * ============================================================================
 *
 * Production-Ready Backend Security Infrastructure
 * Version: 1.0.0
 * Last Updated: 2024
 *
 * This document provides complete documentation for the Spherekings Marketplace
 * security and fraud prevention system, including architecture, configuration,
 * deployment, monitoring, and incident response procedures.
 *
 * ============================================================================
 * TABLE OF CONTENTS
 * ============================================================================
 *
 * 1. Security Architecture Overview
 * 2. Authentication Layer (Brute Force Prevention & Account Lockout)
 * 3. Rate Limiting Strategy (Global + Endpoint-Specific)
 * 4. Fraud Detection Mechanisms
 * 5. Security Logging & Monitoring
 * 6. API Protection & Input Validation
 * 7. Admin Workflows & Security Review
 * 8. Production Deployment Checklist
 * 9. Incident Response Procedures
 * 10. Testing & Validation Strategy
 *
 * ============================================================================
 * 1. SECURITY ARCHITECTURE OVERVIEW
 * ============================================================================
 *
 * The Spherekings security system is a multi-layered defense architecture
 * protecting authentication, APIs, affiliate systems, and financial transactions.
 *
 * LAYERED SECURITY FLOW:
 *
 *   Request
 *     ↓
 *   [1] Helmet Headers → Security HTTP headers (content-security-policy, etc.)
 *     ↓
 *   [2] CORS Validation → Cross-origin request checking
 *     ↓
 *   [3] Security Context → Add IP, device info to request
 *     ↓
 *   [4] IP Block Check → Block known malicious IPs
 *     ↓
 *   [5] Global Rate Limiter → 1,000 requests/15min per IP
 *     ↓
 *   [6] Endpoint-Specific Rate Limiters → Auth, checkout, admin limits
 *     ↓
 *   [7] Input Validation → Body size, format, sanitization
 *     ↓
 *   [8] Account Lockout Check → Prevent brute force (5 attempts/15min)
 *     ↓
 *   [9] Business Logic → Route handler execution
 *     ↓
 *   [10] Fraud Detection → Post-transaction fraud analysis
 *     ↓
 *   [11] Security Logging → Log all security events & anomalies
 *     ↓
 *   Response
 *
 * THREAT COVERAGE:
 *
 *   ✓ Brute Force Attacks      - Account lockout after 5 failed attempts
 *   ✓ API Abuse                 - Global + endpoint-specific rate limiting
 *   ✓ Self-Referral Fraud       - Prevent users earning from own purchases
 *   ✓ Bot-Generated Traffic     - Detect anomalous referral patterns
 *   ✓ Commission Manipulation   - Detect unusual earning spikes
 *   ✓ Payout Fraud             - Validate payouts before processing
 *   ✓ IP-Based Abuse           - Block suspicious IPs, detect patterns
 *   ✓ XSS Attacks              - Input sanitization + React default protection
 *   ✓ NoSQL Injection           - MongoDB sanitization middleware
 *   ✓ DDoS Attacks             - Rate limiting, request validation
 *
 * ============================================================================
 * 2. AUTHENTICATION LAYER
 * ============================================================================
 *
 * BRUTE FORCE PREVENTION:
 *
 *   Mechanism: Account lockout after failed login attempts
 *   Location: src/middlewares/securityMiddleware.js
 *
 *   Configuration:
 *   - Max attempts: 5 per email+IP
 *   - Time window: 15 minutes
 *   - Lockout duration: 15 minutes
 *   - Reset: Clears on successful login
 *
 *   Implementation:
 *   1. recordFailedLogin(email, ipAddress) - Increment attempt counter
 *   2. isAccountLocked(email) - Check if account locked & not expired
 *   3. lockoutAccount(email, attemptCount) - Lock account for duration
 *   4. clearLoginAttempts(email) - Reset attempts on success
 *
 *   Route Integration:
 *   app.use(`${API_PREFIX}/auth`, authLimiter, checkAccountLockout, ...);
 *
 *   Response on Lockout:
 *   {
 *     "success": false,
 *     "error": "Account locked due to too many failed login attempts",
 *     "message": "Please try again in 15 minutes",
 *     "lockedUntil": "2024-01-15T10:30:00.000Z"
 *   }
 *
 * PASSWORD SECURITY:
 *
 *   Requirements:
 *   - Minimum 8 characters
 *   - 1 uppercase letter (A-Z)
 *   - 1 lowercase letter (a-z)
 *   - 1 number (0-9)
 *   - 1 special character (!@#$%^&*)
 *
 *   Validation: validatePasswordStrength(password)
 *   Storage: bcrypt hashing (10 rounds)
 *   Transmission: Always over HTTPS
 *
 * JWT TOKEN SECURITY:
 *
 *   Token Format: Bearer <JWT_token>
 *   Algorithm: HS256 (HMAC with SHA-256)
 *   Secret: Stored in .env as JWT_SECRET
 *   Expiration: Configurable per environment
 *   Storage: HTTP-only cookies (preferred) or localStorage
 *   Transmission: Authorization header
 *
 * ============================================================================
 * 3. RATE LIMITING STRATEGY
 * ============================================================================
 *
 * RATE LIMITERS CONFIGURED:
 *
 *   1. GLOBAL LIMITER
 *      Location: All requests (except /health)
 *      Limit: 1,000 requests / 15 minutes
 *      Per: IP address
 *      Purpose: General DDoS protection
 *      Response: 429 Too Many Requests
 *
 *   2. AUTH LIMITER
 *      Route: POST /api/v1/auth/login
 *      Limit: 5 login attempts / 15 minutes
 *      Per: email + IP address
 *      Purpose: Brute force prevention
 *      Integrates with: Account lockout mechanism
 *
 *   3. PASSWORD RESET LIMITER
 *      Route: POST /api/v1/auth/forgot-password
 *      Limit: 3 attempts / 1 hour
 *      Per: email + IP address
 *      Purpose: Prevent password reset abuse
 *
 *   4. AFFILIATE SIGNUP LIMITER
 *      Route: POST /api/v1/affiliate/register
 *      Limit: 10 signups / 1 hour
 *      Per: IP address
 *      Purpose: Prevent account creation abuse
 *
 *   5. CHECKOUT LIMITER
 *      Route: POST /api/v1/checkout (checkout routes)
 *      Limit: 5 checkouts / 1 minute
 *      Per: user ID
 *      Purpose: Detect rapid payment abuse
 *
 *   6. ADMIN LIMITER
 *      Route: /api/v1/admin/*
 *      Limit: 100 requests / 1 minute
 *      Per: admin user
 *      Purpose: Allow admin operations while limiting others
 *
 * RATE LIMIT RESPONSE:
 *
 *   HTTP 429
 *   {
 *     "success": false,
 *     "error": "Too many requests from this IP, please try again later.",
 *     "retryAfter": 45  // seconds
 *   }
 *
 * RATE LIMIT HEADERS:
 *
 *   RateLimit-Limit: 1000        // Max requests per window
 *   RateLimit-Remaining: 999     // Remaining requests
 *   RateLimit-Reset: 1673779200  // Unix timestamp when limit resets
 *   Retry-After: 45              // Seconds until next attempt allowed
 *
 * ============================================================================
 * 4. FRAUD DETECTION MECHANISMS
 * ============================================================================
 *
 * Location: src/security/fraudDetectionService.js
 *
 * Core Analysis Methods:
 *
 * A. SELF-REFERRAL PREVENTION
 *    What: Detect affiliate users earning commission on own purchases
 *    When: Before commission creation
 *    Check: affiliateId !== userId
 *    Risk Level: CRITICAL
 *    Action: Deny commission creation
 *
 * B. SAME IP MULTIPLE PURCHASES
 *    What: Detect multiple orders linked to same affiliate from same IP
 *    When: Before commission creation
 *    Threshold: 5+ orders from same IP in 7 days
 *    Risk Level: HIGH
 *    Action: Flag for admin review, deny high-value commissions
 *
 * C. PURCHASE VELOCITY ABUSE
 *    What: Detect unusually rapid orders from single IP
 *    When: Before commission creation
 *    Threshold: 10+ orders in 24 hours
 *    Risk Level: HIGH
 *    Action: Block transactions, notify admin
 *
 * D. REFERRAL PATTERN ANALYSIS
 *    What: Detect bot-like referral click patterns
 *    When: When analyzing affiliate referral activity
 *    Patterns Detected:
 *      - Many clicks from few IPs
 *      - Many clicks from few user agents
 *      - Rapid sequential clicks (bot behavior)
 *    Risk Level: MEDIUM to HIGH
 *    Action: Flag affiliate for review, suspend if automatic
 *
 * E. COMMISSION SPIKE DETECTION
 *    What: Detect unusual commission earning spikes
 *    When: During commission calculation
 *    Baseline: Average of last 30 days of commissions
 *    Trigger: 3x increase from baseline
 *    Window: Last 7 days
 *    Risk Level: MEDIUM
 *    Action: Flag for review, require admin approval
 *
 * F. GEOGRAPHIC ANOMALY
 *    What: Detect inconsistent order locations
 *    When: During order fraud analysis
 *    Check: Location changes > 500km in < 4 hours
 *    Risk Level: LOW to MEDIUM
 *    Action: Log suspicious activity, monitor
 *
 * G. HIGH VALUE PAYOUT VALIDATION
 *    What: Ensure high-value payouts are legitimate
 *    When: Before payout processing
 *    Threshold: $5,000+
 *    Checks:
 *      - Affiliate account age > 30 days
 *      - Valid payout method
 *      - No recent fraud flags
 *      - Account not in lockout
 *    Risk Level: CRITICAL for violations
 *    Action: Require admin verification
 *
 * H. DUPLICATE COMMISSION PREVENTION
 *    What: Prevent paying same commission twice
 *    When: Before commission payout
 *    Check: No previous payout for same commission
 *    Risk Level: HIGH
 *    Action: Block duplicate payout
 *
 * FRAUD RISK LEVELS:
 *
 *   LOW      - Minor concern, log and monitor
 *   MEDIUM   - Requires investigation, flag in admin dashboard
 *   HIGH     - Potential fraud, deny transaction, require manual review
 *   CRITICAL - Definite fraud indicator, block immediately, escalate
 *
 * ============================================================================
 * 5. SECURITY LOGGING & MONITORING
 * ============================================================================
 *
 * Location: src/security/securityLogger.js
 *
 * LOGGING FEATURES:
 *
 *   ✓ Real-time event logging
 *   ✓ In-memory cache (10,000 events max)
 *   ✓ Daily file persistence (logs/security/)
 *   ✓ Critical event alerts
 *   ✓ JSON and CSV export
 *   ✓ Security summary statistics
 *   ✓ Fraud tracking and reporting
 *
 * EVENT TYPES LOGGED:
 *
 *   1. auth_failure      - Failed login attempts
 *   2. auth_success      - Successful logins
 *   3. rate_limit_exceeded - Rate limit breaches
 *   4. fraud_flag        - Fraud detections
 *   5. fraud_check       - All fraud analysis runs
 *   6. suspicious_activity - Unusual behavior
 *   7. api_abuse         - API abuse patterns
 *   8. account_lockout   - Account lockouts
 *   9. payout_flag       - Flagged payouts
 *   10. ip_blocked       - IP blocks
 *   11. referral_anomaly - Suspicious referral patterns
 *
 * SEVERITY LEVELS:
 *
 *   INFO     - Informational, normal operation
 *   WARNING  - Warning, requires attention
 *   ERROR    - Error, action needed
 *   CRITICAL - Critical, immediate escalation
 *
 * LOGGING EXAMPLES:
 *
 *   logAuthFailure(email, ipAddress, reason, attemptCount)
 *   → Auto-alert when attempts >= 5
 *
 *   logFraudFlag(entityId, entityType, reason, riskLevel, details)
 *   → Auto-alert for HIGH/CRITICAL risk levels
 *
 *   logRateLimitViolation(ipAddress, endpoint, requestCount, timeWindow)
 *   → Auto-alert when requests > 1000
 *
 *   logPayoutFlag(payoutId, affiliateId, amount, flags)
 *   → Auto-alert for critical payment issues
 *
 * LOG FILE STRUCTURE:
 *
 *   logs/security/YYYY-MM-DD.json
 *
 *   Example Entry:
 *   {
 *     "timestamp": "2024-01-15T10:30:45.123Z",
 *     "type": "fraud_flag",
 *     "severity": "HIGH",
 *     "entityId": "order_123",
 *     "entityType": "order",
 *     "userId": "user_456",
 *     "ipAddress": "192.168.1.***",
 *     "reason": "self_referral",
 *     "riskLevel": "CRITICAL",
 *     "details": {
 *       "affiliateId": "affiliate_789",
 *       "flags": [{"reason": "self_referral"}]
 *     }
 *   }
 *
 * SECURITY SUMMARY RETRIEVAL:
 *
 *   // Get summary of last 24 hours
 *   const summary = securityLogger.getSecuritySummary({
 *     hoursBack: 24,
 *     minSeverity: 'WARNING'
 *   });
 *
 *   // Get critical alerts only
 *   const alerts = securityLogger.getCriticalAlerts();
 *
 *   // Get fraud statistics
 *   const stats = securityLogger.getFraudSummary();
 *
 * ============================================================================
 * 6. API PROTECTION & INPUT VALIDATION
 * ============================================================================
 *
 * INPUT VALIDATION LAYERS:
 *
 *   1. Body Size Validation
 *      - Max: 10MB (configurable)
 *      - Check before JSON parsing
 *      - Returns 413 Payload Too Large
 *
 *   2. Email Validation
 *      - Format: RFC 5322 compliant
 *      - Regex: /^[^\s@]+@[^\s@]+\.[^\s@]+$/
 *      - Used in registration and auth
 *
 *   3. Password Strength Validation
 *      - Min 8 chars, uppercase, lowercase, number, special char
 *      - Used in registration endpoints
 *      - Error: Returns specific requirements failed
 *
 *   4. Input Sanitization
 *      - Removes angle brackets (< >)
 *      - Prevents XSS injection
 *      - Applied to all text inputs
 *      - Function: sanitizeInput(input)
 *
 *   5. MongoDB Sanitization
 *      - Prevents NoSQL injection
 *      - Middleware: mongoSanitize()
 *      - Removes $, key injection attempts
 *
 *   6. Request Body Structure Validation
 *      - Email field required for auth
 *      - Password strength required
 *      - Additional fields validated per endpoint
 *
 * VALIDATION ERROR RESPONSES:
 *
 *   HTTP 400 Bad Request
 *   {
 *     "success": false,
 *     "error": "Validation failed",
 *     "details": {
 *       "email": "Invalid email format",
 *       "password": [
 *         "Must be at least 8 characters",
 *         "Must contain uppercase letter",
 *         "Must contain number"
 *       ]
 *     }
 *   }
 *
 * ============================================================================
 * 7. ADMIN WORKFLOWS & SECURITY REVIEW
 * ============================================================================
 *
 * ADMIN DASHBOARD ACCESS:
 *   Route: /api/v1/admin
 *   Auth: JWT token + admin role verification
 *   Rate Limit: 100 requests/minute (lenient for admin)
 *   Access Control: Super_admin or admin role only
 *
 * FRAUD REVIEW WORKFLOW:
 *
 *   1. IDENTIFY FLAGGED ITEMS
 *      Dashboard shows: High/Critical fraud flags
 *      Filter: By risk level, date range, affiliate
 *      View: Order details, referral history, account info
 *
 *   2. INVESTIGATE
 *      Review fraud reasons from detection service
 *      Check: IP patterns, historical affiliate behavior
 *      Analyze: Similar pattern occurrences
 *      Validate: Commission legitimacy
 *
 *   3. APPROVE OR DENY
 *
 *      APPROVE:
 *      - Mark fraud flag as "reviewed_approved"
 *      - Process commission/payout
 *      - Log approval reason
 *      - Notify affiliate if blocked
 *
 *      DENY:
 *      - Mark fraud flag as "fraud_confirmed"
 *      - Reverse commission if already paid
 *      - Block affiliate account (optional)
 *      - Initiate refund process if needed
 *      - Log reason for denial
 *      - Notify fraud team
 *
 *   4. MONITOR
 *      Track: Denied percentages per affiliate
 *      Analyze: Common fraud patterns
 *      Update: Detection thresholds if needed
 *
 * ACCOUNT LOCKOUT MANAGEMENT:
 *
 *   ISSUE: Account locked after failed logins
 *   ACCESS: Admin → Security Settings → Locked Accounts
 *   ACTIONS:
 *     - View: Locked account list with lock duration
 *     - Release: Manually unlock account (shortcut)
 *     - Reset: Clear failed login attempts on account
 *     - Audit: View failed login history
 *
 * IP BLOCK MANAGEMENT:
 *
 *   ISSUE: IP blocked for suspicious activity
 *   ACCESS: Admin → Security Settings → Blocked IPs
 *   ACTIONS:
 *     - List: All currently blocked IPs with reasons
 *     - Whitelist: Remove block and allowlist IP
 *     - Block: Manually block new IP
 *     - Duration: Set block duration or permanent
 *
 * AFFILIATE SUSPENSION/TERMINATION:
 *
 *   TRIGGER: Multiple high-risk fraud flags
 *   PROCESS:
 *     1. Flag affiliate account (NOT suspended yet)
 *     2. Review: Admin investigates history
 *     3. Decision: Suspend (temporary) or Terminate (permanent)
 *     4. Process: Reverse fraudulent commissions
 *     5. Communicate: Notify affiliate of action
 *     6. Log: Document reason and evidence
 *
 * ============================================================================
 * 8. PRODUCTION DEPLOYMENT CHECKLIST
 * ============================================================================
 *
 * SECURITY CONFIGURATION:
 *
 *   ☐ JWT_SECRET set to strong random value (32+ chars)
 *   ☐ ENCRYPTION_KEY set for data encryption (32 chars)
 *   ☐ MongoDB connection string uses authentication
 *   ☐ Redis connection configured (for distributed rate limiting)
 *   ☐ HTTPS enabled on all endpoints
 *   ☐ CORS_ORIGIN set to specific domain (not *)
 *   ☐ Environment: NODE_ENV = 'production'
 *   ☐ Debug logging disabled (console.log removed from routes)
 *   ☐ Error messages don't leak sensitive info
 *   ☐ API keys/secrets not in code or logs
 *
 * FRAUD DETECTION TUNING:
 *
 *   ☐ Adjust fraud detection thresholds for your business
 *   ☐ Review false positive rate in first week
 *   ☐ Monitor admin workload for flagged items
 *   ☐ Set up email alerts for critical flags
 *   ☐ Configure daily fraud summary reports
 *   ☐ Test fraud detection with test orders
 *
 * RATE LIMITING TUNING:
 *
 *   ☐ Verify rate limits appropriate for user base
 *   ☐ Test with peak traffic load
 *   ☐ Monitor false positive lockouts
 *   ☐ Adjust thresholds if legitimate users blocked
 *
 * LOGGING & MONITORING:
 *
 *   ☐ Verify security logs being written to disk
 *   ☐ Set up log rotation (prevent disk overflow)
 *   ☐ Configure centralized logging (ELK, Splunk)
 *   ☐ Set up alerts for critical events
 *   ☐ Daily security summary email to ops team
 *   ☐ Weekly fraud report to business team
 *
 * BACKUP & RECOVERY:
 *
 *   ☐ Database automated backups enabled
 *   ☐ Security logs backed up separately
 *   ☐ Recovery procedure documented
 *   ☐ Test recovery procedure annually
 *   ☐ Disaster recovery plan in place
 *
 * COMPLIANCE & LEGAL:
 *
 *   ☐ Privacy policy updated for fraud detection
 *   ☐ Terms of service include fraud provisions
 *   ☐ Data retention policy defined
 *   ☐ GDPR compliance verified (if applicable)
 *   ☐ PCI DSS compliance verified (financial data)
 *   ☐ Legal review of enforcement actions
 *
 * ============================================================================
 * 9. INCIDENT RESPONSE PROCEDURES
 * ============================================================================
 *
 * INCIDENT SEVERITY LEVELS:
 *
 *   CRITICAL (Response: < 15 min)
 *   - System outage / DDoS attack
 *   - Unauthorized data access / breach
 *   - Large-scale fraud pattern detected
 *   -Payment system compromise
 *
 *   HIGH (Response: < 1 hour)
 *   - Multiple high-risk fraud flags
 *   - API abuse / rate limit spam
 *   - Account takeover detected
 *   - Suspicious admin activity
 *
 *   MEDIUM (Response: < 4 hours)
 *   - Individual fraud detection
 *   - IP blocks detected
 *   - Unusual pattern in metrics
 *   - Performance degradation
 *
 *   LOW (Response: < 1 day)
 *   - Informational alerts
 *   - Configuration issues
 *   - Routine security events
 *
 * INCIDENT RESPONSE WORKFLOW:
 *
 * 1. DETECT
 *    Source: Security alerts, monitoring, manual reports
 *    Actions:
 *    - Receive alert notification
 *    - Verify incident in security logs
 *    - Assess severity level
 *    - Escalate if critical
 *
 * 2. CONTAIN
 *    Actions (Critical/High only):
 *    - Block suspicious IP addresses
 *    - Suspend fraudulent affiliate accounts
 *    - Disable compromised user accounts
 *    - Rate limit affected endpoints
 *    - Pause automated payouts
 *
 * 3. INVESTIGATE
 *    Actions:
 *    - Gather logs and evidence
 *    - Analyze fraud detection results
 *    - Review affected transactions
 *    - Interview security team
 *    - Document findings
 *
 * 4. REMEDIATE
 *    Actions:
 *    - Reverse fraudulent transactions
 *    - Refund affected customers
 *    - Disable fraudulent accounts
 *    - Update security rules
 *    - Patch vulnerabilities
 *
 * 5. COMMUNICATE
 *    To: Affected users, stakeholders, regulators (if required)
 *    Timeline:
 *    - Internally: Immediate
 *    - Customers: Within 24 hours
 *    - Public: As required by law
 *    Content:
 *    - What happened
 *    - Who was affected
 *    - What we're doing
 *    - How to protect themselves
 *
 * 6. RECOVER
 *    Actions:
 *    - Re-enable normal operations
 *    - Monitor for recurrence
 *    - Implement preventive measures
 *    - Conduct post-mortem
 *    - Update security procedures
 *
 * CRITICAL INCIDENT CONTACTS:
 *
 *   Security Team Lead: [contact info]
 *   Incident Commander: [contact info]
 *   Legal Team: [contact info]
 *   Finance Team: [contact info]
 *   Communications: [contact info]
 *
 * POST-INCIDENT REVIEW:
 *
 *   Within 24 hours:
 *   1. War room meeting with stakeholders
 *   2. Timeline of events
 *   3. Root cause analysis
 *   4. Lessons learned
 *   5. Action items to prevent recurrence
 *   6. Document for compliance
 *
 * ============================================================================
 * 10. TESTING & VALIDATION STRATEGY
 * ============================================================================
 *
 * UNIT TESTS:
 *
 *   File: tests/security/fraudDetectionService.test.js
 *   Coverage: All fraud detection methods
 *   Tests:
 *     - checkSelfReferral() with same/different users
 *     - checkSameIpMultiplePurchases() with thresholds
 *     - checkPurchaseVelocityAbuse() with rapid orders
 *     - checkGeographicAnomaly() with location inconsistencies
 *     - analyzeReferralPatterns() with bot patterns
 *     - analyzeCommissionSpike() with 3x spike
 *     - validatePayoutRequest() with various scenarios
 *
 *   File: tests/security/securityLogger.test.js
 *   Coverage: All logging methods
 *   Tests:
 *     - logAuthFailure() creates proper entry
 *     - logFraudFlag() triggers alerts for high/critical
 *     - getSecuritySummary() filters correctly
 *     - exportLogs() creates JSON/CSV files
 *
 *   File: tests/security/securityMiddleware.test.js
 *   Coverage: All middleware functions
 *   Tests:
 *     - Rate limiters enforce limits
 *     - Account lockout after 5 attempts
 *     - IP blocking works
 *     - Input validation rejects invalid data
 *     - Password strength validation
 *
 * INTEGRATION TESTS:
 *
 *   Test: Order fraud detection workflow
 *   Scenario: Create order → fraud analysis → log event
 *   Expected: Order flagged for high-risk patterns
 *   Tools: Jest + Supertest
 *
 *   Test: Commission approval workflow
 *   Scenario: Self-referral order → commission prevention
 *   Expected: Commission denied with fraud flag
 *   Tools: Jest + Supertest
 *
 *   Test: Account lockout workflow
 *   Scenario: 5 failed logins → next login blocked
 *   Expected: Login denied for 15 minutes
 *   Tools: Jest + Supertest
 *
 *   Test: Rate limiting workflow
 *   Scenario: 1,000+ requests in 15min window
 *   Expected: 429 Too Many Requests
 *   Tools: Jest + Supertest
 *
 * LOAD TESTING:
 *
 *   Tool: Apache JMeter / k6
 *   Goals:
 *     - Verify rate limiters under load
 *     - Check fraud detection performance
 *     - Validate database query efficiency
 *     - Ensure no memory leaks in logging
 *   Scenarios:
 *     - 10,000 concurrent users
 *     - Sustained load for 1 hour
 *     - Sudden traffic spikes
 *
 * PENETRATION TESTING:
 *
 *   Scope: All endpoints requiring authentication
 *   Tests:
 *     - SQL injection attempts
 *     - NoSQL injection attempts
 *     - XSS attack attempts
 *     - CSRF attack attempts
 *     - Brute force attacks
 *     - Rate limit bypass attempts
 *     - JWT token manipulation
 *     - Authorization bypass attempts
 *   Frequency: Quarterly or after major changes
 *   Provider: External security firm
 *
 * FRAUD DETECTION VALIDATION:
 *
 *   Baseline: Create clean test affiliate account
 *   Scenario 1: Self-referral order
 *   Expected: Fraud flag with "self_referral" reason
 *   Result: ✓ PASS
 *
 *   Scenario 2: Multiple orders same IP in 7 days
 *   Setup: Create 5 orders from same IP linked to affiliate
 *   Expected: Fraud flag with "same_ip_multiple_purchases"
 *   Result: ✓ PASS
 *
 *   Scenario 3: Commission spike 3x baseline
 *   Setup: Generate 3x normal commissions in 7-day window
 *   Expected: Fraud flag with "commission_spike"
 *   Result: ✓ PASS
 *
 *   Scenario 4: Bot-like referral pattern
 *   Setup: Create 100 clicks from same IP/user agent
 *   Expected: Fraud flag with "unusual_pattern"
 *   Result: ✓ PASS
 *
 *   Scenario 5: High-value payout new account
 *   Setup: New affiliate (< 30 days) requesting $10,000 payout
 *   Expected: Requires admin verification
 *   Result: ✓ PASS
 *
 * LOGGING VALIDATION:
 *
 *   Test: Security logs written to disk
 *   Action: Trigger security event (failed login)
 *   Check: Log file created in logs/security/YYYY-MM-DD.json
 *   Expected: Event recorded with all fields
 *   Result: ✓ PASS
 *
 *   Test: Critical alerts generated
 *   Action: Create critical fraud flag
 *   Check: Alert in-memory cache + getCriticalAlerts()
 *   Expected: Alert returned with severity CRITICAL
 *   Result: ✓ PASS
 *
 *   Test: Log export functionality
 *   Action: Call exportLogs('json')
 *   Check: JSON file created with all events
 *   Expected: File valid and parseable
 *   Result: ✓ PASS
 *
 * CONTINUOUS MONITORING:
 *
 *   Daily Checks:
 *   - Review critical alerts
 *   - Check rate limit violations
 *   - Monitor failed login attempts
 *   - Verify log file integrity
 *
 *   Weekly Reports:
 *   - Fraud detection effectiveness
 *   - False positive rate
 *   - False negative rate (if detected by manual review)
 *   - Admin action ratio (approved vs denied)
 *
 *   Monthly Analysis:
 *   - Trend analysis
 *   - Threshold optimization
 *   - New threat patterns
 *   - Security updates needed
 *
 * ============================================================================
 * CONFIGURATION REFERENCE
 * ============================================================================
 *
 * FRAUD DETECTION THRESHOLDS (src/security/fraudDetectionService.js):
 *
 *   minOrdersForPattern: 3              // Min orders to trigger pattern
 *   timeWindowDays: 7                   // Analysis window for patterns
 *   ipThreshold: 5                      // Max legitimate orders per IP
 *   commissionSpikeMultiplier: 3        // Spike detection threshold
 *   highValuePayoutThreshold: 5000      // Amount requiring verification
 *   velocityWindow: 24 * 60 * 60 * 1000 // 24 hours for velocity check
 *   maxOrdersPerHour: 10                // Max orders per hour per IP
 *   geoAnomaly: 500                     // km threshold for location jump
 *
 * RATE LIMITING THRESHOLDS (src/middlewares/securityMiddleware.js):
 *
 *   globalLimiter: 1000 requests / 15 minutes
 *   authLimiter: 5 attempts / 15 minutes per email+IP
 *   passwordResetLimiter: 3 attempts / 1 hour per email+IP
 *   affiliateSignupLimiter: 10 signups / 1 hour per IP
 *   checkoutLimiter: 5 checkouts / 1 minute per user
 *   adminLimiter: 100 requests / 1 minute
 *
 * SECURITY MIDDLEWARE CONSTANTS (src/middlewares/securityMiddleware.js):
 *
 *   LOCKOUT_THRESHOLD: 5               // Failed attempts before lockout
 *   LOCKOUT_DURATION: 15 minutes        // How long to lock account
 *   MAX_REQUEST_BODY_SIZE: 1MB          // Max body size
 *   IP_BLOCK_DURATION: 60 minutes       // Default IP block time
 *   PASSWORD_MIN_LENGTH: 8
 *   SPECIAL_CHARS: !@#$%^&*
 *
 * ============================================================================
 * QUICK REFERENCE
 * ============================================================================
 *
 * ENABLE FRAUD DETECTION FOR NEW ENDPOINT:
 *
 *   app.use('/api/v1/endpoint', checkOrderFraud, yourRoute);
 *
 * LOG A SECURITY EVENT:
 *
 *   securityLogger.logFraudFlag(
 *     'entity_id',
 *     'entity_type',
 *     'reason',
 *     'HIGH',
 *     { customData: 'value' }
 *   );
 *
 * CHECK IF IP IS BLOCKED:
 *
 *   if (securityMiddleware.isIpBlocked(ipAddress)) {
 *     // IP is blocked
 *   }
 *
 * BLOCK AN IP:
 *
 *   securityMiddleware.blockIp(ipAddress, 'Fraud detected', 120);
 *
 * GET SECURITY SUMMARY:
 *
 *   const summary = securityLogger.getSecuritySummary({
 *     hoursBack: 24,
 *     minSeverity: 'WARNING'
 *   });
 *
 * EXPORT LOGS:
 *
 *   const path = securityLogger.exportLogs('json');
 *
 * ============================================================================
 * SUPPORT & ESCALATION
 * ============================================================================
 *
 * For questions about:
 *   - Fraud detection logic → Contact Security Team
 *   - Rate limiting tuning → Contact DevOps Team
 *   - False positives → Contact Fraud Operations
 *   - Performance issues → Contact Platform Team
 *   - Compliance questions → Contact Legal Team
 *
 * Document Version: 1.0.0
 * Last Updated: 2024
 * Next Review: Quarterly
 *
 * ============================================================================
 * END OF DOCUMENTATION
 * ============================================================================
 */

module.exports = {
  documentation: 'See inline comments for complete security system documentation'
};
