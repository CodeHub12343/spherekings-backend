/**
 * Follower Model
 * Stores email subscribers who want to follow SphereKings
 * Used for social proof and marketing outreach
 */

const mongoose = require('mongoose');

const FollowerSchema = new mongoose.Schema(
  {
    // Email address of the follower
    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Valid email is required'],
      unique: true, // Prevent duplicate email subscriptions
      sparse: true, // Allow null values if needed
      index: true, // Fast email lookup
    },

    // Optional: User reference if they have account
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      sparse: true, // Optional - they may subscribe without account
      index: true,
    },

    // Subscription status
    status: {
      type: String,
      enum: {
        values: ['subscribed', 'unsubscribed'],
        message: 'Status must be either subscribed or unsubscribed',
      },
      default: 'subscribed',
      index: true,
    },

    // Marketing source (where they signed up)
    source: {
      type: String,
      enum: {
        values: ['landing_page', 'popup', 'affiliate_link', 'admin'],
        message: 'Invalid source',
      },
      default: 'landing_page',
    },

    // Timestamp when they subscribed
    subscribedAt: {
      type: Date,
      default: Date.now,
      index: true, // For analytics: filter by date range
    },

    // Unsubscribe timestamp (if applicable)
    unsubscribedAt: {
      type: Date,
      sparse: true,
    },

    // Track if they converted (became customer)
    becameCustomer: {
      type: Boolean,
      default: false,
      index: true,
    },

    // IP address for fraud detection
    ipAddress: {
      type: String,
      sparse: true,
    },

    // User agent for device tracking
    userAgent: {
      type: String,
      sparse: true,
    },
  },
  {
    timestamps: true, // Adds createdAt, updatedAt automatically
    collection: 'followers',
  }
);

// Compound indexes for analytics
FollowerSchema.index({ status: 1, subscribedAt: -1 }); // Find active followers, sorted by recent
FollowerSchema.index({ email: 1, status: 1 }); // Find specific email and status
FollowerSchema.index({ becameCustomer: 1 }); // Track conversion rate

module.exports = mongoose.model('Follower', FollowerSchema);
