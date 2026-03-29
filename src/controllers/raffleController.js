/**
 * Raffle Controller
 * HTTP request handlers for raffle operations
 */

const raffleService = require('../services/raffleService');
const { validateRaffleEntry, validateWinnerSelection } = require('../validators/raffleValidator');
const { ValidationError, NotFoundError, ForbiddenError } = require('../utils/errors');

/**
 * POST /api/raffle/entry
 * Submit a raffle entry with payment method selection
 * Supports both Stripe and P2P payment methods
 * Protected: User must be authenticated
 */
exports.submitRaffleEntry = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { error, value } = validateRaffleEntry(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return next(new ValidationError('Invalid entry data', errors));
    }

    // Determine payment method (default: stripe for backward compatibility)
    const paymentMethod = value.paymentMethod || 'stripe';

    if (paymentMethod === 'stripe') {
      // Existing Stripe flow
      const result = await raffleService.submitEntry(userId, value, paymentMethod);
      return res.status(201).json({
        success: true,
        message: 'Raffle entry created. Redirecting to payment...',
        data: result,
      });
    } else {
      // New P2P payment flow
      const result = await raffleService.submitP2PEntry(userId, value, paymentMethod);
      return res.status(201).json({
        success: true,
        message: 'Raffle entry created. Proceed to payment instructions...',
        data: result,
      });
    }
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/raffle/current-cycle
 * Get information about the current active raffle cycle
 * Public: No authentication required
 */
exports.getRaffleCurrentCycle = async (req, res, next) => {
  try {
    const cycle = await raffleService.getCurrentCycle();

    const daysRemaining = Math.ceil(
      (cycle.endDate - new Date()) / (1000 * 60 * 60 * 24)
    );

    return res.json({
      success: true,
      data: {
        _id: cycle._id.toString(),
        startDate: cycle.startDate,
        endDate: cycle.endDate,
        totalEntries: cycle.totalEntries,
        totalRevenue: (cycle.totalRevenue / 100).toFixed(2),
        status: cycle.status,
        daysRemaining: Math.max(0, daysRemaining),
        drawDate: cycle.endDate,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/raffle/winners
 * Get past winners for social proof on landing page
 * Public: No authentication required
 */
exports.getRafflePastWinners = async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 10, 50);
    const winners = await raffleService.getPastWinners(limit);

    return res.json({
      success: true,
      data: winners,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/raffle/my-entries
 * Get authenticated user's raffle entries
 * Protected: User must be authenticated
 */
exports.getUserRaffleEntries = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const entries = await raffleService.getUserRaffleEntries(userId);

    return res.json({
      success: true,
      data: entries.map((entry) => ({
        _id: entry._id.toString(),
        email: entry.email,
        fullName: entry.fullName,
        cyclePeriod: entry.cyclePeriod,
        status: entry.status,
        createdAt: entry.createdAt,
        paidAt: entry.paidAt,
      })),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/raffle/select-winner
 * Manually select winner for a raffle cycle
 * Protected: Admin role required
 */
exports.selectRaffleWinner = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return next(new ForbiddenError('Only admins can select raffle winners'));
    }

    const { error, value } = validateWinnerSelection(req.body);

    if (error) {
      const errors = error.details.reduce((acc, err) => {
        acc[err.path[0]] = err.message;
        return acc;
      }, {});
      return next(new ValidationError('Invalid request', errors));
    }

    const result = await raffleService.selectWinner(value.cycleId);

    // Send winner notification (stub for Phase 2)
    const cycle = await require('../models/RaffleCycle').findById(value.cycleId);
    await raffleService.notifyWinner(cycle);

    return res.status(200).json({
      success: true,
      message: 'Winner selected successfully!',
      data: {
        winnerId: result.winnerId,
        winnerName: result.winnerName,
        winnerEmail: result.winnerEmail,
        winnerPhone: result.winnerPhone,
        winnerAddress: result.winnerAddress,
        totalEntries: result.totalEntries,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/raffle/stats
 * Get admin dashboard statistics for raffle
 * Protected: Admin role required
 */
exports.getRaffleAdminStats = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return next(new ForbiddenError('Only admins can access raffle stats'));
    }

    const stats = await raffleService.getAdminStats();

    return res.json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/raffle/entries
 * Get all raffle entries with filtering and pagination
 * Protected: Admin role required
 */
exports.getRaffleAdminEntries = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return next(new ForbiddenError('Only admins can access raffle entries'));
    }

    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(parseInt(req.query.limit) || 20, 100);
    const filters = {
      cycleId: req.query.cycleId,
      status: req.query.status,
      search: req.query.search,
    };

    const result = await raffleService.getAdminEntries(filters, page, limit);

    return res.json({
      success: true,
      data: result.entries,
      pagination: {
        total: result.total,
        pages: result.pages,
        currentPage: result.currentPage,
        perPage: limit,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /admin/raffle/mark-shipped
 * Mark a winner as shipped
 * Protected: Admin role required
 */
exports.markWinnerShipped = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return next(new ForbiddenError('Only admins can mark winners shipped'));
    }

    const { winnerId } = req.body;

    if (!winnerId) {
      return next(new ValidationError('Winner ID is required'));
    }

    await raffleService.markWinnerShipped(winnerId);

    return res.json({
      success: true,
      message: 'Winner marked as shipped',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /admin/entry/:entryId
 * Get specific raffle entry/winner details
 * Protected: Admin role required
 */
exports.getRaffleWinnerDetails = async (req, res, next) => {
  try {
    // Verify admin role
    if (req.user.role !== 'admin') {
      return next(new ForbiddenError('Only admins can access entry details'));
    }

    const { entryId } = req.params;

    if (!entryId) {
      return next(new ValidationError('Entry ID is required'));
    }

    // Get the RaffleEntry with full details
    const RaffleEntry = require('../models/RaffleEntry');
    const entry = await RaffleEntry.findById(entryId).lean();

    if (!entry) {
      return next(new NotFoundError('Raffle entry not found'));
    }

    // Format the response with all details
    return res.json({
      success: true,
      data: {
        _id: entry._id.toString(),
        fullName: entry.fullName,
        email: entry.email,
        phone: entry.phone || 'Not provided',
        shippingAddress: {
          fullName: entry.fullName, // Use fullName for address
          street: entry.shippingAddress.street,
          city: entry.shippingAddress.city,
          state: entry.shippingAddress.state,
          zipCode: entry.shippingAddress.zipCode,
          country: entry.shippingAddress.country,
          phone: entry.phone || 'Not provided',
        },
        status: entry.status,
        cyclePeriod: entry.cyclePeriod,
        entryFee: entry.entryFee,
        prizeValue: entry.entryFee, // Entry fee is the prize value
        createdAt: entry.createdAt,
        paidAt: entry.paidAt,
        stripeSessionId: entry.stripeSessionId,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/raffle/webhook
 * Stripe webhook for raffle payment completion
 * Webhook: checkout.session.completed event
 */
exports.handleStripeWebhook = async (req, res, next) => {
  try {
    // Get verified event from middleware
    const event = req.event;

    console.log('📨 [RAFFLE WEBHOOK] Event received:', {
      type: event?.type,
      eventId: event?.id,
      timestamp: new Date().toISOString()
    });

    if (!event) {
      console.error('❌ [RAFFLE WEBHOOK] No verified event in request');
      return next(new ValidationError('No verified Stripe event in request'));
    }

    // Only process checkout.session.completed events
    if (event.type === 'checkout.session.completed') {
      console.log('✅ [RAFFLE WEBHOOK] Processing checkout.session.completed event');
      
      const sessionData = event.data?.object;
      console.log('📋 [RAFFLE WEBHOOK] Session data:', {
        sessionId: sessionData?.id,
        metadata: sessionData?.metadata,
        paymentStatus: sessionData?.payment_status
      });

      // Check if this is a raffle payment (metadata.type === 'raffle_entry')
      if (sessionData?.metadata?.type !== 'raffle_entry') {
        console.log('⏭️  [RAFFLE WEBHOOK] Skipping non-raffle webhook');
        return res.status(200).json({ received: true, reason: 'not_raffle' });
      }

      // Call raffle service to handle payment
      try {
        const result = await raffleService.handlePaymentSuccess(sessionData.id);

        console.log('✅ [RAFFLE WEBHOOK] Raffle entry payment processed:', {
          entryId: result.entryId,
          success: result.success
        });

        return res.status(200).json({
          received: true,
          entryId: result.entryId,
          message: 'Raffle entry payment processed'
        });
      } catch (serviceError) {
        console.error('❌ [RAFFLE WEBHOOK] Error in handlePaymentSuccess:', {
          name: serviceError.name,
          message: serviceError.message,
          stack: serviceError.stack
        });

        // Still return 200 to prevent Stripe retry, but log the error
        return res.status(200).json({
          received: true,
          error: serviceError.message,
          processed: false
        });
      }
    } else {
      console.log(`⏭️  [RAFFLE WEBHOOK] Skipping event type: ${event.type}`);
      return res.status(200).json({ received: true, reason: `event_type_${event.type}` });
    }
  } catch (error) {
    console.error('❌ [RAFFLE WEBHOOK] Unexpected error:', error);
    return res.status(200).json({
      received: true,
      error: error.message
    });
  }
};

/**
 * POST /api/raffle/submit-proof
 * Submit proof of P2P payment (receipt screenshot or transaction reference)
 * Protected: User must be authenticated
 */
exports.submitP2PProof = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { entryId, manualPaymentReference, proofOfPaymentUrl } = req.body;

    if (!entryId) {
      return next(new ValidationError('Entry ID is required', { entryId: 'Required' }));
    }

    const result = await raffleService.submitP2PProof(
      userId,
      entryId,
      manualPaymentReference,
      proofOfPaymentUrl
    );

    return res.status(200).json({
      success: true,
      message: 'Payment proof submitted. Your entry is pending verification.',
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/raffle/admin/verify-entry
 * Admin verification of P2P raffle entries
 * Protected: Admin role required
 */
exports.verifyP2PEntry = async (req, res, next) => {
  try {
    if (req.user.role !== 'admin') {
      return next(new ForbiddenError('Only admins can verify entries'));
    }

    const { entryId, approved, rejectionReason } = req.body;

    if (!entryId) {
      return next(new ValidationError('Entry ID is required', { entryId: 'Required' }));
    }

    if (approved === undefined) {
      return next(new ValidationError('Approval decision is required', { approved: 'Required' }));
    }

    const result = await raffleService.verifyP2PEntry(
      entryId,
      req.user._id,
      approved,
      rejectionReason
    );

    return res.status(200).json({
      success: true,
      message: `Entry ${approved ? 'approved' : 'rejected'} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/raffle/p2p-config
 * Get P2P payment instructions configuration
 * Public: No authentication required
 */
exports.getP2PConfig = async (req, res, next) => {
  try {
    const config = {
      recipientName: process.env.P2P_RECIPIENT_NAME || 'James Scott Bowser',
      recipientPhone: process.env.P2P_RECIPIENT_PHONE || '',
      street: process.env.P2P_STREET || '409 Broadway Ave Apt B',
      city: process.env.P2P_CITY || 'Modesto',
      state: process.env.P2P_STATE || 'California',
      zipCode: process.env.P2P_ZIP || '95351',
      country: process.env.P2P_COUNTRY || 'USA',
      amount: '$1 USD',
      services: ['Wise', 'Sendwave', 'Western Union', 'WorldRemit'],
    };

    return res.json({
      success: true,
      data: config,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = exports;
