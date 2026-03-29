/**
 * Cart Controller
 * Handles HTTP request/response logic for cart-related endpoints
 * Delegates business logic to CartService
 */

const cartService = require('../services/cartService');
const { ValidationError } = require('../utils/errors');

class CartController {
  /**
   * GET /api/cart
   * Retrieve the authenticated user's shopping cart
   * Includes all items with product information and totals
   */
  async getCart(req, res, next) {
    try {
      const userId = req.user._id;

      const cart = await cartService.getCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart retrieved successfully',
        data: cart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart/add
   * Add a product to the user's cart or increase quantity if already exists
   * Body: { productId, quantity, variant (optional) }
   */
  async addToCart(req, res, next) {
    try {
      const userId = req.user._id;
      const { productId, quantity, variant } = req.body;

      // Validate required fields
      if (!productId || !quantity) {
        throw new ValidationError('Missing required fields', {
          productId: !productId ? 'Product ID is required' : undefined,
          quantity: !quantity ? 'Quantity is required' : undefined,
        });
      }

      // Add to cart (service handles all validation)
      const updatedCart = await cartService.addToCart(userId, {
        productId,
        quantity: parseInt(quantity),
        variant: variant || {},
      });

      return res.status(201).json({
        success: true,
        message: 'Product added to cart successfully',
        data: updatedCart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart/update
   * Update cart item quantity or variant
   * Body: { cartItemId, quantity (optional), variant (optional) }
   */
  async updateCartItem(req, res, next) {
    try {
      const userId = req.user._id;
      const { cartItemId, quantity, variant } = req.body;

      if (!cartItemId) {
        throw new ValidationError('Missing required fields', {
          cartItemId: 'Cart item ID is required',
        });
      }

      // Validate at least one update field is provided
      if (quantity === undefined && variant === undefined) {
        throw new ValidationError('No updates provided', {
          body: 'Provide at least quantity or variant to update',
        });
      }

      const updatedCart = await cartService.updateCartItem(userId, cartItemId, {
        quantity: quantity !== undefined ? parseInt(quantity) : undefined,
        variant,
      });

      return res.status(200).json({
        success: true,
        message: 'Cart item updated successfully',
        data: updatedCart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart/remove
   * Remove a specific item from the user's cart
   * Body: { cartItemId }
   */
  async removeFromCart(req, res, next) {
    try {
      const userId = req.user._id;
      const { cartItemId } = req.body;

      if (!cartItemId) {
        throw new ValidationError('Missing required fields', {
          cartItemId: 'Cart item ID is required',
        });
      }

      const updatedCart = await cartService.removeFromCart(userId, cartItemId);

      return res.status(200).json({
        success: true,
        message: 'Item removed from cart successfully',
        data: updatedCart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart/clear
   * Clear all items from the user's cart
   */
  async clearCart(req, res, next) {
    try {
      const userId = req.user._id;

      const clearedCart = await cartService.clearCart(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart cleared successfully',
        data: clearedCart,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * GET /api/cart/summary
   * Get cart totals and item count
   * Lightweight endpoint for getting just the summary
   */
  async getCartSummary(req, res, next) {
    try {
      const userId = req.user._id;

      const summary = await cartService.getCartSummary(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart summary retrieved successfully',
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * POST /api/cart/validate
   * Validate cart before checkout
   * Checks all products still exist, in stock, and prices are current
   */
  async validateCart(req, res, next) {
    try {
      const userId = req.user._id;

      const validation = await cartService.validateCartForCheckout(userId);

      return res.status(200).json({
        success: true,
        message: 'Cart validation completed',
        data: validation,
      });
    } catch (error) {
      next(error);
    }
  }
}

// Export a singleton instance
module.exports = new CartController();
