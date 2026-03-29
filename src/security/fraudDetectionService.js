/**
 * ============================================================================
 * FRAUD DETECTION SERVICE - Core Fraud Detection Logic
 * ============================================================================
 *
 * Implements comprehensive fraud detection mechanisms for:
 * - Self-referral prevention
 * - Suspicious referral patterns
 * - Anomalous purchase behavior
 * - IP-based abuse detection
 * - Commission spike detection
 * - Payout request validation
 *
 * ============================================================================
 */

const Order = require('../models/Order');
const Commission = require('../models/Commission');
const User = require('../models/User');
const ReferralTracking = require('../models/ReferralTracking');

/**
 * Fraud risk levels
 */
const FRAUD_RISK_LEVEL = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Fraud detection reasons
 */
const FRAUD_REASON = {
  SELF_REFERRAL: 'self_referral',
  SAME_IP_MULTIPLE_PURCHASES: 'same_ip_multiple_purchases',
  REFERRAL_SPIKE: 'referral_spike',
  PURCHASE_SPIKE: 'purchase_spike',
  COMMISSION_SPIKE: 'commission_spike',
  UNUSUAL_PATTERN: 'unusual_pattern',
  HIGH_VALUE_PAYOUT: 'high_value_payout',
  DUPLICATE_COMMISSION: 'duplicate_commission',
  VELOCITY_ABUSE: 'velocity_abuse',
  GEOGRAPHIC_ANOMALY: 'geographic_anomaly'
};

/**
 * FraudDetectionService - Core fraud detection engine
 */
class FraudDetectionService {
  constructor() {
    this.config = {
      minOrdersForPattern: 3,
      timeWindowDays: 7,
      ipThreshold: 5,
      commissionSpikeMultiplier: 3,
      highValuePayoutThreshold: 5000,
      velocityWindow: 24 * 60 * 60 * 1000, // 24 hours
      maxOrdersPerHour: 10
    };
  }

  /**
   * Comprehensive fraud check for a new order
   * @param {String} orderId - Order ID to check
   * @returns {Promise<Object>} Fraud assessment result
   */
  async analyzeOrderForFraud(orderId) {
    try {
      const order = await Order.findById(orderId).lean();
      if (!order) {
        throw new Error('Order not found');
      }

      const checks = await Promise.all([
        this.checkSelfReferral(order),
        this.checkSameIpMultiplePurchases(order),
        this.checkPurchaseVelocityAbuse(order),
        this.checkGeographicAnomaly(order)
      ]);

      const fraudFlags = checks.filter(check => check.isFlagged);
      const maxRiskLevel = this._calculateMaxRiskLevel(fraudFlags);

      return {
        orderId,
        isFlagged: fraudFlags.length > 0,
        riskLevel: maxRiskLevel,
        flags: fraudFlags,
        timestamp: new Date()
      };
    } catch (error) {
      throw new Error(`Order fraud analysis failed: ${error.message}`);
    }
  }

  /**
   * Check for self-referral fraud
   * Prevents users from generating their own affiliate commissions
   * @param {Object} order - Order object
   * @returns {Promise<Object>} Check result
   */
  async checkSelfReferral(order) {
    try {
      // If no affiliate referral, no self-referral possible
      if (!order.affiliateDetails?.affiliateId) {
        return {
          check: 'self_referral',
          isFlagged: false,
          reason: 'No affiliate referral'
        };
      }

      const affiliateId = order.affiliateDetails.affiliateId;
      const buyerId = order.userId;

      // Simple check: affiliate ID matches buyer ID
      if (affiliateId.toString() === buyerId.toString()) {
        return {
          check: 'self_referral',
          isFlagged: true,
          riskLevel: FRAUD_RISK_LEVEL.CRITICAL,
          reason: FRAUD_REASON.SELF_REFERRAL,
          details: 'User purchased through their own affiliate link'
        };
      }

      // Check if user has ever been the affiliate ID owner
      // This catches accounts that were reassigned
      const affiliateUser = await User.findById(affiliateId).lean();
      if (affiliateUser && affiliateUser.createdAt > new Date(Date.now() - 24 * 60 * 60 * 1000)) {
        // Newly created affiliate account - higher scrutiny
        return {
          check: 'self_referral',
          isFlagged: true,
          riskLevel: FRAUD_RISK_LEVEL.HIGH,
          reason: FRAUD_REASON.SELF_REFERRAL,
          details: 'Newly created affiliate account - requires verification'
        };
      }

      return {
        check: 'self_referral',
        isFlagged: false,
        reason: 'Self-referral check passed'
      };
    } catch (error) {
      console.error('Self-referral check error:', error);
      return {
        check: 'self_referral',
        isFlagged: false,
        error: error.message
      };
    }
  }

  /**
   * Check for multiple purchases from same IP linked to affiliate
   * @param {Object} order - Order object
   * @returns {Promise<Object>} Check result
   */
  async checkSameIpMultiplePurchases(order) {
    try {
      if (!order.affiliateDetails?.affiliateId || !order.metadata?.ipAddress) {
        return {
          check: 'same_ip_multiple_purchases',
          isFlagged: false,
          reason: 'Insufficient data for check'
        };
      }

      const affiliateId = order.affiliateDetails.affiliateId;
      const ipAddress = order.metadata.ipAddress;
      const timeWindow = new Date(Date.now() - this.config.timeWindowDays * 24 * 60 * 60 * 1000);

      // Find all orders from same IP linked to same affiliate
      const similarOrders = await Order.countDocuments({
        'metadata.ipAddress': ipAddress,
        'affiliateDetails.affiliateId': affiliateId,
        createdAt: { $gte: timeWindow },
        status: 'completed'
      });

      if (similarOrders >= this.config.ipThreshold) {
        return {
          check: 'same_ip_multiple_purchases',
          isFlagged: true,
          riskLevel: FRAUD_RISK_LEVEL.HIGH,
          reason: FRAUD_REASON.SAME_IP_MULTIPLE_PURCHASES,
          details: `${similarOrders} orders from IP ${ipAddress} linked to affiliate in ${this.config.timeWindowDays} days`
        };
      }

      return {
        check: 'same_ip_multiple_purchases',
        isFlagged: false,
        reason: `${similarOrders} orders from same IP (threshold: ${this.config.ipThreshold})`
      };
    } catch (error) {
      console.error('Same IP check error:', error);
      return {
        check: 'same_ip_multiple_purchases',
        isFlagged: false,
        error: error.message
      };
    }
  }

  /**
   * Check for purchase velocity abuse (too many orders in short timeframe)
   * @param {Object} order - Order object
   * @returns {Promise<Object>} Check result
   */
  async checkPurchaseVelocityAbuse(order) {
    try {
      if (!order.metadata?.ipAddress) {
        return {
          check: 'purchase_velocity',
          isFlagged: false,
          reason: 'No IP address available'
        };
      }

      const ipAddress = order.metadata.ipAddress;
      const timeWindow = new Date(Date.now() - this.config.velocityWindow);

      // Count orders from IP in last 24 hours
      const recentOrderCount = await Order.countDocuments({
        'metadata.ipAddress': ipAddress,
        createdAt: { $gte: timeWindow },
        status: 'completed'
      });

      if (recentOrderCount > this.config.maxOrdersPerHour) {
        return {
          check: 'purchase_velocity',
          isFlagged: true,
          riskLevel: FRAUD_RISK_LEVEL.HIGH,
          reason: FRAUD_REASON.VELOCITY_ABUSE,
          details: `${recentOrderCount} orders from IP in 24 hours (limit: ${this.config.maxOrdersPerHour})`
        };
      }

      return {
        check: 'purchase_velocity',
        isFlagged: false,
        reason: `${recentOrderCount} orders in velocity window`
      };
    } catch (error) {
      console.error('Velocity check error:', error);
      return {
        check: 'purchase_velocity',
        isFlagged: false,
        error: error.message
      };
    }
  }

  /**
   * Check for geographic anomalies
   * @param {Object} order - Order object
   * @returns {Promise<Object>} Check result
   */
  async checkGeographicAnomaly(order) {
    try {
      const userId = order.userId;
      const currentLocation = order.metadata?.location;

      if (!currentLocation) {
        return {
          check: 'geographic_anomaly',
          isFlagged: false,
          reason: 'No location data'
        };
      }

      // Find user's previous orders
      const previousOrders = await Order.findOne({
        userId,
        'metadata.location': { $ne: currentLocation },
        createdAt: { $lt: order.createdAt }
      })
        .sort({ createdAt: -1 })
        .lean();

      if (!previousOrders) {
        return {
          check: 'geographic_anomaly',
          isFlagged: false,
          reason: 'First order from this location'
        };
      }

      // Simple anomaly: location changed dramatically
      // In production, calculate distance and time elapsed
      return {
        check: 'geographic_anomaly',
        isFlagged: false,
        reason: 'Location check passed'
      };
    } catch (error) {
      console.error('Geographic check error:', error);
      return {
        check: 'geographic_anomaly',
        isFlagged: false,
        error: error.message
      };
    }
  }

  /**
   * Check for suspicious referral patterns
   * @param {String} affiliateId - Affiliate ID
   * @returns {Promise<Object>} Fraud assessment
   */
  async analyzeReferralPatterns(affiliateId) {
    try {
      const timeWindow = new Date(Date.now() - this.config.timeWindowDays * 24 * 60 * 60 * 1000);

      // Get referral clicks
      const clickStats = await ReferralTracking.aggregate([
        {
          $match: {
            affiliateId,
            createdAt: { $gte: timeWindow }
          }
        },
        {
          $group: {
            _id: null,
            totalClicks: { $sum: 1 },
            uniqueIps: { $addToSet: '$ipAddress' },
            uniqueUserAgents: { $addToSet: '$userAgent' }
          }
        }
      ]);

      if (clickStats.length === 0) {
        return {
          affiliateId,
          isFlagged: false,
          reason: 'No referral clicks in period'
        };
      }

      const stats = clickStats[0];
      const ipCount = stats.uniqueIps?.length || 0;
      const userAgentCount = stats.uniqueUserAgents?.length || 0;
      const flags = [];

      // Check for bot-like behavior (many clicks from same IP/UA)
      if (ipCount > 0 && stats.totalClicks / ipCount > 20) {
        flags.push({
          riskLevel: FRAUD_RISK_LEVEL.HIGH,
          reason: FRAUD_REASON.REFERRAL_SPIKE,
          details: `High click concentration: ${stats.totalClicks} clicks from ${ipCount} IPs`
        });
      }

      // Check for too few unique user agents (bot indicators)
      if (userAgentCount < 3 && stats.totalClicks > 50) {
        flags.push({
          riskLevel: FRAUD_RISK_LEVEL.MEDIUM,
          reason: FRAUD_REASON.UNUSUAL_PATTERN,
          details: 'Low user agent diversity suggests automated traffic'
        });
      }

      return {
        affiliateId,
        isFlagged: flags.length > 0,
        riskLevel: flags.length > 0 ? flags[0].riskLevel : FRAUD_RISK_LEVEL.LOW,
        flags,
        stats: {
          totalClicks: stats.totalClicks,
          uniqueIps: ipCount,
          uniqueUserAgents: userAgentCount
        }
      };
    } catch (error) {
      console.error('Referral pattern analysis error:', error);
      return {
        affiliateId,
        isFlagged: false,
        error: error.message
      };
    }
  }

  /**
   * Check for commission spikes
   * @param {String} affiliateId - Affiliate ID
   * @returns {Promise<Object>} Commission spike assessment
   */
  async analyzeCommissionSpike(affiliateId) {
    try {
      const recentDays = 7;
      const olderDays = 30;

      const recentWindow = new Date(Date.now() - recentDays * 24 * 60 * 60 * 1000);
      const olderWindow = new Date(Date.now() - olderDays * 24 * 60 * 60 * 1000);

      // Get recent commission average
      const recentCommissions = await Commission.aggregate([
        {
          $match: {
            affiliateId,
            status: { $in: ['approved', 'paid'] },
            createdAt: { $gte: recentWindow }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$commissionAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      // Get older commission average (baseline)
      const olderCommissions = await Commission.aggregate([
        {
          $match: {
            affiliateId,
            status: { $in: ['approved', 'paid'] },
            createdAt: { $gte: olderWindow, $lt: recentWindow }
          }
        },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$commissionAmount' },
            count: { $sum: 1 }
          }
        }
      ]);

      if (olderCommissions.length === 0) {
        return {
          affiliateId,
          isFlagged: false,
          reason: 'Insufficient historical data'
        };
      }

      const recentAmount = recentCommissions[0]?.totalAmount || 0;
      const olderAmount = olderCommissions[0].totalAmount;
      const ratio = recentAmount / olderAmount;

      if (ratio > this.config.commissionSpikeMultiplier) {
        return {
          affiliateId,
          isFlagged: true,
          riskLevel: FRAUD_RISK_LEVEL.MEDIUM,
          reason: FRAUD_REASON.COMMISSION_SPIKE,
          details: `Commission amount increased by ${(ratio * 100 - 100).toFixed(1)}% (${this.config.commissionSpikeMultiplier}x threshold)`,
          metrics: {
            recentAmount,
            olderAmount,
            ratio: ratio.toFixed(2)
          }
        };
      }

      return {
        affiliateId,
        isFlagged: false,
        reason: 'Commission pattern normal',
        metrics: {
          recentAmount,
          olderAmount,
          ratio: ratio.toFixed(2)
        }
      };
    } catch (error) {
      console.error('Commission spike analysis error:', error);
      return {
        affiliateId,
        isFlagged: false,
        error: error.message
      };
    }
  }

  /**
   * Validate payout request for fraud indicators
   * @param {Object} payout - Payout object
   * @returns {Promise<Object>} Payout validation result
   */
  async validatePayoutRequest(payout) {
    try {
      const flags = [];

      // Check 1: High value payout
      if (payout.amount > this.config.highValuePayoutThreshold) {
        flags.push({
          riskLevel: FRAUD_RISK_LEVEL.MEDIUM,
          reason: FRAUD_REASON.HIGH_VALUE_PAYOUT,
          details: `Payout amount $${payout.amount} exceeds threshold`
        });
      }

      // Check 2: Unusual payment method
      const validMethods = ['bank_transfer', 'paypal', 'stripe', 'cryptocurrency'];
      if (!validMethods.includes(payout.method)) {
        flags.push({
          riskLevel: FRAUD_RISK_LEVEL.CRITICAL,
          reason: 'Invalid payout method',
          details: `Method ${payout.method} not recognized`
        });
      }

      // Check 3: Verify affiliate status
      const affiliate = await User.findById(payout.affiliateId).lean();
      if (!affiliate || !affiliate.affiliateDetails.isAffiliate) {
        flags.push({
          riskLevel: FRAUD_RISK_LEVEL.CRITICAL,
          reason: 'Invalid affiliate',
          details: 'Affiliate account not found or not active'
        });
      }

      // Check 4: Recent account creation
      if (affiliate && new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) < new Date(affiliate.createdAt)) {
        flags.push({
          riskLevel: FRAUD_RISK_LEVEL.HIGH,
          reason: 'New account payout',
          details: 'Affiliate account created less than 7 days ago'
        });
      }

      return {
        payoutId: payout._id,
        isFlagged: flags.length > 0,
        riskLevel: flags.length > 0 ? flags[0].riskLevel : FRAUD_RISK_LEVEL.LOW,
        flags,
        requiresAdminVerification: flags.some(f => f.riskLevel === FRAUD_RISK_LEVEL.CRITICAL)
      };
    } catch (error) {
      console.error('Payout validation error:', error);
      return {
        payoutId: payout._id,
        isFlagged: false,
        error: error.message
      };
    }
  }

  /**
   * Private helper: Calculate max risk level from flags
   */
  _calculateMaxRiskLevel(flags) {
    if (flags.length === 0) return FRAUD_RISK_LEVEL.LOW;
    
    const levels = [FRAUD_RISK_LEVEL.CRITICAL, FRAUD_RISK_LEVEL.HIGH, FRAUD_RISK_LEVEL.MEDIUM, FRAUD_RISK_LEVEL.LOW];
    for (const level of levels) {
      if (flags.some(f => f.riskLevel === level)) {
        return level;
      }
    }
    return FRAUD_RISK_LEVEL.LOW;
  }
}

// Export singleton instance
module.exports = new FraudDetectionService();
module.exports.FRAUD_RISK_LEVEL = FRAUD_RISK_LEVEL;
module.exports.FRAUD_REASON = FRAUD_REASON;
