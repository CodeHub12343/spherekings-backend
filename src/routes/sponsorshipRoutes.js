/**
 * Sponsorship Routes
 * Routes for sponsorship tier management and purchases
 */

const express = require('express');
const router = express.Router();

const sponsorshipController = require('../controllers/sponsorshipController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Public Routes
 */

// Get all sponsorship tiers
router.get('/tiers', sponsorshipController.getTiers);

// Get single tier
router.get('/tiers/:id', sponsorshipController.getTier);

/**
 * Protected Routes (Authenticated Users)
 */

// Initiate sponsorship purchase (create Stripe checkout)
router.post(
  '/purchase',
  authenticateToken,
  sponsorshipController.initiatePurchase
);

// Get user's sponsorships
router.get(
  '/my-sponsorships',
  authenticateToken,
  sponsorshipController.getMySponsorships
);

/**
 * Admin Routes
 */

// List all sponsorship records
router.get(
  '/records',
  authenticateToken,
  authorize('admin'),
  sponsorshipController.listRecords
);

// Get single record
router.get(
  '/records/:id',
  authenticateToken,
  sponsorshipController.getRecord
);

// Add video link to sponsorship
router.put(
  '/records/:id/add-video',
  authenticateToken,
  authorize('admin'),
  sponsorshipController.addVideoLink
);

// Update sponsorship status
router.put(
  '/records/:id/status',
  authenticateToken,
  authorize('admin'),
  sponsorshipController.updateStatus
);

// Create new tier
router.post(
  '/tiers',
  authenticateToken,
  authorize('admin'),
  sponsorshipController.createTier
);

// Update tier
router.put(
  '/tiers/:id',
  authenticateToken,
  authorize('admin'),
  sponsorshipController.updateTier
);

module.exports = router;
