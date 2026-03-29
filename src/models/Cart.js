/**
 * Cart Model
 * Defines the Cart schema for storing shopping cart data per user
 * Maintains cart items with products, variants, quantities, and prices
 */

const mongoose = require('mongoose');

/**
 * Cart Item Schema (Sub-document within Cart)
 * Represents a single item in the user's cart
 */
const CartItemSchema = new mongoose.Schema(
  {
    // Reference to the product in the catalog
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product',
      required: [true, 'Product ID is required'],
      index: true,
    },

    // Selected product variant (e.g., color: "Red", edition: "Deluxe")
    variant: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
      // Each variant field is optional - depends on product
      // Example: { color: "Red", edition: "Deluxe" }
    },

    // Quantity of this product to purchase
    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
      max: [1000, 'Quantity cannot exceed 1000'],
      validate: {
        validator: Number.isInteger,
        message: 'Quantity must be a whole number',
      },
    },

    // Price at the time item was added (prevents client-side price manipulation)
    // This is a snapshot of the product price when added to cart
    price: {
      type: Number,
      required: [true, 'Price is required'],
      min: [0, 'Price cannot be negative'],
      set: (value) => parseFloat(value.toFixed(2)),
    },

    // Timestamp when item was added to cart (useful for analytics)
    addedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  { _id: true } // Each item gets its own ID for removal operations
);

/**
 * Main Cart Schema
 * Represents a shopping cart belonging to a user
 */
const CartSchema = new mongoose.Schema(
  {
    // Reference to the user who owns this cart
    // One cart per user (unique constraint)
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User ID is required'],
      unique: true,
      sparse: true, // Allow null for anonymous carts (future feature)
      index: true,
    },

    // Array of items in the cart
    items: {
      type: [CartItemSchema],
      default: [],
      validate: {
        validator: function (items) {
          // Optional: Limit cart size if needed
          return items.length <= 1000;
        },
        message: 'Cart cannot contain more than 1000 items',
      },
    },

    // Metadata timestamps
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
    collection: 'carts',
  }
);

/**
 * Middleware: Update updatedAt when cart is modified
 */
CartSchema.pre('save', function (next) {
  this.updatedAt = new Date();
  next();
});

/**
 * Middleware: Update updatedAt on findByIdAndUpdate
 */
CartSchema.pre('findByIdAndUpdate', function (next) {
  this.set({ updatedAt: new Date() });
  next();
});

/**
 * Method: Check if product with variant already exists in cart
 * @param {ObjectId} productId - Product ID to search for
 * @param {Object} variant - Variant object to match
 * @returns {Object|null} - Existing cart item or null
 */
CartSchema.methods.findItemByProductAndVariant = function (productId, variant = {}) {
  return this.items.find((item) => {
    const productMatch = item.productId.toString() === productId.toString();
    const variantMatch = JSON.stringify(item.variant) === JSON.stringify(variant);
    return productMatch && variantMatch;
  });
};

/**
 * Method: Get total number of items in cart
 * @returns {Number} - Total quantity (sum of all items' quantities)
 */
CartSchema.methods.getTotalItemCount = function () {
  return this.items.reduce((total, item) => total + item.quantity, 0);
};

/**
 * Method: Get cart subtotal (before tax/shipping)
 * @returns {Number} - Subtotal amount
 */
CartSchema.methods.getSubtotal = function () {
  return this.items.reduce((subtotal, item) => {
    return subtotal + item.price * item.quantity;
  }, 0);
};

/**
 * Method: Calculate cart total with tax
 * @param {Number} taxRate - Tax rate as decimal (e.g., 0.08 for 8%)
 * @returns {Object} - Object with subtotal, tax, and total
 */
CartSchema.methods.calculateTotal = function (taxRate = 0.08) {
  const subtotal = this.getSubtotal();
  const tax = parseFloat((subtotal * taxRate).toFixed(2));
  const total = parseFloat((subtotal + tax).toFixed(2));

  return {
    itemCount: this.items.length,
    totalItems: this.getTotalItemCount(),
    subtotal: parseFloat(subtotal.toFixed(2)),
    tax,
    total,
  };
};

/**
 * Method: Clear all items from cart
 */
CartSchema.methods.clearItems = function () {
  this.items = [];
  return this.save();
};

/**
 * Method: Remove specific item by ID
 * @param {ObjectId} cartItemId - ID of item to remove
 */
CartSchema.methods.removeItem = function (cartItemId) {
  this.items = this.items.filter((item) => !item._id.equals(cartItemId));
  return this.save();
};

/**
 * Method: Add item to cart (handles duplicate checking)
 * @param {Object} itemData - { productId, quantity, variant, price }
 */
CartSchema.methods.addItem = function (itemData) {
  const existingItem = this.findItemByProductAndVariant(itemData.productId, itemData.variant);

  if (existingItem) {
    // Update quantity if item already exists
    existingItem.quantity += itemData.quantity;
  } else {
    // Add new item
    this.items.push(itemData);
  }

  return this.save();
};

/**
 * Method: Update existing item quantity
 * @param {ObjectId} cartItemId - ID of item to update
 * @param {Number} quantity - New quantity
 */
CartSchema.methods.updateItemQuantity = function (cartItemId, quantity) {
  const item = this.items.find((item) => item._id.equals(cartItemId));
  if (item) {
    item.quantity = quantity;
  }
  return this.save();
};

/**
 * Method: Serialize cart with populated product data
 * @returns {Object} - Cart formatted for API response
 */
CartSchema.methods.toJSON = function () {
  const cartObject = this.toObject();

  // Add subtotals for each item
  cartObject.items = cartObject.items.map((item) => ({
    ...item,
    subtotal: parseFloat((item.price * item.quantity).toFixed(2)),
  }));

  return cartObject;
};

/**
 * Static Method: Get or create cart for user
 * @param {ObjectId} userId - User ID
 * @returns {Promise<Document>} - Cart document
 */
CartSchema.statics.getOrCreate = async function (userId) {
  let cart = await this.findOne({ userId });

  if (!cart) {
    cart = await this.create({ userId, items: [] });
  }

  return cart;
};

/**
 * Query Helper: Get cart with populated product details
 */
CartSchema.query.withProducts = function () {
  return this.populate({
    path: 'items.productId',
    select: 'name description price images variants status stock sku',
  });
};

/**
 * Query Helper: Get cart with minimal product info
 */
CartSchema.query.withProductNames = function () {
  return this.populate({
    path: 'items.productId',
    select: 'name images',
  });
};

// Create and export the Cart model
const Cart = mongoose.model('Cart', CartSchema);

module.exports = Cart;
