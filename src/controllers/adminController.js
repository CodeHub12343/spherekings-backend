/**
 * ============================================================================
 * ADMIN CONTROLLER - HTTP Request Handlers for Admin Dashboard
 * ============================================================================
 *
 * Handles HTTP requests for admin dashboard operations including:
 * - Dashboard overview
 * - Order, product, affiliate monitoring
 * - Commission and payout oversight
 * - Analytics and reporting
 *
 * All handlers include authorization checks and proper error handling.
 *
 * ============================================================================
 */

const adminService = require('../services/adminService');

/**
 * Admin Controller - HTTP request handlers
 */
class AdminController {
  /**
   * GET /api/admin/dashboard
   * Get dashboard overview with key metrics
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getDashboard(req, res, next) {
    try {
      console.log('📊 [ADMIN] Dashboard request - User:', req.user?.id, 'Role:', req.user?.role);
      const dashboard = await adminService.getDashboardOverview();

      return res.status(200).json({
        success: true,
        message: 'Dashboard data retrieved successfully',
        data: dashboard
      });
    } catch (error) {
      console.error('❌ [ADMIN] Dashboard error:', error.message);
      return next(error);
    }
  }

  /**
   * GET /api/admin/orders
   * Get all orders with filtering, pagination, and sorting
   *
   * Query parameters:
   *   - page (default: 1)
   *   - limit (default: 20, max: 100)
   *   - status (completed|pending|failed)
   *   - affiliateId (optional)
   *   - userId (optional)
   *   - dateFrom (ISO date)
   *   - dateTo (ISO date)
   *   - sortBy (field name)
   *   - order (asc|desc)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getOrders(req, res, next) {
    try {
      const result = await adminService.getOrders(req.query);

      return res.status(200).json({
        success: true,
        message: 'Orders retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/products
   * Get all products with filtering and pagination
   *
   * Query parameters:
   *   - page (default: 1)
   *   - limit (default: 20, max: 100)
   *   - status (active|inactive)
   *   - category (optional)
   *   - search (optional text search)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getProducts(req, res, next) {
    try {
      const result = await adminService.getProducts(req.query);

      return res.status(200).json({
        success: true,
        message: 'Products retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/affiliates
   * Get all affiliates with performance metrics
   *
   * Query parameters:
   *   - page (default: 1)
   *   - limit (default: 20, max: 100)
   *   - status (active|inactive)
   *   - search (optional affiliate name/email)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getAffiliates(req, res, next) {
    try {
      const result = await adminService.getAffiliates(req.query);

      return res.status(200).json({
        success: true,
        message: 'Affiliates retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/affiliates/:affiliateId
   * Get specific affiliate performance details
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getAffiliateDetails(req, res, next) {
    try {
      const { affiliateId } = req.params;
      const result = await adminService.getAffiliatePerformanceDetails(affiliateId);

      return res.status(200).json({
        success: true,
        message: 'Affiliate details retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/commissions
   * Get all commissions with filtering
   *
   * Query parameters:
   *   - page (default: 1)
   *   - limit (default: 20, max: 100)
   *   - status (pending|approved|paid|reversed)
   *   - affiliateId (optional)
   *   - dateFrom (ISO date)
   *   - dateTo (ISO date)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getCommissions(req, res, next) {
    try {
      console.log(`📝 [ADMIN-CTRL] Commissions request - Query:`, JSON.stringify(req.query));
      const result = await adminService.getCommissions(req.query);
      console.log(`📝 [ADMIN-CTRL] Commissions response - Success:`, result.success, 'Data count:', result.data?.length || 0);

      return res.status(200).json({
        success: true,
        message: 'Commission records retrieved successfully',
        data: {
          commissions: result.data,
          pagination: result.pagination
        }
      });
    } catch (error) {
      console.error(`❌ [ADMIN-CTRL] Commissions error:`, error.message);
      return next(error);
    }
  }

  /**
   * GET /api/admin/commissions/analytics
   * Get commission analytics and metrics
   *
   * Returns: Commission breakdown by status, totals, top affiliates
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getCommissionAnalytics(req, res, next) {
    try {
      console.log(`📊 [ADMIN-CTRL] Commission Analytics request`);
      const result = await adminService.getCommissionAnalytics();
      console.log(`📊 [ADMIN-CTRL] Commission Analytics response success`);

      return res.status(200).json({
        success: true,
        message: 'Commission analytics retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error(`❌ [ADMIN-CTRL] Commission Analytics error:`, error.message);
      return next(error);
    }
  }

  /**
   * GET /api/admin/payouts
   * Get all payouts with filtering
   *
   * Query parameters:
   *   - page (default: 1)
   *   - limit (default: 20, max: 100)
   *   - status (pending|approved|processing|completed|failed|cancelled)
   *   - affiliateId (optional)
   *   - dateFrom (ISO date)
   *   - dateTo (ISO date)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getPayouts(req, res, next) {
    try {
      const result = await adminService.getPayouts(req.query);

      return res.status(200).json({
        success: true,
        message: 'Payouts retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/payouts/analytics
   * Get payout analytics and metrics
   *
   * Returns: Payout breakdown by status, pending amount, completion stats
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getPayoutAnalytics(req, res, next) {
    try {
      const result = await adminService.getPayoutAnalytics();

      return res.status(200).json({
        success: true,
        message: 'Payout analytics retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/revenue
   * Get revenue analytics over time
   *
   * Query parameters:
   *   - groupBy (day|week|month, default: day)
   *   - dateFrom (ISO date)
   *   - dateTo (ISO date)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getRevenueAnalytics(req, res, next) {
    try {
      const result = await adminService.getRevenueAnalytics(req.query);

      return res.status(200).json({
        success: true,
        message: 'Revenue analytics retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }

  /**
   * GET /api/admin/affiliates/top
   * Get top performing affiliates
   *
   * Query parameters:
   *   - limit (default: 10, max: 50)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getTopAffiliates(req, res, next) {
    try {
      console.log('📊 [ADMIN] Top Affiliates request - Limit:', req.query.limit);
      const result = await adminService.getTopAffiliates(req.query);

      return res.status(200).json({
        success: true,
        message: 'Top affiliates retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('❌ [ADMIN] Top Affiliates error:', error.message);
      return next(error);
    }
  }

  /**
   * GET /api/admin/products/top
   * Get top selling products
   *
   * Query parameters:
   *   - limit (default: 10, max: 50)
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getTopProducts(req, res, next) {
    try {
      console.log('📊 [ADMIN] Top Products request - Limit:', req.query.limit);
      const result = await adminService.getTopProducts(req.query);

      return res.status(200).json({
        success: true,
        message: 'Top products retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('❌ [ADMIN] Top Products error:', error.message);
      return next(error);
    }
  }

  /**
   * GET /api/admin/orders/analytics
   * Get order analytics
   *
   * Returns: Order breakdown by status, payment method, affiliate source
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getOrderAnalytics(req, res, next) {
    try {
      console.log('📊 [ADMIN] Order Analytics request');
      const result = await adminService.getOrderAnalytics();

      return res.status(200).json({
        success: true,
        message: 'Order analytics retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('❌ [ADMIN] Order Analytics error:', error.message);
      return next(error);
    }
  }

  /**
   * GET /api/admin/system
   * Get system health and analytics
   *
   * Returns: Recent activity, failed payouts, pending commissions
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getSystemAnalytics(req, res, next) {
    try {
      console.log('📊 [ADMIN] System Analytics request');
      const result = await adminService.getSystemAnalytics();

      return res.status(200).json({
        success: true,
        message: 'System analytics retrieved successfully',
        ...result
      });
    } catch (error) {
      console.error('❌ [ADMIN] System Analytics error:', error.message);
      return next(error);
    }
  }

  /**
   * GET /api/admin/reconciliation
   * Get financial reconciliation report
   *
   * Returns: Comparison of revenue, commissions, and payouts
   *
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware
   */
  async getFinancialReconciliation(req, res, next) {
    try {
      const result = await adminService.getFinancialReconciliation();

      return res.status(200).json({
        success: true,
        message: 'Financial reconciliation retrieved successfully',
        ...result
      });
    } catch (error) {
      return next(error);
    }
  }
}

// Export controller instance
module.exports = new AdminController();
