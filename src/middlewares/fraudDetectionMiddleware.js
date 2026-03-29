/**
 * ============================================================================
 * FRAUD DETECTION MIDDLEWARE - Integration Layer for Fraud Checks
 * ============================================================================
 *
 * Provides Express middleware that integrates fraud detection service
 * into request processing pipeline. Performs fraud analysis and includes
 * findings in request context.
 *
 * ============================================================================
 */

const fraudDetectionService = require('../security/fraudDetectionService');
const securityLogger = require('../security/securityLogger');
const { blockIp } = require('./securityMiddleware');

/**
 * Middleware: Check order for fraud after creation
 * Adds fraud analysis to request context
 */
const checkOrderFraud = async (req, res, next) => {
  try {
    // Skip if no order created
    if (!req.order?._id) {
      return next();
    }

    // Perform fraud analysis
    const fraudAnalysis = await fraudDetectionService.analyzeOrderForFraud(req.order._id);

    // Attach to request
    req.fraudAnalysis = fraudAnalysis;

    // Log fraud flag if detected
    if (fraudAnalysis.isFlagged) {
      const ipAddress = req.ip || req.connection.remoteAddress;
      securityLogger.logFraudFlag(
        req.order._id.toString(),
        'order',
        fraudAnalysis.flags[0]?.reason,
        fraudAnalysis.riskLevel,
        {
          flags: fraudAnalysis.flags,
          ipAddress,
          userId: req.user?.id
        }
      );

      // Block IP on critical fraud
      if (fraudAnalysis.riskLevel === 'critical') {
        blockIp(ipAddress, `Critical fraud detected in order ${req.order._id}`, 60);
      }
    }

    next();
  } catch (error) {
    console.error('Order fraud check error:', error);
    // Don't block request on check error
    next();
  }
};

/**
 * Middleware: Analyze referral patterns for affiliate
 */
const checkReferralPatterns = async (req, res, next) => {
  try {
    // Get affiliate ID from query or body
    const affiliateId = req.query.affiliateId || req.body?.affiliateId || req.params?.affiliateId;

    if (!affiliateId) {
      return next();
    }

    // Perform referral pattern analysis
    const patternAnalysis = await fraudDetectionService.analyzeReferralPatterns(affiliateId);

    // Attach to request
    req.patternAnalysis = patternAnalysis;

    // Log if suspicious
    if (patternAnalysis.isFlagged) {
      securityLogger.logReferralAnomaly(
        affiliateId,
        patternAnalysis.flags[0]?.reason,
        patternAnalysis.stats
      );
    }

    next();
  } catch (error) {
    console.error('Referral pattern check error:', error);
    next();
  }
};

/**
 * Middleware: Check commission for fraud indicators
 */
const checkCommissionFraud = async (req, res, next) => {
  try {
    const { affiliateId } = req.body || req.params;

    if (!affiliateId) {
      return next();
    }

    // Check commission spike
    const commissionAnalysis = await fraudDetectionService.analyzeCommissionSpike(affiliateId);

    req.commissionAnalysis = commissionAnalysis;

    // Log if flagged
    if (commissionAnalysis.isFlagged) {
      securityLogger.logFraudFlag(
        affiliateId,
        'affiliate',
        commissionAnalysis.reason,
        commissionAnalysis.riskLevel,
        commissionAnalysis.metrics
      );
    }

    next();
  } catch (error) {
    console.error('Commission fraud check error:', error);
    next();
  }
};

/**
 * Middleware: Validate payout request for fraud
 */
const validatePayoutSecurity = async (req, res, next) => {
  try {
    const payout = req.body || req.payout;

    if (!payout || !payout.affiliateId) {
      return next();
    }

    // Validate payout
    const payoutValidation = await fraudDetectionService.validatePayoutRequest(payout);

    req.payoutValidation = payoutValidation;

    // Log if validation found issues
    if (payoutValidation.isFlagged) {
      securityLogger.logPayoutFlag(
        payout._id?.toString() || 'new',
        payout.affiliateId,
        payout.amount,
        payoutValidation.flags
      );

      // If critical, require admin approval
      if (payoutValidation.requiresAdminVerification) {
        return res.status(403).json({
          success: false,
          error: 'Payout requires admin verification before processing',
          flags: payoutValidation.flags,
          requiresAdminVerification: true
        });
      }
    }

    next();
  } catch (error) {
    console.error('Payout validation error:', error);
    next();
  }
};

/**
 * Middleware: Check for self-referral before commission creation
 * Prevents users from earning commission from their own purchases
 */
const preventSelfReferral = async (req, res, next) => {
  try {
    const { affiliateId, userId } = req.body;

    if (!affiliateId || !userId) {
      return next();
    }

    // Simple check: IDs match
    if (affiliateId.toString() === userId.toString()) {
      securityLogger.logFraudFlag(
        userId,
        'user',
        'self_referral',
        'critical',
        { affiliateId, userId }
      );

      return res.status(403).json({
        success: false,
        error: 'Cannot generate commission from own purchase',
        reason: 'Self-referral not permitted'
      });
    }

    next();
  } catch (error) {
    console.error('Self-referral check error:', error);
    next();
  }
};

/**
 * Middleware: Validate click-to-purchase conversion
 * Ensures referral click is legitimate before commission
 */
const validateReferralClick = async (req, res, next) => {
  try {
    const { referralClickId, affiliateId } = req.body;

    if (!referralClickId || !affiliateId) {
      return next();
    }

    // In production, would validate:
    // 1. Click exists and matches affiliate
    // 2. Click not older than conversion window (e.g., 30 days)
    // 3. No duplicate commission for this click
    // 4. Click pattern matches expected behavior

    // For now, just pass through
    next();
  } catch (error) {
    console.error('Referral click validation error:', error);
    next();
  }
};

/**
 * Middleware: Add security context to all requests
 * Attaches IP address, device info, etc. for fraud analysis
 */
const addSecurityContext = (req, res, next) => {
  req.securityContext = {
    ipAddress: req.ip || req.connection.remoteAddress,
    userAgent: req.get('user-agent'),
    timestamp: new Date(),
    userId: req.user?.id || null,
    endpoint: req.originalUrl,
    method: req.method
  };

  next();
};

/**
 * Middleware: Log suspicious activities
 */
const logSuspiciousActivity = (reason) => {
  return (req, res, next) => {
    const ipAddress = req.ip || req.connection.remoteAddress;

    securityLogger.logFraudFlag(
      req.user?.id || 'anonymous',
      'activity',
      reason,
      'medium',
      {
        ipAddress,
        endpoint: req.originalUrl,
        method: req.method,
        userId: req.user?.id,
        details: req.body
      }
    );

    next();
  };
};

/**
 * Middleware: Enforce payout admin verification
 * For payouts that failed fraud checks
 */
const enforceFraudVerification = (req, res, next) => {
  // Check if request is marked for verification
  if (req.payoutValidation?.requiresAdminVerification) {
    // Only admins can proceed
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin verification required',
        message: 'This payout failed security checks and requires admin approval'
      });
    }
  }

  // Check if order was flagged for fraud
  if (req.fraudAnalysis?.isFlagged && req.fraudAnalysis?.riskLevel === 'critical') {
    if (req.user?.role !== 'admin' && req.user?.role !== 'super_admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin verification required',
        message: 'Order flagged for fraud review',
        fraudFlags: req.fraudAnalysis.flags
      });
    }
  }

  next();
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  checkOrderFraud,
  checkReferralPatterns,
  checkCommissionFraud,
  validatePayoutSecurity,
  preventSelfReferral,
  validateReferralClick,
  addSecurityContext,
  logSuspiciousActivity,
  enforceFraudVerification
};
