/**
 * ============================================================================
 * ADMIN ANALYTICS UTILITIES - MongoDB Aggregation Pipelines
 * ============================================================================
 *
 * Provides MongoDB aggregation pipelines for computing platform analytics,
 * financial metrics, and administrative dashboard statistics.
 *
 * Each function returns an aggregation pipeline that can be executed against
 * the respective MongoDB collection to compute metrics efficiently.
 *
 * ============================================================================
 */

/**
 * Dashboard Overview Analytics Pipeline
 * Computes: Total revenue, orders, products, affiliates, commissions, payouts
 *
 * @returns {Object} Dashboard statistics object
 */
const getDashboardOverviewPipeline = () => {
  return {
    totalRevenue: async (ordersCollection) => {
      const result = await ordersCollection
        .aggregate([
          { $match: { paymentStatus: 'paid', orderStatus: 'delivered' } },
          {
            $group: {
              _id: null,
              total: { $sum: '$totalAmount' },
              averageOrderValue: { $avg: '$totalAmount' },
              minOrderValue: { $min: '$totalAmount' },
              maxOrderValue: { $max: '$totalAmount' }
            }
          }
        ])
        .toArray();
      return result[0] || { total: 0, averageOrderValue: 0, minOrderValue: 0, maxOrderValue: 0 };
    },

    totalOrdersCount: async (ordersCollection) => {
      return await ordersCollection.countDocuments();
    },

    completedOrdersCount: async (ordersCollection) => {
      return await ordersCollection.countDocuments({ paymentStatus: 'paid', orderStatus: 'delivered' });
    },

    pendingOrdersCount: async (ordersCollection) => {
      return await ordersCollection.countDocuments({ orderStatus: 'pending' });
    },

    failedOrdersCount: async (ordersCollection) => {
      return await ordersCollection.countDocuments({ paymentStatus: 'failed' });
    },

    totalProductsCount: async (productsCollection) => {
      return await productsCollection.countDocuments();
    },

    activeProductsCount: async (productsCollection) => {
      return await productsCollection.countDocuments({ status: 'active' });
    },

    totalAffiliatesCount: async (usersCollection) => {
      return await usersCollection.countDocuments({ 'affiliateDetails.isAffiliate': true });
    },

    activeAffiliatesCount: async (usersCollection) => {
      return await usersCollection.countDocuments({
        'affiliateDetails.isAffiliate': true,
        status: 'active'
      });
    }
  };
};

/**
 * Revenue Analytics Pipeline
 * Computes daily/weekly/monthly revenue breakdown
 *
 * @param {String} groupBy - 'day', 'week', or 'month'
 * @returns {Array} Revenue grouped by time period
 */
const getRevenueAnalyticsPipeline = (groupBy = 'day') => {
  const dateFormat = {
    day: '%Y-%m-%d',
    week: '%Y-W%V',
    month: '%Y-%m'
  };

  return [
    { $match: { paymentStatus: 'paid', orderStatus: 'delivered' } },
    {
      $group: {
        _id: { $dateToString: { format: dateFormat[groupBy], date: '$createdAt' } },
        revenue: { $sum: '$totalAmount' },
        orderCount: { $sum: 1 },
        averageOrderValue: { $avg: '$totalAmount' }
      }
    },
    { $sort: { _id: 1 } }
  ];
};

/**
 * Affiliate Performance Pipeline
 * Computes affiliate earnings and performance metrics
 *
 * @param {Number} limit - Number of top affiliates to return
 * @returns {Array} Top performing affiliates by commission
 */
const getTopAffiliatesPipeline = (limit = 10) => {
  return [
    {
      $group: {
        _id: '$affiliateId',
        totalCommission: { $sum: '$calculation.amount' },
        totalReferrals: { $sum: 1 },
        averageCommission: { $avg: '$calculation.amount' },
        commissionStatus: { $push: '$status' }
      }
    },
    { $sort: { totalCommission: -1 } },
    { $limit: limit },
    // STAGE 1: Lookup Affiliate collection to get userId
    {
      $lookup: {
        from: 'affiliates',
        localField: '_id',
        foreignField: '_id',
        as: 'affiliateRecord'
      }
    },
    {
      $unwind: {
        path: '$affiliateRecord',
        preserveNullAndEmptyArrays: false
      }
    },
    // STAGE 2: Lookup User collection using userId from Affiliate
    {
      $lookup: {
        from: 'users',
        localField: 'affiliateRecord.userId',
        foreignField: '_id',
        as: 'userData'
      }
    },
    {
      $unwind: {
        path: '$userData',
        preserveNullAndEmptyArrays: false
      }
    },
    {
      $project: {
        _id: 1,
        affiliateName: '$userData.name',
        affiliateEmail: '$userData.email',
        totalCommission: 1,
        totalReferrals: 1,
        averageCommission: 1,
        status: '$userData.affiliateStatus'
      }
    }
  ];
};

/**
 * Top Products Pipeline
 * Computes bestselling products by revenue and volume
 *
 * @param {Number} limit - Number of top products to return
 * @returns {Array} Top selling products
 */
const getTopProductsPipeline = (limit = 10) => {
  return [
    { $unwind: '$items' },
    { $match: { paymentStatus: 'paid', orderStatus: 'delivered' } },
    {
      $group: {
        _id: '$items.productId',
        totalRevenue: { $sum: { $multiply: ['$items.price', '$items.quantity'] } },
        totalQuantitySold: { $sum: '$items.quantity' },
        totalOrders: { $sum: 1 },
        averagePrice: { $avg: '$items.price' }
      }
    },
    { $sort: { totalRevenue: -1 } },
    { $limit: limit },
    {
      $lookup: {
        from: 'products',
        localField: '_id',
        foreignField: '_id',
        as: 'productData'
      }
    },
    {
      $unwind: '$productData'
    },
    {
      $project: {
        _id: 1,
        productName: '$productData.name',
        category: '$productData.category',
        totalRevenue: 1,
        totalQuantitySold: 1,
        totalOrders: 1,
        averagePrice: 1
      }
    }
  ];
};

/**
 * Commission Analytics Pipeline
 * Computes commission metrics and status breakdown
 *
 * @returns {Array} Commission analytics
 */
const getCommissionAnalyticsPipeline = () => {
  return [
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$calculation.amount' }
            }
          }
        ],
        totalMetrics: [
          {
            $group: {
              _id: null,
              totalCommissions: { $sum: 1 },
              totalCommissionAmount: { $sum: '$calculation.amount' },
              averageCommission: { $avg: '$calculation.amount' },
              maxCommission: { $max: '$calculation.amount' },
              minCommission: { $min: '$calculation.amount' }
            }
          }
        ],
        byAffiliate: [
          {
            $group: {
              _id: '$affiliateId',
              count: { $sum: 1 },
              totalAmount: { $sum: '$calculation.amount' }
            }
          },
          { $sort: { totalAmount: -1 } },
          { $limit: 20 }
        ]
      }
    }
  ];
};

/**
 * Payout Analytics Pipeline
 * Computes payout metrics and pending amount
 *
 * @returns {Array} Payout analytics
 */
const getPayoutAnalyticsPipeline = () => {
  return [
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalAmount: { $sum: '$amount' }
            }
          }
        ],
        totalMetrics: [
          {
            $group: {
              _id: null,
              totalPayouts: { $sum: 1 },
              totalPaidOut: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'completed'] }, '$amount', 0]
                }
              },
              totalPending: {
                $sum: {
                  $cond: [
                    { $in: ['$status', ['pending', 'approved', 'processing']] },
                    '$amount',
                    0
                  ]
                }
              },
              totalFailed: {
                $sum: {
                  $cond: [{ $eq: ['$status', 'failed'] }, '$amount', 0]
                }
              },
              averagePayout: { $avg: '$amount' }
            }
          }
        ],
        recentPayouts: [
          { $sort: { createdAt: -1 } },
          { $limit: 20 },
          {
            $lookup: {
              from: 'users',
              localField: 'affiliateId',
              foreignField: '_id',
              as: 'affiliateData'
            }
          },
          { $unwind: '$affiliateData' },
          {
            $project: {
              _id: 1,
              affiliateName: '$affiliateData.name',
              amount: 1,
              status: 1,
              method: 1,
              createdAt: 1
            }
          }
        ]
      }
    }
  ];
};

/**
 * Order Analytics Pipeline
 * Detailed order insights by status, payment method, etc.
 *
 * @returns {Array} Order analytics
 */
const getOrderAnalyticsPipeline = () => {
  return [
    {
      $facet: {
        byStatus: [
          {
            $group: {
              _id: '$status',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' }
            }
          }
        ],
        byPaymentMethod: [
          {
            $group: {
              _id: '$paymentMethod',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' }
            }
          }
        ],
        byAffiliateSource: [
          {
            $group: {
              _id: '$affiliateDetails.affiliateId',
              count: { $sum: 1 },
              totalRevenue: { $sum: '$totalAmount' }
            }
          },
          { $sort: { totalRevenue: -1 } },
          { $limit: 20 }
        ]
      }
    }
  ];
};

/**
 * Affiliate Performance Detailed Pipeline
 * Comprehensive affiliate performance metrics
 *
 * @param {String} affiliateId - Specific affiliate ID (optional)
 * @returns {Array} Detailed affiliate metrics
 */
const getAffiliatePerformanceDetailsPipeline = (affiliateId = null) => {
  const match = affiliateId ? { affiliateId: affiliateId } : {};

  return [
    { $match: match },
    {
      $facet: {
        performance: [
          {
            $group: {
              _id: '$affiliateId',
              totalCommissions: { $sum: 1 },
              totalCommissionAmount: { $sum: '$calculation.amount' },
              approvedCommissions: {
                $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
              },
              pendingCommissions: {
                $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
              },
              paidCommissions: {
                $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] }
              }
            }
          }
        ],
        monthlyBreakdown: [
          {
            $group: {
              _id: {
                affiliate: '$affiliateId',
                month: { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
              },
              commissions: { $sum: 1 },
              amount: { $sum: '$calculation.amount' }
            }
          },
          { $sort: { '_id.month': 1 } }
        ]
      }
    }
  ];
};

/**
 * User Growth Analytics Pipeline
 * Tracks user and affiliate growth over time
 *
 * @returns {Array} User growth metrics
 */
const getUserGrowthAnalyticsPipeline = () => {
  return [
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        newUsers: { $sum: 1 },
        status: { $push: '$status' }
      }
    },
    { $sort: { _id: 1 } }
  ];
};

/**
 * System Health Check Pipeline
 * Computes system metrics for platform health
 *
 * @returns {Object} System health metrics
 */
const getSystemHealthMetricsPipeline = () => {
  return {
    computeMetrics: async (collections) => {
      const { orders, users, commissions, payouts } = collections;

      // Compute metrics in parallel
      const [
        recentOrders,
        recentCommissions,
        failedPayouts,
        inactiveAffiliates
      ] = await Promise.all([
        orders
          .find({ paymentStatus: 'paid', orderStatus: 'delivered' })
          .sort({ createdAt: -1 })
          .limit(100)
          .toArray(),
        commissions
          .find({ status: 'pending' })
          .count(),
        payouts
          .find({ status: 'failed' })
          .count(),
        users
          .find({
            'affiliateDetails.isAffiliate': true,
            'affiliateDetails.lastActivityAt': { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
          })
          .count()
      ]);

      return {
        lastOrderDate: recentOrders[0]?.createdAt || null,
        pendingCommissions: recentCommissions,
        failedPayouts: failedPayouts,
        inactiveAffiliates: inactiveAffiliates,
        systemHealth: {
          ordersHealthy: recentOrders.length > 0,
          commissionsProcessing: recentCommissions <= 100,
          payoutsFailing: failedPayouts <= 10
        }
      };
    }
  };
};

/**
 * Financial Reconciliation Pipeline
 * Ensures financial data consistency across systems
 *
 * @returns {Array} Reconciliation report
 */
const getFinancialReconciliationPipeline = () => {
  return {
    reconcile: async (collections) => {
      const { orders, commissions, payouts, users } = collections;

      // Calculate totals from each collection
      const [orderRevenue, commissionTotal, payoutTotal, affiliateEarnings] = await Promise.all([
        orders
          .aggregate([
            { $match: { paymentStatus: 'paid', orderStatus: 'delivered' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
          ])
          .toArray(),
        commissions
          .aggregate([
            { $match: { status: { $in: ['approved', 'paid'] } } },
            { $group: { _id: null, total: { $sum: '$calculation.amount' } } }
          ])
          .toArray(),
        payouts
          .aggregate([
            { $match: { status: 'completed' } },
            { $group: { _id: null, total: { $sum: '$amount' } } }
          ])
          .toArray(),
        users
          .aggregate([
            { $group: { _id: null, total: { $sum: '$affiliateDetails.earnings.totalPaidOut' } } }
          ])
          .toArray()
      ]);

      const orderTotal = orderRevenue[0]?.total || 0;
      const commissionTotalAmount = commissionTotal[0]?.total || 0;
      const payoutTotalAmount = payoutTotal[0]?.total || 0;
      const affiliateTotalAmount = affiliateEarnings[0]?.total || 0;

      return {
        orderRevenue: orderTotal,
        commissionsGenerated: commissionTotalAmount,
        payoutsProcessed: payoutTotalAmount,
        affiliateReceivedAmount: affiliateTotalAmount,
        reconciliation: {
          isBalanced: payoutTotalAmount === affiliateTotalAmount,
          discrepancy: Math.abs(payoutTotalAmount - affiliateTotalAmount),
          notes: payoutTotalAmount === affiliateTotalAmount
            ? 'All payouts reconciled with affiliate earnings'
            : 'Discrepancy detected - investigation required'
        }
      };
    }
  };
};

/**
 * Export all analytics pipelines
 */
module.exports = {
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
};
