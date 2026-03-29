/**
 * Cart Service Layer
 * Handles all business logic related to shopping cart management
 * Validates products, manages inventory, and performs cart operations
 */

const Cart = require('../models/Cart');
const Product = require('../models/Product');
const { NotFoundError, ValidationError, ServerError } = require('../utils/errors');

class CartService {
  /**
   * Get user's cart (create if doesn't exist)
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Cart document with populated products
   */
  async getCart(userId) {
    try {
      if (!userId) {
        throw new ValidationError('User ID is required', { userId: 'User ID is missing' });
      }

      // First get or create the cart
      let cart = await Cart.findOne({ userId });
      if (!cart) {
        cart = await Cart.create({ userId, items: [] });
      }

      // Now populate product details with full product info (including price)
      // Use .withProducts() to get full product data instead of .withProductNames()
      cart = await Cart.findById(cart._id).withProducts();

      // Calculate totals
      const summary = cart.calculateTotal();

      return {
        ...cart.toJSON(),
        summary,
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ServerError('Error fetching cart', error);
    }
  }

  /**
   * Validate product exists and is active for cart operations
   * @param {String} productId - Product ID to validate
   * @returns {Promise<Object>} - Product document
   * @throws {ValidationError|NotFoundError}
   */
  async validateProduct(productId) {
    try {
      // Validate ObjectId format
      if (!productId.match(/^[0-9a-fA-F]{24}$/)) {
        throw new ValidationError('Invalid product ID format', {
          productId: 'Product ID must be a valid ObjectId',
        });
      }

      const product = await Product.findOne({ _id: productId, deletedAt: null });

      if (!product) {
        throw new NotFoundError('Product not found');
      }

      if (product.status === 'inactive') {
        throw new ValidationError('Product is not available', {
          productId: 'This product is currently unavailable',
        });
      }

      return product;
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error validating product', error);
    }
  }

  /**
   * Check if product has sufficient stock
   * @param {Object} product - Product document
   * @param {Number} quantity - Quantity requested
   * @throws {ValidationError}
   */
  validateStock(product, quantity) {
    if (!product.stock || product.stock === 0) {
      throw new ValidationError('Product out of stock', {
        productId: 'This product is out of stock',
      });
    }

    if (quantity > product.stock) {
      throw new ValidationError('Insufficient stock', {
        quantity: `Only ${product.stock} units available in stock`,
      });
    }
  }

  /**
   * Validate selected variant exists in product
   * @param {Object} product - Product document
   * @param {Object} variant - Selected variant object
   * @throws {ValidationError}
   */
  validateVariant(product, variant = {}) {
    if (!variant || Object.keys(variant).length === 0) {
      // No variant required - OK
      return;
    }

    // Check if product has variants
    if (!product.variants || product.variants.length === 0) {
      throw new ValidationError('Product does not support variants', {
        variant: 'This product does not have variant options',
      });
    }

    // Validate each selected variant
    Object.keys(variant).forEach((variantName) => {
      const variantType = product.variants.find((v) => v.name === variantName);

      if (!variantType) {
        throw new ValidationError('Invalid variant name', {
          variant: `Variant type "${variantName}" is not available for this product`,
        });
      }

      const selectedOption = variant[variantName];
      if (!variantType.options.includes(selectedOption)) {
        throw new ValidationError('Invalid variant option', {
          variant: `Option "${selectedOption}" is not available for variant "${variantName}"`,
        });
      }
    });
  }

  /**
   * Add product to cart
   * If product already in cart with same variant, increase quantity
   * @param {String} userId - User ID
   * @param {Object} cartItemData - { productId, quantity, variant }
   * @returns {Promise<Object>} - Updated cart
   */
  async addToCart(userId, cartItemData) {
    try {
      const { productId, quantity, variant } = cartItemData;

      // Validate input
      if (!productId) {
        throw new ValidationError('Missing required fields', {
          productId: 'Product ID is required',
        });
      }

      if (!quantity || quantity < 1) {
        throw new ValidationError('Invalid quantity', {
          quantity: 'Quantity must be at least 1',
        });
      }

      if (quantity > 1000) {
        throw new ValidationError('Quantity too high', {
          quantity: 'Quantity cannot exceed 1000',
        });
      }

      // Validate product exists and is active
      const product = await this.validateProduct(productId);

      // Validate stock
      this.validateStock(product, quantity);

      // Validate variant if provided
      this.validateVariant(product, variant);

      // Get or create cart
      const cart = await Cart.getOrCreate(userId);

      // Check if item already exists (same product + same variant)
      const existingItem = cart.findItemByProductAndVariant(productId, variant);

      if (existingItem) {
        // Update quantity
        const newQuantity = existingItem.quantity + quantity;
        if (newQuantity > product.stock) {
          throw new ValidationError('Insufficient stock for total quantity', {
            quantity: `Only ${product.stock} units available in stock`,
          });
        }
        existingItem.quantity = newQuantity;
      } else {
        // Add new item
        cart.items.push({
          productId,
          variant: variant || {},
          quantity,
          price: product.price,
        });
      }

      await cart.save();

      // Fetch updated cart with product names
      const updatedCart = await Cart.findById(cart._id).withProductNames();
      const summary = updatedCart.calculateTotal();

      return {
        ...updatedCart.toJSON(),
        summary,
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error adding to cart', error);
    }
  }

  /**
   * Update cart item quantity or variant
   * @param {String} userId - User ID
   * @param {String} cartItemId - Cart item ID to update
   * @param {Object} updates - { quantity, variant }
   * @returns {Promise<Object>} - Updated cart
   */
  async updateCartItem(userId, cartItemId, updates) {
    try {
      const { quantity, variant } = updates;

      // Get user's cart
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      // Find the item in cart
      const cartItem = cart.items.find((item) => item._id.toString() === cartItemId);
      if (!cartItem) {
        throw new NotFoundError('Item not found in cart');
      }

      // Validate product still exists
      const product = await this.validateProduct(cartItem.productId.toString());

      // Update quantity if provided
      if (quantity !== undefined) {
        if (quantity < 1) {
          throw new ValidationError('Invalid quantity', {
            quantity: 'Quantity must be at least 1',
          });
        }

        // Check stock for new quantity
        this.validateStock(product, quantity);

        cartItem.quantity = quantity;
      }

      // Update variant if provided
      if (variant !== undefined) {
        this.validateVariant(product, variant);
        cartItem.variant = variant || {};
      }

      await cart.save();

      // Fetch updated cart with product names
      const updatedCart = await Cart.findById(cart._id).withProductNames();
      const summary = updatedCart.calculateTotal();

      return {
        ...updatedCart.toJSON(),
        summary,
      };
    } catch (error) {
      if (error instanceof ValidationError || error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error updating cart item', error);
    }
  }

  /**
   * Remove specific item from cart
   * @param {String} userId - User ID
   * @param {String} cartItemId - Cart item ID to remove
   * @returns {Promise<Object>} - Updated cart
   */
  async removeFromCart(userId, cartItemId) {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      const itemIndex = cart.items.findIndex((item) => item._id.toString() === cartItemId);
      if (itemIndex === -1) {
        throw new NotFoundError('Item not found in cart');
      }

      // Remove the item
      cart.items.splice(itemIndex, 1);
      await cart.save();

      // Fetch updated cart with product names
      const updatedCart = await Cart.findById(cart._id).withProductNames();
      const summary = updatedCart.calculateTotal();

      return {
        ...updatedCart.toJSON(),
        summary,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error removing item from cart', error);
    }
  }

  /**
   * Clear all items from cart
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Empty cart
   */
  async clearCart(userId) {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        throw new NotFoundError('Cart not found');
      }

      cart.items = [];
      await cart.save();

      const summary = {
        itemCount: 0,
        totalItems: 0,
        subtotal: 0,
        tax: 0,
        total: 0,
      };

      return {
        _id: cart._id,
        userId: cart.userId,
        items: [],
        summary,
        createdAt: cart.createdAt,
        updatedAt: cart.updatedAt,
      };
    } catch (error) {
      if (error instanceof NotFoundError) {
        throw error;
      }
      throw new ServerError('Error clearing cart', error);
    }
  }

  /**
   * Get cart summary/totals
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Cart summary with totals
   */
  async getCartSummary(userId) {
    try {
      const cart = await Cart.findOne({ userId });
      if (!cart) {
        return {
          itemCount: 0,
          totalItems: 0,
          subtotal: 0,
          tax: 0,
          total: 0,
        };
      }

      return cart.calculateTotal();
    } catch (error) {
      throw new ServerError('Error calculating cart summary', error);
    }
  }

  /**
   * Validate entire cart before checkout
   * Checks all products still exist, in stock, and prices are current
   * @param {String} userId - User ID
   * @returns {Promise<Object>} - Validation result with any issues
   */
  async validateCartForCheckout(userId) {
    try {
      const cart = await Cart.findOne({ userId }).withProducts();
      if (!cart || cart.items.length === 0) {
        throw new ValidationError('Cart is empty', {
          items: 'Cannot proceed to checkout with empty cart',
        });
      }

      const issues = [];

      for (const item of cart.items) {
        // Check product still exists
        if (!item.productId) {
          issues.push({
            itemId: item._id,
            issue: 'Product no longer available',
          });
          continue;
        }

        // Check product is still active
        if (item.productId.status !== 'active') {
          issues.push({
            itemId: item._id,
            productId: item.productId._id,
            issue: 'Product is no longer available',
          });
          continue;
        }

        // Check stock
        if (item.quantity > item.productId.stock) {
          issues.push({
            itemId: item._id,
            productId: item.productId._id,
            issue: `Only ${item.productId.stock} units available (requested ${item.quantity})`,
          });
        }

        // Check price (warning only)
        if (item.price !== item.productId.price) {
          issues.push({
            itemId: item._id,
            productId: item.productId._id,
            issue: 'price_updated',
            oldPrice: item.price,
            newPrice: item.productId.price,
          });
        }
      }

      if (issues.length > 0) {
        throw new ValidationError('Cart validation failed', { issues });
      }

      return {
        valid: true,
        cart: {
          ...cart.toJSON(),
          summary: cart.calculateTotal(),
        },
      };
    } catch (error) {
      if (error instanceof ValidationError) {
        throw error;
      }
      throw new ServerError('Error validating cart for checkout', error);
    }
  }
}

// Export a singleton instance
module.exports = new CartService();
