/**
 * Follower Controller
 * HTTP request handlers for follower endpoints
 */

const followerService = require('../services/followerService');
const { validateFollowerSubscription, validateFollowerUnsubscription } = require('../validators/followerValidator');
const { ValidationError } = require('../utils/errors');

/**
 * POST /api/v1/followers/subscribe
 * Subscribe a new follower
 * Body: { email }
 * Public endpoint (no auth required)
 */
exports.subscribeFollower = async (req, res, next) => {
  try {
    const { error, value } = validateFollowerSubscription(req.body);

    // Handle validation errors
    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return next(new ValidationError('Invalid email format', errors));
    }

    // Get additional data from request
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'];

    // Subscribe the follower
    const result = await followerService.subscribeFollower(value.email, {
      source: value.source || 'landing_page',
      ipAddress,
      userAgent,
      userId: req.user?._id || null, // If logged in user, attach their ID
    });

    return res.status(201).json({
      success: result.success,
      message: result.message,
      data: {
        totalFollowers: result.totalFollowers,
        isDuplicate: result.isDuplicate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/followers/count
 * Get total follower count
 * Public endpoint (no auth required)
 * Used by frontend for live counter updates
 */
exports.getFollowerCount = async (req, res, next) => {
  try {
    const count = await followerService.getFollowerCount();

    return res.status(200).json({
      success: true,
      message: 'Follower count retrieved',
      data: {
        totalFollowers: count,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/v1/followers/unsubscribe
 * Unsubscribe a follower
 * Body: { email }
 * Public endpoint (no auth required)
 */
exports.unsubscribeFollower = async (req, res, next) => {
  try {
    const { error, value } = validateFollowerUnsubscription(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return next(new ValidationError('Invalid email format', errors));
    }

    const result = await followerService.unsubscribeFollower(value.email);

    return res.status(200).json({
      success: result.success,
      message: result.message,
      data: {
        totalFollowers: result.totalFollowers,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/followers/stats
 * Get follower statistics (admin only)
 * Protected: Admin role required
 */
exports.getFollowerStats = async (req, res, next) => {
  try {
    // Check if user is admin (middleware should handle, but verify here)
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view follower statistics',
      });
    }

    const stats = await followerService.getFollowerStats();

    return res.status(200).json({
      success: true,
      message: 'Follower statistics retrieved',
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/v1/followers/recent
 * Get recent followers (admin only)
 * Protected: Admin role required
 * Query: ?limit=10
 */
exports.getRecentFollowers = async (req, res, next) => {
  try {
    // Check admin role
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        message: 'Only admins can view followers list',
      });
    }

    const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100
    const recent = await followerService.getRecentFollowers(limit);

    return res.status(200).json({
      success: true,
      message: 'Recent followers retrieved',
      data: {
        followers: recent,
        count: recent.length,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
