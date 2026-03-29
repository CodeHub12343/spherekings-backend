/**
 * Influencer Routes
 * Routes for influencer application management
 */

const express = require('express');
const router = express.Router();

const influencerController = require('../controllers/influencerController');
const { authenticateToken } = require('../middlewares/authMiddleware');
const { authorize } = require('../middlewares/roleMiddleware');

/**
 * Public Routes
 */

// Submit influencer application
router.post('/apply', influencerController.submitApplication);

/**
 * Protected Routes (Authenticated Users)
 */

// Get current user's application
router.get(
  '/my-application',
  authenticateToken,
  influencerController.getMyApplication
);

// Add content link to application
router.put(
  '/:id/add-content',
  authenticateToken,
  influencerController.addContentLink
);

/**
 * Admin Routes
 */

// List all applications (with filters)
router.get(
  '/applications',
  authenticateToken,
  authorize('admin'),
  influencerController.listApplications
);

// Get single application details
router.get(
  '/applications/:id',
  authenticateToken,
  authorize('admin'),
  influencerController.getApplication
);

// Approve application
router.put(
  '/applications/:id/approve',
  authenticateToken,
  authorize('admin'),
  influencerController.approveApplication
);

// Reject application
router.put(
  '/applications/:id/reject',
  authenticateToken,
  authorize('admin'),
  influencerController.rejectApplication
);

// Assign product to influencer
router.put(
  '/applications/:id/assign-product',
  authenticateToken,
  authorize('admin'),
  influencerController.assignProduct
);

// Update fulfillment status
router.put(
  '/applications/:id/fulfillment',
  authenticateToken,
  authorize('admin'),
  influencerController.updateFulfillmentStatus
);

// Approve content submission
router.put(
  '/applications/:id/approve-content',
  authenticateToken,
  authorize('admin'),
  influencerController.approveContent
);

// Reject content submission
router.put(
  '/applications/:id/reject-content',
  authenticateToken,
  authorize('admin'),
  influencerController.rejectContent
);

module.exports = router;
