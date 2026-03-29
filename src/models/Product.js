/**
 * Product Model
 * Defines the Product schema for the Spherekings Marketplace
 * Supports product variants, images, inventory, and admin management
 */

const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema(
  {
    // Product Information
    name: {
      type: String,
      required: [true, 'Product name is required'],
      unique: true,
      trim: true,
      minlength: [3, 'Product name must be at least 3 characters'],
      maxlength: [100, 'Product name cannot exceed 100 characters'],
      lowercase: true,
      index: true,
    },

    description: {
      type: String,
      required: [true, 'Product description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
      maxlength: [2000, 'Description cannot exceed 2000 characters'],
      trim: true,
    },

    // Pricing
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0.01, 'Price must be a positive number'],
      set: (value) => parseFloat(value.toFixed(2)), // Round to 2 decimal places
    },

    // Images (URLs stored from Cloudinary or similar service)
    images: {
      type: [String],
      required: [true, 'At least one product image is required'],
      validate: {
        validator: function (images) {
          return images.length > 0 && images.length <= 10;
        },
        message: 'Product must have between 1 and 10 images',
      },
      // Optional: Validate image URLs
      // validator: function(images) {
      //   return images.every(url => /^https?:\/\/.+\..+/.test(url));
      // }
    },

    // Product Variants (e.g., colors, editions)
    // Structure: [{ name: "color", options: ["Red", "Blue", "Gold"] }]
    variants: {
      type: [
        {
          name: {
            type: String,
            required: true,
            lowercase: true,
            enum: ['color', 'edition', 'size', 'material'],
            _id: false,
          },
          options: {
            type: [String],
            required: true,
            validate: {
              validator: function (options) {
                return options.length > 0 && options.length <= 20;
              },
              message: 'Variant must have between 1 and 20 options',
            },
          },
        },
      ],
      default: [],
    },

    // Inventory Management
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },

    // Product Status
    status: {
      type: String,
      enum: {
        values: ['active', 'inactive', 'out_of_stock'],
        message: 'Status must be active, inactive, or out_of_stock',
      },
      default: 'active',
      lowercase: true,
      index: true,
    },

    // Category (optional, for future expansion)
    category: {
      type: String,
      trim: true,
      lowercase: true,
      // Future: Can add enum if categories are predefined
    },

    // SKU (Stock Keeping Unit) - for future inventory management
    sku: {
      type: String,
      unique: true,
      sparse: true,
      uppercase: true,
    },

    // Admin-only field to track if product is featured
    isFeatured: {
      type: Boolean,
      default: false,
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

    // Soft delete support (for data retention)
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt
    collection: 'products',
  }
);

/**
 * Index: Optimize common queries
 */
ProductSchema.index({ name: 'text', description: 'text' }); // Full-text search
ProductSchema.index({ status: 1, createdAt: -1 }); // Status + sorting by date
ProductSchema.index({ price: 1 }); // Price filtering
ProductSchema.index({ category: 1 }); // Category filtering (newly added)
ProductSchema.index({ status: 1, price: 1, createdAt: -1 }); // Compound index for filtering + sorting

/**
 * Middleware: Update status based on stock
 * Automatically set status to 'out_of_stock' if stock is 0 and status is 'active'
 */
ProductSchema.pre('save', function (next) {
  if (this.stock === 0 && this.status === 'active') {
    this.status = 'out_of_stock';
  } else if (this.stock > 0 && this.status === 'out_of_stock') {
    this.status = 'active';
  }

  next();
});

/**
 * Middleware: Ensure deletedAt is null for new documents
 */
ProductSchema.pre('save', function (next) {
  if (this.isNew) {
    this.deletedAt = null;
  }
  next();
});

/**
 * Method: Soft delete a product
 * Sets deletedAt timestamp instead of removing from database
 */
ProductSchema.methods.softDelete = async function () {
  this.deletedAt = new Date();
  this.status = 'inactive';
  return await this.save();
};

/**
 * Method: Restore a soft-deleted product
 */
ProductSchema.methods.restore = async function () {
  this.deletedAt = null;
  if (this.status === 'inactive') {
    this.status = 'active';
  }
  return await this.save();
};

/**
 * Method: Get product with all details
 * Used by product detail endpoints
 */
ProductSchema.methods.toJSON = function () {
  const product = this.toObject();
  // Remove deletedAt from response if not deleted
  if (!product.deletedAt) {
    delete product.deletedAt;
  }
  return product;
};

/**
 * Query Helper: Exclude soft-deleted products
 * Usage: Product.find().active()
 */
ProductSchema.query.active = function () {
  return this.where({ deletedAt: null });
};

/**
 * Query Helper: Include only deleted products
 * Usage: Product.find().deleted()
 */
ProductSchema.query.deleted = function () {
  return this.where({ deletedAt: { $ne: null } });
};

/**
 * Static Method: Update stock
 * Safely increment or decrement product stock
 */
ProductSchema.statics.updateStock = async function (productId, quantity, operation = 'decrement') {
  const updateOp = operation === 'increment' ? quantity : -quantity;
  const product = await this.findByIdAndUpdate(
    productId,
    { $inc: { stock: updateOp } },
    { new: true, runValidators: true }
  );
  return product;
};

// Create and export the Product model
const Product = mongoose.model('Product', ProductSchema);

module.exports = Product;
