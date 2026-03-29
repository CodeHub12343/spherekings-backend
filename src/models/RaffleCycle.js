/**
 * Raffle Cycle Model
 * Tracks each 14-day raffle cycle with statistics and winner information
 * One cycle per bi-weekly period
 */

const mongoose = require('mongoose');

const RaffleCycleSchema = new mongoose.Schema(
  {
    // Cycle Timeline
    startDate: {
      type: Date,
      required: [true, 'Start date is required'],
      index: true,
    },

    endDate: {
      type: Date,
      required: [true, 'End date is required'],
      index: true,
    },

    // Cycle Statistics
    totalEntries: {
      type: Number,
      default: 0,
      min: [0, 'Total entries cannot be negative'],
    },

    totalRevenue: {
      type: Number,
      default: 0, // In cents ($1 = 100 cents per entry)
      min: [0, 'Total revenue cannot be negative'],
    },

    // Winner Information
    winnerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true, // null until winner selected
      index: true,
    },

    winnerEmail: {
      type: String,
      sparse: true,
      lowercase: true,
    },

    winnerShippingAddress: {
      street: String,
      city: String,
      state: String,
      zipCode: String,
      country: String,
    },

    // Status progression: active → drawn → notified → shipped
    status: {
      type: String,
      enum: {
        values: ['active', 'drawn', 'notified', 'shipped'],
        message: 'Status must be active, drawn, notified, or shipped',
      },
      default: 'active',
      index: true,
    },

    // Timeline for winner selection
    selectedAt: {
      type: Date,
      sparse: true,
    },

    notifiedAt: {
      type: Date,
      sparse: true,
    },

    shippedAt: {
      type: Date,
      sparse: true,
    },

    // Record keeping
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
    collection: 'raffle_cycles',
  }
);

// Indexes for performance
RaffleCycleSchema.index({ startDate: 1, endDate: 1 }); // Find cycles by date range
RaffleCycleSchema.index({ status: 1 }); // Find all active cycles

module.exports = mongoose.model('RaffleCycle', RaffleCycleSchema);
