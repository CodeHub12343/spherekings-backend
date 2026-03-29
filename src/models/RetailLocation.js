/**
 * Retail Location Model
 * Defines the schema for physical retail locations / stores that sell SphereKings products
 * Used for "Store Locator" / "Retail Partners Directory" feature
 */

const mongoose = require('mongoose');

const RetailLocationSchema = new mongoose.Schema(
  {
    // Store Information
    name: {
      type: String,
      required: [true, 'Store name is required'],
      trim: true,
      minlength: [3, 'Store name must be at least 3 characters'],
      maxlength: [100, 'Store name cannot exceed 100 characters'],
      index: true,
    },

    // Address Information
    address: {
      type: String,
      required: [true, 'Street address is required'],
      trim: true,
      minlength: [5, 'Address must be at least 5 characters'],
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },

    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      lowercase: true,
      minlength: [2, 'City must be at least 2 characters'],
      maxlength: [50, 'City cannot exceed 50 characters'],
      index: true,
    },

    state: {
      type: String,
      required: [true, 'State/Province is required'],
      trim: true,
      lowercase: true,
      minlength: [2, 'State must be at least 2 characters'],
      maxlength: [50, 'State cannot exceed 50 characters'],
    },

    country: {
      type: String,
      required: [true, 'Country is required'],
      trim: true,
      lowercase: true,
      minlength: [2, 'Country must be at least 2 characters'],
      maxlength: [50, 'Country cannot exceed 50 characters'],
      index: true,
    },

    // Logo for the store
    logoUrl: {
      type: String,
      required: [true, 'Store logo URL is required'],
      validate: {
        validator: function (value) {
          // Simple URL validation
          return /^https?:\/\/.+\..+/i.test(value);
        },
        message: 'Logo URL must be a valid HTTP(S) URL',
      },
    },

    // Store description / branding
    description: {
      type: String,
      required: [true, 'Store description is required'],
      trim: true,
      minlength: [10, 'Description must be at least 10 characters'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },

    // Optional fields for future expansion
    websiteUrl: {
      type: String,
      default: null,
      validate: {
        validator: function (value) {
          if (!value) return true; // Optional field
          return /^https?:\/\/.+\..+/i.test(value);
        },
        message: 'Website URL must be a valid HTTP(S) URL',
      },
    },

    phone: {
      type: String,
      default: null,
      trim: true,
      maxlength: [20, 'Phone number cannot exceed 20 characters'],
    },

    // Status flag for enabling/disabling locations
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },

    // For featured locations on homepage
    isFeatured: {
      type: Boolean,
      default: false,
      index: true,
    },

    // Cloudinary public ID for logo (for future deletion if needed)
    logoPublicId: {
      type: String,
      default: null,
    },

    // Timestamps
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
    timestamps: true, // Automatically manage createdAt and updatedAt
  }
);

// Compound index for location search (city + country)
RetailLocationSchema.index({ city: 1, country: 1 });

// Compound index for featured/active locations
RetailLocationSchema.index({ isActive: 1, isFeatured: 1 });

module.exports = mongoose.model('RetailLocation', RetailLocationSchema);
