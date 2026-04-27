/**
 * Main Express Server
 * Initializes and configures the Express application
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const cookieParser = require('cookie-parser');
require('dotenv').config();

// Import configuration
const config = require('./config/environment');
const connectDB = require('./config/database');

// Import middleware
const { errorHandler, notFoundHandler } = require('./middlewares/errorHandler');
const { requestMetadata } = require('./middlewares/requestMetadata');
const {
  queryParamAffiliateMiddleware,
  referralCookieMiddleware,
  referralFraudDetectionMiddleware,
  affiliateAttributionMiddleware,
} = require('./middlewares/referralMiddleware');

// Import security middleware and services
const {
  globalLimiter,
  authLimiter,
  passwordResetLimiter,
  affiliateSignupLimiter,
  checkoutLimiter,
  adminLimiter,
  checkIpBlocked,
  validateRequestBody,
  validateRegistration,
  checkAccountLockout,
} = require('./middlewares/securityMiddleware');
const {
  checkOrderFraud,
  checkReferralPatterns,
  checkCommissionFraud,
  validatePayoutSecurity,
  preventSelfReferral,
  validateReferralClick,
  addSecurityContext,
  enforceFraudVerification,
} = require('./middlewares/fraudDetectionMiddleware');
const securityLogger = require('./security/securityLogger');

// Import routes
const authRoutes = require('./routes/authRoutes');
const productRoutes = require('./routes/productRoutes');
const categoryRoutes = require('./routes/categoryRoutes');
const cartRoutes = require('./routes/cartRoutes');
const checkoutRoutes = require('./routes/checkoutRoutes');
const orderRoutes = require('./routes/orderRoutes');
const affiliateRoutes = require('./routes/affiliateRoutes');
const referralTrackingRoutes = require('./routes/referralTrackingRoutes');
const commissionRoutes = require('./routes/commissionRoutes');
const payoutRoutes = require('./routes/payoutRoutes');
const influencerRoutes = require('./routes/influencerRoutes');
const sponsorshipRoutes = require('./routes/sponsorshipRoutes');
const adminRoutes = require('./routes/adminRoutes');
const fileUploadRoutes = require('./routes/fileUploadRoutes');
const raffleRoutes = require('./routes/raffleRoutes');
const followerRoutes = require('./routes/followerRoutes');
const retailLocationRoutes = require('./routes/retailLocationRoutes');
const couponRoutes = require('./routes/couponRoutes');

// Import webhook handler
const { verifyWebhookSignature } = require('./webhooks/stripeWebhook');
const checkoutController = require('./controllers/checkoutController');

// Initialize Express app
const app = express();

/**
 * Connect to MongoDB
 */
connectDB();

/**
 * Trust proxy (for deployments behind reverse proxy)
 */
app.set('trust proxy', 1);

/**
 * Security Middleware
 */

// Helmet - Set security HTTP headers
app.use(helmet());

// CORS - Enable cross-origin requests
app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (e.g., mobile apps or curl requests)
      if (!origin) {
        return callback(null, true);
      }

      // Check if origin is in allowed list
      if (config.CORS_ORIGIN.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error('CORS not allowed'));
      }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

// Add security context to all requests
app.use(addSecurityContext);

// Check IP blocks (blocks suspicious IPs)
app.use(checkIpBlocked);

// Global rate limiting - Protect from brute force attacks
app.use(globalLimiter);

/**
 * Stripe Webhook Middleware
 * MUST come BEFORE body parsing to capture raw request body
 * Mount this middleware to handle raw body for webhook endpoints
 */

// Webhook verification middleware
const webhookMiddleware = [
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    console.log('📨 [WEBHOOK] Incoming webhook request to', req.path);
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      console.error('❌ [WEBHOOK] Missing Stripe signature header');
      return res.status(400).json({
        success: false,
        error: 'Stripe signature header missing',
      });
    }

    try {
      // Verify signature and attach verified event to request
      req.event = verifyWebhookSignature(req.body, signature);
      console.log('✅ [WEBHOOK] Signature verified, event type:', req.event?.type);
      next();
    } catch (error) {
      console.error('❌ [WEBHOOK] Webhook signature verification failed:', error.message);
      // Return 401 to Stripe to stop retries (signature is invalid)
      return res.status(401).json({
        success: false,
        error: 'Webhook signature verification failed',
      });
    }
  }
];

// Register webhook middleware for BOTH paths:
// 1. /api/checkout/webhook (without v1 prefix - for backward compatibility)
// 2. /api/v1/checkout/webhook (with v1 prefix - following API pattern)
app.use('/api/checkout/webhook', webhookMiddleware);
app.use(`${config.API_PREFIX}/checkout/webhook`, webhookMiddleware);

/**
 * Stripe Webhook Handlers - POST endpoints for both paths
 * These handlers receive requests that have already been verified by the middleware above
 */

// Handler for /api/checkout/webhook (backward compatibility)
app.post('/api/checkout/webhook', (req, res, next) => {
  console.log('📍 [HANDLER] Webhook handler invoked at /api/checkout/webhook');
  checkoutController.handleStripeWebhook(req, res, next);
});

// Handler for /api/v1/checkout/webhook (new path with version prefix)
app.post(`${config.API_PREFIX}/checkout/webhook`, (req, res, next) => {
  console.log('📍 [HANDLER] Webhook handler invoked at /api/v1/checkout/webhook');
  checkoutController.handleStripeWebhook(req, res, next);
});

/**
 * Sponsorship Webhook Middleware
 * MUST come BEFORE body parsing to capture raw request body for Stripe signature verification
 */

// Sponsorship webhook verification middleware
const sponsorshipWebhookMiddleware = [
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    console.log('📨 [SPONSORSHIP WEBHOOK] Incoming webhook request to', req.path);
    // Store raw body for Stripe signature verification
    req.rawBody = req.body;
    next();
  }
];

// Register sponsorship webhook middleware for BOTH paths
// 1. Legacy path (without v1): /api/sponsorship/webhook
app.use('/api/sponsorship/webhook', sponsorshipWebhookMiddleware);
// 2. Versioned path (with v1): /api/v1/sponsorship/webhook
app.use(`${config.API_PREFIX}/sponsorship/webhook`, sponsorshipWebhookMiddleware);

/**
 * Sponsorship Webhook Handlers
 */
const sponsorshipController = require('./controllers/sponsorshipController');

// Handler for /api/sponsorship/webhook (Stripe webhook endpoint)
app.post('/api/sponsorship/webhook', (req, res, next) => {
  console.log('📍 [HANDLER] Sponsorship webhook handler invoked at /api/sponsorship/webhook');
  sponsorshipController.handlePaymentWebhook(req, res, next);
});

// Handler for /api/v1/sponsorship/webhook (versioned endpoint for consistency)
app.post(`${config.API_PREFIX}/sponsorship/webhook`, (req, res, next) => {
  console.log('📍 [HANDLER] Sponsorship webhook handler invoked at /api/v1/sponsorship/webhook');
  sponsorshipController.handlePaymentWebhook(req, res, next);
});

/**
 * Raffle Webhook Middleware with Signature Verification
 * MUST come BEFORE body parsing to capture raw request body for Stripe signature verification
 */

// Raffle webhook verification middleware (using RAFFLE_WEBHOOK_SECRET)
const raffleWebhookMiddleware = [
  express.raw({ type: 'application/json' }),
  (req, res, next) => {
    console.log('📨 [RAFFLE WEBHOOK] Incoming webhook request to', req.path);
    
    // Get Stripe signature from headers
    const signature = req.headers['stripe-signature'];

    if (!signature) {
      console.error('❌ [RAFFLE WEBHOOK] Missing Stripe signature header');
      return res.status(400).json({
        error: 'Missing Stripe signature header',
      });
    }

    // Verify webhook signature using RAFFLE specific secret
    try {
      req.event = verifyWebhookSignature(req.body, signature, process.env.STRIPE_WEBHOOK_SECRET_RAFFLE);
      console.log('✅ [RAFFLE WEBHOOK] Signature verified, event type:', req.event?.type);
      next();
    } catch (error) {
      console.error('❌ [RAFFLE WEBHOOK] Webhook signature verification failed:', error.message);
      return res.status(400).json({
        error: 'Webhook signature verification failed',
        message: error.message,
      });
    }
  }
];

// Register raffle webhook middleware for BOTH paths
// 1. Legacy path (without v1): /api/raffle/webhook  
app.use('/api/raffle/webhook', raffleWebhookMiddleware);
// 2. Versioned path (with v1): /api/v1/raffle/webhook
app.use(`${config.API_PREFIX}/raffle/webhook`, raffleWebhookMiddleware);

/**
 * Raffle Webhook Handlers
 */
const raffleController = require('./controllers/raffleController');

// Handler for /api/raffle/webhook (Stripe webhook endpoint)
app.post('/api/raffle/webhook', (req, res, next) => {
  console.log('📍 [HANDLER] Raffle webhook handler invoked at /api/raffle/webhook');
  raffleController.handleStripeWebhook(req, res, next);
});

// Handler for /api/v1/raffle/webhook (versioned endpoint for consistency)
app.post(`${config.API_PREFIX}/raffle/webhook`, (req, res, next) => {
  console.log('📍 [HANDLER] Raffle webhook handler invoked at /api/v1/raffle/webhook');
  raffleController.handleStripeWebhook(req, res, next);
});

/**
 * Body Parser Middleware
 * Skip multipart/form-data to allow multer to handle file uploads exclusively
 */

// Parse application/json
app.use(express.json({ limit: '10mb' }));

// Parse application/x-www-form-urlencoded
// Conditionally skip for multipart/form-data (multer will handle these)
app.use((req, res, next) => {
  // Skip urlencoded parsing for multipart - let multer handle it
  if (req.is('multipart/form-data')) {
    return next();
  }
  express.urlencoded({ limit: '10mb', extended: true })(req, res, next);
});

// Validate request body size and format (AFTER parsing)
app.use(validateRequestBody);

// Parse cookies
app.use(cookieParser());

/**
 * Request Metadata Extraction Middleware
 * Extracts IP address, device type, and session ID
 */
app.use(requestMetadata);

/**
 * Referral Tracking Middleware
 * Automatically extracts referral cookies and detects fraud patterns
 */
app.use(queryParamAffiliateMiddleware); // Process ?ref= query parameter FIRST
app.use(referralCookieMiddleware);
app.use(referralFraudDetectionMiddleware);
app.use(affiliateAttributionMiddleware);

/**
 * Data Sanitization Middleware
 */

// Sanitize data against NoSQL injection
app.use(mongoSanitize());

/**
 * Request Logging Middleware (Development only)
 */
if (config.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`📨 ${req.method} ${req.path}`);
    next();
  });
}

/**
 * Health Check Route
 */
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: config.NODE_ENV,
  });
});

/**
 * API Routes
 */

// Authentication routes
// Rate limiting applied per-route (not globally) to allow different limits for sensitive vs. session endpoints
app.use(`${config.API_PREFIX}/auth`, authRoutes);

// Category routes (Public: get all/by ID, Admin: create/update/delete)
app.use(`${config.API_PREFIX}/categories`, categoryRoutes);

// Product routes
app.use(`${config.API_PREFIX}/products`, productRoutes);

// File Upload routes
app.use(`${config.API_PREFIX}/upload`, fileUploadRoutes);

// Cart routes
app.use(`${config.API_PREFIX}/cart`, cartRoutes);

// Checkout routes
// Apply checkout-specific rate limiting and fraud detection
// EXCLUDE webhook from rate limiting (Stripe webhooks shouldn't be rate limited)
app.use(
  `${config.API_PREFIX}/checkout`,
  (req, res, next) => {
    // Skip rate limiting and fraud check for webhook
    if (req.path === '/webhook') {
      return next();
    }
    checkoutLimiter(req, res, next);
  },
  (req, res, next) => {
    // Skip fraud check for webhook
    if (req.path === '/webhook') {
      return next();
    }
    checkOrderFraud(req, res, next);
  },
  checkoutRoutes
);

// Order routes
// Apply fraud detection to orders
app.use(`${config.API_PREFIX}/orders`, checkOrderFraud, orderRoutes);

// Referral Tracking routes
// Public: GET /api/ref/:affiliateCode for click tracking
// Protected: GET /api/tracking/* for analytics and statistics
app.use(`${config.API_PREFIX}/ref`, referralTrackingRoutes); // Public referral endpoint

// Affiliate routes (public tracking + authenticated dashboard + admin)
// IMPORTANT: Register affiliateRoutes BEFORE referralTrackingRoutes at /tracking path
// This ensures specific routes like /click take precedence over parameterized /:affiliateCode
app.use(`${config.API_PREFIX}/tracking`, affiliateRoutes);
app.use(`${config.API_PREFIX}/affiliate`, affiliateSignupLimiter, affiliateRoutes);
app.use(`${config.API_PREFIX}/leaderboard`, affiliateRoutes);

// Now register referralTrackingRoutes with fraud checks
// Its /:affiliateCode route will only match if affiliateRoutes didn't handle it
app.use(
  `${config.API_PREFIX}/tracking`,
  checkReferralPatterns,
  referralTrackingRoutes
); // Protected tracking analytics with fraud checks
app.use(`${config.API_PREFIX}/leaderboard`, affiliateRoutes);

// Commission routes (affiliate earnings)
// Apply fraud detection for commissions
app.use(
  `${config.API_PREFIX}/affiliate`,
  preventSelfReferral,
  checkCommissionFraud,
  commissionRoutes
);

// Payout routes (affiliate withdrawal requests + admin approval/processing)
// Apply fraud detection and payout validation
app.use(
  `${config.API_PREFIX}/payouts`,
  validatePayoutSecurity,
  enforceFraudVerification,
  payoutRoutes
);

// Influencer Routes (influencer application + product fulfillment)
app.use(`${config.API_PREFIX}/influencer`, influencerRoutes);

// Sponsorship Routes (sponsorship tiers + purchases + payment handling)
app.use(`${config.API_PREFIX}/sponsorship`, sponsorshipRoutes);

// Raffle Routes (raffle entries, winner selection, admin management)
app.use(`${config.API_PREFIX}/raffle`, raffleRoutes);

// Follower Routes (follower subscriptions, live counter, admin stats)
app.use(`${config.API_PREFIX}/followers`, followerRoutes);

// Retail Location Routes (store locator, retail partnerships, public locations)
app.use(`${config.API_PREFIX}/retail-locations`, retailLocationRoutes);

// Coupon Routes (admin CRUD + customer validation)
app.use(`${config.API_PREFIX}/coupons`, couponRoutes);

// Admin Dashboard routes (analytics, monitoring, reporting, commission operations)
// Apply strict rate limiting for admin endpoints
app.use(`${config.API_PREFIX}/admin`, adminLimiter, adminRoutes);

/**
 * 404 Handler
 */
app.use(notFoundHandler);

/**
 * Global Error Handling Middleware
 * Should be the last piece of middleware
 */
app.use(errorHandler);

/**
 * Start Server
 */
const PORT = config.PORT;

const server = app.listen(PORT, () => {
  console.log(`
╔══════════════════════════════════════════════════╗
║     Spherekings Marketplace Backend              ║
║         🚀 Server is running 🚀                  ║
╠══════════════════════════════════════════════════╣
║  Port: ${PORT}                                    ${' '.repeat(30)}║
║  Environment: ${config.NODE_ENV}                             ${' '.repeat(16)}║
║  API: ${config.API_PREFIX}                                  ${' '.repeat(32)}║
║  MongoDB: Connected                   ${' '.repeat(20)}║
║  Security: Active (Fraud Detection)    ${' '.repeat(14)}║
║  Logging: Security Events Enabled      ${' '.repeat(14)}║
╚══════════════════════════════════════════════════╝
  `);

  // Log server startup
  securityLogger.logAuthSuccess(
    'system',
    'server@localhost',
    '127.0.0.1'
  );

  console.log('✅ Security logging initialized');
  console.log('✅ Fraud detection service active');
  console.log('✅ Rate limiters configured');
});

/**
 * Handle Unhandled Promise Rejections
 */
process.on('unhandledRejection', (err) => {
  console.error('❌ Unhandled Rejection:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

/**
 * Handle Uncaught Exceptions
 */
process.on('uncaughtException', (err) => {
  console.error('❌ Uncaught Exception:', err);
  // Close server & exit process
  server.close(() => process.exit(1));
});

/**
 * Graceful Shutdown
 */
process.on('SIGTERM', () => {
  console.log('📌 SIGTERM received. Shutting down gracefully...');

  // Export security logs before shutdown
  try {
    const logPath = securityLogger.exportLogs('json');
    console.log(`✅ Security logs exported to ${logPath}`);
  } catch (error) {
    console.error('⚠️  Could not export security logs:', error.message);
  }

  // Log shutdown event
  try {
    securityLogger.logAuthSuccess(
      'system',
      'server@localhost',
      '127.0.0.1'
    );
  } catch (error) {
    console.error('⚠️  Could not log shutdown:', error.message);
  }

  server.close(() => {
    console.log('✅ Server closed');
    process.exit(0);
  });
});

module.exports = app;
