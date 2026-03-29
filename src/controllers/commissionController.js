/**
 * Commission Controller
 * HTTP request handlers for commission operations
 */

const commissionService = require('../services/commissionService');
const { ValidationError } = require('../utils/errors');

class CommissionController {
  /**
   * GET /api/affiliate/commissions
   *
   * Get commission records for authenticated affiliate
   * Requires affiliate authentication
   * Admins can pass affiliateId query param to view specific affiliate's commissions
   *
   * Query Parameters:
   *   page - Page number (default: 1)
   *   limit - Items per page (default: 20, max: 100)
   *   status - Filter by status (pending, approved, paid, reversed)
   *   dateFrom - Start date (ISO format, optional)
   *   dateTo - End date (ISO format, optional)
   *   affiliateId - Optional: affiliate ID (admin only)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAffiliateCommissions(req, res, next) {
    try {
      const userId = req.user._id;
      const Affiliate = require('../models/Affiliate');

      if (!userId) {
        return next(new ValidationError('User context not found'));
      }

      let affiliate;
      
      // If affiliateId query param provided, user must be admin
      if (req.query.affiliateId) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Only admins can view other affiliates\' commissions',
          });
        }
        // Get the specific affiliate by ID
        affiliate = await Affiliate.findById(req.query.affiliateId);
      } else {
        // Get the affiliate for this user
        affiliate = await Affiliate.findOne({ userId });
      }

      if (!affiliate) {
        return next(new ValidationError('Affiliate account not found'));
      }

      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 20, 100),
        status: req.query.status,
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      const result = await commissionService.getAffiliateCommissions(affiliate._id, options);

      return res.status(200).json({
        success: true,
        message: 'Commission records retrieved successfully',
        data: {
          commissions: result.commissions,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/affiliate/commissions/stats
   *
   * Get commission statistics for authenticated affiliate
   * Requires affiliate authentication
   * Admins can pass affiliateId query param to view specific affiliate's stats
   *
   * Query Parameters:
   *   dateFrom - Start date (ISO format, optional)
   *   dateTo - End date (ISO format, optional)
   *   affiliateId - Optional: affiliate ID (admin only)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAffiliateCommissionStats(req, res, next) {
    try {
      const userId = req.user._id;
      const Affiliate = require('../models/Affiliate');

      if (!userId) {
        return next(new ValidationError('User context not found'));
      }

      let affiliate;
      
      // If affiliateId query param provided, user must be admin
      if (req.query.affiliateId) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Only admins can view other affiliates\' commission stats',
          });
        }
        // Get the specific affiliate by ID
        affiliate = await Affiliate.findById(req.query.affiliateId);
      } else {
        // Get the affiliate for this user
        affiliate = await Affiliate.findOne({ userId });
      }

      if (!affiliate) {
        return next(new ValidationError('Affiliate account not found'));
      }

      const options = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      const stats = await commissionService.getAffiliateCommissionStats(affiliate._id, options);

      return res.status(200).json({
        success: true,
        message: 'Commission statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/commissions
   *
   * Get all commission records (admin only)
   * Requires admin authentication
   *
   * Query Parameters:
   *   page - Page number (default: 1)
   *   limit - Items per page (default: 20, max: 100)
   *   status - Filter by status
   *   fraudOnly - Show only flagged commissions (true/false)
   *   dateFrom - Start date
   *   dateTo - End date
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAllCommissions(req, res, next) {
    try {
      console.log(`📝 [COMMISSION-CTRL] All commissions request - Query:`, JSON.stringify(req.query));
      
      const options = {
        page: parseInt(req.query.page) || 1,
        limit: Math.min(parseInt(req.query.limit) || 20, 100),
        fraudOnly: req.query.fraudOnly === 'true',
      };

      console.log(`📋 [COMMISSION] Fetching commissions - Page:`, options.page, 'Limit:', options.limit, 'FraudOnly:', options.fraudOnly);
      
      const result = await commissionService.getPendingCommissions(options);

      console.log(`✅ [COMMISSION] Retrieved: ${result.commissions.length} commissions, Total: ${result.pagination.totalItems}`);

      return res.status(200).json({
        success: true,
        message: 'All commissions retrieved successfully',
        data: {
          commissions: result.commissions,
          pagination: result.pagination,
        },
      });
    } catch (error) {
      console.error(`❌ [COMMISSION-CTRL] Error:`, error.message);
      next(error);
    }
  }

  /**
   * POST /api/admin/commissions/:commissionId/approve
   *
   * Approve a pending commission (admin only)
   * Requires admin authentication
   *
   * Body Parameters:
   *   notes - Approval notes (optional)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async approveCommission(req, res, next) {
    try {
      const { commissionId } = req.params;
      const adminId = req.user._id;
      const notes = req.body.notes || '';

      if (!commissionId) {
        return next(new ValidationError('Commission ID is required'));
      }

      const commission = await commissionService.approveCommission(
        commissionId,
        adminId,
        notes
      );

      return res.status(200).json({
        success: true,
        message: 'Commission approved successfully',
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/commissions/:commissionId/pay
   *
   * Mark a commission as paid (admin only)
   * Requires admin authentication
   *
   * Body Parameters:
   *   method - Payment method (stripe, paypal, bank_transfer, etc.)
   *   transactionId - Payment transaction reference
   *   receiptId - Receipt number (optional)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async markCommissionAsPaid(req, res, next) {
    try {
      const { commissionId } = req.params;
      const { method, transactionId, receiptId } = req.body;

      if (!commissionId) {
        return next(new ValidationError('Commission ID is required'));
      }

      if (!method || !transactionId) {
        return next(new ValidationError('Payment method and transaction ID are required'));
      }

      const paymentDetails = {
        method,
        transactionId,
        ...(receiptId && { receiptId }),
      };

      const commission = await commissionService.markCommissionAsPaid(
        commissionId,
        paymentDetails
      );

      return res.status(200).json({
        success: true,
        message: 'Commission marked as paid successfully',
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/commissions/:commissionId/reverse
   *
   * Reverse a commission (admin only)
   * Requires admin authentication
   *
   * Body Parameters:
   *   reason - Reversal reason (required)
   *   details - Additional details (optional)
   *   amount - Amount being reversed (optional, default: full)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async reverseCommission(req, res, next) {
    try {
      const { commissionId } = req.params;
      const { reason, details, amount } = req.body;

      if (!commissionId) {
        return next(new ValidationError('Commission ID is required'));
      }

      if (!reason) {
        return next(new ValidationError('Reversal reason is required'));
      }

      const reversalInfo = {
        reason,
        ...(details && { details }),
        ...(amount && { amount: parseFloat(amount) }),
      };

      const commission = await commissionService.reverseCommission(commissionId, reversalInfo);

      return res.status(200).json({
        success: true,
        message: 'Commission reversed successfully',
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/commissions/stats
   *
   * Get system-wide commission statistics (admin only)
   *
   * Query Parameters:
   *   dateFrom - Start date (ISO format, optional)
   *   dateTo - End date (ISO format, optional)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getSystemStatistics(req, res, next) {
    try {
      const options = {
        dateFrom: req.query.dateFrom,
        dateTo: req.query.dateTo,
      };

      const stats = await commissionService.getSystemStatistics(options);

      return res.status(200).json({
        success: true,
        message: 'System statistics retrieved successfully',
        data: stats,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/commissions/payouts/ready
   *
   * Get commissions ready for batch payout (admin only)
   *
   * Query Parameters:
   *   limit - Max commissions to retrieve (default: 100, max: 500)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getReadyForPayout(req, res, next) {
    try {
      const limit = Math.min(parseInt(req.query.limit) || 100, 500);

      const commissions = await commissionService.getReadyForPayout(limit);

      return res.status(200).json({
        success: true,
        message: 'Commissions ready for payout retrieved successfully',
        data: {
          count: commissions.length,
          commissions,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/commissions/batch-approve
   *
   * Batch approve pending commissions (admin only)
   *
   * Body Parameters:
   *   commissionIds - Array of commission IDs
   *   notes - Approval notes (optional)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async batchApproveCommissions(req, res, next) {
    try {
      const { commissionIds, notes } = req.body;
      const adminId = req.user._id;

      if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
        return next(new ValidationError('Commission IDs array is required'));
      }

      const results = await commissionService.batchApproveCommissions(
        commissionIds,
        adminId,
        notes || ''
      );

      return res.status(200).json({
        success: true,
        message: 'Batch approval completed',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/commissions/batch-pay
   *
   * Batch mark commissions as paid (admin only)
   *
   * Body Parameters:
   *   commissionIds - Array of commission IDs
   *   method - Payment method (required)
   *   transactionIdPrefix - Prefix for transaction IDs (required)
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async batchMarkAsPaid(req, res, next) {
    try {
      const { commissionIds, method, transactionIdPrefix } = req.body;

      if (!Array.isArray(commissionIds) || commissionIds.length === 0) {
        return next(new ValidationError('Commission IDs array is required'));
      }

      if (!method || !transactionIdPrefix) {
        return next(new ValidationError('Payment method and transaction ID prefix are required'));
      }

      const paymentInfo = {
        method,
        transactionIdPrefix,
      };

      const results = await commissionService.batchMarkAsPaid(commissionIds, paymentInfo);

      return res.status(200).json({
        success: true,
        message: 'Batch payout completed',
        data: results,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/commissions/:commissionId
   *
   * Get a specific commission record
   * Authenticated user can only view their own commissions
   *
   * @param {Object} req - Express request
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getCommission(req, res, next) {
    try {
      const { commissionId } = req.params;
      const userId = req.user._id;
      const isAdmin = req.user.role === 'admin';

      if (!commissionId) {
        return next(new ValidationError('Commission ID is required'));
      }

      const commission = await commissionService.getCommission(commissionId);

      // Non-admin users can only view their own commissions
      if (!isAdmin && commission.affiliateId._id.toString() !== userId.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to view this commission',
        });
      }

      return res.status(200).json({
        success: true,
        message: 'Commission retrieved successfully',
        data: commission,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export singleton instance
module.exports = new CommissionController();
