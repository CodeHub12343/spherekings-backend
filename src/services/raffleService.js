/**
 * Raffle Service
 * Core business logic for raffle operations
 * Handles entry creation, winner selection, cycle management
 */

const Stripe = require('stripe');
const RaffleEntry = require('../models/RaffleEntry');
const RaffleCycle = require('../models/RaffleCycle');
const RaffleWinner = require('../models/RaffleWinner');
const User = require('../models/User');

let stripe;
try {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
} catch (error) {
  console.warn('⚠️ Warning: Stripe not initialized. STRIPE_SECRET_KEY may be missing.');
  stripe = null;
}

class RaffleService {
  /**
   * Create a new raffle entry and return Stripe checkout session
   * @param {string} userId - User ID from JWT
   * @param {object} entryData - Form data from user
   * @param {string} paymentMethod - Payment method (default: 'stripe')
   * @returns {Promise<{entryId, sessionId, stripeCheckoutUrl, entryFee}>}
   */
  async submitEntry(userId, entryData, paymentMethod = 'stripe') {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
      }

      // Get or create current cycle
      const cycle = await this.getCurrentCycle();

      // Create cycle period string (e.g., "2026-03-24_to_2026-04-07")
      const startStr = cycle.startDate.toISOString().split('T')[0];
      const endStr = cycle.endDate.toISOString().split('T')[0];
      const cyclePeriod = `${startStr}_to_${endStr}`;

      // Create Stripe checkout session (fixed $1 price)
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        mode: 'payment',
        customer_email: entryData.email,
        line_items: [
          {
            price_data: {
              currency: 'usd',
              product_data: {
                name: 'Raffle Entry - Sphere of Kings',
                description: 'Bi-weekly raffle entry fee (shipping & handling)',
                images: [
                  'https://images.unsplash.com/photo-1516975080664-ed2fc6a32937?w=400', // Placeholder
                ],
              },
              unit_amount: 100, // $1.00 in cents
            },
            quantity: 1,
          },
        ],
        metadata: {
          type: 'raffle_entry',
          userId: userId,
          cyclePeriod: cyclePeriod,
        },
        success_url: `${process.env.FRONTEND_URL}/raffle/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.FRONTEND_URL}/raffle/entry`,
      });

      // Create raffle entry in DB (status: pending until payment confirmed)
      const entry = new RaffleEntry({
        userId,
        email: entryData.email,
        fullName: entryData.fullName,
        phone: entryData.phone || null,
        shippingAddress: {
          street: entryData.shippingAddress.street,
          city: entryData.shippingAddress.city,
          state: entryData.shippingAddress.state,
          zipCode: entryData.shippingAddress.zipCode,
          country: entryData.shippingAddress.country,
        },
        paymentMethod: paymentMethod,
        stripeSessionId: session.id,
        // paymentIntentId: will be set by webhook after payment succeeds
        cyclePeriod,
        entryFee: 100,
        status: 'pending',
      });

      await entry.save();

      return {
        entryId: entry._id.toString(),
        sessionId: session.id,
        stripeCheckoutUrl: session.url,
        entryFee: 100,
      };
    } catch (error) {
      console.error('❌ Error submitting raffle entry:', error);
      throw error;
    }
  }

  /**
   * Handle successful payment from Stripe webhook
   * Updates entry status and cycle revenue
   * @param {string} sessionId - Stripe session ID
   * @returns {Promise<{success: boolean, entryId}>}
   */
  async handlePaymentSuccess(sessionId) {
    try {
      if (!stripe) {
        throw new Error('Stripe is not configured. Please set STRIPE_SECRET_KEY environment variable.');
      }

      // Retrieve session from Stripe
      const session = await stripe.checkout.sessions.retrieve(sessionId);

      if (session.payment_status !== 'paid') {
        throw new Error('Payment not confirmed by Stripe');
      }

      // Find and update entry
      const entry = await RaffleEntry.findOneAndUpdate(
        { stripeSessionId: sessionId },
        {
          paymentIntentId: session.payment_intent,
          status: 'completed',
          paidAt: new Date(),
          transactionId: session.payment_intent,
        },
        { new: true }
      );

      if (!entry) {
        throw new Error('Raffle entry not found');
      }

      // Update cycle statistics
      await RaffleCycle.findOneAndUpdate(
        { startDate: { $lte: new Date() }, endDate: { $gte: new Date() } },
        {
          $inc: { totalEntries: 1, totalRevenue: entry.entryFee },
        }
      );

      console.log(`✅ Raffle entry ${entry._id} marked as paid`);

      return {
        success: true,
        entryId: entry._id.toString(),
      };
    } catch (error) {
      console.error('❌ Error handling raffle payment:', error);
      throw error;
    }
  }

  /**
   * Get or create current active raffle cycle
   * Cycles are 14 days long
   * @returns {Promise<RaffleCycle>}
   */
  async getCurrentCycle() {
    try {
      const now = new Date();

      // Find existing active cycle
      let cycle = await RaffleCycle.findOne({
        startDate: { $lte: now },
        endDate: { $gte: now },
      });

      if (cycle) {
        return cycle;
      }

      // Create new cycle if none exists
      // Start date = today at midnight
      const startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());

      // End date = 14 days from start at 11:59:59 PM
      const endDate = new Date(startDate);
      endDate.setDate(endDate.getDate() + 14);
      endDate.setHours(23, 59, 59, 999);

      cycle = new RaffleCycle({
        startDate,
        endDate,
        totalEntries: 0,
        totalRevenue: 0,
        status: 'active',
      });

      await cycle.save();
      console.log(`✅ Created new raffle cycle: ${startDate.toDateString()} to ${endDate.toDateString()}`);

      return cycle;
    } catch (error) {
      console.error('❌ Error getting/creating raffle cycle:', error);
      throw error;
    }
  }

  /**
   * Randomly select a winner from current cycle
   * Called by admin when ready to pick winner
   * @param {string} cycleId - The cycle to select winner from
   * @returns {Promise<{winnerId, winnerEmail, winnerName, winnerAddress}>}
   */
  async selectWinner(cycleId) {
    try {
      // Verify cycle exists and is active
      const cycle = await RaffleCycle.findById(cycleId);
      if (!cycle) {
        throw new Error('Raffle cycle not found');
      }

      if (cycle.status !== 'active') {
        throw new Error('Can only select winner from active cycles');
      }

      // Get all paid entries from this cycle
      const entries = await RaffleEntry.find({
        cyclePeriod: (() => {
          const start = cycle.startDate.toISOString().split('T')[0];
          const end = cycle.endDate.toISOString().split('T')[0];
          return `${start}_to_${end}`;
        })(),
        status: 'completed',
      });

      if (entries.length === 0) {
        throw new Error('No completed entries in this cycle');
      }

      // Random selection
      const randomIndex = Math.floor(Math.random() * entries.length);
      const winningEntry = entries[randomIndex];

      // Update cycle with winner
      cycle.winnerId = winningEntry.userId;
      cycle.winnerEmail = winningEntry.email;
      cycle.winnerShippingAddress = winningEntry.shippingAddress;
      cycle.status = 'drawn';
      cycle.selectedAt = new Date();
      await cycle.save();

      // Create winner record
      const winner = new RaffleWinner({
        cycleId: cycle._id,
        userId: winningEntry.userId,
        email: winningEntry.email,
        fullName: winningEntry.fullName,
        shippingAddress: winningEntry.shippingAddress,
        announcedAt: new Date(),
      });
      await winner.save();

      console.log(`✅ Winner selected: ${winningEntry.fullName} (${entries.length} total entries)`);

      return {
        winnerId: winningEntry.userId.toString(),
        winnerEmail: winningEntry.email,
        winnerName: winningEntry.fullName,
        winnerPhone: winningEntry.phone,
        winnerAddress: winningEntry.shippingAddress,
        totalEntries: entries.length,
      };
    } catch (error) {
      console.error('❌ Error selecting winner:', error);
      throw error;
    }
  }

  /**
   * Get all past winners for public display
   * @param {number} limit - How many to return (default 10)
   * @returns {Promise<Array>}
   */
  async getPastWinners(limit = 10) {
    try {
      const winners = await RaffleWinner.find()
        .sort({ announcedAt: -1 })
        .limit(limit)
        .select('fullName announcedAt');

      // Anonymize full names (show first name + last initial)
      return winners.map((w) => ({
        firstName: w.fullName.split(' ')[0] || 'Winner',
        announcedAt: w.announcedAt,
      }));
    } catch (error) {
      console.error('❌ Error getting past winners:', error);
      throw error;
    }
  }

  /**
   * Get raffle statistics for admin dashboard
   * @returns {Promise<{currentCycle, historicalStats}>}
   */
  async getAdminStats() {
    try {
      const cycle = await this.getCurrentCycle();

      const historicalStats = await RaffleCycle.aggregate([
        {
          $group: {
            _id: null,
            totalWinners: { $sum: 1 },
            totalRevenue: { $sum: '$totalRevenue' },
            averageEntries: { $avg: '$totalEntries' },
          },
        },
      ]);

      const stats = historicalStats[0] || {
        totalWinners: 0,
        totalRevenue: 0,
        averageEntries: 0,
      };

      const daysRemaining = Math.ceil(
        (cycle.endDate - new Date()) / (1000 * 60 * 60 * 24)
      );

      return {
        currentCycle: {
          _id: cycle._id.toString(),
          startDate: cycle.startDate,
          endDate: cycle.endDate,
          totalEntries: cycle.totalEntries,
          totalRevenue: cycle.totalRevenue,
          winnerId: cycle.winnerId?.toString() || null,
          status: cycle.status,
          daysRemaining: Math.max(0, daysRemaining),
        },
        historicalStats: {
          totalWinners: stats.totalWinners,
          totalRevenue: (stats.totalRevenue / 100).toFixed(2), // Convert cents to dollars
          averageEntries: Math.round(stats.averageEntries),
        },
      };
    } catch (error) {
      console.error('❌ Error getting admin stats:', error);
      throw error;
    }
  }

  /**
   * Get entries for admin management
   * @param {object} filters - { cycleId, status, search }
   * @param {number} page - Pagination page number
   * @param {number} limit - Results per page
   * @returns {Promise<{entries, total, pages}>}
   */
  async getAdminEntries(filters = {}, page = 1, limit = 20) {
    try {
      const query = {};

      if (filters.cycleId) {
        const cycle = await RaffleCycle.findById(filters.cycleId);
        if (cycle) {
          const start = cycle.startDate.toISOString().split('T')[0];
          const end = cycle.endDate.toISOString().split('T')[0];
          query.cyclePeriod = `${start}_to_${end}`;
        }
      }

      if (filters.status) {
        query.status = filters.status;
      }

      if (filters.search) {
        query.$or = [
          { fullName: { $regex: filters.search, $options: 'i' } },
          { email: { $regex: filters.search, $options: 'i' } },
        ];
      }

      const total = await RaffleEntry.countDocuments(query);
      const pages = Math.ceil(total / limit);

      const entries = await RaffleEntry.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .select('-stripeSessionId -paymentIntentId'); // Keep sensitive data hidden

      return {
        entries,
        total,
        pages,
        currentPage: page,
      };
    } catch (error) {
      console.error('❌ Error getting admin entries:', error);
      throw error;
    }
  }

  /**
   * Get user's raffle entries
   * @param {string} userId - User ID
   * @returns {Promise<Array>}
   */
  async getUserRaffleEntries(userId) {
    try {
      const entries = await RaffleEntry.find({ userId })
        .sort({ createdAt: -1 })
        .select('-stripeSessionId -paymentIntentId -transactionId');

      return entries;
    } catch (error) {
      console.error('❌ Error getting user entries:', error);
      throw error;
    }
  }

  /**
   * Mark winner as shipped
   * @param {string} winnerId - RaffleWinner ID
   * @returns {Promise<{success: boolean}>}
   */
  async markWinnerShipped(winnerId) {
    try {
      const winner = await RaffleWinner.findByIdAndUpdate(
        winnerId,
        { shippedAt: new Date() },
        { new: true }
      );

      // Also update cycle
      await RaffleCycle.findByIdAndUpdate(winner.cycleId, {
        status: 'shipped',
        shippedAt: new Date(),
      });

      console.log(`✅ Winner marked as shipped: ${winner.fullName}`);

      return { success: true };
    } catch (error) {
      console.error('❌ Error marking winner shipped:', error);
      throw error;
    }
  }

  /**
   * Stub: Send winner notification email
   * Phase 2: Replace with actual Nodemailer/SendGrid
   * @param {object} cycle - RaffleCycle document
   * @returns {Promise<{success: boolean}>}
   */
  async notifyWinner(cycle) {
    try {
      const winner = await RaffleWinner.findOne({ cycleId: cycle._id });

      if (!winner) {
        throw new Error('Winner not found');
      }

      console.log(`
        📧 WINNER NOTIFICATION EMAIL (STUB)
        To: ${winner.email}
        Name: ${winner.fullName}
        Subject: Congratulations! You Won a FREE Sphere of Kings Board!
        
        Dear ${winner.fullName},
        
        You have been selected as the winner of our bi-weekly raffle!
        
        A FREE Sphere of Kings board game will be shipped to:
        ${winner.shippingAddress.street}
        ${winner.shippingAddress.city}, ${winner.shippingAddress.state} ${winner.shippingAddress.zipCode}
        ${winner.shippingAddress.country}
        
        Shipping will begin within 5 business days.
        
        Thank you for entering!
        
        Best regards,
        The SphereKings Team
      `);

      // Update cycle status
      cycle.status = 'notified';
      cycle.notifiedAt = new Date();
      await cycle.save();

      return { success: true, notified: true };
    } catch (error) {
      console.error('❌ Error notifying winner:', error);
      throw error;
    }
  }

  /**
   * Create a new P2P raffle entry (non-Stripe payment)
   * @param {string} userId - User ID from JWT
   * @param {object} entryData - Form data from user
   * @param {string} paymentMethod - P2P method (wise, sendwave, western_union, worldremit)
   * @returns {Promise<{entryId, paymentMethod, status}>}
   */
  async submitP2PEntry(userId, entryData, paymentMethod) {
    try {
      // Get or create current cycle
      const cycle = await this.getCurrentCycle();

      // Create cycle period string
      const startStr = cycle.startDate.toISOString().split('T')[0];
      const endStr = cycle.endDate.toISOString().split('T')[0];
      const cyclePeriod = `${startStr}_to_${endStr}`;

      // Create raffle entry with P2P payment method
      const entry = new RaffleEntry({
        userId,
        email: entryData.email,
        fullName: entryData.fullName,
        phone: entryData.phone || null,
        shippingAddress: {
          street: entryData.shippingAddress.street,
          city: entryData.shippingAddress.city,
          state: entryData.shippingAddress.state,
          zipCode: entryData.shippingAddress.zipCode,
          country: entryData.shippingAddress.country,
        },
        // New P2P fields
        paymentMethod: paymentMethod, // wise, sendwave, western_union, worldremit
        paymentStatus: 'pending', // pending_verification after proof submitted
        cyclePeriod,
        entryFee: 100,
        status: 'pending', // Legacy field
      });

      await entry.save();

      return {
        entryId: entry._id.toString(),
        paymentMethod: paymentMethod,
        paymentStatus: 'pending',
        message: 'Entry created. Please proceed to payment instructions.',
      };
    } catch (error) {
      console.error('❌ Error submitting P2P entry:', error);
      throw error;
    }
  }

  /**
   * Submit proof of P2P payment
   * @param {string} userId - User ID
   * @param {string} entryId - Raffle entry ID
   * @param {string} manualPaymentReference - Transaction ID or reference
   * @param {string} proofOfPaymentUrl - URL to payment proof/receipt
   * @returns {Promise<{entryId, paymentStatus, message}>}
   */
  async submitP2PProof(userId, entryId, manualPaymentReference, proofOfPaymentUrl) {
    try {
      const entry = await RaffleEntry.findById(entryId);

      if (!entry) {
        throw new Error('Raffle entry not found');
      }

      if (entry.userId.toString() !== userId.toString()) {
        throw new Error('Unauthorized: You can only submit proof for your own entries');
      }

      if (entry.paymentStatus === 'approved' || entry.paymentStatus === 'rejected') {
        throw new Error('This entry has already been verified');
      }

      // Update entry with proof
      entry.manualPaymentReference = manualPaymentReference || null;
      entry.proofOfPaymentUrl = proofOfPaymentUrl || null;
      entry.paymentStatus = 'pending_verification';

      await entry.save();

      // Increment cycle entry count when proof is submitted
      const cycle = await RaffleCycle.findOne({ 'cyclePeriod': entry.cyclePeriod });
      if (cycle) {
        cycle.totalEntries += 1;
        cycle.totalRevenue += entry.entryFee;
        await cycle.save();
      }

      return {
        entryId: entry._id.toString(),
        paymentStatus: 'pending_verification',
        message: 'Payment proof submitted. Pending admin verification.',
      };
    } catch (error) {
      console.error('❌ Error submitting P2P proof:',error);
      throw error;
    }
  }

  /**
   * Admin verification of P2P entries
   * @param {string} entryId - Raffle entry ID
   * @param {string} adminId - Admin user ID
   * @param {boolean} approved - Whether to approve or reject
   * @param {string} rejectionReason - Reason if rejected
   * @returns {Promise<{entryId, paymentStatus, verifiedAt}>}
   */
  async verifyP2PEntry(entryId, adminId, approved, rejectionReason) {
    try {
      const entry = await RaffleEntry.findById(entryId);

      if (!entry) {
        throw new Error('Raffle entry not found');
      }

      if (entry.paymentStatus !== 'pending_verification') {
        throw new Error('Entry is not pending verification');
      }

      if (approved) {
        entry.paymentStatus = 'approved';
        entry.paymentIntentId = `manual_${entryId}_${Date.now()}`; // Create pseudo-payment ID
        entry.paidAt = new Date();
        entry.verifiedBy = adminId;
        entry.verifiedAt = new Date();
      } else {
        entry.paymentStatus = 'rejected';
        entry.rejectionReason = rejectionReason || 'Payment proof rejected by admin';
        entry.verifiedBy = adminId;
        entry.verifiedAt = new Date();
      }

      await entry.save();

      return {
        entryId: entry._id.toString(),
        paymentStatus: entry.paymentStatus,
        verifiedAt: entry.verifiedAt,
      };
    } catch (error) {
      console.error('❌ Error verifying P2P entry:', error);
      throw error;
    }
  }
}

module.exports = new RaffleService();
