/**
 * Checkout Service
 * Handles checkout session creation, payment verification, and order creation
 */

const { stripe } = require('../config/stripe');
const Order = require('../models/Order');
const User = require('../models/User');
const { validateShippingAddress } = require('../validations/shippingSchema');
const { ValidationError, NotFoundError, ServerError } = require('../utils/errors');

class CheckoutService {
  /**
   * Create a Stripe checkout session from user's cart
   *
   * Flow:
   * 1. Validate shipping address (REQUIRED)
   * 2. Get user's cart
   * 3. Validate cart contents
   * 4. Fetch product details for pricing
   * 5. Create Stripe checkout session
   * 6. Return session URL for redirect
   *
   * @param {string} userId - Authenticated user ID
   * @param {Object} cartService - Cart service instance
   * @param {Object} productService - Product service instance
   * @param {string} affiliateId - Optional affiliate ID from referral
   * @param {string} visitorId - Optional visitor ID for tracking
   * @param {Object} shippingAddress - Shipping address (REQUIRED)
   * @returns {Promise<Object>} { sessionId, url }
   */
  async createCheckoutSession(userId, cartService, productService, affiliateId = null, visitorId = null, shippingAddress = null) {
    try {
      // Step 0a: Validate shipping address
      console.log('🚚 [CHECKOUT] Validating shipping address...');
      if (!shippingAddress) {
        throw new ValidationError('Shipping address is required');
      }

      let validatedShippingAddress;
      try {
        validatedShippingAddress = validateShippingAddress(shippingAddress);
        console.log('✅ [CHECKOUT] Shipping address validated successfully');
      } catch (validationError) {
        console.error('❌ [CHECKOUT] Shipping address validation failed:', validationError.errors);
        throw new ValidationError(
          `Shipping address validation failed: ${JSON.stringify(validationError.errors)}`
        );
      }

      // Step 0b: Fetch user to get email
      const user = await User.findById(userId);
      if (!user) {
        throw new NotFoundError('User not found');
      }

      if (!user.email) {
        throw new ValidationError('User email is required to create checkout session');
      }

      // Step 1: Fetch and validate cart
      const cart = await cartService.getCart(userId);

      if (!cart || !cart.items || cart.items.length === 0) {
        throw new ValidationError('Cannot checkout with an empty cart');
      }

      // Step 2: Validate cart for checkout (checks stock, product existence)
      const validationResult = await cartService.validateCartForCheckout(userId);

      if (!validationResult.valid && validationResult.issues && validationResult.issues.length > 0) {
        const issueMessage = validationResult.issues
          .map((issue) => `${issue.productName}: ${issue.issue}`)
          .join('; ');
        throw new ValidationError(`Cart validation failed: ${issueMessage}`);
      }

      // Step 3: Build line items for Stripe with fresh product data
      const lineItems = [];
      const cartItemDetails = [];

      for (const item of cart.items) {
        try {
          // Handle both populated product objects and product ID strings
          let product;
          if (typeof item.productId === 'object' && item.productId._id) {
            // Already populated with product document
            product = item.productId;
          } else {
            // Just an ID, fetch the product
            product = await productService.getProductById(item.productId);
          }

          if (!product) {
            throw new NotFoundError(`Product not found`);
          }

          // Use price from product, fallback to cached price in cart item
          // (price is stored in cart item when added, in case product price changes)
          const price = product.price || item.price;

          if (!price || typeof price !== 'number' || price <= 0) {
            throw new ValidationError(
              `Product "${product.name || 'Unknown'}" has invalid price: ${price}. ` +
              `Product price: ${product.price}, Cart item price: ${item.price}`
            );
          }

          // Check if product is available (not inactive or out of stock)
          const isInactive = product.status && product.status.toLowerCase() === 'inactive';
          const isOutOfStock = product.status && product.status.toLowerCase() === 'out_of_stock';
          
          if (isInactive || isOutOfStock) {
            throw new ValidationError(`Product ${product.name} is no longer available`);
          }

          // Create line item for Stripe
          const unitAmount = Math.round(price * 100); // Stripe expects cents
          
          if (!Number.isFinite(unitAmount)) {
            throw new ValidationError(
              `Product "${product.name}" mathematical error: ` +
              `${price} * 100 = ${price * 100}, rounded to: ${unitAmount}`
            );
          }

          lineItems.push({
            price_data: {
              currency: process.env.CURRENCY || 'usd',
              product_data: {
                name: product.name,
                ...(product.description && { description: product.description }),
                images: product.images && product.images.length > 0 ? [product.images[0]] : [],
                metadata: {
                  productId: product._id.toString(),
                  sku: product.sku || '',
                },
              },
              unit_amount: unitAmount,
            },
            quantity: item.quantity,
          });

          // Store cart item details for order creation later
          cartItemDetails.push({
            productId: product._id,
            productName: product.name,
            sku: product.sku || '',
            variant: item.variant,
            quantity: item.quantity,
            price: price,
            subtotal: product.price * item.quantity,
          });
        } catch (error) {
          throw new ServerError(
            `Error processing cart item ${item.productId}: ${error.message}`
          );
        }
      }

      // Step 4: Create Stripe checkout session
      const frontendUrl = process.env.FRONTEND_URL || 'https://spherekings-frontend.vercel.app';
      const sessionConfig = {
        payment_method_types: ['card'],
        mode: 'payment',
        line_items: lineItems,
        success_url: `${frontendUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${frontendUrl}/checkout/cancel`,
        customer_email: user.email, // Use authenticated user's email
        metadata: {
          userId: userId.toString(),
          cartId: cart._id.toString(),
          ...(affiliateId && { affiliateId: affiliateId.toString() }),
          ...(visitorId && { visitorId: visitorId }),
          shippingAddress: JSON.stringify(validatedShippingAddress), // SHIPPING ADDRESS - stringified for Stripe metadata
        },
      };

      // Optional: Add automatic tax calculation
      if (process.env.STRIPE_TAX_ENABLED === 'true') {
        sessionConfig.automatic_tax = { enabled: true };
      }

      const session = await stripe.checkout.sessions.create(sessionConfig);

      // Step 5: Return session info
      return {
        sessionId: session.id,
        url: session.url,
        metadata: {
          cartItems: cartItemDetails,
          subtotal: cart.summary.subtotal,
          tax: cart.summary.tax,
          total: cart.summary.total,
          affiliateId: affiliateId || null,
        },
      };
    } catch (error) {
      if (error.name === 'ValidationError' || error.name === 'NotFoundError') {
        throw error;
      }

      if (error.type && error.type.includes('stripe')) {
        throw new ServerError(`Stripe API error: ${error.message}`);
      }

      throw new ServerError(`Failed to create checkout session: ${error.message}`);
    }
  }

  /**
   * Handle successful payment from Stripe webhook
   *
   * Flow:
   * 1. Extract payment details from webhook
   * 2. Check idempotency (order doesn't already exist)
   * 3. Fetch cart items with current product data
   * 4. Create Order document
   * 5. Clear user's cart
   * 6. Trigger affiliate commission if applicable
   *
   * @param {Object} stripeEvent - Stripe webhook event
   * @param {Object} cartService - Cart service instance
   * @param {Object} productService - Product service instance
   * @returns {Promise<Object>} Created order
   */
  async handlePaymentSuccess(stripeEvent, cartService, productService) {
    const session = stripeEvent.data.object;

    try {
      console.log('🔄 [CHECKOUT] Starting payment success handling...');

      // Step 1: Extract data from session
      const stripeSessionId = session.id;
      const paymentIntentId = session.payment_intent;
      const userId = session.metadata?.userId;
      const affiliateId = session.metadata?.affiliateId;
      const visitorId = session.metadata?.visitorId;
      const shippingAddressStr = session.metadata?.shippingAddress; // EXTRACT SHIPPING - stringified

      console.log('📋 [CHECKOUT] Extracted metadata:', { stripeSessionId, userId, affiliateId, visitorId, hasShipping: !!shippingAddressStr });

      if (!userId) {
        throw new ValidationError('No userId found in Stripe session metadata');
      }

      if (!paymentIntentId) {
        throw new ValidationError('No payment intent ID found in Stripe session');
      }

      // Step 2: Check idempotency - prevent duplicate order creation
      console.log('🔍 [CHECKOUT] Checking for existing order...');
      const existingOrder = await Order.findByStripeSessionId(stripeSessionId);

      if (existingOrder) {
        console.log(`✅ [CHECKOUT] Order already exists for session ${stripeSessionId}`);
        return existingOrder;
      }

      // Step 3: Fetch payment intent to get charge ID
      console.log('💳 [CHECKOUT] Fetching payment intent...');
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId, {
        expand: ['charges.data'] // Explicitly expand charges
      });

      console.log('📊 [CHECKOUT] Payment intent retrieved:', {
        status: paymentIntent.status,
        chargesCount: paymentIntent.charges?.data?.length || 0,
        chargesData: JSON.stringify(paymentIntent.charges?.data || []).substring(0, 200)
      });

      let chargeId = null;

      // Try to get charge ID from payment intent
      if (paymentIntent.charges && paymentIntent.charges.data && paymentIntent.charges.data.length > 0) {
        chargeId = paymentIntent.charges.data[0].id;
        console.log('✅ [CHECKOUT] Charge ID from intent:', chargeId);
      } else {
        // Fallback: Try to fetch charges directly
        console.log('⚠️  [CHECKOUT] No charges in payment intent, trying direct charge lookup...');
        try {
          const charges = await stripe.charges.list({
            payment_intent: paymentIntentId,
            limit: 1
          });

          if (charges.data && charges.data.length > 0) {
            chargeId = charges.data[0].id;
            console.log('✅ [CHECKOUT] Charge ID from direct lookup:', chargeId);
          }
        } catch (chargeError) {
          console.warn('⚠️  [CHECKOUT] Could not fetch charges directly:', chargeError.message);
        }
      }

      // If we still don't have a charge ID, use payment intent ID as fallback (both are valid transaction IDs)
      if (!chargeId) {
        console.log('⚠️  [CHECKOUT] Using payment intent ID as transaction ID');
        chargeId = paymentIntentId;
      }

      // Step 4: Get cart and validate items, with fallback to Stripe line items
      console.log('🛒 [CHECKOUT] Fetching user cart...');
      let cart = null;
      let lineItems = [];
      
      try {
        cart = await cartService.getCart(userId);
        
        if (cart && cart.items && cart.items.length > 0) {
          console.log(`✅ [CHECKOUT] Cart found with ${cart.items.length} items`);
          lineItems = cart.items;
        } else {
          console.log('⚠️  [CHECKOUT] Cart is empty, trying to fetch line items from Stripe session...');
          // Fallback: Get line items from Stripe session
          try {
            const sessionLineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, {
              expand: ['data.price.product'] // Expand to get product metadata
            });
            if (sessionLineItems.data && sessionLineItems.data.length > 0) {
              lineItems = sessionLineItems.data;
              console.log(`✅ [CHECKOUT] Retrieved ${lineItems.length} line items from Stripe session`);
            }
          } catch (stripeError) {
            console.error('⚠️  [CHECKOUT] Could not fetch line items from Stripe:', stripeError.message);
          }
        }
      } catch (cartError) {
        console.log('⚠️  [CHECKOUT] Could not fetch cart, attempting Stripe line items fallback...');
        try {
          const sessionLineItems = await stripe.checkout.sessions.listLineItems(stripeSessionId, {
            expand: ['data.price.product'] // Expand to get product metadata
          });
          if (sessionLineItems.data && sessionLineItems.data.length > 0) {
            lineItems = sessionLineItems.data;
            console.log(`✅ [CHECKOUT] Retrieved ${lineItems.length} line items from Stripe session`);
          }
        } catch (stripeError) {
          console.error('⚠️  [CHECKOUT] Could not fetch line items from Stripe:', stripeError.message);
        }
      }

      if (!lineItems || lineItems.length === 0) {
        throw new NotFoundError('No order items found - cart is empty and Stripe session has no line items');
      }

      // Step 5: Build order items
      console.log('📦 [CHECKOUT] Building order items...');
      const orderItems = [];
      let subtotal = 0;

      for (const lineItem of lineItems) {
        // Handle both cart items format and Stripe line items format
        // For Stripe line items: extract MongoDB productId from product metadata
        let productId = lineItem.productId;
        
        // If this is a Stripe line item (has price.product), try to get MongoDB productId from metadata
        if (!productId && lineItem.price?.product) {
          if (typeof lineItem.price.product === 'object' && lineItem.price.product.metadata?.productId) {
            productId = lineItem.price.product.metadata.productId;
            console.log(`✅ [CHECKOUT] Extracted MongoDB productId from Stripe product metadata: ${productId}`);
          } else {
            // Fallback to Stripe product ID if metadata not available
            productId = lineItem.price.product.id || lineItem.price.product;
          }
        }
        
        const quantity = lineItem.quantity;
        const priceData = lineItem.price?.unit_amount_decimal || lineItem.price;
        
        // Skip if we can't determine product ID
        if (!productId && !lineItem.description) {
          console.log('⚠️  [CHECKOUT] Skipping line item with no product ID or description:', lineItem);
          continue;
        }

        // Handle case where productId is stored as full object instead of just ID
        let actualProductId = productId;
        
        // If productId is an object with _id, extract the ID
        if (typeof actualProductId === 'object' && actualProductId._id) {
          console.log('⚠️  [CHECKOUT] Item has full product object, extracting ID');
          actualProductId = actualProductId._id;
        }

        console.log(`📝 [CHECKOUT] Processing item:`, {
          productId: actualProductId,
          quantity: quantity,
          priceData: priceData
        });

        try {
          let product;
          if (actualProductId) {
            product = await productService.getProductById(actualProductId);
          } else {
            // Fallback: create basic product info from line item data
            console.log('⚠️  [CHECKOUT] No product ID found, using line item metadata');
            product = {
              _id: 'unknown-' + Date.now(),
              name: lineItem.description || 'Unknown Product',
              price: priceData ? parseFloat(priceData) / 100 : 0
            };
          }

          if (!product) {
            // Product may have been deleted, but we proceed with order
            console.warn(`⚠️  [CHECKOUT] Product ${actualProductId} not found in database`);
            continue;
          }

          const itemSubtotal = product.price * quantity;
          subtotal += itemSubtotal;

          orderItems.push({
            productId: product._id,
            productName: product.name,
            sku: product.sku || '',
            variant: lineItem.variant || '' ,
            quantity: quantity,
            price: product.price,
            subtotal: itemSubtotal,
          });
        } catch (productError) {
          console.error(`❌ [CHECKOUT] Error fetching product ${actualProductId}:`, {
            errorName: productError.name,
            errorMessage: productError.message,
            productId: actualProductId
          });
          // Skip this product but continue processing others
          continue;
        }
      }

      if (orderItems.length === 0) {
        throw new ValidationError('No valid items found to create order');
      }

      console.log(`✅ [CHECKOUT] Order items prepared (${orderItems.length} items, $${subtotal}`);

      // Step 6a: Parse shipping address from metadata
      console.log('📦 [CHECKOUT] Extracting shipping address from metadata...');
      let shippingAddress = null;
      if (shippingAddressStr) {
        try {
          shippingAddress = JSON.parse(shippingAddressStr);
          console.log('✅ [CHECKOUT] Shipping address parsed:', { 
            street: shippingAddress.street, 
            city: shippingAddress.city,
            state: shippingAddress.state 
          });
        } catch (parseError) {
          console.warn('⚠️  [CHECKOUT] Could not parse shipping address from metadata:', parseError.message);
          // Continue without shipping - don't fail the whole operation
        }
      } else {
        console.warn('⚠️  [CHECKOUT] No shipping address found in session metadata');
      }

      // Step 6b: Create order document
      console.log('💾 [CHECKOUT] Creating order in database...');
      const order = await Order.createFromCheckout(
        userId,
        orderItems,
        {
          stripeSessionId,
          paymentIntentId,
          chargeId,
        },
        affiliateId || null,
        shippingAddress // PASS SHIPPING ADDRESS to order creation
      );

      console.log('✅ [CHECKOUT] Order created successfully:', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.orderStatus,
        paymentStatus: order.paymentStatus
      });

      // Step 7: Clear user's cart
      try {
        console.log('🧹 [CHECKOUT] Clearing user cart...');
        await cartService.clearCart(userId);
        console.log('✅ [CHECKOUT] Cart cleared');
      } catch (cartError) {
        console.error(`❌ [CHECKOUT] Error clearing cart for user ${userId}:`, cartError.message);
        // Don't fail the entire operation if cart clearing fails
      }

      // Step 8: Trigger affiliate commission if applicable
      if (order.affiliateDetails && order.affiliateDetails.affiliateId) {
        try {
          console.log('💰 [CHECKOUT] Triggering affiliate commission...');
          await this._triggerAffiliateCommission(order, visitorId);
          console.log('✅ [CHECKOUT] Affiliate commission triggered');
        } catch (commissionError) {
          console.error(`❌ [CHECKOUT] Error triggering affiliate commission for order ${order._id}:`, commissionError.message);
          // Don't fail the operation if commission trigger fails
        }
      }

      console.log('🎉 [CHECKOUT] Payment success handling completed!');
      return order;
    } catch (error) {
      console.error('❌ [CHECKOUT] Payment success handling failed:', {
        name: error.name,
        message: error.message,
        userId: session.metadata?.userId
      });
      throw new ServerError(`Failed to handle payment success: ${error.message}`);
    }
  }

  /**
   * Retrieve a Stripe checkout session
   *
   * @param {string} sessionId - Stripe session ID
   * @returns {Promise<Object>} Stripe session object
   */
  async getCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      return session;
    } catch (error) {
      throw new ServerError(`Failed to retrieve checkout session: ${error.message}`);
    }
  }

  /**
   * Cancel a checkout session (if needed for refunds, etc.)
   *
   * @param {string} sessionId - Stripe session ID
   * @returns {Promise<Object>} Updated session
   */
  async expireCheckoutSession(sessionId) {
    try {
      const session = await stripe.checkout.sessions.expire(sessionId);
      return session;
    } catch (error) {
      throw new ServerError(`Failed to expire checkout session: ${error.message}`);
    }
  }

  /**
   * Process refund for an order
   *
   * @param {string} paymentIntentId - Stripe payment intent ID
   * @param {number} amount - Amount to refund (in cents), undefined = full refund
   * @param {string} reason - Refund reason
   * @returns {Promise<Object>} Refund object
   */
  async refundPayment(paymentIntentId, amount = undefined, reason = 'requested_by_customer') {
    try {
      const refund = await stripe.refunds.create({
        payment_intent: paymentIntentId,
        ...(amount && { amount }),
        reason,
      });

      return refund;
    } catch (error) {
      throw new ServerError(`Failed to process refund: ${error.message}`);
    }
  }

  /**
   * Trigger affiliate commission calculation and recording
   *
   * This method is called after an order is created with an affiliate
   * It integrates with:
   * 1. Referral tracking system (attribution)
   * 2. Commission engine (commission creation)
   * 3. Affiliate balance updates
   *
   * @private
   * @param {Object} order - Order document with affiliateDetails
   * @param {string} visitorId - Visitor ID from referral cookie (optional)
   * @returns {Promise<void>}
   */
  async _triggerAffiliateCommission(order, visitorId = null) {
    try {
      // Update affiliate details status to 'calculated'
      order.affiliateDetails.status = 'calculated';
      await order.save();

      // Step 1: Trigger referral tracking attribution
      // This updates the referral click record to mark it as converted
      if (order.affiliateDetails && order.affiliateDetails.affiliateId) {
        try {
          const referralTrackingService = require('./referralTrackingService');
          const orderService = require('./orderService');

          // Call order service to attribute order to affiliate in referral system
          const attributionResult = await orderService.attributeOrderToAffiliate(
            order._id.toString(),
            order.affiliateDetails.affiliateId.toString(),
            order.affiliateDetails.commissionRate * 100, // Convert to percentage
            visitorId // Pass visitorId for matching referral clicks
          );

          if (attributionResult.success || attributionResult.attributionSuccess) {
            console.log(`✅ Referral attribution triggered for order ${order._id}`);
          } else {
            console.warn(
              `⚠️  Referral attribution incomplete for order ${order._id}: ${attributionResult.reason}`
            );
          }
        } catch (attributionError) {
          console.warn(
            `⚠️  Error attributing order to referral system: ${attributionError.message}`
          );
          // Don't fail the operation if referral attribution fails
        }
      }

      // Step 2: Create commission from order payment
      // This is the main integration point for the Commission Engine
      if (order.affiliateDetails && order.affiliateDetails.affiliateId) {
        try {
          const commissionService = require('./commissionService');

          // Create commission automatically when order is paid
          const commission = await commissionService.createCommissionFromOrder(
            order,
            { skipFraudCheck: false } // Perform full fraud detection
          );

          console.log(`✅ Commission created: ${commission._id} for order ${order._id}`);
          console.log(`   Affiliate: ${order.affiliateDetails.affiliateId}`);
          console.log(`   Amount: $${commission.calculation.amount}`);
          console.log(`   Status: ${commission.status}`);

          // Update order with commission reference
          order.commissionId = commission._id;
          await order.save();
        } catch (commissionError) {
          console.error(
            `❌ Error creating commission for order ${order._id}:`,
            commissionError.message
          );
          // Log the error but don't fail the payment processing
          // Admin can manually create commission if needed
        }
      }

      // Step 3: Queue notifications and analytics (optional future integration)
      // TODO: Queue email notifications to affiliate
      // TODO: Send analytics event (commission.created)
      // TODO: Update affiliate dashboard widgets

      console.log(`✅ Affiliate commission workflow completed for order ${order._id}`);
    } catch (error) {
      throw new Error(`Failed to trigger affiliate commission: ${error.message}`);
    }
  }

  /**
   * Format variant details as human-readable string for Stripe
   *
   * @private
   * @param {Object} variant - Variant object { color: 'Red', edition: 'Deluxe' }
   * @returns {string} Formatted description
   */
  _formatVariantDescription(variant) {
    if (!variant || Object.keys(variant).length === 0) {
      return '';
    }

    return Object.entries(variant)
      .map(([key, value]) => `${key}: ${value}`)
      .join(', ');
  }

  /**
   * Get order by Stripe session ID
   * Used by success page to display order details
   *
   * @param {String} stripeSessionId - Stripe checkout session ID
   * @returns {Promise<Object>} Order document with all details
   */
  async getOrderBySessionId(stripeSessionId) {
    try {
      console.log('🔍 [CHECKOUT-SERVICE] Finding order by session ID:', stripeSessionId);
      
      const order = await Order.findOne({
        'paymentDetails.stripeSessionId': stripeSessionId,
      }).populate('userId', 'name email').lean();

      if (!order) {
        console.log('⚠️  [CHECKOUT-SERVICE] No order found for session:', stripeSessionId);
        return null;
      }

      console.log('✅ [CHECKOUT-SERVICE] Order found:', {
        orderId: order._id,
        orderNumber: order.orderNumber,
        itemCount: order.items.length,
      });

      return order;
    } catch (error) {
      console.error('❌ [CHECKOUT-SERVICE] Error fetching order by session:', {
        error: error.message,
        stripeSessionId,
      });
      throw new ServerError(`Failed to fetch order: ${error.message}`);
    }
  }
}

module.exports = new CheckoutService();
