/**
 * ============================================================================
 * DATA SEEDING SCRIPT - Populate Database with Test Data
 * ============================================================================
 *
 * Creates realistic test data for the affiliate system:
 * - Test affiliate users
 * - Referral tracking records
 * - Test orders with affiliate attribution
 * - Commission records
 * - Payout records
 *
 * Usage: node seed-test-data.js
 *
 * ============================================================================
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const path = require('path');

// Load environment variables
require('dotenv').config();

// Database connection
const DB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/spherekings';

// Import models
const User = require('./src/models/User');
const Affiliate = require('./src/models/Affiliate');
const ReferralTracking = require('./src/models/ReferralTracking');
const Order = require('./src/models/Order');
const Commission = require('./src/models/Commission');
const Payout = require('./src/models/Payout');
const Product = require('./src/models/Product');

// Logging utilities
const log = {
  section: (title) => console.log(`\n${'='.repeat(70)}\n${title}\n${'='.repeat(70)}`),
  success: (msg) => console.log(`✅ ${msg}`),
  info: (msg) => console.log(`ℹ️  ${msg}`),
  error: (msg) => console.error(`❌ ${msg}`)
};

/**
 * Connect to MongoDB
 */
async function connectDB() {
  try {
    log.info('Connecting to MongoDB...');
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    log.success(`Connected to ${DB_URI}`);
  } catch (error) {
    log.error(`MongoDB connection failed: ${error.message}`);
    throw error;
  }
}

/**
 * Create test customer user (different from affiliate)
 */
async function createTestCustomerUser() {
  try {
    const email = `customer-test-${Date.now()}@test.com`;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return user;
    }

    log.info(`  Creating customer user: ${email}`);
    
    // Create customer user with plain password
    user = await User.create({
      email,
      password: 'CustomerPassword123!',
      name: 'Test Customer',
      role: 'customer',
      isEmailVerified: true
    });

    return user;
  } catch (error) {
    log.error(`Failed to create customer user: ${error.message}`);
    throw error;
  }
}

/**
 * Create test affiliate user
 */
async function createTestAffiliateUser() {
  log.section('Creating Test Affiliate User');

  try {
    const email = `affiliate-seed-${Date.now()}@test.com`;
    
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      log.info(`User already exists: ${email}`);
      return user;
    }

    log.info(`Creating new user: ${email}`);
    
    // Pass plain password and let the pre-save hook hash it
    // DO NOT pre-hash the password

    // Create user
    user = await User.create({
      email,
      password: 'TestPassword123!', // Plain password - let pre-save hook hash it
      name: 'Test Affiliate User',
      status: 'active',
      isEmailVerified: true,
      emailVerifiedAt: new Date()
    });

    log.success(`User created: ${user._id}`);
    return user;
  } catch (error) {
    log.error(`Failed to create user: ${error.message}`);
    throw error;
  }
}

/**
 * Register user as affiliate
 */
async function registerAffiliate(user) {
  log.section('Registering Affiliate');

  try {
    // Check if already affiliate
    let affiliate = await Affiliate.findOne({ userId: user._id });
    if (affiliate) {
      log.info(`User is already affiliate: ${affiliate.affiliateCode}`);
      return affiliate;
    }

    log.info(`Registering ${user.name} as affiliate...`);

    // Generate unique code
    const code = `AFF${Date.now().toString().slice(-8).toUpperCase()}`;

    // Create affiliate account
    affiliate = await Affiliate.create({
      userId: user._id,
      email: user.email,
      affiliateCode: code,
      status: 'active',
      tier: 'standard',
      commissionRate: 0.15, // 15% commission
      minPayoutThreshold: 10.00,
      payoutSettings: {
        method: 'bank_transfer',
        bankDetails: {
          accountHolder: user.name,
          accountNumber: '1234567890',
          routingNumber: '021000021'
        }
      }
    });

    // Update user's affiliateStatus
    await User.updateOne(
      { _id: user._id },
      { affiliateStatus: 'active' }
    );

    log.success(`Affiliate registered: ${affiliate.affiliateCode}`);
    return affiliate;
  } catch (error) {
    log.error(`Failed to register affiliate: ${error.message}`);
    throw error;
  }
}

/**
 * Create referral tracking records
 */
async function createReferralTrackingRecords(affiliate, count = 5) {
  log.section(`Creating ${count} Referral Tracking Records`);

  try {
    const records = [];
    const sources = ['organic', 'email', 'social', 'paid_ad', 'direct'];
    const devices = ['desktop', 'mobile', 'tablet'];

    // Map source types to valid referralSource enum values
    const referralSources = ['direct', 'email', 'facebook', 'twitter', 'instagram', 'reddit', 'blog', 'other'];
    
    for (let i = 0; i < count; i++) {
      const record = await ReferralTracking.create({
        affiliateId: affiliate._id,
        affiliateCode: affiliate.affiliateCode,
        ipAddress: `192.168.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        referralSource: referralSources[Math.floor(Math.random() * referralSources.length)],
        device: devices[Math.floor(Math.random() * devices.length)],
        utmCampaign: `test-campaign-${i}`,
        utmSource: sources[Math.floor(Math.random() * sources.length)],
        utmMedium: 'test_medium',
        converted: Math.random() > 0.7, // 30% conversion rate
        conversionDate: Math.random() > 0.7 ? new Date() : null,
        metadata: {
          referralTokenId: `token_${Date.now()}_${i}`,
          customData: {}
        }
      });

      records.push(record);
      log.info(`  Created referral #${i + 1} - Source: ${record.referralSource}, Device: ${record.device}`);
    }

    log.success(`Created ${records.length} referral tracking records`);
    return records;
  } catch (error) {
    log.error(`Failed to create referral tracking records: ${error.message}`);
    throw error;
  }
}

/**
 * Create test orders with affiliate attribution
 */
async function createTestOrders(affiliate, customerUser, count = 3) {
  log.section(`Creating ${count} Test Orders`);

  try {
    // Get available products
    const products = await Product.find({ status: 'active' }).limit(3);
    
    if (products.length === 0) {
      log.error('No products found - cannot create orders');
      return [];
    }

    const orders = [];

    for (let i = 0; i < count; i++) {
      const product = products[i % products.length];
      const quantity = Math.floor(Math.random() * 3) + 1;
      const itemTotal = product.price * quantity;
      const tax = itemTotal * 0.1;
      const total = itemTotal + tax;

      const order = await Order.create({
        userId: customerUser._id,
        orderNumber: `ORD-${Date.now()}-${i}`,
        items: [
          {
            productId: product._id,
            productName: product.name,
            quantity,
            price: product.price,
            subtotal: itemTotal
          }
        ],
        subtotal: itemTotal,
        tax,
        total,
        orderStatus: 'delivered',
        paymentStatus: 'paid',
        paymentMethod: 'stripe',
        affiliateDetails: {
          affiliateId: affiliate._id,
          affiliateCode: affiliate.affiliateCode,
          commissionRate: affiliate.commissionRate
        },
        stripeDetails: {
          sessionId: `cs_test_${Date.now()}_${i}`,
          paymentIntentId: `pi_test_${Date.now()}_${i}`,
          transactionId: `txn_${Date.now()}_${i}`
        }
      });

      orders.push(order);
      log.info(`  Order #${i + 1}: ${order.orderNumber} ($${total.toFixed(2)}) - Product: ${product.name}`);
    }

    log.success(`Created ${orders.length} test orders`);
    return orders;
  } catch (error) {
    log.error(`Failed to create orders: ${error.message}`);
    throw error;
  }
}

/**
 * Create commission records
 */
async function createCommissions(affiliate, orders, user) {
  log.section('Creating Commission Records');

  try {
    const commissions = [];

    for (let i = 0; i < orders.length; i++) {
      const order = orders[i];
      const commissionAmount = order.total * affiliate.commissionRate;

      // Create commission with varying status
      const statuses = ['pending', 'pending', 'approved', 'paid'];
      const status = statuses[i % statuses.length];

      const commission = await Commission.create({
        affiliateId: affiliate._id,
        orderId: order._id,
        orderNumber: order.orderNumber,
        buyerId: order.userId,
        calculation: {
          orderTotal: order.total,
          rate: affiliate.commissionRate,
          amount: commissionAmount,
          tier: 'standard',
          calculatedAt: new Date(),
          notes: `Auto-calculated 15% commission`
        },
        status,
        statusHistory: [
          {
            status: 'pending',
            changedAt: order.createdAt,
            changedBy: null,
            reason: 'Order completed'
          },
          ...(status !== 'pending' ? [{
            status: 'approved',
            changedAt: new Date(Date.now() - Math.random() * 86400000),
            changedBy: null,
            reason: 'Approved by admin'
          }] : []),
          ...(status === 'paid' ? [{
            status: 'paid',
            changedAt: new Date(Date.now() - Math.random() * 86400000),
            changedBy: null,
            reason: 'Payment processed'
          }] : [])
        ]
      });

      commissions.push(commission);
      log.info(`  Commission #${i + 1}: $${commissionAmount.toFixed(2)} - Status: ${status}`);
    }

    log.success(`Created ${commissions.length} commission records`);
    return commissions;
  } catch (error) {
    log.error(`Failed to create commissions: ${error.message}`);
    throw error;
  }
}

/**
 * Create payout records
 */
async function createPayouts(affiliate, commissions) {
  log.section('Creating Payout Records');

  try {
    const payouts = [];

    // Calculate total approved commissions
    const approvedAmount = commissions
      .filter(c => c.status === 'approved' || c.status === 'paid')
      .reduce((sum, c) => sum + (c.calculation?.amount || 0), 0);

    if (approvedAmount > 0) {
      const statuses = ['pending', 'pending', 'approved', 'processing', 'completed'];
      const status = statuses[Math.floor(Math.random() * statuses.length)];

      // Use insertOne with validation disabled to bypass async validator issues
      const payoutData = {
        affiliateId: affiliate._id,
        amount: Math.min(approvedAmount, 100), // Cap at $100 for testing
        status,
        method: 'bank_transfer',
        beneficiaryDetails: {
          name: `${affiliate._id}`,
          accountNumber: '1234567890',
          routingNumber: '021000021'
        },
        notes: `Test payout - Status: ${status}`,
        approvalDate: status !== 'pending' ? new Date(Date.now() - Math.random() * 86400000) : null,
        processedDate: status === 'processing' || status === 'completed' ? new Date(Date.now() - Math.random() * 86400000) : null,
        completedDate: status === 'completed' ? new Date(Date.now() - Math.random() * 86400000) : null,
        statusHistory: [
          {
            status: 'pending',
            changedAt: new Date(Date.now() - Math.random() * 86400000),
            changedBy: null,
            reason: 'Payout requested'
          },
          ...(status !== 'pending' ? [{
            status: 'approved',
            changedAt: new Date(Date.now() - (Math.random() * 86400000)),
            changedBy: null,
            reason: 'Approved by admin'
          }] : [])
        ],
        createdAt: new Date(),
        updatedAt: new Date()
      };

      // Insert directly into collection to bypass validation issues
      const result = await Payout.collection.insertOne(payoutData);
      const payout = await Payout.findById(result.insertedId);
      if (payout) {
        payouts.push(payout);
        log.success(`Created payout: $${payout.amount.toFixed(2)} - Status: ${status}`);
      }
    } else {
      log.info('No approved commissions - skipping payout creation');
    }

    return payouts;
  } catch (error) {
    log.error(`Failed to create payouts: ${error.message}`);
    throw error;
  }
}

/**
 * Main seeding function
 */
async function seedDatabase() {
  try {
    log.section('AFFILIATE SYSTEM DATA SEEDING');

    // Connect to database
    await connectDB();

    // Create test data
    const affiliateUser = await createTestAffiliateUser();
    const customerUser = await createTestCustomerUser();
    const affiliate = await registerAffiliate(affiliateUser);
    const referrals = await createReferralTrackingRecords(affiliate, 10);
    const orders = await createTestOrders(affiliate, customerUser, 5);
    const commissions = await createCommissions(affiliate, orders, customerUser);
    const payouts = await createPayouts(affiliate, commissions);

    // Generate summary
    log.section('DATA SEEDING COMPLETE');
    console.log(`
✅ SEEDING SUMMARY:
  • Affiliate User: ${affiliateUser._id} (${affiliateUser.email})
  • Customer User: ${customerUser._id} (${customerUser.email})
  • Affiliate Code: ${affiliate.affiliateCode}
  • Referral Clicks: ${referrals.length}
  • Test Orders: ${orders.length}
  • Commissions: ${commissions.length}
  • Payouts: ${payouts.length}

📊 COMMISSION BREAKDOWN:
  • Total Commission Amount: $${commissions.reduce((sum, c) => sum + (c.calculation?.amount || 0), 0).toFixed(2)}
  • Pending: ${commissions.filter(c => c.status === 'pending').length}
  • Approved: ${commissions.filter(c => c.status === 'approved').length}
  • Paid: ${commissions.filter(c => c.status === 'paid').length}

🎯 NEXT STEPS:
  1. Open http://localhost:3000/affiliate/dashboard
  2. Login with: ${affiliateUser.email} / TestPassword123!
  3. Verify dashboard displays:
     ✓ Clicks: ${referrals.length}
     ✓ Conversions: ${referrals.filter(r => r.converted).length}
     ✓ Pending Commissions: ${commissions.filter(c => c.status === 'pending').length}
     ✓ Total Earnings: $${orders.reduce((sum, o) => sum + o.total, 0).toFixed(2)}
    `);

    process.exit(0);
  } catch (error) {
    log.error('Data seeding failed');
    console.error(error);
    process.exit(1);
  }
}

// Run seeding
seedDatabase();
