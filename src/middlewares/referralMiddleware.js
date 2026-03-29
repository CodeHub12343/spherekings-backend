/**
 * Referral Attribution Middleware
 * Middleware for automating referral cookie reading and validation in requests
 */

const { getReferralCookie, isCookieExpired, validateCookieData } = require('../utils/cookieUtils');
const { performComprehensiveFraudCheck } = require('../utils/fraudDetection');

/**
 * Middleware: Handle simple ?ref=AFFCODE query parameter
 * 
 * Intercepts requests with ?ref=AFFCODE and:
 * 1. Looks up affiliate by code
 * 2. Extracts the affiliateId
 * 3. Sets a referral cookie if not already set
 * 4. Attaches req.referralCookie for checkout to use
 *
 * This allows affiliate links in format: /products?ref=AFF123456
 * Instead of requiring: /api/ref/AFF123456?redirect=/products
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response  
 * @param {Function} next - Express next middleware
 */
const queryParamAffiliateMiddleware = async (req, res, next) => {
  const affiliateCode = req.query.ref;
  
  // Only process if ?ref= parameter is present
  if (!affiliateCode) {
    return next();
  }
  
  try {
    // Import Affiliate model dynamically to avoid circular dependencies
    const Affiliate = require('../models/Affiliate');
    
    // Look up affiliate by code
    const affiliate = await Affiliate.findOne({ affiliateCode });
    
    if (!affiliate) {
      console.log(`⚠️  [REFERRAL] Affiliate code not found: ${affiliateCode}`);
      // Continue without setting affiliate - not an error
      return next();
    }
    
    // Check if affiliate is active
    if (affiliate.status !== 'active') {
      console.log(`⚠️  [REFERRAL] Affiliate not active: ${affiliateCode} (status: ${affiliate.status})`);
      return next();
    }
    
    // Check if already have a cookie
    const existingCookie = getReferralCookie(req.cookies);
    
    if (!existingCookie) {
      // Create referral cookie data
      const cookieData = {
        visitorId: `visitor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        affiliateCode: affiliate.affiliateCode,
        affiliateId: affiliate._id.toString(),
        timestamp: new Date().toISOString()
      };
      
      // Set the cookie for 30 days
      const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
      res.cookie('affiliate_ref', JSON.stringify(cookieData), {
        maxAge: thirtyDaysMs,
        httpOnly: false, // Allow frontend to read
        sameSite: 'Lax',
        secure: process.env.NODE_ENV === 'production',
        path: '/'
      });
      
      // Also attach to request for immediate use in same request
      req.referralCookie = cookieData;
      
      console.log(`✅ [REFERRAL] ?ref= parameter processed - Set affiliate cookie for: ${affiliate.affiliateCode}`);
    }
    
    return next();
  } catch (error) {
    console.error(`❌ [REFERRAL] Error processing ?ref= parameter:`, error.message);
    // Don't block the request if there's an error
    return next();
  }
};

/**
 * Middleware: Automatically extract and validate referral cookie
 *
 * If a referral cookie exists in the request, this middleware:
 * 1. Extracts the cookie data
 * 2. Validates the data format
 * 3. Checks if the cookie has expired
 * 4. Attaches valid cookie data to req.referralCookie
 *
 * This middleware doesn't require authentication and doesn't block requests.
 * If no valid cookie exists, req.referralCookie will be null.
 *
 * Usage: app.use(referralCookieMiddleware);
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const referralCookieMiddleware = (req, res, next) => {
  // Try to extract referral cookie
  const referralCookie = getReferralCookie(req.cookies);

  if (!referralCookie) {
    // No referral cookie found
    req.referralCookie = null;
    return next();
  }

  // Validate cookie format
  const validation = validateCookieData(referralCookie);
  if (!validation.isValid) {
    console.warn('Invalid referral cookie:', validation.errors);
    req.referralCookie = null;
    return next();
  }

  // Check if cookie has expired
  if (isCookieExpired(referralCookie)) {
    console.warn(`Expired referral cookie: ${referralCookie.affiliateCode}`);
    req.referralCookie = null;
    return next();
  }

  // Cookie is valid and not expired
  req.referralCookie = referralCookie;
  console.log(`✓ Valid referral cookie detected: ${referralCookie.affiliateCode}`);

  next();
};

/**
 * Middleware: Perform fraud detection on request if referral cookie exists
 *
 * If a valid referral cookie exists, performs comprehensive fraud checks:
 * 1. Checks for excessive clicks from IP
 * 2. Checks for multiple affiliate codes from same IP
 * 3. Validates device consistency
 * 4. Detects geographic anomalies
 *
 * Fraud assessment is attached to req.fraudAssessment (or null if no cookie)
 * Requests are NOT blocked based on fraud assessment - it's for monitoring.
 *
 * Usage: app.use(referralFraudDetectionMiddleware);
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const referralFraudDetectionMiddleware = async (req, res, next) => {
  // Only run fraud detection if referral cookie exists
  if (!req.referralCookie) {
    req.fraudAssessment = null;
    return next();
  }

  try {
    // Prepare fraud check data
    const fraudCheckData = {
      referralClickTime: new Date(req.referralCookie.timestamp),
      orderCreatedAt: new Date(), // Current time
      previousReferral: null, // Could be populated from database if needed
      currentRequest: {
        device: req.deviceType || 'desktop',
        userAgent: req.headers['user-agent'] || '',
      },
    };

    // Run fraud detection
    const fraudAssessment = await performComprehensiveFraudCheck(
      req.clientIp || req.ip,
      req.referralCookie,
      fraudCheckData
    );

    req.fraudAssessment = fraudAssessment;

    // Log if suspicious
    if (fraudAssessment.isSuspicious) {
      console.warn(
        `🚨 Suspicious referral activity detected: IP=${req.clientIp}, Affiliate=${req.referralCookie.affiliateCode}, Risk=${fraudAssessment.riskLevel}`
      );
    }

    next();
  } catch (error) {
    console.error('Fraud detection middleware error:', error);
    req.fraudAssessment = null;
    next();
  }
};

/**
 * Middleware: Ensure referral affiliate attribution is set on request
 *
 * Provides a convenient way to access referral data throughout request lifecycle.
 * Combines cookie data with optional explicit affiliate ID.
 *
 * Attaches to req.affiliate object with:
 * - referralId: From cookie or explicit parameter
 * - source: Either 'cookie' or 'parameter'
 * - validated: Whether data has been validated
 * - cookie: Full cookie data if from cookie
 *
 * @param {Object} req - Express request
 * @param {Object} res - Express response
 * @param {Function} next - Express next middleware
 */
const affiliateAttributionMiddleware = (req, res, next) => {
  const attribution = {
    referralId: null,
    source: null,
    validated: false,
    cookie: null,
  };

  // Check for explicit affiliate ID (query param or body)
  if (req.query.affiliateId || req.body?.affiliateId) {
    attribution.referralId = req.query.affiliateId || req.body.affiliateId;
    attribution.source = 'parameter';
    attribution.validated = /^[0-9a-fA-F]{24}$/.test(attribution.referralId);
  }

  // Check for cookie-based attribution (takes precedence if no explicit ID)
  if (req.referralCookie && !attribution.referralId) {
    attribution.referralId = req.referralCookie.affiliateId;
    attribution.source = 'cookie';
    attribution.validated = true;
    attribution.cookie = req.referralCookie;
  }

  req.affiliate = attribution;
  next();
};

module.exports = {
  queryParamAffiliateMiddleware,
  referralCookieMiddleware,
  referralFraudDetectionMiddleware,
  affiliateAttributionMiddleware,
};
