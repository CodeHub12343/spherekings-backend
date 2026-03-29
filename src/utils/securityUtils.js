/**
 * ============================================================================
 * SECURITY UTILITIES - Helper Functions for Security Operations
 * ============================================================================
 *
 * Provides utility functions for IP validation, device fingerprinting,
 * session validation, encryption/decryption, and other security helpers.
 *
 * ============================================================================
 */

const crypto = require('crypto');
const ip = require('ip');

/**
 * IP ADDRESS VALIDATION & PARSING
 * ============================================================================
 */

/**
 * Validate IP address format (IPv4 or IPv6)
 * @param {string} ipAddress - IP address to validate
 * @returns {boolean} True if valid IP
 */
const isValidIp = (ipAddress) => {
  try {
    return ip.isValid(ipAddress);
  } catch (error) {
    return false;
  }
};

/**
 * Check if IP is private/internal
 * @param {string} ipAddress - IP to check
 * @returns {boolean} True if private IP
 */
const isPrivateIp = (ipAddress) => {
  try {
    return ip.isPrivate(ipAddress);
  } catch (error) {
    return false;
  }
};

/**
 * Get IP version (4 or 6)
 * @param {string} ipAddress - IP address
 * @returns {number} 4 or 6, or 0 if invalid
 */
const getIpVersion = (ipAddress) => {
  try {
    const version = ip.version(ipAddress);
    return version === 4 || version === 6 ? version : 0;
  } catch (error) {
    return 0;
  }
};

/**
 * Anonymize IP for logging (keep last octet private)
 * @param {string} ipAddress - IP to anonymize
 * @returns {string} Anonymized IP
 */
const anonymizeIp = (ipAddress) => {
  try {
    if (!ipAddress || typeof ipAddress !== 'string') {
      return 'unknown';
    }

    const parts = ipAddress.split('.');
    if (parts.length === 4) {
      // IPv4: mask last octet
      return `${parts[0]}.${parts[1]}.${parts[2]}.***`;
    }

    if (ipAddress.includes(':')) {
      // IPv6: mask last 2 groups
      const groups = ipAddress.split(':');
      return groups.slice(0, -2).join(':') + ':***:***';
    }

    return ipAddress;
  } catch (error) {
    return 'unknown';
  }
};

/**
 * Extract IP from request (handles proxies)
 * @param {object} req - Express request object
 * @returns {string} Client IP address
 */
const extractClientIp = (req) => {
  // Check X-Forwarded-For (from load balancer/proxy)
  if (req.headers['x-forwarded-for']) {
    return req.headers['x-forwarded-for'].split(',')[0].trim();
  }

  // Check X-Real-IP (from nginx)
  if (req.headers['x-real-ip']) {
    return req.headers['x-real-ip'];
  }

  // Check CF-Connecting-IP (from Cloudflare)
  if (req.headers['cf-connecting-ip']) {
    return req.headers['cf-connecting-ip'];
  }

  // Standard remote address
  return req.ip || req.connection.remoteAddress || 'unknown';
};

/**
 * DEVICE FINGERPRINTING
 * ============================================================================
 */

/**
 * Generate device fingerprint from request headers
 * @param {object} req - Express request object
 * @returns {string} Device fingerprint hash
 */
const generateDeviceFingerprint = (req) => {
  const userAgent = req.get('user-agent') || 'unknown';
  const acceptLanguage = req.get('accept-language') || 'unknown';
  const acceptEncoding = req.get('accept-encoding') || 'unknown';
  const ipAddress = extractClientIp(req);

  const fingerprintString = `${userAgent}|${acceptLanguage}|${acceptEncoding}|${ipAddress}`;

  return crypto
    .createHash('sha256')
    .update(fingerprintString)
    .digest('hex');
};

/**
 * Extract device info from user agent
 * @param {string} userAgent - User agent string
 * @returns {object} Parsed device info
 */
const parseUserAgent = (userAgent) => {
  if (!userAgent) {
    return {
      browser: 'unknown',
      os: 'unknown',
      device: 'unknown',
      isBot: false
    };
  }

  const lowerAgent = userAgent.toLowerCase();

  // Detect bots
  const botPatterns = ['bot', 'crawler', 'spider', 'scraper', 'curl', 'wget', 'python'];
  const isBot = botPatterns.some(pattern => lowerAgent.includes(pattern));

  // Detect browser
  let browser = 'unknown';
  if (lowerAgent.includes('chrome')) browser = 'Chrome';
  else if (lowerAgent.includes('safari')) browser = 'Safari';
  else if (lowerAgent.includes('firefox')) browser = 'Firefox';
  else if (lowerAgent.includes('edge')) browser = 'Edge';
  else if (lowerAgent.includes('trident')) browser = 'IE';

  // Detect OS
  let os = 'unknown';
  if (lowerAgent.includes('windows')) os = 'Windows';
  else if (lowerAgent.includes('mac')) os = 'macOS';
  else if (lowerAgent.includes('linux')) os = 'Linux';
  else if (lowerAgent.includes('android')) os = 'Android';
  else if (lowerAgent.includes('iphone') || lowerAgent.includes('ipad')) os = 'iOS';

  // Detect device
  let device = 'desktop';
  if (lowerAgent.includes('mobile') || lowerAgent.includes('android') || lowerAgent.includes('iphone')) {
    device = 'mobile';
  } else if (lowerAgent.includes('tablet') || lowerAgent.includes('ipad')) {
    device = 'tablet';
  }

  return { browser, os, device, isBot };
};

/**
 * SESSION VALIDATION
 * ============================================================================
 */

/**
 * Generate secure session token
 * @param {number} length - Token length (default 32)
 * @returns {string} Random hex token
 */
const generateSecureToken = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash token for storage
 * @param {string} token - Plain token
 * @returns {string} SHA-256 hash
 */
const hashToken = (token) => {
  return crypto
    .createHash('sha256')
    .update(token)
    .digest('hex');
};

/**
 * Verify token matches hash
 * @param {string} token - Plain token
 * @param {string} hash - Stored hash
 * @returns {boolean} True if match
 */
const verifyToken = (token, hash) => {
  const tokenHash = hashToken(token);
  return tokenHash === hash;
};

/**
 * Check if session is stale
 * @param {Date} lastActivity - Last activity timestamp
 * @param {number} maxAge - Max age in milliseconds (default 24 hours)
 * @returns {boolean} True if stale
 */
const isSessionStale = (lastActivity, maxAge = 24 * 60 * 60 * 1000) => {
  return Date.now() - lastActivity.getTime() > maxAge;
};

/**
 * ENCRYPTION / DECRYPTION
 * ============================================================================
 */

const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || 'default-key-change-in-production';

/**
 * Encrypt sensitive data
 * @param {string} data - Data to encrypt
 * @param {string} key - Encryption key (optional)
 * @returns {string} Encrypted data (base64)
 */
const encryptData = (data, key = ENCRYPTION_KEY) => {
  try {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32, '0').slice(0, 32)),
      iv
    );

    let encrypted = cipher.update(JSON.stringify(data), 'utf8', 'hex');
    encrypted += cipher.final('hex');

    return `${iv.toString('hex')}:${encrypted}`;
  } catch (error) {
    console.error('Encryption error:', error);
    return null;
  }
};

/**
 * Decrypt sensitive data
 * @param {string} encryptedData - Encrypted data (from encryptData)
 * @param {string} key - Encryption key (optional)
 * @returns {object} Decrypted data
 */
const decryptData = (encryptedData, key = ENCRYPTION_KEY) => {
  try {
    const [ivHex, encrypted] = encryptedData.split(':');
    const iv = Buffer.from(ivHex, 'hex');
    const decipher = crypto.createDecipheriv(
      'aes-256-cbc',
      Buffer.from(key.padEnd(32, '0').slice(0, 32)),
      iv
    );

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return JSON.parse(decrypted);
  } catch (error) {
    console.error('Decryption error:', error);
    return null;
  }
};

/**
 * RATE LIMIT HELPERS
 * ============================================================================
 */

/**
 * Generate rate limit key for user
 * @param {string} userId - User ID
 * @param {string} endpoint - API endpoint
 * @returns {string} Unique key
 */
const generateRateLimitKey = (userId, endpoint) => {
  return `${userId}:${endpoint}`;
};

/**
 * Generate rate limit key for IP
 * @param {string} ipAddress - IP address
 * @param {string} endpoint - API endpoint
 * @returns {string} Unique key
 */
const generateIpRateLimitKey = (ipAddress, endpoint) => {
  return `ip:${ipAddress}:${endpoint}`;
};

/**
 * Calculate remaining quota
 * @param {number} current - Current count
 * @param {number} max - Max count
 * @returns {number} Remaining quota
 */
const calculateRemaining = (current, max) => {
  return Math.max(0, max - current);
};

/**
 * SECURITY VALIDATION
 * ============================================================================
 */

/**
 * Validate email format
 * @param {string} email - Email to validate
 * @returns {boolean} True if valid email
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validate strong password
 * @param {string} password - Password to validate
 * @returns {object} { isValid, errors[] }
 */
const validatePasswordStrength = (password) => {
  const errors = [];

  if (!password || password.length < 8) {
    errors.push('Password must be at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain uppercase letter');
  }
  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain lowercase letter');
  }
  if (!/\d/.test(password)) {
    errors.push('Password must contain number');
  }
  if (!/[!@#$%^&*]/.test(password)) {
    errors.push('Password must contain special character (!@#$%^&*)');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};

/**
 * Sanitize input to prevent XSS
 * @param {string} input - Input to sanitize
 * @returns {string} Sanitized input
 */
const sanitizeInput = (input) => {
  if (typeof input !== 'string') {
    return input;
  }

  return input
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim();
};

/**
 * AUDIT & LOGGING HELPERS
 * ============================================================================
 */

/**
 * Generate audit log entry
 * @param {object} options - Audit options
 * @returns {object} Audit entry
 */
const generateAuditLog = ({
  userId,
  action,
  resource,
  resourceId,
  changes = {},
  ipAddress,
  status = 'success'
}) => {
  return {
    timestamp: new Date(),
    userId,
    action,
    resource,
    resourceId,
    changes,
    ipAddress: anonymizeIp(ipAddress),
    status
  };
};

/**
 * Generate security alert
 * @param {object} options - Alert options
 * @returns {object} Alert object
 */
const generateSecurityAlert = ({
  type,
  severity = 'medium',
  message,
  userId,
  ipAddress,
  details = {}
}) => {
  return {
    id: crypto.randomBytes(8).toString('hex'),
    timestamp: new Date(),
    type,
    severity,
    message,
    userId,
    ipAddress: anonymizeIp(ipAddress),
    details,
    read: false
  };
};

/**
 * Check if alert should escalate
 * @param {string} severity - Alert severity
 * @param {number} frequency - How many times in last hour
 * @returns {boolean} True if should escalate
 */
const shouldEscalateAlert = (severity, frequency) => {
  if (severity === 'critical') return true;
  if (severity === 'high' && frequency >= 3) return true;
  if (severity === 'medium' && frequency >= 10) return true;
  return false;
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // IP validation
  isValidIp,
  isPrivateIp,
  getIpVersion,
  anonymizeIp,
  extractClientIp,

  // Device fingerprinting
  generateDeviceFingerprint,
  parseUserAgent,

  // Session validation
  generateSecureToken,
  hashToken,
  verifyToken,
  isSessionStale,

  // Encryption
  encryptData,
  decryptData,

  // Rate limit helpers
  generateRateLimitKey,
  generateIpRateLimitKey,
  calculateRemaining,

  // Security validation
  isValidEmail,
  validatePasswordStrength,
  sanitizeInput,

  // Audit & alerts
  generateAuditLog,
  generateSecurityAlert,
  shouldEscalateAlert
};
