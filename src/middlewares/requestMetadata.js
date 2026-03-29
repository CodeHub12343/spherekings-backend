/**
 * Request Metadata Middleware
 * Extracts IP address, device type, and session info from requests
 */

/**
 * Middleware: Extract client IP address
 *
 * Handles various deployment scenarios:
 * - Direct connections (req.ip)
 * - Behind reverse proxy (x-forwarded-for, x-real-ip headers)
 * - Load balancer environments
 *
 * Priority order:
 * 1. x-forwarded-for header (first IP if multiple)
 * 2. x-real-ip header
 * 3. cf-connecting-ip header (Cloudflare)
 * 4. req.connection.remoteAddress
 * 5. req.ip
 * 6. Default to 0.0.0.0
 */
const extractClientIp = (req, res, next) => {
  let ipAddress = '0.0.0.0';

  // Check x-forwarded-for header (proxy/load balancer)
  if (req.headers['x-forwarded-for']) {
    // May contain multiple IPs separated by commas, take the first one
    ipAddress = req.headers['x-forwarded-for'].split(',')[0].trim();
  }
  // Check x-real-ip header
  else if (req.headers['x-real-ip']) {
    ipAddress = req.headers['x-real-ip'].trim();
  }
  // Check Cloudflare IP
  else if (req.headers['cf-connecting-ip']) {
    ipAddress = req.headers['cf-connecting-ip'].trim();
  }
  // Check direct connection
  else if (req.connection && req.connection.remoteAddress) {
    ipAddress = req.connection.remoteAddress;
  }
  // Express built-in
  else if (req.ip) {
    ipAddress = req.ip;
  }

  // Clean up IPv6 localhost
  if (ipAddress === '::1') {
    ipAddress = '127.0.0.1';
  }

  // Store on request
  req.clientIp = ipAddress;

  next();
};

/**
 * Middleware: Detect device type from user agent
 *
 * Classifies devices as:
 * - mobile: smartphones, small tablets
 * - tablet: iPad and similar devices
 * - desktop: desktop and laptop computers
 */
const detectDeviceType = (req, res, next) => {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();

  let device = 'desktop'; // Default

  // Check for mobile devices
  if (/mobile|android|iphone|ipod|blackberry|windows phone/i.test(userAgent)) {
    device = 'mobile';
  }
  // Check for tablets
  else if (/ipad|android|tablet|playbook|silk|kindle/i.test(userAgent)) {
    device = 'tablet';
  }

  req.deviceType = device;

  next();
};

/**
 * Middleware: Generate or retrieve session ID
 *
 * Creates a session ID for tracking across multiple requests
 * Uses existing session cookie or generates new one
 */
const generateSessionId = (req, res, next) => {
  // Check if session ID already exists in cookies
  if (req.cookies && req.cookies.session_id) {
    req.sessionId = req.cookies.session_id;
  } else {
    // Generate new session ID
    const crypto = require('crypto');
    const sessionId = crypto.randomBytes(16).toString('hex');
    req.sessionId = sessionId;

    // Set session cookie (30-day expiration)
    res.cookie('session_id', sessionId, {
      maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax',
      path: '/',
    });
  }

  next();
};

/**
 * Combined middleware for all request metadata extraction
 */
const requestMetadata = [extractClientIp, detectDeviceType, generateSessionId];

module.exports = {
  extractClientIp,
  detectDeviceType,
  generateSessionId,
  requestMetadata,
};
