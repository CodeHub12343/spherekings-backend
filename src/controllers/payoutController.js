/**
 * Payout Controller
 * HTTP request handlers for affiliate payout operations
 */

const payoutService = require('../services/payoutService');
const { ValidationError, NotFoundError } = require('../utils/errors');

class PayoutController {
  /**
   * POST /api/payouts/request
   *
   * Affiliate submits payout request
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated affiliate ID
   * @param {string} req.body.amount - Payout amount
   * @param {string} req.body.method - Payment method
   * @param {object} req.body.beneficiary - Payment beneficiary
   * @param {string} req.body.notes - Affiliate notes
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async requestPayout(req, res, next) {
    try {
      const { amount, method, beneficiary, notes } = req.body;
      let affiliateId = req.user._id.toString();
      
      // If user is a customer, look up their affiliate account
      if (req.user.role === 'customer') {
        const Affiliate = require('../models/Affiliate');
        const affiliate = await Affiliate.findOne({ userId: req.user._id });
        
        if (!affiliate) {
          return res.status(404).json({
            success: false,
            message: 'Affiliate account not found for this user'
          });
        }
        affiliateId = affiliate._id.toString();
      }

      // Create payout request
      const payout = await payoutService.requestPayout(
        affiliateId,
        amount,
        method,
        beneficiary,
        notes
      );

      return res.status(201).json({
        success: true,
        message: 'Payout request submitted successfully',
        data: {
          _id: payout._id,
          amount: payout.amount,
          method: payout.method,
          status: payout.status,
          requestedAt: payout.request.submittedAt,
          createdAt: payout.createdAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payouts
   *
   * Get payout history for authenticated affiliate
   * Admins can pass affiliateId query param to view specific affiliate's payouts
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {number} req.query.page - Page number (default: 1)
   * @param {number} req.query.limit - Items per page (default: 20, max: 100)
   * @param {string} req.query.status - Filter by status (optional)
   * @param {string} req.query.dateFrom - Start date (optional)
   * @param {string} req.query.dateTo - End date (optional)
   * @param {string} req.query.affiliateId - Optional: affiliate ID (admin only)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAffiliatePayouts(req, res, next) {
    try {
      let affiliateId = req.user._id.toString();
      
      // If user is a customer, look up their affiliate account
      if (req.user.role === 'customer' && !req.query.affiliateId) {
        const Affiliate = require('../models/Affiliate');
        const affiliate = await Affiliate.findOne({ userId: req.user._id });
        
        if (affiliate) {
          affiliateId = affiliate._id.toString();
        } else {
          // Customer has no affiliate account
          return res.status(200).json({
            success: true,
            data: {
              payouts: [],
              pagination: { page: 1, limit: 20, total: 0, pages: 0 }
            }
          });
        }
      }
      
      // If affiliateId query param provided, user must be admin
      if (req.query.affiliateId) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Only admins can view other affiliates\' payouts',
          });
        }
        affiliateId = req.query.affiliateId;
      }
      
      const { page, limit, status, dateFrom, dateTo } = req.query;

      const options = {
        page: parseInt(page) || 1,
        limit: Math.min(parseInt(limit) || 20, 100),
        status: status || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      };

      const result = await payoutService.getAffiliatePayouts(affiliateId, options);

      return res.status(200).json({
        success: true,
        data: {
          payouts: result.payouts,
          pagination: result.pagination
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payouts/stats
   *
   * Get payout statistics for authenticated affiliate
   * Admins can pass affiliateId query param to view specific affiliate's stats
   *
   * @param {Object} req - Express request
   * @param {string} req.user._id - Authenticated user ID
   * @param {string} req.query.affiliateId - Optional: affiliate ID (admin only)
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAffiliatePayoutStats(req, res, next) {
    try {
      let affiliateId = req.user._id.toString();
      
      // If user is a customer, look up their affiliate account
      if (req.user.role === 'customer' && !req.query.affiliateId) {
        const Affiliate = require('../models/Affiliate');
        const affiliate = await Affiliate.findOne({ userId: req.user._id });
        
        if (affiliate) {
          affiliateId = affiliate._id.toString();
        } else {
          // Customer has no affiliate account - return empty stats
          return res.status(200).json({
            success: true,
            data: {
              totalPayouts: 0,
              pendingCount: 0,
              approvedCount: 0,
              processingCount: 0,
              completedCount: 0,
              cancelledCount: 0,
              failedCount: 0,
              totalPaidOut: 0,
              totalPending: 0,
              averagePayout: 0
            }
          });
        }
      }
      
      // If affiliateId query param provided, user must be admin
      if (req.query.affiliateId) {
        if (req.user.role !== 'admin') {
          return res.status(403).json({
            success: false,
            message: 'Only admins can view other affiliates\' payout stats',
          });
        }
        affiliateId = req.query.affiliateId;
      }

      const stats = await payoutService.getAffiliatePayoutStats(affiliateId);

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/payouts/:payoutId
   *
   * Get specific payout details
   *
   * Access control:
   * - Affiliate can view own payouts only
   * - Admins can view any payout
   *
   * @param {Object} req - Express request
   * @param {string} req.params.payoutId - Payout ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getPayout(req, res, next) {
    try {
      const { payoutId } = req.params;
      const userId = req.user._id.toString();
      const isAdmin = req.user.role === 'admin';

      // Find payout
      const Payout = require('../models/Payout');
      const payout = await Payout.findById(payoutId)
        .populate('affiliateId', 'email name');

      if (!payout) {
        return res.status(404).json({
          success: false,
          error: 'Payout not found'
        });
      }

      // Check authorization
      // If not admin, must be the affiliate who owns this payout
      // For customers, look up their affiliate account
      let isAuthorized = false;
      
      if (isAdmin) {
        isAuthorized = true;
      } else {
        // Check if payout affiliate matches the user's affiliate
        if (payout.affiliateId._id.toString() === userId) {
          // Direct match (User is an Affiliate directly)
          isAuthorized = true;
        } else {
          // User is a Customer - look up their affiliate account
          const Affiliate = require('../models/Affiliate');
          const userAffiliate = await Affiliate.findOne({ userId });
          
          if (userAffiliate && userAffiliate._id.toString() === payout.affiliateId._id.toString()) {
            isAuthorized = true;
          }
        }
      }

      if (!isAuthorized) {
        return res.status(403).json({
          success: false,
          error: 'You do not have permission to view this payout'
        });
      }

      return res.status(200).json({
        success: true,
        data: payout
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * ==================== ADMIN ENDPOINTS ====================
   */

  /**
   * GET /api/admin/payouts
   *
   * Get all payouts in system (admin only)
   *
   * @param {Object} req - Express request
   * @param {number} req.query.page - Page number
   * @param {number} req.query.limit - Items per page
   * @param {string} req.query.status - Filter by status
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getAllPayouts(req, res, next) {
    try {
      const { page = 1, limit = 20, status } = req.query;
      const Payout = require('../models/Payout');

      const query = {};
      if (status) {
        query.status = status;
      }

      const skip = (parseInt(page) - 1) * Math.min(parseInt(limit), 100);
      const payouts = await Payout.find(query)
        .populate('affiliateId', 'email name')
        .populate('approval.approvedBy', 'email name')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Math.min(parseInt(limit), 100));

      const total = await Payout.countDocuments(query);

      return res.status(200).json({
        success: true,
        message: 'Payouts retrieved successfully',
        data: {
          payouts,
          pagination: {
            page: parseInt(page),
            limit: Math.min(parseInt(limit), 100),
            total,
            pages: Math.ceil(total / Math.min(parseInt(limit), 100))
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/payouts/:payoutId/approve
   *
   * Approve payout request (admin only)
   *
   * @param {Object} req - Express request
   * @param {string} req.params.payoutId - Payout ID
   * @param {string} req.body.notes - Approval notes
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async approvePayout(req, res, next) {
    try {
      const { payoutId } = req.params;
      const { notes } = req.body;
      const adminId = req.user._id.toString();

      const payout = await payoutService.approvePayout(payoutId, adminId, notes);

      return res.status(200).json({
        success: true,
        message: 'Payout approved successfully',
        payout: {
          _id: payout._id,
          status: payout.status,
          approvedAt: payout.approval.approvedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/payouts/:payoutId/process
   *
   * Mark payout as paid (manual payment by admin)
   * Admin provides receipt ID as proof of payment
   *
   * @param {Object} req - Express request
   * @param {string} req.params.payoutId - Payout ID
   * @param {string} req.body.receiptId - Receipt/proof of manual payment
   * @param {string} req.body.transactionId - Optional transaction ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async processPayout(req, res, next) {
    try {
      const { payoutId } = req.params;
      const { receiptId, transactionId } = req.body;

      const payout = await payoutService.markPayoutAsPaid(payoutId, receiptId, transactionId);

      return res.status(200).json({
        success: true,
        message: 'Payout marked as paid successfully',
        payout: {
          _id: payout._id,
          status: payout.status,
          receiptId: payout.payment?.receiptId,
          transactionId: payout.payment?.transactionId,
          paidAt: payout.payment?.paidAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/payouts/:payoutId/reject
   *
   * Reject/cancel payout (admin only)
   *
   * @param {Object} req - Express request
   * @param {string} req.params.payoutId - Payout ID
   * @param {string} req.body.reason - Rejection reason
   * @param {string} req.body.details - Additional details
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async rejectPayout(req, res, next) {
    try {
      const { payoutId } = req.params;
      const { reason, details } = req.body;
      const adminId = req.user._id.toString();

      const payout = await payoutService.rejectPayout(payoutId, adminId, reason, details);

      return res.status(200).json({
        success: true,
        message: 'Payout cancelled successfully',
        payout: {
          _id: payout._id,
          status: payout.status,
          rejectedAt: payout.rejection?.rejectedAt
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/payouts/pending
   *
   * Get pending payouts awaiting approval (admin queue)
   *
   * @param {Object} req - Express request
   * @param {number} req.query.limit - Max results
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getPendingPayouts(req, res, next) {
    try {
      const { limit = 100 } = req.query;

      const payouts = await payoutService.getPendingPayouts({
        limit: Math.min(parseInt(limit), 500)
      });

      return res.status(200).json({
        success: true,
        data: payouts,
        count: payouts.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/payouts/ready
   *
   * Get payouts approved and ready for processing
   *
   * @param {Object} req - Express request
   * @param {number} req.query.limit - Max results
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getReadyForProcessing(req, res, next) {
    try {
      const { limit = 100 } = req.query;

      const payouts = await payoutService.getReadyForProcessing({
        limit: Math.min(parseInt(limit), 500)
      });

      return res.status(200).json({
        success: true,
        data: payouts,
        count: payouts.length
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/admin/payouts/stats
   *
   * Get system-wide payout statistics
   *
   * @param {Object} req - Express request
   * @param {string} req.query.dateFrom - Start date
   * @param {string} req.query.dateTo - End date
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async getSystemStats(req, res, next) {
    try {
      const { dateFrom, dateTo } = req.query;

      const stats = await payoutService.getSystemStats({
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined
      });

      return res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/payouts/batch-approve
   *
   * Approve multiple payouts at once
   *
   * @param {Object} req - Express request
   * @param {array} req.body.payoutIds - Payout IDs to approve
   * @param {string} req.body.notes - Approval notes
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async batchApprovePayout(req, res, next) {
    try {
      const { payoutIds, notes } = req.body;
      const adminId = req.user._id.toString();

      const result = await payoutService.batchApprovePayout(payoutIds, adminId, notes);

      return res.status(200).json({
        success: true,
        message: 'Batch approval completed',
        approved: result.approved,
        failed: result.failed,
        total: result.total
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/admin/payouts/batch-process
   *
   * Process multiple approved payouts
   *
   * @param {Object} req - Express request
   * @param {array} req.body.payoutIds - Payout IDs to process
   * @param {string} req.body.stripeConnectId - Optional Stripe Connect ID
   * @param {Object} res - Express response
   * @param {Function} next - Express next middleware
   * @returns {Promise<void>}
   */
  async batchProcessPayout(req, res, next) {
    try {
      const { payoutIds, stripeConnectId } = req.body;

      const result = await payoutService.batchProcessPayout(payoutIds, stripeConnectId);

      return res.status(200).json({
        success: true,
        message: 'Batch processing completed',
        processed: result.processed,
        failed: result.failed,
        total: result.total,
        totalAmount: result.totalAmount
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PayoutController();
