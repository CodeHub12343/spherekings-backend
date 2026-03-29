/**
 * SponsorshipRecord Model
 * Represents a completed sponsorship purchase and tracks delivery
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SponsorshipRecordSchema = new Schema(
  {
    // ==================== SPONSOR INFORMATION ====================
    sponsorName: {
      type: String,
      required: [true, 'Sponsor name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },

    sponsorEmail: {
      type: String,
      required: [true, 'Sponsor email is required'],
      lowercase: true,
      trim: true,
      match: [/^[^\s@]+@[^\s@]+\.[^\s@]+$/, 'Invalid email format'],
      index: true,
    },

    sponsorCompany: {
      type: String,
      default: null,
      trim: true,
      maxlength: [100, 'Company name must not exceed 100 characters'],
    },

    sponsorContact: {
      type: String,
      default: null,
      trim: true,
    },

    // Reference to user account if sponsor is authenticated
    sponsorUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // ==================== SPONSORSHIP TIER ====================
    tierId: {
      type: Schema.Types.ObjectId,
      ref: 'SponsorshipTier',
      required: [true, 'Sponsorship tier is required'],
      index: true,
    },

    // Denormalized tier info for historical accuracy (if tier is updated later)
    tierName: {
      type: String,
      required: true,
      trim: true,
    },

    tierSlug: {
      type: String,
      required: true,
      trim: true,
    },

    // ==================== AMOUNT ====================
    amount: {
      type: Number,
      required: [true, 'Sponsorship amount is required'],
      min: [100, 'Minimum sponsorship is $1'],
    },

    // Currency (default USD)
    currency: {
      type: String,
      default: 'USD',
      enum: ['USD', 'EUR', 'GBP', 'CAD'],
    },

    // Calculated: number of video mentions this sponsor gets
    videoMentions: {
      type: Number,
      required: [true, 'Video mentions required'],
      min: 1,
    },

    // ==================== PAYMENT INFORMATION ====================
    stripeSessionId: {
      type: String,
      required: false,
      sparse: true,
      unique: true,
      index: true,
    },

    stripePaymentIntentId: {
      type: String,
      default: null,
      index: true,
    },

    paymentStatus: {
      type: String,
      enum: {
        values: ['pending', 'completed', 'failed', 'refunded'],
        message: 'Invalid payment status',
      },
      default: 'pending',
      index: true,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    // Optional refund information
    refundedAt: {
      type: Date,
      default: null,
    },

    refundReason: {
      type: String,
      default: null,
    },

    // ==================== DELIVERY TRACKING ====================
    videosCompleted: {
      type: Number,
      default: 0,
      min: 0,
    },

    videosRemaining: {
      type: Number,
      required: true,
    },

    // Auto-set when payment completed
    promotionStartDate: {
      type: Date,
      default: null,
    },

    promotionEndDate: {
      type: Date,
      default: null,
    },

    // Array of posted video links with metadata
    videoLinks: [
      {
        _id: {
          type: Schema.Types.ObjectId,
          default: () => new mongoose.Types.ObjectId(),
        },
        url: {
          type: String,
          required: [true, 'Video URL required'],
          trim: true,
          validate: {
            validator: (v) => /^https?:\/\/.+/.test(v),
            message: 'Invalid URL format',
          },
        },
        platform: {
          type: String,
          enum: ['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Twitch', 'Facebook'],
          required: true,
        },
        title: {
          type: String,
          default: null,
          trim: true,
        },
        description: {
          type: String,
          default: null,
          trim: true,
        },
        postedAt: {
          type: Date,
          required: true,
        },
        // Metrics (optional)
        views: {
          type: Number,
          default: 0,
        },
        likes: {
          type: Number,
          default: 0,
        },
        comments: {
          type: Number,
          default: 0,
        },
        shares: {
          type: Number,
          default: 0,
        },
        duration: {
          // Video duration in seconds
          type: Number,
          default: null,
        },
        // Admin notes on video quality
        adminNotes: {
          type: String,
          default: null,
        },
        verifiedAt: {
          type: Date,
          default: null, // When admin verified video was posted
        },
      },
    ],

    // ==================== STATUS & TRACKING ====================
    status: {
      type: String,
      enum: {
        values: ['pending_payment', 'active', 'in_progress', 'completed', 'overdue', 'failed'],
        message: 'Invalid sponsorship status',
      },
      default: 'pending_payment',
      index: true,
    },

    // If status is 'failed', capture the reason
    failureReason: {
      type: String,
      default: null,
      maxlength: 500,
    },

    // ==================== ADMIN MANAGEMENT ====================
    adminNotes: {
      type: String,
      default: null,
      maxlength: [1000, 'Admin notes must not exceed 1000 characters'],
    },

    // Assigned admin
    assignedTo: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // Track communications
    communications: [
      {
        date: Date,
        message: String,
        sentBy: {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      },
    ],

    // ==================== CAMPAIGN INFO ====================
    campaignCycle: {
      type: String,
      required: true,
      default: 'kickstarter_2026_q2',
      index: true,
    },

    // ==================== TIMESTAMPS ====================
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
    collection: 'sponsorship_records',
  }
);

// Indexes for efficient querying
SponsorshipRecordSchema.index({ sponsorEmail: 1, createdAt: -1 });
SponsorshipRecordSchema.index({ paymentStatus: 1, status: 1 });
SponsorshipRecordSchema.index({ tierName: 1, createdAt: -1 });
SponsorshipRecordSchema.index({ promotionStartDate: 1, promotionEndDate: 1 });

// Virtual: is sponsorship overdue?
SponsorshipRecordSchema.virtual('isOverdue').get(function () {
  if (!this.promotionEndDate) return false;
  return new Date() > this.promotionEndDate && this.videosCompleted < this.videoMentions;
});

// Virtual: progress percentage
SponsorshipRecordSchema.virtual('progressPercentage').get(function () {
  return Math.round((this.videosCompleted / this.videoMentions) * 100);
});

// Pre-save: update videosRemaining
SponsorshipRecordSchema.pre('save', function (next) {
  this.videosRemaining = Math.max(0, this.videoMentions - this.videosCompleted);
  next();
});

// Method to add a video link and update progress
SponsorshipRecordSchema.methods.addVideoLink = function (videoData) {
  this.videoLinks.push({
    url: videoData.url,
    platform: videoData.platform,
    title: videoData.title || null,
    description: videoData.description || null,
    postedAt: videoData.postedAt || new Date(),
    views: videoData.views || 0,
  });
  this.videosCompleted = this.videoLinks.length;
  // Don't call save here - let the caller handle that
  return true;
};

// Method to mark all videos completed
SponsorshipRecordSchema.methods.markComplete = function () {
  this.status = 'completed';
  this.videosCompleted = this.videoMentions;
  return this.save();
};

module.exports = mongoose.model('SponsorshipRecord', SponsorshipRecordSchema);
