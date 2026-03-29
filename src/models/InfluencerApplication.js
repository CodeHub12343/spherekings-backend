/**
 * InfluencerApplication Model
 * Represents an influencer's application for product exchange program
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const InfluencerApplicationSchema = new Schema(
  {
    // User Reference (optional - allows unauthenticated submissions)
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },

    // ==================== BASIC INFORMATION ====================
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters'],
      maxlength: [100, 'Name must not exceed 100 characters'],
    },

    email: {
      type: String,
      required: [true, 'Email is required'],
      lowercase: true,
      trim: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please provide a valid email address',
      ],
      index: true,
    },

    // ==================== SOCIAL MEDIA ====================
    platforms: {
      type: [
        {
          type: String,
          enum: ['TikTok', 'Instagram', 'YouTube', 'Twitter', 'Twitch', 'Facebook', 'LinkedIn'],
        },
      ],
      required: [true, 'At least one platform is required'],
      validate: {
        validator: (v) => v.length > 0,
        message: 'At least one social media platform is required',
      },
    },

    socialHandles: {
      tiktok: {
        type: String,
        trim: true,
        default: null,
      },
      instagram: {
        type: String,
        trim: true,
        default: null,
      },
      youtube: {
        type: String,
        trim: true,
        default: null,
      },
      twitter: {
        type: String,
        trim: true,
        default: null,
      },
      twitch: {
        type: String,
        trim: true,
        default: null,
      },
      facebook: {
        type: String,
        trim: true,
        default: null,
      },
      linkedin: {
        type: String,
        trim: true,
        default: null,
      },
    },

    followerCount: {
      type: Number,
      required: [true, 'Follower count is required'],
      min: [100, 'Follower count must be at least 100'],
      max: [100000000, 'Follower count seems too high'],
    },

    averageEngagementRate: {
      type: Number,
      default: null, // Optional - influencer can provide if known
      min: 0,
      max: 100,
    },

    // ==================== SHIPPING ADDRESS ====================
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
        required: [true, 'State/Province is required'],
        trim: true,
      },
      postalCode: {
        type: String,
        required: [true, 'Postal/Zip code is required'],
        trim: true,
      },
      country: {
        type: String,
        required: [true, 'Country is required'],
        trim: true,
      },
    },

    phoneNumber: {
      type: String,
      trim: true,
      default: null,
      validate: {
        validator: function (v) {
          // Allow empty or valid phone format
          return !v || /^\+?[\d\s\-()]{10,}$/.test(v);
        },
        message: 'Phone number format is invalid',
      },
    },

    // ==================== CONTENT COMMITMENT ====================
    contentCommitment: {
      type: String,
      enum: {
        values: ['videos_per_day', 'total_videos'],
        message: 'Invalid content commitment type',
      },
      required: [true, 'Content commitment is required'],
    },

    videosPerDay: {
      type: Number,
      default: 1,
      min: 1,
      max: 10,
    },

    totalVideos: {
      type: Number,
      required: [true, 'Total videos required is calculated from follower count'],
      min: 1,
      max: 100,
    },

    // ==================== STATUS & APPROVAL ====================
    status: {
      type: String,
      enum: {
        values: ['pending', 'approved', 'rejected'],
        message: 'Invalid status value',
      },
      default: 'pending',
      index: true,
    },

    approvalNotes: {
      type: String,
      default: null,
      maxlength: [500, 'Approval notes exceed maximum length'],
    },

    rejectionReason: {
      type: String,
      default: null,
      maxlength: [500, 'Rejection reason exceeds maximum length'],
    },

    approvedAt: {
      type: Date,
      default: null,
    },

    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },

    // ==================== PRODUCT ASSIGNMENT ====================
    productAssigned: {
      type: Schema.Types.ObjectId,
      ref: 'Product',
      default: null,
      index: true,
    },

    fulfillmentStatus: {
      type: String,
      enum: {
        values: ['pending', 'processing', 'shipped', 'delivered'],
        message: 'Invalid fulfillment status',
      },
      default: 'pending',
    },

    trackingNumber: {
      type: String,
      default: null,
      trim: true,
    },

    shippedAt: {
      type: Date,
      default: null,
    },

    deliveredAt: {
      type: Date,
      default: null,
    },

    // ==================== CONTENT DELIVERABLES ====================
    contentLinks: [
      {
        url: {
          type: String,
          required: true,
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
        },
        postedAt: {
          type: Date,
          required: true,
        },
        addedAt: {
          type: Date,
          default: () => new Date(),
        },
        views: {
          type: Number,
          default: 0,
        },
      },
    ],

    videosDelivered: {
      type: Number,
      default: 0,
      min: 0,
    },

    // ==================== CONTENT APPROVAL ====================
    contentApproved: {
      type: Boolean,
      default: false,
    },

    contentApprovedAt: {
      type: Date,
      default: null,
    },

    contentApprovalNotes: {
      type: String,
      default: null,
    },

    contentRejected: {
      type: Boolean,
      default: false,
    },

    contentRejectedAt: {
      type: Date,
      default: null,
    },

    contentRejectReason: {
      type: String,
      default: null,
    },

    // ==================== SECURITY & METADATA ====================
    ipAddress: {
      type: String,
      default: null,
    },

    userAgent: {
      type: String,
      default: null,
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
    collection: 'influencer_applications',
  }
);

// Indexes for efficient querying
InfluencerApplicationSchema.index({ email: 1, createdAt: -1 });
InfluencerApplicationSchema.index({ status: 1, createdAt: -1 });
InfluencerApplicationSchema.index({ userId: 1 });
InfluencerApplicationSchema.index({ followerCount: 1 });

// Pre-save hook: calculate approved status based on follower threshold
InfluencerApplicationSchema.pre('save', function (next) {
  if (this.isNew && this.status === 'pending') {
    const autoApproveThreshold = parseInt(process.env.INFLUENCER_AUTO_APPROVE_THRESHOLD || '5000');
    if (this.followerCount >= autoApproveThreshold) {
      this.status = 'approved';
      this.approvedAt = new Date();
    }
  }
  next();
});

// Virtual: is application approved?
InfluencerApplicationSchema.virtual('isApproved').get(function () {
  return this.status === 'approved';
});

// Virtual: videos remaining
InfluencerApplicationSchema.virtual('videosRemaining').get(function () {
  return Math.max(0, this.totalVideos - this.videosDelivered);
});

module.exports = mongoose.model('InfluencerApplication', InfluencerApplicationSchema, 'influencer_applications');
