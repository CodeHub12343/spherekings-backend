/**
 * Fraud Detection Utilities
 * Fraud prevention and suspicious activity detection for referral tracking
 */

const ReferralTracking = require('../models/ReferralTracking');

/**
 * Fraud detection thresholds
 * Adjustable based on business needs and monitoring
 */
const FRAUD_THRESHOLDS = {
  // Click-per-IP thresholds
  clicksPerIPIn24h: 50, // Max clicks from one IP in 24 hours
  clicksPerIPIn1h: 10, // Max clicks from one IP in 1 hour

  // Affiliate code switching threshold
  affiliateCodesPerIPIn24h: 10, // Max different affiliate codes from one IP in 24h

  // Conversion rate anomaly
  minConversionTimeMs: 5000, // Minimum time between click and order (5 seconds)
  maxConversionTimeMs: 30 * 24 * 60 * 60 * 1000, // Maximum time (30 days)

  // Device/Browser inconsistency
  maxDeviceChangesPerVisitor: 3, // Max device changes for same visitor

  // Self-referral detection
  velocitySelfReferralCheck: true, // Check for rapid self-purchases

  // Geolocation anomaly
  maxSpeedKmPerSecond: 900, // Max realistic speed between clicks (airplane speed)
};

/**
 * Check for excessive clicks from single IP
 *
 * Detects bot traffic and click spam
 *
 * @param {string} ipAddress - IP address to check
 * @param {number} timeWindowMs - Time window to check (default: 24 hours)
 * @returns {Promise<Object>} { isSuspicious, count, threshold }
 */
const checkExcessiveClicks = async (ipAddress, timeWindowMs = 24 * 60 * 60 * 1000) => {
  try {
    const startTime = new Date(Date.now() - timeWindowMs);

    const clickCount = await ReferralTracking.countDocuments({
      ipAddress,
      createdAt: { $gte: startTime },
    });

    const threshold = FRAUD_THRESHOLDS.clicksPerIPIn24h;

    return {
      isSuspicious: clickCount > threshold,
      count: clickCount,
      threshold,
      ipAddress,
      timeWindowHours: timeWindowMs / (60 * 60 * 1000),
    };
  } catch (error) {
    console.error('Excessive clicks check error:', error.message);
    return {
      isSuspicious: false,
      count: 0,
      threshold: FRAUD_THRESHOLDS.clicksPerIPIn24h,
    };
  }
};

/**
 * Check for rapid affiliate code switching
 *
 * Detects user promoting multiple affiliates (potential multi-accounting fraud)
 *
 * @param {string} ipAddress - IP address to check
 * @param {number} timeWindowMs - Time window to check (default: 24 hours)
 * @returns {Promise<Object>} { isSuspicious, affiliateCodeCount, threshold }
 */
const checkAffiliateCodeSwitching = async (
  ipAddress,
  timeWindowMs = 24 * 60 * 60 * 1000
) => {
  try {
    const startTime = new Date(Date.now() - timeWindowMs);

    const affiliateCodes = await ReferralTracking.distinct('affiliateCode', {
      ipAddress,
      createdAt: { $gte: startTime },
    });

    const threshold = FRAUD_THRESHOLDS.affiliateCodesPerIPIn24h;

    return {
      isSuspicious: affiliateCodes.length > threshold,
      affiliateCodeCount: affiliateCodes.length,
      threshold,
      affiliateCodes,
      ipAddress,
    };
  } catch (error) {
    console.error('Affiliate code switching check error:', error.message);
    return {
      isSuspicious: false,
      affiliateCodeCount: 0,
      threshold: FRAUD_THRESHOLDS.affiliateCodesPerIPIn24h,
    };
  }
};

/**
 * Check for abnormal conversion speed
 *
 * Detects unusually fast or suspiciously slow conversions
 * (Real customers take some time to decide; instant purchases may indicate fraud)
 *
 * @param {Date} referralClickTime - When the referral click occurred
 * @param {Date} orderCreationTime - When order was created
 * @returns {Object} { isSuspicious, reasons, timeElapsedMs }
 */
const checkConversionSpeed = (referralClickTime, orderCreationTime) => {
  const timeElapsedMs = orderCreationTime.getTime() - referralClickTime.getTime();
  const reasons = [];

  if (timeElapsedMs < FRAUD_THRESHOLDS.minConversionTimeMs) {
    reasons.push(
      `Conversion too fast (${Math.round(timeElapsedMs / 1000)} seconds)`
    );
  }

  if (timeElapsedMs > FRAUD_THRESHOLDS.maxConversionTimeMs) {
    reasons.push(
      `Conversion too slow (${Math.round(timeElapsedMs / (24 * 60 * 60 * 1000))} days)`
    );
  }

  return {
    isSuspicious: reasons.length > 0,
    reasons,
    timeElapsedMs,
    timeElapsedSeconds: Math.round(timeElapsedMs / 1000),
    timeElapsedMinutes: Math.round(timeElapsedMs / (60 * 1000)),
    timeElapsedHours: Math.round(timeElapsedMs / (60 * 60 * 1000)),
    timeElapsedDays: Math.round(timeElapsedMs / (24 * 60 * 60 * 1000)),
  };
};

/**
 * Check for device/browser inconsistency
 *
 * Detects if same visitor suddenly uses completely different device
 * (Could indicate account compromise or different person)
 *
 * @param {Object} previousReferral - Previous referral record
 * @param {Object} currentRequest - Current request info
 * @returns {Object} { isSuspicious, reason }
 */
const checkDeviceConsistency = (previousReferral, currentRequest) => {
  if (!previousReferral || !currentRequest) {
    return { isSuspicious: false, reason: null };
  }

  // Check device type change
  if (previousReferral.device !== currentRequest.device) {
    // Allow some device switching (but not drastic changes)
    // Mobile→Tablet or Desktop→Tablet is normal (same person, different device)
    // But rapid switching to completely different device types is suspect
    return {
      isSuspicious: true,
      reason: `Device changed from ${previousReferral.device} to ${currentRequest.device}`,
      deviceChange: {
        from: previousReferral.device,
        to: currentRequest.device,
      },
    };
  }

  // Check browser/OS consistency from User-Agent
  if (previousReferral.userAgent && currentRequest.userAgent) {
    if (previousReferral.userAgent !== currentRequest.userAgent) {
      return {
        isSuspicious: false, // Browser changes are normal
        reason: 'Browser/OS changed',
      };
    }
  }

  return { isSuspicious: false, reason: null };
};

/**
 * Check for geographic anomalies
 *
 * Detects impossible geographical movements between clicks
 * (E.g., click from New York, then order from Tokyo 1 second later)
 *
 * @param {Object} previousLocation - Previous geolocation { lat, lng }
 * @param {Object} currentLocation - Current geolocation { lat, lng }
 * @param {number} timeElapsedSeconds - Time between clicks in seconds
 * @returns {Object} { isSuspicious, reason, calculatedSpeed }
 */
const checkGeographicAnomalies = (
  previousLocation,
  currentLocation,
  timeElapsedSeconds
) => {
  if (!previousLocation || !currentLocation || timeElapsedSeconds <= 0) {
    return { isSuspicious: false, reason: null };
  }

  // Simple distance calculation (Haversine)
  const R = 6371; // Earth's radius in km
  const dLat = (currentLocation.lat - previousLocation.lat) * (Math.PI / 180);
  const dLng = (currentLocation.lng - previousLocation.lng) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(previousLocation.lat * (Math.PI / 180)) *
      Math.cos(currentLocation.lat * (Math.PI / 180)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c; // Distance in km

  const speedKmPerSecond = distance / timeElapsedSeconds;
  const maxSpeed = FRAUD_THRESHOLDS.maxSpeedKmPerSecond;

  if (speedKmPerSecond > maxSpeed) {
    return {
      isSuspicious: true,
      reason: `Impossible travel speed (${Math.round(speedKmPerSecond)} km/s)`,
      distance,
      timeElapsedSeconds,
      calculatedSpeed: speedKmPerSecond,
      maxAllowedSpeed: maxSpeed,
    };
  }

  return {
    isSuspicious: false,
    reason: null,
    distance,
    calculatedSpeed: speedKmPerSecond,
  };
};

/**
 * Comprehensive fraud check
 *
 * Runs multiple fraud detection checks and returns overall assessment
 *
 * @param {string} ipAddress - IP address to check
 * @param {Object} affiliateCookie - Affiliate cookie data
 * @param {Object} orderData - Order information
 * @returns {Promise<Object>} Comprehensive fraud assessment
 */
const performComprehensiveFraudCheck = async (ipAddress, affiliateCookie, orderData) => {
  const checks = {
    excessiveClicks: null,
    affiliateCodeSwitching: null,
    conversionSpeed: null,
    deviceConsistency: null,
    geographicAnomalies: null,
  };

  const warnings = [];
  let suspicionScore = 0; // 0-100 score

  try {
    // Check 1: Excessive clicks
    checks.excessiveClicks = await checkExcessiveClicks(ipAddress);
    if (checks.excessiveClicks.isSuspicious) {
      warnings.push('Excessive clicks from IP address');
      suspicionScore += 25;
    }

    // Check 2: Affiliate code switching
    checks.affiliateCodeSwitching = await checkAffiliateCodeSwitching(ipAddress);
    if (checks.affiliateCodeSwitching.isSuspicious) {
      warnings.push('Multiple affiliate codes from same IP');
      suspicionScore += 20;
    }

    // Check 3: Conversion speed
    if (orderData && orderData.referralClickTime && orderData.orderCreatedAt) {
      checks.conversionSpeed = checkConversionSpeed(
        orderData.referralClickTime,
        orderData.orderCreatedAt
      );
      if (checks.conversionSpeed.isSuspicious) {
        warnings.push(`Abnormal conversion speed: ${checks.conversionSpeed.reasons.join(', ')}`);
        suspicionScore += 15;
      }
    }

    // Check 4: Device consistency
    if (orderData && orderData.previousReferral) {
      checks.deviceConsistency = checkDeviceConsistency(
        orderData.previousReferral,
        orderData.currentRequest
      );
      if (checks.deviceConsistency.isSuspicious) {
        warnings.push(checks.deviceConsistency.reason);
        suspicionScore += 10;
      }
    }

    // Check 5: Geographic anomalies
    if (orderData && orderData.previousLocation && orderData.currentLocation) {
      checks.geographicAnomalies = checkGeographicAnomalies(
        orderData.previousLocation,
        orderData.currentLocation,
        orderData.timeElapsedSeconds
      );
      if (checks.geographicAnomalies.isSuspicious) {
        warnings.push(checks.geographicAnomalies.reason);
        suspicionScore += 30;
      }
    }
  } catch (error) {
    console.error('Fraud check error:', error);
  }

  // Cap suspicion score at 100
  suspicionScore = Math.min(suspicionScore, 100);

  return {
    isSuspicious: suspicionScore >= 40, // Flag if score >= 40
    suspicionScore,
    checks,
    warnings,
    riskLevel: suspicionScore >= 70 ? 'high' : suspicionScore >= 40 ? 'medium' : 'low',
    timestamp: new Date().toISOString(),
  };
};

/**
 * Get fraud status explanation
 *
 * Returns human-readable explanation of fraud assessment
 *
 * @param {Object} fraudAssessment - Result from performComprehensiveFraudCheck()
 * @returns {string} Human-readable explanation
 */
const getFraudExplanation = (fraudAssessment) => {
  if (fraudAssessment.isSuspicious) {
    return `🚨 Potential fraud detected (Risk: ${fraudAssessment.riskLevel.toUpperCase()}, Score: ${fraudAssessment.suspicionScore}/100). Warnings: ${fraudAssessment.warnings.join('; ')}`;
  }

  return `✅ No fraud detected (Risk: LOW, Score: ${fraudAssessment.suspicionScore}/100)`;
};

module.exports = {
  FRAUD_THRESHOLDS,
  checkExcessiveClicks,
  checkAffiliateCodeSwitching,
  checkConversionSpeed,
  checkDeviceConsistency,
  checkGeographicAnomalies,
  performComprehensiveFraudCheck,
  getFraudExplanation,
};
