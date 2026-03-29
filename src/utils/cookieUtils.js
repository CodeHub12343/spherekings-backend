/**
 * Cookie Utilities
 * Helpers for managing referral attribution cookies
 */

const crypto = require('crypto');

/**
 * Cookie configuration
 * Defines standard referral cookie settings
 */
const REFERRAL_COOKIE_CONFIG = {
  name: 'affiliate_ref',
  maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days in milliseconds
  path: '/',
  httpOnly: false, // Allow frontend JavaScript to read cookie
  sameSite: 'Lax', // Standard cookie attribute for CSRF protection
  // secure is set dynamically based on environment (production requires HTTPS)
};

/**
 * Set referral attribution cookie
 *
 * Used in: Referral tracking endpoint (GET /api/ref/:affiliateCode)
 *
 * @param {Object} res - Express response object
 * @param {Object} cookieData - Data to store in cookie
 *   - visitorId: Unique visitor identifier
 *   - affiliateCode: Affiliate referral code (e.g., "AFF123456")
 *   - affiliateId: MongoDB ObjectId of affiliate
 *   - timestamp: ISO string of when cookie was set
 * @param {Object} options - Optional overrides for cookie config
 * @returns {void}
 *
 * @example
 * const cookieData = {
 *   visitorId: 'visitor_abc123...',
 *   affiliateCode: 'AFF123456',
 *   affiliateId: '507f1f77bcf86cd799439011',
 *   timestamp: new Date().toISOString()
 * };
 * setReferralCookie(res, cookieData);
 */
const setReferralCookie = (res, cookieData, options = {}) => {
  const config = {
    ...REFERRAL_COOKIE_CONFIG,
    secure: process.env.NODE_ENV === 'production', // HTTPS only in production
    ...options,
  };

  // Serialize cookie data as JSON
  const cookieValue = JSON.stringify(cookieData);

  // Set cookie
  res.cookie(config.name, cookieValue, {
    maxAge: config.maxAge,
    httpOnly: config.httpOnly,
    secure: config.secure,
    sameSite: config.sameSite,
    path: config.path,
  });
};

/**
 * Get referral attribution cookie data
 *
 * Used in: Checkout process to read affiliate from cookie
 *
 * @param {Object} cookies - Express cookies object (from req.cookies)
 * @returns {Object|null} Parsed cookie data or null if not found/invalid
 *
 * @example
 * const affiliateData = getReferralCookie(req.cookies);
 * if (affiliateData) {
 *   console.log(`Order from affiliate: ${affiliateData.affiliateCode}`);
 * }
 */
const getReferralCookie = (cookies) => {
  try {
    if (!cookies || !cookies.affiliate_ref) {
      return null;
    }

    // Parse JSON cookie
    const cookieData = JSON.parse(cookies.affiliate_ref);

    // Validate required fields
    if (!cookieData.affiliateCode || !cookieData.affiliateId) {
      return null;
    }

    // Validate data types
    if (typeof cookieData.affiliateCode !== 'string' || typeof cookieData.affiliateId !== 'string') {
      return null;
    }

    return cookieData;
  } catch (error) {
    // Invalid JSON or parse error
    console.warn('Failed to parse referral cookie:', error.message);
    return null;
  }
};

/**
 * Clear referral attribution cookie
 *
 * Used for: Resetting affiliate attribution after order completion
 *
 * @param {Object} res - Express response object
 * @returns {void}
 *
 * @example
 * // Clear cookie after order is placed
 * clearReferralCookie(res);
 */
const clearReferralCookie = (res) => {
  res.clearCookie(REFERRAL_COOKIE_CONFIG.name, {
    path: REFERRAL_COOKIE_CONFIG.path,
  });
};

/**
 * Refresh referral cookie expiration
 *
 * Used for: Extending cookie lifetime when visitor returns
 * This keeps the referee attribution active as long as visitor is active
 *
 * @param {Object} req - Express request with cookies
 * @param {Object} res - Express response to set new cookie
 * @returns {Object|null} Updated cookie data or null
 *
 * @example
 * // Refresh cookie on each visit
 * const refreshedData = refreshReferralCookie(req, res);
 */
const refreshReferralCookie = (req, res) => {
  const cookieData = getReferralCookie(req.cookies);

  if (!cookieData) {
    return null;
  }

  // Update timestamp
  const updatedData = {
    ...cookieData,
    timestamp: new Date().toISOString(),
  };

  // Set new cookie with fresh expiration
  setReferralCookie(res, updatedData);

  return updatedData;
};

/**
 * Validate cookie format and data integrity
 *
 * Used for: Security checks before using cookie data
 *
 * @param {Object} cookieData - Cookie data to validate
 * @returns {Object} { isValid: boolean, errors: string[] }
 *
 * @example
 * const validation = validateCookieData(cookieData);
 * if (!validation.isValid) {
 *   console.error('Invalid cookie:', validation.errors);
 *   return;
 * }
 */
const validateCookieData = (cookieData) => {
  const errors = [];

  if (!cookieData) {
    return { isValid: false, errors: ['Cookie data is null'] };
  }

  // Validate affiliateCode (format: AFF + 11 alphanumeric = 14 chars total)
  if (!cookieData.affiliateCode) {
    errors.push('Missing affiliateCode');
  } else if (!/^AFF[A-Z0-9]{11}$/.test(cookieData.affiliateCode)) {
    errors.push('Invalid affiliateCode format');
  }

  // Validate affiliateId (MongoDB ObjectId format)
  if (!cookieData.affiliateId) {
    errors.push('Missing affiliateId');
  } else if (!/^[0-9a-fA-F]{24}$/.test(cookieData.affiliateId)) {
    errors.push('Invalid affiliateId format');
  }

  // Validate visitorId (should exist)
  if (!cookieData.visitorId) {
    errors.push('Missing visitorId');
  }

  // Validate timestamp (should be valid ISO date)
  if (!cookieData.timestamp) {
    errors.push('Missing timestamp');
  } else {
    const date = new Date(cookieData.timestamp);
    if (isNaN(date.getTime())) {
      errors.push('Invalid timestamp format');
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

/**
 * Check if cookie is expired
 *
 * Checks if cookie timestamp is older than max age
 *
 * @param {Object} cookieData - Cookie data from getReferralCookie()
 * @returns {boolean} true if expired, false if still valid
 *
 * @example
 * if (isCookieExpired(cookieData)) {
 *   // Cookie is too old, ignore attribution
 * }
 */
const isCookieExpired = (cookieData) => {
  if (!cookieData || !cookieData.timestamp) {
    return true;
  }

  const createdTime = new Date(cookieData.timestamp).getTime();
  const currentTime = Date.now();
  const maxAge = REFERRAL_COOKIE_CONFIG.maxAge;

  return currentTime - createdTime > maxAge;
};

/**
 * Extract cookie metadata for logging/analytics
 *
 * @param {Object} cookieData - Cookie data
 * @returns {Object} Metadata for logging
 *
 * @example
 * const metadata = getCookieMetadata(cookieData);
 * logger.info('Affiliate attribution', metadata);
 */
const getCookieMetadata = (cookieData) => {
  if (!cookieData) {
    return null;
  }

  return {
    affiliateCode: cookieData.affiliateCode,
    affiliateId: cookieData.affiliateId,
    visitorId: cookieData.visitorId,
    timestamp: cookieData.timestamp,
    ageMs: cookieData.timestamp ? Date.now() - new Date(cookieData.timestamp).getTime() : null,
    isExpired: isCookieExpired(cookieData),
  };
};

module.exports = {
  REFERRAL_COOKIE_CONFIG,
  setReferralCookie,
  getReferralCookie,
  clearReferralCookie,
  refreshReferralCookie,
  validateCookieData,
  isCookieExpired,
  getCookieMetadata,
};
