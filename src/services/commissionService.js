/**
 * Commission Service
 * Core business logic for commission calculation, approval, and management
 */

const Commission = require('../models/Commission');
const Order = require('../models/Order');
const Affiliate = require('../models/Affiliate');
const User = require('../models/User');
const ReferralTracking = require('../models/ReferralTracking');
const { ValidationError, NotFoundError, ServerError } = require('../utils/errors');

class CommissionService {
  /**
   * Create commission when order is paid
   *
   * Triggered by Stripe webhook: checkout.session.completed
   *
   * Flow:
   * 1. Validate order has been paid and not already commissioned
   * 2. Extract affiliated order information
   * 3. Validate affiliate exists and is active
   * 4. Calculate commission amount
   * 5. Check for fraud indicators
   * 6. Create commission record
   * 7. Update affiliate balance
   * 8. Link referral tracking
   *
   * @param {Object} order - Order object from Order model
   * @param {Object} options - Extra options
   *   - overrideRate: Custom commission rate (for testing/manual)
   *   - requiresApproval: Force manual approval
   * @returns {Promise<Object>} Created commission
   */
  async createCommissionFromOrder(order, options = {}) {
    try {
      // Validate order
      if (!order || !order._id) {
        throw new ValidationError('Invalid order provided');
      }

      if (order.paymentStatus !== 'paid') {
        throw new ValidationError(
          `Cannot create commission for unpaid order. Status: ${order.paymentStatus}`
        );
      }

      // Check if commission already exists for this order
      const existingCommission = await Commission.findOne({ orderId: order._id });
      if (existingCommission) {
        console.warn(`Commission already exists for order ${order._id}`);
        return existingCommission;
      }

      // Extract affiliate information
      if (!order.affiliateDetails || !order.affiliateDetails.affiliateId) {
        // No affiliate - skip commission creation
        return null;
      }

      const { affiliateId, affiliateCode } = order.affiliateDetails;

      // Validate affiliate exists and is active
      const affiliate = await Affiliate.findById(affiliateId).select('_id status userId');

      if (!affiliate) {
        throw new NotFoundError(`Affiliate ${affiliateId} not found`);
      }

      if (affiliate.status !== 'active') {
        throw new ValidationError(`Affiliate ${affiliateId} is not active`);
      }

      // Prevent self-referral (user buying through own link - already checked in referral tracking, but double-check)
      if (affiliate.userId.toString() === order.userId.toString()) {
        console.warn(`Self-referral prevented: Affiliate ${affiliateId} is buyer ${order.userId}`);
        return null;
      }

      // Determine commission rate
      const commissionRate = options.overrideRate || order.affiliateDetails.commissionRate || 0.10;

      // Calculate commission amount
      const orderTotal = order.total || 0;
      const commissionAmount = Number((orderTotal * commissionRate).toFixed(2));

      // Check for fraud indicators
      let fraudIndicators = {
        flagged: false,
        reason: null,
        riskLevel: 'low',
        score: 0,
      };

      // Basic fraud checks (can be extended)
      if (commissionAmount > 10000) {
        // High commission value
        fraudIndicators.flagged = true;
        fraudIndicators.reason = 'Unusually high commission amount';
        fraudIndicators.riskLevel = 'medium';
        fraudIndicators.score = 30;
      }

      // Get referral tracking data if available
      let referralData = null;
      if (order.affiliateDetails.referralClickId) {
        referralData = await ReferralTracking.findById(
          order.affiliateDetails.referralClickId
        ).select('referralSource device utmCampaign utmMedium utmSource');

        // Check referral fraud flags
        if (referralData && referralData.suspicious) {
          fraudIndicators.flagged = true;
          fraudIndicators.reason = `Referral marked suspicious: ${referralData.suspiciousReason}`;
          fraudIndicators.riskLevel = 'high';
          fraudIndicators.score = 70;
        }
      }

      // Create commission record
      const commissionData = {
        affiliateId,
        orderId: order._id,
        orderNumber: order.orderNumber,
        buyerId: order.userId,
        calculation: {
          orderTotal,
          rate: commissionRate,
          amount: commissionAmount,
          tier: 'standard',
          calculatedAt: new Date(),
        },
        status: 'pending',
        fraudIndicators,
        approval: {
          requiresApproval: fraudIndicators.flagged || options.requiresApproval || false,
          reason: fraudIndicators.flagged ? fraudIndicators.reason : null,
        },
      };

      // Add referral data if available
      if (referralData) {
        commissionData.referral = {
          referralClickId: order.affiliateDetails.referralClickId,
          source: referralData.referralSource,
          device: referralData.device,
          utmCampaign: referralData.utmCampaign,
          utmMedium: referralData.utmMedium,
          utmSource: referralData.utmSource,
        };
      }

      // Create the commission record
      const commission = await Commission.create(commissionData);

      // Update affiliate balance (if not flagged)
      if (!fraudIndicators.flagged) {
        await Affiliate.updateOne(
          { _id: affiliateId },
          { $inc: { 'earnings.pendingEarnings': commissionAmount } }
        );

        console.log(
          `✅ Commission Created - Affiliate: ${affiliateCode}, Order: ${order.orderNumber}, Amount: $${commissionAmount}`
        );
      } else {
        console.warn(
          `⚠️  Commission Flagged - Affiliate: ${affiliateCode}, Risk: ${fraudIndicators.riskLevel}`
        );
      }

      return commission;
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to create commission: ${error.message}`);
    }
  }

  /**
   * Get commissions for an affiliate
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Query options
   * @returns {Promise<Object>} Paginated commissions
   */
  async getAffiliateCommissions(affiliateId, options = {}) {
    try {
      if (!affiliateId) {
        throw new ValidationError('Affiliate ID is required');
      }

      return await Commission.getAffiliateCommissions(affiliateId, options);
    } catch (error) {
      throw new ServerError(`Failed to get affiliate commissions: ${error.message}`);
    }
  }

  /**
   * Get commission statistics for an affiliate
   *
   * @param {string} affiliateId - Affiliate ID
   * @param {Object} options - Statistics options
   * @returns {Promise<Object>} Commission statistics
   */
  async getAffiliateCommissionStats(affiliateId, options = {}) {
    try {
      if (!affiliateId) {
        throw new ValidationError('Affiliate ID is required');
      }

      return await Commission.getAffiliateStats(affiliateId, options);
    } catch (error) {
      throw new ServerError(`Failed to get commission statistics: ${error.message}`);
    }
  }

  /**
   * Approve a pending commission (admin function)
   *
   * Transitions commission from pending to approved
   * Can now be paid out
   *
   * @param {string} commissionId - Commission ID
   * @param {string} approvedBy - Admin user ID
   * @param {string} notes - Approval notes
   * @returns {Promise<Object>} Updated commission
   */
  async approveCommission(commissionId, approvedBy, notes = '') {
    try {
      if (!commissionId) {
        throw new ValidationError('Commission ID is required');
      }

      const commission = await Commission.findById(commissionId);

      if (!commission) {
        throw new NotFoundError(`Commission ${commissionId} not found`);
      }

      if (commission.status !== 'pending') {
        throw new ValidationError(
          `Cannot approve commission with status ${commission.status}`
        );
      }

      // Approve the commission
      await commission.approve(approvedBy, notes);

      // Update affiliate balance
      await Affiliate.updateOne(
        { _id: commission.affiliateId },
        {
          $inc: {
            'earnings.pendingEarnings': -commission.calculation.amount,
            'earnings.approvedEarnings': commission.calculation.amount,
          },
        }
      );

      console.log(
        `✅ Commission Approved - ID: ${commissionId}, Amount: $${commission.calculation.amount}`
      );

      return commission;
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to approve commission: ${error.message}`);
    }
  }

  /**
   * Mark a commission as paid (admin function)
   *
   * Transitions commission from approved to paid
   * Records payment information
   *
   * @param {string} commissionId - Commission ID
   * @param {Object} paymentDetails - Payment information
   *   - method: Payment method
   *   - transactionId: Payment reference
   *   - receiptId: Receipt number (optional)
   * @returns {Promise<Object>} Updated commission
   */
  async markCommissionAsPaid(commissionId, paymentDetails) {
    try {
      if (!commissionId) {
        throw new ValidationError('Commission ID is required');
      }

      if (!paymentDetails || !paymentDetails.method || !paymentDetails.transactionId) {
        throw new ValidationError('Payment method and transaction ID are required');
      }

      const commission = await Commission.findById(commissionId);

      if (!commission) {
        throw new NotFoundError(`Commission ${commissionId} not found`);
      }

      if (commission.status !== 'approved') {
        throw new ValidationError(
          `Cannot mark as paid - current status is ${commission.status}`
        );
      }

      // Mark as paid
      await commission.markAsPaid(paymentDetails);

      // Update affiliate balance
      await Affiliate.updateOne(
        { _id: commission.affiliateId },
        {
          $inc: {
            'earnings.approvedEarnings': -commission.calculation.amount,
            'earnings.paidEarnings': commission.calculation.amount,
          },
        }
      );

      console.log(
        `💰 Commission Paid - ID: ${commissionId}, Amount: $${commission.calculation.amount}, Method: ${paymentDetails.method}`
      );

      return commission;
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to mark commission as paid: ${error.message}`);
    }
  }

  /**
   * Reverse a commission (for refunds, chargebacks, etc.)
   *
   * @param {string} commissionId - Commission ID
   * @param {Object} reversalInfo - Reversal information
   *   - reason: Reversal reason
   *   - details: Additional details
   *   - amount: Amount being reversed (default: full)
   * @returns {Promise<Object>} Updated commission
   */
  async reverseCommission(commissionId, reversalInfo) {
    try {
      if (!commissionId) {
        throw new ValidationError('Commission ID is required');
      }

      if (!reversalInfo || !reversalInfo.reason) {
        throw new ValidationError('Reversal reason is required');
      }

      const commission = await Commission.findById(commissionId);

      if (!commission) {
        throw new NotFoundError(`Commission ${commissionId} not found`);
      }

      // Can only reverse if not already reversed
      if (commission.status === 'reversed') {
        throw new ValidationError('Commission is already reversed');
      }

      const previousStatus = commission.status;
      const reversalAmount = reversalInfo.amount || commission.calculation.amount;

      // Reverse the commission
      await commission.reverse(reversalInfo);

      // Update affiliate balance based on previous status
      const updateOps = {};
      if (previousStatus === 'pending') {
        updateOps['$inc'] = { 'earnings.pendingEarnings': -reversalAmount };
      } else if (previousStatus === 'approved') {
        updateOps['$inc'] = { 'earnings.approvedEarnings': -reversalAmount };
      } else if (previousStatus === 'paid') {
        updateOps['$inc'] = { 'earnings.paidEarnings': -reversalAmount };
      }

      if (Object.keys(updateOps).length > 0) {
        await Affiliate.updateOne({ _id: commission.affiliateId }, updateOps);
      }

      console.log(
        `↩️  Commission Reversed - ID: ${commissionId}, Reason: ${reversalInfo.reason}, Amount: $${reversalAmount}`
      );

      return commission;
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to reverse commission: ${error.message}`);
    }
  }

  /**
   * Get pending commissions for admin approval
   *
   * @param {Object} options - Filter options
   * @returns {Promise<Object>} Pending commissions
   */
  async getPendingCommissions(options = {}) {
    try {
      return await Commission.getPendingCommissions(options);
    } catch (error) {
      throw new ServerError(`Failed to get pending commissions: ${error.message}`);
    }
  }

  /**
   * Get commissions ready for batch payout
   *
   * @param {number} limit - Max commissions to retrieve
   * @returns {Promise<Array>} Ready-to-pay commissions
   */
  async getReadyForPayout(limit = 100) {
    try {
      return await Commission.getReadyForPayout(limit);
    } catch (error) {
      throw new ServerError(`Failed to get payouts: ${error.message}`);
    }
  }

  /**
   * Get system-wide commission statistics
   *
   * @param {Object} options - Statistics options
   * @returns {Promise<Object>} System statistics
   */
  async getSystemStatistics(options = {}) {
    try {
      return await Commission.getSystemStats(options);
    } catch (error) {
      throw new ServerError(`Failed to get system statistics: ${error.message}`);
    }
  }

  /**
   * Get a specific commission record
   *
   * @param {string} commissionId - Commission ID
   * @returns {Promise<Object>} Commission record
   */
  async getCommission(commissionId) {
    try {
      if (!commissionId) {
        throw new ValidationError('Commission ID is required');
      }

      const commission = await Commission.findById(commissionId)
        .populate('affiliateId', 'email firstName lastName')
        .populate('orderId', 'orderNumber total paymentStatus');

      if (!commission) {
        throw new NotFoundError(`Commission ${commissionId} not found`);
      }

      return commission;
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }
      throw new ServerError(`Failed to get commission: ${error.message}`);
    }
  }

  /**
   * Batch approve pending commissions
   *
   * Admin function to approve multiple pending commissions
   *
   * @param {Array} commissionIds - Array of commission IDs
   * @param {string} approvedBy - Admin user ID
   * @param {string} notes - Approval notes
   * @returns {Promise<Object>} { approved, failed, total }
   */
  async batchApproveCommissions(commissionIds, approvedBy, notes = '') {
    try {
      if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
        throw new ValidationError('Commission IDs are required');
      }

      const results = {
        approved: [],
        failed: [],
        total: commissionIds.length,
      };

      for (const commissionId of commissionIds) {
        try {
          const approved = await this.approveCommission(commissionId, approvedBy, notes);
          results.approved.push(approved._id);
        } catch (error) {
          results.failed.push({
            commissionId,
            error: error.message,
          });
        }
      }

      console.log(`✅ Batch Approved: ${results.approved.length}/${results.total}`);

      return results;
    } catch (error) {
      throw new ServerError(`Batch approval failed: ${error.message}`);
    }
  }

  /**
   * Batch mark commissions as paid
   *
   * Admin function for batch payout processing
   *
   * @param {Array} commissionIds - Array of commission IDs
   * @param {Object} paymentInfo - Payment information
   *   - method: Payment method
   *   - transactionIdPrefix: Prefix for transaction IDs
   * @returns {Promise<Object>} { paid, failed, total }
   */
  async batchMarkAsPaid(commissionIds, paymentInfo) {
    try {
      if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
        throw new ValidationError('Commission IDs are required');
      }

      if (!paymentInfo || !paymentInfo.method) {
        throw new ValidationError('Payment method is required');
      }

      const results = {
        paid: [],
        failed: [],
        total: commissionIds.length,
        totalAmount: 0,
      };

      for (let i = 0; i < commissionIds.length; i++) {
        try {
          const commissionId = commissionIds[i];
          const paymentDetails = {
            method: paymentInfo.method,
            transactionId: `${paymentInfo.transactionIdPrefix}-${i + 1}`,
          };

          const paid = await this.markCommissionAsPaid(commissionId, paymentDetails);
          results.paid.push(paid._id);
          results.totalAmount += paid.calculation.amount;
        } catch (error) {
          results.failed.push({
            commissionId: commissionIds[i],
            error: error.message,
          });
        }
      }

      console.log(`💰 Batch Paid: ${results.paid.length}/${results.total}, Total: $${results.totalAmount}`);

      return results;
    } catch (error) {
      throw new ServerError(`Batch payout failed: ${error.message}`);
    }
  }
}

// Export singleton instance
module.exports = new CommissionService();
