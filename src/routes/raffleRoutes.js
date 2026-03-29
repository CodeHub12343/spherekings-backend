/**
 * Raffle Routes
 * All raffle-related API endpoints
 * 
 * Public Routes:
 *   GET  /api/raffle/current-cycle
 *   GET  /api/raffle/winners
 * 
 * Protected Routes (auth required):
 *   POST /api/raffle/entry
 *   GET  /api/raffle/my-entries
 * 
 * Admin Routes (admin role required):
 *   POST /admin/raffle/select-winner
 *   GET  /admin/raffle/stats
 *   GET  /admin/raffle/entries
 *   POST /admin/raffle/mark-shipped
 */

const express = require('express');
const router = express.Router();
const multer = require('multer');
const raffleController = require('../controllers/raffleController');

// Debug: Check what's loaded
console.log('🔍 raffleController methods loaded:', Object.keys(raffleController));

// Middleware
const { authenticateToken } = require('../middlewares/authMiddleware');

// Configure multer for form field parsing (no file storage)
const upload = multer({ storage: multer.memoryStorage() });

/**
 * ===== PUBLIC ROUTES (No authentication) =====
 */

/**
 * GET /api/raffle/current-cycle
 * Get info about current active raffle cycle
 * Returns: startDate, endDate, totalEntries, totalRevenue, daysRemaining
 */
router.get('/current-cycle', raffleController.getRaffleCurrentCycle);

/**
 * GET /api/raffle/winners
 * Get past winners for social proof on landing page
 * Query params: ?limit=10 (max 50)
 * Returns: array of {firstName, announcedAt}
 */
router.get('/winners', raffleController.getRafflePastWinners);

/**
 * ===== PROTECTED ROUTES (Authentication required) =====
 */

/**
 * POST /api/raffle/entry
 * Submit raffle entry and get Stripe checkout session
 * Body: {fullName, email, phone?, shippingAddress: {street, city, state, zipCode, country}}
 * Returns: {entryId, sessionId, stripeCheckoutUrl, entryFee}
 */
console.log('📍 About to register POST /entry. Handler:', typeof raffleController.submitRaffleEntry, raffleController.submitRaffleEntry ? '✓' : '✗');
router.post('/entry', authenticateToken, raffleController.submitRaffleEntry);

/**
 * GET /api/raffle/my-entries
 * Get authenticated user's raffle entries
 * Returns: array of entries with {_id, email, fullName, cyclePeriod, status, createdAt, paidAt}
 */
router.get('/my-entries', authenticateToken, raffleController.getUserRaffleEntries);

/**
 * ===== ADMIN ROUTES (Admin role required) =====
 */

/**
 * POST /admin/raffle/select-winner
 * Manually select winner for current cycle
 * Body: {cycleId}
 * Returns: {winnerId, winnerName, winnerEmail, winnerAddress, totalEntries}
 */
router.post(
  '/admin/select-winner',
  authenticateToken,
  raffleController.selectRaffleWinner
);

/**
 * GET /admin/raffle/stats
 * Get admin dashboard statistics
 * Returns: {currentCycle: {...}, historicalStats: {...}}
 */
router.get('/admin/stats', authenticateToken, raffleController.getRaffleAdminStats);

/**
 * GET /admin/raffle/entries
 * Get all raffle entries with pagination and filters
 * Query params:
 *   - page: page number (default 1)
 *   - limit: results per page (default 20, max 100)
 *   - cycleId: filter by cycle
 *   - status: filter by status (pending|completed)
 *   - search: search by name or email
 * Returns: {entries: [...], pagination: {total, pages, currentPage, perPage}}
 */
router.get(
  '/admin/entries',
  authenticateToken,
  raffleController.getRaffleAdminEntries
);

/**
 * GET /admin/entry/:entryId
 * Get specific raffle entry/winner details
 * Returns: {_id, fullName, email, phone, shippingAddress, status, createdAt, ...}
 */
router.get(
  '/admin/entry/:entryId',
  authenticateToken,
  raffleController.getRaffleWinnerDetails
);

/**
 * GET /api/raffle/p2p-config
 * Get P2P payment instructions configuration
 * Returns: {recipientName, street, city, state, zipCode, country, amount, services}
 */
router.get('/p2p-config', raffleController.getP2PConfig);

/**
 * POST /api/raffle/submit-proof
 * Submit proof of P2P payment (receipt or transaction reference)
 * Body: {entryId, manualPaymentReference?, proofOfPaymentUrl?}
 * Returns: {entryId, paymentStatus, message}
 */
router.post(
  '/submit-proof',
  authenticateToken,
  upload.none(), // Parse FormData fields (no file upload)
  raffleController.submitP2PProof
);

/**
 * POST /admin/raffle/verify-entry
 * Admin verification of P2P raffle entries
 * Body: {entryId, approved: boolean, rejectionReason?: string}
 * Returns: {entryId, paymentStatus, verifiedAt}
 */
router.post(
  '/admin/verify-entry',
  authenticateToken,
  raffleController.verifyP2PEntry
);

module.exports = router;
