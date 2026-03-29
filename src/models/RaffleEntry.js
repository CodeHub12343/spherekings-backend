/**
 * Raffle Entry Model
 * Stores individual raffle entries with user info, shipping address, and payment details
 * Each $1 entry creates one document
 */

const mongoose = require('mongoose');

const RaffleEntrySchema = new mongoose.Schema(
  {
    // User Reference
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      index: true,
    },

    // Contact Information
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Valid email is required'],
      index: true,
    },

    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      minlength: [2, 'Full name must be at least 2 characters'],
      maxlength: [100, 'Full name cannot exceed 100 characters'],
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
      sparse: true, // Optional field
    },

    // Shipping Address (required for fulfillment)
    shippingAddress: {
      street: {
        type: String,
        required: [true, 'Street address is required'],
        trim: true,
      },
      city: {
        type: String,
        required: [true, 'City is required'],
        trim: true,
      },
      state: {
        type: String,
        required: [true, 'State is required'],
        trim: true,
      },
      zipCode: {
        type: String,
        required: [true, 'ZIP code is required'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
      },
    },

    // Payment Method Selection
    paymentMethod: {
      type: String,
      enum: {
        values: ['stripe', 'wise', 'sendwave', 'western_union', 'worldremit'],
        message: 'Payment method must be one of: stripe, wise, sendwave, western_union, worldremit',
      },
      default: 'stripe',
      required: [true, 'Payment method is required'],
      index: true,
    },

    // Payment Status Tracking (NEW: supports both Stripe and P2P)
    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'paid', 'pending_verification', 'approved', 'rejected'],
        message: 'Payment status must be one of: pending, paid, pending_verification, approved, rejected',
      },
      default: 'pending',
      index: true,
    },

    // Payment Details (from Stripe - only used if paymentMethod === 'stripe')
    stripeSessionId: {
      type: String,
      unique: true, // Prevent duplicate charges
      sparse: true,
      index: true,
    },

    paymentIntentId: {
      type: String,
      sparse: true, // Optional - set during webhook after payment succeeds
      index: true,
    },

    // P2P Payment Details (only used if paymentMethod !== 'stripe')
    manualPaymentReference: {
      type: String,
      sparse: true, // Transaction ID or reference from user
      trim: true,
    },

    proofOfPaymentUrl: {
      type: String,
      sparse: true, // URL to uploaded receipt/proof image
    },

    // Admin Verification Fields (for P2P entries)
    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true, // Only set when admin verifies
    },

    verifiedAt: {
      type: Date,
      sparse: true, // Only set when admin verifies
    },

    rejectionReason: {
      type: String,
      sparse: true, // Only set if entry rejected
      trim: true,
    },

    // Raffle Tracking
    cyclePeriod: {
      type: String,
      required: [true, 'Cycle period is required'],
      // Format: "2026-03-24_to_2026-04-07"
      index: true,
    },

    entryFee: {
      type: Number,
      default: 100, // $1.00 in cents
      min: [100, 'Entry fee must be at least $1'],
      max: [100, 'Entry fee must be exactly $1'],
    },

    // Legacy status field (kept for backward compatibility)
    // New flow uses paymentStatus instead
    status: {
      type: String,
      enum: {
        values: ['pending', 'completed'],
        message: 'Status must be either pending or completed',
      },
      default: 'pending',
      index: true,
    },

    // Timestamps
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    paidAt: {
      type: Date,
      sparse: true, // null until payment verified
    },
  },
  {
    timestamps: true,
    collection: 'raffle_entries',
  }
);

// Indexes for performance
RaffleEntrySchema.index({ userId: 1, cyclePeriod: 1 }); // Find user entries by cycle
RaffleEntrySchema.index({ cyclePeriod: 1, paymentStatus: 1 }); // Find entries by cycle and payment status
RaffleEntrySchema.index({ cyclePeriod: 1, status: 1 }); // Legacy index for backward compat
RaffleEntrySchema.index({ email: 1 }); // Search by email
RaffleEntrySchema.index({ paymentMethod: 1, paymentStatus: 1 }); // Filter P2P entries by status
RaffleEntrySchema.index({ verifiedAt: 1 }); // Recently verified entries

module.exports = mongoose.model('RaffleEntry', RaffleEntrySchema);
