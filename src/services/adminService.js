/**
 * ============================================================================
 * ADMIN SERVICE - Business Logic for Administrative Operations
 * ============================================================================
 *
 * Implements core business logic for admin dashboard operations including:
 * - Dashboard analytics aggregation
 * - Order monitoring and management
 * - Product monitoring
 * - Affiliate performance tracking
 * - Commission and payout oversight
 *
 * Uses MongoDB aggregation pipelines for efficient data querying.
 *
 * ============================================================================
 */

const Order = require('../models/Order');
const Product = require('../models/Product');
const Commission = require('../models/Commission');
const Payout = require('../models/Payout');
const User = require('../models/User');
const Affiliate = require('../models/Affiliate');
const {
  getDashboardOverviewPipeline,
  getRevenueAnalyticsPipeline,
  getTopAffiliatesPipeline,
  getTopProductsPipeline,
  getCommissionAnalyticsPipeline,
  getPayoutAnalyticsPipeline,
  getOrderAnalyticsPipeline,
  getAffiliatePerformanceDetailsPipeline,
  getUserGrowthAnalyticsPipeline,
  getSystemHealthMetricsPipeline,
  getFinancialReconciliationPipeline
} = require('../utils/adminAnalytics');

/**
 * Custom error classes
 */
class ValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ValidationError';
  }
}

class NotFoundError extends Error {
  constructor(message) {
    super(message);
    this.name = 'NotFoundError';
  }
}

class ServerError extends Error {
  constructor(message) {
    super(message);
    this.name = 'ServerError';
  }
}

/**
 * AdminService: Centralized service for admin operations
 */
class AdminService {
  /**
   * Get dashboard overview with key metrics
   * @returns {Promise<Object>} Dashboard statistics
   */
  async getDashboardOverview() {
    try {
      const [
        totalRevenue,
        totalOrders,
        completedOrders,
        pendingOrders,
        failedOrders,
        totalProducts,
        activeProducts,
        totalAffiliates,
        activeAffiliates,
        commissionStats,
        payoutStats
      ] = await Promise.all([
        this._getTotalRevenue(),
        Order.countDocuments(),
        Order.countDocuments({ orderStatus: 'delivered' }),
        Order.countDocuments({ orderStatus: 'processing' }),
        Order.countDocuments({ paymentStatus: 'failed' }),
        Product.countDocuments(),
        Product.countDocuments({ status: 'active' }),
        Affiliate.countDocuments(),
        Affiliate.countDocuments({ status: 'active' }),
        this._getCommissionStats(),
        this._getPayoutStats()
      ]);

      const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

      return {
        revenue: {
          total: totalRevenue,
          averageOrderValue: averageOrderValue
        },
        orders: {
          total: totalOrders,
          completed: completedOrders,
          pending: pendingOrders,
          failed: failedOrders
        },
        products: {
          total: totalProducts,
          active: activeProducts
        },
        affiliates: {
          total: totalAffiliates,
          active: activeAffiliates
        },
        commissions: commissionStats,
        payouts: payoutStats,
        timestamp: new Date()
      };
    } catch (error) {
      throw new ServerError(`Failed to get dashboard overview: ${error.message}`);
    }
  }

  /**
   * Get all orders with filtering, pagination, and sorting
   * @param {Object} query - Query parameters (page, limit, status, sortBy, order)
   * @returns {Promise<Object>} Paginated orders with metadata
   */
  async getOrders(query = {}) {
    try {
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (query.status) filter.orderStatus = query.status;
      if (query.paymentStatus) filter.paymentStatus = query.paymentStatus;
      if (query.affiliateId) filter['affiliateDetails.affiliateId'] = query.affiliateId;
      if (query.userId) filter.userId = query.userId;

      // Date range filter
      if (query.dateFrom || query.dateTo) {
        filter.createdAt = {};
        if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
        if (query.dateTo) {
          const dateTo = new Date(query.dateTo);
          dateTo.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = dateTo;
        }
      }

      console.log('📋 [ADMIN-SERVICE] Getting orders with filter:', filter);

      // Get total count
      const total = await Order.countDocuments(filter);
      console.log('✅ [ADMIN-SERVICE] Total matching orders:', total);

      // Build sort
      const sort = {};
      if (query.sortBy) {
        sort[query.sortBy] = query.order === 'asc' ? 1 : -1;
      } else {
        sort.createdAt = -1; // Default: newest first
      }

      // Fetch orders
      const orders = await Order.find(filter)
        .sort(sort)
        .skip(skip)
        .limit(limit)
        .lean();

      console.log('📦 [ADMIN-SERVICE] Fetched paginated orders:', {
        page,
        limit,
        skip,
        fetchedCount: orders.length,
        total
      });

      // Calculate statistics for all filtered orders (not just paginated ones)
      const allOrdersForStats = await Order.find(filter).lean();
      
      const statistics = {
        ordersCount: total,
        completedCount: allOrdersForStats.filter(o => o.orderStatus === 'delivered').length,
        processingCount: allOrdersForStats.filter(o => o.orderStatus === 'processing').length,
        pendingCount: allOrdersForStats.filter(o => o.orderStatus === 'pending').length,
        cancelledCount: allOrdersForStats.filter(o => o.orderStatus === 'cancelled').length,
        totalAmount: allOrdersForStats.reduce((sum, o) => sum + (o.total || 0), 0),
        paidAmount: allOrdersForStats.filter(o => o.paymentStatus === 'paid').reduce((sum, o) => sum + (o.total || 0), 0),
        averageOrder: total > 0 ? allOrdersForStats.reduce((sum, o) => sum + (o.total || 0), 0) / total : 0
      };

      console.log('💰 [ADMIN-SERVICE] Calculated statistics:', statistics);

      return {
        success: true,
        data: orders,
        statistics,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      console.error('❌ [ADMIN-SERVICE] Failed to get orders:', {
        message: error.message,
        query
      });
      throw new ServerError(`Failed to get orders: ${error.message}`);
    }
  }

  /**
   * Get all products with filtering and pagination
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} Paginated products
   */
  async getProducts(query = {}) {
    try {
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (query.status) filter.status = query.status;
      if (query.category) filter.category = query.category;
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { description: { $regex: query.search, $options: 'i' } }
        ];
      }

      const total = await Product.countDocuments(filter);

      const products = await Product.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        success: true,
        data: products,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ServerError(`Failed to get products: ${error.message}`);
    }
  }

  /**
   * Get all affiliates with performance metrics
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} Paginated affiliates with earnings
   */
  async getAffiliates(query = {}) {
    try {
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {
        'affiliateDetails.isAffiliate': true
      };
      if (query.status) filter.status = query.status;
      if (query.search) {
        filter.$or = [
          { name: { $regex: query.search, $options: 'i' } },
          { email: { $regex: query.search, $options: 'i' } }
        ];
      }

      const total = await User.countDocuments(filter);

      const affiliates = await User.find(filter)
        .select([
          '_id',
          'name',
          'email',
          'status',
          'affiliateDetails.totalCommissionsEarned',
          'affiliateDetails.totalPayoutsReceived',
          'affiliateDetails.availableBalance',
          'affiliateDetails.createdAt'
        ])
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Fetch commission stats for each affiliate
      const affiliatesWithStats = await Promise.all(
        affiliates.map(async (affiliate) => {
          const stats = await this._getAffiliateCommissionStats(affiliate._id);
          return {
            ...affiliate,
            commissionStats: stats
          };
        })
      );

      return {
        success: true,
        data: affiliatesWithStats,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ServerError(`Failed to get affiliates: ${error.message}`);
    }
  }

  /**
   * Get all commissions with filtering
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} Paginated commissions
   */
  async getCommissions(query = {}) {
    try {
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (query.status) filter.status = query.status;
      if (query.affiliateId) filter.affiliateId = query.affiliateId;

      // Date range filter
      if (query.dateFrom || query.dateTo) {
        filter.createdAt = {};
        if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
        if (query.dateTo) {
          const dateTo = new Date(query.dateTo);
          dateTo.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = dateTo;
        }
      }

      console.log(`📋 [ADMIN] Commissions request - Filter:`, JSON.stringify(filter), 'Page:', page, 'Limit:', limit);

      const total = await Commission.countDocuments(filter);
      console.log(`📊 [ADMIN] Commissions found: ${total}`);

      const commissions = await Commission.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      // Filter out commissions with missing affiliate references
      // and return them with affiliate data if available, or null if not
      const validatedCommissions = commissions.filter(c => {
        // Keep commission even if affiliate is missing (null), just flag it
        return c; // Keep all commissions
      });

      console.log(`✅ [ADMIN] Commissions retrieved: ${validatedCommissions.length} records`, {
        pageInfo: { page, limit, total, pages: Math.ceil(total / limit) },
        sample: validatedCommissions.slice(0, 1).map(c => ({
          _id: c._id,
          status: c.status,
          amount: c.calculation?.amount,
          affiliateId: c.affiliateId
        }))
      });

      return {
        success: true,
        data: validatedCommissions,
        _service_debug_marker_: 'SERVICE_v2',
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ServerError(`Failed to get commissions: ${error.message}`);
    }
  }

  /**
   * Get all payouts with filtering
   * @param {Object} query - Query parameters
   * @returns {Promise<Object>} Paginated payouts
   */
  async getPayouts(query = {}) {
    try {
      const page = Math.max(1, parseInt(query.page) || 1);
      const limit = Math.min(100, Math.max(1, parseInt(query.limit) || 20));
      const skip = (page - 1) * limit;

      // Build filter
      const filter = {};
      if (query.status) filter.status = query.status;
      if (query.affiliateId) filter.affiliateId = query.affiliateId;

      // Date range filter
      if (query.dateFrom || query.dateTo) {
        filter.createdAt = {};
        if (query.dateFrom) filter.createdAt.$gte = new Date(query.dateFrom);
        if (query.dateTo) {
          const dateTo = new Date(query.dateTo);
          dateTo.setHours(23, 59, 59, 999);
          filter.createdAt.$lte = dateTo;
        }
      }

      const total = await Payout.countDocuments(filter);

      const payouts = await Payout.find(filter)
        .populate('affiliateId', 'name email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      return {
        success: true,
        data: payouts,
        pagination: {
          currentPage: page,
          itemsPerPage: limit,
          totalItems: total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error) {
      throw new ServerError(`Failed to get payouts: ${error.message}`);
    }
  }

  /**
   * Get revenue analytics over time
   * @param {Object} query - Query parameters (groupBy, dateFrom, dateTo)
   * @returns {Promise<Object>} Revenue breakdown
   */
  async getRevenueAnalytics(query = {}) {
    try {
      const groupBy = query.groupBy || 'day';
      const pipeline = getRevenueAnalyticsPipeline(groupBy);

      // Add date filtering if provided
      if (query.dateFrom || query.dateTo) {
        const match = { status: 'completed' };
        if (query.dateFrom) match.createdAt = { $gte: new Date(query.dateFrom) };
        if (query.dateTo) {
          const dateTo = new Date(query.dateTo);
          dateTo.setHours(23, 59, 59, 999);
          if (match.createdAt) {
            match.createdAt.$lte = dateTo;
          } else {
            match.createdAt = { $lte: dateTo };
          }
        }
        pipeline[0] = { $match: match };
      }

      const analytics = await Order.aggregate(pipeline);

      return {
        success: true,
        groupBy,
        data: analytics
      };
    } catch (error) {
      throw new ServerError(`Failed to get revenue analytics: ${error.message}`);
    }
  }

  /**
   * Get top performing affiliates
   * @param {Object} query - Query parameters (limit)
   * @returns {Promise<Object>} Top affiliates
   */
  async getTopAffiliates(query = {}) {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
      
      const topAffiliates = await Commission.aggregate(getTopAffiliatesPipeline(limit));
      
      console.log(`📊 [ADMIN-SERVICE] Top Affiliates retrieved:`, {
        count: topAffiliates.length,
        data: topAffiliates.slice(0, 3)
      });

      return {
        success: true,
        data: topAffiliates
      };
    } catch (error) {
      console.error(`❌ [ADMIN-SERVICE] Top Affiliates Error:`, error.message);
      throw new ServerError(`Failed to get top affiliates: ${error.message}`);
    }
  }

  /**
   * Get top selling products
   * @param {Object} query - Query parameters (limit)
   * @returns {Promise<Object>} Top products
   */
  async getTopProducts(query = {}) {
    try {
      const limit = Math.min(50, Math.max(1, parseInt(query.limit) || 10));
      const pipeline = getTopProductsPipeline(limit);

      const topProducts = await Order.aggregate(pipeline);

      return {
        success: true,
        data: topProducts
      };
    } catch (error) {
      throw new ServerError(`Failed to get top products: ${error.message}`);
    }
  }

  /**
   * Get commission analytics
   * @returns {Promise<Object>} Commission metrics
   */
  async getCommissionAnalytics() {
    try {
      console.log(`📈 [ADMIN] Commission Analytics request started`);
      const pipeline = getCommissionAnalyticsPipeline();
      const analytics = await Commission.aggregate(pipeline);

      console.log(`✅ [ADMIN] Commission Analytics computed:`, {
        byStatus: analytics[0]?.byStatus?.length || 0,
        totalMetrics: analytics[0]?.totalMetrics?.[0],
        byAffiliate: analytics[0]?.byAffiliate?.length || 0
      });

      return {
        success: true,
        data: analytics[0] || {}
      };
    } catch (error) {
      console.error(`❌ [ADMIN] Commission Analytics Error:`, error.message);
      throw new ServerError(`Failed to get commission analytics: ${error.message}`);
    }
  }

  /**
   * Get payout analytics
   * @returns {Promise<Object>} Payout metrics
   */
  async getPayoutAnalytics() {
    try {
      const pipeline = getPayoutAnalyticsPipeline();
      const analytics = await Payout.aggregate(pipeline);

      return {
        success: true,
        data: analytics[0] || {}
      };
    } catch (error) {
      throw new ServerError(`Failed to get payout analytics: ${error.message}`);
    }
  }

  /**
   * Get order analytics
   * @returns {Promise<Object>} Order metrics
   */
  async getOrderAnalytics() {
    try {
      const pipeline = getOrderAnalyticsPipeline();
      const analytics = await Order.aggregate(pipeline);

      return {
        success: true,
        data: analytics[0] || {}
      };
    } catch (error) {
      throw new ServerError(`Failed to get order analytics: ${error.message}`);
    }
  }

  /**
   * Get revenue analytics - Daily/weekly/monthly revenue breakdown
   * @param {string} groupBy - 'day', 'week', or 'month' (default: 'day')
   * @returns {Promise<Object>} Revenue analytics data
   */
  async getRevenueAnalytics(groupBy = 'day') {
    try {
      // Get last 30 days of revenue data
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const dateFormat = {
        day: '%Y-%m-%d',
        week: '%G-W%V',
        month: '%Y-%m'
      };

      const pipeline = [
        {
          $match: {
            paymentStatus: 'paid',
            createdAt: { $gte: thirtyDaysAgo }
          }
        },
        {
          $group: {
            _id: { $dateToString: { format: dateFormat[groupBy] || '%Y-%m-%d', date: '$createdAt' } },
            revenue: { $sum: '$total' },
            orderCount: { $sum: 1 },
            averageOrderValue: { $avg: '$total' }
          }
        },
        { $sort: { _id: 1 } }
      ];

      const revenueData = await Order.aggregate(pipeline);
      
      console.log(`📊 [ADMIN-SERVICE] Revenue analytics (${groupBy}):`, {
        dataPoints: revenueData.length,
        sample: revenueData.slice(0, 2)
      });

      return {
        success: true,
        data: revenueData || []
      };
    } catch (error) {
      throw new ServerError(`Failed to get revenue analytics: ${error.message}`);
    }
  }

  /**
   * Get affiliate performance details
   * @param {String} affiliateId - Affiliate ID
   * @returns {Promise<Object>} Detailed affiliate performance
   */
  async getAffiliatePerformanceDetails(affiliateId) {
    try {
      const affiliate = await User.findById(affiliateId);
      if (!affiliate || !affiliate.affiliateDetails.isAffiliate) {
        throw new NotFoundError('Affiliate not found');
      }

      const commissionStats = await this._getAffiliateCommissionStats(affiliateId);
      const payoutStats = await this._getAffiliatePayoutStats(affiliateId);

      return {
        success: true,
        affiliate: {
          _id: affiliate._id,
          name: affiliate.name,
          email: affiliate.email,
          status: affiliate.status,
          earnings: affiliate.affiliateDetails.earnings
        },
        commissionStats,
        payoutStats
      };
    } catch (error) {
      if (error instanceof NotFoundError) throw error;
      throw new ServerError(`Failed to get affiliate details: ${error.message}`);
    }
  }

  /**
   * Get system analytics for health monitoring
   * @returns {Promise<Object>} System health metrics
   */
  async getSystemAnalytics() {
    try {
      const [
        recentOrders,
        pendingCommissions,
        failedPayouts,
        totalAffiliates,
        systemHealth
      ] = await Promise.all([
        Order.find({ paymentStatus: 'paid' })
          .sort({ createdAt: -1 })
          .limit(10)
          .lean(),
        Commission.countDocuments({ status: 'pending' }),
        Payout.countDocuments({ status: 'failed' }),
        User.countDocuments({ 'affiliateDetails.isAffiliate': true }),
        this._getSystemHealth()
      ]);

      return {
        success: true,
        metrics: {
          lastOrders: recentOrders,
          pendingCommissions,
          failedPayouts,
          totalAffiliates,
          health: systemHealth
        }
      };
    } catch (error) {
      throw new ServerError(`Failed to get system analytics: ${error.message}`);
    }
  }

  /**
   * Get system health metrics (alias for compatibility with frontend)
   * @returns {Promise<Object>} System metrics
   */
  async getSystemHealthMetrics() {
    return this.getSystemAnalytics();
  }

  /**
   * Get financial reconciliation report
   * @returns {Promise<Object>} Reconciliation data
   */
  async getFinancialReconciliation() {
    try {
      const [
        totalOrderRevenue,
        totalCommissionsGenerated,
        totalPayoutsProcessed
      ] = await Promise.all([
        this._getTotalRevenue(),
        this._getTotalCommissions(),
        this._getTotalPayouts()
      ]);

      const totalAffiliateEarnings = await this._getTotalAffiliateEarnings();

      return {
        success: true,
        reconciliation: {
          totalOrderRevenue,
          totalCommissionsGenerated,
          totalPayoutsProcessed,
          totalAffiliateEarnings,
          discrepancy: Math.abs(totalPayoutsProcessed - totalAffiliateEarnings),
          isBalanced: totalPayoutsProcessed === totalAffiliateEarnings
        }
      };
    } catch (error) {
      throw new ServerError(`Failed to get reconciliation data: ${error.message}`);
    }
  }

  /**
   * PRIVATE HELPER METHODS
   */

  async _getTotalRevenue() {
    const result = await Order.aggregate([
      { $match: { paymentStatus: 'paid' } },
      { $group: { _id: null, total: { $sum: '$total' } } }
    ]);
    return result[0]?.total || 0;
  }

  async _getTotalCommissions() {
    const result = await Commission.aggregate([
      { $match: { status: { $in: ['approved', 'paid'] } } },
      { $group: { _id: null, total: { $sum: '$calculation.amount' } } }
    ]);
    return result[0]?.total || 0;
  }

  async _getTotalPayouts() {
    const result = await Payout.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);
    return result[0]?.total || 0;
  }

  async _getTotalAffiliateEarnings() {
    const result = await User.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$affiliateDetails.earnings.totalPaidOut' }
        }
      }
    ]);
    return result[0]?.total || 0;
  }

  async _getCommissionStats() {
    const statuses = ['pending', 'approved', 'paid', 'reversed'];
    const stats = {};

    console.log(`🧮 [ADMIN] Calculating commission stats for statuses:`, statuses);

    for (const status of statuses) {
      const result = await Commission.aggregate([
        { $match: { status } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$calculation.amount' } } }
      ]);
      stats[status] = result[0] || { count: 0, total: 0 };
      console.log(`  Status "${status}": ${stats[status].count} commissions, $${stats[status].total.toFixed(2)}`);
    }

    return stats;
  }

  async _getPayoutStats() {
    const statuses = ['pending', 'approved', 'processing', 'completed', 'failed', 'cancelled'];
    const stats = {};

    for (const status of statuses) {
      const result = await Payout.aggregate([
        { $match: { status } },
        { $group: { _id: null, count: { $sum: 1 }, total: { $sum: '$amount' } } }
      ]);
      stats[status] = result[0] || { count: 0, total: 0 };
    }

    return stats;
  }

  async _getAffiliateCommissionStats(affiliateId) {
    const result = await Commission.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: null,
          totalCommissions: { $sum: 1 },
          totalAmount: { $sum: '$calculation.amount' },
          pending: { $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] } },
          approved: { $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] } },
          paid: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } }
        }
      }
    ]);

    return result[0] || { totalCommissions: 0, totalAmount: 0, pending: 0, approved: 0, paid: 0 };
  }

  async _getAffiliatePayoutStats(affiliateId) {
    const result = await Payout.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: null,
          totalPayouts: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          completed: { $sum: { $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0] } },
          pending: { $sum: { $cond: [{ $in: ['$status', ['pending', 'approved', 'processing']] }, '$amount', 0] } }
        }
      }
    ]);

    return result[0] || { totalPayouts: 0, totalAmount: 0, completed: 0, pending: 0 };
  }

  async _getSystemHealth() {
    const [
      recentOrderCount,
      failedPayoutCount,
      pendingCommissionCount
    ] = await Promise.all([
      Order.countDocuments({
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }),
      Payout.countDocuments({ status: 'failed' }),
      Commission.countDocuments({ status: 'pending' })
    ]);

    return {
      recentOrders: recentOrderCount,
      failedPayouts: failedPayoutCount,
      pendingCommissions: pendingCommissionCount,
      isHealthy:
        recentOrderCount > 0 &&
        failedPayoutCount <= 10 &&
        pendingCommissionCount <= 100
    };
  }
}

// Export singleton instance
module.exports = new AdminService();
