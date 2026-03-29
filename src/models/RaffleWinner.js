/**
 * Raffle Winner Model
 * Stores historical record of all winners for public display and auditing
 */

const mongoose = require('mongoose');

const RaffleWinnerSchema = new mongoose.Schema(
  {
    // Cycle Reference
    cycleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RaffleCycle',
      required: [true, 'Cycle ID is required'],
      index: true,
    },

    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Winner Information
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
    },

    fullName: {
      type: String,
      required: [true, 'Full name is required'],
    },

    // Shipping Address for Fulfillment
    shippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Timeline
    announcedAt: {
      type: Date,
      default: Date.now,
    },

    shippedAt: {
      type: Date,
      sparse: true, // null until admin marks shipped
    },

    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
    collection: 'raffle_winners',
  }
);

// Index for finding past winners
RaffleWinnerSchema.index({ announcedAt: -1 }); // Sort by newest first

module.exports = mongoose.model('RaffleWinner', RaffleWinnerSchema);
