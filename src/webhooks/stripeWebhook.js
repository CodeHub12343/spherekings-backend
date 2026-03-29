/**
 * Stripe Webhook Handler
 * Verifies Stripe webhook signatures and handles payment events
 */

const { stripe, STRIPE_WEBHOOK_SECRET } = require('../config/stripe');

/**
 * Parse and verify Stripe webhook event
 *
 * Security: Always verify webhook signature before processing
 * This prevents unauthorized requests from triggering order creation
 *
 * @param {string} body - Raw request body (Buffer or string)
 * @param {string} signature - Stripe signature header (stripe-signature)
 * @param {string} secret - Optional custom webhook secret (for raffle/sponsorship webhooks)
 * @returns {Promise<Object>} Verified Stripe event object
 * @throws {Error} If signature verification fails
 */
function verifyWebhookSignature(body, signature, secret) {
  // Use provided secret or fall back to default STRIPE_WEBHOOK_SECRET
  const webhookSecret = secret || STRIPE_WEBHOOK_SECRET;

  if (!webhookSecret) {
    throw new Error('Webhook secret not configured - cannot verify webhooks');
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    return event;
  } catch (error) {
    throw new Error(`Webhook signature verification failed: ${error.message}`);
  }
}

/**
 * Handle Stripe webhook events
 *
 * Supported events:
 * - checkout.session.completed: Payment completed, create order
 * - payment_intent.succeeded: Payment succeeded (backup)
 * - charge.refunded: Refund processed
 * - charge.dispute.created: Chargeback/dispute filed
 *
 * @param {Object} event - Verified Stripe webhook event
 * @param {Object} handlers - Event handlers { 'checkout.session.completed': asyncFn }
 * @returns {Promise<Object>} Handler result or null if no handler
 */
async function handleStripeEvent(event, handlers = {}) {
  const eventType = event.type;
  const eventData = event.data.object;

  console.log(`Processing Stripe webhook event: ${eventType} (ID: ${event.id})`);

  // Look for handler for this event type
  const handler = handlers[eventType];

  if (typeof handler === 'function') {
    try {
      const result = await handler(event);
      console.log(`Successfully processed ${eventType} event (ID: ${event.id})`);
      return result;
    } catch (error) {
      console.error(
        `Error handling ${eventType} event (ID: ${event.id}):`,
        error.message
      );
      throw error;
    }
  }

  // No handler found for this event type
  console.log(`No handler found for event type: ${eventType}`);
  return null;
}

/**
 * Standard handler for checkout.session.completed event
 *
 * This is the primary event for order creation
 * Called when customer completes payment on Stripe hosted checkout page
 *
 * @param {Object} event - Stripe event with checkout session data
 * @param {Object} checkoutService - Checkout service instance
 * @returns {Promise<Object>} Created order object
 */
async function handleCheckoutSessionCompleted(event, checkoutService) {
  const session = event.data.object;

  // Validate session data
  if (session.payment_status !== 'paid') {
    throw new Error(
      `Checkout session not paid. Status: ${session.payment_status}`
    );
  }

  if (!session.metadata?.userId) {
    throw new Error('No userId in session metadata');
  }

  // Delegate to checkout service for order creation
  const order = await checkoutService.handlePaymentSuccess(
    event,
    // Services are passed as dependency injection
    // This will be bound in the route handler
  );

  return order;
}

/**
 * Handle charge.refunded event
 *
 * Updates order to reflect refund status
 *
 * @param {Object} event - Stripe refund event
 * @param {Object} orderModel - Order model
 * @returns {Promise<void>}
 */
async function handleChargeRefunded(event, orderModel) {
  const charge = event.data.object;
  const refund = charge.refunds.data[0]; // Get first (or only) refund

  if (!refund) {
    throw new Error('No refund data found in charge');
  }

  // Find order by charge ID and update refund details
  const order = await orderModel.findOneAndUpdate(
    { 'paymentDetails.chargeId': charge.id },
    {
      paymentStatus: 'refunded',
      orderStatus: 'refunded',
      'refundDetails.refundIntentId': refund.id,
      'refundDetails.refundAmount': refund.amount,
      'refundDetails.refundedAt': new Date(refund.created * 1000),
      'refundDetails.reason': refund.reason,
    },
    { new: true }
  );

  if (!order) {
    throw new Error(`No order found for charge ${charge.id}`);
  }

  console.log(`Order ${order._id} marked as refunded`);
  return order;
}

/**
 * Handle charge.dispute.created event
 *
 * Logs dispute/chargeback for fraud investigation
 *
 * @param {Object} event - Stripe dispute event
 * @param {Object} orderModel - Order model
 * @returns {Promise<void>}
 */
async function handleChargeDispute(event, orderModel) {
  const dispute = event.data.object;

  // Find order by charge ID
  const order = await orderModel.findOne({
    'paymentDetails.chargeId': dispute.charge,
  });

  if (order) {
    // Mark order with dispute status
    order.orderStatus = 'disputed';
    await order.save();
    console.log(`Order ${order._id} marked as disputed`);
  }

  // Log dispute for investigation
  console.warn(`Chargeback/Dispute filed: ${dispute.id}`, {
    orderId: order?._id,
    chargeId: dispute.charge,
    amount: dispute.amount,
    reason: dispute.reason,
    status: dispute.status,
  });

  return order;
}

/**
 * Create default webhook event handlers
 *
 * @param {Object} checkoutService - Checkout service with payment handlers
 * @param {Object} orderModel - Order model for database operations
 * @returns {Object} Map of event types to handler functions
 */
function createDefaultHandlers(checkoutService, orderModel) {
  return {
    'checkout.session.completed': async (event) => {
      const handlers = {
        checkoutService,
        cartService: require('./cartService'),
        productService: require('./productService'),
      };
      return handleCheckoutSessionCompleted(event, checkoutService);
    },
    'charge.refunded': (event) => handleChargeRefunded(event, orderModel),
    'charge.dispute.created': (event) => handleChargeDispute(event, orderModel),
  };
}

module.exports = {
  verifyWebhookSignature,
  handleStripeEvent,
  handleCheckoutSessionCompleted,
  handleChargeRefunded,
  handleChargeDispute,
  createDefaultHandlers,
};
