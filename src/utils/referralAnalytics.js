/**
 * Referral Analytics Utilities
 * Advanced analytics and reporting utilities for referral tracking data
 */

const ReferralTracking = require('../models/ReferralTracking');

/**
 * Get comprehensive referral performance metrics
 *
 * @param {string} affiliateId - Affiliate ID to analyze
 * @param {Object} options - Analytics options
 *   - dateFrom: Start date (optional)
 *   - dateTo: End date (optional)
 *   - groupBy: 'day', 'week', 'month' (optional)
 * @returns {Promise<Object>} Detailed analytics data
 */
const getAffiliatePerformanceMetrics = async (affiliateId, options = {}) => {
  const { dateFrom, dateTo, groupBy = 'day' } = options;

  try {
    // Build date filter
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);

    const query = { affiliateId };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // Get overall stats
    const totalClicks = await ReferralTracking.countDocuments(query);
    const convertedClicks = await ReferralTracking.countDocuments({
      ...query,
      convertedToSale: true,
    });

    // Get commission data
    const commissionData = await ReferralTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: null,
          totalCommission: { $sum: '$commissionAmount' },
          avgCommission: { $avg: '$commissionAmount' },
          maxCommission: { $max: '$commissionAmount' },
          minCommission: { $min: '$commissionAmount' },
        },
      },
    ]);

    const commission = commissionData[0] || {
      totalCommission: 0,
      avgCommission: 0,
      maxCommission: 0,
      minCommission: 0,
    };

    // Get unique visitors
    const uniqueVisitors = await ReferralTracking.distinct('visitorId', query);

    // Get traffic by source
    const bySource = await ReferralTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$referralSource',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
          },
          commission: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, '$commissionAmount', 0] },
          },
        },
      },
      { $sort: { clicks: -1 } },
    ]);

    // Get traffic by device
    const byDevice = await ReferralTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$device',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
          },
          commission: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, '$commissionAmount', 0] },
          },
        },
      },
    ]);

    // Calculate conversion rate
    const conversionRate = totalClicks > 0 ? (convertedClicks / totalClicks) * 100 : 0;

    // Calculate average order value (AOV)
    const aov = convertedClicks > 0 ? commission.totalCommission / convertedClicks : 0;

    return {
      summary: {
        totalClicks,
        convertedClicks,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        uniqueVisitors: uniqueVisitors.length,
        totalCommission: parseFloat((commission.totalCommission || 0).toFixed(2)),
        averageCommissionPerSale: parseFloat((commission.avgCommission || 0).toFixed(2)),
        maxCommissionValue: parseFloat((commission.maxCommission || 0).toFixed(2)),
        minCommissionValue: parseFloat((commission.minCommission || 0).toFixed(2)),
        averageOrderValue: parseFloat(aov.toFixed(2)),
        clicksToUniqueVisitor: uniqueVisitors.length > 0 ? (totalClicks / uniqueVisitors.length).toFixed(2) : 0,
      },
      bySource: bySource.map((item) => ({
        source: item._id,
        clicks: item.clicks,
        conversions: item.conversions,
        conversionRate: parseFloat(((item.conversions / item.clicks) * 100).toFixed(2)),
        commission: parseFloat((item.commission || 0).toFixed(2)),
      })),
      byDevice: byDevice.map((item) => ({
        device: item._id,
        clicks: item.clicks,
        conversions: item.conversions,
        conversionRate: parseFloat(((item.conversions / item.clicks) * 100).toFixed(2)),
        commission: parseFloat((item.commission || 0).toFixed(2)),
      })),
      dateRange: {
        from: dateFrom || null,
        to: dateTo || null,
      },
    };
  } catch (error) {
    throw new Error(`Failed to get performance metrics: ${error.message}`);
  }
};

/**
 * Get referral traffic trend over time
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {Object} options - Options
 *   - dateFrom: Start date
 *   - dateTo: End date
 *   - groupBy: 'day', 'week', 'month' (default: 'day')
 * @returns {Promise<Array>} Time series data
 */
const getReferralTrends = async (affiliateId, options = {}) => {
  const { dateFrom, dateTo, groupBy = 'day' } = options;

  try {
    // Build date filter
    const dateFilter = {};
    if (dateFrom) dateFilter.$gte = new Date(dateFrom);
    if (dateTo) dateFilter.$lte = new Date(dateTo);

    const query = { affiliateId };
    if (Object.keys(dateFilter).length > 0) {
      query.createdAt = dateFilter;
    }

    // Determine grouping format
    let groupFormat;
    switch (groupBy) {
      case 'week':
        groupFormat = {
          year: { $year: '$createdAt' },
          week: { $week: '$createdAt' },
        };
        break;
      case 'month':
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
        };
        break;
      case 'day':
      default:
        groupFormat = {
          year: { $year: '$createdAt' },
          month: { $month: '$createdAt' },
          day: { $dayOfMonth: '$createdAt' },
        };
        break;
    }

    const trends = await ReferralTracking.aggregate([
      { $match: query },
      {
        $group: {
          _id: groupFormat,
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
          },
          commission: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, '$commissionAmount', 0] },
          },
          uniqueVisitors: { $addToSet: '$visitorId' },
        },
      },
      {
        $project: {
          _id: 1,
          clicks: 1,
          conversions: 1,
          commission: 1,
          uniqueVisitorCount: { $size: '$uniqueVisitors' },
          conversionRate: {
            $multiply: [
              { $divide: ['$conversions', '$clicks'] },
              100,
            ],
          },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1, '_id.week': 1 } },
    ]);

    return trends.map((item) => ({
      period: item._id,
      clicks: item.clicks,
      conversions: item.conversions,
      conversionRate: item.conversionRate,
      commission: parseFloat((item.commission || 0).toFixed(2)),
      uniqueVisitors: item.uniqueVisitorCount,
    }));
  } catch (error) {
    throw new Error(`Failed to get referral trends: ${error.message}`);
  }
};

/**
 * Get top performing referral sources
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {number} limit - Max results (default: 10)
 * @returns {Promise<Array>} Top sources ranked by conversions
 */
const getTopReferralSources = async (affiliateId, limit = 10) => {
  try {
    const topSources = await ReferralTracking.aggregate([
      { $match: { affiliateId } },
      {
        $group: {
          _id: '$referralSource',
          clicks: { $sum: 1 },
          conversions: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, 1, 0] },
          },
          commission: {
            $sum: { $cond: [{ $eq: ['$convertedToSale', true] }, '$commissionAmount', 0] },
          },
        },
      },
      {
        $project: {
          source: '$_id',
          _id: 0,
          clicks: 1,
          conversions: 1,
          commission: 1,
          conversionRate: {
            $multiply: [
              { $divide: ['$conversions', '$clicks'] },
              100,
            ],
          },
        },
      },
      { $sort: { conversions: -1 } },
      { $limit: limit },
    ]);

    return topSources.map((item) => ({
      source: item.source,
      clicks: item.clicks,
      conversions: item.conversions,
      conversionRate: parseFloat(item.conversionRate.toFixed(2)),
      commission: parseFloat((item.commission || 0).toFixed(2)),
    }));
  } catch (error) {
    throw new Error(`Failed to get top referral sources: ${error.message}`);
  }
};

/**
 * Get visitor journey statistics
 *
 * Shows patterns in how visitors interact with referral links
 *
 * @param {string} affiliateId - Affiliate ID
 * @returns {Promise<Object>} Visitor behavior patterns
 */
const getVisitorJourneyStats = async (affiliateId) => {
  try {
    // Get all referrals for this affiliate
    const referrals = await ReferralTracking.find({ affiliateId })
      .select('visitorId convertedToSale createdAt orderId')
      .sort({ createdAt: -1 });

    // Track visitor journeys
    const visitorMap = {};

    referrals.forEach((referral) => {
      if (!visitorMap[referral.visitorId]) {
        visitorMap[referral.visitorId] = {
          clicks: 0,
          bounced: false,
          converted: false,
          firstClickAt: referral.createdAt,
          lastClickAt: referral.createdAt,
          orderId: null,
        };
      }

      visitorMap[referral.visitorId].clicks += 1;
      visitorMap[referral.visitorId].lastClickAt = referral.createdAt;

      if (referral.convertedToSale) {
        visitorMap[referral.visitorId].converted = true;
        visitorMap[referral.visitorId].orderId = referral.orderId;
      }
    });

    const visitors = Object.values(visitorMap);

    // Calculate statistics
    const totalVisitors = visitors.length;
    const convertedVisitors = visitors.filter((v) => v.converted).length;
    const visitorsWithMultipleClicks = visitors.filter((v) => v.clicks > 1).length;

    // Calculate average time to conversion
    const conversionTimes = visitors
      .filter((v) => v.converted)
      .map((v) => v.lastClickAt.getTime() - v.firstClickAt.getTime());

    const avgTimeToConversion =
      conversionTimes.length > 0
        ? conversionTimes.reduce((a, b) => a + b, 0) / conversionTimes.length
        : 0;

    // Distribution of clicks per visitor
    const clickDistribution = {};
    visitors.forEach((v) => {
      clickDistribution[v.clicks] = (clickDistribution[v.clicks] || 0) + 1;
    });

    return {
      totalVisitors,
      convertedVisitors,
      conversionRate: parseFloat(((convertedVisitors / totalVisitors) * 100).toFixed(2)),
      visitorsWithMultipleClicks,
      repeatVisitorRate: parseFloat(((visitorsWithMultipleClicks / totalVisitors) * 100).toFixed(2)),
      averageClicksPerVisitor: parseFloat((referrals.length / totalVisitors).toFixed(2)),
      averageTimeToConversionMs: Math.round(avgTimeToConversion),
      averageTimeToConversionHours: Math.round(avgTimeToConversion / (60 * 60 * 1000)),
      clickDistribution: Object.fromEntries(
        Object.entries(clickDistribution).sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
      ),
    };
  } catch (error) {
    throw new Error(`Failed to get visitor journey stats: ${error.message}`);
  }
};

/**
 * Get high-value referral insights
 *
 * Identifies patterns in highest converting referrals
 *
 * @param {string} affiliateId - Affiliate ID
 * @param {number} limit - Number of top referrals to analyze
 * @returns {Promise<Object>} High-value referral patterns
 */
const getHighValueReferralInsights = async (affiliateId, limit = 20) => {
  try {
    // Get top converting referrals
    const topReferrals = await ReferralTracking.find({
      affiliateId,
      convertedToSale: true,
    })
      .sort({ commissionAmount: -1 })
      .limit(limit)
      .select('referralSource device commissionAmount createdAt utmCampaign utmSource');

    if (topReferrals.length === 0) {
      return {
        topReferralCount: 0,
        averageCommission: 0,
        commonSources: [],
        commonDevices: [],
        commonUtmCampaigns: [],
      };
    }

    // Analyze patterns
    const sourceFreq = {};
    const deviceFreq = {};
    const campaignFreq = {};
    let totalCommission = 0;

    topReferrals.forEach((referral) => {
      sourceFreq[referral.referralSource] = (sourceFreq[referral.referralSource] || 0) + 1;
      deviceFreq[referral.device] = (deviceFreq[referral.device] || 0) + 1;
      if (referral.utmCampaign) {
        campaignFreq[referral.utmCampaign] = (campaignFreq[referral.utmCampaign] || 0) + 1;
      }
      totalCommission += referral.commissionAmount || 0;
    });

    // Sort by frequency
    const sortByFreq = (obj) =>
      Object.entries(obj)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([key, count]) => ({
          value: key,
          frequency: count,
          percentage: parseFloat(((count / topReferrals.length) * 100).toFixed(1)),
        }));

    return {
      topReferralCount: topReferrals.length,
      totalCommissionFromTop: parseFloat(totalCommission.toFixed(2)),
      averageCommissionPerReferral: parseFloat((totalCommission / topReferrals.length).toFixed(2)),
      commonSources: sortByFreq(sourceFreq),
      commonDevices: sortByFreq(deviceFreq),
      commonUtmCampaigns: sortByFreq(campaignFreq),
    };
  } catch (error) {
    throw new Error(`Failed to get high-value referral insights: ${error.message}`);
  }
};

module.exports = {
  getAffiliatePerformanceMetrics,
  getReferralTrends,
  getTopReferralSources,
  getVisitorJourneyStats,
  getHighValueReferralInsights,
};
