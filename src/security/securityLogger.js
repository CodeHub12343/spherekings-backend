/**
 * ============================================================================
 * SECURITY LOGGER - Security Event Logging and Monitoring
 * ============================================================================
 *
 * Centralized logging system for security-related events:
 * - Authentication failures
 * - Rate limit violations
 * - Fraud detection flags
 * - Suspicious user activity
 * - API abuse patterns
 *
 * ============================================================================
 */

const fs = require('fs');
const path = require('path');

/**
 * Security event types
 */
const EVENT_TYPE = {
  AUTH_FAILURE: 'auth_failure',
  AUTH_SUCCESS: 'auth_success',
  RATE_LIMIT: 'rate_limit_exceeded',
  FRAUD_FLAG: 'fraud_flag',
  FRAUD_CHECK: 'fraud_check',
  SUSPICIOUS_ACTIVITY: 'suspicious_activity',
  API_ABUSE: 'api_abuse',
  ACCOUNT_LOCKOUT: 'account_lockout',
  PAYOUT_FLAG: 'payout_flag',
  IP_BLOCKED: 'ip_blocked',
  REFERRAL_ANOMALY: 'referral_anomaly'
};

/**
 * Security event severity levels
 */
const SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  ERROR: 'error',
  CRITICAL: 'critical'
};

/**
 * SecurityLogger - Centralized security event logging
 */
class SecurityLogger {
  constructor() {
    this.logDir = path.join(process.cwd(), 'logs', 'security');
    this.ensureLogDirectory();
    this.inMemoryCache = []; // Last 10000 events
    this.maxCacheSize = 10000;
  }

  /**
   * Ensure log directory exists
   */
  ensureLogDirectory() {
    if (!fs.existsSync(this.logDir)) {
      fs.mkdirSync(this.logDir, { recursive: true });
    }
  }

  /**
   * Log authentication failure
   * @param {String} email - User email or identifier
   * @param {String} ipAddress - IP address of attacker
   * @param {String} reason - Failure reason
   * @param {Number} attemptCount - Number of attempts
   */
  logAuthFailure(email, ipAddress, reason, attemptCount = 1) {
    const event = {
      type: EVENT_TYPE.AUTH_FAILURE,
      severity: attemptCount >= 5 ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      email,
      ipAddress,
      reason,
      attemptCount,
      timestamp: new Date(),
      alert: attemptCount >= 5
    };

    this._recordEvent(event);

    // Alert on suspicious behavior
    if (attemptCount >= 5) {
      this._sendAlert({
        type: 'BRUTE_FORCE_ATTEMPT',
        description: `${attemptCount} failed login attempts for ${email} from ${ipAddress}`,
        severity: SEVERITY.CRITICAL,
        actionRequired: 'Monitor and potentially block IP'
      });
    }
  }

  /**
   * Log authentication success
   * @param {String} userId - User ID
   * @param {String} email - User email
   * @param {String} ipAddress - IP address
   */
  logAuthSuccess(userId, email, ipAddress) {
    const event = {
      type: EVENT_TYPE.AUTH_SUCCESS,
      severity: SEVERITY.INFO,
      userId,
      email,
      ipAddress,
      timestamp: new Date()
    };

    this._recordEvent(event);
  }

  /**
   * Log rate limit violation
   * @param {String} ipAddress - IP address
   * @param {String} endpoint - Endpoint accessed
   * @param {Number} requestCount - Number of requests
   * @param {String} timeWindow - Time window
   */
  logRateLimitViolation(ipAddress, endpoint, requestCount, timeWindow) {
    const event = {
      type: EVENT_TYPE.RATE_LIMIT,
      severity: SEVERITY.WARNING,
      ipAddress,
      endpoint,
      requestCount,
      timeWindow,
      timestamp: new Date()
    };

    this._recordEvent(event);

    if (requestCount > 1000) {
      this._sendAlert({
        type: 'EXCESSIVE_API_CALLS',
        description: `${requestCount} requests from ${ipAddress} to ${endpoint} in ${timeWindow}`,
        severity: SEVERITY.CRITICAL,
        actionRequired: 'Review and potentially block IP'
      });
    }
  }

  /**
   * Log fraud flag
   * @param {String} entityId - Entity ID (user/order/commission)
   * @param {String} entityType - Type of entity
   * @param {String} fraudReason - Fraud reason
   * @param {String} riskLevel - Risk level
   * @param {Object} details - Additional details
   */
  logFraudFlag(entityId, entityType, fraudReason, riskLevel, details = {}) {
    const event = {
      type: EVENT_TYPE.FRAUD_FLAG,
      severity: this._riskLevelToSeverity(riskLevel),
      entityId,
      entityType,
      fraudReason,
      riskLevel,
      details,
      timestamp: new Date(),
      requiresReview: riskLevel === 'critical' || riskLevel === 'high'
    };

    this._recordEvent(event);

    // Send alert for high-risk findings
    if (event.requiresReview) {
      this._sendAlert({
        type: 'FRAUD_DETECTED',
        description: `${entityType} ${entityId} flagged for ${fraudReason} (${riskLevel} risk)`,
        severity: event.severity,
        details,
        actionRequired: 'Admin review required'
      });
    }
  }

  /**
   * Log suspicious referral activity
   * @param {String} affiliateId - Affiliate ID
   * @param {String} suspiciousPattern - Pattern detected
   * @param {Object} metrics - Relevant metrics
   */
  logReferralAnomaly(affiliateId, suspiciousPattern, metrics = {}) {
    const event = {
      type: EVENT_TYPE.REFERRAL_ANOMALY,
      severity: SEVERITY.WARNING,
      affiliateId,
      suspiciousPattern,
      metrics,
      timestamp: new Date()
    };

    this._recordEvent(event);

    this._sendAlert({
      type: 'REFERRAL_ANOMALY_DETECTED',
      description: `Affiliate ${affiliateId} showing ${suspiciousPattern}`,
      severity: SEVERITY.WARNING,
      metrics,
      actionRequired: 'Review affiliate activity'
    });
  }

  /**
   * Log payout flag
   * @param {String} payoutId - Payout ID
   * @param {String} affiliateId - Affiliate ID
   * @param {Number} amount - Payout amount
   * @param {Array} flags - Fraud flags
   */
  logPayoutFlag(payoutId, affiliateId, amount, flags) {
    const event = {
      type: EVENT_TYPE.PAYOUT_FLAG,
      severity: flags.some(f => f.riskLevel === 'critical') ? SEVERITY.CRITICAL : SEVERITY.WARNING,
      payoutId,
      affiliateId,
      amount,
      flags,
      timestamp: new Date(),
      requiresAdminVerification: flags.some(f => f.riskLevel === 'critical')
    };

    this._recordEvent(event);

    if (event.requiresAdminVerification) {
      this._sendAlert({
        type: 'PAYOUT_REQUIRES_VERIFICATION',
        description: `Payout ${payoutId} for $${amount} requires admin verification`,
        severity: SEVERITY.CRITICAL,
        flags,
        actionRequired: 'Admin approval required before processing'
      });
    }
  }

  /**
   * Log account lockout
   * @param {String} userId - User ID
   * @param {String} email - User email
   * @param {String} reason - Lockout reason
   */
  logAccountLockout(userId, email, reason) {
    const event = {
      type: EVENT_TYPE.ACCOUNT_LOCKOUT,
      severity: SEVERITY.WARNING,
      userId,
      email,
      reason,
      timestamp: new Date(),
      actionRequired: true
    };

    this._recordEvent(event);

    this._sendAlert({
      type: 'ACCOUNT_LOCKED',
      description: `Account ${email} locked due to ${reason}`,
      severity: SEVERITY.WARNING,
      actionRequired: 'Administrator review may be needed'
    });
  }

  /**
   * Log IP block
   * @param {String} ipAddress - IP address to block
   * @param {String} reason - Block reason
   * @param {Number} duration - Block duration in minutes
   */
  logIpBlock(ipAddress, reason, duration) {
    const event = {
      type: EVENT_TYPE.IP_BLOCKED,
      severity: SEVERITY.WARNING,
      ipAddress,
      reason,
      duration,
      timestamp: new Date(),
      expiresAt: new Date(Date.now() + duration * 60 * 1000)
    };

    this._recordEvent(event);

    this._sendAlert({
      type: 'IP_BLOCKED',
      description: `IP ${ipAddress} blocked for ${duration} minutes: ${reason}`,
      severity: SEVERITY.WARNING,
      actionRequired: 'Monitor for unblocking'
    });
  }

  /**
   * Get security log summary
   * @param {Object} options - Filter options
   * @returns {Array} Filtered events
   */
  getSecuritySummary(options = {}) {
    const {
      hours = 24,
      eventType = null,
      severity = null,
      limit = 100
    } = options;

    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    let events = this.inMemoryCache.filter(e => new Date(e.timestamp) >= cutoff);

    if (eventType) {
      events = events.filter(e => e.type === eventType);
    }

    if (severity) {
      events = events.filter(e => e.severity === severity);
    }

    return events.slice(-limit).reverse();
  }

  /**
   * Get critical alerts needing attention
   * @returns {Array} Critical events
   */
  getCriticalAlerts() {
    return this.getSecuritySummary({
      hours: 24,
      severity: SEVERITY.CRITICAL,
      limit: 50
    });
  }

  /**
   * Get fraud summary
   * @param {Object} options - Filter options
   * @returns {Object} Fraud statistics
   */
  getFraudSummary(options = {}) {
    const { hours = 24 } = options;
    const summary = this.getSecuritySummary({ hours });

    const fraudEvents = summary.filter(e => e.type === EVENT_TYPE.FRAUD_FLAG);
    const byRiskLevel = {};
    const byReason = {};

    fraudEvents.forEach(event => {
      byRiskLevel[event.riskLevel] = (byRiskLevel[event.riskLevel] || 0) + 1;
      byReason[event.fraudReason] = (byReason[event.fraudReason] || 0) + 1;
    });

    return {
      totalFraudFlags: fraudEvents.length,
      byRiskLevel,
      byReason,
      recentEvents: fraudEvents.slice(-20)
    };
  }

  /**
   * Export logs to file
   * @param {String} format - Format (json, csv)
   * @returns {String} File path
   */
  exportLogs(format = 'json') {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const filename = `security-export-${timestamp}.${format}`;
    const filepath = path.join(this.logDir, filename);

    let content;
    if (format === 'json') {
      content = JSON.stringify(this.inMemoryCache, null, 2);
    } else if (format === 'csv') {
      content = this._convertToCsv(this.inMemoryCache);
    }

    fs.writeFileSync(filepath, content);
    return filepath;
  }

  /**
   * PRIVATE METHODS
   */

  /**
   * Record event in memory and file
   */
  _recordEvent(event) {
    // Add to in-memory cache
    this.inMemoryCache.push(event);
    if (this.inMemoryCache.length > this.maxCacheSize) {
      this.inMemoryCache.shift();
    }

    // Write to file
    this._writeToFile(event);
  }

  /**
   * Write event to daily log file
   */
  _writeToFile(event) {
    const date = new Date(event.timestamp);
    const dateStr = date.toISOString().split('T')[0];
    const logFile = path.join(this.logDir, `security-${dateStr}.log`);

    const logEntry = JSON.stringify(event) + '\n';
    fs.appendFileSync(logFile, logEntry);
  }

  /**
   * Convert events to CSV format
   */
  _convertToCsv(events) {
    if (events.length === 0) return '';

    const headers = ['timestamp', 'type', 'severity', 'details'];
    const rows = events.map(e => [
      e.timestamp,
      e.type,
      e.severity,
      JSON.stringify(e).replace(/"/g, '""')
    ].map(v => `"${v}"`).join(','));

    return [headers.join(','), ...rows].join('\n');
  }

  /**
   * Convert risk level to severity
   */
  _riskLevelToSeverity(riskLevel) {
    const mapping = {
      low: SEVERITY.INFO,
      medium: SEVERITY.WARNING,
      high: SEVERITY.ERROR,
      critical: SEVERITY.CRITICAL
    };
    return mapping[riskLevel] || SEVERITY.WARNING;
  }

  /**
   * Send alert (could integrate with email, Slack, etc.)
   */
  _sendAlert(alert) {
    // In production, this would send to monitoring system
    console.warn(`[SECURITY ALERT] ${alert.type}: ${alert.description}`);

    // TODO: Integrate with:
    // - Email notifications
    // - Slack webhooks
    // - PagerDuty
    // - CloudWatch
  }
}

// Export singleton instance and constants
module.exports = new SecurityLogger();
module.exports.EVENT_TYPE = EVENT_TYPE;
module.exports.SEVERITY = SEVERITY;
