/**
 * SponsorshipTier Model
 * Represents sponsorship tier packages with pricing and benefits
 */

const mongoose = require('mongoose');
const { Schema } = mongoose;

const SponsorshipTierSchema = new Schema(
  {
    // ==================== TIER INFORMATION ====================
    name: {
      type: String,
      required: [true, 'Tier name is required'],
      trim: true,
      unique: true,
      index: true,
      minlength: [3, 'Tier name must be at least 3 characters'],
      maxlength: [50, 'Tier name must not exceed 50 characters'],
    },

    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // ==================== PRICING ====================
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [100, 'Minimum price is $1'],
    },

    // Calculated automatically: price / 10000 (so $1000 = 10 videos)
    videoMentions: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },

    // ==================== BENEFITS ====================
    benefitsSummary: {
      type: String,
      required: [true, 'Benefits summary is required'],
      trim: true,
      maxlength: [300, 'Benefits summary must not exceed 300 characters'],
    },

    benefits: {
      type: [
        {
          type: String,
          trim: true,
          minlength: [10, 'Benefit must be at least 10 characters'],
          maxlength: [150, 'Benefit must not exceed 150 characters'],
        },
      ],
      required: [true, 'At least one benefit is required'],
      validate: {
        validator: (v) => v.length > 0 && v.length <= 10,
        message: 'Must have between 1 and 10 benefits',
      },
    },

    // Detailed description of the tier
    description: {
      type: String,
      required: [true, 'Tier description is required'],
      trim: true,
      maxlength: [1000, 'Description must not exceed 1000 characters'],
    },

    // ==================== DELIVERY INFORMATION ====================
    // Default delivery days for this tier
    defaultDeliveryDays: {
      type: Number,
      required: true,
      default: 45, // 45 days for Kickstarter campaign
      min: 7,
      max: 365,
    },

    // Campaign or promotion cycle
    campaignCycle: {
      type: String,
      required: true,
      default: 'kickstarter_2026_q2',
      index: true,
    },

    // ==================== DISPLAY & MARKETING ====================
    featured: {
      type: Boolean,
      default: false,
      index: true,
    },

    displayOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    icon: {
      type: String, // Emoji or icon name
      default: '👑',
    },

    badgeText: {
      type: String, // e.g., "Most Popular"
      default: null,
      trim: true,
    },

    // Background color for tier card (hex or tailwind class)
    cardColor: {
      type: String,
      default: 'white',
      trim: true,
    },

    // ==================== ADMIN CONTROLS ====================
    active: {
      type: Boolean,
      default: true,
      index: true,
    },

    deprecated: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Optional: limit number of sponsors for this tier
    maxSponsors: {
      type: Number,
      default: null, // null = unlimited
      min: 1,
    },

    // Track how many sponsors have purchased this tier
    sponsorCount: {
      type: Number,
      default: 0,
      index: true,
    },

    // ==================== METADATA ====================
    createdAt: {
      type: Date,
      default: Date.now,
      index: true,
    },

    updatedAt: {
      type: Date,
      default: Date.now,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Admin who created
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'sponsorship_tiers',
  }
);

// Indexes for efficient querying
SponsorshipTierSchema.index({ active: 1, featured: 1, displayOrder: 1 });
SponsorshipTierSchema.index({ campaignCycle: 1, active: 1 });

// Pre-save: auto-calculate video mentions from price
// $100 per video mention (10000 cents = 1 video)
SponsorshipTierSchema.pre('save', function (next) {
  if (this.price && this.videoMentions === undefined) {
    this.videoMentions = Math.floor(this.price / 10000);
  }
  next();
});

// Virtual: can add more sponsors to this tier?
SponsorshipTierSchema.virtual('canAddMore').get(function () {
  if (this.maxSponsors === null) return true;
  return this.sponsorCount < this.maxSponsors;
});

// Virtual: % of tier filled (if max sponsors set)
SponsorshipTierSchema.virtual('fillPercentage').get(function () {
  if (this.maxSponsors === null) return 0;
  return Math.round((this.sponsorCount / this.maxSponsors) * 100);
});

module.exports = mongoose.model('SponsorshipTier', SponsorshipTierSchema);
