/**
 * Category Model
 * Defines product categories for the marketplace
 * Used for organizing products and filtering
 */

const mongoose = require('mongoose');

const CategorySchema = new mongoose.Schema(
  {
    // Category name (unique, indexed for fast lookups)
    name: {
      type: String,
      required: [true, 'Category name is required'],
      unique: true,
      trim: true,
      lowercase: true,
      minlength: [2, 'Category name must be at least 2 characters'],
      maxlength: [50, 'Category name cannot exceed 50 characters'],
      index: true,
    },

    // Human-readable display name (capitalized)
    displayName: {
      type: String,
      required: [true, 'Display name is required'],
      trim: true,
      minlength: [2, 'Display name must be at least 2 characters'],
      maxlength: [50, 'Display name cannot exceed 50 characters'],
    },

    // Category description
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Description cannot exceed 500 characters'],
      default: '',
    },

    // Category slug for URLs
    slug: {
      type: String,
      unique: true,
      sparse: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    // Optional category image/icon URL
    image: {
      type: String,
      trim: true,
      default: null,
    },

    // Sort order in listings
    sortOrder: {
      type: Number,
      default: 0,
      index: true,
    },

    // Active/Inactive status
    isActive: {
      type: Boolean,
      default: true,
      index: true,
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
    timestamps: true,
    collection: 'categories',
  }
);

/**
 * Pre-save hook: Generate slug from name if not provided
 */
CategorySchema.pre('save', function (next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/\s+/g, '-');
  }
  this.updatedAt = new Date();
  next();
});

/**
 * Indexes for optimal query performance
 */
CategorySchema.index({ name: 1, isActive: 1 });
CategorySchema.index({ slug: 1 });
CategorySchema.index({ sortOrder: 1, name: 1 });

/**
 * Instance method: Format category for API response
 */
CategorySchema.methods.toJSON = function () {
  return {
    _id: this._id,
    name: this.name,
    displayName: this.displayName,
    description: this.description,
    slug: this.slug,
    image: this.image,
    sortOrder: this.sortOrder,
    isActive: this.isActive,
    createdAt: this.createdAt,
  };
};

module.exports = mongoose.model('Category', CategorySchema);
