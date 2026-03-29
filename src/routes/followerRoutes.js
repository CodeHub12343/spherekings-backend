/**
 * Follower Routes
 * All follower-related API endpoints
 *
 * Public Routes:
 *   POST /api/v1/followers/subscribe  - Subscribe a new follower
 *   GET  /api/v1/followers/count      - Get total follower count
 *   POST /api/v1/followers/unsubscribe - Unsubscribe a follower
 *
 * Admin Routes:
 *   GET  /api/v1/followers/stats      - Get follower statistics
 *   GET  /api/v1/followers/recent     - Get recent followers
 */

const express = require('express');
const router = express.Router();
const followerController = require('../controllers/followerController');
const { authenticateToken } = require('../middlewares/authMiddleware');

/**
 * ===== PUBLIC ROUTES (No authentication) =====
 */

/**
 * POST /api/v1/followers/subscribe
 * Subscribe a new follower
 * Body: { email }
 */
router.post('/subscribe', followerController.subscribeFollower);

/**
 * GET /api/v1/followers/count
 * Get total follower count (used by frontend for live counter)
 */
router.get('/count', followerController.getFollowerCount);

/**
 * POST /api/v1/followers/unsubscribe
 * Unsubscribe a follower
 * Body: { email }
 */
router.post('/unsubscribe', followerController.unsubscribeFollower);

/**
 * ===== ADMIN ROUTES (Authentication required) =====
 */

/**
 * GET /api/v1/followers/stats
 * Get follower statistics (daily, weekly, conversions)
 * Protected: Admin only
 */
router.get('/stats', authenticateToken, followerController.getFollowerStats);

/**
 * GET /api/v1/followers/recent
 * Get list of recent followers
 * Protected: Admin only
 * Query: ?limit=10
 */
router.get('/recent', authenticateToken, followerController.getRecentFollowers);

module.exports = router;
