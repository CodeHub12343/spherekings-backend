/**
 * ============================================================================
 * SECURITY MIDDLEWARE - Authentication, Rate Limiting, Input Validation
 * ============================================================================
 *
 * Provides:
 * - Enhanced rate limiting (global + endpoint-specific) - DISABLED
 * - Account lockout mechanism
 * - Input validation and sanitization
 * - IP blocking
 * - Request validation
 *
 * ============================================================================
 */

const User = require('../models/User');
const securityLogger = require('../security/securityLogger');

// ============================================================================
// RATE LIMITERS
// ============================================================================

/**
 * Global API rate limiter - DISABLED
 * Rate limiting has been completely removed from the application
 */
const globalLimiter = (req, res, next) => {
  next();
};

/**
 * Authentication endpoint rate limiter - DISABLED
 * Rate limiting has been completely removed from the application
 */
const authLimiter = (req, res, next) => {
  next();
};

/**
 * Password reset rate limiter - DISABLED
 * Rate limiting has been completely removed from the application
 */
const passwordResetLimiter = (req, res, next) => {
  next();
};

/**
 * Affiliate signup rate limiter - DISABLED
 * Rate limiting has been completely removed from the application
 */
const affiliateSignupLimiter = (req, res, next) => {
  next();
};

/**
 * Session/Auth check rate limiter - DISABLED
 * Rate limiting has been completely removed from the application
 */
const sessionAuthLimiter = (req, res, next) => {
  next();
};

/**
 * Checkout rate limiter - DISABLED
 * Rate limiting has been completely removed from the application
 */
const checkoutLimiter = (req, res, next) => {
  next();
};

/**
 * Admin API rate limiter - DISABLED
 * Rate limiting has been completely removed from the application
 */
const adminLimiter = (req, res, next) => {
  next();
};

// ============================================================================
// ACCOUNT LOCKOUT MECHANISM
// ============================================================================

/**
 * Track failed login attempts
 */
const loginAttempts = new Map();
const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION = 15 * 60 * 1000; // 15 minutes

/**
 * Record failed login attempt
 */
function recordFailedLogin(email, ipAddress) {
  const key = `${email}`;
  const attempts = loginAttempts.get(key) || { count: 0, lastAttempt: null, ips: [] };

  attempts.count += 1;
  attempts.lastAttempt = Date.now();
  attempts.ips.push(ipAddress);

  loginAttempts.set(key, attempts);

  securityLogger.logAuthFailure(email, ipAddress, 'Invalid credentials', attempts.count);

  // Lock account if threshold exceeded
  if (attempts.count >= LOCKOUT_THRESHOLD) {
    lockoutAccount(email, attempts.count);
  }

  return attempts.count;
}

/**
 * Check if account is locked
 */
function isAccountLocked(email) {
  const key = `${email}-locked`;
  const lockData = loginAttempts.get(key);

  if (!lockData) return false;

  // Check if lockout has expired
  if (Date.now() > lockData.expiresAt) {
    loginAttempts.delete(key);
    return false;
  }

  return true;
}

/**
 * Lock account temporarily
 */
function lockoutAccount(email, attemptCount) {
  const key = `${email}-locked`;
  loginAttempts.set(key, {
    lockedAt: Date.now(),
    expiresAt: Date.now() + LOCKOUT_DURATION,
    attemptCount
  });

  securityLogger.logAccountLockout(email, email, `${attemptCount} failed login attempts`);
}

/**
 * Clear login attempts on successful login
 */
function clearLoginAttempts(email) {
  loginAttempts.delete(email);
  loginAttempts.delete(`${email}-locked`);
}

// ============================================================================
// IP BLOCKING MECHANISM
// ============================================================================

const blockedIps = new Map();

/**
 * Block IP address
 */
function blockIp(ipAddress, reason, duration = 60) {
  blockedIps.set(ipAddress, {
    blockedAt: Date.now(),
    expiresAt: Date.now() + duration * 60 * 1000,
    reason
  });

  securityLogger.logIpBlock(ipAddress, reason, duration);
}

/**
 * Check if IP is blocked
 */
function isIpBlocked(ipAddress) {
  const blockData = blockedIps.get(ipAddress);

  if (!blockData) return false;

  // Check if block has expired
  if (Date.now() > blockData.expiresAt) {
    blockedIps.delete(ipAddress);
    return false;
  }

  return true;
}

/**
 * Middleware: Check if IP is blocked
 */
const checkIpBlocked = (req, res, next) => {
  const ipAddress = req.ip || req.connection.remoteAddress;

  if (isIpBlocked(ipAddress)) {
    const blockData = blockedIps.get(ipAddress);
    return res.status(403).json({
      success: false,
      error: 'Your IP address has been blocked',
      reason: blockData.reason,
      expiresAt: new Date(blockData.expiresAt)
    });
  }

  next();
};

// ============================================================================
// INPUT VALIDATION & SANITIZATION
// ============================================================================

/**
 * Sanitize user input to prevent injection attacks
 */
function sanitizeInput(input) {
  if (typeof input !== 'string') return input;

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
}

/**
 * Validate email format
 */
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function validatePasswordStrength(password) {
  const errors = [];

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Password must contain number');
  }

  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Middleware: Validate request body
 */
const validateRequestBody = (req, res, next) => {
  if (!req.body) {
    return res.status(400).json({
      success: false,
      error: 'Request body is empty'
    });
  }

  // Check for suspiciously large payloads
  if (JSON.stringify(req.body).length > 1000000) { // 1MB limit
    return res.status(413).json({
      success: false,
      error: 'Request payload too large'
    });
  }

  next();
};

/**
 * Middleware: Validate registration data
 */
const validateRegistration = (req, res, next) => {
  const { email, password, name } = req.body;

  // Validate email
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({
      success: false,
      error: 'Invalid email format'
    });
  }

  // Validate password
  const passwordValidation = validatePasswordStrength(password);
  if (!passwordValidation.isValid) {
    return res.status(400).json({
      success: false,
      error: 'Password does not meet requirements',
      requirements: passwordValidation.errors
    });
  }

  // Validate name
  if (!name || name.length < 2) {
    return res.status(400).json({
      success: false,
      error: 'Name must be at least 2 characters'
    });
  }

  next();
};

/**
 * Middleware: Check account lockout on login attempt
 */
const checkAccountLockout = (req, res, next) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({
      success: false,
      error: 'Email is required'
    });
  }

  if (isAccountLocked(email)) {
    const lockData = loginAttempts.get(`${email}-locked`);
    return res.status(429).json({
      success: false,
      error: 'Account temporarily locked due to multiple failed login attempts',
      expiresAt: new Date(lockData.expiresAt)
    });
  }

  next();
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Rate limiters
  globalLimiter,
  authLimiter,
  sessionAuthLimiter,
  passwordResetLimiter,
  affiliateSignupLimiter,
  checkoutLimiter,
  adminLimiter,

  // Account lockout
  recordFailedLogin,
  isAccountLocked,
  lockoutAccount,
  clearLoginAttempts,

  // IP blocking
  blockIp,
  isIpBlocked,
  checkIpBlocked,

  // Input validation
  sanitizeInput,
  isValidEmail,
  validatePasswordStrength,
  validateRequestBody,
  validateRegistration,
  checkAccountLockout
};
