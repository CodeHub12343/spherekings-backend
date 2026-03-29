/**
 * Stripe Configuration Module
 * Initializes Stripe SDK with API keys from environment variables
 */

const Stripe = require('stripe');

// Validate that required environment variables are set
if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('STRIPE_SECRET_KEY environment variable is not set');
}

// Trim whitespace from the key to prevent authentication issues
const STRIPE_SECRET_KEY_RAW = process.env.STRIPE_SECRET_KEY.trim();

if (!STRIPE_SECRET_KEY_RAW.startsWith('sk_')) {
  throw new Error(
    'STRIPE_SECRET_KEY appears to be invalid - should start with "sk_". ' +
    'Check that the key is properly configured in .env file and is NOT wrapped in quotes.'
  );
}

/**
 * Initialize Stripe instance with secret key
 * @type {Stripe}
 */
const stripe = new Stripe(STRIPE_SECRET_KEY_RAW, {
  apiVersion: process.env.STRIPE_API_VERSION || '2024-01-01', // Use API version from env or default to latest stable
  timeout: 10000, // 10 second timeout
  maxNetworkRetries: 2, // Retry failed requests up to 2 times
});

/**
 * Stripe webhook signing secret for verifying webhook authenticity
 * Required to be set in environment
 * @type {string}
 */
const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET;

if (!STRIPE_WEBHOOK_SECRET) {
  console.warn('STRIPE_WEBHOOK_SECRET environment variable is not set - webhooks will not work');
}

module.exports = {
  stripe,
  STRIPE_WEBHOOK_SECRET,
};
